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
            // 注释掉：大厅不需要加入房间按钮，该功能在房间列表场景中使用
            // this._createEnterRoomButton();  // 创建加入房间按钮
            
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
        
        // ===== 背景层 =====
        this._createRoomListBackground(sceneNode, screenWidth, screenHeight);
        
        // ===== 顶部标题区域 =====
        this._createRoomListHeader(sceneNode, screenWidth, screenHeight, roomConfig);
        
        // ===== 操作按钮区域 =====
        this._createRoomListActions(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);
        
        // ===== 房间列表区域 =====
        this._createRoomListContent(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);
        
        // ===== 底部信息栏 =====
        this._createRoomListFooter(sceneNode, screenWidth, screenHeight, playerGold, roomConfig);
    },
    
    // 创建背景
    _createRoomListBackground: function(parentNode, screenWidth, screenHeight) {
        // 主背景
        var bgNode = new cc.Node("BgLayer");
        bgNode.setContentSize(cc.size(screenWidth, screenHeight));
        
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = cc.color(20, 25, 45, 255);
        bgGraphics.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        bgGraphics.fill();
        bgNode.parent = parentNode;
        
        // 装饰边框
        var borderNode = new cc.Node("Border");
        var borderGraphics = borderNode.addComponent(cc.Graphics);
        borderGraphics.strokeColor = cc.color(180, 140, 60, 150);
        borderGraphics.lineWidth = 3;
        borderGraphics.roundRect(-screenWidth/2 + 5, -screenHeight/2 + 5, screenWidth - 10, screenHeight - 10, 10);
        borderGraphics.stroke();
        borderNode.parent = parentNode;
        
        // 角落装饰
        var corners = [
            { x: -screenWidth/2 + 30, y: screenHeight/2 - 30, rot: 0 },
            { x: screenWidth/2 - 30, y: screenHeight/2 - 30, rot: 90 },
            { x: screenWidth/2 - 30, y: -screenHeight/2 + 30, rot: 180 },
            { x: -screenWidth/2 + 30, y: -screenHeight/2 + 30, rot: 270 }
        ];
        
        for (var i = 0; i < corners.length; i++) {
            var corner = corners[i];
            var cornerNode = new cc.Node("Corner" + i);
            cornerNode.setPosition(corner.x, corner.y);
            cornerNode.rotation = corner.rot;
            
            var cg = cornerNode.addComponent(cc.Graphics);
            cg.strokeColor = cc.color(220, 180, 80, 200);
            cg.lineWidth = 2;
            cg.moveTo(0, 0);
            cg.lineTo(40, 0);
            cg.lineTo(40, 15);
            cg.moveTo(0, 0);
            cg.lineTo(0, 40);
            cg.lineTo(15, 40);
            cg.stroke();
            
            cornerNode.parent = parentNode;
        }
    },
    
    // 创建顶部标题区域
    _createRoomListHeader: function(parentNode, screenWidth, screenHeight, roomConfig) {
        var headerY = screenHeight/2 - 60;
        var headerHeight = 70;
        
        // 标题背景
        var headerBg = new cc.Node("HeaderBg");
        headerBg.setContentSize(cc.size(screenWidth - 60, headerHeight));
        headerBg.setPosition(0, headerY);
        
        var hg = headerBg.addComponent(cc.Graphics);
        hg.fillColor = cc.color(35, 30, 50, 240);
        hg.roundRect(-(screenWidth - 60)/2, -headerHeight/2, screenWidth - 60, headerHeight, 8);
        hg.fill();
        hg.strokeColor = cc.color(180, 140, 60, 200);
        hg.lineWidth = 2;
        hg.roundRect(-(screenWidth - 60)/2, -headerHeight/2, screenWidth - 60, headerHeight, 8);
        hg.stroke();
        headerBg.parent = parentNode;
        
        // 左侧装饰
        var leftDeco = new cc.Node("LeftDeco");
        leftDeco.setPosition(-screenWidth/2 + 80, headerY);
        var ld = leftDeco.addComponent(cc.Graphics);
        ld.fillColor = cc.color(200, 160, 60, 220);
        ld.circle(0, 0, 8);
        ld.fill();
        leftDeco.parent = parentNode;
        
        // 右侧装饰
        var rightDeco = new cc.Node("RightDeco");
        rightDeco.setPosition(screenWidth/2 - 80, headerY);
        var rd = rightDeco.addComponent(cc.Graphics);
        rd.fillColor = cc.color(200, 160, 60, 220);
        rd.circle(0, 0, 8);
        rd.fill();
        rightDeco.parent = parentNode;
        
        // 房间名称
        var titleText = new cc.Node("TitleText");
        titleText.setPosition(0, headerY + 8);
        titleText.anchorX = 0.5;
        titleText.anchorY = 0.5;
        
        var titleLabel = titleText.addComponent(cc.Label);
        titleLabel.string = roomConfig.room_name || "游戏房间";
        titleLabel.fontSize = 32;
        titleLabel.lineHeight = 40;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleText.color = cc.color(255, 220, 100);
        
        var titleOutline = titleText.addComponent(cc.LabelOutline);
        titleOutline.color = cc.color(80, 50, 0);
        titleOutline.width = 2;
        titleText.parent = parentNode;
        
        // 副标题
        var subText = new cc.Node("SubText");
        subText.setPosition(0, headerY - 18);
        subText.anchorX = 0.5;
        subText.anchorY = 0.5;
        
        var subLabel = subText.addComponent(cc.Label);
        subLabel.string = "底分 " + (roomConfig.base_score || 1) + "  ·  倍率 " + (roomConfig.multiplier || 1) + "x";
        subLabel.fontSize = 16;
        subLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        subText.color = cc.color(180, 160, 120);
        subText.parent = parentNode;
    },
    
    // 创建操作按钮区域
    _createRoomListActions: function(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
        var self = this;
        var actionY = screenHeight/2 - 130;
        
        // 左侧：输入房号搜索
        var searchX = -screenWidth/2 + 180;
        
        // 搜索输入框
        var inputNode = this._createInputNode("输入房间号", searchX, actionY, 160, 34);
        inputNode.parent = parentNode;
        
        // 搜索按钮（使用 btn_enter_room 图片）
        var searchBtn = this._createImageButtonNode(
            'UI/btn_enter_room',
            "加入房间",
            searchX + 120,
            actionY,
            100,
            40,
            function() {
                var inputNode = parentNode.getChildByName("RoomCodeInput");
                var placeholder = inputNode ? inputNode.getChildByName("Placeholder") : null;
                var roomCode = placeholder ? placeholder.getComponent(cc.Label).string : "";
                if (roomCode && roomCode !== "输入房间号") {
                    self._joinRoom(roomCode, roomConfig, playerGold);
                } else {
                    self._showTipInScene(parentNode, "请输入房间号");
                }
            }
        );
        searchBtn.parent = parentNode;
        
        // 右侧按钮组
        var btnX = screenWidth/2 - 180;
        
        // 创建房间按钮（使用 btn_create_room 图片）
        var createBtn = this._createImageButtonNode(
            'UI/btn_create_room',
            "创建房间",
            btnX - 60,
            actionY,
            100,
            40,
            function() {
                self._showCreateRoomDialog(parentNode, roomConfig, playerGold);
            }
        );
        createBtn.parent = parentNode;
        
        // 快速开始按钮（使用 login_btn_quickStart 图片）
        var quickBtn = this._createImageButtonNode(
            'UI/button/login_btn_quickStart',
            "快速开始",
            btnX + 70,
            actionY,
            100,
            40,
            function() {
                var scene = parentNode.getChildByName("RoomListScene") || parentNode;
                if (scene.destroy) scene.destroy();
                self._quickMatch(roomConfig, playerGold);
            }
        );
        quickBtn.parent = parentNode;
    },
    
    // 创建房间列表区域
    _createRoomListContent: function(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
        var listY = -15;
        var listHeight = screenHeight - 300;
        var listWidth = screenWidth - 80;
        
        // 列表背景
        var listBg = new cc.Node("ListBg");
        listBg.setContentSize(cc.size(listWidth, listHeight));
        listBg.setPosition(0, listY);
        
        var lg = listBg.addComponent(cc.Graphics);
        lg.fillColor = cc.color(25, 22, 40, 230);
        lg.roundRect(-listWidth/2, -listHeight/2, listWidth, listHeight, 8);
        lg.fill();
        lg.strokeColor = cc.color(100, 80, 50, 180);
        lg.lineWidth = 1;
        lg.roundRect(-listWidth/2, -listHeight/2, listWidth, listHeight, 8);
        lg.stroke();
        listBg.parent = parentNode;
        
        // 表头
        var headerY = listY + listHeight/2 - 25;
        var headerH = 35;
        
        // 表头背景
        var hhBg = new cc.Node("TableHeaderBg");
        hhBg.setPosition(0, headerY);
        
        var hhg = hhBg.addComponent(cc.Graphics);
        hhg.fillColor = cc.color(45, 40, 60, 250);
        hhg.roundRect(-listWidth/2 + 5, -headerH/2, listWidth - 10, headerH, 5);
        hhg.fill();
        hhBg.parent = parentNode;
        
        // 表头文字
        var headers = [
            { text: "房间号", x: -listWidth/2 + 100 },
            { text: "人数", x: -listWidth/2 + 250 },
            { text: "底分", x: -listWidth/2 + 380 },
            { text: "状态", x: -listWidth/2 + 500 },
            { text: "操作", x: listWidth/2 - 80 }
        ];
        
        for (var i = 0; i < headers.length; i++) {
            var hNode = new cc.Node("H" + i);
            hNode.setPosition(headers[i].x, headerY);
            hNode.anchorX = 0.5;
            hNode.anchorY = 0.5;
            
            var hl = hNode.addComponent(cc.Label);
            hl.string = headers[i].text;
            hl.fontSize = 16;
            hl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            hNode.color = cc.color(220, 180, 100);
            hNode.parent = parentNode;
        }
        
        // 房间列表容器
        var roomContainer = new cc.Node("RoomListContainer");
        roomContainer.setContentSize(cc.size(listWidth - 30, listHeight - 60));
        roomContainer.y = listY - 15;
        roomContainer.parent = parentNode;
        
        // 加载提示
        var loadingNode = new cc.Node("LoadingLabel");
        loadingNode.y = 0;
        loadingNode.anchorX = 0.5;
        loadingNode.anchorY = 0.5;
        
        var ll = loadingNode.addComponent(cc.Label);
        ll.string = "正在加载...";
        ll.fontSize = 18;
        ll.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        loadingNode.color = cc.color(150, 140, 130);
        loadingNode.parent = roomContainer;
        
        // 获取房间列表
        this._fetchAndRenderRoomListForScene(roomContainer, loadingNode, roomConfig, playerGold, parentNode);
    },
    
    // 创建底部信息栏
    _createRoomListFooter: function(parentNode, screenWidth, screenHeight, playerGold, roomConfig) {
        var self = this;
        var footerY = -screenHeight/2 + 45;
        
        // 底部背景
        var footerBg = new cc.Node("FooterBg");
        footerBg.setPosition(0, footerY);
        
        var fg = footerBg.addComponent(cc.Graphics);
        fg.fillColor = cc.color(30, 25, 45, 240);
        fg.roundRect(-screenWidth/2 + 20, -22, screenWidth - 40, 44, 6);
        fg.fill();
        fg.strokeColor = cc.color(80, 60, 40, 150);
        fg.lineWidth = 1;
        fg.roundRect(-screenWidth/2 + 20, -22, screenWidth - 40, 44, 6);
        fg.stroke();
        footerBg.parent = parentNode;
        
        // 返回按钮
        var backBtn = this._createButtonNode("返回大厅", cc.color(70, 65, 80), -screenWidth/2 + 100, footerY, 90, 32, function() {
            var scene = parentNode.getChildByName("RoomListScene") || parentNode;
            if (scene.destroy) scene.destroy();
        });
        backBtn.parent = parentNode;
        
        // 金币显示
        var goldIcon = new cc.Node("GoldIcon");
        goldIcon.setPosition(50, footerY);
        
        var gg = goldIcon.addComponent(cc.Graphics);
        gg.fillColor = cc.color(230, 180, 50);
        gg.circle(0, 0, 10);
        gg.fill();
        gg.fillColor = cc.color(250, 210, 80);
        gg.circle(0, 0, 6);
        gg.fill();
        goldIcon.parent = parentNode;
        
        var goldText = new cc.Node("GoldText");
        goldText.setPosition(75, footerY);
        goldText.anchorX = 0;
        goldText.anchorY = 0.5;
        
        var gl = goldText.addComponent(cc.Label);
        gl.string = this._formatGold(playerGold);
        gl.fontSize = 18;
        goldText.color = cc.color(230, 190, 80);
        goldText.parent = parentNode;
        
        // 刷新按钮
        var refreshBtn = this._createButtonNode("刷新", cc.color(80, 75, 90), screenWidth/2 - 80, footerY, 70, 32, function() {
            var container = parentNode.getChildByName("RoomListContainer");
            if (!container) return;
            
            var loading = container.getChildByName("LoadingLabel");
            if (loading) {
                loading.active = true;
                loading.getComponent(cc.Label).string = "正在刷新...";
            }
            
            var children = container.children.slice();
            for (var i = 0; i < children.length; i++) {
                if (children[i].name !== "LoadingLabel") {
                    children[i].destroy();
                }
            }
            self._fetchAndRenderRoomListForScene(container, loading, roomConfig, playerGold, parentNode);
        });
        refreshBtn.parent = parentNode;
    },
    
    // 创建按钮节点（文字在按钮内部）
    _createButtonNode: function(text, bgColor, x, y, width, height, callback, isPrimary) {
        var btn = new cc.Node("Btn_" + text);
        btn.setContentSize(cc.size(width, height));
        btn.setPosition(x, y);
        btn.anchorX = 0.5;
        btn.anchorY = 0.5;
        
        // 按钮背景节点
        var bgNode = new cc.Node("BgNode");
        bgNode.setPosition(0, 0);
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        
        var bg = bgNode.addComponent(cc.Graphics);
        
        // 绘制按钮背景
        bg.fillColor = bgColor;
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.fill();
        
        // 边框
        var borderColor = cc.color(
            Math.min(255, bgColor.r + 40),
            Math.min(255, bgColor.g + 40),
            Math.min(255, bgColor.b + 40)
        );
        bg.strokeColor = borderColor;
        bg.lineWidth = 1;
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.stroke();
        
        // 主按钮高光
        if (isPrimary) {
            bg.fillColor = cc.color(255, 255, 255, 50);
            bg.roundRect(-width/2 + 2, 2, width - 4, height/2 - 2, 3);
            bg.fill();
        }
        bgNode.parent = btn;
        
        // 按钮文字节点（独立的子节点）
        var textNode = new cc.Node("TextNode");
        textNode.setPosition(0, 0);  // 必须设置位置为按钮中心
        textNode.anchorX = 0.5;
        textNode.anchorY = 0.5;
        textNode.width = width;
        textNode.height = height;
        
        var label = textNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = Math.floor(height * 0.42);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        textNode.color = cc.color(255, 255, 255);
        
        var outline = textNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0, 120);
        outline.width = 1;
        textNode.parent = btn;
        
        // 触摸事件
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
    
    // 创建使用图片的按钮节点
    _createImageButtonNode: function(imagePath, text, x, y, width, height, callback) {
        var self = this;
        var btn = new cc.Node("Btn_" + text);
        btn.setContentSize(cc.size(width, height));
        btn.setPosition(x, y);
        btn.anchorX = 0.5;
        btn.anchorY = 0.5;
        
        // 添加 Sprite 组件
        var sprite = btn.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        
        // 加载按钮图片
        cc.resources.load(imagePath, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.warn("加载按钮图片失败:", imagePath);
                // 使用备用样式
                self._createButtonFallback(btn, text, width, height);
                return;
            }
            sprite.spriteFrame = spriteFrame;
            console.log("✅ 按钮图片加载成功:", imagePath);
        });
        
        // 添加 Button 组件
        var button = btn.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 0.95;
        
        // 触摸事件
        btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            if (callback) callback();
        });
        
        return btn;
    },
    
    // 按钮备用样式（图片加载失败时使用）
    _createButtonFallback: function(btn, text, width, height) {
        // 绘制按钮背景
        var graphics = btn.addComponent(cc.Graphics);
        
        // 根据按钮文字选择颜色
        var bgColor;
        if (text.indexOf("创建") >= 0) {
            bgColor = cc.color(30, 90, 160);  // 蓝色
        } else if (text.indexOf("加入") >= 0 || text.indexOf("进入") >= 0) {
            bgColor = cc.color(40, 130, 60);  // 绿色
        } else if (text.indexOf("快速") >= 0) {
            bgColor = cc.color(200, 120, 40);  // 橙色
        } else {
            bgColor = cc.color(80, 80, 80);  // 灰色
        }
        
        graphics.fillColor = bgColor;
        graphics.roundRect(-width/2, -height/2, width, height, 6);
        graphics.fill();
        graphics.strokeColor = cc.color(255, 255, 255, 80);
        graphics.lineWidth = 2;
        graphics.roundRect(-width/2, -height/2, width, height, 6);
        graphics.stroke();
        
        // 添加文字
        var labelNode = new cc.Node("Label");
        var label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = Math.floor(height * 0.4);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = btn;
    },
    
    // 创建输入框节点
    _createInputNode: function(placeholder, x, y, width, height) {
        var inputNode = new cc.Node("InputNode");
        inputNode.setContentSize(cc.size(width, height));
        inputNode.setPosition(x, y);
        inputNode.anchorX = 0.5;
        inputNode.anchorY = 0.5;
        inputNode.name = "RoomCodeInput";
        
        // 输入框背景
        var bgNode = new cc.Node("InputBg");
        bgNode.setPosition(0, 0);
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        
        var bg = bgNode.addComponent(cc.Graphics);
        bg.fillColor = cc.color(45, 40, 60, 255);
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.fill();
        bg.strokeColor = cc.color(100, 90, 70, 200);
        bg.lineWidth = 1;
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.stroke();
        bgNode.parent = inputNode;
        
        // placeholder文字节点
        var placeholderNode = new cc.Node("Placeholder");
        placeholderNode.setPosition(0, 0);
        placeholderNode.anchorX = 0.5;
        placeholderNode.anchorY = 0.5;
        placeholderNode.width = width - 20;
        placeholderNode.height = height;
        
        var label = placeholderNode.addComponent(cc.Label);
        label.string = placeholder;
        label.fontSize = Math.floor(height * 0.4);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        placeholderNode.color = cc.color(130, 120, 110);
        placeholderNode.parent = inputNode;
        
        return inputNode;
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
    
    // ============================================================
    // 显示创建房间弹窗（精美游戏风格）
    // ============================================================
    _showCreateRoomDialog: function(parentNode, roomConfig, playerGold) {
        var self = this;
        
        console.log("显示创建房间弹窗");
        
        // 移除旧弹窗
        var oldDialog = parentNode.getChildByName("CreateRoomDialog");
        if (oldDialog) oldDialog.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 弹窗容器
        var dialog = new cc.Node("CreateRoomDialog");
        dialog.setContentSize(cc.size(screenWidth, screenHeight));
        dialog.setPosition(0, 0);
        dialog.zIndex = 3000;
        dialog.parent = parentNode;
        
        // 半透明遮罩
        var mask = new cc.Node("Mask");
        mask.setPosition(0, 0);
        var maskG = mask.addComponent(cc.Graphics);
        maskG.fillColor = cc.color(0, 0, 0, 200);
        maskG.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        maskG.fill();
        mask.parent = dialog;
        
        // 点击遮罩关闭
        mask.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            dialog.destroy();
        });
        
        // 弹窗主体 - 更宽更美观
        var dialogWidth = 500;
        var dialogHeight = 480;
        var dialogBg = new cc.Node("DialogBg");
        dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
        dialogBg.setPosition(0, 0);
        
        var dbg = dialogBg.addComponent(cc.Graphics);
        // 外层阴影
        dbg.fillColor = cc.color(0, 0, 0, 60);
        dbg.roundRect(-dialogWidth/2 + 6, -dialogHeight/2 - 6, dialogWidth, dialogHeight, 16);
        dbg.fill();
        
        // 主背景
        dbg.fillColor = cc.color(28, 25, 42, 255);
        dbg.roundRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 16);
        dbg.fill();
        dbg.strokeColor = cc.color(255, 180, 60, 255);  // 金橙色边框
        dbg.lineWidth = 3;
        dbg.roundRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 16);
        dbg.stroke();
        dialogBg.parent = dialog;
        
        // ===== 顶部装饰条 - 橙色主题 =====
        var topBar = new cc.Node("TopBar");
        topBar.setContentSize(cc.size(dialogWidth, 8));
        topBar.y = dialogHeight/2 - 4;
        var topGfx = topBar.addComponent(cc.Graphics);
        topGfx.fillColor = cc.color(255, 152, 0);  // 橙色主题色 - 区别于加入房间的绿色
        topGfx.roundRect(-dialogWidth/2, -4, dialogWidth, 8, [16, 16, 0, 0]);
        topGfx.fill();
        topBar.parent = dialog;
        
        // ===== 标题区域 =====
        var titleBg = new cc.Node("TitleBg");
        titleBg.setContentSize(cc.size(dialogWidth - 40, 70));
        titleBg.y = dialogHeight/2 - 55;
        var titleBgGfx = titleBg.addComponent(cc.Graphics);
        titleBgGfx.fillColor = cc.color(42, 38, 58, 250);
        titleBgGfx.roundRect(-(dialogWidth - 40)/2, -35, dialogWidth - 40, 70, 10);
        titleBgGfx.fill();
        titleBg.parent = dialog;
        
        // 图标
        var iconNode = new cc.Node("Icon");
        var iconLabel = iconNode.addComponent(cc.Label);
        iconLabel.string = "🏠";
        iconLabel.fontSize = 32;
        iconNode.x = -120;
        iconNode.y = dialogHeight/2 - 55;
        iconNode.parent = dialog;
        
        // 标题文字
        var titleText = new cc.Node("TitleText");
        titleText.setPosition(0, dialogHeight/2 - 50);
        titleText.anchorX = 0.5;
        titleText.anchorY = 0.5;
        var ttl = titleText.addComponent(cc.Label);
        ttl.string = "创建房间";
        ttl.fontSize = 30;
        ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleText.color = cc.color(255, 220, 100);
        
        var titleOutline = titleText.addComponent(cc.LabelOutline);
        titleOutline.color = cc.color(120, 70, 0);
        titleOutline.width = 2;
        titleText.parent = dialog;
        
        // 副标题说明
        var subtitleNode = new cc.Node("Subtitle");
        subtitleNode.y = dialogHeight/2 - 95;
        var subtitleLabel = subtitleNode.addComponent(cc.Label);
        subtitleLabel.string = "创建专属房间，邀请好友一起游戏";
        subtitleLabel.fontSize = 14;
        subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        subtitleNode.color = cc.color(180, 170, 150);
        subtitleNode.parent = dialog;
        
        // 房间类型卡片
        var roomTypeBg = new cc.Node("RoomTypeBg");
        roomTypeBg.setPosition(0, dialogHeight/2 - 130);
        var rtbg = roomTypeBg.addComponent(cc.Graphics);
        rtbg.fillColor = cc.color(50, 45, 70, 200);
        rtbg.roundRect(-100, -18, 200, 36, 18);
        rtbg.fill();
        rtbg.strokeColor = cc.color(255, 180, 60, 180);
        rtbg.lineWidth = 1;
        rtbg.roundRect(-100, -18, 200, 36, 18);
        rtbg.stroke();
        roomTypeBg.parent = dialog;
        
        var roomTypeText = new cc.Node("RoomType");
        roomTypeText.setPosition(0, dialogHeight/2 - 130);
        roomTypeText.anchorX = 0.5;
        roomTypeText.anchorY = 0.5;
        var rtl = roomTypeText.addComponent(cc.Label);
        rtl.string = "【" + (roomConfig.room_name || "初级房") + "】";
        rtl.fontSize = 18;
        rtl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        roomTypeText.color = cc.color(255, 200, 100);
        roomTypeText.parent = dialog;
        
        // 房间信息区域背景
        var infoBg = new cc.Node("InfoBg");
        infoBg.setPosition(0, -10);
        var ibg = infoBg.addComponent(cc.Graphics);
        ibg.fillColor = cc.color(35, 30, 50, 230);
        ibg.roundRect(-dialogWidth/2 + 30, -95, dialogWidth - 60, 200, 10);
        ibg.fill();
        ibg.strokeColor = cc.color(80, 65, 50, 150);
        ibg.lineWidth = 1;
        ibg.roundRect(-dialogWidth/2 + 30, -95, dialogWidth - 60, 200, 10);
        ibg.stroke();
        infoBg.parent = dialog;
        
        // 房间名称区域
        var nameLabel = new cc.Node("NameLabel");
        nameLabel.setPosition(-dialogWidth/2 + 90, 60);
        nameLabel.anchorX = 0.5;
        nameLabel.anchorY = 0.5;
        var nll = nameLabel.addComponent(cc.Label);
        nll.string = "房间名称";
        nll.fontSize = 16;
        nameLabel.color = cc.color(220, 200, 150);
        nameLabel.parent = dialog;
        
        // 房间名称输入框
        var nameInput = this._createBeautifulInput("自定义房间名（可选）", 50, 15, 300, 42, "RoomNameInput");
        nameInput.parent = dialog;
        
        // 密码区域
        var pwdLabel = new cc.Node("PwdLabel");
        pwdLabel.setPosition(-dialogWidth/2 + 90, -35);
        pwdLabel.anchorX = 0.5;
        pwdLabel.anchorY = 0.5;
        var pl = pwdLabel.addComponent(cc.Label);
        pl.string = "房间密码";
        pl.fontSize = 16;
        pwdLabel.color = cc.color(220, 200, 150);
        pwdLabel.parent = dialog;
        
        // 密码输入框
        var pwdInput = this._createBeautifulInput("设置密码（可选，留空为公开房间）", 50, -35, 300, 42, "PwdInput");
        pwdInput.parent = dialog;
        
        // 提示信息区域
        var tipBg = new cc.Node("TipBg");
        tipBg.setPosition(0, -85);
        var tipGfx = tipBg.addComponent(cc.Graphics);
        tipGfx.fillColor = cc.color(45, 40, 60, 200);
        tipGfx.roundRect(-dialogWidth/2 + 40, -12, dialogWidth - 80, 24, 6);
        tipGfx.fill();
        tipBg.parent = dialog;
        
        var tipIcon = new cc.Node("TipIcon");
        var tipIconLabel = tipIcon.addComponent(cc.Label);
        tipIconLabel.string = "💡";
        tipIconLabel.fontSize = 14;
        tipIcon.x = -dialogWidth/2 + 70;
        tipIcon.y = -85;
        tipIcon.parent = dialog;
        
        var tipNode = new cc.Node("Tip");
        tipNode.y = -85;
        var tipLabel = tipNode.addComponent(cc.Label);
        tipLabel.string = "公开房间任何人可直接加入，私密房间需要密码";
        tipLabel.fontSize = 12;
        tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tipNode.color = cc.color(160, 150, 130);
        tipNode.parent = dialog;
        
        // 按钮区域
        var btnY = -dialogHeight/2 + 55;
        
        // 取消按钮
        var cancelBtn = new cc.Node("CancelBtn");
        cancelBtn.setContentSize(cc.size(140, 48));
        cancelBtn.x = -95;
        cancelBtn.y = btnY;
        var cancelGfx = cancelBtn.addComponent(cc.Graphics);
        cancelGfx.fillColor = cc.color(70, 65, 85);
        cancelGfx.roundRect(-70, -24, 140, 48, 10);
        cancelGfx.fill();
        cancelGfx.strokeColor = cc.color(100, 95, 115);
        cancelGfx.lineWidth = 2;
        cancelGfx.roundRect(-70, -24, 140, 48, 10);
        cancelGfx.stroke();
        cancelBtn.parent = dialog;
        
        var cancelLabel = new cc.Node("Label");
        var cancelLabelComp = cancelLabel.addComponent(cc.Label);
        cancelLabelComp.string = "取消";
        cancelLabelComp.fontSize = 20;
        cancelLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        cancelLabel.color = cc.color(200, 195, 180);
        cancelLabel.parent = cancelBtn;
        
        var cancelBtnComp = cancelBtn.addComponent(cc.Button);
        cancelBtnComp.transition = cc.Button.Transition.SCALE;
        cancelBtnComp.zoomScale = 0.95;
        
        cancelBtn.on(cc.Node.EventType.TOUCH_END, function() {
            dialog.destroy();
        });
        
        // 创建房间按钮 - 橙色主题
        var createBtn = new cc.Node("CreateBtn");
        createBtn.setContentSize(cc.size(160, 48));
        createBtn.x = 105;
        createBtn.y = btnY;
        var createGfx = createBtn.addComponent(cc.Graphics);
        createGfx.fillColor = cc.color(255, 152, 0);  // 橙色主题
        createGfx.roundRect(-80, -24, 160, 48, 10);
        createGfx.fill();
        createGfx.strokeColor = cc.color(255, 200, 100);
        createGfx.lineWidth = 2;
        createGfx.roundRect(-80, -24, 160, 48, 10);
        createGfx.stroke();
        createBtn.parent = dialog;
        
        var createIcon = new cc.Node("Icon");
        var createIconLabel = createIcon.addComponent(cc.Label);
        createIconLabel.string = "+";
        createIconLabel.fontSize = 22;
        createIcon.x = -50;
        createIcon.color = cc.color(255, 255, 255);
        createIcon.parent = createBtn;
        
        var createLabel = new cc.Node("Label");
        var createLabelComp = createLabel.addComponent(cc.Label);
        createLabelComp.string = "创建房间";
        createLabelComp.fontSize = 20;
        createLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        createLabel.color = cc.color(255, 255, 255);
        createLabel.parent = createBtn;
        
        var createBtnComp = createBtn.addComponent(cc.Button);
        createBtnComp.transition = cc.Button.Transition.SCALE;
        createBtnComp.zoomScale = 0.95;
        
        createBtn.on(cc.Node.EventType.TOUCH_END, function() {
            // 获取输入内容
            var nameInputNode = dialog.getChildByName("RoomNameInput");
            var namePlaceholder = nameInputNode ? nameInputNode.getChildByName("Placeholder") : null;
            var roomName = namePlaceholder ? namePlaceholder.getComponent(cc.Label).string : "";
            
            var pwdInputNode = dialog.getChildByName("PwdInput");
            var pwdPlaceholder = pwdInputNode ? pwdInputNode.getChildByName("Placeholder") : null;
            var password = pwdPlaceholder ? pwdPlaceholder.getComponent(cc.Label).string : "";
            
            // 保存房间信息
            var myglobal = window.myglobal;
            if (myglobal) {
                myglobal.createRoomInfo = {
                    roomName: roomName && roomName !== "自定义房间名（可选）" ? roomName : roomConfig.room_name,
                    password: password && password !== "设置密码（可选，留空为公开房间）" ? password : "",
                    roomConfig: roomConfig
                };
            }
            
            console.log("创建房间:", roomName, "密码:", password ? "已设置" : "无");
            
            dialog.destroy();
            
            // 关闭房间列表界面并创建房间
            var scene = parentNode.getChildByName("RoomListScene") || parentNode;
            if (scene.destroy) scene.destroy();
            
            // 调用原来的创建房间方法
            self._createRoom(roomConfig, playerGold);
        });
        
        // 右上角关闭按钮
        var closeBtn = new cc.Node("CloseBtn");
        closeBtn.setContentSize(cc.size(40, 40));
        closeBtn.x = dialogWidth/2 - 25;
        closeBtn.y = dialogHeight/2 - 25;
        var closeGfx = closeBtn.addComponent(cc.Graphics);
        closeGfx.fillColor = cc.color(60, 55, 75);
        closeGfx.circle(0, 0, 20);
        closeGfx.fill();
        closeBtn.parent = dialog;
        
        var closeX = new cc.Node("X");
        var closeLabel = closeX.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 28;
        closeLabel.lineHeight = 36;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeX.color = cc.color(180, 170, 160);
        closeX.parent = closeBtn;
        
        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            dialog.destroy();
        });
    },
    
    // 创建精美输入框
    _createBeautifulInput: function(placeholder, x, y, width, height, nodeName) {
        var inputNode = new cc.Node(nodeName || "BeautifulInput");
        inputNode.setContentSize(cc.size(width, height));
        inputNode.setPosition(x, y);
        inputNode.anchorX = 0.5;
        inputNode.anchorY = 0.5;
        
        // 输入框背景
        var bgNode = new cc.Node("InputBg");
        bgNode.setPosition(0, 0);
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        
        var bg = bgNode.addComponent(cc.Graphics);
        // 内部填充
        bg.fillColor = cc.color(55, 45, 70, 255);
        bg.roundRect(-width/2, -height/2, width, height, 6);
        bg.fill();
        // 边框
        bg.strokeColor = cc.color(150, 120, 80, 200);
        bg.lineWidth = 2;
        bg.roundRect(-width/2, -height/2, width, height, 6);
        bg.stroke();
        // 内部高光
        bg.strokeColor = cc.color(80, 70, 100, 100);
        bg.lineWidth = 1;
        bg.roundRect(-width/2 + 3, -height/2 + 3, width - 6, height - 6, 4);
        bg.stroke();
        bgNode.parent = inputNode;
        
        // placeholder文字
        var placeholderNode = new cc.Node("Placeholder");
        placeholderNode.setPosition(0, 0);
        placeholderNode.anchorX = 0.5;
        placeholderNode.anchorY = 0.5;
        placeholderNode.width = width - 20;
        placeholderNode.height = height;
        
        var label = placeholderNode.addComponent(cc.Label);
        label.string = placeholder;
        label.fontSize = 14;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        placeholderNode.color = cc.color(140, 130, 120);
        placeholderNode.parent = inputNode;
        
        return inputNode;
    },
    
    // 创建精美按钮
    _createBeautifulButton: function(text, bgColor, borderColor, x, y, width, height, callback, isPrimary) {
        var btn = new cc.Node("BeautifulBtn_" + text);
        btn.setContentSize(cc.size(width, height));
        btn.setPosition(x, y);
        btn.anchorX = 0.5;
        btn.anchorY = 0.5;
        
        // 按钮背景节点
        var bgNode = new cc.Node("BgNode");
        bgNode.setPosition(0, 0);
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        
        var bg = bgNode.addComponent(cc.Graphics);
        
        // 绘制按钮背景
        bg.fillColor = bgColor;
        bg.roundRect(-width/2, -height/2, width, height, 8);
        bg.fill();
        
        // 外边框
        bg.strokeColor = borderColor;
        bg.lineWidth = 2;
        bg.roundRect(-width/2, -height/2, width, height, 8);
        bg.stroke();
        
        // 主按钮高光效果
        if (isPrimary) {
            // 顶部高光
            bg.fillColor = cc.color(255, 255, 255, 40);
            bg.roundRect(-width/2 + 3, 3, width - 6, height/2 - 3, 5);
            bg.fill();
            // 底部阴影
            bg.fillColor = cc.color(0, 0, 0, 30);
            bg.roundRect(-width/2 + 3, -height/2 + 3, width - 6, height/3, 3);
            bg.fill();
        }
        bgNode.parent = btn;
        
        // 按钮文字节点
        var textNode = new cc.Node("TextNode");
        textNode.setPosition(0, 0);
        textNode.anchorX = 0.5;
        textNode.anchorY = 0.5;
        textNode.width = width;
        textNode.height = height;
        
        var label = textNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = Math.floor(height * 0.4);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        textNode.color = cc.color(255, 255, 255);
        
        var outline = textNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0, 150);
        outline.width = 2;
        textNode.parent = btn;
        
        // 触摸事件
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
    
    // 创建弹窗输入框
    _createDialogInput: function(placeholder, x, y, width, height, nodeName) {
        var inputNode = new cc.Node(nodeName || "DialogInput");
        inputNode.setContentSize(cc.size(width, height));
        inputNode.setPosition(x, y);
        inputNode.anchorX = 0.5;
        inputNode.anchorY = 0.5;
        
        // 输入框背景
        var bgNode = new cc.Node("InputBg");
        bgNode.setPosition(0, 0);
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        
        var bg = bgNode.addComponent(cc.Graphics);
        bg.fillColor = cc.color(50, 45, 65, 255);
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.fill();
        bg.strokeColor = cc.color(100, 90, 70, 200);
        bg.lineWidth = 1;
        bg.roundRect(-width/2, -height/2, width, height, 5);
        bg.stroke();
        bgNode.parent = inputNode;
        
        // placeholder文字
        var placeholderNode = new cc.Node("Placeholder");
        placeholderNode.setPosition(0, 0);
        placeholderNode.anchorX = 0.5;
        placeholderNode.anchorY = 0.5;
        placeholderNode.width = width - 20;
        placeholderNode.height = height;
        
        var label = placeholderNode.addComponent(cc.Label);
        label.string = placeholder;
        label.fontSize = Math.floor(height * 0.4);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        placeholderNode.color = cc.color(120, 110, 100);
        placeholderNode.parent = inputNode;
        
        return inputNode;
    },
    
    // ============================================================
    // 显示加入房间密码验证弹窗（有密码的房间）
    // ============================================================
    _showPasswordDialog: function(roomCode, roomConfig, playerGold, callback) {
        var self = this;
        
        console.log("显示密码验证弹窗, 房间号:", roomCode);
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 弹窗容器
        var dialog = new cc.Node("PasswordDialog");
        dialog.setContentSize(cc.size(screenWidth, screenHeight));
        dialog.setPosition(0, 0);
        dialog.zIndex = 3500;
        dialog.parent = this.node;
        
        // 半透明遮罩
        var mask = new cc.Node("Mask");
        var maskG = mask.addComponent(cc.Graphics);
        maskG.fillColor = cc.color(0, 0, 0, 180);
        maskG.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        maskG.fill();
        mask.parent = dialog;
        
        mask.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
        });
        
        // 弹窗主体
        var dialogWidth = 350;
        var dialogHeight = 220;
        var dialogBg = new cc.Node("DialogBg");
        dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
        
        var dbg = dialogBg.addComponent(cc.Graphics);
        dbg.fillColor = cc.color(35, 30, 50, 250);
        dbg.roundRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 12);
        dbg.fill();
        dbg.strokeColor = cc.color(180, 140, 60, 200);
        dbg.lineWidth = 3;
        dbg.roundRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 12);
        dbg.stroke();
        dialogBg.parent = dialog;
        
        // 标题
        var titleText = new cc.Node("Title");
        titleText.setPosition(0, dialogHeight/2 - 40);
        titleText.anchorX = 0.5;
        titleText.anchorY = 0.5;
        var ttl = titleText.addComponent(cc.Label);
        ttl.string = "该房间需要密码";
        ttl.fontSize = 22;
        ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleText.color = cc.color(255, 220, 100);
        titleText.parent = dialog;
        
        // 房间号显示
        var codeText = new cc.Node("RoomCode");
        codeText.setPosition(0, dialogHeight/2 - 75);
        codeText.anchorX = 0.5;
        codeText.anchorY = 0.5;
        var ctl = codeText.addComponent(cc.Label);
        ctl.string = "房间号: " + roomCode;
        ctl.fontSize = 14;
        ctl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        codeText.color = cc.color(160, 150, 130);
        codeText.parent = dialog;
        
        // 密码输入框
        var pwdInput = this._createDialogInput("请输入密码", 0, 10, 200, 36, "PwdInput");
        pwdInput.parent = dialog;
        
        // 按钮区域
        var btnY = -dialogHeight/2 + 45;
        
        // 取消按钮
        var cancelBtn = this._createButtonNode("取消", cc.color(80, 75, 90), -70, btnY, 80, 34, function() {
            dialog.destroy();
        });
        cancelBtn.parent = dialog;
        
        // 确认按钮
        var confirmBtn = this._createButtonNode("确认", cc.color(40, 130, 70), 70, btnY, 80, 34, function() {
            var pwdInputNode = dialog.getChildByName("PwdInput");
            var placeholder = pwdInputNode ? pwdInputNode.getChildByName("Placeholder") : null;
            var password = placeholder ? placeholder.getComponent(cc.Label).string : "";
            
            if (!password || password === "请输入密码") {
                self._showTipInDialog(dialog, "请输入密码");
                return;
            }
            
            // 验证密码（这里需要调用服务端验证）
            console.log("验证密码:", password);
            
            dialog.destroy();
            
            if (callback) {
                callback(password);
            }
        }, true);
        confirmBtn.parent = dialog;
        
        return dialog;
    },
    
    // 在弹窗中显示提示
    _showTipInDialog: function(dialog, message) {
        var tip = dialog.getChildByName("TipText");
        if (tip) tip.destroy();
        
        tip = new cc.Node("TipText");
        tip.setPosition(0, -50);
        tip.anchorX = 0.5;
        tip.anchorY = 0.5;
        
        var label = tip.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 14;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tip.color = cc.color(255, 150, 100);
        tip.parent = dialog;
        
        this.scheduleOnce(function() {
            if (tip && tip.isValid) tip.destroy();
        }, 2);
    },
    
    // 获取并渲染房间列表（用于全屏场景）- 只显示真实房间
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
        
        // 如果WebSocket未连接，显示空列表
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，无法获取真实房间列表");
            
            this.scheduleOnce(function() {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.active = false;
                }
                // 显示空列表提示
                self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
            }, 0.5);
            return;
        }
        
        // 设置超时
        var timeoutId = setTimeout(function() {
            console.log("获取房间列表超时");
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.active = false;
            }
            // 显示空列表提示
            self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
        }, 5000);
        
        socket.getRoomList(function(result, rooms) {
            clearTimeout(timeoutId);
            
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.active = false;
            }
            
            if (result === 0 && rooms && rooms.length > 0) {
                // 存储房间列表用于实时更新
                currentRooms = rooms;
                // 过滤：只显示人数少于3人的房间
                var filteredRooms = rooms.filter(function(room) {
                    var count = room.player_count || room.playerCount || 0;
                    return count > 0 && count < 3;
                });
                self._renderRoomListInScene(container, filteredRooms, roomConfig, playerGold, sceneNode);
            } else {
                // 没有房间或请求失败，显示空列表
                console.log("没有获取到房间列表或房间列表为空");
                self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
            }
        });
    },
    

    
    // 渲染房间列表（简洁清晰的列表设计）
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
            // 空列表提示
            var emptyBg = new cc.Node("EmptyBg");
            var eg = emptyBg.addComponent(cc.Graphics);
            eg.fillColor = cc.color(35, 30, 50, 200);
            eg.roundRect(-150, -35, 300, 70, 8);
            eg.fill();
            eg.strokeColor = cc.color(100, 80, 50, 150);
            eg.lineWidth = 1;
            eg.roundRect(-150, -35, 300, 70, 8);
            eg.stroke();
            emptyBg.parent = container;
            
            var emptyText = new cc.Node("EmptyText");
            emptyText.anchorX = 0.5;
            emptyText.anchorY = 0.5;
            
            var el = emptyText.addComponent(cc.Label);
            el.string = "暂无房间，点击创建";
            el.fontSize = 18;
            el.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            emptyText.color = cc.color(180, 160, 120);
            emptyText.parent = emptyBg;
            return;
        }
        
        var containerWidth = container.width;
        var itemHeight = 45;
        var startY = container.height/2 - 25;
        
        for (var i = 0; i < rooms.length && i < 8; i++) {
            var room = rooms[i];
            var itemY = startY - i * itemHeight;
            
            // 列表项背景
            var itemBg = new cc.Node("RoomItem_" + i);
            itemBg.setContentSize(cc.size(containerWidth - 10, itemHeight - 5));
            itemBg.setPosition(0, itemY);
            
            var ig = itemBg.addComponent(cc.Graphics);
            ig.fillColor = i % 2 === 0 ? cc.color(35, 30, 50, 220) : cc.color(30, 28, 45, 220);
            ig.roundRect(-(containerWidth - 10)/2, -(itemHeight - 5)/2, containerWidth - 10, itemHeight - 5, 4);
            ig.fill();
            itemBg.parent = container;
            
            var playerCount = room.player_count || room.playerCount || 0;
            var roomCode = room.room_code || room.roomCode || "未知";
            
            // 房间号
            var codeText = new cc.Node("CodeText");
            codeText.setPosition(-containerWidth/2 + 80, 0);
            codeText.anchorX = 0.5;
            codeText.anchorY = 0.5;
            
            var cl = codeText.addComponent(cc.Label);
            cl.string = roomCode;
            cl.fontSize = 16;
            cl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            codeText.color = cc.color(220, 200, 160);
            codeText.parent = itemBg;
            
            // 人数
            var countText = new cc.Node("CountText");
            countText.setPosition(-containerWidth/2 + 220, 0);
            countText.anchorX = 0.5;
            countText.anchorY = 0.5;
            
            var ctl = countText.addComponent(cc.Label);
            ctl.string = playerCount + "/3";
            ctl.fontSize = 16;
            ctl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            countText.color = playerCount >= 3 ? cc.color(220, 100, 80) : cc.color(100, 200, 100);
            countText.parent = itemBg;
            
            // 底分
            var scoreText = new cc.Node("ScoreText");
            scoreText.setPosition(-containerWidth/2 + 350, 0);
            scoreText.anchorX = 0.5;
            scoreText.anchorY = 0.5;
            
            var sl = scoreText.addComponent(cc.Label);
            sl.string = "" + (room.base_score || roomConfig.base_score || 1);
            sl.fontSize = 16;
            sl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            scoreText.color = cc.color(220, 180, 80);
            scoreText.parent = itemBg;
            
            // 状态
            var statusText = new cc.Node("StatusText");
            statusText.setPosition(-containerWidth/2 + 470, 0);
            statusText.anchorX = 0.5;
            statusText.anchorY = 0.5;
            
            var stl = statusText.addComponent(cc.Label);
            stl.string = room.status || "等待中";
            stl.fontSize = 14;
            stl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            statusText.color = (room.status === "游戏中") ? cc.color(220, 100, 80) : cc.color(100, 200, 100);
            statusText.parent = itemBg;
            
            // 加入按钮
            (function(roomData) {
                var joinBtn = new cc.Node("JoinBtn");
                joinBtn.setContentSize(cc.size(60, 28));
                joinBtn.setPosition(containerWidth/2 - 50, 0);
                joinBtn.anchorX = 0.5;
                joinBtn.anchorY = 0.5;
                
                // 按钮背景节点
                var jbgNode = new cc.Node("BgNode");
                jbgNode.setPosition(0, 0);
                jbgNode.anchorX = 0.5;
                jbgNode.anchorY = 0.5;
                
                var jg = jbgNode.addComponent(cc.Graphics);
                jg.fillColor = cc.color(60, 140, 80);
                jg.roundRect(-30, -14, 60, 28, 4);
                jg.fill();
                jg.strokeColor = cc.color(80, 180, 100);
                jg.lineWidth = 1;
                jg.roundRect(-30, -14, 60, 28, 4);
                jg.stroke();
                jbgNode.parent = joinBtn;
                
                // 按钮文字节点
                var jTextNode = new cc.Node("TextNode");
                jTextNode.setPosition(0, 0);
                jTextNode.anchorX = 0.5;
                jTextNode.anchorY = 0.5;
                jTextNode.width = 60;
                jTextNode.height = 28;
                
                var jl = jTextNode.addComponent(cc.Label);
                jl.string = "加入";
                jl.fontSize = 14;
                jl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                jl.verticalAlign = cc.Label.VerticalAlign.CENTER;
                jTextNode.color = cc.color(255, 255, 255);
                jTextNode.parent = joinBtn;
                
                // 触摸事件
                joinBtn.on(cc.Node.EventType.TOUCH_START, function(event) {
                    event.stopPropagation();
                    joinBtn.scale = 0.9;
                });
                joinBtn.on(cc.Node.EventType.TOUCH_END, function(event) {
                    event.stopPropagation();
                    joinBtn.scale = 1;
                    var code = roomData.room_code || roomData.roomCode;
                    var scene = sceneNode.getChildByName("RoomListScene") || sceneNode;
                    if (scene.destroy) scene.destroy();
                    self._joinRoom(code, roomConfig, playerGold);
                });
                joinBtn.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
                    joinBtn.scale = 1;
                });
                
                joinBtn.parent = itemBg;
            })(room);
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
    
    // 获取房间列表 - 只显示真实房间
    _fetchRoomList: function(container, loadingLabel) {
        var self = this;
        var myglobal = window.myglobal;
        var socket = myglobal && myglobal.socket ? myglobal.socket : null;
        
        // 检查WebSocket是否已连接
        var isConnected = socket && socket.isConnected && socket.isConnected();
        var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
        
        console.log("获取房间列表 - WebSocket状态: isConnected=" + isConnected + ", isWebSocketOpen=" + isWebSocketOpen);
        
        // 如果WebSocket未连接，显示空列表
        if (!socket || !isConnected || !isWebSocketOpen) {
            console.log("WebSocket未连接，无法获取真实房间列表");
            loadingLabel.getComponent(cc.Label).string = "未连接服务器";
            
            this.scheduleOnce(function() {
                if (loadingLabel && loadingLabel.isValid) {
                    loadingLabel.destroy();
                }
                // 显示空列表提示
                self._renderRoomList(container, []);
            }, 0.5);
            return;
        }
        
        // 设置超时
        var timeoutId = setTimeout(function() {
            console.log("获取房间列表超时");
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.destroy();
            }
            // 显示空列表提示
            self._renderRoomList(container, []);
        }, 5000);
        
        socket.getRoomList(function(result, rooms) {
            clearTimeout(timeoutId);
            
            if (loadingLabel && loadingLabel.isValid) {
                loadingLabel.destroy();
            }
            
            if (result === 0 && rooms && rooms.length > 0) {
                self._renderRoomList(container, rooms);
            } else {
                // 服务端返回空列表或失败，显示空列表
                console.log("服务端返回空列表或请求失败");
                self._renderRoomList(container, []);
            }
        });
    },
    
    // 渲染房间列表 - 只显示真实房间
    _renderRoomList: function(container, rooms) {
        var self = this;
        
        // 如果没有房间，显示空列表提示
        if (!rooms || rooms.length === 0) {
            var emptyNode = new cc.Node("EmptyTip");
            emptyNode.y = 0;
            
            var emptyBg = emptyNode.addComponent(cc.Graphics);
            emptyBg.fillColor = cc.color(35, 30, 50, 200);
            emptyBg.roundRect(-150, -25, 300, 50, 8);
            emptyBg.fill();
            emptyBg.strokeColor = cc.color(100, 80, 50, 150);
            emptyBg.lineWidth = 1;
            emptyBg.roundRect(-150, -25, 300, 50, 8);
            emptyBg.stroke();
            
            var emptyLabel = new cc.Node("Label");
            emptyLabel.anchorX = 0.5;
            emptyLabel.anchorY = 0.5;
            var el = emptyLabel.addComponent(cc.Label);
            el.string = "暂无房间，请创建或刷新";
            el.fontSize = 16;
            el.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            emptyLabel.color = cc.color(180, 160, 120);
            emptyLabel.parent = emptyNode;
            
            emptyNode.parent = container;
            return;
        }
        
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
    
    // ============================================================
    // 创建加入房间按钮（使用 btn_enter_room.png）
    // ============================================================
    _createEnterRoomButton: function() {
        var self = this;
        
        console.log("=== 创建加入房间按钮 ===");
        
        // 移除旧的按钮
        var oldBtn = this.node.getChildByName("EnterRoomButton");
        if (oldBtn) oldBtn.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建按钮节点
        var btnNode = new cc.Node("EnterRoomButton");
        btnNode.setContentSize(cc.size(180, 60));
        btnNode.anchorX = 0.5;
        btnNode.anchorY = 0.5;
        
        // 放在左侧中间位置
        btnNode.x = -screenWidth / 2 + 120;
        btnNode.y = 0;
        btnNode.zIndex = 1000;
        btnNode.parent = this.node;
        
        // 加载按钮图片
        var sprite = btnNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        
        cc.resources.load('UI/btn_enter_room', cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.warn("加载 btn_enter_room 失败，使用备用样式");
                self._createEnterRoomButtonFallback(btnNode);
                return;
            }
            sprite.spriteFrame = spriteFrame;
            console.log("✅ 加入房间按钮图片加载成功");
        });
        
        // 添加按钮组件
        var button = btnNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        // 添加点击事件
        btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            console.log("点击加入房间按钮");
            self._showEnterRoomPopup();
        }, this);
        
        console.log("✅ 加入房间按钮创建完成");
    },
    
    // 备用按钮样式
    _createEnterRoomButtonFallback: function(btnNode) {
        var sprite = btnNode.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = btnNode.addComponent(cc.Sprite);
        }
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        
        // 绘制按钮背景 - 橙色渐变风格
        var graphics = btnNode.addComponent(cc.Graphics);
        graphics.fillColor = cc.color(255, 140, 0);  // 橙色
        graphics.roundRect(-90, -30, 180, 60, 12);
        graphics.fill();
        graphics.strokeColor = cc.color(255, 200, 100);  // 金色边框
        graphics.lineWidth = 3;
        graphics.roundRect(-90, -30, 180, 60, 12);
        graphics.stroke();
        
        // 添加图标和文字
        var iconNode = new cc.Node("Icon");
        var iconLabel = iconNode.addComponent(cc.Label);
        iconLabel.string = "🚪";
        iconLabel.fontSize = 22;
        iconNode.x = -45;
        iconNode.parent = btnNode;
        
        var labelNode = new cc.Node("Label");
        var label = labelNode.addComponent(cc.Label);
        label.string = "输入房号";
        label.fontSize = 22;
        label.lineHeight = 30;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = btnNode;
    },
    
    // ============================================================
    // 显示加入房间弹窗 - 重新设计，更清晰美观
    // ============================================================
    _showEnterRoomPopup: function() {
        var self = this;
        
        console.log("=== 显示加入房间弹窗 ===");
        
        // 移除旧的弹窗
        var oldPopup = this.node.getChildByName("EnterRoomPopup");
        if (oldPopup) oldPopup.destroy();
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 创建弹窗容器
        var popup = new cc.Node("EnterRoomPopup");
        popup.setContentSize(cc.size(screenWidth, screenHeight));
        popup.anchorX = 0.5;
        popup.anchorY = 0.5;
        popup.x = 0;
        popup.y = 0;
        popup.zIndex = 2000;
        popup.parent = this.node;
        
        // 添加 BlockInputEvents 组件阻止底层点击
        popup.addComponent(cc.BlockInputEvents);
        
        // ===== 半透明背景遮罩 =====
        var bgMask = new cc.Node("BgMask");
        bgMask.setContentSize(cc.size(screenWidth, screenHeight));
        var bgGfx = bgMask.addComponent(cc.Graphics);
        bgGfx.fillColor = cc.color(0, 0, 0, 180);
        bgGfx.rect(-screenWidth/2, -screenHeight/2, screenWidth, screenHeight);
        bgGfx.fill();
        bgMask.parent = popup;
        
        // 点击遮罩关闭
        bgMask.on(cc.Node.EventType.TOUCH_END, function() {
            popup.destroy();
        }, this);
        
        // ===== 弹窗面板 - 更大的尺寸 =====
        var panelWidth = 500;
        var panelHeight = 380;
        var panel = new cc.Node("Panel");
        panel.setContentSize(cc.size(panelWidth, panelHeight));
        panel.parent = popup;
        
        // 外层阴影
        var shadow = new cc.Node("Shadow");
        var shadowGfx = shadow.addComponent(cc.Graphics);
        shadowGfx.fillColor = cc.color(0, 0, 0, 60);
        shadowGfx.roundRect(-panelWidth/2 + 8, -panelHeight/2 - 8, panelWidth, panelHeight, 16);
        shadowGfx.fill();
        shadow.parent = panel;
        
        // 主背景 - 深色优雅风格
        var mainBg = new cc.Node("MainBg");
        mainBg.setContentSize(cc.size(panelWidth, panelHeight));
        var mainGfx = mainBg.addComponent(cc.Graphics);
        mainGfx.fillColor = cc.color(30, 28, 45, 255);
        mainGfx.roundRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 16);
        mainGfx.fill();
        mainGfx.strokeColor = cc.color(100, 85, 60);
        mainGfx.lineWidth = 3;
        mainGfx.roundRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 16);
        mainGfx.stroke();
        mainBg.parent = panel;
        
        // ===== 顶部装饰条 =====
        var topBar = new cc.Node("TopBar");
        topBar.setContentSize(cc.size(panelWidth, 8));
        topBar.y = panelHeight/2 - 4;
        var topGfx = topBar.addComponent(cc.Graphics);
        topGfx.fillColor = cc.color(76, 175, 80);  // 绿色主题色
        topGfx.roundRect(-panelWidth/2, -4, panelWidth, 8, [16, 16, 0, 0]);
        topGfx.fill();
        topBar.parent = panel;
        
        // ===== 标题区域 =====
        var titleBg = new cc.Node("TitleBg");
        titleBg.setContentSize(cc.size(panelWidth - 40, 60));
        titleBg.y = panelHeight/2 - 50;
        var titleBgGfx = titleBg.addComponent(cc.Graphics);
        titleBgGfx.fillColor = cc.color(45, 42, 65, 250);
        titleBgGfx.roundRect(-(panelWidth - 40)/2, -30, panelWidth - 40, 60, 10);
        titleBgGfx.fill();
        titleBg.parent = panel;
        
        // 图标
        var iconNode = new cc.Node("Icon");
        var iconLabel = iconNode.addComponent(cc.Label);
        iconLabel.string = "🔑";
        iconLabel.fontSize = 32;
        iconNode.x = -100;
        iconNode.y = panelHeight/2 - 50;
        iconNode.parent = panel;
        
        // 标题文字
        var titleNode = new cc.Node("Title");
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "加入房间";
        titleLabel.fontSize = 28;
        titleLabel.lineHeight = 40;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = cc.color(255, 255, 255);
        titleNode.y = panelHeight/2 - 50;
        titleNode.parent = panel;
        
        // 副标题说明
        var subtitleNode = new cc.Node("Subtitle");
        var subtitleLabel = subtitleNode.addComponent(cc.Label);
        subtitleLabel.string = "输入好友分享的房间号即可加入游戏";
        subtitleLabel.fontSize = 14;
        subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        subtitleNode.color = cc.color(180, 170, 150);
        subtitleNode.y = panelHeight/2 - 95;
        subtitleNode.parent = panel;
        
        // ===== 房间号输入区域 =====
        var inputAreaY = 20;
        
        // 输入框标签
        var inputLabel = new cc.Node("InputLabel");
        var inputLabelComp = inputLabel.addComponent(cc.Label);
        inputLabelComp.string = "房间号";
        inputLabelComp.fontSize = 16;
        inputLabel.color = cc.color(200, 190, 160);
        inputLabel.x = -panelWidth/2 + 70;
        inputLabel.y = inputAreaY + 45;
        inputLabel.parent = panel;
        
        // 输入框背景
        var inputBg = new cc.Node("InputBg");
        inputBg.setContentSize(cc.size(360, 55));
        inputBg.y = inputAreaY;
        var inputGfx = inputBg.addComponent(cc.Graphics);
        inputGfx.fillColor = cc.color(50, 45, 70, 255);
        inputGfx.roundRect(-180, -27.5, 360, 55, 10);
        inputGfx.fill();
        inputGfx.strokeColor = cc.color(76, 175, 80);
        inputGfx.lineWidth = 2;
        inputGfx.roundRect(-180, -27.5, 360, 55, 10);
        inputGfx.stroke();
        inputBg.parent = panel;
        
        // 输入框
        var inputNode = new cc.Node("RoomIdInput");
        inputNode.setContentSize(cc.size(340, 50));
        var editBox = inputNode.addComponent(cc.EditBox);
        editBox.placeholder = "请输入6位数字房间号";
        editBox.fontSize = 24;
        editBox.placeholderFontSize = 18;
        editBox.fontColor = cc.color(255, 255, 255);
        editBox.placeholderFontColor = cc.color(120, 115, 100);
        editBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        editBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        editBox.maxLength = 10;
        editBox.backgroundColor = cc.color(0, 0, 0, 0);
        inputNode.parent = inputBg;
        
        // ===== 提示信息 =====
        var tipBg = new cc.Node("TipBg");
        tipBg.setContentSize(cc.size(360, 35));
        tipBg.y = inputAreaY - 55;
        var tipGfx = tipBg.addComponent(cc.Graphics);
        tipGfx.fillColor = cc.color(40, 35, 55, 200);
        tipGfx.roundRect(-180, -17.5, 360, 35, 8);
        tipGfx.fill();
        tipBg.parent = panel;
        
        var tipIcon = new cc.Node("TipIcon");
        var tipIconLabel = tipIcon.addComponent(cc.Label);
        tipIconLabel.string = "💡";
        tipIconLabel.fontSize = 16;
        tipIcon.x = -150;
        tipIcon.y = inputAreaY - 55;
        tipIcon.parent = panel;
        
        var tipNode = new cc.Node("Tip");
        var tipLabel = tipNode.addComponent(cc.Label);
        tipLabel.string = "房间号由好友创建房间后获取，为6位数字";
        tipLabel.fontSize = 13;
        tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        tipNode.color = cc.color(150, 145, 130);
        tipNode.y = inputAreaY - 55;
        tipNode.parent = panel;
        
        // ===== 按钮区域 =====
        var btnY = -panelHeight/2 + 55;
        
        // 取消按钮
        var cancelBtn = new cc.Node("CancelBtn");
        cancelBtn.setContentSize(cc.size(140, 48));
        cancelBtn.x = -90;
        cancelBtn.y = btnY;
        var cancelGfx = cancelBtn.addComponent(cc.Graphics);
        cancelGfx.fillColor = cc.color(70, 65, 85);
        cancelGfx.roundRect(-70, -24, 140, 48, 10);
        cancelGfx.fill();
        cancelGfx.strokeColor = cc.color(100, 95, 115);
        cancelGfx.lineWidth = 2;
        cancelGfx.roundRect(-70, -24, 140, 48, 10);
        cancelGfx.stroke();
        cancelBtn.parent = panel;
        
        var cancelLabel = new cc.Node("Label");
        var cancelLabelComp = cancelLabel.addComponent(cc.Label);
        cancelLabelComp.string = "取消";
        cancelLabelComp.fontSize = 20;
        cancelLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        cancelLabel.color = cc.color(200, 195, 180);
        cancelLabel.parent = cancelBtn;
        
        var cancelBtnComp = cancelBtn.addComponent(cc.Button);
        cancelBtnComp.transition = cc.Button.Transition.SCALE;
        cancelBtnComp.zoomScale = 0.95;
        
        cancelBtn.on(cc.Node.EventType.TOUCH_END, function() {
            popup.destroy();
        }, this);
        
        // 确认加入按钮 - 绿色主题
        var confirmBtn = new cc.Node("ConfirmBtn");
        confirmBtn.setContentSize(cc.size(160, 48));
        confirmBtn.x = 100;
        confirmBtn.y = btnY;
        var confirmGfx = confirmBtn.addComponent(cc.Graphics);
        confirmGfx.fillColor = cc.color(76, 175, 80);  // 绿色
        confirmGfx.roundRect(-80, -24, 160, 48, 10);
        confirmGfx.fill();
        confirmGfx.strokeColor = cc.color(100, 200, 105);
        confirmGfx.lineWidth = 2;
        confirmGfx.roundRect(-80, -24, 160, 48, 10);
        confirmGfx.stroke();
        confirmBtn.parent = panel;
        
        var confirmIcon = new cc.Node("Icon");
        var confirmIconLabel = confirmIcon.addComponent(cc.Label);
        confirmIconLabel.string = "✓";
        confirmIconLabel.fontSize = 20;
        confirmIcon.x = -50;
        confirmIcon.color = cc.color(255, 255, 255);
        confirmIcon.parent = confirmBtn;
        
        var confirmLabel = new cc.Node("Label");
        var confirmLabelComp = confirmLabel.addComponent(cc.Label);
        confirmLabelComp.string = "加入房间";
        confirmLabelComp.fontSize = 20;
        confirmLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        confirmLabel.color = cc.color(255, 255, 255);
        confirmLabel.parent = confirmBtn;
        
        var confirmBtnComp = confirmBtn.addComponent(cc.Button);
        confirmBtnComp.transition = cc.Button.Transition.SCALE;
        confirmBtnComp.zoomScale = 0.95;
        
        // 确认按钮点击事件
        confirmBtn.on(cc.Node.EventType.TOUCH_END, function() {
            var roomId = editBox.string;
            console.log("确认加入房间, 房间号:", roomId);
            
            if (!roomId || roomId.length === 0) {
                self._showMessage("请输入房间号");
                return;
            }
            
            // 发送加入房间请求
            self._joinRoomById(roomId, popup);
        }, this);
        
        // ===== 关闭按钮（右上角） =====
        var closeBtn = new cc.Node("CloseBtn");
        closeBtn.setContentSize(cc.size(40, 40));
        closeBtn.x = panelWidth/2 - 25;
        closeBtn.y = panelHeight/2 - 25;
        var closeGfx = closeBtn.addComponent(cc.Graphics);
        closeGfx.fillColor = cc.color(60, 55, 75);
        closeGfx.circle(0, 0, 20);
        closeGfx.fill();
        closeBtn.parent = panel;
        
        var closeX = new cc.Node("X");
        var closeLabel = closeX.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 28;
        closeLabel.lineHeight = 36;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeX.color = cc.color(180, 170, 160);
        closeX.parent = closeBtn;
        
        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            popup.destroy();
        }, this);
        
        console.log("✅ 加入房间弹窗创建完成");
    },
    
    // ============================================================
    // 通过房间号加入房间
    // ============================================================
    _joinRoomById: function(roomId, popup) {
        var self = this;
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.socket) {
            this._showMessage("网络未连接，请稍后重试");
            return;
        }
        
        console.log("发送加入房间请求, 房间号:", roomId);
        this._showMessage("正在加入房间...");
        
        // 发送加入房间请求
        myglobal.socket.request_joinRoom({
            roomId: roomId
        }, function(err, result) {
            if (err !== 0) {
                self._showMessage("加入房间失败: " + (result || "房间不存在"));
                return;
            }
            
            console.log("✅ 加入房间成功:", result);
            self._showMessage("加入成功！");
            
            // 关闭弹窗
            if (popup) popup.destroy();
            
            // 跳转到游戏场景
            if (result && result.roomId) {
                myglobal.currentRoomId = result.roomId;
            }
            
            // 延迟跳转
            self.scheduleOnce(function() {
                cc.director.loadScene("gameScene");
            }, 0.5);
        });
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
