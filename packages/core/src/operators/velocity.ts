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
  createPlucker,
} from './pluck';

import {
  Constructor,
  MotionNextOperable,
  MotionTimestampable,
  MotionWindowable,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
  Timestamped,
} from '../types';

import {
  isPoint2D,
} from '../typeGuards';

export interface MotionVelocityMeasurable<T> {
  velocity(pulse?: MotionTimestampable<T> & Observable<any>): ObservableWithMotionOperators<T>;
}

const MAXIMUM_AGE = 250;
const MAXIMUM_INCOMING_DISPATCHES = 5;
const MAXIMUM_VELOCITY = 5;
const DEFAULT_VELOCITY = 1;

type NumericPlucker = (value: any) => number;

const pluckTimestamp = createPlucker('timestamp') as any as NumericPlucker;
const pluckValue = createPlucker('value') as any as NumericPlucker;
const pluckX = createPlucker('value.x') as any as NumericPlucker;
const pluckY = createPlucker('value.y') as any as NumericPlucker;

export function withVelocity<T, S extends Constructor<MotionNextOperable<T> & MotionTimestampable<T> & MotionWindowable<T>>>(superclass: S): S & Constructor<MotionVelocityMeasurable<T>> {
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
    velocity(pulse: MotionTimestampable<T> & Observable<any> = this): ObservableWithMotionOperators<T> {
      return this.timestamp().slidingWindow(MAXIMUM_INCOMING_DISPATCHES)._nextOperator<T>(
        (records: Array<Timestamped<T>>, dispatch: NextChannel<T>) => {
          pulse.timestamp().subscribe(
            ({ timestamp: now }) => {
              const recentRecords = records.filter(
                ({ timestamp }) => now - timestamp < MAXIMUM_AGE
              );

              if (isPoint2D(records[0].value)) {
                dispatch({
                  x: calculateVelocity(recentRecords, pluckX, pluckTimestamp),
                  y: calculateVelocity(recentRecords, pluckY, pluckTimestamp),
                });
              } else {
                dispatch(
                  calculateVelocity(recentRecords, pluckValue, pluckTimestamp)
                );
              }
            }
          );
        }
      );
    }
  };
}

/**
 * Computes velocity using the oldest value that's moving in the current
 * direction.
 */
function calculateVelocity(records: Array<{}>, pluckValue: NumericPlucker, pluckTimestamp: NumericPlucker): number {
  if (!records.length) {
    return 0;
  }

  const lastIndex = records.length - 1;
  let velocity: number = 0;

  const lastValue = pluckValue(records[lastIndex]);
  const lastTimestamp = pluckTimestamp(records[lastIndex]);

  for (let i = lastIndex - 1; i >= 0; i--) {
    const thisVelocity = (lastValue - pluckValue(records[i])) /
                         (lastTimestamp - pluckTimestamp(records[i]));

    if (thisVelocity > 0 === velocity > 0 || !velocity) {
      velocity = thisVelocity;
    }
  }

  if (Math.abs(velocity) > MAXIMUM_VELOCITY) {
    // If there isn't enough data to trust our accuracy (perhaps the main thread
    // was blocked), use the default velocity.
    if (records.length < 3) {
      velocity = DEFAULT_VELOCITY;
    } else {
      velocity = MAXIMUM_VELOCITY;
    }
  }

  return velocity;
}
