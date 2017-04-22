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
  Observable,
  ObservableWithMotionOperators,
  Observer,
} from '../types';

export interface MotionWindowable<T> {
  slidingWindow(length: number): ObservableWithMotionOperators<Array<T>>;
}

export function withSlidingWindow<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionWindowable<T>> {
  return class extends superclass implements MotionWindowable<T> {
    /**
     * Dispatches the last values to be received in an array of the given
     * `length`.
     *
     * Reuses the same array on each dispatch, so if you want to compare
     * dispatches, make a copy of each as you receive it.
     */
    slidingWindow(length: number = 2): ObservableWithMotionOperators<Array<T>> {
      const result: Array<T> = [];

      return this._nextOperator(
        (value: T, dispatch: NextChannel<Array<T>>) => {
          result.push(value);

          if (result.length > length) {
            result.shift();
          }

          dispatch(result);
        }
      );
    }
  };
}
