var mongoose = require('mongoose'),
    config = require('./sysConfig');

module.exports = function () {
    var db = mongoose.connect(config.mongodb);
    require('../entity/weChatPayOrder.server.entity');
    require('../entity/weChatRefund.server.entity');
    return db;
};