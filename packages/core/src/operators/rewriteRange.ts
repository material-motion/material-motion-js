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
} from '../types';

export interface MotionRewriteRangeable {
  rewriteRange(kwargs: RewriteRangeArgs): ObservableWithMotionOperators<number>;
}

export function withRewriteRange<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionRewriteRangeable> {
  return class extends superclass implements MotionRewriteRangeable {
    /**
     * Receives a value from upstream, linearly interpolates it between the given
     * ranges, and dispatches the result to the observer.
     */
    rewriteRange({
      fromStart = 0,
      fromEnd = 1,
      toStart = 0,
      toEnd = 1,
      bound = false,
    }: RewriteRangeArgs): ObservableWithMotionOperators<number> {
      return (this as any as ObservableWithMotionOperators<number>)._reactiveNextOperator({
        operation: ({ emit }) => ({
          upstream,
          fromStart,
          fromEnd,
          toStart,
          toEnd,
          bound,
        }) => {
          const fromRange = fromStart - fromEnd;
          const fromProgress = (upstream - fromEnd) / fromRange;
          const toRange = toStart - toEnd;

          const result = toEnd + fromProgress * toRange;

          if (bound) {
            const lowerBound = Math.min(toStart, toEnd);
            const upperBound = Math.max(toStart, toEnd);

            emit(Math.max(lowerBound, Math.min(result, upperBound)));
          } else {
            emit(result);
          }
        },
        inputs: { fromStart, fromEnd, toStart, toEnd, bound },
      });
    }
  };
}

export type RewriteRangeArgs = {
  fromStart?: number | Observable<number>,
  fromEnd?: number | Observable<number>,
  toStart?: number | Observable<number>,
  toEnd?: number | Observable<number>,
  bound?: boolean | Observable<boolean>,
};
