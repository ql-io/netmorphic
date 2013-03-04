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
var getConfig = require('../lib/getconfig.js'),
    http = require('http'),
    fs = require('fs'),
    _ = require('underscore'),
    config = JSON.parse(fs.readFileSync('configs/sample.config.json'));

var server = http.createServer(function (req, res) {

    if (config && !_.contains(Object.keys(config), 'global')) {
        config = {
            'global': config
        };
    }
    getConfig(req, res, config)

}).listen(3300);


module.exports['get individual service config'] = function (test) {

    test.expect(1);

    http.get('http://localhost:3300/getConfig?tenant=global&srcUrl=*').on('response', function (res) {
        test.equal(res.statusCode, 200);
        test.done();
    });

};

module.exports['get entire config'] = function (test) {

    test.expect(1);

    http.get('http://localhost:3300/getConfig').on('response', function (res) {
        test.equal(res.statusCode, 200);
        server.close();
        test.done()
    });

};