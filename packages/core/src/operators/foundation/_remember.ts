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
  Constructor,
  NextOperation,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Operable,
  Subscription,
} from '../../types';

import {
  MotionSubject,
} from '../../observables/';

export interface MotionMemorable<T> extends Observable<T> {
  _remember(): ObservableWithMotionOperators<T>;
}

export function withRemember<T, S extends Constructor<Observable<T> & Operable<T>>>(superclass: S): S & Constructor<MotionMemorable<T>> {
  return class extends superclass implements MotionMemorable<T> {
    /**
     * Remembers the most recently dispatched value and synchronously
     * dispatches it to all new subscribers.
     *
     * `_remember()` is also useful for ensuring that expensive operations only
     * happen once per dispatch, sharing the resulting value with all observers.
     */
    _remember(): ObservableWithMotionOperators<T> {
      const result = new MotionSubject<T>();
      this.subscribe(result);
      return result;
    }
  };
}
