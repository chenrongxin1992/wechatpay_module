var tools = require('../tools/weChatTools'),
    exception = require('../module/exception');


exports.index = function (req, res, next) {
    var str = tools.merchatPayOrderNo(tools.payTypes.APP);
    var array = new Array();
    array.push('appId');
    array.push('timeStamp');
    array.push('nonceStr');
    array.push('package');
    array.push('signType');
    array = array.sort();
    res.json(array.join('=&'));
};


exports.PayTest = function (req, res, next) {
    res.render('');
};