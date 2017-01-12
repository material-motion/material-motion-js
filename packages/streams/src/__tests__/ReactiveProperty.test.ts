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
  stub,
} from 'sinon';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

import ReactiveProperty from '../ReactiveProperty';

describe('ReactiveProperty',
  () => {
    it(`should store the last value if created with no arguments`,
      () => {
        const property = new ReactiveProperty();

        property.write(5);
        expect(property.read()).to.equal(5);
      }
    );

    it(`should use the write argument, if provided`,
      () => {
        const write = stub();
        new ReactiveProperty({ write }).write(7);
        expect(write).to.have.been.calledWith(7);
      }
    );

    it(`should use the read argument, if provided`,
      () => {
        const property = new ReactiveProperty({ read: () => 7 });
        expect(property.read()).to.equal(7);
      }
    );

    it(`should forward writes to subscribers`,
      () => {
        const listener = stub();
        const property = new ReactiveProperty();

        property.subscribe(listener);
        property.write('banana');

        expect(listener).to.have.been.calledWith('banana');
      }
    );

    it(`should forward the most recent write to new subscribers`,
      () => {
        const listener = stub();
        const property = new ReactiveProperty();

        property.write('banana');
        property.subscribe(listener);

        expect(listener).to.have.been.calledWith('banana');
      }
    );

    it(`should forward writes to subscribers, when using a custom write`,
      () => {
        const listener = stub();
        const write = stub();
        const property = new ReactiveProperty({ write });

        property.subscribe(listener);
        property.write('banana');

        expect(listener).to.have.been.calledWith('banana');
        expect(write).to.have.been.calledWith('banana');
      }
    );
  }
);
