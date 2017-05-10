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
  MemorylessMotionSubject,
} from '../../observables/proxies';

import {
  Constructor,
  Observable,
  ObservableWithMotionOperators,
} from '../../types';

export interface MotionMulticastable<T> extends Observable<T> {
  _multicast(): ObservableWithMotionOperators<T>;
}

export function withMulticast<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionMulticastable<T>> {
  return class extends superclass implements MotionMulticastable<T> {
    /**
     * Ensures that upstream operations are shared among all observers.  This is
     * useful to avoid repeating expensive operations and ensuring that any
     * side effects that may occur upstream only happen once.
     */
    _multicast(): ObservableWithMotionOperators<T> {
      const result = new MemorylessMotionSubject<T>();
      this.subscribe(result);
      return result;
    }
  };
}
