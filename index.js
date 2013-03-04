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
var proxy = require('./lib/_proxy'),
    _ = require('underscore'),
    monitor = require('./monitor'),
    fs = require('fs');

var Handlers = {};

Handlers.tcp = require('./lib/tcp.handler');
Handlers.http = require('./lib/handler');

module.exports.monitor = monitor;

module.exports.proxy = function (config, handlers, cluster, httpPort, httpsPort, certs) {

    try {
        fs.readdirSycn('./netmorphic-configs')
    }
    catch (err) {
        try {
            fs.mkdirSync('./netmorphic-configs')
        }
        catch (err) {}
    }

    if (arguments.length == 1 && arguments[0][config]) {
        // an option object has been passed
        var opts = arguments[0];
        config = opts.config;
        handlers = opts.handlers || null;
        cluster = opts.cluster || false;
        httpPort = opts.httpPort || undefined;
        httpsPort = opts.httspPort || undefined;
        certs = opts.certs || undefined;
    }

    if (config && !_.contains(Object.keys(config), 'global')) {
        config = {
            'global': config
        };
    }

    if (handlers) {
        (function () {
            Object.keys(handlers).forEach(function (h) {
                Handlers.tcp[h] = Handlers.http[h] = handlers[h];
            })
        }())
    }

    return proxy(config, Handlers, cluster, httpPort, httpsPort, certs);

};