'use strict';

var http = require('http');

global.CORE_PATH = __dirname;
require('./config/path.js');

function Server(serverConfiguration) {
  var config = _completeConfig(serverConfiguration);

  this.start = function (requestListener) {
    var server = http.createServer(requestListener);
    server.listen.call(server, config.port, config.hostname);
    console.log('Start server ' + config.name + ' on ' + config.hostname + ':' + config.port);
  };
  return this;

  function _completeConfig(config) {
    if (!config.port) {
      throw new Error('You need to define a port in your application.js config file');
    }
    if (!config.hostname) config.hostname = '127.0.0.1';
    if (!config.name) config.name = 'My Project ';
    return config;
  }
}

module.exports = Server;