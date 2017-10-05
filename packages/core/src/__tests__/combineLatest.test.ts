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
} from '../observables';

import {
  combineLatest,
} from '../combineLatest';

describe('combineLatest',
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

    it('should dispatch a dictionary of values when it receives a dictionary',
      () => {
        combineLatest({ a: subject1, b: subject2 }).subscribe(listener);

        subject1.next(2);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ a: 2, b: 3 });
      }
    );

    it('should dispatch an array of values when it receives an array',
      () => {
        combineLatest([ subject1, subject2 ]).subscribe(listener);

        subject1.next(2);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith([ 2, 3 ]);
      }
    );

    it('should dispatch each time it receives a new value when it receives a dictionary',
      () => {
        combineLatest({ a: subject1, b: subject2 }).subscribe(listener);

        subject1.next(1);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ a: 1, b: 3 });

        subject1.next(2);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith({ a: 2, b: 3 });

        subject2.next(2);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith({ a: 2, b: 2 });
      }
    );

    it('should dispatch each time it receives a new value when it receives an array',
      () => {
        combineLatest([ subject1, subject2 ]).subscribe(listener);

        subject1.next(1);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith([ 1, 3 ]);

        subject1.next(2);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith([ 2, 3 ]);

        subject2.next(2);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith([ 2, 2 ]);
      }
    );

    it('should passthrough constants when it receives a dictionary',
      () => {
        combineLatest({ a: subject1, b: subject2, c: 1 }).subscribe(listener);

        subject1.next(2);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ a: 2, b: 3, c: 1 });
      }
    );

    it('should passthrough constants when it receives an array',
      () => {
        combineLatest([ 1, subject1, subject2 ]).subscribe(listener);

        subject1.next(2);
        subject2.next(3);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith([ 1, 2, 3 ]);
      }
    );

    it('should not dispatch until it receives a value from each item in the dictionary',
      () => {
        combineLatest({ a: subject1, b: subject2 }).subscribe(listener);

        subject1.next(1);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should not dispatch until it receives a value from each item in the array',
      () => {
        combineLatest([ subject1, subject2 ]).subscribe(listener);

        subject1.next(1);

        expect(listener).not.to.have.been.called;
      }
    );

    it('should dispatch a new dictionary for each change',
      () => {
        combineLatest({ a: subject1, b: subject2 }).subscribe(listener);

        subject1.next(1);
        subject2.next(2);
        subject2.next(2);

        expect(listener.firstCall.args[0]).not.to.equal(listener.lastCall.args[0]);
      }
    );

    it('should dispatch a new array for each change',
      () => {
        combineLatest([ subject1, subject2 ]).subscribe(listener);

        subject1.next(1);
        subject2.next(2);
        subject2.next(2);

        expect(listener.firstCall.args[0]).not.to.equal(listener.lastCall.args[0]);
      }
    );
  }
);
