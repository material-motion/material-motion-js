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
 *
 *  @flow
 */

export type CubicBezierArgsT = [number, number, number, number];

type EasingEnumT = {
  [key:string]: CubicBezierArgsT
};

// https://www.w3.org/TR/css3-transitions/

export const CSSEasing:EasingEnumT = {
  EASE: [.25, .1, .25, 1],
  LINEAR: [0, 0, 1, 1],
  EASE_IN: [.42, 0, 1, 1],
  EASE_OUT: [0, 0, .58, 1],
  EASE_IN_OUT: [.42, 0, .58, 1],
};

// https://material.google.com/motion/duration-easing.html#duration-easing-natural-easing-curves

export const MaterialMotionEasing:EasingEnumT = {
  STANDARD: [.4, 0, .2, 1],
  ACCELERATION: [.4, 0, 1, 1],
  DECELERATION: [0, 0, .2, 1],
  SHARP: [.25, .1, .25, 1],
};

function addToStringsToDict(enumName, dict) {
  Object.keys(dict).forEach(
    key => {
      dict[key].toString = () => `${ enumName }.${ key }`;
    }
  );
}

addToStringsToDict('CSSEasing', CSSEasing);
addToStringsToDict('MaterialMotionEasing', MaterialMotionEasing);

MaterialMotionEasing.DEFAULT = MaterialMotionEasing.STANDARD;
MaterialMotionEasing.EASE_IN = MaterialMotionEasing.ACCELERATION;
MaterialMotionEasing.EASE_OUT = MaterialMotionEasing.DECELERATION;
MaterialMotionEasing.EASE_IN_OUT = MaterialMotionEasing.SHARP;
