module.exports = function(){};

var Connect = require('connect')
  , http = require('http')
  , filed = require('filed')
  , Cluster = require('cluster2')
;

var connect = Connect()
  .use(Connect.logger('dev'))
  .use(Connect.static('public'))
  .use(function(req, res){
	    filed('./test/test.json').pipe(res)
 });

var server = http.createServer(connect).listen(3200)

/*
var c = new Cluster({
    port: 3200
});

c.listen(function(cb) {
    cb(server);
});
*/