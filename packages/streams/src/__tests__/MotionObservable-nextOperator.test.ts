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

import {
  MotionObservable,
  State,
} from '../';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

describe('MotionObservable._nextOperator',
  () => {
    let next;
    let state;
    let stream;
    let nextListener;
    let stateListener;
    let disconnect;

    beforeEach(
      () => {
        stream = new MotionObservable(
          observer => {
            next = (value) => {
              observer.next(value);
            }

            state = (value) => {
              observer.state(value);
            }

            return disconnect;
          }
        );

        nextListener = stub();
        stateListener = stub();
        disconnect = stub();
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
        }

        stream._nextOperator(makeValuesAsync).subscribe(nextListener);

        next(1);

        expect(nextListener).not.to.have.been.called;
        return waitAMoment.then(
          () => {
            expect(nextListener).to.have.been.calledWith(1);
          }
        );
      }
    );

    it('should pass through observer.state',
      () => {
        const blackHole = () => {};

        stream._nextOperator(blackHole).subscribe({
          next: nextListener,
          state: stateListener,
        });

        state(State.AT_REST);
        next('hi');
        state(State.ACTIVE);

        expect(stateListener).to.have.been.calledWith(State.AT_REST);
        expect(nextListener).not.to.have.been.called;
        expect(stateListener).to.have.been.calledWith(State.ACTIVE);
      }
    );
  }
);
