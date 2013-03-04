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
var ps = require('pause-stream');

module.exports = {
    normal: function (socket, service) {

        var buffer = ps();

        socket.pipe(buffer.pause());

        service.connect(socket._CONFIG.port, socket._CONFIG.host, function () {

            buffer.pipe(service);
            buffer.resume()

        });

        service.pipe(socket);
    },

    slow: function (socket, service) {

        var buffer = ps();

        socket.pipe(buffer.pause());

        setTimeout(function () {

            service.connect(socket._CONFIG.port, socket._CONFIG.host, function () {
                buffer.pipe(service);
                buffer.resume()
            });

            service.pipe(socket);


        }, socket._CONFIG.latency)

    },

    flakey: function (socket, service) {

        var buffer = ps();
        var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);

        socket.pipe(buffer.pause());

        setTimeout(function () {

            service.connect(socket._CONFIG.port, socket._CONFIG.host, function () {

                buffer.pipe(service);
                buffer.resume()
            });

            service.pipe(socket);


        }, latency)

    },

    drop: function (socket, service) {

        var latency = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);
        setTimeout(function () {
            service.end()
        }, latency || 33);
        var buffer = ps();

        socket.pipe(buffer.pause());

        service.connect(socket._CONFIG.port, socket._CONFIG.host, function () {
            buffer.pipe(service);
            buffer.resume()
        });

        service.pipe(socket);
    },

    unresponsive: function (socket, service) {
        service.destroy()
    },

    bumpy: function (socket, service) {

        var buffer = ps();

        var tm;

        socket.pipe(service).pipe(buffer).pipe(socket);

        service.on('end', function () {
            clearTimeout(tm)
        });


        service.connect(socket._CONFIG.port, socket._CONFIG.host, function () {

            buffer.resume();

            function swing() {

                if (buffer.paused) {
                    buffer.resume()
                }

                else {
                    buffer.pause()
                }

                var l = getLatency(socket._CONFIG.lo, socket._CONFIG.hi);

                tm = setTimeout(swing, l);
            }

            swing();

        });

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