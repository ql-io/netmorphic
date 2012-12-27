var getConfig = require('../lib/getconfig.js')
  , http = require('http')
  , fs = require('fs')
  , config = JSON.parse(fs.readFileSync('configs/sample.config.json'))
;

var server = http.createServer(function(req,res){
	
	getConfig(req, res, config)
	
}).listen(3300);

/*

WHATS HAPPENING HERE IS THAT A CATCH ALL PATTERN MATCH IS CATCHING THESE INSTEAD

TO FIX THIS YOU NEED TO MERGE GETCONFIG, SETCONFIG, ETC, WITH THE CONFIG OBJECT ITSELF

*/


module.exports['get individual service config'] = function(test){
	test.expect(2);

	http.get('http://localhost:3300/getConfig?tenant=global&srcUrl=/normalService').on('response', function(res){
		test.equal(res.statusCode, 200);
	});

	http.get('http://localhost:3300/getConfig?srcUrl=/badUrl').on('response', function(res){
		test.equal(res.statusCode, 404);
		test.done();
	});
};

module.exports['get entire config'] = function(test){
	test.expect(1);

	http.get('http://localhost:3300/getConfig').on('response', function(res){
		test.equal(res.statusCode, 200);
		server.close();
		test.done()
	});
};