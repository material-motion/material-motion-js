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

describe('motionObservable.slidingWindow',
  () => {
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

    it(`should not dispatch items as it receives them`,
      () => {
        stream.slidingWindow(3).subscribe(listener);

        mockObserver.next(1);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith([1]);
      }
    );

    it(`should dispatch when the array is the correct length`,
      () => {
        stream.slidingWindow(3).subscribe(listener);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);

        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith([1, 2, 3]);
      }
    );

    it(`should remove old items as new ones are received`,
      () => {
        stream.slidingWindow(3).subscribe(listener);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);
        mockObserver.next(4);

        expect(listener).to.have.been.callCount(4).and.to.have.been.calledWith([2, 3, 4]);
      }
    );

    it(`should have a default size of 2`,
      () => {
        stream.slidingWindow().subscribe(listener);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);

        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith([2, 3]);
      }
    );
  }
);
