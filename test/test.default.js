var defaultResponse = require('../lib/_default.js')
  , http = require('http')
;

var server = http.createServer(defaultResponse).listen(3300);

module.exports['test default http response'] = function(test){
	test.expect(1);
	http.get('http://localhost:3300').on('response', function(res){
		test.equal(res.statusCode, 404);
		test.done();
		server.close();
	})
};