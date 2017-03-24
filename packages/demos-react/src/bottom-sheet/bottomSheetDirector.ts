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
  createProperty,
} from 'material-motion';

import {
  Director,
  DirectorArgs,
  ExperimentalMotionObservable,
  GestureRecognitionState,
  InputKind,
  PrimitiveKind,
  PropertyKind,
  TranslationGestureRecognition,
} from 'material-motion-experimental-addons';

export const bottomSheetDirector: Director = function bottomSheetDirector({
  runtime,
  state$,
  springSystem,
  scrim,
  bottomSheet,
  collapsedToolBar,
  expandedToolBar,
  closeButton,
}: DirectorArgs) {
  // opacity is broken.  presumably the spring isn't emitting on changes from 0
  // to 0, but it worked before.  *shrug*

  const openness$ = springSystem({
    destination: state$.pluck('isOpen').toNumber$(),
  }).pluck('value');

  const previewOpenness$ = springSystem({
    destination: state$.pluck('willOpen').toNumber$(),
  }).pluck('value');

  // This is basically pluck('isOpen').rewrite(), but since it's dependent on
  // multiple properties, it's not easy to express in that form:
  const springDestinationY$ = state$._map(
    ({ isOpen, length }) => isOpen
      ? {
          x: 0,
          y: 0,
        }
      : {
          x: 0,
          y: length,
        }
  );

  // This was originally an experiment in using cycles to model an interaction.
  // Though that approach worked, there were a couple concerns:
  //
  // - "institutional knowledge": Do you have to remember how all of the streams
  //   fit together throughout the entire interaction to feel comfortable
  //   modifying on any of its code?  Is this worse than the alternative model?
  //
  // - It's a different approach than the native platforms have been exploring.
  //
  // Therefore, I'm attempting to transition to a model closer to the native
  // platforms, where streams are connected with
  // runtime.write(stream, property).  Until that's done, this file will be an
  // unfortunate blend of both approaches.
  //
  // Specifically, bottomSheet.translate$ is being managed with runtime.write().

  const springVelocity = createProperty({ initialValue: { x: 0, y: 0 } });
  const springEnabled = createProperty({ initialValue: true });

  const spring = springSystem({
    destination: springDestinationY$,
    initialValue: bottomSheet.translate$,
    initialVelocity: springVelocity,
    enabled: springEnabled,
  }).log();

  runtime.write({
    stream: spring.pluck('value'),
    to: bottomSheet.translate$
  });

  runtime.write({
    stream: bottomSheet.drag$._map(
      (value: TranslationGestureRecognition) => ({
        ...value,
        translation: {
          x: 0,
          y: value.translation.y
        }
      })
    ).translationAddedTo(bottomSheet.translate$),
    to: bottomSheet.translate$
  });

  runtime.write({
    stream: bottomSheet.drag$.atRest(),
    to: springEnabled
  });

  runtime.write({
    stream: bottomSheet.drag$.whenRecognitionStateIs(GestureRecognitionState.ENDED).pluck('velocity'),
    to: springVelocity
  });

  // looks like we need an actual tap gesture recognizer, because click$ doesn't
  // bail when a drag recognizes
  const isOpen$ = state$.pluck('isOpen').merge(
    closeButton.tap$.mapTo(false),
    scrim.tap$.mapTo(false),

    collapsedToolBar.tap$.mapToLatest(
      state$.pluck('isOpen').invert()
    )
  ).dedupe();

  const collapsedToolBarOpacity$ = openness$.mapRange({
    fromStart: 0,
    fromEnd: 1,
    toStart: 1,
    toEnd: 0,
  });

  const scrimOpacity$ = previewOpenness$.mapRange({
    fromStart: 0,
    fromEnd: 1,
    toStart: 0,
    toEnd: .87,
  });

  return {
    state$: state$.applyDiffs(
      // This should probably be a merge, to ensure we always use the latest
      // state$
      //
      // Perhaps applyDiffs should take dicts of streams?
      ExperimentalMotionObservable.combineLatestFromDict({
        isOpen: isOpen$,

        // This will eventually have the potential to deviate from isOpen$ when
        // gestures are involved, but for now, they are identical.
        willOpen: isOpen$
      }),
    ),
    scrim: {
      [PropertyKind.OPACITY]: scrimOpacity$,
      [PropertyKind.POINTER_EVENTS]: collapsedToolBarOpacity$.breakpointMap({
        [0]: 'none',
        [.1]: 'auto',
      }),
    },
    bottomSheet: {
      [PropertyKind.TRANSLATION]: ExperimentalMotionObservable.from(bottomSheet.translate$).dedupe(),
    },
    collapsedToolBar: {
      // Perhaps we should have a contract that MotionComponents disable pointer
      // events when the opacity is below a threshold, but for now, it's manual
      [PropertyKind.OPACITY]: collapsedToolBarOpacity$,
      [PropertyKind.POINTER_EVENTS]: collapsedToolBarOpacity$.breakpointMap({
        [0]: 'none',
        [.1]: 'auto',
      }),
    },
    expandedToolBar: {
      [PropertyKind.OPACITY]: openness$.mapRange({
        fromStart: 0,
        fromEnd: 1,
        toStart: 0,
        toEnd: 1,
      }),
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
  scrim: [
    InputKind.TAP,
    PropertyKind.OPACITY,
  ],
  bottomSheet: [
    InputKind.DRAG,
    PropertyKind.TRANSLATION,
  ],
  collapsedToolBar: [
    InputKind.TAP,
    PropertyKind.OPACITY,
    PropertyKind.POINTER_EVENTS,
  ],
  expandedToolBar: [
    PropertyKind.OPACITY,
  ],
  closeButton: [
    InputKind.TAP,
  ],
};

export default bottomSheetDirector;

