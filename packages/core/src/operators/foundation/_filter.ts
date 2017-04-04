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
  MotionObservable,
} from '../../observables/MotionObservable';

import {
  Constructor,
  MotionNextOperable,
  NextChannel,
  Observable,
  Predicate,
} from '../../types';

export interface MotionFilterable<T> {
  _filter(predicate: Predicate): Observable<T>;
}

export function withFilter<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionFilterable<T>> {
  return class extends superclass implements MotionFilterable<T> {
    /**
     * Applies `predicate` to every incoming value and synchronously passes
     * values that return `true` to the observer.
     */
    _filter(predicate: Predicate): Observable<T> {
      return this._nextOperator(
        (value: T, dispatch: NextChannel<T>) => {
          if (predicate(value)) {
            dispatch(value);
          }
        }
      );
    }
  };
}
