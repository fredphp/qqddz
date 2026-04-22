/**
 * 游戏准备阶段UI脚本
 * 处理游戏开始前的准备状态、开始按钮等
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 准备按钮
        btnReady: {
            type: cc.Node,
            default: null
        },
        
        // 开始游戏按钮
        btnGameStart: {
            type: cc.Node,
            default: null
        },
        
        // 返回大厅按钮
        btnBackToHall: {
            type: cc.Node,
            default: null
        },
        
        // 房间号标签
        roomIdLabel: {
            type: cc.Label,
            default: null
        },
        
        // 房主信息标签
        houseOwnerLabel: {
            type: cc.Label,
            default: null
        }
    },

    // 节点是否有效
    _isValid: true,

    onLoad: function() {
        var myglobal = window.myglobal;
        
        this._isValid = true;
        
        if (!myglobal) {
            cc.error('[GameBeforeUI] myglobal 未定义');
            return;
        }

        // 初始隐藏按钮
        if (this.btnGameStart) this.btnGameStart.active = false;
        if (this.btnReady) this.btnReady.active = false;
        
        // 更新房间信息
        this.updateRoomInfo();

        // 监听初始化事件
        this.node.on('init', function() {
            cc.log('[GameBeforeUI] 初始化');
            this.updateButtons();
        }, this);

        // 监听房主变更消息
        if (myglobal.socket) {
            myglobal.socket.onChangeHouseManage(function(data) {
                cc.log('[GameBeforeUI] 房主变更:', JSON.stringify(data));
                myglobal.playerData.houseManageId = data;
                this.updateButtons();
            }.bind(this));
        }
        
        // 监听玩家加入
        this.node.on('player_join', function(data) {
            cc.log('[GameBeforeUI] 玩家加入:', JSON.stringify(data));
        }, this);
        
        // 监听玩家离开
        this.node.on('player_leave', function(data) {
            cc.log('[GameBeforeUI] 玩家离开:', JSON.stringify(data));
        }, this);
    },

    onDestroy: function() {
        this._isValid = false;
    },

    start: function() {
        // 触发初始化
        this.node.emit('init');
    },

    /**
     * 更新房间信息
     */
    updateRoomInfo: function() {
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.roomData) return;
        
        // 更新房间号
        if (this.roomIdLabel) {
            this.roomIdLabel.string = '房间号: ' + (myglobal.roomData.roomId || '');
        }
        
        // 更新房主信息
        if (this.houseOwnerLabel) {
            var houseOwnerName = myglobal.roomData.ownerName || '房主';
            this.houseOwnerLabel.string = '房主: ' + houseOwnerName;
        }
    },

    /**
     * 更新按钮状态
     */
    updateButtons: function() {
        var myglobal = window.myglobal;
        
        if (!myglobal || !myglobal.playerData) return;
        
        var isOwner = (myglobal.playerData.houseManageId === myglobal.playerData.id);
        
        cc.log('[GameBeforeUI] 更新按钮状态, 是否房主:', isOwner);
        
        if (isOwner) {
            // 房主显示开始按钮
            if (this.btnGameStart) this.btnGameStart.active = true;
            if (this.btnReady) this.btnReady.active = false;
        } else {
            // 非房主显示准备按钮
            if (this.btnGameStart) this.btnGameStart.active = false;
            if (this.btnReady) this.btnReady.active = true;
        }
    },

    /**
     * 显示准备按钮
     */
    showReadyButton: function() {
        if (this.btnReady) this.btnReady.active = true;
        if (this.btnGameStart) this.btnGameStart.active = false;
    },

    /**
     * 显示开始按钮
     */
    showStartButton: function() {
        if (this.btnReady) this.btnReady.active = false;
        if (this.btnGameStart) this.btnGameStart.active = true;
    },

    /**
     * 隐藏所有按钮
     */
    hideAllButtons: function() {
        if (this.btnReady) this.btnReady.active = false;
        if (this.btnGameStart) this.btnGameStart.active = false;
    },

    /**
     * 显示提示
     * @param {string} message - 提示信息
     */
    showToast: function(message) {
        if (typeof myglobal !== 'undefined' && myglobal.showToast) {
            myglobal.showToast(message);
        } else {
            cc.log('[GameBeforeUI] Toast:', message);
        }
    },

    /**
     * 按钮点击事件
     */
    onButtonClick: function(event, customData) {
        var myglobal = window.myglobal;
        
        cc.log('[GameBeforeUI] 按钮点击:', customData);
        
        switch (customData) {
            case 'btn_ready':
                cc.log('[GameBeforeUI] 准备按钮点击');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestReady();
                }
                this.hideAllButtons();
                break;
                
            case 'btn_start':
                cc.log('[GameBeforeUI] 开始按钮点击');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestStart(function(err, data) {
                        if (err !== 0) {
                            cc.error('[GameBeforeUI] 开始游戏失败:', err);
                            this.showToast('开始游戏失败');
                            return;
                        }
                        cc.log('[GameBeforeUI] 开始游戏成功:', JSON.stringify(data));
                    }.bind(this));
                } else {
                    // 模拟开始游戏
                    this.showToast('游戏即将开始');
                    cc.director.loadScene('gameScene');
                }
                break;
                
            case 'btn_back':
                cc.log('[GameBeforeUI] 返回大厅按钮点击');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestLeaveRoom();
                }
                if (myglobal) {
                    myglobal.resetRoomData();
                }
                cc.director.loadScene('hallScene');
                break;
                
            default:
                break;
        }
    }
});
