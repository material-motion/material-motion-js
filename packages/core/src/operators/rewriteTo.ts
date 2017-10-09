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
  MotionReactiveMappable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
} from '../types';

import {
  isDefined,
} from '../typeGuards';

import {
  _ReactiveMapOptions,
} from './foundation/_reactiveMap';

export type RewriteToValue<U> = U | Observable<U>;
export type RewriteToArgs<U> = _ReactiveMapOptions & {
  value$: RewriteToValue<U>,
};

export interface MotionRewriteToable {
  rewriteTo<U>(kwargs: RewriteToArgs<U>): ObservableWithMotionOperators<U>;
  rewriteTo<U>(value$: RewriteToValue<U>): ObservableWithMotionOperators<U>;
}

export function withRewriteTo<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionRewriteToable> {
  return class extends superclass implements MotionRewriteToable {
    /**
     * Dispatches its argument every time it receives a value from upstream.
     */
    rewriteTo<U>(value$: RewriteToValue<U>): ObservableWithMotionOperators<U>;
    rewriteTo<U>(kwargs: RewriteToArgs<U>): ObservableWithMotionOperators<U>;
    rewriteTo<U>({ value$, onlyDispatchWithUpstream = true, ...reactiveMapOptions }: RewriteToArgs<U>): ObservableWithMotionOperators<U> {
      if (!isDefined(value$)) {
        value$ = arguments[0];
      }

      return this._reactiveMap({
        transform: ({ value }) => value,
        inputs: {
          value: value$
        },
        onlyDispatchWithUpstream,
        ...reactiveMapOptions,
      });
    }
  };
}
