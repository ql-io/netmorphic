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
/*
 This fancy test does a few things.
 It constructs two netmorphics server bundles, with two different configartions
 It starts the http proxies for both instances
 It starts a scuttlebutt instance by calling the monitor
 The two netmorphics proxies connect to the scuttlebutt
 Using the setConfig API, we change a parameter of ONE instance's config
 This trigger the the gossip chain
 And the other netmorphic proxy gets an update from the scuttlebutt, and gets a new config--the config from the other netmorphic.
 A request is sent to the SECOND netmorphic proxy instance, getConfig
 if the test passes, the second now has the same config as the first
 */
'use strict';
var http = require('http'),
    proxy = require('../').proxy,
    Monitor = require('../').monitor,
    config = require('./server/ambos.json'),
    config2 = require('./server/ambos2.json'),
    sample_handlers = require('./server/sample.handlers.js');

var clustered = true;

module.exports['see inline comments for explanation of this test'] = function (test) {

    test.expect(2);
    var x = 0;
    var path = "*";

    var servers1 = proxy(config, sample_handlers, clustered, 3201);

    var servers2 = proxy(config2, sample_handlers, clustered, 3206);

    var monitor = Monitor(3100).gossip;

    var server1 = servers1[1].app,
        server2 = servers2[1].app;

    server1.listen(3201);
    server2.listen(3206);

    server1.on('listening', function () {
        var req = http.get('http://localhost:3201/setConfig?tenant=global&srcUrl=' + path + '&latency=' + (x += 200)).on('response', function (res) {
            test.equal(res.statusCode, 200);
            res.on('data', function () {
            })
        });

        req.on('error', function () {});

        req.end()

    });

    server2.on('listening', function () {

        setTimeout(function () {

            var req = http.get('http://localhost:3206/getConfig?tenant=global&srcUrl=' + path).on('response', function (res) {
                res.on('data', function (data) {
                    var d = JSON.parse(data);
                    test.ok(d['latency'] == x);
                    test.done();
                    monitor.close();
                    server1.close();
                    server2.close();
                })
            }, 2000);

            req.end()


        }, 1000)

    });

};