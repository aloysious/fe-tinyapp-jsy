var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    skuerList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMySkuerInfo();
  },

  getMySkuerInfo: function () {
    var that = this;
    request({
      url: APIS.GET_MY_SKUER_LIST,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          skuerList: data.list,
          hasMore: false
        });
        wx.hideLoading();
      },
      loginCallback: this.getMySkuerInfo,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onUnbindSkuer: function (e) {
    var skuerId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '取消关联',
      content: '是否确认删除与采购客户的关联？',
      success: function (res) {
        if (res.confirm) {
          that.unbindSkuer(skuerId);
        }
      }
    });
  },

  unbindSkuer: function (skuerId) {
    var that = this;
    request({
      url: APIS.EXPRESSER_UNBIND_SKUER,
      data: {
        sid: wx.getStorageSync('sid'),
        skuerId: skuerId
      },
      method: 'POST',
      realSuccess: function (data) {
        var list = that.data.skuerList;
        for (var i = 0, j = list.length; i < j; i++) {
          if (list[i].skuerId == skuerId) {
            list.splice(i, 1);
            break;
          }
        }
        that.setData({
          skuerList: list
        });
        wx.hideLoading();
      },
      loginCallback: this.unbindSkuer,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})