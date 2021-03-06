var wxCharts = require('../../libs/wx-charts/wxcharts.js');
var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({
  data: {
    totalCount: 0,
    averageTime: 0,
    partnerList: [],
    defaultAvatar: 'http://bys2b-1253427581.cossh.myqcloud.com/ic_needs_shop.png'
  },

  onLoad: function (e) {
    this.windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      this.windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    this.getRequirementCountData();
    this.getResponseTimeData();
    this.getTopPartner();
  },

  getRequirementCountData: function() {
    var that = this;
    request({
      url: APIS.GET_REQUIREMENT_COUNT_DATA,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        if (data.totalCount == 0) {
          wx.hideLoading();
          return;
        }

        that.setData({
          totalCount: data.totalCount
        });

        var dl = [];
        data.dataList.forEach(function(v, i) {
          v.format = function(d) {
            return v.data + '次，' + 100 * d + '%';
          };
          if (v.data != 0) {
            dl.push(v);
          }
        });
        that.renderPie('requirementCanvas', dl);
        wx.hideLoading();
      },
      loginCallback: this.getRequirementCountData,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  getResponseTimeData: function () {
    var that = this;
    request({
      url: APIS.GET_RESPONSE_TIME_DATA,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        if (data.averageTime == 0) {
          wx.hideLoading();
          return;
        }

        that.setData({
          averageTime: Math.round(data.averageTime / 60)
        });

        var dl = [];
        data.dataList.forEach(function (v, i) {
          v.format = function (d) {
            return v.data + '次，' + 100 * d + '%';
          };
          if (v.data != 0) {
            dl.push(v);
          }
        });
        that.renderPie('timeCanvas', dl);
        wx.hideLoading();
      },
      loginCallback: this.getResponseTimeData,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  renderPie: function(cid, dl) {
   var  chart = new wxCharts({
      animation: true,
      canvasId: cid,
      type: 'pie',
      series: dl,
      width: this.windowWidth - 30,
      height: 300,
      dataLabel: true
    });
  },

  getTopPartner: function() {
    var that = this;
    request({
      url: APIS.GET_TOP_PARTNER,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        if (data.list.length == 0) {
          wx.hideLoading();
          return;
        }

        that.setData({
          partnerList: data.list
        });

        wx.hideLoading();
      },
      loginCallback: this.getTopPartner,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onDialPhone: function(e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
});