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
  spy,
} from 'sinon';

import Runtime from '../Runtime';

class ActivityTestingPerformer {
  tokens = [];

  constructor({ isActiveTokenGenerator }) {
    this.isActiveTokenGenerator = isActiveTokenGenerator;
  }

  addPlan({ plan, target }) {
    if (plan.type === 'start') {
      this.tokens = [this.isActiveTokenGenerator.generateToken(), ...this.tokens];

    } else if (plan.type === 'end') {
      const [dyingToken, ...tokens] = this.tokens;
      dyingToken.terminate();
      this.tokens = tokens;
    }
  }
}

const startActivityPlan = {
  type: 'start',
  _PerformerType: ActivityTestingPerformer,
};

const endActivityPlan = {
  type: 'end',
  _PerformerType: ActivityTestingPerformer,
};

describe('runtime.addPlan',
  () => {
    let runtime;
    let target = {};

    beforeEach(
      () => {
        runtime = new Runtime();
      }
    );

    it(`should start at rest`,
      () => {
        expect(runtime.isActive).to.be.false;
      }
    );

    it(`should become active when a continuous performer is added`,
      () => {
        runtime.addPlan({ plan: startActivityPlan, target });
        expect(runtime.isActive).to.be.true;
      }
    );

    it(`should be active when some continuous performers have not completed`,
      () => {
        runtime.addPlan({ plan: startActivityPlan, target });
        runtime.addPlan({ plan: startActivityPlan, target });
        runtime.addPlan({ plan: endActivityPlan, target });

        expect(runtime.isActive).to.be.true;
      }
    );

    it(`should be at rest when all continuous performers have completed`,
      () => {
        runtime.addPlan({ plan: startActivityPlan, target });
        runtime.addPlan({ plan: startActivityPlan, target });
        runtime.addPlan({ plan: endActivityPlan, target });
        runtime.addPlan({ plan: endActivityPlan, target });

        expect(runtime.isActive).to.be.false;
      }
    );

    it(`should support multiple activity listeners`,
      () => {
        const spy1 = spy();
        const spy2 = spy();

        runtime.addActivityListener({ listener: spy1 });
        runtime.addActivityListener({ listener: spy2 });

        runtime.addPlan({ plan: startActivityPlan, target });

        expect(spy1.lastCall.args[0].isActive).to.be.true;
        expect(spy2.lastCall.args[0].isActive).to.be.true;
      }
    );

    it(`should stop calling a removed listener`,
      () => {
        const spy1 = spy();
        const spy2 = spy();

        runtime.addActivityListener({ listener: spy1 });
        runtime.addActivityListener({ listener: spy2 });

        runtime.addPlan({ plan: startActivityPlan, target });

        runtime.removeActivityListener({ listener: spy2 });

        runtime.addPlan({ plan: endActivityPlan, target });

        expect(spy1.lastCall.args[0].isActive).to.be.false;
        expect(spy2.lastCall.args[0].isActive).to.be.true;
      }
    );
  }
);
