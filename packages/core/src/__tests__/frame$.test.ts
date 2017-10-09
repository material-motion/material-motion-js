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
  after,
  before,
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

import {
  createMockObserver,
  useMockedRAF,
} from 'material-motion-testing-utils';

// has to be imported for `MotionObservable` to be defined in `getFrame$` - see
// comment in `observables/proxies`
import '../observables/MotionObservable';

import {
  getFrame$,
} from '../getFrame$';

describe('frame$',
  useMockedRAF(
    (mockRAF) => {
      let listener;
      let frame$;

      beforeEach(
        () => {
          listener = stub();
          frame$ = getFrame$();
        }
      );

      it('should emit at the beginning of each frame',
        () => {
          frame$.subscribe(listener);

          mockRAF.step();
          expect(listener).to.have.been.calledOnce;

          mockRAF.step();
          expect(listener).to.have.been.calledTwice;
        }
      );

      it('should stop emitting on unsubscription',
        () => {
          const subscription = frame$.subscribe(listener);

          mockRAF.step();
          subscription.unsubscribe();
          mockRAF.step();

          expect(listener).to.have.been.calledOnce;
        }
      );

      it('should not emit if unsubscribed from before a frame occurs',
        () => {
          const subscription = frame$.subscribe(listener);
          subscription.unsubscribe();
          mockRAF.step();

          expect(listener).not.to.have.been.called;
        }
      );
    }
  )
);
