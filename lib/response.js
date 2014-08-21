/*
 * =============================================================
 * response.js
 * =============================================================
 *
 */



module.exports={

    /**
     * overwrites express response render method
     * @param template {String}
     * @param context {Object}
     * @param transition {String}
     * @param callback {Function}
     * @public
     */
    render:function(template,context,transition,callback){
        var elliptical=require('./elliptical');

        var _=elliptical.utils._;
        //no transitions for server
        var self = this
            , context = context || {}
            , req = this.req
            , app = req.app
            , transition = transition || null;

        // support callback function as second arg or third arg
        if ('function' == typeof context) {
            callback = context, context = {};
        }else if('function' === typeof transition){
            callback=transition;
        }

        //instantiate the view object
        var View=elliptical.View;
        var view = new View();
        context=this.setPageTitle(context,app);


        try{
            //merge context with app.context
            _.merge(context,app.context);

            //merge context with req.session

            if(req.session){
                _.merge(context,req.session);
            }
        }catch(ex){

        }

        //public root path, if not "/"
        this.context.virtualRootPath=app.context.virtualRootPath || "";



        // default callback to respond
        callback = callback || function(err, str){
            if (err) return req.next(err);
            self.send(str);
        };

        //render...if onBeforeRender hook is defined, pass to it before rendering the view
        if(typeof app.viewCallback !='undefined'){
            app.viewCallback(req,this,context,function(cxt){

                _render(cxt);
            });
        }else{
            _render(context);
        }



        //private dry function encapsulation of view render method
        function _render(context_){

            //serialize the res.context for browser consumption
            var clientNamespace=View.clientContextRootNamespace;
            var clientContext=(View.pushContextToClient) ? self.setClientContext(clientNamespace,context) : '';

            view.render(template,context_,function(err,out){
                out +=clientContext;
                self.end(out);
                callback(err,out);
            });
        }
    },

    /**
     * merge a context with req.session.context
     * @param context {Object}
     */
    setContext: function(context){
        var elliptical=require('./elliptical');
        var _=elliptical.utils._;
        var req = this.req;
        req.session = req.session || {};
        _.merge(req.session,context);
    },

    /* wrap the context in a script tag to be pushed to the client.
       this allows sharing server javascript objects with client code.
       should be safely available under browser dom ready event -->$$.elliptical.context
     */
    setClientContext:function(namespace,context){
        var script= '<script type="text/javascript">window.' + namespace + '=window.' + namespace + ' || {};';
        script +='window.' + namespace + '.elliptical={};window.' + namespace + '.elliptical.context=' + JSON.stringify(context) + ';</script>';
        return script;

    },

    /**
     * if..else callback facade
     * @param err {Object}
     * @param next {Function}
     * @param fn {Function}
     */
    dispatch:function(err,next,fn){
        if(!err){
            fn.apply(this,arguments);
        }else{
            next(err);
        }
    },

    /**
     * bind new instance of app.contextHelpers() to response
     * @returns {Object}
     */
    contextHelpers:function(){
        var req=this.req;
        var app=req.app;
        return new app.contextHelpers();
    },

    setPageTitle:function(context,app){
        if(context.PageTitle){
            if(app.settings.siteTitle){
                context.PageTitle=app.settings.siteTitle + '-' + context.PageTitle;
            }

        }else{
            if(app.settings.siteTitle){
                context.PageTitle=app.settings.siteTitle;
            }
        }

        return context;
    }


};
