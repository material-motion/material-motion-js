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
  State,
} from '../';

describe('motionObservable',
  () => {
    let stream;
    let mockObserver;
    let nextListener;
    let stateListener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);

        nextListener = stub();
        stateListener = stub();
      }
    );

    it('should pass values to observer.next',
      () => {
        stream.subscribe({
          next: nextListener,
          state: stateListener,
        });

        mockObserver.next(1);

        expect(nextListener).to.have.been.calledWith(1);
        expect(stateListener).not.to.have.been.called;
      }
    );

    it('should pass values to observer.state',
      () => {
        stream.subscribe({
          next: nextListener,
          state: stateListener,
        });

        mockObserver.state(State.ACTIVE);

        expect(nextListener).not.to.have.been.called;
        expect(stateListener).to.have.been.calledWith(State.ACTIVE);
      }
    );

    it('should accept values on both channels',
      () => {
        stream.subscribe({
          next: nextListener,
          state: stateListener,
        });

        mockObserver.next('hi');
        mockObserver.state(State.ACTIVE);

        expect(nextListener).to.have.been.calledWith('hi');
        expect(stateListener).to.have.been.calledWith(State.ACTIVE);
      }
    );

    it(`should provide operators with a state channel even if the listener doesn't have one`,
      () => {
        new MotionObservable(
          observer => {
            expect(observer.state).to.exist;
            observer.state(State.ACTIVE);

            return mockObserver.disconnect;
          }
        ).subscribe(nextListener);
      }
    );
  }
);
