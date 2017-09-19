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
  MotionProperty,
  createProperty,
} from '../observables';

import {
  Direction,
} from '../Direction';

import {
  State,
} from '../State';

import {
  ThresholdSide,
} from '../ThresholdSide';

import {
  ObservableWithMotionOperators,
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

const onlyDispatchWithUpstream = {
  onlyDispatchWithUpstream: true,
};

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
  readonly iconSpring: NumericSpring = new NumericSpring();
  readonly backgroundSpring: NumericSpring = new NumericSpring();

  // Should `State` be called `MotionState` so `state$` can be reserved for interactions?
  readonly swipeState$: MotionProperty<SwipeState> = createProperty({ initialValue: SwipeState.NONE });
  readonly direction$: ObservableWithMotionOperators<Direction>;

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

    // How far the user must drag to trigger the action.
    tossable.resistanceBasis = 200;

    // How far the background peeks through at max resistance.
    const PEEK_DISTANCE = 48;

    const DISABLED_RESISTANCE_FACTOR = 0;
    const ICON_SPRING_INITIAL_VALUE = 0.67;

    const draggable = tossable.draggable;
    const spring = tossable.spring;
    const draggedX$ = tossable.draggedLocation$.pluck('x');
    const willChange$ = tossable.state$.rewrite({
      [State.AT_REST]: '',
      [State.ACTIVE]: 'transform',
    });

    // How close the spring should be to the pointer before the interaction
    // becomes directly manipulable
    spring.threshold = 1;

    this.iconSpring.initialValue = ICON_SPRING_INITIAL_VALUE;

    const tossableIsAtRest$ = tossable.state$.isAnyOf([ State.AT_REST ]);
    when(tossableIsAtRest$).rewriteTo(
      tossable.resistanceBasis$.normalizedBy(PEEK_DISTANCE),
      onlyDispatchWithUpstream
    ).subscribe(tossable.resistanceFactor$);

    this.direction$ = draggedX$.threshold(0).isAnyOf([ ThresholdSide.ABOVE ]).rewrite({
      [true]: Direction.RIGHT,
      [false]: Direction.LEFT
    });

    // I originally tried to introduce a `resistanceProgress$` to `Tossable`,
    // but that breaks down when `resistanceFactor` changes.  Because we want
    // the item to stay anchored to the pointer after the threshold has been
    // crossed, we must change `resistanceFactor`, which would throw off
    // `resistanceProgress`. Thus, we independently calculate the threshold
    // here.

    const isThresholdMet$ = draggedX$.distanceFrom(0).threshold(PEEK_DISTANCE).isAnyOf([ThresholdSide.ABOVE, ThresholdSide.WITHIN]);
    const whenThresholdCrossed$ = when(isThresholdMet$.dedupe());
    const whenThresholdFirstCrossed$ = when(tossable.resistanceFactor$.dedupe().isAnyOf([ DISABLED_RESISTANCE_FACTOR ]));

    whenThresholdFirstCrossed$.subscribe(spring.enabled$);
    when(spring.state$.isAnyOf([ State.AT_REST ])).rewriteTo(false).subscribe(spring.enabled$);

    whenThresholdCrossed$.rewriteTo(DISABLED_RESISTANCE_FACTOR).subscribe(tossable.resistanceFactor$);
    whenThresholdCrossed$.rewriteTo(draggedX$, onlyDispatchWithUpstream).subscribe(spring.initialValue$);
    draggedX$.subscribe(spring.destination$);

    isThresholdMet$.rewrite({
      [true]: 1,
      [false]: 0,
    }).subscribe(this.backgroundSpring.destination$);

    isThresholdMet$.rewrite({
      [true]: 1,
      [false]: ICON_SPRING_INITIAL_VALUE,
    }).subscribe(this.iconSpring.destination$);

    // This needs to also take velocity into consideration; right now, it only
    // cares about final position.
    when(draggable.state$.isAnyOf([ State.AT_REST ])).rewriteTo(
      isThresholdMet$.rewrite({
        [true]: this.direction$,
        [false]: SwipeState.NONE,
      }),
       onlyDispatchWithUpstream
    ).subscribe(this.swipeState$);

    this.swipeState$.rewrite({
      [SwipeState.NONE]: 0,
      [SwipeState.LEFT]: width$.scaledBy(-1),
      [SwipeState.RIGHT]: width$,
    }).subscribe(spring.destination$);

    this.styleStreamsByTargetName = {
      item: {
        translate$: tossable.value$,
        willChange$,
      },
      icon: {
        scale$: this.iconSpring.value$,
        willChange$,
      },
      background: {
        scale$: this.backgroundSpring.value$,
        willChange$,
      },
    };
  }
}
export default Swipeable;
