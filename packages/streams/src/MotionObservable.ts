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
  NextChannel,
  Subscription,
} from 'indefinite-observable';

import {
  MotionConnect,
  MotionObserver,
  MotionObserverOrNext,
  Operation,
  StateChannel,
} from './types';

export enum State {
  atRest,
  active,
}

/**
 * MotionObservable is an Observable with two channels, `next` and `state`.
 * If this stream's source is active, `state` should dispatch `1`.  When it
 * comes to rest, `state` should dispatch `0`.
 */
export class MotionObservable<T> extends IndefiniteObservable<T> {
  constructor(connect: MotionConnect<T>) {
    super(connect);
  }

  /**
   * Applies the predicate `transform` to every incoming value and synchronously
   * passes the result to the observer.
   */
  _map<U>(transform: (value: T) => U): MotionObservable<U> {
    return this._nextOperator(
      (value: T, nextChannel: NextChannel<U>) => {
        nextChannel(transform(value));
      }
    );
  }

  /**
   * `_nextOperator` is sugar for creating an operator that reads and writes
   * from the `next` channel.  It encapsulates the stream creation and
   * subscription boilerplate required for most operators.
   *
   * Its argument `operation` should receive a value from the parent stream's
   * `next` channel, transform it, and use the supplied callback to dispatch
   * the result to the observer's `next` channel.
   */
  _nextOperator<U>(operation: Operation<T, U>): MotionObservable<U> {
    return new MotionObservable<U>(
      (observer: MotionObserver<U>) => {
        const subscription = this.subscribe({
          state: observer.state,
          next: (value: T) => operation(value, observer.next),
        });

        return subscription.unsubscribe;
      }
    );
  }
}

export interface MotionObservable<T> {
  subscribe(observerOrNext: MotionObserverOrNext<T>): Subscription;
}

export default MotionObservable;
