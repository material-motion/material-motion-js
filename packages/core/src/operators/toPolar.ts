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
  combineLatest,
} from '../combineLatest';

import {
  Constructor,
  Dict,
  MotionMappable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
  PolarCoords,
} from '../types';

export interface MotionPolarizable {
  // If this accepted an `origin$` argument, we could use type intersections to
  // ensure that the upstream is a `Point2D` (like we do in `distanceFrom`).
  // I'm not convinced that the added complexity is worth it, especially since
  // there's no obvious analog argument for `toCartesian`.
  toPolar(): ObservableWithMotionOperators<PolarCoords>;
}

export function withToPolar<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionPolarizable> {
  return class extends superclass implements MotionPolarizable {
    /**
     * Converts a stream of `Point2D`s to a stream of `{ distance, angle }`,
     * where `distance` is in pixels and `angle` is in radians.
     */
    toPolar(): ObservableWithMotionOperators<PolarCoords> {
      return (this as any as ObservableWithMotionOperators<Point2D>)._map({
        transform({ x, y }): PolarCoords {
          return {
            // Inlining Pythagorean theorem instead of using `combineLatest` +
            // `distanceFrom`, both for simplicity and to avoid emitting twice
            // for each upstream emission.
            distance: Math.sqrt(x ** 2 + y ** 2),
            angle: Math.atan2(y, x),
          };
        },
      });
    }
  };
}
