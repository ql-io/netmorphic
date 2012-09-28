// getconfig

var urlUtil = require('url');
var getQuery = require('./lib/getQuery');

module.exports = function(req, res, config){

  var q = getQuery(urlUtil.parse(req.url).query);

  if (q.srcUrl) {

    var serConfig = config[q.srcUrl];

    if (serConfig) {
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

}
