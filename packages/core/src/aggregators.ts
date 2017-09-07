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
} from './observables/MotionObservable';

import {
  Observer,
} from './types';

// This is a quick test of the `any/all/someOf` operators.  In order to reuse
// the subscription aggregating logic in `_reactiveMap`, each starts with an
// empty stream at the head of the chain to give us access to the operator.
//
// In the future, the subscription managing logic in `_reactiveMap` could be
// abstracted so it may be shared between these functions and `_reactiveMap`.
//
// Arguments are arrays to give us room to easily add parameters to the
// signatures in the future (e.g. a flag to indicate whether to wait for all
// streams to dispatch before dispatching).

const emptyStream = new MotionObservable(
  (observer: Observer<any>) => {
    observer.next(undefined);

    return () => {}
  }
);

function isTrue(value: any): boolean {
  return value === true;
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from at least one of them is true.  Inert until it
 * has received a value from each stream in the array.
 */
export function anyOf(streams: Array<MotionObservable<boolean>>): MotionObservable<boolean> {
  return emptyStream._reactiveMap(
    (_, ...values) => {
      return values.some(isTrue);
    },
    streams
  );
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from each of them is true.  Inert until it has
 * received a value from each stream in the array.
 */
export function allOf(streams: Array<MotionObservable<boolean>>): MotionObservable<boolean> {
  return emptyStream._reactiveMap(
    (_, ...values) => {
      return values.every(isTrue);
    },
    streams
  );
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from each of them is false.  Inert until it has
 * received a value from each stream in the array.
 */
export function noneOf(streams: Array<MotionObservable<boolean>>): MotionObservable<boolean> {
  return anyOf(streams).inverted();
};

/**
 * Accepts a single stream of booleans and dispatches whenever that stream
 * dispatches `true`.  Useful in combination with the other aggregators, e.g.:
 *
 * when(
 *   a.recognitionState$.isAnyOf([GestureRecognitionState.BEGAN])
 * ).subscribe(b.cancellation$)
 */
export function when(stream: MotionObservable<boolean>): MotionObservable<boolean> {
  return stream._filter(
    value => value === true
  );
}
