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

// Goal: write the simplest possible thing-that-works to learn Expressions and
// build abstractions as useful from there.

import {
  TweenFamilyName,
  TweenProperty,
} from '../families/TweenFamily';

import type {
  Point2DT,
  TweenPlanBaseT,
  TweenPlanT,
} from '../families/TweenFamily';

import {
  MaterialMotionEasing,
} from '../easing';

import type {
  CubicBezierArgsT,
} from '../easing';

import {
  startTermLog,
  logTerm,
} from './utilities';

export class Tween<T> {
  plan:TweenPlanBaseT = {
    familyName: TweenFamilyName,
    easing: MaterialMotionEasing.STANDARD,
    duration: .3,
  };

  log:string[] = [];

  // Not sure what the right type is for partialPlan.  $Shape<TweenPlanT> seems
  // correct, but that makes Flow angry about all the methods.
  constructor(partialPlan:mixed) {
    if (partialPlan) {
      this.plan = {
        ...this.plan,
        ...partialPlan,
      };
    }
  }

  @logTerm
  with(easing:CubicBezierArgsT):Tween<T> {
    // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/38):
    // When Tween is extended to support springs, make sure to delete `easing`
    // and `duration` if you receive spring params, and the spring params if
    // you receive an easing curve.

    return new this.constructor(
      {
        ...this.plan,
        easing,
      }
    );
  }

  @logTerm
  over(duration:number):Tween<T> {
    // When Tween is extended to support springs, make sure to delete them when
    // this is called.

    return new this.constructor(
      {
        ...this.plan,
        duration,
      }
    );
  }

  @logTerm
  from(location:T):Tween<T> {
    return new this.constructor(
      {
        ...this.plan,
        from: location,
      }
    );
  }

  @logTerm
  to(location:T):Tween<T> {
    return new this.constructor(
      {
        ...this.plan,
        to: location,
      }
    );
  }

  @logTerm
  by(location:T):Tween<T> {
    return new this.constructor(
      {
        ...this.plan,
        by: location,
      }
    );
  }

  toString():string {
    return this.log.join('.');
  }

  // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/52):
  // - Move this out of the expression to somewhere where it can test arbitrary
  // plans
  isValid():boolean {
    return (
      this.plan.property !== undefined &&
      (
        (
          this.plan.from !== undefined &&
          this.plan.to !== undefined &&
          !(this.plan.by !== undefined)
        ) ||
        (
          this.plan.from !== undefined &&
          !(this.plan.to !== undefined) &&
          this.plan.by !== undefined
        ) ||
        (
          !(this.plan.from !== undefined) &&
          this.plan.to !== undefined &&
          this.plan.by !== undefined
        )
      ) && (
        this.plan.duration !== undefined &&
        this.plan.easing !== undefined
      )
    );
  }
}

export class Tween1D extends Tween<number> {}
export class Tween2D extends Tween<Point2DT> {}

type TweenExpressionT = () => Tween;
type TweenExpression1DT = () => Tween1D;
type TweenExpression2DT = () => Tween2D;

export const move:TweenExpression2DT = startTermLog(
  function move() {
    return new Tween2D(
      {
        property: TweenProperty.TRANSLATION,
      }
    );
  }
);

export const moveFrom:TweenExpression2DT = startTermLog(
  function moveFrom(location:Point2DT) {
    return move().from(location);
  }
);

export const moveTo:TweenExpression2DT = startTermLog(
  function moveTo(location:Point2DT) {
    return move().to(location);
  }
);

export const moveBy:TweenExpression2DT = startTermLog(
  function moveBy(location:Point2DT) {
    return move().by(location);
  }
);

export const rotate:TweenExpression1DT = startTermLog(
  function rotate() {
    return new Tween1D(
      {
        property: TweenProperty.ROTATION,
      }
    );
  }
);

export const rotateFrom:TweenExpression1DT = startTermLog(
  function rotateFrom(amount:number) {
    return rotate().from(amount);
  }
);

export const rotateTo:TweenExpression1DT = startTermLog(
  function rotateTo(amount:number) {
    return rotate().to(amount);
  }
);

export const rotateBy:TweenExpression1DT = startTermLog(
  function rotateBy(amount:number) {
    return rotate().by(amount);
  }
);

export const scale:TweenExpressionT = startTermLog(
  function scale() {
    return new Tween(
      {
        property: TweenProperty.SCALE,
      }
    );
  }
);

export const scaleFrom:TweenExpressionT = startTermLog(
  function scaleFrom(amount) {
    return scale().from(amount);
  }
);

export const scaleTo:TweenExpressionT = startTermLog(
  function scaleTo(amount) {
    return scale().to(amount);
  }
);

export const scaleBy:TweenExpressionT = startTermLog(
  function scaleBy(amount) {
    return scale().by(amount);
  }
);

export const scaleIn:TweenExpression2DT = startTermLog(
  function scaleIn() {
    return scale().from({x: 0, y: 0}).to({x: 1, y: 1});
  }
);

export const scaleOut:TweenExpression2DT = startTermLog(
  function scaleOut() {
    return scale().from({x: 1, y: 1}).to({x: 0, y: 0});
  }
);

export const identityScale:TweenExpression2DT = startTermLog(
  function identityScale() {
    return scale().to({x: 1, y: 1});
  }
);

export const fade:TweenExpression1DT = startTermLog(
  function fade() {
    return new Tween1D(
      {
        property: TweenProperty.OPACITY,
      }
    );
  }
);

export const fadeFrom:TweenExpression1DT = startTermLog(
  function fadeFrom(amount:number) {
    return fade().from(amount);
  }
);

export const fadeTo:TweenExpression1DT = startTermLog(
  function fadeTo(amount:number) {
    return fade().to(amount);
  }
);

export const fadeBy:TweenExpression1DT = startTermLog(
  function fadeBy(amount:number) {
    return fade().by(amount);
  }
);

export const fadeIn:TweenExpression1DT = startTermLog(
  function fadeIn() {
    return fade().from(0).to(1);
  }
);

export const fadeOut:TweenExpression1DT = startTermLog(
  function fadeOut() {
    return fade().from(1).to(0);
  }
);
