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

describe('motionObservable.threshold',
  () => {
    const limitSubject = new MemorylessMotionSubject();
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

    it('should dispatch BELOW when it receives a value below the limit',
      () => {
        stream.threshold(7).subscribe(listener);

        mockObserver.next(3);

        expect(listener).to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should dispatch WITHIN when it receives a value that matches the limit',
      () => {
        stream.threshold(7).subscribe(listener);

        mockObserver.next(7);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should dispatch ABOVE when it receives a value above the limit',
      () => {
        stream.threshold(7).subscribe(listener);

        mockObserver.next(10);

        expect(listener).to.have.been.calledWith(ThresholdRegion.ABOVE);
      }
    );

    it('should support reactive limits',
      () => {
        stream.threshold(limitSubject).subscribe(listener);

        mockObserver.next(10);

        limitSubject.next(5);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.ABOVE);

        limitSubject.next(15);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.BELOW);

        limitSubject.next(10);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should support reactive limits and onlyDispatchWithUpstream',
      () => {
        stream.threshold(limitSubject, { onlyDispatchWithUpstream: true }).subscribe(listener);

        mockObserver.next(10);

        limitSubject.next(5);
        limitSubject.next(15);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.ABOVE);

        mockObserver.next(12);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );
  }
);
