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
  Constructor,
  NextChannel,
  NextOperation,
  Observable,
  Subscription,
} from '../types';

import {
  ObservableWithMotionOperators,
  withMotionOperators,
} from '../operators';

// Mixins and generics don't work together yet:
//
// https://github.com/Microsoft/TypeScript/issues/13807
//
// In the mean time, we can work around this by passing `any` where `T` ought to
// be and mixing our observable together before extending it.
export type ShouldBeT = any;
export const MixedTogetherObservable: Constructor<ObservableWithMotionOperators<ShouldBeT>> = withMotionOperators<ShouldBeT, Constructor<Observable<ShouldBeT>>>(IndefiniteObservable);

/**
 * `MotionObservable` is an extension of `IndefiniteObservable` that includes
 * a series of purely-declarative operators that are useful for building
 * animated interactions.  Those operators are specified in the
 * [Starmap](https://material-motion.github.io/material-motion/starmap/specifications/operators/)
 */
export class MotionObservable<T> extends MixedTogetherObservable {
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

  /**
   * Dispatches values as it receives them, both from upstream and from any
   * streams provided as arguments.
   */
  merge(...otherStreams: Array<Observable<any>>):MotionObservable<any> {
    return new MotionObservable<any>(
      (observer: Observer<any>) => {
        const subscriptions = [this, ...otherStreams].map(
          stream => stream.subscribe(observer)
        );

        return () => {
          subscriptions.forEach(
            subscription => subscription.unsubscribe()
          );
        };
      }
    );
  }

  /**
   * Receives a value from upstream, linearly interpolates it between the given
   * ranges, and dispatches the result to the observer.
   */
  mapRange({ fromStart, fromEnd, toStart = 0, toEnd = 1 }: MapRangeArgs):MotionObservable<number> {
    return this._nextOperator(
      (value: number, dispatch: NextChannel<number>) => {
        const fromRange = fromStart - fromEnd;
        const fromProgress = (value - fromEnd) / fromRange;
        const toRange = toStart - toEnd;

        dispatch(toEnd + fromProgress * toRange);
      }
    );
  }

  /**
   * Dispatches its argument every time it receives a value from upstream.
   */
  mapTo<U>(value: U):MotionObservable<U> {
    return this._nextOperator(
      // TypeScript gets mad if you omit a variable, so we use `_` for variables
      // we don't care bout
      (_, dispatch: NextChannel<U>) => {
        dispatch(value);
      }
    );
  }
}

export default MotionObservable;

export type MapRangeArgs = {
  fromStart: number,
  fromEnd: number,
  toStart: number,
  toEnd: number,
};
