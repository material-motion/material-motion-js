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
  Performance,
  useMockedPerformance
} from 'material-motion-testing-utils';

import {
  IndefiniteSubject,
  MotionObservable,
} from '../../observables/';

import {
  DEFAULT_VELOCITY,
  MAXIMUM_AGE,
  MAXIMUM_VELOCITY,
} from '../velocity';

describe('motionObservable.velocity',
  useMockedPerformance(
    (mockPerformance) => {
      let valueStream;
      let pulseStream;
      let valueSubject;
      let pulseSubject;
      let listener;

      beforeEach(
        () => {
          valueSubject = new IndefiniteSubject();
          pulseSubject = new IndefiniteSubject();
          valueStream = MotionObservable.from(valueSubject);
          pulseStream = MotionObservable.from(pulseSubject);
          listener = stub();
        }
      );

      it(`should not dispatch unless pulse does`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(0);
          valueSubject.next(1);
          valueSubject.next(2);

          expect(listener).not.to.have.been.called;
        }
      );

      it(`should dispatch every time it receives a value if pulse isn't supplied`,
        () => {
          valueStream.velocity().subscribe(listener);

          valueSubject.next(0);
          mockPerformance.increment(1);
          valueSubject.next(1);

          expect(listener).to.have.been.calledTwice;
        }
      );

      it(`should dispatch 0 if pulse dispatches before it's received values from upstream`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(0);
        }
      );

      it(`should dispatch 0 when there is only one recent data point`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(100);
          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(0);
        }
      );

      it(`should calculate velocity for reasonable px / ms rates`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(1);
          mockPerformance.increment(5);
          valueSubject.next(7);
          mockPerformance.increment(5);
          valueSubject.next(11);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(1);
        }
      );

      it(`should support negative velocities`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(-1);
          mockPerformance.increment(5);
          valueSubject.next(-7);
          mockPerformance.increment(5);
          valueSubject.next(-11);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-1);
        }
      );

      it(`should dispatch DEFAULT_VELOCITY for super-fast velocities with only 2 data points`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(7);
          mockPerformance.increment(20);
          valueSubject.next(1000);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(DEFAULT_VELOCITY);
        }
      );

      it(`should use the correct direction for DEFAULT_VELOCITY`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(-7);
          mockPerformance.increment(20);
          valueSubject.next(-1000);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-DEFAULT_VELOCITY);
        }
      );

      it(`should dispatch MAXIMUM_VELOCITY for super-fast velocities with at least 3 data points`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(1);
          mockPerformance.increment(1);
          valueSubject.next(3);
          mockPerformance.increment(1);
          valueSubject.next(6);
          mockPerformance.increment(1);
          valueSubject.next(9);
          mockPerformance.increment(1);
          valueSubject.next(100);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(MAXIMUM_VELOCITY);
        }
      );

      it(`should use the correct direction for MAXIMUM_VELOCITY`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(-1);
          mockPerformance.increment(1);
          valueSubject.next(-3);
          mockPerformance.increment(1);
          valueSubject.next(-6);
          mockPerformance.increment(1);
          valueSubject.next(-9);
          mockPerformance.increment(1);
          valueSubject.next(-100);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-MAXIMUM_VELOCITY);
        }
      );

      it(`should ignore trailing values older than MAXIMUM_AGE`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(1);
          mockPerformance.increment(MAXIMUM_AGE);
          valueSubject.next(7);
          mockPerformance.increment(10);
          valueSubject.next(10);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(.3);
        }
      );

      it(`should ignore values that aren't going in the current direction`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(7);
          mockPerformance.increment(10);
          valueSubject.next(1);
          mockPerformance.increment(10);
          valueSubject.next(11);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(1);
        }
      );

      it(`should use the most recent 5 values`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next(2);
          mockPerformance.increment(16);
          valueSubject.next(4);
          mockPerformance.increment(16);
          valueSubject.next(8);
          mockPerformance.increment(16);
          valueSubject.next(16);
          mockPerformance.increment(16);
          valueSubject.next(32);
          mockPerformance.increment(16);
          valueSubject.next(64);
          mockPerformance.increment(16);
          valueSubject.next(128);
          mockPerformance.increment(16);
          valueSubject.next(256);

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(3.75);
        }
      );

      it(`should dispatch a point if the upstream values are points`,
        () => {
          valueStream.velocity(pulseStream).subscribe(listener);

          valueSubject.next({ x: 0, y: 0 });
          mockPerformance.increment(16);
          valueSubject.next({ x: 10, y: 20 });
          mockPerformance.increment(16);
          valueSubject.next({ x: 32, y: 64 });

          pulseSubject.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 1, y: 2 });
        }
      );
    }
  )
);
