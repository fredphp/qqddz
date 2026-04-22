/**
 * 游戏进行中UI脚本
 * 处理游戏过程中的UI交互、发牌、抢地主、出牌等
 */

// 抢地主状态
var QianState = window.QianState || {
    BU_QIANG: 0,
    QIANG: 1
};

// 是否开启音效
var isOpenSound = window.isOpenSound || 1;

cc.Class({
    extends: cc.Component,

    properties: {
        // 抢地主UI
        robUI: {
            type: cc.Node,
            default: null
        },
        
        // 出牌UI
        playingUI: {
            type: cc.Node,
            default: null
        },
        
        // 卡牌预制体
        cardPrefab: {
            type: cc.Prefab,
            default: null
        },
        
        // 底牌位置节点
        bottomCardPosNode: {
            type: cc.Node,
            default: null
        },
        
        // 提示标签
        tipsLabel: {
            type: cc.Label,
            default: null
        },
        
        // 倍数标签
        multipleLabel: {
            type: cc.Label,
            default: null
        },
        
        // 当前出牌玩家标签
        currentPlayerLabel: {
            type: cc.Label,
            default: null
        }
    },

    // 自己的牌节点列表
    cardsNodes: [],
    
    // 卡牌宽度
    cardWidth: 0,
    
    // 当前可以抢地主的玩家ID
    robPlayerAccountId: '',
    
    // 发牌是否结束
    faPaiEnd: false,
    
    // 底牌节点
    bottomCards: [],
    
    // 底牌数据
    bottomCardData: [],
    
    // 选中的牌数据
    chooseCardData: [],
    
    // 出牌区数据
    outCardZone: [],
    
    // 临时发牌列表
    pushCardTmp: [],
    
    // 卡牌数据
    cardData: null,
    
    // 当前发牌索引
    curIndexCard: 0,
    
    // 当前倍数
    currentMultiple: 1,
    
    // 节点是否有效
    _isValid: true,

    onLoad: function() {
        var myglobal = window.myglobal;
        
        this._isValid = true;
        this.cardsNodes = [];
        this.bottomCards = [];
        this.bottomCardData = [];
        this.chooseCardData = [];
        this.outCardZone = [];
        this.pushCardTmp = [];
        this.faPaiEnd = false;
        this.currentMultiple = 1;
        
        if (!myglobal) {
            cc.error('[GameInUI] myglobal 未定义');
            return;
        }
        
        // 初始隐藏UI
        if (this.robUI) this.robUI.active = false;
        if (this.playingUI) this.playingUI.active = false;
        
        // 监听服务器：下发牌消息
        if (myglobal.socket) {
            myglobal.socket.onPushCards(function(data) {
                cc.log('[GameInUI] 收到发牌:', JSON.stringify(data));
                this.cardData = data;
                this.curIndexCard = data.length - 1;
                this.pushCard(data);
                this.scheduleOnce(this.runActivePushCard.bind(this), 0.3);
                this.node.parent.emit('pushcard_other_event');
            }.bind(this));

            // 监听服务器：通知抢地主消息
            myglobal.socket.onCanRobState(function(data) {
                cc.log('[GameInUI] 收到抢地主通知:', JSON.stringify(data));
                this.robPlayerAccountId = data;
                if (data === myglobal.playerData.id && this.faPaiEnd) {
                    if (this.robUI) this.robUI.active = true;
                }
            }.bind(this));
            
            // 监听服务器：可以出牌消息
            myglobal.socket.onCanChuCard(function(data) {
                cc.log('[GameInUI] 可以出牌:', data);
                if (data === myglobal.playerData.id) {
                    this.clearOutZone(myglobal.playerData.id);
                    if (this.playingUI) this.playingUI.active = true;
                }
            }.bind(this));

            // 监听服务器：其他玩家出牌消息
            myglobal.socket.onOtherPlayerChuCard(function(data) {
                cc.log('[GameInUI] 其他玩家出牌:', JSON.stringify(data));
                var accountId = data.accountid;
                var gameScene = this.node.parent.getComponent('gameScene');
                if (!gameScene) return;
                
                var outCardNode = gameScene.getUserOutCardPosByAccount(accountId);
                if (!outCardNode) return;

                var nodeCards = [];
                for (var i = 0; i < data.cards.length; i++) {
                    var card = cc.instantiate(this.cardPrefab);
                    var cardScript = card.getComponent('card');
                    if (cardScript) {
                        cardScript.showCards(data.cards[i], myglobal.playerData.id);
                    }
                    nodeCards.push(card);
                }
                this.appendOtherCardsToOutZone(outCardNode, nodeCards, 0);
            }.bind(this));
        }

        // 内部事件：显示底牌事件
        this.node.on('show_bottom_card_event', function(data) {
            cc.log('[GameInUI] 显示底牌:', data);
            this.bottomCardData = data;
            this.showBottomCards(data);
        }.bind(this));

        // 注册监听选择牌消息
        this.node.on('choose_card_event', function(event) {
            cc.log('[GameInUI] 选择牌:', JSON.stringify(event));
            this.chooseCardData.push(event);
        }.bind(this));

        this.node.on('unchoose_card_event', function(event) {
            cc.log('[GameInUI] 取消选择牌:', event);
            for (var i = 0; i < this.chooseCardData.length; i++) {
                if (this.chooseCardData[i].cardId === event) {
                    this.chooseCardData.splice(i, 1);
                    break;
                }
            }
        }.bind(this));
    },

    onDestroy: function() {
        this._isValid = false;
    },

    start: function() {
        // 空实现
    },

    /**
     * 处理发牌动画效果
     */
    runActivePushCard: function() {
        var myglobal = window.myglobal;
        
        if (this.curIndexCard < 0) {
            cc.log('[GameInUI] 发牌结束');
            this.faPaiEnd = true;
            
            if (this.robPlayerAccountId === myglobal.playerData.id) {
                if (this.robUI) this.robUI.active = true;
            }
            
            this.node.parent.emit('canrob_event', this.robPlayerAccountId);
            return;
        }

        var moveNode = this.cardsNodes[this.cardsNodes.length - this.curIndexCard - 1];
        moveNode.active = true;
        this.pushCardTmp.push(moveNode);
        
        // 播放发牌音效
        if (isOpenSound) {
            // cc.audioEngine.play(cc.url.raw('resources/sound/fapai1.mp3'));
        }
        
        // 移动已发的牌
        for (var i = 0; i < this.pushCardTmp.length - 1; i++) {
            var node = this.pushCardTmp[i];
            var newX = node.x - (this.cardWidth * 0.4);
            node.runAction(cc.moveTo(0.1, cc.v2(newX, -250)));
        }
        
        this.curIndexCard--;
        this.scheduleOnce(this.runActivePushCard.bind(this), 0.3);
    },

    /**
     * 对牌排序
     */
    sortCards: function() {
        this.cardsNodes.sort(function(x, y) {
            var a = x.getComponent('card').cardData;
            var b = y.getComponent('card').cardData;
            
            if (a && a.value && b && b.value) {
                return b.value - a.value;
            }
            if (a && a.king && !b.king) return -1;
            if (!a.king && b && b.king) return 1;
            if (a && a.king && b && b.king) return b.king - a.king;
            return 0;
        });
        
        // 更新位置
        setTimeout(function() {
            var x = this.cardsNodes[0].x;
            for (var i = 0; i < this.cardsNodes.length; i++) {
                var card = this.cardsNodes[i];
                card.zIndex = i;
                card.x = x + card.width * 0.4 * i;
            }
        }.bind(this), 500);
    },

    /**
     * 发牌
     * @param {Array} data - 卡牌数据
     */
    pushCard: function(data) {
        var myglobal = window.myglobal;
        
        if (!data) return;
        
        // 排序
        data.sort(function(a, b) {
            if (a.value && b.value) return b.value - a.value;
            if (a.king && !b.king) return -1;
            if (!a.king && b.king) return 1;
            if (a.king && b.king) return b.king - a.king;
            return 0;
        });
        
        this.cardsNodes = [];
        
        for (var i = 0; i < 17; i++) {
            var card = cc.instantiate(this.cardPrefab);
            card.scale = 0.8;
            card.parent = this.node.parent;
            card.x = card.width * 0.4 * (-0.5) * (-16);
            card.y = -250;
            card.active = false;
            
            var cardScript = card.getComponent('card');
            if (cardScript) {
                cardScript.showCards(data[i], myglobal.playerData.id);
            }
            
            this.cardsNodes.push(card);
            this.cardWidth = card.width;
        }
        
        // 创建3张底牌
        this.bottomCards = [];
        for (var i = 0; i < 3; i++) {
            var diCard = cc.instantiate(this.cardPrefab);
            diCard.scale = 0.4;
            diCard.position = this.bottomCardPosNode ? this.bottomCardPosNode.position : cc.v2(0, 200);
            
            if (i === 0) {
                diCard.x = diCard.x - diCard.width * 0.4;
            } else if (i === 2) {
                diCard.x = diCard.x + diCard.width * 0.4;
            }
            
            diCard.parent = this.node.parent;
            this.bottomCards.push(diCard);
        }
    },

    /**
     * 显示底牌
     * @param {Array} data - 底牌数据
     */
    showBottomCards: function(data) {
        var myglobal = window.myglobal;
        
        for (var i = 0; i < data.length; i++) {
            var card = this.bottomCards[i];
            var showData = data[i];
            
            var cardScript = card.getComponent('card');
            if (cardScript) {
                cardScript.showCards(showData);
            }
            
            card.runAction(cc.sequence(
                cc.rotateBy(0, 0, 180),
                cc.rotateBy(0.2, 0, -90),
                cc.rotateBy(0.2, 0, -90),
                cc.scaleBy(1, 1.2)
            ));
        }
        
        if (myglobal.playerData.id === myglobal.playerData.masterAccountId) {
            this.scheduleOnce(this.pushThreeCard.bind(this), 0.2);
        }
    },

    /**
     * 收底牌
     */
    pushThreeCard: function() {
        var myglobal = window.myglobal;
        
        var lastCardX = this.cardsNodes[this.cardsNodes.length - 1].x;
        
        for (var i = 0; i < this.bottomCardData.length; i++) {
            var card = cc.instantiate(this.cardPrefab);
            card.scale = 0.8;
            card.parent = this.node.parent;
            card.x = lastCardX + ((i + 1) * this.cardWidth * 0.4);
            card.y = -230;
            
            var cardScript = card.getComponent('card');
            if (cardScript) {
                cardScript.showCards(this.bottomCardData[i], myglobal.playerData.id);
            }
            
            card.active = true;
            this.cardsNodes.push(card);
        }
        
        this.sortCards();
    },

    /**
     * 清除出牌区
     * @param {string} accountId - 玩家ID
     */
    clearOutZone: function(accountId) {
        var gameScene = this.node.parent.getComponent('gameScene');
        if (!gameScene) return;
        
        var outCardNode = gameScene.getUserOutCardPosByAccount(accountId);
        if (outCardNode) {
            outCardNode.removeAllChildren(true);
        }
    },

    /**
     * 添加其他玩家的牌到出牌区
     */
    appendOtherCardsToOutZone: function(outCardNode, cards, yOffset) {
        outCardNode.removeAllChildren(true);
        
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            outCardNode.addChild(card, 100 + i);
        }
        
        var zPoint = cards.length / 2;
        for (var i = 0; i < cards.length; i++) {
            var cardNode = outCardNode.getChildren()[i];
            var x = (i - zPoint) * 30;
            var y = cardNode.y + yOffset;
            cardNode.setScale(0.5, 0.5);
            cardNode.setPosition(x, y);
        }
    },

    /**
     * 更新倍数显示
     * @param {number} multiple - 倍数
     */
    updateMultiple: function(multiple) {
        this.currentMultiple = multiple;
        if (this.multipleLabel) {
            this.multipleLabel.string = '倍数: x' + multiple;
        }
    },

    /**
     * 显示提示
     * @param {string} message - 提示信息
     */
    showTips: function(message) {
        if (this.tipsLabel) {
            this.tipsLabel.string = message;
            
            // 2秒后清除
            setTimeout(function() {
                if (this.tipsLabel && this.tipsLabel.isValid) {
                    this.tipsLabel.string = '';
                }
            }.bind(this), 2000);
        }
    },

    /**
     * 按钮点击事件
     */
    onButtonClick: function(event, customData) {
        var myglobal = window.myglobal;
        
        cc.log('[GameInUI] 按钮点击:', customData);
        
        switch (customData) {
            case 'btn_qiandz':
                cc.log('[GameInUI] 抢地主');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestRobState(QianState.QIANG);
                }
                if (this.robUI) this.robUI.active = false;
                break;
                
            case 'btn_buqiandz':
                cc.log('[GameInUI] 不抢地主');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestRobState(QianState.BU_QIANG);
                }
                if (this.robUI) this.robUI.active = false;
                break;
                
            case 'nopushcard':
                cc.log('[GameInUI] 不出');
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestBuChuCard([], null);
                }
                if (this.playingUI) this.playingUI.active = false;
                break;
                
            case 'pushcard':
                cc.log('[GameInUI] 出牌');
                if (this.chooseCardData.length === 0) {
                    this.showTips('请选择牌!');
                    return;
                }
                
                if (myglobal && myglobal.socket) {
                    myglobal.socket.requestChuCard(this.chooseCardData, function(err, data) {
                        if (err) {
                            cc.error('[GameInUI] 出牌失败:', err);
                            this.showTips(data.msg || '出牌失败');
                            
                            // 重置选中状态
                            for (var i = 0; i < this.cardsNodes.length; i++) {
                                var card = this.cardsNodes[i];
                                card.emit('reset_card_flag');
                            }
                            this.chooseCardData = [];
                        } else {
                            cc.log('[GameInUI] 出牌成功:', JSON.stringify(data));
                            if (this.playingUI) this.playingUI.active = false;
                            this.chooseCardData = [];
                        }
                    }.bind(this));
                }
                break;
                
            case 'tipcard':
                cc.log('[GameInUI] 提示');
                this.showTips('提示功能开发中');
                break;
                
            default:
                break;
        }
    }
});
