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
        
        // 延迟初始化复选框，确保场景完全加载
        this.scheduleOnce(function() {
            this._initCheckbox();
        }.bind(this), 0.2);
        
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
        console.log("=== 初始化复选框 ===");
        
        var self = this;
        
        // 获取 check_mark 节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        console.log("找到 check_mark 节点，位置:", checkMarkNode.x, checkMarkNode.y, "大小:", checkMarkNode.width, "x", checkMarkNode.height);
        this._checkMarkNode = checkMarkNode;
        
        // 获取 Sprite 组件用于显示/隐藏对勾
        var sprite = checkMarkNode.getComponent(cc.Sprite);
        if (sprite) {
            this._checkSprite = sprite;
            // 初始状态：隐藏对勾（通过设置 opacity）
            checkMarkNode.opacity = 0;
            console.log("初始状态：对勾隐藏 (opacity = 0)");
        }
        
        // 创建边框节点
        this._createBorderNode(checkMarkNode);
        
        // 获取 agreement_label 节点
        var agreementLabel = this.node.getChildByName("agreement_label");
        if (agreementLabel) {
            this._agreementLabel = agreementLabel;
            console.log("找到 agreement_label 节点");
        }
        
        // 使用 touch 事件代替 Button
        this._setupTouchEvents(checkMarkNode, agreementLabel);
        
        console.log("=== 复选框初始化完成 ===");
    },
    
    // 创建边框节点
    _createBorderNode: function(checkMarkNode) {
        console.log("创建边框节点...");
        
        // 创建边框容器节点
        var borderNode = new cc.Node("checkbox_border");
        borderNode.parent = checkMarkNode.parent;
        
        // 设置位置（与 check_mark 相同）
        borderNode.x = checkMarkNode.x;
        borderNode.y = checkMarkNode.y;
        borderNode.zIndex = checkMarkNode.zIndex - 1;  // 放在 check_mark 下面
        
        // 设置大小
        var borderSize = 26;
        borderNode.width = borderSize;
        borderNode.height = borderSize;
        borderNode.anchorX = 0.5;
        borderNode.anchorY = 0.5;
        
        // 方法1: 使用 Sprite + 白色纹理
        var sprite = borderNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SLICED;
        
        // 创建纯色纹理
        var texture = new cc.Texture2D();
        texture.initWithData(
            new Uint8Array([255, 255, 255, 255]),
            cc.Texture2D.PixelFormat.RGBA8888,
            1, 1
        );
        
        var spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        sprite.spriteFrame = spriteFrame;
        
        // 设置颜色（深灰色边框效果）
        borderNode.color = new cc.Color(80, 80, 80);
        borderNode.opacity = 255;
        
        this._borderNode = borderNode;
        
        // 方法2: 同时添加 Graphics 绘制边框线
        var graphicsNode = new cc.Node("border_graphics");
        graphicsNode.parent = borderNode;
        graphicsNode.x = 0;
        graphicsNode.y = 0;
        graphicsNode.width = borderSize;
        graphicsNode.height = borderSize;
        
        var graphics = graphicsNode.addComponent(cc.Graphics);
        graphics.strokeColor = new cc.Color(60, 60, 60);
        graphics.lineWidth = 2;
        
        // 绘制矩形边框
        var half = borderSize / 2;
        graphics.rect(-half, -half, borderSize, borderSize);
        graphics.stroke();
        
        this._borderGraphics = graphics;
        
        console.log("边框节点创建完成，位置:", borderNode.x, borderNode.y);
    },
    
    // 设置触摸事件
    _setupTouchEvents: function(checkMarkNode, agreementLabel) {
        var self = this;
        
        // 给 check_mark 添加触摸事件
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            console.log("check_mark TOUCH_END 事件触发");
            self._toggleCheckbox();
            event.stopPropagation();
        }, this);
        
        // 同时保留 Button 组件的点击事件
        var checkButton = checkMarkNode.getComponent(cc.Button);
        if (checkButton) {
            checkButton.interactable = true;
            checkButton.clickEvents = [];
            
            var handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "loginScene";
            handler.handler = "_onCheckboxClick";
            handler.customEventData = "";
            checkButton.clickEvents.push(handler);
            
            console.log("check_mark Button 事件已添加");
        }
        
        // 给 agreement_label 添加触摸事件
        if (agreementLabel) {
            agreementLabel.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("agreement_label TOUCH_END 事件触发");
                self._toggleCheckbox();
                event.stopPropagation();
            }, this);
            
            // 同时保留 Button 组件的点击事件
            var labelButton = agreementLabel.getComponent(cc.Button);
            if (labelButton) {
                labelButton.interactable = true;
                labelButton.clickEvents = [];
                
                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onCheckboxClick";
                handler.customEventData = "";
                labelButton.clickEvents.push(handler);
                
                console.log("agreement_label Button 事件已添加");
            }
        }
    },
    
    // Button 点击回调
    _onCheckboxClick: function(event) {
        console.log("_onCheckboxClick 被调用");
        this._toggleCheckbox();
    },
    
    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("=== 复选框状态切换为:", this._isChecked, "===");
        
        if (this._isChecked) {
            // 选中状态：显示对勾
            if (this._checkMarkNode) {
                this._checkMarkNode.opacity = 255;
                console.log("对勾显示 (opacity = 255)");
            }
            // 边框变绿色
            if (this._borderNode) {
                this._borderNode.color = new cc.Color(0, 180, 0);
            }
            if (this._borderGraphics) {
                this._borderGraphics.clear();
                this._borderGraphics.strokeColor = new cc.Color(0, 150, 0);
                this._borderGraphics.lineWidth = 2;
                var half = 13;
                this._borderGraphics.rect(-half, -half, 26, 26);
                this._borderGraphics.stroke();
            }
            console.log("边框变绿");
        } else {
            // 未选中状态：隐藏对勾
            if (this._checkMarkNode) {
                this._checkMarkNode.opacity = 0;
                console.log("对勾隐藏 (opacity = 0)");
            }
            // 边框恢复灰色
            if (this._borderNode) {
                this._borderNode.color = new cc.Color(80, 80, 80);
            }
            if (this._borderGraphics) {
                this._borderGraphics.clear();
                this._borderGraphics.strokeColor = new cc.Color(60, 60, 60);
                this._borderGraphics.lineWidth = 2;
                var half = 13;
                this._borderGraphics.rect(-half, -half, 26, 26);
                this._borderGraphics.stroke();
            }
            console.log("边框变灰");
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
        
        // 获取 user_agreement_link 节点
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            // 激活节点
            linkNode.active = true;
            
            // 使用触摸事件
            linkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                console.log("user_agreement_link TOUCH_END 事件触发");
                self._showUserAgreement();
                event.stopPropagation();
            }, this);
            
            // 同时保留 Button
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
            console.log("用户协议链接初始化完成");
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
