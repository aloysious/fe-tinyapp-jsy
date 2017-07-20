var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({
  data:{
    imageUrls: [],
    title: '',
    description: '',
    current: 0,
    total: 0,
    isHidden: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let curr = +options.current || 0;
    this.current = curr;
    this.loadProducts();
  },

  loadProducts: function () {
    var that = this;
    request({
      url: APIS.GET_PRODUCT_LIST,
      data: {
        pageNum: 0,
        pageSize: 9999
      },
      method: 'POST',
      realSuccess: function (data) {
        if (data.list && data.list.length > 0) {
          var photos = data.list;
          that.setData({
            imageUrls: photos,
            title: photos[that.current].productName || '',
            description: photos[that.current].productDescription || '',
            current: that.current,
            total: photos.length
          });
        }
      },
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  onSwiperChange(event) {
    let curr = event.detail.current;
    let photos = this.data.imageUrls;
    this.setData({
      title: photos[curr].productName || '',
      description: photos[curr].productDescription || '',
      current: curr, 
    });
    this.current = curr;
  },
  onSwiperTap() {
    let hidden = this.data.isHidden;
    this.setData({
      isHidden: !hidden
    });
  }
})