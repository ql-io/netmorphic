var TCProxy = require('./lib/tcp.proxy');
var Proxy = require('./lib/proxy');
var Cluster = require('cluster2');
var fs = require('fs');
var _ = require('underscore');

module.exports.tcp = function(config, handler){
	
	var ports = [];
	var servers = [];
	
	var config = config;

	if('string' == typeof config){
		try{
			config = JSON.parse(config)
		}
		catch(err){
			throw new Error('\nConfig must be an object or a JSON string')
		}
	};

	if(!config) {
		
		console.log('\nNo config provided. Using ./configs/tcp.sample.config.json');
	
		config = require('./configs/tcp.sample.config.json');
			
	};
	
	Object.keys(config).forEach(function(e, i){
		var p = config[e]['proxy port'];
		ports.push(p);
		if(!p) {throw new Error('\nEach configuration must declare its own port')}
		var s = {};
		s.app = TCProxy(config[e]).server;
		s.port = ports[i];
		console.log(s.port)
		servers.push(s);
	});
	
	var c = new Cluster({
	    port: _.flatten(ports)
	});

	
    var r = {};

	r.start = function(){
		c.listen(function(cb) {
		    cb(servers);
		});	
	};
	
	r.quit = function(){
		c.stop();
	};
	r.close = function(){
		c.shutdown();
	};
			
	return r
	
};


// HTTP


module.exports.http = function(port, config, handlers){
	
	if('number' !== typeof port) {
		if(!Array.isArray(port)){
			throw new Error ('You must give a port number or array of port numbers');
			return			
		}
	};

	var config = config;

	if('string' == typeof config){
		try{
			config = JSON.parse(config)
		}
		catch(err){
			throw new Error('\nConfig must be an object or a JSON string')
		}
	};

	if(!config) {
		
		console.log('\nNo config provided. Using ./configs/sample.config.json');
	
		config = require('./configs/sample.config.json', 'utf8');
	
	};
	
	var proxyServer = Proxy(config, handlers);
		
	var c = new Cluster({
	    port: port
	});

	
    var r = {};

	r.start = function(){
		c.listen(function(cb) {
		    cb(proxyServer.server);
		});	
	};
	
	r.quit = function(){
		c.stop();
	};
	r.close = function(){
		c.shutdown();
	};
	
	r.config = proxyServer.config;
		
	return r
	
};
