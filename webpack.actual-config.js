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

/*  eslint camelcase: "off" */

const Webpack = require('webpack');

const path = require('path');

const commonSettings = {
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
    ],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: (filePath) => !filePath.includes('node_modules') || filePath.includes('rxjs-es'),
      },
    ],
  },

  output: {
    filename: '[name].js',
    pathinfo: true,
  },
};

const bundles = [
  {
    entry: {
      'material-motion': [
        './src/index.js',
      ],
    },

    output: {
      path: 'dist',
      publicPath: '/dist/',
    },
  },

  {
    entry: {
      examples: [
        './examples/render.js',
      ],
    },

    output: {
      path: 'site/static',
      publicPath: '/static/',
    },
  },
];

if (global.USE_HMR) {
  //  We use Webpack both to bundle our npm modules and to bundle the code for
  //  our sandbox on AppEngine.  To ensure each bundle goes to the right place,
  //  we pass Webpack a list of settings (one for NPM and one for AppEngine)
  //  when generating production-quality bundles.  Unfortunately, Webpack Dev
  //  Server doesn't understand lists.
  //
  //  Therefore, we squash them all together when running on the Dev Server.
  //  Since the webpack command-line tool expects this file's exports to be a
  //  list of settings, that's what we export by default.  Otherwise,
  //  devServer.js will set global.USE_HMR and we'll squash everything together.
  //
  //  https://github.com/webpack/webpack-dev-server/issues/150

  // Makes the Webpack output readable (and makes it easy to see the
  // bundle-size-impact of each dependency), but also makes startup time jump
  // from 8s to 24s
  const WebpackDashboard = require('webpack-dashboard');
  const WebpackDashboardPlugin = require('webpack-dashboard/Plugin');

  const dashboard = new WebpackDashboard();

  const HOST = 'localhost';
  const PORT = 8081;

  const settings = {
    ...commonSettings,

    devtool: 'cheap-module-eval-source-map',
    entry: addHMRToEntries(
      bundles.reduce(
        (ammalgamation, bundle) => (
          {
            ...ammalgamation,
            ...bundle.entry,
          }
        ),
        {}
      )
    ),

    output: {
      ...commonSettings.output,
      path: path.join(__dirname, '/dist/'),
      publicPath: `http://${ HOST }:${ PORT }/`,
    },

    plugins: [
      new Webpack.HotModuleReplacementPlugin(),
      new WebpackDashboardPlugin(dashboard.setData),
      new Webpack.DefinePlugin(
        {
          'process.env': {
            NODE_ENV: '"local"',
          },
        }
      ),
    ],
  };

  module.exports = {
    HOST,
    PORT,
    ...settings,
  };
} else {
  module.exports = bundles.map(
    bundle => (
      {
        ...commonSettings,

        devtool: 'source-map',
        entry: bundle.entry,
        output: {
          ...commonSettings.output,
          ...bundle.output,
        },
        plugins: [
          new Webpack.optimize.UglifyJsPlugin(
            {
              output: {
                inline_script: true,
              },
            }
          ),

          new Webpack.DefinePlugin(
            {
              'process.env': {
                NODE_ENV: '"production"',
              },
            }
          ),
        ],
      }
    )
  );
}

function addHMRToEntries(entries) {
  let results = {
    ...entries,
  };

  Object.keys(results).forEach(
    entryName => {
      const entryList = results[entryName];

      results[entryName] = [
        `react-hot-loader/patch`,
        `webpack-dev-server/client?http://localhost:8081`,
        `webpack/hot/dev-server`,
        ...entryList,
      ];
    }
  );

  return results;
}
