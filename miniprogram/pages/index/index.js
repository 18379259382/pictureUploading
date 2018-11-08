//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    array: [],
  },
  onLoad: function() {
    var that = this
    that.getUrl(that)
  },
  getUrl: function (that){
  wx.cloud.callFunction({
    name: 'nedd',
    data: {
      openid: app.globalData.openid

    },
    success: res => {
      console.log(res)
      var i = res.result.data.length
      res.result.data.forEach((e) => {
        wx.cloud.downloadFile({
          fileID: e.description,
          success: res => {
            console.log(res)
            that.data.array.push(res.tempFilePath)
            if (that.data.array.length == i) {
              that.setData({
                array: that.data.array,
                iages: that.data.array[0],
                itemName1: that.data.array[0],
                itemName2: that.data.array[1],
                itemName3: that.data.array[2],
              })
            }
          },
          fail: err => {
            console.log(err)
          }
        })
      })

    },
    fail: err => {
      console.error('[云函数] [sum] 调用失败：', err)
    }
  })

},
  _da: function(e) {
    wx.previewImage({
      current: this.data.array[e.currentTarget.dataset.index],
      urls: this.data.array
    })
  },

  onPullDownRefresh: function () {
    var that=this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getUrl(that)
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
})