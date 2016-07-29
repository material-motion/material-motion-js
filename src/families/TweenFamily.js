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

import type {
  CubicBezierArgsT,
} from '../easing';

export type Point2DT = {
  x:number,
}|{
  y:number,
};

export type TweenPlanValueT = Point2DT|number;

export type TweenPlanBaseT = {
  familyName:'material-motion-tween-family',
  easing:CubicBezierArgsT,
  duration:number,
};

type TweenPlan1DArgsT = {
  from:number,
}|{
  to:number,
}|{
  by:number,
}

type TweenPlan2DArgsT = {
  from:Point2DT,
}|{
  to:Point2DT,
}|{
  by:Point2DT,
}

type TweenPlan1DT = TweenPlan1DArgsT&TweenPlanBaseT;
type TweenPlan2DT = TweenPlan2DArgsT&TweenPlanBaseT;

export type TweenOpacityPlanT = {
  property:'opacity',
}&TweenPlan1DT;

export type TweenRotationPlanT = {
  property:'rotation',
}&TweenPlan1DT;

export type TweenScalePlanT = {
  property:'scale',
}&(TweenPlan1DT|TweenPlan2DT);

export type TweenTranslationPlanT = {
  property:'translate',
}&TweenPlan2DT;

export type TweenPlanT = TweenOpacityPlanT|TweenRotationPlanT|TweenScalePlanT|TweenTranslationPlanT;

// Plans have string family names to support Flow's disjoint unions.  If you
// ever move from Flow to TypeScript/Closure, tween families can probably be
// converted to dicts:
//
//     export default {
//       isValid() {
//         ...
//       }
//     }
//
// which removes the need for Scheduler.registerFamily(familyName, isValid() {})

export const TweenFamilyName = 'material-motion-tween-family';

export const TweenProperty = {
  OPACITY: 'opacity',
  ROTATION: 'rotate',
  SCALE: 'scale',
  TRANSLATION: 'translate',
};
