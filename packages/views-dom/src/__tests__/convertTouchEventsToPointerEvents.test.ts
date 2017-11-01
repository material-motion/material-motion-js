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

    it('should emit PartialPointerEvents for all the targetTouches in a TouchEvent',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchstart',
          targetTouches: [
            {
              clientX: 0,
              clientY: 0,
              identifier: 3424080648,
            },
            {
              clientX: 10,
              clientY: 20,
              identifier: 3424080649,
            },
          ]
        });

        expect(listener).to.have.been.calledTwice
          .and.to.have.been.calledWith({
            x: 0,
            y: 0,
            pointerId: 3424080648,
            type: 'pointerdown',
          }).and.to.have.been.calledWith({
            x: 10,
            y: 20,
            pointerId: 3424080649,
            type: 'pointerdown',
          });
      }
    );

    it('should emit pointerdown for touchstart',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchstart',
          targetTouches: [
            {
              clientX: 10,
              clientY: 30,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          x: 10,
          y: 30,
          pointerId: 3424080648,
          type: 'pointerdown',
        });
      }
    );

    it('should emit pointermove for touchmove',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchmove',
          targetTouches: [
            {
              clientX: 5,
              clientY: 7,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          x: 5,
          y: 7,
          pointerId: 3424080648,
          type: 'pointermove',
        });
      }
    );

    it('should emit pointerup for touchend',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchend',
          changedTouches: [
            {
              clientX: 14,
              clientY: 8,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          x: 14,
          y: 8,
          pointerId: 3424080648,
          type: 'pointerup',
        });
      }
    );

    it('should emit pointercancel for touchcancel',
      () => {
        stream.subscribe(listener);

        mockObserver.next({
          type: 'touchcancel',
          changedTouches: [
            {
              clientX: 9,
              clientY: 90,
              identifier: 3424080648,
            },
          ]
        });

        expect(listener).to.have.been.calledWith({
          x: 9,
          y: 90,
          pointerId: 3424080648,
          type: 'pointercancel',
        });
      }
    );

    // test touch start/end/cancel
  }
);
