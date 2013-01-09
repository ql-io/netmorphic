var httpProxy = require('http-proxy')
  ,  urlUtil = require('url');

/*
// add wait_then_drop(), or add latency to drop service
*/


var handler =
{
    normal:function (req, res) {
	    var config = req.serConfig;
		var proxy = req.proxy;
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host:config.host || '127.0.0.1',
            port:config.port || 3200,
			https: config.https || false
        });
    },
    slow:function (req, res, proxy) {
	    var config = req.serConfig;
		var proxy = req.proxy;
        var buffer = httpProxy.buffer(req);
        req.url = getUrl(req.url, config.url);
        setTimeout(function () {
            proxy.proxyRequest(req, res, {
                host:config.host || req.headers.host,
                port:config.port || 80,
                buffer:buffer,
				https: config.https || false
            });
        }, config.latency || 1000);
    },
    flakey:function (req, res, proxy) {
	    var config = req.serConfig;
		var proxy = req.proxy;
        var buffer = httpProxy.buffer(req);
        config.hi = config.hi || 1000;
        config.lo = config.lo || 100;
        var latency = getLatency(config.lo, config.hi);

        setTimeout(function () {
            req.url = getUrl(req.url, config.url);
            proxy.proxyRequest(req, res, {
                host:req.headers.host || '127.0.0.1',
                port:config.port || 80,
                buffer:buffer,
				https: config.https || false
            });
        }, latency);
    },
    unresponsive:function (req) {
    },
    drop:function (req, res) {
	    var config = req.serConfig;
		if(config.latency){
			req.requestEvent.cb()
			setTimeout(function(){res.end()}, config.latency)
		}
		else res.end();
		req.requestEvent.cb();
    }
};

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }
    return ((hi - lo) * Math.random()) + lo;
}


function getUrl(url, configUrl) {
    if (configUrl) {
        var parsed = urlUtil.parse(url);
        return configUrl + (parsed.search || '') + (parsed.hash || '');
    }
    return url;
}

Object.keys(handler).forEach(function(e){
  exports[e] = handler[e]
});
