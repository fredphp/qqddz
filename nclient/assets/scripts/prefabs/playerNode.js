/**
 * 玩家座位节点预制体脚本
 * 显示玩家信息、状态、手牌数量等
 */

// 抢地主状态
var QianState = window.QianState || {
    BU_QIANG: 0,
    QIANG: 1
};

cc.Class({
    extends: cc.Component,

    properties: {
        // 账号标签
        accountLabel: {
            type: cc.Label,
            default: null
        },
        
        // 昵称标签
        nicknameLabel: {
            type: cc.Label,
            default: null
        },
        
        // 金币标签
        goldCountLabel: {
            type: cc.Label,
            default: null
        },
        
        // 头像精灵
        headImage: {
            type: cc.Sprite,
            default: null
        },
        
        // 准备图标
        readyImage: {
            type: cc.Node,
            default: null
        },
        
        // 离线图标
        offlineImage: {
            type: cc.Node,
            default: null
        },
        
        // 手牌容器节点
        cardNode: {
            type: cc.Node,
            default: null
        },
        
        // 卡牌预制体
        cardPrefab: {
            type: cc.Prefab,
            default: null
        },
        
        // 时钟图标
        clockImage: {
            type: cc.Node,
            default: null
        },
        
        // 抢地主节点
        qiangDiZhuNode: {
            type: cc.Node,
            default: null
        },
        
        // 时间标签
        timeLabel: {
            type: cc.Label,
            default: null
        },
        
        // 抢地主图标
        robIconSp: {
            type: cc.Node,
            default: null
        },
        
        // 不抢图标
        robNoIconSp: {
            type: cc.Node,
            default: null
        },
        
        // 地主图标
        masterIcon: {
            type: cc.Node,
            default: null
        },
        
        // 抢地主精灵帧
        robImageSp: {
            type: cc.SpriteFrame,
            default: null
        },
        
        // 不抢精灵帧
        robNoImageSp: {
            type: cc.SpriteFrame,
            default: null
        }
    },

    // 玩家账号ID
    accountId: '',
    
    // 座位索引
    seatIndex: 0,
    
    // 手牌节点列表
    cardListNode: [],

    onLoad: function() {
        this.accountId = '';
        this.seatIndex = 0;
        this.cardListNode = [];
        
        // 初始化UI状态
        if (this.readyImage) this.readyImage.active = false;
        if (this.offlineImage) this.offlineImage.active = false;
        if (this.qiangDiZhuNode) this.qiangDiZhuNode.active = false;
        if (this.robIconSp) this.robIconSp.active = false;
        if (this.robNoIconSp) this.robNoIconSp.active = false;
        if (this.masterIcon) this.masterIcon.active = false;
        if (this.clockImage) this.clockImage.active = false;
        
        // 监听游戏开始事件
        this.node.on('gamestart_event', function(event) {
            if (this.readyImage) this.readyImage.active = false;
        }, this);

        // 监听发牌事件
        this.node.on('push_card_event', function(event) {
            var myglobal = window.myglobal;
            if (this.accountId === myglobal.playerData.id) {
                return;
            }
            this.pushCard();
        }, this);

        // 监听抢地主状态事件
        this.node.on('playernode_rob_state_event', function(event) {
            var detail = event;
            if (detail.accountId === this.accountId) {
                if (this.qiangDiZhuNode) this.qiangDiZhuNode.active = false;
            }

            if (this.accountId === detail.accountId) {
                if (detail.state === QianState.QIANG) {
                    if (this.robIconSp) this.robIconSp.active = true;
                } else if (detail.state === QianState.BU_QIANG) {
                    if (this.robNoIconSp) this.robNoIconSp.active = true;
                }
            }
        }, this);

        // 监听地主变更事件
        this.node.on('playernode_changemaster_event', function(event) {
            var detail = event;
            if (this.robIconSp) this.robIconSp.active = false;
            if (this.robNoIconSp) this.robNoIconSp.active = false;
            if (detail === this.accountId) {
                if (this.masterIcon) this.masterIcon.active = true;
            }
        }, this);
    },

    start: function() {
        // 空实现
    },

    /**
     * 初始化玩家数据
     * @param {Object} data - 玩家数据
     * @param {number} index - 座位索引
     */
    initData: function(data, index) {
        var myglobal = window.myglobal;
        
        cc.log('[PlayerNode] 初始化玩家数据:', JSON.stringify(data));
        
        this.accountId = data.accountid || data.id;
        this.seatIndex = index;
        
        // 更新UI显示
        if (this.accountLabel) {
            this.accountLabel.string = this.accountId;
        }
        
        if (this.nicknameLabel) {
            this.nicknameLabel.string = data.nick_name || data.name || '未知玩家';
        }
        
        if (this.goldCountLabel) {
            this.goldCountLabel.string = data.goldcount || data.coins || '0';
        }
        
        // 显示准备状态
        if (data.isready && this.readyImage) {
            this.readyImage.active = true;
        }
        
        // 加载头像
        if (data.avatarUrl && this.headImage) {
            var headImagePath = 'UI/headimage/' + data.avatarUrl;
            cc.loader.loadRes(headImagePath, cc.SpriteFrame, function(err, spriteFrame) {
                if (err) {
                    cc.warn('[PlayerNode] 加载头像失败:', err);
                    return;
                }
                if (this.headImage && this.headImage.isValid) {
                    this.headImage.spriteFrame = spriteFrame;
                }
            }.bind(this));
        }
        
        // 监听玩家准备通知
        this.node.on('player_ready_notify', function(event) {
            var detail = event;
            if (detail === this.accountId) {
                if (this.readyImage) this.readyImage.active = true;
            }
        }, this);

        // 监听可以抢地主事件
        this.node.on('playernode_canrob_event', function(event) {
            var detail = event;
            if (detail === this.accountId) {
                if (this.qiangDiZhuNode) this.qiangDiZhuNode.active = true;
                if (this.timeLabel) this.timeLabel.string = '10';
            }
        }, this);
        
        // 根据座位索引调整手牌位置
        if (index === 1 && this.cardNode) {
            this.cardNode.x = -this.cardNode.x - 30;
        }
    },

    /**
     * 显示手牌（背面）
     */
    pushCard: function() {
        if (!this.cardNode) return;
        
        this.cardNode.active = true;
        this.cardListNode = [];
        
        for (var i = 0; i < 17; i++) {
            var card = cc.instantiate(this.cardPrefab);
            card.scale = 0.6;
            card.parent = this.cardNode;
            
            var height = card.height;
            card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
            card.x = 0;
            
            this.cardListNode.push(card);
        }
    },

    /**
     * 更新手牌数量
     * @param {number} count - 手牌数量
     */
    updateCardCount: function(count) {
        // 移除多余的手牌节点
        while (this.cardListNode.length > count) {
            var card = this.cardListNode.pop();
            if (card) {
                card.removeFromParent(true);
            }
        }
    },

    /**
     * 设置准备状态
     * @param {boolean} ready - 是否准备
     */
    setReady: function(ready) {
        if (this.readyImage) {
            this.readyImage.active = ready;
        }
    },

    /**
     * 设置离线状态
     * @param {boolean} offline - 是否离线
     */
    setOffline: function(offline) {
        if (this.offlineImage) {
            this.offlineImage.active = offline;
        }
    },

    /**
     * 显示抢地主状态
     * @param {number} state - 抢地主状态
     */
    showRobState: function(state) {
        if (this.robIconSp) this.robIconSp.active = (state === QianState.QIANG);
        if (this.robNoIconSp) this.robNoIconSp.active = (state === QianState.BU_QIANG);
    },

    /**
     * 设置地主标识
     * @param {boolean} isMaster - 是否是地主
     */
    setMaster: function(isMaster) {
        if (this.masterIcon) {
            this.masterIcon.active = isMaster;
        }
    },

    /**
     * 显示时钟
     * @param {boolean} show - 是否显示
     */
    showClock: function(show) {
        if (this.clockImage) {
            this.clockImage.active = show;
        }
    },

    /**
     * 更新倒计时
     * @param {number} time - 剩余时间
     */
    updateTime: function(time) {
        if (this.timeLabel) {
            this.timeLabel.string = time.toString();
        }
    },

    /**
     * 获取账号ID
     * @returns {string} 账号ID
     */
    getAccountId: function() {
        return this.accountId;
    },

    /**
     * 获取座位索引
     * @returns {number} 座位索引
     */
    getSeatIndex: function() {
        return this.seatIndex;
    }
});
