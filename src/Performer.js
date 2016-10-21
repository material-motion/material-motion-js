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
 *
 *  @flow
 */

import type {
  PlanT,
} from './Plan';

export type PlanAndTargetT = {
  plan:PlanT,
  target:mixed
};

// TODO(https://github.com/material-motion/material-motion-experiments-js/issues/1)
// No idea if this is the right syntax
interface PerformerInstancesI {
  constructor(planAndTarget:PlanAndTargetT):void;
}

type PerformerStaticsT = {
  canHandle(planAndTarget:PlanAndTargetT):boolean;
}

export type PerformerI = PerformerInstancesI&PerformerStaticsT;
