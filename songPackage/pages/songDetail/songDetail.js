import PubSub from 'pubsub-js'
import moment, { relativeTimeThreshold } from 'moment'

import request from '../../../utils/request'
// 获取全局实例
const appInstance = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: false, // 标识播放状态
        song: {}, //歌曲详情对象
        musicId: '', //歌曲ID
        musicLink: '', //歌曲链接
        currentTime: '00:00', // 实时时间
        durationTime: '00:00', // 总时长
        currentWidth: 0, // 实时播放进度条长度
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // options:用于接受路由跳转的query参数
        // 原生小程序中路由传参长度有限制

        // 接收页面跳转传递的参数
        let musicId = options.musicId
        // 更新到data中
        this.setData({
            musicId
        })
        // 获取音乐详情信息
        this.getMusicInfo(musicId)

        /* 解决操作系统与页面播放状态不一致的问题 */
        // 创建控制音乐播放的实例
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
        // 监听音乐播放/暂停/停止
        this.backgroundAudioManager.onPlay(() => { // 播放
            // 修改播放状态
            this.changePlayState(true)
            // 修改全局musicId
            appInstance.globalData.musicId = this.data.musicId // 这里必须拿data中的，否则出bug
            // console.log(musicId, this.data.musicId) // debug: 触发切换歌曲时，页面没有重新加载，musicId仍为旧Id
        })
        this.backgroundAudioManager.onPause(() => { // 暂停
            this.changePlayState(false)
        })
        this.backgroundAudioManager.onStop(() => { // 停止
            this.changePlayState(false)
        })
        // 监听音乐播放自然结束
        this.backgroundAudioManager.onEnded(() => {
            // 切换到下一首音乐，并自动播放
            this.switchMusic('next')
            // 重置播放时间 （backgrounAudioManager.currentTime有延迟）
            this.setData({
                currentTime: '00:00'
            })
        })

        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            // 获取并更新实时播放进度
            this.setCurrentTime()
        })

        /* 解决后台正在播放，重新进入songDetail页面出现的状态不一致的bug */
        if (appInstance.globalData.isMusicPlay) { // 后台正在播放
            if (appInstance.globalData.musicId == musicId) { // 后台在播放当前曲目 (不要用===，允许类型转换)
                this.setData({
                    isPlay: true,
                })
            } else { // 后台播放与当前点击的歌曲不同
                // 停止原先的播放
                this.changePlayState(false)
                // 重新播放
                this.musicControl(true, musicId)
            }
            return
        } else if (appInstance.globalData.musicId == musicId) { // 后台暂停，且点击的是同一首歌曲
            // 获取之前播放的进度
            this.setCurrentTime()
            return
        }
        // 进入页面后自动播放
        this.musicControl(true, musicId) // 存在bug
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

    // 修改播放状态的功能函数
    changePlayState(isPlay) {
        // 修改音乐是否播放的状态
        this.setData({ isPlay })
        // 修改全局音乐播放状态
        appInstance.globalData.isMusicPlay = isPlay
    },

    // 获取音乐详情的功能函数
    async getMusicInfo(musicId) {
        // 获取音乐详情
        let songData = await request('/song/detail', { ids: musicId })
        // 判断是否存在返回数据
        if (!songData.songs) {
            console.info('songData.songs: null')
            return
        }

        // 获取音乐播放链接 NOTICE: 在此处获取链接后更新数据，会出现按播放键时，数据还没请求到的问题。
        // let musicLinkData = await request('/song/url', { id: musicId }) 

        // 从歌曲详情中获取歌曲的总时长 moment(单位：ms).format()
        let durationTime = moment(songData.songs[0].dt).format('mm:ss')

        // 更新状态
        this.setData({
            song: songData.songs[0],
            durationTime
        })
        console.log('step1:', songData.songs[0]) // 偶尔出现继续播放时，重头播放的bug
        // 动态修改窗口标题
        wx.setNavigationBarTitle({
            title: this.data.song.name
        })
    },

    // 点击播放/暂定的回调
    handleMusicPlay() {
        let isPlay = !this.data.isPlay
        // 解构出数据
        let { musicId, musicLink } = this.data
        // 调用控制音乐播放/暂停的回调
        this.musicControl(isPlay, musicId, musicLink)
    },

    // 控制音乐播放/暂停功能的函数
    async musicControl(isPlay, musicId, musicLink) {
        // 若没有musicLink则发请求
        if (!musicLink) {
            // 获取音乐播放链接
            let musicLinkData = await request('/song/url', { id: musicId })
            musicLinkData.code == 200 ? musicLink = musicLinkData.data[0].url : ''
            // 解决musicLink请求成功但没有返回url导致musicLink为null
            if (musicLink) { // musicLink不为空
                // 将音乐链接更新到data中
                this.setData({
                    musicLink
                })
            } else { // musicLink为空
                // 提示资源不见
                wx.showModal({
                    title: '歌曲资源不见啦'
                })
                // 修改isPlay状态为false，不进入下面播放状态
                isPlay = false
                // 重置播放时间
                this.setData({
                    isPlay,
                    currentTime: '00:00',
                })
                console.info('musicLink: null')
            }
        }
        // 有musicLink进入判断
        if (isPlay) { // 播放
            // 判断是否为继续播放
            if (this.backgroundAudioManager.src == musicLink) {
                // 继续播放
                this.backgroundAudioManager.play()
                return
            }
            // backgroundAudioManager实例添加src属性会自动播放
            this.backgroundAudioManager.src = musicLink
            console.log('step2:musicLink更新:', musicLink) // 偶尔出现继续播放时，重头播放的bug
            // 但必须要有一个title属性，否则无法播放
            this.backgroundAudioManager.title = this.data.song.name
            this.backgroundAudioManager.epname = this.data.song.name
            this.backgroundAudioManager.singer = this.data.song.ar[0].name
            this.backgroundAudioManager.coverImgUrl = this.data.song.al.picUrl
        } else { // 暂停
            // 实例调用pause方法暂停播放
            this.backgroundAudioManager.pause()
        }
    },

    // 切换歌曲的回调
    handleSwitch(event) {
        // 获取切歌的类型
        let type = event.currentTarget.id
        // 调用切歌并自动播放的函数
        this.switchMusic(type)
    },

    // 控制切换歌曲并自动播放的功能函数 
    switchMusic(type) {
        // 订阅recommendSong传过来的musicId
        PubSub.subscribeOnce('musicId',async (_, musicId) => {
            // 暂停播放
            this.backgroundAudioManager.pause()
            // 获取音乐详情信息
            // this.getMusicInfo(musicId)
            await this.getMusicInfo(musicId) // 需要先返回musicInfo，但耗时增加
            // 自动播放
            this.musicControl(true, musicId)

            /* 解决自动切换下一首时musicId没有变化 */
            this.setData({
                musicId
            })
            // 修改全局音乐播放状态 
            appInstance.globalData.musicId = musicId

            // 取消订阅
            PubSub.unsubscribe('musicId')
        })

        // 发布消息到recommendSong页面
        PubSub.publish('switchType', type)
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