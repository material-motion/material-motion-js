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
  isBoolean,
} from '../typeGuards';

import {
  Constructor,
  MotionNextOperable,
  NextChannel,
  ObservableWithMotionOperators,
} from '../types';

// TODO: figure out the right way to cast T to boolean | number without
// constraining T on streams that don't support inverted.  Same in rewriteRange.

export interface MotionInvertible<T> {
  inverted(): ObservableWithMotionOperators<T>;
}

export function withInverted<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionInvertible<T>> {
  return class extends superclass implements MotionInvertible<T> {
    /**
     * Useful for getting the opposite of a boolean or the complementary
     * percentage of a number between 0 and 1 (inclusive).
     *
     * Dispatches:
     * - `false` when it receives `true`,
     * - `true` when it receives `false`,
     * - `1 - value` when it receives a numeric value
     */
    inverted(): ObservableWithMotionOperators<T> {
      type U = number | boolean;

      return (this as any as ObservableWithMotionOperators<U>)._nextOperator(
        (value: U, dispatch: NextChannel<U>) => {
          if (isBoolean(value)) {
            dispatch(!value);
          } else {
            dispatch(1 - value);
          }
        }
      );
    }
  };
}
