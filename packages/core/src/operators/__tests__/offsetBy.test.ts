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
  MemorylessMotionSubject,
} from '../../observables/';

describe('motionObservable.offsetBy',
  () => {
    const offsetSubject = new MemorylessMotionSubject();
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

    it('should add the offset constant to an incoming numeric value and dispatch the result',
      () => {
        stream.offsetBy(10).subscribe(listener);

        mockObserver.next(3);

        expect(listener).to.have.been.calledWith(13);
      }
    );

    it('should add the offset constant to an incoming Point2D value and dispatch the result',
      () => {
        stream.offsetBy({x: 10, y: 20 }).subscribe(listener);

        mockObserver.next({x: 100, y: -40 });

        expect(listener).to.have.been.calledWith({x: 110, y: -20 });
      }
    );

    it('should add values from the offset stream to an incoming numeric value and dispatch the result',
      () => {
        stream.offsetBy(offsetSubject).subscribe(listener);

        mockObserver.next(3);
        offsetSubject.next(10);
        offsetSubject.next(20);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(13).and.to.have.been.calledWith(23);
      }
    );

    it('should add values from the offset stream to an incoming Point2D value and dispatch the result',
      () => {
        stream.offsetBy(offsetSubject).subscribe(listener);

        mockObserver.next({x: 100, y: -40 });
        mockObserver.next({x: 10, y: 0 });
        offsetSubject.next({x: 0, y: 15 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({x: 10, y: 15 });
      }
    );
  }
);
