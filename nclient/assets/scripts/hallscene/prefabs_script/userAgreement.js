// 用户协议弹窗脚本
// 功能：从 API 获取用户协议内容并显示，无论 API 成功失败都必须显示弹窗

cc.Class({
    name: 'userAgreement',
    extends: cc.Component,

    properties: {
        // 标题标签
        title_label: {
            type: cc.Label,
            default: null
        },
        // 内容标签
        content_label: {
            type: cc.Label,
            default: null
        },
        // 版本标签
        version_label: {
            type: cc.Label,
            default: null
        },
        // 加载提示节点
        loading_node: {
            type: cc.Node,
            default: null
        },
        // 内容滚动视图
        scroll_view: {
            type: cc.ScrollView,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 标记节点是否有效
        this._isValid = true;
        
        // 默认协议内容（API 失败时显示）
        this._defaultContent = "协议加载失败，请稍后重试。\n\n请检查网络连接后重新点击查看用户协议。";
        this._defaultTitle = "用户协议";
        this._defaultVersion = "";
        
        // 初始化弹窗（先显示默认内容）
        this._initPopup();
        
        // 调用 API 获取用户协议
        this._fetchUserAgreement();
    },

    // 初始化弹窗 - 显示加载中状态
    _initPopup: function() {
        if (this.title_label) {
            this.title_label.string = this._defaultTitle;
        }
        
        if (this.content_label) {
            this.content_label.string = "正在加载...";
        }
        
        if (this.version_label) {
            this.version_label.string = "";
        }
        
        this._showLoading(true);
    },

    onDestroy() {
        // 标记节点已销毁
        this._isValid = false;
    },

    start() {
        // 空实现
    },

    // 获取用户协议数据
    _fetchUserAgreement: function() {
        var self = this;
        var defines = window.defines;
        var HttpAPI = window.HttpAPI;
        
        // 检查配置
        if (!defines || !defines.apiUrl) {
            console.warn("API配置未定义，使用默认内容");
            self._showDefaultContent();
            return;
        }

        if (!HttpAPI) {
            console.warn("HttpAPI未加载，使用默认内容");
            self._showDefaultContent();
            return;
        }

        // 获取用户协议（带加密解密）
        HttpAPI.getUserAgreement(
            defines.apiUrl,
            defines.cryptoKey || '',
            function(err, data) {
                // 检查节点是否仍然有效
                if (!self._isValid || !self.node) {
                    console.log("节点已销毁，跳过更新");
                    return;
                }
                
                self._showLoading(false);
                
                if (err) {
                    console.warn("获取用户协议失败:", err);
                    // API 失败时显示默认内容（弹窗必须显示）
                    self._showDefaultContent();
                    return;
                }
                
                if (data) {
                    self._updateContent(data);
                } else {
                    // 无数据时显示默认内容
                    self._showDefaultContent();
                }
            }
        );
    },

    // 显示默认内容（API 失败时）
    _showDefaultContent: function() {
        if (!this._isValid || !this.node) return;
        
        if (this.title_label) {
            this.title_label.string = this._defaultTitle;
        }
        
        if (this.content_label) {
            this.content_label.string = this._defaultContent;
            // 重置滚动位置
            if (this.scroll_view) {
                this.scroll_view.scrollToTop(0);
            }
        }
        
        if (this.version_label) {
            this.version_label.string = "";
        }
        
        this._showLoading(false);
        if (this.scroll_view) {
            this.scroll_view.node.active = true;
        }
    },

    // 更新内容显示
    _updateContent: function(data) {
        if (!this._isValid || !this.node) return;
        
        if (this.title_label && data.title) {
            this.title_label.string = data.title;
        }
        
        if (this.content_label && data.content) {
            this.content_label.string = data.content;
            // 重置滚动位置
            if (this.scroll_view) {
                this.scroll_view.scrollToTop(0);
            }
        }
        
        if (this.version_label && data.version) {
            this.version_label.string = "版本: " + data.version;
        }
    },

    // 显示加载状态
    _showLoading: function(show) {
        if (!this._isValid || !this.node) return;
        
        if (this.loading_node) {
            this.loading_node.active = show;
        }
        if (this.scroll_view) {
            this.scroll_view.node.active = !show;
        }
    },

    // 显示错误信息（仍然显示弹窗）
    _showError: function(message) {
        if (!this._isValid || !this.node) return;
        
        this._showLoading(false);
        if (this.content_label) {
            this.content_label.string = message || this._defaultContent;
        }
        if (this.scroll_view) {
            this.scroll_view.node.active = true;
        }
    },

    // 按钮点击事件
    onButtonClick(event, customData) {
        if (!this._isValid || !this.node) {
            console.log("节点已销毁，忽略点击");
            return;
        }
        
        switch (customData) {
            case "close":
                // 安全销毁节点
                this._isValid = false;
                this.node.destroy();
                break;
            case "confirm":
                // "我知道了"按钮
                this._isValid = false;
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
