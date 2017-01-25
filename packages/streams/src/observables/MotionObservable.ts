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
  NextOperation,
  StateChannel,
} from '../types';

export enum State {
  AT_REST = 0,
  ACTIVE = 1,
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

  subscribe(observerOrNext: MotionObserverOrNext<T>): Subscription {
    // To make operators observer-agnostic, they should receive a state channel
    // even if the underlying observer doesn't have one.
    let observer: MotionObserver<T>;

    if (typeof observerOrNext === 'function') {
      observer = {
        next: observerOrNext,
        state() {}
      };
    } else {
      observer = observerOrNext;
    }

    return super.subscribe(observer);
  }

  /**
   * Extracts the value at a given key from every incoming object and passes
   * those values to the observer.
   *
   * For instance:
   *
   * - `transform$.pluck('translate')` is equivalent to
   *   `transform$.map(transform => transform.translate)`
   *
   * - `transform$.pluck('translate.x')` is equivalent to
   *   `transform$.map(transform => transform.translate.x)`
   */
  pluck<U>(key: string): MotionObservable<U> {
    const keySegments = key.split('.');

    return this._map(
      // TODO: fix the type annotations
      (value: {[k: string]: any }) => {
        let result = value;

        for (let keySegment of keySegments) {
          result = result[keySegment];
        }

        return result;
      }
    );
  }

  /**
   * Logs every value that passes through this section of the stream, and passes
   * them downstream.
   *
   * Adding `log` to stream chain should have no effect on the rest of the
   * chain.
   */
  log(): MotionObservable<T> {
    return this._nextOperator(
      (value: T, nextChannel: NextChannel<T>) => {
        console.log(value);
        nextChannel(value);
      }
    );
  }

  /**
   * Applies `transform` to every incoming value and synchronously passes the
   * result to the observer.
   */
  _map<U>(transform: (value: T) => U): MotionObservable<U> {
    return this._nextOperator(
      (value: T, nextChannel: NextChannel<U>) => {
        nextChannel(transform(value));
      }
    );
  }

  /**
   * Applies `predicate` to every incoming value and synchronously passes values
   * that return `true` to the observer.
   */
  _filter(predicate: (value: T) => boolean): MotionObservable<T> {
    return this._nextOperator(
      (value: T, nextChannel: NextChannel<T>) => {
        if (predicate(value)) {
          nextChannel(value);
        }
      }
    );
  }

  /**
   * Limits the number of dispatches to one per frame.
   *
   * When it receives a value, it waits until the next frame to dispatch it.  If
   * more than one value is received whilst awaiting the frame, the most recent
   * value is dispatched and the intermediaries are forgotten.
   *
   * Since no rendering will happen until `requestAnimationFrame` is called, it
   * should be safe to `_debounce()` without missing a frame.
   */
  _debounce(): MotionObservable<T> {
    let queuedFrameID: number;
    let lastValue: T;

    return this._nextOperator(
      (value: T, nextChannel: NextChannel<T>) => {
        lastValue = value;

        if (!queuedFrameID) {
          queuedFrameID = requestAnimationFrame(
            () => {
              nextChannel(lastValue);
              queuedFrameID = 0;
            }
          );
        }
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
  _nextOperator<U>(operation: NextOperation<T, U>): MotionObservable<U> {
    // Ensures that any subclass makes instances of itself rather than of
    // MotionObservable
    //
    // TypeScript doesn't seem to know what the type of this.constructor is, so
    // we explicitly tell it here.
    return new (this.constructor as typeof MotionObservable)<U>(
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

export default MotionObservable;
