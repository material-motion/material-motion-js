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
} from '../../observables/MotionObservable';

import {
  Constructor,
  NextOperation,
  Observable,
  Observer,
} from '../../types';

export interface MotionNextOperable<T> extends Observable<T> {
  _nextOperator<U>(operation: NextOperation<T, U>): MotionObservable<U>;
}

export function withNextOperator<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionNextOperable<T>> {
  return class extends superclass implements MotionNextOperable<T>{
    /**
     * `_nextOperator` is sugar for creating an operator that reads and writes
     * from the `next` channel.  It encapsulates the stream creation and
     * subscription boilerplate required for most operators.
     *
     * Its argument `operation` should receive a value from the parent stream's
     * `next` channel, transform it, and use the supplied callback to dispatch
     * the result to the observer's `next` channel.
     */
    _nextOperator<U>(operation: NextOperation<T, U>): Observable<U> {
      const constructor = this.constructor as Constructor<Observable<U>>;

      return new constructor(
        (observer: Observer<U>) => {
          const subscription = this.subscribe(
            (value: T) => operation(value, observer.next)
          );

          return subscription.unsubscribe;
        }
      );
    }
  };
}
