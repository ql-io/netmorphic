var httpProxy = require('http-proxy'),
    urlUtil = require('url'),
	http = require('http'),
    Handler = require('./handler.js'), 
    Router = require('./router');
		
var scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , run_script = require('./run_script.js')
  , stop_script = require('./stop_script.js')
  , _default = require('./_default.js')
  , route = Router()
  ;

module.exports = function(config, handlers){
		
	var config = config;
	
	var handler = Handler;
	console.log(handlers)
	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				handler[h] = handlers[h];
			})
		}())
	};
	console.log(handler)
	
	Object.keys(config).forEach(function(e){
		
		var c = config[e]
		
		var path = e
		  , method =  c.method.toLowerCase()
		  , h = c.type
		  ;
		
		route[method](path, function(req, res){
			req.serConfig = c;
			handler[h](req, res);
		})
		
	})

    
		
	var proxy = httpProxy.createServer(

	    function (req, res, proxy) {
		
		    req.proxy = proxy;
			
			route(req, res, function(){
							
				var pathname = urlUtil.parse(req.url).pathname;
				
			    if (pathname == '/getconfig') getconfig(req, res, config) ;

			    else if (pathname == '/setconfig') setconfig(req, res, config) ;

			    else if (pathname == '/run') run_script(req, res, config, scriptInfo) ;

			    else if (pathname == '/stop') stop_script(scriptInfo) ;

			    else _default(req, res);
			
			});

            return;

	    }

	);
	
	// return the config so the user can modify it in their application
		
	return {server: proxy, config: config};
	
}