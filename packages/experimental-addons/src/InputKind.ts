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

// enums serialize to numbers.  Strings are easier for external contributors
// to extend and for everybody to parse.
//
// https://github.com/Microsoft/TypeScript/issues/1206

// tslint:disable-next-line variable-name
export const InputKind = {
  TAP: 'tap$',
  DRAG: 'drag$',
  PINCH: 'pinch$',
  ROTATE: 'rotate$',
  SCROLL: 'scroll$',
  KEY: 'key$',
};

export default InputKind;
