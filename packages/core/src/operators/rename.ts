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

import {
  isDefined,
} from '../typeGuards';

export interface MotionRenameable<T> {
  rename<
    K extends keyof T,
    V extends T[K],
    M extends {[P in K]: string},
    R extends M[K],
    U extends {[P in R]: V}
  >(mapping: M): ObservableWithMotionOperators<U>;
  rename<
    K extends keyof T,
    V extends T[K],
    M extends {[P in K]: string},
    R extends M[K],
    U extends {[P in R]: V}
  >(kwargs: { mapping: M }): ObservableWithMotionOperators<U>;
}

export function withRename<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionRenameable<T>> {
  return class extends superclass implements MotionRenameable<T> {
    /**
     * Emits a copy of the upstream value, with its keys renamed according to
     * mapping.
     *
     * For instance:
     *
     * - `const point$ = dimensions$.rename({ width: 'x', height: 'y' });`
     */
    rename<
      K extends keyof T,
      V extends T[K],
      M extends {[P in K]: string},
      R extends M[K],
      U extends {[P in R]: V}
    >(mapping: M): ObservableWithMotionOperators<U>;
    rename<
      K extends keyof T,
      V extends T[K],
      M extends {[P in K]: string},
      R extends M[K],
      U extends {[P in R]: V}
    >(kwargs: { mapping: M }): ObservableWithMotionOperators<U>;
    rename<
      K extends keyof T,
      V extends T[K],
      M extends {[P in K]: string},
      R extends M[K],
      U extends {[P in R]: V}
    >(mapping: M & { mapping: M }): ObservableWithMotionOperators<U> {
      if (mapping.mapping && Object.keys(mapping).length === 1) {
        mapping = mapping.mapping as typeof mapping;
      }

      return this._map({
        transform(value) {
          const result = {} as U;

          Object.entries(mapping).forEach(
            ([oldKey, newKey]) => {
              if (value.hasOwnProperty(oldKey)) {
                (result as any)[newKey] = value[oldKey as K];
              }
            }
          );

          return result;
        }
      });
    }
  };
}
