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
var _ = require('underscore');
var urlUtil = require('url');
var getQuery = require('./getQuery');
var fs = require('fs'),
    from = require('from'),
    es = require('event-stream');

module.exports = function (req, res, config, model, setRouteMulti) {

    var configEvent = req.self.beginEvent({
        parent: req.connection.connectionEvent,
        name: 'setConfig',
        message: 0,
        cb: function () {}
    });

    var q = getQuery(urlUtil.parse(req.url).query);

    var tenant = q.tenant || 'global';

    if (q.srcUrl) {

        var serConfig = config[tenant][q.srcUrl];

        if (serConfig) {
            _.chain(q)
                .keys()
                .without('srcUrl')
                .without('tenant')
                .each(function (key) {
                    switch (key) {
                        case 'lo':
                        case 'hi':
                        case 'latency':
                        case 'port':
                            q[key] = parseInt(q[key]);
                    }
                    serConfig[decodeURIComponent(key)] = decodeURIComponent(q[key]);
                })
                .value();

            if (model) model.set('config', config);

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(serConfig));
            res.end();
        }

        else {
            serConfig = {};
            _.chain(q)
                .keys(q)
                .without('tenant')
                .without('srcUrl')
                .each(function (key) {
                    switch (key) {
                        case 'lo':
                        case 'hi':
                        case 'latency':
                        case 'port':
                            q[key] = parseInt(q[key]);
                    }
                    if (!serConfig.method) serConfig.method = 'all';
                    serConfig[decodeURIComponent(key)] = decodeURIComponent(q[key]);
                }).value();

            config[tenant][q.srcUrl] = serConfig;

            setRouteMulti(serConfig.method, q.srcUrl, serConfig);

            if (model) model.set('config', config);

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(serConfig));
            res.end();
        }
    }
    else if (q.config) {
        config = JSON.parse(decodeURI(q.config));
        if (model) model.set('config', config);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(config));
        res.end();
    }
    else {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.write("Bad tenant or srcUrl");
        res.end();
    }

    req.requestEvent.cb();
    configEvent.cb();

    from(function getChunk() {
        this.emit('data', config);
        this.emit('end');
    })
        .pipe(es.stringify())
        .pipe(fs.createWriteStream('./netmorphic-configs/' + new Date().getTime() + '.json'));

    return config;

};