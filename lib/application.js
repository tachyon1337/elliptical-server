

module.exports = {

    /**
     * set default providers
     */
    initialize:function(){
        /* disabled powered-by header */
        this.disable('x-powered-by');
        this.sessionSync=false;
        /* initialize locations array */
        this.locations=[];
        /* always false server-side */
        this.hashTag=false;

        /* set default providers */
        var elliptical = require('./elliptical');
        var providers = elliptical.providers;

        //set the default Model provider
        var Model=elliptical.Model;
        Model.$provider=providers.$store;
        Model.$paginationProvider=providers.$pagination;

        //set the view provider to the template provider
        elliptical.View.$provider=providers.$template;

        /* call context settings */
        this.contextSettings();

        /* call strings */
        this.stringSettings();

        /* set ViewBag middleware */
        this.setViewBag();

    },

    /**
     * auto-set the ViewBag at the top the elliptical middleware stack
     */
    setViewBag:function(){
        this.use(this.initViewBag());
    },

    /**
     * simple middleware function to init an empty context object
     * property on the response object for each httpServer response
     *
     * res.context is serialized by the render method to the client browser,
     * enabling server/browser to share the same objects. Available client-side under--> window.$$.elliptical.context
     *
     * res.context makes res.locals redundant, so the latter is not implemented
     *
     * @returns {Function}
     */
    initViewBag:function(){
        return function(req,res,next){
            res.context={};
            res.transition={};
            next();
        }
    },

    /**
     * html form context helper, creates an empty form object with a submit label object property
     * var helper=new app.contextHelpers();
     * res.context.form=helper.form()
     */
    contextHelpers:function(){

        this.form=function(){
            return {
                submitLabel:{
                    cssDisplay:'hidden',
                    message:'&nbsp;'
                }
            }
        };

    },

    /**
     * init app.context, this is scoped to the app, not to the user, and gets merged with res.context at render
     * environment variables, app.isServer, app.isBrowser
     * app.settings.config, a configuration object to populate cookie and session properties. To avoid sensitive information
     * being bundled by browserify, this should be populated by config.json in the app root directory.
     * e.g.:
     *   app.server(function(){
     *     var path=process.cwd();
     *     var config=app.config(path);
     *     app.config.settings=config
     *   });
     *
     */
    contextSettings: function(){
        /* init app.context merged with template context for every route */
        this.context={};

        /* this is a server app */
        this.isServer=true;
        this.isBrowser=false;

        /* create an empty config object on app.settings */
        this.settings.config={
            cookie:{},
            session:{},
            providers:{}
        };
    },

    /**
     * sets the site base title that gets written to the template <title></title>
     * @param base
     */
    siteBaseTitle: function(base){
        this.settings=this.settings || {};
        this.settings.siteTitle=base;
    },


    /**
     * string settings: TODO: bind this from a STRINGS.json config file
     *
     */
    stringSettings: function(){
        this.settings.STRINGS={
            _401:{
                statusCode:401,
                message:'Unauthorized',
                description:'You do not have permission to access this resource'
            },
            _404:{
                statusCode:404,
                message:'Page Not Found',
                description:'The resource you are looking for could have been removed, had its name changed, or is temporarily unavailable.  Please review the following URL and make sure that it is spelled correctly.'
            },
            _500:{
                statusCode:500,
                message:'Internal Server Error',
                acl:'Misconfigured Access Control List on Requested Path'
            },
            _invalidSignOut:{
                statusCode:401,
                message:'Unauthenticated Sign Out Request',
                description:'Invalid attempt to logout of a session resource that has no authentication token.'
            },
            _invalidSignUp:{
                statusCode:401,
                message:'Invalid Sign Up Request',
                description:'Invalid attempt to request an resource by an authenticated session.'
            },
            _signOut:{
                statusCode:200,
                message:'You have been logged out of your account...',
                description:'session logout success'
            },
            _signUp:{
                message:'Sign up below with your email and password'
            }

        };
    },


    /**
     * SERVER ONLY
     * convenience method to set standard middleware,cookies and session
     * @param params {Object} config object
     * @param $provider {Object} session store provider
     */
    defaultMiddleware: function (params,$provider) {
        if($provider===undefined){
            $provider=null;
        }
        if (typeof params !=='undefined' && typeof params.cookie !== 'undefined') {
            _.extend(this.settings.config.cookie, params.cookie);
        }
        if (typeof params !=='undefined' && typeof params.session !== 'undefined') {
            _.extend(this.settings.config.session, params.session);
        }

        var elliptical = require('./elliptical');

        /* method override */
        this.use(elliptical.methodOverride());

        /* body parser */
        this.use(elliptical.bodyParser());

        /* cookie parser */
        this.settings.config.cookie.secret = this.settings.config.cookie.secret || this.utils.guid();
        this.use(elliptical.cookieParser(this.settings.config.cookie.secret));


        /* session */
        this.settings.config.session.key = this.settings.config.session.key || 'connect.sid';
        this.settings.config.cookie.maxAge = this.settings.config.cookie.maxAge || null;
        this.settings.config.cookie.httpOnly = this.settings.config.cookie.httpOnly || false;
        this.settings.config.cookie.path = this.settings.config.cookie.path || '/';


        this.use(elliptical.session({
            key: this.settings.config.key,
            cookie: this.settings.config.cookie,
            store: $provider
        }));


    },

    /**
     * returns system production port
     * @returns {Number}
     */
    getPort:function(){
        return process.env.PORT;
    },


    /**
     * add an acl to a root path
     * @param path {String}
     * @param exclude {Array}
     */
    location: function(path,exclude){
        /* path must have leading  slash */
        if (path.substring(0, 1) != '/') {
            path = '/' + path;
        }

        if(typeof exclude != 'object'){
            exclude=[];
        }
        var access={
            path:path,
            exclude:exclude
        };
        this.locations.push(access);
    },


    /* app listen */
    listen: function () {
        return this._super.apply(this, arguments);
    },


    /* throw implementation error for app.render */
    render: function (template, context, callback) {
        throw new Error('elliptical does not implement app.render');
    },


    /**
     * define a onBeforeRender hook
     * @param fn {Function}
     */
    onBeforeRender:function(fn){
        if(typeof fn==='function'){
            this.viewCallback=fn;
        }
    },

    /**
     * SERVER ONLY
     * server-side execution of a function
     * @param fn {Function}
     */
    server:function(fn){
        fn.call(this);
    },

    /**
     * BROWSER ONLY
     * client-side execution of a function
     * @param fn {Function}
     */
    browser:function(fn){
        //ignore
    },

    /**
     * SERVER ONLY
     * returns a configuration object from config.json
     * @param path {String}
     */
    config:function(path){
        return require(path + '/config.json');
    },

    /**
     * BROWSER ONLY
     * set $hashTag bit to true
     */
    hashLocation:function(){
        //ignore
    },

    /**
     * BROWSER ONLY
     * appends template scripts tag to the document
     */
    templatesScriptLoader: function(){
        //ignore
    },


    /**
     * SERVER ONLY
     * execute bootstrap functions on server start-up
     * accepts an explicit array of functions executed in series following the async.waterfall pattern
     * bootstrap functions must be in the form of
     *   func(server,callback){
     *    //do something
     *      callback(err,server);
     *   }
     * Note: 'server' is the result that should be passed by each function to the next
     *
     * Ex: server.js
     *  app.bootstrap(funcArray,server,function(err,data){
     *      if(!err){
     *         //do something
     *      }else{
     *       //handle error
     *      }
     *  });
     *
     *
     *
     * @param stack {Array}(of Functions)
     * @param server {Object}
     * @param fn {Function} Callback
     */
    bootstrap: function (stack, server, fn) {
        var elliptical = require('./elliptical');
        var async=elliptical.async;
        if (process.env.NODE_ENV != 'production') {
            console.log('Loading Bootstrap...');
        }
        var f = function (callback) {
            callback(null, server);
        };
        stack.unshift(f);


        async.waterfall(stack, function (err, result) {
            fn(err, result);
        });

    }



};
