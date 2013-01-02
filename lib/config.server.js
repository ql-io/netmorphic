var http = require('http')
  , Static = require('ecstatic')
;

path = require('path')

var p = path.resolve(__dirname, '../public')

var opts = {};

opts.root = p;
opts.baseDir = "config"
opts.autoIndex = false;

var handler = Static(opts);

module.exports = handler