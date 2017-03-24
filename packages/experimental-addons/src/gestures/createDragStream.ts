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
  Observable,
  Observer,
  Subscription,
} from 'material-motion';

import ExperimentalMotionObservable from '../ExperimentalMotionObservable';
import GestureRecognitionState from './GestureRecognitionState';

import {
  Timestamped,
  TranslationGestureRecognition,
} from '../types';

// A multi-pointer version of this exists in the streams branch, but it uses
// RxJS operators.  This is a quick prototype using the Material Motion ones and
// a single pointer.

export type createDragStreamArgs = {
  down$: Observable<PointerEvent>,
  move$: Observable<PointerEvent>,
  up$: Observable<PointerEvent>,
  recognitionThreshold: number,
};

export function createDragStream({
  down$,
  move$,
  up$,
  recognitionThreshold = 16,
}:createDragStreamArgs): ExperimentalMotionObservable<TranslationGestureRecognition> {
  return new ExperimentalMotionObservable<TranslationGestureRecognition>(
    (observer: Observer<TranslationGestureRecognition>) => {
      let recognitionState: GestureRecognitionState = GestureRecognitionState.POSSIBLE;

      let moveSubscription: Subscription;
      const downSubscription: Subscription = down$.subscribe(
        (downEvent: PointerEvent) => {
          downEvent.target.setPointerCapture(downEvent.pointerId);

          // down$ is repeated here because we need two events to be able to
          // calculate the distance between them.  Including down$ and
          // using pairwise(), makes the logic for this simple.
          const pointerEvent$ = down$.merge(move$, up$)._filter(
            (event: PointerEvent) => event.pointerId === downEvent.pointerId
          );

          moveSubscription = pointerEvent$.withTimestamp().pairwise().subscribe(
            (latestEvents: Array<Timestamped<PointerEvent>>) => {
              const [
                { value: prevEvent, timestamp: prevTime },
                { value: nextEvent, timestamp: nextTime },
              ] = latestEvents;

              const atRest = nextEvent.type.includes('up');

              const translation = {
                x: nextEvent.pageX - downEvent.pageX,
                y: nextEvent.pageY - downEvent.pageY,
              };

              const velocity = {
                x: (nextEvent.pageX - prevEvent.pageX) / (nextTime - prevTime),
                y: (nextEvent.pageY - prevEvent.pageY) / (nextTime - prevTime),
              };

              switch (recognitionState) {
                case GestureRecognitionState.POSSIBLE:
                  if (Math.abs(translation.x ** 2 + translation.y ** 2) > recognitionThreshold) {
                    recognitionState = GestureRecognitionState.BEGAN;
                  }
                  break;

                case GestureRecognitionState.BEGAN:
                  recognitionState = GestureRecognitionState.CHANGED;
                  break;

                default:break;
              }

              if (atRest) {
                // This would be a takeWhile if we were using an Observable
                // implementation that supported completion.
                moveSubscription.unsubscribe();

                if (recognitionState === GestureRecognitionState.POSSIBLE) {
                  recognitionState = GestureRecognitionState.FAILED;
                } else {
                  recognitionState = GestureRecognitionState.ENDED;
                }
              }

              observer.next({
                recognitionState,
                translation,
                velocity,
              });

              if (atRest) {
                recognitionState = GestureRecognitionState.POSSIBLE;
              }
            }
          );
        }
      );

      return () => {
        downSubscription.unsubscribe();

        if (moveSubscription) {
          moveSubscription.unsubscribe();
        }
      };
    }
  );
}

export default createDragStream;
