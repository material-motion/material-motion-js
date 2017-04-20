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

import createProperty from '../properties/createProperty';

import {
  Observable,
  PartialPointerEvent,
  PropertyObservable,
} from '../types';

import {
  State,
} from '../State';

export type PointerEventStreams = {
  down$: Observable<PartialPointerEvent>;
  move$: Observable<PartialPointerEvent>;
  up$: Observable<PartialPointerEvent>;
};

export class Draggable {
  state: PropertyObservable<State> = createProperty<State>({ initialValue: State.AT_REST });
  recognitionThreshold: PropertyObservable<number> = createProperty<number>({ initialValue: 16 });
  down$: Observable<PartialPointerEvent>;
  move$: Observable<PartialPointerEvent>;
  up$: Observable<PartialPointerEvent>;

  constructor({ down$, move$, up$ }: PointerEventStreams) {
    this.down$ = down$;
    this.move$ = move$;
    this.up$ = up$;
  }
}
export default Draggable;
