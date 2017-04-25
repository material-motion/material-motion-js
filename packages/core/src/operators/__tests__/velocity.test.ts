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
} from 'material-motion-testing-utils';

import {
  IndefiniteSubject,
  MotionObservable,
} from '../../observables/';

describe('motionObservable.velocity',
  () => {
    let valueStream;
    let pulseStream;
    let valueSubject;
    let pulseSubject;
    let listener;

    beforeEach(
      () => {
        valueSubject = new IndefiniteSubject();
        pulseSubject = new IndefiniteSubject();
        valueStream = MotionObservable.from(valueSubject);
        pulseStream = MotionObservable.from(pulseSubject);
        listener = stub();
      }
    );

    it(`should not dispatch unless pulse does`,
      () => {
        valueStream.velocity(pulseStream).subscribe(listener);

        valueSubject.next(0);
        valueSubject.next(1);
        valueSubject.next(2);

        expect(listener).not.to.have.been.called;
      }
    );

    it(`should dispatch every time it receives a value is pulse isn't supplied`,
      () => {
        valueStream.velocity().subscribe(listener);

        valueSubject.next(0);
        valueSubject.next(1);

        expect(listener).to.have.been.calledTwice;
      }
    );

    it(`should dispatch 0 if pulse dispatches before it's received values from upstream`,
      () => {
        valueStream.velocity(pulseStream).subscribe(listener);

        pulseSubject.next(0);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(0);
      }
    );
  }
);
