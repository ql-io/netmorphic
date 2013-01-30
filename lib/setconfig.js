// setconfig

var _ = require('underscore');
var urlUtil = require('url');
var getQuery = require('./getQuery');
var fs = require('fs')
  , from = require('from')
  , es = require('event-stream')
;

module.exports = function(req, res, config, model, setRouteMulti){
	
  var configEvent = req.self.beginEvent({
		    parent: req.connection.connectionEvent,
	        name: 'setConfig',
	        message: 0,
	        cb: function(err, results) {
	        }
	    });
		
  var q = getQuery(urlUtil.parse(req.url).query);

  var tenant = q.tenant || 'global'; 

  if (q.srcUrl) {

      var serConfig = config[tenant][q.srcUrl];

      if (serConfig) {
          _.chain(q)
              .keys()
              .without('srcUrl')
			  .without('tenant')
              .each(function (key) {
                  switch (key) {
                  case 'lo':
                  case 'hi':
                  case 'latency':
                  case 'port':
                      q[key] = parseInt(q[key]);
                  }
                  serConfig[decodeURIComponent(key)] = decodeURIComponent(q[key]);
              })
                  .value();
		  
		  if(model) model.set('config', config);

          res.writeHead(200, { 'Content-Type':'application/json' });
          res.write(JSON.stringify(serConfig));
          res.end();
      }

      else {
          serConfig = {};
          _.chain(q)
              .keys(q)
              .without('tenant')
              .without('srcUrl')
              .each(function (key) {
                  switch (key) {
                  case 'lo':
                  case 'hi':
                  case 'latency':
                  case 'port':
                      q[key] = parseInt(q[key]);
				}
				if(!serConfig.method) serConfig.method = 'all';
				serConfig[decodeURIComponent(key)] = decodeURIComponent(q[key]);
              }).value();

          config[tenant][q.srcUrl] = serConfig;

	      setRouteMulti(serConfig.method, q.srcUrl, serConfig)

		  if(model) model.set('config', config);

          res.writeHead(200, { 'Content-Type':'application/json' });
          res.write(JSON.stringify(serConfig));
          res.end();
      }
  }
  else if(q.config){
	var edit = JSON.parse(decodeURI(q.config))
	config = edit;
	if(model) model.set('config', config);
	res.writeHead(200, { 'Content-Type':'application/json' });
      res.write(JSON.stringify(config));
      res.end();
  }
  else {
     res.writeHead(404, { 'Content-Type':'text/plain' });
     res.write("Bad tenant or srcUrl");
     res.end();
  }

  req.requestEvent.cb()
  configEvent.cb()
  
  from(function getChunk(){
	this.emit('data', config);
	this.emit('end');
	return
  })
  .pipe(es.stringify())
  .pipe(fs.createWriteStream('./netmorphic-configs/' + new Date().getTime() + '.json'))

  return config

}

