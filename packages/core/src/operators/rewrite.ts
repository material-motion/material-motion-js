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
} from '../typeGuards';

import {
  Constructor,
  Dict,
  MotionReactiveNextOperable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionRewritable<T> {
  rewrite<U, R extends U | Observable<U>>(dict: Dict<R> | Map<T, R>): ObservableWithMotionOperators<U>;
}

export function withRewrite<T, S extends Constructor<MotionReactiveNextOperable<T>>>(superclass: S): S & Constructor<MotionRewritable<T>> {
  return class extends superclass implements MotionRewritable<T> {
    rewrite<U, R extends U | Observable<U>>(dict: Dict<R> | Map<T, R>): ObservableWithMotionOperators<U> {
      let keys: Iterable<string> | Iterable<T>;
      let values: Iterable<U | Observable<U>>;

      if (isMap(dict)) {
        keys = dict.keys();
        values = dict.values();
      } else {
        keys = Object.keys(dict);
        values = Object.values(dict);
      }

      const keyArray = Array.from(keys);

      return this._reactiveNextOperator(
        (dispatch: NextChannel<U>, key: string | T, ...valueArray: Array<U>) => {
          const index = keyArray.indexOf(key);
          dispatch(valueArray[index]);
        },
        ...values
      );
    }
  };
}
