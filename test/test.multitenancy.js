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
var config, timer;

var http = require('http');
var netmorphic = require('../').proxy,
    endpoint = require('./server/endpoint.server').listen(3200);

handle = {
    'testcase': function (req, res) {
        res.writeHead(200);
        res.end(req.serConfig.code.toString())
    }
};

config = {
    global: {
        '/path': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'testcase',
            code: 1
        }
    },
    test: {
        '/{key}': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'testcase',
            code: 2
        },
        addresses: ['12.34.56.78']
    }
};

nmp = netmorphic(config, handle, false, 3203);

nmp[0].app.listen(3203);

module.exports['test global route'] = function (test) {
    test.expect(1);

    var options = {
        host: 'localhost',
        port: 3203,
        path: '/path'
    };

    http.get(options).on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.equal(config.global['/path'].code, parseInt(data));
            test.done()
        })
    });
};

module.exports['test test tenant route'] = function (test) {
    test.expect(1);

    var options = {
        host: 'localhost',
        port: 3203,
        path: '/eagle',
        headers: {
            'X-Forwarded-For': '12.34.56.78'
        }
    };

    http.get(options).on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.equal(config.test['/{key}'].code, parseInt(data));
            test.done();
            endpoint.close();
            nmp[0].app.close()
        })
    }).on('error', console.error);
};