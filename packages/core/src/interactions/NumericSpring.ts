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
  createProperty,
} from '../observables/createProperty';

import {
  MotionProperty,
} from '../observables/MotionProperty';

import {
  State,
} from '../State';

import {
  ObservableWithMotionOperators,
} from '../types';

// Springs are a core primitive in Material Motion, yet, the implementations we
// have are all from 3rd party libraries.  Thus, the common
// getters/setters/properties live here, and each implementation can extend it
// to implement its own `value$`.
export abstract class NumericSpring {
  readonly destination$: MotionProperty<number> = createProperty<number>({
    initialValue: 0,
  });

  get destination(): number {
    return this.destination$.read();
  }

  set destination(value: number) {
    this.destination$.write(value);
  }

  readonly initialValue$: MotionProperty<number> = createProperty<number>({
    initialValue: 0,
  });

  get initialValue(): number {
    return this.initialValue$.read();
  }

  set initialValue(value: number) {
    this.initialValue$.write(value);
  }

  readonly initialVelocity$: MotionProperty<number> = createProperty<number>({
    initialValue: 0,
  });

  get initialVelocity(): number {
    return this.initialVelocity$.read();
  }

  set initialVelocity(value: number) {
    this.initialVelocity$.write(value);
  }

  readonly tension$: MotionProperty<number> = createProperty<number>({
    initialValue: 342,
  });

  get tension(): number {
    return this.tension$.read();
  }

  set tension(value: number) {
    this.tension$.write(value);
  }

  readonly friction$: MotionProperty<number> = createProperty<number>({
    initialValue: 30,
  });

  get friction(): number {
    return this.friction$.read();
  }

  set friction(value: number) {
    this.friction$.write(value);
  }

  readonly threshold$: MotionProperty<number> = createProperty<number>({
    initialValue: .001,
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

  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  abstract value$: ObservableWithMotionOperators<number>;
}
export default NumericSpring;
