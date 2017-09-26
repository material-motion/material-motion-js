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
  MotionDebounceable<T>, MotionFilterable<T>, MotionFlattenable<T>,
  MotionMappable<T>, MotionMathOperable<T>, MotionMemorable<T>,
  MotionMulticastable<T>, MotionNextOperable<T>, MotionReactiveMappable<T>,
  MotionReactiveNextOperable<T>, MotionReadable<T>, MotionTappable<T>,
  MotionWindowable<T> {}

export function withFoundationalMotionOperators<T, S extends Constructor<Observable<T>>>(superclass: S): S
    & Constructor<ObservableWithFoundationalMotionOperators<T>> {

  return withRead(withDebounce(withRemember(withMulticast(withFilter(
    withMathOperator(withMap(withTap(withReactiveMap(withReactiveNextOperator(
      withFlattenIterables(withSlidingWindow(withNextOperator<T, S>(superclass))
    )))))
  ))))));
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
