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
  MotionObservable,
} from '../../observables/proxies';

import {
  CombineLatestOptions,
  combineLatest,
} from '../../combineLatest';

import {
  isObservable
} from '../../typeGuards';

import {
  Constructor,
  EmittingOperation,
  MaybeReactive,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Subscription,
} from '../../types';

export type _ReactiveNextOperatorArgs<T, D, U> = CombineLatestOptions & {
  operation: EmittingOperation<T, D, U>,
  inputs: MaybeReactive<D>,
}

export interface MotionReactiveNextOperable<T> extends Observable<T> {
  _reactiveNextOperator<U, D>(kwargs: _ReactiveNextOperatorArgs<T, D, U>): ObservableWithMotionOperators<U>;
}

export function withReactiveNextOperator<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionReactiveNextOperable<T>> {
  return class extends superclass implements MotionReactiveNextOperable<T> {
    /**
     * Similar to `_nextOperator`, but listens for values not just from
     * upstream, but also on any arguments it receives.
     *
     * It calls `operation` with the most recent values from upstream and from
     * the other arguments.  Arguments that aren't reactive will be passed
     * through as-they-are.  Arguments that are reactive will cause `operation`
     * to be called again for each value they emit.
     *
     * `_reactiveNextOperator` will not call `operation` until it has received
     * a value from every argument it is subscribed to.
     */
    _reactiveNextOperator<U, D>({ operation, inputs, ...combineLatestOptions }: _ReactiveNextOperatorArgs<T, D, U>): ObservableWithMotionOperators<U> {
      return new MotionObservable(
        (observer: Observer<U>) => {
          const innerOperation = operation({
            emit: observer.next.bind(observer),
          });

          // TODO: verify this is the correct type.
          //
          // I added `{upstream: Observable<T>}` because otherwise `inputs` was
          // getting inferred to require an `upstream` at a callsite.  This
          // appears to fix it, but I haven't taken the time to reason if it's
          // correct.
          return combineLatest<D, MaybeReactive<D> & {upstream: Observable<T>}>(
            // TypeScript doesn't like ...inputs, so we use the longhand version
            Object.assign(
              { upstream: this },
              inputs,
            ),
            combineLatestOptions
          ).subscribe(
            innerOperation
          ).unsubscribe;
        }
      );
    }
  };
}
