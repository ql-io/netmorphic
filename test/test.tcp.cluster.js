var fs, net, htProxy, Proxy, config, client, endpoint, timer, spawn, ready;

spawn = require('child_process').spawn;

net = require('net');
client = new net.Socket();

endpoint = spawn('node', ['test/server/net.server.js']);
proxy = spawn('node', ['test/server/spawn.tcp.cluster.js']);

proxy.stderr.on('data', function(e){
	console.log(e.toString())
});

module.exports['test tcp cluster works'] = function(test){
	test.expect(1);

	proxy.stdout.on('data', function(e){
	  if(e.toString() == 'ready'){
		client.connect(10003, function(){ // NET MORPHIC
			test.ok(true);
			endpoint.kill('SIGTERM');
			proxy.kill('SIGTERM');
			test.done();
			client.end();
		});
	  } 
	});

};
