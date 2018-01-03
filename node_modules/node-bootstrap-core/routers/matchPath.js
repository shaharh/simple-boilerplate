'use strict';

/**
 * Simple router which will match url pathname with an action
 * @returns {MatchPath}
 * @constructor
 */
function MatchPath() {

  var defaultAction = 'welcome',
    defaultMethod = 'index';

  /**
   * Resolve uri
   * @param request
   * @returns {*}
   */
  this.resolve = function (request) {
    var action = defaultAction;
    var method = defaultMethod;

    if ('/' != request.url) {
      var uriComponents = request.url.split('?')[0].substr(1).split('/');
      if (uriComponents.length > 1) {
        method = uriComponents.pop();
        action = uriComponents.join('/');
      } else if (uriComponents.length == 1) {
        action = uriComponents[0];
      }
    }

    return {
      action: action,
      method: method,
      arguments: []
    };
  };

  /**
   * Set default action
   * @param action
   * @returns {MatchPath}
   */
  this.setDefaultAction = function (action) {
    defaultAction = action;
    return this;
  };

  /**
   * Set default method
   * @param method
   * @returns {MatchPath}
   */
  this.setDefaultMethod = function (method) {
    defaultMethod = method;
    return this;
  };

  return this;
}

module.exports = new MatchPath();