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

import Link from 'react-router/Link';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import Router from 'react-router/BrowserRouter';

import ParallaxClouds from './map-scroll-to-css/components/ParallaxClouds';

// To add a new demo, import the correct component above and add it to the links
// list below.  Everything else is automatic.
const links = [
  {
    href: '/map-scroll-to-css/parallax/',
    name: 'MapScrollPositionToCSSValue',
    component: ParallaxClouds,
  }
];

function Links() {
  return (
    <ul>
      {
        links.map(
          link => (
            <li key = { link.href }>
              <Link to = { link.href } >
                { link.name }
              </Link>
            </li>
          )
        )
      }
    </ul>
  );
}

export default function() {
  return (
    <Router>
      <div>
        {
          links.map(
            link => (
              <Match
                key = { link.href }
                pattern = { link.href }
                component = { link.component }
              />
            )
          )
        }

        <Miss component = { Links } />
      </div>
    </Router>
  );
}
