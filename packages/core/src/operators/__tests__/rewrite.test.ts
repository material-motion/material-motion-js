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
  MotionObservable,
  MemorylessMotionSubject,
} from '../../observables/';

describe('motionObservable.rewrite',
  () => {
    let stream;
    let mockObserver;
    let innerSubject;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        innerSubject = new MemorylessMotionSubject();
        listener = stub();
      }
    );

    it('should dispatch the matching value from an object literal',
      () => {
        stream.rewrite({ mapping: {  a: 1, b: 2 } }).subscribe(listener);

        mockObserver.next('b');

        expect(listener).to.have.been.calledWith(2);
      }
    );

    it('should cast incoming values to strings if the dict is an object literal',
      () => {
        stream.rewrite({ mapping: {  true: 1, false: 2 } }).subscribe(listener);

        mockObserver.next(false);

        expect(listener).to.have.been.calledWith(2);
      }
    );

    it('should dispatch the matching value from an object literal of streams',
      () => {
        stream.rewrite({ mapping: {  a: innerSubject, b: 1 } }).subscribe(listener);

        innerSubject.next('q');

        mockObserver.next('a');

        innerSubject.next('z');

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith('q').and.to.have.been.calledWith('z');
      }
    );

    it('should dispatch the matching value from a Map',
      () => {
        const mapping = new Map();
        const a = Symbol();
        const b = Symbol();

        mapping.set(a, 'a');
        mapping.set(b, 'b');

        stream.rewrite({ mapping }).subscribe(listener);

        mockObserver.next(b);

        expect(listener).to.have.been.calledWith('b');
      }
    );

    it('should dispatch the matching value from a Map of streams',
      () => {
        const mapping = new Map();
        const a = Symbol();
        const b = innerSubject;

        mapping.set(a, 'a');
        mapping.set(b, innerSubject);

        stream.rewrite({ mapping }).subscribe(listener);

        mockObserver.next(b);

        innerSubject.next(1);
        innerSubject.next(2);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(1).and.to.have.been.calledWith(2);
      }
    );
  }
);
