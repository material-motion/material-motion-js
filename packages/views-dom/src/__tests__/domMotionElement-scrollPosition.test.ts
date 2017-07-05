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
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha-sugar-free';

import {
  stub,
} from 'sinon';

import createMotionElementFromDOMNode from '../createMotionElementFromDOMNode';

describe('domMotionElement.scrollPosition',
  () => {
    let outerDOMNode;
    let innerDOMNode;
    let motionElement;

    function setUp() {
      outerDOMNode = document.createElement('div');
      innerDOMNode = document.createElement('div');
      outerDOMNode.style.width = '100px';
      outerDOMNode.style.height = '100px';
      outerDOMNode.style.overflow = 'scroll';
      innerDOMNode.style.width = '300px';
      innerDOMNode.style.height = '300px';
      outerDOMNode.appendChild(innerDOMNode);
      document.body.appendChild(outerDOMNode);

      motionElement = createMotionElementFromDOMNode(outerDOMNode);
    }

    function tearDown() {
      outerDOMNode.removeChild(innerDOMNode);
      document.body.removeChild(outerDOMNode);
    }


    describe('read',
      () => {
        beforeEach(setUp);
        afterEach(tearDown);

        it('should return the current scrollPosition as a Point2D.',
          () => {
            outerDOMNode.scrollLeft = 100;
            outerDOMNode.scrollTop = 50;

            expect(motionElement.scrollPosition.read()).to.deep.equal({ x: 100, y: 50 });
          }
        );
      }
    );


    describe('write',
      () => {
        beforeEach(setUp);
        afterEach(tearDown);

        beforeEach(
          () => {
            outerDOMNode.scrollLeft = 4;
            outerDOMNode.scrollTop = 2;
          }
        );

        it('should set scrollTop and scrollLeft from a Point2D.',
          () => {
            motionElement.scrollPosition.write({ x: 10, y: 15 });

            expect(outerDOMNode.scrollLeft).to.equal(10);
            expect(outerDOMNode.scrollTop).to.equal(15);
          }
        );

        it('should not ignore 0 values.',
          () => {
            motionElement.scrollPosition.write({ x: 0, y: 0 });

            expect(outerDOMNode.scrollLeft).to.equal(0);
            expect(outerDOMNode.scrollTop).to.equal(0);
          }
        );

        it('should not touch scrollTop without a y argument.',
          () => {
            motionElement.scrollPosition.write({ x: 40 });

            expect(outerDOMNode.scrollLeft).to.equal(40);
            expect(outerDOMNode.scrollTop).to.equal(2);
          }
        );

        it('should not touch scrollLeft without an x argument.',
          () => {
            motionElement.scrollPosition.write({ y: 42 });

            expect(outerDOMNode.scrollLeft).to.equal(4);
            expect(outerDOMNode.scrollTop).to.equal(42);
          }
        );
      }
    );
  }
);
