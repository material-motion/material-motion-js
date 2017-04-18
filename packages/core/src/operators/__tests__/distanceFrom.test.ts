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

import {
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  MotionObservable,
} from '../../observables/';

describe('motionObservable.distanceFrom',
  () => {
    let stream;
    let mockObserver;
    let listener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        listener = stub();
      }
    );

    it('should work on numbers',
      () => {
        stream.distanceFrom(10).subscribe(listener);

        mockObserver.next(15);

        expect(listener).to.have.been.calledWith(5);
      }
    );

    it('should be positive, even if the next value is smaller',
      () => {
        stream.distanceFrom(10).subscribe(listener);

        mockObserver.next(5);

        expect(listener).to.have.been.calledWith(5);
      }
    );

    it('should work on points',
      () => {
        stream.distanceFrom({ x: 100, y: 100 }).subscribe(listener);

        mockObserver.next({ x: 0, y: 0 });

        const valueInLastCall = listener.lastCall.args[0];
        expect(valueInLastCall).to.be.closeTo(100 / Math.cos(Math.PI / 4), 1);
      }
    );
  }
);
