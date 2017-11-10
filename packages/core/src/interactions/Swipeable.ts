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
  allOf,
  when,
} from '../aggregators';

import {
  combineLatest,
} from '../combineLatest';

import {
  subscribe,
} from '../subscribe';

import {
  Axis,
  Direction,
  State,
  ThresholdRegion,
} from '../enums';

import {
  MotionProperty,
  createProperty,
} from '../observables';

import {
  ObservableWithMotionOperators,
  MaybeReactive,
  Point2D,
  ScaleStyleStreams,
  TranslateStyleStreams,
} from '../types';

import {
  NumericSpring,
} from './NumericSpring';

import {
  Tossable,
} from './Tossable';

export enum SwipeState {
  NONE = 'none',
  LEFT = 'left',
  RIGHT = 'right',
};

export type SwipeableArgs = {
  tossable: Tossable,
  width$: ObservableWithMotionOperators<number>,
};

export class Swipeable {
  static VISUAL_THRESHOLD = 72;

  readonly iconSpring: NumericSpring = new NumericSpring();
  readonly backgroundSpring: NumericSpring = new NumericSpring();

  // Should `State` be called `MotionState` so `state$` can be reserved for interactions?
  readonly swipeState$: MotionProperty<SwipeState> = createProperty({ initialValue: SwipeState.NONE });
  readonly direction$: ObservableWithMotionOperators<Direction>;
  readonly isThresholdMet$: ObservableWithMotionOperators<boolean>;
  readonly whenThresholdCrossed$: ObservableWithMotionOperators<boolean>;
  readonly whenThresholdFirstCrossed$: ObservableWithMotionOperators<boolean>;

  /**
   * If an item is swiped past the threshold, it will animate by its own width
   * + destinationMargin, in the direction of the swipe.
   *
   * This ensures that decoration that might overflow an item's bounds (like a
   * shadow) isn't visible when it's been swiped away.
   */
  readonly destinationMargin$: MotionProperty<number> = createProperty({
    initialValue: 0,
  });

  get destinationMargin(): number {
    return this.destinationMargin$.read();
  }

  set destinationMargin(value: number) {
    this.destinationMargin$.write(value);
  }

  // There should probably be an Interaction interface that requires this of all
  // interactions
  readonly state$: ObservableWithMotionOperators<string>;

  readonly tossable: Tossable;
  readonly width$: ObservableWithMotionOperators<number>;

  readonly styleStreamsByTargetName: {
    item: TranslateStyleStreams,
    icon: ScaleStyleStreams,
    background: ScaleStyleStreams,
  };

  constructor({ tossable, width$ }: SwipeableArgs) {
    this.tossable = tossable;
    this.width$ = width$;

    this.state$ = this.tossable.state$;

    tossable.draggable.axis = Axis.X;

    const ICON_SPRING_INITIAL_VALUE = 0.67;

    const draggable = tossable.draggable;
    const spring = tossable.spring;
    const draggedX$ = tossable.draggedLocation$.pluck({ path: 'x' });

    this.iconSpring.initialValue = ICON_SPRING_INITIAL_VALUE;

    this.direction$ = draggedX$.threshold(0).isAnyOf([ ThresholdRegion.ABOVE ]).rewrite({
      mapping: {
        true: Direction.RIGHT,
        false: Direction.LEFT,
      }
    });

    this.isThresholdMet$ = draggedX$.distanceFrom(0).threshold(Swipeable.VISUAL_THRESHOLD).isAnyOf([
      ThresholdRegion.ABOVE,
      ThresholdRegion.WITHIN,
    ]);
    this.whenThresholdCrossed$ = when(this.isThresholdMet$.dedupe());

    subscribe({
      sink: this.backgroundSpring.destination$,
      source: this.isThresholdMet$.rewrite({
        mapping: {
          true: 1,
          false: 0,
        }
      }),
    });

    subscribe({
      sink: this.iconSpring.destination$,
      source: this.isThresholdMet$.rewrite({
        mapping: {
          true: 1,
          false: ICON_SPRING_INITIAL_VALUE,
        }
      }),
    });

    // This needs to also take velocity into consideration; right now, it only
    // cares about final position.
    subscribe({
      sink: this.swipeState$,
      source: when(draggable.state$.isAnyOf([ State.AT_REST ])).rewriteTo({
        value$: this.isThresholdMet$.rewrite({
          mapping: {
            true: this.direction$,
            false: SwipeState.NONE,
          },
        }),
        onlyEmitWithUpstream: true,
      }),
    });

    const destinationDistance$ = width$.addedBy(this.destinationMargin$);

    subscribe({
      sink: spring.destination$,
      source: combineLatest<Point2D, MaybeReactive<Point2D>>({
        x: this.swipeState$.rewrite({
          mapping: {
            [SwipeState.NONE]: 0,
            [SwipeState.LEFT]: destinationDistance$.multipliedBy(-1),
            [SwipeState.RIGHT]: destinationDistance$,
          }
        }),
        y: 0,
      })
    });

    this.styleStreamsByTargetName = {
      item: tossable.styleStreams,
      icon: {
        scale$: this.iconSpring.value$,
        willChange$: tossable.styleStreams.willChange$,
      },
      background: {
        scale$: this.backgroundSpring.value$,
        willChange$: tossable.styleStreams.willChange$,
      },
    };
  }
}
export default Swipeable;
