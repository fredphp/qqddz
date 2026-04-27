// 使用全局变量，不使用 require

// 脚本加载日志
console.log("📌 hallScene.js 脚本已加载");

cc.Class({
    extends: cc.Component,
    name: 'hallScene', 

    properties: {
        nickname_label: cc.Label,
        headimage: cc.Sprite,
        gobal_count: cc.Label,
        creatroom_prefabs: cc.Prefab,
        joinroom_prefabs: cc.Prefab,
        user_agreement_prefabs: cc.Prefab,
    },

    onLoad () {
        console.log("=== hallScene onLoad ===");
        
        if (!window.myglobal) {
            console.warn("myglobal 未定义，等待初始化...");
            this._waitForMyglobal();
            return;
        }
        
        this._initWithPlayerData();
    },
    
    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;
        
        var check = function() {
            attempts++;
            if (window.myglobal && window.myglobal.playerData) {
                console.log("✅ myglobal 已就绪");
                self._initWithPlayerData();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 100);
            } else {
                console.error("myglobal 初始化超时");
                cc.director.loadScene("loginScene");
            }
        };
        
        setTimeout(check, 100);
    },
    
    _initWithPlayerData: function() {
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.playerData) {
            console.error("myglobal 或 playerData 未定义");
            cc.director.loadScene("loginScene");
            return;
        }
        
        var playerData = myglobal.playerData;
        
        if (!playerData.token) {
            cc.director.loadScene("loginScene");
            return;
        }
        
        var self = this;
        
        // 检查 verifyToken 是否存在
        if (typeof myglobal.verifyToken !== 'function') {
            console.warn("verifyToken 方法不存在，跳过验证");
            self._initUIAfterAuth();
            return;
        }
        
        try {
            myglobal.verifyToken(function(valid, message) {
                if (!valid) {
                    cc.director.loadScene("loginScene");
                    return;
                }
                self._initUIAfterAuth();
            });
        } catch (e) {
            console.error("verifyToken 调用失败:", e);
            self._initUIAfterAuth();
        }
    },
    
    _initUIAfterAuth: function() {
        console.log("=== _initUIAfterAuth ===");
        
        try {
            var myglobal = window.myglobal;
            var playerData = myglobal ? myglobal.playerData : null;
            
            if (!playerData) {
                console.warn("playerData 为空，使用默认值");
                playerData = { nickName: "游客", gobal_count: 0, avatarUrl: null };
            }
            
            // 设置昵称
            if (this.nickname_label) {
                this.nickname_label.string = playerData.nickName || "游客";
            }
            
            // 设置金币
            if (this.gobal_count) {
                this.gobal_count.string = ":" + (playerData.gobal_count || 0);
                this.gobal_count.fontSize = 64;
                this.gobal_count.lineHeight = 72;
            }
            
            this._adjustGoldElementsPosition();
            this._loadUserAvatar(playerData.avatarUrl);
            this.roomConfigs = [];
            this._playHallBackgroundMusic();
            this._adjustBottomButtons();
            this._hideBackgroundCharacters();
            this._initWebSocket();  // 初始化 WebSocket 连接
            this._startOnlineMonitoring();  // 启动在线状态监测
            this._fetchRoomConfigs();
            this._removeNoticeBoard();
            
            console.log("=== _initUIAfterAuth 完成 ===");
        } catch (e) {
            console.error("_initUIAfterAuth 异常:", e);
        }
    },
    
    // 启动在线状态监测
    _startOnlineMonitoring: function() {
        var myglobal = window.myglobal;
        if (!myglobal) {
            console.warn("myglobal 未定义，无法启动在线监测");
            return;
        }
        
        console.log("🔍 大厅场景：启动在线状态监测");
        
        // 启动全局在线监测
        if (myglobal.startOnlineMonitoring) {
            myglobal.startOnlineMonitoring();
        }
        
        // 监听在线状态变化
        var self = this;
        this._onlineStatusHandler = function(isOnline) {
            console.log("大厅场景：在线状态变化 -> " + (isOnline ? "在线" : "离线"));
            // 只有在非初始化状态下才显示离线提示
            if (!isOnline && !myglobal._isInitializing) {
                self._showOfflineMessage();
            } else if (!isOnline && myglobal._isInitializing) {
                console.log("⏳ 初始化缓冲期，不显示离线提示");
            }
        };
        
        if (myglobal.addOnlineStatusListener) {
            myglobal.addOnlineStatusListener(this._onlineStatusHandler);
        }
        
        // 监听强制下线事件
        if (myglobal.eventlister) {
            myglobal.eventlister.on("force_logout", function(data) {
                console.warn("🚫 收到强制下线事件:", data);
                self._handleForceLogout(data);
            });
        }
    },
    
    // 显示离线提示
    _showOfflineMessage: function() {
        this._showMessage("网络连接已断开，正在重新连接...");
    },
    
    // 处理强制下线
    _handleForceLogout: function(data) {
        var reason = data.reason || "您已被强制下线";
        this._showMessage(reason);
        
        // 停止监测
        var myglobal = window.myglobal;
        if (myglobal && myglobal.stopOnlineMonitoring) {
            myglobal.stopOnlineMonitoring();
        }
        
        // 延迟跳转到登录页面
        this.scheduleOnce(function() {
            cc.director.loadScene("loginScene");
        }, 2);
    },
    
    // 停止在线状态监测
    _stopOnlineMonitoring: function() {
        var myglobal = window.myglobal;
        
        if (myglobal && myglobal.stopOnlineMonitoring) {
            myglobal.stopOnlineMonitoring();
        }
        
        if (myglobal && myglobal.removeOnlineStatusListener && this._onlineStatusHandler) {
            myglobal.removeOnlineStatusListener(this._onlineStatusHandler);
            this._onlineStatusHandler = null;
        }
    },
    
    // 初始化 WebSocket 连接
    _initWebSocket: function() {
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            console.warn("socket 未初始化");
            return;
        }
        
        // 检查是否已连接
        if (myglobal.socket.isConnected && myglobal.socket.isConnected()) {
            console.log("WebSocket 已连接");
            return;
        }
        
        console.log("初始化 WebSocket 连接...");
        
        // 初始化 WebSocket
        if (myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }
    },
    
    _hideBackgroundCharacters: function() {
        var xiongmao1 = this.node.getChildByName("xiongmao1");
        var xiongmao2 = this.node.getChildByName("xiongmao2");
        if (xiongmao1) xiongmao1.active = false;
        if (xiongmao2) xiongmao2.active = false;
    },
    
    // 调整底部按钮 - 调小并靠右排列
    _adjustBottomButtons: function() {
        var self = this;
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 底部按钮名称列表
        var buttonNames = [
            "btn_create_room",
            "btn_join_room", 
            "btn_user_agreement",
            "user_agreement",
            "btn_setting",
            "btn_help"
        ];
        
        // 收集存在的按钮
        var buttons = [];
        for (var i = 0; i < buttonNames.length; i++) {
            var btn = this.node.getChildByName(buttonNames[i]);
            if (btn && btn.active !== false) {
                buttons.push(btn);
            }
        }
        
        // 如果没找到，尝试查找其他可能的按钮
        if (buttons.length === 0) {
            var allChildren = this.node.children;
            for (var i = 0; i < allChildren.length; i++) {
                var child = allChildren[i];
                if (child.name && child.name.toLowerCase().indexOf('btn') >= 0) {
                    // 检查是否在底部区域
                    if (child.y < 0) {
                        buttons.push(child);
                    }
                }
            }
        }
        
        console.log("找到底部按钮数量: " + buttons.length);
        
        // 调整每个按钮
        var btnWidth = 120;   // 按钮宽度
        var btnHeight = 50;   // 按钮高度
        var btnGap = 15;      // 按钮间距
        var rightMargin = 30; // 右边距
        var bottomMargin = 30; // 底边距
        
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            
            // 禁用 Widget 组件
            var widget = btn.getComponent(cc.Widget);
            if (widget) widget.enabled = false;
            
            // 缩小按钮
            btn.scale = 0.7;
            
            // 设置锚点
            btn.anchorX = 1;  // 右锚点
            btn.anchorY = 0;  // 底锚点
            
            // 计算位置 - 从右往左排列
            var xPos = screenWidth / 2 - rightMargin - i * (btnWidth * 0.7 + btnGap);
            var yPos = -screenHeight / 2 + bottomMargin;
            
            btn.x = xPos;
            btn.y = yPos;
            
            console.log("按钮 " + btn.name + " 位置: (" + btn.x + ", " + btn.y + ")");
        }
    },
    
    _loadUserAvatar: function(avatarUrl) {
        var self = this;
        if (!this.headimage) return;

        if (!avatarUrl) {
            this._loadDefaultAvatar();
            return;
        }

        if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
            cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, function(err, texture) {
                if (err || !texture) {
                    self._loadDefaultAvatar();
                    return;
                }
                try {
                    var spriteFrame = new cc.SpriteFrame(texture);
                    if (spriteFrame) self.headimage.spriteFrame = spriteFrame;
                } catch (e) {
                    self._loadDefaultAvatar();
                }
            });
        } else {
            cc.resources.load('UI/headimage/' + avatarUrl, cc.SpriteFrame, function(err, spriteFrame) {
                if (err || !spriteFrame) {
                    self._loadDefaultAvatar();
                    return;
                }
                try {
                    self.headimage.spriteFrame = spriteFrame;
                } catch (e) {
                    self._loadDefaultAvatar();
                }
            });
        }
    },

    _loadDefaultAvatar: function() {
        var self = this;
        cc.resources.load('UI/headimage/avatar_1', cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                try {
                    self.headimage.spriteFrame = spriteFrame;
                } catch (e) {}
            }
        });
    },

    _playHallBackgroundMusic: function() {
        var isopen_sound = window.isopen_sound || 1;
        if (!isopen_sound) return;
        
        try {
            cc.audioEngine.stopMusic();
            cc.audioEngine.stopAllEffects();
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    try {
                        cc.audioEngine.playMusic(clip, true);
                    } catch(e) {}
                }
            });
        } catch(e) {}
    },
    
    _fetchRoomConfigs: function() {
        var self = this;
        var apiUrl = window.defines ? window.defines.apiUrl : '';
        var cryptoKey = window.defines ? window.defines.cryptoKey : '';
        
        // 如果没有配置 API，使用默认配置
        if (!apiUrl || !window.HttpAPI) {
            console.log("使用默认房间配置");
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        try {
            // 清除缓存
            if (HttpAPI._roomConfigCache) {
                HttpAPI._roomConfigCache = null;
            }
            try { localStorage.removeItem('room_config_cache'); } catch (e) {}
            
            // 请求 API
            HttpAPI.get(
                apiUrl + '/api/v1/room/config/list',
                cryptoKey,
                function(err, result) {
                    if (err) {
                        console.warn("API请求失败:", err);
                        self._initRoomButtons(self._getDefaultRoomConfigs());
                        return;
                    }
                    
                    var configs = null;
                    if (result && result.code === 0 && result.data) {
                        configs = result.data;
                    } else if (result && Array.isArray(result)) {
                        configs = result;
                    }
                    
                    if (configs && configs.length > 0) {
                        self.roomConfigs = configs;
                        self._initRoomButtons(configs);
                    } else {
                        self._initRoomButtons(self._getDefaultRoomConfigs());
                    }
                }
            );
        } catch (e) {
            console.error("_fetchRoomConfigs 异常:", e);
            self._initRoomButtons(self._getDefaultRoomConfigs());
        }
    },
    
    _getDefaultRoomConfigs: function() {
        return [
            { id: 1, room_name: "初级房", room_type: 2, base_score: 1, multiplier: 1, min_gold: 0, max_gold: 50000, description: "底分1", status: 1, sort_order: 0, room_category: 1 },
            { id: 2, room_name: "中级房", room_type: 3, base_score: 2, multiplier: 1, min_gold: 50000, max_gold: 200000, description: "底分2", status: 1, sort_order: 1, room_category: 1 },
            { id: 3, room_name: "高级房", room_type: 4, base_score: 5, multiplier: 2, min_gold: 200000, max_gold: 1000000, description: "底分5", status: 1, sort_order: 2, room_category: 2 },
            { id: 4, room_name: "大师房", room_type: 5, base_score: 10, multiplier: 3, min_gold: 1000000, max_gold: 5000000, description: "底分10", status: 1, sort_order: 3, room_category: 2 }
        ];
    },
    
    _hideUnwantedButtons: function() {
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        if (createRoomBtn) createRoomBtn.active = false;
        if (joinRoomBtn) joinRoomBtn.active = false;
    },
    
    // ============================================================
    // 核心方法：初始化房间按钮
    // ============================================================
    _initRoomButtons: function(rooms) {
        var self = this;
        
        console.log("========================================");
        console.log("开始初始化房间按钮");
        console.log("========================================");
        
        // 按钮名称映射
        var buttonNameMap = {
            2: "btn_room_junior",
            3: "btn_room_middle",
            4: "btn_room_senior",
            5: "btn_room_master",
            6: "btn_room_supreme"
        };
        
        // 先隐藏所有房间按钮
        for (var key in buttonNameMap) {
            var btnNode = this.node.getChildByName(buttonNameMap[key]);
            if (btnNode) btnNode.active = false;
        }
        
        // ============================================================
        // 【一、数据处理】所有房间合并到一个数组，按 sort_order 排序
        // ============================================================
        
        var allRooms = [];
        
        for (var i = 0; i < rooms.length; i++) {
            var config = rooms[i];
            var sortOrder = config.sort_order || config.sortOrder || config.sort || 0;
            var roomType = config.room_type || config.roomType;
            var buttonName = buttonNameMap[roomType];
            
            if (!buttonName) continue;
            
            var btnNode = this.node.getChildByName(buttonName);
            if (!btnNode) continue;
            
            var roomData = {
                node: btnNode,
                config: config,
                roomType: roomType,
                sortOrder: sortOrder,
                roomName: config.room_name || config.roomName || "未知房间",
                minGold: config.min_gold || config.minGold || 0,
                maxGold: config.max_gold || config.maxGold || 0
            };
            
            allRooms.push(roomData);
        }
        
        // 按 sort_order 升序排序
        allRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        
        console.log("房间总数: " + allRooms.length + " 个");
        
        // 配置所有卡片
        for (var i = 0; i < allRooms.length; i++) {
            var room = allRooms[i];
            room.node.active = true;
            room.node.roomConfig = room.config;
            
            self._loadRoomButtonBg(room.node, room.roomType);
            self._updateMinGoldLabel(room.node, room.config);
            
            var button = room.node.getComponent(cc.Button);
            if (button) {
                button.transition = cc.Button.Transition.SCALE;
                button.duration = 0.1;
                button.zoomScale = 1.1;
            }
            
            (function(config, node, roomName) {
                node.off(cc.Node.EventType.TOUCH_END);
                node.on(cc.Node.EventType.TOUCH_END, function(event) {
                    event.stopPropagation();
                    self._onRoomButtonClick(config);
                });
            })(room.config, room.node, room.roomName);
        }
        
        // 渲染布局 - 所有卡片排成一行
        this._renderRoomLayout(allRooms);
    },
    
    // ============================================================
    // 布局渲染 - 所有卡片水平排成一行
    // ============================================================
    _renderRoomLayout: function(allRooms) {
        var self = this;
        
        // 清理旧容器
        var oldPanel = this.node.getChildByName("CardContainer");
        var oldLeftPanel = this.node.getChildByName("LeftArea");
        var oldRightPanel = this.node.getChildByName("RightArea");
        if (oldPanel) oldPanel.destroy();
        if (oldLeftPanel) oldLeftPanel.destroy();
        if (oldRightPanel) oldRightPanel.destroy();
        
        if (allRooms.length === 0) {
            console.log("没有房间卡片");
            return;
        }
        
        // ============================================================
        // 参数设置
        // ============================================================
        var cardWidth = 180;       // 卡片宽度
        var cardHeight = 120;      // 卡片高度
        var gapX = 30;             // 卡片水平间距
        
        // 画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 计算容器宽度
        var totalCardsWidth = allRooms.length * cardWidth + (allRooms.length - 1) * gapX;
        var panelWidth = Math.max(totalCardsWidth + 40, screenWidth - 100);
        var panelHeight = cardHeight + 40;
        
        // 容器位置
        var verticalOffset = 50;   // 垂直偏移
        
        console.log("===== 布局调试 =====");
        console.log("房间总数: " + allRooms.length + "个");
        console.log("卡片: " + cardWidth + "x" + cardHeight + ", 水平间距: " + gapX);
        console.log("总宽度: " + totalCardsWidth);
        
        // ============================================================
        // 创建容器 - 所有卡片水平排成一行
        // ============================================================
        var cardPanel = new cc.Node("CardContainer");
        cardPanel.setContentSize(panelWidth, panelHeight);
        cardPanel.anchorX = 0.5;
        cardPanel.anchorY = 0.5;
        cardPanel.x = 0;  // 居中
        cardPanel.y = verticalOffset;
        cardPanel.parent = this.node;
        
        // 放置所有卡片 - 水平排列
        var startX = -totalCardsWidth / 2 + cardWidth / 2;
        for (var i = 0; i < allRooms.length; i++) {
            var room = allRooms[i];
            
            var widget = room.node.getComponent(cc.Widget);
            if (widget) widget.enabled = false;
            room.node.anchorX = 0.5;
            room.node.anchorY = 0.5;
            room.node.scale = 1;
            
            room.node.active = true;
            room.node.parent = cardPanel;
            
            // 卡片水平位置：从左到右排列
            room.node.x = startX + i * (cardWidth + gapX);
            // 卡片垂直位置：居中
            room.node.y = 0;
            
            console.log("卡片[" + i + "] " + room.roomName + " 位置: (" + room.node.x + ", " + room.node.y + ")");
        }
        
        console.log("✅ 布局完成 - 所有卡片水平排成一行");
    },
    
    // 添加区域标题
    _addAreaTitle: function(panel, titleText, x, y) {
        var titleNode = new cc.Node("AreaTitle");
        titleNode.setPosition(x, y);
        titleNode.anchorX = 0.5;
        titleNode.anchorY = 0.5;
        
        var label = titleNode.addComponent(cc.Label);
        label.string = titleText;
        label.fontSize = 28;
        label.lineHeight = 36;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        
        titleNode.color = cc.color(255, 215, 0);
        
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        
        titleNode.parent = panel;
    },
    
    // 准备卡片节点（响应式，支持缩放）
    _prepareCardNodeResponsive: function(node, cardScale) {
        // 禁用 Widget 组件（防止自动拉伸）
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
        }
        
        // 锚点设为中心
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        
        // 应用缩放（不拉伸，保持比例）
        node.scale = cardScale || 1;
    },
    
    // 添加区域标题
    _addAreaTitle: function(panel, title, x, y) {
        var titleNode = new cc.Node("Title");
        titleNode.setPosition(x, y);
        titleNode.anchorX = 0;
        titleNode.anchorY = 0.5;
        
        var label = titleNode.addComponent(cc.Label);
        label.string = title;
        label.fontSize = 28;
        label.lineHeight = 36;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        titleNode.color = cc.color(255, 215, 0);
        
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        
        titleNode.parent = panel;
    },
    
    // 加载房间按钮背景图
    _loadRoomButtonBg: function(btnNode, roomType) {
        var self = this;
        var sprite = btnNode.getComponent(cc.Sprite);
        if (!sprite) return;
        
        cc.resources.load('UI/btn_happy_' + roomType, cc.SpriteFrame, function(err, spriteFrame) {
            if (err || !spriteFrame) {
                self._loadDefaultRoomButtonBg(btnNode);
                return;
            }
            try {
                sprite.spriteFrame = spriteFrame;
            } catch (e) {
                self._loadDefaultRoomButtonBg(btnNode);
            }
        });
    },
    
    _loadDefaultRoomButtonBg: function(btnNode) {
        var sprite = btnNode.getComponent(cc.Sprite);
        if (!sprite) return;
        
        cc.resources.load('UI/btn_happy_2', cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                try {
                    sprite.spriteFrame = spriteFrame;
                } catch (e) {}
            }
        });
    },
    
    // 更新最低豆子显示（使用 min_gold 字段）
    _updateMinGoldLabel: function(btnNode, config) {
        var goldLabelNode = btnNode.getChildByName("min_gold_label");
        
        if (!goldLabelNode) {
            goldLabelNode = new cc.Node("min_gold_label");
            var label = goldLabelNode.addComponent(cc.Label);
            label.fontSize = 28;       // 放大字体
            label.lineHeight = 36;      // 放大行高
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            goldLabelNode.anchorX = 0.5;
            goldLabelNode.anchorY = 0.5;
            
            var outline = goldLabelNode.addComponent(cc.LabelOutline);
            outline.color = cc.color(0, 0, 0);
            outline.width = 2;
            
            goldLabelNode.parent = btnNode;
        }
        
        var label = goldLabelNode.getComponent(cc.Label);
        var minGold = config.min_gold || config.minGold || 0;
        label.string = "最低 " + this._formatGold(minGold) + " 豆";
        goldLabelNode.color = cc.color(255, 215, 0);
        goldLabelNode.setPosition(0, -btnNode.height/2 + 30);
    },
    
    // 房间按钮点击处理 - 直接进入房间列表全屏场景（无加载进度条）
    _onRoomButtonClick: function(roomConfig) {
        var self = this;
        var myglobal = window.myglobal;
        var playerGold = myglobal && myglobal.playerData ? myglobal.playerData.gobal_count : 0;
        
        var minGold = roomConfig.min_gold || roomConfig.minGold || 0;
        var maxGold = roomConfig.max_gold || roomConfig.maxGold || 0;
        
        if (playerGold < minGold) {
            this._showMessage("豆子不足，需要 " + this._formatGold(minGold) + " 豆子才能进入");
            return;
        }
        
        if (maxGold > 0 && playerGold > maxGold) {
            this._showMessage("豆子超过上限，请前往更高级房间");
            return;
        }
        
        // 保存当前房间配置
        if (myglobal) {
            myglobal.currentRoomConfig = roomConfig;
            myglobal.currentRoomLevel = roomConfig.room_type;
            myglobal.currentRoomName = roomConfig.room_name;
        }
        
        // 直接进入房间列表全屏场景（无加载进度条，无卡顿）
        this._showRoomListScene(roomConfig, playerGold);
    },
    
    // ============================================================
    // 显示加载进度条
    // ============================================================
    _showLoadingProgress: function(roomConfig, playerGold) {
        var self = this;
        
        console.log("显示加载进度条...");
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建加载界面容器（全屏）
        var loadingNode = new cc.Node("LoadingProgressNode");
        loadingNode.setContentSize(cc.size(screenWidth, screenHeight));
        loadingNode.anchorX = 0.5;
        loadingNode.anchorY = 0.5;
        loadingNode.x = 0;
        loadingNode.y = 0;
        loadingNode.zIndex = 3000;
        loadingNode.parent = this.node;
        
        // 添加半透明黑色背景
        var bgNode = new cc.Node("Bg");
        bgNode.setContentSize(cc.size(screenWidth, screenHeight));
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = cc.color(20, 20, 40, 250);
        bgGraphics.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        bgGraphics.fill();
        bgNode.parent = loadingNode;
        
        // 添加装饰性背景图案
        this._addLoadingDecorations(loadingNode, screenWidth, screenHeight);
        
        // 标题文字
        var titleNode = new cc.Node("Title");
        titleNode.y = 150;
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "斗地主";
        titleLabel.fontSize = 56;
        titleLabel.lineHeight = 72;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = cc.color(255, 215, 0);
        
        // 添加标题描边
        var titleOutline = titleNode.addComponent(cc.LabelOutline);
        titleOutline.color = cc.color(139, 69, 19);
        titleOutline.width = 3;
        titleNode.parent = loadingNode;
        
        // 房间名称
        var roomNameNode = new cc.Node("RoomName");
        roomNameNode.y = 80;
        var roomNameLabel = roomNameNode.addComponent(cc.Label);
        roomNameLabel.string = "进入【" + roomConfig.room_name + "】";
        roomNameLabel.fontSize = 32;
        roomNameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        roomNameNode.color = cc.color(200, 200, 220);
        roomNameNode.parent = loadingNode;
        
        // 加载提示文字
        var tipNode = new cc.Node("Tip");
        tipNode.y = -100;
        var tipLabel = tipNode.addComponent(cc.Label);
        tipLabel.string = "正在加载资源...";
        tipLabel.fontSize = 24;
        tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tipNode.color = cc.color(150, 150, 170);
        tipNode.parent = loadingNode;
        
        // 进度条背景
        var progressBg = new cc.Node("ProgressBg");
        progressBg.setContentSize(cc.size(500, 30));
        progressBg.y = -160;
        var progressBgGraphics = progressBg.addComponent(cc.Graphics);
        progressBgGraphics.fillColor = cc.color(40, 40, 60, 255);
        progressBgGraphics.roundRect(-250, -15, 500, 30, 15);
        progressBgGraphics.fill();
        progressBgGraphics.strokeColor = cc.color(80, 80, 100);
        progressBgGraphics.lineWidth = 2;
        progressBgGraphics.roundRect(-250, -15, 500, 30, 15);
        progressBgGraphics.stroke();
        progressBg.parent = loadingNode;
        
        // 进度条填充
        var progressFill = new cc.Node("ProgressFill");
        progressFill.y = -160;
        var progressFillGraphics = progressFill.addComponent(cc.Graphics);
        progressFill.parent = loadingNode;
        
        // 进度百分比文字
        var percentNode = new cc.Node("Percent");
        percentNode.y = -160;
        var percentLabel = percentNode.addComponent(cc.Label);
        percentLabel.string = "0%";
        percentLabel.fontSize = 20;
        percentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        percentNode.color = cc.color(255, 255, 255);
        percentNode.parent = loadingNode;
        
        // 底部提示
        var bottomTipNode = new cc.Node("BottomTip");
        bottomTipNode.y = -220;
        var bottomTipLabel = bottomTipNode.addComponent(cc.Label);
        bottomTipLabel.string = "正在连接服务器...";
        bottomTipLabel.fontSize = 18;
        bottomTipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        bottomTipNode.color = cc.color(100, 100, 120);
        bottomTipNode.parent = loadingNode;
        
        // 加载提示文字数组
        var loadingTips = [
            "正在加载资源...",
            "正在连接服务器...",
            "正在获取房间列表...",
            "正在准备游戏数据...",
            "即将进入房间..."
        ];
        
        // 进度动画
        var progress = 0;
        var targetProgress = 100;
        var tipIndex = 0;
        
        var updateProgress = function() {
            if (progress >= targetProgress) {
                // 进度完成，显示房间列表场景
                self.scheduleOnce(function() {
                    if (loadingNode && loadingNode.isValid) {
                        loadingNode.destroy();
                    }
                    self._showRoomListScene(roomConfig, playerGold);
                }, 0.3);
                return;
            }
            
            // 增加进度
            progress += 2;
            if (progress > targetProgress) progress = targetProgress;
            
            // 更新进度条填充
            var fillWidth = (progress / 100) * 480;
            progressFillGraphics.clear();
            if (fillWidth > 0) {
                // 渐变色效果
                progressFillGraphics.fillColor = cc.color(76, 175, 80);
                progressFillGraphics.roundRect(-240, -12, fillWidth, 24, 12);
                progressFillGraphics.fill();
            }
            
            // 更新百分比文字
            percentLabel.string = progress + "%";
            
            // 更新加载提示文字
            var newTipIndex = Math.floor(progress / 20);
            if (newTipIndex < loadingTips.length && newTipIndex !== tipIndex) {
                tipIndex = newTipIndex;
                tipLabel.string = loadingTips[tipIndex];
                bottomTipLabel.string = loadingTips[tipIndex];
            }
            
            self.scheduleOnce(updateProgress, 0.05);
        };
        
        // 开始进度动画
        updateProgress();
    },
    
    // 添加加载界面装饰
    _addLoadingDecorations: function(parentNode, screenWidth, screenHeight) {
        // 添加扑克牌装饰（四角）
        var cardSymbols = ["♠", "♥", "♣", "♦"];
        var cardColors = [
            cc.color(50, 50, 70, 100),
            cc.color(180, 50, 50, 100),
            cc.color(50, 50, 70, 100),
            cc.color(180, 50, 50, 100)
        ];
        
        var positions = [
            cc.v2(-screenWidth/2 + 80, screenHeight/2 - 80),
            cc.v2(screenWidth/2 - 80, screenHeight/2 - 80),
            cc.v2(-screenWidth/2 + 80, -screenHeight/2 + 80),
            cc.v2(screenWidth/2 - 80, -screenHeight/2 + 80)
        ];
        
        for (var i = 0; i < 4; i++) {
            var symbolNode = new cc.Node("CardSymbol" + i);
            symbolNode.setPosition(positions[i]);
            var symbolLabel = symbolNode.addComponent(cc.Label);
            symbolLabel.string = cardSymbols[i];
            symbolLabel.fontSize = 60;
            symbolNode.color = cardColors[i];
            symbolNode.parent = parentNode;
        }
    },
    
    // ============================================================
    // 显示房间列表场景（全屏游戏界面）
    // ============================================================
    _showRoomListScene: function(roomConfig, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        
        console.log("显示房间列表全屏场景, 房间类型:", roomConfig.room_name);
        
        // 移除旧的界面
        var oldScene = this.node.getChildByName("RoomListScene");
        if (oldScene) oldScene.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建全屏房间列表场景
        var sceneNode = new cc.Node("RoomListScene");
        sceneNode.setContentSize(cc.size(screenWidth, screenHeight));
        sceneNode.anchorX = 0.5;
        sceneNode.anchorY = 0.5;
        sceneNode.x = 0;
        sceneNode.y = 0;
        sceneNode.zIndex = 2500;
        sceneNode.parent = this.node;
        
        // ===== 游戏风格渐变背景 =====
        this._drawGameBackground(sceneNode, screenWidth, screenHeight);
        
        // ===== 添加扑克牌装饰 =====
        this._addPokerDecorations(sceneNode, screenWidth, screenHeight);
        
        // ===== 顶部标题栏 =====
        this._drawTitleBar(sceneNode, screenWidth, screenHeight, roomConfig);
        
        // ===== 操作按钮区域 =====
        this._drawActionButtons(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);
        
        // ===== 房间列表区域 =====
        this._drawRoomListArea(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);
        
        // ===== 底部信息栏 =====
        this._drawBottomBar(sceneNode, screenWidth, screenHeight, playerGold, roomConfig);
    },
    
    // 绘制游戏风格渐变背景
    _drawGameBackground: function(parentNode, screenWidth, screenHeight) {
        // 主背景 - 深色渐变
        var bgNode = new cc.Node("GameBg");
        bgNode.setContentSize(cc.size(screenWidth, screenHeight));
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        
        // 模拟渐变 - 从深蓝到深紫
        var gradientSteps = 20;
        var stepHeight = screenHeight / gradientSteps;
        
        for (var i = 0; i < gradientSteps; i++) {
            var ratio = i / gradientSteps;
            var r = Math.floor(15 + ratio * 10);
            var g = Math.floor(20 + ratio * 15);
            var b = Math.floor(40 + ratio * 30);
            
            bgGraphics.fillColor = cc.color(r, g, b, 255);
            bgGraphics.rect(-screenWidth/2, -screenHeight/2 + i * stepHeight, screenWidth, stepHeight + 1);
            bgGraphics.fill();
        }
        
        // 添加装饰性纹理图案
        bgGraphics.strokeColor = cc.color(255, 255, 255, 8);
        bgGraphics.lineWidth = 1;
        for (var x = -screenWidth/2; x < screenWidth/2; x += 50) {
            bgGraphics.moveTo(x, -screenHeight/2);
            bgGraphics.lineTo(x, screenHeight/2);
        }
        for (var y = -screenHeight/2; y < screenHeight/2; y += 50) {
            bgGraphics.moveTo(-screenWidth/2, y);
            bgGraphics.lineTo(screenWidth/2, y);
        }
        bgGraphics.stroke();
        
        bgNode.parent = parentNode;
        
        // 添加发光边框
        var borderNode = new cc.Node("GlowBorder");
        var borderGraphics = borderNode.addComponent(cc.Graphics);
        borderGraphics.strokeColor = cc.color(255, 215, 0, 60);
        borderGraphics.lineWidth = 4;
        borderGraphics.roundRect(-screenWidth/2 + 10, -screenHeight/2 + 10, screenWidth - 20, screenHeight - 20, 15);
        borderGraphics.stroke();
        borderNode.parent = parentNode;
    },
    
    // 添加扑克牌装饰
    _addPokerDecorations: function(parentNode, screenWidth, screenHeight) {
        // 左侧扑克牌装饰
        this._drawPokerCard(parentNode, -screenWidth/2 + 80, 0, "A", "♠", cc.color(50, 50, 70), 0.8, -15);
        this._drawPokerCard(parentNode, -screenWidth/2 + 120, 50, "K", "♥", cc.color(180, 50, 50), 0.6, 10);
        
        // 右侧扑克牌装饰
        this._drawPokerCard(parentNode, screenWidth/2 - 80, 0, "Q", "♦", cc.color(180, 50, 50), 0.7, 15);
        this._drawPokerCard(parentNode, screenWidth/2 - 120, -40, "J", "♣", cc.color(50, 50, 70), 0.5, -10);
        
        // 角落装饰花纹
        this._drawCornerFloral(parentNode, -screenWidth/2 + 50, screenHeight/2 - 50, 0);
        this._drawCornerFloral(parentNode, screenWidth/2 - 50, screenHeight/2 - 50, 90);
        this._drawCornerFloral(parentNode, screenWidth/2 - 50, -screenHeight/2 + 50, 180);
        this._drawCornerFloral(parentNode, -screenWidth/2 + 50, -screenHeight/2 + 50, 270);
    },
    
    // 绘制扑克牌
    _drawPokerCard: function(parentNode, x, y, rank, suit, suitColor, scale, rotation) {
        var cardNode = new cc.Node("PokerCard");
        cardNode.setPosition(x, y);
        cardNode.rotation = rotation;
        cardNode.scale = scale || 0.5;
        cardNode.opacity = 120;
        
        var graphics = cardNode.addComponent(cc.Graphics);
        
        // 卡牌背景
        graphics.fillColor = cc.color(240, 235, 220, 200);
        graphics.roundRect(-30, -45, 60, 90, 8);
        graphics.fill();
        
        // 卡牌边框
        graphics.strokeColor = cc.color(180, 170, 150, 150);
        graphics.lineWidth = 2;
        graphics.roundRect(-30, -45, 60, 90, 8);
        graphics.stroke();
        
        // 内部装饰线
        graphics.strokeColor = cc.color(200, 190, 170, 100);
        graphics.lineWidth = 1;
        graphics.roundRect(-25, -40, 50, 80, 5);
        graphics.stroke();
        
        cardNode.parent = parentNode;
        
        // 花色
        var suitNode = new cc.Node("Suit");
        suitNode.y = 10;
        var suitLabel = suitNode.addComponent(cc.Label);
        suitLabel.string = suit;
        suitLabel.fontSize = 32;
        suitNode.color = suitColor;
        suitNode.parent = cardNode;
        
        // 点数
        var rankNode = new cc.Node("Rank");
        rankNode.y = -15;
        var rankLabel = rankNode.addComponent(cc.Label);
        rankLabel.string = rank;
        rankLabel.fontSize = 20;
        rankLabel.fontWeight = "bold";
        rankNode.color = suitColor;
        rankNode.parent = cardNode;
    },
    
    // 绘制角落花纹
    _drawCornerFloral: function(parentNode, x, y, rotation) {
        var floralNode = new cc.Node("Floral");
        floralNode.setPosition(x, y);
        floralNode.rotation = rotation;
        
        var graphics = floralNode.addComponent(cc.Graphics);
        graphics.strokeColor = cc.color(255, 215, 0, 80);
        graphics.lineWidth = 2;
        
        // 装饰曲线
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(20, 10, 30, 20, 40, 40);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(10, 20, 20, 30, 40, 40);
        graphics.stroke();
        
        // 装饰点
        graphics.fillColor = cc.color(255, 215, 0, 100);
        graphics.circle(40, 40, 3);
        graphics.fill();
        
        floralNode.parent = parentNode;
    },
    
    // 绘制标题栏
    _drawTitleBar: function(parentNode, screenWidth, screenHeight, roomConfig) {
        var titleBarY = screenHeight/2 - 60;
        
        // 标题背景装饰条
        var titleBgNode = new cc.Node("TitleBg");
        titleBgNode.setPosition(0, titleBarY);
        var titleGraphics = titleBgNode.addComponent(cc.Graphics);
        
        // 渐变效果背景
        titleGraphics.fillColor = cc.color(30, 30, 50, 230);
        titleGraphics.roundRect(-screenWidth/2 + 20, -35, screenWidth - 40, 70, 10);
        titleGraphics.fill();
        
        // 金色装饰边框
        titleGraphics.strokeColor = cc.color(255, 200, 50, 200);
        titleGraphics.lineWidth = 3;
        titleGraphics.roundRect(-screenWidth/2 + 20, -35, screenWidth - 40, 70, 10);
        titleGraphics.stroke();
        
        // 内部装饰线
        titleGraphics.strokeColor = cc.color(255, 215, 0, 80);
        titleGraphics.lineWidth = 1;
        titleGraphics.roundRect(-screenWidth/2 + 30, -28, screenWidth - 60, 56, 8);
        titleGraphics.stroke();
        
        titleBgNode.parent = parentNode;
        
        // 左侧装饰图标
        var leftIcon = new cc.Node("LeftIcon");
        leftIcon.setPosition(-screenWidth/2 + 100, titleBarY);
        var leftGraphics = leftIcon.addComponent(cc.Graphics);
        leftGraphics.fillColor = cc.color(255, 215, 0, 200);
        leftGraphics.circle(0, 0, 15);
        leftGraphics.fill();
        leftGraphics.fillColor = cc.color(30, 30, 50);
        leftGraphics.circle(0, 0, 10);
        leftGraphics.fill();
        leftIcon.parent = parentNode;
        
        // 右侧装饰图标
        var rightIcon = new cc.Node("RightIcon");
        rightIcon.setPosition(screenWidth/2 - 100, titleBarY);
        var rightGraphics = rightIcon.addComponent(cc.Graphics);
        rightGraphics.fillColor = cc.color(255, 215, 0, 200);
        rightGraphics.circle(0, 0, 15);
        rightGraphics.fill();
        rightGraphics.fillColor = cc.color(30, 30, 50);
        rightGraphics.circle(0, 0, 10);
        rightGraphics.fill();
        rightIcon.parent = parentNode;
        
        // 房间名称标题
        var titleNode = new cc.Node("RoomTitle");
        titleNode.setPosition(0, titleBarY + 5);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = roomConfig.room_name || "游戏房间";
        titleLabel.fontSize = 40;
        titleLabel.lineHeight = 48;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = cc.color(255, 230, 100);
        
        var titleOutline = titleNode.addComponent(cc.LabelOutline);
        titleOutline.color = cc.color(100, 60, 0);
        titleOutline.width = 3;
        titleNode.parent = parentNode;
        
        // 副标题 - 房间信息
        var subTitleNode = new cc.Node("SubTitle");
        subTitleNode.setPosition(0, titleBarY - 25);
        var subTitleLabel = subTitleNode.addComponent(cc.Label);
        subTitleLabel.string = "底分 " + (roomConfig.base_score || 1) + "  |  倍率 " + (roomConfig.multiplier || 1) + "x  |  " + (roomConfig.description || "经典斗地主");
        subTitleLabel.fontSize = 18;
        subTitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        subTitleNode.color = cc.color(200, 180, 120);
        subTitleNode.parent = parentNode;
    },
    
    // 绘制操作按钮区域
    _drawActionButtons: function(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
        var self = this;
        var btnBarY = screenHeight/2 - 130;
        
        // 左侧 - 搜索区域
        var searchX = -screenWidth/2 + 200;
        
        // 搜索框背景
        var searchBgNode = new cc.Node("SearchBg");
        searchBgNode.setPosition(searchX, btnBarY);
        var searchGraphics = searchBgNode.addComponent(cc.Graphics);
        searchGraphics.fillColor = cc.color(25, 25, 35, 220);
        searchGraphics.roundRect(-90, -18, 180, 36, 18);
        searchGraphics.fill();
        searchGraphics.strokeColor = cc.color(100, 100, 120, 180);
        searchGraphics.lineWidth = 2;
        searchGraphics.roundRect(-90, -18, 180, 36, 18);
        searchGraphics.stroke();
        searchBgNode.parent = parentNode;
        
        // 搜索图标
        var searchIconNode = new cc.Node("SearchIcon");
        searchIconNode.setPosition(searchX - 65, btnBarY);
        var iconGraphics = searchIconNode.addComponent(cc.Graphics);
        iconGraphics.strokeColor = cc.color(200, 200, 200, 200);
        iconGraphics.lineWidth = 2;
        iconGraphics.circle(-3, 3, 8);
        iconGraphics.stroke();
        iconGraphics.moveTo(3, -3);
        iconGraphics.lineTo(10, -10);
        iconGraphics.stroke();
        searchIconNode.parent = parentNode;
        
        // 搜索输入提示
        var inputTextNode = new cc.Node("SearchInput");
        inputTextNode.setPosition(searchX + 10, btnBarY);
        inputTextNode.name = "RoomCodeInput";
        var inputLabel = inputTextNode.addComponent(cc.Label);
        inputLabel.string = "输入房间号";
        inputLabel.fontSize = 16;
        inputLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        inputTextNode.color = cc.color(150, 150, 160);
        inputTextNode.parent = parentNode;
        
        // 搜索按钮
        var searchBtn = this._createGameButton("搜 索", cc.color(70, 130, 180), searchX + 130, btnBarY, function() {
            var roomCode = inputTextNode.getComponent(cc.Label).string;
            if (roomCode && roomCode !== "输入房间号") {
                console.log("搜索房间:", roomCode);
                self._joinRoom(roomCode, roomConfig, playerGold);
            } else {
                self._showTipInScene(parentNode, "请输入房间号");
            }
        }, 70, 36);
        searchBtn.parent = parentNode;
        
        // 右侧 - 主要操作按钮
        var rightX = screenWidth/2 - 280;
        
        // 创建房间按钮
        var createBtn = this._createGameButton("创 建 房 间", cc.color(21, 101, 192), rightX, btnBarY, function() {
            console.log("创建房间");
            var scene = parentNode.getChildByName("RoomListScene") || parentNode;
            if (scene.destroy) scene.destroy();
            self._createRoom(roomConfig, playerGold);
        }, 120, 40, true);
        createBtn.parent = parentNode;
        
        // 快速加入按钮
        var quickBtn = this._createGameButton("快 速 加 入", cc.color(46, 125, 50), rightX + 140, btnBarY, function() {
            console.log("快速加入");
            var scene = parentNode.getChildByName("RoomListScene") || parentNode;
            if (scene.destroy) scene.destroy();
            self._quickMatch(roomConfig, playerGold);
        }, 120, 40, true);
        quickBtn.parent = parentNode;
    },
    
    // 绘制房间列表区域
    _drawRoomListArea: function(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
        var self = this;
        var listY = -20;
        var listHeight = screenHeight - 320;
        var listWidth = screenWidth - 100;
        
        // 列表容器背景
        var listBgNode = new cc.Node("ListContainer");
        listBgNode.setPosition(0, listY);
        listBgNode.setContentSize(cc.size(listWidth, listHeight));
        var listGraphics = listBgNode.addComponent(cc.Graphics);
        
        // 半透明背景
        listGraphics.fillColor = cc.color(20, 20, 35, 200);
        listGraphics.roundRect(-listWidth/2, -listHeight/2, listWidth, listHeight, 12);
        listGraphics.fill();
        
        // 金色边框
        listGraphics.strokeColor = cc.color(255, 200, 50, 150);
        listGraphics.lineWidth = 2;
        listGraphics.roundRect(-listWidth/2, -listHeight/2, listWidth, listHeight, 12);
        listGraphics.stroke();
        
        // 内部装饰边框
        listGraphics.strokeColor = cc.color(255, 215, 0, 50);
        listGraphics.lineWidth = 1;
        listGraphics.roundRect(-listWidth/2 + 8, -listHeight/2 + 8, listWidth - 16, listHeight - 16, 8);
        listGraphics.stroke();
        
        listBgNode.parent = parentNode;
        
        // 表头背景
        var headerBgNode = new cc.Node("HeaderBg");
        headerBgNode.setPosition(0, listY + listHeight/2 - 30);
        var headerGraphics = headerBgNode.addComponent(cc.Graphics);
        headerGraphics.fillColor = cc.color(40, 35, 50, 220);
        headerGraphics.roundRect(-listWidth/2 + 10, -20, listWidth - 20, 40, 8);
        headerGraphics.fill();
        headerBgNode.parent = parentNode;
        
        // 表头文字
        var headers = [
            { text: "房  间  号", x: -listWidth/2 + 120 },
            { text: "人 数", x: -listWidth/2 + 300 },
            { text: "底 分", x: -listWidth/2 + 420 },
            { text: "状 态", x: -listWidth/2 + 540 },
            { text: "操 作", x: listWidth/2 - 100 }
        ];
        
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            var headerNode = new cc.Node("Header_" + i);
            headerNode.setPosition(header.x, listY + listHeight/2 - 30);
            var headerLabel = headerNode.addComponent(cc.Label);
            headerLabel.string = header.text;
            headerLabel.fontSize = 18;
            headerLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            headerNode.color = cc.color(255, 220, 100);
            
            var outline = headerNode.addComponent(cc.LabelOutline);
            outline.color = cc.color(60, 40, 0);
            outline.width = 1;
            headerNode.parent = parentNode;
        }
        
        // 房间列表滚动容器
        var roomListContainer = new cc.Node("RoomListContainer");
        roomListContainer.setContentSize(cc.size(listWidth - 40, listHeight - 80));
        roomListContainer.y = listY - 15;
        roomListContainer.parent = parentNode;
        
        // 加载提示
        var loadingLabel = new cc.Node("LoadingLabel");
        loadingLabel.y = 0;
        var loading = loadingLabel.addComponent(cc.Label);
        loading.string = "正在获取房间列表...";
        loading.fontSize = 20;
        loading.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        loadingLabel.color = cc.color(150, 150, 170);
        loadingLabel.parent = roomListContainer;
        
        // 获取并渲染房间列表
        this._fetchAndRenderRoomListForScene(roomListContainer, loadingLabel, roomConfig, playerGold, parentNode);
    },
    
    // 绘制底部信息栏
    _drawBottomBar: function(parentNode, screenWidth, screenHeight, playerGold, roomConfig) {
        var self = this;
        var bottomY = -screenHeight/2 + 50;
        
        // 底部背景
        var bottomBgNode = new cc.Node("BottomBg");
        bottomBgNode.setPosition(0, bottomY);
        var bottomGraphics = bottomBgNode.addComponent(cc.Graphics);
        bottomGraphics.fillColor = cc.color(25, 25, 40, 220);
        bottomGraphics.roundRect(-screenWidth/2 + 20, -25, screenWidth - 40, 50, 10);
        bottomGraphics.fill();
        bottomGraphics.strokeColor = cc.color(255, 200, 50, 100);
        bottomGraphics.lineWidth = 1;
        bottomGraphics.roundRect(-screenWidth/2 + 20, -25, screenWidth - 40, 50, 10);
        bottomGraphics.stroke();
        bottomBgNode.parent = parentNode;
        
        // 返回按钮
        var backBtn = this._createGameButton("← 返回大厅", cc.color(80, 80, 100), -screenWidth/2 + 120, bottomY, function() {
            console.log("返回大厅");
            var scene = parentNode.getChildByName("RoomListScene") || parentNode;
            if (scene.destroy) scene.destroy();
        }, 120, 36);
        backBtn.parent = parentNode;
        
        // 玩家金币信息
        var goldIconNode = new cc.Node("GoldIcon");
        goldIconNode.setPosition(50, bottomY);
        var goldGraphics = goldIconNode.addComponent(cc.Graphics);
        goldGraphics.fillColor = cc.color(255, 200, 50);
        goldGraphics.circle(0, 0, 12);
        goldGraphics.fill();
        goldGraphics.fillColor = cc.color(255, 220, 100);
        goldGraphics.circle(0, 0, 8);
        goldGraphics.fill();
        goldIconNode.parent = parentNode;
        
        var goldNode = new cc.Node("GoldInfo");
        goldNode.setPosition(90, bottomY);
        var goldLabel = goldNode.addComponent(cc.Label);
        goldLabel.string = this._formatGold(playerGold);
        goldLabel.fontSize = 22;
        goldNode.color = cc.color(255, 220, 80);
        
        var goldOutline = goldNode.addComponent(cc.LabelOutline);
        goldOutline.color = cc.color(80, 50, 0);
        goldOutline.width = 2;
        goldNode.parent = parentNode;
        
        // 刷新按钮
        var refreshBtn = this._createGameButton("刷 新", cc.color(100, 100, 130), screenWidth/2 - 100, bottomY, function() {
            console.log("刷新房间列表");
            var container = parentNode.getChildByName("RoomListContainer");
            if (!container) container = parentNode.parent.getChildByName("RoomListContainer");
            if (!container) return;
            
            var loading = container.getChildByName("LoadingLabel");
            if (loading) {
                loading.active = true;
                loading.getComponent(cc.Label).string = "正在刷新...";
            }
            
            // 清空旧的房间项
            var children = container.children.slice();
            for (var i = 0; i < children.length; i++) {
                if (children[i].name !== "LoadingLabel") {
                    children[i].destroy();
                }
            }
            self._fetchAndRenderRoomListForScene(container, loading, roomConfig, playerGold, parentNode);
        }, 80, 36);
        refreshBtn.parent = parentNode;
    },
    
    // 创建游戏风格按钮
    _createGameButton: function(text, baseColor, x, y, callback, width, height, isHighlight) {
        width = width || 100;
        height = height || 40;
        
        var btn = new cc.Node("GameBtn_" + text);
        btn.setContentSize(cc.size(width, height));
        btn.setPosition(x, y);
        
        var graphics = btn.addComponent(cc.Graphics);
        
        // 按钮背景渐变效果
        graphics.fillColor = baseColor;
        graphics.roundRect(-width/2, -height/2, width, height, height/2);
        graphics.fill();
        
        // 高亮效果
        if (isHighlight) {
            graphics.fillColor = cc.color(
                Math.min(255, baseColor.r + 40),
                Math.min(255, baseColor.g + 40),
                Math.min(255, baseColor.b + 40),
                80
            );
            graphics.roundRect(-width/2 + 3, 3, width - 6, height/2 - 3, height/4);
            graphics.fill();
        }
        
        // 按钮边框
        graphics.strokeColor = cc.color(
            Math.min(255, baseColor.r + 60),
            Math.min(255, baseColor.g + 60),
            Math.min(255, baseColor.b + 60),
            200
        );
        graphics.lineWidth = 2;
        graphics.roundRect(-width/2, -height/2, width, height, height/2);
        graphics.stroke();
        
        // 按钮文字
        var label = btn.addComponent(cc.Label);
        label.string = text;
        label.fontSize = height * 0.4;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        btn.color = cc.color(255, 255, 255);
        
        var outline = btn.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0, 150);
        outline.width = 1;
        
        // 触摸效果
        btn.on(cc.Node.EventType.TOUCH_START, function(event) {
            event.stopPropagation();
            btn.scale = 0.95;
            btn.opacity = 220;
        });
        btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            btn.scale = 1;
            btn.opacity = 255;
            if (callback) callback();
        });
        btn.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            btn.scale = 1;
            btn.opacity = 255;
        });
        
        return btn;
    },
    
    // 添加房间列表装饰（保留兼容）
    _addRoomListDecorations: function(parentNode, screenWidth, screenHeight) {
        // 已被新的装饰方法替代
    },
    
    // 创建样式化按钮
    _createStyledButton: function(text, color, x, callback, width, height) {
        width = width || 100;
        height = height || 40;
        
        var btn = new cc.Node("Btn_" + text);
        btn.setContentSize(cc.size(width, height));
        btn.setPosition(x, 0);
        
        // 按钮背景
        var bg = btn.addComponent(cc.Graphics);
        bg.fillColor = color;
        bg.roundRect(-width/2, -height/2, width, height, 8);
        bg.fill();
        
        // 按钮文字
        var label = btn.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 18;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        btn.color = cc.color(255, 255, 255);
        
        // 触摸效果
        btn.on(cc.Node.EventType.TOUCH_START, function(event) {
            event.stopPropagation();
            btn.scale = 0.95;
        });
        btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            btn.scale = 1;
            if (callback) callback();
        });
        btn.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            btn.scale = 1;
        });
        
        return btn;
    },
    
    // 在场景中显示提示
    _showTipInScene: function(sceneNode, message) {
        var tipNode = sceneNode.getChildByName("SceneTip");
        if (tipNode) tipNode.destroy();
        
        tipNode = new cc.Node("SceneTip");
        tipNode.y = 100;
        
        var bg = tipNode.addComponent(cc.Graphics);
        bg.fillColor = cc.color(0, 0, 0, 180);
        bg.roundRect(-150, -20, 300, 40, 8);
        bg.fill();
        
        var label = tipNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 20;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tipNode.color = cc.color(255, 255, 0);
        tipNode.parent = sceneNode;
        
        this.scheduleOnce(function() {
            if (tipNode && tipNode.isValid) tipNode.destroy();
        }, 2);
    },
    
    // 获取并渲染房间列表（用于全屏场景）
    _fetchAndRenderRoomListForScene: function(container, loadingLabel, roomConfig, playerGold, sceneNode) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        console.log("获取房间列表 - WebSocket状态: isConnected=" + isConnected + ", isWebSocketOpen=" + isWebSocketOpen);
        
        // 存储当前房间列表，用于实时更新
        var currentRooms = [];
        
        // 设置实时房间列表更新监听器
        var roomListUpdateHandler = function(data) {
            console.log("收到房间列表实时更新:", JSON.stringify(data));
            
            var actionType = data.action_type;
            var roomCode = data.room_code;
            var room = data.room;
            
            if (actionType === "add" && room) {
                // 添加新房间
                var exists = currentRooms.some(function(r) {
                    return (r.room_code || r.roomCode) === (room.room_code || room.roomCode);
                });
                if (!exists) {
                    currentRooms.push(room);
                }
            } else if (actionType === "update" && room) {
                // 更新房间信息
                for (var i = 0; i < currentRooms.length; i++) {
                    if ((currentRooms[i].room_code || currentRooms[i].roomCode) === (room.room_code || room.roomCode)) {
                        currentRooms[i] = room;
                        break;
                    }
                }
            } else if (actionType === "remove") {
                // 移除房间
                currentRooms = currentRooms.filter(function(r) {
                    return (r.room_code || r.roomCode) !== roomCode;
                });
            }
            
            // 重新渲染房间列表
            var filteredRooms = currentRooms.filter(function(r) {
                var count = r.player_count || r.playerCount || 0;
                return count > 0 && count < 3;
            });
            self._renderRoomListInScene(container, filteredRooms, roomConfig, playerGold, sceneNode);
        };
        
        // 注册监听器
        if (socket && socket.onRoomListUpdate) {
            socket.onRoomListUpdate(roomListUpdateHandler);
        }
        
        // 保存监听器引用，用于后续取消注册
        sceneNode._roomListUpdateHandler = roomListUpdateHandler;
        
        // 如果WebSocket未连接，使用模拟房间列表
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，使用模拟房间列表");
            
            this.scheduleOnce(function() {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.active = false;
                }
                var mockRooms = self._generateMockRoomsForScene();
                // 过滤：只显示人数少于3人的房间
                currentRooms = mockRooms.filter(function(room) {
                    return room.player_count > 0 && room.player_count < 3;
                });
                self._renderRoomListInScene(container, currentRooms, roomConfig, playerGold, sceneNode);
            }, 0.5);
            return;
        }
        
        // 设置超时
        var timeoutId = setTimeout(function() {
            console.log("获取房间列表超时，使用模拟数据");
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.active = false;
            }
            var mockRooms = self._generateMockRoomsForScene();
            currentRooms = mockRooms.filter(function(room) {
                return room.player_count > 0 && room.player_count < 3;
            });
            self._renderRoomListInScene(container, currentRooms, roomConfig, playerGold, sceneNode);
        }, 3000);
        
        socket.getRoomList(function(result, rooms) {
            clearTimeout(timeoutId);
            
            if (result === 0 && rooms && rooms.length > 0) {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.active = false;
                }
                // 存储房间列表用于实时更新
                currentRooms = rooms;
                // 过滤：只显示人数少于3人的房间
                var filteredRooms = rooms.filter(function(room) {
                    var count = room.player_count || room.playerCount || 0;
                    return count > 0 && count < 3;
                });
                self._renderRoomListInScene(container, filteredRooms, roomConfig, playerGold, sceneNode);
            } else {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.active = false;
                }
                var mockRooms = self._generateMockRoomsForScene();
                currentRooms = mockRooms.filter(function(room) {
                    return room.player_count > 0 && room.player_count < 3;
                });
                self._renderRoomListInScene(container, currentRooms, roomConfig, playerGold, sceneNode);
            }
        });
    },
    
    // 生成模拟房间列表（用于全屏场景）
    _generateMockRoomsForScene: function() {
        var mockRooms = [];
        var roomCount = Math.floor(Math.random() * 5) + 3; // 3-7个模拟房间
        
        var myglobal = window.myglobal;
        var baseScore = myglobal && myglobal.currentRoomConfig ? 
            (myglobal.currentRoomConfig.base_score || 1) : 1;
        
        for (var i = 0; i < roomCount; i++) {
            var roomCode = "" + (100001 + Math.floor(Math.random() * 899999));
            var playerCount = Math.floor(Math.random() * 2) + 1; // 1-2人（确保少于3人）
            
            mockRooms.push({
                room_code: roomCode,
                room_code_display: roomCode.substring(0, 3) + " " + roomCode.substring(3),
                player_count: playerCount,
                max_players: 3,
                base_score: baseScore,
                status: playerCount >= 3 ? "游戏中" : "等待中"
            });
        }
        
        console.log("生成模拟房间: " + JSON.stringify(mockRooms));
        return mockRooms;
    },
    
    // 渲染房间列表（游戏风格卡片式设计）
    _renderRoomListInScene: function(container, rooms, roomConfig, playerGold, sceneNode) {
        var self = this;
        
        // 清空容器中非LoadingLabel的子节点
        var children = container.children.slice();
        for (var i = 0; i < children.length; i++) {
            if (children[i].name !== "LoadingLabel") {
                children[i].destroy();
            }
        }
        
        if (!rooms || rooms.length === 0) {
            // 显示暂无房间提示（游戏风格）
            var emptyBg = new cc.Node("EmptyBg");
            var emptyGraphics = emptyBg.addComponent(cc.Graphics);
            emptyGraphics.fillColor = cc.color(30, 30, 45, 200);
            emptyGraphics.roundRect(-200, -40, 400, 80, 15);
            emptyGraphics.fill();
            emptyGraphics.strokeColor = cc.color(255, 200, 50, 100);
            emptyGraphics.lineWidth = 2;
            emptyGraphics.roundRect(-200, -40, 400, 80, 15);
            emptyGraphics.stroke();
            emptyBg.parent = container;
            
            var emptyIconNode = new cc.Node("EmptyIcon");
            emptyIconNode.y = 10;
            var iconLabel = emptyIconNode.addComponent(cc.Label);
            iconLabel.string = "🎴";
            iconLabel.fontSize = 28;
            emptyIconNode.parent = emptyBg;
            
            var emptyLabelNode = new cc.Node("EmptyText");
            emptyLabelNode.y = -15;
            var emptyLabel = emptyLabelNode.addComponent(cc.Label);
            emptyLabel.string = "暂无可加入的房间";
            emptyLabel.fontSize = 20;
            emptyLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            emptyLabelNode.color = cc.color(200, 180, 120);
            emptyLabelNode.parent = emptyBg;
            
            var tipLabelNode = new cc.Node("TipText");
            tipLabelNode.y = -35;
            var tipLabel = tipLabelNode.addComponent(cc.Label);
            tipLabel.string = "点击「创建房间」开始游戏";
            tipLabel.fontSize = 14;
            tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            tipLabelNode.color = cc.color(150, 150, 170);
            tipLabelNode.parent = emptyBg;
            return;
        }
        
        var containerHeight = container.height;
        var itemHeight = 55;
        var startY = containerHeight/2 - 35;
        var listWidth = container.width - 30;
        
        for (var i = 0; i < rooms.length && i < 8; i++) {
            var room = rooms[i];
            var itemY = startY - i * itemHeight;
            
            // 房间卡片背景
            var itemBg = new cc.Node("RoomCard_" + i);
            itemBg.setContentSize(cc.size(listWidth, itemHeight - 8));
            itemBg.setPosition(0, itemY);
            
            var bgGraphics = itemBg.addComponent(cc.Graphics);
            
            // 卡片背景色 - 交替变化
            var bgColor = i % 2 === 0 ? cc.color(35, 35, 55, 220) : cc.color(30, 30, 50, 220);
            bgGraphics.fillColor = bgColor;
            bgGraphics.roundRect(-listWidth/2, -(itemHeight - 8)/2, listWidth, itemHeight - 8, 8);
            bgGraphics.fill();
            
            // 卡片边框
            bgGraphics.strokeColor = cc.color(80, 80, 120, 150);
            bgGraphics.lineWidth = 1;
            bgGraphics.roundRect(-listWidth/2, -(itemHeight - 8)/2, listWidth, itemHeight - 8, 8);
            bgGraphics.stroke();
            
            // 左侧装饰条
            bgGraphics.fillColor = cc.color(255, 200, 50, 180);
            bgGraphics.roundRect(-listWidth/2, -(itemHeight - 8)/2, 4, itemHeight - 8, 2);
            bgGraphics.fill();
            
            itemBg.parent = container;
            
            // 房间号（带图标）
            var codeIconNode = new cc.Node("CodeIcon");
            codeIconNode.setPosition(-listWidth/2 + 50, 0);
            var iconGraphics = codeIconNode.addComponent(cc.Graphics);
            iconGraphics.fillColor = cc.color(255, 200, 50, 200);
            iconGraphics.roundRect(-8, -8, 16, 16, 3);
            iconGraphics.fill();
            codeIconNode.parent = itemBg;
            
            var codeLabel = new cc.Node("Code");
            codeLabel.setPosition(-listWidth/2 + 130, 0);
            var code = codeLabel.addComponent(cc.Label);
            code.string = room.room_code_display || room.room_code || room.roomCode || "未知";
            code.fontSize = 20;
            code.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            codeLabel.color = cc.color(230, 220, 200);
            
            var codeOutline = codeLabel.addComponent(cc.LabelOutline);
            codeOutline.color = cc.color(0, 0, 0, 100);
            codeOutline.width = 1;
            codeLabel.parent = itemBg;
            
            // 人数（带图标）
            var playerCount = room.player_count || room.playerCount || 0;
            var countNode = new cc.Node("PlayerCount");
            countNode.setPosition(-listWidth/2 + 300, 0);
            
            // 玩家图标
            for (var p = 0; p < 3; p++) {
                var playerIcon = new cc.Node("PlayerIcon_" + p);
                playerIcon.setPosition(p * 18, 0);
                var pGraphics = playerIcon.addComponent(cc.Graphics);
                pGraphics.fillColor = p < playerCount ? cc.color(100, 200, 100, 230) : cc.color(60, 60, 80, 150);
                pGraphics.circle(0, 0, 6);
                pGraphics.fill();
                playerIcon.parent = countNode;
            }
            countNode.parent = itemBg;
            
            // 底分（金币图标）
            var scoreIconNode = new cc.Node("ScoreIcon");
            scoreIconNode.setPosition(-listWidth/2 + 405, 0);
            var scoreGraphics = scoreIconNode.addComponent(cc.Graphics);
            scoreGraphics.fillColor = cc.color(255, 200, 50);
            scoreGraphics.circle(0, 0, 8);
            scoreGraphics.fill();
            scoreGraphics.fillColor = cc.color(255, 220, 100);
            scoreGraphics.circle(0, 0, 5);
            scoreGraphics.fill();
            scoreIconNode.parent = itemBg;
            
            var scoreLabel = new cc.Node("Score");
            scoreLabel.setPosition(-listWidth/2 + 440, 0);
            var score = scoreLabel.addComponent(cc.Label);
            score.string = "" + (room.base_score || roomConfig.base_score || 1);
            score.fontSize = 18;
            score.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            scoreLabel.color = cc.color(255, 220, 100);
            scoreLabel.parent = itemBg;
            
            // 状态标签
            var statusNode = new cc.Node("Status");
            statusNode.setPosition(-listWidth/2 + 540, 0);
            var statusGraphics = statusNode.addComponent(cc.Graphics);
            
            var statusText = room.status || "等待中";
            var statusColor, statusBgColor;
            if (statusText === "游戏中") {
                statusColor = cc.color(255, 120, 100);
                statusBgColor = cc.color(180, 60, 50, 180);
            } else if (playerCount >= 2) {
                statusColor = cc.color(255, 200, 80);
                statusBgColor = cc.color(180, 140, 40, 180);
            } else {
                statusColor = cc.color(120, 220, 120);
                statusBgColor = cc.color(40, 140, 60, 180);
            }
            
            statusGraphics.fillColor = statusBgColor;
            statusGraphics.roundRect(-30, -12, 60, 24, 12);
            statusGraphics.fill();
            
            var statusTextNode = new cc.Node("StatusText");
            var statusLabel = statusTextNode.addComponent(cc.Label);
            statusLabel.string = statusText;
            statusLabel.fontSize = 14;
            statusLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            statusTextNode.color = statusColor;
            statusTextNode.parent = statusNode;
            statusNode.parent = itemBg;
            
            // 加入按钮
            (function(roomData, itemIndex) {
                var joinBtnNode = new cc.Node("JoinBtn");
                joinBtnNode.setPosition(listWidth/2 - 70, 0);
                
                var joinGraphics = joinBtnNode.addComponent(cc.Graphics);
                joinGraphics.fillColor = cc.color(76, 175, 80, 230);
                joinGraphics.roundRect(-40, -15, 80, 30, 15);
                joinGraphics.fill();
                
                // 按钮高光
                joinGraphics.fillColor = cc.color(120, 200, 120, 100);
                joinGraphics.roundRect(-37, 2, 74, 12, 6);
                joinGraphics.fill();
                
                // 按钮边框
                joinGraphics.strokeColor = cc.color(100, 200, 100, 200);
                joinGraphics.lineWidth = 1;
                joinGraphics.roundRect(-40, -15, 80, 30, 15);
                joinGraphics.stroke();
                
                joinBtnNode.parent = itemBg;
                
                var joinLabel = new cc.Node("JoinText");
                var joinLabelText = joinLabel.addComponent(cc.Label);
                joinLabelText.string = "加入";
                joinLabelText.fontSize = 16;
                joinLabelText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                joinLabel.color = cc.color(255, 255, 255);
                
                var joinOutline = joinLabel.addComponent(cc.LabelOutline);
                joinOutline.color = cc.color(0, 80, 0, 150);
                joinOutline.width = 1;
                joinLabel.parent = joinBtnNode;
                
                // 触摸效果
                joinBtnNode.on(cc.Node.EventType.TOUCH_START, function(event) {
                    event.stopPropagation();
                    joinBtnNode.scale = 0.9;
                });
                joinBtnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
                    event.stopPropagation();
                    joinBtnNode.scale = 1;
                    var roomCode = roomData.room_code || roomData.roomCode;
                    console.log("加入房间:", roomCode);
                    var scene = sceneNode.getChildByName("RoomListScene") || sceneNode;
                    if (scene.destroy) scene.destroy();
                    self._joinRoom(roomCode, roomConfig, playerGold);
                });
                joinBtnNode.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
                    joinBtnNode.scale = 1;
                });
            })(room, i);
        }
    },
    
    // 显示房间列表弹窗
    _showRoomListDialog: function(roomConfig, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        
        console.log("显示房间列表弹窗, 房间类型:", roomConfig.room_name);
        
        // 移除旧的弹窗
        var oldDialog = this.node.getChildByName("RoomListDialog");
        if (oldDialog) oldDialog.destroy();
        
        // 移除旧的提示
        var oldTip = this.node.getChildByName("room_tip");
        if (oldTip) oldTip.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建弹窗容器
        var dialog = new cc.Node("RoomListDialog");
        dialog.setContentSize(cc.size(650, 450));
        dialog.anchorX = 0.5;
        dialog.anchorY = 0.5;
        dialog.x = 0;
        dialog.y = 50;  // 稍微上移
        dialog.zIndex = 1000;  // 确保在最上层
        dialog.parent = this.node;
        
        // 添加背景遮罩（半透明黑色）
        var mask = new cc.Node("Mask");
        mask.setContentSize(cc.size(screenWidth, screenHeight));
        mask.anchorX = 0.5;
        mask.anchorY = 0.5;
        mask.x = 0;
        mask.y = -50;
        var maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 180);
        maskGraphics.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        maskGraphics.fill();
        mask.parent = dialog;
        
        // 点击遮罩关闭弹窗
        mask.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            dialog.destroy();
        });
        
        // 添加弹窗背景（白色圆角矩形）
        var bgNode = new cc.Node("BgNode");
        bgNode.setContentSize(cc.size(620, 420));
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = cc.color(45, 45, 65, 255);
        bgGraphics.roundRect(-310, -210, 620, 420, 15);
        bgGraphics.fill();
        bgGraphics.strokeColor = cc.color(100, 100, 140, 255);
        bgGraphics.lineWidth = 3;
        bgGraphics.roundRect(-310, -210, 620, 420, 15);
        bgGraphics.stroke();
        bgNode.parent = dialog;
        
        // 标题
        var titleNode = new cc.Node("Title");
        titleNode.y = 170;
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "【" + roomConfig.room_name + "】";
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 44;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = cc.color(255, 215, 0);
        titleNode.parent = dialog;
        
        // 副标题
        var subTitleNode = new cc.Node("SubTitle");
        subTitleNode.y = 130;
        var subTitleLabel = subTitleNode.addComponent(cc.Label);
        subTitleLabel.string = "选择游戏方式";
        subTitleLabel.fontSize = 24;
        subTitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        subTitleNode.color = cc.color(180, 180, 200);
        subTitleNode.parent = dialog;
        
        // 房间列表容器
        var listContainer = new cc.Node("ListContainer");
        listContainer.setContentSize(cc.size(580, 120));
        listContainer.y = 50;
        listContainer.parent = dialog;
        
        // 加载中的提示
        var loadingLabel = new cc.Node("LoadingLabel");
        loadingLabel.y = 0;
        var loading = loadingLabel.addComponent(cc.Label);
        loading.string = "正在获取房间列表...";
        loading.fontSize = 22;
        loading.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        loadingLabel.color = cc.color(150, 150, 170);
        loadingLabel.parent = listContainer;
        
        // 按钮容器 - 放在中间显眼位置
        var btnContainer = new cc.Node("BtnContainer");
        btnContainer.y = -60;
        btnContainer.parent = dialog;
        
        // 快速匹配按钮（绿色，最大）
        var quickMatchBtn = this._createButton("🎮 快速匹配", cc.color(46, 125, 50), -200, function() {
            console.log("点击快速匹配");
            dialog.destroy();
            self._quickMatch(roomConfig, playerGold);
        }, 180, 55);
        quickMatchBtn.parent = btnContainer;
        
        // 创建房间按钮（蓝色）
        var createRoomBtn = this._createButton("🏠 创建房间", cc.color(21, 101, 192), 0, function() {
            console.log("点击创建房间");
            dialog.destroy();
            self._createRoom(roomConfig, playerGold);
        }, 180, 55);
        createRoomBtn.parent = btnContainer;
        
        // 关闭按钮（灰色）
        var closeBtn = this._createButton("✖ 关闭", cc.color(120, 120, 120), 200, function() {
            dialog.destroy();
        }, 100, 45);
        closeBtn.parent = btnContainer;
        
        // 输入房间号区域
        var inputContainer = new cc.Node("InputContainer");
        inputContainer.y = -140;
        inputContainer.parent = dialog;
        
        var inputLabel = new cc.Node("InputLabel");
        inputLabel.x = -250;
        var inputLabelComp = inputLabel.addComponent(cc.Label);
        inputLabelComp.string = "房间号:";
        inputLabelComp.fontSize = 22;
        inputLabel.color = cc.color(200, 200, 200);
        inputLabel.parent = inputContainer;
        
        // 房间号输入框背景
        var inputBgNode = new cc.Node("InputBg");
        inputBgNode.setContentSize(cc.size(180, 40));
        inputBgNode.x = -110;
        var inputBg = inputBgNode.addComponent(cc.Graphics);
        inputBg.fillColor = cc.color(60, 60, 80, 255);
        inputBg.roundRect(-90, -20, 180, 40, 5);
        inputBg.fill();
        inputBgNode.parent = inputContainer;
        
        var inputText = inputBgNode.addComponent(cc.Label);
        inputText.string = "点击输入房间号";
        inputText.fontSize = 18;
        inputText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        inputText.verticalAlign = cc.Label.VerticalAlign.CENTER;
        
        // 加入房间按钮
        var joinBtn = this._createButton("➤ 加入", cc.color(230, 126, 34), 100, function() {
            var roomCode = inputText.string;
            if (roomCode && roomCode !== "点击输入房间号") {
                console.log("加入房间:", roomCode);
                dialog.destroy();
                self._joinRoom(roomCode, roomConfig, playerGold);
            } else {
                self._showMessageCenter("请输入房间号");
            }
        }, 90, 40);
        joinBtn.parent = inputContainer;
        
        // 底部提示
        var tipNode = new cc.Node("Tip");
        tipNode.y = -185;
        var tipLabel = tipNode.addComponent(cc.Label);
        tipLabel.string = "提示：快速匹配将自动为您分配房间";
        tipLabel.fontSize = 16;
        tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tipNode.color = cc.color(120, 120, 140);
        tipNode.parent = dialog;
        
        // 获取房间列表
        this._fetchRoomList(listContainer, loadingLabel);
    },
    
    // 创建按钮 - 改进版本
    _createButton: function(text, color, x, callback, width, height) {
        width = width || 140;
        height = height || 50;
        
        var btn = new cc.Node(text + "Btn");
        btn.setContentSize(cc.size(width, height));
        btn.x = x;
        
        // 按钮背景
        var bg = btn.addComponent(cc.Graphics);
        bg.fillColor = color;
        bg.roundRect(-width/2, -height/2, width, height, 8);
        bg.fill();
        
        // 按钮文字
        var label = btn.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 20;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        btn.color = cc.color(255, 255, 255);
        
        // 触摸效果
        btn.on(cc.Node.EventType.TOUCH_START, function(event) {
            event.stopPropagation();
            btn.scale = 0.95;
        });
        btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            btn.scale = 1;
            if (callback) callback();
        });
        btn.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            btn.scale = 1;
        });
        
        return btn;
    },
    
    // 获取房间列表
    _fetchRoomList: function(container, loadingLabel) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        console.log("获取房间列表 - WebSocket状态: isConnected=" + isConnected + ", isWebSocketOpen=" + isWebSocketOpen);
        
        // 如果WebSocket未连接，使用模拟房间列表
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，使用模拟房间列表");
            loadingLabel.getComponent(cc.Label).string = "使用模拟房间列表";
            
            // 延迟显示模拟房间，让用户看到提示
            this.scheduleOnce(function() {
                loadingLabel.destroy();
                var mockRooms = self._generateMockRooms();
                self._renderRoomList(container, mockRooms);
            }, 0.5);
            return;
        }
        
        // 设置超时，如果3秒内没有响应，使用模拟数据
        var timeoutId = setTimeout(function() {
            console.log("获取房间列表超时，使用模拟数据");
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.destroy();
                var mockRooms = self._generateMockRooms();
                self._renderRoomList(container, mockRooms);
            }
        }, 3000);
        
        socket.getRoomList(function(result, rooms) {
            clearTimeout(timeoutId);
            
            if (result === 0 && rooms && rooms.length > 0) {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.destroy();
                }
                self._renderRoomList(container, rooms);
            } else {
                // 服务端返回空列表或失败，使用模拟数据
                console.log("服务端返回空列表，使用模拟数据");
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.destroy();
                }
                var mockRooms = self._generateMockRooms();
                self._renderRoomList(container, mockRooms);
            }
        });
    },
    
    // 生成模拟房间列表
    _generateMockRooms: function() {
        var mockRooms = [];
        var roomCount = Math.floor(Math.random() * 3) + 1; // 1-3个模拟房间
        
        for (var i = 0; i < roomCount; i++) {
            var roomCode = "ROOM" + (100000 + Math.floor(Math.random() * 900000));
            var playerCount = Math.floor(Math.random() * 2) + 1; // 1-2人
            
            mockRooms.push({
                room_code: roomCode,
                player_count: playerCount,
                max_players: 3
            });
        }
        
        console.log("生成模拟房间: " + JSON.stringify(mockRooms));
        return mockRooms;
    },
    
    // 渲染房间列表
    _renderRoomList: function(container, rooms) {
        var self = this;
        
        for (var i = 0; i < rooms.length && i < 5; i++) {
            var room = rooms[i];
            var item = new cc.Node("RoomItem_" + i);
            item.setContentSize(cc.size(540, 35));
            item.y = 70 - i * 40;
            
            var bg = item.addComponent(cc.Sprite);
            bg.color = i % 2 === 0 ? cc.color(50, 50, 70) : cc.color(45, 45, 65);
            
            // 房间号
            var codeLabel = new cc.Node();
            codeLabel.x = -200;
            var code = codeLabel.addComponent(cc.Label);
            code.string = "房间: " + (room.room_code || room.roomCode || "未知");
            code.fontSize = 18;
            codeLabel.color = cc.color(200, 200, 200);
            codeLabel.parent = item;
            
            // 人数
            var countLabel = new cc.Node();
            countLabel.x = 50;
            var count = countLabel.addComponent(cc.Label);
            count.string = "人数: " + (room.player_count || room.playerCount || 0) + "/3";
            count.fontSize = 18;
            countLabel.color = cc.color(150, 200, 150);
            countLabel.parent = item;
            
            // 加入按钮
            var joinBtn = this._createButton("加入", cc.color(76, 175, 80), 200, function() {
                var roomCode = room.room_code || room.roomCode;
                self._joinRoom(roomCode, myglobal.currentRoomConfig, myglobal.playerData.gobal_count);
            });
            joinBtn.setContentSize(cc.size(70, 30));
            joinBtn.x = 220;
            joinBtn.parent = item;
            
            item.parent = container;
        }
    },
    
    // 快速匹配
    _quickMatch: function(roomConfig, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        this._showMessageCenter("正在快速匹配...");
        
        // 如果WebSocket未连接，直接使用模拟数据
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，使用模拟数据进入游戏");
            this.scheduleOnce(function() {
                self._showMessageCenter("使用模拟数据进入游戏");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }, 1);
            return;
        }
        
        if (socket.request_enter_room) {
            socket.request_enter_room({ room_level: roomConfig.room_type }, function(result, data) {
                if (result === 0 && data && data.roomid) {
                    if (myglobal) myglobal.roomData = data;
                    self._enterGameScene(data);
                } else {
                    self._showMessageCenter("匹配失败，创建新房间");
                    self._enterGameSceneWithMockData(roomConfig, playerGold);
                }
            });
            
            this._enterRoomTimeout = setTimeout(function() {
                self._showMessageCenter("匹配超时，创建新房间");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }, 5000);
        } else {
            this._enterGameSceneWithMockData(roomConfig, playerGold);
        }
    },
    
    // 创建房间
    _createRoom: function(roomConfig, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        this._showMessageCenter("正在创建房间...");
        
        // 如果WebSocket未连接，直接使用模拟数据
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，使用模拟数据创建房间");
            this.scheduleOnce(function() {
                self._showMessageCenter("创建模拟房间成功");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }, 1);
            return;
        }
        
        if (socket.createRoom) {
            socket.createRoom(function(result, data) {
                console.log("创建房间结果:", result, JSON.stringify(data));
                if (result === 0 && data) {
                    // 转换数据格式
                    var roomData = {
                        roomid: data.room_code || data.roomCode || "NEW_ROOM",
                        seatindex: 1,
                        playerdata: [{
                            accountid: myglobal.playerData.accountID,
                            nick_name: myglobal.playerData.nickName,
                            avatarUrl: myglobal.playerData.avatarUrl || "avatar_1",
                            goldcount: playerGold,
                            seatindex: 1
                        }],
                        housemanageid: myglobal.playerData.accountID
                    };
                    myglobal.roomData = roomData;
                    self._enterGameScene(roomData);
                } else {
                    self._showMessageCenter("创建失败，使用模拟房间");
                    self._enterGameSceneWithMockData(roomConfig, playerGold);
                }
            });
            
            // 设置超时
            setTimeout(function() {
                self._showMessageCenter("创建超时，使用模拟房间");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }, 5000);
        } else {
            this._enterGameSceneWithMockData(roomConfig, playerGold);
        }
    },
    
    // 加入房间
    _joinRoom: function(roomCode, roomConfig, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        this._showMessageCenter("正在加入房间 " + roomCode + "...");
        
        // 如果WebSocket未连接，直接使用模拟数据
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，使用模拟数据加入房间");
            this.scheduleOnce(function() {
                self._showMessageCenter("加入模拟房间成功");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }, 1);
            return;
        }
        
        if (socket.joinRoom) {
            socket.joinRoom(roomCode, function(result, data) {
                console.log("加入房间结果:", result, JSON.stringify(data));
                if (result === 0 && data) {
                    // 转换数据格式
                    var roomData = {
                        roomid: data.room_code || data.roomCode || roomCode,
                        seatindex: data.player ? data.player.seat : 1,
                        playerdata: (data.players || []).map(function(p, idx) {
                            return {
                                accountid: p.id,
                                nick_name: p.name,
                                avatarUrl: "avatar_1",
                                goldcount: 1000,
                                seatindex: p.seat || idx + 1
                            };
                        }),
                        housemanageid: ""
                    };
                    myglobal.roomData = roomData;
                    self._enterGameScene(roomData);
                } else {
                    self._showMessageCenter("加入房间失败，使用模拟房间");
                    self._enterGameSceneWithMockData(roomConfig, playerGold);
                }
            });
        } else {
            this._showMessageCenter("无法连接服务器");
        }
    },
    
    // 使用模拟数据进入游戏场景
    _enterGameSceneWithMockData: function(roomConfig, playerGold) {
        var myglobal = window.myglobal;
        
        // 清除超时计时器
        if (this._enterRoomTimeout) {
            clearTimeout(this._enterRoomTimeout);
            this._enterRoomTimeout = null;
        }
        
        var mockData = {
            roomid: "ROOM_" + roomConfig.room_type,
            room_config: roomConfig,
            seatindex: 1,
            playerdata: [{
                accountid: "player_1",
                nick_name: myglobal ? myglobal.playerData.nickName : "测试玩家",
                avatarUrl: "avatar_1",
                goldcount: playerGold || 1000,
                seatindex: 1
            }]
        };
        
        if (myglobal) myglobal.roomData = mockData;
        
        console.log("使用模拟数据进入游戏场景:", JSON.stringify(mockData));
        this._enterGameScene(mockData);
    },
    
    // 等待 WebSocket 连接后进入房间
    _waitForConnectionAndEnterRoom: function(roomConfig, socket, playerGold) {
        var self = this;
        var myglobal = window.myglobal;
        var attempts = 0;
        var maxAttempts = 6;  // 最多等待3秒
        
        var tryEnter = function() {
            attempts++;
            var isWebSocketOpen = socket.isWebSocketOpen ? socket.isWebSocketOpen() : false;
            
            console.log("尝试连接 WebSocket, 第" + attempts + "次, 物理连接状态:", isWebSocketOpen);
            
            if (isWebSocketOpen) {
                console.log("WebSocket 已连接，发送进入房间请求");
                socket.request_enter_room({ room_level: roomConfig.room_type }, function(result, data) {
                    console.log("进入房间响应:", result, JSON.stringify(data));
                    if (result === 0 && data && data.roomid) {
                        if (myglobal) myglobal.roomData = data;
                        self._enterGameScene(data);
                    } else {
                        // 服务器返回失败，使用模拟数据
                        console.log("服务器返回失败，使用模拟数据");
                        self._enterGameSceneWithMockData(roomConfig, playerGold);
                    }
                });
                
                // 设置超时，如果3秒内没有响应，使用模拟数据
                setTimeout(function() {
                    if (self._enterRoomTimeout !== null) {
                        console.log("进入房间响应超时，使用模拟数据");
                        self._enterGameSceneWithMockData(roomConfig, playerGold);
                    }
                }, 3000);
            } else if (attempts < maxAttempts) {
                setTimeout(tryEnter, 500);
            } else {
                // 超时后使用模拟数据进入游戏
                console.log("WebSocket 连接超时，使用模拟数据");
                self._enterGameSceneWithMockData(roomConfig, playerGold);
            }
        };
        
        setTimeout(tryEnter, 500);
    },
    
    _formatGold: function(gold) {
        if (gold >= 10000) {
            return (gold / 10000).toFixed(1) + "万";
        }
        return gold.toString();
    },
    
    _enterGameScene: function(roomData) {
        cc.director.loadScene("gameScene", function(err) {
            if (err) console.error("加载游戏场景失败:", err);
        });
    },
    
    _showMessage: function(message) {
        var tipNode = this.node.getChildByName("room_tip");
        if (tipNode) tipNode.destroy();
        
        tipNode = new cc.Node("room_tip");
        tipNode.y = 250;
        
        var label = tipNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        tipNode.color = cc.color(255, 255, 0);
        
        tipNode.parent = this.node;
        
        this.scheduleOnce(function() {
            if (tipNode && tipNode.isValid) tipNode.destroy();
        }, 2);
    },
    
    // 在屏幕中央显示提示信息（更显眼）
    _showMessageCenter: function(message) {
        var tipNode = this.node.getChildByName("center_tip");
        if (tipNode) tipNode.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建提示容器
        tipNode = new cc.Node("center_tip");
        tipNode.zIndex = 2000;
        tipNode.parent = this.node;
        
        // 添加半透明背景
        var bgNode = new cc.Node("Bg");
        var bg = bgNode.addComponent(cc.Graphics);
        bg.fillColor = cc.color(0, 0, 0, 200);
        bg.roundRect(-200, -30, 400, 60, 10);
        bg.fill();
        bgNode.parent = tipNode;
        
        // 添加文字
        var labelNode = new cc.Node("Label");
        var label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 26;
        label.lineHeight = 36;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = tipNode;
        
        // 2秒后自动消失
        this.scheduleOnce(function() {
            if (tipNode && tipNode.isValid) tipNode.destroy();
        }, 2);
    },
    
    _removeNoticeBoard: function() {
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3", "title", "Title", "标签"];
        for (var i = 0; i < noticeNames.length; i++) {
            var node = this.node.getChildByName(noticeNames[i]);
            if (node) node.active = false;
        }
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        // 隐藏背景上的区域标签文字（不隐藏动态创建的 AreaTitle）
        this._hideBackgroundLabels();
    },
    
    _hideBackgroundLabels: function() {
        // 隐藏背景上原有的标签节点
        var labelsToHide = ["竞技场", "普通场", "初级场", "中级场", "高级场", "选择房间", "房间选择"];
        for (var i = 0; i < labelsToHide.length; i++) {
            var nodes = this._findNodesByName(this.node, labelsToHide[i]);
            for (var j = 0; j < nodes.length; j++) {
                // 只隐藏非 AreaTitle 的节点
                if (nodes[j].name !== "AreaTitle") {
                    nodes[j].active = false;
                }
            }
        }
    },
    
    _findNodesByName: function(parentNode, name) {
        var result = [];
        if (!parentNode || !parentNode.children) return result;
        
        for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children[i];
            if (child.name === name) {
                result.push(child);
            }
            // 递归查找子节点
            var subResults = this._findNodesByName(child, name);
            result = result.concat(subResults);
        }
        return result;
    },
    
    _adjustGoldElementsPosition: function() {
        var playerNode = this.node.getChildByName("player_node");
        if (!playerNode) return;
        
        var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
        var goldFrame = playerNode.getChildByName("gold_frame");
        
        // 调整金豆图标位置
        if (yuanbaoIcon) {
            yuanbaoIcon.y = 80;
            yuanbaoIcon.x = -50;  // 向左偏移
        }
        if (goldFrame) {
            goldFrame.y = 80;
        }
        
        // 调整金币文字位置 - 放在金豆图标后面
        if (this.gobal_count && this.gobal_count.node) {
            var labelNode = this.gobal_count.node;
            var widget = labelNode.getComponent(cc.Widget);
            if (widget) widget.enabled = false;
            
            // 文字放在金豆图标右侧
            labelNode.anchorX = 0;  // 左锚点，从左侧开始
            labelNode.x = 20;       // 金豆图标后面20px
            labelNode.y = 80;       // 与金豆图标同一高度
        }
    },
    
    _hideNodesWithText: function(parentNode, searchText) {
        if (!parentNode) return;
        var children = parentNode.children;
        if (!children) return;
        
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var label = child.getComponent(cc.Label);
            if (label && label.string && label.string.indexOf(searchText) >= 0) {
                child.active = false;
            }
            this._hideNodesWithText(child, searchText);
        }
    },
    
    // 场景销毁时清理资源
    onDestroy: function() {
        console.log("=== hallScene onDestroy ===");
        
        // 停止在线状态监测（大厅场景需要持续监测，所以只有场景销毁时才停止）
        // 注意：通常大厅场景不会销毁，除非切换到游戏场景
        // 如果需要保持监测，可以注释掉下面这行
        // this._stopOnlineMonitoring();
    },

    start () {}
});
