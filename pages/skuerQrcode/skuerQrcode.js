// pages/skuerQrcode/skuerQrcode.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    name: '',
    company: '',
    contact: '',
    qrcode: '',
    skuerId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      avatar: options.avatar,
      name: options.name,
      company: options.company,
      contact: options.contact
    });

    this.getQrcode();
  },

  getQrcode: function() {
    var that = this;
    request({
      url: APIS.GET_SKUER_QRCODE,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          qrcode: data.qrCodeUrl,
          skuerId: data.skuerId
        });
        wx.hideLoading();
      },
      loginCallback: this.getQrcode,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onShareAppMessage: function (res) {
    return {
      title: '我是1+N小程序的' + this.data.name + '，成为我的客户或者配送人员吧！',
      path: '/pages/skuerBind/skuerBind?skuerId=' + this.data.skuerId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})