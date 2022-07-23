// pages/login/login.js
/* 
    登录流程：
    1.手机表单项数据
    2.前端验证
        验证用户信息（账号，密码）是否合法
            a.不通过就提示用户，不发请求
            b.通过则发送请求（携带账号、密码）到服务端
    3.后端验证
        验证用户是否存在
            a.不存在就直接返回，告诉前端用户不存在
            b.存在账户则验证密码是否正确
                不正确返回前端提示密码不正确
                正确则返回前端数据，并提示用户登录成功（会携带用户的相关信息）
        
*/

// 引入请求模块
import request from '../../utils/request'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '', // 手机号
        // password: '', // 不建议使用密码登录
        captcha: '', // 验证码
        btnDisabled: false, // 按钮是否被禁用
        btnText: '获取验证码', // 获取验证码按钮的文本
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    // 表单项内容发生改变的回调
    handleInput(event) {
        // let type = event.currentTarget.id; // 取值： phone || password
        let type = event.currentTarget.dataset.type // data-key=value
        // console.log(type, event.detail.value)
        this.setData({
            [type]: event.detail.value
        })
    },

    // 获取验证码的回调
    async handleGetCaptcha(event) {
        // 取出data中的数据
        let { phone } = this.data
        // 前端验证手机号
        if (!phone) { // 若手机号为空
            // 提示用户
            wx.showToast({
                title: '手机号不能为空',
                icon: 'error'
            })
            return;
        }
        // 定义正则表达式
        let phoneReg = /^1[3-9]\d{9}$/
        if (!phoneReg.test(phone)) { // 若手机号格式不正确
            wx.showToast({
                title: '手机号格式错误',
                icon: 'error'
            })
            return;
        }
        // 显示Loading
        wx.showLoading({
            title: '发送中'
        })
        // 发请求获取验证码
        let result = await request('/captcha/sent', { phone })
        // 关闭Loading
        wx.hideLoading()
        if (result.code == 200) {
            wx.showToast({
                title: '验证码发送成功'
            })
            // 开启倒计时
            this.setTimer(30)
        } else {
            wx.showToast({
                title: `获取验证码失败，错误代码：${result.code}`,
                icon: 'none'
            })
        }
    },

    // 设置倒计时的功能函数
    setTimer(countdown) { // countdown为倒计时长
        // 禁用按钮
        this.setData({
            btnDisabled: true,
        })
        // 开启定时器
        let interval = setInterval(() => {
            if (countdown == 0) { // 若倒计时结束
                // 激活按钮，恢复文本
                this.setData({
                    btnDisabled: false,
                    btnText: '获取验证码',
                })
                // 清除当前定时器
                clearInterval(interval)
            } else { // 倒计时未结束
                countdown--
                this.setData({
                    btnText: `${countdown}s后重新获取`
                })
            }
        }, 1000)
    },

    // 登录的回调
    async login() {
        let { phone, captcha } = this.data
        // 显示Loading
        wx.showLoading({
            title: '登录中'
        })
        // 后端验证
        let result = await request('/login/cellphone', { phone, captcha, isLogin: true });
        // 关闭Loading
        wx.hideLoading()
        if (result.code === 200) {
            wx.showToast({
                title: '登录成功',
            })
            // 将用户的信息存储至本地
            wx.setStorageSync('userInfo', JSON.stringify(result.profile))
            // 用户登录需要的cookie字段
            let cookie = wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1)
            wx.setStorageSync('cookie', cookie)
            // 登录成功跳转回个人中心页面，但不能用navigateTo跳tapbar
            wx.reLaunch({
                url: '/pages/personal/personal'
            })
        } else {
            wx.showToast({
                title: `${result.msg},错误代码：${result.code}`,
                icon: 'none'
            })
        }
    },

    // 游客登录的回调
    async visitorLogin() {
        // 显示Loading
        wx.showLoading({
            title: '登录中'
        })
        // 获取游客cookies (传参 isLogin)
        let result = await request('/register/anonimous', { isLogin: true })
        // 关闭Loading
        wx.hideLoading()
        // 自定义游客的信息
        let userInfo = { nickname: `游客${result.userId}` }
        // 将游客的信息存储至本地
        wx.setStorageSync('userInfo', JSON.stringify(userInfo))

        // 游客登录需要的cookie字段
        let cookie = wx.getStorageSync('cookies').find(item => item.indexOf('__csrf') !== -1).split(' ')[0] + ' '
            + wx.getStorageSync('cookies').find(item => item.indexOf('NMTID=') !== -1).split(' ')[0] + ' '
            + wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_A=') !== -1).split(';')[0]
        // 将游客的信息存储至本地
        wx.setStorageSync('cookie', cookie)
        // 登录成功跳转回个人中心页面，但不能用navigateTo跳tapbar
        wx.reLaunch({
            url: '/pages/personal/personal'
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})