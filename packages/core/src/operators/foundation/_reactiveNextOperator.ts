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
} from '../../observables/proxies';

import {
  isObservable
} from '../../typeGuards';

import {
  Constructor,
  NextChannel,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  ReactiveNextOperation,
  Subscription,
} from '../../types';

export interface MotionReactiveNextOperable<T> extends Observable<T> {
  _reactiveNextOperator<U>(operation: ReactiveNextOperation<T, U>, ...args: Array<any>): ObservableWithMotionOperators<U>;
}

export function withReactiveNextOperator<T, S extends Constructor<Observable<T>>>(superclass: S): S & Constructor<MotionReactiveNextOperable<T>> {
  return class extends superclass implements MotionReactiveNextOperable<T> {
    /**
     * Similar to `_nextOperator`, but listens for values not just from
     * upstream, but also on any arguments it receives.
     *
     * It calls `operation` with the most recent values from upstream and from
     * the other arguments.  Arguments that aren't reactive will be passed
     * through as-they-are.  Arguments that are reactive will cause `operation`
     * to be called again for each value they dispatch.
     *
     * `_reactiveNextOperator` will not call `operation` until it has received
     * a value from every argument it is subscribed to.
     */
    _reactiveNextOperator<U>(operation: ReactiveNextOperation<T, U>, ...args: Array<any>): ObservableWithMotionOperators<U> {
      return new MotionObservable<U>(
        (observer: Observer<U>) => {
          const boundNext: NextChannel<U> = observer.next.bind(observer);

          const subscriptions: Array<Subscription> = [];
          const values: Array<any> = [];
          let valueReceived = false;
          let argumentsReceivedCount = 0;

          subscriptions[0] = this.subscribe(
            (value: T) => {
              valueReceived = true;
              values[0] = value;
              dispatch();
            }
          );

          args.forEach(
            (argument: any, i: number) => {
              // save 0 for the upstream value
              const index = i + 1;

              let received = false;

              if (isObservable(argument)) {
                subscriptions[index] = argument.subscribe(
                  (value: any) => {
                    // keep track of the number of received arguments, so we
                    // know when it's time to dispatch
                    if (!received) {
                      argumentsReceivedCount++;
                    }
                    received = true;

                    values[index] = value;
                    dispatch();
                  }
                );

              } else {
                argumentsReceivedCount++;
                values[index] = argument;
                dispatch();
              }
            }
          );

          function dispatch() {
            if (valueReceived && argumentsReceivedCount === args.length) {
              operation(boundNext, ...values);
            }
          }

          return () => {
            subscriptions.forEach(
              subscription => subscription.unsubscribe()
            );
          };
        }
      );
    }
  };
}
