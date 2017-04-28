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
  Dict,
  MotionObservable,
  PartialPointerEvent,
} from 'material-motion';

// TouchEvent types from https://developer.apple.com/reference/webkitjs/touchevent/
// PointerEvent types from https://w3c.github.io/pointerevents/
const TOUCH_TYPE_TO_POINTER_TYPE: Dict<string> = {
  'touchstart': 'pointerdown',
  'touchmove': 'pointermove',
  'touchend': 'pointerup',
  'touchcancel': 'pointercancel',
};

export function convertTouchEventsToPointerEvents(touchEvent$: MotionObservable<TouchEvent>): MotionObservable<PartialPointerEvent> {
  return touchEvent$._map(
    ({ type, targetTouches, changedTouches }: TouchEvent) => Array.from(
      type === 'touchend'
        ? changedTouches
        : targetTouches,
      ({ pageX, pageY, identifier }: Touch) => (
        {
          pageX,
          pageY,
          pointerId: identifier,
          type: TOUCH_TYPE_TO_POINTER_TYPE[type]
        }
      )
    )
  )._flattenIterables();
}
export default convertTouchEventsToPointerEvents;
