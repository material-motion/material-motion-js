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
  createMotionElementFromDOMNode,
} from '../DOMMotionElement';

declare function require(name: string);

// chai really doesn't like being imported as an ES2015 module; will be fixed in v4
require('chai').use(
  require('sinon-chai')
);

describe('DOMMotionElement',
  () => {
    let domNode;
    let motionElement;
    let listener;

    beforeEach(
      () => {
        domNode = document.createElement('div');
        motionElement = createMotionElementFromDOMNode(domNode);
        listener = stub();
      }
    );

    it('should forward events when subscribed to. ',
      () => {
        motionElement.getEvent$('click').subscribe(listener);

        domNode.click();

        expect(listener).to.have.been.calledOnce;
      }
    );

    it('should stop forwarding events when unsubscribed from.',
      () => {
        const { unsubscribe } = motionElement.getEvent$('click').subscribe(listener);

        domNode.click();
        domNode.click();
        unsubscribe();
        domNode.click();

        expect(listener).to.have.been.calledTwice;
      }
    );
  }
);

