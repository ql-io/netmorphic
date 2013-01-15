var httpProxy = require('http-proxy')
  , urlUtil = require('url')
  ,	http = require('http')
  , Router = require('./router')
  , Model = require('scuttlebutt/model')
  , Net = require('net')
  , DNS = require('dns')
  , fs = require('fs')
  , scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , _default = require('./_default.js')
  , logEmitter = require('./log-emitter')
  , IP_ADDRESSES = {}
  , paths = {}
  , util = require('util')
  , _ = require('underscore')
;

var configuration_server = require('./config.server');

module.exports = function(config, handlers, clustered, httpPort){	
				
	var config = config
	  , clustered = clustered
	  , handler = handlers.http
	  , route
	  , servers = []
	  , IP_ADDRESSES
	  , httpServer = 10
	;
	
	set_IP_addresses()
	
	var http_server = resetConfig();
	
	var tcp_servers = configureTCP();
		
	servers = servers.concat(tcp_servers, http_server);
				
	return servers
		
	function setRouteMulti(method, path){
			

		route[method](path, function(req, res){
																		
			var xff = req.headers['X-Forwarded-For'];
			if(!xff){
				xff = req.connection.remoteAddress;
				handlefn(null, xff)
			} 			
			
			else handlefn(null, xff);
			
			function handlefn(err, ip){
								
				if(err) console.error(err);
								 	
				var tenant =  IP_ADDRESSES[ip] ? IP_ADDRESSES[ip].name : 'global';

				req.serConfig = config[tenant][path];

				if(req.serConfig == undefined){
					res.writeHead(400);
					res.end('\No tenant specified for ADDRESS %s and no global tenant either for ' + ip);
					return;					
				}

				var type = config[tenant][path].type;
				if(!handler[type]) {
					res.writeHead(400);
					res.end('\nNo Handler "'+ type +'" provided for config["'+path+'"]');
					return;
				};
				
				req.handlerEvent = req.self.beginEvent({
					    parent: req.requestEvent,
				        name: 'handler',
				        message: 0,
				        cb: function(err, results) {
				        }
				    });
								
				handler[type](req, res);	
			}
		})
	};	

	function set_IP_addresses(){
		IP_ADDRESSES = [];
		for (aught in config){
			var ips = config[aught]["addresses"] || [];
			ips.forEach(function(e){
				IP_ADDRESSES[e] = {name: name, config: config[aught]};
			})
		}
	};

	function resetConfig(){  // HTTP + IPs
		
		var httpServer
		  , ct = 0;
		
		route = Router();
		
		route.get('/getconfig', function(req, res){
			getconfig(req, res, config, true);
		});

		route.get('/setconfig', function(req, res){
			config = setconfig(req, res, config, httpServer.model);
		});

		route.get('/config/{x}?/{y}', function(req, res){
			configuration_server(req, res)
		});
		
		for (aught in config){
			var name = aught;
			paths.__ALL__ = []
			for(path  in config[aught]) {
			    if(path.toLowerCase() == "addresses") (function(){}());
				else if(!isNaN(path)) (function(){}());
				else {
					ct++;
					paths[path] = path;
					paths.__ALL__.push(path)
					var c = config[aught][path];
					var method = (c.method && c.method.toLowerCase()) || 'ALL';
					setRouteMulti(method, path, c)	
				}
			}
		}
		
		if(ct) {
			
			httpServer = httpProxy.createServer(function (req, res, proxy) {
				
				req.self = httpServer;
				req.proxy = proxy;
			    
				
				req.requestEvent = httpServer.beginEvent({
					    parent: req.connection.connectionEvent,
				        name: 'request',
				        message: 0,
				        cb: function(err, results) {
				        }
				    });

				route(req, res, function(){
				    _default(req, res);
				});
				
		    });

			onlisten.call(httpServer)

			logEmitter.call(httpServer)

			httpServer.on('listening', function(){
				
				httpServer.on('connection', function(socket){
					
					socket.connectionEvent = httpServer.beginEvent({
					        name: 'connection',
					        message: 0,
					        cb: function(err, results) {
					        }
					    });
					
					socket.on('end', function(){
						socket.connectionEvent.cb();
					})
				});
				
												
				httpServer.proxy.on('start', function(req){
					req.proxyEvent = httpServer.beginEvent({
						    parent: req.handlerEvent || req.requestEvent,
					        name: 'proxy',
					        message: 0,
					        cb: function(err, results) {
					        }
					    });
				});
			
				httpServer.proxy.on('end', function(req) {
		   			req.proxyEvent.cb();
					if(req.handlerEvent) {
						req.handlerEvent.cb();
					}
		            req.requestEvent.cb();
				});					
			});

			
			/*
			httpServer.on('connection', function(socket){
				console.log('connected');
				socket.on('end', function(){
					console.log('ended')
				})
			})
			*/
			
			return [{app: httpServer, port: httpPort || 3201}]
			
		}
		
		else return []
				
	};
	
	function configureTCP(){
		
		// caution! You should pass the config thru resetConfig first (probably)
		
		var servers = [];
		
		for (aught in config){
			var name = aught;
			for(path  in config[aught]) {
			    if(path.toLowerCase() == "addresses") (function(){}());
				if (!isNaN(path)){ // its a port number
					var port = parseInt(path);
					var c = config[aught][path]
					var s = {};
					s.app = newt(c, c.type);
					s.port = port;
					servers.push(s);
				};
			}
		}
		
		return servers
	};
		
	function onlisten(bool){
		
		    var self = this;
				
			if(clustered){

				var m, net; 
				
				self.model = new Model();

				self.on('listening', function(){
					
					nis();

					pipe();
						
				});
				
				self.on('close', function(){

					self.scuttle.end();
						
				});
			
				self.model.on('update', function(key, v){	
											
					if(key[0] == 'config'){
					
					 	config = key[1];
					
//						resetConfig(config)
			
					}
					return;
				});

				function nis(){
				
					self.scuttle = Net.connect(3100, function(){

						console.log(process.pid + ' connected to scuttlebutt')

			//			self.scuttle.on('close', nis);

						self.scuttle.on('error', function(e){
														
							console.error(e);

							setTimeout(function(){

								nis();
							
								pipe();

							}, 1000) // wait a sec and reconnect

						})

					});

				};

				function pipe(){

					m = self.model.createStream();

					m.pipe(self.scuttle).pipe(m);

				};

			};
		};
	
	function newt (c, h){

		var server = Net.createServer(function(socket){
			// open event
			
			socket.connectionEvent = server.beginEvent({
			        name: 'connection',
			        message: 0,
			        cb: function(err, results) {
			        }
			    });

			var handler = handlers.tcp[h];

			socket._CONFIG = c;

			socket.beginEvent = server.beginEvent;

			var serviceSocket = new Net.Socket();
			
			serviceSocket.on('close', function(){
//				console.log('service socket closed')
			})
			
			socket.handlerEvent = server.beginEvent({
					parent: socket.connectionEvent,
			        name: 'handler',
			        message: 0,
			        cb: function(err, results) {
			        }
			    });

			handler(socket, serviceSocket)	
			
			socket.on('end', function(){
				if(socket.handlerEvent) socket.handlerEvent.cb();
				socket.connectionEvent.cb();
			})
			
		});
		
		onlisten.call(server)
		
		logEmitter.call(server)
		
		return server

	};		
	
}