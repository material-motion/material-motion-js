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
  Draggable,
  GestureRecognitionState,
  MotionObservable,
  Subscription,
  dragSystem,
} from 'material-motion';

import {
  getPointerEventStreamsFromElement,
} from 'material-motion-views-dom';

export class QuickiePointerEventTest extends React.Component {
  state = {
    x: 0,
    y: 0,
    state: GestureRecognitionState.POSSIBLE,
    velocity: {
      x: 0,
      y: 0,
    },
  };

  testEvents = (element: Element) => {
    let subscriptions: Array<Subscription> = [];

    if (element) {
      const draggable = new Draggable(
        getPointerEventStreamsFromElement(element)
      );

      const drag$ = draggable.system(draggable);
      const velocity$ = drag$.velocity(
        MotionObservable.from(draggable.state)._filter(
          state => state === GestureRecognitionState.RECOGNIZED
        )
      );

      subscriptions = [
        drag$.subscribe(this.setState.bind(this)),
        velocity$.subscribe(
          (velocity: { x: number, y: number }) => this.setState({ velocity })
        ),
        draggable.state.subscribe(
          (state: GestureRecognitionState) => {
            this.setState({ state });

            if (state === GestureRecognitionState.RECOGNIZED) {
              this.setState({
                x: 0,
                y: 0,
              });
            }
          }
        ),
      ];

    } else {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    }
  }

  render = () => {
    const {
      x,
      y,
      velocity,
      state,
    } = this.state;

    return (
      <div>
        <div
          style = {
            {
              position: 'fixed',
              top: 150,
              left: 50,
              borderRadius: 28,
              width: 56,
              height: 56,
              backgroundColor: 'blue',
              transform: `translate(${ x }px, ${ y }px)`,
              touchAction: 'none',
            }
          }
          ref = { this.testEvents }
        />
        <table
          style = {
            {
              padding: 16,
            }
          }
        >
          <tr>
            <td>
              State
            </td>
            <td>
              { GestureRecognitionState[state] }
            </td>
          </tr>
          <tr>
            <td>
              Last recorded velocity
            </td>
            <td>
              { velocity.x }, { velocity.y }
            </td>
          </tr>
        </table>
      </div>
    );
  }
}
export default QuickiePointerEventTest;
