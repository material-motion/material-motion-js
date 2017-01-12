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
  Disconnect,
  NextChannel,
  Observer,
} from 'indefinite-observable';

import {
  MotionObservable,
  State,
} from './MotionObservable';

export interface MotionObserver<T> extends Observer<T> {
  state:StateChannel;
}
export type StateChannel = (value: State) => void;
export type MotionObserverOrNext<T> = MotionObserver<T> | NextChannel<T>;

export type MotionConnect<T> = (observer: MotionObserver<T>) => Disconnect;
export type NextOperation<T, U> = (value: T, nextChannel: NextChannel<U>) => void;


export type Point2D = {
  x: number,
  y: number,
};


export type Read<T> = () => T;
export interface ScopedReadable<T> {
  read: Read<T>;
}

export type Write<T> = (value: T) => void;
export interface ScopedWritable<T> {
  write: Write<T>;
}

export interface PropertyObservable<T> extends Observable<T>, ScopedReadable<T>, ScopedWritable<T> {}

export interface MotionElement {
  readonly scrollPosition: ScopedReadable<Point2D> & ScopedWritable<Point2D>;
  getEvent$(type: string): MotionObservable<Event>;
}

export type SpringArgs<T> = {
  destination: PropertyObservable<T>,
  initialValue: PropertyObservable<T>,
  initialVelocity: PropertyObservable<T>,
  threshold: ScopedReadable<number>,
  friction: ScopedReadable<number>,
  tension: ScopedReadable<number>,
};
