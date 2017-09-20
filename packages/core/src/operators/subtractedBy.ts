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
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionSubtractable<T> {
  subtractedBy(amount$: T | Observable<T>): ObservableWithMotionOperators<T>;
}

export function withSubtractedBy<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionSubtractable<T>> {
  return class extends superclass implements MotionSubtractable<T> {
    /**
     * Subtracts the amount from the incoming value and dispatches the result.
     */
    subtractedBy(amount$: T | Observable<T>): ObservableWithMotionOperators<T> {
      return this._reactiveMap(
        (value: T, amount: T) => {
          if (isPoint2D(value)) {
            return {
              x: value.x - amount.x,
              y: value.y - amount.y,
            };
          } else {
            return value - amount;
          }
        },
        [ amount$, ]
      );
    }
  };
}
