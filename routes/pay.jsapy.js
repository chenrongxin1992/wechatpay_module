/**
 *  @Author:    Relax
 *  @Create Date:   2016-07-11
 *  @Description:   微信支付，公众好支付
 */

var https = require('https'),
    xml = require('xml'),
    url = require('url'),
    qs = require('querystring'),
    moment = require('moment'),
    weChatTools = require('../tools/weChatTools'),
    mongoose = require('mongoose'),
    config = require('../config/sysConfig'),
    weChatPay = mongoose.model(config.tables.weChatPayOrder),
    exception = require('../module/exception'),
    businessConfig = require('../config/businessConfig'),
    getWxConfig = require('./index'),
    async = require('async'),
    verify = require('../tools/verify');

var moment = require('moment')

var path = {
    placeOrder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
};

// appid = 'wxe8eb1beadd82b467',
//    appSecret = 'NDg2NmU0Yzk4NmFlNDU3ZDg1MGNiZWQw',  //'a6ace07aca119a46abc462d7fd42efe1','NDg2NmU0Yzk4NmFlNDU3ZDg1MGNiZWQwMjM2Y2VhOTk'
//    mch_id = '1297554801',

var device_info = 'WEB',
    fee_type = 'CNY',
    trade_type = weChatTools.payTypes.JSAPI, //交易类型
    //notify_url = 'http://test.api.pay.w-lans.cn/pay/notice'; //订单通知地址
    notify_url = 'http://test.pay.178wifi.com/pay/notice'

//下单
exports.PlaceOrder = function (req, res, next) {
    var getWxConfig_res = {}
    async.waterfall([
        function(cb){
            getWxConfig.getWxConfig(function(result){
                if(result){
                    getWxConfig_res = result
                }
                console.log('----------  one  ------------')
                console.log(getWxConfig_res)
                cb(null,getWxConfig_res)
            })       
        },
        function(arg,cb){
            /*var bid = req.body.bid,  //商圈编号
                title = req.body.title,  //商品描述
                wx_order_no = req.body.orderNo, //订单号  非必传，
                total_fee = req.body.fee,  //总金额
                spbill_create_ip = req.body.ip, //用户客户端IP
                openid = req.body.openid; //用户标识*/

            console.log('----- 22  -----')
            console.log(arg)

            //测试数据
            var bid = '0',  //商圈编号
                title = 'ceshi',  //商品描述
                wx_order_no = '', //订单号  非必传，
                total_fee = 1,  //总金额
                spbill_create_ip = req.headers['x-forwarded-for'], //用户客户端IP
                openid = 'or0Yltxu45dWsOsJVp9VchNKsUrA'; //用户标识
            console.log('ip:',spbill_create_ip)
            var time_start = moment().format('yyyyMMddHHmmss')  //下单时间

            var nonce_str = weChatTools.randomStr(), //随机字符串
                attach = '',// 附加数据
                out_trade_no = weChatTools.merchatPayOrderNo(trade_type);//商户订单号

            if (!bid) {
                return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, 'bid不能为空'));
            }
            var config = businessConfig[bid];
            if (!config) {
                return res.json(exception.throwError(exception.code.sysError.ConfigUndifand));
            }
            if (!title) {
                return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '商品标题title不能为空'));
            }
            if (!total_fee) {
                return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '支付金额fee不能为空'));
            }
            if (!verify.CheckNumber(total_fee)) {
                return res.json(exception.throwError(exception.code.sysError.DateFormatError, '支付金额fee格式错误'));
            }
            var _fee = parseInt(total_fee);
            if (_fee < 0) {
                return res.json(exception.throwError(exception.code.sysError.DateFormatError, '支付金额fee格式错误'));
            }
            if (!spbill_create_ip) {
                return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '客户端IP不能为空'));
            }
            if (!openid) {
                return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '用户openId不能为空'));
            }

            //当传入订单号为空时，默认为商户订单号
            if (!wx_order_no)
                wx_order_no = out_trade_no;
            var req_options = url.parse(path.placeOrder);
                req_options.method = 'POST';
                req_options.port = 443;
                req_options.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                };

            var content_data = {
                    appid: config.appid,
                    mch_id: config.mch_id,
                    nonce_str: nonce_str,
                    body: title,
                    attach: attach,
                    device_info: device_info,
                    out_trade_no: out_trade_no,
                    fee_type: fee_type,
                    total_fee: total_fee,
                    spbill_create_ip: spbill_create_ip,
                    notify_url: notify_url,
                    trade_type: trade_type,
                    openid: openid
                },
                sign = weChatTools.sign(content_data, config.appSecret),
                xml_content_data = {
                    xml: [
                        {appid: config.appid},
                        {mch_id: config.mch_id},
                        {nonce_str: nonce_str},
                        {body: title},
                        {device_info: device_info},
                        {out_trade_no: out_trade_no},
                        {fee_type: fee_type},
                        {total_fee: total_fee},
                        {spbill_create_ip: spbill_create_ip},
                        {notify_url: notify_url},
                        {trade_type: trade_type},
                        {openid: openid},
                        {sign: sign}
                    ]
                },
                post_data = xml(xml_content_data);
                console.log('key:',config.appSecret)
                console.log(content_data)
                console.log('sign',sign)
                console.log(post_data)
            var post_req = https.request(req_options, function (post_res) {
                post_res.setEncoding('utf8');
                var result = '';
                post_res.on('data', function (chunk) {
                    result += chunk;
                });
                post_res.on('end', function () {
                    result = weChatTools.xmlToJson(result);
                    console.log('result:', result);
                    if (result.return_code == 'FAIL')
                        return res.json(exception.throwError(exception.code.error, result.return_msg));
                    if (result.result_code == 'FAIL')
                        return res.json(exception.throwError(exception.code.downOrder[result.err_code], result.err_code_des));
                    var prepay_id = result.prepay_id, code_url = result.code_url;

                    //20170420
                    //取得prepay_id,重新生成签名返回
                    var timeStamp =  moment().format('X'),
                        nonceStr = weChatTools.randomStr(),
                        package = 'prepay_id='+prepay_id,
                        signType = 'MD5'

                    var paySign_content = {
                        appId : config.appid,
                        timeStamp : arg.timestamp,
                        nonceStr : arg.noncestr,
                        package : package,
                        signType : signType
                    }
                    console.log('paySign_content',paySign_content)
                    console.log()
                    var paySign = weChatTools.sign(paySign_content, config.appSecret)
                    console.log('-----  paySign  -----')
                    console.log(paySign)
                    console.log()

                    var pay = new weChatPay({
                            bid: bid,
                            appid: config.appid,
                            mch_id: config.mch_id,
                            device_info: device_info,
                            nonce_str: nonce_str,
                            sign: sign,
                            body: title,
                            attach: attach,
                            out_trade_no: out_trade_no,
                            wx_order_no: wx_order_no,
                            total_fee: total_fee,
                            spbill_create_ip: spbill_create_ip,
                            notify_url: notify_url,
                            trade_type: trade_type,
                            openid: openid,
                            prepay_id: prepay_id,
                            code_url: code_url,
                            time_start : time_start
                    });
                    pay.save(function (err,doc) {
                        if(err){
                            console.log('------------------  err occurd  ------------------')
                            console.error(err)
                        }
                        console.log(doc)
                    });
                    /*return res.json(exception.success({
                        orderNo: pay.wx_order_no,
                        out_trade_no: pay.out_trade_no,
                        prepay_id: pay.prepay_id,
                        paySign :paySign
                    }));*/
                    var data = {
                        appId : config.appid,
                        timeStamp : arg.timestamp,
                        nonceStr : arg.noncestr,
                        package : package,
                        signType : signType,
                        paySign : paySign
                    }
                    cb(null,arg,data)
                    //res.json(data)
                   /* res.locals.data = {
                        appId : config.appid,
                        timeStamp : timeStamp,
                        nonceStr : nonceStr,
                        package : package,
                        signType : signType,
                        paySign : paySign
                    }*/
                });
            });
            post_req.on('error', function (e) {
                console.log('error:', e);
                return res.json(e);
            });
            post_req.write(post_data);
            post_req.end();
        }
    ],function(err,arg1,arg2){
        if(err){
            console.log('---- err ----')
            console.log(err)
        }
        console.log('----- result  ------')
        console.log(arg1)
        console.log(arg2)
        res.locals.wxconfig = arg1
        res.locals.wxchoosepay = arg2
        res.render('jsapi')
    })
};

exports.PlaceOrder_bk = function (req, res, next) {
    var bid = req.body.bid,  //商圈编号
        title = req.body.title,  //商品描述
        wx_order_no = req.body.orderNo, //订单号  非必传，
        total_fee = req.body.fee,  //总金额
        spbill_create_ip = req.body.ip, //用户客户端IP
        openid = req.body.openid; //用户标识

    var time_start = moment().format('yyyyMMddHHmmss')  //下单时间

    var nonce_str = weChatTools.randomStr(), //随机字符串
        attach = '',// 附加数据
        out_trade_no = weChatTools.merchatPayOrderNo(trade_type);//商户订单号

    if (!bid) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, 'bid不能为空'));
    }
    var config = businessConfig[bid];
    if (!config) {
        return res.json(exception.throwError(exception.code.sysError.ConfigUndifand));
    }
    if (!title) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '商品标题title不能为空'));
    }
    if (!total_fee) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '支付金额fee不能为空'));
    }
    if (!verify.CheckNumber(total_fee)) {
        return res.json(exception.throwError(exception.code.sysError.DateFormatError, '支付金额fee格式错误'));
    }
    var _fee = parseInt(total_fee);
    if (_fee <= 0) {
        return res.json(exception.throwError(exception.code.sysError.DateFormatError, '支付金额fee格式错误'));
    }
    if (!spbill_create_ip) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '客户端IP不能为空'));
    }
    if (!openid) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '用户openId不能为空'));
    }

    //当传入订单号为空时，默认为商户订单号
    if (!wx_order_no)
        wx_order_no = out_trade_no;
    var req_options = url.parse(path.placeOrder);
        req_options.method = 'POST';
        req_options.port = 443;
        req_options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };

    var content_data = {
            appid: config.appid,
            mch_id: config.mch_id,
            nonce_str: nonce_str,
            body: title,
            attach: attach,
            device_info: device_info,
            out_trade_no: out_trade_no,
            fee_type: fee_type,
            total_fee: total_fee,
            spbill_create_ip: spbill_create_ip,
            notify_url: notify_url,
            trade_type: trade_type,
            openid: openid
        },
        sign = weChatTools.sign(content_data, config.appSecret),
        xml_content_data = {
            xml: [
                {appid: config.appid},
                {mch_id: config.mch_id},
                {nonce_str: nonce_str},
                {body: title},
                {device_info: device_info},
                {out_trade_no: out_trade_no},
                {fee_type: fee_type},
                {total_fee: total_fee},
                {spbill_create_ip: spbill_create_ip},
                {notify_url: notify_url},
                {trade_type: trade_type},
                {openid: openid},
                {sign: sign}
            ]
        },
        post_data = xml(xml_content_data);
        console.log('key:',config.appSecret)
        console.log(content_data)
        console.log('sign',sign)
        console.log(post_data)
    var post_req = https.request(req_options, function (post_res) {
        post_res.setEncoding('utf8');
        var result = '';
        post_res.on('data', function (chunk) {
            result += chunk;
        });
        post_res.on('end', function () {
            result = weChatTools.xmlToJson(result);
            console.log('result:', result);
            if (result.return_code == 'FAIL')
                return res.json(exception.throwError(exception.code.error, result.return_msg));
            if (result.result_code == 'FAIL')
                return res.json(exception.throwError(exception.code.downOrder[result.err_code], result.err_code_des));
            var prepay_id = result.prepay_id, code_url = result.code_url;

            //20170420
            //取得prepay_id,重新生成签名返回
            var timeStamp =  moment().format('X'),
                nonceStr = weChatTools.randomStr(),
                package = 'prepay_id='+prepay_id,
                signType = 'MD5'

            var paySign_content = {
                appId : config.appid,
                timeStamp : timeStamp,
                nonceStr : nonceStr,
                package : package,
                signType : signType
            }
            console.log(paySign_content)
            console.log()
            var paySign = weChatTools.sign(paySign_content, config.appSecret)
            console.log('-----  paySign  -----')
            console.log(paySign)
            console.log()

            var pay = new weChatPay({
                    bid: bid,
                    appid: config.appid,
                    mch_id: config.mch_id,
                    device_info: device_info,
                    nonce_str: nonce_str,
                    sign: sign,
                    body: title,
                    attach: attach,
                    out_trade_no: out_trade_no,
                    wx_order_no: wx_order_no,
                    total_fee: total_fee,
                    spbill_create_ip: spbill_create_ip,
                    notify_url: notify_url,
                    trade_type: trade_type,
                    openid: openid,
                    prepay_id: prepay_id,
                    code_url: code_url,
                    time_start : time_start
            });
            pay.save(function (err,doc) {
                if(err){
                    console.log('------------------  err occurd  ------------------')
                    console.error(err)
                }
                console.log(doc)
            });
            /*return res.json(exception.success({
                orderNo: pay.wx_order_no,
                out_trade_no: pay.out_trade_no,
                prepay_id: pay.prepay_id,
                paySign :paySign
            }));*/
            /*var data = {
                appId : config.appid,
                timeStamp : timeStamp,
                nonceStr : nonceStr,
                package : package,
                signType : signType,
                paySign : paySign
            }
            res.json(data)*/
            res.locals.data = {
                appId : config.appid,
                timeStamp : timeStamp,
                nonceStr : nonceStr,
                package : package,
                signType : signType,
                paySign : paySign
            }
        });
    });
    post_req.on('error', function (e) {
        console.log('error:', e);
        return res.json(e);
    });
    post_req.write(post_data);
    post_req.end();
};
//支付结果通知
exports.Notice = function (req, res, next) {
    var str = JSON.stringify(req.body);
    str = weChatTools.xmlToJson(str);
    if (str.return_code == 'FAIL')
        return res.end(NoticeResponse(str.return_msg));
    weChatPay.FindOneByOut_trade_no(str.out_trade_no, function (err, doc) {
        if (err)
            return res.end(NoticeResponse(err.message));
        if (!doc)
            return res.end(NoticeResponse('out_trade_no nonentity'));
        if (doc.openid != str.openid)
            return res.end(NoticeResponse('openid nonentity'));
        if (doc.total_fee != str.cash_fee)
            return res.end(NoticeResponse('cash_fee error'));
        var content = {
            is_subscribe: str.is_subscribe == 'Y' ? 1 : 0,
            bank_type: str.bank_type,
            cash_fee: str.cash_fee,
            transaction_id: str.transaction_id,
            time_end: moment(str.time_end, 'YYYYMMDDHHmmss').format('X')
        };
        //非必传参数
        if (str.bank_type)
            content.bank_type = str.bank_type;
        if (str.settlement_total_fee)
            content.settlement_total_fee = str.settlement_total_fee;
        if (str.cash_fee_type)
            content.cash_fee_type = str.cash_fee_type;
        if (str.coupon_fee)
            content.coupon_fee = str.coupon_fee;
        if (str.coupon_count)
            content.coupon_count = str.coupon_count;
        if (str.attach)
            content.attach = str.attach;
        weChatPay.UpdateById(doc._id, content, function (err) {
            if (err)
                return res.end(NoticeResponse(err.message));
            return res.end(NoticeResponse());
        });
    });
};

//根据传入的订单号查询订单
exports.Serach_By_OrderNo = function (req, res, next) {
    var bid = req.body.bid,
        orderNo = req.body.orderNo;
    if (!bid) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, 'bid不能为空'));
    }
    if (!orderNo) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '订单号不能为空'));
    }
    weChatPay.findOne({wx_order_no: orderNo}, function (err, doc) {
        if (err) {
            return res.json(exception.throwError(exception.code.error, err.message));
        }
        if (!doc) {
            return res.json(exception.throwError(exception.code.dbError.RecordNotExist))
        }
        return res.json(exception.success(weChatPay.ToJson(doc)));
    });
};
//根据商户订单号查询订单
exports.Serach_By_OutTradeNo = function (req, res, next) {
    var bid = req.body.bid,
        orderNo = req.body.outTradeNo;
    if (!bid) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, 'bid不能为空'));
    }
    if (!orderNo) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '商户订单号不能为空'));
    }
    weChatPay.findOne({out_trade_no: orderNo}, function (err, doc) {
        if (err) {
            return res.json(exception.throwError(exception.code.error, err.message));
        }
        if (!doc) {
            return res.json(exception.throwError(exception.code.dbError.RecordNotExist))
        }
        return res.json(exception.success(weChatPay.ToJson(doc)));
    });
};
//根据微信支付订单号查询订单
exports.Serach_By_TransactionId = function (req, res, next) {
    var bid = req.body.bid,
        orderNo = req.body.transactionId;
    if (!bid) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, 'bid不能为空'));
    }
    if (!orderNo) {
        return res.json(exception.throwError(exception.code.sysError.InfoIncomplete, '微信支付订单号不能为空'));
    }
    weChatPay.findOne({transaction_id: orderNo}, function (err, doc) {
        if (err) {
            return res.json(exception.throwError(exception.code.error, err.message));
        }
        if (!doc) {
            return res.json(exception.throwError(exception.code.dbError.RecordNotExist))
        }
        return res.json(exception.success(weChatPay.ToJson(doc)));
    });
};
function NoticeResponse(return_msg) {
    var return_code = !return_msg ? 'FAIL' : 'SUCCESS';
    var result = {
        xml: [
            {return_code: {_cdata: return_code}},
            {return_msg: {_cdata: return_msg}}
        ]
    };
    return xml(result);
};
