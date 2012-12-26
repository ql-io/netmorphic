# Netmorphic

Netmorphic is a library for testing networked applications, such as REST clients over HTTP, and database clients over TCP.

### Features
* WHAT FEATURES!
* THESE FEATURES!

### table of contents
* [Installation](#installation)
* [HTTP Configuration](#http-configuration)
* [TCP Configuration](#tcp-configuration)
* [Quick Start](#quick-start)
* [Handlers](#handlers)

***

## installation 

### clone the repo

```bash
git clone https://github.com/ql-io/netmorphic.git
cd netmorphic 
make clean install
```

### use NPM

```bash
npm install netmorphic
```

```js
var netmorphic = require('netmorphic')
```



***

## Configurations

Configure your proxy with a json file. See the examples below.

### HTTP Configuration

RESTful routing made available through the use of the [Router](https://npmjs.org/package/router) module. Netmorphic support multi-tenant configurations, so you may differentiate behavior between clients accessing the same endpoints. However, for most cases, a single tenant configuration will suffice. The most basic configuration will have a single top-level key called "global", and any number of paths. You may specify which IP addresses to accept, or leave it the array empty to accept any client IP.

```js
{
	"global" : {
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
}

``` 

### TCP configuration

TCP configuration is similar to the above, with two major exceptions. The first is that multi-tenancy is not currently supported, so there is no 'global' key at the top level. The second is that urls are replaced with the the port number that the proxy server will listen on.

```js
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

```js
var netmorphic = require('netmorphic').http
  , config = require('files/myconfig.json')
  , USE_CLUSTER = false
  , CUSTOM_HANDLERS = false;

var proxy = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER); 

proxy.server.listen(8000)
```

### HTTP with [Cluster2](http://github.com/ql-io/cluster2)

```js
var netmorphic = require('netmorphic').http
  , monitor = require('netmorphic').monitor
  , Cluster = requir('cluster2)
  , config = require('files/myconfig.json')
  , USE_CLUSTER = true
  , CUSTOM_HANDLERS = false;

var proxy = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER); 

var cluster = new Cluster({
	port: 8000,
	monitor: monitor()
})

cluster.listen(function(cb){
	cb(proxy.server)
})
```

### TCP

```js
var TCProxy = require('netmorphic').tcp
  , config = require('files/TCP.config.json')
  , CUSTOM_HANDLERS = false
  , USE_CLUSTER = false;

// returns an array of servers
var servers = TCProxy(config, CUSTOM_HANDLERS, USE_CLUSTER)

//iterate over the TCP servers and start each one
servers.forEach(function(server){
	server.app.listen(server.port)
})
```

### TCP with [Cluster2](http://github.com/ql-io/cluster2)

```js
var TCProxy = require('netmorphic').tcp
  , monitor = require('netmorphic').monitor
  , config = require('files/TCP.config.json')
  , Cluster = require('cluster2')
  , CUSTOM_HANDLERS = false
  , USE_CLUSTER = true;

var servers = TCProxy(config, CUSTOM_HANDLERS, USE_CLUSTER)

var cluster = new Cluster({
	monitor: monitor()
})

cluster.listen(function(cb){
	cb(servers)
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

```js
var TCProxy = require('netmorphic').tcp
  , config = require('files/TCP.config.json')
  , CUSTOM_HANDLERS = require('files/my.custom.handlers.js')
  , USE_CLUSTER = true;

var servers = TCProxy(config, CUSTOM_HANDLERS, USE_CLUSTER)
```

a custom HTTP handler file would look like this:

```js

// hint: it's just a function that handles the request and response streams...

module.exports['just proxy'] = function(req, res){
	var config = req.serConfig; // the service config for this particular client
	var proxy = req.proxy; // a proxy to use, if you need a proxy
    proxy.proxyRequest(req, res, {
        host:config.host,
        port:config.port
    });
}
```

For TCP, it looks like this:

```js

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



