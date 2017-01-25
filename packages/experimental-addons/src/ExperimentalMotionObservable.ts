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
  MotionObservable,
} from 'material-motion-streams';

/**
 * MotionObservable, with experimental operators
 */
export class ExperimentalMotionObservable<T> extends MotionObservable<T> {
  /**
   * Ensures that every value dispatched is different than the previous one.
   */
  dedupe():ExperimentalMotionObservable<T> {
    let dispatched;
    let lastValue;

    return this._nextOperator(
      (value, dispatch) => {
        if (dispatched && value === lastValue) {
          return;
        }

        dispatch(value);
        dispatched = true;
        lastValue = value;
      }
    ) as ExperimentalMotionObservable<T>;
  }
}
export default ExperimentalMotionObservable;
