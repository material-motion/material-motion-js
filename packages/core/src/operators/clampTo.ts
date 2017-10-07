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
  MaybeReactive,
  MotionMathOperable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  isDefined,
} from '../typeGuards';

export type ClampArgs<U> = MaybeReactive<{
  min$?: U,
  max$?: U,
}>;

export interface MotionClampable<T> {
  // Since number literals get their own types, `U extends T & number` will
  // resolve to `5` if the upstream value is `5`.  This would break
  // `$.addedBy(5).multipliedBy(4)`, because `multipliedBy` could only take `5`.
  //
  // To work around this, we overload the method signature.  When `T` is a
  // number, we explicitly return an `Observable<number>`.  Otherwise, we can
  // use the type variable `U`.
  clampTo<U extends T & number>(kwargs: ClampArgs<U>): ObservableWithMotionOperators<number>;
  clampTo<U extends T & Point2D>(kwargs: ClampArgs<U>): ObservableWithMotionOperators<U>;
}

export function withClampTo<T, S extends Constructor<MotionMathOperable<T>>>(superclass: S): S & Constructor<MotionClampable<T>> {
  return class extends superclass implements MotionClampable<T> {
    clampTo<U extends T & (Point2D | number)>({ min$, max$ }: ClampArgs<U>): ObservableWithMotionOperators<U> {
      return this._mathOperator({
        operation: (upstream, min) => isDefined(min)
          ? Math.max(upstream, min)
          : upstream,
        value$: min$ as Observable<U>,

      })._mathOperator({
        operation: (upstream, max) => isDefined(max)
          ? Math.min(upstream, max)
          : upstream,
        value$: max$ as Observable<U>,
      });
    }
  };
}
