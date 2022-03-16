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
  Axis,
  State,
} from '../enums';

import {
  anyOf,
  not,
  when,
} from '../aggregators';

import {
  getVelocity$,
} from '../getVelocity$';

import {
  MemorylessMotionSubject,
  MotionProperty,
  createProperty,
} from '../observables/';

import {
  subscribe,
} from '../subscribe';

import {
  ObservableWithMotionOperators,
  Point2D,
  TranslateStyleStreams,
} from '../types';

import {
  Draggable,
} from './Draggable';

import {
  Point2DDecayer,
} from './Point2DDecayer';

export type FlingableArgs = {
  draggable: Draggable,
  decayer: Point2DDecayer,
};

export class Flingable {
  readonly state$: MotionProperty<State> = createProperty<State>({
    initialValue: State.AT_REST,
  });

  get state(): State {
    return this.state$.read();
  }

  readonly location$: MotionProperty<Point2D> = createProperty({
    initialValue: { x: 0, y: 0 },
  });

  readonly velocity$: ObservableWithMotionOperators<Point2D>;
  readonly draggedLocation$: ObservableWithMotionOperators<Point2D>;

  readonly draggable: Draggable;
  readonly decayer: Point2DDecayer;

  readonly styleStreams: TranslateStyleStreams;

  constructor({ draggable, decayer }: FlingableArgs) {
    this.draggable = draggable;
    this.decayer = decayer;

    const dragIsAtRest$ = draggable.state$.rewrite<boolean, boolean>({
      mapping: {
        [State.AT_REST]: true,
        [State.ACTIVE]: false,
      }
    }).dedupe();

    const whenDragIsAtRest$ = when(dragIsAtRest$);
    const whenDragIsActive$ = when(not(dragIsAtRest$));

    // This block needs to come before the one that sets decayer enabled to
    // ensure the decayer initializes with the correct values; otherwise, it will
    // start from 0
    subscribe({
      sink: decayer.initialValue$,
      source: this.location$._debounce({ pulse$: whenDragIsAtRest$}),
    });

    const locationOnDown$ = this.location$._debounce({ pulse$: whenDragIsActive$ });

    this.draggedLocation$ = draggable.value$.addedBy<Point2D>({
      value$: locationOnDown$,
      onlyEmitWithUpstream: true
    });

    this.velocity$ = getVelocity$({
      // Since drag starts at rest, whenDragIsAtRest$ emits immediately.  Thus,
      // we start with { 0, 0 } to ensure velocity doesn't emit undefined.
      value$: this.draggedLocation$.startWith({ x: 0, y: 0 }),
      pulse$: whenDragIsAtRest$,
    });

    subscribe({
      sink: decayer.initialVelocity$,
      source: this.velocity$,
    });

    subscribe({
      sink: decayer.enabled$,
      source: dragIsAtRest$,
    });

    subscribe({
      sink: this.state$,
      source: anyOf([
        decayer.state$.isAnyOf([ State.ACTIVE ]),
        draggable.state$.isAnyOf([ State.ACTIVE ]),
      ]).rewrite({
        mapping: {
          true: State.ACTIVE,
          false: State.AT_REST,
        },
      }).dedupe(),
    });

    subscribe({
      sink: this.location$,
      source: decayer.enabled$.rewrite<Point2D, ObservableWithMotionOperators<Point2D>>({
        mapping: {
          true: decayer.value$,
          false: this.draggedLocation$,
        },
        emitOnKeyChange: false,
      })._debounce(),
    });

    this.styleStreams = {
      translate$: this.location$,

      willChange$: this.state$.rewrite<string, string>({
        mapping: {
          [State.ACTIVE]: 'transform',
          [State.AT_REST]: '',
        },
      }),
    };
  }
}
export default Flingable;
