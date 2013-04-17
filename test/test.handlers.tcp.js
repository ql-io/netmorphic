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
var http = require('http'),
    netmorphic = require('../').proxy,
    endpoint = require('./server/endpoint.server').listen(3200),
    timer = require('since-when'),
    config = {
        global: {
            '10001': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'normal'
            },
            '10002': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'slow',
                latency: 1000
            },
            '10003': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'flakey',
                hi: 2500,
                lo: 1000
            },
            '10004': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'drop',
                hi: 44,
                lo: 11
            },
            '10005': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'unresponsive'
            },
            '10006': {
                host: '127.0.0.1',
                port: 3200,
                method: 'ALL',
                type: 'bumpy',
                hi: 2500,
                lo: 1000
            }
        }
    };

var nmp = netmorphic(config, null, false, 3203);

nmp.forEach(function (e) {
    e.app.listen(e.port);
    e.app.on('close', function () {});
    e.app.on('error', console.error);
});

endpoint.on('close', function () {
    console.log('end point server closed')
});

module.exports['test normal service handler'] = function (test) {
    test.expect(1);

    http.get('http://localhost:10001/normal').on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.doesNotThrow(function () {
                JSON.parse(data)
            });
            test.done();
        })
    });
};

module.exports['test slow service handler'] = function (test) {
    test.expect(1);
    var time = new timer();
    var expectedDelay = config.global['10002'].latency; // milliseconds

    http.get('http://localhost:10002/slow').on('response', function (res) {
        var data = '',
            t = time.sinceBegin(),
            delay = (t[0] + (t[1] / 1e9)) * 1000;


        test.ok(delay >= expectedDelay);

        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.done();

        })
    });
};


module.exports['test flakey service handler'] = function (test) {
    test.expect(1);

    var time = new timer();

    http.get('http://localhost:10003/flakey').on('response', function (res) {

        var data = '';
        var t = time.sinceBegin();
        var delay = (t[0] + (t[1] / 1e9)) * 1000;
        test.ok(delay >= config.global['10003'].lo && delay <= config.global['10003'].hi);

        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            test.done();
        })
    });
};

module.exports['test drop service handler'] = function (test) {
    test.expect(1);

    http.get('http://localhost:10004/drop').on('response', function (res) {
        res.on('end', function () {
            test.ok(true);
            test.done();
        })
    });
};

module.exports['test unresponsive service handler'] = function (test) {

    test.expect(1);

    var request = http.get('http://localhost:10005/unresponsive').on('response', function () {
        test.ok(false);
        test.done()
    });

    request.on('error', function () {});

    setTimeout(function () {
        test.ok(true);
        test.done();
        request.destroy();
    }, 1000)

};


module.exports['test bumpy service handler'] = function (test) {

    test.expect(1);

    var time = new timer();

    var request = http.get('http://localhost:10006/bumpy').on('response', function (res) {

        var t = time.sinceBegin();
        var delay = (t[0] + (t[1] / 1e9)) * 1000;

        res.on('end', function () {

            test.ok(delay >= config.global['10006'].lo && delay <= config.global['10006'].hi);

            test.done();

            request.destroy();

            fin();

        })

    });

};

function fin() {
    nmp.forEach(function (e) {
        e.app.close()
    });

    endpoint.close();
}