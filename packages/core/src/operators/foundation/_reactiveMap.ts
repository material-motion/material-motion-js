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
  MotionReactiveNextOperable,
  MotionTappable,
  NextChannel,
  ObservableWithMotionOperators,
} from '../../types';

export type ReactiveMappableOptions = {
  onlyDispatchWithUpstream?: boolean,
};
export interface MotionReactiveMappable<T> {
  _reactiveMap<U>(
    transform: (upstreamValue: T, ...args: Array<any>) => U,
    args: Array<any>,
    options?: ReactiveMappableOptions,
  ): ObservableWithMotionOperators<U>;
}

export function withReactiveMap<T, S extends Constructor<MotionReactiveNextOperable<T> & MotionTappable<T>>>(superclass: S): S & Constructor<MotionReactiveMappable<T>> {
  return class extends superclass implements MotionReactiveMappable<T> {
    /**
     * Whenever the upstream value or an argument's value changes,
     * `_reactiveMap` calls `transform` and synchronously passes the result to
     * the observer.
     *
     * If the `onlyDispatchWithUpstream` option is set, `transform` is only
     * called when the upstream value changes.
     */
    _reactiveMap<U>(transform: (upstreamValue: T, ...args: Array<any>) => U, args: Array<any>, { onlyDispatchWithUpstream = false }: ReactiveMappableOptions = {}): ObservableWithMotionOperators<U> {
      let upstreamChanged = false;

      return this._tap(
        () => {
          upstreamChanged = true;
        }
      )._reactiveNextOperator(
        (dispatch: NextChannel<U>, upstreamValue: T, ...argValues: Array<any>) => {
          if (upstreamChanged || !onlyDispatchWithUpstream) {
            dispatch(transform(upstreamValue, ...argValues));
          }
          upstreamChanged = false;
        },
        args
      );
    }
  };
}
