var httpProxy = require('http-proxy')
  , urlUtil = require('url')
  ,	http = require('http')
  , Router = require('./router')
  , Model = require('scuttlebutt/model')
  , Net = require('net')
  , DNS = require('dns')
  , scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , _default = require('./_default.js')
  , IP_ADDRESSES = {}
  , paths = {}
  , util = require('util')
  , _ = require('underscore')
;

var configuration_server = require('./config.server');

module.exports = function(config, handlers, clustered){	
				
	var config = config
	  , handler = handlers.http
	  , route
	  , m = undefined
	  , model = undefined
	;
		
	resetConfig(config);
	
	var proxy = httpProxy.createServer(

	    function (req, res, proxy) {
				
		    req.proxy = proxy;
			
			route(req, res, function(){
				
			    _default(req, res);
			
			});

            return;

	    }

	);
	
	
	proxy.on('listening', onlisten)
	
	return {server: proxy, config: config};
		
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
				handler[type](req, res);	
			}
		})
	};	

	function resetConfig(_config){
		
		route = Router();
		
		route.get('/getconfig', function(req, res){
			getconfig(req, res, config, true)
		});

		route.get('/setconfig', function(req, res){
			config = setconfig(req, res, config, model);
		});

		route.get('/config/{x}?/{y}', function(req, res){
			configuration_server(req, res)
		});
		
		if(!_.contains(Object.keys(_config), 'global')) {
			config = {'global' : _config};
		}
		
		for (aught in config){
			var name = aught;
			var ips = config[aught]["addresses"] || [];
			ips.forEach(function(e){
				IP_ADDRESSES[e] = {name: name, config: config[aught]};
			})
			paths.__ALL__ = []
			for(path  in config[aught]) {
			    if(path.toLowerCase() == "addresses") (function(){}());
				else if(!isNaN(path)) (function(){}());
				else {
					paths[path] = path;
					paths.__ALL__.push(path)
					var c = config[aught][path];
					var method = c.method.toLowerCase();

					setRouteMulti(method, path, c)	
				}
			}
		}
				
	};
		
	function onlisten(){
		
		if(clustered){

			model = new Model();

			var net;
			
			nis();
			
			pipe();
			
			model.on('update', function(key, v){			
				if(key == 'config'){
					
					if('string' == typeof v){
						config = JSON.parse(v);
					}
					
					else config = v;
					
					resetConfig(config)
			
				}
				return;
			});

			function nis(){

				net = Net.connect(3100, function(){

					console.log(process.pid + ' connected to scuttlebutt')

					net.on('close', nis);

					net.on('error', function(e){

						console.error(e);

						setTimeout(function(){

							nis();
							
							pipe();

						}, 1000) // wait a sec and reconnect

					})

				});

			};

			function pipe(){

				m = model.createStream();

				m.pipe(net).pipe(m);

			};

		};	
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

					net = Net.connect(3101, function(){

						console.log(process.pid + ' connected to scuttlebutt on port 3101')

						net.on('close', nis);

						net.on('error', function(e){

							console.error('ERROE', e);

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
}