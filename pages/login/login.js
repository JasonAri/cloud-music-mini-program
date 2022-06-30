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
        password: '', // 密码
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

    // 登录的回调
    async login() {
        // 1.手机表单项数据
        let { phone, password } = this.data
        /* 
            手机号验证
                内容为空
                格式不正确
                验证通过
        */
        if (!phone) {
            // 提示用户
            wx.showToast({
                title: '手机号不能为空',
                icon: 'error'
            })
            return;
        }
        // 定义正则表达式
        let phoneReg = /^1[3-9]\d{9}$/
        if (!phoneReg.test(phone)) {
            wx.showToast({
                title: '手机号格式错误',
                icon: 'error'
            })
            return;
        }

        if (!password) {
            wx.showToast({
                title: '密码不能为空',
                icon: 'error'
            })
            return;
        }

        // wx.showToast({
        //     title: '前端验证通过'
        // })

        // 后端验证
        /* localhost:3000端口在2022.6.17后无法返回用户登录数据 */
        // let result = await request('/login/cellphone', { phone, password, isLogin:true });

        /* 临时借用api登录获取userInfo */
        let result = await new Promise((resolve, reject) => {
            wx.request({
                url: 'http://music.cyrilstudio.top/login/cellphone',
                data: { phone, password },
                method: 'GET',
                success: (res) => {
                    // 用户登录并保存cookie
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies
                    })
                    resolve(res.data)
                },
                fail: (err) => {
                    reject(err)
                }
            })
        });


        if (result.code === 200) {
            wx.showToast({
                title: '登录成功',
            })
            // 将用户的信息存储至本地
            wx.setStorageSync('userInfo', JSON.stringify(result.profile))
            // 登录成功跳转回个人中心页面，但不能用navigateTo跳tapbar
            wx.reLaunch({
                url: '/pages/personal/personal'
            })
        } else if (result.code === 400) {
            wx.showToast({
                title: '手机号错误',
                icon: 'error'
            })
        } else if (result.code === 501) {
            wx.showToast({
                title: '账号不存在',
                icon: 'error'
            })
        } else if (result.code === 502) {
            wx.showToast({
                title: '密码错误',
                icon: 'error'
            })
        } else {
            wx.showToast({
                title: `登录失败，请重新登录 错误代码：${result.code}`,
                icon: 'none'
            })
        }



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