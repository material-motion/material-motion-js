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
  Block,
  Col,
  Row,
  curry,
} from 'jsxstyle';

import {
  TogglableProperty,
} from 'material-motion-experimental-addons';

import {
  springSource,
} from 'material-motion-springs-adaptor-rebound';

import {
  createProperty,
} from 'material-motion-streams';

// How the contents of a bottom sheet transition between states vary from app-
// to-app.  For instance, an app could choose any of these:
//
// - Keep the contents the same in both the collapsed and expanded states;
//
// - Cross-dissolve the collapsed and expanded states, perhaps with an
//   intermediary state where only the shared elements are showing;
//
// - Keep most of the contents the same, but transition the action icons
//   themselves;
//
// - etc.
//
// For any of these options, the animation could be triggered when the user
// crosses a threshold, or be directly driven by how far the bottom sheet has
// moved.
//
// There isn't a single solution that solves all these cases (and there probably
// shouldn't be), but with Material Motion, we provide the pieces you need to
// build any of them.  Here's an example that cross-dissolves between the states
// when the user crosses a threshold.

class BottomSheetMain extends React.Component {
  _isOpen = new TogglableProperty({
    onValue: 0,
    // TODO: make these reactive based on viewport size
    offValue: 300,
  });

  _spring = springSource({
    destination: this._isOpen,

    // TODO: make these optional in TypeScript
    initialValue: createProperty({ initialValue: 0 }),
    initialVelocity: createProperty({ initialValue: 0 }),
    threshold: createProperty({ initialValue: 1 }),
    tension: createProperty({ initialValue: 342 }),
    friction: createProperty({ initialValue: 30 }),
  });

  _testing = this._spring.subscribe((value: number) => console.log('spring value: ', value));

  _model = {
    title: 'A really interesting talk',
    artist: 'Britta Holt',
    avatar: '/images/album-art.png',
  };

  render() {
    return (
      <Col
        backgroundColor = '#ECECEC'
        width = '100vw'
        height = '100vh'
      >
        <WelcomeMessage />

        <Col
          position = 'fixed'
          width = '100vw'
          height = '100vh'
          alignItems = 'stretch'
        >
          {/*
            There are three components to this transition:

            - The bits that are only present when the bottom sheet is collapsed,
              in what we call the "back" state;

            - The bits that are only present when the bottom sheet is expanded,
              in what we call the "fore" state; and

            - The bits that are appear in both states.

            Each is represented by a single JSX element below.
          */}
          <BottomSheetBackground
            position = 'absolute'
            top = { 0 }
            zIndex = { -1 }
            model = { this._model }
          />

          <CollapsedBottomSheetContents
            model = { this._model }
            cursor = 'pointer'
            onTap = { this._isOpen.toggle }
          />
          <ExpandedBottomSheetContents
            model = { this._model }
            onCloseTap = { this._isOpen.turnOff }
          />
        </Col>
      </Col>
    );
  }
}
export default BottomSheetMain;

function WelcomeMessage(props) {
  return (
    <Col
      padding = { 16 }
    >
      <Headline>
        Hello from an imaginary app!
      </Headline>

      <Body1>
        Tap the bottom sheet below to expand it.
      </Body1>
    </Col>
  );
}

function BottomSheetBackground({ model, ...props }) {
  return (
    <Col
      backgroundImage = { `url(${ model.avatar }) ` }
      backgroundSize = 'cover'
      backgroundPosition = 'center'
      width = '100%'
      height = '100%'
      boxShadow = { shadowByElevation[1] }
      borderRadius = { 2 }
      { ...props }
    />
  );
}

function CollapsedBottomSheetContents({
  height = 84,
  iconSize = 36,
  model = {},
  onTap = console.log,
  ...props,
}) {
  return (
    <Row
      justifyContent = 'space-between'
      flex = 'none'
      height = { height }
      backgroundColor = '#FFFFFF'
      color = '#000000'

      // Until https://github.com/smyte/jsxstyle/pull/49 lands, event handlers
      // need to go in a `props` dict
      props = {
        {
          onClick: onTap,
        }
      }
      { ...props }
    >
      <Row>
        <img
          src = { model.avatar }
          width = { height }
          height = { height }
          style = {
            {
              userSelect: 'none',
            }
          }
        />

        <Col
          justifyContent = 'center'
          marginLeft = { 16 }
        >
          <Body1>
            { model.title }
          </Body1>
          <Caption>
            { model.artist }
          </Caption>
        </Col>
      </Row>

      <Icon
        fontSize = { iconSize }
        padding = { (height - iconSize) / 2 }
        props = {
          {
            // In a real app, tapping play/pause would trigger playback.  Here,
            // we just want to ensure tapping it doesn't expand the bottom sheet
            onClick(event) {
              event.stopPropagation();
            }
          }
        }
      >
        play_arrow
      </Icon>
    </Row>
  );
}

function ExpandedBottomSheetContents({ model, onCloseTap }) {
  return (
    <Col
      width = '100%'
      height = '100%'
      justifyContent = 'space-between'
    >
      <BottomSheetAppBar
        onCloseTap = { onCloseTap }
      />

      <PlaybackControls
        model = { model }
      />
    </Col>
  );
}

function BottomSheetAppBar({ onCloseTap = console.log }) {
  return (
    // We add protection to the icons (making them more legible) by sampling a
    // color from the image and applying it as a gradient behind the white icons
    <Col
      height = { 96 }
      background = 'linear-gradient(#478F47, transparent)'
    >
      <Row
        justifyContent = 'space-between'
        alignItems = 'center'
        height = { 56 }
        color = '#FFFFFF'
      >
        <Icon
          // Until https://github.com/smyte/jsxstyle/pull/49 lands, event
          // handlers need to go in a `props` dict
          props = {
            {
              onClick: onCloseTap,
            }
          }
        >
          close
        </Icon>

        <Row>
          <Icon>
            cast
          </Icon>

          <Icon>
            more_vert
          </Icon>
        </Row>
      </Row>
    </Col>
  );
}

function PlaybackControls({ model, ...props }) {
  return (
    <Col
      flex = 'none'
      justifyContent = 'space-between'
      alignItems = 'center'
      height = { 152 }
      margin = { 8 }
      padding = { 16 }
      backgroundColor = '#FFFFFF'
      boxShadow = { shadowByElevation[1] }
      { ...props }
    >
      <Col
        alignItems = 'center'
      >
        <Title>
          { model.title }
        </Title>
        <Caption>
          { model.artist }
        </Caption>
      </Col>

      <Row>
        <Icon>
          skip_previous
        </Icon>

        <Icon
          width = { 56 }
          height = { 56 }
          borderRadius = { 28 }
          backgroundColor = '#673AB7'
          color = '#FFFFFF'
          boxShadow = { shadowByElevation[1] }
        >
          play_arrow
        </Icon>

        <Icon>
          skip_next
        </Icon>
      </Row>
    </Col>
  );
}

function Icon({ children, ...props }) {
  return (
    <Row
      justifyContent = 'center'
      alignItems = 'center'
      padding = { 16 }
      cursor = 'pointer'
      userSelect = 'none'
      { ...props }
      className = 'material-icons'
    >
      { children }
    </Row>
  );
}

const shadowByElevation = {
  0: '',
  1: `
    0px 2px 1px -1px rgba(0, 0, 0, .2),
    0px 1px 1px 0px rgba(0, 0, 0, .14),
    0px 1px 3px 0px rgba(0, 0, 0, .12)
  `,
};

const Headline = curry(  // tslint:disable-line:variable-name
  Block,
  {
    lineHeight: '34px',
    fontSize: 24,
  }
);

const Title = curry(  // tslint:disable-line:variable-name
  Block,
  {
    lineHeight: '32px',
    fontSize: 20,
  }
);

const Body1 = curry(  // tslint:disable-line:variable-name
  Block,
  {
    fontSize:  14,
    lineHeight: '24px',
  }
);

const Caption = curry(  // tslint:disable-line:variable-name
  Block,
  {
    opacity: .54,
    fontSize:  12,
    lineHeight: '20px',
  }
);
