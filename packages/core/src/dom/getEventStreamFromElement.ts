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
} from '../observables/MotionObservable';

import {
  ObservableWithMotionOperators,
  Observer,
} from '../types';

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

export function getEventStreamFromElement<U extends Event = Event>(type: string, element: Element, eventListenerOptions: AddEventListenerOptions = { passive: true }): ObservableWithMotionOperators<U> {
  return new MotionObservable<U>(
    (observer: Observer<U>) => {
      if (!supportsPassiveListeners) {
        eventListenerOptions = (eventListenerOptions.capture || false) as any as AddEventListenerOptions;
      }

      const next = observer.next.bind(observer);

      // For some reason, TypeScript has an interface for
      // AddEventListenerOptions, but its addEventListener signature hasn't been
      // updated to use it, so for now, we manually cast to boolean.
      //
      // https://github.com/Microsoft/TypeScript/issues/18136
      element.addEventListener(type, next, eventListenerOptions as any as boolean);

      return () => {
        element.removeEventListener(type, next, eventListenerOptions as any as boolean);
      };
    }
  );
}
export default getEventStreamFromElement;
