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

import React from 'react';

// These are only imported to ensure they are registered in the
// performerFactoryRegistry.  In not-a-prototype, they'd be imported by a
// library or the application.
//
// Perhaps the performer factories should be registered by the
// library/application rather than by the performer itself.  It's a bit weird
// that importing has side effects.

import DirectManipulationPerformer from '../performers/DirectManipulationPerformer';
import TransformPerformerWeb from '../performers/TransformPerformerWeb';


import Scheduler from '../../../src/Scheduler';

export default React.createClass(
  {
    imageRef: null,
    scheduler: null,

    getInitialState() {
      return {
      };
    },

    componentDidMount() {
      this.scheduler = new Scheduler();

      this.scheduler.commit(
        [
          {
            target: this.imageRef,
            plan: {
              familyName: 'material-motion-direct-manipulation-family',
              type: 'draggable',
            },
          },
        ]
      );
    },

    render() {
      return (
        <div
          style = {
            {
              margin: 16,
            }
          }
        >
          <img
            ref = {
              (ref) => {
                this.imageRef = ref;
              }
            }
            src = '/static/images/bike.jpg'
            style = {
              {
                width: 256,
                height: 256,
                boxShadow: `
                  rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,
                  rgba(0, 0, 0, 0.137255) 0px 1px 1px 0px,
                  rgba(0, 0, 0, 0.117647) 0px 1px 3px 0px
                `,
              }
            }
          />
        </div>
      );
    },
  }
);
