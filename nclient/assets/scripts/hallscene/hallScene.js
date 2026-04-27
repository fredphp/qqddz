// 使用全局变量，不使用 require

// 脚本加载日志 - 确认脚本被正确加载
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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("=== hallScene onLoad ===");
        
        // 等待 myglobal 初始化
        if (!window.myglobal) {
            console.warn("myglobal 未定义，等待初始化...");
            this._waitForMyglobal();
            return;
        }
        
        this._initWithPlayerData();
    },
    
    // 等待 myglobal 初始化
    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;
        
        var check = function() {
            attempts++;
            console.log("等待 myglobal 初始化... (" + attempts + ")");
            
            if (window.myglobal && window.myglobal.playerData) {
                console.log("✅ myglobal 已就绪");
                self._initWithPlayerData();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 100);
            } else {
                console.error("myglobal 初始化超时，返回登录页");
                cc.director.loadScene("loginScene");
            }
        };
        
        setTimeout(check, 100);
    },
    
    // 使用玩家数据初始化UI
    _initWithPlayerData: function() {
        var myglobal = window.myglobal;
        
        console.log("=== _initWithPlayerData ===");
        console.log("myglobal:", !!myglobal);
        console.log("playerData:", !!myglobal.playerData);
        
        if (!myglobal || !myglobal.playerData) {
            console.error("myglobal 或 playerData 未定义");
            cc.director.loadScene("loginScene");
            return;
        }
        
        var playerData = myglobal.playerData;
        console.log("玩家数据:");
        console.log("  - nickName:", playerData.nickName);
        console.log("  - gobal_count:", playerData.gobal_count);
        console.log("  - avatarUrl:", playerData.avatarUrl);
        console.log("  - uniqueID:", playerData.uniqueID);
        console.log("  - token:", playerData.token ? "有" : "无");
        
        // 检查是否已登录
        if (!playerData.token) {
            console.warn("无登录凭证，返回登录页");
            cc.director.loadScene("loginScene");
            return;
        }
        
        // 验证 token 是否有效
        console.log("🔐 开始验证 Token...");
        var self = this;
        myglobal.verifyToken(function(valid, message) {
            console.log("🔐 Token 验证结果: valid=" + valid + ", message=" + message);
            
            if (!valid) {
                console.warn("Token 无效，返回登录页");
                cc.director.loadScene("loginScene");
                return;
            }
            
            // Token 有效，初始化 UI
            self._initUIAfterAuth();
        });
    },
    
    // Token 验证成功后初始化 UI
    _initUIAfterAuth: function() {
        var myglobal = window.myglobal;
        var playerData = myglobal.playerData;
        
        console.log("=== _initUIAfterAuth ===");
        
        // 设置昵称
        if (this.nickname_label) {
            var nickName = playerData.nickName || "游客";
            this.nickname_label.string = nickName;
            console.log("✅ 昵称已设置:", nickName);
        } else {
            console.warn("nickname_label 组件未绑定");
        }
        
        // 设置金币/元宝数量
        if (this.gobal_count) {
            var goldCount = playerData.gobal_count || 0;
            this.gobal_count.string = ":" + goldCount;
            
            // 设置更大的字体
            this.gobal_count.fontSize = 64;
            this.gobal_count.lineHeight = 72;
            
            // 设置位置
            var labelNode = this.gobal_count.node;
            if (labelNode) {
                var widget = labelNode.getComponent(cc.Widget);
                if (widget) {
                    widget.enabled = false;
                    console.log("✅ 已禁用金币Label的Widget组件");
                }
                labelNode.y = 80;
                console.log("✅ 金币Label位置已调整: y=80, fontSize=64");
            }
            
            console.log("✅ 元宝已设置:", goldCount);
        } else {
            console.warn("gobal_count 组件未绑定");
        }
        
        // 调整金币图标和框的位置
        this._adjustGoldElementsPosition();

        // 加载用户头像
        this._loadUserAvatar(playerData.avatarUrl);

        // 房间配置数据
        this.roomConfigs = [];
        
        // 播放大厅背景音乐
        this._playHallBackgroundMusic();
        
        // 隐藏不需要的按钮
        this._hideUnwantedButtons();
        
        // 隐藏背景角色图片（男孩和女孩）
        this._hideBackgroundCharacters();
        
        // 从 API 获取房间配置
        this._fetchRoomConfigs();
        
        // 移除公告栏
        this._removeNoticeBoard();
    },
    
    // 隐藏背景角色图片（男孩和女孩）
    _hideBackgroundCharacters: function() {
        var xiongmao1 = this.node.getChildByName("xiongmao1");
        var xiongmao2 = this.node.getChildByName("xiongmao2");
        
        if (xiongmao1) {
            xiongmao1.active = false;
            console.log("✅ 已隐藏左侧背景角色(xiongmao1)");
        }
        
        if (xiongmao2) {
            xiongmao2.active = false;
            console.log("✅ 已隐藏右侧背景角色(xiongmao2)");
        }
    },
    
    // 加载用户头像
    _loadUserAvatar: function(avatarUrl) {
        var self = this;

        if (!this.headimage) {
            console.warn("headimage 组件未设置");
            return;
        }

        if (!avatarUrl) {
            this._loadDefaultAvatar();
            return;
        }

        if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
            cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, function(err, texture) {
                if (err) {
                    console.warn("加载网络头像失败，使用默认头像:", err);
                    self._loadDefaultAvatar();
                    return;
                }
                
                if (!texture) {
                    console.warn("网络头像 texture 为空");
                    self._loadDefaultAvatar();
                    return;
                }
                
                try {
                    var spriteFrame = new cc.SpriteFrame(texture);
                    if (spriteFrame) {
                        self.headimage.spriteFrame = spriteFrame;
                        console.log("网络头像加载成功");
                    }
                } catch (e) {
                    console.error("创建头像 SpriteFrame 失败:", e);
                    self._loadDefaultAvatar();
                }
            });
        } else {
            var localPath = 'UI/headimage/' + avatarUrl;
            cc.resources.load(localPath, cc.SpriteFrame, function(err, spriteFrame) {
                if (err) {
                    console.warn("加载本地头像失败，使用默认头像:", err);
                    self._loadDefaultAvatar();
                    return;
                }
                
                if (!spriteFrame) {
                    console.warn("本地头像 spriteFrame 为空");
                    self._loadDefaultAvatar();
                    return;
                }
                
                try {
                    self.headimage.spriteFrame = spriteFrame;
                    console.log("本地头像加载成功:", avatarUrl);
                } catch (e) {
                    console.error("设置头像 spriteFrame 失败:", e);
                    self._loadDefaultAvatar();
                }
            });
        }
    },

    // 加载默认头像
    _loadDefaultAvatar: function() {
        var self = this;
        cc.resources.load('UI/headimage/avatar_1', cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载默认头像失败:", err);
                return;
            }
            
            if (!spriteFrame) {
                console.error("默认头像 spriteFrame 为空");
                return;
            }
            
            try {
                self.headimage.spriteFrame = spriteFrame;
                console.log("默认头像加载成功");
            } catch (e) {
                console.error("设置默认头像 spriteFrame 失败:", e);
            }
        });
    },

    // 播放大厅背景音乐
    _playHallBackgroundMusic: function() {
        var isopen_sound = window.isopen_sound || 1;
        if (!isopen_sound) {
            console.log("音效已关闭，不播放背景音乐");
            return;
        }
        
        try {
            cc.audioEngine.stopMusic();
            cc.audioEngine.stopAllEffects();
            console.log("✅ 已停止之前的背景音乐");
            
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    try {
                        cc.audioEngine.playMusic(clip, true);
                        console.log("✅ 大厅背景音乐开始播放");
                    } catch(e) {
                        console.log("播放背景音乐失败:", e);
                    }
                } else {
                    console.log("加载背景音乐失败:", err);
                }
            });
        } catch(e) {
            console.log("播放背景音乐异常:", e);
        }
    },
    
    // 从 API 获取房间配置
    _fetchRoomConfigs: function() {
        var self = this;
        var apiUrl = window.defines ? window.defines.apiUrl : '';
        var cryptoKey = window.defines ? window.defines.cryptoKey : '';
        
        console.log("========== _fetchRoomConfigs 开始 ==========");
        
        if (!apiUrl || !window.HttpAPI) {
            console.warn("API URL 或 HttpAPI 未配置，使用默认房间配置");
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        // 清除缓存
        HttpAPI._roomConfigCache = null;
        try {
            localStorage.removeItem('room_config_cache');
        } catch (e) {}
        
        var fullUrl = apiUrl + '/api/v1/room/config/list';
        console.log("🚀 请求房间配置 API:", fullUrl);
        
        HttpAPI.get(
            fullUrl,
            cryptoKey,
            function(err, result) {
                if (err) {
                    console.warn("❌ 获取房间配置失败:", err);
                    self._initRoomButtons(self._getDefaultRoomConfigs());
                    return;
                }
                
                console.log("✅ 房间配置 API 响应:", result);
                
                var configs = null;
                if (result && result.code === 0 && result.data) {
                    configs = result.data;
                } else if (result && Array.isArray(result)) {
                    configs = result;
                }
                
                if (configs && configs.length > 0) {
                    console.log("✅ 获取到 " + configs.length + " 个房间配置");
                    self.roomConfigs = configs;
                    self._initRoomButtons(configs);
                } else {
                    console.warn("⚠️ 房间配置为空，使用默认配置");
                    self._initRoomButtons(self._getDefaultRoomConfigs());
                }
            }
        );
    },
    
    // 获取默认房间配置
    _getDefaultRoomConfigs: function() {
        return [
            {
                id: 1,
                room_name: "初级房",
                room_type: 2,
                base_score: 1,
                multiplier: 1,
                min_gold: 0,
                max_gold: 50000,
                description: "底分1,适合新手玩家",
                status: 1,
                sort_order: 0,
                room_category: 1
            },
            {
                id: 2,
                room_name: "中级房",
                room_type: 3,
                base_score: 2,
                multiplier: 1,
                min_gold: 50000,
                max_gold: 200000,
                description: "底分2,适合有一定经验的玩家",
                status: 1,
                sort_order: 1,
                room_category: 1
            },
            {
                id: 3,
                room_name: "高级房",
                room_type: 4,
                base_score: 5,
                multiplier: 2,
                min_gold: 200000,
                max_gold: 1000000,
                description: "底分5,倍数2,高手对决",
                status: 1,
                sort_order: 2,
                room_category: 2
            },
            {
                id: 4,
                room_name: "大师房",
                room_type: 5,
                base_score: 10,
                multiplier: 3,
                min_gold: 1000000,
                max_gold: 5000000,
                description: "底分10,倍数3,大师专属",
                status: 1,
                sort_order: 3,
                room_category: 2
            }
        ];
    },
    
    // 隐藏不需要的按钮
    _hideUnwantedButtons: function() {
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        
        if (createRoomBtn) createRoomBtn.active = false;
        if (joinRoomBtn) joinRoomBtn.active = false;
    },
    
    // ============================================================
    // 核心方法：初始化房间按钮（严格按照规则实现）
    // ============================================================
    _initRoomButtons: function(rooms) {
        var self = this;
        
        console.log("========================================");
        console.log("开始初始化房间按钮（严格按照规则）");
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
        // 【一、数据处理】
        // ============================================================
        
        // 1. 按 room_category 分组
        var leftRooms = [];   // 竞技场 (room_category === 2)
        var rightRooms = [];  // 普通场 (room_category === 1)
        
        console.log("--- 步骤1：数据分组 ---");
        
        for (var i = 0; i < rooms.length; i++) {
            var config = rooms[i];
            var roomCategory = config.room_category || config.roomCategory || 1;
            var sortOrder = config.sort_order || config.sortOrder || config.sort || 0;
            var roomType = config.room_type || config.roomType;
            var buttonName = buttonNameMap[roomType];
            
            if (!buttonName) {
                console.warn("未知的房间类型:", roomType);
                continue;
            }
            
            var btnNode = this.node.getChildByName(buttonName);
            if (!btnNode) {
                console.warn("未找到房间按钮节点:", buttonName);
                continue;
            }
            
            var roomData = {
                node: btnNode,
                config: config,
                roomType: roomType,
                roomCategory: roomCategory,
                sortOrder: sortOrder,
                roomName: config.room_name || config.roomName || "未知房间",
                // 使用 min_gold 字段作为入场最低豆子要求
                minGold: config.min_gold || config.minGold || 0,
                maxGold: config.max_gold || config.maxGold || 0
            };
            
            // 按 room_category 分组
            if (roomCategory === 2) {
                leftRooms.push(roomData);
                console.log("  竞技场: " + roomData.roomName + " (sort_order=" + sortOrder + ", min_gold=" + roomData.minGold + ")");
            } else {
                rightRooms.push(roomData);
                console.log("  普通场: " + roomData.roomName + " (sort_order=" + sortOrder + ", min_gold=" + roomData.minGold + ")");
            }
        }
        
        // 2. 各自按 sort_order 升序排序
        console.log("--- 步骤2：各自排序（按 sort_order 升序）---");
        
        leftRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        rightRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        
        console.log("竞技场排序后: " + leftRooms.map(function(r) { return r.roomName; }).join(", "));
        console.log("普通场排序后: " + rightRooms.map(function(r) { return r.roomName; }).join(", "));
        
        // ============================================================
        // 【三、配置房间卡片】
        // ============================================================
        
        console.log("--- 步骤3：配置房间卡片 ---");
        
        var allRooms = leftRooms.concat(rightRooms);
        for (var i = 0; i < allRooms.length; i++) {
            var room = allRooms[i];
            room.node.active = true;
            room.node.roomConfig = room.config;
            
            // 加载背景图
            self._loadRoomButtonBg(room.node, room.roomType);
            
            // 更新最低豆子显示 - 使用 min_gold 字段
            self._updateMinGoldLabel(room.node, room.config);
            
            // 配置按钮组件
            var button = room.node.getComponent(cc.Button);
            if (button) {
                button.transition = cc.Button.Transition.SCALE;
                button.duration = 0.1;
                button.zoomScale = 1.1;
            }
            
            // 注册点击事件
            (function(config, node, roomName) {
                node.off(cc.Node.EventType.TOUCH_END);
                node.on(cc.Node.EventType.TOUCH_END, function(event) {
                    console.log("🎯 点击房间: " + roomName);
                    event.stopPropagation();
                    self._onRoomButtonClick(config);
                });
            })(room.config, room.node, room.roomName);
        }
        
        // ============================================================
        // 【四、布局渲染】分开渲染到两个独立容器
        // ============================================================
        
        this._renderRoomLayout(leftRooms, rightRooms);
    },
    
    // ============================================================
    // 布局渲染方法（两个独立容器，各自 Grid 布局）
    // ============================================================
    _renderRoomLayout: function(leftRooms, rightRooms) {
        var self = this;
        
        console.log("--- 步骤4：布局渲染 ---");
        
        // 清理旧容器
        var oldLeftPanel = this.node.getChildByName("LeftPanel");
        var oldRightPanel = this.node.getChildByName("RightPanel");
        if (oldLeftPanel) oldLeftPanel.destroy();
        if (oldRightPanel) oldRightPanel.destroy();
        
        // 布局参数
        var cardWidth = 220;    // 卡片宽度
        var cardHeight = 160;   // 卡片高度
        var gapX = 20;          // 水平间距
        var gapY = 20;          // 垂直间距
        var padding = 20;       // 边距
        
        // 容器尺寸（固定2列）
        // 通过容器宽度限制：宽度刚好容纳2个卡片+间距+边距
        var panelWidth = cardWidth * 2 + gapX + padding * 2;
        var panelHeight = 400;
        var containerGap = 80;  // 两个容器之间的间距
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 容器位置计算（左右并排，整体居中）
        var totalWidth = panelWidth * 2 + containerGap;
        var leftPanelX = -totalWidth / 2 + panelWidth / 2;
        var rightPanelX = totalWidth / 2 - panelWidth / 2;
        
        console.log("容器宽度: " + panelWidth + ", 左容器X: " + leftPanelX + ", 右容器X: " + rightPanelX);
        
        // ============================================================
        // 创建左侧容器（竞技场）- 独立 Grid 布局
        // ============================================================
        var leftPanel = this._createGridPanel("LeftPanel", leftPanelX, -50, panelWidth, panelHeight, cardWidth, cardHeight, gapX, gapY, padding);
        leftPanel.parent = this.node;
        
        // 添加标题
        this._addAreaTitle(leftPanel, "竞技场", -panelWidth/2 + padding, panelHeight/2 - 5);
        
        // 渲染竞技场房间
        console.log("--- 渲染竞技场（左侧）---");
        for (var i = 0; i < leftRooms.length; i++) {
            var room = leftRooms[i];
            self._prepareCardNode(room.node, cardWidth, cardHeight);
            room.node.parent = leftPanel;
            console.log("  [" + i + "] " + room.roomName);
        }
        
        // ============================================================
        // 创建右侧容器（普通场）- 独立 Grid 布局
        // ============================================================
        var rightPanel = this._createGridPanel("RightPanel", rightPanelX, -50, panelWidth, panelHeight, cardWidth, cardHeight, gapX, gapY, padding);
        rightPanel.parent = this.node;
        
        // 添加标题
        this._addAreaTitle(rightPanel, "普通场", -panelWidth/2 + padding, panelHeight/2 - 5);
        
        // 渲染普通场房间
        console.log("--- 渲染普通场（右侧）---");
        for (var i = 0; i < rightRooms.length; i++) {
            var room = rightRooms[i];
            self._prepareCardNode(room.node, cardWidth, cardHeight);
            room.node.parent = rightPanel;
            console.log("  [" + i + "] " + room.roomName);
        }
        
        console.log("========================================");
        console.log("✅ 布局完成：两个独立容器，各自固定2列Grid");
        console.log("========================================");
    },
    
    // ============================================================
    // 创建 Grid 面板容器
    // 注意：此版本 Cocos Creator 没有 constraint 属性
    // 通过设置容器宽度来限制每行2个卡片
    // ============================================================
    _createGridPanel: function(name, x, y, width, height, cardW, cardH, gapX, gapY, padding) {
        // 创建容器节点
        var panel = new cc.Node(name);
        panel.setContentSize(width, height);
        panel.setPosition(x, y);
        panel.anchorX = 0.5;
        panel.anchorY = 0.5;
        
        // 添加背景（调试用）
        var bgSprite = panel.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = cc.color(20, 20, 40, 100);
        panel.opacity = 200;
        
        // 添加 Layout 组件
        var layout = panel.addComponent(cc.Layout);
        
        // ===== Grid 布局配置 =====
        // 注意：此版本没有 constraint 属性，通过容器宽度限制每行数量
        layout.type = cc.Layout.Type.GRID;
        layout.resizeMode = cc.Layout.ResizeMode.NONE;
        layout.cellSize = cc.size(cardW, cardH);
        layout.startAxis = cc.Layout.AxisDirection.HORIZONTAL;
        layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
        layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
        
        // 间距和边距
        layout.spacingX = gapX;
        layout.spacingY = gapY;
        layout.paddingTop = padding + 35;  // 顶部留标题空间
        layout.paddingBottom = padding;
        layout.paddingLeft = padding;
        layout.paddingRight = padding;
        
        // 容器宽度刚好容纳2个卡片，从而实现每行固定2个
        console.log("📦 创建Grid容器: " + name + ", 宽度=" + width + " (刚好容纳2个卡片)");
        
        return panel;
    },
    
    // 添加区域标题
    _addAreaTitle: function(panel, title, x, y) {
        var titleNode = new cc.Node("AreaTitle");
        titleNode.setPosition(x, y);
        titleNode.anchorX = 0;
        titleNode.anchorY = 0.5;
        
        var label = titleNode.addComponent(cc.Label);
        label.string = title;
        label.fontSize = 26;
        label.lineHeight = 32;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        titleNode.color = cc.color(255, 215, 0);
        
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0, 200);
        outline.width = 2;
        
        titleNode.parent = panel;
    },
    
    // 准备卡片节点
    _prepareCardNode: function(node, width, height) {
        // 禁用 Widget 组件
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
        }
        
        // 设置尺寸
        node.setContentSize(width, height);
        
        // 设置锚点
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        
        // 重置位置（Layout 会自动排列）
        node.setPosition(0, 0);
        node.scale = 1;
    },
    
    // 根据房间类型获取背景图资源路径
    _getRoomBgImagePath: function(roomType) {
        return 'UI/btn_happy_' + roomType;
    },
    
    // 加载房间按钮背景图
    _loadRoomButtonBg: function(btnNode, roomType) {
        var self = this;
        var bgImagePath = this._getRoomBgImagePath(roomType);
        var sprite = btnNode.getComponent(cc.Sprite);
        
        if (!sprite) return;
        
        cc.resources.load(bgImagePath, cc.SpriteFrame, function(err, spriteFrame) {
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
    
    // 加载默认房间按钮背景图
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
    
    // 更新最低豆子显示Label
    // 使用 min_gold 字段，不是 entry_gold
    _updateMinGoldLabel: function(btnNode, config) {
        var goldLabelNode = btnNode.getChildByName("min_gold_label");
        
        if (!goldLabelNode) {
            goldLabelNode = new cc.Node("min_gold_label");
            var label = goldLabelNode.addComponent(cc.Label);
            label.fontSize = 22;
            label.lineHeight = 26;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            goldLabelNode.anchorX = 0.5;
            goldLabelNode.anchorY = 0.5;
            
            var outline = goldLabelNode.addComponent(cc.LabelOutline);
            outline.color = cc.color(0, 0, 0, 180);
            outline.width = 2;
            
            goldLabelNode.parent = btnNode;
        }
        
        var label = goldLabelNode.getComponent(cc.Label);
        // 使用 min_gold 字段作为最低豆子要求
        var minGold = config.min_gold || config.minGold || 0;
        var goldText = this._formatGold(minGold);
        label.string = "最低 " + goldText + " 豆";
        goldLabelNode.color = cc.color(255, 215, 0);
        goldLabelNode.setPosition(0, -140);
    },
    
    // 房间按钮点击处理
    // 字段使用说明：
    // - min_gold: 进入房间的最低豆子要求（玩家豆子 >= min_gold 才能进入）
    // - max_gold: 进入房间的最高豆子限制（玩家豆子 <= max_gold 才能进入，0表示无上限）
    _onRoomButtonClick: function(roomConfig) {
        console.log("进入房间处理: " + roomConfig.room_name, roomConfig);
        
        var self = this;
        var myglobal = window.myglobal;
        var playerGold = myglobal && myglobal.playerData ? myglobal.playerData.gobal_count : 0;
        
        // 获取 min_gold 和 max_gold 字段
        var minGold = roomConfig.min_gold || roomConfig.minGold || 0;
        var maxGold = roomConfig.max_gold || roomConfig.maxGold || 0;
        
        console.log("玩家豆子: " + playerGold + ", 最低要求: " + minGold + ", 最高限制: " + maxGold);
        
        // 检查玩家豆子是否达到最低要求
        if (playerGold < minGold) {
            this._showMessage("豆子不足，需要 " + this._formatGold(minGold) + " 豆子才能进入" + roomConfig.room_name);
            return;
        }
        
        // 检查玩家豆子是否超过上限（maxGold > 0 表示有上限）
        if (maxGold > 0 && playerGold > maxGold) {
            this._showMessage("您的豆子超过上限(" + this._formatGold(maxGold) + ")，请前往更高级的房间");
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
                socket.request_enter_room({
                    room_level: roomConfig.room_type
                }, function(result, data) {
                    if (result === 0) {
                        if (myglobal) myglobal.roomData = data;
                        self._enterGameScene(data);
                    } else {
                        self._showMessage("进入房间失败，请重试");
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
    
    // 格式化金币显示
    _formatGold: function(gold) {
        if (gold >= 10000) {
            return (gold / 10000).toFixed(1) + "万";
        }
        return gold.toString();
    },
    
    // 进入游戏场景
    _enterGameScene: function(roomData) {
        console.log("跳转到游戏场景, 房间数据:", roomData);
        cc.director.loadScene("gameScene", function(err) {
            if (err) {
                console.error("加载游戏场景失败:", err);
                return;
            }
            console.log("成功进入游戏场景");
        });
    },
    
    // 显示消息提示
    _showMessage: function(message) {
        console.log("提示: " + message);
        
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
            if (tipNode && tipNode.isValid) {
                tipNode.destroy();
            }
        }, 2);
    },
    
    // 移除公告栏
    _removeNoticeBoard: function() {
        var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3"];
        
        for (var i = 0; i < noticeNames.length; i++) {
            var noticeNode = this.node.getChildByName(noticeNames[i]);
            if (noticeNode) noticeNode.active = false;
        }
        
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        this._hideNodesWithText(this.node, "自觉远离");
        this._hideNodesWithText(this.node, "赌博");
    },
    
    // 调整金币相关元素位置
    _adjustGoldElementsPosition: function() {
        var playerNode = this.node.getChildByName("player_node");
        if (!playerNode) return;
        
        var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
        if (yuanbaoIcon) yuanbaoIcon.y = 80;
        
        var goldFrame = playerNode.getChildByName("gold_frame");
        if (goldFrame) goldFrame.y = 80;
    },
    
    // 递归查找并隐藏包含特定文字的节点
    _hideNodesWithText: function(parentNode, searchText) {
        if (!parentNode) return;
        
        var children = parentNode.children;
        if (!children || children.length === 0) return;
        
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var label = child.getComponent(cc.Label);
            if (label && label.string && label.string.indexOf(searchText) >= 0) {
                child.active = false;
            }
            this._hideNodesWithText(child, searchText);
        }
    },

    start () {

    },

    // update (dt) {},
});
