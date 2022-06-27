// pages/index/index.js

import request from '../../utils//request.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList: [], // 轮播图数据
        recommendList: [], // 推荐歌单
        topList: [], //排行榜数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        // 获取轮播图数据
        let bannerListData = await request('/banner', { type: 2 })
        this.setData({
            bannerList: bannerListData.banners
        })

        // 获取推荐歌单数据
        let recommendListData = await request('/personalized', { limit: 10 })
        this.setData({
            recommendList: recommendListData.result
        })

        // 获取排行榜数据
        /* 
            需求分析；
                1.需要根据idx的值获取对应的数据
                2.idx的取值范围是0-20，我们需要0-4
                3.需要发送5次请求
        */
        let index = 0
        let resultArr = []
        while (index < 5) {
            let topListData = await request('/top/list', { idx: index++ })
            let topListItem = { name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0, 3) }
            resultArr.push(topListItem)
            // 不需要等待5次请求全部结束后才更新，用户体验好但是渲染次数多
            this.setData({
                topList: resultArr
            })
        }
        // 更新topList放在此处会导致发送请求过程中长时间白屏，用户体验差
        // this.setData({
        //     topList: resultArr
        // })

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