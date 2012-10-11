var httpProxy = require('http-proxy'),
    urlUtil = require('url'),
    Handler = require('./handler.js');
		
var scriptInfo = {}
  , getconfig = require('./getconfig.js')
  , setconfig = require('./setconfig.js')
  , run_script = require('./run_script.js')
  , stop_script = require('./stop_script.js')
  , _default = require('./_default.js')
  ;

module.exports = function(config, handler){
		
	var config = config;
	
	handler = handler || Handler;
	
	var proxy = httpProxy.createServer(

	    function (req, res, proxy) {
		
	        var serConfig = config[req.url];

	        if (serConfig) {

	            handler[serConfig.type](req, res, proxy, serConfig);

	            return;

	        }

	        else {

			    var pathname = urlUtil.parse(req.url).pathname;

			    if (pathname == '/getconfig') getconfig(req, res, config) ;

			    else if (pathname == '/setconfig') setconfig(req, res, config) ;

			    else if (pathname == '/run') run_script(req, res, config, scriptInfo) ;

			    else if (pathname == '/stop') stop_script(scriptInfo) ;

			    else _default(req, res);

			    return;

			}

	    }

	);
	
	// return the config so the user can modify it in their application
		
	return {server: proxy, config: config};
	
}