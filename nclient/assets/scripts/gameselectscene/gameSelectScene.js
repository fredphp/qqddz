// 游戏选择场景控制器
// 玩家登录成功后跳转到此场景，选择要进入的游戏

cc.Class({
    extends: cc.Component,

    properties: {
        // 背景图Sprite - 可在编辑器中拖拽绑定
        bgSprite: {
            default: null,
            type: cc.Sprite
        },
        // 斗地主入口按钮Sprite
        ddzSprite: {
            default: null,
            type: cc.Sprite
        },
        // 农场入口按钮Sprite
        farmSprite: {
            default: null,
            type: cc.Sprite
        }
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
        var self = this;
        
        // 获取画布尺寸
        var canvas = this.node.getComponent(cc.Canvas);
        var designWidth = canvas ? canvas.designResolution.width : 1280;
        var designHeight = canvas ? canvas.designResolution.height : 720;
        
        console.log("设计尺寸: " + designWidth + " x " + designHeight);
        
        // ==================== 创建背景 ====================
        this._createBackground(designWidth, designHeight);
        
        // ==================== 创建游戏入口按钮 ====================
        this._createGameButtons(designWidth, designHeight);
        
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
        cc.resources.load("login_rukou_bg", cc.SpriteFrame, function(err, spriteFrame) {
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
        graphics.fillColor = new cc.Color(25, 25, 112);
        graphics.rect(-width/2, -height/2, width, height);
        graphics.fill();
    },

    // 创建游戏入口按钮
    _createGameButtons: function(designWidth, designHeight) {
        var self = this;
        
        // 按钮容器 - 居中偏下
        var containerNode = new cc.Node("ButtonContainer");
        containerNode.setPosition(0, -20);
        containerNode.parent = this.node;
        containerNode.zIndex = 20;
        
        // 计算按钮间距（基于设计宽度适配）
        var buttonSpacing = designWidth * 0.22; // 间距约为设计宽度的22%
        var buttonSize = Math.min(200, designWidth * 0.15); // 按钮大小适配
        
        console.log("按钮间距: " + buttonSpacing + ", 按钮大小: " + buttonSize);
        
        // ========== 斗地主按钮 ==========
        var ddzButton = this._createImageButton(
            "entrance_doudizhu",
            buttonSize,
            function() {
                self._onDDZClick();
            }
        );
        ddzButton.setPosition(-buttonSpacing, 0);
        ddzButton.parent = containerNode;
        
        // ========== 农场按钮（预留）==========
        var farmButton = this._createImageButton(
            "entrance_farm",
            buttonSize,
            function() {
                self._onFarmClick();
            }
        );
        farmButton.setPosition(buttonSpacing, 0);
        farmButton.parent = containerNode;
        
        // 提示文字 - 斗地主
        var ddzTipNode = new cc.Node("DDZTip");
        ddzTipNode.setPosition(-buttonSpacing, -buttonSize/2 - 30);
        var ddzTipLabel = ddzTipNode.addComponent(cc.Label);
        ddzTipLabel.string = "斗地主";
        ddzTipLabel.fontSize = 28;
        ddzTipLabel.lineHeight = 36;
        ddzTipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        ddzTipLabel.fontFamily = "Arial, Microsoft YaHei";
        var ddzOutline = ddzTipNode.addComponent(cc.LabelOutline);
        ddzOutline.color = cc.color(0, 0, 0);
        ddzOutline.width = 2;
        ddzTipNode.color = cc.color(255, 200, 100);
        ddzTipNode.parent = containerNode;
        
        // 提示文字 - 农场
        var farmTipNode = new cc.Node("FarmTip");
        farmTipNode.setPosition(buttonSpacing, -buttonSize/2 - 30);
        var farmTipLabel = farmTipNode.addComponent(cc.Label);
        farmTipLabel.string = "农场 (敬请期待)";
        farmTipLabel.fontSize = 24;
        farmTipLabel.lineHeight = 32;
        farmTipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        farmTipLabel.fontFamily = "Arial, Microsoft YaHei";
        var farmOutline = farmTipNode.addComponent(cc.LabelOutline);
        farmOutline.color = cc.color(0, 0, 0);
        farmOutline.width = 2;
        farmTipNode.color = cc.color(150, 200, 150);
        farmTipNode.parent = containerNode;
    },

    // 创建图片按钮
    _createImageButton: function(imageName, size, clickHandler) {
        var self = this;
        
        var buttonNode = new cc.Node("ImageButton_" + imageName);
        buttonNode.setContentSize(size, size);
        
        // 添加Sprite组件
        var sprite = buttonNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.type = cc.Sprite.Type.SIMPLE;
        
        // 加载图片
        cc.resources.load(imageName, cc.SpriteFrame, function(err, spriteFrame) {
            if (err) {
                console.error("加载按钮图片失败:", imageName, err);
                // 失败时创建占位图形
                self._createPlaceholderButton(buttonNode, size);
                return;
            }
            sprite.spriteFrame = spriteFrame;
            console.log("按钮图片加载成功: " + imageName);
        });
        
        // 添加按钮组件
        var button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
        
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
    
    // 创建占位按钮（图片加载失败时使用）
    _createPlaceholderButton: function(buttonNode, size) {
        var graphics = buttonNode.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(100, 100, 100, 200);
        graphics.circle(0, 0, size/2);
        graphics.fill();
        graphics.strokeColor = new cc.Color(255, 255, 255, 150);
        graphics.lineWidth = 2;
        graphics.circle(0, 0, size/2);
        graphics.stroke();
    },

    // 创建玩家信息
    _createPlayerInfo: function(designWidth, designHeight) {
        var myglobal = window.myglobal;
        var playerData = myglobal ? myglobal.playerData : null;
        
        if (!playerData) return;
        
        // 玩家信息容器 - 左上角
        var infoNode = new cc.Node("PlayerInfo");
        infoNode.setPosition(-designWidth/2 + 120, designHeight/2 - 60);
        infoNode.parent = this.node;
        infoNode.zIndex = 30;
        
        // 玩家昵称
        var nicknameNode = new cc.Node("Nickname");
        nicknameNode.setPosition(0, 0);
        
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
        goldNode.setPosition(0, -35);
        
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
