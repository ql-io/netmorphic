var ps = require('pause-stream');

module.exports = {
	normal: function(socket, service){

		socket.handlerEvent = socket.beginEvent({
				parent: socket.connectionEvent,
		        name: 'handler',
		        message: 0,
		        cb: function(err, results) {
		        }
		    });

		var buffer = ps();
		
		socket.pipe(buffer.pause());
		
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){

			socket.proxyEvent = socket.beginEvent({
					parent: socket.connectionEvent,
			        name: 'proxy',
			        message: 0,
			        cb: function(err, results) {
			        }
			    });

			buffer.pipe(service);
			buffer.resume()

		});
		
		service.pipe(socket);
	},
	
	slow: function(socket, service){
		
		socket.handlerEvent = socket.beginEvent({
				parent: socket.connectionEvent,
		        name: 'handler',
		        message: 0,
		        cb: function(err, results) {
		        }
		    });

		var buffer = ps();
		
		socket.pipe(buffer.pause());
				
		var t = setTimeout(function(){

			service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
				
				socket.proxyEvent = socket.beginEvent({
						parent: socket.connectionEvent,
				        name: 'proxy',
				        message: 0,
				        cb: function(err, results) {
				        }
				    });
				
				buffer.pipe(service);
				buffer.resume()
			});

			service.pipe(socket);
		
			
		}, socket._CONFIG.latency)
		
	},
	
	flakey: function(socket, service){
		
		socket.handlerEvent = socket.beginEvent({
				parent: socket.connectionEvent,
		        name: 'handler',
		        message: 0,
		        cb: function(err, results) {
		        }
		    });
		
		var buffer = ps();
		var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.high);
        
		socket.pipe(buffer.pause());
		
		var t = setTimeout(function(){

			service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
				
				socket.proxyEvent = socket.beginEvent({
						parent: socket.connectionEvent,
				        name: 'proxy',
				        message: 0,
				        cb: function(err, results) {
				        }
				    });
				
				buffer.pipe(service);
				buffer.resume()
			});

			service.pipe(socket);
		
			
		}, latency)
		
	},
	
	drop: function(socket, service){
		
		socket.handlerEvent = socket.beginEvent({
				parent: socket.connectionEvent,
		        name: 'handler',
		        message: 0,
		        cb: function(err, results) {
		        }
		    });
		
		var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.high);
		var t = setTimeout(function(){
 			service.end()
			}
			, latency);
		var buffer = ps();
		
		socket.pipe(buffer.pause());
		
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
			socket.proxyEvent = socket.beginEvent({
					parent: socket.connectionEvent,
			        name: 'proxy',
			        message: 0,
			        cb: function(err, results) {
			        }
			    });
			buffer.pipe(service);
			buffer.resume()
		});
		
		service.pipe(socket);
	},
	
	bumpy: function(socket, service){
		
		socket.handlerEvent = socket.beginEvent({
				parent: socket.connectionEvent,
		        name: 'handler',
		        message: 0,
		        cb: function(err, results) {
		        }
		    });
		
		var buffer = ps();
						
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
			
			socket.proxyEvent = socket.beginEvent({
					parent: socket.connectionEvent,
			        name: 'proxy',
			        message: 0,
			        cb: function(err, results) {
			        }
			    });
			
			socket.pipe(service).pipe(buffer).pipe(socket)

			buffer.resume();

			function swing(){
				
				if(buffer.paused){
					buffer.resume()
				}
				
				else {
					buffer.pause()
				};
				
				var l = getLatency(socket._CONFIG.lo, socket._CONFIG.high);
				
				setTimeout(swing, l)
				
				return;
			};

			swing();
			
		});
		
	}
}

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }
    return ((hi - lo) * Math.random()) + lo;
}