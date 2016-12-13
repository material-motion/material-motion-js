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
  IndefiniteObservable,
  NextChannel,
  Observer,
  Subscription,
} from 'indefinite-observable';

export enum State {
  atRest,
  active,
}

export interface MotionObserver<T> extends Observer<T> {
  state:StateChannel;
}
export type StateChannel = (value: State) => void;
export type MotionObserverOrNext<T> = MotionObserver<T> | NextChannel<T>;

export class MotionObservable<T> extends IndefiniteObservable<T> {

}
export interface MotionObservable<T> {
  subscribe(observerOrNext: MotionObserverOrNext<T>): Subscription;
}
export default MotionObservable;
