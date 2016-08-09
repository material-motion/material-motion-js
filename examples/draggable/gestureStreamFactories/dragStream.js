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

import {fromEvent as observableFromEvent} from 'rxjs-es/observable/fromEvent';
import {combineLatest} from 'rxjs-es/observable/combineLatest';
import {map} from 'rxjs-es/operator/map';
import {merge} from 'rxjs-es/operator/merge';
import {mergeMap as flatMap} from 'rxjs-es/operator/mergeMap';
import {takeUntil} from 'rxjs-es/operator/takeUntil';

export default function dragStream(target) {
  const USE_POINTER_EVENTS = window.PointerEvent !== undefined;

  const eventFamilyName = global.PointerEvent
      ? 'pointer'
      : 'mouse';

  const downStream = observableFromEvent(target, eventFamilyName + 'down');
  const moveStream = observableFromEvent(document, eventFamilyName + 'move');
  const upStream = observableFromEvent(document, eventFamilyName + 'up');

  const isDownStream = downStream::merge(upStream)::map(
    event => event.type.includes('down')
  );

  const deltaStream = downStream::flatMap(
    downEvent => {
      // preventing default on pointer events surpresses their dispatch
      if (!USE_POINTER_EVENTS) {
        downEvent.preventDefault();
      }

      return moveStream::map(
        moveEvent => {
          if (!USE_POINTER_EVENTS) {
            moveEvent.preventDefault();
          }

          return {
            x: moveEvent.pageX - downEvent.pageX,
            y: moveEvent.pageY - downEvent.pageY,
          };
        }
      )::takeUntil(upStream);
    }
  );

  return combineLatest(
    isDownStream,
    deltaStream,
    (isDown, delta) => (
      {
        ...delta,
        isAtRest: !isDown,
      }
    )
  );
}
