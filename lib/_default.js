// _default.js

var urlUtil = require('url'),
    libpath = require('path'),
    filed = require('filed'),
    fs = require('fs');


module.exports = function(req, res){

    var uri = urlUtil.parse(req.url).pathname;
    var filename = libpath.join(".", uri);

    if (libpath.existsSync(filename) && fs.statSync(filename).isDirectory()) {
	filename += '/index.html';
    }

    libpath.exists(filename, function (exists) {

	if (!exists) {
         res.writeHead(404, {
			"Content-Type":"text/plain"
         });
         res.write("404 NOT FOUND");
         res.end();
         return;
	}

	filed(filename).pipe(res)

    })
}
