const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

module.exports = function(config) {
  // Default config for all packages
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    browsers: process.env.CI
      ? ['Chrome', 'Firefox']
      : ['ChromeCanary'],

    // CircleCI needs JUnit to show tests correctly.
    // https://circleci.com/docs/1.0/test-metadata/#karma
    reporters: process.env.CI
      ? ['progress', 'junit']
      : ['progress'],
    junitReporter: {
      outputDir: process.env.JUNIT_REPORT_PATH,
      outputFile: process.env.JUNIT_REPORT_NAME,
      useBrowserName: false
    },

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
        mainFields: ['typescript:main', 'jsnext:main', 'main'],
      },
      module: {
        loaders: [
          {
            test: /\.tsx?$/, loader: 'ts-loader?transpileOnly=true',
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
  });

  const argv = minimist(process.argv);
  if (argv.only) {
    // Run tests for a specific package
    if (!fs.existsSync(path.resolve(__dirname, `./packages/${ argv.only }`))) {
      throw new Error(`"${ argv.only }" package does not exist!`);
    }

    config.set({
      files: [`packages/${ argv.only }/src/**/__tests__/**`],
    });

  } else if (argv.grep) {
    // Run tests for a subset of all packages by name
    config.set({
      files: [`packages/*${ argv.grep }*/src/**/__tests__/**`],
    });

  } else if (!argv.only && !argv.grep) {
    // Run all tests
    config.set({
      files: ['packages/*/src/**/__tests__/**'],
    });
  }
};
