// 游戏选择场景控制器
// 玩家登录成功后跳转到此场景，选择要进入的游戏

cc.Class({
    extends: cc.Component,

    properties: {
        // 没有预设属性，UI 动态创建
    },

    onLoad () {
        console.log("=== 游戏选择场景 onLoad ===");
        
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
        
        // 预加载大厅场景
        this._preloadHallScene();
        
        console.log("=== 游戏选择场景初始化完成 ===");
    },

    // 动态创建 UI
    _createUI: function() {
        var screenWidth = 1280;
        var screenHeight = 720;
        
        // ==================== 创建背景 ====================
        this._createBackground();
        
        // ==================== 创建标题 ====================
        this._createTitle();
        
        // ==================== 创建游戏入口按钮 ====================
        this._createGameButtons();
        
        // ==================== 创建玩家信息 ====================
        this._createPlayerInfo();
    },

    // 创建背景
    _createBackground: function() {
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(1280, 720);
        bgNode.setPosition(0, 0);
        
        // 使用渐变色背景
        var graphics = bgNode.addComponent(cc.Graphics);
        
        // 绘制渐变背景
        graphics.fillColor = new cc.Color(25, 25, 112);  // 深蓝色
        graphics.rect(-640, -360, 1280, 720);
        graphics.fill();
        
        bgNode.parent = this.node;
        bgNode.zIndex = 0;
    },

    // 创建标题
    _createTitle: function() {
        var titleNode = new cc.Node("Title");
        titleNode.setPosition(0, 250);
        
        var label = titleNode.addComponent(cc.Label);
        label.string = "选择游戏";
        label.fontSize = 48;
        label.lineHeight = 60;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.fontFamily = "Arial, Microsoft YaHei";
        
        // 添加描边效果
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 3;
        
        titleNode.color = cc.color(255, 215, 0);  // 金色
        titleNode.parent = this.node;
        titleNode.zIndex = 10;
        
        // 副标题
        var subtitleNode = new cc.Node("Subtitle");
        subtitleNode.setPosition(0, 190);
        
        var subtitleLabel = subtitleNode.addComponent(cc.Label);
        subtitleLabel.string = "请选择您想要进入的游戏";
        subtitleLabel.fontSize = 24;
        subtitleLabel.lineHeight = 32;
        subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        
        var subtitleOutline = subtitleNode.addComponent(cc.LabelOutline);
        subtitleOutline.color = cc.color(0, 0, 0);
        subtitleOutline.width = 2;
        
        subtitleNode.color = cc.color(200, 200, 200);
        subtitleNode.parent = this.node;
        subtitleNode.zIndex = 10;
    },

    // 创建游戏入口按钮
    _createGameButtons: function() {
        var self = this;
        
        // 按钮容器
        var containerNode = new cc.Node("ButtonContainer");
        containerNode.setPosition(0, 20);
        containerNode.parent = this.node;
        containerNode.zIndex = 20;
        
        // ========== 斗地主按钮 ==========
        var ddzButton = this._createGameButton(
            "斗地主",
            "经典扑克游戏",
            cc.color(255, 165, 0),  // 橙色
            function() {
                self._onDDZClick();
            }
        );
        ddzButton.setPosition(-200, 0);
        ddzButton.parent = containerNode;
        
        // ========== 农场按钮（预留）==========
        var farmButton = this._createGameButton(
            "农场",
            "敬请期待",
            cc.color(76, 175, 80),  // 绿色
            function() {
                self._onFarmClick();
            }
        );
        farmButton.setPosition(200, 0);
        farmButton.parent = containerNode;
        
        // 预留标签
        var comingSoonNode = new cc.Node("ComingSoon");
        comingSoonNode.setPosition(200, -100);
        
        var csLabel = comingSoonNode.addComponent(cc.Label);
        csLabel.string = "(即将开放)";
        csLabel.fontSize = 18;
        csLabel.lineHeight = 24;
        
        comingSoonNode.color = cc.color(150, 150, 150);
        comingSoonNode.parent = containerNode;
    },

    // 创建单个游戏按钮
    _createGameButton: function(title, subtitle, color, clickHandler) {
        var buttonNode = new cc.Node("GameButton_" + title);
        buttonNode.setContentSize(280, 200);
        
        // 按钮背景
        var bgNode = new cc.Node("ButtonBg");
        bgNode.setContentSize(280, 200);
        
        var graphics = bgNode.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(color.r, color.g, color.b, 200);
        graphics.roundRect(-140, -100, 280, 200, 15);
        graphics.fill();
        
        // 边框
        graphics.strokeColor = new cc.Color(255, 255, 255, 150);
        graphics.lineWidth = 3;
        graphics.roundRect(-140, -100, 280, 200, 15);
        graphics.stroke();
        
        bgNode.parent = buttonNode;
        
        // 游戏图标/标题
        var titleNode = new cc.Node("Title");
        titleNode.setPosition(0, 30);
        
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = title;
        titleLabel.fontSize = 42;
        titleLabel.lineHeight = 52;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleLabel.fontFamily = "Arial, Microsoft YaHei";
        
        var outline = titleNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        
        titleNode.color = cc.color(255, 255, 255);
        titleNode.parent = buttonNode;
        
        // 副标题
        var subtitleNode = new cc.Node("Subtitle");
        subtitleNode.setPosition(0, -30);
        
        var subtitleLabel = subtitleNode.addComponent(cc.Label);
        subtitleLabel.string = subtitle;
        subtitleLabel.fontSize = 20;
        subtitleLabel.lineHeight = 28;
        subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        
        subtitleNode.color = cc.color(220, 220, 220);
        subtitleNode.parent = buttonNode;
        
        // 添加按钮组件
        var button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.08;
        
        // 添加点击事件
        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            if (clickHandler) {
                clickHandler();
            }
        }, this);
        
        // 鼠标悬停效果
        buttonNode.on(cc.Node.EventType.MOUSE_ENTER, function() {
            buttonNode.scale = 1.05;
        }, this);
        buttonNode.on(cc.Node.EventType.MOUSE_LEAVE, function() {
            buttonNode.scale = 1.0;
        }, this);
        
        return buttonNode;
    },

    // 创建玩家信息
    _createPlayerInfo: function() {
        var myglobal = window.myglobal;
        var playerData = myglobal ? myglobal.playerData : null;
        
        if (!playerData) return;
        
        // 玩家信息容器
        var infoNode = new cc.Node("PlayerInfo");
        infoNode.setPosition(-500, 300);
        infoNode.parent = this.node;
        infoNode.zIndex = 30;
        
        // 玩家昵称
        var nicknameNode = new cc.Node("Nickname");
        nicknameNode.setPosition(50, 0);
        
        var nicknameLabel = nicknameNode.addComponent(cc.Label);
        nicknameLabel.string = playerData.nickName || "游客";
        nicknameLabel.fontSize = 24;
        nicknameLabel.lineHeight = 32;
        nicknameLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        var outline = nicknameNode.addComponent(cc.LabelOutline);
        outline.color = cc.color(0, 0, 0);
        outline.width = 2;
        
        nicknameNode.color = cc.color(255, 255, 255);
        nicknameNode.parent = infoNode;
        
        // 欢乐豆
        var goldNode = new cc.Node("Gold");
        goldNode.setPosition(50, -35);
        
        var goldLabel = goldNode.addComponent(cc.Label);
        goldLabel.string = "欢乐豆: " + (playerData.gobal_count || 0);
        goldLabel.fontSize = 18;
        goldLabel.lineHeight = 24;
        goldLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        
        var goldOutline = goldNode.addComponent(cc.LabelOutline);
        goldOutline.color = cc.color(0, 0, 0);
        goldOutline.width = 1;
        
        goldNode.color = cc.color(255, 215, 0);
        goldNode.parent = infoNode;
    },

    // 斗地主按钮点击
    _onDDZClick: function() {
        console.log("=== 点击斗地主入口 ===");
        
        // 播放音效
        this._playClickSound();
        
        // 显示加载提示
        this._showLoadingTip();
        
        // 跳转到大厅场景
        this.scheduleOnce(function() {
            cc.director.loadScene("hallScene");
        }, 0.3);
    },

    // 农场按钮点击（预留）
    _onFarmClick: function() {
        console.log("=== 点击农场入口（预留）===");
        
        // 播放音效
        this._playClickSound();
        
        // 显示提示
        this._showComingSoonTip("农场游戏", "敬请期待！");
    },

    // 显示加载提示
    _showLoadingTip: function() {
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
        label.string = "正在进入游戏...";
        label.fontSize = 24;
        label.lineHeight = 32;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.color(255, 255, 255);
        labelNode.parent = tipNode;
        
        this.node.addChild(tipNode);
        tipNode.zIndex = 9999;
    },

    // 显示"敬请期待"提示
    _showComingSoonTip: function(title, message) {
        var tipNode = new cc.Node("ComingSoonTip");
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
        titleLabel.fontSize = 32;
        titleLabel.lineHeight = 40;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleLabel.fontFamily = "Arial, Microsoft YaHei";
        titleNode.color = cc.color(255, 215, 0);
        titleNode.parent = tipNode;
        
        // 内容
        var contentNode = new cc.Node("Content");
        contentNode.setPosition(0, 0);
        var contentLabel = contentNode.addComponent(cc.Label);
        contentLabel.string = message || "敬请期待！";
        contentLabel.fontSize = 24;
        contentLabel.lineHeight = 32;
        contentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        contentNode.color = cc.color(255, 255, 255);
        contentNode.parent = tipNode;
        
        // 确定按钮
        var btnNode = new cc.Node("OKButton");
        btnNode.setPosition(0, -60);
        btnNode.setContentSize(120, 40);
        
        var btnGraphics = btnNode.addComponent(cc.Graphics);
        btnGraphics.fillColor = new cc.Color(76, 175, 80);
        btnGraphics.roundRect(-60, -20, 120, 40, 5);
        btnGraphics.fill();
        
        var btnLabel = btnNode.addComponent(cc.Label);
        btnLabel.string = "确定";
        btnLabel.fontSize = 20;
        btnLabel.lineHeight = 28;
        btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        btnNode.color = cc.color(255, 255, 255);
        btnNode.parent = tipNode;
        
        this.node.addChild(tipNode);
        tipNode.zIndex = 9999;
        
        // 点击确定关闭
        btnNode.off(cc.Node.EventType.TOUCH_END);
        btnNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            tipNode.destroy();
        }, this);
        
        // 点击背景关闭
        bgNode.off(cc.Node.EventType.TOUCH_END);
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
    },

    // 预加载大厅场景
    _preloadHallScene: function() {
        cc.director.preloadScene("hallScene", function(err) {
            if (err) {
                console.error("预加载大厅场景失败:", err);
                return;
            }
            console.log("大厅场景预加载完成");
        });
    }
});
