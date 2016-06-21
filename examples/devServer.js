// tells webpack.config to give us the local settings
global.USE_HMR = true;

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const settings = require('../webpack.config');

//  Node doesn't support { ...rest } = thing, so this in its own expression
const {
  HOST,
  PORT,
} = settings;

//  Webpack is a pain-in-the-ass to configure correctly, so we follow the
//  example of the great Dan Abramov:
//  https://github.com/gaearon/react-hot-boilerplate/blob/f134ff335d26f1b0369e65a9309b4ec1a38a2581/server.js

module.exports = new WebpackDevServer(
  Webpack(settings),
  {
    publicPath: settings.output.publicPath,
    hot: true,
    historyApiFallback: true,
  }
).listen(
  PORT,
  HOST,

  function(error, result) {
    if (error) {
      return console.log(error);
    }

    console.info(`Starting Webpack Dev Server on ${ HOST }:${ PORT }…`);
  }
);
