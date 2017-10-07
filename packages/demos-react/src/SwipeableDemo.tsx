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
  Direction,
  Draggable,
  MemorylessMotionSubject,
  MotionProperty,
  Point2DSpring,
  ObservableWithMotionOperators,
  PointerEventStreams,
  Swipeable,
  Tossable,
  createProperty,
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

export function SwipeableDemo() {
  const width$ = viewportDimensions$.pluck({ path: 'width' });

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
  translate$ = createProperty({ initialValue: { x: 0, y: 0 }});
  translateWillChange$ = createProperty({ initialValue: '' });
  iconStyle$ = createProperty({ initialValue: {} });
  backgroundScale$ = createProperty({ initialValue: 0 });
  backgroundScaleWillChange$ = createProperty({ initialValue: '' });

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

      swipeable.styleStreamsByTargetName.item.translate$.subscribe(this.translate$);
      swipeable.styleStreamsByTargetName.item.willChange$.subscribe(this.translateWillChange$);
      swipeable.styleStreamsByTargetName.background.scale$.subscribe(this.backgroundScale$);
      swipeable.styleStreamsByTargetName.background.willChange$.subscribe(this.backgroundScaleWillChange$);

      combineStyleStreams({
        display: 'flex',
        flexDirection: swipeable.direction$.rewrite({
          [Direction.LEFT]: 'row-reverse',
          [Direction.RIGHT]: 'row',
        }),
        position: 'relative',
        overflow: 'hidden',
      }).subscribe(this.containerStyle$);

      combineStyleStreams({
        filter: 'invert()',
        scale: swipeable.styleStreamsByTargetName.icon.scale$.startWith(0),
        willChange: swipeable.styleStreamsByTargetName.icon.willChange$,
      }).subscribe(this.iconStyle$);
    }
  }

  render() {
    return (
      <AttachStreams
        style = { this.containerStyle$ }
      >
        <li>
          <div
            style = {
              {
                position: 'absolute',
                display: 'flex',
                flexDirection: 'row',
                width: 48,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }
            }
          >
            <AttachStreams
              scale = { this.backgroundScale$ }
              willChange = { this.backgroundScaleWillChange$ }
            >
              <TransformTarget
                position = 'absolute'
                width = '200vw'
                height = '200vw'
                borderRadius = '100vw'
                backgroundColor = '#F44336'
              />
            </AttachStreams>

            <AttachStreams
              style = { this.iconStyle$ }
            >
              <img
                src = 'https://www.gstatic.com/images/icons/material/system/svg/delete_48px.svg'
                width = { 24 }
                height = { 24 }
              />
            </AttachStreams>
          </div>

          <AttachStreams
            domRef = { this.setupInteractions }
            translate = { this.translate$ }
            willChange = { this.translateWillChange$ }
          >
            <TransformTarget
              width = '100vw'
              height = { 72 }
              backgroundColor = '#FFFFFF'
              border = '.5px solid #E0E0E0'
              touchAction = 'none'
              position = 'relative'
            />
          </AttachStreams>
        </li>
      </AttachStreams>
    );
  }
}
