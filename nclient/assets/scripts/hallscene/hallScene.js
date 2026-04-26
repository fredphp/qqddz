// 使用全局变量，不使用 require

cc.Class({
    name: 'hallScene',
    extends: cc.Component, 

    properties: {
        nickname_label:cc.Label,
        headimage:cc.Sprite,
        gobal_count:cc.Label,
        creatroom_prefabs:cc.Prefab,
        joinroom_prefabs:cc.Prefab,
        user_agreement_prefabs:cc.Prefab,
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
       
       // 隐藏不需要的按钮（创建房间、加入房间按钮不应该在大厅显示）
       this._hideUnwantedButtons();
       
       // 初始化房间选择按钮的点击事件
       this._initRoomButtons();
       
       // 移除公告栏（如果存在）
       this._removeNoticeBoard();
       
       // 监听匹配成功事件
       this._initMatchListener();
    },
    
    // 初始化匹配监听
    _initMatchListener: function() {
        var self = this;
        if (window.socketCtr) {
            var socket = window.socketCtr();
            if (socket.onRoomChangeState) {
                socket.onRoomChangeState(function(data) {
                    console.log("房间状态变化:", data);
                });
            }
        }
    },
    
    // 隐藏不需要的按钮
    _hideUnwantedButtons: function() {
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        
        if (createRoomBtn) {
            createRoomBtn.active = false;
            console.log("已隐藏创建房间按钮");
        }
        if (joinRoomBtn) {
            joinRoomBtn.active = false;
            console.log("已隐藏加入房间按钮");
        }
    },
    
    // 初始化房间选择按钮
    _initRoomButtons: function() {
        var self = this;
        var roomButtons = ["btn_room_junior", "btn_room_middle", "btn_room_senior", "btn_room_master"];
        var roomNames = ["初级房", "中级房", "高级房", "大师房"];
        var roomLevels = [1, 2, 3, 4]; // 房间等级
        
        for (var i = 0; i < roomButtons.length; i++) {
            var btnNode = this.node.getChildByName(roomButtons[i]);
            if (btnNode) {
                // 添加 Button 组件
                var button = btnNode.getComponent(cc.Button);
                if (!button) {
                    button = btnNode.addComponent(cc.Button);
                }
                
                // 设置按钮过渡效果为缩放
                button.transition = cc.Button.Transition.SCALE;
                button.duration = 0.1;
                button.zoomScale = 1.15;
                
                // 添加 BlockInputEvents 组件（如果需要）
                var blockEvents = btnNode.getComponent(cc.BlockInputEvents);
                if (!blockEvents) {
                    btnNode.addComponent(cc.BlockInputEvents);
                }
                
                // 使用闭包保存房间信息
                (function(index, roomName, roomLevel) {
                    // 注册点击事件
                    btnNode.off(cc.Node.EventType.TOUCH_START);
                    btnNode.off(cc.Node.EventType.TOUCH_END);
                    btnNode.off(cc.Node.EventType.TOUCH_CANCEL);
                    
                    // 添加触摸开始效果
                    btnNode.on(cc.Node.EventType.TOUCH_START, function(event) {
                        console.log("触摸开始: " + roomName);
                    }, self);
                    
                    // 添加触摸结束事件（点击）
                    btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                        console.log("点击了: " + roomName);
                        self._onRoomButtonClick(index, roomName, roomLevel);
                    }, self);
                    
                })(i, roomNames[i], roomLevels[i]);
                
                console.log("已初始化房间按钮: " + roomButtons[i] + " 等级: " + roomLevels[i]);
            } else {
                console.warn("未找到房间按钮: " + roomButtons[i]);
            }
        }
    },
    
    // 房间按钮点击处理
    _onRoomButtonClick: function(roomIndex, roomName, roomLevel) {
        console.log("点击了房间: " + roomName + " (索引: " + roomIndex + ", 等级: " + roomLevel + ")");
        
        var self = this;
        
        // 显示加载提示
        this._showLoading("正在进入" + roomName + "...");
        
        // 检查 socket 是否连接
        if (!window.socketCtr) {
            console.error("socketCtr 未定义");
            this._hideLoading();
            this._showMessage("网络未连接，请重新登录");
            return;
        }
        
        var socket = window.socketCtr();
        
        // 保存当前选择的房间等级
        if (window.myglobal) {
            window.myglobal.currentRoomLevel = roomLevel;
            window.myglobal.currentRoomName = roomName;
        }
        
        // 请求快速匹配进入房间
        if (socket.request_enter_room) {
            socket.request_enter_room({
                room_level: roomLevel
            }, function(result, data) {
                self._hideLoading();
                
                if (result === 0) {
                    console.log("进入房间成功:", data);
                    
                    // 保存房间信息
                    if (window.myglobal) {
                        window.myglobal.roomData = data;
                    }
                    
                    // 跳转到游戏场景
                    self._enterGameScene(data);
                } else {
                    console.error("进入房间失败:", result);
                    self._showMessage("进入房间失败，请重试");
                }
            });
        } else {
            // 如果 socket 方法不存在，直接跳转到游戏场景（测试模式）
            console.log("Socket 方法不存在，使用测试模式进入房间");
            this._hideLoading();
            
            // 模拟房间数据
            var mockData = {
                roomid: "TEST_" + roomLevel,
                seatindex: 1,
                playerdata: [
                    {
                        accountid: "player1",
                        nick_name: window.myglobal ? window.myglobal.playerData.nickName : "玩家1",
                        avatarUrl: "avatar_1",
                        goldcount: 1000,
                        seatindex: 1
                    }
                ]
            };
            
            if (window.myglobal) {
                window.myglobal.roomData = mockData;
            }
            
            this._enterGameScene(mockData);
        }
    },
    
    // 进入游戏场景
    _enterGameScene: function(roomData) {
        console.log("准备进入游戏场景, 房间数据:", roomData);
        
        // 显示进入提示
        this._showMessage("正在进入游戏房间...");
        
        // 延迟一小段时间后跳转，让用户看到提示
        this.scheduleOnce(function() {
            cc.director.loadScene("gameScene", function(err) {
                if (err) {
                    console.error("加载游戏场景失败:", err);
                    this._showMessage("加载游戏场景失败");
                    return;
                }
                console.log("成功进入游戏场景");
            });
        }, 0.5);
    },
    
    // 显示加载提示
    _showLoading: function(message) {
        console.log("显示加载: " + message);
        // 可以在这里创建一个 loading 节点
        var loadingNode = this.node.getChildByName("loading_node");
        if (!loadingNode) {
            loadingNode = new cc.Node("loading_node");
            loadingNode.parent = this.node;
            loadingNode.zIndex = 1000;
            
            // 添加背景
            var bgNode = new cc.Node("bg");
            bgNode.parent = loadingNode;
            bgNode.color = cc.color(0, 0, 0, 180);
            bgNode.width = 300;
            bgNode.height = 100;
            var bgSprite = bgNode.addComponent(cc.Sprite);
            bgSprite.type = cc.Sprite.Type.SLICED;
            
            // 添加标签
            var labelNode = new cc.Node("label");
            labelNode.parent = loadingNode;
            var label = labelNode.addComponent(cc.Label);
            label.string = message;
            label.fontSize = 24;
            label.lineHeight = 30;
        }
    },
    
    // 隐藏加载提示
    _hideLoading: function() {
        var loadingNode = this.node.getChildByName("loading_node");
        if (loadingNode) {
            loadingNode.destroy();
        }
    },
    
    // 显示消息提示
    _showMessage: function(message) {
        console.log("消息: " + message);
        
        // 创建提示节点
        var tipNode = new cc.Node("tip_node");
        tipNode.parent = this.node;
        tipNode.zIndex = 999;
        tipNode.y = 200;
        
        // 添加背景
        var bgNode = new cc.Node("bg");
        bgNode.parent = tipNode;
        bgNode.color = cc.color(0, 0, 0, 200);
        bgNode.width = 400;
        bgNode.height = 60;
        var bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        
        // 添加标签
        var labelNode = new cc.Node("label");
        labelNode.parent = tipNode;
        var label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 24;
        label.lineHeight = 30;
        label.node.color = cc.color(255, 255, 255);
        
        // 2秒后自动消失
        this.scheduleOnce(function() {
            if (tipNode) {
                tipNode.destroy();
            }
        }, 2);
    },
    
    // 移除公告栏
    _removeNoticeBoard: function() {
        var self = this;
        
        // 查找并移除可能存在的公告栏节点
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3"];
        for (var i = 0; i < noticeNames.length; i++) {
            var noticeNode = this.node.getChildByName(noticeNames[i]);
            if (noticeNode) {
                noticeNode.active = false;
                console.log("已隐藏公告栏: " + noticeNames[i]);
            }
        }
        
        // 遍历所有子节点查找包含特定文字的节点
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        this._hideNodesWithText(this.node, "自觉远离");
        this._hideNodesWithText(this.node, "赌博");
        
        // 检查 Canvas 下的公告栏
        var canvas = cc.find("Canvas");
        if (canvas) {
            for (var j = 0; j < noticeNames.length; j++) {
                var node = canvas.getChildByName(noticeNames[j]);
                if (node) {
                    node.active = false;
                }
            }
            this._hideNodesWithText(canvas, "游戏公告");
        }
        
        // 延迟再次检查（确保动态创建的节点也被处理）
        this.scheduleOnce(function() {
            self._removeNoticeBoardDelayed();
        }, 0.5);
    },
    
    // 延迟移除公告栏
    _removeNoticeBoardDelayed: function() {
        console.log("延迟检查公告栏...");
        
        // 再次隐藏按钮
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        if (createRoomBtn) createRoomBtn.active = false;
        if (joinRoomBtn) joinRoomBtn.active = false;
        
        // 再次查找并隐藏公告栏
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        this._hideNodesWithText(this.node, "自觉远离");
        this._hideNodesWithText(this.node, "赌博");
        
        // 检查场景中所有节点
        var scene = cc.director.getScene();
        if (scene) {
            this._hideNodesWithText(scene, "游戏公告");
            this._hideNodesWithText(scene, "娱乐休闲");
        }
    },
    
    // 递归查找并隐藏包含特定文字的节点
    _hideNodesWithText: function(parentNode, searchText) {
        if (!parentNode || !parentNode.children) return;
        
        var children = parentNode.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            
            // 检查节点上的 Label 组件
            var label = child.getComponent(cc.Label);
            if (label && label.string) {
                if (label.string.indexOf(searchText) >= 0) {
                    // 找到包含文字的节点，隐藏其父节点或祖父节点
                    var targetNode = child.parent ? child.parent : child;
                    targetNode.active = false;
                    console.log("已隐藏包含文字'" + searchText + "'的节点, 父节点: " + (child.parent ? child.parent.name : "无"));
                    continue;
                }
            }
            
            // 递归查找子节点
            if (child.children && child.children.length > 0) {
                this._hideNodesWithText(child, searchText);
            }
        }
    },

    start () {
        // 在 start 中再次确保隐藏
        this._hideUnwantedButtons();
        this._removeNoticeBoard();
    },

    // update (dt) {},

    onButtonClick(event,customData){
        switch(customData){
            case "create_room":
                var creator_Room = cc.instantiate(this.creatroom_prefabs)
                creator_Room.parent = this.node 
                creator_Room.zIndex = 100
                break
            case "join_room":
                var join_Room = cc.instantiate(this.joinroom_prefabs)
                join_Room.parent = this.node 
                join_Room.zIndex = 100
                break
            case "user_agreement":
                if (this.user_agreement_prefabs) {
                    var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs)
                    userAgreement_popup.parent = this.node 
                    userAgreement_popup.zIndex = 100
                } else {
                    console.error("用户协议prefab未设置")
                }
                break
            default:
                break
        }
    }
});
