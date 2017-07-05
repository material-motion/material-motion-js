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
  SimulationLooper,
} from 'rebound';

import {
  State,
  createProperty,
} from 'material-motion';

import {
  NumericReboundSpring,
  _reboundInternalSpringSystem,
} from '../NumericReboundSpring';

// TODO: abstract these tests out into a shared compatibility suite, e.g.:
//   testSpring(reboundSpring)
// would run all the spring tests against the rebound adaptor
describe('NumericReboundSpring',
  () => {
    let listener;
    let spring;

    beforeEach(
      () => {
        _reboundInternalSpringSystem.setLooper(new SimulationLooper());
        spring = new NumericReboundSpring();
        listener = stub();
      }
    );

    // TODO: test initialVelocity, tension, friction, enabled, and threshold

    it('transitions from initialValue to destination',
      () => {
        spring.value$.subscribe(listener);

        spring.initialValue = 2;
        spring.destination = 3;

        expect(listener.firstCall).to.have.been.calledWith(2);
        expect(listener.lastCall).to.have.been.calledWith(3);
      }
    );

    it('starts at rest',
      () => {
        expect(spring.state).to.equal(State.AT_REST);
      }
    );

    it('becomes active before dispatching new values',
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

        expect(tested).to.equal(true);
      }
    );

    it(`uses the most recent destination if that's changed while disabled`);
    it(`uses the cached destination if destination$ hasn't changed while disabled`);
    it(`uses the most recent initialValue if that's changed while disabled`);
    it(`uses the cached initialValue if initialValue$ hasn't changed while disabled`);
    it(`uses the most recent initialVelocity if that's changed while disabled`);
    it(`uses the cached initialVelocity if initialVelocity$ hasn't changed while disabled`);
  }
);
