/*
 * =============================================================
 * elliptical.Server
 * =============================================================

 * Dependencies:
 * express.js (3.x)
 * https://github.com/visionmedia/express
 *
 *
 */

/* require express */
var express = require('express');

/* get express response,request objects */
var response_=express.response;
var request_=express.request;

/* require elliptical utils,mvc,middleware,services,http,Event,providers */
var utils=require('elliptical-utils');
var elliptical=require('elliptical-mvc');
var middleware=require('elliptical-middleware');
var services=require('elliptical-services');
elliptical.services=services;
var http=require('elliptical-http');
elliptical.http=http;
var Event=require('elliptical-event');

var proto=elliptical.proto;
var providers={
    providers:require('elliptical-providers')
};

/* lodash */
var _ = utils._;

/* elliptical application,response,request extensions */
var application = require('./application');
var response = require('./response');
var request = require('./request');

var utils_={
    utils:utils
};

/* expose a try...catch  facade */
elliptical.Try=function(next,fn){
    try{
        fn.apply(this,arguments);
    }catch(ex){
        next(ex);
    }
};

/**
 * Expose createApplication().
 */
exports = module.exports = createApplication;


/**
 * @return {Function}
 * @public
 */
function createApplication() {
    /* create the server app as an express app */
    var app = express();

    /* mixin our application object with the express app object  */
    proto.mixin(application, app);

    /* initialize */
    app.initialize();

    /* bind async,factory and utils to the app object */
    app.async=elliptical.async;
    app.factory=elliptical.factory;
    app.utils=utils;

    return app;
}



/* mixin elliptical response object with the express response object  */
proto.mixin(response, response_);

/* mixin elliptical request object with the express request object  */
proto.mixin(request, request_);

/* expose express  */
_.defaults(module.exports, express);

/* expose elliptical-mvc */
_.defaults(module.exports, elliptical);

/* expose utils */
_.defaults(module.exports, utils_);

/* expose elliptical-providers */
_.defaults(module.exports, providers);

/* expose elliptical-middleware */
_.defaults(module.exports, middleware);

/* expose elliptical-services */
_.defaults(module.exports, services);

/* expose elliptical-event */
_.defaults(module.exports, Event);











