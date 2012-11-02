var fs, http, htProxy, Proxy, config, handlers, endpoint, timer, mockServer;

fs = require('fs');
http = require('http');
Proxy = require('../lib/proxy');
config = JSON.parse(fs.readFileSync('./configs/sample.config.json'));
timer = require('since-when');

mockServer = function(req, res){
	res.writeHead('200');
	res.end('success');
};

var proxy = Proxy(config, mockServer);

proxy.server.listen(3201);

module.exports['test mock service config'] = function(test){
	
	http.get('http://localhost:3201/slowService').on('response', function(res){
		test.expect(1);
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equals(data.toString(), 'success');
			test.done();
			proxy.server.close();
			proxy.mockServer.close()
		})
	})
	
};