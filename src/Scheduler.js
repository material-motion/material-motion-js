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
 *
 *  @flow
 */

// RxJS exports each method separately to support tree shaking, but doesn't
// export defaults
import {distinctUntilChanged} from 'rxjs-es/operator/distinctUntilChanged';
import {_do as tap} from 'rxjs-es/operator/do';
import {find} from 'rxjs-es/operator/find';
import {from as observableFrom} from 'rxjs-es/observable/from';
import {groupBy} from 'rxjs-es/operator/groupBy';
import {map} from 'rxjs-es/operator/map';
import {mergeMap as flatMap} from 'rxjs-es/operator/mergeMap';
import {Observable} from 'rxjs-es/Observable';
import {partition} from 'rxjs-es/operator/partition';
import {share} from 'rxjs-es/operator/share';
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

  // RxJS's groupBy uses a Map under-the-hood to do comparisons (rather than
  // letting you specify your own).  Hence, for two keys to be equivalent, they
  // have to share the same reference; it doesn't check deep equality.
  //
  // Therefore, we store a selector of all known Performer:target pairs here, to
  // make sure for any pair this Scheduler knows about, it returns the same key.
  // We can ensure old performers are GCed by resetting this selector (thus
  // clearing its state).
  _targetAndPerformerSelector = makePerformerTargetSelector();

  _plansAndTargetsStream:Subject<PerformerI> = new Subject();
  _performerStream:Observable<PerformerI> = this._plansAndTargetsStream::flatMap(
    // Find the first Performer that can handle each {plan, target} and add it
    // to the pair.
    planAndTarget => observableFrom(Scheduler.performerRegistry)::find(
      Performer => Performer.canHandle(planAndTarget)
    )::tap(
      Performer => {
        console.assert(
          Performer !== undefined,
          planAndTarget.plan,
          `Material Motion could not find a Performer class to handle this plan.  ` +
          (
            Scheduler.performerRegistry.length === 0
              ? `To ensure all the default Performers are available, add this line to your application:\n\n` +
                `    import * as MaterialMotion from "material-motion-experiments";`
              : `If you are using a custom Performer, ensure that you've registered it with the Scheduler:\n\n` +
                `    Scheduler.registerPerformer(MyCustomerPerformerClass)`
          )
        );
      }
    )::map(
      Performer => ({...planAndTarget, Performer})
    )

  // Then, turn the stream of {plan, target, Performer} into streams of
  // {Performer, target}: [...plans]
  )::groupBy(
    this._targetAndPerformerSelector,
    planTargetAndPerformer => planTargetAndPerformer.plan

  // and make a new performer for every {Performer, target}
  )::map(
    plansStreamByTargetAndPerformer => {
      const {
        target,
        Performer,
      } = plansStreamByTargetAndPerformer.key;

      const performer = new Performer({target});

      // Finally, add every plan on this stream to the performer we just made
      plansStreamByTargetAndPerformer.subscribe(
        plan => {
          performer.addPlan(plan);
        }
      );

      return performer;
    }

  // Every time we pull a plan through this stream, it makes a new performer.
  // Therefore, we're using `share` to ensure we only pull each one through
  // once.
  )::share();

  // If we get an equal number of false and trues on each
  // performer.isAtRestStream, every performer has come to rest; therefore, the
  // scheduler is at rest.
  _isAtRestStream:Observable = areStreamsBalanced(
    ...(
      // Make sure we don't double-count, even if a performer sends more events
      // than it should.
      this._performerStream::flatMap(
          performer => performer.isAtRestStream::distinctUntilChanged(
        )::skipWhile(
          performerIsAtRest => performerIsAtRest === true
        )
      )::partition(
        value => value === true
      )
    )
  )::distinctUntilChanged()::startWith(true);

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

  commit(plansAndTargets:Iterable<PlanAndTargetT>) {
    for (const planAndTarget of plansAndTargets) {
      this._plansAndTargetsStream.next(planAndTarget);
    }
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

function makePerformerTargetSelector() {
  return makeCompoundKeySelector('Performer', 'target');
}
