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

import ExperimentalMotionObservable from '../ExperimentalMotionObservable';

// A multi-pointer version of this exists in the streams branch, but it uses
// RxJS operators.  This is a quick prototype using the Material Motion ones and
// a single pointer.

export function createDragStream({
  down$,
  move$,
  up$,
  leave$,
  recognitionThreshold = 16,
}) {
  return ExperimentalMotionObservable.combineLatestFromDict({
    downEvent: down$,
    latestEvents: down$.merge(move$, up$, leave$).withTimestamp().pairwise(),
  })._map(
    ({ downEvent, latestEvents }) => {
      const [
        { value: prevEvent, timestamp: prevTime },
        { value: nextEvent, timestamp: nextTime },
      ] = latestEvents;

      const translation = {
        x: nextEvent.pageX - downEvent.pageX,
        y: nextEvent.pageY - downEvent.pageY,
      };

      return {
        // The only state we care about right now is ENDED, so we cheat on
        // everything else
        recognitionState: (nextEvent.type.includes('up') || nextEvent.type.includes('leave'))
          ? GestureRecognitionState.ENDED
          : GestureRecognitionState.POSSIBLE,
        recognitionThreshold,
        translation,
        velocity: {
          x: (nextEvent.pageX - prevEvent.pageX) / (nextTime - prevTime),
          y: (nextEvent.pageY - prevEvent.pageY) / (nextTime - prevTime),
        },
      };
    }
  );
}

export default createDragStream;
