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
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  isPoint2D,
} from '../typeGuards';

export interface MotionMeasurable<T> {
  distanceFrom(origin: T & (Point2D | number)): ObservableWithMotionOperators<number>;
}

export function withDistanceFrom<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionMeasurable<T>> {
  return class extends superclass implements MotionMeasurable<T> {
    /**
     * Dispatches the distance that each upstream value is from a given origin.
     * The origin may be a number or a point, but the dispatched value will
     * always be a number; distance is computed using Pythagorean theorem.
     */
    distanceFrom(origin: T & (Point2D | number)): ObservableWithMotionOperators<number> {
      if (isPoint2D(origin)) {
        return (this as any as MotionMappable<Point2D>)._map(
          (value: Point2D) => Math.sqrt((origin.x - value.x) ** 2 + (origin.y - value.y) ** 2)
        );
      } else {
        return (this as any as MotionMappable<number>)._map(
          (value: number) => Math.abs(origin - value)
        );
      }
    }
  };
}
