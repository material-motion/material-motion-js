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
import {find} from 'rxjs-es/operator/find';
import {from as observableFrom} from 'rxjs-es/observable/from';
import {groupBy} from 'rxjs-es/operator/groupBy';
import {map} from 'rxjs-es/operator/map';
import {mergeMap as flatMap} from 'rxjs-es/operator/mergeMap';
import {partition} from 'rxjs-es/operator/partition';
import {Subject} from 'rxjs-es/Subject';
import {skipWhile} from 'rxjs-es/operator/skipWhile';
import {startWith} from 'rxjs-es/operator/startWith';

import {
  areStreamsBalanced,
} from './observables';

import type {
  PerformerI,
  PlanAndTargetT,
} from './Performer';

export default class Scheduler {
  static performerRegistry:Class<PerformerI>[] = [];

  static registerPerformer(Performer:Class<PerformerI>) {
    Scheduler.performerRegistry = [
      ...Scheduler.performerRegistry,
      Performer,
    ];
  }

  _performerStream:Subject<PerformerI> = new Subject();

  // RxJS's groupBy uses a Map under-the-hood to do comparisons (rather than
  // letting you specify your own).  Hence, for two keys to be equivalent, they
  // have to share the same reference (e.g. it doesn't check deep equality).
  //
  // Therefore, we store a selector of all known Performer:target pairs here, to
  // make sure for any pair this Scheduler knows about, it returns the same key.
  _targetAndPerformerSelector = makeCompoundKeySelector('Performer', 'target');

  _isIdleStream:Observable = areStreamsBalanced(
    ...(
      this._performerStream::flatMap(
        performer => performer.isIdleStream::distinctUntilChanged()::skipWhile(
          performerIsIdle => performerIsIdle === true
        )
      )::partition(
        value => value === true
      )
    )
  )::distinctUntilChanged()::startWith(true);

  get isIdleStream():Observable {
    return this._isIdleStream;
  }

  get isIdle():boolean {
    return this._isIdle;
  }

  constructor() {
    // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/46/):
    // Either implement dispose or kill `isIdle` and just use `isIdleStream`
    this._isIdleSubscription = this._isIdleStream.subscribe(
      isIdle => {
        this._isIdle = isIdle;
      }
    );
  }

  // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/11):
  // Use a Subject to compose each performer's active streams and deduce if
  // we're still active

  // Trying my hand at implementing this with Observables, both to keep the
  // overall library size down and because Observables will probably be a good
  // solution for things like maintaining and notifying subscribers of changes
  // to isIdle.
  //
  // This could likely be written in an easier-to-follow (and perhaps easier-to-
  // maintain) way with something like Immutable or lodash.
  commit(plansAndTargets:Iterable<PlanAndTargetT>) {
    // Observable streams are like async code in that the infect everything they
    // touch.  Even if you know the Observable will resolve synchronously, I
    // don't know of a way to marshall a result back from an Rx stream back to
    // the caller (like Immutable's collection.toJS())
    //
    // That doesn't matter here (since `commit` doesn't return anything), but
    // it's good to understand.
    observableFrom(
      plansAndTargets

    // This following block returns a new stream of 1 item for each
    // PlanAndTargetT - the first Performer that says it knows how to handle
    // that PlanAndTargetT.  If we used `map` here, we'd have a two-dimensional
    // stream (a stream of 1-item streams).  Instead, we use `flatMap`, which
    // takes the values emitted by the inner streams and publishes them on the
    // main stream.
    )::flatMap(
      planAndTarget => observableFrom(Scheduler.performerRegistry)::find(
        Performer => Performer.canHandle(planAndTarget)
      )::map(
        Performer => ({...planAndTarget, Performer})
      )

    // Now take the stream of {plan, target, Performer} and turn it into streams
    // of {Performer, target}: [...plans]
    )::groupBy(
      this._targetAndPerformerSelector,
      planTargetAndPerformer => planTargetAndPerformer.plan
    )::map(
      plansStreamByTargetAndPerformer => {
        const {
          target,
          Performer,
        } = plansStreamByTargetAndPerformer.key;

        const performer = new Performer({target});

        // add every plan on this stream to the performer we just made
        plansStreamByTargetAndPerformer.subscribe(
          plan => performer.addPlan(plan)
        );

        return performer;
      }
    ).subscribe(
      performer => {
        // In the interests of doing the simplest-thing-that-works, I'm just
        // subscribing to the pipeline I already have and forwarding the
        // performers to _performerStream so isIdleStream can use them.
        //
        // Next on my list is refactoring this whole method.
        // TODO(https://github.com/material-motion/material-motion-experiments-js/issues/41)

        this._performerStream.next(performer);
      }
    );
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
