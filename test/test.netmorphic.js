var netmorphic, http, fs, testConfig, mockEndPoint, request, mockServer, path, server;

path = require('path').resolve();
http = require('http');
fs = require('fs');

// start the mock endpoint server on 127.0.0.1:3200
// returns a JSON file
// port 3200 is used in by the sample.config.json file
mockserver = require(path + '/test/server/endpoint.server').listen(3200);

// use sample config
testConfig = fs.readFileSync('configs/sample.config.json', 'utf8');

// initialize netMorphic cluster
port = 3201;
netmorphic = require(path + '/net-morphic.js');
server = netmorphic(port, testConfig)
server.start();

//tests
exports['Basic server test'] = function(test){
  test.expect(1);

  http.get('http://localhost:' + port + '/normalService', done);

  function done(res){
	test.equal(res.statusCode, '200');
    test.done();
	server.quit();
  };
};
