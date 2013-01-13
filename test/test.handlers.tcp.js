var iables
, http = require('http')
, netmorphic = require('../').proxy
, endpoint = require('./server/endpoint.server').listen(3200)
, timer = require('since-when')
;

config = {
	global : {
		'10001' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'normal'
		},
		'10002' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'slow',
			latency: 1000,
		},
		'10003' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'flakey',
			hi: 2500,
			lo: 1000
		},
		'10004' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'drop',
			hi: 44,
			lo: 11
		},
		'10005' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'unresponsive'
		},
		'10006' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'bumpy',
			hi: 2500,
			lo: 1000
		}
	}
}

nmp = netmorphic(config, null, false, 3203)

nmp.forEach(function(e, i){
	e.app.listen(e.port)
});

module.exports['test normal service handler'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:10001/normal').on('response', function(res){
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
	var expectedDelay = config.global['10002'].latency; // milliseconds
	
	http.get('http://localhost:10002/slow').on('response', function(res){
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
	
	var request = http.get('http://localhost:10003/flakey').on('response', function(res){

		var data = '';
		var t = time.sinceBegin();
		var delay = (t[0] + (t[1] / 1e9)) * 1000

		test.ok(delay >= config.global['10003'].lo && delay <= config.global['10003'].hi)

		res.on('data', function(d){
			data += d
		});
		res.on('end', function(d){
			test.done();
		})
	});
};

module.exports['test drop service handler'] = function(test){
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:10004/drop').on('response', function(res){
		res.on('end', function(){
			test.ok(true)
			test.done();
		})
	});
};


module.exports['test unresponsive service handler'] = function(test){
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:10005/unresponsive').on('response', function(res){
		test.ok(false);
		test.done()
	});
	
	request.on('error', function(){
	})
	
	setTimeout(function(){
		test.ok(true);
		test.done();
		request.end()
	}, 1000)
	
};

module.exports['test bumpy service handler'] = function(test){
	test.expect(1);
	
	var time = new timer();
	
	var request = http.get('http://localhost:10006/bumpy').on('response', function(res){

		var data = '';
		var t = time.sinceBegin();
		var delay = (t[0] + (t[1] / 1e9)) * 1000
		
		res.on('end', function(){
			
			test.ok(delay >= config.global['10006'].lo && delay <= config.global['10006'].hi)
			test.done();
			
			nmp.forEach(function(e, i){
				e.app.close()
			});

			endpoint.close();
			
		})
		
	});
	
	request.on('close', function(){
		console.log('closed')
	})
	
};