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

// ObservableWithMotionOperators isn't referenced in this file, but TypeScript
// gets mad if you remove it. (MotionProperty is using MotionDebounceable from
// an external module)
import {
  ObservableWithMotionOperators,
  withMotionOperators,
} from '../operators';

import {
  ReactiveProperty,
} from './ReactiveProperty';

import {
  fulfillProxies,
} from './fulfillProxies';

export interface MotionProperty<T> extends ReactiveProperty<T>, ObservableWithMotionOperators<T> {}
export const MotionProperty = withMotionOperators(ReactiveProperty);
export default MotionProperty;

// See explanation in `./proxies`
try {
  fulfillProxies();
} catch (error) {}
