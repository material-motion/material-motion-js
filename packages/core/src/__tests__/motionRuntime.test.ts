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
  MotionObservable,
  MotionRuntime,
} from '../';

import {
  createMockObserver,
} from 'material-motion-testing-utils';

describe('motionRuntime',
  () => {
    let runtime;
    let stream;
    let mockObserver;
    let mockProperty;

    beforeEach(
      () => {
        runtime = new MotionRuntime();

        mockObserver = createMockObserver();
        stream = new MotionObservable(mockObserver.connect);

        mockProperty = {
          write: stub(),
        };
      }
    );

    it(`should write values from the stream's next to the given property`,
      () => {
        runtime.write({
          stream,
          to: mockProperty,
        });

        mockObserver.next(1);
        expect(mockProperty.write).to.have.been.calledWith(1);

        mockObserver.next(2);
        expect(mockProperty.write).to.have.been.calledWith(2);
      }
    );
  }
);
