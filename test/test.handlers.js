var http, netmorphic, config, endpoint, timer;

http = require('http');
netmorphic = require('../').proxy
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

config = {
	global : {
		'/normal' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'normal'
		},
		'/slow' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'slow',
			latency: 1000,
		},
		'/flakey' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'flakey',
			hi: 2500,
			lo: 1000
		},
		'/drop' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'drop',
			latency: 1000
		},
		'/unresponsive' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'unresponsive'
		}
		
	}
}

nmp = netmorphic(config, null, false, 3203)

nmp[0].app.listen(3203)

module.exports['test normal service handler'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3203/normal').on('response', function(res){
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
	var expectedDelay = config.global['/slow'].latency; // milliseconds
	
	http.get('http://localhost:3203/slow').on('response', function(res){
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
	
	var request = http.get('http://localhost:3203/flakey').on('response', function(res){

		var data = '';
		var t = time.sinceBegin();
		var delay = (t[0] + (t[1] / 1e9)) * 1000

		test.ok(delay >= config.global['/flakey'].lo && delay <= config.global['/flakey'].hi)

		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.done();
		})
	});
};


module.exports['test unresponsive service handler'] = function(test){
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:3203/unresponsive').on('response', function(res){
		test.ok(false) // this shouldn't happen
	});
	
	setTimeout(function(){
		test.ok(true);
		test.done()
	}, 1000)
	
};

module.exports['test drop service handler'] = function(test){
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:3203/drop').on('response', function(res){
		res.on('end', function(){
			test.ok(true)
			test.done();
			nmp[0].app.close();
			endpoint.close();
		})
	});
};

