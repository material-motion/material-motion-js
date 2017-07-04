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
  MemorylessIndefiniteSubject,
} from '../observables/MemorylessIndefiniteSubject';

import {
  allOf,
  anyOf,
  noneOf,
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

    it('should do nothing until all streams have dispatched',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch true if one of the streams dispatched true',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );

    it('should dispatch false if none of the streams dispatched true',
      () => {
        anyOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should dispatch true if all of the streams dispatched true',
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

    it('should do nothing until all streams have dispatched',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch false if only some of the streams dispatched true',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should dispatch false if none of the streams dispatched true',
      () => {
        allOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should dispatch true if all of the streams dispatched true',
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

    it('should do nothing until all streams have dispatched',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch false if one of the streams dispatched true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );

    it('should dispatch true if none of the streams dispatched true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(false);
        subject2.next(false);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(true);
      }
    );

    it('should dispatch false if all of the streams dispatched true',
      () => {
        noneOf([subject1, subject2]).subscribe(listener);

        subject1.next(true);
        subject2.next(true);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);
      }
    );
  }
);
