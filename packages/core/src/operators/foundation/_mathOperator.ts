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
} from '../../typeGuards';

import {
  Constructor,
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../../types';

import {
  ReactiveMappableOptions,
} from './_reactiveMap';

export interface MotionMathOperable<T> {
  _mathOperator<U extends T & (Point2D | number)>(
    operation: (first: number, second: number) => number,
    amount$: U | Observable<U>,
    options?: ReactiveMappableOptions,
  ): ObservableWithMotionOperators<U>;
}

export function withMathOperator<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionMathOperable<T>> {
  return class extends superclass implements MotionMathOperable<T> {
    /**
     * Applies the operation to each dimension and dispatches the result.
     */
    _mathOperator<U extends T & (Point2D | number)>(operation: (first: number, second: number) => number, amount$: U | Observable<U>, options?: ReactiveMappableOptions): ObservableWithMotionOperators<U> {
      return (this as any as ObservableWithMotionOperators<U>)._reactiveMap(
        (value: U, amount: U) => {
          if (isPoint2D(value)) {
            return {
              x: operation(value.x, (amount as Point2D).x),
              y: operation(value.y, (amount as Point2D).y),
            } as U;
          } else {
            return operation(value as number, amount as number) as U;
          }
        },
        [ amount$, ],
        options
      );
    }
  };
}
