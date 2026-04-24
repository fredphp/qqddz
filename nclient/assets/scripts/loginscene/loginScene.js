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

    // 初始化复选框 - 使用点击事件直接实现
    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");
        
        var self = this;
        
        // 获取 check_mark 节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        
        // 获取 checkmark 子节点（勾选图标）
        var checkmark = checkMarkNode.getChildByName("checkmark");
        if (checkmark) {
            this._checkmarkIcon = checkmark;
            checkmark.active = false; // 默认未选中
            console.log("checkmark 子节点找到，默认隐藏");
        } else {
            console.warn("checkmark 子节点未找到");
        }
        
        // 默认未选中
        this._isAgreementChecked = false;
        
        // 移除之前的按钮组件（如果存在），避免冲突
        var button = checkMarkNode.getComponent(cc.Button);
        if (button) {
            button.enabled = false;
            console.log("禁用 Button 组件");
        }
        
        // 直接使用触摸事件实现复选框
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            console.log(">>> 复选框被点击");
            self._toggleCheckbox();
        }, this);
        
        console.log("=== 复选框初始化完成 ===");
    },

    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isAgreementChecked = !this._isAgreementChecked;
        console.log("复选框状态:", this._isAgreementChecked ? "已选中" : "未选中");
        
        // 更新 checkmark 图标的显示状态
        if (this._checkmarkIcon) {
            this._checkmarkIcon.active = this._isAgreementChecked;
        }
    },

    start () {
        console.log("loginScene start");
    },

    _initLoginButtons: function() {
        console.log("=== _initLoginButtons 开始 ===");

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
            
            // 备选方案：触摸事件
            var self = this;
            phoneLoginNode.off(cc.Node.EventType.TOUCH_END);
            phoneLoginNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                self._onPhoneLoginClick();
            }, this);
        }

        console.log("=== _initLoginButtons 结束 ===");
    },

    // 初始化用户协议链接点击事件
    _initUserAgreementLink: function() {
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
                
                console.log("用户协议链接事件已绑定");
            }
            
            // 备选方案：触摸事件
            var self = this;
            linkNode.off(cc.Node.EventType.TOUCH_END);
            linkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log(">>> 用户协议链接被点击");
                self._onUserAgreementLinkClick();
            }, this);
        }
    },

    _onWxLoginClick: function() {
        console.log(">>> 微信登录按钮点击");
        this._doWxLogin();
    },

    _onPhoneLoginClick: function() {
        console.log(">>> 手机登录按钮点击");
        this._doPhoneLogin();
    },

    // 点击"用户协议"链接 - 弹出协议弹窗
    _onUserAgreementLinkClick: function() {
        console.log(">>> 用户协议链接点击");
        this._showUserAgreementPopup();
    },

    // 检查是否同意协议
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
        console.error("错误:", message);
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
        console.log(">>> _doPhoneLogin 开始");
        
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
                    console.error("加载手机号登录弹窗失败:", err);
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
            console.error("创建手机号登录弹窗失败:", e);
            this._showError("无法显示登录弹窗");
        }
    },

    // 显示用户协议弹窗 - 使用动态创建，不依赖 prefab
    _showUserAgreementPopup: function() {
        console.log("=== 显示用户协议弹窗 ===");
        this._createDynamicAgreementPopup();
    },

    // 动态创建用户协议弹窗（不使用 prefab）
    _createDynamicAgreementPopup: function() {
        try {
            var self = this;
            
            // 创建弹窗根节点
            var popup = new cc.Node("user_agreement_popup");
            popup.parent = this.node;
            popup.setContentSize(cc.size(1280, 720));
            popup.setPosition(0, 0);
            popup.zIndex = 1000;
            
            // 添加阻挡事件组件
            popup.addComponent(cc.BlockInputEvents);
            
            // 创建半透明背景遮罩
            var bgMask = new cc.Node("bg_mask");
            bgMask.parent = popup;
            bgMask.setContentSize(cc.size(1280, 720));
            bgMask.setPosition(0, 0);
            bgMask.color = new cc.Color(0, 0, 0);
            bgMask.opacity = 150;
            bgMask.addComponent(cc.Sprite);
            
            // 创建内容面板（必须先创建，才能加载背景图片）
            var panel = new cc.Node("content_panel");
            panel.parent = popup;
            panel.setContentSize(cc.size(900, 520));
            panel.setPosition(0, 0);
            var panelSprite = panel.addComponent(cc.Sprite);
            panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            panel.color = new cc.Color(255, 255, 255);
            
            // 加载背景图片（panel 创建后才能加载）
            this._loadPopupBackground(popup);
            
            // 创建标题
            var titleNode = new cc.Node("title_label");
            titleNode.parent = panel;
            titleNode.setContentSize(cc.size(300, 50));
            titleNode.setPosition(0, 220);
            var titleLabel = titleNode.addComponent(cc.Label);
            titleLabel.string = "用户协议";
            titleLabel.fontSize = 32;
            titleLabel.lineHeight = 50;
            titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            titleNode.color = new cc.Color(50, 50, 50);
            
            // 创建滚动视图容器
            var scrollContainer = new cc.Node("scroll_container");
            scrollContainer.parent = panel;
            scrollContainer.setContentSize(cc.size(850, 340));
            scrollContainer.setPosition(0, -10);
            
            // 创建内容标签
            var contentNode = new cc.Node("content_label");
            contentNode.parent = scrollContainer;
            contentNode.setContentSize(cc.size(850, 1000));
            contentNode.setPosition(0, 180);
            contentNode.anchorY = 1;
            var contentLabel = contentNode.addComponent(cc.Label);
            contentLabel.string = "正在加载用户协议...";
            contentLabel.fontSize = 18;
            contentLabel.lineHeight = 28;
            contentLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            contentLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            contentNode.color = new cc.Color(60, 60, 60);
            
            // 创建关闭按钮
            var closeBtn = new cc.Node("close_btn");
            closeBtn.parent = popup;
            closeBtn.setContentSize(cc.size(50, 50));
            closeBtn.setPosition(490, 300);
            
            var closeLabel = closeBtn.addComponent(cc.Label);
            closeLabel.string = "×";
            closeLabel.fontSize = 36;
            closeLabel.lineHeight = 50;
            closeBtn.color = new cc.Color(100, 100, 100);
            
            var closeBtnComp = closeBtn.addComponent(cc.Button);
            closeBtnComp.transition = cc.Button.Transition.SCALE;
            closeBtnComp.zoomScale = 1.2;
            
            // 绑定关闭事件
            closeBtn.off(cc.Node.EventType.TOUCH_END);
            closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self._onCloseUserAgreement();
            }, this);
            
            // 创建"我知道了"按钮
            var confirmBtn = new cc.Node("confirm_btn");
            confirmBtn.parent = panel;
            confirmBtn.setContentSize(cc.size(150, 45));
            confirmBtn.setPosition(0, -220);
            
            var confirmLabel = confirmBtn.addComponent(cc.Label);
            confirmLabel.string = "我知道了";
            confirmLabel.fontSize = 22;
            confirmLabel.lineHeight = 45;
            confirmLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            confirmBtn.color = new cc.Color(255, 140, 0);
            
            var confirmBtnComp = confirmBtn.addComponent(cc.Button);
            confirmBtnComp.transition = cc.Button.Transition.SCALE;
            confirmBtnComp.zoomScale = 1.1;
            
            // 绑定关闭事件
            confirmBtn.off(cc.Node.EventType.TOUCH_END);
            confirmBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self._onCloseUserAgreement();
            }, this);
            
            this._userAgreementPopup = popup;
            this._agreementContentLabel = contentLabel;
            
            // 尝试从 API 获取协议内容
            this._fetchAgreementContent();
            
            console.log("=== 弹窗创建完成 ===");
            
        } catch (e) {
            console.error("创建动态弹窗失败:", e);
            this._showError("无法显示用户协议");
        }
    },

    // 尝试加载背景图片
    _loadPopupBackground: function(popup) {
        var panel = popup.getChildByName("content_panel");
        if (!panel) return;
        
        cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.log("背景图片未找到，使用默认白色背景");
                return;
            }
            
            var sprite = panel.getComponent(cc.Sprite);
            if (sprite && spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                console.log("背景图片加载成功");
            }
        });
    },

    // 从 API 获取协议内容
    _fetchAgreementContent: function() {
        var self = this;
        var defines = window.defines;
        var HttpAPI = window.HttpAPI;
        
        if (!defines || !defines.apiUrl || !HttpAPI) {
            console.warn("API 配置未定义，显示默认内容");
            self._showDefaultAgreementContent();
            return;
        }

        HttpAPI.getUserAgreement(
            defines.apiUrl,
            defines.cryptoKey || '',
            function(err, data) {
                if (err || !data) {
                    console.warn("获取用户协议失败，显示默认内容");
                    self._showDefaultAgreementContent();
                    return;
                }
                
                if (self._agreementContentLabel && data.content) {
                    self._agreementContentLabel.string = data.content;
                }
            }
        );
    },

    // 显示默认协议内容
    _showDefaultAgreementContent: function() {
        if (this._agreementContentLabel) {
            this._agreementContentLabel.string = "欢迎使用本游戏！\n\n" +
                "在使用本游戏前，请您仔细阅读并理解本用户协议的全部内容。\n\n" +
                "1. 服务条款\n" +
                "本游戏提供的服务仅供个人娱乐使用，不得用于商业目的。\n\n" +
                "2. 用户行为规范\n" +
                "用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n" +
                "3. 知识产权\n" +
                "本游戏的所有内容（包括但不限于文字、图片、音频、视频等）均受知识产权法律保护。\n\n" +
                "4. 免责声明\n" +
                "本游戏不对因网络原因导致的服务中断承担责任。\n\n" +
                "点击"我知道了"按钮即表示您已阅读并同意本协议的全部内容。";
        }
    },

    _onCloseUserAgreement: function() {
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
            this._agreementContentLabel = null;
        }
    }
});
