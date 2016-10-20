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

export interface Plan {
  _PerformerType: PerformingConstructor;
}

export interface Target {

}

// TODO(https://github.com/material-motion/material-motion-experiments-js/issues/70):
// Add `declare` keyword to avoid mangling on the public API surface
export interface PlanAndTarget {
  plan: Plan;
  target: Target;
}

export interface Performing {
  addPlan(kwargs: {
    plan: Plan
  }): void;
}

export interface PerformingArgs {
  target: Target;
}

export interface PerformingConstructor {
  new (kwargs: PerformingArgs): Performing;
}

export interface ContinuousPerforming extends Performing {
}

export interface ContinuousPerformingArgs {
  isActiveTokenGenerator: TokenGenerator;
}

export interface ContinuousPerformingConstructor extends PerformingConstructor {
  new (kwargs: ContinuousPerformingArgs & PerformingArgs): ContinuousPerforming;
}

export interface PerformingWithAllFeaturesConstructor extends PerformingConstructor {
  new (kwargs: ContinuousPerformingArgs & PerformingArgs): Performing;
}
