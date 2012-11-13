var Cluster = require('../../tcp.cluster');
var config = require('../../configs/tcp.sample.config.json');
var timer = require('since-when');
var proxy = Cluster(config);
var netServ = require('./net.server');
proxy.start();
