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

import { deepEqual } from 'fast-equals';

import {
  Constructor,
  EqualityCheck,
  NextChannel,
  ObservableWithFoundationalMotionOperators,
  ObservableWithMotionOperators,
} from '../types';

export type DedupeArgs = {
  areEqual?: EqualityCheck,
};

export interface MotionDeduplicable<T> {
  dedupe(kwargs?: DedupeArgs): ObservableWithMotionOperators<T>;
}

export function withDedupe<T, S extends Constructor<ObservableWithFoundationalMotionOperators<T>>>(superclass: S): S & Constructor<MotionDeduplicable<T>> {
  return class extends superclass implements MotionDeduplicable<T> {
    /**
     * Ensures that every emission is different than the previous one.
     */
    dedupe({ areEqual = deepEqual } = {}): ObservableWithMotionOperators<T> {
      return this._nextOperator({
        operation({ emit }) {
          let emitted = false;
          let lastValue: T;

          return ({ upstream }) => {
            if (emitted && areEqual(upstream, lastValue)) {
              return;
            }

            // To prevent a potential infinite loop, these flags must be set
            // before emitting the result to the observer.
            lastValue = upstream;
            emitted = true;

            emit(upstream);
          };
        }
      });
    }
  };
}
