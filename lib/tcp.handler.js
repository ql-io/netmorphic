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
		var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.high);
        
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
		var latency;
		if(socket._CONFIG.latency) latency = socket._CONFIG.latency;
		if(!socket._CONFIG.latency){
			if(socket._CONFIG.lo && socket._CONFIG.high) latency = getLatency(socket._CONFIG.lo, socket._CONFIG.high);
			else latency = 0
		}
		
		var t = setTimeout(function(){
			socket.end();
		}, latency);
	}
}

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }

    return Math.floor((Math.random() * (hi - lo)) + lo);
}