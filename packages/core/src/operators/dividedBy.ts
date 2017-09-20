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
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionDivisible {
  dividedBy(denominator$: number | Observable<number>): ObservableWithMotionOperators<number>;
}

export function withDividedBy<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionDivisible> {
  return class extends superclass implements MotionDivisible {
     /**
     * Divides the incoming value by the denominator and dispatches the result.
     */
   dividedBy(denominator$: number | Observable<number>): ObservableWithMotionOperators<number> {
      return (this as any as ObservableWithMotionOperators<number>)._reactiveMap(
        (value: number, denominator: number) => value / denominator,
        [ denominator$, ]
      );
    }
  };
}
