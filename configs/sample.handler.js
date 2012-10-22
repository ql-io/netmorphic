var httpProxy = require('http-proxy')
  ,  urlUtil = require('url');

module.exports = function (req, res) {
    config = req.serConfig;
	proxy = req.proxy;
    var buffer = httpProxy.buffer(req);
    setTimeout(function () {
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host:config.host || '127.0.0.1',
            port:config.port || 3200,
            buffer:buffer
        });
    }, config.latency || 1000);
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