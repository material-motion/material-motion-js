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
  createProperty,
} from '../observables';

import {
  Point2D,
} from '../types';

import {
  State,
} from '../State';

export class Spring<T extends number | Point2D = number> {
  destination: MotionProperty<T> = createProperty<number>({ initialValue: 0 });
  initialValue: MotionProperty<T> = createProperty<number>({ initialValue: 0 });
  initialVelocity: MotionProperty<T> = createProperty<number>({ initialValue: 0 });
  tension: MotionProperty<number> = createProperty<number>({ initialValue: 342 });
  friction: MotionProperty<number> = createProperty<number>({ initialValue: 30 });
  threshold: MotionProperty<number> = createProperty<number>({ initialValue: .001 });
  enabled: MotionProperty<boolean> = createProperty<boolean>({ initialValue: true });
  state: MotionProperty<string> = createProperty<string>({ initialValue: State.AT_REST });
}

export class Spring2D extends Spring<Point2D> {
  destination: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });

  initialValue: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });

  initialVelocity: MotionProperty<Point2D> = createProperty<Point2D>({
    initialValue: {
      x: 0,
      y: 0
    },
  });
}

export default Spring;
