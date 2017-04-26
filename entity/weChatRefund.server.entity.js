/**
 *  @Author:    chenrx
 *  @Create Date:   2017-04-24
 *  @Description:    退款数据记录
 */
var mongoose = require('mongoose'),
	config = require('../config/sysConfig');

var weChatRefundSchema = new mongoose.Schema({
	appid : String,
	mch_id : String,
	nonce_str : String,
	sign : String,
	
	transaction_id : String,//微信订单号
	out_trade_no : String,//商户订单号
	out_refund_no : String,//商户退款单号
	refund_id : String,//微信退款单号
	refund_fee : Number,//退款金额
	total_fee : Number,//标价金额
	cash_fee : Number,//现金支付金额
})
mongoose.model(config.tables.weChatRefund, weChatRefundSchema);