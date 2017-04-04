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
} from '../../observables/MotionObservable';

import {
  Constructor,
  NextOperation,
  Observable,
  Observer,
  Subscription,
} from '../../types';

export interface MotionRememberable<T> extends Observable<T> {
  _remember(): Observable<T>;
}

export function withRemember<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionRememberable<T>> {
  return class extends superclass implements MotionRememberable<T> {
    /**
     * Remembers the most recently dispatched value and synchronously
     * dispatches it to all new subscribers.
     *
     * `_remember()` is also useful for ensuring that expensive operations only
     * happen once per dispatch, sharing the resulting value with all observers.
     */
    _remember(): Observable<T> {
      // Keep track of all the observers who have subscribed,
      // so we can notify them when we get new values.
      const observers = new Set();
      let subscription: Subscription | undefined;
      let lastValue: T;
      let hasStarted = false;

      const constructor = this.constructor as Constructor<Observable<T>>;

      return new constructor(
        (observer: Observer<T>) => {
          // If we already know about this observer, we don't
          // have to do anything else.
          if (observers.has(observer)) {
            console.warn(
              'observer is already subscribed; ignoring',
              observer
            );
            return;
          }

          // Whenever we have at least one subscription, we
          // should be subscribed to the parent stream (this).
          if (!observers.size) {
            subscription = this.subscribe(
              (value: T) => {
                // The parent stream has dispatched a value, so
                // pass it along to all the children, and cache
                // it for any observers that subscribe before
                // the next dispatch.
                observers.forEach(
                  observer => observer.next(value)
                );

                hasStarted = true;
                lastValue = value;
              }
            );
          }

          observers.add(observer);

          if (hasStarted) {
            observer.next(lastValue);
          }

          return () => {
            observers.delete(observer);

            if (!observers.size && subscription) {
              subscription.unsubscribe();
              subscription = undefined;
            }
          };
        }
      );
    }
  };
}
