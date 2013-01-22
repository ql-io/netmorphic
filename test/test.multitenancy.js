var http, netmorphic, config, endpoint, timer;

http = require('http');
netmorphic = require('../').proxy
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

handle = {
	'testcase' : function(req, res){		
		res.writeHead(200);
		res.end(req.serConfig.code.toString())
	}
}

config = {
	global : {
		'/path' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'testcase',
			code: 1 
		}
	},
	test : {
		'/{key}' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'testcase',
			code: 2
		},
		addresses: ['12.34.56.78']
	}
}

nmp = netmorphic(config, handle, false, 3203)

nmp[0].app.listen(3203)

module.exports['test global route'] = function(test){
	test.expect(1);
	
	var options = {
		host: 'localhost',
		port: 3203,
		path: '/path'
	}
	
	http.get(options).on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equal(config.global['/path'].code, parseInt(data));
			test.done()
		})
	});
};

module.exports['test test tenant route'] = function(test){
	test.expect(1);
	
	var options = {
		host: 'localhost',
		port: 3203,
		path: '/eagle',
		headers : {
			'X-Forwarded-For' : '12.34.56.78'
		}
	}
	
	http.get(options).on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equal(config.test['/{key}'].code, parseInt(data));
			test.done();
			endpoint.close();
			nmp[0].app.close()			
		})
	}).on('error', console.error);
};

