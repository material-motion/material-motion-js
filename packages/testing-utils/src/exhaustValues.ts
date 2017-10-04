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

import {
  Observable,
} from 'indefinite-observable';

import {
  MockRAF,
} from './useMockedRAF';

export type ExhaustValuesArgs = {
  // Using indefinite-observable's Observable interface and string literals here
  // to avoid creating a circular dependency on material-motion.
  state$: Observable<'active' | 'at_rest'>,
  mockRAF: MockRAF,
};

export function exhaustValues({ state$, mockRAF }: ExhaustValuesArgs) {
  let triesLeft = 50;
  let hasBeenActive: boolean;
  let isAtRest;

  state$.subscribe(
    (state) => {
      if (state === 'active') {
        hasBeenActive = true;
      }

      if (state === 'at_rest' && hasBeenActive) {
        isAtRest = true;
      }
    }
  );

  while (!isAtRest && triesLeft > 0) {
    mockRAF.step();
    triesLeft--;
  }
}
export default exhaustValues;
