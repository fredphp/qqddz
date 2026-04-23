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
        
        // 初始化所有事件
        this._initAllEvents();
        
        // 确保 myglobal 存在
        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }
        
        this._initAndStart();
    },
    
    // 初始化所有事件
    _initAllEvents: function() {
        console.log("初始化所有事件...");
        
        // 1. 初始化复选框
        this._initCheckbox();
        
        // 2. 初始化用户协议链接
        this._initUserAgreementLink();
        
        // 3. 初始化登录按钮
        this._initLoginButtons();
        
        console.log("所有事件初始化完成");
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
        
        // 获取 Sprite 组件
        var sprite = checkMarkNode.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            // 保存原始图片用于显示勾选状态
            this._checkSpriteFrame = sprite.spriteFrame;
            // 初始状态不显示勾 - 使用 enabled 控制而不是设置 null
            // sprite.spriteFrame = null 会导致 _assembler 错误
            sprite.enabled = false;
        }
        
        // 确保有 Button 组件
        var button = checkMarkNode.getComponent(cc.Button);
        if (!button) {
            button = checkMarkNode.addComponent(cc.Button);
        }
        
        // 配置按钮
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        // 注册点击事件
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            this._toggleCheckbox();
        }, this);
        
        console.log("复选框初始化完成");
    },
    
    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("复选框状态:", this._isChecked);
        
        if (!this._checkMarkNode) return;
        
        var sprite = this._checkMarkNode.getComponent(cc.Sprite);
        if (sprite) {
            if (this._isChecked) {
                // 显示勾 - 启用 Sprite 组件
                sprite.enabled = true;
            } else {
                // 隐藏勾 - 禁用 Sprite 组件而不是设置 null
                sprite.enabled = false;
            }
        }
    },
    
    // 初始化用户协议链接
    _initUserAgreementLink: function() {
        var self = this;
        
        // 尝试查找 user_agreement_link 节点（旧版本）
        var linkNode = this.node.getChildByName("user_agreement_link");
        
        // 如果 user_agreement_link 不存在或不可见，使用 agreement_label
        if (!linkNode || !linkNode.active) {
            linkNode = this.node.getChildByName("agreement_label");
            console.log("使用 agreement_label 作为用户协议点击区域");
        }
        
        if (!linkNode) {
            console.error("用户协议节点未找到");
            return;
        }
        
        console.log("找到用户协议节点:", linkNode.name);
        
        // 确保有 Button 组件
        var button = linkNode.getComponent(cc.Button);
        if (!button) {
            button = linkNode.addComponent(cc.Button);
        }
        
        // 配置按钮
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.05;
        
        // 注册点击事件 - 点击用户协议文本弹出用户协议弹窗
        linkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            console.log("用户协议被点击");
            self._showUserAgreement();
        }, this);
        
        console.log("用户协议初始化完成");
    },
    
    // 初始化登录按钮
    _initLoginButtons: function() {
        var self = this;
        
        // 微信登录按钮
        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            wxLoginNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                event.stopPropagation();
                self._doWxLogin();
            }, self);
            console.log("微信登录按钮初始化完成");
        }
        
        // 手机号登录按钮
        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            phoneLoginNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                event.stopPropagation();
                self._doPhoneLogin();
            }, self);
            console.log("手机号登录按钮初始化完成");
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
