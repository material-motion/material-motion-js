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
} from '../../observables/';

describe('motionObservable.multipliedBy',
  () => {
    const value$ = new MemorylessMotionSubject();
    let subject;
    let listener;

    beforeEach(
      () => {
        subject = new MemorylessMotionSubject();
        listener = stub();
      }
    );

    it('should multiply the coefficient by the incoming value and emit the result',
      () => {
        subject.multipliedBy({ value$: 10 }).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(30);
      }
    );

    it('should multiply values from a coefficient subject by the incoming value and emit the result',
      () => {
        subject.multipliedBy({ value$ }).subscribe(listener);

        subject.next(3);
        value$.next(4);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(12);
      }
    );

    it('should multiply point values from a coefficient subject by the incoming value and emit the result',
      () => {
        subject.multipliedBy({ value$ }).subscribe(listener);

        subject.next({ x: 3, y: 4 });
        value$.next({ x: 4, y: 10 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 12, y: 40 });
      }
    );

    it('should have a shorthand signature for numeric constants',
      () => {
        subject.multipliedBy(10).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(30);
      }
    );

    it('should have a shorthand signature for Point2D constants',
      () => {
        subject.multipliedBy({ x : 10, y: 20 }).subscribe(listener);

        subject.next({ x: 2, y: 4 });

        expect(listener).to.have.been.calledWith({ x: 20, y: 80 });
      }
    );

    it('should have a shorthand signature for streams',
      () => {
        subject.multipliedBy(value$).subscribe(listener);

        subject.next({ x: 3, y: 4 });
        value$.next({ x: 4, y: 10 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 12, y: 40 });
      }
    );
  }
);
