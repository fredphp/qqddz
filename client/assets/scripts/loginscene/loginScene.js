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
        }.bind(this), 0.3);
        
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
        
        console.log("找到 check_mark 节点，位置:", checkMarkNode.x, checkMarkNode.y);
        this._checkMarkNode = checkMarkNode;
        
        // 初始状态：隐藏对勾
        checkMarkNode.opacity = 0;
        console.log("初始状态：对勾隐藏 (opacity = 0)");
        
        // 创建边框
        this._createBorder(checkMarkNode);
        
        // 创建点击区域
        this._createClickArea(checkMarkNode);
        
        console.log("=== 复选框初始化完成 ===");
    },
    
    // 创建边框
    _createBorder: function(checkMarkNode) {
        console.log("创建边框...");
        
        // 创建边框节点
        var borderNode = new cc.Node("checkbox_border");
        borderNode.parent = checkMarkNode.parent;
        
        // 设置位置（与 check_mark 相同）
        borderNode.x = checkMarkNode.x;
        borderNode.y = checkMarkNode.y;
        borderNode.zIndex = checkMarkNode.zIndex - 1;
        
        // 设置大小
        var size = 26;
        borderNode.width = size;
        borderNode.height = size;
        borderNode.anchorX = 0.5;
        borderNode.anchorY = 0.5;
        
        // 添加 Sprite 组件作为背景
        var sprite = borderNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        
        // 创建白色纹理
        var texture = new cc.Texture2D();
        var pixel = new Uint8Array([255, 255, 255, 255]);
        texture.initWithData(pixel, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        
        var sf = new cc.SpriteFrame(texture);
        sprite.spriteFrame = sf;
        
        // 设置边框颜色（深灰色）
        borderNode.color = new cc.Color(100, 100, 100);
        
        // 保存引用
        this._borderNode = borderNode;
        
        // 添加 Graphics 绘制边框线
        var graphics = borderNode.addComponent(cc.Graphics);
        graphics.strokeColor = new cc.Color(50, 50, 50);
        graphics.lineWidth = 2;
        
        // 绘制矩形边框
        var half = size / 2;
        graphics.rect(-half, -half, size, size);
        graphics.stroke();
        
        this._borderGraphics = graphics;
        
        console.log("边框创建完成");
    },
    
    // 创建点击区域
    _createClickArea: function(checkMarkNode) {
        console.log("创建点击区域...");
        
        var self = this;
        
        // 获取 agreement_label 节点
        var agreementLabel = this.node.getChildByName("agreement_label");
        if (agreementLabel) {
            this._agreementLabel = agreementLabel;
        }
        
        // 方法1: 给 check_mark 添加点击
        this._addNodeClick(checkMarkNode, function() {
            console.log("check_mark 点击");
            self._toggleCheckbox();
        });
        
        // 方法2: 给 agreement_label 添加点击
        if (agreementLabel) {
            this._addNodeClick(agreementLabel, function() {
                console.log("agreement_label 点击");
                self._toggleCheckbox();
            });
        }
        
        // 方法3: 给边框节点添加点击
        if (this._borderNode) {
            this._addNodeClick(this._borderNode, function() {
                console.log("border 点击");
                self._toggleCheckbox();
            });
        }
    },
    
    // 给节点添加点击功能
    _addNodeClick: function(node, callback) {
        // 确保节点有碰撞区域
        if (!node.getComponent(cc.BlockInputEvents)) {
            node.addComponent(cc.BlockInputEvents);
        }
        
        // 添加触摸事件
        node.on(cc.Node.EventType.TOUCH_START, function(event) {
            // 吞噬事件，防止穿透
            event.stopPropagation();
        }, this);
        
        node.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            if (callback) callback();
        }, this);
        
        // 如果有 Button 组件，也配置它
        var button = node.getComponent(cc.Button);
        if (!button) {
            button = node.addComponent(cc.Button);
        }
        button.interactable = true;
        button.transition = cc.Button.Transition.NONE;
        
        console.log("点击事件已添加到:", node.name);
    },
    
    // 切换复选框状态
    _toggleCheckbox: function() {
        this._isChecked = !this._isChecked;
        console.log("=== 复选框状态:", this._isChecked, "===");
        
        if (this._isChecked) {
            // 显示对勾
            if (this._checkMarkNode) {
                this._checkMarkNode.opacity = 255;
            }
            // 边框变绿
            if (this._borderNode) {
                this._borderNode.color = new cc.Color(0, 180, 0);
            }
            if (this._borderGraphics) {
                this._borderGraphics.clear();
                this._borderGraphics.strokeColor = new cc.Color(0, 150, 0);
                this._borderGraphics.lineWidth = 2;
                this._borderGraphics.rect(-13, -13, 26, 26);
                this._borderGraphics.stroke();
            }
        } else {
            // 隐藏对勾
            if (this._checkMarkNode) {
                this._checkMarkNode.opacity = 0;
            }
            // 边框变灰
            if (this._borderNode) {
                this._borderNode.color = new cc.Color(100, 100, 100);
            }
            if (this._borderGraphics) {
                this._borderGraphics.clear();
                this._borderGraphics.strokeColor = new cc.Color(50, 50, 50);
                this._borderGraphics.lineWidth = 2;
                this._borderGraphics.rect(-13, -13, 26, 26);
                this._borderGraphics.stroke();
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
        
        if (!myglobal.socket) {
            if (!myglobal.init()) {
                console.error("myglobal 初始化失败");
                this._showError("初始化失败，请刷新页面重试");
                return;
            }
        }
        
        console.log("loginScene 初始化完成");
        
        // 检查是否有保存的重连信息（刷新页面后恢复）
        var reconnectInfo = myglobal.socket.loadReconnectInfo()
        console.log("检查重连信息:", reconnectInfo)
        
        if (reconnectInfo.token && reconnectInfo.playerId) {
            console.log("发现保存的重连信息，尝试恢复...")
            this._showLoading(true, "正在恢复登录状态...")
            
            // 先初始化 WebSocket 连接
            if (myglobal.socket && myglobal.socket.initSocket) {
                myglobal.socket.initSocket()
            }
            
            // 监听房间恢复事件
            myglobal.socket.onRoomRestored(function(data) {
                console.log("房间恢复成功，跳转到游戏场景")
                self._showLoading(false)
                
                // 恢复玩家数据
                myglobal.playerData.playerId = data.player_id
                myglobal.playerData.nickName = data.player_name
                
                // 跳转到游戏场景
                cc.director.loadScene("gameScene")
            })
            
            // 监听普通连接成功（不在房间中）
            var evt = window.eventLister ? window.eventLister({}) : null
            if (evt) {
                evt.on("connection_success", function(data) {
                    console.log("连接成功，不在房间中，跳转到大厅")
                    self._showLoading(false)
                    myglobal.playerData.playerId = data.player_id
                    myglobal.playerData.nickName = data.player_name
                    myglobal.playerData.gobal_count = data.gold || 0
                    cc.director.loadScene("hallScene")
                })
            }
            
            return
        }
        
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
        
        this._updateLoginUI();
        this._initLoginButtons();
        this._initUserAgreementLink();
    },
    
    _initLoginButtons: function() {
        var self = this;
        
        // 微信登录按钮
        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            this._addNodeClick(wxLoginNode, function() {
                self._doWxLogin();
            });
            console.log("微信登录按钮初始化完成");
        }
        
        // 手机号登录按钮
        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            this._addNodeClick(phoneLoginNode, function() {
                self._doPhoneLogin();
            });
            console.log("手机号登录按钮初始化完成");
        }
    },
    
    _initUserAgreementLink: function() {
        var self = this;
        
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            linkNode.active = true;
            this._addNodeClick(linkNode, function() {
                self._showUserAgreement();
            });
            console.log("用户协议链接初始化完成");
        }
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
    
    _updateLoginUI: function() {},
    
    start () {
        console.log("loginScene start");
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
            try {
                var popup = cc.instantiate(this.user_agreement_prefabs);
                popup.parent = this.node;
            } catch (e) {
                self._showError("无法显示用户协议");
            }
        } else {
            cc.resources.load("prefabs/user_agreement", cc.Prefab, function(err, prefab) {
                if (err) {
                    self._showError("无法显示用户协议");
                    return;
                }
                try {
                    var popup = cc.instantiate(prefab);
                    popup.parent = self.node;
                } catch (e) {
                    self._showError("无法显示用户协议");
                }
            });
        }
    }
});
