var http, netmorphic, config, endpoint, timer;

http = require('http');
netmorphic = require('../').proxy
endpoint = require('./server/endpoint.server').listen(3200);
timer = require('since-when');

handle = {
	'testcase' : function(req, res){
		res.writeHead(200);
		res.end('okay')
	}
}

config = {
	global : {
		'/get' : {
			host: '127.0.0.1',
			port: 3200,
			method: 'get',
			type: 'normal'
		}
	}
}

nmp = netmorphic(config, handle, false, 3203)

nmp[0].app.listen(3203);

module.exports['test add new route'] = function(test){
	test.expect(1);
	
	http.get('http://localhost:3203/setConfig?tenant=global&srcUrl=/fam&host=127.0.0.1&port=3200&type=testcase').on('response', function(res){
		var data = '';
		res.on('data', function(d){
			data += d
		});
		res.on('end', function(){
			TEST()
		})
	});
	
	function TEST(){
		// try the new route
		http.get('http://localhost:3203/fam').on('response', function(res){
			var data = '';
			res.on('data', function(d){
				data += d
			});
			res.on('end', function(){
				test.equals('okay', data);
				test.done();
				endpoint.close()
				nmp[0].app.close()
			})
		});	
	}
	
};
