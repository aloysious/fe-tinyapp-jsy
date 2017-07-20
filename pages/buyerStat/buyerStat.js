var wxCharts = require('../../libs/wx-charts/wxcharts.js');
var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({
  data: {
    filterList: [
      {
        id: 0,
        name: '按一级品类'
      },{
        id: 1,
        name: '按需求状态'
      }
    ],
    filterIndex: 0,
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

  onChangeFilter: function (e) {
    var index = +e.detail.value;
    this.setData({
      filterIndex: index
    });
    this.getRequirementCountData();
  },

  getRequirementCountData: function() {
    var that = this;
    request({
      url: APIS.GET_REQUIREMENT_COUNT_DATA,
      data: {
        sid: wx.getStorageSync('sid'),
        type: this.data.filterIndex
      },
      method: 'POST',
      realSuccess: function (data) {
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