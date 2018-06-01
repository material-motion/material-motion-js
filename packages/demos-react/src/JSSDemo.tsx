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

import { default as jss, StyleSheet } from 'jss';

import {
  MaybeReactive,
  NumericDict,
  ObservableWithMotionOperators,
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

export class JSSDemo extends React.Component<{}, {}> {
  foregroundStyle$ = createProperty({ initialValue: {} });
  backgroundStyle$ = createProperty({ initialValue: {} });

  styleSheet = jss.createStyleSheet(
    {
      container: {
        touchAction: 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#F7DF1E',
      },
      foreground: this.foregroundStyle$,
      background: this.backgroundStyle$,
    },
    {
      link: true,
    }
  ).attach();

  attachToContainer = (element: HTMLElement) => {
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
      source: combineStyleStreams({
        translate$: centeredMove$.multipliedBy({ x: 1.125, y: 0.25 }),
      }),
      sink: this.backgroundStyle$,
    });

    subscribe({
      source: combineStyleStreams({
        translate$: centeredMove$.multipliedBy({ x: .75, y: 0.11 }),
      }),
      sink: this.foregroundStyle$,
    });
  }

  render() {
    const {
      classes,
    } = this.styleSheet;

    return (
      <div
        className = { classes.container }
        ref = { this.attachToContainer }
      >
        <RandomLogos
          className = { classes.foreground }
          scale = { 3 }
        />

        <RandomLogos
          className = { classes.background }
          scale = { 5 }
        />
      </div>
    );
  }
}
export default JSSDemo;

// Since JSS uses `<style>` elements, it doesn't force its children to rerender
// on each frame.  That allows this otherwise-expensive component to be
// functional, since it will never be re-rendered.
function RandomLogos({ scale, ...propsPassthrough }) {
  return (
    <div
      style = {
        {
          position: 'relative',
        }
      }
      { ...propsPassthrough }
    >
      {
        new Array(100).fill().map(
          (_, i) => (
            <div
              key = { i }
              style = {
                {
                  position: 'absolute',
                  color: '#222222',
                  fontWeight: 'bold',
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
              JSS
            </div>
          )
        )
      }
    </div>
  );
}
