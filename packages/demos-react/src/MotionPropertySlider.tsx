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
  MotionProperty,
} from 'material-motion';

import {
  AttachStreams,
} from './AttachStreams';

import {
  Col,
  Row,
} from 'jsxstyle';

export type MotionPropertySliderProps = {
  property: MotionProperty<number>,
  label: string,
  min: number,
  max: number,
};
export class MotionPropertySlider extends React.PureComponent<MotionPropertySliderProps, {}> {
  attachToSlider = (element: HTMLInputElement) => {
    if (element) {
      element.value = this.props.property.read();

      this.props.property.subscribe(
        (value) => element.value = value
      );
    }
  }

  onChange = (event: Event) => {
    this.props.property.write(parseInt((event.target as HTMLInputElement).value));
  }

  render() {
    const {
      label,
      property,
      min = 0,
      max = 1000
    } = this.props;

    if (!property) {
      return ''
    }

    return (
      <label
        style = {
          {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            marginBottom: 24,
          }
        }
      >
          <Row
            justifyContent = 'space-between'
          >
            { label }

            <AttachStreams
              textContent = { property }
            />
          </Row>

          <Row
            justifyContent = 'space-between'
            marginTop = { 8 }
            marginBottom = { 24 }
          >
            <IncrementMotionProperty
              increment = { -10 }
              property = { property }
            />
            <IncrementMotionProperty
              increment = { -1 }
              property = { property }
            />
            <IncrementMotionProperty
              increment = { +1 }
              property = { property }
            />
            <IncrementMotionProperty
              increment = { +10 }
              property = { property }
            />
          </Row>

          <input
            type = 'range'
            min = { min }
            max = { max }
            ref = { this.attachToSlider }
            onChange = { this.onChange }
          />
      </label>
    );
  }
}

export type IncrementMotionPropertyProps = {
  property: MotionProperty<number>,
  increment: number,
};
function IncrementMotionProperty({ property, increment }: IncrementMotionPropertyProps) {
  const sign = increment < 0
    ? '' // negative numbers include their sign when cast to strings.
    : '+';

  return (
    <button
      style = {
        {
          minWidth: 48,
          minHeight: 48,
          border: '1px solid #DEDEDE',
          borderRadius: 2,
        }
      }
      onClick = {
        () => {
          property.write(
            property.read() + increment
          )
        }
      }
    >
      { sign }{ increment }
    </button>
  );
}
