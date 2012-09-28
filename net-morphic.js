"use strict";

var httpProxy = require('http-proxy'),
    urlUtil = require('url'),
    argv = require('optimist')
        .options('c', {
            'default':null
        })
        .argv,
    handler = require('./lib/handler.js');

var config = argv.c ? require('./configs/' + argv.c) : {};
var scriptInfo = {};

var getconfig = require('./getconfig.js');
var setconfig = require('./setconfig.js');
var run_script = require('./run_script.js');
var stop_script = require('./stop_script.js');
var _default = require('./_default.js');

httpProxy.createServer(

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

).listen(8000);
