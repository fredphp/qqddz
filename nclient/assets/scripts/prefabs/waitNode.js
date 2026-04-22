/**
 * 等待加载节点预制体脚本
 * 显示加载动画和提示文字
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 加载动画目标节点
        loadImageTarget: {
            type: cc.Node,
            default: null
        },
        
        // 提示文字标签
        contentLabel: {
            type: cc.Label,
            default: null
        },
        
        // 默认提示文字
        defaultText: {
            default: '加载中...',
            type: cc.String
        },
        
        // 旋转速度
        rotateSpeed: {
            default: 45,
            type: cc.Float
        }
    },

    // 是否显示
    _isShow: false,
    
    // 节点是否有效
    _isValid: true,

    onLoad: function() {
        this._isShow = false;
        this._isValid = true;
        
        // 初始隐藏
        this.node.active = false;
    },

    onDestroy: function() {
        this._isValid = false;
    },

    start: function() {
        if (this._isValid && this.node) {
            this.node.active = this._isShow;
        }
    },

    update: function(dt) {
        if (!this._isValid || !this.node) return;
        
        // 更新旋转动画
        if (this._isShow && this.loadImageTarget && this.loadImageTarget.isValid) {
            this.loadImageTarget.rotation = this.loadImageTarget.rotation - dt * this.rotateSpeed;
        }
    },

    /**
     * 显示等待节点
     * @param {string} content - 提示内容
     */
    show: function(content) {
        if (!this._isValid || !this.node) return;
        
        this._isShow = true;
        this.node.active = this._isShow;
        
        // 设置提示文字
        if (this.contentLabel && this.contentLabel.isValid) {
            if (content == null || content === '') {
                content = this.defaultText;
            }
            this.contentLabel.string = content;
        }
        
        cc.log('[WaitNode] 显示等待节点:', content);
    },

    /**
     * 隐藏等待节点
     */
    hide: function() {
        if (!this._isValid || !this.node) return;
        
        this._isShow = false;
        this.node.active = this._isShow;
        
        cc.log('[WaitNode] 隐藏等待节点');
    },

    /**
     * 更新提示文字
     * @param {string} content - 新的提示内容
     */
    updateContent: function(content) {
        if (!this._isValid || !this.node) return;
        
        if (this.contentLabel && this.contentLabel.isValid) {
            this.contentLabel.string = content || this.defaultText;
        }
    },

    /**
     * 检查是否显示中
     * @returns {boolean} 是否显示
     */
    isShowing: function() {
        return this._isShow;
    }
});
