// setconfig

var _ = require('underscore');
var urlUtil = require('url');
var getQuery = require('./getQuery');


module.exports = function(req, res, config, model){
	
  var q = getQuery(urlUtil.parse(req.url).query);

  var tenant = q.tenant;

  if (tenant && q.srcUrl) {

      if(!config[tenant]) {
		config[tenant] = {q.srcUlr: {}}	
	  };

      var serConfig = config[tenant][q.srcUrl];

      if (serConfig) {
          _.chain(q)
              .keys()
              .without('srcUrl')
              .each(function (key) {
                  switch (key) {
                  case 'lo':
                  case 'hi':
                  case 'latency':
                  case 'port':
                      q[key] = parseInt(q[key]);
                  }
                  serConfig[key] = q[key];
              })
                  .value();
		  
		  if(model) model.set('config', config);

          res.writeHead(200, { 'Content-Type':'application/json' });
          res.write(JSON.stringify(serConfig));
          res.end();
		  return config
      }

      else {
          var serConfig = {};
          _.chain(q)
              .keys(q)
              .without('srcUrl')
              .each(function (key) {
                  switch (key) {
                  case 'lo':
                  case 'hi':
                  case 'latency':
                  case 'port':
                      q[key] = parseInt(q[key]);
                  }
                  serConfig[key] = q[key];
              })
                  .value();
          config[q.srcUrl] = serConfig;
		  if(model) model.set('config', config);

          res.writeHead(200, { 'Content-Type':'application/json' });
          res.write(JSON.stringify(serConfig));
          res.end();
		  return config
      }

  }
  else if(q.config){
	var edit = JSON.parse(decodeURI(q.config))
	config = edit;
	if(model) model.set('config', config);
	res.writeHead(200, { 'Content-Type':'application/json' });
      res.write(JSON.stringify(config));
      res.end();
	  return config
  }
  else {
     res.writeHead(404, { 'Content-Type':'text/plain' });
     res.write("Bad tenant or srcUrl");
     res.end();
  }

  return config

}

