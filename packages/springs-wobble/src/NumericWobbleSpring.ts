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
  PartialSpringConfig,
  Spring,
} from 'wobble';

import {
  MotionObservable,
  NumericSpring,
  Observer,
  State,
  Subscription,
} from 'material-motion';

export class NumericWobbleSpring extends NumericSpring {
  value$ = new MotionObservable<number>(
    (observer: Observer<number>) => {
      const spring: Spring = new Spring();
      const updateSpringConfig = spring.updateConfig.bind(spring);

      let initialized = false;

      let initialValueChangedWhileDisabled = false;
      let initialVelocityChangedWhileDisabled = false;

      this.state$.write(State.AT_REST);

      spring.onStart(
        () => {
          this.state$.write(State.ACTIVE);
        }
      );

      spring.onUpdate(
        () => {
          observer.next(spring.currentValue);
        }  
      );  

      spring.onStop(
        () => {
          this.state$.write(State.AT_REST);
        }
      );

      // During initialization, the configuration values will be set in the
      // order they are subscribed to; hence,
      const subscriptions: Array<Subscription> = [
        // properties that configure the spring
        this.stiffness$._map(toValueWithKey('stiffness')).subscribe(updateSpringConfig),
        this.damping$._map(toValueWithKey('damping')).subscribe(updateSpringConfig),
        this.threshold$._map(toValueWithKey('restDisplacementThreshold')).subscribe(updateSpringConfig),

        // properties that initialize the spring
        this.initialVelocity$.subscribe(
          (initialVelocity: number) => {
            if (this.enabled$.read()) {
              updateSpringConfig({ initialVelocity });
            } else {
              initialVelocityChangedWhileDisabled = true;
            }
          }
        ),
        this.initialValue$.subscribe(
          (initialValue: number) => {
            // We need to figure out what the right interplay is between
            // `initialValue` and `value$`.  It's probably more convenient for
            // an author if changes to `initialValue` are passed through to
            // `value$`. This means you can do something like
            // `spring.value$.subscribe(location$)` and trust `location$` is
            // always up-to-date.  However, it's unclear how that would affect
            // `state$`.  Should `state$` go at_rest -> active -> at_rest every
            // time something touches `initialValue`?  Should `value$` be able
            // to dispatch `initialValue$` without touching `value$`?  Should we
            // require authors to worry about connecting the two?
            //
            // Punting on this for now and forcing authors to deal with it.
            if (this.enabled$.read()) {
              updateSpringConfig({ fromValue: initialValue });
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

                const springConfig: PartialSpringConfig = {
                  toValue: this.destination$.read(),
                };

                if (initialValueChangedWhileDisabled) {
                  springConfig.fromValue = this.initialValue$.read();
                }

                if (initialVelocityChangedWhileDisabled) {
                  springConfig.initialVelocity = this.initialVelocity$.read();
                }

                updateSpringConfig(springConfig);
                spring.start();

                initialValueChangedWhileDisabled = false;
                initialVelocityChangedWhileDisabled = false;
              } else if (spring.normalizedVelocity !== 0) {
                spring.stop();
              }
            }
          }
        ),

        this.destination$.subscribe(
          (destination: number) => {
            if (this.enabled$.read()) {
              updateSpringConfig({ toValue: destination });
              spring.start();
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
export default NumericWobbleSpring;

function toValueWithKey<T>(key: string) {
  return function (value: T) {
    return {
      [key]: value,
    };
  };
}
