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

export type RewritableOptions<U> = {
  defaultValue?: U | symbol,
  dispatchOnKeyChange?: boolean,
};
export interface MotionRewritable<T> {
  rewrite<U, R extends U | ObservableWithMotionOperators<U>>(dict: Dict<R> | Map<T, R>, options?: RewritableOptions<U>): ObservableWithMotionOperators<U>;
}

export const SUPPRESS_FAILURES = Symbol();

export function withRewrite<T, S extends Constructor<MotionReactiveNextOperable<T> & MotionTimestampable<T>>>(superclass: S): S & Constructor<MotionRewritable<T>> {
  return class extends superclass implements MotionRewritable<T> {
    rewrite<U, R extends U | ObservableWithMotionOperators<U>>(dict: Dict<R> | Map<T, R>, { defaultValue = SUPPRESS_FAILURES, dispatchOnKeyChange = true }: RewritableOptions<U> = {}): ObservableWithMotionOperators<U> {
      let keys: Array<string> | Array<T>;
      let values: Array<U | ObservableWithMotionOperators<U> | Timestamped<U> | Timestamped<ObservableWithMotionOperators<U>>>;
      let castKeysToStrings = false;

      if (isMap(dict)) {
        keys = Array.from(dict.keys());
        values = Array.from(dict.values());
      } else {
        keys = Object.keys(dict);
        values = Object.values(dict);
        castKeysToStrings = true;
      }

      let upstream: MotionReactiveNextOperable<T> & MotionTimestampable<T> = this;

      if (!dispatchOnKeyChange) {
        values = values.map(
          value => isObservable(value)
            ? value.timestamp()
            : timestamp(value)
        );
        upstream = this.timestamp();
      }

      return upstream._reactiveNextOperator(
        (dispatch: NextChannel<U>, currentKey: undefined | string | T | Timestamped<string | T>, ...currentValues: Array<undefined | U | Timestamped<U>>) => {
          if (currentKey !== undefined) {
            let key: string | T = isTimestamped(currentKey)
              ? currentKey.value
              : currentKey;

            if (castKeysToStrings) {
              key = key.toString();
            }

            const index = keys.indexOf(key);

            if (index === -1) {
              if (defaultValue !== SUPPRESS_FAILURES) {
                dispatch(defaultValue as U);
              }
            } else {
              const currentValue = currentValues[index];

              // Wait until both the currentKey and currentValue have been
              // defined before dispatching.  This also presumes that the author
              // is not intentionally rewriting to undefined.
              if (currentValue !== undefined) {
                const value = isTimestamped(currentValue)
                  ? currentValue.value
                  : currentValue;

                // Prevent stale values from being dispatched by only forwarding
                // values that are newer than the key, unless dispatchOnKeyChange is
                // set (which will omit the timestamps).
                if (!isTimestamped(currentValue) || currentValue.timestamp > (currentKey as Timestamped<T>).timestamp) {
                  dispatch(value);
                }
              }
            }
          }
        },
        values,
        { waitForAllValues: false }
      );
    }
  };
}
