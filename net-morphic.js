var Proxy = require('./lib/proxy');
var Cluster = require('cluster2');
var fs = require('fs');

module.exports = function(port, config){
	
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
	
	var proxyServer = Proxy(config);
		
	var c = new Cluster({
	    port: port
	});

	
    var r = {};

	r.start = function(){
		c.listen(function(cb) {
		    cb(proxyServer.proxy);
		});	
	};
	
	r.quit = c.stop;
	
	r.shutdown = c.shutdown;
	
	r.config = proxyServer.config;
		
	return r
	
};
