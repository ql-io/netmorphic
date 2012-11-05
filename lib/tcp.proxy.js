var net = require('net');
var Handler = require('./tcp.handler');

exports.proxify = function (config, handlers){
		
	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				Handler[h] = handlers[h];
			})
		}())
	};

	console.log(config.type)

	var server = net.createServer(function(socket){
								
		var handler = Handler[config.type];
		
		socket._CONFIG = config;
		
		var serviceSocket = new net.Socket();
		
		handler(socket, serviceSocket)		

	});
			
	return server

};