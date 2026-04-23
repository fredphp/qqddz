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
        
        // 初始化复选框
        this._initCheckbox();
        
        // 确保 myglobal 存在
        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }
        
        this._initAndStart();
    },
    
    // 初始化复选框
    _initCheckbox: function() {
        var self = this;
        
        // 获取 check_mark 节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        console.log("找到 check_mark 节点");
        this._checkMarkNode = checkMarkNode;
        
        // 创建复选框边框
        this._createCheckboxBorder(checkMarkNode);
        
        // 初始隐藏勾选图标
        var sprite = checkMarkNode.getComponent(cc.Sprite);
        if (sprite) {
            this._checkSprite = sprite;
            sprite.enabled = false;  // 初始不显示勾
        }
        
        // 获取 agreement_label 节点用于点击
        var agreementLabel = this.node.getChildByName("agreement_label");
        if (agreementLabel) {
            this._agreementLabel = agreementLabel;
            console.log("找到 agreement_label 节点");
        }
        
        // 使用 cc.Button 的 EventHandler 来处理点击
        // check_mark 节点上的 Button
        var checkButton = checkMarkNode.getComponent(cc.Button);
        if (checkButton) {
            var handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "loginScene";
            handler.handler = "_onCheckboxClick";
            handler.customEventData = "";
            checkButton.clickEvents.push(handler);
            console.log("check_mark Button 事件已添加");
        }
        
        // agreement_label 节点上的 Button
        if (agreementLabel) {
            var labelButton = agreementLabel.getComponent(cc.Button);
            if (labelButton) {
                var handler1 = new cc.Component.EventHandler();
                handler1.target = this.node;
                handler1.component = "loginScene";
                handler1.handler = "_onCheckboxClick";
                handler1.customEventData = "";
                labelButton.clickEvents.push(handler1);
                console.log("agreement_label Button 事件已添加");
            }
        }
        
        console.log("复选框初始化完成");
    },
    
    // 创建复选框边框
    _createCheckboxBorder: function(checkMarkNode) {
        // 创建边框节点
        var borderNode = new cc.Node("checkbox_border");
        borderNode.parent = checkMarkNode.parent;
        
        // 设置位置在 check_mark 同位置
        borderNode.x = checkMarkNode.x;
        borderNode.y = checkMarkNode.y;
        borderNode.zIndex = checkMarkNode.zIndex - 1;
        
        // 设置大小
        borderNode.width = 26;
        borderNode.height = 26;
        borderNode.anchorX = 0.5;
        borderNode.anchorY = 0.5;
        
        // 添加 Sprite 组件
        var sprite = borderNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SLICED;
        
        // 创建白色纹理作为背景
        var texture = new cc.Texture2D();
        texture.initWithData(new Uint8Array([255, 255, 255, 255]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        var spriteFrame = new cc.SpriteFrame(texture);
        sprite.spriteFrame = spriteFrame;
        
        // 设置边框颜色 (深灰色边框)
        borderNode.color = new cc.Color(120, 120, 120);
        borderNode.opacity = 255;
        
        this._checkboxBorder = borderNode;
        console.log("复选框边框已创建");
    },
    
    // 复选框点击事件
    _onCheckboxClick: function(event) {
        console.log("_onCheckboxClick 被调用");
        this._toggleCheckbox();
    },
    
    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("复选框状态:", this._isChecked);
        
        // 更新勾选图标显示
        if (this._checkSprite) {
            this._checkSprite.enabled = this._isChecked;
        }
        
        // 更新边框颜色
        if (this._checkboxBorder) {
            if (this._isChecked) {
                this._checkboxBorder.color = new cc.Color(0, 180, 0);  // 绿色表示选中
            } else {
                this._checkboxBorder.color = new cc.Color(120, 120, 120);  // 灰色表示未选中
            }
        }
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
        
        // 初始化登录按钮
        this._initLoginButtons();
        
        // 初始化用户协议链接点击
        this._initUserAgreementLink();
    },
    
    // 初始化登录按钮
    _initLoginButtons: function() {
        var self = this;
        
        // 微信登录按钮
        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            var button = wxLoginNode.getComponent(cc.Button);
            if (button) {
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
    
    // 初始化用户协议链接点击
    _initUserAgreementLink: function() {
        var self = this;
        
        // 尝试获取 user_agreement_link 节点
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            linkNode.active = true;  // 激活节点
            var button = linkNode.getComponent(cc.Button);
            if (button) {
                button.clickEvents = [];
                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onUserAgreementClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
            console.log("用户协议链接初始化完成 (user_agreement_link)");
        }
        
        // 同时给 agreement_label 添加用户协议点击事件（点击文字也触发弹窗）
        if (this._agreementLabel) {
            // 已经在 _initCheckbox 中添加了点击事件用于切换复选框
            // 这里我们需要区分：点击"用户协议"文字时弹出弹窗
            // 可以通过检测点击位置来判断
            // 但更简单的方法是：整个 agreement_label 点击切换复选框
            // 而"用户协议"四个字单独一个节点处理
            
            // 检查是否有 user_agreement_link 节点覆盖在"用户协议"文字上
            // 如果有，它应该已经处理了点击
        }
    },
    
    // 微信登录点击
    _onWxLoginClick: function() {
        console.log("_onWxLoginClick 被调用");
        this._doWxLogin();
    },
    
    // 手机号登录点击
    _onPhoneLoginClick: function() {
        console.log("_onPhoneLoginClick 被调用");
        this._doPhoneLogin();
    },
    
    // 用户协议点击
    _onUserAgreementClick: function() {
        console.log("_onUserAgreementClick 被调用");
        this._showUserAgreement();
    },
    
    _showError: function(message) {
        console.error("错误:", message);
        if (this.wait_node) {
            var waitNode = this.wait_node.getComponent('waitnode');
            if (waitNode) {
                waitNode.show(message);
                setTimeout(function() {
                    waitNode.hide();
                }, 2000);
            }
        }
    },
    
    _showLoading: function(show, message) {
        if (this.wait_node) {
            var waitNode = this.wait_node.getComponent('waitnode');
            if (waitNode) {
                if (show) {
                    waitNode.show(message || "正在处理...");
                } else {
                    waitNode.hide();
                }
            }
        }
    },
    
    // 更新登录 UI
    _updateLoginUI: function() {
        // 暂时没有需要更新的 UI
    },
    
    start () {
        console.log("loginScene start");
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
            console.log("Instantiating user agreement prefab");
            try {
                var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs);
                userAgreement_popup.parent = this.node;
                console.log("用户协议弹窗创建成功");
            } catch (e) {
                console.error("创建用户协议弹窗失败:", e);
                self._showError("无法显示用户协议");
            }
        } else {
            console.error("用户协议prefab未设置，尝试动态加载");
            
            // 尝试动态加载预制体
            cc.resources.load("prefabs/user_agreement", cc.Prefab, function(err, prefab) {
                if (err) {
                    console.error("动态加载用户协议预制体失败:", err);
                    self._showError("无法显示用户协议");
                    return;
                }
                
                try {
                    var userAgreement_popup = cc.instantiate(prefab);
                    userAgreement_popup.parent = self.node;
                    console.log("用户协议弹窗动态加载成功");
                } catch (e) {
                    console.error("创建用户协议弹窗失败:", e);
                    self._showError("无法显示用户协议");
                }
            });
        }
    }
});
