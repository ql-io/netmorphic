// setconfig

var _ = require('underscore');
var urlUtil = require('url');
var getQuery = require('./getQuery');


module.exports = function(req, res, config, model, multi){

  var q = getQuery(urlUtil.parse(req.url).query);

  if (q.srcUrl) {

      var serConfig;

      if (multi)  serConfig = config[req.connection.remoteAddress][q.srcUrl];
 
      else serConfig = config[q.srcUrl];

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
      }

  }

  else {
     res.writeHead(404, { 'Content-Type':'text/plain' });
     res.write("Bad Url");
     res.end();
  }

  return

}

