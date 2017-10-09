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
  MemorylessMotionSubject,
} from '../observables/MemorylessMotionSubject';

import {
  MemorylessIndefiniteSubject,
} from '../observables/MemorylessIndefiniteSubject';

import {
  allOf,
  anyOf,
  noneOf,
  not,
  when,
} from '../aggregators';

describe('anyOf',
  () => {
    let subject1;
    let subject2;
    let listener;

    beforeEach(
      () => {
        subject1 = new MemorylessIndefiniteSubject();
        subject2 = new MemorylessIndefiniteSubject();
        listener = stub();
      }
    );

    it('should do nothing until all streams have emitted',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should emit true if one of the streams emitted true',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );

    it('should emit false if none of the streams emitted true',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should emit true if all of the streams emitted true',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(true);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );
  }
);

describe('allOf',
  () => {
    let subject1;
    let subject2;
    let listener;

    beforeEach(
      () => {
        subject1 = new MemorylessIndefiniteSubject();
        subject2 = new MemorylessIndefiniteSubject();
        listener = stub();
      }
    );

    it('should do nothing until all streams have emitted',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should emit false if only some of the streams emitted true',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should emit false if none of the streams emitted true',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should emit true if all of the streams emitted true',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(true);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );
  }
);

describe('noneOf',
  () => {
    let subject1;
    let subject2;
    let listener;

    beforeEach(
      () => {
        subject1 = new MemorylessIndefiniteSubject();
        subject2 = new MemorylessIndefiniteSubject();
        listener = stub();
      }
    );

    it('should do nothing until all streams have emitted',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should emit false if one of the streams emitted true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should emit true if none of the streams emitted true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );

    it('should emit false if all of the streams emitted true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(true);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );
  }
);

describe('not',
  () => {
    let subject;
    let listener;

    beforeEach(
      () => {
        subject = new MemorylessMotionSubject();
        listener = stub();
      }
    );


    it('should emit false when it receives true',
      () => {
        not(subject).subscribe(listener);

        subject.next(true);

        expect(listener).to.have.been.calledWith(false);
      }
    );

    it('should emit true when it receives false',
      () => {
        not(subject).subscribe(listener);

        subject.next(false);

        expect(listener).to.have.been.calledWith(true);
      }
    );
  }
);

describe('when',
  () => {
    let subject;
    let listener;

    beforeEach(
      () => {
        subject = new MemorylessMotionSubject();
        listener = stub();
      }
    );

    it('should passthrough true',
      () => {
        when(subject).subscribe(listener);

        subject.next(false);
        subject.next('a');
        subject.next(5);

        expect(listener).not.to.have.been.called;

        subject.next(true);

        expect(listener).to.have.been.calledWith(true);
      }
    );
  }
);
