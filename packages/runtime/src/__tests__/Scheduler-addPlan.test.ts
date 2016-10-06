/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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

import Scheduler from '../Scheduler';

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

describe('Scheduler.addPlan',
  () => {
    let scheduler;
    let addPlanSpy;
    let PerformerSpy;
    let planWithSpies;
    let target = {};

    beforeEach(
      () => {
        scheduler = new Scheduler();

        addPlanSpy = stub();

        PerformerSpy = stub().returns(
          {
            addPlan: addPlanSpy,
          }
        );

        planWithSpies = {
          _PerformerType: PerformerSpy,
        }
      }
    );

    it(`should require arguments`,
      () => {
        expect(
          () => {
            scheduler.addPlan();
          }
        ).to.throw(`Scheduler.addPlan requires`);
      }
    );

    it(`should require a target`,
      () => {
        expect(
          () => {
            scheduler.addPlan({ plan: planWithSpies });
          }
        ).to.throw(`requires a target`);
      }
    );

    it(`should require a plan`,
      () => {
        expect(
          () => {
            scheduler.addPlan({ target });
          }
        ).to.throw(`requires a plan`);
      }
    );

    it(`should create a performer from plan._PerformerType`,
      () => {
        scheduler.addPlan({ plan: planWithSpies, target });

        expect(planWithSpies._PerformerType).to.be.calledWithNew;
      }
    );

    it(`should recycle performers for the same plan and target`,
      () => {
        scheduler.addPlan({ plan: planWithSpies, target });
        scheduler.addPlan({ plan: planWithSpies, target });
        expect(PerformerSpy).to.have.been.calledOnce;
      }
    );

    it(`should recycle performers for the same plan._PerformerType and target`,
      () => {
        const otherPlanSamePerformerType = {
          _PerformerType: PerformerSpy,
        };

        scheduler.addPlan({ plan: planWithSpies, target });
        scheduler.addPlan({ plan: otherPlanSamePerformerType, target });
        expect(PerformerSpy).to.have.been.calledOnce;
      }
    );

    it(`should create new performers for each target`,
      () => {
        scheduler.addPlan({ plan: planWithSpies, target });
        scheduler.addPlan({ plan: planWithSpies, target: {} });
        expect(PerformerSpy).to.have.been.calledTwice;
      }
    );

    it(`should call performer.addPlan for each plan`,
      () => {
        scheduler.addPlan({ plan: planWithSpies, target });
        scheduler.addPlan({ plan: planWithSpies, target });
        expect(addPlanSpy).to.have.been.calledTwice;
      }
    );
  }
);
