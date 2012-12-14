// getconfig

var urlUtil = require('url');
var getQuery = require('./getQuery');


module.exports = function(req, res, config, multi){
	
  var q = getQuery(urlUtil.parse(req.url).query);

  var tenant = q.tenant;  
	
  if (q.srcUrl) {
	
	var serConfig = null;
	
    if(multi){

  	  serConfig = config[tenant][q.srcUrl];

    }
	
    if(!multi) {
	  
	  serConfig = config[tenant];

	}
	
    if (serConfig) {
		serConfig.pid = process.pid;
      res.writeHead(200, { 'Content-Type':'application/json' });
      res.write(JSON.stringify(serConfig));
      res.end();
    }

    else {
      res.writeHead(404, { 'Content-Type':'text/plain' });
      res.write("Bad Url");
      res.end();
    }

  }

  else {
    res.writeHead(200, { 'Content-Type':'application/json' });
    res.write(JSON.stringify(config));
    res.end();
  }                

};
