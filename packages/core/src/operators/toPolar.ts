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
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
  PolarCoords,
} from '../types';

import {
  isDefined,
} from '../typeGuards';

export type ToPolarOrigin<T> = (T & Point2D) | (Observable<T & Point2D>);

export type ToPolarArgs<T> = {
  origin$: ToPolarOrigin<T>,
};

export interface MotionPolarizable<T> {
  toPolar(kwargs: ToPolarArgs<T>): ObservableWithMotionOperators<PolarCoords>;
  toPolar(origin$: ToPolarOrigin<T>): ObservableWithMotionOperators<PolarCoords>;
}

export function withToPolar<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionPolarizable<T>> {
  return class extends superclass implements MotionPolarizable<T> {
    /**
     * Converts a stream of `Point2D`s to a stream of `{ distance, angle }`,
     * where `distance` is in pixels and `angle` is in radians.
     */
    toPolar(kwargs: ToPolarArgs<T>): ObservableWithMotionOperators<PolarCoords>;
    toPolar(origin$: ToPolarOrigin<T>): ObservableWithMotionOperators<PolarCoords>;
    toPolar({ origin$ }: ToPolarArgs<T> & ToPolarOrigin<T>): ObservableWithMotionOperators<PolarCoords> {
      if (!isDefined(origin$)) {
        origin$ = arguments[0] as ToPolarOrigin<T>;
      }

      return this._reactiveMap({
        transform({ upstream, origin }: Dict<T & Point2D>) {
          const deltaX = upstream.x - origin.x;
          const deltaY = upstream.y - origin.y;

          return {
            // Inlining Pythagorean theorem instead of using `combineLatest` +
            // `distanceFrom`, both for simplicity and to avoid emitting twice
            // for each upstream emission.
            distance: Math.sqrt(deltaX ** 2 + deltaY ** 2),
            angle: Math.atan2(deltaY, deltaX),
          };
        },
        inputs: {
          origin: origin$,
        },
      });
    }
  };
}
