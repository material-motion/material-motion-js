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
 *
 *  @flow
 */

// TODO: types

import {of as observableOf} from 'rxjs-es/observable/of';

import {
  registerPerformerFactory,
} from '../../../src/performerFactoryRegistry';

export default function transformPerformerWebFactory(targetAndPlan) {
  return new TransformPerformerWeb(targetAndPlan);
}

transformPerformerWebFactory.canHandle = function({target, plan}) {
  // It may be interesting to have a debug mode where this logs the tests
  // and whether they pass/fail.

  // // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/52):
  // // get a plan spec by its family name and assert its validity
  // console.assert(
  //  plan.isValid(),
  //  'TransformPerformerWeb received an invalid Plan.',
  //  plan
  // );

  return (
    plan.familyName === 'material-motion-transform-family' &&
    (
      plan.x !== undefined ||
      plan.y !== undefined
    ) &&
    target instanceof Element
  );
};

registerPerformerFactory(transformPerformerWebFactory);

class TransformPerformerWeb {
  constructor({target, plan}) {
    this._target = target;

    if (plan)
      this.addPlan(plan);
  }

  addPlan(plan) {
    console.assert(
      transformPerformerWebFactory.canHandle(
        {
          target: this._target,
          plan,
        }
      ),
      `TransformPerformerWeb doesn't know how to handle this Plan.`,
      plan
    );

    this._target.style.left = plan.x + 'px';
    this._target.style.top = plan.y + 'px';

    // It's a sync performer, so it's at rest by the time it returns
    // https://github.com/material-motion/material-motion-experiments-js/issues/61
    return observableOf(true);
  }
}
