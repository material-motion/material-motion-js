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
  MotionObservable,
} from 'material-motion';

import {
  convertTouchEventsToPointerEvents,
} from '../convertTouchEventsToPointerEvents';

describe('convertTouchEventsToPointerEvents',
  () => {
    let stream;
    let mockObserver;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = convertTouchEventsToPointerEvents(
          new MotionObservable(mockObserver.connect)
        );
        listener = stub();
      }
    );

    it('should dispatch partial pointer events for all the targetTouches in a TouchEvent',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchstart',
          targetTouches: [
            {
              pageX: 0,
              pageY: 0,
              identifier: 3424080648,
            },
            {
              pageX: 10,
              pageY: 20,
              identifier: 3424080649,
            },
          ]
        });

        expect(listener).to.have.been.calledTwice
          .and.to.have.been.calledWith({
            pageX: 0,
            pageY: 0,
            pointerId: 3424080648,
            type: 'pointerdown',
          }).and.to.have.been.calledWith({
            pageX: 10,
            pageY: 20,
            pointerId: 3424080649,
            type: 'pointerdown',
          });
      }
    );

    it('should dispatch pointerdown for touchstart',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchstart',
          targetTouches: [
            {
              pageX: 0,
              pageY: 0,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          pageX: 0,
          pageY: 0,
          pointerId: 3424080648,
          type: 'pointerdown',
        });
      }
    );

    it('should dispatch pointermove for touchmove',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchmove',
          targetTouches: [
            {
              pageX: 0,
              pageY: 0,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          pageX: 0,
          pageY: 0,
          pointerId: 3424080648,
          type: 'pointermove',
        });
      }
    );

    it('should dispatch pointerup for touchend',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchend',
          changedTouches: [
            {
              pageX: 0,
              pageY: 0,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          pageX: 0,
          pageY: 0,
          pointerId: 3424080648,
          type: 'pointerup',
        });
      }
    );

    it('should dispatch pointercancel for touchcancel',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchcancel',
          changedTouches: [
            {
              pageX: 0,
              pageY: 0,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          pageX: 0,
          pageY: 0,
          pointerId: 3424080648,
          type: 'pointercancel',
        });
      }
    );

    // test touch start/end/cancel
  }
);
