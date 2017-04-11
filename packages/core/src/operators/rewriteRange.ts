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
} from '../types';

// TODO: figure out how to specify that T should extend number.  Same in
// inverted.
export interface MotionRewriteRangeable<T> {
  rewriteRange<U>(kwargs: RewriteRangeArgs): Observable<U>;
}

export function withRewriteRange<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionRewriteRangeable<T>> {
  return class extends superclass implements MotionRewriteRangeable<T> {
  /**
   * Receives a value from upstream, linearly interpolates it between the given
   * ranges, and dispatches the result to the observer.
   */
  rewriteRange({ fromStart, fromEnd, toStart = 0, toEnd = 1 }: RewriteRangeArgs): Observable<number> {
    return this._nextOperator(
      (value: T, dispatch: NextChannel<number>) => {
        const fromRange = fromStart - fromEnd;
        const fromProgress = (value - fromEnd) / fromRange;
        const toRange = toStart - toEnd;

        dispatch(toEnd + fromProgress * toRange);
      }
    );
  }
};

export type RewriteRangeArgs = {
  fromStart: number,
  fromEnd: number,
  toStart: number,
  toEnd: number,
};
