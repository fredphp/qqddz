/**
 * 游戏场景控制器
 * 处理游戏逻辑、卡牌显示、玩家交互等功能
 */

var GameScene = cc.Class({
    extends: cc.Component,

    properties: {
        // 游戏桌面背景
        tableBg: {
            default: null,
            type: cc.Sprite
        },

        // 玩家节点数组（0:自己，1:下家，2:对家，3:上家）
        playerNodes: {
            default: [],
            type: [cc.Node]
        },

        // 底牌节点
        bottomCardsNode: {
            default: null,
            type: cc.Node
        },

        // 自己的手牌节点
        myCardsNode: {
            default: null,
            type: cc.Node
        },

        // 出牌区域节点
        playCardsNode: {
            default: null,
            type: cc.Node
        },

        // 操作按钮节点
        operationNode: {
            default: null,
            type: cc.Node
        },

        // 叫地主按钮
        callLandlordBtn: {
            default: null,
            type: cc.Node
        },

        // 不叫按钮
        noCallBtn: {
            default: null,
            type: cc.Node
        },

        // 抢地主按钮
        grabLandlordBtn: {
            default: null,
            type: cc.Node
        },

        // 不抢按钮
        noGrabBtn: {
            default: null,
            type: cc.Node
        },

        // 出牌按钮
        playCardsBtn: {
            default: null,
            type: cc.Node
        },

        // 不出按钮
        passBtn: {
            default: null,
            type: cc.Node
        },

        // 提示按钮
        hintBtn: {
            default: null,
            type: cc.Node
        },

        // 准备按钮
        readyBtn: {
            default: null,
            type: cc.Node
        },

        // 返回大厅按钮
        backToHallBtn: {
            default: null,
            type: cc.Node
        },

        // 房间信息节点
        roomInfoNode: {
            default: null,
            type: cc.Node
        },

        // 房间号标签
        roomIdLabel: {
            default: null,
            type: cc.Label
        },

        // 倍数标签
        multipleLabel: {
            default: null,
            type: cc.Label
        },

        // 卡牌预制体
        cardPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 玩家信息预制体
        playerInfoPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 结果弹窗预制体
        resultPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    // 游戏状态
    _gameState: 'waiting', // waiting, dealing, bidding, playing, finished

    // 当前玩家索引
    _currentPlayer: 0,

    // 地主索引
    _landlordIndex: -1,

    // 当前倍数
    _multiple: 1,

    // 自己的手牌
    _myCards: [],

    // 选中的卡牌
    _selectedCards: [],

    // 上一次出的牌
    _lastPlayedCards: [],

    // 上一次出牌的玩家
    _lastPlayer: -1,

    // 是否轮到自己
    _isMyTurn: false,

    // Socket管理器
    _socket: null,

    // 房间数据
    _roomData: null,

    // 玩家数据
    _playerData: null,

    onLoad: function() {
        cc.log('[GameScene] onLoad');

        // 初始化
        this.init();

        // 绑定事件
        this.bindEvents();

        // 初始化Socket
        this.initSocket();

        // 加载房间数据
        this.loadRoomData();

        // 初始化UI
        this.initUI();
    },

    start: function() {
        cc.log('[GameScene] start');

        // 播放背景音乐
        this.playBgMusic();
    },

    onDestroy: function() {
        cc.log('[GameScene] onDestroy');

        // 取消事件监听
        this.unbindEvents();
    },

    /**
     * 初始化
     */
    init: function() {
        this._gameState = 'waiting';
        this._currentPlayer = 0;
        this._landlordIndex = -1;
        this._multiple = 1;
        this._myCards = [];
        this._selectedCards = [];
        this._lastPlayedCards = [];
        this._lastPlayer = -1;
        this._isMyTurn = false;
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        var self = this;

        // 叫地主按钮
        if (this.callLandlordBtn) {
            this.callLandlordBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onCallLandlord();
            }, this);
        }

        // 不叫按钮
        if (this.noCallBtn) {
            this.noCallBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onNoCall();
            }, this);
        }

        // 抢地主按钮
        if (this.grabLandlordBtn) {
            this.grabLandlordBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onGrabLandlord();
            }, this);
        }

        // 不抢按钮
        if (this.noGrabBtn) {
            this.noGrabBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onNoGrab();
            }, this);
        }

        // 出牌按钮
        if (this.playCardsBtn) {
            this.playCardsBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onPlayCards();
            }, this);
        }

        // 不出按钮
        if (this.passBtn) {
            this.passBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onPass();
            }, this);
        }

        // 提示按钮
        if (this.hintBtn) {
            this.hintBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onHint();
            }, this);
        }

        // 准备按钮
        if (this.readyBtn) {
            this.readyBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onReady();
            }, this);
        }

        // 返回大厅按钮
        if (this.backToHallBtn) {
            this.backToHallBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onBackToHall();
            }, this);
        }
    },

    /**
     * 取消事件绑定
     */
    unbindEvents: function() {
        // 取消Socket事件监听
        if (this._socket) {
            this._socket.off('game_deal', this.onGameDeal, this);
            this._socket.off('game_turn', this.onGameTurn, this);
            this._socket.off('game_play', this.onGamePlay, this);
            this._socket.off('game_end', this.onGameEnd, this);
        }
    },

    /**
     * 初始化Socket
     */
    initSocket: function() {
        var self = this;

        if (typeof SocketManager !== 'undefined') {
            this._socket = SocketManager.getInstance();

            // 注册事件监听
            this._socket.on('game_deal', this.onGameDeal, this);
            this._socket.on('game_turn', this.onGameTurn, this);
            this._socket.on('game_play', this.onGamePlay, this);
            this._socket.on('game_end', this.onGameEnd, this);
        }
    },

    /**
     * 加载房间数据
     */
    loadRoomData: function() {
        if (typeof myglobal !== 'undefined') {
            this._roomData = myglobal.roomData;
            this._playerData = myglobal.playerData;

            // 更新房间信息UI
            this.updateRoomInfoUI();
        }
    },

    /**
     * 初始化UI
     */
    initUI: function() {
        // 隐藏所有操作按钮
        this.hideAllOperationBtns();

        // 显示准备按钮
        if (this.readyBtn) {
            this.readyBtn.active = true;
        }

        // 清空手牌区域
        if (this.myCardsNode) {
            this.myCardsNode.removeAllChildren();
        }

        // 清空出牌区域
        if (this.playCardsNode) {
            this.playCardsNode.removeAllChildren();
        }

        // 清空底牌区域
        if (this.bottomCardsNode) {
            this.bottomCardsNode.removeAllChildren();
        }
    },

    /**
     * 更新房间信息UI
     */
    updateRoomInfoUI: function() {
        if (this.roomIdLabel && this._roomData) {
            this.roomIdLabel.string = '房间: ' + (this._roomData.roomId || '');
        }

        if (this.multipleLabel) {
            this.multipleLabel.string = '倍数: x' + this._multiple;
        }
    },

    /**
     * 准备按钮点击
     */
    onReady: function() {
        cc.log('[GameScene] 准备按钮点击');

        this.playClickSound();

        // 隐藏准备按钮
        if (this.readyBtn) {
            this.readyBtn.active = false;
        }

        // 通知服务器准备
        if (this._socket && this._socket.isConnected()) {
            this._socket.send('player_ready', { playerId: this._playerData.id });
        }

        // 模拟开始游戏
        this.startGame();
    },

    /**
     * 开始游戏
     */
    startGame: function() {
        cc.log('[GameScene] 开始游戏');

        this._gameState = 'dealing';

        // 模拟发牌
        this.dealCards();
    },

    /**
     * 发牌
     */
    dealCards: function() {
        cc.log('[GameScene] 发牌');

        var self = this;

        // 生成一副牌
        var allCards = this.generateAllCards();

        // 洗牌
        this.shuffleCards(allCards);

        // 发牌（每人17张，3张底牌）
        this._myCards = allCards.slice(0, 17);
        var bottomCards = allCards.slice(51, 54);

        // 排序手牌
        this.sortCards(this._myCards);

        // 显示手牌
        this.showMyCards();

        // 显示底牌（背面）
        this.showBottomCards();

        // 发牌完成后进入叫地主阶段
        setTimeout(function() {
            self._gameState = 'bidding';
            self._currentPlayer = Math.floor(Math.random() * 3);
            
            if (self._currentPlayer === 0) {
                self.showBiddingUI();
            } else {
                // 模拟其他玩家叫地主
                setTimeout(function() {
                    self.simulateOtherPlayerBid();
                }, 1000);
            }
        }, 1000);
    },

    /**
     * 生成所有卡牌
     */
    generateAllCards: function() {
        var cards = [];
        var values = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        var suits = [0, 1, 2, 3]; // 黑桃、红桃、梅花、方块

        // 普通牌
        for (var v = 0; v < values.length; v++) {
            for (var s = 0; s < suits.length; s++) {
                cards.push({
                    value: values[v],
                    suit: suits[s]
                });
            }
        }

        // 大小王
        cards.push({ value: 16, suit: 4 }); // 小王
        cards.push({ value: 17, suit: 4 }); // 大王

        return cards;
    },

    /**
     * 洗牌
     */
    shuffleCards: function(cards) {
        for (var i = cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }
    },

    /**
     * 排序卡牌
     */
    sortCards: function(cards) {
        cards.sort(function(a, b) {
            return b.value - a.value;
        });
    },

    /**
     * 显示自己的手牌
     */
    showMyCards: function() {
        if (!this.myCardsNode) return;

        this.myCardsNode.removeAllChildren();

        var self = this;
        var startX = -(this._myCards.length - 1) * 25;

        for (var i = 0; i < this._myCards.length; i++) {
            (function(index) {
                var cardData = self._myCards[index];
                var cardNode = self.createCardNode(cardData);
                cardNode.x = startX + index * 50;
                cardNode.y = 0;

                // 点击选择卡牌
                cardNode.on(cc.Node.EventType.TOUCH_END, function() {
                    self.onCardClick(index);
                });

                self.myCardsNode.addChild(cardNode);
            })(i);
        }
    },

    /**
     * 创建卡牌节点
     */
    createCardNode: function(cardData) {
        var cardNode = new cc.Node('Card');

        // 背景
        var bgNode = new cc.Node('Bg');
        bgNode.color = cc.color(255, 255, 255);
        var bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        bgNode.setContentSize(60, 80);
        cardNode.addChild(bgNode);

        // 显示卡牌值
        var valueLabel = new cc.Node('Value');
        var label = valueLabel.addComponent(cc.Label);
        label.string = this.getCardDisplayValue(cardData.value);
        label.fontSize = 24;
        valueLabel.y = 20;
        cardNode.addChild(valueLabel);

        // 显示花色
        var suitLabel = new cc.Node('Suit');
        var suitLabelText = suitLabel.addComponent(cc.Label);
        suitLabelText.string = this.getSuitDisplay(cardData.suit);
        suitLabelText.fontSize = 20;
        suitLabel.y = -10;
        cardNode.addChild(suitLabel);

        // 存储卡牌数据
        cardNode.cardData = cardData;

        return cardNode;
    },

    /**
     * 获取卡牌显示值
     */
    getCardDisplayValue: function(value) {
        var names = {
            3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
            11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2', 16: '小王', 17: '大王'
        };
        return names[value] || '';
    },

    /**
     * 获取花色显示
     */
    getSuitDisplay: function(suit) {
        var suits = { 0: '♠', 1: '♥', 2: '♣', 3: '♦', 4: '★' };
        return suits[suit] || '';
    },

    /**
     * 显示底牌
     */
    showBottomCards: function() {
        if (!this.bottomCardsNode) return;

        this.bottomCardsNode.removeAllChildren();

        for (var i = 0; i < 3; i++) {
            var cardNode = new cc.Node('BottomCard');
            var bgNode = new cc.Node('Bg');
            bgNode.color = cc.color(100, 100, 200);
            var bgSprite = bgNode.addComponent(cc.Sprite);
            bgSprite.type = cc.Sprite.Type.SLICED;
            bgNode.setContentSize(60, 80);
            cardNode.addChild(bgNode);
            cardNode.x = (i - 1) * 70;
            this.bottomCardsNode.addChild(cardNode);
        }
    },

    /**
     * 卡牌点击事件
     */
    onCardClick: function(index) {
        if (this._gameState !== 'playing' || !this._isMyTurn) {
            return;
        }

        cc.log('[GameScene] 卡牌点击:', index);

        // 切换选中状态
        var cardNode = this.myCardsNode.children[index];
        if (!cardNode) return;

        var isSelected = this._selectedCards.indexOf(index) !== -1;

        if (isSelected) {
            // 取消选中
            this._selectedCards.splice(this._selectedCards.indexOf(index), 1);
            cardNode.y = 0;
        } else {
            // 选中
            this._selectedCards.push(index);
            cardNode.y = 20;
        }

        this.playClickSound();
    },

    /**
     * 显示叫地主UI
     */
    showBiddingUI: function() {
        this.hideAllOperationBtns();

        if (this.callLandlordBtn) {
            this.callLandlordBtn.active = true;
        }
        if (this.noCallBtn) {
            this.noCallBtn.active = true;
        }
    },

    /**
     * 显示抢地主UI
     */
    showGrabbingUI: function() {
        this.hideAllOperationBtns();

        if (this.grabLandlordBtn) {
            this.grabLandlordBtn.active = true;
        }
        if (this.noGrabBtn) {
            this.noGrabBtn.active = true;
        }
    },

    /**
     * 显示出牌UI
     */
    showPlayingUI: function() {
        this.hideAllOperationBtns();

        if (this.playCardsBtn) {
            this.playCardsBtn.active = true;
        }
        if (this.passBtn) {
            // 如果是新一轮或者自己最后出牌，不能不出
            this.passBtn.active = this._lastPlayer !== -1 && this._lastPlayer !== 0;
        }
        if (this.hintBtn) {
            this.hintBtn.active = true;
        }
    },

    /**
     * 隐藏所有操作按钮
     */
    hideAllOperationBtns: function() {
        if (this.callLandlordBtn) this.callLandlordBtn.active = false;
        if (this.noCallBtn) this.noCallBtn.active = false;
        if (this.grabLandlordBtn) this.grabLandlordBtn.active = false;
        if (this.noGrabBtn) this.noGrabBtn.active = false;
        if (this.playCardsBtn) this.playCardsBtn.active = false;
        if (this.passBtn) this.passBtn.active = false;
        if (this.hintBtn) this.hintBtn.active = false;
    },

    /**
     * 叫地主
     */
    onCallLandlord: function() {
        cc.log('[GameScene] 叫地主');

        this.playClickSound();
        this.hideAllOperationBtns();

        // 设置自己是地主
        this._landlordIndex = 0;

        // 模拟收到底牌
        this.receiveBottomCards();

        // 开始出牌
        this.startPlaying();
    },

    /**
     * 不叫
     */
    onNoCall: function() {
        cc.log('[GameScene] 不叫');

        this.playClickSound();
        this.hideAllOperationBtns();

        // 下一个玩家叫地主
        this._currentPlayer = 1;
        this.simulateOtherPlayerBid();
    },

    /**
     * 抢地主
     */
    onGrabLandlord: function() {
        cc.log('[GameScene] 抢地主');

        this.playClickSound();
        this.hideAllOperationBtns();

        this._landlordIndex = 0;
        this._multiple *= 2;

        this.receiveBottomCards();
        this.startPlaying();
    },

    /**
     * 不抢
     */
    onNoGrab: function() {
        cc.log('[GameScene] 不抢');

        this.playClickSound();
        this.hideAllOperationBtns();

        this._currentPlayer = 1;
        this.simulateOtherPlayerBid();
    },

    /**
     * 模拟其他玩家叫地主
     */
    simulateOtherPlayerBid: function() {
        var self = this;

        setTimeout(function() {
            // 随机决定其他玩家是否叫地主
            var willBid = Math.random() > 0.5;

            if (willBid) {
                cc.log('[GameScene] 玩家' + self._currentPlayer + '叫地主');
                self._landlordIndex = self._currentPlayer;
                self.startPlaying();
            } else {
                cc.log('[GameScene] 玩家' + self._currentPlayer + '不叫');
                self._currentPlayer = (self._currentPlayer + 1) % 3;

                if (self._currentPlayer === 0) {
                    self.showBiddingUI();
                } else {
                    self.simulateOtherPlayerBid();
                }
            }
        }, 1000);
    },

    /**
     * 收到底牌
     */
    receiveBottomCards: function() {
        // 随机生成3张底牌加入手牌
        for (var i = 0; i < 3; i++) {
            this._myCards.push({
                value: Math.floor(Math.random() * 13) + 3,
                suit: Math.floor(Math.random() * 4)
            });
        }

        this.sortCards(this._myCards);
        this.showMyCards();

        this.showToast('你是地主！');
    },

    /**
     * 开始出牌阶段
     */
    startPlaying: function() {
        cc.log('[GameScene] 开始出牌');

        this._gameState = 'playing';
        this._currentPlayer = this._landlordIndex;

        if (this._currentPlayer === 0) {
            this._isMyTurn = true;
            this.showPlayingUI();
        } else {
            this._isMyTurn = false;
            this.simulateOtherPlayerPlay();
        }
    },

    /**
     * 出牌
     */
    onPlayCards: function() {
        cc.log('[GameScene] 出牌');

        if (this._selectedCards.length === 0) {
            this.showToast('请选择要出的牌');
            return;
        }

        this.playClickSound();

        // 获取选中的卡牌
        var playedCards = [];
        for (var i = 0; i < this._selectedCards.length; i++) {
            playedCards.push(this._myCards[this._selectedCards[i]]);
        }

        // 从手牌中移除
        this._selectedCards.sort(function(a, b) { return b - a; });
        for (var i = 0; i < this._selectedCards.length; i++) {
            this._myCards.splice(this._selectedCards[i], 1);
        }

        this._selectedCards = [];
        this._lastPlayedCards = playedCards;
        this._lastPlayer = 0;

        // 更新手牌显示
        this.showMyCards();

        // 显示出的牌
        this.showPlayedCards(playedCards);

        // 隐藏操作按钮
        this.hideAllOperationBtns();

        // 检查是否赢了
        if (this._myCards.length === 0) {
            this.onGameWin();
            return;
        }

        // 下一个玩家
        this._isMyTurn = false;
        this._currentPlayer = 1;
        this.simulateOtherPlayerPlay();
    },

    /**
     * 不出
     */
    onPass: function() {
        cc.log('[GameScene] 不出');

        this.playClickSound();
        this.hideAllOperationBtns();

        // 下一个玩家
        this._isMyTurn = false;
        this._currentPlayer = 1;
        this.simulateOtherPlayerPlay();
    },

    /**
     * 提示
     */
    onHint: function() {
        cc.log('[GameScene] 提示');
        this.playClickSound();
        this.showToast('提示功能开发中');
    },

    /**
     * 显示出的牌
     */
    showPlayedCards: function(cards) {
        if (!this.playCardsNode) return;

        this.playCardsNode.removeAllChildren();

        for (var i = 0; i < cards.length; i++) {
            var cardNode = this.createCardNode(cards[i]);
            cardNode.x = (i - cards.length / 2) * 30;
            cardNode.scale = 0.8;
            this.playCardsNode.addChild(cardNode);
        }
    },

    /**
     * 模拟其他玩家出牌
     */
    simulateOtherPlayerPlay: function() {
        var self = this;

        setTimeout(function() {
            if (self._gameState !== 'playing') return;

            cc.log('[GameScene] 玩家' + self._currentPlayer + '出牌');

            // 简单模拟：随机出1-3张牌
            var numCards = Math.floor(Math.random() * 3) + 1;

            // 清除出牌区域
            if (self.playCardsNode) {
                self.playCardsNode.removeAllChildren();
            }

            // 显示出的牌
            for (var i = 0; i < numCards; i++) {
                var cardNode = new cc.Node('Card');
                var bgNode = new cc.Node('Bg');
                bgNode.color = cc.color(255, 255, 255);
                var bgSprite = bgNode.addComponent(cc.Sprite);
                bgSprite.type = cc.Sprite.Type.SLICED;
                bgNode.setContentSize(60, 80);
                cardNode.addChild(bgNode);
                cardNode.x = (i - numCards / 2) * 30;
                cardNode.scale = 0.8;
                self.playCardsNode.addChild(cardNode);
            }

            // 下一个玩家
            self._currentPlayer = (self._currentPlayer + 1) % 3;

            if (self._currentPlayer === 0) {
                self._isMyTurn = true;
                self.showPlayingUI();
            } else {
                self.simulateOtherPlayerPlay();
            }
        }, 1500);
    },

    /**
     * 游戏胜利
     */
    onGameWin: function() {
        cc.log('[GameScene] 游戏胜利');

        this._gameState = 'finished';

        this.showToast('恭喜你赢了！');

        // 更新玩家数据
        if (typeof myglobal !== 'undefined') {
            myglobal.updatePlayerData({
                winCount: (myglobal.playerData.winCount || 0) + 1,
                coins: (myglobal.playerData.coins || 0) + 100 * this._multiple
            });
        }

        // 显示结果弹窗
        this.showResultDialog(true);
    },

    /**
     * 显示结果弹窗
     */
    showResultDialog: function(isWin) {
        var self = this;

        // 创建遮罩层
        var mask = new cc.Node('Mask');
        mask.color = cc.color(0, 0, 0, 180);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.type = cc.Sprite.Type.SLICED;
        mask.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
        mask.zIndex = 100;

        // 创建弹窗
        var dialog = new cc.Node('Dialog');
        dialog.color = cc.color(255, 255, 255, 255);
        var dialogSprite = dialog.addComponent(cc.Sprite);
        dialogSprite.type = cc.Sprite.Type.SLICED;
        dialog.setContentSize(400, 300);
        dialog.zIndex = 101;

        // 标题
        var title = new cc.Node('Title');
        var titleLabel = title.addComponent(cc.Label);
        titleLabel.string = isWin ? '恭喜获胜！' : '很遗憾，再接再厉！';
        titleLabel.fontSize = 32;
        title.y = 80;
        dialog.addChild(title);

        // 奖励信息
        var rewardLabel = new cc.Node('Reward');
        var rewardLabelText = rewardLabel.addComponent(cc.Label);
        rewardLabelText.string = isWin ? '获得金币: +' + (100 * this._multiple) : '失去金币: -' + (50 * this._multiple);
        rewardLabelText.fontSize = 24;
        rewardLabel.y = 20;
        dialog.addChild(rewardLabel);

        // 继续游戏按钮
        var continueBtn = new cc.Node('ContinueBtn');
        var continueLabel = continueBtn.addComponent(cc.Label);
        continueLabel.string = '继续游戏';
        continueLabel.fontSize = 24;
        continueBtn.y = -60;
        continueBtn.on(cc.Node.EventType.TOUCH_END, function() {
            mask.removeFromParent(true);
            self.resetGame();
        });
        dialog.addChild(continueBtn);

        // 返回大厅按钮
        var backBtn = new cc.Node('BackBtn');
        var backLabel = backBtn.addComponent(cc.Label);
        backLabel.string = '返回大厅';
        backLabel.fontSize = 24;
        backBtn.y = -100;
        backBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self.onBackToHall();
        });
        dialog.addChild(backBtn);

        mask.addChild(dialog);
        this.node.addChild(mask);
    },

    /**
     * 重置游戏
     */
    resetGame: function() {
        cc.log('[GameScene] 重置游戏');

        this.init();
        this.initUI();

        if (this.readyBtn) {
            this.readyBtn.active = true;
        }
    },

    /**
     * 返回大厅
     */
    onBackToHall: function() {
        cc.log('[GameScene] 返回大厅');

        // 断开房间连接
        if (this._socket && this._socket.isConnected()) {
            this._socket.send('room_leave', { playerId: this._playerData.id });
        }

        // 清除房间数据
        if (typeof myglobal !== 'undefined') {
            myglobal.resetRoomData();
        }

        cc.director.loadScene('hallScene');
    },

    /**
     * 游戏发牌回调
     */
    onGameDeal: function(data) {
        cc.log('[GameScene] 收到发牌:', JSON.stringify(data));

        if (data.cards) {
            this._myCards = data.cards;
            this.sortCards(this._myCards);
            this.showMyCards();
        }
    },

    /**
     * 游戏回合回调
     */
    onGameTurn: function(data) {
        cc.log('[GameScene] 收到回合:', JSON.stringify(data));

        if (data.currentPlayer === 0) {
            this._isMyTurn = true;
            this.showPlayingUI();
        } else {
            this._isMyTurn = false;
        }
    },

    /**
     * 游戏出牌回调
     */
    onGamePlay: function(data) {
        cc.log('[GameScene] 收到出牌:', JSON.stringify(data));

        if (data.cards) {
            this.showPlayedCards(data.cards);
            this._lastPlayer = data.playerIndex;
            this._lastPlayedCards = data.cards;
        }
    },

    /**
     * 游戏结束回调
     */
    onGameEnd: function(data) {
        cc.log('[GameScene] 收到游戏结束:', JSON.stringify(data));

        this._gameState = 'finished';

        var isWin = data.winner === 0 || 
                    (this._landlordIndex === 0 && data.winner === 'landlord') ||
                    (this._landlordIndex !== 0 && data.winner === 'farmer');

        this.showResultDialog(isWin);
    },

    /**
     * 显示提示
     */
    showToast: function(message) {
        if (typeof myglobal !== 'undefined' && myglobal.showToast) {
            myglobal.showToast(message);
        } else {
            cc.log('[GameScene] Toast:', message);
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
    module.exports = GameScene;
}
