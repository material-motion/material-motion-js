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
  ObservableWithMotionOperators,
} from 'material-motion';

import {
  getEventStreamFromElement,
} from './getEventStreamFromElement';

// If/when we care about isomorphic dependents, we can check `typeof window`
// here and export an empty stream if it's undefined.
export const viewportDimensions$ = getEventStreamFromElement(
  'resize', window as any as Element
).startWith({} as Event)._map(
  // Using _map instead of rewriteTo because it should be reevaluated on
  // every resize.
  () => (
    {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  )
)._remember();


export * from './combineStyleStreams';
export { default as combineStyleStreams } from './combineStyleStreams';

export * from './convertTouchEventsToPointerEvents';
export { default as convertTouchEventsToPointerEvents } from './convertTouchEventsToPointerEvents';

export * from './createCustomPropertyObserver';
export { default as createCustomPropertyObserver } from './createCustomPropertyObserver';

export * from './getEventStreamFromElement';
export { default as getEventStreamFromElement } from './getEventStreamFromElement';

export * from './getPointerEventStreamsFromElement';
export { default as getPointerEventStreamsFromElement } from './getPointerEventStreamsFromElement';
