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
        stream.rewrite({ a: 1, b: 2 }).subscribe(listener);

        mockObserver.next('b');

        expect(listener).to.have.been.calledWith(2);
      }
    );

    it('should dispatch the matching value from an object literal of streams',
      () => {
        stream.rewrite({ a: innerSubject, b: 1 }).subscribe(listener);

        innerSubject.next('q');

        mockObserver.next('a');

        innerSubject.next('z');

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith('q').and.to.have.been.calledWith('z');
      }
    );

    it('should dispatch the matching value from a Map',
      () => {
        const dict = new Map();
        const a = Symbol();
        const b = Symbol();

        dict.set(a, 'a');
        dict.set(b, 'b');

        stream.rewrite(dict).subscribe(listener);

        mockObserver.next(b);

        expect(listener).to.have.been.calledWith('b');
      }
    );

    it('should dispatch the matching value from a Map of streams',
      () => {
        const dict = new Map();
        const a = Symbol();
        const b = innerSubject;

        dict.set(a, 'a');
        dict.set(b, innerSubject);

        stream.rewrite(dict).subscribe(listener);

        mockObserver.next(b);

        innerSubject.next(1);
        innerSubject.next(2);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(1).and.to.have.been.calledWith(2);
      }
    );
  }
);
