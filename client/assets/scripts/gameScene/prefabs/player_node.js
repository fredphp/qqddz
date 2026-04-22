// 使用全局变量，不使用 require
var qian_state = window.qian_state || { buqiang: 0, qian: 1 }

cc.Class({
    extends: cc.Component,

    properties: {
        account_label:cc.Label,
        nickname_label:cc.Label,
        room_touxiang:cc.Sprite,
        globalcount_label:cc.Label,
        headimage:cc.Sprite,
        readyimage:cc.Node,
        offlineimage:cc.Node,
        card_node:cc.Node,
        card_prefab:cc.Prefab,
        clockimage:cc.Node,
        qiangdidzhu_node:cc.Node,
        time_label:cc.Label,
        robimage_sp:cc.SpriteFrame,
        robnoimage_sp:cc.SpriteFrame,
        robIconSp: cc.Sprite,
        robIcon_Sp:cc.Node,
        robnoIcon_Sp:cc.Node,
        masterIcon:cc.Node,
    },

    onLoad () {
      this.readyimage.active = false
      this.offlineimage.active = false
      
      this.node.on("gamestart_event",function(event){
        this.readyimage.active = false
      }.bind(this))

      this.node.on("push_card_event",function(event){
        var myglobal = window.myglobal
        console.log("on push_card_event")
        if(this.accountid==myglobal.playerData.accountID){
            return
        }
        this.pushCard()
      }.bind(this))

      this.node.on("playernode_rob_state_event",function(event){
          var detail = event
          if(detail.accountid==this.accountid){
            this.qiangdidzhu_node.active = false
          }

          if(this.accountid == detail.accountid){
            if(detail.state==qian_state.qian){
              console.log("this.robIcon_Sp.active = true")
              this.robIcon_Sp.active = true
            }else if(detail.state==qian_state.buqiang){
              this.robnoIcon_Sp.active = true
            }else{
              console.log("get rob value :"+detail.state)
            }
          }
      }.bind(this))

      this.node.on("playernode_changemaster_event",function(event){
         var detail = event 
         this.robIcon_Sp.active = false
         this.robnoIcon_Sp.active = false
         if(detail==this.accountid){
            this.masterIcon.active = true
         }
      }.bind(this))
    },

    start () {
    },

    init_data(data,index){
      var myglobal = window.myglobal
      console.log("init_data:"+JSON.stringify(data))
      this.accountid = data.accountid
      this.account_label.string = data.accountid
      this.nickname_label.string = data.nick_name
      this.globalcount_label.string = data.goldcount
      this.cardlist_node = []
      this.seat_index = index
      if(data.isready==true){
        this.readyimage.active = true
      }

      var str = data.avatarUrl
      var head_image_path = "UI/headimage/" + str
      cc.loader.loadRes(head_image_path,cc.SpriteFrame,function(err,spriteFrame) {
          if (err) {
              console.log(err.message || err)
              return
          }
          this.headimage.spriteFrame = spriteFrame
      }.bind(this))

      this.node.on("player_ready_notify",function(event){
          console.log("player_ready_notify event",event)
          var detail = event
          console.log("------player_ready_notify detail:"+detail)
          if(detail==this.accountid){
              this.readyimage.active = true
          }
      }.bind(this))

      this.node.on("playernode_canrob_event",function(event){
          var detail = event
          console.log("------playernode_canrob_event detail:"+detail)
          if(detail==this.accountid){
            this.qiangdidzhu_node.active=true
            this.time_label.string="10"
          }
      }.bind(this))
      
      if(index==1){
        this.card_node.x = -this.card_node.x - 30
      }
    },

    pushCard(){
        this.card_node.active = true 
        for(var i=0;i<17;i++){
            var card = cc.instantiate(this.card_prefab)
            card.scale=0.6
            console.log(" this.card_node.parent.parent"+ this.card_node.parent.parent.name)
            card.parent = this.card_node
            var height = card.height
            card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i
            card.x = 0
            this.cardlist_node.push(card)
        }
    },
});
