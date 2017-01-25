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
  PropertyObservable,
  ReactiveProperty,
} from 'material-motion-streams';

export class TogglableProperty<T> implements PropertyObservable<T> {
  _property = new ReactiveProperty<T>();
  _isOn = false;
  _onValue: T;
  _offValue: T;

  constructor({ onValue, offValue, initialValue }: { onValue: T, offValue: T, initialValue?: T } = { onValue: true, offValue: false }) {
    this._onValue = onValue;
    this._offValue = offValue;

    if (initialValue === undefined) {
      initialValue = this._offValue;
    }

    this._property.write(initialValue);
  }

  turnOn = (): void => {
    this._isOn = true;
    this._property.write(this._onValue);
  }

  turnOff = (): void => {
    this._isOn = false;
    this._property.write(this._offValue);
  }

  toggle = (): void => {
    this._isOn = !this._isOn;

    this._property.write(
      this._isOn
        ? this._onValue
        : this._offValue
    );
  }

  read = this._property.read;
  write = this._property.write;
  subscribe = this._property.subscribe;
}
export default TogglableProperty;
