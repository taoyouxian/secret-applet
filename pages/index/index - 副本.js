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
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  onLoad: function () {
    var appId = 'wx4f4bc4dec97d474b'
    var sessionKey = 'tiihtNczf5v6AKRyjwEUhQ=='
    var encryptedData =
      'CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZM' +
      'QmRzooG2xrDcvSnxIMXFufNstNGTyaGS' +
      '9uT5geRa0W4oTOb1WT7fJlAC+oNPdbB+' +
      '3hVbJSRgv+4lGOETKUQz6OYStslQ142d' +
      'NCuabNPGBzlooOmB231qMM85d2/fV6Ch' +
      'evvXvQP8Hkue1poOFtnEtpyxVLW1zAo6' +
      '/1Xx1COxFvrc2d7UL/lmHInNlxuacJXw' +
      'u0fjpXfz/YqYzBIBzD6WUfTIF9GRHpOn' +
      '/Hz7saL8xz+W//FRAUid1OksQaQx4CMs' +
      '8LOddcQhULW4ucetDf96JcR3g0gfRK4P' +
      'C7E/r7Z6xNrXd2UIeorGj5Ef7b1pJAYB' +
      '6Y5anaHqZ9J6nKEBvB4DnNLIVWSgARns' +
      '/8wR2SiRS7MNACwTyrGvt9ts8p12PKFd' +
      'lqYTopNHR1Vf7XjfhQlVsAJdNiKdYmYV' +
      'oKlaRv85IfVunYzO0IKXsyl7JCUjCpoG' +
      '20f0a04COwfneQAGGwd5oa+T8yO5hzuy' +
      'Db/XcxxmK01EpqOyuxINew=='
    var iv = 'r7BXXKkLb8qrSNn05n0qiA=='

    var pc = new WXBizDataCrypt(appId, sessionKey)

    var data = pc.decryptData(encryptedData, iv)

    console.log('解密后 data: ', data)

    var crypt = new Encrypt.JSEncrypt({ default_key_size: 1024 });
    crypt.getKey();
    var publicKey = crypt.getPublicKey();
    var privateKey = crypt.getPrivateKey();
    console.log('publicKey is:\n' + publicKey)
    console.log('privateKey is:\n' + privateKey)

    console.log('onLoad')

    var privateKey_pkcs1 = privateKey
    var publicKey_pkcs1 = publicKey

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
      //获取用户信息
      // app.getUserInfo(function (userInfo) {
      //   that.setData({
      //     userInfo: userInfo
      //   });
      // });
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
  },
})
