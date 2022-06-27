// pages/video/video.js
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [], // 导航标签数据
        navId: '', // 导航标识
        videoList: [], // 视频列表数据
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取导航数据
        this.getVideoGroupListData()
    },

    // 获取导航数据
    async getVideoGroupListData() {
        let videoGroupListData = await request('/video/group/list')
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 14), // 更新data中的videoGropList数据
            navId: videoGroupListData.data[0].id, // 标识第一个导航项为 active
        })

        // 获取视频列表数据
        this.getVideoList(this.data.navId)
    },

    // 获取视频列表数据
    async getVideoList(navId) {
        // 若navId为空，则不获取视频列表
        if (!navId) return
        let videoListData = await request('/video/group', { id: navId })
        // 关闭‘正在加载’提示框
        wx.hideLoading()
        let index = 0
        let videoList = videoListData.datas.map(item => {
            item.id = index++
        })
        this.setData({
            videoList: videoListData.datas
        })
    },

    // 点击切换导航的回调
    changeNav(event) {
        let navId = event.currentTarget.id;
        this.setData({
            navId: navId >>> 0,
            // 清空旧页面视频列表
            videoList: []
        })
        // 切换到新导航时 显示正在加载
        wx.showLoading({
            title: '正在加载'
        })

        // 动态获取当前导航对应的视频数据
        this.getVideoList(this.data.navId)
    },

    // 点击播放/继续播放的回调
    handlePlay(event) {
        /*
            功能需求：
                1.在点击播放的事件中需要找到上一个播放的视频
                2.在播放新视频之前关闭上一个正在播放的视频
            实现关键：
                1.找到上一个视频的实例对象
                2.如何确认点击播放的视频和正在播放的视频不是同一个视频
        
        */
        // 声明本次点击的视频的vid
        let vid = event.currentTarget.id
        // 关闭上一个播放的video实例 （且上一次点击和本次点击视频不为同一视频时触发）
        this.vid !== vid && this.videoContext && this.videoContext.stop() // 当videoContext有值再调用stop
        // 创建控制video标签的实例对象
        this.videoContext = wx.createVideoContext(vid)
        // 更新vid到video页面的实例对象中
        this.vid = vid
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