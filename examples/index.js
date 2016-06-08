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
 */



//  Just using Ambidex as a quick and easy way to configure Webpack.  The real
//  core of the demo is in components/ExpressionsDemo.jsx
//
// -----------------------------------------------------------------------------

//  Until Node supports ES6 modules and System.import natively, this file should
//  remain in CommonJS.
//
//  The rest of the project can use ES6 Modules via Babel

var Ambidex = require('ambidex');
var mach = require('mach');

var settings = require('./settings/' + NODE_ENV + '.js');
settings = settings.default || settings;

module.exports = new Ambidex(
  {
    settings,

    middlewareInjector: function(stack) {
      stack.map(
        settings.CUSTOM_SETTINGS.STATIC_URL,
        mach.file(__dirname + '/static')
      );
    }
  }
);
