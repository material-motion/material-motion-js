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

import {
  ThresholdRegion,
} from '../constants';

import {
  ReactiveMappableOptions,
} from './foundation/_reactiveMap';

export interface MotionThresholdRangeable {
  thresholdRange(
    start$: number | Observable<number>,
    end$: number | Observable<number>,
    options?: ReactiveMappableOptions,
  ): ObservableWithMotionOperators<ThresholdRegion>;
}

export function withThresholdRange<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionThresholdRangeable> {
  return class extends superclass implements MotionThresholdRangeable {
    thresholdRange(start$: number | Observable<number>, end$: number | Observable<number>, options?: ReactiveMappableOptions): ObservableWithMotionOperators<ThresholdRegion> {
      return (this as any as ObservableWithMotionOperators<number>)._reactiveMap(
        (value: number, start: number, end: number) => {
          const lowerLimit = Math.min(start, end);
          const upperLimit = Math.max(start, end);

          if (value < lowerLimit) {
            return ThresholdRegion.BELOW;

          } else if (value > upperLimit) {
            return ThresholdRegion.ABOVE;

          } else {
            return ThresholdRegion.WITHIN;
          }
        },
        [ start$, end$, ],
        options,
      );
    }
  };
}
