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
  MotionNextOperable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
} from '../../types';

import {
  isIterable,
} from '../../typeGuards';

export interface MotionFlattenable<T> extends Observable<Iterable<T>> {
  _flattenIterables(): ObservableWithMotionOperators<T>;
}

export function withFlattenIterables<T, S extends Constructor<MotionNextOperable<Iterable<T>>>>(superclass: S): S & Constructor<MotionFlattenable<T>> {
  return class extends superclass implements MotionFlattenable<T> {
    /**
     * Iterables over every value it receives from upstream and dispatches each
     * individually.
     */
    _flattenIterables(): ObservableWithMotionOperators<T> {
      return this._nextOperator(
        (values: Iterable<T>, dispatch: NextChannel<T>) => {
          if (isIterable(values)) {
            for (const value of values) {
              dispatch(value);
            }
          } else {
            dispatch(values);
          }
        }
      );
    }
  };
}
