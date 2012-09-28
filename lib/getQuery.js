module.exports = function getQuery(queryString) {
    var q = {};
    if (!queryString) {
        return q;
    }
    _.each(queryString.split('&'), function (qstr) {
        qstr = qstr.trim();
        if (qstr.indexOf('=') > 0 && qstr.indexOf('=') < qstr.length - 1) {
            var vals = qstr.split('=');
            q[vals[0]] = vals[1];
        }
    });
    return q;
}
