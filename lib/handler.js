/*
 * Copyright 2013 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var httpProxy = require('http-proxy'),
    urlUtil = require('url');

/*
 // add wait_then_drop(), or add latency to drop service
 */


var handler = {
    normal: function (req, res) {
        var config = req.serConfig;
        var proxy = req.proxy;
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host: config.host || '127.0.0.1',
            port: config.port || 80,
            https: config.https || false
        });
    },
    slow: function (req, res) {
        var config = req.serConfig;
        var proxy = req.proxy;
        var buffer = httpProxy.buffer(req);
        req.url = getUrl(req.url, config.url);
        setTimeout(function () {
            proxy.proxyRequest(req, res, {
                host: config.host || req.headers.host,
                port: config.port || 80,
                buffer: buffer,
                https: config.https || false
            });
        }, config.latency || 1000);
    },
    flakey: function (req, res) {
        var config = req.serConfig;
        var proxy = req.proxy;
        var buffer = httpProxy.buffer(req);
        config.hi = config.hi || 1000;
        config.lo = config.lo || 100;
        var latency = getLatency(config.lo, config.hi);

        setTimeout(function () {
            req.url = getUrl(req.url, config.url);
            proxy.proxyRequest(req, res, {
                host: req.headers.host || '127.0.0.1',
                port: config.port || 80,
                buffer: buffer,
                https: config.https || false
            });
        }, latency);
    },
    unresponsive: function (req) {

        req.proxy.close()

    },
    drop: function (req, res) {
        var config = req.serConfig;
        req.requestEvent.cb();
        res.writeHead(200);
        setTimeout(function () {
            res.end()
        }, config.latency || 100)
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

Object.keys(handler).forEach(function (e) {
    exports[e] = handler[e]
});