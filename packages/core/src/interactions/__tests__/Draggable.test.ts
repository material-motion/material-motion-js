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

import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

import {
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  GestureRecognitionState,
} from '../../GestureRecognitionState';

import {
  MotionObservable,
  createProperty,
} from '../../observables/';

import {
  Draggable,
} from '../Draggable';

describe('Draggable',
  () => {
    let draggable;
    let downObserver;
    let moveObserver;
    let upObserver;
    let clickObserver;
    let dragStartObserver;
    let listener;

    beforeEach(
      () => {
        downObserver = createMockObserver();
        moveObserver = createMockObserver();
        upObserver = createMockObserver();
        clickObserver = createMockObserver();
        dragStartObserver = createMockObserver();
        listener = stub();

        draggable = new Draggable({
          down$: new MotionObservable(downObserver.connect),
          move$: new MotionObservable(moveObserver.connect),
          up$: new MotionObservable(upObserver.connect),
          click$: new MotionObservable(clickObserver.connect),
          dragStart$: new MotionObservable(dragStartObserver.connect),
        });
        draggable.value$.subscribe(listener);
      }
    );

    it(`should not repeat the same value for move and up`,
      () => {
        downObserver.next({
          type: 'pointerdown',
          pageX: 0,
          pageY: 0,
        });

        moveObserver.next({
          type: 'pointermove',
          pageX: 10,
          pageY: 20,
        });

        upObserver.next({
          type: 'pointerup',
          pageX: 10,
          pageY: 20,
        });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({
          x: 10,
          y: 20,
        });
      }
    );

    it(`should suppress dragStart`,
      () => {
        const dragStartEvent = {
          preventDefault: stub(),
        };

        dragStartObserver.next(dragStartEvent);

        expect(dragStartEvent.preventDefault).to.have.been.calledOnce;
      }
    );

    it(`should suppress clicks if recognitionThreshold has been crossed`,
      () => {
        draggable.recognitionThreshold = 15;

        downObserver.next({
          type: 'pointerdown',
          pageX: 0,
          pageY: 0,
        });

        moveObserver.next({
          type: 'pointermove',
          pageX: 20,
          pageY: 0,
        });

        upObserver.next({
          type: 'pointerup',
          pageX: 20,
          pageY: 0,
        });

        const clickEvent = {
          preventDefault: stub(),
          stopImmediatePropagation: stub(),
        };

        clickObserver.next(clickEvent);

        expect(clickEvent.preventDefault).to.have.been.calledOnce;
        expect(clickEvent.stopImmediatePropagation).to.have.been.calledOnce;
      }
    );

    it(`should not suppress clicks if recognitionThreshold hasn't been crossed`,
      () => {
        draggable.recognitionThreshold = 50;

        downObserver.next({
          type: 'pointerdown',
          pageX: 0,
          pageY: 0,
        });

        moveObserver.next({
          type: 'pointermove',
          pageX: 20,
          pageY: 0,
        });

        upObserver.next({
          type: 'pointerup',
          pageX: 20,
          pageY: 0,
        });

        const clickEvent = {
          preventDefault: stub(),
          stopImmediatePropagation: stub(),
        };

        clickObserver.next(clickEvent);

        expect(clickEvent.preventDefault).not.to.have.been.called;
        expect(clickEvent.stopImmediatePropagation).not.to.have.been.called;
      }
    );

    it(`should set state to ACTIVE when it receives a pointerdown`);
    it(`should set state to AT_REST when it receives a pointerup`);
    it(`should set recognitionState to BEGAN when the recognitionThreshold is crossed`);
    it(`should set recognitionState to CHANGED on the move after BEGAN`);
    it(`should set recognitionState to ENDED on up, if recognized`);
    it(`should set recognitionState to POSSIBLE after ENDED`);
    it(`should only write to recognitionState once per event, even with multiple observers`);
  }
);
