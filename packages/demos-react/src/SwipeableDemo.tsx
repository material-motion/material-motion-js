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

import { create as createJSS, StyleSheet } from 'jss';
import createDefaultJSSPreset from 'jss-preset-default';

import {
  Block,
  Row,
} from 'jsxstyle';

import {
  Axis,
  Direction,
  Draggable,
  MemorylessMotionSubject,
  MotionProperty,
  Point2DSpring,
  ObservableWithMotionOperators,
  PointerEventStreams,
  Swipeable,
  Tossable,
  combineStyleStreams,
  createProperty,
  getPointerEventStreamsFromElement,
  subscribe,
  viewportDimensions$,
} from 'material-motion';

const jss = createJSS(createDefaultJSSPreset());

export function SwipeableDemo() {
  const width$ = viewportDimensions$.pluck('width');

  return (
    <ul
      style = {
        {
          listStyle: 'none',
          padding: 0,
          margin: 0,
          backgroundColor: '#CCCCCC',
        }
      }
    >
      {
        Array(20).fill('').map(
          (_, i) => (
            <SwipeableCard
              key = { i }
              width$ = { width$ }
            />
          )
        )
      }
    </ul>
  );
}
export default SwipeableDemo;

class SwipeableCard extends React.Component<{}, {}> {
  containerStyle$ = createProperty({ initialValue: {} });
  iconStyle$ = createProperty({ initialValue: {} });
  backgroundStyle$ = createProperty({ initialValue: {} });
  foregroundStyle$ = createProperty({ initialValue: {} });

  styleSheet = jss.createStyleSheet(
    {
      container: this.containerStyle$,
      icon: this.iconStyle$,
      background: this.backgroundStyle$,
      foreground: this.foregroundStyle$,
    },
    {
      link: true,
    },
  ).attach();

  setupInteractions = (element: HTMLLIElement) => {
    if (element) {
      const {
        width$,
      } = this.props;

      const pointerStreams = getPointerEventStreamsFromElement(element);
      const draggable = new Draggable(pointerStreams);
      draggable.axis = Axis.X;
      const spring = new Point2DSpring();
      const tossable = new Tossable({
        draggable,
        spring,
      });
      const swipeable = new Swipeable({ tossable, width$ });

      subscribe({
        source: combineStyleStreams({
          display: 'flex',
          flexDirection: swipeable.direction$.rewrite({
            mapping: {
              [Direction.LEFT]: 'row-reverse',
              [Direction.RIGHT]: 'row',
            },
          }),
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }),
        sink: this.containerStyle$
      });

      subscribe({
        source: combineStyleStreams({
          filter: 'invert()',
          scale: swipeable.styleStreamsByTargetName.icon.scale$,
          willChange: swipeable.styleStreamsByTargetName.icon.willChange$,
        }),
        sink: this.iconStyle$,
      });

      subscribe({
        source: combineStyleStreams(swipeable.styleStreamsByTargetName.background),
        sink: this.backgroundStyle$,
      });

      subscribe({
        source: combineStyleStreams({
          ...swipeable.styleStreamsByTargetName.item,
          willChange$: 'transform',
        }),
        sink: this.foregroundStyle$,
      });
    }
  }

  render() {
    const {
      classes,
    } = this.styleSheet;

    return (
      <li
        className = { classes.container }
      >
        <Row
          position = 'absolute'
          width = { 48 }
          height = '100%'
          justifyContent = 'center'
          alignItems = 'center'
        >
          <Block
            className = { classes.background }
            position = 'absolute'
            width = '200vw'
            height = '200vw'
            borderRadius = '100vw'
            backgroundColor = '#F44336'
          />

          <img
            className = { classes.icon }
            src = 'https://www.gstatic.com/images/icons/material/system/svg/delete_48px.svg'
            width = { 24 }
            height = { 24 }
          />
        </Row>

        <Block
          className = { classes.foreground }
          width = '100vw'
          height = { 72 }
          backgroundColor = '#FFFFFF'
          border = '.5px solid #E0E0E0'
          touchAction = 'none'
          position = 'relative'
          props = {
            {
              ref: this.setupInteractions,
            }
          }
        />
      </li>
    );
  }
}
