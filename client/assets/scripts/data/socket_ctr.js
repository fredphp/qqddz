/**
 * 斗地主客户端通信层
 * 使用 WebSocket 连接 Go 后端
 * 纯全局变量方式
 */

window.socketCtr = function(){
    var that = {}
    var respone_map = {} 
    var call_index = 0
    var _socket = null
    var event = window.eventLister({})
    var _isConnected = false
    var _playerId = ""
    var _playerName = ""
    var _reconnectToken = ""
    
    // 获取服务器地址
    var _serverUrl = "ws://localhost:1780/ws"
    if (typeof window !== 'undefined' && window.defines && window.defines.serverUrl) {
        _serverUrl = window.defines.serverUrl
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
                event.fire("connection_success", data)
                break
                
            case MessageType.ROOM_CREATED:
                event.fire("room_created", data)
                break
                
            case MessageType.ROOM_JOINED:
                event.fire("room_joined", data)
                break
                
            case MessageType.PLAYER_JOINED:
                event.fire("player_joinroom_notify", {
                    accountid: data.player ? data.player.id : "",
                    nick_name: data.player ? data.player.name : "",
                    avatarUrl: "avatar_1",
                    goldcount: 1000,
                    seatindex: data.player ? data.player.seat : 0
                })
                break
                
            case MessageType.PLAYER_LEFT:
                event.fire("player_left", data)
                break
                
            case MessageType.PLAYER_READY:
                event.fire("player_ready_notify", data)
                break
                
            case MessageType.MATCH_FOUND:
                event.fire("match_found", data)
                break
                
            case MessageType.GAME_START:
                event.fire("gameStart_notify", data)
                break
                
            case MessageType.DEAL_CARDS:
                var cards = _convertCards(data.cards || [])
                var bottomCards = _convertCards(data.bottom_cards || [])
                event.fire("pushcard_notify", {
                    cards: cards,
                    bottom_cards: bottomCards
                })
                break
                
            case MessageType.BID_TURN:
                event.fire("canrob_notify", data.player_id)
                break
                
            case MessageType.BID_RESULT:
                event.fire("canrob_state_notify", {
                    accountid: data.player_id,
                    state: data.bid
                })
                break
                
            case MessageType.LANDLORD:
                var bottomCards = _convertCards(data.bottom_cards || [])
                event.fire("change_master_notify", data.player_id)
                event.fire("change_showcard_notify", {
                    cards: bottomCards
                })
                break
                
            case MessageType.PLAY_TURN:
                event.fire("can_chu_card_notify", data.player_id)
                break
                
            case MessageType.CARD_PLAYED:
                var cards = _convertCards(data.cards || [])
                event.fire("other_chucard_notify", {
                    accountid: data.player_id,
                    cards: cards,
                    cards_left: data.cards_left
                })
                break
                
            case MessageType.PLAYER_PASS:
                event.fire("other_chucard_notify", {
                    accountid: data.player_id,
                    cards: [],
                    is_pass: true
                })
                break
                
            case MessageType.GAME_OVER:
                event.fire("game_over", data)
                break
                
            case MessageType.ERROR:
                console.error("服务器错误:", data.message)
                event.fire("error", data)
                break
                
            default:
                console.log("未处理的消息类型:", type)
                event.fire(type, data)
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
        var wsUrl = _serverUrl
        if (wsUrl.indexOf("ws://") !== 0 && wsUrl.indexOf("wss://") !== 0) {
            wsUrl = "ws://" + wsUrl + "/ws"
        }
        
        console.log("连接服务器:", wsUrl)
        
        try {
            _socket = new WebSocket(wsUrl)
            
            _socket.onopen = function(){
                console.log("WebSocket 连接已打开")
            }
            
            _socket.onmessage = function(evt){
                try {
                    var msgData = JSON.parse(evt.data)
                    _handleMessage(msgData)
                } catch(e) {
                    console.error("解析消息失败:", e)
                }
            }
            
            _socket.onerror = function(error){
                console.error("WebSocket 错误:", error)
                event.fire("connection_error", error)
            }
            
            _socket.onclose = function(evt){
                console.log("WebSocket 连接关闭")
                _isConnected = false
                event.fire("connection_closed", evt)
            }
        } catch(e) {
            console.error("创建 WebSocket 失败:", e)
        }
    }

    // ========== 登录相关 ==========
    
    that.request_wxLogin = function(req, callback){
        if (_isConnected) {
            callback && callback(0, {
                player_id: _playerId,
                player_name: _playerName
            })
        } else {
            event.on("connection_success", function(data){
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
        event.on("player_joinroom_notify", callback)
    }

    that.onPlayerReady = function(callback){
        event.on("player_ready_notify", callback)
    }

    that.onGameStart = function(callback){
        event.on("gameStart_notify", callback)
    }

    that.onChangeHouseManage = function(callback){
        event.on("changehousemanage_notify", callback)
    }

    that.onPushCards = function(callback){
        event.on("pushcard_notify", callback)
    }

    that.onCanRobState = function(callback){
        event.on("canrob_notify", callback)
    }

    that.onRobState = function(callback){
        event.on("canrob_state_notify", callback)
    }

    that.onChangeMaster = function(callback){
        event.on("change_master_notify", callback)
    }

    that.onShowBottomCard = function(callback){
        event.on("change_showcard_notify", callback)
    }

    that.onCanChuCard = function(callback){
        event.on("can_chu_card_notify", callback)
    }

    that.onRoomChangeState = function(callback){
        event.on("room_state_notify", callback)
    }

    that.onOtherPlayerChuCard = function(callback){
        event.on("other_chucard_notify", callback)
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
