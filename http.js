var Proxy = require('./lib/proxy');
var fs = require('fs');
var _ = require('underscore');

module.exports.http = function(config, handlers){

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
	
	return proxyServer
	
};