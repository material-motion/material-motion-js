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
  MotionObservable,
} from './observables/proxies';

import {
  Dict,
  Observable,
  Observer,
  Subscription,
} from './types';

import {
  isIterable,
  isObservable,
} from './typeGuards';

export type CombineLatestOptions = {
  waitForAllValues?: boolean,
};
export function combineLatest<V, T extends Iterable<V | Observable<V>>, U extends Array<V>>(streams: T, options?: CombineLatestOptions): MotionObservable<U>;
export function combineLatest<V, T extends Dict<V | Observable<V>>, U extends Dict<V>>(streams: T, { waitForAllValues = true }: CombineLatestOptions = {}): MotionObservable<U> {
  return new MotionObservable(
    (observer: Observer<U>) => {
      const outstandingKeys = new Set(Object.keys(streams));

      let nextValue: U;

      if (isIterable(streams)) {
        nextValue = [];
      } else {
        nextValue = {};
      }

      const subscriptions: Dict<Subscription> = {};

      let initializing = true;
      outstandingKeys.forEach(checkKey);
      initializing = false;

      function checkKey(key: string) {
        const maybeStream: any = streams[key];
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
        if (waitForAllValues ? outstandingKeys.size === 0 : !initializing) {
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
