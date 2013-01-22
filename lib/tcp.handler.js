var ps = require('pause-stream');

module.exports = {
	normal: function(socket, service){
		
		var buffer = ps();
		
		socket.pipe(buffer.pause());
		
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){

			buffer.pipe(service);
			buffer.resume()

		});
		
		service.pipe(socket);
	},
	
	slow: function(socket, service){

		var buffer = ps();
		
		socket.pipe(buffer.pause());
				
		var t = setTimeout(function(){

			service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
				buffer.pipe(service);
				buffer.resume()
			});

			service.pipe(socket);
		
			
		}, socket._CONFIG.latency)
		
	},
	
	flakey: function(socket, service){
				
		var buffer = ps();
		var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);
        
		socket.pipe(buffer.pause());
		
		var t = setTimeout(function(){

			service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
				
				buffer.pipe(service);
				buffer.resume()
			});

			service.pipe(socket);
		
			
		}, latency)
		
	},
	
	drop: function(socket, service){
		
		var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);
		var t = setTimeout(function(){
 			service.end()
			}
			, latency || 33);
		var buffer = ps();
		
		socket.pipe(buffer.pause());
		
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
			buffer.pipe(service);
			buffer.resume()
		});
		
		service.pipe(socket);
	},
	
	unresponsive : function(socket, service){
		service.destroy()
	},
	
	bumpy: function(socket, service){
		
		var buffer = ps();
		
		var tm;
						
		socket.pipe(service).pipe(buffer).pipe(socket)						
		
		service.on('end', function(){
			clearTimeout(tm)
		});
		
		
		service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){			
						
			buffer.resume();

			function swing(){
								
				if(buffer.paused){
					buffer.resume()
				}
				
				else {
					buffer.pause()
				};
				
				var l = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);
				
				tm = setTimeout(swing, l)
				
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