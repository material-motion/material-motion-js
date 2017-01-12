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
  MotionElement,
  Point2D,
} from '../types';

import {
  MotionObservable,
} from '../observables/MotionObservable';

/**
 * Returns a stream of scroll positions from the given `MotionElement`.
 *
 * Internally, this reads from the element's `scrollPosition`, which is likely
 * backed by the DOM.  Recall that each stream subscription executes
 * independently; therefore, try to do all your work in a single subscription.
 * Otherwise, you risk reading/writing repeatedly to the DOM (also known as
 * thrashing), which can be detrimental to browser performance.
 *
 * https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing
 */
export default function scrollSource(element: MotionElement): MotionObservable<Point2D> {
  return element.getEvent$('scroll')._debounce()._map(
    () => element.scrollPosition.read()
  );
}
