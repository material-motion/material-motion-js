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
import {elementAt} from 'rxjs-es/operator/elementAt';
import {filter} from 'rxjs-es/operator/filter';
import {takeUntil} from 'rxjs-es/operator/takeUntil';
import {Subject} from 'rxjs-es/Subject';

import {
  registerPerformerFactory,
} from '../../../src/performerFactoryRegistry';

export default function throwablePerformerFactory(targetAndPlan) {
  return new ThrowablePerformer(targetAndPlan);
}

throwablePerformerFactory.canHandle = function({target, plan}) {
  // It may be interesting to have a debug mode where this logs the tests
  // and whether they pass/fail.

  // // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/52):
  // // get a plan spec by its family name and assert its validity
  // console.assert(
  //  plan.isValid(),
  //  'ThrowablePerformer received an invalid Plan.',
  //  plan
  // );

  return plan.familyName === 'material-motion-throwable-family';
};

registerPerformerFactory(throwablePerformerFactory);

class ThrowablePerformer {
  _isAtRestStream = new Subject();

  get isAtRestStream() {
    return this._isAtRestStream;
  }

  get isAtRest() {
    return this._isAtRest;
  }

  constructor({target, plan}) {
    this._target = target;

    this._isAtRestSubscription = this._isAtRestStream.subscribe(
      isAtRest => {
        this._isAtRest = isAtRest;
      }
    );

    this._isAtRestStream.next(true);

    if (plan)
      this.addPlan(plan);
  }

  addPlan(plan, dispatchPlans) {
    console.assert(
      throwablePerformerFactory.canHandle(
        {
          target: this._target,
          plan,
        }
      ),
      `ThrowablePerformer doesn't know how to handle this Plan.`,
      plan
    );

    const draggableIsAtRestStream = dispatchPlans(
      [
        {
          plan: {
            familyName: 'material-motion-direct-manipulation-family',
            type: 'draggable',
          },
          target: this._target,
        },
      ],

      (planAndTargetStream) => {
        debugger;

        return dispatchPlans(planAndTargetStream)::takeUntil(
          draggableIsAtRestStream::filter(
            value => value === false
          )
        );
      }
    )::elementAt(0);
  }
}
