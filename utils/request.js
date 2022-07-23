// 发送ajax 请求
/* 封装功能函数 */

import config from './config'

export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) => {
        // 1.new Promise初始化promise实例的状态为pending
        wx.request({
            url: config.host + url,
            data,
            method,
            header: {
                // 读取storage中的cookie
                cookie: wx.getStorageSync('cookie') ? wx.getStorageSync('cookie') : ''
            },
            success: (res) => {
                // 若为用户登录请求，则存储cookies
                if (data.isLogin) {
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies
                    })
                }
                resolve(res.data)
            },
            fail: (err) => {
                reject(err)
            }
        })
    }
    )


}