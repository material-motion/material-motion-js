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
  Draggable,
} from '../interactions/Draggable';

import {
  MotionObservable,
} from '../observables/MotionObservable';

import {
  Axis,
} from '../Axis';

import {
  GestureRecognitionState,
} from '../GestureRecognitionState';

import {
  Observable,
  Observer,
  PartialPointerEvent,
  Point2D,
  Subscription,
} from '../types';

import {
  isPointerEvent,
} from '../typeGuards';

export function dragSystem({
  down$,
  move$,
  up$,
  state,
  axis,
  recognitionThreshold,
}: Draggable): MotionObservable<Point2D> {
  return new MotionObservable<Point2D>(
    (observer: Observer<Point2D>) => {
      let moveSubscription: Subscription;
      const downSubscription: Subscription = down$.subscribe(
        (downEvent: PointerEvent) => {
          const currentAxis = axis.read();

          // If we get a new down event while we're already listening for moves,
          // ignore it.
          if (!moveSubscription) {
            if (isPointerEvent(downEvent)) {
              // The `as Element` is a workaround for
              // https://github.com/Microsoft/TypeScript/issues/299
              (downEvent.target as Element).setPointerCapture(downEvent.pointerId);
            }

            moveSubscription = move$.merge(up$)._filter(
              (nextEvent: PartialPointerEvent) => nextEvent.pointerId === downEvent.pointerId
            ).subscribe(
              (nextEvent: PartialPointerEvent) => {
                const atRest = nextEvent.type.includes('up');

                const translation = {
                  x: currentAxis !== Axis.Y
                    ? nextEvent.pageX - downEvent.pageX
                    : 0,
                  y: currentAxis !== Axis.X
                    ? nextEvent.pageY - downEvent.pageY
                    : 0,
                };

                switch (state.read()) {
                  case GestureRecognitionState.POSSIBLE:
                    if (Math.sqrt(translation.x ** 2 + translation.y ** 2) > recognitionThreshold.read()) {
                      state.write(GestureRecognitionState.BEGAN);
                    }
                    break;

                  case GestureRecognitionState.BEGAN:
                    state.write(GestureRecognitionState.CHANGED);
                    break;

                  default:break;
                }

                if (atRest) {
                  // This would be a takeWhile if we were using an Observable
                  // implementation that supported completion.
                  moveSubscription.unsubscribe();
                  moveSubscription = undefined;

                  if (state.read() === GestureRecognitionState.POSSIBLE) {
                    state.write(GestureRecognitionState.FAILED);
                  } else {
                    state.write(GestureRecognitionState.ENDED);
                  }

                  state.write(GestureRecognitionState.POSSIBLE);
                } else {
                  observer.next(translation);
                }
              }
            );
          }
        }
      );

      return () => {
        downSubscription.unsubscribe();

        if (moveSubscription) {
          moveSubscription.unsubscribe();
        }
      };
    }
  )._multicast();
}
export default dragSystem;
