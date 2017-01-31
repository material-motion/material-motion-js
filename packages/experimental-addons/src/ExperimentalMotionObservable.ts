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
  Dict,
  MotionConnect,
  MotionObservable,
  MotionObserver,
  NextChannel,
  Observable,
  Subscription,
  isObservable,
} from 'material-motion-streams';

import {
  equalityCheck,
} from './types';

/**
 * MotionObservable, with experimental operators
 */
export class ExperimentalMotionObservable<T> extends MotionObservable<T> {
  static from<T>(stream: Observable<T>): ExperimentalMotionObservable<T> {
    return new ExperimentalMotionObservable<T>(
      (observer: MotionObserver<T>) => {
        const subscription: Subscription = stream.subscribe(observer);

        return subscription.unsubscribe;
      }
    );
  }

  static combineLatestFromDict<T extends Dict<any>>(dict: Dict<Observable<any> | any>) {
    return new ExperimentalMotionObservable(
      (observer: MotionObserver<T>) => {
        const outstandingKeys = new Set(Object.keys(dict));

        const nextValue: T = {};
        const subscriptions: Dict<Subscription> = {};

        outstandingKeys.forEach(checkKey);

        function checkKey(key) {
          const maybeStream = dict[key];

          if (isObservable(maybeStream)) {
            subscriptions[key] = maybeStream.subscribe(
              (value: any) => {
                outstandingKeys.delete(key);

                nextValue[key] = value;
                dispatchNextValue();
              }
            );
          } else {
            outstandingKeys.delete(key);

            nextValue[key] = maybeStream;
            dispatchNextValue();
          }
        }

        function dispatchNextValue() {
          if (!outstandingKeys.size) {
            observer.next(nextValue);
          }
        }

        dispatchNextValue();

        return function disconnect() {
          Object.values(subscriptions).forEach(
            subscription => subscription.unsubscribe()
          );
        };
      }
    );
  }
  // If we don't explicitly provide a constructor, TypeScript won't remember the
  // signature
  constructor(connect: MotionConnect<T>) {
    super(connect);
  }

  applyDiffs<T extends Dict<any>>(other$: Observable<Partial<T>>): ExperimentalMotionObservable<T> {
    let latestValue: T;
    let dispatch: NextChannel<T>;

    other$.subscribe(
      (partial: Partial<T>) => {
        latestValue = {
          ...latestValue,
          ...partial,
        };

        if (dispatch) {
          dispatch(latestValue);
        }
      }
    );

    return this._nextOperator(
      (value: T, nextChannel: NextChannel<T>) => {
        latestValue = value;

        dispatch = nextChannel;
        dispatch(latestValue);
      }
    ) as ExperimentalMotionObservable<T>;
  }

  /**
   * Ensures that every value dispatched is different than the previous one.
   */
  dedupe(areEqual: equalityCheck = deepEqual): ExperimentalMotionObservable<T> {
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
    ) as ExperimentalMotionObservable<T>;
  }

  /**
   * Listens to a second stream, and replaces every value it receives from
   * upstream with the latest value from the second stream.
   */
  mapToLatest<U>(value$: Observable<U>): ExperimentalMotionObservable<U> {
    return new ExperimentalMotionObservable(
      (observer: MotionObserver<U>) => {
        const subscriptions: Array<Subscription> = [];
        let lastValue: U;

        subscriptions.push(
          value$.subscribe(
            (value: U) => {
              lastValue = value;
            }
          )
        );

        subscriptions.push(
          this.subscribe({
            next(value: T) {
              observer.next(lastValue);
            },
            state: observer.state,
          })
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
   * Accepts a dictionary, keyed by numeric breakpoints.
   *
   * When it receives a new value from upstream, it will find the largest
   * breakpoint in the dictionary that is lower than the given input and pass
   * the value at that breakpoint to the observer.
   *
   * For instance,
   *
   * $.breakpointMap({
   *   [0]: 'a',
   *   [10]: 'b',
   *   [20]: 'c'
   * });
   *
   * would dispatch 'b' when $ dispatched 11 or 19, but 'c' for 20 or 374.
   */
  breakpointMap<U>(valuesByBreakpoint: Dict<U>): ExperimentalMotionObservable<U> {
    const breakpointPairs = Object.entries(valuesByBreakpoint).map(
      ([ key, value ]) => ([ parseFloat(key), value ])
    ).sort(
      ([a], [b]) => {
        if (a === Infinity) {
          return 1;

        } else if (b === Infinity) {
          return -1;

        } else {
          return a - b;
        }
      }
    );

    return this._nextOperator(
      (input: T, dispatch: NextChannel<U>) => {
        let result;

        for (let [breakpoint, output] of breakpointPairs) {
          if (input < breakpoint) {
            break;
          }

          result = output;
        }

        dispatch(result);
      }
    ).dedupe();
  }

  /**
   * Dispatches:
   * - false when it receives true,
   * - true when it receives false,
   * - 0 when it receives 1, and
   * - 1 when it receives 0.
   */
   invert<T extends (boolean | number)>(): ExperimentalMotionObservable<T> {
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
         }
       }
     ) as ExperimentalMotionObservable<T>;
   }

  /**
   * Casts incoming values to numbers, using parseFloat:
   * - "3.14" becomes 3.14
   * - truthy values (true, [], {}) become 1
   * - falsey values (false, null, undefined, and '') become 0
   * - NaN is passed through.
   */
  toNumber$(): ExperimentalMotionObservable<number> {
    return this._nextOperator(
      (value: any, dispatch: NextChannel<number>) => {
        if (Number.isNaN(value)) {
          dispatch(value);

        } else {
          let result = parseFloat(value);

          if (Number.isNaN(result)) {
            result = Number(Boolean(value));
          }

          dispatch(result);
        }
      }
    ) as ExperimentalMotionObservable<number>;
  }
}
export default ExperimentalMotionObservable;

