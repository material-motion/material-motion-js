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
  SinonSpyCall,
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
  Point2D,
} from '../../types';

import {
  Point2DSpring,
} from '../Point2DSpring';

describe('Point2DSpring',
  useMockedRAF(
    (mockRAF) => {
      let valueListener;
      let stateListener;
      let spring: Point2DSpring;

      beforeEach(
        () => {
          spring = new Point2DSpring();

          stateListener = stub();
          valueListener = stub();
        }
      );

      // TODO: test initialVelocity, stiffness, damping, enabled, and threshold

      it('transitions from initialValue to destination',
        () => {
          // Because `value$` is composed of two springs, it takes a few
          // emissions before `initialValue` matches the expectation.
          //
          // Thus, we only measure what its values are when the state changes,
          // to be sure we are checking the correct values.
          spring.value$._debounce(spring.state$).subscribe(valueListener);

          const initialValue = { x: 2, y: 3 };
          const destination = { x: 4, y: 2 };

          spring.initialValue = initialValue;
          spring.destination = destination;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(valueListener.secondCall).to.have.been.calledWithMatch(initialValue);
          expect(valueListener.lastCall).to.have.been.calledWithMatch(destination);
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

          const initialValue = { x: 5, y: 4 };

          spring.initialValue = initialValue;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(valueListener).to.have.been.calledWithMatch(initialValue);
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it('becomes active before dispatching new values',
        () => {
          let tested;

          spring.value$.subscribe(
            ({ x, y }) => {
              if (x !== 0 && y !== 0 && !tested) {
                expect(spring.state).to.equal(State.ACTIVE);
                tested = true;
              }
            }
          );

          spring.initialValue = { x: 0, y: 1 };
          spring.destination = { x: 1, y: 0 };

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

          const initialValue = { x: 0, y: 0 };
          const destination = { x: 1, y: 5 };

          spring.initialValue = initialValue;
          spring.destination = destination;

          spring.state$.subscribe(
            value => {
              if (next.x === destination.x && next.y === destination.y && !tested) {
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

          expect(valueListener).to.have.been.calledTwice;

          spring.enabled = false;
          spring.initialValue = { x: 2, y: 10 };

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // value$ receives x and y independently, so it will dispatch as each
          // is initialized
          expect(valueListener).to.have.been.calledTwice;
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it('should ignore changes to initialVelocity while disabled',
        () => {
          spring.value$.subscribe(valueListener);
          spring.state$.subscribe(stateListener);

          expect(valueListener).to.have.been.calledTwice;

          spring.enabled = false;
          spring.initialVelocity = { x: 2, y: 3 };

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // value$ receives x and y independently, so it will dispatch as each
          // is initialized
          expect(valueListener).to.have.been.calledTwice;
          expect(stateListener).not.to.have.been.calledWith(State.ACTIVE);
        }
      );

      it(`transitions to destination when reenabled`,
        () => {
          // Because `value$` is composed of two springs, it takes a few
          // emissions before `initialValue` matches the expectation.
          //
          // Thus, we only measure what its values are when the state changes,
          // to be sure we are checking the correct values.
          spring.value$._debounce(spring.state$).subscribe(valueListener);

          const initialValue = { x: 4, y: 8 };
          const destination = { x: 0, y: 0 };

          spring.initialValue = initialValue;
          spring.enabled = false;
          spring.destination = destination;
          spring.enabled = true;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          expect(valueListener.secondCall).to.have.been.calledWithMatch(initialValue);
          expect(valueListener.lastCall).to.have.been.calledWithMatch(destination);
        }
      );

      it(`transitions to destination when reenabled if initialValue has changed`,
        () => {
          spring.value$.subscribe(valueListener);

          const initialValue = { x: 5, y: 4 };
          const destination = { x: 0, y: 0 };

          spring.destination = destination;
          spring.enabled = false;
          spring.initialValue = initialValue;
          spring.enabled = true;

          exhaustValues({
            state$: spring.state$,
            mockRAF
          });

          // value$ receives x and y independently, so it will dispatch as each
          // is initialized
          expect(valueListener.getCall(4)).to.have.been.calledWithMatch(initialValue);
          expect(valueListener.lastCall).to.have.been.calledWithMatch(destination);
        }
      );

      it(`uses the most recent initialValue if that's changed while disabled`);
      it(`uses the cached initialValue if initialValue$ hasn't changed while disabled`);
      it(`uses the most recent initialVelocity if that's changed while disabled`);
      it(`uses the cached initialVelocity if initialVelocity$ hasn't changed while disabled`);
    }
  )
);
