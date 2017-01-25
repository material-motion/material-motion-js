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

import {
  MotionObservable,
  MotionRuntime,
  State,
} from '../';

import {
  createMockObserver,
} from 'material-motion-testing-utils';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

describe('motionRuntime',
  () => {
    let runtime;
    let stream;
    let mockObserver;
    let mockProperty;

    beforeEach(
      () => {
        runtime = new MotionRuntime();

        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);

        mockProperty = {
          write: stub(),
        };
      }
    );

    it(`should write values from the stream's next to the given property`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.next(1);
        expect(mockProperty.write).to.have.been.calledWith(1);

        mockObserver.next(2);
        expect(mockProperty.write).to.have.been.calledWith(2);
      }
    );

    it(`should start at rest`,
      () => {
        expect(runtime.aggregateState).to.equal(State.AT_REST);
      }
    );

    it(`should become active when a stream does`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.state(State.ACTIVE);
        expect(runtime.aggregateState).to.equal(State.ACTIVE);
      }
    );

    it(`should be active if any streams are active`,
      () => {
        const mockObserver2 = createMockObserver();
        const stream2 = new MotionObservable(mockObserver2.connect);

        runtime.write({
          stream,
          to: mockProperty,
        });

        runtime.write({
          stream: stream2,
          to: mockProperty,
        });

        mockObserver.state(State.AT_REST);
        mockObserver2.state(State.ACTIVE);

        expect(runtime.aggregateState).to.equal(State.ACTIVE);
      }
    );

    it(`should come to rest when all streams come to rest`,
      () => {
        const mockObserver2 = createMockObserver();
        const stream2 = new MotionObservable(mockObserver2.connect);

        runtime.write({
          stream,
          to: mockProperty,
        });

        runtime.write({
          stream: stream2,
          to: mockProperty,
        });

        mockObserver.state(State.ACTIVE);
        mockObserver2.state(State.ACTIVE);
        mockObserver.state(State.AT_REST);
        mockObserver2.state(State.AT_REST);

        expect(runtime.aggregateState).to.equal(State.AT_REST);
      }
    );

    it(`should not be active unless a stream's state channel declares so`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.next(5);
        expect(runtime.aggregateState).to.equal(State.AT_REST);
      }
    );

    it(`should be accurate even if it receives imbalanced state streams`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.state(State.AT_REST);
        mockObserver.state(State.AT_REST);
        mockObserver.state(State.ACTIVE);
        expect(runtime.aggregateState).to.equal(State.ACTIVE);

        mockObserver.state(State.ACTIVE);
        expect(runtime.aggregateState).to.equal(State.ACTIVE);

        mockObserver.state(State.AT_REST);
        expect(runtime.aggregateState).to.equal(State.AT_REST);
      }
    );

    it(`should change between active and at rest as often as the underlying streams do`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.state(State.ACTIVE);
        expect(runtime.aggregateState).to.equal(State.ACTIVE);

        mockObserver.state(State.AT_REST);
        expect(runtime.aggregateState).to.equal(State.AT_REST);

        mockObserver.state(State.ACTIVE);
        expect(runtime.aggregateState).to.equal(State.ACTIVE);
      }
    );
  }
);
