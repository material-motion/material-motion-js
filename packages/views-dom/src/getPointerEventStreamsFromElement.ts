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
  PointerEventStreams,
} from 'material-motion';

import {
  convertTouchEventsToPointerEvents,
} from './convertTouchEventsToPointerEvents';

import {
  getEventStreamFromElement,
} from './getEventStreamFromElement';

const notPassive: AddEventListenerOptions = {
  passive: false,
  capture: true,
};

export function getPointerEventStreamsFromElement(element: Element): PointerEventStreams {
  const commonStreams = {
    contextMenu$: getEventStreamFromElement<PointerEvent>('click', element),

    // These are streams that a gesture recognizer may want to interrupt when it
    // recognizes a gesture is happening.
    capturedClick$: getEventStreamFromElement<MouseEvent>('click', element, notPassive),
    capturedDragStart$: getEventStreamFromElement<DragEvent>('dragstart', element, notPassive),
  };

  if (typeof PointerEvent !== 'undefined') {
    return {
      down$: getEventStreamFromElement<PointerEvent>('pointerdown', element),
      move$: getEventStreamFromElement<PointerEvent>('pointermove', element),
      up$: getEventStreamFromElement<PointerEvent>('pointerup', element),
      cancel$: getEventStreamFromElement<PointerEvent>('pointercancel', element),
      ...commonStreams,
    };
  } else {
    return {
      down$: getEventStreamFromElement<MouseEvent>('mousedown', element).merge([
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement<TouchEvent>('touchstart', element)
        ),
      ]),
      move$: getEventStreamFromElement<MouseEvent>('mousemove', element).merge([
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement<TouchEvent>('touchmove', element)
        ),
      ]),
      up$: getEventStreamFromElement<MouseEvent>('mouseup', element).merge([
        convertTouchEventsToPointerEvents(
          getEventStreamFromElement<TouchEvent>('touchend', element)
        ),
      ]),
      cancel$: convertTouchEventsToPointerEvents(
        getEventStreamFromElement<TouchEvent>('touchcancel', element)
      ),
      ...commonStreams,
    };
  }
}
export default getPointerEventStreamsFromElement;
