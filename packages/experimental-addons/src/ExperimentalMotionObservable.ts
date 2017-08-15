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
  Connect,
  Dict,
  GestureRecognitionState,
  MotionObservable,
  NextChannel,
  Observable,
  Observer,
  Point2D,
  Subscription,
  ThresholdSide,
  isObservable,
} from 'material-motion';

/**
 * MotionObservable, with experimental operators
 */
export class ExperimentalMotionObservable<T> extends MotionObservable<T> {
  static from<T>(stream: Observable<T>): ExperimentalMotionObservable<T> {
    return new ExperimentalMotionObservable<T>(
      (observer: Observer<T>) => {
        const subscription: Subscription = stream.subscribe(observer);

        return subscription.unsubscribe;
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
   * Listens to a second stream, and replaces every value it receives from
   * upstream with the latest value from the second stream.
   */
  mapToLatest<U>(value$: Observable<U>): ExperimentalMotionObservable<U> {
    return new ExperimentalMotionObservable(
      (observer: Observer<U>) => {
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
   * Listens to an incoming stream of numbers.  When the values have increased
   * by at least `distance`, it dispatches `ThresholdSide.ABOVE`.  When they
   * have decreased by at least `distance`, it dispatches `ThresholdSide.BELOW`.
   *
   * `slidingThreshold` suppress duplicates: `ABOVE` will only be dispatched if
   * the previous dispatch was `BELOW` and vice-versa.
   */
  slidingThreshold(distance: number = 56): ExperimentalMotionObservable<ThresholdSide> {
    let aboveThreshold: number;
    let belowThreshold: number;
    let lastValue: number;
    let lastSide: ThresholdSide;

    return this._nextOperator(
      (value: number, dispatch: NextChannel<ThresholdSide>) => {
        let nextSide: ThresholdSide;

        if (value > aboveThreshold && lastSide !== ThresholdSide.ABOVE) {
          nextSide = ThresholdSide.ABOVE;
        }

        if (value < belowThreshold && lastSide !== ThresholdSide.BELOW) {
          nextSide = ThresholdSide.BELOW;
        }

        if (nextSide !== undefined) {
          dispatch(nextSide);
          lastSide = nextSide;
        }

        if (value < lastValue || lastValue === undefined) {
          aboveThreshold = value + distance;
        }

        if (value > lastValue || lastValue === undefined) {
          belowThreshold = value - distance;
        }

        lastValue = value;
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
}
export default ExperimentalMotionObservable;

