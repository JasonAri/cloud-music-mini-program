// pages/personal/personal.js

import request from "../../utils/request";

let startY = 0; //手指起始的坐标
let moveY = 0;
let moveDistance = 0;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        coverTransform: 'translateY(0)',
        coverTransition: '',
        userInfo: {}, // 用户信息
        recentPlayList: [], //用户播放记录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 读取用户的基本信息
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            // 更新userInfo的状态
            this.setData({
                userInfo: JSON.parse(userInfo)
            })
            // 获取用户播放记录
            this.getUserRecentPlayList(this.data.userInfo.userId)
        }
    },

    //获取用户播放记录的函数
    async getUserRecentPlayList(userId) {
        if (!userId) { return }
        let recentPlayListData = await request('/user/record', { uid: userId, type: 0 });
        /* recentPlayListData没有唯一标识，需要自己添加 */
        let index = 0;
        let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
            item.id = index++;
            return item;
        })
        this.setData({
            recentPlayList
        })
    },

    handleTouchStart(event) {
        // 清除过渡效果
        this.setData({
            coverTransition: ''
        })
        // 获取手指的起始坐标
        startY = event.touches[0].clientY;
    },
    handleTouchMove(event) {
        moveY = event.touches[0].clientY;
        moveDistance = moveY - startY;
        if (moveDistance <= 0) {
            return;
        }
        if (moveDistance >= 80) {
            moveDistance = 80;
        }
        // 动态更新coverTransform的状态值
        this.setData({
            coverTransform: `translateY(${moveDistance}px)`
        })
    },
    handleTouchEnd() {
        this.setData({
            coverTransform: `translateY(0)`,
            coverTransition: 'transform 0.4s linear'
        })
    },

    // 跳转至登录Login页面的回调
    toLogin() {
        // 判断登录状态
        if (wx.getStorageSync('userInfo')) { // 若已登录
            // 模态框询问是否退出登录
            wx.showModal({
                title: '您已登录，确认退出登录吗？',
                confirmColor: '#d43c33',
                success: (res) => {
                    if (res.confirm) { // 若确认
                        // 清除所有缓存
                        wx.clearStorageSync()
                        // 移除data内的状态数据
                        this.setData({
                            userInfo: {},
                            recentPlayList: []
                        })
                    }
                }
            })
        } else { // 未登录
            // 跳转Login页面
            wx.navigateTo({
                url: '/pages/login/login'
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