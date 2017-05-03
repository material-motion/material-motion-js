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
  IndefiniteSubject,
} from '../observables/IndefiniteSubject';

import {
  Observable,
  ObserverOrNext,
  ScopedReadable,
  ScopedWritable,
  Subscription,
} from '../types';

export class ReactiveProperty<T> implements Observable<T>, ScopedReadable<T>, ScopedWritable<T> {
  // ReactiveProperty delegates all of its reactive functionality to an internal
  // instance of IndefiniteSubject.
  //
  // Rather than extending IndefiniteSubject, we're using an internal instance.
  // This allows us to enforce that all reads and writes to the stream go
  // through the methods exposed by ReactiveProperty.
  _subject = new IndefiniteSubject<T>();

  constructor(readableWritable?: ScopedReadable<T> & ScopedWritable<T>) {
    // IndefiniteSubject caches the last value it dispatched as `_lastValue`.
    //
    // If the user supplies `read` and `write` functions, we replace
    // `_subject._lastValue` with them, so all reads and writes go through the
    // user-supplied getter/setter.
    if (readableWritable) {
      Object.defineProperty(
        this._subject,
        '_lastValue',
        {
          get: readableWritable.read,
          set: readableWritable.write,
        }
      );
    }
  }

  read = (): T => {
    return this._subject._lastValue;
  }

  write = (value: T) => {
    this._subject.next(value);
  }

  subscribe = (observer: ObserverOrNext<T>): Subscription => {
    return this._subject.subscribe(observer);
  }
}
export default ReactiveProperty;
