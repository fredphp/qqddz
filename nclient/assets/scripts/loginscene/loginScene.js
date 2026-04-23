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
        }.bind(this), 0.5);

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

    // 初始化复选框
    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");

        var self = this;

        // this.node 就是 ROOT_UI，直接获取子节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        var checkboxBorder = this.node.getChildByName("checkbox_border");
        var agreementLabel = this.node.getChildByName("agreement_label");

        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }

        this._checkMarkNode = checkMarkNode;
        this._checkboxBorder = checkboxBorder;
        this._agreementLabel = agreementLabel;

        console.log("check_mark 节点找到:", checkMarkNode.name);
        console.log("checkbox_border 节点:", checkboxBorder ? checkboxBorder.name : "不存在");
        console.log("agreement_label 节点:", agreementLabel ? agreementLabel.name : "不存在");

        // 获取边框的 Label 组件
        if (checkboxBorder) {
            this._borderLabel = checkboxBorder.getComponent(cc.Label);
            if (this._borderLabel) {
                // 设置初始边框为灰色方框
                this._borderLabel.string = "□";
                this._borderLabel.fontSize = 28;
                this._borderLabel.node.color = new cc.Color(150, 150, 150);
                console.log("边框 Label 设置完成: □");
            }
        }

        // 初始状态：隐藏对勾 (使用 Sprite)
        var sprite = checkMarkNode.getComponent(cc.Sprite);
        if (sprite) {
            sprite.enabled = false;  // 初始隐藏 Sprite
            this._checkMarkSprite = sprite;
            console.log("check_mark Sprite 初始隐藏");
        }

        // 禁用 check_mark 上现有的 Button 组件
        var checkMarkButton = checkMarkNode.getComponent(cc.Button);
        if (checkMarkButton) {
            checkMarkButton.interactable = false;
            console.log("禁用 check_mark 的 Button 组件");
        }

        // 禁用 agreement_label 上现有的 Button 组件（防止拦截点击）
        if (agreementLabel) {
            var agreementButton = agreementLabel.getComponent(cc.Button);
            if (agreementButton) {
                agreementButton.interactable = false;
                console.log("禁用 agreement_label 的 Button 组件");
            }
        }

        // 设置点击事件
        this._setupCheckboxEvents();

        console.log("=== 复选框初始化完成 ===");
    },

    // 设置复选框点击事件
    _setupCheckboxEvents: function() {
        console.log("设置复选框点击事件...");

        var self = this;

        // 创建一个透明的点击区域覆盖整个复选框区域
        // 位置计算: check_mark 在 x=-150, agreement_label 在 x=0
        // 点击区域应该在它们中间

        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;

        // 设置位置 (覆盖 check_mark 到 agreement_label 区域)
        // check_mark.x = -150, agreement_label.x = 0
        // 点击区域中心大约在 -75
        clickArea.x = -90;
        clickArea.y = -280;
        clickArea.width = 220;  // 从 -150 到 70 左右
        clickArea.height = 50;
        clickArea.anchorX = 0.5;
        clickArea.anchorY = 0.5;

        // 设置层级为最高
        clickArea.setSiblingIndex(this.node.children.length - 1);
        clickArea.zIndex = 9999;

        // 添加一个透明的 Sprite 组件使节点可点击
        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SLICED;

        // 创建一个透明的精灵帧
        var texture = new cc.Texture2D();
        texture.initWithData(
            new Uint8Array([255, 255, 255, 1]),  // 几乎透明，但不是完全透明
            cc.Texture2D.PixelFormat.RGBA8888,
            1, 1
        );
        texture.handleLoadedTexture();
        var sf = new cc.SpriteFrame(texture);
        sprite.spriteFrame = sf;

        // 添加 BlockInputEvents 组件防止事件穿透
        var blockInput = clickArea.addComponent(cc.BlockInputEvents);
        console.log("BlockInputEvents 组件添加完成");

        // 添加触摸事件
        clickArea.on(cc.Node.EventType.TOUCH_START, function(event) {
            console.log("checkbox_click_area TOUCH_START");
            event.stopPropagation();
        }, this);

        clickArea.on(cc.Node.EventType.TOUCH_END, function(event) {
            console.log("checkbox_click_area TOUCH_END 触发 - 切换复选框");
            self._toggleCheckbox();
            event.stopPropagation();
        }, this);

        // 同时添加 TOGGLE 事件
        clickArea.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            console.log("checkbox_click_area TOUCH_CANCEL");
            event.stopPropagation();
        }, this);

        this._clickArea = clickArea;

        console.log("点击区域创建完成，位置: (" + clickArea.x + ", " + clickArea.y + "), 大小: " + clickArea.width + "x" + clickArea.height);
        console.log("点击区域 zIndex:", clickArea.zIndex);
    },

    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("=== 复选框状态切换:", this._isChecked, "===");

        if (this._isChecked) {
            // 选中状态：显示对勾
            if (this._checkMarkSprite) {
                this._checkMarkSprite.enabled = true;
                console.log("对勾 Sprite 显示");
            }

            // 边框变成绿色选中状态（显示勾选符号）
            if (this._borderLabel) {
                this._borderLabel.string = "☑";
                this._borderLabel.node.color = new cc.Color(0, 180, 0);
                console.log("边框变为: ☑ 绿色");
            }
        } else {
            // 未选中状态：隐藏对勾
            if (this._checkMarkSprite) {
                this._checkMarkSprite.enabled = false;
                console.log("对勾 Sprite 隐藏");
            }

            // 边框恢复灰色方框
            if (this._borderLabel) {
                this._borderLabel.string = "□";
                this._borderLabel.node.color = new cc.Color(150, 150, 150);
                console.log("边框变为: □ 灰色");
            }
        }
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

            // 添加触摸事件
            linkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("user_agreement_link TOUCH_END 触发");
                self._showUserAgreement();
                event.stopPropagation();
            }, this);

            console.log("用户协议链接初始化完成");
        }

        // 在 "用户协议" 文字上添加点击事件
        // 由于 agreement_label 已禁用 Button，我们需要直接处理触摸
        if (this._agreementLabel) {
            // 创建一个专门用于点击"用户协议"文字的区域
            // "《用户协议》" 大约从 x=-40 开始
            var agreementLinkArea = new cc.Node("agreement_link_area");
            agreementLinkArea.parent = this.node;

            agreementLinkArea.x = 40;  // 大约在"《用户协议》"的位置
            agreementLinkArea.y = -280;
            agreementLinkArea.width = 90;   // 覆盖"《用户协议》"文字
            agreementLinkArea.height = 40;
            agreementLinkArea.anchorX = 0.5;
            agreementLinkArea.anchorY = 0.5;
            agreementLinkArea.zIndex = 10000;  // 比 checkbox_click_area 更高

            // 添加透明 Sprite
            var sprite = agreementLinkArea.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            var texture = new cc.Texture2D();
            texture.initWithData(
                new Uint8Array([255, 255, 255, 1]),
                cc.Texture2D.PixelFormat.RGBA8888,
                1, 1
            );
            texture.handleLoadedTexture();
            var sf = new cc.SpriteFrame(texture);
            sprite.spriteFrame = sf;

            // 添加触摸事件
            agreementLinkArea.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("agreement_link_area TOUCH_END 触发");
                self._showUserAgreement();
                event.stopPropagation();
            }, this);

            console.log("用户协议链接点击区域创建完成");
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
