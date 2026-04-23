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

    // 初始化复选框 - 使用 cc.Toggle 和 Sprite
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

        // 获取背景 Sprite 组件
        var bgSprite = checkMarkNode.getComponent(cc.Sprite);
        if (!bgSprite) {
            console.error("背景 Sprite 组件未找到");
            return;
        }

        // 获取 checkmark 子节点
        var checkmarkChild = checkMarkNode.getChildByName("checkmark");
        if (!checkmarkChild) {
            console.error("checkmark 子节点未找到");
            return;
        }

        // 设置 checkmark 子节点尺寸（比背景稍小）
        checkmarkChild.width = checkboxSize - 2;
        checkmarkChild.height = checkboxSize - 2;

        // 获取 checkmark 的 Sprite 组件
        var checkSprite = checkmarkChild.getComponent(cc.Sprite);
        if (!checkSprite) {
            console.error("checkmark Sprite 组件未找到");
            return;
        }

        // 获取 Toggle 组件
        var toggle = checkMarkNode.getComponent(cc.Toggle);
        if (!toggle) {
            console.error("Toggle 组件未找到");
            return;
        }

        // 确保 Toggle 的 checkMark 指向正确的 Sprite
        toggle.checkMark = checkSprite;
        toggle.isChecked = false;

        // 保存引用
        this._toggle = toggle;
        this._checkMarkNode = checkMarkNode;
        this._checkmarkChild = checkmarkChild;
        this._bgSprite = bgSprite;
        this._checkSprite = checkSprite;
        this._checkboxSize = checkboxSize;
        this._isChecked = false;

        // 加载 check_mark 图片资源
        cc.resources.load("UI/check_mark", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载 check_mark 图片失败:", err);
                return;
            }
            
            console.log("check_mark 图片加载成功");
            
            // 设置背景 Sprite - 使用图片显示边框效果
            bgSprite.spriteFrame = spriteFrame;
            bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            checkMarkNode.color = new cc.Color(200, 200, 200, 255); // 浅灰色背景
            
            // 设置 checkmark Sprite - 使用同一图片，绿色表示选中
            checkSprite.spriteFrame = spriteFrame;
            checkSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            checkmarkChild.color = new cc.Color(0, 200, 0, 255); // 绿色勾选
            
            // 初始状态：未选中，checkmark 隐藏（Toggle 会自动控制）
            checkmarkChild.active = false;
            toggle.isChecked = false;
            
            // 添加 Toggle 事件
            toggle.checkEvents = [];
            var handler = new cc.Component.EventHandler();
            handler.target = self.node;
            handler.component = "loginScene";
            handler.handler = "_onToggleChange";
            handler.customEventData = "";
            toggle.checkEvents.push(handler);

            console.log("=== 复选框初始化完成 ===");
        });

        // 让整个协议文字区域也可点击切换复选框
        this._setupAgreementClickArea(checkMarkNode, checkboxSize);
    },

    // 设置协议区域的点击响应
    _setupAgreementClickArea: function(checkMarkNode, checkboxSize) {
        var self = this;
        
        // 为 agreement_label 添加点击响应
        var agreementLabel = this.node.getChildByName("agreement_label");
        if (agreementLabel) {
            // 检查是否已有 Button 组件
            var btn = agreementLabel.getComponent(cc.Button);
            if (!btn) {
                btn = agreementLabel.addComponent(cc.Button);
            }
            
            btn.transition = cc.Button.Transition.NONE;
            btn.interactable = true;
            
            btn.clickEvents = [];
            var handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "loginScene";
            handler.handler = "_onAgreementLabelClick";
            handler.customEventData = "";
            btn.clickEvents.push(handler);
        }
    },

    // 点击协议文字区域时切换复选框
    _onAgreementLabelClick: function() {
        if (this._toggle) {
            this._toggle.isChecked = !this._toggle.isChecked;
            this._isChecked = this._toggle.isChecked;
            console.log("协议区域点击，复选框状态:", this._isChecked ? "选中" : "未选中");
        }
    },

    // Toggle 状态变化回调
    _onToggleChange: function(toggle) {
        this._isChecked = toggle.isChecked;
        console.log("Toggle 状态:", this._isChecked ? "选中" : "未选中");
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
