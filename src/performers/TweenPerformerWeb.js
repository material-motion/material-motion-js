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

import {first} from 'rxjs-es/operator/first';
import {fromEvent as observableFromEvent} from 'rxjs-es/observable/fromEvent';
import {mergeMap as flatMap} from 'rxjs-es/operator/mergeMap';
import {Observable} from 'rxjs-es/Observable';
import {raceStatic as raceObservables} from 'rxjs-es/operator/race';
import {startWith} from 'rxjs-es/operator/startWith';
import {Subject} from 'rxjs-es/Subject';

import {
  registerPerformerFactory,
} from '../performerFactoryRegistry';

import {
  areStreamsBalanced,
} from '../observables';

import {
  TweenProperty,
} from '../families/TweenFamily';

import type {
  PlanT,
} from '../Plan';

import type {
  PlanAndTargetT,
} from '../Performer';

import type {
  TweenPlanT,
  TweenPlanValueT,
} from '../families/TweenFamily';

export type PlanAndTargetElementT = {
  target:Element,
}&PlanAndTargetT;

// TODO(https://github.com/material-motion/material-motion-experiments-js/issues/8):
// Add support for Element.prototype.animate to Flow

export default function tweenPerformerWebFactory(targetAndPlan:PlanAndTargetElementT) {
  return new TweenPerformerWeb(targetAndPlan);
}

tweenPerformerWebFactory.canHandle = function ({target, plan}:PlanAndTargetT):boolean {
  // It may be interesting to have a debug mode where this logs the tests
  // and whether they pass/fail.

  // // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/52):
  // // get a plan spec by its family name and assert its validity
  // console.assert(
  //  plan.isValid(),
  //  'TweenPerformerWeb received an invalid Plan.',
  //  plan
  // );

  return (
    target.animate &&
    target instanceof Element &&

    // A valid tween plan could use a spring or a bezier interpolator.
    // After confirming that this is a valid TweenFamily plan, check that it
    // has the requisite bezier parameters:
    plan.duration > 0 &&
    plan.easing && plan.easing.length === 4
  );
};

registerPerformerFactory(tweenPerformerWebFactory);

class TweenPerformerWeb {
  _target:Element;
  _playerStream:Subject = new Subject();

  // Track whether we've received a completion event for every player.
  //
  // We're presuming that players start playing immediately and only finish
  // once.  So long as nobody calls player.{reverse,pause,play,finish,cancel},
  // this presumption should hold.
  _isAtRestStream:Observable = areStreamsBalanced(
    this._playerStream,
    this._playerStream::flatMap(
      player => raceObservables(
        observableFromEvent(player, 'finish'),
        observableFromEvent(player, 'cancel'),
      )::first()
    )
  )::startWith(true);

  get isAtRestStream():Observable {
    return this._isAtRestStream;
  }

  get isAtRest():boolean {
    return this._isAtRest;
  }

  constructor({target, plan}:PlanAndTargetElementT) {
    this._target = target;

    this._isAtRestSubscription = this._isAtRestStream.subscribe(
      isAtRest => {
        this._isAtRest = isAtRest;
      }
    );

    if (plan)
      this.addPlan(plan);
  }

  addPlan(plan:PlanT):void {
    console.assert(
      tweenPerformerWebFactory.canHandle(
        {
          target: this._target,
          plan,
        }
      ),
      `TweenPerformerWeb doesn't know how to handle this Plan.`,
      plan
    );

    console.log(
      `TweenPerformerWeb doesn't yet handle multiple simultaneous`,
      `plans, so we log them here so you can see we've received them.`,
      plan
    );

    const player = this._target.animate(
      ...animateArgsForPlanAndTarget(plan, this._target)
    );

    this._playerStream.next(player);
  }

  dispose():void {
    this._isAtRestSubscription.unsubscribe();
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
function animateArgsForPlanAndTarget(plan:TweenPlanT, target:Element) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Animation_timing_options
  const options = {
    duration: plan.duration * 1000,
    easing: `cubic-bezier(${ plan.easing.join(', ') })`,
    composite: 'accumulate',
    fill: 'both',
  };

  // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/10):
  // I'm being super naïve here because I'm not entirely sure what the
  // difference should be between to and by.  `from` and `to` are absolute
  // terms, but absolute relative to which coordinate space?  Are they relative
  // to wherever the element happens to be, to the viewport, or to the
  // document?  Does the answer differ for moves versus fade, scales, or
  // rotations?  If it's absolute to the document, and we receive a fadeIn, how
  // do we handle cases where an ancestor has a translucent opacity?

  let planProperty = plan.property;
  let start, end;

  if (plan.from !== undefined) {
    start = getFrameFromPlan(plan, 'from');

  } else if (plan.to !== undefined && plan.by !== undefined) {
    start = getFrameFromPlan(
      {
        ...plan,
        by: 0,
        from: subtractValues(
          plan.by,
          plan.to
        ),
      },
      'from'
    );

  } else {
    start = introspectCurrentFrameForTarget(plan, target);
  }

  if (plan.to !== undefined) {
    end = getFrameFromPlan(plan, 'to');

  } else if (plan.by !== undefined) {
    const cssKey = getCSSKey(planProperty);
    const startValue = start[cssKey];

    let from = planProperty === TweenProperty.OPACITY
      ? parseFloat(startValue)
      : getValueFromTransform(planProperty, startValue);

    end = getFrameFromPlan(
      {
        ...plan,
        by: 0,
        to: addValues(from, plan.by),
      },
      'to'
    );

  } else {
    end = introspectCurrentFrameForTarget(plan, target);
  }

  return [
    [
      start,
      end,
    ],
    options,
  ];
}

function introspectCurrentFrameForTarget(plan:TweenPlanT, target:Element) {
  const key = getCSSKey(plan.property);

  // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/9):
  // - Add unit tests for all these little helper functions
  // - Make sure {x: 10, y: 10} + {x: 48} = {x: 58, y: 10}

  throw new Error(
    `getComputedStyle returns matricies, which TweenPerformerWeb doesn't yet ` +
    `know how to parse`
  );

  const value = getComputedStyle(target)[key];

  return {
    [key]: value,
  };
}

function getFrameFromPlan(plan:TweenPlanT, frameName) {
  let [
    key,
    value,
  ] = getCSSPair(
    plan.property,
    plan[frameName]
  );

  return {
    [key]: value,
  };
}

function getCSSKey(planProperty:$Enum<typeof TweenProperty>) {
  return planProperty === TweenProperty.OPACITY
    ? 'opacity'
    : 'transform';
}

function getCSSPair(planProperty:string, value:TweenPlanValueT):[string, string] {
  let cssKey = getCSSKey(planProperty);
  let cssValue;

  switch (planProperty) {
    /* eslint-disable no-negated-condition */
    case TweenProperty.TRANSLATION:
      if (value.constructor === Number) {
        throw new Error(
          `Cannot create a CSS translate from a Number literal.`
        );

      } else if (value.x !== undefined && value.y !== undefined) {
        cssValue = `translate(${ value.x }px, ${ value.y }px)`;

      } else if (value.x !== undefined) {
        cssValue = `translateX(${ value.x }px)`;

      } else if (value.y !== undefined) {
        cssValue = `translateY(${ value.y }px)`;

      } else {
        throw new Error(
          `Cannot create a CSS translate without an x or y.`
        );
      }
      break;

    case TweenProperty.ROTATION:
      cssValue = `rotate(${ value }deg)`;
      break;

    case TweenProperty.SCALE:
      if (value.constructor === Number) {
        cssValue = `scale(${ value })`;

      } else if (value.x !== undefined && value.y !== undefined) {
        cssValue = `scale(${ value.x }, ${ value.y })`;

      } else if (value.x !== undefined) {
        cssValue = `scaleX(${ value.x })`;

      } else if (value.y !== undefined) {
        cssValue = `scaleY(${ value.y })`;

      } else {
        throw new Error(
          `Cannot create a CSS scale without an x or y.`
        );
      }
      break;

    case TweenProperty.OPACITY:
      cssValue = value.toFixed(2);
      break;

    default:
      throw new Error(
        `getCSSPair doesn't recognize (${ planProperty }, ${ value })`
      );
    /* eslint-enable no-negated-condition */
  }

  return [
    cssKey,
    cssValue,
  ];
}

function getArgumentsFromTransform(methodName, transform) {
  const regEx = new RegExp(methodName + '[XY]?3?d?\\(([^)]+)\\)', 'g');

  const pieces = regEx.exec(transform);

  console.assert(
    pieces !== null,
    `${ methodName } not found in ${ transform }`
  );

  const result = pieces[1];

  console.assert(
    regEx.exec(transform) === null,
    `Multiple calls to ${ methodName } found in ${ transform }`
  );

  return result;
}

function getValueFromTransform(methodName:string, transform:string):TweenPlanValueT {
  const transformArguments = getArgumentsFromTransform(
    methodName,
    transform
  );

  const transformValues = transformArguments.replace(/\s+/g, '').split(',').map(
    arg => {
      const [, value, unit] = (/([\-\+]?\d+)(\w*)/).exec(arg);

      console.assert(
        ['', 'deg', 'px'].includes(unit),
        `getValueFromTransform doesn't support ${ unit }`
      );

      return parseFloat(value);
    }
  );

  if (transform.includes(methodName + 'X')) {
    return {
      x: transformValues[0],
    };

  } else if (transform.includes(methodName + 'Y')) {
    return {
      y: transformValues[0],
    };

  } else if (transformValues.length === 1) {
    return transformValues[0];

  } else {
    return {
      x: transformValues[0],
      y: transformValues[1],
    };
  }
}

// Would like to assert that start, end, and result are all the same type, but
// Flow doesn't seem to support that yet
//
// https://flowtype.org/docs/functions.html#overloading
function addValues(start:TweenPlanValueT, end:TweenPlanValueT):TweenPlanValueT {
  console.assert(
    start.constructor === end.constructor,
    `Cannot add values of differing shapes`, start, end
  );

  if (start.constructor === Number) {
    return end + start;

  } else {
    let result = {};

    if (start.x !== undefined || end.x !== undefined)
      result.x = (end.x || 0) + (start.x || 0);

    if (start.y !== undefined || end.y !== undefined)
      result.y = (end.y || 0) + (start.y || 0);

    return result;
  }
}

function subtractValues(start:TweenPlanValueT, end:TweenPlanValueT):TweenPlanValueT {
  console.assert(
    start.constructor === end.constructor,
    `Cannot subtract values of differing shapes`, start, end
  );

  if (start.constructor === Number) {
    return end - start;

  } else {
    let result = {};

    if (start.x !== undefined || end.x !== undefined)
      result.x = (end.x || 0) - (start.x || 0);

    if (start.y !== undefined || end.y !== undefined)
      result.y = (end.y || 0) - (start.y || 0);

    return result;
  }
}
