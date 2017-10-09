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
} from './observables/proxies';

import {
  createPlucker,
} from './operators/pluck';

import {
  Constructor,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Point2D,
  Timestamped,
} from './types';

import {
  isPoint2D,
} from './typeGuards';

// These constants are exported for testing.
export const MAXIMUM_AGE = 250;
export const MAXIMUM_INCOMING_DISPATCHES = 5;

type NumericPlucker = (value: any) => number;

const pluckTimestamp = createPlucker('timestamp');
const pluckValue = createPlucker('value');
const pluckX = createPlucker('value.x');
const pluckY = createPlucker('value.y');

export type GetVelocity$Args<U extends number | Point2D> = {
  value$: ObservableWithMotionOperators<U>,
  pulse$: ObservableWithMotionOperators<any>,
  maximumVelocity?: number,
  defaultVelocity?: number,
};

/**
 * Computes the velocity of an incoming stream and emits the result. Velocity's
 * denominator is in milliseconds; if the incoming stream is measured in pixels,
 * the resulting stream will be in pixels / millisecond.
 *
 * Velocity is computed by watching the trailing 250ms of up to 5 emissions and
 * measuring the distance between the longest pair of events moving in the
 * current direction.  This approach is more resiliant to anomolous data than a
 * simple (nextPosition - prevPosition) / (nextTime - prevTime).
 *
 * If `pulse$` is supplied, `velocity(pulse$)` will only emit values when
 * `pulse$` emits a value.  This is useful for ensuring that velocity is only
 * calculated when it will be used.
 */
export function getVelocity$<U extends number | Point2D>({
  value$,
  pulse$,

  // These values are borrowed from Matthew Bolohan's drag implementation (which
  // presumes the units are "px / ms").
  maximumVelocity = 5,
  defaultVelocity = 1,
}: GetVelocity$Args<U>): ObservableWithMotionOperators<U> {
  return new MotionObservable(
    (observer: Observer<U>) => {
      let records: Array<Timestamped<U>> = [];

      const trailingSubscription = value$.timestamp()._slidingWindow({ size: MAXIMUM_INCOMING_DISPATCHES }).subscribe(
        nextRecords => records = nextRecords
      );

      const pulseSubscription = pulse$.timestamp().subscribe(
        ({ timestamp: now }) => {
          const recentRecords = records.filter(
            ({ timestamp }) => now - timestamp < MAXIMUM_AGE
          );

          if (records.length && isPoint2D(records[0].value)) {
            observer.next({
              x: calculateVelocity<Timestamped<U>>({ records: recentRecords, pluckValue: pluckX, pluckTimestamp, maximumVelocity, defaultVelocity }),
              y: calculateVelocity<Timestamped<U>>({ records: recentRecords, pluckValue: pluckY, pluckTimestamp, maximumVelocity, defaultVelocity }),
            } as U);
          } else {
            observer.next(
              calculateVelocity<Timestamped<U>>({ records: recentRecords, pluckValue, pluckTimestamp, maximumVelocity, defaultVelocity }) as U
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
};

type CalculateVelocityArgs<T> = {
  records: Array<T>,
  pluckValue: NumericPlucker,
  pluckTimestamp: NumericPlucker,
  maximumVelocity: number,
  defaultVelocity: number,
};

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
function calculateVelocity<T>({ records, pluckValue, pluckTimestamp, maximumVelocity, defaultVelocity }: CalculateVelocityArgs<T>): number {
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

  if (Math.abs(velocity) > maximumVelocity) {
    // If there isn't enough data to trust our accuracy (perhaps the main thread
    // was blocked), use the default velocity.

    const direction = velocity / Math.abs(velocity);

    if (records.length < 3) {
      velocity = direction * defaultVelocity;
    } else {
      velocity = direction * maximumVelocity;
    }
  }

  return velocity;
}
