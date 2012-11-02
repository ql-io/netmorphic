/*
	all this server does is share the configurations between clustered proxies
*/

var Model = require('scuttlebutt/model');
var Net = require('net');

var model = new Model();

Net.createServer(function(socket){

	socket.pipe(model.createStream()).pipe(socket);

}).listen(4111);
