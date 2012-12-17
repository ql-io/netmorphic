var Time = require('since-when');
var Proxy = require('../lib/tcp.proxy.js');
var Config = require('../configs/tcp.sample.config.json');
var net = require('net');

module.exports['test tcp normal service'] = function(test){
	test.expect(1);
	var client = new net.Socket();
	var c = Config['ebay cologne api'];
	var proxy = Proxy(c);	
	proxy.server.listen(c['proxy port']);
	client.connect(c['proxy port'], function(){
		test.ok(true);
		test.done();
		proxy.server.close();
	})
};

module.exports['test tcp latent connection service'] = function(test){
	test.expect(1);
	var time = new Time();
	var client = new net.Socket();
	var c = Config['ebay purses api'];
	var proxy = Proxy(c);	
	proxy.server.listen(c['proxy port']);
	client.connect(c['proxy port'], function(){
						
		client.on('data', function(d){

			if(d.toString().match('{{{fin}}}')) {
				var t = time.sinceBegin();
				var delay = (t[0] + (t[1] / 1e9)) * 1000;
				test.ok(delay >= c.latency);
				test.done();
				proxy.server.close();
				client.end();
			}
			return
		});
		
		var json = JSON.stringify([{job:2, chunks:2}]);
	    client.write(json);	
		
	})
};

module.exports['test tcp latent connection service'] = function(test){
	test.expect(1);
	var time = new Time();
	var client = new net.Socket();
	var c = Config['ebay pins api'];
	var proxy = Proxy(c);	
	proxy.server.listen(c['proxy port']);
	client.connect(c['proxy port'], function(){
						
		client.on('data', function(d){

			if(d.toString().match('{{{fin}}}')) {
				var t = time.sinceBegin();
				var delay = (t[0] + (t[1] / 1e9)) * 1000;
				test.ok(delay >= c.latency);
				test.done();
				proxy.server.close();
				client.end();
			}
			return
		});
		
		var json = JSON.stringify([{job:2, chunks:2}]);
	    client.write(json);	
		
	})
};