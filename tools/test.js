const path = require('path');
const Server = require('karma').Server;
const server = new Server({
  configFile: path.resolve(__dirname, '../karma.conf.js'),
}, function(exitCode) {
  console.log('Karma has exited with ' + exitCode)
  process.exit(exitCode);
});

server.start();
