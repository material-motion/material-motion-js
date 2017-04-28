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

import $$observable from 'symbol-observable';

// We re-export everything we import, so dependents don't need to know about
// indefinite-observable.
import {
  Disconnect,
  NextChannel,
  Observable,
  Observer,
  Subscription,
} from 'indefinite-observable';

export {
  Disconnect,
  NextChannel,
  Observable,
  Observer,
  ObserverOrNext,
  Subscription,
} from 'indefinite-observable';

export {
  MotionDebounceable,
  MotionDelayable,
  MotionDeduplicable,
  MotionFilterable,
  MotionFlattenable,
  MotionIgnorable,
  MotionInvertible,
  MotionLoggable,
  MotionLowerBoundable,
  MotionMappable,
  MotionMeasurable,
  MotionMemorable,
  MotionMergeable,
  MotionNextOperable,
  MotionOffsetable,
  MotionPluckable,
  MotionReadable,
  MotionRewritable,
  MotionRewriteRangeable,
  MotionRewriteToable,
  MotionScalable,
  MotionSeedable,
  MotionThresholdable,
  MotionThresholdRangeable,
  MotionTimestampable,
  MotionUpperBoundable,
  MotionVelocityMeasurable,
  MotionWindowable,
  ObservableWithFoundationalMotionOperators,
  ObservableWithMotionOperators,
} from './operators'

import {
  Draggable,
  Spring,
} from './interactions';

import {
  MotionObservable,
} from './observables/MotionObservable';

import {
  State,
} from './State';

export type Constructor<T> = new(...args: Array<any>) => T;
export type Predicate<T> = (value: T) => boolean;

export interface Subject<T> extends Observable<T> {
  next(value: T): void;
}

export function isObservable(value:any): value is Observable<any> {
  // According to the spec, all Observables should have a `$$observable` method
  // that returns themselves:
  //
  // https://github.com/tc39/proposal-observable#observable
  //
  // A simpler (but less precise) test would just check for the existance of a
  // `subscribe` method and presume that anything that had one was an
  // Observable.
  return value[$$observable] !== undefined && value[$$observable]() === value;
}

export type NextOperation<T, U> = (value: T, nextChannel: NextChannel<U>) => void;

export type Point2D = {
  x: number,
  y: number,
};

/**
 * There are 2 competing input events on the Web: `PointerEvent`s and
 * `TouchEvent`s. Our gesture system only needs 4 properties: x, y, type and an
 * ID. In both models, `pageX` and `pageY` are provided. `TouchEvent` calls its
 * ID `identifier`; whereas, `PointerEvent` uses `pointerId`.
 *
 * `PartialPointerEvent` is the subset we care about.  `PointerEvent` already
 * has this shape.  `TouchEvent` can be trivially converted by extracting the
 * touches and renaming `identifier` to `pointerId`.
 */
export type PartialPointerEvent = {
  pageX: number;
  pageY: number;
  pointerId?: number; // Can be undefined for MouseEvent
  type: 'pointerdown' | 'pointermove' | 'pointerup';
};

export type Read<T> = () => T;
export interface ScopedReadable<T> {
  read: Read<T>;
}

export type Write<T> = (value: T) => void;
export interface ScopedWritable<T> {
  write: Write<T>;
}

export interface Operable<T> {
  _observableConstructor: Constructor<Observable<T>>;
}

export interface PropertyObservable<T> extends Observable<T>, ScopedReadable<T>, ScopedWritable<T> {}

export interface MotionElement {
  readonly scrollPosition: ScopedReadable<Point2D> & ScopedWritable<Point2D>;
  getEvent$(type: string): MotionObservable<Event>;
}

export type EqualityCheck = (a: any, b: any) => boolean;

export interface Timestamped<T> {
  value: T,
  timestamp: number,
}

export type SpringSystem<T extends number | Point2D> = (interaction: Spring<T>) => MotionObservable<T>;
export type DragSystem = (interaction: Draggable) => MotionObservable<Point2D>;

export type Dict<T> = {
  [index: string]: T,
};

export type NumericDict = Dict<number>;
export type StreamDict<T> = Dict<Observable<T>>;
export type SubjectDict<T> = Dict<Subject<T>>;
export type SubscriptionDict<T> = Dict<Subscription>;
