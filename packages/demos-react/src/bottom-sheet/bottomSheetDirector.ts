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
  DirectorArgs,
  ExperimentalMotionObservable,
  InputKind,
  PrimitiveKind,
  PropertyKind,
} from 'material-motion-experimental-addons';

export const bottomSheetDirector: Director = function bottomSheetDirector({
  state$,
  springSystem,
  scrim,
  bottomSheet,
  collapsedToolBar,
  expandedToolBar,
  closeButton,
}: DirectorArgs) {
  const openness$ = springSystem({
    destination: state$.pluck('isOpen').toNumber$(),
  });

  const previewOpenness$ = springSystem({
    destination: state$.pluck('willOpen').toNumber$(),
  });

  // This is basically pluck('isOpen').rewrite(), but since it's dependent on
  // multiple properties, it's not easy to express in that form:
  const springDestinationY$ = state$._map(
    ({ isOpen, length }) => isOpen
      ? 0
      : length
  );

  const bottomSheetPosition$ = ExperimentalMotionObservable.combineLatestFromDict({
    x: 0,
    y: springSystem({
      destination: springDestinationY$
    })
  });

  const isOpen$ = state$.pluck('isOpen').merge(
    closeButton.tap$.mapTo(false),

    collapsedToolBar.tap$.mapToLatest(
      state$.pluck('isOpen').invert()
    )
  ).dedupe();

  return {
    state$: state$.applyDiffs(
      // This should probably be a merge, to ensure we always use the latest
      // state$
      //
      // Perhaps applyDiffs should take dicts of streams?
      ExperimentalMotionObservable.combineLatestFromDict({
        isOpen: isOpen$,

        // // This will eventually have the potential to deviate from isOpen$ when
        // // gestures are involved, but for now, they are identical.
        // willOpen: isOpen$
      })
    ),
    scrim: {
      [PropertyKind.OPACITY]: previewOpenness$.mapRange({
        fromStart: 0,
        fromEnd: 1,
        toStart: 0,
        toEnd: .87,
      })
    },
    bottomSheet: {
      [PropertyKind.POSITION]: bottomSheetPosition$,
    },
    collapsedToolBar: {
      [PropertyKind.OPACITY]: openness$.mapRange({
        fromStart: 0,
        fromEnd: 1,
        toStart: 1,
        toEnd: 0,
      })
    },
    expandedToolBar: {
      [PropertyKind.OPACITY]: openness$.mapRange({
        fromStart: 0,
        fromEnd: 1,
        toStart: 0,
        toEnd: 1,
      })
    },
    closeButton: {},
  };
};

// This is basically ReactComponent.propTypes.  It doesn't do anything right
// now, but we could build a validation/typing system on top of it in the
// future.
bottomSheetDirector.stateShape = {
  // The state of the bottom sheet right now:
  isOpen: PrimitiveKind.BOOLEAN,

  // If the user is interacting now and releases control, the bottom sheet will
  // transition to this state:
  willOpen: PrimitiveKind.BOOLEAN,

  // When the bottom sheet is closed, it will be translated down by this amount,
  // in pixels:
  length: PrimitiveKind.number,
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

