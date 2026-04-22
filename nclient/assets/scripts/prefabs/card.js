/**
 * 扑克牌预制体脚本
 * 处理单张扑克牌的显示、选中等交互
 */

// 房间状态
var RoomState = window.RoomState || {
    ROOM_WAITING: 'waiting',
    ROOM_READY: 'ready',
    ROOM_PLAYING: 'playing',
    ROOM_FINISHED: 'finished'
};

cc.Class({
    extends: cc.Component,

    properties: {
        // 卡牌图集
        cardsSpriteAtlas: {
            type: cc.SpriteAtlas,
            default: null
        },
        
        // 卡牌精灵
        cardSprite: {
            type: cc.Sprite,
            default: null
        },
        
        // 选中偏移
        selectedOffset: {
            default: 20,
            type: cc.Float
        }
    },

    // 卡牌ID
    cardId: 0,
    
    // 卡牌数据
    cardData: null,
    
    // 所属玩家ID
    accountId: '',
    
    // 是否选中
    isSelected: false,

    onLoad: function() {
        this.isSelected = false;
        this.cardId = 0;
        this.cardData = null;
        this.accountId = '';
        
        // 监听重置事件
        this.node.on('reset_card_flag', function(event) {
            if (this.isSelected) {
                this.isSelected = false;
                this.node.y -= this.selectedOffset;
            }
        }, this);
    },

    start: function() {
        // 空实现
    },

    /**
     * 初始化卡牌数据
     * @param {Object} data - 卡牌数据
     */
    initData: function(data) {
        this.cardData = data;
        if (data && data.index) {
            this.cardId = data.index;
        }
    },

    /**
     * 设置触摸事件
     */
    setTouchEvent: function() {
        var myglobal = window.myglobal;
        if (!myglobal) return;
        
        // 只有自己的牌才能点击
        if (this.accountId === myglobal.playerData.id) {
            this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
                this.onCardTouch();
            }, this);
        }
    },

    /**
     * 卡牌触摸事件
     */
    onCardTouch: function() {
        var gameSceneNode = this.node.parent;
        if (!gameSceneNode) return;
        
        var gameScene = gameSceneNode.getComponent('gameScene');
        if (!gameScene) return;
        
        var roomState = gameScene.roomState;
        if (roomState !== RoomState.ROOM_PLAYING) {
            return;
        }
        
        cc.log('[Card] 卡牌点击 id:', this.cardId);
        
        // 切换选中状态
        if (!this.isSelected) {
            this.isSelected = true;
            this.node.y += this.selectedOffset;
            
            // 发送选中事件
            var cardData = {
                cardId: this.cardId,
                cardData: this.cardData
            };
            gameSceneNode.emit('choose_card_event', cardData);
        } else {
            this.isSelected = false;
            this.node.y -= this.selectedOffset;
            
            // 发送取消选中事件
            gameSceneNode.emit('unchoose_card_event', this.cardId);
        }
    },

    /**
     * 显示卡牌
     * @param {Object} card - 卡牌数据
     * @param {string} accountId - 所属玩家ID
     */
    showCards: function(card, accountId) {
        this.cardData = card;
        
        if (card && card.index !== undefined) {
            this.cardId = card.index;
        }
        
        if (accountId) {
            this.accountId = accountId;
        }
        
        // 卡牌值映射
        var CardValue = {
            '12': 1, '13': 2, '1': 3, '2': 4, '3': 5, '4': 6, '5': 7,
            '6': 8, '7': 9, '8': 10, '9': 11, '10': 12, '11': 13
        };

        // 花色映射
        var CardShape = {
            '1': 3, '2': 2, '3': 1, '4': 0
        };
        
        // 大小王映射
        var Kings = {
            '14': 54, '15': 53
        };

        var spriteKey = '';
        if (card && card.shape) {
            spriteKey = 'card_' + (CardShape[card.shape] * 13 + CardValue[card.value]);
        } else if (card && card.king) {
            spriteKey = 'card_' + Kings[card.king];
        }
        
        // 设置精灵帧
        if (this.cardsSpriteAtlas && spriteKey) {
            var spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(spriteKey);
            if (spriteFrame && this.cardSprite) {
                this.cardSprite.spriteFrame = spriteFrame;
            }
        }
        
        // 设置触摸事件
        this.setTouchEvent();
    },

    /**
     * 设置卡牌背面
     */
    showBack: function() {
        if (this.cardsSpriteAtlas) {
            var spriteFrame = this.cardsSpriteAtlas.getSpriteFrame('card_back');
            if (spriteFrame && this.cardSprite) {
                this.cardSprite.spriteFrame = spriteFrame;
            }
        }
    },

    /**
     * 获取卡牌ID
     * @returns {number} 卡牌ID
     */
    getCardId: function() {
        return this.cardId;
    },

    /**
     * 获取卡牌数据
     * @returns {Object} 卡牌数据
     */
    getCardData: function() {
        return this.cardData;
    },

    /**
     * 检查是否选中
     * @returns {boolean} 是否选中
     */
    isSelected: function() {
        return this.isSelected;
    },

    /**
     * 设置选中状态
     * @param {boolean} selected - 是否选中
     */
    setSelected: function(selected) {
        if (this.isSelected !== selected) {
            this.isSelected = selected;
            if (selected) {
                this.node.y += this.selectedOffset;
            } else {
                this.node.y -= this.selectedOffset;
            }
        }
    }
});
