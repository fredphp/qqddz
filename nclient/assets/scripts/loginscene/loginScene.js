// 登录场景控制器
// 使用全局变量，不使用 require

cc.Class({
    extends: cc.Component,

    properties: {
        wait_node: {
            type: cc.Node,
            default: null
        },
        user_agreement_prefabs: {
            type: cc.Prefab,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("loginScene onLoad 开始");

        this._loginType = 'wx';
        this._isChecked = false;

        this._initWaitNode();

        // 延迟初始化复选框，确保场景加载完成
        this.scheduleOnce(function() {
            this._initCheckbox();
        }.bind(this), 0.3);

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

    // 初始化复选框 - 使用项目现有的 check_mark.png 图片
    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");

        var self = this;

        // 获取 agreement_label 的字体大小作为复选框尺寸参考
        var agreementLabel = this.node.getChildByName("agreement_label");
        var fontSize = 16; // 默认值
        if (agreementLabel) {
            var label = agreementLabel.getComponent(cc.Label);
            if (label) {
                fontSize = label.fontSize;
            }
        }
        
        // 复选框尺寸 = 字体大小
        var checkboxSize = fontSize;
        console.log("复选框尺寸:", checkboxSize);

        // 获取 check_mark 节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }

        // 设置节点尺寸
        checkMarkNode.width = checkboxSize;
        checkMarkNode.height = checkboxSize;

        // 移除旧的 Label 组件（如果存在）
        var oldLabel = checkMarkNode.getComponent(cc.Label);
        if (oldLabel) {
            checkMarkNode.removeComponent(oldLabel);
        }

        // 保存节点引用
        this._checkMarkNode = checkMarkNode;
        this._checkboxSize = checkboxSize;

        // 加载 check_mark 图片资源
        cc.resources.load("UI/check_mark", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载 check_mark 图片失败:", err);
                // 使用备用方案
                self._createFallbackCheckbox(checkMarkNode, checkboxSize);
                return;
            }
            
            console.log("check_mark 图片加载成功");
            self._setupCheckboxWithSprite(checkMarkNode, checkboxSize, spriteFrame);
        });
    },

    // 使用加载的 SpriteFrame 设置复选框
    _setupCheckboxWithSprite: function(checkMarkNode, checkboxSize, checkSpriteFrame) {
        var self = this;

        // 移除旧的组件
        var oldButton = checkMarkNode.getComponent(cc.Button);
        if (oldButton) {
            checkMarkNode.removeComponent(oldButton);
        }
        var oldToggle = checkMarkNode.getComponent(cc.Toggle);
        if (oldToggle) {
            checkMarkNode.removeComponent(oldToggle);
        }

        // 添加背景 Sprite（未选中状态显示方框）
        var bgSprite = checkMarkNode.getComponent(cc.Sprite);
        if (!bgSprite) {
            bgSprite = checkMarkNode.addComponent(cc.Sprite);
        }
        
        // 创建简单的白色方块作为背景
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgSprite.type = cc.Sprite.Type.SLICED;
        
        // 用 check_mark 图片作为背景（缩小显示）
        bgSprite.spriteFrame = checkSpriteFrame;
        
        // 设置为半透明白色
        checkMarkNode.color = new cc.Color(255, 255, 255, 200);

        // 检查子节点
        var checkmarkChild = null;
        if (checkMarkNode._children && checkMarkNode._children.length > 0) {
            checkmarkChild = checkMarkNode._children[0];
        }
        
        // 如果没有子节点，创建一个用于显示勾选状态
        if (!checkmarkChild) {
            checkmarkChild = new cc.Node("checkmark");
            checkmarkChild.parent = checkMarkNode;
        }
        
        // 设置勾选图标的尺寸
        checkmarkChild.width = checkboxSize - 2;
        checkmarkChild.height = checkboxSize - 2;
        checkmarkChild.x = 0;
        checkmarkChild.y = 0;
        
        // 为勾选图标添加 Sprite
        var checkSprite = checkmarkChild.getComponent(cc.Sprite);
        if (!checkSprite) {
            checkSprite = checkmarkChild.addComponent(cc.Sprite);
        }
        
        // 使用同一个图片，但设置为绿色表示选中
        checkSprite.spriteFrame = checkSpriteFrame;
        checkSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        checkSprite.type = cc.Sprite.Type.SLICED;
        
        // 设置绿色
        checkmarkChild.color = new cc.Color(0, 255, 0, 255);
        
        // 默认隐藏
        checkmarkChild.active = false;

        // 添加 Toggle 组件
        var toggle = checkMarkNode.addComponent(cc.Toggle);
        toggle.isChecked = false;
        toggle.checkMark = checkSprite;
        this._toggle = toggle;
        this._isChecked = false;
        this._checkmarkChild = checkmarkChild;

        // 添加 Toggle 事件
        toggle.checkEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onToggleChange";
        handler.customEventData = "";
        toggle.checkEvents.push(handler);

        // 创建点击区域
        this._createClickArea(checkboxSize);

        console.log("=== 复选框初始化完成 ===");
    },

    // 备用方案 - 如果加载图片失败
    _createFallbackCheckbox: function(checkMarkNode, checkboxSize) {
        console.log("使用备用方案创建复选框");
        
        var self = this;

        // 移除旧的组件
        var oldButton = checkMarkNode.getComponent(cc.Button);
        if (oldButton) {
            checkMarkNode.removeComponent(oldButton);
        }
        var oldToggle = checkMarkNode.getComponent(cc.Toggle);
        if (oldToggle) {
            checkMarkNode.removeComponent(oldToggle);
        }

        // 使用 Label 显示复选框
        var label = checkMarkNode.getComponent(cc.Label);
        if (!label) {
            label = checkMarkNode.addComponent(cc.Label);
        }
        
        label.string = "☐";
        label.fontSize = checkboxSize;
        label.lineHeight = checkboxSize;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        
        // 创建一个子节点显示选中状态
        var checkChild = new cc.Node("check_label");
        checkChild.parent = checkMarkNode;
        checkChild.x = 0;
        checkChild.y = 0;
        
        var checkLabel = checkChild.addComponent(cc.Label);
        checkLabel.string = "✓";
        checkLabel.fontSize = checkboxSize - 2;
        checkLabel.lineHeight = checkboxSize;
        checkLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        checkLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        checkLabel.color = new cc.Color(0, 255, 0, 255);
        checkChild.active = false;
        
        this._checkboxLabel = label;
        this._checkLabel = checkChild;

        // 添加 Button 组件处理点击
        var button = checkMarkNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        button.clickEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onCheckboxClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);

        this._checkMarkNode = checkMarkNode;
        this._checkboxSize = checkboxSize;

        // 创建点击区域
        this._createClickArea(checkboxSize);

        console.log("=== 备用复选框初始化完成 ===");
    },

    // 备用方案的点击处理
    _onCheckboxClick: function() {
        this._isChecked = !this._isChecked;
        
        if (this._checkboxLabel) {
            this._checkboxLabel.string = this._isChecked ? "☑" : "☐";
        }
        
        if (this._checkLabel) {
            this._checkLabel.active = false; // 使用 ☐/☑ 代替
        }
        
        console.log("复选框状态:", this._isChecked ? "选中" : "未选中");
    },

    // 创建点击区域（让整个协议区域可点击）
    _createClickArea: function(checkboxSize) {
        // 删除旧的点击区域
        if (this._clickArea) {
            this._clickArea.destroy();
            this._clickArea = null;
        }

        var self = this;

        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;
        clickArea.x = -85;
        clickArea.y = -280;
        clickArea.width = 200;
        clickArea.height = 40;

        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        // 透明背景
        var texture = new cc.Texture2D();
        texture.initWithData(new Uint8Array([255, 255, 255, 1]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        texture.handleLoadedTexture();
        sprite.spriteFrame = new cc.SpriteFrame(texture);

        var button = clickArea.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;

        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onAreaClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);

        this._clickArea = clickArea;
    },

    // Toggle 状态变化回调
    _onToggleChange: function(toggle) {
        this._isChecked = toggle.isChecked;
        
        // 更新勾选标记显示
        if (this._checkmarkChild) {
            this._checkmarkChild.active = toggle.isChecked;
        }
        
        console.log("Toggle 状态:", this._isChecked ? "选中" : "未选中");
    },

    // 点击区域回调
    _onAreaClick: function() {
        if (this._toggle) {
            this._toggle.isChecked = !this._toggle.isChecked;
            this._onToggleChange(this._toggle);
        } else if (this._checkboxLabel) {
            // 备用方案
            this._onCheckboxClick();
        }
    },

    start () {
        console.log("loginScene start");

        this.scheduleOnce(function() {
            this._initLoginButtons();
            this._initUserAgreementLink();
        }.bind(this), 0.1);
    },

    _initLoginButtons: function() {
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
                handler.handler = "_onUserAgreementClick";
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

    _onUserAgreementClick: function() {
        this._showUserAgreement();
    },

    _checkAgreement: function() {
        return this._isChecked;
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
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }
        this._showError("手机号登录功能暂未开放");
    },

    _showUserAgreement: function() {
        var self = this;

        if (this.user_agreement_prefabs) {
            this._createUserAgreementPopup(this.user_agreement_prefabs);
        } else {
            cc.resources.load("prefabs/user_agreement", cc.Prefab, function(err, prefab) {
                if (err) {
                    self._showError("无法显示用户协议");
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
            }

            this._userAgreementPopup = popup;
        } catch (e) {
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
