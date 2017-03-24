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
  State,
} from './observables/MotionObservable';

import {
  MotionObserver,
  ScopedWritable,
  Subscription,
} from './types';

export type RuntimeWriteArgs<T> = {
  stream: MotionObservable<T>,
  to: ScopedWritable<T>,
};

/**
 * A motion runtime writes streams to properties and observes the aggregate
 * state.
 *
 * If any stream is active, the runtime is active. Otherwise, the runtime is at
 * rest.
 */
export class MotionRuntime {
  _subscriptions: Set<Subscription> = new Set();
  _activeObservers: Set<MotionObserver<any>> = new Set();

  get aggregateState() {
    return this._activeObservers.size === 0
      ? State.AT_REST
      : State.ACTIVE;
  }

  /**
   * Subscribes to the given stream and write its `next` values to the given
   * property.
   */
  write<T>({ stream, to }: RuntimeWriteArgs<T>) {
    const subscription = stream.subscribe(to.write);
    this._subscriptions.add(subscription);
  }
}

export default MotionRuntime;
