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
var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    netmorphic = require('../').proxy,
    timer = require('since-when'),
    ssl = require('ssl-keygen'),
    key = ssl.createKeyGen({
        size: 1024,
        root: __dirname + '/'
    }),
    endpoint;

key.createCA('green', false, function () {
    var options = {
        key: fs.readFileSync('test/certs/green.key'),
        cert: fs.readFileSync('test/certs/green.crt')
    };

    endpoint = https.createServer(options, function (req, res) {
        res.writeHead(200);
        res.end('hello https')
    }).listen(3200);

    endpoint.on('error', console.error);
});

var handle = {
    'testcase': function (req, res) {
        var config = req.serConfig;
        var proxy = req.proxy;
        proxy.proxyRequest(req, res, {
            host: config.host || '127.0.0.1',
            port: config.port || 80,
            https: true
        });
    }
};

var config = {
    global: {
        '/': {
            host: '127.0.0.1',
            port: 3200,
            method: 'get',
            type: 'testcase',
            https: true
        }
    }
};

var certs = {
    key: 'test/certs/green.key',
    cert: 'test/certs/green.crt'
};

var nmp = netmorphic(config, handle, false, 3203, 4430, certs);

nmp[1].app.listen(4430);

module.exports['test https proxy'] = function (test) {

    test.expect(1);

    https.get('https://localhost:4430/').on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.equals('hello https', data);
            test.done();
            endpoint.close();
            nmp[1].app.close();
        });
        res.on('error', function (e) {
            console.error(e)
        })
    });


};