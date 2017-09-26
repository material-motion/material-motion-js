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
} from '../../types';

import {
  MotionDebounceable,
  withDebounce,
} from './_debounce';

import {
  MotionFilterable,
  withFilter,
} from './_filter';

import {
  MotionFlattenable,
  withFlattenIterables,
} from './_flattenIterables';

import {
  MotionMappable,
  withMap,
} from './_map';

import {
  MotionMathOperable,
  withMathOperator,
} from './_mathOperator';

import {
  MotionMulticastable,
  withMulticast,
} from './_multicast';

import {
  MotionNextOperable,
  withNextOperator,
} from './_nextOperator';

import {
  MotionReactiveMappable,
  withReactiveMap,
} from './_reactiveMap';

import {
  MotionReactiveNextOperable,
  withReactiveNextOperator,
} from './_reactiveNextOperator';

import {
  MotionMemorable,
  withRemember,
} from './_remember';

import {
  MotionReadable,
  withRead,
} from './_read';

import {
  MotionWindowable,
  withSlidingWindow,
} from './_slidingWindow';

import {
  MotionTappable,
  withTap,
} from './_tap';

export interface ObservableWithFoundationalMotionOperators<T> extends
  MotionDebounceable<T>,
  MotionFlattenable<T>,
  MotionFilterable<T>,
  MotionMappable<T>,
  MotionMathOperable<T>,
  MotionMemorable<T>,
  MotionMulticastable<T>,
  MotionNextOperable<T>,
  MotionReactiveMappable<T>,
  MotionReactiveNextOperable<T>,
  MotionReadable<T>,
  MotionTappable<T>,
  MotionWindowable<T> {}

export function withFoundationalMotionOperators<T, S extends Constructor<Observable<T>>>(superclass: S): S
    & Constructor<ObservableWithFoundationalMotionOperators<T>> {

  // If we don't pass through an explicit value for `T`, it is inferred to be `{}`,
  // which is incorrect.  If we explicitly defined `T`, TypeScript won't infer
  // `S`.  Thus, we manually infer `S` with `typeof`.  Moreover, type inferrance
  // happens at definition time, so we need to define each step as a separate
  // constant.

  const result = withNextOperator<T, S>(superclass);
  const result1 = withReactiveNextOperator<T, typeof result>(result);
  const result2 = withTap<T, typeof result1>(result1);
  const result3 = withMap<T, typeof result2>(result2);
  const result4 = withReactiveMap<T, typeof result3>(result3);
  const result5 = withFilter<T, typeof result4>(result4);
  const result6 = withMulticast<T, typeof result5>(result5);
  const result7 = withRemember<T, typeof result6>(result6);
  const result8 = withDebounce<T, typeof result7>(result7);
  const result9 = withSlidingWindow<T, typeof result8>(result8);
  const result10 = withRead<T, typeof result9>(result9);
  const result11 = withMathOperator<T, typeof result10>(result10);
  const result12 = withFlattenIterables<T, typeof result11>(result11);

  return result12;
}

export * from './_debounce';
export * from './_filter';
export * from './_flattenIterables';
export * from './_map';
export * from './_mathOperator';
export * from './_multicast';
export * from './_nextOperator';
export * from './_reactiveMap';
export * from './_reactiveNextOperator';
export * from './_remember';
export * from './_read';
export * from './_slidingWindow';
export * from './_tap';
