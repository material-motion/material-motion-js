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
  ObservableWithMotionOperators,
} from './operators';

import {
  combineLatest,
} from './combineLatest';

import {
  Observer,
} from './types';

function isTrue(value: any): boolean {
  return value === true;
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from at least one of them is true.  Inert until it
 * has received a value from each stream in the array.
 */
export function anyOf(streams: Array<ObservableWithMotionOperators<boolean>>): ObservableWithMotionOperators<boolean> {
  return combineLatest(streams)._map(
    (values) => values.some(isTrue)
  );
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from each of them is true.  Inert until it has
 * received a value from each stream in the array.
 */
export function allOf(streams: Array<ObservableWithMotionOperators<boolean>>): ObservableWithMotionOperators<boolean> {
  return combineLatest(streams)._map(
    (values) => values.every(isTrue)
  );
};

/**
 * Accepts an array of streams and returns a stream that dispatches true when
 * the most recent dispatch from each of them is false.  Inert until it has
 * received a value from each stream in the array.
 */
export function noneOf(streams: Array<ObservableWithMotionOperators<boolean>>): ObservableWithMotionOperators<boolean> {
  return not(anyOf(streams));
};

/**
 * Accepts an stream of booleans and returns a stream of where each value is the
 * opposite of what was received. Inert until it has received a value from each
 * stream in the array.
 */
export function not(stream: ObservableWithMotionOperators<boolean>): ObservableWithMotionOperators<boolean> {
  return stream._map(value => !value);
};

/**
 * Accepts a single stream of booleans and dispatches whenever that stream
 * dispatches `true`.  Useful in combination with the other aggregators, e.g.:
 *
 * when(
 *   a.recognitionState$.isAnyOf([GestureRecognitionState.BEGAN])
 * ).subscribe(b.cancellation$)
 */
export function when(stream: ObservableWithMotionOperators<boolean>): ObservableWithMotionOperators<boolean> {
  return stream._filter({ predicate: isTrue });
}
