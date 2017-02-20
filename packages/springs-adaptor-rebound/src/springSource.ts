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
  ExperimentalMotionObservable,
} from 'material-motion-experimental-addons';

import {
  MotionObserver,
  NumericDict,
  PropertyObservable,
  ScopedReadable,
  SpringArgs,
  SpringRecord,
  State,
  StreamDict,
  Subscription,
  SubscriptionDict,
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
 */
export function springSource<T extends number>({
  destination: destination$,
  enabled: enabled$ = createProperty({ initialValue: true }),
  initialValue = 0,
  initialVelocity = 0,
  threshold = .001,
  tension = 342,
  friction = 30,
}: SpringArgs<number>): MotionObservable<SpringRecord> {
  return new ExperimentalMotionObservable(
    (observer: MotionObserver<T>) => {
      // The inputs could be primitives or ReactivePropertys of primitives.  To
      // make the rest of the logic simpler, we cast them all to
      // ReactivePropertys here.
      const tension$ = toProperty(tension);
      const friction$ = toProperty(friction);

      let subscriptions: SubscriptionDict = {};
      let latestValue: SpringRecord = {
        state: State.AT_REST,
      };

      const spring = _springSystem.createSpringWithConfig({
        tension: tension$.read(),
        friction: friction$.read(),
      });

      const listener: Listener = {
        onSpringUpdate() {
          latestValue.value = spring.getCurrentValue();
          dispatchLatestValue();
        },

        onSpringActivate() {
          latestValue.state = State.ACTIVE;
          dispatchLatestValue();
        },

        onSpringAtRest() {
          latestValue.state = State.AT_REST;
          dispatchLatestValue();
        },
      };
      spring.addListener(listener);

      spring.setCurrentValue(readValue<number>(initialValue));
      spring.setVelocity(readValue<number>(initialVelocity));

      subscriptions.destination = destination$.subscribe(
        (destination: number) => {
          initializeSpringParams();
          latestValue.destination = destination;
          spring.setEndValue(destination);
        }
      );

      subscriptions.enabled = enabled$.subscribe(
        (enabled: boolean) => {
          initializeSpringParams();
          latestValue.enabled = enabled;

          if (enabled) {
            spring.setEndValue(latestValue.destination);
          } else {
            spring.setAtRest();
          }
        }
      );

      subscriptions.tension = tension$.subscribe(
        (tension: number) => {
          latestValue.tension = tension;
          spring.setSpringConfig({
            tension,
            friction: spring.getSpringConfig().friction,
          });
        }
      );

      subscriptions.friction = friction$.subscribe(
        (friction: number) => {
          latestValue.friction = friction;
          spring.setSpringConfig({
            tension: spring.getSpringConfig().tension,
            friction,
          });
        }
      );

      return function disconnect() {
        spring.removeListener(listener);
        spring.setAtRest();

        Object.values(subscriptions).forEach(
          (subscription: Subscription) => subscription.unsubscribe()
        );
        subscriptions = {};
      };

      function dispatchLatestValue() {
        if (latestValue.destination !== undefined && latestValue.state !== undefined) {
          // The same instance of latestValue is being recycled on every frame. We
          // could clone it (e.g. `observer.next({ ...latestValue })`), but that
          // would create a bunch of garbage, so I'm avoiding doing it until
          // there's a clear, practical benefit.
          observer.next(latestValue);
        }
      }

      function initializeSpringParams() {
        // initialValue, initialVelocity, and threshold may be maintained by
        // either the author or the spring.  If the values are Readable, the
        // state is being maintained externally and the spring will be updated
        // here.  Otherwise, the spring will use its internal state.
        if (isReadable(initialValue)) {
          latestValue.initialValue = initialValue.read();
          spring.setCurrentValue(latestValue.initialValue);
        } else {
          latestValue.initialValue = spring.getCurrentValue();
        }

        if (isReadable(initialVelocity)) {
          latestValue.initialVelocity = initialVelocity.read();
          spring.setVelocity(latestValue.initialVelocity);
        } else {
          latestValue.initialVelocity = spring.getVelocity();
        }

        if (isReadable(threshold)) {
          latestValue.threshold = threshold.read();
          spring.setRestSpeedThreshold(latestValue.threshold);
        }
      }
    }
  )._remember();
}
export default springSource;

function toProperty<T>(value: T | ScopedReadable<T>): ScopedReadable<T> {
  return isReadable(value)
    ? value
    : createProperty({ initialValue: value });
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
