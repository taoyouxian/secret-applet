//index.js
//获取应用实例
const app = getApp()
var RSA = require('../../utils/wxapp_rsa.js')
var Encrypt = require('../../utils/jsencrypt.js')
var WXBizDataCrypt = require('../../utils/RdWXBizDataCrypt.js')

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    key: '',
    value: '',
    secret: '',
    nosecret: '',
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function () {
    console.log('onLoad')

    var privateKey_pkcs1 = app.globalData.rsakeys.priv
    var publicKey_pkcs1 = app.globalData.rsakeys.pub

    // 加签
    var sign_rsa = new RSA.RSAKey();
    sign_rsa = RSA.KEYUTIL.getKey(privateKey_pkcs1);
    console.log('签名RSA:')
    console.log(sign_rsa)
    var hashAlg = 'sha1';
    var hSig = sign_rsa.signString("signData", hashAlg);
    hSig = RSA.hex2b64(hSig); // hex 转 b64
    console.log("签名结果：" + hSig)

    // 验签
    var verify_rsa = new RSA.RSAKey();
    verify_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
    console.log('验签RSA:')
    console.log(verify_rsa)
    hSig = RSA.b64tohex(hSig)
    var ver = verify_rsa.verifyString("signData", hSig)
    console.log('验签结果：' + ver)

    // 加密 【加密字段长度不大于117】
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
    console.log('加密RSA:')
    console.log(encrypt_rsa)
    var encStr = encrypt_rsa.encrypt('hello world')
    encStr = RSA.hex2b64(encStr);
    console.log("加密结果：" + encStr)

    // 解密
    var decrypt_rsa = new RSA.RSAKey();
    decrypt_rsa = RSA.KEYUTIL.getKey(privateKey_pkcs1);
    console.log('解密RSA:')
    console.log(decrypt_rsa)
    encStr = RSA.b64tohex(encStr)
    var decStr = decrypt_rsa.decrypt(encStr)
    console.log("解密结果：" + decStr)

    var str = 'Message';
    // 密钥 16 位
    var key = '1234567891d3c568'; // 1234567891234567 -> DpRR3Rd+pgStGQ4UIvq/ZA==
    // 初始向量 initial vector 16 位
    var iv = '123456789123456'; // 123456789123456
    var pwd = app.encrypt(str, key, iv);
    console.log('AES加密:' + pwd);
    var original = app.decrypt(pwd, key, iv);
    console.log('AES解密:' + original);

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      var that = this;
      //获取用户信息
      app.getUserInfo(function (userInfo) {
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
      });
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    var url = app.Datas.Url.register;
    var data = {
      username: app.globalData.userInfo.city,
      orgName: 'Org1',
    }
    var contentType = "application/x-www-form-urlencoded";
    app.acRegist(url, data, "POST", contentType, function (aRes) {
      console.log(aRes);
      wx.setStorageSync('user', aRes)
    })

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
  loginBtnClick: function () {
    app.globalData.user = wx.getStorageSync('user')
    var url = app.Datas.Url.fcn;
    var key = this.data.key;

    var aeskey = app.globalData.aeskeys.key
    var aesiv = app.globalData.aeskeys.iv
    var value = app.encrypt(this.data.value, aeskey, aesiv);
    console.log('AES加密:' + value);

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
      wx.setStorageSync('trxid', aRes)
    })
  },
  resetBtnClick: function (e) {
    var that = this;
    app.globalData.user = wx.getStorageSync('user')
    var key = this.data.key;
    var url = app.Datas.Url.fcn;
    var data = {
      peer: "peer0.org1.example.com",
      fcn: "get",
      args: [key]
    }
    var token = app.globalData.user.token;
    app.acFcn(url, data, "GET", token, function (aRes) {
      console.log(aRes);
      wx.setStorageSync('value', aRes)

      that.setData({
        value: aRes
      })

      var aeskey = app.globalData.aeskeys.key
      var aesiv = app.globalData.aeskeys.iv
      var originalvalue = app.decrypt(aRes, aeskey, aesiv);
      console.log('AES解密:' + originalvalue);

      that.setData({
        nosecret: originalvalue
      })

    })

  },
})
