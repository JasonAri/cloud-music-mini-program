import PubSub from 'pubsub-js'
import moment from 'moment'

import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        day: '',
        month: '',
        recommendList: '', // 推荐列表数据
        index: 0, // 点击音乐的下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 判断用户是否登录
        let userInfo = wx.getStorageSync('userInfo')
        if (!userInfo) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                success: () => {
                    // 跳转至登录界面
                    wx.reLaunch({
                        url: '/pages/login/login'
                    })
                }
            })
        }

        // 更新日期的状态
        this.setData({
            /* day: new Date().getDate(),
            month: new Date().getMonth() + 1 // getMonth的值为(0-11) */

            // 用moment库格式化日期
            day: moment().format('DD'),
            month: moment().format('MM'),

        })

        // 获取每日推荐数据
        this.getRecommendList()

        // 订阅来自songDetail页面发布的消息
        PubSub.subscribe('switchType', (_, type) => {
            // 取出data中的recommendList index
            let { recommendList, index } = this.data
            // 判断按钮类型
            if (type === 'pre') { //上一首
                // 索引减1
                index -= 1
                // 若在第一首点击的上一首，则切换到最后一首
                index < 0 && (index = recommendList.length - 1)
            } else { //下一首
                index += 1
                // 若在最后一首点击下一首，则切换到第一首
                index >= recommendList.length - 1 && (index = 0)
            }

            // 更新index
            this.setData({
                index
            })

            // 声明新索引值的musicId
            let musicId = recommendList[index].id
            // 发布最新的musicId,回传给songDetail页面
            PubSub.publish('musicId', musicId)
        })
    },

    // 获取每日推荐数据
    async getRecommendList() {
        let recommendListData = await request('/recommend/songs')
        this.setData({
            recommendList: recommendListData.recommend
        })
    },

    // 跳转至songDetail页面
    toSongDetail(event) {
        // 标记的recommendList里的song和索引index
        let { song, index } = event.currentTarget.dataset
        // 更新index到页面data里
        this.setData({
            index
        })

        // 路由跳转传参
        wx.navigateTo({
            url: '/pages/songDetail/songDetail?musicId=' + song.id // 参数需要转换成JSON格式
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