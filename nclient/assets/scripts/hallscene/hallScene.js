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
        var self = this;
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
            
            // 设置更大的字体 - 增大字体使其更清晰可见
            this.gobal_count.fontSize = 64;
            this.gobal_count.lineHeight = 72;
            
            // 设置位置 - 上移到图片框中
            var labelNode = this.gobal_count.node;
            if (labelNode) {
                // 禁用 Widget 组件，避免其覆盖位置设置
                var widget = labelNode.getComponent(cc.Widget);
                if (widget) {
                    widget.enabled = false;
                    console.log("✅ 已禁用金币Label的Widget组件");
                }
                
                // 设置位置 - 上移
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
        // 获取两个角色节点
        var xiongmao1 = this.node.getChildByName("xiongmao1"); // 左侧角色
        var xiongmao2 = this.node.getChildByName("xiongmao2"); // 右侧角色
        
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

        // 如果没有头像URL，使用默认头像
        if (!avatarUrl) {
            this._loadDefaultAvatar();
            return;
        }

        // 检查是否是网络URL
        if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
            // 从网络加载头像
            cc.assetManager.loadRemote(avatarUrl, { ext: '.png' }, function(err, texture) {
                if (err) {
                    console.warn("加载网络头像失败，使用默认头像:", err);
                    self._loadDefaultAvatar();
                    return;
                }
                
                // 验证 texture 是否有效
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
            // 本地资源路径
            var localPath = 'UI/headimage/' + avatarUrl;
            cc.resources.load(localPath, cc.SpriteFrame, function(err, spriteFrame) {
                if (err) {
                    console.warn("加载本地头像失败，使用默认头像:", err);
                    self._loadDefaultAvatar();
                    return;
                }
                
                // 验证 spriteFrame 是否有效
                if (!spriteFrame) {
                    console.warn("本地头像 spriteFrame 为空");
                    self._loadDefaultAvatar();
                    return;
                }
                
                // 使用多种方式验证 spriteFrame 有效性
                var isValid = false;
                try {
                    if (spriteFrame instanceof cc.SpriteFrame) {
                        isValid = true;
                    } else if (typeof spriteFrame.textureLoaded === 'function' || 
                               typeof spriteFrame.getTexture === 'function') {
                        isValid = true;
                    }
                } catch (e) {}
                
                if (!isValid) {
                    console.warn("本地头像 spriteFrame 无效");
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
            
            // 验证 spriteFrame 是否有效
            if (!spriteFrame) {
                console.error("默认头像 spriteFrame 为空");
                return;
            }
            
            var isValid = false;
            try {
                if (spriteFrame instanceof cc.SpriteFrame) {
                    isValid = true;
                } else if (typeof spriteFrame.textureLoaded === 'function' || 
                           typeof spriteFrame.getTexture === 'function') {
                    isValid = true;
                }
            } catch (e) {}
            
            if (!isValid) {
                console.error("默认头像 spriteFrame 无效");
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
            // 先停止所有音频（包括登录界面的背景音乐）
            cc.audioEngine.stopMusic();
            cc.audioEngine.stopAllEffects();
            console.log("✅ 已停止之前的背景音乐");
            
            // 加载并播放登录背景音乐（大厅继续使用登录音乐）
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
        console.log("window.defines:", window.defines ? "存在" : "不存在");
        console.log("window.HttpAPI:", window.HttpAPI ? "存在" : "不存在");
        console.log("apiUrl:", apiUrl);
        console.log("cryptoKey:", cryptoKey ? "已配置" : "未配置");
        
        if (!apiUrl) {
            console.warn("API URL 未配置，使用默认房间配置");
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        if (!window.HttpAPI) {
            console.warn("HttpAPI 未加载，使用默认房间配置");
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        // 强制清除所有缓存，确保每次都从服务器获取最新配置
        console.log("开始清除房间配置缓存...");
        HttpAPI._roomConfigCache = null;
        try {
            localStorage.removeItem('room_config_cache');
            console.log("✅ localStorage 缓存已清除");
        } catch (e) {
            console.log("清除 localStorage 失败:", e);
        }
        
        // 构建完整的 API URL
        var fullUrl = apiUrl + '/api/v1/room/config/list';
        console.log("🚀 准备请求房间配置 API:", fullUrl);
        
        // 直接使用 HttpAPI.get 发送请求，不使用缓存
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
                id: 2,
                room_name: "中级房",
                room_type: 2,
                base_score: 2,
                multiplier: 1,
                min_gold: 50000,
                max_gold: 200000,
                entry_gold: 50000,
                description: "底分2,适合有一定经验的玩家",
                status: 1,
                sort_order: 1
            },
            {
                id: 3,
                room_name: "高级房",
                room_type: 3,
                base_score: 5,
                multiplier: 2,
                min_gold: 200000,
                max_gold: 1000000,
                entry_gold: 200000,
                description: "底分5,倍数2,高手对决",
                status: 1,
                sort_order: 2
            },
            {
                id: 4,
                room_name: "大师房",
                room_type: 4,
                base_score: 10,
                multiplier: 3,
                min_gold: 1000000,
                max_gold: 5000000,
                entry_gold: 1000000,
                description: "底分10,倍数3,大师专属",
                status: 1,
                sort_order: 3
            },
            {
                id: 5,
                room_name: "至尊房",
                room_type: 5,
                base_score: 20,
                multiplier: 5,
                min_gold: 5000000,
                max_gold: 0,
                entry_gold: 5000000,
                description: "底分20,倍数5,至尊玩家专属",
                status: 1,
                sort_order: 4
            }
        ];
    },
    
    // 隐藏不需要的按钮
    _hideUnwantedButtons: function() {
        var createRoomBtn = this.node.getChildByName("btn_create_room");
        var joinRoomBtn = this.node.getChildByName("btn_join_room");
        
        if (createRoomBtn) {
            createRoomBtn.active = false;
        }
        if (joinRoomBtn) {
            joinRoomBtn.active = false;
        }
    },
    
    // 根据房间类型获取背景图资源路径
    // 规则: room_type 对应 btn_happy_{room_type}.png
    _getRoomBgImagePath: function(roomType) {
        return 'UI/btn_happy_' + roomType;
    },
    
    // 初始化房间选择按钮 - 按分类分组布局
    // 核心规则：左侧竞技场(60%)，右侧普通场(40%)，先分组再布局
    _initRoomButtons: function(roomConfigs) {
        var self = this;
        
        console.log("========== 开始初始化房间按钮（分类布局）==========");
        
        // 按钮名称映射到 room_type
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
            if (btnNode) {
                btnNode.active = false;
            }
        }
        
        // ========== 步骤1：数据分组 ==========
        var arenaRooms = [];   // 竞技场 (room_category = 2)
        var normalRooms = [];  // 普通场 (room_category = 1)
        
        for (var i = 0; i < roomConfigs.length; i++) {
            var config = roomConfigs[i];
            var roomType = config.room_type || config.roomType;
            var roomCategory = config.room_category || config.roomCategory || 1;
            var sortOrder = config.sort_order || config.sortOrder || config.sort || 0;
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
            
            // 构建房间数据对象
            var roomData = {
                node: btnNode,
                config: config,
                roomType: roomType,
                roomCategory: roomCategory,
                sortOrder: sortOrder,
                roomName: config.room_name || config.roomName || "未知房间",
                minGold: config.entry_gold || config.min_gold || config.minGold || 0
            };
            
            // 按分类分组
            if (roomCategory === 2) {
                arenaRooms.push(roomData);
            } else {
                normalRooms.push(roomData);
            }
        }
        
        // ========== 步骤2：各自排序 ==========
        arenaRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        normalRooms.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        
        console.log("📊 分组结果: 竞技场 " + arenaRooms.length + " 个, 普通场 " + normalRooms.length + " 个");
        
        // ========== 步骤3：配置房间卡片 ==========
        var allRooms = arenaRooms.concat(normalRooms);
        for (var i = 0; i < allRooms.length; i++) {
            var room = allRooms[i];
            room.node.active = true;
            room.node.roomConfig = room.config;
            
            // 加载背景图
            self._loadRoomButtonBg(room.node, room.roomType);
            
            // 更新最低豆子显示
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
                node.off(cc.Node.EventType.MOUSE_UP);
                
                node.on(cc.Node.EventType.TOUCH_END, function(event) {
                    console.log("🎯 点击房间: " + roomName);
                    event.stopPropagation();
                    self._onRoomButtonClick(config);
                });
                
                node.on(cc.Node.EventType.MOUSE_UP, function(event) {
                    console.log("🎯 鼠标点击房间: " + roomName);
                    event.stopPropagation();
                    self._onRoomButtonClick(config);
                });
            })(room.config, room.node, room.roomName);
        }
        
        // ========== 步骤4：布局渲染 ==========
        this._layoutRoomsByCategory(arenaRooms, normalRooms);
    },
    
    // 按分类布局房间按钮 - 使用 GridLayout 自动排版
    // 核心规则：固定2列网格，自动换行，不使用百分比宽度
    _layoutRoomsByCategory: function(arenaRooms, normalRooms) {
        var self = this;
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        var screenHeight = canvas ? canvas.designResolution.height : 720;
        
        console.log("📐 画布尺寸: " + screenWidth + " x " + screenHeight);
        
        // ========== 布局参数（核心：不使用百分比宽度）==========
        var itemWidth = 220;    // 卡片宽度
        var itemHeight = 160;   // 卡片高度
        var gapX = 20;          // 水平间距
        var gapY = 20;          // 垂直间距
        var padding = 20;       // 四周留白
        
        // 容器宽度 = 2个卡片 + 1个间距 + 左右padding
        // 固定2列，宽度固定，不使用百分比
        var panelWidth = itemWidth * 2 + gapX + padding * 2;
        var panelHeight = 450;  // 容器高度
        
        // 容器之间的间距
        var containerGap = 60;
        
        console.log("📦 容器宽度计算: 2*" + itemWidth + " + " + gapX + " + 2*" + padding + " = " + panelWidth);
        
        // ========== 清理旧的容器节点 ==========
        var oldLeftPanel = this.node.getChildByName("LeftPanel");
        var oldRightPanel = this.node.getChildByName("RightPanel");
        if (oldLeftPanel) oldLeftPanel.destroy();
        if (oldRightPanel) oldRightPanel.destroy();
        
        // 计算容器位置（居中排列）
        // 两个容器并排放置，整体居中
        var totalWidth = panelWidth * 2 + containerGap;
        var startX = -totalWidth / 2 + panelWidth / 2;  // 左容器起始位置
        
        // ========== 创建左侧容器（竞技场）==========
        var leftPanelX = startX;  // 左容器位置
        var leftPanel = this._createGridContainer(
            "LeftPanel",
            leftPanelX,
            -50,  // 稍微下移
            panelWidth,
            panelHeight,
            itemWidth,
            itemHeight,
            gapX,
            gapY,
            padding
        );
        leftPanel.parent = this.node;
        
        // 添加竞技场标题
        this._addPanelTitle(leftPanel, "竞技场", -panelWidth/2 + padding, panelHeight/2 - 10);
        
        // 将竞技场房间添加到左侧容器
        for (var i = 0; i < arenaRooms.length; i++) {
            var room = arenaRooms[i];
            // 准备节点：移除Widget，设置尺寸和锚点
            self._prepareItemForGrid(room.node, itemWidth, itemHeight);
            // 添加到容器，GridLayout 自动排列
            room.node.parent = leftPanel;
            console.log("🎮 竞技场房间[" + i + "]: " + room.roomName + ", sortOrder=" + room.sortOrder);
        }
        
        console.log("✅ 竞技场容器: " + arenaRooms.length + " 个房间, 固定2列网格自动排列");
        
        // ========== 创建右侧容器（普通场）==========
        var rightPanelX = startX + panelWidth + containerGap;  // 右容器位置
        var rightPanel = this._createGridContainer(
            "RightPanel",
            rightPanelX,
            -50,  // 稍微下移
            panelWidth,
            panelHeight,
            itemWidth,
            itemHeight,
            gapX,
            gapY,
            padding
        );
        rightPanel.parent = this.node;
        
        // 添加普通场标题
        this._addPanelTitle(rightPanel, "普通场", -panelWidth/2 + padding, panelHeight/2 - 10);
        
        // 将普通场房间添加到右侧容器
        for (var i = 0; i < normalRooms.length; i++) {
            var room = normalRooms[i];
            // 准备节点：移除Widget，设置尺寸和锚点
            self._prepareItemForGrid(room.node, itemWidth, itemHeight);
            // 添加到容器，GridLayout 自动排列
            room.node.parent = rightPanel;
            console.log("🎰 普通场房间[" + i + "]: " + room.roomName + ", sortOrder=" + room.sortOrder);
        }
        
        console.log("✅ 普通场容器: " + normalRooms.length + " 个房间, 固定2列网格自动排列");
        console.log("✅ 房间布局完成: 竞技场左侧, 普通场右侧, 固定2列网格, 宽度=" + panelWidth);
    },
    
    // 添加区域标题
    _addPanelTitle: function(panel, titleText, x, y) {
        var titleNode = new cc.Node("PanelTitle");
        titleNode.setPosition(x, y);
        titleNode.anchorX = 0;
        titleNode.anchorY = 0.5;
        
        var label = titleNode.addComponent(cc.Label);
        label.string = titleText;
        label.fontSize = 28;
        label.lineHeight = 36;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        // 金黄色
        titleNode.color = cc.color(255, 200, 50);
        
        // 添加描边
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0, 200);
        outline.width = 2;
        
        titleNode.parent = panel;
        console.log("✅ 添加区域标题: " + titleText);
    },
    
    // 创建网格容器（核心方法）
    // 固定2列，自动换行
    _createGridContainer: function(name, x, y, width, height, itemW, itemH, gapX, gapY, padding) {
        // 创建容器节点
        var container = new cc.Node(name);
        container.setContentSize(width, height);
        container.setPosition(x, y);
        container.anchorX = 0.5;
        container.anchorY = 0.5;
        
        // 添加半透明背景（调试用，可看到容器范围）
        var bgSprite = container.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        // 半透明深色背景
        container.color = cc.color(30, 30, 50, 120);
        
        // 添加 Layout 组件 - GRID 类型
        var layout = container.addComponent(cc.Layout);
        
        // ===== 核心配置：固定2列网格布局 =====
        // 这是用户明确要求的配置方式
        layout.type = cc.Layout.Type.GRID;                    // 网格布局
        layout.resizeMode = cc.Layout.ResizeMode.NONE;        // 不自动调整大小
        layout.cellSize = cc.size(itemW, itemH);              // 单元格尺寸
        layout.startAxis = cc.Layout.AxisDirection.HORIZONTAL; // 从左往右排列
        layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
        layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM; // 从上往下
        layout.constraint = cc.Layout.Constraint.FIXED_COLUMN; // 固定列数（核心！）
        layout.constraintNum = 2;                              // 固定2列（核心！）
        
        // 间距和边距
        layout.spacingX = gapX;    // 水平间距
        layout.spacingY = gapY;    // 垂直间距
        layout.paddingTop = padding + 30;  // 顶部多留空间给标题
        layout.paddingBottom = padding;
        layout.paddingLeft = padding;
        layout.paddingRight = padding;
        
        console.log("📦 创建网格容器: " + name + 
                   ", 位置(" + x + "," + y + ")" +
                   ", 尺寸: " + width + "x" + height + 
                   ", 单元格: " + itemW + "x" + itemH +
                   ", 固定2列, 间距: " + gapX + "x" + gapY +
                   ", constraint=FIXED_COLUMN, constraintNum=2");
        
        return container;
    },
    
    // 准备节点用于网格布局
    _prepareItemForGrid: function(node, width, height) {
        // 移除 Widget 组件（会干扰 Layout）
        var widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
            console.log("  已禁用 Widget 组件: " + node.name);
        }
        
        // 设置内容大小
        node.setContentSize(width, height);
        
        // 设置锚点为左上角（适配 GridLayout）
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        
        // 重置位置（Layout 会自动排列）
        node.setPosition(0, 0);
        node.scale = 1;
    },
    
    // 根据房间类型加载按钮背景图
    // 背景图命名规则: btn_happy_{room_type}.png
    // 例如: room_type=2 -> btn_happy_2.png
    _loadRoomButtonBg: function(btnNode, roomType) {
        var self = this;
        
        // 获取背景图资源路径
        var bgImagePath = this._getRoomBgImagePath(roomType);
        
        console.log("加载房间按钮背景图: " + bgImagePath + " (房间类型: " + roomType + ")");
        
        // 获取 Sprite 组件
        var sprite = btnNode.getComponent(cc.Sprite);
        if (!sprite) {
            console.warn("房间按钮节点没有 Sprite 组件:", btnNode.name);
            return;
        }
        
        // 加载 SpriteFrame
        cc.resources.load(bgImagePath, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.warn("加载房间背景图失败: " + bgImagePath, err);
                // 尝试加载默认背景图
                self._loadDefaultRoomButtonBg(btnNode);
                return;
            }
            
            // 验证 spriteFrame 是否有效
            if (!spriteFrame) {
                console.warn("加载的 spriteFrame 为空: " + bgImagePath);
                self._loadDefaultRoomButtonBg(btnNode);
                return;
            }
            
            // 检查是否是有效的 SpriteFrame - 使用多种方式验证
            var isValidSpriteFrame = false;
            try {
                // 方法1: instanceof 检查
                if (spriteFrame instanceof cc.SpriteFrame) {
                    isValidSpriteFrame = true;
                }
                // 方法2: 检查是否有必要的方法
                else if (typeof spriteFrame.textureLoaded === 'function' || 
                         typeof spriteFrame.getTexture === 'function') {
                    isValidSpriteFrame = true;
                }
            } catch (e) {
                console.warn("检查 spriteFrame 类型失败:", e);
            }
            
            if (!isValidSpriteFrame) {
                console.warn("加载的资源不是有效的 SpriteFrame: " + bgImagePath, spriteFrame);
                self._loadDefaultRoomButtonBg(btnNode);
                return;
            }
            
            try {
                sprite.spriteFrame = spriteFrame;
                console.log("✅ 房间按钮背景图加载成功: btn_happy_" + roomType + ".png");
            } catch (e) {
                console.error("设置 spriteFrame 失败:", e);
                self._loadDefaultRoomButtonBg(btnNode);
            }
        });
    },
    
    // 加载默认房间按钮背景图
    _loadDefaultRoomButtonBg: function(btnNode) {
        var sprite = btnNode.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        
        // 尝试加载一个默认背景
        cc.resources.load('UI/btn_happy_2', cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.warn("加载默认背景图也失败:", err);
                return;
            }
            
            // 验证 spriteFrame 是否有效
            if (!spriteFrame) {
                console.warn("默认背景图资源为空");
                return;
            }
            
            var isValidSpriteFrame = false;
            try {
                if (spriteFrame instanceof cc.SpriteFrame) {
                    isValidSpriteFrame = true;
                } else if (typeof spriteFrame.textureLoaded === 'function' || 
                           typeof spriteFrame.getTexture === 'function') {
                    isValidSpriteFrame = true;
                }
            } catch (e) {}
            
            if (!isValidSpriteFrame) {
                console.warn("默认背景图资源不是有效的 SpriteFrame");
                return;
            }
            
            try {
                sprite.spriteFrame = spriteFrame;
                console.log("使用默认背景图: btn_happy_2.png");
            } catch (e) {
                console.error("设置默认 spriteFrame 失败:", e);
            }
        });
    },
    
    // 添加或更新最低豆子显示Label
    _updateMinGoldLabel: function(btnNode, config) {
        // 查找或创建豆子显示节点
        var goldLabelNode = btnNode.getChildByName("min_gold_label");
        
        if (!goldLabelNode) {
            // 创建新的Label节点
            goldLabelNode = new cc.Node("min_gold_label");
            
            // 添加Label组件
            var label = goldLabelNode.addComponent(cc.Label);
            label.fontSize = 22;
            label.lineHeight = 26;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
            
            // 设置锚点为中心
            goldLabelNode.anchorX = 0.5;
            goldLabelNode.anchorY = 0.5;
            
            // 添加Outline组件增加可读性
            var outline = goldLabelNode.addComponent(cc.LabelOutline);
            outline.color = cc.color(0, 0, 0, 180);
            outline.width = 2;
            
            // 设置父节点
            goldLabelNode.parent = btnNode;
        }
        
        // 获取Label组件
        var label = goldLabelNode.getComponent(cc.Label);
        
        // 设置豆子数量文本
        var minGold = config.entry_gold || config.min_gold || 0;
        var goldText = this._formatGold(minGold);
        label.string = "最低 " + goldText + " 豆";
        
        // 设置颜色（金黄色）
        goldLabelNode.color = cc.color(255, 215, 0);
        
        // 设置位置（在按钮底部）
        // 按钮高度375，Label放在底部位置
        goldLabelNode.setPosition(0, -140);
        
        console.log("✅ 房间按钮最低豆子Label已更新: " + config.room_name + " - 最低 " + goldText + " 豆");
    },
    
    // 房间按钮点击处理 - 使用房间配置
    _onRoomButtonClick: function(roomConfig) {
        console.log("进入房间处理: " + roomConfig.room_name, roomConfig);
        
        var self = this;
        var myglobal = window.myglobal;
        
        // 检查玩家金币是否足够
        var playerGold = myglobal && myglobal.playerData ? myglobal.playerData.gobal_count : 0;
        if (playerGold < roomConfig.entry_gold) {
            this._showMessage("豆子不足，需要 " + this._formatGold(roomConfig.entry_gold) + " 豆子才能进入" + roomConfig.room_name);
            return;
        }
        
        // 检查金币是否超过上限
        if (roomConfig.max_gold > 0 && playerGold > roomConfig.max_gold) {
            this._showMessage("您的豆子超过上限，请前往更高级的房间");
            return;
        }
        
        // 显示提示
        this._showMessage("正在进入" + roomConfig.room_name + "...");
        
        // 保存房间信息
        if (myglobal) {
            myglobal.currentRoomConfig = roomConfig;
            myglobal.currentRoomLevel = roomConfig.room_type;
            myglobal.currentRoomName = roomConfig.room_name;
        }
        
        // 检查 socket 连接
        if (window.socketCtr) {
            var socket = window.socketCtr();
            
            if (socket.request_enter_room) {
                // 通过 socket 进入房间
                socket.request_enter_room({
                    room_level: roomConfig.room_type
                }, function(result, data) {
                    if (result === 0) {
                        console.log("进入房间成功:", data);
                        if (myglobal) {
                            myglobal.roomData = data;
                        }
                        self._enterGameScene(data);
                    } else {
                        console.error("进入房间失败:", result);
                        self._showMessage("进入房间失败，请重试");
                    }
                });
                return;
            }
        }
        
        // 无 socket 连接时使用测试模式
        console.log("使用测试模式进入房间");
        
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
        
        if (myglobal) {
            myglobal.roomData = mockData;
        }
        
        // 延迟跳转
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
        
        // 查找或创建提示节点
        var tipNode = this.node.getChildByName("room_tip");
        if (tipNode) {
            tipNode.destroy();
        }
        
        tipNode = new cc.Node("room_tip");
        tipNode.y = 250;
        
        // 添加标签
        var label = tipNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        tipNode.color = cc.color(255, 255, 0);
        
        // 最后设置父节点（避免在设置属性时触发渲染更新）
        tipNode.parent = this.node;
        
        // 2秒后消失
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
            if (noticeNode) {
                noticeNode.active = false;
            }
        }
        
        this._hideNodesWithText(this.node, "游戏公告");
        this._hideNodesWithText(this.node, "娱乐休闲");
        this._hideNodesWithText(this.node, "自觉远离");
        this._hideNodesWithText(this.node, "赌博");
    },
    
    // 调整金币相关元素位置
    _adjustGoldElementsPosition: function() {
        // 查找 player_node 节点
        var playerNode = this.node.getChildByName("player_node");
        if (!playerNode) {
            console.warn("未找到 player_node 节点");
            return;
        }
        
        // 调整 yuanbaoIcon 位置 - 上移更多
        var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
        if (yuanbaoIcon) {
            yuanbaoIcon.y = 80;
            console.log("✅ 元宝图标位置已调整: y=80");
        }
        
        // 调整 gold_frame 位置 - 上移更多
        var goldFrame = playerNode.getChildByName("gold_frame");
        if (goldFrame) {
            goldFrame.y = 80;
            console.log("✅ 金币框位置已调整: y=80");
        }
    },
    
    // 递归查找并隐藏包含特定文字的节点
    _hideNodesWithText: function(parentNode, searchText) {
        if (!parentNode) return;
        
        var children = parentNode.children;
        if (!children || children.length === 0) return;
        
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child || !child.isValid) continue;
            
            var label = child.getComponent(cc.Label);
            if (label && label.string) {
                if (label.string.indexOf(searchText) >= 0) {
                    var targetNode = child.parent ? child.parent : child;
                    targetNode.active = false;
                    continue;
                }
            }
            
            // 递归检查子节点
            if (child.children && child.children.length > 0) {
                this._hideNodesWithText(child, searchText);
            }
        }
    },

    start () {
        this._hideUnwantedButtons();
        this._removeNoticeBoard();
    },

    onButtonClick(event, customData) {
        switch(customData) {
            case "create_room":
                if (this.creatroom_prefabs) {
                    var creator_Room = cc.instantiate(this.creatroom_prefabs);
                    creator_Room.parent = this.node;
                }
                break;
            case "join_room":
                if (this.joinroom_prefabs) {
                    var join_Room = cc.instantiate(this.joinroom_prefabs);
                    join_Room.parent = this.node;
                }
                break;
            case "user_agreement":
                if (this.user_agreement_prefabs) {
                    var userAgreement_popup = cc.instantiate(this.user_agreement_prefabs);
                    userAgreement_popup.parent = this.node;
                }
                break;
        }
    },
    
    // 销毁时清理
    onDestroy () {
        // 清理资源
        console.log("hallScene onDestroy");
    }
});
