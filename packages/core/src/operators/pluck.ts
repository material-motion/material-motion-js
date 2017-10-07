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

export interface MotionPluckable<T> {
  pluck<K extends keyof T, U extends T[K]>(key: K): ObservableWithMotionOperators<U>;
}

export function withPluck<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionPluckable<T>> {
  return class extends superclass implements MotionPluckable<T> {
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
    pluck<K extends keyof T, U extends T[K]>(path: K): ObservableWithMotionOperators<U> {
      return (this as any as ObservableWithMotionOperators<Record<K, any>>)._map({
        transform: createPlucker<K>(path)
      });
    }
  };
}

export function createPlucker<K extends string>(path: K) {
  const pathSegments = path.split('.');

  return function plucker<T extends Record<K, any>>(value: T): T[K] {
    let result: T[K] = value;

    for (const pathSegment of pathSegments) {
      result = result[pathSegment];
    }

    return result;
  };
}
