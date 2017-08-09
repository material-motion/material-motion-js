const path = require('path');
const tsConfig = require('./tsconfig');
const mainTSConfig = require('../../tsconfig');

const extensions = ['js', 'jsx', 'ts', 'tsx'];

module.exports = {
  debug: true,
  rootDirectory: __dirname,
  entry: ['./src/mount.tsx'],
  output: {
    rootDirectory: './site/dist',
    bundlePath: 'bundle.js',
    sourceMap: true,
    sourceMapPath: 'bundle.js.map',
  },
  server: {
    port: 8080,
    rootDirectory: './site',
    hmrPath: '/dist/bundle_hmr',
    bundlePath: '/dist/bundle.js',
    sourceMapPath: '/dist/bundle.js.map',
    redirectNotFoundToIndex: true,
  },
  presets: [
    [
      require.resolve('pundle-preset-default'),
      {
        resolver: false,
        loader: false,
      }
    ],
    [
      require.resolve('pundle-preset-typescript'),
      {
        loader: {
          extensions,
        },
        resolver: {
          packageMains: ['typescript:main', 'module', 'browser', 'main'],
          extensions,
        },
        transformer: {
          extensions,
          config: {
            compilerOptions: Object.assign(
              {},
              mainTSConfig.compilerOptions,
              tsConfig.compilerOptions
            )
          }
        }
      }
    ],
  ],
}
