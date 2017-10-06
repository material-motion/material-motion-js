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
  Axis,
  State,
} from '../enums';

import {
  anyOf,
  not,
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
  TranslateStyleStreams,
} from '../types';

import {
  subscribe,
} from '../subscribe';

import {
  Draggable,
} from './Draggable';

import {
  Point2DSpring,
} from './Point2DSpring';

export type TossableArgs = {
  draggable: Draggable,
  spring: Point2DSpring,
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

  readonly location$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  readonly velocity$: ObservableWithMotionOperators<Point2D>;
  readonly draggedLocation$: ObservableWithMotionOperators<Point2D>;

  readonly draggable: Draggable;
  readonly spring: Point2DSpring;

  readonly styleStreams: TranslateStyleStreams;

  constructor({ draggable, spring }: TossableArgs) {
    this.draggable = draggable;
    this.spring = spring;

    const dragIsAtRest$ = draggable.state$.rewrite<boolean, boolean>({
      [State.AT_REST]: true,
      [State.ACTIVE]: false,
    }).dedupe();

    // Since drag starts at rest, this calls the observer immediately, which
    // sets velocity to undefined.  If `ignoreUntil` took a reactive pulse, this
    // could be whenDragIsAtRest$.ignoreUntil(whenDragIsActive$).  Since it's
    // not, velocity manually starts with {0, 0}.
    const whenDragIsAtRest$ = when(dragIsAtRest$);
    const whenDragIsActive$ = when(not(dragIsAtRest$));

    // This block needs to come before the one that sets spring enabled to
    // ensure the spring initializes with the correct values; otherwise, it will
    // start from 0
    subscribe({
      sink: spring.initialValue$,
      source: this.location$._debounce(whenDragIsAtRest$)
    });

    const locationOnDown$ = this.location$._debounce(whenDragIsActive$);

    this.draggedLocation$ = draggable.value$.addedBy<Point2D>(locationOnDown$, { onlyDispatchWithUpstream: true })._reactiveMap({
      transform: ({
        upstream: location,
        resistanceOrigin,
        radiusUntilResistance,
        resistanceBasis,
        resistanceFactor,
      }) => {
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
      inputs: {
        resistanceOrigin: this.resistanceOrigin$,
        radiusUntilResistance: this.radiusUntilResistance$,
        resistanceBasis: this.resistanceBasis$,
        resistanceFactor: this.resistanceFactor$,
      },
      onlyDispatchWithUpstream: true,
    });

    // maybe should be named velocityWhen?
    this.velocity$ = this.draggedLocation$.startWith({ x: 0, y: 0 }).velocity(whenDragIsAtRest$);
    subscribe({
      sink: spring.initialVelocity$,
      source: this.velocity$,
    });

    subscribe({
      sink: spring.enabled$,
      source: dragIsAtRest$,
    });

    subscribe({
      sink: this.state$,
      source: anyOf([
        spring.state$.isAnyOf([ State.ACTIVE ]),
        draggable.state$.isAnyOf([ State.ACTIVE ])
      ]).rewrite({
        true: State.ACTIVE,
        false: State.AT_REST,
      }).dedupe(),
    });

    subscribe({
      sink: this.location$,
      source: spring.enabled$.rewrite<Point2D, ObservableWithMotionOperators<Point2D>>(
        {
          true: spring.value$,
          false: this.draggedLocation$
        },
        {
          dispatchOnKeyChange: false,
        },
      )._debounce(),
    });

    this.styleStreams = {
      translate$: this.location$,

      willChange$: this.state$.rewrite<string, string>({
        [State.ACTIVE]: 'transform',
        [State.AT_REST]: '',
      }),
    };
  }
}
export default Tossable;

export type ApplyLinearResistanceToTossableArgs = {
  tossable: Tossable,
  min$: ObservableWithMotionOperators<number>,
  max$: ObservableWithMotionOperators<number>,
  axis$: ObservableWithMotionOperators<Axis>,
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
  subscribe({
    sink: tossable.resistanceBasis$,
    source: basis$,
  });

  subscribe({
    sink: tossable.resistanceFactor$,
    source: factor$,
  });

  subscribe({
    sink: tossable.radiusUntilResistance$,
    source: min$._reactiveMap({
      transform: ({ upstream: min, max }) => Math.abs(max - min) / 2,
      inputs: {
        max: max$,
      }
    }),
  });

  subscribe({
    sink: tossable.resistanceOrigin$,
    source: axis$._reactiveMap({
      transform: ({ upstream: axis, min, max }) => {
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
      inputs: {
        min: min$,
        max: max$,
      },
    }),
  });
}
