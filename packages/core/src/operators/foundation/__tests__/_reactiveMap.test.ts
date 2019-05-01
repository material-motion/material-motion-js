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
  MotionSubject,
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
        subject._reactiveMap({
          transform: listener,
          inputs: {}
        }).subscribe(() => {});

        subject.next(2);
        expect(listener).to.have.been.calledWithMatch({ upstream: 2 });

        subject.next(3);
        expect(listener).to.have.been.calledWithMatch({ upstream: 3 });
      }
    );

    it('should call the transform function with each sideloaded value',
      () => {
        subject._reactiveMap({
          transform: ({ upstream, sideloaded }) => upstream + sideloaded,
          inputs: {
            sideloaded: argSubject,
          },
        }).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(42);

        argSubject.next(3);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(43);
      }
    );

    it('should call the transform function when any stream emits a new value',
      () => {
        subject._reactiveMap({
          transform: ({ upstream, sideloaded }) => upstream + sideloaded,
          inputs: {
            sideloaded: argSubject,
          },
        }).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(42);

        subject.next(10);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(12);

        argSubject.next(3);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith(13);
      }
    );

    it('should respect onlyEmitWithUpstream',
      () => {
        subject._reactiveMap({
          transform: ({ upstream, sideloaded }) => upstream + sideloaded,
          inputs: {
            sideloaded: argSubject,
          },
          onlyEmitWithUpstream: true,
        }).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(42);

        subject.next(10);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(12);

        argSubject.next(3);
        expect(listener).to.have.been.calledTwice;
      }
    );

    it('should not loop infinitely when onlyEmitWithUpstream prevents a cycle',
      () => {
        const sumSubject = new MotionSubject();
        sumSubject.next(0);

        const stream = subject._reactiveMap({
          transform: ({ upstream, sideloaded, sum }) => upstream + sideloaded + sum,
          inputs: {
            sideloaded: argSubject,
            sum: sumSubject,
          },
          onlyEmitWithUpstream: true,
        })._multicast();
        stream.subscribe(sumSubject);
        stream.subscribe(listener);

        subject.next(40);
        argSubject.next(10);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(50);

        subject.next(5);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(65);
      }
    );

    it('should passthrough constants',
      () => {
        subject._reactiveMap({
          transform: ({ upstream, constant, sideloaded }) => upstream + constant + sideloaded,
          inputs: {
            constant: 100,
            sideloaded: argSubject,
          },
        }).subscribe(listener);

        subject.next(40);
        argSubject.next(2);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(142);

        subject.next(10);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(112);

        argSubject.next(3);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith(113);
      }
    );
  }
);

