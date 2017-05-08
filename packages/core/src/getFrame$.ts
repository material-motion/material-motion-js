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
} from './observables/proxies';

import {
  ObservableWithMotionOperators,
  Observer,
} from './types';

/**
 * A stream backed by `requestAnimationFrame`, called once per frame with that
 * frame's timestamp.
 *
 * Useful as a pulse for `_debounce` to ensure that UI work only happens once
 * per frame.  Since no rendering will happen until `requestAnimationFrame` is
 * called, it should be safe to `_debounce(frame$)` without missing a frame.
 */
let frame$: MotionObservable<number>;
export function getFrame$() {
  if (!frame$) {
    frame$ = new MotionObservable<number>(
      (observer: Observer<number>) => {
        let queuedFrameID = 0;

        function queueFrame(frameTimestamp?: number) {
          if (frameTimestamp) {
            observer.next(frameTimestamp);
          }

          queuedFrameID = requestAnimationFrame(queueFrame);
        }

        queueFrame();

        return () => {
          cancelAnimationFrame(queuedFrameID);
        };
      }
    )._multicast();
  }

  return frame$;
}
