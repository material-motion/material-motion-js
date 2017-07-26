/** @license
 *  Copyright 2016 - present The Material Motion Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

import {
  State,
} from '../State';

import {
  MotionProperty,
  createProperty,
} from '../observables/';

import {
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  Axis,
} from '../Axis';

import {
  Draggable,
} from './Draggable';

import {
  NumericSpring,
} from './NumericSpring';

export type TossableArgs = {
  draggable: Draggable,
  spring: NumericSpring,
  location$: MotionProperty<Point2D>,
};

export class Tossable {
  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  readonly resistanceAmount$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceAmount(): number {
    return this.resistanceAmount$.read();
  }

  set resistanceAmount(value: number) {
    this.resistanceAmount$.write(value);
  }

  readonly resistanceOrigin$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  get resistanceOrigin(): Point2D {
    return this.resistanceOrigin$.read();
  }

  set resistanceOrigin(value: Point2D) {
    this.resistanceOrigin$.write(value);
  }

  readonly resistanceRadius$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceRadius(): number {
    return this.resistanceRadius$.read();
  }

  set resistanceRadius(value: number) {
    this.resistanceRadius$.write(value);
  }

  readonly resistancelessRadius$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistancelessRadius(): number {
    return this.resistancelessRadius$.read();
  }

  set resistancelessRadius(value: number) {
    this.resistancelessRadius$.write(value);
  }

  readonly value$: ObservableWithMotionOperators<Point2D>;
  readonly velocity$: ObservableWithMotionOperators<Point2D>;
  readonly draggedLocation$: ObservableWithMotionOperators<Point2D>;

  constructor({ draggable, spring, location$ }: TossableArgs) {
    const dragAtRest$ = draggable.state$.rewrite({
      [State.AT_REST]: true,
      [State.ACTIVE]: false,
    }).dedupe();

    // Perhaps add isAnyOf and whenAnyOf operators…
    const dragActivePulse$ = dragAtRest$._filter(
      (isAtRest: boolean) => !isAtRest
    );

    // Since drag starts at rest, this calls the observer immediately, which
    // sets velocity to undefined.  If `ignoreUntil` took a reactive pulse, this
    // could be dragAtRest$._filter().ignoreUntil(dragActivePulse$).  Since it's
    // not, velocity manually starts with {0, 0}.
    const dragAtRestPulse$ = dragAtRest$._filter(
      (isAtRest: boolean) => isAtRest
    );

    const firstAxis = draggable.axis$.read();
    draggable.axis$.subscribe(
      axis => {
        if (axis !== firstAxis) {
          throw new Error(`Tossable doesn't yet support changing axis`);
        }
      }
    );

    // This block needs to come before the one that sets spring enabled to
    // ensure the spring initializes with the correct values; otherwise, it will
    // start from 0
    location$.pluck(firstAxis)._debounce(dragAtRestPulse$).subscribe(spring.initialValue$);

    // offsetBy will add the upstream value to the offset whenever the offset
    // changes.  Therefore, we need to debounce locationOnDown$ to make it wait
    // for draggable.value$ to dispatch.  Otherwise, the ending value of the
    // last drag will be added to the start value of this one.
    //
    // Perhaps offsetBy (and _reactiveMap/_reactiveNextOperator) should accept a
    // flag that denotes whether they should wait for both to change before
    // dispatching.  That would simplify this, and enable spring.enabled to be
    // set on down, rather than drag.  (That, in turn, would be more correct -
    // it would enable a user to catch a springing object without moving the
    // pointer.)
    const locationOnDown$ = location$._debounce(dragActivePulse$);

    this.draggedLocation$ = draggable.value$.offsetBy(locationOnDown$._debounce(draggable.value$))._reactiveMap(
      (
        location: Point2D,
        resistanceAmount: number,
        resistanceOrigin: Point2D,
        resistanceRadius: number,
        resistancelessRadius: number
      ) => {
        if (!resistanceAmount) {
          return location;
        }

        // We apply resistance radially, leading to all the trig below.  In most
        // cases, the draggable element is probably axis locked, which means
        // this code could potentially be optimized for those scenarios.
        const locationFromOrigin: Point2D = {
          x: location.x - resistanceOrigin.x,
          y: location.y - resistanceOrigin.y,
        };

        let overflowRadius = Math.sqrt(locationFromOrigin.x ** 2 + locationFromOrigin.y ** 2) - resistancelessRadius;

        if (overflowRadius < 0) {
          return location;
        }

        const radiusWithResistance = resistanceRadius / resistanceAmount * Math.sin(overflowRadius / resistanceRadius * Math.PI / 2) + resistancelessRadius;
        const angle = Math.atan2(locationFromOrigin.y, locationFromOrigin.x);

        return {
          x: resistanceOrigin.x + radiusWithResistance * Math.cos(angle),
          y: resistanceOrigin.y + radiusWithResistance * Math.sin(angle),
        };
      },
      this.resistanceAmount$,
      this.resistanceOrigin$,
      this.resistanceRadius$,
      this.resistancelessRadius$,
    );

    // maybe should be named velocityWhen?
    this.velocity$ = this.draggedLocation$.startWith({ x: 0, y: 0 }).velocity(dragAtRestPulse$);
    this.velocity$.pluck(firstAxis).subscribe(spring.initialVelocity$);

    dragAtRest$.subscribe(spring.enabled$);

    // Since the spring's state is triggered by draggable's we need to wait to
    // see if the spring is going to be become active before declaring ourselves
    // at rest.  There's probably a cleaner way to do this, but it works for
    // now.
    dragActivePulse$.rewriteTo(State.ACTIVE).merge(spring.state$).dedupe().subscribe(this.state$);
    dragAtRestPulse$.subscribe(
      () => {
        requestAnimationFrame(
          () => {
            if (spring.state !== State.ACTIVE && this.state === State.ACTIVE) {
              this.state$.write(State.AT_REST);
            }
          }
        );
      }
    );

    this.value$ = spring.value$._map(
      // This _map() call is a quick hack to make up for the lack of a Point2D
      // spring.  When a Point2D spring is implemented, this should go away, and
      // `spring` should be of that type.
      (value: number) => {
        switch (firstAxis) {
          case Axis.X:
            return {
              x: value,
              y: 0,
            };

          case Axis.Y:
            return {
              x: 0,
              y: value,
            };

          default:
            throw new Error(`Please set draggable.axis to "x" or "y" before using Tossable`);
        }
      }
    ).merge(this.draggedLocation$)._debounce();
  }
}
export default Tossable;

export type ApplyLinearResistanceToTossableArgs = {
  tossable: Tossable,
  min$: ObservableWithMotionOperators<number>,
  max$: ObservableWithMotionOperators<number>,
  amount$: ObservableWithMotionOperators<number>,
  axis$: ObservableWithMotionOperators<number>,
  length$: ObservableWithMotionOperators<number>,
};
export function applyLinearResistanceToTossable({
  tossable,
  min$,
  max$,
  amount$,
  axis$,
  length$,
}: ApplyLinearResistanceToTossableArgs) {
  length$.subscribe(tossable.resistanceRadius$);
  amount$.subscribe(tossable.resistanceAmount$);
  min$._reactiveMap(
    (min: number, max: number) => Math.abs(max - min) / 2,
    max$
  ).subscribe(tossable.resistancelessRadius$);
  axis$._reactiveMap(
    (axis: Axis, min: number, max: number) => {
      const linearCenter = min + (max - min) / 2;

      if (axis === Axis.X) {
        return {
          x: linearCenter,
          y: 0,
        };
      } else if (axis === Axis.Y) {
        return {
          x: 0,
          y: linearCenter,
        };
      } else {
        console.warn(`Cannot apply linear resistance if axis isn't locked`);
      }
    },
    min$,
    max$,
  ).subscribe(tossable.resistanceOrigin$);
}
