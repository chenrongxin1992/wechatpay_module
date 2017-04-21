var tools = require('../tools/weChatTools'),
    exception = require('../module/exception'),
    sysConfig = require('../config/sysConfig'),
    https = require('https'),
    moment = require('moment'),
    weChatTools = require('../tools/weChatTools'),
    async = require('async'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path')

//
exports.MP_verify_UoXtBUxJ1Hh9SUUn = function(req,res){
    fs.readFile('./MP_verify_UoXtBUxJ1Hh9SUUn.txt',function(err,data){
        data = data.toString()
        res.send(data)
    })
}
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

//进入页面获取微信注入参数
exports.PayTest = function (req, res, next) {
    // getJSApiTicket()
    var wxConfig = {},
        appid = 'wxe8eb1beadd82b467',
        appSecret = 'f9d0d00749ff5d8c642f4d5a41148260'

    // var data = fs.readFileSync('./docs/jsapi_ticket'),
    //     data = data.toString(),
    //     data = JSON.parse(data),
    //     expireTime = data.expires_in

    // fs.readFile('./docs/jsapi_ticket',function(err,data){
    //     if(err){
    //         console.log('-----  read file err  -----')
    //         console.error(err)
    //     }
    //     if(data = '' || data = null){

    //     }
    // })

    
    async.waterfall([
        function(cb){
            var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appSecret
            var res_data = ''

            https.get(url,function(res){
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    console.log('-----  getAccessToken end  -----')
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    console.log(res_data.access_token)
                    cb(null,res_data.access_token)
                    //callback(res_data.access_token)
                })
                res.on('error',function(){
                    console.log('-----  getAccessToken err  -----')
                    cb(error)
                })
            })
        },
        function(arg,cb){
            var access_token = arg ,
                jsapi_ticket = '',
                jsapi_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi'

            https.get(jsapi_url,function(res){
                var res_data = ''
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    var expireTime = parseInt(moment().format('X')) + 7200    //过期时间
                    console.log('-----  getJSApiTicket end  -----') 
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    jsapi_ticket = res_data.ticket

                    res_data.expires_in = expireTime + 7200
                    res_data = JSON.stringify(res_data)
                    //写入文件
                    fs.writeFile('./docs/jsapi_ticket',res_data,function(err){
                        if(err){
                            console.log('-----  存jsapi_ticket失败  -----')
                            console.error(err)
                            cb(err)
                        }
                        console.log('-----  存jsapi_ticket成功  -----')
                        console.log(jsapi_ticket)
                        cb(null,jsapi_ticket)
                    })
                })
                res.on('error',function(){
                     console.log('-----  getJSApiTicket err  -----')
                     cb(error)
                })
            })
        },
        function(arg,cb){
                
            var timestamp = moment().format('X'),  //10位
                noncestr = weChatTools.randomStr(), //16位
                url = 'http://test.pay.178wifi.com/paytest',
                jsapi_ticket = arg,
                str = 'jsapi_ticket='+jsapi_ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url,
                shasum = crypto.createHash('sha1')

            shasum.update(str)

            wxConfig.signature = shasum.digest('hex')
            wxConfig.appid = appid
            wxConfig.timestamp = timestamp
            wxConfig.noncestr = noncestr
            console.log('-----  wxConfig  -----')
            console.log(wxConfig)
            cb(null,wxConfig)
        }
    ],function(err,result){
        if(err){
            console.log('-----  async err  -----')
            console.error(err)
        }
        //res.json(result)
        res.render('paytest',{ res : result})
    })
};

exports.getWxConfig = function(callback){
    var wxConfig = {},
        appid = 'wxe8eb1beadd82b467',
        appSecret = 'f9d0d00749ff5d8c642f4d5a41148260'

    // var data = fs.readFileSync('./docs/jsapi_ticket'),
    //     data = data.toString(),
    //     data = JSON.parse(data),
    //     expireTime = data.expires_in

    // fs.readFile('./docs/jsapi_ticket',function(err,data){
    //     if(err){
    //         console.log('-----  read file err  -----')
    //         console.error(err)
    //     }
    //     if(data = '' || data = null){

    //     }
    // })

    
    async.waterfall([
        function(cb){
            var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appSecret
            var res_data = ''

            https.get(url,function(res){
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    console.log('-----  getAccessToken end  -----')
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    console.log(res_data.access_token)
                    cb(null,res_data.access_token)
                    //callback(res_data.access_token)
                })
                res.on('error',function(){
                    console.log('-----  getAccessToken err  -----')
                    cb(error)
                })
            })
        },
        function(arg,cb){
            var access_token = arg ,
                jsapi_ticket = '',
                jsapi_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi'

            https.get(jsapi_url,function(res){
                var res_data = ''
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    var expireTime = parseInt(moment().format('X')) + 7200    //过期时间
                    console.log('-----  getJSApiTicket end  -----') 
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    jsapi_ticket = res_data.ticket

                    res_data.expires_in = expireTime + 7200
                    res_data = JSON.stringify(res_data)
                    //写入文件
                    fs.writeFile('./docs/jsapi_ticket',res_data,function(err){
                        if(err){
                            console.log('-----  存jsapi_ticket失败  -----')
                            console.error(err)
                            cb(err)
                        }
                        console.log('-----  存jsapi_ticket成功  -----')
                        console.log(jsapi_ticket)
                        cb(null,jsapi_ticket)
                    })
                })
                res.on('error',function(){
                     console.log('-----  getJSApiTicket err  -----')
                     cb(error)
                })
            })
        },
        function(arg,cb){
                
            var timestamp = moment().format('X'),  //10位
                noncestr = weChatTools.randomStr(), //16位
                url = 'http://test.pay.178wifi.com/pay/jsapi',
                jsapi_ticket = arg,
                str = 'jsapi_ticket='+jsapi_ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url,
                shasum = crypto.createHash('sha1')

            shasum.update(str)

            wxConfig.signature = shasum.digest('hex')
            wxConfig.appid = appid
            wxConfig.timestamp = timestamp
            wxConfig.noncestr = noncestr
            console.log('-----  wxConfig  -----')
            console.log(wxConfig)
            cb(null,wxConfig)
        }
    ],function(err,result){
        if(err){
            console.log('-----  async err  -----')
            console.error(err)
        }
        //res.json(result)
        //res.render('paytest',{ res : result})
        return callback(result);
    })
}

exports.test2=function(req,res,next){
    var wxConfig = {},
        appid = 'wxe8eb1beadd82b467',
        appSecret = 'f9d0d00749ff5d8c642f4d5a41148260'

    async.waterfall([
        function(cb){
            var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appSecret
            var res_data = ''

            https.get(url,function(res){
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    console.log('-----  getAccessToken end  -----')
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    console.log(res_data.access_token)
                    cb(null,res_data.access_token)
                    //callback(res_data.access_token)
                })
                res.on('error',function(){
                    console.log('-----  getAccessToken err  -----')
                    cb(error)
                })
            })
        },
        function(arg,cb){
            var access_token = arg ,
                jsapi_ticket = '',
                jsapi_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi'

            https.get(jsapi_url,function(res){
                var res_data = ''
                res.on('data',function(chunk){
                    res_data += chunk
                })
                res.on('end',function(){
                    var expireTime = parseInt(moment().format('X')) + 7200    //过期时间
                    console.log('-----  getJSApiTicket end  -----') 
                    res_data = JSON.parse(res_data)
                    console.log(res_data)
                    jsapi_ticket = res_data.ticket

                    res_data.expires_in = expireTime + 7200
                    res_data = JSON.stringify(res_data)
                    //写入文件
                    fs.writeFile('./docs/jsapi_ticket',res_data,function(err){
                        if(err){
                            console.log('-----  存jsapi_ticket失败  -----')
                            console.error(err)
                            cb(err)
                        }
                        console.log('-----  存jsapi_ticket成功  -----')
                        console.log(jsapi_ticket)
                        cb(null,jsapi_ticket)
                    })
                })
                res.on('error',function(){
                     console.log('-----  getJSApiTicket err  -----')
                     cb(error)
                })
            })
        },
        function(arg,cb){
                
            var timestamp = moment().format('X'),  //10位
                noncestr = weChatTools.randomStr(), //16位
                url = 'http://test.pay.178wifi.com/test2',
                jsapi_ticket = arg,
                str = 'jsapi_ticket='+jsapi_ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url,
                shasum = crypto.createHash('sha1')

            shasum.update(str)

            wxConfig.signature = shasum.digest('hex')
            wxConfig.appid = appid
            wxConfig.timestamp = timestamp
            wxConfig.noncestr = noncestr
            console.log('-----  wxConfig  -----')
            console.log(wxConfig)
            cb(null,wxConfig)
        }
    ],function(err,result){
        if(err){
            console.log('-----  async err  -----')
            console.error(err)
        }
        //res.json(result)
        res.render('test2',{ res : result})
    })
}