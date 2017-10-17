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
  MaybeReactive,
  MotionProperty,
  NumericSpring,
  NumericDict,
  ObservableWithMotionOperators,
  Point2DSpring,
  ThresholdRegion,
  Tossable,
  combineLatest,
  createProperty,
  subscribe,
} from 'material-motion';

import {
  combineStyleStreams,
  getPointerEventStreamsFromElement,
  viewportDimensions$,
} from 'material-motion-views-dom';

import {
  AttachStreams,
  TransformTarget,
} from 'material-motion-views-react';

export class ParallaxDemo extends React.Component<{}, {}> {
  foregroundStyle$ = createProperty({ initialValue: {} });
  backgroundStyle$ = createProperty({ initialValue: {} });

  attachInteractions = (element: HTMLElement | null) => {
    if (element) {
      const {
        move$,
      } = getPointerEventStreamsFromElement(element);

      const centeredMove$ = move$.subtractedBy(
        combineLatest<NumericDict, MaybeReactive<NumericDict>>({
          x: viewportDimensions$.pluck('width').dividedBy(2),
          y: viewportDimensions$.pluck('height').dividedBy(2),
        })
      );

      subscribe({
        sink: this.backgroundStyle$,
        source: combineStyleStreams({
          translate$: centeredMove$.multipliedBy({ x: .75, y: 0.11 }),
          willChange$: 'transform',
        }),
      });

      subscribe({
        sink: this.foregroundStyle$,
        source: combineStyleStreams({
          translate$: centeredMove$.multipliedBy({ x: 1.125, y: 0.25 }),
          willChange$: 'transform',
        }),
      });
    }
  }

  render() {
    const {
      backgroundStyle$,
      foregroundStyle$,
    } = this;

    return (
      <div
        ref = { this.attachInteractions }
        style = {
          {
            touchAction: 'none',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'linear-gradient(#3367D6, #4285F4)',
          }
        }
      >
        <AttachStreams
          style = { backgroundStyle$ }
        >
          <TransformTarget>
            <RandomClouds
              scale = { 3 }
            />
          </TransformTarget>
        </AttachStreams>

        <AttachStreams
          style = { foregroundStyle$ }
        >
          <TransformTarget>
            <RandomClouds
              scale = { 5 }
            />
          </TransformTarget>
        </AttachStreams>
      </div>
    );
  }
}
export default ParallaxDemo;

class RandomClouds extends React.Component<{ scale: number }, {}> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {
      scale,
    } = this.props;

    return (
      <div
        style = {
          {
            position: 'relative',
          }
        }
      >
        {
          new Array(100).fill().map(
            (_, i) => (
              <div
                key = { i }
                className = 'material-icons'
                style = {
                  {
                    position: 'absolute',
                    color: '#E9E9E9',
                    transform: `
                      translate(
                        ${ Math.round(Math.random() * 500 - 200) / 2 }vw,
                        ${ Math.round(Math.random() * 200) / 2 }vh
                      )

                      scale(${ scale })
                    `,
                    userSelect: 'none',
                  }
                }
              >
                cloud
              </div>
            )
          )
        }
      </div>
    );
  }
}
