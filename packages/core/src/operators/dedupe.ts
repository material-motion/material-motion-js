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
  Constructor,
  EqualityCheck,
  NextChannel,
  ObservableWithFoundationalMotionOperators,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionDeduplicable<T> {
  dedupe(areEqual?: EqualityCheck): ObservableWithMotionOperators<T>;
}

export function withDedupe<T, S extends Constructor<ObservableWithFoundationalMotionOperators<T>>>(superclass: S): S & Constructor<MotionDeduplicable<T>> {
  return class extends superclass implements MotionDeduplicable<T> {
    /**
     * Ensures that every value dispatched is different than the previous one.
     */
    dedupe(areEqual: EqualityCheck = deepEqual): ObservableWithMotionOperators<T> {
      // If upstream observable is synchronous, `_multicast` will skip the first
      // value (because its observers will not yet have been registered when
      // upstream dispatches).  Thus, we manually multicast here.
      const lastValueByChannel = new Map<NextChannel<T>, T>();

      return this._nextOperator(
        (value: T, dispatch: NextChannel<T>) => {
          const lastValue = lastValueByChannel.get(dispatch);

          if (lastValueByChannel.has(dispatch) && areEqual(value, lastValue)) {
            return;
          }

          // To prevent a potential infinite loop, this must be set before
          // dispatching the result to the observer
          lastValueByChannel.set(dispatch, value);

          dispatch(value);
        }
      );
    }
  };
}
