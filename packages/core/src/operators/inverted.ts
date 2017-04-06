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

// TODO: figure out the right way to cast T to boolean | number without
// constraining T on streams that don't support inverted.  Same in rewriteRange.

export interface MotionInvertible<T> {
  inverted(): Observable<T>;
}

export function withInverted<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionInvertible<T>> {
  return class extends superclass implements MotionInvertible<T> {
    /**
     * Dispatches:
     * - false when it receives true,
     * - true when it receives false,
     * - 0 when it receives 1, and
     * - 1 when it receives 0.
     */
    inverted(): Observable<T> {
      return this._nextOperator(
        (value: T, dispatch: NextChannel<T>) => {
          switch (value) {
            case 0:
              dispatch(1);
              break;

             case 1:
              dispatch(0);
              break;

             case false:
              dispatch(true);
              break;

             case true:
              dispatch(false);
              break;

            default:break;
          }
        }
      );
    }
  };
}
