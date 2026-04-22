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
        },
        // 复选框 Toggle 组件
        agreement_toggle: {
            type: cc.Toggle,
            default: null
        },
        // 手机号输入框
        phone_input: {
            type: cc.EditBox,
            default: null
        },
        // 验证码输入框
        code_input: {
            type: cc.EditBox,
            default: null
        },
        // 手机号登录相关节点
        phone_login_panel: {
            type: cc.Node,
            default: null
        },
        // 登录方式切换按钮
        login_type_label: {
            type: cc.Label,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("loginScene onLoad 开始");
        
        // 当前登录方式: 'wx' 或 'phone'
        this._loginType = 'wx';
        
        // 初始化勾选状态（从 Toggle 组件获取）
        if (this.agreement_toggle) {
            this._isChecked = this.agreement_toggle.isChecked;
            console.log("初始勾选状态:", this._isChecked);
        } else {
            this._isChecked = false;
            console.warn("agreement_toggle 未绑定");
        }
        
        // 重建用户协议节点结构（只有"用户协议"可点击）
        this._rebuildAgreementNodes();
        
        // 确保 myglobal 存在
        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }
        
        this._initAndStart();
    },
    
    // 重建用户协议节点结构
    _rebuildAgreementNodes: function() {
        // 找到原始的 agreement_label 节点
        var oldLabelNode = this.node.getChildByName("agreement_label");
        if (!oldLabelNode) {
            console.warn("未找到 agreement_label 节点");
            return;
        }
        
        // 获取原始位置和父节点
        var originalPos = oldLabelNode.getPosition();
        var parent = oldLabelNode.parent;
        
        // 移除原始节点的 Button 组件，只保留 Label
        var button = oldLabelNode.getComponent(cc.Button);
        if (button) {
            oldLabelNode.removeComponent(button);
            console.log("移除了原始节点的 Button 组件");
        }
        
        // 修改原始节点的文本和大小
        var label = oldLabelNode.getComponent(cc.Label);
        if (label) {
            label.string = "我已阅读并同意《";
            oldLabelNode.width = 180;
            oldLabelNode.anchorX = 0;
            oldLabelNode.x = -180; // 从复选框右边开始
        }
        
        // 创建新的"用户协议》"节点
        var linkNode = new cc.Node("agreement_link");
        linkNode.parent = parent;
        linkNode.setPosition(originalPos.x + 10, originalPos.y); // 紧挨着前面的文字
        linkNode.anchorX = 0;
        linkNode.anchorY = 0.5;
        
        // 添加 Label 组件
        var linkLabel = linkNode.addComponent(cc.Label);
        linkLabel.string = "用户协议》";
        linkLabel.fontSize = 20;
        linkLabel.lineHeight = 30;
        linkLabel.fontFamily = "Arial";
        linkLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        linkNode.width = 100;
        linkNode.height = 30;
        
        // 设置颜色为黄色，表示可点击
        linkNode.color = new cc.Color(255, 215, 0);
        
        // 添加 Button 组件
        var linkButton = linkNode.addComponent(cc.Button);
        linkButton.transition = cc.Button.Transition.SCALE;
        linkButton.duration = 0.1;
        linkButton.zoomScale = 1.1;
        
        // 添加点击事件
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "loginScene";
        clickEventHandler.handler = "_onAgreementLinkClick";
        clickEventHandler.customEventData = "";
        linkButton.clickEvents.push(clickEventHandler);
        
        // 设置较高的 zIndex 确保可点击
        linkNode.zIndex = 100;
        
        console.log("用户协议节点重建完成");
    },
    
    // 用户协议链接点击事件
    _onAgreementLinkClick: function(event, customData) {
        console.log("用户协议链接被点击");
        this._showUserAgreement();
    },
    
    // 检查是否同意用户协议
    _checkAgreement: function() {
        // 从 Toggle 组件获取最新状态
        if (this.agreement_toggle) {
            this._isChecked = this.agreement_toggle.isChecked;
        }
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
    
    _showError: function(message) {
        console.error("错误:", message);
        // TODO: 显示错误提示 UI
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
        if (this.phone_login_panel) {
            this.phone_login_panel.active = (this._loginType === 'phone');
        }
        
        if (this.login_type_label) {
            if (this._loginType === 'wx') {
                this.login_type_label.string = "切换手机号登录";
            } else {
                this.login_type_label.string = "切换微信登录";
            }
        }
    },
    
    start () {
        console.log("loginScene start");
    },
    
    // 按钮点击事件处理
    onButtonCilck(event, customData) {
        console.log("onButtonCilck:", customData);
        
        var myglobal = window.myglobal;
        
        switch(customData) {
            // 微信登录
            case "wx_login":
                this._doWxLogin();
                break;
                
            // 游客登录
            case "guest_login":
                this._doGuestLogin();
                break;
                
            // 手机号登录
            case "phone_login":
                this._doPhoneLogin();
                break;
                
            // 获取验证码
            case "get_code":
                this._getVerifyCode();
                break;
                
            // 切换登录方式
            case "switch_login":
                this._switchLoginType();
                break;
                
            // 用户协议
            case "user_agreement":
                this._showUserAgreement();
                break;
                
            default:
                break;
        }
    },
    
    // Toggle 状态变化回调
    onToggleChanged: function(toggle) {
        // 更新内部状态
        this._isChecked = toggle.isChecked;
        console.log("复选框状态变化:", this._isChecked);
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
    
    // 游客登录
    _doGuestLogin: function() {
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
        
        // 游客登录使用随机生成的账号
        var guestAccount = "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        
        if (myglobal.socket.request_guestLogin) {
            myglobal.socket.request_guestLogin({
                accountID: guestAccount,
                nickName: "游客" + Math.floor(Math.random() * 10000),
            }, function(err, result) {
                self._showLoading(false);
                
                if (err != 0) {
                    console.log("游客登录错误:" + err);
                    self._showError("登录失败，请重试");
                    return;
                }

                console.log("游客登录成功" + JSON.stringify(result));
                myglobal.playerData.gobal_count = result.goldcount || 0;
                cc.director.loadScene("hallScene");
            });
        } else {
            // 如果没有游客登录接口，使用微信登录接口
            myglobal.socket.request_wxLogin({
                uniqueID: guestAccount,
                accountID: guestAccount,
                nickName: "游客" + Math.floor(Math.random() * 10000),
                avatarUrl: "",
            }, function(err, result) {
                self._showLoading(false);
                
                if (err != 0) {
                    console.log("游客登录错误:" + err);
                    self._showError("登录失败，请重试");
                    return;
                }

                console.log("游客登录成功" + JSON.stringify(result));
                myglobal.playerData.gobal_count = result.goldcount || 0;
                cc.director.loadScene("hallScene");
            });
        }
    },
    
    // 手机号登录
    _doPhoneLogin: function() {
        var self = this;
        
        // 检查是否同意协议
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }
        
        // 获取手机号和验证码
        var phone = "";
        var code = "";
        
        if (this.phone_input) {
            phone = this.phone_input.string.trim();
        }
        if (this.code_input) {
            code = this.code_input.string.trim();
        }
        
        // 验证手机号格式
        if (!phone || phone.length !== 11) {
            this._showError("请输入正确的手机号");
            return;
        }
        
        // 验证验证码
        if (!code || code.length < 4) {
            this._showError("请输入验证码");
            return;
        }
        
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.error("myglobal 或 socket 未初始化");
            this._showError("网络未连接，请稍后重试");
            return;
        }
        
        this._showLoading(true, "正在登录...");
        
        // 调用手机号登录接口
        if (myglobal.socket.request_phoneLogin) {
            myglobal.socket.request_phoneLogin({
                phone: phone,
                code: code,
            }, function(err, result) {
                self._showLoading(false);
                
                if (err != 0) {
                    console.log("手机号登录错误:" + err);
                    self._showError("登录失败，请检查手机号和验证码");
                    return;
                }

                console.log("手机号登录成功" + JSON.stringify(result));
                myglobal.playerData.gobal_count = result.goldcount || 0;
                myglobal.playerData.phone = phone;
                cc.director.loadScene("hallScene");
            });
        } else {
            // 如果没有手机号登录接口，提示用户
            self._showLoading(false);
            self._showError("手机号登录功能暂未开放");
        }
    },
    
    // 获取验证码
    _getVerifyCode: function() {
        var self = this;
        
        // 获取手机号
        var phone = "";
        if (this.phone_input) {
            phone = this.phone_input.string.trim();
        }
        
        // 验证手机号格式
        if (!phone || phone.length !== 11) {
            this._showError("请输入正确的手机号");
            return;
        }
        
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.error("myglobal 或 socket 未初始化");
            this._showError("网络未连接，请稍后重试");
            return;
        }
        
        // 调用发送验证码接口
        var HttpAPI = window.HttpAPI;
        var defines = window.defines;
        
        if (HttpAPI && defines && defines.apiUrl) {
            HttpAPI.post(defines.apiUrl + "/send_code", { phone: phone }, function(err, result) {
                if (err) {
                    self._showError("发送验证码失败");
                    return;
                }
                self._showError("验证码已发送");
            });
        } else {
            self._showError("验证码发送功能暂未开放");
        }
    },
    
    // 切换登录方式
    _switchLoginType: function() {
        if (this._loginType === 'wx') {
            this._loginType = 'phone';
        } else {
            this._loginType = 'wx';
        }
        this._updateLoginUI();
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
                userAgreement_popup.zIndex = 100;
                userAgreement_popup.setPosition(0, 0);
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
                    userAgreement_popup.zIndex = 100;
                    userAgreement_popup.setPosition(0, 0);
                    console.log("用户协议弹窗动态加载成功");
                } catch (e) {
                    console.error("创建用户协议弹窗失败:", e);
                    self._showError("无法显示用户协议");
                }
            });
        }
    }
});
