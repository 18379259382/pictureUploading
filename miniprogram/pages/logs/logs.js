// pages/logs/logs.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  _bindGetUserInfo: function(e) {
    console.log(e)
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      app.globalData.userInfo = ""
    } else {
      app.globalData.userInfo = e.detail.userInfo

      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openid = res.result.openid
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }
    this.setData({
      avatarUrl: e.detail.userInfo.avatarUrl,
      userInfo: e.detail.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取用户信息

  },
  doUpload: function() {
    var that = this
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        })
        console.log(res)
        const t = 0
        if (app.globalData.openid != "") {
          that.getTie(res, t)
        } else {
          wx.showToast({
            icon: "none",
            title: '上传失败',
          })
        }

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  getTie: function(res, t) {
    var that = this
    const filePath = res.tempFilePaths[t]
    // 上传图片
    var today = new Date();
    var s = today.getFullYear() + "" + today.getMonth() + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds() + today.getDay() + t;
    const cloudPath = s + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)
        console.log(app.globalData.openid)
        wx.cloud.callFunction({
          name: 'newP',
          data: {
            e: res.fileID,
            openid: app.globalData.openid
          },
          success: res => {
            console.error('[云函数] [sum] 调用成功：', res)
          },
          fail: err => {
            console.error('[云函数] [sum] 调用失败：', err)
          },
        })
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
        var tera = []
        if (t < res.tempFilePaths.length - 1) {
          t++;
          console.log(t)
          that.getTie(res, t)
        }
      }
    })
  }

})