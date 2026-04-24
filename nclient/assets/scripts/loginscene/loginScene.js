// 登录场景控制器
// 使用内置 Toggle 组件实现标准复选框

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
        
        // 初始化复选框
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

    // 初始化复选框 - 使用内置 Toggle 组件
    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");
        
        var self = this;
        
        // 获取 check_mark 节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        // 获取 Toggle 组件
        var toggle = checkMarkNode.getComponent(cc.Toggle);
        if (!toggle) {
            console.error("Toggle 组件未找到");
            return;
        }
        
        this._toggle = toggle;
        this._checkMarkNode = checkMarkNode;
        
        // 默认未选中
        toggle.isChecked = false;
        this._isAgreementChecked = false;
        
        // 清空并重新绑定 Toggle 事件
        toggle.checkEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onCheckboxToggle";
        handler.customEventData = "";
        toggle.checkEvents.push(handler);
        
        // 添加触摸事件作为备选方案
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            console.log(">>> 复选框被点击");
            toggle.isChecked = !toggle.isChecked;
            self._onCheckboxToggle(toggle);
        }, this);
        
        console.log("=== 复选框初始化完成 ===");
    },

    // Toggle 状态变化回调
    _onCheckboxToggle: function(toggle) {
        this._isAgreementChecked = toggle.isChecked;
        console.log("复选框状态:", this._isAgreementChecked ? "已选中" : "未选中");
        
        // 更新 checkmark 子节点的显示状态
        if (this._checkMarkNode) {
            var checkmark = this._checkMarkNode.getChildByName("checkmark");
            if (checkmark) {
                checkmark.active = toggle.isChecked;
            }
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
                
                // 备选方案：触摸事件
                var self = this;
                phoneLoginNode.off(cc.Node.EventType.TOUCH_END);
                phoneLoginNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                    self._onPhoneLoginClick();
                }, this);
            }
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

    // 显示用户协议弹窗
    _showUserAgreementPopup: function() {
        var self = this;

        if (this.user_agreement_prefabs) {
            this._createUserAgreementPopup(this.user_agreement_prefabs);
        } else {
            cc.resources.load("prefabs/user_agreement", cc.Prefab, function(err, prefab) {
                if (err) {
                    console.error("加载用户协议 prefab 失败:", err);
                    // 即使加载失败，也要创建默认弹窗
                    self._createDefaultAgreementPopup();
                    return;
                }
                self._createUserAgreementPopup(prefab);
            });
        }
    },

    _createUserAgreementPopup: function(prefab) {
        try {
            var popup = cc.instantiate(prefab);
            popup.parent = this.node;

            // 绑定关闭按钮事件
            var closeBtn = popup.getChildByName("close_btn");
            if (closeBtn) {
                var button = closeBtn.getComponent(cc.Button);
                if (button) {
                    button.clickEvents = [];

                    var handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = "loginScene";
                    handler.handler = "_onCloseUserAgreement";
                    handler.customEventData = "";
                    button.clickEvents.push(handler);
                }
                
                // 备选方案：触摸事件
                var self = this;
                closeBtn.off(cc.Node.EventType.TOUCH_END);
                closeBtn.on(cc.Node.EventType.TOUCH_END, function(event) {
                    self._onCloseUserAgreement();
                }, this);
            }

            this._userAgreementPopup = popup;
        } catch (e) {
            console.error("创建用户协议弹窗失败:", e);
            this._createDefaultAgreementPopup();
        }
    },

    // 创建默认的用户协议弹窗
    _createDefaultAgreementPopup: function() {
        try {
            // 创建弹窗根节点
            var popup = new cc.Node("user_agreement_default");
            popup.parent = this.node;
            popup.setContentSize(cc.size(1280, 720));
            popup.setPosition(0, 0);
            
            // 添加阻挡事件组件
            popup.addComponent(cc.BlockInputEvents);
            
            // 创建背景遮罩
            var bgNode = new cc.Node("bg");
            bgNode.parent = popup;
            bgNode.setContentSize(cc.size(1280, 720));
            bgNode.setPosition(0, 0);
            bgNode.color = new cc.Color(0, 0, 0);
            bgNode.opacity = 150;
            bgNode.addComponent(cc.Sprite);
            
            // 创建内容面板
            var panel = new cc.Node("panel");
            panel.parent = popup;
            panel.setContentSize(cc.size(600, 400));
            panel.setPosition(0, 0);
            var panelSprite = panel.addComponent(cc.Sprite);
            panel.color = new cc.Color(255, 255, 255);
            
            // 创建标题
            var titleNode = new cc.Node("title");
            titleNode.parent = panel;
            titleNode.setContentSize(cc.size(200, 40));
            titleNode.setPosition(0, 160);
            var titleLabel = titleNode.addComponent(cc.Label);
            titleLabel.string = "用户协议";
            titleLabel.fontSize = 28;
            titleLabel.lineHeight = 40;
            titleNode.color = new cc.Color(50, 50, 50);
            
            // 创建内容
            var contentNode = new cc.Node("content");
            contentNode.parent = panel;
            contentNode.setContentSize(cc.size(550, 250));
            contentNode.setPosition(0, -10);
            var contentLabel = contentNode.addComponent(cc.Label);
            contentLabel.string = "协议加载失败，请稍后重试。";
            contentLabel.fontSize = 18;
            contentLabel.lineHeight = 28;
            contentNode.color = new cc.Color(80, 80, 80);
            
            // 创建关闭按钮
            var closeBtn = new cc.Node("close_btn");
            closeBtn.parent = popup;
            closeBtn.setContentSize(cc.size(50, 50));
            closeBtn.setPosition(270, 170);
            var closeSprite = closeBtn.addComponent(cc.Sprite);
            var closeBtnComp = closeBtn.addComponent(cc.Button);
            
            // 绑定关闭事件
            closeBtnComp.clickEvents = [];
            var handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "loginScene";
            handler.handler = "_onCloseUserAgreement";
            handler.customEventData = "";
            closeBtnComp.clickEvents.push(handler);
            
            // 创建"我知道了"按钮
            var confirmBtn = new cc.Node("confirm_btn");
            confirmBtn.parent = panel;
            confirmBtn.setContentSize(cc.size(150, 45));
            confirmBtn.setPosition(0, -160);
            var confirmLabel = confirmBtn.addComponent(cc.Label);
            confirmLabel.string = "我知道了";
            confirmLabel.fontSize = 22;
            confirmBtn.color = new cc.Color(255, 140, 0);
            var confirmBtnComp = confirmBtn.addComponent(cc.Button);
            
            // 绑定关闭事件
            confirmBtnComp.clickEvents = [];
            var confirmHandler = new cc.Component.EventHandler();
            confirmHandler.target = this.node;
            confirmHandler.component = "loginScene";
            confirmHandler.handler = "_onCloseUserAgreement";
            confirmHandler.customEventData = "";
            confirmBtnComp.clickEvents.push(confirmHandler);
            
            this._userAgreementPopup = popup;
            
        } catch (e) {
            console.error("创建默认弹窗失败:", e);
            this._showError("无法显示用户协议");
        }
    },

    _onCloseUserAgreement: function() {
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
        }
    }
});
