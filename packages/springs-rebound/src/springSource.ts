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
  MotionObservable,
  MotionObserver,
  NumericDict,
  Point2D,
  PropertyObservable,
  ScopedReadable,
  SpringArgs,
  SpringRecord,
  State,
  StreamDict,
  Subscription,
  SubscriptionDict,
  createProperty,
} from 'material-motion';

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
export function springSource<T extends (number | Point2D)>({
  destination,
  initialValue,
  initialVelocity,
  enabled = createProperty({ initialValue: true }),
  threshold = .001,
  tension = 342,
  friction = 30,
}: SpringArgs<T>): MotionObservable<SpringRecord<T>> {
  const firstDestination: T = destination.read();

  if (isNumber(firstDestination)) {
    return numericSpringSource({
      destination,
      initialValue,
      initialVelocity,
      enabled,
      threshold,
      tension,
      friction,
    });

  } else {
    return point2DSpringSource({
      destination,
      initialValue,
      initialVelocity,
      enabled,
      threshold,
      tension,
      friction,
    });
  }
}
export default springSource;

/**
 * A springSource where `destination`, `initialValue`, and `initialVelocity` are
 * each 2-dimensional points.
 */
export function point2DSpringSource<T extends Point2D>({
  destination,
  enabled,
  initialValue = { x: 0, y: 0 },
  initialVelocity = { x: 0, y: 0 },
  threshold,
  tension,
  friction,
}: SpringArgs<Point2D>): MotionObservable<SpringRecord<Point2D>> {
  return new ExperimentalMotionObservable(
    (observer: MotionObserver<T>) => {
      let latestXValue: Partial<SpringRecord<number>> = {};
      let latestYValue: Partial<SpringRecord<number>> = {};

      let initialXValue: number | ScopedReadable<number>;
      let initialYValue: number | ScopedReadable<number>;
      let initialYVelocity: number | ScopedReadable<number>;
      let initialXVelocity: number | ScopedReadable<number>;

      // There's lots of casting to ExperimentalMotionObservable, because that's
      // where `read` currently lives.  When ExperimentalMotionObservable is
      // folded into MotionObservable, we ought to be able to remove most of
      // these.  (If properties exposed operators, we could remove all of them.)

      if (isReadable(initialValue)) {
        const initialValue$: ExperimentalMotionObservable<Point2D> = ExperimentalMotionObservable.from(initialValue);
        initialXValue = ExperimentalMotionObservable.from(initialValue$.pluck('x')._remember());
        initialYValue = ExperimentalMotionObservable.from(initialValue$.pluck('y')._remember());
      } else {
        initialXValue = initialValue.x;
        initialYValue = initialValue.y;
      }

      if (isReadable(initialVelocity)) {
        const initialVelocity$: ExperimentalMotionObservable<Point2D> = ExperimentalMotionObservable.from(initialVelocity);
        initialXVelocity = ExperimentalMotionObservable.from(initialVelocity$.pluck('x')._remember());
        initialYVelocity = ExperimentalMotionObservable.from(initialVelocity$.pluck('y')._remember());
      } else {
        initialXVelocity = initialVelocity.x;
        initialYVelocity = initialVelocity.y;
      }

      const xSpring = numericSpringSource({
        destination: ExperimentalMotionObservable.from(destination).pluck('x'),
        enabled,
        initialValue: initialXValue,
        initialVelocity: initialXVelocity,
        threshold,
        tension,
        friction,
      });

      const ySpring = numericSpringSource({
        destination: ExperimentalMotionObservable.from(destination).pluck('y'),
        enabled,
        initialValue: initialYValue,
        initialVelocity: initialYVelocity,
        threshold,
        tension,
        friction,
      });

      const xSubscription: Subscription = xSpring.subscribe(
        (value: SpringRecord<number>) => {
          latestXValue = value;
          dispatchLatestValue();
        }
      );

      const ySubscription: Subscription = ySpring.subscribe(
        (value: SpringRecord<number>) => {
          latestYValue = value;
          dispatchLatestValue();
        }
      );

      function dispatchLatestValue() {
        if (latestXValue.destination !== undefined && latestYValue.destination !== undefined) {
          observer.next({
            value: {
              x: latestXValue.value,
              y: latestYValue.value,
            },
            state: initialXValue.state | initialYValue.state,
            destination: {
              x: latestXValue.destination,
              y: latestYValue.destination,
            },
            initialVelocity: {
              x: latestXValue.initialVelocity,
              y: latestYValue.initialVelocity,
            },
            initialValue: {
              x: latestXValue.initialValue,
              y: latestYValue.initialValue,
            },
            enabled: latestXValue.enabled,
            tension: latestXValue.tension,
            friction: latestXValue.friction,
            threshold: latestXValue.threshold,
          });
        }
      }

      return function disconnect() {
        xSubscription.unsubscribe();
        ySubscription.unsubscribe();
      };
    }
  )._debounce();
}

/**
 * A springSource where `destination`, `initialValue`, and `initialVelocity` are
 * each numbers.
 */
export function numericSpringSource<T extends number>({
  destination: destination$,
  enabled: enabled$,
  initialValue = 0,
  initialVelocity = 0,
  threshold,
  tension,
  friction,
}: SpringArgs<number>): MotionObservable<SpringRecord<number>> {
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

      dispatchLatestValue();

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
