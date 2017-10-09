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

export interface MotionFlattenable<T> {
  _flattenIterables<U>(): ObservableWithMotionOperators<U>;
}

export function withFlattenIterables<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionFlattenable<T>> {
  return class extends superclass implements MotionFlattenable<T> {
    /**
     * Iterates over every value it receives from upstream and emits each
     * individually.
     */
    _flattenIterables<U>(): ObservableWithMotionOperators<U> {
      return this._nextOperator({
        operation: ({ emit }) => ({ upstream: values }) => {
          if (isIterable(values)) {
            for (const value of values) {
              emit(value);
            }
          } else {
            emit(values as any as U);
          }
        }
      });
    }
  };
}
