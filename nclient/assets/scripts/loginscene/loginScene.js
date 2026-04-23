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

    // 初始化复选框
    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");

        var self = this;

        // 获取现有的节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        var agreementLabel = this.node.getChildByName("agreement_label");
        var checkboxBorder = this.node.getChildByName("checkbox_border");

        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }

        this._checkMarkNode = checkMarkNode;
        this._agreementLabel = agreementLabel;
        this._checkboxBorder = checkboxBorder;

        console.log("check_mark 位置:", checkMarkNode.x, checkMarkNode.y);
        console.log("checkbox_border 节点:", checkboxBorder ? "存在" : "不存在");

        // 如果场景中没有边框节点，动态创建
        if (!checkboxBorder) {
            checkboxBorder = this._createBorderNode(checkMarkNode);
            this._checkboxBorder = checkboxBorder;
        }

        // 初始状态：隐藏对勾
        checkMarkNode.opacity = 0;
        console.log("初始状态：对勾隐藏");

        // 设置点击事件 - 给多个节点添加点击
        this._setupClickEvents(checkMarkNode, agreementLabel, checkboxBorder);

        console.log("=== 复选框初始化完成 ===");
    },

    // 创建边框节点
    _createBorderNode: function(checkMarkNode) {
        console.log("动态创建边框节点...");

        var borderNode = new cc.Node("checkbox_border");
        borderNode.parent = checkMarkNode.parent;

        // 设置位置和大小
        borderNode.x = checkMarkNode.x;
        borderNode.y = checkMarkNode.y;
        borderNode.zIndex = checkMarkNode.zIndex - 1;

        var size = 26;
        borderNode.width = size;
        borderNode.height = size;
        borderNode.anchorX = 0.5;
        borderNode.anchorY = 0.5;

        // 加载一个白色方块图片作为边框
        // 使用 public_ui 或创建纯色
        var sprite = borderNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        // 尝试加载现有资源
        cc.resources.load("UI/joininputBg", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.log("加载边框图片失败，使用纯色:", err);
                // 使用纯色
                borderNode.color = new cc.Color(100, 100, 100);
                return;
            }

            sprite.spriteFrame = spriteFrame;
            sprite.type = cc.Sprite.Type.SLICED;

            // 设置边框颜色
            borderNode.color = new cc.Color(100, 100, 100);
            console.log("边框图片加载成功");
        });

        borderNode.color = new cc.Color(100, 100, 100);

        console.log("边框节点创建完成");
        return borderNode;
    },

    // 设置点击事件
    _setupClickEvents: function(checkMarkNode, agreementLabel, borderNode) {
        console.log("设置点击事件...");

        var self = this;

        // 创建一个大的点击区域
        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;

        // 设置点击区域位置和大小（覆盖复选框和文字）
        clickArea.x = -15;  // check_mark(-150) 和 agreement_label(0) 之间
        clickArea.y = -280;
        clickArea.width = 320;
        clickArea.height = 50;
        clickArea.anchorX = 0.5;
        clickArea.anchorY = 0.5;
        clickArea.zIndex = 100;  // 放在最上层

        // 添加透明背景使其可点击
        var sprite = clickArea.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SLICED;

        // 创建透明纹理
        var texture = new cc.Texture2D();
        texture.initWithData(
            new Uint8Array([255, 255, 255, 0]),  // 完全透明
            cc.Texture2D.PixelFormat.RGBA8888,
            1, 1
        );
        var sf = new cc.SpriteFrame(texture);
        sprite.spriteFrame = sf;

        // 添加 Button 组件
        var button = clickArea.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;
        button.interactable = true;

        // 添加点击事件
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onCheckboxClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);

        // 同时添加触摸事件
        clickArea.on(cc.Node.EventType.TOUCH_END, function(event) {
            console.log("click_area TOUCH_END 触发");
            self._toggleCheckbox();
        }, this);

        this._clickArea = clickArea;

        console.log("点击区域创建完成，大小:", clickArea.width, "x", clickArea.height);
    },

    // Button 点击回调
    _onCheckboxClick: function(event) {
        console.log("_onCheckboxClick 被调用");
        this._toggleCheckbox();
    },

    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("=== 复选框状态:", this._isChecked, "===");

        if (this._isChecked) {
            // 选中状态：显示对勾
            this._checkMarkNode.opacity = 255;
            console.log("对勾显示");

            // 边框变绿色
            if (this._checkboxBorder) {
                this._checkboxBorder.color = new cc.Color(0, 180, 0);
            }
        } else {
            // 未选中状态：隐藏对勾
            this._checkMarkNode.opacity = 0;
            console.log("对勾隐藏");

            // 边框恢复灰色
            if (this._checkboxBorder) {
                this._checkboxBorder.color = new cc.Color(100, 100, 100);
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

            // 添加触摸事件
            linkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("user_agreement_link TOUCH_END 触发");
                self._showUserAgreement();
                event.stopPropagation();
            }, this);

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
