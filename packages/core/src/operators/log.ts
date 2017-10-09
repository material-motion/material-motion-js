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
  MotionTappable,
  ObservableWithMotionOperators,
} from '../types';

import {
  createPlucker,
} from './pluck';

export type LogArgs = Partial<{
  label: string,
  pluckPath: string,
}>;

export interface MotionLoggable<T> {
  log(kwargs?: LogArgs): ObservableWithMotionOperators<T>;
  log(label?: string): ObservableWithMotionOperators<T>;
}

export function withLog<T, S extends Constructor<MotionTappable<T>>>(superclass: S): S & Constructor<MotionLoggable<T>> {
  return class extends superclass implements MotionLoggable<T> {
    /**
     * Logs every value that passes through this section of the stream, and passes
     * them downstream.  Adding `log` to stream chain should have no effect on the
     * rest of the chain.
     *
     * If `label` is specified, its value will be added to each log.  For
     * instance, `number$.log('id')` would log `id 1`, `id 2`, etc.
     *
     * If `pluckPath` is specified, the value at that path will be logged for each
     * item `log()` receives.  For instance, if `log('Name:', 'item.name')`
     * received this value:
     *
     *     { item: { type: 'fruit', name: 'banana' }, count: 2 }
     *
     * it would log `Name: banana`.
     */
    log(label: string): ObservableWithMotionOperators<T>;
    log(kwargs: LogArgs): ObservableWithMotionOperators<T>;
    log(kwargs = {}): ObservableWithMotionOperators<T> {
      const {
        label = '',
        pluckPath = '',
      } = kwargs as LogArgs;

      let plucker: (value: T) => any | undefined;

      if (pluckPath) {
        plucker = createPlucker(pluckPath);
      }

      return this._tap({
        sideEffect({ upstream: value }) {
          if (plucker) {
            value = plucker(value);
          }

          console.log(label, value);
        }
      });
    }
  };
}
