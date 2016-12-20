const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

module.exports = function(config) {
  // Default config for all packages
  let defaultConfig = {
      basePath: '',
      frameworks: ['mocha'],
      browsers: process.env.TRAVIS
        ? ['Chrome', 'Firefox']
        : ['ChromeCanary'],
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
              test: /\.tsx?$/, loader: 'awesome-typescript-loader?transpileOnly=true',
            },
          ],
        },
      },
      // Suppresses some console.log messages when bundle is built
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
    if (!fs.existsSync(path.resolve(__dirname, `./packages/${ argv.only }`))) {
      throw new Error(`"${ argv.only }" package does not exist!`);
    }
    Object.assign(defaultConfig, {
      files: [`packages/${ argv.only }/src/**/__tests__/**`],
    });
  } else if (argv.grep) {
    // Run tests for a subset of all packages by name
    Object.assign(defaultConfig, {
      files: [`packages/*${ argv.grep }*/src/**/__tests__/**`],
    });
  } else if (!argv.only && !argv.grep) {
    // Run all tests
    Object.assign(defaultConfig, {
      files: ['packages/*/src/**/__tests__/**'],
    });
  }
  config.set(defaultConfig);
};
