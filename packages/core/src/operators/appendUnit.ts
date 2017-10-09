/** @license
appe/** @license
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

import {
  Constructor,
  MotionMappable,
  ObservableWithMotionOperators,
} from '../types';

import {
  isDefined,
} from '../typeGuards';

export type AppendUnitArgs = {
  unit: string,
}

export interface MotionAppendUnitable {
  appendUnit(kwargs: AppendUnitArgs): ObservableWithMotionOperators<string>;
  appendUnit(unit: string): ObservableWithMotionOperators<string>;
}

export function withAppendUnit<T, S extends Constructor<MotionMappable<T>>>(superclass: S): S & Constructor<MotionAppendUnitable> {
  return class extends superclass implements MotionAppendUnitable {
    /**
     * Converts a stream to a CSS string representation by appending the given
     * unit to the upstream values.
     */
    appendUnit(kwargs: AppendUnitArgs): ObservableWithMotionOperators<string>;
    appendUnit(unit: string): ObservableWithMotionOperators<string>;
    appendUnit({ unit }: AppendUnitArgs & string): ObservableWithMotionOperators<string> {
      if (!isDefined(unit)) {
        unit = arguments[0];
      }

      return this._map({
        transform: (value: T) => value + unit
      });
    }
  };
}
