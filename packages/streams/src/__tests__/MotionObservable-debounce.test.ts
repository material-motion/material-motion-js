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

import MotionObservable from '../MotionObservable';

export function waitOneFrame() {
  return new Promise(
    resolve => requestAnimationFrame(resolve)
  );
}

describe('MotionObservable._debounce',
  () => {
    let stream;
    let mockObserver;
    let listener1;

    beforeEach(
      () => {
        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);
        listener1 = stub();
      }
    );

    it('should send the most recent value to the observer at the beginning of each frame',
      () => {
        stream._debounce().subscribe(listener1);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);

        return waitOneFrame().then(
          () => {
            expect(listener1).to.have.been.calledOnce;
            expect(listener1).to.have.been.calledWith(3);
          }
        );
      }
    );

    it('should dispatch exactly once per frame',
      () => {
        stream._debounce().subscribe(listener1);

        mockObserver.next(1);
        mockObserver.next(2);
        mockObserver.next(3);

        return waitOneFrame().then(
          () => {
            mockObserver.next(4);
            mockObserver.next(5);
            mockObserver.next(6);

            return waitOneFrame();
          }
        ).then(
          () => {
            expect(listener1).to.have.been.calledTwice;
            expect(listener1).to.have.been.calledWith(6);
          }
        );
      }
    );
  }
);

