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
  MotionAppendUnitable,
  MotionDebounceable,
  MotionDelayable,
  MotionDeduplicable,
  MotionFilterable,
  MotionFlattenable,
  MotionIgnorable,
  MotionInvertible,
  MotionIsAnyOfable,
  MotionLoggable,
  MotionLowerBoundable,
  MotionMappable,
  MotionMathOperable,
  MotionMeasurable,
  MotionMemorable,
  MotionMergeable,
  MotionMulticastable,
  MotionNextOperable,
  MotionDivisible,
  MotionAddable,
  MotionPluckable,
  MotionReactiveMappable,
  MotionReactiveNextOperable,
  MotionReadable,
  MotionRewritable,
  MotionRewriteRangeable,
  MotionRewriteToable,
  MotionMultipliable,
  MotionSeedable,
  MotionSubtractable,
  MotionTappable,
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
  MotionObservable,
} from './observables/MotionObservable';

import {
  State,
} from './enums';

export type Constructor<T> = new(...args: Array<any>) => T;
export type Predicate<T> = (value: T) => boolean;

export interface Subject<T> extends Observable<T> {
  next(value: T): void;
}

export type NextOperation<T, U> = (value: T, nextChannel: NextChannel<U>) => void;
export type ReactiveNextOperation<T, U> = (nextChannel: NextChannel<U>, ...values: Array<any>) => void;

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

export type PointerEventStreams = {
  down$: MotionObservable<PartialPointerEvent>,
  move$: MotionObservable<PartialPointerEvent>,
  up$: MotionObservable<PartialPointerEvent>,
  cancel$: MotionObservable<PartialPointerEvent>,
  contextMenu$: MotionObservable<PartialPointerEvent>,
  capturedClick$: MotionObservable<MouseEvent>,
  capturedDragStart$: MotionObservable<DragEvent>,
};

export type Read<T> = () => T;
export interface ScopedReadable<T> {
  read: Read<T>;
}

export type Write<T> = (value: T) => void;
export interface ScopedWritable<T> {
  write: Write<T>;
}

export interface MotionElement {
  readonly scrollPosition: ScopedReadable<Point2D> & ScopedWritable<Point2D>;
  getEvent$(type: string): MotionObservable<Event>;
}

export type WillChangeStyleStreams = {
  readonly willChange$: MotionObservable<string>,
};

export type TranslateStyleStreams = WillChangeStyleStreams & {
  readonly translate$: MotionObservable<Point2D>,
};

export type ScaleStyleStreams = WillChangeStyleStreams & {
  readonly scale$: MotionObservable<number>,
};

export type OpacityStyleStreams = WillChangeStyleStreams & {
  readonly opacity$: MotionObservable<number>,
};

export type BoxShadowStyleStreams = {
  readonly boxShadow$: MotionObservable<string>,
};

export type BorderRadiusStyleStreams = {
  readonly borderRadius$: MotionObservable<number | string | Array<number> | Array<string>>,
};

export type EqualityCheck = (a: any, b: any) => boolean;

export interface Timestamped<T> {
  value: T,
  timestamp: number,
}

export type Dict<T> = {
  [index: string]: T,
};

export type NumericDict = Dict<number>;
export type StreamDict<T> = Dict<Observable<T>>;
export type SubjectDict<T> = Dict<Subject<T>>;
export type SubscriptionDict<T> = Dict<Subscription>;
