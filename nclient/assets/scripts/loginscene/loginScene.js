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

        // 当前登录方式: 'wx' 或 'phone'
        this._loginType = 'wx';

        // 勾选状态 - 默认不勾选
        this._isChecked = false;

        // 初始化 wait_node 功能
        this._initWaitNode();

        // 延迟初始化复选框，确保场景完全加载
        this.scheduleOnce(function() {
            this._initCheckbox();
        }.bind(this), 0.3);

        // 确保 myglobal 存在
        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }

        this._initAndStart();
    },

    // 初始化 wait_node 功能
    _initWaitNode: function() {
        if (this.wait_node) {
            // 查找 loading_image 子节点
            this._loadingImage = this.wait_node.getChildByName("loading_image");

            // 查找 lblcontent_Label 子节点
            var lblNode = this.wait_node.getChildByName("lblcontent_Label");
            if (lblNode) {
                this._waitLabel = lblNode.getComponent(cc.Label);
            }

            // 初始隐藏
            this.wait_node.active = false;

            console.log("wait_node 初始化完成");
        }
    },

    // 创建边框纹理
    _createBorderTexture: function(size, borderWidth, r, g, b) {
        var texture = new cc.Texture2D();
        var data = new Uint8Array(size * size * 4);

        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var idx = (y * size + x) * 4;
                if (x < borderWidth || x >= size - borderWidth ||
                    y < borderWidth || y >= size - borderWidth) {
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                } else {
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

    // 初始化复选框（使用原生 cc.Toggle）
    _initCheckbox: function() {
        console.log("=== 初始化复选框（原生 Toggle）===");

        var self = this;

        // 隐藏原有的节点
        var oldCheckMark = this.node.getChildByName("check_mark");
        var oldBorder = this.node.getChildByName("checkbox_border");
        var oldAgreementLabel = this.node.getChildByName("agreement_label");

        if (oldCheckMark) {
            oldCheckMark.active = false;
        }
        if (oldBorder) {
            oldBorder.active = false;
        }

        // === 创建 Toggle 节点 ===
        var toggleNode = new cc.Node("checkbox_toggle");
        toggleNode.parent = this.node;
        toggleNode.x = -150;
        toggleNode.y = -280;
        toggleNode.width = 28;
        toggleNode.height = 28;

        // 添加背景 Sprite
        var bgSprite = toggleNode.addComponent(cc.Sprite);
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgSprite.type = cc.Sprite.Type.SIMPLE;

        // 设置背景边框
        var grayTexture = this._createBorderTexture(28, 2, 150, 150, 150);
        bgSprite.spriteFrame = new cc.SpriteFrame(grayTexture);
        this._bgSprite = bgSprite;

        // 添加 Button 组件
        var button = toggleNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 0.9;

        // === 创建对勾节点 ===
        var checkMarkNode = new cc.Node("checkmark");
        checkMarkNode.parent = toggleNode;

        var checkSprite = checkMarkNode.addComponent(cc.Sprite);
        checkSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        checkSprite.node.width = 24;
        checkSprite.node.height = 24;

        // 加载对勾图片
        cc.resources.load("UI/check_mark", cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                checkSprite.spriteFrame = spriteFrame;
                console.log("check_mark 图片加载成功");
            }
        });

        // === 添加 Toggle 组件 ===
        var toggle = toggleNode.addComponent(cc.Toggle);
        toggle.isChecked = false;  // 默认不选中
        toggle.checkMark = checkSprite;  // Toggle 会自动管理这个 Sprite 的显示/隐藏

        // 添加点击事件
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onToggleChange";
        handler.customEventData = "";
        toggle.checkEvents.push(handler);

        this._toggle = toggle;
        this._toggleNode = toggleNode;

        // 禁用 agreement_label 的 Button
        if (oldAgreementLabel) {
            var btn = oldAgreementLabel.getComponent(cc.Button);
            if (btn) btn.interactable = false;
        }
        this._oldAgreementLabel = oldAgreementLabel;

        // 创建点击区域
        this._createClickArea();

        console.log("=== 复选框初始化完成，默认: 未选中 ===");
    },

    // 创建点击区域
    _createClickArea: function() {
        var self = this;

        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;
        clickArea.x = -90;
        clickArea.y = -280;
        clickArea.width = 220;
        clickArea.height = 50;

        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

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
        console.log("Toggle 状态:", this._isChecked ? "选中" : "未选中");
        this._updateBorderColor(this._isChecked);
    },

    // 点击区域回调
    _onAreaClick: function() {
        if (this._toggle) {
            // 切换 Toggle 状态
            this._toggle.isChecked = !this._toggle.isChecked;
            this._isChecked = this._toggle.isChecked;
            this._updateBorderColor(this._isChecked);
            console.log("点击区域触发，状态:", this._isChecked ? "选中" : "未选中");
        }
    },

    // 更新边框颜色
    _updateBorderColor: function(isChecked) {
        var r = isChecked ? 0 : 150;
        var g = isChecked ? 180 : 150;
        var b = isChecked ? 0 : 150;

        var texture = this._createBorderTexture(28, 2, r, g, b);
        if (this._bgSprite) {
            this._bgSprite.spriteFrame = new cc.SpriteFrame(texture);
        }
    },

    start () {
        console.log("loginScene start");

        this.scheduleOnce(function() {
            this._initLoginButtons();
            this._initUserAgreementLink();
        }.bind(this), 0.1);
    },

    // 初始化登录按钮
    _initLoginButtons: function() {
        console.log("初始化登录按钮...");

        // 微信登录按钮
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

        // 手机号登录按钮
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

    // 初始化用户协议链接
    _initUserAgreementLink: function() {
        console.log("初始化用户协议链接...");

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

    // 微信登录点击回调
    _onWxLoginClick: function() {
        this._doWxLogin();
    },

    // 手机号登录点击回调
    _onPhoneLoginClick: function() {
        this._doPhoneLogin();
    },

    // 用户协议点击回调
    _onUserAgreementClick: function() {
        this._showUserAgreement();
    },

    // 检查是否同意用户协议
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

        // 播放背景音乐
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

    _updateLoginUI: function() {},

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
