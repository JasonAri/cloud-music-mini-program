import request from '../../utils/request'

let timer = null // 初始化一个timer
Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent: '', // placeholder的内容
        hotList: [], // 热搜榜数据
        searchContent: '', //用户输入的表单项数据
        searchList: [], // 模糊搜索的数据
        historyList: [], // 搜索历史
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取初始化数据
        this.getInitData()
    },

    // 获取初始化的数据的功能函数
    async getInitData() {
        let placeholderData = await request('/search/default')
        let hotListData = await request('/search/hot/detail')
        // 解构data中的数据
        let { historyList } = this.data
        if (wx.getStorageSync('searchHistory')) {
            // 读取storage中的搜索历史
            historyList = wx.getStorageSync('searchHistory')
        }
        // 更新data
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hotListData.data,
            historyList
        })
    },

    // 表单项内容发生改变的回调
    handleInputChange(event) {
        // 更新searchContent的状态数据
        this.setData({
            searchContent: event.detail.value.trim()
        })

        /* // 函数防抖 （频繁调用接口，暂时不开放）
        clearTimeout(timer)
        timer = setTimeout(() => {
            // 调用函数 发请求获取searchList
            this.getSearchList()
        }, 300) */
    },

    // 获取searchList的功能函数 
    async getSearchList() {
        // 搜索词为空不发请求
        if (!this.data.searchContent) {
            this.setData({
                searchList: []
            })
            return
        }
        // 发请求获取关键字模糊匹配数据
        let searchListData = await request('/search', { keywords: this.data.searchContent, limit: 10 })
        // 更新数据
        this.setData({ searchList: searchListData.result.songs })
    },

    // 搜索历史记录缓存的功能函数
    setHistoryList() {
        // 解构数据
        let { searchContent, historyList } = this.data
        // 判断缓存是否存在
        if (historyList.indexOf(searchContent) !== -1) { // 若已存在
            // 则删除
            historyList.splice(historyList.indexOf(searchContent), 1)
        }
        // 将搜索的关键字添加到搜索历史记录列表汇总
        historyList.unshift(searchContent)
        // 更新data中的数据
        this.setData({
            historyList
        })
        // 将历史记录存储在storage中
        wx.setStorageSync('searchHistory', historyList)
    },

    // 清空搜索框内容的回调
    handleClearSearchContent(event) {
        // 清空data中searchContent的内容
        this.setData({
            searchContent: '',
            searchList: [],
        })
    },

    // 清空搜索历史的回调
    handleDeleteHistory(event) {
        // 显示模态框
        wx.showModal({
            content: '确认删除吗？',
            success: (res) => {
                // 判断confirm为真时，执行清空的功能
                if (res.confirm) {
                    // 清空data中的historyList
                    this.setData({
                        historyList: []
                    })
                    // 移除本地的历史记录缓存
                    wx.removeStorageSync('searchHistory')
                }
            }
        })

    },

    // 取消按钮的回调
    handleCancel() {
        wx.navigateBack()
    },

    // 搜索按钮的回调
    async handleSearch() {
        // 发请求获取搜索结果
        await this.getSearchList()
        // 更新缓存搜索历史
        this.setHistoryList()
    },

    // 点击搜索项跳转歌曲播放页面
    toSongDetail(event) {
        // 获取当前点击时间的id标识
        console.log(event)
        // 携带参数跳转
        wx.navigateTo({
            url: '/songPackage/pages/songDetail/songDetail' + song.id
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