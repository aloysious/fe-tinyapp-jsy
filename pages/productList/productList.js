var { statusList, statusListSimple, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

// pages/photo/photo.js
Page({
  data:{
    imageUrls: [],
    size: 10,
    offset: 0,
    photos: [],
    isEnd: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.loadProducts();

  },

  /*
  loadProducts: function () {
    var that = this;
    wx.request({
      url: APIS.GET_PRODUCT_LIST,
      data: {
        pageNum: 0,
        pageSize: 9999
      },
      method: 'POST',
      success: function(data) {
        var list = data.data.resultData;
        if (list && list.length > 0) {
          let offset = that.data.offset;
          let size = that.data.size;

          if (that.data.photos.length == 0) {
            that.setData({
              photos: list
            })
          }

          that.getPhotos(offset, size);
        }
      }
    })
  },
  */

  loadProducts: function() {
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
          let offset = that.data.offset;
          let size = that.data.size;

          if (that.data.photos.length == 0) {
            that.setData({
              photos: data.list
            })
          }

          that.getPhotos(offset, size);
        }
      },
      realFail: function (msg) {
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },

  getPhotos(offset, size) {
    let tmpPhotos = this.data.photos.slice(offset, offset + size);

    if (tmpPhotos.length < size) {
      this.setData({
        isEnd: true
      });
    }

    tmpPhotos = tmpPhotos.map(function(p, i) {
      p.id = offset + i;
      if (i % 8 == 0) {
        p.type = 7;
      } else if ((i - 1) % 8 == 0) {
        p.type = 3;
      } else if ((i - 2) % 8 == 0) {
        p.type = 5;
      } else if ((i - 3) % 8 == 0) {
        p.type = 5;
      } else if ((i - 4) % 8 == 0) {
        p.type = 5;
      } else if ((i - 5) % 8 == 0) {
        p.type = 5;
      } else if ((i - 6) % 8 == 0) {
        p.type = 3;
      } else if ((i - 7) % 8 == 0) {
        p.type = 7;
      }
      return p;
    });
    this.setData({
      imageUrls: this.data.imageUrls.concat(tmpPhotos),
      offset: offset + size
    });
  },
  loadMorePhotos() {
    if (this.data.isEnd) return;
    let offset = this.data.offset;
    let size = this.data.size;
    this.getPhotos(offset, size);
  },
  onOpenPhoto(event) {
    let index = event.target.dataset.index;
    wx.navigateTo({
      url: '../productSlide/productSlide?current=' + index
    });
  },
})