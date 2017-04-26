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
    weChatRefund = mongoose.model(config.tables.weChatRefund),
    exception = require('../module/exception'),
    businessConfig = require('../config/businessConfig'),
    getWxConfig = require('./index'),
    async = require('async'),
    fs = require('fs'),
    moment = require('moment'),
    verify = require('../tools/verify');

var path = {
    placeOrder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    closeOrder: 'https://api.mch.weixin.qq.com/pay/closeorder',
    refund : 'https://api.mch.weixin.qq.com/secapi/pay/refund'
};

var device_info = 'WEB',
    fee_type = 'CNY',
    trade_type = weChatTools.payTypes.JSAPI, //交易类型
    //notify_url = 'http://test.api.pay.w-lans.cn/pay/notice'; //订单通知地址
    notify_url = 'http://test.pay.178wifi.com/pay/notice'//订单通知地址

/**
 *  @API：下订单
 *  @Create Date :  2017-04-24
 *  @Require args : bid = 0,title,totel_fee,spbill_create_ip,openid
 */
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

            //测试数据
            var bid = '0',  //商圈编号
                title = 'ceshi',  //商品描述
                wx_order_no = '', //订单号  非必传，
                total_fee = 5,  //总金额
                spbill_create_ip = req.headers['x-forwarded-for'], //用户客户端IP
                openid = 'or0Yltxu45dWsOsJVp9VchNKsUrA'; //用户标识
            console.log('客户端ip:',spbill_create_ip)
            var time_start = moment().format('YYYYMMDDHHmmss')  //下单时间
            console.log('---------  下单时间  ---------')
            console.log(time_start)

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
                console.log('秘钥 key:',config.appSecret)
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
                            time_start : time_start,
                            last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),//最后更新时间
                            total_fee_left : total_fee
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
        console.log('----- final result  ------')
        console.log(arg1)
        console.log(arg2)
        res.locals.wxconfig = arg1
        res.locals.wxchoosepay = arg2
        res.render('jsapi')
    })
};


//微信回调通知
exports.Notice = function (req, res, next) {
    var str = JSON.stringify(req.body);
    str = weChatTools.xmlToJson(str);
    console.log()
    console.log('-------  支付回调结果  --------')
    console.log(str)
    console.log()
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
            time_end: moment(str.time_end, 'YYYYMMDDHHmmss').format('X'),//格式化时间
            time_end_origin : str.time_end,//没有进行格式化时间
            last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),//最后更新时间
            is_done : 1,
            msg : 'order paid'
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
            if (err){
                console.log('----  update err  ----')
                console.log(err)
                //return res.end(NoticeResponse(err.message));
            }
            return res.end(NoticeResponse(1));
        });
    });
};

/**
 *  @API：关闭订单
 *  @Create Date :  2017-04-24
 *  @Require args : bid = 0,out_trade_no
 */
exports.closeOrder = function(req,res){
    if(!req.body.bid){
        return res.json(exception.throwError(exception.code.error, 'bid can not be null'))
    }
    if(!req.body.out_trade_no){
        return res.json(exception.throwError(exception.code.error, 'out_trade_no can not be null'))
    }
    var out_trade_no = req.body.out_trade_no,
        bid = req.body.bid
    var config = businessConfig[bid];
    weChatPay.findOne({out_trade_no:out_trade_no},function(err,doc){
        if(err){
            console.log('-----  search err  -----')
            console.error(err)
            res.json({'error':err})
        }
        console.log('-----  check search result  -----')
        console.log(doc)
        if(!doc){
            console.log('-----  search result is null  -----')
            res.json({'Msg':'doc is null'})
        }

        if(doc.is_done === 1){
            return res.json(exception.throwError(exception.code.error, '该订单已关闭'))
        }
        var time_start = moment(doc.time_start,'YYYYMMDDHHmmss').format('X')
            now_time = moment(Date.now()).format('X')

        console.log('-----  check time  -----')
        console.log('time_start: ',time_start)
        console.log('now_time: ',now_time)

        if((now_time - time_start) < 300 ){//订单生成后不能马上调用关单接口，最短调用时间间隔为5分钟。
            return res.json(exception.throwError(exception.code.error, '订单生成后不能马上调用关单接口，最短调用时间间隔为5分钟'))
        }

        var nonce_str = weChatTools.randomStr(),
            sign_data = {
                appid: config.appid,
                mch_id: config.mch_id,
                nonce_str : nonce_str,
                out_trade_no : out_trade_no,
            },
            sign = weChatTools.sign(sign_data, config.appSecret),
            xml_content_data = {
                xml: [
                    {appid: config.appid},
                    {mch_id: config.mch_id},
                    {nonce_str: nonce_str},
                    {out_trade_no: out_trade_no},
                    {sign: sign}
                ]
            },
            post_data = xml(xml_content_data);
        console.log('sign: ',sign)
        console.log('post_data: ',post_data)

        var req_options = url.parse(path.closeOrder);
            req_options.method = 'POST';
            req_options.port = 443;
            req_options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };

        var close_req = https.request(req_options,function(close_res){
            console.log('-----  https request  -----')
            close_res.setEncoding('utf8')
            var result = ''
            close_res.on('data',function(chunk){
                result += chunk
            })
            close_res.on('end',function(){
                console.log('-----  https request end  -----')
                result = weChatTools.xmlToJson(result)
                console.log(result)
                if(result.return_code == 'FAIL')
                    return res.json(exception.throwError(exception.code.error, result.return_msg))
                if(result.result_code == 'FAIL')
                    return res.json(exception.throwError(result.err_code,result.err_code_des))
                if(result.result_code == 'SUCCESS'){
                    //关闭成功
                    var content = {
                        is_close : 1,
                        last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),
                        msg : 'close order'
                    }
                    //更新记录
                    weChatPay.UpdateById(doc._id,content,function(err){
                        if(err){
                            console.log('-----  update err  -----')
                            console.error(err)
                            res.json({'err':err})
                        }
                        console.log('----- closeOrder done  ----')
                        res.json({'result':'success'})
                    })
                }
            })
        })
        close_req.on('error',function(e){
            console.log('-----  request error  -----')
            console.error(e)
        })
        close_req.write(post_data)
        close_req.end()
    })
}
/**
 *  @API：退款
 *  @Create Date :  2017-04-25
 *  @Require args : bid = 0, transaction_id || out_trade_no, sign, total_fee, refund_fee
 */ 
exports.refund = function(req,res){
    if(!req.body.bid){
        return res.json(exception.throwError(exception.code.error,'bid不能为空'))
    }
    if(!req.body.transaction_id && !req.body.out_trade_no){
        return res.json(exception.throwError(exception.code.error,'微信订单号和商户订单号不能同时为空'))
    }
    if(!req.body.refund_fee){
        return res.json(exception.throwError(exception.code.error,'refund_fee不能为空'))
    }
    if(!req.body.total_fee){
        return res.json(exception.throwError(exception.code.error,'total_fee不能为空'))
    }
    
    //var is_all = req.body.is_all||1 //默认全部退款(默认1)

    var bid = req.body.bid,
        transaction_id = req.body.transaction_id,
        out_trade_no = req.body.out_trade_no,
        refund_fee = req.body.refund_fee,
        total_fee = req.body.total_fee,
        config = businessConfig[bid],
        refund_time = moment(Date.now()).format('YYYYMMDDHHmmss'),
        appid = config.appid,
        mch_id = config.mch_id,
        op_user_id = config.mch_id,
        nonce_str = weChatTools.randomStr(),
        out_refund_no = weChatTools.merchatPayOrderNo(trade_type)

    if(refund_fee == total_fee){//全部退款
        async.waterfall([
            function(cb){//订单不存在或者交易时间超过一年，直接返回
                weChatPay.findOne({'$or' : [{'transaction_id':transaction_id},{'out_trade_no':out_trade_no}]},function(err,doc){
                    if(err){
                        console.log('-----  search err  -----')
                        console.error(err)
                        return cb(err)
                    }
                    if(!doc){
                        console.log('-----  doc is null  -----')
                        return cb('订单不存在')
                    }
                    var order_time_end_origin = moment(doc.time_end_origin,'YYYYMMDDHHmmss').format('X'),
                        now_time = moment().format('X')
                    console.log('-----  订单交易时间  -----')
                    console.log(order_time_end_origin)
                    console.log(now_time)
                    if(now_time - order_time_end_origin > 31536000){
                        console.log('-----  交易时间超过1年  -----')
                        return cb('交易时间超过1年')
                    }
                    if(total_fee != doc.total_fee){
                        console.log('-----  订单金额或退款金额不一致  -----')
                        return cb('订单金额或退款金额不一致')
                    }
                    cb(null,doc)
                })
            },
            function(doc,cb){
                if(doc.is_refund == 1 && doc.is_refund_done ==0){//(一笔退款失败后的重新提交, 需采用原来的退款单号.)
                    console.log('-----  该订单退款过，但未成功  -----')
                    console.log('new out_refund_no: ',out_refund_no)
                    out_refund_no = doc.out_refund_no
                    console.log('use old out_refund_no: ',out_refund_no)
                }
                console.log('-----  doc result  -----')
                console.log(doc)
                var sign_data = {
                    appid : appid,
                    mch_id : mch_id,
                    op_user_id : mch_id,
                    nonce_str : nonce_str,
                    out_refund_no : out_refund_no,//唯一退款单号
                    out_trade_no : out_trade_no,
                    refund_fee : refund_fee,
                    total_fee : total_fee
                },
                sign = weChatTools.sign(sign_data, config.appSecret),
                xml_content_data = {
                    xml:[
                        {appid: appid},
                        {mch_id: mch_id},
                        {nonce_str: nonce_str},
                        {sign: sign},
                        {out_refund_no:out_refund_no},
                        {out_trade_no: out_trade_no},
                        {total_fee : total_fee},
                        {refund_fee : total_fee},
                        {op_user_id : mch_id}
                    ]
                },
                post_data = xml(xml_content_data)
                console.log('sign_data: ',sign_data)
                console.log('sign: ',sign)
                console.log('post_data: ',post_data)

                var req_options = url.parse(path.refund);
                    req_options.method = 'POST';
                    req_options.port = 443;
                    req_options.pfx = fs.readFileSync('./apiclient_cert.p12');
                    req_options.passphrase = '1297554801';
                    req_options.agent = false;
                    req_options.headers = {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                };

                var refund_req = https.request(req_options,function(refund_res){
                    console.log('-----  https request  -----')
                    refund_res.setEncoding('utf8')
                    var result = ''
                    refund_res.on('data',function(chunk){
                        result += chunk
                    })
                    refund_res.on('end',function(){
                        console.log('-----  https request end  -----')
                        result = weChatTools.xmlToJson(result)
                        console.log(result)
                        if(result.return_code == 'FAIL')
                            return res.json(exception.throwError(exception.code.error, result.return_msg))
                        if(result.result_code == 'FAIL'){
                            //申请成功，但是退款不成功
                            console.log('-----  申请成功，但是退款不成功  -----')
                            var content = {
                                is_refund : 1,//0标识申请过退款
                                is_refund_done : 0,//0标识退款失败
                                refund_times : doc.refund_times + 1,
                                last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),
                                refund_time : refund_time,
                                out_refund_no : out_refund_no,
                                refund_total_fee : total_fee,
                                refund_fee : refund_fee,
                                msg : result.err_code_des,
                                total_fee_left : total_fee
                            }
                            weChatPay.UpdateById(doc._id,content,function(err){
                                if(err){
                                    console.log('-----  update err  -----')
                                    console.error(err)
                                    cb('update err')
                                }
                                 return res.json(exception.throwError(result.err_code,result.err_code_des))
                            })
                        }
                        if(result.result_code == 'SUCCESS'){
                            //退款成功
                            var content = {
                                is_refund : 1,
                                is_refund_done : 1,
                                refund_times : doc.refund_times + 1,//退款次数
                                refund_done_times : doc.refund_done_times +1,//退款成功次数
                                last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),
                                refund_time : refund_time,
                                refund_id : result.refund_id,
                                out_refund_no : out_refund_no,
                                refund_total_fee : total_fee,
                                refund_fee : refund_fee,
                                msg : '退款处理成功',
                                total_fee_left : 0
                            }
                            //更新记录
                            weChatPay.UpdateById(doc._id,content,function(err){
                                if(err){
                                    console.log('-----  update err  -----')
                                    console.error(err)
                                    cb('update err')
                                }
                                cb(null)
                            })
                        }//success
                    })
                })
                refund_req.on('error',function(e){
                    console.log('-----  request error  -----')
                    console.error(e)
                })
                refund_req.write(post_data)
                refund_req.end()
            }
        ],function(err,result){
            if(err){
                console.log('-----  async err  -----')
                console.error(err)
                return res.json({'err':err})
            }
            return res.json({'result':'success'})
        })
    }
    if(total_fee != refund_fee){//部分退款
        async.waterfall([
            function(cb){//订单不存在或者交易时间超过一年，直接返回
                weChatPay.findOne({'$or' : [{'transaction_id':transaction_id},{'out_trade_no':out_trade_no}]},function(err,doc){
                    if(err){
                        console.log('-----  search err  -----')
                        console.error(err)
                        cb(err)
                    }
                    if(!doc){
                        console.log('-----  doc is null  -----')
                        cb('订单不存在')
                    }
                    var order_time_end_origin = moment(doc.time_end_origin,'YYYYMMDDHHmmss').format('X'),
                        now_time = moment().format('X')
                    console.log('-----  订单交易时间  -----')
                    console.log(order_time_end_origin)
                    console.log(now_time)
                    if(now_time - order_time_end_origin > 31536000){
                        console.log('-----  交易时间超过1年  -----')
                        return  cb('交易时间超过1年')
                    }
                    // if(total_fee != doc.total_fee){
                    //     console.log('-----  交易total_fee金额有误  -----')
                    //     return cb('交易total_fee金额有误')
                    // }
                    cb(null,doc)
                })
            },
            function(doc,cb){console.log('---------------  dd  -------------------')
                // if(refund_fee > doc.total_fee_left){
                //     console.log('-----  剩余金额不足以退款  -----')
                //     cb('剩余金额不足以退款')
                // }
                /*if(doc.is_refund == 1 && doc.is_refund_done == 0){//(一笔退款失败后的重新提交, 需采用原来的退款单号.)
                    console.log('-----  该订单退款过，但未成功  -----')
                    console.log('new out_refund_no: ',out_refund_no)
                    out_refund_no = doc.out_refund_no
                    console.log('use old out_refund_no: ',out_refund_no)
                }*/

                console.log('-----  doc result  -----')
                console.log(doc)

                var sign_data = {
                    appid : appid,
                    mch_id : mch_id,
                    op_user_id : mch_id,
                    nonce_str : nonce_str,
                    out_refund_no : out_refund_no,//唯一退款单号
                    out_trade_no : out_trade_no,
                    refund_fee : refund_fee,
                    total_fee : total_fee
                },
                sign = weChatTools.sign(sign_data, config.appSecret),
                xml_content_data = {
                    xml:[
                        {appid: appid},
                        {mch_id: mch_id},
                        {nonce_str: nonce_str},
                        {sign: sign},
                        {out_refund_no:out_refund_no},
                        {out_trade_no: out_trade_no},
                        {total_fee : total_fee},
                        {refund_fee : refund_fee},
                        {op_user_id : mch_id}
                    ]
                },
                post_data = xml(xml_content_data)
                console.log('sign_data: ',sign_data)
                console.log('sign: ',sign)
                console.log('post_data: ',post_data)

                var req_options = url.parse(path.refund);
                    req_options.method = 'POST';
                    req_options.port = 443;
                    req_options.pfx = fs.readFileSync('./apiclient_cert.p12');
                    req_options.passphrase = '1297554801';
                    req_options.agent = false;
                    req_options.headers = {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                };

                var refund_req = https.request(req_options,function(refund_res){
                    console.log('-----  https request  -----')
                    refund_res.setEncoding('utf8')
                    var result = ''
                    refund_res.on('data',function(chunk){
                        result += chunk
                    })
                    refund_res.on('end',function(){
                        console.log('-----  https request end  -----')
                        result = weChatTools.xmlToJson(result)
                        console.log(result)
                        if(result.return_code == 'FAIL')
                            return res.json(exception.throwError(exception.code.error, result.return_msg))
                        if(result.result_code == 'FAIL'){
                            //申请成功，但是退款不成功
                            console.log('-----  申请成功，但是退款不成功  -----')
                            var content = {
                                is_refund : 1,//0标识申请过退款
                                is_refund_done : 0,//0标识退款失败
                                refund_times : doc.refund_times + 1,
                                last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),
                                refund_time : refund_time,
                                out_refund_no : out_refund_no,
                                refund_total_fee : total_fee,
                                refund_fee : refund_fee,
                                msg : result.err_code_des
                            }
                            weChatPay.UpdateById(doc._id,content,function(err){
                                if(err){
                                    console.log('-----  update err  -----')
                                    console.error(err)
                                    cb('update err')
                                }
                                 return res.json(exception.throwError(result.err_code,result.err_code_des))
                            })
                        }
                        if(result.result_code == 'SUCCESS'){
                            //退款成功
                            var name = 'out_refund_no_' + doc.refund_times
                            console.log('name: ',name)

                            console.log('-----  add stat success  -----')
                                var content = {
                                    is_refund : 1,
                                    is_refund_done : 1,
                                    refund_times : doc.refund_times + 1,
                                    refund_done_times : doc.refund_done_times + 1,
                                    last_modify_time : moment(Date.now()).format('YYYYMMDDHHmmss'),
                                    refund_total_fee : total_fee,
                                    msg : '退款处理成功',
                                    refund_fee : {refund_fee},
                                    total_fee_left : doc.total_fee_left - refund_fee
                                }
                                //更新记录
                                weChatPay.UpdateById(doc._id,content,function(err){
                                    if(err){
                                        console.log('-----  update err  -----')
                                        console.error(err)
                                        return cb('update err')
                                    }
                                    return cb(null)
                                })
                        }//success
                    })
                })
                refund_req.on('error',function(e){
                    console.log('-----  request error  -----')
                    console.error(e)
                })
                refund_req.write(post_data)
                refund_req.end()
            }
        ],function(err,result){
            if(err){
                console.log('-----  async err  -----')
                console.error(err)
                return res.json({'err':err})
            }
            return res.json({'result':'success'})
        })
    }
    if(refund_fee > total_fee){
        return res.json(exception.throwError(exception.code.error,'refund_fee > total_fee'))
    }
}
/**
 *  @API：订单号查询
 *  @Create Date :  2017-04-25
 *  @Require args : bid = 0, orderNo
 */ 
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
/**
 *  @API：商户号查询
 *  @Create Date :  2017-04-25
 *  @Require args : bid = 0, out_trade_no
 */ 
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
/**
 *  @API：微信订单号查询
 *  @Create Date :  2017-04-25
 *  @Require args : bid = 0, transaction_id
 */ 
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
    console.log('----  response notice  ----')
    console.log(xml(result))
    return xml(result);
};
