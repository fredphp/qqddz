// 分享工具类
// 兼容 Android、iOS 原生分享和 Web 分享

var ShareUtil = {
    // 分享类型
    SHARE_TYPE: {
        TEXT: 'text',           // 纯文本
        LINK: 'link',           // 链接
        IMAGE: 'image',         // 图片
        ALL: 'all'              // 全部
    },

    // 平台类型
    PLATFORM: {
        ANDROID: 'android',
        IOS: 'ios',
        WEB: 'web',
        WECHAT: 'wechat',       // 微信小游戏
        UNKNOWN: 'unknown'
    },

    // 获取当前平台
    getPlatform: function() {
        if (typeof cc === 'undefined') {
            return this.PLATFORM.WEB;
        }

        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return this.PLATFORM.ANDROID;
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                return this.PLATFORM.IOS;
            }
        }

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            return this.PLATFORM.WECHAT;
        }

        if (cc.sys.isBrowser) {
            return this.PLATFORM.WEB;
        }

        return this.PLATFORM.UNKNOWN;
    },

    // 检查是否支持分享
    canShare: function() {
        var platform = this.getPlatform();
        
        switch (platform) {
            case this.PLATFORM.ANDROID:
            case this.PLATFORM.IOS:
                // 原生平台通过 JSB 调用
                return typeof jsb !== 'undefined' || this._checkNativeShare();
            
            case this.PLATFORM.WEB:
                // Web 端检查 Web Share API
                return navigator && navigator.share;
            
            case this.PLATFORM.WECHAT:
                // 微信小游戏
                return typeof wx !== 'undefined' && wx.shareAppMessage;
            
            default:
                return false;
        }
    },

    // 检查原生分享是否可用
    _checkNativeShare: function() {
        if (typeof jsb !== 'undefined' && jsb.reflection) {
            return true;
        }
        
        // 检查是否有原生注入的分享方法
        if (typeof window !== 'undefined') {
            return typeof window.nativeShare === 'function' ||
                   typeof window.shareText === 'function' ||
                   typeof window.shareImage === 'function';
        }
        
        return false;
    },

    // ==================== 主要分享接口 ====================

    /**
     * 分享内容
     * @param {Object} options 分享选项
     * @param {string} options.title 分享标题
     * @param {string} options.text 分享文本
     * @param {string} options.url 分享链接
     * @param {string} options.imageUrl 图片URL（可选）
     * @param {Function} options.success 成功回调
     * @param {Function} options.fail 失败回调
     */
    share: function(options) {
        var self = this;
        options = options || {};
        
        var title = options.title || '欢乐斗地主';
        var text = options.text || '快来和我一起玩欢乐斗地主吧！';
        var url = options.url || this._getDefaultShareUrl();
        var imageUrl = options.imageUrl || '';
        var success = options.success || function() {};
        var fail = options.fail || function() {};

        var platform = this.getPlatform();
        console.log('[ShareUtil] 当前平台:', platform, '分享内容:', { title: title, text: text, url: url });

        switch (platform) {
            case this.PLATFORM.ANDROID:
                this._shareAndroid(title, text, url, imageUrl, success, fail);
                break;
            
            case this.PLATFORM.IOS:
                this._shareIOS(title, text, url, imageUrl, success, fail);
                break;
            
            case this.PLATFORM.WEB:
                this._shareWeb(title, text, url, success, fail);
                break;
            
            case this.PLATFORM.WECHAT:
                this._shareWechat(title, text, url, imageUrl, success, fail);
                break;
            
            default:
                // 降级方案：复制链接到剪贴板
                this._fallbackShare(url, success, fail);
        }
    },

    /**
     * 分享纯文本
     */
    shareText: function(text, success, fail) {
        this.share({
            title: '',
            text: text,
            url: '',
            success: success,
            fail: fail
        });
    },

    /**
     * 分享链接
     */
    shareLink: function(url, title, text, success, fail) {
        this.share({
            title: title || '分享链接',
            text: text || '',
            url: url,
            success: success,
            fail: fail
        });
    },

    /**
     * 分享图片
     */
    shareImage: function(imageUrl, title, text, success, fail) {
        this.share({
            title: title || '',
            text: text || '',
            url: '',
            imageUrl: imageUrl,
            success: success,
            fail: fail
        });
    },

    /**
     * 分享游戏房间
     */
    shareRoom: function(roomId, success, fail) {
        var shareUrl = this._getDefaultShareUrl() + '?room=' + roomId;
        var text = '快来加入我的斗地主房间！房间号：' + roomId;
        
        this.share({
            title: '欢乐斗地主 - 邀请加入房间',
            text: text,
            url: shareUrl,
            success: success,
            fail: fail
        });
    },

    // ==================== 平台特定实现 ====================

    // Android 分享
    _shareAndroid: function(title, text, url, imageUrl, success, fail) {
        console.log('[ShareUtil] Android 分享');
        
        try {
            // 方式1: 使用 jsb.reflection 调用原生方法
            if (typeof jsb !== 'undefined' && jsb.reflection) {
                var shareContent = JSON.stringify({
                    title: title,
                    text: text,
                    url: url,
                    imageUrl: imageUrl
                });
                
                // 调用 Android 原生分享
                // 需要在 Android 端实现相应的分享方法
                var result = jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    'shareContent',
                    '(Ljava/lang/String;)Z',
                    shareContent
                );
                
                if (result) {
                    success && success();
                } else {
                    fail && fail({ message: 'Android 分享失败' });
                }
                return;
            }
            
            // 方式2: 使用原生注入的方法
            if (typeof window.nativeShare === 'function') {
                window.nativeShare(title, text, url);
                success && success();
                return;
            }
            
            if (typeof window.shareText === 'function') {
                window.shareText(text);
                success && success();
                return;
            }
            
            // 降级：复制到剪贴板
            this._fallbackShare(url || text, success, fail);
            
        } catch (e) {
            console.error('[ShareUtil] Android 分享异常:', e);
            this._fallbackShare(url || text, success, fail);
        }
    },

    // iOS 分享
    _shareIOS: function(title, text, url, imageUrl, success, fail) {
        console.log('[ShareUtil] iOS 分享');
        
        try {
            // 方式1: 使用 jsb.reflection 调用原生方法
            if (typeof jsb !== 'undefined' && jsb.reflection) {
                var shareContent = JSON.stringify({
                    title: title,
                    text: text,
                    url: url,
                    imageUrl: imageUrl
                });
                
                // 调用 iOS 原生分享
                // 需要在 iOS 端实现相应的分享方法
                var result = jsb.reflection.callStaticMethod(
                    'AppController',
                    'shareContent:',
                    shareContent
                );
                
                if (result) {
                    success && success();
                } else {
                    fail && fail({ message: 'iOS 分享失败' });
                }
                return;
            }
            
            // 方式2: 使用原生注入的方法
            if (typeof window.nativeShare === 'function') {
                window.nativeShare(title, text, url);
                success && success();
                return;
            }
            
            // 降级：复制到剪贴板
            this._fallbackShare(url || text, success, fail);
            
        } catch (e) {
            console.error('[ShareUtil] iOS 分享异常:', e);
            this._fallbackShare(url || text, success, fail);
        }
    },

    // Web 分享 (使用 Web Share API)
    _shareWeb: function(title, text, url, success, fail) {
        console.log('[ShareUtil] Web 分享');
        
        var self = this;
        
        if (navigator && navigator.share) {
            var shareData = {
                title: title,
                text: text
            };
            
            if (url) {
                shareData.url = url;
            }
            
            navigator.share(shareData)
                .then(function() {
                    console.log('[ShareUtil] Web 分享成功');
                    success && success();
                })
                .catch(function(error) {
                    console.error('[ShareUtil] Web 分享失败:', error);
                    // 用户取消不算失败
                    if (error.name === 'AbortError') {
                        // 用户取消
                    } else {
                        self._fallbackShare(url || text, success, fail);
                    }
                });
        } else {
            // 不支持 Web Share API，使用降级方案
            this._fallbackShare(url || text, success, fail);
        }
    },

    // 微信小游戏分享
    _shareWechat: function(title, text, url, imageUrl, success, fail) {
        console.log('[ShareUtil] 微信小游戏分享');
        
        if (typeof wx === 'undefined' || !wx.shareAppMessage) {
            this._fallbackShare(url || text, success, fail);
            return;
        }
        
        wx.shareAppMessage({
            title: title,
            desc: text,
            link: url || '',
            imageUrl: imageUrl || '',
            success: function() {
                console.log('[ShareUtil] 微信分享成功');
                success && success();
            },
            fail: function(error) {
                console.error('[ShareUtil] 微信分享失败:', error);
                fail && fail(error);
            }
        });
    },

    // 降级方案：复制到剪贴板
    _fallbackShare: function(content, success, fail) {
        console.log('[ShareUtil] 降级方案：复制到剪贴板');
        
        var self = this;
        
        if (!content) {
            content = this._getDefaultShareUrl();
        }
        
        // 尝试复制到剪贴板
        this._copyToClipboard(content, function(copied) {
            if (copied) {
                // 显示提示
                self._showShareTip('分享链接已复制到剪贴板');
                success && success();
            } else {
                // 显示分享内容让用户手动复制
                self._showShareDialog(content, success, fail);
            }
        });
    },

    // 复制到剪贴板
    _copyToClipboard: function(text, callback) {
        var success = false;
        
        try {
            // 方式1: 使用现代 Clipboard API
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(function() {
                        callback && callback(true);
                    })
                    .catch(function() {
                        callback && callback(false);
                    });
                return;
            }
            
            // 方式2: 使用 execCommand (兼容性更好)
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            callback && callback(success);
            
        } catch (e) {
            console.error('[ShareUtil] 复制到剪贴板失败:', e);
            callback && callback(false);
        }
    },

    // 显示分享提示
    _showShareTip: function(message) {
        if (typeof cc !== 'undefined') {
            // 使用 Cocos 的方式显示提示
            console.log('[ShareUtil]', message);
            
            // 可以调用游戏内的 Toast 提示
            if (window.myglobal && window.myglobal.showToast) {
                window.myglobal.showToast(message);
            }
        } else {
            // Web 端使用 alert 或自定义提示
            alert(message);
        }
    },

    // 显示分享对话框（降级方案）
    _showShareDialog: function(content, success, fail) {
        if (typeof cc !== 'undefined' && cc.director) {
            // Cocos 环境：创建一个简单的分享对话框
            this._createShareDialog(content, success, fail);
        } else {
            // Web 环境：使用 prompt
            prompt('请复制以下分享内容:', content);
            success && success();
        }
    },

    // 创建分享对话框 (Cocos)
    _createShareDialog: function(content, success, fail) {
        var self = this;
        
        // 获取当前场景
        var scene = cc.director.getScene();
        if (!scene) {
            fail && fail({ message: '无法创建分享对话框' });
            return;
        }
        
        // 创建对话框容器
        var dialog = new cc.Node('ShareDialog');
        dialog.parent = scene;
        dialog.setContentSize(cc.winSize);
        dialog.setPosition(0, 0);
        dialog.zIndex = 9999;
        
        // 添加背景遮罩
        var mask = new cc.Node('Mask');
        mask.parent = dialog;
        mask.setContentSize(cc.winSize);
        mask.setPosition(0, 0);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        mask.color = cc.Color.BLACK;
        mask.opacity = 150;
        
        // 点击遮罩关闭
        mask.on(cc.Node.EventType.TOUCH_END, function() {
            dialog.destroy();
        });
        
        // 创建内容面板
        var panel = new cc.Node('Panel');
        panel.parent = dialog;
        panel.setContentSize(400, 300);
        panel.setPosition(0, 0);
        var panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = new cc.Color(255, 255, 255);
        
        // 标题
        var title = new cc.Node('Title');
        title.parent = panel;
        title.setPosition(0, 110);
        var titleLabel = title.addComponent(cc.Label);
        titleLabel.string = '分享';
        titleLabel.fontSize = 28;
        titleLabel.lineHeight = 35;
        
        // 分享内容
        var contentNode = new cc.Node('Content');
        contentNode.parent = panel;
        contentNode.setPosition(0, 20);
        contentNode.setContentSize(360, 120);
        var contentLabel = contentNode.addComponent(cc.Label);
        contentLabel.string = content;
        contentLabel.fontSize = 18;
        contentLabel.lineHeight = 25;
        contentLabel.overflow = cc.Label.Overflow.CLAMP;
        contentLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        // 复制按钮
        var copyBtn = new cc.Node('CopyBtn');
        copyBtn.parent = panel;
        copyBtn.setPosition(0, -80);
        copyBtn.setContentSize(200, 45);
        var copyBtnSprite = copyBtn.addComponent(cc.Sprite);
        copyBtnSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        copyBtn.color = new cc.Color(76, 175, 80);
        
        var copyLabel = copyBtn.addComponent(cc.Label);
        copyLabel.string = '复制链接';
        copyLabel.fontSize = 20;
        copyLabel.lineHeight = 45;
        
        copyBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self._copyToClipboard(content, function(copied) {
                if (copied) {
                    dialog.destroy();
                    self._showShareTip('链接已复制到剪贴板');
                    success && success();
                } else {
                    self._showShareTip('复制失败，请手动复制');
                }
            });
        });
        
        // 关闭按钮
        var closeBtn = new cc.Node('CloseBtn');
        closeBtn.parent = panel;
        closeBtn.setPosition(180, 110);
        closeBtn.setContentSize(30, 30);
        var closeLabel = closeBtn.addComponent(cc.Label);
        closeLabel.string = '×';
        closeLabel.fontSize = 30;
        
        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            dialog.destroy();
        });
    },

    // 获取默认分享链接
    _getDefaultShareUrl: function() {
        // 返回游戏的 H5 地址
        if (typeof window !== 'undefined' && window.location) {
            return window.location.origin + window.location.pathname;
        }
        return 'https://h5ss.hongxiu88.com/';
    },

    // 获取默认分享标题
    _getDefaultShareTitle: function() {
        return '欢乐斗地主';
    },

    // 获取默认分享文本
    _getDefaultShareText: function() {
        return '快来和我一起玩欢乐斗地主吧！精彩刺激的棋牌游戏等你来挑战！';
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.ShareUtil = ShareUtil;
}

// Cocos Creator 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShareUtil;
}
