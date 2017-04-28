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
  Constructor,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Operable,
} from '../types';

export interface MotionDelayable<T> {
  delayBy(time: number): ObservableWithMotionOperators<T>;
}

export function withDelayBy<T, S extends Constructor<Observable<T> & Operable<T>>>(superclass: S): S & Constructor<MotionDelayable<T>> {
  return class extends superclass implements MotionDelayable<T> {
    /**
     * Buffers upstream values for the specified number of milliseconds, then
     * dispatches them.
     */
    delayBy(time: number): ObservableWithMotionOperators<T> {
      const constructor = this._observableConstructor as Constructor<ObservableWithMotionOperators<T>>;

      return new constructor(
        (observer: Observer<T>) => {
          let connected = true;

          const subscription = this.subscribe(
            (value: T) => {
              setTimeout(
                () => {
                  if (connected) {
                    observer.next(value);
                  }
                },
                time
              );
            }
          );

          return function disconnect() {
            subscription.unsubscribe();
            connected = false;
          };
        }
      );
    }
  };
}
