/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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
 *
 *  @flow
 */

// TODO(
//   https://github.com/material-motion/material-motion-experiments-js/issues/3
//   https://github.com/material-motion/material-motion-experiments-js/issues/54
// ):
// - figure out the right way to organize/package this

export {
  CSSEasing,
  MaterialMotionEasing,
} from './easing';

export {
  move,
  moveFrom,
  moveTo,
  moveBy,
  rotate,
  rotateFrom,
  rotateTo,
  rotateBy,
  scale,
  scaleFrom,
  scaleTo,
  scaleBy,
  scaleIn,
  scaleOut,
  identityScale,
  fade,
  fadeFrom,
  fadeTo,
  fadeBy,
  fadeIn,
  fadeOut,
} from './expressions/tween';

export * from './families';
export {default as Scheduler} from './Scheduler';

export {
  TweenPerformerWeb,
} from './performers';
