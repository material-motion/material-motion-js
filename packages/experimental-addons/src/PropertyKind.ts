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

// This is called `PropertyKind` to avoid being confused with `ReactiveProperty`
// (the readable/writable stream implementation) or TypeScript types.  There's
// probably a better name, but we can bikeshed on that later.

// Names come from here:
// https://material-motion.github.io/material-motion/starmap/specifications/streams/connections/names

// enums serialize to numbers.  Strings are easier for external contributors
// to extend and for everybody to parse.
//
// https://github.com/Microsoft/TypeScript/issues/1206

// If the keys had a similar shape to the values (e.g. `position$`), we could
// use the TypeScript `keyof` operator to validate kinds.

// tslint:disable-next-line variable-name
export const PropertyKind = {
  POSITION: 'position$',
  ROTATION: 'rotation$',
  SCALE: 'scale$',
  OPACITY: 'opacity$',
  COLOR: 'color$',
  BACKGROUND_COLOR: 'backgroundColor$',
  WIDTH: 'width$',
  HEIGHT: 'height$',
  CORNER_RADIUS: 'cornerRadius$',
};

export default PropertyKind;
