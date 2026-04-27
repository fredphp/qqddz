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
        PLAY_CARDS: "play_cards",
        PASS: "pass",
        CHAT: "chat",
        
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
        LANDLORD: "landlord",
        PLAY_TURN: "play_turn",
        CARD_PLAYED: "card_played",
        PLAYER_PASS: "player_pass",
        GAME_OVER: "game_over",
        ERROR: "error",
        FORCE_LOGOUT: "force_logout", // 强制下线
        
        // 心跳消息
        HEARTBEAT: "heartbeat",
        HEARTBEAT_ACK: "heartbeat_ack",
    }

    // 发送消息
    var _sendmsg = function(type, data, callindex){
        if (!_socket || _socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket 未连接")
            return
        }
        var msg = {
            type: type,
            data: data || {},
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
        console.log("收到消息:", JSON.stringify(msgData))
        
        var evt = _getEvent()
        if (!evt) return
        
        var type = msgData.type
        var data = msgData.data || {}
        var callIndex = msgData.callIndex
        
        // 处理回调
        if (callIndex && respone_map[callIndex]) {
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
                // 启动心跳
                _startHeartbeat()
                evt.fire("connection_success", data)
                break
                
            case MessageType.ROOM_CREATED:
                evt.fire("room_created", data)
                break
                
            case MessageType.ROOM_JOINED:
                evt.fire("room_joined", data)
                break
                
            case MessageType.PLAYER_JOINED:
                evt.fire("player_joinroom_notify", {
                    accountid: data.player ? data.player.id : "",
                    nick_name: data.player ? data.player.name : "",
                    avatarUrl: "avatar_1",
                    goldcount: 1000,
                    seatindex: data.player ? data.player.seat : 0
                })
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
                
            case MessageType.GAME_START:
                evt.fire("gameStart_notify", data)
                break
                
            case MessageType.DEAL_CARDS:
                var cards = _convertCards(data.cards || [])
                var bottomCards = _convertCards(data.bottom_cards || [])
                evt.fire("pushcard_notify", {
                    cards: cards,
                    bottom_cards: bottomCards
                })
                break
                
            case MessageType.BID_TURN:
                evt.fire("canrob_notify", data.player_id)
                break
                
            case MessageType.BID_RESULT:
                evt.fire("canrob_state_notify", {
                    accountid: data.player_id,
                    state: data.bid
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
                evt.fire("can_chu_card_notify", data.player_id)
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
                
            case MessageType.HEARTBEAT_ACK:
                // 收到心跳响应
                _onHeartbeatAck(data)
                break
                
            default:
                console.log("未处理的消息类型:", type)
                evt.fire(type, data)
        }
    }

    // 转换卡牌格式（后端格式 -> 客户端格式）
    var _convertCards = function(serverCards){
        return serverCards.map(function(card){
            var cardValue = card.rank
            if (card.rank >= 16) {
                cardValue = card.rank === 17 ? 17 : 16
            }
            return {
                value: cardValue,
                suit: card.suit,
                color: card.color,
                index: card.rank, // 添加 index 属性
                str: _cardToString(card)
            }
        })
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
        _request(MessageType.CREATE_ROOM, {}, function(result, data){
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

    // ========== 游戏流程 ==========
    
    that.requestReady = function(){
        _sendmsg(MessageType.READY, {}, null)
    }

    that.requestStart = function(callback){
        _request(MessageType.READY, {}, callback)
    }

    that.requestRobState = function(state){
        _sendmsg(MessageType.BID, {
            bid: state.bid || state
        }, null)
    }

    that.request_chu_card = function(req, callback){
        var cards = _convertClientCardsToServer(req.cards || [])
        _request(MessageType.PLAY_CARDS, {
            cards: cards
        }, callback)
    }

    that.request_buchu_card = function(req, callback){
        _request(MessageType.PASS, {}, callback)
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
    
    that.isConnected = function(){
        return _isConnected
    }
    
    that.getPlayerInfo = function(){
        return {
            id: _playerId,
            name: _playerName
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
            type: MessageType.HEARTBEAT,
            data: {
                timestamp: Date.now(),
                player_id: _playerId
            }
        }
        
        try {
            _socket.send(JSON.stringify(msg))
            _lastHeartbeatTime = Date.now()
            console.log("💓 发送心跳")
            
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
        
        var latency = Date.now() - _lastHeartbeatTime
        console.log("💓 心跳响应，延迟: " + latency + "ms")
        
        // 触发心跳成功事件
        var evt = _getEvent()
        if (evt) {
            evt.fire("heartbeat_success", {
                latency: latency,
                serverTime: data.server_time || Date.now()
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
