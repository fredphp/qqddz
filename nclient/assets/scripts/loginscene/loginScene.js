// 登录场景控制器
// 使用点击事件实现复选框功能（不依赖 Toggle 组件）

cc.Class({
    name: 'loginScene',
    extends: cc.Component,

    properties: {
        wait_node: {
            type: cc.Node,
            default: null
        },
        user_agreement_prefabs: {
            type: cc.Prefab,
            default: null
        },
        phone_login_prefab: {
            type: cc.Prefab,
            default: null
        }
    },

    onLoad () {
        console.log("loginScene onLoad 开始");

        this._isAgreementChecked = false;
        this._initWaitNode();
        
        // 初始化复选框（使用点击事件）
        this._initCheckbox();
        
        // 初始化登录按钮
        this._initLoginButtons();
        
        // 初始化用户协议链接点击事件
        this._initUserAgreementLink();

        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }

        this._initAndStart();
    },

    _initWaitNode: function() {
        if (this.wait_node) {
            this._loadingImage = this.wait_node.getChildByName("loading_image");
            var lblNode = this.wait_node.getChildByName("lblcontent_Label");
            if (lblNode) {
                this._waitLabel = lblNode.getComponent(cc.Label);
            }
            this.wait_node.active = false;
        }
    },

    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");
        
        var self = this;
        
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        
        var checkmark = checkMarkNode.getChildByName("checkmark");
        if (checkmark) {
            this._checkmarkIcon = checkmark;
            checkmark.active = false;
        }
        
        this._isAgreementChecked = false;
        
        var button = checkMarkNode.getComponent(cc.Button);
        if (button) {
            button.enabled = false;
        }
        
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            self._toggleCheckbox();
        }, self);
    },

    _toggleCheckbox: function() {
        this._isAgreementChecked = !this._isAgreementChecked;
        if (this._checkmarkIcon) {
            this._checkmarkIcon.active = this._isAgreementChecked;
        }
    },

    start () {
        console.log("loginScene start");
    },

    _initLoginButtons: function() {
        var self = this;

        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            var button = wxLoginNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onWxLoginClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }

        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            var button = phoneLoginNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onPhoneLoginClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }
    },

    _initUserAgreementLink: function() {
        var self = this;
        
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            linkNode.active = true;

            var button = linkNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onUserAgreementLinkClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }
    },

    _onWxLoginClick: function() {
        this._doWxLogin();
    },

    _onPhoneLoginClick: function() {
        this._doPhoneLogin();
    },

    _onUserAgreementLinkClick: function() {
        this._showUserAgreementPopup();
    },

    _checkAgreement: function() {
        return this._isAgreementChecked;
    },

    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;

        var check = function() {
            attempts++;
            if (typeof window.myglobal !== 'undefined') {
                self._initAndStart();
            } else if (attempts < 20) {
                setTimeout(check, 100);
            } else {
                self._showError("加载失败，请刷新页面重试");
            }
        };
        setTimeout(check, 100);
    },

    _initAndStart: function() {
        var myglobal = window.myglobal;

        if (!myglobal.socket && !myglobal.init()) {
            this._showError("初始化失败，请刷新页面重试");
            return;
        }

        if (window.isopen_sound) {
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err) {
                    try { cc.audioEngine.playMusic(clip, true); } catch(e) {}
                }
            });
        }

        if (myglobal.socket && myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }
    },

    _showError: function(message) {
        this._showWaitNode(message);
        this.scheduleOnce(function() {
            this._hideWaitNode();
        }, 2);
    },

    _showLoading: function(show, message) {
        if (show) {
            this._showWaitNode(message || "正在处理...");
        } else {
            this._hideWaitNode();
        }
    },

    _showWaitNode: function(message) {
        if (this.wait_node) {
            this.wait_node.active = true;
            if (this._waitLabel) {
                this._waitLabel.string = message || "正在处理...";
            }
            if (this._loadingImage) {
                this._isAnimating = true;
            }
        }
    },

    _hideWaitNode: function() {
        if (this.wait_node) {
            this.wait_node.active = false;
            this._isAnimating = false;
        }
    },

    update: function(dt) {
        if (this._isAnimating && this._loadingImage) {
            this._loadingImage.rotation -= dt * 45;
        }
    },

    _doWxLogin: function() {
        var self = this;

        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }

        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            this._showError("网络未连接，请稍后重试");
            return;
        }

        this._showLoading(true, "正在登录...");

        myglobal.socket.request_wxLogin({
            uniqueID: myglobal.playerData.uniqueID,
            accountID: myglobal.playerData.accountID,
            nickName: myglobal.playerData.nickName,
            avatarUrl: myglobal.playerData.avatarUrl,
        }, function(err, result) {
            self._showLoading(false);

            if (err != 0) {
                self._showError("登录失败，请重试");
                return;
            }

            myglobal.playerData.gobal_count = result.goldcount || 0;
            cc.director.loadScene("hallScene");
        });
    },

    _doPhoneLogin: function() {
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }
        this._showPhoneLoginPopup();
    },

    _showPhoneLoginPopup: function() {
        var self = this;
        
        if (this.phone_login_prefab) {
            this._createPhoneLoginPopup(this.phone_login_prefab);
        } else {
            cc.resources.load("prefabs/phone_login", cc.Prefab, function(err, prefab) {
                if (err) {
                    self._showError("无法显示登录弹窗");
                    return;
                }
                self._createPhoneLoginPopup(prefab);
            });
        }
    },

    _createPhoneLoginPopup: function(prefab) {
        try {
            var popup = cc.instantiate(prefab);
            popup.parent = this.node;
            
            popup.on("wx-login-request", function() {
                this._doWxLogin();
            }, this);
            
            this._phoneLoginPopup = popup;
        } catch (e) {
            this._showError("无法显示登录弹窗");
        }
    },

    _showUserAgreementPopup: function() {
        console.log("=== 显示用户协议弹窗 ===");
        this._createAgreementPopup();
    },

    // 创建用户协议弹窗
    _createAgreementPopup: function() {
        var self = this;
        
        // ==================== 弹窗根节点 ====================
        var popup = new cc.Node("user_agreement_popup");
        popup.parent = this.node;
        popup.setContentSize(cc.size(1280, 720));
        popup.setPosition(0, 0);
        popup.zIndex = 1000;
        
        // ==================== 半透明黑色背景遮罩 ====================
        // ★ 不添加任何触摸事件，让它穿透
        var bgMask = new cc.Node("bg_mask");
        bgMask.parent = popup;
        bgMask.setContentSize(cc.size(1280, 720));
        bgMask.setPosition(0, 0);
        var bgMaskSprite = bgMask.addComponent(cc.Sprite);
        bgMaskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgMask.color = new cc.Color(0, 0, 0);
        bgMask.opacity = 180;
        
        // ==================== 主面板（带背景图）====================
        var panel = new cc.Node("content_panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(900, 520));
        panel.setPosition(0, 0);
        var panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = new cc.Color(255, 250, 240);
        
        // ★ 加载背景图片
        cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                panelSprite.spriteFrame = spriteFrame;
            }
        });

        // ==================== 标题（黑色文字）====================
        var titleNode = new cc.Node("title_label");
        titleNode.parent = panel;
        titleNode.setContentSize(cc.size(300, 60));
        titleNode.setPosition(0, 230);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "用户协议";
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 60;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(30, 30, 30);

        // ==================== 右上角关闭按钮 ====================
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(60, 60));
        closeBtn.setPosition(400, 230);
        
        // 关闭按钮背景
        var closeBtnBg = new cc.Node("bg");
        closeBtnBg.parent = closeBtn;
        closeBtnBg.setContentSize(cc.size(50, 50));
        closeBtnBg.setPosition(0, 0);
        var closeBgSprite = closeBtnBg.addComponent(cc.Sprite);
        closeBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        closeBtnBg.color = new cc.Color(255, 255, 255);
        
        // 关闭按钮 X
        var closeLabelNode = new cc.Node("x");
        closeLabelNode.parent = closeBtn;
        closeLabelNode.setPosition(0, 0);
        var closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 40;
        closeLabel.lineHeight = 50;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeLabelNode.color = new cc.Color(80, 80, 80);
        
        // ★ 使用 Button 组件 + EventHandler 方式绑定点击事件
        var closeBtnComp = closeBtn.addComponent(cc.Button);
        closeBtnComp.transition = cc.Button.Transition.SCALE;
        closeBtnComp.zoomScale = 1.2;
        closeBtnComp.interactable = true;
        
        // ★ 使用 cc.Component.EventHandler 绑定事件
        var closeHandler = new cc.Component.EventHandler();
        closeHandler.target = this.node;
        closeHandler.component = "loginScene";
        closeHandler.handler = "_closeUserAgreementPopup";
        closeHandler.customEventData = "";
        closeBtnComp.clickEvents.push(closeHandler);

        // ==================== 分隔线 ====================
        var dividerLine = new cc.Node("divider");
        dividerLine.parent = panel;
        dividerLine.setContentSize(cc.size(850, 1));
        dividerLine.setPosition(0, 195);
        var dividerSprite = dividerLine.addComponent(cc.Sprite);
        dividerSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        dividerLine.color = new cc.Color(220, 220, 220);

        // ==================== 内容滚动区域 ====================
        var contentContainer = new cc.Node("content_container");
        contentContainer.parent = panel;
        contentContainer.setContentSize(cc.size(850, 400));
        contentContainer.setPosition(0, -10);
        var containerSprite = contentContainer.addComponent(cc.Sprite);
        containerSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        contentContainer.color = new cc.Color(255, 255, 255);
        
        // ★ 先创建节点层级，最后添加 ScrollView 组件
        
        // 1. 创建 ScrollView 节点
        var scrollNode = new cc.Node("scroll_view");
        scrollNode.parent = contentContainer;
        scrollNode.setContentSize(cc.size(830, 380));
        scrollNode.setPosition(0, 0);
        
        // 2. 创建 view 节点
        var viewNode = new cc.Node("view");
        viewNode.parent = scrollNode;
        viewNode.setContentSize(cc.size(830, 380));
        viewNode.setPosition(0, 0);
        
        // 3. 添加 Mask 组件到 view
        var mask = viewNode.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        
        // 4. 创建 content 节点
        var contentNode = new cc.Node("content");
        contentNode.parent = viewNode;
        contentNode.setContentSize(cc.size(810, 380));
        contentNode.setPosition(0, 190);
        contentNode.anchorY = 1;
        
        // 5. 创建 Label
        var labelNode = new cc.Node("content_label");
        labelNode.parent = contentNode;
        labelNode.setPosition(0, -15);
        labelNode.anchorY = 1;
        
        var contentLabel = labelNode.addComponent(cc.Label);
        contentLabel.string = "正在加载用户协议...";
        contentLabel.fontSize = 22;
        contentLabel.lineHeight = 36;
        contentLabel.overflow = cc.Label.Overflow.NONE;
        contentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        contentLabel.wrapWidth = 790;
        labelNode.color = new cc.Color(50, 50, 50);
        
        // 6. ★ 最后添加 ScrollView 组件
        var scrollView = scrollNode.addComponent(cc.ScrollView);
        scrollView.content = contentNode;
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;       // ★ 惯性滚动
        scrollView.elastic = true;
        scrollView.brake = 0.1;          // ★ 刹车系数越小，惯性越大
        scrollView.scrollToTop(0);
        
        // ★ 7. 添加鼠标滚轮滚动支持
        scrollNode.on(cc.Node.EventType.MOUSE_WHEEL, function(event) {
            var scrollY = event.getScrollY();  // 获取滚轮滚动量
            var currentOffset = scrollView.getScrollOffset();
            
            // 计算新的滚动位置
            var scrollSpeed = 0.5;  // 滚动速度系数，可调整
            var newOffsetY = currentOffset.y + scrollY * scrollSpeed;
            
            // 获取最大滚动范围
            var maxOffset = scrollView.getMaxScrollOffset();
            
            // 限制滚动范围
            newOffsetY = Math.max(0, Math.min(newOffsetY, maxOffset.y));
            
            // 平滑滚动到新位置
            scrollView.scrollToOffset(cc.v2(currentOffset.x, newOffsetY), 0.15);
        }, self);
        
        // 保存引用
        this._agreementContentLabel = contentLabel;
        this._scrollView = scrollView;
        this._contentNode = contentNode;
        this._scrollNode = scrollNode;   // ★ 保存 scrollNode 引用
        this._userAgreementPopup = popup;
        
        // 获取协议内容
        this._fetchAgreementContent();
        
        console.log("=== 弹窗创建完成 ===");
    },

    // ★ 关闭用户协议弹窗（公开方法，供 Button EventHandler 调用）
    _closeUserAgreementPopup: function() {
        console.log("=== _closeUserAgreementPopup 被调用 ===");
        
        if (this._userAgreementPopup) {
            // ★ 移除滚轮事件监听
            if (this._scrollNode) {
                this._scrollNode.off(cc.Node.EventType.MOUSE_WHEEL);
            }
            
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
            this._agreementContentLabel = null;
            this._scrollView = null;
            this._contentNode = null;
            this._scrollNode = null;
            console.log("=== 弹窗已关闭 ===");
        }
    },

    // 从 API 获取协议内容
    _fetchAgreementContent: function() {
        var self = this;
        var defines = window.defines;
        
        if (!defines || !defines.apiUrl) {
            self._showDefaultAgreementContent();
            return;
        }
        
        var apiUrl = defines.apiUrl + '/api/v1/user-agreement/latest';
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.timeout = 10000;
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response && response.code === 0 && response.data && response.data.content) {
                        self._updateAgreementContent(response.data.content);
                    } else {
                        self._showDefaultAgreementContent();
                    }
                } catch (e) {
                    self._showDefaultAgreementContent();
                }
            } else {
                self._showDefaultAgreementContent();
            }
        };
        
        xhr.onerror = function() {
            self._showDefaultAgreementContent();
        };
        
        xhr.ontimeout = function() {
            self._showDefaultAgreementContent();
        };
        
        xhr.send();
    },

    // 更新协议内容
    _updateAgreementContent: function(content) {
        if (!this._agreementContentLabel) return;

        if (content) {
            this._agreementContentLabel.string = content;
            this._updateContentSize();
        }
    },

    // 更新 ScrollView 的 content 尺寸
    _updateContentSize: function() {
        if (!this._agreementContentLabel || !this._contentNode) return;
        
        var label = this._agreementContentLabel;
        var lineHeight = label.lineHeight || 36;
        var fontSize = label.fontSize || 22;
        var wrapWidth = label.wrapWidth || 790;
        
        var text = label.string || "";
        var charWidth = fontSize * 0.55;
        var charsPerLine = Math.floor(wrapWidth / charWidth);
        var lines = Math.ceil(text.length / charsPerLine);
        
        var actualHeight = lines * lineHeight + 50;
        var minHeight = 380;
        var newHeight = Math.max(actualHeight, minHeight);
        
        this._contentNode.setContentSize(cc.size(810, newHeight));
        
        if (this._scrollView) {
            this._scrollView.scrollToTop(0.1);
        }
    },

    // 显示默认协议内容
    _showDefaultAgreementContent: function() {
        if (this._agreementContentLabel) {
            var defaultContent = 
                "欢迎使用本游戏！\n\n" +
                "在使用本游戏前，请您仔细阅读并理解本用户协议的全部内容。\n\n" +
                "【服务条款】\n" +
                "本游戏提供的服务仅供个人娱乐使用，不得用于商业目的。\n\n" +
                "【用户行为规范】\n" +
                "用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n" +
                "【知识产权】\n" +
                "本游戏的所有内容（包括但不限于文字、图片、音频、视频等）均受知识产权法律保护。\n\n" +
                "【免责声明】\n" +
                "本游戏不对因网络原因导致的服务中断承担责任。";

            this._agreementContentLabel.string = defaultContent;
            this._updateContentSize();
        }
    }
});
