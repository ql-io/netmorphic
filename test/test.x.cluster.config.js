/*
	This fancy test does a few things. 
	It constructs two netmorphics server bundles, with two different configartions
	It starts the http proxies for both instances
	It starts a scuttlebutt instance by calling the monitor
	The two netmorphics proxies connect to the scuttlebutt 
	Using the setConfig API, we change a parameter of ONE instance's config
	This trigger the the gossip chain
	And the other netmorphic proxy gets an update from the scuttlebutt, and gets a new config--the config from the other netmorphic.
	A request is sent to the SECOND netmorphic proxy instance, getConfig
	if the test passes, the second now has the same config as the first
*/

var http = require('http')
  , proxy = require('../').proxy
  , Monitor = require('../').monitor
  , config = require('./server/ambos.json')
  , config2 = require('./server/ambos2.json')
  , sample_handlers = require('./server/sample.handlers.js')
;

var clustered = true; 

module.exports['see inline comments for explanation of this test'] = function(test){
	
	test.expect(2);
    var x = 0;
	var path = "*"

	var servers1 = proxy(config, sample_handlers, clustered, 3201);  
	
	var servers2 = proxy(config2, sample_handlers, clustered, 3202);  

	var monitor = Monitor(3100).gossip;

    var server1 = servers1[1].app
      , server2 = servers2[1].app;

	server1.listen(3201)
	server2.listen(3202)	

	server1.on('listening', function(){
		var req = http.get('http://localhost:3201/setConfig?tenant=global&srcUrl=' + path + '&latency=' + (x+=200)).on('response', function(res){
			test.equal(res.statusCode, 200);
			res.on('data', function(data){
				var d  = JSON.parse(data);
			})		
		});
		
		req.on('error', function(err){
			console.log('poop\n' + err)
		})
		
		req.end()
				
	});

	server2.on('listening', function(){

		setTimeout(function(){

			var req = http.get('http://localhost:3202/getConfig?tenant=global&srcUrl=' + path).on('response', function(res){
				res.on('data', function(data){
					var d  = JSON.parse(data);
					test.ok(d['latency'] == x);
					console.log(d)
					test.done();
					monitor.close()
					server1.close()
					server2.close()
				})
			});
			
			req.end()
			

		}, 1000)
		
	});

};