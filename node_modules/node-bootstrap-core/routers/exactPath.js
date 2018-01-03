'use strict';

/**
 * Simple router which will map exact url pathname to a callback
 * @returns {ExactPath}
 * @constructor
 */
function ExactPath() {

  /**
   * Uri to action::method mapping
   * @type {Object}
   */
  var mapping = {};

  /**
   * Resolve uri
   * @param request
   * @returns {*}
   */
  this.resolve = function (request) {
    var uri = request.url.split('?')[0];

    if (mapping[request.method] && mapping[request.method][uri]) {
      return decode.call(this, mapping[request.method][uri]);
    }
    return null;
  };

  /**
   * Add a route mapping
   * @param method
   * @param uri
   * @param callback
   * @returns {ExactPath}
   */
  this.addRoute = function (method, uri, callback) {
    method = method.toUpperCase();
    if (!mapping[method]) {
      mapping[method] = {};
    }
    mapping[method][uri] = callback;
    return this;
  };

  /**
   * Add route mapping for get http method
   * @param uri
   * @param callback
   * @returns {ExactPath}
   */
  this.get = function (uri, callback) {
    return this.addRoute('GET', uri, callback);
  };

  /**
   * Add route mapping for post http method
   * @param uri
   * @param callback
   * @returns {ExactPath}
   */
  this.post = function (uri, callback) {
    return this.addRoute('POST', uri, callback);
  };

  /**
   * Add route mapping for put http method
   * @param uri
   * @param callback
   * @returns {ExactPath}
   */
  this.put = function (uri, callback) {
    return this.addRoute('PUT', uri, callback);
  };

  /**
   * Add route mapping for delete http method
   * @param uri
   * @param callback
   * @returns {ExactPath}
   */
  this.delete = function (uri, callback) {
    return this.addRoute('DELETE', uri, callback);
  };

  return this;

  /**
   * Decode callback
   * @param callback
   * @returns {*}
   */
  function decode(callback) {
    if (typeof callback == 'function') {
      return callback;
    } else {
      var split = callback.split('::');
      var action = split[0];
      var method = split[1] || 'index';
      return {
        action: action,
        method: method,
        arguments: []
      };
    }
  }
}

module.exports = new ExactPath();