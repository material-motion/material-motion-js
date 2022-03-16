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
  combineLatest,
} from '../combineLatest';

import {
  MotionProperty,
  createProperty,
} from '../observables';

import {
  State,
} from '../enums/State';

import {
  anyOf,
} from '../aggregators';

import {
  subscribe,
} from '../subscribe';

import {
  Dict,
  MaybeReactive,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  DEFAULT_DAMPING,
  DEFAULT_STIFFNESS,
  DEFAULT_THRESHOLD,
  NumericDecayer,
} from './NumericDecayer';

/**
 * `Point2DDecayer` is similar to `NumericDecayer`, but accepts and emits
 * `Point2D`s for its configuration values.  Internally, it is composed of two
 * independent `NumericDecayer`s.
 *
 * Because each internal decayer emits independently, `value$` will emit
 * intermediate values (e.g. changing `initialValue` from `{ x: 0, y: 0 }` to
 * `{ x: 5, y: 4 }` will cause 2 emissions, one when `x` changes and one when
 * `y` changes.)  This may be corrected in a future release, when emits could be
 * batched into one per frame.
 */
export class Point2DDecayer {
  readonly xDecayer = new NumericDecayer();
  readonly yDecayer = new NumericDecayer();

  readonly initialValue$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get initialValue(): Point2D {
    return this.initialValue$.read();
  }

  set initialValue(value: Point2D) {
    this.initialValue$.write(value);
  }

  readonly initialVelocity$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get initialVelocity(): Point2D {
    return this.initialVelocity$.read();
  }

  set initialVelocity(value: Point2D) {
    this.initialVelocity$.write(value);
  }

  readonly friction$: MotionProperty<number> = createProperty<number>({
    initialValue: DEFAULT_DAMPING,
  });

  get friction(): number {
    return this.friction$.read();
  }

  set friction(value: number) {
    this.friction$.write(value);
  }

  readonly threshold$: MotionProperty<number> = createProperty<number>({
    initialValue: DEFAULT_THRESHOLD,
  });

  get threshold(): number {
    return this.threshold$.read();
  }

  set threshold(value: number) {
    this.threshold$.write(value);
  }

  readonly enabled$: MotionProperty<boolean> = createProperty<boolean>({
    initialValue: true,
  });

  get enabled(): boolean {
    return this.enabled$.read();
  }

  set enabled(value: boolean) {
    this.enabled$.write(value);
  }

  readonly state$: ObservableWithMotionOperators<State> = anyOf([
    this.xDecayer.state$.isAnyOf([ State.ACTIVE ]),
    this.yDecayer.state$.isAnyOf([ State.ACTIVE ]),
  ]).dedupe().rewrite<State, State>({
    mapping: {
      true: State.ACTIVE,
      false: State.AT_REST,
    },
  })._remember();

  get state(): State {
    return this.state$._read()!;
  }

  // Since this emits `Point2D`s, it's probably safe to presume it will be used
  // for translation.  But, to be consistent with `NumericDecayer`, we write
  // outputs to `value$` rather than `styleStreams`.

  // If `value$` were debounced, it would emit its terminal value after `state$`
  // is `AT_REST`.  This might be OK in practice (since there would only be one
  // final frame emitted while the interaction is `AT_REST`).  However, to
  // maintain the contract that `state$` will be `ACTIVE` whenever the stream is
  // animating, and to make testing simpler, we don't debounce here.
  //
  // If it were debounced, we'd have to either ensure that `state$` waits until
  // the next frame before emitting `AT_REST`, or accept that they are out-of-
  // sync and add an extra mockRAF.step() to the relevant tests.
  readonly value$: ObservableWithMotionOperators<Point2D> = combineLatest<Point2D, MaybeReactive<Point2D>>({
    x: this.xDecayer.value$,
    y: this.yDecayer.value$,
  });

  constructor() {
    subscribe({
      sink: this.xDecayer.initialValue$,
      source: this.initialValue$.pluck('x'),
    });

    subscribe({
      sink: this.yDecayer.initialValue$,
      source: this.initialValue$.pluck('y'),
    });

    subscribe({
      sink: this.xDecayer.initialVelocity$,
      source: this.initialVelocity$.pluck('x'),
    });

    subscribe({
      sink: this.yDecayer.initialVelocity$,
      source: this.initialVelocity$.pluck('y'),
    });

    subscribe({
      sinks: [
        this.xDecayer.stiffness$,
        this.yDecayer.stiffness$,
      ],
      source: this.stiffness$,
    });

    subscribe({
      sinks: [
        this.xDecayer.friction$,
        this.yDecayer.friction$,
      ],
      source: this.friction$,
    });

    subscribe({
      sinks: [
        this.xDecayer.threshold$,
        this.yDecayer.threshold$,
      ],
      source: this.threshold$,
    });

    subscribe({
      sinks: [
        this.xDecayer.enabled$,
        this.yDecayer.enabled$,
      ],
      source: this.enabled$,
    });
  }
}
export default Point2DDecayer;
