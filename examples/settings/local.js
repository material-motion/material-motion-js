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

import Ambidex from 'ambidex';
import commonSettings from './common';

var {
  recursiveCloneWithDefaults
} = Ambidex.addons.utilities;

export default recursiveCloneWithDefaults(
  {
    HOST: 'localhost',
    PORT: '8080',

    ENABLE_HOT_MODULE_REPLACEMENT: true,
    ENABLE_SOURCE_MAPS: true,
    WEBPACK_PORT: '8081',

    CUSTOM_SETTINGS: {
    }
  },

  commonSettings
);
