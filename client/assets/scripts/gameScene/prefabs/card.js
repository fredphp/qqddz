// 使用全局变量，不使用 require
var RoomState = window.RoomState || {}

cc.Class({
    extends: cc.Component,

    properties: {
     cards_sprite_atlas: cc.SpriteAtlas,
    },

    onLoad () {
        this.flag = false
        this.offset_y = 20
        
        this.node.on("reset_card_flag",function(event){
            if(this.flag==true){
                this.flag = false
                this.node.y -= this.offset_y
            }
        }.bind(this))
    },

    runToCenter(){
    },
    
    start () {
    },

    init_data(data){
    },

    setTouchEvent(){
        var myglobal = window.myglobal
        if(this.accountid==myglobal.playerData.accountID){
            this.node.on(cc.Node.EventType.TOUCH_START,function(event){
                var gameScene_node = this.node.parent  
                var room_state = gameScene_node.getComponent("gameScene").roomstate
                if(room_state==RoomState.ROOM_PLAYING){
                    console.log("TOUCH_START id:"+this.card_id)
                    if(this.flag==false){
                        this.flag = true
                        this.node.y += this.offset_y
                        var carddata = {
                            "cardid":this.card_id,
                            "card_data":this.card_data,
                        }
                        gameScene_node.emit("choose_card_event",carddata)
                    }else{
                        this.flag=false
                        this.node.y -= this.offset_y
                        gameScene_node.emit("unchoose_card_event",this.card_id)
                    }
                }
            }.bind(this))
        }
    },
    
    showCards(card,accountid){
        this.card_id = card.index
        this.card_data = card
        if(accountid){
            this.accountid = accountid
        }

        const CardValue = {
            "12": 1, "13": 2, "1": 3, "2": 4, "3": 5, "4": 6, "5": 7,
            "6": 8, "7": 9, "8": 10, "9": 11, "10": 12, "11": 13
        };

        const cardShpae = {
            "1": 3, "2": 2, "3": 1, "4": 0
        };
        
        const Kings = {
            "14": 54, "15": 53
        };

        var spriteKey = '';
        if (card.shape){
            spriteKey = 'card_' + (cardShpae[card.shape] * 13 + CardValue[card.value]);
        }else {
            spriteKey = 'card_' + Kings[card.king];
        }

        this.node.getComponent(cc.Sprite).spriteFrame = this.cards_sprite_atlas.getSpriteFrame(spriteKey)
        this.setTouchEvent()
    }
});
