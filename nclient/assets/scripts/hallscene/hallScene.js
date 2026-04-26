// 使用全局变量，不使用 require

cc.Class({
    name: 'hallScene',
    extends: cc.Component, 

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
            console.log("✅ 元宝已设置:", goldCount);
        } else {
            console.warn("gobal_count 组件未绑定");
        }

        // 加载用户头像
        this._loadUserAvatar(playerData.avatarUrl);

        // 房间配置数据
        this.roomConfigs = [];
        
        // 播放大厅背景音乐
        this._playHallBackgroundMusic();
        
        // 隐藏不需要的按钮
        this._hideUnwantedButtons();
        
        // 从 API 获取房间配置
        this._fetchRoomConfigs();
        
        // 移除公告栏
        this._removeNoticeBoard();
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
                self.headimage.spriteFrame = new cc.SpriteFrame(texture);
                console.log("网络头像加载成功");
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
                self.headimage.spriteFrame = spriteFrame;
                console.log("本地头像加载成功:", avatarUrl);
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
            self.headimage.spriteFrame = spriteFrame;
            console.log("默认头像加载成功");
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
            // 检查是否已有音乐在播放
            if (cc.audioEngine.isMusicPlaying()) {
                console.log("背景音乐已在播放中");
                return;
            }
            
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
        
        console.log("获取房间配置 - API URL:", apiUrl);
        
        if (!apiUrl || !window.HttpAPI) {
            console.warn("API URL 未配置或 HttpAPI 未加载，使用默认房间配置");
            self._initRoomButtons(self._getDefaultRoomConfigs());
            return;
        }
        
        window.HttpAPI.getRoomConfigList(apiUrl, cryptoKey, function(err, configs) {
            if (err) {
                console.warn("获取房间配置失败:", err);
                // 使用默认配置
                self._initRoomButtons(self._getDefaultRoomConfigs());
                return;
            }
            
            console.log("获取到房间配置:", configs);
            
            if (configs && configs.length > 0) {
                self.roomConfigs = configs;
                self._initRoomButtons(configs);
            } else {
                console.warn("房间配置为空，使用默认配置");
                self._initRoomButtons(self._getDefaultRoomConfigs());
            }
        });
    },
    
    // 获取默认房间配置
    _getDefaultRoomConfigs: function() {
        return [
            {
                id: 1,
                room_name: "初级房",
                room_type: 1,
                base_score: 1,
                multiplier: 1,
                min_gold: 1000,
                max_gold: 50000,
                entry_gold: 1000,
                description: "适合新手玩家",
                status: 1,
                sort_order: 1
            },
            {
                id: 2,
                room_name: "中级房",
                room_type: 2,
                base_score: 2,
                multiplier: 1,
                min_gold: 50000,
                max_gold: 200000,
                entry_gold: 50000,
                description: "适合有一定经验的玩家",
                status: 1,
                sort_order: 2
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
                description: "高手对决",
                status: 1,
                sort_order: 3
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
                description: "大师专属",
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
    
    // 初始化房间选择按钮 - 根据配置动态显示
    _initRoomButtons: function(roomConfigs) {
        var self = this;
        
        // 默认按钮名称映射到 room_type
        var buttonNameMap = {
            1: "btn_room_junior",   // 初级房
            2: "btn_room_middle",   // 中级房
            3: "btn_room_senior",   // 高级房
            4: "btn_room_master"    // 大师房
        };
        
        // 先隐藏所有房间按钮
        for (var key in buttonNameMap) {
            var btnNode = this.node.getChildByName(buttonNameMap[key]);
            if (btnNode) {
                btnNode.active = false;
            }
        }
        
        // 根据 API 返回的配置显示对应的房间按钮
        for (var i = 0; i < roomConfigs.length; i++) {
            var config = roomConfigs[i];
            var roomType = config.room_type;
            var buttonName = buttonNameMap[roomType];
            
            if (!buttonName) {
                console.warn("未知的房间类型:", roomType);
                continue;
            }
            
            var btnNode = this.node.getChildByName(buttonName);
            if (btnNode) {
                // 显示该按钮
                btnNode.active = true;
                
                console.log("初始化房间按钮: " + buttonName + ", 房间名: " + config.room_name + ", 入场豆子: " + config.entry_gold);
                
                // 保存配置到节点
                btnNode.roomConfig = config;
                
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
            } else {
                console.warn("未找到房间按钮节点: " + buttonName);
            }
        }
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
        this._removeGlobalTouchForMusic();
    }
});
