
cc.Class({
    extends: cc.Component,

    properties: {
        loadimage_target: {
            type: cc.Node,
            default: null
        },
        lblContent: {
            type: cc.Label,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._isShow = false;
    },

    start () {
        this.node.active = this._isShow;
    },

    update (dt) {
        if (this.loadimage_target) {
            this.loadimage_target.rotation = this.loadimage_target.rotation - dt * 45;
        }
    },

    //content为label显示的内容
    show(content){
        this._isShow = true;
        if(this.node){
            this.node.active = this._isShow;   
        }
        if(this.lblContent){
            if(content == null){
                content = "";
            }
            this.lblContent.string = content;
        }
    },

    hide(){
        this._isShow = false;
        if(this.node){
            this.node.active = this._isShow;   
        }
    }

});
