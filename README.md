# Netmorphic

**Netmorphic** is a library for testing networked applications, such as REST clients over HTTP, and database clients over TCP.

User can include Netmorphic in thier own server or for quick start clone and configure canned [Netmorphic server](https://github.com/ql-io/netmorphic-template).

By configuring Netmorphic based server as "man in the middle" (or as Proxy for HTTP requests) between the client and server components (over HTTP or TCP), simple connections get transformed into "programmable connections". Users cam program these "programmable connection" to induce different network behaviours.


### table of contents
* [Installation](#installation)
* [HTTP Configuration](#http-configuration)
* [TCP Configuration](#tcp-configuration)
* [Quick Start](#quick-start)
* [Handlers](#handlers)
* [Multitenancy](#multitenancy)
* [HTTP Config Api]

***

## installation 
```
npm install netmorphic
```

Include in JavaScript file

```
var nm = require('netmorphic')
```

***

## Configurations

Configure your proxy with a json object. See the examples below.

### HTTP Configuration

RESTful routing is made available through the use of the [Router](https://npmjs.org/package/router) module. 

```
{
	"/path/to/endpoint":{ // this is static url for the endpoint
		"host":"endpoint.host.example.com", // the host of the endpoint server
        "port":80, // the port of the endpoint
        "type":"slow", // the handler type to use. See section on handlers below
		"method":"get", // request method
		"latency": 100 // latency parameter to use with "slow" handler type
	},
	"/product/{id}":{ // this is a dynamic url. The value of id will be found at req.params.id
		"host":"endpoint.host.example.com",
        "port":80,
        "type":"flakey", // another type of handler
		"method":"get",
		"hi" : 2000,
		"lo" : 500,
	},
	"addresses" : [] // leave this empty if you don't need to bother with multi-tenancy
}

``` 

### TCP configuration

TCP configuration is similar to the above, with two major exceptions. The first is that multi-tenancy is not currently supported, so there is no 'global' key at the top level. The second is that urls are replaced with the the port number that the proxy server will listen on.

```
{
	"10001": { // the port the proxy will listen on
		"host" : "127.0.0.1", // and proxy incoming streams to this host
		"port" : 3124, // and this port
		"type" : "normal" // using this TCP handler
	},
	"10002": { // use this port for a slow proxy
		"host" : "127.0.0.1",
		"port" : 3124,
		"type" : "slow",
		"latency" : 5000
	},
	"10003": { // use this port for a drop proxy
		"host" : "127.0.0.1",
		"port" : 3124,
		"type" : "drop",
		"lo" : 1000,
		"high" : 5000
	},
	"10004": { // use this port for a bumpy proxy
		"host" : "127.0.0.1",
		"port" : 3124,
		"type" : "bumpy",
		"lo" : 3500,
		"high" : 7000
	}
}
```

***

## quick start
### HTTP
#### config.json
```
{
    "/path/to/endpoint":{
        "host":"endpoint.host.example.com",
        "port":80,
        "type":"slow",
        "method":"get",
        "latency": 100
    },
    "/product/{id}":{
        "host":"endpoint.host.example.com",
        "port":80,
        "type":"flakey",
        "method":"get",
        "hi" : 2000,
        "lo" : 500
    },
    "addresses" : []
}
```

#### httpTest.js

```
var netmorphic = require('netmorphic').proxy
  , CONFIG = require('./config.json')
  , USE_CLUSTER = false
  , CUSTOM_HANDLERS = false;

var apps = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER); 

apps[0].app.listen(8000)
```

Verify <http://server:8000/getconfig> and use json editor available at <http://server:8000/config/index.html> to modifiy the configuration.

### HTTP with [Cluster2](http://github.com/ql-io/cluster2)
#### httpTestCluster.js

```
var netmorphic = require('netmorphic').proxy
  , monitor = require('netmorphic').monitor(3100) //3100 required for config sync-ing
  , Cluster = require('cluster2')
  , HTTPPORT = 8000
  , CONFIG = require('./config.json')
  , USE_CLUSTER = true
  , CUSTOM_HANDLERS = false;

var apps = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER, HTTPPORT);

var cluster = new Cluster({
        monitor: monitor
})

cluster.listen(function(cb){
        cb(apps)
});
```
Verify <http://server:8000/getconfig> and use json editor available at <http://server:8000/config/index.html> to modifiy the configuration.

### TCP
#### config.json
```
{
    "/path/to/endpoint":{
        "host":"endpoint.host.example.com",
        "port":80,
        "type":"slow",
        "method":"get",
        "latency": 100
    },
    "10001": {
        "host" : "127.0.0.1",
        "port" : 3124,
        "type" : "normal"
    },
    "10002": {
        "host" : "127.0.0.1",
        "port" : 3124,
        "type" : "slow",
        "latency" : 5000
    },
    "10003": {
        "host" : "127.0.0.1",
        "port" : 3124,
        "type" : "drop",
        "lo" : 1000,
        "high" : 5000
    },
    "10004": {
        "host" : "127.0.0.1",
        "port" : 3124,
        "type" : "bumpy",
        "lo" : 3500,
        "high" : 7000
    }
}


```

#### tcpTest.js
```
var netmorphic = require('netmorphic').proxy
  , CONFIG = require('./config.json')
  , HTTPPORT = 8000
  , USE_CLUSTER = false
  , CUSTOM_HANDLERS = false;

var apps = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER, HTTPPORT);

//iterate over the TCP servers and start each one
apps.forEach(function(app){
    app.app.listen(app.port)
})
```

### TCP with [Cluster2](http://github.com/ql-io/cluster2)
#### tcpTestcluster.js
```
var netmorphic = require('netmorphic').proxy
  , monitor = require('netmorphic').monitor(3100) // 3100 to run the monitor app
  , Cluster = require('cluster2')
  , HTTPPORT = 8000
  , CONFIG = require('./config.json')
  , USE_CLUSTER = true
  , CUSTOM_HANDLERS = false;

var apps = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER, HTTPPORT);

var cluster = new Cluster({
        monitor: monitor
})

cluster.listen(function(cb){
        cb(apps)
})
```

***

## handlers

Handlers are are the "morph" in netmorphic. They act upon your requests and streams. Parameters for your handlers are set in the config files. Netmorphic ships with a few handlers out of the box, namely:

* normal - plain proxy
* slow - buffers the outgoing request by a minimum latency
* flakey - buffers the request for a random latency between hi and lo values 
* drop - drops request immediately or 
* unresponsive - does not respond to the request

Additionally, custom handlers can be written to do anything. Pass an object of handler functions to the netmorphic constructor, like so:

```
var netmorphic = require('netmorphic').proxy
  , CONFIG = require('./config.json')
  , HTTPPORT = 8000
  , CUSTOM_HANDLERS = require('files/my.custom.handlers.js')  , USE_CLUSTER = false
  , CUSTOM_HANDLERS = false;
var apps = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER, HTTPPORT);

```

a custom HTTP handler file would look like this:
#### my.custom.handlers.js
```
// HTTP Custom Handler
// hint: it's just a function that handles the request and response streams...
module.exports['just proxy'] = function(req, res){
	var config = req.serConfig; // the service config for this particular client
	var proxy = req.proxy; // a proxy to use, if you need a proxy
    proxy.proxyRequest(req, res, {
        host:config.host,
        port:config.port
    });
}

// TCP Custom Handler
var ps = require('pause-stream'); // a stream that pauses
module.exports['vanilla tcp proxy'] = function(socket, service){
	
	// socket is the client stream
	// service is a TCP socket to use to proxy to the endpoint

	var buffer = ps(); // create a pause stream
	
	socket.pipe(buffer.pause()); // pipe the request to the buffer and pause it
	
	service.connect(socket._CONFIG.port, socket._CONFIG.host, function(){
		buffer.pipe(service); // pipe the buffered request to the endpoint
		buffer.resume() // resume the buffer stream
	});
	
	service.pipe(socket); // pipe the endpoint connection back to the client connection
}
```
#Multitenancy
For HTTP requests user can setup client specific config by defining Tenants. Clients are identified by looking at 'X-Forwarded-For' header.

```
{
    global: { // 'global' is always client agnostic
        '/path': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'testcase',
            code: 1
        }
    },
    test: { // 'test' is a user defined tenant
        '/{key}': {
            host: '127.0.0.1',
            port: 3200,
            method: 'ALL',
            type: 'testcase',
            code: 2
        },
        addresses: ['12.34.56.78'] // IP address for clients belonging to 'test' tenant
    }
};
```
