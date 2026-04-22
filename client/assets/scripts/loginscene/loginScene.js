// 登录场景控制器
// 使用全局变量，不使用 require

cc.Class({
    extends: cc.Component,

    properties: {
        wait_node: {
            type: cc.Node,
            default: null
        },
        user_agreement_prefabs: {
            type: cc.Prefab,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("loginScene onLoad 开始");
        
        // 确保 myglobal 存在
        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }
        
        this._initAndStart();
    },
    
    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;
        
        var checkMyglobal = function() {
            attempts++;
            console.log("等待 myglobal... (第 " + attempts + " 次)");
            
            if (typeof window.myglobal !== 'undefined') {
                console.log("myglobal 已就绪");
                self._initAndStart();
            } else if (attempts < maxAttempts) {
                setTimeout(checkMyglobal, 100);
            } else {
                console.error("myglobal 加载超时，请刷新页面重试");
                // 显示错误提示（如果有）
                self._showError("加载失败，请刷新页面重试");
            }
        };
        
        setTimeout(checkMyglobal, 100);
    },
    
    _initAndStart: function() {
        var myglobal = window.myglobal;
        var isopen_sound = window.isopen_sound || 1;
        
        // 如果 socket 未初始化，尝试初始化
        if (!myglobal.socket) {
            if (!myglobal.init()) {
                console.error("myglobal 初始化失败");
                this._showError("初始化失败，请刷新页面重试");
                return;
            }
        }
        
        console.log("loginScene 初始化完成");
        console.log("  - myglobal.socket:", !!myglobal.socket);
        console.log("  - myglobal.playerData:", !!myglobal.playerData);
        
        // 播放背景音乐
        if (isopen_sound) {
            // 使用 cc.resources.load 加载音频资源（替代已弃用的 cc.url.raw）
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (err) {
                    console.log("加载背景音乐失败:", err);
                    return;
                }
                try {
                    cc.audioEngine.playMusic(clip, true);
                } catch(e) {
                    console.log("播放背景音乐失败:", e);
                }
            });
        }
        
        // 初始化 WebSocket 连接
        if (myglobal.socket && myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }
    },
    
    _showError: function(message) {
        // 尝试显示错误信息
        console.error("错误:", message);
        // 可以在这里添加一个错误提示 UI
    },
    
    start () {
        console.log("loginScene start");
    },
    
    onButtonCilck(event, customData) {
        console.log("onButtonCilck:", customData);
        
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.error("myglobal 或 socket 未初始化");
            return;
        }
        
        switch(customData) {
            case "wx_login":
                console.log("wx_login request");
                
                myglobal.socket.request_wxLogin({
                    uniqueID: myglobal.playerData.uniqueID,
                    accountID: myglobal.playerData.accountID,
                    nickName: myglobal.playerData.nickName,
                    avatarUrl: myglobal.playerData.avatarUrl,
                }, function(err, result) {
                    if (err != 0) {
                        console.log("登录错误:" + err);
                        return;
                    }

                    console.log("登录成功" + JSON.stringify(result));
                    myglobal.playerData.gobal_count = result.goldcount || 0;
                    cc.director.loadScene("hallScene");
                }.bind(this));
                break;
            case "user_agreement":
                console.log("user_agreement click");
                if (this.user_agreement_prefabs) {
                    var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs);
                    userAgreement_popup.parent = this.node;
                    userAgreement_popup.zIndex = 100;
                } else {
                    console.error("用户协议prefab未设置");
                }
                break;
            default:
                break;
        }
    }
});
