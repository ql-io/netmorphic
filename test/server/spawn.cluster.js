var Cluster = require('../../net-morphic').http;
var config = require('../../configs/sample.config.json');
var timer = require('since-when');
var exHandler = require('../../configs/sample.handler.js');

var proxy = Cluster(3201, config, {'exampleHandler': exHandler});

proxy.start()

process.stdout.write('ready')

process.stdin.resume().on('data', function(d){
	if(d.toString() == 'boo'){
      proxy.quit();
  	  process.stdout.write('killme')
    };
})