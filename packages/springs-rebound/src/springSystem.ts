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
export let _springSystem = new SpringSystem();

import {
  MotionObservable,
  Observer,
  SpringProperties,
  Subscription,
} from 'material-motion';

function numericSpringSystem({
  enabled: enabled$,
  destination: destination$,
  initialValue: initialValue$,
  initialVelocity: initialVelocity$,
  tension: tension$,
  friction: friction$,
  threshold: threshold$,
}: SpringProperties<number>): MotionObservable<number> {
  return new MotionObservable<number>(
    (observer: Observer<number>) => {
      const spring: ReboundSpring = _springSystem.createSpring();

      const subscriptions: Array<Subscription> = [
        destination$.subscribe(spring.setEndValue),
        initialValue$.subscribe(spring.setCurrentValue),
        initialVelocity$.subscribe(spring.setVelocity),
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
        threshold$.subscribe(spring.setRestSpeedThreshold),
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
