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
  Observable,
} from 'material-motion-streams';

import {
  ExperimentalMotionObservable,
} from './ExperimentalMotionObservable';

// If there were Set literals and collection methods, these might be better as
// sets than arrays

export interface InputOutputStreamsDict {
  [viewName: string]: {
    input: Array<Observable<any>>,
  } | {
    output: Array<Observable<any>>,
  }
};

export interface DirectorArgs extends InputOutputStreamsDict {
  state$: ExperimentalMotionObservable<any>,
}

// TODO: make this typed/templated in the same way propTypes are in React
export interface Director {
  (streams: DirectorArgs): {
    state$: ExperimentalMotionObservable<any>,
    [viewName: string]: {
      [key: string]: ExperimentalMotionObservable<any>
    }
  }

  streamKindsByTargetName:{
    [viewName: string]: {
      input: Array<string>,
    } | {
      output: Array<string>,
    }
  };
}

export type equalityCheck = (a: any, b: any) => boolean;
