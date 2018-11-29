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
  MotionProperty,
  ObservableWithMotionOperators,
  createProperty,
  getEventStreamFromElement,
} from 'material-motion';

export type SliderPropertiesArgs = {
  element: HTMLInputElement,
  value$?: MotionProperty<number>,
};

/**
 * Exposes reactive `min$`, `max$`, and `value$` properties for the given input
 * element.
 */
export class SliderProperties {
  readonly min$: MotionProperty<Number>;

  get min(): number {
    return this.min$.read();
  }

  set min(value: number) {
    this.min$.write(value);
  }

  readonly max$: MotionProperty<Number>;

  get max(): number {
    return this.max$.read();
  }

  set max(value: number) {
    this.max$.write(value);
  }

  readonly value$: MotionProperty<Number>;

  get value(): number {
    return this.value$.read();
  }

  set value(value: number) {
    this.value$.write(value);
  }

  readonly element: HTMLInputElement;

  constructor({ element, value$ }: SliderPropertiesArgs) {
    this.element = element;

    this.min$ = new MotionProperty<number>({
      read: () => {
        return parseFloat(this.element.getAttribute('min')!);
      },
      write: (value: number) => {
        this.element.setAttribute('min', value.toFixed(4));
      }
    });

    this.max$ = new MotionProperty<number>({
      read: () => {
        return parseFloat(this.element.getAttribute('max')!);
      },
      write: (value: number) => {
        this.element.setAttribute('max', value.toFixed(4));
      }
    });

    this.min$.subscribe(
      min => this.element.setAttribute('min', min)
    );

    this.max$.subscribe(
      max => this.element.setAttribute('max', max)
    );

    this.value$ = value$ || createProperty({
      initialValue: parseFloat(this.element.value) || 0
    });

    this.element.value = this.value.toFixed(4);

    getEventStreamFromElement('input', this.element)._map({
      transform: (event: Event) => parseFloat(this.element.value)
    }).subscribe(this.value$);
  }
}
export default SliderProperties;
