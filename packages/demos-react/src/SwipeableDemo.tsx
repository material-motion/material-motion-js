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
  MemorylessMotionSubject,
  MotionProperty,
  NumericSpring,
  ObservableWithMotionOperators,
  PointerEventStreams,
  Swipeable,
  Tossable,
  createProperty,
} from 'material-motion';

import {
  getPointerEventStreamsFromElement,
  viewportDimensions$,
} from 'material-motion-views-dom';

import {
  AttachStreams,
  TransformTarget,
} from 'material-motion-views-react';

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
        Array(20).fill(
          <SwipeableCard
            width$ = { width$ }
          />
        )
      }
    </ul>
  );
}
export default SwipeableDemo;

class SwipeableCard extends React.Component<{}, {}> {
  location$ = createProperty({ initialValue: { x: 0, y: 0 }});
  willChange$ = createProperty({ initialValue: '' });

  setupInteractions = (element: HTMLLIElement) => {
    if (element) {
      const {
        width$,
      } = this.props;

      const pointerStreams = getPointerEventStreamsFromElement(element);
      const draggable = new Draggable(pointerStreams);
      draggable.axis = Axis.X;
      const spring = new NumericSpring();
      const tossable = new Tossable({
        draggable,
        spring,
        location$: this.location$,
      });
      const swipeable = new Swipeable({ tossable, width$ });

      swipeable.styleStreamsByTargetName.item.translate$.subscribe(this.location$);
      swipeable.styleStreamsByTargetName.item.willChange$.subscribe(this.willChange$);
    }
  }

  render() {
    return (
      <AttachStreams
        domRef = { this.setupInteractions }
        translate = { this.location$ }
      >
        <TransformTarget
          component = 'li'
          height = { 72 }
          backgroundColor = '#FFFFFF'
          border = '.5px solid #E0E0E0'
          touchAction = 'none'
        />
      </AttachStreams>
    );
  }
}
