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

import * as React from 'react';

import {
  Axis,
  Draggable,
  MotionProperty,
  NumericSpring,
  Point2DSpring,
  ThresholdRegion,
  Tossable,
  combineLatest,
  combineStyleStreams,
  createProperty,
  getPointerEventStreamsFromElement,
  subscribe,
} from 'material-motion';

import {
  AttachStreams,
} from './AttachStreams';

import {
  TransformTarget,
} from './TransformTarget';

// Stolen from mdc-web's CSS
const SHADOW = `
  0px 2px 1px -1px rgba(0, 0, 0, 0.2),
  0px 1px 1px 0px rgba(0, 0, 0, 0.14),
  0px 1px 3px 0px rgba(0, 0, 0, 0.12)
`;

export class TossableDemo extends React.Component<{}, {}> {
  boxStyle$ = createProperty({ initialValue: {} });
  iconStyle$ = createProperty({ initialValue: {} });
  thresholdIndicatorStyle$ = createProperty({ initialValue: {} });
  springIndicatorStyle$ = createProperty({ initialValue: {} });

  boxElement: HTMLElement
  thresholdElement: HTMLElement

  attachInteractions() {
    const boxPointerStreams = getPointerEventStreamsFromElement(this.boxElement);
    const draggable = new Draggable(boxPointerStreams);
    draggable.axis = Axis.Y;
    const boxSpring = new Point2DSpring();

    const boxTossable = new Tossable({ draggable, spring: boxSpring });
    const thresholdCrossedSpring = new NumericSpring();

    const threshold$ = createProperty({ initialValue: 200 });
    const isAboveThreshold$ = boxTossable.draggedLocation$.pluck('y').threshold(threshold$).isAnyOf([ ThresholdRegion.ABOVE ]);

    subscribe({
      sink: boxSpring.ySpring.destination$,
      source: isAboveThreshold$.rewrite({
        mapping: {
          false: 0,
          true: threshold$.multipliedBy(2),
        }
      }),
    });

    subscribe({
      sink: thresholdCrossedSpring.destination$,
      source: isAboveThreshold$.dedupe().rewrite({
        mapping: {
          true: 1,
          false: 0,
        },
      }),
    });

    subscribe({
      sink: this.boxStyle$,
      source: combineStyleStreams(boxTossable.styleStreams),
    });

    subscribe({
      sink: this.iconStyle$,
      source: combineStyleStreams({
        rotate$: thresholdCrossedSpring.value$.multipliedBy(Math.PI),
        transformOrigin$: {
          x: '50%',
          y: '50%',
        },
        willChange$: 'transform',
      }),
    });

    subscribe({
      sink: this.springIndicatorStyle$,
      source: combineStyleStreams({
        translate$: combineLatest({
          x: thresholdCrossedSpring.value$.multipliedBy(200),
          y: 0,
        }),
        willChange$: 'transform',
      }),
    });

    subscribe({
      sink: this.thresholdIndicatorStyle$,
      source: combineStyleStreams({
        translate$: combineLatest({
          x: 0,
          y: threshold$,
        }),
      }),
    });
  }

  attachBoxElement = (element: HTMLElement) => {
    this.boxElement = element;

    if (this.thresholdElement) {
      this.attachInteractions();
    }
  }

  attachThresholdElement = (element: HTMLElement) => {
    this.thresholdElement = element;

    if (this.boxElement) {
      this.attachInteractions();
    }
  }

  render() {
    const {
      boxStyle$,
      iconStyle$,
      thresholdIndicatorStyle$,
      springIndicatorStyle$,
    } = this;

    return (
      <div
        style = {
          {
            minWidth: '100vw',
            minHeight: '100vh',
            backgroundColor: '#202020',
          }
        }
      >
        <div
          style = {
            {
              position: 'relative',
              top: 52,
              left: 52,
            }
          }
        >
          <AttachStreams
            domRef = { this.attachBoxElement }
            style = { boxStyle$ }
          >
            <TransformTarget
              touchAction = 'none'
              userSelect = 'none'
              cursor = 'pointer'
              position = 'absolute'
              zIndex = { 1 }
            >
              <TransformTarget
                position = 'absolute'
                top = { -36 }
                left = { -36 }
                width = { 72 }
                height = { 72 }
                borderRadius = { 2 }
                backgroundColor = '#FD82AB'
                boxShadow = { SHADOW }
                display = 'flex'
                justifyContent = 'center'
                alignItems = 'center'
              >
                <AttachStreams
                  style = { iconStyle$ }
                >
                  <img
                    src = 'https://www.gstatic.com/images/icons/material/system/svg/arrow_upward_48px.svg'
                   />
                </AttachStreams>
              </TransformTarget>
            </TransformTarget>
          </AttachStreams>

          <AttachStreams
            domRef = { this.attachThresholdElement }
            style = { thresholdIndicatorStyle$ }
          >
            <TransformTarget
              // This is a hit area.  The child node draws the line.
              touchAction = 'none'
              userSelect = 'none'
              cursor = 'pointer'
              position = 'absolute'
              paddingTop = { 28 }
              paddingBottom = { 28 }
              top = { -28 }
            >
              <TransformTarget
                position = 'absolute'
                backgroundColor = '#F01896'
                width = '200vw'
                left = '-100vw'
                height = { 2 }
              />

              <div
                style = {
                  {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'absolute',
                    bottom: 10,
                    left: 52,
                  }
                }
              >
                <div
                  style = {
                    {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      width: 200,
                      marginLeft: 18,
                    }
                  }
                >
                  <Label>
                    0
                  </Label>
                  <Label>
                    1
                  </Label>
                </div>

                <AttachStreams
                  style = { springIndicatorStyle$ }
                >
                  <TransformTarget>
                    <TransformTarget
                      backgroundColor = '#00D6D6'
                      width = { 36 }
                      height = { 36 }
                      borderRadius = { 18 }
                      boxShadow = { SHADOW }
                    />
                  </TransformTarget>
                </AttachStreams>
              </div>
            </TransformTarget>
          </AttachStreams>
        </div>
      </div>
    );
  }
}
export default TossableDemo;


function Label({ children }) {
  return (
    <div
      style = {
        {
          fontSize: 16,
          color: '#FFFFFF',
          fontFamily: 'Roboto Mono',
        }
      }
    >
      { children }
    </div>
  );
}
