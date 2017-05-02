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
  ObservableWithMotionOperators,
} from '../../types';

export interface MotionTappable<T> {
  _tap(operation: (value: T) => any): ObservableWithMotionOperators<T>;
}

export function withTap<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionTappable<T>> {
  return class extends superclass implements MotionTappable<T> {
    /**
     * Calls `operation` for each value in the stream.  The result of
     * `operation` is ignored - values received from upstream are passed-through
     * to the observer.
     */
    _tap(operation: (value: T) => any): ObservableWithMotionOperators<T> {
      return this._nextOperator(
        (value: T, dispatch: NextChannel<T>) => {
          operation(value);
          dispatch(value);
        }
      );
    }
  };
}
