var fs, http, htProxy, Proxy, config, handlers, endpoint, timer;

fs = require('fs');
http = require('http');
htProxy = require('http-proxy');
//config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
handler = require('../lib/handler');
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

var config = {
	global : {
		'/test' : {
			host: '127.0.0.1',
			port: 3200,
			latency: 1000,
			lo: 100,
			hi:1000
		}
	}
}

Proxy = htProxy.createServer(function(req, res, proxy){
	
	req.proxy = proxy;

	var serConfig = config.global['/test'];

    if (serConfig) {
	
	    req.serConfig = serConfig;

        handler[req.url.slice(1)](req, res, proxy, serConfig);

        return;

    }

	else {
		
		res.writeHead(404);
		res.end();
	}

}).listen(3202);

module.exports['test normal service handler'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3202/normal').on('response', function(res){
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
	var expectedDelay = config.global['/test'].latency; // milliseconds
	
	http.get('http://localhost:3202/slow').on('response', function(res){
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
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:3202/flakey').on('response', function(res){

		var data = '';
		var t = time.sinceBegin();
		var delay = (t[0] + (t[1] / 1e9)) * 1000

		test.ok(delay >= config.global['/test'].lo && delay <= config.global['/test'].hi)

		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.done();
			Proxy.close();
			endpoint.close();
		})
	});
};






















