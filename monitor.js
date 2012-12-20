var express = require('express');
var Model = require('scuttlebutt/model');
var Net = require('net');

module.exports = function(){
	
	// this has been hacked
	// it starts two tcp servers just in case
	// one for http (3100)
	// one for tcp (3101)
	// no big deal
	
	var count = 2;
	
	var gossips = [];
	
	var port = 3100;
	
	for(var x = 0; x < count; x++){
		var model = new Model();
		var gossip = Net.createServer(function(socket){
			socket.pipe(model.createStream()).pipe(socket);
		}).listen(port++);
	}
	
    var app = express.createServer();
	app.gossips = gossips;
	
	return app;

}