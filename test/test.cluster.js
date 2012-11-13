var fs, http, htProxy, Proxy, config, handlers, exHandler, endpoint, timer, spawn, ready;

ready = false;
spawn = require('child_process').spawn;
fs = require('fs');
http = require('http');

module.exports['test cluster works with http proxy server works'] = function(test){
	
	test.expect(1);

	  	http.get('http://localhost:3201/slowService').on('response', function(res){
			var data = '';
			res.on('data', function(d){
				data += d;				
			});
			res.on('end', function(){
				test.doesNotThrow(function(){JSON.parse(data)});
				test.done();
			})
		}).on('error', function(e){console.log(e.toString())}) 

};

module.exports['test set config on cluster'] = function(test){
	test.expect(2);
    var x = 1;
	setInterval(function(){
		http.get('http://localhost:3201/setConfig?srcUrl=/normalService&type=slow&latency='+(++x * 1000)).on('response', function(res){
			test.equal(res.statusCode, 200);
		});	
	}, 1000);

	setInterval(function(){
		
		http.get('http://localhost:3201/getConfig?srcUrl=/normalService').on('response', function(res){
			res.on('data', function(d){
				console.log(d.toString())
			})
	//		test.equal(res.statusCode, 404);
	//		test.done();
		});	
	}, 100)	
};

module.exports['test clustered http proxy path pattern matching, for custom handler'] = function(test){
	
	http.get('http://localhost:3201/slow').on('response', function(res){
		test.expect(1);
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.doesNotThrow(function(){JSON.parse(data)});
			test.done();
//			proxy.stdin.write('boo');
			endpoint.close();
		})
	});
	
};
