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
  dragSystem,
} from '../systems/dragSystem';

import {
  DragSystem,
  PartialPointerEvent,
  Point2D,
} from '../types';

import {
  Axis,
} from '../Axis';

import {
  GestureRecognitionState,
} from '../GestureRecognitionState';

export type DraggableArgs = {
  down$: MotionObservable<PartialPointerEvent>,
  move$: MotionObservable<PartialPointerEvent>,
  up$: MotionObservable<PartialPointerEvent>,
  axis?: string,
  recognitionThreshold?: number,
  system?: DragSystem,
};

export class Draggable {
  state: MotionProperty<string> = createProperty<string>({ initialValue: GestureRecognitionState.POSSIBLE });
  recognitionThreshold: MotionProperty<number> = createProperty<number>();
  axis: MotionProperty<string> = createProperty<string>();
  down$: MotionObservable<PartialPointerEvent>;
  move$: MotionObservable<PartialPointerEvent>;
  up$: MotionObservable<PartialPointerEvent>;
  system: DragSystem;

  constructor({
    down$,
    move$,
    up$,
    axis = Axis.ALL,
    recognitionThreshold = 16,
    system = dragSystem,
  }: DraggableArgs) {
    this.down$ = down$;
    this.move$ = move$;
    this.up$ = up$;

    this.axis.write(axis);
    this.recognitionThreshold.write(recognitionThreshold);

    this.system = system;
  }
}
export default Draggable;
