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
var Net = require('net');
var Handler = require('./tcp.handler');
var Model = require('scuttlebutt/model');
var model = new Model();

module.exports = function (config_opt, handlers, clustered) {

    var ports = [];
    var servers = [];

    var config = config_opt;
    if ('string' == typeof config) {
        try {
            config = JSON.parse(config)
        }
        catch (err) {
            throw new Error('\nConfig must be an object or a JSON string')
        }
    }

    if (!config) {

        throw new Error('\n No Config Provided')

    }

    if (handlers) {
        (function () {
            Object.keys(handlers).forEach(function (h) {
                Handler[h] = handlers[h];
            })
        }())
    }

    for (var x in config) {
        // is the port
        if (isNaN(x)) {
            throw new Error('\nport number isNaN (not a number)');
        }
        x = parseInt(x);
        ports.push(x);
        var s = {};
        s.app = newt(config, config[x], clustered);
        s.port = x;
        servers.push(s);
    }


    return servers

};


function newt(config, c, clustered) {

    var server = Net.createServer(function (socket) {

        var handler = Handler[c.type];

        socket._CONFIG = c;

        var serviceSocket = new Net.Socket();

        handler(socket, serviceSocket)

    });

    if (clustered) {

        server.on('listening', function () {

            var net;

            function nis() {

                net = Net.connect(3101, function () {

                    console.log(process.pid + ' connected to scuttlebutt on port 3101');

                    net.on('close', nis);

                    net.on('error', function (e) {

                        console.error('ERROE', e);

                        setTimeout(function () {

                            nis()

                        }, 1000)

                    })

                });

            }

            nis();

            function pipe() {

                var m = model.createStream();

                m.pipe(net).pipe(m);

            }

            pipe();

            model.on('update', function (key, v) {
                if (key == 'config') {
                    if ('string' == typeof v) {
                        config = JSON.parse(v);
                    }
                    else config = v;
                }
            });

        })

    }

    return server

}