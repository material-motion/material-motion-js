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
  MemorylessIndefiniteSubject,
  MotionSubject,
} from '../../observables/';

describe('motionObservable.toPolar',
  () => {
    let subject;
    let argSubject;
    let listener;

    beforeEach(
      () => {
        subject = new MotionSubject();
        argSubject = new MemorylessIndefiniteSubject();
        listener = stub();
      }
    );

    it('should emit the correct distance',
      () => {
        subject.toPolar({ origin$: { x: 10, y: 10 } }).pluck('distance').subscribe(listener);

        subject.next({ x: 3, y: 10 });

        expect(listener).to.have.been.calledWith(7);
      }
    );

    it('should emit the correct angle',
      () => {
        subject.toPolar({ origin$: { x: 10, y: 10 } }).pluck('angle').subscribe(listener);

        subject.next({ x: 10, y: 0 });

        expect(listener).to.have.been.calledWith(Math.PI / -2);
      }
    );
  }
);
