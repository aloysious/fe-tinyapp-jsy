// pages/entry/entry.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidePage: true,
    imgUrls: [
      '../../images/pic_logo1_bg.png',
      '../../images/pic_logo2_bg.png',
      '../../images/pic_logo3_bg.png'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.roleType = wx.getStorageSync('roleType');
    if (this.roleType === '') {
      this.renderUI();
    } else {
      if (this.roleType == '0') {
        wx.redirectTo({
          url: '../buyerList/buyerList'
        });
      } else {
        wx.redirectTo({
          url: '../skuerList/skuerList'
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  renderUI: function() {
    this.setData({
      isHidePage: false
    });
  },

  onSelectRole: function(e) {
    this.roleType = e.currentTarget.dataset.type;
    wx.showLoading({
      title: '数据加载中...'
    });
    user.login(this.changeRole, this, true);
  },

  changeRole: function() {
    var that = this;
    request({
      url: APIS.CHANGE_IDENTITY,
      data: {
        sid: wx.getStorageSync('sid'),
        identityType: this.roleType
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.setStorageSync('roleType', that.roleType);
        wx.hideLoading();
        if (that.roleType == '0') {
          wx.redirectTo({
            url: '../buyerList/buyerList'
          });
        } else {
          wx.redirectTo({
            url: '../skuerList/skuerList'
          });
        }
      },
      loginCallback: this.changeRole,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onTapSlider: function(e) {
    var index = +e.target.dataset.index;
    if (index == 1) {

    } else if (index == 2) {
      wx.navigateTo({
        url: '../productList/productList'
      })
    }
  }
})