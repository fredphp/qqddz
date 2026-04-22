/**
 * 大厅场景控制器
 * 处理房间创建、加入、玩家信息显示等功能
 */

var HallScene = cc.Class({
    extends: cc.Component,

    properties: {
        // 玩家信息节点
        playerInfoNode: {
            default: null,
            type: cc.Node
        },

        // 玩家名称标签
        playerNameLabel: {
            default: null,
            type: cc.Label
        },

        // 玩家金币标签
        playerCoinsLabel: {
            default: null,
            type: cc.Label
        },

        // 玩家钻石标签
        playerDiamondsLabel: {
            default: null,
            type: cc.Label
        },

        // 玩家等级标签
        playerLevelLabel: {
            default: null,
            type: cc.Label
        },

        // 玩家头像
        playerAvatar: {
            default: null,
            type: cc.Sprite
        },

        // 创建房间按钮
        createRoomBtn: {
            default: null,
            type: cc.Node
        },

        // 加入房间按钮
        joinRoomBtn: {
            default: null,
            type: cc.Node
        },

        // 设置按钮
        settingsBtn: {
            default: null,
            type: cc.Node
        },

        // 退出按钮
        logoutBtn: {
            default: null,
            type: cc.Node
        },

        // 创建房间弹窗预制体
        createRoomPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 加入房间弹窗预制体
        joinRoomPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 房间列表节点
        roomListNode: {
            default: null,
            type: cc.Node
        },

        // 房间列表项预制体
        roomItemPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 加载节点
        loadingNode: {
            default: null,
            type: cc.Node
        }
    },

    // Socket管理器
    _socket: null,

    // 玩家数据
    _playerData: null,

    // 是否正在匹配
    _isMatching: false,

    onLoad: function() {
        cc.log('[HallScene] onLoad');

        // 初始化UI
        this.initUI();

        // 绑定事件
        this.bindEvents();

        // 初始化Socket连接
        this.initSocket();

        // 加载玩家数据
        this.loadPlayerData();
    },

    start: function() {
        cc.log('[HallScene] start');

        // 播放背景音乐
        this.playBgMusic();
    },

    onDestroy: function() {
        cc.log('[HallScene] onDestroy');

        // 取消事件监听
        this.unbindEvents();
    },

    /**
     * 初始化UI
     */
    initUI: function() {
        // 隐藏加载节点
        if (this.loadingNode) {
            this.loadingNode.active = false;
        }
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        var self = this;

        // 创建房间按钮
        if (this.createRoomBtn) {
            this.createRoomBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onCreateRoomClick();
            }, this);
        }

        // 加入房间按钮
        if (this.joinRoomBtn) {
            this.joinRoomBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onJoinRoomClick();
            }, this);
        }

        // 设置按钮
        if (this.settingsBtn) {
            this.settingsBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onSettingsClick();
            }, this);
        }

        // 退出按钮
        if (this.logoutBtn) {
            this.logoutBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onLogoutClick();
            }, this);
        }
    },

    /**
     * 取消事件绑定
     */
    unbindEvents: function() {
        // 取消Socket事件监听
        if (this._socket) {
            this._socket.off('room_update', this.onRoomUpdate, this);
            this._socket.off('game_start', this.onGameStart, this);
        }
    },

    /**
     * 初始化Socket连接
     */
    initSocket: function() {
        var self = this;

        // 获取Socket管理器实例
        if (typeof SocketManager !== 'undefined') {
            this._socket = SocketManager.getInstance();

            // 注册事件监听
            this._socket.on('room_update', this.onRoomUpdate, this);
            this._socket.on('game_start', this.onGameStart, this);

            // 检查连接状态
            if (!this._socket.isConnected()) {
                var url = typeof myglobal !== 'undefined' ? myglobal.getServerUrl() : null;
                if (url) {
                    this._socket.connect(url, function(success, message) {
                        if (success) {
                            cc.log('[HallScene] Socket连接成功');
                        } else {
                            cc.log('[HallScene] Socket连接失败:', message);
                        }
                    });
                }
            }
        }
    },

    /**
     * 加载玩家数据
     */
    loadPlayerData: function() {
        if (typeof myglobal !== 'undefined') {
            this._playerData = myglobal.playerData;
            this.updatePlayerUI();
        }
    },

    /**
     * 更新玩家UI
     */
    updatePlayerUI: function() {
        if (!this._playerData) return;

        // 更新名称
        if (this.playerNameLabel) {
            this.playerNameLabel.string = this._playerData.name || '未知玩家';
        }

        // 更新金币
        if (this.playerCoinsLabel) {
            this.playerCoinsLabel.string = this.formatNumber(this._playerData.coins || 0);
        }

        // 更新钻石
        if (this.playerDiamondsLabel) {
            this.playerDiamondsLabel.string = this.formatNumber(this._playerData.diamonds || 0);
        }

        // 更新等级
        if (this.playerLevelLabel) {
            this.playerLevelLabel.string = 'Lv.' + (this._playerData.level || 1);
        }
    },

    /**
     * 格式化数字
     */
    formatNumber: function(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    },

    /**
     * 创建房间按钮点击
     */
    onCreateRoomClick: function() {
        cc.log('[HallScene] 创建房间按钮点击');

        // 播放音效
        this.playClickSound();

        if (this.createRoomPrefab) {
            var dialog = cc.instantiate(this.createRoomPrefab);
            this.node.addChild(dialog);
        } else {
            // 创建简单的创建房间弹窗
            this.createSimpleCreateRoomDialog();
        }
    },

    /**
     * 创建简单的创建房间弹窗
     */
    createSimpleCreateRoomDialog: function() {
        var self = this;

        // 创建遮罩层
        var mask = new cc.Node('Mask');
        mask.color = cc.color(0, 0, 0, 180);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.type = cc.Sprite.Type.SLICED;
        mask.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
        mask.opacity = 0;
        mask.runAction(cc.fadeIn(0.2));
        mask.zIndex = 100;

        // 点击遮罩关闭
        mask.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });

        // 创建弹窗背景
        var dialog = new cc.Node('Dialog');
        dialog.color = cc.color(255, 255, 255, 255);
        var dialogSprite = dialog.addComponent(cc.Sprite);
        dialogSprite.type = cc.Sprite.Type.SLICED;
        dialog.setContentSize(500, 350);
        dialog.zIndex = 101;

        // 创建标题
        var title = new cc.Node('Title');
        var titleLabel = title.addComponent(cc.Label);
        titleLabel.string = '创建房间';
        titleLabel.fontSize = 32;
        titleLabel.lineHeight = 40;
        title.y = 130;
        dialog.addChild(title);

        // 创建局数选择
        var roundLabel = new cc.Node('RoundLabel');
        var roundLabelText = roundLabel.addComponent(cc.Label);
        roundLabelText.string = '局数：';
        roundLabelText.fontSize = 24;
        roundLabel.y = 60;
        roundLabel.x = -150;
        dialog.addChild(roundLabel);

        // 创建局数选项
        var rounds = [5, 10, 15, 20];
        var selectedRound = 5;
        for (var i = 0; i < rounds.length; i++) {
            (function(index) {
                var btn = new cc.Node('RoundBtn' + rounds[index]);
                var btnLabel = btn.addComponent(cc.Label);
                btnLabel.string = rounds[index] + '局';
                btnLabel.fontSize = 20;
                btn.x = -50 + index * 80;
                btn.y = 60;
                btn.on(cc.Node.EventType.TOUCH_END, function() {
                    selectedRound = rounds[index];
                    cc.log('[HallScene] 选择局数:', selectedRound);
                });
                dialog.addChild(btn);
            })(i);
        }

        // 创建底分选择
        var baseScoreLabel = new cc.Node('BaseScoreLabel');
        var baseScoreLabelText = baseScoreLabel.addComponent(cc.Label);
        baseScoreLabelText.string = '底分：';
        baseScoreLabelText.fontSize = 24;
        baseScoreLabel.y = 10;
        baseScoreLabel.x = -150;
        dialog.addChild(baseScoreLabel);

        // 创建底分选项
        var baseScores = [100, 200, 500, 1000];
        var selectedBaseScore = 100;
        for (var i = 0; i < baseScores.length; i++) {
            (function(index) {
                var btn = new cc.Node('BaseScoreBtn' + baseScores[index]);
                var btnLabel = btn.addComponent(cc.Label);
                btnLabel.string = baseScores[index];
                btnLabel.fontSize = 20;
                btn.x = -50 + index * 80;
                btn.y = 10;
                btn.on(cc.Node.EventType.TOUCH_END, function() {
                    selectedBaseScore = baseScores[index];
                    cc.log('[HallScene] 选择底分:', selectedBaseScore);
                });
                dialog.addChild(btn);
            })(i);
        }

        // 创建确认按钮
        var confirmBtn = new cc.Node('ConfirmBtn');
        var confirmLabel = confirmBtn.addComponent(cc.Label);
        confirmLabel.string = '确认创建';
        confirmLabel.fontSize = 24;
        confirmBtn.y = -80;
        confirmBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
            self.doCreateRoom(selectedRound, selectedBaseScore);
        });
        dialog.addChild(confirmBtn);

        // 创建取消按钮
        var cancelBtn = new cc.Node('CancelBtn');
        var cancelLabel = cancelBtn.addComponent(cc.Label);
        cancelLabel.string = '取消';
        cancelLabel.fontSize = 24;
        cancelBtn.y = -80;
        cancelBtn.x = 100;
        cancelBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });
        dialog.addChild(cancelBtn);

        // 添加到场景
        mask.addChild(dialog);
        this.node.addChild(mask);
    },

    /**
     * 执行创建房间
     */
    doCreateRoom: function(rounds, baseScore) {
        var self = this;

        cc.log('[HallScene] 创建房间 rounds:', rounds, 'baseScore:', baseScore);

        this.showLoading('创建房间中...');

        // 模拟创建房间
        setTimeout(function() {
            self.hideLoading();

            // 生成房间ID
            var roomId = Math.floor(Math.random() * 900000) + 100000;

            // 更新房间数据
            if (typeof myglobal !== 'undefined') {
                myglobal.updateRoomData({
                    roomId: roomId.toString(),
                    ownerId: myglobal.playerData.id,
                    maxRounds: rounds,
                    baseScore: baseScore,
                    gameState: 'waiting'
                });
            }

            self.showToast('房间创建成功: ' + roomId);

            // 进入游戏场景
            setTimeout(function() {
                self.enterGame();
            }, 1000);

        }, 1000);
    },

    /**
     * 加入房间按钮点击
     */
    onJoinRoomClick: function() {
        cc.log('[HallScene] 加入房间按钮点击');

        // 播放音效
        this.playClickSound();

        if (this.joinRoomPrefab) {
            var dialog = cc.instantiate(this.joinRoomPrefab);
            this.node.addChild(dialog);
        } else {
            // 创建简单的加入房间弹窗
            this.createSimpleJoinRoomDialog();
        }
    },

    /**
     * 创建简单的加入房间弹窗
     */
    createSimpleJoinRoomDialog: function() {
        var self = this;
        var roomIdInput = '';

        // 创建遮罩层
        var mask = new cc.Node('Mask');
        mask.color = cc.color(0, 0, 0, 180);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.type = cc.Sprite.Type.SLICED;
        mask.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
        mask.opacity = 0;
        mask.runAction(cc.fadeIn(0.2));
        mask.zIndex = 100;

        // 点击遮罩关闭
        mask.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });

        // 创建弹窗背景
        var dialog = new cc.Node('Dialog');
        dialog.color = cc.color(255, 255, 255, 255);
        var dialogSprite = dialog.addComponent(cc.Sprite);
        dialogSprite.type = cc.Sprite.Type.SLICED;
        dialog.setContentSize(500, 300);
        dialog.zIndex = 101;

        // 创建标题
        var title = new cc.Node('Title');
        var titleLabel = title.addComponent(cc.Label);
        titleLabel.string = '加入房间';
        titleLabel.fontSize = 32;
        titleLabel.lineHeight = 40;
        title.y = 100;
        dialog.addChild(title);

        // 创建房间号输入提示
        var inputLabel = new cc.Node('InputLabel');
        var inputLabelText = inputLabel.addComponent(cc.Label);
        inputLabelText.string = '请输入房间号：';
        inputLabelText.fontSize = 24;
        inputLabel.y = 30;
        dialog.addChild(inputLabel);

        // 创建输入框背景
        var inputBg = new cc.Node('InputBg');
        inputBg.color = cc.color(240, 240, 240);
        var inputBgSprite = inputBg.addComponent(cc.Sprite);
        inputBgSprite.type = cc.Sprite.Type.SLICED;
        inputBg.setContentSize(300, 50);
        inputBg.y = -20;
        dialog.addChild(inputBg);

        // 创建输入框显示
        var inputDisplay = new cc.Node('InputDisplay');
        var inputDisplayLabel = inputDisplay.addComponent(cc.Label);
        inputDisplayLabel.string = '';
        inputDisplayLabel.fontSize = 28;
        inputDisplay.y = -20;
        dialog.addChild(inputDisplay);

        // 创建数字键盘（简化版）
        var keyboardY = -100;
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                (function(num) {
                    var btn = new cc.Node('NumBtn' + num);
                    var btnLabel = btn.addComponent(cc.Label);
                    btnLabel.string = (num + 1).toString();
                    btnLabel.fontSize = 28;
                    btn.x = -80 + col * 80;
                    btn.y = keyboardY - row * 40;
                    btn.on(cc.Node.EventType.TOUCH_END, function() {
                        if (roomIdInput.length < 6) {
                            roomIdInput += (num + 1);
                            inputDisplayLabel.string = roomIdInput;
                        }
                    });
                    dialog.addChild(btn);
                })(row * 3 + col);
            }
        }

        // 删除按钮
        var deleteBtn = new cc.Node('DeleteBtn');
        var deleteLabel = deleteBtn.addComponent(cc.Label);
        deleteLabel.string = '删除';
        deleteLabel.fontSize = 24;
        deleteBtn.x = 160;
        deleteBtn.y = keyboardY - 40;
        deleteBtn.on(cc.Node.EventType.TOUCH_END, function() {
            roomIdInput = roomIdInput.slice(0, -1);
            inputDisplayLabel.string = roomIdInput;
        });
        dialog.addChild(deleteBtn);

        // 确认按钮
        var confirmBtn = new cc.Node('ConfirmBtn');
        var confirmLabel = confirmBtn.addComponent(cc.Label);
        confirmLabel.string = '确认加入';
        confirmLabel.fontSize = 24;
        confirmBtn.y = -220;
        confirmBtn.x = -80;
        confirmBtn.on(cc.Node.EventType.TOUCH_END, function() {
            if (roomIdInput.length === 6) {
                self.closeDialog(mask);
                self.doJoinRoom(roomIdInput);
            } else {
                self.showToast('请输入6位房间号');
            }
        });
        dialog.addChild(confirmBtn);

        // 取消按钮
        var cancelBtn = new cc.Node('CancelBtn');
        var cancelLabel = cancelBtn.addComponent(cc.Label);
        cancelLabel.string = '取消';
        cancelLabel.fontSize = 24;
        cancelBtn.y = -220;
        cancelBtn.x = 80;
        cancelBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });
        dialog.addChild(cancelBtn);

        // 添加到场景
        mask.addChild(dialog);
        this.node.addChild(mask);
    },

    /**
     * 执行加入房间
     */
    doJoinRoom: function(roomId) {
        var self = this;

        cc.log('[HallScene] 加入房间:', roomId);

        this.showLoading('加入房间中...');

        // 模拟加入房间
        setTimeout(function() {
            self.hideLoading();

            // 模拟加入成功
            if (typeof myglobal !== 'undefined') {
                myglobal.updateRoomData({
                    roomId: roomId,
                    gameState: 'waiting'
                });
            }

            self.showToast('加入房间成功');

            // 进入游戏场景
            setTimeout(function() {
                self.enterGame();
            }, 1000);

        }, 1000);
    },

    /**
     * 设置按钮点击
     */
    onSettingsClick: function() {
        cc.log('[HallScene] 设置按钮点击');
        this.showToast('设置功能开发中');
    },

    /**
     * 退出按钮点击
     */
    onLogoutClick: function() {
        cc.log('[HallScene] 退出按钮点击');

        // 清除玩家数据
        if (typeof myglobal !== 'undefined') {
            myglobal.resetPlayerData();
            myglobal.removeLocalData(GameConfig.STORAGE_KEYS.USER_TOKEN);
            myglobal.removeLocalData(GameConfig.STORAGE_KEYS.USER_INFO);
        }

        // 返回登录场景
        cc.director.loadScene('loginScene');
    },

    /**
     * 房间更新回调
     */
    onRoomUpdate: function(data) {
        cc.log('[HallScene] 房间更新:', JSON.stringify(data));

        if (typeof myglobal !== 'undefined') {
            myglobal.updateRoomData(data);
        }
    },

    /**
     * 游戏开始回调
     */
    onGameStart: function(data) {
        cc.log('[HallScene] 游戏开始:', JSON.stringify(data));

        this.showToast('游戏即将开始');

        // 进入游戏场景
        this.enterGame();
    },

    /**
     * 进入游戏场景
     */
    enterGame: function() {
        cc.log('[HallScene] 进入游戏场景');
        cc.director.loadScene('gameScene');
    },

    /**
     * 关闭弹窗
     */
    closeDialog: function(mask) {
        mask.runAction(cc.sequence(
            cc.fadeOut(0.2),
            cc.callFunc(function() {
                mask.removeFromParent(true);
            })
        ));
    },

    /**
     * 显示提示
     */
    showToast: function(message) {
        if (typeof myglobal !== 'undefined' && myglobal.showToast) {
            myglobal.showToast(message);
        } else {
            cc.log('[HallScene] Toast:', message);
        }
    },

    /**
     * 显示加载
     */
    showLoading: function(message) {
        if (this.loadingNode) {
            this.loadingNode.active = true;
        }

        if (typeof myglobal !== 'undefined' && myglobal.showLoading) {
            myglobal.showLoading(message);
        }
    },

    /**
     * 隐藏加载
     */
    hideLoading: function() {
        if (this.loadingNode) {
            this.loadingNode.active = false;
        }

        if (typeof myglobal !== 'undefined' && myglobal.hideLoading) {
            myglobal.hideLoading();
        }
    },

    /**
     * 播放点击音效
     */
    playClickSound: function() {
        // 暂时注释，需要音频资源
        // cc.audioEngine.playEffect('resources/sound/click.mp3', false);
    },

    /**
     * 播放背景音乐
     */
    playBgMusic: function() {
        // 暂时注释，需要音频资源
        // cc.audioEngine.playMusic('resources/sound/bg.mp3', true);
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HallScene;
}
