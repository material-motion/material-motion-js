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
  Spring,
  SpringSystem,
} from 'rebound';

import {
  MotionObservable,
  NumericSpring,
  Observer,
  State,
  Subscription,
} from 'material-motion';

// Exported so we can switch out the timing loop in unit tests
export let _reboundInternalSpringSystem = new SpringSystem();

export class NumericReboundSpring extends NumericSpring {
  value$ = new MotionObservable<number>(
    (observer: Observer<number>) => {
      const spring: Spring = _reboundInternalSpringSystem.createSpring();
      const initialVelocityInPxPerSecond$ = this.initialVelocity$.scaledBy(1000);

      let initialized = false;

      let initialValueChangedWhileDisabled = false;
      let initialVelocityChangedWhileDisabled = false;

      this.state$.write(State.AT_REST);

      spring.addListener({
        onSpringUpdate: () => {
          observer.next(
            spring.getCurrentValue()
          );
        },

        onSpringActivate: () => {
          this.state$.write(State.ACTIVE);
        },

        onSpringAtRest: () => {
          this.state$.write(State.AT_REST);
        },
      });

      // During initialization, the configuration values will be set in the
      // order they are subscribed to; hence,
      const subscriptions: Array<Subscription> = [
        // properties that configure the spring
        this.tension$.subscribe(
          (tension: number) => spring.setSpringConfig({
            tension,
            friction: spring.getSpringConfig().friction,
          })
        ),
        this.friction$.subscribe(
          (friction: number) => spring.setSpringConfig({
            tension: spring.getSpringConfig().tension,
            friction,
          })
        ),
        this.threshold$.subscribe(spring.setRestSpeedThreshold.bind(spring)),

        // properties that initialize the spring
        initialVelocityInPxPerSecond$.subscribe(
          (initialVelocity: number) => {
            if (this.enabled$.read()) {
              spring.setVelocity(initialVelocity);
            } else {
              initialVelocityChangedWhileDisabled = true;
            }
          }
        ),
        this.initialValue$.subscribe(
          (initialValue: number) => {
            if (this.enabled$.read()) {
              spring.setCurrentValue(initialValue, true);
            } else {
              initialValueChangedWhileDisabled = true;
            }
          }
        ),

        // properties that can start/stop the spring
        this.enabled$.subscribe(
          (enabled: boolean) => {
            if (initialized) {
              if (enabled) {
                // For simple cases, the spring can manage its own state;
                // however, we provide property APIs (like initialValue$) for
                // situations where it should be managed externally.
                //
                // The ability to manage this state externally shouldn't require
                // every author to do so; hence, we use dirty-checking to only
                // initialize the spring's values if the author has used these
                // features.
                //
                // There's probably a more elegant way to do this (queueing up
                // changes as they come through and then applying the most
                // recent one when enabled is set), but this is the simplest
                // quick solution.
                if (initialValueChangedWhileDisabled) {
                  spring.setCurrentValue(this.initialValue$.read());
                }

                if (initialVelocityChangedWhileDisabled) {
                  // initialVelocityInPxPerSecond$ isn't readable, so we have to
                  // scale by hand for now.
                  spring.setVelocity(1000 * this.initialVelocity$.read());
                }

                spring.setEndValue(this.destination$.read());

                initialValueChangedWhileDisabled = false;
                initialVelocityChangedWhileDisabled = false;
              } else if (!spring.isAtRest()) {
                spring.setAtRest();
              }
            }
          }
        ),
        this.destination$.subscribe(
          (destination: number) => {
            if (this.enabled$.read()) {
              spring.setEndValue(destination);
            };
          }
        ),
      ];

      initialized = true;

      return function disconnect() {
        subscriptions.forEach(
          subscription => subscription.unsubscribe()
        );
      };
    }
  )._multicast();
}
export default NumericReboundSpring;
