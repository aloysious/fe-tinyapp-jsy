// pages/buyerPublish/buyerPublish.js
var { statusList, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
var { validate } = require('../../libs/validate');
var { uploadPic } = require('../../libs/upload');
var Q = require('../../libs/q/q');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    selectedProducts: [],
    deliveryTime: '',
    deliveryInfo: {
      name: '',
      contact: '',
      addressBase: '',
      addressMore: '',
      latitude: 0,
      longitude: 0
    },
    moreInfo: '',
    totalTradePrice: 0,
    totalSalePrice: 0,

    isAuthorized: true,
    publisherName: '',
    publisherContact: '',
    willInputContact: false,
    isUseTpl: false,
    isShowAuth: true,

    filterMaskAnim: {},
    filterPanelAnim: {},
    filterMaskDisplay: 'none',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createAnim();
  },

  onShow: function() {
    this.getBuyerAuthorizedInfo();
  },

  getBuyerAuthorizedInfo: function() {
    var that = this;
    request({
      url: APIS.GET_BUYER_AUTHORIZED_INFO,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        that.setData({
          isAuthorized: data.isAuthorized,
          publisherName: data.name || '',
          publisherContact: data.phone || ''
        });
        wx.hideLoading();
      },
      loginCallback: this.getBuyerAuthorizedInfo,
      realFail: function (msg) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  getAllProductList: function () {
    var that = this;
    request({
      url: APIS.GET_ALL_PRODUCT_LIST,
      method: 'POST',
      data: {
        pageNum: 1,
        pageSize: 9999
      },
      realSuccess: function (data) {
        var list = data.list;
        list = list.map(function(p) {
          p.isSelected = false;
          return p;
        });
        that.setData({
          products: list
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

  onShowInputContact: function() {
    this.setData({
      willInputContact: true
    });
  },

  onGotoAuthorize: function() {
    wx.navigateTo({
      url: '../buyerAuth/buyerAuth',
    })
  },

  onInputDeliveryInfoName: function(e) {
    this.setData({
      'deliveryInfo.name': util.trim(e.detail.value)
    });
  },

  onInputDeliveryInfoContact: function(e) {
    this.setData({
      'deliveryInfo.contact': util.trim(e.detail.value)
    });
  },

  onInputDeliveryInfoAddressMore: function(e) {
    this.setData({
      'deliveryInfo.addressMore': util.trim(e.detail.value)
    });
  },

  onInputMoreInfo: function(e) {
    this.setData({
      moreInfo: util.trim(e.detail.value)
    });
  },

  onChangeDeliveryTime: function (e) {
    var d = e.detail.value;
    this.setData({
      deliveryTime: d
    });
  },

  onInputPublisherName: function(e) {
    this.setData({
      publisherName: util.trim(e.detail.value)
    });
  },

  onInputPublisherContact: function(e) {
    this.setData({
      publisherContact: util.trim(e.detail.value)
    });
  },

  onCancel: function() {
    wx.navigateBack();
  },

  onSubmit: function() {
    var that = this;
    var selectedProducts = [];
    this.data.products.forEach(function(p, i) {
      if (p.isSelected) {
        selectedProducts.push({
          productId: p.productId,
          productName: p.productName,
          count: p.count
        });
      }
    });
    this.setData({
      selectedProducts: selectedProducts
    });
    var errorTips = this.validateSubmit();
    if (errorTips) {
      wx.showToast({
        title: errorTips
      });
      return;
    }

    var contentArr = [];
    var content = '';
    this.data.selectedProducts.forEach(function(p, i) {
      contentArr.push(p.productName + ' x' + p.count);
    });
    content = contentArr.join('; ');
    if (this.data.moreInfo) {
      content += '\r\n' + this.data.moreInfo;
    }

    var data = this.data;
    data.deliveryInfo.address = data.deliveryInfo.addressBase + ' ' + data.deliveryInfo.addressMore

    wx.showLoading({
      mask: true,
      title: '数据提交中'
    });
    request({
      url: APIS.PUBLISH_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        description: content,
        products: data.selectedProducts,
        deliveryTime: data.deliveryTime,
        deliveryInfo: data.deliveryInfo,
        publisherName: data.publisherName,
        publisherContact: data.publisherContact
      },
      method: 'POST',
      realSuccess: function (data) {
        that.addFirstComment(data.rid);
      },
      loginCallback: that.onSubmit,
      realFail: function (msg, errCode) {
        wx.showToast({
          title: msg
        });
      }
    }, true, that);

  },

  addFirstComment: function(rid) {
    request({
      url: APIS.ADD_COMMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
        content: '成功发布了订单！',
        pictures: []
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.hideLoading();
        wx.navigateBack();
      },
      loginCallback: this.addFirstComment,
      realFail: function (msg, errCode) {
        wx.hideLoading();
        wx.navigateBack();
      }
    }, true);
  },

  validateSubmit: function() {
    var d = this.data;
    if (d.selectedProducts.length == 0) {
      return '请先选购要货商品'
    }
    if (!d.deliveryTime) {
      return '请选择期望到货时间'
    }
    if (!d.deliveryInfo.name) {
      return '收货人姓名不能为空'
    }
    if (!d.deliveryInfo.contact) {
      return '收货人联系方式不能为空'
    }
    if (!d.deliveryInfo.addressBase) {
      return '收货地址不能为空'
    }
    if (!validate.phone(d.deliveryInfo.contact)) {
      return '收货人手机号码输入格式不正确'
    }
    if (!d.publisherName) {
      return '您的姓名不能为空'
    }
    if (!validate.phone(d.publisherContact)) {
      return '您的手机号码输入格式不正确'
    }
    return '';
  },

  onCloseAuth: function() {
    this.setData({
      isShowAuth: false
    });
  },

  onSelectAddress: function() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          'deliveryInfo.addressBase': res.address,
          'deliveryInfo.latitude': res.latitude,
          'deliveryInfo.longitude': res.longitude
        });
      },
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

  onOpenProductList: function () {
    var that = this;
    this.setData({
      filterMaskDisplay: 'block'
    });
    this.filterMaskAnim.opacity(0.5).step();
    this.filterPanelAnim.right('0rpx').step();
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

    if (this.data.products.length == 0) {
      this.getAllProductList();
    }
  },

  onCloseProductList: function () {
    var that = this;
    this.filterMaskAnim.opacity(0).step();
    this.filterPanelAnim.right('-80%').step();
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

  onToggleProduct: function(e) {
    var id = e.target.dataset.id;
    var products = this.data.products;
    products.forEach(function(p, i) {
      if (p.productId == id) {
        if (p.isSelected) {
          p.count = 0;
        } else {
          p.count = 1;
        }
        p.isSelected = !p.isSelected;
      }
    });
    this.setData({
      products: products
    });
    this.calTotalPrice();
  },

  onChangeProductCount: function(e) {
    var v = e.detail.value;
    var id = e.target.dataset.id;

    if (isNaN(v)) {
      wx.showToast({
        title: '请输入数字！'
      });
      v = 1;
    } else if (+v < 1) {
      wx.showToast({
        title: '商品数量不能再少了！'
      });
      v = 1;
    } else if (+v >= 999) {
      wx.showToast({
        title: '一次采购商品不能超过999件！'
      });
      v = 999; 
    } else {
      v = Math.floor(+v);
    }

    var products = this.data.products;
    products.forEach(function (p, i) {
      if (p.productId == id) {
        p.count = v;
      }
    });
    this.setData({
      products: products
    });
    this.calTotalPrice();
  },

  onMinusProduct: function(e) {
    var that = this;
    var id = e.target.dataset.id;

    var products = this.data.products;
    products.forEach(function (p, i) {
      if (p.productId == id) {
       if (p.count == 1) {
         wx.showModal({
           title: '删除商品',
           content: '确认删除这个商品吗？',
           success: function (res) {
             if (res.confirm) {
               console.log('haha');
               p.isSelected = false;
               p.count = 0;
               that.setData({
                 products: products
               });
               that.calTotalPrice();
             }
           }
         });
       } else {
         p.count--;
         that.setData({
           products: products
         });
         that.calTotalPrice();
       }
      }
    });
  },

  onPlusProduct: function(e) {
    var that = this;
    var id = e.target.dataset.id;

    var products = this.data.products;
    products.forEach(function (p, i) {
      if (p.productId == id) {
        if (p.count >= 999) {
          wx.showToast({
            title: '一次采购商品不能超过999件！'
          });
        } else {
          p.count++;
          that.setData({
            products: products
          });
          that.calTotalPrice();
        }
      }
    });
  },

  calTotalPrice: function() {
    var products = this.data.products;
    var totalTradePrice = 0;
    var totalSalePrice = 0;

    products.forEach(function(p, i) {
      if (p.count) {
        totalTradePrice += +p.tradePrice * p.count;
        totalSalePrice += +p.salePrice * p.count;
      }
    });
    this.setData({
      totalTradePrice: totalTradePrice.toFixed(2),
      totalSalePrice: totalSalePrice.toFixed(2)
    });
  }

})