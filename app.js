
var RSA = require('utils/wxapp_rsa.js')
var Encrypt = require('utils/jsencrypt.js')
var Crypto = require('utils/cryptojs/cryptojs.js').Crypto;

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 秘钥
    var rsakeys = wx.getStorageSync('rsa') || {}
    var aeskeys = wx.getStorageSync('aes') || {}
    var user = wx.getStorageSync('user') || {}
    if (rsakeys.pub == undefined) {
      var crypt = new Encrypt.JSEncrypt({ default_key_size: 1024 });
      crypt.getKey();
      var publicKey = crypt.getPublicKey();
      var privateKey = crypt.getPrivateKey();
      rsakeys.pub = publicKey;
      rsakeys.priv = privateKey;
      aeskeys.key = this.createNonceStr();
      aeskeys.iv = this.createNonceStr();

      wx.setStorageSync('rsa', rsakeys)
      wx.setStorageSync('aes', aeskeys)
    } else {
    }
    this.globalData.user = user
    this.globalData.rsakeys = rsakeys
    this.globalData.aeskeys = aeskeys

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            //平台登录

          },
          fail: function (res) {
            wx.showToast({
              title: '未授权',
              icon: 'false',
              duration: 1000,
              mask: true
            })
          }
        })

      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    user: null,
    rsakeys: null,
    aeskeys: null,
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  // 加密
  encrypt: function (word, KEY, IV) {
    var mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);
    var eb = Crypto.charenc.UTF8.stringToBytes(word);
    var kb = Crypto.charenc.UTF8.stringToBytes(KEY);//KEY "1234567812345678"
    var vb = Crypto.charenc.UTF8.stringToBytes(IV);//IV "8765432187654321"
    var ub = Crypto.AES.encrypt(eb, kb, { iv: vb, mode: mode, asBpytes: true });
    return ub;
  },
  // 解密：
  decrypt: function (word, KEY, IV) {
    var mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);
    var eb = Crypto.util.base64ToBytes(word);
    var kb = Crypto.charenc.UTF8.stringToBytes(KEY);//KEY "1234567812345678"
    var vb = Crypto.charenc.UTF8.stringToBytes(IV);//IV "8765432187654321"
    var ub = Crypto.AES.decrypt(eb, kb, { asBpytes: true, mode: mode, iv: vb });
    return ub;
  },
  createNonceStr: function () {
    return Math.random().toString().substr(2, 16)
  },

  /**
   * 数据
   */
  Datas: {
    // reqUrl: "https://mini.merchain.cn/",
    reqUrl: "",
    /**
    * sql语句的路径
    */
    Path: {
    },
    /**
     * 请求的url
     */
    Url: {
      register: "http://10.77.40.27:4000/users",
      fcn: "http://10.77.40.27:4000/channels/mychannel/chaincodes/mycc",
    },
  },
  /**
   * 发起网络请求
   */
  acHttp: function (url_input, path_input, data_input, method_input, callback) {
    var aUrl = this.Datas.reqUrl + url_input
    var aData = {
      Path: path_input,
      Ps: data_input,
    }
    wx.request({
      url: aUrl, //仅为示例，并非真实的接口地址
      data: aData,   //data:::{ x: '', y: '' };;最终发送给服务器的数据是 String 类型，如果传入的 data 不是 String 类型，会被转换成 String
      method: method_input,    //默认GET
      success: function (res) {
        //console.log(res.data)
        var receiveData = res.data
        typeof callback == "function" && callback(receiveData);
      }
    })
  },
  acHttpGet: function (url_input, data_input, header_input, method_input, callback) {
    var aUrl = this.Datas.reqUrl + url_input
    wx.request({
      url: aUrl, //仅为示例，并非真实的接口地址
      data: data_input,   //data:::{ x: '', y: '' };;最终发送给服务器的数据是 String 类型，如果传入的 data 不是 String 类型，会被转换成 String
      method: method_input,    //默认GET
      header: header_input,
      success: function (res) {
        //console.log(res.data)
        var receiveData = res.data
        typeof callback == "function" && callback(receiveData);
      }
    })
  },
  /**
   * 发起blockchain请求
   */
  acRegist: function (url_input, data_input, method_input, contentType_input, callback) {
    wx.request({
      url: url_input, //仅为示例，并非真实的接口地址
      data: data_input,   //data:::{ x: '', y: '' };;最终发送给服务器的数据是 String 类型，如果传入的 data 不是 String 类型，会被转换成 String
      method: method_input,    //默认GET
      contentType: contentType_input,
      success: function (res) {
        //console.log(res.data)
        var receiveData = res.data
        typeof callback == "function" && callback(receiveData);
      }
    })
  },
  acFcn: function (url_input, data_input, method_input, token, callback) {
    wx.request({
      url: url_input, //仅为示例，并非真实的接口地址
      data: data_input,   //data:::{ x: '', y: '' };;最终发送给服务器的数据是 String 类型，如果传入的 data 不是 String 类型，会被转换成 String
      method: method_input,    //默认GET
      header: {
        'content-type': 'application/json', // 默认值
        'authorization': "Bearer " + token
      },
      success: function (res) {
        //console.log(res.data)
        var receiveData = res.data
        typeof callback == "function" && callback(receiveData);
      }
    })
  },
})