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

import {
  IndefiniteSubject,
} from 'material-motion-streams';

import {
  Director,
  InputKind,
  InputOutputStreamsDict,
  PropertyKind,
} from 'material-motion-experimental-addons';

export const bottomSheetDirector: Director = function bottomSheetDirector({
  scrim,
  bottomSheet,
  collapsedToolBar,
  expandedToolBar,
  closeButton,
}: InputOutputStreamsDict) {
  const tempPosition$ = new IndefiniteSubject();

  function randomMove() {
    tempPosition$.next({
      x: 0,
      y: 300 * Math.random()
    });
  }

  closeButton.tap$.log().subscribe(randomMove);
  collapsedToolBar.tap$.log().subscribe(randomMove);

  return {
    scrim: {},
    bottomSheet: {
      [PropertyKind.POSITION]: tempPosition$,
    },
    collapsedToolBar: {},
    expandedToolBar: {},
    closeButton: {},
  };
};

bottomSheetDirector.streamKindsByTargetName = {
  scrim: {
    output: [PropertyKind.OPACITY],
  },
  bottomSheet: {
    input: [InputKind.DRAG],
    output: [PropertyKind.POSITION],
  },
  collapsedToolBar: {
    input: [InputKind.TAP],
    output: [PropertyKind.OPACITY],
  },
  expandedToolBar: {
    output: [PropertyKind.OPACITY],
  },
  closeButton: {
    input: [InputKind.TAP],
  },
};

export default bottomSheetDirector;

