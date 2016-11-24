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

import * as React from 'react';

import {
  pure,
} from 'recompose';

import {
  range,
} from '../utils';

export default pure(RandomClouds);
function RandomClouds({ count = 20, scale, opacity, layerRef }) {
  return (
    <div
      ref = { layerRef }
      style = {
        {
          position: 'fixed',
          top: '0px',
          left: '0px',
          opacity,
        }
      }
    >
      {
        range({ end: count }).map(
          i => (
            <div
              key = { i }
              className = 'material-icons'
              style = {
                {
                  position: 'absolute',
                  color: '#E9E9E9',
                  transform: `
                    translate(
                      ${ Math.round(Math.random() * 400 - 200) / 2 }vw,
                      ${ Math.round(Math.random() * 200) / 2 }vh
                    )

                    scale(${ scale })
                  `
                }
              }
            >
              cloud
            </div>
          )
        )
      }
    </div>
  );
}
