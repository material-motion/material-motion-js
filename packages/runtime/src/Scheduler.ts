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

import makeCompoundKeySelector from './internal/makeCompoundKeySelector';

import {
  Performer,
  PerformerConstructor,
  PlanAndTarget,
} from './types';

/**
 *  The Scheduler is responsible for fulfilling Plans by delegating them to the
 *  correct Performer.
 */
export default class Scheduler {
  _performerMapSelector = makeCompoundKeySelector('PerformerType', 'target');
  _performerMap:Map<any, Performer> = new Map();

  /**
   *  The Scheduler will ensure the given plan is immediately applied to the
   *  given target.
   */
  addPlan({ plan, target }:PlanAndTarget = {}):void {
    if (!plan) {
      throw new Error(`Scheduler.addPlan requires a plan`);
    }

    if (!target) {
      throw new Error(`Scheduler.addPlan requires a target`);
    }

    const PerformerType:PerformerConstructor = plan._PerformerType;

    const performerMapKey = this._performerMapSelector({ PerformerType, target });
    let performer:Performer;

    if (this._performerMap.has(performerMapKey)) {
      performer = this._performerMap.get(performerMapKey);

    } else {
      performer = new PerformerType({ target });
      this._performerMap.set(performerMapKey, performer);
    }

    performer.addPlan({ plan });
  }
}
