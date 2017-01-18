const path = require('path');
const tsConfig = require('./tsconfig');
const mainTSConfig = require('../../tsconfig');

module.exports = {
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
        // Put any preset config here
      }
    ],
    [
      require.resolve('pundle-preset-typescript'),
      {
        resolver: {
          packageMains: ['typescript:main', 'browser', 'main'],
        },
        transformer: {
          extensions: ['js', 'jsx', 'ts', 'tsx'],
          exclude: [],
          config: {
            compilerOptions: Object.assign(
              mainTSConfig.compilerOptions,
              tsConfig.compilerOptions
            )
          }
        }
      }
    ],
  ],
}
