var http = require('http')
;

var js = {
	"true" : "true",
	"!true": "false",
	"name" : "netmorphic",
	"null" : "null",
	"undefined" : "undefined"
}

var server = http.createServer(connect)

function connect(req, res){
	
	res.writeHead(200, {
		'Content-Type' : 'text/json'
	});
	
	res.write(JSON.stringify(js))
	res.end()
}

module.exports = server;