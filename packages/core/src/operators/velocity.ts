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
  MotionObservable,
} from '../observables/proxies';

import {
  createPlucker,
} from './pluck';

import {
  Constructor,
  MotionTimestampable,
  MotionWindowable,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Point2D,
  Timestamped,
} from '../types';

import {
  isPoint2D,
} from '../typeGuards';

export interface MotionVelocityMeasurable<T> {
  velocity<U extends T & (Point2D | number)>(pulse?: MotionTimestampable<any> & Observable<any>): ObservableWithMotionOperators<U>;
}

// These constants are exported for testing.
export const MAXIMUM_AGE = 250;
export const MAXIMUM_INCOMING_DISPATCHES = 5;

// These values are borrowed from Matthew Bolohan's drag implementation (which
// presumes the units are "px / ms").  If we make this more generic, e.g. to
// support rotational velocity, these will need to be configurable.
export const MAXIMUM_VELOCITY = 5;
export const DEFAULT_VELOCITY = 1;

type NumericPlucker = (value: any) => number;

const pluckTimestamp = createPlucker('timestamp');
const pluckValue = createPlucker('value');
const pluckX = createPlucker('value.x');
const pluckY = createPlucker('value.y');

export function withVelocity<T, S extends Constructor<Observable<T> & MotionTimestampable<T> & MotionWindowable<T>>>(superclass: S): S & Constructor<MotionVelocityMeasurable<T>> {
  return class extends superclass implements MotionVelocityMeasurable<T> {
    /**
     * Computes the velocity of an incoming stream and dispatches the result.
     * Velocity's denominator is in milliseconds; if the incoming stream is
     * measured in pixels, the resulting stream will be in pixels / millisecond.
     *
     * Velocity is computed by watching the trailing 250ms of up to 5 dispatches
     * and measuring the distance between the longest pair of events moving in
     * the current direction.  This approach is more resiliant to anomolous data
     * than a simple (nextPosition - prevPosition) / (nextTime - prevTime).
     *
     * If `pulse` is supplied, `velocity(pulse)` will only dispatch values when
     * `pulse` dispatches a value.  This is useful for ensuring that velocity
     * is only calculated when it will be used.
     */
    velocity<U extends T & (Point2D | number)>(pulse: MotionTimestampable<any> & Observable<any> = this): ObservableWithMotionOperators<U> {
      return new MotionObservable(
        (observer: Observer<U>) => {
          let records: Array<Timestamped<T>> = [];

          const trailingSubscription = this.timestamp()._slidingWindow({ size: MAXIMUM_INCOMING_DISPATCHES }).subscribe(
            nextRecords => records = nextRecords
          );

          const pulseSubscription = pulse.timestamp().subscribe(
            ({ timestamp: now }) => {
              const recentRecords = records.filter(
                ({ timestamp }) => now - timestamp < MAXIMUM_AGE
              );

              if (records.length && isPoint2D(records[0].value)) {
                observer.next({
                  x: calculateVelocity(recentRecords, pluckX, pluckTimestamp),
                  y: calculateVelocity(recentRecords, pluckY, pluckTimestamp),
                } as U);
              } else {
                observer.next(
                  calculateVelocity(recentRecords, pluckValue, pluckTimestamp) as U
                );
              }
            }
          );

          return () => {
            trailingSubscription.unsubscribe();
            pulseSubscription.unsubscribe();
          };
        }
      );
    }
  };
}

/**
 * Computes velocity using the oldest value that's moving in the current
 * direction.
 *
 * It walks backwards over an array of records and makes sure that each segment
 * is going in the same direction (incrementing or decrementing) as the last
 * segment.  When it detects a change in direction (or has checked the whole
 * array), it returns the velocity between the newest value and the oldest
 * moving in the same direction.
 */
function calculateVelocity(records: Array<{}>, pluckValue: NumericPlucker, pluckTimestamp: NumericPlucker): number {
  if (records.length < 2) {
    return 0;
  }

  let velocity: number = 0;

  // Backing over the array pairwise, `next` is the newer value and `prev` is
  // the older value.  `last` is always the final value.

  const lastIndex = records.length - 1;
  const lastValue = pluckValue(records[lastIndex]);
  const lastTimestamp = pluckTimestamp(records[lastIndex]);

  let prevValue: number;
  let prevTimestamp: number;
  let nextValue: number = lastValue;
  let nextTimestamp: number = lastTimestamp;

  for (let i = lastIndex - 1; i >= 0; i--) {
    prevValue = pluckValue(records[i]);
    prevTimestamp = pluckTimestamp(records[i]);

    const averageVelocity = (lastValue - prevValue) / (lastTimestamp - prevTimestamp);
    const pairwiseVelocity = (nextValue - prevValue) / (nextTimestamp - prevTimestamp);

    if (velocity !== 0 && pairwiseVelocity > 0 !== velocity > 0) {
      break;
    } else {
      velocity = averageVelocity;
    }

    nextValue = prevValue;
    nextTimestamp = prevTimestamp;
  }

  if (Math.abs(velocity) > MAXIMUM_VELOCITY) {
    // If there isn't enough data to trust our accuracy (perhaps the main thread
    // was blocked), use the default velocity.

    const direction = velocity / Math.abs(velocity);

    if (records.length < 3) {
      velocity = direction * DEFAULT_VELOCITY;
    } else {
      velocity = direction * MAXIMUM_VELOCITY;
    }
  }

  return velocity;
}
