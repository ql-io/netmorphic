var net = require('net');

var server = net.createServer(function(c) {
  c.on('end', function() {});
  c.pipe(c);
});

server.listen(8124);

module.exports = server