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

describe('motionObservable.dividedBy',
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

    it('should divide the upstream numeric value by the value constant and emit the result',
      () => {
        subject.dividedBy({ value$: 5 }).subscribe(listener);

        subject.next(10);

        expect(listener).to.have.been.calledWith(2);
      }
    );

    it('should divide the upstream numeric value by values from value$ and emit the result',
      () => {
        subject.dividedBy({ value$ }).subscribe(listener);

        subject.next(30);
        value$.next(5);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(6);
      }
    );

    it('should divide the upstream Point2D value by values from value$ and emit the result',
      () => {
        subject.dividedBy({ value$ }).subscribe(listener);

        subject.next({ x: 30, y: 60 });
        value$.next({ x: 2, y: 3 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 15, y: 20 });
      }
    );
    it('should divide the upstream Dimensions value by values from value$ and emit the result',
      () => {
        subject.dividedBy({ value$ }).subscribe(listener);

        subject.next({ width: 30, height: 60 });
        value$.next({ width: 2, height: 3 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ width: 15, height: 20 });
      }
    );

    it('should have a shorthand signature for numeric constants',
      () => {
        subject.dividedBy(5).subscribe(listener);

        subject.next(10);

        expect(listener).to.have.been.calledWith(2);
      }
    );

    it('should have a shorthand signature for Point2D constants',
      () => {
        subject.dividedBy({ x: 10, y: 20 }).subscribe(listener);

        subject.next({ x: 100, y: 40 });

        expect(listener).to.have.been.calledWith({x: 10, y: 2 });
      }
    );

    it('should have a shorthand signature for Dimensions constants',
      () => {
        subject.dividedBy({ width: 10, height: 20 }).subscribe(listener);

        subject.next({ width: 100, height: 40 });

        expect(listener).to.have.been.calledWith({ width: 10, height: 2 });
      }
    );

    it('should have a shorthand signature for streams',
      () => {
        subject.dividedBy(value$).subscribe(listener);

        subject.next({ x: 30, y: 60 });
        value$.next({ x: 2, y: 3 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 15, y: 20 });
      }
    );
  }
);
