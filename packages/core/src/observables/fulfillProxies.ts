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
  defineProxy as actuallyDefineProxy,
} from './proxies';

// Since the operators depend on various ObservableWithMotionOperator
// constructors without actually being able to import them, we must import them
// all here.  That ensures that they are defined and ready when the operators
// try to use them.
import {
  MemorylessMotionSubject,
} from './MemorylessMotionSubject';

import {
  MotionObservable,
} from './MotionObservable';

import {
  MotionProperty,
} from './MotionProperty';

import {
  MotionSubject,
} from './MotionSubject';


// See explanation in `./proxies`
export function fulfillProxies() {
  if (MemorylessMotionSubject && MotionObservable && MotionProperty && MotionSubject) {
    actuallyDefineProxy('MemorylessMotionSubject', MemorylessMotionSubject);
    actuallyDefineProxy('MotionObservable', MotionObservable);
    actuallyDefineProxy('MotionProperty', MotionProperty);
    actuallyDefineProxy('MotionSubject', MotionSubject);
  }
}
