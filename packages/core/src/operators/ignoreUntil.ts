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

import * as deepEqual from 'deep-equal';

import {
  MotionObservable,
} from '../observables/MotionObservable';

import {
  Constructor,
  EqualityCheck,
  ObservableWithFoundationalMotionOperators,
} from '../types';

export interface MotionIgnorable<T> {
  ignoreUntil(expectedValue: T, areEqual?: EqualityCheck): MotionObservable<T>;
}

export function withIgnoreUntil<T, S extends Constructor<ObservableWithFoundationalMotionOperators<T>>>(superclass: S): S & Constructor<MotionIgnorable<T>> {
  return class extends superclass implements MotionIgnorable<T> {
    /**
     * Suppresses all values in a stream until one of them matches the expected
     * value.  The expected value, and all subsequent values, will then be
     * dispatched.
     */
    ignoreUntil(expectedValue: T, areEqual: EqualityCheck = deepEqual): MotionObservable<T> {
      let ignoring = true;

      return this._filter(
        (value: T) => {
          if (ignoring && areEqual(value, expectedValue)) {
            ignoring = false;
          }

          return !ignoring;
        }
      );
    }
  };
}
