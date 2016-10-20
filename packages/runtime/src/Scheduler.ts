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

import TokenGenerator from './TokenGenerator';
import makeCompoundKeySelector from './internal/makeCompoundKeySelector';

import {
  Performing,
  PerformingConstructor,
  PerformingWithAllFeaturesConstructor,
  PlanAndTarget,
} from './types';

/**
 *  The Scheduler is responsible for fulfilling Plans by delegating them to the
 *  correct Performer.
 */
export default class Scheduler {
  _performerMapSelector = makeCompoundKeySelector('PerformerType', 'target');
  _performerMap: Map<any, Performing> = new Map();

  _isActive: boolean = false;
  _isActiveTokenGenerator: TokenGenerator = new TokenGenerator(
    {
      onTokenCountChange: this._onTokenCountChange
    }
   );

  get isActive(): boolean {
    return this._isActive;
  }

  /**
   *  The Scheduler will ensure the given plan is immediately applied to the
   *  given target.
   */
  addPlan({ plan, target }: PlanAndTarget): void {
    if (!plan) {
      throw new Error(`Scheduler.addPlan requires a plan`);
    }

    if (!target) {
      throw new Error(`Scheduler.addPlan requires a target`);
    }

    const isActiveTokenGenerator = this._isActiveTokenGenerator;
    const PerformerType: PerformingConstructor = plan._PerformerType;

    const performerMapKey = this._performerMapSelector({ PerformerType, target });
    let performer: Performing;

    if (this._performerMap.has(performerMapKey)) {
      performer = this._performerMap.get(performerMapKey) as Performing;

    } else {
      // There are a bunch of optional features that a performer might support.
      // We give them all the tools we have and let them decide whether or not
      // they want to use them.
      //
      // To express this in TypeScript, we cast PerformerType to an imaginary
      // constructor that supports every feature.  Of course, whatever
      // performer we're actually instantiating will ignore any features it
      // doesn't care about.  By telling TypeScript it could support all of
      // them, it should ensure we get type errors if a feature isn't threaded
      // through correctly.

      const PerformerOfAllFeatures = PerformerType as PerformingWithAllFeaturesConstructor;
      performer = new PerformerOfAllFeatures({ target, isActiveTokenGenerator });

      this._performerMap.set(performerMapKey, performer);
    }

    performer.addPlan({ plan });
  }

  _onTokenCountChange({ count }: { count: number }) {
    this._isActive = count !== 0;
  }
}
