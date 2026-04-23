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
            console.log("隐藏原有 check_mark 节点");
        }
        if (oldBorder) {
            oldBorder.active = false;
            console.log("隐藏原有 checkbox_border 节点");
        }

        // 创建 Toggle 节点
        var toggleNode = new cc.Node("checkbox_toggle");
        toggleNode.parent = this.node;
        toggleNode.x = -150;
        toggleNode.y = -280;
        toggleNode.width = 28;
        toggleNode.height = 28;

        // 添加 Sprite 组件作为背景
        var bgSprite = toggleNode.addComponent(cc.Sprite);
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgSprite.type = cc.Sprite.Type.SLICED;

        // 创建背景纹理（带边框）
        var bgTexture = this._createBorderTexture(28, 2, 150, 150, 150);
        var bgSpriteFrame = new cc.SpriteFrame(bgTexture);
        bgSprite.spriteFrame = bgSpriteFrame;

        // 添加 Button 组件
        var button = toggleNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.COLOR;
        button.normalColor = new cc.Color(255, 255, 255);
        button.pressedColor = new cc.Color(200, 200, 200);
        button.hoverColor = new cc.Color(255, 255, 255);
        button.disabledColor = new cc.Color(120, 120, 120);

        // 创建对勾节点
        var checkMarkNode = new cc.Node("checkmark");
        checkMarkNode.parent = toggleNode;
        checkMarkNode.x = 0;
        checkMarkNode.y = 0;

        // 添加对勾 Sprite
        var checkSprite = checkMarkNode.addComponent(cc.Sprite);
        checkSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        checkSprite.type = cc.Sprite.Type.SIMPLE;

        // 加载对勾图片
        cc.resources.load("UI/check_mark", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.log("加载 check_mark 图片失败:", err);
                // 使用备选方案：用文字 ✓
                return;
            }
            checkSprite.spriteFrame = spriteFrame;
            checkSprite.node.width = 22;
            checkSprite.node.height = 22;
            console.log("check_mark 图片加载成功");
        });

        // 初始隐藏对勾
        checkMarkNode.active = false;

        // 添加 Toggle 组件
        var toggle = toggleNode.addComponent(cc.Toggle);
        toggle.isChecked = false;  // 默认不选中
        toggle.checkMark = checkSprite;  // 设置对勾 Sprite

        // 添加 Toggle 点击事件
        var toggleHandler = new cc.Component.EventHandler();
        toggleHandler.target = this.node;
        toggleHandler.component = "loginScene";
        toggleHandler.handler = "_onToggleClick";
        toggleHandler.customEventData = "";
        toggle.checkEvents.push(toggleHandler);

        this._toggleNode = toggleNode;
        this._toggle = toggle;
        this._checkMarkNode = checkMarkNode;
        this._bgSprite = bgSprite;
        this._oldAgreementLabel = oldAgreementLabel;

        // 禁用 agreement_label 上的 Button 组件
        if (oldAgreementLabel) {
            var agreementButton = oldAgreementLabel.getComponent(cc.Button);
            if (agreementButton) {
                agreementButton.interactable = false;
            }
        }

        // 创建点击区域覆盖整个"我已阅读并同意《用户协议》"文字
        this._createClickArea();

        console.log("=== 复选框初始化完成，默认状态: 未选中 ===");
    },

    // 创建边框纹理
    _createBorderTexture: function(size, borderWidth, r, g, b) {
        var texture = new cc.Texture2D();
        var data = new Uint8Array(size * size * 4);

        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var idx = (y * size + x) * 4;
                // 检查是否在边框区域
                if (x < borderWidth || x >= size - borderWidth ||
                    y < borderWidth || y >= size - borderWidth) {
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                } else {
                    // 内部透明
                    data[idx] = 255;
                    data[idx + 1] = 255;
                    data[idx + 2] = 255;
                    data[idx + 3] = 0;
                }
            }
        }

        texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
        texture.handleLoadedTexture();

        return texture;
    },

    // 创建点击区域
    _createClickArea: function() {
        var self = this;

        // 创建点击区域覆盖整个复选框和文字区域
        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;
        clickArea.x = -90;
        clickArea.y = -280;
        clickArea.width = 220;
        clickArea.height = 50;

        // 添加透明 Sprite
        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SLICED;

        var texture = new cc.Texture2D();
        texture.initWithData(
            new Uint8Array([255, 255, 255, 1]),
            cc.Texture2D.PixelFormat.RGBA8888,
            1, 1
        );
        texture.handleLoadedTexture();
        sprite.spriteFrame = new cc.SpriteFrame(texture);

        // 添加 Button 组件
        var button = clickArea.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;

        // 添加点击事件
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onCheckboxAreaClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);

        this._clickArea = clickArea;

        console.log("点击区域创建完成");
    },

    // Toggle 点击回调
    _onToggleClick: function(toggle) {
        this._isChecked = toggle.isChecked;
        console.log("Toggle 状态变化:", this._isChecked ? "选中" : "未选中");

        // 更新边框颜色
        this._updateBorderColor(this._isChecked);
    },

    // 点击区域回调
    _onCheckboxAreaClick: function() {
        console.log("点击区域被点击");

        // 切换 Toggle 状态
        if (this._toggle) {
            this._toggle.isChecked = !this._toggle.isChecked;
            this._isChecked = this._toggle.isChecked;

            // 显示/隐藏对勾
            if (this._checkMarkNode) {
                this._checkMarkNode.active = this._isChecked;
            }

            // 更新边框颜色
            this._updateBorderColor(this._isChecked);

            console.log("复选框状态切换:", this._isChecked ? "选中" : "未选中");
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

        // 显示/隐藏对勾
        if (this._checkMarkNode) {
            this._checkMarkNode.active = isChecked;
        }

        console.log("边框颜色更新:", isChecked ? "绿色" : "灰色");
    },

    start () {
        console.log("loginScene start");

        // 在 start 中初始化登录按钮
        this.scheduleOnce(function() {
            this._initLoginButtons();
            this._initUserAgreementLink();
        }.bind(this), 0.1);
    },

    // 初始化登录按钮
    _initLoginButtons: function() {
        console.log("初始化登录按钮...");

        var self = this;

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
            console.log("微信登录按钮初始化完成");
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
            console.log("手机号登录按钮初始化完成");
        }
    },

    // 初始化用户协议链接
    _initUserAgreementLink: function() {
        console.log("初始化用户协议链接...");

        var self = this;

        // 获取 user_agreement_link 节点
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            linkNode.active = true;

            // 配置 Button
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

            console.log("用户协议链接初始化完成");
        }
    },

    // 微信登录点击回调
    _onWxLoginClick: function() {
        console.log("_onWxLoginClick 被调用");
        this._doWxLogin();
    },

    // 手机号登录点击回调
    _onPhoneLoginClick: function() {
        console.log("_onPhoneLoginClick 被调用");
        this._doPhoneLogin();
    },

    // 用户协议点击回调
    _onUserAgreementClick: function() {
        console.log("_onUserAgreementClick 被调用");
        this._showUserAgreement();
    },

    // 检查是否同意用户协议
    _checkAgreement: function() {
        return this._isChecked;
    },

    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;

        var checkMyglobal = function() {
            attempts++;
            console.log("等待 myglobal... (第 " + attempts + " 次)");

            if (typeof window.myglobal !== 'undefined') {
                console.log("myglobal 已就绪");
                self._initAndStart();
            } else if (attempts < maxAttempts) {
                setTimeout(checkMyglobal, 100);
            } else {
                console.error("myglobal 加载超时，请刷新页面重试");
                self._showError("加载失败，请刷新页面重试");
            }
        };

        setTimeout(checkMyglobal, 100);
    },

    _initAndStart: function() {
        var myglobal = window.myglobal;
        var isopen_sound = window.isopen_sound || 1;

        // 如果 socket 未初始化，尝试初始化
        if (!myglobal.socket) {
            if (!myglobal.init()) {
                console.error("myglobal 初始化失败");
                this._showError("初始化失败，请刷新页面重试");
                return;
            }
        }

        console.log("loginScene 初始化完成");
        console.log("  - myglobal.socket:", !!myglobal.socket);
        console.log("  - myglobal.playerData:", !!myglobal.playerData);

        // 播放背景音乐
        if (isopen_sound) {
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (err) {
                    console.log("加载背景音乐失败:", err);
                    return;
                }
                try {
                    cc.audioEngine.playMusic(clip, true);
                } catch(e) {
                    console.log("播放背景音乐失败:", e);
                }
            });
        }

        // 初始化 WebSocket 连接
        if (myglobal.socket && myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }

        // 初始化登录方式
        this._updateLoginUI();
    },

    // 显示错误信息
    _showError: function(message) {
        console.error("错误:", message);
        this._showWaitNode(message);

        // 2秒后隐藏
        this.scheduleOnce(function() {
            this._hideWaitNode();
        }, 2);
    },

    // 显示加载中
    _showLoading: function(show, message) {
        if (show) {
            this._showWaitNode(message || "正在处理...");
        } else {
            this._hideWaitNode();
        }
    },

    // 显示 wait_node
    _showWaitNode: function(message) {
        if (this.wait_node) {
            this.wait_node.active = true;

            // 更新文字
            if (this._waitLabel) {
                this._waitLabel.string = message || "正在处理...";
            }

            // 开始旋转动画
            if (this._loadingImage) {
                this._startLoadingAnimation();
            }
        }
    },

    // 隐藏 wait_node
    _hideWaitNode: function() {
        if (this.wait_node) {
            this.wait_node.active = false;
            this._stopLoadingAnimation();
        }
    },

    // 开始加载动画
    _startLoadingAnimation: function() {
        if (this._loadingImage && !this._isAnimating) {
            this._isAnimating = true;
        }
    },

    // 停止加载动画
    _stopLoadingAnimation: function() {
        this._isAnimating = false;
    },

    // 更新函数 - 用于旋转动画
    update: function(dt) {
        if (this._isAnimating && this._loadingImage) {
            this._loadingImage.rotation = this._loadingImage.rotation - dt * 45;
        }
    },

    // 更新登录 UI
    _updateLoginUI: function() {
        // 暂时没有需要更新的 UI
    },

    // 微信登录
    _doWxLogin: function() {
        var self = this;

        // 检查是否同意协议
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }

        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.error("myglobal 或 socket 未初始化");
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
                console.log("登录错误:" + err);
                self._showError("登录失败，请重试");
                return;
            }

            console.log("登录成功" + JSON.stringify(result));
            myglobal.playerData.gobal_count = result.goldcount || 0;
            cc.director.loadScene("hallScene");
        });
    },

    // 手机号登录
    _doPhoneLogin: function() {
        var self = this;

        // 检查是否同意协议
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }

        self._showError("手机号登录功能暂未开放");
    },

    // 显示用户协议弹窗
    _showUserAgreement: function() {
        console.log("_showUserAgreement called");

        var self = this;

        if (this.user_agreement_prefabs) {
            console.log("通过场景属性加载用户协议预制体");
            this._createUserAgreementPopup(this.user_agreement_prefabs);
        } else {
            console.log("尝试动态加载用户协议预制体");
            cc.resources.load("prefabs/user_agreement", cc.Prefab, function(err, prefab) {
                if (err) {
                    console.error("动态加载用户协议预制体失败:", err);
                    self._showError("无法显示用户协议");
                    return;
                }

                self._createUserAgreementPopup(prefab);
            });
        }
    },

    // 创建用户协议弹窗
    _createUserAgreementPopup: function(prefab) {
        try {
            var popup = cc.instantiate(prefab);
            popup.parent = this.node;

            // 获取关闭按钮并添加事件
            var closeBtn = popup.getChildByName("close_btn");
            if (closeBtn) {
                var button = closeBtn.getComponent(cc.Button);
                if (button) {
                    // 清除现有事件
                    button.clickEvents = [];

                    // 添加关闭事件
                    var handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = "loginScene";
                    handler.handler = "_onCloseUserAgreement";
                    handler.customEventData = "";
                    button.clickEvents.push(handler);
                }
            }

            // 保存引用以便关闭
            this._userAgreementPopup = popup;

            console.log("用户协议弹窗创建成功");
        } catch (e) {
            console.error("创建用户协议弹窗失败:", e);
            this._showError("无法显示用户协议");
        }
    },

    // 关闭用户协议弹窗
    _onCloseUserAgreement: function() {
        console.log("关闭用户协议弹窗");
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
        }
    }
});
