// pages/skuerBind/skuerBind.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    skuerId: '',
    avatar: '',
    name: '',
    company: '',
    contact: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      skuerId: options.skuerId
    });
    user.login(this.getSkuerInfo, this, true);
  },

  getSkuerInfo: function() {
    var that = this;
    request({
      url: APIS.GET_SKUER_INFO_BY_ID,
      data: {
        skuerId: this.data.skuerId
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          avatar: data.skuAvatar,
          name: data.skuName,
          company: data.skuCompany,
          contact: data.skuPhone
        });
        wx.hideLoading();
      },
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  onSelectRole: function(e) {
    var roleType = e.currentTarget.dataset.type;
    var url = '';
    if (roleType == '0') {
      url = APIS.BUYER_BIND_SKUER;
    } else {
      url = APIS.EXPRESSER_BIND_SKUER;
    }

    var that = this;
    request({
      url: url,
      data: {
        sid: wx.getStorageSync('sid'),
        skuerId: this.data.skuerId
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.showToast({
          title: '关联成功！'
        });
        setTimeout(function () {
          that.changeRole(roleType, 0);
        }, 1000);
      },
      loginCallback: function() {
        that.onSelectRole(e);
      },
      realFail: function (msg, code) {
        // 已经关联过sku经理
        if (code == '0019') {
          wx.showToast({
            title: '您已经关联了供应商，请先取消关联！'
          });
          setTimeout(function() {
            that.changeRole(roleType, 1);
          }, 1000);
        } else {
          wx.showToast({
            title: msg
          });
        }
      }
    }, true);
  },

  changeRole: function(roleType, pageType) {
    var that = this;
    request({
      url: APIS.CHANGE_IDENTITY,
      data: {
        sid: wx.getStorageSync('sid'),
        identityType: roleType
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.setStorageSync('roleType', roleType);
        wx.hideLoading();
        if (roleType == '0' && pageType == 0) {
          wx.redirectTo({
            url: '../buyerList/buyerList'
          });
        } else if (roleType == '0' && pageType == 1) {
          wx.redirectTo({
            url: '../buyerSkuer/buyerSkuer'
          });
        } else if (roleType == '2' && pageType == 0) {
          wx.redirectTo({
            url: '../courierList/courierList'
          });
        } else {
          wx.redirectTo({
            url: '../courierSkuer/courierSkuer'
          });
        }
      },
      loginCallback: function() {
        that.changeRole(roleType, pageType);
      },
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  }
})