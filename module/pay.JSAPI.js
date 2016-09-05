/**
 *  @Author:  Relax
 *  @Create Date: 2016-06-29
 *  @Description: 微信支付，公众号支付方式
 */

var http = require('http'),
    https = require('https'),
    xml = require('xml'),
    url = require('url'),
    qs = require('querystring');

var path = {
    placeOrder: 'https://api.mchweixin.qq.com/pay/unifiedorder'
};

//下单
exports.PlaceOrder = function (req, res, next) {
    var appid = req.body.appid, //微信appid
        mch_id = req.body.mch_id, //微信支付的商户号
        goods = req.body.goods,//商铺描述
        total_feel = req.body.total_feel,//总金额
        spbill_careate_ip = req.body.ip, //用户交易请求客户端API
        openid = req.body.openid,//用户标识
        attach = req.body.attach; //附加数据

    var product_id = req.body.productid,//商品ID
        time_start = req.body.startTime,//交易开始时间
        time_end = req.body.endTime;//订单结束时间


    var fee_type = 'CNY', //支付货币类型
        goods_tag = 'WXG', //商铺标记
        notify_url = '',  //接受微信支付异步通知回调地址  不能携带参数
        trade_type = 'JSAPI',//交易类型 公众号支付
        limit_pay = 'no_credit', //指定支付方式  no_credit：不能使用信用卡支付
        device_info = 'WEB';//终端设备

    var nonce_str = '', //随机字符串
        out_trade_no = '', //商户订单号
        sign = '';

    //商品详情
    var detial = {
        goods_detial: [{
            goods_id: '',  //商品编号 32
            wxpay_goods: '', //微信支付定义的统一商品编号 32
            goods_name: '', //商品名称 256
            goods_num: 0, //商品数量 int
            price: 1, //商品单价 int (分)
            goods_categroy: '123456', //商品类目ID
            body: '' //商品描述信息  1000
        }]
    };
    var post_data = {
            xml: [
                {appid: appid},  //APPID
                {attach: attach},  //附件数据
                {body: goods},  //商铺描述
                {mch_id: mch_id}, // 商户号
                {nonce_str: nonce_str}, //随机字符串
                {notify_url: notify_url}, //通知URL
                {openid: openid}, //支付用户
                {out_trade_no: out_trade_no}, //商户订单号
                {spbill_create_ip: spbill_careate_ip}, //请求地址IP
                {total_fee: total_feel}, //总金额
                {trade_type: trade_type}, //交易类型 JSAPI
                {device_info: device_info},
                {fee_type: fee_type},
                {sign: sign} //签名
            ]
        },
        content = xml(post_data),
        urlParse = url.parse(path.placeOrder),
        options = {
            host: urlParse.host,
            port: urlParse.port,
            path: urlParse.path,
            method: 'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
    console.log('options:', options);
    console.log('content:', content.toString());
    var request = https.request(options, function (response) {
        console.log('statusCode:', response.statusCode);
        console.log('headers:', response.headers);
        response.on('data', function (chunk) {
            console.log('Chunk:', chunk);
        });
        response.on('end', function () {
            console.log('End');
        });
    });
    request.on('error', function (e) {
        console.log('Error:', e);
    });
    //request.write(content);
    request.end();
    res.end('AA');
};