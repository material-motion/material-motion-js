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
  MotionProperty,
  createProperty,
} from '../observables';

import {
  isPointerEvent,
} from '../typeGuards';

import {
  ObservableWithMotionOperators,
  Observer,
  PartialPointerEvent,
  Point2D,
  PointerEventStreams,
  Subscription,
} from '../types';

import {
  Axis,
} from '../Axis';

import {
  GestureRecognitionState,
} from '../GestureRecognitionState';

export class Draggable {
  // TODO: type this to be the values in the GestureRecognitionState enum
  readonly recognitionState$: MotionProperty<string> = createProperty<string>({
    initialValue: GestureRecognitionState.POSSIBLE,
  });

  get recognitionState(): string {
    return this.recognitionState$.read();
  }

  readonly recognitionThreshold$: MotionProperty<number> = createProperty<number>({
    initialValue: 16,
  });

  get recognitionThreshold(): number {
    return this.recognitionThreshold$.read();
  }

  set recognitionThreshold(value: number) {
    this.recognitionThreshold$.write(value);
  }

  // TODO: type this to be the values in the Axis enum
  readonly axis$: MotionProperty<string> = createProperty<string>({
    initialValue: Axis.ALL,
  });

  get axis(): string {
    return this.axis$.read();
  }

  set axis(value: string) {
    this.axis$.write(value);
  }

  readonly value$: ObservableWithMotionOperators<Point2D>;

  constructor({
    down$,
    move$,
    up$,
    click$,
    dragStart$
  }: PointerEventStreams) {
    this.value$ = new MotionObservable<Point2D>(
      (observer: Observer<Point2D>) => {
        let moveSubscription: Subscription | undefined;

        // If we've recognized a drag, we'll prevent any children from receiving
        // clicks.
        let preventClicks: boolean = false;

        // HTML's OS-integrated drag-and-drop will interrupt a PointerEvent stream
        // without dispatching pointercancel; this is the best way I've found to
        // prevent that.
        //
        // See also https://github.com/w3c/pointerevents/issues/205
        const dragStartSubscription: Subscription = dragStart$.subscribe(
          (dragStartEvent: DragEvent) => {
            dragStartEvent.preventDefault();
          }
        );

        const clickSubscription: Subscription = click$.subscribe(
          (clickEvent: MouseEvent) => {
            if (preventClicks) {
              clickEvent.preventDefault();
              clickEvent.stopImmediatePropagation();
            }
          }
        );

        const downSubscription: Subscription = down$.subscribe(
          (downEvent: PartialPointerEvent) => {
            const currentAxis = this.axis$.read();
            preventClicks = false;

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

                  switch (this.recognitionState$.read()) {
                    case GestureRecognitionState.POSSIBLE:
                      if (Math.sqrt(translation.x ** 2 + translation.y ** 2) > this.recognitionThreshold$.read()) {
                        this.recognitionState$.write(GestureRecognitionState.BEGAN);
                        preventClicks = true;
                      }
                      break;

                    case GestureRecognitionState.BEGAN:
                      this.recognitionState$.write(GestureRecognitionState.CHANGED);
                      break;

                    default:break;
                  }

                  if (atRest) {
                    // This would be a takeWhile if we were using an Observable
                    // implementation that supported completion.
                    moveSubscription!.unsubscribe();
                    moveSubscription = undefined;

                    if (this.recognitionState$.read() === GestureRecognitionState.POSSIBLE) {
                      this.recognitionState$.write(GestureRecognitionState.FAILED);
                    } else {
                      this.recognitionState$.write(GestureRecognitionState.ENDED);
                    }

                    this.recognitionState$.write(GestureRecognitionState.POSSIBLE);
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
          clickSubscription.unsubscribe();
          dragStartSubscription.unsubscribe();

          if (moveSubscription) {
            moveSubscription.unsubscribe();
          }
        };
      }
    )._multicast();
  }
}
export default Draggable;
