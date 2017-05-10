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
  getFrame$,
} from '../../getFrame$';

import {
  MotionObservable,
} from '../../observables/proxies';

import {
  Constructor,
  MotionNextOperable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
  Observer
} from '../../types';

export interface MotionDebounceable<T> {
  _debounce(pulse$?: Observable<any>): ObservableWithMotionOperators<T>;
}

export function withDebounce<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S
    & Constructor<MotionDebounceable<T>> {
  return class extends superclass implements MotionDebounceable<T> {
    /**
     * Throttles the upstream subscription to dispatch its latest value whenever
     * `pulse$` dispatches.  If more than one value is received whilst awaiting
     * the pulse, the most recent value is dispatched and the intermediaries are
     * forgotten.
     *
     * By default, it will throttle to the framerate using
     * `requestAnimationFrame`.
     */
    _debounce(pulse$: Observable<any> = getFrame$()): ObservableWithMotionOperators<T> {
      return new MotionObservable<T>(
        (observer: Observer<T>) => {
          let awaitingDispatch = false;
          let lastValue: T;

          const valueSubscription = this.subscribe(
            (value: T) => {
              lastValue = value;
              awaitingDispatch = true;
            }
          );

          const pulseSubscription = pulse$.subscribe(
            () => {
              if (awaitingDispatch) {
                awaitingDispatch = false;
                observer.next(lastValue);
              }
            }
          );

          return () => {
            valueSubscription.unsubscribe();
            pulseSubscription.unsubscribe();
          };
        }
      );
    }
  };
}
