const path = require('path');
const tsConfig = require('./tsconfig');
const mainTSConfig = require('../../tsconfig');

module.exports = {
  entry: ['./src/mount.tsx'],
  output: {
    bundlePath: '/dist/bundle.js',
    sourceMap: true,
    sourceMapPath: '/dist/bundle.js.map',
  },
  server: {
    port: 8080,
    hmrPath: '/dist/bundle_hmr',
    bundlePath: '/dist/bundle.js',
    sourceRoot: path.join(__dirname, 'site'),
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
