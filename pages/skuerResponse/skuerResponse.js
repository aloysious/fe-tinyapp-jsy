// pages/commentAdd/commentAdd.js
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
    statusText: '',
    statusColor: '',
    today: '',
    avatar: '',
    content: '',
    pictures: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.status = 0;
    this.setData({
      rid: options.rid,
      title: options.title,
      statusText: statusListSimple[options.status + ''].text,
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

  onSubmitComment: function () {
    var that = this;
    var fnArr = [];
    for (var i in this.data.pictures) {
      fnArr.push(uploadPic(this.data.pictures[i]));
    }
   
    Q.all(fnArr)
      .then(function (picUrls) {
        var pictures = [];
        for (var i in picUrls) {
          pictures.push(picUrls[i]);
        }
        var data = that.data;
        request({
          url: APIS.ADD_COMMENT,
          data: {
            sid: wx.getStorageSync('sid'),
            rid: data.rid,
            content: '抢单成功，开始响应订单需求！\r\n' + data.content,
            pictures: pictures
          },
          method: 'POST',
          realSuccess: function (data) {
            wx.hideLoading();
            wx.navigateBack();
          },
          loginCallback: that.onSubmitComment,
          realFail: function (msg, errCode) {
            console.log(msg);
            wx.hideLoading();
            wx.navigateBack();
          }
        }, true, that);
      })
      .catch(function (e) {
        console.log(e);
        wx.hideLoading();
        wx.navigateBack();
      });
  },

  doResponse: function() {
    var that = this;

    if (!this.data.content) {
      wx.showToast({
        title: '请先填写留言反馈再去抢单！'
      });
      return;
    }

    wx.showLoading({
      mask: true,
      title: '数据提交中'
    });
    request({
      url: APIS.RESPONSE_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid
      },
      method: 'POST',
      realSuccess: function (data) {
        //wx.hideLoading();
        //wx.navigateBack();
        that.onSubmitComment();
      },
      loginCallback: this.doResponse,
      realFail: function (msg, errCode) {
        //wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  onInputContent: function (e) {
    this.setData({
      content: util.trim(e.detail.value)
    });
  },

  onPreviewPictures: function (e) {
    var picUrl = e.target.dataset.url;

    wx.previewImage({
      current: picUrl, // 当前显示图片的链接，不填则默认为 urls 的第一张
      urls: this.data.pictures
    });
  }
})