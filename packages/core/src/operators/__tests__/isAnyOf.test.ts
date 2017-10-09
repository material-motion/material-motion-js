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
  MemorylessIndefiniteSubject,
  MotionSubject,
} from '../../observables/';

describe('motionObservable.isAnyOf',
  () => {
    let subject;
    let argSubject;
    let listener;

    beforeEach(
      () => {
        subject = new MotionSubject();
        argSubject = new MemorylessIndefiniteSubject();
        listener = stub();
      }
    );

    it('should dispatch true when the upstream values matches a possibility',
      () => {
        subject.isAnyOf({ candidates: [1, 2, 3] }).subscribe(listener);

        subject.next(2);

        expect(listener).to.have.been.calledWith(true);
      }
    );

    it('should dispatch false when the upstream values matches a possibility',
      () => {
        subject.isAnyOf({ candidates: [1, 2, 3] }).subscribe(listener);

        subject.next(4);

        expect(listener).to.have.been.calledWith(false);
      }
    );

    it('should accept reactive matches',
      () => {
        subject.isAnyOf({ candidates: [1, argSubject, 3] }).subscribe(listener);

        argSubject.next(2);
        subject.next(4);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);

        argSubject.next(4);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(true);
      }
    );

    it('should have a shorthand signature',
      () => {
        subject.isAnyOf([ 1, argSubject, 3 ]).subscribe(listener);

        argSubject.next(2);
        subject.next(4);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(false);

        argSubject.next(4);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(true);
      }
    );
  }
);
