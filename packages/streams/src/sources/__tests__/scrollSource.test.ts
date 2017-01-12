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
  useMockedRAF,
} from 'material-motion-testing-utils';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

import MotionObservable from '../../observables/MotionObservable';
import scrollSource from '../scrollSource';

describe('scrollSource',
  useMockedRAF(
    (mockRAF) => {
      let mockMotionElement;
      let listener;

      beforeEach(
        () => {
          mockMotionElement = new MockMotionElement();
          listener = stub();
        }
      );

      it('should return the current scrollPosition as a Point2D.',
        () => {
          const scrollPosition$ = scrollSource(mockMotionElement);
          scrollPosition$.subscribe(listener);

          const expectedScrollPositions = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 20, y: 0 },
          ];

          // scrollSource is debounced, so we must wait a frame between each
          // scroll
          expectedScrollPositions.forEach(
            position => {
              mockMotionElement.scrollTo(position);
              mockRAF.step();
            }
          );

          const results = listener.args.map(
            args => args[0]
          );

          expect(results).to.deep.equal(expectedScrollPositions);
        }
      );
    }
  )
);

class MockMotionElement {
  _lastPosition = {};
  _next = () => {};

  getEvent$() {
    return new MotionObservable(
      observer => {
        this._next = observer.next
      }
    );
  }

  scrollTo(position) {
    this._lastPosition = position;
    this._next();
  }

  scrollPosition = {
    read: () => {
      return this._lastPosition;
    }
  }
}
