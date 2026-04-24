
cc.Class({
    name: 'waitnode',
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
        this._isValid = true;
    },
    
    onDestroy () {
        this._isValid = false;
    },

    start () {
        if (this._isValid && this.node) {
            this.node.active = this._isShow;
        }
    },

    update (dt) {
        if (!this._isValid || !this.node) return;
        
        if (this.loadimage_target && this.loadimage_target.isValid) {
            this.loadimage_target.rotation = this.loadimage_target.rotation - dt * 45;
        }
    },

    //content为label显示的内容
    show(content){
        if (!this._isValid || !this.node) return;
        
        this._isShow = true;
        this.node.active = this._isShow;   
        
        if (this.lblContent && this.lblContent.isValid) {
            if (content == null) {
                content = "";
            }
            this.lblContent.string = content;
        }
    },

    hide(){
        if (!this._isValid || !this.node) return;
        
        this._isShow = false;
        this.node.active = this._isShow;   
    }

});
