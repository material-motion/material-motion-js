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
  Dict,
  IndefiniteSubject,
  MotionRuntime,
  ReactiveProperty,
  SpringArgs,
  StreamDict,
  createProperty,
} from 'material-motion';

import {
  springSource as reboundSpringSystem,
} from 'material-motion-springs-rebound';

import {
  Director,
  ExperimentalMotionObservable,
  InputKind,
  PropertyKind,
  createDragStream,
  propertyKinds,
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
  const runtime = new MotionRuntime();

  const propertiesByKindByTargetName: Dict<Dict<ReactiveProperty<any>> = {};
  const streamsByPropNameByTargetName: Dict<Dict<Observable<UIEvent>>> = {};
  const inputStreamsByPropNameByTargetName: Dict<Dict<Observable<UIEvent>>> = {};

  Object.entries(director.streamKindsByTargetName).forEach(
    ([ targetName, streamKinds]) => {
      propertiesByKindByTargetName[targetName] = {};
      streamsByPropNameByTargetName[targetName] = {};
      inputStreamsByPropNameByTargetName[targetName] = {};

      streamKinds.forEach(
        (streamKind: string) => {
          // There are two kinds of streams we're modeling here:
          // ReactiveProperty and something like a cacheless subject.  (We
          // wouldn't want a stale move event to be dispatched if someone
          // subscribed to move$ - we just need the ability to write to its
          // observers from the outside.)
          //
          // For the sake of prototyping, these are modeled with a
          // property/subject + EMO.from.  When we have operators broken out
          // into their own files and shared across observable varieties
          // (https://github.com/material-motion/material-motion-js/issues/114)
          // we can revisit this.
          if (streamKind === InputKind.TAP) {
            const subject = new IndefiniteSubject();
            inputStreamsByPropNameByTargetName[targetName][streamKind] = ExperimentalMotionObservable.from(subject);
            streamsByPropNameByTargetName[targetName]['onClick'] = subject;

          } else if ([InputKind.DRAG, InputKind.PINCH, InputKind.ROTATE].includes(streamKind)) {
            const downSubject = new IndefiniteSubject();
            const down$ = ExperimentalMotionObservable.from(downSubject);
            streamsByPropNameByTargetName[targetName]['onPointerDown'] = downSubject;

            const moveSubject = new IndefiniteSubject();
            const move$ = ExperimentalMotionObservable.from(moveSubject);
            streamsByPropNameByTargetName[targetName]['onPointerMove'] = moveSubject;

            const upSubject = new IndefiniteSubject();
            const up$ = ExperimentalMotionObservable.from(upSubject);
            streamsByPropNameByTargetName[targetName]['onPointerUp'] = upSubject;

            switch (streamKind) {
              case InputKind.DRAG:
                const drag$ = createDragStream({ down$, move$, up$ });
                inputStreamsByPropNameByTargetName[targetName][streamKind] = drag$;
                break;

              case InputKind.PINCH:
                break;

              case InputKind.ROTATE:
                break;

              // Needed to make the linter happy - all possible cases should be
              // covered above
              default:break;
            }
          } else if (propertyKinds.includes(streamKind)) {
            // Perhaps I should subscribe to the results of the director and
            // write all its emissions to these properties to create cycles
            let property: ReactiveProperty;
            switch (streamKind) {
              case PropertyKind.TRANSLATION:
                property = createProperty({ initialValue: { x: 0, y: 0 } });
                propertiesByKindByTargetName[targetName][streamKind] = property;
                inputStreamsByPropNameByTargetName[targetName][streamKind] = property;
                break;

              case PropertyKind.ROTATION:
              case PropertyKind.OPACITY:
              case PropertyKind.CORNER_RADIUS:
                property = createProperty({ initialValue: 0 });
                propertiesByKindByTargetName[targetName][streamKind] = property;
                inputStreamsByPropNameByTargetName[targetName][streamKind] = property;
                break;

              case PropertyKind.SCALE:
                property = createProperty({ initialValue: 1 });
                propertiesByKindByTargetName[targetName][streamKind] = property;
                inputStreamsByPropNameByTargetName[targetName][streamKind] = property;
                break;


              case PropertyKind.COLOR:
              case PropertyKind.BACKGROUND_COLOR:
              case PropertyKind.WIDTH:
              case PropertyKind.HEIGHT:
              case PropertyKind.POINTER_EVENTS:
                // TODO: figure out how to seed these with initial values.  It
                // might be something as inelegant as putting an initialValues
                // dict in createMotionComponentArgs until we find a better
                // solution
                break;


              // Needed to make the linter happy - all possible cases should be
              // covered above
              default:break;
            }
          }
        }
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
    runtime,
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

          // This is a quick hack of cyclic properties.  If we move in this
          // direction, we should decide where the subscription goes and when it
          // is unsubscribed from.
          if (propertiesByKindByTargetName[targetName] && propertiesByKindByTargetName[targetName][streamName]) {
            stream.subscribe(
              value => propertiesByKindByTargetName[targetName][streamName].write(value)
            );
          }
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

export interface MotionReceiver<P> extends React.StatelessComponent<P> {
  // This is the same signature as StatelessComponent, but with MotionTargetDict added
  (props: P, context: any, motionTargets: MotionTargetDict): React.ReactElement<any>;
}

export type MotionTargetDict = {
  [key: string]: React.StatelessComponent<MotionTargetProps>,
};

export type MotionTargetProps = {
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
