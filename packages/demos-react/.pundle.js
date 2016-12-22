const path = require('path');
const tsConfig = require('./tsconfig');
const mainTSConfig = require('../../tsconfig');

module.exports = {
  debug: true,
  // ^ Setting this to true sets "process.env.NODE_ENV" to "development" in processed js, it's set to "production" otherwise
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
        transformer: {
          extensions: ['js', 'jsx', 'ts', 'tsx'],
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
