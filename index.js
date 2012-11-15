var TCProxy = require('./lib/tcp.proxy');

var HTTProxy = require('./lib/proxy');

var monitor  = require('./monitor')

module.exports.tcp = TCProxy

module.exports.http = HTTProxy

module.exports.monitor = monitor