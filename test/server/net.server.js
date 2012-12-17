var net = require('net')
  , fake = require('Faker')
  , JSONStream = require('JSONStream')
  , es = require('event-stream')
;

var server = net.createServer(function(c) {	
	
  console.log('CONNECTION')


  c.on('end', function(){
    console.log('Service Endpoint Connection Closed')
  });

  c.on('error', function(err){
	console.log(err);
  });

  var stringify = JSONStream.stringify()

  var chunks = [];

  var first = es.through(
	function write(d){
	  d = d.toString('utf8');	
	  if(d.indexOf('[') !== 0) return;
	  else {
    	var obj = JSON.parse(d)[0];
  	    numChunks(obj, this);
	    return
	  }
	}, 
	function end(){
	  this.emit('end');
	}
  );

  var through = es.through(
	function write(d){
  	  this.emit('data', d)}, 
    function end(){
	  this.emit('data', '{{{fin}}}')
	}
  );


  es.connect(
	c,
    first,
    stringify,
	through,
	c
  );
});

server.listen(8124);

module.exports = server;

function numChunks(opts, stream){

  var stringify = JSONStream.stringify()
  ;

  for(var x = 0; x < opts.chunks; x++){
    stream.emit('data', fake.Helpers.createCard())	
  };

  stream.emit('data', '{{{fin}}}')

}
