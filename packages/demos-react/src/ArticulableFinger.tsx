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
  ObservableWithMotionOperators,
  createProperty,
  combineLatest,
} from 'material-motion';

import {
  SliderProperties,
} from 'material-motion-views-dom';

import {
  AttachStreams,
  TransformTarget,
} from 'material-motion-views-react';

export class ArticulableFinger extends React.Component<{}, {}> {
  progress$ = createProperty({ initialValue: 0 });

  firstBoneLength$ = createProperty({ initialValue: 240 });
  secondBoneLength$ = createProperty({ initialValue: 164 });

  firstBoneProgressStart$ = createProperty({ initialValue: .162 });
  firstBoneProgressEnd$ = createProperty({ initialValue: .785 });
  firstBoneRotationStart$ = createProperty({ initialValue: 3 });
  firstBoneRotationEnd$ = createProperty({ initialValue: 3.3 });
  firstBoneRotation$ = this.progress$.rewriteRange({
    fromStart$: this.firstBoneProgressStart$,
    fromEnd$: this.firstBoneProgressEnd$,
    toStart$: this.firstBoneRotationStart$,
    toEnd$: this.firstBoneRotationEnd$,
    shouldClamp$: true,
  });
  secondBoneProgressStart$ = createProperty({ initialValue: 0 });
  secondBoneProgressEnd$ = createProperty({ initialValue: 1 });
  secondBoneRotationStart$ = createProperty({ initialValue: 5.45 });
  secondBoneRotationEnd$ = createProperty({ initialValue: 6.88 });
  secondBoneRotation$ = this.progress$.rewriteRange({
    fromStart$: this.secondBoneProgressStart$,
    fromEnd$: this.secondBoneProgressEnd$,
    toStart$: this.secondBoneRotationStart$,
    toEnd$: this.secondBoneRotationEnd$,
    shouldClamp$: true,
  });

  boneGirth$ = createProperty({ initialValue: 32 });
  boneRadius$ = this.boneGirth$.dividedBy(2);
  secondBoneLeft$ = this.firstBoneLength$.subtractedBy(this.boneGirth$);

  jointSize$ = createProperty({ initialValue: 56 });
  jointRadius$ = this.jointSize$.dividedBy(2);
  jointTop$ = this.boneGirth$.subtractedBy(this.jointSize$).dividedBy(2);
  jointLeft$ = this.firstBoneLength$.subtractedBy(this.jointRadius$).subtractedBy(this.boneRadius$);

  totalBoneLength$ = this.firstBoneLength$.addedBy(this.secondBoneLength$).subtractedBy(this.boneRadius$);

  boneOrigin$ = combineLatest({
    x: this.boneRadius$,
    y: this.boneRadius$,
  });


  render() {
    const {
      firstBoneLength$,
      secondBoneLength$,
      jointRadius$,
      jointSize$,
      jointTop$,
      jointLeft$,
      boneGirth$,
      boneOrigin$,
      secondBoneLeft$,
      firstBoneRotation$,
      secondBoneRotation$,
      progress$,
      firstBoneRotationStart$,
      firstBoneRotationEnd$,
      secondBoneRotationStart$,
      secondBoneRotationEnd$,
      firstBoneProgressStart$,
      firstBoneProgressEnd$,
      secondBoneProgressStart$,
      secondBoneProgressEnd$,
      totalBoneLength$,
    } = this;

    return (
      <div
        style = {
          {
            backgroundColor: '#202020',
            minWidth: '100vw',
            minHeight: '100vh',
          }
        }
      >
        <div
          style = {
            {
              height: 350,
            }
          }
        >
          <AttachStreams
            origin = { boneOrigin$ }
            rotate = { firstBoneRotation$ }
            left = { totalBoneLength$ }
          >
            <TransformTarget
              position = 'absolute'
              top = { 150 }
            >
              <AttachStreams
                position = 'absolute'
                length = { firstBoneLength$ }
                girth = { boneGirth$ }
              >
                <Bone />
              </AttachStreams>

              <AttachStreams
                position = 'absolute'
                length = { secondBoneLength$ }
                girth = { boneGirth$ }
                left = { secondBoneLeft$ }
                origin = { boneOrigin$ }
                rotate = { secondBoneRotation$ }
              >
                <Bone />
              </AttachStreams>

              <AttachStreams
                width = { jointSize$ }
                height = { jointSize$ }
                borderRadius = { jointRadius$ }
                top = { jointTop$ }
                left = { jointLeft$ }
              >
                <TransformTarget
                  top = { 0 }
                  position = 'absolute'
                  borderWidth = '3px'
                  borderStyle = 'solid'
                  borderColor = 'white'
                  backgroundColor = '#FD82AB'
                />
              </AttachStreams>
            </TransformTarget>
          </AttachStreams>
        </div>

        <div
          style = {
            {
              color: 'white',
              maxHeight: 500,
              overflow: 'scroll',
            }
          }
        >
          <Slider
            property = { progress$ }
            label = 'Progress'
            min = { 0 }
            max = { 1 }
            step = { .001 }
          />
          <Slider
            property = { boneGirth$ }
            label = 'Bone girth'
          />
          <Slider
            property = { firstBoneLength$ }
            label = 'First bone length'
            min = { 0 }
            max = { 300 }
          />
          <Slider
            property = { secondBoneLength$ }
            label = 'Second bone length'
            min = { 0 }
            max = { 300 }
          />
          <Slider
            property = { jointSize$ }
            label = 'Joint size'
            min = { 0 }
            max = { 300 }
          />
          <Slider
            property = { firstBoneProgressStart$ }
            label = 'First bone progress start'
            min = { 0 }
            max = { 1 }
            step = { .001 }
          />
          <Slider
            property = { firstBoneProgressEnd$ }
            label = 'First bone progress end'
            min = { 0 }
            max = { 1 }
            step = { .001 }
          />
          <Slider
            property = { firstBoneRotationStart$ }
            label = 'First bone rotation start'
            min = { Math.PI / 2 }
            max = { 5 / 2 * Math.PI }
            step = { .00001 }
          />
          <Slider
            property = { firstBoneRotationEnd$ }
            label = 'First bone rotation end'
            min = { Math.PI / 2 }
            max = { 5 / 2 * Math.PI }
            step = { .00001 }
          />
          <Slider
            property = { secondBoneProgressStart$ }
            label = 'Second bone progress start'
            min = { 0 }
            max = { 1 }
            step = { .001 }
          />
          <Slider
            property = { secondBoneProgressEnd$ }
            label = 'Second bone progress end'
            min = { 0 }
            max = { 1 }
            step = { .001 }
          />
          <Slider
            property = { secondBoneRotationStart$ }
            label = 'Second bone rotation start'
            min = { Math.PI / 2 }
            max = { 5 / 2 * Math.PI }
            step = { .00001 }
          />
          <Slider
            property = { secondBoneRotationEnd$ }
            label = 'Second bone rotation end'
            min = { Math.PI / 2 }
            max = { 5 / 2 * Math.PI }
            step = { .00001 }
          />
        </div>
      </div>
    );
  }
}
export default ArticulableFinger;

function Bone({ length, girth, ...propsPassthrough }) {
  return (
    <TransformTarget
      width = { length }
      height = { girth }
      borderRadius = { girth / 2 }
      backgroundColor = 'white'
      { ...propsPassthrough }
    />
  );
}

type SliderProps = {
  property: MotionProperty<number>,
  label: string,
  min?: number,
  max?: number,
  step?: number,
};

class Slider extends React.Component<SliderProps, {}> {
  attachInteractions = (element: HTMLInputElement) => {
    if (element) {
      const {
        min,
        max,
        property: value$,
      } = this.props;

      const sliderProperties = new SliderProperties({ element, value$ });

      if (min !== undefined) {
        sliderProperties.min = min;
      }

      if (max !== undefined) {
        sliderProperties.max = max;
      }
    }
  }

  render() {
    const {
      label,
      step,
      property,
    } = this.props;

    return (
      <label
        style = {
          {
            fontFamily: 'Roboto Mono',
            display: 'block',
            margin: 16,
          }
        }
      >
        <div
          style = {
            {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }
          }
        >
          { label }:

          <AttachStreams
            textContent = { property }
          />
        </div>

        <input
          type = 'range'
          ref = { this.attachInteractions }
          step = { step }
        />
      </label>
    )
  }
}
