const fs = require('fs');
const minimist = require('minimist');

module.exports = function(config) {
  // Default config for all packages
  let opts = {
      basePath: '',
      frameworks: ['mocha'],
      browsers: ['Chrome', 'ChromeCanary', 'Safari', 'Firefox'],
      reporters: ['progress'],
      client: {
        mocha: {
          reporter: 'html',
        },
      },
      exclude: [
        '**/*.map',
      ],
      preprocessors: {
        '**/*.ts': ['webpack'],
        '**/*.js': ['webpack'],
      },
      webpack: {
        devtool: 'eval',
        stats: 'errors-only',
        resolve: {
          extensions: ['.js', '.ts'],
        },
        module: {
          loaders: [
            {
              test: /\.tsx?$/, loader: 'ts-loader?transpileOnly=true',
            },
          ],
        },
      },
      webpackMiddleware: {
        stats: {
          chunks: false,
        },
      },
      mime: {
        'text/x-typescript': ['ts', 'tsx'],
      },
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      singleRun: false,
      concurrency: Infinity,
  };

  const argv = minimist(process.argv);
  if (argv.only) {
    // Run tests for a specific package
    if (!fs.existsSync(`./packages/${argv.only}`)) {
      throw new Error(`"${argv.only}" package does not exist!`);
    }
    Object.assign(opts, {
      files: [`packages/${argv.only}/src/**/__tests__/**`],
    });
  } else if (argv.grep) {
    // Run tests for a subset of all packages by name
    Object.assign(opts, {
      files: [`packages/*${argv.grep}*/src/**/__tests__/**`],
    });
  } else if (!argv.only && !argv.grep) {
    // Run all tests
    Object.assign(opts, {
      files: ['packages/*/src/**/__tests__/**'],
    });
  }
  config.set(opts);
};
