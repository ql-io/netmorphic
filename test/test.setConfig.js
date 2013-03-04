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
var http, netmorphic, config, endpoint, timer;

http = require('http');
netmorphic = require('../').proxy;
endpoint = require('./server/endpoint.server').listen(3200);

handle = {
    'testcase': function (req, res) {
        res.writeHead(200);
        res.end('okay')
    }
};

config = {
    global: {
        '/get': {
            host: '127.0.0.1',
            port: 3200,
            method: 'get',
            type: 'normal'
        }
    }
};

nmp = netmorphic(config, handle, false, 3203);

nmp[0].app.listen(3203);

module.exports['test add new route'] = function (test) {
    test.expect(1);

    http.get('http://localhost:3203/setConfig?tenant=global&srcUrl=/fam&host=127.0.0.1&port=3200&type=testcase').on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            TEST()
        })
    });

    function TEST() {
        // try the new route
        http.get('http://localhost:3203/fam').on('response', function (res) {
            var data = '';
            res.on('data', function (d) {
                data += d
            });
            res.on('end', function () {
                test.equals('okay', data);
                test.done();
                endpoint.close();
                nmp[0].app.close()
            })
        });
    }

};