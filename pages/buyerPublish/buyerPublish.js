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
    typeList: [],
    typeIndex: 0,
    content: '',
    productName: '',
    amount: '',
    property: '',
    format: '',
    perPrice: '',
    deliveryDeadline: '',
    moreInfo: '',
    pictures: [],
    isAuthorized: true,
    publisherName: '',
    publisherContact: '',
    willInputContact: false,
    isUseTpl: false,
    isShowAuth: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllProductType();
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

  getAllProductType: function () {
    var that = this;
    request({
      url: APIS.GET_ALL_PRODUCT_TYPE_LIST,
      method: 'POST',
      realSuccess: function (data) {
        var list = data.list;
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

  onChangeType: function (e) {
    var index = +e.detail.value;
    this.setData({
      typeIndex: index
    });
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

  onToggleTpl: function() {
    this.setData({
      isUseTpl: !this.data.isUseTpl
    });
  },

  onAddPic: function() {
    if (this.data.pictures.length >= 5) {
      wx.showToast({
        title: '最多只能上传5张图片！'
      });
      return;
    }

    var that = this;
    var count = 5 - this.data.pictures.length;
    wx.chooseImage({
      count: count, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        // success
        var tempFilePaths = res.tempFilePaths;
        var pathArr = that.data.pictures;
        pathArr = pathArr.concat(tempFilePaths);
        that.setData({
          pictures: pathArr
        });
        //that.uploadPic(tempFilePaths[0]);
      }
    });
  },

  onDeletePic: function(e) {
    var index = e.target.dataset.index;
    var paths = this.data.pictures;
    paths.splice(index, 1);
    this.setData({
      pictures: paths
    });
  },

  onInputContent: function(e) {
    this.setData({
      content: util.trim(e.detail.value)
    });
  },

  onInputProductName: function(e) {
    this.setData({
      productName: util.trim(e.detail.value)
    });
  },

  onInputAmount: function(e) {
    this.setData({
      amount: util.trim(e.detail.value)
    });
  },

  onInputProperty: function (e) {
    this.setData({
      property: util.trim(e.detail.value)
    });
  },

  onInputFormat: function(e) {
    this.setData({
      format: util.trim(e.detail.value)
    });
  },

  onInputPerPrice: function(e) {
    this.setData({
      perPrice: util.trim(e.detail.value)
    });
  },

  onInputDeliveryDeadline: function(e) {
    this.setData({
      deliveryDeadline: util.trim(e.detail.value)
    });
  },

  onInputMoreInfo: function(e) {
    this.setData({
      moreInfo: util.trim(e.detail.value)
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
    var errorTips = this.validateSubmit();
    if (errorTips) {
      wx.showToast({
        title: errorTips
      });
      return;
    }

    var fnArr = [];
    for (var i in this.data.pictures) {
      fnArr.push(uploadPic(this.data.pictures[i]));
    }
    wx.showLoading({
      mask: true,
      title: '数据提交中'
    });
    Q.all(fnArr)
      .then(function (picUrls) {
        var pictures = [];
        for (var i in picUrls) {
          pictures.push( picUrls[i]);
        }
        var content = '';
        if (that.data.isUseTpl) {
          var contentArr = [
            '产品名称：' + that.data.productName,
            '产品属性：' + that.data.property,
            '包装规格：' + that.data.format,
            '采购数量：' + that.data.amount,
            '期望单价：' + that.data.perPrice + '元',
            '交货时间：' + that.data.deliveryDeadline,
            '更多说明：' + that.data.moreInfo
          ];
          content = contentArr.join('\r\n');
        } else {
          content = that.data.content;
        }
        var data = that.data;
        request({
          url: APIS.PUBLISH_REQUIREMENT,
          data: {
            sid: wx.getStorageSync('sid'),
            productTypeId: data.typeList[data.typeIndex].id,
            description: {
              content: content,
              pictures: pictures
            },
            publisherName: data.publisherName,
            publisherContact: data.publisherContact
          },
          method: 'POST',
          realSuccess: function (data) {
            //wx.hideLoading();
            that.addFirstComment(data.rid);
            //wx.navigateBack();
          },
          loginCallback: that.onPublish,
          realFail: function (msg, errCode) {
            //wx.hideLoading();
            wx.showToast({
              title: msg
            });
          }
        }, true, that);
      })
      .catch(function (e) {
        //wx.hideLoading();
        wx.showToast({
          title: e.errMsg || '需求发布失败，请稍后重试！'
        });
      });

  },

  addFirstComment: function(rid) {
    request({
      url: APIS.ADD_COMMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: rid,
        content: '成功发布了需求！',
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
    if (d.isUseTpl) {
      if (!d.productName && !d.amount &&
        !d.format && !d.property && !d.perPrice && !d.deliveryDeadline && !d.moreInfo) {
          return '需求描述不能为空'
        }
    } else {
      if (!d.content) {
        return '需求描述不能为空'
      }
    }
    if (!d.publisherName) {
      return '您的姓名不能为空'
    }
    if (!validate.phone(d.publisherContact)) {
      return '请输入正确的手机号码'
    }
    return '';
  },

  onCloseAuth: function() {
    this.setData({
      isShowAuth: false
    });
  },

  onPreviewPictures: function(e) {
    var picUrl = e.target.dataset.url;

    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.pictures
    });
  }
})