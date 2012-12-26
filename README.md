# Netmorphic

Netmorphic is a library for testing networked applications, such as REST clients over HTTP, and database clients over TCP. It has many features. The behavior of the proxy is completely customizable.

### Features
* WHAT FEATUERS?
* THESE FEATURES!

### table of contents
* [Installation](#installation)
* [HTTP Configuration](#http-configuration)
* [TCP Configuration](#tcp-configuration)
* [Quick Start](#quick-start)

***

## installation 

### clone the repo

'''bash
git clone https://github.com/ql-io/netmorphic.git
cd netmorphic 
make clean install
'''

### use NPM

'''bash
npm install netmorphic
'''

'''js
var netmorphic = require('netmorphic')
'''



***

## Configurations

Configure your proxy with a json file. See the examples below.

### http Configuration

RESTful routing made available through the use of the [Router](https://npmjs.org/package/router) module. Netmorphic support multi-tenant configurations, so you may differentiate behavior between clients accessing the same endpoints. However, for most cases, a single tenant configuration will suffice. The most basic configuration will have a single top-level key called "global", and any number of paths. You may specify which IP addresses to accept, or leave it the array empty to accept any client IP.

'''js
var josn = 
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
		"addresses" : ["127.0.0.0"] // leave this empty if you don't need to bother with multi-tenancy
	}
}
''' 

### tcp configuration

TCP configuration is similar to the above, with two major exceptions. The first is that multi-tenancy is not currently supported, so there is no 'global' key at the top level. The second is that urls are replaced with the the port number that the proxy server will listen on.

'''js
var config = {
	"10001": { // the port the proxy will listen on
		"host" : "127.0.0.1", // and proxy incoming streams to this host
		"port" : 3124, // and this port
		"type" : "normal" // using this TCP handler
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

***

## quick start

### HTTP

'''js
var netmorphic = require('netmorphic').http
  , config = require('files/myconfig.json')
  , USE_CLUSTER = false
  , CUSTOM_HANDLERS = false;

var proxy = netmorphic(CONFIG, CUSTOM_HANDLERS, USE_CLUSTER); 

proxy.server.listen(8000)
'''

### HTTP with CLuster2

'''js
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
'''

### TCP

'''js
var TCProxy = require('../../netmorphic-1').tcp
  , config = require('files/TCP.config.json')
  , CUSTOM_HANDLERS = false
  , USE_CLUSTER = false;

// returns an array of servers
var servers = TCProxy(config, CUSTOM_HANDLERS, USE_CLUSTER)

//iterate over the TCP servers and start each one
servers.forEach(function(server){
	server.app.listen(server.port)
})
'''

### TCP with CLuster

'''js
var TCProxy = require('../../netmorphic-1').tcp
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
'''

