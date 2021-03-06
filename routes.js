/**
 *  @Author:  Relax
 *  @Create Date: 2016-06-29
 *  @Description: 路由
 */
var index = require('./routes/index'),
    payJsApi = require('./routes/pay.jsapy');
module.exports = function (app) {
    app.get('/MP_verify_UoXtBUxJ1Hh9SUUn.txt',index.MP_verify_UoXtBUxJ1Hh9SUUn)
    //app.get('/index', index.index);
    //app.get('/paytest', index.PayTest);
    //测试使用地址，get方法
    app.get('/pay/jsapi', payJsApi.PlaceOrder_bk);//JSAPI支付请求,获取prepay_id
    //实际使用地址，post方法
    app.post('/pay/jsapi', payJsApi.PlaceOrder);//JSAPI支付请求,获取prepay_id
    //微信回调
    app.post('/pay/notice', payJsApi.Notice); //支付消息通知
    //查询
    app.post('/pay/serach/orderNo', payJsApi.Serach_By_OrderNo);//根据订单号查询
    app.post('/pay/serach/outTradeNo', payJsApi.Serach_By_OutTradeNo);//根据商户订单号查询
    app.post('/pay/serach/transactionId', payJsApi.Serach_By_TransactionId);//根据微信支付订单号查询

    //关闭订单
    app.post('/pay/closeorder',payJsApi.closeOrder)
    //退款
    app.post('/pay/refund',payJsApi.refund)
};