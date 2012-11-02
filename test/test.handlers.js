var fs, http, htProxy, Proxy, config, handlers, endpoint, timer;

fs = require('fs');
http = require('http');
htProxy = require('http-proxy');
config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
handler = require('../lib/handler');
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

Proxy = htProxy.createServer(function(req, res, proxy){
	
	req.proxy = proxy;

	var serConfig = config[req.url];

    if (serConfig) {
	
	    req.serConfig = serConfig;

        handler[serConfig.type](req, res, proxy, serConfig);

        return;

    }

	else {
		
		res.writeHead(404);
		res.end();
	}

}).listen(3202);

module.exports['test normal service handler'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3202/normalService').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done()
		})
	});
};

module.exports['test slow service handler'] = function(test){
	test.expect(2);
	
	var time = new timer();
	var expectedDelay = config['/slowService'].latency; // milliseconds
	
	http.get('http://localhost:3202/slowService').on('response', function(res){
		var data = ''
		  , t = time.sinceBegin()
		  , delay = (t[0] + (t[1] / 1e9)) * 1000;
		
		
		test.ok(delay >= expectedDelay)
		
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done()
		})
	});
};

module.exports['test flakey service handler'] = function(test){
	test.expect(2);
	
	var time = new timer();
	
	var request = http.get('http://localhost:3202/flakeyService').on('response', function(res){

		var data = '';
		var t = time.sinceBegin();
		var delay = (t[0] + (t[1] / 1e9)) * 1000

		test.ok(delay >= config['/flakeyService'].lo && delay <= config['/flakeyService'].hi)

		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done();
			Proxy.close();
			endpoint.close();
		})
	});
};






















