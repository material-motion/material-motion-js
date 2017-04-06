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
  Observer,
} from '../types';

import {
  createPlucker,
} from './pluck';

export interface MotionMergeable<T> extends Observable<T> {
  merge(...otherStreams: Array<Observable<any>>): Observable<any>;
}

export function withMerge<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionMergeable<T>> {
  return class extends superclass implements MotionMergeable<T> {
    /**
     * Dispatches values as it receives them, both from upstream and from any
     * streams provided as arguments.
     */
    merge(...otherStreams: Array<Observable<any>>): Observable<any> {
      const constructor = this.constructor as Constructor<Observable<any>>;

      return new constructor(
        (observer: Observer<any>) => {
          const subscriptions = [this, ...otherStreams].map(
            stream => stream.subscribe(observer)
          );

          return () => {
            subscriptions.forEach(
              subscription => subscription.unsubscribe()
            );
          };
        }
      );
    }
  };
}
