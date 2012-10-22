var net = require('net');
var Handler = require('./tcp.handler');

// returns a net socket proxy based on configuration
// it will listen on its port
// proceed according to the handler
// and proxy or drop the socket to a single end point

module.exports = function(config){

	var server = net.createServer(function(socket){
		
		var handler = Handler[config.type]

		socket._CONFIG = config;
		
		var serviceSocket = new net.Socket();
		
		handler(socket, serviceSocket)

	});
		
	return server
};