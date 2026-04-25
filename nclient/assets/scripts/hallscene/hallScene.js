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
        
        for (var i = 0; i < roomButtons.length; i++) {
            var btnNode = this.node.getChildByName(roomButtons[i]);
            if (btnNode) {
                // 确保按钮有 Button 组件，如果没有则添加
                var button = btnNode.getComponent(cc.Button);
                if (!button) {
                    button = btnNode.addComponent(cc.Button);
                    button.transition = cc.Button.Transition.SCALE;
                    button.zoomScale = 0.95;
                }
                
                // 添加点击事件
                btnNode.off(cc.Node.EventType.TOUCH_END);
                (function(index, roomName) {
                    btnNode.on(cc.Node.EventType.TOUCH_END, function() {
                        self._onRoomButtonClick(index, roomName);
                    }, self);
                })(i, roomNames[i]);
                
                console.log("已初始化房间按钮: " + roomButtons[i]);
            }
        }
    },
    
    // 房间按钮点击处理
    _onRoomButtonClick: function(roomIndex, roomName) {
        console.log("点击了房间: " + roomName + " (索引: " + roomIndex + ")");
        
        // 显示提示（后续可以跳转到对应的游戏房间）
        this._showMessage("即将进入" + roomName);
    },
    
    // 显示消息提示
    _showMessage: function(message) {
        console.log(message);
    },
    
    // 移除公告栏
    _removeNoticeBoard: function() {
        var self = this;
        
        // 查找并移除可能存在的公告栏节点
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi"];
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
