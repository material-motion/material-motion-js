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
  Dict,
  MotionConnect,
  MotionObservable,
  MotionObserver,
  NextChannel,
  Observable,
  Subscription,
} from 'material-motion-streams';

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

  // If we don't explicitly provide a constructor, TypeScript won't remember the
  // signature
  constructor(connect: MotionConnect<T>) {
    super(connect);
  }

  applyDiffs(other$: Observable<Partial<T>>): ExperimentalMotionObservable<T> {
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
  dedupe(): ExperimentalMotionObservable<T> {
    let dispatched = false;
    let lastValue: T;

    return this._nextOperator(
      (value: T, dispatch: NextChannel<T>) => {
        if (dispatched && value === lastValue) {
          return;
        }

        dispatch(value);
        dispatched = true;
        lastValue = value;
      }
    ) as ExperimentalMotionObservable<T>;
  }
}
export default ExperimentalMotionObservable;
