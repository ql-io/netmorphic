var proxy = require('./lib/_proxy')
  , _ = require('underscore')
  , monitor  = require('./monitor')
  , fs = require('fs')
;

var Handlers = {};

Handlers.tcp = require('./lib/tcp.handler')
Handlers.http = require('./lib/handler')

module.exports.monitor = monitor;

module.exports.proxy = function(config, handlers, cluster, httpPort){	
	
	try{
		fs.readdirSycn('./netmorphic-configs')
	}catch(err){
		try{
			fs.mkdirSync('./netmorphic-configs')
		}catch(err){}
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
	
	return proxy(config, Handlers, cluster, httpPort)	
	
}