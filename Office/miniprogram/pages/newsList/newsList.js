const app = getApp()
const getUser = require('../../utils/getUser');
const { $Message } = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    height: 0,
    start: 0,
    spinShow: false,
    timeStamp: 0,
    token: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let _this = this;
    let result = await this.getNews(0);
    console.log(result)
    wx.getSystemInfo({
      success: (result) => {
        _this.setData({
          height: result.windowHeight
        })
      },
    })
    this.setData({
      news: result
    });
  },
  getNews: async function (page) {
    let _this = this;
    let token = await getUser.getUserToken();
    _this.setData({
      spinShow: true,
      token: token
    })
    return new Promise((resolve, reject) => {
      wx.request({
        url: `http://${app.ip}:5000/news/service/getDoneNews/${page}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': token
        },
        success: async function (res) {
          if (res.data == "Unauthorized") {
            wx.removeStorage({
              key: 'Token',
            })
            wx.redirectTo({
              url: '../../pages/auth/auth',
            })
          }
          if (res.data.type == 'Success') {
            _this.setData({
              spinShow: false
            })
            resolve(res.data.msg);
          }
        },
        fail: function (err) {
          reject(err);
        }
      })
    }).catch(err=>{
      wx.redirectTo({
        url: '../../pages/auth/auth',
      })
    })
  },
  tolower: async function (e) {
    let _this = this;
    let start = this.data.start + 1;
    let data = [];
    data = await this.getNews(start);
    let resource = this.data.news;
    resource.push(...data)
    if (data.length == 0) {
      $Message({
        content: '底线到了...',
        type: 'warning'
      })
      return;
    }
    this.setData({
      news: resource,
      start: start
    })
  },
  nav: function (e) {
    let detail = e.currentTarget.dataset.detail;
    wx.setStorage({
      data: JSON.stringify(detail),
      key: 'tempDetail',
    })
    wx.navigateTo({
      url: `../../pages/news/news`,
    })
  }
})