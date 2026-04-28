// 创建房间脚本

cc.Class({
    extends: cc.Component,

    properties: {
        // 房间配置选项可以在这里添加
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化
    },

    start () {
        // 开始
    },

    // 按钮点击事件处理
    onButtonClick(event, customData) {
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.error("socket 未连接");
            return;
        }

        switch (customData) {
            case "create_room_1":
                console.log("创建房间类型1 - 普通场");
                this._createRoom(1);  // 房间配置ID = 1
                break;
            case "create_room_2":
                console.log("创建房间类型2 - 高级场");
                this._createRoom(2);  // 房间配置ID = 2
                break;
            case "create_room_3":
                console.log("创建房间类型3 - 富豪场");
                this._createRoom(3);  // 房间配置ID = 3
                break;
            case "create_room_4":
                console.log("创建房间类型4 - 至尊场");
                this._createRoom(4);  // 房间配置ID = 4
                break;
            case "create_room_close":
                console.log("关闭创建房间面板");
                this.node.destroy();
                break;
            default:
                break;
        }
    },

    _createRoom(roomConfigId) {
        var myglobal = window.myglobal;
        if (myglobal && myglobal.socket) {
            // 发送创建房间请求，携带房间配置ID
            myglobal.socket.createRoom(roomConfigId, function(result, data) {
                if (result === 0) {
                    console.log("创建房间成功:", JSON.stringify(data));
                    
                    // 保存房间信息到 playerData
                    myglobal.playerData.roomid = data.room_code
                    myglobal.playerData.bottom = 100
                    myglobal.playerData.rate = 1
                    
                    // 保存重连信息到 localStorage
                    myglobal.socket.saveReconnectInfo()
                    
                    // 跳转到游戏场景
                    cc.director.loadScene("gameScene")
                } else {
                    console.error("创建房间失败");
                }
            });
            console.log("发送创建房间请求, 配置ID:", roomConfigId);
        }
    }
});
