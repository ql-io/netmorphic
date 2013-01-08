var TCProxy = require('./lib/tcp.proxy');

var HTTProxy = require('./lib/proxy');

var monitor  = require('./monitor');

//var configuration_server = require('./lib/config.server');

module.exports.tcp = TCProxy

module.exports.http = HTTProxy

module.exports.monitor = monitor

/*
##
##  revision 
##
*/

var proxy = require('./lib/_proxy')
  , _ = require('underscore')
;
var Handlers = {};

Handlers.tcp = require('./lib/tcp.handler')
Handlers.http = require('./lib/handler')


module.exports.revision = function(config, handlers, cluster, httpPort){

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