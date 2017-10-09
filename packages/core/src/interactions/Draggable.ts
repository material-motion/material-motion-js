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
  when,
  not,
} from '../aggregators';

import {
  Axis,
  GestureRecognitionState,
  State,
} from '../enums';

import {
  MemorylessMotionSubject,
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

export class Draggable {
  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  readonly recognitionState$: MotionProperty<GestureRecognitionState> = createProperty<GestureRecognitionState>({
    initialValue: GestureRecognitionState.POSSIBLE,
  });

  get recognitionState(): GestureRecognitionState {
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

  readonly axis$: MotionProperty<Axis> = createProperty<Axis>({
    initialValue: Axis.ALL,
  });

  get axis(): Axis {
    return this.axis$.read();
  }

  set axis(value: Axis) {
    this.axis$.write(value);
  }

  readonly cancellation$: MemorylessMotionSubject<any> = new MemorylessMotionSubject();

  cancel(): void {
    this.cancellation$.next(undefined);
  }

  readonly enabled$: MemorylessMotionSubject<boolean> = new MemorylessMotionSubject();

  enable(): void {
    this.enabled$.next(true);
  }

  disable(): void {
    this.enabled$.next(false);
  }

  readonly value$: ObservableWithMotionOperators<Point2D>;

  readonly down$: ObservableWithMotionOperators<PartialPointerEvent>;
  readonly move$: ObservableWithMotionOperators<PartialPointerEvent>;
  readonly up$: ObservableWithMotionOperators<PartialPointerEvent>;
  readonly cancel$: ObservableWithMotionOperators<PartialPointerEvent>;
  readonly contextMenu$: ObservableWithMotionOperators<PartialPointerEvent>;
  readonly capturedClick$: ObservableWithMotionOperators<MouseEvent>;
  readonly capturedDragStart$: ObservableWithMotionOperators<DragEvent>;

  constructor({
    down$,
    move$,
    up$,
    cancel$,
    contextMenu$,
    capturedClick$,
    capturedDragStart$
  }: PointerEventStreams) {
    this.down$ = down$;
    this.move$ = move$;
    this.up$ = up$;
    this.cancel$ = cancel$;
    this.contextMenu$ = contextMenu$;
    this.capturedClick$ = capturedClick$;
    this.capturedDragStart$ = capturedDragStart$;

    this.value$ = new MotionObservable<Point2D>(
      (observer: Observer<Point2D>) => {
        let downSubscription: Subscription | undefined;
        let moveSubscription: Subscription | undefined;
        let cancellationSubscription: Subscription | undefined;
        let enabledSubscription: Subscription | undefined;

        // If we've recognized a drag, we'll prevent any children from receiving
        // clicks.
        let preventClicks: boolean = false;

        // HTML's OS-integrated drag-and-drop will interrupt a PointerEvent stream
        // without emitting pointercancel; this is the best way I've found to
        // prevent that.
        //
        // See also https://github.com/w3c/pointerevents/issues/205
        const capturedDragStartSubscription: Subscription = capturedDragStart$.subscribe(
          (dragStartEvent: DragEvent) => {
            dragStartEvent.preventDefault();
          }
        );

        const capturedClickSubscription: Subscription = capturedClick$.subscribe(
          (clickEvent: MouseEvent) => {
            if (preventClicks) {
              clickEvent.preventDefault();
              clickEvent.stopImmediatePropagation();
            }
          }
        );

        const subscribeToDown = () => {
          return down$.subscribe(
            (downEvent: PartialPointerEvent) => {
              this.state$.write(State.ACTIVE);

              const currentAxis = this.axis$.read();

              // If we get a new down event while we're already listening for
              // moves, ignore it.
              if (!moveSubscription) {
                preventClicks = false;

                if (isPointerEvent(downEvent)) {
                  // The `as Element` is a workaround for
                  // https://github.com/Microsoft/TypeScript/issues/299
                  (downEvent.target as Element).setPointerCapture(downEvent.pointerId);
                }

                moveSubscription = move$.merge([ up$ ])._filter({
                  predicate: (nextEvent: PartialPointerEvent) => nextEvent.pointerId === downEvent.pointerId
                }).subscribe(
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

                      // Doing the simple thing for now and setting AT_REST in up,
                      // but it might be better on a delay to give time for clicks
                      // to happen first.
                      this.state$.write(State.AT_REST);

                      this.recognitionState$.write(GestureRecognitionState.POSSIBLE);
                    } else {
                      observer.next(translation);
                    }
                  }
                );
              }
            }
          );
        };
        downSubscription = subscribeToDown();

        enabledSubscription = this.enabled$.subscribe(
          (enabled) => {
            if (enabled && !downSubscription) {
              downSubscription = subscribeToDown();

            } else if (!enabled && downSubscription) {
              downSubscription.unsubscribe();
              downSubscription = undefined;
              preventClicks = false;
              // moveSubscription handled by cancellation flow
            }
          }
        );

        cancellationSubscription = this.cancellation$.merge([
          when(not(this.enabled$)),
          cancel$,
          contextMenu$,
        ]).subscribe(
          () => {
            if (moveSubscription) {
              moveSubscription.unsubscribe();
              moveSubscription = undefined;

              this.recognitionState$.write(GestureRecognitionState.CANCELLED);
              this.state$.write(State.AT_REST);
              this.recognitionState$.write(GestureRecognitionState.POSSIBLE);
            }
          }
        );

        return () => {
          capturedClickSubscription.unsubscribe();
          capturedDragStartSubscription.unsubscribe();

          if (downSubscription) {
            downSubscription.unsubscribe();
          }

          if (moveSubscription) {
            moveSubscription.unsubscribe();
          }

          if (cancellationSubscription) {
            cancellationSubscription.unsubscribe();
          }

          if (enabledSubscription) {
            enabledSubscription.unsubscribe();
          }
        };
      }
    )._multicast();
  }
}
export default Draggable;
