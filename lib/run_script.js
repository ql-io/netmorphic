//run_script.js

var parser = require('./parser');

module.epxorts = function(req, res, config, scriptInfo){

    var config = config;

    switch (req.method.toUpperCase()) {

      case 'GET':

        res.writeHead(200, { 'Content-Type':'application/json' });
        res.write(JSON.stringify({script:scriptInfo.script,
                                  step:scriptInfo.currentStep, 
				  iteration:scriptInfo.iteration}));
        res.end();
        break;


      case 'POST':

        var data = '';

        req.on('data', function (chunk) {
            data += chunk;
        });

        req.on('end', function () {
            try {
                var script = parser.parse(data);
                util.puts('..........................');
                if (scriptInfo.timer) {
                    clearTimeout(scriptInfo.timer)
                }
                scriptInfo.script = data;
                scriptInfo.iteration = 0;
                res.writeHead(200, { 'Content-Type':'application/json' });
                res.write(JSON.stringify(script));
                res.end();
                executeStep(script, 0);
            }
            catch (e) {
                res.writeHead(400, { 'Content-Type':'text/plain' });
                res.write("Bad run script passed");
                res.end();
            }
        });

        break;


      default:

        res.writeHead(400, { 'Content-Type':'text/plain' });
        res.write("/run supports GET and POST only");
        res.end();
	break;
    };

    function executeStep(script, step) {
	if (!script || !script.length || step < 0) {
            return;
	}
	if (step == script.length) {
            step = 0;
            scriptInfo.iteration++;
	}
	scriptInfo.currentStep = step;

	util.puts("At step -> " + step);
	scriptInfo.timer = setTimeout(function () {
            makeAllNormal();
            _.each(script[step].cmds, doCmd);
            executeStep(script, step + 1);
	}, script[step].time)
    };


    function doCmd(cmd) {
	var serConfig = config[cmd.service];
	if (serConfig) {
            _.chain(cmd)
		.keys()
		.without('service')
		.each(function (key) {
                    serConfig[key] = cmd[key];
		})
		.value();
	}
	util.puts(cmd.service + " -> " + JSON.stringify(serConfig));
    };

    function makeAllNormal() {
	_.chain(config)
            .keys()
            .each(function (key) {
		util.puts(key + " -> normal");
		config[key].type = "normal";
            })
    };

  return

}

