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
		
		throw new Error('\n No Config Provided')	

		config = require('./configs/tcp.sample.config.json');
			
	};
	
	Object.keys(config).forEach(function(e, i){
		var p = config[e]['proxy port'];
		ports.push(p);
		if(!p) {throw new Error('\nEach configuration must declare its own port')}
		var s = {};
		s.app = TCProxy.proxify(config[e], handlers);
		s.port = p;
		servers.push(s);
	});
		
	var c = new Cluster();
	
    var r = {};

	c.listen(function(cb) {
	    cb([{app: servers[0].app, port: 10001}]);
	});	
	
};