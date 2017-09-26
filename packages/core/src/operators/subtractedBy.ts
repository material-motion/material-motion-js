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
  isPoint2D,
} from '../typeGuards';

import {
  Constructor,
  MotionMathOperable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  ReactiveMappableOptions,
} from './foundation/_reactiveMap';

export interface MotionSubtractable<T> {
  subtractedBy<U extends T & (Point2D | number)>(
    amount$: U | Observable<U>,
    options?: ReactiveMappableOptions,
  ): ObservableWithMotionOperators<U>;
}

export function withSubtractedBy<T, S extends Constructor<MotionMathOperable<T>>>(superclass: S): S & Constructor<MotionSubtractable<T>> {
  return class extends superclass implements MotionSubtractable<T> {
    /**
     * Subtracts the amount from the incoming value and dispatches the result.
     */
    subtractedBy<U extends T & (Point2D | number)>(amount$: U | Observable<U>, options?: ReactiveMappableOptions): ObservableWithMotionOperators<U> {
      return this._mathOperator(
        (value, amount) => value - amount,
        amount$,
        options
      );
    }
  };
}
