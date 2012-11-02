var fs, http, htProxy, Proxy, config, handlers, exHandler, endpoint, timer, spawn, ready;

ready = false;
spawn = require('child_process').spawn;
fs = require('fs');
http = require('http');
endpoint = require('./server/endpoint.server').listen(3200);

proxy = spawn('node', ['test/server/spawn.cluster.js']);

proxy.stderr.on('data', function(e){
	console.log(e.toString())
});

module.exports['test cluster works with http proxy server works'] = function(test){
	
	test.expect(1);

	proxy.stdout.on('data', function(e){
	  if(e.toString() == 'ready'){
	  	http.get('http://localhost:3201/slowService').on('response', function(res){
			var data = '';
			res.on('data', function(d){
				data += d;				
			});
			res.on('end', function(){
				test.doesNotThrow(function(){JSON.parse(data)});
				test.done();
			})
		})
	  } 
	});

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
