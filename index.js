var proxy = require('./lib/_proxy')
  , _ = require('underscore')
  , monitor  = require('./monitor')
  , fs = require('fs')
;

var Handlers = {};

Handlers.tcp = require('./lib/tcp.handler')
Handlers.http = require('./lib/handler')

module.exports.monitor = monitor;

module.exports.proxy = function(config, handlers, cluster, httpPort, httpsPort){	
	
	try{
		fs.readdirSycn('./netmorphic-configs')
	}catch(err){
		try{
			fs.mkdirSync('./netmorphic-configs')
		}catch(err){}
	}
	
	if(arguments.length == 1 && arguments[0][config]){
		// an option object has been passed
		var opts = arguments[0];
		config = opts.config;
		handlers = opts.handlers || null
		cluster = opts.cluster || false
		httpPort = opts.httpPort || undefined
		httpsPort = opts.httspPort || undefined
	}
	
	if(config && !_.contains(Object.keys(config), 'global')) {
		config = {'global' : config};
	};

	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				Handlers.tcp[h] = Handlers.http[h] = handlers[h];
			})
		}())
	};
		
	return proxy(config, Handlers, cluster, httpPort, httpsPort)		

}