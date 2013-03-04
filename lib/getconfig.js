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
var urlUtil = require('url');
var getQuery = require('./getQuery');


module.exports = function (req, res, config) {

    var q = getQuery(urlUtil.parse(req.url).query);

    var tenant = q.tenant || 'global';

    if (q.srcUrl) {

        var serConfig = config[tenant][q.srcUrl];

        if (serConfig) {
            serConfig.pid = process.pid;
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(serConfig));
            res.end();
        }

        else {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write("Bad Url");
            res.end();
        }

    }

    else {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(config));
        res.end();
    }

};