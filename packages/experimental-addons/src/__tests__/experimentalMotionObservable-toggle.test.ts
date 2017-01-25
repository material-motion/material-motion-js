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

describe('experimentalMotionObservable.toggle',
  () => {
    let stream;
    let mockObserver;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new ExperimentalMotionObservable(mockObserver.connect);
        listener = stub();
      }
    );

    it('should start with true if its first upstream value is truthy',
      () => {
        stream.toggle().subscribe(listener);

        mockObserver.next(11);

        expect(listener).to.have.calledOnce.and.to.have.been.calledWith(true);
      }
    );

    it('should start with false if its first upstream value is falsey',
      () => {
        stream.toggle().subscribe(listener);

        mockObserver.next();

        expect(listener).to.have.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should dispatch the opposite of the last thing it dispatched every time it receives a value',
      () => {
        stream.toggle().subscribe(listener);

        mockObserver.next(true);
        expect(listener.lastCall).to.have.calledWith(true);

        mockObserver.next();
        expect(listener.lastCall).to.have.calledWith(false);

        mockObserver.next();
        expect(listener.lastCall).to.have.calledWith(true);

        mockObserver.next();
        expect(listener.lastCall).to.have.calledWith(false);
      }
    );
  }
);
