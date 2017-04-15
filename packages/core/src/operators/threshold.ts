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
  MotionMappable,
  Observable,
} from '../types';

import {
  ThresholdSide,
} from '../ThresholdSide';

export interface MotionThresholdable {
  threshold(limit: number): Observable<ThresholdSide>;
}

export function withThreshold<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionThresholdable<T>> {
  return class extends superclass implements MotionThresholdable {
    threshold(limit: number): Observable<ThresholdSide> {
      return this._map(
        (value: number) => {
          if (value === limit) {
            return ThresholdSide.WITHIN;

          } else if (value < limit) {
            return ThresholdSide.BELOW;

          } else if (value > limit) {
            return ThresholdSide.ABOVE;
          }
        }
      );
    }
  };
}
