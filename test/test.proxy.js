var fs, http, htProxy, Proxy, config, handlers, endpoint, timer;

fs = require('fs');
http = require('http');
Proxy = require('../lib/proxy');
config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

var proxy = Proxy(config);

proxy.server.listen(3201);

module.exports['test proxy server works'] = function(test){
	
	http.get('http://localhost:3201/slowService').on('response', function(res){
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