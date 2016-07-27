/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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
 *
 *  @flow
 */

import {distinctUntilChanged} from 'rxjs-es/operator/distinctUntilChanged';
import {mapTo} from 'rxjs-es/operator/mapTo';
import {map} from 'rxjs-es/operator/map';
import {merge} from 'rxjs-es/operator/merge';
import {Observable} from 'rxjs-es/Observable';
import {scan} from 'rxjs-es/operator/scan';
import {Subject} from 'rxjs-es/Subject';

export function areStreamsBalanced(
  incrementStream:Observable<mixed>,
  decrementStream:Observable<mixed>,
):Observable<boolean> {
  return incrementStream::mapTo(1)::merge(
    decrementStream::mapTo(-1)
  )::scan(
    (currentValue, nextValue) => currentValue + nextValue
  )::map(
    count => count === 0
  )::distinctUntilChanged();
}

export class TimeStream extends Subject {
  _nextFrameQueued:boolean = false;

  _subscribe(observer):void {
    const subscription = super._subscribe(observer);

    // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/50)
    // Make sure observer.next is called exactly once for each observer on this
    // frame
    if (!this._nextFrameQueued) {
      this._queueNextFrame();
      this._nextFrameQueued = true;
    }

    return subscription;
  }

  _queueNextFrame(timestamp:number = performance.now()):void {
    super.next(timestamp);

    if (this.observers && this.observers.length) {
      requestAnimationFrame(::this._queueNextFrame);
      this._nextFrameQueued = true;

    } else {
      this._nextFrameQueued = false;
    }
  }
}
