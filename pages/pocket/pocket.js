// pages/pocket/pocket.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   * 
   * asas大
   */
  data: {
    statTime: '',
    pocketList: [],
    moneyLeft: 0,
    profitList: [], 
    filterMaskAnim: {},
    filterMaskDisplay: 'none',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createAnim();
    this.getCurrentDate();
    user.login(this.getPocketInfo, this, true);
  },

  getCurrentDate: function () {
    var d = util.formatMonth(new Date());
    this.setData({
      statTime: d
    });
  },

  getPocketInfo: function() {
    this.getMyPocketList();
    this.getMyProfitListByMonth();
  },

  getMyPocketList: function() {
    var that = this;
    request({
      url: APIS.GET_MY_POCKET_LIST,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          pocketList: data.pocketList
        });
        for(var i = 0, j = data.pocketList.length; i < j; i++) {
          if (data.pocketList[i].pocketType == '现金') {
            that.setData({
              moneyLeft: data.pocketList[i].leftAmount
            });
            break;
          }
        }
        wx.hideLoading();
      },
      loginCallback: this.getMyPocketList,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  getMyProfitListByMonth: function() {
    var timeArr = this.data.statTime.split('-');
    var year = +timeArr[0];
    var month = +timeArr[1];
    var that = this;
    request({
      url: APIS.GET_MY_PROFIT_LIST_BY_MONTH,
      data: {
        sid: wx.getStorageSync('sid'),
        year: year,
        month: month
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          profitList: data.profitList
        });
        wx.hideLoading();
      },
      loginCallback: this.getMyProfitListByMonth,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },  

  onChangeStatTime: function (e) {
    var d = e.detail.value;
    this.setData({
      statTime: d
    });
  },

  createAnim: function () {
    var that = this;
    this.filterMaskAnim = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    });
  },

  onOpenAmountMore: function () {
    var that = this;
    this.setData({
      filterMaskDisplay: 'block'
    });
    this.filterMaskAnim.opacity(1).step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export()
    });

    setTimeout(function () {
      that.setData({
        filterOpenCls: 'filter-panel-open',
        isFilterOpen: true,
        filterMoreToggle: 'onCloseAmountMore'
      });
    }, 400);
  },

  onCloseAmountMore: function () {
    var that = this;
    this.filterMaskAnim.opacity(0).step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export()
    });
    this.setData({
      filterOpenCls: ''
    });
    setTimeout(function () {
      that.setData({
        filterMaskDisplay: 'none',
        isFilterOpen: false,
        filterMoreToggle: 'onOpenAmountMore'
      });
    }, 400);
  },

  onGetCash: function() {
    wx.showToast({
      title: '功能开发中...',
    })
  }
})