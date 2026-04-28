// 使用全局变量，不使用 require

cc.Class({
    name: 'gameScene',
    extends: cc.Component,

    properties: {
        di_label: cc.Label,
        beishu_label: cc.Label,
        roomid_label: cc.Label,
        player_node_prefabs: cc.Prefab,
        //绑定玩家座位,下面有3个子节点
        players_seat_pos: cc.Node,

    },
    //本局结束，做状态清除
    gameEnd() {

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
    
    // 启动在线状态监测
    _startOnlineMonitoring: function() {
        var myglobal = window.myglobal
        if (!myglobal) {
            console.warn("gameScene: myglobal 未定义，无法启动在线监测")
            return
        }
        
        console.log("🔍 游戏场景：启动在线状态监测")
        
        // 监听在线状态变化
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
        
        // 监听强制下线事件
        if (myglobal.eventlister) {
            myglobal.eventlister.on("force_logout", function(data) {
                console.warn("🚫 游戏场景收到强制下线事件:", data)
                self._handleForceLogout(data)
            })
        }
    },
    
    // 显示离线提示
    _showOfflineMessage: function() {
        console.warn("💔 游戏场景：网络连接已断开")
        // 可以在游戏中显示一个提示UI
    },
    
    // 处理强制下线
    _handleForceLogout: function(data) {
        var reason = data.reason || "您已被强制下线"
        console.warn("🚫 游戏场景强制下线:", reason)
        
        // 停止监测
        var myglobal = window.myglobal
        if (myglobal && myglobal.stopOnlineMonitoring) {
            myglobal.stopOnlineMonitoring()
        }
        
        // 显示提示并跳转到登录页面
        var self = this
        this.scheduleOnce(function() {
            if (typeof alert === 'function') {
                alert(reason + "\n\n请重新登录")
            }
            cc.director.loadScene("loginScene")
        }, 0.5)
    },
    
    // 停止在线状态监测
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
        this.di_label.string = "底:" + myglobal.playerData.bottom
        this.beishu_label.string = "倍数:" + myglobal.playerData.rate
        this.roomstate = RoomState.ROOM_INVALID
        this._isWaitingForPlayers = false  // 是否正在等待玩家

        //监听，给其他玩家发牌(内部事件)
        this.node.on("pushcard_other_event", function() {
            console.log("gamescene pushcard_other_event")
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("push_card_event")
                }
            }
        }.bind(this))

        //监听房间状态改变事件
        myglobal.socket.onRoomChangeState(function(data) {
            console.log("onRoomChangeState:" + data)
            this.roomstate = data
            
            // 如果房间状态变为游戏中，隐藏等待界面
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

        // 使用房间数据（从hallScene传入）
        var roomData = myglobal.roomData
        if (roomData) {
            console.log("使用房间数据:", JSON.stringify(roomData))
            this._processRoomData(roomData, myglobal, isopen_sound)
        } else {
            // 如果没有房间数据，请求进入房间
            myglobal.socket.request_enter_room({}, function(err, result) {
                console.log("enter_room_resp" + JSON.stringify(result))
                if (err != 0) {
                    console.log("enter_room_resp err:" + err)
                } else {
                    this._processRoomData(result, myglobal, isopen_sound)
                }
            }.bind(this))
        }

        //在进入房间后，注册其他玩家进入房间的事件
        myglobal.socket.onPlayerJoinRoom(function(join_playerdata) {
            console.log("🎯 onPlayerJoinRoom:" + JSON.stringify(join_playerdata))
            this.addPlayerNode(join_playerdata)
            
            // 更新等待界面
            this._updateWaitingUI()
            
            // 检查是否满员
            if (this.playerNodeList.length >= 3) {
                console.log("✅ 房间满员，隐藏等待界面")
                this._hideWaitingUI()
            }
        }.bind(this))

        //回调参数是发送准备消息的accountid
        myglobal.socket.onPlayerReady(function(data) {
            console.log("-------onPlayerReady:" + data)
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
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

        //监听服务器玩家抢地主消息
        myglobal.socket.onRobState(function(event) {
            console.log("-----onRobState" + JSON.stringify(event))
            for (var i = 0; i < this.playerNodeList.length; i++) {
                var node = this.playerNodeList[i]
                if (node) {
                    node.emit("playernode_rob_state_event", event)
                }
            }
        }.bind(this))

        //注册监听服务器确定地主消息
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

        //注册监听服务器显示底牌消息
        myglobal.socket.onShowBottomCard(function(event) {
            console.log("onShowBottomCard---------" + event)
            var gameui_node = this.node.getChildByName("gameingUI")
            if (gameui_node == null) {
                console.log("get childer name gameingUI")
                return
            }
            gameui_node.emit("show_bottom_card_event", event)
        }.bind(this))
        
        console.log("gameScene 初始化完成");
    },

    //seat_index自己在房间的位置id
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
        
        // 检查 player_node_prefabs 是否存在
        if (!this.player_node_prefabs) {
            console.error("player_node_prefabs 未绑定！请在 Cocos Creator 编辑器中绑定 player_node_prefabs 属性");
            return;
        }
        
        // 检查 players_seat_pos 是否存在
        if (!this.players_seat_pos) {
            console.error("players_seat_pos 未绑定！请在 Cocos Creator 编辑器中绑定 players_seat_pos 属性");
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
        
        // 检查 index 和座位位置是否存在
        if (index === undefined || index === null) {
            console.error("无效的座位索引:", player_data.seatindex);
            return;
        }
        
        if (!this.players_seat_pos.children[index]) {
            console.error("座位节点不存在，index:", index);
            return;
        }
        
        playernode_inst.position = this.players_seat_pos.children[index].position;
        
        // 获取 player_node 组件并初始化
        var playerNodeScript = playernode_inst.getComponent("player_node");
        if (!playerNodeScript) {
            console.error("无法获取 player_node 组件");
            return;
        }
        
        playerNodeScript.init_data(player_data, index);
    },

    start() {
    },

    // 场景销毁时清理资源
    onDestroy: function() {
        console.log("=== gameScene onDestroy ===")
        
        // 停止在线状态监测
        this._stopOnlineMonitoring()
    },

    getUserOutCardPosByAccount(accountid) {
        console.log("getUserOutCardPosByAccount accountid:" + accountid)
        
        // 安全检查
        if (!this.playerNodeList || !this.players_seat_pos) {
            console.error("playerNodeList 或 players_seat_pos 未初始化");
            return null;
        }
        
        for (var i = 0; i < this.playerNodeList.length; i++) {
            var node = this.playerNodeList[i]
            if (node) {
                var node_script = node.getComponent("player_node")
                if (node_script && node_script.accountid === accountid) {
                    // 检查 seat_index 是否有效
                    if (node_script.seat_index === undefined || node_script.seat_index === null) {
                        console.error("无效的 seat_index");
                        return null;
                    }
                    
                    // 检查座位节点是否存在
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
    
    // 处理房间数据
    _processRoomData: function(result, myglobal, isopen_sound) {
        var seatid = result.seatindex
        this.playerdata_list_pos = []
        this.setPlayerSeatPos(seatid)

        var playerdata_list = result.playerdata || []
        var roomid = result.roomid || result.room_code || "WAITING"
        this.roomid_label.string = "房间号:" + roomid
        myglobal.playerData.housemanageid = result.housemanageid

        for (var i = 0; i < playerdata_list.length; i++) {
            this.addPlayerNode(playerdata_list[i])
        }

        // 播放背景音乐
        if (isopen_sound) {
            try {
                cc.audioEngine.stopAll()
                cc.audioEngine.play(cc.url.raw("resources/sound/bg.mp3"), true)
            } catch(e) {
                console.log("播放背景音乐失败:", e)
            }
        }
        
        // 检查是否需要显示等待界面
        if (playerdata_list.length < 3) {
            console.log("⏳ 房间人数不足3人，显示等待界面")
            this._showWaitingUI(3 - playerdata_list.length)
        }
        
        // 初始化游戏前UI
        var gamebefore_node = this.node.getChildByName("gamebeforeUI")
        if (gamebefore_node) {
            gamebefore_node.emit("init")
        }
    },
    
    // 显示等待玩家界面
    _showWaitingUI: function(needPlayers) {
        var self = this
        this._isWaitingForPlayers = true
        this._needPlayers = needPlayers
        
        console.log("显示等待界面，还需玩家数:", needPlayers)
        
        // 移除旧的等待界面
        this._hideWaitingUI()
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas)
        var screenHeight = canvas ? canvas.designResolution.height : 720
        var screenWidth = canvas ? canvas.designResolution.width : 1280
        
        // 创建等待界面容器
        var waitingNode = new cc.Node("WaitingForPlayersUI")
        waitingNode.setContentSize(cc.size(screenWidth, screenHeight))
        waitingNode.anchorX = 0.5
        waitingNode.anchorY = 0.5
        waitingNode.x = 0
        waitingNode.y = 0
        waitingNode.zIndex = 2000
        waitingNode.parent = this.node
        this._waitingUINode = waitingNode
        
        // 半透明背景
        var bgNode = new cc.Node("Bg")
        bgNode.setContentSize(cc.size(screenWidth, screenHeight))
        var bgGraphics = bgNode.addComponent(cc.Graphics)
        bgGraphics.fillColor = cc.color(0, 0, 0, 150)
        bgGraphics.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight)
        bgGraphics.fill()
        bgNode.parent = waitingNode
        
        // 等待标题
        var titleNode = new cc.Node("Title")
        titleNode.y = 120
        var titleLabel = titleNode.addComponent(cc.Label)
        titleLabel.string = "⏳ 等待玩家加入..."
        titleLabel.fontSize = 36
        titleLabel.lineHeight = 48
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        titleNode.color = cc.color(255, 215, 0)
        
        var titleOutline = titleNode.addComponent(cc.LabelOutline)
        titleOutline.color = cc.color(0, 0, 0)
        titleOutline.width = 2
        titleNode.parent = waitingNode
        
        // 玩家数量提示
        var countNode = new cc.Node("Count")
        countNode.y = 50
        var countLabel = countNode.addComponent(cc.Label)
        countLabel.string = "当前人数: " + (3 - needPlayers) + " / 3"
        countLabel.fontSize = 28
        countLabel.lineHeight = 36
        countLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        countNode.color = cc.color(200, 200, 220)
        countNode.parent = waitingNode
        this._waitingCountLabel = countLabel
        
        // 还需玩家数
        var needNode = new cc.Node("Need")
        needNode.y = 0
        var needLabel = needNode.addComponent(cc.Label)
        needLabel.string = "还需 " + needPlayers + " 位玩家"
        needLabel.fontSize = 24
        needLabel.lineHeight = 32
        needLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        needNode.color = cc.color(150, 200, 255)
        needNode.parent = waitingNode
        this._waitingNeedLabel = needLabel
        
        // 等待动画（旋转的加载图标）
        var loadingNode = new cc.Node("LoadingIcon")
        loadingNode.y = -80
        var loadingLabel = loadingNode.addComponent(cc.Label)
        loadingLabel.string = "🔄"
        loadingLabel.fontSize = 48
        loadingNode.parent = waitingNode
        this._waitingLoadingNode = loadingNode
        
        // 旋转动画
        var rotateAction = cc.repeatForever(cc.rotateBy(2, 360))
        loadingNode.runAction(rotateAction)
        
        // 提示信息
        var tipNode = new cc.Node("Tip")
        tipNode.y = -160
        var tipLabel = tipNode.addComponent(cc.Label)
        tipLabel.string = "房间已创建，其他玩家可以加入"
        tipLabel.fontSize = 20
        tipLabel.lineHeight = 28
        tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        tipNode.color = cc.color(150, 150, 170)
        tipNode.parent = waitingNode
        
        // 离开房间按钮
        var leaveBtnNode = new cc.Node("LeaveBtn")
        leaveBtnNode.y = -240
        var leaveBtnBg = leaveBtnNode.addComponent(cc.Graphics)
        leaveBtnBg.fillColor = cc.color(180, 60, 60)
        leaveBtnBg.roundRect(-80, -20, 160, 40, 8)
        leaveBtnBg.fill()
        leaveBtnNode.parent = waitingNode
        
        var leaveBtnLabel = new cc.Node("Label")
        var leaveLabel = leaveBtnLabel.addComponent(cc.Label)
        leaveLabel.string = "离开房间"
        leaveLabel.fontSize = 24
        leaveLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        leaveBtnLabel.color = cc.color(255, 255, 255)
        leaveBtnLabel.parent = leaveBtnNode
        
        // 离开按钮点击事件
        leaveBtnNode.on(cc.Node.EventType.TOUCH_END, function() {
            console.log("点击离开房间")
            self._leaveRoom()
        })
        
        // 开始匹配动画计时
        this._waitingAnimTime = 0
        this._updateWaitingAnimation()
    },
    
    // 更新等待界面
    _updateWaitingUI: function() {
        if (!this._isWaitingForPlayers) return
        
        var currentPlayers = this.playerNodeList.length
        var needPlayers = 3 - currentPlayers
        
        console.log("更新等待界面，当前人数:", currentPlayers, "还需:", needPlayers)
        
        if (this._waitingCountLabel) {
            this._waitingCountLabel.string = "当前人数: " + currentPlayers + " / 3"
        }
        
        if (this._waitingNeedLabel) {
            this._waitingNeedLabel.string = "还需 " + needPlayers + " 位玩家"
        }
        
        // 满员则隐藏等待界面
        if (currentPlayers >= 3) {
            this._hideWaitingUI()
        }
    },
    
    // 更新等待动画
    _updateWaitingAnimation: function() {
        var self = this
        
        if (!this._isWaitingForPlayers || !this._waitingUINode) return
        
        // 动态更新提示文字
        var tips = [
            "正在等待其他玩家...",
            "房间已创建，等待加入...",
            "邀请好友一起玩吧！"
        ]
        
        this._waitingAnimTime++
        if (this._waitingAnimTime % 300 === 0) {  // 每5秒换一次提示
            var tipNode = this._waitingUINode.getChildByName("Tip")
            if (tipNode) {
                var label = tipNode.getComponent(cc.Label)
                if (label) {
                    label.string = tips[Math.floor(this._waitingAnimTime / 300) % tips.length]
                }
            }
        }
        
        // 继续动画
        this.scheduleOnce(function() {
            self._updateWaitingAnimation()
        }, 1/60)
    },
    
    // 隐藏等待界面
    _hideWaitingUI: function() {
        this._isWaitingForPlayers = false
        
        if (this._waitingUINode) {
            this._waitingUINode.destroy()
            this._waitingUINode = null
        }
        
        this._waitingCountLabel = null
        this._waitingNeedLabel = null
        this._waitingLoadingNode = null
        
        console.log("等待界面已隐藏")
    },
    
    // 离开房间
    _leaveRoom: function() {
        console.log("离开房间")
        
        var myglobal = window.myglobal
        if (myglobal && myglobal.socket) {
            // 发送离开房间消息（如果有的话）
            if (myglobal.socket.leaveRoom) {
                myglobal.socket.leaveRoom()
            }
        }
        
        // 清理状态
        this._hideWaitingUI()
        
        // 返回大厅
        cc.director.loadScene("hallScene")
    },
    
    // update (dt) {},
});
