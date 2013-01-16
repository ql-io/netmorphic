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
		},
		'/{key}' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'testcase',
			code: 2
		},
		'/{key}?/{val}' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'ALL',
			type: 'testcase',
			code: 3
		}
	}
}

nmp = netmorphic(config, handle, false, 3203)

nmp[0].app.listen(3203)

module.exports['test normal route'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3203/path').on('response', function(res){
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

module.exports['test param match'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3203/square').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equal(config.global['/{key}'].code, parseInt(data));
			test.done()
		})
	});
};

module.exports['test optional param match'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3203/square/triangle').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			test.equal(config.global['/{key}?/{val}'].code, parseInt(data));
			test.done();
			endpoint.close()
			nmp[0].app.close()
			
		})
	});
};
