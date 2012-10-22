# netMorphic

A Proxy for testing TCP and HTTP services

** Usage

    netmorph = require('netmorphic/net-morphic.js');
    
    // port to run the proxy server on
    port = 3100;

    // an (optional) json string or parsed object configuration 
    config = fs.readFile('path/to/config.json')    

    // an (optional) mock service endpoint which is any function(req, res, proxy, config)
    // if a mock service is specified, a server will be created to host your mock
    // a lo http.createServer(mock).listen(3200)
    // and all requests will be proxied there regardless of host and path specifications in your config
    mock = require('myMockServer');

    server = netmporh(port, config, mockService);

    // start the service
    server.start()
    
    // terminate the server
    server.quit()

    // "graceful shutdown"
    server.shutdown()
     
    // your configurations object is exposed
	server.config['/slowService'].latency = 4000;

    // so is your mock service
	server.mock