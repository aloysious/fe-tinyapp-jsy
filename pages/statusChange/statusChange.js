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
    expressCode: '',
    expresserId: '',

    filterMaskAnim: {},
    filterPanelAnim: {},
    filterMaskDisplay: 'none',

    expresserList: [],
    selectedName: '',
    selectedContact: '',
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.createAnim();
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
    request({
      url: APIS.DELIVERY_REQUIREMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: this.data.rid,
        expressCompany: this.data.expressCompany,
        expressCode: this.data.expressCode,
        expresserId: this.data.expresserId
      },
      method: 'POST',
      realSuccess: function (data) {
        that.addComment();
      },
      loginCallback: that.onSubmitChange,
      realFail: function (msg, errCode) {
        wx.showToast({
          title: msg
        });
      }
    }, true, that);
  },


  /*
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
  */

  addComment: function() {
    var data = this.data;
    request({
      url: APIS.ADD_COMMENT,
      data: {
        sid: wx.getStorageSync('sid'),
        rid: data.rid,
        content: '需求状态修改为“' + data.nextStatusText + '”。',
        pictures: []
      },
      method: 'POST',
      realSuccess: function (data) {
        wx.hideLoading();
        wx.navigateBack();
      },
      loginCallback: this.addComment,
      realFail: function (msg, errCode) {
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

  onOpenExpresserList: function () {
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

    if (this.data.expresserList.length == 0) {
      this.getExpresserList();
    }
  },

  onCloseExpresserList: function () {
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

  getExpresserList: function() {
    var that = this;
    request({
      url: APIS.GET_MY_EXPRESSER_LIST,
      data: {
        sid: wx.getStorageSync('sid')
      },
      method: 'POST',
      realSuccess: function (data) {
        var filterList = [];
        data.list.forEach(function(e, i) {
          if (e.expresserContact) {
            filterList.push(e);
          }
        });
        that.setData({
          expresserList: filterList,
          hasMore: false
        });
        wx.hideLoading();
      },
      loginCallback: this.getMyExpresserList,
      realFail: function (msg, code) {
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },

  goToCenter: function() {
    wx.redirectTo({
      url: '../skuerCenter/skuerCenter'
    })
  },

  onSelectExpresser: function(e) {
    var id = e.currentTarget.dataset.id;
    var list = this.data.expresserList;
    for(var i = 0, j = list.length; i < j; i++) {
      if (id == list[i].expresserId) {
        this.setData({
          expresserId: list[i].expresserId,
          selectedName: list[i].expresserName,
          selectedContact: list[i].expresserContact
        });
        break;
      }
    }

    this.onCloseExpresserList();
  }
})