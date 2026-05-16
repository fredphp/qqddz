// 使用全局变量，不使用 require
// 【修复版本】简化发牌逻辑，不再使用定时器调度
// 核心原则：
// 1. gameingUI.js 自己处理发牌动画
// 2. gameScene.js 只负责转发事件给 player_node
// 3. 不依赖 scheduleOnce 控制发牌节奏

cc.Class({
    extends: cc.Component,

    properties: {
        di_label: cc.Label,
        beishu_label: cc.Label,
        roomid_label: cc.Label,
        player_node_prefabs: cc.Prefab,
        players_seat_pos: cc.Node,
    },

    onLoad() {
        
        var myglobal = window.myglobal
        var RoomState = window.RoomState || { ROOM_INVALID: -1 }
        var isopen_sound = window.isopen_sound || 1

        if (!myglobal || !myglobal.playerData || !myglobal.socket) {
            console.error("gameScene: myglobal、playerData 或 socket 未定义")
            this._waitForInit()
            return
        }
        
        this._initScene(myglobal, RoomState, isopen_sound)
        this._startOnlineMonitoring()
    },

    // ============================================================
    // 在线监测和其他功能
    // ============================================================

    _startOnlineMonitoring: function() {
        var myglobal = window.myglobal
        if (!myglobal) {
            console.warn("gameScene: myglobal 未定义，无法启动在线监测")
            return
        }
        
        
        var self = this
        this._onlineStatusHandler = function(isOnline) {
            if (!isOnline) {
                self._showOfflineMessage()
            }
        }
        
        if (myglobal.addOnlineStatusListener) {
            myglobal.addOnlineStatusListener(this._onlineStatusHandler)
        }
        
        if (myglobal.eventlister) {
            myglobal.eventlister.on("force_logout", function(data) {
                console.warn("🚫 游戏场景收到强制下线事件:", data)
                self._handleForceLogout(data)
            })
        }
    },
    
    _showOfflineMessage: function() {
        console.warn("💔 游戏场景：网络连接已断开")
    },
    
    _handleForceLogout: function(data) {
        var reason = data.reason || "您已被强制下线"
        console.warn("🚫 游戏场景强制下线:", reason)
        
        var myglobal = window.myglobal
        if (myglobal && myglobal.stopOnlineMonitoring) {
            myglobal.stopOnlineMonitoring()
        }
        
        var self = this
        this.scheduleOnce(function() {
            if (typeof alert === 'function') {
                alert(reason + "\n\n请重新登录")
            }
            cc.director.loadScene("loginScene")
        }, 0.5)
    },
    
    _stopOnlineMonitoring: function() {
        var myglobal = window.myglobal
        
        if (myglobal && myglobal.removeOnlineStatusListener && this._onlineStatusHandler) {
            myglobal.removeOnlineStatusListener(this._onlineStatusHandler)
            this._onlineStatusHandler = null
        }
    },
    
    _waitForInit: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;
        
        var checkInit = function() {
            attempts++;
            
            var myglobal = window.myglobal;
            if (myglobal && myglobal.playerData && myglobal.socket) {
                var RoomState = window.RoomState || { ROOM_INVALID: -1 };
                var isopen_sound = window.isopen_sound || 1;
                self._initScene(myglobal, RoomState, isopen_sound);
            } else if (attempts < maxAttempts) {
                setTimeout(checkInit, 100);
            } else {
                console.error("gameScene 初始化超时");
            }
        };
        
        setTimeout(checkInit, 100);
    },
    
    _initScene: function(myglobal, RoomState, isopen_sound) {
        this.playerNodeList = []
        
        var bottom = myglobal.playerData.bottom || 1
        var rate = myglobal.playerData.rate || 1
        
        this.di_label.string = "底:" + bottom
        this.beishu_label.string = "倍数:" + rate
        this.roomstate = RoomState.ROOM_INVALID
        this._isWaitingForPlayers = false


        // 监听，给其他玩家发牌(内部事件)
        // 【核心】player_node 直接显示 17 张牌背，不再逐张动画
        this.node.on("pushcard_other_event", function() {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("push_card_event")
                }
            }
        }.bind(this))

        // 监听房间状态改变事件
        myglobal.socket.onRoomChangeState(function(data) {
            this.roomstate = data
            
            if (data !== RoomState.ROOM_INVALID && this._isWaitingForPlayers) {
                this._hideWaitingUI()
            }
        }.bind(this))

        this.node.on("canrob_event", function(event) {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_canrob_event", event)
                }
            }
        }.bind(this))

        this.node.on("choose_card_event", function(event) {
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                return
            }
            gameui_node.emit("choose_card_event", event)
        }.bind(this))

        this.node.on("unchoose_card_event", function(event) {
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                return
            }
            gameui_node.emit("unchoose_card_event", event)
        }.bind(this))

        var currentRoomCode = myglobal.socket.getCurrentRoomCode()
        var isInRoom = myglobal.socket.isInRoom()
        
        
        var roomData = myglobal.roomData
        
        if (isInRoom && currentRoomCode && !roomData) {
            roomData = {
                roomid: currentRoomCode,
                room_code: currentRoomCode,
                seatindex: 1,
                playerdata: [{
                    accountid: myglobal.playerData.accountid || myglobal.playerData.playerId,
                    nick_name: myglobal.playerData.nickName,
                    avatarUrl: "avatar_1",
                    gold_count: myglobal.playerData.gobal_count || 1000, // 🔧【修复】使用 gold_count 字段
                    goldcount: myglobal.playerData.gobal_count || 1000,  // 兼容旧客户端
                    seatindex: 1,
                    isready: true
                }]
            }
        }
        
        if (roomData) {
            this._processRoomData(roomData, myglobal, isopen_sound)
        } else {
            myglobal.socket.request_enter_room({}, function(err, result) {
                if (err != 0) {
                } else {
                    this._processRoomData(result, myglobal, isopen_sound)
                }
            }.bind(this))
        }

        myglobal.socket.onPlayerJoinRoom(function(join_playerdata) {
            this.addPlayerNode(join_playerdata)

            if (!this._playerdataList) {
                this._playerdataList = []
            }
            this._playerdataList.push(join_playerdata)

            if (this._isWaitingForPlayers) {
                this._showWaitingUI(3 - this._playerdataList.length, this._currentRoomCode)
            }

            // 🔧【修复】添加空值检查
            if (this.playerNodeList && this.playerNodeList.length >= 3) {
                this._hideWaitingUI()
            }
        }.bind(this))

        myglobal.socket.onPlayerReady(function(data) {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("player_ready_notify", data)
                }
            }
        }.bind(this))

        myglobal.socket.onGameStart(function() {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("gamestart_event")
                }
            }

            var gamebeforeUI = this.node.getChildByName("gamebeforeUI")
            if (gamebeforeUI) {
                gamebeforeUI.active = false
            }
        }.bind(this))

        myglobal.socket.onRobState(function(event) {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            // 🔧【修复】添加 round 字段，区分叫地主和抢地主
            var eventWithRound = Object.assign({}, event, { round: 2 })
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_rob_state_event", eventWithRound)
                }
            }
        }.bind(this))
        
        // 🔧【新增】监听叫地主结果（第一轮）
        myglobal.socket.onBidResult(function(event) {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            // 🔧【修复】添加 round 字段，区分叫地主和抢地主
            var eventWithRound = Object.assign({}, event, { round: 1 })
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_rob_state_event", eventWithRound)
                }
            }
        }.bind(this))

        myglobal.socket.onChangeMaster(function(event) {
            myglobal.playerData.master_accountid = event
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_changemaster_event", event)
                }
            }
        }.bind(this))

        // 🔧【新增】监听出牌阶段开始
        myglobal.socket.onPlayStart(function(data) {
            // 设置房间状态为出牌阶段
            this.roomstate = RoomState.ROOM_PLAYING
        }.bind(this))

        this.node.on("update_card_count_event", function(data) {
            // 🔧【修复】添加空值检查
            if (!this.playerNodeList) return
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("update_card_count_event", data)
                }
            }
        }.bind(this))

        myglobal.socket.onShowBottomCard(function(event) {
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                return
            }
            gameui_node.emit("show_bottom_card_event", event)
        }.bind(this))
        
        myglobal.socket.onRoomRestored(function(data) {
            if (data.room_code) {
                var restoredRoomData = {
                    roomid: data.room_code,
                    room_code: data.room_code,
                    seatindex: 1,
                    playerdata: [{
                        accountid: data.player_id,
                        nick_name: data.player_name,
                        avatarUrl: "avatar_1",
                        gold_count: data.gold_count || 1000, // 🔧【修复】使用 gold_count 字段
                        goldcount: data.gold_count || 1000,  // 兼容旧客户端
                        seatindex: 1
                    }]
                }
                this._processRoomData(restoredRoomData, myglobal, isopen_sound)
            }
        }.bind(this))
        
        // 【新增】监听游戏状态恢复事件
        this.node.on("game_state_restored", function(data) {
            this._onGameStateRestored(data)
        }.bind(this))
        
        // 【新增】监听玩家掉线通知
        myglobal.socket.onPlayerOffline(function(data) {
            this._onPlayerOffline(data)
        }.bind(this))
        
        // 【新增】监听玩家上线通知
        myglobal.socket.onPlayerOnline(function(data) {
            this._onPlayerOnline(data)
        }.bind(this))
        
        // 🔧【修复】监听 room_joined 事件更新房间号和玩家数据
        // 竞技场模式下，先进入游戏场景，后收到真正的房间号
        myglobal.socket.onRoomJoined(function(data) {
            console.log("🎮 [gameScene] 收到 room_joined 消息:", JSON.stringify(data))
            
            // 更新房间号
            if (data && data.room_code) {
                if (this.roomid_label) {
                    var currentText = this.roomid_label.string || "";
                    var currentRoomCode = currentText.replace("房间号:", "");
                    // 🔧【修复】如果当前房间号为空或看起来是期号（长度>10），更新为正确的房间号
                    if (currentRoomCode === "" || currentRoomCode.length > 10) {
                        this.roomid_label.string = "房间号:" + data.room_code;
                        console.log("🎮 [gameScene] 更新房间号: " + data.room_code);
                    }
                } else {
                    console.warn("🎮 [gameScene] roomid_label 未绑定");
                }
                // 🔧【新增】隐藏加载界面（房间号已更新）
                this._hideArenaLoadingUI()
            }
            
            // 🔧【关键修复】用 ROOM_JOINED 数据更新玩家信息（头像、金币等）
            // 简化匹配逻辑：机器人通过 ID 匹配，当前玩家通过位置索引 0 匹配
            if (data && data.players && this.playerNodeList) {
                console.log("🎮 [gameScene] 更新玩家数据，玩家数量:", data.players.length);
                
                // 获取当前玩家的 serverPlayerId（UUID 格式）
                var currentServerPlayerId = myglobal.playerData && myglobal.playerData.serverPlayerId;
                console.log("🎮 [gameScene] 当前玩家 serverPlayerId:", currentServerPlayerId);
                
                // 🔧【关键修复】遍历服务端玩家列表，更新所有玩家数据
                for (var i = 0; i < data.players.length; i++) {
                    var serverPlayer = data.players[i];
                    
                    // 🔧【修复】判断是否是当前玩家：
                    // 1. ID 匹配 serverPlayerId
                    // 2. 或者 ID 是 UUID 格式（包含 '-'）且不匹配已知的机器人 ID
                    var isCurrentPlayer = (serverPlayer.id === currentServerPlayerId) || 
                                          (serverPlayer.id && serverPlayer.id.indexOf('-') > 0 && !this._isKnownRobotId(serverPlayer.id));
                    
                    console.log("🎮 [gameScene] 处理玩家: " + serverPlayer.name + ", id=" + serverPlayer.id + ", isCurrentPlayer=" + isCurrentPlayer);
                    
                    // 查找对应的玩家节点
                    for (var j = 0; j < this.playerNodeList.length; j++) {
                        var playerNode = this.playerNodeList[j];
                        if (!playerNode) continue;
                        
                        var playerScript = playerNode.getComponent("player_node");
                        if (!playerScript) continue;
                        
                        // 🔧【简化匹配逻辑】
                        // 1. 机器人玩家：通过 accountid 匹配
                        // 2. 当前玩家：通过位置索引 0 匹配（当前玩家始终在位置 0）
                        var isMatch = false;
                        
                        if (isCurrentPlayer) {
                            // 当前玩家：匹配位置索引 0 的节点
                            if (playerScript.seat_index === 0) {
                                isMatch = true;
                                console.log("🎮 [gameScene] 当前玩家匹配成功（位置索引 0）");
                            }
                        } else {
                            // 其他玩家（机器人）：通过 accountid 匹配
                            if (playerScript.accountid === serverPlayer.id) {
                                isMatch = true;
                                console.log("🎮 [gameScene] 机器人玩家匹配成功: " + serverPlayer.name);
                            }
                        }
                        
                        if (isMatch) {
                            // 更新玩家数据
                            var updateData = {
                                gold_count: serverPlayer.gold_count || 0,
                                arena_gold: serverPlayer.arena_gold || 0,
                                match_coin: serverPlayer.match_coin || 0,
                                avatar: serverPlayer.avatar || "",
                                avatarUrl: serverPlayer.avatar || ""
                            };
                            playerScript.updateArenaData && playerScript.updateArenaData(updateData);
                            console.log("🎮 [gameScene] 更新玩家 " + serverPlayer.name + " 数据:", JSON.stringify(updateData));
                            break;
                        }
                    }
                }
            }
        }.bind(this))
        
    },

    setPlayerSeatPos(seat_index) {
        if (seat_index < 1 || seat_index > 3) {
            return
        }

        // 🔧【座位布局说明】
        // 场景座位位置（基于实际坐标）：
        // - 位置 0 (seat_node_1): 左下角 (-539, -309) - 当前玩家
        // - 位置 1 (seat_node_2): 右侧 (526, 79)
        // - 位置 2 (seat_node_3): 左侧 (-539, 79)
        //
        // 逆时针出牌布局：
        // - 下家在左侧（位置 2）
        // - 上家在右侧（位置 1）
        // - 出牌顺序：当前玩家 → 下家（左侧）→ 上家（右侧）→ 当前玩家
        switch (seat_index) {
            case 1:
                this.playerdata_list_pos[1] = 0  // 座位1：当前玩家 → 位置0
                this.playerdata_list_pos[2] = 2  // 座位2：下家 → 位置2（左侧）
                this.playerdata_list_pos[3] = 1  // 座位3：上家 → 位置1（右侧）
                break
            case 2:
                this.playerdata_list_pos[2] = 0  // 座位2：当前玩家 → 位置0
                this.playerdata_list_pos[3] = 2  // 座位3：下家 → 位置2（左侧）
                this.playerdata_list_pos[1] = 1  // 座位1：上家 → 位置1（右侧）
                break
            case 3:
                this.playerdata_list_pos[3] = 0  // 座位3：当前玩家 → 位置0
                this.playerdata_list_pos[1] = 2  // 座位1：下家 → 位置2（左侧）
                this.playerdata_list_pos[2] = 1  // 座位2：上家 → 位置1（右侧）
                break
            default:
                break
        }
    },
    
    /**
     * 检查是否是已知的机器人 ID
     * 机器人 ID 通常是纯数字字符串
     */
    _isKnownRobotId: function(playerId) {
        if (!playerId) return false
        // 机器人 ID 是纯数字
        return /^\d+$/.test(playerId)
    },

    addPlayerNode(player_data) {

        if (!this.player_node_prefabs) {
            console.error("player_node_prefabs 未绑定！");
            return;
        }

        if (!this.players_seat_pos) {
            console.error("players_seat_pos 未绑定！");
            return;
        }

        // 🔧【调试】输出玩家数据
        console.log("🎮 [addPlayerNode] player_data:", JSON.stringify({
            accountid: player_data.accountid || player_data.accountId,
            nick_name: player_data.nick_name,
            seatindex: player_data.seatindex,
            is_robot: player_data.is_robot
        }))

        // 🔧【关键修复】检查玩家是否已存在，如果存在则更新而非创建新节点
        var existingPlayerNode = this._findPlayerNodeByAccountId(player_data.accountid || player_data.accountId)
        if (existingPlayerNode) {
            console.log("🎮 [addPlayerNode] 玩家节点已存在，更新数据而非创建新节点, accountid:", player_data.accountid || player_data.accountId)
            var existingScript = existingPlayerNode.getComponent("player_node")
            if (existingScript) {
                // 更新现有节点的数据
                if (player_data.gold_count !== undefined || player_data.arena_gold !== undefined || player_data.match_coin !== undefined) {
                    existingScript.updateArenaData && existingScript.updateArenaData({
                        gold_count: player_data.gold_count,
                        arena_gold: player_data.arena_gold,
                        match_coin: player_data.match_coin,
                        avatar: player_data.avatar || player_data.avatarUrl,
                        avatarUrl: player_data.avatar || player_data.avatarUrl
                    })
                }
                // 更新头像（如果有有效的头像URL）
                var avatarUrl = player_data.avatar || player_data.avatarUrl || player_data.avatarurl
                if (avatarUrl && avatarUrl !== "" && avatarUrl !== "avatar_1") {
                    existingScript._loadAvatar && existingScript._loadAvatar(avatarUrl)
                }
            }
            return // 不创建新节点
        }

        var playernode_inst = cc.instantiate(this.player_node_prefabs);
        if (!playernode_inst) {
            console.error("无法实例化 player_node_prefabs");
            return;
        }

        playernode_inst.parent = this.node;
        this.playerNodeList.push(playernode_inst);

        // 🔧【修复】将房间类型传递给 player_node（用于区分普通场和竞技场）
        if (!player_data.room_category) {
            player_data.room_category = this._roomCategory || 1
            console.log("🏟️ [addPlayerNode] 设置 player_data.room_category =", player_data.room_category)
        }

        // 🔧【新增】将期号传递给 player_node
        if (!player_data.period_no && this._periodNo) {
            player_data.period_no = this._periodNo
        }

        var index = this.playerdata_list_pos[player_data.seatindex];
        
        if (index === undefined || index === null) {
            console.error("无效的座位索引:", player_data.seatindex);
            return;
        }
        
        if (!this.players_seat_pos.children || !this.players_seat_pos.children[index]) {
            console.error("座位节点不存在，index:", index);
            return;
        }
        
        playernode_inst.position = this.players_seat_pos.children[index].position;
        
        var playerNodeScript = playernode_inst.getComponent("player_node");
        if (!playerNodeScript) {
            console.error("无法获取 player_node 组件");
            return;
        }
        
        playerNodeScript.init_data(player_data, index);
    },
    
    /**
     * 🔧【新增】根据 accountid 查找玩家节点
     * @param {string} accountId - 玩家账号ID
     * @returns {cc.Node|null} 玩家节点或 null
     */
    _findPlayerNodeByAccountId: function(accountId) {
        if (!this.playerNodeList || !accountId) return null
        
        var accountIdStr = String(accountId)
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var script = node.getComponent("player_node")
                if (script && String(script.accountid) === accountIdStr) {
                    return node
                }
            }
        }
        return null
    },

    start() {
    },

    onDestroy: function() {
        this._stopOnlineMonitoring()
    },

    getUserOutCardPosByAccount(accountid) {
        
        if (!this.playerNodeList || !this.players_seat_pos) {
            console.error("playerNodeList 或 players_seat_pos 未初始化");
            return null;
        }
        
        // 🔧【修复】使用字符串比较，避免类型不匹配问题
        var targetAccountId = String(accountid || "")
        
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var node_script = node.getComponent("player_node")
                // 🔧【修复】使用字符串比较，确保类型一致
                if (node_script && String(node_script.accountid || "") === targetAccountId) {
                    if (node_script.seat_index === undefined || node_script.seat_index === null) {
                        console.error("无效的 seat_index");
                        return null;
                    }
                    
                    if (!this.players_seat_pos.children || !this.players_seat_pos.children[node_script.seat_index]) {
                        console.error("座位节点不存在，seat_index:", node_script.seat_index);
                        return null;
                    }
                    
                    var seat_node = this.players_seat_pos.children[node_script.seat_index]
                    // 🔧【修复】检查 seat_node 是否存在
                    if (!seat_node) {
                        console.error("seat_node 为空，seat_index:", node_script.seat_index);
                        return null;
                    }
                    var index_name = "cardsoutzone" + node_script.seat_index
                    var out_card_node = seat_node.getChildByName(index_name)
                    
                    // 🔧【调试】输出找到的出牌区域
                    console.log("🃏 [getUserOutCardPosByAccount] accountid:", accountid, "seat_index:", node_script.seat_index, "out_card_node:", out_card_node ? out_card_node.name : "null")
                    
                    return out_card_node
                }
            }
        }
        
        // 🔧【调试】未找到玩家节点
        console.warn("🃏 [getUserOutCardPosByAccount] 未找到玩家节点, accountid:", accountid, "playerNodeList.length:", this.playerNodeList.length)

        return null
    },
    
    _processRoomData: function(result, myglobal, isopen_sound) {
        
        console.log("🎮 [_processRoomData] 接收到的数据:", JSON.stringify(result))
        
        var playerdata_list = result.playerdata || []
        var roomid = result.roomid || result.room_code || result.roomCode || "WAITING"

        // 🔧【新增】检查是否是竞技场模式
        var isArenaMode = result.room_category === 2
        if (isArenaMode) {
            console.log("🏟️ [_processRoomData] 竞技场模式: room_category=2, playerdata数量=" + playerdata_list.length + ", 期号=" + result.period_no)
        }
        
        // 🔧【关键修复】竞技场模式下，确保当前玩家始终在位置 0（下方）
        // 找出当前玩家（非机器人）并计算其正确位置
        var seatid = result.seatindex || 1
        if (isArenaMode && playerdata_list.length > 0) {
            // 在竞技场模式下，找到当前玩家（非机器人）
            for (var i = 0; i < playerdata_list.length; i++) {
                var p = playerdata_list[i]
                if (p && !p.is_robot) {
                    // 当前玩家的 seatindex 就是他在数组中的正确座位
                    seatid = p.seatindex || 1
                    console.log("🏟️ [_processRoomData] 竞技场模式：当前玩家=" + p.nick_name + ", seatid=" + seatid)
                    break
                }
            }
        }
        
        this.playerdata_list_pos = []
        this.setPlayerSeatPos(seatid)

        // 🔧【修复】保存房间类型到实例变量，供 player_node 使用
        this._roomCategory = result.room_category || 1
        this._isArenaMode = isArenaMode
        this._periodNo = result.period_no || "" // 🔧【新增】保存期号

        this._playerdataList = playerdata_list

        
        if (this.roomid_label) {
            // 🔧【关键修复】竞技场模式下，如果房间号为空或看起来像期号（超过10位），显示加载界面
            // 等待 ROOM_JOINED 消息更新正确的房间号
            if (isArenaMode && (roomid === "" || roomid === "WAITING" || roomid.length > 10)) {
                // 房间号为空或看起来是期号，显示加载界面，等待服务端返回正确的房间号
                this.roomid_label.string = ""
                console.log("🏟️ [_processRoomData] 竞技场模式：房间号为空或为期号，显示加载界面... roomid=" + roomid)
                // 🔧【新增】显示加载界面
                this._showArenaLoadingUI(myglobal)
            } else {
                this.roomid_label.string = "房间号:" + roomid
            }
        } else {
            console.error("🎮 [游戏场景] roomid_label 未绑定！")
        }
        
        myglobal.playerData.housemanageid = result.housemanageid || result.creator_id || result.creatorId || ""
        
        if (myglobal.socket && myglobal.socket.getPlayerInfo) {
            var playerInfo = myglobal.socket.getPlayerInfo()
        }

        for (var i = 0; i < playerdata_list.length; i++) {
            console.log("🎮 [_processRoomData] 添加玩家节点: " + JSON.stringify(playerdata_list[i]))
            this.addPlayerNode(playerdata_list[i])
        }
        

        if (isopen_sound) {
            cc.audioEngine.stopAll()
            cc.resources.load("sound/bg", cc.AudioClip, function(err, clip) {
                if (err) {
                    return
                }
                cc.audioEngine.play(clip, true, 1)
            })
        }
        
        // 🔧【关键修复】竞技场模式下直接隐藏 gamebeforeUI
        // 竞技场模式下所有玩家已经准备好，游戏会自动开始，不需要显示等待界面
        var gamebefore_node = this.node.getChildByName("gamebeforeUI")
        if (gamebefore_node) {
            if (isArenaMode) {
                // 竞技场模式：直接隐藏等待界面
                gamebefore_node.active = false
                console.log("🏟️ [_processRoomData] 竞技场模式：隐藏 gamebeforeUI")
            } else {
                // 普通模式：显示等待界面
                gamebefore_node.active = true
                gamebefore_node.zIndex = 1000
                gamebefore_node.emit("init")
            }
        }
        
        // 🔧【修复】竞技场模式下不显示等待玩家UI（所有玩家已分配好）
        if (isArenaMode) {
            console.log("🏟️ [_processRoomData] 竞技场模式：不显示等待玩家UI")
            // 竞技场模式下所有玩家应该已经准备好，直接等待游戏开始
        } else if (playerdata_list.length < 3) {
            this._showWaitingUI(3 - playerdata_list.length, roomid)
        }
    },
    
    _showWaitingUI: function(needPlayers, roomCode) {
        var self = this
        this._isWaitingForPlayers = true
        this._needPlayers = needPlayers
        this._currentRoomCode = roomCode || ""


        this._hideWaitingUI()

        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas)
        var screenHeight = canvas ? canvas.designResolution.height : 720
        var screenWidth = canvas ? canvas.designResolution.width : 1280

        var waitingNode = new cc.Node("WaitingForPlayersUI")
        waitingNode.setContentSize(cc.size(screenWidth, screenHeight))
        waitingNode.anchorX = 0.5
        waitingNode.anchorY = 0.5
        waitingNode.x = 0
        waitingNode.y = 0
        waitingNode.parent = this.node
        this._waitingUINode = waitingNode

        if (roomCode) {
            var roomInfoNode = new cc.Node("RoomInfo")
            roomInfoNode.x = -screenWidth/2 + 20
            roomInfoNode.y = screenHeight/2 - 30
            roomInfoNode.anchorX = 0
            roomInfoNode.anchorY = 0.5

            var roomLabel = roomInfoNode.addComponent(cc.Label)
            roomLabel.string = "房间号: " + roomCode
            roomLabel.fontSize = 24
            roomLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT
            roomInfoNode.color = cc.color(255, 215, 0)

            var roomOutline = roomInfoNode.addComponent(cc.LabelOutline)
            roomOutline.color = cc.color(0, 0, 0)
            roomOutline.width = 2
            roomInfoNode.parent = waitingNode
        }

        var leaveBtnNode = new cc.Node("LeaveBtn")
        leaveBtnNode.x = screenWidth/2 - 100
        leaveBtnNode.y = -screenHeight/2 + 50
        leaveBtnNode.anchorX = 0.5
        leaveBtnNode.anchorY = 0.5
        leaveBtnNode.setContentSize(cc.size(140, 40))

        var leaveBtnBg = leaveBtnNode.addComponent(cc.Graphics)
        leaveBtnBg.fillColor = cc.color(180, 60, 60, 230)
        leaveBtnBg.roundRect(-70, -20, 140, 40, 8)
        leaveBtnBg.fill()
        leaveBtnBg.strokeColor = cc.color(220, 100, 100)
        leaveBtnBg.lineWidth = 2
        leaveBtnBg.roundRect(-70, -20, 140, 40, 8)
        leaveBtnBg.stroke()
        leaveBtnNode.parent = waitingNode

        var leaveBtnLabel = new cc.Node("Label")
        leaveBtnLabel.anchorX = 0.5
        leaveBtnLabel.anchorY = 0.5
        var leaveLabel = leaveBtnLabel.addComponent(cc.Label)
        leaveLabel.string = "离开房间"
        leaveLabel.fontSize = 20
        leaveLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        leaveBtnLabel.color = cc.color(255, 255, 255)
        var leaveOutline = leaveBtnLabel.addComponent(cc.LabelOutline)
        leaveOutline.color = cc.color(100, 30, 30)
        leaveOutline.width = 2
        leaveBtnLabel.parent = leaveBtnNode

        leaveBtnNode.on(cc.Node.EventType.TOUCH_START, function() {
            leaveBtnNode.scale = 0.95
        })
        leaveBtnNode.on(cc.Node.EventType.TOUCH_END, function() {
            leaveBtnNode.scale = 1
            self._leaveRoom()
        })
        leaveBtnNode.on(cc.Node.EventType.TOUCH_CANCEL, function() {
            leaveBtnNode.scale = 1
        })

        this._updateWaitingAnimation()
    },

    _updateWaitingUI: function() {
        if (!this._isWaitingForPlayers) return

        var currentPlayers = this.playerNodeList.length

        if (currentPlayers >= 3) {
            this._hideWaitingUI()
        }
    },

    _updateWaitingAnimation: function() {
        var self = this
        if (!this._isWaitingForPlayers || !this._waitingUINode) return
        this.scheduleOnce(function() {
            self._updateWaitingAnimation()
        }, 1/60)
    },
    
    _hideWaitingUI: function() {
        this._isWaitingForPlayers = false
        
        if (this._waitingUINode) {
            this._waitingUINode.destroy()
            this._waitingUINode = null
        }
        
    },
    
    _leaveRoom: function() {
        
        var myglobal = window.myglobal
        if (myglobal && myglobal.socket) {
            if (myglobal.socket.leaveRoom) {
                myglobal.socket.leaveRoom()
            }
        }
        
        this._hideWaitingUI()
        this._hideArenaLoadingUI()
        cc.director.loadScene("hallScene")
    },
    
    // ============================================================
    // 【新增】竞技场加载界面
    // ============================================================
    
    /**
     * 显示竞技场等待界面（游戏场景内嵌）
     * 🔧【修改】将 ArenaMatchWaitingScene 的等待UI集成到游戏场景中
     * 普通场不使用此等待界面
     */
    _showArenaLoadingUI: function(myglobal) {
        // 如果已存在，不重复创建
        if (this._arenaLoadingUINode) {
            return
        }
        
        var self = this
        
        // 获取屏幕尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas)
        var screenHeight = canvas ? canvas.designResolution.height : 720
        var screenWidth = canvas ? canvas.designResolution.width : 1280
        
        // 创建等待界面容器
        var waitingNode = new cc.Node("ArenaWaitingUI")
        waitingNode.setContentSize(cc.size(screenWidth, screenHeight))
        waitingNode.anchorX = 0.5
        waitingNode.anchorY = 0.5
        waitingNode.x = 0
        waitingNode.y = 0
        waitingNode.zIndex = 2000 // 确保在顶层
        waitingNode.parent = this.node
        this._arenaLoadingUINode = waitingNode
        
        // 创建背景（使用 join_bk.png）
        var bgNode = new cc.Node("Background")
        bgNode.setContentSize(cc.size(screenWidth, screenHeight))
        bgNode.setPosition(0, 0)
        var bgSprite = bgNode.addComponent(cc.Sprite)
        bgSprite.type = cc.Sprite.Type.SIMPLE
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        
        // 尝试加载背景图片
        cc.resources.load('join_bk', cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                // 使用纯色背景作为后备
                var bgGraphics = bgNode.addComponent(cc.Graphics)
                bgGraphics.fillColor = cc.color(25, 30, 50, 255)
                bgGraphics.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight)
                bgGraphics.fill()
                return
            }
            if (bgSprite && bgSprite.node && bgSprite.node.isValid) {
                bgSprite.spriteFrame = spriteFrame
            }
        })
        bgNode.parent = waitingNode
        
        // 创建顶部信息栏
        var topBar = new cc.Node("TopBar")
        topBar.setContentSize(cc.size(screenWidth - 100, 100))
        topBar.setPosition(0, screenHeight/2 - 80)
        
        // 半透明背景
        var topBarBg = new cc.Node("Bg")
        topBarBg.setContentSize(cc.size(screenWidth - 100, 100))
        var topBarBgGraphics = topBarBg.addComponent(cc.Graphics)
        topBarBgGraphics.fillColor = cc.color(0, 0, 0, 150)
        topBarBgGraphics.roundRect(-(screenWidth-100)/2, -50, screenWidth-100, 100, 10)
        topBarBgGraphics.fill()
        topBarBg.parent = topBar
        topBar.parent = waitingNode
        
        // 期号
        var periodNode = new cc.Node("PeriodNo")
        periodNode.setPosition(-screenWidth/2 + 150, 25)
        var periodLabel = periodNode.addComponent(cc.Label)
        periodLabel.string = "期号: " + (this._periodNo || "--")
        periodLabel.fontSize = 22
        periodLabel.lineHeight = 28
        periodNode.color = cc.color(255, 215, 0)
        var periodOutline = periodNode.addComponent(cc.LabelOutline)
        periodOutline.color = cc.color(0, 0, 0)
        periodOutline.width = 2
        periodNode.parent = topBar
        this._arenaPeriodLabel = periodLabel
        
        // 房间名称
        var roomNode = new cc.Node("RoomName")
        roomNode.setPosition(0, 25)
        var roomLabel = roomNode.addComponent(cc.Label)
        roomLabel.string = "竞技场匹配中"
        roomLabel.fontSize = 28
        roomLabel.lineHeight = 36
        roomNode.color = cc.color(255, 255, 255)
        var roomOutline = roomNode.addComponent(cc.LabelOutline)
        roomOutline.color = cc.color(0, 0, 0)
        roomOutline.width = 2
        roomNode.parent = topBar
        this._arenaRoomLabel = roomLabel
        
        // 提示消息
        var msgNode = new cc.Node("Message")
        msgNode.setPosition(0, -30)
        var msgLabel = msgNode.addComponent(cc.Label)
        msgLabel.string = "正在为您匹配对手..."
        msgLabel.fontSize = 20
        msgLabel.lineHeight = 28
        msgNode.color = cc.color(255, 200, 100)
        var msgOutline = msgNode.addComponent(cc.LabelOutline)
        msgOutline.color = cc.color(0, 0, 0)
        msgOutline.width = 2
        msgNode.parent = topBar
        this._arenaMsgLabel = msgLabel
        
        // 创建加载动画（旋转的圆环）
        var loadingContainer = new cc.Node("LoadingContainer")
        loadingContainer.setPosition(0, 0)
        loadingContainer.parent = waitingNode
        
        // 加载图标（圆环）
        var loadingIcon = new cc.Node("LoadingIcon")
        loadingIcon.setContentSize(cc.size(80, 80))
        var iconGraphics = loadingIcon.addComponent(cc.Graphics)
        iconGraphics.strokeColor = cc.color(255, 215, 0)
        iconGraphics.lineWidth = 4
        iconGraphics.arc(0, 0, 30, 0, Math.PI * 1.5, false)
        iconGraphics.stroke()
        loadingIcon.parent = loadingContainer
        this._arenaLoadingIcon = loadingIcon
        
        // 加载文字
        var loadingLabel = new cc.Node("LoadingLabel")
        loadingLabel.setPosition(0, -70)
        var loadingLabelComp = loadingLabel.addComponent(cc.Label)
        loadingLabelComp.string = "匹配中..."
        loadingLabelComp.fontSize = 24
        loadingLabelComp.lineHeight = 32
        loadingLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        loadingLabel.color = cc.color(255, 220, 100)
        var loadingOutline = loadingLabel.addComponent(cc.LabelOutline)
        loadingOutline.color = cc.color(0, 0, 0)
        loadingOutline.width = 2
        loadingLabel.parent = loadingContainer
        this._arenaLoadingLabel = loadingLabelComp
        
        // 启动旋转动画
        this._startArenaLoadingAnimation()
        
        console.log("🏟️ [_showArenaLoadingUI] 竞技场等待界面已显示（游戏场景内嵌）")
    },
    
    /**
     * 启动竞技场加载旋转动画
     */
    _startArenaLoadingAnimation: function() {
        var self = this
        this._arenaLoadingAnimScheduled = true
        
        this.schedule(function() {
            if (self._arenaLoadingIcon && self._arenaLoadingIcon.isValid) {
                self._arenaLoadingIcon.angle += 5
            }
        }, 0.016)  // 约60fps
    },
    
    /**
     * 停止竞技场加载旋转动画
     */
    _stopArenaLoadingAnimation: function() {
        if (this._arenaLoadingAnimScheduled) {
            this.unschedule(this._startArenaLoadingAnimation)
            this._arenaLoadingAnimScheduled = false
        }
    },
    
    /**
     * 隐藏竞技场加载界面
     */
    _hideArenaLoadingUI: function() {
        // 停止加载动画
        this._stopArenaLoadingAnimation()
        
        // 销毁加载界面
        if (this._arenaLoadingUINode) {
            this._arenaLoadingUINode.destroy()
            this._arenaLoadingUINode = null
            this._arenaLoadingIcon = null
            this._arenaPeriodLabel = null
            this._arenaRoomLabel = null
            this._arenaMsgLabel = null
            this._arenaLoadingLabel = null
            console.log("🏟️ [_hideArenaLoadingUI] 竞技场等待界面已隐藏")
        }
    },
    
    // ============================================================
    // 【新增】游戏状态恢复处理
    // ============================================================
    
    /**
     * 处理游戏状态恢复事件
     */
    _onGameStateRestored: function(data) {
        
        // 🔧【修复】添加空值检查
        if (!this.playerNodeList) return
        
        // 更新玩家节点的状态
        if (data.players) {
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    var nodeScript = node.getComponent("player_node")
                    if (nodeScript) {
                        // 查找对应的玩家数据
                        for (var j = 0; j < data.players.length; j++) {
                            var p = data.players[j]
                            if (p.id === nodeScript.accountid) {
                                // 更新玩家状态
                                node.emit("player_state_update", {
                                    state: p.state,
                                    cards_count: p.cards_count,
                                    is_landlord: p.is_landlord
                                })
                                break
                            }
                        }
                    }
                }
            }
        }
        
        // 隐藏 gamebeforeUI
        var gamebefore_node = this.node.getChildByName("gamebeforeUI")
        if (gamebefore_node) {
            gamebefore_node.active = false
        }
        
        // 显示 gameingUI
        var gameing_node = this.node.getChildByName("gameingUI")
        if (gameing_node) {
            gameing_node.active = true
        }
    },
    
    /**
     * 处理玩家掉线通知
     */
    _onPlayerOffline: function(data) {
        
        // 🔧【修复】添加空值检查
        if (!this.playerNodeList) return
        
        // 通知所有玩家节点更新状态
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var nodeScript = node.getComponent("player_node")
                if (nodeScript && nodeScript.accountid === data.player_id) {
                    node.emit("player_state_update", {
                        state: "offline",
                        timeout: data.timeout
                    })
                    break
                }
            }
        }
    },
    
    /**
     * 处理玩家上线通知
     */
    _onPlayerOnline: function(data) {
        
        // 🔧【修复】添加空值检查
        if (!this.playerNodeList) return
        
        // 通知所有玩家节点更新状态
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var nodeScript = node.getComponent("player_node")
                if (nodeScript && nodeScript.accountid === data.player_id) {
                    node.emit("player_state_update", {
                        state: "online"
                    })
                    break
                }
            }
        }
    }
});
