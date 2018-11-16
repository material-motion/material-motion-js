const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

module.exports = function(config) {
  // Default config for all packages
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    browsers: process.env.CI
      ? ['Chrome']
      : ['ChromeCanary'],

    // CircleCI needs JUnit to show tests correctly.
    // https://circleci.com/docs/1.0/test-metadata/#karma
    reporters: process.env.CI
      ? ['junit', 'coverage', 'progress']
      : ['coverage', 'progress'],
    junitReporter: {
      outputDir: process.env.CIRCLE_TEST_REPORTS,
    },
    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/',
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
      '**/*.js': ['webpack'],
      '**/*.jsx': ['webpack'],
      '**/*.ts': ['webpack'],
      '**/*.tsx': ['webpack'],
      '**/!(__tests__)/*.ts': ['webpack', 'coverage'],
    },
    webpack: {
      mode: 'none',
      devtool: 'eval',
      stats: 'errors-only',
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        mainFields: ['typescript:main', 'jsnext:main', 'main'],
      },
      module: {
        rules: [
          {
            test: /.*/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              }
            ]
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

  let filesBasePath = 'packages/*!(-react)/src/**/';

  const argv = minimist(process.argv);
  if (argv.only) {
    // Run tests for a specific package
    if (!fs.existsSync(path.resolve(__dirname, `./packages/${ argv.only }`))) {
      throw new Error(`"${ argv.only }" package does not exist!`);
    }
    filesBasePath = `packages/${ argv.only }/src/**/`;

  } else if (argv.grep) {
    // Run tests for a subset of all packages by name
    filesBasePath = `packages/*${ argv.grep }*/src/**/`;
  }

  config.set({
    files: [`${ filesBasePath }*.js`, `${ filesBasePath }*.jsx`, `${ filesBasePath }*.ts`, `${ filesBasePath }*.tsx`],
  });
};
