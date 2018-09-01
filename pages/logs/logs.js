//logs.js
const util = require('../../utils/util.js')
const app = getApp()
var RSA = require('../../utils/wxapp_rsa.js')
var Encrypt = require('../../utils/jsencrypt.js')
var WXBizDataCrypt = require('../../utils/RdWXBizDataCrypt.js')

Page({
  data: {
    logs: [],
    key: '',
    value: '',
    secret: '',
    nosecret: '',
    rsakeys: {},
    aeskeys: {}
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })

    var rsakeys = wx.getStorageSync('rsa2') || {}
    var crypt = new Encrypt.JSEncrypt({ default_key_size: 1024 });
    crypt.getKey();
    var publicKey = crypt.getPublicKey();
    var privateKey = crypt.getPrivateKey();
    rsakeys.pub = publicKey;
    rsakeys.priv = privateKey;

    this.data.rsakeys = rsakeys;
    wx.setStorageSync('rsa2', rsakeys)
  },

  loginBtnClick: function () {
    app.globalData.user = wx.getStorageSync('user')
    var url = app.Datas.Url.fcn;
    var key = "auth_tao";

    var aeskey = app.globalData.aeskeys.key
    var aesiv = app.globalData.aeskeys.iv
    var aes = aeskey + "_" + aesiv

    // 加密 【加密字段长度不大于117】
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(this.data.rsakeys.pub);
    console.log('加密RSA:')
    console.log(encrypt_rsa)
    var encStr = encrypt_rsa.encrypt(aes)
    encStr = RSA.hex2b64(encStr);
    console.log("加密结果：" + encStr)

    var value = encStr;

    this.setData({
      secret: value
    })

    var data = {
      peers: ["peer0.org1.example.com", "peer1.org1.example.com"],
      fcn: "set",
      args: [key, value]
    }
    var token = app.globalData.user.token;
    app.acFcn(url, data, "POST", token, function (aRes) {
      console.log(aRes);
      wx.setStorageSync('trxid1', aRes)

    })
  },
  resetBtnClick: function (e) {
    var that = this;
    app.globalData.user = wx.getStorageSync('user')
    var key = "auth_tao";
    var url = app.Datas.Url.fcn;
    var data = {
      peer: "peer0.org1.example.com",
      fcn: "get",
      args: [key]
    }
    var token = app.globalData.user.token;
    app.acFcn(url, data, "GET", token, function (aRes) {
      console.log(aRes);
      if (aRes.indexOf("Error") >= 0) {
        console.log("Error");
      } else {
        wx.setStorageSync('value1', aRes)

        that.setData({
          value: aRes
        })

        // 解密
        var decrypt_rsa = new RSA.RSAKey();
        decrypt_rsa = RSA.KEYUTIL.getKey(that.data.rsakeys.priv);
        console.log('解密RSA:')
        console.log(decrypt_rsa)
        var encStr = RSA.b64tohex(aRes)
        var decStr = decrypt_rsa.decrypt(encStr)
        console.log("解密结果：" + decStr)

        if (decStr != null && decStr.length == 33) {
          var keys = decStr.split("_")
          that.data.aeskeys.key = keys[0]
          that.data.aeskeys.iv = keys[1]

          // 解密文件
          var key = that.data.key;
          var url = app.Datas.Url.fcn;
          var data = {
            peer: "peer0.org1.example.com",
            fcn: "get",
            args: [key]
          }
          var token = app.globalData.user.token;
          app.acFcn(url, data, "GET", token, function (aRes) {
            console.log(aRes);
            if (aRes.indexOf("Error") >= 0) {
              console.log("Error Get File");
            } else {

              var original = app.decrypt(aRes, that.data.aeskeys.key, that.data.aeskeys.iv);
              console.log('AES解密:' + original);

              that.setData({
                nosecret: original
              })
            }
            
          })

        } else {
          console.log("Length error")
        }

      }

    })

  },
  // 监听错误
  onError: function (err) {
    // 上报错误
    console.log("App Error: " + err)
  }, 
  keyInput: function (e) {
    this.setData({
      key: e.detail.value
    })
  },
  valueInput: function (e) {
    this.setData({
      value: e.detail.value
    })
  },

})
