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

import TokenGenerator from './TokenGenerator';
import makeCompoundKeySelector from './internal/makeCompoundKeySelector';

import {
  Performing,
  PerformingConstructor,
  PerformingWithAllFeaturesConstructor,
  PlanAndTarget,
} from './types';

export type ActivityListener = (kwargs: { isActive: boolean }) => any;

/**
 *  A runtime is responsible for fulfilling Plans by delegating them to the
 *  correct Performer.
 */
export default class Runtime {
  _performerMapSelector = makeCompoundKeySelector('PerformerType', 'target');
  _performerMap: Map<any, Performing> = new Map();
  _activityListeners: Set<ActivityListener> = new Set();

  _isActive: boolean = false;
  _isActiveTokenGenerator: TokenGenerator = new TokenGenerator(
    {
      // Using arrow function because TypeScript doesn't support bind
      // https://github.com/Microsoft/TypeScript/issues/212/
      onTokenCountChange: kwargs => this._onTokenCountChange(kwargs)
    }
   );

  /**
   *  If any of this runtime's performers aren't at rest, this will be true.
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   *  The runtime ensures the given plan is immediately applied to the given
   *  target.
   */
  addPlan({ plan, target }: PlanAndTarget): void {
    if (!plan) {
      throw new Error(`runtime.addPlan requires a plan`);
    }

    if (!target) {
      throw new Error(`runtime.addPlan requires a target`);
    }

    const isActiveTokenGenerator = this._isActiveTokenGenerator;
    const PerformerType: PerformingConstructor = plan._PerformerType; // tslint:disable-line

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

      const PerformerOfAllFeatures = PerformerType as PerformingWithAllFeaturesConstructor;  // tslint:disable-line
      performer = new PerformerOfAllFeatures({ target, isActiveTokenGenerator });

      this._performerMap.set(performerMapKey, performer);
    }

    performer.addPlan({ plan });
  }

  // For now, we're using add${ propertyName }Listener to handle observation:
  // - It's simple to implement.
  // - It's simple to deprecate/upgrade from.  When/if we have a more
  //   comprehensive observation story, we just have these log a warning and
  //   delegate to the new thing.
  // - It's easy to attach to existing libraries, e.g. RxJS's fromEventPattern.

  /**
   *  Any function passed here will be called every time runtime.isActive
   *  changes.
   */
  addActivityListener({ listener }:{ listener: ActivityListener }) {
    this._activityListeners.add(listener);
  }

  /**
   *  Stops notifying the given listener of changes to runtime.isActive.
   */
  removeActivityListener({ listener }:{ listener: ActivityListener }) {
    this._activityListeners.delete(listener);
  }

  _onTokenCountChange({ count }: { count: number }) {
    const wasActive = this._isActive;

    this._isActive = count !== 0;

    if (this._isActive !== wasActive) {
      this._activityListeners.forEach(
        listener => listener({ isActive: this._isActive })
      );
    }
  }
}
