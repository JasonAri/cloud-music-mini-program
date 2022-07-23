import request from '../../../utils/request.js'
import moment, { relativeTimeThreshold } from 'moment'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: false, // 播放状态
        songs: [], // 歌曲列表
        index: 0, // 标志播放歌曲的索引值
        musicLink: '', //音乐url
        currentTime: '00:00', // 当前播放时间
        currentWidth: 0, // 实时播放长度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 修改窗口标题
        wx.setNavigationBarTitle({
            title: '私人FM'
        })
        wx.showLoading({ title: '加载中' })
        // 初始化获取歌曲列表
        this.getMusicList()
        // 创建背景音频实例
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
        // 监听背景音频实例点击播放
        this.backgroundAudioManager.onPlay(() => {
            this.setData({
                isPlay: true
            })
        })
        // 监听背景音频实例点击暂停
        this.backgroundAudioManager.onPause(() => {
            this.setData({
                isPlay: false
            })
        })
        // 监听音乐播放实例点击下一曲的时间（仅ios）
        this.backgroundAudioManager.onNext(() => {
            // 切换下一首
            this.switchMusic('next')
        })
        // 监听音乐播放自然结束
        this.backgroundAudioManager.onEnded(() => {
            // 切换到下一首音乐，并自动播放
            this.switchMusic('next')
        })
        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            // 获取并更新实时播放进度
            this.setCurrentTime()
        })
    },

    // 获取私人FM的歌曲信息的功能函数
    async getMusicList() {
        // 发请求
        let musicListData = await request('/personal_fm')
        // 判断状态码
        if (musicListData.code == 200) {
            let musicList = musicListData.data
            // 处理songs数据
            this.getSongs(musicList)
        } else {
            console.error(musicListData.code, musicListData.msg)
        }
    },

    // 重构歌曲列表的功能函数
    getSongs(musicList) {
        let { songs } = this.data
        for (let i = 0; i < musicList.length; i++) {
            songs.push({
                id: musicList[i].id,
                musicName: musicList[i].name,
                artists: musicList[i].artists[0].name,
                picUrl: musicList[i].album.picUrl,
                duration: moment(musicList[i].duration).format('mm:ss')
            })
        }
        // 将处理过的歌曲更新到data中
        this.setData({
            songs
        })
        wx.hideLoading()
    },

    // 获取并更新实时播放进度的功能函数
    setCurrentTime() { // 格式化实时播放的事件
        let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
        // 计算进度条长度
        let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 540
        // 更新实时时间
        this.setData({
            currentTime,
            currentWidth
        })
    },

    // 播放/暂停按钮的回调
    handleMusicPlay() {
        let isPlay = !this.data.isPlay
        this.setData({
            isPlay
        })
        let { index, musicLink } = this.data
        // 控制音乐播放
        this.musicControl(isPlay, index, musicLink)
    },

    // 控制音乐播放的功能函数
    async musicControl(isPlay, index, musicLink) {
        // 获取当前索引值的音乐url
        if (!musicLink) { // 若没有链接
            // 发请求拿musicLink
            let musicLinkData = await request('/song/url', { id: this.data.songs[index].id })
            if (musicLinkData.code == 200) {
                this.setData({
                    musicLink: musicLinkData.data[0].url
                })
            } else {
                console.error(musicLinkData.code, musicLinkData.msg)
            }
        }

        // 判断是否播放
        if (isPlay) { // 播放
            if (this.backgroundAudioManager.src == musicLink) { // 播放的是原先的歌曲
                this.backgroundAudioManager.play()
            } else {
                this.backgroundAudioManager.src = this.data.musicLink
                console.log('更新了src')
                this.backgroundAudioManager.title = this.data.songs[index].musicName
                this.backgroundAudioManager.epname = this.data.songs[index].musicName
                this.backgroundAudioManager.singer = this.data.songs[index].artists
                this.backgroundAudioManager.coverImgUrl = this.data.songs[index].picUrl
            }
        } else { // 暂停
            this.backgroundAudioManager.pause()
        }
    },

    // 切换按钮的回调
    handleSwitch(event) {
        // 获取切歌的类型
        let type = event.currentTarget.id
        this.switchMusic(type)
    },

    // 切换歌曲的功能函数
    async switchMusic(type) {
        if (type == 'next') { // 下一首
            let index = this.data.index + 1
            // 判断索引值是否超过songs的长度
            if (index >= this.data.songs.length) {
                // 获取歌曲列表
                await this.getMusicList()
                console.log('get more')
            }
            // 更新索引
            this.setData({ index })
            // 调用方法播放（不传入musicLink）
            this.musicControl(true, index)
        }
    },

    // 喜欢当前音乐的回调
    async handleLike() {
        let { index, songs } = this.data
        let musicId = songs[index].id
        // 发请求 喜欢该音乐
        let likeData = await request('/like', { id: musicId })
        if (likeData.code == 200) {
            // 显示成功喜欢该歌曲
            wx.showToast({
                title: '成功加入喜欢',
                icon: 'success'
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