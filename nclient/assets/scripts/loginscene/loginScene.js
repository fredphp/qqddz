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
            titleNode.setPosition(0, 235);
            var titleLabel = titleNode.addComponent(cc.Label);
            titleLabel.string = "用户协议";
            titleLabel.fontSize = 36;
            titleLabel.lineHeight = 50;
            titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            titleNode.color = new cc.Color(60, 50, 40);

            // 创建标题下划线装饰
            var titleLine = new cc.Node("title_line");
            titleLine.parent = panel;
            titleLine.setContentSize(cc.size(200, 3));
            titleLine.setPosition(0, 200);
            var lineSprite = titleLine.addComponent(cc.Sprite);
            lineSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            titleLine.color = new cc.Color(200, 160, 100);  // 金色装饰线

            // ==================== 协议内容显示区域 ====================
            // 简化结构：scroll_view -> content -> label

            // 1. 创建 ScrollView 节点
            var scrollViewNode = new cc.Node("scroll_view");
            scrollViewNode.parent = panel;
            scrollViewNode.setContentSize(cc.size(760, 320));
            scrollViewNode.setPosition(0, -20);

            // 添加 Sprite 作为背景
            var bgSprite = scrollViewNode.addComponent(cc.Sprite);
            bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            scrollViewNode.color = new cc.Color(255, 252, 240);  // 浅米色背景
            scrollViewNode.opacity = 220;

            var scrollView = scrollViewNode.addComponent(cc.ScrollView);
            scrollView.horizontal = false;
            scrollView.vertical = true;
            scrollView.inertia = true;
            scrollView.elastic = true;
            scrollView.brake = 0.3;

            // 2. 创建 content 节点（滚动内容容器）
            var contentNode = new cc.Node("content");
            contentNode.setContentSize(cc.size(720, 500));  // 初始高度
            contentNode.anchorX = 0.5;
            contentNode.anchorY = 1;  // 锚点在顶部
            contentNode.x = 0;
            contentNode.y = 160;  // ScrollView 会自动调整

            // 设置 ScrollView 的 content（这会自动将 content 添加到 view 节点下）
            scrollView.content = contentNode;

            // 3. 创建 Label 节点（协议文本）
            var labelNode = new cc.Node("label");
            labelNode.parent = contentNode;
            labelNode.setContentSize(cc.size(700, 0));
            labelNode.anchorY = 1;
            labelNode.setPosition(0, 0);

            var contentLabel = labelNode.addComponent(cc.Label);
            contentLabel.string = "正在加载用户协议...";
            contentLabel.fontSize = 20;
            contentLabel.lineHeight = 32;
            contentLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;  // 高度自适应
            contentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            contentLabel.verticalAlign = cc.Label.VerticalAlign.TOP;
            contentLabel.wrapWidth = 700;  // 自动换行宽度
            labelNode.color = new cc.Color(80, 60, 40);  // 深棕色文字

            // 保存引用，用于后续更新内容
            this._agreementContentLabel = contentLabel;
            this._agreementContentNode = contentNode;
            this._agreementLabelNode = labelNode;

            // 创建关闭按钮背景（圆形）
            var closeBtnBg = new cc.Node("close_btn_bg");
            closeBtnBg.parent = panel;
            closeBtnBg.setContentSize(cc.size(40, 40));
            closeBtnBg.setPosition(410, 240);
            var closeBtnBgSprite = closeBtnBg.addComponent(cc.Sprite);
            closeBtnBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            closeBtnBg.color = new cc.Color(200, 80, 80);  // 红色背景

            var closeBtnComp = closeBtnBg.addComponent(cc.Button);
            closeBtnComp.transition = cc.Button.Transition.SCALE;
            closeBtnComp.zoomScale = 1.2;

            // 创建关闭按钮X文字
            var closeLabelNode = new cc.Node("label");
            closeLabelNode.parent = closeBtnBg;
            closeLabelNode.setPosition(0, 0);
            var closeLabel = closeLabelNode.addComponent(cc.Label);
            closeLabel.string = "×";
            closeLabel.fontSize = 32;
            closeLabel.lineHeight = 40;
            closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            closeLabelNode.color = new cc.Color(255, 255, 255);  // 白色文字

            // 绑定关闭事件
            closeBtnBg.off(cc.Node.EventType.TOUCH_END);
            closeBtnBg.on(cc.Node.EventType.TOUCH_END, function() {
                self._onCloseUserAgreement();
            }, this);

            // 创建"我知道了"按钮（使用图片，无文字）
            var confirmBtnBg = new cc.Node("confirm_btn_bg");
            confirmBtnBg.parent = panel;
            confirmBtnBg.setContentSize(cc.size(180, 70));  // 调高按钮高度
            confirmBtnBg.setPosition(0, -220);
            var confirmBtnBgSprite = confirmBtnBg.addComponent(cc.Sprite);
            confirmBtnBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

            // 创建按钮组件
            var confirmBtnComp = confirmBtnBg.addComponent(cc.Button);
            confirmBtnComp.transition = cc.Button.Transition.SCALE;
            confirmBtnComp.zoomScale = 1.1;

            // 加载按钮图片
            cc.resources.load("UI/button/btn_confirm", cc.SpriteFrame, function(err, spriteFrame) {
                if (!err && spriteFrame) {
                    confirmBtnBgSprite.spriteFrame = spriteFrame;
                    console.log("按钮图片加载成功");
                } else {
                    // 加载失败使用纯色背景
                    confirmBtnBg.color = new cc.Color(76, 175, 80);
                    console.log("按钮图片加载失败，使用默认背景");
                }
            });

            // 绑定关闭事件
            confirmBtnBg.off(cc.Node.EventType.TOUCH_END);
            confirmBtnBg.on(cc.Node.EventType.TOUCH_END, function() {
                console.log(">>> 我知道了按钮点击");
                self._onCloseUserAgreement();
            }, this);

            // 保存弹窗引用
            this._userAgreementPopup = popup;

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
        console.log("=== 开始获取用户协议 ===");
        
        var self = this;
        var defines = window.defines;
        
        // 检查配置
        if (!defines || !defines.apiUrl) {
            console.warn("defines 或 apiUrl 未定义");
            self._showDefaultAgreementContent();
            return;
        }
        
        var apiUrl = defines.apiUrl + '/api/v1/user-agreement/latest';
        console.log("请求API:", apiUrl);
        
        // 使用 XMLHttpRequest 发送请求（Cocos Creator 2.x 兼容方式）
        var xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.timeout = 10000;
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    console.log("API响应:", response);
                    
                    if (response && response.code === 0 && response.data && response.data.content) {
                        self._updateAgreementContent(response.data.content, response.data.title);
                    } else {
                        console.warn("API返回数据格式异常:", response);
                        self._showDefaultAgreementContent();
                    }
                } catch (e) {
                    console.error("解析响应失败:", e);
                    self._showDefaultAgreementContent();
                }
            } else {
                console.warn("HTTP请求失败:", xhr.status);
                self._showDefaultAgreementContent();
            }
        };
        
        xhr.onerror = function() {
            console.warn("网络请求失败");
            self._showDefaultAgreementContent();
        };
        
        xhr.ontimeout = function() {
            console.warn("请求超时");
            self._showDefaultAgreementContent();
        };
        
        xhr.send();
    },

    // 更新协议内容
    _updateAgreementContent: function(content, title) {
        console.log("=== 更新协议内容 ===");
        console.log("内容长度:", content ? content.length : 0);
        
        if (this._agreementContentLabel && content) {
            this._agreementContentLabel.string = content;
            
            // 强制更新 Label 渲染
            this._agreementContentLabel._updateRenderData(true);
            
            // 延迟等待 Label 更新后获取实际高度
            var self = this;
            this.scheduleOnce(function() {
                if (self._agreementContentLabel && self._agreementContentNode) {
                    // 获取 Label 实际渲染高度
                    var labelNode = self._agreementContentLabel.node;
                    var labelHeight = labelNode.height;
                    
                    console.log("Label 节点高度:", labelHeight);
                    
                    // 更新 content 节点高度（比 label 高度多一点边距）
                    var contentHeight = Math.max(320, labelHeight + 50);
                    self._agreementContentNode.setContentSize(cc.size(720, contentHeight));
                    
                    console.log("Content 高度:", contentHeight);
                    console.log("Content 节点:", self._agreementContentNode.width, "x", self._agreementContentNode.height);
                }
            }, 0.15);
            
            console.log("协议内容已更新");
        }
    },

    // 显示默认协议内容
    _showDefaultAgreementContent: function() {
        console.log("=== 显示默认协议内容 ===");

        if (this._agreementContentLabel) {
            var defaultContent = "欢迎使用本游戏！\n\n" +
                "在使用本游戏前，请您仔细阅读并理解本用户协议的全部内容。\n\n" +
                "【服务条款】\n" +
                "本游戏提供的服务仅供个人娱乐使用，不得用于商业目的。\n\n" +
                "【用户行为规范】\n" +
                "用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n" +
                "【知识产权】\n" +
                "本游戏的所有内容（包括但不限于文字、图片、音频、视频等）均受知识产权法律保护。\n\n" +
                "【免责声明】\n" +
                "本游戏不对因网络原因导致的服务中断承担责任。\n\n" +
                "点击「我知道了」按钮即表示您已阅读并同意本协议的全部内容。";

            this._agreementContentLabel.string = defaultContent;
            
            // 强制更新 Label 渲染
            this._agreementContentLabel._updateRenderData(true);

            // 延迟调整容器高度
            var self = this;
            this.scheduleOnce(function() {
                if (self._agreementContentLabel && self._agreementContentNode) {
                    var labelNode = self._agreementContentLabel.node;
                    var labelHeight = labelNode.height;
                    
                    console.log("默认内容 Label 高度:", labelHeight);
                    
                    var contentHeight = Math.max(320, labelHeight + 50);
                    self._agreementContentNode.setContentSize(cc.size(720, contentHeight));
                }
            }, 0.15);
        }
    },

    _onCloseUserAgreement: function() {
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
            this._agreementContentLabel = null;
            this._agreementContentNode = null;
            this._agreementLabelNode = null;
        }
    }
});
