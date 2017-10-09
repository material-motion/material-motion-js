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

describe('motionObservable.merge',
  () => {
    let stream1;
    let stream2;
    let stream3;
    let mockObserver1;
    let mockObserver2;
    let mockObserver3;
    let listener;

    beforeEach(
      () => {
        mockObserver1 = createMockObserver();
        mockObserver2 = createMockObserver();
        mockObserver3 = createMockObserver();
        stream1 = new MotionObservable(mockObserver1.connect);
        stream2 = new MotionObservable(mockObserver2.connect);
        stream3 = new MotionObservable(mockObserver3.connect);
        listener = stub();
      }
    );

    it('should emit values from both upstream and its stream arguments',
      () => {
        stream1.merge({ others: [ stream2, stream3 ] }).subscribe(listener);

        mockObserver1.next(1);
        expect(listener).to.have.been.calledOnce.and.calledWith(1);

        mockObserver3.next(3);
        expect(listener).to.have.been.calledTwice.and.calledWith(3);

        mockObserver2.next(2);
        expect(listener).to.have.been.calledThrice.and.calledWith(2);

        mockObserver1.next(4);
        expect(listener).to.have.been.calledWith(4);
      }
    );

    it('should have a shorthand signature',
      () => {
        stream1.merge([ stream2, stream3 ]).subscribe(listener);

        mockObserver1.next(1);
        expect(listener).to.have.been.calledOnce.and.calledWith(1);

        mockObserver3.next(3);
        expect(listener).to.have.been.calledTwice.and.calledWith(3);

        mockObserver2.next(2);
        expect(listener).to.have.been.calledThrice.and.calledWith(2);

        mockObserver1.next(4);
        expect(listener).to.have.been.calledWith(4);
      }
    );
  }
);
