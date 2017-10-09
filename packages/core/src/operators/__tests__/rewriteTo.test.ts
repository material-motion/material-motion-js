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

import {
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  MemorylessMotionSubject,
  MotionObservable,
} from '../../observables/';

describe('motionObservable.rewriteTo',
  () => {
    const value$ = new MemorylessMotionSubject();
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

    it('should emit its argument whenever it receives an emission from upstream',
      () => {
        stream.rewriteTo({ value$: 'banana' }).subscribe(listener);

        mockObserver.next();
        mockObserver.next(false);
        mockObserver.next(123);
        mockObserver.next({a: '1234'});

        expect(listener).to.have.callCount(4).and.to.always.have.been.calledWith('banana');
      }
    );

    it('should support reactive arguments',
      () => {
        stream.rewriteTo({ value$ }).subscribe(listener);

        mockObserver.next();
        mockObserver.next(false);

        value$.next(12);
        value$.next(15);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(12);

        mockObserver.next({});

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(15);
      }
    );

    it('should support reactive arguments and onlyEmitWithUpstream',
      () => {
        stream.rewriteTo({ value$, onlyEmitWithUpstream: false }).subscribe(listener);

        mockObserver.next(false);

        value$.next(12);
        value$.next(15);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(12).and.to.have.been.calledWith(15);
      }
    );

    it('should have a shorthand signature for constants',
      () => {
        stream.rewriteTo('banana').subscribe(listener);

        mockObserver.next();
        mockObserver.next(false);
        mockObserver.next(123);
        mockObserver.next({a: '1234'});

        expect(listener).to.have.callCount(4).and.to.always.have.been.calledWith('banana');
      }
    );

    it('should have a shorthand signature for streams',
      () => {
        stream.rewriteTo(value$).subscribe(listener);

        mockObserver.next();
        mockObserver.next(false);

        value$.next(12);
        value$.next(15);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(12);

        mockObserver.next({});

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(15);
      }
    );
  }
);
