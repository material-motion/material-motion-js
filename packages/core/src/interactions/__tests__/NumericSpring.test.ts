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
  exhaustValues,
  useMockedRAF,
} from 'material-motion-testing-utils';

import {
  State,
} from '../../enums';

import {
  createProperty,
} from '../../observables/createProperty';

import {
  Constructor,
} from '../../types';

import {
  NumericSpring,
} from '../NumericSpring';

describe('NumericSpring',
  useMockedRAF(
    (mockRAF) => {
      let valueListener;
      let stateListener;
      let spring: NumericSpring;

      beforeEach(
        () => {
          spring = new NumericSpring();
          stateListener = stub();
          valueListener = stub();
        }
      );

      // TODO: test initialVelocity, stiffness, damping, enabled, and threshold

      it('transitions from initialValue to destination',
        () => {
          spring.value$.subscribe(valueListener);

          spring.initialValue = 2;
          spring.destination = 3;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // firstCall is 0, since that's the default.
          expect(valueListener.secondCall).to.have.been.calledWith(2);
          expect(valueListener.lastCall).to.have.been.calledWith(3);
        }
      );

      it('starts at rest',
        () => {
          expect(spring.state).to.equal(State.AT_REST);
        }
      );

      it('passes through initialValue',
        () => {
          spring.value$.subscribe(valueListener);
          spring.state$.subscribe(stateListener);

          spring.initialValue = 2;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(valueListener).to.have.been.calledWith(2);
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it('becomes active before emitting new values',
        () => {
          let tested;

          spring.value$.subscribe(
            value => {
              if (value !== 0 && !tested) {
                expect(spring.state).to.equal(State.ACTIVE);
                tested = true;
              }
            }
          );

          spring.initialValue = 0;
          spring.destination = 1;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(tested).to.equal(true);
        }
      );

      it('comes to rest upon completion',
        () => {
          let tested;
          let next;

          spring.value$.subscribe(
            value => {
              next = value;
            }
          );

          spring.initialValue = 0;
          spring.destination = 1;

          spring.state$.subscribe(
            value => {
              if (next === 1 && !tested) {
                expect(value).to.equal(State.AT_REST);
                tested = true;
              }
            }
          );

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(tested).to.equal(true);
        }
      );

      it('should ignore changes to initialValue while disabled',
        () => {
          spring.value$.subscribe(valueListener);
          spring.state$.subscribe(stateListener);

          expect(valueListener).to.have.been.calledOnce;

          spring.enabled = false;
          spring.initialValue = 2;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // value$ is remembered, so you get once call synchronously upon
          // subscription
          expect(valueListener).to.have.been.calledOnce;
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it('should ignore changes to initialVelocity while disabled',
        () => {
          spring.value$.subscribe(valueListener);
          spring.state$.subscribe(stateListener);

          expect(valueListener).to.have.been.calledOnce;

          spring.enabled = false;
          spring.initialVelocity = 2;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // value$ is remembered, so you get once call synchronously upon
          // subscription
          expect(valueListener).to.have.been.calledOnce;
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it(`transitions to destination when reenabled`,
        () => {
          spring.value$.subscribe(valueListener);

          spring.initialValue = 2;
          spring.enabled = false;
          spring.destination = 3;
          spring.enabled = true;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // firstCall is 0, since that's the default.
          expect(valueListener.secondCall).to.have.been.calledWith(2);
          expect(valueListener.lastCall).to.have.been.calledWith(3);
        }
      );

      it(`transitions to destination when reenabled if initialValue has changed`,
        () => {
          spring.value$.subscribe(valueListener);

          spring.destination = 0;
          spring.enabled = false;
          spring.initialValue = 2;
          spring.enabled = true;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // firstCall is 0, since that's the default.
          expect(valueListener.secondCall).to.have.been.calledWith(2);
          expect(valueListener.lastCall).to.have.been.calledWith(0);
        }
      );

      it(`uses the most recent initialValue if that's changed while disabled`);
      it(`uses the cached initialValue if initialValue$ hasn't changed while disabled`);
      it(`uses the most recent initialVelocity if that's changed while disabled`);
      it(`uses the cached initialVelocity if initialVelocity$ hasn't changed while disabled`);
    }
  )
);
