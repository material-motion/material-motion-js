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
  Observable,
} from '../../types';

export interface MotionReadable<T> extends Observable<T> {
  _read(): T;
}

export function withRead<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionReadable<T>> {
  return class extends superclass implements MotionReadable<T>{
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
  };
}
