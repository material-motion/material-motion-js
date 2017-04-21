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
  Dict,
  MotionMappable,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionRewritable<T> {
  rewrite<U>(dict: Dict<U>): ObservableWithMotionOperators<U>;
  rewrite<U>(dict: Map<T, U>): ObservableWithMotionOperators<U>;
}

export function withRewrite<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionRewritable<T>> {
  return class extends superclass implements MotionRewritable<T> {
    rewrite<U>(dict: Dict<U>): ObservableWithMotionOperators<U>;
    rewrite<U>(dict: Map<T, U>): ObservableWithMotionOperators<U> {
      return this._map(
        (key: T) => typeof dict.get === 'function'
          ? dict.get(key)
          : dict[key]
      );
    }
  };
}
