var fs, http, htProxy, Proxy, config, handlers, endpoint, timer;

fs = require('fs');
http = require('http');
htProxy = require('http-proxy');
config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
handler = require('../lib/handler');
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

var proxy = htProxy(config);

proxy.server.listen(3201);

module.exports['test proxy server'] = function(test){
	
	http.get('http://localhost:3201/slowService').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			d
		})
	})
	
}