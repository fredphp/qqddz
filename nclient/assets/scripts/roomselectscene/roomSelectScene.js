// 房间选择场景控制器
// 从大厅点击"普通场"进入此场景
// 点击具体场次（10分场、50分场等）才进入游戏

cc.Class({
    extends: cc.Component,

    properties: {
        // 可在编辑器中配置的属性
    },

    onLoad () {
        console.log("=== 房间选择场景 onLoad ===");
        
        var self = this;
        
        // 检查 myglobal 是否存在
        if (!window.myglobal) {
            console.warn("myglobal 未定义，等待初始化...");
            this._waitForMyglobal();
            return;
        }
        
        this._initScene();
    },

    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;
        
        var check = function() {
            attempts++;
            if (window.myglobal && window.myglobal.playerData) {
                self._initScene();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 100);
            } else {
                console.error("myglobal 初始化超时，返回登录页面");
                cc.director.loadScene("loginScene");
            }
        };
        
        setTimeout(check, 100);
    },

    _initScene: function() {
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.playerData) {
            console.error("myglobal 或 playerData 未定义");
            cc.director.loadScene("loginScene");
            return;
        }
        
        var playerData = myglobal.playerData;
        
        if (!playerData.token) {
            console.error("token 不存在，返回登录页面");
            cc.director.loadScene("loginScene");
            return;
        }
        
        // 创建 UI
        this._createUI();
        
        // 播放背景音乐
        this._playBackgroundMusic();
        
        console.log("=== 房间选择场景初始化完成 ===");
    },

    // 动态创建 UI
    _createUI: function() {
        var self = this;
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas);
        var designWidth = canvas ? canvas.designResolution.width : 1280;
        var designHeight = canvas ? canvas.designResolution.height : 720;
        
        console.log("设计尺寸: " + designWidth + " x " + designHeight);
        
        // ==================== 创建背景 ====================
        this._createBackground(designWidth, designHeight);
        
        // ==================== 创建返回按钮 ====================
        this._createBackButton(designWidth, designHeight);
        
        // ==================== 创建房间按钮 ====================
        this._createRoomButtons(designWidth, designHeight);
        
        // ==================== 创建玩家信息 ====================
        this._createPlayerInfo(designWidth, designHeight);
    },

    // 创建背景
    _createBackground: function(designWidth, designHeight) {
        var self = this;
        
        // 创建背景节点
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(designWidth, designHeight);
        bgNode.setPosition(0, 0);
        
        // 添加Sprite组件
        var sprite = bgNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SIMPLE;
        
        // 加载背景图片
        cc.resources.load("room_select/room_select_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载背景图片失败:", err);
                // 失败时使用纯色背景
                self._createColorBackground(bgNode, designWidth, designHeight);
                return;
            }
            sprite.spriteFrame = spriteFrame;
            bgNode.setContentSize(designWidth, designHeight);
            console.log("背景图片加载成功");
        });
        
        // 添加Widget组件实现自适应
        var widget = bgNode.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;
        
        bgNode.parent = this.node;
        bgNode.zIndex = 0;
        
        this.bgNode = bgNode;
    },
    
    // 创建纯色背景（备用）
    _createColorBackground: function(bgNode, width, height) {
        var graphics = bgNode.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(45, 45, 85);
        graphics.rect(-width/2, -height/2, width, height);
        graphics.fill();
    },

    // 创建返回按钮
    _createBackButton: function(designWidth, designHeight) {
        var self = this;
        
        // 返回按钮 - 左上角
        var backBtn = new cc.Node("BackButton");
        backBtn.setContentSize(80, 40);
        backBtn.setPosition(-designWidth/2 + 60, designHeight/2 - 40);
        
        // 按钮背景
        var bgGraphics = backBtn.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(80, 80, 80, 200);
        bgGraphics.roundRect(-40, -20, 80, 40, 5);
        bgGraphics.fill();
        
        // 按钮文字
        var label = backBtn.addComponent(cc.Label);
        label.string = "返回";
        label.fontSize = 20;
        label.lineHeight = 28;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        backBtn.color = cc.color(255, 255, 255);
        
        // 添加按钮组件
        var button = backBtn.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        // 点击事件
        backBtn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            self._onBackClick();
        }, this);
        
        backBtn.parent = this.node;
        backBtn.zIndex = 100;
    },

    // 创建房间按钮
    _createRoomButtons: function(designWidth, designHeight) {
        var self = this;
        
        // 房间数据 - 可以根据实际需求调整
        var rooms = [
            { name: "新手场", minGold: 0, baseScore: 1, color: cc.color(100, 200, 100) },
            { name: "普通场", minGold: 1000, baseScore: 2, color: cc.color(100, 150, 255) },
            { name: "10分场", minGold: 5000, baseScore: 10, color: cc.color(255, 200, 100) },
            { name: "50分场", minGold: 20000, baseScore: 50, color: cc.color(255, 150, 100) }
        ];
        
        // 按钮容器
        var containerNode = new cc.Node("RoomButtons");
        containerNode.setPosition(0, 0);
        containerNode.parent = this.node;
        containerNode.zIndex = 20;
        
        // 计算按钮布局
        var buttonWidth = 180;
        var buttonHeight = 220;
        var spacing = 40;
        var totalWidth = rooms.length * buttonWidth + (rooms.length - 1) * spacing;
        var startX = -totalWidth / 2 + buttonWidth / 2;
        
        rooms.forEach(function(room, index) {
            var x = startX + index * (buttonWidth + spacing);
            var y = -20;
            
            var roomBtn = self._createRoomButton(room, buttonWidth, buttonHeight);
            roomBtn.setPosition(x, y);
            roomBtn.parent = containerNode;
        });
    },

    // 创建单个房间按钮
    _createRoomButton: function(room, width, height) {
        var self = this;
        
        var btnNode = new cc.Node("RoomButton_" + room.name);
        btnNode.setContentSize(width, height);
        
        // 按钮背景 - 使用Graphics绘制圆角矩形
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(width, height);
        
        var graphics = bgNode.addComponent(cc.Graphics);
        // 渐变效果（使用两个矩形模拟）
        graphics.fillColor = new cc.Color(
            Math.max(room.color.r - 30, 0),
            Math.max(room.color.g - 30, 0),
            Math.max(room.color.b - 30, 0),
            230
        );
        graphics.roundRect(-width/2, -height/2, width, height, 15);
        graphics.fill();
        
        // 边框
        graphics.strokeColor = new cc.Color(255, 255, 255, 100);
        graphics.lineWidth = 2;
        graphics.roundRect(-width/2, -height/2, width, height, 15);
        graphics.stroke();
        
        bgNode.parent = btnNode;
        
        // 房间名称
        var nameNode = new cc.Node("RoomName");
        nameNode.setPosition(0, 60);
        var nameLabel = nameNode.addComponent(cc.Label);
        nameLabel.string = room.name;
        nameLabel.fontSize = 28;
        nameLabel.lineHeight = 36;
        nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        nameLabel.fontFamily = "Arial, Microsoft YaHei";
        var outline = nameNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        nameNode.color = cc.color(255, 255, 255);
        nameNode.parent = btnNode;
        
        // 底分
        var scoreNode = new cc.Node("BaseScore");
        scoreNode.setPosition(0, 20);
        var scoreLabel = scoreNode.addComponent(cc.Label);
        scoreLabel.string = "底分: " + room.baseScore;
        scoreLabel.fontSize = 20;
        scoreLabel.lineHeight = 28;
        scoreLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        scoreNode.color = cc.color(255, 215, 0);
        scoreNode.parent = btnNode;
        
        // 最低入场
        var minGoldNode = new cc.Node("MinGold");
        minGoldNode.setPosition(0, -20);
        var minGoldLabel = minGoldNode.addComponent(cc.Label);
        minGoldLabel.string = "入场: " + self._formatGold(room.minGold);
        minGoldLabel.fontSize = 18;
        minGoldLabel.lineHeight = 24;
        minGoldLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        minGoldNode.color = cc.color(200, 200, 200);
        minGoldNode.parent = btnNode;
        
        // 玩家人数（模拟）
        var playersNode = new cc.Node("Players");
        playersNode.setPosition(0, -60);
        var playersLabel = playersNode.addComponent(cc.Label);
        playersLabel.string = Math.floor(Math.random() * 500 + 100) + " 人在线";
        playersLabel.fontSize = 16;
        playersLabel.lineHeight = 22;
        playersLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        playersNode.color = cc.color(150, 255, 150);
        playersNode.parent = btnNode;
        
        // 添加按钮组件
        var button = btnNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.05;
        
        // 存储房间数据
        btnNode.roomData = room;
        
        // 点击事件
        btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            self._onRoomClick(room);
        }, this);
        
        // 鼠标悬停效果
        btnNode.on(cc.Node.EventType.MOUSE_ENTER, function() {
            btnNode.scale = 1.02;
        }, this);
        btnNode.on(cc.Node.EventType.MOUSE_LEAVE, function() {
            btnNode.scale = 1.0;
        }, this);
        
        return btnNode;
    },

    // 格式化金币显示
    _formatGold: function(gold) {
        if (gold >= 10000) {
            return (gold / 10000).toFixed(1) + "万";
        }
        return gold.toString();
    },

    // 创建玩家信息
    _createPlayerInfo: function(designWidth, designHeight) {
        var myglobal = window.myglobal;
        var playerData = myglobal ? myglobal.playerData : null;
        
        if (!playerData) return;
        
        // 玩家信息容器 - 右上角
        var infoNode = new cc.Node("PlayerInfo");
        infoNode.setPosition(designWidth/2 - 150, designHeight/2 - 40);
        infoNode.parent = this.node;
        infoNode.zIndex = 30;
        
        // 玩家昵称
        var nicknameNode = new cc.Node("Nickname");
        nicknameNode.setPosition(0, 0);
        
        var nicknameLabel = nicknameNode.addComponent(cc.Label);
        nicknameLabel.string = playerData.nickName || "游客";
        nicknameLabel.fontSize = 22;
        nicknameLabel.lineHeight = 30;
        nicknameLabel.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
        
        var outline = nicknameNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        
        nicknameNode.color = cc.color(255, 255, 255);
        nicknameNode.parent = infoNode;
        
        // 欢乐豆
        var goldNode = new cc.Node("Gold");
        goldNode.setPosition(0, -30);
        
        var goldLabel = goldNode.addComponent(cc.Label);
        goldLabel.string = "欢乐豆: " + this._formatGold(playerData.gobal_count || 0);
        goldLabel.fontSize = 18;
        goldLabel.lineHeight = 24;
        goldLabel.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
        
        var goldOutline = goldNode.addComponent(cc.LabelOutline);
        goldOutline.color = cc.color(0, 0, 0);
        goldOutline.width = 1;
        
        goldNode.color = cc.color(255, 215, 0);
        goldNode.parent = infoNode;
    },

    // 返回按钮点击
    _onBackClick: function() {
        console.log("=== 点击返回按钮 ===");
        
        // 播放音效
        this._playClickSound();
        
        // 返回大厅场景
        cc.director.loadScene("hallScene");
    },

    // 房间按钮点击
    _onRoomClick: function(room) {
        console.log("=== 点击房间: " + room.name + " ===");
        
        var self = this;
        var myglobal = window.myglobal;
        var playerData = myglobal ? myglobal.playerData : null;
        
        // 播放音效
        this._playClickSound();
        
        // 检查金币是否足够
        if (playerData && playerData.gobal_count < room.minGold) {
            this._showMessage("欢乐豆不足", "需要 " + this._formatGold(room.minGold) + " 欢乐豆才能进入" + room.name);
            return;
        }
        
        // 保存选择的房间信息
        if (myglobal) {
            myglobal.selectedRoom = room;
        }
        
        // 显示加载提示
        this._showLoadingTip("正在进入" + room.name + "...");
        
        // 跳转到游戏场景
        this.scheduleOnce(function() {
            cc.director.loadScene("gameScene");
        }, 0.5);
    },

    // 显示消息提示
    _showMessage: function(title, message) {
        var tipNode = new cc.Node("MessageTip");
        tipNode.setPosition(0, 0);
        tipNode.setContentSize(400, 200);
        
        // 半透明背景
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(400, 200);
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(0, 0, 0, 220);
        bgGraphics.roundRect(-200, -100, 400, 200, 15);
        bgGraphics.fill();
        bgNode.parent = tipNode;
        
        // 标题
        var titleNode = new cc.Node("Title");
        titleNode.setPosition(0, 50);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = title || "提示";
        titleLabel.fontSize = 28;
        titleLabel.lineHeight = 36;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleLabel.fontFamily = "Arial, Microsoft YaHei";
        titleNode.color = cc.color(255, 200, 100);
        titleNode.parent = tipNode;
        
        // 内容
        var contentNode = new cc.Node("Content");
        contentNode.setPosition(0, 0);
        var contentLabel = contentNode.addComponent(cc.Label);
        contentLabel.string = message || "";
        contentLabel.fontSize = 20;
        contentLabel.lineHeight = 28;
        contentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        contentNode.color = cc.color(255, 255, 255);
        contentNode.parent = tipNode;
        
        // 确定按钮
        var btnNode = new cc.Node("OKButton");
        btnNode.setPosition(0, -60);
        btnNode.setContentSize(100, 36);
        
        var btnGraphics = btnNode.addComponent(cc.Graphics);
        btnGraphics.fillColor = new cc.Color(76, 175, 80);
        btnGraphics.roundRect(-50, -18, 100, 36, 5);
        btnGraphics.fill();
        
        var btnLabel = btnNode.addComponent(cc.Label);
        btnLabel.string = "确定";
        btnLabel.fontSize = 18;
        btnLabel.lineHeight = 26;
        btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        btnNode.color = cc.color(255, 255, 255);
        btnNode.parent = tipNode;
        
        this.node.addChild(tipNode);
        tipNode.zIndex = 9999;
        
        // 点击确定关闭
        btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            tipNode.destroy();
        }, this);
        
        // 点击背景关闭
        bgNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            tipNode.destroy();
        }, this);
        
        // 3秒后自动关闭
        this.scheduleOnce(function() {
            if (tipNode && tipNode.isValid) {
                tipNode.destroy();
            }
        }, 3);
    },

    // 显示加载提示
    _showLoadingTip: function(message) {
        var tipNode = new cc.Node("LoadingTip");
        tipNode.setPosition(0, 0);
        tipNode.setContentSize(300, 100);
        
        // 半透明背景
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(300, 100);
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(0, 0, 0, 180);
        bgGraphics.roundRect(-150, -50, 300, 100, 10);
        bgGraphics.fill();
        bgNode.parent = tipNode;
        
        // 提示文字
        var labelNode = new cc.Node("Label");
        labelNode.setPosition(0, 0);
        var label = labelNode.addComponent(cc.Label);
        label.string = message || "正在加载...";
        label.fontSize = 24;
        label.lineHeight = 32;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = tipNode;
        
        this.node.addChild(tipNode);
        tipNode.zIndex = 9999;
    },

    // 播放点击音效
    _playClickSound: function() {
        var isopen_sfx = window.isopen_sfx;
        if (isopen_sfx === 0) return;
        
        try {
            cc.resources.load("sound/click", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    try {
                        cc.audioEngine.playEffect(clip, false);
                    } catch(e) {}
                }
            });
        } catch(e) {}
    },

    // 播放背景音乐
    _playBackgroundMusic: function() {
        var isopen_sound = window.isopen_sound || 1;
        if (!isopen_sound) return;
        
        try {
            cc.audioEngine.stopMusic();
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    try {
                        cc.audioEngine.playMusic(clip, true);
                    } catch(e) {}
                }
            });
        } catch(e) {}
    }
});
