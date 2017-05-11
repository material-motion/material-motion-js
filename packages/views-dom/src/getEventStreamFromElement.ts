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
  Observer,
} from 'material-motion';

// Passive event feature detection from
// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
let supportsPassiveListeners = false;
try {
  const eventOptions: any = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassiveListeners = true;
    }
  });
  window.addEventListener("test", () => {}, eventOptions);
} catch (e) {}

export function getEventStreamFromElement(type: string, element: Element, eventListenerOptions: AddEventListenerOptions = { passive: true }): MotionObservable<Event> {
  return new MotionObservable(
    (observer: Observer<Event>) => {
      if (!supportsPassiveListeners) {
        eventListenerOptions = false;
      }

      element.addEventListener(type, observer.next, eventListenerOptions);

      return () => {
        element.removeEventListener(type, observer.next, eventListenerOptions);
      };
    }
  );
}
export default getEventStreamFromElement;
