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
