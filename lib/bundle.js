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
var domready = require('domready'),
    xhr = new XMLHttpRequest();

domready(function () {
    var container = document.getElementById("jsoneditor");
    var save = document.getElementById("save");

    var editor = new JSONEditor(container);
    xhr.open('GET', '../getConfig', true);
    xhr.onload = function () {
        editor.set(JSON.parse(xhr.responseText));
    };
    xhr.send();
    save.onclick = function () {
        var json = editor.get();
        var trx = new XMLHttpRequest();
        try {
            var j = JSON.stringify(json);
            trx.open('GET', '../setconfig?config=' + encodeURI(j), true);
            trx.send()
        }
        catch (e) {
            alert('JSON error')
        }
    }
});