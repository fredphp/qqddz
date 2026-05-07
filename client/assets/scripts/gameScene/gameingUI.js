// 使用全局变量，不使用 require
// 【彻底修复版本】服务端数据为唯一数据源
// 
// 核心原则：
// 1. handCards 是唯一数据源，保存服务端原始数据
// 2. 禁止任何数据转换、排序、重新计算
// 3. renderCards() 是唯一渲染入口
// 4. 动画只是视觉效果，绝不能修改数据
// 5. clearAllCards() 清理所有旧节点（解决背面牌残留）

var isopen_sound = window.isopen_sound || 1
var qian_state = window.qian_state || { buqiang: 0, qian: 1 }
var CardsValue = window.CardsValue || {}
var RoomState = window.RoomState || {}

// 音效缓存
var _audioClips = {}

// 牌布局配置
var CardLayout = {
    cardScale: 0.8,
    cardY: -250,
    cardSpacing: 35,
    bottomCardScale: 0.4,
    bottomCardSpacing: 25,
    outCardScale: 0.5,
    outCardSpacing: 25,
}

// 发牌动画配置
var DealConfig = {
    animDuration: 0.12,
    deckPosition: cc.v2(0, 100),
    cardInterval: 80,
}

// 加载并播放音效
function playSound(path) {
    if (!isopen_sound) return null
    if (_audioClips[path]) {
        return cc.audioEngine.play(_audioClips[path], false, 1)
    }
    cc.resources.load(path, cc.AudioClip, function(err, clip) {
        if (err) {
            console.log("加载音效失败:", path, err)
            return
        }
        _audioClips[path] = clip
        cc.audioEngine.play(clip, false, 1)
    })
    return null
}

cc.Class({
    extends: cc.Component,
    name: 'gameingUI',

    properties: {
        gameingUI: cc.Node,
        card_prefab: cc.Prefab,
        robUI: cc.Node,
        bottom_card_pos_node: cc.Node,
        playingUI_node: cc.Node,
        tipsLabel: cc.Label,
        cards_node: cc.Node,  // 手牌节点容器
        // 🕐【新增】倒计时Label引用
        bidCountdownLabel: cc.Label,    // 抢地主倒计时
        playCountdownLabel: cc.Label,   // 出牌倒计时
        // 🔊【新增】滴答音效（3秒催促音效）
        tickAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    onLoad () {
        var myglobal = window.myglobal
        if (!myglobal) {
            console.error("myglobal 未定义")
            return
        }
        
        // ============================================================
        // 【核心】唯一数据源 - 服务端原始手牌数据
        // 【重要】禁止任何修改、排序、转换
        // ============================================================
        this.handCards = []           // 【唯一数据源】服务端原始手牌
        this.bottomCards = []         // 底牌数据
        this.choose_card_data = []    // 选中的牌
        
        // 抢地主相关
        this.rob_player_accountid = 0
        this._biddingPhase = "idle"
        this.cardsReady = false
        
        // 🕐【倒计时系统】
        this._bidTimeout = 0
        this._playTimeout = 0
        this._bidCountdownTimer = null
        this._playCountdownTimer = null
        this._bidTimeLeft = 0
        this._playTimeLeft = 0
        this._isBidCountdownTicking = false
        this._isPlayCountdownTicking = false
        this._isBidWarning = false
        this._isPlayWarning = false
        
        // 底牌节点
        this.bottom_card = []
        
        // ============ 服务器消息监听 ============
        
        // 【核心】监听服务器发牌消息 - 唯一数据入口
        myglobal.socket.onPushCards(function(data){
            console.log("🃏 ========== 服务端发牌消息 ==========")
            console.log("🃏 服务端原始手牌:", JSON.stringify(data.cards))
            console.log("🃏 服务端原始底牌:", JSON.stringify(data.bottom_cards))
            
            // 【核心】直接保存服务端数据，不做任何转换
            this.handCards = data.cards || []
            this.bottomCards = data.bottom_cards || []
            
            // 【核心】唯一渲染入口
            this.renderCards(this.handCards)
        }.bind(this))

        // 监听叫地主轮次（旧版消息，仅用于兼容）
        // 🔧【修复】不再在此处处理，统一由 onCallLandlordTurn 处理
        myglobal.socket.onBidTurn(function(data){
            console.log("🎯 [BID_TURN-兼容] 收到叫地主轮次（已由onCallLandlordTurn处理）")
            // 不再处理，避免重复
        }.bind(this))

        // 监听叫地主结果
        myglobal.socket.onBidResult(function(data){
            console.log("🎯 [BID_RESULT] 收到叫地主结果:", JSON.stringify(data))
            // 🔒【重要】收到结果，停止倒计时
            this._stopBidCountdown()
            if (this.node && this.node.parent) {
                this.node.parent.emit("bid_result_event", {
                    player_id: data.accountid,
                    bid: data.state
                })
            }
        }.bind(this))

        // 监听抢地主轮次（旧版消息，仅用于兼容）
        // 🔧【修复】不再在此处处理，统一由 onCallLandlordTurn 处理
        myglobal.socket.onCanRobState(function(data){
            console.log("🎯 [ROB_TURN-兼容] 收到抢地主轮次（已由onCallLandlordTurn处理）")
            // 不再处理，避免重复
        }.bind(this))

        // 监听出牌轮次
        myglobal.socket.onCanChuCard(function(data){
            console.log("🎮 [CAN_CHU_CARD] 收到出牌轮次:", JSON.stringify(data))
            var playerId = data.player_id || data
            var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID

            // 🔒【重要】先停止之前的倒计时（服务器轮转了）
            this._stopPlayCountdown()

            if (String(playerId) === String(myPlayerId)) {
                console.log("🎮 [CAN_CHU_CARD] 轮到我出牌，显示UI")
                this._hideRobUI()
                this.clearOutZone(myPlayerId)
                this.playingUI_node.active = true
                this._playTimeout = data.timeout || 15
                this._startPlayCountdown()
            } else {
                console.log("🎮 [CAN_CHU_CARD] 等待其他玩家出牌，隐藏出牌UI")
                if (this.playingUI_node) {
                    this.playingUI_node.active = false
                }
            }
        }.bind(this))

        // 监听其他玩家出牌
        myglobal.socket.onOtherPlayerChuCard(function(data){
            console.log("🎮 [OTHER_CHU_CARD] 收到其他玩家出牌:", JSON.stringify(data))

            // 🔒【重要】收到其他玩家出牌，停止我的倒计时
            this._stopPlayCountdown()
            if (this.playingUI_node) {
                this.playingUI_node.active = false
            }

            if (data.is_pass) return
            if (!this.node || !this.node.parent) return

            var gameScene_script = this.node.parent.getComponent("gameScene")
            if (!gameScene_script) return

            var outCard_node = gameScene_script.getUserOutCardPosByAccount(data.accountid)
            if (!outCard_node || !this.card_prefab) return

            // 【重要】直接使用服务端数据创建节点
            var node_cards = []
            for (var i = 0; i < data.cards.length; i++) {
                var card = cc.instantiate(this.card_prefab)
                if (card) {
                    var cardScript = card.getComponent("card")
                    if (cardScript) {
                        cardScript.showCards(data.cards[i], myglobal.playerData.accountID)
                    }
                    node_cards.push(card)
                }
            }
            this.showOutCards(outCard_node, node_cards)

            // 更新剩余牌数
            if (data.cards_left !== undefined) {
                this.node.parent.emit("update_card_count_event", {
                    accountid: data.accountid,
                    count: data.cards_left
                })
            }
        }.bind(this))

        // 监听抢地主阶段开始
        myglobal.socket.onCallLandlordStart(function(data){
            console.log("🎯 [CALL_LANDLORD_START] 抢地主阶段开始:", JSON.stringify(data))
            this._biddingPhase = "bidding"
        }.bind(this))

        // 监听抢地主轮次
        myglobal.socket.onCallLandlordTurn(function(data){
            console.log("🎯 [CALL_LANDLORD_TURN] 轮到玩家抢地主:", JSON.stringify(data))
            this._processCallLandlordTurn(data)
        }.bind(this))

        // 监听抢地主结果
        myglobal.socket.onCallLandlordResult(function(data){
            console.log("🎯 [CALL_LANDLORD_RESULT] 抢地主结果:", JSON.stringify(data))
            // 🔒【重要】收到结果，停止倒计时
            this._stopBidCountdown()
            if (this.node && this.node.parent) {
                this.node.parent.emit("call_landlord_result_event", data)
            }
        }.bind(this))

        // 监听抢地主阶段结束
        myglobal.socket.onCallLandlordEnd(function(data){
            console.log("🎯 [CALL_LANDLORD_END] 抢地主阶段结束:", JSON.stringify(data))
            // 🔒【重要】停止所有倒计时
            this._stopBidCountdown()
            this._hideRobUI()
            this._biddingPhase = "idle"
        }.bind(this))

        // 监听游戏状态恢复
        myglobal.socket.onGameStateRestore(function(data){
            console.log("🔄 [gameingUI] 收到游戏状态恢复事件")
            this.restoreGameState(data)
        }.bind(this))

        // 内部事件：显示底牌
        this.node.on("show_bottom_card_event", function(data){
            console.log("show_bottom_card_event")
            this.bottomCards = data
            
            for (var i = 0; i < data.length; i++) {
                var card = this.bottom_card[i]
                if (!card) continue
                
                var cardScript = card.getComponent("card")
                if (cardScript) {
                    cardScript.showCards(data[i])
                }
            }
            
            var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.accountID
            if (myPlayerId == myglobal.playerData.master_accountid) {
                this.scheduleOnce(this.pushThreeCard, 0.2)
            }
        }.bind(this))

        // 注册监听选择牌消息
        this.node.on("choose_card_event", function(event){
            this.choose_card_data.push(event)
        }.bind(this))

        this.node.on("unchoose_card_event", function(event){
            // 🔧【修复】正确匹配卡牌的唯一标识符（suit + rank）
            // event 现在是 {suit, rank} 对象
            console.log("🃏 [unchoose_card_event] 收到取消选牌: suit=" + event.suit + ", rank=" + event.rank)
            console.log("🃏 [unchoose_card_event] 当前已选牌数: " + this.choose_card_data.length)
            for (var i = 0; i < this.choose_card_data.length; i++) {
                var cardid = this.choose_card_data[i].cardid
                // 检查是否匹配（兼容新旧两种格式）
                if (cardid && cardid.suit !== undefined && cardid.rank !== undefined) {
                    // 新格式：cardid 是对象 {suit, rank}
                    if (cardid.suit === event.suit && cardid.rank === event.rank) {
                        console.log("🃏 [unchoose_card_event] 找到匹配的牌，移除: suit=" + cardid.suit + ", rank=" + cardid.rank)
                        this.choose_card_data.splice(i, 1)
                        break
                    }
                } else if (cardid == event) {
                    // 旧格式兼容：cardid 是数字
                    console.log("🃏 [unchoose_card_event] 找到匹配的牌（旧格式），移除: " + cardid)
                    this.choose_card_data.splice(i, 1)
                    break
                }
            }
            console.log("🃏 [unchoose_card_event] 移除后已选牌数: " + this.choose_card_data.length)
        }.bind(this))
    },

    start () {},
    
    onDestroy () {
        this._stopPlayCountdown()
        this._stopBidCountdown()
    },

    // ============================================================
    // 【核心】唯一渲染入口
    // ============================================================
    
    /**
     * 【核心】渲染手牌 - 唯一入口
     * @param {Array} cards - 服务端原始手牌数据
     */
    renderCards: function(cards) {
        console.log("🃏 [renderCards] ========== 开始渲染手牌 ==========")
        console.log("🃏 [renderCards] 手牌数量:", cards ? cards.length : 0)
        
        if (!cards || cards.length === 0) {
            console.error("🃏 [renderCards] 手牌数据为空")
            return
        }
        
        // 🔥【防重复渲染】检查是否与上次相同
        var hash = JSON.stringify(cards)
        if (this._lastRenderHash === hash) {
            console.warn("🃏 [renderCards] 重复渲染被拦截")
            return
        }
        this._lastRenderHash = hash
        
        // 打印服务端原始数据
        console.log("🃏 服务端原始牌序:")
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i]
            console.log("🃏 服务端牌[" + i + "]: suit=" + c.suit + ", rank=" + c.rank)
        }
        
        // 【核心】使用斗地主规则排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
        // ⚠️【禁止修改】排序逻辑保持不变
        var sortedCards = this._sortCards(cards)
        
        // 打印排序后数据
        console.log("🃏 客户端排序后牌序:")
        for (var i = 0; i < sortedCards.length; i++) {
            var c = sortedCards[i]
            console.log("🃏 排序后牌[" + i + "]: suit=" + c.suit + ", rank=" + c.rank + ", value=" + this.getCardValue(c))
        }
        
        // 【核心】清理所有旧节点（解决背面牌残留）
        this.clearAllCards()
        
        // 创建底牌节点
        this._createBottomCards()
        
        // 隐藏出牌UI
        if (this.playingUI_node) {
            this.playingUI_node.active = false
        }
        
        // 🎬【修复】使用逐张发牌动画
        this._dealCardsWithAnimation(sortedCards)
    },
    
    /**
     * 🎬【新增】逐张发牌动画
     * @param {Array} sortedCards - 已排序的手牌数据
     */
    _dealCardsWithAnimation: function(sortedCards) {
        console.log("🎬 [_dealCardsWithAnimation] 开始逐张发牌动画，牌数:", sortedCards.length)
        
        var self = this
        var myglobal = window.myglobal
        var cardInterval = DealConfig.cardInterval / 1000  // 转换为秒
        var animDuration = DealConfig.animDuration
        
        // 发牌起始位置（屏幕中央上方，模拟发牌堆）
        var deckPos = cc.v2(DealConfig.deckPosition.x, DealConfig.deckPosition.y)
        
        // 逐张发牌
        for (var i = 0; i < sortedCards.length; i++) {
            (function(index) {
                self.scheduleOnce(function() {
                    var cardData = sortedCards[index]
                    var targetX = self._getCardX(index, sortedCards.length, CardLayout.cardSpacing)
                    var targetPos = cc.v2(targetX, CardLayout.cardY)
                    
                    // 创建卡牌节点
                    var card = cc.instantiate(self.card_prefab)
                    if (!card) return
                    
                    card.scale = CardLayout.cardScale
                    card.parent = self.cards_node || self.node.parent
                    
                    // 🎬 从发牌堆位置开始
                    card.setPosition(deckPos)
                    card.active = true
                    card.zIndex = index
                    
                    // 设置卡牌显示
                    var cardComp = card.getComponent("card")
                    if (cardComp) {
                        cardComp.showCards(cardData, myglobal.playerData.accountID)
                    }
                    
                    // 🎬 播放发牌动画
                    cc.tween(card)
                        .to(animDuration, { position: targetPos }, { easing: 'sineOut' })
                        .call(function() {
                            // 动画完成回调
                        })
                        .start()
                    
                    // 🔊 播放发牌音效
                    if (isopen_sound) {
                        playSound("sound/fapai1")
                    }
                    
                    console.log("🎬 [_dealCardsWithAnimation] 发牌 " + (index + 1) + "/" + sortedCards.length)
                    
                }, index * cardInterval)
            })(i)
        }
        
        // 发牌完成后回调
        var totalDealTime = sortedCards.length * cardInterval + animDuration
        this.scheduleOnce(function() {
            self._onDealCardsComplete(sortedCards)
        }, totalDealTime)
    },
    
    /**
     * 🎬【新增】发牌完成回调
     * @param {Array} sortedCards - 已排序的手牌数据
     */
    _onDealCardsComplete: function(sortedCards) {
        console.log("🎬 [_onDealCardsComplete] 发牌动画完成")
        
        // 标记就绪
        this.cardsReady = true
        this.fapai_end = true
        
        console.log("🃏 [renderCards] 渲染完成，节点数量:", sortedCards.length)
        
        // 通知其他玩家节点
        if (this.node.parent) {
            this.node.parent.emit("pushcard_other_event")
        }
        
        // 检查是否需要显示抢地主按钮
        this._checkAndShowRobUI()
    },
    
    /**
     * 【核心】计算牌力值（斗地主规则）
     * 大王=15, 小王=14, 2=13, A=12, K=11, Q=10, J=9, 10=8, ..., 3=1
     * @param {Object} card - 卡牌数据
     * @returns {Number} 牌力值
     */
    getCardValue: function(card) {
        var rank = card.rank
        
        if (rank === 3) return 1   // 3
        if (rank === 4) return 2   // 4
        if (rank === 5) return 3   // 5
        if (rank === 6) return 4   // 6
        if (rank === 7) return 5   // 7
        if (rank === 8) return 6   // 8
        if (rank === 9) return 7   // 9
        if (rank === 10) return 8  // 10
        if (rank === 11) return 9  // J
        if (rank === 12) return 10 // Q
        if (rank === 13) return 11 // K
        if (rank === 14) return 12 // A
        if (rank === 15) return 13 // 2
        if (rank === 16) return 14 // 小王
        if (rank === 17) return 15 // 大王
        
        return 0
    },
    
    /**
     * 【核心】使用 getCardValue 排序手牌
     * 斗地主标准排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
     * @param {Array} cards - 服务端原始手牌数据
     * @returns {Array} 排序后的手牌数据
     */
    _sortCards: function(cards) {
        var self = this
        // 复制数组，避免修改原数据
        var sortedCards = cards.slice()
        
        // 使用 getCardValue 从大到小排序
        sortedCards.sort(function(a, b) {
            var valueA = self.getCardValue(a)
            var valueB = self.getCardValue(b)
            
            // 先按 value 从大到小排序
            if (valueA !== valueB) {
                return valueB - valueA
            }
            // value 相同时，按花色排序（黑桃 > 红心 > 梅花 > 方块）
            return a.suit - b.suit
        })
        
        return sortedCards
    },
    
    /**
     * 【核心】清理所有旧节点（解决背面牌残留）
     * 🔥【修复】同时清理 cards_node 和 node.parent，确保无残留
     */
    clearAllCards: function() {
        console.log("🃏 [clearAllCards] 清空所有旧手牌节点")
        
        // 🔥【修复】1. 清理 cards_node 中的手牌
        if (this.cards_node) {
            var count1 = this.cards_node.children.length
            this.cards_node.removeAllChildren()
            console.log("🃏 [clearAllCards] 清理 cards_node: " + count1 + " 个节点")
        }
        
        // 🔥【修复】2. 同时清理 node.parent 中可能存在的手牌节点
        // 防止历史遗留问题（之前可能在 node.parent 创建过节点）
        if (this.node.parent) {
            var children = this.node.parent.children
            var destroyed = 0
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i]
                var cardComp = child.getComponent("card")
                if (cardComp) {
                    child.destroy()
                    destroyed++
                }
            }
            if (destroyed > 0) {
                console.log("🃏 [clearAllCards] 清理 node.parent 中的残留节点: " + destroyed + " 个")
            }
        }
        
        // 🔥【修复】3. 清空选中的牌数据
        this.choose_card_data = []
        
        console.log("🃏 [clearAllCards] 清空完成")
    },
    
    /**
     * 计算牌的X坐标
     */
    _getCardX: function(index, count, spacing) {
        var totalWidth = (count - 1) * spacing
        var startX = -totalWidth / 2
        return startX + index * spacing
    },

    // ============================================================
    // 底牌相关
    // ============================================================
    
    /**
     * 创建底牌显示（牌背）
     */
    _createBottomCards: function() {
        // 清理旧底牌
        if (this.bottom_card) {
            for (var i = 0; i < this.bottom_card.length; i++) {
                if (this.bottom_card[i]) {
                    this.bottom_card[i].destroy()
                }
            }
        }
        this.bottom_card = []
        
        if (!this.bottom_card_pos_node || !this.card_prefab) return
        
        var bottomY = this.bottom_card_pos_node.y
        var bottomStartX = this.bottom_card_pos_node.x - CardLayout.bottomCardSpacing
        
        for (var i = 0; i < 3; i++) {
            var di_card = cc.instantiate(this.card_prefab)
            if (!di_card) continue
            
            di_card.scale = CardLayout.bottomCardScale
            di_card.setPosition(bottomStartX + CardLayout.bottomCardSpacing * i, bottomY)
            di_card.parent = this.node.parent
            di_card.active = true
            this.bottom_card.push(di_card)
        }
    },

    // ============================================================
    // 叫地主/抢地主相关
    // ============================================================

    _checkAndShowRobUI: function() {
        var myglobal = window.myglobal
        if (!myglobal) return
        
        var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID
        if (this.rob_player_accountid == myPlayerId && this.cardsReady && this.robUI && !this.robUI.active) {
            if (this._biddingPhase === "bidding") {
                this._showBidUI("叫地主", "不叫")
            } else {
                this._showBidUI("抢地主", "不抢")
            }
        }
    },

    _processCallLandlordTurn: function(data) {
        var myglobal = window.myglobal
        if (!myglobal) return

        var playerId = data.player_id
        var timeout = data.timeout || 15
        var round = data.round || 1

        console.log("🎯 [_processCallLandlordTurn] 轮次消息: playerId=" + playerId + ", timeout=" + timeout + ", round=" + round)

        // 🔒【重要】先停止之前的倒计时（服务器轮转了）
        this._stopBidCountdown()

        this.rob_player_accountid = playerId
        this._bidTimeout = timeout
        this._biddingPhase = round === 1 ? "bidding" : "robbing"

        var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID

        if (String(playerId) === String(myPlayerId) && this.cardsReady) {
            console.log("🎯 [_processCallLandlordTurn] 轮到我操作，显示UI")
            if (round === 1) {
                this._showBidUI("叫地主", "不叫")
            } else {
                this._showBidUI("抢地主", "不抢")
            }
        } else {
            console.log("🎯 [_processCallLandlordTurn] 等待其他玩家操作，隐藏UI")
            this._hideRobUI()
            if (this.node && this.node.parent) {
                this.node.parent.emit("call_landlord_turn_event", {
                    player_id: playerId,
                    timeout: timeout,
                    round: round
                })
            }
        }
    },

    _showBidUI: function(confirmText, cancelText) {
        if (!this.robUI) return
        
        if (this.playingUI_node) {
            this.playingUI_node.active = false
        }
        
        var confirmBtn = this.robUI.getChildByName("btn_qiandz")
        var cancelBtn = this.robUI.getChildByName("btn_buqiandz")
        
        if (confirmBtn) {
            var label = confirmBtn.getChildByName("Label")
            if (label && label.getComponent(cc.Label)) {
                label.getComponent(cc.Label).string = confirmText
            }
        }
        
        if (cancelBtn) {
            var label = cancelBtn.getChildByName("Label")
            if (label && label.getComponent(cc.Label)) {
                label.getComponent(cc.Label).string = cancelText
            }
        }
        
        this.robUI.active = true
        this._startBidCountdown()
        
        if (this.node && this.node.parent) {
            // 🔧【修复】传递包含 timeout 的对象
            this.node.parent.emit("canrob_event", {
                player_id: this.rob_player_accountid,
                timeout: this._bidTimeout || 15
            })
        }
    },
    
    _hideRobUI: function() {
        if (this.robUI) {
            this.robUI.active = false
        }
        this._stopBidCountdown()
    },
    
    // ============================================================
    // 🕐【倒计时系统】标准斗地主倒计时（带分段催促效果）
    // ============================================================

    /**
     * 🕐【统一入口】开始抢地主倒计时
     * @param {number} duration - 倒计时秒数，默认15秒
     */
    _startBidCountdown: function(duration) {
        var self = this
        // 🔒【防护】先停止之前的倒计时
        this._stopBidCountdown()

        var timeout = duration || this._bidTimeout || 15
        this._bidTimeLeft = timeout
        this._isBidCountdownTicking = true
        this._isBidWarning = false

        console.log("🕐 [倒计时] 开始抢地主倒计时: " + timeout + "秒")

        // 🕐 初始化UI显示
        this._updateBidCountdownUI()

        // 🕐 使用 cc.Node 的 schedule 实现每秒 tick
        this.schedule(this._bidCountdownTick, 1)
    },

    /**
     * 🕐【核心Tick】抢地主倒计时每秒执行
     */
    _bidCountdownTick: function() {
        if (!this._isBidCountdownTicking) return

        this._bidTimeLeft--
        console.log("🕐 [倒计时] 抢地主剩余: " + this._bidTimeLeft + "秒")

        // 🕐 更新UI显示
        this._updateBidCountdownUI()

        // ⚠️ 5秒：进入警告状态
        if (this._bidTimeLeft === 5) {
            this._enterBidWarningState()
        }

        // 🔊 3秒：开始滴答音（每秒一次）
        if (this._bidTimeLeft <= 3 && this._bidTimeLeft > 0) {
            this._playTickSound()
        }

        // ⏰ 0秒：自动处理
        if (this._bidTimeLeft <= 0) {
            this._onBidCountdownEnd()
        }
    },

    /**
     * 🕐【UI更新】更新抢地主倒计时显示
     * 🔧【深度修复】增强 Label 查找逻辑，强制设置可见性和渲染
     */
    _updateBidCountdownUI: function() {
        var remaining = this._bidTimeLeft
        var updated = false
        var countdownLabelNode = null

        console.log("🕐 [_updateBidCountdownUI] ========== 开始更新倒计时 ==========")
        console.log("🕐 [_updateBidCountdownUI] 剩余时间: " + remaining + "秒")
        console.log("🕐 [_updateBidCountdownUI] this.robUI 存在: " + !!this.robUI)
        console.log("🕐 [_updateBidCountdownUI] this.robUI.active: " + (this.robUI ? this.robUI.active : "N/A"))

        // 方式1：使用 properties 绑定的 Label
        if (this.bidCountdownLabel) {
            this.bidCountdownLabel.string = String(remaining)
            countdownLabelNode = this.bidCountdownLabel.node
            console.log("🕐 [_updateBidCountdownUI] ✓ 通过 bidCountdownLabel 更新")
            updated = true
        }

        // 方式2：尝试从 robUI 中查找倒计时 Label
        if (this.robUI) {
            console.log("🕐 [_updateBidCountdownUI] robUI 子节点列表:")
            for (var i = 0; i < this.robUI.children.length; i++) {
                console.log("  - " + this.robUI.children[i].name)
            }
            
            // 🔧【修复】检查 clock 子节点中的 Label（这是正确的路径）
            var clockNode = this.robUI.getChildByName("clock")
            console.log("🕐 [_updateBidCountdownUI] clockNode 存在: " + !!clockNode)
            
            if (clockNode) {
                console.log("🕐 [_updateBidCountdownUI] clock 子节点数量: " + clockNode.children.length)
                var children = clockNode.children
                for (var j = 0; j < children.length; j++) {
                    var child = children[j]
                    console.log("🕐 [_updateBidCountdownUI] 检查子节点: " + child.name)
                    var label = child.getComponent(cc.Label)
                    console.log("🕐 [_updateBidCountdownUI] " + child.name + " 有 Label 组件: " + !!label)
                    
                    if (label) {
                        // 🔧【关键修复】先设置字符串
                        label.string = String(remaining)
                        countdownLabelNode = child
                        
                        // 🔧【强制设置】确保节点可见
                        child.active = true
                        child.opacity = 255
                        
                        // 🔧【强制设置】确保 Label 可见
                        label.fontSize = 32
                        label.lineHeight = 40
                        label.enableWrapText = false
                        
                        // 🔧【关键修复】设置内容大小（确保能显示两位数）
                        child.setContentSize(50, 50)
                        
                        // 🔧【关键】设置节点颜色为白色（影响 Label 渲染）
                        child.color = new cc.Color(255, 255, 255, 255)
                        
                        // 🔧【额外保障】设置 Label 节点的 z-index 确保在最上层
                        child.zIndex = 100
                        
                        // 🔧【确保父节点正确】
                        if (child.parent !== clockNode) {
                            child.parent = clockNode
                        }
                        
                        // 🔧【确保节点在正确位置】
                        child.setPosition(0, -3)
                        
                        // 🔧【调试】打印设置后的值
                        console.log("🕐 [_updateBidCountdownUI] ✅ 成功更新 Label:")
                        console.log("  - 节点名: " + child.name)
                        console.log("  - 显示文本: " + label.string)
                        console.log("  - 节点颜色: " + JSON.stringify(child.color))
                        console.log("  - 节点透明度: " + child.opacity)
                        console.log("  - 节点位置: " + JSON.stringify(child.position))
                        console.log("  - 节点内容大小: " + JSON.stringify(child.getContentSize()))
                        console.log("  - 字体大小: " + label.fontSize)
                        
                        updated = true
                        break
                    }
                }
            }
            
            // 备选：直接查找 clock_ Label
            if (!updated) {
                console.log("🕐 [_updateBidCountdownUI] 尝试备选方案查找 Label...")
                var labelNames = ["clock_ Label", "clock_Label", "time_label", "countdown", "timer", "time"]
                for (var i = 0; i < labelNames.length; i++) {
                    var labelNode = this.robUI.getChildByName(labelNames[i])
                    if (labelNode) {
                        console.log("🕐 [_updateBidCountdownUI] 找到节点: " + labelNames[i])
                        var label = labelNode.getComponent(cc.Label)
                        if (label) {
                            label.string = String(remaining)
                            countdownLabelNode = labelNode
                            labelNode.active = true
                            labelNode.opacity = 255
                            labelNode.color = new cc.Color(255, 255, 255, 255)
                            console.log("🕐 [_updateBidCountdownUI] ✓ 通过 robUI/" + labelNames[i] + " 更新")
                            updated = true
                            break
                        }
                    }
                }
            }
        } else {
            console.warn("🕐 [_updateBidCountdownUI] ⚠️ this.robUI 不存在!")
        }

        // 方式3：通知 player_node 更新倒计时
        if (this.node && this.node.parent) {
            this.node.parent.emit("update_countdown_event", {
                type: "bid",
                remaining: remaining
            })
        }

        if (!updated) {
            console.error("🕐 [_updateBidCountdownUI] ❌ 未找到倒计时 Label，无法更新!")
        } else {
            console.log("🕐 [_updateBidCountdownUI] ========== 更新完成 ==========")
        }
    },

    /**
     * ⚠️【警告状态】5秒时进入警告状态
     */
    _enterBidWarningState: function() {
        if (this._isBidWarning) return
        this._isBidWarning = true

        console.log("⚠️ [倒计时] 进入抢地主警告状态")

        // 获取倒计时 Label 节点
        var labelNode = this._getBidCountdownLabelNode()
        if (!labelNode) return

        // 变红
        labelNode.color = cc.Color.RED

        // 🔥 呼吸缩放动画
        labelNode.stopAllActions()
        cc.tween(labelNode)
            .repeatForever(
                cc.tween()
                    .to(0.3, { scale: 1.2 })
                    .to(0.3, { scale: 1.0 })
            )
            .start()
    },

    /**
     * 🕐【获取节点】获取抢地主倒计时Label节点
     * 🔧【修复】查找 clock 子节点中的 Label
     */
    _getBidCountdownLabelNode: function() {
        if (this.bidCountdownLabel && this.bidCountdownLabel.node) {
            return this.bidCountdownLabel.node
        }
        if (this.robUI) {
            // 检查 clock 节点下的 Label
            var clockNode = this.robUI.getChildByName("clock")
            if (clockNode) {
                var children = clockNode.children
                for (var i = 0; i < children.length; i++) {
                    var label = children[i].getComponent(cc.Label)
                    if (label) {
                        return children[i]
                    }
                }
            }
            // 其他可能的名称
            var labelNames = ["clock_ Label", "clock_Label", "time_label", "countdown"]
            for (var j = 0; j < labelNames.length; j++) {
                var labelNode = this.robUI.getChildByName(labelNames[j])
                if (labelNode && labelNode.getComponent(cc.Label)) {
                    return labelNode
                }
            }
        }
        return null
    },

    /**
     * ⏰【展示结束】本地倒计时显示结束
     * ⚠️【重要】只做UI处理，不发送请求！
     * 服务器会在超时后自动处理，并发送下一个轮次消息
     */
    _onBidCountdownEnd: function() {
        console.log("⏰ [倒计时展示] 本地倒计时显示结束，等待服务器处理...")

        // 停止 tick
        this._isBidCountdownTicking = false
        this.unschedule(this._bidCountdownTick)

        // 停止动画并恢复状态
        var labelNode = this._getBidCountdownLabelNode()
        if (labelNode) {
            labelNode.stopAllActions()
            labelNode.scale = 1
            labelNode.color = cc.Color.WHITE
        }

        // ⚠️【重要】不发送任何请求！
        // 服务器会在超时后自动处理：
        // 1. 自动不叫/不抢
        // 2. 发送 call_landlord_turn_notify 或 call_landlord_end_notify
        // 客户端只需要响应服务器消息
    },

    /**
     * 🔒【停止】停止抢地主倒计时
     */
    _stopBidCountdown: function() {
        this._isBidCountdownTicking = false
        this.unschedule(this._bidCountdownTick)

        // 恢复 Label 状态
        var labelNode = this._getBidCountdownLabelNode()
        if (labelNode) {
            labelNode.stopAllActions()
            labelNode.scale = 1
            labelNode.color = cc.Color.WHITE
        }

        this._isBidWarning = false
    },

    // ============================================================
    // 🕐【出牌倒计时】标准斗地主倒计时（带分段催促效果）
    // ============================================================

    /**
     * 🕐【统一入口】开始出牌倒计时
     * @param {number} duration - 倒计时秒数，默认15秒
     */
    _startPlayCountdown: function(duration) {
        var self = this
        // 🔒【防护】先停止之前的倒计时
        this._stopPlayCountdown()

        var timeout = duration || this._playTimeout || 15
        this._playTimeLeft = timeout
        this._isPlayCountdownTicking = true
        this._isPlayWarning = false

        console.log("🕐 [倒计时] 开始出牌倒计时: " + timeout + "秒")

        // 🕐 初始化UI显示
        this._updatePlayCountdownUI()

        // 🕐 使用 cc.Node 的 schedule 实现每秒 tick
        this.schedule(this._playCountdownTick, 1)
    },

    /**
     * 🕐【核心Tick】出牌倒计时每秒执行
     */
    _playCountdownTick: function() {
        if (!this._isPlayCountdownTicking) return

        this._playTimeLeft--
        console.log("🕐 [倒计时] 出牌剩余: " + this._playTimeLeft + "秒")

        // 🕐 更新UI显示
        this._updatePlayCountdownUI()

        // ⚠️ 5秒：进入警告状态
        if (this._playTimeLeft === 5) {
            this._enterPlayWarningState()
        }

        // 🔊 3秒：开始滴答音（每秒一次）
        if (this._playTimeLeft <= 3 && this._playTimeLeft > 0) {
            this._playTickSound()
        }

        // ⏰ 0秒：自动处理
        if (this._playTimeLeft <= 0) {
            this._onPlayCountdownEnd()
        }
    },

    /**
     * 🕐【UI更新】更新出牌倒计时显示
     * 🔧【修复】增强 Label 查找逻辑，添加调试日志
     */
    _updatePlayCountdownUI: function() {
        var remaining = this._playTimeLeft
        var updated = false

        console.log("🕐 [_updatePlayCountdownUI] 尝试更新出牌倒计时: " + remaining + "秒")

        // 方式1：使用 properties 绑定的 Label
        if (this.playCountdownLabel) {
            this.playCountdownLabel.string = String(remaining)
            console.log("🕐 [_updatePlayCountdownUI] ✓ 通过 playCountdownLabel 更新")
            updated = true
        }

        // 方式2：尝试从 playingUI_node 中查找倒计时 Label
        if (this.playingUI_node) {
            var labelNames = ["time_label", "countdown", "timer", "time"]
            for (var i = 0; i < labelNames.length; i++) {
                var labelNode = this.playingUI_node.getChildByName(labelNames[i])
                if (labelNode) {
                    var label = labelNode.getComponent(cc.Label)
                    if (label) {
                        label.string = String(remaining)
                        console.log("🕐 [_updatePlayCountdownUI] ✓ 通过 playingUI_node/" + labelNames[i] + " 更新")
                        updated = true
                        break
                    }
                }
            }
            
            // 兜底：遍历所有子节点查找 Label
            if (!updated) {
                var children = this.playingUI_node.children
                for (var j = 0; j < children.length; j++) {
                    var child = children[j]
                    var label = child.getComponent(cc.Label)
                    if (label) {
                        label.string = String(remaining)
                        console.log("🕐 [_updatePlayCountdownUI] ✓ 通过 playingUI_node 子节点[" + child.name + "] 更新")
                        updated = true
                        break
                    }
                }
            }
        }

        // 方式3：通知 player_node 更新倒计时
        if (this.node && this.node.parent) {
            this.node.parent.emit("update_countdown_event", {
                type: "play",
                remaining: remaining
            })
        }

        if (!updated) {
            console.warn("🕐 [_updatePlayCountdownUI] ⚠️ 未找到出牌倒计时 Label")
        }
    },

    /**
     * ⚠️【警告状态】5秒时进入警告状态
     */
    _enterPlayWarningState: function() {
        if (this._isPlayWarning) return
        this._isPlayWarning = true

        console.log("⚠️ [倒计时] 进入出牌警告状态")

        // 获取倒计时 Label 节点
        var labelNode = this._getPlayCountdownLabelNode()
        if (!labelNode) return

        // 变红
        labelNode.color = cc.Color.RED

        // 🔥 呼吸缩放动画
        labelNode.stopAllActions()
        cc.tween(labelNode)
            .repeatForever(
                cc.tween()
                    .to(0.3, { scale: 1.2 })
                    .to(0.3, { scale: 1.0 })
            )
            .start()
    },

    /**
     * 🕐【获取节点】获取出牌倒计时Label节点
     */
    _getPlayCountdownLabelNode: function() {
        if (this.playCountdownLabel && this.playCountdownLabel.node) {
            return this.playCountdownLabel.node
        }
        if (this.playingUI_node) {
            var timeLabel = this.playingUI_node.getChildByName("time_label")
            if (timeLabel) return timeLabel
            var countdownLabel = this.playingUI_node.getChildByName("countdown")
            if (countdownLabel) return countdownLabel
        }
        return null
    },

    /**
     * ⏰【展示结束】本地出牌倒计时显示结束
     * ⚠️【重要】只做UI处理，不发送请求！
     * 服务器会在超时后自动处理（自动不出），并发送下一个轮次消息
     */
    _onPlayCountdownEnd: function() {
        console.log("⏰ [倒计时展示] 本地出牌倒计时显示结束，等待服务器处理...")

        // 停止 tick
        this._isPlayCountdownTicking = false
        this.unschedule(this._playCountdownTick)

        // 停止动画并恢复状态
        var labelNode = this._getPlayCountdownLabelNode()
        if (labelNode) {
            labelNode.stopAllActions()
            labelNode.scale = 1
            labelNode.color = cc.Color.WHITE
        }

        // ⚠️【重要】不发送任何请求！
        // 服务器会在超时后自动处理：
        // 1. 自动不出
        // 2. 发送 can_chu_card_notify 或 game_over
        // 客户端只需要响应服务器消息
    },

    /**
     * 🔒【停止】停止出牌倒计时
     */
    _stopPlayCountdown: function() {
        this._isPlayCountdownTicking = false
        this.unschedule(this._playCountdownTick)

        // 恢复 Label 状态
        var labelNode = this._getPlayCountdownLabelNode()
        if (labelNode) {
            labelNode.stopAllActions()
            labelNode.scale = 1
            labelNode.color = cc.Color.WHITE
        }

        this._isPlayWarning = false
    },

    // ============================================================
    // 🔊【音效】滴答音效（3秒催促）
    // ============================================================

    /**
     * 🔊 播放滴答音效（用于抢地主倒计时）
     */
    _playTickSound: function() {
        if (!isopen_sound) return

        // 优先使用绑定的音效
        if (this.tickAudio) {
            cc.audioEngine.playEffect(this.tickAudio, false)
            return
        }

        // 兜底：使用发牌音效（可替换为专用滴答音效）
        playSound("sound/fapai1")
    },

    /**
     * 🔊 播放滴答音效（用于出牌倒计时）
     */
    _playPlayTickSound: function() {
        if (!isopen_sound) return

        // 优先使用绑定的音效
        if (this.tickAudio) {
            cc.audioEngine.playEffect(this.tickAudio, false)
            return
        }

        // 兜底：使用发牌音效
        playSound("sound/fapai1")
    },

    // ============================================================
    // 按钮点击事件
    // ============================================================

    onButtonClick: function(event, customData) {
        var myglobal = window.myglobal
        switch(customData) {
            case "btn_qiandz":
                if (this._biddingPhase === "bidding") {
                    console.log("🎯 [btn_qiandz] 叫地主")
                    this._hideRobUI()
                    myglobal.socket.requestBid(true)
                    if (isopen_sound) playSound("sound/woman_jiao_di_zhu")
                } else {
                    console.log("🎯 [btn_qiandz] 抢地主")
                    this._hideRobUI()
                    myglobal.socket.requestRobState(qian_state.qian)
                    if (isopen_sound) playSound("sound/woman_jiao_di_zhu")
                }
                break

            case "btn_buqiandz":
                if (this._biddingPhase === "bidding") {
                    console.log("🎯 [btn_buqiandz] 不叫")
                    this._hideRobUI()
                    myglobal.socket.requestBid(false)
                    if (isopen_sound) playSound("sound/woman_bu_jiao")
                } else {
                    console.log("🎯 [btn_buqiandz] 不抢")
                    this._hideRobUI()
                    myglobal.socket.requestRobState(qian_state.buqiang)
                    if (isopen_sound) playSound("sound/woman_bu_jiao")
                }
                break
                
            case "nopushcard":
                this._stopPlayCountdown()
                myglobal.socket.request_buchu_card([], null)
                this.playingUI_node.active = false
                break

            case "pushcard":
                if (this.choose_card_data.length === 0) {
                    this.tipsLabel.string = "请选择牌!"
                    var self = this
                    setTimeout(function() {
                        self.tipsLabel.string = ""
                    }, 2000)
                    return
                }
                
                var self = this
                this._stopPlayCountdown()
                myglobal.socket.request_chu_card(this.choose_card_data, function(err, data) {
                    if (err) {
                        self.tipsLabel.string = data.msg || "出牌失败"
                        setTimeout(function() {
                            self.tipsLabel.string = ""
                        }, 2000)
                        self._resetCardFlags()
                        self.choose_card_data = []
                    } else {
                        self.playingUI_node.active = false
                        self.destoryCard(data.account, self.choose_card_data)
                        self.choose_card_data = []
                    }
                })
                break
        }
    },
    
    _resetCardFlags: function() {
        // 重置所有牌的选中状态
        if (this.cards_node) {
            var children = this.cards_node.children
            for (var i = 0; i < children.length; i++) {
                children[i].emit("reset_card_flag")
            }
        }
    },

    // ============================================================
    // 出牌相关
    // ============================================================
    
    /**
     * 地主获得底牌后添加到手牌
     */
    pushThreeCard: function() {
        console.log("🃏 [pushThreeCard] 添加底牌到手牌")
        
        // 将底牌添加到手牌
        for (var i = 0; i < this.bottomCards.length; i++) {
            this.handCards.push(this.bottomCards[i])
        }
        
        console.log("🃏 [pushThreeCard] 添加后手牌数量:", this.handCards.length)
        
        // 重新渲染所有牌
        this.renderCards(this.handCards)
    },

    destoryCard: function(accountid, choose_card) {
        if (choose_card.length === 0) return
        
        var destroy_card = []
        for (var i = 0; i < choose_card.length; i++) {
            for (var j = this.handCards.length - 1; j >= 0; j--) {
                if (this.handCards[j].rank === choose_card[i].card_data.rank &&
                    this.handCards[j].suit === choose_card[i].card_data.suit) {
                    // 从手牌数据中删除
                    this.handCards.splice(j, 1)
                    break
                }
            }
        }
        
        // 重新渲染
        this.renderCards(this.handCards)
        
        // 显示出的牌
        if (this.cards_node && this.cards_node.children.length > 0) {
            var outCard_node = this._getOutCardNode(accountid)
            if (outCard_node) {
                // 找到已选中的牌节点
                var selectedNodes = []
                var children = this.cards_node.children
                for (var i = 0; i < children.length; i++) {
                    var cardComp = children[i].getComponent("card")
                    if (cardComp && cardComp.flag) {
                        selectedNodes.push(children[i])
                    }
                }
                this.showOutCards(outCard_node, selectedNodes)
            }
        }
    },
    
    _getOutCardNode: function(accountid) {
        var gameScene_script = this.node.parent.getComponent("gameScene")
        return gameScene_script ? gameScene_script.getUserOutCardPosByAccount(accountid) : null
    },

    clearOutZone: function(accountid) {
        var outCard_node = this._getOutCardNode(accountid)
        if (outCard_node) {
            outCard_node.removeAllChildren(true)
        }
    },

    showOutCards: function(outCard_node, cards) {
        if (!outCard_node || !cards || cards.length === 0) return
        
        outCard_node.removeAllChildren(true)
        
        var count = cards.length
        for (var i = 0; i < count; i++) {
            var card = cards[i]
            outCard_node.addChild(card, i)
            card.setScale(CardLayout.outCardScale, CardLayout.outCardScale)
            
            var x = this._getCardX(i, count, CardLayout.outCardSpacing)
            card.setPosition(x, 0)
        }
    },

    // ============================================================
    // 游戏状态恢复
    // ============================================================
    
    restoreGameState: function(data) {
        console.log("🔄 [restoreGameState] 开始恢复游戏状态")
        
        var gameState = data.game_state
        if (!gameState) return
        
        // 恢复玩家信息
        if (gameState.players) {
            for (var i = 0; i < gameState.players.length; i++) {
                var p = gameState.players[i]
                if (p.is_landlord && window.myglobal.playerData) {
                    window.myglobal.playerData.master_accountid = p.id
                }
            }
        }
        
        // 恢复手牌
        if (gameState.hand && gameState.hand.length > 0) {
            console.log("🔄 [restoreGameState] 恢复手牌，数量:", gameState.hand.length)
            this.handCards = gameState.hand
            this.renderCards(this.handCards)
        }
        
        // 恢复底牌
        if (gameState.bottom_cards && gameState.bottom_cards.length > 0) {
            this.bottomCards = gameState.bottom_cards
            for (var i = 0; i < this.bottom_card.length && i < this.bottomCards.length; i++) {
                if (this.bottom_card[i]) {
                    var cardComp = this.bottom_card[i].getComponent("card")
                    if (cardComp) {
                        cardComp.showCards(this.bottomCards[i])
                    }
                }
            }
        }
        
        // 恢复出牌轮次
        if (gameState.phase === "playing" && gameState.current_turn) {
            var myPlayerId = window.myglobal.socket.getPlayerInfo().id || window.myglobal.playerData.accountID
            if (String(gameState.current_turn) === String(myPlayerId)) {
                this.playingUI_node.active = true
            }
        }
    }
});
