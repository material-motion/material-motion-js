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
  anyOf,
  when,
} from '../aggregators';

import {
  MemorylessMotionSubject,
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

  /**
   * This is the point from which all other resistance calculations are
   * measured.
   */
  readonly resistanceOrigin$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  get resistanceOrigin(): Point2D {
    return this.resistanceOrigin$.read();
  }

  set resistanceOrigin(value: Point2D) {
    this.resistanceOrigin$.write(value);
  }

  /**
   * This is the distance from the origin that an item can be freely dragged
   * without encountering resistance.
   */
  readonly radiusUntilResistance$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get radiusUntilResistance(): number {
    return this.radiusUntilResistance$.read();
  }

  set radiusUntilResistance(value: number) {
    this.radiusUntilResistance$.write(value);
  }

  /**
   * For carousels or swipeable lists, this is the width of one item.
   *
   * To apply resistance, the calculation needs to determine the amount of
   * progress through a drag.  `resistanceBasis` is the denominator in this
   * calculation. For instance, if a drag is 20px beyond `radiusUntilResistance`
   * and `resistanceBasis` is 50, the drag progress used by the resistance
   * calculation is 40%.
   *
   * Note: a drag cannot move farther than `resistanceBasis` beyond
   * `radiusUntilResistance`.
   */
  readonly resistanceBasis$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceBasis(): number {
    return this.resistanceBasis$.read();
  }

  set resistanceBasis(value: number) {
    this.resistanceBasis$.write(value);
  }

  /**
   * This value determines how far beyond `radiusUntilResistance` a drag is
   * limited to.
   *
   * It works in conjunction with `resistanceBasis`.  If `resistanceBasis` is 50
   * and `resistanceFactor` is 5, the drag is limited to 10px (basis / factor)
   * beyond `radiusUntilResistance`.
   */
  readonly resistanceFactor$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get resistanceFactor(): number {
    return this.resistanceFactor$.read();
  }

  set resistanceFactor(value: number) {
    this.resistanceFactor$.write(value);
  }

  readonly value$: ObservableWithMotionOperators<Point2D>;
  readonly velocity$: ObservableWithMotionOperators<Point2D>;
  readonly draggedLocation$: ObservableWithMotionOperators<Point2D>;

  readonly draggable: Draggable;
  readonly spring: NumericSpring;
  readonly location$: MotionProperty<Point2D>;

  constructor({ draggable, spring, location$ }: TossableArgs) {
    this.draggable = draggable;
    this.spring = spring;
    this.location$ = location$;

    const dragIsAtRest$ = draggable.state$.rewrite({
      [State.AT_REST]: true,
      [State.ACTIVE]: false,
    }).dedupe();

    // Since drag starts at rest, this calls the observer immediately, which
    // sets velocity to undefined.  If `ignoreUntil` took a reactive pulse, this
    // could be whenDragIsAtRest$.ignoreUntil(whenDragIsActive$).  Since it's
    // not, velocity manually starts with {0, 0}.
    const whenDragIsAtRest$ = when(dragIsAtRest$);
    const whenDragIsActive$ = when(dragIsAtRest$.inverted());

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
    location$.pluck(firstAxis)._debounce(whenDragIsAtRest$).subscribe(spring.initialValue$);

    const locationOnDown$ = location$._debounce(whenDragIsActive$);

    this.draggedLocation$ = draggable.value$.addedBy(locationOnDown$, { onlyDispatchWithUpstream: true })._reactiveMap(
      (
        location: Point2D,
        resistanceOrigin: Point2D,
        radiusUntilResistance: number,
        resistanceBasis: number,
        resistanceFactor: number,
      ) => {
        if (!resistanceFactor) {
          return location;
        }

        // We apply resistance radially, leading to all the trig below.  In most
        // cases, the draggable element will be axis locked, which means there's
        // room to short circuit the logic here with simpler solutions when we
        // know either x or y is constant.
        const locationFromOrigin: Point2D = {
          x: location.x - resistanceOrigin.x,
          y: location.y - resistanceOrigin.y,
        };

        const overflowRadius = Math.sqrt(locationFromOrigin.x ** 2 + locationFromOrigin.y ** 2) - radiusUntilResistance;
        const resistanceProgress = Math.max(0, Math.min(1, overflowRadius / resistanceBasis));

        if (overflowRadius < 0) {
          return location;
        }

        const radiusWithResistance = resistanceBasis / resistanceFactor * Math.sin(resistanceProgress * Math.PI / 2) + radiusUntilResistance;
        const angle = Math.atan2(locationFromOrigin.y, locationFromOrigin.x);

        return {
          x: resistanceOrigin.x + radiusWithResistance * Math.cos(angle),
          y: resistanceOrigin.y + radiusWithResistance * Math.sin(angle),
        };
      },
      [
        this.resistanceOrigin$,
        this.radiusUntilResistance$,
        this.resistanceBasis$,
        this.resistanceFactor$,
      ],
      {
        onlyDispatchWithUpstream: true,
      },
    );

    // maybe should be named velocityWhen?
    this.velocity$ = this.draggedLocation$.startWith({ x: 0, y: 0 }).velocity(whenDragIsAtRest$);
    this.velocity$.pluck(firstAxis).subscribe(spring.initialVelocity$);

    dragIsAtRest$.subscribe(spring.enabled$);

    anyOf([
      spring.state$.isAnyOf([ State.ACTIVE ]),
      draggable.state$.isAnyOf([ State.ACTIVE ])
    ]).rewrite({
      [true]: State.ACTIVE,
      [false]: State.AT_REST,
    }).dedupe().subscribe(this.state$);

    this.value$ = spring.enabled$.rewrite(
      {
        [true]: spring.value$._map(
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
        ),
        [false]: this.draggedLocation$
      },
      {
        dispatchOnKeyChange: false,
      },
    )._debounce();
  }
}
export default Tossable;

export type ApplyLinearResistanceToTossableArgs = {
  tossable: Tossable,
  min$: ObservableWithMotionOperators<number>,
  max$: ObservableWithMotionOperators<number>,
  axis$: ObservableWithMotionOperators<number>,
  basis$: ObservableWithMotionOperators<number>,
  factor$: ObservableWithMotionOperators<number>,
};
export function applyLinearResistanceToTossable({
  tossable,
  min$,
  max$,
  axis$,
  basis$,
  factor$,
}: ApplyLinearResistanceToTossableArgs) {
  basis$.subscribe(tossable.resistanceBasis$);
  factor$.subscribe(tossable.resistanceFactor$);
  min$._reactiveMap(
    (min: number, max: number) => Math.abs(max - min) / 2,
    [ max$, ]
  ).subscribe(tossable.radiusUntilResistance$);
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
    [ min$, max$, ],
  ).subscribe(tossable.resistanceOrigin$);
}
