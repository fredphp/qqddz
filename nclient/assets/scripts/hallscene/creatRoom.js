/**
 * 创建房间弹窗脚本
 * 处理房间创建逻辑，选择房间配置
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 房间配置选项
        roomRates: {
            default: [1, 2, 3, 4],
            type: [cc.Integer]
        },
        
        // 当前选择的倍率
        selectedRate: {
            default: 1,
            type: cc.Integer
        },
        
        // 等待节点预制体
        waitNodePrefab: {
            type: cc.Prefab,
            default: null
        }
    },

    // 等待节点
    _waitNode: null,
    
    // 节点是否有效
    _isValid: true,

    onLoad: function() {
        this._isValid = true;
        this.selectedRate = 1;
    },

    onDestroy: function() {
        this._isValid = false;
        
        // 移除等待节点
        if (this._waitNode && this._waitNode.isValid) {
            this._waitNode.destroy();
        }
    },

    start: function() {
        // 空实现
    },

    /**
     * 创建房间
     * @param {number} rate - 房间倍率
     */
    createRoom: function(rate) {
        var myglobal = window.myglobal;
        
        if (rate < 0 || rate > 4) {
            cc.error('[CreatRoom] 无效的房间倍率:', rate);
            return;
        }
        
        // 计算底分
        var baseScore = 0;
        if (rate === 1) {
            baseScore = 10;
        } else if (rate === 2) {
            baseScore = 20;
        } else if (rate === 3) {
            baseScore = 30;
        } else if (rate === 4) {
            baseScore = 40;
        }

        var roomPara = {
            baseScore: baseScore,
            rate: rate
        };
        
        cc.log('[CreatRoom] 创建房间, 倍率:', rate, '底分:', baseScore);
        
        // 显示等待动画
        this.showWaitNode('创建房间中...');
        
        // 发送创建房间请求
        if (myglobal && myglobal.socket) {
            myglobal.socket.requestCreatRoom(roomPara, function(err, result) {
                if (!this._isValid) return;
                
                this.hideWaitNode();
                
                if (err !== 0) {
                    cc.error('[CreatRoom] 创建房间失败:', err);
                    this.showToast('创建房间失败');
                    return;
                }
                
                cc.log('[CreatRoom] 创建房间成功:', JSON.stringify(result));
                
                // 更新玩家数据
                if (result) {
                    myglobal.playerData.bottom = result.bottom;
                    myglobal.playerData.rate = result.rate;
                }
                
                // 进入游戏场景
                cc.director.loadScene('gameScene');
            }.bind(this));
        } else {
            // 模拟创建房间
            this.hideWaitNode();
            
            // 生成房间ID
            var roomId = Math.floor(Math.random() * 900000) + 100000;
            
            // 更新房间数据
            if (myglobal) {
                myglobal.updateRoomData({
                    roomId: roomId.toString(),
                    ownerId: myglobal.playerData.id,
                    maxRounds: 5,
                    baseScore: baseScore,
                    rate: rate,
                    gameState: 'waiting'
                });
            }
            
            this.showToast('房间创建成功: ' + roomId);
            
            // 进入游戏场景
            setTimeout(function() {
                cc.director.loadScene('gameScene');
            }, 500);
        }
    },

    /**
     * 显示等待节点
     * @param {string} content - 提示内容
     */
    showWaitNode: function(content) {
        if (this.waitNodePrefab) {
            this._waitNode = cc.instantiate(this.waitNodePrefab);
            this._waitNode.parent = this.node;
            
            var waitNodeScript = this._waitNode.getComponent('waitNode');
            if (waitNodeScript) {
                waitNodeScript.show(content);
            }
        } else if (typeof myglobal !== 'undefined' && myglobal.showLoading) {
            myglobal.showLoading(content);
        }
    },

    /**
     * 隐藏等待节点
     */
    hideWaitNode: function() {
        if (this._waitNode && this._waitNode.isValid) {
            var waitNodeScript = this._waitNode.getComponent('waitNode');
            if (waitNodeScript) {
                waitNodeScript.hide();
            }
            this._waitNode.destroy();
            this._waitNode = null;
        } else if (typeof myglobal !== 'undefined' && myglobal.hideLoading) {
            myglobal.hideLoading();
        }
    },

    /**
     * 显示提示
     * @param {string} message - 提示信息
     */
    showToast: function(message) {
        if (typeof myglobal !== 'undefined' && myglobal.showToast) {
            myglobal.showToast(message);
        } else {
            cc.log('[CreatRoom] Toast:', message);
        }
    },

    /**
     * 按钮点击事件
     */
    onButtonClick: function(event, customData) {
        cc.log('[CreatRoom] 按钮点击:', customData);
        
        switch (customData) {
            case 'create_room_1':
                this.createRoom(1);
                break;
            case 'create_room_2':
                this.createRoom(2);
                break;
            case 'create_room_3':
                this.createRoom(3);
                break;
            case 'create_room_4':
                this.createRoom(4);
                break;
            case 'create_room_close':
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
