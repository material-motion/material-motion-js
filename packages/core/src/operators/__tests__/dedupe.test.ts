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
} from '../../observables/';

describe('motionObservable.dedupe',
  () => {
    let stream;
    let mockObserver;
    let listener1;
    let listener2;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        listener1 = stub();
        listener2 = stub();
      }
    );

    it('should dispatch the first value it receives',
      () => {
        stream.dedupe().subscribe(listener1);

        mockObserver.next();

        expect(listener1).to.have.been.calledOnce.and.to.have.been.calledWith(undefined);
      }
    );

    it('should suppress duplicate values',
      () => {
        stream.dedupe().subscribe(listener1);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(2);
        mockObserver.next(3);

        expect(listener1).to.have.been.calledThrice;
        expect(listener1).to.have.been.calledWith(1);
        expect(listener1).to.have.been.calledWith(2);
        expect(listener1).to.have.been.calledWith(3);
      }
    );

    it('should pass through duplicate values if they are not back-to-back',
      () => {
        stream.dedupe().subscribe(listener1);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);
        mockObserver.next(2);

        expect(listener1).to.have.callCount(4);
      }
    );

    it('should deduplicate correctly to multiple listeners',
      () => {
        const deduped = stream.dedupe();
        deduped.subscribe(listener1);
        deduped.subscribe(listener2);

        mockObserver.next(1);
        mockObserver.next(2);
        expect(listener1).to.have.callCount(2);
        expect(listener2).to.have.callCount(2);

        mockObserver.next(2);
        expect(listener1).to.have.callCount(2);
        expect(listener2).to.have.callCount(2);

        mockObserver.next(3);
        expect(listener1).to.have.callCount(3);
        expect(listener2).to.have.callCount(3);
      }
    );

    it('should pass through correctly to multiple listeners',
      () => {
        const deduped = stream.dedupe();
        deduped.subscribe(listener1);
        deduped.subscribe(listener2);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);
        mockObserver.next(2);

        expect(listener1).to.have.callCount(4);
        expect(listener2).to.have.callCount(4);
      }
    );

    it('should work correctly when the observer is a cycle');
    it('should use deep equality by default');
    it('should use the provided callback to test equality');
  }
);
