// pages/skuerExpresser/skuerExpresser.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    expresserList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyExpresserInfo();
  },

  getMyExpresserInfo: function () {
    var that = this;
    request({
      url: APIS.GET_MY_EXPRESSER_LIST,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          expresserList: data.list,
          hasMore: false
        });
        wx.hideLoading();
      },
      loginCallback: this.getMyExpresserInfo,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onUnbindExpresser: function (e) {
    var expresserId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '取消关联',
      content: '是否确认删除与配送人员的关联？',
      success: function (res) {
        if (res.confirm) {
          that.unbindExpresser(expresserId);
        }
      }
    });
  },

  unbindExpresser: function (expresserId) {
    var that = this;
    request({
      url: APIS.UNBIND_EXPRESSER,
      data: {
        sid: wx.getStorageSync('sid'),
        expresserId: expresserId
      },
      method: 'POST',
      realSuccess: function (data) {
        var list = that.data.expresserList;
        for (var i = 0, j = list.length; i < j; i++) {
          if (list[i].expresserId == expresserId) {
            list.splice(i, 1);
            break;
          }
        }
        that.setData({
          expresserList: list
        });
        wx.hideLoading();
      },
      loginCallback: this.unbindExpresser,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})