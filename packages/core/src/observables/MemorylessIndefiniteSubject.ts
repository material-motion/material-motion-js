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

import $$observable from 'symbol-observable';

import wrapWithObserver from 'indefinite-observable/dist/wrapWithObserver';

import {
  Observable,
  Observer,
  ObserverOrNext,
  Subscription,
} from 'indefinite-observable';

/**
 * A `MemorylessIndefiniteSubject` is both an `Observer` and an `Observable`.
 * Whenever it receives a value on `next`, it forwards that value to any
 * subscribed observers.
 */
export class MemorylessIndefiniteSubject<T> implements Observable<T>, Observer<T> {
  // Keep track of all the observers who have subscribed, so we can notify them
  // when we get new values.  Note: JavaScript's Set collection is ordered.
  _observers: Set<Observer<T>> = new Set();

  /**
   * Passes the supplied value to any currently-subscribed observers.
   */
  next(value: T) {
    // The parent stream has emitted a value, so pass it along to all the
    // children, and cache it for any observers that subscribe before the next
    // emission.
    this._observers.forEach(
      (observer: Observer<T>) => observer.next(value)
    );
  }

  /**
   * `subscribe` accepts either a function, or an object with a `next` method.
   * `subject.next` will forward any value it receives to the function or method
   * provided here.
   *
   * Call the returned `unsubscribe` method to stop receiving values on this
   * particular observer.
   */
  subscribe(observerOrNext: ObserverOrNext<T>): Subscription {
    const observer = wrapWithObserver<T>(observerOrNext);

    this._observers.add(observer);

    return {
      unsubscribe: () => {
        this._observers.delete(observer);
      }
    };
  }

  /**
   * Tells other libraries that know about observables that we are one.
   *
   * https://github.com/tc39/proposal-observable#observable
   */
  [$$observable](): Observable<T> {
    return this;
  }
}
export default MemorylessIndefiniteSubject;
