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
  createProperty,
} from '../observables';

import {
  Point2D,
  PropertyObservable,
} from '../types';

import {
  State,
} from '../State';

// Might be able to set T = number by default in TS 2.3 and get rid of SpringT
export class Spring<T extends number | Point2D = number> {
  destination: PropertyObservable<T> = createProperty<number>({ initialValue: 0 });
  initialValue: PropertyObservable<T> = createProperty<number>({ initialValue: 0 });
  initialVelocity: PropertyObservable<T> = createProperty<number>({ initialValue: 0 });
  tension: PropertyObservable<number> = createProperty<number>({ initialValue: 342 });
  friction: PropertyObservable<number> = createProperty<number>({ initialValue: 30 });
  threshold: PropertyObservable<number> = createProperty<number>({ initialValue: .001 });
  enabled: PropertyObservable<boolean> = createProperty<boolean>({ initialValue: true });
  state: PropertyObservable<State> = createProperty<State>({ initialValue: State.AT_REST });
}

export class Spring2D extends Spring<Point2D> {
  destination: PropertyObservable<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });

  initialValue: PropertyObservable<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });

  initialVelocity: PropertyObservable<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });
}

export default Spring;
