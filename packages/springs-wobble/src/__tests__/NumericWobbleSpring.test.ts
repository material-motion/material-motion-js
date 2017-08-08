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

import { expect, use as useInChai } from 'chai';
import * as sinonChai from 'sinon-chai';
useInChai(sinonChai);

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

import {
  Spring,
} from 'wobble';

import {
  State,
} from 'material-motion';

import {
  useMockedRAF,
} from 'material-motion-testing-utils';

import {
  testNumericSpring,
} from '../../../core/src/interactions/__tests__/NumericSpring.testSuite';

import {
  NumericWobbleSpring,
} from '../NumericWobbleSpring';

describe('NumericWobbleSpring',
  useMockedRAF(
    (mockRAF) => {
      testNumericSpring(
        NumericWobbleSpring,

        function exhaustValues(spring) {
          let triesLeft = 50;
          let hasBeenActive;
          let isAtRest;

          spring.state$.subscribe(
            (state) => {
              if (state === State.ACTIVE) {
                hasBeenActive = true;
              }

              if (state === State.AT_REST && hasBeenActive) {
                isAtRest = true;
              }
            }
          );

          while (!isAtRest && triesLeft > 0) {
            mockRAF.step();
            triesLeft--;
          }
        }
      );
    }
  )
);
