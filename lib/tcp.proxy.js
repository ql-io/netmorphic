var Net = require('net');
var Handler = require('./tcp.handler');
var Model = require('scuttlebutt/model');
var model = new Model();


module.exports = function(config, handlers, clustered){

	var ports = [];
	var servers = [];

	var config = config;
	if('string' == typeof config){
		try{	
			config = JSON.parse(config)
		}
		catch(err){
			throw new Error('\nConfig must be an object or a JSON string')
		}
	};

	if(!config) {

		throw new Error('\n No Config Provided')	

	};
	
	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				Handler[h] = handlers[h];
			})
		}())
	};

	for(var x in config){
		// is the port
		if(isNaN(x)) {throw new Error('\nport number isNaN (not a number)'); return}
		x = parseInt(x);
		ports.push(x);
		var s = {};
		s.app = newt(config, config[x], Handler, clustered);
		s.port = x;
		servers.push(s);
	};
	

	return servers
	
};


function newt (config, c, handlers, clustered){
	
	var server = Net.createServer(function(socket){
								
		var handler = Handler[c.type];
		
		socket._CONFIG = c;
		
		var serviceSocket = new Net.Socket();

		handler(socket, serviceSocket)		

	});
	
	if(clustered){
		
		server.on('listening', function(){
			
			var net;

			function nis(){

				net = Net.connect(3100, function(){

					net.on('close', nis);

					net.on('error', function(e){

						console.error(e);

						setTimeout(function(){

							nis()

						}, 1000)

					})

				});

			};

			nis();

			function pipe(){

				m = model.createStream();

				m.pipe(net).pipe(m);

			};

			pipe();

			model.on('update', function(key, v){
				if(key == 'config'){
					if('string' == typeof v){
						config = JSON.parse(v);
					}
					else config = v;
				}
				return;
			});	

		})
		
	};
				
	return server

};