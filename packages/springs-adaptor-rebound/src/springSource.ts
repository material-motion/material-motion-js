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

export type NumericDict = {
  [key: string]: number,
};

// perhaps signature should be
//
// springSource(kwargs:{ initialValue: T, destination: T } & Partial<SpringArgs<T>>)
//
// and then destructured in the body:
//
// const { initialValue, … } = { ...springDefaults, ...kwargs }

/**
 * Creates a spring and returns a stream of its interpolated values.  The
 * default spring has a tension of 342 and friction of 30.
 *
 * Currently only accepts numeric values for initialValue and destination, but
 * will eventually accept a dictionary of string:number.  Each key:value pair in
 * the dictionary will be represented by an independent spring.  If any of the
 * springs emits a value, the latest values from each should be emitted, e.g.
 * {x: 10, y: 43 }.
 *
 * Currently accepts ReadableProperty values for each argument.  Will eventually
 * support ReactiveProperty arguments, at which point the spring will begin
 * emitting new values whenever the destination changes.
 */
export function springSource<T extends number | NumericDict>({
  initialValue,
  destination,
  // Set defaults for things that are consistent across springs types
  //
  // This might need to move into `connect` when these become reactive
  // properties e.g.:
  //
  // tension: property.startWith(defaultTension).read()
  initialVelocity,
  threshold = createProperty({ initialValue: Number.EPSILON }),
  tension = createProperty({ initialValue: 342 }),
  friction = createProperty({ initialValue: 30 }),
}: SpringArgs<T>) {
  const firstInitialValue = initialValue.read();

  if (isNumber(firstInitialValue)) {
    // TypeScript doesn't seem to infer that if firstInitialValue is a number,
    // then T must be a number, so we cast the args here.
    return numericSpringSource({
      initialValue,
      destination,
      initialVelocity,
      threshold,
      tension,
      friction,
    } as SpringArgs<number>);
  } else {
    throw new Error("springSource only supports numbers.");
  }
}
export default springSource;

function numericSpringSource({
  destination: destination$,
  tension: tension$,
  friction: friction$,
  initialValue,
  initialVelocity,
  threshold,
}: SpringArgs<number>) {
  return new MotionObservable(
    (observer: MotionObserver<number>) => {
      const spring = _springSystem.createSpringWithConfig({
        tension: tension$.read(),
        friction: friction$.read(),
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

      destination$.subscribe(
        destination => {
          // Any time the destination changes, we re-initialize the starting
          // parameters.  This means initialValue needs to be backed by the same
          // property that subscribe's to the spring.
          //
          // This is an optimization for elements that are draggable (and then
          // spring to a location upon release), but is needlessly complicated
          // for other cases.
          //
          // TODO: detect if a value is constant or readable, and only reset its
          // values if it's readable
          spring.setCurrentValue(initialValue.read());
          spring.setRestSpeedThreshold(threshold.read());

          // If we don't have an author-specified override, let Rebound handle
          // tracking velocity
          if (initialVelocity) {
            spring.setVelocity(initialVelocity.read());
          }

          spring.setEndValue(destination);
        }
      );

      tension$.subscribe(
        tension => {
          spring.setSpringConfig({
            tension,
            friction: spring.getSpringConfig().friction,
          });
        }
      );

      friction$.subscribe(
        friction => {
          spring.setSpringConfig({
            tension: spring.getSpringConfig().tension,
            friction,
          });
        }
      );

      return function disconnect() {
        spring.removeListener(listener);
        spring.setAtRest();
      };
    }
  );
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}
