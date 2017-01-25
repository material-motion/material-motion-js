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

import ExperimentalMotionObservable from '../ExperimentalMotionObservable';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

import {
  createMockObserver,
} from 'material-motion-testing-utils';

describe('ExperimentalMotionObservable.combineLatestFromDict',
  () => {
    let stream1;
    let stream2;
    let mockObserver1;
    let mockObserver2;
    let listener;

    beforeEach(
      () => {
        mockObserver1 = createMockObserver();
        mockObserver2 = createMockObserver();
        stream1 = new ExperimentalMotionObservable(mockObserver1.connect);
        stream2 = new ExperimentalMotionObservable(mockObserver2.connect);
        listener = stub();
      }
    );

    it('should dispatch immediately if all values are constant',
      () => {
        const value = {
          a: 1,
          b: 2,
          c: 3,
        };

        ExperimentalMotionObservable.combineLatestFromDict(value).subscribe(listener);

        expect(listener).to.have.been.calledWith(value);
      }
    );

    it('should not dispatch anything until all streams have dispatched values',
      () => {
        ExperimentalMotionObservable.combineLatestFromDict({
          a: 1,
          b: stream1,
        }).subscribe(listener);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch when all the values have been filled',
      () => {
        ExperimentalMotionObservable.combineLatestFromDict({
          a: 1,
          b: stream1,
          c: stream2,
        }).subscribe(listener);

        mockObserver1.next(2);
        mockObserver2.next(3);

        expect(listener).to.have.been.calledWith({
          a: 1,
          b: 2,
          c: 3
        });
      }
    );

    it('should dispatch the latest combination when a stream emits a new value',
      () => {
        ExperimentalMotionObservable.combineLatestFromDict({
          a: 1,
          b: stream1,
          c: stream2,
        }).subscribe(listener);

        mockObserver1.next(2);
        mockObserver2.next(3);
        mockObserver2.next(4);

        expect(listener).to.have.been.calledWith({
          a: 1,
          b: 2,
          c: 4
        });
      }
    );
  }
);
