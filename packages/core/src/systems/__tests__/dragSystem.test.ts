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

import {
  MotionObservable,
} from '../../observables/';

import {
  createProperty,
} from '../../properties/';

import {
  dragSystem,
} from '../';

describe('dragSystem',
  () => {
    let drag$;
    let state;
    let recognitionThreshold;
    let downObserver;
    let moveObserver;
    let upObserver;
    let listener;

    beforeEach(
      () => {
        state = createProperty();
        recognitionThreshold = createProperty({ initialValue: 16 });
        downObserver = createMockObserver();
        moveObserver = createMockObserver();
        upObserver = createMockObserver();
        listener = stub();

        drag$ = dragSystem({
          down$: new MotionObservable(downObserver.connect),
          move$: new MotionObservable(moveObserver.connect),
          up$: new MotionObservable(upObserver.connect),
          recognitionThreshold: recognitionThreshold,
          state: state,
        });
        drag$.subscribe(listener);
      }
    );

    it('should not repeat the same value for move and up',
      () => {
        downObserver.next({
          type: 'pointerdown',
          pageX: 0,
          pageY: 0,
        });

        moveObserver.next({
          type: 'pointermove',
          pageX: 10,
          pageY: 20,
        });

        upObserver.next({
          type: 'pointerup',
          pageX: 10,
          pageY: 20,
        });

        expect(listener).to.have.been.calledOnce.and.to.have.been.calledWith({
          x: 10,
          y: 20,
        });
      }
    );
    it('should set state to BEGAN when the recognitionThreshold is crossed');
    it('should set state to CHANGED on the move after BEGAN');
    it('should set state to ENDED on up, if recognized');
    it('should set state to POSSIBLE after ENDED');
  }
);
