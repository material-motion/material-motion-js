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
  isMap,
  isObservable,
  isTimestamped,
} from '../typeGuards';

import {
  Constructor,
  Dict,
  MotionReactiveNextOperable,
  MotionTimestampable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
  Timestamped,
} from '../types';

import {
  timestamp,
} from './timestamp';

export type RewritableOptions<U> = Partial<{
  defaultValue: U | symbol,
  emitOnKeyChange: boolean,
}>;

export type RewriteArgs<T, R, U> = RewritableOptions<U> & {
  mapping: Dict<R> | Map<T, R>,
};

export interface MotionRewritable<T> {
  rewrite<U, R extends U | ObservableWithMotionOperators<U>>(kwargs: RewriteArgs<T, R, U>): ObservableWithMotionOperators<U>;
}

export const SUPPRESS_FAILURES = Symbol();

export function withRewrite<T, S extends Constructor<MotionReactiveNextOperable<T> & MotionTimestampable<T>>>(superclass: S): S & Constructor<MotionRewritable<T>> {
  return class extends superclass implements MotionRewritable<T> {
    rewrite<U, R extends U | ObservableWithMotionOperators<U>>({ mapping, defaultValue = SUPPRESS_FAILURES, emitOnKeyChange = true }: RewriteArgs<T, R, U>): ObservableWithMotionOperators<U> {
      let keys: Array<string> | Array<T>;
      let values: Array<U | ObservableWithMotionOperators<U> | Timestamped<U> | Timestamped<ObservableWithMotionOperators<U>>>;
      let castKeysToStrings = false;

      if (isMap(mapping)) {
        keys = Array.from(mapping.keys());
        values = Array.from(mapping.values());
      } else {
        keys = Object.keys(mapping);
        values = Object.values(mapping);
        castKeysToStrings = true;
      }

      let upstream: MotionReactiveNextOperable<T | Timestamped<T>> = this;

      if (!emitOnKeyChange) {
        values = values.map(
          value => isObservable(value)
            ? value.timestamp()
            : timestamp(value)
        ) as Array<Timestamped<U>>;
        upstream = this.timestamp();
      }

      return upstream._reactiveNextOperator({
        operation: ({ emit }) => ({ upstream: currentKey, ...currentValues }) => {
          if (currentKey !== undefined) {
            let key: string | T = isTimestamped(currentKey)
              ? currentKey.value
              : currentKey;

            if (castKeysToStrings) {
              key = key.toString();
            }

            // TypeScript can't do Array<string | T>.indexOf(string | T), so we
            // force it to pick one.  Doesn't matter, since the result is a
            // number either way.
            const index = (keys as Array<T>).indexOf(key as T);

            if (index === -1) {
              if (defaultValue !== SUPPRESS_FAILURES) {
                emit(defaultValue as U);
              }
            } else {
              const currentValue = (currentValues as Array<U>)[index];

              // Wait until both the currentKey and currentValue have been
              // defined before emitting.  This also presumes that the author
              // is not intentionally rewriting to undefined.
              if (currentValue !== undefined) {
                const value = isTimestamped(currentValue)
                  ? currentValue.value
                  : currentValue;

                // Prevent stale values from being emitted by only forwarding
                // values that are newer than the key, unless
                // emitOnKeyChange is set (which will omit the timestamps).
                if (!isTimestamped(currentValue) || currentValue.timestamp > (currentKey as Timestamped<T>).timestamp) {
                  emit(value);
                }
              }
            }
          }
        },
        inputs: values,
        waitForAllValues: false
      });
    }
  };
}
