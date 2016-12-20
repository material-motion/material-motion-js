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
  Performing,
  PerformingAddPlanArgs,
  PerformingArgs,
  Plan,
} from 'material-motion-runtime';

import MapScrollPositionToCSSValuePlan from './MapScrollPositionToCSSValuePlan';

export default class MapScrollPositionToCSSValuePerformer implements Performing {
  _awaitingRedraw: boolean = false;
  _target: HTMLElement;
  _plan: MapScrollPositionToCSSValuePlan;

  constructor({ target }:PerformingArgs) {
    this._target = target as HTMLElement;

    // Should probably be smarter about when to set willChange,
    // but it works for a demo
    let willChange = this._target.style.willChange;

    if (!willChange.includes('transform')) {
      if (willChange) {
        willChange += ', ';
      }

      willChange += 'transform';

      this._target.style.willChange = willChange;
    }

    document.addEventListener('scroll', this._queueRedraw);
    document.addEventListener('resize', this._queueRedraw);
  }

  addPlan({ plan }:{ plan: MapScrollPositionToCSSValuePlan }) {
    this._plan = plan;
    this._redraw();
  }

  _queueRedraw = () => {
    if (!this._awaitingRedraw) {
      requestAnimationFrame(this._redraw);
    }

    this._awaitingRedraw = true;
  }

  _redraw = () => {
    const {
      propertyName,
      valueTemplate,
      fromValue,
      toValue,
      scrollOffset = 0,
      // We need to check scrollTop anyway to do the interpolating, so
      // scrollHeight shouldn't cost anything extra.
      scrollRange = document.body.scrollHeight - window.innerHeight,
    } = this._plan;

    const valueRange = toValue - fromValue;

    if (!scrollRange) {
      console.warn(
        'MapScrollPositionToCSSValuePerformer cannot map from a scroll range of 0; aborting'
      );
      return;
    }

    // If multiple performer instances are listening to scroll, you'll end up
    // reading and writing to the DOM in each one's _redraw.  When this gets
    // split into its own stepper, batch/cache scroll position measuring
    // (perhaps using the event's timestamp) to avoid thrashing the DOM.
    const scrollPosition = window.scrollY;

    let result: number;

    if (scrollPosition <= scrollOffset) {
      result = fromValue;

    } else if (scrollPosition >= scrollOffset + scrollRange) {
      result = toValue;

    } else {
      result = fromValue + valueRange * (scrollPosition - scrollOffset) / scrollRange;
    }

    // element.style[key] = value doesn't work in TypeScript
    // https://github.com/Microsoft/TypeScript/issues/11914
    this._target.style.setProperty(propertyName, valueTemplate.replace(/__/g, result.toFixed(2)));

    this._awaitingRedraw = false;
  }
}
