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

import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

import {
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  MotionObservable,
} from '../../observables/';

import {
  ThresholdSide,
} from '../../ThresholdSide';

describe('motionObservable.thresholdRange',
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

    it('should dispatch BELOW when it receives a value less than the lower limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(9);

        expect(listener).to.have.been.calledWith(ThresholdSide.BELOW);
      }
    );

    it('should dispatch BELOW even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(9);

        expect(listener).to.have.been.calledWith(ThresholdSide.BELOW);
      }
    );

    it('should dispatch WITHIN when it receives a value that matches the lower limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(10);

        expect(listener).to.have.been.calledWith(ThresholdSide.WITHIN);
      }
    );

    it('should dispatch WITHIN when it receives a value between the limits',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(15);

        expect(listener).to.have.been.calledWith(ThresholdSide.WITHIN);
      }
    );

    it('should dispatch WITHIN even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(15);

        expect(listener).to.have.been.calledWith(ThresholdSide.WITHIN);
      }
    );

    it('should dispatch WITHIN when it receives a value that matches the upper limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(20);

        expect(listener).to.have.been.calledWith(ThresholdSide.WITHIN);
      }
    );

    it('should dispatch ABOVE when it receives a value greater than the upper limit',
      () => {
        stream.thresholdRange(10, 20).subscribe(listener);

        mockObserver.next(21);

        expect(listener).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );

    it('should dispatch ABOVE even if the limits are backwards',
      () => {
        stream.thresholdRange(20, 10).subscribe(listener);

        mockObserver.next(21);

        expect(listener).to.have.been.calledWith(ThresholdSide.ABOVE);
      }
    );
  }
);
