// pages/buyerAuth/buyerAuth.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
var { validate } = require('../../libs/validate');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    company: '',
    phone: '',
    code: '',
    codeText: '获取验证码',
    isCodeDisabled: false,
    filterMaskAnim: {},
    filterPanelAnim: {},
    filterMaskDisplay: 'none',
    allProductType: [],
    selectedProductType: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createAnim();
    user.login(this.getMyInfo, this, true);
  },

  getMyInfo: function () {
    var that = this;
    request({
      url: APIS.GET_SKUER_AUTHORIZED_INFO,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        if (data.isAuthorized) {
          that.setData({
            name: data.name,
            company: data.company,
            phone: data.phone,
            selectedProductType: data.relatedProductType
          });
        }
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

  onInputName: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  onInputCompany: function (e) {
    this.setData({
      company: e.detail.value
    });
  },

  onInputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onInputCode: function (e) {
    this.setData({
      code: e.detail.value
    });
  },

  onSendSms: function () {
    var that = this;
    var phone = util.trim(this.data.phone);
    if (!validate.phone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码'
      });
      return;
    }

    request({
      url: APIS.SEND_SMS,
      data: {
        phone: phone
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          isCodeDisabled: true
        });
        that.startGetCodeTimer();
      },
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  startGetCodeTimer: function () {
    var tick = 60;
    var that = this;
    this.timer = setInterval(function () {
      that.setData({
        codeText: '已发送(' + tick + '秒)'
      });
      tick--;
      if (tick < 0) {
        clearInterval(that.timer);
        that.setData({
          codeText: '获取验证码',
          isCodeDisabled: false
        });
      }
    }, 1000);
  },

  onSaveAuthorized: function () {
    var name = util.trim(this.data.name);
    var company = util.trim(this.data.company);
    var phone = util.trim(this.data.phone);
    var code = util.trim(this.data.code);
    var selectedProductType = this.data.selectedProductType;

    if (name == '') {
      wx.showToast({
        title: '姓名不能为空'
      });
      return;
    }
    if (selectedProductType.length == 0) {
      wx.showToast({
        title: '关注品类不能为空'
      });
      return;
    }
    if (company == '') {
      wx.showToast({
        title: '公司名称不能为空'
      });
      return;
    }
    if (!validate.phone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码'
      });
      return;
    }
    if (code == '') {
      wx.showToast({
        title: '验证码不能为空'
      });
      return;
    }

    wx.showLoading({
      title: '提交数据中...',
      mask: true
    });
    request({
      url: APIS.ADD_SKUER_AUTHORIZED,
      data: {
        sid: wx.getStorageSync('sid'),
        name: name,
        phone: phone,
        verificationCode: code,
        company: company,
        relatedProductTypeId: this.getSelectedIds()
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.hideLoading();
        wx.navigateBack();
      },
      loginCallback: this.onSaveAuthorized,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
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

  onOpenProductType: function() {
    this.setData({
      filterMaskDisplay: 'block'
    });
    this.filterMaskAnim.opacity(0.5).step();
    this.filterPanelAnim.right(0).step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export(),
      filterPanelAnim: this.filterPanelAnim.export()
    });

    if (this.data.allProductType.length == 0) {
      this.getAllProductType();
    }
  },

  onCloseFilterPanel: function() {
    var that = this;
    this.filterMaskAnim.opacity(0).step();
    this.filterPanelAnim.right('-80%').step();
    this.setData({
      filterMaskAnim: this.filterMaskAnim.export(),
      filterPanelAnim: this.filterPanelAnim.export()
    });
    setTimeout(function () {
      that.setData({
        filterMaskDisplay: 'none'
      });
    }, 400);
  },

  getAllProductType: function() {
    var that = this;
    request({
      url: APIS.GET_ALL_PRODUCT_TYPE_LIST,
      method: 'POST',
      realSuccess: function(data) {
        that.renderAllTypeList(data.list);
      },
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  renderAllTypeList: function(list) {
    var selectedIds = this.getSelectedIds();
    list = list.map(function(item) {
      if (util.inArray(item.id, selectedIds)) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
      return item;
    });
    this.setData({
      allProductType: list
    });
  },

  getSelectedIds: function() {
    var selectedIds = [];
    this.data.selectedProductType.forEach(function(v, i) {
      selectedIds.push(v.id);
    });
    return selectedIds;
  },

  onSelectType: function(e) {
    var id = e.target.dataset.id;
    var selectedList = [];
    var list = this.data.allProductType.map(function(item) {
      if (item.id == id) {
        item.isSelected = true;
      }
      if (item.isSelected) {
        selectedList.push(item);
      }
      return item;
    });
    this.setData({
      allProductType: list,
      selectedProductType: selectedList
    });
  },

  onUnselectType: function(e) {
    var id = e.target.dataset.id;
    var selectedList = [];
    var list = this.data.allProductType.map(function (item) {
      if (item.id == id) {
        item.isSelected = false;
      }
      if (item.isSelected) {
        selectedList.push(item);
      }
      return item;
    });
    this.setData({
      allProductType: list,
      selectedProductType: selectedList
    });
  }
})