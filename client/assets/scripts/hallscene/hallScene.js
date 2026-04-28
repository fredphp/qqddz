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
       
       // 设置金币显示的字体大小和位置
       this.gobal_count.fontSize = 48
       this.gobal_count.lineHeight = 56
       if (this.gobal_count.node) {
           this.gobal_count.node.y = 50
       }
       
       // 调整金币图标和框的位置
       this._adjustGoldElementsPosition()
       
       // 隐藏不需要的按钮（创建房间、加入房间按钮不应该在大厅显示）
       this._hideUnwantedButtons();
       
       // 初始化房间选择按钮的点击事件
       this._initRoomButtons();
       
       // 移除公告栏（如果存在）
       this._removeNoticeBoard();
       
       // 更新房间货币显示（根据房间类型显示"豆"或"竞技币"）
       this._updateRoomCurrencyDisplay();
       
       // 延迟再次更新（确保所有节点都已加载）
       this.scheduleOnce(function() {
           this._updateRoomCurrencyDisplay();
       }, 1.0);
    },
    
    // 更新房间货币显示
    // 根据房间类型：普通场显示"豆"，竞技场显示"竞技币"
    _updateRoomCurrencyDisplay: function() {
        var self = this;
        
        // 房间类型映射：按钮名称 -> 房间配置类型
        // roomType: 1-新手场, 2-普通场, 3-高级场, 4-富豪场, 5-至尊场
        // roomCategory: 1-普通场(显示豆), 2-竞技场(显示竞技币)
        var roomConfigs = {
            // 默认配置，实际应从服务器获取
            // 格式: { roomType: { category: 1|2, name: "房间名" } }
            1: { category: 1, name: "初级房" },  // 新手场 - 普通场
            2: { category: 1, name: "中级房" },  // 普通场 - 普通场
            3: { category: 1, name: "高级房" },  // 高级场 - 普通场
            4: { category: 1, name: "大师房" },  // 富豪场 - 普通场
            5: { category: 2, name: "至尊场" }   // 至尊场 - 竞技场（示例）
        };
        
        // 遍历所有文本节点，查找包含"豆"的文本并更新
        this._updateCurrencyText(this.node, roomConfigs);
        
        // 同时检查Canvas下的节点
        var canvas = cc.find("Canvas");
        if (canvas) {
            this._updateCurrencyText(canvas, roomConfigs);
        }
        
        console.log("房间货币显示已更新");
    },
    
    // 递归更新货币文本
    _updateCurrencyText: function(parentNode, roomConfigs) {
        if (!parentNode || !parentNode.children) return;
        
        var children = parentNode.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            
            // 检查节点上的 Label 组件
            var label = child.getComponent(cc.Label);
            if (label && label.string) {
                var text = label.string;
                
                // 检查是否包含"豆"字（货币单位）
                if (text.indexOf("豆") >= 0 || text.indexOf("万豆") >= 0) {
                    // 尝试根据父节点或兄弟节点判断房间类型
                    var roomCategory = this._getRoomCategoryFromNode(child, roomConfigs);
                    
                    if (roomCategory === 2) {
                        // 竞技场 - 显示"竞技币"
                        var newText = text.replace(/豆/g, "竞技币");
                        label.string = newText;
                        console.log("更新货币显示: " + text + " -> " + newText);
                    }
                    // 普通场保持显示"豆"，无需修改
                }
            }
            
            // 递归查找子节点
            if (child.children && child.children.length > 0) {
                this._updateCurrencyText(child, roomConfigs);
            }
        }
    },
    
    // 根据节点位置判断房间类型
    _getRoomCategoryFromNode: function(node, roomConfigs) {
        // 根据节点的父节点名称或位置判断房间类型
        // 这里可以根据实际场景结构调整
        
        var parent = node.parent;
        var grandParent = parent ? parent.parent : null;
        
        // 检查父节点或祖父节点的名称
        var checkNames = [];
        if (parent) checkNames.push(parent.name);
        if (grandParent) checkNames.push(grandParent.name);
        
        // 检查节点名称中的房间类型提示
        var nodeName = node.name.toLowerCase();
        if (nodeName.indexOf("arena") >= 0 || nodeName.indexOf("竞技") >= 0) {
            return 2; // 竞技场
        }
        if (nodeName.indexOf("master") >= 0 || nodeName.indexOf("至尊") >= 0) {
            // 至尊场可能是竞技场
            return roomConfigs[5] ? roomConfigs[5].category : 2;
        }
        
        // 默认返回普通场
        return 1;
    },
    
    // 调整金币相关元素位置
    _adjustGoldElementsPosition: function() {
        var playerNode = this.node.getChildByName("player_node")
        if (!playerNode) {
            playerNode = cc.find("Canvas/player_node")
        }
        if (playerNode) {
            // 调整元宝图标位置
            var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon")
            if (yuanbaoIcon) {
                yuanbaoIcon.y = 50
                console.log("✅ 元宝图标位置已调整: y=50")
            }
            
            // 调整金币框位置
            var goldFrame = playerNode.getChildByName("gold_frame")
            if (goldFrame) {
                goldFrame.y = 50
                console.log("✅ 金币框位置已调整: y=50")
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
