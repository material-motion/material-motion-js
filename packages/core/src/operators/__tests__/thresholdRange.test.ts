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
  MemorylessMotionSubject,
  MotionObservable,
} from '../../observables/';

import {
  ThresholdRegion,
} from '../../ThresholdRegion';

describe('motionObservable.thresholdRange',
  () => {
    const startSubject = new MemorylessMotionSubject();
    const endSubject = new MemorylessMotionSubject();

    let stream;
    let mockObserver;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        listener = stub();
      }
    );

    it('should dispatch BELOW when it receives a value less than the lower limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(9);

        expect(listener).to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should dispatch BELOW even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(9);

        expect(listener).to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should dispatch WITHIN when it receives a value that matches the lower limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(10);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should dispatch WITHIN when it receives a value between the limits',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(15);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should dispatch WITHIN even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(15);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should dispatch WITHIN when it receives a value that matches the upper limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(20);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should dispatch ABOVE when it receives a value greater than the upper limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(21);

        expect(listener).to.have.been.calledWith(ThresholdRegion.ABOVE);
      }
    );

    it('should dispatch ABOVE even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(21);

        expect(listener).to.have.been.calledWith(ThresholdRegion.ABOVE);
      }
    );

    it('should support reactive limits',
      () => {
        stream.thresholdRange(startSubject, endSubject).subscribe(listener);

        mockObserver.next(21);

        startSubject.next(10);
        endSubject.next(30);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.WITHIN);

        startSubject.next(25);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should support reactive limits and onlyDispatchWithUpstream',
      () => {
        stream.thresholdRange(startSubject, endSubject, { onlyDispatchWithUpstream: true }).subscribe(listener);

        mockObserver.next(21);

        startSubject.next(10);
        endSubject.next(30);
        startSubject.next(25);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.WITHIN);

        mockObserver.next(32);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.ABOVE);
      }
    );
  }
);
