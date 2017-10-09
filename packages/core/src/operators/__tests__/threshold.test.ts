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
} from '../../observables/';

import {
  ThresholdRegion,
} from '../../enums';

describe('motionObservable.threshold',
  () => {
    const limit$ = new MemorylessMotionSubject();
    let subject;
    let listener;

    beforeEach(
      () => {
        subject = new MemorylessMotionSubject();
        listener = stub();
      }
    );

    it('should emit BELOW when it receives a value below the limit',
      () => {
        subject.threshold({ limit$: 7 }).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should emit WITHIN when it receives a value that matches the limit',
      () => {
        subject.threshold({ limit$: 7 }).subscribe(listener);

        subject.next(7);

        expect(listener).to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should emit ABOVE when it receives a value above the limit',
      () => {
        subject.threshold({ limit$: 7 }).subscribe(listener);

        subject.next(10);

        expect(listener).to.have.been.calledWith(ThresholdRegion.ABOVE);
      }
    );

    it('should support reactive limits',
      () => {
        subject.threshold({ limit$: limit$ }).subscribe(listener);

        subject.next(10);

        limit$.next(5);
        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.ABOVE);

        limit$.next(15);
        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.BELOW);

        limit$.next(10);
        expect(listener).to.have.been.calledThrice.and.to.have.been.calledWith(ThresholdRegion.WITHIN);
      }
    );

    it('should support reactive limits and onlyEmitWithUpsubject',
      () => {
        subject.threshold({ limit$, onlyEmitWithUpstream: true }).subscribe(listener);

        subject.next(10);

        limit$.next(5);
        limit$.next(15);

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith(ThresholdRegion.ABOVE);

        subject.next(12);

        expect(listener).to.have.been.calledTwice.and.to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );

    it('should have a shorthand signature',
      () => {
        subject.threshold(7).subscribe(listener);

        subject.next(3);

        expect(listener).to.have.been.calledWith(ThresholdRegion.BELOW);
      }
    );
  }
);
