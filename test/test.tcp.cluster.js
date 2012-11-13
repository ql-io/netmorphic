var fs, net, htProxy, Proxy, config, client, endpoint, timer, spawn, ready;

spawn = require('child_process').spawn;

net = require('net');
client = new net.Socket();

module.exports['test tcp cluster works'] = function(test){
	test.expect(1);
	client.connect(10003, function(){ // NET MORPHIC
		test.ok(true);
		endpoint.kill('SIGTERM');
		proxy.kill('SIGTERM');
		test.done();
		client.end();
	});
};
