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
  spy,
} from 'sinon';

import MemorylessIndefiniteSubject from '../MemorylessIndefiniteSubject';

describe('memorylessIndefiniteSubject',
  () => {
    let subject;
    let listener1;
    let listener2;

    beforeEach(
      () => {
        subject = new MemorylessIndefiniteSubject();

        listener1 = spy();
        listener2 = spy();
      }
    );

    it(`should not call a subscriber on subscription`,
      () => {
        subject.next(1);
        subject.subscribe(listener1);
        expect(listener1).not.to.have.been.called;
      }
    );

    it(`should call all subscribers when a new value is dispatched`,
      () => {
        subject.subscribe(listener1);
        subject.subscribe(listener2);

        subject.next(2);

        expect(listener1).to.have.been.calledWith(2);
        expect(listener2).to.have.been.calledWith(2);
      }
    );

    it(`should stop calling subscribers who call unsubscribe`,
      () => {
        const subscription1 = subject.subscribe(listener1);
        const subscription2 = subject.subscribe(listener2);

        subject.next(1);

        subscription1.unsubscribe();

        subject.next(2);

        expect(listener1).to.have.been.calledOnce;
        expect(listener2).to.have.been.calledTwice;
      }
    );

    it(`should accept an observer or an anonymous function`,
      () => {
        subject.subscribe({
          next: listener1
        });

        subject.next(7);

        expect(listener1).to.have.been.calledWith(7);
      }
    );

    it(`should identify itself as an adherent of the TC39 observable proposal`,
      () => {
        // According to the TC39 spec, if Symbol is defined, `this` should be
        // returned by stream[Symbol.observable]().  Otherwise, the key is
        // '@@observable'.
        const $$observable = typeof Symbol !== 'undefined'
          ? (Symbol as any).observable
          : '@@observable';

        expect(subject[$$observable]()).to.equal(subject);
      }
    );
  }
);
