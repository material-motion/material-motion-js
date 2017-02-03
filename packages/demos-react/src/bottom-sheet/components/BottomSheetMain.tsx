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
  createMotionComponent,
} from 'material-motion-streams-react';

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

import {
  BottomSheetPosition,
  bottomSheetDirector,
} from '../bottomSheetDirector';

// tslint:disable-next-line variable-name
export const BottomSheetMain: React.StatelessComponent<any> = createMotionComponent({
  director: bottomSheetDirector,

  // There's a bunch of state that both an application and an interaction need
  // to share.  For instance, the URL should be controlled by the application,
  // but the director needs to know which presentation to use, and this is often
  // determined by the URL.  Furthermore, if the user requests a new state via
  // a gestural interaction, the application should be able to observe that
  // change and update the URL accordingly.
  //
  // The application likely stores its state in a { Redux, MobX, Backbone,
  // Angular } container.  We can write adaptors for those state containers,
  // expose out input and output as streams, or as callbacks.  These are all
  // optimizations that can be done later.
  //
  // For now, createMotionComponent will take `initialState`, pass it into the
  // director, and loop a director's output state back into its input.  This
  // demonstrates where external state would go in the system, but
  // short-circuits it for the purposes of creating this demo.  To enable quick
  // prototyping, we may want to continue supporting this kind of
  // short-circuiting, even after building more robust abstractions for real
  // applications.
  initialState: {
    isOpen: false,
    willOpen: false,
    length: 484,
  },
  render(
    props,
    context, {
      Scrim,
      BottomSheet,
      CollapsedToolBar,
      ExpandedToolBar,
      CloseButton,
    }
  ) {
    const model = {
      title: 'A really interesting talk',
      artist: 'Britta Holt',
      avatar: '/images/album-art.png',
    };

    return (
      <Col
        backgroundColor = '#ECECEC'

        // iOS will show scroll bars if you use 100vh (because the address bar
        // is not included in the viewport dimensions, but does take up visual
        // space).  Therefore, we instead use position: absolute with all the
        // distances set to 0 to ensure this element fills the body, regardless
        // of whether or not the address bar is showing.
        position = 'absolute'
        top = { 0 }
        left = { 0 }
        right = { 0 }
        bottom = { 0 }
        overflow = 'auto'
      >
        {/*
          TODO: set pointerEvents: none here and pointer: cursor in the tappable spots
          - Should these be
            - in PropertyKind and set by the director?
            - in here, set by the author?
        */}
        <Scrim
          position = 'absolute'
          backgroundColor = 'black'
          top = { 0 }
          left = { 0 }
          bottom = { 0 }
          right = { 0 }
        />

        <WelcomeMessage />

        <BottomSheet
          position = 'fixed'
          top = { 0 }
          width = '100%'
          height = '100%'
          display = 'flex'
          flexDirection = 'column'
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
            model = { model }
          />

          <CollapsedToolBar
            // This should probably be set automatically by any director that
            // listens to click
            cursor = 'pointer'
            position = 'absolute'
            top = { 0 }
            zIndex = { 1000 }
            width = '100%'
          >
            <CollapsedBottomSheetContents
              model = { model }
            />
          </CollapsedToolBar>

          <ExpandedToolBar
            flex = { 1 }
          >
            <ExpandedBottomSheetContents
              model = { model }
              CloseButtonContainer = { CloseButton }
            />
          </ExpandedToolBar>
        </BottomSheet>
      </Col>
    );
  }
});
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
  ...props,
}) {
  return (
    <Row
      justifyContent = 'space-between'
      flex = 'none'
      height = { height }
      backgroundColor = '#FFFFFF'
      color = '#000000'
      { ...props }
    >
      <Row>
        <img
          src = { model.avatar }
          width = { height }
          height = { height }
          style = {
            {
              flex: 'none',
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
            //
            // Unfortunately, this doesn't seem to be working with the current
            // implementation of event handling in attachStreams
            onClick(event) {
              event.stopPropagation();
            },
          }
        }
      >
        play_arrow
      </Icon>
    </Row>
  );
}

function ExpandedBottomSheetContents({ model, CloseButtonContainer }) {
  return (
    <Col
      // use the same dimensions as the container
      position = 'absolute'
      top = { 0 }
      left = { 0 }
      right = { 0 }
      bottom = { 0 }
      justifyContent = 'space-between'
    >
      <BottomSheetAppBar
        CloseButtonContainer = { CloseButtonContainer }
      />

      <PlaybackControls
        model = { model }
      />
    </Col>
  );
}

function BottomSheetAppBar({ CloseButtonContainer }) {
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
        <CloseButtonContainer>
          <Icon>
            close
          </Icon>
        </CloseButtonContainer>

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
