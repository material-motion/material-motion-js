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
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

import {
  reset as resetTimer,
  setTimeout as mockSetTimeout,
  tick,
} from 'mock-timeout';

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

describe('motionObservable.delayBy',
  () => {
    let stream;
    let mockObserver;
    let listener;

    let originalSetTimeout;

    beforeEach(
      () => {
        originalSetTimeout = setTimeout;
        setTimeout = mockSetTimeout;
        resetTimer();

        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        listener = stub();
      }
    );

    afterEach(
      () => {
        setTimeout = originalSetTimeout;
      }
    );

    it('should not dispatch a value until the delay has elapsed.',
      () => {
        stream.delayBy(100).subscribe(listener);

        mockObserver.next(true);
        tick(99);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch the received value when the delay has elapsed',
      () => {
        stream.delayBy(100).subscribe(listener);

        mockObserver.next(true);
        tick(100);

        expect(listener).to.have.been.calledWith(true);
      }
    );

    it('should not dispatch while unsubscribed',
      () => {
        const subscription = stream.delayBy(100).subscribe(listener);

        mockObserver.next(true);
        subscription.unsubscribe();
        tick(100);

        expect(listener).not.to.have.been.called;
      }
    );
  }
);
