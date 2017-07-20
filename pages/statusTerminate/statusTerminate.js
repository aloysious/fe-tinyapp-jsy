// pages/statusTerminate/statusTerminate.js
var { statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    title: '',
    status: 0,
    statusText: '',
    statusColor: '',
    today: '',
    avatar: '',
    content: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rid: options.rid,
      title: options.title,
      status: options.status,
      statusText: statusListSimple[options.status + ''].text,
      statusColor: statusListSimple[options.status + ''].color,
      today: util.formatDate(new Date()),
      avatar: wx.getStorageSync('userInfo').avatarUrl
    });
  },

  onInputContent: function(e) {
    this.setData({
      content: util.trim(e.detail.value)
    });
  },

  onSubmitReason: function() {
    var that = this;

    if (!this.data.content) {
      wx.showToast({
        title: '留言不能为空！'
      });
      return;
    }

    var data = this.data;
    request({
      url: APIS.TERMINATE_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: data.rid,
        reason: data.content
      },
      method: 'POST',
      realSuccess: function (data) {
        //wx.hideLoading();
        wx.showToast({
          title: '提交成功，请耐性等待审核！',
        })
        setTimeout(function() {        
          wx.navigateBack({
            delta: 2
          });
        }, 3000);
      },
      loginCallback: that.onSubmitReason,
      realFail: function (msg, errCode) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true, this);
  }
})