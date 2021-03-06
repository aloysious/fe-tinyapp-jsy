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
    /*
    baseInfo: {         // 任意状态下的需求都应该返回的固定字段
      publishTime: '2017-05-08',        // 需求发布时间
      responseTime: '2017-05-09',       // 需求的抢单时间
      status: 1,                        // 需求状态，0为待响应，1为需求确认中，2为订单确认中，3为订单进行中，4为物流配送中，5为结款中，6为已完结，7为已终止
      alertType: 0,                     // 到期提醒，-1为无提醒，0为交货时间临近（少于3天提醒），1为结款时间临近（少于3天提醒）
      description: {
        content: '这里是文字描述',         // 需求描述文字
        pictures: [                   // 需求描述图片，最多为5张
          'http://xx.png',
          'http://yy.png'
				]
      },
      productType: '纸品',               // 所属一级品类名称
      isFollow: true,                   // 当前用户是否已经关注
      relatedRole: 0                    // 当前用户与对应需求的关联角色，-1为游客，0为发布该需求的采购人员，1为接受该需求的sku经理
    },
    extInfo: {          // 只有特定状态下才会维护进来的字段，没有时可以为空或不传
      title: '需求标题',                  // 需求标题，由sku经理维护
      buyerName: '张三',                 // 发布需求的采购人员名字
      buyerCompany: 'xxx公司',           // 采购人员公司名称
      buyerContact: '18697909687',      // 采购人员联系方式
      skuerName: '李四',                 // 接受需求的sku经理名字
      skuerCompany: 'yyy公司',           // sku经理的公司名称
      skuerContact: '18697909687',      // sku经理联系方式
      productName: '产品名称',           // 产品名称
      amount: 10000,                    // 采购数量
      totalPrice: 5000,                 // 采购订单总价
      deliveryDeadline: '2017-05-08',   // 交货时间节点
      paymentDeadline: '2017-05-10'     // 结款时间节点
    }
    */
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

  onPreviewDesc: function (e) {
    var picUrl = e.target.dataset.url;

    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.baseInfo.description.pictures
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

  onToResponse: function () {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.productName || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../skuerResponse/skuerResponse?rid=' + rid + '&title=' + title + '&status=' + status
    });
  },

  onToEntry: function () {
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
        title = '我在闪采看到一个挺有意思的' + productType + '类采购需求！'
      } else if (relatedRole == 0) {
        title = '我在闪采发布了一个新的' + productType + '类采购需求，求围观！'
      }
      // 其他状态
    } else {
      if (relatedRole == -1) {
        title = '我在闪采看到一个挺有意思的' + productType + '类采购需求！'
      } else if (relatedRole == 0) {
        title = '我在闪采发布了一个' + productType + '类采购需求！'
      } else {
        title = '我在闪采响应了一个' + productType + '类采购需求！'
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

  onToChangeStatus: function () {
    var d = this.data;
    var rid = d.rid;
    var title = d.extInfo.productName || '';
    var status = d.baseInfo.status;
    wx.navigateTo({
      url: '../statusChange/statusChange?rid=' + rid + '&title=' + title + '&status=' + status,
    })
  },

  onAlertClose: function () {
    this.setData({
      "baseInfo.alertType": null
    });
  },

  onRemoveRequirement: function () {
    var that = this;
    wx.showModal({
      title: '删除需求',
      content: '需求删除后将无法恢复，请确认是否删除？',
      success: function (res) {
        if (res.confirm) {
          that.removeRequirement();
        }
      }
    });
  },

  removeRequirement: function () {
    var that = this;
    var rid = this.data.rid;
    wx.showLoading({
      title: '需求删除中，请稍候！'
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

  onConfirmRequirement: function() {
    var that = this;
    wx.showModal({
      title: '确认核销',
      content: '请仔细确认货物清单和金额，是否确认核销？',
      success: function (res) {
        if (res.confirm) {
          that.confirmRequirement();
        }
      }
    });
  },

  confirmRequirement: function() {
    var that = this;
    wx.showLoading({
      title: '订单核销中，请稍等',
    })
    request({
      url: APIS.RECIEVE_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid
      },
      method: 'POST',
      realSuccess: function (data) {
        that.addComment();
      },
      loginCallback: this.confirmRequirement,
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  addComment: function () {
    var data = this.data;
    var that = this;
    request({
      url: APIS.ADD_COMMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: data.rid,
        content: '我确认收货，订单状态修改为“已核销”。',
        pictures: []
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.showToast({
          title: '恭喜，订单核销成功！',
        });
        setTimeout(function () {
          that.getRequirementDetail();
        }, 1000);
      },
      loginCallback: this.addComment,
      realFail: function (msg, errCode) {
        wx.hideLoading();
        wx.navigateBack();
      }
    }, true, this);
  },
})