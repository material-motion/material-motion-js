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

import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  spy,
} from 'sinon';

import MotionProperty from '../MotionProperty';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

describe('motionProperty',
  () => {
    let property;
    let listener;

    beforeEach(
      () => {
        property = new MotionProperty();

        listener = spy();
      }
    );

    it(`should be a property with operators`,
      () => {
        property.pluck('a').subscribe(listener);

        property.write({ 'a': 1 });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(1);
      }
    );

    // It would be more thorough to re-run the ReactiveProperty and operator
    // test suites here, but I'm not sure it adds value/
  }
);
