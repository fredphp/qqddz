// 使用全局变量，不使用 require
// 【修复版本】简化发牌逻辑，不再使用定时器调度
// 核心原则：
// 1. gameingUI.js 自己处理发牌动画
// 2. gameScene.js 只负责转发事件给 player_node
// 3. 不依赖 scheduleOnce 控制发牌节奏

cc.Class({
    extends: cc.Component,
    name: 'gameScene',

    properties: {
        di_label: cc.Label,
        beishu_label: cc.Label,
        roomid_label: cc.Label,
        player_node_prefabs: cc.Prefab,
        players_seat_pos: cc.Node,
    },

    onLoad() {
        console.log("gameScene onLoad 开始");
        
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
        
        console.log("🔍 游戏场景：启动在线状态监测")
        
        var self = this
        this._onlineStatusHandler = function(isOnline) {
            console.log("游戏场景：在线状态变化 -> " + (isOnline ? "在线" : "离线"))
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
            console.log("gameScene 等待初始化... (第 " + attempts + " 次)");
            
            var myglobal = window.myglobal;
            if (myglobal && myglobal.playerData && myglobal.socket) {
                console.log("gameScene 初始化条件满足");
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

        console.log("游戏场景初始化 - 底分:", bottom, "倍数:", rate)

        // 监听，给其他玩家发牌(内部事件)
        // 【核心】player_node 直接显示 17 张牌背，不再逐张动画
        this.node.on("pushcard_other_event", function() {
            console.log("🃏 [gameScene] pushcard_other_event - 通知对手显示牌背")
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("push_card_event")
                }
            }
        }.bind(this))

        // 监听房间状态改变事件
        myglobal.socket.onRoomChangeState(function(data) {
            console.log("onRoomChangeState:" + data)
            this.roomstate = data
            
            if (data !== RoomState.ROOM_INVALID && this._isWaitingForPlayers) {
                this._hideWaitingUI()
            }
        }.bind(this))

        this.node.on("canrob_event", function(event) {
            console.log("gamescene canrob_event:" + event)
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_canrob_event", event)
                }
            }
        }.bind(this))

        this.node.on("choose_card_event", function(event) {
            console.log("--------choose_card_event-----------")
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                console.log("get childer name gameingUI")
                return
            }
            gameui_node.emit("choose_card_event", event)
        }.bind(this))

        this.node.on("unchoose_card_event", function(event) {
            console.log("--------unchoose_card_event-----------")
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                console.log("get childer name gameingUI")
                return
            }
            gameui_node.emit("unchoose_card_event", event)
        }.bind(this))

        var currentRoomCode = myglobal.socket.getCurrentRoomCode()
        var isInRoom = myglobal.socket.isInRoom()
        
        console.log("gameScene: currentRoomCode=" + currentRoomCode + ", isInRoom=" + isInRoom)
        
        var roomData = myglobal.roomData
        
        if (isInRoom && currentRoomCode && !roomData) {
            console.log("已在房间中，设置房间UI")
            roomData = {
                roomid: currentRoomCode,
                room_code: currentRoomCode,
                seatindex: 1,
                playerdata: [{
                    accountid: myglobal.playerData.accountid || myglobal.playerData.playerId,
                    nick_name: myglobal.playerData.nickName,
                    avatarUrl: "avatar_1",
                    goldcount: myglobal.playerData.gobal_count || 1000,
                    seatindex: 1,
                    isready: true
                }]
            }
        }
        
        if (roomData) {
            console.log("使用房间数据:", JSON.stringify(roomData))
            this._processRoomData(roomData, myglobal, isopen_sound)
        } else {
            myglobal.socket.request_enter_room({}, function(err, result) {
                console.log("enter_room_resp" + JSON.stringify(result))
                if (err != 0) {
                    console.log("enter_room_resp err:" + err)
                } else {
                    this._processRoomData(result, myglobal, isopen_sound)
                }
            }.bind(this))
        }

        myglobal.socket.onPlayerJoinRoom(function(join_playerdata) {
            console.log("🎯 onPlayerJoinRoom:" + JSON.stringify(join_playerdata))
            this.addPlayerNode(join_playerdata)

            if (!this._playerdataList) {
                this._playerdataList = []
            }
            this._playerdataList.push(join_playerdata)

            if (this._isWaitingForPlayers) {
                this._showWaitingUI(3 - this._playerdataList.length, this._currentRoomCode)
            }

            if (this.playerNodeList.length >= 3) {
                console.log("✅ 房间满员，隐藏等待界面")
                this._hideWaitingUI()
            }
        }.bind(this))

        myglobal.socket.onPlayerReady(function(data) {
            console.log("🎮 [onPlayerReady] 收到准备通知, data:", JSON.stringify(data))
            console.log("🎮 [onPlayerReady] playerNodeList 数量:", this.playerNodeList.length)
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    console.log("🎮 [onPlayerReady] 向节点 [" + i + "] 发送 player_ready_notify")
                    node.emit("player_ready_notify", data)
                }
            }
        }.bind(this))

        myglobal.socket.onGameStart(function() {
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
            console.log("-----onRobState" + JSON.stringify(event))
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_rob_state_event", event)
                }
            }
        }.bind(this))

        myglobal.socket.onChangeMaster(function(event) {
            console.log("onChangeMaster" + event)
            myglobal.playerData.master_accountid = event
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_changemaster_event", event)
                }
            }
        }.bind(this))

        this.node.on("update_card_count_event", function(data) {
            console.log("update_card_count_event: " + JSON.stringify(data))
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("update_card_count_event", data)
                }
            }
        }.bind(this))

        myglobal.socket.onShowBottomCard(function(event) {
            console.log("onShowBottomCard---------" + event)
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                console.log("get childer name gameingUI")
                return
            }
            gameui_node.emit("show_bottom_card_event", event)
        }.bind(this))
        
        myglobal.socket.onRoomRestored(function(data) {
            console.log("房间恢复: " + JSON.stringify(data))
            if (data.room_code) {
                var restoredRoomData = {
                    roomid: data.room_code,
                    room_code: data.room_code,
                    seatindex: 1,
                    playerdata: [{
                        accountid: data.player_id,
                        nick_name: data.player_name,
                        avatarUrl: "avatar_1",
                        goldcount: 1000,
                        seatindex: 1
                    }]
                }
                this._processRoomData(restoredRoomData, myglobal, isopen_sound)
            }
        }.bind(this))
        
        // 【新增】监听游戏状态恢复事件
        this.node.on("game_state_restored", function(data) {
            console.log("🎮 [gameScene] 收到游戏状态恢复事件")
            this._onGameStateRestored(data)
        }.bind(this))
        
        // 【新增】监听玩家掉线通知
        myglobal.socket.onPlayerOffline(function(data) {
            console.log("📴 [gameScene] 玩家掉线通知:", JSON.stringify(data))
            this._onPlayerOffline(data)
        }.bind(this))
        
        // 【新增】监听玩家上线通知
        myglobal.socket.onPlayerOnline(function(data) {
            console.log("📶 [gameScene] 玩家上线通知:", JSON.stringify(data))
            this._onPlayerOnline(data)
        }.bind(this))
        
        console.log("gameScene 初始化完成");
    },

    setPlayerSeatPos(seat_index) {
        if (seat_index < 1 || seat_index > 3) {
            console.log("seat_index error" + seat_index)
            return
        }

        console.log("setPlayerSeatPos seat_index:" + seat_index)

        switch (seat_index) {
            case 1:
                this.playerdata_list_pos[1] = 0
                this.playerdata_list_pos[2] = 1
                this.playerdata_list_pos[3] = 2
                break
            case 2:
                this.playerdata_list_pos[2] = 0
                this.playerdata_list_pos[3] = 1
                this.playerdata_list_pos[1] = 2
                break
            case 3:
                this.playerdata_list_pos[3] = 0
                this.playerdata_list_pos[1] = 1
                this.playerdata_list_pos[2] = 2
                break
            default:
                break
        }
    },

    addPlayerNode(player_data) {
        console.log("addPlayerNode called with:", JSON.stringify(player_data));
        
        if (!this.player_node_prefabs) {
            console.error("player_node_prefabs 未绑定！");
            return;
        }
        
        if (!this.players_seat_pos) {
            console.error("players_seat_pos 未绑定！");
            return;
        }
        
        var playernode_inst = cc.instantiate(this.player_node_prefabs);
        if (!playernode_inst) {
            console.error("无法实例化 player_node_prefabs");
            return;
        }
        
        playernode_inst.parent = this.node;
        this.playerNodeList.push(playernode_inst);

        var index = this.playerdata_list_pos[player_data.seatindex];
        console.log("index " + player_data.seatindex + " " + index);
        
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

    start() {
    },

    onDestroy: function() {
        console.log("=== gameScene onDestroy ===")
        this._stopOnlineMonitoring()
    },

    getUserOutCardPosByAccount(accountid) {
        console.log("getUserOutCardPosByAccount accountid:" + accountid)
        
        if (!this.playerNodeList || !this.players_seat_pos) {
            console.error("playerNodeList 或 players_seat_pos 未初始化");
            return null;
        }
        
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var node_script = node.getComponent("player_node")
                if (node_script && node_script.accountid === accountid) {
                    if (node_script.seat_index === undefined || node_script.seat_index === null) {
                        console.error("无效的 seat_index");
                        return null;
                    }
                    
                    if (!this.players_seat_pos.children || !this.players_seat_pos.children[node_script.seat_index]) {
                        console.error("座位节点不存在，seat_index:", node_script.seat_index);
                        return null;
                    }
                    
                    var seat_node = this.players_seat_pos.children[node_script.seat_index]
                    var index_name = "cardsoutzone" + node_script.seat_index
                    var out_card_node = seat_node.getChildByName(index_name)
                    return out_card_node
                }
            }
        }

        return null
    },
    
    _processRoomData: function(result, myglobal, isopen_sound) {
        console.log("🎮 [游戏场景] _processRoomData 收到数据:", JSON.stringify(result, null, 2))
        
        var seatid = result.seatindex || 1
        console.log("🎮 [游戏场景] 当前玩家座位索引:", seatid)
        
        this.playerdata_list_pos = []
        this.setPlayerSeatPos(seatid)
        console.log("🎮 [游戏场景] 玩家座位位置映射:", JSON.stringify(this.playerdata_list_pos))

        var playerdata_list = result.playerdata || []
        var roomid = result.roomid || result.room_code || result.roomCode || "WAITING"

        this._playerdataList = playerdata_list

        console.log("🎮 [游戏场景] 玩家数据列表数量:", playerdata_list.length)
        
        if (this.roomid_label) {
            this.roomid_label.string = "房间号:" + roomid
            console.log("🎮 [游戏场景] 设置房间号标签:", this.roomid_label.string)
        } else {
            console.error("🎮 [游戏场景] roomid_label 未绑定！")
        }
        
        console.log("🎮 [游戏场景] result.housemanageid:", result.housemanageid)
        myglobal.playerData.housemanageid = result.housemanageid || result.creator_id || result.creatorId || ""
        console.log("🎮 [游戏场景] 最终设置的 housemanageid:", myglobal.playerData.housemanageid)
        
        if (myglobal.socket && myglobal.socket.getPlayerInfo) {
            var playerInfo = myglobal.socket.getPlayerInfo()
            console.log("🎮 [游戏场景] socket.getPlayerInfo():", JSON.stringify(playerInfo))
        }

        for (var i = 0; i < playerdata_list.length; i++) {
            console.log("🎮 [游戏场景] 添加玩家节点 [" + i + "]:", JSON.stringify(playerdata_list[i]))
            this.addPlayerNode(playerdata_list[i])
        }
        
        console.log("🎮 [游戏场景] 当前玩家节点数量:", this.playerNodeList.length)

        if (isopen_sound) {
            cc.audioEngine.stopAll()
            cc.resources.load("sound/bg", cc.AudioClip, function(err, clip) {
                if (err) {
                    console.log("加载背景音乐失败:", err)
                    return
                }
                cc.audioEngine.play(clip, true, 1)
                console.log("背景音乐播放成功")
            })
        }
        
        var gamebefore_node = this.node.getChildByName("gamebeforeUI")
        if (gamebefore_node) {
            gamebefore_node.active = true
            gamebefore_node.zIndex = 1000
            gamebefore_node.emit("init")
            console.log("显示 gamebeforeUI 并触发初始化")
        }
        
        if (playerdata_list.length < 3) {
            console.log("⏳ 房间人数不足3人，显示等待界面")
            this._showWaitingUI(3 - playerdata_list.length, roomid)
        }
    },
    
    _showWaitingUI: function(needPlayers, roomCode) {
        var self = this
        this._isWaitingForPlayers = true
        this._needPlayers = needPlayers
        this._currentRoomCode = roomCode || ""

        console.log("显示等待界面，还需玩家数:", needPlayers, "房间号:", roomCode)

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
            console.log("点击离开房间")
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
        console.log("更新等待界面，当前人数:", currentPlayers)

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
        
        console.log("等待界面已隐藏")
    },
    
    _leaveRoom: function() {
        console.log("离开房间")
        
        var myglobal = window.myglobal
        if (myglobal && myglobal.socket) {
            if (myglobal.socket.leaveRoom) {
                myglobal.socket.leaveRoom()
            }
        }
        
        this._hideWaitingUI()
        cc.director.loadScene("hallScene")
    },
    
    // ============================================================
    // 【新增】游戏状态恢复处理
    // ============================================================
    
    /**
     * 处理游戏状态恢复事件
     */
    _onGameStateRestored: function(data) {
        console.log("🎮 [_onGameStateRestored] 恢复游戏状态")
        console.log("🎮 [_onGameStateRestored] 玩家数据:", JSON.stringify(data.players))
        
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
        console.log("📴 [_onPlayerOffline] 玩家掉线:", data.player_name)
        
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
        console.log("📶 [_onPlayerOnline] 玩家上线:", data.player_name)
        
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
