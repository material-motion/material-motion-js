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
  MotionObserver,
  PropertyObservable,
  ScopedReadable,
  SpringArgs,
  State,
  createProperty,
} from 'material-motion-streams';

import {
  Listener,
  SpringSystem,
} from 'rebound';

// Exported so we can switch out the timing loop in unit tests
export let _springSystem = new SpringSystem();

/**
 * Creates a spring and returns a stream of its interpolated values.
 *
 * `destination`, `tension`, and `friction` will update the spring as soon as
 * they change.
 *
 * If `initialValue`, `initialVelocity`, or `threshold` have `read` methods,
 * they will be used to update the spring whenever `destination` changes.
 * Otherwise, they will only be used once, during spring creation.
 *
 * The values emitted will be the same type as the first value in the
 * destination stream.
 */
export function springSource<T extends number | NumericDict>({
  destination,
  initialValue,
  initialVelocity = 0,
  threshold = Number.EPSILON,
  tension = 342,
  friction = 30,
}: { destination: T } & Partial<SpringArgs<T>>) {
  const firstDestination = 0; //destination.read();

  if (isNumber(firstDestination)) {
    return numericSpringSource({
      destination,
      initialValue: initialValue || 0,
      initialVelocity,
      threshold,
      tension,
      friction,

    // TypeScript doesn't seem to infer that if firstDestination is a number,
    // then T must be a number, so we cast the args here.
    } as SpringArgs<number>);
  } else {
    /* Currently only accepts numeric values for initialValue and destination,
     * but will eventually accept a dictionary of string:number.  Each key:value
     * pair in the dictionary will be represented by an independent spring.  If
     * any of the springs emits a value, the latest values from each should be
     * emitted, e.g. {x: 10, y: 43 }.
     *
     * This will likely be achieved with something like:
     *
     *   combineLatest(x$, y$, z$).map([x, y, z] => ({ x, y, z })).debounce()
     *
     * Care will need to be taken to ensure that `state` is handled
     * appropriately.
     */
    throw new Error("springSource only supports numbers.");
  }
}
export default springSource;

function numericSpringSource({
  destination: destination$,
  tension,
  friction,
  initialValue,
  initialVelocity,
  threshold,
}: SpringArgs<number>) {
  return new MotionObservable(
    (observer: MotionObserver<number>) => {
      const spring = _springSystem.createSpringWithConfig({
        tension: readValue<number>(tension),
        friction: readValue<number>(friction),
      });

      const listener: Listener = {
        onSpringUpdate() {
          observer.next(spring.getCurrentValue());
        },

        onSpringActivate() {
          observer.state(State.ACTIVE);
        },

        onSpringAtRest() {
          observer.state(State.AT_REST);
        },
      };

      observer.state(State.AT_REST);
      spring.addListener(listener);

      spring.setCurrentValue(readValue(initialValue));
      spring.setVelocity(readValue(initialVelocity));

      destination$.subscribe(
        (destination: number) => {
          // initialValue, initialVelocity, and threshold may be maintained by
          // either the author or the spring.  If the values are Readable, the
          // state is being maintained externally and the spring will be updated
          // here.  Otherwise, the spring will use its internal state.
          callSpringMethodsWithReadableValues({
            'setCurrentValue': initialValue,
            'setVelocity': initialVelocity,
            'setRestSpeedThreshold': threshold,
          });

          spring.setEndValue(destination);
        }
      );

      if (isReadable(tension)) {
        const tension$: PropertyObservable<number> = tension;

        tension$.subscribe(
          (tension: number) => {
            spring.setSpringConfig({
              tension,
              friction: spring.getSpringConfig().friction,
            });
          }
        );
      }

      if (isReadable(friction)) {
        const friction$: PropertyObservable<number> = friction;

        friction$.subscribe(
          (friction: number) => {
            spring.setSpringConfig({
              tension: spring.getSpringConfig().tension,
              friction,
            });
          }
        );
      }

      return function disconnect() {
        spring.removeListener(listener);
        spring.setAtRest();
      };

      function callSpringMethodsWithReadableValues(valuesByMethodName: {[methodName: string]: any }) {
        Object.entries(valuesByMethodName).forEach(
          ([ value, methodName ]) => {
            if (isReadable(value)) {
              const method = (spring as any)[methodName];
              method(readValue(value));
            }
          }
        );
      }
    }
  );
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isReadable<T>(value: T | ScopedReadable<T>): value is ScopedReadable<T> {
  return (value as ScopedReadable<T>).read !== undefined;
}

function readValue<T>(readableOrPrimitive: T | ScopedReadable<T>): T {
  return isReadable(readableOrPrimitive)
    ? readableOrPrimitive.read()
    : readableOrPrimitive;
}

export type NumericDict = {
  [key: string]: number,
};
