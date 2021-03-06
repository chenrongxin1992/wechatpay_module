/**
 *  @Author:    Relax
 *  @Create Date:   2016-07-11
 *  @Description:    订单数据记录
 */
var mongoose = require('mongoose'),
    config = require('../config/sysConfig');

var WeChatPayOrder = new mongoose.Schema({
    bid: {  //商圈编号
        type: Number,
        require: true
    },
    appid: { //公众号APPID
        type: String,
        require: true,
    },
    mch_id: { //商户号 微信支付所分配的商户号
        type: String,
        require: true
    },
    device_info: {
        type: String,
        default: 'WEB'
    },
    nonce_str: String, //随机字符串
    sign: String, //签名
    body: String, //商品描述
    detial: String,//商品详情
    attach: String,//附加数据
    out_trade_no: { //商户订单号
        type: String,
        require: true
    },
    wx_order_no: { //沃享订单号
        type: String,
        require: true
    },
    fee_type: { //货币类型 默认货币CNY 人民币
        type: String,
        default: 'CNY'
    },
    total_fee: { //总金额 单位 分
        type: Number,
        require: true
    },
    spbill_create_ip: String,//APP和网页支付提交用户端ＩＰ
    time_start: String, //订单生成时间 格式 YYYYMMDDHHmmss(20170424101848)
    time_expire: String, //订单结束时间  结束时间必须大于开始时间至少5分钟
    goods_tag: String, //商品标记
    notify_url: String,  //通知地址 通知回调地址
    trade_type: {   //交易类型
        type: String,
        default: 'JSAPI'
    },
    limit_pay: String,//制定支付方式
    openid: { //用户openid
        type: String,
        require: true
    },
    prepay_id: String, //预支付交易会话标识,
    code_url: String,//二维码链接地址  (扫码支付才会有)
    is_subscribe: {
        type: Number,
        default: 0,
        enum: [0, 1]
    },//是否关注公众号 0:未关注，1关注
    bank_type: String, //付款银行
    settlement_total_fee: Number, //应结算金额
    cash_fee: Number,//现金支付金额
    cash_fee_type: String,//现金支付货币类型
    coupon_fee: Number,//代金券金额
    coupon_count: Number,//代金券使用数量
    transaction_id: String,//微信支付订单号
    time_end: Number,//支付完成时间，时间戳格式(1493000341)
    dtCreate: {
        type: Date,
        default: Date.now()
    },
    time_end_origin:String,//原始格式结束时间，微信传过来的(20170424101901)
    last_modify_time:String,//格式和time_end_origin一样
    is_done : { //订单是否完成，0否，1是
        type : Number,
        default : 0
    },
    is_close : {//订单是否请求关闭，0否，1是
        type : Number,
        default : 0
    },
    msg : { //信息说明
        type : String,
        default : null
    },
    refund_times : {
        type:Number,
        default:0
    },//退款次数
    refund_done_times:{
        type:Number,
        default:0
    },//退款成功次数
    is_refund : Number,  //是否退款单(0否1是)
    is_refund_done : [{
        type:Number,
        default:null
    }],//退款是否完成
    refund_time : [{
        type : String
    }],//退款完成时间(20170424101901)
    refund_id : [{
        type:String
    }] ,//微信退款单
    out_refund_no : [{
        type : String
    }],//商户退款单
    refund_fee : [{
        type:Number
    }],//退款金额,
    refund_total_fee : Number,//退款标价金额
    total_fee_left : Number//多次退款时剩余的金额

});
//Schema.add( { name: ‘String’, email: ‘String’, age: ‘Number’ } )
/**
 *
 * @param dynamic
 * @param callback
 * @constructor
 */
WeChatPayOrder.statics.addStat = function(name,callback){
    this.add({name:'String'},function(err){
        callback(err)
    })
}
/**
 *
 * @param orderNo
 * @param callback
 * @constructor
 */
WeChatPayOrder.statics.FindOneByOut_trade_no = function (orderNo, callback) {
    this.findOne({out_trade_no: orderNo}, function (err, doc) {
        callback(err, doc);
    });
};
/**
 * 修改数据
 * @param id
 * @param content
 * @param callback
 * @constructor
 */
WeChatPayOrder.statics.UpdateById = function (id, content, callback) {
    this.update({_id: id}, {$set: content}, function (err) {
        callback(err);
    });
};

//格式化数据
WeChatPayOrder.statics.ToJson = function (doc) {
    if (!doc) {
        return null;
    }
    var result = {
        bid: doc.bid,//商圈编号
        appid: doc.appid, //公众号APPID
        mch_id: doc.mch_id, //商户号
        title: doc.body,//商品标题
        detial: doc.detial,//商品详情
        out_trade_no: doc.out_trade_no,//商户订单号
        orderNo: doc.wx_order_no, //订单号
        feeType: doc.fee_type,//支付货币类型 默认CNY 人民币
        totalFee: doc.total_fee, //支付总金额 单位：分
        ip: doc.spbill_create_ip, //支付客户端IP
        timeStart: doc.time_start,//订单生成时间
        timeExprie: doc.time_expire,//订单结束时间
        tradeType: doc.trade_type,//交易类型
        openid: doc.openid,
        isSubscribe: doc.is_subscribe,//是否关注公众号
        setttlementTotalFee: doc.settlement_total_fee,//应该结算金额
        cashFee: doc.cash_fee,//现金支付金额
        cashFeeType: doc.cash_fee_type,//现金支付货币类型
        transactionId: doc.transaction_id,//微信支付订单号
        timeEnd: doc.time_end,//支付完成时间,
        is_done:doc.is_done,//是否支付完成
        is_close:doc.is_close,//是否关闭订单
        time_end:doc.time_end,//订单完成时间，格式化微信返回时间
        time_end_origin:doc.time_end_origin,//订单完成时间，微信返回
        last_modify_time:doc.last_modify_time,//最后修改时间
        msg:doc.msg,//信息
        is_refund:doc.is_refund,
        is_refund_done:doc.is_refund_done,
        refund_times:doc.refund_times,
        refund_done_times:doc.refund_done_times,
        refund_time:doc.refund_time,
        refund_id:doc.refund_id,
        out_refund_no:doc.out_refund_no,
        refund_fee:doc.refund_fee,
        total_fee_left:doc.total_fee_left,
        refund_total_fee:doc.refund_total_fee
    };
    return result;
};
mongoose.model(config.tables.weChatPayOrder, WeChatPayOrder);