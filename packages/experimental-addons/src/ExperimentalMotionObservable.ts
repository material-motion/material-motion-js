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
  Point2D,
  State,
  Subscription,
  isObservable,
} from 'material-motion-streams';

import {
  GestureRecognitionState,
} from './gestures/GestureRecognitionState';

import {
  ThresholdSide,
} from './ThresholdSide';

import {
  GestureRecognition,
  Timestamped,
  TranslationGestureRecognition,
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
    )._remember() as ExperimentalMotionObservable<T>;
  }

  /**
   * Transforms incoming `value` into `{ value, timestamp }`, where `timestamp`
   * is the number of milliseconds since `navigationStart`.
   */
  withTimestamp(): ExperimentalMotionObservable<Timestamped<T>> {
    return this._map(
      (value: T) => (
        {
          value,
          timestamp: performance.now()
        }
      )
    );
  }

  /**
   * Dispatches an array of the two most recent values, as long as at least two
   * incoming values have been received.
   */
  pairwise(): ExperimentalMotionObservable<Array<T>> {
    let prevValue: T;
    let ready = false;

    return this._nextOperator(
      (nextValue: T, dispatch: NextChannel<Array<T>>) => {
        if (ready) {
          dispatch([prevValue, nextValue]);
        }

        prevValue = nextValue;
        ready = true;
      }
    );
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
    );
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

// There are a couple sketches of what slidingThreshold might look like here.
//
// The first uses both min and max.  It should mostly work, except min and max
// need a way to be reset so if the user drags to 200, then back down to 100,
// they don't need to go to 260 to cross the threshold again.
//
// The second one is more correct - it uses a single threshold and only checks
// for the side of the threshold that it isn't already in.  The bug here is more
// subtle - if the user dragged down to -26 and back up to +26, slidingThreshold
// ought to dispatch, but it wouldn't until the user crossed +56.
//
// I'm leaving both for now, because the correct solution may be closer to the
// first, even though the second one is more correct now.
//
// Other potential solution:
// - Store lastSide, thresholdForAbove, and thresholdForBelow.
// - If lastSide === ABOVE,
//     - thresholdForBelow = max(value - distance, thresholdForBelow)
//     - if value < thresholdForBelow, nextSide = BELOW
// and vice-versa

  /**
   * Listens to a stream of numbers and
   */
  slidingThreshold(distance: number = 56): ExperimentalMotionObservable<ThresholdSide> {
    let min: number;
    let max: number;
    let lastSide: ThresholdSide;

    return this._nextOperator(
      (value: number, dispatch: NextChannel<ThresholdSide>) => {
        let nextSide;

        if (lastSide !== ThresholdSide.BELOW && value < max - distance) {
          nextSide = ThresholdSide.BELOW;
        }

        if (lastSide !== ThresholdSide.ABOVE && value > min + distance) {
          nextSide = ThresholdSide.ABOVE;
        }

        if (nextSide !== undefined) {
          dispatch(nextSide);
          lastSide = nextSide;
        }

        if (min === undefined || value < min) {
          min = value;
        }

        if (max === undefined || value > max) {
          max = value;
        }
      }
    );
  }

  /**
   * Listens to a stream of numbers and
   *
   * distance should be positive
   */
  slidingThreshold(distance: number = 56): ExperimentalMotionObservable<ThresholdSide> {
    let threshold: number;
    let lastSide: ThresholdSide;

    return this._nextOperator(
      (value: number, dispatch: NextChannel<ThresholdSide>) => {
        let nextSide;

        if (threshold === undefined) {
          threshold = value;
        }

        if (value < threshold - distance) {
          nextSide = ThresholdSide.BELOW;
        }

        if (value > threshold + distance) {
          nextSide = ThresholdSide.ABOVE;
        }

        if (nextSide !== undefined) {
          dispatch(nextSide);
          lastSide = nextSide;
        }

        if (
          (lastSide === ThresholdSide.ABOVE && value > threshold) ||
          (lastSide === ThresholdSide.BELOW && value < threshold)
        ) {
          threshold = value;
        }
      }
    );
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

  /**
   * Remembers the most recently dispatched value on each channel and passes
   * them on to all new subscribers.  Subscribing to a stream that's being
   * remembered will synchronously provide the most recent value to each of the
   * observer's channels to the observer, if there have been any values.
   *
   * `_remember()` is also useful for ensuring that expensive operations only
   * happen once per dispatch, sharing the resulting value with all observers.
   */
  _remember(): MotionObservable<T> {
    // Keep track of all the observers who have subscribed,
    // so we can notify them when we get new values.
    const observers = new Set();
    let subscription: Subscription;
    let lastValue: T;
    let lastState: State;
    let hasStarted = false;

    return new MotionObservable<T>(
      (observer: MotionObserver<T>) => {
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
          subscription = this.subscribe({
            next(value: T) {
              // The parent stream has dispatched a value, so
              // pass it along to all the children, and cache
              // it for any observers that subscribe before
              // the next dispatch.
              observers.forEach(
                observer => observer.next(value)
              );

              hasStarted = true;
              lastValue = value;
            },

            state(value: State) {
              // The parent stream has dispatched a value, so
              // pass it along to all the children, and cache
              // it for any observers that subscribe before
              // the next dispatch.
              observers.forEach(
                observer => observer.state(value)
              );

              lastState = value;
            }
          });
        }

        observers.add(observer);

        if (hasStarted) {
          observer.next(lastValue);
        }

        if (lastState !== undefined) {
          observer.state(lastState);
        }

        return () => {
          observers.delete(observer);

          if (!observers.size) {
            subscription.unsubscribe();
            subscription = null;
          }
        };
      }
    );
  }

  /**
   * Returns the current value of an observable property (e.g. a subject or
   * remembered stream).
   */
  read(): T {
    let result: T;

    this.subscribe(
      (value: T) => {
        result = value;
      }
    ).unsubscribe();

    return result;
  }

  /**
   * Listens to a GestureRecognition stream and dispatches true if
   * recognitionState is POSSIBLE, CANCELLED, ENDED, or FAILED.
   */
  atRest(): MotionObservable<boolean> {
    return this._map(
      ({ recognitionState }: GestureRecognition<T>) => [
        GestureRecognitionState.CANCELLED,
        GestureRecognitionState.ENDED,
        GestureRecognitionState.FAILED
      ].includes(recognitionState)
    );
  }

  /**
   * Listens to a GestureRecognition stream, filters for recognitions that match
   * the provided states, and dispatches them downstream.
   */
  whenRecognitionStateIs(...passingStates: Array<GestureRecognitionState>): MotionObservable<GestureRecognition<T>> {
    return this._filter(
      ({ recognitionState }: GestureRecognition<T>) => passingStates.includes(recognitionState)
    );
  }

  /**
   * Listens to a GestureRecognition stream, filters for recognitions that match
   * the provided states, and dispatches them downstream.
   */
  whenRecognitionStateIsAnyOf(passingStates: Array<GestureRecognitionState>): MotionObservable<GestureRecognition<T>> {
    return this.whenRecognitionStateIs(...passingStates);
  }

  /**
   * Combines the translation from the incoming stream with the most recent
   * position and passes the result to the observer.
   *
   * `initialPosition$` is `read()` whenever the upstream state is `BEGAN`.
   */
  translationAddedTo(initialPosition$: ExperimentalMotionObservable<Point2D>): ExperimentalMotionObservable<Point2D> {
    let initialPosition: Point2D | undefined;

    return this._nextOperator(
      ({ recognitionState, translation }: TranslationGestureRecognition, dispatch: NextChannel<Point2D>) => {
        switch (recognitionState) {
          case GestureRecognitionState.BEGAN:
            // We want a snapshot of initialPosition at this instant, so we use
            // ... to clone its current value
            initialPosition = { ...initialPosition$.read() };
            break;

          case GestureRecognitionState.CHANGED:
            if (!initialPosition) {
              initialPosition = { ...initialPosition$.read() };
            }
            break;

          default:
            initialPosition = undefined;
        }

        if (initialPosition) {
          dispatch({
            x: initialPosition.x + translation.x,
            y: initialPosition.y + translation.y,
          });
        }
      }
    );
  }
}
export default ExperimentalMotionObservable;

