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
  ObservableWithMotionOperators,
  PointerEventStreams,
  Tossable,
  createProperty,
} from 'material-motion';

import {
  NumericReboundSpring,
} from 'material-motion-springs-rebound';

import {
  NumericWobbleSpring,
} from 'material-motion-springs-wobble';

import {
  getPointerEventStreamsFromElement,
} from 'material-motion-views-dom';

import {
  MotionPropertySlider,
} from './MotionPropertySlider';

import {
  AttachStreams,
  TransformTarget,
} from 'material-motion-views-react';

export class SpringComparison extends React.Component {
  tension$ = createProperty({ initialValue: 230 });
  friction$ = createProperty({ initialValue: 22 });
  stiffness$ = createProperty({ initialValue: 342 });
  damping$ = createProperty({ initialValue: 30 });

  reboundLocation$ = createProperty({ initialValue: { x: 0, y: 0 }});
  wobbleLocation$ = createProperty({ initialValue: { x: 0, y: 0 }});

  lastReboundVelocity$ = createProperty({ initialValue: { x: 0, y: 0 }});
  lastWobbleVelocity$ = createProperty({ initialValue: { x: 0, y: 0 }});

  lastReboundVelocityString$ = this.lastReboundVelocity$.pluck('x')._map(
    (value: number) => value.toFixed(4)
  );
  lastWobbleVelocityString$ = this.lastWobbleVelocity$.pluck('x')._map(
    (value: number) => value.toFixed(4)
  );

  reboundClick$ = new MemorylessMotionSubject();
  wobbleClick$ = new MemorylessMotionSubject();

  reboundPointerStreams: PointerEventStreams;
  wobblePointerStreams: PointerEventStreams;

  attachToReboundElement = (element: HTMLElement) => {
    if (element) {
      this.reboundPointerStreams = getPointerEventStreamsFromElement(element);

      if (this.wobblePointerStreams) {
        this.setupInteractions();
      }
    }
  }

  attachToWobbleElement = (element: HTMLElement) => {
    if (element) {
      this.wobblePointerStreams = getPointerEventStreamsFromElement(element);

      if (this.reboundPointerStreams) {
        this.setupInteractions();
      }
    }
  }

  setupInteractions() {
    const reboundDraggable = new Draggable(this.reboundPointerStreams);
    reboundDraggable.axis = Axis.X;

    const reboundSpring = new NumericReboundSpring();
    this.tension$.subscribe(reboundSpring.tension$);
    this.friction$.subscribe(reboundSpring.friction$);

    const reboundTossable = new Tossable({
      draggable: reboundDraggable,
      spring: reboundSpring,
      location$: this.reboundLocation$,
    });
    reboundTossable.value$.log('reboundLocation:').subscribe(this.reboundLocation$);
    reboundTossable.velocity$.subscribe(this.lastReboundVelocity$);

    this.reboundClick$.rewriteTo(-100).subscribe(reboundSpring.initialValue$);
    this.reboundClick$.rewriteTo(0).subscribe(reboundSpring.destination$);
    this.reboundClick$.rewriteTo(0).subscribe(reboundSpring.initialVelocity$);

    const wobbleDraggable = new Draggable(this.wobblePointerStreams);
    wobbleDraggable.axis = Axis.X;

    const wobbleSpring = new NumericWobbleSpring();
    this.stiffness$.subscribe(wobbleSpring.tension$);
    this.damping$.subscribe(wobbleSpring.friction$);

    const wobbleTossable = new Tossable({
      draggable: wobbleDraggable,
      spring: wobbleSpring,
      location$: this.wobbleLocation$,
    });
    wobbleTossable.value$.log('wobbleLocation:').subscribe(this.wobbleLocation$);
    wobbleTossable.velocity$.subscribe(this.lastWobbleVelocity$);

    this.wobbleClick$.rewriteTo(-100).subscribe(wobbleSpring.initialValue$);
    this.wobbleClick$.rewriteTo(0).subscribe(wobbleSpring.destination$);
    this.wobbleClick$.rewriteTo(0).subscribe(wobbleSpring.initialVelocity$);
  }

  render() {
    return (
      <div
        style = {
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'center',
            padding: 16,
          }
        }
      >
        <table
          style = {
            {
              width: '100vw',
            }
          }
        >
          <tr>
            <td>
              Last recorded <a href = 'https://github.com/facebook/rebound-js/'>Rebound</a> velocity
            </td>
            <AttachStreams
              textContent = { this.lastReboundVelocityString$ }
            >
              <td />
            </AttachStreams>
          </tr>

          <tr>
            <td>
              Last recorded <a href = 'https://github.com/skevy/wobble/'>Wobble</a> velocity
            </td>
            <AttachStreams
              textContent = { this.lastWobbleVelocityString$ }
            >
              <td />
            </AttachStreams>
          </tr>
        </table>

        <div
          style = {
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }
          }
        >
          <AttachStreams
            domRef = { this.attachToReboundElement }
            translate = { this.reboundLocation$ }
            onClick = { this.reboundClick$ }
          >
            <Ball
              backgroundColor = '#7BAAF7'
            >
              R
            </Ball>
          </AttachStreams>

          <AttachStreams
            domRef = { this.attachToWobbleElement }
            translate = { this.wobbleLocation$ }
            onClick = { this.wobbleClick$ }
          >
            <Ball
              backgroundColor = '#AED581'
            >
              W
            </Ball>
          </AttachStreams>
        </div>

        <div>
          <MotionPropertySlider
            label = 'Rebound tension'
            property = { this.tension$ }
          />
          <MotionPropertySlider
            label = 'Rebound friction'
            property = { this.friction$ }
          />
          <MotionPropertySlider
            label = 'Wobble stiffness'
            property = { this.stiffness$ }
          />
          <MotionPropertySlider
            label = 'Wobble damping'
            property = { this.damping$ }
          />
        </div>
      </div>
    );
  }
}
export default SpringComparison;

function Ball(props = {}) {
  return (
    <TransformTarget
      display = 'flex'
      touchAction = 'none'
      justifyContent = 'center'
      alignItems = 'center'
      textAlign = 'center'
      cursor = 'pointer'
      width = { 200 }
      height = { 200 }
      borderRadius = { 100 }
      marginTop = { 16 }
      marginBottom = { 16 }
      fontSize = { 72 }
      color = 'white'
      { ...props }
    />
  );
}
