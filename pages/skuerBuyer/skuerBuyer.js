// pages/skuerBuyer/skuerBuyer.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyerList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyBuyerInfo();
  },

  getMyBuyerInfo: function() {
    var that = this;
    request({
      url: APIS.GET_MY_BUYER_LIST,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          buyerList: data.list,
          hasMore: false
        });
        wx.hideLoading();
      },
      loginCallback: this.getMyBuyerInfo,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onUnbindBuyer: function (e) {
    var buyerId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '取消关联',
      content: '是否确认删除与采购客户的关联？',
      success: function (res) {
        if (res.confirm) {
          that.unbindBuyer(buyerId);
        }
      }
    });
  },

  unbindBuyer: function (buyerId) {
    var that = this;
    request({
      url: APIS.UNBIND_BUYER,
      data: {
        sid: wx.getStorageSync('sid'),
        buyerId: buyerId
      },
      method: 'POST',
      realSuccess: function (data) {
        var list = that.data.buyerList;
        for(var i = 0, j = list.length; i < j; i++) {
          if (list[i].buyerId == buyerId) {
            list.splice(i, 1);
            break;
          }
        }
        that.setData({
          buyerList: list
        });
        wx.hideLoading();
      },
      loginCallback: this.unbindBuyer,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})