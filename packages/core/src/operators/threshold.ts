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
  ThresholdRegion,
} from '../enums';

import {
  Constructor,
  MaybeReactive,
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
} from '../types';

import {
  isDefined,
} from '../typeGuards';

import {
  _ReactiveMapOptions,
} from './foundation/_reactiveMap';

export type ThresholdLimit = number | Observable<number>;
export type ThresholdArgs = _ReactiveMapOptions & {
  limit$: ThresholdLimit,
};

export interface MotionThresholdable {
  threshold(limit$: ThresholdLimit): ObservableWithMotionOperators<ThresholdRegion>;
  threshold(kwargs: ThresholdArgs): ObservableWithMotionOperators<ThresholdRegion>;
}

export function withThreshold<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionThresholdable> {
  return class extends superclass implements MotionThresholdable {
    threshold(limit$: ThresholdLimit): ObservableWithMotionOperators<ThresholdRegion>;
    threshold(kwargs: ThresholdArgs): ObservableWithMotionOperators<ThresholdRegion>;
    threshold({ limit$, ...reactiveMapOptions }: any): ObservableWithMotionOperators<ThresholdRegion> {
      if (!isDefined(limit$)) {
        limit$ = arguments[0];
      }

      return (this as any as MotionReactiveMappable<number>)._reactiveMap({
        transform: ({ upstream, limit }) => {
          if (upstream < limit) {
            return ThresholdRegion.BELOW;

          } else if (upstream > limit) {
            return ThresholdRegion.ABOVE;
          } else {
            return ThresholdRegion.WITHIN;
          }
        },
        inputs: {
          limit: limit$ as ThresholdLimit,
        },
        ...reactiveMapOptions as _ReactiveMapOptions,
      });
    }
  };
}
