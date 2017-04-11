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
  MotionMappable,
  withMap,
} from './_map';

import {
  MotionNextOperable,
  withNextOperator,
} from './_nextOperator';

import {
  MotionMemorable,
  withRemember,
} from './_remember';

import {
  MotionReadable,
  withRead,
} from './_read';

export type ObservableWithFoundationalMotionOperators<T> = MotionNextOperable<T> & MotionMappable<T>
    & MotionFilterable<T> & MotionMemorable<T> & MotionDebounceable<T> & MotionReadable<T>;

export function withFoundationalMotionOperators<T, S extends Constructor<Observable<T>>>(superclass: S): S
    & Constructor<ObservableWithFoundationalMotionOperators<T>> {
  // Not sure if withMap needs to be specialized.  Trying results in this error:
  //     Type 'Constructor<MotionNextOperable<T>> &
  //     Constructor<MotionMappable<T>>' is not assignable to type 'S &
  //     Constructor<MotionNextOperable<T>>'.
  //       Type 'Constructor<MotionNextOperable<T>> &
  //       Constructor<MotionMappable<T>>' is not assignable to type 'S'.
  return withRead(withDebounce(withRemember(withFilter(withMap(withNextOperator<T, S>(superclass))))));
}

export * from './_debounce';
export * from './_filter';
export * from './_map';
export * from './_nextOperator';
export * from './_remember';
export * from './_read';
