var { APIS } = require('../const');
var { request } = require('./request');

// 用户行为日志
/*
  logType 0为访问需求详情，1为留言，2为更改需求状态，后续再扩展
  objectId 操作对象的id，可以是需求id、留言id等
  extInfo 非必填，用来存储描述这次行为的额外信息，kv格式的存储，json格式化后直接传给服务端存储
**/
function userLog(logType, objectId, extInfo) {
  var data = {
    sid: wx.getStorageSync('sid'),
    logType: logType,
    objectId: objectId
  }
  if (extInfo) {
    data.extInfo = extInfo;
  }
  request({
    url: APIS.USER_LOG,
    data: data,
    method: 'POST',
    realSuccess: function (data) {
      wx.hideLoading();
    },
    loginCallback: function () {
      log(logType, objectId, extInfo);
    },
    realFail: function (msg) {
      wx.hideLoading();
    }
  }, true);
}

module.exports = {
  userLog: userLog
}