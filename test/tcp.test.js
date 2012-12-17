exports["this is not really a test"] = function(test){
	test.done()
};

/*
var net = require('net');
var proxy = require('../lib/tcp.proxy');
handler = require('../lib/tcp.handler.js');

config = require('../configs/tcp.sample.config.json');

var p = proxy(config['ebay cologne api']);
var p = proxy(config['ebay cologne api']);

p.listen(10001);

pp = proxy(config['ebay purses api'])
pp.listen(10002)

drop = proxy(config['ebay pins api']);
drop.listen(10003);

flake = proxy(config['ebay gold api']);
flake.listen(10004);

module.exports['Test TCP normal handler'] = function(test){
	test.expect(1);
	
	var client = new net.Socket();
	
	client.connect(10001, function(){
		setTimeout(function(){
		  client.write('yodel')}
		, 1000)
	});
	
	client.on('data', function(d){
		test.equal(d.toString(), 'yodel');
		
	})
	
}
*/