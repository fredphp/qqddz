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

    // 创建简单的纯色纹理
    _createSolidTexture: function(width, height, r, g, b, a) {
        var texture = new cc.Texture2D();
        var data = new Uint8Array(width * height * 4);

        for (var i = 0; i < width * height; i++) {
            data[i * 4] = r;
            data[i * 4 + 1] = g;
            data[i * 4 + 2] = b;
            data[i * 4 + 3] = a;
        }

        texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, width, height);
        texture.handleLoadedTexture();
        return texture;
    },

    // 创建边框纹理
    _createBorderTexture: function(size, borderWidth, r, g, b) {
        var texture = new cc.Texture2D();
        var data = new Uint8Array(size * size * 4);

        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var idx = (y * size + x) * 4;
                // 边框区域
                if (x < borderWidth || x >= size - borderWidth ||
                    y < borderWidth || y >= size - borderWidth) {
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                } else {
                    // 内部透明
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 0;
                }
            }
        }

        texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
        texture.handleLoadedTexture();
        return texture;
    },

    // 初始化复选框（原生 Toggle/CheckBox）
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

        // 获取背景 Sprite，设置边框纹理
        var bgSprite = checkMarkNode.getComponent(cc.Sprite);
        if (bgSprite) {
            // 创建边框纹理（灰色边框）
            var borderTexture = this._createBorderTexture(18, 2, 150, 150, 150);
            bgSprite.spriteFrame = new cc.SpriteFrame(borderTexture);
            bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            this._bgSprite = bgSprite;
            console.log("背景边框设置完成");
        }

        // 获取 checkmark 子节点（对勾）
        var checkmarkChild = checkMarkNode.getChildByName("checkmark");
        if (checkmarkChild) {
            this._checkmarkChild = checkmarkChild;
            // 设置对勾大小和颜色
            checkmarkChild.width = 14;
            checkmarkChild.height = 14;
            checkmarkChild.active = false;  // 默认隐藏
        }

        // 获取 Toggle 组件
        var toggle = checkMarkNode.getComponent(cc.Toggle);
        if (!toggle) {
            console.log("Toggle 组件未找到，动态添加");
            toggle = checkMarkNode.addComponent(cc.Toggle);
        }

        toggle.isChecked = false;  // 默认不选中
        this._toggle = toggle;
        this._isChecked = false;

        // 添加 Toggle 事件
        toggle.checkEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onToggleChange";
        handler.customEventData = "";
        toggle.checkEvents.push(handler);

        // 禁用 Button 组件（如果存在）
        var button = checkMarkNode.getComponent(cc.Button);
        if (button) {
            button.interactable = false;
        }

        // 禁用 agreement_label 的 Button
        var agreementLabel = this.node.getChildByName("agreement_label");
        if (agreementLabel) {
            var btn = agreementLabel.getComponent(cc.Button);
            if (btn) btn.interactable = false;
        }

        // 创建点击区域（覆盖整个"我已阅读并同意《用户协议》"文字区域）
        this._createClickArea();

        console.log("=== 复选框初始化完成，状态: 未选中 ===");
    },

    // 创建点击区域
    _createClickArea: function() {
        var self = this;

        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;
        clickArea.x = -85;  // 复选框中心位置
        clickArea.y = -280;
        clickArea.width = 200;
        clickArea.height = 40;

        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        var texture = this._createSolidTexture(1, 1, 255, 255, 255, 1);
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
        console.log("Toggle 状态:", this._isChecked ? "选中" : "未选中");
        this._updateCheckboxState(this._isChecked);
    },

    // 点击区域回调
    _onAreaClick: function() {
        if (this._toggle) {
            this._toggle.isChecked = !this._toggle.isChecked;
            this._isChecked = this._toggle.isChecked;
            this._updateCheckboxState(this._isChecked);
            console.log("点击区域触发，状态:", this._isChecked ? "选中" : "未选中");
        }
    },

    // 更新复选框状态
    _updateCheckboxState: function(isChecked) {
        // 更新边框颜色
        if (this._bgSprite) {
            var r = isChecked ? 0 : 150;
            var g = isChecked ? 180 : 150;
            var b = isChecked ? 0 : 150;
            var texture = this._createBorderTexture(18, 2, r, g, b);
            this._bgSprite.spriteFrame = new cc.SpriteFrame(texture);
        }

        // Toggle 组件会自动管理 checkmark 的显示/隐藏
        // 但我们也需要确保 checkmarkChild 状态同步
        if (this._checkmarkChild) {
            this._checkmarkChild.active = isChecked;
            // 更新对勾颜色
            if (isChecked) {
                this._checkmarkChild.color = new cc.Color(0, 150, 0);
            }
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
