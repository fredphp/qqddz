/**
 * 加入房间弹窗脚本
 * 处理房间号输入和加入房间逻辑
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 房间号输入框标签数组
        joinIdLabels: {
            type: [cc.Label],
            default: []
        },
        
        // 等待节点预制体
        waitNodePrefab: {
            type: cc.Prefab,
            default: null
        }
    },

    // 输入的房间号
    joinId: '',
    
    // 当前输入位置
    curInputCount: -1,
    
    // 等待节点
    _waitNode: null,
    
    // 节点是否有效
    _isValid: true,

    onLoad: function() {
        this.joinId = '';
        this.curInputCount = -1;
        this._isValid = true;
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
     * 加入房间
     * @param {string} roomId - 房间号
     */
    joinRoom: function(roomId) {
        var myglobal = window.myglobal;
        
        cc.log('[JoinRoom] 加入房间:', roomId);
        
        // 显示等待动画
        this.showWaitNode('加入房间中...');
        
        var roomPara = {
            roomid: roomId
        };
        
        // 发送加入房间请求
        if (myglobal && myglobal.socket) {
            myglobal.socket.requestJoin(roomPara, function(err, result) {
                if (!this._isValid) return;
                
                this.hideWaitNode();
                
                if (err) {
                    cc.error('[JoinRoom] 加入房间失败:', err);
                    this.showToast('加入房间失败');
                    return;
                }
                
                cc.log('[JoinRoom] 加入房间成功:', JSON.stringify(result));
                
                // 更新玩家数据
                if (result) {
                    myglobal.playerData.bottom = result.bottom;
                    myglobal.playerData.rate = result.rate;
                }
                
                // 进入游戏场景
                cc.director.loadScene('gameScene');
            }.bind(this));
        } else {
            // 模拟加入房间
            this.hideWaitNode();
            
            // 更新房间数据
            if (myglobal) {
                myglobal.updateRoomData({
                    roomId: roomId,
                    gameState: 'waiting'
                });
            }
            
            this.showToast('加入房间成功');
            
            // 进入游戏场景
            setTimeout(function() {
                cc.director.loadScene('gameScene');
            }, 500);
        }
    },

    /**
     * 输入数字
     * @param {string} num - 数字字符
     */
    inputNumber: function(num) {
        if (this.joinId.length >= 6) {
            return;
        }
        
        this.joinId += num;
        this.curInputCount++;
        
        // 更新显示
        if (this.joinIdLabels && this.joinIdLabels.length > this.curInputCount) {
            this.joinIdLabels[this.curInputCount].string = num;
        }
        
        cc.log('[JoinRoom] 输入数字:', num, '当前房间号:', this.joinId);
        
        // 如果输入满6位，自动加入房间
        if (this.joinId.length >= 6) {
            this.joinRoom(this.joinId);
        }
    },

    /**
     * 删除最后一位
     */
    deleteLastInput: function() {
        if (this.curInputCount < 0) {
            return;
        }
        
        // 清除显示
        if (this.joinIdLabels && this.joinIdLabels.length > this.curInputCount) {
            this.joinIdLabels[this.curInputCount].string = '';
        }
        
        this.curInputCount--;
        this.joinId = this.joinId.substring(0, this.joinId.length - 1);
        
        cc.log('[JoinRoom] 删除最后一位, 当前房间号:', this.joinId);
    },

    /**
     * 清空输入
     */
    clearInput: function() {
        // 清除所有显示
        for (var i = 0; i < this.joinIdLabels.length; i++) {
            this.joinIdLabels[i].string = '';
        }
        
        this.joinId = '';
        this.curInputCount = -1;
        
        cc.log('[JoinRoom] 清空输入');
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
            cc.log('[JoinRoom] Toast:', message);
        }
    },

    /**
     * 按钮点击事件
     */
    onButtonClick: function(event, customData) {
        cc.log('[JoinRoom] 按钮点击:', customData);
        
        // 数字按钮（单个字符）
        if (customData.length === 1 && !isNaN(parseInt(customData))) {
            this.inputNumber(customData);
            return;
        }
        
        switch (customData) {
            case 'back':
                this.deleteLastInput();
                break;
            case 'clear':
                this.clearInput();
                break;
            case 'close':
                this.node.destroy();
                break;
            case 'confirm':
                if (this.joinId.length === 6) {
                    this.joinRoom(this.joinId);
                } else {
                    this.showToast('请输入6位房间号');
                }
                break;
            default:
                break;
        }
    }
});
