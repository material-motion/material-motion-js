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

/*  Visualization ideas:
 *  - Tap to move to your finger's location
 *  - <input> tags to pass arbitrary parameters into <input /> tags that feed
 *    expressions.
 *  - Radio groups for each {move, rotate, scale, fade}, each in its own tab.
 *  - Similar to radio groups, but the user can swipe between items to select
 */

import React from 'react';

import {
  TimeStream,
} from '../../../src/observables';

export default React.createClass(
  {
    getInitialState() {
      return {
        subscriptions: [],
        timeStream: new TimeStream(),
      };
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
          <button onClick = { this.subscribe }>
            Subscribe
          </button>
          <button onClick = { this.unsubscribe }>
            Unsubscribe
          </button>
        </div>
      );
    },

    subscribe() {
      const {
        subscriptions,
        timeStream,
      } = this.state;

      subscriptions.push(
        timeStream.subscribe(::console.log)
      );
    },

    unsubscribe() {
      const {
        subscriptions,
      } = this.state;

      subscriptions.shift().unsubscribe();
    },
  }
);
