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
clone = require('clone');

handle = {
    'testcase': function (req, res) {
        res.writeHead(200);
        res.end(req.serConfig.code.toString())
    }
};

config = {
    global: {
        '*': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'normal',
            code: 1
        },
        '10007': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'normal',
            code: 2
        }
    }
};

nmp = netmorphic(config, handle, false, 3203);

nmp.forEach(function (e) {
    e.app.listen(e.port)
});

module.exports['test http log emitter'] = function (test) {

    test.expect(24);

    var options = {
        host: 'localhost',
        port: 3203,
        path: '/'
    };

    var events = [],
        uuid;


    nmp[1].app.on('netmorphic-begin-event', function (event) {
        events.push(clone(event));
    });

    nmp[1].app.on('netmorphic-end-event', function (event) {
        events.push(clone(event))
    });

    http.get(options).on('response', function (res) {
        var data = '';
        res.on('data', function (d) {
            data += d
        });
        res.on('end', function () {
            var names = ['connection', 'request', 'handler', 'proxy'];
            setTimeout(function () {
                var len = events.length / 2;
                for (var i = 0; i < len; i++) {
                    test.equals(events[i].name, events[events.length - 1 - i].name);
                    test.equals(events[i].name, names[i]);
                    test.equals(events[i].clazz, 'begin');
                    test.equals(events[events.length - 1 - i].clazz, 'end');
                    uuid = uuid || events[i].uuid;
                    test.equals(events[i].uuid, events[events.length - 1 - i].uuid);
                    test.equals(events[i].uuid, uuid);
                }
                test.done();
            }, 1000)
        })
    });
};


module.exports['test normal service handler'] = function (test) {
    test.expect(12);

    var events = [],
        uuid;

    nmp[0].app.on('netmorphic-begin-event', function (event) {
        events.push(clone(event));
    });

    nmp[0].app.on('netmorphic-end-event', function (event) {
        events.push(clone(event))
    });

    http.get('http://localhost:10007/normal').on('response', function (res) {
        res.on('end', function () {
            var names = ['connection', 'proxy'];
            setTimeout(function () {
                var len = events.length / 2;
                for (var i = 0; i < len; i++) {
                    test.equals(events[i].name, events[events.length - 1 - i].name);
                    test.equals(events[i].name, names[i]);
                    test.equals(events[i].clazz, 'begin');
                    test.equals(events[events.length - 1 - i].clazz, 'end');
                    uuid = uuid || events[i].uuid;
                    test.equals(events[i].uuid, events[events.length - 1 - i].uuid);
                    test.equals(events[i].uuid, uuid);
                }
                test.done();
                nmp.forEach(function (e) {
                    e.app.close()
                });
                endpoint.close();
            }, 1000)
        })
    });
};