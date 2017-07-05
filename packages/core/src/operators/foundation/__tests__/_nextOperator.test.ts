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
  MotionObservable,
} from '../../../observables/';

describe('motionObservable._nextOperator',
  () => {
    let stream;
    let mockObserver;
    let nextListener;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);

        nextListener = stub();
      }
    );

    it('should apply an operation to the output stream',
      () => {
        const waitAMoment = Promise.resolve();

        const makeValuesAsync = (value, nextChannel) => {
          waitAMoment.then(
            () => {
              nextChannel(value);
            }
          );
        };

        stream._nextOperator(makeValuesAsync).subscribe(nextListener);

        mockObserver.next(1);

        expect(nextListener).not.to.have.been.called;
        return waitAMoment.then(
          () => {
            expect(nextListener).to.have.been.calledWith(1);
          }
        );
      }
    );

    it('should respect bound methods.',
      () => {
        const dictWithListener = {
          listener: nextListener,
        };

        function callOwnListener(value) {
          this.listener(value);
        }

        stream._nextOperator(
          (value, nextChannel) => nextChannel(value)
        ).subscribe({
          next: callOwnListener.bind(dictWithListener)
        });

        mockObserver.next(1);

        expect(nextListener).to.have.been.calledWith(1);
      }
    );
  }
);
