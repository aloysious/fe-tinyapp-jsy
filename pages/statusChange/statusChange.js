// pages/statusChange/statusChange.js
var { statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
var { uploadPic } = require('../../libs/upload');
var Q = require('../../libs/q/q');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    title: '',
    status: 0,
    nextStatus: 0,
    statusText: '',
    nextStatusText: '',
    statusColor: '',
    today: '',
    avatar: '',
    content: '',
    pictures: [],
    productName: '',
    unitPrice: '',
    unit: '',
    format: '',
    amount: '',
    deliveryDeadline: '',
    paymentDeadline: '',
    expressCompany: '',
    expressCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rid: options.rid,
      title: options.title,
      status: options.status,
      nextStatus: +options.status + 1,
      statusText: statusListSimple[options.status + ''].text,
      nextStatusText: statusListSimple[(+options.status + 1) + ''].text,
      statusColor: statusListSimple[options.status + ''].color,
      today: util.formatDate(new Date()),
      avatar: wx.getStorageSync('userInfo').avatarUrl
    });
  },

  onAddPic: function () {
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

  onDeletePic: function (e) {
    var index = e.target.dataset.index;
    var paths = this.data.pictures;
    paths.splice(index, 1);
    this.setData({
      pictures: paths
    });
  },

  onChangeDeliveryDeadline: function(e) {
    var d = e.detail.value;
    this.setData({
      deliveryDeadline: d
    });
  },

  onChangePaymentDeadline: function (e) {
    var d = e.detail.value;
    this.setData({
      paymentDeadline: d
    });
  },

  onInputInfo: function(e) {
    var colume = e.target.dataset.colume;
    var value = util.trim(e.detail.value);
    var d = {};
    d[colume] = value;
    this.setData(d);
  },

  onSubmitChange: function() {
    var that = this;
    var d = this.data;
    this.submitInfo = {};
    if (d.status == 1) {
      this.submitInfo = {
        productName: d.productName,
        unitPrice: d.unitPrice,
        amount: d.amount,
        unit: d.unit,
        format: d.format
      };
    } else if (d.status == 2) {
      this.submitInfo = {
        deliveryDeadline: d.deliveryDeadline,
        paymentDeadline: d.paymentDeadline
      };
    } else if (d.status == 3) {
      this.submitInfo = {
        expressCompany: d.expressCompany,
        expressCode: d.expressCode
      };
    }
    var errorTips = '';
    for (var i in this.submitInfo) {
      if (this.submitInfo[i] == '') {
        errorTips = '请填写完整信息后提交！';
        break;
      }
    }
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
          pictures.push(picUrls[i]);
        }
        var data = that.data;
        var d = that.submitInfo;
        d.sid = wx.getStorageSync('sid');
        d.rid = data.rid;
        d.toStatus = data.nextStatus;

        if (data.status == 1) {
          d.productPictures = pictures;
        } else if (data.status == 2) {
          d.contractPictures = pictures;
        } else if (data.status == 3) {
          d.expressPictures = pictures;
        } else if (data.status == 4) {
          d.arrivalPictures = pictures;
        } else if (data.status == 5) {
          d.paymentPictures = pictures;
        }

        request({
          url: APIS.RECORD_REQUIRMENT,
          data: d,
          method: 'POST',
          realSuccess: function (data) {
            // wx.hideLoading();
            // wx.navigateBack();
            that.addComment(pictures);
          },
          loginCallback: that.onSubmitChange,
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
        console.log(e);
        wx.showToast({
          title: e.errMsg || '更改状态失败，请稍后重试！'
        });
      });
  },

  addComment: function(pictures) {
    var data = this.data;
    request({
      url: APIS.ADD_COMMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: data.rid,
        content: '需求状态修改为“' + data.nextStatusText + '”。',
        pictures: pictures
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.hideLoading();
        wx.navigateBack();
      },
      loginCallback: this.addComment,
      realFail: function (msg, errCode) {
        console.log(msg);
        wx.hideLoading();
        wx.navigateBack();
      }
    }, true, this);
  },

  onToTerminal: function() {
    var d = this.data;
    var rid = d.rid;
    var title = d.title;
    var status = d.status;
    wx.navigateTo({
      url: '../statusTerminate/statusTerminate?rid=' + rid + '&title=' + title + '&status=' + status,
    })
  }
})