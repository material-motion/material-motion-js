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
  Spring,
} from '../types';

import {
  DEFAULT_DAMPING,
  DEFAULT_STIFFNESS,
  DEFAULT_THRESHOLD,
  NumericSpring,
} from './NumericSpring';

/**
 * `Point2DSpring` is a spring that accepts and emits `Point2D`s for its
 * configuration values.  Internally, it is composed of two independent
 * `NumericSpring`s.
 *
 * Because each internal spring dispatches independently, `value$` will dispatch
 * intermediate values (e.g. changing `initialValue` from `{ x: 0, y: 0 }` to
 * `{ x: 5, y: 4 }` will cause 2 dispatches, one when `x` changes and one when
 * `y` changes.)  This may be corrected in a future release, when dispatches
 * could be batched into one per frame.
 */
export class Point2DSpring implements Spring<Point2D> {
  readonly xSpring = new NumericSpring();
  readonly ySpring = new NumericSpring();

  readonly destination$: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: { x: 0, y: 0 },
  });

  get destination(): Point2D {
    return this.destination$.read();
  }

  set destination(value: Point2D) {
    this.destination$.write(value);
  }

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

  readonly stiffness$: MotionProperty<number> = createProperty<number>({
    initialValue: DEFAULT_STIFFNESS,
  });

  get stiffness(): number {
    return this.stiffness$.read();
  }

  set stiffness(value: number) {
    this.stiffness$.write(value);
  }

  readonly damping$: MotionProperty<number> = createProperty<number>({
    initialValue: DEFAULT_DAMPING,
  });

  get damping(): number {
    return this.damping$.read();
  }

  set damping(value: number) {
    this.damping$.write(value);
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
    this.xSpring.state$.isAnyOf([ State.ACTIVE ]),
    this.ySpring.state$.isAnyOf([ State.ACTIVE ]),
  ]).dedupe().rewrite<State, State>({
    mapping: {
      true: State.ACTIVE,
      false: State.AT_REST,
    },
  })._remember();

  get state(): State {
    return this.state$._read()!;
  }

  // Since this dispatches `Point2D`s, it's probably safe to presume it will be
  // used for translation.  But, to be consistent with `NumericSpring`, we write
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
    x: this.xSpring.value$,
    y: this.ySpring.value$,
  });

  constructor() {
    subscribe({
      sink: this.xSpring.destination$,
      source: this.destination$.pluck('x'),
    });

    subscribe({
      sink: this.ySpring.destination$,
      source: this.destination$.pluck('y'),
    });

    subscribe({
      sink: this.xSpring.initialValue$,
      source: this.initialValue$.pluck('x'),
    });

    subscribe({
      sink: this.ySpring.initialValue$,
      source: this.initialValue$.pluck('y'),
    });

    subscribe({
      sink: this.xSpring.initialVelocity$,
      source: this.initialVelocity$.pluck('x'),
    });

    subscribe({
      sink: this.ySpring.initialVelocity$,
      source: this.initialVelocity$.pluck('y'),
    });

    subscribe({
      sinks: [
        this.xSpring.stiffness$,
        this.ySpring.stiffness$,
      ],
      source: this.stiffness$,
    });

    subscribe({
      sinks: [
        this.xSpring.damping$,
        this.ySpring.damping$,
      ],
      source: this.damping$,
    });

    subscribe({
      sinks: [
        this.xSpring.threshold$,
        this.ySpring.threshold$,
      ],
      source: this.threshold$,
    });

    subscribe({
      sinks: [
        this.xSpring.enabled$,
        this.ySpring.enabled$,
      ],
      source: this.enabled$,
    });
  }
}
export default Point2DSpring;
