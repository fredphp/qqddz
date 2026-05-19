/**
 * 练级区场景控制器
 * 适配 Cocos Creator 2.4.15
 * 
 * 功能：
 * 1. 显示5个场次选择按钮
 * 2. 显示玩家当前积分
 * 3. 处理场次进入逻辑
 * 4. 返回大厅功能
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 预加载资源（可选，在编辑器中配置）
        bgSpriteFrame: cc.SpriteFrame,
        buttonPrefab: cc.Prefab,
    },

    // ==================== 生命周期 ====================

    onLoad() {
        console.log("=== 练级区场景 onLoad ===");
        
        // 初始化变量
        this._playerScore = 0;
        this._roomButtons = [];
        
        // 检查 myglobal
        if (!window.myglobal) {
            console.warn("myglobal 未定义，等待初始化...");
            this._waitForMyglobal();
            return;
        }
        
        this._initScene();
    },

    start() {
        console.log("=== 练级区场景 start ===");
        // 播放背景音乐
        this._playBackgroundMusic();
    },

    onDestroy() {
        console.log("=== 练级区场景 destroy ===");
    },

    // ==================== 初始化 ====================

    _waitForMyglobal() {
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
                console.error("myglobal 初始化超时");
                cc.director.loadScene("loginScene");
            }
        };
        
        setTimeout(check, 100);
    },

    _initScene() {
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.playerData) {
            console.error("myglobal 或 playerData 未定义");
            cc.director.loadScene("loginScene");
            return;
        }
        
        // 获取玩家积分
        this._playerScore = myglobal.playerData.gobal_count || 0;
        console.log("玩家当前积分:", this._playerScore);
        
        // 创建UI
        this._createUI();
    },

    // ==================== UI创建 ====================

    _createUI() {
        var canvas = this.node.getComponent(cc.Canvas);
        var designWidth = canvas ? canvas.designResolution.width : 1280;
        var designHeight = canvas ? canvas.designResolution.height : 720;
        
        console.log("设计尺寸:", designWidth, "x", designHeight);
        
        // 1. 创建背景
        this._createBackground(designWidth, designHeight);
        
        // 2. 创建顶部区域
        this._createTopArea(designWidth, designHeight);
        
        // 3. 创建中间区域（场次按钮）
        this._createMiddleArea(designWidth, designHeight);
        
        // 4. 创建底部区域（返回按钮）
        this._createBottomArea(designWidth, designHeight);
    },

    // ==================== 背景 ====================

    _createBackground(width, height) {
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(width, height);
        bgNode.setPosition(0, 0);
        
        var sprite = bgNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SIMPLE;
        
        // 加载背景图片 - 使用 table_bg_1
        var self = this;
        cc.resources.load("table_bg_1", cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载背景图片失败:", err);
                // 使用备用背景
                self._createFallbackBackground(bgNode, width, height);
                return;
            }
            sprite.spriteFrame = spriteFrame;
            bgNode.setContentSize(width, height);
            console.log("背景图片加载成功");
        });
        
        // 添加Widget组件
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

    _createFallbackBackground(bgNode, width, height) {
        // 使用纯色背景作为备用
        var graphics = bgNode.addComponent(cc.Graphics);
        
        // 绘制赌桌背景
        graphics.fillColor = new cc.Color(139, 69, 19); // 深棕色
        graphics.rect(-width/2, -height/2, width, height);
        graphics.fill();
        
        // 绘制红色赌桌
        graphics.fillColor = new cc.Color(139, 0, 0); // 深红色
        graphics.roundRect(-width/2 + 50, -height/2 + 100, width - 100, height - 200, 30);
        graphics.fill();
    },

    // ==================== 顶部区域 ====================

    _createTopArea(width, height) {
        // 顶部容器
        var topArea = new cc.Node("TopArea");
        topArea.setPosition(0, height/2 - 60);
        
        // 标题栏背景
        var titleBar = new cc.Node("TitleBar");
        titleBar.setPosition(0, 0);
        titleBar.setContentSize(400, 60);
        
        var titleBg = titleBar.addComponent(cc.Graphics);
        titleBg.fillColor = new cc.Color(139, 0, 0, 230); // 深红色
        titleBg.roundRect(-200, -30, 400, 60, 10);
        titleBg.fill();
        titleBg.strokeColor = new cc.Color(255, 215, 0); // 金色边框
        titleBg.lineWidth = 3;
        titleBg.roundRect(-200, -30, 400, 60, 10);
        titleBg.stroke();
        
        // 金币装饰 - 左侧
        var coinLeft = new cc.Node("CoinLeft");
        coinLeft.setPosition(-220, 0);
        var coinLeftLabel = coinLeft.addComponent(cc.Label);
        coinLeftLabel.string = "💰";
        coinLeftLabel.fontSize = 30;
        coinLeft.parent = titleBar;
        
        // 金币装饰 - 右侧
        var coinRight = new cc.Node("CoinRight");
        coinRight.setPosition(220, 0);
        var coinRightLabel = coinRight.addComponent(cc.Label);
        coinRightLabel.string = "💰";
        coinRightLabel.fontSize = 30;
        coinRight.parent = titleBar;
        
        // 标题文字
        var titleLabel = new cc.Node("TitleLabel");
        var titleText = titleLabel.addComponent(cc.Label);
        titleText.string = "练级区";
        titleText.fontSize = 36;
        titleText.lineHeight = 44;
        titleText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleText.fontFamily = "Arial, Microsoft YaHei";
        titleLabel.color = cc.color(255, 215, 0); // 金色
        
        var titleOutline = titleLabel.addComponent(cc.LabelOutline);
        titleOutline.color = cc.color(0, 0, 0);
        titleOutline.width = 2;
        
        titleLabel.parent = titleBar;
        titleBar.parent = topArea;
        
        // 积分显示栏
        var scoreBar = new cc.Node("ScoreBar");
        scoreBar.setPosition(0, -70);
        scoreBar.setContentSize(300, 40);
        
        var scoreBg = scoreBar.addComponent(cc.Graphics);
        scoreBg.fillColor = new cc.Color(60, 40, 30, 200);
        scoreBg.roundRect(-150, -20, 300, 40, 8);
        scoreBg.fill();
        
        this.scoreLabel = new cc.Node("ScoreLabel");
        var scoreText = this.scoreLabel.addComponent(cc.Label);
        scoreText.string = "玩家当前积分: " + this._formatScore(this._playerScore);
        scoreText.fontSize = 20;
        scoreText.lineHeight = 28;
        scoreText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        this.scoreLabel.color = cc.color(255, 255, 255);
        this.scoreLabel.parent = scoreBar;
        
        scoreBar.parent = topArea;
        topArea.parent = this.node;
        topArea.zIndex = 10;
        
        this.topArea = topArea;
    },

    // ==================== 中间区域（场次按钮）====================

    _createMiddleArea(width, height) {
        // 场次数据配置
        var rooms = [
            { id: 1, name: "10分场", baseScore: 10, minScore: 500, color: cc.color(76, 175, 80), isAdvanced: false },
            { id: 2, name: "50分场", baseScore: 50, minScore: 2500, color: cc.color(33, 150, 243), isAdvanced: false },
            { id: 3, name: "200分场", baseScore: 200, minScore: 10000, color: cc.color(255, 193, 7), isAdvanced: false },
            { id: 4, name: "500分场", baseScore: 500, minScore: 25000, color: cc.color(255, 152, 0), isAdvanced: false },
            { id: 5, name: "1000分场", baseScore: 1000, minScore: 50000, color: cc.color(244, 67, 54), isAdvanced: true }
        ];
        
        // 中间容器
        var middleArea = new cc.Node("MiddleArea");
        middleArea.setPosition(0, -20);
        
        // 场次按钮容器
        var roomsContainer = new cc.Node("RoomsContainer");
        
        // 计算布局
        var buttonWidth = 180;
        var buttonHeight = 260;
        var spacing = 30;
        var totalWidth = rooms.length * buttonWidth + (rooms.length - 1) * spacing;
        var startX = -totalWidth / 2 + buttonWidth / 2;
        
        // 创建每个场次按钮
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var btnNode = this._createRoomButton(room, buttonWidth, buttonHeight);
            btnNode.setPosition(startX + i * (buttonWidth + spacing), 0);
            btnNode.parent = roomsContainer;
            this._roomButtons.push({ node: btnNode, data: room });
        }
        
        roomsContainer.parent = middleArea;
        
        // 底部信息栏
        var infoBar = this._createInfoBar();
        infoBar.setPosition(0, -180);
        infoBar.parent = middleArea;
        
        middleArea.parent = this.node;
        middleArea.zIndex = 20;
        
        this.middleArea = middleArea;
    },

    _createRoomButton(room, width, height) {
        var self = this;
        var isUnlocked = this._playerScore >= room.minScore;
        
        // 按钮节点
        var btnNode = new cc.Node("RoomButton_" + room.id);
        btnNode.setContentSize(width, height);
        
        // 背景和边框
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(width, height);
        
        var graphics = bgNode.addComponent(cc.Graphics);
        
        // 背景
        graphics.fillColor = new cc.Color(room.color.r, room.color.g, room.color.b, 230);
        graphics.roundRect(-width/2, -height/2, width, height, 15);
        graphics.fill();
        
        // 边框
        graphics.strokeColor = new cc.Color(255, 215, 0, 200);
        graphics.lineWidth = 3;
        graphics.roundRect(-width/2, -height/2, width, height, 15);
        graphics.stroke();
        
        bgNode.parent = btnNode;
        
        // 高级场光效
        if (room.isAdvanced) {
            var glowNode = new cc.Node("GlowEffect");
            var glowGraphics = glowNode.addComponent(cc.Graphics);
            glowGraphics.fillColor = new cc.Color(255, 215, 0, 50);
            glowGraphics.roundRect(-width/2 - 10, -height/2 - 10, width + 20, height + 20, 20);
            glowGraphics.fill();
            glowNode.parent = btnNode;
            glowNode.zIndex = -1;
            
            // 闪烁动画
            cc.tween(glowNode)
                .to(0.8, { opacity: 100 })
                .to(0.8, { opacity: 255 })
                .union()
                .repeatForever()
                .start();
        }
        
        // 扑克牌图标
        var pokerIcon = new cc.Node("PokerIcon");
        pokerIcon.setPosition(0, height/2 - 50);
        var pokerLabel = pokerIcon.addComponent(cc.Label);
        pokerLabel.string = "🃏";
        pokerLabel.fontSize = 40;
        pokerIcon.parent = btnNode;
        
        // 场次名称
        var nameLabel = new cc.Node("NameLabel");
        nameLabel.setPosition(0, 30);
        var nameText = nameLabel.addComponent(cc.Label);
        nameText.string = room.name;
        nameText.fontSize = 26;
        nameText.lineHeight = 34;
        nameText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        nameText.fontFamily = "Arial, Microsoft YaHei";
        nameLabel.color = cc.color(255, 255, 255);
        
        var nameOutline = nameLabel.addComponent(cc.LabelOutline);
        nameOutline.color = cc.color(0, 0, 0);
        nameOutline.width = 2;
        
        nameLabel.parent = btnNode;
        
        // 底分
        var scoreLabel = new cc.Node("ScoreLabel");
        scoreLabel.setPosition(0, -10);
        var scoreText = scoreLabel.addComponent(cc.Label);
        scoreText.string = "底分: " + room.baseScore;
        scoreText.fontSize = 18;
        scoreText.lineHeight = 24;
        scoreText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        scoreLabel.color = cc.color(255, 215, 0);
        scoreLabel.parent = btnNode;
        
        // 积分准入
        var minScoreLabel = new cc.Node("MinScoreLabel");
        minScoreLabel.setPosition(0, -40);
        var minScoreText = minScoreLabel.addComponent(cc.Label);
        minScoreText.string = this._formatScore(room.minScore) + "积分准入";
        minScoreText.fontSize = 14;
        minScoreText.lineHeight = 20;
        minScoreText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        minScoreLabel.color = cc.color(200, 200, 200);
        minScoreLabel.parent = btnNode;
        
        // 锁定状态
        if (!isUnlocked) {
            // 半透明遮罩
            var maskNode = new cc.Node("LockMask");
            var maskGraphics = maskNode.addComponent(cc.Graphics);
            maskGraphics.fillColor = new cc.Color(0, 0, 0, 150);
            maskGraphics.roundRect(-width/2, -height/2, width, height, 15);
            maskGraphics.fill();
            maskNode.parent = btnNode;
            
            // 锁图标
            var lockIcon = new cc.Node("LockIcon");
            lockIcon.setPosition(0, -height/2 + 30);
            var lockLabel = lockIcon.addComponent(cc.Label);
            lockLabel.string = "🔒";
            lockLabel.fontSize = 30;
            lockIcon.parent = btnNode;
        }
        
        // 高级场标签
        if (room.isAdvanced) {
            var advancedLabel = new cc.Node("AdvancedLabel");
            advancedLabel.setPosition(0, -65);
            var advancedText = advancedLabel.addComponent(cc.Label);
            advancedText.string = "高级场";
            advancedText.fontSize = 14;
            advancedText.lineHeight = 20;
            advancedText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            advancedLabel.color = cc.color(255, 215, 0);
            advancedLabel.parent = btnNode;
        }
        
        // 添加按钮组件
        var button = btnNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.05;
        
        // 存储数据
        btnNode.roomData = room;
        btnNode.isUnlocked = isUnlocked;
        
        // 点击事件
        btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            self._onRoomButtonClick(room, isUnlocked);
        }, this);
        
        // 鼠标悬停效果
        btnNode.on(cc.Node.EventType.MOUSE_ENTER, function() {
            if (isUnlocked) {
                btnNode.scale = 1.03;
            }
        }, this);
        
        btnNode.on(cc.Node.EventType.MOUSE_LEAVE, function() {
            btnNode.scale = 1.0;
        }, this);
        
        return btnNode;
    },

    _createInfoBar() {
        var infoBar = new cc.Node("InfoBar");
        infoBar.setContentSize(500, 60);
        
        // 背景
        var bgGraphics = infoBar.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(139, 0, 0, 200);
        bgGraphics.roundRect(-250, -30, 500, 60, 10);
        bgGraphics.fill();
        bgGraphics.strokeColor = new cc.Color(255, 215, 0);
        bgGraphics.lineWidth = 2;
        bgGraphics.roundRect(-250, -30, 500, 60, 10);
        bgGraphics.stroke();
        
        // 主标题
        var mainLabel = new cc.Node("MainLabel");
        mainLabel.setPosition(0, 10);
        var mainText = mainLabel.addComponent(cc.Label);
        mainText.string = "积分区积分场";
        mainText.fontSize = 20;
        mainText.lineHeight = 28;
        mainText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        mainLabel.color = cc.color(255, 255, 255);
        mainLabel.parent = infoBar;
        
        // 规则说明
        var ruleLabel = new cc.Node("RuleLabel");
        ruleLabel.setPosition(0, -15);
        var ruleText = ruleLabel.addComponent(cc.Label);
        ruleText.string = "1元 = 1000积分";
        ruleText.fontSize = 14;
        ruleText.lineHeight = 20;
        ruleText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        ruleLabel.color = cc.color(200, 200, 200);
        ruleLabel.parent = infoBar;
        
        return infoBar;
    },

    // ==================== 底部区域 ====================

    _createBottomArea(width, height) {
        var bottomArea = new cc.Node("BottomArea");
        bottomArea.setPosition(0, -height/2 + 50);
        
        // 返回按钮
        var backBtn = new cc.Node("BackButton");
        backBtn.setContentSize(120, 50);
        
        // 按钮背景
        var bgGraphics = backBtn.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(139, 0, 0, 230);
        bgGraphics.roundRect(-60, -25, 120, 50, 8);
        bgGraphics.fill();
        bgGraphics.strokeColor = new cc.Color(255, 215, 0);
        bgGraphics.lineWidth = 2;
        bgGraphics.roundRect(-60, -25, 120, 50, 8);
        bgGraphics.stroke();
        
        // 文字
        var label = new cc.Node("Label");
        var labelText = label.addComponent(cc.Label);
        labelText.string = "返回";
        labelText.fontSize = 22;
        labelText.lineHeight = 30;
        labelText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelText.fontFamily = "Arial, Microsoft YaHei";
        label.color = cc.color(255, 215, 0);
        label.parent = backBtn;
        
        // 按钮组件
        var button = backBtn.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
        // 点击事件
        var self = this;
        backBtn.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            self._onBackButtonClick();
        }, this);
        
        backBtn.parent = bottomArea;
        bottomArea.parent = this.node;
        bottomArea.zIndex = 30;
        
        this.backButton = backBtn;
    },

    // ==================== 事件处理 ====================

    _onRoomButtonClick(room, isUnlocked) {
        console.log("点击场次:", room.name, "是否解锁:", isUnlocked);
        
        // 播放音效
        this._playClickSound();
        
        if (!isUnlocked) {
            // 未解锁，显示提示
            this._showToast("积分不足，需要 " + this._formatScore(room.minScore) + " 积分");
            return;
        }
        
        // 已解锁，进入游戏
        this._enterRoom(room);
    },

    _onBackButtonClick() {
        console.log("点击返回按钮");
        
        // 播放音效
        this._playClickSound();
        
        // 返回大厅
        cc.director.loadScene("hallScene");
    },

    _enterRoom(room) {
        console.log("进入场次:", room.name);
        
        // 显示加载提示
        this._showLoading("正在进入" + room.name + "...");
        
        // 保存选择的房间信息
        var myglobal = window.myglobal;
        if (myglobal) {
            myglobal.selectedRoom = {
                id: room.id,
                name: room.name,
                baseScore: room.baseScore,
                minScore: room.minScore
            };
            myglobal.currentRoomConfig = {
                room_type: room.id,
                base_score: room.baseScore,
                min_gold: room.minScore,
                room_name: room.name
            };
        }
        
        // 延迟跳转到游戏场景
        this.scheduleOnce(function() {
            cc.director.loadScene("gameScene");
        }, 0.5);
    },

    // ==================== 工具方法 ====================

    _formatScore(score) {
        if (score >= 10000) {
            return (score / 10000).toFixed(1) + "万";
        }
        return score.toString();
    },

    _playClickSound() {
        var isopen_sfx = window.isopen_sfx;
        if (isopen_sfx === 0) return;
        
        try {
            cc.resources.load("sound/click", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    cc.audioEngine.playEffect(clip, false);
                }
            });
        } catch(e) {}
    },

    _playBackgroundMusic() {
        var isopen_sound = window.isopen_sound || 1;
        if (!isopen_sound) return;
        
        try {
            cc.audioEngine.stopMusic();
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err && clip) {
                    cc.audioEngine.playMusic(clip, true);
                }
            });
        } catch(e) {}
    },

    // ==================== Toast提示 ====================

    _showToast(message) {
        var self = this;
        
        // 如果已有Toast，先移除
        if (this._toastNode && this._toastNode.isValid) {
            this._toastNode.destroy();
        }
        
        // 创建Toast
        var toast = new cc.Node("Toast");
        toast.setContentSize(400, 60);
        toast.setPosition(0, 0);
        
        // 背景
        var bgGraphics = toast.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(0, 0, 0, 200);
        bgGraphics.roundRect(-200, -30, 400, 60, 10);
        bgGraphics.fill();
        
        // 文字
        var labelNode = new cc.Node("Label");
        var labelText = labelNode.addComponent(cc.Label);
        labelText.string = message;
        labelText.fontSize = 20;
        labelText.lineHeight = 28;
        labelText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelText.fontFamily = "Arial, Microsoft YaHei";
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = toast;
        
        toast.parent = this.node;
        toast.zIndex = 9999;
        
        this._toastNode = toast;
        
        // 自动消失
        this.scheduleOnce(function() {
            if (self._toastNode && self._toastNode.isValid) {
                cc.tween(self._toastNode)
                    .to(0.3, { opacity: 0 })
                    .call(function() {
                        self._toastNode.destroy();
                    })
                    .start();
            }
        }, 2);
    },

    _showLoading(message) {
        // 创建加载提示
        var loading = new cc.Node("Loading");
        loading.setContentSize(300, 80);
        loading.setPosition(0, 0);
        
        var bgGraphics = loading.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(0, 0, 0, 180);
        bgGraphics.roundRect(-150, -40, 300, 80, 10);
        bgGraphics.fill();
        
        var labelNode = new cc.Node("Label");
        var labelText = labelNode.addComponent(cc.Label);
        labelText.string = message;
        labelText.fontSize = 18;
        labelText.lineHeight = 24;
        labelText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = loading;
        
        loading.parent = this.node;
        loading.zIndex = 9999;
        
        this._loadingNode = loading;
    },

    _hideLoading() {
        if (this._loadingNode && this._loadingNode.isValid) {
            this._loadingNode.destroy();
        }
    }
});
