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
  Observable,
  Observer,
  Subscription,
} from './types';

export type SubscribeArgsSingular<T> = {
  sink: Observer<T>,
  source: Observable<T>,
};

export type SubscribeArgsPlural<T> = {
  sinks: Array<Observer<T>>,
  source: Observable<T>,
};

/**
 * `subscribe({ sink, source })` is sugar for `source.subscribe(sink)`.
 *
 * When programming, you generally declare a variable in terms of an expression:
 *
 *     const result = 1 + 2 + 3;
 *
 * You declare the output you are affecting and then the expression that defines
 * it.  Observables typically invert this flow:
 *
 *     `1$.addedBy(2).addedBy(3).subscribe(result$);`
 *
 * `subscribe({ sink, source: input$ })` corrects this, making declarations
 * easier to read by identifying the output before the expression that writes to
 * it:
 *
 *     subscribe({
 *       sink: result$,
 *       source: 1$.addedBy(2).addedBy(3)
 *     });
 */
export function subscribe<T>({ sink, source }: SubscribeArgsSingular<T>): Subscription;
export function subscribe<T>({ sinks, source }: SubscribeArgsPlural<T>): Array<Subscription>;
export function subscribe<T>({ sink, sinks, source }: SubscribeArgsSingular<T> & SubscribeArgsPlural<T>) {
  if (sink) {
    return source.subscribe(sink);

  } else {
    return sinks.map(
      (sink: Observer<T>) => source.subscribe(sink)
    );
  }
}
export default subscribe;
