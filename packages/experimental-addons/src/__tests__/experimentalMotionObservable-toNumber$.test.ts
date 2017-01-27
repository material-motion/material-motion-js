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

describe('experimentalMotionObservable.toNumber$',
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

    it('should parse numeric strings with parseFloat',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next('3.14');

        expect(listener).to.have.been.calledWith(3.14);
      }
    );

    it('should dispatch 1 for truthy strings',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next('i am a banana');

        expect(listener).to.have.been.calledWith(1);
      }
    );

    it('should dispatch 1 for Arrays',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next([]);

        expect(listener).to.have.been.calledWith(1);
      }
    );

    it('should dispatch 1 for Objects',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next({});

        expect(listener).to.have.been.calledWith(1);
      }
    );

    it('should dispatch 0 for empty strings',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next('');

        expect(listener).to.have.been.calledWith(0);
      }
    );

    it('should dispatch NaN for NaN',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next(NaN);

        expect(listener).to.have.been.calledWith(NaN);
      }
    );

    it('should dispatch 0 for null',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next(null);

        expect(listener).to.have.been.calledWith(0);
      }
    );

    it('should dispatch 0 for undefined',
      () => {
        stream.toNumber$().subscribe(listener);

        mockObserver.next(undefined);

        expect(listener).to.have.been.calledWith(0);
      }
    );
  }
);

