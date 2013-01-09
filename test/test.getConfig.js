var getConfig = require('../lib/getconfig.js')
  , http = require('http')
  , fs = require('fs')
  , config = JSON.parse(fs.readFileSync('configs/sample.config.json'))
;

var server = http.createServer(function(req,res){
	
	config = {'global' : config};
	
	getConfig(req, res, config)
	
}).listen(3300);


module.exports['get individual service config'] = function(test){
	test.expect(1);

	http.get('http://localhost:3300/getConfig?tenant=global&srcUrl=*').on('response', function(res){
		test.equal(res.statusCode, 200);
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