/**
 * ArenaMatchWaitingScene - 竞技场比赛等待界面
 * 
 * 功能：
 * 1. 显示所有报名玩家列表（头像+昵称）
 * 2. 实时更新玩家加入信息
 * 3. 显示倒计时
 * 4. 等待阶段结束后自动进入游戏
 * 
 * 消息监听：
 * - arena_waiting_status: 等待阶段状态推送
 * - arena_waiting_tick: 倒计时每秒更新
 * - arena_player_joined_notify: 玩家加入广播
 * - arena_assign_start: 分配阶段开始
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 期号标签
        periodNoLabel: {
            type: cc.Label,
            default: null
        },
        // 房间名称标签
        roomNameLabel: {
            type: cc.Label,
            default: null
        },
        // 倒计时标签
        countdownLabel: {
            type: cc.Label,
            default: null
        },
        // 提示消息标签
        messageLabel: {
            type: cc.Label,
            default: null
        },
        // 玩家数量标签
        playerCountLabel: {
            type: cc.Label,
            default: null
        },
        // 玩家列表容器（ScrollView的content节点）
        playerListContainer: {
            type: cc.Node,
            default: null
        },
        // loading动画节点
        loadingNode: {
            type: cc.Node,
            default: null
        },
        // 阶段标签
        phaseLabel: {
            type: cc.Label,
            default: null
        },
        // 进度条
        progressBar: {
            type: cc.ProgressBar,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化数据
        this._periodNo = ""
        this._roomId = 0
        this._roomName = ""
        this._countdown = 60
        this._totalPlayers = 0
        this._enteredPlayers = 0
        this._players = []
        this._startTime = 0
        
        // 注册事件监听
        this._registerEvents()
        
        console.log("🏟️ [ArenaMatchWaiting] 等待界面加载完成")
    },

    start () {
        // 启动loading动画
        this._startLoadingAnimation()
        
        // 🔧【新增】从全局变量获取初始数据
        this._initFromGlobalData()
        
        // 🔧【新增】监听 room_joined 消息以进入游戏场景
        this._registerRoomJoinedHandler()
    },
    
    /**
     * 从全局变量初始化数据
     */
    _initFromGlobalData: function() {
        var myglobal = window.myglobal
        
        // 🔧【修复】优先检查缓存的状态数据（服务端推送的最新数据）
        if (myglobal && myglobal.arenaWaitingStatusCache) {
            var cachedData = myglobal.arenaWaitingStatusCache
            console.log("🏟️ [ArenaMatchWaiting] 发现缓存的等待状态数据，玩家数量:", cachedData.players ? cachedData.players.length : 0)
            
            // 检查期号是否匹配
            var expectedPeriodNo = myglobal.arenaWaitingData ? myglobal.arenaWaitingData.period_no : ""
            if (!expectedPeriodNo || cachedData.period_no === expectedPeriodNo) {
                this._periodNo = cachedData.period_no || ""
                this._roomId = cachedData.room_id || 0
                this._roomName = cachedData.room_name || ""
                this._countdown = cachedData.countdown || 60
                this._totalPlayers = cachedData.total_players || 0
                this._enteredPlayers = cachedData.entered_players || 1
                this._players = cachedData.players || []
                this._startTime = cachedData.start_time || Date.now()
                
                this._updateUI()
                
                console.log("🏟️ [ArenaMatchWaiting] 从缓存数据初始化完成，显示玩家:", this._players.length)
                
                // 清除缓存
                myglobal.arenaWaitingStatusCache = null
                return
            }
        }
        
        // 使用 arenaWaitingData（点击进入时设置的数据）
        if (myglobal && myglobal.arenaWaitingData) {
            var data = myglobal.arenaWaitingData
            this._periodNo = data.period_no || ""
            this._roomId = data.room_id || 0
            this._roomName = data.room_name || ""
            this._countdown = data.countdown || 60
            this._totalPlayers = data.total_players || 0
            this._enteredPlayers = data.entered_players || 1
            this._players = data.players || []
            this._startTime = data.start_time || Date.now()
            
            this._updateUI()
            
            console.log("🏟️ [ArenaMatchWaiting] 从全局变量初始化数据完成")
            
            // 🔧【修复】如果玩家列表为空，请求服务端推送状态
            if (this._players.length === 0) {
                console.log("🏟️ [ArenaMatchWaiting] 玩家列表为空，请求服务端推送状态")
                this._requestWaitingStatus()
            }
        }
    },
    
    /**
     * 🔧【新增】请求服务端推送等待状态
     */
    _requestWaitingStatus: function() {
        var myglobal = window.myglobal
        var socket = myglobal && myglobal.socket
        
        if (socket && socket.sendArenaEnter) {
            // 重新发送 arena_enter 请求，服务端会推送当前状态
            socket.sendArenaEnter({
                period_no: this._periodNo,
                room_id: this._roomId
            })
            console.log("🏟️ [ArenaMatchWaiting] 已请求服务端推送等待状态")
        }
    },
    
    /**
     * 监听 room_joined 消息以进入游戏场景
     */
    _registerRoomJoinedHandler: function() {
        var self = this
        var myglobal = window.myglobal
        var socket = myglobal && myglobal.socket
        
        if (socket && socket.onRoomJoined) {
            socket.onRoomJoined(function(roomData) {
                console.log("🏟️ [ArenaMatchWaiting] 收到 room_joined，准备进入游戏场景:", JSON.stringify(roomData))
                
                // 检查是否是竞技场房间
                var roomCategory = roomData.room_category || 1
                if (roomCategory !== 2) {
                    console.log("🏟️ [ArenaMatchWaiting] 不是竞技场房间，忽略")
                    return
                }
                
                // 转换数据格式
                var players = roomData.players || []
                var convertedRoomData = {
                    roomid: roomData.room_code || "ARENA",
                    room_code: roomData.room_code || "ARENA",
                    seatindex: roomData.player ? roomData.player.seat + 1 : 1,
                    playerdata: players.map(function(p, idx) {
                        return {
                            accountid: p.id,
                            nick_name: p.name,
                            avatarUrl: p.avatar || "avatar_1",
                            gold_count: p.gold_count || 0,
                            goldcount: p.gold_count || 0,
                            seatindex: (p.seat !== undefined ? p.seat : idx) + 1,
                            isready: p.ready || false,
                            arena_gold: p.arena_gold || 0,
                            match_coin: p.match_coin || 0,
                            period_no: p.period_no || ""
                        }
                    }),
                    housemanageid: roomData.creator_id || "",
                    creator_id: roomData.creator_id || "",
                    room_category: 2,
                    period_no: self._periodNo
                }
                
                // 保存转换后的房间数据
                if (myglobal) {
                    myglobal.roomData = convertedRoomData
                }
                
                // 进入游戏场景
                cc.director.loadScene("gameScene")
            })
        }
    },

    onDestroy () {
        // 取消事件监听
        this._unregisterEvents()
        
        // 停止动画
        this._stopLoadingAnimation()
    },

    // ============================================================
    // 事件监听
    // ============================================================

    _registerEvents: function() {
        var self = this
        
        // 监听等待状态推送
        if (window.myglobal && window.myglobal.socket) {
            var socket = window.myglobal.socket
            
            // 等待状态推送
            socket.on("arena_waiting_status_notify", function(data) {
                console.log("🏟️ [ArenaMatchWaiting] 收到等待状态:", JSON.stringify(data))
                self._onWaitingStatus(data)
            })
            
            // 倒计时更新
            socket.on("arena_waiting_tick_notify", function(data) {
                console.log("🏟️ [ArenaMatchWaiting] 倒计时更新:", data.countdown)
                self._onWaitingTick(data)
            })
            
            // 玩家加入广播
            socket.on("arena_player_joined_notify", function(data) {
                console.log("🏟️ [ArenaMatchWaiting] 玩家加入:", JSON.stringify(data))
                self._onPlayerJoined(data)
            })
            
            // 分配阶段开始
            socket.on("arena_assign_start_notify", function(data) {
                console.log("🏟️ [ArenaMatchWaiting] 分配阶段开始:", JSON.stringify(data))
                self._onAssignStart(data)
            })
        }
    },

    _unregisterEvents: function() {
        // 事件会随节点销毁自动取消
    },

    // ============================================================
    // 公共方法
    // ============================================================

    /**
     * 设置初始数据
     * @param {Object} data - { period_no, room_id, room_name, countdown, total_players, entered_players, players, message }
     */
    setData: function(data) {
        this._periodNo = data.period_no || ""
        this._roomId = data.room_id || 0
        this._roomName = data.room_name || ""
        this._countdown = data.countdown || 60
        this._totalPlayers = data.total_players || 0
        this._enteredPlayers = data.entered_players || 0
        this._players = data.players || []
        this._startTime = data.start_time || Date.now()
        
        this._updateUI()
    },

    // ============================================================
    // 事件处理
    // ============================================================

    _onWaitingStatus: function(data) {
        // 检查期号是否匹配
        if (this._periodNo && data.period_no !== this._periodNo) {
            return
        }
        
        this._periodNo = data.period_no
        this._roomId = data.room_id
        this._roomName = data.room_name
        this._countdown = data.countdown
        this._totalPlayers = data.total_players
        this._enteredPlayers = data.entered_players
        this._players = data.players
        this._startTime = data.start_time
        
        this._updateUI()
    },

    _onWaitingTick: function(data) {
        // 检查期号是否匹配
        if (this._periodNo && data.period_no !== this._periodNo) {
            return
        }
        
        this._countdown = data.countdown
        this._enteredPlayers = data.entered_players
        
        this._updateCountdownUI()
        this._updatePlayerCountUI()
    },

    _onPlayerJoined: function(data) {
        // 检查期号是否匹配
        if (this._periodNo && data.period_no !== this._periodNo) {
            return
        }
        
        // 更新玩家列表
        this._players = data.players || []
        this._enteredPlayers = data.entered_players
        this._totalPlayers = data.total_players
        
        // 显示加入提示
        var newPlayer = data.player
        if (newPlayer && newPlayer.player_name) {
            this._showJoinMessage(newPlayer.player_name + " 进入了比赛")
        }
        
        // 更新UI
        this._updatePlayerListUI()
        this._updatePlayerCountUI()
        this._updateProgressBar()
    },

    _onAssignStart: function(data) {
        // 检查期号是否匹配
        if (this._periodNo && data.period_no !== this._periodNo) {
            return
        }
        
        this._countdown = data.countdown
        this._totalPlayers = data.total_players
        this._enteredPlayers = data.total_players
        
        this._updateUI()
        
        // 显示分配消息
        if (this.messageLabel) {
            this.messageLabel.string = data.message || "正在分配玩家，即将进入游戏..."
            this.messageLabel.node.color = new cc.Color(255, 220, 100)
        }
    },

    // ============================================================
    // UI更新
    // ============================================================

    _updateUI: function() {
        // 更新期号
        if (this.periodNoLabel) {
            this.periodNoLabel.string = "期号: " + this._periodNo
        }
        
        // 更新房间名称
        if (this.roomNameLabel) {
            this.roomNameLabel.string = this._roomName || "竞技场"
        }
        
        // 更新倒计时
        this._updateCountdownUI()
        
        // 更新玩家数量
        this._updatePlayerCountUI()
        
        // 更新阶段显示
        this._updatePhaseUI()
        
        // 更新玩家列表
        this._updatePlayerListUI()
        
        // 更新进度条
        this._updateProgressBar()
    },

    _updateCountdownUI: function() {
        if (this.countdownLabel) {
            this.countdownLabel.string = this._countdown + "秒"
            
            // 最后10秒变红闪烁
            if (this._countdown <= 10 && this._countdown > 0) {
                this.countdownLabel.node.color = new cc.Color(255, 100, 100)
                this._startCountdownFlash()
            } else {
                this.countdownLabel.node.color = new cc.Color(255, 255, 255)
                this._stopCountdownFlash()
            }
        }
    },

    _updatePlayerCountUI: function() {
        if (this.playerCountLabel) {
            this.playerCountLabel.string = "已进入: " + this._enteredPlayers + " / " + this._totalPlayers
        }
    },

    _updatePhaseUI: function() {
        if (this.phaseLabel) {
            this.phaseLabel.string = "等待玩家进入"
            this.phaseLabel.node.color = new cc.Color(100, 200, 255)
        }
        
        // 更新提示消息
        if (this.messageLabel) {
            this.messageLabel.string = "等待其他玩家进入..."
            this.messageLabel.node.color = new cc.Color(200, 200, 220)
        }
    },

    // ============================================================
    // 玩家列表渲染
    // ============================================================

    _updatePlayerListUI: function() {
        if (!this.playerListContainer) return
        
        // 清空现有列表
        this.playerListContainer.removeAllChildren()
        
        // 计算布局参数
        var itemWidth = 120
        var itemHeight = 140
        var gapX = 20
        var gapY = 20
        var cols = 5 // 每行5个玩家
        
        // 计算容器宽度
        var containerWidth = this.playerListContainer.width || 700
        if (containerWidth < 100) {
            containerWidth = 700
        }
        
        // 重新计算每行可以放多少个
        cols = Math.floor((containerWidth + gapX) / (itemWidth + gapX))
        if (cols < 1) cols = 5
        
        // 添加玩家项
        for (var i = 0; i < this._players.length; i++) {
            var player = this._players[i]
            var row = Math.floor(i / cols)
            var col = i % cols
            
            var itemNode = this._createPlayerItem(player, i)
            
            // 计算位置（从左上角开始排列）
            var startX = -containerWidth / 2 + itemWidth / 2 + 10
            var startY = -itemHeight / 2 - 10
            
            var x = startX + col * (itemWidth + gapX)
            var y = startY - row * (itemHeight + gapY)
            
            itemNode.setPosition(x, y)
            itemNode.parent = this.playerListContainer
        }
        
        // 更新容器高度
        var rows = Math.ceil(this._players.length / cols)
        var contentHeight = rows * (itemHeight + gapY) + 20
        this.playerListContainer.setContentSize(containerWidth, Math.max(contentHeight, 200))
    },

    /**
     * 创建玩家项节点（头像 + 昵称在头像下面）
     */
    _createPlayerItem: function(player, index) {
        var itemNode = new cc.Node("PlayerItem_" + index)
        itemNode.setContentSize(cc.size(120, 140))
        
        // 创建头像节点
        var avatarNode = new cc.Node("Avatar")
        avatarNode.setContentSize(cc.size(80, 80))
        avatarNode.setPosition(0, 20) // 头像在上方
        
        var avatarSprite = avatarNode.addComponent(cc.Sprite)
        avatarSprite.type = cc.Sprite.Type.SIMPLE
        avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        
        // 加载头像
        this._loadPlayerAvatar(player.avatar, avatarSprite)
        
        // 创建圆形遮罩
        var maskNode = new cc.Node("AvatarMask")
        maskNode.setContentSize(cc.size(80, 80))
        maskNode.setPosition(0, 20)
        
        var mask = maskNode.addComponent(cc.Mask)
        mask.type = cc.Mask.Type.ELLIPSE
        mask.segements = 64
        
        // 将头像移到遮罩下
        avatarNode.parent = maskNode
        maskNode.parent = itemNode
        
        // 创建昵称节点（在头像下面）
        var nameNode = new cc.Node("NameLabel")
        nameNode.setPosition(0, -50)
        
        var nameLabel = nameNode.addComponent(cc.Label)
        nameLabel.string = player.player_name || ("玩家" + player.player_id)
        nameLabel.fontSize = 18
        nameLabel.lineHeight = 24
        nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        nameLabel.overflow = cc.Label.Overflow.CLAMP
        nameNode.setContentSize(cc.size(110, 24))
        
        // 机器人用灰色，真人用白色
        if (player.is_robot) {
            nameNode.color = new cc.Color(150, 150, 150)
        } else {
            nameNode.color = new cc.Color(255, 255, 255)
        }
        
        // 添加描边效果
        var outline = nameNode.addComponent(cc.LabelOutline)
        outline.color = new cc.Color(0, 0, 0)
        outline.width = 2
        
        nameNode.parent = itemNode
        
        // 机器人标识
        if (player.is_robot) {
            var robotTag = new cc.Node("RobotTag")
            robotTag.setPosition(35, 55)
            var tagLabel = robotTag.addComponent(cc.Label)
            tagLabel.string = "AI"
            tagLabel.fontSize = 14
            tagLabel.lineHeight = 18
            robotTag.color = new cc.Color(255, 200, 100)
            
            var tagOutline = robotTag.addComponent(cc.LabelOutline)
            tagOutline.color = new cc.Color(0, 0, 0)
            tagOutline.width = 1
            
            robotTag.parent = itemNode
        }
        
        return itemNode
    },

    /**
     * 加载玩家头像
     */
    _loadPlayerAvatar: function(avatarUrl, sprite) {
        if (!sprite) return
        
        // 如果没有头像URL，使用默认头像
        if (!avatarUrl) {
            cc.resources.load('UI/headimage/avatar_1', cc.SpriteFrame, function(err, spriteFrame) {
                if (!err && spriteFrame) {
                    sprite.spriteFrame = spriteFrame
                }
            })
            return
        }
        
        // 如果是网络URL
        if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
            cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, function(err, texture) {
                if (!err && texture && sprite && sprite.node && sprite.node.isValid) {
                    try {
                        var sf = new cc.SpriteFrame(texture)
                        sprite.spriteFrame = sf
                    } catch (e) {}
                }
            })
            return
        }
        
        // 本地资源路径
        cc.resources.load('UI/headimage/' + avatarUrl, cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame && sprite && sprite.node && sprite.node.isValid) {
                sprite.spriteFrame = spriteFrame
            }
        })
    },

    _updateProgressBar: function() {
        if (this.progressBar && this._totalPlayers > 0) {
            var progress = this._enteredPlayers / this._totalPlayers
            this.progressBar.progress = Math.min(progress, 1.0)
        }
    },

    // ============================================================
    // 提示消息
    // ============================================================

    _showJoinMessage: function(message) {
        // 创建浮动提示
        var tipNode = new cc.Node("JoinTip")
        tipNode.setPosition(0, 0)
        
        var label = tipNode.addComponent(cc.Label)
        label.string = message
        label.fontSize = 24
        label.lineHeight = 32
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        tipNode.color = new cc.Color(100, 255, 100)
        
        var outline = tipNode.addComponent(cc.LabelOutline)
        outline.color = new cc.Color(0, 0, 0)
        outline.width = 2
        
        tipNode.parent = this.node
        
        // 淡出动画
        tipNode.runAction(cc.sequence(
            cc.moveBy(1.5, cc.v2(0, 50)),
            cc.fadeOut(0.5),
            cc.removeSelf()
        ))
    },

    // ============================================================
    // 动画
    // ============================================================

    _startLoadingAnimation: function() {
        if (!this.loadingNode) return
        
        var rotateAction = cc.rotateBy(2, 360)
        var repeatAction = cc.repeatForever(rotateAction)
        this.loadingNode.runAction(repeatAction)
    },

    _stopLoadingAnimation: function() {
        if (this.loadingNode) {
            this.loadingNode.stopAllActions()
        }
    },

    _startCountdownFlash: function() {
        if (!this.countdownLabel) return
        
        // 闪烁效果
        this._flashAction = cc.sequence(
            cc.fadeTo(0.3, 128),
            cc.fadeTo(0.3, 255)
        )
        this._flashAction = cc.repeatForever(this._flashAction)
        this.countdownLabel.node.runAction(this._flashAction)
    },

    _stopCountdownFlash: function() {
        if (this.countdownLabel && this._flashAction) {
            this.countdownLabel.node.stopAction(this._flashAction)
            this.countdownLabel.node.opacity = 255
        }
    },

    // ============================================================
    // 按钮事件
    // ============================================================

    /**
     * 取消进入（返回大厅）
     */
    onCancelClick: function() {
        console.log("🏟️ [ArenaMatchWaiting] 玩家点击取消")
        
        // 发送取消进入请求
        if (window.myglobal && window.myglobal.socket) {
            window.myglobal.socket.emit("arena_cancel_enter", {
                period_no: this._periodNo,
                room_id: this._roomId
            })
        }
        
        // 返回大厅
        cc.director.loadScene("hallScene")
    }
});
