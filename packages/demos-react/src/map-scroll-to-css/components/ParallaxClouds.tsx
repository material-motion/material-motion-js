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
import { Runtime } from 'material-motion-runtime';

import MapScrollPositionToCSSValuePlan from '../MapScrollPositionToCSSValuePlan';
import RandomClouds from './RandomClouds';
import { range } from '../utils';

export default class ParallaxClouds extends React.Component {
  runtime = new Runtime();
  _layers = [];
  _layerCount = 20;

  // A ref gives you a handle to the actual DOM element that React renders.
  // Until we have a more idiomatic way to target React elements, we can address
  // them manually in componentDidMount with the refs we cache here.
  //
  // https://facebook.github.io/react/docs/refs-and-the-dom.html
  makeRefForLayer(i) {
    return (element) => {
      this._layers[i] = element;
    };
  }

  // We have no props and no state, so no need to re-render
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this._layers.forEach(
      (layer, i) => {
        this.runtime.addPlan({
          plan: new MapScrollPositionToCSSValuePlan({
            propertyName: 'transform',
            valueTemplate: 'translate(__vw, 0px)',
            fromValue: 0,
            toValue: 50 * i / this._layerCount,
          }),
          target: layer,
        });
      }
    );
  }

  render() {
    return (
      <div
        style = {
          {
            width: '100vw',
            height: '300vh',
            background: 'linear-gradient(#3367D6, #4285F4)',
          }
        }
      >
        {
          range({ end: this._layerCount }).map(
            i => (
              <RandomClouds
                key = { i }
                scale = { 4 * i / this._layerCount }
                opacity = { ((2 + i) / (3 + this._layerCount)).toFixed(2) }
                layerRef = { this.makeRefForLayer(i) }
              />
            )
          )
        }
      </div>
    );
  }
}
