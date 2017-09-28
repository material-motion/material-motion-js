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

/* This file exists to solve the circular dependency problem:
 *
 * - `MotionSubject = withMotionOperators(IndefiniteSubject)`
 * - `withMotionOperators(superclass)` adds `_remember` to `superclass`
 * - `_remember()` returns a `MotionSubject`
 *
 * Since `_remember()` doesn't actually need a reference to `MotionSubject`
 * until you call it, this should work fine; in fact, it would work perfectly if
 * the whole library was defined in a single file.  Unfortunately, splitting the
 * library into modules causes a problem:  When `operators/_remember` is
 * imported, it tries to resolve `MotionSubject`, which doesn't exist until
 * `withMotionOperators` can run, which can't run unless `_remember` exists.
 *
 * `proxies` breaks this cycle.  When each of the Motion observables is defined,
 * it tries to call `fulfillProxies()`.  When they have all been defined, that
 * call will succeed, which will cause the variables in this file to reference
 * the canonical definitions in the `observables/Motion…` files.
 *
 * Each of the operators that returns a new observable points to this proxy
 * instead of to the canonical definition.  Thus, the cyclical reference is
 * resolved.
 */

import {
  Connect,
  IndefiniteObservable,
} from 'indefinite-observable';

import {
  Constructor,
  ObservableWithMotionOperators,
} from '../types';

import {
  IndefiniteSubject,
} from './IndefiniteSubject';

import {
  MemorylessIndefiniteSubject,
} from './MemorylessIndefiniteSubject';

import {
  ReactiveProperty,
} from './ReactiveProperty';

/* tslint:disable */
export var MemorylessMotionSubject: new<T>() => ObservableWithMotionOperators<T> & MemorylessIndefiniteSubject<T>;
export interface MemorylessMotionSubject<T> extends ObservableWithMotionOperators<T>, MemorylessIndefiniteSubject<T> {}

export var MotionObservable: new<T>(connect: Connect<T>) => ObservableWithMotionOperators<T>;
export interface MotionObservable<T> extends ObservableWithMotionOperators<T>, IndefiniteObservable<T> {}

export var MotionProperty: new<T>() => ObservableWithMotionOperators<T> & ReactiveProperty<T>;
export interface MotionProperty<T> extends ObservableWithMotionOperators<T>, ReactiveProperty<T> {}

export var MotionSubject: new<T>() => ObservableWithMotionOperators<T> & IndefiniteSubject<T>;
export interface MotionSubject<T> extends ObservableWithMotionOperators<T>, IndefiniteSubject<T> {}
/* tslint:enable */

export function defineProxy(name: string, value: any) {
  switch (name) {
    case 'MemorylessMotionSubject':
      MemorylessMotionSubject = value;
      break;

    case 'MotionObservable':
      MotionObservable = value;
      break;

    case 'MotionProperty':
      MotionProperty = value;
      break;

    case 'MotionSubject':
      MotionSubject = value;
      break;

    default:
      console.warn(name, 'not specified in defineProxy');
      break;
  }
}
