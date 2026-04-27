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
                
                var labelNode = this.gobal_count.node;
                if (labelNode) {
                    var widget = labelNode.getComponent(cc.Widget);
                    if (widget) widget.enabled = false;
                    labelNode.y = 80;
                }
            }
            
            this._adjustGoldElementsPosition();
            this._loadUserAvatar(playerData.avatarUrl);
            this.roomConfigs = [];
            this._playHallBackgroundMusic();
            this._hideUnwantedButtons();
            this._hideBackgroundCharacters();
            this._fetchRoomConfigs();
            this._removeNoticeBoard();
            
            console.log("=== _initUIAfterAuth 完成 ===");
        } catch (e) {
            console.error("_initUIAfterAuth 异常:", e);
        }
    },
    
    _hideBackgroundCharacters: function() {
        var xiongmao1 = this.node.getChildByName("xiongmao1");
        var xiongmao2 = this.node.getChildByName("xiongmao2");
        if (xiongmao1) xiongmao1.active = false;
        if (xiongmao2) xiongmao2.active = false;
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
        // 【一、数据处理】按 room_category 分组并排序
        // ============================================================
        
        var leftRooms = [];   // 竞技场 (room_category === 2)
        var rightRooms = [];  // 普通场 (room_category === 1)
        
        for (var i = 0; i < rooms.length; i++) {
            var config = rooms[i];
            var roomCategory = config.room_category || config.roomCategory || 1;
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
                roomCategory: roomCategory,
                sortOrder: sortOrder,
                roomName: config.room_name || config.roomName || "未知房间",
                minGold: config.min_gold || config.minGold || 0,
                maxGold: config.max_gold || config.maxGold || 0
            };
            
            if (roomCategory === 2) {
                leftRooms.push(roomData);
            } else {
                rightRooms.push(roomData);
            }
        }
        
        // 按 sort_order 升序排序
        leftRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        rightRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        
        console.log("竞技场: " + leftRooms.length + " 个");
        console.log("普通场: " + rightRooms.length + " 个");
        
        // 配置所有卡片
        var allRooms = leftRooms.concat(rightRooms);
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
        
        // 渲染布局
        this._renderRoomLayout(leftRooms, rightRooms);
    },
    
    // ============================================================
    // 布局渲染：响应式布局，适配不同屏幕尺寸
    // ============================================================
    _renderRoomLayout: function(leftRooms, rightRooms) {
        var self = this;
        
        // 清理旧容器
        var oldLeftPanel = this.node.getChildByName("LeftArea");
        var oldRightPanel = this.node.getChildByName("RightArea");
        if (oldLeftPanel) oldLeftPanel.destroy();
        if (oldRightPanel) oldRightPanel.destroy();
        
        // ============================================================
        // 获取画布尺寸（实际可见区域）
        // ============================================================
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        
        // 获取实际可见区域（考虑设备屏幕比例）
        var visibleSize = cc.view.getVisibleSize();
        var visibleWidth = visibleSize.width;
        var visibleHeight = visibleSize.height;
        
        console.log("===== 响应式布局 =====");
        console.log("设计分辨率: " + screenWidth + "x" + screenHeight);
        console.log("可见区域: " + visibleWidth.toFixed(0) + "x" + visibleHeight.toFixed(0));
        
        // ============================================================
        // 响应式参数：根据屏幕宽度调整
        // ============================================================
        var isSmallScreen = visibleWidth < 800;  // 小屏幕判断
        
        var spacingX = 10;       // 水平间距
        var spacingY = 10;       // 垂直间距
        var topMargin = 15;      // 顶部边距
        
        // 根据屏幕大小调整容器宽度
        var panelWidth;
        var cardScale = 1;
        
        if (isSmallScreen) {
            // 小屏幕：单列布局，卡片居中
            panelWidth = visibleWidth * 0.9;  // 容器宽度为屏幕90%
            cardScale = 0.8;  // 卡片稍微缩小
        } else {
            // 大屏幕：双列布局
            panelWidth = 600;  // 固定宽度
        }
        
        // 计算容器高度
        var maxRows = Math.ceil(Math.max(leftRooms.length, rightRooms.length) / 2);
        var panelHeight = maxRows * 180 * cardScale + (maxRows - 1) * spacingY + 50;
        panelHeight = Math.max(panelHeight, visibleHeight * 0.6);
        
        console.log("屏幕类型: " + (isSmallScreen ? "小屏幕(单列)" : "大屏幕(双列)"));
        console.log("容器宽度: " + panelWidth.toFixed(0));
        console.log("卡片缩放: " + cardScale);
        
        // ============================================================
        // 容器位置计算
        // ============================================================
        var panelY = screenHeight / 2 - topMargin;  // 距离顶部15px
        
        var leftPanelX, rightPanelX;
        if (isSmallScreen) {
            // 小屏幕：两个区域上下排列，居中显示
            leftPanelX = 0;
            rightPanelX = 0;
        } else {
            // 大屏幕：两个区域左右并排
            var containerGap = 50;
            leftPanelX = -panelWidth / 2 - containerGap / 2;
            rightPanelX = panelWidth / 2 + containerGap / 2;
        }
        
        // ============================================================
        // 创建左侧容器（竞技场）
        // ============================================================
        var leftPanel = this._createPanelWithLayout("LeftArea", panelWidth, panelHeight, spacingX, spacingY, isSmallScreen);
        leftPanel.setPosition(leftPanelX, panelY);
        leftPanel.anchorY = 1;
        leftPanel.parent = this.node;
        
        // 添加卡片到左侧容器
        this._addCardsToPanel(leftPanel, leftRooms, cardScale);
        
        // ============================================================
        // 创建右侧容器（普通场）
        // ============================================================
        var rightPanelY = isSmallScreen ? panelY - panelHeight - 20 : panelY;  // 小屏幕时向下偏移
        var rightPanel = this._createPanelWithLayout("RightArea", panelWidth, panelHeight, spacingX, spacingY, isSmallScreen);
        rightPanel.setPosition(rightPanelX, rightPanelY);
        rightPanel.anchorY = 1;
        rightPanel.parent = this.node;
        
        // 添加卡片到右侧容器
        this._addCardsToPanel(rightPanel, rightRooms, cardScale);
        
        console.log("========================================");
        console.log("✅ 响应式布局完成");
        console.log("========================================");
    },
    
    // ============================================================
    // 创建带 Layout 组件的容器
    // ============================================================
    _createPanelWithLayout: function(name, width, height, spacingX, spacingY, isSmallScreen) {
        var panel = new cc.Node(name);
        panel.setContentSize(width, height);
        panel.anchorX = 0.5;
        panel.anchorY = 1;
        
        // 添加 Layout 组件
        var layout = panel.addComponent(cc.Layout);
        
        // Layout 参数
        layout.type = cc.Layout.Type.GRID;
        layout.startAxis = cc.Layout.AxisDirection.HORIZONTAL;
        layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
        layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
        
        // 间距设置
        layout.spacingX = spacingX;
        layout.spacingY = spacingY;
        
        // 小屏幕时单列，大屏幕时双列
        // 注意：CC 2.4 没有直接的列数设置，但可以通过容器宽度控制
        // 小屏幕时容器宽度只能容纳一个卡片，自然变成单列
        
        // Resize Mode: CONTAINER
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        
        // padding 设为 0
        layout.paddingLeft = 0;
        layout.paddingRight = 0;
        layout.paddingTop = 0;
        layout.paddingBottom = 0;
        
        console.log("Layout 创建: " + name + ", width=" + width.toFixed(0) + ", isSmallScreen=" + isSmallScreen);
        
        return panel;
    },
    
    // 添加卡片到容器
    _addCardsToPanel: function(panel, rooms, cardScale) {
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            
            // 准备卡片节点
            this._prepareCardNodeResponsive(room.node, cardScale);
            
            // 添加到容器
            room.node.parent = panel;
        }
        
        console.log("添加完成: " + rooms.length + " 个卡片, scale=" + cardScale);
    },
    
    // ============================================================
    // _renderCardsInGrid 方法已移除
    // 现在使用 Layout 组件自动排列，不需要手动 setPosition
    // ============================================================

    
    // 准备卡片节点（确保尺寸正确，不被拉伸）
    _prepareCardNode: function(node, width, height) {
        // 禁用 Widget 组件（防止自动拉伸）
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
        }
        
        // 固定尺寸
        node.setContentSize(width, height);
        
        // 锚点设为中心
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        
        // 保持原比例，不缩放
        node.scale = 1;
    },
    
    // 准备卡片节点（保持原始尺寸，不拉伸）
    _prepareCardNodeNoResize: function(node) {
        // 禁用 Widget 组件（防止自动拉伸）
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
        }
        
        // 保持原始尺寸，不强制设置
        // node.setContentSize() 不调用，让卡片保持原始尺寸
        
        // 锚点设为中心
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        
        // 保持原比例，不缩放
        node.scale = 1;
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
    
    // 房间按钮点击处理
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
        
        this._showMessage("正在进入" + roomConfig.room_name + "...");
        
        if (myglobal) {
            myglobal.currentRoomConfig = roomConfig;
            myglobal.currentRoomLevel = roomConfig.room_type;
            myglobal.currentRoomName = roomConfig.room_name;
        }
        
        if (window.socketCtr) {
            var socket = window.socketCtr();
            if (socket.request_enter_room) {
                socket.request_enter_room({ room_level: roomConfig.room_type }, function(result, data) {
                    if (result === 0) {
                        if (myglobal) myglobal.roomData = data;
                        self._enterGameScene(data);
                    } else {
                        self._showMessage("进入房间失败");
                    }
                });
                return;
            }
        }
        
        var mockData = {
            roomid: "ROOM_" + roomConfig.room_type,
            room_config: roomConfig,
            seatindex: 1,
            playerdata: [{
                accountid: "player_1",
                nick_name: myglobal ? myglobal.playerData.nickName : "测试玩家",
                avatarUrl: "avatar_1",
                goldcount: playerGold,
                seatindex: 1
            }]
        };
        
        if (myglobal) myglobal.roomData = mockData;
        
        this.scheduleOnce(function() {
            self._enterGameScene(mockData);
        }, 0.5);
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
    
    _removeNoticeBoard: function() {
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3"];
        for (var i = 0; i < noticeNames.length; i++) {
            var node = this.node.getChildByName(noticeNames[i]);
            if (node) node.active = false;
        }
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
    },
    
    _adjustGoldElementsPosition: function() {
        var playerNode = this.node.getChildByName("player_node");
        if (!playerNode) return;
        
        var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
        var goldFrame = playerNode.getChildByName("gold_frame");
        if (yuanbaoIcon) yuanbaoIcon.y = 80;
        if (goldFrame) goldFrame.y = 80;
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

    start () {}
});
