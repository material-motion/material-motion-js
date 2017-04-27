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
  MotionObservable,
  PartialPointerEvent,
} from 'material-motion';

import {
  convertTouchEventsToPointerEvents,
} from './convertTouchEventsToPointerEvents';

import {
  getEventStreamFromElement,
} from './getEventStreamFromElement';

export type PointerEventStreams = {
  down$: MotionObservable<PartialPointerEvent>,
  move$: MotionObservable<PartialPointerEvent>,
  up$: MotionObservable<PartialPointerEvent>,
};

export function getPointerEventStreamsFromElement(element: Element): PointerEventStreams {
  if (window.PointerEvent) {
    return {
      down$: getEventStreamFromElement('pointerdown', element),
      move$: getEventStreamFromElement('pointermove', element),
      up$: getEventStreamFromElement('pointerup', element),
    };
  } else {
    return {
      down$: getEventStreamFromElement('mousedown', element).merge(
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement('touchstart', element)
        )
      ),
      move$: getEventStreamFromElement('mousemove', element).merge(
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement('touchmove', element)
        )
      ),
      up$: getEventStreamFromElement('mouseup', element).merge(
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement('touchend', element)
        )
      ),
    };
  }
}
export default getPointerEventStreamsFromElement;
