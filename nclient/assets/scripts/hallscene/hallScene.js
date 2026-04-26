// 使用全局变量，不使用 require

cc.Class({
    name: 'hallScene',
    extends: cc.Component, 

    properties: {
        nickname_label: cc.Label,
        headimage: cc.Sprite,
        gobal_count: cc.Label,
        creatroom_prefabs: cc.Prefab,
        joinroom_prefabs: cc.Prefab,
        user_agreement_prefabs: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var myglobal = window.myglobal
        if (!myglobal || !myglobal.playerData) {
            console.error("myglobal 或 playerData 未定义")
            return
        }
        this.nickname_label.string = myglobal.playerData.nickName
        this.gobal_count.string = ":" + myglobal.playerData.gobal_count
        
        // 隐藏不需要的按钮
        this._hideUnwantedButtons();
        
        // 初始化房间选择按钮
        this._initRoomButtons();
        
        // 移除公告栏
        this._removeNoticeBoard();
    },
    
    // 隐藏不需要的按钮
    _hideUnwantedButtons: function() {
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        
        if (createRoomBtn) {
            createRoomBtn.active = false;
        }
        if (joinRoomBtn) {
            joinRoomBtn.active = false;
        }
    },
    
    // 初始化房间选择按钮
    _initRoomButtons: function() {
        var self = this;
        var roomButtons = ["btn_room_junior", "btn_room_middle", "btn_room_senior", "btn_room_master"];
        var roomNames = ["初级房", "中级房", "高级房", "大师房"];
        var roomLevels = [1, 2, 3, 4];
        
        for (var i = 0; i < roomButtons.length; i++) {
            var btnNode = this.node.getChildByName(roomButtons[i]);
            if (btnNode) {
                console.log("初始化房间按钮: " + roomButtons[i]);
                
                // 获取或添加 Button 组件
                var button = btnNode.getComponent(cc.Button);
                if (button) {
                    // 配置 Button 组件
                    button.transition = cc.Button.Transition.SCALE;
                    button.duration = 0.1;
                    button.zoomScale = 1.15;
                    
                    console.log("Button 组件已存在，配置完成: " + roomButtons[i]);
                }
                
                // 注册点击事件处理函数
                (function(index, roomName, roomLevel, node) {
                    // 使用 on 方法注册点击事件
                    node.on(cc.Node.EventType.TOUCH_END, function(event) {
                        console.log("===== 点击了房间: " + roomName + " =====");
                        event.stopPropagation();
                        self._onRoomButtonClick(index, roomName, roomLevel);
                    });
                    
                    // 也监听鼠标点击事件（Web端）
                    node.on(cc.Node.EventType.MOUSE_UP, function(event) {
                        console.log("===== 鼠标点击了房间: " + roomName + " =====");
                        event.stopPropagation();
                        self._onRoomButtonClick(index, roomName, roomLevel);
                    });
                    
                })(i, roomNames[i], roomLevels[i], btnNode);
            } else {
                console.warn("未找到房间按钮: " + roomButtons[i]);
            }
        }
    },
    
    // 房间按钮点击处理
    _onRoomButtonClick: function(roomIndex, roomName, roomLevel) {
        console.log("进入房间处理: " + roomName + " (索引: " + roomIndex + ", 等级: " + roomLevel + ")");
        
        var self = this;
        
        // 显示提示
        this._showMessage("正在进入" + roomName + "...");
        
        // 保存房间信息
        if (window.myglobal) {
            window.myglobal.currentRoomLevel = roomLevel;
            window.myglobal.currentRoomName = roomName;
        }
        
        // 检查 socket 连接
        if (window.socketCtr) {
            var socket = window.socketCtr();
            
            if (socket.request_enter_room) {
                // 通过 socket 进入房间
                socket.request_enter_room({
                    room_level: roomLevel
                }, function(result, data) {
                    if (result === 0) {
                        console.log("进入房间成功:", data);
                        if (window.myglobal) {
                            window.myglobal.roomData = data;
                        }
                        self._enterGameScene(data);
                    } else {
                        console.error("进入房间失败:", result);
                        self._showMessage("进入房间失败，请重试");
                    }
                });
                return;
            }
        }
        
        // 无 socket 连接时使用测试模式
        console.log("使用测试模式进入房间");
        
        var mockData = {
            roomid: "ROOM_" + roomLevel,
            seatindex: 1,
            playerdata: [{
                accountid: "player_1",
                nick_name: window.myglobal ? window.myglobal.playerData.nickName : "测试玩家",
                avatarUrl: "avatar_1",
                goldcount: 1000,
                seatindex: 1
            }]
        };
        
        if (window.myglobal) {
            window.myglobal.roomData = mockData;
        }
        
        // 延迟跳转
        this.scheduleOnce(function() {
            self._enterGameScene(mockData);
        }, 0.5);
    },
    
    // 进入游戏场景
    _enterGameScene: function(roomData) {
        console.log("跳转到游戏场景, 房间数据:", roomData);
        
        cc.director.loadScene("gameScene", function(err) {
            if (err) {
                console.error("加载游戏场景失败:", err);
                return;
            }
            console.log("成功进入游戏场景");
        });
    },
    
    // 显示消息提示
    _showMessage: function(message) {
        console.log("提示: " + message);
        
        // 查找或创建提示节点
        var tipNode = this.node.getChildByName("room_tip");
        if (tipNode) {
            tipNode.destroy();
        }
        
        tipNode = new cc.Node("room_tip");
        tipNode.y = 250;
        
        // 添加标签
        var label = tipNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        tipNode.color = cc.color(255, 255, 0);
        
        // 最后设置父节点（避免在设置属性时触发渲染更新）
        tipNode.parent = this.node;
        
        // 2秒后消失
        this.scheduleOnce(function() {
            if (tipNode && tipNode.isValid) {
                tipNode.destroy();
            }
        }, 2);
    },
    
    // 移除公告栏
    _removeNoticeBoard: function() {
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3"];
        
        for (var i = 0; i < noticeNames.length; i++) {
            var noticeNode = this.node.getChildByName(noticeNames[i]);
            if (noticeNode) {
                noticeNode.active = false;
            }
        }
        
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        this._hideNodesWithText(this.node, "自觉远离");
        this._hideNodesWithText(this.node, "赌博");
    },
    
    // 递归查找并隐藏包含特定文字的节点
    _hideNodesWithText: function(parentNode, searchText) {
        if (!parentNode) return;
        
        var children = parentNode.children;
        if (!children || children.length === 0) return;
        
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child || !child.isValid) continue;
            
            var label = child.getComponent(cc.Label);
            if (label && label.string) {
                if (label.string.indexOf(searchText) >= 0) {
                    var targetNode = child.parent ? child.parent : child;
                    targetNode.active = false;
                    continue;
                }
            }
            
            // 递归检查子节点
            if (child.children && child.children.length > 0) {
                this._hideNodesWithText(child, searchText);
            }
        }
    },

    start () {
        this._hideUnwantedButtons();
        this._removeNoticeBoard();
    },

    onButtonClick(event, customData) {
        switch(customData) {
            case "create_room":
                if (this.creatroom_prefabs) {
                    var creator_Room = cc.instantiate(this.creatroom_prefabs);
                    creator_Room.parent = this.node;
                }
                break;
            case "join_room":
                if (this.joinroom_prefabs) {
                    var join_Room = cc.instantiate(this.joinroom_prefabs);
                    join_Room.parent = this.node;
                }
                break;
            case "user_agreement":
                if (this.user_agreement_prefabs) {
                    var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs);
                    userAgreement_popup.parent = this.node;
                }
                break;
        }
    }
});
