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
  Listener,
  Spring as ReboundSpring,
  SpringSystem,
} from 'rebound';

// Exported so we can switch out the timing loop in unit tests
export let _reboundInternalSpringSystem = new SpringSystem();

import {
  MotionObservable,
  Observer,
  Spring,
  State,
  Subscription,
} from 'material-motion';

export function numericSpringSystem({
  state,
  enabled: enabled$,
  destination: destination$,
  initialValue: initialValue$,
  initialVelocity: initialVelocity$,
  tension: tension$,
  friction: friction$,
  threshold: threshold$,
}: Spring<number>): MotionObservable<number> {
  return new MotionObservable<number>(
    (observer: Observer<number>) => {
      const spring: ReboundSpring = _reboundInternalSpringSystem.createSpring();

      state.write(State.AT_REST);

      const listener: Listener = {
        onSpringUpdate() {
          observer.next(
            spring.getCurrentValue()
          );
        },

        onSpringActivate() {
          state.write(State.ACTIVE);
        },

        onSpringAtRest() {
          state.write(State.AT_REST);
        },
      };
      spring.addListener(listener);

      // During initialization, the configuration values will be set in the
      // order they are subscribed to; hence,
      const subscriptions: Array<Subscription> = [
        // properties that configure the spring
        tension$.subscribe(
          (tension: number) => spring.setSpringConfig({
            tension,
            friction: spring.getSpringConfig().friction,
          })
        ),
        friction$.subscribe(
          (friction: number) => spring.setSpringConfig({
            tension: spring.getSpringConfig().tension,
            friction,
          })
        ),
        threshold$.subscribe(spring.setRestSpeedThreshold.bind(spring)),

        // properties that initialize the spring
        // convert px/ms to px/s before passing to Rebound
        initialVelocity$.scaledBy(1000).subscribe(spring.setVelocity.bind(spring)),
        initialValue$.subscribe(spring.setCurrentValue.bind(spring)),

        // properties that can start/stop the spring
        enabled$.subscribe(
          (enabled: boolean) => {
            if (!enabled && !spring.isAtRest()) {
              spring.setAtRest();
            }
          }
        ),
        destination$.subscribe(spring.setEndValue.bind(spring)),
      ];

      return function disconnect() {
        subscriptions.forEach(
          subscription => subscription.unsubscribe()
        );
      };
    }
  );
}
export default numericSpringSystem;
