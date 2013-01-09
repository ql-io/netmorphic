var express = require('express');
var Model = require('scuttlebutt/model');
var Net = require('net');

module.exports = function(port){

	var model = new Model();
	var gossip = Net.createServer(function(socket){
		socket.pipe(model.createStream()).pipe(socket);
	}).listen(port || 3100);
	
    var app = express.createServer();
	app.gossip = gossip;
	
	return app;

}