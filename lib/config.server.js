var http = require('http')
  , Static = require('ecstatic')
;

var opts = {};
opts.root = './public';
opts.autoIndex = true;
var server = http.createServer(Static(opts)).listen(8800)