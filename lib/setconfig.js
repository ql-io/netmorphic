// setconfig

var _ = require('underscore');
var urlUtil = require('url');
var getQuery = require('./getQuery');


module.exports = function(req, res, config, model){

  var q = getQuery(urlUtil.parse(req.url).query);

  if (q.srcUrl) {

      var serConfig = config[q.srcUrl];

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
          res.writeHead(200, { 'Content-Type':'application/json' });
          res.write(JSON.stringify(serConfig));
          res.end();
      }

	  if(model) model.set('config', config);

  }

  else {
     res.writeHead(404, { 'Content-Type':'text/plain' });
     res.write("Bad Url");
     res.end();
  }

  return

}

