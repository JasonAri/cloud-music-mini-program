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
        videoId: '', // 视频id标识
        videoUpdateTime: [], // 记录video播放时长
        isTriggered: false, // 标识下拉刷新是否被触发
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
            videoList: videoListData.datas,
            // 关闭下拉刷新状态
            isTriggered: false
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
            单例模式：
                1.需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象。
                优点：节省内存空间
        
        */
        // 声明本次点击的视频的vid
        let vid = event.currentTarget.id

        /* 
        因为用image代替video预展示，不再需要判断video是否为上一次点击的video
        // 关闭上一个播放的video实例 （且上一次点击和本次点击视频不为同一视频时触发）
        this.vid !== vid && this.videoContext && this.videoContext.stop() // 当videoContext有值再调用stop
        // 更新vid到video页面的实例对象中
        this.vid = vid */

        // 更新data中的videoId的状态
        this.setData({
            videoId: vid
        })

        // 创建控制video标签的实例对象
        this.videoContext = wx.createVideoContext(vid)

        // 在data中取出videoUpdateTime
        let { videoUpdateTime } = this.data

        let videoItem = videoUpdateTime.find(item => item.vid === vid)
        // 判断当前视频是否播放过，如果是，则跳转至指定的播放时间
        videoItem && this.videoContext.seek(videoItem.currentTime)

        // 调用实例的play方法播放视频
        this.videoContext.play()
    },

    // 监听视频播放进度的回调
    handleTimeUpdate(event) {
        /* 
            功能实现思路：
                1.在data中拿到videoUpdateTime
                2.声明videoTimeObj对象来存储视频ID以及已播放的时长，并push到videoUpdateTime里
                    优化：当videoUpdateTime存在相同的视频ID时，不做push，只修改对应videoTimeObj的属性值
                3.将videoUpdateTime更新到data里
        */
        // 在data中拿到videoUpdateTime
        let { videoUpdateTime } = this.data //解构赋值
        // 声明video播放时长对象，存储视频的ID和播放时长
        let videoTimeObj = { vid: event.currentTarget.id, currentTime: event.detail.currentTime }
        // 声明videoItem 用于标记已存在的videoUpdateTime中的项
        let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
        // 若已存在，则只更新属性值，反之push整个videoTimeObj
        videoItem ? videoItem.currentTime = event.detail.currentTime : videoUpdateTime.push(videoTimeObj)
        // 更新videoUpdateTime的数据
        this.setData({
            videoUpdateTime
        })
    },

    // 视频播放结束后的回调
    handleEnded(event) {
        // 取出videoUpdateTime
        let { videoUpdateTime } = this.data
        // 当前视频在videoUpdateTime里的index值
        let index = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
        // 删除对应index的项
        videoUpdateTime.splice(index, 1)
        // 更新data
        this.setData({
            videoUpdateTime
        })
    },

    // 自定义下拉刷新的回调：scroll-view
    handleRefresher() {
        // 再次发请求获取视频列表数据
        this.getVideoList(this.data.navId)
    },

    // 自定义上拉触底的回调
    handleToLower() {
        /* 这里可以为数据分页做添加视频列表的功能 （由于接口没提供分页功能，未完成） */

        /* 提示已经到底 */
        setTimeout(() => {
            wx.showToast({
                title: '已经到底啦',
                icon: 'none'
            })
        }, 6000)
    },

    // 跳转至发现界面的回调
    handleToSearch() {
        wx.navigateTo({
            url: '/pages/search/search'
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
        // 此钩子函数要在全局app.json或者page.json中配置 "enablePullDownRefresh": true 才能触发

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage({ from }) {
        console.log(from)
        if (from === 'button') {
            return {
                title: '来自button的转发',
                page: '/pages/video/video',
                imageUrl: '/static/images/nvsheng.jpg'
            }
        } else {
            return {
                title: '来自menu的转发',
                page: '/pages/video/video',
                imageUrl: '/static/images/nvsheng.jpg'
            }
        }
    }
})