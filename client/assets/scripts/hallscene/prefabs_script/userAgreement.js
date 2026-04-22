// 用户协议弹窗脚本

cc.Class({
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
        // 获取配置
        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            console.error("API配置未定义");
            this._showError("配置错误");
            return;
        }

        // 显示加载中
        this._showLoading(true);
        
        // 获取用户协议
        this._fetchUserAgreement();
    },

    start() {

    },

    // 获取用户协议数据
    _fetchUserAgreement: function() {
        var self = this;
        var defines = window.defines;
        var HttpAPI = window.HttpAPI;
        
        if (!HttpAPI) {
            console.error("HttpAPI未加载");
            self._showError("加载失败");
            return;
        }

        // 获取用户协议（带加密解密）
        HttpAPI.getUserAgreement(
            defines.apiUrl,
            defines.cryptoKey || '',
            function(err, data) {
                self._showLoading(false);
                
                if (err) {
                    console.error("获取用户协议失败:", err);
                    self._showError("加载失败，请稍后重试");
                    return;
                }
                
                if (data) {
                    self._updateContent(data);
                } else {
                    self._showError("暂无用户协议");
                }
            }
        );
    },

    // 更新内容显示
    _updateContent: function(data) {
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
        if (this.loading_node) {
            this.loading_node.active = show;
        }
        if (this.scroll_view) {
            this.scroll_view.node.active = !show;
        }
    },

    // 显示错误信息
    _showError: function(message) {
        this._showLoading(false);
        if (this.content_label) {
            this.content_label.string = message;
        }
        if (this.scroll_view) {
            this.scroll_view.node.active = true;
        }
    },

    // 按钮点击事件
    onButtonClick(event, customData) {
        switch (customData) {
            case "close":
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
