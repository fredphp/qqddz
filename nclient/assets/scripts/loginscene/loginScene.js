// 登录场景控制器
// 使用点击事件实现复选框功能（不依赖 Toggle 组件）

// 全局样式修复函数 - 更强大的版本
var _globalStyleFixApplied = false;

// 辅助函数：修复Web平台EditBox的CSS样式（增强版）
var _fixEditBoxStyle = function(editBox, fontColor, bgColor) {
    if (!cc.sys.isBrowser) return;

    fontColor = fontColor || '#000000';
    bgColor = bgColor || '#ffffff';


    // 立即尝试修复
    _applyInputStyles(fontColor, bgColor);

    // 延迟修复（等待HTML input元素创建）
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 50);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 100);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 200);
    setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 500);

    // 注入全局CSS样式（最高优先级）
    if (!_globalStyleFixApplied) {
        _globalStyleFixApplied = true;
        _injectGlobalStyles(fontColor, bgColor);
    }
};

// 应用样式到所有input元素
var _applyInputStyles = function(fontColor, bgColor) {
    try {
        var inputs = document.querySelectorAll('input');

        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            _styleSingleInput(input, fontColor, bgColor);
        }

        // 也处理 textarea（可能被用于 EditBox）
        var textareas = document.querySelectorAll('textarea');
        for (var j = 0; j < textareas.length; j++) {
            _styleSingleInput(textareas[j], fontColor, bgColor);
        }
    } catch (e) {
        console.error('修复EditBox样式失败:', e);
    }
};

// 样式化单个input元素
var _styleSingleInput = function(input, fontColor, bgColor) {
    // 设置文字颜色
    input.style.setProperty('color', fontColor, 'important');
    input.style.color = fontColor;

    // 设置背景色
    input.style.setProperty('background-color', bgColor, 'important');
    input.style.backgroundColor = bgColor;

    // 确保可见性
    input.style.setProperty('opacity', '1', 'important');
    input.style.opacity = '1';
    input.style.setProperty('visibility', 'visible', 'important');
    input.style.visibility = 'visible';

    // 设置字体大小
    input.style.setProperty('font-size', '16px', 'important');
    input.style.fontSize = '16px';

    // 设置字体
    input.style.setProperty('font-family', 'Arial, sans-serif', 'important');

    // 修复 WebKit 特殊样式
    input.style.setProperty('-webkit-text-fill-color', fontColor, 'important');
    input.style.webkitTextFillColor = fontColor;

    // 移除可能影响显示的样式
    input.style.textShadow = 'none';
    input.style.setProperty('text-shadow', 'none', 'important');

    // 确保没有caret-color问题
    input.style.setProperty('caret-color', fontColor, 'important');
    input.style.caretColor = fontColor;

};

// 注入全局CSS样式
var _injectGlobalStyles = function(fontColor, bgColor) {
    try {
        var styleId = 'cocos-editbox-fix-style';
        if (document.getElementById(styleId)) return;

        var css = `
            input, textarea {
                color: ${fontColor} !important;
                background-color: ${bgColor} !important;
                opacity: 1 !important;
                visibility: visible !important;
                font-size: 16px !important;
                -webkit-text-fill-color: ${fontColor} !important;
                caret-color: ${fontColor} !important;
            }
            input::placeholder, textarea::placeholder {
                color: #999999 !important;
                opacity: 1 !important;
            }
            input:focus, textarea:focus {
                color: ${fontColor} !important;
                outline: none !important;
            }
        `;

        var style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

    } catch (e) {
        console.error('注入全局样式失败:', e);
    }
};

// MutationObserver 监听新创建的input元素
var _startInputObserver = function() {
    if (!cc.sys.isBrowser) return;

    try {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
                        _styleSingleInput(node, '#000000', '#ffffff');
                    }
                    // 检查子节点
                    if (node.querySelectorAll) {
                        var inputs = node.querySelectorAll('input, textarea');
                        inputs.forEach(function(inp) {
                            _styleSingleInput(inp, '#000000', '#ffffff');
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    } catch (e) {
        console.warn('启动Input监听器失败:', e);
    }
};

cc.Class({
    name: 'loginScene',
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
        phone_login_prefab: {
            type: cc.Prefab,
            default: null
        }
    },

    onLoad () {

        // 启动Web平台Input样式监听器
        _startInputObserver();
        _injectGlobalStyles('#000000', '#ffffff');

        this._isAgreementChecked = false;
        this._initWaitNode();
        
        // 初始化复选框（使用点击事件）
        this._initCheckbox();
        
        // 初始化登录按钮
        this._initLoginButtons();
        
        // 初始化用户协议链接点击事件
        this._initUserAgreementLink();

        // 🚀【性能优化】预加载大厅场景和游戏场景
        this._preloadScenes();

        // 检查是否有本地登录会话，尝试自动登录
        this._checkAutoLogin();

        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }

        this._initAndStart();
    },

    // 检查自动登录
    _checkAutoLogin: function() {
        
        var myglobal = window.myglobal;
        if (!myglobal) {
            return;
        }

        // 检查是否被强制下线
        if (myglobal.wasForceLoggedOut()) {
            this._showError(myglobal.getForceLogoutReason());
            return;
        }

        // 检查是否有本地会话
        if (myglobal.hasLocalSession()) {
            
            var self = this;
            myglobal.verifyToken(function(valid, message) {
                
                if (valid) {
                    self._showError("自动登录中...");
                    
                    // 检查是否有保存的房间信息（刷新页面后恢复到游戏场景）
                    var reconnectInfo = myglobal.socket && myglobal.socket.loadReconnectInfo ? 
                        myglobal.socket.loadReconnectInfo() : { token: '', playerId: '', roomCode: '' };
                    
                    
                    // 如果有房间号，说明之前在游戏中，需要恢复到游戏场景
                    if (reconnectInfo.roomCode) {
                        
                        self.scheduleOnce(function() {
                            if (myglobal.socket && myglobal.socket.initSocket) {
                                myglobal.socket.initSocket();
                            }
                            
                            // 监听房间恢复事件
                            myglobal.socket.onRoomRestored(function(data) {
                                cc.director.loadScene("gameScene");
                            });
                            
                            // 监听普通连接成功（不在房间中）
                            var evt = window.eventLister ? window.eventLister({}) : null;
                            if (evt) {
                                evt.on("connection_success", function(data) {
                                    cc.director.loadScene("gameScene");
                                });
                            }
                        }, 0.5);
                    } else {
                        // 没有房间信息，正常跳转到大厅
                        self.scheduleOnce(function() {
                            if (myglobal.socket && myglobal.socket.initSocket) {
                                myglobal.socket.initSocket();
                            }
                            cc.director.loadScene("hallScene");
                        }, 0.5);
                    }
                } else {
                    // Token无效，显示错误信息并停留在登录页面
                    self._showError(message || "登录已过期，请重新登录");
                    // myglobal.verifyToken 已经清除了本地状态，这里不需要再次清除
                }
            });
        } else {
        }
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

    _initCheckbox: function() {
        
        var self = this;
        
        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        
        var checkmark = checkMarkNode.getChildByName("checkmark");
        if (checkmark) {
            this._checkmarkIcon = checkmark;
            checkmark.active = true;  // 默认选中
        }
        
        this._isAgreementChecked = true;  // 默认已同意协议
        
        var button = checkMarkNode.getComponent(cc.Button);
        if (button) {
            button.enabled = false;
        }
        
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            self._toggleCheckbox();
        }, self);
    },

    _toggleCheckbox: function() {
        this._isAgreementChecked = !this._isAgreementChecked;
        if (this._checkmarkIcon) {
            this._checkmarkIcon.active = this._isAgreementChecked;
        }
    },

    start () {
    },

    _initLoginButtons: function() {
        var self = this;
        

        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
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
        } else {
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
        } else {
        }
        
    },

    _initUserAgreementLink: function() {
        var self = this;
        
        // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
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
                handler.handler = "_onUserAgreementLinkClick";
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

    _onUserAgreementLinkClick: function() {
        this._showUserAgreementPopup();
    },

    _checkAgreement: function() {
        return this._isAgreementChecked;
    },

    // 🚀【性能优化】预加载场景
    _preloadScenes: function() {
        
        // 预加载大厅场景
        cc.director.preloadScene("hallScene", function(err) {
            if (err) {
                console.error("🚀 [预加载] 大厅场景预加载失败:", err);
                return;
            }
        });
        
        // 预加载游戏场景
        cc.director.preloadScene("gameScene", function(err) {
            if (err) {
                console.error("🚀 [预加载] 游戏场景预加载失败:", err);
                return;
            }
        });
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

        // 检查是否有保存的重连信息（刷新页面后恢复）
        if (myglobal.socket && myglobal.socket.loadReconnectInfo) {
            var reconnectInfo = myglobal.socket.loadReconnectInfo()
            
            if (reconnectInfo.token && reconnectInfo.playerId) {
                this._showLoading(true, "正在恢复登录状态...")
                
                // 初始化 WebSocket 连接
                if (myglobal.socket.initSocket) {
                    myglobal.socket.initSocket()
                }
                
                var self = this
                
                // 监听房间恢复事件
                myglobal.socket.onRoomRestored(function(data) {
                    self._showLoading(false)
                    
                    // 恢复玩家数据
                    myglobal.playerData.playerId = data.player_id
                    myglobal.playerData.nickName = data.player_name
                    myglobal.playerData.saveToLocal()
                    
                    // 跳转到游戏场景
                    cc.director.loadScene("gameScene")
                })
                
                // 监听普通连接成功（不在房间中）
                var evt = window.eventLister ? window.eventLister({}) : null
                if (evt) {
                    evt.on("connection_success", function(data) {
                        self._showLoading(false)
                        myglobal.playerData.playerId = data.player_id
                        myglobal.playerData.nickName = data.player_name
                        myglobal.playerData.gobal_count = data.gold || 0
                        myglobal.playerData.saveToLocal()
                        cc.director.loadScene("hallScene")
                    })
                }
                
                return
            }
        }

        // 初始化背景音乐 - 处理浏览器自动播放策略
        this._initBackgroundMusic();

        if (myglobal.socket && myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }
    },

    // 初始化背景音乐 - 处理浏览器自动播放策略
    _initBackgroundMusic: function() {
        var self = this;
        
        // 音效开关检查
        var isopen_sound = (typeof window.isopen_sound !== 'undefined') ? window.isopen_sound : 1;
        if (!isopen_sound) {
            return;
        }
        
        // 初始化状态
        this._musicPlaying = false;
        this._touchListenerAdded = false;
        
        // 使用 cc.resources.load 加载音频
        cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
            if (err) {
                self._setupGlobalTouchForMusic();
                return;
            }
            
            // 保存音频剪辑
            self._bgMusicClip = clip;
            
            try {
                // 使用 playMusic 播放背景音乐（统一的背景音乐管理）
                cc.audioEngine.playMusic(clip, true);
                self._musicPlaying = true;
                // 成功播放，确保监听器被移除
                self._removeGlobalTouchForMusic();
            } catch(e) {
                self._setupGlobalTouchForMusic();
            }
        });
    },
    
    // 通过触摸播放音乐
    _playMusicOnTouch: function() {
        var self = this;
        
        // 首先检查是否有正在播放的音乐
        if (cc.audioEngine.isMusicPlaying()) {
            this._removeGlobalTouchForMusic();
            return;
        }
        
        // 如果已经有音频剪辑，直接播放
        if (this._bgMusicClip) {
            try {
                cc.audioEngine.playMusic(this._bgMusicClip, true);
                this._musicPlaying = true;
                this._removeGlobalTouchForMusic();
            } catch(e) {
            }
            return;
        }
        
        // 没有音频剪辑，需要加载
        cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
            if (err) {
                return;
            }
            
            self._bgMusicClip = clip;
            
            try {
                cc.audioEngine.playMusic(clip, true);
                self._musicPlaying = true;
                self._removeGlobalTouchForMusic();
            } catch(e) {
            }
        });
    },
    
    // 设置全局触摸监听 - 用户点击任意位置触发音乐
    _setupGlobalTouchForMusic: function() {
        // 防止重复添加监听器
        if (this._touchListenerAdded) {
            return;
        }
        
        var self = this;
        this._touchListenerAdded = true;
        
        // Cocos Creator 层面的监听
        this._cocosTouchHandler = function() {
            self._playMusicOnTouch();
        };
        this.node.on(cc.Node.EventType.TOUCH_START, this._cocosTouchHandler, this);
        
        // Web 浏览器层面的监听
        if (cc.sys.isBrowser) {
            this._browserTouchHandler = function() {
                self._playMusicOnTouch();
            };
            
            document.addEventListener('touchstart', this._browserTouchHandler, true);
            document.addEventListener('mousedown', this._browserTouchHandler, true);
            document.addEventListener('click', this._browserTouchHandler, true);
            
        }
    },
    
    // 移除全局触摸监听
    _removeGlobalTouchForMusic: function() {
        // 移除 Cocos Creator 层面的监听
        if (this._cocosTouchHandler) {
            this.node.off(cc.Node.EventType.TOUCH_START, this._cocosTouchHandler, this);
            this._cocosTouchHandler = null;
        }
        
        // 移除浏览器层面的监听
        if (cc.sys.isBrowser && this._browserTouchHandler) {
            document.removeEventListener('touchstart', this._browserTouchHandler, true);
            document.removeEventListener('mousedown', this._browserTouchHandler, true);
            document.removeEventListener('click', this._browserTouchHandler, true);
            this._browserTouchHandler = null;
        }
        
        this._touchListenerAdded = false;
    },

    _showError: function(message) {
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
            // 使用 angle 替代已废弃的 rotation 属性
            this._loadingImage.angle += dt * 45;
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
        
        this._showPhoneLoginPopup();
    },

    _showPhoneLoginPopup: function() {
        var self = this;
        
        
        if (this.phone_login_prefab) {
            this._createPhoneLoginPopup(this.phone_login_prefab);
        } else {
            cc.resources.load("prefabs/phone_login", cc.Prefab, function(err, prefab) {
                if (err) {
                    console.error("加载 phone_login prefab 失败:", err);
                    self._showError("无法显示登录弹窗");
                    return;
                }
                self._createPhoneLoginPopup(prefab);
            });
        }
    },

    _createPhoneLoginPopup: function(prefab) {
        
        // 动态创建弹窗
        try {
            var popup = this._createPhoneLoginDynamic();
            this._phoneLoginPopup = popup;
        } catch (e) {
            console.error("创建手机登录弹窗失败:", e);
            this._showError("无法显示登录弹窗: " + e.message);
        }
    },

    // 动态创建手机登录弹窗 - 🔧【重构】中国风斗地主登录弹窗
    // 弹窗尺寸：520 x 680，使用新背景图 login_bg
    _createPhoneLoginDynamic: function() {
        var self = this;

        // ==================== 弹窗根节点 ====================
        var popup = new cc.Node("LoginDialog");
        popup.parent = this.node;
        popup.setContentSize(cc.size(1280, 720));
        popup.setPosition(0, 0);
        popup.zIndex = 1000;

        // 添加 BlockInputEvents 组件阻止底层点击
        popup.addComponent(cc.BlockInputEvents);

        // ==================== 半透明背景遮罩 ====================
        var mask = new cc.Node("Mask");
        mask.parent = popup;
        mask.setContentSize(cc.size(1280, 720));
        mask.setPosition(0, 0);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        mask.color = new cc.Color(0, 0, 0);
        mask.opacity = 180;

        // ==================== 弹窗面板参数 ====================
        var panelWidth = 520;
        var panelHeight = 680;
        var panel = new cc.Node("Panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(panelWidth, panelHeight));
        panel.setPosition(0, 0);
        panel.scale = 0.7;
        panel.opacity = 0;

        // ==================== 弹窗背景（使用 login_bg 图片）====================
        var bg = new cc.Node("Bg");
        bg.parent = panel;
        bg.setContentSize(cc.size(panelWidth, panelHeight));
        bg.setPosition(0, 0);
        
        // 加载新背景图
        cc.resources.load("images/login_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.warn("加载 login_bg 失败，使用默认背景:", err);
                // 降级：使用渐变背景
                var bgGfx = bg.addComponent(cc.Graphics);
                bgGfx.fillColor = new cc.Color(45, 35, 25);
                bgGfx.roundRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
                bgGfx.fill();
                return;
            }
            var bgSprite = bg.addComponent(cc.Sprite);
            bgSprite.spriteFrame = spriteFrame;
            bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        });

        // ==================== 标题文字（欢乐登录）====================
        // 金色描边，白色主体，居中，顶部距边40px
        var titleNode = new cc.Node("Title");
        titleNode.parent = panel;
        titleNode.setPosition(0, panelHeight/2 - 60);
        
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "欢乐登录";
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 44;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(255, 255, 255);
        
        // 金色描边
        var titleOutline = titleNode.addComponent(cc.LabelOutline);
        titleOutline.color = new cc.Color(218, 165, 32); // 金色
        titleOutline.width = 3;

        // ==================== 关闭按钮（右上角圆形，红金色，46x46）====================
        // 位置：x: 230, y: 295 (相对于面板中心)
        var closeBtn = new cc.Node("BtnClose");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(46, 46));
        closeBtn.setPosition(230, 295);
        
        // 红金色圆形背景
        var closeGfx = closeBtn.addComponent(cc.Graphics);
        closeGfx.fillColor = new cc.Color(200, 60, 60); // 红色
        closeGfx.circle(0, 0, 23);
        closeGfx.fill();
        closeGfx.strokeColor = new cc.Color(218, 165, 32); // 金色边框
        closeGfx.lineWidth = 2;
        closeGfx.circle(0, 0, 22);
        closeGfx.stroke();
        
        // X 符号
        var closeX = new cc.Node("X");
        closeX.parent = closeBtn;
        var closeXLabel = closeX.addComponent(cc.Label);
        closeXLabel.string = "×";
        closeXLabel.fontSize = 28;
        closeXLabel.lineHeight = 32;
        closeXLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeX.color = new cc.Color(255, 255, 255);

        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            // 关闭动画
            cc.tween(panel)
                .to(0.15, { scale: 0.8, opacity: 0 }, { easing: 'backIn' })
                .call(function() {
                    popup.destroy();
                })
                .start();
        }, this);

        // ==================== 表单布局参数 ====================
        // 输入框统一规格：宽400，高58
        var inputWidth = 400;
        var inputHeight = 58;
        var formY = panelHeight/2 - 120; // 表单起始Y坐标

        // ==================== 手机号输入框 ====================
        var phoneBg = new cc.Node("PhoneInput");
        phoneBg.parent = panel;
        phoneBg.setContentSize(cc.size(inputWidth, inputHeight));
        phoneBg.setPosition(0, formY);
        
        // 浅白透明背景，淡金色边框
        var phoneBgGfx = phoneBg.addComponent(cc.Graphics);
        phoneBgGfx.fillColor = new cc.Color(255, 255, 255, 230);
        phoneBgGfx.roundRect(-inputWidth/2, -inputHeight/2, inputWidth, inputHeight, 10);
        phoneBgGfx.fill();
        phoneBgGfx.strokeColor = new cc.Color(218, 165, 32, 200); // 淡金色边框
        phoneBgGfx.lineWidth = 2;
        phoneBgGfx.roundRect(-inputWidth/2, -inputHeight/2, inputWidth, inputHeight, 10);
        phoneBgGfx.stroke();

        // 手机图标 📱
        var phoneIcon = new cc.Node("Icon");
        phoneIcon.parent = phoneBg;
        phoneIcon.setPosition(-inputWidth/2 + 30, 0);
        var phoneIconLabel = phoneIcon.addComponent(cc.Label);
        phoneIconLabel.string = "📱";
        phoneIconLabel.fontSize = 20;

        // 手机号输入框
        var phoneInputNode = new cc.Node("Input");
        phoneInputNode.parent = phoneBg;
        phoneInputNode.setContentSize(cc.size(inputWidth - 70, inputHeight - 8));
        phoneInputNode.setPosition(15, 0);
        var phoneEditBox = phoneInputNode.addComponent(cc.EditBox);
        phoneEditBox.placeholder = "请输入手机号";
        phoneEditBox.fontSize = 18;
        phoneEditBox.placeholderFontSize = 16;
        phoneEditBox.fontColor = new cc.Color(50, 50, 50, 255);
        phoneEditBox.placeholderFontColor = new cc.Color(160, 160, 160);
        phoneEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        phoneEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        phoneEditBox.maxLength = 11;
        phoneEditBox.backgroundColor = new cc.Color(255, 255, 255, 0);

        formY -= inputHeight + 30; // 间距30

        // ==================== 验证码行 ====================
        var codeInputWidth = 260;
        var sendBtnWidth = 120;
        var codeGap = 20;

        // 验证码输入框背景
        var codeBg = new cc.Node("CodeInput");
        codeBg.parent = panel;
        codeBg.setContentSize(cc.size(codeInputWidth, inputHeight));
        codeBg.setPosition(-inputWidth/2 + codeInputWidth/2, formY);
        
        var codeBgGfx = codeBg.addComponent(cc.Graphics);
        codeBgGfx.fillColor = new cc.Color(255, 255, 255, 230);
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 10);
        codeBgGfx.fill();
        codeBgGfx.strokeColor = new cc.Color(218, 165, 32, 200);
        codeBgGfx.lineWidth = 2;
        codeBgGfx.roundRect(-codeInputWidth/2, -inputHeight/2, codeInputWidth, inputHeight, 10);
        codeBgGfx.stroke();

        // 锁图标 🔒
        var lockIcon = new cc.Node("Icon");
        lockIcon.parent = codeBg;
        lockIcon.setPosition(-codeInputWidth/2 + 25, 0);
        var lockIconLabel = lockIcon.addComponent(cc.Label);
        lockIconLabel.string = "🔒";
        lockIconLabel.fontSize = 18;

        // 验证码输入框
        var codeInputNode = new cc.Node("Input");
        codeInputNode.parent = codeBg;
        codeInputNode.setContentSize(cc.size(codeInputWidth - 55, inputHeight - 8));
        codeInputNode.setPosition(12, 0);
        var codeEditBox = codeInputNode.addComponent(cc.EditBox);
        codeEditBox.placeholder = "请输入验证码";
        codeEditBox.fontSize = 18;
        codeEditBox.placeholderFontSize = 16;
        codeEditBox.fontColor = new cc.Color(50, 50, 50, 255);
        codeEditBox.placeholderFontColor = new cc.Color(160, 160, 160);
        codeEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        codeEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        codeEditBox.maxLength = 6;
        codeEditBox.backgroundColor = new cc.Color(255, 255, 255, 0);

        // 获取验证码按钮（橙黄色，圆角，120x46）
        var sendCodeBtn = new cc.Node("BtnGetCode");
        sendCodeBtn.parent = panel;
        sendCodeBtn.setContentSize(cc.size(sendBtnWidth, 46));
        sendCodeBtn.setPosition(inputWidth/2 - sendBtnWidth/2, formY);
        
        var sendCodeGfx = sendCodeBtn.addComponent(cc.Graphics);
        sendCodeGfx.fillColor = new cc.Color(255, 165, 0); // 橙黄色
        sendCodeGfx.roundRect(-sendBtnWidth/2, -23, sendBtnWidth, 46, 10);
        sendCodeGfx.fill();
        sendCodeGfx.strokeColor = new cc.Color(255, 200, 100);
        sendCodeGfx.lineWidth = 2;
        sendCodeGfx.roundRect(-sendBtnWidth/2, -23, sendBtnWidth, 46, 10);
        sendCodeGfx.stroke();

        var sendCodeLabel = new cc.Node("Label");
        sendCodeLabel.parent = sendCodeBtn;
        var sendCodeLabelComp = sendCodeLabel.addComponent(cc.Label);
        sendCodeLabelComp.string = "获取验证码";
        sendCodeLabelComp.fontSize = 16;
        sendCodeLabelComp.lineHeight = 22;
        sendCodeLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        sendCodeLabel.color = new cc.Color(255, 255, 255);

        var sendCodeBtnComp = sendCodeBtn.addComponent(cc.Button);
        sendCodeBtnComp.transition = cc.Button.Transition.SCALE;
        sendCodeBtnComp.zoomScale = 0.95;

        formY -= inputHeight + 50; // 主登录按钮在输入框下方40px

        // ==================== 手机登录按钮（中国风橙金渐变，360x68）====================
        var loginBtnWidth = 360;
        var loginBtnHeight = 68;
        
        var loginBtn = new cc.Node("BtnLogin");
        loginBtn.parent = panel;
        loginBtn.setContentSize(cc.size(loginBtnWidth, loginBtnHeight));
        loginBtn.setPosition(0, formY);
        
        // 中国风橙金渐变效果（使用Graphics模拟）
        var loginGfx = loginBtn.addComponent(cc.Graphics);
        // 底色：橙色
        loginGfx.fillColor = new cc.Color(255, 140, 0);
        loginGfx.roundRect(-loginBtnWidth/2, -loginBtnHeight/2, loginBtnWidth, loginBtnHeight, 15);
        loginGfx.fill();
        // 顶部高光：金色
        loginGfx.fillColor = new cc.Color(255, 180, 50, 150);
        loginGfx.roundRect(-loginBtnWidth/2 + 4, 4, loginBtnWidth - 8, loginBtnHeight/2 - 4, [12, 12, 0, 0]);
        loginGfx.fill();
        // 边框
        loginGfx.strokeColor = new cc.Color(200, 100, 0);
        loginGfx.lineWidth = 3;
        loginGfx.roundRect(-loginBtnWidth/2, -loginBtnHeight/2, loginBtnWidth, loginBtnHeight, 15);
        loginGfx.stroke();

        var loginLabel = new cc.Node("Label");
        loginLabel.parent = loginBtn;
        var loginLabelComp = loginLabel.addComponent(cc.Label);
        loginLabelComp.string = "手机登录";
        loginLabelComp.fontSize = 24;
        loginLabelComp.lineHeight = 32;
        loginLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        loginLabel.color = new cc.Color(255, 255, 255);
        
        // 文字阴影
        var loginOutline = loginLabel.addComponent(cc.LabelOutline);
        loginOutline.color = new cc.Color(150, 80, 0);
        loginOutline.width = 2;

        var loginBtnComp = loginBtn.addComponent(cc.Button);
        loginBtnComp.transition = cc.Button.Transition.SCALE;
        loginBtnComp.zoomScale = 0.95;

        formY -= loginBtnHeight + 40;

        // ==================== 分割线（其他登录方式，浅金色）====================
        var dividerNode = new cc.Node("Divider");
        dividerNode.parent = panel;
        dividerNode.setPosition(0, formY);
        
        var dividerGfx = dividerNode.addComponent(cc.Graphics);
        // 左边线
        dividerGfx.strokeColor = new cc.Color(218, 165, 32, 180);
        dividerGfx.lineWidth = 1;
        dividerGfx.moveTo(-loginBtnWidth/2, 0);
        dividerGfx.lineTo(-50, 0);
        dividerGfx.stroke();
        // 右边线
        dividerGfx.moveTo(50, 0);
        dividerGfx.lineTo(loginBtnWidth/2, 0);
        dividerGfx.stroke();

        var orLabel = new cc.Node("Label");
        orLabel.parent = dividerNode;
        var orLabelComp = orLabel.addComponent(cc.Label);
        orLabelComp.string = "其他登录方式";
        orLabelComp.fontSize = 14;
        orLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        orLabel.color = new cc.Color(218, 165, 32);

        formY -= 45;

        // ==================== 微信登录区（圆形绿色按钮，74x74）====================
        var wxBtn = new cc.Node("BtnWechat");
        wxBtn.parent = panel;
        wxBtn.setContentSize(cc.size(74, 74));
        wxBtn.setPosition(0, formY);
        
        // 绿色圆形背景
        var wxBgGfx = wxBtn.addComponent(cc.Graphics);
        wxBgGfx.fillColor = new cc.Color(7, 193, 96);
        wxBgGfx.circle(0, 0, 37);
        wxBgGfx.fill();
        wxBgGfx.strokeColor = new cc.Color(5, 150, 75);
        wxBgGfx.lineWidth = 2;
        wxBgGfx.circle(0, 0, 36);
        wxBgGfx.stroke();

        // 微信图标
        var wxIcon = new cc.Node("Icon");
        wxIcon.parent = wxBtn;
        var wxIconLabel = wxIcon.addComponent(cc.Label);
        wxIconLabel.string = "💚";
        wxIconLabel.fontSize = 32;

        var wxBtnComp = wxBtn.addComponent(cc.Button);
        wxBtnComp.transition = cc.Button.Transition.SCALE;
        wxBtnComp.zoomScale = 0.95;

        // 微信登录文字
        var wxLabel = new cc.Node("LabelWechat");
        wxLabel.parent = panel;
        wxLabel.setPosition(0, formY - 55);
        var wxLabelComp = wxLabel.addComponent(cc.Label);
        wxLabelComp.string = "微信登录";
        wxLabelComp.fontSize = 14;
        wxLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        wxLabel.color = new cc.Color(180, 160, 120); // 灰金色

        // ==================== 消息提示（隐藏）====================
        var messageLabel = new cc.Node("MessageLabel");
        messageLabel.parent = panel;
        messageLabel.setPosition(0, -panelHeight/2 + 50);
        var messageLabelComp = messageLabel.addComponent(cc.Label);
        messageLabelComp.string = "";
        messageLabelComp.fontSize = 14;
        messageLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        messageLabel.active = false;

        // ==================== 弹窗进入动画 ====================
        cc.tween(panel)
            .to(0.25, { scale: 1, opacity: 255 }, { easing: 'backOut' })
            .start();

        // ==================== 功能逻辑 ====================
        var countdown = 0;
        var phone = "";
        var code = "";
        
        // 验证手机号
        var validatePhone = function(phone) {
            if (!phone || phone.length !== 11) return false;
            return /^1[3-9]\d{9}$/.test(phone);
        };
        
        // 显示消息
        var showMessage = function(msg, isError) {
            messageLabel.active = true;
            messageLabelComp.string = msg;
            messageLabel.color = isError ? new cc.Color(255, 80, 80) : new cc.Color(100, 200, 100);
        };
        
        // 更新按钮颜色
        var updateBtnColor = function(gfx, color, width, height, radius) {
            gfx.clear();
            gfx.fillColor = color;
            gfx.roundRect(-width/2, -height/2, width, height, radius);
            gfx.fill();
        };

        // 更新验证码按钮颜色（特殊尺寸）
        var updateSendBtnColor = function(gfx, color) {
            gfx.clear();
            gfx.fillColor = color;
            gfx.roundRect(-sendBtnWidth/2, -23, sendBtnWidth, 46, 10);
            gfx.fill();
        };

        // 开始倒计时
        var startCountdown = function() {
            countdown = 60;
            sendCodeBtnComp.interactable = false;
            updateSendBtnColor(sendCodeGfx, new cc.Color(180, 180, 180));

            var tick = function() {
                countdown--;
                if (countdown <= 0) {
                    sendCodeLabelComp.string = "获取验证码";
                    sendCodeBtnComp.interactable = true;
                    updateSendBtnColor(sendCodeGfx, new cc.Color(255, 165, 0));
                } else {
                    sendCodeLabelComp.string = countdown + "s";
                    self.scheduleOnce(tick, 1);
                }
            };
            self.scheduleOnce(tick, 1);
            sendCodeLabelComp.string = countdown + "s";
        };
        
        // 发送验证码 - onGetCode()
        sendCodeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";
            if (!validatePhone(phone)) {
                showMessage("请输入正确的手机号", true);
                return;
            }
            
            var defines = window.defines;
            if (!defines || !defines.apiUrl) {
                showMessage("验证码已发送(测试)", false);
                startCountdown();
                return;
            }
            
            // 使用加密请求发送验证码
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/send-code',
                    'send_code',
                    { phone: phone },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "发送失败", true);
                            return;
                        }
                        if (resp && resp.code === 0) {
                            showMessage("验证码已发送", false);
                            startCountdown();
                        } else {
                            showMessage(resp.message || "发送失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/send-code', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.code === 0) {
                                    showMessage("验证码已发送", false);
                                    startCountdown();
                                } else {
                                    showMessage(resp.message || "发送失败", true);
                                }
                            } catch(e) {
                                showMessage("解析响应失败", true);
                            }
                        } else {
                            showMessage("网络请求失败", true);
                        }
                    }
                };
                xhr.send(JSON.stringify({ phone: phone }));
            }
        });

        // 手机登录 - onPhoneLogin()
        loginBtn.on(cc.Node.EventType.TOUCH_END, function() {
            phone = phoneEditBox.string || "";
            code = codeEditBox.string || "";

            if (!validatePhone(phone)) {
                showMessage("请输入正确的手机号", true);
                return;
            }

            showMessage("正在登录...", false);

            var defines = window.defines;
            if (!defines || !defines.apiUrl) {
                // 无API配置，模拟登录成功
                if (window.myglobal) {
                    var loginData = {
                        uniqueID: "phone_" + phone,
                        accountID: "phone_" + phone,
                        nickName: "玩家" + phone.substr(-4),
                        avatarUrl: "",
                        goldCount: 1000,
                        token: "test_token_" + Date.now(),
                        phone: phone,
                        loginType: 1
                    };
                    window.myglobal.onLoginSuccess(loginData);
                }
                showMessage("登录成功", false);
                self.scheduleOnce(function() {
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                }, 0.5);
                return;
            }

            // 使用加密请求登录
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/phone-login',
                    'phone_login',
                    { phone: phone, code: code },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "登录失败", true);
                            return;
                        }
                        if (resp && resp.code === 0 && resp.data) {
                            showMessage("登录成功", false);
                            // 使用 myglobal.onLoginSuccess 保存登录状态
                            if (window.myglobal) {
                                var loginData = {
                                    uniqueID: resp.data.uniqueID || "",
                                    accountID: resp.data.accountID || "",
                                    nickName: resp.data.nickName || "玩家",
                                    avatarUrl: resp.data.avatarUrl || "",
                                    goldCount: resp.data.goldcount || 0,
                                    token: resp.data.token || "",
                                    phone: phone,
                                    loginType: 1
                                };
                                window.myglobal.onLoginSuccess(loginData);
                            }
                            self.scheduleOnce(function() {
                                popup.destroy();
                                cc.director.loadScene("hallScene");
                            }, 0.5);
                        } else {
                            showMessage(resp.message || "登录失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/phone-login', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('X-Device-ID', 'web_' + Date.now());
                xhr.setRequestHeader('X-Device-Type', 'Web Browser');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.code === 0 && resp.data) {
                                    showMessage("登录成功", false);
                                    // 使用 myglobal.onLoginSuccess 保存登录状态
                                    if (window.myglobal) {
                                        var loginData = {
                                            uniqueID: resp.data.uniqueID || resp.data.player_id || "",
                                            accountID: resp.data.accountID || resp.data.account_id || "",
                                            nickName: resp.data.nickName || resp.data.nickname || "玩家",
                                            avatarUrl: resp.data.avatarUrl || resp.data.avatar || "",
                                            goldCount: resp.data.goldcount || resp.data.gold || 0,
                                            token: resp.data.token || "",
                                            phone: phone,
                                            loginType: 1
                                        };
                                        window.myglobal.onLoginSuccess(loginData);
                                    }
                                    self.scheduleOnce(function() {
                                        popup.destroy();
                                        cc.director.loadScene("hallScene");
                                    }, 0.5);
                                } else {
                                    showMessage(resp.message || "登录失败", true);
                                }
                            } catch(e) {
                                showMessage("解析响应失败", true);
                            }
                        } else {
                            showMessage("网络请求失败", true);
                        }
                    }
                };
                xhr.send(JSON.stringify({ phone: phone, code: code }));
            }
        });

        // 微信登录 - onWechatLogin()
        wxBtn.on(cc.Node.EventType.TOUCH_END, function() {
            showMessage("正在登录...", false);

            var defines = window.defines;

            if (!defines || !defines.apiUrl) {
                // 无API配置，模拟登录成功
                if (window.myglobal) {
                    var loginData = {
                        uniqueID: "wx_" + Date.now(),
                        accountID: "wx_" + Date.now(),
                        nickName: "微信用户",
                        avatarUrl: "",
                        goldCount: 1000,
                        token: "test_wx_token_" + Date.now(),
                        loginType: 2
                    };
                    window.myglobal.onLoginSuccess(loginData);
                }
                showMessage("登录成功", false);
                self.scheduleOnce(function() {
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                }, 0.5);
                return;
            }

            // 使用加密请求微信登录
            var HttpAPI = window.HttpAPI;
            if (HttpAPI && defines.cryptoKey) {
                HttpAPI.postEncrypted(
                    defines.apiUrl + '/api/v1/auth/wx-login',
                    'wx_login',
                    { code: "test_code_" + Date.now() },
                    defines.cryptoKey,
                    function(err, resp) {
                        if (err) {
                            showMessage(err || "登录失败", true);
                            return;
                        }
                        if (resp && resp.code === 0 && resp.data) {
                            showMessage("登录成功", false);
                            if (window.myglobal && window.myglobal.playerData) {
                                window.myglobal.playerData.uniqueID = resp.data.uniqueID || "";
                                window.myglobal.playerData.accountID = resp.data.accountID || "";
                                window.myglobal.playerData.nickName = resp.data.nickName || "微信用户";
                                window.myglobal.playerData.userName = resp.data.username || "";
                                window.myglobal.playerData.avatar = resp.data.avatarUrl || "";
                                window.myglobal.playerData.gobal_count = resp.data.goldCount || 0;
                                window.myglobal.playerData.token = resp.data.token || "";
                                // 保存到本地存储
                                window.myglobal.playerData.saveToLocal();
                                console.log("【微信登录】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
                            }
                            self.scheduleOnce(function() {
                                popup.destroy();
                                cc.director.loadScene("hallScene");
                            }, 0.5);
                        } else {
                            showMessage(resp.message || "登录失败", true);
                        }
                    }
                );
            } else {
                // 降级：使用明文请求
                var xhr = new XMLHttpRequest();
                xhr.open('POST', defines.apiUrl + '/api/v1/auth/wx-login', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var resp = JSON.parse(xhr.responseText);
                                if (resp.code === 0 && resp.data) {
                                    showMessage("登录成功", false);
                                    if (window.myglobal && window.myglobal.playerData) {
                                        window.myglobal.playerData.uniqueID = resp.data.player_id || "";
                                        window.myglobal.playerData.accountID = resp.data.account_id || "";
                                        window.myglobal.playerData.nickName = resp.data.nickname || "微信用户";
                                        window.myglobal.playerData.userName = resp.data.username || "";
                                        window.myglobal.playerData.avatar = resp.data.avatar || "";
                                        window.myglobal.playerData.gobal_count = resp.data.gold || 0;
                                        window.myglobal.playerData.token = resp.data.token || "";
                                        // 保存到本地存储
                                        window.myglobal.playerData.saveToLocal();
                                        console.log("【微信登录XHR】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
                                    }
                                    self.scheduleOnce(function() {
                                        popup.destroy();
                                        cc.director.loadScene("hallScene");
                                    }, 0.5);
                                } else {
                                    showMessage(resp.message || "登录失败", true);
                                }
                            } catch(e) {
                                showMessage("解析响应失败", true);
                            }
                        } else {
                            showMessage("网络请求失败", true);
                        }
                    }
                };
                xhr.send(JSON.stringify({ code: "test_code_" + Date.now() }));
            }
        });
        
        return popup;
    },

    _showUserAgreementPopup: function() {
        this._createAgreementPopup();
    },

    // 创建用户协议弹窗
    _createAgreementPopup: function() {
        var self = this;
        
        // ==================== 弹窗根节点 ====================
        var popup = new cc.Node("user_agreement_popup");
        popup.parent = this.node;
        popup.setContentSize(cc.size(1280, 720));
        popup.setPosition(0, 0);
        popup.zIndex = 1000;
        
        // ==================== 半透明黑色背景遮罩 ====================
        var bgMask = new cc.Node("bg_mask");
        bgMask.parent = popup;
        bgMask.setContentSize(cc.size(1280, 720));
        bgMask.setPosition(0, 0);
        var bgMaskSprite = bgMask.addComponent(cc.Sprite);
        bgMaskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgMask.color = new cc.Color(0, 0, 0);
        bgMask.opacity = 180;
        
        // ==================== 主面板 ====================
        var panel = new cc.Node("content_panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(900, 520));
        panel.setPosition(0, 0);
        var panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = new cc.Color(255, 250, 240);
        
        // 加载背景图片
        cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                panelSprite.spriteFrame = spriteFrame;
            }
        });

        // ==================== 标题 ====================
        var titleNode = new cc.Node("title_label");
        titleNode.parent = panel;
        titleNode.setContentSize(cc.size(300, 60));
        titleNode.setPosition(0, 230);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "用户协议";
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 60;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(30, 30, 30);

        // ==================== 关闭按钮 ====================
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(60, 60));
        closeBtn.setPosition(400, 230);
        
        var closeBtnBg = new cc.Node("bg");
        closeBtnBg.parent = closeBtn;
        closeBtnBg.setContentSize(cc.size(50, 50));
        closeBtnBg.setPosition(0, 0);
        var closeBgSprite = closeBtnBg.addComponent(cc.Sprite);
        closeBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        closeBtnBg.color = new cc.Color(255, 255, 255);
        
        var closeLabelNode = new cc.Node("x");
        closeLabelNode.parent = closeBtn;
        closeLabelNode.setPosition(0, 0);
        var closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 40;
        closeLabel.lineHeight = 50;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeLabelNode.color = new cc.Color(80, 80, 80);
        
        var closeBtnComp = closeBtn.addComponent(cc.Button);
        closeBtnComp.transition = cc.Button.Transition.SCALE;
        closeBtnComp.zoomScale = 1.2;
        closeBtnComp.interactable = true;
        
        var closeHandler = new cc.Component.EventHandler();
        closeHandler.target = this.node;
        closeHandler.component = "loginScene";
        closeHandler.handler = "_closeUserAgreementPopup";
        closeHandler.customEventData = "";
        closeBtnComp.clickEvents.push(closeHandler);

        // ==================== 分隔线 ====================
        var dividerLine = new cc.Node("divider");
        dividerLine.parent = panel;
        dividerLine.setContentSize(cc.size(850, 1));
        dividerLine.setPosition(0, 195);
        var dividerSprite = dividerLine.addComponent(cc.Sprite);
        dividerSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        dividerLine.color = new cc.Color(220, 220, 220);

        // ==================== 内容滚动区域 ====================
        // 整体上移，增加底部空间，添加滚动功能
        var scrollNode = new cc.Node("scroll_view");
        scrollNode.parent = panel;
        scrollNode.setContentSize(cc.size(820, 380));  // 调整宽度
        scrollNode.setPosition(0, 0);  // 上移
        
        // 添加 ScrollView 组件实现滚动功能
        var scrollView = scrollNode.addComponent(cc.ScrollView);
        scrollView.horizontal = false;  // 禁用水平滚动
        scrollView.vertical = true;     // 启用垂直滚动
        scrollView.inertia = true;      // 滚动惯性
        scrollView.elastic = true;      // 弹性效果
        
        var viewNode = new cc.Node("view");
        viewNode.parent = scrollNode;
        viewNode.setContentSize(cc.size(820, 380));  // 调整宽度
        viewNode.setPosition(0, 0);
        
        var mask = viewNode.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        
        var contentNode = new cc.Node("content");
        contentNode.parent = viewNode;
        contentNode.anchorX = 0.5;
        contentNode.anchorY = 1;
        contentNode.setPosition(0, 190);  // 居中对齐
        contentNode.setContentSize(cc.size(820, 800));  // 增加高度以容纳所有内容
        
        // 设置 ScrollView 的 content 属性
        scrollView.content = contentNode;
        
        var richTextNode = new cc.Node("rich_text");
        richTextNode.parent = contentNode;
        richTextNode.anchorX = 0;
        richTextNode.anchorY = 1;
        richTextNode.setPosition(-385, -15);  // 增加左边距，文字整体上移
        
        var richText = richTextNode.addComponent(cc.RichText);
        richText.fontSize = 16;  // 字号加大：14 -> 16
        richText.lineHeight = 26;  // 行高加大：24 -> 26
        richText.maxWidth = 760;  // 调整宽度，确保左右边距
        
        // 设置文字颜色为黑色
        var agreementText = "<b><color=#000000>用户协议</color></b>\n\n" +
            "<color=#000000>欢迎使用本游戏！在使用前，请仔细阅读以下协议：</color>\n\n" +
            "<b><color=#000000>一、服务条款</color></b>\n" +
            "<color=#000000>1. 用户应遵守国家法律法规，文明游戏。</color>\n" +
            "<color=#000000>2. 禁止使用外挂、作弊软件等破坏游戏公平性的行为。</color>\n" +
            "<color=#000000>3. 用户账号安全由用户自行负责，请妥善保管账号密码。</color>\n\n" +
            "<b><color=#000000>二、隐私政策</color></b>\n" +
            "<color=#000000>1. 我们会收集必要的用户信息用于提供服务。</color>\n" +
            "<color=#000000>2. 我们承诺保护用户隐私，不会向第三方泄露用户信息。</color>\n" +
            "<color=#000000>3. 用户有权要求删除个人数据。</color>\n\n" +
            "<b><color=#000000>三、免责声明</color></b>\n" +
            "<color=#000000>1. 因不可抗力导致的服务中断，我们不承担责任。</color>\n" +
            "<color=#000000>2. 用户因违规操作造成的损失，由用户自行承担。</color>\n\n" +
            "<color=#000000>如有疑问，请联系客服。</color>";
        
        richText.string = agreementText;
        
        // 滚动到顶部
        scrollView.scrollToTop(0);

        this._userAgreementPopup = popup;
    },

    _closeUserAgreementPopup: function() {
        if (this._userAgreementPopup) {
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
        }
    },
    
    // 销毁时清理
    onDestroy () {
        this._removeGlobalTouchForMusic();
    }
});
