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
      'packages/*/src/**/__tests__/**',
    ],
    exclude: [
      '**/*.map',
    ],
    preprocessors: {
      '**/*.ts': ['webpack'],
      '**/*.js': ['webpack'],
    },
    webpack: {
      devtool: 'eval',
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
