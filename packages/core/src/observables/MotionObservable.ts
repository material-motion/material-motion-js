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

import * as deepEqual from 'deep-equal';

import {
  IndefiniteObservable,
  Observer,
} from 'indefinite-observable';

import {
  Constructor,
  Dict,
  NextChannel,
  NextOperation,
  Observable,
  Subscription,
  equalityCheck,
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

  /**
   * Dispatches:
   * - false when it receives true,
   * - true when it receives false,
   * - 0 when it receives 1, and
   * - 1 when it receives 0.
   */
  inverted(): MotionObservable<T> {
    return this._nextOperator(
      (value: T, dispatch: NextChannel<T>) => {
        switch (value) {
          case 0:
            dispatch(1);
            break;

           case 1:
            dispatch(0);
            break;

           case false:
            dispatch(true);
            break;

           case true:
            dispatch(false);
            break;

          default:break;
        }
      }
    );
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
  pluck<U>(path: string): MotionObservable<U> {
    return this._map(
      createPlucker(path)
    );
  }

  /**
   * Ensures that every value dispatched is different than the previous one.
   */
  dedupe(areEqual: equalityCheck = deepEqual): MotionObservable<T> {
    let dispatched = false;
    let lastValue: T;

    return this._nextOperator(
      (value: T, dispatch: NextChannel<T>) => {
        if (dispatched && areEqual(value, lastValue)) {
          return;
        }

        // To prevent a potential infinite loop, these flags must be set before
        // dispatching the result to the observer
        lastValue = value;
        dispatched = true;

        dispatch(value);
      }
    )._remember() as MotionObservable<T>;
  }

  /**
   * Logs every value that passes through this section of the stream, and passes
   * them downstream.  Adding `log` to stream chain should have no effect on the
   * rest of the chain.
   *
   * If `label` is specified, its value will be added to each log.  For
   * instance, `number$.log('id')` would log `id 1`, `id 2`, etc.
   *
   * If `pluckPath` is specified, the value at that path will be logged for each
   * item `log()` receives.  For instance, if `log('Name:', 'item.name')`
   * received this value:
   *
   *     { item: { type: 'fruit', name: 'banana' }, count: 2 }
   *
   * it would log `Name: banana`.
   */
  log(label: string = '', pluckPath: string = ''): MotionObservable<T> {
    let plucker: (value: T) => any;

    if (pluckPath) {
      plucker = createPlucker(pluckPath);
    }

    return this._nextOperator(
      (value: T, nextChannel: NextChannel<T>) => {
        if (plucker) {
          value = plucker(value);
        }

        console.log(label, value);
        nextChannel(value);
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
   * Returns the current value of an observable property (e.g. a subject or
   * remembered stream).
   */
  _read(): T {
    let result: T;

    this.subscribe(
      (value: T) => {
        result = value;
      }
    ).unsubscribe();

    return result;
  }
}

// TODO: fix the type annotations
function createPlucker(path: string) {
  const pathSegments = path.split('.');

  return function plucker(value: Dict<any>) {
    let result = value;

    for (let pathSegment of pathSegments) {
      result = result[pathSegment];
    }

    return result;
  };
}

export default MotionObservable;

export type MapRangeArgs = {
  fromStart: number,
  fromEnd: number,
  toStart: number,
  toEnd: number,
};
