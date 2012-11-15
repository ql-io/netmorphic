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
  ;

module.exports = function(config, handlers, clustered, multi){

	var route = Router();
			
	var config = config;
	
	var handler = Handler;
	
	var m = undefined;
	
	var multi = !config[Object.keys(config)[0]].host;
		
	if(clustered){
		
		var model = new Model();

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
	
	function setRouteMulti(method, path, c, type){
		route[method.toLowerCase()](path, function(req, res){
//			console.log(process.pid, c[req.connection.remoteAddress].type)
			
			var xff = req.headers['X-Forwarded-For'];
			if(!xff){
				xff = req.connection.remoteAddress;
				handlefn(null, xff)
				//DNS.reverse(req.connection.remoteAddress, handlefn)
			} 
			
			else handlefn(null, xff);
			
			function handlefn(err, ip){
								
				if(err) console.error(err);
								
				var tenant = config[ip] || config.default
												
				if(!tenant) {
					res.writeHead(400);
					res.end('ERROR: unknown client IP');
					return
				}
				
				else{
					req.serConfig = tenant[path];
				}
				console.log(req.serConfig.type)
				if(!handler[type]) {
					res.writeHead(400);
					res.end('\nNo Handler "'+ type +'" provided for config["'+path+'"]');
					return;
				};
				handler[req.serConfig.type](req, res);	
			}
		})
	};

	if(multi){
		route.get('/getconfig', function(req, res){
			getconfig(req, res, config, true)
		});
		
		route.get('/setconfig', function(req, res){
			setconfig(req, res, config, model, true);
		});
	}

	if(!multi){
		route.get('/getconfig', function(req, res){
			getconfig(req, res, config, false)
		});

		route.get('/setconfig', function(req, res){
			setconfig(req, res, config, model, false);
		});	
	}

	route.get('/run_script', function(req, res){
		run_script(req, res, config, scriptInfo)
	});

	route.get('/stop_script', function(req, res){
		stop_script(scriptInfo)
	});
	
	for (var aught in config){
		if(!config[aught].host){
			// multi-tenant config
			for (var _c in config[aught]){
				var c = config[aught][_c]
				var type = c.type
				  , path = _c
				  , h = c.type
				  , method = c.method.toLowerCase();
				
				setRouteMulti(method, path, c, h, config)
			}
		}
		else{
			//singe tenant config
			var c = config[aught]

			var path = aught
			  , method = c.method.toLowerCase()
			  , h = c.type
			  ;

			setRoute(method, path, c, h)
		}
	}
	
	/*
	
	Object.keys(config).forEach(function(e){
		
		var c = config[e]
		
		var path = e
		  , method = c.method.toLowerCase()
		  , h = c.type
		  ;
		
		setRoute(method, path, c, h)
		
	});
	
	*/
		
	var proxy = httpProxy.createServer(

	    function (req, res, proxy) {
				
		    req.proxy = proxy;
			
			route(req, res, function(){
				
			    _default(req, res);
			
			});

            return;

	    }

	);
	
	// return the config so the user can modify it in their application
		
	return {server: proxy, config: config};
	
}