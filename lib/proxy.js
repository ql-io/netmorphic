var httpProxy = require('http-proxy'),
    urlUtil = require('url'),
	http = require('http'),
    Handler = require('./handler.js'),
    Router = require('./router'),
	Model = require('scuttlebutt/model');		

var scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , run_script = require('./run_script.js')
  , stop_script = require('./stop_script.js')
  , _default = require('./_default.js')
  , route = Router()
  , model = new Model()
  ;

module.exports = function(config, handlers, clustered){
		
	var config = config;
	
	var handler = Handler;

	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				handler[h] = handlers[h];
			})
		}())
	};
	
	function setRoute(method, path, config, type){
		route[method](path, function(req, res){
			req.serConfig = config;
			if(!handler[type]) {
				res.writeHead(400);
				res.end('\nNo Handler "'+ type +'" provided for config["'+path+'"]');
				return;
			};
			handler[type](req, res);
		})
	}
	
	route.get('/getconfig', function(req, res){
		getconfig(req, res, config)
	});

	route.get('/setconfig', function(req, res){
		setconfig(req, res, config)
	});

	route.get('/run_script', function(req, res){
		run_script(req, res, config, scriptInfo)
	});

	route.get('/stop_script', function(req, res){
		stop_script(scriptInfo)
	});
	
	Object.keys(config).forEach(function(e){
		
		var c = config[e]
		
		var path = e
		  , method = c.method.toLowerCase()
		  , h = c.type
		  ;
		
		setRoute(method, path, c, h)
		
	});
		
	var proxy = httpProxy.createServer(

		if(clustered){

			//		var m = model.createStream();

			//		m.pipe(Net.connect(4111)).pipe(m);	

		};
		

	    function (req, res, proxy) {
		
		    req.proxy = proxy;
			
			route(req, res, function(){
				
			    _default(req, res);
			
			});

            return;

	    };

	);
	
	// return the config so the user can modify it in their application
		
	return {server: proxy, config: config};
	
}