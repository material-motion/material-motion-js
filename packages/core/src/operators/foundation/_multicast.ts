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

/* This is a slightly-modified version of `_remember()` without its caching
 * of the last value.
 *
 * `_remember()` is the operator equivalent of `Subject`.  Subjects have two
 * behaviors:
 *
 * 1. Sending the same value to multiple observers, and
 * 2. Sending the most recent value to new observers.
 *
 * There are cases where the 2nd behavior is undesired (for instance, events are
 * typically only useful at the moment they occur).  Thus, `_multicast`, which
 * implements only operator pooling.
 *
 * To that same end, I expect to break `MemorylessSubject` out from
 * `IndefiniteSubject`.  It would be great to reuse that logic here, returning a
 * `MemorylessMotionSubject` from `_multicast()` - unfortunately, the circular
 * dependency problem outlined in https://github.com/material-motion/material-motion-js/issues/194
 * is currently blocking that.
 *
 * If the circular dependency problem is resolved, http://codereview.cc/D3169
 * can land, and this operator can be refactored to mirror it.
 */

import {
  MotionObservable,
} from '../../observables/proxies';

import {
  Constructor,
  NextOperation,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Subscription,
} from '../../types';

export interface MotionMulticastable<T> extends Observable<T> {
  _multicast(): ObservableWithMotionOperators<T>;
}

export function withMulticast<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionMulticastable<T>> {
  return class extends superclass implements MotionMulticastable<T> {
    /**
     * Ensures that upstream operations are shared among all observers.  This is
     * useful to avoid repeating expensive operations and ensuring that any
     * side effects that may occur upstream only happen once.
     */
    _multicast(): ObservableWithMotionOperators<T> {
      // Keep track of all the observers who have subscribed, so we can notify
      // them when we get new values.
      const observers = new Set();
      let subscription: Subscription | undefined;

      return new MotionObservable<T>(
        (observer: Observer<T>) => {
          observers.add(observer);

          // Whenever we have at least one subscription, we should be subscribed
          // to the parent stream (this).
          if (observers.size === 1) {
            subscription = this.subscribe(
              (value: T) => {
                // Upstream has dispatched a value, so pass it along to all the
                // observers.
                observers.forEach(
                  observer => observer.next(value)
                );
              }
            );
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
