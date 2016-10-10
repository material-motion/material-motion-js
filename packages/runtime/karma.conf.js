module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    browsers: ['Chrome', 'ChromeCanary', 'Safari', 'Firefox'],
    reporters: ['progress'],
    client: {
      mocha: {
        reporter: 'html',
      },
    },
    files: [
      '**/src/**/__tests__/**',
    ],
    exclude: [
      '**/*.map',
    ],
    preprocessors: {
      '**/*.ts': ['webpack'],
      '**/*.js': ['webpack'],
    },
    webpack: {
      module: {
        loaders: [
          {
            test: /\.tsx?$/, loader: 'ts-loader',
          },
        ],
      },
    },
    ts: {
      noResolve: true,
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
};
