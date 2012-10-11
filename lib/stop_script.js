// stop_script

module.exports = function(scriptInfo){
    if (scriptInfo.timer) {
        clearTimeout(scriptInfo.timer)
    }
    scriptInfo.script = '';
    scriptInfo.iteration = 0;
    util.puts('not running any script.')
}
