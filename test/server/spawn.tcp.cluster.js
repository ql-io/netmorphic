var Cluster = require('../../net-morphic').tcp;
var config = require('../../configs/tcp.sample.config.json');
var timer = require('since-when');
var proxy = Cluster(config);

proxy.start();

process.stdout.write('ready')

process.stdin.resume().on('data', function(d){
	if(d.toString() == 'boo'){
      proxy.quit();
  	  process.stdout.write('killme')
    };
})