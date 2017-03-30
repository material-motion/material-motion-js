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

import { expect } from 'chai';

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
  Spring,
  State,
  createProperty,
} from 'material-motion';

import {
  _reboundInternalSpringSystem,
  numericSpringSystem,
} from '../springSystem';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

// TODO: abstract these tests out into a shared compatibility suite, e.g.:
//   testSpringSystem(reboundSpringSystem)
// would run all the spring tests against the rebound adaptor
describe('numericSpringSystem',
  () => {
    let listener;
    let spring;

    beforeEach(
      () => {
        _reboundInternalSpringSystem.setLooper(new SimulationLooper());
        spring = new Spring();
        listener = stub();
      }
    );

    // TODO: test initialVelocity, tension, friction, enabled, and threshold

    it('transitions from initialValue to destination',
      () => {
        spring.initialValue.write(2);
        spring.destination.write(3);

        numericSpringSystem(spring).subscribe(listener);

        expect(listener.firstCall).to.have.been.calledWith(2);
        expect(listener.lastCall).to.have.been.calledWith(3);
      }
    );

    it('starts at rest',
      () => {
        numericSpringSystem(spring).subscribe(listener);

        expect(spring.state.read()).to.equal(State.AT_REST);

        // Rebound dispatches the current value whenever it's set.  Rather than
        // add a bunch of logic to repress this, we just confirm it in the test.
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(spring.initialValue.read());
      }
    );

    it('becomes active before dispatching new values',
      () => {
        let tested;

        spring.initialValue.write(0);
        spring.destination.write(1);

        numericSpringSystem(spring).subscribe(
          value => {
            if (value !== 0 && !tested) {
              expect(spring.state.read()).to.equal(State.ACTIVE);
              tested = true;
            }
          }
        );

        expect(tested).to.equal(true);
      }
    );

    it('comes to rest upon completion',
      () => {
        let tested;
        let next;

        spring.initialValue.write(0);
        spring.destination.write(1);

        numericSpringSystem(spring).subscribe(
          value => {
            next = value;
          }
        );

        spring.state.subscribe(
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
  }
);
