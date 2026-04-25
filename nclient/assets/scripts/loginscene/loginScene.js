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
        
        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        
        var checkmark = checkMarkNode.getChildByName("checkmark");
        if (checkmark) {
            this._checkmarkIcon = checkmark;
            checkmark.active = true;  // 默认选中
        }
        
        this._isAgreementChecked = true;  // 默认已同意协议
        
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
        
        console.log("=== 初始化登录按钮 ===");
        console.log("当前节点名称:", this.node.name);

        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            console.log("找到微信登录按钮节点");
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
                console.log("微信登录按钮事件绑定完成");
            }
        } else {
            console.log("未找到微信登录按钮节点 login_wx");
        }

        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            console.log("找到手机登录按钮节点");
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
                console.log("手机登录按钮事件绑定完成");
            }
        } else {
            console.log("未找到手机登录按钮节点 login_phone");
        }
        
        console.log("=== 登录按钮初始化完成 ===");
    },

    _initUserAgreementLink: function() {
        var self = this;
        
        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
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
        console.log("=== 微信登录按钮点击 ===");
        this._doWxLogin();
    },

    _onPhoneLoginClick: function() {
        console.log("=== 手机登录按钮点击 ===");
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
            // 使用 angle 替代已废弃的 rotation 属性
            this._loadingImage.angle += dt * 45;
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
        console.log("=== _doPhoneLogin 开始 ===");
        
        if (!this._checkAgreement()) {
            console.log("用户未同意协议");
            this._showError("请先同意用户协议");
            return;
        }
        
        console.log("用户已同意协议，显示手机登录弹窗");
        this._showPhoneLoginPopup();
    },

    _showPhoneLoginPopup: function() {
        var self = this;
        
        console.log("=== _showPhoneLoginPopup 开始 ===");
        
        if (this.phone_login_prefab) {
            console.log("使用预置的 phone_login_prefab");
            this._createPhoneLoginPopup(this.phone_login_prefab);
        } else {
            console.log("从 resources 加载 phone_login prefab");
            cc.resources.load("prefabs/phone_login", cc.Prefab, function(err, prefab) {
                if (err) {
                    console.error("加载 phone_login prefab 失败:", err);
                    self._showError("无法显示登录弹窗");
                    return;
                }
                console.log("phone_login prefab 加载成功");
                self._createPhoneLoginPopup(prefab);
            });
        }
    },

    _createPhoneLoginPopup: function(prefab) {
        console.log("=== _createPhoneLoginPopup 开始 ===");
        
        // 不使用 prefab，直接动态创建弹窗
        try {
            var popup = this._createPhoneLoginDynamic();
            this._phoneLoginPopup = popup;
            console.log("=== 手机登录弹窗创建完成 ===");
        } catch (e) {
            console.error("创建手机登录弹窗失败:", e);
            this._showError("无法显示登录弹窗: " + e.message);
        }
    },

    // 动态创建手机登录弹窗 - 横向布局，标签和输入框同一行
    _createPhoneLoginDynamic: function() {
        var self = this;

        // ==================== 弹窗根节点 ====================
        var popup = new cc.Node("phone_login_popup");
        popup.parent = this.node;
        popup.setContentSize(cc.size(1280, 720));
        popup.setPosition(0, 0);
        popup.zIndex = 1000;

        // 添加 BlockInputEvents 组件阻止底层点击
        popup.addComponent(cc.BlockInputEvents);

        // ==================== 半透明背景遮罩 ====================
        var bgMask = new cc.Node("bg_mask");
        bgMask.parent = popup;
        bgMask.setContentSize(cc.size(1280, 720));
        bgMask.setPosition(0, 0);
        var bgSprite = bgMask.addComponent(cc.Sprite);
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgMask.color = new cc.Color(0, 0, 0);
        bgMask.opacity = 150;

        // ==================== 弹窗面板 ====================
        var panelWidth = 420;
        var panelHeight = 300;
        var panel = new cc.Node("panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(panelWidth, panelHeight));
        panel.setPosition(0, 0);

        // 带圆角的灰色边框
        var border = new cc.Node("border");
        border.parent = panel;
        border.setContentSize(cc.size(panelWidth, panelHeight));
        border.setPosition(0, 0);
        var borderGfx = border.addComponent(cc.Graphics);
        borderGfx.fillColor = new cc.Color(200, 200, 200);
        borderGfx.roundRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 8);
        borderGfx.fill();

        // 白色内容背景（圆角）
        var content = new cc.Node("content");
        content.parent = panel;
        content.setContentSize(cc.size(panelWidth - 4, panelHeight - 4));
        content.setPosition(0, 0);
        var contentGfx = content.addComponent(cc.Graphics);
        contentGfx.fillColor = new cc.Color(255, 255, 255);
        contentGfx.roundRect(-(panelWidth - 4)/2, -(panelHeight - 4)/2, panelWidth - 4, panelHeight - 4, 6);
        contentGfx.fill();

        // ==================== 标题栏 ====================
        var titleY = panelHeight/2 - 28;
        var titleNode = new cc.Node("title");
        titleNode.parent = panel;
        titleNode.setPosition(0, titleY);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "欢乐登录";
        titleLabel.fontSize = 20;
        titleLabel.lineHeight = 28;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(51, 51, 51);

        // 关闭按钮
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(28, 28));
        closeBtn.setPosition(panelWidth/2 - 20, titleY);
        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            popup.destroy();
        }, this);
        
        var closeX = new cc.Node("x");
        closeX.parent = closeBtn;
        var closeXLabel = closeX.addComponent(cc.Label);
        closeXLabel.string = "×";
        closeXLabel.fontSize = 24;
        closeX.color = new cc.Color(150, 150, 150);

        // 分隔线
        var dividerLine = new cc.Node("divider");
        dividerLine.parent = panel;
        dividerLine.setPosition(0, titleY - 20);
        var dividerGfx = dividerLine.addComponent(cc.Graphics);
        dividerGfx.strokeColor = new cc.Color(235, 235, 235);
        dividerGfx.lineWidth = 1;
        dividerGfx.moveTo(-panelWidth/2 + 15, 0);
        dividerGfx.lineTo(panelWidth/2 - 15, 0);
        dividerGfx.stroke();

        // ==================== 表单布局参数 ====================
        var paddingX = 20;           // 左右边距
        var formWidth = panelWidth - paddingX * 2;
        var inputHeight = 36;        // 输入框高度
        var labelWidth = 55;         // 标签宽度
        var rowGap = 18;             // 行间距
        
        var currentY = titleY - 40;  // 当前Y位置（第一行中心）

        // ==================== 手机号行（标签+输入框同一行）====================
        // 手机号标签
        var phoneLabel = new cc.Node("phone_label");
        phoneLabel.parent = panel;
        phoneLabel.setPosition(-formWidth/2 + labelWidth/2, currentY);
        var phoneLabelComp = phoneLabel.addComponent(cc.Label);
        phoneLabelComp.string = "手机号";
        phoneLabelComp.fontSize = 14;
        phoneLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        phoneLabel.color = new cc.Color(60, 60, 60);

        // 手机号输入框背景
        var phoneInputWidth = formWidth - labelWidth - 5;
        var phoneInputX = -formWidth/2 + labelWidth + phoneInputWidth/2 + 5;
        
        var phoneInputBg = new cc.Node("phone_input_bg");
        phoneInputBg.parent = panel;
        phoneInputBg.setContentSize(cc.size(phoneInputWidth, inputHeight));
        phoneInputBg.setPosition(phoneInputX, currentY);
        var phoneBgGfx = phoneInputBg.addComponent(cc.Graphics);
        phoneBgGfx.fillColor = new cc.Color(250, 250, 250);
        phoneBgGfx.roundRect(-phoneInputWidth/2, -inputHeight/2, phoneInputWidth, inputHeight, 4);
        phoneBgGfx.fill();
        phoneBgGfx.strokeColor = new cc.Color(215, 215, 215);
        phoneBgGfx.lineWidth = 1;
        phoneBgGfx.roundRect(-phoneInputWidth/2, -inputHeight/2, phoneInputWidth, inputHeight, 4);
        phoneBgGfx.stroke();

        // 手机号输入框
        var phoneInputNode = new cc.Node("phone_input");
        phoneInputNode.parent = panel;
        phoneInputNode.setContentSize(cc.size(phoneInputWidth - 16, inputHeight));
        phoneInputNode.setPosition(phoneInputX, currentY);
        phoneInputNode.color = new cc.Color(0, 0, 0);  // 设置节点颜色为黑色
        var phoneEditBox = phoneInputNode.addComponent(cc.EditBox);
        phoneEditBox.placeholder = "请输入手机号";
        phoneEditBox.fontSize = 14;
        phoneEditBox.placeholderFontSize = 12;
        phoneEditBox.fontColor = new cc.Color(0, 0, 0);  // 黑色文字
        phoneEditBox.placeholderFontColor = new cc.Color(120, 120, 120);  // 灰色占位符
        phoneEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        phoneEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        phoneEditBox.maxLength = 11;
        phoneEditBox.backgroundColor = new cc.Color(255, 255, 255, 255);  // 白色背景

        currentY -= inputHeight + rowGap;

        // ==================== 验证码行（标签+输入框+按钮同一行）====================
        // 验证码标签
        var codeLabel = new cc.Node("code_label");
        codeLabel.parent = panel;
        codeLabel.setPosition(-formWidth/2 + labelWidth/2, currentY);
        var codeLabelComp = codeLabel.addComponent(cc.Label);
        codeLabelComp.string = "验证码";
        codeLabelComp.fontSize = 14;
        codeLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        codeLabel.color = new cc.Color(60, 60, 60);

        // 验证码输入框宽度
        var codeInputWidth = Math.floor((formWidth - labelWidth) * 0.5);
        var sendBtnWidth = formWidth - labelWidth - codeInputWidth - 15;
        var codeInputX = -formWidth/2 + labelWidth + codeInputWidth/2 + 5;

        // 验证码输入框背景
        var codeInputBg = new cc.Node("code_input_bg");
        codeInputBg.parent = panel;
        codeInputBg.setContentSize(cc.size(codeInputWidth, inputHeight));
        codeInputBg.setPosition(codeInputX, currentY);
        var codeBgGfx = codeInputBg.addComponent(cc.Graphics);
        codeBgGfx.fillColor = new cc.Color(250, 250, 250);
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 4);
        codeBgGfx.fill();
        codeBgGfx.strokeColor = new cc.Color(215, 215, 215);
        codeBgGfx.lineWidth = 1;
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 4);
        codeBgGfx.stroke();

        // 验证码输入框
        var codeInputNode = new cc.Node("code_input");
        codeInputNode.parent = panel;
        codeInputNode.setContentSize(cc.size(codeInputWidth - 12, inputHeight));
        codeInputNode.setPosition(codeInputX, currentY);
        codeInputNode.color = new cc.Color(0, 0, 0);  // 设置节点颜色为黑色
        var codeEditBox = codeInputNode.addComponent(cc.EditBox);
        codeEditBox.placeholder = "验证码";
        codeEditBox.fontSize = 14;
        codeEditBox.placeholderFontSize = 12;
        codeEditBox.fontColor = new cc.Color(0, 0, 0);  // 黑色文字
        codeEditBox.placeholderFontColor = new cc.Color(120, 120, 120);  // 灰色占位符
        codeEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        codeEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        codeEditBox.maxLength = 6;
        codeEditBox.backgroundColor = new cc.Color(255, 255, 255, 255);  // 白色背景

        // 获取验证码按钮
        var sendCodeBtnX = -formWidth/2 + labelWidth + codeInputWidth + sendBtnWidth/2 + 10;
        var sendCodeBtn = new cc.Node("send_code_btn");
        sendCodeBtn.parent = panel;
        sendCodeBtn.setContentSize(cc.size(sendBtnWidth, inputHeight));
        sendCodeBtn.setPosition(sendCodeBtnX, currentY);
        
        var sendCodeGfx = sendCodeBtn.addComponent(cc.Graphics);
        sendCodeGfx.fillColor = new cc.Color(255, 152, 0);
        sendCodeGfx.roundRect(-sendBtnWidth/2, -inputHeight/2, sendBtnWidth, inputHeight, 4);
        sendCodeGfx.fill();

        var sendCodeLabel = new cc.Node("label");
        sendCodeLabel.parent = sendCodeBtn;
        sendCodeLabel.setPosition(0, 0);
        var sendCodeLabelComp = sendCodeLabel.addComponent(cc.Label);
        sendCodeLabelComp.string = "获取验证码";
        sendCodeLabelComp.fontSize = 12;
        sendCodeLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        sendCodeLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
        sendCodeLabel.color = new cc.Color(255, 255, 255);

        var sendCodeBtnComp = sendCodeBtn.addComponent(cc.Button);
        sendCodeBtnComp.transition = cc.Button.Transition.SCALE;
        sendCodeBtnComp.zoomScale = 0.95;

        currentY -= inputHeight + rowGap;

        // ==================== 消息提示 ====================
        var messageLabel = new cc.Node("message_label");
        messageLabel.parent = panel;
        messageLabel.setPosition(0, currentY);
        var messageLabelComp = messageLabel.addComponent(cc.Label);
        messageLabelComp.string = "";
        messageLabelComp.fontSize = 12;
        messageLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        messageLabel.active = false;

        currentY -= 15;

        // ==================== 登录按钮行 ====================
        var btnWidth = (formWidth - 12) / 2;
        var btnHeight = 38;

        // 手机登录按钮
        var phoneLoginBtn = new cc.Node("phone_login_btn");
        phoneLoginBtn.parent = panel;
        phoneLoginBtn.setContentSize(cc.size(btnWidth, btnHeight));
        phoneLoginBtn.setPosition(-btnWidth/2 - 6, currentY - btnHeight/2);
        
        var phoneLoginGfx = phoneLoginBtn.addComponent(cc.Graphics);
        phoneLoginGfx.fillColor = new cc.Color(255, 152, 0);
        phoneLoginGfx.roundRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 4);
        phoneLoginGfx.fill();

        var phoneLoginLabel = new cc.Node("label");
        phoneLoginLabel.parent = phoneLoginBtn;
        phoneLoginLabel.setPosition(0, 0);
        var phoneLoginLabelComp = phoneLoginLabel.addComponent(cc.Label);
        phoneLoginLabelComp.string = "手机登录";
        phoneLoginLabelComp.fontSize = 14;
        phoneLoginLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        phoneLoginLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
        phoneLoginLabel.color = new cc.Color(255, 255, 255);

        var phoneLoginBtnComp = phoneLoginBtn.addComponent(cc.Button);
        phoneLoginBtnComp.transition = cc.Button.Transition.SCALE;
        phoneLoginBtnComp.zoomScale = 0.95;

        // 微信登录按钮
        var wxLoginBtn = new cc.Node("wx_login_btn");
        wxLoginBtn.parent = panel;
        wxLoginBtn.setContentSize(cc.size(btnWidth, btnHeight));
        wxLoginBtn.setPosition(btnWidth/2 + 6, currentY - btnHeight/2);
        
        var wxLoginGfx = wxLoginBtn.addComponent(cc.Graphics);
        wxLoginGfx.fillColor = new cc.Color(7, 193, 96);
        wxLoginGfx.roundRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 4);
        wxLoginGfx.fill();

        var wxLoginLabel = new cc.Node("label");
        wxLoginLabel.parent = wxLoginBtn;
        wxLoginLabel.setPosition(0, 0);
        var wxLoginLabelComp = wxLoginLabel.addComponent(cc.Label);
        wxLoginLabelComp.string = "微信登录";
        wxLoginLabelComp.fontSize = 14;
        wxLoginLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        wxLoginLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
        wxLoginLabel.color = new cc.Color(255, 255, 255);

        var wxLoginBtnComp = wxLoginBtn.addComponent(cc.Button);
        wxLoginBtnComp.transition = cc.Button.Transition.SCALE;
        wxLoginBtnComp.zoomScale = 0.95;

        currentY -= btnHeight + 12;

        // ==================== 底部协议 ====================
        var agreementLabel = new cc.Node("agreement_label");
        agreementLabel.parent = panel;
        agreementLabel.setPosition(0, currentY + 5);
        var agreementRichText = agreementLabel.addComponent(cc.RichText);
        agreementRichText.string = "<color=#999999>登录即表示同意</c><color=#1890ff><u>用户协议</u></c>";
        agreementRichText.fontSize = 11;
        agreementRichText.maxWidth = formWidth;
        
        // ==================== 功能逻辑 ====================
        var countdown = 0;
        var phone = "";
        var code = "";
        
        // 验证手机号
        var validatePhone = function(phone) {
            if (!phone || phone.length !== 11) return false;
            return /^1[3-9]\d{9}$/.test(phone);
        };
        
        // 验证验证码
        var validateCode = function(code) {
            return code && code.length >= 4 && code.length <= 6;
        };
        
        // 显示消息
        var showMessage = function(msg, isError) {
            messageLabel.active = true;
            messageLabelComp.string = msg;
            messageLabel.color = isError ? new cc.Color(255, 80, 80) : new cc.Color(80, 180, 80);
        };
        
        // 更新按钮颜色（Graphics方式，圆角矩形）
        var updateBtnColor = function(gfx, color, width, height) {
            gfx.clear();
            gfx.fillColor = color;
            gfx.roundRect(-width/2, -height/2, width, height, 4);
            gfx.fill();
        };

        // 开始倒计时
        var startCountdown = function() {
            countdown = 60;
            sendCodeBtnComp.interactable = false;
            updateBtnColor(sendCodeGfx, new cc.Color(180, 180, 180), sendBtnWidth, inputHeight);

            var tick = function() {
                countdown--;
                if (countdown <= 0) {
                    sendCodeLabelComp.string = "获取验证码";
                    sendCodeBtnComp.interactable = true;
                    updateBtnColor(sendCodeGfx, new cc.Color(255, 152, 0), sendBtnWidth, inputHeight);
                } else {
                    sendCodeLabelComp.string = countdown + "s";
                    self.scheduleOnce(tick, 1);
                }
            };
            self.scheduleOnce(tick, 1);
            sendCodeLabelComp.string = countdown + "s";
        };
        
        // 发送验证码 - 测试阶段直接模拟成功
        sendCodeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";
            if (!validatePhone(phone)) {
                showMessage("请输入正确的手机号", true);
                return;
            }
            // 测试阶段：直接显示模拟发送成功
            showMessage("验证码已发送(测试)", false);
            startCountdown();
        });

        // 手机登录 - 测试阶段只需验证手机号
        phoneLoginBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";

            if (!validatePhone(phone)) {
                showMessage("请输入正确的手机号", true);
                return;
            }

            showMessage("正在登录...", false);

            var defines = window.defines;
            if (!defines || !defines.apiUrl) {
                // 无API配置，模拟登录成功
                if (window.myglobal && window.myglobal.playerData) {
                    window.myglobal.playerData.uniqueID = "phone_" + phone;
                    window.myglobal.playerData.accountID = "phone_" + phone;
                    window.myglobal.playerData.nickName = "玩家" + phone.substr(-4);
                    window.myglobal.playerData.gobal_count = 1000;
                    window.myglobal.playerData.token = "test_token_" + Date.now();
                }
                showMessage("登录成功", false);
                self.scheduleOnce(function() {
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                }, 0.5);
                return;
            }

            // 调用API登录
            var xhr = new XMLHttpRequest();
            xhr.open('POST', defines.apiUrl + '/api/v1/auth/phone-login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var resp = JSON.parse(xhr.responseText);
                            if (resp.code === 0 && resp.data) {
                                showMessage("登录成功", false);
                                if (window.myglobal && window.myglobal.playerData) {
                                    window.myglobal.playerData.uniqueID = resp.data.player_id || "";
                                    window.myglobal.playerData.accountID = resp.data.account_id || "";
                                    window.myglobal.playerData.nickName = resp.data.nickname || "玩家";
                                    window.myglobal.playerData.userName = resp.data.username || "";
                                    window.myglobal.playerData.avatar = resp.data.avatar || "";
                                    window.myglobal.playerData.gobal_count = resp.data.gold || 0;
                                    window.myglobal.playerData.token = resp.data.token || "";
                                }
                                self.scheduleOnce(function() {
                                    popup.destroy();
                                    cc.director.loadScene("hallScene");
                                }, 0.5);
                            } else {
                                showMessage(resp.message || "登录失败", true);
                            }
                        } catch(e) {
                            showMessage("解析响应失败", true);
                        }
                    } else {
                        showMessage("网络请求失败", true);
                    }
                }
            };
            // 测试阶段不发送验证码
            xhr.send(JSON.stringify({ phone: phone }));
        });

        // 微信登录 - 预留接口
        wxLoginBtn.on(cc.Node.EventType.TOUCH_END, function() {
            showMessage("正在登录...", false);

            var defines = window.defines;

            if (!defines || !defines.apiUrl) {
                // 无API配置，模拟登录成功
                if (window.myglobal && window.myglobal.playerData) {
                    window.myglobal.playerData.uniqueID = "wx_" + Date.now();
                    window.myglobal.playerData.accountID = "wx_" + Date.now();
                    window.myglobal.playerData.nickName = "微信用户";
                    window.myglobal.playerData.gobal_count = 1000;
                    window.myglobal.playerData.token = "test_wx_token_" + Date.now();
                }
                showMessage("登录成功", false);
                self.scheduleOnce(function() {
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                }, 0.5);
                return;
            }

            // 调用微信登录API
            var xhr = new XMLHttpRequest();
            xhr.open('POST', defines.apiUrl + '/api/v1/auth/wechat-login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var resp = JSON.parse(xhr.responseText);
                            if (resp.code === 0 && resp.data) {
                                showMessage("登录成功", false);
                                if (window.myglobal && window.myglobal.playerData) {
                                    window.myglobal.playerData.uniqueID = resp.data.player_id || "";
                                    window.myglobal.playerData.accountID = resp.data.account_id || "";
                                    window.myglobal.playerData.nickName = resp.data.nickname || "微信用户";
                                    window.myglobal.playerData.userName = resp.data.username || "";
                                    window.myglobal.playerData.avatar = resp.data.avatar || "";
                                    window.myglobal.playerData.gobal_count = resp.data.gold || 0;
                                    window.myglobal.playerData.token = resp.data.token || "";
                                }
                                self.scheduleOnce(function() {
                                    popup.destroy();
                                    cc.director.loadScene("hallScene");
                                }, 0.5);
                            } else {
                                showMessage(resp.message || "登录失败", true);
                            }
                        } catch(e) {
                            showMessage("解析响应失败", true);
                        }
                    } else {
                        // 测试阶段，模拟成功
                        if (window.myglobal && window.myglobal.playerData) {
                            window.myglobal.playerData.uniqueID = "wx_" + Date.now();
                            window.myglobal.playerData.accountID = "wx_" + Date.now();
                            window.myglobal.playerData.nickName = "微信用户";
                            window.myglobal.playerData.gobal_count = 1000;
                            window.myglobal.playerData.token = "test_wx_token_" + Date.now();
                        }
                        showMessage("登录成功(测试)", false);
                        self.scheduleOnce(function() {
                            popup.destroy();
                            cc.director.loadScene("hallScene");
                        }, 0.5);
                    }
                }
            };
            // 微信登录需要code，这里预留接口
            xhr.send(JSON.stringify({ code: "test_code_" + Date.now() }));
        });
        
        return popup;
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
        // ★ 使用 RichText 代替 Label，避免纹理过大问题

        // 1. 创建 ScrollView 节点
        var scrollNode = new cc.Node("scroll_view");
        scrollNode.parent = panel;
        scrollNode.setContentSize(cc.size(850, 400));
        scrollNode.setPosition(0, -30);
        
        // 2. 创建 view 节点（ScrollView 的视口）
        var viewNode = new cc.Node("view");
        viewNode.parent = scrollNode;
        viewNode.setContentSize(cc.size(850, 400));
        viewNode.setPosition(0, 0);
        
        // 3. 添加 Mask 组件到 view（裁剪超出视口的内容）
        var mask = viewNode.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        
        // 4. 创建 content 节点（ScrollView 的内容容器）
        var contentNode = new cc.Node("content");
        contentNode.parent = viewNode;
        // ★ content 锚点在左上角
        contentNode.anchorX = 0;
        contentNode.anchorY = 1;
        // ★ content 位置：view 的左上角
        contentNode.setPosition(-425, 200);
        // ★ 初始高度
        contentNode.setContentSize(cc.size(850, 600));
        
        // 5. 创建 RichText 节点（不会有纹理大小限制）
        var richTextNode = new cc.Node("rich_text");
        richTextNode.parent = contentNode;
        richTextNode.anchorX = 0;
        richTextNode.anchorY = 1;
        // ★ 增加左右两边的缩进，减少上边距
        richTextNode.setPosition(40, -10);
        // ★ 减小宽度以适应更大的边距
        richTextNode.setContentSize(cc.size(770, 500));
        
        var richText = richTextNode.addComponent(cc.RichText);
        richText.fontSize = 20;
        richText.lineHeight = 32;
        // ★ 相应减小maxWidth
        richText.maxWidth = 770;
        richText.handleTouchEvent = false;
        richTextNode.color = new cc.Color(50, 50, 50);
        
        // 初始显示加载提示
        richText.string = "<color=#333333>正在加载用户协议...</color>";
        
        // 6. 添加 ScrollView 组件
        var scrollView = scrollNode.addComponent(cc.ScrollView);
        scrollView.content = contentNode;
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.brake = 0.5;
        
        // 7. 添加鼠标滚轮支持
        scrollNode.on(cc.Node.EventType.MOUSE_WHEEL, function(event) {
            var scrollY = event.getScrollY();
            var currentOffset = scrollView.getScrollOffset();
            var maxOffset = scrollView.getMaxScrollOffset();
            var newOffsetY = Math.max(0, Math.min(currentOffset.y + scrollY * 0.5, maxOffset.y));
            scrollView.scrollToOffset(cc.v2(currentOffset.x, newOffsetY), 0.1);
        }, self);
        
        // 保存引用
        this._agreementRichText = richText;
        this._agreementContentLabel = null;  // 不再使用 Label
        this._scrollView = scrollView;
        this._contentNode = contentNode;
        this._scrollNode = scrollNode;
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
            this._agreementRichText = null;
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
        var HttpAPI = window.HttpAPI;
        
        // 优先使用 HttpAPI（支持解密）
        if (defines && defines.apiUrl && HttpAPI) {
            HttpAPI.getUserAgreement(
                defines.apiUrl,
                defines.cryptoKey || '',
                function(err, data) {
                    if (err || !data || !data.content) {
                        console.log("API获取失败，使用默认内容:", err);
                        self._showDefaultAgreementContent();
                    } else {
                        self._updateAgreementContent(data.content);
                    }
                }
            );
        } else {
            // 直接请求 API
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
        }
    },

    // 更新协议内容
    _updateAgreementContent: function(content) {
        // 优先使用 RichText
        if (this._agreementRichText) {
            console.log("设置协议内容(RichText)，长度:", content ? content.length : 0);
            // 将普通文本转换为 RichText 格式
            var formattedContent = this._formatTextForRichText(content);
            this._agreementRichText.string = formattedContent;
            
            // 延迟更新 content 高度
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.1);
            return;
        }
        
        // 兼容旧的 Label 方式
        if (!this._agreementContentLabel) {
            console.log("_updateAgreementContent: 组件不存在");
            return;
        }

        if (content) {
            console.log("设置协议内容，长度:", content.length);
            this._agreementContentLabel.string = content;
            
            // 延迟更新尺寸
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.05);
        }
    },
    
    // 将文本转换为 RichText 支持的格式
    _formatTextForRichText: function(text) {
        if (!text) return "<color=#333333>暂无内容</color>";
        
        // 检测是否包含HTML标签（更全面的检测）
        var hasHtml = /<[a-zA-Z][^>]*>/.test(text);
        
        if (hasHtml) {
            console.log("检测到HTML格式内容，转换为RichText格式");
            return this._convertHtmlToRichText(text);
        }
        
        // 纯文本格式
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(/\n/g, '<br/>');
        text = text.replace(/【([^】]+)】/g, '<b><color=#2d7a4e>【$1】</color></b>');
        return "<color=#333333>" + text + "</color>";
    },
    
    // 将HTML转换为RichText支持的格式
    _convertHtmlToRichText: function(html) {
        console.log("=== 开始转换HTML内容 ===");
        console.log("原内容前200字符:", html.substring(0, 200));
        var result = html;
        
        // 先清理标签内部的换行和多余空白（保留一个空格）
        result = result.replace(/>\s+</g, '><');
        
        // 移除 <!DOCTYPE...> 和 <html> 等外层标签
        result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
        result = result.replace(/<html[^>]*>/gi, '');
        result = result.replace(/<\/html>/gi, '');
        result = result.replace(/<body[^>]*>/gi, '');
        result = result.replace(/<\/body>/gi, '');
        result = result.replace(/<head[\s\S]*?<\/head>/gi, '');
        
        // ★ 关键：先处理<br>标签，转换为特殊标记，避免被后续处理干扰
        result = result.replace(/<br\s*\/?>/gi, '[[BR]]');
        
        // 处理标题标签 - 转换为带颜色和加粗的格式（每个标题独立成行）
        result = result.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '[[P]]<b><size=26><color=#1a6b3c>$1</color></size></b>[[P]][[P]]');
        result = result.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '[[P]]<b><size=22><color=#2d7a4e>$1</color></size></b>[[P]][[P]]');
        result = result.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '[[P]]<b><size=20><color=#2d7a4e>$1</color></size></b>[[P]]');
        result = result.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '[[P]]<b>$1</b>[[P]]');
        
        // 处理段落标签 - 每个p标签独立成段
        result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1[[P]][[P]]');
        
        // 处理格式标签
        result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '<b>$1</b>');
        result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '<b>$1</b>');
        result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '<i>$1</i>');
        result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
        
        // 处理div和span标签
        result = result.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1[[P]]');
        result = result.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
        
        // 处理列表
        result = result.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '• $1[[P]]');
        result = result.replace(/<[ou]l[^>]*>/gi, '');
        result = result.replace(/<\/[ou]l>/gi, '[[P]]');
        
        // 处理hr标签
        result = result.replace(/<hr\s*\/?>/gi, '[[P]]───────────[[P]]');
        
        // 移除所有其他不支持的HTML标签（但保留内容）
        result = result.replace(/<[a-zA-Z][^>]*>/g, '');
        result = result.replace(/<\/[a-zA-Z][^>]*>/g, '');
        
        // 将特殊标记转换回换行
        result = result.replace(/\[\[BR\]\]/g, '<br/>');
        result = result.replace(/\[\[P\]\]/g, '<br/>');
        
        // 转换普通换行符
        result = result.replace(/\n/g, '<br/>');
        
        // 清理多余的换行（超过2个连续换行变成2个）
        result = result.replace(/(<br\/>){3,}/gi, '<br/><br/>');
        result = result.replace(/^(<br\/>)+/, '');
        result = result.replace(/(<br\/>)+$/, '');
        
        // 解码HTML实体
        result = result.replace(/&nbsp;/g, ' ');
        result = result.replace(/&amp;/g, '&');
        result = result.replace(/&lt;/g, '<');
        result = result.replace(/&gt;/g, '>');
        result = result.replace(/&quot;/g, '"');
        
        // 清理标签内的多余空白
        result = result.replace(/<b>\s+/g, '<b>');
        result = result.replace(/\s+<\/b>/g, '</b>');
        
        console.log("转换后内容前200字符:", result.substring(0, 200));
        console.log("=== HTML转换完成 ===");
        
        // 包装默认颜色
        return "<color=#333333>" + result + "</color>";
    },

    // 更新 ScrollView 的 content 尺寸
    _updateContentSize: function() {
        if (!this._contentNode || !this._scrollView) {
            console.log("_updateContentSize: 组件不存在");
            return;
        }
        
        var viewHeight = 400;  // ScrollView 视口高度
        var contentHeight = 600;  // 默认高度
        
        // 如果有 RichText，获取其高度
        if (this._agreementRichText) {
            var richTextNode = this._agreementRichText.node;
            contentHeight = richTextNode.height + 160;  // 加上 padding（底部留更多空间避免被边框遮挡）
            console.log("RichText节点高度:", richTextNode.height);
        }
        // 如果有 Label，获取其高度
        else if (this._agreementContentLabel) {
            var labelNode = this._agreementContentLabel.node;
            contentHeight = labelNode.height + 80;
            console.log("Label节点高度:", labelNode.height);
        }
        
        // 确保高度大于视口高度，才能滚动
        if (contentHeight < viewHeight) {
            contentHeight = viewHeight + 50;
        }
        
        console.log("设置 Content 高度:", contentHeight);
        
        // 更新 content 尺寸
        this._contentNode.setContentSize(cc.size(850, contentHeight));
        
        // 强制更新 ScrollView
        this._scrollView.content = this._contentNode;
        
        // 滚动到顶部
        this._scrollView.scrollToTop(0);
    },

    // 显示默认协议内容
    _showDefaultAgreementContent: function() {
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

        console.log("显示默认协议内容");
        
        // 优先使用 RichText
        if (this._agreementRichText) {
            var formattedContent = this._formatTextForRichText(defaultContent);
            this._agreementRichText.string = formattedContent;
            
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.1);
            return;
        }
        
        // 兼容旧的 Label 方式
        if (this._agreementContentLabel) {
            this._agreementContentLabel.string = defaultContent;
            
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.05);
        }
    }
});
