var http, netmorphic, config, endpoint, timer;

http = require('http');
netmorphic = require('../').proxy
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

handle = {
	'testcase' : function(req, res){
		res.writeHead(200);
		res.end(req.serConfig.code.toString())
	},
	'methods' : function(req, res){
		res.writeHead(200);
		res.end(req.method)
	}
}

config = {
	global : {
		'/get' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'get',
			type: 'methods'
		},
		'/put' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'put',
			type: 'methods'
		},
		'/post' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'post',
			type: 'methods'
		},
		'/delete' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'delete',
			type: 'methods'
		},
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

nmp[0].app.listen(3203);

module.exports['test get|post|put|del'] = function(test){
	test.expect(4);
	
	var methods = ['GET', 'PUT', 'POST', 'DELETE']
	
	function head(i){
		return {
			host: 'localhost',
			port: 3203,
			path: '/' + methods[i].toLowerCase(),
			method: methods[i]
		}	
	}
	
	methods.forEach(function(e, i){
		var req = http.request(head(i)).on('response', function(res){
			var data = '';
			res.on('data', function(d){
				data += d;
			});
			res.on('end', function(){
				test.equals(e, data.toString('utf8'));
				if(i==3) test.done();
			})
		});
		
		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});
		
		req.end()		
	})
};

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
