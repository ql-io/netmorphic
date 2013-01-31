var https = require('https')
,  http = require('http')
,  fs = require('fs')
,  netmorphic = require('../').proxy
,  timer = require('since-when')
,  ssl = require('ssl-keygen')
,  key = ssl.createKeyGen({size: 1024, root: __dirname + '/'})
,  endpoint
;

key.createCA('green', false, function(){
	var options = {
	  key: fs.readFileSync('test/certs/green.key'),
	  cert: fs.readFileSync('test/certs/green.crt')
	};

	endpoint = https.createServer(options, function(req, res){	
		res.writeHead(200);
		res.end('hello https')
	}).listen(3200);
	
	endpoint.on('error', console.error);
});

handle = {
	'testcase' : function(req, res){
		var config = req.serConfig;
		var proxy = req.proxy;
		proxy.proxyRequest(req, res, {
            host:config.host || '127.0.0.1',
            port:config.port || 80,
			https: true
        });
	}
}

config = {
	global : {
		'/' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'get',
			type: 'testcase',
			https: true
		}
	}
}

nmp = netmorphic(config, handle, false, 3203, 4430)

nmp[1].app.listen(4430);

module.exports['test https proxy'] = function(test){
	
	test.expect(1);
	
	https.get('https://localhost:4430/').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equals('hello https', data)
			test.done();
			endpoint.close();
			nmp[1].app.close();
		});
		res.on('error', function(e){
			console.error(e)
		})
	});

	
};
