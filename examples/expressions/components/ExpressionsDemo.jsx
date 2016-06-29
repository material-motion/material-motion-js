/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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
 *
 *  @flow
 */

/*  Visualization ideas:
 *  - Tap to move to your finger's location
 *  - <input> tags to pass arbitrary parameters into <input /> tags that feed
 *    expressions.
 *  - Radio groups for each {move, rotate, scale, fade}, each in its own tab.
 *  - Similar to radio groups, but the user can swipe between items to select
 */

import React from 'react';

import {
  move,
  scale,
  rotate,
  fade,
  scaleIn,
  scaleOut,
  fadeIn,
  fadeOut,
} from '../../../src/expressions/tween';

import {
  MaterialMotionEasing,
} from '../../../src/easing';

import {
  TweenPerformerWeb,
} from '../../../src/performers';

const circleRadius = 100;
const circleDiameter = circleRadius * 2;
const shadowForElevation = {
  [0]: '',
  [1]: `
    rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
    rgba(0, 0, 0, 0.137255) 0px 1px 1px 0px,
    rgba(0, 0, 0, 0.117647) 0px 1px 3px 0px
  `,
};

export default React.createClass(
  {
    webComponentsRef: null,

    getInitialState() {
      return {
        testIndex: 0,
        tests: [
          move().from({x: -200}).to({x: 105}).with(
            MaterialMotionEasing.EASE_OUT
          ),
          move().from({x: 116}).by({x: -316}).with(
            MaterialMotionEasing.EASE_IN
          ),
          move().to({x: 0, y: 0}).by({x: 16, y: 216}).with(
            MaterialMotionEasing.EASE_OUT
          ),
          rotate().from(0).to(90),
          rotate().from(90).by(-45),
          rotate().by(45).to(90),
          scaleIn(),
          scaleOut(),
          scale().from(1).by(2),
          fadeIn(),
          fadeOut(),
          fade().from(1).by(-.5),
        ],
        buttonIsDown: false,
      };
    },

    render() {
      const {
        tests,
        buttonIsDown,
      } = this.state;

      return (
        <div
            style = {
              {
                margin: 16,
              }
            }
        >
          <div
            style = {
              {
                flexDirection: 'row',
              }
            }
          >
            <div
              ref = {
                (ref) => this.webComponentsRef = ref
              }
              style = {
                {
                  backgroundColor: '#673AB7',
                  boxShadow: shadowForElevation[1],
                  color: '#FFFFFF',
                  width: circleRadius,
                  height: circleDiameter,
                  borderTopLeftRadius: circleRadius,
                  borderBottomLeftRadius: circleRadius,
                  justifyContent: 'center',
                  padding: 16,
                  textAlign: 'center',
                }
              }
            >
              Controlled by Web Animations
            </div>
            <div
              style = {
                {
                  backgroundColor: '#64FFDA',
                  boxShadow: shadowForElevation[1],
                  width: circleRadius,
                  height: circleDiameter,
                  borderTopRightRadius: circleRadius,
                  borderBottomRightRadius: circleRadius,
                  justifyContent: 'center',
                  padding: 16,
                  textAlign: 'center',
                }
              }
            >
              Controlled by React
            </div>
          </div>

          <div
            style = {
              {
                position: 'fixed',
                bottom: 16,
              }
            }
          >
            <select
              value = { this.state.testIndex }
              onChange = { this.onSelectChange }
              style = {
                {
                  height: 56,
                  fontSize: 16,
                  marginBottom: 16,
                  maxWidth: 'calc(100vw - 32px)',
                }
              }
            >
              {
                tests.map(
                  (test, i) => (
                    <option
                      key = { i }
                      value = { i }
                    >
                      { test.toString() }
                    </option>
                  )
                )
              }
            </select>
            <button
              style = {
                {
                  backgroundColor: '#FF5722',
                  color: '#FFFFFF',
                  boxShadow: shadowForElevation[
                    buttonIsDown
                      ? 0
                      : 1
                  ],
                  width: 200,
                  height: 56,
                  alignSelf: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  outline: 'none',
                }
              }

              onClick = { this.onButtonTap }
              onMouseDown = { this.onButtonPress }
              onMouseUp = { this.onButtonRelease }
              onMouseOut = { this.onButtonLeave }
            >
              Animate!
            </button>
          </div>
        </div>
      );
    },

    startWebAnimation() {
      const {
        tests,
        testIndex,
      } = this.state;

      const test = tests[testIndex];

      new TweenPerformerWeb(
        this.webComponentsRef,
        test.plan
      );
    },

    onSelectChange(event:Event) {
      this.setState(
        {
          testIndex: ((event.target:HTMLSelectElement).value:number),
        }
      );
    },

    onButtonTap(event:Event) {
      this.startWebAnimation();
    },

    // Quick-and-dirty down state for button
    onButtonPress(event:Event) {
      this.setState(
        {
          buttonIsDown: true,
        }
      );
    },

    onButtonRelease(event:Event) {
      this.setState(
        {
          buttonIsDown: false,
        }
      );
    },

    onButtonLeave(event:Event) {
      this.setState(
        {
          buttonIsDown: false,
        }
      );
    },
  }
);
