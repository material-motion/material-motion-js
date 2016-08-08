/** @license
 *  Copyright 2016 The Material Motion Authors. All Rights Reserved.
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
 *
 *  @flow
 */

// TODO: types

// Using performer factories to be more agnostic about class-based Performers vs
// higher-order functions (and to make the capitalization of an array of
// Performer classes simpler).
//
// There's still plenty of thinking to do to decide what a functional Performer
// would be and how concepts like isAtRest fit in.

let performerFactoryRegistry = [];

export function registerPerformerFactory(performerFactory) {
  performerFactoryRegistry.push(performerFactory);
}

export function findPerformerFactory(planAndTarget) {
  if (performerFactoryRegistry.length === 0) {
    throw new Error(
`Your performerFactory registry is empty!
To ensure all the default Performers are available, add this line to your application:

    import * as MaterialMotion from 'material-motion-experiments';
`
    );
  }

  for (performerFactory of performerFactoryRegistry) {
    if (performerFactory.canHandle(planAndTarget)) {
      return performerFactory;
    }
  }

  throw new Error(
`Material Motion could not find a performer factory to handle this plan:

${ JSON.stringify(planAndTarget.plan) }

If you are using a custom Performer, ensure that you've registered its factory:

    import {registerPerformerFactory} from 'material-motion-experiments/performerFactoryRegistry';

    registerPerformerFactory(factoryForMyCustomerPerformer)
`
  );
}

export function resetRegistry(newRegistry) {
  if (newRegistry) {
    performerFactoryRegistry = newRegistry;

  } else {
    throw new Error(`No default registry is defined`);
  }
}
