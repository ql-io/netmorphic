var Proxy = require('./lib/proxy');
var Cluster = require('cluster2');
var fs = require('fs');

module.exports = function(port, config, handlers){
	
	if('number' !== typeof port) {
		throw new Error ('You must give a port number');
		return
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
	
		config = JSON.parse(fs.readFileSync('./configs/sample.config.json', 'utf8'));
	
	};
	
	var proxyServer = Proxy(config, handlers);
		
	var c = new Cluster({
	    port: port
	});

	
    var r = {};

	r.start = function(){
		c.listen(function(cb) {
		    cb(proxyServer.proxy);
		});	
	};
	
	// it may not be useful or even possible to change the mock server's handler...
	r.mock = proxyServer.mock;
	
	r.quit = function(){
		c.stop();
	};
	r.shutdown = function(){
		c.shutdown();
	};
	
	r.config = proxyServer.config;
		
	return r
	
};
