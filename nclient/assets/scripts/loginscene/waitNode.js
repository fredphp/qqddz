// 等待节点控制器
// 用于显示加载状态和旋转动画

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

    onLoad: function() {
        this._isAnimating = false;
    },

    start: function() {
        // 初始化
    },

    // 显示加载动画
    showLoading: function(message) {
        this.node.active = true;
        if (this.lblContent && message) {
            this.lblContent.string = message;
        }
        this._isAnimating = true;
    },

    // 隐藏加载动画
    hideLoading: function() {
        this.node.active = false;
        this._isAnimating = false;
    },

    // 设置消息
    setMessage: function(message) {
        if (this.lblContent) {
            this.lblContent.string = message || "";
        }
    },

    update: function(dt) {
        // 旋转加载图片
        if (this._isAnimating && this.loadimage_target) {
            this.loadimage_target.rotation -= dt * 45;
        }
    }
});
