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
        // 标记节点是否有效
        this._isValid = true;
        
        // 添加鼠标滚轮支持
        this._setupMouseWheel();
        
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

    onDestroy() {
        // 标记节点已销毁
        this._isValid = false;
    },

    start() {
        // 空实现
    },
    
    // 设置鼠标滚轮支持
    _setupMouseWheel: function() {
        var self = this;
        if (this.scroll_view && this.scroll_view.node) {
            this.scroll_view.node.on(cc.Node.EventType.MOUSE_WHEEL, function(event) {
                var scrollY = event.getScrollY();
                var scrollView = self.scroll_view;
                if (scrollView) {
                    var currentOffset = scrollView.getScrollOffset();
                    var newOffsetY = currentOffset.y + scrollY * 0.5;
                    scrollView.scrollToOffset(cc.v2(currentOffset.x, newOffsetY), 0.1);
                }
            }, this);
        }
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
                // 检查节点是否仍然有效
                if (!self._isValid || !self.node) {
                    console.log("节点已销毁，跳过更新");
                    return;
                }
                
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
        if (!this._isValid || !this.node) return;
        
        if (this.title_label && data.title) {
            this.title_label.string = data.title;
        }
        
        if (this.content_label && data.content) {
            // 设置内容文本
            this.content_label.string = data.content;
            
            // 设置左对齐
            this.content_label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            
            // 确保自动换行
            this.content_label.enableWrapText = true;
            this.content_label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this.content_label.wrapWidth = 680;  // 调整宽度以增加左右边距
            
            // 确保文字颜色为黑色
            this.content_label.node.color = cc.color(0, 0, 0, 255);
            
            // 获取 content 节点
            var contentNode = this.content_label.node;
            if (contentNode) {
                // 设置锚点为左上角
                contentNode.anchorX = 0.5;
                contentNode.anchorY = 1;
                
                // 延迟更新 content 高度
                var self = this;
                this.scheduleOnce(function() {
                    self._updateContentSize();
                }, 0.1);
            }
        }
        
        if (this.version_label && data.version) {
            this.version_label.string = "版本: " + data.version;
        }
    },
    
    // 更新 content 容器高度
    _updateContentSize: function() {
        if (!this._isValid || !this.node) return;
        
        if (this.content_label && this.scroll_view) {
            var contentNode = this.content_label.node;
            var labelHeight = contentNode.height;
            
            // 确保 content 高度至少大于视口高度
            var minHeight = 400;
            var newHeight = Math.max(labelHeight + 60, minHeight);  // 增加底部空间
            
            contentNode.height = newHeight;
            
            // 重置滚动位置到顶部
            this.scroll_view.scrollToTop(0);
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

    // 显示错误信息
    _showError: function(message) {
        if (!this._isValid || !this.node) return;
        
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
            default:
                break;
        }
    }
});
