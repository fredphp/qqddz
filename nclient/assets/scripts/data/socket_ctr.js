/**
 * 斗地主客户端通信层
 * 使用 WebSocket 连接 Go 后端
 * 纯全局变量方式，延迟初始化
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
                console.log("连接成功，玩家ID:", _playerId)
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
                evt.fire("connection_error", error)
            }
            
            _socket.onclose = function(event){
                console.log("WebSocket 连接关闭")
                _isConnected = false
                evt.fire("connection_closed", event)
            }
        } catch(e) {
            console.error("创建 WebSocket 失败:", e)
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

    return that
}

console.log("socket_ctr.js loaded");
