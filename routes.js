/**
 *  @Author:  Relax
 *  @Create Date: 2016-06-29
 *  @Description: 路由
 */
var index = require('./routes/index'),
    payJsApi = require('./routes/pay.jsapy');
module.exports = function (app) {
    app.get('/MP_verify_UoXtBUxJ1Hh9SUUn.txt',index.MP_verify_UoXtBUxJ1Hh9SUUn)
    app.get('/index', index.index);
    app.get('/paytest', index.PayTest);
    app.get('/pay/jsapi', payJsApi.PlaceOrder);//JSAPI支付请求,获取prepay_id
    app.post('/pay/jsapi', payJsApi.PlaceOrder);//JSAPI支付请求,获取prepay_id
    //微信回调
    app.post('/pay/notice', payJsApi.Notice); //支付消息通知
    //查询
    app.post('/pay/serach/orderNo', payJsApi.Serach_By_OrderNo);//根据订单号查询
    app.post('/pay/serach/outTradeNo', payJsApi.Serach_By_OutTradeNo);//根据商户订单号查询
    app.post('/pay/serach/transactionId', payJsApi.Serach_By_TransactionId);//根据微信支付订单号查询
    //退款
    //
};