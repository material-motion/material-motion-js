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

import { expect, use as useInChai } from 'chai';
import * as sinonChai from 'sinon-chai';
useInChai(sinonChai);

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

import {
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  GestureRecognitionState,
} from '../../enums';

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
    let cancelObserver;
    let contextMenuObserver;
    let capturedClickObserver;
    let capturedDragStartObserver;
    let listener;

    beforeEach(
      () => {
        downObserver = createMockObserver();
        moveObserver = createMockObserver();
        upObserver = createMockObserver();
        cancelObserver = createMockObserver();
        contextMenuObserver = createMockObserver();
        capturedClickObserver = createMockObserver();
        capturedDragStartObserver = createMockObserver();
        listener = stub();

        draggable = new Draggable({
          down$: new MotionObservable(downObserver.connect),
          move$: new MotionObservable(moveObserver.connect),
          up$: new MotionObservable(upObserver.connect),
          cancel$: new MotionObservable(cancelObserver.connect),
          contextMenu$: new MotionObservable(contextMenuObserver.connect),
          capturedClick$: new MotionObservable(capturedClickObserver.connect),
          capturedDragStart$: new MotionObservable(capturedDragStartObserver.connect),
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

    it(`should suppress captured dragStart`,
      () => {
        const capturedDragStartEvent = {
          preventDefault: stub(),
        };

        capturedDragStartObserver.next(capturedDragStartEvent);

        expect(capturedDragStartEvent.preventDefault).to.have.been.calledOnce;
      }
    );

    it(`should suppress captured clicks if recognitionThreshold has been crossed`,
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

        const capturedClickEvent = {
          preventDefault: stub(),
          stopImmediatePropagation: stub(),
        };

        capturedClickObserver.next(capturedClickEvent);

        expect(capturedClickEvent.preventDefault).to.have.been.calledOnce;
        expect(capturedClickEvent.stopImmediatePropagation).to.have.been.calledOnce;
      }
    );

    it(`should not suppress captured clicks if recognitionThreshold hasn't been crossed`,
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

        const capturedClickEvent = {
          preventDefault: stub(),
          stopImmediatePropagation: stub(),
        };

        capturedClickObserver.next(capturedClickEvent);

        expect(capturedClickEvent.preventDefault).not.to.have.been.called;
        expect(capturedClickEvent.stopImmediatePropagation).not.to.have.been.called;
      }
    );

    it(`should set state to ACTIVE when it receives a pointerdown`);
    it(`should set state to AT_REST when it receives a pointerup`);
    it(`should set recognitionState to BEGAN when the recognitionThreshold is crossed`);
    it(`should set recognitionState to CHANGED on the move after BEGAN`);
    it(`should set recognitionState to ENDED on up, if recognized`);
    it(`should set recognitionState to POSSIBLE after ENDED`);
    it(`should only write to recognitionState once per event, even with multiple observers`);
    it(`should stop listening for moves and emit CANCELLED when cancellation$ emits an event`);
    it(`should ignore events when disabled`);
    it(`should emit CANCELLED when disabled during an recognition`);
    it(`should emit CANCELLED when cancel$ emits during an recognition`);
    it(`should emit CANCELLED when contextMenu$ emits during an recognition`);
  }
);
