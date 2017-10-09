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
  MemorylessMotionSubject,
} from '../observables/';

import {
  DEFAULT_VELOCITY,
  MAXIMUM_AGE,
  MAXIMUM_VELOCITY,
  getVelocity$,
} from '../getVelocity$';

describe('getVelocity$',
  useMockedPerformance(
    (mockPerformance) => {
      let value$;
      let pulse$;
      let listener;

      beforeEach(
        () => {
          value$ = new MemorylessMotionSubject();
          pulse$ = new MemorylessMotionSubject();
          listener = stub();
        }
      );

      it(`should not emit unless pulse$ does`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(0);
          value$.next(1);
          value$.next(2);

          expect(listener).not.to.have.been.called;
        }
      );

      it(`should emit 0 if pulse$ emits before it's received values from upstream`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(0);
        }
      );

      it(`should emit 0 when there is only one recent data point`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(100);
          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(0);
        }
      );

      it(`should calculate velocity for reasonable px / ms rates`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(1);
          mockPerformance.increment(5);
          value$.next(7);
          mockPerformance.increment(5);
          value$.next(11);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(1);
        }
      );

      it(`should support negative velocities`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(-1);
          mockPerformance.increment(5);
          value$.next(-7);
          mockPerformance.increment(5);
          value$.next(-11);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-1);
        }
      );

      it(`should emit defaultVelocity for super-fast velocities with only 2 data points`,
        () => {
          const defaultVelocity = 3;
          getVelocity$({ value$, pulse$, defaultVelocity }).subscribe(listener);

          value$.next(7);
          mockPerformance.increment(20);
          value$.next(1000);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(defaultVelocity);
        }
      );

      it(`should use the correct direction for defaultVelocity`,
        () => {
          const defaultVelocity = 3;
          getVelocity$({ value$, pulse$, defaultVelocity }).subscribe(listener);

          value$.next(-7);
          mockPerformance.increment(20);
          value$.next(-1000);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-defaultVelocity);
        }
      );

      it(`should emit maximumVelocity for super-fast velocities with at least 3 data points`,
        () => {
          const maximumVelocity = 7;
          getVelocity$({ value$, pulse$, maximumVelocity }).subscribe(listener);

          value$.next(1);
          mockPerformance.increment(1);
          value$.next(3);
          mockPerformance.increment(1);
          value$.next(6);
          mockPerformance.increment(1);
          value$.next(9);
          mockPerformance.increment(1);
          value$.next(100);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(maximumVelocity);
        }
      );

      it(`should use the correct direction for maximumVelocity`,
        () => {
          const maximumVelocity = 7;
          getVelocity$({ value$, pulse$, maximumVelocity }).subscribe(listener);

          value$.next(-1);
          mockPerformance.increment(1);
          value$.next(-3);
          mockPerformance.increment(1);
          value$.next(-6);
          mockPerformance.increment(1);
          value$.next(-9);
          mockPerformance.increment(1);
          value$.next(-100);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(-maximumVelocity);
        }
      );

      it(`should ignore trailing values older than MAXIMUM_AGE`,
        () => {
          const maximumVelocity = 7;
          getVelocity$({ value$, pulse$, maximumVelocity }).subscribe(listener);

          value$.next(1);
          mockPerformance.increment(MAXIMUM_AGE);
          value$.next(7);
          mockPerformance.increment(10);
          value$.next(10);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(.3);
        }
      );

      it(`should ignore values that aren't going in the current direction`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(7);
          mockPerformance.increment(10);
          value$.next(1);
          mockPerformance.increment(10);
          value$.next(11);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(1);
        }
      );

      it(`should use the most recent 5 values`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next(2);
          mockPerformance.increment(16);
          value$.next(4);
          mockPerformance.increment(16);
          value$.next(8);
          mockPerformance.increment(16);
          value$.next(16);
          mockPerformance.increment(16);
          value$.next(32);
          mockPerformance.increment(16);
          value$.next(64);
          mockPerformance.increment(16);
          value$.next(128);
          mockPerformance.increment(16);
          value$.next(256);

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(3.75);
        }
      );

      it(`should emit a point if the upstream values are points`,
        () => {
          getVelocity$({ value$, pulse$ }).subscribe(listener);

          value$.next({ x: 0, y: 0 });
          mockPerformance.increment(16);
          value$.next({ x: 10, y: 20 });
          mockPerformance.increment(16);
          value$.next({ x: 32, y: 64 });

          pulse$.next();

          expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({ x: 1, y: 2 });
        }
      );
    }
  )
);
