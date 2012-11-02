var TCProxy = require('./lib/tcp.proxy');
var Cluster = require('cluster2');
var fs = require('fs');
var _ = require('underscore');

module.exports = function(config, handlers){
	
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
		
		console.log('\nNo config provided. Using ./configs/tcp.sample.config.json, but that is not going to be of any use to you');
	
		config = require('./configs/tcp.sample.config.json');
			
	};
	
	Object.keys(config).forEach(function(e, i){
		var p = config[e]['proxy port'];
		ports.push(p);
		if(!p) {throw new Error('\nEach configuration must declare its own port')}
		var s = {};
		s.app = TCProxy(config[e], handlers).server;
		s.port = ports[i];
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