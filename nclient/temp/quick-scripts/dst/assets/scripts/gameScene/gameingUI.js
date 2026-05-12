
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/gameScene/gameingUI.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '77743SDxfxJ26racOmhW9tt', 'gameingUI');
// scripts/gameScene/gameingUI.js

"use strict";

// 使用全局变量，不使用 require
// 【彻底修复版本】服务端数据为唯一数据源
// 
// 核心原则：
// 1. handCards 是唯一数据源，保存服务端原始数据
// 2. 禁止任何数据转换、排序、重新计算
// 3. renderCards() 是唯一渲染入口
// 4. 动画只是视觉效果，绝不能修改数据
// 5. clearAllCards() 清理所有旧节点（解决背面牌残留）

var isopen_sound = window.isopen_sound || 1;
var qian_state = window.qian_state || {
  buqiang: 0,
  qian: 1
};
var CardsValue = window.CardsValue || {};
var RoomState = window.RoomState || {};

// 音效缓存
var _audioClips = {};

// 牌布局配置
var CardLayout = {
  cardScale: 0.8,
  cardY: -250,
  cardSpacing: 35,
  bottomCardScale: 0.4,
  bottomCardSpacing: 25,
  outCardScale: 0.5,
  outCardSpacing: 25
};

// 发牌动画配置
var DealConfig = {
  animDuration: 0.12,
  deckPosition: cc.v2(0, 100),
  cardInterval: 80
};

// 加载并播放音效
function playSound(path) {
  if (!isopen_sound) return null;
  if (_audioClips[path]) {
    return cc.audioEngine.play(_audioClips[path], false, 1);
  }
  cc.resources.load(path, cc.AudioClip, function (err, clip) {
    if (err) {
      return;
    }
    _audioClips[path] = clip;
    cc.audioEngine.play(clip, false, 1);
  });
  return null;
}
cc.Class({
  "extends": cc.Component,
  name: 'gameingUI',
  properties: {
    gameingUI: cc.Node,
    card_prefab: cc.Prefab,
    robUI: cc.Node,
    bottom_card_pos_node: cc.Node,
    playingUI_node: cc.Node,
    tipsLabel: cc.Label,
    cards_node: cc.Node,
    // 手牌节点容器
    // 🕐【新增】倒计时Label引用
    bidCountdownLabel: cc.Label,
    // 抢地主倒计时
    playCountdownLabel: cc.Label,
    // 出牌倒计时
    // 🔊【新增】滴答音效（3秒催促音效）
    tickAudio: {
      "default": null,
      type: cc.AudioClip
    }
  },
  onLoad: function onLoad() {
    var myglobal = window.myglobal;
    if (!myglobal) {
      console.error("myglobal 未定义");
      return;
    }

    // 🔧【修复】确保手牌容器节点存在
    if (!this.cards_node) {
      // 查找是否已存在手牌容器节点
      var gameSceneNode = this.node.parent;
      if (gameSceneNode) {
        for (var i = 0; i < gameSceneNode.children.length; i++) {
          var child = gameSceneNode.children[i];
          if (child.name === "cards_node" || child.name === "cards" || child.name === "handCards") {
            this.cards_node = child;
            break;
          }
        }
        // 如果没找到，创建一个新的容器节点
        if (!this.cards_node) {
          var newCardsNode = new cc.Node("cards_node");
          newCardsNode.parent = gameSceneNode;
          newCardsNode.setPosition(0, 0);
          newCardsNode.setAnchorPoint(0.5, 0.5);
          newCardsNode.setContentSize(cc.size(800, 200));
          this.cards_node = newCardsNode;
        }
      }
    }

    // ============================================================
    // 【核心】唯一数据源 - 服务端原始手牌数据
    // 【重要】禁止任何修改、排序、转换
    // ============================================================
    this.handCards = []; // 【唯一数据源】服务端原始手牌
    this.bottomCards = []; // 底牌数据
    this.choose_card_data = []; // 选中的牌

    // 抢地主相关
    this.rob_player_accountid = 0;
    this._biddingPhase = "idle";
    this._gamePhase = "idle"; // 🔧【新增】游戏阶段: idle, bidding, playing
    this.cardsReady = false;

    // 🕐【倒计时系统】
    this._bidTimeout = 0;
    this._playTimeout = 0;
    this._bidCountdownTimer = null;
    this._playCountdownTimer = null;
    this._bidTimeLeft = 0;
    this._playTimeLeft = 0;
    this._isBidCountdownTicking = false;
    this._isPlayCountdownTicking = false;
    this._isBidWarning = false;
    this._isPlayWarning = false;
    this._bidExpiresAt = 0; // 🔧【新增】服务端过期时间戳（毫秒）

    // 底牌节点
    this.bottom_card = [];

    // ============================================================
    // 【竞技场】状态变量
    // ============================================================
    this._isCompetition = false; // 是否是竞技场模式
    this._roomCategory = 1; // 房间类型：1=普通场，2=竞技场
    this._matchCoin = 0; // 比赛金币
    this._competitionRound = 0; // 当前轮次
    this._competitionTotalRounds = 0; // 总轮次
    this._competitionCountdown = 0; // 竞技场倒计时
    this._competitionCountdownTimer = null; // 竞技场倒计时定时器
    this._wasDisconnected = false; // 是否在比赛中掉线

    // ============ 服务器消息监听 ============

    // 【核心】监听服务器发牌消息 - 唯一数据入口
    myglobal.socket.onPushCards(function (data) {
      console.log("🃏 ========== 服务端发牌消息 ==========");
      console.log("🃏 服务端原始手牌:", JSON.stringify(data.cards));
      console.log("🃏 服务端原始底牌:", JSON.stringify(data.bottom_cards));

      // 🔧【关键修复】新一轮发牌时，关闭上一轮的结算弹窗
      if (this._gameResultPopup || this._gameResultMask) {
        console.log("🃏 [onPushCards] 关闭上一轮的结算弹窗");
        this._closeGameResultPopup(this._gameResultPopup, this._gameResultMask);
      }

      // 🔧【修复】停止所有竞技场倒计时
      this._stopArenaCountdown();

      // 🔧【关键修复】清理桌面上的牌（上一轮最后一手牌）
      console.log("🃏 [onPushCards] 清理桌面上的牌");
      this._clearAllOutCardZones();

      // 【核心】直接保存服务端数据，不做任何转换
      this.handCards = data.cards || [];
      this.bottomCards = data.bottom_cards || [];

      // 【核心】唯一渲染入口
      this.renderCards(this.handCards);
    }.bind(this));

    // 监听叫地主轮次（旧版消息，仅用于兼容）
    myglobal.socket.onBidTurn(function (data) {
      // 不再处理，避免重复
    }.bind(this));

    // 监听叫地主结果
    myglobal.socket.onBidResult(function (data) {
      // 🔒【重要】收到结果，停止倒计时
      this._stopBidCountdown();
      if (this.node && this.node.parent) {
        this.node.parent.emit("bid_result_event", {
          player_id: data.accountid,
          bid: data.state
        });
      }
    }.bind(this));

    // 监听抢地主轮次（旧版消息，仅用于兼容）
    myglobal.socket.onCanRobState(function (data) {
      // 不再处理，避免重复
    }.bind(this));

    // 监听出牌轮次
    myglobal.socket.onCanChuCard(function (data) {
      var playerId = data.player_id || data;
      var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;

      // 🔒【重要】先停止之前的倒计时（服务器轮转了）
      this._stopPlayCountdown();

      // 🔧【新增】保存出牌状态，用于提示功能
      this._mustPlay = data.must_play || false;
      this._canBeat = data.can_beat || false;
      this._lastPlayedCards = null; // 上家出的牌，需要从 onOtherPlayerChuCard 获取

      if (String(playerId) === String(myPlayerId)) {
        this._hideRobUI();
        this.clearOutZone(myPlayerId);
        this.playingUI_node.active = true;
        this._playTimeout = data.timeout || 15;
        this._startPlayCountdown();
      } else {
        if (this.playingUI_node) {
          this.playingUI_node.active = false;
        }
      }
    }.bind(this));

    // 监听其他玩家出牌
    myglobal.socket.onOtherPlayerChuCard(function (data) {
      // 🔒【重要】收到出牌消息，停止我的倒计时
      this._stopPlayCountdown();
      if (this.playingUI_node) {
        this.playingUI_node.active = false;
      }

      // 🔧【修复】处理不出的情况
      if (data.is_pass) {
        // 🔊【新增】播放不出音效
        this._playPassSound(data);
        // 🔊【新增】显示不出效果
        this._showPassEffect(data.accountid);
        // 🔧【新增】不出时不清除上家出的牌
        return;
      }

      // 🔧【新增】保存上家出的牌，用于提示功能
      this._lastPlayedCards = data.cards || [];
      this._lastPlayedHandType = data.hand_type || "";
      if (!this.node || !this.node.parent) return;

      // 🔧【修复】获取当前玩家ID，判断是否是自己出牌
      // 🔧【关键】安全获取玩家ID，避免报错
      var socketInfo = myglobal.socket.getPlayerInfo() || {};
      var serverPlayerId = myglobal.playerData && myglobal.playerData.serverPlayerId || "";
      var accountId = myglobal.playerData && myglobal.playerData.accountID || "";
      var myPlayerId = socketInfo.id || serverPlayerId || accountId;

      // 🔧【关键】使用更安全的比较方式
      var isSelf = String(data.accountid || "") === String(myPlayerId || "");

      // 🔧【调试】详细打印ID比较信息

      // 🔧【核心修复】如果是自己出牌，从手牌中删除
      if (isSelf) {
        this._removeCardsFromHand(data.cards);
      } else {}

      // 🔊【新增】播放出牌音效
      this._playCardSound(data);

      // 显示出的牌到桌面
      var gameScene_script = this.node.parent.getComponent("gameScene");
      if (!gameScene_script) return;
      var outCard_node = gameScene_script.getUserOutCardPosByAccount(data.accountid);
      if (!outCard_node || !this.card_prefab) return;

      // 【重要】直接使用服务端数据创建节点
      var node_cards = [];
      for (var i = 0; i < data.cards.length; i++) {
        var card = cc.instantiate(this.card_prefab);
        if (card) {
          var cardScript = card.getComponent("card");
          if (cardScript) {
            cardScript.showCards(data.cards[i], myglobal.playerData.accountID);
          }
          node_cards.push(card);
        }
      }
      this.showOutCards(outCard_node, node_cards);

      // 更新剩余牌数
      if (data.cards_left !== undefined) {
        this.node.parent.emit("update_card_count_event", {
          accountid: data.accountid,
          count: data.cards_left
        });
      }
    }.bind(this));

    // 监听抢地主阶段开始
    myglobal.socket.onCallLandlordStart(function (data) {
      this._biddingPhase = "bidding";
      this._gamePhase = "bidding"; // 🔧【新增】设置游戏阶段
    }.bind(this));

    // 监听抢地主轮次
    myglobal.socket.onCallLandlordTurn(function (data) {
      this._processCallLandlordTurn(data);
    }.bind(this));

    // 监听抢地主结果
    myglobal.socket.onCallLandlordResult(function (data) {
      // 🔒【重要】收到结果，停止倒计时
      this._stopBidCountdown();

      // 🔧【新增】播放抢地主语音
      this._playRobSound(data);
      if (this.node && this.node.parent) {
        this.node.parent.emit("call_landlord_result_event", data);
      }
    }.bind(this));

    // 监听抢地主阶段结束
    myglobal.socket.onCallLandlordEnd(function (data) {
      // 🔒【重要】停止所有倒计时
      this._stopBidCountdown();
      this._hideRobUI();
      this._biddingPhase = "idle";

      // 🔧【关键修复】重置抢地主相关状态
      this.rob_player_accountid = 0;
      this.cardsReady = false; // 重置发牌完成标记

      // 🔧【关键】保存底牌数据
      if (data.bottom_cards && data.bottom_cards.length > 0) {
        this.bottomCards = data.bottom_cards;
      }

      // 🔧【重要】显示底牌（所有玩家都能看到）
      this._showBottomCardsToAll(data.bottom_cards);
    }.bind(this));

    // 🔧【新增】监听地主新手牌消息 - 只更新地主的手牌，不触发重新发牌
    // 🔧【关键修复】必须验证自己是否是地主，只有地主才更新手牌
    myglobal.socket.onLandlordCards(function (data) {
      // 🔧【关键验证】检查自己是否是地主
      var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;
      var landlordId = data.landlord_id || "";

      // 🔧【关键】只有当地主ID匹配自己时才更新手牌
      if (String(landlordId) !== String(myPlayerId)) {
        return;
      }

      // 【重要】只更新手牌数据，不重新渲染整个场景
      this.handCards = data.cards || [];
      this.bottomCards = data.bottom_cards || [];

      // 【重要】使用静默更新，不触发发牌动画
      this._updateLandlordHandCards(this.handCards);
    }.bind(this));

    // 监听重新发牌通知（所有人都不叫地主）
    myglobal.socket.onRestartGame(function (data) {
      // 停止所有倒计时
      this._stopBidCountdown();
      this._stopPlayCountdown();
      // 隐藏抢地主UI
      this._hideRobUI();
      // 重置状态
      this._biddingPhase = "idle";
      this._gamePhase = "idle"; // 🔧【新增】重置游戏阶段
      this.cardsReady = false;
      this.handCards = [];
      this.bottomCards = [];
      this.choose_card_data = [];
      // 清理所有卡牌节点
      this.clearAllCards();
    }.bind(this));

    // 🔧【新增】监听出牌阶段开始
    myglobal.socket.onPlayStart(function (data) {
      // 🔧【关键】设置游戏阶段为出牌阶段
      this._gamePhase = "playing";
      this._biddingPhase = "idle";
      // 隐藏抢地主UI（确保不显示）
      this._hideRobUI();
    }.bind(this));

    // 🔊【新增】监听游戏结束
    myglobal.socket.onGameOver(function (data) {
      // 停止所有倒计时
      this._stopPlayCountdown();

      // 🔧【新增】重置游戏阶段
      this._gamePhase = "idle";
      this._biddingPhase = "idle";

      // 🔧【新增】游戏结束时立即重置所有玩家的准备状态
      this._resetAllPlayerReadyState();

      // 🔧【新增】显示结算弹窗
      this._showGameResultPopup(data);
    }.bind(this));

    // 监听游戏状态恢复
    myglobal.socket.onGameStateRestore(function (data) {
      this.restoreGameState(data);
    }.bind(this));

    // 🔧【新增】监听提示结果
    myglobal.socket.onHintResult(function (data) {
      this._onHintResult(data);
    }.bind(this));

    // 🔧【托管】监听托管状态变化
    myglobal.socket.onTrusteeStateNotify(function (data) {
      this._onTrusteeStateNotify(data);
    }.bind(this));

    // ============================================================
    // 【竞技场】消息监听
    // ============================================================

    // 监听竞技场状态更新
    myglobal.socket.onCompetitionStatus(function (data) {
      this._onCompetitionStatus(data);
    }.bind(this));

    // 监听竞技场倒计时
    myglobal.socket.onCompetitionCountdown(function (data) {
      this._onCompetitionCountdown(data);
    }.bind(this));

    // 监听比赛金币更新
    myglobal.socket.onMatchCoinUpdate(function (data) {
      this._onMatchCoinUpdate(data);
    }.bind(this));

    // 监听淘汰通知
    myglobal.socket.onCompetitionEliminated(function (data) {
      this._onCompetitionEliminated(data);
    }.bind(this));

    // 监听晋级通知
    myglobal.socket.onCompetitionAdvance(function (data) {
      this._onCompetitionAdvance(data);
    }.bind(this));

    // 监听冠军弹窗
    myglobal.socket.onCompetitionChampion(function (data) {
      this._onCompetitionChampion(data);
    }.bind(this));

    // 🔧【关键修复】监听最终榜单消息
    // 当竞技场所有轮次结束时，服务端会发送此消息
    myglobal.socket.onTournamentFinalRank(function (data) {
      console.log("🏆 [gameingUI] 收到最终榜单:", JSON.stringify(data));
      this._onTournamentFinalRank(data);
    }.bind(this));

    // 内部事件：显示底牌
    // 🔧【关键修复】此事件已废弃，逻辑已移到 onCallLandlordEnd 和 onLandlordCards
    // 保留此监听器仅用于兼容旧版本，不再触发 pushThreeCard
    this.node.on("show_bottom_card_event", function (data) {
      // 🔧【修复】data 可能是 { cards: [...] } 对象或数组
      var cards = data;
      if (data && data.cards) {
        cards = data.cards;
      }

      // 如果 cards 为空，不处理
      if (!cards || cards.length === 0) {
        return;
      }

      // 🔧【关键修复】不再调用 pushThreeCard！
      // 底牌显示已由 _showBottomCardsToAll 处理
      // 地主手牌更新已由 onLandlordCards 处理
      // 删除以下代码，避免重复处理和延迟：
      // this.scheduleOnce(this.pushThreeCard, 0.2)
    }.bind(this));

    // 🔧【修复】注册监听选择牌消息
    // card.js 是在 gameScene_node (this.node.parent) 上 emit 事件
    // 所以必须在 this.node.parent 上监听，而不是 this.node
    var gameScene_node = this.node.parent;
    if (gameScene_node) {
      gameScene_node.on("choose_card_event", function (event) {
        this.choose_card_data.push(event);
        // 🔧【新增】更新已选牌数显示
        this._updateSelectedCountDisplay();
      }.bind(this));
      gameScene_node.on("unchoose_card_event", function (event) {
        // 🔧【修复】正确匹配卡牌的唯一标识符（suit + rank）
        // event 现在是 {suit, rank} 对象
        for (var i = 0; i < this.choose_card_data.length; i++) {
          var cardid = this.choose_card_data[i].cardid;
          // 检查是否匹配（兼容新旧两种格式）
          if (cardid && cardid.suit !== undefined && cardid.rank !== undefined) {
            // 新格式：cardid 是对象 {suit, rank}
            if (cardid.suit === event.suit && cardid.rank === event.rank) {
              this.choose_card_data.splice(i, 1);
              break;
            }
          } else if (cardid == event) {
            // 旧格式兼容：cardid 是数字
            this.choose_card_data.splice(i, 1);
            break;
          }
        }
        // 🔧【新增】更新已选牌数显示
        this._updateSelectedCountDisplay();
      }.bind(this));
    }
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    this._stopPlayCountdown();
    this._stopBidCountdown();

    // 【竞技场】清理竞技场倒计时
    if (this._competitionCountdownTimer) {
      this.unschedule(this._competitionCountdownTick);
      this._competitionCountdownTimer = null;
    }

    // 🔧【新增】清理本地竞技场倒计时
    if (this._localArenaCountdownTimer) {
      this.unschedule(this._localArenaCountdownTick);
      this._localArenaCountdownTimer = null;
    }

    // 【竞技场】清理比赛金币显示
    this._hideMatchCoinDisplay();
  },
  // ============================================================
  // 【核心】唯一渲染入口
  // ============================================================

  /**
   * 【核心】渲染手牌 - 唯一入口
   * @param {Array} cards - 服务端原始手牌数据
   */
  renderCards: function renderCards(cards) {
    if (!cards || cards.length === 0) {
      return;
    }

    // 🔥【防重复渲染】检查是否与上次相同
    var hash = JSON.stringify(cards);
    if (this._lastRenderHash === hash) {
      return;
    }
    this._lastRenderHash = hash;

    // 【核心】使用斗地主规则排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
    var sortedCards = this._sortCards(cards);

    // 【核心】清理所有旧节点（解决背面牌残留）
    this.clearAllCards();

    // 创建底牌节点
    this._createBottomCards();

    // 隐藏出牌UI
    if (this.playingUI_node) {
      this.playingUI_node.active = false;
    }

    // 🎬【修复】使用逐张发牌动画
    this._dealCardsWithAnimation(sortedCards);
  },
  /**
   * 🎬【新增】逐张发牌动画
   * @param {Array} sortedCards - 已排序的手牌数据
   */
  _dealCardsWithAnimation: function _dealCardsWithAnimation(sortedCards) {
    var self = this;
    var myglobal = window.myglobal;
    var cardInterval = DealConfig.cardInterval / 1000; // 转换为秒
    var animDuration = DealConfig.animDuration;

    // 🔧【修复】确保手牌容器存在
    var cardParent = this.cards_node;
    if (!cardParent) {
      console.error("🎮 [_dealCardsWithAnimation] cards_node 未定义");
      return;
    }

    // 发牌起始位置（屏幕中央上方，模拟发牌堆）
    var deckPos = cc.v2(DealConfig.deckPosition.x, DealConfig.deckPosition.y);

    // 逐张发牌
    for (var i = 0; i < sortedCards.length; i++) {
      (function (index) {
        self.scheduleOnce(function () {
          var cardData = sortedCards[index];
          var targetX = self._getCardX(index, sortedCards.length, CardLayout.cardSpacing);
          var targetPos = cc.v2(targetX, CardLayout.cardY);

          // 创建卡牌节点
          var card = cc.instantiate(self.card_prefab);
          if (!card) return;
          card.scale = CardLayout.cardScale;
          card.parent = cardParent; // 🔧【修复】使用确定的手牌容器

          // 🎬 从发牌堆位置开始
          card.setPosition(deckPos);
          card.active = true;
          card.zIndex = index;

          // 设置卡牌显示
          var cardComp = card.getComponent("card");
          if (cardComp) {
            cardComp.showCards(cardData, myglobal.playerData.accountID);
          }

          // 🎬 播放发牌动画
          cc.tween(card).to(animDuration, {
            position: targetPos
          }, {
            easing: 'sineOut'
          }).call(function () {
            // 动画完成回调
          }).start();

          // 🔊 播放发牌音效
          if (isopen_sound) {
            playSound("sound/fapai1");
          }
        }, index * cardInterval);
      })(i);
    }

    // 发牌完成后回调
    var totalDealTime = sortedCards.length * cardInterval + animDuration;
    this.scheduleOnce(function () {
      self._onDealCardsComplete(sortedCards);
    }, totalDealTime);
  },
  /**
   * 🎬【新增】发牌完成回调
   * @param {Array} sortedCards - 已排序的手牌数据
   */
  _onDealCardsComplete: function _onDealCardsComplete(sortedCards) {
    // 标记就绪
    this.cardsReady = true;
    this.fapai_end = true;

    // 通知其他玩家节点
    if (this.node.parent) {
      this.node.parent.emit("pushcard_other_event");
    }

    // 检查是否需要显示抢地主按钮
    this._checkAndShowRobUI();
  },
  /**
   * 【核心】计算牌力值（斗地主规则）
   * 大王=15, 小王=14, 2=13, A=12, K=11, Q=10, J=9, 10=8, ..., 3=1
   * @param {Object} card - 卡牌数据
   * @returns {Number} 牌力值
   */
  getCardValue: function getCardValue(card) {
    var rank = card.rank;
    if (rank === 3) return 1; // 3
    if (rank === 4) return 2; // 4
    if (rank === 5) return 3; // 5
    if (rank === 6) return 4; // 6
    if (rank === 7) return 5; // 7
    if (rank === 8) return 6; // 8
    if (rank === 9) return 7; // 9
    if (rank === 10) return 8; // 10
    if (rank === 11) return 9; // J
    if (rank === 12) return 10; // Q
    if (rank === 13) return 11; // K
    if (rank === 14) return 12; // A
    if (rank === 15) return 13; // 2
    if (rank === 16) return 14; // 小王
    if (rank === 17) return 15; // 大王

    return 0;
  },
  /**
   * 【核心】使用 getCardValue 排序手牌
   * 斗地主标准排序：大王 > 小王 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3
   * @param {Array} cards - 服务端原始手牌数据
   * @returns {Array} 排序后的手牌数据
   */
  _sortCards: function _sortCards(cards) {
    var self = this;
    // 复制数组，避免修改原数据
    var sortedCards = cards.slice();

    // 使用 getCardValue 从大到小排序
    sortedCards.sort(function (a, b) {
      var valueA = self.getCardValue(a);
      var valueB = self.getCardValue(b);

      // 先按 value 从大到小排序
      if (valueA !== valueB) {
        return valueB - valueA;
      }
      // value 相同时，按花色排序（黑桃 > 红心 > 梅花 > 方块）
      return a.suit - b.suit;
    });
    return sortedCards;
  },
  /**
   * 【核心】清理所有旧节点（解决背面牌残留）
   * 🔥【修复】同时清理 cards_node 和 node.parent，确保无残留
   */
  clearAllCards: function clearAllCards() {
    // 🔧【修复】只清理手牌容器中的节点，不遍历node.parent
    if (this.cards_node) {
      this.cards_node.removeAllChildren();
    } else {
      console.warn("🎮 [clearAllCards] cards_node 未定义");
    }

    // 清空选中的牌数据
    this.choose_card_data = [];
  },
  /**
   * 计算牌的X坐标
   */
  _getCardX: function _getCardX(index, count, spacing) {
    var totalWidth = (count - 1) * spacing;
    var startX = -totalWidth / 2;
    return startX + index * spacing;
  },
  // ============================================================
  // 底牌相关
  // ============================================================

  /**
   * 创建底牌显示（牌背）
   */
  _createBottomCards: function _createBottomCards() {
    // 清理旧底牌
    if (this.bottom_card) {
      for (var i = 0; i < this.bottom_card.length; i++) {
        if (this.bottom_card[i]) {
          this.bottom_card[i].destroy();
        }
      }
    }
    this.bottom_card = [];
    if (!this.bottom_card_pos_node || !this.card_prefab) return;
    var bottomY = this.bottom_card_pos_node.y;
    var bottomStartX = this.bottom_card_pos_node.x - CardLayout.bottomCardSpacing;
    for (var i = 0; i < 3; i++) {
      var di_card = cc.instantiate(this.card_prefab);
      if (!di_card) continue;
      di_card.scale = CardLayout.bottomCardScale;
      di_card.setPosition(bottomStartX + CardLayout.bottomCardSpacing * i, bottomY);
      di_card.parent = this.node.parent;
      di_card.active = true;
      this.bottom_card.push(di_card);
    }
  },
  // ============================================================
  // 叫地主/抢地主相关
  // ============================================================

  _checkAndShowRobUI: function _checkAndShowRobUI() {
    var myglobal = window.myglobal;
    if (!myglobal) return;

    // 🔧【关键修复】如果在出牌阶段，不显示抢地主按钮
    var RoomState = window.RoomState || {};
    if (this._biddingPhase === "idle" && this._gamePhase === "playing") {
      return;
    }
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;
    if (this.rob_player_accountid == myPlayerId && this.cardsReady && this.robUI && !this.robUI.active) {
      if (this._biddingPhase === "bidding") {
        this._showBidUI("叫地主", "不叫");
      } else {
        this._showBidUI("抢地主", "不抢");
      }
    }
  },
  _processCallLandlordTurn: function _processCallLandlordTurn(data) {
    var myglobal = window.myglobal;
    if (!myglobal) return;
    var playerId = data.player_id;
    var timeout = data.timeout || 15;
    var round = data.round || 1;
    var expiresAt = data.expires_at || 0; // 🔧【新增】服务端过期时间戳（毫秒）

    // 🔒【重要】先停止之前的倒计时（服务器轮转了）
    this._stopBidCountdown();
    this.rob_player_accountid = playerId;
    this._bidTimeout = timeout;
    this._biddingPhase = round === 1 ? "bidding" : "robbing";
    this._bidExpiresAt = expiresAt; // 🔧【新增】保存过期时间

    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;
    if (String(playerId) === String(myPlayerId) && this.cardsReady) {
      if (round === 1) {
        this._showBidUI("叫地主", "不叫");
      } else {
        this._showBidUI("抢地主", "不抢");
      }
    } else {
      this._hideRobUI();
      if (this.node && this.node.parent) {
        this.node.parent.emit("call_landlord_turn_event", {
          player_id: playerId,
          timeout: timeout,
          round: round,
          expires_at: expiresAt
        });
      }
    }
  },
  _showBidUI: function _showBidUI(confirmText, cancelText) {
    if (!this.robUI) return;
    if (this.playingUI_node) {
      this.playingUI_node.active = false;
    }
    var confirmBtn = this.robUI.getChildByName("btn_qiandz");
    var cancelBtn = this.robUI.getChildByName("btn_buqiandz");
    if (confirmBtn) {
      var label = confirmBtn.getChildByName("Label");
      if (label && label.getComponent(cc.Label)) {
        label.getComponent(cc.Label).string = confirmText;
      }
    }
    if (cancelBtn) {
      var label = cancelBtn.getChildByName("Label");
      if (label && label.getComponent(cc.Label)) {
        label.getComponent(cc.Label).string = cancelText;
      }
    }
    this.robUI.active = true;
    this._startBidCountdown();
    if (this.node && this.node.parent) {
      // 🔧【修复】传递包含 timeout 的对象
      this.node.parent.emit("canrob_event", {
        player_id: this.rob_player_accountid,
        timeout: this._bidTimeout || 15
      });
    }
  },
  _hideRobUI: function _hideRobUI() {
    if (this.robUI) {
      this.robUI.active = false;
    }
    this._stopBidCountdown();
  },
  // ============================================================
  // 🕐【倒计时系统】标准斗地主倒计时（带分段催促效果）
  // ============================================================

  /**
   * 🕐【统一入口】开始抢地主倒计时
   * 🔧【修复】根据服务端过期时间计算剩余时间，确保与服务端同步
   * @param {number} duration - 倒计时秒数（备用，如果 expires_at 无效则使用）
   */
  _startBidCountdown: function _startBidCountdown(duration) {
    var self = this;
    // 🔒【防护】先停止之前的倒计时
    this._stopBidCountdown();
    var timeout = duration || this._bidTimeout || 15;
    var expiresAt = this._bidExpiresAt || 0;

    // 🔧【关键修复】根据服务端过期时间计算剩余时间
    var timeLeft = timeout;
    if (expiresAt > 0) {
      var now = Date.now();
      timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
    }
    this._bidTimeLeft = timeLeft;
    this._isBidCountdownTicking = true;
    this._isBidWarning = false;

    // 🕐 初始化UI显示
    this._updateBidCountdownUI();

    // 🕐 使用 cc.Node 的 schedule 实现每秒 tick
    this.schedule(this._bidCountdownTick, 1);
  },
  /**
   * 🕐【核心Tick】抢地主倒计时每秒执行
   */
  _bidCountdownTick: function _bidCountdownTick() {
    if (!this._isBidCountdownTicking) return;
    this._bidTimeLeft--;

    // 🕐 更新UI显示
    this._updateBidCountdownUI();

    // ⚠️ 5秒：进入警告状态
    if (this._bidTimeLeft === 5) {
      this._enterBidWarningState();
    }

    // 🔊 3秒：开始滴答音（每秒一次）
    if (this._bidTimeLeft <= 3 && this._bidTimeLeft > 0) {
      this._playTickSound();
    }

    // ⏰ 0秒：自动处理
    if (this._bidTimeLeft <= 0) {
      this._onBidCountdownEnd();
    }
  },
  /**
   * 🕐【UI更新】更新抢地主倒计时显示
   */
  _updateBidCountdownUI: function _updateBidCountdownUI() {
    var remaining = this._bidTimeLeft;
    var updated = false;

    // 方式1：使用 properties 绑定的 Label
    if (this.bidCountdownLabel) {
      this.bidCountdownLabel.string = String(remaining);
      updated = true;
    }

    // 方式2：尝试从 robUI 中查找倒计时 Label
    if (this.robUI) {
      var clockNode = this.robUI.getChildByName("clock");
      if (clockNode) {
        var children = clockNode.children;
        for (var j = 0; j < children.length; j++) {
          var child = children[j];
          var label = child.getComponent(cc.Label);
          if (label) {
            label.string = String(remaining);
            child.active = true;
            child.opacity = 255;
            label.fontSize = 32;
            label.lineHeight = 40;
            child.setContentSize(50, 50);
            // 🔧【修复】不通过color设置alpha
            child.color = new cc.Color(255, 255, 255);
            child.zIndex = 100;
            updated = true;
            break;
          }
        }
      }
    }

    // 方式3：通知 player_node 更新倒计时
    if (this.node && this.node.parent) {
      this.node.parent.emit("update_countdown_event", {
        type: "bid",
        remaining: remaining
      });
    }
  },
  /**
   * ⚠️【警告状态】5秒时进入警告状态
   */
  _enterBidWarningState: function _enterBidWarningState() {
    if (this._isBidWarning) return;
    this._isBidWarning = true;

    // 获取倒计时 Label 节点
    var labelNode = this._getBidCountdownLabelNode();
    if (!labelNode) return;

    // 变红
    labelNode.color = cc.Color.RED;

    // 🔥 呼吸缩放动画
    labelNode.stopAllActions();
    cc.tween(labelNode).repeatForever(cc.tween().to(0.3, {
      scale: 1.2
    }).to(0.3, {
      scale: 1.0
    })).start();
  },
  /**
   * 🕐【获取节点】获取抢地主倒计时Label节点
   * 🔧【修复】查找 clock 子节点中的 Label
   */
  _getBidCountdownLabelNode: function _getBidCountdownLabelNode() {
    if (this.bidCountdownLabel && this.bidCountdownLabel.node) {
      return this.bidCountdownLabel.node;
    }
    if (this.robUI) {
      // 检查 clock 节点下的 Label
      var clockNode = this.robUI.getChildByName("clock");
      if (clockNode) {
        var children = clockNode.children;
        for (var i = 0; i < children.length; i++) {
          var label = children[i].getComponent(cc.Label);
          if (label) {
            return children[i];
          }
        }
      }
      // 其他可能的名称
      var labelNames = ["clock_ Label", "clock_Label", "time_label", "countdown"];
      for (var j = 0; j < labelNames.length; j++) {
        var labelNode = this.robUI.getChildByName(labelNames[j]);
        if (labelNode && labelNode.getComponent(cc.Label)) {
          return labelNode;
        }
      }
    }
    return null;
  },
  /**
   * ⏰【展示结束】本地倒计时显示结束
   * ⚠️【重要】只做UI处理，不发送请求！
   * 服务器会在超时后自动处理，并发送下一个轮次消息
   */
  _onBidCountdownEnd: function _onBidCountdownEnd() {
    // 停止 tick
    this._isBidCountdownTicking = false;
    this.unschedule(this._bidCountdownTick);

    // 停止动画并恢复状态
    var labelNode = this._getBidCountdownLabelNode();
    if (labelNode) {
      labelNode.stopAllActions();
      labelNode.scale = 1;
      labelNode.color = cc.Color.WHITE;
    }

    // ⚠️【重要】不发送任何请求！
    // 服务器会在超时后自动处理
  },

  /**
   * 🔒【停止】停止抢地主倒计时
   */
  _stopBidCountdown: function _stopBidCountdown() {
    this._isBidCountdownTicking = false;
    this.unschedule(this._bidCountdownTick);

    // 恢复 Label 状态
    var labelNode = this._getBidCountdownLabelNode();
    if (labelNode) {
      labelNode.stopAllActions();
      labelNode.scale = 1;
      labelNode.color = cc.Color.WHITE;
    }
    this._isBidWarning = false;
  },
  // ============================================================
  // 🕐【出牌倒计时】标准斗地主倒计时（带分段催促效果）
  // ============================================================

  /**
   * 🕐【统一入口】开始出牌倒计时
   * @param {number} duration - 倒计时秒数，默认15秒
   */
  _startPlayCountdown: function _startPlayCountdown(duration) {
    var self = this;
    // 🔒【防护】先停止之前的倒计时
    this._stopPlayCountdown();
    var timeout = duration || this._playTimeout || 15;
    this._playTimeLeft = timeout;
    this._isPlayCountdownTicking = true;
    this._isPlayWarning = false;

    // 🕐 初始化UI显示
    this._updatePlayCountdownUI();

    // 🕐 使用 cc.Node 的 schedule 实现每秒 tick
    this.schedule(this._playCountdownTick, 1);
  },
  /**
   * 🕐【核心Tick】出牌倒计时每秒执行
   */
  _playCountdownTick: function _playCountdownTick() {
    if (!this._isPlayCountdownTicking) return;
    this._playTimeLeft--;

    // 🕐 更新UI显示
    this._updatePlayCountdownUI();

    // ⚠️ 5秒：进入警告状态
    if (this._playTimeLeft === 5) {
      this._enterPlayWarningState();
    }

    // 🔊 3秒：开始滴答音（每秒一次）
    if (this._playTimeLeft <= 3 && this._playTimeLeft > 0) {
      this._playTickSound();
    }

    // ⏰ 0秒：自动处理
    if (this._playTimeLeft <= 0) {
      this._onPlayCountdownEnd();
    }
  },
  /**
   * 🕐【UI更新】更新出牌倒计时显示
   * 🔧【修复】只更新闹钟里面的倒计时，不在其他位置显示
   */
  _updatePlayCountdownUI: function _updatePlayCountdownUI() {
    var remaining = this._playTimeLeft;

    // 方式1：使用 properties 绑定的 Label（如果有）
    if (this.playCountdownLabel) {
      this.playCountdownLabel.string = String(remaining);
    }

    // 方式2：通知 player_node 更新倒计时
    if (this.node && this.node.parent) {
      var event = new cc.Event.EventCustom("update_countdown_event", true);
      event.setUserData({
        type: "play",
        remaining: remaining
      });
      this.node.parent.dispatchEvent(event);
    }

    // 方式3：直接更新 playingUI_node 中的闹钟 Label
    // 🔧【修复】闹钟节点路径：playingUI_node -> clock -> playing_clocl_label
    if (this.playingUI_node) {
      var clockNode = this.playingUI_node.getChildByName("clock");
      if (clockNode) {
        // 确保 clock 节点可见
        clockNode.active = true;
        clockNode.opacity = 255;

        // 查找 playing_clocl_label（注意拼写）
        var clockLabel = clockNode.getChildByName("playing_clocl_label");
        if (clockLabel) {
          var label = clockLabel.getComponent(cc.Label);
          if (label) {
            label.string = String(remaining);
            clockLabel.active = true;
            clockLabel.opacity = 255;
          }
        } else {
          // 备选：查找任何 Label 子节点
          var children = clockNode.children;
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var label = child.getComponent(cc.Label);
            if (label) {
              label.string = String(remaining);
              child.active = true;
              child.opacity = 255;
              break;
            }
          }
        }
      }
    }
  },
  /**
   * 🔧【新增】更新闹钟里面的倒计时显示
   * @param {number} remaining - 剩余秒数
   */
  _updateClockTimeLabel: function _updateClockTimeLabel(remaining) {
    // 查找 gameScene 节点
    var gameSceneNode = this.node.parent;
    if (!gameSceneNode) return;

    // 遍历所有子节点，找到 player_node（当前玩家）
    var children = gameSceneNode.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var playerNodeScript = child.getComponent("player_node");
      if (playerNodeScript && playerNodeScript.seat_index === 0) {
        // 方式1：使用 time_label 属性
        if (playerNodeScript.time_label) {
          playerNodeScript.time_label.string = String(remaining);
        }

        // 方式2：查找 clockimage 节点中的 Label（与抢地主倒计时类似）
        if (playerNodeScript.clockimage) {
          var clockNode = playerNodeScript.clockimage;
          // 确保 clockimage 可见
          clockNode.active = true;
          clockNode.opacity = 255;

          // 查找 clockimage 中的 Label
          var clockChildren = clockNode.children;
          for (var j = 0; j < clockChildren.length; j++) {
            var clockChild = clockChildren[j];
            var label = clockChild.getComponent(cc.Label);
            if (label) {
              label.string = String(remaining);
              clockChild.active = true;
              clockChild.opacity = 255;
              // 设置合适的字体大小
              label.fontSize = 32;
              label.lineHeight = 40;
              clockChild.setContentSize(50, 50);
              // 🔧【修复】不通过color设置alpha
              clockChild.color = new cc.Color(255, 255, 255);
              clockChild.zIndex = 100;
              break;
            }
          }

          // 如果 clockimage 没有 Label 子节点，检查是否直接是 Label
          var directLabel = clockNode.getComponent(cc.Label);
          if (directLabel) {
            directLabel.string = String(remaining);
          }
        }
        break;
      }
    }
  },
  /**
   * ⚠️【警告状态】5秒时进入警告状态
   */
  _enterPlayWarningState: function _enterPlayWarningState() {
    if (this._isPlayWarning) return;
    this._isPlayWarning = true;

    // 获取倒计时 Label 节点
    var labelNode = this._getPlayCountdownLabelNode();
    if (!labelNode) return;

    // 变红
    labelNode.color = cc.Color.RED;

    // 🔥 呼吸缩放动画
    labelNode.stopAllActions();
    cc.tween(labelNode).repeatForever(cc.tween().to(0.3, {
      scale: 1.2
    }).to(0.3, {
      scale: 1.0
    })).start();
  },
  /**
   * 🕐【获取节点】获取出牌倒计时Label节点
   */
  _getPlayCountdownLabelNode: function _getPlayCountdownLabelNode() {
    // 方式1：使用 properties 绑定的 Label
    if (this.playCountdownLabel && this.playCountdownLabel.node) {
      return this.playCountdownLabel.node;
    }

    // 方式2：从 playingUI_node 的闹钟中获取 Label
    // 🔧【修复】闹钟节点路径：playingUI_node -> clock -> playing_clocl_label
    if (this.playingUI_node) {
      var clockNode = this.playingUI_node.getChildByName("clock");
      if (clockNode) {
        // 查找 playing_clocl_label（注意拼写）
        var clockLabel = clockNode.getChildByName("playing_clocl_label");
        if (clockLabel) {
          return clockLabel;
        }
        // 备选：查找任何 Label 子节点
        var children = clockNode.children;
        for (var i = 0; i < children.length; i++) {
          var label = children[i].getComponent(cc.Label);
          if (label) {
            return children[i];
          }
        }
      }
    }
    return null;
  },
  /**
   * ⏰【展示结束】本地出牌倒计时显示结束
   * ⚠️【重要】只做UI处理，不发送请求！
   * 服务器会在超时后自动处理（自动不出），并发送下一个轮次消息
   */
  _onPlayCountdownEnd: function _onPlayCountdownEnd() {
    // 停止 tick
    this._isPlayCountdownTicking = false;
    this.unschedule(this._playCountdownTick);

    // 停止动画并恢复状态
    var labelNode = this._getPlayCountdownLabelNode();
    if (labelNode) {
      labelNode.stopAllActions();
      labelNode.scale = 1;
      labelNode.color = cc.Color.WHITE;
    }

    // ⚠️【重要】不发送任何请求！
    // 服务器会在超时后自动处理：
    // 1. 自动不出
    // 2. 发送 can_chu_card_notify 或 game_over
    // 客户端只需要响应服务器消息
  },

  /**
   * 🔒【停止】停止出牌倒计时
   */
  _stopPlayCountdown: function _stopPlayCountdown() {
    this._isPlayCountdownTicking = false;
    this.unschedule(this._playCountdownTick);

    // 恢复 Label 状态
    var labelNode = this._getPlayCountdownLabelNode();
    if (labelNode) {
      labelNode.stopAllActions();
      labelNode.scale = 1;
      labelNode.color = cc.Color.WHITE;
    }
    this._isPlayWarning = false;
  },
  // ============================================================
  // 🔊【音效】滴答音效（3秒催促）
  // ============================================================

  /**
   * 🔊 播放滴答音效（用于抢地主倒计时）
   */
  _playTickSound: function _playTickSound() {
    if (!isopen_sound) return;

    // 优先使用绑定的音效
    if (this.tickAudio) {
      cc.audioEngine.playEffect(this.tickAudio, false);
      return;
    }

    // 兜底：使用发牌音效（可替换为专用滴答音效）
    playSound("sound/fapai1");
  },
  /**
   * 🔊 播放滴答音效（用于出牌倒计时）
   */
  _playPlayTickSound: function _playPlayTickSound() {
    if (!isopen_sound) return;

    // 优先使用绑定的音效
    if (this.tickAudio) {
      cc.audioEngine.playEffect(this.tickAudio, false);
      return;
    }

    // 兜底：使用发牌音效
    playSound("sound/fapai1");
  },
  // ============================================================
  // 🔊 抢地主语音系统（服务端驱动）
  // ============================================================

  /**
   * 🔊 播放抢地主语音
   * @param {Object} data - 服务端广播的数据
   *   - action: "call" = 抢, "pass" = 不抢
   *   - gender: "male" / "female"
   *   - order: 当前轮次内的操作顺序（1-3）
   *   - round: 当前轮次（1或2）
   */
  _playRobSound: function _playRobSound(data) {
    if (!isopen_sound) return;
    var action = data.action;
    var gender = data.gender || "male";
    var order = data.order || 1;
    var round = data.round || 1;
    var playerID = data.player_id || "";

    // 🔒【防重复机制】检查是否已经播放过相同的音效
    var soundKey = playerID + "_" + action + "_" + round + "_" + order;
    if (this._lastRobSoundKey === soundKey) {
      return;
    }
    this._lastRobSoundKey = soundKey;

    // 不抢
    if (action === "pass") {
      var passSound = gender === "female" ? "m_nv_buqiang" : "m_nan_buqiang";
      this._playSoundEffect(passSound);
      return;
    }

    // 抢地主
    if (gender === "female") {
      // 女玩家
      if (round === 1 && order === 1) {
        // 第1轮第1位
        this._playSoundEffect("m_nv_qiangdizhu_01");
      } else {
        // 第1轮第2/3位 或 第2轮第1位
        var sounds = ["m_nv_qiangdizhu_02", "m_nv_qiangdizhu_woqiang_01"];
        this._playRandomSound(sounds);
      }
    } else {
      // 男玩家
      if (round === 1 && order === 1) {
        // 第1轮第1位
        this._playSoundEffect("m_nan_qiangdizhu");
      } else {
        // 第1轮第2/3位 或 第2轮第1位
        var sounds = ["m_nan_qiangdizhu", "m_nan_qiangdizhu_woqiang"];
        this._playRandomSound(sounds);
      }
    }
  },
  /**
   * 🔊 播放音效（带 fallback 机制）
   * 🔧【重构】移除全局 fallback 到 "大你" 的逻辑
   * @param {String} name - 音效名称（不含扩展名）
   * @param {String} fallback - 可选的 fallback 音效名称（不再自动 fallback 到 "大你"）
   * @param {Boolean} allowDaniFallback - 是否允许最终 fallback 到 "大你"（默认 false）
   */
  _playSoundEffect: function _playSoundEffect(name, fallback, allowDaniFallback) {
    var self = this;
    cc.resources.load("sound/" + name, cc.AudioClip, function (err, clip) {
      if (err) {
        console.warn("🔊 [_playSoundEffect] 加载音效失败: " + name, err.message || err);

        // 🔧【fallback】尝试播放备用音效
        if (fallback) {
          cc.resources.load("sound/" + fallback, cc.AudioClip, function (err2, clip2) {
            if (err2) {
              console.warn("🔊 [_playSoundEffect] fallback 也失败: " + fallback, err2.message || err2);
              // 🔧【重要修改】不再自动 fallback 到 "大你"
              // 只有明确允许时才 fallback
              if (allowDaniFallback && fallback !== "m_cp_dani" && name !== "m_cp_dani") {
                self._playSoundEffect("m_cp_dani", null, false);
              }
              return;
            }
            cc.audioEngine.playEffect(clip2, false);
          });
        } else if (allowDaniFallback && name !== "m_cp_dani") {
          // 🔧【重要修改】不再默认 fallback 到 "大你"
          self._playSoundEffect("m_cp_dani", null, false);
        } else {}
        return;
      }
      cc.audioEngine.playEffect(clip, false);
    });
  },
  /**
   * 🔊 随机播放音效
   * @param {Array} sounds - 音效名称数组
   */
  _playRandomSound: function _playRandomSound(sounds) {
    if (!sounds || sounds.length === 0) return;
    var index = Math.floor(Math.random() * sounds.length);
    this._playSoundEffect(sounds[index]);
  },
  // ============================================================
  // 按钮点击事件
  // ============================================================

  onButtonClick: function onButtonClick(event, customData) {
    var myglobal = window.myglobal;
    switch (customData) {
      case "btn_qiandz":
        // ⚠️【已删除】按钮点击音效 - 音效由服务端广播触发（_playRobSound）
        if (this._biddingPhase === "bidding") {
          this._hideRobUI();
          myglobal.socket.requestBid(true);
        } else {
          this._hideRobUI();
          myglobal.socket.requestRobState(qian_state.qian);
        }
        break;
      case "btn_buqiandz":
        // ⚠️【已删除】按钮点击音效 - 音效由服务端广播触发（_playRobSound）
        if (this._biddingPhase === "bidding") {
          this._hideRobUI();
          myglobal.socket.requestBid(false);
        } else {
          this._hideRobUI();
          myglobal.socket.requestRobState(qian_state.buqiang);
        }
        break;
      case "nopushcard":
        this._stopPlayCountdown();
        // 🔧【修复】只发送不出请求，不本地处理
        myglobal.socket.request_buchu_card([], null);
        this.playingUI_node.active = false;
        break;
      case "tipcard":
        // 🔧【新增】提示按钮功能
        this._onHintButtonClick();
        break;
      case "pushcard":
        if (this.choose_card_data.length === 0) {
          this.tipsLabel.string = "请选择牌!";
          var self = this;
          setTimeout(function () {
            self.tipsLabel.string = "";
          }, 2000);
          return;
        }

        // 🔧【调试日志】打印选中的牌（增强版，显示牌名）
        var selectedCardNames = [];
        for (var i = 0; i < this.choose_card_data.length; i++) {
          var card = this.choose_card_data[i];
          var cardData = card.card_data || card;
          var cardName = this._getCardDisplayName(cardData);
          selectedCardNames.push(cardName);
        }

        // 🔧【新增】客户端牌型验证
        var cardsToPlay = this.choose_card_data.map(function (c) {
          return c.card_data || c;
        });
        var validationResult = this._validateHandType(cardsToPlay);
        if (!validationResult.valid) {
          this.tipsLabel.string = validationResult.message;
          var self = this;
          setTimeout(function () {
            self.tipsLabel.string = "";
          }, 2000);
          return;
        }
        var self = this;
        this._stopPlayCountdown();
        // 🔧【修复】只发送出牌请求，等待服务端广播后再更新手牌
        // 服务端会广播 card_played 消息，由 onOtherPlayerChuCard 处理
        myglobal.socket.request_chu_card(this.choose_card_data, function (err, data) {
          if (err) {
            // 🔧【改进】出牌失败，显示更详细的错误信息
            var errorMsg = data && data.msg || "出牌失败";

            // 获取用户选中的牌型
            var selectedType = validationResult.type || "未知牌型";
            var selectedCount = self.choose_card_data.length;

            // 获取上家的牌型信息
            var lastPlayedType = self._lastPlayedHandType || "未知";
            var lastPlayedCount = self._lastPlayedCards ? self._lastPlayedCards.length : 0;

            // 🔧【新增】获取上家出的牌名
            var lastPlayedCardNames = "";
            if (self._lastPlayedCards && self._lastPlayedCards.length > 0) {
              var names = [];
              for (var i = 0; i < self._lastPlayedCards.length; i++) {
                names.push(self._getCardDisplayName(self._lastPlayedCards[i]));
              }
              lastPlayedCardNames = names.join(",");
            }

            // 构建详细的错误提示
            var detailMsg = errorMsg;
            if (errorMsg.indexOf("大不过") >= 0 || errorMsg.indexOf("打不过") >= 0) {
              // 🔧【增强】显示用户选的牌名
              var yourCards = selectedCardNames.join(",");

              // 牌型不匹配或牌太小
              if (selectedCount !== lastPlayedCount && lastPlayedCount > 0) {
                detailMsg = "牌数不匹配！上家出" + lastPlayedType + "，你选了" + yourCards;
              } else if (selectedType !== lastPlayedType && lastPlayedType !== "炸弹" && lastPlayedType !== "王炸") {
                detailMsg = "牌型不匹配！上家出" + lastPlayedType + "，你选了" + yourCards;
              } else {
                // 🔧【增强】显示具体的牌名比较
                if (lastPlayedCardNames) {
                  detailMsg = "打不过！上家出" + lastPlayedCardNames + "，你选了" + yourCards;
                } else {
                  detailMsg = "牌太小！你选了" + yourCards + "打不过上家";
                }
              }
            }
            self.tipsLabel.string = detailMsg;
            setTimeout(function () {
              self.tipsLabel.string = "";
            }, 3000); // 延长显示时间到3秒
            self._resetCardFlags();
            self.choose_card_data = [];
          } else {
            // 🔧【关键修复】出牌成功，不在这里删除手牌！
            // 等待服务端广播 card_played 消息，由 onOtherPlayerChuCard 处理
            self.playingUI_node.active = false;
            // 清空选中的牌
            self.choose_card_data = [];
          }
        });
        break;
    }
  },
  _resetCardFlags: function _resetCardFlags() {
    // 🔧【修复】只重置手牌容器中的牌节点
    var cardParent = this.cards_node;
    if (!cardParent) {
      console.warn("🎮 [_resetCardFlags] cards_node 未定义，尝试查找手牌容器");
      // 尝试通过节点名称查找
      var gameSceneNode = this.node.parent;
      if (gameSceneNode) {
        for (var i = 0; i < gameSceneNode.children.length; i++) {
          var child = gameSceneNode.children[i];
          if (child.name === "cards_node" || child.name === "cards") {
            cardParent = child;
            this.cards_node = child;
            break;
          }
        }
      }
    }

    // 重置所有牌的选中状态
    if (cardParent) {
      var children = cardParent.children;
      for (var i = 0; i < children.length; i++) {
        children[i].emit("reset_card_flag");
      }
    } else {
      console.error("🎮 [_resetCardFlags] 找不到手牌容器");
    }
    // 🔧【新增】清空选牌后更新显示
    this._updateSelectedCountDisplay();
  },
  /**
   * 🔧【新增】更新已选牌数显示
   * ⚠️【修复】用户要求该位置不显示任何文字，已禁用 tipsLabel 显示
   * 仅在控制台输出日志用于调试
   */
  _updateSelectedCountDisplay: function _updateSelectedCountDisplay() {
    var count = this.choose_card_data.length;

    // 如果没有选中牌，直接返回
    if (count === 0) {
      return;
    }

    // 获取选中的牌数据
    var cardsToPlay = this.choose_card_data.map(function (c) {
      return c.card_data || c;
    });

    // 验证牌型
    var validationResult = this._validateHandType(cardsToPlay);

    // 构建显示文本（仅用于日志）
    var displayText = "已选 " + count + " 张";
    if (validationResult.valid) {
      displayText += " - " + validationResult.type;
    } else {
      displayText += " - " + validationResult.message;
    }

    // ⚠️【禁用】不再在 tipsLabel 上显示文字
    // 仅输出控制台日志用于调试
  },

  // ============================================================
  // 出牌相关
  // ============================================================

  /**
   * 🔧【已废弃】地主获得底牌后添加到手牌
   * ⚠️【重要】此函数已废弃，不再使用！
   * 地主手牌更新由 onLandlordCards 处理，通过服务端 landlord_cards 消息
   * 保留此函数仅用于兼容，不会触发重新发牌动画
   */
  pushThreeCard: function pushThreeCard() {
    // 🔧【关键修复】不再执行任何操作！
    // 底牌已通过 landlord_cards 消息由服务端直接更新地主手牌
    // 此函数保留仅为兼容旧代码引用
    return;
  },
  /**
   * 🔧【新增】从手牌中删除已出的牌（服务端驱动）
   * @param {Array} cards - 服务端返回的已出牌数据 [{suit, rank}, ...]
   */
  _removeCardsFromHand: function _removeCardsFromHand(cards) {
    if (!cards || cards.length === 0) return;

    // 遍历要删除的牌
    for (var i = 0; i < cards.length; i++) {
      var cardToRemove = cards[i];
      // 在手牌中查找并删除
      for (var j = this.handCards.length - 1; j >= 0; j--) {
        if (this.handCards[j].rank === cardToRemove.rank && this.handCards[j].suit === cardToRemove.suit) {
          this.handCards.splice(j, 1);
          break;
        }
      }
    }

    // 🔧【关键修复】清空选中的牌数据，防止残留
    this.choose_card_data = [];

    // 🔧【修复】使用静默更新，不触发发牌动画
    this._updateHandCardsSilent(this.handCards);
  },
  /**
   * 🔧【新增】静默更新手牌（不触发发牌动画）
   * 用于出牌后更新手牌显示
   * @param {Array} cards - 手牌数据
   */
  _updateHandCardsSilent: function _updateHandCardsSilent(cards) {
    if (!cards) return;
    var myglobal = window.myglobal;
    if (!myglobal) return;

    // 排序手牌
    var sortedCards = this._sortCards(cards);

    // 🔧【修复】只使用cards_node，不遍历node.parent
    var cardsParent = this.cards_node;
    if (!cardsParent) {
      console.error("🎮 [_updateHandCardsSilent] cards_node 未定义");
      return;
    }

    // 🔧【关键修复】先销毁所有旧手牌节点，确保事件监听器被清理
    var oldChildren = cardsParent.children;
    for (var i = oldChildren.length - 1; i >= 0; i--) {
      var child = oldChildren[i];
      // 先取消所有事件监听
      child.off(cc.Node.EventType.TOUCH_START);
      // 再销毁节点
      child.destroy();
    }
    // 再次确保清空
    cardsParent.removeAllChildren();

    // 🔧【关键修复】清空选中的牌数据，防止残留
    this.choose_card_data = [];

    // 重新创建手牌节点（无动画）
    for (var i = 0; i < sortedCards.length; i++) {
      var cardData = sortedCards[i];
      var targetX = this._getCardX(i, sortedCards.length, CardLayout.cardSpacing);
      var card = cc.instantiate(this.card_prefab);
      if (!card) continue;
      card.scale = CardLayout.cardScale;
      card.parent = cardsParent;
      card.setPosition(targetX, CardLayout.cardY);
      card.active = true;
      card.zIndex = i;
      var cardComp = card.getComponent("card");
      if (cardComp) {
        cardComp.showCards(cardData, myglobal.playerData.accountID);
      }
    }

    // 重置渲染哈希，允许后续渲染
    this._lastRenderHash = JSON.stringify(cards);
  },
  /**
   * ⚠️【已废弃】旧版删除手牌方法
   * 保留仅为兼容，新代码应使用 _removeCardsFromHand
   */
  destoryCard: function destoryCard(accountid, choose_card) {
    if (choose_card.length === 0) return;
    var destroy_card = [];
    for (var i = 0; i < choose_card.length; i++) {
      for (var j = this.handCards.length - 1; j >= 0; j--) {
        if (this.handCards[j].rank === choose_card[i].card_data.rank && this.handCards[j].suit === choose_card[i].card_data.suit) {
          // 从手牌数据中删除
          this.handCards.splice(j, 1);
          break;
        }
      }
    }

    // 重新渲染
    this.renderCards(this.handCards);

    // 显示出的牌
    if (this.cards_node && this.cards_node.children.length > 0) {
      var outCard_node = this._getOutCardNode(accountid);
      if (outCard_node) {
        // 找到已选中的牌节点
        var selectedNodes = [];
        var children = this.cards_node.children;
        for (var i = 0; i < children.length; i++) {
          var cardComp = children[i].getComponent("card");
          if (cardComp && cardComp.flag) {
            selectedNodes.push(children[i]);
          }
        }
        this.showOutCards(outCard_node, selectedNodes);
      }
    }
  },
  _getOutCardNode: function _getOutCardNode(accountid) {
    var gameScene_script = this.node.parent.getComponent("gameScene");
    return gameScene_script ? gameScene_script.getUserOutCardPosByAccount(accountid) : null;
  },
  // ============================================================
  // 提示按钮功能
  // ============================================================

  /**
   * 🔧【修改】提示按钮点击处理 - 改为请求服务端提示
   * 使用事件监听方式处理响应，不使用回调（因为服务端不返回callIndex）
   */
  _onHintButtonClick: function _onHintButtonClick() {
    // 重置选中的牌
    this._resetCardFlags();
    this.choose_card_data = [];

    // 请求服务端提示（不使用回调，依赖事件监听器处理响应）
    var myglobal = window.myglobal;
    if (myglobal && myglobal.socket) {
      // 直接发送消息，响应将通过 onHintResult 事件监听器处理
      myglobal.socket.sendHintRequest();
    }
  },
  /**
   * 🔧【新增】处理服务端返回的提示结果
   * @param {Object} data - 服务端返回的提示数据
   *   - cards: 提示的牌数组 [{suit, rank}, ...]
   *   - index: 当前提示索引（从0开始）
   *   - total: 总共有多少种提示
   */
  _onHintResult: function _onHintResult(data) {
    if (!data || !data.cards || data.cards.length === 0) {
      // 🔧【修复】没有能过的牌时立即提示不出，不再等待1-2秒
      // this.tipsLabel.string = "没有可出的牌"
      var self = this;

      // 立即自动不出，不再延迟
      self._stopPlayCountdown();
      var myglobal = window.myglobal;
      if (myglobal && myglobal.socket) {
        myglobal.socket.request_buchu_card([], null);
      }
      if (self.playingUI_node) {
        self.playingUI_node.active = false;
      }

      // 1.5秒后清空提示文字
      setTimeout(function () {
        self.tipsLabel.string = "";
      }, 1500);
      return;
    }

    // 选中提示的牌
    this._selectCards(data.cards);

    // 🔧【修改】去掉桌面上的白色文字提示
    // 不再显示 "提示: X张牌" 信息
  },

  /**
   * 🔧【托管】处理托管状态变化通知
   * @param {Object} data - 托管状态数据
   *   - player_id: 玩家ID
   *   - player_name: 玩家名字
   *   - is_trustee: 是否托管
   *   - reason: 原因 (timeout/disconnect/reconnect)
   */
  _onTrusteeStateNotify: function _onTrusteeStateNotify(data) {
    // 通知所有玩家节点更新托管状态
    if (this.node && this.node.parent) {
      this.node.parent.emit("trustee_state_update", data);
    }
  },
  /**
   * 查找可以出的牌（本地fallback）
   * @param {Array} lastSelected - 上次选中的牌（用于找下一组）
   * @returns {Array} 可以出的牌
   */
  _findPlayableCards: function _findPlayableCards(lastSelected) {
    var self = this;

    // 如果没有手牌，不处理
    if (!this.handCards || this.handCards.length === 0) {
      return null;
    }

    // 统计手牌
    var cardCounts = {};
    for (var i = 0; i < this.handCards.length; i++) {
      var rank = this.handCards[i].rank;
      if (!cardCounts[rank]) {
        cardCounts[rank] = [];
      }
      cardCounts[rank].push(this.handCards[i]);
    }

    // 如果是新一轮（必须出牌）
    if (this._mustPlay || !this._lastPlayedCards || this._lastPlayedCards.length === 0) {
      return this._findSmallestCards(cardCounts);
    }

    // 如果不能打过，不提示
    if (!this._canBeat) {
      return null;
    }

    // 获取上家牌型信息
    var lastType = this._lastPlayedHandType || "";
    var lastRank = this._getLastPlayedMainRank();
    var lastCount = this._lastPlayedCards.length;

    // 根据牌型查找能打过的最小牌
    switch (lastType.toLowerCase()) {
      case "single":
      case "solo":
      case "单张":
        return this._findBeatingSingle(cardCounts, lastRank);
      case "pair":
      case "double":
      case "对子":
        return this._findBeatingPair(cardCounts, lastRank);
      case "triple":
      case "three":
      case "三张":
        return this._findBeatingTriple(cardCounts, lastRank, 0);
      case "triplewithsingle":
      case "sandaiyi":
      case "三带一":
        return this._findBeatingTriple(cardCounts, lastRank, 1);
      case "triplewithpair":
      case "sandaidui":
      case "三带二":
        return this._findBeatingTriple(cardCounts, lastRank, 2);
      case "bomb":
      case "zhadan":
      case "炸弹":
        return this._findBeatingBomb(cardCounts, lastRank);
      default:
        // 未知牌型，尝试按张数处理
        return this._findBeatingByCount(cardCounts, lastCount, lastRank);
    }
  },
  /**
   * 获取上家出的牌的主牌点数
   */
  _getLastPlayedMainRank: function _getLastPlayedMainRank() {
    if (!this._lastPlayedCards || this._lastPlayedCards.length === 0) {
      return 0;
    }
    // 统计每个点数出现的次数
    var counts = {};
    for (var i = 0; i < this._lastPlayedCards.length; i++) {
      var rank = this._lastPlayedCards[i].rank;
      counts[rank] = (counts[rank] || 0) + 1;
    }
    // 找出出现次数最多的点数（主牌）
    var maxCount = 0;
    var mainRank = 0;
    for (var rank in counts) {
      if (counts[rank] > maxCount) {
        maxCount = counts[rank];
        mainRank = parseInt(rank);
      }
    }
    return mainRank;
  },
  /**
   * 找最小的牌（新一轮时使用）
   */
  _findSmallestCards: function _findSmallestCards(cardCounts) {
    // 按点数从小到大排序
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });

    // 优先出单张
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (cardCounts[rank].length === 1) {
        return [cardCounts[rank][0]];
      }
    }

    // 没有单张则出最小的对子
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (cardCounts[rank].length === 2) {
        return cardCounts[rank];
      }
    }

    // 出最小的三张
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (cardCounts[rank].length === 3) {
        return cardCounts[rank];
      }
    }

    // 出最小的炸弹
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (cardCounts[rank].length === 4) {
        return cardCounts[rank];
      }
    }

    // 兜底：出最小的牌
    if (ranks.length > 0) {
      return [cardCounts[ranks[0]][0]];
    }
    return null;
  },
  /**
   * 找能打过的最小单张
   */
  _findBeatingSingle: function _findBeatingSingle(cardCounts, targetRank) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (rank > targetRank) {
        return [cardCounts[rank][0]];
      }
    }
    // 没有能打过的单张，尝试炸弹
    return this._findSmallestBomb(cardCounts);
  },
  /**
   * 找能打过的最小对子
   */
  _findBeatingPair: function _findBeatingPair(cardCounts, targetRank) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (rank > targetRank && cardCounts[rank].length >= 2) {
        return [cardCounts[rank][0], cardCounts[rank][1]];
      }
    }
    // 没有能打过的对子，尝试炸弹
    return this._findSmallestBomb(cardCounts);
  },
  /**
   * 找能打过的最小三张（带或不带）
   */
  _findBeatingTriple: function _findBeatingTriple(cardCounts, targetRank, kickers) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });

    // 找三张
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (rank > targetRank && cardCounts[rank].length >= 3) {
        var result = [cardCounts[rank][0], cardCounts[rank][1], cardCounts[rank][2]];

        // 如果需要带牌
        if (kickers > 0) {
          var kickerCards = this._findKickerCards(cardCounts, rank, kickers);
          if (kickerCards) {
            result = result.concat(kickerCards);
            return result;
          }
        } else {
          return result;
        }
      }
    }

    // 尝试从四张中拆三张
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (rank > targetRank && cardCounts[rank].length === 4) {
        var result = [cardCounts[rank][0], cardCounts[rank][1], cardCounts[rank][2]];
        if (kickers > 0) {
          var kickerCards = this._findKickerCards(cardCounts, rank, kickers);
          if (kickerCards) {
            result = result.concat(kickerCards);
            return result;
          }
        } else {
          return result;
        }
      }
    }

    // 尝试炸弹
    return this._findSmallestBomb(cardCounts);
  },
  /**
   * 找带牌
   */
  _findKickerCards: function _findKickerCards(cardCounts, excludeRank, count) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });
    var kickers = [];
    for (var i = 0; i < ranks.length && kickers.length < count; i++) {
      var rank = ranks[i];
      if (rank !== excludeRank) {
        var available = Math.min(cardCounts[rank].length, count - kickers.length);
        for (var j = 0; j < available; j++) {
          kickers.push(cardCounts[rank][j]);
        }
      }
    }
    return kickers.length === count ? kickers : null;
  },
  /**
   * 找能打过的最小炸弹
   */
  _findBeatingBomb: function _findBeatingBomb(cardCounts, targetRank) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (rank > targetRank && cardCounts[rank].length === 4) {
        return cardCounts[rank];
      }
    }
    // 没有能打过的炸弹，尝试王炸
    return this._findRocket(cardCounts);
  },
  /**
   * 找最小的炸弹
   */
  _findSmallestBomb: function _findSmallestBomb(cardCounts) {
    var ranks = Object.keys(cardCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });
    for (var i = 0; i < ranks.length; i++) {
      var rank = ranks[i];
      if (cardCounts[rank].length === 4) {
        return cardCounts[rank];
      }
    }
    return this._findRocket(cardCounts);
  },
  /**
   * 找王炸
   */
  _findRocket: function _findRocket(cardCounts) {
    var jokers = [];
    if (cardCounts[16] && cardCounts[16].length > 0) {
      jokers.push(cardCounts[16][0]);
    }
    if (cardCounts[17] && cardCounts[17].length > 0) {
      jokers.push(cardCounts[17][0]);
    }
    return jokers.length === 2 ? jokers : null;
  },
  /**
   * 按张数找能打过的牌
   */
  _findBeatingByCount: function _findBeatingByCount(cardCounts, count, targetRank) {
    // 简单实现：按张数处理
    if (count === 1) {
      return this._findBeatingSingle(cardCounts, targetRank);
    } else if (count === 2) {
      return this._findBeatingPair(cardCounts, targetRank);
    } else if (count === 3) {
      return this._findBeatingTriple(cardCounts, targetRank, 0);
    } else if (count === 4) {
      // 可能是炸弹
      return this._findBeatingBomb(cardCounts, targetRank);
    } else if (count >= 5) {
      // 可能是顺子、连对等，暂不支持提示
      return null;
    }
    return null;
  },
  /**
   * 选中指定的牌
   * @param {Array} cards - 要选中的牌
   */
  _selectCards: function _selectCards(cards) {
    if (!cards || cards.length === 0) {
      return;
    }

    // 🔧【修复】只从手牌容器中查找，不遍历node.parent
    var cardParent = this.cards_node;
    if (!cardParent) {
      console.warn("🎮 [_selectCards] cards_node 未定义，尝试查找手牌容器");
      // 尝试通过节点名称查找
      var gameSceneNode = this.node.parent;
      if (gameSceneNode) {
        for (var i = 0; i < gameSceneNode.children.length; i++) {
          var child = gameSceneNode.children[i];
          if (child.name === "cards_node" || child.name === "cards") {
            cardParent = child;
            this.cards_node = child;
            break;
          }
        }
      }
    }
    if (!cardParent) {
      console.error("🎮 [_selectCards] 找不到手牌容器");
      return;
    }
    var children = cardParent.children;
    var foundCount = 0;
    var alreadyMatched = {}; // 🔧【新增】记录已匹配的牌，防止重复匹配

    for (var i = 0; i < children.length; i++) {
      var cardNode = children[i];
      var cardComp = cardNode.getComponent("card");
      if (cardComp && cardComp.card_data) {
        // 检查这张牌是否在要选中的牌中
        for (var j = 0; j < cards.length; j++) {
          var matchKey = cards[j].suit + "_" + cards[j].rank;
          // 🔧【修复】检查是否已经匹配过这张牌
          if (alreadyMatched[matchKey]) {
            continue;
          }
          if (cardComp.card_data.rank === cards[j].rank && cardComp.card_data.suit === cards[j].suit) {
            // 🔧【修复】检查是否已经选中
            if (!cardComp.flag) {
              // 选中这张牌
              cardComp.flag = true;
              cardNode.y += 20; // 向上移动表示选中
              this.choose_card_data.push({
                cardid: cardComp.card_id,
                card_data: cardComp.card_data
              });
              foundCount++;
              alreadyMatched[matchKey] = true; // 标记已匹配
            } else {}
            break;
          }
        }
      }
    }
    if (foundCount === 0) {
      this.tipsLabel.string = "提示失败，请手动选牌";
      var self = this;
      setTimeout(function () {
        self.tipsLabel.string = "";
      }, 2000);
    }
  },
  clearOutZone: function clearOutZone(accountid) {
    var outCard_node = this._getOutCardNode(accountid);
    if (outCard_node) {
      outCard_node.removeAllChildren(true);
    }
  },
  showOutCards: function showOutCards(outCard_node, cards) {
    if (!outCard_node || !cards || cards.length === 0) return;
    outCard_node.removeAllChildren(true);
    var count = cards.length;
    for (var i = 0; i < count; i++) {
      var card = cards[i];
      outCard_node.addChild(card, i);
      card.setScale(CardLayout.outCardScale, CardLayout.outCardScale);
      var x = this._getCardX(i, count, CardLayout.outCardSpacing);
      card.setPosition(x, 0);
    }
  },
  // ============================================================
  // 游戏状态恢复（断线重连）
  // ============================================================

  restoreGameState: function restoreGameState(data) {
    var gameState = data.game_state;
    if (!gameState) {
      return;
    }

    // 🔧【关键】设置游戏阶段
    if (gameState.phase === "bidding") {
      this._gamePhase = "bidding";
      this._biddingPhase = "bidding";
    } else if (gameState.phase === "playing") {
      this._gamePhase = "playing";
      this._biddingPhase = "idle";
    }

    // 恢复玩家信息
    if (gameState.players) {
      for (var i = 0; i < gameState.players.length; i++) {
        var p = gameState.players[i];
        if (p.is_landlord && window.myglobal.playerData) {
          window.myglobal.playerData.master_accountid = p.id;
        }
      }

      // 🔧【新增】通知其他玩家节点更新
      if (this.node && this.node.parent) {
        this.node.parent.emit("players_restored_event", {
          players: gameState.players
        });
      }
    }

    // 🔧【关键修复】恢复手牌
    if (gameState.hand) {
      // 🔧【关键】重置渲染哈希，确保手牌会被更新
      this._lastRenderHash = "";

      // 保存手牌数据
      this.handCards = gameState.hand;

      // 标记发牌完成
      this.cardsReady = true;
      this.fapai_end = true;

      // 🔧【关键】使用静默更新，不触发发牌动画
      this._updateHandCardsSilent(this.handCards);
    } else {}

    // 恢复底牌
    if (gameState.bottom_cards && gameState.bottom_cards.length > 0) {
      this.bottomCards = gameState.bottom_cards;
      for (var i = 0; i < this.bottom_card.length && i < this.bottomCards.length; i++) {
        if (this.bottom_card[i]) {
          var cardComp = this.bottom_card[i].getComponent("card");
          if (cardComp) {
            cardComp.showCards(this.bottomCards[i]);
          }
        }
      }
    }

    // 🔧【新增】恢复上家出的牌
    if (gameState.last_played && gameState.last_played.length > 0) {
      this._lastPlayedCards = gameState.last_played;
      this._lastPlayedHandType = gameState.last_played.hand_type || "";

      // 🔧【新增】显示上家出的牌
      if (gameState.last_player_id) {
        var gameScene_script = this.node.parent.getComponent("gameScene");
        if (gameScene_script) {
          var outCard_node = gameScene_script.getUserOutCardPosByAccount(gameState.last_player_id);
          if (outCard_node && this.card_prefab) {
            // 清除旧的出牌
            outCard_node.removeAllChildren();

            // 显示上家出的牌
            var node_cards = [];
            for (var i = 0; i < gameState.last_played.length; i++) {
              var card = cc.instantiate(this.card_prefab);
              if (card) {
                var cardScript = card.getComponent("card");
                if (cardScript) {
                  cardScript.showCards(gameState.last_played[i], window.myglobal.playerData.accountID);
                }
                node_cards.push(card);
              }
            }
            this.showOutCards(outCard_node, node_cards);
          }
        }
      }
    }

    // 恢复出牌轮次
    if (gameState.phase === "playing" && gameState.current_turn) {
      var myPlayerId = window.myglobal.socket.getPlayerInfo().id || window.myglobal.playerData.accountID;

      // 🔧【关键】隐藏抢地主UI
      this._hideRobUI();
      if (String(gameState.current_turn) === String(myPlayerId)) {
        this.playingUI_node.active = true;

        // 🔧【新增】保存出牌状态
        this._mustPlay = gameState.must_play || false;
        this._canBeat = gameState.can_beat || false;

        // 🔧【新增】启动出牌倒计时（如果服务端提供了剩余时间）
        // 注意：服务端应该在重连后发送 can_chu_card_notify 消息来启动倒计时
      } else {
        if (this.playingUI_node) {
          this.playingUI_node.active = false;
        }
      }
    }

    // 🔧【新增】如果是抢地主阶段
    if (gameState.phase === "bidding") {
      // 注意：服务端应该在重连后发送 call_landlord_turn_notify 消息来显示抢地主按钮
    }
  },
  // ============================================================
  // 🔧【新增】底牌显示和地主手牌更新
  // ============================================================

  /**
   * 🔧【新增】显示底牌给所有玩家（翻牌动画）
   * @param {Array} cards - 底牌数据
   */
  _showBottomCardsToAll: function _showBottomCardsToAll(cards) {
    if (!cards || cards.length === 0) {
      return;
    }

    // 更新底牌显示
    for (var i = 0; i < cards.length && i < this.bottom_card.length; i++) {
      var cardNode = this.bottom_card[i];
      if (!cardNode) continue;
      var cardScript = cardNode.getComponent("card");
      if (cardScript) {
        cardScript.showCards(cards[i]);
      }
    }
  },
  /**
   * 🔧【新增】静默更新地主的手牌（不触发发牌动画）
   * 只在地主收到 LANDLORD_CARDS 消息时调用
   * @param {Array} cards - 地主的完整手牌（含底牌）
   */
  _updateLandlordHandCards: function _updateLandlordHandCards(cards) {
    if (!cards || cards.length === 0) {
      return;
    }
    var myglobal = window.myglobal;
    if (!myglobal) return;

    // 排序手牌
    var sortedCards = this._sortCards(cards);

    // 🔧【修复】确保手牌容器存在
    var cardsParent = this.cards_node;
    if (!cardsParent) {
      console.error("🃏 [_updateLandlordHandCards] cards_node 未定义");
      return;
    }

    // 清理旧手牌节点
    cardsParent.removeAllChildren();

    // 重新创建手牌节点（无动画）
    for (var i = 0; i < sortedCards.length; i++) {
      var cardData = sortedCards[i];
      var targetX = this._getCardX(i, sortedCards.length, CardLayout.cardSpacing);
      var card = cc.instantiate(this.card_prefab);
      if (!card) continue;
      card.scale = CardLayout.cardScale;
      card.parent = cardsParent; // 🔧【修复】使用确定的手牌容器
      card.setPosition(targetX, CardLayout.cardY);
      card.active = true;
      card.zIndex = i;
      var cardComp = card.getComponent("card");
      if (cardComp) {
        cardComp.showCards(cardData, myglobal.playerData.accountID);
      }
    }

    // 重置渲染哈希，允许后续渲染
    this._lastRenderHash = JSON.stringify(cards);
  },
  // ============================================================
  // 🔊【出牌音效系统】使用实际音效文件
  // 音效文件命名规则：
  // - 男版: m_cp_{type}_{rank}.mp3 或 m_cp_{type}.mp3
  // - 女版: m_cp_nv_{type}_{rank}.mp3 或 m_cp_nv_{type}.mp3
  // 注意：大小王(rank=14/15)没有对子音效，因为两张王是王炸不是对子
  // 
  // 🔧【音效规则】
  // 1. 首出（is_new_round=true）：播放对应牌型的音效
  // 2. 压牌（is_new_round=false, can_beat=true）：
  //    - 有对应音效文件：播放牌型音效
  //    - 无对应音效文件（如对子14/15）：播放"大你"音效
  // 3. 炸弹/王炸：始终播放炸弹/王炸音效
  // ============================================================

  /**
   * 🔊 播放出牌音效
   * 🔧【全面重构版】严格遵循"大你"音效使用规则
   * 
   * @param {Object} data - 服务端广播的数据
   *   - hand_type: 牌型名称 (single/pair/triple/straight/bomb/rocket/liandui/plane/sandaiyi/sandaidui/sidaier/sidailiangdui)
   *   - rank: 主牌点数 (用于单张/对子/三张)
   *   - gender: "male" / "female"
   *   - is_new_round: 是否是新回合（首出）
   *   - can_beat: 是否压过上家
   * 
   * 【核心规则】"大你"音效(m_cp_dani)的使用场景：
   * 
   * 场景1 - 首出(is_new_round=true)：
   *   ✅ 只播放牌型音效
   *   ❌ 禁止播放"大你"
   * 
   * 场景2 - 压牌(is_new_round=false && can_beat=true)：
   *   🎲 70% 概率播放牌型音效
   *   🎲 30% 概率播放"大你"
   *   （如果牌型音效文件不存在，100%播放"大你"）
   * 
   * 场景3 - 炸弹/王炸：
   *   ✅ 始终播放炸弹/王炸音效
   */
  _playCardSound: function _playCardSound(data) {
    if (!isopen_sound) return;

    // 🔧【调试】打印完整数据结构

    var handType = data.hand_type || "";
    var gender = data.gender || "male";
    var isNewRound = data.is_new_round !== undefined ? data.is_new_round : true;
    var canBeat = data.can_beat !== undefined ? data.can_beat : false;

    // 🔧【核心修复】优先从 cards 中提取主牌值
    var rank = this._extractMainRank(data);

    // 🔊【调试日志】详细输出音效播放参数

    // 🔧【检查】是否是炸弹或王炸（特殊处理）
    var type = (handType || "").toLowerCase();
    var isBomb = type === "bomb" || type === "zhadan" || type === "炸弹";
    var isRocket = type === "rocket" || type === "wangzha" || type === "王炸";

    // 炸弹和王炸始终播放对应音效
    if (isBomb || isRocket) {
      var soundName = this._getCardTypeSound(handType, rank, gender);
      if (soundName) {
        this._playSoundEffect(soundName);
      }
      return;
    }

    // 🔧【核心】获取牌型音效
    var cardSound = this._getCardTypeSound(handType, rank, gender);
    var prefix = gender === "female" ? "m_cp_nv_" : "m_cp_";
    var daniSound = prefix + "dani";

    // 🔧【检查】牌型是否有对应的音效文件
    var hasSpecificSound = this._hasSpecificCardSound(handType, rank);

    // 🔧【核心修复】正确的"大你"播放逻辑
    // 
    // 规则说明：
    // 1. 首出(is_new_round=true)：只播放牌型音效，禁止"大你"
    // 2. 压牌(is_new_round=false && can_beat=true)：随机播放，70%牌型音效，30%"大你"
    // 3. 压牌但音效文件缺失：播放"大你"

    if (isNewRound) {
      // ✅【场景1】首出：只播放牌型音效，禁止"大你"
      if (cardSound) {
        this._playSoundEffect(cardSound);
      } else {
        // 首出但没有对应音效文件（不应该发生，但安全处理）
        console.warn("🔊 [_playCardSound] ⚠️ 首出但无对应音效文件: " + handType + ", rank=" + rank);
        // 🔧【重要】首出不播放"大你"，静默跳过
      }
    } else if (canBeat) {
      // ✅【场景2】压牌场景：随机播放（70%牌型，30%大你）
      if (hasSpecificSound && cardSound) {
        // 随机选择：70%牌型，30%大你
        var randomValue = Math.random();
        if (randomValue < 0.7) {
          // 70% 播放牌型音效
          this._playSoundEffect(cardSound);
        } else {
          // 30% 播放"大你"
          this._playSoundEffect(daniSound);
        }
      } else {
        // 音效文件缺失，播放"大你"
        this._playSoundEffect(daniSound);
      }
    } else {
      // ✅【场景3】压牌但can_beat=false（不应该发生，但安全处理）
      // 这种情况理论上不应该出现，因为服务端只在成功压牌时设置can_beat=true
      if (cardSound) {
        this._playSoundEffect(cardSound);
      } else {
        console.warn("🔊 [_playCardSound] ⚠️ 异常场景：压牌但can_beat=false且无音效");
      }
    }
  },
  /**
   * 🔧【新增】检查牌型是否有对应的音效文件
   * 🔧【修复】增加更多牌型支持，确保覆盖服务端所有牌型名称
   * @param {String} handType - 牌型名称
   * @param {Number} rank - 主牌点数
   * @returns {Boolean} 是否有对应音效文件
   */
  _hasSpecificCardSound: function _hasSpecificCardSound(handType, rank) {
    var type = (handType || "").toLowerCase();
    var soundIndex = this._rankToSoundIndex(rank);

    // 单张：有1-15的音效文件
    // 服务端发送: "单张"
    if (type === "single" || type === "solo" || type.indexOf("单张") !== -1) {
      var hasSound = soundIndex >= 1 && soundIndex <= 15;
      return hasSound;
    }

    // 对子：只有1-13的音效文件（没有对子14/15，因为大王小王没有对子音效）
    // 服务端发送: "对子"
    if (type === "pair" || type === "double" || type.indexOf("对子") !== -1) {
      var hasSound = soundIndex >= 1 && soundIndex <= 13;
      return hasSound;
    }

    // 三张：只有1-13的音效文件
    // 服务端发送: "三张"
    if (type === "triple" || type === "three" || type === "trio" || type.indexOf("三张") !== -1) {
      var hasSound = soundIndex >= 1 && soundIndex <= 13;
      return hasSound;
    }

    // 特殊牌型都有对应音效
    // 服务端发送: "连对", "顺子", "飞机", "飞机带单", "飞机带对", "三带一", "三带二", "四带二", "四带两对", "炸弹", "王炸"
    var specialTypes = [
    // 英文名称
    "liandui", "straight", "plane", "feiji", "sandaiyi", "sandaidui", "sidaier", "sidailiangdui", "bomb", "zhadan", "rocket", "wangzha",
    // 中文名称（服务端发送的名称）
    "连对", "顺子", "飞机", "三带一", "三带二", "四带二", "四带两对", "炸弹", "王炸"];
    for (var i = 0; i < specialTypes.length; i++) {
      if (type.indexOf(specialTypes[i]) !== -1) {
        return true;
      }
    }
    return false;
  },
  /**
   * 🔧【核心修复】从数据中提取主牌点数
   * 
   * 优先级：
   * 1. 服务端传递的 rank（如果有效）
   * 2. 从 cards 数组中提取（根据牌型）
   * 
   * @param {Object} data - 服务端广播的数据
   * @returns {Number} 主牌点数（服务端 rank 格式：3-17）
   */
  _extractMainRank: function _extractMainRank(data) {
    // 优先使用服务端传递的 rank
    if (data.rank && data.rank > 0) {
      return data.rank;
    }

    // 如果服务端 rank 无效，从 cards 中提取
    var cards = data.cards || [];
    var handType = (data.hand_type || "").toLowerCase();
    if (cards.length === 0) {
      console.warn("🔊 [_extractMainRank] cards数组为空，无法提取rank");
      return 0;
    }

    // 对 cards 进行排序（从大到小）
    var sortedCards = cards.slice().sort(function (a, b) {
      return (b.rank || 0) - (a.rank || 0);
    });

    // 根据牌型提取主牌
    // 单张
    if (handType.indexOf("single") !== -1 || handType.indexOf("单张") !== -1) {
      var rank = this._extractCardRank(sortedCards[0]);
      return rank;
    }

    // 对子 - 取任意一张的rank（它们相同）
    if (handType.indexOf("pair") !== -1 || handType.indexOf("对子") !== -1) {
      var rank = this._extractCardRank(sortedCards[0]);
      return rank;
    }

    // 三张 - 取三张中任意一张的rank
    if (handType.indexOf("triple") !== -1 || handType.indexOf("三张") !== -1 || handType.indexOf("trio") !== -1 || handType.indexOf("three") !== -1) {
      var rank = this._extractCardRank(sortedCards[0]);
      return rank;
    }

    // 三带一/三带二 - 取最大的三张
    if (handType.indexOf("sandaiyi") !== -1 || handType.indexOf("三带一") !== -1 || handType.indexOf("sandaidui") !== -1 || handType.indexOf("三带二") !== -1) {
      // 统计每个rank出现的次数
      var counts = {};
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].rank;
        counts[r] = (counts[r] || 0) + 1;
      }
      // 找到出现次数最多的rank
      var maxCount = 0;
      var mainRank = 0;
      for (var r in counts) {
        if (counts[r] >= 3 && counts[r] > maxCount) {
          maxCount = counts[r];
          mainRank = parseInt(r);
        }
      }
      return mainRank;
    }

    // 其他牌型 - 取最大的牌
    var rank = this._extractCardRank(sortedCards[0]);
    return rank;
  },
  /**
   * 🔧【辅助】从单个card对象中提取rank
   * @param {Object} card - 卡牌对象
   * @returns {Number} rank值
   */
  _extractCardRank: function _extractCardRank(card) {
    if (!card) {
      console.warn("🔊 [_extractCardRank] card为空");
      return 0;
    }

    // 尝试各种可能的字段
    if (card.rank !== undefined && card.rank > 0) {
      return Number(card.rank);
    }
    if (card.value !== undefined && card.value > 0) {
      return Number(card.value);
    }
    if (card.logic_value !== undefined && card.logic_value > 0) {
      return Number(card.logic_value);
    }
    if (card.card_data && card.card_data.rank !== undefined) {
      return Number(card.card_data.rank);
    }
    console.warn("🔊 [_extractCardRank] 无法提取rank，card:", JSON.stringify(card));
    return 0;
  },
  /**
   * 🔧【核心修复】服务端 rank 转换为音效文件编号
   * 
   * 服务端 rank 定义：
   * - 3-10 = 3-10
   * - J=11, Q=12, K=13, A=14, 2=15
   * - 小王=16, 大王=17
   * 
   * 音效文件编号：
   * - 1 = A
   * - 2 = 2
   * - 3-13 = 3-K
   * - 14 = 小王
   * - 15 = 大王
   * 
   * @param {Number} rank - 服务端牌面值 (3-17)
   * @returns {Number} 音效文件编号 (1-15)，如果无法转换返回 0
   */
  _rankToSoundIndex: function _rankToSoundIndex(rank) {
    if (rank === 14) return 1; // A → 1
    if (rank === 15) return 2; // 2 → 2
    if (rank >= 3 && rank <= 13) return rank; // 3-K 直接使用
    if (rank === 16) return 14; // 小王 → 14
    if (rank === 17) return 15; // 大王 → 15
    return 0; // 无效
  },

  /**
   * 🔊 根据牌型获取音效名称
   * 🔧【修复】使用 indexOf 匹配中文牌型名称，确保兼容服务端发送的中文名称
   * @param {String} handType - 牌型名称
   * @param {Number} rank - 主牌点数 (服务端定义: 3-17, A=14, 2=15, 小王=16, 大王=17)
   * @param {String} gender - 性别
   * @returns {String} 音效名称（不含路径和扩展名），如果没有对应音效返回null
   */
  _getCardTypeSound: function _getCardTypeSound(handType, rank, gender) {
    var type = (handType || "").toLowerCase();
    var prefix = gender === "female" ? "m_cp_nv_" : "m_cp_";

    // 🔧【合法性校验】检查rank是否有效
    if (!rank || rank === 0) {
      console.error("🔊 [_getCardTypeSound] 非法rank: " + rank + ", handType=" + handType);
      return null;
    }

    // 🔧【修复】将服务端 rank 转换为音效文件编号
    var soundIndex = this._rankToSoundIndex(rank);

    // 单张（支持中英文）
    // 服务端发送: "单张"
    // 音效文件编号：1=A, 2=2, 3-13=3-K, 14=小王, 15=大王
    if (type === "single" || type === "solo" || type.indexOf("单张") !== -1) {
      if (soundIndex >= 1 && soundIndex <= 15) {
        return prefix + "danzhang_" + soundIndex;
      }
      console.warn("🔊 [_getCardTypeSound] 单张音效索引无效: rank=" + rank + ", soundIndex=" + soundIndex);
      return null;
    }

    // 对子（支持中英文）
    // 服务端发送: "对子"
    // 音效文件编号：1=A, 2=2, 3-13=3-K（注意：文件只有1-13，没有14/15）
    if (type === "pair" || type === "double" || type.indexOf("对子") !== -1) {
      if (soundIndex >= 1 && soundIndex <= 13) {
        return prefix + "duizi_" + soundIndex;
      }
      console.warn("🔊 [_getCardTypeSound] 对子音效文件不存在: rank=" + rank + ", soundIndex=" + soundIndex);
      return null;
    }

    // 三张（支持中英文）
    // 服务端发送: "三张"
    // 音效文件编号：1=A, 2=2, 3-13=3-K（注意：文件只有1-13）
    if (type === "triple" || type === "three" || type === "trio" || type.indexOf("三张") !== -1) {
      if (soundIndex >= 1 && soundIndex <= 13) {
        return prefix + "sange_" + soundIndex;
      }
      console.warn("🔊 [_getCardTypeSound] 三张音效文件不存在: rank=" + rank + ", soundIndex=" + soundIndex);
      return null;
    }

    // 🔧【修复】特殊牌型映射表（支持中英文）
    var specialTypes = {
      // 英文名称
      "liandui": "liandui",
      // 连对
      "straight": "shunzi",
      // 顺子
      "plane": "feiji",
      // 飞机
      "feiji": "feiji",
      // 飞机
      "sandaiyi": "sandaiyi",
      // 三带一
      "sandaidui": "sandaidui",
      // 三带对
      "sidaier": "sidaier",
      // 四带二
      "sidailiangdui": "sidailiangdui",
      // 四带两对
      "bomb": "zhadan",
      // 炸弹
      "zhadan": "zhadan",
      // 炸弹
      "rocket": "wangzha",
      // 王炸
      "wangzha": "wangzha",
      // 王炸
      // 中文名称（服务端发送的名称）
      "连对": "liandui",
      "顺子": "shunzi",
      "飞机": "feiji",
      "飞机带单": "feiji",
      "飞机带对": "feiji",
      "三带一": "sandaiyi",
      "三带二": "sandaidui",
      "四带二": "sidaier",
      "四带两对": "sidailiangdui",
      "炸弹": "zhadan",
      "王炸": "wangzha"
    };

    // 查找特殊牌型
    for (var key in specialTypes) {
      if (type.indexOf(key) !== -1) {
        var suffix = specialTypes[key];
        // 🔧【修复】女版炸弹使用 m_cp_nv_zhadan（如果存在），否则使用男版
        // 注意：目前 m_cp_nv_zhadan.mp3 不存在，所以女版也使用男版炸弹音效
        if (suffix === "zhadan") {
          // 先尝试女版炸弹音效
          if (gender === "female") {
            return "m_cp_zhadan"; // 女版暂时使用男版炸弹音效（因为m_cp_nv_zhadan不存在）
          }

          return "m_cp_zhadan";
        }
        // 🔧【修复】女版王炸有单独音效
        if (suffix === "wangzha") {
          return prefix + "wangzha";
        }
        return prefix + suffix;
      }
    }

    // 未知牌型，返回null
    console.warn("🔊 [_getCardTypeSound] 未知牌型: " + type);
    return null;
  },
  /**
   * 🔊 播放不出音效（随机播放"不要"/"要不起"）
   * @param {Object} data - 服务端广播的数据
   *   - gender: "male" / "female"
   */
  _playPassSound: function _playPassSound(data) {
    if (!isopen_sound) return;
    var gender = data.gender || "male";

    // 男版：随机播放"不要"或"要不起"
    // 文件：m_cp_buyao.mp3, m_cp_yaobuqi.mp3
    // 女版：随机播放"不要"或"要不起"
    // 文件：m_cp_nv_buyao.mp3, m_nv_yaobuqi.wav

    var sounds;
    if (gender === "female") {
      sounds = ["m_cp_nv_buyao", "m_nv_yaobuqi"];
    } else {
      sounds = ["m_cp_buyao", "m_cp_yaobuqi"];
    }

    // 随机选择一个
    var randomIndex = Math.floor(Math.random() * sounds.length);
    var soundName = sounds[randomIndex];
    this._playSoundEffect(soundName);
  },
  /**
   * 🔊 播放胜利/失败音效
   * @param {Boolean} isWin - 是否胜利
   */
  _playGameResultSound: function _playGameResultSound(isWin) {
    if (!isopen_sound) return;
    var soundName = isWin ? "m_yingle" : "m_shule";
    this._playSoundEffect(soundName);
  },
  /**
   * 🔊 显示不出效果
   * @param {String} accountid - 玩家ID
   */
  _showPassEffect: function _showPassEffect(accountid) {
    // 获取对应玩家的出牌区域
    var gameScene_script = this.node.parent.getComponent("gameScene");
    if (!gameScene_script) return;
    var outCard_node = gameScene_script.getUserOutCardPosByAccount(accountid);
    if (!outCard_node) return;

    // 清空出牌区域
    outCard_node.removeAllChildren(true);

    // 创建"不出"文字显示
    var passNode = new cc.Node("pass_label");
    var label = passNode.addComponent(cc.Label);
    label.string = "不出";
    label.fontSize = 28;
    label.lineHeight = 36;
    passNode.color = cc.color(255, 200, 100);

    // 添加描边
    var outline = passNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(100, 50, 0);
    outline.width = 2;
    passNode.parent = outCard_node;
    passNode.setPosition(0, 0);

    // 2秒后自动消失
    this.scheduleOnce(function () {
      if (passNode && passNode.isValid) {
        passNode.destroy();
      }
    }, 2);
  },
  /**
   * 🔧【新增】获取牌的显示名称
   * @param {Object} card - 牌数据 {suit, rank}
   * @returns {String} 牌的中文名称，如 "大王"、"小王"、"黑桃A" 等
   */
  _getCardDisplayName: function _getCardDisplayName(card) {
    if (!card) return "未知牌";
    var suit = card.suit;
    var rank = card.rank;

    // 大小王
    if (rank === 17) return "大王";
    if (rank === 16) return "小王";

    // 花色名称
    var suitNames = {
      0: "黑桃",
      1: "红心",
      2: "梅花",
      3: "方块",
      4: ""
    };
    var suitName = suitNames[suit] || "";

    // 牌面名称
    var rankNames = {
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "J",
      12: "Q",
      13: "K",
      14: "A",
      15: "2"
    };
    var rankName = rankNames[rank] || String(rank);
    return suitName + rankName;
  },
  // ============================================================
  // 🔧【新增】客户端牌型验证
  // ============================================================

  /**
   * 🔧【新增】验证牌型是否有效
   * @param {Array} cards - 要验证的牌数据 [{suit, rank, color}, ...]
   * @returns {Object} {valid: boolean, type: string, message: string}
   */
  _validateHandType: function _validateHandType(cards) {
    if (!cards || cards.length === 0) {
      return {
        valid: false,
        type: "",
        message: "请选择要出的牌"
      };
    }
    var count = cards.length;

    // 统计各点数的牌数量
    var rankCounts = {};
    for (var i = 0; i < cards.length; i++) {
      var rank = cards[i].rank;
      if (!rankCounts[rank]) {
        rankCounts[rank] = 0;
      }
      rankCounts[rank]++;
    }

    // 获取点数列表（排序后）
    var ranks = Object.keys(rankCounts).map(function (r) {
      return parseInt(r);
    }).sort(function (a, b) {
      return a - b;
    });

    // 获取数量统计
    var counts = Object.values(rankCounts);
    var fours = []; // 四张
    var threes = []; // 三张
    var pairs = []; // 对子
    var singles = []; // 单张

    for (var rank in rankCounts) {
      var c = rankCounts[rank];
      if (c === 4) fours.push(parseInt(rank));else if (c === 3) threes.push(parseInt(rank));else if (c === 2) pairs.push(parseInt(rank));else if (c === 1) singles.push(parseInt(rank));
    }

    // 1. 王炸（双王）
    if (count === 2 && rankCounts[16] === 1 && rankCounts[17] === 1) {
      return {
        valid: true,
        type: "王炸",
        message: ""
      };
    }

    // 2. 单张
    if (count === 1) {
      return {
        valid: true,
        type: "单张",
        message: ""
      };
    }

    // 3. 对子
    if (count === 2 && pairs.length === 1) {
      return {
        valid: true,
        type: "对子",
        message: ""
      };
    }

    // 4. 三张
    if (count === 3 && threes.length === 1) {
      return {
        valid: true,
        type: "三张",
        message: ""
      };
    }

    // 5. 炸弹
    if (count === 4 && fours.length === 1) {
      return {
        valid: true,
        type: "炸弹",
        message: ""
      };
    }

    // 6. 三带一
    if (count === 4 && threes.length === 1 && singles.length === 1) {
      return {
        valid: true,
        type: "三带一",
        message: ""
      };
    }

    // 7. 三带二
    if (count === 5 && threes.length === 1 && pairs.length === 1) {
      return {
        valid: true,
        type: "三带二",
        message: ""
      };
    }

    // 8. 四带二（单）
    if (count === 6 && fours.length === 1 && (singles.length === 2 || pairs.length === 1)) {
      return {
        valid: true,
        type: "四带二",
        message: ""
      };
    }

    // 9. 四带两对
    if (count === 8 && fours.length === 1 && pairs.length === 2) {
      return {
        valid: true,
        type: "四带两对",
        message: ""
      };
    }

    // 10. 顺子（至少5张连续，不包含2和王）
    if (count >= 5 && singles.length === count) {
      // 检查是否连续且不包含2和王
      var isSequential = this._isSequential(ranks);
      var noTwoOrJoker = ranks.every(function (r) {
        return r < 15;
      }); // rank < 15 表示不是2和王
      if (isSequential && noTwoOrJoker) {
        return {
          valid: true,
          type: "顺子",
          message: ""
        };
      }
    }

    // 11. 连对（至少3对连续）
    if (count >= 6 && count % 2 === 0 && pairs.length === count / 2) {
      var pairRanks = pairs.sort(function (a, b) {
        return a - b;
      });
      var isSequential = this._isSequential(pairRanks);
      var noTwoOrJoker = pairRanks.every(function (r) {
        return r < 15;
      });
      if (isSequential && noTwoOrJoker) {
        return {
          valid: true,
          type: "连对",
          message: ""
        };
      }
    }

    // 12. 飞机（至少2个连续三张）
    if (threes.length >= 2) {
      var threeRanks = threes.sort(function (a, b) {
        return a - b;
      });
      var isSequential = this._isSequential(threeRanks);
      var noTwoOrJoker = threeRanks.every(function (r) {
        return r < 15;
      });
      if (isSequential && noTwoOrJoker) {
        var threeCount = threes.length;

        // 飞机不带翅膀
        if (count === threeCount * 3) {
          return {
            valid: true,
            type: "飞机",
            message: ""
          };
        }

        // 飞机带单
        if (count === threeCount * 4 && singles.length === threeCount) {
          return {
            valid: true,
            type: "飞机带单",
            message: ""
          };
        }

        // 飞机带对
        if (count === threeCount * 5 && pairs.length === threeCount) {
          return {
            valid: true,
            type: "飞机带对",
            message: ""
          };
        }
      }
    }

    // 无效牌型
    return {
      valid: false,
      type: "",
      message: "无效的牌型，请重新选择"
    };
  },
  /**
   * 检查点数是否连续
   * @param {Array} ranks - 排序后的点数数组
   * @returns {Boolean} 是否连续
   */
  _isSequential: function _isSequential(ranks) {
    if (!ranks || ranks.length < 2) return true;
    for (var i = 1; i < ranks.length; i++) {
      if (ranks[i] - ranks[i - 1] !== 1) {
        return false;
      }
    }
    return true;
  },
  // ============================================================
  // 🔧【新增】结算弹窗系统
  // ============================================================

  /**
   * 🏆 显示游戏结算弹窗
   * @param {Object} data - 服务端广播的结算数据
   */
  _showGameResultPopup: function _showGameResultPopup(data) {
    // ============================================================
    // 【竞技场】检查是否是竞技场模式
    // ============================================================
    if (this._isCompetition || data.room_category === 2) {
      // 竞技场模式使用特殊的结算页
      this._showCompetitionResultPopup(data);
      return;
    }

    // 判断当前玩家是否胜利
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;
    var isWinner = false;
    var myWinGold = 0;

    // 从 players 数组中找到当前玩家的结果
    if (data.players && data.players.length > 0) {
      for (var i = 0; i < data.players.length; i++) {
        var player = data.players[i];
        if (String(player.player_id) === String(myPlayerId)) {
          isWinner = player.is_winner;
          myWinGold = player.win_gold;
          break;
        }
      }
    } else {
      // 兼容旧版本：通过 winner_id 判断
      isWinner = String(data.winner_id) === String(myPlayerId);
      if (!isWinner && !data.is_landlord) {
        var isLandlord = myglobal.playerData.master_accountid === myPlayerId;
        if (!isLandlord) {
          isWinner = true;
        }
      }
    }

    // 🔧【关键修复】更新本地玩家的金币数量
    if (myglobal.playerData && myWinGold !== 0) {
      var oldGold = myglobal.playerData.gobal_count || 0;
      var newGold = oldGold + myWinGold;
      // 确保金币不为负数
      if (newGold < 0) {
        newGold = 0;
      }
      myglobal.playerData.gobal_count = newGold;
    }

    // 🔧【新增】更新所有玩家的金币显示
    if (data.players && data.players.length > 0) {
      for (var i = 0; i < data.players.length; i++) {
        var player = data.players[i];
        var playerId = player.player_id;
        var goldAfter = player.gold_after;

        // 🔧【修复】只要 goldAfter >= 0 就更新显示（包括 0 的情况）
        // 服务端返回的 gold_after >= 0 表示查询到了有效数据
        if (goldAfter >= 0) {
          this._updatePlayerGoldDisplay(playerId, goldAfter);
        } else {
          // 如果服务端没有返回有效的 gold_after，则本地计算
          // 这种情况下，只更新当前玩家的金币
          if (String(playerId) === String(myPlayerId) && myWinGold !== 0) {
            var localGold = myglobal.playerData.gobal_count || 0;
            this._updatePlayerGoldDisplay(playerId, localGold);
          }
        }
      }
    }

    // 播放结果音效
    this._playGameResultSound(isWinner);

    // 创建结算弹窗
    var self = this;
    this._createGameResultPopup(data, isWinner, myWinGold, function (action) {
      if (action === "continue") {
        // 继续游戏：发送 ready 请求
        self._continueGame();
      } else if (action === "lobby") {
        // 返回大厅
        self._returnToLobby();
      }
    });
  },
  /**
   * 🏆 创建结算弹窗UI - 欢乐斗地主高级风格
   * @param {Object} data - 结算数据
   * @param {Boolean} isWinner - 是否胜利
   * @param {Number} myWinGold - 当前玩家输赢豆子
   * @param {Function} callback - 回调函数
   */
  _createGameResultPopup: function _createGameResultPopup(data, isWinner, myWinGold, callback) {
    var self = this;
    var winSize = cc.winSize;

    // 🔧【关键修复】找到Canvas节点作为弹窗父节点
    var canvas = cc.find("Canvas") || cc.find("UI_ROOT") || this.node.parent;
    if (!canvas) {
      console.error("🏆 [_createGameResultPopup] 找不到Canvas节点");
      canvas = this.node;
    }

    // ==================== 遮罩层 ====================
    var maskNode = new cc.Node();
    maskNode.name = "GameResultMask";
    maskNode.addComponent(cc.BlockInputEvents);
    var maskSprite = maskNode.addComponent(cc.Sprite);
    maskSprite.spriteFrame = new cc.SpriteFrame();
    maskSprite.type = cc.Sprite.Type.SIMPLE;
    maskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    // 🔧【修复】不通过color设置alpha，使用opacity代替
    maskNode.color = isWinner ? new cc.Color(0, 0, 30) : new cc.Color(30, 0, 0);
    maskNode.opacity = 0;
    maskNode.x = 0;
    maskNode.y = 0;
    maskNode.zIndex = 999; // 🔧【修复】遮罩层zIndex
    maskNode.parent = canvas;

    // 遮罩淡入动画
    cc.tween(maskNode).to(0.3, {
      opacity: 255
    }).start();

    // ==================== 弹窗容器 ====================
    var popupNode = new cc.Node();
    popupNode.name = "GameResultPopup";
    popupNode.x = 0;
    popupNode.y = 0;
    popupNode.scale = 0.5;
    popupNode.opacity = 0;
    popupNode.zIndex = 1000; // 🔧【修复】弹窗层zIndex
    popupNode.parent = canvas;

    // 弹窗尺寸（70%宽，75%高）
    var popupWidth = Math.min(winSize.width * 0.7, 800);
    var popupHeight = Math.min(winSize.height * 0.75, 550);

    // ==================== 主背景 - 渐变效果 ====================
    var bgNode = self._createGradientBackground(popupWidth, popupHeight, isWinner);
    bgNode.parent = popupNode;

    // ==================== 金边描边 ====================
    var borderNode = self._createGoldenBorder(popupWidth, popupHeight, isWinner);
    borderNode.parent = popupNode;

    // ==================== 粒子特效层 ====================
    var effectLayer = new cc.Node("EffectLayer");
    effectLayer.parent = popupNode;

    // 胜利粒子特效
    if (isWinner) {
      self._createVictoryParticles(effectLayer, popupWidth, popupHeight);
    } else {
      self._createDefeatParticles(effectLayer, popupWidth, popupHeight);
    }

    // ==================== 顶部 Banner ====================
    var bannerY = popupHeight / 2 - 60;
    var bannerNode = self._createResultBanner(isWinner, popupWidth);
    bannerNode.y = bannerY;
    bannerNode.parent = popupNode;

    // ==================== 右侧倍数详情卡 ====================
    var detailX = popupWidth / 2 - 130;
    var detailY = 20;
    var detailNode = self._createMultiplierDetailCard(data, isWinner);
    detailNode.x = detailX;
    detailNode.y = detailY;
    detailNode.parent = popupNode;

    // ==================== 中间玩家结果列表 ====================
    var listWidth = popupWidth * 0.55;
    var listX = -popupWidth / 2 + listWidth / 2 + 50;
    var listY = -20;
    var playerListNode = self._createPlayerResultList(data, isWinner, myWinGold, listWidth);
    playerListNode.x = listX;
    playerListNode.y = listY;
    playerListNode.parent = popupNode;

    // ==================== 底部按钮区域 ====================
    var btnY = -popupHeight / 2 + 60;
    var buttonArea = self._createButtonArea(isWinner, function (action) {
      self._closeGameResultPopup(popupNode, maskNode);
      if (callback) callback(action);
    });
    buttonArea.y = btnY;
    buttonArea.parent = popupNode;

    // ==================== 弹出动画 ====================
    cc.tween(popupNode).to(0.35, {
      scale: 1,
      opacity: 255
    }, {
      easing: 'backOut'
    }).call(function () {
      // 触发数字滚动动画
      self._startNumberAnimations(popupNode, data, myWinGold);
    }).start();

    // 保存引用
    this._gameResultPopup = popupNode;
    this._gameResultMask = maskNode;
    this._resultEffectLayer = effectLayer;
  },
  // ============================================================
  // 🎨 结算弹窗视觉组件 - 高级效果
  // ============================================================

  /**
   * 🎨 创建渐变背景
   */
  _createGradientBackground: function _createGradientBackground(width, height, isWinner) {
    var bgNode = new cc.Node("GradientBg");
    var graphics = bgNode.addComponent(cc.Graphics);

    // 渐变色
    var topColor = isWinner ? new cc.Color(40, 30, 80, 255) : new cc.Color(30, 30, 40, 255);
    var bottomColor = isWinner ? new cc.Color(20, 15, 50, 255) : new cc.Color(20, 20, 30, 255);

    // 绘制渐变矩形（模拟）
    graphics.fillColor = bottomColor;
    graphics.roundRect(-width / 2, -height / 2, width, height, 20);
    graphics.fill();

    // 添加内发光效果
    var innerGlow = new cc.Node("InnerGlow");
    var glowSprite = innerGlow.addComponent(cc.Sprite);
    glowSprite.spriteFrame = new cc.SpriteFrame();
    glowSprite.type = cc.Sprite.Type.SLICED;
    innerGlow.width = width - 20;
    innerGlow.height = height - 20;
    // 🔧【修复】不通过color设置alpha，使用opacity代替
    innerGlow.color = isWinner ? new cc.Color(60, 40, 100) : new cc.Color(40, 40, 50);
    innerGlow.opacity = 100;
    innerGlow.parent = bgNode;

    // 添加背景纹理效果
    var overlay = new cc.Node("Overlay");
    var overlaySprite = overlay.addComponent(cc.Sprite);
    overlaySprite.spriteFrame = new cc.SpriteFrame();
    overlay.width = width;
    overlay.height = height;
    // 🔧【修复】不通过color设置alpha，使用opacity代替
    overlay.color = isWinner ? new cc.Color(80, 50, 120) : new cc.Color(50, 50, 60);
    overlay.opacity = 30;
    overlay.parent = bgNode;
    return bgNode;
  },
  /**
   * 🎨 创建金边描边
   */
  _createGoldenBorder: function _createGoldenBorder(width, height, isWinner) {
    var borderNode = new cc.Node("GoldenBorder");
    var graphics = borderNode.addComponent(cc.Graphics);

    // 边框颜色
    var borderColor = isWinner ? new cc.Color(255, 200, 50, 255) : new cc.Color(100, 100, 120, 255);
    var glowColor = isWinner ? new cc.Color(255, 180, 0, 150) : new cc.Color(80, 80, 100, 100);

    // 外发光
    graphics.strokeColor = glowColor;
    graphics.lineWidth = 8;
    graphics.roundRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 24);
    graphics.stroke();

    // 主边框
    graphics.strokeColor = borderColor;
    graphics.lineWidth = 3;
    graphics.roundRect(-width / 2, -height / 2, width, height, 20);
    graphics.stroke();

    // 角落装饰
    var cornerSize = 30;
    var corners = [{
      x: -width / 2,
      y: height / 2,
      rot: 0
    }, {
      x: width / 2,
      y: height / 2,
      rot: 90
    }, {
      x: width / 2,
      y: -height / 2,
      rot: 180
    }, {
      x: -width / 2,
      y: -height / 2,
      rot: 270
    }];
    for (var i = 0; i < corners.length; i++) {
      var corner = corners[i];
      var decorNode = new cc.Node("Corner_" + i);
      var dg = decorNode.addComponent(cc.Graphics);
      dg.strokeColor = borderColor;
      dg.lineWidth = 2;
      dg.moveTo(0, 0);
      dg.lineTo(cornerSize, 0);
      dg.lineTo(cornerSize, cornerSize);
      dg.stroke();
      decorNode.x = corner.x;
      decorNode.y = corner.y;
      decorNode.angle = corner.rot;
      decorNode.parent = borderNode;
    }
    return borderNode;
  },
  /**
   * 🏆 创建结果Banner（胜利/失败标题）
   */
  _createResultBanner: function _createResultBanner(isWinner, popupWidth) {
    var bannerNode = new cc.Node("ResultBanner");

    // Banner背景
    var bgNode = new cc.Node("BannerBg");
    var graphics = bgNode.addComponent(cc.Graphics);
    var bannerWidth = popupWidth * 0.6;
    var bannerHeight = 70;
    if (isWinner) {
      // 胜利 - 金色渐变背景
      graphics.fillColor = new cc.Color(200, 150, 30, 200);
      graphics.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 35);
      graphics.fill();

      // 发光边框
      graphics.strokeColor = new cc.Color(255, 220, 100, 255);
      graphics.lineWidth = 3;
      graphics.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 35);
      graphics.stroke();
    } else {
      // 失败 - 暗红色背景
      graphics.fillColor = new cc.Color(80, 40, 50, 200);
      graphics.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 35);
      graphics.fill();
      graphics.strokeColor = new cc.Color(150, 100, 100, 255);
      graphics.lineWidth = 2;
      graphics.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 35);
      graphics.stroke();
    }
    bgNode.parent = bannerNode;

    // 标题文字
    var titleNode = new cc.Node("Title");
    titleNode.anchorX = 0.5;
    titleNode.anchorY = 0.5;
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = isWinner ? "🏆 胜 利 🏆" : "✖ 失 败 ✖";
    titleLabel.fontSize = 42;
    titleLabel.lineHeight = 50;
    titleLabel.fontFamily = "Arial";
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    titleNode.color = isWinner ? new cc.Color(255, 255, 255) : new cc.Color(200, 180, 180);

    // 添加描边
    var outline = titleNode.addComponent(cc.LabelOutline);
    outline.color = isWinner ? new cc.Color(150, 100, 0) : new cc.Color(80, 40, 40);
    outline.width = 3;

    // 添加发光效果（使用阴影模拟）
    var shadow = titleNode.addComponent(cc.LabelShadow);
    shadow.color = isWinner ? new cc.Color(255, 200, 0, 200) : new cc.Color(100, 50, 50, 150);
    shadow.offset = cc.v2(0, 0);
    shadow.blur = 8;
    titleNode.parent = bannerNode;

    // 胜利时的呼吸发光动画
    if (isWinner) {
      cc.tween(bannerNode).repeatForever(cc.tween().to(1.0, {
        scale: 1.02
      }).to(1.0, {
        scale: 1.0
      })).start();
    }
    return bannerNode;
  },
  /**
   * 📊 创建倍数详情卡
   */
  _createMultiplierDetailCard: function _createMultiplierDetailCard(data, isWinner) {
    var cardNode = new cc.Node("MultiplierCard");
    var cardWidth = 180;
    var cardHeight = 250; // 增加高度以容纳王炸行

    // 卡片背景
    var bgNode = new cc.Node("CardBg");
    var graphics = bgNode.addComponent(cc.Graphics);
    graphics.fillColor = isWinner ? new cc.Color(50, 35, 70, 220) : new cc.Color(35, 35, 45, 220);
    graphics.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 15);
    graphics.fill();
    graphics.strokeColor = isWinner ? new cc.Color(180, 140, 60, 200) : new cc.Color(80, 80, 100, 200);
    graphics.lineWidth = 2;
    graphics.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 15);
    graphics.stroke();
    bgNode.parent = cardNode;

    // 标题
    var titleNode = new cc.Node("Title");
    titleNode.anchorX = 0.5;
    titleNode.anchorY = 0.5;
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "本局详情";
    titleLabel.fontSize = 20;
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    titleNode.color = new cc.Color(200, 200, 200);
    titleNode.y = cardHeight / 2 - 25;
    titleNode.parent = cardNode;

    // 分隔线
    var lineNode = new cc.Node("Line");
    var lg = lineNode.addComponent(cc.Graphics);
    lg.strokeColor = new cc.Color(100, 100, 100, 150);
    lg.lineWidth = 1;
    lg.moveTo(-cardWidth / 2 + 15, 0);
    lg.lineTo(cardWidth / 2 - 15, 0);
    lg.stroke();
    lineNode.y = cardHeight / 2 - 50;
    lineNode.parent = cardNode;

    // 详情列表
    var multiDetail = data.multi_detail || {};
    var details = [{
      label: "底分",
      value: data.base_score || 10
    }, {
      label: "抢地主",
      value: multiDetail.qiang_count > 0 ? "x" + multiDetail.qiang_multi : "-"
    }, {
      label: "炸弹",
      value: multiDetail.bomb_count > 0 ? "x" + multiDetail.bomb_multi : "-"
    }, {
      label: "王炸",
      value: multiDetail.rocket_count > 0 ? "x" + multiDetail.rocket_multi : "-"
    }, {
      label: "春天",
      value: multiDetail.spring_type > 0 ? "x2" : "-"
    }];
    var itemY = cardHeight / 2 - 75;
    var itemHeight = 28;
    for (var i = 0; i < details.length; i++) {
      var item = details[i];
      var itemNode = new cc.Node("Item_" + i);

      // 标签
      var labelNode = new cc.Node("Label");
      labelNode.anchorX = 0.5;
      labelNode.anchorY = 0.5;
      var label = labelNode.addComponent(cc.Label);
      label.string = item.label;
      label.fontSize = 16;
      label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      label.verticalAlign = cc.Label.VerticalAlign.CENTER;
      labelNode.color = new cc.Color(180, 180, 180);
      labelNode.x = -cardWidth / 2 + 35;
      labelNode.parent = itemNode;

      // 值
      var valueNode = new cc.Node("Value");
      valueNode.anchorX = 0.5;
      valueNode.anchorY = 0.5;
      var valueLabel = valueNode.addComponent(cc.Label);
      valueLabel.string = String(item.value);
      valueLabel.fontSize = 16;
      valueLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      valueLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
      valueNode.color = new cc.Color(255, 220, 150);
      valueNode.x = cardWidth / 2 - 40;
      valueNode.parent = itemNode;
      itemNode.y = itemY - i * itemHeight;
      itemNode.parent = cardNode;
    }

    // 总倍数（大号金色）
    var totalMultiNode = new cc.Node("TotalMulti");
    var totalMultiBg = new cc.Node("Bg");
    var tmg = totalMultiBg.addComponent(cc.Graphics);
    tmg.fillColor = isWinner ? new cc.Color(80, 50, 20, 200) : new cc.Color(40, 40, 50, 200);
    tmg.roundRect(-cardWidth / 2 + 10, -cardHeight / 2 + 5, cardWidth - 20, 50, 10);
    tmg.fill();
    totalMultiBg.y = -cardHeight / 2 + 30;
    totalMultiBg.parent = totalMultiNode;
    var totalLabel = new cc.Node("Label");
    totalLabel.anchorX = 0.5;
    totalLabel.anchorY = 0.5;
    var ttl = totalLabel.addComponent(cc.Label);
    ttl.string = "总倍数";
    ttl.fontSize = 14;
    ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    ttl.verticalAlign = cc.Label.VerticalAlign.CENTER;
    totalLabel.color = new cc.Color(180, 180, 180);
    totalLabel.y = 12;
    totalLabel.parent = totalMultiNode;
    var multiValueNode = new cc.Node("Value");
    multiValueNode.name = "MultiplierValue";
    multiValueNode.anchorX = 0.5;
    multiValueNode.anchorY = 0.5;
    var mvl = multiValueNode.addComponent(cc.Label);
    mvl.string = "x" + (data.multiple || 1);
    mvl.fontSize = 28;
    mvl.fontFamily = "Arial";
    mvl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    mvl.verticalAlign = cc.Label.VerticalAlign.CENTER;
    multiValueNode.color = isWinner ? new cc.Color(255, 200, 50) : new cc.Color(200, 200, 200);

    // 添加描边
    var mvo = multiValueNode.addComponent(cc.LabelOutline);
    mvo.color = isWinner ? new cc.Color(150, 100, 0) : new cc.Color(60, 60, 60);
    mvo.width = 2;
    multiValueNode.y = -8;
    multiValueNode.parent = totalMultiNode;
    totalMultiNode.y = -cardHeight / 2 + 30;
    totalMultiNode.parent = cardNode;
    return cardNode;
  },
  /**
   * 👥 创建玩家结果列表
   */
  _createPlayerResultList: function _createPlayerResultList(data, isWinner, myWinGold, listWidth) {
    var listNode = new cc.Node("PlayerResultList");
    var listHeight = 260;

    // 列表背景
    var bgNode = new cc.Node("ListBg");
    var graphics = bgNode.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(0, 0, 0, 80);
    graphics.roundRect(-listWidth / 2, -listHeight / 2, listWidth, listHeight, 12);
    graphics.fill();
    bgNode.parent = listNode;

    // 表头
    var headerNode = new cc.Node("Header");
    var headers = ["玩家", "身份", "输赢"];
    var headerX = [-listWidth / 2 + 80, 20, listWidth / 2 - 60];
    for (var i = 0; i < headers.length; i++) {
      var hNode = new cc.Node("H_" + i);
      hNode.anchorX = 0.5;
      hNode.anchorY = 0.5;
      var hLabel = hNode.addComponent(cc.Label);
      hLabel.string = headers[i];
      hLabel.fontSize = 18;
      hLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      hLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
      hNode.color = new cc.Color(150, 150, 160);
      hNode.x = headerX[i];
      hNode.parent = headerNode;
    }
    headerNode.y = listHeight / 2 - 25;
    headerNode.parent = listNode;

    // 分隔线
    var sepNode = new cc.Node("Separator");
    var sg = sepNode.addComponent(cc.Graphics);
    sg.strokeColor = new cc.Color(100, 100, 100, 100);
    sg.lineWidth = 1;
    sg.moveTo(-listWidth / 2 + 15, 0);
    sg.lineTo(listWidth / 2 - 15, 0);
    sg.stroke();
    sepNode.y = listHeight / 2 - 45;
    sepNode.parent = listNode;

    // 玩家列表
    var players = data.players || [];
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;
    var itemStartY = listHeight / 2 - 75;
    var itemHeight = 65;
    for (var i = 0; i < players.length && i < 3; i++) {
      var player = players[i];
      var isCurrentPlayer = String(player.player_id) === String(myPlayerId);
      var itemNode = this._createPlayerResultItem(player, isCurrentPlayer, isWinner, listWidth, i);
      itemNode.y = itemStartY - i * itemHeight;
      itemNode.parent = listNode;
    }
    return listNode;
  },
  /**
   * 👤 创建单个玩家结果项
   */
  _createPlayerResultItem: function _createPlayerResultItem(player, isCurrentPlayer, isWinner, listWidth, index) {
    var self = this;
    var itemNode = new cc.Node("PlayerItem_" + index);
    var itemHeight = 55;

    // 当前玩家高亮背景
    if (isCurrentPlayer) {
      var highlight = new cc.Node("Highlight");
      var hg = highlight.addComponent(cc.Graphics);
      hg.fillColor = isWinner ? new cc.Color(80, 60, 30, 150) : new cc.Color(50, 40, 50, 150);
      hg.roundRect(-listWidth / 2 + 10, -itemHeight / 2, listWidth - 20, itemHeight, 8);
      hg.fill();
      hg.strokeColor = isWinner ? new cc.Color(200, 150, 50, 200) : new cc.Color(100, 80, 100, 150);
      hg.lineWidth = 2;
      hg.roundRect(-listWidth / 2 + 10, -itemHeight / 2, listWidth - 20, itemHeight, 8);
      hg.stroke();
      highlight.parent = itemNode;
    }

    // 头像区域
    var avatarNode = new cc.Node("Avatar");
    avatarNode.x = -listWidth / 2 + 45;

    // 头像背景（圆形）
    var avatarBg = new cc.Node("AvatarBg");
    var ag = avatarBg.addComponent(cc.Graphics);
    var isLandlord = player.role === "landlord";

    // 绘制圆形头像框
    ag.strokeColor = isLandlord ? new cc.Color(255, 200, 50, 255) : new cc.Color(180, 180, 200, 255);
    ag.lineWidth = 3;
    ag.circle(0, 0, 22);
    ag.stroke();
    ag.fillColor = new cc.Color(60, 60, 80, 200);
    ag.circle(0, 0, 20);
    ag.fill();
    avatarBg.parent = avatarNode;

    // 尝试加载头像
    var avatarIndex = index % 4 + 1;
    var avatarPath = "UI/headimage/avatar_" + avatarIndex;
    cc.resources.load(avatarPath, cc.SpriteFrame, function (err, spriteFrame) {
      if (!err && spriteFrame) {
        var avatarSprite = new cc.Node("AvatarSprite");
        var sp = avatarSprite.addComponent(cc.Sprite);
        sp.spriteFrame = spriteFrame;
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        avatarSprite.width = 36;
        avatarSprite.height = 36;
        avatarSprite.parent = avatarNode;
      }
    });

    // 身份图标
    var roleIconNode = new cc.Node("RoleIcon");
    var roleLabel = roleIconNode.addComponent(cc.Label);
    roleLabel.string = isLandlord ? "👑" : "🌾";
    roleLabel.fontSize = 14;
    roleIconNode.x = 18;
    roleIconNode.y = -15;
    roleIconNode.parent = avatarNode;
    avatarNode.parent = itemNode;

    // 玩家名称
    var nameNode = new cc.Node("Name");
    nameNode.anchorX = 0.5;
    nameNode.anchorY = 0.5;
    var nameLabel = nameNode.addComponent(cc.Label);
    nameLabel.string = player.player_name || "玩家" + (index + 1);
    nameLabel.fontSize = 18;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    nameLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    nameNode.color = isCurrentPlayer ? new cc.Color(255, 255, 200) : new cc.Color(220, 220, 220);
    nameNode.x = -listWidth / 2 + 100;
    nameNode.parent = itemNode;

    // 身份
    var roleNode = new cc.Node("Role");
    roleNode.anchorX = 0.5;
    roleNode.anchorY = 0.5;
    var roleText = roleNode.addComponent(cc.Label);
    roleText.string = isLandlord ? "地主" : "农民";
    roleText.fontSize = 18;
    roleText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    roleText.verticalAlign = cc.Label.VerticalAlign.CENTER;
    roleNode.color = isLandlord ? new cc.Color(255, 200, 100) : new cc.Color(120, 200, 120);
    roleNode.x = 20;
    roleNode.parent = itemNode;

    // 输赢金额
    var winGold = player.win_gold || 0;
    var winNode = new cc.Node("WinGold");
    winNode.name = "WinGoldValue";
    winNode.anchorX = 0.5;
    winNode.anchorY = 0.5;
    var winLabel = winNode.addComponent(cc.Label);
    winLabel.string = (winGold >= 0 ? "+" : "") + winGold;
    winLabel.fontSize = 22;
    winLabel.fontFamily = "Arial";
    winLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    winLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;

    // 添加描边
    var winOutline = winNode.addComponent(cc.LabelOutline);
    winOutline.color = winGold >= 0 ? new cc.Color(0, 80, 0) : new cc.Color(100, 0, 0);
    winOutline.width = 2;
    winNode.color = winGold >= 0 ? new cc.Color(100, 255, 100) : new cc.Color(255, 100, 100);
    winNode.x = listWidth / 2 - 50;
    winNode.parent = itemNode;
    return itemNode;
  },
  /**
   * 🔘 创建按钮区域
   */
  _createButtonArea: function _createButtonArea(isWinner, callback) {
    var self = this;
    var areaNode = new cc.Node("ButtonArea");

    // 继续游戏按钮
    var continueBtn = self._createStyledButton("继续游戏", isWinner, true);
    continueBtn.x = -100;
    continueBtn.parent = areaNode;
    continueBtn.on(cc.Node.EventType.TOUCH_END, function () {
      if (callback) callback("continue");
    });

    // 返回大厅按钮
    var lobbyBtn = self._createStyledButton("返回大厅", isWinner, false);
    lobbyBtn.x = 100;
    lobbyBtn.parent = areaNode;
    lobbyBtn.on(cc.Node.EventType.TOUCH_END, function () {
      if (callback) callback("lobby");
    });
    return areaNode;
  },
  /**
   * 🔘 创建高级样式按钮
   */
  _createStyledButton: function _createStyledButton(text, isWinner, isPrimary) {
    var btnNode = new cc.Node("Btn_" + text);
    var btnWidth = 140;
    var btnHeight = 50;

    // 🔧【修复】设置按钮节点的内容大小，确保点击区域正确
    btnNode.setContentSize(btnWidth, btnHeight);
    btnNode.setAnchorPoint(0.5, 0.5);

    // 🔧【修复】添加 BlockInputEvents 组件，确保按钮可以接收点击事件
    btnNode.addComponent(cc.BlockInputEvents);

    // 按钮背景
    var graphics = btnNode.addComponent(cc.Graphics);
    if (isPrimary) {
      // 主要按钮 - 金橙渐变
      if (isWinner) {
        graphics.fillColor = new cc.Color(200, 140, 30, 255);
      } else {
        graphics.fillColor = new cc.Color(60, 120, 180, 255);
      }
    } else {
      // 次要按钮 - 蓝紫渐变
      graphics.fillColor = new cc.Color(80, 70, 120, 255);
    }
    graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 25);
    graphics.fill();

    // 边框
    if (isPrimary && isWinner) {
      graphics.strokeColor = new cc.Color(255, 220, 100, 255);
      graphics.lineWidth = 2;
      graphics.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 25);
      graphics.stroke();
    }

    // 按钮文字
    var labelNode = new cc.Node("Label");
    labelNode.anchorX = 0.5;
    labelNode.anchorY = 0.5;
    var label = labelNode.addComponent(cc.Label);
    label.string = text;
    label.fontSize = 22;
    label.fontFamily = "Arial";
    label.overflow = cc.Label.Overflow.SHRINK;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    labelNode.width = btnWidth - 20; // 留出边距防止溢出
    labelNode.height = btnHeight - 10;
    labelNode.color = new cc.Color(255, 255, 255);

    // 添加描边
    var outline = labelNode.addComponent(cc.LabelOutline);
    outline.color = new cc.Color(0, 0, 0);
    outline.width = 2;
    labelNode.parent = btnNode;

    // 点击效果
    btnNode.on(cc.Node.EventType.TOUCH_START, function () {
      cc.tween(btnNode).to(0.1, {
        scale: 0.95
      }).start();
    });
    btnNode.on(cc.Node.EventType.TOUCH_END, function () {
      cc.tween(btnNode).to(0.1, {
        scale: 1
      }).start();
    });
    btnNode.on(cc.Node.EventType.TOUCH_CANCEL, function () {
      cc.tween(btnNode).to(0.1, {
        scale: 1
      }).start();
    });
    return btnNode;
  },
  /**
   * ✨ 创建胜利粒子特效
   */
  _createVictoryParticles: function _createVictoryParticles(parent, width, height) {
    var self = this;

    // 金币粒子
    for (var i = 0; i < 15; i++) {
      (function (index) {
        var coin = new cc.Node("Coin_" + index);
        coin.x = (Math.random() - 0.5) * width;
        coin.y = height / 2 + 50;

        // 绘制金币
        var g = coin.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(255, 200, 50, 255);
        g.circle(0, 0, 8);
        g.fill();
        g.strokeColor = new cc.Color(200, 150, 30, 255);
        g.lineWidth = 1;
        g.circle(0, 0, 8);
        g.stroke();
        coin.parent = parent;

        // 下落动画
        var duration = 1.5 + Math.random() * 1.5;
        var targetY = -height / 2 - 50;
        var delay = Math.random() * 0.5;
        cc.tween(coin).delay(delay).parallel(cc.tween().to(duration, {
          y: targetY
        }, {
          easing: 'quadIn'
        }), cc.tween().to(duration, {
          x: coin.x + (Math.random() - 0.5) * 100
        }), cc.tween().to(duration / 2, {
          angle: -180
        }).to(duration / 2, {
          angle: -360
        })).call(function () {
          // 循环
          coin.y = height / 2 + 50;
          coin.x = (Math.random() - 0.5) * width;
          cc.tween(coin).parallel(cc.tween().to(duration, {
            y: targetY
          }, {
            easing: 'quadIn'
          }), cc.tween().to(duration, {
            x: coin.x + (Math.random() - 0.5) * 100
          }), cc.tween().to(duration / 2, {
            angle: -180
          }).to(duration / 2, {
            angle: -360
          })).start();
        }).start();
      })(i);
    }

    // 星光闪烁
    for (var j = 0; j < 8; j++) {
      (function (index) {
        var star = new cc.Node("Star_" + index);
        star.x = (Math.random() - 0.5) * width * 0.8;
        star.y = (Math.random() - 0.5) * height * 0.8;

        // 绘制星星
        var sg = star.addComponent(cc.Graphics);
        sg.fillColor = new cc.Color(255, 255, 200, 200);
        self._drawStar(sg, 0, 0, 6, 5);
        star.parent = parent;
        star.opacity = 0;

        // 闪烁动画
        cc.tween(star).delay(Math.random() * 2).repeatForever(cc.tween().to(0.3, {
          opacity: 255,
          scale: 1.2
        }).to(0.3, {
          opacity: 100,
          scale: 0.8
        }).to(0.3, {
          opacity: 255,
          scale: 1.2
        }).to(0.3, {
          opacity: 0,
          scale: 0.5
        }).delay(1 + Math.random() * 2)).start();
      })(j);
    }
  },
  /**
   * 🌧️ 创建失败粒子特效
   */
  _createDefeatParticles: function _createDefeatParticles(parent, width, height) {
    // 蓝色漂浮粒子
    for (var i = 0; i < 10; i++) {
      (function (index) {
        var particle = new cc.Node("DefeatParticle_" + index);
        particle.x = (Math.random() - 0.5) * width;
        particle.y = (Math.random() - 0.5) * height;

        // 绘制粒子
        var g = particle.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(80, 100, 150, 150);
        g.circle(0, 0, 4 + Math.random() * 3);
        g.fill();
        particle.parent = parent;
        particle.opacity = 0;

        // 缓慢漂浮动画
        var duration = 3 + Math.random() * 2;
        cc.tween(particle).to(0.5, {
          opacity: 150
        }).parallel(cc.tween().to(duration, {
          y: particle.y + 50 + Math.random() * 30
        }, {
          easing: 'sineInOut'
        }), cc.tween().to(duration, {
          x: particle.x + (Math.random() - 0.5) * 40
        })).to(0.5, {
          opacity: 0
        }).call(function () {
          particle.y = (Math.random() - 0.5) * height;
          particle.x = (Math.random() - 0.5) * width;
        }).start();

        // 循环
        cc.tween(particle).delay(4).repeatForever(cc.tween().to(0.5, {
          opacity: 150
        }).parallel(cc.tween().to(duration, {
          y: particle.y + 50 + Math.random() * 30
        }, {
          easing: 'sineInOut'
        }), cc.tween().to(duration, {
          x: particle.x + (Math.random() - 0.5) * 40
        })).to(0.5, {
          opacity: 0
        })).start();
      })(i);
    }
  },
  /**
   * ⭐ 绘制星形
   */
  _drawStar: function _drawStar(graphics, cx, cy, innerRadius, points) {
    var outerRadius = innerRadius * 2;
    graphics.moveTo(cx, cy + outerRadius);
    for (var i = 0; i < points * 2; i++) {
      var radius = i % 2 === 0 ? outerRadius : innerRadius;
      var angle = i * Math.PI / points - Math.PI / 2;
      var x = cx + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      graphics.lineTo(x, y);
    }
    graphics.close();
    graphics.fill();
  },
  /**
   * 🔢 启动数字动画
   */
  _startNumberAnimations: function _startNumberAnimations(popupNode, data, myWinGold) {
    var self = this;

    // 倍数滚动动画
    var multiValueNode = self._findNodeByName(popupNode, "MultiplierValue");
    if (multiValueNode) {
      var targetMulti = data.multiple || 1;
      self._animateNumber(multiValueNode, 1, targetMulti, 800, "x");
    }
  },
  /**
   * 🔢 数字滚动动画
   */
  _animateNumber: function _animateNumber(node, from, to, duration, prefix) {
    if (!node) return;
    var label = node.getComponent(cc.Label);
    if (!label) return;
    var startTime = Date.now();
    var diff = to - from;
    var update = function update() {
      if (!node.isValid) return;
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      var easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var current = Math.floor(from + diff * easeProgress);
      label.string = (prefix || "") + current;
      if (progress < 1) {
        setTimeout(update, 16);
      } else {
        label.string = (prefix || "") + to;
      }
    };
    update();
  },
  /**
   * 🔍 查找节点
   */
  _findNodeByName: function _findNodeByName(parent, name) {
    if (!parent) return null;
    var children = parent.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i].name === name) {
        return children[i];
      }
      var found = this._findNodeByName(children[i], name);
      if (found) return found;
    }
    return null;
  },
  /**
   * 关闭结算弹窗 - 带缩小淡出动画
   */
  _closeGameResultPopup: function _closeGameResultPopup(popupNode, maskNode) {
    var self = this;

    // 停止所有粒子动画
    if (this._resultEffectLayer) {
      this._resultEffectLayer.stopAllActions();
      var children = this._resultEffectLayer.children;
      for (var i = 0; i < children.length; i++) {
        children[i].stopAllActions();
      }
    }

    // 弹窗缩小淡出动画
    if (popupNode) {
      cc.tween(popupNode).to(0.2, {
        scale: 0.8,
        opacity: 0
      }, {
        easing: 'backIn'
      }).call(function () {
        if (popupNode && popupNode.isValid) {
          popupNode.destroy();
        }
      }).start();
    }

    // 遮罩淡出
    if (maskNode) {
      cc.tween(maskNode).to(0.2, {
        opacity: 0
      }).call(function () {
        if (maskNode && maskNode.isValid) {
          maskNode.destroy();
        }
      }).start();
    }
    this._gameResultPopup = null;
    this._gameResultMask = null;
    this._resultEffectLayer = null;
  },
  /**
   * 继续游戏
   */
  _continueGame: function _continueGame() {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.playerData) {
      return;
    }

    // 🔧【新增】检查玩家豆子是否足够继续游戏
    var playerGold = myglobal.playerData.gobal_count || 0;
    var roomConfig = myglobal.currentRoomConfig || {};
    var minGold = roomConfig.min_gold || roomConfig.minGold || 0;
    if (playerGold < minGold) {
      // 豆子不足，显示豆子不足弹窗
      this._showInsufficientGoldPopup(playerGold, minGold);
      return;
    }

    // 豆子足够，继续游戏
    this._doContinueGame();
  },
  /**
   * 🔧【新增】执行继续游戏逻辑
   */
  _doContinueGame: function _doContinueGame() {
    // 清理当前游戏状态
    this._resetGameState();

    // 发送 ready 请求（准备下一局）
    var myglobal = window.myglobal;
    if (myglobal && myglobal.socket && myglobal.socket.requestReady) {
      myglobal.socket.requestReady();
    }

    // 显示等待提示
    if (this.tipsLabel) {
      this.tipsLabel.string = "等待其他玩家...";
      var self = this;
      setTimeout(function () {
        if (self.tipsLabel) {
          self.tipsLabel.string = "";
        }
      }, 5000);
    }
  },
  /**
   * 🔧【新增】显示豆子不足弹窗
   */
  _showInsufficientGoldPopup: function _showInsufficientGoldPopup(currentGold, requiredGold) {
    var self = this;

    // 关闭结算弹窗
    this._closeGameResultPopup();

    // 创建豆子不足弹窗
    var canvas = cc.director.getScene().getChildByName("Canvas");
    if (!canvas) return;
    var winSize = cc.winSize;

    // 遮罩层
    var maskNode = new cc.Node("InsufficientGoldMask");
    maskNode.addComponent(cc.BlockInputEvents);
    var maskSprite = maskNode.addComponent(cc.Sprite);
    maskSprite.spriteFrame = new cc.SpriteFrame();
    maskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    maskNode.color = new cc.Color(0, 0, 0);
    maskNode.opacity = 180;
    maskNode.parent = canvas;

    // 弹窗容器
    var popupNode = new cc.Node("InsufficientGoldPopup");
    popupNode.x = 0;
    popupNode.y = 0;
    popupNode.parent = canvas;

    // 弹窗背景
    var bgNode = new cc.Node("Bg");
    var graphics = bgNode.addComponent(cc.Graphics);
    var popupWidth = 450;
    var popupHeight = 320;
    graphics.fillColor = new cc.Color(40, 35, 60);
    graphics.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    graphics.fill();
    graphics.strokeColor = new cc.Color(255, 200, 100);
    graphics.lineWidth = 3;
    graphics.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    graphics.stroke();
    bgNode.parent = popupNode;

    // 标题
    var titleNode = new cc.Node("Title");
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "豆子不足";
    titleLabel.fontSize = 28;
    titleLabel.fontFamily = "Arial";
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = new cc.Color(255, 200, 100);
    titleNode.y = popupHeight / 2 - 45;
    titleNode.parent = popupNode;

    // 分隔线
    var lineNode = new cc.Node("Line");
    var lg = lineNode.addComponent(cc.Graphics);
    lg.strokeColor = new cc.Color(100, 80, 60);
    lg.lineWidth = 1;
    lg.moveTo(-popupWidth / 2 + 30, popupHeight / 2 - 80);
    lg.lineTo(popupWidth / 2 - 30, popupHeight / 2 - 80);
    lg.stroke();
    lineNode.parent = popupNode;

    // 内容区域
    var contentNode = new cc.Node("Content");
    var contentLabel = contentNode.addComponent(cc.Label);
    contentLabel.string = "当前豆子: " + this._formatGold(currentGold) + "\n需要豆子: " + this._formatGold(requiredGold) + "\n\n观看激励视频广告可获取豆子";
    contentLabel.fontSize = 20;
    contentLabel.fontFamily = "Arial";
    contentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    contentLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
    contentNode.width = popupWidth - 60;
    contentNode.color = new cc.Color(220, 220, 220);
    contentNode.y = 20;
    contentNode.parent = popupNode;

    // 按钮区域
    var btnAreaNode = new cc.Node("ButtonArea");
    btnAreaNode.y = -popupHeight / 2 + 60;
    btnAreaNode.parent = popupNode;

    // 观看广告按钮
    var adBtn = new cc.Node("AdBtn");
    var adBg = adBtn.addComponent(cc.Graphics);
    adBg.fillColor = new cc.Color(80, 180, 80);
    adBg.roundRect(-100, -25, 200, 50, 25);
    adBg.fill();
    adBtn.x = -110;
    adBtn.parent = btnAreaNode;
    var adLabelNode = new cc.Node("Label");
    var adLabel = adLabelNode.addComponent(cc.Label);
    adLabel.string = "观看广告";
    adLabel.fontSize = 20;
    adLabel.fontFamily = "Arial";
    adLabelNode.color = new cc.Color(255, 255, 255);
    adLabelNode.parent = adBtn;

    // 返回大厅按钮
    var lobbyBtn = new cc.Node("LobbyBtn");
    var lobbyBg = lobbyBtn.addComponent(cc.Graphics);
    lobbyBg.fillColor = new cc.Color(100, 80, 140);
    lobbyBg.roundRect(-100, -25, 200, 50, 25);
    lobbyBg.fill();
    lobbyBtn.x = 110;
    lobbyBtn.parent = btnAreaNode;
    var lobbyLabelNode = new cc.Node("Label");
    var lobbyLabel = lobbyLabelNode.addComponent(cc.Label);
    lobbyLabel.string = "返回大厅";
    lobbyLabel.fontSize = 20;
    lobbyLabel.fontFamily = "Arial";
    lobbyLabelNode.color = new cc.Color(255, 255, 255);
    lobbyLabelNode.parent = lobbyBtn;

    // 存储节点引用
    self._insufficientGoldPopup = popupNode;
    self._insufficientGoldMask = maskNode;

    // 观看广告按钮点击事件
    adBtn.on(cc.Node.EventType.TOUCH_END, function () {
      self._watchAdForGold(function (success) {
        if (success) {
          // 广告观看成功，关闭弹窗并继续游戏
          self._closeInsufficientGoldPopup();
          self._doContinueGame();
        }
      });
    });

    // 返回大厅按钮点击事件
    lobbyBtn.on(cc.Node.EventType.TOUCH_END, function () {
      self._closeInsufficientGoldPopup();
      self._returnToLobby();
    });
  },
  /**
   * 🔧【新增】关闭豆子不足弹窗
   */
  _closeInsufficientGoldPopup: function _closeInsufficientGoldPopup() {
    if (this._insufficientGoldPopup) {
      this._insufficientGoldPopup.destroy();
      this._insufficientGoldPopup = null;
    }
    if (this._insufficientGoldMask) {
      this._insufficientGoldMask.destroy();
      this._insufficientGoldMask = null;
    }
  },
  /**
   * 🔧【新增】观看激励视频广告获取豆子
   * @param {Function} callback - 回调函数，参数为是否成功
   */
  _watchAdForGold: function _watchAdForGold(callback) {
    var self = this;

    // 检查是否有广告SDK（可根据实际集成的广告SDK调整）
    // 这里提供一个通用的实现框架

    // 方式1: 如果集成了穿山甲广告SDK (Bytedance)
    if (typeof tt !== 'undefined' && tt.showRewardedVideoAd) {
      tt.showRewardedVideoAd({
        success: function success() {
          // 广告观看成功，奖励豆子
          self._rewardGoldAfterAd(callback);
        },
        fail: function fail() {
          // 广告观看失败
          self._showMessage("广告加载失败，请稍后重试");
          if (callback) callback(false);
        }
      });
      return;
    }

    // 方式2: 如果集成了微信小游戏广告SDK
    if (typeof wx !== 'undefined' && wx.createRewardedVideoAd) {
      var rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-xxx' // 替换为实际的广告单元ID
      });

      rewardedVideoAd.onClose(function (res) {
        if (res && res.isEnded) {
          // 用户完整观看了广告
          self._rewardGoldAfterAd(callback);
        } else {
          // 用户提前关闭了广告
          self._showMessage("请完整观看广告获取奖励");
          if (callback) callback(false);
        }
      });
      rewardedVideoAd.onError(function (err) {
        self._showMessage("广告加载失败，请稍后重试");
        if (callback) callback(false);
      });
      rewardedVideoAd.show()["catch"](function () {
        // 失败重试
        rewardedVideoAd.load().then(function () {
          return rewardedVideoAd.show();
        });
      });
      return;
    }

    // 方式3: 模拟广告（开发测试用）
    // 在实际发布时应该删除此分支或替换为真实广告SDK
    self._showMessage("正在加载广告...");

    // 模拟广告观看过程（2秒后奖励豆子）
    setTimeout(function () {
      self._rewardGoldAfterAd(callback);
    }, 2000);
  },
  /**
   * 🔧【新增】广告观看成功后奖励豆子
   */
  _rewardGoldAfterGold: function _rewardGoldAfterGold(callback) {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.playerData) {
      if (callback) callback(false);
      return;
    }

    // 奖励豆子数量（可根据实际需求调整）
    var rewardAmount = 5000;

    // 更新本地豆子数量
    myglobal.playerData.updateGold(rewardAmount);

    // 显示奖励提示
    this._showMessage("获得 " + this._formatGold(rewardAmount) + " 豆子！");

    // 通知服务端（如果需要同步）
    if (myglobal.socket && myglobal.socket.sendAdReward) {
      myglobal.socket.sendAdReward(rewardAmount);
    }
    if (callback) callback(true);
  },
  /**
   * 🔧【修复】广告观看成功后奖励豆子（修正方法名拼写错误）
   */
  _rewardGoldAfterAd: function _rewardGoldAfterAd(callback) {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.playerData) {
      if (callback) callback(false);
      return;
    }

    // 奖励豆子数量（可根据实际需求调整）
    var rewardAmount = 5000;

    // 更新本地豆子数量
    myglobal.playerData.updateGold(rewardAmount);

    // 显示奖励提示
    this._showMessage("获得 " + this._formatGold(rewardAmount) + " 豆子！");

    // 通知服务端（如果需要同步）
    if (myglobal.socket && myglobal.socket.sendAdReward) {
      myglobal.socket.sendAdReward(rewardAmount);
    }
    if (callback) callback(true);
  },
  /**
   * 🔧【新增】格式化豆子数量显示
   */
  _formatGold: function _formatGold(gold) {
    if (gold >= 10000) {
      return (gold / 10000).toFixed(1) + "万";
    }
    return gold.toString();
  },
  /**
   * 🔧【新增】显示消息提示
   */
  _showMessage: function _showMessage(msg) {
    if (this.tipsLabel) {
      this.tipsLabel.string = msg;
      var self = this;
      setTimeout(function () {
        if (self.tipsLabel) {
          self.tipsLabel.string = "";
        }
      }, 3000);
    }
  },
  /**
   * 返回大厅
   */
  _returnToLobby: function _returnToLobby() {
    // 清理当前游戏状态
    this._resetGameState();

    // 发送离开房间请求
    var myglobal = window.myglobal;
    if (myglobal && myglobal.socket && myglobal.socket.leaveRoom) {
      myglobal.socket.leaveRoom();
    } else {
      console.error("🎮 [_returnToLobby] myglobal.socket.leaveRoom 不可用");
    }

    // 加载大厅场景
    cc.director.loadScene("hallScene", function () {});
  },
  /**
   * 重置游戏状态
   */
  _resetGameState: function _resetGameState() {
    // 清理手牌
    this.handCards = [];
    this.bottomCards = [];
    this.choose_card_data = [];

    // 清理卡牌节点
    this.clearAllCards();

    // 🔧【修复】清理所有玩家的出牌区域（桌面上的牌）
    this._clearAllOutCardZones();

    // 🔧【修复】清理底牌节点
    this._clearBottomCards();

    // 重置游戏阶段
    this._gamePhase = "idle";
    this._biddingPhase = "idle";

    // 隐藏所有UI
    this._hideRobUI();
    if (this.playingUI_node) {
      this.playingUI_node.active = false;
    }

    // 🔧【新增】重置所有玩家的准备图标状态
    this._resetAllPlayerReadyState();
  },
  /**
   * 🔧【新增】清理所有玩家的出牌区域
   */
  _clearAllOutCardZones: function _clearAllOutCardZones() {
    // 获取 gameScene 脚本
    var gameScene_script = this.node.parent ? this.node.parent.getComponent("gameScene") : null;
    if (!gameScene_script) {
      console.warn("🎮 [_clearAllOutCardZones] 无法获取 gameScene");
      return;
    }

    // 获取玩家座位节点
    var players_seat_pos = gameScene_script.players_seat_pos;
    if (!players_seat_pos) {
      console.warn("🎮 [_clearAllOutCardZones] 无法获取 players_seat_pos");
      return;
    }

    // 遍历所有座位，清理出牌区域
    var children = players_seat_pos.children;
    for (var i = 0; i < children.length; i++) {
      var seatNode = children[i];
      // 查找出牌区域节点（cardsoutzone0, cardsoutzone1, cardsoutzone2）
      for (var j = 0; j < 3; j++) {
        var outZoneName = "cardsoutzone" + j;
        var outZone = seatNode.getChildByName(outZoneName);
        if (outZone) {
          outZone.removeAllChildren(true);
        }
      }
    }
  },
  /**
   * 🔧【新增】清理底牌节点
   */
  _clearBottomCards: function _clearBottomCards() {
    // 销毁底牌节点
    if (this.bottom_card) {
      for (var i = 0; i < this.bottom_card.length; i++) {
        if (this.bottom_card[i] && this.bottom_card[i].isValid) {
          this.bottom_card[i].destroy();
        }
      }
    }
    this.bottom_card = [];
  },
  /**
   * 🔧【新增】重置所有玩家的准备图标状态
   */
  _resetAllPlayerReadyState: function _resetAllPlayerReadyState() {
    var gameScene_script = this.node.parent ? this.node.parent.getComponent("gameScene") : null;
    if (!gameScene_script || !gameScene_script.playerNodeList) {
      return;
    }
    for (var i = 0; i < gameScene_script.playerNodeList.length; i++) {
      var playerNode = gameScene_script.playerNodeList[i];
      if (playerNode) {
        var playerScript = playerNode.getComponent("player_node");
        if (playerScript && playerScript.readyimage) {
          playerScript.readyimage.active = false;
        }
      }
    }
  },
  /**
   * 🔧【新增】更新玩家节点的金币显示
   * @param {String} playerId - 玩家ID
   * @param {Number} gold - 新的金币数量
   */
  _updatePlayerGoldDisplay: function _updatePlayerGoldDisplay(playerId, gold) {
    // 获取 gameScene 脚本
    var gameScene_script = this.node.parent ? this.node.parent.getComponent("gameScene") : null;
    if (!gameScene_script || !gameScene_script.playerNodeList) {
      console.warn("🏆 [_updatePlayerGoldDisplay] 无法获取 gameScene 或 playerNodeList");
      return;
    }

    // 遍历所有玩家节点，找到匹配的玩家并更新金币显示
    for (var i = 0; i < gameScene_script.playerNodeList.length; i++) {
      var playerNode = gameScene_script.playerNodeList[i];
      if (!playerNode) continue;
      var playerScript = playerNode.getComponent("player_node");
      if (!playerScript) continue;

      // 匹配玩家ID
      if (String(playerScript.accountid) === String(playerId)) {
        // 更新金币显示
        if (playerScript.globalcount_label) {
          playerScript.globalcount_label.string = String(gold);
        }
        break;
      }
    }
  },
  /**
   * 🔧【新增】更新玩家节点的竞技币显示（竞技场模式专用）
   * @param {String} playerId - 玩家ID
   * @param {Number} matchCoin - 新的竞技币数量
   */
  _updatePlayerMatchCoinDisplay: function _updatePlayerMatchCoinDisplay(playerId, matchCoin) {
    console.log("🏟️ [_updatePlayerMatchCoinDisplay] 更新玩家竞技币: playerId=", playerId, "matchCoin=", matchCoin);

    // 获取 gameScene 脚本
    var gameScene_script = this.node.parent ? this.node.parent.getComponent("gameScene") : null;
    if (!gameScene_script || !gameScene_script.playerNodeList) {
      console.warn("🏟️ [_updatePlayerMatchCoinDisplay] 无法获取 gameScene 或 playerNodeList");
      return;
    }

    // 遍历所有玩家节点，找到匹配的玩家并更新竞技币显示
    for (var i = 0; i < gameScene_script.playerNodeList.length; i++) {
      var playerNode = gameScene_script.playerNodeList[i];
      if (!playerNode) continue;
      var playerScript = playerNode.getComponent("player_node");
      if (!playerScript) continue;

      // 匹配玩家ID
      if (String(playerScript.accountid) === String(playerId)) {
        // 更新竞技币显示
        if (playerScript.globalcount_label) {
          playerScript.globalcount_label.string = String(matchCoin);
          console.log("🏟️ [_updatePlayerMatchCoinDisplay] 已更新玩家 ", playerId, " 的竞技币显示为 ", matchCoin);
        }
        // 🔧【新增】保存竞技币到玩家脚本实例
        playerScript._matchCoin = matchCoin;
        break;
      }
    }
  },
  // ============================================================
  // 【竞技场】功能函数
  // ============================================================

  /**
   * 🏆【竞技场】显示竞技场专用结算弹窗
   * 竞技场结算页与普通场不同：
   * - 只显示：输赢、倍数、当前比赛金币
   * - 不显示：继续游戏、返回大厅按钮
   * - 显示："下一局开始 15秒" 倒计时
   * 
   * 🔧【新增】如果是最终结算（只有3人），跳过此弹窗，等待 onCompetitionChampion 消息显示排名
   */
  _showCompetitionResultPopup: function _showCompetitionResultPopup(data) {
    var self = this;

    // 🔧【关键】检查是否是最终结算（只有3人参赛）
    // 如果是最终结算，跳过此弹窗，等待 onCompetitionChampion 消息显示排名
    if (data.is_final_round) {
      console.log("🏆 [_showCompetitionResultPopup] 检测到最终结算（只有3人），跳过中间结算弹窗，等待排名消息");
      // 不显示中间弹窗，直接等待 onCompetitionChampion 消息
      return;
    }
    var winSize = cc.winSize;
    var myglobal = window.myglobal;
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;

    // 判断输赢
    var isWinner = false;
    var myWinGold = 0;
    var myMatchCoin = 0; // 🔧【新增】当前玩家的金币（从data.players获取）

    if (data.players && data.players.length > 0) {
      for (var i = 0; i < data.players.length; i++) {
        var player = data.players[i];
        if (String(player.player_id) === String(myPlayerId)) {
          isWinner = player.is_winner;
          myWinGold = player.win_gold;
          // 🔧【修复】从服务端返回的玩家数据中获取金币
          if (player.match_coin !== undefined && player.match_coin >= 0) {
            myMatchCoin = player.match_coin;
          }
          break;
        }
      }
    }

    // 🔧【修复】更新当前玩家的金币显示
    this._matchCoin = myMatchCoin;

    // 🔧【新增】更新所有玩家的金币显示
    if (data.players && data.players.length > 0) {
      for (var i = 0; i < data.players.length; i++) {
        var player = data.players[i];
        var playerId = player.player_id;
        var matchCoin = player.match_coin;

        // 🔧【修复】竞技场模式下更新玩家的金币显示
        if (matchCoin !== undefined && matchCoin >= 0) {
          this._updatePlayerMatchCoinDisplay(playerId, matchCoin);
        }
      }
    }
    var canvas = cc.find("Canvas") || cc.find("UI_ROOT") || this.node.parent;
    if (!canvas) canvas = this.node;

    // 遮罩层
    var maskNode = new cc.Node("CompetitionResultMask");
    maskNode.addComponent(cc.BlockInputEvents);
    maskNode.color = isWinner ? new cc.Color(0, 30, 50) : new cc.Color(30, 0, 0);
    maskNode.opacity = 200;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    maskNode.zIndex = 999;
    maskNode.parent = canvas;

    // 弹窗容器
    var popupNode = new cc.Node("CompetitionResultPopup");
    popupNode.scale = 0.5;
    popupNode.opacity = 0;
    popupNode.zIndex = 1000;
    popupNode.parent = canvas;
    var popupWidth = 450;
    var popupHeight = 380; // 🔧【调整】增加高度以容纳倒计时

    // 背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = isWinner ? new cc.Color(40, 50, 80, 240) : new cc.Color(50, 35, 40, 240);
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.fill();
    bg.strokeColor = isWinner ? new cc.Color(100, 200, 255) : new cc.Color(200, 100, 100);
    bg.lineWidth = 3;
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.stroke();
    bgNode.parent = popupNode;

    // 标题
    var titleNode = new cc.Node("Title");
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = isWinner ? "🎉 胜利 🎉" : "✖ 失败 ✖";
    titleLabel.fontSize = 36;
    titleNode.color = isWinner ? new cc.Color(100, 255, 200) : new cc.Color(255, 150, 150);
    titleNode.y = popupHeight / 2 - 50;
    titleNode.parent = popupNode;

    // 🔧【修复】输赢金额 - 竞技场显示"金币"（不是竞技币）
    var resultNode = new cc.Node("Result");
    var resultLabel = resultNode.addComponent(cc.Label);
    resultLabel.string = "本局结果: " + (myWinGold >= 0 ? "+" : "") + myWinGold + " 金币";
    resultLabel.fontSize = 28;
    resultNode.color = myWinGold >= 0 ? new cc.Color(100, 255, 100) : new cc.Color(255, 100, 100);
    resultNode.y = popupHeight / 2 - 100;
    resultNode.parent = popupNode;

    // 倍数
    var multiNode = new cc.Node("Multiplier");
    var multiLabel = multiNode.addComponent(cc.Label);
    multiLabel.string = "本局倍数: x" + (data.multiple || 1);
    multiLabel.fontSize = 24;
    multiNode.color = new cc.Color(255, 220, 150);
    multiNode.y = popupHeight / 2 - 140;
    multiNode.parent = popupNode;

    // 🔧【修复】当前金币（不是竞技币）
    var coinNode = new cc.Node("MatchCoin");
    var coinLabel = coinNode.addComponent(cc.Label);
    coinLabel.string = "当前金币: " + this._matchCoin;
    coinLabel.fontSize = 24;
    coinNode.color = new cc.Color(255, 200, 100);
    coinNode.y = popupHeight / 2 - 180;
    coinNode.parent = popupNode;

    // ============================================================
    // 🔧【修复】竞技场倒计时
    // 不显示"继续游戏"和"返回大厅"按钮
    // 显示服务端控制的30秒倒计时
    // 🔧【关键修复】从 game_over 数据中获取初始倒计时，立即启动本地倒计时
    // ============================================================

    // 🔧【关键】从服务端数据获取初始倒计时值
    var initialCountdown = data.arena_countdown || 30;

    // 倒计时显示容器
    var countdownContainer = new cc.Node("CountdownContainer");
    countdownContainer.y = -popupHeight / 2 + 80;
    countdownContainer.parent = popupNode;

    // 倒计时文字
    var countdownLabel = new cc.Node("CountdownLabel");
    var countdownLabelComp = countdownLabel.addComponent(cc.Label);
    countdownLabelComp.string = "下一轮将在 " + initialCountdown + " 秒后开始";
    countdownLabelComp.fontSize = 26;
    countdownLabel.color = new cc.Color(255, 215, 0); // 金黄色
    countdownLabel.parent = countdownContainer;

    // 倒计时数字（大号显示）
    var countdownNumber = new cc.Node("CountdownNumber");
    var countdownNumberComp = countdownNumber.addComponent(cc.Label);
    countdownNumberComp.string = String(initialCountdown);
    countdownNumberComp.fontSize = 48;
    countdownNumber.color = new cc.Color(255, 255, 255);
    countdownNumber.y = -45;
    countdownNumber.parent = countdownContainer;

    // 添加描边效果
    var outline = countdownNumber.addComponent(cc.LabelOutline);
    outline.color = cc.Color.BLACK;
    outline.width = 2;

    // 弹出动画
    cc.tween(popupNode).to(0.35, {
      scale: 1,
      opacity: 255
    }, {
      easing: 'backOut'
    }).start();

    // 保存引用
    this._gameResultPopup = popupNode;
    this._gameResultMask = maskNode;
    this._countdownLabelNode = countdownLabel;
    this._countdownNumberNode = countdownNumber;
    this._arenaCountdownSeconds = initialCountdown;

    // 播放音效
    this._playGameResultSound(isWinner);

    // ============================================================
    // 🔧【关键修复】立即启动本地倒计时定时器
    // 同时注册服务端消息监听，双保险确保倒计时正常工作
    // ============================================================

    // 启动本地倒计时定时器
    this._startLocalArenaCountdown(initialCountdown);

    // 注册服务端倒计时消息监听（作为备份）
    this._setupArenaCountdownListeners();
  },
  /**
   * 🔧【新增】启动本地竞技场倒计时
   * @param {Number} seconds - 初始倒计时秒数
   */
  _startLocalArenaCountdown: function _startLocalArenaCountdown(seconds) {
    var self = this;
    console.log("🏟️ [_startLocalArenaCountdown] 开始启动倒计时, seconds:", seconds);

    // 停止之前的倒计时
    if (this._localArenaCountdownTimer) {
      this.unschedule(this._localArenaCountdownTick);
      this._localArenaCountdownTimer = null;
    }
    this._arenaCountdownSeconds = seconds;

    // 🔧【修复】确保初始UI正确显示
    this._updateArenaCountdownUI(seconds);

    // 🔧【修复】使用 cc.director 的时间调度，确保在所有情况下都能工作
    // 每秒tick一次，无限重复
    this.schedule(this._localArenaCountdownTick, 1, cc.macro.REPEAT_FOREVER, 1);
    this._localArenaCountdownTimer = true;
    console.log("🏟️ [_startLocalArenaCountdown] 本地倒计时已启动");
  },
  /**
   * 🔧【新增】本地竞技场倒计时Tick
   */
  _localArenaCountdownTick: function _localArenaCountdownTick() {
    if (this._arenaCountdownSeconds <= 0) {
      this.unschedule(this._localArenaCountdownTick);
      this._localArenaCountdownTimer = null;
      console.log("🏟️ [_localArenaCountdownTick] 倒计时结束，等待服务端消息...");

      // 🔧【修复】倒计时归0后显示等待提示，继续等待服务端消息
      // 服务端会发送 MsgArenaAutoReady 或新一轮游戏消息
      this._updateArenaCountdownUI(0);
      this._showWaitingForServer();
      return;
    }
    this._arenaCountdownSeconds--;

    // 更新UI
    this._updateArenaCountdownUI(this._arenaCountdownSeconds);
    console.log("🏟️ [_localArenaCountdownTick] 剩余:", this._arenaCountdownSeconds);
  },
  /**
   * 🔧【新增】显示等待服务端响应提示
   */
  _showWaitingForServer: function _showWaitingForServer() {
    // 更新倒计时标签显示等待提示
    if (this._countdownLabelNode) {
      var label = this._countdownLabelNode.getComponent(cc.Label);
      if (label) {
        label.string = "等待服务器响应...";
      }
    }

    // 隐藏数字
    if (this._countdownNumberNode) {
      var label = this._countdownNumberNode.getComponent(cc.Label);
      if (label) {
        label.string = "...";
      }
    }
  },
  /**
   * 🔧【新增】设置竞技场倒计时消息监听
   * 监听服务端推送的倒计时消息（作为本地倒计时的备份和同步）
   */
  _setupArenaCountdownListeners: function _setupArenaCountdownListeners() {
    var self = this;
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.socket) {
      console.warn("🏟️ [_setupArenaCountdownListeners] socket未初始化");
      return;
    }

    // 监听倒计时开始消息（如果服务端重新发送）
    myglobal.socket.onArenaRoundCountdown(function (data) {
      console.log("🏟️ [onArenaRoundCountdown] 收到倒计时开始:", data);
      // 同步服务端的倒计时值
      self._arenaCountdownSeconds = data.seconds || 30;
      self._updateArenaCountdownUI(data.seconds);
    });

    // 监听倒计时每秒更新消息（同步服务端的倒计时）
    myglobal.socket.onArenaCountdownTick(function (data) {
      console.log("🏟️ [onArenaCountdownTick] 服务端倒计时同步:", data.seconds);
      // 🔧【关键】同步服务端的倒计时值，确保与服务端一致
      self._arenaCountdownSeconds = data.seconds;
      self._updateArenaCountdownUI(data.seconds);
    });

    // 监听自动准备消息
    myglobal.socket.onArenaAutoReady(function (data) {
      console.log("🏟️ [onArenaAutoReady] 自动准备:", data.message);
      // 停止本地倒计时
      if (self._localArenaCountdownTimer) {
        self.unschedule(self._localArenaCountdownTick);
        self._localArenaCountdownTimer = null;
      }
      self._showArenaAutoReadyMessage(data.message);
    });

    // 监听断线重连状态恢复
    myglobal.socket.onArenaReconnectState(function (data) {
      console.log("🏟️ [onArenaReconnectState] 状态恢复:", data);
      if (data.phase === "countdown") {
        self._arenaCountdownSeconds = data.countdown;
        self._updateArenaCountdownUI(data.countdown);
      }
    });
  },
  /**
   * 🔧【新增】更新竞技场倒计时UI
   * @param {Number} seconds - 剩余秒数
   */
  _updateArenaCountdownUI: function _updateArenaCountdownUI(seconds) {
    // 更新文字
    if (this._countdownLabelNode) {
      var label = this._countdownLabelNode.getComponent(cc.Label);
      if (label) {
        label.string = "下一轮将在 " + seconds + " 秒后开始";
      }
    }

    // 更新数字
    if (this._countdownNumberNode) {
      var numLabel = this._countdownNumberNode.getComponent(cc.Label);
      if (numLabel) {
        numLabel.string = String(seconds);
      }

      // 最后5秒闪烁效果
      if (seconds <= 5 && seconds > 0) {
        cc.tween(this._countdownNumberNode).to(0.1, {
          scale: 1.2
        }).to(0.1, {
          scale: 1.0
        }).start();

        // 变红
        this._countdownNumberNode.color = new cc.Color(255, 100, 100);
      } else {
        this._countdownNumberNode.color = new cc.Color(255, 255, 255);
      }
    }
  },
  /**
   * 🔧【新增】停止竞技场倒计时
   */
  _stopArenaCountdown: function _stopArenaCountdown() {
    // 停止本地倒计时定时器
    if (this._localArenaCountdownTimer) {
      this.unschedule(this._localArenaCountdownTick);
      this._localArenaCountdownTimer = null;
      console.log("🏟️ [_stopArenaCountdown] 已停止本地倒计时");
    }

    // 重置倒计时秒数
    this._arenaCountdownSeconds = 0;
  },
  /**
   * 🔧【新增】显示竞技场自动准备消息
   * @param {String} message - 消息内容
   */
  _showArenaAutoReadyMessage: function _showArenaAutoReadyMessage(message) {
    // 更新倒计时显示为自动准备消息
    if (this._countdownLabelNode) {
      var label = this._countdownLabelNode.getComponent(cc.Label);
      if (label) {
        label.string = message || "系统已自动准备";
      }
    }

    // 隐藏数字
    if (this._countdownNumberNode) {
      this._countdownNumberNode.active = false;
    }
  },
  /**
   * 🏆【竞技场】处理竞技场状态更新
   * @param {Object} data - { room_category, round, total_rounds, match_coin, ... }
   */
  _onCompetitionStatus: function _onCompetitionStatus(data) {
    this._isCompetition = data.room_category === 2;
    this._roomCategory = data.room_category || 1;
    this._competitionRound = data.round || 0;
    this._competitionTotalRounds = data.total_rounds || 0;
    this._matchCoin = data.match_coin || 0;

    // 如果是竞技场模式，显示比赛金币
    if (this._isCompetition) {
      this._showMatchCoinDisplay();
    }
  },
  /**
   * 🕐【竞技场】处理竞技场倒计时
   * @param {Object} data - { countdown, message }
   */
  _onCompetitionCountdown: function _onCompetitionCountdown(data) {
    this._competitionCountdown = data.countdown || 15;

    // 停止之前的倒计时
    if (this._competitionCountdownTimer) {
      this.unschedule(this._competitionCountdownTick);
    }

    // 开始新的倒计时
    this.schedule(this._competitionCountdownTick, 1);
  },
  /**
   * 🕐【竞技场】竞技场倒计时Tick
   */
  _competitionCountdownTick: function _competitionCountdownTick() {
    if (this._competitionCountdown <= 0) {
      this.unschedule(this._competitionCountdownTick);
      return;
    }
    this._competitionCountdown--;

    // 更新倒计时显示
    this._updateCompetitionCountdownDisplay();
  },
  /**
   * 🕐【竞技场】更新竞技场倒计时显示
   */
  _updateCompetitionCountdownDisplay: function _updateCompetitionCountdownDisplay() {
    // 如果有结算弹窗，更新其中的倒计时
    if (this._gameResultPopup) {
      var countdownLabel = this._gameResultPopup.getChildByName("CompetitionCountdown");
      if (countdownLabel && countdownLabel.getComponent(cc.Label)) {
        countdownLabel.getComponent(cc.Label).string = "下一局开始 " + this._competitionCountdown + "秒";
      }
    }
  },
  /**
   * 🪙【竞技场】处理比赛金币更新
   * @param {Object} data - { player_id, match_coin, delta }
   */
  _onMatchCoinUpdate: function _onMatchCoinUpdate(data) {
    var myglobal = window.myglobal;
    if (!myglobal) return;
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;

    // 只更新自己的比赛金币
    if (String(data.player_id) === String(myPlayerId)) {
      this._matchCoin = data.match_coin;
      this._updateMatchCoinDisplay(data.match_coin, data.delta);
    }
  },
  /**
   * 🪙【竞技场】显示比赛金币显示
   */
  _showMatchCoinDisplay: function _showMatchCoinDisplay() {
    // 检查是否已存在比赛金币显示节点
    if (this._matchCoinNode) return;
    var myglobal = window.myglobal;
    if (!myglobal) return;

    // 创建比赛金币显示节点
    var matchCoinNode = new cc.Node("MatchCoinDisplay");
    matchCoinNode.setPosition(-200, 280); // 左上角位置

    // 背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = new cc.Color(50, 40, 80, 200);
    bg.roundRect(-80, -20, 160, 40, 10);
    bg.fill();
    bgNode.parent = matchCoinNode;

    // 图标（金币图标）
    var iconNode = new cc.Node("Icon");
    var iconLabel = iconNode.addComponent(cc.Label);
    iconLabel.string = "🪙";
    iconLabel.fontSize = 20;
    iconNode.setPosition(-55, 0);
    iconNode.parent = matchCoinNode;

    // 标签
    var labelNode = new cc.Node("Label");
    var label = labelNode.addComponent(cc.Label);
    label.string = "比赛金币";
    label.fontSize = 14;
    labelNode.color = new cc.Color(200, 200, 200);
    labelNode.setPosition(-20, 0);
    labelNode.parent = matchCoinNode;

    // 数值
    var valueNode = new cc.Node("Value");
    valueNode.name = "MatchCoinValue";
    var valueLabel = valueNode.addComponent(cc.Label);
    valueLabel.string = String(this._matchCoin);
    valueLabel.fontSize = 18;
    valueNode.color = new cc.Color(255, 220, 100);
    valueNode.setPosition(45, 0);
    valueNode.parent = matchCoinNode;
    matchCoinNode.parent = this.node;
    this._matchCoinNode = matchCoinNode;
  },
  /**
   * 🪙【竞技场】更新比赛金币显示
   * @param {Number} matchCoin - 新的比赛金币数量
   * @param {Number} delta - 变化量
   */
  _updateMatchCoinDisplay: function _updateMatchCoinDisplay(matchCoin, delta) {
    if (this._matchCoinNode) {
      var valueNode = this._matchCoinNode.getChildByName("MatchCoinValue");
      if (valueNode && valueNode.getComponent(cc.Label)) {
        valueNode.getComponent(cc.Label).string = String(matchCoin);

        // 如果有增量，显示动画
        if (delta !== 0) {
          this._showMatchCoinDeltaAnimation(delta);
        }
      }
    }
  },
  /**
   * 🪙【竞技场】显示比赛金币变化动画
   * @param {Number} delta - 变化量
   */
  _showMatchCoinDeltaAnimation: function _showMatchCoinDeltaAnimation(delta) {
    if (!this._matchCoinNode) return;

    // 创建变化量显示节点
    var deltaNode = new cc.Node("Delta");
    var deltaLabel = deltaNode.addComponent(cc.Label);
    deltaLabel.string = (delta >= 0 ? "+" : "") + delta;
    deltaLabel.fontSize = 24;
    deltaNode.color = delta >= 0 ? new cc.Color(100, 255, 100) : new cc.Color(255, 100, 100);
    deltaNode.setPosition(80, 0);
    deltaNode.parent = this._matchCoinNode;

    // 飘字动画
    cc.tween(deltaNode).to(0.5, {
      y: 30,
      opacity: 255
    }).to(0.5, {
      y: 50,
      opacity: 0
    }).call(function () {
      deltaNode.destroy();
    }).start();
  },
  /**
   * 🪙【竞技场】隐藏比赛金币显示
   */
  _hideMatchCoinDisplay: function _hideMatchCoinDisplay() {
    if (this._matchCoinNode) {
      this._matchCoinNode.destroy();
      this._matchCoinNode = null;
    }
  },
  /**
   * ❌【竞技场】处理淘汰通知
   * @param {Object} data - { rank, reason, total_players, rewards }
   */
  _onCompetitionEliminated: function _onCompetitionEliminated(data) {
    // 停止所有倒计时
    this._stopPlayCountdown();
    this._stopBidCountdown();

    // 隐藏比赛金币显示
    this._hideMatchCoinDisplay();

    // 显示淘汰弹窗
    this._showEliminatedPopup(data);
  },
  /**
   * ❌【竞技场】显示淘汰弹窗
   * @param {Object} data - { rank, reason, total_players, rewards }
   */
  _showEliminatedPopup: function _showEliminatedPopup(data) {
    var self = this;
    var winSize = cc.winSize;
    var canvas = cc.find("Canvas") || cc.find("UI_ROOT") || this.node.parent;
    if (!canvas) canvas = this.node;

    // 遮罩层
    var maskNode = new cc.Node("EliminatedMask");
    maskNode.addComponent(cc.BlockInputEvents);
    maskNode.color = new cc.Color(0, 0, 0);
    maskNode.opacity = 180;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    maskNode.zIndex = 999;
    maskNode.parent = canvas;

    // 弹窗容器
    var popupNode = new cc.Node("EliminatedPopup");
    popupNode.scale = 0.5;
    popupNode.opacity = 0;
    popupNode.zIndex = 1000;
    popupNode.parent = canvas;
    var popupWidth = 400;
    var popupHeight = 350;

    // 背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = new cc.Color(60, 40, 50, 240);
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.fill();
    bg.strokeColor = new cc.Color(150, 100, 100);
    bg.lineWidth = 3;
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.stroke();
    bgNode.parent = popupNode;

    // 标题
    var titleNode = new cc.Node("Title");
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "❌ 比赛结束 ❌";
    titleLabel.fontSize = 32;
    titleNode.color = new cc.Color(255, 150, 150);
    titleNode.y = popupHeight / 2 - 50;
    titleNode.parent = popupNode;

    // 排名
    var rankNode = new cc.Node("Rank");
    var rankLabel = rankNode.addComponent(cc.Label);
    rankLabel.string = "最终排名: 第 " + data.rank + " 名";
    rankLabel.fontSize = 24;
    rankNode.color = new cc.Color(255, 220, 150);
    rankNode.y = popupHeight / 2 - 100;
    rankNode.parent = popupNode;

    // 淘汰原因
    var reasonNode = new cc.Node("Reason");
    var reasonLabel = reasonNode.addComponent(cc.Label);
    reasonLabel.string = data.reason || "比赛失利";
    reasonLabel.fontSize = 18;
    reasonNode.color = new cc.Color(200, 200, 200);
    reasonNode.y = popupHeight / 2 - 140;
    reasonNode.parent = popupNode;

    // 参赛人数
    var totalNode = new cc.Node("Total");
    var totalLabel = totalNode.addComponent(cc.Label);
    totalLabel.string = "共 " + (data.total_players || 0) + " 人参赛";
    totalLabel.fontSize = 16;
    totalNode.color = new cc.Color(180, 180, 180);
    totalNode.y = popupHeight / 2 - 180;
    totalNode.parent = popupNode;

    // 奖励（如果有）
    if (data.rewards) {
      var rewardNode = new cc.Node("Reward");
      var rewardLabel = rewardNode.addComponent(cc.Label);
      rewardLabel.string = "获得奖励: " + (data.rewards.name || JSON.stringify(data.rewards));
      rewardLabel.fontSize = 18;
      rewardNode.color = new cc.Color(255, 200, 100);
      rewardNode.y = popupHeight / 2 - 220;
      rewardNode.parent = popupNode;
    }

    // 返回大厅按钮
    var btnNode = new cc.Node("ReturnBtn");
    btnNode.setContentSize(200, 50);
    btnNode.addComponent(cc.BlockInputEvents);
    var btnBg = btnNode.addComponent(cc.Graphics);
    btnBg.fillColor = new cc.Color(100, 80, 140);
    btnBg.roundRect(-100, -25, 200, 50, 25);
    btnBg.fill();
    btnNode.y = -popupHeight / 2 + 50;
    btnNode.parent = popupNode;
    var btnLabelNode = new cc.Node("Label");
    var btnLabel = btnLabelNode.addComponent(cc.Label);
    btnLabel.string = "返回大厅";
    btnLabel.fontSize = 22;
    btnLabelNode.color = new cc.Color(255, 255, 255);
    btnLabelNode.parent = btnNode;

    // 点击事件
    btnNode.on(cc.Node.EventType.TOUCH_END, function () {
      // 销毁弹窗
      popupNode.destroy();
      maskNode.destroy();
      // 返回大厅
      self._returnToLobby();
    });

    // 弹出动画
    cc.tween(popupNode).to(0.3, {
      scale: 1,
      opacity: 255
    }, {
      easing: 'backOut'
    }).start();
    this._eliminatedPopup = popupNode;
    this._eliminatedMask = maskNode;
  },
  /**
   * ⬆️【竞技场】处理晋级通知
   * @param {Object} data - { current_round, total_rounds, match_coin, message }
   */
  _onCompetitionAdvance: function _onCompetitionAdvance(data) {
    this._competitionRound = data.current_round;
    this._matchCoin = data.match_coin;

    // 更新比赛金币显示
    this._updateMatchCoinDisplay(data.match_coin, 0);

    // 显示晋级提示
    this._showAdvanceToast(data);
  },
  /**
   * ⬆️【竞技场】显示晋级提示
   * @param {Object} data - { current_round, total_rounds, match_coin, message }
   */
  _showAdvanceToast: function _showAdvanceToast(data) {
    var self = this;
    var winSize = cc.winSize;

    // 创建Toast节点
    var toastNode = new cc.Node("AdvanceToast");
    toastNode.setPosition(0, 100);
    toastNode.opacity = 0;
    toastNode.zIndex = 2000;
    toastNode.parent = this.node;

    // 背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = new cc.Color(50, 100, 50, 220);
    bg.roundRect(-150, -25, 300, 50, 25);
    bg.fill();
    bgNode.parent = toastNode;

    // 文字
    var labelNode = new cc.Node("Label");
    var label = labelNode.addComponent(cc.Label);
    label.string = "🎉 晋级成功！第 " + data.current_round + "/" + data.total_rounds + " 轮";
    label.fontSize = 22;
    labelNode.color = new cc.Color(255, 255, 200);
    labelNode.parent = toastNode;

    // 动画
    cc.tween(toastNode).to(0.3, {
      opacity: 255
    }).delay(2).to(0.3, {
      opacity: 0
    }).call(function () {
      toastNode.destroy();
    }).start();
  },
  /**
   * 🏆【竞技场】处理冠军弹窗
   * @param {Object} data - { rank, rewards, reward_type, rankings, match_coin }
   */
  _onCompetitionChampion: function _onCompetitionChampion(data) {
    // 停止所有倒计时
    this._stopPlayCountdown();
    this._stopBidCountdown();

    // 隐藏比赛金币显示
    this._hideMatchCoinDisplay();

    // 显示冠军弹窗
    this._showChampionPopup(data);
  },
  /**
   * 🏆【竞技场】显示冠军弹窗
   * @param {Object} data - { rank, rewards, reward_type, rankings, match_coin }
   * 🔧【重构】显示完整的排名列表（前20名），包括冠军、亚军、季军
   */
  _showChampionPopup: function _showChampionPopup(data) {
    var self = this;
    var winSize = cc.winSize;
    var canvas = cc.find("Canvas") || cc.find("UI_ROOT") || this.node.parent;
    if (!canvas) canvas = this.node;

    // 🔧【关闭之前的结算弹窗】
    if (this._gameResultPopup || this._gameResultMask) {
      this._closeGameResultPopup(this._gameResultPopup, this._gameResultMask);
    }

    // 遮罩层
    var maskNode = new cc.Node("ChampionMask");
    maskNode.addComponent(cc.BlockInputEvents);
    maskNode.color = new cc.Color(20, 15, 40);
    maskNode.opacity = 220;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    maskNode.zIndex = 999;
    maskNode.parent = canvas;

    // 弹窗容器
    var popupNode = new cc.Node("ChampionPopup");
    popupNode.scale = 0.5;
    popupNode.opacity = 0;
    popupNode.zIndex = 1000;
    popupNode.parent = canvas;

    // 🔧【调整】增大弹窗尺寸以容纳更多排名
    var popupWidth = 520;
    var popupHeight = 620;

    // 背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = new cc.Color(45, 35, 70, 245);
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.fill();
    bg.strokeColor = new cc.Color(255, 200, 80);
    bg.lineWidth = 3;
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    bg.stroke();
    bgNode.parent = popupNode;

    // 标题
    var titleNode = new cc.Node("Title");
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "🏆 比赛结束 🏆";
    titleLabel.fontSize = 32;
    titleLabel.enableBold = true;
    titleNode.color = new cc.Color(255, 220, 100);
    titleNode.y = popupHeight / 2 - 40;
    titleNode.parent = popupNode;

    // 🔧【新增】前三名展示区
    var rankings = data.rankings || [];
    var topThreeY = popupHeight / 2 - 90;
    if (rankings.length >= 1) {
      // 冠军
      this._createRankingItem(popupNode, rankings[0], 1, -120, topThreeY);
    }
    if (rankings.length >= 2) {
      // 亚军
      this._createRankingItem(popupNode, rankings[1], 2, 0, topThreeY - 20);
    }
    if (rankings.length >= 3) {
      // 季军
      this._createRankingItem(popupNode, rankings[2], 3, 120, topThreeY - 40);
    }

    // 🔧【新增】其他排名列表标题
    if (rankings.length > 3) {
      var otherTitleNode = new cc.Node("OtherTitle");
      var otherTitleLabel = otherTitleNode.addComponent(cc.Label);
      otherTitleLabel.string = "—— 其他排名 ——";
      otherTitleLabel.fontSize = 18;
      otherTitleNode.color = new cc.Color(180, 180, 200);
      otherTitleNode.y = topThreeY - 100;
      otherTitleNode.parent = popupNode;

      // 🔧【新增】其他排名列表（第4-20名）
      var startY = topThreeY - 130;
      var maxOtherRankings = Math.min(rankings.length, 20);
      for (var i = 3; i < maxOtherRankings; i++) {
        var rankInfo = rankings[i];
        var rankItemNode = new cc.Node("RankItem_" + i);
        var rankItemLabel = rankItemNode.addComponent(cc.Label);
        rankItemLabel.string = "第" + rankInfo.rank + "名: " + rankInfo.player_name + "  金币: " + rankInfo.match_coin;
        rankItemLabel.fontSize = 16;
        rankItemNode.color = new cc.Color(200, 200, 210);
        rankItemNode.y = startY - (i - 3) * 24;
        rankItemNode.parent = popupNode;
      }
    }

    // 按钮区域
    var btnY = -popupHeight / 2 + 50;

    // 确定按钮
    var confirmBtn = new cc.Node("ConfirmBtn");
    confirmBtn.setContentSize(180, 45);
    confirmBtn.addComponent(cc.BlockInputEvents);
    var confirmBg = confirmBtn.addComponent(cc.Graphics);
    confirmBg.fillColor = new cc.Color(200, 150, 50);
    confirmBg.roundRect(-90, -22.5, 180, 45, 22);
    confirmBg.fill();
    confirmBtn.y = btnY;
    confirmBtn.parent = popupNode;
    var confirmLabelNode = new cc.Node("Label");
    var confirmLabel = confirmLabelNode.addComponent(cc.Label);
    confirmLabel.string = "返回大厅";
    confirmLabel.fontSize = 20;
    confirmLabelNode.color = new cc.Color(255, 255, 255);
    confirmLabelNode.parent = confirmBtn;
    confirmBtn.on(cc.Node.EventType.TOUCH_END, function () {
      popupNode.destroy();
      maskNode.destroy();
      self._returnToLobby();
    });

    // 弹出动画
    cc.tween(popupNode).to(0.4, {
      scale: 1,
      opacity: 255
    }, {
      easing: 'backOut'
    }).start();

    // 粒子特效
    this._createChampionParticles(popupNode, popupWidth, popupHeight);
    this._championPopup = popupNode;
    this._championMask = maskNode;
  },
  /**
   * 🏅【新增】创建单个排名项
   * @param {cc.Node} parent - 父节点
   * @param {Object} rankInfo - 排名信息
   * @param {Number} rank - 排名（1, 2, 3）
   * @param {Number} x - X坐标
   * @param {Number} y - Y坐标
   */
  _createRankingItem: function _createRankingItem(parent, rankInfo, rank, x, y) {
    var itemNode = new cc.Node("RankItem_" + rank);
    itemNode.setPosition(x, y);

    // 排名背景
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);

    // 根据排名设置不同颜色
    var bgColor;
    if (rank === 1) {
      bgColor = new cc.Color(255, 215, 0, 200); // 金色
    } else if (rank === 2) {
      bgColor = new cc.Color(192, 192, 192, 200); // 银色
    } else {
      bgColor = new cc.Color(205, 127, 50, 200); // 铜色
    }

    bg.fillColor = bgColor;
    bg.roundRect(-55, -30, 110, 60, 10);
    bg.fill();
    bgNode.parent = itemNode;

    // 排名标签
    var rankLabelNode = new cc.Node("RankLabel");
    var rankLabel = rankLabelNode.addComponent(cc.Label);
    var rankText;
    if (rank === 1) {
      rankText = "🥇 冠军";
    } else if (rank === 2) {
      rankText = "🥈 亚军";
    } else {
      rankText = "🥉 季军";
    }
    rankLabel.string = rankText;
    rankLabel.fontSize = 16;
    rankLabel.enableBold = true;
    rankLabelNode.color = new cc.Color(255, 255, 255);
    rankLabelNode.y = 12;
    rankLabelNode.parent = itemNode;

    // 玩家名称
    var nameLabelNode = new cc.Node("NameLabel");
    var nameLabel = nameLabelNode.addComponent(cc.Label);
    nameLabel.string = rankInfo.player_name || "玩家";
    nameLabel.fontSize = 14;
    nameLabelNode.color = new cc.Color(255, 255, 255);
    nameLabelNode.y = -8;
    nameLabelNode.parent = itemNode;

    // 金币数
    var coinLabelNode = new cc.Node("CoinLabel");
    var coinLabel = coinLabelNode.addComponent(cc.Label);
    coinLabel.string = rankInfo.match_coin + " 金币";
    coinLabel.fontSize = 12;
    coinLabelNode.color = new cc.Color(255, 255, 200);
    coinLabelNode.y = -22;
    coinLabelNode.parent = itemNode;
    itemNode.parent = parent;
  },
  /**
   * 🎉【竞技场】创建冠军粒子特效
   */
  _createChampionParticles: function _createChampionParticles(parentNode, width, height) {
    // 简单的金色闪烁粒子效果
    for (var i = 0; i < 20; i++) {
      (function (index) {
        var particle = new cc.Node("Particle_" + index);
        particle.setPosition((Math.random() - 0.5) * width, height / 2 + 50);
        var particleLabel = particle.addComponent(cc.Label);
        particleLabel.string = "✨";
        particleLabel.fontSize = 20 + Math.random() * 20;
        particle.parent = parentNode;
        cc.tween(particle).delay(Math.random() * 0.5).to(2, {
          y: -height / 2 - 50,
          x: particle.x + (Math.random() - 0.5) * 100
        }).call(function () {
          particle.destroy();
        }).start();
      })(i);
    }
  },
  // ============================================================
  // 🔧【新增】最终榜单处理
  // ============================================================

  /**
   * 🏆【竞技场】处理最终榜单消息
   * 当竞技场所有轮次结束时调用
   * @param {Object} data - { period_no, total_players, top3, top20, my_rank, my_match_coin }
   */
  _onTournamentFinalRank: function _onTournamentFinalRank(data) {
    console.log("🏆 [_onTournamentFinalRank] 收到最终榜单数据:", JSON.stringify(data));

    // 停止所有倒计时
    this._stopPlayCountdown();
    this._stopBidCountdown();
    if (this._localArenaCountdownTimer) {
      this.unschedule(this._localArenaCountdownTick);
      this._localArenaCountdownTimer = null;
    }

    // 隐藏比赛金币显示
    this._hideMatchCoinDisplay();

    // 关闭之前的结算弹窗
    if (this._gameResultPopup || this._gameResultMask) {
      this._closeGameResultPopup(this._gameResultPopup, this._gameResultMask);
    }

    // 显示最终榜单弹窗
    this._showTournamentFinalRankDialog(data);
  },
  /**
   * 🏆【竞技场】显示最终榜单弹窗（完整版 - 带滚动列表）
   * @param {Object} data - { period_no, total_players, top3, top20, my_rank, my_match_coin }
   */
  _showTournamentFinalRankDialog: function _showTournamentFinalRankDialog(data) {
    var self = this;
    var winSize = cc.winSize;
    var canvas = cc.find("Canvas") || cc.find("UI_ROOT") || this.node.parent;
    if (!canvas) canvas = this.node;

    // ========== 遮罩层 ==========
    var maskNode = new cc.Node("FinalRankMask");
    maskNode.addComponent(cc.BlockInputEvents);
    maskNode.color = new cc.Color(10, 5, 30);
    maskNode.opacity = 200;
    maskNode.width = winSize.width * 2;
    maskNode.height = winSize.height * 2;
    maskNode.zIndex = 999;
    maskNode.parent = canvas;

    // ========== 弹窗容器 ==========
    var popupNode = new cc.Node("FinalRankPopup");
    popupNode.scale = 0.3;
    popupNode.opacity = 0;
    popupNode.zIndex = 1000;
    popupNode.parent = canvas;

    // 弹窗尺寸（高度改为屏幕高度的85%，避免溢出）
    var popupWidth = 600;
    var popupHeight = Math.floor(winSize.height * 0.85);

    // ========== 主背景 ==========
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    bg.fillColor = new cc.Color(30, 22, 54, 250);
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
    bg.fill();
    bg.strokeColor = new cc.Color(255, 200, 80);
    bg.lineWidth = 3;
    bg.roundRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
    bg.stroke();
    bgNode.parent = popupNode;

    // ========== 顶部标题区域 ==========
    var titleBgNode = new cc.Node("TitleBg");
    var titleBg = titleBgNode.addComponent(cc.Graphics);
    titleBg.fillColor = new cc.Color(180, 130, 50, 220);
    titleBg.roundRect(-popupWidth / 2 + 8, popupHeight / 2 - 55, popupWidth - 16, 50, 8);
    titleBg.fill();
    titleBgNode.parent = popupNode;
    var titleNode = new cc.Node("Title");
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "🏆 比赛结束 🏆";
    titleLabel.fontSize = 32;
    titleLabel.enableBold = true;
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = new cc.Color(255, 250, 220);
    titleNode.y = popupHeight / 2 - 32;
    titleNode.parent = popupNode;

    // 参赛人数
    var totalNode = new cc.Node("Total");
    var totalLabel = totalNode.addComponent(cc.Label);
    totalLabel.string = "共 " + (data.total_players || 3) + " 人参赛";
    totalLabel.fontSize = 16;
    totalLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    totalNode.color = new cc.Color(200, 200, 220);
    totalNode.y = popupHeight / 2 - 75;
    totalNode.parent = popupNode;

    // ========== TOP3 领奖台（紧凑布局）==========
    var top3 = data.top3 || [];
    var podiumY = popupHeight / 2 - 145;
    var podiumSpacing = 170;

    // 银牌（第二名）- 左侧
    if (top3.length >= 2) {
      this._createPodiumEntry(popupNode, top3[1], 2, -podiumSpacing, podiumY);
    }

    // 金牌（第一名）- 中间（最高）
    if (top3.length >= 1) {
      this._createPodiumEntry(popupNode, top3[0], 1, 0, podiumY + 20);
    }

    // 铜牌（第三名）- 右侧
    if (top3.length >= 3) {
      this._createPodiumEntry(popupNode, top3[2], 3, podiumSpacing, podiumY - 10);
    }

    // ========== 第4-20名滚动列表区域 ==========
    var top20 = data.top20 || [];
    if (top20.length > 0) {
      // 列表区域标题
      var listTitleNode = new cc.Node("ListTitle");
      var listTitleLabel = listTitleNode.addComponent(cc.Label);
      listTitleLabel.string = "—— 排行榜 ——";
      listTitleLabel.fontSize = 18;
      listTitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      listTitleNode.color = new cc.Color(180, 160, 120);
      listTitleNode.y = popupHeight / 2 - 260;
      listTitleNode.parent = popupNode;

      // 创建滚动视图容器
      var scrollViewNode = new cc.Node("ScrollView");
      scrollViewNode.width = popupWidth - 40;
      scrollViewNode.height = 280;
      scrollViewNode.y = -30;
      scrollViewNode.parent = popupNode;

      // 添加遮罩组件
      var mask = scrollViewNode.addComponent(cc.Mask);
      mask.type = cc.Mask.Type.RECT;

      // 创建内容容器
      var contentNode = new cc.Node("Content");
      contentNode.width = popupWidth - 40;
      contentNode.anchorY = 1;
      contentNode.y = scrollViewNode.height / 2;
      contentNode.parent = scrollViewNode;

      // 🔧【修复】过滤掉已在TOP3中的玩家，避免重复显示
      var top3PlayerIDs = {};
      for (var i = 0; i < top3.length; i++) {
        if (top3[i] && top3[i].player_id) {
          top3PlayerIDs[top3[i].player_id] = true;
        }
      }

      // 只显示第4名及之后的玩家（过滤掉TOP3）
      var filteredTop20 = [];
      for (var i = 0; i < top20.length; i++) {
        var rankData = top20[i];
        // 跳过已在TOP3中的玩家
        if (rankData && rankData.player_id && !top3PlayerIDs[rankData.player_id]) {
          filteredTop20.push(rankData);
        }
      }

      // 添加每个排行项
      var itemHeight = 45;
      var startY = 0;
      for (var i = 0; i < filteredTop20.length; i++) {
        var rankData = filteredTop20[i];
        var actualRank = i + 4; // 第4名开始

        var itemNode = this._createRankListItem(rankData, actualRank, popupWidth - 50);
        itemNode.y = startY - i * itemHeight - itemHeight / 2;
        itemNode.parent = contentNode;
      }

      // 设置内容高度
      contentNode.height = Math.max(filteredTop20.length * itemHeight, 280);

      // 添加触摸滚动
      this._addScrollViewTouch(scrollViewNode, contentNode, 280);
    }

    // ========== 底部区域（我的排名 + 按钮）==========
    // 分隔线
    var sepNode = new cc.Node("BottomSep");
    var sep = sepNode.addComponent(cc.Graphics);
    sep.strokeColor = new cc.Color(255, 200, 80, 100);
    sep.lineWidth = 1;
    sep.moveTo(-popupWidth / 2 + 30, 0);
    sep.lineTo(popupWidth / 2 - 30, 0);
    sep.stroke();
    sepNode.y = -popupHeight / 2 + 140;
    sepNode.parent = popupNode;

    // 我的排名背景
    var myRankBgNode = new cc.Node("MyRankBg");
    var myRankBg = myRankBgNode.addComponent(cc.Graphics);
    myRankBg.fillColor = new cc.Color(50, 45, 80, 200);
    myRankBg.roundRect(-200, -22, 400, 44, 8);
    myRankBg.fill();
    myRankBg.strokeColor = new cc.Color(255, 200, 80, 150);
    myRankBg.lineWidth = 1;
    myRankBg.roundRect(-200, -22, 400, 44, 8);
    myRankBg.stroke();
    myRankBgNode.y = -popupHeight / 2 + 100;
    myRankBgNode.parent = popupNode;

    // 我的排名文字
    var myRankNode = new cc.Node("MyRank");
    var myRankLabel = myRankNode.addComponent(cc.Label);
    myRankLabel.string = "我的排名: 第 " + (data.my_rank || 1) + " 名  |  比赛金币: " + (data.my_match_coin || 0);
    myRankLabel.fontSize = 20;
    myRankLabel.enableBold = true;
    myRankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    myRankNode.color = new cc.Color(255, 230, 150);
    myRankNode.y = -popupHeight / 2 + 100;
    myRankNode.parent = popupNode;

    // ========== 确定按钮 ==========
    var btnNode = new cc.Node("ConfirmBtn");
    btnNode.width = 180;
    btnNode.height = 50;
    var btnBg = btnNode.addComponent(cc.Graphics);
    btnBg.fillColor = new cc.Color(76, 175, 80);
    btnBg.roundRect(-90, -25, 180, 50, 10);
    btnBg.fill();
    btnBg.strokeColor = new cc.Color(129, 199, 132);
    btnBg.lineWidth = 2;
    btnBg.roundRect(-90, -25, 180, 50, 10);
    btnBg.stroke();
    btnNode.y = -popupHeight / 2 + 40;
    btnNode.parent = popupNode;
    var btnLabel = new cc.Node("Label");
    var btnLabelComp = btnLabel.addComponent(cc.Label);
    btnLabelComp.string = "确  定";
    btnLabelComp.fontSize = 24;
    btnLabelComp.enableBold = true;
    btnLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    btnLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
    btnLabel.setContentSize(180, 50);
    btnLabel.color = new cc.Color(255, 255, 255);
    btnLabel.setPosition(0, 0);
    btnLabel.parent = btnNode;

    // 按钮触摸效果
    btnNode.on(cc.Node.EventType.TOUCH_START, function () {
      btnNode.scale = 0.95;
    });
    btnNode.on(cc.Node.EventType.TOUCH_END, function () {
      btnNode.scale = 1;
      popupNode.destroy();
      maskNode.destroy();
      cc.director.loadScene("hallScene");
    });
    btnNode.on(cc.Node.EventType.TOUCH_CANCEL, function () {
      btnNode.scale = 1;
    });

    // ========== 弹出动画 ==========
    cc.tween(popupNode).to(0.2, {
      scale: 1.0,
      opacity: 255
    }, {
      easing: 'backOut'
    }).start();
    console.log("🏆 [_showTournamentFinalRankDialog] 最终榜单弹窗已显示");
  },
  /**
   * 创建排行列表项
   */
  _createRankListItem: function _createRankListItem(rankData, rank, width) {
    var itemNode = new cc.Node("RankItem_" + rank);
    itemNode.width = width;
    itemNode.height = 42;

    // 背景（交替颜色）
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    if (rank % 2 === 0) {
      bg.fillColor = new cc.Color(45, 38, 70, 180);
    } else {
      bg.fillColor = new cc.Color(38, 32, 58, 180);
    }
    bg.roundRect(-width / 2, -20, width, 40, 6);
    bg.fill();
    bgNode.parent = itemNode;

    // 排名
    var rankNode = new cc.Node("Rank");
    var rankLabel = rankNode.addComponent(cc.Label);
    rankLabel.string = String(rank);
    rankLabel.fontSize = 18;
    rankLabel.enableBold = true;
    rankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    rankNode.color = new cc.Color(255, 200, 100);
    rankNode.setPosition(-width / 2 + 35, 0);
    rankNode.parent = itemNode;

    // 🔧【新增】玩家头像
    var avatarNode = new cc.Node("Avatar");
    avatarNode.setPosition(-width / 2 + 75, 0);
    var avatarSprite = avatarNode.addComponent(cc.Sprite);
    avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    avatarNode.setContentSize(32, 32);
    avatarNode.parent = itemNode;

    // 加载头像
    this._loadAvatarSprite(avatarSprite, rankData.avatar, rankData.is_robot);

    // 玩家名称
    var nameNode = new cc.Node("Name");
    var nameLabel = nameNode.addComponent(cc.Label);
    var playerName = rankData.player_name || "玩家";
    if (rankData.is_robot) {
      playerName = this._getRobotDisplayName(rankData.player_id, rankData.player_name);
    }
    nameLabel.string = playerName;
    nameLabel.fontSize = 16;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    nameLabel.overflow = cc.Label.Overflow.CLAMP;
    nameNode.width = 150;
    nameNode.color = new cc.Color(255, 255, 255);
    nameNode.setPosition(-width / 2 + 145, 0);
    nameNode.parent = itemNode;

    // 金币
    var coinNode = new cc.Node("Coin");
    var coinLabel = coinNode.addComponent(cc.Label);
    coinLabel.string = (rankData.match_coin || 0) + " 金币";
    coinLabel.fontSize = 15;
    coinLabel.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
    coinNode.color = new cc.Color(255, 220, 150);
    coinNode.setPosition(width / 2 - 60, 0);
    coinNode.parent = itemNode;
    return itemNode;
  },
  /**
   * 添加滚动视图触摸事件
   */
  _addScrollViewTouch: function _addScrollViewTouch(scrollViewNode, contentNode, viewHeight) {
    var touchStartY = 0;
    var contentStartY = 0;
    var maxOffset = Math.max(0, contentNode.height - viewHeight);
    scrollViewNode.on(cc.Node.EventType.TOUCH_START, function (event) {
      touchStartY = event.getLocationY();
      contentStartY = contentNode.y;
    });
    scrollViewNode.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
      var touchY = event.getLocationY();
      var deltaY = touchY - touchStartY;
      var newY = contentStartY + deltaY;

      // 限制滚动范围
      var minY = viewHeight / 2 - contentNode.height;
      var maxY = viewHeight / 2;
      newY = Math.max(minY, Math.min(maxY, newY));
      contentNode.y = newY;
    });
  },
  /**
   * 🏆【竞技场】创建领奖台条目（美化版）
   */
  _createPodiumEntry: function _createPodiumEntry(parent, rankData, rank, x, y) {
    var entryNode = new cc.Node("PodiumEntry_" + rank);
    entryNode.setPosition(x, y);

    // ========== 排名背景（根据排名设置颜色）==========
    var bgNode = new cc.Node("Bg");
    var bg = bgNode.addComponent(cc.Graphics);
    var bgColor, borderColor;
    if (rank === 1) {
      // 金牌 - 金色系
      bgColor = new cc.Color(100, 85, 40, 230);
      borderColor = new cc.Color(255, 215, 0);
    } else if (rank === 2) {
      // 银牌 - 银色系
      bgColor = new cc.Color(70, 75, 85, 230);
      borderColor = new cc.Color(192, 192, 192);
    } else {
      // 铜牌 - 铜色系
      bgColor = new cc.Color(85, 60, 45, 230);
      borderColor = new cc.Color(205, 127, 50);
    }
    bg.fillColor = bgColor;
    bg.roundRect(-55, -70, 110, 140, 12);
    bg.fill();
    // 边框
    bg.strokeColor = borderColor;
    bg.lineWidth = 2;
    bg.roundRect(-55, -70, 110, 140, 12);
    bg.stroke();
    bgNode.parent = entryNode;

    // ========== 排名奖牌图标 ==========
    var medalNode = new cc.Node("Medal");
    var medal = medalNode.addComponent(cc.Graphics);
    var medalColor;
    if (rank === 1) {
      medalColor = new cc.Color(255, 215, 0); // 金色
    } else if (rank === 2) {
      medalColor = new cc.Color(192, 192, 192); // 银色
    } else {
      medalColor = new cc.Color(205, 127, 50); // 铜色
    }

    medal.fillColor = medalColor;
    // 绘制圆形奖牌
    medal.circle(0, 45, 22);
    medal.fill();
    medal.strokeColor = new cc.Color(255, 255, 255, 150);
    medal.lineWidth = 2;
    medal.circle(0, 45, 22);
    medal.stroke();
    medalNode.parent = entryNode;

    // 奖牌上的数字
    var rankNumNode = new cc.Node("RankNum");
    var rankNumLabel = rankNumNode.addComponent(cc.Label);
    rankNumLabel.string = String(rank);
    rankNumLabel.fontSize = 24;
    rankNumLabel.enableBold = true;
    rankNumLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    rankNumNode.color = new cc.Color(50, 40, 30);
    rankNumNode.setPosition(0, 45);
    rankNumNode.parent = entryNode;

    // ========== 玩家头像 ==========
    var avatarNode = new cc.Node("Avatar");
    avatarNode.setPosition(0, 20);
    var avatarSprite = avatarNode.addComponent(cc.Sprite);
    avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    avatarNode.setContentSize(50, 50);
    avatarNode.parent = entryNode;

    // 🔧【新增】加载头像
    this._loadAvatarSprite(avatarSprite, rankData.avatar, rankData.is_robot);

    // 头像边框
    var avatarFrameNode = new cc.Node("AvatarFrame");
    var avatarFrame = avatarFrameNode.addComponent(cc.Graphics);
    avatarFrame.strokeColor = borderColor;
    avatarFrame.lineWidth = 2;
    avatarFrame.circle(0, 20, 26);
    avatarFrame.stroke();
    avatarFrameNode.parent = entryNode;

    // ========== 玩家名称 ==========
    var nameLabelNode = new cc.Node("Name");
    var nameLabel = nameLabelNode.addComponent(cc.Label);
    var playerName = rankData.player_name || "玩家";
    if (rankData.is_robot) {
      // 机器人使用智能陪练名称
      playerName = this._getRobotDisplayName(rankData.player_id, rankData.player_name);
    }
    nameLabel.string = playerName;
    nameLabel.fontSize = 18;
    nameLabel.enableBold = true;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    nameLabelNode.color = new cc.Color(255, 255, 255);
    nameLabelNode.y = 5;
    nameLabelNode.parent = entryNode;

    // ========== 比赛金币 ==========
    var coinLabelNode = new cc.Node("Coin");
    var coinLabel = coinLabelNode.addComponent(cc.Label);
    coinLabel.string = (rankData.match_coin || 0) + " 金币";
    coinLabel.fontSize = 16;
    coinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    coinLabelNode.color = new cc.Color(255, 230, 150);
    coinLabelNode.y = -25;
    coinLabelNode.parent = entryNode;

    // ========== 不再显示机器人AI标签 ==========
    // 用户要求：机器人不显示AI标识

    entryNode.parent = parent;
  },
  /**
   * 获取机器人显示名称
   */
  _getRobotDisplayName: function _getRobotDisplayName(playerId, originalName) {
    // 如果原始名称已经是"智能陪练X号"格式，直接返回
    if (originalName && originalName.indexOf("智能陪练") === 0) {
      return originalName;
    }
    // 否则，生成"智能陪练X号"格式的名称
    var robotIndex = 1;
    if (playerId) {
      var lastChar = playerId.toString().slice(-1);
      robotIndex = parseInt(lastChar) || 1;
    }
    return "智能陪练" + robotIndex + "号";
  },
  /**
   * 🔧【新增】加载头像精灵
   * @param {cc.Sprite} sprite - 目标精灵组件
   * @param {string} avatarUrl - 头像URL或资源名
   * @param {boolean} isRobot - 是否是机器人
   */
  _loadAvatarSprite: function _loadAvatarSprite(sprite, avatarUrl, isRobot) {
    if (!sprite) return;

    // 机器人使用默认头像（avatar_1 到 avatar_3 随机）
    if (isRobot) {
      var robotAvatarIndex = Math.floor(Math.random() * 3) + 1;
      var defaultPath = "UI/headimage/avatar_" + robotAvatarIndex;
      cc.resources.load(defaultPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame && sprite.isValid) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 真人玩家
    if (!avatarUrl || avatarUrl === "") {
      // 使用默认头像
      cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame && sprite.isValid) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 判断是URL还是本地资源名
    if (avatarUrl.indexOf("http") === 0 || avatarUrl.indexOf("//") === 0) {
      // 远程URL
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (err || !texture) {
          // 加载失败，使用默认头像
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite && sprite.isValid) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        try {
          if (sprite.isValid) {
            var spriteFrame = new cc.SpriteFrame(texture);
            sprite.spriteFrame = spriteFrame;
          }
        } catch (e) {
          // 使用默认头像
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite && sprite.isValid) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
        }
      });
    } else {
      // 本地资源名
      var localPath = "UI/headimage/" + avatarUrl;
      cc.resources.load(localPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (err || !spriteFrame) {
          // 加载失败，使用默认头像
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite && sprite.isValid) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        if (sprite.isValid) {
          sprite.spriteFrame = spriteFrame;
        }
      });
    }
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxnYW1laW5nVUkuanMiXSwibmFtZXMiOlsiaXNvcGVuX3NvdW5kIiwid2luZG93IiwicWlhbl9zdGF0ZSIsImJ1cWlhbmciLCJxaWFuIiwiQ2FyZHNWYWx1ZSIsIlJvb21TdGF0ZSIsIl9hdWRpb0NsaXBzIiwiQ2FyZExheW91dCIsImNhcmRTY2FsZSIsImNhcmRZIiwiY2FyZFNwYWNpbmciLCJib3R0b21DYXJkU2NhbGUiLCJib3R0b21DYXJkU3BhY2luZyIsIm91dENhcmRTY2FsZSIsIm91dENhcmRTcGFjaW5nIiwiRGVhbENvbmZpZyIsImFuaW1EdXJhdGlvbiIsImRlY2tQb3NpdGlvbiIsImNjIiwidjIiLCJjYXJkSW50ZXJ2YWwiLCJwbGF5U291bmQiLCJwYXRoIiwiYXVkaW9FbmdpbmUiLCJwbGF5IiwicmVzb3VyY2VzIiwibG9hZCIsIkF1ZGlvQ2xpcCIsImVyciIsImNsaXAiLCJDbGFzcyIsIkNvbXBvbmVudCIsIm5hbWUiLCJwcm9wZXJ0aWVzIiwiZ2FtZWluZ1VJIiwiTm9kZSIsImNhcmRfcHJlZmFiIiwiUHJlZmFiIiwicm9iVUkiLCJib3R0b21fY2FyZF9wb3Nfbm9kZSIsInBsYXlpbmdVSV9ub2RlIiwidGlwc0xhYmVsIiwiTGFiZWwiLCJjYXJkc19ub2RlIiwiYmlkQ291bnRkb3duTGFiZWwiLCJwbGF5Q291bnRkb3duTGFiZWwiLCJ0aWNrQXVkaW8iLCJ0eXBlIiwib25Mb2FkIiwibXlnbG9iYWwiLCJjb25zb2xlIiwiZXJyb3IiLCJnYW1lU2NlbmVOb2RlIiwibm9kZSIsInBhcmVudCIsImkiLCJjaGlsZHJlbiIsImxlbmd0aCIsImNoaWxkIiwibmV3Q2FyZHNOb2RlIiwic2V0UG9zaXRpb24iLCJzZXRBbmNob3JQb2ludCIsInNldENvbnRlbnRTaXplIiwic2l6ZSIsImhhbmRDYXJkcyIsImJvdHRvbUNhcmRzIiwiY2hvb3NlX2NhcmRfZGF0YSIsInJvYl9wbGF5ZXJfYWNjb3VudGlkIiwiX2JpZGRpbmdQaGFzZSIsIl9nYW1lUGhhc2UiLCJjYXJkc1JlYWR5IiwiX2JpZFRpbWVvdXQiLCJfcGxheVRpbWVvdXQiLCJfYmlkQ291bnRkb3duVGltZXIiLCJfcGxheUNvdW50ZG93blRpbWVyIiwiX2JpZFRpbWVMZWZ0IiwiX3BsYXlUaW1lTGVmdCIsIl9pc0JpZENvdW50ZG93blRpY2tpbmciLCJfaXNQbGF5Q291bnRkb3duVGlja2luZyIsIl9pc0JpZFdhcm5pbmciLCJfaXNQbGF5V2FybmluZyIsIl9iaWRFeHBpcmVzQXQiLCJib3R0b21fY2FyZCIsIl9pc0NvbXBldGl0aW9uIiwiX3Jvb21DYXRlZ29yeSIsIl9tYXRjaENvaW4iLCJfY29tcGV0aXRpb25Sb3VuZCIsIl9jb21wZXRpdGlvblRvdGFsUm91bmRzIiwiX2NvbXBldGl0aW9uQ291bnRkb3duIiwiX2NvbXBldGl0aW9uQ291bnRkb3duVGltZXIiLCJfd2FzRGlzY29ubmVjdGVkIiwic29ja2V0Iiwib25QdXNoQ2FyZHMiLCJkYXRhIiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSIsImNhcmRzIiwiYm90dG9tX2NhcmRzIiwiX2dhbWVSZXN1bHRQb3B1cCIsIl9nYW1lUmVzdWx0TWFzayIsIl9jbG9zZUdhbWVSZXN1bHRQb3B1cCIsIl9zdG9wQXJlbmFDb3VudGRvd24iLCJfY2xlYXJBbGxPdXRDYXJkWm9uZXMiLCJyZW5kZXJDYXJkcyIsImJpbmQiLCJvbkJpZFR1cm4iLCJvbkJpZFJlc3VsdCIsIl9zdG9wQmlkQ291bnRkb3duIiwiZW1pdCIsInBsYXllcl9pZCIsImFjY291bnRpZCIsImJpZCIsInN0YXRlIiwib25DYW5Sb2JTdGF0ZSIsIm9uQ2FuQ2h1Q2FyZCIsInBsYXllcklkIiwibXlQbGF5ZXJJZCIsImdldFBsYXllckluZm8iLCJpZCIsInBsYXllckRhdGEiLCJzZXJ2ZXJQbGF5ZXJJZCIsImFjY291bnRJRCIsIl9zdG9wUGxheUNvdW50ZG93biIsIl9tdXN0UGxheSIsIm11c3RfcGxheSIsIl9jYW5CZWF0IiwiY2FuX2JlYXQiLCJfbGFzdFBsYXllZENhcmRzIiwiU3RyaW5nIiwiX2hpZGVSb2JVSSIsImNsZWFyT3V0Wm9uZSIsImFjdGl2ZSIsInRpbWVvdXQiLCJfc3RhcnRQbGF5Q291bnRkb3duIiwib25PdGhlclBsYXllckNodUNhcmQiLCJpc19wYXNzIiwiX3BsYXlQYXNzU291bmQiLCJfc2hvd1Bhc3NFZmZlY3QiLCJfbGFzdFBsYXllZEhhbmRUeXBlIiwiaGFuZF90eXBlIiwic29ja2V0SW5mbyIsImFjY291bnRJZCIsImlzU2VsZiIsIl9yZW1vdmVDYXJkc0Zyb21IYW5kIiwiX3BsYXlDYXJkU291bmQiLCJnYW1lU2NlbmVfc2NyaXB0IiwiZ2V0Q29tcG9uZW50Iiwib3V0Q2FyZF9ub2RlIiwiZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQiLCJub2RlX2NhcmRzIiwiY2FyZCIsImluc3RhbnRpYXRlIiwiY2FyZFNjcmlwdCIsInNob3dDYXJkcyIsInB1c2giLCJzaG93T3V0Q2FyZHMiLCJjYXJkc19sZWZ0IiwidW5kZWZpbmVkIiwiY291bnQiLCJvbkNhbGxMYW5kbG9yZFN0YXJ0Iiwib25DYWxsTGFuZGxvcmRUdXJuIiwiX3Byb2Nlc3NDYWxsTGFuZGxvcmRUdXJuIiwib25DYWxsTGFuZGxvcmRSZXN1bHQiLCJfcGxheVJvYlNvdW5kIiwib25DYWxsTGFuZGxvcmRFbmQiLCJfc2hvd0JvdHRvbUNhcmRzVG9BbGwiLCJvbkxhbmRsb3JkQ2FyZHMiLCJsYW5kbG9yZElkIiwibGFuZGxvcmRfaWQiLCJfdXBkYXRlTGFuZGxvcmRIYW5kQ2FyZHMiLCJvblJlc3RhcnRHYW1lIiwiY2xlYXJBbGxDYXJkcyIsIm9uUGxheVN0YXJ0Iiwib25HYW1lT3ZlciIsIl9yZXNldEFsbFBsYXllclJlYWR5U3RhdGUiLCJfc2hvd0dhbWVSZXN1bHRQb3B1cCIsIm9uR2FtZVN0YXRlUmVzdG9yZSIsInJlc3RvcmVHYW1lU3RhdGUiLCJvbkhpbnRSZXN1bHQiLCJfb25IaW50UmVzdWx0Iiwib25UcnVzdGVlU3RhdGVOb3RpZnkiLCJfb25UcnVzdGVlU3RhdGVOb3RpZnkiLCJvbkNvbXBldGl0aW9uU3RhdHVzIiwiX29uQ29tcGV0aXRpb25TdGF0dXMiLCJvbkNvbXBldGl0aW9uQ291bnRkb3duIiwiX29uQ29tcGV0aXRpb25Db3VudGRvd24iLCJvbk1hdGNoQ29pblVwZGF0ZSIsIl9vbk1hdGNoQ29pblVwZGF0ZSIsIm9uQ29tcGV0aXRpb25FbGltaW5hdGVkIiwiX29uQ29tcGV0aXRpb25FbGltaW5hdGVkIiwib25Db21wZXRpdGlvbkFkdmFuY2UiLCJfb25Db21wZXRpdGlvbkFkdmFuY2UiLCJvbkNvbXBldGl0aW9uQ2hhbXBpb24iLCJfb25Db21wZXRpdGlvbkNoYW1waW9uIiwib25Ub3VybmFtZW50RmluYWxSYW5rIiwiX29uVG91cm5hbWVudEZpbmFsUmFuayIsIm9uIiwiZ2FtZVNjZW5lX25vZGUiLCJldmVudCIsIl91cGRhdGVTZWxlY3RlZENvdW50RGlzcGxheSIsImNhcmRpZCIsInN1aXQiLCJyYW5rIiwic3BsaWNlIiwic3RhcnQiLCJvbkRlc3Ryb3kiLCJ1bnNjaGVkdWxlIiwiX2NvbXBldGl0aW9uQ291bnRkb3duVGljayIsIl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIiLCJfbG9jYWxBcmVuYUNvdW50ZG93blRpY2siLCJfaGlkZU1hdGNoQ29pbkRpc3BsYXkiLCJoYXNoIiwiX2xhc3RSZW5kZXJIYXNoIiwic29ydGVkQ2FyZHMiLCJfc29ydENhcmRzIiwiX2NyZWF0ZUJvdHRvbUNhcmRzIiwiX2RlYWxDYXJkc1dpdGhBbmltYXRpb24iLCJzZWxmIiwiY2FyZFBhcmVudCIsImRlY2tQb3MiLCJ4IiwieSIsImluZGV4Iiwic2NoZWR1bGVPbmNlIiwiY2FyZERhdGEiLCJ0YXJnZXRYIiwiX2dldENhcmRYIiwidGFyZ2V0UG9zIiwic2NhbGUiLCJ6SW5kZXgiLCJjYXJkQ29tcCIsInR3ZWVuIiwidG8iLCJwb3NpdGlvbiIsImVhc2luZyIsImNhbGwiLCJ0b3RhbERlYWxUaW1lIiwiX29uRGVhbENhcmRzQ29tcGxldGUiLCJmYXBhaV9lbmQiLCJfY2hlY2tBbmRTaG93Um9iVUkiLCJnZXRDYXJkVmFsdWUiLCJzbGljZSIsInNvcnQiLCJhIiwiYiIsInZhbHVlQSIsInZhbHVlQiIsInJlbW92ZUFsbENoaWxkcmVuIiwid2FybiIsInNwYWNpbmciLCJ0b3RhbFdpZHRoIiwic3RhcnRYIiwiZGVzdHJveSIsImJvdHRvbVkiLCJib3R0b21TdGFydFgiLCJkaV9jYXJkIiwiX3Nob3dCaWRVSSIsInJvdW5kIiwiZXhwaXJlc0F0IiwiZXhwaXJlc19hdCIsImNvbmZpcm1UZXh0IiwiY2FuY2VsVGV4dCIsImNvbmZpcm1CdG4iLCJnZXRDaGlsZEJ5TmFtZSIsImNhbmNlbEJ0biIsImxhYmVsIiwic3RyaW5nIiwiX3N0YXJ0QmlkQ291bnRkb3duIiwiZHVyYXRpb24iLCJ0aW1lTGVmdCIsIm5vdyIsIkRhdGUiLCJNYXRoIiwibWF4IiwiZmxvb3IiLCJfdXBkYXRlQmlkQ291bnRkb3duVUkiLCJzY2hlZHVsZSIsIl9iaWRDb3VudGRvd25UaWNrIiwiX2VudGVyQmlkV2FybmluZ1N0YXRlIiwiX3BsYXlUaWNrU291bmQiLCJfb25CaWRDb3VudGRvd25FbmQiLCJyZW1haW5pbmciLCJ1cGRhdGVkIiwiY2xvY2tOb2RlIiwiaiIsIm9wYWNpdHkiLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJjb2xvciIsIkNvbG9yIiwibGFiZWxOb2RlIiwiX2dldEJpZENvdW50ZG93bkxhYmVsTm9kZSIsIlJFRCIsInN0b3BBbGxBY3Rpb25zIiwicmVwZWF0Rm9yZXZlciIsImxhYmVsTmFtZXMiLCJXSElURSIsIl91cGRhdGVQbGF5Q291bnRkb3duVUkiLCJfcGxheUNvdW50ZG93blRpY2siLCJfZW50ZXJQbGF5V2FybmluZ1N0YXRlIiwiX29uUGxheUNvdW50ZG93bkVuZCIsIkV2ZW50IiwiRXZlbnRDdXN0b20iLCJzZXRVc2VyRGF0YSIsImRpc3BhdGNoRXZlbnQiLCJjbG9ja0xhYmVsIiwiX3VwZGF0ZUNsb2NrVGltZUxhYmVsIiwicGxheWVyTm9kZVNjcmlwdCIsInNlYXRfaW5kZXgiLCJ0aW1lX2xhYmVsIiwiY2xvY2tpbWFnZSIsImNsb2NrQ2hpbGRyZW4iLCJjbG9ja0NoaWxkIiwiZGlyZWN0TGFiZWwiLCJfZ2V0UGxheUNvdW50ZG93bkxhYmVsTm9kZSIsInBsYXlFZmZlY3QiLCJfcGxheVBsYXlUaWNrU291bmQiLCJhY3Rpb24iLCJnZW5kZXIiLCJvcmRlciIsInBsYXllcklEIiwic291bmRLZXkiLCJfbGFzdFJvYlNvdW5kS2V5IiwicGFzc1NvdW5kIiwiX3BsYXlTb3VuZEVmZmVjdCIsInNvdW5kcyIsIl9wbGF5UmFuZG9tU291bmQiLCJmYWxsYmFjayIsImFsbG93RGFuaUZhbGxiYWNrIiwibWVzc2FnZSIsImVycjIiLCJjbGlwMiIsInJhbmRvbSIsIm9uQnV0dG9uQ2xpY2siLCJjdXN0b21EYXRhIiwicmVxdWVzdEJpZCIsInJlcXVlc3RSb2JTdGF0ZSIsInJlcXVlc3RfYnVjaHVfY2FyZCIsIl9vbkhpbnRCdXR0b25DbGljayIsInNldFRpbWVvdXQiLCJzZWxlY3RlZENhcmROYW1lcyIsImNhcmRfZGF0YSIsImNhcmROYW1lIiwiX2dldENhcmREaXNwbGF5TmFtZSIsImNhcmRzVG9QbGF5IiwibWFwIiwiYyIsInZhbGlkYXRpb25SZXN1bHQiLCJfdmFsaWRhdGVIYW5kVHlwZSIsInZhbGlkIiwicmVxdWVzdF9jaHVfY2FyZCIsImVycm9yTXNnIiwibXNnIiwic2VsZWN0ZWRUeXBlIiwic2VsZWN0ZWRDb3VudCIsImxhc3RQbGF5ZWRUeXBlIiwibGFzdFBsYXllZENvdW50IiwibGFzdFBsYXllZENhcmROYW1lcyIsIm5hbWVzIiwiam9pbiIsImRldGFpbE1zZyIsImluZGV4T2YiLCJ5b3VyQ2FyZHMiLCJfcmVzZXRDYXJkRmxhZ3MiLCJkaXNwbGF5VGV4dCIsInB1c2hUaHJlZUNhcmQiLCJjYXJkVG9SZW1vdmUiLCJfdXBkYXRlSGFuZENhcmRzU2lsZW50IiwiY2FyZHNQYXJlbnQiLCJvbGRDaGlsZHJlbiIsIm9mZiIsIkV2ZW50VHlwZSIsIlRPVUNIX1NUQVJUIiwiZGVzdG9yeUNhcmQiLCJjaG9vc2VfY2FyZCIsImRlc3Ryb3lfY2FyZCIsIl9nZXRPdXRDYXJkTm9kZSIsInNlbGVjdGVkTm9kZXMiLCJmbGFnIiwic2VuZEhpbnRSZXF1ZXN0IiwiX3NlbGVjdENhcmRzIiwiX2ZpbmRQbGF5YWJsZUNhcmRzIiwibGFzdFNlbGVjdGVkIiwiY2FyZENvdW50cyIsIl9maW5kU21hbGxlc3RDYXJkcyIsImxhc3RUeXBlIiwibGFzdFJhbmsiLCJfZ2V0TGFzdFBsYXllZE1haW5SYW5rIiwibGFzdENvdW50IiwidG9Mb3dlckNhc2UiLCJfZmluZEJlYXRpbmdTaW5nbGUiLCJfZmluZEJlYXRpbmdQYWlyIiwiX2ZpbmRCZWF0aW5nVHJpcGxlIiwiX2ZpbmRCZWF0aW5nQm9tYiIsIl9maW5kQmVhdGluZ0J5Q291bnQiLCJjb3VudHMiLCJtYXhDb3VudCIsIm1haW5SYW5rIiwicGFyc2VJbnQiLCJyYW5rcyIsIk9iamVjdCIsImtleXMiLCJyIiwidGFyZ2V0UmFuayIsIl9maW5kU21hbGxlc3RCb21iIiwia2lja2VycyIsInJlc3VsdCIsImtpY2tlckNhcmRzIiwiX2ZpbmRLaWNrZXJDYXJkcyIsImNvbmNhdCIsImV4Y2x1ZGVSYW5rIiwiYXZhaWxhYmxlIiwibWluIiwiX2ZpbmRSb2NrZXQiLCJqb2tlcnMiLCJmb3VuZENvdW50IiwiYWxyZWFkeU1hdGNoZWQiLCJjYXJkTm9kZSIsIm1hdGNoS2V5IiwiY2FyZF9pZCIsImFkZENoaWxkIiwic2V0U2NhbGUiLCJnYW1lU3RhdGUiLCJnYW1lX3N0YXRlIiwicGhhc2UiLCJwbGF5ZXJzIiwicCIsImlzX2xhbmRsb3JkIiwibWFzdGVyX2FjY291bnRpZCIsImhhbmQiLCJsYXN0X3BsYXllZCIsImxhc3RfcGxheWVyX2lkIiwiY3VycmVudF90dXJuIiwiaGFuZFR5cGUiLCJpc05ld1JvdW5kIiwiaXNfbmV3X3JvdW5kIiwiY2FuQmVhdCIsIl9leHRyYWN0TWFpblJhbmsiLCJpc0JvbWIiLCJpc1JvY2tldCIsInNvdW5kTmFtZSIsIl9nZXRDYXJkVHlwZVNvdW5kIiwiY2FyZFNvdW5kIiwicHJlZml4IiwiZGFuaVNvdW5kIiwiaGFzU3BlY2lmaWNTb3VuZCIsIl9oYXNTcGVjaWZpY0NhcmRTb3VuZCIsInJhbmRvbVZhbHVlIiwic291bmRJbmRleCIsIl9yYW5rVG9Tb3VuZEluZGV4IiwiaGFzU291bmQiLCJzcGVjaWFsVHlwZXMiLCJfZXh0cmFjdENhcmRSYW5rIiwiTnVtYmVyIiwidmFsdWUiLCJsb2dpY192YWx1ZSIsImtleSIsInN1ZmZpeCIsInJhbmRvbUluZGV4IiwiX3BsYXlHYW1lUmVzdWx0U291bmQiLCJpc1dpbiIsInBhc3NOb2RlIiwiYWRkQ29tcG9uZW50Iiwib3V0bGluZSIsIkxhYmVsT3V0bGluZSIsIndpZHRoIiwiaXNWYWxpZCIsInN1aXROYW1lcyIsInN1aXROYW1lIiwicmFua05hbWVzIiwicmFua05hbWUiLCJyYW5rQ291bnRzIiwidmFsdWVzIiwiZm91cnMiLCJ0aHJlZXMiLCJwYWlycyIsInNpbmdsZXMiLCJpc1NlcXVlbnRpYWwiLCJfaXNTZXF1ZW50aWFsIiwibm9Ud29Pckpva2VyIiwiZXZlcnkiLCJwYWlyUmFua3MiLCJ0aHJlZVJhbmtzIiwidGhyZWVDb3VudCIsInJvb21fY2F0ZWdvcnkiLCJfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXAiLCJpc1dpbm5lciIsIm15V2luR29sZCIsInBsYXllciIsImlzX3dpbm5lciIsIndpbl9nb2xkIiwid2lubmVyX2lkIiwiaXNMYW5kbG9yZCIsIm9sZEdvbGQiLCJnb2JhbF9jb3VudCIsIm5ld0dvbGQiLCJnb2xkQWZ0ZXIiLCJnb2xkX2FmdGVyIiwiX3VwZGF0ZVBsYXllckdvbGREaXNwbGF5IiwibG9jYWxHb2xkIiwiX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cCIsIl9jb250aW51ZUdhbWUiLCJfcmV0dXJuVG9Mb2JieSIsImNhbGxiYWNrIiwid2luU2l6ZSIsImNhbnZhcyIsImZpbmQiLCJtYXNrTm9kZSIsIkJsb2NrSW5wdXRFdmVudHMiLCJtYXNrU3ByaXRlIiwiU3ByaXRlIiwic3ByaXRlRnJhbWUiLCJTcHJpdGVGcmFtZSIsIlR5cGUiLCJTSU1QTEUiLCJzaXplTW9kZSIsIlNpemVNb2RlIiwiQ1VTVE9NIiwiaGVpZ2h0IiwicG9wdXBOb2RlIiwicG9wdXBXaWR0aCIsInBvcHVwSGVpZ2h0IiwiYmdOb2RlIiwiX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZCIsImJvcmRlck5vZGUiLCJfY3JlYXRlR29sZGVuQm9yZGVyIiwiZWZmZWN0TGF5ZXIiLCJfY3JlYXRlVmljdG9yeVBhcnRpY2xlcyIsIl9jcmVhdGVEZWZlYXRQYXJ0aWNsZXMiLCJiYW5uZXJZIiwiYmFubmVyTm9kZSIsIl9jcmVhdGVSZXN1bHRCYW5uZXIiLCJkZXRhaWxYIiwiZGV0YWlsWSIsImRldGFpbE5vZGUiLCJfY3JlYXRlTXVsdGlwbGllckRldGFpbENhcmQiLCJsaXN0V2lkdGgiLCJsaXN0WCIsImxpc3RZIiwicGxheWVyTGlzdE5vZGUiLCJfY3JlYXRlUGxheWVyUmVzdWx0TGlzdCIsImJ0blkiLCJidXR0b25BcmVhIiwiX2NyZWF0ZUJ1dHRvbkFyZWEiLCJfc3RhcnROdW1iZXJBbmltYXRpb25zIiwiX3Jlc3VsdEVmZmVjdExheWVyIiwiZ3JhcGhpY3MiLCJHcmFwaGljcyIsInRvcENvbG9yIiwiYm90dG9tQ29sb3IiLCJmaWxsQ29sb3IiLCJyb3VuZFJlY3QiLCJmaWxsIiwiaW5uZXJHbG93IiwiZ2xvd1Nwcml0ZSIsIlNMSUNFRCIsIm92ZXJsYXkiLCJvdmVybGF5U3ByaXRlIiwiYm9yZGVyQ29sb3IiLCJnbG93Q29sb3IiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsImNvcm5lclNpemUiLCJjb3JuZXJzIiwicm90IiwiY29ybmVyIiwiZGVjb3JOb2RlIiwiZGciLCJtb3ZlVG8iLCJsaW5lVG8iLCJhbmdsZSIsImJhbm5lcldpZHRoIiwiYmFubmVySGVpZ2h0IiwidGl0bGVOb2RlIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ0aXRsZUxhYmVsIiwiZm9udEZhbWlseSIsImhvcml6b250YWxBbGlnbiIsIkhvcml6b250YWxBbGlnbiIsIkNFTlRFUiIsInZlcnRpY2FsQWxpZ24iLCJWZXJ0aWNhbEFsaWduIiwic2hhZG93IiwiTGFiZWxTaGFkb3ciLCJvZmZzZXQiLCJibHVyIiwiY2FyZFdpZHRoIiwiY2FyZEhlaWdodCIsImxpbmVOb2RlIiwibGciLCJtdWx0aURldGFpbCIsIm11bHRpX2RldGFpbCIsImRldGFpbHMiLCJiYXNlX3Njb3JlIiwicWlhbmdfY291bnQiLCJxaWFuZ19tdWx0aSIsImJvbWJfY291bnQiLCJib21iX211bHRpIiwicm9ja2V0X2NvdW50Iiwicm9ja2V0X211bHRpIiwic3ByaW5nX3R5cGUiLCJpdGVtWSIsIml0ZW1IZWlnaHQiLCJpdGVtIiwiaXRlbU5vZGUiLCJ2YWx1ZU5vZGUiLCJ2YWx1ZUxhYmVsIiwidG90YWxNdWx0aU5vZGUiLCJ0b3RhbE11bHRpQmciLCJ0bWciLCJ0b3RhbExhYmVsIiwidHRsIiwibXVsdGlWYWx1ZU5vZGUiLCJtdmwiLCJtdWx0aXBsZSIsIm12byIsImxpc3ROb2RlIiwibGlzdEhlaWdodCIsImhlYWRlck5vZGUiLCJoZWFkZXJzIiwiaGVhZGVyWCIsImhOb2RlIiwiaExhYmVsIiwic2VwTm9kZSIsInNnIiwiaXRlbVN0YXJ0WSIsImlzQ3VycmVudFBsYXllciIsIl9jcmVhdGVQbGF5ZXJSZXN1bHRJdGVtIiwiaGlnaGxpZ2h0IiwiaGciLCJhdmF0YXJOb2RlIiwiYXZhdGFyQmciLCJhZyIsInJvbGUiLCJjaXJjbGUiLCJhdmF0YXJJbmRleCIsImF2YXRhclBhdGgiLCJhdmF0YXJTcHJpdGUiLCJzcCIsInJvbGVJY29uTm9kZSIsInJvbGVMYWJlbCIsIm5hbWVOb2RlIiwibmFtZUxhYmVsIiwicGxheWVyX25hbWUiLCJyb2xlTm9kZSIsInJvbGVUZXh0Iiwid2luR29sZCIsIndpbk5vZGUiLCJ3aW5MYWJlbCIsIndpbk91dGxpbmUiLCJhcmVhTm9kZSIsImNvbnRpbnVlQnRuIiwiX2NyZWF0ZVN0eWxlZEJ1dHRvbiIsIlRPVUNIX0VORCIsImxvYmJ5QnRuIiwidGV4dCIsImlzUHJpbWFyeSIsImJ0bk5vZGUiLCJidG5XaWR0aCIsImJ0bkhlaWdodCIsIm92ZXJmbG93IiwiT3ZlcmZsb3ciLCJTSFJJTksiLCJUT1VDSF9DQU5DRUwiLCJjb2luIiwiZyIsInRhcmdldFkiLCJkZWxheSIsInBhcmFsbGVsIiwic3RhciIsIl9kcmF3U3RhciIsInBhcnRpY2xlIiwiY3giLCJjeSIsImlubmVyUmFkaXVzIiwicG9pbnRzIiwib3V0ZXJSYWRpdXMiLCJyYWRpdXMiLCJQSSIsImNvcyIsInNpbiIsImNsb3NlIiwiX2ZpbmROb2RlQnlOYW1lIiwidGFyZ2V0TXVsdGkiLCJfYW5pbWF0ZU51bWJlciIsImZyb20iLCJzdGFydFRpbWUiLCJkaWZmIiwidXBkYXRlIiwiZWxhcHNlZCIsInByb2dyZXNzIiwiZWFzZVByb2dyZXNzIiwicG93IiwiY3VycmVudCIsImZvdW5kIiwicGxheWVyR29sZCIsInJvb21Db25maWciLCJjdXJyZW50Um9vbUNvbmZpZyIsIm1pbkdvbGQiLCJtaW5fZ29sZCIsIl9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwIiwiX2RvQ29udGludWVHYW1lIiwiX3Jlc2V0R2FtZVN0YXRlIiwicmVxdWVzdFJlYWR5IiwiY3VycmVudEdvbGQiLCJyZXF1aXJlZEdvbGQiLCJkaXJlY3RvciIsImdldFNjZW5lIiwiY29udGVudE5vZGUiLCJjb250ZW50TGFiZWwiLCJfZm9ybWF0R29sZCIsIlJFU0laRV9IRUlHSFQiLCJidG5BcmVhTm9kZSIsImFkQnRuIiwiYWRCZyIsImFkTGFiZWxOb2RlIiwiYWRMYWJlbCIsImxvYmJ5QmciLCJsb2JieUxhYmVsTm9kZSIsImxvYmJ5TGFiZWwiLCJfaW5zdWZmaWNpZW50R29sZFBvcHVwIiwiX2luc3VmZmljaWVudEdvbGRNYXNrIiwiX3dhdGNoQWRGb3JHb2xkIiwic3VjY2VzcyIsIl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCIsInR0Iiwic2hvd1Jld2FyZGVkVmlkZW9BZCIsIl9yZXdhcmRHb2xkQWZ0ZXJBZCIsImZhaWwiLCJfc2hvd01lc3NhZ2UiLCJ3eCIsImNyZWF0ZVJld2FyZGVkVmlkZW9BZCIsInJld2FyZGVkVmlkZW9BZCIsImFkVW5pdElkIiwib25DbG9zZSIsInJlcyIsImlzRW5kZWQiLCJvbkVycm9yIiwic2hvdyIsInRoZW4iLCJfcmV3YXJkR29sZEFmdGVyR29sZCIsInJld2FyZEFtb3VudCIsInVwZGF0ZUdvbGQiLCJzZW5kQWRSZXdhcmQiLCJnb2xkIiwidG9GaXhlZCIsInRvU3RyaW5nIiwibGVhdmVSb29tIiwibG9hZFNjZW5lIiwiX2NsZWFyQm90dG9tQ2FyZHMiLCJwbGF5ZXJzX3NlYXRfcG9zIiwic2VhdE5vZGUiLCJvdXRab25lTmFtZSIsIm91dFpvbmUiLCJwbGF5ZXJOb2RlTGlzdCIsInBsYXllck5vZGUiLCJwbGF5ZXJTY3JpcHQiLCJyZWFkeWltYWdlIiwiZ2xvYmFsY291bnRfbGFiZWwiLCJfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheSIsIm1hdGNoQ29pbiIsImlzX2ZpbmFsX3JvdW5kIiwibXlNYXRjaENvaW4iLCJtYXRjaF9jb2luIiwiYmciLCJyZXN1bHROb2RlIiwicmVzdWx0TGFiZWwiLCJtdWx0aU5vZGUiLCJtdWx0aUxhYmVsIiwiY29pbk5vZGUiLCJjb2luTGFiZWwiLCJpbml0aWFsQ291bnRkb3duIiwiYXJlbmFfY291bnRkb3duIiwiY291bnRkb3duQ29udGFpbmVyIiwiY291bnRkb3duTGFiZWwiLCJjb3VudGRvd25MYWJlbENvbXAiLCJjb3VudGRvd25OdW1iZXIiLCJjb3VudGRvd25OdW1iZXJDb21wIiwiQkxBQ0siLCJfY291bnRkb3duTGFiZWxOb2RlIiwiX2NvdW50ZG93bk51bWJlck5vZGUiLCJfYXJlbmFDb3VudGRvd25TZWNvbmRzIiwiX3N0YXJ0TG9jYWxBcmVuYUNvdW50ZG93biIsIl9zZXR1cEFyZW5hQ291bnRkb3duTGlzdGVuZXJzIiwic2Vjb25kcyIsIl91cGRhdGVBcmVuYUNvdW50ZG93blVJIiwibWFjcm8iLCJSRVBFQVRfRk9SRVZFUiIsIl9zaG93V2FpdGluZ0ZvclNlcnZlciIsIm9uQXJlbmFSb3VuZENvdW50ZG93biIsIm9uQXJlbmFDb3VudGRvd25UaWNrIiwib25BcmVuYUF1dG9SZWFkeSIsIl9zaG93QXJlbmFBdXRvUmVhZHlNZXNzYWdlIiwib25BcmVuYVJlY29ubmVjdFN0YXRlIiwiY291bnRkb3duIiwibnVtTGFiZWwiLCJ0b3RhbF9yb3VuZHMiLCJfc2hvd01hdGNoQ29pbkRpc3BsYXkiLCJfdXBkYXRlQ29tcGV0aXRpb25Db3VudGRvd25EaXNwbGF5IiwiX3VwZGF0ZU1hdGNoQ29pbkRpc3BsYXkiLCJkZWx0YSIsIl9tYXRjaENvaW5Ob2RlIiwibWF0Y2hDb2luTm9kZSIsImljb25Ob2RlIiwiaWNvbkxhYmVsIiwiX3Nob3dNYXRjaENvaW5EZWx0YUFuaW1hdGlvbiIsImRlbHRhTm9kZSIsImRlbHRhTGFiZWwiLCJfc2hvd0VsaW1pbmF0ZWRQb3B1cCIsInJhbmtOb2RlIiwicmFua0xhYmVsIiwicmVhc29uTm9kZSIsInJlYXNvbkxhYmVsIiwicmVhc29uIiwidG90YWxOb2RlIiwidG90YWxfcGxheWVycyIsInJld2FyZHMiLCJyZXdhcmROb2RlIiwicmV3YXJkTGFiZWwiLCJidG5CZyIsImJ0bkxhYmVsTm9kZSIsImJ0bkxhYmVsIiwiX2VsaW1pbmF0ZWRQb3B1cCIsIl9lbGltaW5hdGVkTWFzayIsImN1cnJlbnRfcm91bmQiLCJfc2hvd0FkdmFuY2VUb2FzdCIsInRvYXN0Tm9kZSIsIl9zaG93Q2hhbXBpb25Qb3B1cCIsImVuYWJsZUJvbGQiLCJyYW5raW5ncyIsInRvcFRocmVlWSIsIl9jcmVhdGVSYW5raW5nSXRlbSIsIm90aGVyVGl0bGVOb2RlIiwib3RoZXJUaXRsZUxhYmVsIiwic3RhcnRZIiwibWF4T3RoZXJSYW5raW5ncyIsInJhbmtJbmZvIiwicmFua0l0ZW1Ob2RlIiwicmFua0l0ZW1MYWJlbCIsImNvbmZpcm1CZyIsImNvbmZpcm1MYWJlbE5vZGUiLCJjb25maXJtTGFiZWwiLCJfY3JlYXRlQ2hhbXBpb25QYXJ0aWNsZXMiLCJfY2hhbXBpb25Qb3B1cCIsIl9jaGFtcGlvbk1hc2siLCJiZ0NvbG9yIiwicmFua0xhYmVsTm9kZSIsInJhbmtUZXh0IiwibmFtZUxhYmVsTm9kZSIsImNvaW5MYWJlbE5vZGUiLCJwYXJlbnROb2RlIiwicGFydGljbGVMYWJlbCIsIl9zaG93VG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyIsInRpdGxlQmdOb2RlIiwidGl0bGVCZyIsInRvcDMiLCJwb2RpdW1ZIiwicG9kaXVtU3BhY2luZyIsIl9jcmVhdGVQb2RpdW1FbnRyeSIsInRvcDIwIiwibGlzdFRpdGxlTm9kZSIsImxpc3RUaXRsZUxhYmVsIiwic2Nyb2xsVmlld05vZGUiLCJtYXNrIiwiTWFzayIsIlJFQ1QiLCJ0b3AzUGxheWVySURzIiwiZmlsdGVyZWRUb3AyMCIsInJhbmtEYXRhIiwiYWN0dWFsUmFuayIsIl9jcmVhdGVSYW5rTGlzdEl0ZW0iLCJfYWRkU2Nyb2xsVmlld1RvdWNoIiwic2VwIiwibXlSYW5rQmdOb2RlIiwibXlSYW5rQmciLCJteVJhbmtOb2RlIiwibXlSYW5rTGFiZWwiLCJteV9yYW5rIiwibXlfbWF0Y2hfY29pbiIsImJ0bkxhYmVsQ29tcCIsIl9sb2FkQXZhdGFyU3ByaXRlIiwiYXZhdGFyIiwiaXNfcm9ib3QiLCJwbGF5ZXJOYW1lIiwiX2dldFJvYm90RGlzcGxheU5hbWUiLCJMRUZUIiwiQ0xBTVAiLCJSSUdIVCIsInZpZXdIZWlnaHQiLCJ0b3VjaFN0YXJ0WSIsImNvbnRlbnRTdGFydFkiLCJtYXhPZmZzZXQiLCJnZXRMb2NhdGlvblkiLCJUT1VDSF9NT1ZFIiwidG91Y2hZIiwiZGVsdGFZIiwibmV3WSIsIm1pblkiLCJtYXhZIiwiZW50cnlOb2RlIiwibWVkYWxOb2RlIiwibWVkYWwiLCJtZWRhbENvbG9yIiwicmFua051bU5vZGUiLCJyYW5rTnVtTGFiZWwiLCJhdmF0YXJGcmFtZU5vZGUiLCJhdmF0YXJGcmFtZSIsIm9yaWdpbmFsTmFtZSIsInJvYm90SW5kZXgiLCJsYXN0Q2hhciIsInNwcml0ZSIsImF2YXRhclVybCIsImlzUm9ib3QiLCJyb2JvdEF2YXRhckluZGV4IiwiZGVmYXVsdFBhdGgiLCJhc3NldE1hbmFnZXIiLCJsb2FkUmVtb3RlIiwiZXh0IiwidGV4dHVyZSIsImZhbGxiYWNrU3ByaXRlIiwiZSIsImxvY2FsUGF0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSUEsWUFBWSxHQUFHQyxNQUFNLENBQUNELFlBQVksSUFBSSxDQUFDO0FBQzNDLElBQUlFLFVBQVUsR0FBR0QsTUFBTSxDQUFDQyxVQUFVLElBQUk7RUFBRUMsT0FBTyxFQUFFLENBQUM7RUFBRUMsSUFBSSxFQUFFO0FBQUUsQ0FBQztBQUM3RCxJQUFJQyxVQUFVLEdBQUdKLE1BQU0sQ0FBQ0ksVUFBVSxJQUFJLENBQUMsQ0FBQztBQUN4QyxJQUFJQyxTQUFTLEdBQUdMLE1BQU0sQ0FBQ0ssU0FBUyxJQUFJLENBQUMsQ0FBQzs7QUFFdEM7QUFDQSxJQUFJQyxXQUFXLEdBQUcsQ0FBQyxDQUFDOztBQUVwQjtBQUNBLElBQUlDLFVBQVUsR0FBRztFQUNiQyxTQUFTLEVBQUUsR0FBRztFQUNkQyxLQUFLLEVBQUUsQ0FBQyxHQUFHO0VBQ1hDLFdBQVcsRUFBRSxFQUFFO0VBQ2ZDLGVBQWUsRUFBRSxHQUFHO0VBQ3BCQyxpQkFBaUIsRUFBRSxFQUFFO0VBQ3JCQyxZQUFZLEVBQUUsR0FBRztFQUNqQkMsY0FBYyxFQUFFO0FBQ3BCLENBQUM7O0FBRUQ7QUFDQSxJQUFJQyxVQUFVLEdBQUc7RUFDYkMsWUFBWSxFQUFFLElBQUk7RUFDbEJDLFlBQVksRUFBRUMsRUFBRSxDQUFDQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztFQUMzQkMsWUFBWSxFQUFFO0FBQ2xCLENBQUM7O0FBRUQ7QUFDQSxTQUFTQyxTQUFTQSxDQUFD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jeS9v+eUqCByZXF1aXJlXG4vLyDjgJDlvbvlupXkv67lpI3niYjmnKzjgJHmnI3liqHnq6/mlbDmja7kuLrllK/kuIDmlbDmja7mupBcbi8vIFxuLy8g5qC45b+D5Y6f5YiZ77yaXG4vLyAxLiBoYW5kQ2FyZHMg5piv5ZSv5LiA5pWw5o2u5rqQ77yM5L+d5a2Y5pyN5Yqh56uv5Y6f5aeL5pWw5o2uXG4vLyAyLiDnpoHmraLku7vkvZXmlbDmja7ovazmjaLjgIHmjpLluo/jgIHph43mlrDorqHnrpdcbi8vIDMuIHJlbmRlckNhcmRzKCkg5piv5ZSv5LiA5riy5p+T5YWl5Y+jXG4vLyA0LiDliqjnlLvlj6rmmK/op4bop4nmlYjmnpzvvIznu53kuI3og73kv67mlLnmlbDmja5cbi8vIDUuIGNsZWFyQWxsQ2FyZHMoKSDmuIXnkIbmiYDmnInml6foioLngrnvvIjop6PlhrPog4zpnaLniYzmrovnlZnvvIlcblxudmFyIGlzb3Blbl9zb3VuZCA9IHdpbmRvdy5pc29wZW5fc291bmQgfHwgMVxudmFyIHFpYW5fc3RhdGUgPSB3aW5kb3cucWlhbl9zdGF0ZSB8fCB7IGJ1cWlhbmc6IDAsIHFpYW46IDEgfVxudmFyIENhcmRzVmFsdWUgPSB3aW5kb3cuQ2FyZHNWYWx1ZSB8fCB7fVxudmFyIFJvb21TdGF0ZSA9IHdpbmRvdy5Sb29tU3RhdGUgfHwge31cblxuLy8g6Z+z5pWI57yT5a2YXG52YXIgX2F1ZGlvQ2xpcHMgPSB7fVxuXG4vLyDniYzluIPlsYDphY3nva5cbnZhciBDYXJkTGF5b3V0ID0ge1xuICAgIGNhcmRTY2FsZTogMC44LFxuICAgIGNhcmRZOiAtMjUwLFxuICAgIGNhcmRTcGFjaW5nOiAzNSxcbiAgICBib3R0b21DYXJkU2NhbGU6IDAuNCxcbiAgICBib3R0b21DYXJkU3BhY2luZzogMjUsXG4gICAgb3V0Q2FyZFNjYWxlOiAwLjUsXG4gICAgb3V0Q2FyZFNwYWNpbmc6IDI1LFxufVxuXG4vLyDlj5HniYzliqjnlLvphY3nva5cbnZhciBEZWFsQ29uZmlnID0ge1xuICAgIGFuaW1EdXJhdGlvbjogMC4xMixcbiAgICBkZWNrUG9zaXRpb246IGNjLnYyKDAsIDEwMCksXG4gICAgY2FyZEludGVydmFsOiA4MCxcbn1cblxuLy8g5Yqg6L295bm25pKt5pS+6Z+z5pWIXG5mdW5jdGlvbiBwbGF5U291bmQocGF0aCkge1xuICAgIGlmICghaXNvcGVuX3NvdW5kKSByZXR1cm4gbnVsbFxuICAgIGlmIChfYXVkaW9DbGlwc1twYXRoXSkge1xuICAgICAgICByZXR1cm4gY2MuYXVkaW9FbmdpbmUucGxheShfYXVkaW9DbGlwc1twYXRoXSwgZmFsc2UsIDEpXG4gICAgfVxuICAgIGNjLnJlc291cmNlcy5sb2FkKHBhdGgsIGNjLkF1ZGlvQ2xpcCwgZnVuY3Rpb24oZXJyLCBjbGlwKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIF9hdWRpb0NsaXBzW3BhdGhdID0gY2xpcFxuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIGZhbHNlLCAxKVxuICAgIH0pXG4gICAgcmV0dXJuIG51bGxcbn1cblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcbiAgICBuYW1lOiAnZ2FtZWluZ1VJJyxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZ2FtZWluZ1VJOiBjYy5Ob2RlLFxuICAgICAgICBjYXJkX3ByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICByb2JVSTogY2MuTm9kZSxcbiAgICAgICAgYm90dG9tX2NhcmRfcG9zX25vZGU6IGNjLk5vZGUsXG4gICAgICAgIHBsYXlpbmdVSV9ub2RlOiBjYy5Ob2RlLFxuICAgICAgICB0aXBzTGFiZWw6IGNjLkxhYmVsLFxuICAgICAgICBjYXJkc19ub2RlOiBjYy5Ob2RlLCAgLy8g5omL54mM6IqC54K55a655ZmoXG4gICAgICAgIC8vIPCflZDjgJDmlrDlop7jgJHlgJLorqHml7ZMYWJlbOW8leeUqFxuICAgICAgICBiaWRDb3VudGRvd25MYWJlbDogY2MuTGFiZWwsICAgIC8vIOaKouWcsOS4u+WAkuiuoeaXtlxuICAgICAgICBwbGF5Q291bnRkb3duTGFiZWw6IGNjLkxhYmVsLCAgIC8vIOWHuueJjOWAkuiuoeaXtlxuICAgICAgICAvLyDwn5SK44CQ5paw5aKe44CR5ru0562U6Z+z5pWI77yIM+enkuWCrOS/g+mfs+aViO+8iVxuICAgICAgICB0aWNrQXVkaW86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgb25Mb2FkICgpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJteWdsb2JhbCDmnKrlrprkuYlcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeehruS/neaJi+eJjOWuueWZqOiKgueCueWtmOWcqFxuICAgICAgICBpZiAoIXRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgLy8g5p+l5om+5piv5ZCm5bey5a2Y5Zyo5omL54mM5a655Zmo6IqC54K5XG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lTm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGlmIChnYW1lU2NlbmVOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IFwiY2FyZHNfbm9kZVwiIHx8IGNoaWxkLm5hbWUgPT09IFwiY2FyZHNcIiB8fCBjaGlsZC5uYW1lID09PSBcImhhbmRDYXJkc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRzX25vZGUgPSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmib7liLDvvIzliJvlu7rkuIDkuKrmlrDnmoTlrrnlmajoioLngrlcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3Q2FyZHNOb2RlID0gbmV3IGNjLk5vZGUoXCJjYXJkc19ub2RlXCIpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5wYXJlbnQgPSBnYW1lU2NlbmVOb2RlXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRQb3NpdGlvbigwLCAwKVxuICAgICAgICAgICAgICAgICAgICBuZXdDYXJkc05vZGUuc2V0QW5jaG9yUG9pbnQoMC41LCAwLjUpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDgwMCwgMjAwKSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlID0gbmV3Q2FyZHNOb2RlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOOAkOaguOW/g+OAkeWUr+S4gOaVsOaNrua6kCAtIOacjeWKoeerr+WOn+Wni+aJi+eJjOaVsOaNrlxuICAgICAgICAvLyDjgJDph43opoHjgJHnpoHmraLku7vkvZXkv67mlLnjgIHmjpLluo/jgIHovazmjaJcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHRoaXMuaGFuZENhcmRzID0gW10gICAgICAgICAgIC8vIOOAkOWUr+S4gOaVsOaNrua6kOOAkeacjeWKoeerr+WOn+Wni+aJi+eJjFxuICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW10gICAgICAgICAvLyDlupXniYzmlbDmja5cbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW10gICAgLy8g6YCJ5Lit55qE54mMXG4gICAgICAgIFxuICAgICAgICAvLyDmiqLlnLDkuLvnm7jlhbNcbiAgICAgICAgdGhpcy5yb2JfcGxheWVyX2FjY291bnRpZCA9IDBcbiAgICAgICAgdGhpcy5fYmlkZGluZ1BoYXNlID0gXCJpZGxlXCJcbiAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCIgIC8vIPCflKfjgJDmlrDlop7jgJHmuLjmiI/pmLbmrrU6IGlkbGUsIGJpZGRpbmcsIHBsYXlpbmdcbiAgICAgICAgdGhpcy5jYXJkc1JlYWR5ID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIC8vIPCflZDjgJDlgJLorqHml7bns7vnu5/jgJFcbiAgICAgICAgdGhpcy5fYmlkVGltZW91dCA9IDBcbiAgICAgICAgdGhpcy5fcGxheVRpbWVvdXQgPSAwXG4gICAgICAgIHRoaXMuX2JpZENvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB0aGlzLl9wbGF5Q291bnRkb3duVGltZXIgPSBudWxsXG4gICAgICAgIHRoaXMuX2JpZFRpbWVMZWZ0ID0gMFxuICAgICAgICB0aGlzLl9wbGF5VGltZUxlZnQgPSAwXG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5fYmlkRXhwaXJlc0F0ID0gMCAgLy8g8J+Up+OAkOaWsOWinuOAkeacjeWKoeerr+i/h+acn+aXtumXtOaIs++8iOavq+enku+8iVxuICAgICAgICBcbiAgICAgICAgLy8g5bqV54mM6IqC54K5XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOOAkOernuaKgOWcuuOAkeeKtuaAgeWPmOmHj1xuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdGhpcy5faXNDb21wZXRpdGlvbiA9IGZhbHNlICAgICAgICAgICAvLyDmmK/lkKbmmK/nq57mioDlnLrmqKHlvI9cbiAgICAgICAgdGhpcy5fcm9vbUNhdGVnb3J5ID0gMSAgICAgICAgICAgICAgICAvLyDmiL/pl7TnsbvlnovvvJoxPeaZrumAmuWcuu+8jDI956ue5oqA5Zy6XG4gICAgICAgIHRoaXMuX21hdGNoQ29pbiA9IDAgICAgICAgICAgICAgICAgICAgLy8g5q+U6LWb6YeR5biBXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uUm91bmQgPSAwICAgICAgICAgICAgLy8g5b2T5YmN6L2u5qyhXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uVG90YWxSb3VuZHMgPSAwICAgICAgLy8g5oC76L2u5qyhXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duID0gMCAgICAgICAgLy8g56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGltZXIgPSBudWxsIC8vIOernuaKgOWcuuWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICB0aGlzLl93YXNEaXNjb25uZWN0ZWQgPSBmYWxzZSAgICAgICAgIC8vIOaYr+WQpuWcqOavlOi1m+S4reaOiee6v1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09IOacjeWKoeWZqOa2iOaBr+ebkeWQrCA9PT09PT09PT09PT1cbiAgICAgICAgXG4gICAgICAgIC8vIOOAkOaguOW/g+OAkeebkeWQrOacjeWKoeWZqOWPkeeJjOa2iOaBryAtIOWUr+S4gOaVsOaNruWFpeWPo1xuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25QdXNoQ2FyZHMoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gPT09PT09PT09PSDmnI3liqHnq6/lj5HniYzmtojmga8gPT09PT09PT09PVwiKVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4OPIOacjeWKoeerr+WOn+Wni+aJi+eJjDpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS5jYXJkcykpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48g5pyN5Yqh56uv5Y6f5aeL5bqV54mMOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhLmJvdHRvbV9jYXJkcykpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHmlrDkuIDova7lj5HniYzml7bvvIzlhbPpl63kuIrkuIDova7nmoTnu5PnrpflvLnnqpdcbiAgICAgICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW29uUHVzaENhcmRzXSDlhbPpl63kuIrkuIDova7nmoTnu5PnrpflvLnnqpdcIilcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9zZUdhbWVSZXN1bHRQb3B1cCh0aGlzLl9nYW1lUmVzdWx0UG9wdXAsIHRoaXMuX2dhbWVSZXN1bHRNYXNrKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5YGc5q2i5omA5pyJ56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wQXJlbmFDb3VudGRvd24oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5riF55CG5qGM6Z2i5LiK55qE54mM77yI5LiK5LiA6L2u5pyA5ZCO5LiA5omL54mM77yJXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW29uUHVzaENhcmRzXSDmuIXnkIbmoYzpnaLkuIrnmoTniYxcIilcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyQWxsT3V0Q2FyZFpvbmVzKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g44CQ5qC45b+D44CR55u05o6l5L+d5a2Y5pyN5Yqh56uv5pWw5o2u77yM5LiN5YGa5Lu75L2V6L2s5o2iXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IGRhdGEuY2FyZHMgfHwgW11cbiAgICAgICAgICAgIHRoaXMuYm90dG9tQ2FyZHMgPSBkYXRhLmJvdHRvbV9jYXJkcyB8fCBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDjgJDmoLjlv4PjgJHllK/kuIDmuLLmn5PlhaXlj6NcbiAgICAgICAgICAgIHRoaXMucmVuZGVyQ2FyZHModGhpcy5oYW5kQ2FyZHMpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzlj6vlnLDkuLvova7mrKHvvIjml6fniYjmtojmga/vvIzku4XnlKjkuo7lhbzlrrnvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQmlkVHVybihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIOS4jeWGjeWkhOeQhu+8jOmBv+WFjemHjeWkjVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5Y+r5Zyw5Li757uT5p6cXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkJpZFJlc3VsdChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflJLjgJDph43opoHjgJHmlLbliLDnu5PmnpzvvIzlgZzmraLlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwiYmlkX3Jlc3VsdF9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcl9pZDogZGF0YS5hY2NvdW50aWQsXG4gICAgICAgICAgICAgICAgICAgIGJpZDogZGF0YS5zdGF0ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvova7mrKHvvIjml6fniYjmtojmga/vvIzku4XnlKjkuo7lhbzlrrnvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FuUm9iU3RhdGUoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvLyDkuI3lho3lpITnkIbvvIzpgb/lhY3ph43lpI1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOWHuueJjOi9ruasoVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25DYW5DaHVDYXJkKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdmFyIHBsYXllcklkID0gZGF0YS5wbGF5ZXJfaWQgfHwgZGF0YVxuICAgICAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcblxuICAgICAgICAgICAgLy8g8J+UkuOAkOmHjeimgeOAkeWFiOWBnOatouS5i+WJjeeahOWAkuiuoeaXtu+8iOacjeWKoeWZqOi9rui9rOS6hu+8iVxuICAgICAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5L+d5a2Y5Ye654mM54q25oCB77yM55So5LqO5o+Q56S65Yqf6IO9XG4gICAgICAgICAgICB0aGlzLl9tdXN0UGxheSA9IGRhdGEubXVzdF9wbGF5IHx8IGZhbHNlXG4gICAgICAgICAgICB0aGlzLl9jYW5CZWF0ID0gZGF0YS5jYW5fYmVhdCB8fCBmYWxzZVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZENhcmRzID0gbnVsbCAgLy8g5LiK5a625Ye655qE54mM77yM6ZyA6KaB5LuOIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOiOt+WPllxuXG4gICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllcklkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyT3V0Wm9uZShteVBsYXllcklkKVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlUaW1lb3V0ID0gZGF0YS50aW1lb3V0IHx8IDE1XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhcnRQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOWFtuS7lueOqeWutuWHuueJjFxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25PdGhlclBsYXllckNodUNhcmQoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvLyDwn5SS44CQ6YeN6KaB44CR5pS25Yiw5Ye654mM5raI5oGv77yM5YGc5q2i5oiR55qE5YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wUGxheUNvdW50ZG93bigpXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkhOeQhuS4jeWHuueahOaDheWGtVxuICAgICAgICAgICAgaWYgKGRhdGEuaXNfcGFzcykge1xuICAgICAgICAgICAgICAgIC8vIPCflIrjgJDmlrDlop7jgJHmkq3mlL7kuI3lh7rpn7PmlYhcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5UGFzc1NvdW5kKGRhdGEpXG4gICAgICAgICAgICAgICAgLy8g8J+UiuOAkOaWsOWinuOAkeaYvuekuuS4jeWHuuaViOaenFxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dQYXNzRWZmZWN0KGRhdGEuYWNjb3VudGlkKVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHkuI3lh7rml7bkuI3muIXpmaTkuIrlrrblh7rnmoTniYxcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOS4iuWutuWHuueahOeJjO+8jOeUqOS6juaPkOekuuWKn+iDvVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZENhcmRzID0gZGF0YS5jYXJkcyB8fCBbXVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZEhhbmRUeXBlID0gZGF0YS5oYW5kX3R5cGUgfHwgXCJcIlxuXG4gICAgICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhdGhpcy5ub2RlLnBhcmVudCkgcmV0dXJuXG5cbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHojrflj5blvZPliY3njqnlrrZJRO+8jOWIpOaWreaYr+WQpuaYr+iHquW3seWHuueJjFxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeWuieWFqOiOt+WPlueOqeWutklE77yM6YG/5YWN5oql6ZSZXG4gICAgICAgICAgICB2YXIgc29ja2V0SW5mbyA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkgfHwge31cbiAgICAgICAgICAgIHZhciBzZXJ2ZXJQbGF5ZXJJZCA9IChteWdsb2JhbC5wbGF5ZXJEYXRhICYmIG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQpIHx8IFwiXCJcbiAgICAgICAgICAgIHZhciBhY2NvdW50SWQgPSAobXlnbG9iYWwucGxheWVyRGF0YSAmJiBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCkgfHwgXCJcIlxuICAgICAgICAgICAgdmFyIG15UGxheWVySWQgPSBzb2NrZXRJbmZvLmlkIHx8IHNlcnZlclBsYXllcklkIHx8IGFjY291bnRJZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5L2/55So5pu05a6J5YWo55qE5q+U6L6D5pa55byPXG4gICAgICAgICAgICB2YXIgaXNTZWxmID0gU3RyaW5nKGRhdGEuYWNjb3VudGlkIHx8IFwiXCIpID09PSBTdHJpbmcobXlQbGF5ZXJJZCB8fCBcIlwiKVxuXG4gICAgICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR6K+m57uG5omT5Y2wSUTmr5TovoPkv6Hmga9cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOaguOW/g+S/ruWkjeOAkeWmguaenOaYr+iHquW3seWHuueJjO+8jOS7juaJi+eJjOS4reWIoOmZpFxuICAgICAgICAgICAgaWYgKGlzU2VsZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNhcmRzRnJvbUhhbmQoZGF0YS5jYXJkcylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIPCflIrjgJDmlrDlop7jgJHmkq3mlL7lh7rniYzpn7PmlYhcbiAgICAgICAgICAgIHRoaXMuX3BsYXlDYXJkU291bmQoZGF0YSlcblxuICAgICAgICAgICAgLy8g5pi+56S65Ye655qE54mM5Yiw5qGM6Z2iXG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgICAgICBpZiAoIWdhbWVTY2VuZV9zY3JpcHQpIHJldHVyblxuXG4gICAgICAgICAgICB2YXIgb3V0Q2FyZF9ub2RlID0gZ2FtZVNjZW5lX3NjcmlwdC5nZXRVc2VyT3V0Q2FyZFBvc0J5QWNjb3VudChkYXRhLmFjY291bnRpZClcbiAgICAgICAgICAgIGlmICghb3V0Q2FyZF9ub2RlIHx8ICF0aGlzLmNhcmRfcHJlZmFiKSByZXR1cm5cblxuICAgICAgICAgICAgLy8g44CQ6YeN6KaB44CR55u05o6l5L2/55So5pyN5Yqh56uv5pWw5o2u5Yib5bu66IqC54K5XG4gICAgICAgICAgICB2YXIgbm9kZV9jYXJkcyA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuY2FyZF9wcmVmYWIpXG4gICAgICAgICAgICAgICAgaWYgKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRTY3JpcHQgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRTY3JpcHQuc2hvd0NhcmRzKGRhdGEuY2FyZHNbaV0sIG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGVfY2FyZHMucHVzaChjYXJkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2hvd091dENhcmRzKG91dENhcmRfbm9kZSwgbm9kZV9jYXJkcylcblxuICAgICAgICAgICAgLy8g5pu05paw5Ymp5L2Z54mM5pWwXG4gICAgICAgICAgICBpZiAoZGF0YS5jYXJkc19sZWZ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJ1cGRhdGVfY2FyZF9jb3VudF9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRpZDogZGF0YS5hY2NvdW50aWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiBkYXRhLmNhcmRzX2xlZnRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5oqi5Zyw5Li76Zi25q615byA5aeLXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNhbGxMYW5kbG9yZFN0YXJ0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fYmlkZGluZ1BoYXNlID0gXCJiaWRkaW5nXCJcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwiYmlkZGluZ1wiICAvLyDwn5Sn44CQ5paw5aKe44CR6K6+572u5ri45oiP6Zi25q61XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvova7mrKFcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FsbExhbmRsb3JkVHVybihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NDYWxsTGFuZGxvcmRUdXJuKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvnu5PmnpxcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FsbExhbmRsb3JkUmVzdWx0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy8g8J+UkuOAkOmHjeimgeOAkeaUtuWIsOe7k+aenO+8jOWBnOatouWAkuiuoeaXtlxuICAgICAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmkq3mlL7miqLlnLDkuLvor63pn7NcbiAgICAgICAgICAgIHRoaXMuX3BsYXlSb2JTb3VuZChkYXRhKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJjYWxsX2xhbmRsb3JkX3Jlc3VsdF9ldmVudFwiLCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5oqi5Zyw5Li76Zi25q6157uT5p2fXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNhbGxMYW5kbG9yZEVuZChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflJLjgJDph43opoHjgJHlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHph43nva7miqLlnLDkuLvnm7jlhbPnirbmgIFcbiAgICAgICAgICAgIHRoaXMucm9iX3BsYXllcl9hY2NvdW50aWQgPSAwXG4gICAgICAgICAgICB0aGlzLmNhcmRzUmVhZHkgPSBmYWxzZSAgLy8g6YeN572u5Y+R54mM5a6M5oiQ5qCH6K6wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHkv53lrZjlupXniYzmlbDmja5cbiAgICAgICAgICAgIGlmIChkYXRhLmJvdHRvbV9jYXJkcyAmJiBkYXRhLmJvdHRvbV9jYXJkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib3R0b21DYXJkcyA9IGRhdGEuYm90dG9tX2NhcmRzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDph43opoHjgJHmmL7npLrlupXniYzvvIjmiYDmnInnjqnlrrbpg73og73nnIvliLDvvIlcbiAgICAgICAgICAgIHRoaXMuX3Nob3dCb3R0b21DYXJkc1RvQWxsKGRhdGEuYm90dG9tX2NhcmRzKVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeebkeWQrOWcsOS4u+aWsOaJi+eJjOa2iOaBryAtIOWPquabtOaWsOWcsOS4u+eahOaJi+eJjO+8jOS4jeinpuWPkemHjeaWsOWPkeeJjFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5b+F6aG76aqM6K+B6Ieq5bex5piv5ZCm5piv5Zyw5Li777yM5Y+q5pyJ5Zyw5Li75omN5pu05paw5omL54mMXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkxhbmRsb3JkQ2FyZHMoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7pqozor4HjgJHmo4Dmn6Xoh6rlt7HmmK/lkKbmmK/lnLDkuLtcbiAgICAgICAgICAgIHZhciBteVBsYXllcklkID0gbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKS5pZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEXG4gICAgICAgICAgICB2YXIgbGFuZGxvcmRJZCA9IGRhdGEubGFuZGxvcmRfaWQgfHwgXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHlj6rmnInlvZPlnLDkuLtJROWMuemFjeiHquW3seaXtuaJjeabtOaWsOaJi+eJjFxuICAgICAgICAgICAgaWYgKFN0cmluZyhsYW5kbG9yZElkKSAhPT0gU3RyaW5nKG15UGxheWVySWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g44CQ6YeN6KaB44CR5Y+q5pu05paw5omL54mM5pWw5o2u77yM5LiN6YeN5paw5riy5p+T5pW05Liq5Zy65pmvXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IGRhdGEuY2FyZHMgfHwgW11cbiAgICAgICAgICAgIHRoaXMuYm90dG9tQ2FyZHMgPSBkYXRhLmJvdHRvbV9jYXJkcyB8fCBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDjgJDph43opoHjgJHkvb/nlKjpnZnpu5jmm7TmlrDvvIzkuI3op6blj5Hlj5HniYzliqjnlLtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxhbmRsb3JkSGFuZENhcmRzKHRoaXMuaGFuZENhcmRzKVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs6YeN5paw5Y+R54mM6YCa55+l77yI5omA5pyJ5Lq66YO95LiN5Y+r5Zyw5Li777yJXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblJlc3RhcnRHYW1lKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy8g5YGc5q2i5omA5pyJ5YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIC8vIOmakOiXj+aKouWcsOS4u1VJXG4gICAgICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICAgICAgLy8g6YeN572u54q25oCBXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImlkbGVcIlxuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCIgIC8vIPCflKfjgJDmlrDlop7jgJHph43nva7muLjmiI/pmLbmrrVcbiAgICAgICAgICAgIHRoaXMuY2FyZHNSZWFkeSA9IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IFtdXG4gICAgICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW11cbiAgICAgICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG4gICAgICAgICAgICAvLyDmuIXnkIbmiYDmnInljaHniYzoioLngrlcbiAgICAgICAgICAgIHRoaXMuY2xlYXJBbGxDYXJkcygpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5Ye654mM6Zi25q615byA5aeLXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXlTdGFydChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHorr7nva7muLjmiI/pmLbmrrXkuLrlh7rniYzpmLbmrrVcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwicGxheWluZ1wiXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImlkbGVcIlxuICAgICAgICAgICAgLy8g6ZqQ6JeP5oqi5Zyw5Li7VUnvvIjnoa7kv53kuI3mmL7npLrvvIlcbiAgICAgICAgICAgIHRoaXMuX2hpZGVSb2JVSSgpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5SK44CQ5paw5aKe44CR55uR5ZCs5ri45oiP57uT5p2fXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkdhbWVPdmVyKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkemHjee9rua4uOaIj+mYtuautVxuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCJcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmuLjmiI/nu5PmnZ/ml7bnq4vljbPph43nva7miYDmnInnjqnlrrbnmoTlh4blpIfnirbmgIFcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0QWxsUGxheWVyUmVhZHlTdGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmmL7npLrnu5PnrpflvLnnqpdcbiAgICAgICAgICAgIHRoaXMuX3Nob3dHYW1lUmVzdWx0UG9wdXAoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOa4uOaIj+eKtuaAgeaBouWkjVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25HYW1lU3RhdGVSZXN0b3JlKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlR2FtZVN0YXRlKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5o+Q56S657uT5p6cXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkhpbnRSZXN1bHQoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkhpbnRSZXN1bHQoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIPCflKfjgJDmiZjnrqHjgJHnm5HlkKzmiZjnrqHnirbmgIHlj5jljJZcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uVHJ1c3RlZVN0YXRlTm90aWZ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fb25UcnVzdGVlU3RhdGVOb3RpZnkoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDjgJDnq57mioDlnLrjgJHmtojmga/nm5HlkKxcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKznq57mioDlnLrnirbmgIHmm7TmlrBcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ29tcGV0aXRpb25TdGF0dXMoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkNvbXBldGl0aW9uU3RhdHVzKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOernuaKgOWcuuWAkuiuoeaXtlxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Db21wZXRpdGlvbkNvdW50ZG93bihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX29uQ29tcGV0aXRpb25Db3VudGRvd24oZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5q+U6LWb6YeR5biB5pu05pawXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbk1hdGNoQ29pblVwZGF0ZShmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX29uTWF0Y2hDb2luVXBkYXRlKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOa3mOaxsOmAmuefpVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Db21wZXRpdGlvbkVsaW1pbmF0ZWQoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkNvbXBldGl0aW9uRWxpbWluYXRlZChkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzmmYvnuqfpgJrnn6VcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ29tcGV0aXRpb25BZHZhbmNlKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fb25Db21wZXRpdGlvbkFkdmFuY2UoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5Yag5Yab5by556qXXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNvbXBldGl0aW9uQ2hhbXBpb24oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkNvbXBldGl0aW9uQ2hhbXBpb24oZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeebkeWQrOacgOe7iOamnOWNlea2iOaBr1xuICAgICAgICAvLyDlvZPnq57mioDlnLrmiYDmnInova7mrKHnu5PmnZ/ml7bvvIzmnI3liqHnq6/kvJrlj5HpgIHmraTmtojmga9cbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uVG91cm5hbWVudEZpbmFsUmFuayhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbZ2FtZWluZ1VJXSDmlLbliLDmnIDnu4jmppzljZU6XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAgdGhpcy5fb25Ub3VybmFtZW50RmluYWxSYW5rKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDlhoXpg6jkuovku7bvvJrmmL7npLrlupXniYxcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeatpOS6i+S7tuW3suW6n+W8g++8jOmAu+i+keW3suenu+WIsCBvbkNhbGxMYW5kbG9yZEVuZCDlkowgb25MYW5kbG9yZENhcmRzXG4gICAgICAgIC8vIOS/neeVmeatpOebkeWQrOWZqOS7heeUqOS6juWFvOWuueaXp+eJiOacrO+8jOS4jeWGjeinpuWPkSBwdXNoVGhyZWVDYXJkXG4gICAgICAgIHRoaXMubm9kZS5vbihcInNob3dfYm90dG9tX2NhcmRfZXZlbnRcIiwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CRZGF0YSDlj6/og73mmK8geyBjYXJkczogWy4uLl0gfSDlr7nosaHmiJbmlbDnu4RcbiAgICAgICAgICAgIHZhciBjYXJkcyA9IGRhdGFcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkcyA9IGRhdGEuY2FyZHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5aaC5p6cIGNhcmRzIOS4uuepuu+8jOS4jeWkhOeQhlxuICAgICAgICAgICAgaWYgKCFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5LiN5YaN6LCD55SoIHB1c2hUaHJlZUNhcmTvvIFcbiAgICAgICAgICAgIC8vIOW6leeJjOaYvuekuuW3sueUsSBfc2hvd0JvdHRvbUNhcmRzVG9BbGwg5aSE55CGXG4gICAgICAgICAgICAvLyDlnLDkuLvmiYvniYzmm7TmlrDlt7LnlLEgb25MYW5kbG9yZENhcmRzIOWkhOeQhlxuICAgICAgICAgICAgLy8g5Yig6Zmk5Lul5LiL5Luj56CB77yM6YG/5YWN6YeN5aSN5aSE55CG5ZKM5bu26L+f77yaXG4gICAgICAgICAgICAvLyB0aGlzLnNjaGVkdWxlT25jZSh0aGlzLnB1c2hUaHJlZUNhcmQsIDAuMilcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHms6jlhoznm5HlkKzpgInmi6nniYzmtojmga9cbiAgICAgICAgLy8gY2FyZC5qcyDmmK/lnKggZ2FtZVNjZW5lX25vZGUgKHRoaXMubm9kZS5wYXJlbnQpIOS4iiBlbWl0IOS6i+S7tlxuICAgICAgICAvLyDmiYDku6Xlv4XpobvlnKggdGhpcy5ub2RlLnBhcmVudCDkuIrnm5HlkKzvvIzogIzkuI3mmK8gdGhpcy5ub2RlXG4gICAgICAgIHZhciBnYW1lU2NlbmVfbm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgaWYgKGdhbWVTY2VuZV9ub2RlKSB7XG4gICAgICAgICAgICBnYW1lU2NlbmVfbm9kZS5vbihcImNob29zZV9jYXJkX2V2ZW50XCIsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEucHVzaChldmVudClcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5pu05paw5bey6YCJ54mM5pWw5pi+56S6XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXkoKVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgICAgICBnYW1lU2NlbmVfbm9kZS5vbihcInVuY2hvb3NlX2NhcmRfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmraPnoa7ljLnphY3ljaHniYznmoTllK/kuIDmoIfor4bnrKbvvIhzdWl0ICsgcmFua++8iVxuICAgICAgICAgICAgICAgIC8vIGV2ZW50IOeOsOWcqOaYryB7c3VpdCwgcmFua30g5a+56LGhXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRpZCA9IHRoaXMuY2hvb3NlX2NhcmRfZGF0YVtpXS5jYXJkaWRcbiAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+l5piv5ZCm5Yy56YWN77yI5YW85a655paw5pen5Lik56eN5qC85byP77yJXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXJkaWQgJiYgY2FyZGlkLnN1aXQgIT09IHVuZGVmaW5lZCAmJiBjYXJkaWQucmFuayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmlrDmoLzlvI/vvJpjYXJkaWQg5piv5a+56LGhIHtzdWl0LCByYW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRpZC5zdWl0ID09PSBldmVudC5zdWl0ICYmIGNhcmRpZC5yYW5rID09PSBldmVudC5yYW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhLnNwbGljZShpLCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FyZGlkID09IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDml6fmoLzlvI/lhbzlrrnvvJpjYXJkaWQg5piv5pWw5a2XXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEuc3BsaWNlKGksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmm7TmlrDlt7LpgInniYzmlbDmmL7npLpcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZENvdW50RGlzcGxheSgpXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge30sXG4gICAgXG4gICAgb25EZXN0cm95ICgpIHtcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgXG4gICAgICAgIC8vIOOAkOernuaKgOWcuuOAkea4heeQhuernuaKgOWcuuWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fY29tcGV0aXRpb25Db3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGljaylcbiAgICAgICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGltZXIgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmuIXnkIbmnKzlnLDnq57mioDlnLrlgJLorqHml7ZcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDjgJDnq57mioDlnLrjgJHmuIXnkIbmr5TotZvph5HluIHmmL7npLpcbiAgICAgICAgdGhpcy5faGlkZU1hdGNoQ29pbkRpc3BsYXkoKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDjgJDmoLjlv4PjgJHllK/kuIDmuLLmn5PlhaXlj6NcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDjgJDmoLjlv4PjgJHmuLLmn5PmiYvniYwgLSDllK/kuIDlhaXlj6NcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOacjeWKoeerr+WOn+Wni+aJi+eJjOaVsOaNrlxuICAgICAqL1xuICAgIHJlbmRlckNhcmRzOiBmdW5jdGlvbihjYXJkcykge1xuICAgICAgICBpZiAoIWNhcmRzIHx8IGNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKXjgJDpmLLph43lpI3muLLmn5PjgJHmo4Dmn6XmmK/lkKbkuI7kuIrmrKHnm7jlkIxcbiAgICAgICAgdmFyIGhhc2ggPSBKU09OLnN0cmluZ2lmeShjYXJkcylcbiAgICAgICAgaWYgKHRoaXMuX2xhc3RSZW5kZXJIYXNoID09PSBoYXNoKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IGhhc2hcbiAgICAgICAgXG4gICAgICAgIC8vIOOAkOaguOW/g+OAkeS9v+eUqOaWl+WcsOS4u+inhOWImeaOkuW6j++8muWkp+eOiyA+IOWwj+eOiyA+IDIgPiBBID4gSyA+IFEgPiBKID4gMTAgPiA5ID4gOCA+IDcgPiA2ID4gNSA+IDQgPiAzXG4gICAgICAgIHZhciBzb3J0ZWRDYXJkcyA9IHRoaXMuX3NvcnRDYXJkcyhjYXJkcylcbiAgICAgICAgXG4gICAgICAgIC8vIOOAkOaguOW/g+OAkea4heeQhuaJgOacieaXp+iKgueCue+8iOino+WGs+iDjOmdoueJjOaui+eVme+8iVxuICAgICAgICB0aGlzLmNsZWFyQWxsQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65bqV54mM6IqC54K5XG4gICAgICAgIHRoaXMuX2NyZWF0ZUJvdHRvbUNhcmRzKClcbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+WHuueJjFVJXG4gICAgICAgIGlmICh0aGlzLnBsYXlpbmdVSV9ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlpbmdVSV9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCfjqzjgJDkv67lpI3jgJHkvb/nlKjpgJDlvKDlj5HniYzliqjnlLtcbiAgICAgICAgdGhpcy5fZGVhbENhcmRzV2l0aEFuaW1hdGlvbihzb3J0ZWRDYXJkcylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfjqzjgJDmlrDlop7jgJHpgJDlvKDlj5HniYzliqjnlLtcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBzb3J0ZWRDYXJkcyAtIOW3suaOkuW6j+eahOaJi+eJjOaVsOaNrlxuICAgICAqL1xuICAgIF9kZWFsQ2FyZHNXaXRoQW5pbWF0aW9uOiBmdW5jdGlvbihzb3J0ZWRDYXJkcykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIHZhciBjYXJkSW50ZXJ2YWwgPSBEZWFsQ29uZmlnLmNhcmRJbnRlcnZhbCAvIDEwMDAgIC8vIOi9rOaNouS4uuenklxuICAgICAgICB2YXIgYW5pbUR1cmF0aW9uID0gRGVhbENvbmZpZy5hbmltRHVyYXRpb25cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnoa7kv53miYvniYzlrrnlmajlrZjlnKhcbiAgICAgICAgdmFyIGNhcmRQYXJlbnQgPSB0aGlzLmNhcmRzX25vZGVcbiAgICAgICAgaWYgKCFjYXJkUGFyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+OriBbX2RlYWxDYXJkc1dpdGhBbmltYXRpb25dIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R54mM6LW35aeL5L2N572u77yI5bGP5bmV5Lit5aSu5LiK5pa577yM5qih5ouf5Y+R54mM5aCG77yJXG4gICAgICAgIHZhciBkZWNrUG9zID0gY2MudjIoRGVhbENvbmZpZy5kZWNrUG9zaXRpb24ueCwgRGVhbENvbmZpZy5kZWNrUG9zaXRpb24ueSlcbiAgICAgICAgXG4gICAgICAgIC8vIOmAkOW8oOWPkeeJjFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRlZENhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gc29ydGVkQ2FyZHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRYID0gc2VsZi5fZ2V0Q2FyZFgoaW5kZXgsIHNvcnRlZENhcmRzLmxlbmd0aCwgQ2FyZExheW91dC5jYXJkU3BhY2luZylcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldFBvcyA9IGNjLnYyKHRhcmdldFgsIENhcmRMYXlvdXQuY2FyZFkpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rljaHniYzoioLngrlcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmQgPSBjYy5pbnN0YW50aWF0ZShzZWxmLmNhcmRfcHJlZmFiKVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhcmQpIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zY2FsZSA9IENhcmRMYXlvdXQuY2FyZFNjYWxlXG4gICAgICAgICAgICAgICAgICAgIGNhcmQucGFyZW50ID0gY2FyZFBhcmVudCAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOehruWumueahOaJi+eJjOWuueWZqFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+OrCDku47lj5HniYzloIbkvY3nva7lvIDlp4tcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRQb3NpdGlvbihkZWNrUG9zKVxuICAgICAgICAgICAgICAgICAgICBjYXJkLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgY2FyZC56SW5kZXggPSBpbmRleFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u5Y2h54mM5pi+56S6XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYXJkQ29tcCA9IGNhcmQuZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZENvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRDb21wLnNob3dDYXJkcyhjYXJkRGF0YSwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIPCfjqwg5pKt5pS+5Y+R54mM5Yqo55S7XG4gICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKGNhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG8oYW5pbUR1cmF0aW9uLCB7IHBvc2l0aW9uOiB0YXJnZXRQb3MgfSwgeyBlYXNpbmc6ICdzaW5lT3V0JyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yqo55S75a6M5oiQ5Zue6LCDXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIPCflIog5pKt5pS+5Y+R54mM6Z+z5pWIXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc29wZW5fc291bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXlTb3VuZChcInNvdW5kL2ZhcGFpMVwiKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0sIGluZGV4ICogY2FyZEludGVydmFsKVxuICAgICAgICAgICAgfSkoaSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R54mM5a6M5oiQ5ZCO5Zue6LCDXG4gICAgICAgIHZhciB0b3RhbERlYWxUaW1lID0gc29ydGVkQ2FyZHMubGVuZ3RoICogY2FyZEludGVydmFsICsgYW5pbUR1cmF0aW9uXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fb25EZWFsQ2FyZHNDb21wbGV0ZShzb3J0ZWRDYXJkcylcbiAgICAgICAgfSwgdG90YWxEZWFsVGltZSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfjqzjgJDmlrDlop7jgJHlj5HniYzlrozmiJDlm57osINcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBzb3J0ZWRDYXJkcyAtIOW3suaOkuW6j+eahOaJi+eJjOaVsOaNrlxuICAgICAqL1xuICAgIF9vbkRlYWxDYXJkc0NvbXBsZXRlOiBmdW5jdGlvbihzb3J0ZWRDYXJkcykge1xuICAgICAgICAvLyDmoIforrDlsLHnu6pcbiAgICAgICAgdGhpcy5jYXJkc1JlYWR5ID0gdHJ1ZVxuICAgICAgICB0aGlzLmZhcGFpX2VuZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIC8vIOmAmuefpeWFtuS7lueOqeWutuiKgueCuVxuICAgICAgICBpZiAodGhpcy5ub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwicHVzaGNhcmRfb3RoZXJfZXZlbnRcIilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm6ZyA6KaB5pi+56S65oqi5Zyw5Li75oyJ6ZKuXG4gICAgICAgIHRoaXMuX2NoZWNrQW5kU2hvd1JvYlVJKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOOAkOaguOW/g+OAkeiuoeeul+eJjOWKm+WAvO+8iOaWl+WcsOS4u+inhOWIme+8iVxuICAgICAqIOWkp+eOiz0xNSwg5bCP546LPTE0LCAyPTEzLCBBPTEyLCBLPTExLCBRPTEwLCBKPTksIDEwPTgsIC4uLiwgMz0xXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNhcmQgLSDljaHniYzmlbDmja5cbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSDniYzlipvlgLxcbiAgICAgKi9cbiAgICBnZXRDYXJkVmFsdWU6IGZ1bmN0aW9uKGNhcmQpIHtcbiAgICAgICAgdmFyIHJhbmsgPSBjYXJkLnJhbmtcbiAgICAgICAgXG4gICAgICAgIGlmIChyYW5rID09PSAzKSByZXR1cm4gMSAgIC8vIDNcbiAgICAgICAgaWYgKHJhbmsgPT09IDQpIHJldHVybiAyICAgLy8gNFxuICAgICAgICBpZiAocmFuayA9PT0gNSkgcmV0dXJuIDMgICAvLyA1XG4gICAgICAgIGlmIChyYW5rID09PSA2KSByZXR1cm4gNCAgIC8vIDZcbiAgICAgICAgaWYgKHJhbmsgPT09IDcpIHJldHVybiA1ICAgLy8gN1xuICAgICAgICBpZiAocmFuayA9PT0gOCkgcmV0dXJuIDYgICAvLyA4XG4gICAgICAgIGlmIChyYW5rID09PSA5KSByZXR1cm4gNyAgIC8vIDlcbiAgICAgICAgaWYgKHJhbmsgPT09IDEwKSByZXR1cm4gOCAgLy8gMTBcbiAgICAgICAgaWYgKHJhbmsgPT09IDExKSByZXR1cm4gOSAgLy8gSlxuICAgICAgICBpZiAocmFuayA9PT0gMTIpIHJldHVybiAxMCAvLyBRXG4gICAgICAgIGlmIChyYW5rID09PSAxMykgcmV0dXJuIDExIC8vIEtcbiAgICAgICAgaWYgKHJhbmsgPT09IDE0KSByZXR1cm4gMTIgLy8gQVxuICAgICAgICBpZiAocmFuayA9PT0gMTUpIHJldHVybiAxMyAvLyAyXG4gICAgICAgIGlmIChyYW5rID09PSAxNikgcmV0dXJuIDE0IC8vIOWwj+eOi1xuICAgICAgICBpZiAocmFuayA9PT0gMTcpIHJldHVybiAxNSAvLyDlpKfnjotcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDjgJDmoLjlv4PjgJHkvb/nlKggZ2V0Q2FyZFZhbHVlIOaOkuW6j+aJi+eJjFxuICAgICAqIOaWl+WcsOS4u+agh+WHhuaOkuW6j++8muWkp+eOiyA+IOWwj+eOiyA+IDIgPiBBID4gSyA+IFEgPiBKID4gMTAgPiA5ID4gOCA+IDcgPiA2ID4gNSA+IDQgPiAzXG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDmnI3liqHnq6/ljp/lp4vmiYvniYzmlbDmja5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IOaOkuW6j+WQjueahOaJi+eJjOaVsOaNrlxuICAgICAqL1xuICAgIF9zb3J0Q2FyZHM6IGZ1bmN0aW9uKGNhcmRzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAvLyDlpI3liLbmlbDnu4TvvIzpgb/lhY3kv67mlLnljp/mlbDmja5cbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gY2FyZHMuc2xpY2UoKVxuICAgICAgICBcbiAgICAgICAgLy8g5L2/55SoIGdldENhcmRWYWx1ZSDku47lpKfliLDlsI/mjpLluo9cbiAgICAgICAgc29ydGVkQ2FyZHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVBID0gc2VsZi5nZXRDYXJkVmFsdWUoYSlcbiAgICAgICAgICAgIHZhciB2YWx1ZUIgPSBzZWxmLmdldENhcmRWYWx1ZShiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlhYjmjIkgdmFsdWUg5LuO5aSn5Yiw5bCP5o6S5bqPXG4gICAgICAgICAgICBpZiAodmFsdWVBICE9PSB2YWx1ZUIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVCIC0gdmFsdWVBXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSDnm7jlkIzml7bvvIzmjInoirHoibLmjpLluo/vvIjpu5HmoYMgPiDnuqLlv4MgPiDmooXoirEgPiDmlrnlnZfvvIlcbiAgICAgICAgICAgIHJldHVybiBhLnN1aXQgLSBiLnN1aXRcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzb3J0ZWRDYXJkc1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog44CQ5qC45b+D44CR5riF55CG5omA5pyJ5pen6IqC54K577yI6Kej5Yaz6IOM6Z2i54mM5q6L55WZ77yJXG4gICAgICog8J+UpeOAkOS/ruWkjeOAkeWQjOaXtua4heeQhiBjYXJkc19ub2RlIOWSjCBub2RlLnBhcmVudO+8jOehruS/neaXoOaui+eVmVxuICAgICAqL1xuICAgIGNsZWFyQWxsQ2FyZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q5riF55CG5omL54mM5a655Zmo5Lit55qE6IqC54K577yM5LiN6YGN5Y6Gbm9kZS5wYXJlbnRcbiAgICAgICAgaWYgKHRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlLnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW2NsZWFyQWxsQ2FyZHNdIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4heepuumAieS4reeahOeJjOaVsOaNrlxuICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEgPSBbXVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog6K6h566X54mM55qEWOWdkOagh1xuICAgICAqL1xuICAgIF9nZXRDYXJkWDogZnVuY3Rpb24oaW5kZXgsIGNvdW50LCBzcGFjaW5nKSB7XG4gICAgICAgIHZhciB0b3RhbFdpZHRoID0gKGNvdW50IC0gMSkgKiBzcGFjaW5nXG4gICAgICAgIHZhciBzdGFydFggPSAtdG90YWxXaWR0aCAvIDJcbiAgICAgICAgcmV0dXJuIHN0YXJ0WCArIGluZGV4ICogc3BhY2luZ1xuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlupXniYznm7jlhbNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDliJvlu7rlupXniYzmmL7npLrvvIjniYzog4zvvIlcbiAgICAgKi9cbiAgICBfY3JlYXRlQm90dG9tQ2FyZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIbml6flupXniYxcbiAgICAgICAgaWYgKHRoaXMuYm90dG9tX2NhcmQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ib3R0b21fY2FyZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbV9jYXJkW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tX2NhcmRbaV0uZGVzdHJveSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLmJvdHRvbV9jYXJkX3Bvc19ub2RlIHx8ICF0aGlzLmNhcmRfcHJlZmFiKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBib3R0b21ZID0gdGhpcy5ib3R0b21fY2FyZF9wb3Nfbm9kZS55XG4gICAgICAgIHZhciBib3R0b21TdGFydFggPSB0aGlzLmJvdHRvbV9jYXJkX3Bvc19ub2RlLnggLSBDYXJkTGF5b3V0LmJvdHRvbUNhcmRTcGFjaW5nXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRpX2NhcmQgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmNhcmRfcHJlZmFiKVxuICAgICAgICAgICAgaWYgKCFkaV9jYXJkKSBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkaV9jYXJkLnNjYWxlID0gQ2FyZExheW91dC5ib3R0b21DYXJkU2NhbGVcbiAgICAgICAgICAgIGRpX2NhcmQuc2V0UG9zaXRpb24oYm90dG9tU3RhcnRYICsgQ2FyZExheW91dC5ib3R0b21DYXJkU3BhY2luZyAqIGksIGJvdHRvbVkpXG4gICAgICAgICAgICBkaV9jYXJkLnBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGRpX2NhcmQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgdGhpcy5ib3R0b21fY2FyZC5wdXNoKGRpX2NhcmQpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Y+r5Zyw5Li7L+aKouWcsOS4u+ebuOWFs1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2NoZWNrQW5kU2hvd1JvYlVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeWmguaenOWcqOWHuueJjOmYtuaute+8jOS4jeaYvuekuuaKouWcsOS4u+aMiemSrlxuICAgICAgICB2YXIgUm9vbVN0YXRlID0gd2luZG93LlJvb21TdGF0ZSB8fCB7fVxuICAgICAgICBpZiAodGhpcy5fYmlkZGluZ1BoYXNlID09PSBcImlkbGVcIiAmJiB0aGlzLl9nYW1lUGhhc2UgPT09IFwicGxheWluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgaWYgKHRoaXMucm9iX3BsYXllcl9hY2NvdW50aWQgPT0gbXlQbGF5ZXJJZCAmJiB0aGlzLmNhcmRzUmVhZHkgJiYgdGhpcy5yb2JVSSAmJiAhdGhpcy5yb2JVSS5hY3RpdmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9iaWRkaW5nUGhhc2UgPT09IFwiYmlkZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0JpZFVJKFwi5Y+r5Zyw5Li7XCIsIFwi5LiN5Y+rXCIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dCaWRVSShcIuaKouWcsOS4u1wiLCBcIuS4jeaKolwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9wcm9jZXNzQ2FsbExhbmRsb3JkVHVybjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIHBsYXllcklkID0gZGF0YS5wbGF5ZXJfaWRcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBkYXRhLnRpbWVvdXQgfHwgMTVcbiAgICAgICAgdmFyIHJvdW5kID0gZGF0YS5yb3VuZCB8fCAxXG4gICAgICAgIHZhciBleHBpcmVzQXQgPSBkYXRhLmV4cGlyZXNfYXQgfHwgMCAgLy8g8J+Up+OAkOaWsOWinuOAkeacjeWKoeerr+i/h+acn+aXtumXtOaIs++8iOavq+enku+8iVxuXG4gICAgICAgIC8vIPCflJLjgJDph43opoHjgJHlhYjlgZzmraLkuYvliY3nmoTlgJLorqHml7bvvIjmnI3liqHlmajova7ovazkuobvvIlcbiAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG5cbiAgICAgICAgdGhpcy5yb2JfcGxheWVyX2FjY291bnRpZCA9IHBsYXllcklkXG4gICAgICAgIHRoaXMuX2JpZFRpbWVvdXQgPSB0aW1lb3V0XG4gICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IHJvdW5kID09PSAxID8gXCJiaWRkaW5nXCIgOiBcInJvYmJpbmdcIlxuICAgICAgICB0aGlzLl9iaWRFeHBpcmVzQXQgPSBleHBpcmVzQXQgIC8vIPCflKfjgJDmlrDlop7jgJHkv53lrZjov4fmnJ/ml7bpl7RcblxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuXG4gICAgICAgIGlmIChTdHJpbmcocGxheWVySWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZCkgJiYgdGhpcy5jYXJkc1JlYWR5KSB7XG4gICAgICAgICAgICBpZiAocm91bmQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93QmlkVUkoXCLlj6vlnLDkuLtcIiwgXCLkuI3lj6tcIilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0JpZFVJKFwi5oqi5Zyw5Li7XCIsIFwi5LiN5oqiXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwiY2FsbF9sYW5kbG9yZF90dXJuX2V2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyX2lkOiBwbGF5ZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgcm91bmQ6IHJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiBleHBpcmVzQXRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9zaG93QmlkVUk6IGZ1bmN0aW9uKGNvbmZpcm1UZXh0LCBjYW5jZWxUZXh0KSB7XG4gICAgICAgIGlmICghdGhpcy5yb2JVSSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgY29uZmlybUJ0biA9IHRoaXMucm9iVUkuZ2V0Q2hpbGRCeU5hbWUoXCJidG5fcWlhbmR6XCIpXG4gICAgICAgIHZhciBjYW5jZWxCdG4gPSB0aGlzLnJvYlVJLmdldENoaWxkQnlOYW1lKFwiYnRuX2J1cWlhbmR6XCIpXG4gICAgICAgIFxuICAgICAgICBpZiAoY29uZmlybUJ0bikge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gY29uZmlybUJ0bi5nZXRDaGlsZEJ5TmFtZShcIkxhYmVsXCIpXG4gICAgICAgICAgICBpZiAobGFiZWwgJiYgbGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSkge1xuICAgICAgICAgICAgICAgIGxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gY29uZmlybVRleHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gY2FuY2VsQnRuLmdldENoaWxkQnlOYW1lKFwiTGFiZWxcIilcbiAgICAgICAgICAgIGlmIChsYWJlbCAmJiBsYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBjYW5jZWxUZXh0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMucm9iVUkuYWN0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLl9zdGFydEJpZENvdW50ZG93bigpXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvKDpgJLljIXlkKsgdGltZW91dCDnmoTlr7nosaFcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuZW1pdChcImNhbnJvYl9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyX2lkOiB0aGlzLnJvYl9wbGF5ZXJfYWNjb3VudGlkLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMuX2JpZFRpbWVvdXQgfHwgMTVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF9oaWRlUm9iVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5yb2JVSSkge1xuICAgICAgICAgICAgdGhpcy5yb2JVSS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+VkOOAkOWAkuiuoeaXtuezu+e7n+OAkeagh+WHhuaWl+WcsOS4u+WAkuiuoeaXtu+8iOW4puWIhuauteWCrOS/g+aViOaenO+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOe7n+S4gOWFpeWPo+OAkeW8gOWni+aKouWcsOS4u+WAkuiuoeaXtlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHmoLnmja7mnI3liqHnq6/ov4fmnJ/ml7bpl7TorqHnrpfliankvZnml7bpl7TvvIznoa7kv53kuI7mnI3liqHnq6/lkIzmraVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSDlgJLorqHml7bnp5LmlbDvvIjlpIfnlKjvvIzlpoLmnpwgZXhwaXJlc19hdCDml6DmlYjliJnkvb/nlKjvvIlcbiAgICAgKi9cbiAgICBfc3RhcnRCaWRDb3VudGRvd246IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAvLyDwn5SS44CQ6Ziy5oqk44CR5YWI5YGc5q2i5LmL5YmN55qE5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gZHVyYXRpb24gfHwgdGhpcy5fYmlkVGltZW91dCB8fCAxNVxuICAgICAgICB2YXIgZXhwaXJlc0F0ID0gdGhpcy5fYmlkRXhwaXJlc0F0IHx8IDBcblxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5qC55o2u5pyN5Yqh56uv6L+H5pyf5pe26Ze06K6h566X5Ymp5L2Z5pe26Ze0XG4gICAgICAgIHZhciB0aW1lTGVmdCA9IHRpbWVvdXRcbiAgICAgICAgaWYgKGV4cGlyZXNBdCA+IDApIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgICAgICB0aW1lTGVmdCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoKGV4cGlyZXNBdCAtIG5vdykgLyAxMDAwKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JpZFRpbWVMZWZ0ID0gdGltZUxlZnRcbiAgICAgICAgdGhpcy5faXNCaWRDb3VudGRvd25UaWNraW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSBmYWxzZVxuXG4gICAgICAgIC8vIPCflZAg5Yid5aeL5YyWVUnmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlQmlkQ291bnRkb3duVUkoKVxuXG4gICAgICAgIC8vIPCflZAg5L2/55SoIGNjLk5vZGUg55qEIHNjaGVkdWxlIOWunueOsOavj+enkiB0aWNrXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fYmlkQ291bnRkb3duVGljaywgMSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOaguOW/g1RpY2vjgJHmiqLlnLDkuLvlgJLorqHml7bmr4/np5LmiafooYxcbiAgICAgKi9cbiAgICBfYmlkQ291bnRkb3duVGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNCaWRDb3VudGRvd25UaWNraW5nKSByZXR1cm5cblxuICAgICAgICB0aGlzLl9iaWRUaW1lTGVmdC0tXG5cbiAgICAgICAgLy8g8J+VkCDmm7TmlrBVSeaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVCaWRDb3VudGRvd25VSSgpXG5cbiAgICAgICAgLy8g4pqg77iPIDXnp5LvvJrov5vlhaXorablkYrnirbmgIFcbiAgICAgICAgaWYgKHRoaXMuX2JpZFRpbWVMZWZ0ID09PSA1KSB7XG4gICAgICAgICAgICB0aGlzLl9lbnRlckJpZFdhcm5pbmdTdGF0ZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5SKIDPnp5LvvJrlvIDlp4vmu7TnrZTpn7PvvIjmr4/np5LkuIDmrKHvvIlcbiAgICAgICAgaWYgKHRoaXMuX2JpZFRpbWVMZWZ0IDw9IDMgJiYgdGhpcy5fYmlkVGltZUxlZnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9wbGF5VGlja1NvdW5kKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOKPsCAw56eS77ya6Ieq5Yqo5aSE55CGXG4gICAgICAgIGlmICh0aGlzLl9iaWRUaW1lTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vbkJpZENvdW50ZG93bkVuZCgpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkFVJ5pu05paw44CR5pu05paw5oqi5Zyw5Li75YCS6K6h5pe25pi+56S6XG4gICAgICovXG4gICAgX3VwZGF0ZUJpZENvdW50ZG93blVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX2JpZFRpbWVMZWZ0XG4gICAgICAgIHZhciB1cGRhdGVkID0gZmFsc2VcblxuICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHByb3BlcnRpZXMg57uR5a6a55qEIExhYmVsXG4gICAgICAgIGlmICh0aGlzLmJpZENvdW50ZG93bkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLmJpZENvdW50ZG93bkxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8muWwneivleS7jiByb2JVSSDkuK3mn6Xmib7lgJLorqHml7YgTGFiZWxcbiAgICAgICAgaWYgKHRoaXMucm9iVUkpIHtcbiAgICAgICAgICAgIHZhciBjbG9ja05vZGUgPSB0aGlzLnJvYlVJLmdldENoaWxkQnlOYW1lKFwiY2xvY2tcIilcbiAgICAgICAgICAgIGlmIChjbG9ja05vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2pdXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSAzMlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDQwXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5zZXRDb250ZW50U2l6ZSg1MCwgNTApXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LiN6YCa6L+HY29sb3Lorr7nva5hbHBoYVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnpJbmRleCA9IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrnlvI8z77ya6YCa55+lIHBsYXllcl9ub2RlIOabtOaWsOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuZW1pdChcInVwZGF0ZV9jb3VudGRvd25fZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlkXCIsXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pqg77iP44CQ6K2m5ZGK54q25oCB44CRNeenkuaXtui/m+WFpeitpuWRiueKtuaAgVxuICAgICAqL1xuICAgIF9lbnRlckJpZFdhcm5pbmdTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0JpZFdhcm5pbmcpIHJldHVyblxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSB0cnVlXG5cbiAgICAgICAgLy8g6I635Y+W5YCS6K6h5pe2IExhYmVsIOiKgueCuVxuICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5fZ2V0QmlkQ291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKCFsYWJlbE5vZGUpIHJldHVyblxuXG4gICAgICAgIC8vIOWPmOe6olxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5Db2xvci5SRURcblxuICAgICAgICAvLyDwn5SlIOWRvOWQuOe8qeaUvuWKqOeUu1xuICAgICAgICBsYWJlbE5vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICBjYy50d2VlbihsYWJlbE5vZGUpXG4gICAgICAgICAgICAucmVwZWF0Rm9yZXZlcihcbiAgICAgICAgICAgICAgICBjYy50d2VlbigpXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IHNjYWxlOiAxLjAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zdGFydCgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflZDjgJDojrflj5boioLngrnjgJHojrflj5bmiqLlnLDkuLvlgJLorqHml7ZMYWJlbOiKgueCuVxuICAgICAqIPCflKfjgJDkv67lpI3jgJHmn6Xmib4gY2xvY2sg5a2Q6IqC54K55Lit55qEIExhYmVsXG4gICAgICovXG4gICAgX2dldEJpZENvdW50ZG93bkxhYmVsTm9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJpZENvdW50ZG93bkxhYmVsICYmIHRoaXMuYmlkQ291bnRkb3duTGFiZWwubm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmlkQ291bnRkb3duTGFiZWwubm9kZVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJvYlVJKSB7XG4gICAgICAgICAgICAvLyDmo4Dmn6UgY2xvY2sg6IqC54K55LiL55qEIExhYmVsXG4gICAgICAgICAgICB2YXIgY2xvY2tOb2RlID0gdGhpcy5yb2JVSS5nZXRDaGlsZEJ5TmFtZShcImNsb2NrXCIpXG4gICAgICAgICAgICBpZiAoY2xvY2tOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gY2xvY2tOb2RlLmNoaWxkcmVuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBjaGlsZHJlbltpXS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuW2ldXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlhbbku5blj6/og73nmoTlkI3np7BcbiAgICAgICAgICAgIHZhciBsYWJlbE5hbWVzID0gW1wiY2xvY2tfIExhYmVsXCIsIFwiY2xvY2tfTGFiZWxcIiwgXCJ0aW1lX2xhYmVsXCIsIFwiY291bnRkb3duXCJdXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxhYmVsTmFtZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5yb2JVSS5nZXRDaGlsZEJ5TmFtZShsYWJlbE5hbWVzW2pdKVxuICAgICAgICAgICAgICAgIGlmIChsYWJlbE5vZGUgJiYgbGFiZWxOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsTm9kZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDij7DjgJDlsZXnpLrnu5PmnZ/jgJHmnKzlnLDlgJLorqHml7bmmL7npLrnu5PmnZ9cbiAgICAgKiDimqDvuI/jgJDph43opoHjgJHlj6rlgZpVSeWkhOeQhu+8jOS4jeWPkemAgeivt+axgu+8gVxuICAgICAqIOacjeWKoeWZqOS8muWcqOi2heaXtuWQjuiHquWKqOWkhOeQhu+8jOW5tuWPkemAgeS4i+S4gOS4qui9ruasoea2iOaBr1xuICAgICAqL1xuICAgIF9vbkJpZENvdW50ZG93bkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWBnOatoiB0aWNrXG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9iaWRDb3VudGRvd25UaWNrKVxuXG4gICAgICAgIC8vIOWBnOatouWKqOeUu+W5tuaBouWkjeeKtuaAgVxuICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5fZ2V0QmlkQ291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICAvLyDimqDvuI/jgJDph43opoHjgJHkuI3lj5HpgIHku7vkvZXor7fmsYLvvIFcbiAgICAgICAgLy8g5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CGXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflJLjgJDlgZzmraLjgJHlgZzmraLmiqLlnLDkuLvlgJLorqHml7ZcbiAgICAgKi9cbiAgICBfc3RvcEJpZENvdW50ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9iaWRDb3VudGRvd25UaWNrKVxuXG4gICAgICAgIC8vIOaBouWkjSBMYWJlbCDnirbmgIFcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IHRoaXMuX2dldEJpZENvdW50ZG93bkxhYmVsTm9kZSgpXG4gICAgICAgIGlmIChsYWJlbE5vZGUpIHtcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgICAgICBsYWJlbE5vZGUuc2NhbGUgPSAxXG4gICAgICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5Db2xvci5XSElURVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faXNCaWRXYXJuaW5nID0gZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+VkOOAkOWHuueJjOWAkuiuoeaXtuOAkeagh+WHhuaWl+WcsOS4u+WAkuiuoeaXtu+8iOW4puWIhuauteWCrOS/g+aViOaenO+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOe7n+S4gOWFpeWPo+OAkeW8gOWni+WHuueJjOWAkuiuoeaXtlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiAtIOWAkuiuoeaXtuenkuaVsO+8jOm7mOiupDE156eSXG4gICAgICovXG4gICAgX3N0YXJ0UGxheUNvdW50ZG93bjogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIC8vIPCflJLjgJDpmLLmiqTjgJHlhYjlgZzmraLkuYvliY3nmoTlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gZHVyYXRpb24gfHwgdGhpcy5fcGxheVRpbWVvdXQgfHwgMTVcbiAgICAgICAgdGhpcy5fcGxheVRpbWVMZWZ0ID0gdGltZW91dFxuICAgICAgICB0aGlzLl9pc1BsYXlDb3VudGRvd25UaWNraW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcblxuICAgICAgICAvLyDwn5WQIOWIneWni+WMllVJ5pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBsYXlDb3VudGRvd25VSSgpXG5cbiAgICAgICAgLy8g8J+VkCDkvb/nlKggY2MuTm9kZSDnmoQgc2NoZWR1bGUg5a6e546w5q+P56eSIHRpY2tcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLl9wbGF5Q291bnRkb3duVGljaywgMSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOaguOW/g1RpY2vjgJHlh7rniYzlgJLorqHml7bmr4/np5LmiafooYxcbiAgICAgKi9cbiAgICBfcGxheUNvdW50ZG93blRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcpIHJldHVyblxuXG4gICAgICAgIHRoaXMuX3BsYXlUaW1lTGVmdC0tXG5cbiAgICAgICAgLy8g8J+VkCDmm7TmlrBVSeaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVQbGF5Q291bnRkb3duVUkoKVxuXG4gICAgICAgIC8vIOKaoO+4jyA156eS77ya6L+b5YWl6K2m5ZGK54q25oCBXG4gICAgICAgIGlmICh0aGlzLl9wbGF5VGltZUxlZnQgPT09IDUpIHtcbiAgICAgICAgICAgIHRoaXMuX2VudGVyUGxheVdhcm5pbmdTdGF0ZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5SKIDPnp5LvvJrlvIDlp4vmu7TnrZTpn7PvvIjmr4/np5LkuIDmrKHvvIlcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlUaW1lTGVmdCA8PSAzICYmIHRoaXMuX3BsYXlUaW1lTGVmdCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3BsYXlUaWNrU291bmQoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g4o+wIDDnp5LvvJroh6rliqjlpITnkIZcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlUaW1lTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXlDb3VudGRvd25FbmQoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflZDjgJBVSeabtOaWsOOAkeabtOaWsOWHuueJjOWAkuiuoeaXtuaYvuekulxuICAgICAqIPCflKfjgJDkv67lpI3jgJHlj6rmm7TmlrDpl7npkp/ph4zpnaLnmoTlgJLorqHml7bvvIzkuI3lnKjlhbbku5bkvY3nva7mmL7npLpcbiAgICAgKi9cbiAgICBfdXBkYXRlUGxheUNvdW50ZG93blVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX3BsYXlUaW1lTGVmdFxuXG4gICAgICAgIC8vIOaWueW8jzHvvJrkvb/nlKggcHJvcGVydGllcyDnu5HlrprnmoQgTGFiZWzvvIjlpoLmnpzmnInvvIlcbiAgICAgICAgaWYgKHRoaXMucGxheUNvdW50ZG93bkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlDb3VudGRvd25MYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8mumAmuefpSBwbGF5ZXJfbm9kZSDmm7TmlrDlgJLorqHml7ZcbiAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oXCJ1cGRhdGVfY291bnRkb3duX2V2ZW50XCIsIHRydWUpXG4gICAgICAgICAgICBldmVudC5zZXRVc2VyRGF0YSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJwbGF5XCIsXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrnlvI8z77ya55u05o6l5pu05pawIHBsYXlpbmdVSV9ub2RlIOS4reeahOmXuemSnyBMYWJlbFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR6Ze56ZKf6IqC54K56Lev5b6E77yacGxheWluZ1VJX25vZGUgLT4gY2xvY2sgLT4gcGxheWluZ19jbG9jbF9sYWJlbFxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdmFyIGNsb2NrTm9kZSA9IHRoaXMucGxheWluZ1VJX25vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJjbG9ja1wiKVxuICAgICAgICAgICAgaWYgKGNsb2NrTm9kZSkge1xuICAgICAgICAgICAgICAgIC8vIOehruS/nSBjbG9jayDoioLngrnlj6/op4FcbiAgICAgICAgICAgICAgICBjbG9ja05vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGNsb2NrTm9kZS5vcGFjaXR5ID0gMjU1XG5cbiAgICAgICAgICAgICAgICAvLyDmn6Xmib4gcGxheWluZ19jbG9jbF9sYWJlbO+8iOazqOaEj+aLvOWGme+8iVxuICAgICAgICAgICAgICAgIHZhciBjbG9ja0xhYmVsID0gY2xvY2tOb2RlLmdldENoaWxkQnlOYW1lKFwicGxheWluZ19jbG9jbF9sYWJlbFwiKVxuICAgICAgICAgICAgICAgIGlmIChjbG9ja0xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNsb2NrTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0xhYmVsLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrTGFiZWwub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5aSH6YCJ77ya5p+l5om+5Lu75L2VIExhYmVsIOWtkOiKgueCuVxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLm9wYWNpdHkgPSAyNTVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw6Ze56ZKf6YeM6Z2i55qE5YCS6K6h5pe25pi+56S6XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlbWFpbmluZyAtIOWJqeS9meenkuaVsFxuICAgICAqL1xuICAgIF91cGRhdGVDbG9ja1RpbWVMYWJlbDogZnVuY3Rpb24ocmVtYWluaW5nKSB7XG4gICAgICAgIC8vIOafpeaJviBnYW1lU2NlbmUg6IqC54K5XG4gICAgICAgIHZhciBnYW1lU2NlbmVOb2RlID0gdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWdhbWVTY2VuZU5vZGUpIHJldHVyblxuXG4gICAgICAgIC8vIOmBjeWOhuaJgOacieWtkOiKgueCue+8jOaJvuWIsCBwbGF5ZXJfbm9kZe+8iOW9k+WJjeeOqeWutu+8iVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZVNjcmlwdCA9IGNoaWxkLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICBpZiAocGxheWVyTm9kZVNjcmlwdCAmJiBwbGF5ZXJOb2RlU2NyaXB0LnNlYXRfaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHRpbWVfbGFiZWwg5bGe5oCnXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllck5vZGVTY3JpcHQudGltZV9sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJOb2RlU2NyaXB0LnRpbWVfbGFiZWwuc3RyaW5nID0gU3RyaW5nKHJlbWFpbmluZylcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDmlrnlvI8y77ya5p+l5om+IGNsb2NraW1hZ2Ug6IqC54K55Lit55qEIExhYmVs77yI5LiO5oqi5Zyw5Li75YCS6K6h5pe257G75Ly877yJXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllck5vZGVTY3JpcHQuY2xvY2tpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvY2tOb2RlID0gcGxheWVyTm9kZVNjcmlwdC5jbG9ja2ltYWdlXG4gICAgICAgICAgICAgICAgICAgIC8vIOehruS/nSBjbG9ja2ltYWdlIOWPr+ingVxuICAgICAgICAgICAgICAgICAgICBjbG9ja05vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBjbG9ja05vZGUub3BhY2l0eSA9IDI1NVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIOafpeaJviBjbG9ja2ltYWdlIOS4reeahCBMYWJlbFxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvY2tDaGlsZHJlbiA9IGNsb2NrTm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNsb2NrQ2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbG9ja0NoaWxkID0gY2xvY2tDaGlsZHJlbltqXVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gY2xvY2tDaGlsZC5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruWQiOmAgueahOWtl+S9k+Wkp+Wwj1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLmZvbnRTaXplID0gMzJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0NoaWxkLnNldENvbnRlbnRTaXplKDUwLCA1MClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LiN6YCa6L+HY29sb3Lorr7nva5hbHBoYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0NoaWxkLnpJbmRleCA9IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpwgY2xvY2tpbWFnZSDmsqHmnIkgTGFiZWwg5a2Q6IqC54K577yM5qOA5p+l5piv5ZCm55u05o6l5pivIExhYmVsXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3RMYWJlbCA9IGNsb2NrTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0TGFiZWwuc3RyaW5nID0gU3RyaW5nKHJlbWFpbmluZylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKaoO+4j+OAkOitpuWRiueKtuaAgeOAkTXnp5Lml7bov5vlhaXorablkYrnirbmgIFcbiAgICAgKi9cbiAgICBfZW50ZXJQbGF5V2FybmluZ1N0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUGxheVdhcm5pbmcpIHJldHVyblxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gdHJ1ZVxuXG4gICAgICAgIC8vIOiOt+WPluWAkuiuoeaXtiBMYWJlbCDoioLngrlcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IHRoaXMuX2dldFBsYXlDb3VudGRvd25MYWJlbE5vZGUoKVxuICAgICAgICBpZiAoIWxhYmVsTm9kZSkgcmV0dXJuXG5cbiAgICAgICAgLy8g5Y+Y57qiXG4gICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRFxuXG4gICAgICAgIC8vIPCflKUg5ZG85ZC457yp5pS+5Yqo55S7XG4gICAgICAgIGxhYmVsTm9kZS5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgIGNjLnR3ZWVuKGxhYmVsTm9kZSlcbiAgICAgICAgICAgIC5yZXBlYXRGb3JldmVyKFxuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgLnRvKDAuMywgeyBzY2FsZTogMS4yIH0pXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEuMCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOiOt+WPluiKgueCueOAkeiOt+WPluWHuueJjOWAkuiuoeaXtkxhYmVs6IqC54K5XG4gICAgICovXG4gICAgX2dldFBsYXlDb3VudGRvd25MYWJlbE5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHByb3BlcnRpZXMg57uR5a6a55qEIExhYmVsXG4gICAgICAgIGlmICh0aGlzLnBsYXlDb3VudGRvd25MYWJlbCAmJiB0aGlzLnBsYXlDb3VudGRvd25MYWJlbC5ub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wbGF5Q291bnRkb3duTGFiZWwubm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8muS7jiBwbGF5aW5nVUlfbm9kZSDnmoTpl7npkp/kuK3ojrflj5YgTGFiZWxcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkemXuemSn+iKgueCuei3r+W+hO+8mnBsYXlpbmdVSV9ub2RlIC0+IGNsb2NrIC0+IHBsYXlpbmdfY2xvY2xfbGFiZWxcbiAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgIHZhciBjbG9ja05vZGUgPSB0aGlzLnBsYXlpbmdVSV9ub2RlLmdldENoaWxkQnlOYW1lKFwiY2xvY2tcIilcbiAgICAgICAgICAgIGlmIChjbG9ja05vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyDmn6Xmib4gcGxheWluZ19jbG9jbF9sYWJlbO+8iOazqOaEj+aLvOWGme+8iVxuICAgICAgICAgICAgICAgIHZhciBjbG9ja0xhYmVsID0gY2xvY2tOb2RlLmdldENoaWxkQnlOYW1lKFwicGxheWluZ19jbG9jbF9sYWJlbFwiKVxuICAgICAgICAgICAgICAgIGlmIChjbG9ja0xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9ja0xhYmVsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWkh+mAie+8muafpeaJvuS7u+S9lSBMYWJlbCDlrZDoioLngrlcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkcmVuW2ldLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKPsOOAkOWxleekuue7k+adn+OAkeacrOWcsOWHuueJjOWAkuiuoeaXtuaYvuekuue7k+adn1xuICAgICAqIOKaoO+4j+OAkOmHjeimgeOAkeWPquWBmlVJ5aSE55CG77yM5LiN5Y+R6YCB6K+35rGC77yBXG4gICAgICog5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CG77yI6Ieq5Yqo5LiN5Ye677yJ77yM5bm25Y+R6YCB5LiL5LiA5Liq6L2u5qyh5raI5oGvXG4gICAgICovXG4gICAgX29uUGxheUNvdW50ZG93bkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWBnOatoiB0aWNrXG4gICAgICAgIHRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLnVuc2NoZWR1bGUodGhpcy5fcGxheUNvdW50ZG93blRpY2spXG5cbiAgICAgICAgLy8g5YGc5q2i5Yqo55S75bm25oGi5aSN54q25oCBXG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSB0aGlzLl9nZXRQbGF5Q291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICAvLyDimqDvuI/jgJDph43opoHjgJHkuI3lj5HpgIHku7vkvZXor7fmsYLvvIFcbiAgICAgICAgLy8g5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CG77yaXG4gICAgICAgIC8vIDEuIOiHquWKqOS4jeWHulxuICAgICAgICAvLyAyLiDlj5HpgIEgY2FuX2NodV9jYXJkX25vdGlmeSDmiJYgZ2FtZV9vdmVyXG4gICAgICAgIC8vIOWuouaIt+err+WPqumcgOimgeWTjeW6lOacjeWKoeWZqOa2iOaBr1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SS44CQ5YGc5q2i44CR5YGc5q2i5Ye654mM5YCS6K6h5pe2XG4gICAgICovXG4gICAgX3N0b3BQbGF5Q291bnRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNQbGF5Q291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9wbGF5Q291bnRkb3duVGljaylcblxuICAgICAgICAvLyDmgaLlpI0gTGFiZWwg54q25oCBXG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSB0aGlzLl9nZXRQbGF5Q291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+UiuOAkOmfs+aViOOAkea7tOetlOmfs+aViO+8iDPnp5Llgqzkv4PvvIlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5ru0562U6Z+z5pWI77yI55So5LqO5oqi5Zyw5Li75YCS6K6h5pe277yJXG4gICAgICovXG4gICAgX3BsYXlUaWNrU291bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgLy8g5LyY5YWI5L2/55So57uR5a6a55qE6Z+z5pWIXG4gICAgICAgIGlmICh0aGlzLnRpY2tBdWRpbykge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnRpY2tBdWRpbywgZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFnOW6le+8muS9v+eUqOWPkeeJjOmfs+aViO+8iOWPr+abv+aNouS4uuS4k+eUqOa7tOetlOmfs+aViO+8iVxuICAgICAgICBwbGF5U291bmQoXCJzb3VuZC9mYXBhaTFcIilcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmkq3mlL7mu7TnrZTpn7PmlYjvvIjnlKjkuo7lh7rniYzlgJLorqHml7bvvIlcbiAgICAgKi9cbiAgICBfcGxheVBsYXlUaWNrU291bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgLy8g5LyY5YWI5L2/55So57uR5a6a55qE6Z+z5pWIXG4gICAgICAgIGlmICh0aGlzLnRpY2tBdWRpbykge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnRpY2tBdWRpbywgZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFnOW6le+8muS9v+eUqOWPkeeJjOmfs+aViFxuICAgICAgICBwbGF5U291bmQoXCJzb3VuZC9mYXBhaTFcIilcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+UiiDmiqLlnLDkuLvor63pn7Pns7vnu5/vvIjmnI3liqHnq6/pqbHliqjvvIlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5oqi5Zyw5Li76K+t6Z+zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmnI3liqHnq6/lub/mkq3nmoTmlbDmja5cbiAgICAgKiAgIC0gYWN0aW9uOiBcImNhbGxcIiA9IOaKoiwgXCJwYXNzXCIgPSDkuI3miqJcbiAgICAgKiAgIC0gZ2VuZGVyOiBcIm1hbGVcIiAvIFwiZmVtYWxlXCJcbiAgICAgKiAgIC0gb3JkZXI6IOW9k+WJjei9ruasoeWGheeahOaTjeS9nOmhuuW6j++8iDEtM++8iVxuICAgICAqICAgLSByb3VuZDog5b2T5YmN6L2u5qyh77yIMeaIljLvvIlcbiAgICAgKi9cbiAgICBfcGxheVJvYlNvdW5kOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghaXNvcGVuX3NvdW5kKSByZXR1cm5cblxuICAgICAgICB2YXIgYWN0aW9uID0gZGF0YS5hY3Rpb25cbiAgICAgICAgdmFyIGdlbmRlciA9IGRhdGEuZ2VuZGVyIHx8IFwibWFsZVwiXG4gICAgICAgIHZhciBvcmRlciA9IGRhdGEub3JkZXIgfHwgMVxuICAgICAgICB2YXIgcm91bmQgPSBkYXRhLnJvdW5kIHx8IDFcbiAgICAgICAgdmFyIHBsYXllcklEID0gZGF0YS5wbGF5ZXJfaWQgfHwgXCJcIlxuXG4gICAgICAgIC8vIPCflJLjgJDpmLLph43lpI3mnLrliLbjgJHmo4Dmn6XmmK/lkKblt7Lnu4/mkq3mlL7ov4fnm7jlkIznmoTpn7PmlYhcbiAgICAgICAgdmFyIHNvdW5kS2V5ID0gcGxheWVySUQgKyBcIl9cIiArIGFjdGlvbiArIFwiX1wiICsgcm91bmQgKyBcIl9cIiArIG9yZGVyXG4gICAgICAgIGlmICh0aGlzLl9sYXN0Um9iU291bmRLZXkgPT09IHNvdW5kS2V5KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0Um9iU291bmRLZXkgPSBzb3VuZEtleVxuXG5cbiAgICAgICAgLy8g5LiN5oqiXG4gICAgICAgIGlmIChhY3Rpb24gPT09IFwicGFzc1wiKSB7XG4gICAgICAgICAgICB2YXIgcGFzc1NvdW5kID0gZ2VuZGVyID09PSBcImZlbWFsZVwiID8gXCJtX252X2J1cWlhbmdcIiA6IFwibV9uYW5fYnVxaWFuZ1wiXG4gICAgICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3QocGFzc1NvdW5kKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmiqLlnLDkuLtcbiAgICAgICAgaWYgKGdlbmRlciA9PT0gXCJmZW1hbGVcIikge1xuICAgICAgICAgICAgLy8g5aWz546p5a62XG4gICAgICAgICAgICBpZiAocm91bmQgPT09IDEgJiYgb3JkZXIgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChcIm1fbnZfcWlhbmdkaXpodV8wMVwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMi8z5L2NIOaIliDnrKwy6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHZhciBzb3VuZHMgPSBbXCJtX252X3FpYW5nZGl6aHVfMDJcIiwgXCJtX252X3FpYW5nZGl6aHVfd29xaWFuZ18wMVwiXVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlSYW5kb21Tb3VuZChzb3VuZHMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDnlLfnjqnlrrZcbiAgICAgICAgICAgIGlmIChyb3VuZCA9PT0gMSAmJiBvcmRlciA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIOesrDHova7nrKwx5L2NXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KFwibV9uYW5fcWlhbmdkaXpodVwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMi8z5L2NIOaIliDnrKwy6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHZhciBzb3VuZHMgPSBbXCJtX25hbl9xaWFuZ2Rpemh1XCIsIFwibV9uYW5fcWlhbmdkaXpodV93b3FpYW5nXCJdXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVJhbmRvbVNvdW5kKHNvdW5kcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SKIOaSreaUvumfs+aViO+8iOW4piBmYWxsYmFjayDmnLrliLbvvIlcbiAgICAgKiDwn5Sn44CQ6YeN5p6E44CR56e76Zmk5YWo5bGAIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiIOeahOmAu+i+kVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0g6Z+z5pWI5ZCN56ew77yI5LiN5ZCr5omp5bGV5ZCN77yJXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZhbGxiYWNrIC0g5Y+v6YCJ55qEIGZhbGxiYWNrIOmfs+aViOWQjeensO+8iOS4jeWGjeiHquWKqCBmYWxsYmFjayDliLAgXCLlpKfkvaBcIu+8iVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYWxsb3dEYW5pRmFsbGJhY2sgLSDmmK/lkKblhYHorrjmnIDnu4ggZmFsbGJhY2sg5YiwIFwi5aSn5L2gXCLvvIjpu5jorqQgZmFsc2XvvIlcbiAgICAgKi9cbiAgICBfcGxheVNvdW5kRWZmZWN0OiBmdW5jdGlvbihuYW1lLCBmYWxsYmFjaywgYWxsb3dEYW5pRmFsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcInNvdW5kL1wiICsgbmFtZSwgY2MuQXVkaW9DbGlwLCBmdW5jdGlvbihlcnIsIGNsaXApIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfcGxheVNvdW5kRWZmZWN0XSDliqDovb3pn7PmlYjlpLHotKU6IFwiICsgbmFtZSwgZXJyLm1lc3NhZ2UgfHwgZXJyKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJBmYWxsYmFja+OAkeWwneivleaSreaUvuWkh+eUqOmfs+aViFxuICAgICAgICAgICAgICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcInNvdW5kL1wiICsgZmFsbGJhY2ssIGNjLkF1ZGlvQ2xpcCwgZnVuY3Rpb24oZXJyMiwgY2xpcDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX3BsYXlTb3VuZEVmZmVjdF0gZmFsbGJhY2sg5Lmf5aSx6LSlOiBcIiArIGZhbGxiYWNrLCBlcnIyLm1lc3NhZ2UgfHwgZXJyMilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ6YeN6KaB5L+u5pS544CR5LiN5YaN6Ieq5YqoIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+q5pyJ5piO56Gu5YWB6K645pe25omNIGZhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93RGFuaUZhbGxiYWNrICYmIGZhbGxiYWNrICE9PSBcIm1fY3BfZGFuaVwiICYmIG5hbWUgIT09IFwibV9jcF9kYW5pXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcGxheVNvdW5kRWZmZWN0KFwibV9jcF9kYW5pXCIsIG51bGwsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QoY2xpcDIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsb3dEYW5pRmFsbGJhY2sgJiYgbmFtZSAhPT0gXCJtX2NwX2RhbmlcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ6YeN6KaB5L+u5pS544CR5LiN5YaN6buY6K6kIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3BsYXlTb3VuZEVmZmVjdChcIm1fY3BfZGFuaVwiLCBudWxsLCBmYWxzZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QoY2xpcCwgZmFsc2UpXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflIog6ZqP5py65pKt5pS+6Z+z5pWIXG4gICAgICogQHBhcmFtIHtBcnJheX0gc291bmRzIC0g6Z+z5pWI5ZCN56ew5pWw57uEXG4gICAgICovXG4gICAgX3BsYXlSYW5kb21Tb3VuZDogZnVuY3Rpb24oc291bmRzKSB7XG4gICAgICAgIGlmICghc291bmRzIHx8IHNvdW5kcy5sZW5ndGggPT09IDApIHJldHVyblxuICAgICAgICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VuZHMubGVuZ3RoKVxuICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3Qoc291bmRzW2luZGV4XSlcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBvbkJ1dHRvbkNsaWNrOiBmdW5jdGlvbihldmVudCwgY3VzdG9tRGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgc3dpdGNoKGN1c3RvbURhdGEpIHtcbiAgICAgICAgICAgIGNhc2UgXCJidG5fcWlhbmR6XCI6XG4gICAgICAgICAgICAgICAgLy8g4pqg77iP44CQ5bey5Yig6Zmk44CR5oyJ6ZKu54K55Ye76Z+z5pWIIC0g6Z+z5pWI55Sx5pyN5Yqh56uv5bm/5pKt6Kem5Y+R77yIX3BsYXlSb2JTb3VuZO+8iVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9iaWRkaW5nUGhhc2UgPT09IFwiYmlkZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVSb2JVSSgpXG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0QmlkKHRydWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RSb2JTdGF0ZShxaWFuX3N0YXRlLnFpYW4pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGNhc2UgXCJidG5fYnVxaWFuZHpcIjpcbiAgICAgICAgICAgICAgICAvLyDimqDvuI/jgJDlt7LliKDpmaTjgJHmjInpkq7ngrnlh7vpn7PmlYggLSDpn7PmlYjnlLHmnI3liqHnq6/lub/mkq3op6blj5HvvIhfcGxheVJvYlNvdW5k77yJXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2JpZGRpbmdQaGFzZSA9PT0gXCJiaWRkaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RCaWQoZmFsc2UpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RSb2JTdGF0ZShxaWFuX3N0YXRlLmJ1cWlhbmcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlIFwibm9wdXNoY2FyZFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q5Y+R6YCB5LiN5Ye66K+35rGC77yM5LiN5pys5Zyw5aSE55CGXG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RfYnVjaHVfY2FyZChbXSwgbnVsbClcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlpbmdVSV9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgY2FzZSBcInRpcGNhcmRcIjpcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5o+Q56S65oyJ6ZKu5Yqf6IO9XG4gICAgICAgICAgICAgICAgdGhpcy5fb25IaW50QnV0dG9uQ2xpY2soKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGNhc2UgXCJwdXNoY2FyZFwiOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IFwi6K+36YCJ5oup54mMIVwiXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOiwg+ivleaXpeW/l+OAkeaJk+WNsOmAieS4reeahOeJjO+8iOWinuW8uueJiO+8jOaYvuekuueJjOWQje+8iVxuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZENhcmROYW1lcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmQgPSB0aGlzLmNob29zZV9jYXJkX2RhdGFbaV1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZC5jYXJkX2RhdGEgfHwgY2FyZFxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZE5hbWUgPSB0aGlzLl9nZXRDYXJkRGlzcGxheU5hbWUoY2FyZERhdGEpXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2FyZE5hbWVzLnB1c2goY2FyZE5hbWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlrqLmiLfnq6/niYzlnovpqozor4FcbiAgICAgICAgICAgICAgICB2YXIgY2FyZHNUb1BsYXkgPSB0aGlzLmNob29zZV9jYXJkX2RhdGEubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMuY2FyZF9kYXRhIHx8IGNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy5fdmFsaWRhdGVIYW5kVHlwZShjYXJkc1RvUGxheSlcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRpb25SZXN1bHQudmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gdmFsaWRhdGlvblJlc3VsdC5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlj6rlj5HpgIHlh7rniYzor7fmsYLvvIznrYnlvoXmnI3liqHnq6/lub/mkq3lkI7lho3mm7TmlrDmiYvniYxcbiAgICAgICAgICAgICAgICAvLyDmnI3liqHnq6/kvJrlub/mkq0gY2FyZF9wbGF5ZWQg5raI5oGv77yM55SxIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOWkhOeQhlxuICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0X2NodV9jYXJkKHRoaXMuY2hvb3NlX2NhcmRfZGF0YSwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlLnov5vjgJHlh7rniYzlpLHotKXvvIzmmL7npLrmm7Tor6bnu4bnmoTplJnor6/kv6Hmga9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvck1zZyA9IChkYXRhICYmIGRhdGEubXNnKSB8fCBcIuWHuueJjOWksei0pVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPlueUqOaIt+mAieS4reeahOeJjOWei1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkVHlwZSA9IHZhbGlkYXRpb25SZXN1bHQudHlwZSB8fCBcIuacquefpeeJjOWei1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb3VudCA9IHNlbGYuY2hvb3NlX2NhcmRfZGF0YS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W5LiK5a6255qE54mM5Z6L5L+h5oGvXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFBsYXllZFR5cGUgPSBzZWxmLl9sYXN0UGxheWVkSGFuZFR5cGUgfHwgXCLmnKrnn6VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQbGF5ZWRDb3VudCA9IHNlbGYuX2xhc3RQbGF5ZWRDYXJkcyA/IHNlbGYuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGggOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHojrflj5bkuIrlrrblh7rnmoTniYzlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXN0UGxheWVkQ2FyZE5hbWVzID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX2xhc3RQbGF5ZWRDYXJkcyAmJiBzZWxmLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChzZWxmLl9nZXRDYXJkRGlzcGxheU5hbWUoc2VsZi5fbGFzdFBsYXllZENhcmRzW2ldKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBsYXllZENhcmROYW1lcyA9IG5hbWVzLmpvaW4oXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaehOW7uuivpue7hueahOmUmeivr+aPkOekulxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRldGFpbE1zZyA9IGVycm9yTXNnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JNc2cuaW5kZXhPZihcIuWkp+S4jei/h1wiKSA+PSAwIHx8IGVycm9yTXNnLmluZGV4T2YoXCLmiZPkuI3ov4dcIikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDlop7lvLrjgJHmmL7npLrnlKjmiLfpgInnmoTniYzlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeW91ckNhcmRzID0gc2VsZWN0ZWRDYXJkTmFtZXMuam9pbihcIixcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDniYzlnovkuI3ljLnphY3miJbniYzlpKrlsI9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDb3VudCAhPT0gbGFzdFBsYXllZENvdW50ICYmIGxhc3RQbGF5ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsTXNnID0gXCLniYzmlbDkuI3ljLnphY3vvIHkuIrlrrblh7pcIiArIGxhc3RQbGF5ZWRUeXBlICsgXCLvvIzkvaDpgInkuoZcIiArIHlvdXJDYXJkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRUeXBlICE9PSBsYXN0UGxheWVkVHlwZSAmJiBsYXN0UGxheWVkVHlwZSAhPT0gXCLngrjlvLlcIiAmJiBsYXN0UGxheWVkVHlwZSAhPT0gXCLnjovngrhcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxNc2cgPSBcIueJjOWei+S4jeWMuemFje+8geS4iuWutuWHulwiICsgbGFzdFBsYXllZFR5cGUgKyBcIu+8jOS9oOmAieS6hlwiICsgeW91ckNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOWinuW8uuOAkeaYvuekuuWFt+S9k+eahOeJjOWQjeavlOi+g1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBsYXllZENhcmROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsTXNnID0gXCLmiZPkuI3ov4fvvIHkuIrlrrblh7pcIiArIGxhc3RQbGF5ZWRDYXJkTmFtZXMgKyBcIu+8jOS9oOmAieS6hlwiICsgeW91ckNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxNc2cgPSBcIueJjOWkquWwj++8geS9oOmAieS6hlwiICsgeW91ckNhcmRzICsgXCLmiZPkuI3ov4fkuIrlrrZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBkZXRhaWxNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCkgIC8vIOW7tumVv+aYvuekuuaXtumXtOWIsDPnp5JcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3Jlc2V0Q2FyZEZsYWdzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5Ye654mM5oiQ5Yqf77yM5LiN5Zyo6L+Z6YeM5Yig6Zmk5omL54mM77yBXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnrYnlvoXmnI3liqHnq6/lub/mkq0gY2FyZF9wbGF5ZWQg5raI5oGv77yM55SxIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOWkhOeQhlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5riF56m66YCJ5Lit55qE54mMXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNob29zZV9jYXJkX2RhdGEgPSBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfcmVzZXRDYXJkRmxhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q6YeN572u5omL54mM5a655Zmo5Lit55qE54mM6IqC54K5XG4gICAgICAgIHZhciBjYXJkUGFyZW50ID0gdGhpcy5jYXJkc19ub2RlXG4gICAgICAgIGlmICghY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbX3Jlc2V0Q2FyZEZsYWdzXSBjYXJkc19ub2RlIOacquWumuS5ie+8jOWwneivleafpeaJvuaJi+eJjOWuueWZqFwiKVxuICAgICAgICAgICAgLy8g5bCd6K+V6YCa6L+H6IqC54K55ZCN56ew5p+l5om+XG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lTm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGlmIChnYW1lU2NlbmVOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IFwiY2FyZHNfbm9kZVwiIHx8IGNoaWxkLm5hbWUgPT09IFwiY2FyZHNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFBhcmVudCA9IGNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRzX25vZGUgPSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmHjee9ruaJgOacieeJjOeahOmAieS4reeKtuaAgVxuICAgICAgICBpZiAoY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gY2FyZFBhcmVudC5jaGlsZHJlblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLmVtaXQoXCJyZXNldF9jYXJkX2ZsYWdcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn46uIFtfcmVzZXRDYXJkRmxhZ3NdIOaJvuS4jeWIsOaJi+eJjOWuueWZqFwiKVxuICAgICAgICB9XG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmuIXnqbrpgInniYzlkI7mm7TmlrDmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXkoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw5bey6YCJ54mM5pWw5pi+56S6XG4gICAgICog4pqg77iP44CQ5L+u5aSN44CR55So5oi36KaB5rGC6K+l5L2N572u5LiN5pi+56S65Lu75L2V5paH5a2X77yM5bey56aB55SoIHRpcHNMYWJlbCDmmL7npLpcbiAgICAgKiDku4XlnKjmjqfliLblj7DovpPlh7rml6Xlv5fnlKjkuo7osIPor5VcbiAgICAgKi9cbiAgICBfdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY291bnQgPSB0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmsqHmnInpgInkuK3niYzvvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W6YCJ5Lit55qE54mM5pWw5o2uXG4gICAgICAgIHZhciBjYXJkc1RvUGxheSA9IHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgcmV0dXJuIGMuY2FyZF9kYXRhIHx8IGNcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOmqjOivgeeJjOWei1xuICAgICAgICB2YXIgdmFsaWRhdGlvblJlc3VsdCA9IHRoaXMuX3ZhbGlkYXRlSGFuZFR5cGUoY2FyZHNUb1BsYXkpXG4gICAgICAgIFxuICAgICAgICAvLyDmnoTlu7rmmL7npLrmlofmnKzvvIjku4XnlKjkuo7ml6Xlv5fvvIlcbiAgICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gXCLlt7LpgIkgXCIgKyBjb3VudCArIFwiIOW8oFwiXG4gICAgICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCArPSBcIiAtIFwiICsgdmFsaWRhdGlvblJlc3VsdC50eXBlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCArPSBcIiAtIFwiICsgdmFsaWRhdGlvblJlc3VsdC5tZXNzYWdlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOKaoO+4j+OAkOemgeeUqOOAkeS4jeWGjeWcqCB0aXBzTGFiZWwg5LiK5pi+56S65paH5a2XXG4gICAgICAgIC8vIOS7hei+k+WHuuaOp+WItuWPsOaXpeW/l+eUqOS6juiwg+ivlVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlh7rniYznm7jlhbNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5bey5bqf5byD44CR5Zyw5Li76I635b6X5bqV54mM5ZCO5re75Yqg5Yiw5omL54mMXG4gICAgICog4pqg77iP44CQ6YeN6KaB44CR5q2k5Ye95pWw5bey5bqf5byD77yM5LiN5YaN5L2/55So77yBXG4gICAgICog5Zyw5Li75omL54mM5pu05paw55SxIG9uTGFuZGxvcmRDYXJkcyDlpITnkIbvvIzpgJrov4fmnI3liqHnq68gbGFuZGxvcmRfY2FyZHMg5raI5oGvXG4gICAgICog5L+d55WZ5q2k5Ye95pWw5LuF55So5LqO5YW85a6577yM5LiN5Lya6Kem5Y+R6YeN5paw5Y+R54mM5Yqo55S7XG4gICAgICovXG4gICAgcHVzaFRocmVlQ2FyZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHkuI3lho3miafooYzku7vkvZXmk43kvZzvvIFcbiAgICAgICAgLy8g5bqV54mM5bey6YCa6L+HIGxhbmRsb3JkX2NhcmRzIOa2iOaBr+eUseacjeWKoeerr+ebtOaOpeabtOaWsOWcsOS4u+aJi+eJjFxuICAgICAgICAvLyDmraTlh73mlbDkv53nlZnku4XkuLrlhbzlrrnml6fku6PnoIHlvJXnlKhcbiAgICAgICAgcmV0dXJuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHku47miYvniYzkuK3liKDpmaTlt7Llh7rnmoTniYzvvIjmnI3liqHnq6/pqbHliqjvvIlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOacjeWKoeerr+i/lOWbnueahOW3suWHuueJjOaVsOaNriBbe3N1aXQsIHJhbmt9LCAuLi5dXG4gICAgICovXG4gICAgX3JlbW92ZUNhcmRzRnJvbUhhbmQ6IGZ1bmN0aW9uKGNhcmRzKSB7XG4gICAgICAgIGlmICghY2FyZHMgfHwgY2FyZHMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuXG4gICAgICAgIC8vIOmBjeWOhuimgeWIoOmZpOeahOeJjFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZFRvUmVtb3ZlID0gY2FyZHNbaV1cbiAgICAgICAgICAgIC8vIOWcqOaJi+eJjOS4reafpeaJvuW5tuWIoOmZpFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IHRoaXMuaGFuZENhcmRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFuZENhcmRzW2pdLnJhbmsgPT09IGNhcmRUb1JlbW92ZS5yYW5rICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzW2pdLnN1aXQgPT09IGNhcmRUb1JlbW92ZS5zdWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzLnNwbGljZShqLCAxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5riF56m66YCJ5Lit55qE54mM5pWw5o2u77yM6Ziy5q2i5q6L55WZXG4gICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOmdmem7mOabtOaWsO+8jOS4jeinpuWPkeWPkeeJjOWKqOeUu1xuICAgICAgICB0aGlzLl91cGRhdGVIYW5kQ2FyZHNTaWxlbnQodGhpcy5oYW5kQ2FyZHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6Z2Z6buY5pu05paw5omL54mM77yI5LiN6Kem5Y+R5Y+R54mM5Yqo55S777yJXG4gICAgICog55So5LqO5Ye654mM5ZCO5pu05paw5omL54mM5pi+56S6XG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDmiYvniYzmlbDmja5cbiAgICAgKi9cbiAgICBfdXBkYXRlSGFuZENhcmRzU2lsZW50OiBmdW5jdGlvbihjYXJkcykge1xuICAgICAgICBpZiAoIWNhcmRzKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLluo/miYvniYxcbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gdGhpcy5fc29ydENhcmRzKGNhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWPquS9v+eUqGNhcmRzX25vZGXvvIzkuI3pgY3ljoZub2RlLnBhcmVudFxuICAgICAgICB2YXIgY2FyZHNQYXJlbnQgPSB0aGlzLmNhcmRzX25vZGVcbiAgICAgICAgaWYgKCFjYXJkc1BhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW191cGRhdGVIYW5kQ2FyZHNTaWxlbnRdIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeWFiOmUgOavgeaJgOacieaXp+aJi+eJjOiKgueCue+8jOehruS/neS6i+S7tuebkeWQrOWZqOiiq+a4heeQhlxuICAgICAgICB2YXIgb2xkQ2hpbGRyZW4gPSBjYXJkc1BhcmVudC5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gb2xkQ2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IG9sZENoaWxkcmVuW2ldXG4gICAgICAgICAgICAvLyDlhYjlj5bmtojmiYDmnInkuovku7bnm5HlkKxcbiAgICAgICAgICAgIGNoaWxkLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVClcbiAgICAgICAgICAgIC8vIOWGjemUgOavgeiKgueCuVxuICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpXG4gICAgICAgIH1cbiAgICAgICAgLy8g5YaN5qyh56Gu5L+d5riF56m6XG4gICAgICAgIGNhcmRzUGFyZW50LnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHmuIXnqbrpgInkuK3nmoTniYzmlbDmja7vvIzpmLLmraLmrovnlZlcbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW11cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOWIm+W7uuaJi+eJjOiKgueCue+8iOaXoOWKqOeUu++8iVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRlZENhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBzb3J0ZWRDYXJkc1tpXVxuICAgICAgICAgICAgdmFyIHRhcmdldFggPSB0aGlzLl9nZXRDYXJkWChpLCBzb3J0ZWRDYXJkcy5sZW5ndGgsIENhcmRMYXlvdXQuY2FyZFNwYWNpbmcpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYXJkID0gY2MuaW5zdGFudGlhdGUodGhpcy5jYXJkX3ByZWZhYilcbiAgICAgICAgICAgIGlmICghY2FyZCkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FyZC5zY2FsZSA9IENhcmRMYXlvdXQuY2FyZFNjYWxlXG4gICAgICAgICAgICBjYXJkLnBhcmVudCA9IGNhcmRzUGFyZW50XG4gICAgICAgICAgICBjYXJkLnNldFBvc2l0aW9uKHRhcmdldFgsIENhcmRMYXlvdXQuY2FyZFkpXG4gICAgICAgICAgICBjYXJkLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIGNhcmQuekluZGV4ID0gaVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY2FyZENvbXAgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgIGlmIChjYXJkQ29tcCkge1xuICAgICAgICAgICAgICAgIGNhcmRDb21wLnNob3dDYXJkcyhjYXJkRGF0YSwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjee9rua4suafk+WTiOW4jO+8jOWFgeiuuOWQjue7rea4suafk1xuICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IEpTT04uc3RyaW5naWZ5KGNhcmRzKVxuICAgICAgICBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pqg77iP44CQ5bey5bqf5byD44CR5pen54mI5Yig6Zmk5omL54mM5pa55rOVXG4gICAgICog5L+d55WZ5LuF5Li65YW85a6577yM5paw5Luj56CB5bqU5L2/55SoIF9yZW1vdmVDYXJkc0Zyb21IYW5kXG4gICAgICovXG4gICAgZGVzdG9yeUNhcmQ6IGZ1bmN0aW9uKGFjY291bnRpZCwgY2hvb3NlX2NhcmQpIHtcbiAgICAgICAgaWYgKGNob29zZV9jYXJkLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgZGVzdHJveV9jYXJkID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaG9vc2VfY2FyZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IHRoaXMuaGFuZENhcmRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFuZENhcmRzW2pdLnJhbmsgPT09IGNob29zZV9jYXJkW2ldLmNhcmRfZGF0YS5yYW5rICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzW2pdLnN1aXQgPT09IGNob29zZV9jYXJkW2ldLmNhcmRfZGF0YS5zdWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS7juaJi+eJjOaVsOaNruS4reWIoOmZpFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRDYXJkcy5zcGxpY2UoaiwgMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOa4suafk1xuICAgICAgICB0aGlzLnJlbmRlckNhcmRzKHRoaXMuaGFuZENhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65Ye655qE54mMXG4gICAgICAgIGlmICh0aGlzLmNhcmRzX25vZGUgJiYgdGhpcy5jYXJkc19ub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvdXRDYXJkX25vZGUgPSB0aGlzLl9nZXRPdXRDYXJkTm9kZShhY2NvdW50aWQpXG4gICAgICAgICAgICBpZiAob3V0Q2FyZF9ub2RlKSB7XG4gICAgICAgICAgICAgICAgLy8g5om+5Yiw5bey6YCJ5Lit55qE54mM6IqC54K5XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZXMgPSBbXVxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY2FyZHNfbm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRDb21wID0gY2hpbGRyZW5baV0uZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZENvbXAgJiYgY2FyZENvbXAuZmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKGNoaWxkcmVuW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd091dENhcmRzKG91dENhcmRfbm9kZSwgc2VsZWN0ZWROb2RlcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX2dldE91dENhcmROb2RlOiBmdW5jdGlvbihhY2NvdW50aWQpIHtcbiAgICAgICAgdmFyIGdhbWVTY2VuZV9zY3JpcHQgPSB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKVxuICAgICAgICByZXR1cm4gZ2FtZVNjZW5lX3NjcmlwdCA/IGdhbWVTY2VuZV9zY3JpcHQuZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoYWNjb3VudGlkKSA6IG51bGxcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5o+Q56S65oyJ6ZKu5Yqf6IO9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5L+u5pS544CR5o+Q56S65oyJ6ZKu54K55Ye75aSE55CGIC0g5pS55Li66K+35rGC5pyN5Yqh56uv5o+Q56S6XG4gICAgICog5L2/55So5LqL5Lu255uR5ZCs5pa55byP5aSE55CG5ZON5bqU77yM5LiN5L2/55So5Zue6LCD77yI5Zug5Li65pyN5Yqh56uv5LiN6L+U5ZueY2FsbEluZGV477yJXG4gICAgICovXG4gICAgX29uSGludEJ1dHRvbkNsaWNrOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyDph43nva7pgInkuK3nmoTniYxcbiAgICAgICAgdGhpcy5fcmVzZXRDYXJkRmxhZ3MoKVxuICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEgPSBbXVxuXG4gICAgICAgIC8vIOivt+axguacjeWKoeerr+aPkOekuu+8iOS4jeS9v+eUqOWbnuiwg++8jOS+nei1luS6i+S7tuebkeWQrOWZqOWkhOeQhuWTjeW6lO+8iVxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgLy8g55u05o6l5Y+R6YCB5raI5oGv77yM5ZON5bqU5bCG6YCa6L+HIG9uSGludFJlc3VsdCDkuovku7bnm5HlkKzlmajlpITnkIZcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5zZW5kSGludFJlcXVlc3QoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlpITnkIbmnI3liqHnq6/ov5Tlm57nmoTmj5DnpLrnu5PmnpxcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOacjeWKoeerr+i/lOWbnueahOaPkOekuuaVsOaNrlxuICAgICAqICAgLSBjYXJkczog5o+Q56S655qE54mM5pWw57uEIFt7c3VpdCwgcmFua30sIC4uLl1cbiAgICAgKiAgIC0gaW5kZXg6IOW9k+WJjeaPkOekuue0ouW8le+8iOS7jjDlvIDlp4vvvIlcbiAgICAgKiAgIC0gdG90YWw6IOaAu+WFseacieWkmuWwkeenjeaPkOekulxuICAgICAqL1xuICAgIF9vbkhpbnRSZXN1bHQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICghZGF0YSB8fCAhZGF0YS5jYXJkcyB8fCBkYXRhLmNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeayoeacieiDvei/h+eahOeJjOaXtueri+WNs+aPkOekuuS4jeWHuu+8jOS4jeWGjeetieW+hTEtMuenklxuICAgICAgICAgICAgLy8gdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gXCLmsqHmnInlj6/lh7rnmoTniYxcIlxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOeri+WNs+iHquWKqOS4jeWHuu+8jOS4jeWGjeW7tui/n1xuICAgICAgICAgICAgc2VsZi5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RfYnVjaHVfY2FyZChbXSwgbnVsbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLnBsYXlpbmdVSV9ub2RlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyAxLjXnp5LlkI7muIXnqbrmj5DnpLrmloflrZdcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgfSwgMTUwMClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpgInkuK3mj5DnpLrnmoTniYxcbiAgICAgICAgdGhpcy5fc2VsZWN0Q2FyZHMoZGF0YS5jYXJkcylcblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5pS544CR5Y675o6J5qGM6Z2i5LiK55qE55m96Imy5paH5a2X5o+Q56S6XG4gICAgICAgIC8vIOS4jeWGjeaYvuekuiBcIuaPkOekujogWOW8oOeJjFwiIOS/oeaBr1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5omY566h44CR5aSE55CG5omY566h54q25oCB5Y+Y5YyW6YCa55+lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmiZjnrqHnirbmgIHmlbDmja5cbiAgICAgKiAgIC0gcGxheWVyX2lkOiDnjqnlrrZJRFxuICAgICAqICAgLSBwbGF5ZXJfbmFtZTog546p5a625ZCN5a2XXG4gICAgICogICAtIGlzX3RydXN0ZWU6IOaYr+WQpuaJmOeuoVxuICAgICAqICAgLSByZWFzb246IOWOn+WboCAodGltZW91dC9kaXNjb25uZWN0L3JlY29ubmVjdClcbiAgICAgKi9cbiAgICBfb25UcnVzdGVlU3RhdGVOb3RpZnk6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8g6YCa55+l5omA5pyJ546p5a626IqC54K55pu05paw5omY566h54q25oCBXG4gICAgICAgIGlmICh0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwidHJ1c3RlZV9zdGF0ZV91cGRhdGVcIiwgZGF0YSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmn6Xmib7lj6/ku6Xlh7rnmoTniYzvvIjmnKzlnLBmYWxsYmFja++8iVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGxhc3RTZWxlY3RlZCAtIOS4iuasoemAieS4reeahOeJjO+8iOeUqOS6juaJvuS4i+S4gOe7hO+8iVxuICAgICAqIEByZXR1cm5zIHtBcnJheX0g5Y+v5Lul5Ye655qE54mMXG4gICAgICovXG4gICAgX2ZpbmRQbGF5YWJsZUNhcmRzOiBmdW5jdGlvbihsYXN0U2VsZWN0ZWQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmsqHmnInmiYvniYzvvIzkuI3lpITnkIZcbiAgICAgICAgaWYgKCF0aGlzLmhhbmRDYXJkcyB8fCB0aGlzLmhhbmRDYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOe7n+iuoeaJi+eJjFxuICAgICAgICB2YXIgY2FyZENvdW50cyA9IHt9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oYW5kQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gdGhpcy5oYW5kQ2FyZHNbaV0ucmFua1xuICAgICAgICAgICAgaWYgKCFjYXJkQ291bnRzW3JhbmtdKSB7XG4gICAgICAgICAgICAgICAgY2FyZENvdW50c1tyYW5rXSA9IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXJkQ291bnRzW3JhbmtdLnB1c2godGhpcy5oYW5kQ2FyZHNbaV0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOaYr+aWsOS4gOi9ru+8iOW/hemhu+WHuueJjO+8iVxuICAgICAgICBpZiAodGhpcy5fbXVzdFBsYXkgfHwgIXRoaXMuX2xhc3RQbGF5ZWRDYXJkcyB8fCB0aGlzLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluZFNtYWxsZXN0Q2FyZHMoY2FyZENvdW50cylcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5LiN6IO95omT6L+H77yM5LiN5o+Q56S6XG4gICAgICAgIGlmICghdGhpcy5fY2FuQmVhdCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W5LiK5a6254mM5Z6L5L+h5oGvXG4gICAgICAgIHZhciBsYXN0VHlwZSA9IHRoaXMuX2xhc3RQbGF5ZWRIYW5kVHlwZSB8fCBcIlwiXG4gICAgICAgIHZhciBsYXN0UmFuayA9IHRoaXMuX2dldExhc3RQbGF5ZWRNYWluUmFuaygpXG4gICAgICAgIHZhciBsYXN0Q291bnQgPSB0aGlzLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7niYzlnovmn6Xmib7og73miZPov4fnmoTmnIDlsI/niYxcbiAgICAgICAgc3dpdGNoIChsYXN0VHlwZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICBjYXNlIFwic2luZ2xlXCI6IGNhc2UgXCJzb2xvXCI6IGNhc2UgXCLljZXlvKBcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluZEJlYXRpbmdTaW5nbGUoY2FyZENvdW50cywgbGFzdFJhbmspXG4gICAgICAgICAgICBjYXNlIFwicGFpclwiOiBjYXNlIFwiZG91YmxlXCI6IGNhc2UgXCLlr7nlrZBcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluZEJlYXRpbmdQYWlyKGNhcmRDb3VudHMsIGxhc3RSYW5rKVxuICAgICAgICAgICAgY2FzZSBcInRyaXBsZVwiOiBjYXNlIFwidGhyZWVcIjogY2FzZSBcIuS4ieW8oFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1RyaXBsZShjYXJkQ291bnRzLCBsYXN0UmFuaywgMClcbiAgICAgICAgICAgIGNhc2UgXCJ0cmlwbGV3aXRoc2luZ2xlXCI6IGNhc2UgXCJzYW5kYWl5aVwiOiBjYXNlIFwi5LiJ5bim5LiAXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nVHJpcGxlKGNhcmRDb3VudHMsIGxhc3RSYW5rLCAxKVxuICAgICAgICAgICAgY2FzZSBcInRyaXBsZXdpdGhwYWlyXCI6IGNhc2UgXCJzYW5kYWlkdWlcIjogY2FzZSBcIuS4ieW4puS6jFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1RyaXBsZShjYXJkQ291bnRzLCBsYXN0UmFuaywgMilcbiAgICAgICAgICAgIGNhc2UgXCJib21iXCI6IGNhc2UgXCJ6aGFkYW5cIjogY2FzZSBcIueCuOW8uVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ0JvbWIoY2FyZENvdW50cywgbGFzdFJhbmspXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIOacquefpeeJjOWei++8jOWwneivleaMieW8oOaVsOWkhOeQhlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ0J5Q291bnQoY2FyZENvdW50cywgbGFzdENvdW50LCBsYXN0UmFuaylcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog6I635Y+W5LiK5a625Ye655qE54mM55qE5Li754mM54K55pWwXG4gICAgICovXG4gICAgX2dldExhc3RQbGF5ZWRNYWluUmFuazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fbGFzdFBsYXllZENhcmRzIHx8IHRoaXMuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgICAgLy8g57uf6K6h5q+P5Liq54K55pWw5Ye6546w55qE5qyh5pWwXG4gICAgICAgIHZhciBjb3VudHMgPSB7fVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSB0aGlzLl9sYXN0UGxheWVkQ2FyZHNbaV0ucmFua1xuICAgICAgICAgICAgY291bnRzW3JhbmtdID0gKGNvdW50c1tyYW5rXSB8fCAwKSArIDFcbiAgICAgICAgfVxuICAgICAgICAvLyDmib7lh7rlh7rnjrDmrKHmlbDmnIDlpJrnmoTngrnmlbDvvIjkuLvniYzvvIlcbiAgICAgICAgdmFyIG1heENvdW50ID0gMFxuICAgICAgICB2YXIgbWFpblJhbmsgPSAwXG4gICAgICAgIGZvciAodmFyIHJhbmsgaW4gY291bnRzKSB7XG4gICAgICAgICAgICBpZiAoY291bnRzW3JhbmtdID4gbWF4Q291bnQpIHtcbiAgICAgICAgICAgICAgICBtYXhDb3VudCA9IGNvdW50c1tyYW5rXVxuICAgICAgICAgICAgICAgIG1haW5SYW5rID0gcGFyc2VJbnQocmFuaylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFpblJhbmtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuacgOWwj+eahOeJjO+8iOaWsOS4gOi9ruaXtuS9v+eUqO+8iVxuICAgICAqL1xuICAgIF9maW5kU21hbGxlc3RDYXJkczogZnVuY3Rpb24oY2FyZENvdW50cykge1xuICAgICAgICAvLyDmjInngrnmlbDku47lsI/liLDlpKfmjpLluo9cbiAgICAgICAgdmFyIHJhbmtzID0gT2JqZWN0LmtleXMoY2FyZENvdW50cykubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHBhcnNlSW50KHIpIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOS8mOWFiOWHuuWNleW8oFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAoY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2NhcmRDb3VudHNbcmFua11bMF1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOayoeacieWNleW8oOWImeWHuuacgOWwj+eahOWvueWtkFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAoY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FyZENvdW50c1tyYW5rXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlh7rmnIDlsI/nmoTkuInlvKBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKGNhcmRDb3VudHNbcmFua10ubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmRDb3VudHNbcmFua11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Ye65pyA5bCP55qE54K45by5XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkQ291bnRzW3JhbmtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWFnOW6le+8muWHuuacgOWwj+eahOeJjFxuICAgICAgICBpZiAocmFua3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtjYXJkQ291bnRzW3JhbmtzWzBdXVswXV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5om+6IO95omT6L+H55qE5pyA5bCP5Y2V5bygXG4gICAgICovXG4gICAgX2ZpbmRCZWF0aW5nU2luZ2xlOiBmdW5jdGlvbihjYXJkQ291bnRzLCB0YXJnZXRSYW5rKSB7XG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKGNhcmRDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChyYW5rID4gdGFyZ2V0UmFuaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBbY2FyZENvdW50c1tyYW5rXVswXV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyDmsqHmnInog73miZPov4fnmoTljZXlvKDvvIzlsJ3or5XngrjlvLlcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRTbWFsbGVzdEJvbWIoY2FyZENvdW50cylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuiDveaJk+i/h+eahOacgOWwj+WvueWtkFxuICAgICAqL1xuICAgIF9maW5kQmVhdGluZ1BhaXI6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIHRhcmdldFJhbmspIHtcbiAgICAgICAgdmFyIHJhbmtzID0gT2JqZWN0LmtleXMoY2FyZENvdW50cykubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHBhcnNlSW50KHIpIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKHJhbmsgPiB0YXJnZXRSYW5rICYmIGNhcmRDb3VudHNbcmFua10ubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2NhcmRDb3VudHNbcmFua11bMF0sIGNhcmRDb3VudHNbcmFua11bMV1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8g5rKh5pyJ6IO95omT6L+H55qE5a+55a2Q77yM5bCd6K+V54K45by5XG4gICAgICAgIHJldHVybiB0aGlzLl9maW5kU21hbGxlc3RCb21iKGNhcmRDb3VudHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmib7og73miZPov4fnmoTmnIDlsI/kuInlvKDvvIjluKbmiJbkuI3luKbvvIlcbiAgICAgKi9cbiAgICBfZmluZEJlYXRpbmdUcmlwbGU6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIHRhcmdldFJhbmssIGtpY2tlcnMpIHtcbiAgICAgICAgdmFyIHJhbmtzID0gT2JqZWN0LmtleXMoY2FyZENvdW50cykubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHBhcnNlSW50KHIpIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOaJvuS4ieW8oFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAocmFuayA+IHRhcmdldFJhbmsgJiYgY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2FyZENvdW50c1tyYW5rXVswXSwgY2FyZENvdW50c1tyYW5rXVsxXSwgY2FyZENvdW50c1tyYW5rXVsyXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzpnIDopoHluKbniYxcbiAgICAgICAgICAgICAgICBpZiAoa2lja2VycyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtpY2tlckNhcmRzID0gdGhpcy5fZmluZEtpY2tlckNhcmRzKGNhcmRDb3VudHMsIHJhbmssIGtpY2tlcnMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChraWNrZXJDYXJkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChraWNrZXJDYXJkcylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleS7juWbm+W8oOS4reaLhuS4ieW8oFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAocmFuayA+IHRhcmdldFJhbmsgJiYgY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW2NhcmRDb3VudHNbcmFua11bMF0sIGNhcmRDb3VudHNbcmFua11bMV0sIGNhcmRDb3VudHNbcmFua11bMl1dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGtpY2tlcnMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBraWNrZXJDYXJkcyA9IHRoaXMuX2ZpbmRLaWNrZXJDYXJkcyhjYXJkQ291bnRzLCByYW5rLCBraWNrZXJzKVxuICAgICAgICAgICAgICAgICAgICBpZiAoa2lja2VyQ2FyZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoa2lja2VyQ2FyZHMpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlsJ3or5XngrjlvLlcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRTbWFsbGVzdEJvbWIoY2FyZENvdW50cylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuW4pueJjFxuICAgICAqL1xuICAgIF9maW5kS2lja2VyQ2FyZHM6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIGV4Y2x1ZGVSYW5rLCBjb3VudCkge1xuICAgICAgICB2YXIgcmFua3MgPSBPYmplY3Qua2V5cyhjYXJkQ291bnRzKS5tYXAoZnVuY3Rpb24ocikgeyByZXR1cm4gcGFyc2VJbnQocikgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICBcbiAgICAgICAgdmFyIGtpY2tlcnMgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aCAmJiBraWNrZXJzLmxlbmd0aCA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChyYW5rICE9PSBleGNsdWRlUmFuaykge1xuICAgICAgICAgICAgICAgIHZhciBhdmFpbGFibGUgPSBNYXRoLm1pbihjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCwgY291bnQgLSBraWNrZXJzLmxlbmd0aClcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGF2YWlsYWJsZTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGtpY2tlcnMucHVzaChjYXJkQ291bnRzW3JhbmtdW2pdKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGtpY2tlcnMubGVuZ3RoID09PSBjb3VudCA/IGtpY2tlcnMgOiBudWxsXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmib7og73miZPov4fnmoTmnIDlsI/ngrjlvLlcbiAgICAgKi9cbiAgICBfZmluZEJlYXRpbmdCb21iOiBmdW5jdGlvbihjYXJkQ291bnRzLCB0YXJnZXRSYW5rKSB7XG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKGNhcmRDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChyYW5rID4gdGFyZ2V0UmFuayAmJiBjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkQ291bnRzW3JhbmtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8g5rKh5pyJ6IO95omT6L+H55qE54K45by577yM5bCd6K+V546L54K4XG4gICAgICAgIHJldHVybiB0aGlzLl9maW5kUm9ja2V0KGNhcmRDb3VudHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmib7mnIDlsI/nmoTngrjlvLlcbiAgICAgKi9cbiAgICBfZmluZFNtYWxsZXN0Qm9tYjogZnVuY3Rpb24oY2FyZENvdW50cykge1xuICAgICAgICB2YXIgcmFua3MgPSBPYmplY3Qua2V5cyhjYXJkQ291bnRzKS5tYXAoZnVuY3Rpb24ocikgeyByZXR1cm4gcGFyc2VJbnQocikgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAoY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FyZENvdW50c1tyYW5rXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9maW5kUm9ja2V0KGNhcmRDb3VudHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmib7njovngrhcbiAgICAgKi9cbiAgICBfZmluZFJvY2tldDogZnVuY3Rpb24oY2FyZENvdW50cykge1xuICAgICAgICB2YXIgam9rZXJzID0gW11cbiAgICAgICAgaWYgKGNhcmRDb3VudHNbMTZdICYmIGNhcmRDb3VudHNbMTZdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGpva2Vycy5wdXNoKGNhcmRDb3VudHNbMTZdWzBdKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYXJkQ291bnRzWzE3XSAmJiBjYXJkQ291bnRzWzE3XS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBqb2tlcnMucHVzaChjYXJkQ291bnRzWzE3XVswXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9rZXJzLmxlbmd0aCA9PT0gMiA/IGpva2VycyA6IG51bGxcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaMieW8oOaVsOaJvuiDveaJk+i/h+eahOeJjFxuICAgICAqL1xuICAgIF9maW5kQmVhdGluZ0J5Q291bnQ6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIGNvdW50LCB0YXJnZXRSYW5rKSB7XG4gICAgICAgIC8vIOeugOWNleWunueOsO+8muaMieW8oOaVsOWkhOeQhlxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1NpbmdsZShjYXJkQ291bnRzLCB0YXJnZXRSYW5rKVxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ID09PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluZEJlYXRpbmdQYWlyKGNhcmRDb3VudHMsIHRhcmdldFJhbmspXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnQgPT09IDMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1RyaXBsZShjYXJkQ291bnRzLCB0YXJnZXRSYW5rLCAwKVxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ID09PSA0KSB7XG4gICAgICAgICAgICAvLyDlj6/og73mmK/ngrjlvLlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ0JvbWIoY2FyZENvdW50cywgdGFyZ2V0UmFuaylcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudCA+PSA1KSB7XG4gICAgICAgICAgICAvLyDlj6/og73mmK/pobrlrZDjgIHov57lr7nnrYnvvIzmmoLkuI3mlK/mjIHmj5DnpLpcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog6YCJ5Lit5oyH5a6a55qE54mMXG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDopoHpgInkuK3nmoTniYxcbiAgICAgKi9cbiAgICBfc2VsZWN0Q2FyZHM6IGZ1bmN0aW9uKGNhcmRzKSB7XG4gICAgICAgIGlmICghY2FyZHMgfHwgY2FyZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWPquS7juaJi+eJjOWuueWZqOS4reafpeaJvu+8jOS4jemBjeWOhm5vZGUucGFyZW50XG4gICAgICAgIHZhciBjYXJkUGFyZW50ID0gdGhpcy5jYXJkc19ub2RlXG4gICAgICAgIGlmICghY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbX3NlbGVjdENhcmRzXSBjYXJkc19ub2RlIOacquWumuS5ie+8jOWwneivleafpeaJvuaJi+eJjOWuueWZqFwiKVxuICAgICAgICAgICAgLy8g5bCd6K+V6YCa6L+H6IqC54K55ZCN56ew5p+l5om+XG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lTm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGlmIChnYW1lU2NlbmVOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IFwiY2FyZHNfbm9kZVwiIHx8IGNoaWxkLm5hbWUgPT09IFwiY2FyZHNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFBhcmVudCA9IGNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRzX25vZGUgPSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW19zZWxlY3RDYXJkc10g5om+5LiN5Yiw5omL54mM5a655ZmoXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNhcmRQYXJlbnQuY2hpbGRyZW5cblxuICAgICAgICB2YXIgZm91bmRDb3VudCA9IDBcbiAgICAgICAgdmFyIGFscmVhZHlNYXRjaGVkID0ge30gIC8vIPCflKfjgJDmlrDlop7jgJHorrDlvZXlt7LljLnphY3nmoTniYzvvIzpmLLmraLph43lpI3ljLnphY1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZE5vZGUgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgdmFyIGNhcmRDb21wID0gY2FyZE5vZGUuZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgaWYgKGNhcmRDb21wICYmIGNhcmRDb21wLmNhcmRfZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIOajgOafpei/meW8oOeJjOaYr+WQpuWcqOimgemAieS4reeahOeJjOS4rVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2FyZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoS2V5ID0gY2FyZHNbal0uc3VpdCArIFwiX1wiICsgY2FyZHNbal0ucmFua1xuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5qOA5p+l5piv5ZCm5bey57uP5Yy56YWN6L+H6L+Z5byg54mMXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5TWF0Y2hlZFttYXRjaEtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZENvbXAuY2FyZF9kYXRhLnJhbmsgPT09IGNhcmRzW2pdLnJhbmsgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRDb21wLmNhcmRfZGF0YS5zdWl0ID09PSBjYXJkc1tqXS5zdWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5qOA5p+l5piv5ZCm5bey57uP6YCJ5LitXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhcmRDb21wLmZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDpgInkuK3ov5nlvKDniYxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkQ29tcC5mbGFnID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmROb2RlLnkgKz0gMjAgIC8vIOWQkeS4iuenu+WKqOihqOekuumAieS4rVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZGlkOiBjYXJkQ29tcC5jYXJkX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkX2RhdGE6IGNhcmRDb21wLmNhcmRfZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeU1hdGNoZWRbbWF0Y2hLZXldID0gdHJ1ZSAgLy8g5qCH6K6w5bey5Yy56YWNXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGZvdW5kQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IFwi5o+Q56S65aSx6LSl77yM6K+35omL5Yqo6YCJ54mMXCJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICB9LCAyMDAwKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNsZWFyT3V0Wm9uZTogZnVuY3Rpb24oYWNjb3VudGlkKSB7XG4gICAgICAgIHZhciBvdXRDYXJkX25vZGUgPSB0aGlzLl9nZXRPdXRDYXJkTm9kZShhY2NvdW50aWQpXG4gICAgICAgIGlmIChvdXRDYXJkX25vZGUpIHtcbiAgICAgICAgICAgIG91dENhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNob3dPdXRDYXJkczogZnVuY3Rpb24ob3V0Q2FyZF9ub2RlLCBjYXJkcykge1xuICAgICAgICBpZiAoIW91dENhcmRfbm9kZSB8fCAhY2FyZHMgfHwgY2FyZHMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIG91dENhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuICAgICAgICBcbiAgICAgICAgdmFyIGNvdW50ID0gY2FyZHMubGVuZ3RoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNhcmQgPSBjYXJkc1tpXVxuICAgICAgICAgICAgb3V0Q2FyZF9ub2RlLmFkZENoaWxkKGNhcmQsIGkpXG4gICAgICAgICAgICBjYXJkLnNldFNjYWxlKENhcmRMYXlvdXQub3V0Q2FyZFNjYWxlLCBDYXJkTGF5b3V0Lm91dENhcmRTY2FsZSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLl9nZXRDYXJkWChpLCBjb3VudCwgQ2FyZExheW91dC5vdXRDYXJkU3BhY2luZylcbiAgICAgICAgICAgIGNhcmQuc2V0UG9zaXRpb24oeCwgMClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmuLjmiI/nirbmgIHmgaLlpI3vvIjmlq3nur/ph43ov57vvIlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICByZXN0b3JlR2FtZVN0YXRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgZ2FtZVN0YXRlID0gZGF0YS5nYW1lX3N0YXRlXG4gICAgICAgIGlmICghZ2FtZVN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHorr7nva7muLjmiI/pmLbmrrVcbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5waGFzZSA9PT0gXCJiaWRkaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwiYmlkZGluZ1wiXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImJpZGRpbmdcIlxuICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZS5waGFzZSA9PT0gXCJwbGF5aW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwicGxheWluZ1wiXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImlkbGVcIlxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmgaLlpI3njqnlrrbkv6Hmga9cbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVTdGF0ZS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAgPSBnYW1lU3RhdGUucGxheWVyc1tpXVxuICAgICAgICAgICAgICAgIGlmIChwLmlzX2xhbmRsb3JkICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLm1hc3Rlcl9hY2NvdW50aWQgPSBwLmlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR6YCa55+l5YW25LuW546p5a626IqC54K55pu05pawXG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJwbGF5ZXJzX3Jlc3RvcmVkX2V2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyczogZ2FtZVN0YXRlLnBsYXllcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5oGi5aSN5omL54mMXG4gICAgICAgIGlmIChnYW1lU3RhdGUuaGFuZCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR6YeN572u5riy5p+T5ZOI5biM77yM56Gu5L+d5omL54mM5Lya6KKr5pu05pawXG4gICAgICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IFwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5L+d5a2Y5omL54mM5pWw5o2uXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IGdhbWVTdGF0ZS5oYW5kXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOagh+iusOWPkeeJjOWujOaIkFxuICAgICAgICAgICAgdGhpcy5jYXJkc1JlYWR5ID0gdHJ1ZVxuICAgICAgICAgICAgdGhpcy5mYXBhaV9lbmQgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHkvb/nlKjpnZnpu5jmm7TmlrDvvIzkuI3op6blj5Hlj5HniYzliqjnlLtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUhhbmRDYXJkc1NpbGVudCh0aGlzLmhhbmRDYXJkcylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5oGi5aSN5bqV54mMXG4gICAgICAgIGlmIChnYW1lU3RhdGUuYm90dG9tX2NhcmRzICYmIGdhbWVTdGF0ZS5ib3R0b21fY2FyZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ib3R0b21DYXJkcyA9IGdhbWVTdGF0ZS5ib3R0b21fY2FyZHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ib3R0b21fY2FyZC5sZW5ndGggJiYgaSA8IHRoaXMuYm90dG9tQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib3R0b21fY2FyZFtpXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZENvbXAgPSB0aGlzLmJvdHRvbV9jYXJkW2ldLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRDb21wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkQ29tcC5zaG93Q2FyZHModGhpcy5ib3R0b21DYXJkc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeaBouWkjeS4iuWutuWHuueahOeJjFxuICAgICAgICBpZiAoZ2FtZVN0YXRlLmxhc3RfcGxheWVkICYmIGdhbWVTdGF0ZS5sYXN0X3BsYXllZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXN0UGxheWVkQ2FyZHMgPSBnYW1lU3RhdGUubGFzdF9wbGF5ZWRcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQbGF5ZWRIYW5kVHlwZSA9IGdhbWVTdGF0ZS5sYXN0X3BsYXllZC5oYW5kX3R5cGUgfHwgXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5pi+56S65LiK5a625Ye655qE54mMXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlLmxhc3RfcGxheWVyX2lkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdhbWVTY2VuZV9zY3JpcHQgPSB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKVxuICAgICAgICAgICAgICAgIGlmIChnYW1lU2NlbmVfc2NyaXB0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvdXRDYXJkX25vZGUgPSBnYW1lU2NlbmVfc2NyaXB0LmdldFVzZXJPdXRDYXJkUG9zQnlBY2NvdW50KGdhbWVTdGF0ZS5sYXN0X3BsYXllcl9pZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dENhcmRfbm9kZSAmJiB0aGlzLmNhcmRfcHJlZmFiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmuIXpmaTml6fnmoTlh7rniYxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dENhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaYvuekuuS4iuWutuWHuueahOeJjFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVfY2FyZHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU3RhdGUubGFzdF9wbGF5ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuY2FyZF9wcmVmYWIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRTY3JpcHQgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRTY3JpcHQuc2hvd0NhcmRzKGdhbWVTdGF0ZS5sYXN0X3BsYXllZFtpXSwgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVfY2FyZHMucHVzaChjYXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd091dENhcmRzKG91dENhcmRfbm9kZSwgbm9kZV9jYXJkcylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5oGi5aSN5Ye654mM6L2u5qyhXG4gICAgICAgIGlmIChnYW1lU3RhdGUucGhhc2UgPT09IFwicGxheWluZ1wiICYmIGdhbWVTdGF0ZS5jdXJyZW50X3R1cm4pIHtcbiAgICAgICAgICAgIHZhciBteVBsYXllcklkID0gd2luZG93Lm15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHpmpDol4/miqLlnLDkuLtVSVxuICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKFN0cmluZyhnYW1lU3RhdGUuY3VycmVudF90dXJuKSA9PT0gU3RyaW5nKG15UGxheWVySWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOWHuueJjOeKtuaAgVxuICAgICAgICAgICAgICAgIHRoaXMuX211c3RQbGF5ID0gZ2FtZVN0YXRlLm11c3RfcGxheSB8fCBmYWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbkJlYXQgPSBnYW1lU3RhdGUuY2FuX2JlYXQgfHwgZmFsc2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5ZCv5Yqo5Ye654mM5YCS6K6h5pe277yI5aaC5p6c5pyN5Yqh56uv5o+Q5L6b5LqG5Ymp5L2Z5pe26Ze077yJXG4gICAgICAgICAgICAgICAgLy8g5rOo5oSP77ya5pyN5Yqh56uv5bqU6K+l5Zyo6YeN6L+e5ZCO5Y+R6YCBIGNhbl9jaHVfY2FyZF9ub3RpZnkg5raI5oGv5p2l5ZCv5Yqo5YCS6K6h5pe2XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXlpbmdVSV9ub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlpoLmnpzmmK/miqLlnLDkuLvpmLbmrrVcbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5waGFzZSA9PT0gXCJiaWRkaW5nXCIpIHtcbiAgICAgICAgICAgIC8vIOazqOaEj++8muacjeWKoeerr+W6lOivpeWcqOmHjei/nuWQjuWPkemAgSBjYWxsX2xhbmRsb3JkX3R1cm5fbm90aWZ5IOa2iOaBr+adpeaYvuekuuaKouWcsOS4u+aMiemSrlxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR5bqV54mM5pi+56S65ZKM5Zyw5Li75omL54mM5pu05pawXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeaYvuekuuW6leeJjOe7meaJgOacieeOqeWutu+8iOe/u+eJjOWKqOeUu++8iVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGNhcmRzIC0g5bqV54mM5pWw5o2uXG4gICAgICovXG4gICAgX3Nob3dCb3R0b21DYXJkc1RvQWxsOiBmdW5jdGlvbihjYXJkcykge1xuICAgICAgICBpZiAoIWNhcmRzIHx8IGNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDlupXniYzmmL7npLpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXJkcy5sZW5ndGggJiYgaSA8IHRoaXMuYm90dG9tX2NhcmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYXJkTm9kZSA9IHRoaXMuYm90dG9tX2NhcmRbaV1cbiAgICAgICAgICAgIGlmICghY2FyZE5vZGUpIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYXJkU2NyaXB0ID0gY2FyZE5vZGUuZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgaWYgKGNhcmRTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICBjYXJkU2NyaXB0LnNob3dDYXJkcyhjYXJkc1tpXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkemdmem7mOabtOaWsOWcsOS4u+eahOaJi+eJjO+8iOS4jeinpuWPkeWPkeeJjOWKqOeUu++8iVxuICAgICAqIOWPquWcqOWcsOS4u+aUtuWIsCBMQU5ETE9SRF9DQVJEUyDmtojmga/ml7bosIPnlKhcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOWcsOS4u+eahOWujOaVtOaJi+eJjO+8iOWQq+W6leeJjO+8iVxuICAgICAqL1xuICAgIF91cGRhdGVMYW5kbG9yZEhhbmRDYXJkczogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgaWYgKCFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g5o6S5bqP5omL54mMXG4gICAgICAgIHZhciBzb3J0ZWRDYXJkcyA9IHRoaXMuX3NvcnRDYXJkcyhjYXJkcylcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnoa7kv53miYvniYzlrrnlmajlrZjlnKhcbiAgICAgICAgdmFyIGNhcmRzUGFyZW50ID0gdGhpcy5jYXJkc19ub2RlXG4gICAgICAgIGlmICghY2FyZHNQYXJlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn4OPIFtfdXBkYXRlTGFuZGxvcmRIYW5kQ2FyZHNdIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5riF55CG5pen5omL54mM6IqC54K5XG4gICAgICAgIGNhcmRzUGFyZW50LnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOWIm+W7uuaJi+eJjOiKgueCue+8iOaXoOWKqOeUu++8iVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRlZENhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBzb3J0ZWRDYXJkc1tpXVxuICAgICAgICAgICAgdmFyIHRhcmdldFggPSB0aGlzLl9nZXRDYXJkWChpLCBzb3J0ZWRDYXJkcy5sZW5ndGgsIENhcmRMYXlvdXQuY2FyZFNwYWNpbmcpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYXJkID0gY2MuaW5zdGFudGlhdGUodGhpcy5jYXJkX3ByZWZhYilcbiAgICAgICAgICAgIGlmICghY2FyZCkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FyZC5zY2FsZSA9IENhcmRMYXlvdXQuY2FyZFNjYWxlXG4gICAgICAgICAgICBjYXJkLnBhcmVudCA9IGNhcmRzUGFyZW50ICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55So56Gu5a6a55qE5omL54mM5a655ZmoXG4gICAgICAgICAgICBjYXJkLnNldFBvc2l0aW9uKHRhcmdldFgsIENhcmRMYXlvdXQuY2FyZFkpXG4gICAgICAgICAgICBjYXJkLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIGNhcmQuekluZGV4ID0gaVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY2FyZENvbXAgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgIGlmIChjYXJkQ29tcCkge1xuICAgICAgICAgICAgICAgIGNhcmRDb21wLnNob3dDYXJkcyhjYXJkRGF0YSwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjee9rua4suafk+WTiOW4jO+8jOWFgeiuuOWQjue7rea4suafk1xuICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IEpTT04uc3RyaW5naWZ5KGNhcmRzKVxuICAgICAgICBcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+UiuOAkOWHuueJjOmfs+aViOezu+e7n+OAkeS9v+eUqOWunumZhemfs+aViOaWh+S7tlxuICAgIC8vIOmfs+aViOaWh+S7tuWRveWQjeinhOWIme+8mlxuICAgIC8vIC0g55S354mIOiBtX2NwX3t0eXBlfV97cmFua30ubXAzIOaIliBtX2NwX3t0eXBlfS5tcDNcbiAgICAvLyAtIOWls+eJiDogbV9jcF9udl97dHlwZX1fe3Jhbmt9Lm1wMyDmiJYgbV9jcF9udl97dHlwZX0ubXAzXG4gICAgLy8g5rOo5oSP77ya5aSn5bCP546LKHJhbms9MTQvMTUp5rKh5pyJ5a+55a2Q6Z+z5pWI77yM5Zug5Li65Lik5byg546L5piv546L54K45LiN5piv5a+55a2QXG4gICAgLy8gXG4gICAgLy8g8J+Up+OAkOmfs+aViOinhOWImeOAkVxuICAgIC8vIDEuIOmmluWHuu+8iGlzX25ld19yb3VuZD10cnVl77yJ77ya5pKt5pS+5a+55bqU54mM5Z6L55qE6Z+z5pWIXG4gICAgLy8gMi4g5Y6L54mM77yIaXNfbmV3X3JvdW5kPWZhbHNlLCBjYW5fYmVhdD10cnVl77yJ77yaXG4gICAgLy8gICAgLSDmnInlr7nlupTpn7PmlYjmlofku7bvvJrmkq3mlL7niYzlnovpn7PmlYhcbiAgICAvLyAgICAtIOaXoOWvueW6lOmfs+aViOaWh+S7tu+8iOWmguWvueWtkDE0LzE177yJ77ya5pKt5pS+XCLlpKfkvaBcIumfs+aViFxuICAgIC8vIDMuIOeCuOW8uS/njovngrjvvJrlp4vnu4jmkq3mlL7ngrjlvLkv546L54K46Z+z5pWIXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDwn5SKIOaSreaUvuWHuueJjOmfs+aViFxuICAgICAqIPCflKfjgJDlhajpnaLph43mnoTniYjjgJHkuKXmoLzpgbXlvqpcIuWkp+S9oFwi6Z+z5pWI5L2/55So6KeE5YiZXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmnI3liqHnq6/lub/mkq3nmoTmlbDmja5cbiAgICAgKiAgIC0gaGFuZF90eXBlOiDniYzlnovlkI3np7AgKHNpbmdsZS9wYWlyL3RyaXBsZS9zdHJhaWdodC9ib21iL3JvY2tldC9saWFuZHVpL3BsYW5lL3NhbmRhaXlpL3NhbmRhaWR1aS9zaWRhaWVyL3NpZGFpbGlhbmdkdWkpXG4gICAgICogICAtIHJhbms6IOS4u+eJjOeCueaVsCAo55So5LqO5Y2V5bygL+WvueWtkC/kuInlvKApXG4gICAgICogICAtIGdlbmRlcjogXCJtYWxlXCIgLyBcImZlbWFsZVwiXG4gICAgICogICAtIGlzX25ld19yb3VuZDog5piv5ZCm5piv5paw5Zue5ZCI77yI6aaW5Ye677yJXG4gICAgICogICAtIGNhbl9iZWF0OiDmmK/lkKbljovov4fkuIrlrrZcbiAgICAgKiBcbiAgICAgKiDjgJDmoLjlv4Pop4TliJnjgJFcIuWkp+S9oFwi6Z+z5pWIKG1fY3BfZGFuaSnnmoTkvb/nlKjlnLrmma/vvJpcbiAgICAgKiBcbiAgICAgKiDlnLrmma8xIC0g6aaW5Ye6KGlzX25ld19yb3VuZD10cnVlKe+8mlxuICAgICAqICAg4pyFIOWPquaSreaUvueJjOWei+mfs+aViFxuICAgICAqICAg4p2MIOemgeatouaSreaUvlwi5aSn5L2gXCJcbiAgICAgKiBcbiAgICAgKiDlnLrmma8yIC0g5Y6L54mMKGlzX25ld19yb3VuZD1mYWxzZSAmJiBjYW5fYmVhdD10cnVlKe+8mlxuICAgICAqICAg8J+OsiA3MCUg5qaC546H5pKt5pS+54mM5Z6L6Z+z5pWIXG4gICAgICogICDwn46yIDMwJSDmpoLnjofmkq3mlL5cIuWkp+S9oFwiXG4gICAgICogICDvvIjlpoLmnpzniYzlnovpn7PmlYjmlofku7bkuI3lrZjlnKjvvIwxMDAl5pKt5pS+XCLlpKfkvaBcIu+8iVxuICAgICAqIFxuICAgICAqIOWcuuaZrzMgLSDngrjlvLkv546L54K477yaXG4gICAgICogICDinIUg5aeL57uI5pKt5pS+54K45by5L+eOi+eCuOmfs+aViFxuICAgICAqL1xuICAgIF9wbGF5Q2FyZFNvdW5kOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghaXNvcGVuX3NvdW5kKSByZXR1cm5cblxuICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR5omT5Y2w5a6M5pW05pWw5o2u57uT5p6EXG5cbiAgICAgICAgdmFyIGhhbmRUeXBlID0gZGF0YS5oYW5kX3R5cGUgfHwgXCJcIlxuICAgICAgICB2YXIgZ2VuZGVyID0gZGF0YS5nZW5kZXIgfHwgXCJtYWxlXCJcbiAgICAgICAgdmFyIGlzTmV3Um91bmQgPSBkYXRhLmlzX25ld19yb3VuZCAhPT0gdW5kZWZpbmVkID8gZGF0YS5pc19uZXdfcm91bmQgOiB0cnVlXG4gICAgICAgIHZhciBjYW5CZWF0ID0gZGF0YS5jYW5fYmVhdCAhPT0gdW5kZWZpbmVkID8gZGF0YS5jYW5fYmVhdCA6IGZhbHNlXG5cbiAgICAgICAgLy8g8J+Up+OAkOaguOW/g+S/ruWkjeOAkeS8mOWFiOS7jiBjYXJkcyDkuK3mj5Dlj5bkuLvniYzlgLxcbiAgICAgICAgdmFyIHJhbmsgPSB0aGlzLl9leHRyYWN0TWFpblJhbmsoZGF0YSlcbiAgICAgICAgXG4gICAgICAgIC8vIPCflIrjgJDosIPor5Xml6Xlv5fjgJHor6bnu4bovpPlh7rpn7PmlYjmkq3mlL7lj4LmlbBcblxuICAgICAgICAvLyDwn5Sn44CQ5qOA5p+l44CR5piv5ZCm5piv54K45by55oiW546L54K477yI54m55q6K5aSE55CG77yJXG4gICAgICAgIHZhciB0eXBlID0gKGhhbmRUeXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgdmFyIGlzQm9tYiA9IHR5cGUgPT09IFwiYm9tYlwiIHx8IHR5cGUgPT09IFwiemhhZGFuXCIgfHwgdHlwZSA9PT0gXCLngrjlvLlcIlxuICAgICAgICB2YXIgaXNSb2NrZXQgPSB0eXBlID09PSBcInJvY2tldFwiIHx8IHR5cGUgPT09IFwid2FuZ3poYVwiIHx8IHR5cGUgPT09IFwi546L54K4XCJcbiAgICAgICAgXG4gICAgICAgIC8vIOeCuOW8ueWSjOeOi+eCuOWni+e7iOaSreaUvuWvueW6lOmfs+aViFxuICAgICAgICBpZiAoaXNCb21iIHx8IGlzUm9ja2V0KSB7XG4gICAgICAgICAgICB2YXIgc291bmROYW1lID0gdGhpcy5fZ2V0Q2FyZFR5cGVTb3VuZChoYW5kVHlwZSwgcmFuaywgZ2VuZGVyKVxuICAgICAgICAgICAgaWYgKHNvdW5kTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChzb3VuZE5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDmoLjlv4PjgJHojrflj5bniYzlnovpn7PmlYhcbiAgICAgICAgdmFyIGNhcmRTb3VuZCA9IHRoaXMuX2dldENhcmRUeXBlU291bmQoaGFuZFR5cGUsIHJhbmssIGdlbmRlcilcbiAgICAgICAgdmFyIHByZWZpeCA9IGdlbmRlciA9PT0gXCJmZW1hbGVcIiA/IFwibV9jcF9udl9cIiA6IFwibV9jcF9cIlxuICAgICAgICB2YXIgZGFuaVNvdW5kID0gcHJlZml4ICsgXCJkYW5pXCJcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmo4Dmn6XjgJHniYzlnovmmK/lkKbmnInlr7nlupTnmoTpn7PmlYjmlofku7ZcbiAgICAgICAgdmFyIGhhc1NwZWNpZmljU291bmQgPSB0aGlzLl9oYXNTcGVjaWZpY0NhcmRTb3VuZChoYW5kVHlwZSwgcmFuaylcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5qC45b+D5L+u5aSN44CR5q2j56Gu55qEXCLlpKfkvaBcIuaSreaUvumAu+i+kVxuICAgICAgICAvLyBcbiAgICAgICAgLy8g6KeE5YiZ6K+05piO77yaXG4gICAgICAgIC8vIDEuIOmmluWHuihpc19uZXdfcm91bmQ9dHJ1ZSnvvJrlj6rmkq3mlL7niYzlnovpn7PmlYjvvIznpoHmraJcIuWkp+S9oFwiXG4gICAgICAgIC8vIDIuIOWOi+eJjChpc19uZXdfcm91bmQ9ZmFsc2UgJiYgY2FuX2JlYXQ9dHJ1ZSnvvJrpmo/mnLrmkq3mlL7vvIw3MCXniYzlnovpn7PmlYjvvIwzMCVcIuWkp+S9oFwiXG4gICAgICAgIC8vIDMuIOWOi+eJjOS9humfs+aViOaWh+S7tue8uuWkse+8muaSreaUvlwi5aSn5L2gXCJcbiAgICAgICAgXG4gICAgICAgIGlmIChpc05ld1JvdW5kKSB7XG4gICAgICAgICAgICAvLyDinIXjgJDlnLrmma8x44CR6aaW5Ye677ya5Y+q5pKt5pS+54mM5Z6L6Z+z5pWI77yM56aB5q2iXCLlpKfkvaBcIlxuICAgICAgICAgICAgaWYgKGNhcmRTb3VuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChjYXJkU291bmQpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOmmluWHuuS9huayoeacieWvueW6lOmfs+aViOaWh+S7tu+8iOS4jeW6lOivpeWPkeeUn++8jOS9huWuieWFqOWkhOeQhu+8iVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCflIogW19wbGF5Q2FyZFNvdW5kXSDimqDvuI8g6aaW5Ye65L2G5peg5a+55bqU6Z+z5pWI5paH5Lu2OiBcIiArIGhhbmRUeXBlICsgXCIsIHJhbms9XCIgKyByYW5rKVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDph43opoHjgJHpppblh7rkuI3mkq3mlL5cIuWkp+S9oFwi77yM6Z2Z6buY6Lez6L+HXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY2FuQmVhdCkge1xuICAgICAgICAgICAgLy8g4pyF44CQ5Zy65pmvMuOAkeWOi+eJjOWcuuaZr++8mumaj+acuuaSreaUvu+8iDcwJeeJjOWei++8jDMwJeWkp+S9oO+8iVxuICAgICAgICAgICAgaWYgKGhhc1NwZWNpZmljU291bmQgJiYgY2FyZFNvdW5kKSB7XG4gICAgICAgICAgICAgICAgLy8g6ZqP5py66YCJ5oup77yaNzAl54mM5Z6L77yMMzAl5aSn5L2gXG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbVZhbHVlID0gTWF0aC5yYW5kb20oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyYW5kb21WYWx1ZSA8IDAuNykge1xuICAgICAgICAgICAgICAgICAgICAvLyA3MCUg5pKt5pS+54mM5Z6L6Z+z5pWIXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChjYXJkU291bmQpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gMzAlIOaSreaUvlwi5aSn5L2gXCJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KGRhbmlTb3VuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOmfs+aViOaWh+S7tue8uuWkse+8jOaSreaUvlwi5aSn5L2gXCJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3QoZGFuaVNvdW5kKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g4pyF44CQ5Zy65pmvM+OAkeWOi+eJjOS9hmNhbl9iZWF0PWZhbHNl77yI5LiN5bqU6K+l5Y+R55Sf77yM5L2G5a6J5YWo5aSE55CG77yJXG4gICAgICAgICAgICAvLyDov5nnp43mg4XlhrXnkIborrrkuIrkuI3lupTor6Xlh7rnjrDvvIzlm6DkuLrmnI3liqHnq6/lj6rlnKjmiJDlip/ljovniYzml7borr7nva5jYW5fYmVhdD10cnVlXG4gICAgICAgICAgICBpZiAoY2FyZFNvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KGNhcmRTb3VuZClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX3BsYXlDYXJkU291bmRdIOKaoO+4jyDlvILluLjlnLrmma/vvJrljovniYzkvYZjYW5fYmVhdD1mYWxzZeS4lOaXoOmfs+aViFwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XniYzlnovmmK/lkKbmnInlr7nlupTnmoTpn7PmlYjmlofku7ZcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5aKe5Yqg5pu05aSa54mM5Z6L5pSv5oyB77yM56Gu5L+d6KaG55uW5pyN5Yqh56uv5omA5pyJ54mM5Z6L5ZCN56ewXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhhbmRUeXBlIC0g54mM5Z6L5ZCN56ewXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJhbmsgLSDkuLvniYzngrnmlbBcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0g5piv5ZCm5pyJ5a+55bqU6Z+z5pWI5paH5Lu2XG4gICAgICovXG4gICAgX2hhc1NwZWNpZmljQ2FyZFNvdW5kOiBmdW5jdGlvbihoYW5kVHlwZSwgcmFuaykge1xuICAgICAgICB2YXIgdHlwZSA9IChoYW5kVHlwZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHZhciBzb3VuZEluZGV4ID0gdGhpcy5fcmFua1RvU291bmRJbmRleChyYW5rKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOWNleW8oO+8muaciTEtMTXnmoTpn7PmlYjmlofku7ZcbiAgICAgICAgLy8g5pyN5Yqh56uv5Y+R6YCBOiBcIuWNleW8oFwiXG4gICAgICAgIGlmICh0eXBlID09PSBcInNpbmdsZVwiIHx8IHR5cGUgPT09IFwic29sb1wiIHx8IHR5cGUuaW5kZXhPZihcIuWNleW8oFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBoYXNTb3VuZCA9IHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDE1XG4gICAgICAgICAgICByZXR1cm4gaGFzU291bmRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5a+55a2Q77ya5Y+q5pyJMS0xM+eahOmfs+aViOaWh+S7tu+8iOayoeacieWvueWtkDE0LzE177yM5Zug5Li65aSn546L5bCP546L5rKh5pyJ5a+55a2Q6Z+z5pWI77yJXG4gICAgICAgIC8vIOacjeWKoeerr+WPkemAgTogXCLlr7nlrZBcIlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJwYWlyXCIgfHwgdHlwZSA9PT0gXCJkb3VibGVcIiB8fCB0eXBlLmluZGV4T2YoXCLlr7nlrZBcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB2YXIgaGFzU291bmQgPSBzb3VuZEluZGV4ID49IDEgJiYgc291bmRJbmRleCA8PSAxM1xuICAgICAgICAgICAgcmV0dXJuIGhhc1NvdW5kXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOS4ieW8oO+8muWPquaciTEtMTPnmoTpn7PmlYjmlofku7ZcbiAgICAgICAgLy8g5pyN5Yqh56uv5Y+R6YCBOiBcIuS4ieW8oFwiXG4gICAgICAgIGlmICh0eXBlID09PSBcInRyaXBsZVwiIHx8IHR5cGUgPT09IFwidGhyZWVcIiB8fCB0eXBlID09PSBcInRyaW9cIiB8fCB0eXBlLmluZGV4T2YoXCLkuInlvKBcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB2YXIgaGFzU291bmQgPSBzb3VuZEluZGV4ID49IDEgJiYgc291bmRJbmRleCA8PSAxM1xuICAgICAgICAgICAgcmV0dXJuIGhhc1NvdW5kXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOeJueauiueJjOWei+mDveacieWvueW6lOmfs+aViFxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi6L+e5a+5XCIsIFwi6aG65a2QXCIsIFwi6aOe5py6XCIsIFwi6aOe5py65bim5Y2VXCIsIFwi6aOe5py65bim5a+5XCIsIFwi5LiJ5bim5LiAXCIsIFwi5LiJ5bim5LqMXCIsIFwi5Zub5bim5LqMXCIsIFwi5Zub5bim5Lik5a+5XCIsIFwi54K45by5XCIsIFwi546L54K4XCJcbiAgICAgICAgdmFyIHNwZWNpYWxUeXBlcyA9IFtcbiAgICAgICAgICAgIC8vIOiLseaWh+WQjeensFxuICAgICAgICAgICAgXCJsaWFuZHVpXCIsIFwic3RyYWlnaHRcIiwgXCJwbGFuZVwiLCBcImZlaWppXCIsXG4gICAgICAgICAgICBcInNhbmRhaXlpXCIsIFwic2FuZGFpZHVpXCIsIFwic2lkYWllclwiLCBcInNpZGFpbGlhbmdkdWlcIixcbiAgICAgICAgICAgIFwiYm9tYlwiLCBcInpoYWRhblwiLCBcInJvY2tldFwiLCBcIndhbmd6aGFcIixcbiAgICAgICAgICAgIC8vIOS4reaWh+WQjeensO+8iOacjeWKoeerr+WPkemAgeeahOWQjeensO+8iVxuICAgICAgICAgICAgXCLov57lr7lcIiwgXCLpobrlrZBcIiwgXCLpo57mnLpcIiwgXCLkuInluKbkuIBcIiwgXCLkuInluKbkuoxcIixcbiAgICAgICAgICAgIFwi5Zub5bim5LqMXCIsIFwi5Zub5bim5Lik5a+5XCIsIFwi54K45by5XCIsIFwi546L54K4XCJcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGVjaWFsVHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlLmluZGV4T2Yoc3BlY2lhbFR5cGVzW2ldKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaguOW/g+S/ruWkjeOAkeS7juaVsOaNruS4reaPkOWPluS4u+eJjOeCueaVsFxuICAgICAqIFxuICAgICAqIOS8mOWFiOe6p++8mlxuICAgICAqIDEuIOacjeWKoeerr+S8oOmAkueahCByYW5r77yI5aaC5p6c5pyJ5pWI77yJXG4gICAgICogMi4g5LuOIGNhcmRzIOaVsOe7hOS4reaPkOWPlu+8iOagueaNrueJjOWei++8iVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g5pyN5Yqh56uv5bm/5pKt55qE5pWw5o2uXG4gICAgICogQHJldHVybnMge051bWJlcn0g5Li754mM54K55pWw77yI5pyN5Yqh56uvIHJhbmsg5qC85byP77yaMy0xN++8iVxuICAgICAqL1xuICAgIF9leHRyYWN0TWFpblJhbms6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8g5LyY5YWI5L2/55So5pyN5Yqh56uv5Lyg6YCS55qEIHJhbmtcbiAgICAgICAgaWYgKGRhdGEucmFuayAmJiBkYXRhLnJhbmsgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS5yYW5rXG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzmnI3liqHnq68gcmFuayDml6DmlYjvvIzku44gY2FyZHMg5Lit5o+Q5Y+WXG4gICAgICAgIHZhciBjYXJkcyA9IGRhdGEuY2FyZHMgfHwgW11cbiAgICAgICAgdmFyIGhhbmRUeXBlID0gKGRhdGEuaGFuZF90eXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBpZiAoY2FyZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZXh0cmFjdE1haW5SYW5rXSBjYXJkc+aVsOe7hOS4uuepuu+8jOaXoOazleaPkOWPlnJhbmtcIilcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cblxuICAgICAgICAvLyDlr7kgY2FyZHMg6L+b6KGM5o6S5bqP77yI5LuO5aSn5Yiw5bCP77yJXG4gICAgICAgIHZhciBzb3J0ZWRDYXJkcyA9IGNhcmRzLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gKGIucmFuayB8fCAwKSAtIChhLnJhbmsgfHwgMClcbiAgICAgICAgfSlcblxuXG4gICAgICAgIC8vIOagueaNrueJjOWei+aPkOWPluS4u+eJjFxuICAgICAgICAvLyDljZXlvKBcbiAgICAgICAgaWYgKGhhbmRUeXBlLmluZGV4T2YoXCJzaW5nbGVcIikgIT09IC0xIHx8IGhhbmRUeXBlLmluZGV4T2YoXCLljZXlvKBcIikgIT09IC0xKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHRoaXMuX2V4dHJhY3RDYXJkUmFuayhzb3J0ZWRDYXJkc1swXSlcbiAgICAgICAgICAgIHJldHVybiByYW5rXG4gICAgICAgIH1cblxuICAgICAgICAvLyDlr7nlrZAgLSDlj5bku7vmhI/kuIDlvKDnmoRyYW5r77yI5a6D5Lus55u45ZCM77yJXG4gICAgICAgIGlmIChoYW5kVHlwZS5pbmRleE9mKFwicGFpclwiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcIuWvueWtkFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gdGhpcy5fZXh0cmFjdENhcmRSYW5rKHNvcnRlZENhcmRzWzBdKVxuICAgICAgICAgICAgcmV0dXJuIHJhbmtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOS4ieW8oCAtIOWPluS4ieW8oOS4reS7u+aEj+S4gOW8oOeahHJhbmtcbiAgICAgICAgaWYgKGhhbmRUeXBlLmluZGV4T2YoXCJ0cmlwbGVcIikgIT09IC0xIHx8IGhhbmRUeXBlLmluZGV4T2YoXCLkuInlvKBcIikgIT09IC0xIHx8IFxuICAgICAgICAgICAgaGFuZFR5cGUuaW5kZXhPZihcInRyaW9cIikgIT09IC0xIHx8IGhhbmRUeXBlLmluZGV4T2YoXCJ0aHJlZVwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gdGhpcy5fZXh0cmFjdENhcmRSYW5rKHNvcnRlZENhcmRzWzBdKVxuICAgICAgICAgICAgcmV0dXJuIHJhbmtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOS4ieW4puS4gC/kuInluKbkuowgLSDlj5bmnIDlpKfnmoTkuInlvKBcbiAgICAgICAgaWYgKGhhbmRUeXBlLmluZGV4T2YoXCJzYW5kYWl5aVwiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcIuS4ieW4puS4gFwiKSAhPT0gLTEgfHxcbiAgICAgICAgICAgIGhhbmRUeXBlLmluZGV4T2YoXCJzYW5kYWlkdWlcIikgIT09IC0xIHx8IGhhbmRUeXBlLmluZGV4T2YoXCLkuInluKbkuoxcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyDnu5/orqHmr4/kuKpyYW5r5Ye6546w55qE5qyh5pWwXG4gICAgICAgICAgICB2YXIgY291bnRzID0ge31cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IGNhcmRzW2ldLnJhbmtcbiAgICAgICAgICAgICAgICBjb3VudHNbcl0gPSAoY291bnRzW3JdIHx8IDApICsgMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5om+5Yiw5Ye6546w5qyh5pWw5pyA5aSa55qEcmFua1xuICAgICAgICAgICAgdmFyIG1heENvdW50ID0gMFxuICAgICAgICAgICAgdmFyIG1haW5SYW5rID0gMFxuICAgICAgICAgICAgZm9yICh2YXIgciBpbiBjb3VudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRzW3JdID49IDMgJiYgY291bnRzW3JdID4gbWF4Q291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4Q291bnQgPSBjb3VudHNbcl1cbiAgICAgICAgICAgICAgICAgICAgbWFpblJhbmsgPSBwYXJzZUludChyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtYWluUmFua1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YW25LuW54mM5Z6LIC0g5Y+W5pyA5aSn55qE54mMXG4gICAgICAgIHZhciByYW5rID0gdGhpcy5fZXh0cmFjdENhcmRSYW5rKHNvcnRlZENhcmRzWzBdKVxuICAgICAgICByZXR1cm4gcmFua1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ6L6F5Yqp44CR5LuO5Y2V5LiqY2FyZOWvueixoeS4reaPkOWPlnJhbmtcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FyZCAtIOWNoeeJjOWvueixoVxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IHJhbmvlgLxcbiAgICAgKi9cbiAgICBfZXh0cmFjdENhcmRSYW5rOiBmdW5jdGlvbihjYXJkKSB7XG4gICAgICAgIGlmICghY2FyZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX2V4dHJhY3RDYXJkUmFua10gY2FyZOS4uuepulwiKVxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWwneivleWQhOenjeWPr+iDveeahOWtl+autVxuICAgICAgICBpZiAoY2FyZC5yYW5rICE9PSB1bmRlZmluZWQgJiYgY2FyZC5yYW5rID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcihjYXJkLnJhbmspXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhcmQudmFsdWUgIT09IHVuZGVmaW5lZCAmJiBjYXJkLnZhbHVlID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcihjYXJkLnZhbHVlKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYXJkLmxvZ2ljX3ZhbHVlICE9PSB1bmRlZmluZWQgJiYgY2FyZC5sb2dpY192YWx1ZSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIoY2FyZC5sb2dpY192YWx1ZSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FyZC5jYXJkX2RhdGEgJiYgY2FyZC5jYXJkX2RhdGEucmFuayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQuY2FyZF9kYXRhLnJhbmspXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZXh0cmFjdENhcmRSYW5rXSDml6Dms5Xmj5Dlj5ZyYW5r77yMY2FyZDpcIiwgSlNPTi5zdHJpbmdpZnkoY2FyZCkpXG4gICAgICAgIHJldHVybiAwXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmoLjlv4Pkv67lpI3jgJHmnI3liqHnq68gcmFuayDovazmjaLkuLrpn7PmlYjmlofku7bnvJblj7dcbiAgICAgKiBcbiAgICAgKiDmnI3liqHnq68gcmFuayDlrprkuYnvvJpcbiAgICAgKiAtIDMtMTAgPSAzLTEwXG4gICAgICogLSBKPTExLCBRPTEyLCBLPTEzLCBBPTE0LCAyPTE1XG4gICAgICogLSDlsI/njos9MTYsIOWkp+eOiz0xN1xuICAgICAqIFxuICAgICAqIOmfs+aViOaWh+S7tue8luWPt++8mlxuICAgICAqIC0gMSA9IEFcbiAgICAgKiAtIDIgPSAyXG4gICAgICogLSAzLTEzID0gMy1LXG4gICAgICogLSAxNCA9IOWwj+eOi1xuICAgICAqIC0gMTUgPSDlpKfnjotcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmFuayAtIOacjeWKoeerr+eJjOmdouWAvCAoMy0xNylcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSDpn7PmlYjmlofku7bnvJblj7cgKDEtMTUp77yM5aaC5p6c5peg5rOV6L2s5o2i6L+U5ZueIDBcbiAgICAgKi9cbiAgICBfcmFua1RvU291bmRJbmRleDogZnVuY3Rpb24ocmFuaykge1xuICAgICAgICBpZiAocmFuayA9PT0gMTQpIHJldHVybiAxICAgLy8gQSDihpIgMVxuICAgICAgICBpZiAocmFuayA9PT0gMTUpIHJldHVybiAyICAgLy8gMiDihpIgMlxuICAgICAgICBpZiAocmFuayA+PSAzICYmIHJhbmsgPD0gMTMpIHJldHVybiByYW5rICAvLyAzLUsg55u05o6l5L2/55SoXG4gICAgICAgIGlmIChyYW5rID09PSAxNikgcmV0dXJuIDE0ICAvLyDlsI/njosg4oaSIDE0XG4gICAgICAgIGlmIChyYW5rID09PSAxNykgcmV0dXJuIDE1ICAvLyDlpKfnjosg4oaSIDE1XG4gICAgICAgIHJldHVybiAwICAvLyDml6DmlYhcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmoLnmja7niYzlnovojrflj5bpn7PmlYjlkI3np7BcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5L2/55SoIGluZGV4T2Yg5Yy56YWN5Lit5paH54mM5Z6L5ZCN56ew77yM56Gu5L+d5YW85a655pyN5Yqh56uv5Y+R6YCB55qE5Lit5paH5ZCN56ewXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhhbmRUeXBlIC0g54mM5Z6L5ZCN56ewXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJhbmsgLSDkuLvniYzngrnmlbAgKOacjeWKoeerr+WumuS5iTogMy0xNywgQT0xNCwgMj0xNSwg5bCP546LPTE2LCDlpKfnjos9MTcpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGdlbmRlciAtIOaAp+WIq1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IOmfs+aViOWQjeensO+8iOS4jeWQq+i3r+W+hOWSjOaJqeWxleWQje+8ie+8jOWmguaenOayoeacieWvueW6lOmfs+aViOi/lOWbnm51bGxcbiAgICAgKi9cbiAgICBfZ2V0Q2FyZFR5cGVTb3VuZDogZnVuY3Rpb24oaGFuZFR5cGUsIHJhbmssIGdlbmRlcikge1xuICAgICAgICB2YXIgdHlwZSA9IChoYW5kVHlwZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHZhciBwcmVmaXggPSBnZW5kZXIgPT09IFwiZmVtYWxlXCIgPyBcIm1fY3BfbnZfXCIgOiBcIm1fY3BfXCJcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlkIjms5XmgKfmoKHpqozjgJHmo4Dmn6VyYW5r5piv5ZCm5pyJ5pWIXG4gICAgICAgIGlmICghcmFuayB8fCByYW5rID09PSAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+UiiBbX2dldENhcmRUeXBlU291bmRdIOmdnuazlXJhbms6IFwiICsgcmFuayArIFwiLCBoYW5kVHlwZT1cIiArIGhhbmRUeXBlKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWwhuacjeWKoeerryByYW5rIOi9rOaNouS4uumfs+aViOaWh+S7tue8luWPt1xuICAgICAgICB2YXIgc291bmRJbmRleCA9IHRoaXMuX3JhbmtUb1NvdW5kSW5kZXgocmFuaylcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDljZXlvKDvvIjmlK/mjIHkuK3oi7HmlofvvIlcbiAgICAgICAgLy8g5pyN5Yqh56uv5Y+R6YCBOiBcIuWNleW8oFwiXG4gICAgICAgIC8vIOmfs+aViOaWh+S7tue8luWPt++8mjE9QSwgMj0yLCAzLTEzPTMtSywgMTQ95bCP546LLCAxNT3lpKfnjotcbiAgICAgICAgaWYgKHR5cGUgPT09IFwic2luZ2xlXCIgfHwgdHlwZSA9PT0gXCJzb2xvXCIgfHwgdHlwZS5pbmRleE9mKFwi5Y2V5bygXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgaWYgKHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDE1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIFwiZGFuemhhbmdfXCIgKyBzb3VuZEluZGV4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZ2V0Q2FyZFR5cGVTb3VuZF0g5Y2V5byg6Z+z5pWI57Si5byV5peg5pWIOiByYW5rPVwiICsgcmFuayArIFwiLCBzb3VuZEluZGV4PVwiICsgc291bmRJbmRleClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWvueWtkO+8iOaUr+aMgeS4reiLseaWh++8iVxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi5a+55a2QXCJcbiAgICAgICAgLy8g6Z+z5pWI5paH5Lu257yW5Y+377yaMT1BLCAyPTIsIDMtMTM9My1L77yI5rOo5oSP77ya5paH5Lu25Y+q5pyJMS0xM++8jOayoeaciTE0LzE177yJXG4gICAgICAgIGlmICh0eXBlID09PSBcInBhaXJcIiB8fCB0eXBlID09PSBcImRvdWJsZVwiIHx8IHR5cGUuaW5kZXhPZihcIuWvueWtkFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGlmIChzb3VuZEluZGV4ID49IDEgJiYgc291bmRJbmRleCA8PSAxMykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBcImR1aXppX1wiICsgc291bmRJbmRleFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX2dldENhcmRUeXBlU291bmRdIOWvueWtkOmfs+aViOaWh+S7tuS4jeWtmOWcqDogcmFuaz1cIiArIHJhbmsgKyBcIiwgc291bmRJbmRleD1cIiArIHNvdW5kSW5kZXgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDkuInlvKDvvIjmlK/mjIHkuK3oi7HmlofvvIlcbiAgICAgICAgLy8g5pyN5Yqh56uv5Y+R6YCBOiBcIuS4ieW8oFwiXG4gICAgICAgIC8vIOmfs+aViOaWh+S7tue8luWPt++8mjE9QSwgMj0yLCAzLTEzPTMtS++8iOazqOaEj++8muaWh+S7tuWPquaciTEtMTPvvIlcbiAgICAgICAgaWYgKHR5cGUgPT09IFwidHJpcGxlXCIgfHwgdHlwZSA9PT0gXCJ0aHJlZVwiIHx8IHR5cGUgPT09IFwidHJpb1wiIHx8IHR5cGUuaW5kZXhPZihcIuS4ieW8oFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGlmIChzb3VuZEluZGV4ID49IDEgJiYgc291bmRJbmRleCA8PSAxMykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBcInNhbmdlX1wiICsgc291bmRJbmRleFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX2dldENhcmRUeXBlU291bmRdIOS4ieW8oOmfs+aViOaWh+S7tuS4jeWtmOWcqDogcmFuaz1cIiArIHJhbmsgKyBcIiwgc291bmRJbmRleD1cIiArIHNvdW5kSW5kZXgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR54m55q6K54mM5Z6L5pig5bCE6KGo77yI5pSv5oyB5Lit6Iux5paH77yJXG4gICAgICAgIHZhciBzcGVjaWFsVHlwZXMgPSB7XG4gICAgICAgICAgICAvLyDoi7HmloflkI3np7BcbiAgICAgICAgICAgIFwibGlhbmR1aVwiOiBcImxpYW5kdWlcIiwgICAgICAgICAgIC8vIOi/nuWvuVxuICAgICAgICAgICAgXCJzdHJhaWdodFwiOiBcInNodW56aVwiLCAgICAgICAgICAgLy8g6aG65a2QXG4gICAgICAgICAgICBcInBsYW5lXCI6IFwiZmVpamlcIiwgICAgICAgICAgICAgICAvLyDpo57mnLpcbiAgICAgICAgICAgIFwiZmVpamlcIjogXCJmZWlqaVwiLCAgICAgICAgICAgICAgIC8vIOmjnuaculxuICAgICAgICAgICAgXCJzYW5kYWl5aVwiOiBcInNhbmRhaXlpXCIsICAgICAgICAgLy8g5LiJ5bim5LiAXG4gICAgICAgICAgICBcInNhbmRhaWR1aVwiOiBcInNhbmRhaWR1aVwiLCAgICAgICAvLyDkuInluKblr7lcbiAgICAgICAgICAgIFwic2lkYWllclwiOiBcInNpZGFpZXJcIiwgICAgICAgICAgIC8vIOWbm+W4puS6jFxuICAgICAgICAgICAgXCJzaWRhaWxpYW5nZHVpXCI6IFwic2lkYWlsaWFuZ2R1aVwiLCAvLyDlm5vluKbkuKTlr7lcbiAgICAgICAgICAgIFwiYm9tYlwiOiBcInpoYWRhblwiLCAgICAgICAgICAgICAgIC8vIOeCuOW8uVxuICAgICAgICAgICAgXCJ6aGFkYW5cIjogXCJ6aGFkYW5cIiwgICAgICAgICAgICAgLy8g54K45by5XG4gICAgICAgICAgICBcInJvY2tldFwiOiBcIndhbmd6aGFcIiwgICAgICAgICAgICAvLyDnjovngrhcbiAgICAgICAgICAgIFwid2FuZ3poYVwiOiBcIndhbmd6aGFcIiwgICAgICAgICAgIC8vIOeOi+eCuFxuICAgICAgICAgICAgLy8g5Lit5paH5ZCN56ew77yI5pyN5Yqh56uv5Y+R6YCB55qE5ZCN56ew77yJXG4gICAgICAgICAgICBcIui/nuWvuVwiOiBcImxpYW5kdWlcIixcbiAgICAgICAgICAgIFwi6aG65a2QXCI6IFwic2h1bnppXCIsXG4gICAgICAgICAgICBcIumjnuaculwiOiBcImZlaWppXCIsXG4gICAgICAgICAgICBcIumjnuacuuW4puWNlVwiOiBcImZlaWppXCIsXG4gICAgICAgICAgICBcIumjnuacuuW4puWvuVwiOiBcImZlaWppXCIsXG4gICAgICAgICAgICBcIuS4ieW4puS4gFwiOiBcInNhbmRhaXlpXCIsXG4gICAgICAgICAgICBcIuS4ieW4puS6jFwiOiBcInNhbmRhaWR1aVwiLFxuICAgICAgICAgICAgXCLlm5vluKbkuoxcIjogXCJzaWRhaWVyXCIsXG4gICAgICAgICAgICBcIuWbm+W4puS4pOWvuVwiOiBcInNpZGFpbGlhbmdkdWlcIixcbiAgICAgICAgICAgIFwi54K45by5XCI6IFwiemhhZGFuXCIsXG4gICAgICAgICAgICBcIueOi+eCuFwiOiBcIndhbmd6aGFcIlxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmn6Xmib7nibnmrorniYzlnotcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNwZWNpYWxUeXBlcykge1xuICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBzcGVjaWFsVHlwZXNba2V5XVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlpbPniYjngrjlvLnkvb/nlKggbV9jcF9udl96aGFkYW7vvIjlpoLmnpzlrZjlnKjvvInvvIzlkKbliJnkvb/nlKjnlLfniYhcbiAgICAgICAgICAgICAgICAvLyDms6jmhI/vvJrnm67liY0gbV9jcF9udl96aGFkYW4ubXAzIOS4jeWtmOWcqO+8jOaJgOS7peWls+eJiOS5n+S9v+eUqOeUt+eJiOeCuOW8uemfs+aViFxuICAgICAgICAgICAgICAgIGlmIChzdWZmaXggPT09IFwiemhhZGFuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YWI5bCd6K+V5aWz54mI54K45by56Z+z5pWIXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZW5kZXIgPT09IFwiZmVtYWxlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm1fY3BfemhhZGFuXCIgIC8vIOWls+eJiOaaguaXtuS9v+eUqOeUt+eJiOeCuOW8uemfs+aViO+8iOWboOS4um1fY3BfbnZfemhhZGFu5LiN5a2Y5Zyo77yJXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwibV9jcF96aGFkYW5cIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5aWz54mI546L54K45pyJ5Y2V54us6Z+z5pWIXG4gICAgICAgICAgICAgICAgaWYgKHN1ZmZpeCA9PT0gXCJ3YW5nemhhXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIFwid2FuZ3poYVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBzdWZmaXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pyq55+l54mM5Z6L77yM6L+U5ZuebnVsbFxuICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZ2V0Q2FyZFR5cGVTb3VuZF0g5pyq55+l54mM5Z6LOiBcIiArIHR5cGUpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5LiN5Ye66Z+z5pWI77yI6ZqP5py65pKt5pS+XCLkuI3opoFcIi9cIuimgeS4jei1t1wi77yJXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmnI3liqHnq6/lub/mkq3nmoTmlbDmja5cbiAgICAgKiAgIC0gZ2VuZGVyOiBcIm1hbGVcIiAvIFwiZmVtYWxlXCJcbiAgICAgKi9cbiAgICBfcGxheVBhc3NTb3VuZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIGdlbmRlciA9IGRhdGEuZ2VuZGVyIHx8IFwibWFsZVwiXG4gICAgICAgIFxuICAgICAgICAvLyDnlLfniYjvvJrpmo/mnLrmkq3mlL5cIuS4jeimgVwi5oiWXCLopoHkuI3otbdcIlxuICAgICAgICAvLyDmlofku7bvvJptX2NwX2J1eWFvLm1wMywgbV9jcF95YW9idXFpLm1wM1xuICAgICAgICAvLyDlpbPniYjvvJrpmo/mnLrmkq3mlL5cIuS4jeimgVwi5oiWXCLopoHkuI3otbdcIlxuICAgICAgICAvLyDmlofku7bvvJptX2NwX252X2J1eWFvLm1wMywgbV9udl95YW9idXFpLndhdlxuICAgICAgICBcbiAgICAgICAgdmFyIHNvdW5kc1xuICAgICAgICBpZiAoZ2VuZGVyID09PSBcImZlbWFsZVwiKSB7XG4gICAgICAgICAgICBzb3VuZHMgPSBbXCJtX2NwX252X2J1eWFvXCIsIFwibV9udl95YW9idXFpXCJdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VuZHMgPSBbXCJtX2NwX2J1eWFvXCIsIFwibV9jcF95YW9idXFpXCJdXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmaj+acuumAieaLqeS4gOS4qlxuICAgICAgICB2YXIgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VuZHMubGVuZ3RoKVxuICAgICAgICB2YXIgc291bmROYW1lID0gc291bmRzW3JhbmRvbUluZGV4XVxuXG4gICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChzb3VuZE5hbWUpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+6IOc5YipL+Wksei0pemfs+aViFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNXaW4gLSDmmK/lkKbog5zliKlcbiAgICAgKi9cbiAgICBfcGxheUdhbWVSZXN1bHRTb3VuZDogZnVuY3Rpb24oaXNXaW4pIHtcbiAgICAgICAgaWYgKCFpc29wZW5fc291bmQpIHJldHVyblxuXG4gICAgICAgIHZhciBzb3VuZE5hbWUgPSBpc1dpbiA/IFwibV95aW5nbGVcIiA6IFwibV9zaHVsZVwiXG4gICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChzb3VuZE5hbWUpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflIog5pi+56S65LiN5Ye65pWI5p6cXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFjY291bnRpZCAtIOeOqeWutklEXG4gICAgICovXG4gICAgX3Nob3dQYXNzRWZmZWN0OiBmdW5jdGlvbihhY2NvdW50aWQpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPluWvueW6lOeOqeWutueahOWHuueJjOWMuuWfn1xuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgIGlmICghZ2FtZVNjZW5lX3NjcmlwdCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIG91dENhcmRfbm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQuZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoYWNjb3VudGlkKVxuICAgICAgICBpZiAoIW91dENhcmRfbm9kZSkgcmV0dXJuXG5cbiAgICAgICAgLy8g5riF56m65Ye654mM5Yy65Z+fXG4gICAgICAgIG91dENhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuXG4gICAgICAgIC8vIOWIm+W7ulwi5LiN5Ye6XCLmloflrZfmmL7npLpcbiAgICAgICAgdmFyIHBhc3NOb2RlID0gbmV3IGNjLk5vZGUoXCJwYXNzX2xhYmVsXCIpXG4gICAgICAgIHZhciBsYWJlbCA9IHBhc3NOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gXCLkuI3lh7pcIlxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDI4XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAzNlxuICAgICAgICBwYXNzTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDmj4/ovrlcbiAgICAgICAgdmFyIG91dGxpbmUgPSBwYXNzTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMTAwLCA1MCwgMClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIHBhc3NOb2RlLnBhcmVudCA9IG91dENhcmRfbm9kZVxuICAgICAgICBwYXNzTm9kZS5zZXRQb3NpdGlvbigwLCAwKVxuXG4gICAgICAgIC8vIDLnp5LlkI7oh6rliqjmtojlpLFcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAocGFzc05vZGUgJiYgcGFzc05vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHBhc3NOb2RlLmRlc3Ryb3koKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCAyKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6I635Y+W54mM55qE5pi+56S65ZCN56ewXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNhcmQgLSDniYzmlbDmja4ge3N1aXQsIHJhbmt9XG4gICAgICogQHJldHVybnMge1N0cmluZ30g54mM55qE5Lit5paH5ZCN56ew77yM5aaCIFwi5aSn546LXCLjgIFcIuWwj+eOi1wi44CBXCLpu5HmoYNBXCIg562JXG4gICAgICovXG4gICAgX2dldENhcmREaXNwbGF5TmFtZTogZnVuY3Rpb24oY2FyZCkge1xuICAgICAgICBpZiAoIWNhcmQpIHJldHVybiBcIuacquefpeeJjFwiXG4gICAgICAgIFxuICAgICAgICB2YXIgc3VpdCA9IGNhcmQuc3VpdFxuICAgICAgICB2YXIgcmFuayA9IGNhcmQucmFua1xuICAgICAgICBcbiAgICAgICAgLy8g5aSn5bCP546LXG4gICAgICAgIGlmIChyYW5rID09PSAxNykgcmV0dXJuIFwi5aSn546LXCJcbiAgICAgICAgaWYgKHJhbmsgPT09IDE2KSByZXR1cm4gXCLlsI/njotcIlxuICAgICAgICBcbiAgICAgICAgLy8g6Iqx6Imy5ZCN56ewXG4gICAgICAgIHZhciBzdWl0TmFtZXMgPSB7IDA6IFwi6buR5qGDXCIsIDE6IFwi57qi5b+DXCIsIDI6IFwi5qKF6IqxXCIsIDM6IFwi5pa55Z2XXCIsIDQ6IFwiXCIgfVxuICAgICAgICB2YXIgc3VpdE5hbWUgPSBzdWl0TmFtZXNbc3VpdF0gfHwgXCJcIlxuICAgICAgICBcbiAgICAgICAgLy8g54mM6Z2i5ZCN56ewXG4gICAgICAgIHZhciByYW5rTmFtZXMgPSB7XG4gICAgICAgICAgICAzOiBcIjNcIiwgNDogXCI0XCIsIDU6IFwiNVwiLCA2OiBcIjZcIiwgNzogXCI3XCIsIDg6IFwiOFwiLCA5OiBcIjlcIixcbiAgICAgICAgICAgIDEwOiBcIjEwXCIsIDExOiBcIkpcIiwgMTI6IFwiUVwiLCAxMzogXCJLXCIsIDE0OiBcIkFcIiwgMTU6IFwiMlwiXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJhbmtOYW1lID0gcmFua05hbWVzW3JhbmtdIHx8IFN0cmluZyhyYW5rKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHN1aXROYW1lICsgcmFua05hbWVcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeWuouaIt+err+eJjOWei+mqjOivgVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkemqjOivgeeJjOWei+aYr+WQpuacieaViFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGNhcmRzIC0g6KaB6aqM6K+B55qE54mM5pWw5o2uIFt7c3VpdCwgcmFuaywgY29sb3J9LCAuLi5dXG4gICAgICogQHJldHVybnMge09iamVjdH0ge3ZhbGlkOiBib29sZWFuLCB0eXBlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZ31cbiAgICAgKi9cbiAgICBfdmFsaWRhdGVIYW5kVHlwZTogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgaWYgKCFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgdHlwZTogXCJcIiwgbWVzc2FnZTogXCLor7fpgInmi6nopoHlh7rnmoTniYxcIiB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY291bnQgPSBjYXJkcy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIC8vIOe7n+iuoeWQhOeCueaVsOeahOeJjOaVsOmHj1xuICAgICAgICB2YXIgcmFua0NvdW50cyA9IHt9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gY2FyZHNbaV0ucmFua1xuICAgICAgICAgICAgaWYgKCFyYW5rQ291bnRzW3JhbmtdKSB7XG4gICAgICAgICAgICAgICAgcmFua0NvdW50c1tyYW5rXSA9IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJhbmtDb3VudHNbcmFua10rK1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6I635Y+W54K55pWw5YiX6KGo77yI5o6S5bqP5ZCO77yJXG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKHJhbmtDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmlbDph4/nu5/orqFcbiAgICAgICAgdmFyIGNvdW50cyA9IE9iamVjdC52YWx1ZXMocmFua0NvdW50cylcbiAgICAgICAgdmFyIGZvdXJzID0gW10gIC8vIOWbm+W8oFxuICAgICAgICB2YXIgdGhyZWVzID0gW10gLy8g5LiJ5bygXG4gICAgICAgIHZhciBwYWlycyA9IFtdICAvLyDlr7nlrZBcbiAgICAgICAgdmFyIHNpbmdsZXMgPSBbXSAvLyDljZXlvKBcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIHJhbmsgaW4gcmFua0NvdW50cykge1xuICAgICAgICAgICAgdmFyIGMgPSByYW5rQ291bnRzW3JhbmtdXG4gICAgICAgICAgICBpZiAoYyA9PT0gNCkgZm91cnMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IDMpIHRocmVlcy5wdXNoKHBhcnNlSW50KHJhbmspKVxuICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gMikgcGFpcnMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IDEpIHNpbmdsZXMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEuIOeOi+eCuO+8iOWPjOeOi++8iVxuICAgICAgICBpZiAoY291bnQgPT09IDIgJiYgcmFua0NvdW50c1sxNl0gPT09IDEgJiYgcmFua0NvdW50c1sxN10gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIueOi+eCuFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIOWNleW8oFxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuWNleW8oFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMuIOWvueWtkFxuICAgICAgICBpZiAoY291bnQgPT09IDIgJiYgcGFpcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLlr7nlrZBcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiDkuInlvKBcbiAgICAgICAgaWYgKGNvdW50ID09PSAzICYmIHRocmVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW8oFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIOeCuOW8uVxuICAgICAgICBpZiAoY291bnQgPT09IDQgJiYgZm91cnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLngrjlvLlcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA2LiDkuInluKbkuIBcbiAgICAgICAgaWYgKGNvdW50ID09PSA0ICYmIHRocmVlcy5sZW5ndGggPT09IDEgJiYgc2luZ2xlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW4puS4gFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDcuIOS4ieW4puS6jFxuICAgICAgICBpZiAoY291bnQgPT09IDUgJiYgdGhyZWVzLmxlbmd0aCA9PT0gMSAmJiBwYWlycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW4puS6jFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDguIOWbm+W4puS6jO+8iOWNle+8iVxuICAgICAgICBpZiAoY291bnQgPT09IDYgJiYgZm91cnMubGVuZ3RoID09PSAxICYmIChzaW5nbGVzLmxlbmd0aCA9PT0gMiB8fCBwYWlycy5sZW5ndGggPT09IDEpKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLlm5vluKbkuoxcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA5LiDlm5vluKbkuKTlr7lcbiAgICAgICAgaWYgKGNvdW50ID09PSA4ICYmIGZvdXJzLmxlbmd0aCA9PT0gMSAmJiBwYWlycy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuWbm+W4puS4pOWvuVwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEwLiDpobrlrZDvvIjoh7PlsJE15byg6L+e57ut77yM5LiN5YyF5ZCrMuWSjOeOi++8iVxuICAgICAgICBpZiAoY291bnQgPj0gNSAmJiBzaW5nbGVzLmxlbmd0aCA9PT0gY291bnQpIHtcbiAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpui/nue7reS4lOS4jeWMheWQqzLlkoznjotcbiAgICAgICAgICAgIHZhciBpc1NlcXVlbnRpYWwgPSB0aGlzLl9pc1NlcXVlbnRpYWwocmFua3MpXG4gICAgICAgICAgICB2YXIgbm9Ud29Pckpva2VyID0gcmFua3MuZXZlcnkoZnVuY3Rpb24ocikgeyByZXR1cm4gciA8IDE1IH0pIC8vIHJhbmsgPCAxNSDooajnpLrkuI3mmK8y5ZKM546LXG4gICAgICAgICAgICBpZiAoaXNTZXF1ZW50aWFsICYmIG5vVHdvT3JKb2tlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIumhuuWtkFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDExLiDov57lr7nvvIjoh7PlsJEz5a+56L+e57ut77yJXG4gICAgICAgIGlmIChjb3VudCA+PSA2ICYmIGNvdW50ICUgMiA9PT0gMCAmJiBwYWlycy5sZW5ndGggPT09IGNvdW50IC8gMikge1xuICAgICAgICAgICAgdmFyIHBhaXJSYW5rcyA9IHBhaXJzLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgICAgIHZhciBpc1NlcXVlbnRpYWwgPSB0aGlzLl9pc1NlcXVlbnRpYWwocGFpclJhbmtzKVxuICAgICAgICAgICAgdmFyIG5vVHdvT3JKb2tlciA9IHBhaXJSYW5rcy5ldmVyeShmdW5jdGlvbihyKSB7IHJldHVybiByIDwgMTUgfSlcbiAgICAgICAgICAgIGlmIChpc1NlcXVlbnRpYWwgJiYgbm9Ud29Pckpva2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIHR5cGU6IFwi6L+e5a+5XCIsIG1lc3NhZ2U6IFwiXCIgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gMTIuIOmjnuacuu+8iOiHs+WwkTLkuKrov57nu63kuInlvKDvvIlcbiAgICAgICAgaWYgKHRocmVlcy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgdmFyIHRocmVlUmFua3MgPSB0aHJlZXMuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICAgICAgdmFyIGlzU2VxdWVudGlhbCA9IHRoaXMuX2lzU2VxdWVudGlhbCh0aHJlZVJhbmtzKVxuICAgICAgICAgICAgdmFyIG5vVHdvT3JKb2tlciA9IHRocmVlUmFua3MuZXZlcnkoZnVuY3Rpb24ocikgeyByZXR1cm4gciA8IDE1IH0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpc1NlcXVlbnRpYWwgJiYgbm9Ud29Pckpva2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVlQ291bnQgPSB0aHJlZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6aOe5py65LiN5bim57+F6IaAXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSB0aHJlZUNvdW50ICogMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLpo57mnLpcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOmjnuacuuW4puWNlVxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gdGhyZWVDb3VudCAqIDQgJiYgc2luZ2xlcy5sZW5ndGggPT09IHRocmVlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIHR5cGU6IFwi6aOe5py65bim5Y2VXCIsIG1lc3NhZ2U6IFwiXCIgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDpo57mnLrluKblr7lcbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IHRocmVlQ291bnQgKiA1ICYmIHBhaXJzLmxlbmd0aCA9PT0gdGhyZWVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLpo57mnLrluKblr7lcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5peg5pWI54mM5Z6LXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgdHlwZTogXCJcIiwgbWVzc2FnZTogXCLml6DmlYjnmoTniYzlnovvvIzor7fph43mlrDpgInmi6lcIiB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOajgOafpeeCueaVsOaYr+WQpui/nue7rVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHJhbmtzIC0g5o6S5bqP5ZCO55qE54K55pWw5pWw57uEXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IOaYr+WQpui/nue7rVxuICAgICAqL1xuICAgIF9pc1NlcXVlbnRpYWw6IGZ1bmN0aW9uKHJhbmtzKSB7XG4gICAgICAgIGlmICghcmFua3MgfHwgcmFua3MubGVuZ3RoIDwgMikgcmV0dXJuIHRydWVcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyYW5rc1tpXSAtIHJhbmtzW2ktMV0gIT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR57uT566X5by556qX57O757ufXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDwn4+GIOaYvuekuua4uOaIj+e7k+eul+W8ueeql1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g5pyN5Yqh56uv5bm/5pKt55qE57uT566X5pWw5o2uXG4gICAgICovXG4gICAgX3Nob3dHYW1lUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDjgJDnq57mioDlnLrjgJHmo4Dmn6XmmK/lkKbmmK/nq57mioDlnLrmqKHlvI9cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbXBldGl0aW9uIHx8IGRhdGEucm9vbV9jYXRlZ29yeSA9PT0gMikge1xuICAgICAgICAgICAgLy8g56ue5oqA5Zy65qih5byP5L2/55So54m55q6K55qE57uT566X6aG1XG4gICAgICAgICAgICB0aGlzLl9zaG93Q29tcGV0aXRpb25SZXN1bHRQb3B1cChkYXRhKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWIpOaWreW9k+WJjeeOqeWutuaYr+WQpuiDnOWIqVxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuICAgICAgICB2YXIgaXNXaW5uZXIgPSBmYWxzZVxuICAgICAgICB2YXIgbXlXaW5Hb2xkID0gMFxuICAgICAgICBcbiAgICAgICAgLy8g5LuOIHBsYXllcnMg5pWw57uE5Lit5om+5Yiw5b2T5YmN546p5a6255qE57uT5p6cXG4gICAgICAgIGlmIChkYXRhLnBsYXllcnMgJiYgZGF0YS5wbGF5ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyc1tpXVxuICAgICAgICAgICAgICAgIGlmIChTdHJpbmcocGxheWVyLnBsYXllcl9pZCkgPT09IFN0cmluZyhteVBsYXllcklkKSkge1xuICAgICAgICAgICAgICAgICAgICBpc1dpbm5lciA9IHBsYXllci5pc193aW5uZXJcbiAgICAgICAgICAgICAgICAgICAgbXlXaW5Hb2xkID0gcGxheWVyLndpbl9nb2xkXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5YW85a655pen54mI5pys77ya6YCa6L+HIHdpbm5lcl9pZCDliKTmlq1cbiAgICAgICAgICAgIGlzV2lubmVyID0gU3RyaW5nKGRhdGEud2lubmVyX2lkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpXG4gICAgICAgICAgICBpZiAoIWlzV2lubmVyICYmICFkYXRhLmlzX2xhbmRsb3JkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzTGFuZGxvcmQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLm1hc3Rlcl9hY2NvdW50aWQgPT09IG15UGxheWVySWRcbiAgICAgICAgICAgICAgICBpZiAoIWlzTGFuZGxvcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNXaW5uZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5pu05paw5pys5Zyw546p5a6255qE6YeR5biB5pWw6YePXG4gICAgICAgIGlmIChteWdsb2JhbC5wbGF5ZXJEYXRhICYmIG15V2luR29sZCAhPT0gMCkge1xuICAgICAgICAgICAgdmFyIG9sZEdvbGQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50IHx8IDBcbiAgICAgICAgICAgIHZhciBuZXdHb2xkID0gb2xkR29sZCArIG15V2luR29sZFxuICAgICAgICAgICAgLy8g56Gu5L+d6YeR5biB5LiN5Li66LSf5pWwXG4gICAgICAgICAgICBpZiAobmV3R29sZCA8IDApIHtcbiAgICAgICAgICAgICAgICBuZXdHb2xkID0gMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IG5ld0dvbGRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeabtOaWsOaJgOacieeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICBpZiAoZGF0YS5wbGF5ZXJzICYmIGRhdGEucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcnNbaV1cbiAgICAgICAgICAgICAgICB2YXIgcGxheWVySWQgPSBwbGF5ZXIucGxheWVyX2lkXG4gICAgICAgICAgICAgICAgdmFyIGdvbGRBZnRlciA9IHBsYXllci5nb2xkX2FmdGVyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWPquimgSBnb2xkQWZ0ZXIgPj0gMCDlsLHmm7TmlrDmmL7npLrvvIjljIXmi6wgMCDnmoTmg4XlhrXvvIlcbiAgICAgICAgICAgICAgICAvLyDmnI3liqHnq6/ov5Tlm57nmoQgZ29sZF9hZnRlciA+PSAwIOihqOekuuafpeivouWIsOS6huacieaViOaVsOaNrlxuICAgICAgICAgICAgICAgIGlmIChnb2xkQWZ0ZXIgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJHb2xkRGlzcGxheShwbGF5ZXJJZCwgZ29sZEFmdGVyKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOacjeWKoeerr+ayoeaciei/lOWbnuacieaViOeahCBnb2xkX2FmdGVy77yM5YiZ5pys5Zyw6K6h566XXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/meenjeaDheWGteS4i++8jOWPquabtOaWsOW9k+WJjeeOqeWutueahOmHkeW4gVxuICAgICAgICAgICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllcklkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpICYmIG15V2luR29sZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsR29sZCA9IG15Z2xvYmFsLnBsYXllckRhdGEuZ29iYWxfY291bnQgfHwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGxheWVyR29sZERpc3BsYXkocGxheWVySWQsIGxvY2FsR29sZClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pKt5pS+57uT5p6c6Z+z5pWIXG4gICAgICAgIHRoaXMuX3BsYXlHYW1lUmVzdWx0U291bmQoaXNXaW5uZXIpXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rnu5PnrpflvLnnqpdcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHRoaXMuX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cChkYXRhLCBpc1dpbm5lciwgbXlXaW5Hb2xkLCBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwiY29udGludWVcIikge1xuICAgICAgICAgICAgICAgIC8vIOe7p+e7rea4uOaIj++8muWPkemAgSByZWFkeSDor7fmsYJcbiAgICAgICAgICAgICAgICBzZWxmLl9jb250aW51ZUdhbWUoKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFwibG9iYnlcIikge1xuICAgICAgICAgICAgICAgIC8vIOi/lOWbnuWkp+WOhVxuICAgICAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn4+GIOWIm+W7uue7k+eul+W8ueeql1VJIC0g5qyi5LmQ5paX5Zyw5Li76auY57qn6aOO5qC8XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDnu5PnrpfmlbDmja5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzV2lubmVyIC0g5piv5ZCm6IOc5YipXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG15V2luR29sZCAtIOW9k+WJjeeOqeWutui+k+i1ouixhuWtkFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0g5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cDogZnVuY3Rpb24oZGF0YSwgaXNXaW5uZXIsIG15V2luR29sZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeaJvuWIsENhbnZhc+iKgueCueS9nOS4uuW8ueeql+eItuiKgueCuVxuICAgICAgICB2YXIgY2FudmFzID0gY2MuZmluZChcIkNhbnZhc1wiKSB8fCBjYy5maW5kKFwiVUlfUk9PVFwiKSB8fCB0aGlzLm5vZGUucGFyZW50XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+PhiBbX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cF0g5om+5LiN5YiwQ2FudmFz6IqC54K5XCIpXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLm5vZGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g6YGu572p5bGCID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKClcbiAgICAgICAgbWFza05vZGUubmFtZSA9IFwiR2FtZVJlc3VsdE1hc2tcIlxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgdmFyIG1hc2tTcHJpdGUgPSBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBtYXNrU3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgbWFza1Nwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0lNUExFXG4gICAgICAgIG1hc2tTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgIG1hc2tOb2RlLndpZHRoID0gd2luU2l6ZS53aWR0aCAqIDJcbiAgICAgICAgbWFza05vZGUuaGVpZ2h0ID0gd2luU2l6ZS5oZWlnaHQgKiAyXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBtYXNrTm9kZS5jb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDAsIDAsIDMwKSA6IG5ldyBjYy5Db2xvcigzMCwgMCwgMClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDBcbiAgICAgICAgbWFza05vZGUueCA9IDBcbiAgICAgICAgbWFza05vZGUueSA9IDBcbiAgICAgICAgbWFza05vZGUuekluZGV4ID0gOTk5ICAvLyDwn5Sn44CQ5L+u5aSN44CR6YGu572p5bGCekluZGV4XG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5reh5YWl5Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKG1hc2tOb2RlKS50bygwLjMsIHsgb3BhY2l0eTogMjU1IH0pLnN0YXJ0KClcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW8ueeql+WuueWZqCA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgcG9wdXBOb2RlID0gbmV3IGNjLk5vZGUoKVxuICAgICAgICBwb3B1cE5vZGUubmFtZSA9IFwiR2FtZVJlc3VsdFBvcHVwXCJcbiAgICAgICAgcG9wdXBOb2RlLnggPSAwXG4gICAgICAgIHBvcHVwTm9kZS55ID0gMFxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwICAvLyDwn5Sn44CQ5L+u5aSN44CR5by556qX5bGCekluZGV4XG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+WwuuWvuO+8iDcwJeWuve+8jDc1JemrmO+8iVxuICAgICAgICB2YXIgcG9wdXBXaWR0aCA9IE1hdGgubWluKHdpblNpemUud2lkdGggKiAwLjcsIDgwMClcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gTWF0aC5taW4od2luU2l6ZS5oZWlnaHQgKiAwLjc1LCA1NTApXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDkuLvog4zmma8gLSDmuJDlj5jmlYjmnpwgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGJnTm9kZSA9IHNlbGYuX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZChwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgaXNXaW5uZXIpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOmHkei+ueaPj+i+uSA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgYm9yZGVyTm9kZSA9IHNlbGYuX2NyZWF0ZUdvbGRlbkJvcmRlcihwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgaXNXaW5uZXIpXG4gICAgICAgIGJvcmRlck5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnspLlrZDnibnmlYjlsYIgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGVmZmVjdExheWVyID0gbmV3IGNjLk5vZGUoXCJFZmZlY3RMYXllclwiKVxuICAgICAgICBlZmZlY3RMYXllci5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDnOWIqeeykuWtkOeJueaViFxuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX2NyZWF0ZVZpY3RvcnlQYXJ0aWNsZXMoZWZmZWN0TGF5ZXIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5fY3JlYXRlRGVmZWF0UGFydGljbGVzKGVmZmVjdExheWVyLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g6aG26YOoIEJhbm5lciA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgYmFubmVyWSA9IHBvcHVwSGVpZ2h0IC8gMiAtIDYwXG4gICAgICAgIHZhciBiYW5uZXJOb2RlID0gc2VsZi5fY3JlYXRlUmVzdWx0QmFubmVyKGlzV2lubmVyLCBwb3B1cFdpZHRoKVxuICAgICAgICBiYW5uZXJOb2RlLnkgPSBiYW5uZXJZXG4gICAgICAgIGJhbm5lck5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlj7PkvqflgI3mlbDor6bmg4XljaEgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGRldGFpbFggPSBwb3B1cFdpZHRoIC8gMiAtIDEzMFxuICAgICAgICB2YXIgZGV0YWlsWSA9IDIwXG4gICAgICAgIHZhciBkZXRhaWxOb2RlID0gc2VsZi5fY3JlYXRlTXVsdGlwbGllckRldGFpbENhcmQoZGF0YSwgaXNXaW5uZXIpXG4gICAgICAgIGRldGFpbE5vZGUueCA9IGRldGFpbFhcbiAgICAgICAgZGV0YWlsTm9kZS55ID0gZGV0YWlsWVxuICAgICAgICBkZXRhaWxOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5Lit6Ze0546p5a6257uT5p6c5YiX6KGoID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBsaXN0V2lkdGggPSBwb3B1cFdpZHRoICogMC41NVxuICAgICAgICB2YXIgbGlzdFggPSAtcG9wdXBXaWR0aCAvIDIgKyBsaXN0V2lkdGggLyAyICsgNTBcbiAgICAgICAgdmFyIGxpc3RZID0gLTIwXG4gICAgICAgIHZhciBwbGF5ZXJMaXN0Tm9kZSA9IHNlbGYuX2NyZWF0ZVBsYXllclJlc3VsdExpc3QoZGF0YSwgaXNXaW5uZXIsIG15V2luR29sZCwgbGlzdFdpZHRoKVxuICAgICAgICBwbGF5ZXJMaXN0Tm9kZS54ID0gbGlzdFhcbiAgICAgICAgcGxheWVyTGlzdE5vZGUueSA9IGxpc3RZXG4gICAgICAgIHBsYXllckxpc3ROb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5bqV6YOo5oyJ6ZKu5Yy65Z+fID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBidG5ZID0gLXBvcHVwSGVpZ2h0IC8gMiArIDYwXG4gICAgICAgIHZhciBidXR0b25BcmVhID0gc2VsZi5fY3JlYXRlQnV0dG9uQXJlYShpc1dpbm5lciwgZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxmLl9jbG9zZUdhbWVSZXN1bHRQb3B1cChwb3B1cE5vZGUsIG1hc2tOb2RlKVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhhY3Rpb24pXG4gICAgICAgIH0pXG4gICAgICAgIGJ1dHRvbkFyZWEueSA9IGJ0bllcbiAgICAgICAgYnV0dG9uQXJlYS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW8ueWHuuWKqOeUuyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4zNSwgeyBzY2FsZTogMSwgb3BhY2l0eTogMjU1IH0sIHsgZWFzaW5nOiAnYmFja091dCcgfSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIOinpuWPkeaVsOWtl+a7muWKqOWKqOeUu1xuICAgICAgICAgICAgICAgIHNlbGYuX3N0YXJ0TnVtYmVyQW5pbWF0aW9ucyhwb3B1cE5vZGUsIGRhdGEsIG15V2luR29sZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y5byV55SoXG4gICAgICAgIHRoaXMuX2dhbWVSZXN1bHRQb3B1cCA9IHBvcHVwTm9kZVxuICAgICAgICB0aGlzLl9nYW1lUmVzdWx0TWFzayA9IG1hc2tOb2RlXG4gICAgICAgIHRoaXMuX3Jlc3VsdEVmZmVjdExheWVyID0gZWZmZWN0TGF5ZXJcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+OqCDnu5PnrpflvLnnqpfop4bop4nnu4Tku7YgLSDpq5jnuqfmlYjmnpxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCfjqgg5Yib5bu65riQ5Y+Y6IOM5pmvXG4gICAgICovXG4gICAgX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiR3JhZGllbnRCZ1wiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBcbiAgICAgICAgLy8g5riQ5Y+Y6ImyXG4gICAgICAgIHZhciB0b3BDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDQwLCAzMCwgODAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMzAsIDMwLCA0MCwgMjU1KVxuICAgICAgICB2YXIgYm90dG9tQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyMCwgMTUsIDUwLCAyNTUpIDogbmV3IGNjLkNvbG9yKDIwLCAyMCwgMzAsIDI1NSlcbiAgICAgICAgXG4gICAgICAgIC8vIOe7mOWItua4kOWPmOefqeW9ou+8iOaooeaLn++8iVxuICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBib3R0b21Db2xvclxuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgMjApXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5YaF5Y+R5YWJ5pWI5p6cXG4gICAgICAgIHZhciBpbm5lckdsb3cgPSBuZXcgY2MuTm9kZShcIklubmVyR2xvd1wiKVxuICAgICAgICB2YXIgZ2xvd1Nwcml0ZSA9IGlubmVyR2xvdy5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBnbG93U3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgZ2xvd1Nwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0xJQ0VEXG4gICAgICAgIGlubmVyR2xvdy53aWR0aCA9IHdpZHRoIC0gMjBcbiAgICAgICAgaW5uZXJHbG93LmhlaWdodCA9IGhlaWdodCAtIDIwXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBpbm5lckdsb3cuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcig2MCwgNDAsIDEwMCkgOiBuZXcgY2MuQ29sb3IoNDAsIDQwLCA1MClcbiAgICAgICAgaW5uZXJHbG93Lm9wYWNpdHkgPSAxMDBcbiAgICAgICAgaW5uZXJHbG93LnBhcmVudCA9IGJnTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6IOM5pmv57q555CG5pWI5p6cXG4gICAgICAgIHZhciBvdmVybGF5ID0gbmV3IGNjLk5vZGUoXCJPdmVybGF5XCIpXG4gICAgICAgIHZhciBvdmVybGF5U3ByaXRlID0gb3ZlcmxheS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBvdmVybGF5U3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgb3ZlcmxheS53aWR0aCA9IHdpZHRoXG4gICAgICAgIG92ZXJsYXkuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBvdmVybGF5LmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoODAsIDUwLCAxMjApIDogbmV3IGNjLkNvbG9yKDUwLCA1MCwgNjApXG4gICAgICAgIG92ZXJsYXkub3BhY2l0eSA9IDMwXG4gICAgICAgIG92ZXJsYXkucGFyZW50ID0gYmdOb2RlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYmdOb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfjqgg5Yib5bu66YeR6L655o+P6L65XG4gICAgICovXG4gICAgX2NyZWF0ZUdvbGRlbkJvcmRlcjogZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGJvcmRlck5vZGUgPSBuZXcgY2MuTm9kZShcIkdvbGRlbkJvcmRlclwiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBib3JkZXJOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgXG4gICAgICAgIC8vIOi+ueahhuminOiJslxuICAgICAgICB2YXIgYm9yZGVyQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgNTAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEyMCwgMjU1KVxuICAgICAgICB2YXIgZ2xvd0NvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMjU1LCAxODAsIDAsIDE1MCkgOiBuZXcgY2MuQ29sb3IoODAsIDgwLCAxMDAsIDEwMClcbiAgICAgICAgXG4gICAgICAgIC8vIOWkluWPkeWFiVxuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IGdsb3dDb2xvclxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSA4XG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtd2lkdGgvMiAtIDQsIC1oZWlnaHQvMiAtIDQsIHdpZHRoICsgOCwgaGVpZ2h0ICsgOCwgMjQpXG4gICAgICAgIGdyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIFxuICAgICAgICAvLyDkuLvovrnmoYZcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBib3JkZXJDb2xvclxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAzXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCAyMClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgXG4gICAgICAgIC8vIOinkuiQveijhemlsFxuICAgICAgICB2YXIgY29ybmVyU2l6ZSA9IDMwXG4gICAgICAgIHZhciBjb3JuZXJzID0gW1xuICAgICAgICAgICAgeyB4OiAtd2lkdGgvMiwgeTogaGVpZ2h0LzIsIHJvdDogMCB9LFxuICAgICAgICAgICAgeyB4OiB3aWR0aC8yLCB5OiBoZWlnaHQvMiwgcm90OiA5MCB9LFxuICAgICAgICAgICAgeyB4OiB3aWR0aC8yLCB5OiAtaGVpZ2h0LzIsIHJvdDogMTgwIH0sXG4gICAgICAgICAgICB7IHg6IC13aWR0aC8yLCB5OiAtaGVpZ2h0LzIsIHJvdDogMjcwIH1cbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3JuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29ybmVyID0gY29ybmVyc1tpXVxuICAgICAgICAgICAgdmFyIGRlY29yTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29ybmVyX1wiICsgaSlcbiAgICAgICAgICAgIHZhciBkZyA9IGRlY29yTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgICAgICBkZy5zdHJva2VDb2xvciA9IGJvcmRlckNvbG9yXG4gICAgICAgICAgICBkZy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBkZy5tb3ZlVG8oMCwgMClcbiAgICAgICAgICAgIGRnLmxpbmVUbyhjb3JuZXJTaXplLCAwKVxuICAgICAgICAgICAgZGcubGluZVRvKGNvcm5lclNpemUsIGNvcm5lclNpemUpXG4gICAgICAgICAgICBkZy5zdHJva2UoKVxuICAgICAgICAgICAgZGVjb3JOb2RlLnggPSBjb3JuZXIueFxuICAgICAgICAgICAgZGVjb3JOb2RlLnkgPSBjb3JuZXIueVxuICAgICAgICAgICAgZGVjb3JOb2RlLmFuZ2xlID0gY29ybmVyLnJvdFxuICAgICAgICAgICAgZGVjb3JOb2RlLnBhcmVudCA9IGJvcmRlck5vZGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJvcmRlck5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+PhiDliJvlu7rnu5PmnpxCYW5uZXLvvIjog5zliKkv5aSx6LSl5qCH6aKY77yJXG4gICAgICovXG4gICAgX2NyZWF0ZVJlc3VsdEJhbm5lcjogZnVuY3Rpb24oaXNXaW5uZXIsIHBvcHVwV2lkdGgpIHtcbiAgICAgICAgdmFyIGJhbm5lck5vZGUgPSBuZXcgY2MuTm9kZShcIlJlc3VsdEJhbm5lclwiKVxuICAgICAgICBcbiAgICAgICAgLy8gQmFubmVy6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJhbm5lckJnXCIpXG4gICAgICAgIHZhciBncmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIHZhciBiYW5uZXJXaWR0aCA9IHBvcHVwV2lkdGggKiAwLjZcbiAgICAgICAgdmFyIGJhbm5lckhlaWdodCA9IDcwXG4gICAgICAgIFxuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIC8vIOiDnOWIqSAtIOmHkeiJsua4kOWPmOiDjOaZr1xuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDIwMCwgMTUwLCAzMCwgMjAwKVxuICAgICAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1iYW5uZXJXaWR0aC8yLCAtYmFubmVySGVpZ2h0LzIsIGJhbm5lcldpZHRoLCBiYW5uZXJIZWlnaHQsIDM1KVxuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWPkeWFiei+ueahhlxuICAgICAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDEwMCwgMjU1KVxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gM1xuICAgICAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1iYW5uZXJXaWR0aC8yLCAtYmFubmVySGVpZ2h0LzIsIGJhbm5lcldpZHRoLCBiYW5uZXJIZWlnaHQsIDM1KVxuICAgICAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWksei0pSAtIOaal+e6ouiJsuiDjOaZr1xuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCA0MCwgNTAsIDIwMClcbiAgICAgICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtYmFubmVyV2lkdGgvMiwgLWJhbm5lckhlaWdodC8yLCBiYW5uZXJXaWR0aCwgYmFubmVySGVpZ2h0LCAzNSlcbiAgICAgICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigxNTAsIDEwMCwgMTAwLCAyNTUpXG4gICAgICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWJhbm5lcldpZHRoLzIsIC1iYW5uZXJIZWlnaHQvMiwgYmFubmVyV2lkdGgsIGJhbm5lckhlaWdodCwgMzUpXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2UoKVxuICAgICAgICB9XG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBiYW5uZXJOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpopjmloflrZdcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIilcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IGlzV2lubmVyID8gXCLwn4+GIOiDnCDliKkg8J+PhlwiIDogXCLinJYg5aSxIOi0pSDinJZcIlxuICAgICAgICB0aXRsZUxhYmVsLmZvbnRTaXplID0gNDJcbiAgICAgICAgdGl0bGVMYWJlbC5saW5lSGVpZ2h0ID0gNTBcbiAgICAgICAgdGl0bGVMYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIHRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZUxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KSA6IG5ldyBjYy5Db2xvcigyMDAsIDE4MCwgMTgwKVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5o+P6L65XG4gICAgICAgIHZhciBvdXRsaW5lID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigxNTAsIDEwMCwgMCkgOiBuZXcgY2MuQ29sb3IoODAsIDQwLCA0MClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDNcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWPkeWFieaViOaenO+8iOS9v+eUqOmYtOW9seaooeaLn++8iVxuICAgICAgICB2YXIgc2hhZG93ID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbFNoYWRvdylcbiAgICAgICAgc2hhZG93LmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDAsIDIwMCkgOiBuZXcgY2MuQ29sb3IoMTAwLCA1MCwgNTAsIDE1MClcbiAgICAgICAgc2hhZG93Lm9mZnNldCA9IGNjLnYyKDAsIDApXG4gICAgICAgIHNoYWRvdy5ibHVyID0gOFxuICAgICAgICBcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IGJhbm5lck5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDnOWIqeaXtueahOWRvOWQuOWPkeWFieWKqOeUu1xuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGJhbm5lck5vZGUpXG4gICAgICAgICAgICAgICAgLnJlcGVhdEZvcmV2ZXIoXG4gICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50bygxLjAsIHsgc2NhbGU6IDEuMDIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50bygxLjAsIHsgc2NhbGU6IDEuMCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYmFubmVyTm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5OKIOWIm+W7uuWAjeaVsOivpuaDheWNoVxuICAgICAqL1xuICAgIF9jcmVhdGVNdWx0aXBsaWVyRGV0YWlsQ2FyZDogZnVuY3Rpb24oZGF0YSwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGNhcmROb2RlID0gbmV3IGNjLk5vZGUoXCJNdWx0aXBsaWVyQ2FyZFwiKVxuICAgICAgICB2YXIgY2FyZFdpZHRoID0gMTgwXG4gICAgICAgIHZhciBjYXJkSGVpZ2h0ID0gMjUwICAvLyDlop7liqDpq5jluqbku6XlrrnnurPnjovngrjooYxcbiAgICAgICAgXG4gICAgICAgIC8vIOWNoeeJh+iDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJDYXJkQmdcIilcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoNTAsIDM1LCA3MCwgMjIwKSA6IG5ldyBjYy5Db2xvcigzNSwgMzUsIDQ1LCAyMjApXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtY2FyZFdpZHRoLzIsIC1jYXJkSGVpZ2h0LzIsIGNhcmRXaWR0aCwgY2FyZEhlaWdodCwgMTUpXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDE4MCwgMTQwLCA2MCwgMjAwKSA6IG5ldyBjYy5Db2xvcig4MCwgODAsIDEwMCwgMjAwKVxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtY2FyZFdpZHRoLzIsIC1jYXJkSGVpZ2h0LzIsIGNhcmRXaWR0aCwgY2FyZEhlaWdodCwgMTUpXG4gICAgICAgIGdyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuacrOWxgOivpuaDhVwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAyMFxuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVMYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDIwMCwgMjAwLCAyMDApXG4gICAgICAgIHRpdGxlTm9kZS55ID0gY2FyZEhlaWdodC8yIC0gMjVcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IGNhcmROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliIbpmpTnur9cbiAgICAgICAgdmFyIGxpbmVOb2RlID0gbmV3IGNjLk5vZGUoXCJMaW5lXCIpXG4gICAgICAgIHZhciBsZyA9IGxpbmVOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgbGcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCwgMTUwKVxuICAgICAgICBsZy5saW5lV2lkdGggPSAxXG4gICAgICAgIGxnLm1vdmVUbygtY2FyZFdpZHRoLzIgKyAxNSwgMClcbiAgICAgICAgbGcubGluZVRvKGNhcmRXaWR0aC8yIC0gMTUsIDApXG4gICAgICAgIGxnLnN0cm9rZSgpXG4gICAgICAgIGxpbmVOb2RlLnkgPSBjYXJkSGVpZ2h0LzIgLSA1MFxuICAgICAgICBsaW5lTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6K+m5oOF5YiX6KGoXG4gICAgICAgIHZhciBtdWx0aURldGFpbCA9IGRhdGEubXVsdGlfZGV0YWlsIHx8IHt9XG4gICAgICAgIHZhciBkZXRhaWxzID0gW1xuICAgICAgICAgICAgeyBsYWJlbDogXCLlupXliIZcIiwgdmFsdWU6IGRhdGEuYmFzZV9zY29yZSB8fCAxMCB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLmiqLlnLDkuLtcIiwgdmFsdWU6IG11bHRpRGV0YWlsLnFpYW5nX2NvdW50ID4gMCA/IFwieFwiICsgbXVsdGlEZXRhaWwucWlhbmdfbXVsdGkgOiBcIi1cIiB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLngrjlvLlcIiwgdmFsdWU6IG11bHRpRGV0YWlsLmJvbWJfY291bnQgPiAwID8gXCJ4XCIgKyBtdWx0aURldGFpbC5ib21iX211bHRpIDogXCItXCIgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6IFwi546L54K4XCIsIHZhbHVlOiBtdWx0aURldGFpbC5yb2NrZXRfY291bnQgPiAwID8gXCJ4XCIgKyBtdWx0aURldGFpbC5yb2NrZXRfbXVsdGkgOiBcIi1cIiB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLmmKXlpKlcIiwgdmFsdWU6IG11bHRpRGV0YWlsLnNwcmluZ190eXBlID4gMCA/IFwieDJcIiA6IFwiLVwiIH1cbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgdmFyIGl0ZW1ZID0gY2FyZEhlaWdodC8yIC0gNzVcbiAgICAgICAgdmFyIGl0ZW1IZWlnaHQgPSAyOFxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXRhaWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGRldGFpbHNbaV1cbiAgICAgICAgICAgIHZhciBpdGVtTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSXRlbV9cIiArIGkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOagh+etvlxuICAgICAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgICAgIGxhYmVsTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgICBsYWJlbE5vZGUuYW5jaG9yWSA9IDAuNVxuICAgICAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IGl0ZW0ubGFiZWxcbiAgICAgICAgICAgIGxhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgbGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAxODApXG4gICAgICAgICAgICBsYWJlbE5vZGUueCA9IC1jYXJkV2lkdGgvMiArIDM1XG4gICAgICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5YC8XG4gICAgICAgICAgICB2YXIgdmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgdmFsdWVOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgICAgIHZhbHVlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgICAgICB2YXIgdmFsdWVMYWJlbCA9IHZhbHVlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICB2YWx1ZUxhYmVsLnN0cmluZyA9IFN0cmluZyhpdGVtLnZhbHVlKVxuICAgICAgICAgICAgdmFsdWVMYWJlbC5mb250U2l6ZSA9IDE2XG4gICAgICAgICAgICB2YWx1ZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgICAgIHZhbHVlTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgICAgICB2YWx1ZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDE1MClcbiAgICAgICAgICAgIHZhbHVlTm9kZS54ID0gY2FyZFdpZHRoLzIgLSA0MFxuICAgICAgICAgICAgdmFsdWVOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGl0ZW1Ob2RlLnkgPSBpdGVtWSAtIGkgKiBpdGVtSGVpZ2h0XG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmgLvlgI3mlbDvvIjlpKflj7fph5HoibLvvIlcbiAgICAgICAgdmFyIHRvdGFsTXVsdGlOb2RlID0gbmV3IGNjLk5vZGUoXCJUb3RhbE11bHRpXCIpXG4gICAgICAgIHZhciB0b3RhbE11bHRpQmcgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciB0bWcgPSB0b3RhbE11bHRpQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB0bWcuZmlsbENvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoODAsIDUwLCAyMCwgMjAwKSA6IG5ldyBjYy5Db2xvcig0MCwgNDAsIDUwLCAyMDApXG4gICAgICAgIHRtZy5yb3VuZFJlY3QoLWNhcmRXaWR0aC8yICsgMTAsIC1jYXJkSGVpZ2h0LzIgKyA1LCBjYXJkV2lkdGggLSAyMCwgNTAsIDEwKVxuICAgICAgICB0bWcuZmlsbCgpXG4gICAgICAgIHRvdGFsTXVsdGlCZy55ID0gLWNhcmRIZWlnaHQvMiArIDMwXG4gICAgICAgIHRvdGFsTXVsdGlCZy5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIHRvdGFsTGFiZWwgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHRvdGFsTGFiZWwuYW5jaG9yWCA9IDAuNVxuICAgICAgICB0b3RhbExhYmVsLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIHR0bCA9IHRvdGFsTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0dGwuc3RyaW5nID0gXCLmgLvlgI3mlbBcIlxuICAgICAgICB0dGwuZm9udFNpemUgPSAxNFxuICAgICAgICB0dGwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0dGwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRvdGFsTGFiZWwuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxODAsIDE4MClcbiAgICAgICAgdG90YWxMYWJlbC55ID0gMTJcbiAgICAgICAgdG90YWxMYWJlbC5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIG11bHRpVmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5uYW1lID0gXCJNdWx0aXBsaWVyVmFsdWVcIlxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIG11bHRpVmFsdWVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIG12bCA9IG11bHRpVmFsdWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbXZsLnN0cmluZyA9IFwieFwiICsgKGRhdGEubXVsdGlwbGUgfHwgMSlcbiAgICAgICAgbXZsLmZvbnRTaXplID0gMjhcbiAgICAgICAgbXZsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgbXZsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgbXZsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5jb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCA1MCkgOiBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+uVxuICAgICAgICB2YXIgbXZvID0gbXVsdGlWYWx1ZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgbXZvLmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMTUwLCAxMDAsIDApIDogbmV3IGNjLkNvbG9yKDYwLCA2MCwgNjApXG4gICAgICAgIG12by53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIG11bHRpVmFsdWVOb2RlLnkgPSAtOFxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdG90YWxNdWx0aU5vZGUueSA9IC1jYXJkSGVpZ2h0LzIgKyAzMFxuICAgICAgICB0b3RhbE11bHRpTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNhcmROb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfkaUg5Yib5bu6546p5a6257uT5p6c5YiX6KGoXG4gICAgICovXG4gICAgX2NyZWF0ZVBsYXllclJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGEsIGlzV2lubmVyLCBteVdpbkdvbGQsIGxpc3RXaWR0aCkge1xuICAgICAgICB2YXIgbGlzdE5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYXllclJlc3VsdExpc3RcIilcbiAgICAgICAgdmFyIGxpc3RIZWlnaHQgPSAyNjBcbiAgICAgICAgXG4gICAgICAgIC8vIOWIl+ihqOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJMaXN0QmdcIilcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDAsIDgwKVxuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWxpc3RXaWR0aC8yLCAtbGlzdEhlaWdodC8yLCBsaXN0V2lkdGgsIGxpc3RIZWlnaHQsIDEyKVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGxpc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDooajlpLRcbiAgICAgICAgdmFyIGhlYWRlck5vZGUgPSBuZXcgY2MuTm9kZShcIkhlYWRlclwiKVxuICAgICAgICB2YXIgaGVhZGVycyA9IFtcIueOqeWutlwiLCBcIui6q+S7vVwiLCBcIui+k+i1olwiXVxuICAgICAgICB2YXIgaGVhZGVyWCA9IFstbGlzdFdpZHRoLzIgKyA4MCwgMjAsIGxpc3RXaWR0aC8yIC0gNjBdXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBoTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSF9cIiArIGkpXG4gICAgICAgICAgICBoTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgICBoTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgICAgICB2YXIgaExhYmVsID0gaE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaExhYmVsLnN0cmluZyA9IGhlYWRlcnNbaV1cbiAgICAgICAgICAgIGhMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgICAgICBoTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgaExhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgaE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxNTAsIDE2MClcbiAgICAgICAgICAgIGhOb2RlLnggPSBoZWFkZXJYW2ldXG4gICAgICAgICAgICBoTm9kZS5wYXJlbnQgPSBoZWFkZXJOb2RlXG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVyTm9kZS55ID0gbGlzdEhlaWdodC8yIC0gMjVcbiAgICAgICAgaGVhZGVyTm9kZS5wYXJlbnQgPSBsaXN0Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5YiG6ZqU57q/XG4gICAgICAgIHZhciBzZXBOb2RlID0gbmV3IGNjLk5vZGUoXCJTZXBhcmF0b3JcIilcbiAgICAgICAgdmFyIHNnID0gc2VwTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIHNnLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDAsIDEwMClcbiAgICAgICAgc2cubGluZVdpZHRoID0gMVxuICAgICAgICBzZy5tb3ZlVG8oLWxpc3RXaWR0aC8yICsgMTUsIDApXG4gICAgICAgIHNnLmxpbmVUbyhsaXN0V2lkdGgvMiAtIDE1LCAwKVxuICAgICAgICBzZy5zdHJva2UoKVxuICAgICAgICBzZXBOb2RlLnkgPSBsaXN0SGVpZ2h0LzIgLSA0NVxuICAgICAgICBzZXBOb2RlLnBhcmVudCA9IGxpc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDnjqnlrrbliJfooahcbiAgICAgICAgdmFyIHBsYXllcnMgPSBkYXRhLnBsYXllcnMgfHwgW11cbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgdmFyIGl0ZW1TdGFydFkgPSBsaXN0SGVpZ2h0LzIgLSA3NVxuICAgICAgICB2YXIgaXRlbUhlaWdodCA9IDY1XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoICYmIGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW2ldXG4gICAgICAgICAgICB2YXIgaXNDdXJyZW50UGxheWVyID0gU3RyaW5nKHBsYXllci5wbGF5ZXJfaWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZClcbiAgICAgICAgICAgIHZhciBpdGVtTm9kZSA9IHRoaXMuX2NyZWF0ZVBsYXllclJlc3VsdEl0ZW0ocGxheWVyLCBpc0N1cnJlbnRQbGF5ZXIsIGlzV2lubmVyLCBsaXN0V2lkdGgsIGkpXG4gICAgICAgICAgICBpdGVtTm9kZS55ID0gaXRlbVN0YXJ0WSAtIGkgKiBpdGVtSGVpZ2h0XG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBsaXN0Tm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdE5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+RpCDliJvlu7rljZXkuKrnjqnlrrbnu5PmnpzpoblcbiAgICAgKi9cbiAgICBfY3JlYXRlUGxheWVyUmVzdWx0SXRlbTogZnVuY3Rpb24ocGxheWVyLCBpc0N1cnJlbnRQbGF5ZXIsIGlzV2lubmVyLCBsaXN0V2lkdGgsIGluZGV4KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgaXRlbU5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYXllckl0ZW1fXCIgKyBpbmRleClcbiAgICAgICAgdmFyIGl0ZW1IZWlnaHQgPSA1NVxuICAgICAgICBcbiAgICAgICAgLy8g5b2T5YmN546p5a626auY5Lqu6IOM5pmvXG4gICAgICAgIGlmIChpc0N1cnJlbnRQbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciBoaWdobGlnaHQgPSBuZXcgY2MuTm9kZShcIkhpZ2hsaWdodFwiKVxuICAgICAgICAgICAgdmFyIGhnID0gaGlnaGxpZ2h0LmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgICAgIGhnLmZpbGxDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDgwLCA2MCwgMzAsIDE1MCkgOiBuZXcgY2MuQ29sb3IoNTAsIDQwLCA1MCwgMTUwKVxuICAgICAgICAgICAgaGcucm91bmRSZWN0KC1saXN0V2lkdGgvMiArIDEwLCAtaXRlbUhlaWdodC8yLCBsaXN0V2lkdGggLSAyMCwgaXRlbUhlaWdodCwgOClcbiAgICAgICAgICAgIGhnLmZpbGwoKVxuICAgICAgICAgICAgaGcuc3Ryb2tlQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyMDAsIDE1MCwgNTAsIDIwMCkgOiBuZXcgY2MuQ29sb3IoMTAwLCA4MCwgMTAwLCAxNTApXG4gICAgICAgICAgICBoZy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBoZy5yb3VuZFJlY3QoLWxpc3RXaWR0aC8yICsgMTAsIC1pdGVtSGVpZ2h0LzIsIGxpc3RXaWR0aCAtIDIwLCBpdGVtSGVpZ2h0LCA4KVxuICAgICAgICAgICAgaGcuc3Ryb2tlKClcbiAgICAgICAgICAgIGhpZ2hsaWdodC5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpLTlg4/ljLrln59cbiAgICAgICAgdmFyIGF2YXRhck5vZGUgPSBuZXcgY2MuTm9kZShcIkF2YXRhclwiKVxuICAgICAgICBhdmF0YXJOb2RlLnggPSAtbGlzdFdpZHRoLzIgKyA0NVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6IOM5pmv77yI5ZyG5b2i77yJXG4gICAgICAgIHZhciBhdmF0YXJCZyA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyQmdcIilcbiAgICAgICAgdmFyIGFnID0gYXZhdGFyQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgaXNMYW5kbG9yZCA9IHBsYXllci5yb2xlID09PSBcImxhbmRsb3JkXCJcbiAgICAgICAgXG4gICAgICAgIC8vIOe7mOWItuWchuW9ouWktOWDj+ahhlxuICAgICAgICBhZy5zdHJva2VDb2xvciA9IGlzTGFuZGxvcmQgPyBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDUwLCAyNTUpIDogbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAyMDAsIDI1NSlcbiAgICAgICAgYWcubGluZVdpZHRoID0gM1xuICAgICAgICBhZy5jaXJjbGUoMCwgMCwgMjIpXG4gICAgICAgIGFnLnN0cm9rZSgpXG4gICAgICAgIGFnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig2MCwgNjAsIDgwLCAyMDApXG4gICAgICAgIGFnLmNpcmNsZSgwLCAwLCAyMClcbiAgICAgICAgYWcuZmlsbCgpXG4gICAgICAgIGF2YXRhckJnLnBhcmVudCA9IGF2YXRhck5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleWKoOi9veWktOWDj1xuICAgICAgICB2YXIgYXZhdGFySW5kZXggPSAoaW5kZXggJSA0KSArIDFcbiAgICAgICAgdmFyIGF2YXRhclBhdGggPSBcIlVJL2hlYWRpbWFnZS9hdmF0YXJfXCIgKyBhdmF0YXJJbmRleFxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChhdmF0YXJQYXRoLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXZhdGFyU3ByaXRlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJTcHJpdGVcIilcbiAgICAgICAgICAgICAgICB2YXIgc3AgPSBhdmF0YXJTcHJpdGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSlcbiAgICAgICAgICAgICAgICBzcC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgc3Auc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgICAgICAgICAgYXZhdGFyU3ByaXRlLndpZHRoID0gMzZcbiAgICAgICAgICAgICAgICBhdmF0YXJTcHJpdGUuaGVpZ2h0ID0gMzZcbiAgICAgICAgICAgICAgICBhdmF0YXJTcHJpdGUucGFyZW50ID0gYXZhdGFyTm9kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g6Lqr5Lu95Zu+5qCHXG4gICAgICAgIHZhciByb2xlSWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIlJvbGVJY29uXCIpXG4gICAgICAgIHZhciByb2xlTGFiZWwgPSByb2xlSWNvbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICByb2xlTGFiZWwuc3RyaW5nID0gaXNMYW5kbG9yZCA/IFwi8J+RkVwiIDogXCLwn4y+XCJcbiAgICAgICAgcm9sZUxhYmVsLmZvbnRTaXplID0gMTRcbiAgICAgICAgcm9sZUljb25Ob2RlLnggPSAxOFxuICAgICAgICByb2xlSWNvbk5vZGUueSA9IC0xNVxuICAgICAgICByb2xlSWNvbk5vZGUucGFyZW50ID0gYXZhdGFyTm9kZVxuICAgICAgICBcbiAgICAgICAgYXZhdGFyTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g546p5a625ZCN56ewXG4gICAgICAgIHZhciBuYW1lTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTmFtZVwiKVxuICAgICAgICBuYW1lTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIG5hbWVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5hbWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbmFtZUxhYmVsLnN0cmluZyA9IHBsYXllci5wbGF5ZXJfbmFtZSB8fCAoXCLnjqnlrrZcIiArIChpbmRleCArIDEpKVxuICAgICAgICBuYW1lTGFiZWwuZm9udFNpemUgPSAxOFxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIG5hbWVOb2RlLmNvbG9yID0gaXNDdXJyZW50UGxheWVyID8gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyMDApIDogbmV3IGNjLkNvbG9yKDIyMCwgMjIwLCAyMjApXG4gICAgICAgIG5hbWVOb2RlLnggPSAtbGlzdFdpZHRoLzIgKyAxMDBcbiAgICAgICAgbmFtZU5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOi6q+S7vVxuICAgICAgICB2YXIgcm9sZU5vZGUgPSBuZXcgY2MuTm9kZShcIlJvbGVcIilcbiAgICAgICAgcm9sZU5vZGUuYW5jaG9yWCA9IDAuNVxuICAgICAgICByb2xlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciByb2xlVGV4dCA9IHJvbGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcm9sZVRleHQuc3RyaW5nID0gaXNMYW5kbG9yZCA/IFwi5Zyw5Li7XCIgOiBcIuWGnOawkVwiXG4gICAgICAgIHJvbGVUZXh0LmZvbnRTaXplID0gMThcbiAgICAgICAgcm9sZVRleHQuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICByb2xlVGV4dC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgcm9sZU5vZGUuY29sb3IgPSBpc0xhbmRsb3JkID8gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApIDogbmV3IGNjLkNvbG9yKDEyMCwgMjAwLCAxMjApXG4gICAgICAgIHJvbGVOb2RlLnggPSAyMFxuICAgICAgICByb2xlTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6L6T6LWi6YeR6aKdXG4gICAgICAgIHZhciB3aW5Hb2xkID0gcGxheWVyLndpbl9nb2xkIHx8IDBcbiAgICAgICAgdmFyIHdpbk5vZGUgPSBuZXcgY2MuTm9kZShcIldpbkdvbGRcIilcbiAgICAgICAgd2luTm9kZS5uYW1lID0gXCJXaW5Hb2xkVmFsdWVcIlxuICAgICAgICB3aW5Ob2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgd2luTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciB3aW5MYWJlbCA9IHdpbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB3aW5MYWJlbC5zdHJpbmcgPSAod2luR29sZCA+PSAwID8gXCIrXCIgOiBcIlwiKSArIHdpbkdvbGRcbiAgICAgICAgd2luTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICB3aW5MYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIHdpbkxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgd2luTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDmj4/ovrlcbiAgICAgICAgdmFyIHdpbk91dGxpbmUgPSB3aW5Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIHdpbk91dGxpbmUuY29sb3IgPSB3aW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMCwgODAsIDApIDogbmV3IGNjLkNvbG9yKDEwMCwgMCwgMClcbiAgICAgICAgd2luT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIHdpbk5vZGUuY29sb3IgPSB3aW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMTAwLCAyNTUsIDEwMCkgOiBuZXcgY2MuQ29sb3IoMjU1LCAxMDAsIDEwMClcbiAgICAgICAgd2luTm9kZS54ID0gbGlzdFdpZHRoLzIgLSA1MFxuICAgICAgICB3aW5Ob2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbU5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UmCDliJvlu7rmjInpkq7ljLrln59cbiAgICAgKi9cbiAgICBfY3JlYXRlQnV0dG9uQXJlYTogZnVuY3Rpb24oaXNXaW5uZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgYXJlYU5vZGUgPSBuZXcgY2MuTm9kZShcIkJ1dHRvbkFyZWFcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOe7p+e7rea4uOaIj+aMiemSrlxuICAgICAgICB2YXIgY29udGludWVCdG4gPSBzZWxmLl9jcmVhdGVTdHlsZWRCdXR0b24oXCLnu6fnu63muLjmiI9cIiwgaXNXaW5uZXIsIHRydWUpXG4gICAgICAgIGNvbnRpbnVlQnRuLnggPSAtMTAwXG4gICAgICAgIGNvbnRpbnVlQnRuLnBhcmVudCA9IGFyZWFOb2RlXG4gICAgICAgIFxuICAgICAgICBjb250aW51ZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhcImNvbnRpbnVlXCIpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDov5Tlm57lpKfljoXmjInpkq5cbiAgICAgICAgdmFyIGxvYmJ5QnRuID0gc2VsZi5fY3JlYXRlU3R5bGVkQnV0dG9uKFwi6L+U5Zue5aSn5Y6FXCIsIGlzV2lubmVyLCBmYWxzZSlcbiAgICAgICAgbG9iYnlCdG4ueCA9IDEwMFxuICAgICAgICBsb2JieUJ0bi5wYXJlbnQgPSBhcmVhTm9kZVxuICAgICAgICBcbiAgICAgICAgbG9iYnlCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soXCJsb2JieVwiKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGFyZWFOb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflJgg5Yib5bu66auY57qn5qC35byP5oyJ6ZKuXG4gICAgICovXG4gICAgX2NyZWF0ZVN0eWxlZEJ1dHRvbjogZnVuY3Rpb24odGV4dCwgaXNXaW5uZXIsIGlzUHJpbWFyeSkge1xuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQnRuX1wiICsgdGV4dClcbiAgICAgICAgdmFyIGJ0bldpZHRoID0gMTQwXG4gICAgICAgIHZhciBidG5IZWlnaHQgPSA1MFxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeiuvue9ruaMiemSruiKgueCueeahOWGheWuueWkp+Wwj++8jOehruS/neeCueWHu+WMuuWfn+ato+ehrlxuICAgICAgICBidG5Ob2RlLnNldENvbnRlbnRTaXplKGJ0bldpZHRoLCBidG5IZWlnaHQpXG4gICAgICAgIGJ0bk5vZGUuc2V0QW5jaG9yUG9pbnQoMC41LCAwLjUpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75YqgIEJsb2NrSW5wdXRFdmVudHMg57uE5Lu277yM56Gu5L+d5oyJ6ZKu5Y+v5Lul5o6l5pS254K55Ye75LqL5Lu2XG4gICAgICAgIGJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7og4zmma9cbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIFxuICAgICAgICBpZiAoaXNQcmltYXJ5KSB7XG4gICAgICAgICAgICAvLyDkuLvopoHmjInpkq4gLSDph5HmqZnmuJDlj5hcbiAgICAgICAgICAgIGlmIChpc1dpbm5lcikge1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDE0MCwgMzAsIDI1NSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDYwLCAxMjAsIDE4MCwgMjU1KVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5qyh6KaB5oyJ6ZKuIC0g6JOd57Sr5riQ5Y+YXG4gICAgICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDcwLCAxMjAsIDI1NSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1idG5XaWR0aC8yLCAtYnRuSGVpZ2h0LzIsIGJ0bldpZHRoLCBidG5IZWlnaHQsIDI1KVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgXG4gICAgICAgIC8vIOi+ueahhlxuICAgICAgICBpZiAoaXNQcmltYXJ5ICYmIGlzV2lubmVyKSB7XG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIyMCwgMTAwLCAyNTUpXG4gICAgICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWJ0bldpZHRoLzIsIC1idG5IZWlnaHQvMiwgYnRuV2lkdGgsIGJ0bkhlaWdodCwgMjUpXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2UoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7mloflrZdcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgbGFiZWxOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGFiZWxOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dFxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGxhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgbGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5TSFJJTktcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBsYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgbGFiZWxOb2RlLndpZHRoID0gYnRuV2lkdGggLSAyMCAgLy8g55WZ5Ye66L656Led6Ziy5q2i5rqi5Ye6XG4gICAgICAgIGxhYmVsTm9kZS5oZWlnaHQgPSBidG5IZWlnaHQgLSAxMFxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+uVxuICAgICAgICB2YXIgb3V0bGluZSA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDApXG4gICAgICAgIG91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIFxuICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gYnRuTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye75pWI5p6cXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2MudHdlZW4oYnRuTm9kZSkudG8oMC4xLCB7IHNjYWxlOiAwLjk1IH0pLnN0YXJ0KClcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGJ0bk5vZGUpLnRvKDAuMSwgeyBzY2FsZTogMSB9KS5zdGFydCgpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYy50d2VlbihidG5Ob2RlKS50bygwLjEsIHsgc2NhbGU6IDEgfSkuc3RhcnQoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJ0bk5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pyoIOWIm+W7uuiDnOWIqeeykuWtkOeJueaViFxuICAgICAqL1xuICAgIF9jcmVhdGVWaWN0b3J5UGFydGljbGVzOiBmdW5jdGlvbihwYXJlbnQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDph5HluIHnspLlrZBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29pbiA9IG5ldyBjYy5Ob2RlKFwiQ29pbl9cIiArIGluZGV4KVxuICAgICAgICAgICAgICAgIGNvaW4ueCA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHdpZHRoXG4gICAgICAgICAgICAgICAgY29pbi55ID0gaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g57uY5Yi26YeR5biBXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBjb2luLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgICAgICAgICBnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgNTAsIDI1NSlcbiAgICAgICAgICAgICAgICBnLmNpcmNsZSgwLCAwLCA4KVxuICAgICAgICAgICAgICAgIGcuZmlsbCgpXG4gICAgICAgICAgICAgICAgZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDE1MCwgMzAsIDI1NSlcbiAgICAgICAgICAgICAgICBnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgICAgICAgICBnLmNpcmNsZSgwLCAwLCA4KVxuICAgICAgICAgICAgICAgIGcuc3Ryb2tlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb2luLnBhcmVudCA9IHBhcmVudFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS4i+iQveWKqOeUu1xuICAgICAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IDEuNSArIE1hdGgucmFuZG9tKCkgKiAxLjVcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0WSA9IC1oZWlnaHQgLyAyIC0gNTBcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBNYXRoLnJhbmRvbSgpICogMC41XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2MudHdlZW4oY29pbilcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KGRlbGF5KVxuICAgICAgICAgICAgICAgICAgICAucGFyYWxsZWwoXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uLCB7IHk6IHRhcmdldFkgfSwgeyBlYXNpbmc6ICdxdWFkSW4nIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB4OiBjb2luLnggKyAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAxMDAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uIC8gMiwgeyBhbmdsZTogLTE4MCB9KS50byhkdXJhdGlvbiAvIDIsIHsgYW5nbGU6IC0zNjAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW+queOr1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi55ID0gaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2luLnggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oY29pbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyYWxsZWwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeTogdGFyZ2V0WSB9LCB7IGVhc2luZzogJ3F1YWRJbicgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeDogY29pbi54ICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMTAwIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uIC8gMiwgeyBhbmdsZTogLTE4MCB9KS50byhkdXJhdGlvbiAvIDIsIHsgYW5nbGU6IC0zNjAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgIH0pKGkpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYn+WFiemXqueDgVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDg7IGorKykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXIgPSBuZXcgY2MuTm9kZShcIlN0YXJfXCIgKyBpbmRleClcbiAgICAgICAgICAgICAgICBzdGFyLnggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aCAqIDAuOFxuICAgICAgICAgICAgICAgIHN0YXIueSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIGhlaWdodCAqIDAuOFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOe7mOWItuaYn+aYn1xuICAgICAgICAgICAgICAgIHZhciBzZyA9IHN0YXIuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICAgICAgICAgIHNnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjAwLCAyMDApXG4gICAgICAgICAgICAgICAgc2VsZi5fZHJhd1N0YXIoc2csIDAsIDAsIDYsIDUpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3Rhci5wYXJlbnQgPSBwYXJlbnRcbiAgICAgICAgICAgICAgICBzdGFyLm9wYWNpdHkgPSAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6Zeq54OB5Yqo55S7XG4gICAgICAgICAgICAgICAgY2MudHdlZW4oc3RhcilcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KE1hdGgucmFuZG9tKCkgKiAyKVxuICAgICAgICAgICAgICAgICAgICAucmVwZWF0Rm9yZXZlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IG9wYWNpdHk6IDI1NSwgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgb3BhY2l0eTogMTAwLCBzY2FsZTogMC44IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAyNTUsIHNjYWxlOiAxLjIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjUgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGVsYXkoMSArIE1hdGgucmFuZG9tKCkgKiAyKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgICAgICB9KShqKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfjKfvuI8g5Yib5bu65aSx6LSl57KS5a2Q54m55pWIXG4gICAgICovXG4gICAgX2NyZWF0ZURlZmVhdFBhcnRpY2xlczogZnVuY3Rpb24ocGFyZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIC8vIOiTneiJsua8gua1rueykuWtkFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBjYy5Ob2RlKFwiRGVmZWF0UGFydGljbGVfXCIgKyBpbmRleClcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogd2lkdGhcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogaGVpZ2h0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g57uY5Yi257KS5a2QXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBwYXJ0aWNsZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgICAgICAgICAgZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDEwMCwgMTUwLCAxNTApXG4gICAgICAgICAgICAgICAgZy5jaXJjbGUoMCwgMCwgNCArIE1hdGgucmFuZG9tKCkgKiAzKVxuICAgICAgICAgICAgICAgIGcuZmlsbCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGFydGljbGUucGFyZW50ID0gcGFyZW50XG4gICAgICAgICAgICAgICAgcGFydGljbGUub3BhY2l0eSA9IDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDnvJPmhaLmvILmta7liqjnlLtcbiAgICAgICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAzICsgTWF0aC5yYW5kb20oKSAqIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLnRvKDAuNSwgeyBvcGFjaXR5OiAxNTAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBhcmFsbGVsKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB5OiBwYXJ0aWNsZS55ICsgNTAgKyBNYXRoLnJhbmRvbSgpICogMzAgfSwgeyBlYXNpbmc6ICdzaW5lSW5PdXQnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB4OiBwYXJ0aWNsZS54ICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogNDAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAudG8oMC41LCB7IG9wYWNpdHk6IDAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlvqrnjq9cbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KDQpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBlYXRGb3JldmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjUsIHsgb3BhY2l0eTogMTUwIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmFsbGVsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uLCB7IHk6IHBhcnRpY2xlLnkgKyA1MCArIE1hdGgucmFuZG9tKCkgKiAzMCB9LCB7IGVhc2luZzogJ3NpbmVJbk91dCcgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeDogcGFydGljbGUueCArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDQwIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjUsIHsgb3BhY2l0eTogMCB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgICAgICB9KShpKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKtkCDnu5jliLbmmJ/lvaJcbiAgICAgKi9cbiAgICBfZHJhd1N0YXI6IGZ1bmN0aW9uKGdyYXBoaWNzLCBjeCwgY3ksIGlubmVyUmFkaXVzLCBwb2ludHMpIHtcbiAgICAgICAgdmFyIG91dGVyUmFkaXVzID0gaW5uZXJSYWRpdXMgKiAyXG4gICAgICAgIGdyYXBoaWNzLm1vdmVUbyhjeCwgY3kgKyBvdXRlclJhZGl1cylcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzICogMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gaSAlIDIgPT09IDAgPyBvdXRlclJhZGl1cyA6IGlubmVyUmFkaXVzXG4gICAgICAgICAgICB2YXIgYW5nbGUgPSAoaSAqIE1hdGguUEkpIC8gcG9pbnRzIC0gTWF0aC5QSSAvIDJcbiAgICAgICAgICAgIHZhciB4ID0gY3ggKyBNYXRoLmNvcyhhbmdsZSkgKiByYWRpdXNcbiAgICAgICAgICAgIHZhciB5ID0gY3kgKyBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXNcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbyh4LCB5KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBncmFwaGljcy5jbG9zZSgpXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SiIOWQr+WKqOaVsOWtl+WKqOeUu1xuICAgICAqL1xuICAgIF9zdGFydE51bWJlckFuaW1hdGlvbnM6IGZ1bmN0aW9uKHBvcHVwTm9kZSwgZGF0YSwgbXlXaW5Hb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5YCN5pWw5rua5Yqo5Yqo55S7XG4gICAgICAgIHZhciBtdWx0aVZhbHVlTm9kZSA9IHNlbGYuX2ZpbmROb2RlQnlOYW1lKHBvcHVwTm9kZSwgXCJNdWx0aXBsaWVyVmFsdWVcIilcbiAgICAgICAgaWYgKG11bHRpVmFsdWVOb2RlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0TXVsdGkgPSBkYXRhLm11bHRpcGxlIHx8IDFcbiAgICAgICAgICAgIHNlbGYuX2FuaW1hdGVOdW1iZXIobXVsdGlWYWx1ZU5vZGUsIDEsIHRhcmdldE11bHRpLCA4MDAsIFwieFwiKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKIg5pWw5a2X5rua5Yqo5Yqo55S7XG4gICAgICovXG4gICAgX2FuaW1hdGVOdW1iZXI6IGZ1bmN0aW9uKG5vZGUsIGZyb20sIHRvLCBkdXJhdGlvbiwgcHJlZml4KSB7XG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICAgIHZhciBsYWJlbCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBpZiAoIWxhYmVsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgIHZhciBkaWZmID0gdG8gLSBmcm9tXG4gICAgICAgIFxuICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuaXNWYWxpZCkgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZVxuICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkvb/nlKjnvJPliqjlh73mlbBcbiAgICAgICAgICAgIHZhciBlYXNlUHJvZ3Jlc3MgPSAxIC0gTWF0aC5wb3coMSAtIHByb2dyZXNzLCAzKSAvLyBlYXNlT3V0Q3ViaWNcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gTWF0aC5mbG9vcihmcm9tICsgZGlmZiAqIGVhc2VQcm9ncmVzcylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gKHByZWZpeCB8fCBcIlwiKSArIGN1cnJlbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb2dyZXNzIDwgMSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxNilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gKHByZWZpeCB8fCBcIlwiKSArIHRvXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflI0g5p+l5om+6IqC54K5XG4gICAgICovXG4gICAgX2ZpbmROb2RlQnlOYW1lOiBmdW5jdGlvbihwYXJlbnQsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmb3VuZCA9IHRoaXMuX2ZpbmROb2RlQnlOYW1lKGNoaWxkcmVuW2ldLCBuYW1lKVxuICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDlhbPpl63nu5PnrpflvLnnqpcgLSDluKbnvKnlsI/mt6Hlh7rliqjnlLtcbiAgICAgKi9cbiAgICBfY2xvc2VHYW1lUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKHBvcHVwTm9kZSwgbWFza05vZGUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInnspLlrZDliqjnlLtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3VsdEVmZmVjdExheWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHRFZmZlY3RMYXllci5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9yZXN1bHRFZmZlY3RMYXllci5jaGlsZHJlblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5by556qX57yp5bCP5reh5Ye65Yqo55S7XG4gICAgICAgIGlmIChwb3B1cE5vZGUpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgICAgICAudG8oMC4yLCB7IHNjYWxlOiAwLjgsIG9wYWNpdHk6IDAgfSwgeyBlYXNpbmc6ICdiYWNrSW4nIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3B1cE5vZGUgJiYgcG9wdXBOb2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5reh5Ye6XG4gICAgICAgIGlmIChtYXNrTm9kZSkge1xuICAgICAgICAgICAgY2MudHdlZW4obWFza05vZGUpXG4gICAgICAgICAgICAgICAgLnRvKDAuMiwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrTm9kZSAmJiBtYXNrTm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fZ2FtZVJlc3VsdFBvcHVwID0gbnVsbFxuICAgICAgICB0aGlzLl9nYW1lUmVzdWx0TWFzayA9IG51bGxcbiAgICAgICAgdGhpcy5fcmVzdWx0RWZmZWN0TGF5ZXIgPSBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOe7p+e7rea4uOaIj1xuICAgICAqL1xuICAgIF9jb250aW51ZUdhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCB8fCAhbXlnbG9iYWwucGxheWVyRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XnjqnlrrbosYblrZDmmK/lkKbotrPlpJ/nu6fnu63muLjmiI9cbiAgICAgICAgdmFyIHBsYXllckdvbGQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50IHx8IDBcbiAgICAgICAgdmFyIHJvb21Db25maWcgPSBteWdsb2JhbC5jdXJyZW50Um9vbUNvbmZpZyB8fCB7fVxuICAgICAgICB2YXIgbWluR29sZCA9IHJvb21Db25maWcubWluX2dvbGQgfHwgcm9vbUNvbmZpZy5taW5Hb2xkIHx8IDBcbiAgICAgICAgXG4gICAgICAgIGlmIChwbGF5ZXJHb2xkIDwgbWluR29sZCkge1xuICAgICAgICAgICAgLy8g6LGG5a2Q5LiN6Laz77yM5pi+56S66LGG5a2Q5LiN6Laz5by556qXXG4gICAgICAgICAgICB0aGlzLl9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwKHBsYXllckdvbGQsIG1pbkdvbGQpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6LGG5a2Q6Laz5aSf77yM57un57ut5ri45oiPXG4gICAgICAgIHRoaXMuX2RvQ29udGludWVHYW1lKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmiafooYznu6fnu63muLjmiI/pgLvovpFcbiAgICAgKi9cbiAgICBfZG9Db250aW51ZUdhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIblvZPliY3muLjmiI/nirbmgIFcbiAgICAgICAgdGhpcy5fcmVzZXRHYW1lU3RhdGUoKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R6YCBIHJlYWR5IOivt+axgu+8iOWHhuWkh+S4i+S4gOWxgO+8iVxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQucmVxdWVzdFJlYWR5KSB7XG4gICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQucmVxdWVzdFJlYWR5KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S6562J5b6F5o+Q56S6XG4gICAgICAgIGlmICh0aGlzLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gXCLnrYnlvoXlhbbku5bnjqnlrrYuLi5cIlxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTAwMClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeaYvuekuuixhuWtkOS4jei2s+W8ueeql1xuICAgICAqL1xuICAgIF9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwOiBmdW5jdGlvbihjdXJyZW50R29sZCwgcmVxdWlyZWRHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5YWz6Zet57uT566X5by556qXXG4gICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKClcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuixhuWtkOS4jei2s+W8ueeql1xuICAgICAgICB2YXIgY2FudmFzID0gY2MuZGlyZWN0b3IuZ2V0U2NlbmUoKS5nZXRDaGlsZEJ5TmFtZShcIkNhbnZhc1wiKVxuICAgICAgICBpZiAoIWNhbnZhcykgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemVcbiAgICAgICAgXG4gICAgICAgIC8vIOmBrue9qeWxglxuICAgICAgICB2YXIgbWFza05vZGUgPSBuZXcgY2MuTm9kZShcIkluc3VmZmljaWVudEdvbGRNYXNrXCIpXG4gICAgICAgIG1hc2tOb2RlLmFkZENvbXBvbmVudChjYy5CbG9ja0lucHV0RXZlbnRzKVxuICAgICAgICB2YXIgbWFza1Nwcml0ZSA9IG1hc2tOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgIG1hc2tTcHJpdGUuc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUoKVxuICAgICAgICBtYXNrU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTVxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwKVxuICAgICAgICBtYXNrTm9kZS5vcGFjaXR5ID0gMTgwXG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g5by556qX5a655ZmoXG4gICAgICAgIHZhciBwb3B1cE5vZGUgPSBuZXcgY2MuTm9kZShcIkluc3VmZmljaWVudEdvbGRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUueCA9IDBcbiAgICAgICAgcG9wdXBOb2RlLnkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+iDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgcG9wdXBXaWR0aCA9IDQ1MFxuICAgICAgICB2YXIgcG9wdXBIZWlnaHQgPSAzMjBcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDQwLCAzNSwgNjApXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDIwKVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gM1xuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuixhuWtkOS4jei2s1wiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICB0aXRsZUxhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgMTAwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA0NVxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliIbpmpTnur9cbiAgICAgICAgdmFyIGxpbmVOb2RlID0gbmV3IGNjLk5vZGUoXCJMaW5lXCIpXG4gICAgICAgIHZhciBsZyA9IGxpbmVOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgbGcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA4MCwgNjApXG4gICAgICAgIGxnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgbGcubW92ZVRvKC1wb3B1cFdpZHRoLzIgKyAzMCwgcG9wdXBIZWlnaHQvMiAtIDgwKVxuICAgICAgICBsZy5saW5lVG8ocG9wdXBXaWR0aC8yIC0gMzAsIHBvcHVwSGVpZ2h0LzIgLSA4MClcbiAgICAgICAgbGcuc3Ryb2tlKClcbiAgICAgICAgbGluZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDlhoXlrrnljLrln59cbiAgICAgICAgdmFyIGNvbnRlbnROb2RlID0gbmV3IGNjLk5vZGUoXCJDb250ZW50XCIpXG4gICAgICAgIHZhciBjb250ZW50TGFiZWwgPSBjb250ZW50Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvbnRlbnRMYWJlbC5zdHJpbmcgPSBcIuW9k+WJjeixhuWtkDogXCIgKyB0aGlzLl9mb3JtYXRHb2xkKGN1cnJlbnRHb2xkKSArIFwiXFxu6ZyA6KaB6LGG5a2QOiBcIiArIHRoaXMuX2Zvcm1hdEdvbGQocmVxdWlyZWRHb2xkKSArIFwiXFxuXFxu6KeC55yL5r+A5Yqx6KeG6aKR5bm/5ZGK5Y+v6I635Y+W6LGG5a2QXCJcbiAgICAgICAgY29udGVudExhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgY29udGVudExhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgY29udGVudExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgY29udGVudExhYmVsLm92ZXJmbG93ID0gY2MuTGFiZWwuT3ZlcmZsb3cuUkVTSVpFX0hFSUdIVFxuICAgICAgICBjb250ZW50Tm9kZS53aWR0aCA9IHBvcHVwV2lkdGggLSA2MFxuICAgICAgICBjb250ZW50Tm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMjAsIDIyMCwgMjIwKVxuICAgICAgICBjb250ZW50Tm9kZS55ID0gMjBcbiAgICAgICAgY29udGVudE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7ljLrln59cbiAgICAgICAgdmFyIGJ0bkFyZWFOb2RlID0gbmV3IGNjLk5vZGUoXCJCdXR0b25BcmVhXCIpXG4gICAgICAgIGJ0bkFyZWFOb2RlLnkgPSAtcG9wdXBIZWlnaHQvMiArIDYwXG4gICAgICAgIGJ0bkFyZWFOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6KeC55yL5bm/5ZGK5oyJ6ZKuXG4gICAgICAgIHZhciBhZEJ0biA9IG5ldyBjYy5Ob2RlKFwiQWRCdG5cIilcbiAgICAgICAgdmFyIGFkQmcgPSBhZEJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGFkQmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCAxODAsIDgwKVxuICAgICAgICBhZEJnLnJvdW5kUmVjdCgtMTAwLCAtMjUsIDIwMCwgNTAsIDI1KVxuICAgICAgICBhZEJnLmZpbGwoKVxuICAgICAgICBhZEJ0bi54ID0gLTExMFxuICAgICAgICBhZEJ0bi5wYXJlbnQgPSBidG5BcmVhTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGFkTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgYWRMYWJlbCA9IGFkTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgYWRMYWJlbC5zdHJpbmcgPSBcIuingueci+W5v+WRilwiXG4gICAgICAgIGFkTGFiZWwuZm9udFNpemUgPSAyMFxuICAgICAgICBhZExhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgYWRMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgYWRMYWJlbE5vZGUucGFyZW50ID0gYWRCdG5cbiAgICAgICAgXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOheaMiemSrlxuICAgICAgICB2YXIgbG9iYnlCdG4gPSBuZXcgY2MuTm9kZShcIkxvYmJ5QnRuXCIpXG4gICAgICAgIHZhciBsb2JieUJnID0gbG9iYnlCdG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBsb2JieUJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDgwLCAxNDApXG4gICAgICAgIGxvYmJ5Qmcucm91bmRSZWN0KC0xMDAsIC0yNSwgMjAwLCA1MCwgMjUpXG4gICAgICAgIGxvYmJ5QmcuZmlsbCgpXG4gICAgICAgIGxvYmJ5QnRuLnggPSAxMTBcbiAgICAgICAgbG9iYnlCdG4ucGFyZW50ID0gYnRuQXJlYU5vZGVcbiAgICAgICAgXG4gICAgICAgIHZhciBsb2JieUxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGxvYmJ5TGFiZWwgPSBsb2JieUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxvYmJ5TGFiZWwuc3RyaW5nID0gXCLov5Tlm57lpKfljoVcIlxuICAgICAgICBsb2JieUxhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbG9iYnlMYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIGxvYmJ5TGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGxvYmJ5TGFiZWxOb2RlLnBhcmVudCA9IGxvYmJ5QnRuXG4gICAgICAgIFxuICAgICAgICAvLyDlrZjlgqjoioLngrnlvJXnlKhcbiAgICAgICAgc2VsZi5faW5zdWZmaWNpZW50R29sZFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHNlbGYuX2luc3VmZmljaWVudEdvbGRNYXNrID0gbWFza05vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOingueci+W5v+WRiuaMiemSrueCueWHu+S6i+S7tlxuICAgICAgICBhZEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fd2F0Y2hBZEZvckdvbGQoZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOW5v+WRiuingueci+aIkOWKn++8jOWFs+mXreW8ueeql+W5tue7p+e7rea4uOaIj1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCgpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RvQ29udGludWVHYW1lKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g6L+U5Zue5aSn5Y6F5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICAgIGxvYmJ5QnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCgpXG4gICAgICAgICAgICBzZWxmLl9yZXR1cm5Ub0xvYmJ5KClcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlhbPpl63osYblrZDkuI3otrPlvLnnqpdcbiAgICAgKi9cbiAgICBfY2xvc2VJbnN1ZmZpY2llbnRHb2xkUG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5faW5zdWZmaWNpZW50R29sZFBvcHVwKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkUG9wdXAuZGVzdHJveSgpXG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkUG9wdXAgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2luc3VmZmljaWVudEdvbGRNYXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkTWFzay5kZXN0cm95KClcbiAgICAgICAgICAgIHRoaXMuX2luc3VmZmljaWVudEdvbGRNYXNrID0gbnVsbFxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6KeC55yL5r+A5Yqx6KeG6aKR5bm/5ZGK6I635Y+W6LGG5a2QXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSDlm57osIPlh73mlbDvvIzlj4LmlbDkuLrmmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBfd2F0Y2hBZEZvckdvbGQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJ5bm/5ZGKU0RL77yI5Y+v5qC55o2u5a6e6ZmF6ZuG5oiQ55qE5bm/5ZGKU0RL6LCD5pW077yJXG4gICAgICAgIC8vIOi/memHjOaPkOS+m+S4gOS4qumAmueUqOeahOWunueOsOahhuaetlxuICAgICAgICBcbiAgICAgICAgLy8g5pa55byPMTog5aaC5p6c6ZuG5oiQ5LqG56m/5bGx55Sy5bm/5ZGKU0RLIChCeXRlZGFuY2UpXG4gICAgICAgIGlmICh0eXBlb2YgdHQgIT09ICd1bmRlZmluZWQnICYmIHR0LnNob3dSZXdhcmRlZFZpZGVvQWQpIHtcbiAgICAgICAgICAgIHR0LnNob3dSZXdhcmRlZFZpZGVvQWQoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlub/lkYrop4LnnIvmiJDlip/vvIzlpZblirHosYblrZBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmV3YXJkR29sZEFmdGVyQWQoY2FsbGJhY2spXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5bm/5ZGK6KeC55yL5aSx6LSlXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5bm/5ZGK5Yqg6L295aSx6LSl77yM6K+356iN5ZCO6YeN6K+VXCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnlvI8yOiDlpoLmnpzpm4bmiJDkuoblvq7kv6HlsI/muLjmiI/lub/lkYpTREtcbiAgICAgICAgaWYgKHR5cGVvZiB3eCAhPT0gJ3VuZGVmaW5lZCcgJiYgd3guY3JlYXRlUmV3YXJkZWRWaWRlb0FkKSB7XG4gICAgICAgICAgICB2YXIgcmV3YXJkZWRWaWRlb0FkID0gd3guY3JlYXRlUmV3YXJkZWRWaWRlb0FkKHtcbiAgICAgICAgICAgICAgICBhZFVuaXRJZDogJ2FkdW5pdC14eHgnIC8vIOabv+aNouS4uuWunumZheeahOW5v+WRiuWNleWFg0lEXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQub25DbG9zZShmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzICYmIHJlcy5pc0VuZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOeUqOaIt+WujOaVtOingueci+S6huW5v+WRilxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZXdhcmRHb2xkQWZ0ZXJBZChjYWxsYmFjaylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDnlKjmiLfmj5DliY3lhbPpl63kuoblub/lkYpcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLor7flrozmlbTop4LnnIvlub/lkYrojrflj5blpZblirFcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhmYWxzZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQub25FcnJvcihmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuW5v+WRiuWKoOi9veWksei0pe+8jOivt+eojeWQjumHjeivlVwiKVxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQuc2hvdygpLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIOWksei0pemHjeivlVxuICAgICAgICAgICAgICAgIHJld2FyZGVkVmlkZW9BZC5sb2FkKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZGVkVmlkZW9BZC5zaG93KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnlvI8zOiDmqKHmi5/lub/lkYrvvIjlvIDlj5HmtYvor5XnlKjvvIlcbiAgICAgICAgLy8g5Zyo5a6e6ZmF5Y+R5biD5pe25bqU6K+l5Yig6Zmk5q2k5YiG5pSv5oiW5pu/5o2i5Li655yf5a6e5bm/5ZGKU0RLXG4gICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5q2j5Zyo5Yqg6L295bm/5ZGKLi4uXCIpXG4gICAgICAgIFxuICAgICAgICAvLyDmqKHmi5/lub/lkYrop4LnnIvov4fnqIvvvIgy56eS5ZCO5aWW5Yqx6LGG5a2Q77yJXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9yZXdhcmRHb2xkQWZ0ZXJBZChjYWxsYmFjaylcbiAgICAgICAgfSwgMjAwMClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlub/lkYrop4LnnIvmiJDlip/lkI7lpZblirHosYblrZBcbiAgICAgKi9cbiAgICBfcmV3YXJkR29sZEFmdGVyR29sZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnBsYXllckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aWW5Yqx6LGG5a2Q5pWw6YeP77yI5Y+v5qC55o2u5a6e6ZmF6ZyA5rGC6LCD5pW077yJXG4gICAgICAgIHZhciByZXdhcmRBbW91bnQgPSA1MDAwXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDmnKzlnLDosYblrZDmlbDph49cbiAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS51cGRhdGVHb2xkKHJld2FyZEFtb3VudClcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuWlluWKseaPkOekulxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuiOt+W+lyBcIiArIHRoaXMuX2Zvcm1hdEdvbGQocmV3YXJkQW1vdW50KSArIFwiIOixhuWtkO+8gVwiKVxuICAgICAgICBcbiAgICAgICAgLy8g6YCa55+l5pyN5Yqh56uv77yI5aaC5p6c6ZyA6KaB5ZCM5q2l77yJXG4gICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LnNlbmRBZFJld2FyZCkge1xuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnNlbmRBZFJld2FyZChyZXdhcmRBbW91bnQpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHlub/lkYrop4LnnIvmiJDlip/lkI7lpZblirHosYblrZDvvIjkv67mraPmlrnms5XlkI3mi7zlhpnplJnor6/vvIlcbiAgICAgKi9cbiAgICBfcmV3YXJkR29sZEFmdGVyQWQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWlluWKseixhuWtkOaVsOmHj++8iOWPr+agueaNruWunumZhemcgOaxguiwg+aVtO+8iVxuICAgICAgICB2YXIgcmV3YXJkQW1vdW50ID0gNTAwMFxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5pys5Zyw6LGG5a2Q5pWw6YePXG4gICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEudXBkYXRlR29sZChyZXdhcmRBbW91bnQpXG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrlpZblirHmj5DnpLpcbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLojrflvpcgXCIgKyB0aGlzLl9mb3JtYXRHb2xkKHJld2FyZEFtb3VudCkgKyBcIiDosYblrZDvvIFcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOmAmuefpeacjeWKoeerr++8iOWmguaenOmcgOimgeWQjOatpe+8iVxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5zZW5kQWRSZXdhcmQpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5zZW5kQWRSZXdhcmQocmV3YXJkQW1vdW50KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKHRydWUpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qC85byP5YyW6LGG5a2Q5pWw6YeP5pi+56S6XG4gICAgICovXG4gICAgX2Zvcm1hdEdvbGQ6IGZ1bmN0aW9uKGdvbGQpIHtcbiAgICAgICAgaWYgKGdvbGQgPj0gMTAwMDApIHtcbiAgICAgICAgICAgIHJldHVybiAoZ29sZCAvIDEwMDAwKS50b0ZpeGVkKDEpICsgXCLkuIdcIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnb2xkLnRvU3RyaW5nKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmmL7npLrmtojmga/mj5DnpLpcbiAgICAgKi9cbiAgICBfc2hvd01lc3NhZ2U6IGZ1bmN0aW9uKG1zZykge1xuICAgICAgICBpZiAodGhpcy50aXBzTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IG1zZ1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDov5Tlm57lpKfljoVcbiAgICAgKi9cbiAgICBfcmV0dXJuVG9Mb2JieTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIblvZPliY3muLjmiI/nirbmgIFcbiAgICAgICAgdGhpcy5fcmVzZXRHYW1lU3RhdGUoKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R6YCB56a75byA5oi/6Ze06K+35rGCXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20pIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20oKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW19yZXR1cm5Ub0xvYmJ5XSBteWdsb2JhbC5zb2NrZXQubGVhdmVSb29tIOS4jeWPr+eUqFwiKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3lpKfljoXlnLrmma9cbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDph43nva7muLjmiI/nirbmgIFcbiAgICAgKi9cbiAgICBfcmVzZXRHYW1lU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIbmiYvniYxcbiAgICAgICAgdGhpcy5oYW5kQ2FyZHMgPSBbXVxuICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW11cbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW11cbiAgICAgICAgXG4gICAgICAgIC8vIOa4heeQhuWNoeeJjOiKgueCuVxuICAgICAgICB0aGlzLmNsZWFyQWxsQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea4heeQhuaJgOacieeOqeWutueahOWHuueJjOWMuuWfn++8iOahjOmdouS4iueahOeJjO+8iVxuICAgICAgICB0aGlzLl9jbGVhckFsbE91dENhcmRab25lcygpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5riF55CG5bqV54mM6IqC54K5XG4gICAgICAgIHRoaXMuX2NsZWFyQm90dG9tQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5ri45oiP6Zi25q61XG4gICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/miYDmnIlVSVxuICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR6YeN572u5omA5pyJ546p5a6255qE5YeG5aSH5Zu+5qCH54q25oCBXG4gICAgICAgIHRoaXMuX3Jlc2V0QWxsUGxheWVyUmVhZHlTdGF0ZSgpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5riF55CG5omA5pyJ546p5a6255qE5Ye654mM5Yy65Z+fXG4gICAgICovXG4gICAgX2NsZWFyQWxsT3V0Q2FyZFpvbmVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPliBnYW1lU2NlbmUg6ISa5pysXG4gICAgICAgIHZhciBnYW1lU2NlbmVfc2NyaXB0ID0gdGhpcy5ub2RlLnBhcmVudCA/IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpIDogbnVsbFxuICAgICAgICBpZiAoIWdhbWVTY2VuZV9zY3JpcHQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW19jbGVhckFsbE91dENhcmRab25lc10g5peg5rOV6I635Y+WIGdhbWVTY2VuZVwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPlueOqeWutuW6p+S9jeiKgueCuVxuICAgICAgICB2YXIgcGxheWVyc19zZWF0X3BvcyA9IGdhbWVTY2VuZV9zY3JpcHQucGxheWVyc19zZWF0X3Bvc1xuICAgICAgICBpZiAoIXBsYXllcnNfc2VhdF9wb3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW19jbGVhckFsbE91dENhcmRab25lc10g5peg5rOV6I635Y+WIHBsYXllcnNfc2VhdF9wb3NcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpgY3ljobmiYDmnInluqfkvY3vvIzmuIXnkIblh7rniYzljLrln59cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gcGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc2VhdE5vZGUgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgLy8g5p+l5om+5Ye654mM5Yy65Z+f6IqC54K577yIY2FyZHNvdXR6b25lMCwgY2FyZHNvdXR6b25lMSwgY2FyZHNvdXR6b25lMu+8iVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3V0Wm9uZU5hbWUgPSBcImNhcmRzb3V0em9uZVwiICsgalxuICAgICAgICAgICAgICAgIHZhciBvdXRab25lID0gc2VhdE5vZGUuZ2V0Q2hpbGRCeU5hbWUob3V0Wm9uZU5hbWUpXG4gICAgICAgICAgICAgICAgaWYgKG91dFpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0Wm9uZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkea4heeQhuW6leeJjOiKgueCuVxuICAgICAqL1xuICAgIF9jbGVhckJvdHRvbUNhcmRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOmUgOavgeW6leeJjOiKgueCuVxuICAgICAgICBpZiAodGhpcy5ib3R0b21fY2FyZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJvdHRvbV9jYXJkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm90dG9tX2NhcmRbaV0gJiYgdGhpcy5ib3R0b21fY2FyZFtpXS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tX2NhcmRbaV0uZGVzdHJveSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkemHjee9ruaJgOacieeOqeWutueahOWHhuWkh+Wbvuagh+eKtuaAgVxuICAgICAqL1xuICAgIF9yZXNldEFsbFBsYXllclJlYWR5U3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQgPyB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKSA6IG51bGxcbiAgICAgICAgaWYgKCFnYW1lU2NlbmVfc2NyaXB0IHx8ICFnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgIGlmIChwbGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllclNjcmlwdCA9IHBsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyU2NyaXB0ICYmIHBsYXllclNjcmlwdC5yZWFkeWltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5yZWFkeWltYWdlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw546p5a626IqC54K555qE6YeR5biB5pi+56S6XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllcklkIC0g546p5a62SURcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZ29sZCAtIOaWsOeahOmHkeW4geaVsOmHj1xuICAgICAqL1xuICAgIF91cGRhdGVQbGF5ZXJHb2xkRGlzcGxheTogZnVuY3Rpb24ocGxheWVySWQsIGdvbGQpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPliBnYW1lU2NlbmUg6ISa5pysXG4gICAgICAgIHZhciBnYW1lU2NlbmVfc2NyaXB0ID0gdGhpcy5ub2RlLnBhcmVudCA/IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpIDogbnVsbFxuICAgICAgICBpZiAoIWdhbWVTY2VuZV9zY3JpcHQgfHwgIWdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3QpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfj4YgW191cGRhdGVQbGF5ZXJHb2xkRGlzcGxheV0g5peg5rOV6I635Y+WIGdhbWVTY2VuZSDmiJYgcGxheWVyTm9kZUxpc3RcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpgY3ljobmiYDmnInnjqnlrrboioLngrnvvIzmib7liLDljLnphY3nmoTnjqnlrrblubbmm7TmlrDph5HluIHmmL7npLpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgIGlmICghcGxheWVyTm9kZSkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBsYXllclNjcmlwdCA9IHBsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgIGlmICghcGxheWVyU2NyaXB0KSBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDljLnphY3njqnlrrZJRFxuICAgICAgICAgICAgaWYgKFN0cmluZyhwbGF5ZXJTY3JpcHQuYWNjb3VudGlkKSA9PT0gU3RyaW5nKHBsYXllcklkKSkge1xuICAgICAgICAgICAgICAgIC8vIOabtOaWsOmHkeW4geaYvuekulxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJTY3JpcHQuZ2xvYmFsY291bnRfbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2NyaXB0Lmdsb2JhbGNvdW50X2xhYmVsLnN0cmluZyA9IFN0cmluZyhnb2xkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmm7TmlrDnjqnlrrboioLngrnnmoTnq57mioDluIHmmL7npLrvvIjnq57mioDlnLrmqKHlvI/kuJPnlKjvvIlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGxheWVySWQgLSDnjqnlrrZJRFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBtYXRjaENvaW4gLSDmlrDnmoTnq57mioDluIHmlbDph49cbiAgICAgKi9cbiAgICBfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24ocGxheWVySWQsIG1hdGNoQ29pbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW191cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5XSDmm7TmlrDnjqnlrrbnq57mioDluIE6IHBsYXllcklkPVwiLCBwbGF5ZXJJZCwgXCJtYXRjaENvaW49XCIsIG1hdGNoQ29pbilcblxuICAgICAgICAvLyDojrflj5YgZ2FtZVNjZW5lIOiEmuacrFxuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQgPyB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKSA6IG51bGxcbiAgICAgICAgaWYgKCFnYW1lU2NlbmVfc2NyaXB0IHx8ICFnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4+f77iPIFtfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheV0g5peg5rOV6I635Y+WIGdhbWVTY2VuZSDmiJYgcGxheWVyTm9kZUxpc3RcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6YGN5Y6G5omA5pyJ546p5a626IqC54K577yM5om+5Yiw5Yy56YWN55qE546p5a625bm25pu05paw56ue5oqA5biB5pi+56S6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZVNjZW5lX3NjcmlwdC5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBsYXllck5vZGUgPSBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICBpZiAoIXBsYXllck5vZGUpIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIHZhciBwbGF5ZXJTY3JpcHQgPSBwbGF5ZXJOb2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICBpZiAoIXBsYXllclNjcmlwdCkgY29udGludWVcblxuICAgICAgICAgICAgLy8g5Yy56YWN546p5a62SURcbiAgICAgICAgICAgIGlmIChTdHJpbmcocGxheWVyU2NyaXB0LmFjY291bnRpZCkgPT09IFN0cmluZyhwbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDnq57mioDluIHmmL7npLpcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyU2NyaXB0Lmdsb2JhbGNvdW50X2xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5nbG9iYWxjb3VudF9sYWJlbC5zdHJpbmcgPSBTdHJpbmcobWF0Y2hDb2luKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW191cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5XSDlt7Lmm7TmlrDnjqnlrrYgXCIsIHBsYXllcklkLCBcIiDnmoTnq57mioDluIHmmL7npLrkuLogXCIsIG1hdGNoQ29pbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOernuaKgOW4geWIsOeOqeWutuiEmuacrOWunuS+i1xuICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5fbWF0Y2hDb2luID0gbWF0Y2hDb2luXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDjgJDnq57mioDlnLrjgJHlip/og73lh73mlbBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHmmL7npLrnq57mioDlnLrkuJPnlKjnu5PnrpflvLnnqpdcbiAgICAgKiDnq57mioDlnLrnu5PnrpfpobXkuI7mma7pgJrlnLrkuI3lkIzvvJpcbiAgICAgKiAtIOWPquaYvuekuu+8mui+k+i1ouOAgeWAjeaVsOOAgeW9k+WJjeavlOi1m+mHkeW4gVxuICAgICAqIC0g5LiN5pi+56S677ya57un57ut5ri45oiP44CB6L+U5Zue5aSn5Y6F5oyJ6ZKuXG4gICAgICogLSDmmL7npLrvvJpcIuS4i+S4gOWxgOW8gOWniyAxNeenklwiIOWAkuiuoeaXtlxuICAgICAqIFxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlpoLmnpzmmK/mnIDnu4jnu5PnrpfvvIjlj6rmnIkz5Lq677yJ77yM6Lez6L+H5q2k5by556qX77yM562J5b6FIG9uQ29tcGV0aXRpb25DaGFtcGlvbiDmtojmga/mmL7npLrmjpLlkI1cbiAgICAgKi9cbiAgICBfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5qOA5p+l5piv5ZCm5piv5pyA57uI57uT566X77yI5Y+q5pyJM+S6uuWPgui1m++8iVxuICAgICAgICAvLyDlpoLmnpzmmK/mnIDnu4jnu5PnrpfvvIzot7Pov4fmraTlvLnnqpfvvIznrYnlvoUgb25Db21wZXRpdGlvbkNoYW1waW9uIOa2iOaBr+aYvuekuuaOkuWQjVxuICAgICAgICBpZiAoZGF0YS5pc19maW5hbF9yb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXBdIOajgOa1i+WIsOacgOe7iOe7k+eul++8iOWPquaciTPkurrvvInvvIzot7Pov4fkuK3pl7Tnu5PnrpflvLnnqpfvvIznrYnlvoXmjpLlkI3mtojmga9cIilcbiAgICAgICAgICAgIC8vIOS4jeaYvuekuuS4remXtOW8ueeql++8jOebtOaOpeetieW+hSBvbkNvbXBldGl0aW9uQ2hhbXBpb24g5raI5oGvXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHdpblNpemUgPSBjYy53aW5TaXplXG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgXG4gICAgICAgIC8vIOWIpOaWrei+k+i1olxuICAgICAgICB2YXIgaXNXaW5uZXIgPSBmYWxzZVxuICAgICAgICB2YXIgbXlXaW5Hb2xkID0gMFxuICAgICAgICB2YXIgbXlNYXRjaENvaW4gPSAwICAvLyDwn5Sn44CQ5paw5aKe44CR5b2T5YmN546p5a6255qE6YeR5biB77yI5LuOZGF0YS5wbGF5ZXJz6I635Y+W77yJXG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5wbGF5ZXJzICYmIGRhdGEucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcnNbaV1cbiAgICAgICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllci5wbGF5ZXJfaWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNXaW5uZXIgPSBwbGF5ZXIuaXNfd2lubmVyXG4gICAgICAgICAgICAgICAgICAgIG15V2luR29sZCA9IHBsYXllci53aW5fZ29sZFxuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LuO5pyN5Yqh56uv6L+U5Zue55qE546p5a625pWw5o2u5Lit6I635Y+W6YeR5biBXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubWF0Y2hfY29pbiAhPT0gdW5kZWZpbmVkICYmIHBsYXllci5tYXRjaF9jb2luID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG15TWF0Y2hDb2luID0gcGxheWVyLm1hdGNoX2NvaW5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeabtOaWsOW9k+WJjeeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICB0aGlzLl9tYXRjaENvaW4gPSBteU1hdGNoQ29pblxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmm7TmlrDmiYDmnInnjqnlrrbnmoTph5HluIHmmL7npLpcbiAgICAgICAgaWYgKGRhdGEucGxheWVycyAmJiBkYXRhLnBsYXllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXJzW2ldXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllcklkID0gcGxheWVyLnBsYXllcl9pZFxuICAgICAgICAgICAgICAgIHZhciBtYXRjaENvaW4gPSBwbGF5ZXIubWF0Y2hfY29pblxuXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeernuaKgOWcuuaooeW8j+S4i+abtOaWsOeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICAgICAgICAgIGlmIChtYXRjaENvaW4gIT09IHVuZGVmaW5lZCAmJiBtYXRjaENvaW4gPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5KHBsYXllcklkLCBtYXRjaENvaW4pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyDpga7nvanlsYJcbiAgICAgICAgdmFyIG1hc2tOb2RlID0gbmV3IGNjLk5vZGUoXCJDb21wZXRpdGlvblJlc3VsdE1hc2tcIilcbiAgICAgICAgbWFza05vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIG1hc2tOb2RlLmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMCwgMzAsIDUwKSA6IG5ldyBjYy5Db2xvcigzMCwgMCwgMClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDIwMFxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS56SW5kZXggPSA5OTlcbiAgICAgICAgbWFza05vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29tcGV0aXRpb25SZXN1bHRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIHZhciBwb3B1cFdpZHRoID0gNDUwXG4gICAgICAgIHZhciBwb3B1cEhlaWdodCA9IDM4MCAgLy8g8J+Up+OAkOiwg+aVtOOAkeWinuWKoOmrmOW6puS7peWuuee6s+WAkuiuoeaXtlxuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDQwLCA1MCwgODAsIDI0MCkgOiBuZXcgY2MuQ29sb3IoNTAsIDM1LCA0MCwgMjQwKVxuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuZmlsbCgpXG4gICAgICAgIGJnLnN0cm9rZUNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMTAwLCAyMDAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMjAwLCAxMDAsIDEwMClcbiAgICAgICAgYmcubGluZVdpZHRoID0gM1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBpc1dpbm5lciA/IFwi8J+OiSDog5zliKkg8J+OiVwiIDogXCLinJYg5aSx6LSlIOKcllwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAzNlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigxMDAsIDI1NSwgMjAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDE1MCwgMTUwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA1MFxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR6L6T6LWi6YeR6aKdIC0g56ue5oqA5Zy65pi+56S6XCLph5HluIFcIu+8iOS4jeaYr+ernuaKgOW4ge+8iVxuICAgICAgICB2YXIgcmVzdWx0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmVzdWx0XCIpXG4gICAgICAgIHZhciByZXN1bHRMYWJlbCA9IHJlc3VsdE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICByZXN1bHRMYWJlbC5zdHJpbmcgPSBcIuacrOWxgOe7k+aenDogXCIgKyAobXlXaW5Hb2xkID49IDAgPyBcIitcIiA6IFwiXCIpICsgbXlXaW5Hb2xkICsgXCIg6YeR5biBXCJcbiAgICAgICAgcmVzdWx0TGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICByZXN1bHROb2RlLmNvbG9yID0gbXlXaW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMTAwLCAyNTUsIDEwMCkgOiBuZXcgY2MuQ29sb3IoMjU1LCAxMDAsIDEwMClcbiAgICAgICAgcmVzdWx0Tm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDEwMFxuICAgICAgICByZXN1bHROb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5YCN5pWwXG4gICAgICAgIHZhciBtdWx0aU5vZGUgPSBuZXcgY2MuTm9kZShcIk11bHRpcGxpZXJcIilcbiAgICAgICAgdmFyIG11bHRpTGFiZWwgPSBtdWx0aU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBtdWx0aUxhYmVsLnN0cmluZyA9IFwi5pys5bGA5YCN5pWwOiB4XCIgKyAoZGF0YS5tdWx0aXBsZSB8fCAxKVxuICAgICAgICBtdWx0aUxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgbXVsdGlOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxNTApXG4gICAgICAgIG11bHRpTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE0MFxuICAgICAgICBtdWx0aU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5b2T5YmN6YeR5biB77yI5LiN5piv56ue5oqA5biB77yJXG4gICAgICAgIHZhciBjb2luTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTWF0Y2hDb2luXCIpXG4gICAgICAgIHZhciBjb2luTGFiZWwgPSBjb2luTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvaW5MYWJlbC5zdHJpbmcgPSBcIuW9k+WJjemHkeW4gTogXCIgKyB0aGlzLl9tYXRjaENvaW5cbiAgICAgICAgY29pbkxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgY29pbk5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgY29pbk5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAxODBcbiAgICAgICAgY29pbk5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeernuaKgOWcuuWAkuiuoeaXtlxuICAgICAgICAvLyDkuI3mmL7npLpcIue7p+e7rea4uOaIj1wi5ZKMXCLov5Tlm57lpKfljoVcIuaMiemSrlxuICAgICAgICAvLyDmmL7npLrmnI3liqHnq6/mjqfliLbnmoQzMOenkuWAkuiuoeaXtlxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5LuOIGdhbWVfb3ZlciDmlbDmja7kuK3ojrflj5bliJ3lp4vlgJLorqHml7bvvIznq4vljbPlkK/liqjmnKzlnLDlgJLorqHml7ZcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5LuO5pyN5Yqh56uv5pWw5o2u6I635Y+W5Yid5aeL5YCS6K6h5pe25YC8XG4gICAgICAgIHZhciBpbml0aWFsQ291bnRkb3duID0gZGF0YS5hcmVuYV9jb3VudGRvd24gfHwgMzBcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaYvuekuuWuueWZqFxuICAgICAgICB2YXIgY291bnRkb3duQ29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJDb3VudGRvd25Db250YWluZXJcIilcbiAgICAgICAgY291bnRkb3duQ29udGFpbmVyLnkgPSAtcG9wdXBIZWlnaHQvMiArIDgwXG4gICAgICAgIGNvdW50ZG93bkNvbnRhaW5lci5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaWh+Wtl1xuICAgICAgICB2YXIgY291bnRkb3duTGFiZWwgPSBuZXcgY2MuTm9kZShcIkNvdW50ZG93bkxhYmVsXCIpXG4gICAgICAgIHZhciBjb3VudGRvd25MYWJlbENvbXAgPSBjb3VudGRvd25MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvdW50ZG93bkxhYmVsQ29tcC5zdHJpbmcgPSBcIuS4i+S4gOi9ruWwhuWcqCBcIiArIGluaXRpYWxDb3VudGRvd24gKyBcIiDnp5LlkI7lvIDlp4tcIlxuICAgICAgICBjb3VudGRvd25MYWJlbENvbXAuZm9udFNpemUgPSAyNlxuICAgICAgICBjb3VudGRvd25MYWJlbC5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgIC8vIOmHkem7hOiJslxuICAgICAgICBjb3VudGRvd25MYWJlbC5wYXJlbnQgPSBjb3VudGRvd25Db250YWluZXJcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaVsOWtl++8iOWkp+WPt+aYvuekuu+8iVxuICAgICAgICB2YXIgY291bnRkb3duTnVtYmVyID0gbmV3IGNjLk5vZGUoXCJDb3VudGRvd25OdW1iZXJcIilcbiAgICAgICAgdmFyIGNvdW50ZG93bk51bWJlckNvbXAgPSBjb3VudGRvd25OdW1iZXIuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb3VudGRvd25OdW1iZXJDb21wLnN0cmluZyA9IFN0cmluZyhpbml0aWFsQ291bnRkb3duKVxuICAgICAgICBjb3VudGRvd25OdW1iZXJDb21wLmZvbnRTaXplID0gNDhcbiAgICAgICAgY291bnRkb3duTnVtYmVyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGNvdW50ZG93bk51bWJlci55ID0gLTQ1XG4gICAgICAgIGNvdW50ZG93bk51bWJlci5wYXJlbnQgPSBjb3VudGRvd25Db250YWluZXJcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+ueaViOaenFxuICAgICAgICB2YXIgb3V0bGluZSA9IGNvdW50ZG93bk51bWJlci5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuQ29sb3IuQkxBQ0tcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueWHuuWKqOeUu1xuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4zNSwgeyBzY2FsZTogMSwgb3BhY2l0eTogMjU1IH0sIHsgZWFzaW5nOiAnYmFja091dCcgfSlcbiAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIFxuICAgICAgICAvLyDkv53lrZjlvJXnlKhcbiAgICAgICAgdGhpcy5fZ2FtZVJlc3VsdFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2dhbWVSZXN1bHRNYXNrID0gbWFza05vZGVcbiAgICAgICAgdGhpcy5fY291bnRkb3duTGFiZWxOb2RlID0gY291bnRkb3duTGFiZWxcbiAgICAgICAgdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSA9IGNvdW50ZG93bk51bWJlclxuICAgICAgICB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMgPSBpbml0aWFsQ291bnRkb3duXG4gICAgICAgIFxuICAgICAgICAvLyDmkq3mlL7pn7PmlYhcbiAgICAgICAgdGhpcy5fcGxheUdhbWVSZXN1bHRTb3VuZChpc1dpbm5lcilcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR56uL5Y2z5ZCv5Yqo5pys5Zyw5YCS6K6h5pe25a6a5pe25ZmoXG4gICAgICAgIC8vIOWQjOaXtuazqOWGjOacjeWKoeerr+a2iOaBr+ebkeWQrO+8jOWPjOS/nemZqeehruS/neWAkuiuoeaXtuato+W4uOW3peS9nFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgXG4gICAgICAgIC8vIOWQr+WKqOacrOWcsOWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICB0aGlzLl9zdGFydExvY2FsQXJlbmFDb3VudGRvd24oaW5pdGlhbENvdW50ZG93bilcbiAgICAgICAgXG4gICAgICAgIC8vIOazqOWGjOacjeWKoeerr+WAkuiuoeaXtua2iOaBr+ebkeWQrO+8iOS9nOS4uuWkh+S7ve+8iVxuICAgICAgICB0aGlzLl9zZXR1cEFyZW5hQ291bnRkb3duTGlzdGVuZXJzKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlkK/liqjmnKzlnLDnq57mioDlnLrlgJLorqHml7ZcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2Vjb25kcyAtIOWIneWni+WAkuiuoeaXtuenkuaVsFxuICAgICAqL1xuICAgIF9zdGFydExvY2FsQXJlbmFDb3VudGRvd246IGZ1bmN0aW9uKHNlY29uZHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19zdGFydExvY2FsQXJlbmFDb3VudGRvd25dIOW8gOWni+WQr+WKqOWAkuiuoeaXtiwgc2Vjb25kczpcIiwgc2Vjb25kcylcbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouS5i+WJjeeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyKSB7XG4gICAgICAgICAgICB0aGlzLnVuc2NoZWR1bGUodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpY2spXG4gICAgICAgICAgICB0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IHNlY29uZHNcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnoa7kv53liJ3lp4tVSeato+ehruaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKHNlY29uZHMpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55SoIGNjLmRpcmVjdG9yIOeahOaXtumXtOiwg+W6pu+8jOehruS/neWcqOaJgOacieaDheWGteS4i+mDveiDveW3peS9nFxuICAgICAgICAvLyDmr4/np5J0aWNr5LiA5qyh77yM5peg6ZmQ6YeN5aSNXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpY2ssIDEsIGNjLm1hY3JvLlJFUEVBVF9GT1JFVkVSLCAxKVxuICAgICAgICB0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19zdGFydExvY2FsQXJlbmFDb3VudGRvd25dIOacrOWcsOWAkuiuoeaXtuW3suWQr+WKqFwiKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeacrOWcsOernuaKgOWcuuWAkuiuoeaXtlRpY2tcbiAgICAgKi9cbiAgICBfbG9jYWxBcmVuYUNvdW50ZG93blRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYXJlbmFDb3VudGRvd25TZWNvbmRzIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGljaylcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lciA9IG51bGxcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrXSDlgJLorqHml7bnu5PmnZ/vvIznrYnlvoXmnI3liqHnq6/mtojmga8uLi5cIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWAkuiuoeaXtuW9kjDlkI7mmL7npLrnrYnlvoXmj5DnpLrvvIznu6fnu63nrYnlvoXmnI3liqHnq6/mtojmga9cbiAgICAgICAgICAgIC8vIOacjeWKoeerr+S8muWPkemAgSBNc2dBcmVuYUF1dG9SZWFkeSDmiJbmlrDkuIDova7muLjmiI/mtojmga9cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUFyZW5hQ291bnRkb3duVUkoMClcbiAgICAgICAgICAgIHRoaXMuX3Nob3dXYWl0aW5nRm9yU2VydmVyKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMtLVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgdGhpcy5fdXBkYXRlQXJlbmFDb3VudGRvd25VSSh0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19sb2NhbEFyZW5hQ291bnRkb3duVGlja10g5Ymp5L2ZOlwiLCB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pi+56S6562J5b6F5pyN5Yqh56uv5ZON5bqU5o+Q56S6XG4gICAgICovXG4gICAgX3Nob3dXYWl0aW5nRm9yU2VydmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5YCS6K6h5pe25qCH562+5pi+56S6562J5b6F5o+Q56S6XG4gICAgICAgIGlmICh0aGlzLl9jb3VudGRvd25MYWJlbE5vZGUpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuX2NvdW50ZG93bkxhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBcIuetieW+heacjeWKoeWZqOWTjeW6lC4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+aVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBcIi4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHorr7nva7nq57mioDlnLrlgJLorqHml7bmtojmga/nm5HlkKxcbiAgICAgKiDnm5HlkKzmnI3liqHnq6/mjqjpgIHnmoTlgJLorqHml7bmtojmga/vvIjkvZzkuLrmnKzlnLDlgJLorqHml7bnmoTlpIfku73lkozlkIzmraXvvIlcbiAgICAgKi9cbiAgICBfc2V0dXBBcmVuYUNvdW50ZG93bkxpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+Pn++4jyBbX3NldHVwQXJlbmFDb3VudGRvd25MaXN0ZW5lcnNdIHNvY2tldOacquWIneWni+WMllwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOWAkuiuoeaXtuW8gOWni+a2iOaBr++8iOWmguaenOacjeWKoeerr+mHjeaWsOWPkemAge+8iVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25BcmVuYVJvdW5kQ291bnRkb3duKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbb25BcmVuYVJvdW5kQ291bnRkb3duXSDmlLbliLDlgJLorqHml7blvIDlp4s6XCIsIGRhdGEpXG4gICAgICAgICAgICAvLyDlkIzmraXmnI3liqHnq6/nmoTlgJLorqHml7blgLxcbiAgICAgICAgICAgIHNlbGYuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IGRhdGEuc2Vjb25kcyB8fCAzMFxuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQXJlbmFDb3VudGRvd25VSShkYXRhLnNlY29uZHMpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzlgJLorqHml7bmr4/np5Lmm7TmlrDmtojmga/vvIjlkIzmraXmnI3liqHnq6/nmoTlgJLorqHml7bvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQXJlbmFDb3VudGRvd25UaWNrKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbb25BcmVuYUNvdW50ZG93blRpY2tdIOacjeWKoeerr+WAkuiuoeaXtuWQjOatpTpcIiwgZGF0YS5zZWNvbmRzKVxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeWQjOatpeacjeWKoeerr+eahOWAkuiuoeaXtuWAvO+8jOehruS/neS4juacjeWKoeerr+S4gOiHtFxuICAgICAgICAgICAgc2VsZi5fYXJlbmFDb3VudGRvd25TZWNvbmRzID0gZGF0YS5zZWNvbmRzXG4gICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKGRhdGEuc2Vjb25kcylcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOiHquWKqOWHhuWkh+a2iOaBr1xuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25BcmVuYUF1dG9SZWFkeShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW29uQXJlbmFBdXRvUmVhZHldIOiHquWKqOWHhuWkhzpcIiwgZGF0YS5tZXNzYWdlKVxuICAgICAgICAgICAgLy8g5YGc5q2i5pys5Zyw5YCS6K6h5pe2XG4gICAgICAgICAgICBpZiAoc2VsZi5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bnNjaGVkdWxlKHNlbGYuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lciA9IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuX3Nob3dBcmVuYUF1dG9SZWFkeU1lc3NhZ2UoZGF0YS5tZXNzYWdlKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5pat57q/6YeN6L+e54q25oCB5oGi5aSNXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkFyZW5hUmVjb25uZWN0U3RhdGUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtvbkFyZW5hUmVjb25uZWN0U3RhdGVdIOeKtuaAgeaBouWkjTpcIiwgZGF0YSlcbiAgICAgICAgICAgIGlmIChkYXRhLnBoYXNlID09PSBcImNvdW50ZG93blwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fYXJlbmFDb3VudGRvd25TZWNvbmRzID0gZGF0YS5jb3VudGRvd25cbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKGRhdGEuY291bnRkb3duKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeabtOaWsOernuaKgOWcuuWAkuiuoeaXtlVJXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNlY29uZHMgLSDliankvZnnp5LmlbBcbiAgICAgKi9cbiAgICBfdXBkYXRlQXJlbmFDb3VudGRvd25VSTogZnVuY3Rpb24oc2Vjb25kcykge1xuICAgICAgICAvLyDmm7TmlrDmloflrZdcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZG93bkxhYmVsTm9kZSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5fY291bnRkb3duTGFiZWxOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5LiL5LiA6L2u5bCG5ZyoIFwiICsgc2Vjb25kcyArIFwiIOenkuWQjuW8gOWni1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOaVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdmFyIG51bUxhYmVsID0gdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobnVtTGFiZWwpIHtcbiAgICAgICAgICAgICAgICBudW1MYWJlbC5zdHJpbmcgPSBTdHJpbmcoc2Vjb25kcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pyA5ZCONeenkumXqueDgeaViOaenFxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gNSAmJiBzZWNvbmRzID4gMCkge1xuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXMuX2NvdW50ZG93bk51bWJlck5vZGUpXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjEsIHsgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHNjYWxlOiAxLjAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlj5jnuqJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3VudGRvd25OdW1iZXJOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMTAwLCAxMDApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvdW50ZG93bk51bWJlck5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWBnOatouernuaKgOWcuuWAkuiuoeaXtlxuICAgICAqL1xuICAgIF9zdG9wQXJlbmFDb3VudGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlgZzmraLmnKzlnLDlgJLorqHml7blrprml7blmahcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtfc3RvcEFyZW5hQ291bnRkb3duXSDlt7LlgZzmraLmnKzlnLDlgJLorqHml7ZcIilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5YCS6K6h5pe256eS5pWwXG4gICAgICAgIHRoaXMuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IDBcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmmL7npLrnq57mioDlnLroh6rliqjlh4blpIfmtojmga9cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSAtIOa2iOaBr+WGheWuuVxuICAgICAqL1xuICAgIF9zaG93QXJlbmFBdXRvUmVhZHlNZXNzYWdlOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIC8vIOabtOaWsOWAkuiuoeaXtuaYvuekuuS4uuiHquWKqOWHhuWkh+a2iOaBr1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTGFiZWxOb2RlKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLl9jb3VudGRvd25MYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gbWVzc2FnZSB8fCBcIuezu+e7n+W3suiHquWKqOWHhuWkh1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+aVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIbnq57mioDlnLrnirbmgIHmm7TmlrBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcm9vbV9jYXRlZ29yeSwgcm91bmQsIHRvdGFsX3JvdW5kcywgbWF0Y2hfY29pbiwgLi4uIH1cbiAgICAgKi9cbiAgICBfb25Db21wZXRpdGlvblN0YXR1czogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5faXNDb21wZXRpdGlvbiA9IChkYXRhLnJvb21fY2F0ZWdvcnkgPT09IDIpXG4gICAgICAgIHRoaXMuX3Jvb21DYXRlZ29yeSA9IGRhdGEucm9vbV9jYXRlZ29yeSB8fCAxXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uUm91bmQgPSBkYXRhLnJvdW5kIHx8IDBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Ub3RhbFJvdW5kcyA9IGRhdGEudG90YWxfcm91bmRzIHx8IDBcbiAgICAgICAgdGhpcy5fbWF0Y2hDb2luID0gZGF0YS5tYXRjaF9jb2luIHx8IDBcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOaYr+ernuaKgOWcuuaooeW8j++8jOaYvuekuuavlOi1m+mHkeW4gVxuICAgICAgICBpZiAodGhpcy5faXNDb21wZXRpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5WQ44CQ56ue5oqA5Zy644CR5aSE55CG56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSB7IGNvdW50ZG93biwgbWVzc2FnZSB9XG4gICAgICovXG4gICAgX29uQ29tcGV0aXRpb25Db3VudGRvd246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duID0gZGF0YS5jb3VudGRvd24gfHwgMTVcbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouS5i+WJjeeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fY29tcGV0aXRpb25Db3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGljaylcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5byA5aeL5paw55qE5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fY29tcGV0aXRpb25Db3VudGRvd25UaWNrLCAxKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOernuaKgOWcuuOAkeernuaKgOWcuuWAkuiuoeaXtlRpY2tcbiAgICAgKi9cbiAgICBfY29tcGV0aXRpb25Db3VudGRvd25UaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9jb21wZXRpdGlvbkNvdW50ZG93blRpY2spXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Db3VudGRvd24tLVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5YCS6K6h5pe25pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBldGl0aW9uQ291bnRkb3duRGlzcGxheSgpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5WQ44CQ56ue5oqA5Zy644CR5pu05paw56ue5oqA5Zy65YCS6K6h5pe25pi+56S6XG4gICAgICovXG4gICAgX3VwZGF0ZUNvbXBldGl0aW9uQ291bnRkb3duRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWmguaenOaciee7k+eul+W8ueeql++8jOabtOaWsOWFtuS4reeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fZ2FtZVJlc3VsdFBvcHVwKSB7XG4gICAgICAgICAgICB2YXIgY291bnRkb3duTGFiZWwgPSB0aGlzLl9nYW1lUmVzdWx0UG9wdXAuZ2V0Q2hpbGRCeU5hbWUoXCJDb21wZXRpdGlvbkNvdW50ZG93blwiKVxuICAgICAgICAgICAgaWYgKGNvdW50ZG93bkxhYmVsICYmIGNvdW50ZG93bkxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkpIHtcbiAgICAgICAgICAgICAgICBjb3VudGRvd25MYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi5LiL5LiA5bGA5byA5aeLIFwiICsgdGhpcy5fY29tcGV0aXRpb25Db3VudGRvd24gKyBcIuenklwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHlpITnkIbmr5TotZvph5HluIHmm7TmlrBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGxheWVyX2lkLCBtYXRjaF9jb2luLCBkZWx0YSB9XG4gICAgICovXG4gICAgX29uTWF0Y2hDb2luVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBteVBsYXllcklkID0gbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKS5pZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEXG4gICAgICAgIFxuICAgICAgICAvLyDlj6rmm7TmlrDoh6rlt7HnmoTmr5TotZvph5HluIFcbiAgICAgICAgaWYgKFN0cmluZyhkYXRhLnBsYXllcl9pZCkgPT09IFN0cmluZyhteVBsYXllcklkKSkge1xuICAgICAgICAgICAgdGhpcy5fbWF0Y2hDb2luID0gZGF0YS5tYXRjaF9jb2luXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVNYXRjaENvaW5EaXNwbGF5KGRhdGEubWF0Y2hfY29pbiwgZGF0YS5kZWx0YSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+qmeOAkOernuaKgOWcuuOAkeaYvuekuuavlOi1m+mHkeW4geaYvuekulxuICAgICAqL1xuICAgIF9zaG93TWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suWtmOWcqOavlOi1m+mHkeW4geaYvuekuuiKgueCuVxuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmr5TotZvph5HluIHmmL7npLroioLngrlcbiAgICAgICAgdmFyIG1hdGNoQ29pbk5vZGUgPSBuZXcgY2MuTm9kZShcIk1hdGNoQ29pbkRpc3BsYXlcIilcbiAgICAgICAgbWF0Y2hDb2luTm9kZS5zZXRQb3NpdGlvbigtMjAwLCAyODApICAvLyDlt6bkuIrop5LkvY3nva5cbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQwLCA4MCwgMjAwKVxuICAgICAgICBiZy5yb3VuZFJlY3QoLTgwLCAtMjAsIDE2MCwgNDAsIDEwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IG1hdGNoQ29pbk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWbvuagh++8iOmHkeW4geWbvuagh++8iVxuICAgICAgICB2YXIgaWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIkljb25cIilcbiAgICAgICAgdmFyIGljb25MYWJlbCA9IGljb25Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgaWNvbkxhYmVsLnN0cmluZyA9IFwi8J+qmVwiXG4gICAgICAgIGljb25MYWJlbC5mb250U2l6ZSA9IDIwXG4gICAgICAgIGljb25Ob2RlLnNldFBvc2l0aW9uKC01NSwgMClcbiAgICAgICAgaWNvbk5vZGUucGFyZW50ID0gbWF0Y2hDb2luTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH562+XG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHZhciBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5q+U6LWb6YeR5biBXCJcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxNFxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgbGFiZWxOb2RlLnNldFBvc2l0aW9uKC0yMCwgMClcbiAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IG1hdGNoQ29pbk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaVsOWAvFxuICAgICAgICB2YXIgdmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICB2YWx1ZU5vZGUubmFtZSA9IFwiTWF0Y2hDb2luVmFsdWVcIlxuICAgICAgICB2YXIgdmFsdWVMYWJlbCA9IHZhbHVlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhbHVlTGFiZWwuc3RyaW5nID0gU3RyaW5nKHRoaXMuX21hdGNoQ29pbilcbiAgICAgICAgdmFsdWVMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIHZhbHVlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIyMCwgMTAwKVxuICAgICAgICB2YWx1ZU5vZGUuc2V0UG9zaXRpb24oNDUsIDApXG4gICAgICAgIHZhbHVlTm9kZS5wYXJlbnQgPSBtYXRjaENvaW5Ob2RlXG4gICAgICAgIFxuICAgICAgICBtYXRjaENvaW5Ob2RlLnBhcmVudCA9IHRoaXMubm9kZVxuICAgICAgICB0aGlzLl9tYXRjaENvaW5Ob2RlID0gbWF0Y2hDb2luTm9kZVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+qmeOAkOernuaKgOWcuuOAkeabtOaWsOavlOi1m+mHkeW4geaYvuekulxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBtYXRjaENvaW4gLSDmlrDnmoTmr5TotZvph5HluIHmlbDph49cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGEgLSDlj5jljJbph49cbiAgICAgKi9cbiAgICBfdXBkYXRlTWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24obWF0Y2hDb2luLCBkZWx0YSkge1xuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlTm9kZSA9IHRoaXMuX21hdGNoQ29pbk5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJNYXRjaENvaW5WYWx1ZVwiKVxuICAgICAgICAgICAgaWYgKHZhbHVlTm9kZSAmJiB2YWx1ZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFN0cmluZyhtYXRjaENvaW4pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5pyJ5aKe6YeP77yM5pi+56S65Yqo55S7XG4gICAgICAgICAgICAgICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dNYXRjaENvaW5EZWx0YUFuaW1hdGlvbihkZWx0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHmmL7npLrmr5TotZvph5HluIHlj5jljJbliqjnlLtcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGEgLSDlj5jljJbph49cbiAgICAgKi9cbiAgICBfc2hvd01hdGNoQ29pbkRlbHRhQW5pbWF0aW9uOiBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICBpZiAoIXRoaXMuX21hdGNoQ29pbk5vZGUpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65Y+Y5YyW6YeP5pi+56S66IqC54K5XG4gICAgICAgIHZhciBkZWx0YU5vZGUgPSBuZXcgY2MuTm9kZShcIkRlbHRhXCIpXG4gICAgICAgIHZhciBkZWx0YUxhYmVsID0gZGVsdGFOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgZGVsdGFMYWJlbC5zdHJpbmcgPSAoZGVsdGEgPj0gMCA/IFwiK1wiIDogXCJcIikgKyBkZWx0YVxuICAgICAgICBkZWx0YUxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgZGVsdGFOb2RlLmNvbG9yID0gZGVsdGEgPj0gMCA/IG5ldyBjYy5Db2xvcigxMDAsIDI1NSwgMTAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDEwMCwgMTAwKVxuICAgICAgICBkZWx0YU5vZGUuc2V0UG9zaXRpb24oODAsIDApXG4gICAgICAgIGRlbHRhTm9kZS5wYXJlbnQgPSB0aGlzLl9tYXRjaENvaW5Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDpo5jlrZfliqjnlLtcbiAgICAgICAgY2MudHdlZW4oZGVsdGFOb2RlKVxuICAgICAgICAgICAgLnRvKDAuNSwgeyB5OiAzMCwgb3BhY2l0eTogMjU1IH0pXG4gICAgICAgICAgICAudG8oMC41LCB7IHk6IDUwLCBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkZWx0YU5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgKi9cbiAgICBfaGlkZU1hdGNoQ29pbkRpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fbWF0Y2hDb2luTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIHRoaXMuX21hdGNoQ29pbk5vZGUgPSBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKdjOOAkOernuaKgOWcuuOAkeWkhOeQhua3mOaxsOmAmuefpVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyByYW5rLCByZWFzb24sIHRvdGFsX3BsYXllcnMsIHJld2FyZHMgfVxuICAgICAqL1xuICAgIF9vbkNvbXBldGl0aW9uRWxpbWluYXRlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgLy8g5YGc5q2i5omA5pyJ5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgICAgdGhpcy5faGlkZU1hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65reY5rGw5by556qXXG4gICAgICAgIHRoaXMuX3Nob3dFbGltaW5hdGVkUG9wdXAoZGF0YSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKdjOOAkOernuaKgOWcuuOAkeaYvuekuua3mOaxsOW8ueeql1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyByYW5rLCByZWFzb24sIHRvdGFsX3BsYXllcnMsIHJld2FyZHMgfVxuICAgICAqL1xuICAgIF9zaG93RWxpbWluYXRlZFBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemVcbiAgICAgICAgXG4gICAgICAgIHZhciBjYW52YXMgPSBjYy5maW5kKFwiQ2FudmFzXCIpIHx8IGNjLmZpbmQoXCJVSV9ST09UXCIpIHx8IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgaWYgKCFjYW52YXMpIGNhbnZhcyA9IHRoaXMubm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5bGCXG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRWxpbWluYXRlZE1hc2tcIilcbiAgICAgICAgbWFza05vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIG1hc2tOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDApXG4gICAgICAgIG1hc2tOb2RlLm9wYWNpdHkgPSAxODBcbiAgICAgICAgbWFza05vZGUud2lkdGggPSB3aW5TaXplLndpZHRoICogMlxuICAgICAgICBtYXNrTm9kZS5oZWlnaHQgPSB3aW5TaXplLmhlaWdodCAqIDJcbiAgICAgICAgbWFza05vZGUuekluZGV4ID0gOTk5XG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g5by556qX5a655ZmoXG4gICAgICAgIHZhciBwb3B1cE5vZGUgPSBuZXcgY2MuTm9kZShcIkVsaW1pbmF0ZWRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIHZhciBwb3B1cFdpZHRoID0gNDAwXG4gICAgICAgIHZhciBwb3B1cEhlaWdodCA9IDM1MFxuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig2MCwgNDAsIDUwLCAyNDApXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDIwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxMDAsIDEwMClcbiAgICAgICAgYmcubGluZVdpZHRoID0gM1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuKdjCDmr5TotZvnu5PmnZ8g4p2MXCJcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDMyXG4gICAgICAgIHRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDE1MCwgMTUwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA1MFxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI1cbiAgICAgICAgdmFyIHJhbmtOb2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rXCIpXG4gICAgICAgIHZhciByYW5rTGFiZWwgPSByYW5rTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSBcIuacgOe7iOaOkuWQjTog56ysIFwiICsgZGF0YS5yYW5rICsgXCIg5ZCNXCJcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgcmFua05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDE1MClcbiAgICAgICAgcmFua05vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAxMDBcbiAgICAgICAgcmFua05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmt5jmsbDljp/lm6BcbiAgICAgICAgdmFyIHJlYXNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIlJlYXNvblwiKVxuICAgICAgICB2YXIgcmVhc29uTGFiZWwgPSByZWFzb25Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcmVhc29uTGFiZWwuc3RyaW5nID0gZGF0YS5yZWFzb24gfHwgXCLmr5TotZvlpLHliKlcIlxuICAgICAgICByZWFzb25MYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIHJlYXNvbk5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgcmVhc29uTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE0MFxuICAgICAgICByZWFzb25Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+C6LWb5Lq65pWwXG4gICAgICAgIHZhciB0b3RhbE5vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsXCIpXG4gICAgICAgIHZhciB0b3RhbExhYmVsID0gdG90YWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsSBcIiArIChkYXRhLnRvdGFsX3BsYXllcnMgfHwgMCkgKyBcIiDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgdG90YWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAxODApXG4gICAgICAgIHRvdGFsTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE4MFxuICAgICAgICB0b3RhbE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDlpZblirHvvIjlpoLmnpzmnInvvIlcbiAgICAgICAgaWYgKGRhdGEucmV3YXJkcykge1xuICAgICAgICAgICAgdmFyIHJld2FyZE5vZGUgPSBuZXcgY2MuTm9kZShcIlJld2FyZFwiKVxuICAgICAgICAgICAgdmFyIHJld2FyZExhYmVsID0gcmV3YXJkTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICByZXdhcmRMYWJlbC5zdHJpbmcgPSBcIuiOt+W+l+WlluWKsTogXCIgKyAoZGF0YS5yZXdhcmRzLm5hbWUgfHwgSlNPTi5zdHJpbmdpZnkoZGF0YS5yZXdhcmRzKSlcbiAgICAgICAgICAgIHJld2FyZExhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgICAgIHJld2FyZE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgICAgIHJld2FyZE5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAyMjBcbiAgICAgICAgICAgIHJld2FyZE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOheaMiemSrlxuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmV0dXJuQnRuXCIpXG4gICAgICAgIGJ0bk5vZGUuc2V0Q29udGVudFNpemUoMjAwLCA1MClcbiAgICAgICAgYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgdmFyIGJ0bkJnID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJ0bkJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDgwLCAxNDApXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjUsIDIwMCwgNTAsIDI1KVxuICAgICAgICBidG5CZy5maWxsKClcbiAgICAgICAgYnRuTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyA1MFxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGJ0bkxhYmVsID0gYnRuTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgYnRuTGFiZWwuc3RyaW5nID0gXCLov5Tlm57lpKfljoVcIlxuICAgICAgICBidG5MYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGJ0bkxhYmVsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KVxuICAgICAgICBidG5MYWJlbE5vZGUucGFyZW50ID0gYnRuTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye75LqL5Lu2XG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIOmUgOavgeW8ueeql1xuICAgICAgICAgICAgcG9wdXBOb2RlLmRlc3Ryb3koKVxuICAgICAgICAgICAgbWFza05vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICAvLyDov5Tlm57lpKfljoVcbiAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5by55Ye65Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fZWxpbWluYXRlZFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2VsaW1pbmF0ZWRNYXNrID0gbWFza05vZGVcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKshu+4j+OAkOernuaKgOWcuuOAkeWkhOeQhuaZi+e6p+mAmuefpVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBjdXJyZW50X3JvdW5kLCB0b3RhbF9yb3VuZHMsIG1hdGNoX2NvaW4sIG1lc3NhZ2UgfVxuICAgICAqL1xuICAgIF9vbkNvbXBldGl0aW9uQWR2YW5jZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Sb3VuZCA9IGRhdGEuY3VycmVudF9yb3VuZFxuICAgICAgICB0aGlzLl9tYXRjaENvaW4gPSBkYXRhLm1hdGNoX2NvaW5cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOavlOi1m+mHkeW4geaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVNYXRjaENvaW5EaXNwbGF5KGRhdGEubWF0Y2hfY29pbiwgMClcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuaZi+e6p+aPkOekulxuICAgICAgICB0aGlzLl9zaG93QWR2YW5jZVRvYXN0KGRhdGEpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDirIbvuI/jgJDnq57mioDlnLrjgJHmmL7npLrmmYvnuqfmj5DnpLpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgY3VycmVudF9yb3VuZCwgdG90YWxfcm91bmRzLCBtYXRjaF9jb2luLCBtZXNzYWdlIH1cbiAgICAgKi9cbiAgICBfc2hvd0FkdmFuY2VUb2FzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdmFyIHdpblNpemUgPSBjYy53aW5TaXplXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7pUb2FzdOiKgueCuVxuICAgICAgICB2YXIgdG9hc3ROb2RlID0gbmV3IGNjLk5vZGUoXCJBZHZhbmNlVG9hc3RcIilcbiAgICAgICAgdG9hc3ROb2RlLnNldFBvc2l0aW9uKDAsIDEwMClcbiAgICAgICAgdG9hc3ROb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHRvYXN0Tm9kZS56SW5kZXggPSAyMDAwXG4gICAgICAgIHRvYXN0Tm9kZS5wYXJlbnQgPSB0aGlzLm5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDEwMCwgNTAsIDIyMClcbiAgICAgICAgYmcucm91bmRSZWN0KC0xNTAsIC0yNSwgMzAwLCA1MCwgMjUpXG4gICAgICAgIGJnLmZpbGwoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gdG9hc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmloflrZdcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gXCLwn46JIOaZi+e6p+aIkOWKn++8geesrCBcIiArIGRhdGEuY3VycmVudF9yb3VuZCArIFwiL1wiICsgZGF0YS50b3RhbF9yb3VuZHMgKyBcIiDova5cIlxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjAwKVxuICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gdG9hc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliqjnlLtcbiAgICAgICAgY2MudHdlZW4odG9hc3ROb2RlKVxuICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAyNTUgfSlcbiAgICAgICAgICAgIC5kZWxheSgyKVxuICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0b2FzdE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIblhqDlhpvlvLnnqpdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcmFuaywgcmV3YXJkcywgcmV3YXJkX3R5cGUsIHJhbmtpbmdzLCBtYXRjaF9jb2luIH1cbiAgICAgKi9cbiAgICBfb25Db21wZXRpdGlvbkNoYW1waW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+avlOi1m+mHkeW4geaYvuekulxuICAgICAgICB0aGlzLl9oaWRlTWF0Y2hDb2luRGlzcGxheSgpXG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrlhqDlhpvlvLnnqpdcbiAgICAgICAgdGhpcy5fc2hvd0NoYW1waW9uUG9wdXAoZGF0YSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHmmL7npLrlhqDlhpvlvLnnqpdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcmFuaywgcmV3YXJkcywgcmV3YXJkX3R5cGUsIHJhbmtpbmdzLCBtYXRjaF9jb2luIH1cbiAgICAgKiDwn5Sn44CQ6YeN5p6E44CR5pi+56S65a6M5pW055qE5o6S5ZCN5YiX6KGo77yI5YmNMjDlkI3vvInvvIzljIXmi6zlhqDlhpvjgIHkuprlhpvjgIHlraPlhptcbiAgICAgKi9cbiAgICBfc2hvd0NoYW1waW9uUG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6Zet5LmL5YmN55qE57uT566X5by556qX44CRXG4gICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKHRoaXMuX2dhbWVSZXN1bHRQb3B1cCwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmBrue9qeWxglxuICAgICAgICB2YXIgbWFza05vZGUgPSBuZXcgY2MuTm9kZShcIkNoYW1waW9uTWFza1wiKVxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgbWFza05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAsIDE1LCA0MClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDIyMFxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS56SW5kZXggPSA5OTlcbiAgICAgICAgbWFza05vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ2hhbXBpb25Qb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDosIPmlbTjgJHlop7lpKflvLnnqpflsLrlr7jku6XlrrnnurPmm7TlpJrmjpLlkI1cbiAgICAgICAgdmFyIHBvcHVwV2lkdGggPSA1MjBcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gNjIwXG4gICAgICAgIFxuICAgICAgICAvLyDog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDQ1LCAzNSwgNzAsIDI0NSlcbiAgICAgICAgYmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIsIC1wb3B1cEhlaWdodC8yLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgMjApXG4gICAgICAgIGJnLmZpbGwoKVxuICAgICAgICBiZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgODApXG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDNcbiAgICAgICAgYmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIsIC1wb3B1cEhlaWdodC8yLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgMjApXG4gICAgICAgIGJnLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOagh+mimFxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZVwiKVxuICAgICAgICB2YXIgdGl0bGVMYWJlbCA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gXCLwn4+GIOavlOi1m+e7k+adnyDwn4+GXCJcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDMyXG4gICAgICAgIHRpdGxlTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxMDApXG4gICAgICAgIHRpdGxlTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDQwXG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHliY3kuInlkI3lsZXnpLrljLpcbiAgICAgICAgdmFyIHJhbmtpbmdzID0gZGF0YS5yYW5raW5ncyB8fCBbXVxuICAgICAgICB2YXIgdG9wVGhyZWVZID0gcG9wdXBIZWlnaHQvMiAtIDkwXG4gICAgICAgIFxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIC8vIOWGoOWGm1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUmFua2luZ0l0ZW0ocG9wdXBOb2RlLCByYW5raW5nc1swXSwgMSwgLTEyMCwgdG9wVGhyZWVZKVxuICAgICAgICB9XG4gICAgICAgIGlmIChyYW5raW5ncy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgLy8g5Lqa5YabXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVSYW5raW5nSXRlbShwb3B1cE5vZGUsIHJhbmtpbmdzWzFdLCAyLCAwLCB0b3BUaHJlZVkgLSAyMClcbiAgICAgICAgfVxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgIC8vIOWto+WGm1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUmFua2luZ0l0ZW0ocG9wdXBOb2RlLCByYW5raW5nc1syXSwgMywgMTIwLCB0b3BUaHJlZVkgLSA0MClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeWFtuS7luaOkuWQjeWIl+ihqOagh+mimFxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdmFyIG90aGVyVGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJPdGhlclRpdGxlXCIpXG4gICAgICAgICAgICB2YXIgb3RoZXJUaXRsZUxhYmVsID0gb3RoZXJUaXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgb3RoZXJUaXRsZUxhYmVsLnN0cmluZyA9IFwi4oCU4oCUIOWFtuS7luaOkuWQjSDigJTigJRcIlxuICAgICAgICAgICAgb3RoZXJUaXRsZUxhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgICAgIG90aGVyVGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAyMDApXG4gICAgICAgICAgICBvdGhlclRpdGxlTm9kZS55ID0gdG9wVGhyZWVZIC0gMTAwXG4gICAgICAgICAgICBvdGhlclRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeWFtuS7luaOkuWQjeWIl+ihqO+8iOesrDQtMjDlkI3vvIlcbiAgICAgICAgICAgIHZhciBzdGFydFkgPSB0b3BUaHJlZVkgLSAxMzBcbiAgICAgICAgICAgIHZhciBtYXhPdGhlclJhbmtpbmdzID0gTWF0aC5taW4ocmFua2luZ3MubGVuZ3RoLCAyMClcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAzOyBpIDwgbWF4T3RoZXJSYW5raW5nczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmtJbmZvID0gcmFua2luZ3NbaV1cbiAgICAgICAgICAgICAgICB2YXIgcmFua0l0ZW1Ob2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rSXRlbV9cIiArIGkpXG4gICAgICAgICAgICAgICAgdmFyIHJhbmtJdGVtTGFiZWwgPSByYW5rSXRlbU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTGFiZWwuc3RyaW5nID0gXCLnrKxcIiArIHJhbmtJbmZvLnJhbmsgKyBcIuWQjTogXCIgKyByYW5rSW5mby5wbGF5ZXJfbmFtZSArIFwiICDph5HluIE6IFwiICsgcmFua0luZm8ubWF0Y2hfY29pblxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTGFiZWwuZm9udFNpemUgPSAxNlxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjEwKVxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTm9kZS55ID0gc3RhcnRZIC0gKGkgLSAzKSAqIDI0XG4gICAgICAgICAgICAgICAgcmFua0l0ZW1Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7ljLrln59cbiAgICAgICAgdmFyIGJ0blkgPSAtcG9wdXBIZWlnaHQvMiArIDUwXG4gICAgICAgIFxuICAgICAgICAvLyDnoa7lrprmjInpkq5cbiAgICAgICAgdmFyIGNvbmZpcm1CdG4gPSBuZXcgY2MuTm9kZShcIkNvbmZpcm1CdG5cIilcbiAgICAgICAgY29uZmlybUJ0bi5zZXRDb250ZW50U2l6ZSgxODAsIDQ1KVxuICAgICAgICBjb25maXJtQnRuLmFkZENvbXBvbmVudChjYy5CbG9ja0lucHV0RXZlbnRzKVxuICAgICAgICB2YXIgY29uZmlybUJnID0gY29uZmlybUJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNvbmZpcm1CZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAxNTAsIDUwKVxuICAgICAgICBjb25maXJtQmcucm91bmRSZWN0KC05MCwgLTIyLjUsIDE4MCwgNDUsIDIyKVxuICAgICAgICBjb25maXJtQmcuZmlsbCgpXG4gICAgICAgIGNvbmZpcm1CdG4ueSA9IGJ0bllcbiAgICAgICAgY29uZmlybUJ0bi5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIHZhciBjb25maXJtTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgY29uZmlybUxhYmVsID0gY29uZmlybUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvbmZpcm1MYWJlbC5zdHJpbmcgPSBcIui/lOWbnuWkp+WOhVwiXG4gICAgICAgIGNvbmZpcm1MYWJlbC5mb250U2l6ZSA9IDIwXG4gICAgICAgIGNvbmZpcm1MYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgY29uZmlybUxhYmVsTm9kZS5wYXJlbnQgPSBjb25maXJtQnRuXG4gICAgICAgIFxuICAgICAgICBjb25maXJtQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwb3B1cE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5by55Ye65Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgIC50bygwLjQsIHsgc2NhbGU6IDEsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgLy8g57KS5a2Q54m55pWIXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNoYW1waW9uUGFydGljbGVzKHBvcHVwTm9kZSwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQpXG4gICAgICAgIFxuICAgICAgICB0aGlzLl9jaGFtcGlvblBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2NoYW1waW9uTWFzayA9IG1hc2tOb2RlXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn4+F44CQ5paw5aKe44CR5Yib5bu65Y2V5Liq5o6S5ZCN6aG5XG4gICAgICogQHBhcmFtIHtjYy5Ob2RlfSBwYXJlbnQgLSDniLboioLngrlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcmFua0luZm8gLSDmjpLlkI3kv6Hmga9cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmFuayAtIOaOkuWQje+8iDEsIDIsIDPvvIlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCAtIFjlnZDmoIdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSAtIFnlnZDmoIdcbiAgICAgKi9cbiAgICBfY3JlYXRlUmFua2luZ0l0ZW06IGZ1bmN0aW9uKHBhcmVudCwgcmFua0luZm8sIHJhbmssIHgsIHkpIHtcbiAgICAgICAgdmFyIGl0ZW1Ob2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rSXRlbV9cIiArIHJhbmspXG4gICAgICAgIGl0ZW1Ob2RlLnNldFBvc2l0aW9uKHgsIHkpXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI3og4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgXG4gICAgICAgIC8vIOagueaNruaOkuWQjeiuvue9ruS4jeWQjOminOiJslxuICAgICAgICB2YXIgYmdDb2xvclxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCwgMjAwKSAgLy8g6YeR6ImyXG4gICAgICAgIH0gZWxzZSBpZiAocmFuayA9PT0gMikge1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcigxOTIsIDE5MiwgMTkyLCAyMDApICAvLyDpk7boibJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJnQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjA1LCAxMjcsIDUwLCAyMDApICAvLyDpk5zoibJcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYmcuZmlsbENvbG9yID0gYmdDb2xvclxuICAgICAgICBiZy5yb3VuZFJlY3QoLTU1LCAtMzAsIDExMCwgNjAsIDEwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI3moIfnrb5cbiAgICAgICAgdmFyIHJhbmtMYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIlJhbmtMYWJlbFwiKVxuICAgICAgICB2YXIgcmFua0xhYmVsID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhciByYW5rVGV4dFxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgcmFua1RleHQgPSBcIvCfpYcg5Yag5YabXCJcbiAgICAgICAgfSBlbHNlIGlmIChyYW5rID09PSAyKSB7XG4gICAgICAgICAgICByYW5rVGV4dCA9IFwi8J+liCDkuprlhptcIlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFua1RleHQgPSBcIvCfpYkg5a2j5YabXCJcbiAgICAgICAgfVxuICAgICAgICByYW5rTGFiZWwuc3RyaW5nID0gcmFua1RleHRcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgcmFua0xhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHJhbmtMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgcmFua0xhYmVsTm9kZS55ID0gMTJcbiAgICAgICAgcmFua0xhYmVsTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g546p5a625ZCN56ewXG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lTGFiZWxcIilcbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5hbWVMYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBuYW1lTGFiZWwuc3RyaW5nID0gcmFua0luZm8ucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBuYW1lTGFiZWwuZm9udFNpemUgPSAxNFxuICAgICAgICBuYW1lTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUueSA9IC04XG4gICAgICAgIG5hbWVMYWJlbE5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOmHkeW4geaVsFxuICAgICAgICB2YXIgY29pbkxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29pbkxhYmVsXCIpXG4gICAgICAgIHZhciBjb2luTGFiZWwgPSBjb2luTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgY29pbkxhYmVsLnN0cmluZyA9IHJhbmtJbmZvLm1hdGNoX2NvaW4gKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxMlxuICAgICAgICBjb2luTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyMDApXG4gICAgICAgIGNvaW5MYWJlbE5vZGUueSA9IC0yMlxuICAgICAgICBjb2luTGFiZWxOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBwYXJlbnRcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfjonjgJDnq57mioDlnLrjgJHliJvlu7rlhqDlhpvnspLlrZDnibnmlYhcbiAgICAgKi9cbiAgICBfY3JlYXRlQ2hhbXBpb25QYXJ0aWNsZXM6IGZ1bmN0aW9uKHBhcmVudE5vZGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy8g566A5Y2V55qE6YeR6Imy6Zeq54OB57KS5a2Q5pWI5p6cXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IGNjLk5vZGUoXCJQYXJ0aWNsZV9cIiArIGluZGV4KVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZUxhYmVsID0gcGFydGljbGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlTGFiZWwuc3RyaW5nID0gXCLinKhcIlxuICAgICAgICAgICAgICAgIHBhcnRpY2xlTGFiZWwuZm9udFNpemUgPSAyMCArIE1hdGgucmFuZG9tKCkgKiAyMFxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnBhcmVudCA9IHBhcmVudE5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KE1hdGgucmFuZG9tKCkgKiAwLjUpXG4gICAgICAgICAgICAgICAgICAgIC50bygyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAtaGVpZ2h0IC8gMiAtIDUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogcGFydGljbGUueCArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDEwMFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlLmRlc3Ryb3koKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICAgICAgfSkoaSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeacgOe7iOamnOWNleWkhOeQhlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIbmnIDnu4jmppzljZXmtojmga9cbiAgICAgKiDlvZPnq57mioDlnLrmiYDmnInova7mrKHnu5PmnZ/ml7bosIPnlKhcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGVyaW9kX25vLCB0b3RhbF9wbGF5ZXJzLCB0b3AzLCB0b3AyMCwgbXlfcmFuaywgbXlfbWF0Y2hfY29pbiB9XG4gICAgICovXG4gICAgX29uVG91cm5hbWVudEZpbmFsUmFuazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW19vblRvdXJuYW1lbnRGaW5hbFJhbmtdIOaUtuWIsOacgOe7iOamnOWNleaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgICAgdGhpcy5faGlkZU1hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5YWz6Zet5LmL5YmN55qE57uT566X5by556qXXG4gICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKHRoaXMuX2dhbWVSZXN1bHRQb3B1cCwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuacgOe7iOamnOWNleW8ueeql1xuICAgICAgICB0aGlzLl9zaG93VG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyhkYXRhKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+PhuOAkOernuaKgOWcuuOAkeaYvuekuuacgOe7iOamnOWNleW8ueeql++8iOWujOaVtOeJiCAtIOW4pua7muWKqOWIl+ihqO+8iVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBwZXJpb2Rfbm8sIHRvdGFsX3BsYXllcnMsIHRvcDMsIHRvcDIwLCBteV9yYW5rLCBteV9tYXRjaF9jb2luIH1cbiAgICAgKi9cbiAgICBfc2hvd1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOmBrue9qeWxgiA9PT09PT09PT09XG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRmluYWxSYW5rTWFza1wiKVxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgbWFza05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAsIDUsIDMwKVxuICAgICAgICBtYXNrTm9kZS5vcGFjaXR5ID0gMjAwXG4gICAgICAgIG1hc2tOb2RlLndpZHRoID0gd2luU2l6ZS53aWR0aCAqIDJcbiAgICAgICAgbWFza05vZGUuaGVpZ2h0ID0gd2luU2l6ZS5oZWlnaHQgKiAyXG4gICAgICAgIG1hc2tOb2RlLnpJbmRleCA9IDk5OVxuICAgICAgICBtYXNrTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT0g5by556qX5a655ZmoID09PT09PT09PT1cbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRmluYWxSYW5rUG9wdXBcIilcbiAgICAgICAgcG9wdXBOb2RlLnNjYWxlID0gMC4zXG4gICAgICAgIHBvcHVwTm9kZS5vcGFjaXR5ID0gMFxuICAgICAgICBwb3B1cE5vZGUuekluZGV4ID0gMTAwMFxuICAgICAgICBwb3B1cE5vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflsLrlr7jvvIjpq5jluqbmlLnkuLrlsY/luZXpq5jluqbnmoQ4NSXvvIzpgb/lhY3muqLlh7rvvIlcbiAgICAgICAgdmFyIHBvcHVwV2lkdGggPSA2MDBcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5TaXplLmhlaWdodCAqIDAuODUpXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOS4u+iDjOaZryA9PT09PT09PT09XG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigzMCwgMjIsIDU0LCAyNTApXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDE2KVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwKVxuICAgICAgICBiZy5saW5lV2lkdGggPSAzXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDE2KVxuICAgICAgICBiZy5zdHJva2UoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOmhtumDqOagh+mimOWMuuWfnyA9PT09PT09PT09XG4gICAgICAgIHZhciB0aXRsZUJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVCZ1wiKVxuICAgICAgICB2YXIgdGl0bGVCZyA9IHRpdGxlQmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgdGl0bGVCZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxMzAsIDUwLCAyMjApXG4gICAgICAgIHRpdGxlQmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIgKyA4LCBwb3B1cEhlaWdodC8yIC0gNTUsIHBvcHVwV2lkdGggLSAxNiwgNTAsIDgpXG4gICAgICAgIHRpdGxlQmcuZmlsbCgpXG4gICAgICAgIHRpdGxlQmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIilcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi8J+PhiDmr5TotZvnu5PmnZ8g8J+PhlwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAzMlxuICAgICAgICB0aXRsZUxhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTAsIDIyMClcbiAgICAgICAgdGl0bGVOb2RlLnkgPSBwb3B1cEhlaWdodC8yIC0gMzJcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+C6LWb5Lq65pWwXG4gICAgICAgIHZhciB0b3RhbE5vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsXCIpXG4gICAgICAgIHZhciB0b3RhbExhYmVsID0gdG90YWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsSBcIiArIChkYXRhLnRvdGFsX3BsYXllcnMgfHwgMykgKyBcIiDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgdG90YWxMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRvdGFsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjIwKVxuICAgICAgICB0b3RhbE5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA3NVxuICAgICAgICB0b3RhbE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IFRPUDMg6aKG5aWW5Y+w77yI57Sn5YeR5biD5bGA77yJPT09PT09PT09PVxuICAgICAgICB2YXIgdG9wMyA9IGRhdGEudG9wMyB8fCBbXVxuICAgICAgICB2YXIgcG9kaXVtWSA9IHBvcHVwSGVpZ2h0LzIgLSAxNDVcbiAgICAgICAgdmFyIHBvZGl1bVNwYWNpbmcgPSAxNzBcbiAgICAgICAgXG4gICAgICAgIC8vIOmTtueJjO+8iOesrOS6jOWQje+8iS0g5bem5L6nXG4gICAgICAgIGlmICh0b3AzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVQb2RpdW1FbnRyeShwb3B1cE5vZGUsIHRvcDNbMV0sIDIsIC1wb2RpdW1TcGFjaW5nLCBwb2RpdW1ZKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDph5HniYzvvIjnrKzkuIDlkI3vvIktIOS4remXtO+8iOacgOmrmO+8iVxuICAgICAgICBpZiAodG9wMy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUG9kaXVtRW50cnkocG9wdXBOb2RlLCB0b3AzWzBdLCAxLCAwLCBwb2RpdW1ZICsgMjApXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmTnOeJjO+8iOesrOS4ieWQje+8iS0g5Y+z5L6nXG4gICAgICAgIGlmICh0b3AzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVQb2RpdW1FbnRyeShwb3B1cE5vZGUsIHRvcDNbMl0sIDMsIHBvZGl1bVNwYWNpbmcsIHBvZGl1bVkgLSAxMClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDnrKw0LTIw5ZCN5rua5Yqo5YiX6KGo5Yy65Z+fID09PT09PT09PT1cbiAgICAgICAgdmFyIHRvcDIwID0gZGF0YS50b3AyMCB8fCBbXVxuICAgICAgICBpZiAodG9wMjAubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8g5YiX6KGo5Yy65Z+f5qCH6aKYXG4gICAgICAgICAgICB2YXIgbGlzdFRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGlzdFRpdGxlXCIpXG4gICAgICAgICAgICB2YXIgbGlzdFRpdGxlTGFiZWwgPSBsaXN0VGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGxpc3RUaXRsZUxhYmVsLnN0cmluZyA9IFwi4oCU4oCUIOaOkuihjOamnCDigJTigJRcIlxuICAgICAgICAgICAgbGlzdFRpdGxlTGFiZWwuZm9udFNpemUgPSAxOFxuICAgICAgICAgICAgbGlzdFRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxODAsIDE2MCwgMTIwKVxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDI2MFxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu65rua5Yqo6KeG5Zu+5a655ZmoXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVmlld05vZGUgPSBuZXcgY2MuTm9kZShcIlNjcm9sbFZpZXdcIilcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLndpZHRoID0gcG9wdXBXaWR0aCAtIDQwXG4gICAgICAgICAgICBzY3JvbGxWaWV3Tm9kZS5oZWlnaHQgPSAyODBcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLnkgPSAtMzBcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmt7vliqDpga7nvannu4Tku7ZcbiAgICAgICAgICAgIHZhciBtYXNrID0gc2Nyb2xsVmlld05vZGUuYWRkQ29tcG9uZW50KGNjLk1hc2spXG4gICAgICAgICAgICBtYXNrLnR5cGUgPSBjYy5NYXNrLlR5cGUuUkVDVFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliJvlu7rlhoXlrrnlrrnlmahcbiAgICAgICAgICAgIHZhciBjb250ZW50Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29udGVudFwiKVxuICAgICAgICAgICAgY29udGVudE5vZGUud2lkdGggPSBwb3B1cFdpZHRoIC0gNDBcbiAgICAgICAgICAgIGNvbnRlbnROb2RlLmFuY2hvclkgPSAxXG4gICAgICAgICAgICBjb250ZW50Tm9kZS55ID0gc2Nyb2xsVmlld05vZGUuaGVpZ2h0IC8gMlxuICAgICAgICAgICAgY29udGVudE5vZGUucGFyZW50ID0gc2Nyb2xsVmlld05vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkei/h+a7pOaOieW3suWcqFRPUDPkuK3nmoTnjqnlrrbvvIzpgb/lhY3ph43lpI3mmL7npLpcbiAgICAgICAgICAgIHZhciB0b3AzUGxheWVySURzID0ge31cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9wMy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0b3AzW2ldICYmIHRvcDNbaV0ucGxheWVyX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDNQbGF5ZXJJRHNbdG9wM1tpXS5wbGF5ZXJfaWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y+q5pi+56S656ysNOWQjeWPiuS5i+WQjueahOeOqeWutu+8iOi/h+a7pOaOiVRPUDPvvIlcbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZFRvcDIwID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9wMjAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFua0RhdGEgPSB0b3AyMFtpXVxuICAgICAgICAgICAgICAgIC8vIOi3s+i/h+W3suWcqFRPUDPkuK3nmoTnjqnlrrZcbiAgICAgICAgICAgICAgICBpZiAocmFua0RhdGEgJiYgcmFua0RhdGEucGxheWVyX2lkICYmICF0b3AzUGxheWVySURzW3JhbmtEYXRhLnBsYXllcl9pZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUb3AyMC5wdXNoKHJhbmtEYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5re75Yqg5q+P5Liq5o6S6KGM6aG5XG4gICAgICAgICAgICB2YXIgaXRlbUhlaWdodCA9IDQ1XG4gICAgICAgICAgICB2YXIgc3RhcnRZID0gMFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJlZFRvcDIwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmtEYXRhID0gZmlsdGVyZWRUb3AyMFtpXVxuICAgICAgICAgICAgICAgIHZhciBhY3R1YWxSYW5rID0gaSArIDQgIC8vIOesrDTlkI3lvIDlp4tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgaXRlbU5vZGUgPSB0aGlzLl9jcmVhdGVSYW5rTGlzdEl0ZW0ocmFua0RhdGEsIGFjdHVhbFJhbmssIHBvcHVwV2lkdGggLSA1MClcbiAgICAgICAgICAgICAgICBpdGVtTm9kZS55ID0gc3RhcnRZIC0gaSAqIGl0ZW1IZWlnaHQgLSBpdGVtSGVpZ2h0IC8gMlxuICAgICAgICAgICAgICAgIGl0ZW1Ob2RlLnBhcmVudCA9IGNvbnRlbnROb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruWGheWuuemrmOW6plxuICAgICAgICAgICAgY29udGVudE5vZGUuaGVpZ2h0ID0gTWF0aC5tYXgoZmlsdGVyZWRUb3AyMC5sZW5ndGggKiBpdGVtSGVpZ2h0LCAyODApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa3u+WKoOinpuaRuOa7muWKqFxuICAgICAgICAgICAgdGhpcy5fYWRkU2Nyb2xsVmlld1RvdWNoKHNjcm9sbFZpZXdOb2RlLCBjb250ZW50Tm9kZSwgMjgwKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOW6lemDqOWMuuWfn++8iOaIkeeahOaOkuWQjSArIOaMiemSru+8iT09PT09PT09PT1cbiAgICAgICAgLy8g5YiG6ZqU57q/XG4gICAgICAgIHZhciBzZXBOb2RlID0gbmV3IGNjLk5vZGUoXCJCb3R0b21TZXBcIilcbiAgICAgICAgdmFyIHNlcCA9IHNlcE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBzZXAuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwLCAxMDApXG4gICAgICAgIHNlcC5saW5lV2lkdGggPSAxXG4gICAgICAgIHNlcC5tb3ZlVG8oLXBvcHVwV2lkdGgvMiArIDMwLCAwKVxuICAgICAgICBzZXAubGluZVRvKHBvcHVwV2lkdGgvMiAtIDMwLCAwKVxuICAgICAgICBzZXAuc3Ryb2tlKClcbiAgICAgICAgc2VwTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyAxNDBcbiAgICAgICAgc2VwTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaIkeeahOaOkuWQjeiDjOaZr1xuICAgICAgICB2YXIgbXlSYW5rQmdOb2RlID0gbmV3IGNjLk5vZGUoXCJNeVJhbmtCZ1wiKVxuICAgICAgICB2YXIgbXlSYW5rQmcgPSBteVJhbmtCZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBteVJhbmtCZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQ1LCA4MCwgMjAwKVxuICAgICAgICBteVJhbmtCZy5yb3VuZFJlY3QoLTIwMCwgLTIyLCA0MDAsIDQ0LCA4KVxuICAgICAgICBteVJhbmtCZy5maWxsKClcbiAgICAgICAgbXlSYW5rQmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwLCAxNTApXG4gICAgICAgIG15UmFua0JnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgbXlSYW5rQmcucm91bmRSZWN0KC0yMDAsIC0yMiwgNDAwLCA0NCwgOClcbiAgICAgICAgbXlSYW5rQmcuc3Ryb2tlKClcbiAgICAgICAgbXlSYW5rQmdOb2RlLnkgPSAtcG9wdXBIZWlnaHQvMiArIDEwMFxuICAgICAgICBteVJhbmtCZ05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmiJHnmoTmjpLlkI3mloflrZdcbiAgICAgICAgdmFyIG15UmFua05vZGUgPSBuZXcgY2MuTm9kZShcIk15UmFua1wiKVxuICAgICAgICB2YXIgbXlSYW5rTGFiZWwgPSBteVJhbmtOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbXlSYW5rTGFiZWwuc3RyaW5nID0gXCLmiJHnmoTmjpLlkI06IOesrCBcIiArIChkYXRhLm15X3JhbmsgfHwgMSkgKyBcIiDlkI0gIHwgIOavlOi1m+mHkeW4gTogXCIgKyAoZGF0YS5teV9tYXRjaF9jb2luIHx8IDApXG4gICAgICAgIG15UmFua0xhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbXlSYW5rTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgbXlSYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBteVJhbmtOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjMwLCAxNTApXG4gICAgICAgIG15UmFua05vZGUueSA9IC1wb3B1cEhlaWdodC8yICsgMTAwXG4gICAgICAgIG15UmFua05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOehruWumuaMiemSriA9PT09PT09PT09XG4gICAgICAgIHZhciBidG5Ob2RlID0gbmV3IGNjLk5vZGUoXCJDb25maXJtQnRuXCIpXG4gICAgICAgIGJ0bk5vZGUud2lkdGggPSAxODBcbiAgICAgICAgYnRuTm9kZS5oZWlnaHQgPSA1MFxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkJnID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJ0bkJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig3NiwgMTc1LCA4MClcbiAgICAgICAgYnRuQmcucm91bmRSZWN0KC05MCwgLTI1LCAxODAsIDUwLCAxMClcbiAgICAgICAgYnRuQmcuZmlsbCgpXG4gICAgICAgIGJ0bkJnLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEyOSwgMTk5LCAxMzIpXG4gICAgICAgIGJ0bkJnLmxpbmVXaWR0aCA9IDJcbiAgICAgICAgYnRuQmcucm91bmRSZWN0KC05MCwgLTI1LCAxODAsIDUwLCAxMClcbiAgICAgICAgYnRuQmcuc3Ryb2tlKClcbiAgICAgICAgYnRuTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyA0MFxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgYnRuTGFiZWxDb21wID0gYnRuTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBidG5MYWJlbENvbXAuc3RyaW5nID0gXCLnoa4gIOWumlwiXG4gICAgICAgIGJ0bkxhYmVsQ29tcC5mb250U2l6ZSA9IDI0XG4gICAgICAgIGJ0bkxhYmVsQ29tcC5lbmFibGVCb2xkID0gdHJ1ZVxuICAgICAgICBidG5MYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBidG5MYWJlbENvbXAudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGJ0bkxhYmVsLnNldENvbnRlbnRTaXplKDE4MCwgNTApXG4gICAgICAgIGJ0bkxhYmVsLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGJ0bkxhYmVsLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIGJ0bkxhYmVsLnBhcmVudCA9IGJ0bk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruinpuaRuOaViOaenFxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJ0bk5vZGUuc2NhbGUgPSAwLjk1XG4gICAgICAgIH0pXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJ0bk5vZGUuc2NhbGUgPSAxXG4gICAgICAgICAgICBwb3B1cE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKVxuICAgICAgICB9KVxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBidG5Ob2RlLnNjYWxlID0gMVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDlvLnlh7rliqjnlLsgPT09PT09PT09PVxuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4yLCB7IHNjYWxlOiAxLjAsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtfc2hvd1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2ddIOacgOe7iOamnOWNleW8ueeql+W3suaYvuekulwiKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5Yib5bu65o6S6KGM5YiX6KGo6aG5XG4gICAgICovXG4gICAgX2NyZWF0ZVJhbmtMaXN0SXRlbTogZnVuY3Rpb24ocmFua0RhdGEsIHJhbmssIHdpZHRoKSB7XG4gICAgICAgIHZhciBpdGVtTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmFua0l0ZW1fXCIgKyByYW5rKVxuICAgICAgICBpdGVtTm9kZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIGl0ZW1Ob2RlLmhlaWdodCA9IDQyXG4gICAgICAgIFxuICAgICAgICAvLyDog4zmma/vvIjkuqTmm7/popzoibLvvIlcbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgaWYgKHJhbmsgJSAyID09PSAwKSB7XG4gICAgICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNDUsIDM4LCA3MCwgMTgwKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDM4LCAzMiwgNTgsIDE4MClcbiAgICAgICAgfVxuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC0yMCwgd2lkdGgsIDQwLCA2KVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI1cbiAgICAgICAgdmFyIHJhbmtOb2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rXCIpXG4gICAgICAgIHZhciByYW5rTGFiZWwgPSByYW5rTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSBTdHJpbmcocmFuaylcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgcmFua0xhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHJhbmtMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHJhbmtOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIHJhbmtOb2RlLnNldFBvc2l0aW9uKC13aWR0aC8yICsgMzUsIDApXG4gICAgICAgIHJhbmtOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR546p5a625aS05YOPXG4gICAgICAgIHZhciBhdmF0YXJOb2RlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJcIilcbiAgICAgICAgYXZhdGFyTm9kZS5zZXRQb3NpdGlvbigtd2lkdGgvMiArIDc1LCAwKVxuICAgICAgICB2YXIgYXZhdGFyU3ByaXRlID0gYXZhdGFyTm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBhdmF0YXJTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgIGF2YXRhck5vZGUuc2V0Q29udGVudFNpemUoMzIsIDMyKVxuICAgICAgICBhdmF0YXJOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3lpLTlg49cbiAgICAgICAgdGhpcy5fbG9hZEF2YXRhclNwcml0ZShhdmF0YXJTcHJpdGUsIHJhbmtEYXRhLmF2YXRhciwgcmFua0RhdGEuaXNfcm9ib3QpXG4gICAgICAgIFxuICAgICAgICAvLyDnjqnlrrblkI3np7BcbiAgICAgICAgdmFyIG5hbWVOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lXCIpXG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBuYW1lTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhciBwbGF5ZXJOYW1lID0gcmFua0RhdGEucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBpZiAocmFua0RhdGEuaXNfcm9ib3QpIHtcbiAgICAgICAgICAgIHBsYXllck5hbWUgPSB0aGlzLl9nZXRSb2JvdERpc3BsYXlOYW1lKHJhbmtEYXRhLnBsYXllcl9pZCwgcmFua0RhdGEucGxheWVyX25hbWUpXG4gICAgICAgIH1cbiAgICAgICAgbmFtZUxhYmVsLnN0cmluZyA9IHBsYXllck5hbWVcbiAgICAgICAgbmFtZUxhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgbmFtZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5MRUZUXG4gICAgICAgIG5hbWVMYWJlbC5vdmVyZmxvdyA9IGNjLkxhYmVsLk92ZXJmbG93LkNMQU1QXG4gICAgICAgIG5hbWVOb2RlLndpZHRoID0gMTUwXG4gICAgICAgIG5hbWVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVOb2RlLnNldFBvc2l0aW9uKC13aWR0aC8yICsgMTQ1LCAwKVxuICAgICAgICBuYW1lTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6YeR5biBXG4gICAgICAgIHZhciBjb2luTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29pblwiKVxuICAgICAgICB2YXIgY29pbkxhYmVsID0gY29pbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gKHJhbmtEYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxNVxuICAgICAgICBjb2luTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLlJJR0hUXG4gICAgICAgIGNvaW5Ob2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxNTApXG4gICAgICAgIGNvaW5Ob2RlLnNldFBvc2l0aW9uKHdpZHRoLzIgLSA2MCwgMClcbiAgICAgICAgY29pbk5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtTm9kZVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5re75Yqg5rua5Yqo6KeG5Zu+6Kem5pG45LqL5Lu2XG4gICAgICovXG4gICAgX2FkZFNjcm9sbFZpZXdUb3VjaDogZnVuY3Rpb24oc2Nyb2xsVmlld05vZGUsIGNvbnRlbnROb2RlLCB2aWV3SGVpZ2h0KSB7XG4gICAgICAgIHZhciB0b3VjaFN0YXJ0WSA9IDBcbiAgICAgICAgdmFyIGNvbnRlbnRTdGFydFkgPSAwXG4gICAgICAgIHZhciBtYXhPZmZzZXQgPSBNYXRoLm1heCgwLCBjb250ZW50Tm9kZS5oZWlnaHQgLSB2aWV3SGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVmlld05vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB0b3VjaFN0YXJ0WSA9IGV2ZW50LmdldExvY2F0aW9uWSgpXG4gICAgICAgICAgICBjb250ZW50U3RhcnRZID0gY29udGVudE5vZGUueVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVmlld05vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfTU9WRSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB0b3VjaFkgPSBldmVudC5nZXRMb2NhdGlvblkoKVxuICAgICAgICAgICAgdmFyIGRlbHRhWSA9IHRvdWNoWSAtIHRvdWNoU3RhcnRZXG4gICAgICAgICAgICB2YXIgbmV3WSA9IGNvbnRlbnRTdGFydFkgKyBkZWx0YVlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6ZmQ5Yi25rua5Yqo6IyD5Zu0XG4gICAgICAgICAgICB2YXIgbWluWSA9IHZpZXdIZWlnaHQgLyAyIC0gY29udGVudE5vZGUuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgbWF4WSA9IHZpZXdIZWlnaHQgLyAyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5ld1kgPSBNYXRoLm1heChtaW5ZLCBNYXRoLm1pbihtYXhZLCBuZXdZKSlcbiAgICAgICAgICAgIGNvbnRlbnROb2RlLnkgPSBuZXdZXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn4+G44CQ56ue5oqA5Zy644CR5Yib5bu66aKG5aWW5Y+w5p2h55uu77yI576O5YyW54mI77yJXG4gICAgICovXG4gICAgX2NyZWF0ZVBvZGl1bUVudHJ5OiBmdW5jdGlvbihwYXJlbnQsIHJhbmtEYXRhLCByYW5rLCB4LCB5KSB7XG4gICAgICAgIHZhciBlbnRyeU5vZGUgPSBuZXcgY2MuTm9kZShcIlBvZGl1bUVudHJ5X1wiICsgcmFuaylcbiAgICAgICAgZW50cnlOb2RlLnNldFBvc2l0aW9uKHgsIHkpXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOaOkuWQjeiDjOaZr++8iOagueaNruaOkuWQjeiuvue9ruminOiJsu+8iT09PT09PT09PT1cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgdmFyIGJnQ29sb3IsIGJvcmRlckNvbG9yXG4gICAgICAgIGlmIChyYW5rID09PSAxKSB7XG4gICAgICAgICAgICAvLyDph5HniYwgLSDph5HoibLns7tcbiAgICAgICAgICAgIGJnQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA4NSwgNDAsIDIzMClcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKVxuICAgICAgICB9IGVsc2UgaWYgKHJhbmsgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIOmTtueJjCAtIOmTtuiJsuezu1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcig3MCwgNzUsIDg1LCAyMzApXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IG5ldyBjYy5Db2xvcigxOTIsIDE5MiwgMTkyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g6ZOc54mMIC0g6ZOc6Imy57O7XG4gICAgICAgICAgICBiZ0NvbG9yID0gbmV3IGNjLkNvbG9yKDg1LCA2MCwgNDUsIDIzMClcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gbmV3IGNjLkNvbG9yKDIwNSwgMTI3LCA1MClcbiAgICAgICAgfVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBiZ0NvbG9yXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtNTUsIC03MCwgMTEwLCAxNDAsIDEyKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgLy8g6L655qGGXG4gICAgICAgIGJnLnN0cm9rZUNvbG9yID0gYm9yZGVyQ29sb3JcbiAgICAgICAgYmcubGluZVdpZHRoID0gMlxuICAgICAgICBiZy5yb3VuZFJlY3QoLTU1LCAtNzAsIDExMCwgMTQwLCAxMilcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDmjpLlkI3lpZbniYzlm77moIcgPT09PT09PT09PVxuICAgICAgICB2YXIgbWVkYWxOb2RlID0gbmV3IGNjLk5vZGUoXCJNZWRhbFwiKVxuICAgICAgICB2YXIgbWVkYWwgPSBtZWRhbE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgbWVkYWxDb2xvclxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgbWVkYWxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgIC8vIOmHkeiJslxuICAgICAgICB9IGVsc2UgaWYgKHJhbmsgPT09IDIpIHtcbiAgICAgICAgICAgIG1lZGFsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTkyLCAxOTIsIDE5MikgIC8vIOmTtuiJslxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVkYWxDb2xvciA9IG5ldyBjYy5Db2xvcigyMDUsIDEyNywgNTApICAvLyDpk5zoibJcbiAgICAgICAgfVxuICAgICAgICBtZWRhbC5maWxsQ29sb3IgPSBtZWRhbENvbG9yXG4gICAgICAgIC8vIOe7mOWItuWchuW9ouWllueJjFxuICAgICAgICBtZWRhbC5jaXJjbGUoMCwgNDUsIDIyKVxuICAgICAgICBtZWRhbC5maWxsKClcbiAgICAgICAgbWVkYWwuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSwgMTUwKVxuICAgICAgICBtZWRhbC5saW5lV2lkdGggPSAyXG4gICAgICAgIG1lZGFsLmNpcmNsZSgwLCA0NSwgMjIpXG4gICAgICAgIG1lZGFsLnN0cm9rZSgpXG4gICAgICAgIG1lZGFsTm9kZS5wYXJlbnQgPSBlbnRyeU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWllueJjOS4iueahOaVsOWtl1xuICAgICAgICB2YXIgcmFua051bU5vZGUgPSBuZXcgY2MuTm9kZShcIlJhbmtOdW1cIilcbiAgICAgICAgdmFyIHJhbmtOdW1MYWJlbCA9IHJhbmtOdW1Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcmFua051bUxhYmVsLnN0cmluZyA9IFN0cmluZyhyYW5rKVxuICAgICAgICByYW5rTnVtTGFiZWwuZm9udFNpemUgPSAyNFxuICAgICAgICByYW5rTnVtTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgcmFua051bUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgcmFua051bU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQwLCAzMClcbiAgICAgICAgcmFua051bU5vZGUuc2V0UG9zaXRpb24oMCwgNDUpXG4gICAgICAgIHJhbmtOdW1Ob2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDnjqnlrrblpLTlg48gPT09PT09PT09PVxuICAgICAgICB2YXIgYXZhdGFyTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyXCIpXG4gICAgICAgIGF2YXRhck5vZGUuc2V0UG9zaXRpb24oMCwgMjApXG4gICAgICAgIHZhciBhdmF0YXJTcHJpdGUgPSBhdmF0YXJOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgIGF2YXRhclNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT01cbiAgICAgICAgYXZhdGFyTm9kZS5zZXRDb250ZW50U2l6ZSg1MCwgNTApXG4gICAgICAgIGF2YXRhck5vZGUucGFyZW50ID0gZW50cnlOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5Yqg6L295aS05YOPXG4gICAgICAgIHRoaXMuX2xvYWRBdmF0YXJTcHJpdGUoYXZhdGFyU3ByaXRlLCByYW5rRGF0YS5hdmF0YXIsIHJhbmtEYXRhLmlzX3JvYm90KVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6L655qGGXG4gICAgICAgIHZhciBhdmF0YXJGcmFtZU5vZGUgPSBuZXcgY2MuTm9kZShcIkF2YXRhckZyYW1lXCIpXG4gICAgICAgIHZhciBhdmF0YXJGcmFtZSA9IGF2YXRhckZyYW1lTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGF2YXRhckZyYW1lLnN0cm9rZUNvbG9yID0gYm9yZGVyQ29sb3JcbiAgICAgICAgYXZhdGFyRnJhbWUubGluZVdpZHRoID0gMlxuICAgICAgICBhdmF0YXJGcmFtZS5jaXJjbGUoMCwgMjAsIDI2KVxuICAgICAgICBhdmF0YXJGcmFtZS5zdHJva2UoKVxuICAgICAgICBhdmF0YXJGcmFtZU5vZGUucGFyZW50ID0gZW50cnlOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOeOqeWutuWQjeensCA9PT09PT09PT09XG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lXCIpXG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBuYW1lTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdmFyIHBsYXllck5hbWUgPSByYW5rRGF0YS5wbGF5ZXJfbmFtZSB8fCBcIueOqeWutlwiXG4gICAgICAgIGlmIChyYW5rRGF0YS5pc19yb2JvdCkge1xuICAgICAgICAgICAgLy8g5py65Zmo5Lq65L2/55So5pm66IO96Zmq57uD5ZCN56ewXG4gICAgICAgICAgICBwbGF5ZXJOYW1lID0gdGhpcy5fZ2V0Um9ib3REaXNwbGF5TmFtZShyYW5rRGF0YS5wbGF5ZXJfaWQsIHJhbmtEYXRhLnBsYXllcl9uYW1lKVxuICAgICAgICB9XG4gICAgICAgIG5hbWVMYWJlbC5zdHJpbmcgPSBwbGF5ZXJOYW1lXG4gICAgICAgIG5hbWVMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIG5hbWVMYWJlbC5lbmFibGVCb2xkID0gdHJ1ZVxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUueSA9IDVcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5wYXJlbnQgPSBlbnRyeU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT0g5q+U6LWb6YeR5biBID09PT09PT09PT1cbiAgICAgICAgdmFyIGNvaW5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkNvaW5cIilcbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gKHJhbmtEYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxNlxuICAgICAgICBjb2luTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBjb2luTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjMwLCAxNTApXG4gICAgICAgIGNvaW5MYWJlbE5vZGUueSA9IC0yNVxuICAgICAgICBjb2luTGFiZWxOb2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDkuI3lho3mmL7npLrmnLrlmajkurpBSeagh+etviA9PT09PT09PT09XG4gICAgICAgIC8vIOeUqOaIt+imgeaxgu+8muacuuWZqOS6uuS4jeaYvuekukFJ5qCH6K+GXG4gICAgICAgIFxuICAgICAgICBlbnRyeU5vZGUucGFyZW50ID0gcGFyZW50XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5bmnLrlmajkurrmmL7npLrlkI3np7BcbiAgICAgKi9cbiAgICBfZ2V0Um9ib3REaXNwbGF5TmFtZTogZnVuY3Rpb24ocGxheWVySWQsIG9yaWdpbmFsTmFtZSkge1xuICAgICAgICAvLyDlpoLmnpzljp/lp4vlkI3np7Dlt7Lnu4/mmK9cIuaZuuiDvemZque7g1jlj7dcIuagvOW8j++8jOebtOaOpei/lOWbnlxuICAgICAgICBpZiAob3JpZ2luYWxOYW1lICYmIG9yaWdpbmFsTmFtZS5pbmRleE9mKFwi5pm66IO96Zmq57uDXCIpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOYW1lXG4gICAgICAgIH1cbiAgICAgICAgLy8g5ZCm5YiZ77yM55Sf5oiQXCLmmbrog73pmarnu4NY5Y+3XCLmoLzlvI/nmoTlkI3np7BcbiAgICAgICAgdmFyIHJvYm90SW5kZXggPSAxXG4gICAgICAgIGlmIChwbGF5ZXJJZCkge1xuICAgICAgICAgICAgdmFyIGxhc3RDaGFyID0gcGxheWVySWQudG9TdHJpbmcoKS5zbGljZSgtMSlcbiAgICAgICAgICAgIHJvYm90SW5kZXggPSBwYXJzZUludChsYXN0Q2hhcikgfHwgMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIuaZuuiDvemZque7g1wiICsgcm9ib3RJbmRleCArIFwi5Y+3XCJcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHliqDovb3lpLTlg4/nsr7ngbVcbiAgICAgKiBAcGFyYW0ge2NjLlNwcml0ZX0gc3ByaXRlIC0g55uu5qCH57K+54G157uE5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGF2YXRhclVybCAtIOWktOWDj1VSTOaIlui1hOa6kOWQjVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSb2JvdCAtIOaYr+WQpuaYr+acuuWZqOS6ulxuICAgICAqL1xuICAgIF9sb2FkQXZhdGFyU3ByaXRlOiBmdW5jdGlvbihzcHJpdGUsIGF2YXRhclVybCwgaXNSb2JvdCkge1xuICAgICAgICBpZiAoIXNwcml0ZSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDmnLrlmajkurrkvb/nlKjpu5jorqTlpLTlg4/vvIhhdmF0YXJfMSDliLAgYXZhdGFyXzMg6ZqP5py677yJXG4gICAgICAgIGlmIChpc1JvYm90KSB7XG4gICAgICAgICAgICB2YXIgcm9ib3RBdmF0YXJJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMVxuICAgICAgICAgICAgdmFyIGRlZmF1bHRQYXRoID0gXCJVSS9oZWFkaW1hZ2UvYXZhdGFyX1wiICsgcm9ib3RBdmF0YXJJbmRleFxuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoZGVmYXVsdFBhdGgsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUgJiYgc3ByaXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOecn+S6uueOqeWutlxuICAgICAgICBpZiAoIWF2YXRhclVybCB8fCBhdmF0YXJVcmwgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIC8vIOS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Yik5pat5pivVVJM6L+Y5piv5pys5Zyw6LWE5rqQ5ZCNXG4gICAgICAgIGlmIChhdmF0YXJVcmwuaW5kZXhPZihcImh0dHBcIikgPT09IDAgfHwgYXZhdGFyVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgLy8g6L+c56iLVVJMXG4gICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZShhdmF0YXJVcmwsIHsgZXh0OiAnLnBuZycgfSwgZnVuY3Rpb24oZXJyLCB0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCAhdGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDliqDovb3lpLHotKXvvIzkvb/nlKjpu5jorqTlpLTlg49cbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVycjIsIGZhbGxiYWNrU3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycjIgJiYgZmFsbGJhY2tTcHJpdGUgJiYgc3ByaXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBmYWxsYmFja1Nwcml0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwcml0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUodGV4dHVyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcIlVJL2hlYWRpbWFnZS9hdmF0YXJfMVwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyMiwgZmFsbGJhY2tTcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyMiAmJiBmYWxsYmFja1Nwcml0ZSAmJiBzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZhbGxiYWNrU3ByaXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOacrOWcsOi1hOa6kOWQjVxuICAgICAgICAgICAgdmFyIGxvY2FsUGF0aCA9IFwiVUkvaGVhZGltYWdlL1wiICsgYXZhdGFyVXJsXG4gICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChsb2NhbFBhdGgsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCAhc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yqg6L295aSx6LSl77yM5L2/55So6buY6K6k5aS05YOPXG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvaGVhZGltYWdlL2F2YXRhcl8xXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIyLCBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIyICYmIGZhbGxiYWNrU3ByaXRlICYmIHNwcml0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gZmFsbGJhY2tTcHJpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdfQ==