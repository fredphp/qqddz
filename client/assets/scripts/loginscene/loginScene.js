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
        // 复选框节点
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
        
        // 勾选状态
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
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        console.log("找到 check_mark 节点");
        this._checkMarkNode = checkMarkNode;
        
        // 移除 Toggle 组件（它导致了问题）
        var toggle = checkMarkNode.getComponent(cc.Toggle);
        if (toggle) {
            toggle.destroy();
            console.log("移除了 Toggle 组件");
        }
        
        // 添加 Button 组件用于点击
        var button = checkMarkNode.getComponent(cc.Button);
        if (!button) {
            button = checkMarkNode.addComponent(cc.Button);
        }
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        // 添加点击事件
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, this._onCheckboxClick, this);
        
        // 获取 Sprite 组件
        var sprite = checkMarkNode.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            // 保存原始图片（勾的图片）
            this._checkSpriteFrame = sprite.spriteFrame;
            console.log("保存了勾的图片");
        }
        
        // 创建边框
        this._createCheckboxBorder(checkMarkNode);
        
        // 设置初始状态：未勾选，不显示勾
        this._updateCheckboxVisual();
        
        console.log("复选框初始化完成");
    },
    
    // 创建复选框边框
    _createCheckboxBorder: function(node) {
        // 设置节点大小
        var boxSize = 55;
        node.width = boxSize;
        node.height = boxSize;
        
        // 添加 Graphics 组件绘制边框
        var graphics = node.getComponent(cc.Graphics);
        if (!graphics) {
            graphics = node.addComponent(cc.Graphics);
        }
        
        // 绘制白色边框
        graphics.clear();
        graphics.strokeColor = cc.Color.WHITE;
        graphics.lineWidth = 2;
        graphics.rect(-boxSize/2 + 2, -boxSize/2 + 2, boxSize - 4, boxSize - 4);
        graphics.stroke();
        
        console.log("边框绘制完成");
    },
    
    // 复选框点击事件
    _onCheckboxClick: function(event) {
        console.log("复选框被点击");
        this._isChecked = !this._isChecked;
        this._updateCheckboxVisual();
        console.log("勾选状态:", this._isChecked);
    },
    
    // 更新复选框视觉状态
    _updateCheckboxVisual: function() {
        if (!this._checkMarkNode) return;
        
        var sprite = this._checkMarkNode.getComponent(cc.Sprite);
        if (sprite) {
            if (this._isChecked) {
                // 显示勾
                sprite.spriteFrame = this._checkSpriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            } else {
                // 隐藏勾
                sprite.spriteFrame = null;
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
        
        if (this.user_agreement_prefabs) {
            console.log("Instantiating user agreement prefab");
            var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs);
            userAgreement_popup.parent = this.node;
            userAgreement_popup.zIndex = 100;
            userAgreement_popup.setPosition(0, 0);
        } else {
            console.error("用户协议prefab未设置");
            this._showError("无法显示用户协议");
        }
    },
    
    // 复选框状态变化回调（保留兼容性）
    onToggleChanged: function(toggle) {
        console.log("onToggleChanged 被调用（已弃用）");
    }
});
