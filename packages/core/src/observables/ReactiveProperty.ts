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
} from './IndefiniteSubject';

import {
  ScopedReadable,
  ScopedWritable,
} from '../types';

/**
 * A Subject that exposes its last value via `read()` and `write(nextValue)`.
 *
 * Writes will be broadcast to all observers.
 */
export class ReactiveProperty<T> extends IndefiniteSubject<T> {
  constructor(readableWritable?: ScopedReadable<T> & ScopedWritable<T>) {
    super();

    // IndefiniteSubject caches the last emission as `_lastEmission`.
    //
    // If the user supplies `read` and `write` functions, we replace
    // `_subject._lastEmission` with them, so all reads and writes go through
    // the user-supplied getter/setter.
    if (readableWritable) {
      Object.defineProperty(
        this,
        '_lastEmission',
        {
          get: readableWritable.read,
          set: readableWritable.write,
        }
      );
    }
  }

  read(): T {
    return this._lastEmission;
  }

  write(value: T): void {
    this.next(value);
  }
}
export default ReactiveProperty;
