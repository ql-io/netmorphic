var express = require('express');
var Model = require('scuttlebutt/model');
var Net = require('net');
var model = new Model();

module.exports = function(port){

    port = port || 3100;

	var gossip = Net.createServer(function(socket){
		socket.pipe(model.createStream()).pipe(socket);
	}).listen(port);

    var app = express.createServer();
	app.gossip = gossip;
	
	return app;

}