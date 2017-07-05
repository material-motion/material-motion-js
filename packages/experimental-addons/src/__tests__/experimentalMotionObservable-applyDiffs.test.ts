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
  createMockObserver,
} from 'material-motion-testing-utils';

describe('experimentalMotionObservable.applyDiffs',
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

    it('should passthrough values from upstream',
      () => {
        const value = {
          a: 1,
          b: 2,
        };

        stream1.applyDiffs(stream2).subscribe(listener);

        mockObserver1.next(value);

        expect(listener).to.have.been.calledWith(value);
      }
    );

    it('should merge partial objects into the last value from upstream',
      () => {
        const value = {
          a: 1,
          b: 2,
        };

        const diff = {
          b: 3,
          c: 4,
        };

        stream1.applyDiffs(stream2).subscribe(listener);

        mockObserver1.next(value);
        mockObserver2.next(diff);

        expect(listener.lastCall.args[0]).to.deep.equal({
          a: 1,
          b: 3,
          c: 4,
        });
      }
    );
  }
);

