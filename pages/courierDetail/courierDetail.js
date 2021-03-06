// pages/buyerDetail/buyerDetail.js
var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { userLog } = require('../../libs/log');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusList: statusList,
    rid: '',
    roleType: -1,
    uncoverCls: '',
    baseInfo: {},
    extInfo: {},
    commentList: [],
    commentCount: 0,
    commentHasMore: true,
    isFirstLoad: true,
    progressBarWidth: 0,
    scrollLeft: 0,

    filterMaskAnim: {},
    filterPanelAnim: {},
    filterMaskDisplay: 'none',

    qrcode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var rid = options.rid;
    this.setData({
      rid: rid,
      roleType: wx.getStorageSync('roleType') || -1
    });
    //userLog(0, this.data.rid);
    this.createAnim();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    user.login(function () {
      if (this.data.isFirstLoad) {
        userLog(0, this.data.rid);
        this.setData({
          isFirstLoad: false
        });
      }
      this.getRequirementDetail();
      //this.getCommentList();
    }, this, true);
  },

  getRequirementDetail: function () {
    var that = this;
    request({
      url: APIS.GET_REQUIREMENT_DETAIL,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          baseInfo: data.baseInfo,
          extInfo: data.extInfo
        });
        that.setData({
          'baseInfo.statusText': statusListSimple[data.baseInfo.status + ''].text,
          'baseInfo.statusColor': statusListSimple[data.baseInfo.status + ''].color,
          progressBarWidth: +data.baseInfo.status * 150,
          scrollLeft: data.baseInfo.status >= '4' ? 1000 : 0
          //'baseInfo.relatedRole': -1,
          //roleType: 0
          //'baseInfo.status': 6
        });
        wx.hideLoading();
      },
      loginCallback: this.getRequirementDetail,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  getCommentList: function () {
    var that = this;
    request({
      url: APIS.GET_COMMENT_LIST,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid,
        pageNum: 1,
        pageSize: 9999
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          commentList: data.list,
          commentCount: data.totalCount,
          commentHasMore: data.hasMore
        });
        wx.hideLoading();
      },
      loginCallback: this.getCommentList,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onOpenDesc: function () {
    this.setData({
      uncoverCls: 'bd-desc-detail-uncover'
    });
  },

  onToComment: function () {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.productName || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../commentAdd/commentAdd?rid=' + rid + '&title=' + title + '&status=' + status,
    })
  },

  onPreviewComment: function (e) {
    var commentIndex = +e.target.dataset.index;
    var picUrl = e.target.dataset.url;

    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.commentList[commentIndex].pictures
    });
  },

  onToggleFollow: function () {
    var that = this;
    var rid = this.data.rid;
    request({
      url: APIS.TOGGLE_FOLLOW,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
        type: this.data.baseInfo.isFollow ? 0 : 1
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          "baseInfo.isFollow": !that.data.baseInfo.isFollow
        });
      },
      loginCallback: this.onToggleFollow,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onTapContact: function (e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  onNavToAddress: function (e) {
    var latitude = e.currentTarget.dataset.latitude;
    var longitude = e.currentTarget.dataset.longitude;
    wx.openLocation({
      latitude: +latitude,
      longitude: +longitude,
      scale: 28, // 缩放比例
      name: '收货地址',
      address: this.data.baseInfo.deliveryInfo.address || '', // 位置名
    })
  },

  createAnim: function () {
    var that = this;
    this.filterMaskAnim = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    });
    this.filterPanelAnim = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    })
  },

  onOpenPanel: function () {
    var that = this;
    this.setData({
      filterMaskDisplay: 'block'
    });
    this.filterMaskAnim.opacity(0.5).step();
    this.filterPanelAnim.top('-2rpx').step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export(),
      filterPanelAnim: this.filterPanelAnim.export()
    });

    setTimeout(function () {
      that.setData({
        filterOpenCls: 'filter-panel-open',
        isFilterOpen: true,
        filterMoreToggle: 'onCloseFilterPanel'
      });
    }, 400);

    if (!this.data.qrcode) {
      this.getQrcode();
    }
  },

  getQrcode: function () {
    var that = this;
    request({
      url: APIS.GET_REQUIREMENT_QRCODE,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          qrcode: data.qrCodeUrl
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

  onClosePanel: function () {
    var that = this;
    this.filterMaskAnim.opacity(0).step();
    this.filterPanelAnim.top('-900rpx').step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export(),
      filterPanelAnim: this.filterPanelAnim.export()
    });
    this.setData({
      filterOpenCls: ''
    });
    setTimeout(function () {
      that.setData({
        filterMaskDisplay: 'none',
        isFilterOpen: false,
        filterMoreToggle: 'onOpenFilterMore'
      });
    }, 400);
  },

  onShareAppMessage: function (res) {
    return {
      title: '请确认货物清单无误后，点击核销订单！',
      path: '/pages/consumerConfirm/consumerConfirm?rid=' + this.data.rid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})