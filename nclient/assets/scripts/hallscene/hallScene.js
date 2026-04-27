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
            
            // 设置更大的字体
            this.gobal_count.fontSize = 48;
            this.gobal_count.lineHeight = 56;
            
            // 设置位置 - 上移到图片框中
            var labelNode = this.gobal_count.node;
            if (labelNode) {
                labelNode.y = 50;  // 上移位置
                console.log("✅ 金币Label位置已调整: y=50");
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
        
        // 对齐背景角色图片
        this._alignBackgroundCharacters();
        
        // 从 API 获取房间配置
        this._fetchRoomConfigs();
        
        // 移除公告栏
        this._removeNoticeBoard();
    },
    
    // 对齐背景角色图片（男孩和女孩）
    _alignBackgroundCharacters: function() {
        // 获取两个角色节点
        var xiongmao1 = this.node.getChildByName("xiongmao1"); // 左侧角色
        var xiongmao2 = this.node.getChildByName("xiongmao2"); // 右侧角色
        
        if (xiongmao1 && xiongmao2) {
            // 获取画布宽度
            var canvas = this.node.getComponent(cc.Canvas) || 
                         cc.find('Canvas').getComponent(cc.Canvas);
            var screenWidth = canvas ? canvas.designResolution.width : 1280;
            
            // 统一 Y 坐标（居中对齐）
            var commonY = 90;
            
            // 计算 X 坐标（对称分布）
            // 角色图片宽度约 390，两边留一定边距
            var xOffset = screenWidth / 2 - 250; // 距离中心的偏移量
            
            // 左侧角色
            xiongmao1.setPosition(-xOffset, commonY);
            
            // 右侧角色
            xiongmao2.setPosition(xOffset, commonY);
            
            console.log("✅ 背景角色对齐完成: 左侧(" + (-xOffset) + ", " + commonY + "), 右侧(" + xOffset + ", " + commonY + ")");
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
    
    // 初始化房间选择按钮 - 根据配置动态显示并居中排列
    // 背景图匹配规则: room_type -> btn_happy_{room_type}.png
    _initRoomButtons: function(roomConfigs) {
        var self = this;
        
        // 默认按钮名称映射到 room_type
        // 场景中的按钮: btn_room_junior, btn_room_middle, btn_room_senior, btn_room_master, btn_room_supreme
        // 注意: btn_room_supreme 需要在 Cocos Creator 场景中手动添加
        var buttonNameMap = {
            2: "btn_room_junior",   // 初级房/新手场 (room_type=2)
            3: "btn_room_middle",   // 中级房 (room_type=3)
            4: "btn_room_senior",   // 高级房 (room_type=4)
            5: "btn_room_master",   // 大师房 (room_type=5)
            6: "btn_room_supreme"   // 至尊场 (room_type=6) - 需要在场景中添加此按钮
        };
        
        // 先隐藏所有房间按钮
        for (var key in buttonNameMap) {
            var btnNode = this.node.getChildByName(buttonNameMap[key]);
            if (btnNode) {
                btnNode.active = false;
            }
        }
        
        // 收集需要显示的按钮节点
        var activeButtons = [];
        
        // 根据 API 返回的配置显示对应的房间按钮
        for (var i = 0; i < roomConfigs.length; i++) {
            var config = roomConfigs[i];
            var roomType = config.room_type;
            var buttonName = buttonNameMap[roomType];
            
            if (!buttonName) {
                console.warn("未知的房间类型:", roomType, "支持的类型: 1, 2, 3, 4, 5");
                continue;
            }
            
            var btnNode = this.node.getChildByName(buttonName);
            if (btnNode) {
                // 显示该按钮
                btnNode.active = true;
                
                console.log("初始化房间按钮: " + buttonName + 
                           ", 房间名: " + config.room_name + 
                           ", 房间类型: " + roomType +
                           ", 入场豆子: " + config.entry_gold +
                           ", 背景图: btn_happy_" + roomType + ".png");
                
                // 保存配置到节点
                btnNode.roomConfig = config;
                
                // 根据房间类型加载背景图
                self._loadRoomButtonBg(btnNode, roomType);
                
                // 添加或更新最低豆子显示
                self._updateMinGoldLabel(btnNode, config);
                
                // 获取 Button 组件
                var button = btnNode.getComponent(cc.Button);
                if (button) {
                    // 配置 Button 组件
                    button.transition = cc.Button.Transition.SCALE;
                    button.duration = 0.1;
                    button.zoomScale = 1.15;
                }
                
                // 注册点击事件处理函数 - 使用闭包保存配置
                (function(config, node) {
                    // 移除旧的事件监听
                    node.off(cc.Node.EventType.TOUCH_END);
                    node.off(cc.Node.EventType.MOUSE_UP);
                    
                    // 添加新的事件监听
                    node.on(cc.Node.EventType.TOUCH_END, function(event) {
                        console.log("===== 点击了房间: " + config.room_name + " =====");
                        event.stopPropagation();
                        self._onRoomButtonClick(config);
                    });
                    
                    // 也监听鼠标点击事件（Web端）
                    node.on(cc.Node.EventType.MOUSE_UP, function(event) {
                        console.log("===== 鼠标点击了房间: " + config.room_name + " =====");
                        event.stopPropagation();
                        self._onRoomButtonClick(config);
                    });
                })(config, btnNode);
                
                // 添加到活跃按钮列表
                activeButtons.push(btnNode);
            } else {
                console.warn("未找到房间按钮节点: " + buttonName);
            }
        }
        
        // 根据按钮数量自动居中排列
        this._centerRoomButtons(activeButtons);
    },
    
    // 居中排列房间按钮 - 根据数量自动调整宽度占比
    _centerRoomButtons: function(buttons) {
        if (!buttons || buttons.length === 0) {
            return;
        }
        
        var buttonCount = buttons.length;
        console.log("居中排列 " + buttonCount + " 个房间按钮");
        
        // 获取屏幕/画布宽度
        var canvas = this.node.getComponent(cc.Canvas) || 
                     cc.find('Canvas').getComponent(cc.Canvas);
        var screenWidth = canvas ? canvas.designResolution.width : 1280;
        
        // 原始按钮尺寸
        var originalButtonWidth = 268;
        var originalButtonHeight = 140;
        
        // 计算每个按钮应该占据的宽度比例
        // 4个按钮 = 25%, 3个 = 33.33%, 2个 = 50%, 1个 = 100%
        var buttonWidthPercent = 1 / buttonCount;
        
        // 按钮之间的间距（相对屏幕宽度的比例）
        var gapPercent = 0.02; // 2% 间距
        var totalGapPercent = gapPercent * (buttonCount - 1);
        
        // 每个按钮实际占据的宽度（包含间距）
        var buttonSlotWidth = screenWidth * buttonWidthPercent;
        
        // 实际按钮宽度（减去间距）
        var actualButtonWidth = buttonSlotWidth - screenWidth * gapPercent;
        
        // 限制按钮最大和最小宽度
        var maxButtonWidth = 280;
        var minButtonWidth = 180;
        actualButtonWidth = Math.min(maxButtonWidth, Math.max(minButtonWidth, actualButtonWidth));
        
        // 计算缩放比例
        var scale = actualButtonWidth / originalButtonWidth;
        
        // Y 坐标
        var yPosition = -80;
        
        // 计算总宽度（用于居中）
        var totalWidth = buttonCount * actualButtonWidth + (buttonCount - 1) * screenWidth * gapPercent;
        
        // 计算起始 X 坐标（居中）
        var startX = -totalWidth / 2 + actualButtonWidth / 2;
        
        console.log("屏幕宽度: " + screenWidth + 
                   ", 按钮数量: " + buttonCount + 
                   ", 按钮宽度: " + actualButtonWidth +
                   ", 缩放比例: " + scale.toFixed(2));
        
        // 设置每个按钮的位置和缩放
        for (var i = 0; i < buttonCount; i++) {
            var btnNode = buttons[i];
            var xPos = startX + i * (actualButtonWidth + screenWidth * gapPercent);
            
            // 设置位置
            btnNode.setPosition(xPos, yPosition);
            
            // 设置缩放
            btnNode.scale = scale;
            
            console.log("按钮 " + btnNode.name + " 位置: (" + xPos.toFixed(0) + ", " + yPosition + "), 缩放: " + scale.toFixed(2));
        }
        
        console.log("✅ 房间按钮居中排列完成");
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
        
        // 调整 yuanbaoIcon 位置
        var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
        if (yuanbaoIcon) {
            yuanbaoIcon.y = 50;
            console.log("✅ 元宝图标位置已调整: y=50");
        }
        
        // 调整 gold_frame 位置
        var goldFrame = playerNode.getChildByName("gold_frame");
        if (goldFrame) {
            goldFrame.y = 50;
            console.log("✅ 金币框位置已调整: y=50");
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
