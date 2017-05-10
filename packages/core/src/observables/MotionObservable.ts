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
  IndefiniteObservable,
  Observer,
} from 'indefinite-observable';

import {
  Observable,
  Subscription,
} from '../types';

import {
  ObservableWithMotionOperators,
  withMotionOperators,
} from '../operators';

import {
  fulfillProxies,
} from './fulfillProxies';

export class BaseMotionObservable<T> extends IndefiniteObservable<T> {
  /**
   * Creates a new `MotionObservable` that dispatches whatever values it
   * receives from the provided stream.
   *
   * This is useful for imbuing another type of `Observable`, like an
   * `IndefiniteSubject`, with the operators present on `MotionObservable`.
   */
  static from<T>(stream: Observable<T>): MotionObservable<T> {
    return new MotionObservable<T>(
      (observer: Observer<T>) => {
        const subscription: Subscription = stream.subscribe(observer);

        return subscription.unsubscribe;
      }
    );
  }
}

/**
 * `MotionObservable` is an extension of `IndefiniteObservable` that includes
 * a series of purely-declarative operators that are useful for building
 * animated interactions.  Those operators are specified in the
 * [Starmap](https://material-motion.github.io/material-motion/starmap/specifications/operators/)
 */
export interface MotionObservable<T> extends IndefiniteObservable<T>, ObservableWithMotionOperators<T> {}
export const MotionObservable = withMotionOperators(BaseMotionObservable);
export default MotionObservable;

// See explanation in `./proxies`
try {
  fulfillProxies();
} catch (error) {}
