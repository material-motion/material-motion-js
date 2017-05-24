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
} from '../observables/MotionProperty';

import {
  ObservableWithMotionOperators,
} from '../types';

// The only spring support presently in Material Motion is provided by Rebound,
// which adds an external dependency.  For that reason, it currently lives in an
// external library.  However, some interactions (like Tossable) depend on being
// provided something in the shape of that spring.  Thus, this interface exists.
//
// Other potential solutions:
// - Move `springs-rebound` into `core`;
// - Author a dependency-free springs implementation and add it here;
// - Rename `core` to `motion-observables` and make a new package `interactions`
//   that becomes the new `material-motion`.  It can depend on both
//   `motion-observables` and `springs-rebound` without introducing a cyclic
//   dependency;

export interface NumericSpring {
  readonly destination$: MotionProperty<number>;
  destination: number;

  readonly initialValue$: MotionProperty<number>;
  initialValue: number;

  readonly initialVelocity$: MotionProperty<number>;
  initialVelocity: number;

  readonly tension$: MotionProperty<number>;
  tension: number;

  readonly friction$: MotionProperty<number>;
  friction: number;

  readonly threshold$: MotionProperty<number>;
  threshold: number;

  readonly enabled$: MotionProperty<boolean>;
  enabled: boolean;

  readonly state$: MotionProperty<string>;
  readonly state: string;

  value$: ObservableWithMotionOperators<number>;
}
export default NumericSpring;
