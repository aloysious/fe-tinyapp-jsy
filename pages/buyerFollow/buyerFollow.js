// pages/buyerList/buyerFollow.js
var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    footer: {
      listSelectedCls: 'footer-item-selected'
    },
    listPaddingBottom: 0,
    filterOpenCls: '',
    isFilterOpen: false,
    filterMoreToggle: 'onOpenFilterMore',
    statusList: [],
    statusIndex: 0,
    filterMaskAnim: {},
    filterPanelAnim: {},
    filterMaskDisplay: 'none',
    publishTimeStart: '2017-01-01',
    publishTimeEnd: '',
    typeList: [],
    typeIndex: 0,
    isOnlyFollow: true,
    list: [
      /*
      {
        publishTime: '2017-05-31',        // 发布时间
        productType: '纸品',               // 所属一级品类名称
        status: 1,                        // 需求状态，0为待响应，1为需求确认中，2为订单确认中，3为订单进行中，4为物流配送中，5为结款中，6为已完结，7为已终止
        skuerName: '张三',                 // sku经理名字
        skuerCompany: 'xx公司',            // sku经理所属公司
        skuerContact: 18697909687,        // sku经理联系方式
        skuerAvatar: 'http://xxx.png',    // sku经理的头像，v1.1
        title: '需求标题',                 // sku经理维护，没有就传空，v1.1
        description: '需求描述',
        amount: 1000,                     // 采购数量，sku经理维护，没有就传空，v1.1
        isFollow: true,                   // 是否关注了需求
        hasNewComment: true               // 是否有新的未读留言。判断逻辑：需要增加当前用户访问需求的最近时间记录表，取这个时间和需求最新的一次留言时间作比较，从而判断是否有新的未读留言。v1.1
      }, {
        publishTime: '2017-05-31',        // 发布时间
        productType: '纸品',               // 所属一级品类名称
        status: 1,                        // 需求状态，0为待响应，1为需求确认中，2为订单确认中，3为订单进行中，4为物流配送中，5为结款中，6为已完结，7为已终止
        skuerName: '张三',                 // sku经理名字
        skuerCompany: 'xx公司',            // sku经理所属公司
        skuerContact: 18697909687,        // sku经理联系方式
        skuerAvatar: 'http://xxx.png',    // sku经理的头像，v1.1
        title: '需求标题',                 // sku经理维护，没有就传空，v1.1
        description: '需求描述',
        amount: 1000,                     // 采购数量，sku经理维护，没有就传空，v1.1
        isFollow: true,                   // 是否关注了需求
        hasNewComment: true               // 是否有新的未读留言。判断逻辑：需要增加当前用户访问需求的最近时间记录表，取这个时间和需求最新的一次留言时间作比较，从而判断是否有新的未读留言。v1.1
      }
      */
    ],
    pageNum: 1,
    pageSize: 20,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createAnim();
    this.getCurrentDate();
    this.loading = false;

    // 处理兼容性
    var sysInfo = wx.getSystemInfoSync();
    if (sysInfo.system.toUpperCase().indexOf('IOS') != -1) {
      this.setData({
        listPaddingBottom: 80
      });
    } 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      statusList: statusList
    });
    this.initRequirementList();
  },

  getBuyerRequirementList: function () {
    var that = this;
    var data = this.data;
    if (this.loading) {
      return;
    }

    this.loading = true;

    request({
      url: APIS.GET_BUYER_REQUIREMENT_LIST,
      data: {
        sid: wx.getStorageSync('sid'),
        status: data.statusList[data.statusIndex].statusId,
        publishTimeStart: data.publishTimeStart,
        publishTimeEnd: data.publishTimeEnd,
        isOnlyFollow: data.isOnlyFollow,
        productTypeId: data.typeList[data.typeIndex] ? data.typeList[data.typeIndex].id : '',
        pageNum: data.pageNum,
        pageSize: data.pageSize
      },
      method: 'POST',
      realSuccess: function (data) {
        var list = that.data.list || [];
        if (data.list && data.list.length > 0) {
          list = list.concat(data.list);
        }
        list = list.map(function (item) {
          item.statusText = statusListSimple[item.status + ''].text;
          item.statusColor = statusListSimple[item.status + ''].color;
          item.skuerAvatar = item.skuerAvatar || 'http://bys2b-1253427581.cossh.myqcloud.com/ic_needs_shop.png';
          item.title = item.title || item.description;
          return item;
        });
        that.setData({
          list: list,
          pageNum: that.data.pageNum + 1,
          hasMore: data.hasMore
        });
        wx.hideLoading();
        that.loading = false;

        if (that.data.typeList.length == 0) {
          that.getAllProductType();
        }
      },
      loginCallback: function () {
        that.loading = false;
        that.getBuyerRequirementList();
      },
      realFail: function (msg) {
        //wx.hideLoading();
        that.loading = false;
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  initRequirementList: function () {
    this.setData({
      list: [],
      pageNum: 1,
      pageSize: 20,
      statusIndex: 0,
      typeIndex: 0,
      isOnlyFollow: true,
      publishTimeStart: '2017-01-01',
      hasMore: true
    });
    this.getCurrentDate();
    this.getBuyerRequirementList();
  },

  onChangeStatus: function (e) {
    var index = +e.detail.value;
    this.setData({
      statusIndex: index
    });
  },

  onChangeType: function (e) {
    var index = +e.detail.value;
    this.setData({
      typeIndex: index
    });
    if (!this.data.isFilterOpen) {
      this.setData({
        list: [],
        pageNum: 1,
        pageSize: 20,
        hasMore: true
      });
      this.getBuyerRequirementList();
    }
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

  onOpenFilterMore: function () {
    var that = this;
    this.setData({
      filterMaskDisplay: 'block'
    });
    this.filterMaskAnim.opacity(0.5).step();
    this.filterPanelAnim.top('85rpx').step();
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
  },

  getAllProductType: function () {
    var that = this;
    request({
      url: APIS.GET_ALL_PRODUCT_TYPE_LIST,
      method: 'POST',
      realSuccess: function (data) {
        var list = data.list;
        list.unshift({
          id: '',
          name: '全部'
        });
        that.setData({
          typeList: list
        });
      },
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  onCloseFilterPanel: function () {
    var that = this;
    this.filterMaskAnim.opacity(0).step();
    this.filterPanelAnim.top('-336rpx').step();
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

  getCurrentDate: function () {
    var d = util.formatDate(new Date());
    this.setData({
      publishTimeEnd: d
    });
  },

  onChangeStartTime: function (e) {
    var d = e.detail.value;
    this.setData({
      publishTimeStart: d
    });
  },

  onChangeEndTime: function (e) {
    var d = e.detail.value;
    this.setData({
      publishTimeEnd: d
    });
  },

  /*
  onToggleFilterFollow: function () {
    this.setData({
      isOnlyFollow: !this.data.isOnlyFollow
    });
  },
  */

  onConfirmFilter: function () {
    this.setData({
      list: [],
      pageNum: 1,
      pageSize: 20,
      hasMore: true
    });
    this.getBuyerRequirementList();
    this.onCloseFilterPanel();
  },

  onFollow: function (e) {
    this.toggleFollow(e, '1');
  },

  onUnfollow: function (e) {
    this.toggleFollow(e, '0');
  },

  toggleFollow: function (e, type) {
    var that = this;
    var rid = e.currentTarget.dataset.rid;
    request({
      url: APIS.TOGGLE_FOLLOW,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
        type: type
      },
      method: 'POST',
      realSuccess: function (data) {
        var list = that.data.list;
        list.forEach(function (item, i) {
          if (item.rid == rid) {
            item.isFollow = type == '1' ? true : false;
          }
        });
        that.setData({
          list: list
        });
      },
      loginCallback: this.onFollow,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onGetMore: function () {
    if (!this.data.hasMore) {
      return;
    }
    this.getBuyerRequirementList();
  },

  onToDetail: function (e) {
    var rid = e.currentTarget.dataset.rid;
    wx.navigateTo({
      url: '../detail/detail?rid=' + rid,
    })
  }
})