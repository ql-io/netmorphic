var getQuery = require('../lib/getQuery');

module.exports['test query parser'] = function(test){
	var qs = '?hello=world&goodnight=moon';
	test.equal(getQuery(qs)['?hello'], 'world');
	test.equal(getQuery(qs).goodnight, 'moon');
	test.done();
}