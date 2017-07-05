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

import ExperimentalMotionObservable from '../ExperimentalMotionObservable';

import {
  ThresholdSide,
} from 'material-motion';

import {
  createMockObserver,
} from 'material-motion-testing-utils';

describe('experimentalMotionObservable.slidingThreshold',
  () => {
    let stream;
    let mockObserver;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new ExperimentalMotionObservable(mockObserver.connect);
        listener = stub();
      }
    );

    it('should not dispatch until the threshold has been crossed',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(10);

        expect(listener).to.not.have.been.called;
      }
    );

    it('should dispatch ABOVE when the incoming stream has crossed the threshold',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(60);

        expect(listener).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );

    it('should not dispatch ABOVE repeatedly',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(60);
        mockObserver.next(70);

        expect(listener).to.have.been.calledOnce.to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );

    it('should dispatch BELOW when the incoming stream has crossed the threshold',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(-60);

        expect(listener).to.have.been.calledWith(ThresholdSide.BELOW);
      }
    );

    it('should not dispatch BELOW repeatedly',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(-60);
        mockObserver.next(-70);

        expect(listener).to.have.been.calledOnce.to.have.been.calledWith(ThresholdSide.BELOW).and;
      }
    );

    it('should move the ABOVE threshold as the incoming value decreases',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(-30);
        mockObserver.next(30);

        expect(listener).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );

    it('should move the BELOW threshold as the incoming value increases',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(30);
        mockObserver.next(-30);

        expect(listener).to.have.been.calledWith(ThresholdSide.BELOW);
      }
    );

    it('should move the BELOW threshold as the incoming value increases',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(200);
        expect(listener).to.have.been.calledWith(ThresholdSide.ABOVE);

        mockObserver.next(100);
        expect(listener.lastCall).to.have.been.calledWith(ThresholdSide.BELOW);

        mockObserver.next(157);
        expect(listener.lastCall).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );

    it('should move the ABOVE threshold as the incoming value decreases',
      () => {
        stream.slidingThreshold(56).subscribe(listener);

        mockObserver.next(0);
        mockObserver.next(-200);

        expect(listener.lastCall).to.have.been.calledWith(ThresholdSide.BELOW);

        mockObserver.next(-100);

        expect(listener.lastCall).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );
  }
);
