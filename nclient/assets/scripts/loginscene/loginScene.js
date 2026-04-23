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
        
        // 创建复选框UI
        this._createCheckboxUI();
        
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
    
    // 创建复选框UI
    _createCheckboxUI: function() {
        console.log("创建复选框UI...");
        
        var self = this;
        
        // 获取现有的节点
        var checkMarkNode = this.node.getChildByName("check_mark");
        var agreementLabel = this.node.getChildByName("agreement_label");
        
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        if (!agreementLabel) {
            console.error("agreement_label 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        this._agreementLabel = agreementLabel;
        
        // 1. 给 check_mark 添加边框（选中框）
        this._addCheckboxBorder(checkMarkNode);
        
        // 2. 初始状态不勾选（隐藏对勾，只显示边框）
        checkMarkNode.opacity = 0;
        
        // 3. 创建一个透明的点击区域覆盖整个复选框区域
        var clickArea = new cc.Node("checkbox_click_area");
        clickArea.parent = this.node;
        clickArea.zIndex = 100; // 确保在最上层
        
        // 设置点击区域的位置和大小（覆盖复选框和文字）
        clickArea.x = -75; // 复选框和文字的中间位置
        clickArea.y = -280;
        clickArea.width = 320; // 覆盖整个区域
        clickArea.height = 50;
        clickArea.anchorX = 0.5;
        clickArea.anchorY = 0.5;
        
        // 添加透明背景使其可点击
        var bgSprite = clickArea.addComponent(cc.Sprite);
        bgSprite.spriteFrame = null;
        bgSprite.sizeMode = 0;
        bgSprite.type = 0;
        
        // 添加 Button 组件
        var button = clickArea.addComponent(cc.Button);
        button.transition = 0; // 无过渡效果
        button.interactable = true;
        
        // 添加点击事件
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "loginScene";
        clickEventHandler.handler = "_onCheckboxAreaClick";
        clickEventHandler.customEventData = "";
        button.clickEvents.push(clickEventHandler);
        
        this._clickArea = clickArea;
        
        // 4. 为用户协议文字添加单独的点击事件
        this._createUserAgreementClickArea();
        
        console.log("复选框UI创建完成");
    },
    
    // 添加复选框边框
    _addCheckboxBorder: function(checkMarkNode) {
        // 创建边框节点
        var borderNode = new cc.Node("checkbox_border");
        borderNode.parent = checkMarkNode.parent;
        borderNode.x = checkMarkNode.x;
        borderNode.y = checkMarkNode.y;
        borderNode.zIndex = checkMarkNode.zIndex - 1; // 在对勾下面
        
        // 设置边框大小
        borderNode.width = 28;
        borderNode.height = 28;
        
        // 添加 Sprite 组件作为边框背景
        var borderSprite = borderNode.addComponent(cc.Sprite);
        borderSprite.sizeMode = 0; // 自定义大小
        borderSprite.type = cc.Sprite.Type.SLICED;
        
        // 创建一个简单的白色方块作为边框背景
        // 使用内置的白色纹理
        var whiteTexture = cc.textureCache.addImage(cc.color(255, 255, 255, 255));
        
        // 设置边框颜色（深色边框）
        borderNode.color = new cc.Color(100, 100, 100);
        borderNode.opacity = 255;
        
        // 保存边框节点引用
        this._checkboxBorder = borderNode;
        
        console.log("复选框边框已添加");
    },
    
    // 创建用户协议点击区域
    _createUserAgreementClickArea: function() {
        var self = this;
        
        // 用户协议链接点击区域（只覆盖"用户协议"四个字）
        var linkArea = new cc.Node("agreement_link_area");
        linkArea.parent = this.node;
        linkArea.zIndex = 101; // 在复选框点击区域上面
        
        // 位置在"用户协议》"文字的位置
        linkArea.x = 40; // 大约在"用户协议"文字的位置
        linkArea.y = -280;
        linkArea.width = 100;
        linkArea.height = 30;
        linkArea.anchorX = 0.5;
        linkArea.anchorY = 0.5;
        
        // 添加透明背景
        var bgSprite = linkArea.addComponent(cc.Sprite);
        bgSprite.spriteFrame = null;
        bgSprite.sizeMode = 0;
        
        // 添加 Button 组件
        var button = linkArea.addComponent(cc.Button);
        button.transition = 0;
        button.interactable = true;
        
        // 添加点击事件
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "loginScene";
        clickEventHandler.handler = "_onUserAgreementClick";
        clickEventHandler.customEventData = "";
        button.clickEvents.push(clickEventHandler);
        
        this._linkArea = linkArea;
        
        console.log("用户协议点击区域已创建");
    },
    
    // 复选框区域点击回调
    _onCheckboxAreaClick: function() {
        console.log("_onCheckboxAreaClick 被调用");
        this._toggleCheckbox();
    },
    
    // 用户协议点击回调
    _onUserAgreementClick: function() {
        console.log("_onUserAgreementClick 被调用");
        this._showUserAgreement();
    },
    
    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("复选框状态切换为:", this._isChecked);
        
        // 更新UI
        if (this._isChecked) {
            // 显示对勾
            this._checkMarkNode.opacity = 255;
            // 边框变绿色表示选中
            if (this._checkboxBorder) {
                this._checkboxBorder.color = new cc.Color(0, 200, 0);
            }
        } else {
            // 隐藏对勾
            this._checkMarkNode.opacity = 0;
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
                
                // 清除现有事件
                button.clickEvents = [];
                
                // 添加点击事件
                var clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node;
                clickEventHandler.component = "loginScene";
                clickEventHandler.handler = "_onWxLoginClick";
                clickEventHandler.customEventData = "";
                button.clickEvents.push(clickEventHandler);
            }
            console.log("微信登录按钮初始化完成");
        }
        
        // 手机号登录按钮
        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            var button = phoneLoginNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                
                // 清除现有事件
                button.clickEvents = [];
                
                // 添加点击事件
                var clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node;
                clickEventHandler.component = "loginScene";
                clickEventHandler.handler = "_onPhoneLoginClick";
                clickEventHandler.customEventData = "";
                button.clickEvents.push(clickEventHandler);
            }
            console.log("手机号登录按钮初始化完成");
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
                    var clickEventHandler = new cc.Component.EventHandler();
                    clickEventHandler.target = this.node;
                    clickEventHandler.component = "loginScene";
                    clickEventHandler.handler = "_onCloseUserAgreement";
                    clickEventHandler.customEventData = "";
                    button.clickEvents.push(clickEventHandler);
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
