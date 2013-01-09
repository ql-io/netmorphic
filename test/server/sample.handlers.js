var ps = require('pause-stream');
var through = require('through');
var Time = require('since-when');
var total = 0;
var time = new Time();

var alpha = 'abcdefghijklmnopqrstuvwxyz'

var chunks = 0;

exports['tcp-internet'] = function(socket, service){
		
	var pause = ps();
	
	socket.pipe(pause.pause());
	
	var buffer = through(function(buf){
		total += buf.length;
		var h = '%%%%%%%%%%%';
		var newline = '\n'
		var str = h + newline;
		str += 'Total Chunks: ' + (chunks++) + newline
		str += 'Chunk size: ' + buf.length + ' BYTES' + newline
		str += 'Total transfer: ' + total + ' BYTES' + newline
		str += Math.floor(total / time.sinceBegin()[0]) + ' BYTES per second (average)' + newline
		str += h + newline;
		console.log(str);
		this.emit('data', buf)
	});
				
	service.connect(3201, '127.0.0.1', function(){
		pause.resume()
	});
	
	socket.pipe(pause).pipe(service).pipe(buffer).pipe(socket)

}

// http

var httpProxy = require('http-proxy')
  ,  urlUtil = require('url');

exports['test'] = function(req, res){
	var config = req.serConfig;
	var proxy = req.proxy;
	req.url = getUrl(req.url, config.url);
    proxy.proxyRequest(req, res, {
        host: 'google.com',
		port: 80
    });
}


exports['internet'] = function(req, res){
	var config = req.serConfig;
	var proxy = req.proxy;
    proxy.proxyRequest(req, res, {
        host: req.headers.host,
		port: req.headers.host.split(':')[1] || 80
    });
}

exports['slow internet'] = function(req, res){
	var config = req.serConfig;
	var proxy = req.proxy;
    var buffer = httpProxy.buffer(req);
    setTimeout(function () {
        proxy.proxyRequest(req, res, {
            host:req.headers.host,
            port:80,
            buffer:buffer
        });
    }, config.latency || 1000);
};

exports["drop some"] = function(req, res){
    var config = req.serConfig;
	var proxy = req.proxy;
	
	if (Math.random() > .25){
		var config = req.serConfig;
		var proxy = req.proxy;
	    proxy.proxyRequest(req, res, {
	        host: req.headers.host,
			port: req.headers.host.split(':')[1] || 80
	    });
	}

	else res.end();

};

exports['fake data'] = function (req, res) {
    var config = req.serConfig;
	var proxy = req.proxy;
    var buffer = httpProxy.buffer(req);
    setTimeout(function () {
        req.url = getUrl(req.url, config.url);
        proxy.proxyRequest(req, res, {
            host:config.host || '127.0.0.1',
            port:config.port || 3200,
            buffer:buffer
        });
    }, config.latency || 1000);
};

exports['meta data'] = function(req, res){
	var config = req.serConfig;
    var ip = req.connection.remoteAddress;
	res.writeHead(200);
	var obj = {};
	obj.ip = ip;
	obj.pid = process.pid;
	obj.configuration = config.type;
	res.end(JSON.stringify(obj));
}

function getLatency(lo, hi) {
    if (lo > hi) {
        var temp = lo;
        lo = hi;
        hi = temp;
    }
    return ((hi - lo) * Math.random()) + lo;
}

function getUrl(url, configUrl) {
    if (configUrl) {
        var parsed = urlUtil.parse(url);
        return configUrl + (parsed.search || '') + (parsed.hash || '');
    }
    return url;
}