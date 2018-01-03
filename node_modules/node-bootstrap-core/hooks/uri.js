'use strict';

var qs = require('qs');
var url = require('url');

/**
 * Hook decoding full called uri
 * @param request
 */
module.exports = function (request) {
  request.uri = {};

  request.uri.protocol = request.connection.encrypted ? 'https' : 'http';
  request.uri.host = request.headers.host;
  request.uri.path = request.url;
  var tmp = request.uri.path.split('?', 2);
  request.uri.pathname = tmp[0];
  request.uri.search = tmp.length == 2 ? tmp[1] : '';

  if ('' !== request.uri.search) {
    request.uri.query = qs.parse(request.uri.search);
  } else {
    request.uri.query = {};
  }
  request.uri.href = url.format(request.uri);
};