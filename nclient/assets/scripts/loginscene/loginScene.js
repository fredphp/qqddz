// 登录场景控制器
// 使用点击事件实现复选框功能（不依赖 Toggle 组件）

// 全局样式修复函数 - 更强大的版本
var _globalStyleFixApplied = false;

// 辅助函数：修复Web平台EditBox的CSS样式（增强版）
var _fixEditBoxStyle = function(editBox, fontColor, bgColor) {
    if (!cc.sys.isBrowser) return;

    fontColor = fontColor || '#000000';
    bgColor = bgColor || '#ffffff';

    console.log('=== 开始修复EditBox样式 ===', fontColor, bgColor);

    // 立即尝试修复
    _applyInputStyles(fontColor, bgColor);

    // 延迟修复（等待HTML input元素创建）
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 50);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 100);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 200);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 500);

    // 注入全局CSS样式（最高优先级）
    if (!_globalStyleFixApplied) {
        _globalStyleFixApplied = true;
        _injectGlobalStyles(fontColor, bgColor);
    }
};

// 应用样式到所有input元素
var _applyInputStyles = function(fontColor, bgColor) {
    try {
        var inputs = document.querySelectorAll('input');
        console.log('找到 input 元素数量:', inputs.length);

        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            _styleSingleInput(input, fontColor, bgColor);
        }

        // 也处理 textarea（可能被用于 EditBox）
        var textareas = document.querySelectorAll('textarea');
        for (var j = 0; j < textareas.length; j++) {
            _styleSingleInput(textareas[j], fontColor, bgColor);
        }
    } catch (e) {
        console.error('修复EditBox样式失败:', e);
    }
};

// 样式化单个input元素
var _styleSingleInput = function(input, fontColor, bgColor) {
    // 设置文字颜色
    input.style.setProperty('color', fontColor, 'important');
    input.style.color = fontColor;

    // 设置背景色
    input.style.setProperty('background-color', bgColor, 'important');
    input.style.backgroundColor = bgColor;

    // 确保可见性
    input.style.setProperty('opacity', '1', 'important');
    input.style.opacity = '1';
    input.style.setProperty('visibility', 'visible', 'important');
    input.style.visibility = 'visible';

    // 设置字体大小
    input.style.setProperty('font-size', '16px', 'important');
    input.style.fontSize = '16px';

    // 设置字体
    input.style.setProperty('font-family', 'Arial, sans-serif', 'important');

    // 修复 WebKit 特殊样式
    input.style.setProperty('-webkit-text-fill-color', fontColor, 'important');
    input.style.webkitTextFillColor = fontColor;

    // 移除可能影响显示的样式
    input.style.textShadow = 'none';
    input.style.setProperty('text-shadow', 'none', 'important');

    // 确保没有caret-color问题
    input.style.setProperty('caret-color', fontColor, 'important');
    input.style.caretColor = fontColor;

    console.log('Input样式已修复:', input.value || '(空)', '颜色:', input.style.color);
};

// 注入全局CSS样式
var _injectGlobalStyles = function(fontColor, bgColor) {
    try {
        var styleId = 'cocos-editbox-fix-style';
        if (document.getElementById(styleId)) return;

        var css = `
            input, textarea {
                color: ${fontColor} !important;
                background-color: ${bgColor} !important;
                opacity: 1 !important;
                visibility: visible !important;
                font-size: 16px !important;
                -webkit-text-fill-color: ${fontColor} !important;
                caret-color: ${fontColor} !important;
            }
            input::placeholder, textarea::placeholder {
                color: #999999 !important;
                opacity: 1 !important;
            }
            input:focus, textarea:focus {
                color: ${fontColor} !important;
                outline: none !important;
            }
        `;

        var style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        console.log('=== 全局EditBox样式已注入 ===');
    } catch (e) {
        console.error('注入全局样式失败:', e);
    }
};

// MutationObserver 监听新创建的input元素
var _startInputObserver = function() {
    if (!cc.sys.isBrowser) return;

    try {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
                        console.log('检测到新input元素创建');
                        _styleSingleInput(node, '#000000', '#ffffff');
                    }
                    // 检查子节点
                    if (node.querySelectorAll) {
                        var inputs = node.querySelectorAll('input, textarea');
                        inputs.forEach(function(inp) {
                            console.log('检测到子节点中的input元素');
                            _styleSingleInput(inp, '#000000', '#ffffff');
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('=== Input元素监听器已启动 ===');
    } catch (e) {
        console.warn('启动Input监听器失败:', e);
    }
};

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

        // 启动Web平台Input样式监听器
        _startInputObserver();
        _injectGlobalStyles('#000000', '#ffffff');

        this._isAgreementChecked = false;
        this._initWaitNode();
        
        // 初始化复选框（使用点击事件）
        this._initCheckbox();
        
        // 初始化登录按钮
        this._initLoginButtons();
        
        // 初始化用户协议链接点击事件
        this._initUserAgreementLink();

        // 检查是否有本地登录会话，尝试自动登录
        this._checkAutoLogin();

        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }

        this._initAndStart();
    },

    // 检查自动登录
    _checkAutoLogin: function() {
        console.log("=== 检查自动登录 ===");
        
        var myglobal = window.myglobal;
        if (!myglobal) {
            console.log("myglobal 未定义，跳过自动登录");
            return;
        }

        // 检查是否被强制下线
        if (myglobal.wasForceLoggedOut()) {
            console.log("用户被强制下线，不自动登录");
            this._showError(myglobal.getForceLogoutReason());
            return;
        }

        // 检查是否有本地会话
        if (myglobal.hasLocalSession()) {
            console.log("发现本地登录会话，尝试验证 Token...");
            
            var self = this;
            myglobal.verifyToken(function(valid, message) {
                if (valid) {
                    console.log("✅ Token 验证成功，自动登录");
                    self._showError("自动登录中...");
                    
                    // 延迟跳转到大厅
                    self.scheduleOnce(function() {
                        if (myglobal.socket && myglobal.socket.initSocket) {
                            myglobal.socket.initSocket();
                        }
                        cc.director.loadScene("hallScene");
                    }, 0.5);
                } else {
                    console.log("⚠️ Token 验证失败:", message);
                    // Token 无效，清除本地状态，显示登录界面
                    if (myglobal.playerData) {
                        myglobal.playerData.clearLocal();
                    }
                }
            });
        } else {
            console.log("无本地登录会话");
        }
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
        
        // 动态创建弹窗
        try {
            var popup = this._createPhoneLoginDynamic();
            this._phoneLoginPopup = popup;
            console.log("=== 手机登录弹窗创建完成 ===");
        } catch (e) {
            console.error("创建手机登录弹窗失败:", e);
            this._showError("无法显示登录弹窗: " + e.message);
        }
    },

    // 动态创建手机登录弹窗 - 按照设计图样式
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

        // ==================== 弹窗面板参数 ====================
        var panelWidth = 420;
        var panelHeight = 380;
        var panel = new cc.Node("panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(panelWidth, panelHeight));
        panel.setPosition(0, 0);

        // ==================== 绿色边框 ====================
        var border = new cc.Node("border");
        border.parent = panel;
        border.setContentSize(cc.size(panelWidth, panelHeight));
        border.setPosition(0, 0);
        var borderGfx = border.addComponent(cc.Graphics);
        // 绿色边框 #8BC34A
        borderGfx.fillColor = new cc.Color(139, 195, 74);
        borderGfx.roundRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 12);
        borderGfx.fill();

        // ==================== 米黄色内容背景 ====================
        var content = new cc.Node("content");
        content.parent = panel;
        content.setContentSize(cc.size(panelWidth - 8, panelHeight - 8));
        content.setPosition(0, 0);
        var contentGfx = content.addComponent(cc.Graphics);
        // 米黄色背景 #FFF8E8
        contentGfx.fillColor = new cc.Color(255, 248, 232);
        contentGfx.roundRect(-(panelWidth - 8)/2, -(panelHeight - 8)/2, panelWidth - 8, panelHeight - 8, 10);
        contentGfx.fill();

        // ==================== 黄色标题栏 ====================
        var titleBarHeight = 50;
        var titleBar = new cc.Node("title_bar");
        titleBar.parent = panel;
        titleBar.setContentSize(cc.size(panelWidth - 8, titleBarHeight));
        titleBar.setPosition(0, panelHeight/2 - titleBarHeight/2 - 4);
        var titleBarGfx = titleBar.addComponent(cc.Graphics);
        // 黄色 #FFC107
        titleBarGfx.fillColor = new cc.Color(255, 193, 7);
        titleBarGfx.roundRect(-(panelWidth - 8)/2, -titleBarHeight/2, panelWidth - 8, titleBarHeight, [10, 10, 0, 0]);
        titleBarGfx.fill();

        // ==================== 标题文字 ====================
        var titleNode = new cc.Node("title_label");
        titleNode.parent = titleBar;
        titleNode.setPosition(0, 0);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "欢乐登录";
        titleLabel.fontSize = 24;
        titleLabel.lineHeight = 36;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(255, 255, 255);

        // ==================== 关闭按钮（右上角圆形黄色）====================
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(36, 36));
        closeBtn.setPosition(panelWidth/2 - 26, panelHeight/2 - 26);
        
        // 黄色圆形背景
        var closeBgGfx = closeBtn.addComponent(cc.Graphics);
        closeBgGfx.fillColor = new cc.Color(255, 193, 7);
        closeBgGfx.circle(0, 0, 18);
        closeBgGfx.fill();
        
        // X 符号
        var closeX = new cc.Node("x");
        closeX.parent = closeBtn;
        var closeXLabel = closeX.addComponent(cc.Label);
        closeXLabel.string = "×";
        closeXLabel.fontSize = 28;
        closeXLabel.lineHeight = 36;
        closeXLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeX.color = new cc.Color(141, 110, 99); // 棕色

        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            popup.destroy();
        }, this);

        // ==================== 表单布局参数 ====================
        var formY = panelHeight/2 - titleBarHeight - 30;
        var inputWidth = 320;
        var inputHeight = 42;
        var rowGap = 20;

        // ==================== 手机号输入框 ====================
        var phoneBg = new cc.Node("phone_input_bg");
        phoneBg.parent = panel;
        phoneBg.setContentSize(cc.size(inputWidth, inputHeight));
        phoneBg.setPosition(0, formY);
        var phoneBgGfx = phoneBg.addComponent(cc.Graphics);
        phoneBgGfx.fillColor = new cc.Color(255, 255, 255);
        phoneBgGfx.roundRect(-inputWidth/2, -inputHeight/2, inputWidth, inputHeight, 6);
        phoneBgGfx.fill();
        phoneBgGfx.strokeColor = new cc.Color(230, 230, 230);
        phoneBgGfx.lineWidth = 1;
        phoneBgGfx.roundRect(-inputWidth/2, -inputHeight/2, inputWidth, inputHeight, 6);
        phoneBgGfx.stroke();

        // 手机图标
        var phoneIcon = new cc.Node("phone_icon");
        phoneIcon.parent = phoneBg;
        phoneIcon.setPosition(-inputWidth/2 + 25, 0);
        var phoneIconLabel = phoneIcon.addComponent(cc.Label);
        phoneIconLabel.string = "📱";
        phoneIconLabel.fontSize = 18;

        // 手机号输入框
        var phoneInputNode = new cc.Node("phone_input");
        phoneInputNode.parent = phoneBg;
        phoneInputNode.setContentSize(cc.size(inputWidth - 60, inputHeight - 4));
        phoneInputNode.setPosition(15, 0);
        var phoneEditBox = phoneInputNode.addComponent(cc.EditBox);
        phoneEditBox.placeholder = "请输入手机号";
        phoneEditBox.fontSize = 16;
        phoneEditBox.placeholderFontSize = 14;
        phoneEditBox.fontColor = new cc.Color(0, 0, 0, 255); // 纯黑色字体，带完全不透明度
        phoneEditBox.placeholderFontColor = new cc.Color(180, 180, 180);
        phoneEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        phoneEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        phoneEditBox.maxLength = 11;
        phoneEditBox.backgroundColor = new cc.Color(255, 255, 255, 255); // 完全不透明的白色背景

        // 创建显示Label - 用于在非编辑状态下显示文字
        var phoneDisplayLabel = new cc.Node("display_label");
        phoneDisplayLabel.parent = phoneInputNode;
        phoneDisplayLabel.setPosition(0, 0);
        var phoneDisplayLabelComp = phoneDisplayLabel.addComponent(cc.Label);
        phoneDisplayLabelComp.string = "";
        phoneDisplayLabelComp.fontSize = 16;
        phoneDisplayLabelComp.lineHeight = inputHeight - 4;
        phoneDisplayLabelComp.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        phoneDisplayLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
        phoneDisplayLabel.color = new cc.Color(0, 0, 0, 255);
        phoneDisplayLabel.active = false; // 默认隐藏，编辑时由EditBox显示

        // 添加编辑事件监听
        phoneInputNode.on('editing-did-begin', function() {
            console.log('手机号输入框开始编辑');
            phoneDisplayLabel.active = false; // 编辑时隐藏显示Label
            _applyInputStyles('#000000', '#ffffff');
        });
        phoneInputNode.on('editing-did-changed', function() {
            console.log('手机号输入框内容变化:', phoneEditBox.string);
            _applyInputStyles('#000000', '#ffffff');
        });
        phoneInputNode.on('editing-did-ended', function() {
            console.log('手机号输入框结束编辑:', phoneEditBox.string);
            // 更新显示Label并显示
            phoneDisplayLabelComp.string = phoneEditBox.string;
            if (phoneEditBox.string && phoneEditBox.string.length > 0) {
                phoneDisplayLabel.active = true;
            }
            _applyInputStyles('#000000', '#ffffff');
        });

        // 修复Web平台样式
        _fixEditBoxStyle(phoneEditBox, '#000000', '#ffffff');

        formY -= inputHeight + rowGap;

        // ==================== 验证码行 ====================
        var codeRowWidth = inputWidth;
        var codeInputWidth = 195;
        var sendBtnWidth = 115;
        var codeGap = 10;

        // 验证码输入框背景
        var codeBg = new cc.Node("code_input_bg");
        codeBg.parent = panel;
        codeBg.setContentSize(cc.size(codeInputWidth, inputHeight));
        codeBg.setPosition(-codeRowWidth/2 + codeInputWidth/2, formY);
        var codeBgGfx = codeBg.addComponent(cc.Graphics);
        codeBgGfx.fillColor = new cc.Color(255, 255, 255);
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 6);
        codeBgGfx.fill();
        codeBgGfx.strokeColor = new cc.Color(230, 230, 230);
        codeBgGfx.lineWidth = 1;
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 6);
        codeBgGfx.stroke();

        // 盾牌图标
        var shieldIcon = new cc.Node("shield_icon");
        shieldIcon.parent = codeBg;
        shieldIcon.setPosition(-codeInputWidth/2 + 22, 0);
        var shieldIconLabel = shieldIcon.addComponent(cc.Label);
        shieldIconLabel.string = "🛡️";
        shieldIconLabel.fontSize = 16;

        // 验证码输入框
        var codeInputNode = new cc.Node("code_input");
        codeInputNode.parent = codeBg;
        codeInputNode.setContentSize(cc.size(codeInputWidth - 50, inputHeight - 4));
        codeInputNode.setPosition(12, 0);
        var codeEditBox = codeInputNode.addComponent(cc.EditBox);
        codeEditBox.placeholder = "验证码";
        codeEditBox.fontSize = 16;
        codeEditBox.placeholderFontSize = 14;
        codeEditBox.fontColor = new cc.Color(0, 0, 0, 255); // 纯黑色字体，带完全不透明度
        codeEditBox.placeholderFontColor = new cc.Color(180, 180, 180);
        codeEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        codeEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        codeEditBox.maxLength = 6;
        codeEditBox.backgroundColor = new cc.Color(255, 255, 255, 255); // 完全不透明的白色背景

        // 创建显示Label - 用于在非编辑状态下显示文字
        var codeDisplayLabel = new cc.Node("display_label");
        codeDisplayLabel.parent = codeInputNode;
        codeDisplayLabel.setPosition(0, 0);
        var codeDisplayLabelComp = codeDisplayLabel.addComponent(cc.Label);
        codeDisplayLabelComp.string = "";
        codeDisplayLabelComp.fontSize = 16;
        codeDisplayLabelComp.lineHeight = inputHeight - 4;
        codeDisplayLabelComp.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        codeDisplayLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
        codeDisplayLabel.color = new cc.Color(0, 0, 0, 255);
        codeDisplayLabel.active = false; // 默认隐藏，编辑时由EditBox显示

        // 添加编辑事件监听
        codeInputNode.on('editing-did-begin', function() {
            console.log('验证码输入框开始编辑');
            codeDisplayLabel.active = false; // 编辑时隐藏显示Label
            _applyInputStyles('#000000', '#ffffff');
        });
        codeInputNode.on('editing-did-changed', function() {
            console.log('验证码输入框内容变化:', codeEditBox.string);
            _applyInputStyles('#000000', '#ffffff');
        });
        codeInputNode.on('editing-did-ended', function() {
            console.log('验证码输入框结束编辑:', codeEditBox.string);
            // 更新显示Label并显示
            codeDisplayLabelComp.string = codeEditBox.string;
            if (codeEditBox.string && codeEditBox.string.length > 0) {
                codeDisplayLabel.active = true;
            }
            _applyInputStyles('#000000', '#ffffff');
        });

        // 修复Web平台样式
        _fixEditBoxStyle(codeEditBox, '#000000', '#ffffff');

        // 获取验证码按钮（黄色）
        var sendCodeBtn = new cc.Node("send_code_btn");
        sendCodeBtn.parent = panel;
        sendCodeBtn.setContentSize(cc.size(sendBtnWidth, inputHeight));
        sendCodeBtn.setPosition(codeRowWidth/2 - sendBtnWidth/2, formY);
        
        var sendCodeGfx = sendCodeBtn.addComponent(cc.Graphics);
        sendCodeGfx.fillColor = new cc.Color(255, 193, 7); // 黄色
        sendCodeGfx.roundRect(-sendBtnWidth/2, -inputHeight/2, sendBtnWidth, inputHeight, 6);
        sendCodeGfx.fill();

        var sendCodeLabel = new cc.Node("label");
        sendCodeLabel.parent = sendCodeBtn;
        var sendCodeLabelComp = sendCodeLabel.addComponent(cc.Label);
        sendCodeLabelComp.string = "获取验证码";
        sendCodeLabelComp.fontSize = 14;
        sendCodeLabelComp.lineHeight = 20;
        sendCodeLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        sendCodeLabel.color = new cc.Color(255, 87, 34); // 红色文字

        var sendCodeBtnComp = sendCodeBtn.addComponent(cc.Button);
        sendCodeBtnComp.transition = cc.Button.Transition.SCALE;
        sendCodeBtnComp.zoomScale = 0.95;

        formY -= inputHeight + rowGap + 5;

        // ==================== 消息提示 ====================
        var messageLabel = new cc.Node("message_label");
        messageLabel.parent = panel;
        messageLabel.setPosition(0, formY);
        var messageLabelComp = messageLabel.addComponent(cc.Label);
        messageLabelComp.string = "";
        messageLabelComp.fontSize = 12;
        messageLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        messageLabel.active = false;

        formY -= 20;

        // ==================== 手机登录按钮（橙色）====================
        var loginBtnWidth = inputWidth;
        var loginBtnHeight = 48;
        
        var loginBtn = new cc.Node("login_btn");
        loginBtn.parent = panel;
        loginBtn.setContentSize(cc.size(loginBtnWidth, loginBtnHeight));
        loginBtn.setPosition(0, formY);
        
        var loginGfx = loginBtn.addComponent(cc.Graphics);
        loginGfx.fillColor = new cc.Color(255, 152, 0); // 橙色
        loginGfx.roundRect(-loginBtnWidth/2, -loginBtnHeight/2, loginBtnWidth, loginBtnHeight, 8);
        loginGfx.fill();

        var loginLabel = new cc.Node("label");
        loginLabel.parent = loginBtn;
        var loginLabelComp = loginLabel.addComponent(cc.Label);
        loginLabelComp.string = "手机登录";
        loginLabelComp.fontSize = 18;
        loginLabelComp.lineHeight = 28;
        loginLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        loginLabel.color = new cc.Color(255, 255, 255);

        var loginBtnComp = loginBtn.addComponent(cc.Button);
        loginBtnComp.transition = cc.Button.Transition.SCALE;
        loginBtnComp.zoomScale = 0.95;

        formY -= loginBtnHeight + 20;

        // ==================== 分隔线 ====================
        var dividerNode = new cc.Node("divider");
        dividerNode.parent = panel;
        dividerNode.setPosition(0, formY);
        var dividerGfx = dividerNode.addComponent(cc.Graphics);
        dividerGfx.strokeColor = new cc.Color(200, 200, 200);
        dividerGfx.lineWidth = 1;
        dividerGfx.moveTo(-inputWidth/2, 0);
        dividerGfx.lineTo(-35, 0);
        dividerGfx.stroke();
        dividerGfx.moveTo(35, 0);
        dividerGfx.lineTo(inputWidth/2, 0);
        dividerGfx.stroke();

        var orLabel = new cc.Node("or_label");
        orLabel.parent = dividerNode;
        var orLabelComp = orLabel.addComponent(cc.Label);
        orLabelComp.string = "其他方式";
        orLabelComp.fontSize = 12;
        orLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        orLabel.color = new cc.Color(180, 180, 180);

        formY -= 25;

        // ==================== 微信登录图标 ====================
        var wxBtn = new cc.Node("wx_login_btn");
        wxBtn.parent = panel;
        wxBtn.setContentSize(cc.size(48, 48));
        wxBtn.setPosition(0, formY);
        
        // 绿色圆形背景
        var wxBgGfx = wxBtn.addComponent(cc.Graphics);
        wxBgGfx.fillColor = new cc.Color(7, 193, 96);
        wxBgGfx.circle(0, 0, 24);
        wxBgGfx.fill();

        // 微信图标
        var wxIcon = new cc.Node("wx_icon");
        wxIcon.parent = wxBtn;
        var wxIconLabel = wxIcon.addComponent(cc.Label);
        wxIconLabel.string = "💬";
        wxIconLabel.fontSize = 24;

        var wxBtnComp = wxBtn.addComponent(cc.Button);
        wxBtnComp.transition = cc.Button.Transition.SCALE;
        wxBtnComp.zoomScale = 0.9;

        // ==================== 功能逻辑 ====================
        var countdown = 0;
        var phone = "";
        var code = "";
        
        // 验证手机号
        var validatePhone = function(phone) {
            if (!phone || phone.length !== 11) return false;
            return /^1[3-9]\d{9}$/.test(phone);
        };
        
        // 显示消息
        var showMessage = function(msg, isError) {
            messageLabel.active = true;
            messageLabelComp.string = msg;
            messageLabel.color = isError ? new cc.Color(255, 80, 80) : new cc.Color(80, 180, 80);
        };
        
        // 更新按钮颜色
        var updateBtnColor = function(gfx, color, width, height, radius) {
            gfx.clear();
            gfx.fillColor = color;
            gfx.roundRect(-width/2, -height/2, width, height, radius);
            gfx.fill();
        };

        // 开始倒计时
        var startCountdown = function() {
            countdown = 60;
            sendCodeBtnComp.interactable = false;
            updateBtnColor(sendCodeGfx, new cc.Color(180, 180, 180), sendBtnWidth, inputHeight, 6);

            var tick = function() {
                countdown--;
                if (countdown <= 0) {
                    sendCodeLabelComp.string = "获取验证码";
                    sendCodeBtnComp.interactable = true;
                    updateBtnColor(sendCodeGfx, new cc.Color(255, 193, 7), sendBtnWidth, inputHeight, 6);
                } else {
                    sendCodeLabelComp.string = countdown + "s";
                    self.scheduleOnce(tick, 1);
                }
            };
            self.scheduleOnce(tick, 1);
            sendCodeLabelComp.string = countdown + "s";
        };
        
        // 发送验证码
        sendCodeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";
            if (!validatePhone(phone)) {
                showMessage("请输入正确的手机号", true);
                return;
            }
            
            var defines = window.defines;
            if (!defines || !defines.apiUrl) {
                showMessage("验证码已发送(测试)", false);
                startCountdown();
                return;
            }
            
            // 使用加密请求发送验证码
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/send-code',
                    'send_code',
                    { phone: phone },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "发送失败", true);
                            return;
                        }
                        if (resp && resp.code === 0) {
                            showMessage("验证码已发送", false);
                            startCountdown();
                        } else {
                            showMessage(resp.message || "发送失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/send-code', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.code === 0) {
                                    showMessage("验证码已发送", false);
                                    startCountdown();
                                } else {
                                    showMessage(resp.message || "发送失败", true);
                                }
                            } catch(e) {
                                showMessage("解析响应失败", true);
                            }
                        } else {
                            showMessage("网络请求失败", true);
                        }
                    }
                };
                xhr.send(JSON.stringify({ phone: phone }));
            }
        });

        // 手机登录
        loginBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";
            code = codeEditBox.string || "";

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

            // 使用加密请求登录
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/phone-login',
                    'phone_login',
                    { phone: phone, code: code },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "登录失败", true);
                            return;
                        }
                        if (resp && resp.code === 0 && resp.data) {
                            showMessage("登录成功", false);
                            // 使用 myglobal.onLoginSuccess 保存登录状态
                            if (window.myglobal) {
                                var loginData = {
                                    uniqueID: resp.data.uniqueID || "",
                                    accountID: resp.data.accountID || "",
                                    nickName: resp.data.nickName || "玩家",
                                    avatarUrl: resp.data.avatarUrl || "",
                                    goldCount: resp.data.goldcount || 0,
                                    token: resp.data.token || "",
                                    phone: phone,
                                    loginType: 1
                                };
                                window.myglobal.onLoginSuccess(loginData);
                            }
                            self.scheduleOnce(function() {
                                popup.destroy();
                                cc.director.loadScene("hallScene");
                            }, 0.5);
                        } else {
                            showMessage(resp.message || "登录失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/phone-login', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('X-Device-ID', 'web_' + Date.now());
                xhr.setRequestHeader('X-Device-Type', 'Web Browser');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.code === 0 && resp.data) {
                                    showMessage("登录成功", false);
                                    // 使用 myglobal.onLoginSuccess 保存登录状态
                                    if (window.myglobal) {
                                        var loginData = {
                                            uniqueID: resp.data.player_id || "",
                                            accountID: resp.data.account_id || "",
                                            nickName: resp.data.nickname || "玩家",
                                            avatarUrl: resp.data.avatar || "",
                                            goldCount: resp.data.gold || 0,
                                            token: resp.data.token || "",
                                            phone: phone,
                                            loginType: 1
                                        };
                                        window.myglobal.onLoginSuccess(loginData);
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
                xhr.send(JSON.stringify({ phone: phone, code: code }));
            }
        });

        // 微信登录
        wxBtn.on(cc.Node.EventType.TOUCH_END, function() {
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

            // 使用加密请求微信登录
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/wx-login',
                    'wx_login',
                    { code: "test_code_" + Date.now() },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "登录失败", true);
                            return;
                        }
                        if (resp && resp.code === 0 && resp.data) {
                            showMessage("登录成功", false);
                            if (window.myglobal && window.myglobal.playerData) {
                                window.myglobal.playerData.uniqueID = resp.data.uniqueID || "";
                                window.myglobal.playerData.accountID = resp.data.accountID || "";
                                window.myglobal.playerData.nickName = resp.data.nickName || "微信用户";
                                window.myglobal.playerData.userName = resp.data.username || "";
                                window.myglobal.playerData.avatar = resp.data.avatarUrl || "";
                                window.myglobal.playerData.gobal_count = resp.data.goldCount || 0;
                                window.myglobal.playerData.token = resp.data.token || "";
                            }
                            self.scheduleOnce(function() {
                                popup.destroy();
                                cc.director.loadScene("hallScene");
                            }, 0.5);
                        } else {
                            showMessage(resp.message || "登录失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/wx-login', true);
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
                            showMessage("网络请求失败", true);
                        }
                    }
                };
                xhr.send(JSON.stringify({ code: "test_code_" + Date.now() }));
            }
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
        var bgMask = new cc.Node("bg_mask");
        bgMask.parent = popup;
        bgMask.setContentSize(cc.size(1280, 720));
        bgMask.setPosition(0, 0);
        var bgMaskSprite = bgMask.addComponent(cc.Sprite);
        bgMaskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgMask.color = new cc.Color(0, 0, 0);
        bgMask.opacity = 180;
        
        // ==================== 主面板 ====================
        var panel = new cc.Node("content_panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(900, 520));
        panel.setPosition(0, 0);
        var panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = new cc.Color(255, 250, 240);
        
        // 加载背景图片
        cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                panelSprite.spriteFrame = spriteFrame;
            }
        });

        // ==================== 标题 ====================
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

        // ==================== 关闭按钮 ====================
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(60, 60));
        closeBtn.setPosition(400, 230);
        
        var closeBtnBg = new cc.Node("bg");
        closeBtnBg.parent = closeBtn;
        closeBtnBg.setContentSize(cc.size(50, 50));
        closeBtnBg.setPosition(0, 0);
        var closeBgSprite = closeBtnBg.addComponent(cc.Sprite);
        closeBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        closeBtnBg.color = new cc.Color(255, 255, 255);
        
        var closeLabelNode = new cc.Node("x");
        closeLabelNode.parent = closeBtn;
        closeLabelNode.setPosition(0, 0);
        var closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 40;
        closeLabel.lineHeight = 50;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeLabelNode.color = new cc.Color(80, 80, 80);
        
        var closeBtnComp = closeBtn.addComponent(cc.Button);
        closeBtnComp.transition = cc.Button.Transition.SCALE;
        closeBtnComp.zoomScale = 1.2;
        closeBtnComp.interactable = true;
        
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
        var scrollNode = new cc.Node("scroll_view");
        scrollNode.parent = panel;
        scrollNode.setContentSize(cc.size(850, 400));
        scrollNode.setPosition(0, -30);
        
        var viewNode = new cc.Node("view");
        viewNode.parent = scrollNode;
        viewNode.setContentSize(cc.size(850, 400));
        viewNode.setPosition(0, 0);
        
        var mask = viewNode.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        
        var contentNode = new cc.Node("content");
        contentNode.parent = viewNode;
        contentNode.anchorX = 0;
        contentNode.anchorY = 1;
        contentNode.setPosition(-425, 200);
        contentNode.setContentSize(cc.size(850, 600));
        
        var richTextNode = new cc.Node("rich_text");
        richTextNode.parent = contentNode;
        richTextNode.anchorX = 0;
        richTextNode.anchorY = 1;
        richTextNode.setPosition(20, -20);
        
        var richText = richTextNode.addComponent(cc.RichText);
        richText.fontSize = 14;
        richText.lineHeight = 24;
        richText.maxWidth = 810;
        
        var agreementText = "<b>用户协议</b>\n\n" +
            "欢迎使用本游戏！在使用前，请仔细阅读以下协议：\n\n" +
            "<b>一、服务条款</b>\n" +
            "1. 用户应遵守国家法律法规，文明游戏。\n" +
            "2. 禁止使用外挂、作弊软件等破坏游戏公平性的行为。\n" +
            "3. 用户账号安全由用户自行负责，请妥善保管账号密码。\n\n" +
            "<b>二、隐私政策</b>\n" +
            "1. 我们会收集必要的用户信息用于提供服务。\n" +
            "2. 我们承诺保护用户隐私，不会向第三方泄露用户信息。\n" +
            "3. 用户有权要求删除个人数据。\n\n" +
            "<b>三、免责声明</b>\n" +
            "1. 因不可抗力导致的服务中断，我们不承担责任。\n" +
            "2. 用户因违规操作造成的损失，由用户自行承担。\n\n" +
            "如有疑问，请联系客服。";
        
        richText.string = agreementText;

        this._userAgreementPopup = popup;
    },

    _closeUserAgreementPopup: function() {
        console.log("=== 关闭用户协议弹窗 ===");
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
        }
    }
});
