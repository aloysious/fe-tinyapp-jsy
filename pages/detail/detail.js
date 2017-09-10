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

    fobiddenMaskAnim: {},
    fobiddenMaskDisplay: 'none',
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    user.login(function() {
      if (this.data.isFirstLoad) {
        userLog(0, this.data.rid);
        this.setData({
          isFirstLoad: false
        });
      }
      this.getRequirementDetail();
      this.getCommentList();
    }, this, true);

    this.createAnim();
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

        if (data.baseInfo.relatedRole != '0' && data.baseInfo.relatedRole != '1') {
          that.onOpenFobidden();
          return;
        }

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

  onTapContact: function(e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  onToResponse: function() {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.productName || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../skuerResponse/skuerResponse?rid=' + rid + '&title=' + title + '&status=' + status
    });
  },

  onToEntry: function() {
    wx.navigateTo({
      url: '../entry/entry'
    });
  },

  onShareAppMessage: function (res) {

    var relatedRole = this.data.baseInfo.relatedRole;
    var status = this.data.baseInfo.status;
    var productType = this.data.baseInfo.productType;
    var title = '';

    // 未响应
    if (status == 0) {
      if (relatedRole == -1) {
        title = '我在1+N订货小程序看到一个挺有意思的' + productType + '类采购需求！'
      } else if (relatedRole == 0) {
        title = '我在1+N订货小程序发布了一个新的' + productType + '类采购需求，求围观！'
      }
    // 其他状态
    } else {
      if (relatedRole == -1) {
        title = '我在1+N订货小程序看到一个挺有意思的' + productType + '类采购需求！'
      } else if (relatedRole == 0) {
        title = '我在1+N订货小程序发布了一个' + productType + '类采购需求！'
      } else {
        title = '我在1+N订货小程序响应了一个' + productType + '类采购需求！'
      }
    }

    return {
      title: title,
      //path: '/page/user?id=123',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onToChangeStatus: function() {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.productName || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../statusChange/statusChange?rid=' + rid + '&title=' + title + '&status=' + status,
    })
  },

  onAlertClose: function() {
    this.setData({
      "baseInfo.alertType": null
    });
  },

  onRemoveRequirement: function() {
    var that = this;
    wx.showModal({
      title: '删除订单',
      content: '订单需求删除后将无法恢复，请确认是否删除？',
      success: function (res) {
        if (res.confirm) {
          that.removeRequirement();
        }
      }
    });
  },

  removeRequirement: function() {
    var that = this;
    var rid = this.data.rid;
    wx.showLoading({
      title: '订单删除中，请稍候！'
    });
    request({
      url: APIS.REMOVE_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.hideLoading();
        wx.navigateBack();
      },
      loginCallback: this.removeRequirement,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onNavToAddress: function(e) {
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
    this.fobiddenMaskAnim = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    });
  },

  onOpenFobidden: function () {
    var that = this;
    this.setData({
      fobiddenMaskDisplay: 'block'
    });
    this.fobiddenMaskAnim.opacity(1).step();
    this.setData({
      fobiddenMaskAnim: this.fobiddenMaskAnim.export()
    });
  },
})