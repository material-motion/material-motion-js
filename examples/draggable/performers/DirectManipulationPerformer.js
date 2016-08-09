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
import {Subject} from 'rxjs-es/Subject';

import dragStream from '../gestureStreamFactories/dragStream';

import {
  registerPerformerFactory,
} from '../../../src/performerFactoryRegistry';

export default function directManipulationPerformerFactory(targetAndPlan) {
  return new DirectManipulationPerformer(targetAndPlan);
}

directManipulationPerformerFactory.canHandle = function({target, plan}) {
  // It may be interesting to have a debug mode where this logs the tests
  // and whether they pass/fail.

  // // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/52):
  // // get a plan spec by its family name and assert its validity
  // console.assert(
  //  plan.isValid(),
  //  'DirectManipulationPerformer received an invalid Plan.',
  //  plan
  // );

  return (
    plan.familyName === 'material-motion-direct-manipulation-family' &&
    ['draggable'].includes(plan.type) &&
    target instanceof Element
  );
};

registerPerformerFactory(directManipulationPerformerFactory);

class DirectManipulationPerformer {
  _planAndTargetStream = new Subject();
  _isAtRestStream = new Subject();

  get planAndTargetStream() {
    return this._planAndTargetStream;
  }

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

  addPlan(plan) {
    console.assert(
      directManipulationPerformerFactory.canHandle(
        {
          target: this._target,
          plan,
        }
      ),
      `DirectManipulationPerformer doesn't know how to handle this Plan.`,
      plan
    );

    switch (plan.type) {
      case 'draggable':
        if (this._hasDraggablePlan) {
          // What happens if more than one plan comes in of the same type for
          // the same target?  Does it override the previous plan?  Throw an
          // error?

          throw new Error('This prototype only supports one plan');
        }

        this._hasDraggablePlan = true;

        // You have to manually turn off touch scrolling to get pointer events
        // to work.  Yes, this is incredibly gross.
        this._target.style.touchAction = 'none';

        dragStream(this._target).subscribe(
          dragDelta => {
            this._planAndTargetStream.next(
              {
                target: this._target,
                plan: {
                  familyName: 'material-motion-transform-family',
                  x: dragDelta.x,
                  y: dragDelta.y,
                },
              }
            );

            // Manually forwarding dragStream's isAtRest for a quick prototype.
            // Can evolve as needed if this becomes more than a quick prototype.
            this._isAtRestStream.next(dragDelta.isAtRest);
          }
        );
        break;
    }
  }
}
