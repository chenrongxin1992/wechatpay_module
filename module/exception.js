var errorCode = {
    success: {errCode: 0, errMsg: ''},
    error: {errCode: -1, errMsg: ''},
    sysError: {  //系统常见错误
        Unrealized: {errCode: 1001, errMsg: '该方式操作为实现'},
        InfoIncomplete: {errCode: 1002, errMsg: '数据不完整'},
        DateFormatError: {errCode: 1003, errMsg: '数据格式错误'},
        ConfigUndifand: {errCode: 1004, errMsg: '商圈配置信息不存在'},
    },
    downOrder: { //支付下单错误
        NOAUTH: {errCode: 2001, errMsg: '商户未开通此接口权限'},
        NOTENOUGH: {errCode: 2002, errMsg: '用户帐号余额不足'},
        ORDERPAID: {errCode: 2003, errMsg: '商户订单已支付，无需重复操作'},
        ORDERCLOSED: {errCode: 2004, errMsg: '当前订单已关闭，无法支付'},
        SYSTEMERROR: {errCode: 2005, errMsg: '系统超时'},
        APPID_NOT_EXIST: {errCode: 2006, errMsg: '参数中缺少APPID'},
        MCHID_NOT_EXIST: {errCode: 2007, errMsg: '参数中缺少MCHID'},
        APPID_MCHID_NOT_MATCH: {errCode: 2008, errMsg: 'appid和mch_id不匹配'},
        LACK_PARAMS: {errCode: 2009, errMsg: '缺少必要的请求参数'},
        OUT_TRADE_NO_USED: {errCode: 2010, errMsg: '同一笔交易不能多次提交'},
        SIGNERROR: {errCode: 2011, errMsg: '参数签名结果不正确'},
        XML_FORMAT_ERROR: {errCode: 2012, errMsg: 'XML格式错误'},
        REQUIRE_POST_METHOD: {errCode: 2013, errMsg: '未使用post传递参数'},
        POST_DATA_EMPTY: {errCode: 2014, errMsg: 'post数据不能为空'},
        NOT_UTF8: {errCode: 2015, errMsg: '请使用NOT_UTF8编码格式'}
    },
    dbError: { //数据库数据异常
        RecordNotExist: {errCode: 3001, errMsg: '记录不存在'}
    }
};


exports.success = function (result) {
    var str = {errCode: errorCode.success.errCode, errMsg: ''};
    if (result)
        str.result = result;
    return str;
};

exports.throwError = function (code, errMsg) {
    code = code ? code : errorCode.error;
    var str = {errCode: code.errCode, errMsg: code.errMsg};
    if (errMsg)
        str.errMsg = errMsg;
    return str;
};

exports.code = errorCode;