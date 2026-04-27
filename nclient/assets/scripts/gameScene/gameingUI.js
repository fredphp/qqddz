// 使用全局变量，不使用 require
var isopen_sound = window.isopen_sound || 1
var qian_state = window.qian_state || { buqiang: 0, qian: 1 }
var CardsValue = window.CardsValue || {}

cc.Class({
    name: 'gameingUI',
    extends: cc.Component,

    properties: {
        gameingUI: cc.Node,
        card_prefab:cc.Prefab,
        robUI:cc.Node,
        bottom_card_pos_node:cc.Node,
        playingUI_node:cc.Node,
        tipsLabel:cc.Label,
    
    },

    onLoad () {
        var myglobal = window.myglobal
        if (!myglobal) {
            console.error("myglobal 未定义")
            return
        }
        
        //自己牌列表 
        this.cards_nods = []
        this.card_width = 0
        //当前可以抢地主的accountid
        this.rob_player_accountid = 0
        //发牌动画是否结束
        this.fapai_end = false
        //底牌数组
        this.bottom_card = []
        //底牌的json对象数据
        this.bottom_card_data=[]
        this.choose_card_data=[]
        this.outcar_zone = []

        this.push_card_tmp = []
        
        //监听服务器:下发牌消息
        myglobal.socket.onPushCards(function(data){
            console.log("onPushCards"+JSON.stringify(data))
            this.card_data = data
            this.cur_index_card = data.length - 1
            this.pushCard(data)
            if(isopen_sound){
                console.log("start fapai_audioID"+this.fapai_audioID) 
            }
            this.scheduleOnce(this._runactive_pushcard.bind(this),0.3)
            this.node.parent.emit("pushcard_other_event")
        }.bind(this))

        //监听服务器:通知抢地主消息
        myglobal.socket.onCanRobState(function(data){
            console.log("onCanRobState"+JSON.stringify(data))
            this.rob_player_accountid = data
            if(data==myglobal.playerData.accountID && this.fapai_end==true){
                this.robUI.active = true
            }
        }.bind(this))
        
        //监听服务器可以出牌消息
        myglobal.socket.onCanChuCard(function(data){
            console.log("onCanChuCard"+data)
            if(data==myglobal.playerData.accountID){
                this.clearOutZone(myglobal.playerData.accountID)
                this.playingUI_node.active = true
            }
        }.bind(this))

        //监听服务器：其他玩家出牌消息
        myglobal.socket.onOtherPlayerChuCard(function(data){
            console.log("onOtherPlayerChuCard"+JSON.stringify(data))
            var accountid = data.accountid
            
            // 安全检查
            if (!this.node || !this.node.parent) {
                console.error("节点或父节点不存在")
                return
            }
            
            var gameScene_script = this.node.parent.getComponent("gameScene")
            if (!gameScene_script) {
                console.error("无法获取 gameScene 组件")
                return
            }
            
            var outCard_node = gameScene_script.getUserOutCardPosByAccount(accountid)
            if(outCard_node==null){
                return
            }

            // 检查 card_prefab 是否存在
            if (!this.card_prefab) {
                console.error("card_prefab 未绑定")
                return
            }

            var node_cards = []
            for(var i=0;i<data.cards.length;i++){
                var card = cc.instantiate(this.card_prefab)
                if (card) {
                    var cardScript = card.getComponent("card")
                    if (cardScript) {
                        cardScript.showCards(data.cards[i],myglobal.playerData.accountID)
                    }
                    node_cards.push(card)
                }
            }
            this.appendOtherCardsToOutZone(outCard_node,node_cards,0)
        }.bind(this))

        //内部事件:显示底牌事件
        this.node.on("show_bottom_card_event",function(data){
            console.log("----show_bottom_card_event",data)
            this.bottom_card_data = data
            
            for(var i=0;i<data.length;i++){
                var card = this.bottom_card[i]
                var show_data = data[i]
                var call_data = {
                    "obj":card,
                    "data":show_data,
                }
                var run = cc.callFunc(function(target,activedata){
                    var show_card = activedata.obj
                    var show_data = activedata.data
                    show_card.getComponent("card").showCards(show_data)
                },this,call_data)

                card.runAction(cc.sequence(cc.rotateBy(0,0,180),cc.rotateBy(0.2,0,-90),run,
                cc.rotateBy(0.2,0,-90),cc.scaleBy(1,1.2)))
               
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/start.mp3")) 
                }
            }

            if(myglobal.playerData.accountID==myglobal.playerData.master_accountid){
                this.scheduleOnce(this.pushThreeCard.bind(this),0.2)
            }
        }.bind(this))

        //注册监听选择牌消息 
        this.node.on("choose_card_event",function(event){
            console.log("choose_card_event:"+JSON.stringify(event))
            this.choose_card_data.push(event)
        }.bind(this))

        this.node.on("unchoose_card_event",function(event){
            console.log("unchoose_card_event:"+event)
            for(var i=0;i<this.choose_card_data.length;i++){
                if(this.choose_card_data[i].cardid==event){
                    this.choose_card_data.splice(i,1)
                }
            }
        }.bind(this))
    },

    start () {
    },

    //处理发牌的效果
    _runactive_pushcard(){
        var myglobal = window.myglobal
        if(this.cur_index_card < 0){
            console.log("pushcard end")
            this.fapai_end = true
            if(this.rob_player_accountid==myglobal.playerData.accountID){
                this.robUI.active = true
            }
            if(isopen_sound){
                cc.audioEngine.stop(this.fapai_audioID)
            }
            var sendevent = this.rob_player_accountid
            this.node.parent.emit("canrob_event",sendevent)
            return
        }

        var move_node = this.cards_nods[this.cards_nods.length-this.cur_index_card-1]
        move_node.active = true
        this.push_card_tmp.push(move_node)
        this.fapai_audioID = cc.audioEngine.play(cc.url.raw("resources/sound/fapai1.mp3"))
        for(var i=0;i<this.push_card_tmp.length-1;i++){
            var move_node = this.push_card_tmp[i]
            var newx = move_node.x - (this.card_width * 0.4)
            var action = cc.moveTo(0.1, cc.v2(newx, -250))
            move_node.runAction(action)
        }
        
        this.cur_index_card--
        this.scheduleOnce(this._runactive_pushcard.bind(this),0.3)
    },
 
    //对牌排序
    sortCard(){
        this.cards_nods.sort(function(x,y){
            var a = x.getComponent("card").card_data
            var b = y.getComponent("card").card_data
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value-a.value
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king-a.king
            }
        })
        var timeout = 1000
        setTimeout(function(){
            var x = this.cards_nods[0].x
            console.log("sort x:"+x)
            for (var i = 0; i < this.cards_nods.length; i++) {
                var card = this.cards_nods[i]
                card.zIndex = i
                card.x = x + card.width * 0.4 * i
            }
        }.bind(this), timeout)
    },

    pushCard(data){
        var myglobal = window.myglobal
        if (data) {
            data.sort(function (a, b) {
                if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                    return b.value - a.value
                }
                if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                    return -1
                }
                if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return 1
                }
                if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return b.king - a.king
                }
            })
        }
        this.cards_nods = []
        for(var i=0;i<17;i++){
            var card = cc.instantiate(this.card_prefab)
            card.scale=0.8
            card.parent = this.node.parent
            card.x = card.width * 0.4 * (-0.5) * (-16) + card.width * 0.4 * 0
            card.y = -250
            card.active = false
            card.getComponent("card").showCards(data[i],myglobal.playerData.accountID)
            this.cards_nods.push(card)
            this.card_width = card.width
        }
      
        //创建3张底牌
        this.bottom_card = []
        for(var i=0;i<3;i++){
            var di_card = cc.instantiate(this.card_prefab)
            di_card.scale=0.4
            di_card.position = this.bottom_card_pos_node.position 
            if(i==0){
                di_card.x = di_card.x - di_card.width*0.4
            }else if(i==2){
                di_card.x = di_card.x + di_card.width*0.4
            }
            di_card.parent = this.node.parent
            this.bottom_card.push(di_card)
        }
    },

    schedulePushThreeCard(){
        for(var i=0;i<this.cards_nods.length;i++){
            var card = this.cards_nods[i]
            if(card.y==-230){
                card.y = -250
            }
        }
    },
    
    pushThreeCard(){
        var myglobal = window.myglobal
        var last_card_x = this.cards_nods[this.cards_nods.length-1].x
        for(var i=0;i<this.bottom_card_data.length;i++){
            var card = cc.instantiate(this.card_prefab)
            card.scale=0.8
            card.parent = this.node.parent
            card.x = last_card_x + ((i+1)*this.card_width * 0.4)
            card.y = -230
            card.getComponent("card").showCards(this.bottom_card_data[i],myglobal.playerData.accountID)
            card.active = true
            this.cards_nods.push(card)
        }
        this.sortCard()
        this.scheduleOnce(this.schedulePushThreeCard.bind(this),2)
    },

    destoryCard(accountid,choose_card){
        if(choose_card.length==0){
            return
        }
        var destroy_card = []
        for(var i=0;i<choose_card.length;i++){
            for(var j=0;j<this.cards_nods.length;j++){
                var card_id = this.cards_nods[j].getComponent("card").card_id
                if(card_id==choose_card[i].cardid){
                    console.log("destroy card id:"+card_id)
                    this.cards_nods[j].removeFromParent(true)
                    destroy_card.push(this.cards_nods[j])
                    this.cards_nods.splice(j,1)
                }
            }
        }
        this.appendCardsToOutZone(accountid,destroy_card)
        this.updateCards()
    },

    clearOutZone(accountid){
        var gameScene_script = this.node.parent.getComponent("gameScene")
        var outCard_node = gameScene_script.getUserOutCardPosByAccount(accountid)
        if(outCard_node){
            outCard_node.removeAllChildren(true)
        }
    },
    
    pushCardSort(cards){
        if(cards.length==1){
            return
        }
        cards.sort(function(x,y){
            var a = x.getComponent("card").card_data
            var b = y.getComponent("card").card_data
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value - a.value
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king
            }
        })
    },

    appendOtherCardsToOutZone(outCard_node,cards,yoffset){
        outCard_node.removeAllChildren(true)
        for(var i=0;i<cards.length;i++){
            var card = cards[i]
            outCard_node.addChild(card,100+i)
        }
        var zPoint = cards.length / 2
        for(var i=0;i<cards.length;i++){
            var cardNode = outCard_node.getChildren()[i]
            var x = (i - zPoint) * 30
            var y = cardNode.y+yoffset
            cardNode.setScale(0.5, 0.5)
            cardNode.setPosition(x,y)
        }
    },
    
    appendCardsToOutZone(accountid,destroy_card){
        if(destroy_card.length==0){
            return
        }
        this.pushCardSort(destroy_card)
        var gameScene_script = this.node.parent.getComponent("gameScene")
        var outCard_node = gameScene_script.getUserOutCardPosByAccount(accountid)
        this.appendOtherCardsToOutZone(outCard_node,destroy_card,360)
    },

    updateCards(){
        var zeroPoint = this.cards_nods.length / 2
        for(var i=0;i<this.cards_nods.length;i++){
            var cardNode = this.cards_nods[i]
            var x = (i - zeroPoint)*(this.card_width * 0.4)
            cardNode.setPosition(x, -250)
        }
    },
    
    playPushCardSound(card_name){
        console.log("playPushCardSound:"+card_name)
        if(card_name==""){
            return
        }
        switch(card_name){
            case CardsValue.one.name:
                break
            case CardsValue.double.name:
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/duizi.mp3")) 
                }
                break  
        }
    },
    
    onButtonClick(event,customData){
        var myglobal = window.myglobal
        switch(customData){
            case "btn_qiandz":
                console.log("btn_qiandz")
                myglobal.socket.requestRobState(qian_state.qian)
                this.robUI.active = false
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/woman_jiao_di_zhu.ogg")) 
                }
                break
            case "btn_buqiandz":
                console.log("btn_buqiandz")
                myglobal.socket.requestRobState(qian_state.buqiang)
                this.robUI.active = false
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/woman_bu_jiao.ogg")) 
                }
                break    
            case "nopushcard":
                myglobal.socket.request_buchu_card([],null)
                this.playingUI_node.active = false
                break
            case "pushcard":
                if(this.choose_card_data.length==0){
                    this.tipsLabel.string="请选择牌!"
                    setTimeout(function(){
                        this.tipsLabel.string=""
                    }.bind(this), 2000)
                }
                myglobal.socket.request_chu_card(this.choose_card_data,function(err,data){
                    if(err){
                        console.log("request_chu_card:"+err)
                        if(this.tipsLabel.string==""){
                            this.tipsLabel.string = data.msg || "出牌失败"
                            setTimeout(function(){
                                this.tipsLabel.string=""
                            }.bind(this), 2000)
                        }
                        for(var i=0;i<this.cards_nods.length;i++){
                            var card = this.cards_nods[i]
                            card.emit("reset_card_flag")
                        }
                        this.choose_card_data = []
                    }else{
                        console.log("resp_chu_card data:"+JSON.stringify(data))
                        this.playingUI_node.active = false
                        if(data.cardvalue){
                            this.playPushCardSound(data.cardvalue.name)
                        }
                        this.destoryCard(data.account,this.choose_card_data)
                        this.choose_card_data = []
                    }
                }.bind(this))
                break
            case "tipcard":
                break            
            default:
                break
        }
    }
});
