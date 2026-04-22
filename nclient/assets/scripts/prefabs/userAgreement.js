/**
 * 用户协议弹窗预制体脚本
 * 显示用户协议内容，支持从服务器获取加密数据并解密显示
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 标题标签
        titleLabel: {
            type: cc.Label,
            default: null
        },
        
        // 内容标签
        contentLabel: {
            type: cc.Label,
            default: null
        },
        
        // 版本标签
        versionLabel: {
            type: cc.Label,
            default: null
        },
        
        // 加载提示节点
        loadingNode: {
            type: cc.Node,
            default: null
        },
        
        // 内容滚动视图
        scrollView: {
            type: cc.ScrollView,
            default: null
        },
        
        // 关闭按钮
        closeBtn: {
            type: cc.Node,
            default: null
        },
        
        // 同意按钮
        agreeBtn: {
            type: cc.Node,
            default: null
        }
    },

    // 是否同意
    _isAgreed: false,
    
    // 节点是否有效
    _isValid: true,
    
    // 回调函数
    _agreeCallback: null,

    onLoad: function() {
        this._isValid = true;
        this._isAgreed = false;
        this._agreeCallback = null;
        
        // 绑定按钮事件
        this.bindEvents();
        
        // 获取用户协议
        this.fetchUserAgreement();
    },

    onDestroy: function() {
        this._isValid = false;
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        var self = this;
        
        // 关闭按钮
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onCloseClick();
            }, this);
        }
        
        // 同意按钮
        if (this.agreeBtn) {
            this.agreeBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onAgreeClick();
            }, this);
        }
    },

    /**
     * 设置同意回调
     * @param {Function} callback - 回调函数
     */
    setAgreeCallback: function(callback) {
        this._agreeCallback = callback;
    },

    /**
     * 获取用户协议数据
     */
    fetchUserAgreement: function() {
        var self = this;
        var GameConfig = window.GameConfig;
        var HttpAPI = window.HttpAPI;
        
        if (!HttpAPI) {
            cc.error('[UserAgreement] HttpAPI 未加载');
            this.showError('加载失败');
            return;
        }
        
        // 显示加载中
        this.showLoading(true);
        
        // 获取API配置
        var apiUrl = GameConfig ? GameConfig.SERVER.HTTP_URL : 'http://localhost:3000';
        var cryptoKey = '';
        
        // 获取用户协议
        HttpAPI.getUserAgreement(
            apiUrl,
            cryptoKey,
            function(err, data) {
                if (!self._isValid || !self.node) {
                    return;
                }
                
                self.showLoading(false);
                
                if (err) {
                    cc.error('[UserAgreement] 获取用户协议失败:', err);
                    self.showError('加载失败，请稍后重试');
                    return;
                }
                
                if (data) {
                    self.updateContent(data);
                } else {
                    self.showError('暂无用户协议');
                }
            }
        );
    },

    /**
     * 更新内容显示
     * @param {Object} data - 协议数据
     */
    updateContent: function(data) {
        if (!this._isValid || !this.node) return;
        
        if (this.titleLabel && data.title) {
            this.titleLabel.string = data.title;
        }
        
        if (this.contentLabel && data.content) {
            this.contentLabel.string = data.content;
            // 重置滚动位置
            if (this.scrollView) {
                this.scrollView.scrollToTop(0);
            }
        }
        
        if (this.versionLabel && data.version) {
            this.versionLabel.string = '版本: ' + data.version;
        }
    },

    /**
     * 显示加载状态
     * @param {boolean} show - 是否显示
     */
    showLoading: function(show) {
        if (!this._isValid || !this.node) return;
        
        if (this.loadingNode) {
            this.loadingNode.active = show;
        }
        if (this.scrollView) {
            this.scrollView.node.active = !show;
        }
    },

    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError: function(message) {
        if (!this._isValid || !this.node) return;
        
        this.showLoading(false);
        if (this.contentLabel) {
            this.contentLabel.string = message;
        }
        if (this.scrollView) {
            this.scrollView.node.active = true;
        }
    },

    /**
     * 关闭按钮点击
     */
    onCloseClick: function() {
        cc.log('[UserAgreement] 关闭按钮点击');
        
        this._isValid = false;
        this.node.destroy();
    },

    /**
     * 同意按钮点击
     */
    onAgreeClick: function() {
        cc.log('[UserAgreement] 同意按钮点击');
        
        this._isAgreed = true;
        
        // 保存同意状态
        if (typeof myglobal !== 'undefined') {
            myglobal.setLocalData(GameConfig.STORAGE_KEYS.AGREEMENT_ACCEPTED, true);
        }
        
        // 执行回调
        if (this._agreeCallback) {
            this._agreeCallback(true);
        }
        
        // 关闭弹窗
        this._isValid = false;
        this.node.destroy();
    },

    /**
     * 按钮点击事件
     */
    onButtonClick: function(event, customData) {
        if (!this._isValid || !this.node) {
            return;
        }
        
        switch (customData) {
            case 'close':
                this.onCloseClick();
                break;
            case 'agree':
                this.onAgreeClick();
                break;
            default:
                break;
        }
    }
});
