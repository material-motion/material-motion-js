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
 *
 *  @flow
 */

// Quick and dirty Webpack config for prototyping.  Eventually, we'll have a
// proper build system and can reevaluate whether or not to use Webpack for
// prototyping.

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const HOST = 'localhost';
const PORT = 8080;

const settings = {
  devtool: 'cheap-module-eval-source-map',

  entry: {
    parallax: [
      // 'react-hot-loader/patch',
      'webpack-dev-server/client?http://' + HOST + ':' + PORT,
      'webpack/hot/dev-server',
      './src/domain-mapping/examples/parallax/main.ts',
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  module: {
    loaders: [
      {
        test: /\.tsx?$/, loader: 'ts-loader',
      },
    ],
  },

  output: {
    filename: '[name].js',
    // publicPath: `http://${ HOST }:${ PORT }/`,
    pathinfo: true,
  },

  plugins: [
    new Webpack.HotModuleReplacementPlugin(),

    new Webpack.DefinePlugin(
      {
        'process.env': {
          NODE_ENV: '"local"',
        },
      }
    ),
  ],
};


// Webpack is a pain-in-the-ass to configure correctly, so we follow the
// example of the great Dan Abramov:
// https://github.com/gaearon/react-hot-boilerplate/blob/f134ff335d26f1b0369e65a9309b4ec1a38a2581/server.js

module.exports = new WebpackDevServer(
  Webpack(settings),
  {
    // publicPath: settings.output.publicPath,
    hot: true,
    historyApiFallback: true,
  }
).listen(
  PORT,
  HOST,

  function(error, result) {
    if (error) {
      return console.log(error);
    }

    console.info(`Starting Webpack Dev Server on ${ HOST }:${ PORT }…`);
  }
);
