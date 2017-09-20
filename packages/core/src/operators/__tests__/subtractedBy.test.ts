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
  MemorylessMotionSubject,
} from '../../observables/';

describe('motionObservable.subtractedBy',
  () => {
    const amountSubject = new MemorylessMotionSubject();
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

    it('should subtract the amount constant to an incoming numeric value and dispatch the result',
      () => {
        stream.subtractedBy(10).subscribe(listener);

        mockObserver.next(3);

        expect(listener).to.have.been.calledWith(-7);
      }
    );

    it('should subtract the amount constant to an incoming Point2D value and dispatch the result',
      () => {
        stream.subtractedBy({x: 10, y: 20 }).subscribe(listener);

        mockObserver.next({x: 100, y: -40 });

        expect(listener).to.have.been.calledWith({x: 90, y: -60 });
      }
    );

    it('should subtract values from the amount stream to an incoming numeric value and dispatch the result',
      () => {
        stream.subtractedBy(amountSubject).subscribe(listener);

        mockObserver.next(3);
        amountSubject.next(10);
        amountSubject.next(20);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(-7).and.to.have.been.calledWith(-17);
      }
    );

    it('should subtract values from the amount stream to an incoming Point2D value and dispatch the result',
      () => {
        stream.subtractedBy(amountSubject).subscribe(listener);

        mockObserver.next({x: 100, y: -40 });
        mockObserver.next({x: 10, y: 0 });
        amountSubject.next({x: 0, y: 15 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({x: 10, y: -15 });
      }
    );
  }
);
