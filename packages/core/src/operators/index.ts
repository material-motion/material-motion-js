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
  Observable,
} from '../types';

import {
  MotionAddable,
  withAddedBy,
} from './addedBy';

import {
  MotionAppendUnitable,
  withAppendUnit,
} from './appendUnit';

import {
  MotionClampable,
  withClampTo,
} from './clampTo';

import {
  MotionDeduplicable,
  withDedupe,
} from './dedupe';

import {
  MotionMeasurable,
  withDistanceFrom,
} from './distanceFrom';

import {
  MotionDivisible,
  withDividedBy,
} from './dividedBy';

import {
  ObservableWithFoundationalMotionOperators,
  withFoundationalMotionOperators,
} from './foundation';

import {
  MotionInvertible,
  withInverted,
} from './inverted';

import {
  MotionIsAnyOfable,
  withIsAnyOf,
} from './isAnyOf';

import {
  MotionLoggable,
  withLog,
} from './log';

import {
  MotionMergeable,
  withMerge,
} from './merge';

import {
  MotionMultipliable,
  withMultipliedBy,
} from './multipliedBy';

import {
  MotionPluckable,
  withPluck,
} from './pluck';

import {
  MotionRewritable,
  withRewrite,
} from './rewrite';

import {
  MotionRewriteRangeable,
  withRewriteRange,
} from './rewriteRange';

import {
  MotionRewriteToable,
  withRewriteTo,
} from './rewriteTo';

import {
  MotionSeedable,
  withStartWith,
} from './startWith';

import {
  MotionSubtractable,
  withSubtractedBy,
} from './subtractedBy';

import {
  MotionThresholdable,
  withThreshold,
} from './threshold';

import {
  MotionThresholdRangeable,
  withThresholdRange,
} from './thresholdRange';

import {
  MotionTimestampable,
  withTimestamp,
} from './timestamp';

import {
  MotionVelocityMeasurable,
  withVelocity,
} from './velocity';

export interface ObservableWithMotionOperators<T> extends
  ObservableWithFoundationalMotionOperators<T>,
  MotionAddable<T>,
  MotionAppendUnitable,
  MotionClampable<T>,
  MotionDeduplicable<T>,
  MotionDivisible<T>,
  MotionInvertible<T>,
  MotionIsAnyOfable<T>,
  MotionLoggable<T>,
  MotionMeasurable<T>,
  MotionMergeable<T>,
  MotionMultipliable<T>,
  MotionPluckable<T>,
  MotionRewritable<T>,
  MotionRewriteRangeable,
  MotionRewriteToable,
  MotionSeedable<T>,
  MotionSubtractable<T>,
  MotionThresholdRangeable,
  MotionThresholdable,
  MotionTimestampable<T>,
  MotionVelocityMeasurable<T> {}

export function withMotionOperators<T, S extends Constructor<Observable<T>>>(superclass: S): S
    & Constructor<ObservableWithMotionOperators<T>> {
  const result = withFoundationalMotionOperators<T, S>(superclass);
  const result1 = withDedupe<T, typeof result>(result);
  const result2 = withLog<T, typeof result1>(result1);
  const result3 = withMerge<T, typeof result2>(result2);
  const result4 = withTimestamp<T, typeof result3>(result3);
  const result5 = withStartWith<T, typeof result4>(result4);
  const result6 = withRewrite<T, typeof result5>(result5);
  const result7 = withRewriteTo<T, typeof result6>(result6);
  const result8 = withRewriteRange<T, typeof result7>(result7);
  const result9 = withPluck<T, typeof result8>(result8);
  const result10 = withAddedBy<T, typeof result9>(result9);
  const result11 = withSubtractedBy<T, typeof result10>(result10);
  const result12 = withMultipliedBy<T, typeof result11>(result11);
  const result13 = withDividedBy<T, typeof result12>(result12);
  const result14 = withDistanceFrom<T, typeof result13>(result13);
  const result15 = withClampTo<T, typeof result14>(result14);
  const result16 = withThresholdRange<T, typeof result15>(result15);
  const result17 = withThreshold<T, typeof result16>(result16);
  const result18 = withIsAnyOf<T, typeof result17>(result17);
  const result19 = withAppendUnit<T, typeof result18>(result18);
  const result20 = withInverted<T, typeof result19>(result19);
  const result21 = withVelocity<T, typeof result20>(result20);

  return result21;
}

export * from './addedBy';
export * from './appendUnit';
export * from './clampTo';
export * from './dedupe';
export * from './distanceFrom';
export * from './dividedBy';
export * from './foundation';
export * from './inverted';
export * from './isAnyOf';
export * from './log';
export * from './merge';
export * from './multipliedBy';
export * from './pluck';
export * from './rewrite';
export * from './rewriteRange';
export * from './rewriteTo';
export * from './startWith';
export * from './subtractedBy';
export * from './threshold';
export * from './thresholdRange';
export * from './timestamp';
export * from './velocity';
