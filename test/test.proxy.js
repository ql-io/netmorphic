var fs, http, htProxy, Proxy, config, handlers, exHandler, endpoint, timer;

fs = require('fs');
http = require('http');
Proxy = require('../lib/proxy');
config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');
exHandler = require('../configs/sample.handler.js');

var proxy = Proxy(config, {'exampleHandler': exHandler});

proxy.server.listen(3201);

module.exports['test proxy server works, now with custom handlers'] = function(test){
	
	http.get('http://localhost:3201/slowService').on('response', function(res){
		test.expect(1);
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done();
		})
	})
	
};

module.exports['test proxy path pattern matching, for custom handler'] = function(test){
	
	http.get('http://localhost:3201/slow').on('response', function(res){
		test.expect(1);
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done();
			proxy.server.close();
			endpoint.close();
		})
	})
	
};