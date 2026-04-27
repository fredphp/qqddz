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
        myglobal.verifyToken(function(valid, message) {
            if (!valid) {
                cc.director.loadScene("loginScene");
                return;
            }
            self._initUIAfterAuth();
        });
    },
    
    _initUIAfterAuth: function() {
        var myglobal = window.myglobal;
        var playerData = myglobal.playerData;
        
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
        
        if (!apiUrl || !window.HttpAPI) {
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        HttpAPI._roomConfigCache = null;
        try { localStorage.removeItem('room_config_cache'); } catch (e) {}
        
        HttpAPI.get(
            apiUrl + '/api/v1/room/config/list',
            cryptoKey,
            function(err, result) {
                if (err) {
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
    // 布局渲染：两个独立容器，手动计算2列网格位置
    // ============================================================
    _renderRoomLayout: function(leftRooms, rightRooms) {
        var self = this;
        
        // 清理旧容器
        var oldLeftPanel = this.node.getChildByName("LeftArea");
        var oldRightPanel = this.node.getChildByName("RightArea");
        if (oldLeftPanel) oldLeftPanel.destroy();
        if (oldRightPanel) oldRightPanel.destroy();
        
        // ============================================================
        // 布局参数
        // ============================================================
        var cardWidth = 200;     // 卡片宽度
        var cardHeight = 240;    // 卡片高度
        var gapX = 30;           // 水平间距
        var gapY = 30;           // 垂直间距
        var padding = 20;        // 边距
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        
        // 计算容器宽度（刚好容纳2个卡片）
        var panelWidth = cardWidth * 2 + gapX + padding * 2;
        var panelHeight = screenHeight * 0.6;
        
        // 容器位置：左边靠左，右边靠右
        var leftPanelX = -screenWidth / 2 + panelWidth / 2 + 50;
        var rightPanelX = screenWidth / 2 - panelWidth / 2 - 50;
        var panelY = -50;
        
        console.log("画布: " + screenWidth + "x" + screenHeight);
        console.log("容器宽度: " + panelWidth + ", 左X: " + leftPanelX + ", 右X: " + rightPanelX);
        
        // ============================================================
        // 创建左侧容器（竞技场）
        // ============================================================
        var leftPanel = new cc.Node("LeftArea");
        leftPanel.setContentSize(panelWidth, panelHeight);
        leftPanel.setPosition(leftPanelX, panelY);
        leftPanel.anchorX = 0.5;
        leftPanel.anchorY = 0.5;
        leftPanel.parent = this.node;
        
        // 添加标题
        this._addAreaTitle(leftPanel, "竞技场", -panelWidth/2 + padding, panelHeight/2 - 20);
        
        // 渲染竞技场卡片（手动计算位置，固定2列）
        this._renderCardsInGrid(leftPanel, leftRooms, cardWidth, cardHeight, gapX, gapY, padding);
        
        // ============================================================
        // 创建右侧容器（普通场）
        // ============================================================
        var rightPanel = new cc.Node("RightArea");
        rightPanel.setContentSize(panelWidth, panelHeight);
        rightPanel.setPosition(rightPanelX, panelY);
        rightPanel.anchorX = 0.5;
        rightPanel.anchorY = 0.5;
        rightPanel.parent = this.node;
        
        // 添加标题
        this._addAreaTitle(rightPanel, "普通场", -panelWidth/2 + padding, panelHeight/2 - 20);
        
        // 渲染普通场卡片（手动计算位置，固定2列）
        this._renderCardsInGrid(rightPanel, rightRooms, cardWidth, cardHeight, gapX, gapY, padding);
        
        console.log("========================================");
        console.log("✅ 布局完成：两列网格，每行2个卡片");
        console.log("========================================");
    },
    
    // ============================================================
    // 手动计算位置渲染卡片（固定2列网格）
    // ============================================================
    _renderCardsInGrid: function(panel, rooms, cardWidth, cardHeight, gapX, gapY, padding) {
        // 起始位置（从容器的左上角开始）
        var startX = -panel.width / 2 + padding + cardWidth / 2;
        var startY = panel.height / 2 - padding - cardHeight / 2 - 40; // 减去标题高度
        
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            
            // 计算行列索引
            var col = i % 2;  // 0 或 1（第1列或第2列）
            var row = Math.floor(i / 2);  // 行号
            
            // 计算位置
            var x = startX + col * (cardWidth + gapX);
            var y = startY - row * (cardHeight + gapY);
            
            // 准备卡片节点
            this._prepareCardNode(room.node, cardWidth, cardHeight);
            
            // 设置父节点
            room.node.parent = panel;
            
            // 设置位置（手动定位）
            room.node.setPosition(x, y);
            
            console.log("  [" + i + "] " + room.roomName + " -> (" + col + "," + row + ") pos(" + x.toFixed(0) + "," + y.toFixed(0) + ")");
        }
    },
    
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
            label.fontSize = 24;
            label.lineHeight = 30;
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
