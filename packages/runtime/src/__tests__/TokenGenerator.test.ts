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

import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  spy,
} from 'sinon';

import TokenGenerator from '../TokenGenerator';

describe('TokenGenerator',
  () => {
    let tokenGenerator;

    it(`should require a callback`,
      () => {
        expect(
          () => {
            new TokenGenerator();
          }
        ).to.throw(`onTokenCountChange`);
      }
    );

    it(`should notify the callback when a new token is issued`,
      () => {
        const onTokenCountChange = spy();
        new TokenGenerator({ onTokenCountChange }).generateToken();

        expect(onTokenCountChange.lastCall.args[0].count).to.equal(1);
      }
    );

    it(`should notify the callback when a token is terminated`,
      () => {
        const onTokenCountChange = spy();

        new TokenGenerator({ onTokenCountChange }).generateToken().terminate();

        expect(onTokenCountChange.lastCall.args[0].count).to.equal(0);
      }
    );

    it(`should error if a token is terminated repeatedly`,
      () => {
        expect(
          () => {
            const token = new TokenGenerator({ onTokenCountChange: () => null }).generateToken();
            token.terminate();
            token.terminate();
          }
        ).to.throw(`terminated`);
      }
    );
  }
);
