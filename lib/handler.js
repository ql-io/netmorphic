var httpProxy = require('http-proxy')
  ,  urlUtil = require('url');

/*
// add wait_then_drop(), or add latency to drop service
*/


var handler =

{
    normal:function (req, res, proxy, config) {
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host:config.host || 'hostname',
            port:config.port || 80
        });
    },
    slow:function (req, res, proxy, config) {
        var buffer = httpProxy.buffer(req);
        setTimeout(function () {
            req.url = getUrl(req.url, config.url);
            proxy.proxyRequest(req, res, {
                host:config.host || 'hostname',
                port:config.port || 80,
                buffer:buffer
            });
        }, config.latency || 10000);
    },
    flakey:function (req, res, proxy, config) {
        var buffer = httpProxy.buffer(req);
        config.hi = config.hi || 10000;
        config.lo = config.low || 100;
        var latency = getLatency(config.lo, config.hi);

        setTimeout(function () {
            req.url = getUrl(req.url, config.url);
            proxy.proxyRequest(req, res, {
                host:config.host || 'hostname',
                port:config.port || 80,
                buffer:buffer
            });
        }, latency);
    },
    unresponsive:function (req) {
    },
    drop:function (req, res) {
        res.end();
    }
};

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }

    return Math.floor((Math.random() * (hi - lo)) + lo);
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
