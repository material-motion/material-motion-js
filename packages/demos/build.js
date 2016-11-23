#!/usr/local/bin/node

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


// This is a copy/pasted version of devServer, tweaked to disable HMR.
//
// Putting off consolidating the two into a shared config file until pundle@2
// lands.

const Path = require('path')
const Pundle = require('pundle')
const writeFileSync = require('fs').writeFileSync;

const pundle = new Pundle({
  entry: [require.resolve('./src/mount.tsx')],
  pathType: 'filePath',
  rootDirectory: __dirname,
  replaceVariables: {
    'process.env.NODE_ENV': 'production',
  },
});

pundle.loadPlugins([
  [
    'typescript-pundle',
    {
      config: {
        compilerOptions: {
          jsx: 'react',
          strictNullChecks: true,
        }
      }
    }
  ]
]).then(
  () => {
    pundle.loadLoaders([
      { extensions: ['.ts', '.tsx'], loader: require('pundle/lib/loaders/javascript').default },
    ])

    return pundle.compile();
  }
).then(
  () => pundle.generate({ sourceMap: true })
).then(
  generated => {
    writeFileSync('./site/dist/bundle.js', `${generated.contents}\n//# sourceMappingURL=bundle.js.map`);
    writeFileSync('./site/dist/bundle.js.map', JSON.stringify(generated.sourceMap));
  }
).catch(console.error);
