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
  createMockObserver,
} from 'material-motion-testing-utils';

import {
  MemorylessMotionSubject,
  MotionObservable,
} from '../../../observables/';

describe('motionObservable._reactiveMap',
  () => {
    let subject;
    let argSubject;
    let listener;

    beforeEach(
      () => {
        subject = new MemorylessMotionSubject();
        argSubject = new MemorylessMotionSubject();
        listener = stub();
      }
    );

    it('should call the transform function with each upstream value',
      () => {
        subject._reactiveMap(listener).subscribe(() => {});

        subject.next(2);
        expect(listener).to.have.been.calledWith(2);

        subject.next(3);
        expect(listener).to.have.been.calledWith(3);
      }
    );

    it('should call the transform function with each sideloaded value',
      () => {
        subject._reactiveMap(
          (upstream, sideloaded) => upstream + sideloaded,
          [ argSubject ],
        ).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.to.have.been.calledWith(42);

        argSubject.next(3);
        expect(listener).to.have.been.calledTwice.to.have.been.calledWith(43);
      }
    );

    it('should call the transform function when any stream dispatches a new value',
      () => {
        subject._reactiveMap(
          (upstream, sideloaded) => upstream + sideloaded,
          [ argSubject ],
        ).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.to.have.been.calledWith(42);

        subject.next(10);
        expect(listener).to.have.been.calledTwice.to.have.been.calledWith(12);

        argSubject.next(3);
        expect(listener).to.have.been.calledThrice.to.have.been.calledWith(13);
      }
    );

    it('should passthrough constants',
      () => {
        subject._reactiveMap(
          (upstream, constant, sideloaded) => upstream + constant + sideloaded,
          [ 100, argSubject ],
        ).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.to.have.been.calledWith(142);

        subject.next(10);
        expect(listener).to.have.been.calledTwice.to.have.been.calledWith(112);

        argSubject.next(3);
        expect(listener).to.have.been.calledThrice.to.have.been.calledWith(113);
      }
    );
  }
);

