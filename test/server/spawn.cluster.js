var Cluster = require('../../http.cluster');
var config = require('../../configs/sample.config.json');
var timer = require('since-when');
var exHandler = require('../../configs/sample.handler.js');
var endpoint = require('./endpoint.server').listen(3200);

var proxy = Cluster(3201, config, {'exampleHandler': exHandler});

proxy.start()
