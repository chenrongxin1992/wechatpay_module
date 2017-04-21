var moment=require('moment');
/**1
 *  @Author:  Relax
 *  @Create Date: 2016-05-26
 *  @Description: 数据基本校验工具
 */
exports.Name=function (name) {
    var reg = /^(([\u4e00-\u9fa5]{2,7})|([a-zA-Z\s]){2,20})$/;
    return reg.test(name);
};
exports.Phone=function (phone) {
    var reg=/^1[3-8]\d{9}$/;
    return reg.test(phone);
};
exports.IdNo=function (idno) {
    var reg=/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
    return reg.test(idno);
};
exports.CheckEmail=function (email) {
    var reg=/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    return reg.test(email);
};
exports.CheckDate=function (date) {
    var str=moment(date,'YYYY/MM/DD HH:mm:ss').format('YYYY/MM/DD HH:mm:ss');
    return !(str=='Invalid date');
};

exports.CheckNumber=function (number) {
    var number=parseFloat(number);
    return  isNaN(number);
};