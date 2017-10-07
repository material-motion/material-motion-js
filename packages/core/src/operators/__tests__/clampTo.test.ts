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
  MotionSubject,
} from '../../observables/';

describe('motionObservable.clampTo',
  () => {
    let subject;
    let listener;

    beforeEach(
      () => {
        subject = new MotionSubject();
        listener = stub();
      }
    );

    it('should pass the value through when it is above the min',
      () => {
        subject.clampTo({ min$: 7 }).subscribe(listener);

        subject.next(13);

        expect(listener).to.have.been.calledWith(13);
      }
    );

    it('should emit the min if the value is below it',
      () => {
        subject.clampTo({ min$: 10 }).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(10);
      }
    );

    it('should pass the value through when it is below the max',
      () => {
        subject.clampTo({ max$: 7 }).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(3);
      }
    );

    it('should emit the max if the value is above it',
      () => {
        subject.clampTo({ max$: 10 }).subscribe(listener);

        subject.next(17);

        expect(listener).to.have.been.calledWith(10);
      }
    );

    it('should clamp smaller values when both bounds are specified',
      () => {
        subject.clampTo({ min$: 5, max$: 10 }).subscribe(listener);

        subject.next(1);

        expect(listener).to.have.been.calledWith(5);
      }
    );

    it('should clamp higher values when both bounds are specified',
      () => {
        subject.clampTo({ min$: 5, max$: 10 }).subscribe(listener);

        subject.next(100);

        expect(listener).to.have.been.calledWith(10);
      }
    );

    it('should clamp the y axis when a point is below the minimum',
      () => {
        subject.clampTo({ min$: { x: 5, y: 10 } }).subscribe(listener);

        subject.next({ x: 15, y: 3 });

        expect(listener).to.have.been.calledWithMatch({ x: 15, y: 10 });
      }
    );

    it('should clamp the x axis when a point is below the minimum',
      () => {
        subject.clampTo({ min$: { x: 5, y: 10 } }).subscribe(listener);

        subject.next({ x: 1, y: 30 });

        expect(listener).to.have.been.calledWithMatch({ x: 5, y: 30 });
      }
    );

    it('should clamp the y axis when a point is above the maximum',
      () => {
        subject.clampTo({ max$: { x: 5, y: 10 } }).subscribe(listener);

        subject.next({ x: 0, y: 30 });

        expect(listener).to.have.been.calledWithMatch({ x: 0, y: 10 });
      }
    );

    it('should clamp the x axis when a point is above the maximum',
      () => {
        subject.clampTo({ max$: { x: 5, y: 10 } }).subscribe(listener);

        subject.next({ x: 10, y: 3 });

        expect(listener).to.have.been.calledWithMatch({ x: 5, y: 3 });
      }
    );
  }
);
