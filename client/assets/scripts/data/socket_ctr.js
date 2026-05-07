/**
 * 斗地主客户端通信层
 * 使用 WebSocket 连接 Go 后端
 * 纯全局变量方式，延迟初始化
 * 支持心跳检测和自动重连
 */

window.socketCtr = function(){
    var that = {}
    var respone_map = {} 
    var call_index = 0
    var _socket = null
    var event = null  // 延迟初始化
    var _isConnected = false
    var _playerId = ""
    var _playerName = ""
    var _reconnectToken = ""
    var _currentRoomCode = ""  // 当前房间号
    var _isInRoom = false        // 是否在房间中
    
    // ========== 心跳机制 ==========
    var _heartbeatInterval = null      // 心跳定时器
    var _heartbeatTimeout = null       // 心跳超时定时器
    var _heartbeatIntervalMs = 30000   // 心跳间隔（30秒）
    var _heartbeatTimeoutMs = 10000    // 心跳超时时间（10秒）
    var _lastHeartbeatTime = 0         // 上次心跳时间
    var _missedHeartbeats = 0          // 连续丢失的心跳次数
    var _maxMissedHeartbeats = 3       // 最大允许丢失的心跳次数
    var _isHeartbeatRunning = false    // 心跳是否在运行
    
    // ========== 状态监听 ==========
    var _stateListeners = []           // 状态变化监听器列表
    var _connectionState = "disconnected"  // 连接状态: disconnected, connecting, connected
    
    // 获取服务器地址
    var _serverUrl = "ws://localhost:1780/ws"
    if (typeof window !== 'undefined' && window.defines && window.defines.serverUrl) {
        _serverUrl = window.defines.serverUrl
    }
    
    // 确保 event 初始化
    var _getEvent = function() {
        if (!event) {
            if (typeof window.eventLister === 'undefined') {
                console.error("eventLister 未定义，请确保 event_lister.js 已作为插件脚本加载")
                return null
            }
            event = window.eventLister({})
        }
        return event
    }

    // 消息类型映射（与 Go 后端保持一致）
    var MessageType = {
        // 客户端请求
        CREATE_ROOM: "create_room",
        JOIN_ROOM: "join_room",
        LEAVE_ROOM: "leave_room",
        QUICK_MATCH: "quick_match",
        READY: "ready",
        CANCEL_READY: "cancel_ready",
        BID: "bid",
        ROB: "rob",           // 抢地主请求（旧版）
        CALL_LANDLORD: "call_landlord", // 抢地主请求（新版统一接口）
        PLAY_CARDS: "play_cards",
        PASS: "pass",
        CHAT: "chat",
        GET_ROOM_LIST: "get_room_list",  // 获取房间列表

        // ============================================================
        // 【核心】游戏阶段控制消息（服务端权威驱动）
        // ============================================================
        // 准备阶段
        READY_START: "ready_start",
        READY_END: "ready_end",

        // 发牌阶段
        DEAL_START: "deal_start",
        DEAL_END: "deal_end",

        // 抢地主阶段
        CALL_LANDLORD_START: "call_landlord_start",
        CALL_LANDLORD_TURN: "call_landlord_turn",
        CALL_LANDLORD_RESULT: "call_landlord_result",
        CALL_LANDLORD_END: "call_landlord_end",

        // 出牌阶段
        PLAY_START: "play_start",
        PLAY_END: "play_end",

        // 结算阶段
        SETTLEMENT_START: "settlement_start",
        SETTLEMENT_END: "settlement_end",

        // ============================================================
        // 旧版消息（兼容）
        // ============================================================
        // 服务端响应
        CONNECTED: "connected",
        ROOM_CREATED: "room_created",
        ROOM_JOINED: "room_joined",
        PLAYER_JOINED: "player_joined",
        PLAYER_LEFT: "player_left",
        PLAYER_READY: "player_ready",
        MATCH_FOUND: "match_found",
        GAME_START: "game_start",
        DEAL_CARDS: "deal_cards",
        BID_TURN: "bid_turn",
        BID_RESULT: "bid_result",
        ROB_TURN: "rob_turn",     // 轮到抢地主
        ROB_RESULT: "rob_result", // 抢地主结果
        LANDLORD: "landlord",
        PLAY_TURN: "play_turn",
        CARD_PLAYED: "card_played",
        PLAYER_PASS: "player_pass",
        GAME_OVER: "game_over",
        ERROR: "error",
        FORCE_LOGOUT: "force_logout", // 强制下线
        ROOM_LIST_RESULT: "room_list_result",  // 房间列表结果
        ROOM_LIST_UPDATE: "room_list_update",  // 房间列表实时更新

        // 心跳消息（与Go后端一致）
        PING: "ping",
        PONG: "pong",
    }

    // 发送消息
    var _sendmsg = function(type, data, callindex){
        if (!_socket || _socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket 未连接")
            return
        }
        var msg = {
            type: type,
            payload: data || {},
            callIndex: callindex || null
        }
        console.log("发送消息:", JSON.stringify(msg))
        _socket.send(JSON.stringify(msg))
    }

    // 请求（带回调）
    var _request = function(type, data, callback){
        call_index++ 
        respone_map[call_index] = callback
        _sendmsg(type, data, call_index)
    }

    // 处理服务端消息
    var _handleMessage = function(msgData){
        console.log("📨 [WebSocket] 收到消息:", JSON.stringify(msgData))
        
        var evt = _getEvent()
        if (!evt) return
        
        var type = msgData.type
        var data = msgData.payload || msgData.data || {}  // 兼容 payload 和 data 字段
        var callIndex = msgData.callIndex
        
        console.log("📨 [WebSocket] 消息类型:", type, "callIndex:", callIndex)
        console.log("📨 [WebSocket] data 内容:", JSON.stringify(data, null, 2))
        
        // 【重要】对于 room_joined 消息，无论是否有 callIndex，都要设置房间状态
        if (type === MessageType.ROOM_JOINED) {
            _currentRoomCode = data.room_code
            _isInRoom = true
            console.log("📨 [WebSocket] 设置房间状态: roomCode=" + _currentRoomCode + ", isInRoom=" + _isInRoom)
        }
        
        // 【重要】对于 room_created 消息，同样设置房间状态
        if (type === MessageType.ROOM_CREATED) {
            _currentRoomCode = data.room_code
            _isInRoom = true
            console.log("📨 [WebSocket] 创建房间成功，设置房间状态: roomCode=" + _currentRoomCode + ", isInRoom=" + _isInRoom)
        }
        
        // 处理回调
        if (callIndex && respone_map[callIndex]) {
            console.log("📨 [WebSocket] 找到回调，callIndex:", callIndex)
            var callback = respone_map[callIndex]
            callback(msgData.result || 0, data)
            delete respone_map[callIndex]
            return
        }
        
        // 处理服务端推送的消息
        switch(type){
            case MessageType.CONNECTED:
                _playerId = data.player_id
                _playerName = data.player_name
                _reconnectToken = data.reconnect_token
                _isConnected = true
                _setConnectionState("connected")
                console.log("连接成功，玩家ID:", _playerId)
                
                // 【新增】同步到 playerData.serverPlayerId
                if (window.myglobal && window.myglobal.playerData) {
                    window.myglobal.playerData.serverPlayerId = data.player_id
                    console.log("✅ 已同步 serverPlayerId 到 playerData (来自 CONNECTED):", data.player_id)
                }
                
                // 启动心跳
                _startHeartbeat()
                evt.fire("connection_success", data)
                break
                
            // 处理重连成功消息
            case "reconnected":
                _playerId = data.player_id
                _playerName = data.player_name
                _isConnected = true
                _setConnectionState("connected")
                console.log("🔄 [reconnected] 重连成功，玩家ID:", _playerId)
                console.log("🔄 [reconnected] 完整数据:", JSON.stringify(data, null, 2))
                
                // 【新增】同步到 playerData.serverPlayerId
                if (window.myglobal && window.myglobal.playerData) {
                    window.myglobal.playerData.serverPlayerId = data.player_id
                    console.log("✅ 已同步 serverPlayerId 到 playerData (来自 reconnected):", data.player_id)
                }
                
                // 启动心跳
                _startHeartbeat()
                
                // 如果有游戏状态，说明在游戏中，需要恢复牌局
                if (data.game_state) {
                    console.log("🔄 [reconnected] 检测到游戏状态，需要恢复牌局")
                    console.log("🔄 [reconnected] game_state:", JSON.stringify(data.game_state, null, 2))
                    _currentRoomCode = data.room_code
                    _isInRoom = true
                    
                    // 触发游戏状态恢复事件
                    evt.fire("game_state_restore", {
                        room_code: data.room_code,
                        player_id: data.player_id,
                        player_name: data.player_name,
                        game_state: data.game_state
                    })
                } else if (data.room_code) {
                    // 在房间中但游戏未开始
                    _currentRoomCode = data.room_code
                    _isInRoom = true
                    console.log("重连恢复房间:", data.room_code)
                    evt.fire("room_restored", data)
                } else {
                    evt.fire("connection_success", data)
                }
                break
                
            case MessageType.ROOM_CREATED:
                _currentRoomCode = data.room_code
                _isInRoom = true
                console.log("房间创建成功:", data.room_code)
                
                // 【新增】从 ROOM_CREATED 消息中获取当前玩家的 ID
                if (data.player && data.player.id) {
                    _playerId = data.player.id
                    _playerName = data.player.name || _playerName
                    console.log("✅ 从 ROOM_CREATED 设置 playerId:", _playerId)
                    
                    // 同步到 playerData.serverPlayerId
                    if (window.myglobal && window.myglobal.playerData) {
                        window.myglobal.playerData.serverPlayerId = data.player.id
                        console.log("✅ 已同步 serverPlayerId 到 playerData (来自 ROOM_CREATED):", data.player.id)
                    }
                }
                
                evt.fire("room_created", data)
                break
                
            case MessageType.ROOM_JOINED:
                console.log("📨 [ROOM_JOINED] 原始 data:", JSON.stringify(data, null, 2))
                console.log("📨 [ROOM_JOINED] data.creator_id:", data.creator_id)
                console.log("📨 [ROOM_JOINED] data.room_code:", data.room_code)
                console.log("📨 [ROOM_JOINED] data.player:", JSON.stringify(data.player))
                
                _currentRoomCode = data.room_code
                _isInRoom = true
                
                // 从 ROOM_JOINED 消息中获取当前玩家的 ID
                if (data.player && data.player.id) {
                    _playerId = data.player.id
                    _playerName = data.player.name || _playerName
                    console.log("✅ 从 ROOM_JOINED 设置 playerId:", _playerId)
                    
                    // 【新增】同步到 playerData.serverPlayerId，确保后续比较可用
                    if (window.myglobal && window.myglobal.playerData) {
                        window.myglobal.playerData.serverPlayerId = data.player.id
                        console.log("✅ 已同步 serverPlayerId 到 playerData:", data.player.id)
                    }
                }
                
                console.log("加入房间成功:", data.room_code)
                evt.fire("room_joined", data)
                break
                
            case MessageType.PLAYER_JOINED:
                console.log("🎯 [PLAYER_JOINED] 收到玩家加入消息，原始数据:", JSON.stringify(data, null, 2))
                var playerData = {
                    accountid: data.player ? data.player.id : "",
                    nick_name: data.player ? data.player.name : "",
                    avatarUrl: "avatar_1",
                    goldcount: 1000,
                    seatindex: data.player ? data.player.seat + 1 : 1,  // 座位索引从1开始
                    isready: data.player ? data.player.ready : false   // 准备状态
                }
                console.log("🎯 [PLAYER_JOINED] 转换后玩家数据:", JSON.stringify(playerData, null, 2))
                evt.fire("player_joinroom_notify", playerData)
                console.log("🎯 [PLAYER_JOINED] 事件已触发: player_joinroom_notify")
                break
                
            case MessageType.PLAYER_LEFT:
                evt.fire("player_left", data)
                break
                
            case MessageType.PLAYER_READY:
                evt.fire("player_ready_notify", data)
                break
                
            case MessageType.MATCH_FOUND:
                evt.fire("match_found", data)
                break
                
            case MessageType.ROOM_LIST_RESULT:
                console.log("收到房间列表:", JSON.stringify(data))
                evt.fire("room_list_result", data)
                break
                
            case MessageType.ROOM_LIST_UPDATE:
                console.log("收到房间列表更新:", JSON.stringify(data))
                evt.fire("room_list_update", data)
                break
                
            case MessageType.GAME_START:
                evt.fire("gameStart_notify", data)
                break

            // ============================================================
            // 【核心】游戏阶段控制消息处理（服务端权威驱动）
            // ============================================================

            case MessageType.READY_START:
                console.log("🎮 [READY_START] 准备阶段开始")
                evt.fire("phase_ready_start", data)
                break

            case MessageType.READY_END:
                console.log("🎮 [READY_END] 准备阶段结束")
                evt.fire("phase_ready_end", data)
                break

            case MessageType.DEAL_START:
                console.log("🃏 [DEAL_START] 发牌阶段开始")
                evt.fire("phase_deal_start", data)
                break

            case MessageType.DEAL_END:
                console.log("🃏 [DEAL_END] 发牌阶段结束")
                evt.fire("phase_deal_end", data)
                break

            case MessageType.CALL_LANDLORD_START:
                console.log("🎯 [CALL_LANDLORD_START] 抢地主阶段开始:", JSON.stringify(data))
                evt.fire("call_landlord_start_notify", data)
                break

            case MessageType.CALL_LANDLORD_TURN:
                console.log("🎯 [CALL_LANDLORD_TURN] 轮到玩家抢地主:", JSON.stringify(data))
                evt.fire("call_landlord_turn_notify", {
                    player_id: data.player_id,
                    player_name: data.player_name,
                    timeout: data.timeout || 15,
                    round: data.round || 1,
                    turn_index: data.turn_index || 1
                })
                // 同时触发旧版事件（兼容）
                if (data.round === 1) {
                    evt.fire("bid_turn_notify", {
                        player_id: data.player_id,
                        timeout: data.timeout || 15
                    })
                } else {
                    evt.fire("canrob_notify", {
                        player_id: data.player_id,
                        timeout: data.timeout || 15
                    })
                }
                break

            case MessageType.CALL_LANDLORD_RESULT:
                console.log("🎯 [CALL_LANDLORD_RESULT] 抢地主结果:", JSON.stringify(data))
                evt.fire("call_landlord_result_notify", {
                    player_id: data.player_id,
                    player_name: data.player_name,
                    action: data.action,
                    round: data.round,
                    turn_index: data.turn_index
                })
                // 同时触发旧版事件（兼容）
                if (data.round === 1) {
                    evt.fire("bid_result_notify", {
                        accountid: data.player_id,
                        state: data.action === "call"
                    })
                } else {
                    evt.fire("canrob_state_notify", {
                        accountid: data.player_id,
                        state: data.action === "call"
                    })
                }
                break

            case MessageType.CALL_LANDLORD_END:
                console.log("🎯 [CALL_LANDLORD_END] 抢地主阶段结束:", JSON.stringify(data))
                evt.fire("call_landlord_end_notify", data)
                // 触发地主确认事件
                var bottomCardsEnd = _convertCards(data.bottom_cards || [])
                evt.fire("change_master_notify", data.landlord_id)
                evt.fire("change_showcard_notify", {
                    cards: bottomCardsEnd
                })
                break

            case MessageType.PLAY_START:
                console.log("🎮 [PLAY_START] 出牌阶段开始")
                evt.fire("phase_play_start", data)
                break

            case MessageType.PLAY_END:
                console.log("🎮 [PLAY_END] 出牌阶段结束")
                evt.fire("phase_play_end", data)
                break

            case MessageType.SETTLEMENT_START:
                console.log("🏆 [SETTLEMENT_START] 结算阶段开始")
                evt.fire("phase_settlement_start", data)
                break

            case MessageType.SETTLEMENT_END:
                console.log("🏆 [SETTLEMENT_END] 结算阶段结束")
                evt.fire("phase_settlement_end", data)
                break

            // ============================================================
            // 旧版消息处理（兼容）
            // ============================================================

            case MessageType.DEAL_CARDS:
                var cards = _convertCards(data.cards || [])
                var bottomCards = _convertCards(data.bottom_cards || [])
                evt.fire("pushcard_notify", {
                    cards: cards,
                    bottom_cards: bottomCards
                })
                break

            case MessageType.BID_TURN:
                // 叫地主轮次 - 使用 bid_turn 事件
                evt.fire("bid_turn_notify", {
                    player_id: data.player_id,
                    timeout: data.timeout || 15
                })
                break

            case MessageType.BID_RESULT:
                // 叫地主结果 - 使用 bid_result 事件
                evt.fire("bid_result_notify", {
                    accountid: data.player_id,
                    state: data.bid
                })
                break

            case MessageType.ROB_TURN:
                // 抢地主轮次 - 使用 canrob_notify 事件
                console.log("🎯 [ROB_TURN] 收到抢地主轮次通知:", JSON.stringify(data))
                evt.fire("canrob_notify", {
                    player_id: data.player_id,
                    timeout: data.timeout || 15
                })
                break

            case MessageType.ROB_RESULT:
                // 抢地主结果 - 使用 canrob_state_notify 事件
                console.log("🎯 [ROB_RESULT] 收到抢地主结果:", JSON.stringify(data))
                evt.fire("canrob_state_notify", {
                    accountid: data.player_id,
                    state: data.rob
                })
                break
                
            case MessageType.LANDLORD:
                var bottomCards = _convertCards(data.bottom_cards || [])
                evt.fire("change_master_notify", data.player_id)
                evt.fire("change_showcard_notify", {
                    cards: bottomCards
                })
                break
                
            case MessageType.PLAY_TURN:
                // 【修复】传递完整的出牌轮次信息（包含 timeout）
                console.log("🎮 [PLAY_TURN] 收到出牌轮次通知:", JSON.stringify(data))
                evt.fire("can_chu_card_notify", {
                    player_id: data.player_id,
                    timeout: data.timeout || 15,
                    must_play: data.must_play || false,
                    can_beat: data.can_beat || false
                })
                break
                
            case MessageType.CARD_PLAYED:
                var cards = _convertCards(data.cards || [])
                evt.fire("other_chucard_notify", {
                    accountid: data.player_id,
                    cards: cards,
                    cards_left: data.cards_left
                })
                break
                
            case MessageType.PLAYER_PASS:
                evt.fire("other_chucard_notify", {
                    accountid: data.player_id,
                    cards: [],
                    is_pass: true
                })
                break
                
            case MessageType.GAME_OVER:
                evt.fire("game_over", data)
                break
                
            case MessageType.ERROR:
                console.error("服务器错误:", data.message)
                evt.fire("error", data)
                break
                
            case MessageType.FORCE_LOGOUT:
                console.warn("🚫 收到强制下线通知:", data)
                _handleForceLogout(data)
                break
                
            case MessageType.PONG:
                // 收到心跳响应
                _onHeartbeatAck(data)
                break
                
            // 处理玩家掉线通知
            case "player_offline":
                console.log("📴 [player_offline] 玩家掉线:", JSON.stringify(data))
                evt.fire("player_offline_notify", {
                    player_id: data.player_id,
                    player_name: data.player_name,
                    timeout: data.timeout || 0
                })
                break
                
            // 处理玩家上线通知
            case "player_online":
                console.log("📶 [player_online] 玩家上线:", JSON.stringify(data))
                evt.fire("player_online_notify", {
                    player_id: data.player_id,
                    player_name: data.player_name
                })
                break
                
            default:
                console.log("未处理的消息类型:", type)
                evt.fire(type, data)
        }
    }

    // 转换卡牌格式（后端格式 -> 客户端格式）
    // 后端格式: { suit: 0-4, rank: 3-17, color: 0-1 }
    //   suit: 0=黑桃, 1=红心, 2=梅花, 3=方块, 4=王
    //   rank: 3-15=3-2, 16=小王, 17=大王
    // 客户端格式: { value: 1-15, suit: 0-3, king: 14/15 }
    //   value: 1=3, 2=4, ..., 12=2, 13=小王(不用), 14=小王, 15=大王
    //   suit: 0-3 (不含王)
    var _convertCards = function(serverCards){
        console.log("🃏 [_convertCards] 开始转换牌数据，数量:", serverCards ? serverCards.length : 0)
        console.log("🃏 [_convertCards] 原始数据:", JSON.stringify(serverCards))
        
        var result = serverCards.map(function(card){
            var converted = {
                suit: card.suit,
                color: card.color,
                rank: card.rank,  // 【重要】保留服务端的 rank 字段，用于斗地主排序
                index: card.rank,
                str: _cardToString(card)
            }
            
            // 处理大小王
            if (card.rank === 16) {
                // 小王
                converted.king = 14
                converted.value = 14
            } else if (card.rank === 17) {
                // 大王
                converted.king = 15
                converted.value = 15
            } else if (card.rank >= 3 && card.rank <= 15) {
                // 普通牌: 服务端 rank 3-15 对应客户端 value 1-13
                // 服务端: 3=3, 4=4, 5=5, 6=6, 7=7, 8=8, 9=9, 10=10, 11=J, 12=Q, 13=K, 14=A, 15=2
                // 客户端: 1=3, 2=4, 3=5, 4=6, 5=7, 6=8, 7=9, 8=10, 9=J, 10=Q, 11=K, 12=A, 13=2
                converted.value = card.rank - 2  // 3->1, 4->2, ..., 15->13
            } else {
                console.warn("🃏 [_convertCards] 未知的 rank 值:", card.rank)
                converted.value = card.rank
            }
            
            // 兼容服务端发送的 king 字段
            if (card.king) {
                converted.king = parseInt(card.king)
            }
            
            console.log("🃏 [_convertCards] 牌转换: rank=" + card.rank + ", suit=" + card.suit + " -> value=" + converted.value + ", king=" + (converted.king || '无'))
            return converted
        })
        
        console.log("🃏 [_convertCards] 转换结果:", JSON.stringify(result))
        return result
    }

    // 卡牌转字符串
    var _cardToString = function(card){
        if (card.rank === 16) return "小王"
        if (card.rank === 17) return "大王"
        var ranks = ["", "", "", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"]
        var suits = ["♠", "♥", "♣", "♦"]
        return suits[card.suit] + ranks[card.rank]
    }

    // 转换客户端卡牌格式为后端格式
    var _convertClientCardsToServer = function(clientCards){
        return clientCards.map(function(card){
            return {
                suit: card.suit || 0,
                rank: card.value || card.rank,
                color: card.color || 0
            }
        })
    }
        
    // 初始化 WebSocket 连接
    that.initSocket = function(){
        var evt = _getEvent()
        if (!evt) {
            console.error("无法初始化 WebSocket：eventLister 未定义")
            return
        }
        
        // 更新连接状态
        _setConnectionState("connecting")
        
        var wsUrl = _serverUrl
        if (wsUrl.indexOf("ws://") !== 0 && wsUrl.indexOf("wss://") !== 0) {
            wsUrl = "ws://" + wsUrl + "/ws"
        }
        
        // 添加 Token 到 URL 参数（用于服务端认证用户身份）
        var myglobal = window.myglobal
        if (myglobal && myglobal.playerData && myglobal.playerData.token) {
            var separator = wsUrl.indexOf("?") > 0 ? "&" : "?"
            wsUrl = wsUrl + separator + "token=" + encodeURIComponent(myglobal.playerData.token)
            console.log("🔐 WebSocket 连接带上 Token")
        }
        
        console.log("连接服务器:", wsUrl)
        
        try {
            _socket = new WebSocket(wsUrl)
            
            _socket.onopen = function(){
                console.log("WebSocket 连接已打开")
                // 立即发送一条 JSON 消息，让服务器切换到 JSON 模式
                // 这样服务器后续的所有消息都会使用 JSON 格式
                var initMsg = {
                    type: "ping",
                    data: { timestamp: Date.now() }
                }
                _socket.send(JSON.stringify(initMsg))
                console.log("发送 JSON 初始化消息，切换服务器到 JSON 模式")
                
                // 标记为已连接（乐观设置，服务器确认后会再次设置）
                _isConnected = true
                _setConnectionState("connected")
            }
            
            _socket.onmessage = function(evt){
                try {
                    // 检查是否是 Blob 类型
                    if (evt.data instanceof Blob) {
                        // 使用 FileReader 读取 Blob 内容
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            try {
                                var text = e.target.result;
                                // 检查是否是 JSON 格式（以 { 开头）
                                if (text.trim().charAt(0) === '{') {
                                    var msgData = JSON.parse(text);
                                    _handleMessage(msgData);
                                } else {
                                    // 二进制 Protobuf 消息，忽略
                                    // 这通常是服务器在切换到 JSON 模式之前发送的 connected 消息
                                    console.log("收到 Protobuf 二进制消息，已忽略（服务器将切换到 JSON 模式）");
                                }
                            } catch(e) {
                                console.log("解析消息失败，可能是 Protobuf 格式:", e.message);
                            }
                        };
                        reader.onerror = function(e) {
                            console.error("读取 Blob 失败:", e);
                        };
                        reader.readAsText(evt.data);
                    } else {
                        // 直接解析 JSON
                        var msgData = JSON.parse(evt.data);
                        _handleMessage(msgData);
                    }
                } catch(e) {
                    console.error("解析消息失败:", e);
                }
            }
            
            _socket.onerror = function(error){
                console.error("WebSocket 错误:", error)
                _setConnectionState("disconnected")
                evt.fire("connection_error", error)
            }
            
            _socket.onclose = function(event){
                console.log("WebSocket 连接关闭")
                _isConnected = false
                _setConnectionState("disconnected")
                // 停止心跳
                _stopHeartbeat()
                evt.fire("connection_closed", event)
            }
        } catch(e) {
            console.error("创建 WebSocket 失败:", e)
            _setConnectionState("disconnected")
        }
    }

    // ========== 登录相关 ==========
    
    that.request_wxLogin = function(req, callback){
        var evt = _getEvent()
        if (!evt) return
        
        if (_isConnected) {
            callback && callback(0, {
                player_id: _playerId,
                player_name: _playerName
            })
        } else {
            evt.on("connection_success", function(data){
                callback && callback(0, data)
            })
        }
    }

    // ========== 房间相关 ==========
    
    that.request_creatroom = function(req, callback){
        // 支持传递房间配置ID
        var payload = {}
        if (req && req.room_config_id) {
            payload.room_config_id = req.room_config_id
        }
        _request(MessageType.CREATE_ROOM, payload, function(result, data){
            callback && callback(result, {
                roomid: data.room_code,
                bottom: 100,
                rate: 1
            })
        })
    }

    that.request_jion = function(req, callback){
        _request(MessageType.JOIN_ROOM, {
            room_code: req.roomid
        }, function(result, data){
            if (result === 0) {
                callback && callback(0, {
                    roomid: data.room_code,
                    bottom: 100,
                    rate: 1,
                    gold: 1000
                })
            } else {
                callback && callback(-1, {})
            }
        })
    }

    that.request_enter_room = function(req, callback){
        _request(MessageType.QUICK_MATCH, {}, function(result, data){
            if (result === 0 && data) {
                // 转换格式
                var players = data.players || []
                var playerdata = players.map(function(p, idx) {
                    return {
                        accountid: p.id,
                        nick_name: p.name,
                        avatarUrl: "avatar_1",
                        goldcount: 1000,
                        seatindex: idx + 1
                    }
                })
                callback && callback(0, {
                    seatindex: 1,
                    playerdata: playerdata,
                    roomid: data.room_code || "MATCH",
                    housemanageid: ""
                })
            } else {
                callback && callback(-1, {})
            }
        })
    }
    
    // ========== 房间管理 ==========
    
    // 获取房间列表
    that.getRoomList = function(callback){
        _request(MessageType.GET_ROOM_LIST, {}, function(result, data){
            if (result === 0 && data && data.rooms) {
                callback && callback(0, data.rooms)
            } else {
                callback && callback(-1, [])
            }
        })
    }
    
    // 创建房间
    that.createRoom = function(roomConfigId, callback){
        var payload = {}
        if (roomConfigId) {
            payload.room_config_id = roomConfigId
        }
        _request(MessageType.CREATE_ROOM, payload, function(result, data){
            if (result === 0 && data) {
                callback && callback(0, data)
            } else {
                callback && callback(-1, {})
            }
        })
    }
    
    // 加入房间
    that.joinRoom = function(roomCode, callback){
        _request(MessageType.JOIN_ROOM, { room_code: roomCode }, function(result, data){
            console.log("📨 [joinRoom] 收到响应, result:", result)
            console.log("📨 [joinRoom] 收到响应, data:", JSON.stringify(data, null, 2))
            console.log("📨 [joinRoom] data.creator_id:", data ? data.creator_id : "undefined")
            console.log("📨 [joinRoom] data.players:", data ? JSON.stringify(data.players) : "undefined")
            if (result === 0 && data) {
                callback && callback(0, data)
            } else {
                callback && callback(-1, {})
            }
        })
    }
    
    // 监听房间列表结果
    that.onRoomListResult = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_list_result", callback)
    }
    
    // 监听房间列表实时更新
    that.onRoomListUpdate = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_list_update", callback)
    }
    
    // 取消监听房间列表实时更新
    that.offRoomListUpdate = function(callback){
        var evt = _getEvent()
        if (evt) evt.off("room_list_update", callback)
    }
    
    // 监听房间创建结果
    that.onRoomCreated = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_created", callback)
    }
    
    // 监听加入房间结果
    that.onRoomJoined = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_joined", callback)
    }

    // ========== 游戏流程 ==========

    that.requestReady = function(){
        _sendmsg(MessageType.READY, {}, null)
    }

    that.requestStart = function(callback){
        _request(MessageType.READY, {}, callback)
    }

    // 【新增】发送叫地主请求
    that.requestBid = function(bid) {
        _sendmsg(MessageType.BID, {
            bid: bid
        }, null)
    }

    // 【新增】发送抢地主请求（新版统一接口）
    // action: "call" = 抢, "pass" = 不抢
    that.requestCallLandlord = function(action) {
        _sendmsg(MessageType.CALL_LANDLORD, {
            action: action
        }, null)
    }

    that.requestRobState = function(state){
        // 发送 rob 消息类型，而不是 bid
        _sendmsg(MessageType.ROB, {
            rob: state.bid || state
        }, null)
    }

    that.request_chu_card = function(req, callback){
        // 🔧【修复】正确处理 choose_card_data 格式
        // req 可能是两种格式：
        // 1. [{cardid: {...}, card_data: {...}}, ...] - 来自 gameingUI.js
        // 2. {cards: [...]} - 其他调用方式
        var cardDataArray = []
        if (Array.isArray(req)) {
            // 格式1：直接是数组，每个元素包含 card_data
            cardDataArray = req.map(function(item) {
                return item.card_data || item
            })
        } else if (req && req.cards) {
            // 格式2：包含 cards 属性
            cardDataArray = req.cards
        } else if (req) {
            // 兜底：直接当作卡牌数组
            cardDataArray = Array.isArray(req) ? req : [req]
        }
        
        var cards = _convertClientCardsToServer(cardDataArray)
        console.log("🃏 [request_chu_card] 发送出牌请求，牌数:", cards.length)
        for (var i = 0; i < cards.length; i++) {
            console.log("🃏 [request_chu_card] 牌[" + i + "]: suit=" + cards[i].suit + ", rank=" + cards[i].rank)
        }
        _request(MessageType.PLAY_CARDS, {
            cards: cards
        }, callback)
    }

    that.request_buchu_card = function(req, callback){
        _request(MessageType.PASS, {}, callback)
    }

    // ============================================================
    // 【核心】游戏阶段事件监听（服务端权威驱动）
    // ============================================================

    // 抢地主阶段开始
    that.onCallLandlordStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("call_landlord_start_notify", callback)
    }

    // 轮到玩家抢地主
    that.onCallLandlordTurn = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("call_landlord_turn_notify", callback)
    }

    // 抢地主结果
    that.onCallLandlordResult = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("call_landlord_result_notify", callback)
    }

    // 抢地主阶段结束
    that.onCallLandlordEnd = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("call_landlord_end_notify", callback)
    }

    // 阶段事件
    that.onPhaseReadyStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_ready_start", callback)
    }

    that.onPhaseReadyEnd = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_ready_end", callback)
    }

    that.onPhaseDealStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_deal_start", callback)
    }

    that.onPhaseDealEnd = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_deal_end", callback)
    }

    that.onPhasePlayStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_play_start", callback)
    }

    that.onPhasePlayEnd = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_play_end", callback)
    }

    that.onPhaseSettlementStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_settlement_start", callback)
    }

    that.onPhaseSettlementEnd = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("phase_settlement_end", callback)
    }

    // ========== 事件监听 ==========
    
    that.onPlayerJoinRoom = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("player_joinroom_notify", callback)
    }

    that.onPlayerReady = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("player_ready_notify", callback)
    }

    that.onGameStart = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("gameStart_notify", callback)
    }

    that.onChangeHouseManage = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("changehousemanage_notify", callback)
    }

    that.onPushCards = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("pushcard_notify", callback)
    }

    // 【新增】叫地主轮次通知
    that.onBidTurn = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("bid_turn_notify", callback)
    }
    
    // 【新增】叫地主结果通知
    that.onBidResult = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("bid_result_notify", callback)
    }

    that.onCanRobState = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("canrob_notify", callback)
    }

    that.onRobState = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("canrob_state_notify", callback)
    }

    that.onChangeMaster = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("change_master_notify", callback)
    }

    that.onShowBottomCard = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("change_showcard_notify", callback)
    }

    that.onCanChuCard = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("can_chu_card_notify", callback)
    }

    that.onRoomChangeState = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_state_notify", callback)
    }

    that.onOtherPlayerChuCard = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("other_chucard_notify", callback)
    }
    
    // 房间恢复事件（重连后恢复房间状态）
    that.onRoomRestored = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("room_restored", callback)
    }
    
    // 游戏状态恢复事件（重连后恢复牌局）
    that.onGameStateRestore = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("game_state_restore", callback)
    }
    
    // 玩家掉线通知事件
    that.onPlayerOffline = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("player_offline_notify", callback)
    }
    
    // 玩家上线通知事件
    that.onPlayerOnline = function(callback){
        var evt = _getEvent()
        if (evt) evt.on("player_online_notify", callback)
    }
    
    that.isConnected = function(){
        return _isConnected
    }
    
    that.isInRoom = function(){
        return _isInRoom
    }
    
    that.getCurrentRoomCode = function(){
        return _currentRoomCode
    }
    
    // 获取 WebSocket 物理连接状态（readyState === OPEN）
    that.isWebSocketOpen = function(){
        return _socket && _socket.readyState === 1 // WebSocket.OPEN = 1
    }
    
    // 获取底层 WebSocket 对象（供外部检查 readyState）
    that.getSocket = function(){
        return _socket
    }
    
    that.getPlayerInfo = function(){
        return {
            id: _playerId,
            name: _playerName
        }
    }
    
    // 获取重连令牌（用于刷新页面后重连）
    that.getReconnectToken = function(){
        return _reconnectToken
    }
    
    // 保存重连信息到 localStorage
    that.saveReconnectInfo = function(){
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ddz_reconnect_token', _reconnectToken)
            localStorage.setItem('ddz_player_id', _playerId)
            localStorage.setItem('ddz_room_code', _currentRoomCode)
        }
    }
    
    // 从 localStorage 加载重连信息
    that.loadReconnectInfo = function(){
        if (typeof localStorage !== 'undefined') {
            return {
                token: localStorage.getItem('ddz_reconnect_token') || '',
                playerId: localStorage.getItem('ddz_player_id') || '',
                roomCode: localStorage.getItem('ddz_room_code') || ''
            }
        }
        return { token: '', playerId: '', roomCode: '' }
    }
    
    // 清除重连信息
    that.clearReconnectInfo = function(){
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('ddz_reconnect_token')
            localStorage.removeItem('ddz_player_id')
            localStorage.removeItem('ddz_room_code')
        }
    }

    // ========== 强制下线处理 ==========
    
    // 处理强制下线消息
    var _handleForceLogout = function(data) {
        var reason = data.reason || "您已被管理员强制下线"
        console.warn("🚫 强制下线原因:", reason)
        
        // 设置强制下线标记
        if (typeof window.myglobal !== 'undefined' && window.myglobal.onForceLogout) {
            window.myglobal.onForceLogout(reason)
        } else if (typeof window.playerData !== 'undefined') {
            // 降级处理
            var pd = window.playerData()
            if (pd && pd.setForceLogout) {
                pd.setForceLogout(reason)
            }
        }
        
        // 关闭 WebSocket 连接
        if (_socket) {
            _socket.close()
        }
        _isConnected = false
        
        // 触发强制下线事件
        var evt = _getEvent()
        if (evt) {
            evt.fire("force_logout", {
                reason: reason,
                playerId: data.player_id
            })
        }
    }
    
    // 断开连接
    that.disconnect = function() {
        _stopHeartbeat()
        if (_socket) {
            _socket.close()
        }
        _isConnected = false
        _setConnectionState("disconnected")
        console.log("WebSocket 连接已断开")
    }

    // ========== 心跳机制 ==========
    
    // 启动心跳
    var _startHeartbeat = function() {
        if (_isHeartbeatRunning) {
            console.log("心跳已在运行中")
            return
        }
        
        _isHeartbeatRunning = true
        _missedHeartbeats = 0
        _lastHeartbeatTime = Date.now()
        
        console.log("💓 启动心跳检测，间隔: " + _heartbeatIntervalMs + "ms")
        
        // 立即发送一次心跳
        _sendHeartbeat()
        
        // 定时发送心跳
        _heartbeatInterval = setInterval(function() {
            if (_isConnected && _socket && _socket.readyState === WebSocket.OPEN) {
                _sendHeartbeat()
            }
        }, _heartbeatIntervalMs)
    }
    
    // 停止心跳
    var _stopHeartbeat = function() {
        if (_heartbeatInterval) {
            clearInterval(_heartbeatInterval)
            _heartbeatInterval = null
        }
        if (_heartbeatTimeout) {
            clearTimeout(_heartbeatTimeout)
            _heartbeatTimeout = null
        }
        _isHeartbeatRunning = false
        _missedHeartbeats = 0
        console.log("💔 心跳检测已停止")
    }
    
    // 发送心跳
    var _sendHeartbeat = function() {
        if (!_socket || _socket.readyState !== WebSocket.OPEN) {
            console.log("心跳发送失败：WebSocket 未连接")
            return
        }
        
        var msg = {
            type: MessageType.PING,
            payload: {
                timestamp: Date.now()
            }
        }
        
        try {
            _socket.send(JSON.stringify(msg))
            _lastHeartbeatTime = Date.now()
            console.log("💓 发送心跳 ping")
            
            // 设置心跳超时
            _setHeartbeatTimeout()
        } catch (e) {
            console.error("发送心跳失败:", e)
            _onHeartbeatFailed()
        }
    }
    
    // 设置心跳超时
    var _setHeartbeatTimeout = function() {
        // 清除之前的超时定时器
        if (_heartbeatTimeout) {
            clearTimeout(_heartbeatTimeout)
        }
        
        _heartbeatTimeout = setTimeout(function() {
            console.warn("💔 心跳超时，未收到响应")
            _onHeartbeatFailed()
        }, _heartbeatTimeoutMs)
    }
    
    // 心跳失败处理
    var _onHeartbeatFailed = function() {
        _missedHeartbeats++
        console.warn("💔 连续丢失心跳次数: " + _missedHeartbeats + "/" + _maxMissedHeartbeats)
        
        if (_missedHeartbeats >= _maxMissedHeartbeats) {
            console.error("💔 心跳连续失败次数过多，判定连接断开")
            _handleConnectionLost()
        }
    }
    
    // 收到心跳响应
    var _onHeartbeatAck = function(data) {
        // 清除超时定时器
        if (_heartbeatTimeout) {
            clearTimeout(_heartbeatTimeout)
            _heartbeatTimeout = null
        }
        
        _missedHeartbeats = 0
        
        // data 是 payload，包含 client_timestamp 和 server_timestamp
        var clientTimestamp = data.client_timestamp || data.clientTimestamp || _lastHeartbeatTime
        var latency = Date.now() - clientTimestamp
        console.log("💓 收到心跳 pong，延迟: " + latency + "ms")
        
        // 触发心跳成功事件
        var evt = _getEvent()
        if (evt) {
            evt.fire("heartbeat_success", {
                latency: latency,
                serverTime: data.server_timestamp || data.serverTimestamp || Date.now()
            })
        }
    }
    
    // 处理连接丢失
    var _handleConnectionLost = function() {
        console.error("💔 连接已丢失")
        _isConnected = false
        _setConnectionState("disconnected")
        _stopHeartbeat()
        
        // 触发连接丢失事件
        var evt = _getEvent()
        if (evt) {
            evt.fire("connection_lost", {
                reason: "heartbeat_timeout"
            })
        }
        
        // 通知全局状态管理
        if (typeof window.myglobal !== 'undefined' && window.myglobal.onConnectionLost) {
            window.myglobal.onConnectionLost()
        }
    }
    
    // ========== 状态管理 ==========
    
    // 设置连接状态
    var _setConnectionState = function(state) {
        var oldState = _connectionState
        _connectionState = state
        
        if (oldState !== state) {
            console.log("🔌 连接状态变化: " + oldState + " -> " + state)
            
            // 通知所有状态监听器
            for (var i = 0; i < _stateListeners.length; i++) {
                try {
                    _stateListeners[i](state, oldState)
                } catch (e) {
                    console.error("状态监听器执行错误:", e)
                }
            }
            
            // 触发状态变化事件
            var evt = _getEvent()
            if (evt) {
                evt.fire("connection_state_changed", {
                    state: state,
                    oldState: oldState
                })
            }
        }
    }
    
    // 获取连接状态
    that.getConnectionState = function() {
        return _connectionState
    }
    
    // 添加状态监听器
    that.addStateListener = function(listener) {
        if (typeof listener === 'function') {
            _stateListeners.push(listener)
            // 立即通知当前状态
            listener(_connectionState, _connectionState)
        }
    }
    
    // 移除状态监听器
    that.removeStateListener = function(listener) {
        for (var i = _stateListeners.length - 1; i >= 0; i--) {
            if (_stateListeners[i] === listener) {
                _stateListeners.splice(i, 1)
            }
        }
    }
    
    // ========== 心跳公开方法 ==========
    
    // 获取心跳状态
    that.getHeartbeatStatus = function() {
        return {
            isRunning: _isHeartbeatRunning,
            lastHeartbeatTime: _lastHeartbeatTime,
            missedHeartbeats: _missedHeartbeats,
            maxMissedHeartbeats: _maxMissedHeartbeats,
            interval: _heartbeatIntervalMs,
            timeout: _heartbeatTimeoutMs
        }
    }
    
    // 手动触发心跳
    that.ping = function() {
        if (_isConnected) {
            _sendHeartbeat()
        }
    }

    return that
}

console.log("socket_ctr.js loaded");
