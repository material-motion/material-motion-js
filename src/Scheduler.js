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

// RxJS exports each method separately to support tree shaking, but doesn't
// export defaults
import {distinctUntilChanged} from 'rxjs-es/operator/distinctUntilChanged';
import {filter} from 'rxjs-es/operator/filter';
import {map} from 'rxjs-es/operator/map';
import {mergeMap as flatMap} from 'rxjs-es/operator/mergeMap';
import {Observable} from 'rxjs-es/Observable';
import {from as observableFrom} from 'rxjs-es/observable/from';
import {partition} from 'rxjs-es/operator/partition';
import {Subject} from 'rxjs-es/Subject';
import {skipWhile} from 'rxjs-es/operator/skipWhile';
import {startWith} from 'rxjs-es/operator/startWith';

import {
  areStreamsBalanced,
} from './observables';

import {
  findPerformerFactory,
} from './performerFactoryRegistry';

import type {
  PerformerI,
  PlanAndTargetT,
} from './Performer';

export default class Scheduler {
  // RxJS's groupBy uses a Map under-the-hood to do comparisons (rather than
  // letting you specify your own).  Hence, for two keys to be equivalent, they
  // have to share the same reference; it doesn't check deep equality.
  //
  // Therefore, we store a selector of all known Performer:target pairs here, to
  // make sure for any pair this Scheduler knows about, it returns the same key.
  // We can ensure old performers are GCed by resetting this selector (thus
  // clearing its state).
  _performerFactoryAndTargetSelector = makePerformerFactoryAndTargetSelector();

  _performerStream:Subject<PerformerI> = new Subject();

  // If we get an equal number of false and trues on each
  // performer.isAtRestStream, every performer has come to rest; therefore, the
  // scheduler is at rest.
  _isAtRestStream:Observable = areStreamsBalanced(
    ...(
      // Performers that work synchronously won't have an isAtRestStream
      this._performerStream::filter(
        performer => performer.isAtRestStream

      // Make sure we don't double-count, even if a performer sends more events
      // than it should.
      )::flatMap(
          performer => performer.isAtRestStream::distinctUntilChanged(
        )::skipWhile(
          performerIsAtRest => performerIsAtRest === true
        )
      )::partition(
        value => value === true
      )
    )
  )::distinctUntilChanged()::startWith(true);

  _performerMap:Map = new Map();

  get isAtRestStream():Observable {
    return this._isAtRestStream;
  }

  get isAtRest():boolean {
    return this._isAtRest;
  }

  constructor() {
    // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/46/):
    // Either implement dispose or kill `isAtRest` and just use `isAtRestStream`
    this._isAtRestSubscription = this._isAtRestStream.subscribe(
      isAtRest => {
        this._isAtRest = isAtRest;
      }
    );
  }

  commit(plansAndTargets:Iterable<PlanAndTargetT>):Observable<Observable<boolean>> {
    const isAtRestMetastream = observableFrom(plansAndTargets)::map(
      planAndTarget => {
        const performerFactory = findPerformerFactory(planAndTarget);
        const performerMapKey = this._performerFactoryAndTargetSelector(
          {
            performerFactory,
            ...planAndTarget,
          }
        );

        let performer = this._performerMap.get(performerMapKey);

        if (!performer) {
          performer = performerFactory({target: planAndTarget.target});
          this._performerStream.next(performer);
        }

        return performer.addPlan(planAndTarget.plan);
      }
    );

    // Streams are lazy, so you have to subscribe to cause it to do work.
    isAtRestMetastream.subscribe();

    return isAtRestMetastream;
  }
}

// groupBy doesn't let you supply a comparison operator, so we have to be
// careful to always supply the same object to represent equivalent tuples
//
// This could probably be written in a more generic way (e.g. with a dynamic
// number of keys), but for what we need, it works.
function makeCompoundKeySelector(key1, key2) {
  const keyMap = new Map();

  return function(dict) {
    const value1 = dict[key1];
    const value2 = dict[key2];

    if (!keyMap.has(value1))
      keyMap.set(value1, new Map());

    const value1Map = keyMap.get(value1);

    if (value1Map.has(value2)) {
      return value1Map.get(value2);

    } else {
      const result = {
        [key1]: value1,
        [key2]: value2,
      };

      value1Map.set(value2, result);
      return result;
    }
  };
}

function makePerformerFactoryAndTargetSelector() {
  return makeCompoundKeySelector('performerFactory', 'target');
}
