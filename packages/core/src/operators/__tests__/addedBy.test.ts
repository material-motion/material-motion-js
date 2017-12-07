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

describe('motionObservable.addedBy',
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

    it('should add the amount constant to the upstream numeric value and emit the result',
      () => {
        subject.addedBy({ value$: 10 }).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(13);
      }
    );

    it('should add the amount constant to the upstream Point2D value and emit the result',
      () => {
        subject.addedBy({ value$: { x: 10, y: 20 } }).subscribe(listener);

        subject.next({ x: 100, y: -40 });

        expect(listener).to.have.been.calledWith({ x: 110, y: -20 });
      }
    );

    it('should add the amount constant to the upstream Dimensions value and emit the result',
      () => {
        subject.addedBy({ value$: { width: 10, height: 20 } }).subscribe(listener);

        subject.next({ width: 100, height: -40 });

        expect(listener).to.have.been.calledWith({ width: 110, height: -20 });
      }
    );

    it('should add the amount constant to the upstream Point2D value and emit the result',
      () => {
        subject.addedBy({ value$: { x: 10, y: 20 } }).subscribe(listener);

        subject.next({ x: 100, y: -40 });

        expect(listener).to.have.been.calledWith({ x: 110, y: -20 });
      }
    );

    it('should add values from value$ to the upstream numeric value and emit the result',
      () => {
        subject.addedBy({ value$ }).subscribe(listener);

        subject.next(3);
        value$.next(10);
        value$.next(20);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(13).and.to.have.been.calledWith(23);
      }
    );

    it('should add values from value$ to the upstream Point2D value and emit the result',
      () => {
        subject.addedBy({ value$ }).subscribe(listener);

        subject.next({ x: 100, y: -40 });
        subject.next({ x: 10, y: 0 });
        value$.next({ x: 0, y: 15 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 10, y: 15 });
      }
    );

    it('should add values from value$ to the upstream Dimensions value and emit the result',
      () => {
        subject.addedBy({ value$ }).subscribe(listener);

        subject.next({ width: 100, height: -40 });
        subject.next({ width: 10, height: 0 });
        value$.next({ width: 0, height: 15 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ width: 10, height: 15 });
      }
    );

    it('should have a shorthand signature for numeric constants',
      () => {
        subject.addedBy(10).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(13);
      }
    );

    it('should have a shorthand signature for Point2D constants',
      () => {
        subject.addedBy({ x: 10, y: 20 }).subscribe(listener);

        subject.next({ x: 100, y: -40 });

        expect(listener).to.have.been.calledWith({ x: 110, y: -20 });
      }
    );

    it('should have a shorthand signature for Dimensions constants',
      () => {
        subject.addedBy({ width: 10, height: 20 }).subscribe(listener);

        subject.next({ width: 100, height: -40 });

        expect(listener).to.have.been.calledWith({ width: 110, height: -20 });
      }
    );

    it('should have a shorthand signature for streams',
      () => {
        subject.addedBy(value$).subscribe(listener);

        subject.next(3);
        value$.next(10);
        value$.next(20);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(13).and.to.have.been.calledWith(23);
      }
    );
  }
);
