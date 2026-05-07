// 使用全局变量，不使用 require

cc.Class({
    extends: cc.Component,
    name: 'gamebeforeUI',

    properties: {
        btn_ready:cc.Node,
        btn_gamestart:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var myglobal = window.myglobal
        if (!myglobal) {
            console.error("myglobal 未定义")
            return
        }

        console.log("🎮 [gamebeforeUI] onLoad 开始")
        console.log("🎮 [gamebeforeUI] btn_ready 节点:", this.btn_ready ? "存在" : "不存在")
        console.log("🎮 [gamebeforeUI] btn_gamestart 节点:", this.btn_gamestart ? "存在" : "不存在")

        this.btn_gamestart.active = false
        this.btn_ready.active = false

        // 创建换房按钮
        this._createChangeRoomButton()

        //监听本地的发送的消息
        this.node.on("init",function(){
            console.log("========================================")
            console.log("🎮 [gamebeforeUI] 收到 init 事件")
            console.log("========================================")
            
            // 标记 init 已处理
            this._initProcessed = true
            
            // 获取房主ID（服务端返回的 creator_id）
            var houseId = myglobal.playerData.housemanageid
            console.log("🎮 [gamebeforeUI] housemanageid (从 myglobal.playerData):", houseId)
            console.log("🎮 [gamebeforeUI] housemanageid 类型:", typeof houseId)
            
            // 获取当前玩家ID - 优先使用 socket 的 playerId（服务端分配的ID）
            var myId = ""
            if (myglobal.socket && myglobal.socket.getPlayerInfo) {
                var playerInfo = myglobal.socket.getPlayerInfo()
                console.log("🎮 [gamebeforeUI] getPlayerInfo() 返回:", JSON.stringify(playerInfo))
                myId = playerInfo.id
            }
            // 备用：使用 accountID
            if (!myId) {
                console.log("🎮 [gamebeforeUI] getPlayerInfo() 返回空，使用 accountID 备用")
                myId = myglobal.playerData.accountID
            }
            
            console.log("🎮 [gamebeforeUI] 当前玩家ID(myId):", myId)
            console.log("🎮 [gamebeforeUI] myId 类型:", typeof myId)
            console.log("🎮 [gamebeforeUI] 比较结果: houseId == myId =>", houseId == myId)
            console.log("🎮 [gamebeforeUI] 比较结果: houseId === myId =>", houseId === myId)
            
            // 房主（创建房间的玩家）自动准备，不需要准备按钮
            if(houseId && myId && houseId == myId){
                console.log("🎮 [gamebeforeUI] ✅ 当前玩家是房主，已自动准备，不显示准备按钮")
                this.btn_gamestart.active = false
                this.btn_ready.active = false
                // 房主只显示换房按钮，居中显示
                this._showChangeRoomButton(true)
            }else{
                // 加入房间的玩家需要点击准备
                console.log("🎮 [gamebeforeUI] ✅ 当前玩家是加入房间的，显示准备按钮")
                console.log("🎮 [gamebeforeUI] 设置 btn_ready.active = true")
                this.btn_gamestart.active = false
                this.btn_ready.active = true
                // 显示换房按钮和准备按钮，换房在左
                this._showChangeRoomButton(false)
                console.log("🎮 [gamebeforeUI] btn_ready.active 实际值:", this.btn_ready.active)
            }
            console.log("========================================")
        }.bind(this))

        //监听服务器发送来的消息
        myglobal.socket.onChangeHouseManage(function(data){
            console.log("gamebrforeUI onChangeHouseManage revice"+JSON.stringify(data))
            myglobal.playerData.housemanageid = data
            
            var houseId = myglobal.playerData.housemanageid
            
            // 获取当前玩家ID - 优先使用 socket 的 playerId
            var myId = ""
            if (myglobal.socket && myglobal.socket.getPlayerInfo) {
                var playerInfo = myglobal.socket.getPlayerInfo()
                myId = playerInfo.id
            }
            if (!myId) {
                myId = myglobal.playerData.accountID
            }
            
            // 房主变更时重新判断
            if(houseId && myId && houseId == myId){
                this.btn_gamestart.active = false
                this.btn_ready.active = false
                this._showChangeRoomButton(true)
            }else{
                this.btn_gamestart.active = false
                this.btn_ready.active = true
                this._showChangeRoomButton(false)
            }
        }.bind(this))
    },

    // 创建换房按钮
    _createChangeRoomButton: function() {
        var self = this
        
        // 创建换房按钮节点
        var btnChangeRoom = new cc.Node("btn_changeRoom")
        btnChangeRoom.x = 0
        btnChangeRoom.y = 0
        btnChangeRoom.anchorX = 0.5
        btnChangeRoom.anchorY = 0.5
        btnChangeRoom.setContentSize(cc.size(147, 46))  // 使用图片原始尺寸
        btnChangeRoom.active = false  // 默认隐藏
        
        // 加载换房按钮图片
        cc.resources.load("UI/btnchange", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.log("🎮 换房按钮图片加载失败:", err)
                // 使用代码创建按钮背景
                var graphics = btnChangeRoom.addComponent(cc.Graphics)
                graphics.fillColor = cc.color(255, 180, 0, 255)  // 橙黄色
                graphics.roundRect(-73.5, -23, 147, 46, 10)
                graphics.fill()
                graphics.strokeColor = cc.color(200, 140, 0)
                graphics.lineWidth = 2
                graphics.roundRect(-73.5, -23, 147, 46, 10)
                graphics.stroke()
                
                // 添加按钮文字（备用）
                var labelNode = new cc.Node("Label")
                var label = labelNode.addComponent(cc.Label)
                label.string = "换房"
                label.fontSize = 22
                label.horizontalAlign = cc.Label.HorizontalAlign.CENTER
                labelNode.color = cc.color(255, 255, 255)
                var outline = labelNode.addComponent(cc.LabelOutline)
                outline.color = cc.color(100, 60, 0)
                outline.width = 2
                labelNode.parent = btnChangeRoom
            } else {
                console.log("🎮 换房按钮图片加载成功")
                var sprite = btnChangeRoom.addComponent(cc.Sprite)
                sprite.spriteFrame = spriteFrame
                sprite.sizeMode = cc.Sprite.SizeMode.RAW  // 使用图片原始尺寸
            }
        })
        
        // 添加按钮组件
        var button = btnChangeRoom.addComponent(cc.Button)
        button.transition = cc.Button.Transition.SCALE
        button.duration = 0.1
        
        // 添加点击事件
        btnChangeRoom.on(cc.Node.EventType.TOUCH_END, function() {
            console.log("🎮 点击换房按钮")
            self._changeRoom()
        })
        
        btnChangeRoom.parent = this.node
        this._btnChangeRoom = btnChangeRoom
        
        console.log("🎮 换房按钮创建完成")
    },
    
    // 显示换房按钮
    // centered: true = 居中显示（准备按钮隐藏时）, false = 左侧显示（准备按钮显示时）
    _showChangeRoomButton: function(centered) {
        if (!this._btnChangeRoom) return
        
        this._btnChangeRoom.active = true
        
        if (centered) {
            // 居中显示
            this._btnChangeRoom.x = 0
            console.log("🎮 换房按钮居中显示")
        } else {
            // 在准备按钮左边，间距20px
            // 准备按钮宽度约147px，换房按钮宽度147px
            // 换房按钮位置 = -(准备按钮宽度/2 + 间距 + 换房按钮宽度/2)
            var readyWidth = 147  // 准备按钮宽度
            var changeRoomWidth = 147  // 换房按钮宽度
            var gap = 20  // 间距
            var offsetX = -(readyWidth/2 + gap + changeRoomWidth/2)
            this._btnChangeRoom.x = offsetX
            console.log("🎮 换房按钮左侧显示, x:", offsetX)
        }
    },
    
    // 换房功能
    _changeRoom: function() {
        var myglobal = window.myglobal
        console.log("🎮 执行换房...")
        
        // 离开当前房间
        if (myglobal && myglobal.socket) {
            // 发送离开房间消息
            if (myglobal.socket.leaveRoom) {
                myglobal.socket.leaveRoom()
            }
        }
        
        // 返回大厅
        cc.director.loadScene("hallScene")
    },

    start () {
        var myglobal = window.myglobal
        if (!myglobal) return
        
        // 延迟检查，确保 housemanageid 已经设置
        this.scheduleOnce(function() {
            console.log("🎮 [gamebeforeUI start] 延迟检查准备按钮状态")
            
            // 如果 init 事件已经处理过，跳过
            if (this._initProcessed) {
                console.log("🎮 [gamebeforeUI start] init 已处理，跳过")
                return
            }
            
            // 强制检查并设置按钮状态
            var houseId = myglobal.playerData.housemanageid
            var myId = ""
            if (myglobal.socket && myglobal.socket.getPlayerInfo) {
                var playerInfo = myglobal.socket.getPlayerInfo()
                myId = playerInfo.id
            }
            if (!myId) {
                myId = myglobal.playerData.accountID
            }
            
            console.log("🎮 [gamebeforeUI start] houseId:", houseId, "myId:", myId)
            
            // 如果都不是房主，显示准备按钮
            if(houseId && myId && houseId == myId){
                console.log("🎮 [gamebeforeUI start] 当前玩家是房主")
                this.btn_ready.active = false
                this._showChangeRoomButton(true)
            } else {
                console.log("🎮 [gamebeforeUI start] 当前玩家是加入房间的，强制显示准备按钮")
                this.btn_ready.active = true
                this._showChangeRoomButton(false)
            }
        }.bind(this), 0.5)  // 延迟 0.5 秒
    },

    // update (dt) {},
    
    onButtonClick(event,customData){
        var myglobal = window.myglobal
        switch(customData){
            case "btn_ready":
                console.log("btn_ready 点击准备")
                myglobal.socket.requestReady()
                // 点击准备后隐藏按钮
                this.btn_ready.active = false
                // 准备后换房按钮居中显示
                this._showChangeRoomButton(true)
                break
            case "btn_start":
                 console.log("btn_start")
                 myglobal.socket.requestStart(function(err,data){
                    if(err!=0){
                        console.log("requestStart err"+err)
                    }else{
                        console.log("requestStart data"+ JSON.stringify(data))
                        
                    }
                 })
                 break    
            default:
                break
        }
    }
});
