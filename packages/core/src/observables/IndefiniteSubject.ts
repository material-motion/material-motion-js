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
  ObserverOrNext,
  Subscription,
} from 'indefinite-observable';

import {
  MemorylessIndefiniteSubject,
} from './MemorylessIndefiniteSubject';

/**
 * An `IndefiniteSubject` is both an `Observer` and an `Observable`.  Whenever
 * it receives a value on `next`, it forwards that value to any subscribed
 * observers.
 *
 * `IndefiniteSubject` also remembers the most recent value dispatched and
 * passes it to any new subscriber.
 */
export class IndefiniteSubject<T> extends MemorylessIndefiniteSubject<T> {
  _lastValue: T;
  _hasStarted: boolean = false;

  /**
   * Passes the supplied value to any currently-subscribed observers.  If an
   * observer `subscribe`s before `next` is called again, it will immediately
   * receive `value`.
   */
  next(value: T): void {
    this._hasStarted = true;
    this._lastValue = value;

    super.next(value);
  }

  /**
   * `subscribe` accepts either a function or an object with a next method.
   * `subject.next` will forward any value it receives to the function or method
   * provided here.
   *
   * Call the returned `unsubscribe` method to stop receiving values on this
   * particular observer.
   */
  subscribe(observerOrNext: ObserverOrNext<T>): Subscription {
    const subscription = super.subscribe(observerOrNext);

    if (this._hasStarted) {
      observerOrNext.next
        ? observerOrNext.next(this._lastValue)
        : observerOrNext(this._lastValue);
    }

    return subscription;
  }
}
export default IndefiniteSubject;
