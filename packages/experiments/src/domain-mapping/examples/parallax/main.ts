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

import { Runtime } from 'material-motion-runtime';

import MapScrollPositionToCSSValuePlan from '../../MapScrollPositionToCSSValuePlan';

const runtime = new Runtime();
const layerCount = 20;

for (let i = 1; i <= layerCount; i++) {
  const layer = document.createElement('div');
  layer.className = 'layer';
  layer.style.opacity = ((2 + i) / (3 + layerCount)).toFixed(2);

  runtime.addPlan({
    plan: new MapScrollPositionToCSSValuePlan({
      propertyName: 'transform',
      valueTemplate: 'translate(__vw, 0px)',
      fromValue: 0,
      toValue: 50 * i / layerCount,
    }),
    target: layer,
  });

  for (let n = 0; n < 150 / layerCount; n++) {
    const icon = document.createElement('div');
    icon.className = 'material-icons';
    icon.innerText = 'cloud';
    icon.style.transform = `
      translate(
        ${ Math.round(Math.random() * 400 - 200) / 2 }vw,
        ${ Math.round(Math.random() * 200) / 2 }vh
      )

      scale(${ 3 + 4 * (i / layerCount) })
     `;

    layer.appendChild(icon);
  }

  document.body.appendChild(layer);
}
