/**
 *  @Author:    Relax
 *  @Create Date:   2016-07-11
 *  @Description:   微信签名、随机字符串等内容转化
 */
var md5 = require('md5'),
    moment = require('moment');

var strList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    payTypeList = {
        JSAPI: '0101',
        NATIVE: '0201',
        APP: '0301',
        MICROPAY: '0401',
    }; //支付类型对应的商户订单号开头编号
/**
 * 支付方式 
 *  枚举
 * @type {{JSAPI: string, NATIVE: string, APP: string, MICROPAY: string}}
 */
exports.payTypes = {
    JSAPI: 'JSAPI',
    NATIVE: 'NATIVE',
    APP: 'APP',
    MICROPAY: 'MICROPAY',
};

/**
 * 微信 ASCLL+Key MD5 签名
 * @param attr
 * @param key
 */
exports.sign = function (attr, key) {
    var keys = Object.keys(attr).sort();
    var stringA = '';
    for (var i in keys) {
        var k = keys[i];
        var v = attr[k];
        if (k && k != 'sign' && v)
            stringA += k + '=' + v + '&';
    }
    if (key)
        stringA += 'key=' + key;
    console.log(stringA)
    var _sign = String(md5(stringA)).toUpperCase();
    return _sign;
};

/**
 * 随机字符串
 */
exports.randomStr = function (length) {
    length = !length ? 16 : length;
    var array = new Array();
    var count = strList.length;
    for (var i = 0; i < length; i++) {
        var number = parseInt(Math.random() * count, 10);
        array.push(strList[number]);
    }
    return array.join('');
};

/**
 * 商户订单号
 *  根据支付方式生成指定的订单编号
 */
exports.merchatPayOrderNo = function (payType) {
    //32位商户订单号
    var orderNo = new Array();
    //4位  支付类型编号
    orderNo.push(payTypeList[payType] || payTypeList.JSAPI);
    //14位 年月日时分秒 yyyyMMddHHmmss
    orderNo.push(moment().format('YYYYMMDDHHmmss'));
    //3位  毫秒
    orderNo.push(moment().millisecond());
    //随机数 11位
    for (var i = 0; i < 11; i++) {
        orderNo.push(parseInt(Math.random() * 9, 10));
    }
    return orderNo.join('');
};

/**
 * 微信xml内容转换成json格式
 * @param xml
 */
exports.xmlToJson = function (xmlStr) {
    var result = {};
    xmlStr.replace(/<xml>|<\/xml>/, '').replace(/<!\[CDATA\[(.*?)\]\]>/ig, '$1').replace(/<(\w+)>(.*?)<\/\1>/g, function (_, key, value) {
        key = key.replace(/(\w)/, function (str) {
            return str.toLowerCase();
        });
        result[key] = value;
    });
    return result;
}

/**
 * json对象转成xml
 * @param obj
 * @returns {string}
 */
exports.jsonToXml = function (obj) {
    var xml = '<xml>'
    for (var k in obj) {
        xml += '<' + k + '><![CDATA[' + obj[k] + ']]></' + k + '>';
    }
    return xml + '</xml>'
};