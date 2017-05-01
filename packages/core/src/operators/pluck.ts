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
  NextChannel,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionPluckable<T extends Record<K, {}>, K extends string> {
  pluck(key: K): ObservableWithMotionOperators<T[K]>;
}

export function withPluck<T extends Record<K, {}>, S extends Constructor<MotionMappable<T>>, K extends string>(superclass: S): S & Constructor<MotionPluckable<T, K>> {
  return class extends superclass implements MotionPluckable<T, K> {
    /**
     * Extracts the value at a given key from every incoming object and passes
     * those values to the observer.
     *
     * For instance:
     *
     * - `transform$.pluck('translate')` is equivalent to
     *   `transform$.map(transform => transform.translate)`
     *
     * - `transform$.pluck('translate.x')` is equivalent to
     *   `transform$.map(transform => transform.translate.x)`
     */
    pluck(path: K): ObservableWithMotionOperators<T[K]> {
      return this._map(
        createPlucker(path)
      );
    }
  };
}

export function createPlucker<K extends string>(path: K) {
  const pathSegments = path.split('.');

  return function plucker<T extends Record<K, {}>>(value: T): T[K] {
    let result: T[K] = value;

    for (let pathSegment of pathSegments) {
      result = result[pathSegment];
    }

    return result;
  };
}
