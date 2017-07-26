// pages/courierCenter/courierCenter.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    footer: {
      centerSelectedCls: 'footer-item-selected'
    },
    avatar: '',
    name: '',
    isAuthorized: true,
    company: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    user.login(this.getMyInfo, this, true);
  },

  getMyInfo: function () {
    var that = this;
    request({
      url: APIS.GET_EXPRESSER_AUTHORIZED_INFO,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        var userInfo = wx.getStorageSync('userInfo');
        that.setData({
          avatar: userInfo.avatarUrl,
          name: data.name || userInfo.nickName,
          isAuthorized: data.isAuthorized,
          phone: data.phone,
          company: data.company || ''
        });
        wx.hideLoading();
      },
      loginCallback: this.getMyInfo,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onTapChangeRole: function () {
    wx.showModal({
      title: '切换角色',
      content: '请确认是否需要切换角色？',
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync('roleType', '');
          wx.redirectTo({
            url: '../entry/entry'
          })
        }
      }
    });
  },

  onTapCourierAuth: function () {
    wx.navigateTo({
      url: '../courierAuth/courierAuth'
    });
  },

  onToCourierSkuer: function () {
    wx.navigateTo({
      url: '../courierSkuer/courierSkuer',
    })
  },

  onToCourierFollow: function () {
    wx.navigateTo({
      url: '../courierFollow/courierFollow',
    })
  },

  onToCourierStat: function () {
    wx.navigateTo({
      url: '../courierStat/courierStat',
    })
  },

  onToCourierHelp: function () {
    wx.navigateTo({
      url: '../qa/qa',
    })
  }
})