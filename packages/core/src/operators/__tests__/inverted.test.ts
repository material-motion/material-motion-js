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

describe('motionObservable.inverted',
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

    it('should false when it receives true',
      () => {
        stream.inverted().subscribe(listener);

        mockObserver.next(true);

        expect(listener).to.have.been.calledWith(false);
      }
    );

    it('should true when it receives false',
      () => {
        stream.inverted().subscribe(listener);

        mockObserver.next(false);

        expect(listener).to.have.been.calledWith(true);
      }
    );

    it('should 0 when it receives 1',
      () => {
        stream.inverted().subscribe(listener);

        mockObserver.next(1);

        expect(listener).to.have.been.calledWith(0);
      }
    );

    it('should 1 when it receives 0',
      () => {
        stream.inverted().subscribe(listener);

        mockObserver.next(0);

        expect(listener).to.have.been.calledWith(1);
      }
    );
  }
);
