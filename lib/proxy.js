var httpProxy = require('http-proxy')
  , urlUtil = require('url')
  ,	http = require('http')
  , Handler = require('./handler.js')
  , Router = require('./router')
  , Model = require('scuttlebutt/model')
  , Net = require('net')
  , DNS = require('dns')
  , scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , run_script = require('./run_script.js')
  , stop_script = require('./stop_script.js')
  , _default = require('./_default.js')
  , IP_ADDRESSES = {}
  , paths = {}
  ;

var configuration_server = require('./config.server');

module.exports = function(config, handlers, clustered, multi){
	
	var route = Router();
			
	var config = config;
	
	var handler = Handler;
	
	var m = undefined, model = undefined;
	
	var multi = Object.keys(config).length > 1;
			
	if(clustered){
		
		model = new Model();

		var net;
				
		function nis(){
			
			net = Net.connect(3100, function(){
				
				console.log(process.pid + ' connected to scuttlebutt')
				
				net.on('close', nis);
				
				net.on('error', function(e){
					
					console.error(e);
		
					setTimeout(function(){
						
						nis()
						
					}, 1000)
					
				})
				
			});
			
		};
		
		function pipe(){
		
			m = model.createStream();

			m.pipe(net).pipe(m);

		};
			
		setTimeout(function(){
			nis();
			pipe();
		}, 3000);
		
						
		model.on('update', function(key, v){			
			if(key == 'config'){
				if('string' == typeof v){
					config = JSON.parse(v);
				}
				else config = v;
			}
			return;
		});
		
	};

	if(handlers){
		(function(){
			Object.keys(handlers).forEach(function(h){
				handler[h] = handlers[h];
			})
		}())
	};
		
	function setRoute(method, path, config, type){
		route[method.toLowerCase()](path, function(req, res){
			req.serConfig = config;
			if(!handler[type]) {
				res.writeHead(400);
				res.end('\nNo Handler "'+ type +'" provided for config["'+path+'"]');
				return;
			};
			handler[type](req, res);
		})
	};
	
	function setRouteMulti(method, path){

		route[method](path, function(req, res){
												
			var xff = req.headers['X-Forwarded-For'];
			if(!xff){
				xff = req.connection.remoteAddress;
				handlefn(null, xff)
				//DNS.reverse(req.connection.remoteAddress, handlefn)
			} 
			
			else handlefn(null, xff);
			
			function handlefn(err, ip){
								
				if(err) console.error(err);
								
				var tenant = IP_ADDRESSES[ip] // || 'global';
								
				if(tenant.config == undefined){
					res.writeHead(400);
					res.end('\No tenant specified for ADDRESS %s and no global tenant either', ip);
					return;					
				}

				req.serConfig = config[tenant.name][path];

				var type = config[tenant.name][path].type;
				if(!handler[type]) {
					res.writeHead(400);
					res.end('\nNo Handler "'+ type +'" provided for config["'+path+'"]');
					return;
				};
				handler[type](req, res);	
			}
		})
	};

	route.get('/getconfig', function(req, res){
		getconfig(req, res, config, true)
	});

	route.get('/setconfig', function(req, res){
		config = setconfig(req, res, config, model, multi);
		console.log(config)
		});
	
	route.get('/config/{x}?/{y}', function(req, res){
		configuration_server(req, res)
	});		

	route.get('/run_script', function(req, res){
		run_script(req, res, config, scriptInfo)
	});

	route.get('/stop_script', function(req, res){
		stop_script(scriptInfo)
	});
	
	if(multi){		
		for (aught in config){
			var name = aught;
			var ips = config[aught]["addresses"] || [];
			ips.forEach(function(e){
				IP_ADDRESSES[e] = {name: name, config: config[aught]};
			})
			paths.__ALL__ = []
			for(path  in config[aught]) {
			    if(path.toLowerCase() == "addresses") (function(){}()); 
				else {
					paths[path] = path;
					paths.__ALL__.push(path)
					var c = config[aught][path];
					var method = c.method.toLowerCase();

					setRouteMulti(method, path, c)	
				}
			}
		}		
	}
	
	else{
		for (aught in config){
			var name = aught || 'global';
			var ips = config[aught]['addresses'];
			paths.__ALL__ = []
			
			for(path in config[aught]){
				if(path.toLowerCase() == 'addresses') return;
				else {
					paths[path] = path;
					paths.__ALL__.push(path);
					var c = config[aught][path];
					var method = c.method.toLowerCase();

					setRouteMulti(method, path, c)
				}
			}
		}
	}
	
	
	var proxy = httpProxy.createServer(

	    function (req, res, proxy) {
				
		    req.proxy = proxy;
			
			route(req, res, function(){
				
			    _default(req, res);
			
			});

            return;

	    }

	);
	
	proxy.on('listening', function(){
//		configuration_server.listen(proxy.address().port + 1)
	})
	
	// return the config so the user can modify it in their application
	return {server: proxy, config: config};
	
}