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
                console.log("创建房间类型1");
                this._createRoom(1);
                break;
            case "create_room_2":
                console.log("创建房间类型2");
                this._createRoom(2);
                break;
            case "create_room_3":
                console.log("创建房间类型3");
                this._createRoom(3);
                break;
            case "create_room_4":
                console.log("创建房间类型4");
                this._createRoom(4);
                break;
            case "create_room_close":
                console.log("关闭创建房间面板");
                this.node.destroy();
                break;
            default:
                break;
        }
    },

    _createRoom(roomType) {
        var myglobal = window.myglobal;
        if (myglobal && myglobal.socket) {
            // 发送创建房间请求
            // myglobal.socket.createRoom(roomType);
            console.log("发送创建房间请求, 类型:", roomType);
        }
    }
});
