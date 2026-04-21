// 使用全局变量，不使用 require

cc.Class({
    extends: cc.Component,

    properties: {
       wait_node:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var myglobal = window.myglobal
        var isopen_sound = window.isopen_sound || 1
        
        // 确保 myglobal 已初始化
        if (!myglobal) {
            console.error("myglobal 未定义")
            return
        }
        
        // 如果 socket 未初始化，尝试初始化
        if (!myglobal.socket) {
            if (!myglobal.init()) {
                console.error("myglobal 初始化失败")
                return
            }
        }
        
        if(isopen_sound){
            cc.audioEngine.play(cc.url.raw("resources/sound/login_bg.ogg"),true) 
        }
           
        myglobal.socket.initSocket()
    },
    
    start () {
    },
    
    onButtonCilck(event,customData){
        var myglobal = window.myglobal
        switch(customData){
            case "wx_login":
                console.log("wx_login request")
                
                //this.wait_node.active = true
                
                myglobal.socket.request_wxLogin({
                    uniqueID:myglobal.playerData.uniqueID,
                    accountID:myglobal.playerData.accountID,
                    nickName:myglobal.playerData.nickName,
                    avatarUrl:myglobal.playerData.avatarUrl,
                },function(err,result){
                    //请求返回
                    //先隐藏等待UI
                    //this.wait_node.active = false
                    if(err!=0){
                       console.log("err:"+err)
                       return     
                    }

                    console.log("login sucess" + JSON.stringify(result))
                    myglobal.playerData.gobal_count = result.goldcount
                    cc.director.loadScene("hallScene")
                }.bind(this))
                break
            default:
                break
        }
    }
    // update (dt) {},


});
