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
        
        // TODO: 根据房间类型进入对应的游戏
        // var myglobal = window.myglobal;
        // if (myglobal && myglobal.socket) {
        //     myglobal.socket.request_joinRoom({ roomLevel: roomIndex }, function(err, result) {
        //         if (!err) {
        //             cc.director.loadScene("gameScene");
        //         }
        //     });
        // }
    },
    
    // 显示消息提示
    _showMessage: function(message) {
        console.log(message);
        // 可以添加 Toast 提示
    },
    
    // 移除公告栏
    _removeNoticeBoard: function() {
        // 查找并移除可能存在的公告栏节点
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi"];
        for (var i = 0; i < noticeNames.length; i++) {
            var noticeNode = this.node.getChildByName(noticeNames[i]);
            if (noticeNode) {
                noticeNode.active = false;
                console.log("已隐藏公告栏: " + noticeNames[i]);
            }
        }
        
        // 同时检查 Canvas 下的公告栏
        var canvas = cc.find("Canvas");
        if (canvas) {
            for (var j = 0; j < noticeNames.length; j++) {
                var node = canvas.getChildByName(noticeNames[j]);
                if (node) {
                    node.active = false;
                }
            }
        }
    },

    start () {

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
