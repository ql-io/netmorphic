var Connect = require('connect')
  , http = require('http')
  , filed = require('filed')
;

var connect = Connect()
  .use(Connect.logger('dev'))
  .use(Connect.static('public'))
  .use(function(req, res){
	filed('test/server/test.json').pipe(res)
 });

var server = http.createServer(connect).listen(3200)

module.exports = server;