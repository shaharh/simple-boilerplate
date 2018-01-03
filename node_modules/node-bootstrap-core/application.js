'use strict';

var qs = require('qs');
var Promise = require('promise');

/**
 * Core application
 *
 * @returns {CoreApplication}
 * @constructor
 */
function CoreApplication() {
  var preHookList = [];
  var postHookList = [];
  var routers = [];

  /**
   * Method that receive all http requests
   * @param request
   * @param response
   * @returns {Promise}
   */
  this.requestListener = function (request, response) {
    return Promise.resolve()
      .then(postDecode.bind(this, request))
      .then(runHooks.bind(this, request, response, preHookList))
      .then(dispatch.bind(this, request, response))
      .then(runHooks.bind(this, request, response, postHookList))
      .then(endResponse.bind(this, response))
      .catch(this.onError.bind(this, request, response));
  };

  /**
   * Add router to resolve uri
   * @param router
   * @returns {CoreApplication}
   */
  this.addRouter = function (router) {
    routers.push(router);
    return this;
  };

  /**
   * Add hook before calling action
   * @param callableHook
   * @returns {CoreApplication}
   */
  this.addPreHook = function (callableHook) {
    if (typeof callableHook !== 'function') {
      this.error('Post hook is not callable');
    }
    preHookList.push(callableHook);
    return this;
  };

  /**
   * Add hook after calling action
   * @param callableHook
   * @returns {CoreApplication}
   */
  this.addPostHook = function (callableHook) {
    if (typeof callableHook !== 'function') {
      this.error('Post hook is not callable');
    }
    postHookList.push(callableHook);
    return this;
  };

  /**
   * If page not found
   * @param request
   * @param response
   * @param error
   * @returns {CoreApplication}
   */
  this.onPageNotFound = function (request, response, error) {
    console.log(error);
    response.writeHead(404);
    response.end();
    return this;
  };

  /**
   * If an error occured
   * @param request
   * @param response
   * @param error
   * @returns {CoreApplication}
   */
  this.onError = function (request, response, error) {
    console.error(error);
    response.writeHead(503);
    response.end();
    return this;
  };

  return this;

  /**
   * Dispatch request in good action using routers
   * @param request
   * @param response
   * @returns {Promise}
   */
  function dispatch(request, response) {
    return Promise.resolve()
      .then(resolveRouters.bind(this, request))
      .then(callAction.bind(this, request, response));
  }

  /**
   * Resolve uri using routers
   * @param request
   * @returns {Promise}
   */
  function resolveRouters(request) {
    for (var i = 0, l = routers.length; i < l; i++) {
      var callback = routers[i].resolve(request);
      if (null != callback) {
        return Promise.resolve(callback);
      }
    }
    return Promise.reject('Route not defined for "' + request.url + '"');
  }

  /**
   * Call action and method form resolved route
   * @param request
   * @param response
   * @param callback
   * @returns {*}
   */
  function callAction(request, response, callback) {
    if (typeof callback == 'function') {
      return Promive.resolve()
        .then(callback.bind(null, request, response));
    }

    try {
      var Action = require(ACTION_PATH + '/' + callback.action + '.js');
    } catch (error) {
      if (error.message == 'Cannot find module \'' + ACTION_PATH + '/' + callback.action + '.js\'') {
        return Promise.reject('Action ' + callback.action + ' does not exist.')
          .catch(this.onPageNotFound.bind(this, request, response));
      }
      return Promise.reject(error)
        .catch(this.onError.bind(this, request, response));
    }

    var instance = new Action(request, response);
    // Test if method exists
    if (!instance[callback.method]) {
      return Promise.reject(new Error('Method "' + callback.method + '" not found in action "' + callback.action + '"'));
    }

    var promise = Promise.resolve();
    if (instance.init && 'function' == typeof instance.init) {
      promise = promise.then(function () {
        return instance.init();
      });
    }

    promise = promise.then(function () {
      return instance[callback.method].apply(instance, callback.arguments);
    });

    if (instance.onError && 'function' == typeof instance.onError) {
      promise = promise.catch(function (error) {
        return instance.onError.call(instance, error)
      });
    }

    promise = promise.catch(this.onError.bind(this, request, response));

    return promise;
  }

  /**
   * Decode post data and add input into request
   * @param request
   * @returns {Promise}
   */
  function postDecode(request) {
    return new Promise(function promisePostDecode(resolve) {
      var postData = '';
      if (request.method === 'POST') {
        request.on('data', function (chunk) {
          // append the current chunk of data to the fullBody variable
          postData += chunk.toString();
        });

        request.on('end', function () {
          request.body = qs.parse(postData);
          resolve();
        });

      } else {
        resolve();
      }
    });
  }

  /**
   * Run given hooks
   * @param request
   * @param response
   * @param hooks
   * @returns {Promise}
   */
  function runHooks(request, response, hooks) {
    var promise = Promise.resolve();
    for (var i = 0; i < hooks.length; i++) {
      promise = promise.then(hooks[i].bind(this, request, response));
    }
    return promise;
  }

  /**
   * Finalize response
   * @param response
   */
  function endResponse(response) {
    response.end();
  }
}

module.exports = CoreApplication;