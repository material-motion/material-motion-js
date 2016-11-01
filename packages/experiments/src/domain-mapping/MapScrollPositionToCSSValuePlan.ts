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

import { Plan } from 'material-motion-runtime';

import MapScrollPositionToCSSValuePerformer from './MapScrollPositionToCSSValuePerformer';

interface MapScrollPositionToCSSValuePlanArgs {
  propertyName: string;
  valueTemplate: string;
  fromValue: number;
  toValue: number;
  scrollOffset?: number;
  scrollRange?: number;
}

class MapScrollPositionToCSSValuePlan {
  _PerformerType = MapScrollPositionToCSSValuePerformer;

  constructor(kwargs:MapScrollPositionToCSSValuePlanArgs) {
    return Object.assign(this, kwargs);
  }
}

// Until TypeScript has better support for destructuring, this is the DRY way
// to type named args.
//
// https://github.com/Microsoft/TypeScript/issues/5326#issuecomment-256787939
interface MapScrollPositionToCSSValuePlan extends MapScrollPositionToCSSValuePlanArgs, Plan {}
export default MapScrollPositionToCSSValuePlan;
