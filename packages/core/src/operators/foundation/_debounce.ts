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

export interface MotionDebounceable<T> {
  _debounce(): ObservableWithMotionOperators<T>;
}

export function withDebounce<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S
    & Constructor<MotionDebounceable<T>> {
  return class extends superclass implements MotionDebounceable<T> {
    /**
     * Limits the number of dispatches to one per frame.
     *
     * When it receives a value, it waits until the next frame to dispatch it.
     * If more than one value is received whilst awaiting the frame, the most
     * recent value is dispatched and the intermediaries are forgotten.
     *
     * Since no rendering will happen until `requestAnimationFrame` is called,
     * it should be safe to `_debounce()` without missing a frame.
     */
    _debounce(): ObservableWithMotionOperators<T> {
      let queuedFrameID: number;
      let lastValue: T;

      return this._nextOperator(
        (value: T, dispatch: NextChannel<T>) => {
          lastValue = value;

          if (!queuedFrameID) {
            queuedFrameID = requestAnimationFrame(
              () => {
                dispatch(lastValue);
                queuedFrameID = 0;
              }
            );
          }
        }
      );
    }
  };
}
