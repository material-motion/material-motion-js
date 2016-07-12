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

import Scheduler from '../Scheduler';

import {
  TweenProperty,
} from '../expressions/tween';

import type {
  PlanT,
} from '../Plan';

import type {
  PlanAndTargetT,
} from '../Performer';

import type {
  PlanValueT,
} from '../expressions/tween';

export type PlanAndTargetElementT = PlanAndTargetT&{
  target:Element,
}

// TODO(https://github.com/material-motion/material-motion-experiments-js/issues/8):
// Add support for Element.prototype.animate to Flow

export default class TweenPerformerWeb {
  static canHandle({target, plan}:PlanAndTargetT) {
    // It may be interesting to have a debug mode where this logs the tests
    // and whether they pass/fail.

    // // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/3):
    // // get a plan spec by its family name and assert its validity
    // console.assert(
    //  plan.isValid(),
    //  'TweenPerformerWeb received an invalid Plan.',
    //  plan
    // );

    return (
      target.animate &&
      target instanceof Element &&
      plan.has('duration') &&
      plan.has('easing')
    );
  }

  _target:Element;

  constructor({target, plan}:PlanAndTargetElementT) {
    this._target = target;

    if (plan)
      this.addPlan(plan);
  }

  addPlan(plan:PlanT) {
    console.assert(
      TweenPerformerWeb.canHandle(
        {
          target: this._target,
          plan,
        }
      ),
      `TweenPerformerWeb doesn't know how to handle this Plan.`,
      plan
    );

    console.log(
      `TweenPerformerWeb doesn't yet handle multiple simultaeneous`,
      `plans, so we log them here so you can see we've received them.`,
      plan.toJS()
    );

    this._target.animate(
      ...animateArgsForPlanAndTarget(plan, this._target)
    );
  }
}

Scheduler.registerPerformer(TweenPerformerWeb);

// https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
function animateArgsForPlanAndTarget(plan, target) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Animation_timing_options
  const options = {
    duration: plan.get('duration') * 1000,
    easing: `cubic-bezier(${ plan.get('easing').join(', ') })`,
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

  let planProperty = plan.get('property');
  let start, end;

  if (plan.has('from')) {
    start = getFrameFromPlan(plan, 'from');

  } else if (plan.has('to') && plan.has('by')) {
    start = getFrameFromPlan(
      plan.set(
        'from',
        subtractValues(
          plan.get('by'),
          plan.get('to')
        )
      ).delete('by'),
      'from'
    );

  } else {
    start = introspectCurrentFrameForTarget(plan, target);
  }

  if (plan.has('to')) {
    end = getFrameFromPlan(plan, 'to');

  } else if (plan.has('by')) {
    const cssKey = getCSSKey(planProperty);
    const startValue = start[cssKey];

    let from = planProperty === TweenProperty.OPACITY
      ? parseFloat(startValue)
      : getValueFromTransform(planProperty, startValue);

    end = getFrameFromPlan(
      plan.set(
        'to',
        addValues(from, plan.get('by'))
      ).delete('by'),
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

function introspectCurrentFrameForTarget(plan, target) {
  const key = getCSSKey(
    plan.get('property')
  );

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

function getFrameFromPlan(plan, frameName) {
  let [
    key,
    value,
  ] = getCSSPair(
    plan.get('property'),
    plan.get(frameName)
  );

  return {
    [key]: value,
  };
}

function getCSSKey(planProperty) {
  return planProperty === TweenProperty.OPACITY
    ? 'opacity'
    : 'transform';
}

function getCSSPair(planProperty:string, value:PlanValueT):[string, string] {
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

function getValueFromTransform(methodName:string, transform:string):PlanValueT {
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
function addValues(start:PlanValueT, end:PlanValueT):PlanValueT {
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

function subtractValues(start:PlanValueT, end:PlanValueT):PlanValueT {
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
