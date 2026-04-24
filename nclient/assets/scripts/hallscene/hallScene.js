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
