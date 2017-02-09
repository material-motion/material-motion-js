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
  IndefiniteSubject,
  SpringArgs,
  StreamDict,
} from 'material-motion-streams';

import {
  springSource as reboundSpringSystem,
} from 'material-motion-springs-adaptor-rebound';

import {
  Director,
  ExperimentalMotionObservable,
  InputKind,
} from 'material-motion-experimental-addons';

import {
  AttachStreams,
  TransformTarget
} from './components';

export type createMotionComponentArgs<P> = {
  director: Director,
  render: MotionReceiver<P>,
};

// TODO: break this into separate files

// make streams, glue them to the director, and set the display name of each resulting MotionTarget
export function createMotionComponent<P>({ director, render, initialState }: createMotionComponentArgs<P>): React.StatelessComponent<P> {
  const motionTargets = {};

  const streamsByPropNameByTargetName = {};
  const inputStreamsByPropNameByTargetName = {};

  Object.entries(director.streamKindsByTargetName).forEach(
    ([ targetName, { input = [] }]) => {
      inputStreamsByPropNameByTargetName[targetName] = {};
      streamsByPropNameByTargetName[targetName] = {};

      input.forEach(
        (inputKind: string) => {
          let eventHandlerName;

          // The conversion between pointer/keyup events and input needs to
          // happen somewhere - probably outside the director.
          //
          // For the purposes of prototyping, we're treating all taps as 'click'
          // events here and ignoring everything else.

          switch (inputKind) {
            case InputKind.TAP:
              eventHandlerName = 'onClick';
              break;

            case InputKind.KEY:
              eventHandlerName = 'onKeyUp';
              break;

            default:
              console.error(`The createMotionComponent prototype doesn't support ${ inputKind }`);
              return;
        }

        const subject = new IndefiniteSubject();
        inputStreamsByPropNameByTargetName[targetName][inputKind] = ExperimentalMotionObservable.from(subject);
        streamsByPropNameByTargetName[targetName][eventHandlerName] = subject;
      );
    }
  );

  // This is a quick hack to prototype cyclical state streams.
  //
  // If we move forward with this strategy, we should not presume that
  // `initialState` is provided; instead, allowing `state$` to be set as a prop
  // (and perhaps accepting `state` as a prop and converting it to a stream
  // before passing it into the director).
  const stateSubject = new IndefiniteSubject();
  stateSubject.next(initialState);

  const {
    state$,
    ...outputStreamsByTargetName
  } = director({
    state$: ExperimentalMotionObservable.from(stateSubject),
    springSystem: (kwargs: SpringArgs<number>) => ExperimentalMotionObservable.from(
      reboundSpringSystem(kwargs)
    ),
    ...inputStreamsByPropNameByTargetName
  }) || {};

  state$.dedupe().subscribe(stateSubject);

  Object.entries(outputStreamsByTargetName).forEach(
    ([ targetName, outputStreams ]) => {
      Object.entries(outputStreams).forEach(
        ([ streamName, stream ]) => {
          let propName = streamName.replace('$', '');

          // Material Motion prefixes `pointerEvents` to avoid confusion with
          // the JavaScript PointerEvent type, but `TransformTarget` expects a
          // key it can use in `style`.
          if (propName === 'cssPointerEvents') {
            propName = 'pointerEvents';
          }

          streamsByPropNameByTargetName[targetName][propName] = stream;
        }
      );

      const componentName = targetName.substr(0, 1).toUpperCase() + targetName.substr(1);
      motionTargets[componentName] = createMotionTarget(streamsByPropNameByTargetName[targetName]);
    }
  );

  const result: React.StatelessComponent<P> = function MotionComponent(props: P, context) {
    console.log(motionTargets);
    return render(props, context, motionTargets);
  };

  result.contextTypes = render.contextTypes;

  return result;
}
export default createMotionComponent;

interface MotionReceiver<P> extends React.StatelessComponent<P> {
  // This is the same signature as StatelessComponent, but with MotionTargetDict added
  (props: P, context: any, motionTargets: MotionTargetDict): React.ReactElement<any>;
}

type MotionTargetDict = {
  [key: string]: React.StatelessComponent<MotionTargetProps>,
};

type MotionTargetProps = {
  children: React.ReactNode,
};

// subscribe to the streams
function createMotionTarget(streamsByPropName: StreamDict<any>):React.StatelessComponent<MotionTargetProps> {
  return function MotionTarget({ children, ...propsPassthrough }) {
    // For simplicity and separation of concerns, I'm reusing the AttachStreams
    // and TransformTarget components I've already written.
    //
    // It may be a better developer experience to combine these into a single
    // inline class, so we don't end up inserting a bunch of nested nodes into
    // the React Dev Tools tree.
    //
    //     <CloseButtonMotionTarget>
    //       <img src />
    //     </CloseButtonMotionTarget>
    //
    // would be a better developer experience than
    //
    //     <MotionTarget>
    //       <AttachStreams>
    //         <TransformTarget>
    //           <img src />
    //         </TransformTarget>
    //       </AttachStreams>
    //     </MotionTarget>

    return (
      <AttachStreams
        { ...propsPassthrough }
        { ...streamsByPropName }
      >
        <TransformTarget>
          { children }
        </TransformTarget>
      </AttachStreams>
    );
  };
}
