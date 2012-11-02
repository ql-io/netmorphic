var TCProxy = require('./lib/tcp.proxy');
var fs = require('fs');
var _ = require('underscore');

module.exports = function(config, handler){
	
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
		servers.push(s);
	});
	
    var r = {};

    r.servers = servers;

	r.ports = ports;

	r.listen = function(){
		servers.forEach(function(s, i){
			s.listen(ports[i])
		})
	};

	r.close = function(){
		servers.forEach(function(s){
			s.close();
		})
	}

	return r
};