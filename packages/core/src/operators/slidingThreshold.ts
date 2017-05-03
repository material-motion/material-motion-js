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
} from '../types';

import {
  ThresholdSide,
} from '../ThresholdSide';

export interface MotionSlidingThresholdable<T> {
  slidingThreshold(distance: number): ObservableWithMotionOperators<string>;
}

export function withSlidingThreshold<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionSlidingThresholdable<T>> {
  return class extends superclass implements MotionSlidingThresholdable<T> {

    /**
     * Listens to an incoming stream of numbers.  When the values have increased
     * by at least `distance`, it dispatches `ThresholdSide.ABOVE`.  When they
     * have decreased by at least `distance`, it dispatches `ThresholdSide.BELOW`.
     *
     * `slidingThreshold` suppress duplicates: `ABOVE` will only be dispatched if
     * the previous dispatch was `BELOW` and vice-versa.
     */
    slidingThreshold(distance: number = 56): ObservableWithMotionOperators<string> {
      let aboveThreshold: number;
      let belowThreshold: number;
      let lastValue: number;
      let lastSide: string;

      return (this as any as ObservableWithMotionOperators<number>)._nextOperator(
        (value: number, dispatch: NextChannel<string>) => {
          let nextSide?: string;

          if (value > aboveThreshold && lastSide !== ThresholdSide.ABOVE) {
            nextSide = ThresholdSide.ABOVE;
          }

          if (value < belowThreshold && lastSide !== ThresholdSide.BELOW) {
            nextSide = ThresholdSide.BELOW;
          }

          if (nextSide !== undefined) {
            dispatch(nextSide);
            lastSide = nextSide;
          }

          if (value < lastValue || lastValue === undefined) {
            aboveThreshold = value + distance;
          }

          if (value > lastValue || lastValue === undefined) {
            belowThreshold = value - distance;
          }

          lastValue = value;
        }
      );
    }
  };
}
