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
} from 'jsxstyle';

// How the contents of a bottom sheet transition between states vary from app-
// to-app.  For instance, an app could choose any of these:
//
// - Keep the contents the same in both the collapsed and expanded states;
//
// - Cross-dissolve the collapsed and expanded states, perhaps with an
//   intermediary state where only the shared elements are showing;
//
// - Keep most of the contents the same, but transition the action icons
//   themselves; or
//
// - Plenty of other variations.
//
// For any of these options, the animation could happen immediately when the
// user crosses a threshold, or be directly driven by how far the bottom sheet
// has moved.
//
// There isn't a single solution that solves all these cases (and there probably
// shouldn't be), but with Material Motion, we provide the pieces you need to
// build any of them.  Here's an example that cross-dissolves between the states
// when the user crosses a threshold.

class BottomSheetMain extends React.Component {
  render() {
    return (
      <Col
        backgroundColor = '#ECECEC'
        width = '100vw'
        height = '100vh'
      >
        <BottomSheet />
      </Col>
    );
  }
}
export default BottomSheetMain;

function BottomSheet() {
  return (
    <Col
      backgroundImage = 'url(/images/album-art.png)'
      backgroundSize = 'cover'
      backgroundPosition = 'center'
      justifyContent = 'flex-end'
      boxShadow = { shadowByElevation[1] }
      width = '100vw'
      height = '100vh'
      borderRadius = { 2 }
    >
      <Row
        flex = 'none'
        width = '100vw'
        height = { 72 }
        backgroundColor = '#FFFFFF'
        justifyContent = 'center'
        alignItems = 'center'
      >
        <Icon>
          skip_previous
        </Icon>

        <Icon
          width = { 56 }
          height = { 56 }
          borderRadius = { 28 }
          marginLeft = { 8 }
          marginRight = { 8 }
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
