
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

    // 🔧【关键修复】预加载卡牌精灵图集
    this._preloadCardAtlas();

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
      if (!gameScene_script) {
        console.error("🃏 [onOtherPlayerChuCard] gameScene_script 为空");
        return;
      }
      var outCard_node = gameScene_script.getUserOutCardPosByAccount(data.accountid);

      // 🔧【调试】输出出牌区域查找结果
      console.log("🃏 [onOtherPlayerChuCard] data.accountid:", data.accountid, "outCard_node:", outCard_node ? outCard_node.name : "null");
      if (!outCard_node || !this.card_prefab) {
        console.error("🃏 [onOtherPlayerChuCard] outCard_node 或 card_prefab 为空, outCard_node:", !!outCard_node, "card_prefab:", !!this.card_prefab);
        return;
      }

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
    // 🔧【新增】用户活动监听 - 取消机器人托管
    // 核心逻辑：只要用户有鼠标移动或点击事件，就发送取消托管请求
    // ============================================================
    this._isLocalTrustee = false; // 本地托管状态
    this._lastActivityTime = 0; // 上次活动时间（用于防抖）
    this._activityThrottleMs = 500; // 防抖间隔（毫秒）

    // 注册全局用户活动监听
    this._setupUserActivityListener();

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
  /**
   * 🔧【新增】预加载卡牌精灵图集
   * 确保在发牌之前图集已经准备好
   */
  _preloadCardAtlas: function _preloadCardAtlas() {
    // 检查是否已经加载
    if (window._cardAtlasLoaded) {
      return;
    }
    cc.resources.load("UI/card/card", cc.SpriteAtlas, function (err, atlas) {
      if (err) {
        console.error("🃏 [_preloadCardAtlas] 加载卡牌图集失败:", err);
        return;
      }
      window._cardAtlasLoaded = true;
      window._cardAtlas = atlas;
      console.log("🃏 [_preloadCardAtlas] 卡牌图集预加载成功");
    });
  },
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
    // 🔧【关键修复】首先检查节点是否有效
    if (!this.node || !this.node.isValid) {
      console.warn("🎮 [renderCards] 节点已销毁或无效，跳过渲染");
      return;
    }
    if (!cards || cards.length === 0) {
      console.warn("🎮 [renderCards] 没有牌可渲染");
      return;
    }

    // 🔧【关键修复】确保 cards_node 存在
    if (!this.cards_node) {
      console.warn("🎮 [renderCards] cards_node 未定义，尝试重新查找或创建");
      var gameSceneNode = this.node.parent;
      if (gameSceneNode) {
        for (var i = 0; i < gameSceneNode.children.length; i++) {
          var child = gameSceneNode.children[i];
          if (child.name === "cards_node" || child.name === "cards" || child.name === "handCards") {
            this.cards_node = child;
            console.log("🎮 [renderCards] 找到 cards_node:", child.name);
            break;
          }
        }
        if (!this.cards_node) {
          var newCardsNode = new cc.Node("cards_node");
          newCardsNode.parent = gameSceneNode;
          newCardsNode.setPosition(0, 0);
          newCardsNode.setAnchorPoint(0.5, 0.5);
          newCardsNode.setContentSize(cc.size(800, 200));
          this.cards_node = newCardsNode;
          console.log("🎮 [renderCards] 创建新的 cards_node");
        }
      }

      // 如果仍然没有，返回
      if (!this.cards_node) {
        console.error("🎮 [renderCards] 无法创建 cards_node，放弃渲染");
        return;
      }
    }

    // 🔥【防重复渲染】检查是否与上次相同
    var hash = JSON.stringify(cards);
    if (this._lastRenderHash === hash) {
      console.log("🎮 [renderCards] 牌与上次相同，跳过渲染");
      return;
    }
    this._lastRenderHash = hash;
    console.log("🎮 [renderCards] 开始渲染 " + cards.length + " 张牌");

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
    // 🔧【修复】首先检查节点是否有效
    if (!this.node || !this.node.isValid) {
      console.warn("🎮 [clearAllCards] 节点已销毁或无效，跳过");
      return;
    }

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
    // 🔧【修复】检查 node.parent 是否存在
    if (!this.node || !this.node.isValid || !this.node.parent) {
      console.warn("🃏 [_getOutCardNode] node 或 node.parent 未定义或已销毁");
      return null;
    }
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
    var myglobal = window.myglobal;
    if (!myglobal) return;

    // 获取当前玩家ID
    var myPlayerId = myglobal.socket.getPlayerInfo().id || myglobal.playerData.serverPlayerId || myglobal.playerData.accountID;

    // 更新本地托管状态（仅当是自己时）
    if (String(data.player_id) === String(myPlayerId)) {
      this._isLocalTrustee = data.is_trustee;
      console.log("🎮 [托管] 本地托管状态更新:", data.is_trustee, "原因:", data.reason);
    }

    // 通知所有玩家节点更新托管状态
    if (this.node && this.node.parent) {
      this.node.parent.emit("trustee_state_update", data);
    }
  },
  // ============================================================
  // 🔧【新增】用户活动监听 - 取消机器人托管
  // ============================================================

  /**
   * 设置用户活动监听器
   * 当检测到用户活动（鼠标移动/点击/触摸）时，发送取消托管请求
   */
  _setupUserActivityListener: function _setupUserActivityListener() {
    var self = this;

    // 监听鼠标移动事件（全局）
    cc.systemEvent.on(cc.SystemEvent.EventType.MOUSE_MOVE, function (event) {
      self._onUserActivity("mouse_move");
    });

    // 监听鼠标点击事件（全局）
    cc.systemEvent.on(cc.SystemEvent.EventType.MOUSE_DOWN, function (event) {
      self._onUserActivity("mouse_down");
    });

    // 监听触摸开始事件（移动端）
    cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_START, function (event) {
      self._onUserActivity("touch_start");
    });

    // 监听触摸移动事件（移动端）
    cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_MOVE, function (event) {
      self._onUserActivity("touch_move");
    });
    console.log("🎮 [用户活动] 已注册全局活动监听器");
  },
  /**
   * 处理用户活动
   * 如果玩家处于托管状态，发送取消托管请求
   * @param {string} activityType - 活动类型
   */
  _onUserActivity: function _onUserActivity(activityType) {
    // 只在托管状态下处理
    if (!this._isLocalTrustee) {
      return;
    }

    // 防抖：限制发送频率
    var now = Date.now();
    if (now - this._lastActivityTime < this._activityThrottleMs) {
      return;
    }
    this._lastActivityTime = now;
    console.log("🎮 [用户活动] 检测到用户活动:", activityType, "发送取消托管请求");

    // 发送取消托管请求
    this._sendCancelTrustee();
  },
  /**
   * 发送取消托管请求到服务端
   */
  _sendCancelTrustee: function _sendCancelTrustee() {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.socket) {
      console.warn("🎮 [取消托管] socket 未初始化");
      return;
    }

    // 检查是否有对应的发送方法
    if (myglobal.socket.cancelTrustee) {
      myglobal.socket.cancelTrustee();
    } else if (myglobal.socket.send) {
      // 直接发送消息
      var msg = {
        type: "cancel_trustee",
        payload: {}
      };
      myglobal.socket.send(JSON.stringify(msg));
    } else {
      console.warn("🎮 [取消托管] 无法发送取消托管请求");
    }

    // 立即更新本地状态，避免重复发送
    this._isLocalTrustee = false;
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
    // 🔧【修复】首先检查节点是否有效
    if (!this.node || !this.node.isValid) {
      console.warn("🃏 [_showBottomCardsToAll] 节点已销毁或无效，跳过");
      return;
    }
    if (!cards || cards.length === 0) {
      return;
    }

    // 🔧【修复】检查 bottom_card 数组是否存在
    if (!this.bottom_card || !Array.isArray(this.bottom_card)) {
      console.warn("🃏 [_showBottomCardsToAll] bottom_card 未初始化");
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
    // 🔧【修复】首先检查节点是否有效
    if (!this.node || !this.node.isValid) {
      console.warn("🃏 [_updateLandlordHandCards] 节点已销毁或无效，跳过");
      return;
    }
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
    // 🔧【修复】检查 node.parent 是否存在
    if (!this.node || !this.node.isValid || !this.node.parent) {
      console.warn("🃏 [_showPassEffect] node 或 node.parent 未定义或已销毁");
      return;
    }

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
    // 🔧【修复】添加更完整的空值检查
    if (!this.node || !this.node.isValid) {
      console.warn("🎮 [_clearAllOutCardZones] this.node 为空或已销毁");
      return;
    }

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
    if (!children) {
      console.warn("🎮 [_clearAllOutCardZones] players_seat_pos.children 为空");
      return;
    }
    for (var i = 0; i < children.length; i++) {
      var seatNode = children[i];
      if (!seatNode) continue;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxnYW1laW5nVUkuanMiXSwibmFtZXMiOlsiaXNvcGVuX3NvdW5kIiwid2luZG93IiwicWlhbl9zdGF0ZSIsImJ1cWlhbmciLCJxaWFuIiwiQ2FyZHNWYWx1ZSIsIlJvb21TdGF0ZSIsIl9hdWRpb0NsaXBzIiwiQ2FyZExheW91dCIsImNhcmRTY2FsZSIsImNhcmRZIiwiY2FyZFNwYWNpbmciLCJib3R0b21DYXJkU2NhbGUiLCJib3R0b21DYXJkU3BhY2luZyIsIm91dENhcmRTY2FsZSIsIm91dENhcmRTcGFjaW5nIiwiRGVhbENvbmZpZyIsImFuaW1EdXJhdGlvbiIsImRlY2tQb3NpdGlvbiIsImNjIiwidjIiLCJjYXJkSW50ZXJ2YWwiLCJwbGF5U291bmQiLCJwYXRoIiwiYXVkaW9FbmdpbmUiLCJwbGF5IiwicmVzb3VyY2VzIiwibG9hZCIsIkF1ZGlvQ2xpcCIsImVyciIsImNsaXAiLCJDbGFzcyIsIkNvbXBvbmVudCIsInByb3BlcnRpZXMiLCJnYW1laW5nVUkiLCJOb2RlIiwiY2FyZF9wcmVmYWIiLCJQcmVmYWIiLCJyb2JVSSIsImJvdHRvbV9jYXJkX3Bvc19ub2RlIiwicGxheWluZ1VJX25vZGUiLCJ0aXBzTGFiZWwiLCJMYWJlbCIsImNhcmRzX25vZGUiLCJiaWRDb3VudGRvd25MYWJlbCIsInBsYXlDb3VudGRvd25MYWJlbCIsInRpY2tBdWRpbyIsInR5cGUiLCJvbkxvYWQiLCJteWdsb2JhbCIsImNvbnNvbGUiLCJlcnJvciIsIl9wcmVsb2FkQ2FyZEF0bGFzIiwiZ2FtZVNjZW5lTm9kZSIsIm5vZGUiLCJwYXJlbnQiLCJpIiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJjaGlsZCIsIm5hbWUiLCJuZXdDYXJkc05vZGUiLCJzZXRQb3NpdGlvbiIsInNldEFuY2hvclBvaW50Iiwic2V0Q29udGVudFNpemUiLCJzaXplIiwiaGFuZENhcmRzIiwiYm90dG9tQ2FyZHMiLCJjaG9vc2VfY2FyZF9kYXRhIiwicm9iX3BsYXllcl9hY2NvdW50aWQiLCJfYmlkZGluZ1BoYXNlIiwiX2dhbWVQaGFzZSIsImNhcmRzUmVhZHkiLCJfYmlkVGltZW91dCIsIl9wbGF5VGltZW91dCIsIl9iaWRDb3VudGRvd25UaW1lciIsIl9wbGF5Q291bnRkb3duVGltZXIiLCJfYmlkVGltZUxlZnQiLCJfcGxheVRpbWVMZWZ0IiwiX2lzQmlkQ291bnRkb3duVGlja2luZyIsIl9pc1BsYXlDb3VudGRvd25UaWNraW5nIiwiX2lzQmlkV2FybmluZyIsIl9pc1BsYXlXYXJuaW5nIiwiX2JpZEV4cGlyZXNBdCIsImJvdHRvbV9jYXJkIiwiX2lzQ29tcGV0aXRpb24iLCJfcm9vbUNhdGVnb3J5IiwiX21hdGNoQ29pbiIsIl9jb21wZXRpdGlvblJvdW5kIiwiX2NvbXBldGl0aW9uVG90YWxSb3VuZHMiLCJfY29tcGV0aXRpb25Db3VudGRvd24iLCJfY29tcGV0aXRpb25Db3VudGRvd25UaW1lciIsIl93YXNEaXNjb25uZWN0ZWQiLCJzb2NrZXQiLCJvblB1c2hDYXJkcyIsImRhdGEiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwiY2FyZHMiLCJib3R0b21fY2FyZHMiLCJfZ2FtZVJlc3VsdFBvcHVwIiwiX2dhbWVSZXN1bHRNYXNrIiwiX2Nsb3NlR2FtZVJlc3VsdFBvcHVwIiwiX3N0b3BBcmVuYUNvdW50ZG93biIsIl9jbGVhckFsbE91dENhcmRab25lcyIsInJlbmRlckNhcmRzIiwiYmluZCIsIm9uQmlkVHVybiIsIm9uQmlkUmVzdWx0IiwiX3N0b3BCaWRDb3VudGRvd24iLCJlbWl0IiwicGxheWVyX2lkIiwiYWNjb3VudGlkIiwiYmlkIiwic3RhdGUiLCJvbkNhblJvYlN0YXRlIiwib25DYW5DaHVDYXJkIiwicGxheWVySWQiLCJteVBsYXllcklkIiwiZ2V0UGxheWVySW5mbyIsImlkIiwicGxheWVyRGF0YSIsInNlcnZlclBsYXllcklkIiwiYWNjb3VudElEIiwiX3N0b3BQbGF5Q291bnRkb3duIiwiX211c3RQbGF5IiwibXVzdF9wbGF5IiwiX2NhbkJlYXQiLCJjYW5fYmVhdCIsIl9sYXN0UGxheWVkQ2FyZHMiLCJTdHJpbmciLCJfaGlkZVJvYlVJIiwiY2xlYXJPdXRab25lIiwiYWN0aXZlIiwidGltZW91dCIsIl9zdGFydFBsYXlDb3VudGRvd24iLCJvbk90aGVyUGxheWVyQ2h1Q2FyZCIsImlzX3Bhc3MiLCJfcGxheVBhc3NTb3VuZCIsIl9zaG93UGFzc0VmZmVjdCIsIl9sYXN0UGxheWVkSGFuZFR5cGUiLCJoYW5kX3R5cGUiLCJzb2NrZXRJbmZvIiwiYWNjb3VudElkIiwiaXNTZWxmIiwiX3JlbW92ZUNhcmRzRnJvbUhhbmQiLCJfcGxheUNhcmRTb3VuZCIsImdhbWVTY2VuZV9zY3JpcHQiLCJnZXRDb21wb25lbnQiLCJvdXRDYXJkX25vZGUiLCJnZXRVc2VyT3V0Q2FyZFBvc0J5QWNjb3VudCIsIm5vZGVfY2FyZHMiLCJjYXJkIiwiaW5zdGFudGlhdGUiLCJjYXJkU2NyaXB0Iiwic2hvd0NhcmRzIiwicHVzaCIsInNob3dPdXRDYXJkcyIsImNhcmRzX2xlZnQiLCJ1bmRlZmluZWQiLCJjb3VudCIsIm9uQ2FsbExhbmRsb3JkU3RhcnQiLCJvbkNhbGxMYW5kbG9yZFR1cm4iLCJfcHJvY2Vzc0NhbGxMYW5kbG9yZFR1cm4iLCJvbkNhbGxMYW5kbG9yZFJlc3VsdCIsIl9wbGF5Um9iU291bmQiLCJvbkNhbGxMYW5kbG9yZEVuZCIsIl9zaG93Qm90dG9tQ2FyZHNUb0FsbCIsIm9uTGFuZGxvcmRDYXJkcyIsImxhbmRsb3JkSWQiLCJsYW5kbG9yZF9pZCIsIl91cGRhdGVMYW5kbG9yZEhhbmRDYXJkcyIsIm9uUmVzdGFydEdhbWUiLCJjbGVhckFsbENhcmRzIiwib25QbGF5U3RhcnQiLCJvbkdhbWVPdmVyIiwiX3Jlc2V0QWxsUGxheWVyUmVhZHlTdGF0ZSIsIl9zaG93R2FtZVJlc3VsdFBvcHVwIiwib25HYW1lU3RhdGVSZXN0b3JlIiwicmVzdG9yZUdhbWVTdGF0ZSIsIm9uSGludFJlc3VsdCIsIl9vbkhpbnRSZXN1bHQiLCJvblRydXN0ZWVTdGF0ZU5vdGlmeSIsIl9vblRydXN0ZWVTdGF0ZU5vdGlmeSIsIl9pc0xvY2FsVHJ1c3RlZSIsIl9sYXN0QWN0aXZpdHlUaW1lIiwiX2FjdGl2aXR5VGhyb3R0bGVNcyIsIl9zZXR1cFVzZXJBY3Rpdml0eUxpc3RlbmVyIiwib25Db21wZXRpdGlvblN0YXR1cyIsIl9vbkNvbXBldGl0aW9uU3RhdHVzIiwib25Db21wZXRpdGlvbkNvdW50ZG93biIsIl9vbkNvbXBldGl0aW9uQ291bnRkb3duIiwib25NYXRjaENvaW5VcGRhdGUiLCJfb25NYXRjaENvaW5VcGRhdGUiLCJvbkNvbXBldGl0aW9uRWxpbWluYXRlZCIsIl9vbkNvbXBldGl0aW9uRWxpbWluYXRlZCIsIm9uQ29tcGV0aXRpb25BZHZhbmNlIiwiX29uQ29tcGV0aXRpb25BZHZhbmNlIiwib25Db21wZXRpdGlvbkNoYW1waW9uIiwiX29uQ29tcGV0aXRpb25DaGFtcGlvbiIsIm9uVG91cm5hbWVudEZpbmFsUmFuayIsIl9vblRvdXJuYW1lbnRGaW5hbFJhbmsiLCJvbiIsImdhbWVTY2VuZV9ub2RlIiwiZXZlbnQiLCJfdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXkiLCJjYXJkaWQiLCJzdWl0IiwicmFuayIsInNwbGljZSIsInN0YXJ0IiwiX2NhcmRBdGxhc0xvYWRlZCIsIlNwcml0ZUF0bGFzIiwiYXRsYXMiLCJfY2FyZEF0bGFzIiwib25EZXN0cm95IiwidW5zY2hlZHVsZSIsIl9jb21wZXRpdGlvbkNvdW50ZG93blRpY2siLCJfbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyIiwiX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrIiwiX2hpZGVNYXRjaENvaW5EaXNwbGF5IiwiaXNWYWxpZCIsIndhcm4iLCJoYXNoIiwiX2xhc3RSZW5kZXJIYXNoIiwic29ydGVkQ2FyZHMiLCJfc29ydENhcmRzIiwiX2NyZWF0ZUJvdHRvbUNhcmRzIiwiX2RlYWxDYXJkc1dpdGhBbmltYXRpb24iLCJzZWxmIiwiY2FyZFBhcmVudCIsImRlY2tQb3MiLCJ4IiwieSIsImluZGV4Iiwic2NoZWR1bGVPbmNlIiwiY2FyZERhdGEiLCJ0YXJnZXRYIiwiX2dldENhcmRYIiwidGFyZ2V0UG9zIiwic2NhbGUiLCJ6SW5kZXgiLCJjYXJkQ29tcCIsInR3ZWVuIiwidG8iLCJwb3NpdGlvbiIsImVhc2luZyIsImNhbGwiLCJ0b3RhbERlYWxUaW1lIiwiX29uRGVhbENhcmRzQ29tcGxldGUiLCJmYXBhaV9lbmQiLCJfY2hlY2tBbmRTaG93Um9iVUkiLCJnZXRDYXJkVmFsdWUiLCJzbGljZSIsInNvcnQiLCJhIiwiYiIsInZhbHVlQSIsInZhbHVlQiIsInJlbW92ZUFsbENoaWxkcmVuIiwic3BhY2luZyIsInRvdGFsV2lkdGgiLCJzdGFydFgiLCJkZXN0cm95IiwiYm90dG9tWSIsImJvdHRvbVN0YXJ0WCIsImRpX2NhcmQiLCJfc2hvd0JpZFVJIiwicm91bmQiLCJleHBpcmVzQXQiLCJleHBpcmVzX2F0IiwiY29uZmlybVRleHQiLCJjYW5jZWxUZXh0IiwiY29uZmlybUJ0biIsImdldENoaWxkQnlOYW1lIiwiY2FuY2VsQnRuIiwibGFiZWwiLCJzdHJpbmciLCJfc3RhcnRCaWRDb3VudGRvd24iLCJkdXJhdGlvbiIsInRpbWVMZWZ0Iiwibm93IiwiRGF0ZSIsIk1hdGgiLCJtYXgiLCJmbG9vciIsIl91cGRhdGVCaWRDb3VudGRvd25VSSIsInNjaGVkdWxlIiwiX2JpZENvdW50ZG93blRpY2siLCJfZW50ZXJCaWRXYXJuaW5nU3RhdGUiLCJfcGxheVRpY2tTb3VuZCIsIl9vbkJpZENvdW50ZG93bkVuZCIsInJlbWFpbmluZyIsInVwZGF0ZWQiLCJjbG9ja05vZGUiLCJqIiwib3BhY2l0eSIsImZvbnRTaXplIiwibGluZUhlaWdodCIsImNvbG9yIiwiQ29sb3IiLCJsYWJlbE5vZGUiLCJfZ2V0QmlkQ291bnRkb3duTGFiZWxOb2RlIiwiUkVEIiwic3RvcEFsbEFjdGlvbnMiLCJyZXBlYXRGb3JldmVyIiwibGFiZWxOYW1lcyIsIldISVRFIiwiX3VwZGF0ZVBsYXlDb3VudGRvd25VSSIsIl9wbGF5Q291bnRkb3duVGljayIsIl9lbnRlclBsYXlXYXJuaW5nU3RhdGUiLCJfb25QbGF5Q291bnRkb3duRW5kIiwiRXZlbnQiLCJFdmVudEN1c3RvbSIsInNldFVzZXJEYXRhIiwiZGlzcGF0Y2hFdmVudCIsImNsb2NrTGFiZWwiLCJfdXBkYXRlQ2xvY2tUaW1lTGFiZWwiLCJwbGF5ZXJOb2RlU2NyaXB0Iiwic2VhdF9pbmRleCIsInRpbWVfbGFiZWwiLCJjbG9ja2ltYWdlIiwiY2xvY2tDaGlsZHJlbiIsImNsb2NrQ2hpbGQiLCJkaXJlY3RMYWJlbCIsIl9nZXRQbGF5Q291bnRkb3duTGFiZWxOb2RlIiwicGxheUVmZmVjdCIsIl9wbGF5UGxheVRpY2tTb3VuZCIsImFjdGlvbiIsImdlbmRlciIsIm9yZGVyIiwicGxheWVySUQiLCJzb3VuZEtleSIsIl9sYXN0Um9iU291bmRLZXkiLCJwYXNzU291bmQiLCJfcGxheVNvdW5kRWZmZWN0Iiwic291bmRzIiwiX3BsYXlSYW5kb21Tb3VuZCIsImZhbGxiYWNrIiwiYWxsb3dEYW5pRmFsbGJhY2siLCJtZXNzYWdlIiwiZXJyMiIsImNsaXAyIiwicmFuZG9tIiwib25CdXR0b25DbGljayIsImN1c3RvbURhdGEiLCJyZXF1ZXN0QmlkIiwicmVxdWVzdFJvYlN0YXRlIiwicmVxdWVzdF9idWNodV9jYXJkIiwiX29uSGludEJ1dHRvbkNsaWNrIiwic2V0VGltZW91dCIsInNlbGVjdGVkQ2FyZE5hbWVzIiwiY2FyZF9kYXRhIiwiY2FyZE5hbWUiLCJfZ2V0Q2FyZERpc3BsYXlOYW1lIiwiY2FyZHNUb1BsYXkiLCJtYXAiLCJjIiwidmFsaWRhdGlvblJlc3VsdCIsIl92YWxpZGF0ZUhhbmRUeXBlIiwidmFsaWQiLCJyZXF1ZXN0X2NodV9jYXJkIiwiZXJyb3JNc2ciLCJtc2ciLCJzZWxlY3RlZFR5cGUiLCJzZWxlY3RlZENvdW50IiwibGFzdFBsYXllZFR5cGUiLCJsYXN0UGxheWVkQ291bnQiLCJsYXN0UGxheWVkQ2FyZE5hbWVzIiwibmFtZXMiLCJqb2luIiwiZGV0YWlsTXNnIiwiaW5kZXhPZiIsInlvdXJDYXJkcyIsIl9yZXNldENhcmRGbGFncyIsImRpc3BsYXlUZXh0IiwicHVzaFRocmVlQ2FyZCIsImNhcmRUb1JlbW92ZSIsIl91cGRhdGVIYW5kQ2FyZHNTaWxlbnQiLCJjYXJkc1BhcmVudCIsIm9sZENoaWxkcmVuIiwib2ZmIiwiRXZlbnRUeXBlIiwiVE9VQ0hfU1RBUlQiLCJkZXN0b3J5Q2FyZCIsImNob29zZV9jYXJkIiwiZGVzdHJveV9jYXJkIiwiX2dldE91dENhcmROb2RlIiwic2VsZWN0ZWROb2RlcyIsImZsYWciLCJzZW5kSGludFJlcXVlc3QiLCJfc2VsZWN0Q2FyZHMiLCJpc190cnVzdGVlIiwicmVhc29uIiwic3lzdGVtRXZlbnQiLCJTeXN0ZW1FdmVudCIsIk1PVVNFX01PVkUiLCJfb25Vc2VyQWN0aXZpdHkiLCJNT1VTRV9ET1dOIiwiVE9VQ0hfTU9WRSIsImFjdGl2aXR5VHlwZSIsIl9zZW5kQ2FuY2VsVHJ1c3RlZSIsImNhbmNlbFRydXN0ZWUiLCJzZW5kIiwicGF5bG9hZCIsIl9maW5kUGxheWFibGVDYXJkcyIsImxhc3RTZWxlY3RlZCIsImNhcmRDb3VudHMiLCJfZmluZFNtYWxsZXN0Q2FyZHMiLCJsYXN0VHlwZSIsImxhc3RSYW5rIiwiX2dldExhc3RQbGF5ZWRNYWluUmFuayIsImxhc3RDb3VudCIsInRvTG93ZXJDYXNlIiwiX2ZpbmRCZWF0aW5nU2luZ2xlIiwiX2ZpbmRCZWF0aW5nUGFpciIsIl9maW5kQmVhdGluZ1RyaXBsZSIsIl9maW5kQmVhdGluZ0JvbWIiLCJfZmluZEJlYXRpbmdCeUNvdW50IiwiY291bnRzIiwibWF4Q291bnQiLCJtYWluUmFuayIsInBhcnNlSW50IiwicmFua3MiLCJPYmplY3QiLCJrZXlzIiwiciIsInRhcmdldFJhbmsiLCJfZmluZFNtYWxsZXN0Qm9tYiIsImtpY2tlcnMiLCJyZXN1bHQiLCJraWNrZXJDYXJkcyIsIl9maW5kS2lja2VyQ2FyZHMiLCJjb25jYXQiLCJleGNsdWRlUmFuayIsImF2YWlsYWJsZSIsIm1pbiIsIl9maW5kUm9ja2V0Iiwiam9rZXJzIiwiZm91bmRDb3VudCIsImFscmVhZHlNYXRjaGVkIiwiY2FyZE5vZGUiLCJtYXRjaEtleSIsImNhcmRfaWQiLCJhZGRDaGlsZCIsInNldFNjYWxlIiwiZ2FtZVN0YXRlIiwiZ2FtZV9zdGF0ZSIsInBoYXNlIiwicGxheWVycyIsInAiLCJpc19sYW5kbG9yZCIsIm1hc3Rlcl9hY2NvdW50aWQiLCJoYW5kIiwibGFzdF9wbGF5ZWQiLCJsYXN0X3BsYXllcl9pZCIsImN1cnJlbnRfdHVybiIsIkFycmF5IiwiaXNBcnJheSIsImhhbmRUeXBlIiwiaXNOZXdSb3VuZCIsImlzX25ld19yb3VuZCIsImNhbkJlYXQiLCJfZXh0cmFjdE1haW5SYW5rIiwiaXNCb21iIiwiaXNSb2NrZXQiLCJzb3VuZE5hbWUiLCJfZ2V0Q2FyZFR5cGVTb3VuZCIsImNhcmRTb3VuZCIsInByZWZpeCIsImRhbmlTb3VuZCIsImhhc1NwZWNpZmljU291bmQiLCJfaGFzU3BlY2lmaWNDYXJkU291bmQiLCJyYW5kb21WYWx1ZSIsInNvdW5kSW5kZXgiLCJfcmFua1RvU291bmRJbmRleCIsImhhc1NvdW5kIiwic3BlY2lhbFR5cGVzIiwiX2V4dHJhY3RDYXJkUmFuayIsIk51bWJlciIsInZhbHVlIiwibG9naWNfdmFsdWUiLCJrZXkiLCJzdWZmaXgiLCJyYW5kb21JbmRleCIsIl9wbGF5R2FtZVJlc3VsdFNvdW5kIiwiaXNXaW4iLCJwYXNzTm9kZSIsImFkZENvbXBvbmVudCIsIm91dGxpbmUiLCJMYWJlbE91dGxpbmUiLCJ3aWR0aCIsInN1aXROYW1lcyIsInN1aXROYW1lIiwicmFua05hbWVzIiwicmFua05hbWUiLCJyYW5rQ291bnRzIiwidmFsdWVzIiwiZm91cnMiLCJ0aHJlZXMiLCJwYWlycyIsInNpbmdsZXMiLCJpc1NlcXVlbnRpYWwiLCJfaXNTZXF1ZW50aWFsIiwibm9Ud29Pckpva2VyIiwiZXZlcnkiLCJwYWlyUmFua3MiLCJ0aHJlZVJhbmtzIiwidGhyZWVDb3VudCIsInJvb21fY2F0ZWdvcnkiLCJfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXAiLCJpc1dpbm5lciIsIm15V2luR29sZCIsInBsYXllciIsImlzX3dpbm5lciIsIndpbl9nb2xkIiwid2lubmVyX2lkIiwiaXNMYW5kbG9yZCIsIm9sZEdvbGQiLCJnb2JhbF9jb3VudCIsIm5ld0dvbGQiLCJnb2xkQWZ0ZXIiLCJnb2xkX2FmdGVyIiwiX3VwZGF0ZVBsYXllckdvbGREaXNwbGF5IiwibG9jYWxHb2xkIiwiX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cCIsIl9jb250aW51ZUdhbWUiLCJfcmV0dXJuVG9Mb2JieSIsImNhbGxiYWNrIiwid2luU2l6ZSIsImNhbnZhcyIsImZpbmQiLCJtYXNrTm9kZSIsIkJsb2NrSW5wdXRFdmVudHMiLCJtYXNrU3ByaXRlIiwiU3ByaXRlIiwic3ByaXRlRnJhbWUiLCJTcHJpdGVGcmFtZSIsIlR5cGUiLCJTSU1QTEUiLCJzaXplTW9kZSIsIlNpemVNb2RlIiwiQ1VTVE9NIiwiaGVpZ2h0IiwicG9wdXBOb2RlIiwicG9wdXBXaWR0aCIsInBvcHVwSGVpZ2h0IiwiYmdOb2RlIiwiX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZCIsImJvcmRlck5vZGUiLCJfY3JlYXRlR29sZGVuQm9yZGVyIiwiZWZmZWN0TGF5ZXIiLCJfY3JlYXRlVmljdG9yeVBhcnRpY2xlcyIsIl9jcmVhdGVEZWZlYXRQYXJ0aWNsZXMiLCJiYW5uZXJZIiwiYmFubmVyTm9kZSIsIl9jcmVhdGVSZXN1bHRCYW5uZXIiLCJkZXRhaWxYIiwiZGV0YWlsWSIsImRldGFpbE5vZGUiLCJfY3JlYXRlTXVsdGlwbGllckRldGFpbENhcmQiLCJsaXN0V2lkdGgiLCJsaXN0WCIsImxpc3RZIiwicGxheWVyTGlzdE5vZGUiLCJfY3JlYXRlUGxheWVyUmVzdWx0TGlzdCIsImJ0blkiLCJidXR0b25BcmVhIiwiX2NyZWF0ZUJ1dHRvbkFyZWEiLCJfc3RhcnROdW1iZXJBbmltYXRpb25zIiwiX3Jlc3VsdEVmZmVjdExheWVyIiwiZ3JhcGhpY3MiLCJHcmFwaGljcyIsInRvcENvbG9yIiwiYm90dG9tQ29sb3IiLCJmaWxsQ29sb3IiLCJyb3VuZFJlY3QiLCJmaWxsIiwiaW5uZXJHbG93IiwiZ2xvd1Nwcml0ZSIsIlNMSUNFRCIsIm92ZXJsYXkiLCJvdmVybGF5U3ByaXRlIiwiYm9yZGVyQ29sb3IiLCJnbG93Q29sb3IiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsImNvcm5lclNpemUiLCJjb3JuZXJzIiwicm90IiwiY29ybmVyIiwiZGVjb3JOb2RlIiwiZGciLCJtb3ZlVG8iLCJsaW5lVG8iLCJhbmdsZSIsImJhbm5lcldpZHRoIiwiYmFubmVySGVpZ2h0IiwidGl0bGVOb2RlIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ0aXRsZUxhYmVsIiwiZm9udEZhbWlseSIsImhvcml6b250YWxBbGlnbiIsIkhvcml6b250YWxBbGlnbiIsIkNFTlRFUiIsInZlcnRpY2FsQWxpZ24iLCJWZXJ0aWNhbEFsaWduIiwic2hhZG93IiwiTGFiZWxTaGFkb3ciLCJvZmZzZXQiLCJibHVyIiwiY2FyZFdpZHRoIiwiY2FyZEhlaWdodCIsImxpbmVOb2RlIiwibGciLCJtdWx0aURldGFpbCIsIm11bHRpX2RldGFpbCIsImRldGFpbHMiLCJiYXNlX3Njb3JlIiwicWlhbmdfY291bnQiLCJxaWFuZ19tdWx0aSIsImJvbWJfY291bnQiLCJib21iX211bHRpIiwicm9ja2V0X2NvdW50Iiwicm9ja2V0X211bHRpIiwic3ByaW5nX3R5cGUiLCJpdGVtWSIsIml0ZW1IZWlnaHQiLCJpdGVtIiwiaXRlbU5vZGUiLCJ2YWx1ZU5vZGUiLCJ2YWx1ZUxhYmVsIiwidG90YWxNdWx0aU5vZGUiLCJ0b3RhbE11bHRpQmciLCJ0bWciLCJ0b3RhbExhYmVsIiwidHRsIiwibXVsdGlWYWx1ZU5vZGUiLCJtdmwiLCJtdWx0aXBsZSIsIm12byIsImxpc3ROb2RlIiwibGlzdEhlaWdodCIsImhlYWRlck5vZGUiLCJoZWFkZXJzIiwiaGVhZGVyWCIsImhOb2RlIiwiaExhYmVsIiwic2VwTm9kZSIsInNnIiwiaXRlbVN0YXJ0WSIsImlzQ3VycmVudFBsYXllciIsIl9jcmVhdGVQbGF5ZXJSZXN1bHRJdGVtIiwiaGlnaGxpZ2h0IiwiaGciLCJhdmF0YXJOb2RlIiwiYXZhdGFyQmciLCJhZyIsInJvbGUiLCJjaXJjbGUiLCJhdmF0YXJJbmRleCIsImF2YXRhclBhdGgiLCJhdmF0YXJTcHJpdGUiLCJzcCIsInJvbGVJY29uTm9kZSIsInJvbGVMYWJlbCIsIm5hbWVOb2RlIiwibmFtZUxhYmVsIiwicGxheWVyX25hbWUiLCJyb2xlTm9kZSIsInJvbGVUZXh0Iiwid2luR29sZCIsIndpbk5vZGUiLCJ3aW5MYWJlbCIsIndpbk91dGxpbmUiLCJhcmVhTm9kZSIsImNvbnRpbnVlQnRuIiwiX2NyZWF0ZVN0eWxlZEJ1dHRvbiIsIlRPVUNIX0VORCIsImxvYmJ5QnRuIiwidGV4dCIsImlzUHJpbWFyeSIsImJ0bk5vZGUiLCJidG5XaWR0aCIsImJ0bkhlaWdodCIsIm92ZXJmbG93IiwiT3ZlcmZsb3ciLCJTSFJJTksiLCJUT1VDSF9DQU5DRUwiLCJjb2luIiwiZyIsInRhcmdldFkiLCJkZWxheSIsInBhcmFsbGVsIiwic3RhciIsIl9kcmF3U3RhciIsInBhcnRpY2xlIiwiY3giLCJjeSIsImlubmVyUmFkaXVzIiwicG9pbnRzIiwib3V0ZXJSYWRpdXMiLCJyYWRpdXMiLCJQSSIsImNvcyIsInNpbiIsImNsb3NlIiwiX2ZpbmROb2RlQnlOYW1lIiwidGFyZ2V0TXVsdGkiLCJfYW5pbWF0ZU51bWJlciIsImZyb20iLCJzdGFydFRpbWUiLCJkaWZmIiwidXBkYXRlIiwiZWxhcHNlZCIsInByb2dyZXNzIiwiZWFzZVByb2dyZXNzIiwicG93IiwiY3VycmVudCIsImZvdW5kIiwicGxheWVyR29sZCIsInJvb21Db25maWciLCJjdXJyZW50Um9vbUNvbmZpZyIsIm1pbkdvbGQiLCJtaW5fZ29sZCIsIl9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwIiwiX2RvQ29udGludWVHYW1lIiwiX3Jlc2V0R2FtZVN0YXRlIiwicmVxdWVzdFJlYWR5IiwiY3VycmVudEdvbGQiLCJyZXF1aXJlZEdvbGQiLCJkaXJlY3RvciIsImdldFNjZW5lIiwiY29udGVudE5vZGUiLCJjb250ZW50TGFiZWwiLCJfZm9ybWF0R29sZCIsIlJFU0laRV9IRUlHSFQiLCJidG5BcmVhTm9kZSIsImFkQnRuIiwiYWRCZyIsImFkTGFiZWxOb2RlIiwiYWRMYWJlbCIsImxvYmJ5QmciLCJsb2JieUxhYmVsTm9kZSIsImxvYmJ5TGFiZWwiLCJfaW5zdWZmaWNpZW50R29sZFBvcHVwIiwiX2luc3VmZmljaWVudEdvbGRNYXNrIiwiX3dhdGNoQWRGb3JHb2xkIiwic3VjY2VzcyIsIl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCIsInR0Iiwic2hvd1Jld2FyZGVkVmlkZW9BZCIsIl9yZXdhcmRHb2xkQWZ0ZXJBZCIsImZhaWwiLCJfc2hvd01lc3NhZ2UiLCJ3eCIsImNyZWF0ZVJld2FyZGVkVmlkZW9BZCIsInJld2FyZGVkVmlkZW9BZCIsImFkVW5pdElkIiwib25DbG9zZSIsInJlcyIsImlzRW5kZWQiLCJvbkVycm9yIiwic2hvdyIsInRoZW4iLCJfcmV3YXJkR29sZEFmdGVyR29sZCIsInJld2FyZEFtb3VudCIsInVwZGF0ZUdvbGQiLCJzZW5kQWRSZXdhcmQiLCJnb2xkIiwidG9GaXhlZCIsInRvU3RyaW5nIiwibGVhdmVSb29tIiwibG9hZFNjZW5lIiwiX2NsZWFyQm90dG9tQ2FyZHMiLCJwbGF5ZXJzX3NlYXRfcG9zIiwic2VhdE5vZGUiLCJvdXRab25lTmFtZSIsIm91dFpvbmUiLCJwbGF5ZXJOb2RlTGlzdCIsInBsYXllck5vZGUiLCJwbGF5ZXJTY3JpcHQiLCJyZWFkeWltYWdlIiwiZ2xvYmFsY291bnRfbGFiZWwiLCJfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheSIsIm1hdGNoQ29pbiIsImlzX2ZpbmFsX3JvdW5kIiwibXlNYXRjaENvaW4iLCJtYXRjaF9jb2luIiwiYmciLCJyZXN1bHROb2RlIiwicmVzdWx0TGFiZWwiLCJtdWx0aU5vZGUiLCJtdWx0aUxhYmVsIiwiY29pbk5vZGUiLCJjb2luTGFiZWwiLCJpbml0aWFsQ291bnRkb3duIiwiYXJlbmFfY291bnRkb3duIiwiY291bnRkb3duQ29udGFpbmVyIiwiY291bnRkb3duTGFiZWwiLCJjb3VudGRvd25MYWJlbENvbXAiLCJjb3VudGRvd25OdW1iZXIiLCJjb3VudGRvd25OdW1iZXJDb21wIiwiQkxBQ0siLCJfY291bnRkb3duTGFiZWxOb2RlIiwiX2NvdW50ZG93bk51bWJlck5vZGUiLCJfYXJlbmFDb3VudGRvd25TZWNvbmRzIiwiX3N0YXJ0TG9jYWxBcmVuYUNvdW50ZG93biIsIl9zZXR1cEFyZW5hQ291bnRkb3duTGlzdGVuZXJzIiwic2Vjb25kcyIsIl91cGRhdGVBcmVuYUNvdW50ZG93blVJIiwibWFjcm8iLCJSRVBFQVRfRk9SRVZFUiIsIl9zaG93V2FpdGluZ0ZvclNlcnZlciIsIm9uQXJlbmFSb3VuZENvdW50ZG93biIsIm9uQXJlbmFDb3VudGRvd25UaWNrIiwib25BcmVuYUF1dG9SZWFkeSIsIl9zaG93QXJlbmFBdXRvUmVhZHlNZXNzYWdlIiwib25BcmVuYVJlY29ubmVjdFN0YXRlIiwiY291bnRkb3duIiwibnVtTGFiZWwiLCJ0b3RhbF9yb3VuZHMiLCJfc2hvd01hdGNoQ29pbkRpc3BsYXkiLCJfdXBkYXRlQ29tcGV0aXRpb25Db3VudGRvd25EaXNwbGF5IiwiX3VwZGF0ZU1hdGNoQ29pbkRpc3BsYXkiLCJkZWx0YSIsIl9tYXRjaENvaW5Ob2RlIiwibWF0Y2hDb2luTm9kZSIsImljb25Ob2RlIiwiaWNvbkxhYmVsIiwiX3Nob3dNYXRjaENvaW5EZWx0YUFuaW1hdGlvbiIsImRlbHRhTm9kZSIsImRlbHRhTGFiZWwiLCJfc2hvd0VsaW1pbmF0ZWRQb3B1cCIsInJhbmtOb2RlIiwicmFua0xhYmVsIiwicmVhc29uTm9kZSIsInJlYXNvbkxhYmVsIiwidG90YWxOb2RlIiwidG90YWxfcGxheWVycyIsInJld2FyZHMiLCJyZXdhcmROb2RlIiwicmV3YXJkTGFiZWwiLCJidG5CZyIsImJ0bkxhYmVsTm9kZSIsImJ0bkxhYmVsIiwiX2VsaW1pbmF0ZWRQb3B1cCIsIl9lbGltaW5hdGVkTWFzayIsImN1cnJlbnRfcm91bmQiLCJfc2hvd0FkdmFuY2VUb2FzdCIsInRvYXN0Tm9kZSIsIl9zaG93Q2hhbXBpb25Qb3B1cCIsImVuYWJsZUJvbGQiLCJyYW5raW5ncyIsInRvcFRocmVlWSIsIl9jcmVhdGVSYW5raW5nSXRlbSIsIm90aGVyVGl0bGVOb2RlIiwib3RoZXJUaXRsZUxhYmVsIiwic3RhcnRZIiwibWF4T3RoZXJSYW5raW5ncyIsInJhbmtJbmZvIiwicmFua0l0ZW1Ob2RlIiwicmFua0l0ZW1MYWJlbCIsImNvbmZpcm1CZyIsImNvbmZpcm1MYWJlbE5vZGUiLCJjb25maXJtTGFiZWwiLCJfY3JlYXRlQ2hhbXBpb25QYXJ0aWNsZXMiLCJfY2hhbXBpb25Qb3B1cCIsIl9jaGFtcGlvbk1hc2siLCJiZ0NvbG9yIiwicmFua0xhYmVsTm9kZSIsInJhbmtUZXh0IiwibmFtZUxhYmVsTm9kZSIsImNvaW5MYWJlbE5vZGUiLCJwYXJlbnROb2RlIiwicGFydGljbGVMYWJlbCIsIl9zaG93VG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyIsInRpdGxlQmdOb2RlIiwidGl0bGVCZyIsInRvcDMiLCJwb2RpdW1ZIiwicG9kaXVtU3BhY2luZyIsIl9jcmVhdGVQb2RpdW1FbnRyeSIsInRvcDIwIiwibGlzdFRpdGxlTm9kZSIsImxpc3RUaXRsZUxhYmVsIiwic2Nyb2xsVmlld05vZGUiLCJtYXNrIiwiTWFzayIsIlJFQ1QiLCJ0b3AzUGxheWVySURzIiwiZmlsdGVyZWRUb3AyMCIsInJhbmtEYXRhIiwiYWN0dWFsUmFuayIsIl9jcmVhdGVSYW5rTGlzdEl0ZW0iLCJfYWRkU2Nyb2xsVmlld1RvdWNoIiwic2VwIiwibXlSYW5rQmdOb2RlIiwibXlSYW5rQmciLCJteVJhbmtOb2RlIiwibXlSYW5rTGFiZWwiLCJteV9yYW5rIiwibXlfbWF0Y2hfY29pbiIsImJ0bkxhYmVsQ29tcCIsIl9sb2FkQXZhdGFyU3ByaXRlIiwiYXZhdGFyIiwiaXNfcm9ib3QiLCJwbGF5ZXJOYW1lIiwiX2dldFJvYm90RGlzcGxheU5hbWUiLCJMRUZUIiwiQ0xBTVAiLCJSSUdIVCIsInZpZXdIZWlnaHQiLCJ0b3VjaFN0YXJ0WSIsImNvbnRlbnRTdGFydFkiLCJtYXhPZmZzZXQiLCJnZXRMb2NhdGlvblkiLCJ0b3VjaFkiLCJkZWx0YVkiLCJuZXdZIiwibWluWSIsIm1heFkiLCJlbnRyeU5vZGUiLCJtZWRhbE5vZGUiLCJtZWRhbCIsIm1lZGFsQ29sb3IiLCJyYW5rTnVtTm9kZSIsInJhbmtOdW1MYWJlbCIsImF2YXRhckZyYW1lTm9kZSIsImF2YXRhckZyYW1lIiwib3JpZ2luYWxOYW1lIiwicm9ib3RJbmRleCIsImxhc3RDaGFyIiwic3ByaXRlIiwiYXZhdGFyVXJsIiwiaXNSb2JvdCIsInJvYm90QXZhdGFySW5kZXgiLCJkZWZhdWx0UGF0aCIsImFzc2V0TWFuYWdlciIsImxvYWRSZW1vdGUiLCJleHQiLCJ0ZXh0dXJlIiwiZmFsbGJhY2tTcHJpdGUiLCJlIiwibG9jYWxQYXRoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxJQUFJQSxZQUFZLEdBQUdDLE1BQU0sQ0FBQ0QsWUFBWSxJQUFJLENBQUM7QUFDM0MsSUFBSUUsVUFBVSxHQUFHRCxNQUFNLENBQUNDLFVBQVUsSUFBSTtFQUFFQyxPQUFPLEVBQUUsQ0FBQztFQUFFQyxJQUFJLEVBQUU7QUFBRSxDQUFDO0FBQzdELElBQUlDLFVBQVUsR0FBR0osTUFBTSxDQUFDSSxVQUFVLElBQUksQ0FBQyxDQUFDO0FBQ3hDLElBQUlDLFNBQVMsR0FBR0wsTUFBTSxDQUFDSyxTQUFTLElBQUksQ0FBQyxDQUFDOztBQUV0QztBQUNBLElBQUlDLFdBQVcsR0FBRyxDQUFDLENBQUM7O0FBRXBCO0FBQ0EsSUFBSUMs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bEIsY0FBYyxJQUFJVCxNQUFNLENBQUMxc0IsT0FBTyxFQUFFO2NBQzNDMHNCLE1BQU0sQ0FBQy9ZLFdBQVcsR0FBR3daLGNBQWM7WUFDdkM7VUFDSixDQUFDLENBQUM7UUFDTjtNQUNKLENBQUMsQ0FBQztJQUNOLENBQUMsTUFBTTtNQUNIO01BQ0EsSUFBSUUsU0FBUyxHQUFHLGVBQWUsR0FBR1YsU0FBUztNQUMzQ3Q1QixFQUFFLENBQUNPLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDdzVCLFNBQVMsRUFBRWg2QixFQUFFLENBQUN1Z0IsV0FBVyxFQUFFLFVBQVM3ZixHQUFHLEVBQUU0ZixXQUFXLEVBQUU7UUFDcEUsSUFBSTVmLEdBQUcsSUFBSSxDQUFDNGYsV0FBVyxFQUFFO1VBQ3JCO1VBQ0F0Z0IsRUFBRSxDQUFDTyxTQUFTLENBQUNDLElBQUksQ0FBQyx1QkFBdUIsRUFBRVIsRUFBRSxDQUFDdWdCLFdBQVcsRUFBRSxVQUFTcE0sSUFBSSxFQUFFMmxCLGNBQWMsRUFBRTtZQUN0RixJQUFJLENBQUMzbEIsSUFBSSxJQUFJMmxCLGNBQWMsSUFBSVQsTUFBTSxDQUFDMXNCLE9BQU8sRUFBRTtjQUMzQzBzQixNQUFNLENBQUMvWSxXQUFXLEdBQUd3WixjQUFjO1lBQ3ZDO1VBQ0osQ0FBQyxDQUFDO1VBQ0Y7UUFDSjtRQUNBLElBQUlULE1BQU0sQ0FBQzFzQixPQUFPLEVBQUU7VUFDaEIwc0IsTUFBTSxDQUFDL1ksV0FBVyxHQUFHQSxXQUFXO1FBQ3BDO01BQ0osQ0FBQyxDQUFDO0lBQ047RUFDSjtBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5L2/55So5YWo5bGA5Y+Y6YeP77yM5LiN5L2/55SoIHJlcXVpcmVcbi8vIOOAkOW9u+W6leS/ruWkjeeJiOacrOOAkeacjeWKoeerr+aVsOaNruS4uuWUr+S4gOaVsOaNrua6kFxuLy8gXG4vLyDmoLjlv4Pljp/liJnvvJpcbi8vIDEuIGhhbmRDYXJkcyDmmK/llK/kuIDmlbDmja7mupDvvIzkv53lrZjmnI3liqHnq6/ljp/lp4vmlbDmja5cbi8vIDIuIOemgeatouS7u+S9leaVsOaNrui9rOaNouOAgeaOkuW6j+OAgemHjeaWsOiuoeeul1xuLy8gMy4gcmVuZGVyQ2FyZHMoKSDmmK/llK/kuIDmuLLmn5PlhaXlj6Ncbi8vIDQuIOWKqOeUu+WPquaYr+inhuinieaViOaenO+8jOe7neS4jeiDveS/ruaUueaVsOaNrlxuLy8gNS4gY2xlYXJBbGxDYXJkcygpIOa4heeQhuaJgOacieaXp+iKgueCue+8iOino+WGs+iDjOmdoueJjOaui+eVme+8iVxuXG52YXIgaXNvcGVuX3NvdW5kID0gd2luZG93Lmlzb3Blbl9zb3VuZCB8fCAxXG52YXIgcWlhbl9zdGF0ZSA9IHdpbmRvdy5xaWFuX3N0YXRlIHx8IHsgYnVxaWFuZzogMCwgcWlhbjogMSB9XG52YXIgQ2FyZHNWYWx1ZSA9IHdpbmRvdy5DYXJkc1ZhbHVlIHx8IHt9XG52YXIgUm9vbVN0YXRlID0gd2luZG93LlJvb21TdGF0ZSB8fCB7fVxuXG4vLyDpn7PmlYjnvJPlrZhcbnZhciBfYXVkaW9DbGlwcyA9IHt9XG5cbi8vIOeJjOW4g+WxgOmFjee9rlxudmFyIENhcmRMYXlvdXQgPSB7XG4gICAgY2FyZFNjYWxlOiAwLjgsXG4gICAgY2FyZFk6IC0yNTAsXG4gICAgY2FyZFNwYWNpbmc6IDM1LFxuICAgIGJvdHRvbUNhcmRTY2FsZTogMC40LFxuICAgIGJvdHRvbUNhcmRTcGFjaW5nOiAyNSxcbiAgICBvdXRDYXJkU2NhbGU6IDAuNSxcbiAgICBvdXRDYXJkU3BhY2luZzogMjUsXG59XG5cbi8vIOWPkeeJjOWKqOeUu+mFjee9rlxudmFyIERlYWxDb25maWcgPSB7XG4gICAgYW5pbUR1cmF0aW9uOiAwLjEyLFxuICAgIGRlY2tQb3NpdGlvbjogY2MudjIoMCwgMTAwKSxcbiAgICBjYXJkSW50ZXJ2YWw6IDgwLFxufVxuXG4vLyDliqDovb3lubbmkq3mlL7pn7PmlYhcbmZ1bmN0aW9uIHBsYXlTb3VuZChwYXRoKSB7XG4gICAgaWYgKCFpc29wZW5fc291bmQpIHJldHVybiBudWxsXG4gICAgaWYgKF9hdWRpb0NsaXBzW3BhdGhdKSB7XG4gICAgICAgIHJldHVybiBjYy5hdWRpb0VuZ2luZS5wbGF5KF9hdWRpb0NsaXBzW3BhdGhdLCBmYWxzZSwgMSlcbiAgICB9XG4gICAgY2MucmVzb3VyY2VzLmxvYWQocGF0aCwgY2MuQXVkaW9DbGlwLCBmdW5jdGlvbihlcnIsIGNsaXApIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgX2F1ZGlvQ2xpcHNbcGF0aF0gPSBjbGlwXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgZmFsc2UsIDEpXG4gICAgfSlcbiAgICByZXR1cm4gbnVsbFxufVxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBnYW1laW5nVUk6IGNjLk5vZGUsXG4gICAgICAgIGNhcmRfcHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIHJvYlVJOiBjYy5Ob2RlLFxuICAgICAgICBib3R0b21fY2FyZF9wb3Nfbm9kZTogY2MuTm9kZSxcbiAgICAgICAgcGxheWluZ1VJX25vZGU6IGNjLk5vZGUsXG4gICAgICAgIHRpcHNMYWJlbDogY2MuTGFiZWwsXG4gICAgICAgIGNhcmRzX25vZGU6IGNjLk5vZGUsICAvLyDmiYvniYzoioLngrnlrrnlmahcbiAgICAgICAgLy8g8J+VkOOAkOaWsOWinuOAkeWAkuiuoeaXtkxhYmVs5byV55SoXG4gICAgICAgIGJpZENvdW50ZG93bkxhYmVsOiBjYy5MYWJlbCwgICAgLy8g5oqi5Zyw5Li75YCS6K6h5pe2XG4gICAgICAgIHBsYXlDb3VudGRvd25MYWJlbDogY2MuTGFiZWwsICAgLy8g5Ye654mM5YCS6K6h5pe2XG4gICAgICAgIC8vIPCflIrjgJDmlrDlop7jgJHmu7TnrZTpn7PmlYjvvIgz56eS5YKs5L+D6Z+z5pWI77yJXG4gICAgICAgIHRpY2tBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIm15Z2xvYmFsIOacquWumuS5iVwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHpooTliqDovb3ljaHniYznsr7ngbXlm77pm4ZcbiAgICAgICAgdGhpcy5fcHJlbG9hZENhcmRBdGxhcygpXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeehruS/neaJi+eJjOWuueWZqOiKgueCueWtmOWcqFxuICAgICAgICBpZiAoIXRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgLy8g5p+l5om+5piv5ZCm5bey5a2Y5Zyo5omL54mM5a655Zmo6IqC54K5XG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lTm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGlmIChnYW1lU2NlbmVOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IFwiY2FyZHNfbm9kZVwiIHx8IGNoaWxkLm5hbWUgPT09IFwiY2FyZHNcIiB8fCBjaGlsZC5uYW1lID09PSBcImhhbmRDYXJkc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRzX25vZGUgPSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmib7liLDvvIzliJvlu7rkuIDkuKrmlrDnmoTlrrnlmajoioLngrlcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3Q2FyZHNOb2RlID0gbmV3IGNjLk5vZGUoXCJjYXJkc19ub2RlXCIpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5wYXJlbnQgPSBnYW1lU2NlbmVOb2RlXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRQb3NpdGlvbigwLCAwKVxuICAgICAgICAgICAgICAgICAgICBuZXdDYXJkc05vZGUuc2V0QW5jaG9yUG9pbnQoMC41LCAwLjUpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDgwMCwgMjAwKSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlID0gbmV3Q2FyZHNOb2RlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOOAkOaguOW/g+OAkeWUr+S4gOaVsOaNrua6kCAtIOacjeWKoeerr+WOn+Wni+aJi+eJjOaVsOaNrlxuICAgICAgICAvLyDjgJDph43opoHjgJHnpoHmraLku7vkvZXkv67mlLnjgIHmjpLluo/jgIHovazmjaJcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHRoaXMuaGFuZENhcmRzID0gW10gICAgICAgICAgIC8vIOOAkOWUr+S4gOaVsOaNrua6kOOAkeacjeWKoeerr+WOn+Wni+aJi+eJjFxuICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW10gICAgICAgICAvLyDlupXniYzmlbDmja5cbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW10gICAgLy8g6YCJ5Lit55qE54mMXG4gICAgICAgIFxuICAgICAgICAvLyDmiqLlnLDkuLvnm7jlhbNcbiAgICAgICAgdGhpcy5yb2JfcGxheWVyX2FjY291bnRpZCA9IDBcbiAgICAgICAgdGhpcy5fYmlkZGluZ1BoYXNlID0gXCJpZGxlXCJcbiAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCIgIC8vIPCflKfjgJDmlrDlop7jgJHmuLjmiI/pmLbmrrU6IGlkbGUsIGJpZGRpbmcsIHBsYXlpbmdcbiAgICAgICAgdGhpcy5jYXJkc1JlYWR5ID0gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIC8vIPCflZDjgJDlgJLorqHml7bns7vnu5/jgJFcbiAgICAgICAgdGhpcy5fYmlkVGltZW91dCA9IDBcbiAgICAgICAgdGhpcy5fcGxheVRpbWVvdXQgPSAwXG4gICAgICAgIHRoaXMuX2JpZENvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB0aGlzLl9wbGF5Q291bnRkb3duVGltZXIgPSBudWxsXG4gICAgICAgIHRoaXMuX2JpZFRpbWVMZWZ0ID0gMFxuICAgICAgICB0aGlzLl9wbGF5VGltZUxlZnQgPSAwXG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5fYmlkRXhwaXJlc0F0ID0gMCAgLy8g8J+Up+OAkOaWsOWinuOAkeacjeWKoeerr+i/h+acn+aXtumXtOaIs++8iOavq+enku+8iVxuICAgICAgICBcbiAgICAgICAgLy8g5bqV54mM6IqC54K5XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOOAkOernuaKgOWcuuOAkeeKtuaAgeWPmOmHj1xuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdGhpcy5faXNDb21wZXRpdGlvbiA9IGZhbHNlICAgICAgICAgICAvLyDmmK/lkKbmmK/nq57mioDlnLrmqKHlvI9cbiAgICAgICAgdGhpcy5fcm9vbUNhdGVnb3J5ID0gMSAgICAgICAgICAgICAgICAvLyDmiL/pl7TnsbvlnovvvJoxPeaZrumAmuWcuu+8jDI956ue5oqA5Zy6XG4gICAgICAgIHRoaXMuX21hdGNoQ29pbiA9IDAgICAgICAgICAgICAgICAgICAgLy8g5q+U6LWb6YeR5biBXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uUm91bmQgPSAwICAgICAgICAgICAgLy8g5b2T5YmN6L2u5qyhXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uVG90YWxSb3VuZHMgPSAwICAgICAgLy8g5oC76L2u5qyhXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duID0gMCAgICAgICAgLy8g56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGltZXIgPSBudWxsIC8vIOernuaKgOWcuuWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICB0aGlzLl93YXNEaXNjb25uZWN0ZWQgPSBmYWxzZSAgICAgICAgIC8vIOaYr+WQpuWcqOavlOi1m+S4reaOiee6v1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09IOacjeWKoeWZqOa2iOaBr+ebkeWQrCA9PT09PT09PT09PT1cbiAgICAgICAgXG4gICAgICAgIC8vIOOAkOaguOW/g+OAkeebkeWQrOacjeWKoeWZqOWPkeeJjOa2iOaBryAtIOWUr+S4gOaVsOaNruWFpeWPo1xuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25QdXNoQ2FyZHMoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gPT09PT09PT09PSDmnI3liqHnq6/lj5HniYzmtojmga8gPT09PT09PT09PVwiKVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4OPIOacjeWKoeerr+WOn+Wni+aJi+eJjDpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS5jYXJkcykpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48g5pyN5Yqh56uv5Y6f5aeL5bqV54mMOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhLmJvdHRvbV9jYXJkcykpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHmlrDkuIDova7lj5HniYzml7bvvIzlhbPpl63kuIrkuIDova7nmoTnu5PnrpflvLnnqpdcbiAgICAgICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW29uUHVzaENhcmRzXSDlhbPpl63kuIrkuIDova7nmoTnu5PnrpflvLnnqpdcIilcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9zZUdhbWVSZXN1bHRQb3B1cCh0aGlzLl9nYW1lUmVzdWx0UG9wdXAsIHRoaXMuX2dhbWVSZXN1bHRNYXNrKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5YGc5q2i5omA5pyJ56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wQXJlbmFDb3VudGRvd24oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5riF55CG5qGM6Z2i5LiK55qE54mM77yI5LiK5LiA6L2u5pyA5ZCO5LiA5omL54mM77yJXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW29uUHVzaENhcmRzXSDmuIXnkIbmoYzpnaLkuIrnmoTniYxcIilcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyQWxsT3V0Q2FyZFpvbmVzKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g44CQ5qC45b+D44CR55u05o6l5L+d5a2Y5pyN5Yqh56uv5pWw5o2u77yM5LiN5YGa5Lu75L2V6L2s5o2iXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IGRhdGEuY2FyZHMgfHwgW11cbiAgICAgICAgICAgIHRoaXMuYm90dG9tQ2FyZHMgPSBkYXRhLmJvdHRvbV9jYXJkcyB8fCBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDjgJDmoLjlv4PjgJHllK/kuIDmuLLmn5PlhaXlj6NcbiAgICAgICAgICAgIHRoaXMucmVuZGVyQ2FyZHModGhpcy5oYW5kQ2FyZHMpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzlj6vlnLDkuLvova7mrKHvvIjml6fniYjmtojmga/vvIzku4XnlKjkuo7lhbzlrrnvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQmlkVHVybihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIOS4jeWGjeWkhOeQhu+8jOmBv+WFjemHjeWkjVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5Y+r5Zyw5Li757uT5p6cXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkJpZFJlc3VsdChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflJLjgJDph43opoHjgJHmlLbliLDnu5PmnpzvvIzlgZzmraLlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwiYmlkX3Jlc3VsdF9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcl9pZDogZGF0YS5hY2NvdW50aWQsXG4gICAgICAgICAgICAgICAgICAgIGJpZDogZGF0YS5zdGF0ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvova7mrKHvvIjml6fniYjmtojmga/vvIzku4XnlKjkuo7lhbzlrrnvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FuUm9iU3RhdGUoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvLyDkuI3lho3lpITnkIbvvIzpgb/lhY3ph43lpI1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOWHuueJjOi9ruasoVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25DYW5DaHVDYXJkKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdmFyIHBsYXllcklkID0gZGF0YS5wbGF5ZXJfaWQgfHwgZGF0YVxuICAgICAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcblxuICAgICAgICAgICAgLy8g8J+UkuOAkOmHjeimgeOAkeWFiOWBnOatouS5i+WJjeeahOWAkuiuoeaXtu+8iOacjeWKoeWZqOi9rui9rOS6hu+8iVxuICAgICAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5L+d5a2Y5Ye654mM54q25oCB77yM55So5LqO5o+Q56S65Yqf6IO9XG4gICAgICAgICAgICB0aGlzLl9tdXN0UGxheSA9IGRhdGEubXVzdF9wbGF5IHx8IGZhbHNlXG4gICAgICAgICAgICB0aGlzLl9jYW5CZWF0ID0gZGF0YS5jYW5fYmVhdCB8fCBmYWxzZVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZENhcmRzID0gbnVsbCAgLy8g5LiK5a625Ye655qE54mM77yM6ZyA6KaB5LuOIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOiOt+WPllxuXG4gICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllcklkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyT3V0Wm9uZShteVBsYXllcklkKVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlUaW1lb3V0ID0gZGF0YS50aW1lb3V0IHx8IDE1XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhcnRQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOWFtuS7lueOqeWutuWHuueJjFxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25PdGhlclBsYXllckNodUNhcmQoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvLyDwn5SS44CQ6YeN6KaB44CR5pS25Yiw5Ye654mM5raI5oGv77yM5YGc5q2i5oiR55qE5YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wUGxheUNvdW50ZG93bigpXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkhOeQhuS4jeWHuueahOaDheWGtVxuICAgICAgICAgICAgaWYgKGRhdGEuaXNfcGFzcykge1xuICAgICAgICAgICAgICAgIC8vIPCflIrjgJDmlrDlop7jgJHmkq3mlL7kuI3lh7rpn7PmlYhcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5UGFzc1NvdW5kKGRhdGEpXG4gICAgICAgICAgICAgICAgLy8g8J+UiuOAkOaWsOWinuOAkeaYvuekuuS4jeWHuuaViOaenFxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dQYXNzRWZmZWN0KGRhdGEuYWNjb3VudGlkKVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHkuI3lh7rml7bkuI3muIXpmaTkuIrlrrblh7rnmoTniYxcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOS4iuWutuWHuueahOeJjO+8jOeUqOS6juaPkOekuuWKn+iDvVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZENhcmRzID0gZGF0YS5jYXJkcyB8fCBbXVxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZEhhbmRUeXBlID0gZGF0YS5oYW5kX3R5cGUgfHwgXCJcIlxuXG4gICAgICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhdGhpcy5ub2RlLnBhcmVudCkgcmV0dXJuXG5cbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHojrflj5blvZPliY3njqnlrrZJRO+8jOWIpOaWreaYr+WQpuaYr+iHquW3seWHuueJjFxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeWuieWFqOiOt+WPlueOqeWutklE77yM6YG/5YWN5oql6ZSZXG4gICAgICAgICAgICB2YXIgc29ja2V0SW5mbyA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkgfHwge31cbiAgICAgICAgICAgIHZhciBzZXJ2ZXJQbGF5ZXJJZCA9IChteWdsb2JhbC5wbGF5ZXJEYXRhICYmIG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQpIHx8IFwiXCJcbiAgICAgICAgICAgIHZhciBhY2NvdW50SWQgPSAobXlnbG9iYWwucGxheWVyRGF0YSAmJiBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCkgfHwgXCJcIlxuICAgICAgICAgICAgdmFyIG15UGxheWVySWQgPSBzb2NrZXRJbmZvLmlkIHx8IHNlcnZlclBsYXllcklkIHx8IGFjY291bnRJZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5L2/55So5pu05a6J5YWo55qE5q+U6L6D5pa55byPXG4gICAgICAgICAgICB2YXIgaXNTZWxmID0gU3RyaW5nKGRhdGEuYWNjb3VudGlkIHx8IFwiXCIpID09PSBTdHJpbmcobXlQbGF5ZXJJZCB8fCBcIlwiKVxuXG4gICAgICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR6K+m57uG5omT5Y2wSUTmr5TovoPkv6Hmga9cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOaguOW/g+S/ruWkjeOAkeWmguaenOaYr+iHquW3seWHuueJjO+8jOS7juaJi+eJjOS4reWIoOmZpFxuICAgICAgICAgICAgaWYgKGlzU2VsZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNhcmRzRnJvbUhhbmQoZGF0YS5jYXJkcylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIPCflIrjgJDmlrDlop7jgJHmkq3mlL7lh7rniYzpn7PmlYhcbiAgICAgICAgICAgIHRoaXMuX3BsYXlDYXJkU291bmQoZGF0YSlcblxuICAgICAgICAgICAgLy8g5pi+56S65Ye655qE54mM5Yiw5qGM6Z2iXG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgICAgICBpZiAoIWdhbWVTY2VuZV9zY3JpcHQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+DjyBbb25PdGhlclBsYXllckNodUNhcmRdIGdhbWVTY2VuZV9zY3JpcHQg5Li656m6XCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvdXRDYXJkX25vZGUgPSBnYW1lU2NlbmVfc2NyaXB0LmdldFVzZXJPdXRDYXJkUG9zQnlBY2NvdW50KGRhdGEuYWNjb3VudGlkKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR6L6T5Ye65Ye654mM5Yy65Z+f5p+l5om+57uT5p6cXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW29uT3RoZXJQbGF5ZXJDaHVDYXJkXSBkYXRhLmFjY291bnRpZDpcIiwgZGF0YS5hY2NvdW50aWQsIFwib3V0Q2FyZF9ub2RlOlwiLCBvdXRDYXJkX25vZGUgPyBvdXRDYXJkX25vZGUubmFtZSA6IFwibnVsbFwiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIW91dENhcmRfbm9kZSB8fCAhdGhpcy5jYXJkX3ByZWZhYikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn4OPIFtvbk90aGVyUGxheWVyQ2h1Q2FyZF0gb3V0Q2FyZF9ub2RlIOaIliBjYXJkX3ByZWZhYiDkuLrnqbosIG91dENhcmRfbm9kZTpcIiwgISFvdXRDYXJkX25vZGUsIFwiY2FyZF9wcmVmYWI6XCIsICEhdGhpcy5jYXJkX3ByZWZhYilcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g44CQ6YeN6KaB44CR55u05o6l5L2/55So5pyN5Yqh56uv5pWw5o2u5Yib5bu66IqC54K5XG4gICAgICAgICAgICB2YXIgbm9kZV9jYXJkcyA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuY2FyZF9wcmVmYWIpXG4gICAgICAgICAgICAgICAgaWYgKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRTY3JpcHQgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRTY3JpcHQuc2hvd0NhcmRzKGRhdGEuY2FyZHNbaV0sIG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGVfY2FyZHMucHVzaChjYXJkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2hvd091dENhcmRzKG91dENhcmRfbm9kZSwgbm9kZV9jYXJkcylcblxuICAgICAgICAgICAgLy8g5pu05paw5Ymp5L2Z54mM5pWwXG4gICAgICAgICAgICBpZiAoZGF0YS5jYXJkc19sZWZ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJ1cGRhdGVfY2FyZF9jb3VudF9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRpZDogZGF0YS5hY2NvdW50aWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiBkYXRhLmNhcmRzX2xlZnRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5oqi5Zyw5Li76Zi25q615byA5aeLXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNhbGxMYW5kbG9yZFN0YXJ0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fYmlkZGluZ1BoYXNlID0gXCJiaWRkaW5nXCJcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwiYmlkZGluZ1wiICAvLyDwn5Sn44CQ5paw5aKe44CR6K6+572u5ri45oiP6Zi25q61XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvova7mrKFcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FsbExhbmRsb3JkVHVybihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NDYWxsTGFuZGxvcmRUdXJuKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDnm5HlkKzmiqLlnLDkuLvnu5PmnpxcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2FsbExhbmRsb3JkUmVzdWx0KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy8g8J+UkuOAkOmHjeimgeOAkeaUtuWIsOe7k+aenO+8jOWBnOatouWAkuiuoeaXtlxuICAgICAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmkq3mlL7miqLlnLDkuLvor63pn7NcbiAgICAgICAgICAgIHRoaXMuX3BsYXlSb2JTb3VuZChkYXRhKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJjYWxsX2xhbmRsb3JkX3Jlc3VsdF9ldmVudFwiLCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs5oqi5Zyw5Li76Zi25q6157uT5p2fXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNhbGxMYW5kbG9yZEVuZChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflJLjgJDph43opoHjgJHlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHph43nva7miqLlnLDkuLvnm7jlhbPnirbmgIFcbiAgICAgICAgICAgIHRoaXMucm9iX3BsYXllcl9hY2NvdW50aWQgPSAwXG4gICAgICAgICAgICB0aGlzLmNhcmRzUmVhZHkgPSBmYWxzZSAgLy8g6YeN572u5Y+R54mM5a6M5oiQ5qCH6K6wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHkv53lrZjlupXniYzmlbDmja5cbiAgICAgICAgICAgIGlmIChkYXRhLmJvdHRvbV9jYXJkcyAmJiBkYXRhLmJvdHRvbV9jYXJkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib3R0b21DYXJkcyA9IGRhdGEuYm90dG9tX2NhcmRzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDph43opoHjgJHmmL7npLrlupXniYzvvIjmiYDmnInnjqnlrrbpg73og73nnIvliLDvvIlcbiAgICAgICAgICAgIHRoaXMuX3Nob3dCb3R0b21DYXJkc1RvQWxsKGRhdGEuYm90dG9tX2NhcmRzKVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeebkeWQrOWcsOS4u+aWsOaJi+eJjOa2iOaBryAtIOWPquabtOaWsOWcsOS4u+eahOaJi+eJjO+8jOS4jeinpuWPkemHjeaWsOWPkeeJjFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5b+F6aG76aqM6K+B6Ieq5bex5piv5ZCm5piv5Zyw5Li777yM5Y+q5pyJ5Zyw5Li75omN5pu05paw5omL54mMXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkxhbmRsb3JkQ2FyZHMoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7pqozor4HjgJHmo4Dmn6Xoh6rlt7HmmK/lkKbmmK/lnLDkuLtcbiAgICAgICAgICAgIHZhciBteVBsYXllcklkID0gbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKS5pZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEXG4gICAgICAgICAgICB2YXIgbGFuZGxvcmRJZCA9IGRhdGEubGFuZGxvcmRfaWQgfHwgXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHlj6rmnInlvZPlnLDkuLtJROWMuemFjeiHquW3seaXtuaJjeabtOaWsOaJi+eJjFxuICAgICAgICAgICAgaWYgKFN0cmluZyhsYW5kbG9yZElkKSAhPT0gU3RyaW5nKG15UGxheWVySWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g44CQ6YeN6KaB44CR5Y+q5pu05paw5omL54mM5pWw5o2u77yM5LiN6YeN5paw5riy5p+T5pW05Liq5Zy65pmvXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IGRhdGEuY2FyZHMgfHwgW11cbiAgICAgICAgICAgIHRoaXMuYm90dG9tQ2FyZHMgPSBkYXRhLmJvdHRvbV9jYXJkcyB8fCBbXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDjgJDph43opoHjgJHkvb/nlKjpnZnpu5jmm7TmlrDvvIzkuI3op6blj5Hlj5HniYzliqjnlLtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUxhbmRsb3JkSGFuZENhcmRzKHRoaXMuaGFuZENhcmRzKVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g55uR5ZCs6YeN5paw5Y+R54mM6YCa55+l77yI5omA5pyJ5Lq66YO95LiN5Y+r5Zyw5Li777yJXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblJlc3RhcnRHYW1lKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy8g5YGc5q2i5omA5pyJ5YCS6K6h5pe2XG4gICAgICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIC8vIOmakOiXj+aKouWcsOS4u1VJXG4gICAgICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICAgICAgLy8g6YeN572u54q25oCBXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImlkbGVcIlxuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCIgIC8vIPCflKfjgJDmlrDlop7jgJHph43nva7muLjmiI/pmLbmrrVcbiAgICAgICAgICAgIHRoaXMuY2FyZHNSZWFkeSA9IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmhhbmRDYXJkcyA9IFtdXG4gICAgICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW11cbiAgICAgICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG4gICAgICAgICAgICAvLyDmuIXnkIbmiYDmnInljaHniYzoioLngrlcbiAgICAgICAgICAgIHRoaXMuY2xlYXJBbGxDYXJkcygpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5Ye654mM6Zi25q615byA5aeLXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXlTdGFydChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHorr7nva7muLjmiI/pmLbmrrXkuLrlh7rniYzpmLbmrrVcbiAgICAgICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwicGxheWluZ1wiXG4gICAgICAgICAgICB0aGlzLl9iaWRkaW5nUGhhc2UgPSBcImlkbGVcIlxuICAgICAgICAgICAgLy8g6ZqQ6JeP5oqi5Zyw5Li7VUnvvIjnoa7kv53kuI3mmL7npLrvvIlcbiAgICAgICAgICAgIHRoaXMuX2hpZGVSb2JVSSgpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5SK44CQ5paw5aKe44CR55uR5ZCs5ri45oiP57uT5p2fXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkdhbWVPdmVyKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkemHjee9rua4uOaIj+mYtuautVxuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJpZGxlXCJcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmuLjmiI/nu5PmnZ/ml7bnq4vljbPph43nva7miYDmnInnjqnlrrbnmoTlh4blpIfnirbmgIFcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0QWxsUGxheWVyUmVhZHlTdGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmmL7npLrnu5PnrpflvLnnqpdcbiAgICAgICAgICAgIHRoaXMuX3Nob3dHYW1lUmVzdWx0UG9wdXAoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOa4uOaIj+eKtuaAgeaBouWkjVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25HYW1lU3RhdGVSZXN0b3JlKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlR2FtZVN0YXRlKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5o+Q56S657uT5p6cXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkhpbnRSZXN1bHQoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkhpbnRSZXN1bHQoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIPCflKfjgJDmiZjnrqHjgJHnm5HlkKzmiZjnrqHnirbmgIHlj5jljJZcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uVHJ1c3RlZVN0YXRlTm90aWZ5KGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fb25UcnVzdGVlU3RhdGVOb3RpZnkoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55So5oi35rS75Yqo55uR5ZCsIC0g5Y+W5raI5py65Zmo5Lq65omY566hXG4gICAgICAgIC8vIOaguOW/g+mAu+i+ke+8muWPquimgeeUqOaIt+aciem8oOagh+enu+WKqOaIlueCueWHu+S6i+S7tu+8jOWwseWPkemAgeWPlua2iOaJmOeuoeivt+axglxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdGhpcy5faXNMb2NhbFRydXN0ZWUgPSBmYWxzZSAgLy8g5pys5Zyw5omY566h54q25oCBXG4gICAgICAgIHRoaXMuX2xhc3RBY3Rpdml0eVRpbWUgPSAwICAgIC8vIOS4iuasoea0u+WKqOaXtumXtO+8iOeUqOS6jumYsuaKlu+8iVxuICAgICAgICB0aGlzLl9hY3Rpdml0eVRocm90dGxlTXMgPSA1MDAgLy8g6Ziy5oqW6Ze06ZqU77yI5q+r56eS77yJXG4gICAgICAgIFxuICAgICAgICAvLyDms6jlhozlhajlsYDnlKjmiLfmtLvliqjnm5HlkKxcbiAgICAgICAgdGhpcy5fc2V0dXBVc2VyQWN0aXZpdHlMaXN0ZW5lcigpXG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOOAkOernuaKgOWcuuOAkea2iOaBr+ebkeWQrFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOernuaKgOWcuueKtuaAgeabtOaWsFxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Db21wZXRpdGlvblN0YXR1cyhmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX29uQ29tcGV0aXRpb25TdGF0dXMoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNvbXBldGl0aW9uQ291bnRkb3duKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fb25Db21wZXRpdGlvbkNvdW50ZG93bihkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzmr5TotZvph5HluIHmm7TmlrBcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uTWF0Y2hDb2luVXBkYXRlKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgdGhpcy5fb25NYXRjaENvaW5VcGRhdGUoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5reY5rGw6YCa55+lXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkNvbXBldGl0aW9uRWxpbWluYXRlZChmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX29uQ29tcGV0aXRpb25FbGltaW5hdGVkKGRhdGEpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOaZi+e6p+mAmuefpVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Db21wZXRpdGlvbkFkdmFuY2UoZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICB0aGlzLl9vbkNvbXBldGl0aW9uQWR2YW5jZShkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzlhqDlhpvlvLnnqpdcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ29tcGV0aXRpb25DaGFtcGlvbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIHRoaXMuX29uQ29tcGV0aXRpb25DaGFtcGlvbihkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR55uR5ZCs5pyA57uI5qac5Y2V5raI5oGvXG4gICAgICAgIC8vIOW9k+ernuaKgOWcuuaJgOaciei9ruasoee7k+adn+aXtu+8jOacjeWKoeerr+S8muWPkemAgeatpOa2iOaBr1xuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Ub3VybmFtZW50RmluYWxSYW5rKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtnYW1laW5nVUldIOaUtuWIsOacgOe7iOamnOWNlTpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgICAgICB0aGlzLl9vblRvdXJuYW1lbnRGaW5hbFJhbmsoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOWGhemDqOS6i+S7tu+8muaYvuekuuW6leeJjFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5q2k5LqL5Lu25bey5bqf5byD77yM6YC76L6R5bey56e75YiwIG9uQ2FsbExhbmRsb3JkRW5kIOWSjCBvbkxhbmRsb3JkQ2FyZHNcbiAgICAgICAgLy8g5L+d55WZ5q2k55uR5ZCs5Zmo5LuF55So5LqO5YW85a655pen54mI5pys77yM5LiN5YaN6Kem5Y+RIHB1c2hUaHJlZUNhcmRcbiAgICAgICAgdGhpcy5ub2RlLm9uKFwic2hvd19ib3R0b21fY2FyZF9ldmVudFwiLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJFkYXRhIOWPr+iDveaYryB7IGNhcmRzOiBbLi4uXSB9IOWvueixoeaIluaVsOe7hFxuICAgICAgICAgICAgdmFyIGNhcmRzID0gZGF0YVxuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5jYXJkcykge1xuICAgICAgICAgICAgICAgIGNhcmRzID0gZGF0YS5jYXJkc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlpoLmnpwgY2FyZHMg5Li656m677yM5LiN5aSE55CGXG4gICAgICAgICAgICBpZiAoIWNhcmRzIHx8IGNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHkuI3lho3osIPnlKggcHVzaFRocmVlQ2FyZO+8gVxuICAgICAgICAgICAgLy8g5bqV54mM5pi+56S65bey55SxIF9zaG93Qm90dG9tQ2FyZHNUb0FsbCDlpITnkIZcbiAgICAgICAgICAgIC8vIOWcsOS4u+aJi+eJjOabtOaWsOW3sueUsSBvbkxhbmRsb3JkQ2FyZHMg5aSE55CGXG4gICAgICAgICAgICAvLyDliKDpmaTku6XkuIvku6PnoIHvvIzpgb/lhY3ph43lpI3lpITnkIblkozlu7bov5/vvJpcbiAgICAgICAgICAgIC8vIHRoaXMuc2NoZWR1bGVPbmNlKHRoaXMucHVzaFRocmVlQ2FyZCwgMC4yKVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeazqOWGjOebkeWQrOmAieaLqeeJjOa2iOaBr1xuICAgICAgICAvLyBjYXJkLmpzIOaYr+WcqCBnYW1lU2NlbmVfbm9kZSAodGhpcy5ub2RlLnBhcmVudCkg5LiKIGVtaXQg5LqL5Lu2XG4gICAgICAgIC8vIOaJgOS7peW/hemhu+WcqCB0aGlzLm5vZGUucGFyZW50IOS4iuebkeWQrO+8jOiAjOS4jeaYryB0aGlzLm5vZGVcbiAgICAgICAgdmFyIGdhbWVTY2VuZV9ub2RlID0gdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoZ2FtZVNjZW5lX25vZGUpIHtcbiAgICAgICAgICAgIGdhbWVTY2VuZV9ub2RlLm9uKFwiY2hvb3NlX2NhcmRfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5wdXNoKGV2ZW50KVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmm7TmlrDlt7LpgInniYzmlbDmmL7npLpcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZENvdW50RGlzcGxheSgpXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgICAgIGdhbWVTY2VuZV9ub2RlLm9uKFwidW5jaG9vc2VfY2FyZF9ldmVudFwiLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeato+ehruWMuemFjeWNoeeJjOeahOWUr+S4gOagh+ivhuespu+8iHN1aXQgKyByYW5r77yJXG4gICAgICAgICAgICAgICAgLy8gZXZlbnQg546w5Zyo5pivIHtzdWl0LCByYW5rfSDlr7nosaFcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZGlkID0gdGhpcy5jaG9vc2VfY2FyZF9kYXRhW2ldLmNhcmRpZFxuICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbljLnphY3vvIjlhbzlrrnmlrDml6fkuKTnp43moLzlvI/vvIlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmRpZCAmJiBjYXJkaWQuc3VpdCAhPT0gdW5kZWZpbmVkICYmIGNhcmRpZC5yYW5rICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaWsOagvOW8j++8mmNhcmRpZCDmmK/lr7nosaEge3N1aXQsIHJhbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZGlkLnN1aXQgPT09IGV2ZW50LnN1aXQgJiYgY2FyZGlkLnJhbmsgPT09IGV2ZW50LnJhbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEuc3BsaWNlKGksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYXJkaWQgPT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaXp+agvOW8j+WFvOWuue+8mmNhcmRpZCDmmK/mlbDlrZdcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5zcGxpY2UoaSwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeabtOaWsOW3sumAieeJjOaVsOaYvuekulxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkQ291bnREaXNwbGF5KClcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydCAoKSB7fSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6aKE5Yqg6L295Y2h54mM57K+54G15Zu+6ZuGXG4gICAgICog56Gu5L+d5Zyo5Y+R54mM5LmL5YmN5Zu+6ZuG5bey57uP5YeG5aSH5aW9XG4gICAgICovXG4gICAgX3ByZWxvYWRDYXJkQXRsYXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmo4Dmn6XmmK/lkKblt7Lnu4/liqDovb1cbiAgICAgICAgaWYgKHdpbmRvdy5fY2FyZEF0bGFzTG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9jYXJkL2NhcmRcIiwgY2MuU3ByaXRlQXRsYXMsIGZ1bmN0aW9uKGVyciwgYXRsYXMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+DjyBbX3ByZWxvYWRDYXJkQXRsYXNdIOWKoOi9veWNoeeJjOWbvumbhuWksei0pTpcIiwgZXJyKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93Ll9jYXJkQXRsYXNMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB3aW5kb3cuX2NhcmRBdGxhcyA9IGF0bGFzXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW19wcmVsb2FkQ2FyZEF0bGFzXSDljaHniYzlm77pm4bpooTliqDovb3miJDlip9cIilcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIFxuICAgIG9uRGVzdHJveSAoKSB7XG4gICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG4gICAgICAgIFxuICAgICAgICAvLyDjgJDnq57mioDlnLrjgJHmuIXnkIbnq57mioDlnLrlgJLorqHml7ZcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9jb21wZXRpdGlvbkNvdW50ZG93blRpY2spXG4gICAgICAgICAgICB0aGlzLl9jb21wZXRpdGlvbkNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5riF55CG5pys5Zyw56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICAgIGlmICh0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGljaylcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lciA9IG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ56ue5oqA5Zy644CR5riF55CG5q+U6LWb6YeR5biB5pi+56S6XG4gICAgICAgIHRoaXMuX2hpZGVNYXRjaENvaW5EaXNwbGF5KClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g44CQ5qC45b+D44CR5ZSv5LiA5riy5p+T5YWl5Y+jXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog44CQ5qC45b+D44CR5riy5p+T5omL54mMIC0g5ZSv5LiA5YWl5Y+jXG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDmnI3liqHnq6/ljp/lp4vmiYvniYzmlbDmja5cbiAgICAgKi9cbiAgICByZW5kZXJDYXJkczogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkemmluWFiOajgOafpeiKgueCueaYr+WQpuacieaViFxuICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhdGhpcy5ub2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW3JlbmRlckNhcmRzXSDoioLngrnlt7LplIDmr4HmiJbml6DmlYjvvIzot7Pov4fmuLLmn5NcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNhcmRzIHx8IGNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbcmVuZGVyQ2FyZHNdIOayoeacieeJjOWPr+a4suafk1wiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHnoa7kv50gY2FyZHNfbm9kZSDlrZjlnKhcbiAgICAgICAgaWYgKCF0aGlzLmNhcmRzX25vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW3JlbmRlckNhcmRzXSBjYXJkc19ub2RlIOacquWumuS5ie+8jOWwneivlemHjeaWsOafpeaJvuaIluWIm+W7ulwiKVxuICAgICAgICAgICAgdmFyIGdhbWVTY2VuZU5vZGUgPSB0aGlzLm5vZGUucGFyZW50XG4gICAgICAgICAgICBpZiAoZ2FtZVNjZW5lTm9kZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZVNjZW5lTm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuW2ldXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5uYW1lID09PSBcImNhcmRzX25vZGVcIiB8fCBjaGlsZC5uYW1lID09PSBcImNhcmRzXCIgfHwgY2hpbGQubmFtZSA9PT0gXCJoYW5kQ2FyZHNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlID0gY2hpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbcmVuZGVyQ2FyZHNdIOaJvuWIsCBjYXJkc19ub2RlOlwiLCBjaGlsZC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3Q2FyZHNOb2RlID0gbmV3IGNjLk5vZGUoXCJjYXJkc19ub2RlXCIpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5wYXJlbnQgPSBnYW1lU2NlbmVOb2RlXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRQb3NpdGlvbigwLCAwKVxuICAgICAgICAgICAgICAgICAgICBuZXdDYXJkc05vZGUuc2V0QW5jaG9yUG9pbnQoMC41LCAwLjUpXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRzTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDgwMCwgMjAwKSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlID0gbmV3Q2FyZHNOb2RlXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbcmVuZGVyQ2FyZHNdIOWIm+W7uuaWsOeahCBjYXJkc19ub2RlXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlpoLmnpzku43nhLbmsqHmnInvvIzov5Tlm55cbiAgICAgICAgICAgIGlmICghdGhpcy5jYXJkc19ub2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW3JlbmRlckNhcmRzXSDml6Dms5XliJvlu7ogY2FyZHNfbm9kZe+8jOaUvuW8g+a4suafk1wiKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sl44CQ6Ziy6YeN5aSN5riy5p+T44CR5qOA5p+l5piv5ZCm5LiO5LiK5qyh55u45ZCMXG4gICAgICAgIHZhciBoYXNoID0gSlNPTi5zdHJpbmdpZnkoY2FyZHMpXG4gICAgICAgIGlmICh0aGlzLl9sYXN0UmVuZGVySGFzaCA9PT0gaGFzaCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFtyZW5kZXJDYXJkc10g54mM5LiO5LiK5qyh55u45ZCM77yM6Lez6L+H5riy5p+TXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IGhhc2hcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbcmVuZGVyQ2FyZHNdIOW8gOWni+a4suafkyBcIiArIGNhcmRzLmxlbmd0aCArIFwiIOW8oOeJjFwiKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5qC45b+D44CR5L2/55So5paX5Zyw5Li76KeE5YiZ5o6S5bqP77ya5aSn546LID4g5bCP546LID4gMiA+IEEgPiBLID4gUSA+IEogPiAxMCA+IDkgPiA4ID4gNyA+IDYgPiA1ID4gNCA+IDNcbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gdGhpcy5fc29ydENhcmRzKGNhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5qC45b+D44CR5riF55CG5omA5pyJ5pen6IqC54K577yI6Kej5Yaz6IOM6Z2i54mM5q6L55WZ77yJXG4gICAgICAgIHRoaXMuY2xlYXJBbGxDYXJkcygpXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rlupXniYzoioLngrlcbiAgICAgICAgdGhpcy5fY3JlYXRlQm90dG9tQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g6ZqQ6JeP5Ye654mMVUlcbiAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWluZ1VJX25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+OrOOAkOS/ruWkjeOAkeS9v+eUqOmAkOW8oOWPkeeJjOWKqOeUu1xuICAgICAgICB0aGlzLl9kZWFsQ2FyZHNXaXRoQW5pbWF0aW9uKHNvcnRlZENhcmRzKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+OrOOAkOaWsOWinuOAkemAkOW8oOWPkeeJjOWKqOeUu1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNvcnRlZENhcmRzIC0g5bey5o6S5bqP55qE5omL54mM5pWw5o2uXG4gICAgICovXG4gICAgX2RlYWxDYXJkc1dpdGhBbmltYXRpb246IGZ1bmN0aW9uKHNvcnRlZENhcmRzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgdmFyIGNhcmRJbnRlcnZhbCA9IERlYWxDb25maWcuY2FyZEludGVydmFsIC8gMTAwMCAgLy8g6L2s5o2i5Li656eSXG4gICAgICAgIHZhciBhbmltRHVyYXRpb24gPSBEZWFsQ29uZmlnLmFuaW1EdXJhdGlvblxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeehruS/neaJi+eJjOWuueWZqOWtmOWcqFxuICAgICAgICB2YXIgY2FyZFBhcmVudCA9IHRoaXMuY2FyZHNfbm9kZVxuICAgICAgICBpZiAoIWNhcmRQYXJlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn46uIFtfZGVhbENhcmRzV2l0aEFuaW1hdGlvbl0gY2FyZHNfbm9kZSDmnKrlrprkuYlcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlj5HniYzotbflp4vkvY3nva7vvIjlsY/luZXkuK3lpK7kuIrmlrnvvIzmqKHmi5/lj5HniYzloIbvvIlcbiAgICAgICAgdmFyIGRlY2tQb3MgPSBjYy52MihEZWFsQ29uZmlnLmRlY2tQb3NpdGlvbi54LCBEZWFsQ29uZmlnLmRlY2tQb3NpdGlvbi55KVxuICAgICAgICBcbiAgICAgICAgLy8g6YCQ5byg5Y+R54mMXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGVkQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBzb3J0ZWRDYXJkc1tpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldFggPSBzZWxmLl9nZXRDYXJkWChpbmRleCwgc29ydGVkQ2FyZHMubGVuZ3RoLCBDYXJkTGF5b3V0LmNhcmRTcGFjaW5nKVxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UG9zID0gY2MudjIodGFyZ2V0WCwgQ2FyZExheW91dC5jYXJkWSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOWIm+W7uuWNoeeJjOiKgueCuVxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGNjLmluc3RhbnRpYXRlKHNlbGYuY2FyZF9wcmVmYWIpXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2FyZCkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYXJkLnNjYWxlID0gQ2FyZExheW91dC5jYXJkU2NhbGVcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5wYXJlbnQgPSBjYXJkUGFyZW50ICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55So56Gu5a6a55qE5omL54mM5a655ZmoXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDwn46sIOS7juWPkeeJjOWghuS9jee9ruW8gOWni1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnNldFBvc2l0aW9uKGRlY2tQb3MpXG4gICAgICAgICAgICAgICAgICAgIGNhcmQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBjYXJkLnpJbmRleCA9IGluZGV4XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDorr7nva7ljaHniYzmmL7npLpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRDb21wID0gY2FyZC5nZXRDb21wb25lbnQoXCJjYXJkXCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXJkQ29tcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZENvbXAuc2hvd0NhcmRzKGNhcmREYXRhLCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+OrCDmkq3mlL7lj5HniYzliqjnlLtcbiAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oY2FyZClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50byhhbmltRHVyYXRpb24sIHsgcG9zaXRpb246IHRhcmdldFBvcyB9LCB7IGVhc2luZzogJ3NpbmVPdXQnIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDliqjnlLvlrozmiJDlm57osINcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+UiiDmkq3mlL7lj5HniYzpn7PmlYhcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzb3Blbl9zb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGxheVNvdW5kKFwic291bmQvZmFwYWkxXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgaW5kZXggKiBjYXJkSW50ZXJ2YWwpXG4gICAgICAgICAgICB9KShpKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlj5HniYzlrozmiJDlkI7lm57osINcbiAgICAgICAgdmFyIHRvdGFsRGVhbFRpbWUgPSBzb3J0ZWRDYXJkcy5sZW5ndGggKiBjYXJkSW50ZXJ2YWwgKyBhbmltRHVyYXRpb25cbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9vbkRlYWxDYXJkc0NvbXBsZXRlKHNvcnRlZENhcmRzKVxuICAgICAgICB9LCB0b3RhbERlYWxUaW1lKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+OrOOAkOaWsOWinuOAkeWPkeeJjOWujOaIkOWbnuiwg1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNvcnRlZENhcmRzIC0g5bey5o6S5bqP55qE5omL54mM5pWw5o2uXG4gICAgICovXG4gICAgX29uRGVhbENhcmRzQ29tcGxldGU6IGZ1bmN0aW9uKHNvcnRlZENhcmRzKSB7XG4gICAgICAgIC8vIOagh+iusOWwsee7qlxuICAgICAgICB0aGlzLmNhcmRzUmVhZHkgPSB0cnVlXG4gICAgICAgIHRoaXMuZmFwYWlfZW5kID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgLy8g6YCa55+l5YW25LuW546p5a626IqC54K5XG4gICAgICAgIGlmICh0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmVtaXQoXCJwdXNoY2FyZF9vdGhlcl9ldmVudFwiKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbpnIDopoHmmL7npLrmiqLlnLDkuLvmjInpkq5cbiAgICAgICAgdGhpcy5fY2hlY2tBbmRTaG93Um9iVUkoKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog44CQ5qC45b+D44CR6K6h566X54mM5Yqb5YC877yI5paX5Zyw5Li76KeE5YiZ77yJXG4gICAgICog5aSn546LPTE1LCDlsI/njos9MTQsIDI9MTMsIEE9MTIsIEs9MTEsIFE9MTAsIEo9OSwgMTA9OCwgLi4uLCAzPTFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FyZCAtIOWNoeeJjOaVsOaNrlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IOeJjOWKm+WAvFxuICAgICAqL1xuICAgIGdldENhcmRWYWx1ZTogZnVuY3Rpb24oY2FyZCkge1xuICAgICAgICB2YXIgcmFuayA9IGNhcmQucmFua1xuICAgICAgICBcbiAgICAgICAgaWYgKHJhbmsgPT09IDMpIHJldHVybiAxICAgLy8gM1xuICAgICAgICBpZiAocmFuayA9PT0gNCkgcmV0dXJuIDIgICAvLyA0XG4gICAgICAgIGlmIChyYW5rID09PSA1KSByZXR1cm4gMyAgIC8vIDVcbiAgICAgICAgaWYgKHJhbmsgPT09IDYpIHJldHVybiA0ICAgLy8gNlxuICAgICAgICBpZiAocmFuayA9PT0gNykgcmV0dXJuIDUgICAvLyA3XG4gICAgICAgIGlmIChyYW5rID09PSA4KSByZXR1cm4gNiAgIC8vIDhcbiAgICAgICAgaWYgKHJhbmsgPT09IDkpIHJldHVybiA3ICAgLy8gOVxuICAgICAgICBpZiAocmFuayA9PT0gMTApIHJldHVybiA4ICAvLyAxMFxuICAgICAgICBpZiAocmFuayA9PT0gMTEpIHJldHVybiA5ICAvLyBKXG4gICAgICAgIGlmIChyYW5rID09PSAxMikgcmV0dXJuIDEwIC8vIFFcbiAgICAgICAgaWYgKHJhbmsgPT09IDEzKSByZXR1cm4gMTEgLy8gS1xuICAgICAgICBpZiAocmFuayA9PT0gMTQpIHJldHVybiAxMiAvLyBBXG4gICAgICAgIGlmIChyYW5rID09PSAxNSkgcmV0dXJuIDEzIC8vIDJcbiAgICAgICAgaWYgKHJhbmsgPT09IDE2KSByZXR1cm4gMTQgLy8g5bCP546LXG4gICAgICAgIGlmIChyYW5rID09PSAxNykgcmV0dXJuIDE1IC8vIOWkp+eOi1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDBcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOOAkOaguOW/g+OAkeS9v+eUqCBnZXRDYXJkVmFsdWUg5o6S5bqP5omL54mMXG4gICAgICog5paX5Zyw5Li75qCH5YeG5o6S5bqP77ya5aSn546LID4g5bCP546LID4gMiA+IEEgPiBLID4gUSA+IEogPiAxMCA+IDkgPiA4ID4gNyA+IDYgPiA1ID4gNCA+IDNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOacjeWKoeerr+WOn+Wni+aJi+eJjOaVsOaNrlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0g5o6S5bqP5ZCO55qE5omL54mM5pWw5o2uXG4gICAgICovXG4gICAgX3NvcnRDYXJkczogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIC8vIOWkjeWItuaVsOe7hO+8jOmBv+WFjeS/ruaUueWOn+aVsOaNrlxuICAgICAgICB2YXIgc29ydGVkQ2FyZHMgPSBjYXJkcy5zbGljZSgpXG4gICAgICAgIFxuICAgICAgICAvLyDkvb/nlKggZ2V0Q2FyZFZhbHVlIOS7juWkp+WIsOWwj+aOkuW6j1xuICAgICAgICBzb3J0ZWRDYXJkcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZUEgPSBzZWxmLmdldENhcmRWYWx1ZShhKVxuICAgICAgICAgICAgdmFyIHZhbHVlQiA9IHNlbGYuZ2V0Q2FyZFZhbHVlKGIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWFiOaMiSB2YWx1ZSDku47lpKfliLDlsI/mjpLluo9cbiAgICAgICAgICAgIGlmICh2YWx1ZUEgIT09IHZhbHVlQikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZUIgLSB2YWx1ZUFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZhbHVlIOebuOWQjOaXtu+8jOaMieiKseiJsuaOkuW6j++8iOm7keahgyA+IOe6ouW/gyA+IOaiheiKsSA+IOaWueWdl++8iVxuICAgICAgICAgICAgcmV0dXJuIGEuc3VpdCAtIGIuc3VpdFxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHNvcnRlZENhcmRzXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDjgJDmoLjlv4PjgJHmuIXnkIbmiYDmnInml6foioLngrnvvIjop6PlhrPog4zpnaLniYzmrovnlZnvvIlcbiAgICAgKiDwn5Sl44CQ5L+u5aSN44CR5ZCM5pe25riF55CGIGNhcmRzX25vZGUg5ZKMIG5vZGUucGFyZW5077yM56Gu5L+d5peg5q6L55WZXG4gICAgICovXG4gICAgY2xlYXJBbGxDYXJkczogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHpppblhYjmo4Dmn6XoioLngrnmmK/lkKbmnInmlYhcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUgfHwgIXRoaXMubm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn46uIFtjbGVhckFsbENhcmRzXSDoioLngrnlt7LplIDmr4HmiJbml6DmlYjvvIzot7Pov4dcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q5riF55CG5omL54mM5a655Zmo5Lit55qE6IqC54K577yM5LiN6YGN5Y6Gbm9kZS5wYXJlbnRcbiAgICAgICAgaWYgKHRoaXMuY2FyZHNfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jYXJkc19ub2RlLnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW2NsZWFyQWxsQ2FyZHNdIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4heepuumAieS4reeahOeJjOaVsOaNrlxuICAgICAgICB0aGlzLmNob29zZV9jYXJkX2RhdGEgPSBbXVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog6K6h566X54mM55qEWOWdkOagh1xuICAgICAqL1xuICAgIF9nZXRDYXJkWDogZnVuY3Rpb24oaW5kZXgsIGNvdW50LCBzcGFjaW5nKSB7XG4gICAgICAgIHZhciB0b3RhbFdpZHRoID0gKGNvdW50IC0gMSkgKiBzcGFjaW5nXG4gICAgICAgIHZhciBzdGFydFggPSAtdG90YWxXaWR0aCAvIDJcbiAgICAgICAgcmV0dXJuIHN0YXJ0WCArIGluZGV4ICogc3BhY2luZ1xuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlupXniYznm7jlhbNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDliJvlu7rlupXniYzmmL7npLrvvIjniYzog4zvvIlcbiAgICAgKi9cbiAgICBfY3JlYXRlQm90dG9tQ2FyZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIbml6flupXniYxcbiAgICAgICAgaWYgKHRoaXMuYm90dG9tX2NhcmQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ib3R0b21fY2FyZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbV9jYXJkW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tX2NhcmRbaV0uZGVzdHJveSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLmJvdHRvbV9jYXJkX3Bvc19ub2RlIHx8ICF0aGlzLmNhcmRfcHJlZmFiKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBib3R0b21ZID0gdGhpcy5ib3R0b21fY2FyZF9wb3Nfbm9kZS55XG4gICAgICAgIHZhciBib3R0b21TdGFydFggPSB0aGlzLmJvdHRvbV9jYXJkX3Bvc19ub2RlLnggLSBDYXJkTGF5b3V0LmJvdHRvbUNhcmRTcGFjaW5nXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRpX2NhcmQgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmNhcmRfcHJlZmFiKVxuICAgICAgICAgICAgaWYgKCFkaV9jYXJkKSBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkaV9jYXJkLnNjYWxlID0gQ2FyZExheW91dC5ib3R0b21DYXJkU2NhbGVcbiAgICAgICAgICAgIGRpX2NhcmQuc2V0UG9zaXRpb24oYm90dG9tU3RhcnRYICsgQ2FyZExheW91dC5ib3R0b21DYXJkU3BhY2luZyAqIGksIGJvdHRvbVkpXG4gICAgICAgICAgICBkaV9jYXJkLnBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGRpX2NhcmQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgdGhpcy5ib3R0b21fY2FyZC5wdXNoKGRpX2NhcmQpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Y+r5Zyw5Li7L+aKouWcsOS4u+ebuOWFs1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2NoZWNrQW5kU2hvd1JvYlVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeWmguaenOWcqOWHuueJjOmYtuaute+8jOS4jeaYvuekuuaKouWcsOS4u+aMiemSrlxuICAgICAgICB2YXIgUm9vbVN0YXRlID0gd2luZG93LlJvb21TdGF0ZSB8fCB7fVxuICAgICAgICBpZiAodGhpcy5fYmlkZGluZ1BoYXNlID09PSBcImlkbGVcIiAmJiB0aGlzLl9nYW1lUGhhc2UgPT09IFwicGxheWluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgaWYgKHRoaXMucm9iX3BsYXllcl9hY2NvdW50aWQgPT0gbXlQbGF5ZXJJZCAmJiB0aGlzLmNhcmRzUmVhZHkgJiYgdGhpcy5yb2JVSSAmJiAhdGhpcy5yb2JVSS5hY3RpdmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9iaWRkaW5nUGhhc2UgPT09IFwiYmlkZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0JpZFVJKFwi5Y+r5Zyw5Li7XCIsIFwi5LiN5Y+rXCIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dCaWRVSShcIuaKouWcsOS4u1wiLCBcIuS4jeaKolwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9wcm9jZXNzQ2FsbExhbmRsb3JkVHVybjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIHBsYXllcklkID0gZGF0YS5wbGF5ZXJfaWRcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBkYXRhLnRpbWVvdXQgfHwgMTVcbiAgICAgICAgdmFyIHJvdW5kID0gZGF0YS5yb3VuZCB8fCAxXG4gICAgICAgIHZhciBleHBpcmVzQXQgPSBkYXRhLmV4cGlyZXNfYXQgfHwgMCAgLy8g8J+Up+OAkOaWsOWinuOAkeacjeWKoeerr+i/h+acn+aXtumXtOaIs++8iOavq+enku+8iVxuXG4gICAgICAgIC8vIPCflJLjgJDph43opoHjgJHlhYjlgZzmraLkuYvliY3nmoTlgJLorqHml7bvvIjmnI3liqHlmajova7ovazkuobvvIlcbiAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG5cbiAgICAgICAgdGhpcy5yb2JfcGxheWVyX2FjY291bnRpZCA9IHBsYXllcklkXG4gICAgICAgIHRoaXMuX2JpZFRpbWVvdXQgPSB0aW1lb3V0XG4gICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IHJvdW5kID09PSAxID8gXCJiaWRkaW5nXCIgOiBcInJvYmJpbmdcIlxuICAgICAgICB0aGlzLl9iaWRFeHBpcmVzQXQgPSBleHBpcmVzQXQgIC8vIPCflKfjgJDmlrDlop7jgJHkv53lrZjov4fmnJ/ml7bpl7RcblxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuXG4gICAgICAgIGlmIChTdHJpbmcocGxheWVySWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZCkgJiYgdGhpcy5jYXJkc1JlYWR5KSB7XG4gICAgICAgICAgICBpZiAocm91bmQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93QmlkVUkoXCLlj6vlnLDkuLtcIiwgXCLkuI3lj6tcIilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0JpZFVJKFwi5oqi5Zyw5Li7XCIsIFwi5LiN5oqiXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwiY2FsbF9sYW5kbG9yZF90dXJuX2V2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyX2lkOiBwbGF5ZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgcm91bmQ6IHJvdW5kLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiBleHBpcmVzQXRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9zaG93QmlkVUk6IGZ1bmN0aW9uKGNvbmZpcm1UZXh0LCBjYW5jZWxUZXh0KSB7XG4gICAgICAgIGlmICghdGhpcy5yb2JVSSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgY29uZmlybUJ0biA9IHRoaXMucm9iVUkuZ2V0Q2hpbGRCeU5hbWUoXCJidG5fcWlhbmR6XCIpXG4gICAgICAgIHZhciBjYW5jZWxCdG4gPSB0aGlzLnJvYlVJLmdldENoaWxkQnlOYW1lKFwiYnRuX2J1cWlhbmR6XCIpXG4gICAgICAgIFxuICAgICAgICBpZiAoY29uZmlybUJ0bikge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gY29uZmlybUJ0bi5nZXRDaGlsZEJ5TmFtZShcIkxhYmVsXCIpXG4gICAgICAgICAgICBpZiAobGFiZWwgJiYgbGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSkge1xuICAgICAgICAgICAgICAgIGxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gY29uZmlybVRleHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gY2FuY2VsQnRuLmdldENoaWxkQnlOYW1lKFwiTGFiZWxcIilcbiAgICAgICAgICAgIGlmIChsYWJlbCAmJiBsYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgPSBjYW5jZWxUZXh0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMucm9iVUkuYWN0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLl9zdGFydEJpZENvdW50ZG93bigpXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvKDpgJLljIXlkKsgdGltZW91dCDnmoTlr7nosaFcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuZW1pdChcImNhbnJvYl9ldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyX2lkOiB0aGlzLnJvYl9wbGF5ZXJfYWNjb3VudGlkLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMuX2JpZFRpbWVvdXQgfHwgMTVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF9oaWRlUm9iVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5yb2JVSSkge1xuICAgICAgICAgICAgdGhpcy5yb2JVSS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+VkOOAkOWAkuiuoeaXtuezu+e7n+OAkeagh+WHhuaWl+WcsOS4u+WAkuiuoeaXtu+8iOW4puWIhuauteWCrOS/g+aViOaenO+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOe7n+S4gOWFpeWPo+OAkeW8gOWni+aKouWcsOS4u+WAkuiuoeaXtlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHmoLnmja7mnI3liqHnq6/ov4fmnJ/ml7bpl7TorqHnrpfliankvZnml7bpl7TvvIznoa7kv53kuI7mnI3liqHnq6/lkIzmraVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSDlgJLorqHml7bnp5LmlbDvvIjlpIfnlKjvvIzlpoLmnpwgZXhwaXJlc19hdCDml6DmlYjliJnkvb/nlKjvvIlcbiAgICAgKi9cbiAgICBfc3RhcnRCaWRDb3VudGRvd246IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAvLyDwn5SS44CQ6Ziy5oqk44CR5YWI5YGc5q2i5LmL5YmN55qE5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX3N0b3BCaWRDb3VudGRvd24oKVxuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gZHVyYXRpb24gfHwgdGhpcy5fYmlkVGltZW91dCB8fCAxNVxuICAgICAgICB2YXIgZXhwaXJlc0F0ID0gdGhpcy5fYmlkRXhwaXJlc0F0IHx8IDBcblxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5qC55o2u5pyN5Yqh56uv6L+H5pyf5pe26Ze06K6h566X5Ymp5L2Z5pe26Ze0XG4gICAgICAgIHZhciB0aW1lTGVmdCA9IHRpbWVvdXRcbiAgICAgICAgaWYgKGV4cGlyZXNBdCA+IDApIHtcbiAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpXG4gICAgICAgICAgICB0aW1lTGVmdCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoKGV4cGlyZXNBdCAtIG5vdykgLyAxMDAwKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JpZFRpbWVMZWZ0ID0gdGltZUxlZnRcbiAgICAgICAgdGhpcy5faXNCaWRDb3VudGRvd25UaWNraW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSBmYWxzZVxuXG4gICAgICAgIC8vIPCflZAg5Yid5aeL5YyWVUnmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlQmlkQ291bnRkb3duVUkoKVxuXG4gICAgICAgIC8vIPCflZAg5L2/55SoIGNjLk5vZGUg55qEIHNjaGVkdWxlIOWunueOsOavj+enkiB0aWNrXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fYmlkQ291bnRkb3duVGljaywgMSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOaguOW/g1RpY2vjgJHmiqLlnLDkuLvlgJLorqHml7bmr4/np5LmiafooYxcbiAgICAgKi9cbiAgICBfYmlkQ291bnRkb3duVGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNCaWRDb3VudGRvd25UaWNraW5nKSByZXR1cm5cblxuICAgICAgICB0aGlzLl9iaWRUaW1lTGVmdC0tXG5cbiAgICAgICAgLy8g8J+VkCDmm7TmlrBVSeaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVCaWRDb3VudGRvd25VSSgpXG5cbiAgICAgICAgLy8g4pqg77iPIDXnp5LvvJrov5vlhaXorablkYrnirbmgIFcbiAgICAgICAgaWYgKHRoaXMuX2JpZFRpbWVMZWZ0ID09PSA1KSB7XG4gICAgICAgICAgICB0aGlzLl9lbnRlckJpZFdhcm5pbmdTdGF0ZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5SKIDPnp5LvvJrlvIDlp4vmu7TnrZTpn7PvvIjmr4/np5LkuIDmrKHvvIlcbiAgICAgICAgaWYgKHRoaXMuX2JpZFRpbWVMZWZ0IDw9IDMgJiYgdGhpcy5fYmlkVGltZUxlZnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9wbGF5VGlja1NvdW5kKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOKPsCAw56eS77ya6Ieq5Yqo5aSE55CGXG4gICAgICAgIGlmICh0aGlzLl9iaWRUaW1lTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vbkJpZENvdW50ZG93bkVuZCgpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkFVJ5pu05paw44CR5pu05paw5oqi5Zyw5Li75YCS6K6h5pe25pi+56S6XG4gICAgICovXG4gICAgX3VwZGF0ZUJpZENvdW50ZG93blVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX2JpZFRpbWVMZWZ0XG4gICAgICAgIHZhciB1cGRhdGVkID0gZmFsc2VcblxuICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHByb3BlcnRpZXMg57uR5a6a55qEIExhYmVsXG4gICAgICAgIGlmICh0aGlzLmJpZENvdW50ZG93bkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLmJpZENvdW50ZG93bkxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8muWwneivleS7jiByb2JVSSDkuK3mn6Xmib7lgJLorqHml7YgTGFiZWxcbiAgICAgICAgaWYgKHRoaXMucm9iVUkpIHtcbiAgICAgICAgICAgIHZhciBjbG9ja05vZGUgPSB0aGlzLnJvYlVJLmdldENoaWxkQnlOYW1lKFwiY2xvY2tcIilcbiAgICAgICAgICAgIGlmIChjbG9ja05vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2pdXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSAzMlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDQwXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5zZXRDb250ZW50U2l6ZSg1MCwgNTApXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LiN6YCa6L+HY29sb3Lorr7nva5hbHBoYVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnpJbmRleCA9IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrnlvI8z77ya6YCa55+lIHBsYXllcl9ub2RlIOabtOaWsOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5ub2RlICYmIHRoaXMubm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuZW1pdChcInVwZGF0ZV9jb3VudGRvd25fZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlkXCIsXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pqg77iP44CQ6K2m5ZGK54q25oCB44CRNeenkuaXtui/m+WFpeitpuWRiueKtuaAgVxuICAgICAqL1xuICAgIF9lbnRlckJpZFdhcm5pbmdTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0JpZFdhcm5pbmcpIHJldHVyblxuICAgICAgICB0aGlzLl9pc0JpZFdhcm5pbmcgPSB0cnVlXG5cbiAgICAgICAgLy8g6I635Y+W5YCS6K6h5pe2IExhYmVsIOiKgueCuVxuICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5fZ2V0QmlkQ291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKCFsYWJlbE5vZGUpIHJldHVyblxuXG4gICAgICAgIC8vIOWPmOe6olxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5Db2xvci5SRURcblxuICAgICAgICAvLyDwn5SlIOWRvOWQuOe8qeaUvuWKqOeUu1xuICAgICAgICBsYWJlbE5vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICBjYy50d2VlbihsYWJlbE5vZGUpXG4gICAgICAgICAgICAucmVwZWF0Rm9yZXZlcihcbiAgICAgICAgICAgICAgICBjYy50d2VlbigpXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IHNjYWxlOiAxLjAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zdGFydCgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflZDjgJDojrflj5boioLngrnjgJHojrflj5bmiqLlnLDkuLvlgJLorqHml7ZMYWJlbOiKgueCuVxuICAgICAqIPCflKfjgJDkv67lpI3jgJHmn6Xmib4gY2xvY2sg5a2Q6IqC54K55Lit55qEIExhYmVsXG4gICAgICovXG4gICAgX2dldEJpZENvdW50ZG93bkxhYmVsTm9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJpZENvdW50ZG93bkxhYmVsICYmIHRoaXMuYmlkQ291bnRkb3duTGFiZWwubm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmlkQ291bnRkb3duTGFiZWwubm9kZVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJvYlVJKSB7XG4gICAgICAgICAgICAvLyDmo4Dmn6UgY2xvY2sg6IqC54K55LiL55qEIExhYmVsXG4gICAgICAgICAgICB2YXIgY2xvY2tOb2RlID0gdGhpcy5yb2JVSS5nZXRDaGlsZEJ5TmFtZShcImNsb2NrXCIpXG4gICAgICAgICAgICBpZiAoY2xvY2tOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gY2xvY2tOb2RlLmNoaWxkcmVuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBjaGlsZHJlbltpXS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuW2ldXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlhbbku5blj6/og73nmoTlkI3np7BcbiAgICAgICAgICAgIHZhciBsYWJlbE5hbWVzID0gW1wiY2xvY2tfIExhYmVsXCIsIFwiY2xvY2tfTGFiZWxcIiwgXCJ0aW1lX2xhYmVsXCIsIFwiY291bnRkb3duXCJdXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxhYmVsTmFtZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5yb2JVSS5nZXRDaGlsZEJ5TmFtZShsYWJlbE5hbWVzW2pdKVxuICAgICAgICAgICAgICAgIGlmIChsYWJlbE5vZGUgJiYgbGFiZWxOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsTm9kZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDij7DjgJDlsZXnpLrnu5PmnZ/jgJHmnKzlnLDlgJLorqHml7bmmL7npLrnu5PmnZ9cbiAgICAgKiDimqDvuI/jgJDph43opoHjgJHlj6rlgZpVSeWkhOeQhu+8jOS4jeWPkemAgeivt+axgu+8gVxuICAgICAqIOacjeWKoeWZqOS8muWcqOi2heaXtuWQjuiHquWKqOWkhOeQhu+8jOW5tuWPkemAgeS4i+S4gOS4qui9ruasoea2iOaBr1xuICAgICAqL1xuICAgIF9vbkJpZENvdW50ZG93bkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWBnOatoiB0aWNrXG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9iaWRDb3VudGRvd25UaWNrKVxuXG4gICAgICAgIC8vIOWBnOatouWKqOeUu+W5tuaBouWkjeeKtuaAgVxuICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5fZ2V0QmlkQ291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICAvLyDimqDvuI/jgJDph43opoHjgJHkuI3lj5HpgIHku7vkvZXor7fmsYLvvIFcbiAgICAgICAgLy8g5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CGXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflJLjgJDlgZzmraLjgJHlgZzmraLmiqLlnLDkuLvlgJLorqHml7ZcbiAgICAgKi9cbiAgICBfc3RvcEJpZENvdW50ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzQmlkQ291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9iaWRDb3VudGRvd25UaWNrKVxuXG4gICAgICAgIC8vIOaBouWkjSBMYWJlbCDnirbmgIFcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IHRoaXMuX2dldEJpZENvdW50ZG93bkxhYmVsTm9kZSgpXG4gICAgICAgIGlmIChsYWJlbE5vZGUpIHtcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgICAgICBsYWJlbE5vZGUuc2NhbGUgPSAxXG4gICAgICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5Db2xvci5XSElURVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faXNCaWRXYXJuaW5nID0gZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+VkOOAkOWHuueJjOWAkuiuoeaXtuOAkeagh+WHhuaWl+WcsOS4u+WAkuiuoeaXtu+8iOW4puWIhuauteWCrOS/g+aViOaenO+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOe7n+S4gOWFpeWPo+OAkeW8gOWni+WHuueJjOWAkuiuoeaXtlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiAtIOWAkuiuoeaXtuenkuaVsO+8jOm7mOiupDE156eSXG4gICAgICovXG4gICAgX3N0YXJ0UGxheUNvdW50ZG93bjogZnVuY3Rpb24oZHVyYXRpb24pIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIC8vIPCflJLjgJDpmLLmiqTjgJHlhYjlgZzmraLkuYvliY3nmoTlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gZHVyYXRpb24gfHwgdGhpcy5fcGxheVRpbWVvdXQgfHwgMTVcbiAgICAgICAgdGhpcy5fcGxheVRpbWVMZWZ0ID0gdGltZW91dFxuICAgICAgICB0aGlzLl9pc1BsYXlDb3VudGRvd25UaWNraW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcblxuICAgICAgICAvLyDwn5WQIOWIneWni+WMllVJ5pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBsYXlDb3VudGRvd25VSSgpXG5cbiAgICAgICAgLy8g8J+VkCDkvb/nlKggY2MuTm9kZSDnmoQgc2NoZWR1bGUg5a6e546w5q+P56eSIHRpY2tcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLl9wbGF5Q291bnRkb3duVGljaywgMSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOaguOW/g1RpY2vjgJHlh7rniYzlgJLorqHml7bmr4/np5LmiafooYxcbiAgICAgKi9cbiAgICBfcGxheUNvdW50ZG93blRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcpIHJldHVyblxuXG4gICAgICAgIHRoaXMuX3BsYXlUaW1lTGVmdC0tXG5cbiAgICAgICAgLy8g8J+VkCDmm7TmlrBVSeaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVQbGF5Q291bnRkb3duVUkoKVxuXG4gICAgICAgIC8vIOKaoO+4jyA156eS77ya6L+b5YWl6K2m5ZGK54q25oCBXG4gICAgICAgIGlmICh0aGlzLl9wbGF5VGltZUxlZnQgPT09IDUpIHtcbiAgICAgICAgICAgIHRoaXMuX2VudGVyUGxheVdhcm5pbmdTdGF0ZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5SKIDPnp5LvvJrlvIDlp4vmu7TnrZTpn7PvvIjmr4/np5LkuIDmrKHvvIlcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlUaW1lTGVmdCA8PSAzICYmIHRoaXMuX3BsYXlUaW1lTGVmdCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3BsYXlUaWNrU291bmQoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g4o+wIDDnp5LvvJroh6rliqjlpITnkIZcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlUaW1lTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXlDb3VudGRvd25FbmQoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflZDjgJBVSeabtOaWsOOAkeabtOaWsOWHuueJjOWAkuiuoeaXtuaYvuekulxuICAgICAqIPCflKfjgJDkv67lpI3jgJHlj6rmm7TmlrDpl7npkp/ph4zpnaLnmoTlgJLorqHml7bvvIzkuI3lnKjlhbbku5bkvY3nva7mmL7npLpcbiAgICAgKi9cbiAgICBfdXBkYXRlUGxheUNvdW50ZG93blVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX3BsYXlUaW1lTGVmdFxuXG4gICAgICAgIC8vIOaWueW8jzHvvJrkvb/nlKggcHJvcGVydGllcyDnu5HlrprnmoQgTGFiZWzvvIjlpoLmnpzmnInvvIlcbiAgICAgICAgaWYgKHRoaXMucGxheUNvdW50ZG93bkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlDb3VudGRvd25MYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8mumAmuefpSBwbGF5ZXJfbm9kZSDmm7TmlrDlgJLorqHml7ZcbiAgICAgICAgaWYgKHRoaXMubm9kZSAmJiB0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgY2MuRXZlbnQuRXZlbnRDdXN0b20oXCJ1cGRhdGVfY291bnRkb3duX2V2ZW50XCIsIHRydWUpXG4gICAgICAgICAgICBldmVudC5zZXRVc2VyRGF0YSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJwbGF5XCIsXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrnlvI8z77ya55u05o6l5pu05pawIHBsYXlpbmdVSV9ub2RlIOS4reeahOmXuemSnyBMYWJlbFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR6Ze56ZKf6IqC54K56Lev5b6E77yacGxheWluZ1VJX25vZGUgLT4gY2xvY2sgLT4gcGxheWluZ19jbG9jbF9sYWJlbFxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdmFyIGNsb2NrTm9kZSA9IHRoaXMucGxheWluZ1VJX25vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJjbG9ja1wiKVxuICAgICAgICAgICAgaWYgKGNsb2NrTm9kZSkge1xuICAgICAgICAgICAgICAgIC8vIOehruS/nSBjbG9jayDoioLngrnlj6/op4FcbiAgICAgICAgICAgICAgICBjbG9ja05vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGNsb2NrTm9kZS5vcGFjaXR5ID0gMjU1XG5cbiAgICAgICAgICAgICAgICAvLyDmn6Xmib4gcGxheWluZ19jbG9jbF9sYWJlbO+8iOazqOaEj+aLvOWGme+8iVxuICAgICAgICAgICAgICAgIHZhciBjbG9ja0xhYmVsID0gY2xvY2tOb2RlLmdldENoaWxkQnlOYW1lKFwicGxheWluZ19jbG9jbF9sYWJlbFwiKVxuICAgICAgICAgICAgICAgIGlmIChjbG9ja0xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNsb2NrTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0xhYmVsLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrTGFiZWwub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5aSH6YCJ77ya5p+l5om+5Lu75L2VIExhYmVsIOWtkOiKgueCuVxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFN0cmluZyhyZW1haW5pbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLm9wYWNpdHkgPSAyNTVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw6Ze56ZKf6YeM6Z2i55qE5YCS6K6h5pe25pi+56S6XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlbWFpbmluZyAtIOWJqeS9meenkuaVsFxuICAgICAqL1xuICAgIF91cGRhdGVDbG9ja1RpbWVMYWJlbDogZnVuY3Rpb24ocmVtYWluaW5nKSB7XG4gICAgICAgIC8vIOafpeaJviBnYW1lU2NlbmUg6IqC54K5XG4gICAgICAgIHZhciBnYW1lU2NlbmVOb2RlID0gdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWdhbWVTY2VuZU5vZGUpIHJldHVyblxuXG4gICAgICAgIC8vIOmBjeWOhuaJgOacieWtkOiKgueCue+8jOaJvuWIsCBwbGF5ZXJfbm9kZe+8iOW9k+WJjeeOqeWutu+8iVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZVNjcmlwdCA9IGNoaWxkLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICBpZiAocGxheWVyTm9kZVNjcmlwdCAmJiBwbGF5ZXJOb2RlU2NyaXB0LnNlYXRfaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHRpbWVfbGFiZWwg5bGe5oCnXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllck5vZGVTY3JpcHQudGltZV9sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJOb2RlU2NyaXB0LnRpbWVfbGFiZWwuc3RyaW5nID0gU3RyaW5nKHJlbWFpbmluZylcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDmlrnlvI8y77ya5p+l5om+IGNsb2NraW1hZ2Ug6IqC54K55Lit55qEIExhYmVs77yI5LiO5oqi5Zyw5Li75YCS6K6h5pe257G75Ly877yJXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllck5vZGVTY3JpcHQuY2xvY2tpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvY2tOb2RlID0gcGxheWVyTm9kZVNjcmlwdC5jbG9ja2ltYWdlXG4gICAgICAgICAgICAgICAgICAgIC8vIOehruS/nSBjbG9ja2ltYWdlIOWPr+ingVxuICAgICAgICAgICAgICAgICAgICBjbG9ja05vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBjbG9ja05vZGUub3BhY2l0eSA9IDI1NVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIOafpeaJviBjbG9ja2ltYWdlIOS4reeahCBMYWJlbFxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvY2tDaGlsZHJlbiA9IGNsb2NrTm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNsb2NrQ2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbG9ja0NoaWxkID0gY2xvY2tDaGlsZHJlbltqXVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gY2xvY2tDaGlsZC5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBTdHJpbmcocmVtYWluaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQub3BhY2l0eSA9IDI1NVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruWQiOmAgueahOWtl+S9k+Wkp+Wwj1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLmZvbnRTaXplID0gMzJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0NoaWxkLnNldENvbnRlbnRTaXplKDUwLCA1MClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LiN6YCa6L+HY29sb3Lorr7nva5hbHBoYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb2NrQ2hpbGQuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9ja0NoaWxkLnpJbmRleCA9IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpwgY2xvY2tpbWFnZSDmsqHmnIkgTGFiZWwg5a2Q6IqC54K577yM5qOA5p+l5piv5ZCm55u05o6l5pivIExhYmVsXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3RMYWJlbCA9IGNsb2NrTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0TGFiZWwuc3RyaW5nID0gU3RyaW5nKHJlbWFpbmluZylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKaoO+4j+OAkOitpuWRiueKtuaAgeOAkTXnp5Lml7bov5vlhaXorablkYrnirbmgIFcbiAgICAgKi9cbiAgICBfZW50ZXJQbGF5V2FybmluZ1N0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUGxheVdhcm5pbmcpIHJldHVyblxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gdHJ1ZVxuXG4gICAgICAgIC8vIOiOt+WPluWAkuiuoeaXtiBMYWJlbCDoioLngrlcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IHRoaXMuX2dldFBsYXlDb3VudGRvd25MYWJlbE5vZGUoKVxuICAgICAgICBpZiAoIWxhYmVsTm9kZSkgcmV0dXJuXG5cbiAgICAgICAgLy8g5Y+Y57qiXG4gICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRFxuXG4gICAgICAgIC8vIPCflKUg5ZG85ZC457yp5pS+5Yqo55S7XG4gICAgICAgIGxhYmVsTm9kZS5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgIGNjLnR3ZWVuKGxhYmVsTm9kZSlcbiAgICAgICAgICAgIC5yZXBlYXRGb3JldmVyKFxuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgLnRvKDAuMywgeyBzY2FsZTogMS4yIH0pXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEuMCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOiOt+WPluiKgueCueOAkeiOt+WPluWHuueJjOWAkuiuoeaXtkxhYmVs6IqC54K5XG4gICAgICovXG4gICAgX2dldFBsYXlDb3VudGRvd25MYWJlbE5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmlrnlvI8x77ya5L2/55SoIHByb3BlcnRpZXMg57uR5a6a55qEIExhYmVsXG4gICAgICAgIGlmICh0aGlzLnBsYXlDb3VudGRvd25MYWJlbCAmJiB0aGlzLnBsYXlDb3VudGRvd25MYWJlbC5ub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wbGF5Q291bnRkb3duTGFiZWwubm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55byPMu+8muS7jiBwbGF5aW5nVUlfbm9kZSDnmoTpl7npkp/kuK3ojrflj5YgTGFiZWxcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkemXuemSn+iKgueCuei3r+W+hO+8mnBsYXlpbmdVSV9ub2RlIC0+IGNsb2NrIC0+IHBsYXlpbmdfY2xvY2xfbGFiZWxcbiAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgIHZhciBjbG9ja05vZGUgPSB0aGlzLnBsYXlpbmdVSV9ub2RlLmdldENoaWxkQnlOYW1lKFwiY2xvY2tcIilcbiAgICAgICAgICAgIGlmIChjbG9ja05vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyDmn6Xmib4gcGxheWluZ19jbG9jbF9sYWJlbO+8iOazqOaEj+aLvOWGme+8iVxuICAgICAgICAgICAgICAgIHZhciBjbG9ja0xhYmVsID0gY2xvY2tOb2RlLmdldENoaWxkQnlOYW1lKFwicGxheWluZ19jbG9jbF9sYWJlbFwiKVxuICAgICAgICAgICAgICAgIGlmIChjbG9ja0xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbG9ja0xhYmVsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWkh+mAie+8muafpeaJvuS7u+S9lSBMYWJlbCDlrZDoioLngrlcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBjbG9ja05vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkcmVuW2ldLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKPsOOAkOWxleekuue7k+adn+OAkeacrOWcsOWHuueJjOWAkuiuoeaXtuaYvuekuue7k+adn1xuICAgICAqIOKaoO+4j+OAkOmHjeimgeOAkeWPquWBmlVJ5aSE55CG77yM5LiN5Y+R6YCB6K+35rGC77yBXG4gICAgICog5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CG77yI6Ieq5Yqo5LiN5Ye677yJ77yM5bm25Y+R6YCB5LiL5LiA5Liq6L2u5qyh5raI5oGvXG4gICAgICovXG4gICAgX29uUGxheUNvdW50ZG93bkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWBnOatoiB0aWNrXG4gICAgICAgIHRoaXMuX2lzUGxheUNvdW50ZG93blRpY2tpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLnVuc2NoZWR1bGUodGhpcy5fcGxheUNvdW50ZG93blRpY2spXG5cbiAgICAgICAgLy8g5YGc5q2i5Yqo55S75bm25oGi5aSN54q25oCBXG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSB0aGlzLl9nZXRQbGF5Q291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICAvLyDimqDvuI/jgJDph43opoHjgJHkuI3lj5HpgIHku7vkvZXor7fmsYLvvIFcbiAgICAgICAgLy8g5pyN5Yqh5Zmo5Lya5Zyo6LaF5pe25ZCO6Ieq5Yqo5aSE55CG77yaXG4gICAgICAgIC8vIDEuIOiHquWKqOS4jeWHulxuICAgICAgICAvLyAyLiDlj5HpgIEgY2FuX2NodV9jYXJkX25vdGlmeSDmiJYgZ2FtZV9vdmVyXG4gICAgICAgIC8vIOWuouaIt+err+WPqumcgOimgeWTjeW6lOacjeWKoeWZqOa2iOaBr1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SS44CQ5YGc5q2i44CR5YGc5q2i5Ye654mM5YCS6K6h5pe2XG4gICAgICovXG4gICAgX3N0b3BQbGF5Q291bnRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNQbGF5Q291bnRkb3duVGlja2luZyA9IGZhbHNlXG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9wbGF5Q291bnRkb3duVGljaylcblxuICAgICAgICAvLyDmgaLlpI0gTGFiZWwg54q25oCBXG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSB0aGlzLl9nZXRQbGF5Q291bnRkb3duTGFiZWxOb2RlKClcbiAgICAgICAgaWYgKGxhYmVsTm9kZSkge1xuICAgICAgICAgICAgbGFiZWxOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIGxhYmVsTm9kZS5zY2FsZSA9IDFcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pc1BsYXlXYXJuaW5nID0gZmFsc2VcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+UiuOAkOmfs+aViOOAkea7tOetlOmfs+aViO+8iDPnp5Llgqzkv4PvvIlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5ru0562U6Z+z5pWI77yI55So5LqO5oqi5Zyw5Li75YCS6K6h5pe277yJXG4gICAgICovXG4gICAgX3BsYXlUaWNrU291bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgLy8g5LyY5YWI5L2/55So57uR5a6a55qE6Z+z5pWIXG4gICAgICAgIGlmICh0aGlzLnRpY2tBdWRpbykge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnRpY2tBdWRpbywgZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFnOW6le+8muS9v+eUqOWPkeeJjOmfs+aViO+8iOWPr+abv+aNouS4uuS4k+eUqOa7tOetlOmfs+aViO+8iVxuICAgICAgICBwbGF5U291bmQoXCJzb3VuZC9mYXBhaTFcIilcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmkq3mlL7mu7TnrZTpn7PmlYjvvIjnlKjkuo7lh7rniYzlgJLorqHml7bvvIlcbiAgICAgKi9cbiAgICBfcGxheVBsYXlUaWNrU291bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgLy8g5LyY5YWI5L2/55So57uR5a6a55qE6Z+z5pWIXG4gICAgICAgIGlmICh0aGlzLnRpY2tBdWRpbykge1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnRpY2tBdWRpbywgZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFnOW6le+8muS9v+eUqOWPkeeJjOmfs+aViFxuICAgICAgICBwbGF5U291bmQoXCJzb3VuZC9mYXBhaTFcIilcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+UiiDmiqLlnLDkuLvor63pn7Pns7vnu5/vvIjmnI3liqHnq6/pqbHliqjvvIlcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5oqi5Zyw5Li76K+t6Z+zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmnI3liqHnq6/lub/mkq3nmoTmlbDmja5cbiAgICAgKiAgIC0gYWN0aW9uOiBcImNhbGxcIiA9IOaKoiwgXCJwYXNzXCIgPSDkuI3miqJcbiAgICAgKiAgIC0gZ2VuZGVyOiBcIm1hbGVcIiAvIFwiZmVtYWxlXCJcbiAgICAgKiAgIC0gb3JkZXI6IOW9k+WJjei9ruasoeWGheeahOaTjeS9nOmhuuW6j++8iDEtM++8iVxuICAgICAqICAgLSByb3VuZDog5b2T5YmN6L2u5qyh77yIMeaIljLvvIlcbiAgICAgKi9cbiAgICBfcGxheVJvYlNvdW5kOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghaXNvcGVuX3NvdW5kKSByZXR1cm5cblxuICAgICAgICB2YXIgYWN0aW9uID0gZGF0YS5hY3Rpb25cbiAgICAgICAgdmFyIGdlbmRlciA9IGRhdGEuZ2VuZGVyIHx8IFwibWFsZVwiXG4gICAgICAgIHZhciBvcmRlciA9IGRhdGEub3JkZXIgfHwgMVxuICAgICAgICB2YXIgcm91bmQgPSBkYXRhLnJvdW5kIHx8IDFcbiAgICAgICAgdmFyIHBsYXllcklEID0gZGF0YS5wbGF5ZXJfaWQgfHwgXCJcIlxuXG4gICAgICAgIC8vIPCflJLjgJDpmLLph43lpI3mnLrliLbjgJHmo4Dmn6XmmK/lkKblt7Lnu4/mkq3mlL7ov4fnm7jlkIznmoTpn7PmlYhcbiAgICAgICAgdmFyIHNvdW5kS2V5ID0gcGxheWVySUQgKyBcIl9cIiArIGFjdGlvbiArIFwiX1wiICsgcm91bmQgKyBcIl9cIiArIG9yZGVyXG4gICAgICAgIGlmICh0aGlzLl9sYXN0Um9iU291bmRLZXkgPT09IHNvdW5kS2V5KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0Um9iU291bmRLZXkgPSBzb3VuZEtleVxuXG5cbiAgICAgICAgLy8g5LiN5oqiXG4gICAgICAgIGlmIChhY3Rpb24gPT09IFwicGFzc1wiKSB7XG4gICAgICAgICAgICB2YXIgcGFzc1NvdW5kID0gZ2VuZGVyID09PSBcImZlbWFsZVwiID8gXCJtX252X2J1cWlhbmdcIiA6IFwibV9uYW5fYnVxaWFuZ1wiXG4gICAgICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3QocGFzc1NvdW5kKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmiqLlnLDkuLtcbiAgICAgICAgaWYgKGdlbmRlciA9PT0gXCJmZW1hbGVcIikge1xuICAgICAgICAgICAgLy8g5aWz546p5a62XG4gICAgICAgICAgICBpZiAocm91bmQgPT09IDEgJiYgb3JkZXIgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChcIm1fbnZfcWlhbmdkaXpodV8wMVwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMi8z5L2NIOaIliDnrKwy6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHZhciBzb3VuZHMgPSBbXCJtX252X3FpYW5nZGl6aHVfMDJcIiwgXCJtX252X3FpYW5nZGl6aHVfd29xaWFuZ18wMVwiXVxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlSYW5kb21Tb3VuZChzb3VuZHMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDnlLfnjqnlrrZcbiAgICAgICAgICAgIGlmIChyb3VuZCA9PT0gMSAmJiBvcmRlciA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIOesrDHova7nrKwx5L2NXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KFwibV9uYW5fcWlhbmdkaXpodVwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDnrKwx6L2u56ysMi8z5L2NIOaIliDnrKwy6L2u56ysMeS9jVxuICAgICAgICAgICAgICAgIHZhciBzb3VuZHMgPSBbXCJtX25hbl9xaWFuZ2Rpemh1XCIsIFwibV9uYW5fcWlhbmdkaXpodV93b3FpYW5nXCJdXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVJhbmRvbVNvdW5kKHNvdW5kcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SKIOaSreaUvumfs+aViO+8iOW4piBmYWxsYmFjayDmnLrliLbvvIlcbiAgICAgKiDwn5Sn44CQ6YeN5p6E44CR56e76Zmk5YWo5bGAIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiIOeahOmAu+i+kVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0g6Z+z5pWI5ZCN56ew77yI5LiN5ZCr5omp5bGV5ZCN77yJXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZhbGxiYWNrIC0g5Y+v6YCJ55qEIGZhbGxiYWNrIOmfs+aViOWQjeensO+8iOS4jeWGjeiHquWKqCBmYWxsYmFjayDliLAgXCLlpKfkvaBcIu+8iVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYWxsb3dEYW5pRmFsbGJhY2sgLSDmmK/lkKblhYHorrjmnIDnu4ggZmFsbGJhY2sg5YiwIFwi5aSn5L2gXCLvvIjpu5jorqQgZmFsc2XvvIlcbiAgICAgKi9cbiAgICBfcGxheVNvdW5kRWZmZWN0OiBmdW5jdGlvbihuYW1lLCBmYWxsYmFjaywgYWxsb3dEYW5pRmFsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcInNvdW5kL1wiICsgbmFtZSwgY2MuQXVkaW9DbGlwLCBmdW5jdGlvbihlcnIsIGNsaXApIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfcGxheVNvdW5kRWZmZWN0XSDliqDovb3pn7PmlYjlpLHotKU6IFwiICsgbmFtZSwgZXJyLm1lc3NhZ2UgfHwgZXJyKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJBmYWxsYmFja+OAkeWwneivleaSreaUvuWkh+eUqOmfs+aViFxuICAgICAgICAgICAgICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcInNvdW5kL1wiICsgZmFsbGJhY2ssIGNjLkF1ZGlvQ2xpcCwgZnVuY3Rpb24oZXJyMiwgY2xpcDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX3BsYXlTb3VuZEVmZmVjdF0gZmFsbGJhY2sg5Lmf5aSx6LSlOiBcIiArIGZhbGxiYWNrLCBlcnIyLm1lc3NhZ2UgfHwgZXJyMilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ6YeN6KaB5L+u5pS544CR5LiN5YaN6Ieq5YqoIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+q5pyJ5piO56Gu5YWB6K645pe25omNIGZhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93RGFuaUZhbGxiYWNrICYmIGZhbGxiYWNrICE9PSBcIm1fY3BfZGFuaVwiICYmIG5hbWUgIT09IFwibV9jcF9kYW5pXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcGxheVNvdW5kRWZmZWN0KFwibV9jcF9kYW5pXCIsIG51bGwsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QoY2xpcDIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsb3dEYW5pRmFsbGJhY2sgJiYgbmFtZSAhPT0gXCJtX2NwX2RhbmlcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ6YeN6KaB5L+u5pS544CR5LiN5YaN6buY6K6kIGZhbGxiYWNrIOWIsCBcIuWkp+S9oFwiXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3BsYXlTb3VuZEVmZmVjdChcIm1fY3BfZGFuaVwiLCBudWxsLCBmYWxzZSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QoY2xpcCwgZmFsc2UpXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflIog6ZqP5py65pKt5pS+6Z+z5pWIXG4gICAgICogQHBhcmFtIHtBcnJheX0gc291bmRzIC0g6Z+z5pWI5ZCN56ew5pWw57uEXG4gICAgICovXG4gICAgX3BsYXlSYW5kb21Tb3VuZDogZnVuY3Rpb24oc291bmRzKSB7XG4gICAgICAgIGlmICghc291bmRzIHx8IHNvdW5kcy5sZW5ndGggPT09IDApIHJldHVyblxuICAgICAgICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VuZHMubGVuZ3RoKVxuICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3Qoc291bmRzW2luZGV4XSlcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBvbkJ1dHRvbkNsaWNrOiBmdW5jdGlvbihldmVudCwgY3VzdG9tRGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgc3dpdGNoKGN1c3RvbURhdGEpIHtcbiAgICAgICAgICAgIGNhc2UgXCJidG5fcWlhbmR6XCI6XG4gICAgICAgICAgICAgICAgLy8g4pqg77iP44CQ5bey5Yig6Zmk44CR5oyJ6ZKu54K55Ye76Z+z5pWIIC0g6Z+z5pWI55Sx5pyN5Yqh56uv5bm/5pKt6Kem5Y+R77yIX3BsYXlSb2JTb3VuZO+8iVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9iaWRkaW5nUGhhc2UgPT09IFwiYmlkZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVSb2JVSSgpXG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0QmlkKHRydWUpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RSb2JTdGF0ZShxaWFuX3N0YXRlLnFpYW4pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGNhc2UgXCJidG5fYnVxaWFuZHpcIjpcbiAgICAgICAgICAgICAgICAvLyDimqDvuI/jgJDlt7LliKDpmaTjgJHmjInpkq7ngrnlh7vpn7PmlYggLSDpn7PmlYjnlLHmnI3liqHnq6/lub/mkq3op6blj5HvvIhfcGxheVJvYlNvdW5k77yJXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2JpZGRpbmdQaGFzZSA9PT0gXCJiaWRkaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RCaWQoZmFsc2UpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZVJvYlVJKClcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RSb2JTdGF0ZShxaWFuX3N0YXRlLmJ1cWlhbmcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlIFwibm9wdXNoY2FyZFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q5Y+R6YCB5LiN5Ye66K+35rGC77yM5LiN5pys5Zyw5aSE55CGXG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RfYnVjaHVfY2FyZChbXSwgbnVsbClcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlpbmdVSV9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgY2FzZSBcInRpcGNhcmRcIjpcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5o+Q56S65oyJ6ZKu5Yqf6IO9XG4gICAgICAgICAgICAgICAgdGhpcy5fb25IaW50QnV0dG9uQ2xpY2soKVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGNhc2UgXCJwdXNoY2FyZFwiOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IFwi6K+36YCJ5oup54mMIVwiXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOiwg+ivleaXpeW/l+OAkeaJk+WNsOmAieS4reeahOeJjO+8iOWinuW8uueJiO+8jOaYvuekuueJjOWQje+8iVxuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZENhcmROYW1lcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmQgPSB0aGlzLmNob29zZV9jYXJkX2RhdGFbaV1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZC5jYXJkX2RhdGEgfHwgY2FyZFxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZE5hbWUgPSB0aGlzLl9nZXRDYXJkRGlzcGxheU5hbWUoY2FyZERhdGEpXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2FyZE5hbWVzLnB1c2goY2FyZE5hbWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlrqLmiLfnq6/niYzlnovpqozor4FcbiAgICAgICAgICAgICAgICB2YXIgY2FyZHNUb1BsYXkgPSB0aGlzLmNob29zZV9jYXJkX2RhdGEubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMuY2FyZF9kYXRhIHx8IGNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy5fdmFsaWRhdGVIYW5kVHlwZShjYXJkc1RvUGxheSlcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRpb25SZXN1bHQudmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gdmFsaWRhdGlvblJlc3VsdC5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlj6rlj5HpgIHlh7rniYzor7fmsYLvvIznrYnlvoXmnI3liqHnq6/lub/mkq3lkI7lho3mm7TmlrDmiYvniYxcbiAgICAgICAgICAgICAgICAvLyDmnI3liqHnq6/kvJrlub/mkq0gY2FyZF9wbGF5ZWQg5raI5oGv77yM55SxIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOWkhOeQhlxuICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0X2NodV9jYXJkKHRoaXMuY2hvb3NlX2NhcmRfZGF0YSwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlLnov5vjgJHlh7rniYzlpLHotKXvvIzmmL7npLrmm7Tor6bnu4bnmoTplJnor6/kv6Hmga9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvck1zZyA9IChkYXRhICYmIGRhdGEubXNnKSB8fCBcIuWHuueJjOWksei0pVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPlueUqOaIt+mAieS4reeahOeJjOWei1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkVHlwZSA9IHZhbGlkYXRpb25SZXN1bHQudHlwZSB8fCBcIuacquefpeeJjOWei1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRDb3VudCA9IHNlbGYuY2hvb3NlX2NhcmRfZGF0YS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W5LiK5a6255qE54mM5Z6L5L+h5oGvXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFBsYXllZFR5cGUgPSBzZWxmLl9sYXN0UGxheWVkSGFuZFR5cGUgfHwgXCLmnKrnn6VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQbGF5ZWRDb3VudCA9IHNlbGYuX2xhc3RQbGF5ZWRDYXJkcyA/IHNlbGYuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGggOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHojrflj5bkuIrlrrblh7rnmoTniYzlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXN0UGxheWVkQ2FyZE5hbWVzID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX2xhc3RQbGF5ZWRDYXJkcyAmJiBzZWxmLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLl9sYXN0UGxheWVkQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChzZWxmLl9nZXRDYXJkRGlzcGxheU5hbWUoc2VsZi5fbGFzdFBsYXllZENhcmRzW2ldKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBsYXllZENhcmROYW1lcyA9IG5hbWVzLmpvaW4oXCIsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaehOW7uuivpue7hueahOmUmeivr+aPkOekulxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRldGFpbE1zZyA9IGVycm9yTXNnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JNc2cuaW5kZXhPZihcIuWkp+S4jei/h1wiKSA+PSAwIHx8IGVycm9yTXNnLmluZGV4T2YoXCLmiZPkuI3ov4dcIikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDlop7lvLrjgJHmmL7npLrnlKjmiLfpgInnmoTniYzlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeW91ckNhcmRzID0gc2VsZWN0ZWRDYXJkTmFtZXMuam9pbihcIixcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDniYzlnovkuI3ljLnphY3miJbniYzlpKrlsI9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDb3VudCAhPT0gbGFzdFBsYXllZENvdW50ICYmIGxhc3RQbGF5ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsTXNnID0gXCLniYzmlbDkuI3ljLnphY3vvIHkuIrlrrblh7pcIiArIGxhc3RQbGF5ZWRUeXBlICsgXCLvvIzkvaDpgInkuoZcIiArIHlvdXJDYXJkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRUeXBlICE9PSBsYXN0UGxheWVkVHlwZSAmJiBsYXN0UGxheWVkVHlwZSAhPT0gXCLngrjlvLlcIiAmJiBsYXN0UGxheWVkVHlwZSAhPT0gXCLnjovngrhcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxNc2cgPSBcIueJjOWei+S4jeWMuemFje+8geS4iuWutuWHulwiICsgbGFzdFBsYXllZFR5cGUgKyBcIu+8jOS9oOmAieS6hlwiICsgeW91ckNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOWinuW8uuOAkeaYvuekuuWFt+S9k+eahOeJjOWQjeavlOi+g1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBsYXllZENhcmROYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsTXNnID0gXCLmiZPkuI3ov4fvvIHkuIrlrrblh7pcIiArIGxhc3RQbGF5ZWRDYXJkTmFtZXMgKyBcIu+8jOS9oOmAieS6hlwiICsgeW91ckNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxNc2cgPSBcIueJjOWkquWwj++8geS9oOmAieS6hlwiICsgeW91ckNhcmRzICsgXCLmiZPkuI3ov4fkuIrlrrZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBkZXRhaWxNc2dcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBzTGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCkgIC8vIOW7tumVv+aYvuekuuaXtumXtOWIsDPnp5JcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3Jlc2V0Q2FyZEZsYWdzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5Ye654mM5oiQ5Yqf77yM5LiN5Zyo6L+Z6YeM5Yig6Zmk5omL54mM77yBXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnrYnlvoXmnI3liqHnq6/lub/mkq0gY2FyZF9wbGF5ZWQg5raI5oGv77yM55SxIG9uT3RoZXJQbGF5ZXJDaHVDYXJkIOWkhOeQhlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5riF56m66YCJ5Lit55qE54mMXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNob29zZV9jYXJkX2RhdGEgPSBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfcmVzZXRDYXJkRmxhZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q6YeN572u5omL54mM5a655Zmo5Lit55qE54mM6IqC54K5XG4gICAgICAgIHZhciBjYXJkUGFyZW50ID0gdGhpcy5jYXJkc19ub2RlXG4gICAgICAgIGlmICghY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbX3Jlc2V0Q2FyZEZsYWdzXSBjYXJkc19ub2RlIOacquWumuS5ie+8jOWwneivleafpeaJvuaJi+eJjOWuueWZqFwiKVxuICAgICAgICAgICAgLy8g5bCd6K+V6YCa6L+H6IqC54K55ZCN56ew5p+l5om+XG4gICAgICAgICAgICB2YXIgZ2FtZVNjZW5lTm9kZSA9IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgICAgIGlmIChnYW1lU2NlbmVOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IFwiY2FyZHNfbm9kZVwiIHx8IGNoaWxkLm5hbWUgPT09IFwiY2FyZHNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFBhcmVudCA9IGNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRzX25vZGUgPSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmHjee9ruaJgOacieeJjOeahOmAieS4reeKtuaAgVxuICAgICAgICBpZiAoY2FyZFBhcmVudCkge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gY2FyZFBhcmVudC5jaGlsZHJlblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLmVtaXQoXCJyZXNldF9jYXJkX2ZsYWdcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn46uIFtfcmVzZXRDYXJkRmxhZ3NdIOaJvuS4jeWIsOaJi+eJjOWuueWZqFwiKVxuICAgICAgICB9XG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmuIXnqbrpgInniYzlkI7mm7TmlrDmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXkoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw5bey6YCJ54mM5pWw5pi+56S6XG4gICAgICog4pqg77iP44CQ5L+u5aSN44CR55So5oi36KaB5rGC6K+l5L2N572u5LiN5pi+56S65Lu75L2V5paH5a2X77yM5bey56aB55SoIHRpcHNMYWJlbCDmmL7npLpcbiAgICAgKiDku4XlnKjmjqfliLblj7DovpPlh7rml6Xlv5fnlKjkuo7osIPor5VcbiAgICAgKi9cbiAgICBfdXBkYXRlU2VsZWN0ZWRDb3VudERpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY291bnQgPSB0aGlzLmNob29zZV9jYXJkX2RhdGEubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmsqHmnInpgInkuK3niYzvvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W6YCJ5Lit55qE54mM5pWw5o2uXG4gICAgICAgIHZhciBjYXJkc1RvUGxheSA9IHRoaXMuY2hvb3NlX2NhcmRfZGF0YS5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgcmV0dXJuIGMuY2FyZF9kYXRhIHx8IGNcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOmqjOivgeeJjOWei1xuICAgICAgICB2YXIgdmFsaWRhdGlvblJlc3VsdCA9IHRoaXMuX3ZhbGlkYXRlSGFuZFR5cGUoY2FyZHNUb1BsYXkpXG4gICAgICAgIFxuICAgICAgICAvLyDmnoTlu7rmmL7npLrmlofmnKzvvIjku4XnlKjkuo7ml6Xlv5fvvIlcbiAgICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gXCLlt7LpgIkgXCIgKyBjb3VudCArIFwiIOW8oFwiXG4gICAgICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCArPSBcIiAtIFwiICsgdmFsaWRhdGlvblJlc3VsdC50eXBlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCArPSBcIiAtIFwiICsgdmFsaWRhdGlvblJlc3VsdC5tZXNzYWdlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOKaoO+4j+OAkOemgeeUqOOAkeS4jeWGjeWcqCB0aXBzTGFiZWwg5LiK5pi+56S65paH5a2XXG4gICAgICAgIC8vIOS7hei+k+WHuuaOp+WItuWPsOaXpeW/l+eUqOS6juiwg+ivlVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlh7rniYznm7jlhbNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5bey5bqf5byD44CR5Zyw5Li76I635b6X5bqV54mM5ZCO5re75Yqg5Yiw5omL54mMXG4gICAgICog4pqg77iP44CQ6YeN6KaB44CR5q2k5Ye95pWw5bey5bqf5byD77yM5LiN5YaN5L2/55So77yBXG4gICAgICog5Zyw5Li75omL54mM5pu05paw55SxIG9uTGFuZGxvcmRDYXJkcyDlpITnkIbvvIzpgJrov4fmnI3liqHnq68gbGFuZGxvcmRfY2FyZHMg5raI5oGvXG4gICAgICog5L+d55WZ5q2k5Ye95pWw5LuF55So5LqO5YW85a6577yM5LiN5Lya6Kem5Y+R6YeN5paw5Y+R54mM5Yqo55S7XG4gICAgICovXG4gICAgcHVzaFRocmVlQ2FyZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHkuI3lho3miafooYzku7vkvZXmk43kvZzvvIFcbiAgICAgICAgLy8g5bqV54mM5bey6YCa6L+HIGxhbmRsb3JkX2NhcmRzIOa2iOaBr+eUseacjeWKoeerr+ebtOaOpeabtOaWsOWcsOS4u+aJi+eJjFxuICAgICAgICAvLyDmraTlh73mlbDkv53nlZnku4XkuLrlhbzlrrnml6fku6PnoIHlvJXnlKhcbiAgICAgICAgcmV0dXJuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHku47miYvniYzkuK3liKDpmaTlt7Llh7rnmoTniYzvvIjmnI3liqHnq6/pqbHliqjvvIlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOacjeWKoeerr+i/lOWbnueahOW3suWHuueJjOaVsOaNriBbe3N1aXQsIHJhbmt9LCAuLi5dXG4gICAgICovXG4gICAgX3JlbW92ZUNhcmRzRnJvbUhhbmQ6IGZ1bmN0aW9uKGNhcmRzKSB7XG4gICAgICAgIGlmICghY2FyZHMgfHwgY2FyZHMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuXG4gICAgICAgIC8vIOmBjeWOhuimgeWIoOmZpOeahOeJjFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZFRvUmVtb3ZlID0gY2FyZHNbaV1cbiAgICAgICAgICAgIC8vIOWcqOaJi+eJjOS4reafpeaJvuW5tuWIoOmZpFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IHRoaXMuaGFuZENhcmRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFuZENhcmRzW2pdLnJhbmsgPT09IGNhcmRUb1JlbW92ZS5yYW5rICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzW2pdLnN1aXQgPT09IGNhcmRUb1JlbW92ZS5zdWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzLnNwbGljZShqLCAxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5riF56m66YCJ5Lit55qE54mM5pWw5o2u77yM6Ziy5q2i5q6L55WZXG4gICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOmdmem7mOabtOaWsO+8jOS4jeinpuWPkeWPkeeJjOWKqOeUu1xuICAgICAgICB0aGlzLl91cGRhdGVIYW5kQ2FyZHNTaWxlbnQodGhpcy5oYW5kQ2FyZHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6Z2Z6buY5pu05paw5omL54mM77yI5LiN6Kem5Y+R5Y+R54mM5Yqo55S777yJXG4gICAgICog55So5LqO5Ye654mM5ZCO5pu05paw5omL54mM5pi+56S6XG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDmiYvniYzmlbDmja5cbiAgICAgKi9cbiAgICBfdXBkYXRlSGFuZENhcmRzU2lsZW50OiBmdW5jdGlvbihjYXJkcykge1xuICAgICAgICBpZiAoIWNhcmRzKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLluo/miYvniYxcbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gdGhpcy5fc29ydENhcmRzKGNhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWPquS9v+eUqGNhcmRzX25vZGXvvIzkuI3pgY3ljoZub2RlLnBhcmVudFxuICAgICAgICB2YXIgY2FyZHNQYXJlbnQgPSB0aGlzLmNhcmRzX25vZGVcbiAgICAgICAgaWYgKCFjYXJkc1BhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW191cGRhdGVIYW5kQ2FyZHNTaWxlbnRdIGNhcmRzX25vZGUg5pyq5a6a5LmJXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeWFiOmUgOavgeaJgOacieaXp+aJi+eJjOiKgueCue+8jOehruS/neS6i+S7tuebkeWQrOWZqOiiq+a4heeQhlxuICAgICAgICB2YXIgb2xkQ2hpbGRyZW4gPSBjYXJkc1BhcmVudC5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gb2xkQ2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IG9sZENoaWxkcmVuW2ldXG4gICAgICAgICAgICAvLyDlhYjlj5bmtojmiYDmnInkuovku7bnm5HlkKxcbiAgICAgICAgICAgIGNoaWxkLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVClcbiAgICAgICAgICAgIC8vIOWGjemUgOavgeiKgueCuVxuICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpXG4gICAgICAgIH1cbiAgICAgICAgLy8g5YaN5qyh56Gu5L+d5riF56m6XG4gICAgICAgIGNhcmRzUGFyZW50LnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHmuIXnqbrpgInkuK3nmoTniYzmlbDmja7vvIzpmLLmraLmrovnlZlcbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW11cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOWIm+W7uuaJi+eJjOiKgueCue+8iOaXoOWKqOeUu++8iVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRlZENhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBzb3J0ZWRDYXJkc1tpXVxuICAgICAgICAgICAgdmFyIHRhcmdldFggPSB0aGlzLl9nZXRDYXJkWChpLCBzb3J0ZWRDYXJkcy5sZW5ndGgsIENhcmRMYXlvdXQuY2FyZFNwYWNpbmcpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYXJkID0gY2MuaW5zdGFudGlhdGUodGhpcy5jYXJkX3ByZWZhYilcbiAgICAgICAgICAgIGlmICghY2FyZCkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FyZC5zY2FsZSA9IENhcmRMYXlvdXQuY2FyZFNjYWxlXG4gICAgICAgICAgICBjYXJkLnBhcmVudCA9IGNhcmRzUGFyZW50XG4gICAgICAgICAgICBjYXJkLnNldFBvc2l0aW9uKHRhcmdldFgsIENhcmRMYXlvdXQuY2FyZFkpXG4gICAgICAgICAgICBjYXJkLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIGNhcmQuekluZGV4ID0gaVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY2FyZENvbXAgPSBjYXJkLmdldENvbXBvbmVudChcImNhcmRcIilcbiAgICAgICAgICAgIGlmIChjYXJkQ29tcCkge1xuICAgICAgICAgICAgICAgIGNhcmRDb21wLnNob3dDYXJkcyhjYXJkRGF0YSwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjee9rua4suafk+WTiOW4jO+8jOWFgeiuuOWQjue7rea4suafk1xuICAgICAgICB0aGlzLl9sYXN0UmVuZGVySGFzaCA9IEpTT04uc3RyaW5naWZ5KGNhcmRzKVxuICAgICAgICBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pqg77iP44CQ5bey5bqf5byD44CR5pen54mI5Yig6Zmk5omL54mM5pa55rOVXG4gICAgICog5L+d55WZ5LuF5Li65YW85a6577yM5paw5Luj56CB5bqU5L2/55SoIF9yZW1vdmVDYXJkc0Zyb21IYW5kXG4gICAgICovXG4gICAgZGVzdG9yeUNhcmQ6IGZ1bmN0aW9uKGFjY291bnRpZCwgY2hvb3NlX2NhcmQpIHtcbiAgICAgICAgaWYgKGNob29zZV9jYXJkLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgZGVzdHJveV9jYXJkID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaG9vc2VfY2FyZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IHRoaXMuaGFuZENhcmRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFuZENhcmRzW2pdLnJhbmsgPT09IGNob29zZV9jYXJkW2ldLmNhcmRfZGF0YS5yYW5rICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzW2pdLnN1aXQgPT09IGNob29zZV9jYXJkW2ldLmNhcmRfZGF0YS5zdWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS7juaJi+eJjOaVsOaNruS4reWIoOmZpFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRDYXJkcy5zcGxpY2UoaiwgMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmHjeaWsOa4suafk1xuICAgICAgICB0aGlzLnJlbmRlckNhcmRzKHRoaXMuaGFuZENhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65Ye655qE54mMXG4gICAgICAgIGlmICh0aGlzLmNhcmRzX25vZGUgJiYgdGhpcy5jYXJkc19ub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvdXRDYXJkX25vZGUgPSB0aGlzLl9nZXRPdXRDYXJkTm9kZShhY2NvdW50aWQpXG4gICAgICAgICAgICBpZiAob3V0Q2FyZF9ub2RlKSB7XG4gICAgICAgICAgICAgICAgLy8g5om+5Yiw5bey6YCJ5Lit55qE54mM6IqC54K5XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZXMgPSBbXVxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY2FyZHNfbm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmRDb21wID0gY2hpbGRyZW5baV0uZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZENvbXAgJiYgY2FyZENvbXAuZmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKGNoaWxkcmVuW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd091dENhcmRzKG91dENhcmRfbm9kZSwgc2VsZWN0ZWROb2RlcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX2dldE91dENhcmROb2RlOiBmdW5jdGlvbihhY2NvdW50aWQpIHtcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpSBub2RlLnBhcmVudCDmmK/lkKblrZjlnKhcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUgfHwgIXRoaXMubm9kZS5pc1ZhbGlkIHx8ICF0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4OPIFtfZ2V0T3V0Q2FyZE5vZGVdIG5vZGUg5oiWIG5vZGUucGFyZW50IOacquWumuS5ieaIluW3sumUgOavgVwiKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgIHJldHVybiBnYW1lU2NlbmVfc2NyaXB0ID8gZ2FtZVNjZW5lX3NjcmlwdC5nZXRVc2VyT3V0Q2FyZFBvc0J5QWNjb3VudChhY2NvdW50aWQpIDogbnVsbFxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmj5DnpLrmjInpkq7lip/og71cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDkv67mlLnjgJHmj5DnpLrmjInpkq7ngrnlh7vlpITnkIYgLSDmlLnkuLror7fmsYLmnI3liqHnq6/mj5DnpLpcbiAgICAgKiDkvb/nlKjkuovku7bnm5HlkKzmlrnlvI/lpITnkIblk43lupTvvIzkuI3kvb/nlKjlm57osIPvvIjlm6DkuLrmnI3liqHnq6/kuI3ov5Tlm55jYWxsSW5kZXjvvIlcbiAgICAgKi9cbiAgICBfb25IaW50QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIOmHjee9rumAieS4reeahOeJjFxuICAgICAgICB0aGlzLl9yZXNldENhcmRGbGFncygpXG4gICAgICAgIHRoaXMuY2hvb3NlX2NhcmRfZGF0YSA9IFtdXG5cbiAgICAgICAgLy8g6K+35rGC5pyN5Yqh56uv5o+Q56S677yI5LiN5L2/55So5Zue6LCD77yM5L6d6LWW5LqL5Lu255uR5ZCs5Zmo5aSE55CG5ZON5bqU77yJXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICAvLyDnm7TmjqXlj5HpgIHmtojmga/vvIzlk43lupTlsIbpgJrov4cgb25IaW50UmVzdWx0IOS6i+S7tuebkeWQrOWZqOWkhOeQhlxuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnNlbmRIaW50UmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWkhOeQhuacjeWKoeerr+i/lOWbnueahOaPkOekuue7k+aenFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g5pyN5Yqh56uv6L+U5Zue55qE5o+Q56S65pWw5o2uXG4gICAgICogICAtIGNhcmRzOiDmj5DnpLrnmoTniYzmlbDnu4QgW3tzdWl0LCByYW5rfSwgLi4uXVxuICAgICAqICAgLSBpbmRleDog5b2T5YmN5o+Q56S657Si5byV77yI5LuOMOW8gOWni++8iVxuICAgICAqICAgLSB0b3RhbDog5oC75YWx5pyJ5aSa5bCR56eN5o+Q56S6XG4gICAgICovXG4gICAgX29uSGludFJlc3VsdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgaWYgKCFkYXRhIHx8ICFkYXRhLmNhcmRzIHx8IGRhdGEuY2FyZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5rKh5pyJ6IO96L+H55qE54mM5pe256uL5Y2z5o+Q56S65LiN5Ye677yM5LiN5YaN562J5b6FMS0y56eSXG4gICAgICAgICAgICAvLyB0aGlzLnRpcHNMYWJlbC5zdHJpbmcgPSBcIuayoeacieWPr+WHuueahOeJjFwiXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g56uL5Y2z6Ieq5Yqo5LiN5Ye677yM5LiN5YaN5bu26L+fXG4gICAgICAgICAgICBzZWxmLl9zdG9wUGxheUNvdW50ZG93bigpXG4gICAgICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQucmVxdWVzdF9idWNodV9jYXJkKFtdLCBudWxsKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnBsYXlpbmdVSV9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIDEuNeenkuWQjua4heepuuaPkOekuuaWh+Wtl1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICB9LCAxNTAwKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmAieS4reaPkOekuueahOeJjFxuICAgICAgICB0aGlzLl9zZWxlY3RDYXJkcyhkYXRhLmNhcmRzKVxuXG4gICAgICAgIC8vIPCflKfjgJDkv67mlLnjgJHljrvmjonmoYzpnaLkuIrnmoTnmb3oibLmloflrZfmj5DnpLpcbiAgICAgICAgLy8g5LiN5YaN5pi+56S6IFwi5o+Q56S6OiBY5byg54mMXCIg5L+h5oGvXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmiZjnrqHjgJHlpITnkIbmiZjnrqHnirbmgIHlj5jljJbpgJrnn6VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOaJmOeuoeeKtuaAgeaVsOaNrlxuICAgICAqICAgLSBwbGF5ZXJfaWQ6IOeOqeWutklEXG4gICAgICogICAtIHBsYXllcl9uYW1lOiDnjqnlrrblkI3lrZdcbiAgICAgKiAgIC0gaXNfdHJ1c3RlZTog5piv5ZCm5omY566hXG4gICAgICogICAtIHJlYXNvbjog5Y6f5ZugICh0aW1lb3V0L2Rpc2Nvbm5lY3QvcmVjb25uZWN0KVxuICAgICAqL1xuICAgIF9vblRydXN0ZWVTdGF0ZU5vdGlmeTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5blvZPliY3njqnlrrZJRFxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5pys5Zyw5omY566h54q25oCB77yI5LuF5b2T5piv6Ieq5bex5pe277yJXG4gICAgICAgIGlmIChTdHJpbmcoZGF0YS5wbGF5ZXJfaWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzTG9jYWxUcnVzdGVlID0gZGF0YS5pc190cnVzdGVlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW+aJmOeuoV0g5pys5Zyw5omY566h54q25oCB5pu05pawOlwiLCBkYXRhLmlzX3RydXN0ZWUsIFwi5Y6f5ZugOlwiLCBkYXRhLnJlYXNvbilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YCa55+l5omA5pyJ546p5a626IqC54K55pu05paw5omY566h54q25oCBXG4gICAgICAgIGlmICh0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5lbWl0KFwidHJ1c3RlZV9zdGF0ZV91cGRhdGVcIiwgZGF0YSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR55So5oi35rS75Yqo55uR5ZCsIC0g5Y+W5raI5py65Zmo5Lq65omY566hXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7nlKjmiLfmtLvliqjnm5HlkKzlmahcbiAgICAgKiDlvZPmo4DmtYvliLDnlKjmiLfmtLvliqjvvIjpvKDmoIfnp7vliqgv54K55Ye7L+inpuaRuO+8ieaXtu+8jOWPkemAgeWPlua2iOaJmOeuoeivt+axglxuICAgICAqL1xuICAgIF9zZXR1cFVzZXJBY3Rpdml0eUxpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzpvKDmoIfnp7vliqjkuovku7bvvIjlhajlsYDvvIlcbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub24oY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLk1PVVNFX01PVkUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLl9vblVzZXJBY3Rpdml0eShcIm1vdXNlX21vdmVcIilcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOm8oOagh+eCueWHu+S6i+S7tu+8iOWFqOWxgO+8iVxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuTU9VU0VfRE9XTiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuX29uVXNlckFjdGl2aXR5KFwibW91c2VfZG93blwiKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs6Kem5pG45byA5aeL5LqL5Lu277yI56e75Yqo56uv77yJXG4gICAgICAgIGNjLnN5c3RlbUV2ZW50Lm9uKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuX29uVXNlckFjdGl2aXR5KFwidG91Y2hfc3RhcnRcIilcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOinpuaRuOenu+WKqOS6i+S7tu+8iOenu+WKqOerr++8iVxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuVE9VQ0hfTU9WRSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuX29uVXNlckFjdGl2aXR5KFwidG91Y2hfbW92ZVwiKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFvnlKjmiLfmtLvliqhdIOW3suazqOWGjOWFqOWxgOa0u+WKqOebkeWQrOWZqFwiKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDlpITnkIbnlKjmiLfmtLvliqhcbiAgICAgKiDlpoLmnpznjqnlrrblpITkuo7miZjnrqHnirbmgIHvvIzlj5HpgIHlj5bmtojmiZjnrqHor7fmsYJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aXZpdHlUeXBlIC0g5rS75Yqo57G75Z6LXG4gICAgICovXG4gICAgX29uVXNlckFjdGl2aXR5OiBmdW5jdGlvbihhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgLy8g5Y+q5Zyo5omY566h54q25oCB5LiL5aSE55CGXG4gICAgICAgIGlmICghdGhpcy5faXNMb2NhbFRydXN0ZWUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmLLmipbvvJrpmZDliLblj5HpgIHpopHnjodcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KClcbiAgICAgICAgaWYgKG5vdyAtIHRoaXMuX2xhc3RBY3Rpdml0eVRpbWUgPCB0aGlzLl9hY3Rpdml0eVRocm90dGxlTXMpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xhc3RBY3Rpdml0eVRpbWUgPSBub3dcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBb55So5oi35rS75YqoXSDmo4DmtYvliLDnlKjmiLfmtLvliqg6XCIsIGFjdGl2aXR5VHlwZSwgXCLlj5HpgIHlj5bmtojmiZjnrqHor7fmsYJcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOWPkemAgeWPlua2iOaJmOeuoeivt+axglxuICAgICAgICB0aGlzLl9zZW5kQ2FuY2VsVHJ1c3RlZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOWPkemAgeWPlua2iOaJmOeuoeivt+axguWIsOacjeWKoeerr1xuICAgICAqL1xuICAgIF9zZW5kQ2FuY2VsVHJ1c3RlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW+WPlua2iOaJmOeuoV0gc29ja2V0IOacquWIneWni+WMllwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuacieWvueW6lOeahOWPkemAgeaWueazlVxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0LmNhbmNlbFRydXN0ZWUpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5jYW5jZWxUcnVzdGVlKClcbiAgICAgICAgfSBlbHNlIGlmIChteWdsb2JhbC5zb2NrZXQuc2VuZCkge1xuICAgICAgICAgICAgLy8g55u05o6l5Y+R6YCB5raI5oGvXG4gICAgICAgICAgICB2YXIgbXNnID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY2FuY2VsX3RydXN0ZWVcIixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfjq4gW+WPlua2iOaJmOeuoV0g5peg5rOV5Y+R6YCB5Y+W5raI5omY566h6K+35rGCXCIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOeri+WNs+abtOaWsOacrOWcsOeKtuaAge+8jOmBv+WFjemHjeWkjeWPkemAgVxuICAgICAgICB0aGlzLl9pc0xvY2FsVHJ1c3RlZSA9IGZhbHNlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOafpeaJvuWPr+S7peWHuueahOeJjO+8iOacrOWcsGZhbGxiYWNr77yJXG4gICAgICogQHBhcmFtIHtBcnJheX0gbGFzdFNlbGVjdGVkIC0g5LiK5qyh6YCJ5Lit55qE54mM77yI55So5LqO5om+5LiL5LiA57uE77yJXG4gICAgICogQHJldHVybnMge0FycmF5fSDlj6/ku6Xlh7rnmoTniYxcbiAgICAgKi9cbiAgICBfZmluZFBsYXlhYmxlQ2FyZHM6IGZ1bmN0aW9uKGxhc3RTZWxlY3RlZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOayoeacieaJi+eJjO+8jOS4jeWkhOeQhlxuICAgICAgICBpZiAoIXRoaXMuaGFuZENhcmRzIHx8IHRoaXMuaGFuZENhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g57uf6K6h5omL54mMXG4gICAgICAgIHZhciBjYXJkQ291bnRzID0ge31cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhhbmRDYXJkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSB0aGlzLmhhbmRDYXJkc1tpXS5yYW5rXG4gICAgICAgICAgICBpZiAoIWNhcmRDb3VudHNbcmFua10pIHtcbiAgICAgICAgICAgICAgICBjYXJkQ291bnRzW3JhbmtdID0gW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcmRDb3VudHNbcmFua10ucHVzaCh0aGlzLmhhbmRDYXJkc1tpXSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5piv5paw5LiA6L2u77yI5b+F6aG75Ye654mM77yJXG4gICAgICAgIGlmICh0aGlzLl9tdXN0UGxheSB8fCAhdGhpcy5fbGFzdFBsYXllZENhcmRzIHx8IHRoaXMuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kU21hbGxlc3RDYXJkcyhjYXJkQ291bnRzKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzkuI3og73miZPov4fvvIzkuI3mj5DnpLpcbiAgICAgICAgaWYgKCF0aGlzLl9jYW5CZWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bkuIrlrrbniYzlnovkv6Hmga9cbiAgICAgICAgdmFyIGxhc3RUeXBlID0gdGhpcy5fbGFzdFBsYXllZEhhbmRUeXBlIHx8IFwiXCJcbiAgICAgICAgdmFyIGxhc3RSYW5rID0gdGhpcy5fZ2V0TGFzdFBsYXllZE1haW5SYW5rKClcbiAgICAgICAgdmFyIGxhc3RDb3VudCA9IHRoaXMuX2xhc3RQbGF5ZWRDYXJkcy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIC8vIOagueaNrueJjOWei+afpeaJvuiDveaJk+i/h+eahOacgOWwj+eJjFxuICAgICAgICBzd2l0Y2ggKGxhc3RUeXBlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzaW5nbGVcIjogY2FzZSBcInNvbG9cIjogY2FzZSBcIuWNleW8oFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1NpbmdsZShjYXJkQ291bnRzLCBsYXN0UmFuaylcbiAgICAgICAgICAgIGNhc2UgXCJwYWlyXCI6IGNhc2UgXCJkb3VibGVcIjogY2FzZSBcIuWvueWtkFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1BhaXIoY2FyZENvdW50cywgbGFzdFJhbmspXG4gICAgICAgICAgICBjYXNlIFwidHJpcGxlXCI6IGNhc2UgXCJ0aHJlZVwiOiBjYXNlIFwi5LiJ5bygXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nVHJpcGxlKGNhcmRDb3VudHMsIGxhc3RSYW5rLCAwKVxuICAgICAgICAgICAgY2FzZSBcInRyaXBsZXdpdGhzaW5nbGVcIjogY2FzZSBcInNhbmRhaXlpXCI6IGNhc2UgXCLkuInluKbkuIBcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluZEJlYXRpbmdUcmlwbGUoY2FyZENvdW50cywgbGFzdFJhbmssIDEpXG4gICAgICAgICAgICBjYXNlIFwidHJpcGxld2l0aHBhaXJcIjogY2FzZSBcInNhbmRhaWR1aVwiOiBjYXNlIFwi5LiJ5bim5LqMXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nVHJpcGxlKGNhcmRDb3VudHMsIGxhc3RSYW5rLCAyKVxuICAgICAgICAgICAgY2FzZSBcImJvbWJcIjogY2FzZSBcInpoYWRhblwiOiBjYXNlIFwi54K45by5XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nQm9tYihjYXJkQ291bnRzLCBsYXN0UmFuaylcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8g5pyq55+l54mM5Z6L77yM5bCd6K+V5oyJ5byg5pWw5aSE55CGXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nQnlDb3VudChjYXJkQ291bnRzLCBsYXN0Q291bnQsIGxhc3RSYW5rKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5bkuIrlrrblh7rnmoTniYznmoTkuLvniYzngrnmlbBcbiAgICAgKi9cbiAgICBfZ2V0TGFzdFBsYXllZE1haW5SYW5rOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sYXN0UGxheWVkQ2FyZHMgfHwgdGhpcy5fbGFzdFBsYXllZENhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgICAgICAvLyDnu5/orqHmr4/kuKrngrnmlbDlh7rnjrDnmoTmrKHmlbBcbiAgICAgICAgdmFyIGNvdW50cyA9IHt9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGFzdFBsYXllZENhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHRoaXMuX2xhc3RQbGF5ZWRDYXJkc1tpXS5yYW5rXG4gICAgICAgICAgICBjb3VudHNbcmFua10gPSAoY291bnRzW3JhbmtdIHx8IDApICsgMVxuICAgICAgICB9XG4gICAgICAgIC8vIOaJvuWHuuWHuueOsOasoeaVsOacgOWkmueahOeCueaVsO+8iOS4u+eJjO+8iVxuICAgICAgICB2YXIgbWF4Q291bnQgPSAwXG4gICAgICAgIHZhciBtYWluUmFuayA9IDBcbiAgICAgICAgZm9yICh2YXIgcmFuayBpbiBjb3VudHMpIHtcbiAgICAgICAgICAgIGlmIChjb3VudHNbcmFua10gPiBtYXhDb3VudCkge1xuICAgICAgICAgICAgICAgIG1heENvdW50ID0gY291bnRzW3JhbmtdXG4gICAgICAgICAgICAgICAgbWFpblJhbmsgPSBwYXJzZUludChyYW5rKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWluUmFua1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5om+5pyA5bCP55qE54mM77yI5paw5LiA6L2u5pe25L2/55So77yJXG4gICAgICovXG4gICAgX2ZpbmRTbWFsbGVzdENhcmRzOiBmdW5jdGlvbihjYXJkQ291bnRzKSB7XG4gICAgICAgIC8vIOaMieeCueaVsOS7juWwj+WIsOWkp+aOkuW6j1xuICAgICAgICB2YXIgcmFua3MgPSBPYmplY3Qua2V5cyhjYXJkQ291bnRzKS5tYXAoZnVuY3Rpb24ocikgeyByZXR1cm4gcGFyc2VJbnQocikgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5LyY5YWI5Ye65Y2V5bygXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbY2FyZENvdW50c1tyYW5rXVswXV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5rKh5pyJ5Y2V5byg5YiZ5Ye65pyA5bCP55qE5a+55a2QXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkQ291bnRzW3JhbmtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWHuuacgOWwj+eahOS4ieW8oFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAoY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FyZENvdW50c1tyYW5rXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlh7rmnIDlsI/nmoTngrjlvLlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKGNhcmRDb3VudHNbcmFua10ubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmRDb3VudHNbcmFua11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5YWc5bqV77ya5Ye65pyA5bCP55qE54mMXG4gICAgICAgIGlmIChyYW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW2NhcmRDb3VudHNbcmFua3NbMF1dWzBdXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmib7og73miZPov4fnmoTmnIDlsI/ljZXlvKBcbiAgICAgKi9cbiAgICBfZmluZEJlYXRpbmdTaW5nbGU6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIHRhcmdldFJhbmspIHtcbiAgICAgICAgdmFyIHJhbmtzID0gT2JqZWN0LmtleXMoY2FyZENvdW50cykubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHBhcnNlSW50KHIpIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKHJhbmsgPiB0YXJnZXRSYW5rKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjYXJkQ291bnRzW3JhbmtdWzBdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIOayoeacieiDveaJk+i/h+eahOWNleW8oO+8jOWwneivleeCuOW8uVxuICAgICAgICByZXR1cm4gdGhpcy5fZmluZFNtYWxsZXN0Qm9tYihjYXJkQ291bnRzKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5om+6IO95omT6L+H55qE5pyA5bCP5a+55a2QXG4gICAgICovXG4gICAgX2ZpbmRCZWF0aW5nUGFpcjogZnVuY3Rpb24oY2FyZENvdW50cywgdGFyZ2V0UmFuaykge1xuICAgICAgICB2YXIgcmFua3MgPSBPYmplY3Qua2V5cyhjYXJkQ291bnRzKS5tYXAoZnVuY3Rpb24ocikgeyByZXR1cm4gcGFyc2VJbnQocikgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFuayA9IHJhbmtzW2ldXG4gICAgICAgICAgICBpZiAocmFuayA+IHRhcmdldFJhbmsgJiYgY2FyZENvdW50c1tyYW5rXS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbY2FyZENvdW50c1tyYW5rXVswXSwgY2FyZENvdW50c1tyYW5rXVsxXV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyDmsqHmnInog73miZPov4fnmoTlr7nlrZDvvIzlsJ3or5XngrjlvLlcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRTbWFsbGVzdEJvbWIoY2FyZENvdW50cylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuiDveaJk+i/h+eahOacgOWwj+S4ieW8oO+8iOW4puaIluS4jeW4pu+8iVxuICAgICAqL1xuICAgIF9maW5kQmVhdGluZ1RyaXBsZTogZnVuY3Rpb24oY2FyZENvdW50cywgdGFyZ2V0UmFuaywga2lja2Vycykge1xuICAgICAgICB2YXIgcmFua3MgPSBPYmplY3Qua2V5cyhjYXJkQ291bnRzKS5tYXAoZnVuY3Rpb24ocikgeyByZXR1cm4gcGFyc2VJbnQocikgfSkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5om+5LiJ5bygXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChyYW5rID4gdGFyZ2V0UmFuayAmJiBjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtjYXJkQ291bnRzW3JhbmtdWzBdLCBjYXJkQ291bnRzW3JhbmtdWzFdLCBjYXJkQ291bnRzW3JhbmtdWzJdXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWmguaenOmcgOimgeW4pueJjFxuICAgICAgICAgICAgICAgIGlmIChraWNrZXJzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2lja2VyQ2FyZHMgPSB0aGlzLl9maW5kS2lja2VyQ2FyZHMoY2FyZENvdW50cywgcmFuaywga2lja2VycylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpY2tlckNhcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGtpY2tlckNhcmRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5bCd6K+V5LuO5Zub5byg5Lit5ouG5LiJ5bygXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChyYW5rID4gdGFyZ2V0UmFuayAmJiBjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbY2FyZENvdW50c1tyYW5rXVswXSwgY2FyZENvdW50c1tyYW5rXVsxXSwgY2FyZENvdW50c1tyYW5rXVsyXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoa2lja2VycyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtpY2tlckNhcmRzID0gdGhpcy5fZmluZEtpY2tlckNhcmRzKGNhcmRDb3VudHMsIHJhbmssIGtpY2tlcnMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChraWNrZXJDYXJkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChraWNrZXJDYXJkcylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleeCuOW8uVxuICAgICAgICByZXR1cm4gdGhpcy5fZmluZFNtYWxsZXN0Qm9tYihjYXJkQ291bnRzKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5om+5bim54mMXG4gICAgICovXG4gICAgX2ZpbmRLaWNrZXJDYXJkczogZnVuY3Rpb24oY2FyZENvdW50cywgZXhjbHVkZVJhbmssIGNvdW50KSB7XG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKGNhcmRDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIFxuICAgICAgICB2YXIga2lja2VycyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoICYmIGtpY2tlcnMubGVuZ3RoIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKHJhbmsgIT09IGV4Y2x1ZGVSYW5rKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF2YWlsYWJsZSA9IE1hdGgubWluKGNhcmRDb3VudHNbcmFua10ubGVuZ3RoLCBjb3VudCAtIGtpY2tlcnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYXZhaWxhYmxlOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAga2lja2Vycy5wdXNoKGNhcmRDb3VudHNbcmFua11bal0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ga2lja2Vycy5sZW5ndGggPT09IGNvdW50ID8ga2lja2VycyA6IG51bGxcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuiDveaJk+i/h+eahOacgOWwj+eCuOW8uVxuICAgICAqL1xuICAgIF9maW5kQmVhdGluZ0JvbWI6IGZ1bmN0aW9uKGNhcmRDb3VudHMsIHRhcmdldFJhbmspIHtcbiAgICAgICAgdmFyIHJhbmtzID0gT2JqZWN0LmtleXMoY2FyZENvdW50cykubWFwKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHBhcnNlSW50KHIpIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSByYW5rc1tpXVxuICAgICAgICAgICAgaWYgKHJhbmsgPiB0YXJnZXRSYW5rICYmIGNhcmRDb3VudHNbcmFua10ubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmRDb3VudHNbcmFua11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyDmsqHmnInog73miZPov4fnmoTngrjlvLnvvIzlsJ3or5XnjovngrhcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRSb2NrZXQoY2FyZENvdW50cylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvuacgOWwj+eahOeCuOW8uVxuICAgICAqL1xuICAgIF9maW5kU21hbGxlc3RCb21iOiBmdW5jdGlvbihjYXJkQ291bnRzKSB7XG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKGNhcmRDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gcmFua3NbaV1cbiAgICAgICAgICAgIGlmIChjYXJkQ291bnRzW3JhbmtdLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkQ291bnRzW3JhbmtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRSb2NrZXQoY2FyZENvdW50cylcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOaJvueOi+eCuFxuICAgICAqL1xuICAgIF9maW5kUm9ja2V0OiBmdW5jdGlvbihjYXJkQ291bnRzKSB7XG4gICAgICAgIHZhciBqb2tlcnMgPSBbXVxuICAgICAgICBpZiAoY2FyZENvdW50c1sxNl0gJiYgY2FyZENvdW50c1sxNl0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgam9rZXJzLnB1c2goY2FyZENvdW50c1sxNl1bMF0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhcmRDb3VudHNbMTddICYmIGNhcmRDb3VudHNbMTddLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGpva2Vycy5wdXNoKGNhcmRDb3VudHNbMTddWzBdKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2tlcnMubGVuZ3RoID09PSAyID8gam9rZXJzIDogbnVsbFxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5oyJ5byg5pWw5om+6IO95omT6L+H55qE54mMXG4gICAgICovXG4gICAgX2ZpbmRCZWF0aW5nQnlDb3VudDogZnVuY3Rpb24oY2FyZENvdW50cywgY291bnQsIHRhcmdldFJhbmspIHtcbiAgICAgICAgLy8g566A5Y2V5a6e546w77ya5oyJ5byg5pWw5aSE55CGXG4gICAgICAgIGlmIChjb3VudCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nU2luZ2xlKGNhcmRDb3VudHMsIHRhcmdldFJhbmspXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnQgPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5kQmVhdGluZ1BhaXIoY2FyZENvdW50cywgdGFyZ2V0UmFuaylcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudCA9PT0gMykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nVHJpcGxlKGNhcmRDb3VudHMsIHRhcmdldFJhbmssIDApXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnQgPT09IDQpIHtcbiAgICAgICAgICAgIC8vIOWPr+iDveaYr+eCuOW8uVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmRCZWF0aW5nQm9tYihjYXJkQ291bnRzLCB0YXJnZXRSYW5rKVxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ID49IDUpIHtcbiAgICAgICAgICAgIC8vIOWPr+iDveaYr+mhuuWtkOOAgei/nuWvueetie+8jOaaguS4jeaUr+aMgeaPkOekulxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDpgInkuK3mjIflrprnmoTniYxcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjYXJkcyAtIOimgemAieS4reeahOeJjFxuICAgICAqL1xuICAgIF9zZWxlY3RDYXJkczogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgaWYgKCFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Y+q5LuO5omL54mM5a655Zmo5Lit5p+l5om+77yM5LiN6YGN5Y6Gbm9kZS5wYXJlbnRcbiAgICAgICAgdmFyIGNhcmRQYXJlbnQgPSB0aGlzLmNhcmRzX25vZGVcbiAgICAgICAgaWYgKCFjYXJkUGFyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn46uIFtfc2VsZWN0Q2FyZHNdIGNhcmRzX25vZGUg5pyq5a6a5LmJ77yM5bCd6K+V5p+l5om+5omL54mM5a655ZmoXCIpXG4gICAgICAgICAgICAvLyDlsJ3or5XpgJrov4foioLngrnlkI3np7Dmn6Xmib5cbiAgICAgICAgICAgIHZhciBnYW1lU2NlbmVOb2RlID0gdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICAgICAgaWYgKGdhbWVTY2VuZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVTY2VuZU5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gZ2FtZVNjZW5lTm9kZS5jaGlsZHJlbltpXVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQubmFtZSA9PT0gXCJjYXJkc19ub2RlXCIgfHwgY2hpbGQubmFtZSA9PT0gXCJjYXJkc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkUGFyZW50ID0gY2hpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FyZHNfbm9kZSA9IGNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYXJkUGFyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+OriBbX3NlbGVjdENhcmRzXSDmib7kuI3liLDmiYvniYzlrrnlmahcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gY2FyZFBhcmVudC5jaGlsZHJlblxuXG4gICAgICAgIHZhciBmb3VuZENvdW50ID0gMFxuICAgICAgICB2YXIgYWxyZWFkeU1hdGNoZWQgPSB7fSAgLy8g8J+Up+OAkOaWsOWinuOAkeiusOW9leW3suWMuemFjeeahOeJjO+8jOmYsuatoumHjeWkjeWMuemFjVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYXJkTm9kZSA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICB2YXIgY2FyZENvbXAgPSBjYXJkTm9kZS5nZXRDb21wb25lbnQoXCJjYXJkXCIpXG4gICAgICAgICAgICBpZiAoY2FyZENvbXAgJiYgY2FyZENvbXAuY2FyZF9kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8g5qOA5p+l6L+Z5byg54mM5piv5ZCm5Zyo6KaB6YCJ5Lit55qE54mM5LitXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjYXJkcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hLZXkgPSBjYXJkc1tqXS5zdWl0ICsgXCJfXCIgKyBjYXJkc1tqXS5yYW5rXG4gICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmo4Dmn6XmmK/lkKblt7Lnu4/ljLnphY3ov4fov5nlvKDniYxcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlNYXRjaGVkW21hdGNoS2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXJkQ29tcC5jYXJkX2RhdGEucmFuayA9PT0gY2FyZHNbal0ucmFuayAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZENvbXAuY2FyZF9kYXRhLnN1aXQgPT09IGNhcmRzW2pdLnN1aXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmo4Dmn6XmmK/lkKblt7Lnu4/pgInkuK1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FyZENvbXAuZmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOmAieS4rei/meW8oOeJjFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRDb21wLmZsYWcgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZE5vZGUueSArPSAyMCAgLy8g5ZCR5LiK56e75Yqo6KGo56S66YCJ5LitXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkaWQ6IGNhcmRDb21wLmNhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRfZGF0YTogY2FyZENvbXAuY2FyZF9kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZENvdW50KytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHJlYWR5TWF0Y2hlZFttYXRjaEtleV0gPSB0cnVlICAvLyDmoIforrDlt7LljLnphY1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoZm91bmRDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gXCLmj5DnpLrlpLHotKXvvIzor7fmiYvliqjpgInniYxcIlxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc0xhYmVsLnN0cmluZyA9IFwiXCJcbiAgICAgICAgICAgIH0sIDIwMDApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xlYXJPdXRab25lOiBmdW5jdGlvbihhY2NvdW50aWQpIHtcbiAgICAgICAgdmFyIG91dENhcmRfbm9kZSA9IHRoaXMuX2dldE91dENhcmROb2RlKGFjY291bnRpZClcbiAgICAgICAgaWYgKG91dENhcmRfbm9kZSkge1xuICAgICAgICAgICAgb3V0Q2FyZF9ub2RlLnJlbW92ZUFsbENoaWxkcmVuKHRydWUpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2hvd091dENhcmRzOiBmdW5jdGlvbihvdXRDYXJkX25vZGUsIGNhcmRzKSB7XG4gICAgICAgIGlmICghb3V0Q2FyZF9ub2RlIHx8ICFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHJldHVyblxuICAgICAgICBcbiAgICAgICAgb3V0Q2FyZF9ub2RlLnJlbW92ZUFsbENoaWxkcmVuKHRydWUpXG4gICAgICAgIFxuICAgICAgICB2YXIgY291bnQgPSBjYXJkcy5sZW5ndGhcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZCA9IGNhcmRzW2ldXG4gICAgICAgICAgICBvdXRDYXJkX25vZGUuYWRkQ2hpbGQoY2FyZCwgaSlcbiAgICAgICAgICAgIGNhcmQuc2V0U2NhbGUoQ2FyZExheW91dC5vdXRDYXJkU2NhbGUsIENhcmRMYXlvdXQub3V0Q2FyZFNjYWxlKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2dldENhcmRYKGksIGNvdW50LCBDYXJkTGF5b3V0Lm91dENhcmRTcGFjaW5nKVxuICAgICAgICAgICAgY2FyZC5zZXRQb3NpdGlvbih4LCAwKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOa4uOaIj+eKtuaAgeaBouWkje+8iOaWree6v+mHjei/nu+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIHJlc3RvcmVHYW1lU3RhdGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBnYW1lU3RhdGUgPSBkYXRhLmdhbWVfc3RhdGVcbiAgICAgICAgaWYgKCFnYW1lU3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeiuvue9rua4uOaIj+mYtuautVxuICAgICAgICBpZiAoZ2FtZVN0YXRlLnBoYXNlID09PSBcImJpZGRpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJiaWRkaW5nXCJcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiYmlkZGluZ1wiXG4gICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlLnBoYXNlID09PSBcInBsYXlpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5fZ2FtZVBoYXNlID0gXCJwbGF5aW5nXCJcbiAgICAgICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaBouWkjeeOqeWutuS/oeaBr1xuICAgICAgICBpZiAoZ2FtZVN0YXRlLnBsYXllcnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZVN0YXRlLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcCA9IGdhbWVTdGF0ZS5wbGF5ZXJzW2ldXG4gICAgICAgICAgICAgICAgaWYgKHAuaXNfbGFuZGxvcmQgJiYgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEubWFzdGVyX2FjY291bnRpZCA9IHAuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHpgJrnn6Xlhbbku5bnjqnlrrboioLngrnmm7TmlrBcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuZW1pdChcInBsYXllcnNfcmVzdG9yZWRfZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzOiBnYW1lU3RhdGUucGxheWVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHmgaLlpI3miYvniYxcbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5oYW5kKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7jgJHph43nva7muLLmn5Plk4jluIzvvIznoa7kv53miYvniYzkvJrooqvmm7TmlrBcbiAgICAgICAgICAgIHRoaXMuX2xhc3RSZW5kZXJIYXNoID0gXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkv53lrZjmiYvniYzmlbDmja5cbiAgICAgICAgICAgIHRoaXMuaGFuZENhcmRzID0gZ2FtZVN0YXRlLmhhbmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5qCH6K6w5Y+R54mM5a6M5oiQXG4gICAgICAgICAgICB0aGlzLmNhcmRzUmVhZHkgPSB0cnVlXG4gICAgICAgICAgICB0aGlzLmZhcGFpX2VuZCA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeS9v+eUqOmdmem7mOabtOaWsO+8jOS4jeinpuWPkeWPkeeJjOWKqOeUu1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlSGFuZENhcmRzU2lsZW50KHRoaXMuaGFuZENhcmRzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmgaLlpI3lupXniYxcbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5ib3R0b21fY2FyZHMgJiYgZ2FtZVN0YXRlLmJvdHRvbV9jYXJkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gZ2FtZVN0YXRlLmJvdHRvbV9jYXJkc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJvdHRvbV9jYXJkLmxlbmd0aCAmJiBpIDwgdGhpcy5ib3R0b21DYXJkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbV9jYXJkW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYXJkQ29tcCA9IHRoaXMuYm90dG9tX2NhcmRbaV0uZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZENvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRDb21wLnNob3dDYXJkcyh0aGlzLmJvdHRvbUNhcmRzW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5oGi5aSN5LiK5a625Ye655qE54mMXG4gICAgICAgIGlmIChnYW1lU3RhdGUubGFzdF9wbGF5ZWQgJiYgZ2FtZVN0YXRlLmxhc3RfcGxheWVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQbGF5ZWRDYXJkcyA9IGdhbWVTdGF0ZS5sYXN0X3BsYXllZFxuICAgICAgICAgICAgdGhpcy5fbGFzdFBsYXllZEhhbmRUeXBlID0gZ2FtZVN0YXRlLmxhc3RfcGxheWVkLmhhbmRfdHlwZSB8fCBcIlwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmmL7npLrkuIrlrrblh7rnmoTniYxcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUubGFzdF9wbGF5ZXJfaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgICAgICAgICAgaWYgKGdhbWVTY2VuZV9zY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dENhcmRfbm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQuZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoZ2FtZVN0YXRlLmxhc3RfcGxheWVyX2lkKVxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0Q2FyZF9ub2RlICYmIHRoaXMuY2FyZF9wcmVmYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOa4hemZpOaXp+eahOWHuueJjFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0Q2FyZF9ub2RlLnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pi+56S65LiK5a625Ye655qE54mMXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZV9jYXJkcyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVTdGF0ZS5sYXN0X3BsYXllZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYXJkID0gY2MuaW5zdGFudGlhdGUodGhpcy5jYXJkX3ByZWZhYilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZFNjcmlwdCA9IGNhcmQuZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZFNjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFNjcmlwdC5zaG93Q2FyZHMoZ2FtZVN0YXRlLmxhc3RfcGxheWVkW2ldLCB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZV9jYXJkcy5wdXNoKGNhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93T3V0Q2FyZHMob3V0Q2FyZF9ub2RlLCBub2RlX2NhcmRzKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmgaLlpI3lh7rniYzova7mrKFcbiAgICAgICAgaWYgKGdhbWVTdGF0ZS5waGFzZSA9PT0gXCJwbGF5aW5nXCIgJiYgZ2FtZVN0YXRlLmN1cnJlbnRfdHVybikge1xuICAgICAgICAgICAgdmFyIG15UGxheWVySWQgPSB3aW5kb3cubXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKS5pZCB8fCB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkemakOiXj+aKouWcsOS4u1VJXG4gICAgICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoU3RyaW5nKGdhbWVTdGF0ZS5jdXJyZW50X3R1cm4pID09PSBTdHJpbmcobXlQbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlpbmdVSV9ub2RlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5L+d5a2Y5Ye654mM54q25oCBXG4gICAgICAgICAgICAgICAgdGhpcy5fbXVzdFBsYXkgPSBnYW1lU3RhdGUubXVzdF9wbGF5IHx8IGZhbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FuQmVhdCA9IGdhbWVTdGF0ZS5jYW5fYmVhdCB8fCBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlkK/liqjlh7rniYzlgJLorqHml7bvvIjlpoLmnpzmnI3liqHnq6/mj5DkvpvkuobliankvZnml7bpl7TvvIlcbiAgICAgICAgICAgICAgICAvLyDms6jmhI/vvJrmnI3liqHnq6/lupTor6XlnKjph43ov57lkI7lj5HpgIEgY2FuX2NodV9jYXJkX25vdGlmeSDmtojmga/mnaXlkK/liqjlgJLorqHml7ZcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ1VJX25vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeWmguaenOaYr+aKouWcsOS4u+mYtuautVxuICAgICAgICBpZiAoZ2FtZVN0YXRlLnBoYXNlID09PSBcImJpZGRpbmdcIikge1xuICAgICAgICAgICAgLy8g5rOo5oSP77ya5pyN5Yqh56uv5bqU6K+l5Zyo6YeN6L+e5ZCO5Y+R6YCBIGNhbGxfbGFuZGxvcmRfdHVybl9ub3RpZnkg5raI5oGv5p2l5pi+56S65oqi5Zyw5Li75oyJ6ZKuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHlupXniYzmmL7npLrlkozlnLDkuLvmiYvniYzmm7TmlrBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pi+56S65bqV54mM57uZ5omA5pyJ546p5a6277yI57+754mM5Yqo55S777yJXG4gICAgICogQHBhcmFtIHtBcnJheX0gY2FyZHMgLSDlupXniYzmlbDmja5cbiAgICAgKi9cbiAgICBfc2hvd0JvdHRvbUNhcmRzVG9BbGw6IGZ1bmN0aW9uKGNhcmRzKSB7XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHpppblhYjmo4Dmn6XoioLngrnmmK/lkKbmnInmlYhcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUgfHwgIXRoaXMubm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4OPIFtfc2hvd0JvdHRvbUNhcmRzVG9BbGxdIOiKgueCueW3sumUgOavgeaIluaXoOaViO+8jOi3s+i/h1wiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghY2FyZHMgfHwgY2FyZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpSBib3R0b21fY2FyZCDmlbDnu4TmmK/lkKblrZjlnKhcbiAgICAgICAgaWYgKCF0aGlzLmJvdHRvbV9jYXJkIHx8ICFBcnJheS5pc0FycmF5KHRoaXMuYm90dG9tX2NhcmQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4OPIFtfc2hvd0JvdHRvbUNhcmRzVG9BbGxdIGJvdHRvbV9jYXJkIOacquWIneWni+WMllwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOW6leeJjOaYvuekulxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aCAmJiBpIDwgdGhpcy5ib3R0b21fY2FyZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNhcmROb2RlID0gdGhpcy5ib3R0b21fY2FyZFtpXVxuICAgICAgICAgICAgaWYgKCFjYXJkTm9kZSkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNhcmRTY3JpcHQgPSBjYXJkTm9kZS5nZXRDb21wb25lbnQoXCJjYXJkXCIpXG4gICAgICAgICAgICBpZiAoY2FyZFNjcmlwdCkge1xuICAgICAgICAgICAgICAgIGNhcmRTY3JpcHQuc2hvd0NhcmRzKGNhcmRzW2ldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6Z2Z6buY5pu05paw5Zyw5Li755qE5omL54mM77yI5LiN6Kem5Y+R5Y+R54mM5Yqo55S777yJXG4gICAgICog5Y+q5Zyo5Zyw5Li75pS25YiwIExBTkRMT1JEX0NBUkRTIOa2iOaBr+aXtuiwg+eUqFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGNhcmRzIC0g5Zyw5Li755qE5a6M5pW05omL54mM77yI5ZCr5bqV54mM77yJXG4gICAgICovXG4gICAgX3VwZGF0ZUxhbmRsb3JkSGFuZENhcmRzOiBmdW5jdGlvbihjYXJkcykge1xuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR6aaW5YWI5qOA5p+l6IqC54K55piv5ZCm5pyJ5pWIXG4gICAgICAgIGlmICghdGhpcy5ub2RlIHx8ICF0aGlzLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+DjyBbX3VwZGF0ZUxhbmRsb3JkSGFuZENhcmRzXSDoioLngrnlt7LplIDmr4HmiJbml6DmlYjvvIzot7Pov4dcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIWNhcmRzIHx8IGNhcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLluo/miYvniYxcbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gdGhpcy5fc29ydENhcmRzKGNhcmRzKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeehruS/neaJi+eJjOWuueWZqOWtmOWcqFxuICAgICAgICB2YXIgY2FyZHNQYXJlbnQgPSB0aGlzLmNhcmRzX25vZGVcbiAgICAgICAgaWYgKCFjYXJkc1BhcmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfg48gW191cGRhdGVMYW5kbG9yZEhhbmRDYXJkc10gY2FyZHNfbm9kZSDmnKrlrprkuYlcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIbml6fmiYvniYzoioLngrlcbiAgICAgICAgY2FyZHNQYXJlbnQucmVtb3ZlQWxsQ2hpbGRyZW4oKVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN5paw5Yib5bu65omL54mM6IqC54K577yI5peg5Yqo55S777yJXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGVkQ2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYXJkRGF0YSA9IHNvcnRlZENhcmRzW2ldXG4gICAgICAgICAgICB2YXIgdGFyZ2V0WCA9IHRoaXMuX2dldENhcmRYKGksIHNvcnRlZENhcmRzLmxlbmd0aCwgQ2FyZExheW91dC5jYXJkU3BhY2luZylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNhcmQgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmNhcmRfcHJlZmFiKVxuICAgICAgICAgICAgaWYgKCFjYXJkKSBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXJkLnNjYWxlID0gQ2FyZExheW91dC5jYXJkU2NhbGVcbiAgICAgICAgICAgIGNhcmQucGFyZW50ID0gY2FyZHNQYXJlbnQgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKjnoa7lrprnmoTmiYvniYzlrrnlmahcbiAgICAgICAgICAgIGNhcmQuc2V0UG9zaXRpb24odGFyZ2V0WCwgQ2FyZExheW91dC5jYXJkWSlcbiAgICAgICAgICAgIGNhcmQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgY2FyZC56SW5kZXggPSBpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjYXJkQ29tcCA9IGNhcmQuZ2V0Q29tcG9uZW50KFwiY2FyZFwiKVxuICAgICAgICAgICAgaWYgKGNhcmRDb21wKSB7XG4gICAgICAgICAgICAgICAgY2FyZENvbXAuc2hvd0NhcmRzKGNhcmREYXRhLCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5riy5p+T5ZOI5biM77yM5YWB6K645ZCO57ut5riy5p+TXG4gICAgICAgIHRoaXMuX2xhc3RSZW5kZXJIYXNoID0gSlNPTi5zdHJpbmdpZnkoY2FyZHMpXG4gICAgICAgIFxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDwn5SK44CQ5Ye654mM6Z+z5pWI57O757uf44CR5L2/55So5a6e6ZmF6Z+z5pWI5paH5Lu2XG4gICAgLy8g6Z+z5pWI5paH5Lu25ZG95ZCN6KeE5YiZ77yaXG4gICAgLy8gLSDnlLfniYg6IG1fY3Bfe3R5cGV9X3tyYW5rfS5tcDMg5oiWIG1fY3Bfe3R5cGV9Lm1wM1xuICAgIC8vIC0g5aWz54mIOiBtX2NwX252X3t0eXBlfV97cmFua30ubXAzIOaIliBtX2NwX252X3t0eXBlfS5tcDNcbiAgICAvLyDms6jmhI/vvJrlpKflsI/njosocmFuaz0xNC8xNSnmsqHmnInlr7nlrZDpn7PmlYjvvIzlm6DkuLrkuKTlvKDnjovmmK/njovngrjkuI3mmK/lr7nlrZBcbiAgICAvLyBcbiAgICAvLyDwn5Sn44CQ6Z+z5pWI6KeE5YiZ44CRXG4gICAgLy8gMS4g6aaW5Ye677yIaXNfbmV3X3JvdW5kPXRydWXvvInvvJrmkq3mlL7lr7nlupTniYzlnovnmoTpn7PmlYhcbiAgICAvLyAyLiDljovniYzvvIhpc19uZXdfcm91bmQ9ZmFsc2UsIGNhbl9iZWF0PXRydWXvvInvvJpcbiAgICAvLyAgICAtIOacieWvueW6lOmfs+aViOaWh+S7tu+8muaSreaUvueJjOWei+mfs+aViFxuICAgIC8vICAgIC0g5peg5a+55bqU6Z+z5pWI5paH5Lu277yI5aaC5a+55a2QMTQvMTXvvInvvJrmkq3mlL5cIuWkp+S9oFwi6Z+z5pWIXG4gICAgLy8gMy4g54K45by5L+eOi+eCuO+8muWni+e7iOaSreaUvueCuOW8uS/njovngrjpn7PmlYhcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCflIog5pKt5pS+5Ye654mM6Z+z5pWIXG4gICAgICog8J+Up+OAkOWFqOmdoumHjeaehOeJiOOAkeS4peagvOmBteW+qlwi5aSn5L2gXCLpn7PmlYjkvb/nlKjop4TliJlcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOacjeWKoeerr+W5v+aSreeahOaVsOaNrlxuICAgICAqICAgLSBoYW5kX3R5cGU6IOeJjOWei+WQjeensCAoc2luZ2xlL3BhaXIvdHJpcGxlL3N0cmFpZ2h0L2JvbWIvcm9ja2V0L2xpYW5kdWkvcGxhbmUvc2FuZGFpeWkvc2FuZGFpZHVpL3NpZGFpZXIvc2lkYWlsaWFuZ2R1aSlcbiAgICAgKiAgIC0gcmFuazog5Li754mM54K55pWwICjnlKjkuo7ljZXlvKAv5a+55a2QL+S4ieW8oClcbiAgICAgKiAgIC0gZ2VuZGVyOiBcIm1hbGVcIiAvIFwiZmVtYWxlXCJcbiAgICAgKiAgIC0gaXNfbmV3X3JvdW5kOiDmmK/lkKbmmK/mlrDlm57lkIjvvIjpppblh7rvvIlcbiAgICAgKiAgIC0gY2FuX2JlYXQ6IOaYr+WQpuWOi+i/h+S4iuWutlxuICAgICAqIFxuICAgICAqIOOAkOaguOW/g+inhOWImeOAkVwi5aSn5L2gXCLpn7PmlYgobV9jcF9kYW5pKeeahOS9v+eUqOWcuuaZr++8mlxuICAgICAqIFxuICAgICAqIOWcuuaZrzEgLSDpppblh7ooaXNfbmV3X3JvdW5kPXRydWUp77yaXG4gICAgICogICDinIUg5Y+q5pKt5pS+54mM5Z6L6Z+z5pWIXG4gICAgICogICDinYwg56aB5q2i5pKt5pS+XCLlpKfkvaBcIlxuICAgICAqIFxuICAgICAqIOWcuuaZrzIgLSDljovniYwoaXNfbmV3X3JvdW5kPWZhbHNlICYmIGNhbl9iZWF0PXRydWUp77yaXG4gICAgICogICDwn46yIDcwJSDmpoLnjofmkq3mlL7niYzlnovpn7PmlYhcbiAgICAgKiAgIPCfjrIgMzAlIOamgueOh+aSreaUvlwi5aSn5L2gXCJcbiAgICAgKiAgIO+8iOWmguaenOeJjOWei+mfs+aViOaWh+S7tuS4jeWtmOWcqO+8jDEwMCXmkq3mlL5cIuWkp+S9oFwi77yJXG4gICAgICogXG4gICAgICog5Zy65pmvMyAtIOeCuOW8uS/njovngrjvvJpcbiAgICAgKiAgIOKchSDlp4vnu4jmkq3mlL7ngrjlvLkv546L54K46Z+z5pWIXG4gICAgICovXG4gICAgX3BsYXlDYXJkU291bmQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCFpc29wZW5fc291bmQpIHJldHVyblxuXG4gICAgICAgIC8vIPCflKfjgJDosIPor5XjgJHmiZPljbDlrozmlbTmlbDmja7nu5PmnoRcblxuICAgICAgICB2YXIgaGFuZFR5cGUgPSBkYXRhLmhhbmRfdHlwZSB8fCBcIlwiXG4gICAgICAgIHZhciBnZW5kZXIgPSBkYXRhLmdlbmRlciB8fCBcIm1hbGVcIlxuICAgICAgICB2YXIgaXNOZXdSb3VuZCA9IGRhdGEuaXNfbmV3X3JvdW5kICE9PSB1bmRlZmluZWQgPyBkYXRhLmlzX25ld19yb3VuZCA6IHRydWVcbiAgICAgICAgdmFyIGNhbkJlYXQgPSBkYXRhLmNhbl9iZWF0ICE9PSB1bmRlZmluZWQgPyBkYXRhLmNhbl9iZWF0IDogZmFsc2VcblxuICAgICAgICAvLyDwn5Sn44CQ5qC45b+D5L+u5aSN44CR5LyY5YWI5LuOIGNhcmRzIOS4reaPkOWPluS4u+eJjOWAvFxuICAgICAgICB2YXIgcmFuayA9IHRoaXMuX2V4dHJhY3RNYWluUmFuayhkYXRhKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+UiuOAkOiwg+ivleaXpeW/l+OAkeivpue7hui+k+WHuumfs+aViOaSreaUvuWPguaVsFxuXG4gICAgICAgIC8vIPCflKfjgJDmo4Dmn6XjgJHmmK/lkKbmmK/ngrjlvLnmiJbnjovngrjvvIjnibnmrorlpITnkIbvvIlcbiAgICAgICAgdmFyIHR5cGUgPSAoaGFuZFR5cGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKVxuICAgICAgICB2YXIgaXNCb21iID0gdHlwZSA9PT0gXCJib21iXCIgfHwgdHlwZSA9PT0gXCJ6aGFkYW5cIiB8fCB0eXBlID09PSBcIueCuOW8uVwiXG4gICAgICAgIHZhciBpc1JvY2tldCA9IHR5cGUgPT09IFwicm9ja2V0XCIgfHwgdHlwZSA9PT0gXCJ3YW5nemhhXCIgfHwgdHlwZSA9PT0gXCLnjovngrhcIlxuICAgICAgICBcbiAgICAgICAgLy8g54K45by55ZKM546L54K45aeL57uI5pKt5pS+5a+55bqU6Z+z5pWIXG4gICAgICAgIGlmIChpc0JvbWIgfHwgaXNSb2NrZXQpIHtcbiAgICAgICAgICAgIHZhciBzb3VuZE5hbWUgPSB0aGlzLl9nZXRDYXJkVHlwZVNvdW5kKGhhbmRUeXBlLCByYW5rLCBnZW5kZXIpXG4gICAgICAgICAgICBpZiAoc291bmROYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KHNvdW5kTmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOaguOW/g+OAkeiOt+WPlueJjOWei+mfs+aViFxuICAgICAgICB2YXIgY2FyZFNvdW5kID0gdGhpcy5fZ2V0Q2FyZFR5cGVTb3VuZChoYW5kVHlwZSwgcmFuaywgZ2VuZGVyKVxuICAgICAgICB2YXIgcHJlZml4ID0gZ2VuZGVyID09PSBcImZlbWFsZVwiID8gXCJtX2NwX252X1wiIDogXCJtX2NwX1wiXG4gICAgICAgIHZhciBkYW5pU291bmQgPSBwcmVmaXggKyBcImRhbmlcIlxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOajgOafpeOAkeeJjOWei+aYr+WQpuacieWvueW6lOeahOmfs+aViOaWh+S7tlxuICAgICAgICB2YXIgaGFzU3BlY2lmaWNTb3VuZCA9IHRoaXMuX2hhc1NwZWNpZmljQ2FyZFNvdW5kKGhhbmRUeXBlLCByYW5rKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmoLjlv4Pkv67lpI3jgJHmraPnoa7nmoRcIuWkp+S9oFwi5pKt5pS+6YC76L6RXG4gICAgICAgIC8vIFxuICAgICAgICAvLyDop4TliJnor7TmmI7vvJpcbiAgICAgICAgLy8gMS4g6aaW5Ye6KGlzX25ld19yb3VuZD10cnVlKe+8muWPquaSreaUvueJjOWei+mfs+aViO+8jOemgeatolwi5aSn5L2gXCJcbiAgICAgICAgLy8gMi4g5Y6L54mMKGlzX25ld19yb3VuZD1mYWxzZSAmJiBjYW5fYmVhdD10cnVlKe+8mumaj+acuuaSreaUvu+8jDcwJeeJjOWei+mfs+aViO+8jDMwJVwi5aSn5L2gXCJcbiAgICAgICAgLy8gMy4g5Y6L54mM5L2G6Z+z5pWI5paH5Lu257y65aSx77ya5pKt5pS+XCLlpKfkvaBcIlxuICAgICAgICBcbiAgICAgICAgaWYgKGlzTmV3Um91bmQpIHtcbiAgICAgICAgICAgIC8vIOKcheOAkOWcuuaZrzHjgJHpppblh7rvvJrlj6rmkq3mlL7niYzlnovpn7PmlYjvvIznpoHmraJcIuWkp+S9oFwiXG4gICAgICAgICAgICBpZiAoY2FyZFNvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KGNhcmRTb3VuZClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g6aaW5Ye65L2G5rKh5pyJ5a+55bqU6Z+z5pWI5paH5Lu277yI5LiN5bqU6K+l5Y+R55Sf77yM5L2G5a6J5YWo5aSE55CG77yJXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+UiiBbX3BsYXlDYXJkU291bmRdIOKaoO+4jyDpppblh7rkvYbml6Dlr7nlupTpn7PmlYjmlofku7Y6IFwiICsgaGFuZFR5cGUgKyBcIiwgcmFuaz1cIiArIHJhbmspXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOmHjeimgeOAkemmluWHuuS4jeaSreaUvlwi5aSn5L2gXCLvvIzpnZnpu5jot7Pov4dcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjYW5CZWF0KSB7XG4gICAgICAgICAgICAvLyDinIXjgJDlnLrmma8y44CR5Y6L54mM5Zy65pmv77ya6ZqP5py65pKt5pS+77yINzAl54mM5Z6L77yMMzAl5aSn5L2g77yJXG4gICAgICAgICAgICBpZiAoaGFzU3BlY2lmaWNTb3VuZCAmJiBjYXJkU291bmQpIHtcbiAgICAgICAgICAgICAgICAvLyDpmo/mnLrpgInmi6nvvJo3MCXniYzlnovvvIwzMCXlpKfkvaBcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tVmFsdWUgPSBNYXRoLnJhbmRvbSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJhbmRvbVZhbHVlIDwgMC43KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDcwJSDmkq3mlL7niYzlnovpn7PmlYhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KGNhcmRTb3VuZClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyAzMCUg5pKt5pS+XCLlpKfkvaBcIlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3QoZGFuaVNvdW5kKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g6Z+z5pWI5paH5Lu257y65aSx77yM5pKt5pS+XCLlpKfkvaBcIlxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEVmZmVjdChkYW5pU291bmQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDinIXjgJDlnLrmma8z44CR5Y6L54mM5L2GY2FuX2JlYXQ9ZmFsc2XvvIjkuI3lupTor6Xlj5HnlJ/vvIzkvYblronlhajlpITnkIbvvIlcbiAgICAgICAgICAgIC8vIOi/meenjeaDheWGteeQhuiuuuS4iuS4jeW6lOivpeWHuueOsO+8jOWboOS4uuacjeWKoeerr+WPquWcqOaIkOWKn+WOi+eJjOaXtuiuvue9rmNhbl9iZWF0PXRydWVcbiAgICAgICAgICAgIGlmIChjYXJkU291bmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5U291bmRFZmZlY3QoY2FyZFNvdW5kKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfcGxheUNhcmRTb3VuZF0g4pqg77iPIOW8guW4uOWcuuaZr++8muWOi+eJjOS9hmNhbl9iZWF0PWZhbHNl5LiU5peg6Z+z5pWIXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeajgOafpeeJjOWei+aYr+WQpuacieWvueW6lOeahOmfs+aViOaWh+S7tlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHlop7liqDmm7TlpJrniYzlnovmlK/mjIHvvIznoa7kv53opobnm5bmnI3liqHnq6/miYDmnInniYzlnovlkI3np7BcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaGFuZFR5cGUgLSDniYzlnovlkI3np7BcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmFuayAtIOS4u+eJjOeCueaVsFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSDmmK/lkKbmnInlr7nlupTpn7PmlYjmlofku7ZcbiAgICAgKi9cbiAgICBfaGFzU3BlY2lmaWNDYXJkU291bmQ6IGZ1bmN0aW9uKGhhbmRUeXBlLCByYW5rKSB7XG4gICAgICAgIHZhciB0eXBlID0gKGhhbmRUeXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgdmFyIHNvdW5kSW5kZXggPSB0aGlzLl9yYW5rVG9Tb3VuZEluZGV4KHJhbmspXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g5Y2V5byg77ya5pyJMS0xNeeahOmfs+aViOaWh+S7tlxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi5Y2V5bygXCJcbiAgICAgICAgaWYgKHR5cGUgPT09IFwic2luZ2xlXCIgfHwgdHlwZSA9PT0gXCJzb2xvXCIgfHwgdHlwZS5pbmRleE9mKFwi5Y2V5bygXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdmFyIGhhc1NvdW5kID0gc291bmRJbmRleCA+PSAxICYmIHNvdW5kSW5kZXggPD0gMTVcbiAgICAgICAgICAgIHJldHVybiBoYXNTb3VuZFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlr7nlrZDvvJrlj6rmnIkxLTEz55qE6Z+z5pWI5paH5Lu277yI5rKh5pyJ5a+55a2QMTQvMTXvvIzlm6DkuLrlpKfnjovlsI/njovmsqHmnInlr7nlrZDpn7PmlYjvvIlcbiAgICAgICAgLy8g5pyN5Yqh56uv5Y+R6YCBOiBcIuWvueWtkFwiXG4gICAgICAgIGlmICh0eXBlID09PSBcInBhaXJcIiB8fCB0eXBlID09PSBcImRvdWJsZVwiIHx8IHR5cGUuaW5kZXhPZihcIuWvueWtkFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBoYXNTb3VuZCA9IHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDEzXG4gICAgICAgICAgICByZXR1cm4gaGFzU291bmRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5LiJ5byg77ya5Y+q5pyJMS0xM+eahOmfs+aViOaWh+S7tlxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi5LiJ5bygXCJcbiAgICAgICAgaWYgKHR5cGUgPT09IFwidHJpcGxlXCIgfHwgdHlwZSA9PT0gXCJ0aHJlZVwiIHx8IHR5cGUgPT09IFwidHJpb1wiIHx8IHR5cGUuaW5kZXhPZihcIuS4ieW8oFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBoYXNTb3VuZCA9IHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDEzXG4gICAgICAgICAgICByZXR1cm4gaGFzU291bmRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g54m55q6K54mM5Z6L6YO95pyJ5a+55bqU6Z+z5pWIXG4gICAgICAgIC8vIOacjeWKoeerr+WPkemAgTogXCLov57lr7lcIiwgXCLpobrlrZBcIiwgXCLpo57mnLpcIiwgXCLpo57mnLrluKbljZVcIiwgXCLpo57mnLrluKblr7lcIiwgXCLkuInluKbkuIBcIiwgXCLkuInluKbkuoxcIiwgXCLlm5vluKbkuoxcIiwgXCLlm5vluKbkuKTlr7lcIiwgXCLngrjlvLlcIiwgXCLnjovngrhcIlxuICAgICAgICB2YXIgc3BlY2lhbFR5cGVzID0gW1xuICAgICAgICAgICAgLy8g6Iux5paH5ZCN56ewXG4gICAgICAgICAgICBcImxpYW5kdWlcIiwgXCJzdHJhaWdodFwiLCBcInBsYW5lXCIsIFwiZmVpamlcIixcbiAgICAgICAgICAgIFwic2FuZGFpeWlcIiwgXCJzYW5kYWlkdWlcIiwgXCJzaWRhaWVyXCIsIFwic2lkYWlsaWFuZ2R1aVwiLFxuICAgICAgICAgICAgXCJib21iXCIsIFwiemhhZGFuXCIsIFwicm9ja2V0XCIsIFwid2FuZ3poYVwiLFxuICAgICAgICAgICAgLy8g5Lit5paH5ZCN56ew77yI5pyN5Yqh56uv5Y+R6YCB55qE5ZCN56ew77yJXG4gICAgICAgICAgICBcIui/nuWvuVwiLCBcIumhuuWtkFwiLCBcIumjnuaculwiLCBcIuS4ieW4puS4gFwiLCBcIuS4ieW4puS6jFwiLFxuICAgICAgICAgICAgXCLlm5vluKbkuoxcIiwgXCLlm5vluKbkuKTlr7lcIiwgXCLngrjlvLlcIiwgXCLnjovngrhcIlxuICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwZWNpYWxUeXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihzcGVjaWFsVHlwZXNbaV0pICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5qC45b+D5L+u5aSN44CR5LuO5pWw5o2u5Lit5o+Q5Y+W5Li754mM54K55pWwXG4gICAgICogXG4gICAgICog5LyY5YWI57qn77yaXG4gICAgICogMS4g5pyN5Yqh56uv5Lyg6YCS55qEIHJhbmvvvIjlpoLmnpzmnInmlYjvvIlcbiAgICAgKiAyLiDku44gY2FyZHMg5pWw57uE5Lit5o+Q5Y+W77yI5qC55o2u54mM5Z6L77yJXG4gICAgICogXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDmnI3liqHnq6/lub/mkq3nmoTmlbDmja5cbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSDkuLvniYzngrnmlbDvvIjmnI3liqHnq68gcmFuayDmoLzlvI/vvJozLTE377yJXG4gICAgICovXG4gICAgX2V4dHJhY3RNYWluUmFuazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvLyDkvJjlhYjkvb/nlKjmnI3liqHnq6/kvKDpgJLnmoQgcmFua1xuICAgICAgICBpZiAoZGF0YS5yYW5rICYmIGRhdGEucmFuayA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnJhbmtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWmguaenOacjeWKoeerryByYW5rIOaXoOaViO+8jOS7jiBjYXJkcyDkuK3mj5Dlj5ZcbiAgICAgICAgdmFyIGNhcmRzID0gZGF0YS5jYXJkcyB8fCBbXVxuICAgICAgICB2YXIgaGFuZFR5cGUgPSAoZGF0YS5oYW5kX3R5cGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKVxuXG4gICAgICAgIGlmIChjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCflIogW19leHRyYWN0TWFpblJhbmtdIGNhcmRz5pWw57uE5Li656m677yM5peg5rOV5o+Q5Y+WcmFua1wiKVxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWvuSBjYXJkcyDov5vooYzmjpLluo/vvIjku47lpKfliLDlsI/vvIlcbiAgICAgICAgdmFyIHNvcnRlZENhcmRzID0gY2FyZHMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiAoYi5yYW5rIHx8IDApIC0gKGEucmFuayB8fCAwKVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgLy8g5qC55o2u54mM5Z6L5o+Q5Y+W5Li754mMXG4gICAgICAgIC8vIOWNleW8oFxuICAgICAgICBpZiAoaGFuZFR5cGUuaW5kZXhPZihcInNpbmdsZVwiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcIuWNleW8oFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gdGhpcy5fZXh0cmFjdENhcmRSYW5rKHNvcnRlZENhcmRzWzBdKVxuICAgICAgICAgICAgcmV0dXJuIHJhbmtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWvueWtkCAtIOWPluS7u+aEj+S4gOW8oOeahHJhbmvvvIjlroPku6znm7jlkIzvvIlcbiAgICAgICAgaWYgKGhhbmRUeXBlLmluZGV4T2YoXCJwYWlyXCIpICE9PSAtMSB8fCBoYW5kVHlwZS5pbmRleE9mKFwi5a+55a2QXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSB0aGlzLl9leHRyYWN0Q2FyZFJhbmsoc29ydGVkQ2FyZHNbMF0pXG4gICAgICAgICAgICByZXR1cm4gcmFua1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5LiJ5bygIC0g5Y+W5LiJ5byg5Lit5Lu75oSP5LiA5byg55qEcmFua1xuICAgICAgICBpZiAoaGFuZFR5cGUuaW5kZXhPZihcInRyaXBsZVwiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcIuS4ieW8oFwiKSAhPT0gLTEgfHwgXG4gICAgICAgICAgICBoYW5kVHlwZS5pbmRleE9mKFwidHJpb1wiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcInRocmVlXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgdmFyIHJhbmsgPSB0aGlzLl9leHRyYWN0Q2FyZFJhbmsoc29ydGVkQ2FyZHNbMF0pXG4gICAgICAgICAgICByZXR1cm4gcmFua1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5LiJ5bim5LiAL+S4ieW4puS6jCAtIOWPluacgOWkp+eahOS4ieW8oFxuICAgICAgICBpZiAoaGFuZFR5cGUuaW5kZXhPZihcInNhbmRhaXlpXCIpICE9PSAtMSB8fCBoYW5kVHlwZS5pbmRleE9mKFwi5LiJ5bim5LiAXCIpICE9PSAtMSB8fFxuICAgICAgICAgICAgaGFuZFR5cGUuaW5kZXhPZihcInNhbmRhaWR1aVwiKSAhPT0gLTEgfHwgaGFuZFR5cGUuaW5kZXhPZihcIuS4ieW4puS6jFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vIOe7n+iuoeavj+S4qnJhbmvlh7rnjrDnmoTmrKHmlbBcbiAgICAgICAgICAgIHZhciBjb3VudHMgPSB7fVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXJkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByID0gY2FyZHNbaV0ucmFua1xuICAgICAgICAgICAgICAgIGNvdW50c1tyXSA9IChjb3VudHNbcl0gfHwgMCkgKyAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDmib7liLDlh7rnjrDmrKHmlbDmnIDlpJrnmoRyYW5rXG4gICAgICAgICAgICB2YXIgbWF4Q291bnQgPSAwXG4gICAgICAgICAgICB2YXIgbWFpblJhbmsgPSAwXG4gICAgICAgICAgICBmb3IgKHZhciByIGluIGNvdW50cykge1xuICAgICAgICAgICAgICAgIGlmIChjb3VudHNbcl0gPj0gMyAmJiBjb3VudHNbcl0gPiBtYXhDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhDb3VudCA9IGNvdW50c1tyXVxuICAgICAgICAgICAgICAgICAgICBtYWluUmFuayA9IHBhcnNlSW50KHIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1haW5SYW5rXG4gICAgICAgIH1cblxuICAgICAgICAvLyDlhbbku5bniYzlnosgLSDlj5bmnIDlpKfnmoTniYxcbiAgICAgICAgdmFyIHJhbmsgPSB0aGlzLl9leHRyYWN0Q2FyZFJhbmsoc29ydGVkQ2FyZHNbMF0pXG4gICAgICAgIHJldHVybiByYW5rXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDovoXliqnjgJHku47ljZXkuKpjYXJk5a+56LGh5Lit5o+Q5Y+WcmFua1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjYXJkIC0g5Y2h54mM5a+56LGhXG4gICAgICogQHJldHVybnMge051bWJlcn0gcmFua+WAvFxuICAgICAqL1xuICAgIF9leHRyYWN0Q2FyZFJhbms6IGZ1bmN0aW9uKGNhcmQpIHtcbiAgICAgICAgaWYgKCFjYXJkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZXh0cmFjdENhcmRSYW5rXSBjYXJk5Li656m6XCIpXG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5bCd6K+V5ZCE56eN5Y+v6IO955qE5a2X5q61XG4gICAgICAgIGlmIChjYXJkLnJhbmsgIT09IHVuZGVmaW5lZCAmJiBjYXJkLnJhbmsgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQucmFuaylcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FyZC52YWx1ZSAhPT0gdW5kZWZpbmVkICYmIGNhcmQudmFsdWUgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQudmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhcmQubG9naWNfdmFsdWUgIT09IHVuZGVmaW5lZCAmJiBjYXJkLmxvZ2ljX3ZhbHVlID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcihjYXJkLmxvZ2ljX3ZhbHVlKVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYXJkLmNhcmRfZGF0YSAmJiBjYXJkLmNhcmRfZGF0YS5yYW5rICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIoY2FyZC5jYXJkX2RhdGEucmFuaylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUud2FybihcIvCflIogW19leHRyYWN0Q2FyZFJhbmtdIOaXoOazleaPkOWPlnJhbmvvvIxjYXJkOlwiLCBKU09OLnN0cmluZ2lmeShjYXJkKSlcbiAgICAgICAgcmV0dXJuIDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaguOW/g+S/ruWkjeOAkeacjeWKoeerryByYW5rIOi9rOaNouS4uumfs+aViOaWh+S7tue8luWPt1xuICAgICAqIFxuICAgICAqIOacjeWKoeerryByYW5rIOWumuS5ie+8mlxuICAgICAqIC0gMy0xMCA9IDMtMTBcbiAgICAgKiAtIEo9MTEsIFE9MTIsIEs9MTMsIEE9MTQsIDI9MTVcbiAgICAgKiAtIOWwj+eOiz0xNiwg5aSn546LPTE3XG4gICAgICogXG4gICAgICog6Z+z5pWI5paH5Lu257yW5Y+377yaXG4gICAgICogLSAxID0gQVxuICAgICAqIC0gMiA9IDJcbiAgICAgKiAtIDMtMTMgPSAzLUtcbiAgICAgKiAtIDE0ID0g5bCP546LXG4gICAgICogLSAxNSA9IOWkp+eOi1xuICAgICAqIFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByYW5rIC0g5pyN5Yqh56uv54mM6Z2i5YC8ICgzLTE3KVxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IOmfs+aViOaWh+S7tue8luWPtyAoMS0xNSnvvIzlpoLmnpzml6Dms5XovazmjaLov5Tlm54gMFxuICAgICAqL1xuICAgIF9yYW5rVG9Tb3VuZEluZGV4OiBmdW5jdGlvbihyYW5rKSB7XG4gICAgICAgIGlmIChyYW5rID09PSAxNCkgcmV0dXJuIDEgICAvLyBBIOKGkiAxXG4gICAgICAgIGlmIChyYW5rID09PSAxNSkgcmV0dXJuIDIgICAvLyAyIOKGkiAyXG4gICAgICAgIGlmIChyYW5rID49IDMgJiYgcmFuayA8PSAxMykgcmV0dXJuIHJhbmsgIC8vIDMtSyDnm7TmjqXkvb/nlKhcbiAgICAgICAgaWYgKHJhbmsgPT09IDE2KSByZXR1cm4gMTQgIC8vIOWwj+eOiyDihpIgMTRcbiAgICAgICAgaWYgKHJhbmsgPT09IDE3KSByZXR1cm4gMTUgIC8vIOWkp+eOiyDihpIgMTVcbiAgICAgICAgcmV0dXJuIDAgIC8vIOaXoOaViFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SKIOagueaNrueJjOWei+iOt+WPlumfs+aViOWQjeensFxuICAgICAqIPCflKfjgJDkv67lpI3jgJHkvb/nlKggaW5kZXhPZiDljLnphY3kuK3mlofniYzlnovlkI3np7DvvIznoa7kv53lhbzlrrnmnI3liqHnq6/lj5HpgIHnmoTkuK3mloflkI3np7BcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaGFuZFR5cGUgLSDniYzlnovlkI3np7BcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmFuayAtIOS4u+eJjOeCueaVsCAo5pyN5Yqh56uv5a6a5LmJOiAzLTE3LCBBPTE0LCAyPTE1LCDlsI/njos9MTYsIOWkp+eOiz0xNylcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZ2VuZGVyIC0g5oCn5YirXG4gICAgICogQHJldHVybnMge1N0cmluZ30g6Z+z5pWI5ZCN56ew77yI5LiN5ZCr6Lev5b6E5ZKM5omp5bGV5ZCN77yJ77yM5aaC5p6c5rKh5pyJ5a+55bqU6Z+z5pWI6L+U5ZuebnVsbFxuICAgICAqL1xuICAgIF9nZXRDYXJkVHlwZVNvdW5kOiBmdW5jdGlvbihoYW5kVHlwZSwgcmFuaywgZ2VuZGVyKSB7XG4gICAgICAgIHZhciB0eXBlID0gKGhhbmRUeXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgdmFyIHByZWZpeCA9IGdlbmRlciA9PT0gXCJmZW1hbGVcIiA/IFwibV9jcF9udl9cIiA6IFwibV9jcF9cIlxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWQiOazleaAp+agoemqjOOAkeajgOafpXJhbmvmmK/lkKbmnInmlYhcbiAgICAgICAgaWYgKCFyYW5rIHx8IHJhbmsgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn5SKIFtfZ2V0Q2FyZFR5cGVTb3VuZF0g6Z2e5rOVcmFuazogXCIgKyByYW5rICsgXCIsIGhhbmRUeXBlPVwiICsgaGFuZFR5cGUpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5bCG5pyN5Yqh56uvIHJhbmsg6L2s5o2i5Li66Z+z5pWI5paH5Lu257yW5Y+3XG4gICAgICAgIHZhciBzb3VuZEluZGV4ID0gdGhpcy5fcmFua1RvU291bmRJbmRleChyYW5rKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOWNleW8oO+8iOaUr+aMgeS4reiLseaWh++8iVxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi5Y2V5bygXCJcbiAgICAgICAgLy8g6Z+z5pWI5paH5Lu257yW5Y+377yaMT1BLCAyPTIsIDMtMTM9My1LLCAxND3lsI/njossIDE1PeWkp+eOi1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJzaW5nbGVcIiB8fCB0eXBlID09PSBcInNvbG9cIiB8fCB0eXBlLmluZGV4T2YoXCLljZXlvKBcIikgIT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoc291bmRJbmRleCA+PSAxICYmIHNvdW5kSW5kZXggPD0gMTUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgXCJkYW56aGFuZ19cIiArIHNvdW5kSW5kZXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCflIogW19nZXRDYXJkVHlwZVNvdW5kXSDljZXlvKDpn7PmlYjntKLlvJXml6DmlYg6IHJhbms9XCIgKyByYW5rICsgXCIsIHNvdW5kSW5kZXg9XCIgKyBzb3VuZEluZGV4KVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5a+55a2Q77yI5pSv5oyB5Lit6Iux5paH77yJXG4gICAgICAgIC8vIOacjeWKoeerr+WPkemAgTogXCLlr7nlrZBcIlxuICAgICAgICAvLyDpn7PmlYjmlofku7bnvJblj7fvvJoxPUEsIDI9MiwgMy0xMz0zLUvvvIjms6jmhI/vvJrmlofku7blj6rmnIkxLTEz77yM5rKh5pyJMTQvMTXvvIlcbiAgICAgICAgaWYgKHR5cGUgPT09IFwicGFpclwiIHx8IHR5cGUgPT09IFwiZG91YmxlXCIgfHwgdHlwZS5pbmRleE9mKFwi5a+55a2QXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgaWYgKHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDEzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIFwiZHVpemlfXCIgKyBzb3VuZEluZGV4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZ2V0Q2FyZFR5cGVTb3VuZF0g5a+55a2Q6Z+z5pWI5paH5Lu25LiN5a2Y5ZyoOiByYW5rPVwiICsgcmFuayArIFwiLCBzb3VuZEluZGV4PVwiICsgc291bmRJbmRleClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOS4ieW8oO+8iOaUr+aMgeS4reiLseaWh++8iVxuICAgICAgICAvLyDmnI3liqHnq6/lj5HpgIE6IFwi5LiJ5bygXCJcbiAgICAgICAgLy8g6Z+z5pWI5paH5Lu257yW5Y+377yaMT1BLCAyPTIsIDMtMTM9My1L77yI5rOo5oSP77ya5paH5Lu25Y+q5pyJMS0xM++8iVxuICAgICAgICBpZiAodHlwZSA9PT0gXCJ0cmlwbGVcIiB8fCB0eXBlID09PSBcInRocmVlXCIgfHwgdHlwZSA9PT0gXCJ0cmlvXCIgfHwgdHlwZS5pbmRleE9mKFwi5LiJ5bygXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgaWYgKHNvdW5kSW5kZXggPj0gMSAmJiBzb3VuZEluZGV4IDw9IDEzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIFwic2FuZ2VfXCIgKyBzb3VuZEluZGV4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5SKIFtfZ2V0Q2FyZFR5cGVTb3VuZF0g5LiJ5byg6Z+z5pWI5paH5Lu25LiN5a2Y5ZyoOiByYW5rPVwiICsgcmFuayArIFwiLCBzb3VuZEluZGV4PVwiICsgc291bmRJbmRleClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnibnmrorniYzlnovmmKDlsITooajvvIjmlK/mjIHkuK3oi7HmlofvvIlcbiAgICAgICAgdmFyIHNwZWNpYWxUeXBlcyA9IHtcbiAgICAgICAgICAgIC8vIOiLseaWh+WQjeensFxuICAgICAgICAgICAgXCJsaWFuZHVpXCI6IFwibGlhbmR1aVwiLCAgICAgICAgICAgLy8g6L+e5a+5XG4gICAgICAgICAgICBcInN0cmFpZ2h0XCI6IFwic2h1bnppXCIsICAgICAgICAgICAvLyDpobrlrZBcbiAgICAgICAgICAgIFwicGxhbmVcIjogXCJmZWlqaVwiLCAgICAgICAgICAgICAgIC8vIOmjnuaculxuICAgICAgICAgICAgXCJmZWlqaVwiOiBcImZlaWppXCIsICAgICAgICAgICAgICAgLy8g6aOe5py6XG4gICAgICAgICAgICBcInNhbmRhaXlpXCI6IFwic2FuZGFpeWlcIiwgICAgICAgICAvLyDkuInluKbkuIBcbiAgICAgICAgICAgIFwic2FuZGFpZHVpXCI6IFwic2FuZGFpZHVpXCIsICAgICAgIC8vIOS4ieW4puWvuVxuICAgICAgICAgICAgXCJzaWRhaWVyXCI6IFwic2lkYWllclwiLCAgICAgICAgICAgLy8g5Zub5bim5LqMXG4gICAgICAgICAgICBcInNpZGFpbGlhbmdkdWlcIjogXCJzaWRhaWxpYW5nZHVpXCIsIC8vIOWbm+W4puS4pOWvuVxuICAgICAgICAgICAgXCJib21iXCI6IFwiemhhZGFuXCIsICAgICAgICAgICAgICAgLy8g54K45by5XG4gICAgICAgICAgICBcInpoYWRhblwiOiBcInpoYWRhblwiLCAgICAgICAgICAgICAvLyDngrjlvLlcbiAgICAgICAgICAgIFwicm9ja2V0XCI6IFwid2FuZ3poYVwiLCAgICAgICAgICAgIC8vIOeOi+eCuFxuICAgICAgICAgICAgXCJ3YW5nemhhXCI6IFwid2FuZ3poYVwiLCAgICAgICAgICAgLy8g546L54K4XG4gICAgICAgICAgICAvLyDkuK3mloflkI3np7DvvIjmnI3liqHnq6/lj5HpgIHnmoTlkI3np7DvvIlcbiAgICAgICAgICAgIFwi6L+e5a+5XCI6IFwibGlhbmR1aVwiLFxuICAgICAgICAgICAgXCLpobrlrZBcIjogXCJzaHVuemlcIixcbiAgICAgICAgICAgIFwi6aOe5py6XCI6IFwiZmVpamlcIixcbiAgICAgICAgICAgIFwi6aOe5py65bim5Y2VXCI6IFwiZmVpamlcIixcbiAgICAgICAgICAgIFwi6aOe5py65bim5a+5XCI6IFwiZmVpamlcIixcbiAgICAgICAgICAgIFwi5LiJ5bim5LiAXCI6IFwic2FuZGFpeWlcIixcbiAgICAgICAgICAgIFwi5LiJ5bim5LqMXCI6IFwic2FuZGFpZHVpXCIsXG4gICAgICAgICAgICBcIuWbm+W4puS6jFwiOiBcInNpZGFpZXJcIixcbiAgICAgICAgICAgIFwi5Zub5bim5Lik5a+5XCI6IFwic2lkYWlsaWFuZ2R1aVwiLFxuICAgICAgICAgICAgXCLngrjlvLlcIjogXCJ6aGFkYW5cIixcbiAgICAgICAgICAgIFwi546L54K4XCI6IFwid2FuZ3poYVwiXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOafpeaJvueJueauiueJjOWei1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc3BlY2lhbFR5cGVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IHNwZWNpYWxUeXBlc1trZXldXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWls+eJiOeCuOW8ueS9v+eUqCBtX2NwX252X3poYWRhbu+8iOWmguaenOWtmOWcqO+8ie+8jOWQpuWImeS9v+eUqOeUt+eJiFxuICAgICAgICAgICAgICAgIC8vIOazqOaEj++8muebruWJjSBtX2NwX252X3poYWRhbi5tcDMg5LiN5a2Y5Zyo77yM5omA5Lul5aWz54mI5Lmf5L2/55So55S354mI54K45by56Z+z5pWIXG4gICAgICAgICAgICAgICAgaWYgKHN1ZmZpeCA9PT0gXCJ6aGFkYW5cIikge1xuICAgICAgICAgICAgICAgICAgICAvLyDlhYjlsJ3or5XlpbPniYjngrjlvLnpn7PmlYhcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdlbmRlciA9PT0gXCJmZW1hbGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwibV9jcF96aGFkYW5cIiAgLy8g5aWz54mI5pqC5pe25L2/55So55S354mI54K45by56Z+z5pWI77yI5Zug5Li6bV9jcF9udl96aGFkYW7kuI3lrZjlnKjvvIlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJtX2NwX3poYWRhblwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlpbPniYjnjovngrjmnInljZXni6zpn7PmlYhcbiAgICAgICAgICAgICAgICBpZiAoc3VmZml4ID09PSBcIndhbmd6aGFcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgXCJ3YW5nemhhXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIHN1ZmZpeFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmnKrnn6XniYzlnovvvIzov5Tlm55udWxsXG4gICAgICAgIGNvbnNvbGUud2FybihcIvCflIogW19nZXRDYXJkVHlwZVNvdW5kXSDmnKrnn6XniYzlnos6IFwiICsgdHlwZSlcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmkq3mlL7kuI3lh7rpn7PmlYjvvIjpmo/mnLrmkq3mlL5cIuS4jeimgVwiL1wi6KaB5LiN6LW3XCLvvIlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOacjeWKoeerr+W5v+aSreeahOaVsOaNrlxuICAgICAqICAgLSBnZW5kZXI6IFwibWFsZVwiIC8gXCJmZW1hbGVcIlxuICAgICAqL1xuICAgIF9wbGF5UGFzc1NvdW5kOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICghaXNvcGVuX3NvdW5kKSByZXR1cm5cblxuICAgICAgICB2YXIgZ2VuZGVyID0gZGF0YS5nZW5kZXIgfHwgXCJtYWxlXCJcbiAgICAgICAgXG4gICAgICAgIC8vIOeUt+eJiO+8mumaj+acuuaSreaUvlwi5LiN6KaBXCLmiJZcIuimgeS4jei1t1wiXG4gICAgICAgIC8vIOaWh+S7tu+8mm1fY3BfYnV5YW8ubXAzLCBtX2NwX3lhb2J1cWkubXAzXG4gICAgICAgIC8vIOWls+eJiO+8mumaj+acuuaSreaUvlwi5LiN6KaBXCLmiJZcIuimgeS4jei1t1wiXG4gICAgICAgIC8vIOaWh+S7tu+8mm1fY3BfbnZfYnV5YW8ubXAzLCBtX252X3lhb2J1cWkud2F2XG4gICAgICAgIFxuICAgICAgICB2YXIgc291bmRzXG4gICAgICAgIGlmIChnZW5kZXIgPT09IFwiZmVtYWxlXCIpIHtcbiAgICAgICAgICAgIHNvdW5kcyA9IFtcIm1fY3BfbnZfYnV5YW9cIiwgXCJtX252X3lhb2J1cWlcIl1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvdW5kcyA9IFtcIm1fY3BfYnV5YW9cIiwgXCJtX2NwX3lhb2J1cWlcIl1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6ZqP5py66YCJ5oup5LiA5LiqXG4gICAgICAgIHZhciByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNvdW5kcy5sZW5ndGgpXG4gICAgICAgIHZhciBzb3VuZE5hbWUgPSBzb3VuZHNbcmFuZG9tSW5kZXhdXG5cbiAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KHNvdW5kTmFtZSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmkq3mlL7og5zliKkv5aSx6LSl6Z+z5pWIXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc1dpbiAtIOaYr+WQpuiDnOWIqVxuICAgICAqL1xuICAgIF9wbGF5R2FtZVJlc3VsdFNvdW5kOiBmdW5jdGlvbihpc1dpbikge1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIHNvdW5kTmFtZSA9IGlzV2luID8gXCJtX3lpbmdsZVwiIDogXCJtX3NodWxlXCJcbiAgICAgICAgdGhpcy5fcGxheVNvdW5kRWZmZWN0KHNvdW5kTmFtZSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UiiDmmL7npLrkuI3lh7rmlYjmnpxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWNjb3VudGlkIC0g546p5a62SURcbiAgICAgKi9cbiAgICBfc2hvd1Bhc3NFZmZlY3Q6IGZ1bmN0aW9uKGFjY291bnRpZCkge1xuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpSBub2RlLnBhcmVudCDmmK/lkKblrZjlnKhcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUgfHwgIXRoaXMubm9kZS5pc1ZhbGlkIHx8ICF0aGlzLm5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4OPIFtfc2hvd1Bhc3NFZmZlY3RdIG5vZGUg5oiWIG5vZGUucGFyZW50IOacquWumuS5ieaIluW3sumUgOavgVwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPluWvueW6lOeOqeWutueahOWHuueJjOWMuuWfn1xuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgIGlmICghZ2FtZVNjZW5lX3NjcmlwdCkgcmV0dXJuXG5cbiAgICAgICAgdmFyIG91dENhcmRfbm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQuZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoYWNjb3VudGlkKVxuICAgICAgICBpZiAoIW91dENhcmRfbm9kZSkgcmV0dXJuXG5cbiAgICAgICAgLy8g5riF56m65Ye654mM5Yy65Z+fXG4gICAgICAgIG91dENhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuXG4gICAgICAgIC8vIOWIm+W7ulwi5LiN5Ye6XCLmloflrZfmmL7npLpcbiAgICAgICAgdmFyIHBhc3NOb2RlID0gbmV3IGNjLk5vZGUoXCJwYXNzX2xhYmVsXCIpXG4gICAgICAgIHZhciBsYWJlbCA9IHBhc3NOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gXCLkuI3lh7pcIlxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDI4XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAzNlxuICAgICAgICBwYXNzTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDmj4/ovrlcbiAgICAgICAgdmFyIG91dGxpbmUgPSBwYXNzTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMTAwLCA1MCwgMClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIHBhc3NOb2RlLnBhcmVudCA9IG91dENhcmRfbm9kZVxuICAgICAgICBwYXNzTm9kZS5zZXRQb3NpdGlvbigwLCAwKVxuXG4gICAgICAgIC8vIDLnp5LlkI7oh6rliqjmtojlpLFcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAocGFzc05vZGUgJiYgcGFzc05vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHBhc3NOb2RlLmRlc3Ryb3koKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCAyKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6I635Y+W54mM55qE5pi+56S65ZCN56ewXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNhcmQgLSDniYzmlbDmja4ge3N1aXQsIHJhbmt9XG4gICAgICogQHJldHVybnMge1N0cmluZ30g54mM55qE5Lit5paH5ZCN56ew77yM5aaCIFwi5aSn546LXCLjgIFcIuWwj+eOi1wi44CBXCLpu5HmoYNBXCIg562JXG4gICAgICovXG4gICAgX2dldENhcmREaXNwbGF5TmFtZTogZnVuY3Rpb24oY2FyZCkge1xuICAgICAgICBpZiAoIWNhcmQpIHJldHVybiBcIuacquefpeeJjFwiXG4gICAgICAgIFxuICAgICAgICB2YXIgc3VpdCA9IGNhcmQuc3VpdFxuICAgICAgICB2YXIgcmFuayA9IGNhcmQucmFua1xuICAgICAgICBcbiAgICAgICAgLy8g5aSn5bCP546LXG4gICAgICAgIGlmIChyYW5rID09PSAxNykgcmV0dXJuIFwi5aSn546LXCJcbiAgICAgICAgaWYgKHJhbmsgPT09IDE2KSByZXR1cm4gXCLlsI/njotcIlxuICAgICAgICBcbiAgICAgICAgLy8g6Iqx6Imy5ZCN56ewXG4gICAgICAgIHZhciBzdWl0TmFtZXMgPSB7IDA6IFwi6buR5qGDXCIsIDE6IFwi57qi5b+DXCIsIDI6IFwi5qKF6IqxXCIsIDM6IFwi5pa55Z2XXCIsIDQ6IFwiXCIgfVxuICAgICAgICB2YXIgc3VpdE5hbWUgPSBzdWl0TmFtZXNbc3VpdF0gfHwgXCJcIlxuICAgICAgICBcbiAgICAgICAgLy8g54mM6Z2i5ZCN56ewXG4gICAgICAgIHZhciByYW5rTmFtZXMgPSB7XG4gICAgICAgICAgICAzOiBcIjNcIiwgNDogXCI0XCIsIDU6IFwiNVwiLCA2OiBcIjZcIiwgNzogXCI3XCIsIDg6IFwiOFwiLCA5OiBcIjlcIixcbiAgICAgICAgICAgIDEwOiBcIjEwXCIsIDExOiBcIkpcIiwgMTI6IFwiUVwiLCAxMzogXCJLXCIsIDE0OiBcIkFcIiwgMTU6IFwiMlwiXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJhbmtOYW1lID0gcmFua05hbWVzW3JhbmtdIHx8IFN0cmluZyhyYW5rKVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHN1aXROYW1lICsgcmFua05hbWVcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeWuouaIt+err+eJjOWei+mqjOivgVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkemqjOivgeeJjOWei+aYr+WQpuacieaViFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGNhcmRzIC0g6KaB6aqM6K+B55qE54mM5pWw5o2uIFt7c3VpdCwgcmFuaywgY29sb3J9LCAuLi5dXG4gICAgICogQHJldHVybnMge09iamVjdH0ge3ZhbGlkOiBib29sZWFuLCB0eXBlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZ31cbiAgICAgKi9cbiAgICBfdmFsaWRhdGVIYW5kVHlwZTogZnVuY3Rpb24oY2FyZHMpIHtcbiAgICAgICAgaWYgKCFjYXJkcyB8fCBjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgdHlwZTogXCJcIiwgbWVzc2FnZTogXCLor7fpgInmi6nopoHlh7rnmoTniYxcIiB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY291bnQgPSBjYXJkcy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIC8vIOe7n+iuoeWQhOeCueaVsOeahOeJjOaVsOmHj1xuICAgICAgICB2YXIgcmFua0NvdW50cyA9IHt9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByYW5rID0gY2FyZHNbaV0ucmFua1xuICAgICAgICAgICAgaWYgKCFyYW5rQ291bnRzW3JhbmtdKSB7XG4gICAgICAgICAgICAgICAgcmFua0NvdW50c1tyYW5rXSA9IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJhbmtDb3VudHNbcmFua10rK1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6I635Y+W54K55pWw5YiX6KGo77yI5o6S5bqP5ZCO77yJXG4gICAgICAgIHZhciByYW5rcyA9IE9iamVjdC5rZXlzKHJhbmtDb3VudHMpLm1hcChmdW5jdGlvbihyKSB7IHJldHVybiBwYXJzZUludChyKSB9KS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmlbDph4/nu5/orqFcbiAgICAgICAgdmFyIGNvdW50cyA9IE9iamVjdC52YWx1ZXMocmFua0NvdW50cylcbiAgICAgICAgdmFyIGZvdXJzID0gW10gIC8vIOWbm+W8oFxuICAgICAgICB2YXIgdGhyZWVzID0gW10gLy8g5LiJ5bygXG4gICAgICAgIHZhciBwYWlycyA9IFtdICAvLyDlr7nlrZBcbiAgICAgICAgdmFyIHNpbmdsZXMgPSBbXSAvLyDljZXlvKBcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIHJhbmsgaW4gcmFua0NvdW50cykge1xuICAgICAgICAgICAgdmFyIGMgPSByYW5rQ291bnRzW3JhbmtdXG4gICAgICAgICAgICBpZiAoYyA9PT0gNCkgZm91cnMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IDMpIHRocmVlcy5wdXNoKHBhcnNlSW50KHJhbmspKVxuICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gMikgcGFpcnMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IDEpIHNpbmdsZXMucHVzaChwYXJzZUludChyYW5rKSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEuIOeOi+eCuO+8iOWPjOeOi++8iVxuICAgICAgICBpZiAoY291bnQgPT09IDIgJiYgcmFua0NvdW50c1sxNl0gPT09IDEgJiYgcmFua0NvdW50c1sxN10gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIueOi+eCuFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIOWNleW8oFxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuWNleW8oFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDMuIOWvueWtkFxuICAgICAgICBpZiAoY291bnQgPT09IDIgJiYgcGFpcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLlr7nlrZBcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0LiDkuInlvKBcbiAgICAgICAgaWYgKGNvdW50ID09PSAzICYmIHRocmVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW8oFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIOeCuOW8uVxuICAgICAgICBpZiAoY291bnQgPT09IDQgJiYgZm91cnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLngrjlvLlcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA2LiDkuInluKbkuIBcbiAgICAgICAgaWYgKGNvdW50ID09PSA0ICYmIHRocmVlcy5sZW5ndGggPT09IDEgJiYgc2luZ2xlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW4puS4gFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDcuIOS4ieW4puS6jFxuICAgICAgICBpZiAoY291bnQgPT09IDUgJiYgdGhyZWVzLmxlbmd0aCA9PT0gMSAmJiBwYWlycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuS4ieW4puS6jFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDguIOWbm+W4puS6jO+8iOWNle+8iVxuICAgICAgICBpZiAoY291bnQgPT09IDYgJiYgZm91cnMubGVuZ3RoID09PSAxICYmIChzaW5nbGVzLmxlbmd0aCA9PT0gMiB8fCBwYWlycy5sZW5ndGggPT09IDEpKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLlm5vluKbkuoxcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyA5LiDlm5vluKbkuKTlr7lcbiAgICAgICAgaWYgKGNvdW50ID09PSA4ICYmIGZvdXJzLmxlbmd0aCA9PT0gMSAmJiBwYWlycy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIuWbm+W4puS4pOWvuVwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDEwLiDpobrlrZDvvIjoh7PlsJE15byg6L+e57ut77yM5LiN5YyF5ZCrMuWSjOeOi++8iVxuICAgICAgICBpZiAoY291bnQgPj0gNSAmJiBzaW5nbGVzLmxlbmd0aCA9PT0gY291bnQpIHtcbiAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpui/nue7reS4lOS4jeWMheWQqzLlkoznjotcbiAgICAgICAgICAgIHZhciBpc1NlcXVlbnRpYWwgPSB0aGlzLl9pc1NlcXVlbnRpYWwocmFua3MpXG4gICAgICAgICAgICB2YXIgbm9Ud29Pckpva2VyID0gcmFua3MuZXZlcnkoZnVuY3Rpb24ocikgeyByZXR1cm4gciA8IDE1IH0pIC8vIHJhbmsgPCAxNSDooajnpLrkuI3mmK8y5ZKM546LXG4gICAgICAgICAgICBpZiAoaXNTZXF1ZW50aWFsICYmIG5vVHdvT3JKb2tlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCB0eXBlOiBcIumhuuWtkFwiLCBtZXNzYWdlOiBcIlwiIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDExLiDov57lr7nvvIjoh7PlsJEz5a+56L+e57ut77yJXG4gICAgICAgIGlmIChjb3VudCA+PSA2ICYmIGNvdW50ICUgMiA9PT0gMCAmJiBwYWlycy5sZW5ndGggPT09IGNvdW50IC8gMikge1xuICAgICAgICAgICAgdmFyIHBhaXJSYW5rcyA9IHBhaXJzLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICAgICAgICAgIHZhciBpc1NlcXVlbnRpYWwgPSB0aGlzLl9pc1NlcXVlbnRpYWwocGFpclJhbmtzKVxuICAgICAgICAgICAgdmFyIG5vVHdvT3JKb2tlciA9IHBhaXJSYW5rcy5ldmVyeShmdW5jdGlvbihyKSB7IHJldHVybiByIDwgMTUgfSlcbiAgICAgICAgICAgIGlmIChpc1NlcXVlbnRpYWwgJiYgbm9Ud29Pckpva2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIHR5cGU6IFwi6L+e5a+5XCIsIG1lc3NhZ2U6IFwiXCIgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gMTIuIOmjnuacuu+8iOiHs+WwkTLkuKrov57nu63kuInlvKDvvIlcbiAgICAgICAgaWYgKHRocmVlcy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgdmFyIHRocmVlUmFua3MgPSB0aHJlZXMuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgICAgICAgICAgdmFyIGlzU2VxdWVudGlhbCA9IHRoaXMuX2lzU2VxdWVudGlhbCh0aHJlZVJhbmtzKVxuICAgICAgICAgICAgdmFyIG5vVHdvT3JKb2tlciA9IHRocmVlUmFua3MuZXZlcnkoZnVuY3Rpb24ocikgeyByZXR1cm4gciA8IDE1IH0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpc1NlcXVlbnRpYWwgJiYgbm9Ud29Pckpva2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVlQ291bnQgPSB0aHJlZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6aOe5py65LiN5bim57+F6IaAXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSB0aHJlZUNvdW50ICogMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLpo57mnLpcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOmjnuacuuW4puWNlVxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gdGhyZWVDb3VudCAqIDQgJiYgc2luZ2xlcy5sZW5ndGggPT09IHRocmVlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIHR5cGU6IFwi6aOe5py65bim5Y2VXCIsIG1lc3NhZ2U6IFwiXCIgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDpo57mnLrluKblr7lcbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IHRocmVlQ291bnQgKiA1ICYmIHBhaXJzLmxlbmd0aCA9PT0gdGhyZWVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdHlwZTogXCLpo57mnLrluKblr7lcIiwgbWVzc2FnZTogXCJcIiB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5peg5pWI54mM5Z6LXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgdHlwZTogXCJcIiwgbWVzc2FnZTogXCLml6DmlYjnmoTniYzlnovvvIzor7fph43mlrDpgInmi6lcIiB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOajgOafpeeCueaVsOaYr+WQpui/nue7rVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHJhbmtzIC0g5o6S5bqP5ZCO55qE54K55pWw5pWw57uEXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IOaYr+WQpui/nue7rVxuICAgICAqL1xuICAgIF9pc1NlcXVlbnRpYWw6IGZ1bmN0aW9uKHJhbmtzKSB7XG4gICAgICAgIGlmICghcmFua3MgfHwgcmFua3MubGVuZ3RoIDwgMikgcmV0dXJuIHRydWVcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcmFua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyYW5rc1tpXSAtIHJhbmtzW2ktMV0gIT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR57uT566X5by556qX57O757ufXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDwn4+GIOaYvuekuua4uOaIj+e7k+eul+W8ueeql1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g5pyN5Yqh56uv5bm/5pKt55qE57uT566X5pWw5o2uXG4gICAgICovXG4gICAgX3Nob3dHYW1lUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDjgJDnq57mioDlnLrjgJHmo4Dmn6XmmK/lkKbmmK/nq57mioDlnLrmqKHlvI9cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGlmICh0aGlzLl9pc0NvbXBldGl0aW9uIHx8IGRhdGEucm9vbV9jYXRlZ29yeSA9PT0gMikge1xuICAgICAgICAgICAgLy8g56ue5oqA5Zy65qih5byP5L2/55So54m55q6K55qE57uT566X6aG1XG4gICAgICAgICAgICB0aGlzLl9zaG93Q29tcGV0aXRpb25SZXN1bHRQb3B1cChkYXRhKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWIpOaWreW9k+WJjeeOqeWutuaYr+WQpuiDnOWIqVxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKCkuaWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuICAgICAgICB2YXIgaXNXaW5uZXIgPSBmYWxzZVxuICAgICAgICB2YXIgbXlXaW5Hb2xkID0gMFxuICAgICAgICBcbiAgICAgICAgLy8g5LuOIHBsYXllcnMg5pWw57uE5Lit5om+5Yiw5b2T5YmN546p5a6255qE57uT5p6cXG4gICAgICAgIGlmIChkYXRhLnBsYXllcnMgJiYgZGF0YS5wbGF5ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyc1tpXVxuICAgICAgICAgICAgICAgIGlmIChTdHJpbmcocGxheWVyLnBsYXllcl9pZCkgPT09IFN0cmluZyhteVBsYXllcklkKSkge1xuICAgICAgICAgICAgICAgICAgICBpc1dpbm5lciA9IHBsYXllci5pc193aW5uZXJcbiAgICAgICAgICAgICAgICAgICAgbXlXaW5Hb2xkID0gcGxheWVyLndpbl9nb2xkXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5YW85a655pen54mI5pys77ya6YCa6L+HIHdpbm5lcl9pZCDliKTmlq1cbiAgICAgICAgICAgIGlzV2lubmVyID0gU3RyaW5nKGRhdGEud2lubmVyX2lkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpXG4gICAgICAgICAgICBpZiAoIWlzV2lubmVyICYmICFkYXRhLmlzX2xhbmRsb3JkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzTGFuZGxvcmQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLm1hc3Rlcl9hY2NvdW50aWQgPT09IG15UGxheWVySWRcbiAgICAgICAgICAgICAgICBpZiAoIWlzTGFuZGxvcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNXaW5uZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5pu05paw5pys5Zyw546p5a6255qE6YeR5biB5pWw6YePXG4gICAgICAgIGlmIChteWdsb2JhbC5wbGF5ZXJEYXRhICYmIG15V2luR29sZCAhPT0gMCkge1xuICAgICAgICAgICAgdmFyIG9sZEdvbGQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50IHx8IDBcbiAgICAgICAgICAgIHZhciBuZXdHb2xkID0gb2xkR29sZCArIG15V2luR29sZFxuICAgICAgICAgICAgLy8g56Gu5L+d6YeR5biB5LiN5Li66LSf5pWwXG4gICAgICAgICAgICBpZiAobmV3R29sZCA8IDApIHtcbiAgICAgICAgICAgICAgICBuZXdHb2xkID0gMFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IG5ld0dvbGRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeabtOaWsOaJgOacieeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICBpZiAoZGF0YS5wbGF5ZXJzICYmIGRhdGEucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcnNbaV1cbiAgICAgICAgICAgICAgICB2YXIgcGxheWVySWQgPSBwbGF5ZXIucGxheWVyX2lkXG4gICAgICAgICAgICAgICAgdmFyIGdvbGRBZnRlciA9IHBsYXllci5nb2xkX2FmdGVyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWPquimgSBnb2xkQWZ0ZXIgPj0gMCDlsLHmm7TmlrDmmL7npLrvvIjljIXmi6wgMCDnmoTmg4XlhrXvvIlcbiAgICAgICAgICAgICAgICAvLyDmnI3liqHnq6/ov5Tlm57nmoQgZ29sZF9hZnRlciA+PSAwIOihqOekuuafpeivouWIsOS6huacieaViOaVsOaNrlxuICAgICAgICAgICAgICAgIGlmIChnb2xkQWZ0ZXIgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJHb2xkRGlzcGxheShwbGF5ZXJJZCwgZ29sZEFmdGVyKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOacjeWKoeerr+ayoeaciei/lOWbnuacieaViOeahCBnb2xkX2FmdGVy77yM5YiZ5pys5Zyw6K6h566XXG4gICAgICAgICAgICAgICAgICAgIC8vIOi/meenjeaDheWGteS4i++8jOWPquabtOaWsOW9k+WJjeeOqeWutueahOmHkeW4gVxuICAgICAgICAgICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllcklkKSA9PT0gU3RyaW5nKG15UGxheWVySWQpICYmIG15V2luR29sZCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsR29sZCA9IG15Z2xvYmFsLnBsYXllckRhdGEuZ29iYWxfY291bnQgfHwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGxheWVyR29sZERpc3BsYXkocGxheWVySWQsIGxvY2FsR29sZClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pKt5pS+57uT5p6c6Z+z5pWIXG4gICAgICAgIHRoaXMuX3BsYXlHYW1lUmVzdWx0U291bmQoaXNXaW5uZXIpXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rnu5PnrpflvLnnqpdcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHRoaXMuX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cChkYXRhLCBpc1dpbm5lciwgbXlXaW5Hb2xkLCBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwiY29udGludWVcIikge1xuICAgICAgICAgICAgICAgIC8vIOe7p+e7rea4uOaIj++8muWPkemAgSByZWFkeSDor7fmsYJcbiAgICAgICAgICAgICAgICBzZWxmLl9jb250aW51ZUdhbWUoKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFwibG9iYnlcIikge1xuICAgICAgICAgICAgICAgIC8vIOi/lOWbnuWkp+WOhVxuICAgICAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn4+GIOWIm+W7uue7k+eul+W8ueeql1VJIC0g5qyi5LmQ5paX5Zyw5Li76auY57qn6aOO5qC8XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDnu5PnrpfmlbDmja5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzV2lubmVyIC0g5piv5ZCm6IOc5YipXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG15V2luR29sZCAtIOW9k+WJjeeOqeWutui+k+i1ouixhuWtkFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0g5Zue6LCD5Ye95pWwXG4gICAgICovXG4gICAgX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cDogZnVuY3Rpb24oZGF0YSwgaXNXaW5uZXIsIG15V2luR29sZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeaJvuWIsENhbnZhc+iKgueCueS9nOS4uuW8ueeql+eItuiKgueCuVxuICAgICAgICB2YXIgY2FudmFzID0gY2MuZmluZChcIkNhbnZhc1wiKSB8fCBjYy5maW5kKFwiVUlfUk9PVFwiKSB8fCB0aGlzLm5vZGUucGFyZW50XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+PhiBbX2NyZWF0ZUdhbWVSZXN1bHRQb3B1cF0g5om+5LiN5YiwQ2FudmFz6IqC54K5XCIpXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLm5vZGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g6YGu572p5bGCID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKClcbiAgICAgICAgbWFza05vZGUubmFtZSA9IFwiR2FtZVJlc3VsdE1hc2tcIlxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgdmFyIG1hc2tTcHJpdGUgPSBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBtYXNrU3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgbWFza1Nwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0lNUExFXG4gICAgICAgIG1hc2tTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgIG1hc2tOb2RlLndpZHRoID0gd2luU2l6ZS53aWR0aCAqIDJcbiAgICAgICAgbWFza05vZGUuaGVpZ2h0ID0gd2luU2l6ZS5oZWlnaHQgKiAyXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBtYXNrTm9kZS5jb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDAsIDAsIDMwKSA6IG5ldyBjYy5Db2xvcigzMCwgMCwgMClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDBcbiAgICAgICAgbWFza05vZGUueCA9IDBcbiAgICAgICAgbWFza05vZGUueSA9IDBcbiAgICAgICAgbWFza05vZGUuekluZGV4ID0gOTk5ICAvLyDwn5Sn44CQ5L+u5aSN44CR6YGu572p5bGCekluZGV4XG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5reh5YWl5Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKG1hc2tOb2RlKS50bygwLjMsIHsgb3BhY2l0eTogMjU1IH0pLnN0YXJ0KClcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW8ueeql+WuueWZqCA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgcG9wdXBOb2RlID0gbmV3IGNjLk5vZGUoKVxuICAgICAgICBwb3B1cE5vZGUubmFtZSA9IFwiR2FtZVJlc3VsdFBvcHVwXCJcbiAgICAgICAgcG9wdXBOb2RlLnggPSAwXG4gICAgICAgIHBvcHVwTm9kZS55ID0gMFxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwICAvLyDwn5Sn44CQ5L+u5aSN44CR5by556qX5bGCekluZGV4XG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+WwuuWvuO+8iDcwJeWuve+8jDc1JemrmO+8iVxuICAgICAgICB2YXIgcG9wdXBXaWR0aCA9IE1hdGgubWluKHdpblNpemUud2lkdGggKiAwLjcsIDgwMClcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gTWF0aC5taW4od2luU2l6ZS5oZWlnaHQgKiAwLjc1LCA1NTApXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDkuLvog4zmma8gLSDmuJDlj5jmlYjmnpwgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGJnTm9kZSA9IHNlbGYuX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZChwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgaXNXaW5uZXIpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOmHkei+ueaPj+i+uSA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgYm9yZGVyTm9kZSA9IHNlbGYuX2NyZWF0ZUdvbGRlbkJvcmRlcihwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgaXNXaW5uZXIpXG4gICAgICAgIGJvcmRlck5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnspLlrZDnibnmlYjlsYIgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGVmZmVjdExheWVyID0gbmV3IGNjLk5vZGUoXCJFZmZlY3RMYXllclwiKVxuICAgICAgICBlZmZlY3RMYXllci5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDnOWIqeeykuWtkOeJueaViFxuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX2NyZWF0ZVZpY3RvcnlQYXJ0aWNsZXMoZWZmZWN0TGF5ZXIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5fY3JlYXRlRGVmZWF0UGFydGljbGVzKGVmZmVjdExheWVyLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g6aG26YOoIEJhbm5lciA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgYmFubmVyWSA9IHBvcHVwSGVpZ2h0IC8gMiAtIDYwXG4gICAgICAgIHZhciBiYW5uZXJOb2RlID0gc2VsZi5fY3JlYXRlUmVzdWx0QmFubmVyKGlzV2lubmVyLCBwb3B1cFdpZHRoKVxuICAgICAgICBiYW5uZXJOb2RlLnkgPSBiYW5uZXJZXG4gICAgICAgIGJhbm5lck5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlj7PkvqflgI3mlbDor6bmg4XljaEgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGRldGFpbFggPSBwb3B1cFdpZHRoIC8gMiAtIDEzMFxuICAgICAgICB2YXIgZGV0YWlsWSA9IDIwXG4gICAgICAgIHZhciBkZXRhaWxOb2RlID0gc2VsZi5fY3JlYXRlTXVsdGlwbGllckRldGFpbENhcmQoZGF0YSwgaXNXaW5uZXIpXG4gICAgICAgIGRldGFpbE5vZGUueCA9IGRldGFpbFhcbiAgICAgICAgZGV0YWlsTm9kZS55ID0gZGV0YWlsWVxuICAgICAgICBkZXRhaWxOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5Lit6Ze0546p5a6257uT5p6c5YiX6KGoID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBsaXN0V2lkdGggPSBwb3B1cFdpZHRoICogMC41NVxuICAgICAgICB2YXIgbGlzdFggPSAtcG9wdXBXaWR0aCAvIDIgKyBsaXN0V2lkdGggLyAyICsgNTBcbiAgICAgICAgdmFyIGxpc3RZID0gLTIwXG4gICAgICAgIHZhciBwbGF5ZXJMaXN0Tm9kZSA9IHNlbGYuX2NyZWF0ZVBsYXllclJlc3VsdExpc3QoZGF0YSwgaXNXaW5uZXIsIG15V2luR29sZCwgbGlzdFdpZHRoKVxuICAgICAgICBwbGF5ZXJMaXN0Tm9kZS54ID0gbGlzdFhcbiAgICAgICAgcGxheWVyTGlzdE5vZGUueSA9IGxpc3RZXG4gICAgICAgIHBsYXllckxpc3ROb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5bqV6YOo5oyJ6ZKu5Yy65Z+fID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBidG5ZID0gLXBvcHVwSGVpZ2h0IC8gMiArIDYwXG4gICAgICAgIHZhciBidXR0b25BcmVhID0gc2VsZi5fY3JlYXRlQnV0dG9uQXJlYShpc1dpbm5lciwgZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxmLl9jbG9zZUdhbWVSZXN1bHRQb3B1cChwb3B1cE5vZGUsIG1hc2tOb2RlKVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhhY3Rpb24pXG4gICAgICAgIH0pXG4gICAgICAgIGJ1dHRvbkFyZWEueSA9IGJ0bllcbiAgICAgICAgYnV0dG9uQXJlYS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW8ueWHuuWKqOeUuyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4zNSwgeyBzY2FsZTogMSwgb3BhY2l0eTogMjU1IH0sIHsgZWFzaW5nOiAnYmFja091dCcgfSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIOinpuWPkeaVsOWtl+a7muWKqOWKqOeUu1xuICAgICAgICAgICAgICAgIHNlbGYuX3N0YXJ0TnVtYmVyQW5pbWF0aW9ucyhwb3B1cE5vZGUsIGRhdGEsIG15V2luR29sZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y5byV55SoXG4gICAgICAgIHRoaXMuX2dhbWVSZXN1bHRQb3B1cCA9IHBvcHVwTm9kZVxuICAgICAgICB0aGlzLl9nYW1lUmVzdWx0TWFzayA9IG1hc2tOb2RlXG4gICAgICAgIHRoaXMuX3Jlc3VsdEVmZmVjdExheWVyID0gZWZmZWN0TGF5ZXJcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+OqCDnu5PnrpflvLnnqpfop4bop4nnu4Tku7YgLSDpq5jnuqfmlYjmnpxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCfjqgg5Yib5bu65riQ5Y+Y6IOM5pmvXG4gICAgICovXG4gICAgX2NyZWF0ZUdyYWRpZW50QmFja2dyb3VuZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiR3JhZGllbnRCZ1wiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBcbiAgICAgICAgLy8g5riQ5Y+Y6ImyXG4gICAgICAgIHZhciB0b3BDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDQwLCAzMCwgODAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMzAsIDMwLCA0MCwgMjU1KVxuICAgICAgICB2YXIgYm90dG9tQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyMCwgMTUsIDUwLCAyNTUpIDogbmV3IGNjLkNvbG9yKDIwLCAyMCwgMzAsIDI1NSlcbiAgICAgICAgXG4gICAgICAgIC8vIOe7mOWItua4kOWPmOefqeW9ou+8iOaooeaLn++8iVxuICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBib3R0b21Db2xvclxuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgMjApXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5YaF5Y+R5YWJ5pWI5p6cXG4gICAgICAgIHZhciBpbm5lckdsb3cgPSBuZXcgY2MuTm9kZShcIklubmVyR2xvd1wiKVxuICAgICAgICB2YXIgZ2xvd1Nwcml0ZSA9IGlubmVyR2xvdy5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBnbG93U3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgZ2xvd1Nwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0xJQ0VEXG4gICAgICAgIGlubmVyR2xvdy53aWR0aCA9IHdpZHRoIC0gMjBcbiAgICAgICAgaW5uZXJHbG93LmhlaWdodCA9IGhlaWdodCAtIDIwXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBpbm5lckdsb3cuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcig2MCwgNDAsIDEwMCkgOiBuZXcgY2MuQ29sb3IoNDAsIDQwLCA1MClcbiAgICAgICAgaW5uZXJHbG93Lm9wYWNpdHkgPSAxMDBcbiAgICAgICAgaW5uZXJHbG93LnBhcmVudCA9IGJnTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6IOM5pmv57q555CG5pWI5p6cXG4gICAgICAgIHZhciBvdmVybGF5ID0gbmV3IGNjLk5vZGUoXCJPdmVybGF5XCIpXG4gICAgICAgIHZhciBvdmVybGF5U3ByaXRlID0gb3ZlcmxheS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBvdmVybGF5U3ByaXRlLnNwcml0ZUZyYW1lID0gbmV3IGNjLlNwcml0ZUZyYW1lKClcbiAgICAgICAgb3ZlcmxheS53aWR0aCA9IHdpZHRoXG4gICAgICAgIG92ZXJsYXkuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3pgJrov4djb2xvcuiuvue9rmFscGhh77yM5L2/55Sob3BhY2l0eeS7o+abv1xuICAgICAgICBvdmVybGF5LmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoODAsIDUwLCAxMjApIDogbmV3IGNjLkNvbG9yKDUwLCA1MCwgNjApXG4gICAgICAgIG92ZXJsYXkub3BhY2l0eSA9IDMwXG4gICAgICAgIG92ZXJsYXkucGFyZW50ID0gYmdOb2RlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYmdOb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfjqgg5Yib5bu66YeR6L655o+P6L65XG4gICAgICovXG4gICAgX2NyZWF0ZUdvbGRlbkJvcmRlcjogZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGJvcmRlck5vZGUgPSBuZXcgY2MuTm9kZShcIkdvbGRlbkJvcmRlclwiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBib3JkZXJOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgXG4gICAgICAgIC8vIOi+ueahhuminOiJslxuICAgICAgICB2YXIgYm9yZGVyQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgNTAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEyMCwgMjU1KVxuICAgICAgICB2YXIgZ2xvd0NvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMjU1LCAxODAsIDAsIDE1MCkgOiBuZXcgY2MuQ29sb3IoODAsIDgwLCAxMDAsIDEwMClcbiAgICAgICAgXG4gICAgICAgIC8vIOWkluWPkeWFiVxuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IGdsb3dDb2xvclxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSA4XG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtd2lkdGgvMiAtIDQsIC1oZWlnaHQvMiAtIDQsIHdpZHRoICsgOCwgaGVpZ2h0ICsgOCwgMjQpXG4gICAgICAgIGdyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIFxuICAgICAgICAvLyDkuLvovrnmoYZcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBib3JkZXJDb2xvclxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAzXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCAyMClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgXG4gICAgICAgIC8vIOinkuiQveijhemlsFxuICAgICAgICB2YXIgY29ybmVyU2l6ZSA9IDMwXG4gICAgICAgIHZhciBjb3JuZXJzID0gW1xuICAgICAgICAgICAgeyB4OiAtd2lkdGgvMiwgeTogaGVpZ2h0LzIsIHJvdDogMCB9LFxuICAgICAgICAgICAgeyB4OiB3aWR0aC8yLCB5OiBoZWlnaHQvMiwgcm90OiA5MCB9LFxuICAgICAgICAgICAgeyB4OiB3aWR0aC8yLCB5OiAtaGVpZ2h0LzIsIHJvdDogMTgwIH0sXG4gICAgICAgICAgICB7IHg6IC13aWR0aC8yLCB5OiAtaGVpZ2h0LzIsIHJvdDogMjcwIH1cbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3JuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29ybmVyID0gY29ybmVyc1tpXVxuICAgICAgICAgICAgdmFyIGRlY29yTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29ybmVyX1wiICsgaSlcbiAgICAgICAgICAgIHZhciBkZyA9IGRlY29yTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgICAgICBkZy5zdHJva2VDb2xvciA9IGJvcmRlckNvbG9yXG4gICAgICAgICAgICBkZy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBkZy5tb3ZlVG8oMCwgMClcbiAgICAgICAgICAgIGRnLmxpbmVUbyhjb3JuZXJTaXplLCAwKVxuICAgICAgICAgICAgZGcubGluZVRvKGNvcm5lclNpemUsIGNvcm5lclNpemUpXG4gICAgICAgICAgICBkZy5zdHJva2UoKVxuICAgICAgICAgICAgZGVjb3JOb2RlLnggPSBjb3JuZXIueFxuICAgICAgICAgICAgZGVjb3JOb2RlLnkgPSBjb3JuZXIueVxuICAgICAgICAgICAgZGVjb3JOb2RlLmFuZ2xlID0gY29ybmVyLnJvdFxuICAgICAgICAgICAgZGVjb3JOb2RlLnBhcmVudCA9IGJvcmRlck5vZGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJvcmRlck5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+PhiDliJvlu7rnu5PmnpxCYW5uZXLvvIjog5zliKkv5aSx6LSl5qCH6aKY77yJXG4gICAgICovXG4gICAgX2NyZWF0ZVJlc3VsdEJhbm5lcjogZnVuY3Rpb24oaXNXaW5uZXIsIHBvcHVwV2lkdGgpIHtcbiAgICAgICAgdmFyIGJhbm5lck5vZGUgPSBuZXcgY2MuTm9kZShcIlJlc3VsdEJhbm5lclwiKVxuICAgICAgICBcbiAgICAgICAgLy8gQmFubmVy6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJhbm5lckJnXCIpXG4gICAgICAgIHZhciBncmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIHZhciBiYW5uZXJXaWR0aCA9IHBvcHVwV2lkdGggKiAwLjZcbiAgICAgICAgdmFyIGJhbm5lckhlaWdodCA9IDcwXG4gICAgICAgIFxuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIC8vIOiDnOWIqSAtIOmHkeiJsua4kOWPmOiDjOaZr1xuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDIwMCwgMTUwLCAzMCwgMjAwKVxuICAgICAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1iYW5uZXJXaWR0aC8yLCAtYmFubmVySGVpZ2h0LzIsIGJhbm5lcldpZHRoLCBiYW5uZXJIZWlnaHQsIDM1KVxuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWPkeWFiei+ueahhlxuICAgICAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDEwMCwgMjU1KVxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gM1xuICAgICAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1iYW5uZXJXaWR0aC8yLCAtYmFubmVySGVpZ2h0LzIsIGJhbm5lcldpZHRoLCBiYW5uZXJIZWlnaHQsIDM1KVxuICAgICAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWksei0pSAtIOaal+e6ouiJsuiDjOaZr1xuICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCA0MCwgNTAsIDIwMClcbiAgICAgICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtYmFubmVyV2lkdGgvMiwgLWJhbm5lckhlaWdodC8yLCBiYW5uZXJXaWR0aCwgYmFubmVySGVpZ2h0LCAzNSlcbiAgICAgICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigxNTAsIDEwMCwgMTAwLCAyNTUpXG4gICAgICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWJhbm5lcldpZHRoLzIsIC1iYW5uZXJIZWlnaHQvMiwgYmFubmVyV2lkdGgsIGJhbm5lckhlaWdodCwgMzUpXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2UoKVxuICAgICAgICB9XG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBiYW5uZXJOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpopjmloflrZdcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIilcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IGlzV2lubmVyID8gXCLwn4+GIOiDnCDliKkg8J+PhlwiIDogXCLinJYg5aSxIOi0pSDinJZcIlxuICAgICAgICB0aXRsZUxhYmVsLmZvbnRTaXplID0gNDJcbiAgICAgICAgdGl0bGVMYWJlbC5saW5lSGVpZ2h0ID0gNTBcbiAgICAgICAgdGl0bGVMYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIHRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZUxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KSA6IG5ldyBjYy5Db2xvcigyMDAsIDE4MCwgMTgwKVxuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5o+P6L65XG4gICAgICAgIHZhciBvdXRsaW5lID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigxNTAsIDEwMCwgMCkgOiBuZXcgY2MuQ29sb3IoODAsIDQwLCA0MClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDNcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWPkeWFieaViOaenO+8iOS9v+eUqOmYtOW9seaooeaLn++8iVxuICAgICAgICB2YXIgc2hhZG93ID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbFNoYWRvdylcbiAgICAgICAgc2hhZG93LmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDAsIDIwMCkgOiBuZXcgY2MuQ29sb3IoMTAwLCA1MCwgNTAsIDE1MClcbiAgICAgICAgc2hhZG93Lm9mZnNldCA9IGNjLnYyKDAsIDApXG4gICAgICAgIHNoYWRvdy5ibHVyID0gOFxuICAgICAgICBcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IGJhbm5lck5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDnOWIqeaXtueahOWRvOWQuOWPkeWFieWKqOeUu1xuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGJhbm5lck5vZGUpXG4gICAgICAgICAgICAgICAgLnJlcGVhdEZvcmV2ZXIoXG4gICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50bygxLjAsIHsgc2NhbGU6IDEuMDIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50bygxLjAsIHsgc2NhbGU6IDEuMCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYmFubmVyTm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5OKIOWIm+W7uuWAjeaVsOivpuaDheWNoVxuICAgICAqL1xuICAgIF9jcmVhdGVNdWx0aXBsaWVyRGV0YWlsQ2FyZDogZnVuY3Rpb24oZGF0YSwgaXNXaW5uZXIpIHtcbiAgICAgICAgdmFyIGNhcmROb2RlID0gbmV3IGNjLk5vZGUoXCJNdWx0aXBsaWVyQ2FyZFwiKVxuICAgICAgICB2YXIgY2FyZFdpZHRoID0gMTgwXG4gICAgICAgIHZhciBjYXJkSGVpZ2h0ID0gMjUwICAvLyDlop7liqDpq5jluqbku6XlrrnnurPnjovngrjooYxcbiAgICAgICAgXG4gICAgICAgIC8vIOWNoeeJh+iDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJDYXJkQmdcIilcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoNTAsIDM1LCA3MCwgMjIwKSA6IG5ldyBjYy5Db2xvcigzNSwgMzUsIDQ1LCAyMjApXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtY2FyZFdpZHRoLzIsIC1jYXJkSGVpZ2h0LzIsIGNhcmRXaWR0aCwgY2FyZEhlaWdodCwgMTUpXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDE4MCwgMTQwLCA2MCwgMjAwKSA6IG5ldyBjYy5Db2xvcig4MCwgODAsIDEwMCwgMjAwKVxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtY2FyZFdpZHRoLzIsIC1jYXJkSGVpZ2h0LzIsIGNhcmRXaWR0aCwgY2FyZEhlaWdodCwgMTUpXG4gICAgICAgIGdyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuacrOWxgOivpuaDhVwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAyMFxuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVMYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDIwMCwgMjAwLCAyMDApXG4gICAgICAgIHRpdGxlTm9kZS55ID0gY2FyZEhlaWdodC8yIC0gMjVcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IGNhcmROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliIbpmpTnur9cbiAgICAgICAgdmFyIGxpbmVOb2RlID0gbmV3IGNjLk5vZGUoXCJMaW5lXCIpXG4gICAgICAgIHZhciBsZyA9IGxpbmVOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgbGcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAxMDAsIDEwMCwgMTUwKVxuICAgICAgICBsZy5saW5lV2lkdGggPSAxXG4gICAgICAgIGxnLm1vdmVUbygtY2FyZFdpZHRoLzIgKyAxNSwgMClcbiAgICAgICAgbGcubGluZVRvKGNhcmRXaWR0aC8yIC0gMTUsIDApXG4gICAgICAgIGxnLnN0cm9rZSgpXG4gICAgICAgIGxpbmVOb2RlLnkgPSBjYXJkSGVpZ2h0LzIgLSA1MFxuICAgICAgICBsaW5lTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6K+m5oOF5YiX6KGoXG4gICAgICAgIHZhciBtdWx0aURldGFpbCA9IGRhdGEubXVsdGlfZGV0YWlsIHx8IHt9XG4gICAgICAgIHZhciBkZXRhaWxzID0gW1xuICAgICAgICAgICAgeyBsYWJlbDogXCLlupXliIZcIiwgdmFsdWU6IGRhdGEuYmFzZV9zY29yZSB8fCAxMCB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLmiqLlnLDkuLtcIiwgdmFsdWU6IG11bHRpRGV0YWlsLnFpYW5nX2NvdW50ID4gMCA/IFwieFwiICsgbXVsdGlEZXRhaWwucWlhbmdfbXVsdGkgOiBcIi1cIiB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLngrjlvLlcIiwgdmFsdWU6IG11bHRpRGV0YWlsLmJvbWJfY291bnQgPiAwID8gXCJ4XCIgKyBtdWx0aURldGFpbC5ib21iX211bHRpIDogXCItXCIgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6IFwi546L54K4XCIsIHZhbHVlOiBtdWx0aURldGFpbC5yb2NrZXRfY291bnQgPiAwID8gXCJ4XCIgKyBtdWx0aURldGFpbC5yb2NrZXRfbXVsdGkgOiBcIi1cIiB9LFxuICAgICAgICAgICAgeyBsYWJlbDogXCLmmKXlpKlcIiwgdmFsdWU6IG11bHRpRGV0YWlsLnNwcmluZ190eXBlID4gMCA/IFwieDJcIiA6IFwiLVwiIH1cbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgdmFyIGl0ZW1ZID0gY2FyZEhlaWdodC8yIC0gNzVcbiAgICAgICAgdmFyIGl0ZW1IZWlnaHQgPSAyOFxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXRhaWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGRldGFpbHNbaV1cbiAgICAgICAgICAgIHZhciBpdGVtTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSXRlbV9cIiArIGkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOagh+etvlxuICAgICAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgICAgIGxhYmVsTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgICBsYWJlbE5vZGUuYW5jaG9yWSA9IDAuNVxuICAgICAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IGl0ZW0ubGFiZWxcbiAgICAgICAgICAgIGxhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgbGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAxODApXG4gICAgICAgICAgICBsYWJlbE5vZGUueCA9IC1jYXJkV2lkdGgvMiArIDM1XG4gICAgICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5YC8XG4gICAgICAgICAgICB2YXIgdmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICAgICAgdmFsdWVOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgICAgIHZhbHVlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgICAgICB2YXIgdmFsdWVMYWJlbCA9IHZhbHVlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICB2YWx1ZUxhYmVsLnN0cmluZyA9IFN0cmluZyhpdGVtLnZhbHVlKVxuICAgICAgICAgICAgdmFsdWVMYWJlbC5mb250U2l6ZSA9IDE2XG4gICAgICAgICAgICB2YWx1ZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgICAgIHZhbHVlTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgICAgICB2YWx1ZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDE1MClcbiAgICAgICAgICAgIHZhbHVlTm9kZS54ID0gY2FyZFdpZHRoLzIgLSA0MFxuICAgICAgICAgICAgdmFsdWVOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGl0ZW1Ob2RlLnkgPSBpdGVtWSAtIGkgKiBpdGVtSGVpZ2h0XG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmgLvlgI3mlbDvvIjlpKflj7fph5HoibLvvIlcbiAgICAgICAgdmFyIHRvdGFsTXVsdGlOb2RlID0gbmV3IGNjLk5vZGUoXCJUb3RhbE11bHRpXCIpXG4gICAgICAgIHZhciB0b3RhbE11bHRpQmcgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciB0bWcgPSB0b3RhbE11bHRpQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB0bWcuZmlsbENvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoODAsIDUwLCAyMCwgMjAwKSA6IG5ldyBjYy5Db2xvcig0MCwgNDAsIDUwLCAyMDApXG4gICAgICAgIHRtZy5yb3VuZFJlY3QoLWNhcmRXaWR0aC8yICsgMTAsIC1jYXJkSGVpZ2h0LzIgKyA1LCBjYXJkV2lkdGggLSAyMCwgNTAsIDEwKVxuICAgICAgICB0bWcuZmlsbCgpXG4gICAgICAgIHRvdGFsTXVsdGlCZy55ID0gLWNhcmRIZWlnaHQvMiArIDMwXG4gICAgICAgIHRvdGFsTXVsdGlCZy5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIHRvdGFsTGFiZWwgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHRvdGFsTGFiZWwuYW5jaG9yWCA9IDAuNVxuICAgICAgICB0b3RhbExhYmVsLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIHR0bCA9IHRvdGFsTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0dGwuc3RyaW5nID0gXCLmgLvlgI3mlbBcIlxuICAgICAgICB0dGwuZm9udFNpemUgPSAxNFxuICAgICAgICB0dGwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0dGwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRvdGFsTGFiZWwuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxODAsIDE4MClcbiAgICAgICAgdG90YWxMYWJlbC55ID0gMTJcbiAgICAgICAgdG90YWxMYWJlbC5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIG11bHRpVmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5uYW1lID0gXCJNdWx0aXBsaWVyVmFsdWVcIlxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIG11bHRpVmFsdWVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIG12bCA9IG11bHRpVmFsdWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbXZsLnN0cmluZyA9IFwieFwiICsgKGRhdGEubXVsdGlwbGUgfHwgMSlcbiAgICAgICAgbXZsLmZvbnRTaXplID0gMjhcbiAgICAgICAgbXZsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgbXZsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgbXZsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5jb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCA1MCkgOiBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+uVxuICAgICAgICB2YXIgbXZvID0gbXVsdGlWYWx1ZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgbXZvLmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMTUwLCAxMDAsIDApIDogbmV3IGNjLkNvbG9yKDYwLCA2MCwgNjApXG4gICAgICAgIG12by53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIG11bHRpVmFsdWVOb2RlLnkgPSAtOFxuICAgICAgICBtdWx0aVZhbHVlTm9kZS5wYXJlbnQgPSB0b3RhbE11bHRpTm9kZVxuICAgICAgICBcbiAgICAgICAgdG90YWxNdWx0aU5vZGUueSA9IC1jYXJkSGVpZ2h0LzIgKyAzMFxuICAgICAgICB0b3RhbE11bHRpTm9kZS5wYXJlbnQgPSBjYXJkTm9kZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNhcmROb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfkaUg5Yib5bu6546p5a6257uT5p6c5YiX6KGoXG4gICAgICovXG4gICAgX2NyZWF0ZVBsYXllclJlc3VsdExpc3Q6IGZ1bmN0aW9uKGRhdGEsIGlzV2lubmVyLCBteVdpbkdvbGQsIGxpc3RXaWR0aCkge1xuICAgICAgICB2YXIgbGlzdE5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYXllclJlc3VsdExpc3RcIilcbiAgICAgICAgdmFyIGxpc3RIZWlnaHQgPSAyNjBcbiAgICAgICAgXG4gICAgICAgIC8vIOWIl+ihqOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJMaXN0QmdcIilcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDAsIDgwKVxuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWxpc3RXaWR0aC8yLCAtbGlzdEhlaWdodC8yLCBsaXN0V2lkdGgsIGxpc3RIZWlnaHQsIDEyKVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGxpc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDooajlpLRcbiAgICAgICAgdmFyIGhlYWRlck5vZGUgPSBuZXcgY2MuTm9kZShcIkhlYWRlclwiKVxuICAgICAgICB2YXIgaGVhZGVycyA9IFtcIueOqeWutlwiLCBcIui6q+S7vVwiLCBcIui+k+i1olwiXVxuICAgICAgICB2YXIgaGVhZGVyWCA9IFstbGlzdFdpZHRoLzIgKyA4MCwgMjAsIGxpc3RXaWR0aC8yIC0gNjBdXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBoTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSF9cIiArIGkpXG4gICAgICAgICAgICBoTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgICBoTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgICAgICB2YXIgaExhYmVsID0gaE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaExhYmVsLnN0cmluZyA9IGhlYWRlcnNbaV1cbiAgICAgICAgICAgIGhMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgICAgICBoTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgaExhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgaE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxNTAsIDE2MClcbiAgICAgICAgICAgIGhOb2RlLnggPSBoZWFkZXJYW2ldXG4gICAgICAgICAgICBoTm9kZS5wYXJlbnQgPSBoZWFkZXJOb2RlXG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVyTm9kZS55ID0gbGlzdEhlaWdodC8yIC0gMjVcbiAgICAgICAgaGVhZGVyTm9kZS5wYXJlbnQgPSBsaXN0Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5YiG6ZqU57q/XG4gICAgICAgIHZhciBzZXBOb2RlID0gbmV3IGNjLk5vZGUoXCJTZXBhcmF0b3JcIilcbiAgICAgICAgdmFyIHNnID0gc2VwTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIHNnLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTAwLCAxMDAsIDEwMClcbiAgICAgICAgc2cubGluZVdpZHRoID0gMVxuICAgICAgICBzZy5tb3ZlVG8oLWxpc3RXaWR0aC8yICsgMTUsIDApXG4gICAgICAgIHNnLmxpbmVUbyhsaXN0V2lkdGgvMiAtIDE1LCAwKVxuICAgICAgICBzZy5zdHJva2UoKVxuICAgICAgICBzZXBOb2RlLnkgPSBsaXN0SGVpZ2h0LzIgLSA0NVxuICAgICAgICBzZXBOb2RlLnBhcmVudCA9IGxpc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDnjqnlrrbliJfooahcbiAgICAgICAgdmFyIHBsYXllcnMgPSBkYXRhLnBsYXllcnMgfHwgW11cbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgdmFyIGl0ZW1TdGFydFkgPSBsaXN0SGVpZ2h0LzIgLSA3NVxuICAgICAgICB2YXIgaXRlbUhlaWdodCA9IDY1XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoICYmIGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW2ldXG4gICAgICAgICAgICB2YXIgaXNDdXJyZW50UGxheWVyID0gU3RyaW5nKHBsYXllci5wbGF5ZXJfaWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZClcbiAgICAgICAgICAgIHZhciBpdGVtTm9kZSA9IHRoaXMuX2NyZWF0ZVBsYXllclJlc3VsdEl0ZW0ocGxheWVyLCBpc0N1cnJlbnRQbGF5ZXIsIGlzV2lubmVyLCBsaXN0V2lkdGgsIGkpXG4gICAgICAgICAgICBpdGVtTm9kZS55ID0gaXRlbVN0YXJ0WSAtIGkgKiBpdGVtSGVpZ2h0XG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBsaXN0Tm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdE5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+RpCDliJvlu7rljZXkuKrnjqnlrrbnu5PmnpzpoblcbiAgICAgKi9cbiAgICBfY3JlYXRlUGxheWVyUmVzdWx0SXRlbTogZnVuY3Rpb24ocGxheWVyLCBpc0N1cnJlbnRQbGF5ZXIsIGlzV2lubmVyLCBsaXN0V2lkdGgsIGluZGV4KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgaXRlbU5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYXllckl0ZW1fXCIgKyBpbmRleClcbiAgICAgICAgdmFyIGl0ZW1IZWlnaHQgPSA1NVxuICAgICAgICBcbiAgICAgICAgLy8g5b2T5YmN546p5a626auY5Lqu6IOM5pmvXG4gICAgICAgIGlmIChpc0N1cnJlbnRQbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciBoaWdobGlnaHQgPSBuZXcgY2MuTm9kZShcIkhpZ2hsaWdodFwiKVxuICAgICAgICAgICAgdmFyIGhnID0gaGlnaGxpZ2h0LmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgICAgIGhnLmZpbGxDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDgwLCA2MCwgMzAsIDE1MCkgOiBuZXcgY2MuQ29sb3IoNTAsIDQwLCA1MCwgMTUwKVxuICAgICAgICAgICAgaGcucm91bmRSZWN0KC1saXN0V2lkdGgvMiArIDEwLCAtaXRlbUhlaWdodC8yLCBsaXN0V2lkdGggLSAyMCwgaXRlbUhlaWdodCwgOClcbiAgICAgICAgICAgIGhnLmZpbGwoKVxuICAgICAgICAgICAgaGcuc3Ryb2tlQ29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigyMDAsIDE1MCwgNTAsIDIwMCkgOiBuZXcgY2MuQ29sb3IoMTAwLCA4MCwgMTAwLCAxNTApXG4gICAgICAgICAgICBoZy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBoZy5yb3VuZFJlY3QoLWxpc3RXaWR0aC8yICsgMTAsIC1pdGVtSGVpZ2h0LzIsIGxpc3RXaWR0aCAtIDIwLCBpdGVtSGVpZ2h0LCA4KVxuICAgICAgICAgICAgaGcuc3Ryb2tlKClcbiAgICAgICAgICAgIGhpZ2hsaWdodC5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpLTlg4/ljLrln59cbiAgICAgICAgdmFyIGF2YXRhck5vZGUgPSBuZXcgY2MuTm9kZShcIkF2YXRhclwiKVxuICAgICAgICBhdmF0YXJOb2RlLnggPSAtbGlzdFdpZHRoLzIgKyA0NVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6IOM5pmv77yI5ZyG5b2i77yJXG4gICAgICAgIHZhciBhdmF0YXJCZyA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyQmdcIilcbiAgICAgICAgdmFyIGFnID0gYXZhdGFyQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgaXNMYW5kbG9yZCA9IHBsYXllci5yb2xlID09PSBcImxhbmRsb3JkXCJcbiAgICAgICAgXG4gICAgICAgIC8vIOe7mOWItuWchuW9ouWktOWDj+ahhlxuICAgICAgICBhZy5zdHJva2VDb2xvciA9IGlzTGFuZGxvcmQgPyBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDUwLCAyNTUpIDogbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAyMDAsIDI1NSlcbiAgICAgICAgYWcubGluZVdpZHRoID0gM1xuICAgICAgICBhZy5jaXJjbGUoMCwgMCwgMjIpXG4gICAgICAgIGFnLnN0cm9rZSgpXG4gICAgICAgIGFnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig2MCwgNjAsIDgwLCAyMDApXG4gICAgICAgIGFnLmNpcmNsZSgwLCAwLCAyMClcbiAgICAgICAgYWcuZmlsbCgpXG4gICAgICAgIGF2YXRhckJnLnBhcmVudCA9IGF2YXRhck5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleWKoOi9veWktOWDj1xuICAgICAgICB2YXIgYXZhdGFySW5kZXggPSAoaW5kZXggJSA0KSArIDFcbiAgICAgICAgdmFyIGF2YXRhclBhdGggPSBcIlVJL2hlYWRpbWFnZS9hdmF0YXJfXCIgKyBhdmF0YXJJbmRleFxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChhdmF0YXJQYXRoLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXZhdGFyU3ByaXRlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJTcHJpdGVcIilcbiAgICAgICAgICAgICAgICB2YXIgc3AgPSBhdmF0YXJTcHJpdGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSlcbiAgICAgICAgICAgICAgICBzcC5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgc3Auc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgICAgICAgICAgYXZhdGFyU3ByaXRlLndpZHRoID0gMzZcbiAgICAgICAgICAgICAgICBhdmF0YXJTcHJpdGUuaGVpZ2h0ID0gMzZcbiAgICAgICAgICAgICAgICBhdmF0YXJTcHJpdGUucGFyZW50ID0gYXZhdGFyTm9kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g6Lqr5Lu95Zu+5qCHXG4gICAgICAgIHZhciByb2xlSWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIlJvbGVJY29uXCIpXG4gICAgICAgIHZhciByb2xlTGFiZWwgPSByb2xlSWNvbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICByb2xlTGFiZWwuc3RyaW5nID0gaXNMYW5kbG9yZCA/IFwi8J+RkVwiIDogXCLwn4y+XCJcbiAgICAgICAgcm9sZUxhYmVsLmZvbnRTaXplID0gMTRcbiAgICAgICAgcm9sZUljb25Ob2RlLnggPSAxOFxuICAgICAgICByb2xlSWNvbk5vZGUueSA9IC0xNVxuICAgICAgICByb2xlSWNvbk5vZGUucGFyZW50ID0gYXZhdGFyTm9kZVxuICAgICAgICBcbiAgICAgICAgYXZhdGFyTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g546p5a625ZCN56ewXG4gICAgICAgIHZhciBuYW1lTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTmFtZVwiKVxuICAgICAgICBuYW1lTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIG5hbWVOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5hbWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbmFtZUxhYmVsLnN0cmluZyA9IHBsYXllci5wbGF5ZXJfbmFtZSB8fCAoXCLnjqnlrrZcIiArIChpbmRleCArIDEpKVxuICAgICAgICBuYW1lTGFiZWwuZm9udFNpemUgPSAxOFxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIG5hbWVOb2RlLmNvbG9yID0gaXNDdXJyZW50UGxheWVyID8gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyMDApIDogbmV3IGNjLkNvbG9yKDIyMCwgMjIwLCAyMjApXG4gICAgICAgIG5hbWVOb2RlLnggPSAtbGlzdFdpZHRoLzIgKyAxMDBcbiAgICAgICAgbmFtZU5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOi6q+S7vVxuICAgICAgICB2YXIgcm9sZU5vZGUgPSBuZXcgY2MuTm9kZShcIlJvbGVcIilcbiAgICAgICAgcm9sZU5vZGUuYW5jaG9yWCA9IDAuNVxuICAgICAgICByb2xlTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciByb2xlVGV4dCA9IHJvbGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcm9sZVRleHQuc3RyaW5nID0gaXNMYW5kbG9yZCA/IFwi5Zyw5Li7XCIgOiBcIuWGnOawkVwiXG4gICAgICAgIHJvbGVUZXh0LmZvbnRTaXplID0gMThcbiAgICAgICAgcm9sZVRleHQuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICByb2xlVGV4dC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgcm9sZU5vZGUuY29sb3IgPSBpc0xhbmRsb3JkID8gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApIDogbmV3IGNjLkNvbG9yKDEyMCwgMjAwLCAxMjApXG4gICAgICAgIHJvbGVOb2RlLnggPSAyMFxuICAgICAgICByb2xlTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6L6T6LWi6YeR6aKdXG4gICAgICAgIHZhciB3aW5Hb2xkID0gcGxheWVyLndpbl9nb2xkIHx8IDBcbiAgICAgICAgdmFyIHdpbk5vZGUgPSBuZXcgY2MuTm9kZShcIldpbkdvbGRcIilcbiAgICAgICAgd2luTm9kZS5uYW1lID0gXCJXaW5Hb2xkVmFsdWVcIlxuICAgICAgICB3aW5Ob2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgd2luTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciB3aW5MYWJlbCA9IHdpbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB3aW5MYWJlbC5zdHJpbmcgPSAod2luR29sZCA+PSAwID8gXCIrXCIgOiBcIlwiKSArIHdpbkdvbGRcbiAgICAgICAgd2luTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICB3aW5MYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIHdpbkxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgd2luTGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDmj4/ovrlcbiAgICAgICAgdmFyIHdpbk91dGxpbmUgPSB3aW5Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIHdpbk91dGxpbmUuY29sb3IgPSB3aW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMCwgODAsIDApIDogbmV3IGNjLkNvbG9yKDEwMCwgMCwgMClcbiAgICAgICAgd2luT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIHdpbk5vZGUuY29sb3IgPSB3aW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMTAwLCAyNTUsIDEwMCkgOiBuZXcgY2MuQ29sb3IoMjU1LCAxMDAsIDEwMClcbiAgICAgICAgd2luTm9kZS54ID0gbGlzdFdpZHRoLzIgLSA1MFxuICAgICAgICB3aW5Ob2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbU5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+UmCDliJvlu7rmjInpkq7ljLrln59cbiAgICAgKi9cbiAgICBfY3JlYXRlQnV0dG9uQXJlYTogZnVuY3Rpb24oaXNXaW5uZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgYXJlYU5vZGUgPSBuZXcgY2MuTm9kZShcIkJ1dHRvbkFyZWFcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOe7p+e7rea4uOaIj+aMiemSrlxuICAgICAgICB2YXIgY29udGludWVCdG4gPSBzZWxmLl9jcmVhdGVTdHlsZWRCdXR0b24oXCLnu6fnu63muLjmiI9cIiwgaXNXaW5uZXIsIHRydWUpXG4gICAgICAgIGNvbnRpbnVlQnRuLnggPSAtMTAwXG4gICAgICAgIGNvbnRpbnVlQnRuLnBhcmVudCA9IGFyZWFOb2RlXG4gICAgICAgIFxuICAgICAgICBjb250aW51ZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhcImNvbnRpbnVlXCIpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDov5Tlm57lpKfljoXmjInpkq5cbiAgICAgICAgdmFyIGxvYmJ5QnRuID0gc2VsZi5fY3JlYXRlU3R5bGVkQnV0dG9uKFwi6L+U5Zue5aSn5Y6FXCIsIGlzV2lubmVyLCBmYWxzZSlcbiAgICAgICAgbG9iYnlCdG4ueCA9IDEwMFxuICAgICAgICBsb2JieUJ0bi5wYXJlbnQgPSBhcmVhTm9kZVxuICAgICAgICBcbiAgICAgICAgbG9iYnlCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soXCJsb2JieVwiKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGFyZWFOb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflJgg5Yib5bu66auY57qn5qC35byP5oyJ6ZKuXG4gICAgICovXG4gICAgX2NyZWF0ZVN0eWxlZEJ1dHRvbjogZnVuY3Rpb24odGV4dCwgaXNXaW5uZXIsIGlzUHJpbWFyeSkge1xuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQnRuX1wiICsgdGV4dClcbiAgICAgICAgdmFyIGJ0bldpZHRoID0gMTQwXG4gICAgICAgIHZhciBidG5IZWlnaHQgPSA1MFxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeiuvue9ruaMiemSruiKgueCueeahOWGheWuueWkp+Wwj++8jOehruS/neeCueWHu+WMuuWfn+ato+ehrlxuICAgICAgICBidG5Ob2RlLnNldENvbnRlbnRTaXplKGJ0bldpZHRoLCBidG5IZWlnaHQpXG4gICAgICAgIGJ0bk5vZGUuc2V0QW5jaG9yUG9pbnQoMC41LCAwLjUpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75YqgIEJsb2NrSW5wdXRFdmVudHMg57uE5Lu277yM56Gu5L+d5oyJ6ZKu5Y+v5Lul5o6l5pS254K55Ye75LqL5Lu2XG4gICAgICAgIGJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7og4zmma9cbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIFxuICAgICAgICBpZiAoaXNQcmltYXJ5KSB7XG4gICAgICAgICAgICAvLyDkuLvopoHmjInpkq4gLSDph5HmqZnmuJDlj5hcbiAgICAgICAgICAgIGlmIChpc1dpbm5lcikge1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDE0MCwgMzAsIDI1NSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDYwLCAxMjAsIDE4MCwgMjU1KVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5qyh6KaB5oyJ6ZKuIC0g6JOd57Sr5riQ5Y+YXG4gICAgICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDcwLCAxMjAsIDI1NSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC1idG5XaWR0aC8yLCAtYnRuSGVpZ2h0LzIsIGJ0bldpZHRoLCBidG5IZWlnaHQsIDI1KVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgXG4gICAgICAgIC8vIOi+ueahhlxuICAgICAgICBpZiAoaXNQcmltYXJ5ICYmIGlzV2lubmVyKSB7XG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIyMCwgMTAwLCAyNTUpXG4gICAgICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLWJ0bldpZHRoLzIsIC1idG5IZWlnaHQvMiwgYnRuV2lkdGgsIGJ0bkhlaWdodCwgMjUpXG4gICAgICAgICAgICBncmFwaGljcy5zdHJva2UoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7mloflrZdcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgbGFiZWxOb2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGFiZWxOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dFxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGxhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgbGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5TSFJJTktcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBsYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgbGFiZWxOb2RlLndpZHRoID0gYnRuV2lkdGggLSAyMCAgLy8g55WZ5Ye66L656Led6Ziy5q2i5rqi5Ye6XG4gICAgICAgIGxhYmVsTm9kZS5oZWlnaHQgPSBidG5IZWlnaHQgLSAxMFxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+uVxuICAgICAgICB2YXIgb3V0bGluZSA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDApXG4gICAgICAgIG91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIFxuICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gYnRuTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye75pWI5p6cXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2MudHdlZW4oYnRuTm9kZSkudG8oMC4xLCB7IHNjYWxlOiAwLjk1IH0pLnN0YXJ0KClcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKGJ0bk5vZGUpLnRvKDAuMSwgeyBzY2FsZTogMSB9KS5zdGFydCgpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYy50d2VlbihidG5Ob2RlKS50bygwLjEsIHsgc2NhbGU6IDEgfSkuc3RhcnQoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJ0bk5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog4pyoIOWIm+W7uuiDnOWIqeeykuWtkOeJueaViFxuICAgICAqL1xuICAgIF9jcmVhdGVWaWN0b3J5UGFydGljbGVzOiBmdW5jdGlvbihwYXJlbnQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDph5HluIHnspLlrZBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29pbiA9IG5ldyBjYy5Ob2RlKFwiQ29pbl9cIiArIGluZGV4KVxuICAgICAgICAgICAgICAgIGNvaW4ueCA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHdpZHRoXG4gICAgICAgICAgICAgICAgY29pbi55ID0gaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g57uY5Yi26YeR5biBXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBjb2luLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgICAgICAgICBnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgNTAsIDI1NSlcbiAgICAgICAgICAgICAgICBnLmNpcmNsZSgwLCAwLCA4KVxuICAgICAgICAgICAgICAgIGcuZmlsbCgpXG4gICAgICAgICAgICAgICAgZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDE1MCwgMzAsIDI1NSlcbiAgICAgICAgICAgICAgICBnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgICAgICAgICBnLmNpcmNsZSgwLCAwLCA4KVxuICAgICAgICAgICAgICAgIGcuc3Ryb2tlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb2luLnBhcmVudCA9IHBhcmVudFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS4i+iQveWKqOeUu1xuICAgICAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IDEuNSArIE1hdGgucmFuZG9tKCkgKiAxLjVcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0WSA9IC1oZWlnaHQgLyAyIC0gNTBcbiAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBNYXRoLnJhbmRvbSgpICogMC41XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2MudHdlZW4oY29pbilcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KGRlbGF5KVxuICAgICAgICAgICAgICAgICAgICAucGFyYWxsZWwoXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uLCB7IHk6IHRhcmdldFkgfSwgeyBlYXNpbmc6ICdxdWFkSW4nIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB4OiBjb2luLnggKyAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAxMDAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uIC8gMiwgeyBhbmdsZTogLTE4MCB9KS50byhkdXJhdGlvbiAvIDIsIHsgYW5nbGU6IC0zNjAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW+queOr1xuICAgICAgICAgICAgICAgICAgICAgICAgY29pbi55ID0gaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2luLnggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oY29pbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyYWxsZWwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeTogdGFyZ2V0WSB9LCB7IGVhc2luZzogJ3F1YWRJbicgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeDogY29pbi54ICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMTAwIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uIC8gMiwgeyBhbmdsZTogLTE4MCB9KS50byhkdXJhdGlvbiAvIDIsIHsgYW5nbGU6IC0zNjAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgIH0pKGkpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYn+WFiemXqueDgVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDg7IGorKykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXIgPSBuZXcgY2MuTm9kZShcIlN0YXJfXCIgKyBpbmRleClcbiAgICAgICAgICAgICAgICBzdGFyLnggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aCAqIDAuOFxuICAgICAgICAgICAgICAgIHN0YXIueSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIGhlaWdodCAqIDAuOFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOe7mOWItuaYn+aYn1xuICAgICAgICAgICAgICAgIHZhciBzZyA9IHN0YXIuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICAgICAgICAgIHNnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjAwLCAyMDApXG4gICAgICAgICAgICAgICAgc2VsZi5fZHJhd1N0YXIoc2csIDAsIDAsIDYsIDUpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3Rhci5wYXJlbnQgPSBwYXJlbnRcbiAgICAgICAgICAgICAgICBzdGFyLm9wYWNpdHkgPSAwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6Zeq54OB5Yqo55S7XG4gICAgICAgICAgICAgICAgY2MudHdlZW4oc3RhcilcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KE1hdGgucmFuZG9tKCkgKiAyKVxuICAgICAgICAgICAgICAgICAgICAucmVwZWF0Rm9yZXZlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IG9wYWNpdHk6IDI1NSwgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjMsIHsgb3BhY2l0eTogMTAwLCBzY2FsZTogMC44IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAyNTUsIHNjYWxlOiAxLjIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG8oMC4zLCB7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjUgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGVsYXkoMSArIE1hdGgucmFuZG9tKCkgKiAyKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgICAgICB9KShqKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfjKfvuI8g5Yib5bu65aSx6LSl57KS5a2Q54m55pWIXG4gICAgICovXG4gICAgX2NyZWF0ZURlZmVhdFBhcnRpY2xlczogZnVuY3Rpb24ocGFyZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIC8vIOiTneiJsua8gua1rueykuWtkFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBjYy5Ob2RlKFwiRGVmZWF0UGFydGljbGVfXCIgKyBpbmRleClcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogd2lkdGhcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogaGVpZ2h0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g57uY5Yi257KS5a2QXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBwYXJ0aWNsZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgICAgICAgICAgZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDEwMCwgMTUwLCAxNTApXG4gICAgICAgICAgICAgICAgZy5jaXJjbGUoMCwgMCwgNCArIE1hdGgucmFuZG9tKCkgKiAzKVxuICAgICAgICAgICAgICAgIGcuZmlsbCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGFydGljbGUucGFyZW50ID0gcGFyZW50XG4gICAgICAgICAgICAgICAgcGFydGljbGUub3BhY2l0eSA9IDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDnvJPmhaLmvILmta7liqjnlLtcbiAgICAgICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAzICsgTWF0aC5yYW5kb20oKSAqIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLnRvKDAuNSwgeyBvcGFjaXR5OiAxNTAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnBhcmFsbGVsKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB5OiBwYXJ0aWNsZS55ICsgNTAgKyBNYXRoLnJhbmRvbSgpICogMzAgfSwgeyBlYXNpbmc6ICdzaW5lSW5PdXQnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKS50byhkdXJhdGlvbiwgeyB4OiBwYXJ0aWNsZS54ICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogNDAgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAudG8oMC41LCB7IG9wYWNpdHk6IDAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlvqrnjq9cbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KDQpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBlYXRGb3JldmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2MudHdlZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjUsIHsgb3BhY2l0eTogMTUwIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmFsbGVsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy50d2VlbigpLnRvKGR1cmF0aW9uLCB7IHk6IHBhcnRpY2xlLnkgKyA1MCArIE1hdGgucmFuZG9tKCkgKiAzMCB9LCB7IGVhc2luZzogJ3NpbmVJbk91dCcgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLnR3ZWVuKCkudG8oZHVyYXRpb24sIHsgeDogcGFydGljbGUueCArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDQwIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50bygwLjUsIHsgb3BhY2l0eTogMCB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgICAgICB9KShpKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOKtkCDnu5jliLbmmJ/lvaJcbiAgICAgKi9cbiAgICBfZHJhd1N0YXI6IGZ1bmN0aW9uKGdyYXBoaWNzLCBjeCwgY3ksIGlubmVyUmFkaXVzLCBwb2ludHMpIHtcbiAgICAgICAgdmFyIG91dGVyUmFkaXVzID0gaW5uZXJSYWRpdXMgKiAyXG4gICAgICAgIGdyYXBoaWNzLm1vdmVUbyhjeCwgY3kgKyBvdXRlclJhZGl1cylcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzICogMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gaSAlIDIgPT09IDAgPyBvdXRlclJhZGl1cyA6IGlubmVyUmFkaXVzXG4gICAgICAgICAgICB2YXIgYW5nbGUgPSAoaSAqIE1hdGguUEkpIC8gcG9pbnRzIC0gTWF0aC5QSSAvIDJcbiAgICAgICAgICAgIHZhciB4ID0gY3ggKyBNYXRoLmNvcyhhbmdsZSkgKiByYWRpdXNcbiAgICAgICAgICAgIHZhciB5ID0gY3kgKyBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXNcbiAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbyh4LCB5KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBncmFwaGljcy5jbG9zZSgpXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5SiIOWQr+WKqOaVsOWtl+WKqOeUu1xuICAgICAqL1xuICAgIF9zdGFydE51bWJlckFuaW1hdGlvbnM6IGZ1bmN0aW9uKHBvcHVwTm9kZSwgZGF0YSwgbXlXaW5Hb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5YCN5pWw5rua5Yqo5Yqo55S7XG4gICAgICAgIHZhciBtdWx0aVZhbHVlTm9kZSA9IHNlbGYuX2ZpbmROb2RlQnlOYW1lKHBvcHVwTm9kZSwgXCJNdWx0aXBsaWVyVmFsdWVcIilcbiAgICAgICAgaWYgKG11bHRpVmFsdWVOb2RlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0TXVsdGkgPSBkYXRhLm11bHRpcGxlIHx8IDFcbiAgICAgICAgICAgIHNlbGYuX2FuaW1hdGVOdW1iZXIobXVsdGlWYWx1ZU5vZGUsIDEsIHRhcmdldE11bHRpLCA4MDAsIFwieFwiKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKIg5pWw5a2X5rua5Yqo5Yqo55S7XG4gICAgICovXG4gICAgX2FuaW1hdGVOdW1iZXI6IGZ1bmN0aW9uKG5vZGUsIGZyb20sIHRvLCBkdXJhdGlvbiwgcHJlZml4KSB7XG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICAgIHZhciBsYWJlbCA9IG5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBpZiAoIWxhYmVsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgIHZhciBkaWZmID0gdG8gLSBmcm9tXG4gICAgICAgIFxuICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuaXNWYWxpZCkgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZVxuICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkvb/nlKjnvJPliqjlh73mlbBcbiAgICAgICAgICAgIHZhciBlYXNlUHJvZ3Jlc3MgPSAxIC0gTWF0aC5wb3coMSAtIHByb2dyZXNzLCAzKSAvLyBlYXNlT3V0Q3ViaWNcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gTWF0aC5mbG9vcihmcm9tICsgZGlmZiAqIGVhc2VQcm9ncmVzcylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gKHByZWZpeCB8fCBcIlwiKSArIGN1cnJlbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb2dyZXNzIDwgMSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlLCAxNilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gKHByZWZpeCB8fCBcIlwiKSArIHRvXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflI0g5p+l5om+6IqC54K5XG4gICAgICovXG4gICAgX2ZpbmROb2RlQnlOYW1lOiBmdW5jdGlvbihwYXJlbnQsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmb3VuZCA9IHRoaXMuX2ZpbmROb2RlQnlOYW1lKGNoaWxkcmVuW2ldLCBuYW1lKVxuICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDlhbPpl63nu5PnrpflvLnnqpcgLSDluKbnvKnlsI/mt6Hlh7rliqjnlLtcbiAgICAgKi9cbiAgICBfY2xvc2VHYW1lUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKHBvcHVwTm9kZSwgbWFza05vZGUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInnspLlrZDliqjnlLtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3VsdEVmZmVjdExheWVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHRFZmZlY3RMYXllci5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9yZXN1bHRFZmZlY3RMYXllci5jaGlsZHJlblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5by556qX57yp5bCP5reh5Ye65Yqo55S7XG4gICAgICAgIGlmIChwb3B1cE5vZGUpIHtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgICAgICAudG8oMC4yLCB7IHNjYWxlOiAwLjgsIG9wYWNpdHk6IDAgfSwgeyBlYXNpbmc6ICdiYWNrSW4nIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3B1cE5vZGUgJiYgcG9wdXBOb2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5reh5Ye6XG4gICAgICAgIGlmIChtYXNrTm9kZSkge1xuICAgICAgICAgICAgY2MudHdlZW4obWFza05vZGUpXG4gICAgICAgICAgICAgICAgLnRvKDAuMiwgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrTm9kZSAmJiBtYXNrTm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fZ2FtZVJlc3VsdFBvcHVwID0gbnVsbFxuICAgICAgICB0aGlzLl9nYW1lUmVzdWx0TWFzayA9IG51bGxcbiAgICAgICAgdGhpcy5fcmVzdWx0RWZmZWN0TGF5ZXIgPSBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOe7p+e7rea4uOaIj1xuICAgICAqL1xuICAgIF9jb250aW51ZUdhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCB8fCAhbXlnbG9iYWwucGxheWVyRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XnjqnlrrbosYblrZDmmK/lkKbotrPlpJ/nu6fnu63muLjmiI9cbiAgICAgICAgdmFyIHBsYXllckdvbGQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50IHx8IDBcbiAgICAgICAgdmFyIHJvb21Db25maWcgPSBteWdsb2JhbC5jdXJyZW50Um9vbUNvbmZpZyB8fCB7fVxuICAgICAgICB2YXIgbWluR29sZCA9IHJvb21Db25maWcubWluX2dvbGQgfHwgcm9vbUNvbmZpZy5taW5Hb2xkIHx8IDBcbiAgICAgICAgXG4gICAgICAgIGlmIChwbGF5ZXJHb2xkIDwgbWluR29sZCkge1xuICAgICAgICAgICAgLy8g6LGG5a2Q5LiN6Laz77yM5pi+56S66LGG5a2Q5LiN6Laz5by556qXXG4gICAgICAgICAgICB0aGlzLl9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwKHBsYXllckdvbGQsIG1pbkdvbGQpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6LGG5a2Q6Laz5aSf77yM57un57ut5ri45oiPXG4gICAgICAgIHRoaXMuX2RvQ29udGludWVHYW1lKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmiafooYznu6fnu63muLjmiI/pgLvovpFcbiAgICAgKi9cbiAgICBfZG9Db250aW51ZUdhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIblvZPliY3muLjmiI/nirbmgIFcbiAgICAgICAgdGhpcy5fcmVzZXRHYW1lU3RhdGUoKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R6YCBIHJlYWR5IOivt+axgu+8iOWHhuWkh+S4i+S4gOWxgO+8iVxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQucmVxdWVzdFJlYWR5KSB7XG4gICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQucmVxdWVzdFJlYWR5KClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S6562J5b6F5o+Q56S6XG4gICAgICAgIGlmICh0aGlzLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy50aXBzTGFiZWwuc3RyaW5nID0gXCLnrYnlvoXlhbbku5bnjqnlrrYuLi5cIlxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTAwMClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeaYvuekuuixhuWtkOS4jei2s+W8ueeql1xuICAgICAqL1xuICAgIF9zaG93SW5zdWZmaWNpZW50R29sZFBvcHVwOiBmdW5jdGlvbihjdXJyZW50R29sZCwgcmVxdWlyZWRHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5YWz6Zet57uT566X5by556qXXG4gICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKClcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuixhuWtkOS4jei2s+W8ueeql1xuICAgICAgICB2YXIgY2FudmFzID0gY2MuZGlyZWN0b3IuZ2V0U2NlbmUoKS5nZXRDaGlsZEJ5TmFtZShcIkNhbnZhc1wiKVxuICAgICAgICBpZiAoIWNhbnZhcykgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemVcbiAgICAgICAgXG4gICAgICAgIC8vIOmBrue9qeWxglxuICAgICAgICB2YXIgbWFza05vZGUgPSBuZXcgY2MuTm9kZShcIkluc3VmZmljaWVudEdvbGRNYXNrXCIpXG4gICAgICAgIG1hc2tOb2RlLmFkZENvbXBvbmVudChjYy5CbG9ja0lucHV0RXZlbnRzKVxuICAgICAgICB2YXIgbWFza1Nwcml0ZSA9IG1hc2tOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgIG1hc2tTcHJpdGUuc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUoKVxuICAgICAgICBtYXNrU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTVxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwKVxuICAgICAgICBtYXNrTm9kZS5vcGFjaXR5ID0gMTgwXG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g5by556qX5a655ZmoXG4gICAgICAgIHZhciBwb3B1cE5vZGUgPSBuZXcgY2MuTm9kZShcIkluc3VmZmljaWVudEdvbGRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUueCA9IDBcbiAgICAgICAgcG9wdXBOb2RlLnkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+iDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgZ3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgcG9wdXBXaWR0aCA9IDQ1MFxuICAgICAgICB2YXIgcG9wdXBIZWlnaHQgPSAzMjBcbiAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDQwLCAzNSwgNjApXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDIwKVxuICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gM1xuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuixhuWtkOS4jei2s1wiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICB0aXRsZUxhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgMTAwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA0NVxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliIbpmpTnur9cbiAgICAgICAgdmFyIGxpbmVOb2RlID0gbmV3IGNjLk5vZGUoXCJMaW5lXCIpXG4gICAgICAgIHZhciBsZyA9IGxpbmVOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgbGcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA4MCwgNjApXG4gICAgICAgIGxnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgbGcubW92ZVRvKC1wb3B1cFdpZHRoLzIgKyAzMCwgcG9wdXBIZWlnaHQvMiAtIDgwKVxuICAgICAgICBsZy5saW5lVG8ocG9wdXBXaWR0aC8yIC0gMzAsIHBvcHVwSGVpZ2h0LzIgLSA4MClcbiAgICAgICAgbGcuc3Ryb2tlKClcbiAgICAgICAgbGluZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDlhoXlrrnljLrln59cbiAgICAgICAgdmFyIGNvbnRlbnROb2RlID0gbmV3IGNjLk5vZGUoXCJDb250ZW50XCIpXG4gICAgICAgIHZhciBjb250ZW50TGFiZWwgPSBjb250ZW50Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvbnRlbnRMYWJlbC5zdHJpbmcgPSBcIuW9k+WJjeixhuWtkDogXCIgKyB0aGlzLl9mb3JtYXRHb2xkKGN1cnJlbnRHb2xkKSArIFwiXFxu6ZyA6KaB6LGG5a2QOiBcIiArIHRoaXMuX2Zvcm1hdEdvbGQocmVxdWlyZWRHb2xkKSArIFwiXFxuXFxu6KeC55yL5r+A5Yqx6KeG6aKR5bm/5ZGK5Y+v6I635Y+W6LGG5a2QXCJcbiAgICAgICAgY29udGVudExhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgY29udGVudExhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgY29udGVudExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgY29udGVudExhYmVsLm92ZXJmbG93ID0gY2MuTGFiZWwuT3ZlcmZsb3cuUkVTSVpFX0hFSUdIVFxuICAgICAgICBjb250ZW50Tm9kZS53aWR0aCA9IHBvcHVwV2lkdGggLSA2MFxuICAgICAgICBjb250ZW50Tm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMjAsIDIyMCwgMjIwKVxuICAgICAgICBjb250ZW50Tm9kZS55ID0gMjBcbiAgICAgICAgY29udGVudE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7ljLrln59cbiAgICAgICAgdmFyIGJ0bkFyZWFOb2RlID0gbmV3IGNjLk5vZGUoXCJCdXR0b25BcmVhXCIpXG4gICAgICAgIGJ0bkFyZWFOb2RlLnkgPSAtcG9wdXBIZWlnaHQvMiArIDYwXG4gICAgICAgIGJ0bkFyZWFOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6KeC55yL5bm/5ZGK5oyJ6ZKuXG4gICAgICAgIHZhciBhZEJ0biA9IG5ldyBjYy5Ob2RlKFwiQWRCdG5cIilcbiAgICAgICAgdmFyIGFkQmcgPSBhZEJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGFkQmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCAxODAsIDgwKVxuICAgICAgICBhZEJnLnJvdW5kUmVjdCgtMTAwLCAtMjUsIDIwMCwgNTAsIDI1KVxuICAgICAgICBhZEJnLmZpbGwoKVxuICAgICAgICBhZEJ0bi54ID0gLTExMFxuICAgICAgICBhZEJ0bi5wYXJlbnQgPSBidG5BcmVhTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGFkTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgYWRMYWJlbCA9IGFkTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgYWRMYWJlbC5zdHJpbmcgPSBcIuingueci+W5v+WRilwiXG4gICAgICAgIGFkTGFiZWwuZm9udFNpemUgPSAyMFxuICAgICAgICBhZExhYmVsLmZvbnRGYW1pbHkgPSBcIkFyaWFsXCJcbiAgICAgICAgYWRMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgYWRMYWJlbE5vZGUucGFyZW50ID0gYWRCdG5cbiAgICAgICAgXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOheaMiemSrlxuICAgICAgICB2YXIgbG9iYnlCdG4gPSBuZXcgY2MuTm9kZShcIkxvYmJ5QnRuXCIpXG4gICAgICAgIHZhciBsb2JieUJnID0gbG9iYnlCdG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBsb2JieUJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDgwLCAxNDApXG4gICAgICAgIGxvYmJ5Qmcucm91bmRSZWN0KC0xMDAsIC0yNSwgMjAwLCA1MCwgMjUpXG4gICAgICAgIGxvYmJ5QmcuZmlsbCgpXG4gICAgICAgIGxvYmJ5QnRuLnggPSAxMTBcbiAgICAgICAgbG9iYnlCdG4ucGFyZW50ID0gYnRuQXJlYU5vZGVcbiAgICAgICAgXG4gICAgICAgIHZhciBsb2JieUxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGxvYmJ5TGFiZWwgPSBsb2JieUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxvYmJ5TGFiZWwuc3RyaW5nID0gXCLov5Tlm57lpKfljoVcIlxuICAgICAgICBsb2JieUxhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbG9iYnlMYWJlbC5mb250RmFtaWx5ID0gXCJBcmlhbFwiXG4gICAgICAgIGxvYmJ5TGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGxvYmJ5TGFiZWxOb2RlLnBhcmVudCA9IGxvYmJ5QnRuXG4gICAgICAgIFxuICAgICAgICAvLyDlrZjlgqjoioLngrnlvJXnlKhcbiAgICAgICAgc2VsZi5faW5zdWZmaWNpZW50R29sZFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHNlbGYuX2luc3VmZmljaWVudEdvbGRNYXNrID0gbWFza05vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOingueci+W5v+WRiuaMiemSrueCueWHu+S6i+S7tlxuICAgICAgICBhZEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fd2F0Y2hBZEZvckdvbGQoZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOW5v+WRiuingueci+aIkOWKn++8jOWFs+mXreW8ueeql+W5tue7p+e7rea4uOaIj1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCgpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RvQ29udGludWVHYW1lKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g6L+U5Zue5aSn5Y6F5oyJ6ZKu54K55Ye75LqL5Lu2XG4gICAgICAgIGxvYmJ5QnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9jbG9zZUluc3VmZmljaWVudEdvbGRQb3B1cCgpXG4gICAgICAgICAgICBzZWxmLl9yZXR1cm5Ub0xvYmJ5KClcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlhbPpl63osYblrZDkuI3otrPlvLnnqpdcbiAgICAgKi9cbiAgICBfY2xvc2VJbnN1ZmZpY2llbnRHb2xkUG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5faW5zdWZmaWNpZW50R29sZFBvcHVwKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkUG9wdXAuZGVzdHJveSgpXG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkUG9wdXAgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2luc3VmZmljaWVudEdvbGRNYXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnN1ZmZpY2llbnRHb2xkTWFzay5kZXN0cm95KClcbiAgICAgICAgICAgIHRoaXMuX2luc3VmZmljaWVudEdvbGRNYXNrID0gbnVsbFxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6KeC55yL5r+A5Yqx6KeG6aKR5bm/5ZGK6I635Y+W6LGG5a2QXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSDlm57osIPlh73mlbDvvIzlj4LmlbDkuLrmmK/lkKbmiJDlip9cbiAgICAgKi9cbiAgICBfd2F0Y2hBZEZvckdvbGQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJ5bm/5ZGKU0RL77yI5Y+v5qC55o2u5a6e6ZmF6ZuG5oiQ55qE5bm/5ZGKU0RL6LCD5pW077yJXG4gICAgICAgIC8vIOi/memHjOaPkOS+m+S4gOS4qumAmueUqOeahOWunueOsOahhuaetlxuICAgICAgICBcbiAgICAgICAgLy8g5pa55byPMTog5aaC5p6c6ZuG5oiQ5LqG56m/5bGx55Sy5bm/5ZGKU0RLIChCeXRlZGFuY2UpXG4gICAgICAgIGlmICh0eXBlb2YgdHQgIT09ICd1bmRlZmluZWQnICYmIHR0LnNob3dSZXdhcmRlZFZpZGVvQWQpIHtcbiAgICAgICAgICAgIHR0LnNob3dSZXdhcmRlZFZpZGVvQWQoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlub/lkYrop4LnnIvmiJDlip/vvIzlpZblirHosYblrZBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmV3YXJkR29sZEFmdGVyQWQoY2FsbGJhY2spXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5bm/5ZGK6KeC55yL5aSx6LSlXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5bm/5ZGK5Yqg6L295aSx6LSl77yM6K+356iN5ZCO6YeN6K+VXCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnlvI8yOiDlpoLmnpzpm4bmiJDkuoblvq7kv6HlsI/muLjmiI/lub/lkYpTREtcbiAgICAgICAgaWYgKHR5cGVvZiB3eCAhPT0gJ3VuZGVmaW5lZCcgJiYgd3guY3JlYXRlUmV3YXJkZWRWaWRlb0FkKSB7XG4gICAgICAgICAgICB2YXIgcmV3YXJkZWRWaWRlb0FkID0gd3guY3JlYXRlUmV3YXJkZWRWaWRlb0FkKHtcbiAgICAgICAgICAgICAgICBhZFVuaXRJZDogJ2FkdW5pdC14eHgnIC8vIOabv+aNouS4uuWunumZheeahOW5v+WRiuWNleWFg0lEXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQub25DbG9zZShmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzICYmIHJlcy5pc0VuZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOeUqOaIt+WujOaVtOingueci+S6huW5v+WRilxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZXdhcmRHb2xkQWZ0ZXJBZChjYWxsYmFjaylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDnlKjmiLfmj5DliY3lhbPpl63kuoblub/lkYpcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLor7flrozmlbTop4LnnIvlub/lkYrojrflj5blpZblirFcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhmYWxzZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQub25FcnJvcihmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuW5v+WRiuWKoOi9veWksei0pe+8jOivt+eojeWQjumHjeivlVwiKVxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXdhcmRlZFZpZGVvQWQuc2hvdygpLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIOWksei0pemHjeivlVxuICAgICAgICAgICAgICAgIHJld2FyZGVkVmlkZW9BZC5sb2FkKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJld2FyZGVkVmlkZW9BZC5zaG93KClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnlvI8zOiDmqKHmi5/lub/lkYrvvIjlvIDlj5HmtYvor5XnlKjvvIlcbiAgICAgICAgLy8g5Zyo5a6e6ZmF5Y+R5biD5pe25bqU6K+l5Yig6Zmk5q2k5YiG5pSv5oiW5pu/5o2i5Li655yf5a6e5bm/5ZGKU0RLXG4gICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5q2j5Zyo5Yqg6L295bm/5ZGKLi4uXCIpXG4gICAgICAgIFxuICAgICAgICAvLyDmqKHmi5/lub/lkYrop4LnnIvov4fnqIvvvIgy56eS5ZCO5aWW5Yqx6LGG5a2Q77yJXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9yZXdhcmRHb2xkQWZ0ZXJBZChjYWxsYmFjaylcbiAgICAgICAgfSwgMjAwMClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlub/lkYrop4LnnIvmiJDlip/lkI7lpZblirHosYblrZBcbiAgICAgKi9cbiAgICBfcmV3YXJkR29sZEFmdGVyR29sZDogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnBsYXllckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZmFsc2UpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aWW5Yqx6LGG5a2Q5pWw6YeP77yI5Y+v5qC55o2u5a6e6ZmF6ZyA5rGC6LCD5pW077yJXG4gICAgICAgIHZhciByZXdhcmRBbW91bnQgPSA1MDAwXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDmnKzlnLDosYblrZDmlbDph49cbiAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS51cGRhdGVHb2xkKHJld2FyZEFtb3VudClcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuWlluWKseaPkOekulxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuiOt+W+lyBcIiArIHRoaXMuX2Zvcm1hdEdvbGQocmV3YXJkQW1vdW50KSArIFwiIOixhuWtkO+8gVwiKVxuICAgICAgICBcbiAgICAgICAgLy8g6YCa55+l5pyN5Yqh56uv77yI5aaC5p6c6ZyA6KaB5ZCM5q2l77yJXG4gICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LnNlbmRBZFJld2FyZCkge1xuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnNlbmRBZFJld2FyZChyZXdhcmRBbW91bnQpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHlub/lkYrop4LnnIvmiJDlip/lkI7lpZblirHosYblrZDvvIjkv67mraPmlrnms5XlkI3mi7zlhpnplJnor6/vvIlcbiAgICAgKi9cbiAgICBfcmV3YXJkR29sZEFmdGVyQWQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWlluWKseixhuWtkOaVsOmHj++8iOWPr+agueaNruWunumZhemcgOaxguiwg+aVtO+8iVxuICAgICAgICB2YXIgcmV3YXJkQW1vdW50ID0gNTAwMFxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5pys5Zyw6LGG5a2Q5pWw6YePXG4gICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEudXBkYXRlR29sZChyZXdhcmRBbW91bnQpXG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrlpZblirHmj5DnpLpcbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLojrflvpcgXCIgKyB0aGlzLl9mb3JtYXRHb2xkKHJld2FyZEFtb3VudCkgKyBcIiDosYblrZDvvIFcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOmAmuefpeacjeWKoeerr++8iOWmguaenOmcgOimgeWQjOatpe+8iVxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5zZW5kQWRSZXdhcmQpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5zZW5kQWRSZXdhcmQocmV3YXJkQW1vdW50KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKHRydWUpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qC85byP5YyW6LGG5a2Q5pWw6YeP5pi+56S6XG4gICAgICovXG4gICAgX2Zvcm1hdEdvbGQ6IGZ1bmN0aW9uKGdvbGQpIHtcbiAgICAgICAgaWYgKGdvbGQgPj0gMTAwMDApIHtcbiAgICAgICAgICAgIHJldHVybiAoZ29sZCAvIDEwMDAwKS50b0ZpeGVkKDEpICsgXCLkuIdcIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnb2xkLnRvU3RyaW5nKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmmL7npLrmtojmga/mj5DnpLpcbiAgICAgKi9cbiAgICBfc2hvd01lc3NhZ2U6IGZ1bmN0aW9uKG1zZykge1xuICAgICAgICBpZiAodGhpcy50aXBzTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwc0xhYmVsLnN0cmluZyA9IG1zZ1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpcHNMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNMYWJlbC5zdHJpbmcgPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDov5Tlm57lpKfljoVcbiAgICAgKi9cbiAgICBfcmV0dXJuVG9Mb2JieTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIblvZPliY3muLjmiI/nirbmgIFcbiAgICAgICAgdGhpcy5fcmVzZXRHYW1lU3RhdGUoKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R6YCB56a75byA5oi/6Ze06K+35rGCXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20pIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20oKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW19yZXR1cm5Ub0xvYmJ5XSBteWdsb2JhbC5zb2NrZXQubGVhdmVSb29tIOS4jeWPr+eUqFwiKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3lpKfljoXlnLrmma9cbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDph43nva7muLjmiI/nirbmgIFcbiAgICAgKi9cbiAgICBfcmVzZXRHYW1lU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmuIXnkIbmiYvniYxcbiAgICAgICAgdGhpcy5oYW5kQ2FyZHMgPSBbXVxuICAgICAgICB0aGlzLmJvdHRvbUNhcmRzID0gW11cbiAgICAgICAgdGhpcy5jaG9vc2VfY2FyZF9kYXRhID0gW11cbiAgICAgICAgXG4gICAgICAgIC8vIOa4heeQhuWNoeeJjOiKgueCuVxuICAgICAgICB0aGlzLmNsZWFyQWxsQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea4heeQhuaJgOacieeOqeWutueahOWHuueJjOWMuuWfn++8iOahjOmdouS4iueahOeJjO+8iVxuICAgICAgICB0aGlzLl9jbGVhckFsbE91dENhcmRab25lcygpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5riF55CG5bqV54mM6IqC54K5XG4gICAgICAgIHRoaXMuX2NsZWFyQm90dG9tQ2FyZHMoKVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5ri45oiP6Zi25q61XG4gICAgICAgIHRoaXMuX2dhbWVQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgIHRoaXMuX2JpZGRpbmdQaGFzZSA9IFwiaWRsZVwiXG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/miYDmnIlVSVxuICAgICAgICB0aGlzLl9oaWRlUm9iVUkoKVxuICAgICAgICBpZiAodGhpcy5wbGF5aW5nVUlfbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5wbGF5aW5nVUlfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR6YeN572u5omA5pyJ546p5a6255qE5YeG5aSH5Zu+5qCH54q25oCBXG4gICAgICAgIHRoaXMuX3Jlc2V0QWxsUGxheWVyUmVhZHlTdGF0ZSgpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5riF55CG5omA5pyJ546p5a6255qE5Ye654mM5Yy65Z+fXG4gICAgICovXG4gICAgX2NsZWFyQWxsT3V0Q2FyZFpvbmVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmt7vliqDmm7TlrozmlbTnmoTnqbrlgLzmo4Dmn6VcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUgfHwgIXRoaXMubm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn46uIFtfY2xlYXJBbGxPdXRDYXJkWm9uZXNdIHRoaXMubm9kZSDkuLrnqbrmiJblt7LplIDmr4FcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5YgZ2FtZVNjZW5lIOiEmuacrFxuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQgPyB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKSA6IG51bGxcbiAgICAgICAgaWYgKCFnYW1lU2NlbmVfc2NyaXB0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn46uIFtfY2xlYXJBbGxPdXRDYXJkWm9uZXNdIOaXoOazleiOt+WPliBnYW1lU2NlbmVcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnjqnlrrbluqfkvY3oioLngrlcbiAgICAgICAgdmFyIHBsYXllcnNfc2VhdF9wb3MgPSBnYW1lU2NlbmVfc2NyaXB0LnBsYXllcnNfc2VhdF9wb3NcbiAgICAgICAgaWYgKCFwbGF5ZXJzX3NlYXRfcG9zKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn46uIFtfY2xlYXJBbGxPdXRDYXJkWm9uZXNdIOaXoOazleiOt+WPliBwbGF5ZXJzX3NlYXRfcG9zXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YGN5Y6G5omA5pyJ5bqn5L2N77yM5riF55CG5Ye654mM5Yy65Z+fXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHBsYXllcnNfc2VhdF9wb3MuY2hpbGRyZW5cbiAgICAgICAgaWYgKCFjaGlsZHJlbikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbX2NsZWFyQWxsT3V0Q2FyZFpvbmVzXSBwbGF5ZXJzX3NlYXRfcG9zLmNoaWxkcmVuIOS4uuepulwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzZWF0Tm9kZSA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICBpZiAoIXNlYXROb2RlKSBjb250aW51ZVxuICAgICAgICAgICAgLy8g5p+l5om+5Ye654mM5Yy65Z+f6IqC54K577yIY2FyZHNvdXR6b25lMCwgY2FyZHNvdXR6b25lMSwgY2FyZHNvdXR6b25lMu+8iVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3V0Wm9uZU5hbWUgPSBcImNhcmRzb3V0em9uZVwiICsgalxuICAgICAgICAgICAgICAgIHZhciBvdXRab25lID0gc2VhdE5vZGUuZ2V0Q2hpbGRCeU5hbWUob3V0Wm9uZU5hbWUpXG4gICAgICAgICAgICAgICAgaWYgKG91dFpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0Wm9uZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkea4heeQhuW6leeJjOiKgueCuVxuICAgICAqL1xuICAgIF9jbGVhckJvdHRvbUNhcmRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOmUgOavgeW6leeJjOiKgueCuVxuICAgICAgICBpZiAodGhpcy5ib3R0b21fY2FyZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJvdHRvbV9jYXJkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm90dG9tX2NhcmRbaV0gJiYgdGhpcy5ib3R0b21fY2FyZFtpXS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tX2NhcmRbaV0uZGVzdHJveSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm90dG9tX2NhcmQgPSBbXVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkemHjee9ruaJgOacieeOqeWutueahOWHhuWkh+Wbvuagh+eKtuaAgVxuICAgICAqL1xuICAgIF9yZXNldEFsbFBsYXllclJlYWR5U3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQgPyB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKSA6IG51bGxcbiAgICAgICAgaWYgKCFnYW1lU2NlbmVfc2NyaXB0IHx8ICFnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgIGlmIChwbGF5ZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllclNjcmlwdCA9IHBsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyU2NyaXB0ICYmIHBsYXllclNjcmlwdC5yZWFkeWltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5yZWFkeWltYWdlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pu05paw546p5a626IqC54K555qE6YeR5biB5pi+56S6XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllcklkIC0g546p5a62SURcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZ29sZCAtIOaWsOeahOmHkeW4geaVsOmHj1xuICAgICAqL1xuICAgIF91cGRhdGVQbGF5ZXJHb2xkRGlzcGxheTogZnVuY3Rpb24ocGxheWVySWQsIGdvbGQpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPliBnYW1lU2NlbmUg6ISa5pysXG4gICAgICAgIHZhciBnYW1lU2NlbmVfc2NyaXB0ID0gdGhpcy5ub2RlLnBhcmVudCA/IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpIDogbnVsbFxuICAgICAgICBpZiAoIWdhbWVTY2VuZV9zY3JpcHQgfHwgIWdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3QpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfj4YgW191cGRhdGVQbGF5ZXJHb2xkRGlzcGxheV0g5peg5rOV6I635Y+WIGdhbWVTY2VuZSDmiJYgcGxheWVyTm9kZUxpc3RcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpgY3ljobmiYDmnInnjqnlrrboioLngrnvvIzmib7liLDljLnphY3nmoTnjqnlrrblubbmm7TmlrDph5HluIHmmL7npLpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyTm9kZSA9IGdhbWVTY2VuZV9zY3JpcHQucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgIGlmICghcGxheWVyTm9kZSkgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBsYXllclNjcmlwdCA9IHBsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgIGlmICghcGxheWVyU2NyaXB0KSBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDljLnphY3njqnlrrZJRFxuICAgICAgICAgICAgaWYgKFN0cmluZyhwbGF5ZXJTY3JpcHQuYWNjb3VudGlkKSA9PT0gU3RyaW5nKHBsYXllcklkKSkge1xuICAgICAgICAgICAgICAgIC8vIOabtOaWsOmHkeW4geaYvuekulxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJTY3JpcHQuZ2xvYmFsY291bnRfbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2NyaXB0Lmdsb2JhbGNvdW50X2xhYmVsLnN0cmluZyA9IFN0cmluZyhnb2xkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmm7TmlrDnjqnlrrboioLngrnnmoTnq57mioDluIHmmL7npLrvvIjnq57mioDlnLrmqKHlvI/kuJPnlKjvvIlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGxheWVySWQgLSDnjqnlrrZJRFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBtYXRjaENvaW4gLSDmlrDnmoTnq57mioDluIHmlbDph49cbiAgICAgKi9cbiAgICBfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24ocGxheWVySWQsIG1hdGNoQ29pbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW191cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5XSDmm7TmlrDnjqnlrrbnq57mioDluIE6IHBsYXllcklkPVwiLCBwbGF5ZXJJZCwgXCJtYXRjaENvaW49XCIsIG1hdGNoQ29pbilcblxuICAgICAgICAvLyDojrflj5YgZ2FtZVNjZW5lIOiEmuacrFxuICAgICAgICB2YXIgZ2FtZVNjZW5lX3NjcmlwdCA9IHRoaXMubm9kZS5wYXJlbnQgPyB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChcImdhbWVTY2VuZVwiKSA6IG51bGxcbiAgICAgICAgaWYgKCFnYW1lU2NlbmVfc2NyaXB0IHx8ICFnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4+f77iPIFtfdXBkYXRlUGxheWVyTWF0Y2hDb2luRGlzcGxheV0g5peg5rOV6I635Y+WIGdhbWVTY2VuZSDmiJYgcGxheWVyTm9kZUxpc3RcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g6YGN5Y6G5omA5pyJ546p5a626IqC54K577yM5om+5Yiw5Yy56YWN55qE546p5a625bm25pu05paw56ue5oqA5biB5pi+56S6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZVNjZW5lX3NjcmlwdC5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBsYXllck5vZGUgPSBnYW1lU2NlbmVfc2NyaXB0LnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICBpZiAoIXBsYXllck5vZGUpIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIHZhciBwbGF5ZXJTY3JpcHQgPSBwbGF5ZXJOb2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICBpZiAoIXBsYXllclNjcmlwdCkgY29udGludWVcblxuICAgICAgICAgICAgLy8g5Yy56YWN546p5a62SURcbiAgICAgICAgICAgIGlmIChTdHJpbmcocGxheWVyU2NyaXB0LmFjY291bnRpZCkgPT09IFN0cmluZyhwbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDnq57mioDluIHmmL7npLpcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyU2NyaXB0Lmdsb2JhbGNvdW50X2xhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5nbG9iYWxjb3VudF9sYWJlbC5zdHJpbmcgPSBTdHJpbmcobWF0Y2hDb2luKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW191cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5XSDlt7Lmm7TmlrDnjqnlrrYgXCIsIHBsYXllcklkLCBcIiDnmoTnq57mioDluIHmmL7npLrkuLogXCIsIG1hdGNoQ29pbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOernuaKgOW4geWIsOeOqeWutuiEmuacrOWunuS+i1xuICAgICAgICAgICAgICAgIHBsYXllclNjcmlwdC5fbWF0Y2hDb2luID0gbWF0Y2hDb2luXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDjgJDnq57mioDlnLrjgJHlip/og73lh73mlbBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHmmL7npLrnq57mioDlnLrkuJPnlKjnu5PnrpflvLnnqpdcbiAgICAgKiDnq57mioDlnLrnu5PnrpfpobXkuI7mma7pgJrlnLrkuI3lkIzvvJpcbiAgICAgKiAtIOWPquaYvuekuu+8mui+k+i1ouOAgeWAjeaVsOOAgeW9k+WJjeavlOi1m+mHkeW4gVxuICAgICAqIC0g5LiN5pi+56S677ya57un57ut5ri45oiP44CB6L+U5Zue5aSn5Y6F5oyJ6ZKuXG4gICAgICogLSDmmL7npLrvvJpcIuS4i+S4gOWxgOW8gOWniyAxNeenklwiIOWAkuiuoeaXtlxuICAgICAqIFxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlpoLmnpzmmK/mnIDnu4jnu5PnrpfvvIjlj6rmnIkz5Lq677yJ77yM6Lez6L+H5q2k5by556qX77yM562J5b6FIG9uQ29tcGV0aXRpb25DaGFtcGlvbiDmtojmga/mmL7npLrmjpLlkI1cbiAgICAgKi9cbiAgICBfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5qOA5p+l5piv5ZCm5piv5pyA57uI57uT566X77yI5Y+q5pyJM+S6uuWPgui1m++8iVxuICAgICAgICAvLyDlpoLmnpzmmK/mnIDnu4jnu5PnrpfvvIzot7Pov4fmraTlvLnnqpfvvIznrYnlvoUgb25Db21wZXRpdGlvbkNoYW1waW9uIOa2iOaBr+aYvuekuuaOkuWQjVxuICAgICAgICBpZiAoZGF0YS5pc19maW5hbF9yb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtfc2hvd0NvbXBldGl0aW9uUmVzdWx0UG9wdXBdIOajgOa1i+WIsOacgOe7iOe7k+eul++8iOWPquaciTPkurrvvInvvIzot7Pov4fkuK3pl7Tnu5PnrpflvLnnqpfvvIznrYnlvoXmjpLlkI3mtojmga9cIilcbiAgICAgICAgICAgIC8vIOS4jeaYvuekuuS4remXtOW8ueeql++8jOebtOaOpeetieW+hSBvbkNvbXBldGl0aW9uQ2hhbXBpb24g5raI5oGvXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHdpblNpemUgPSBjYy53aW5TaXplXG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgdmFyIG15UGxheWVySWQgPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpLmlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SURcbiAgICAgICAgXG4gICAgICAgIC8vIOWIpOaWrei+k+i1olxuICAgICAgICB2YXIgaXNXaW5uZXIgPSBmYWxzZVxuICAgICAgICB2YXIgbXlXaW5Hb2xkID0gMFxuICAgICAgICB2YXIgbXlNYXRjaENvaW4gPSAwICAvLyDwn5Sn44CQ5paw5aKe44CR5b2T5YmN546p5a6255qE6YeR5biB77yI5LuOZGF0YS5wbGF5ZXJz6I635Y+W77yJXG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5wbGF5ZXJzICYmIGRhdGEucGxheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcnNbaV1cbiAgICAgICAgICAgICAgICBpZiAoU3RyaW5nKHBsYXllci5wbGF5ZXJfaWQpID09PSBTdHJpbmcobXlQbGF5ZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNXaW5uZXIgPSBwbGF5ZXIuaXNfd2lubmVyXG4gICAgICAgICAgICAgICAgICAgIG15V2luR29sZCA9IHBsYXllci53aW5fZ29sZFxuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LuO5pyN5Yqh56uv6L+U5Zue55qE546p5a625pWw5o2u5Lit6I635Y+W6YeR5biBXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIubWF0Y2hfY29pbiAhPT0gdW5kZWZpbmVkICYmIHBsYXllci5tYXRjaF9jb2luID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG15TWF0Y2hDb2luID0gcGxheWVyLm1hdGNoX2NvaW5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeabtOaWsOW9k+WJjeeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICB0aGlzLl9tYXRjaENvaW4gPSBteU1hdGNoQ29pblxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmm7TmlrDmiYDmnInnjqnlrrbnmoTph5HluIHmmL7npLpcbiAgICAgICAgaWYgKGRhdGEucGxheWVycyAmJiBkYXRhLnBsYXllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXJzW2ldXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllcklkID0gcGxheWVyLnBsYXllcl9pZFxuICAgICAgICAgICAgICAgIHZhciBtYXRjaENvaW4gPSBwbGF5ZXIubWF0Y2hfY29pblxuXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeernuaKgOWcuuaooeW8j+S4i+abtOaWsOeOqeWutueahOmHkeW4geaYvuekulxuICAgICAgICAgICAgICAgIGlmIChtYXRjaENvaW4gIT09IHVuZGVmaW5lZCAmJiBtYXRjaENvaW4gPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJNYXRjaENvaW5EaXNwbGF5KHBsYXllcklkLCBtYXRjaENvaW4pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyDpga7nvanlsYJcbiAgICAgICAgdmFyIG1hc2tOb2RlID0gbmV3IGNjLk5vZGUoXCJDb21wZXRpdGlvblJlc3VsdE1hc2tcIilcbiAgICAgICAgbWFza05vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIG1hc2tOb2RlLmNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMCwgMzAsIDUwKSA6IG5ldyBjYy5Db2xvcigzMCwgMCwgMClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDIwMFxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS56SW5kZXggPSA5OTlcbiAgICAgICAgbWFza05vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29tcGV0aXRpb25SZXN1bHRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIHZhciBwb3B1cFdpZHRoID0gNDUwXG4gICAgICAgIHZhciBwb3B1cEhlaWdodCA9IDM4MCAgLy8g8J+Up+OAkOiwg+aVtOOAkeWinuWKoOmrmOW6puS7peWuuee6s+WAkuiuoeaXtlxuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGlzV2lubmVyID8gbmV3IGNjLkNvbG9yKDQwLCA1MCwgODAsIDI0MCkgOiBuZXcgY2MuQ29sb3IoNTAsIDM1LCA0MCwgMjQwKVxuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuZmlsbCgpXG4gICAgICAgIGJnLnN0cm9rZUNvbG9yID0gaXNXaW5uZXIgPyBuZXcgY2MuQ29sb3IoMTAwLCAyMDAsIDI1NSkgOiBuZXcgY2MuQ29sb3IoMjAwLCAxMDAsIDEwMClcbiAgICAgICAgYmcubGluZVdpZHRoID0gM1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBpc1dpbm5lciA/IFwi8J+OiSDog5zliKkg8J+OiVwiIDogXCLinJYg5aSx6LSlIOKcllwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAzNlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBpc1dpbm5lciA/IG5ldyBjYy5Db2xvcigxMDAsIDI1NSwgMjAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDE1MCwgMTUwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA1MFxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR6L6T6LWi6YeR6aKdIC0g56ue5oqA5Zy65pi+56S6XCLph5HluIFcIu+8iOS4jeaYr+ernuaKgOW4ge+8iVxuICAgICAgICB2YXIgcmVzdWx0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmVzdWx0XCIpXG4gICAgICAgIHZhciByZXN1bHRMYWJlbCA9IHJlc3VsdE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICByZXN1bHRMYWJlbC5zdHJpbmcgPSBcIuacrOWxgOe7k+aenDogXCIgKyAobXlXaW5Hb2xkID49IDAgPyBcIitcIiA6IFwiXCIpICsgbXlXaW5Hb2xkICsgXCIg6YeR5biBXCJcbiAgICAgICAgcmVzdWx0TGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICByZXN1bHROb2RlLmNvbG9yID0gbXlXaW5Hb2xkID49IDAgPyBuZXcgY2MuQ29sb3IoMTAwLCAyNTUsIDEwMCkgOiBuZXcgY2MuQ29sb3IoMjU1LCAxMDAsIDEwMClcbiAgICAgICAgcmVzdWx0Tm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDEwMFxuICAgICAgICByZXN1bHROb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5YCN5pWwXG4gICAgICAgIHZhciBtdWx0aU5vZGUgPSBuZXcgY2MuTm9kZShcIk11bHRpcGxpZXJcIilcbiAgICAgICAgdmFyIG11bHRpTGFiZWwgPSBtdWx0aU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBtdWx0aUxhYmVsLnN0cmluZyA9IFwi5pys5bGA5YCN5pWwOiB4XCIgKyAoZGF0YS5tdWx0aXBsZSB8fCAxKVxuICAgICAgICBtdWx0aUxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgbXVsdGlOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxNTApXG4gICAgICAgIG11bHRpTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE0MFxuICAgICAgICBtdWx0aU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5b2T5YmN6YeR5biB77yI5LiN5piv56ue5oqA5biB77yJXG4gICAgICAgIHZhciBjb2luTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTWF0Y2hDb2luXCIpXG4gICAgICAgIHZhciBjb2luTGFiZWwgPSBjb2luTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvaW5MYWJlbC5zdHJpbmcgPSBcIuW9k+WJjemHkeW4gTogXCIgKyB0aGlzLl9tYXRjaENvaW5cbiAgICAgICAgY29pbkxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgY29pbk5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgY29pbk5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAxODBcbiAgICAgICAgY29pbk5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeernuaKgOWcuuWAkuiuoeaXtlxuICAgICAgICAvLyDkuI3mmL7npLpcIue7p+e7rea4uOaIj1wi5ZKMXCLov5Tlm57lpKfljoVcIuaMiemSrlxuICAgICAgICAvLyDmmL7npLrmnI3liqHnq6/mjqfliLbnmoQzMOenkuWAkuiuoeaXtlxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5LuOIGdhbWVfb3ZlciDmlbDmja7kuK3ojrflj5bliJ3lp4vlgJLorqHml7bvvIznq4vljbPlkK/liqjmnKzlnLDlgJLorqHml7ZcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5LuO5pyN5Yqh56uv5pWw5o2u6I635Y+W5Yid5aeL5YCS6K6h5pe25YC8XG4gICAgICAgIHZhciBpbml0aWFsQ291bnRkb3duID0gZGF0YS5hcmVuYV9jb3VudGRvd24gfHwgMzBcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaYvuekuuWuueWZqFxuICAgICAgICB2YXIgY291bnRkb3duQ29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJDb3VudGRvd25Db250YWluZXJcIilcbiAgICAgICAgY291bnRkb3duQ29udGFpbmVyLnkgPSAtcG9wdXBIZWlnaHQvMiArIDgwXG4gICAgICAgIGNvdW50ZG93bkNvbnRhaW5lci5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaWh+Wtl1xuICAgICAgICB2YXIgY291bnRkb3duTGFiZWwgPSBuZXcgY2MuTm9kZShcIkNvdW50ZG93bkxhYmVsXCIpXG4gICAgICAgIHZhciBjb3VudGRvd25MYWJlbENvbXAgPSBjb3VudGRvd25MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvdW50ZG93bkxhYmVsQ29tcC5zdHJpbmcgPSBcIuS4i+S4gOi9ruWwhuWcqCBcIiArIGluaXRpYWxDb3VudGRvd24gKyBcIiDnp5LlkI7lvIDlp4tcIlxuICAgICAgICBjb3VudGRvd25MYWJlbENvbXAuZm9udFNpemUgPSAyNlxuICAgICAgICBjb3VudGRvd25MYWJlbC5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgIC8vIOmHkem7hOiJslxuICAgICAgICBjb3VudGRvd25MYWJlbC5wYXJlbnQgPSBjb3VudGRvd25Db250YWluZXJcbiAgICAgICAgXG4gICAgICAgIC8vIOWAkuiuoeaXtuaVsOWtl++8iOWkp+WPt+aYvuekuu+8iVxuICAgICAgICB2YXIgY291bnRkb3duTnVtYmVyID0gbmV3IGNjLk5vZGUoXCJDb3VudGRvd25OdW1iZXJcIilcbiAgICAgICAgdmFyIGNvdW50ZG93bk51bWJlckNvbXAgPSBjb3VudGRvd25OdW1iZXIuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb3VudGRvd25OdW1iZXJDb21wLnN0cmluZyA9IFN0cmluZyhpbml0aWFsQ291bnRkb3duKVxuICAgICAgICBjb3VudGRvd25OdW1iZXJDb21wLmZvbnRTaXplID0gNDhcbiAgICAgICAgY291bnRkb3duTnVtYmVyLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGNvdW50ZG93bk51bWJlci55ID0gLTQ1XG4gICAgICAgIGNvdW50ZG93bk51bWJlci5wYXJlbnQgPSBjb3VudGRvd25Db250YWluZXJcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+ueaViOaenFxuICAgICAgICB2YXIgb3V0bGluZSA9IGNvdW50ZG93bk51bWJlci5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuQ29sb3IuQkxBQ0tcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueWHuuWKqOeUu1xuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4zNSwgeyBzY2FsZTogMSwgb3BhY2l0eTogMjU1IH0sIHsgZWFzaW5nOiAnYmFja091dCcgfSlcbiAgICAgICAgICAgIC5zdGFydCgpXG4gICAgICAgIFxuICAgICAgICAvLyDkv53lrZjlvJXnlKhcbiAgICAgICAgdGhpcy5fZ2FtZVJlc3VsdFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2dhbWVSZXN1bHRNYXNrID0gbWFza05vZGVcbiAgICAgICAgdGhpcy5fY291bnRkb3duTGFiZWxOb2RlID0gY291bnRkb3duTGFiZWxcbiAgICAgICAgdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSA9IGNvdW50ZG93bk51bWJlclxuICAgICAgICB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMgPSBpbml0aWFsQ291bnRkb3duXG4gICAgICAgIFxuICAgICAgICAvLyDmkq3mlL7pn7PmlYhcbiAgICAgICAgdGhpcy5fcGxheUdhbWVSZXN1bHRTb3VuZChpc1dpbm5lcilcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR56uL5Y2z5ZCv5Yqo5pys5Zyw5YCS6K6h5pe25a6a5pe25ZmoXG4gICAgICAgIC8vIOWQjOaXtuazqOWGjOacjeWKoeerr+a2iOaBr+ebkeWQrO+8jOWPjOS/nemZqeehruS/neWAkuiuoeaXtuato+W4uOW3peS9nFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgXG4gICAgICAgIC8vIOWQr+WKqOacrOWcsOWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICB0aGlzLl9zdGFydExvY2FsQXJlbmFDb3VudGRvd24oaW5pdGlhbENvdW50ZG93bilcbiAgICAgICAgXG4gICAgICAgIC8vIOazqOWGjOacjeWKoeerr+WAkuiuoeaXtua2iOaBr+ebkeWQrO+8iOS9nOS4uuWkh+S7ve+8iVxuICAgICAgICB0aGlzLl9zZXR1cEFyZW5hQ291bnRkb3duTGlzdGVuZXJzKClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHlkK/liqjmnKzlnLDnq57mioDlnLrlgJLorqHml7ZcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2Vjb25kcyAtIOWIneWni+WAkuiuoeaXtuenkuaVsFxuICAgICAqL1xuICAgIF9zdGFydExvY2FsQXJlbmFDb3VudGRvd246IGZ1bmN0aW9uKHNlY29uZHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19zdGFydExvY2FsQXJlbmFDb3VudGRvd25dIOW8gOWni+WQr+WKqOWAkuiuoeaXtiwgc2Vjb25kczpcIiwgc2Vjb25kcylcbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouS5i+WJjeeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyKSB7XG4gICAgICAgICAgICB0aGlzLnVuc2NoZWR1bGUodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpY2spXG4gICAgICAgICAgICB0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IHNlY29uZHNcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnoa7kv53liJ3lp4tVSeato+ehruaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKHNlY29uZHMpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55SoIGNjLmRpcmVjdG9yIOeahOaXtumXtOiwg+W6pu+8jOehruS/neWcqOaJgOacieaDheWGteS4i+mDveiDveW3peS9nFxuICAgICAgICAvLyDmr4/np5J0aWNr5LiA5qyh77yM5peg6ZmQ6YeN5aSNXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpY2ssIDEsIGNjLm1hY3JvLlJFUEVBVF9GT1JFVkVSLCAxKVxuICAgICAgICB0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGltZXIgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19zdGFydExvY2FsQXJlbmFDb3VudGRvd25dIOacrOWcsOWAkuiuoeaXtuW3suWQr+WKqFwiKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeacrOWcsOernuaKgOWcuuWAkuiuoeaXtlRpY2tcbiAgICAgKi9cbiAgICBfbG9jYWxBcmVuYUNvdW50ZG93blRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYXJlbmFDb3VudGRvd25TZWNvbmRzIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9sb2NhbEFyZW5hQ291bnRkb3duVGljaylcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lciA9IG51bGxcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrXSDlgJLorqHml7bnu5PmnZ/vvIznrYnlvoXmnI3liqHnq6/mtojmga8uLi5cIilcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWAkuiuoeaXtuW9kjDlkI7mmL7npLrnrYnlvoXmj5DnpLrvvIznu6fnu63nrYnlvoXmnI3liqHnq6/mtojmga9cbiAgICAgICAgICAgIC8vIOacjeWKoeerr+S8muWPkemAgSBNc2dBcmVuYUF1dG9SZWFkeSDmiJbmlrDkuIDova7muLjmiI/mtojmga9cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUFyZW5hQ291bnRkb3duVUkoMClcbiAgICAgICAgICAgIHRoaXMuX3Nob3dXYWl0aW5nRm9yU2VydmVyKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMtLVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgdGhpcy5fdXBkYXRlQXJlbmFDb3VudGRvd25VSSh0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19sb2NhbEFyZW5hQ291bnRkb3duVGlja10g5Ymp5L2ZOlwiLCB0aGlzLl9hcmVuYUNvdW50ZG93blNlY29uZHMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5pi+56S6562J5b6F5pyN5Yqh56uv5ZON5bqU5o+Q56S6XG4gICAgICovXG4gICAgX3Nob3dXYWl0aW5nRm9yU2VydmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5YCS6K6h5pe25qCH562+5pi+56S6562J5b6F5o+Q56S6XG4gICAgICAgIGlmICh0aGlzLl9jb3VudGRvd25MYWJlbE5vZGUpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHRoaXMuX2NvdW50ZG93bkxhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBcIuetieW+heacjeWKoeWZqOWTjeW6lC4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+aVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBcIi4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHorr7nva7nq57mioDlnLrlgJLorqHml7bmtojmga/nm5HlkKxcbiAgICAgKiDnm5HlkKzmnI3liqHnq6/mjqjpgIHnmoTlgJLorqHml7bmtojmga/vvIjkvZzkuLrmnKzlnLDlgJLorqHml7bnmoTlpIfku73lkozlkIzmraXvvIlcbiAgICAgKi9cbiAgICBfc2V0dXBBcmVuYUNvdW50ZG93bkxpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+Pn++4jyBbX3NldHVwQXJlbmFDb3VudGRvd25MaXN0ZW5lcnNdIHNvY2tldOacquWIneWni+WMllwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOWAkuiuoeaXtuW8gOWni+a2iOaBr++8iOWmguaenOacjeWKoeerr+mHjeaWsOWPkemAge+8iVxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25BcmVuYVJvdW5kQ291bnRkb3duKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbb25BcmVuYVJvdW5kQ291bnRkb3duXSDmlLbliLDlgJLorqHml7blvIDlp4s6XCIsIGRhdGEpXG4gICAgICAgICAgICAvLyDlkIzmraXmnI3liqHnq6/nmoTlgJLorqHml7blgLxcbiAgICAgICAgICAgIHNlbGYuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IGRhdGEuc2Vjb25kcyB8fCAzMFxuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQXJlbmFDb3VudGRvd25VSShkYXRhLnNlY29uZHMpXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzlgJLorqHml7bmr4/np5Lmm7TmlrDmtojmga/vvIjlkIzmraXmnI3liqHnq6/nmoTlgJLorqHml7bvvIlcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQXJlbmFDb3VudGRvd25UaWNrKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbb25BcmVuYUNvdW50ZG93blRpY2tdIOacjeWKoeerr+WAkuiuoeaXtuWQjOatpTpcIiwgZGF0YS5zZWNvbmRzKVxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruOAkeWQjOatpeacjeWKoeerr+eahOWAkuiuoeaXtuWAvO+8jOehruS/neS4juacjeWKoeerr+S4gOiHtFxuICAgICAgICAgICAgc2VsZi5fYXJlbmFDb3VudGRvd25TZWNvbmRzID0gZGF0YS5zZWNvbmRzXG4gICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKGRhdGEuc2Vjb25kcylcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIC8vIOebkeWQrOiHquWKqOWHhuWkh+a2iOaBr1xuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25BcmVuYUF1dG9SZWFkeShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW29uQXJlbmFBdXRvUmVhZHldIOiHquWKqOWHhuWkhzpcIiwgZGF0YS5tZXNzYWdlKVxuICAgICAgICAgICAgLy8g5YGc5q2i5pys5Zyw5YCS6K6h5pe2XG4gICAgICAgICAgICBpZiAoc2VsZi5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bnNjaGVkdWxlKHNlbGYuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lciA9IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuX3Nob3dBcmVuYUF1dG9SZWFkeU1lc3NhZ2UoZGF0YS5tZXNzYWdlKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5pat57q/6YeN6L+e54q25oCB5oGi5aSNXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkFyZW5hUmVjb25uZWN0U3RhdGUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtvbkFyZW5hUmVjb25uZWN0U3RhdGVdIOeKtuaAgeaBouWkjTpcIiwgZGF0YSlcbiAgICAgICAgICAgIGlmIChkYXRhLnBoYXNlID09PSBcImNvdW50ZG93blwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fYXJlbmFDb3VudGRvd25TZWNvbmRzID0gZGF0YS5jb3VudGRvd25cbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYUNvdW50ZG93blVJKGRhdGEuY291bnRkb3duKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeabtOaWsOernuaKgOWcuuWAkuiuoeaXtlVJXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNlY29uZHMgLSDliankvZnnp5LmlbBcbiAgICAgKi9cbiAgICBfdXBkYXRlQXJlbmFDb3VudGRvd25VSTogZnVuY3Rpb24oc2Vjb25kcykge1xuICAgICAgICAvLyDmm7TmlrDmloflrZdcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZG93bkxhYmVsTm9kZSkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5fY291bnRkb3duTGFiZWxOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5LiL5LiA6L2u5bCG5ZyoIFwiICsgc2Vjb25kcyArIFwiIOenkuWQjuW8gOWni1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOaVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdmFyIG51bUxhYmVsID0gdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobnVtTGFiZWwpIHtcbiAgICAgICAgICAgICAgICBudW1MYWJlbC5zdHJpbmcgPSBTdHJpbmcoc2Vjb25kcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pyA5ZCONeenkumXqueDgeaViOaenFxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gNSAmJiBzZWNvbmRzID4gMCkge1xuICAgICAgICAgICAgICAgIGNjLnR3ZWVuKHRoaXMuX2NvdW50ZG93bk51bWJlck5vZGUpXG4gICAgICAgICAgICAgICAgICAgIC50bygwLjEsIHsgc2NhbGU6IDEuMiB9KVxuICAgICAgICAgICAgICAgICAgICAudG8oMC4xLCB7IHNjYWxlOiAxLjAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlj5jnuqJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3VudGRvd25OdW1iZXJOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMTAwLCAxMDApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvdW50ZG93bk51bWJlck5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWBnOatouernuaKgOWcuuWAkuiuoeaXtlxuICAgICAqL1xuICAgIF9zdG9wQXJlbmFDb3VudGRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlgZzmraLmnKzlnLDlgJLorqHml7blrprml7blmahcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtfc3RvcEFyZW5hQ291bnRkb3duXSDlt7LlgZzmraLmnKzlnLDlgJLorqHml7ZcIilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6YeN572u5YCS6K6h5pe256eS5pWwXG4gICAgICAgIHRoaXMuX2FyZW5hQ291bnRkb3duU2Vjb25kcyA9IDBcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmmL7npLrnq57mioDlnLroh6rliqjlh4blpIfmtojmga9cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSAtIOa2iOaBr+WGheWuuVxuICAgICAqL1xuICAgIF9zaG93QXJlbmFBdXRvUmVhZHlNZXNzYWdlOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIC8vIOabtOaWsOWAkuiuoeaXtuaYvuekuuS4uuiHquWKqOWHhuWkh+a2iOaBr1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTGFiZWxOb2RlKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLl9jb3VudGRvd25MYWJlbE5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gbWVzc2FnZSB8fCBcIuezu+e7n+W3suiHquWKqOWHhuWkh1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+aVsOWtl1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTnVtYmVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fY291bnRkb3duTnVtYmVyTm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIbnq57mioDlnLrnirbmgIHmm7TmlrBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcm9vbV9jYXRlZ29yeSwgcm91bmQsIHRvdGFsX3JvdW5kcywgbWF0Y2hfY29pbiwgLi4uIH1cbiAgICAgKi9cbiAgICBfb25Db21wZXRpdGlvblN0YXR1czogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5faXNDb21wZXRpdGlvbiA9IChkYXRhLnJvb21fY2F0ZWdvcnkgPT09IDIpXG4gICAgICAgIHRoaXMuX3Jvb21DYXRlZ29yeSA9IGRhdGEucm9vbV9jYXRlZ29yeSB8fCAxXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uUm91bmQgPSBkYXRhLnJvdW5kIHx8IDBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Ub3RhbFJvdW5kcyA9IGRhdGEudG90YWxfcm91bmRzIHx8IDBcbiAgICAgICAgdGhpcy5fbWF0Y2hDb2luID0gZGF0YS5tYXRjaF9jb2luIHx8IDBcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOaYr+ernuaKgOWcuuaooeW8j++8jOaYvuekuuavlOi1m+mHkeW4gVxuICAgICAgICBpZiAodGhpcy5faXNDb21wZXRpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5WQ44CQ56ue5oqA5Zy644CR5aSE55CG56ue5oqA5Zy65YCS6K6h5pe2XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSB7IGNvdW50ZG93biwgbWVzc2FnZSB9XG4gICAgICovXG4gICAgX29uQ29tcGV0aXRpb25Db3VudGRvd246IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duID0gZGF0YS5jb3VudGRvd24gfHwgMTVcbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouS5i+WJjeeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fY29tcGV0aXRpb25Db3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duVGljaylcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5byA5aeL5paw55qE5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5fY29tcGV0aXRpb25Db3VudGRvd25UaWNrLCAxKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+VkOOAkOernuaKgOWcuuOAkeernuaKgOWcuuWAkuiuoeaXtlRpY2tcbiAgICAgKi9cbiAgICBfY29tcGV0aXRpb25Db3VudGRvd25UaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBldGl0aW9uQ291bnRkb3duIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9jb21wZXRpdGlvbkNvdW50ZG93blRpY2spXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Db3VudGRvd24tLVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5YCS6K6h5pe25pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBldGl0aW9uQ291bnRkb3duRGlzcGxheSgpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5WQ44CQ56ue5oqA5Zy644CR5pu05paw56ue5oqA5Zy65YCS6K6h5pe25pi+56S6XG4gICAgICovXG4gICAgX3VwZGF0ZUNvbXBldGl0aW9uQ291bnRkb3duRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWmguaenOaciee7k+eul+W8ueeql++8jOabtOaWsOWFtuS4reeahOWAkuiuoeaXtlxuICAgICAgICBpZiAodGhpcy5fZ2FtZVJlc3VsdFBvcHVwKSB7XG4gICAgICAgICAgICB2YXIgY291bnRkb3duTGFiZWwgPSB0aGlzLl9nYW1lUmVzdWx0UG9wdXAuZ2V0Q2hpbGRCeU5hbWUoXCJDb21wZXRpdGlvbkNvdW50ZG93blwiKVxuICAgICAgICAgICAgaWYgKGNvdW50ZG93bkxhYmVsICYmIGNvdW50ZG93bkxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkpIHtcbiAgICAgICAgICAgICAgICBjb3VudGRvd25MYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFwi5LiL5LiA5bGA5byA5aeLIFwiICsgdGhpcy5fY29tcGV0aXRpb25Db3VudGRvd24gKyBcIuenklwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHlpITnkIbmr5TotZvph5HluIHmm7TmlrBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGxheWVyX2lkLCBtYXRjaF9jb2luLCBkZWx0YSB9XG4gICAgICovXG4gICAgX29uTWF0Y2hDb2luVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHZhciBteVBsYXllcklkID0gbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKS5pZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElEXG4gICAgICAgIFxuICAgICAgICAvLyDlj6rmm7TmlrDoh6rlt7HnmoTmr5TotZvph5HluIFcbiAgICAgICAgaWYgKFN0cmluZyhkYXRhLnBsYXllcl9pZCkgPT09IFN0cmluZyhteVBsYXllcklkKSkge1xuICAgICAgICAgICAgdGhpcy5fbWF0Y2hDb2luID0gZGF0YS5tYXRjaF9jb2luXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVNYXRjaENvaW5EaXNwbGF5KGRhdGEubWF0Y2hfY29pbiwgZGF0YS5kZWx0YSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+qmeOAkOernuaKgOWcuuOAkeaYvuekuuavlOi1m+mHkeW4geaYvuekulxuICAgICAqL1xuICAgIF9zaG93TWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suWtmOWcqOavlOi1m+mHkeW4geaYvuekuuiKgueCuVxuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKCFteWdsb2JhbCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmr5TotZvph5HluIHmmL7npLroioLngrlcbiAgICAgICAgdmFyIG1hdGNoQ29pbk5vZGUgPSBuZXcgY2MuTm9kZShcIk1hdGNoQ29pbkRpc3BsYXlcIilcbiAgICAgICAgbWF0Y2hDb2luTm9kZS5zZXRQb3NpdGlvbigtMjAwLCAyODApICAvLyDlt6bkuIrop5LkvY3nva5cbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQwLCA4MCwgMjAwKVxuICAgICAgICBiZy5yb3VuZFJlY3QoLTgwLCAtMjAsIDE2MCwgNDAsIDEwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IG1hdGNoQ29pbk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWbvuagh++8iOmHkeW4geWbvuagh++8iVxuICAgICAgICB2YXIgaWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIkljb25cIilcbiAgICAgICAgdmFyIGljb25MYWJlbCA9IGljb25Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgaWNvbkxhYmVsLnN0cmluZyA9IFwi8J+qmVwiXG4gICAgICAgIGljb25MYWJlbC5mb250U2l6ZSA9IDIwXG4gICAgICAgIGljb25Ob2RlLnNldFBvc2l0aW9uKC01NSwgMClcbiAgICAgICAgaWNvbk5vZGUucGFyZW50ID0gbWF0Y2hDb2luTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH562+XG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHZhciBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5q+U6LWb6YeR5biBXCJcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxNFxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgbGFiZWxOb2RlLnNldFBvc2l0aW9uKC0yMCwgMClcbiAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IG1hdGNoQ29pbk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaVsOWAvFxuICAgICAgICB2YXIgdmFsdWVOb2RlID0gbmV3IGNjLk5vZGUoXCJWYWx1ZVwiKVxuICAgICAgICB2YWx1ZU5vZGUubmFtZSA9IFwiTWF0Y2hDb2luVmFsdWVcIlxuICAgICAgICB2YXIgdmFsdWVMYWJlbCA9IHZhbHVlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhbHVlTGFiZWwuc3RyaW5nID0gU3RyaW5nKHRoaXMuX21hdGNoQ29pbilcbiAgICAgICAgdmFsdWVMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIHZhbHVlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIyMCwgMTAwKVxuICAgICAgICB2YWx1ZU5vZGUuc2V0UG9zaXRpb24oNDUsIDApXG4gICAgICAgIHZhbHVlTm9kZS5wYXJlbnQgPSBtYXRjaENvaW5Ob2RlXG4gICAgICAgIFxuICAgICAgICBtYXRjaENvaW5Ob2RlLnBhcmVudCA9IHRoaXMubm9kZVxuICAgICAgICB0aGlzLl9tYXRjaENvaW5Ob2RlID0gbWF0Y2hDb2luTm9kZVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+qmeOAkOernuaKgOWcuuOAkeabtOaWsOavlOi1m+mHkeW4geaYvuekulxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBtYXRjaENvaW4gLSDmlrDnmoTmr5TotZvph5HluIHmlbDph49cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGEgLSDlj5jljJbph49cbiAgICAgKi9cbiAgICBfdXBkYXRlTWF0Y2hDb2luRGlzcGxheTogZnVuY3Rpb24obWF0Y2hDb2luLCBkZWx0YSkge1xuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlTm9kZSA9IHRoaXMuX21hdGNoQ29pbk5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJNYXRjaENvaW5WYWx1ZVwiKVxuICAgICAgICAgICAgaWYgKHZhbHVlTm9kZSAmJiB2YWx1ZU5vZGUuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IFN0cmluZyhtYXRjaENvaW4pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5pyJ5aKe6YeP77yM5pi+56S65Yqo55S7XG4gICAgICAgICAgICAgICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dNYXRjaENvaW5EZWx0YUFuaW1hdGlvbihkZWx0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHmmL7npLrmr5TotZvph5HluIHlj5jljJbliqjnlLtcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGEgLSDlj5jljJbph49cbiAgICAgKi9cbiAgICBfc2hvd01hdGNoQ29pbkRlbHRhQW5pbWF0aW9uOiBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICBpZiAoIXRoaXMuX21hdGNoQ29pbk5vZGUpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65Y+Y5YyW6YeP5pi+56S66IqC54K5XG4gICAgICAgIHZhciBkZWx0YU5vZGUgPSBuZXcgY2MuTm9kZShcIkRlbHRhXCIpXG4gICAgICAgIHZhciBkZWx0YUxhYmVsID0gZGVsdGFOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgZGVsdGFMYWJlbC5zdHJpbmcgPSAoZGVsdGEgPj0gMCA/IFwiK1wiIDogXCJcIikgKyBkZWx0YVxuICAgICAgICBkZWx0YUxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgZGVsdGFOb2RlLmNvbG9yID0gZGVsdGEgPj0gMCA/IG5ldyBjYy5Db2xvcigxMDAsIDI1NSwgMTAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDEwMCwgMTAwKVxuICAgICAgICBkZWx0YU5vZGUuc2V0UG9zaXRpb24oODAsIDApXG4gICAgICAgIGRlbHRhTm9kZS5wYXJlbnQgPSB0aGlzLl9tYXRjaENvaW5Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDpo5jlrZfliqjnlLtcbiAgICAgICAgY2MudHdlZW4oZGVsdGFOb2RlKVxuICAgICAgICAgICAgLnRvKDAuNSwgeyB5OiAzMCwgb3BhY2l0eTogMjU1IH0pXG4gICAgICAgICAgICAudG8oMC41LCB7IHk6IDUwLCBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkZWx0YU5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfqpnjgJDnq57mioDlnLrjgJHpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgKi9cbiAgICBfaGlkZU1hdGNoQ29pbkRpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fbWF0Y2hDb2luTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5fbWF0Y2hDb2luTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIHRoaXMuX21hdGNoQ29pbk5vZGUgPSBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKdjOOAkOernuaKgOWcuuOAkeWkhOeQhua3mOaxsOmAmuefpVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyByYW5rLCByZWFzb24sIHRvdGFsX3BsYXllcnMsIHJld2FyZHMgfVxuICAgICAqL1xuICAgIF9vbkNvbXBldGl0aW9uRWxpbWluYXRlZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgLy8g5YGc5q2i5omA5pyJ5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX3N0b3BQbGF5Q291bnRkb3duKClcbiAgICAgICAgdGhpcy5fc3RvcEJpZENvdW50ZG93bigpXG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgICAgdGhpcy5faGlkZU1hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65reY5rGw5by556qXXG4gICAgICAgIHRoaXMuX3Nob3dFbGltaW5hdGVkUG9wdXAoZGF0YSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKdjOOAkOernuaKgOWcuuOAkeaYvuekuua3mOaxsOW8ueeql1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyByYW5rLCByZWFzb24sIHRvdGFsX3BsYXllcnMsIHJld2FyZHMgfVxuICAgICAqL1xuICAgIF9zaG93RWxpbWluYXRlZFBvcHVwOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemVcbiAgICAgICAgXG4gICAgICAgIHZhciBjYW52YXMgPSBjYy5maW5kKFwiQ2FudmFzXCIpIHx8IGNjLmZpbmQoXCJVSV9ST09UXCIpIHx8IHRoaXMubm9kZS5wYXJlbnRcbiAgICAgICAgaWYgKCFjYW52YXMpIGNhbnZhcyA9IHRoaXMubm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6YGu572p5bGCXG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRWxpbWluYXRlZE1hc2tcIilcbiAgICAgICAgbWFza05vZGUuYWRkQ29tcG9uZW50KGNjLkJsb2NrSW5wdXRFdmVudHMpXG4gICAgICAgIG1hc2tOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDApXG4gICAgICAgIG1hc2tOb2RlLm9wYWNpdHkgPSAxODBcbiAgICAgICAgbWFza05vZGUud2lkdGggPSB3aW5TaXplLndpZHRoICogMlxuICAgICAgICBtYXNrTm9kZS5oZWlnaHQgPSB3aW5TaXplLmhlaWdodCAqIDJcbiAgICAgICAgbWFza05vZGUuekluZGV4ID0gOTk5XG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgLy8g5by556qX5a655ZmoXG4gICAgICAgIHZhciBwb3B1cE5vZGUgPSBuZXcgY2MuTm9kZShcIkVsaW1pbmF0ZWRQb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIHZhciBwb3B1cFdpZHRoID0gNDAwXG4gICAgICAgIHZhciBwb3B1cEhlaWdodCA9IDM1MFxuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig2MCwgNDAsIDUwLCAyNDApXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDIwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxMDAsIDEwMClcbiAgICAgICAgYmcubGluZVdpZHRoID0gM1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXBvcHVwV2lkdGgvMiwgLXBvcHVwSGVpZ2h0LzIsIHBvcHVwV2lkdGgsIHBvcHVwSGVpZ2h0LCAyMClcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuKdjCDmr5TotZvnu5PmnZ8g4p2MXCJcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDMyXG4gICAgICAgIHRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDE1MCwgMTUwKVxuICAgICAgICB0aXRsZU5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA1MFxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI1cbiAgICAgICAgdmFyIHJhbmtOb2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rXCIpXG4gICAgICAgIHZhciByYW5rTGFiZWwgPSByYW5rTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSBcIuacgOe7iOaOkuWQjTog56ysIFwiICsgZGF0YS5yYW5rICsgXCIg5ZCNXCJcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgcmFua05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDE1MClcbiAgICAgICAgcmFua05vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAxMDBcbiAgICAgICAgcmFua05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmt5jmsbDljp/lm6BcbiAgICAgICAgdmFyIHJlYXNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIlJlYXNvblwiKVxuICAgICAgICB2YXIgcmVhc29uTGFiZWwgPSByZWFzb25Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcmVhc29uTGFiZWwuc3RyaW5nID0gZGF0YS5yZWFzb24gfHwgXCLmr5TotZvlpLHliKlcIlxuICAgICAgICByZWFzb25MYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIHJlYXNvbk5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIwMClcbiAgICAgICAgcmVhc29uTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE0MFxuICAgICAgICByZWFzb25Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+C6LWb5Lq65pWwXG4gICAgICAgIHZhciB0b3RhbE5vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsXCIpXG4gICAgICAgIHZhciB0b3RhbExhYmVsID0gdG90YWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsSBcIiArIChkYXRhLnRvdGFsX3BsYXllcnMgfHwgMCkgKyBcIiDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgdG90YWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAxODApXG4gICAgICAgIHRvdGFsTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDE4MFxuICAgICAgICB0b3RhbE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDlpZblirHvvIjlpoLmnpzmnInvvIlcbiAgICAgICAgaWYgKGRhdGEucmV3YXJkcykge1xuICAgICAgICAgICAgdmFyIHJld2FyZE5vZGUgPSBuZXcgY2MuTm9kZShcIlJld2FyZFwiKVxuICAgICAgICAgICAgdmFyIHJld2FyZExhYmVsID0gcmV3YXJkTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICByZXdhcmRMYWJlbC5zdHJpbmcgPSBcIuiOt+W+l+WlluWKsTogXCIgKyAoZGF0YS5yZXdhcmRzLm5hbWUgfHwgSlNPTi5zdHJpbmdpZnkoZGF0YS5yZXdhcmRzKSlcbiAgICAgICAgICAgIHJld2FyZExhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgICAgIHJld2FyZE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgICAgIHJld2FyZE5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSAyMjBcbiAgICAgICAgICAgIHJld2FyZE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOheaMiemSrlxuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmV0dXJuQnRuXCIpXG4gICAgICAgIGJ0bk5vZGUuc2V0Q29udGVudFNpemUoMjAwLCA1MClcbiAgICAgICAgYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgdmFyIGJ0bkJnID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJ0bkJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDgwLCAxNDApXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjUsIDIwMCwgNTAsIDI1KVxuICAgICAgICBidG5CZy5maWxsKClcbiAgICAgICAgYnRuTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyA1MFxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGJ0bkxhYmVsID0gYnRuTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgYnRuTGFiZWwuc3RyaW5nID0gXCLov5Tlm57lpKfljoVcIlxuICAgICAgICBidG5MYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGJ0bkxhYmVsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KVxuICAgICAgICBidG5MYWJlbE5vZGUucGFyZW50ID0gYnRuTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye75LqL5Lu2XG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIOmUgOavgeW8ueeql1xuICAgICAgICAgICAgcG9wdXBOb2RlLmRlc3Ryb3koKVxuICAgICAgICAgICAgbWFza05vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICAvLyDov5Tlm57lpKfljoVcbiAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5by55Ye65Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgIC50bygwLjMsIHsgc2NhbGU6IDEsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fZWxpbWluYXRlZFBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2VsaW1pbmF0ZWRNYXNrID0gbWFza05vZGVcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOKshu+4j+OAkOernuaKgOWcuuOAkeWkhOeQhuaZi+e6p+mAmuefpVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBjdXJyZW50X3JvdW5kLCB0b3RhbF9yb3VuZHMsIG1hdGNoX2NvaW4sIG1lc3NhZ2UgfVxuICAgICAqL1xuICAgIF9vbkNvbXBldGl0aW9uQWR2YW5jZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fY29tcGV0aXRpb25Sb3VuZCA9IGRhdGEuY3VycmVudF9yb3VuZFxuICAgICAgICB0aGlzLl9tYXRjaENvaW4gPSBkYXRhLm1hdGNoX2NvaW5cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOavlOi1m+mHkeW4geaYvuekulxuICAgICAgICB0aGlzLl91cGRhdGVNYXRjaENvaW5EaXNwbGF5KGRhdGEubWF0Y2hfY29pbiwgMClcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuaZi+e6p+aPkOekulxuICAgICAgICB0aGlzLl9zaG93QWR2YW5jZVRvYXN0KGRhdGEpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDirIbvuI/jgJDnq57mioDlnLrjgJHmmL7npLrmmYvnuqfmj5DnpLpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgY3VycmVudF9yb3VuZCwgdG90YWxfcm91bmRzLCBtYXRjaF9jb2luLCBtZXNzYWdlIH1cbiAgICAgKi9cbiAgICBfc2hvd0FkdmFuY2VUb2FzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdmFyIHdpblNpemUgPSBjYy53aW5TaXplXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7pUb2FzdOiKgueCuVxuICAgICAgICB2YXIgdG9hc3ROb2RlID0gbmV3IGNjLk5vZGUoXCJBZHZhbmNlVG9hc3RcIilcbiAgICAgICAgdG9hc3ROb2RlLnNldFBvc2l0aW9uKDAsIDEwMClcbiAgICAgICAgdG9hc3ROb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHRvYXN0Tm9kZS56SW5kZXggPSAyMDAwXG4gICAgICAgIHRvYXN0Tm9kZS5wYXJlbnQgPSB0aGlzLm5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKVxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDEwMCwgNTAsIDIyMClcbiAgICAgICAgYmcucm91bmRSZWN0KC0xNTAsIC0yNSwgMzAwLCA1MCwgMjUpXG4gICAgICAgIGJnLmZpbGwoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gdG9hc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmloflrZdcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIilcbiAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gXCLwn46JIOaZi+e6p+aIkOWKn++8geesrCBcIiArIGRhdGEuY3VycmVudF9yb3VuZCArIFwiL1wiICsgZGF0YS50b3RhbF9yb3VuZHMgKyBcIiDova5cIlxuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIGxhYmVsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjAwKVxuICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gdG9hc3ROb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliqjnlLtcbiAgICAgICAgY2MudHdlZW4odG9hc3ROb2RlKVxuICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAyNTUgfSlcbiAgICAgICAgICAgIC5kZWxheSgyKVxuICAgICAgICAgICAgLnRvKDAuMywgeyBvcGFjaXR5OiAwIH0pXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0b2FzdE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXJ0KClcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIblhqDlhpvlvLnnqpdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcmFuaywgcmV3YXJkcywgcmV3YXJkX3R5cGUsIHJhbmtpbmdzLCBtYXRjaF9jb2luIH1cbiAgICAgKi9cbiAgICBfb25Db21wZXRpdGlvbkNoYW1waW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+avlOi1m+mHkeW4geaYvuekulxuICAgICAgICB0aGlzLl9oaWRlTWF0Y2hDb2luRGlzcGxheSgpXG4gICAgICAgIFxuICAgICAgICAvLyDmmL7npLrlhqDlhpvlvLnnqpdcbiAgICAgICAgdGhpcy5fc2hvd0NoYW1waW9uUG9wdXAoZGF0YSlcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHmmL7npLrlhqDlhpvlvLnnqpdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcmFuaywgcmV3YXJkcywgcmV3YXJkX3R5cGUsIHJhbmtpbmdzLCBtYXRjaF9jb2luIH1cbiAgICAgKiDwn5Sn44CQ6YeN5p6E44CR5pi+56S65a6M5pW055qE5o6S5ZCN5YiX6KGo77yI5YmNMjDlkI3vvInvvIzljIXmi6zlhqDlhpvjgIHkuprlhpvjgIHlraPlhptcbiAgICAgKi9cbiAgICBfc2hvd0NoYW1waW9uUG9wdXA6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6Zet5LmL5YmN55qE57uT566X5by556qX44CRXG4gICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKHRoaXMuX2dhbWVSZXN1bHRQb3B1cCwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmBrue9qeWxglxuICAgICAgICB2YXIgbWFza05vZGUgPSBuZXcgY2MuTm9kZShcIkNoYW1waW9uTWFza1wiKVxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgbWFza05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjAsIDE1LCA0MClcbiAgICAgICAgbWFza05vZGUub3BhY2l0eSA9IDIyMFxuICAgICAgICBtYXNrTm9kZS53aWR0aCA9IHdpblNpemUud2lkdGggKiAyXG4gICAgICAgIG1hc2tOb2RlLmhlaWdodCA9IHdpblNpemUuaGVpZ2h0ICogMlxuICAgICAgICBtYXNrTm9kZS56SW5kZXggPSA5OTlcbiAgICAgICAgbWFza05vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ2hhbXBpb25Qb3B1cFwiKVxuICAgICAgICBwb3B1cE5vZGUuc2NhbGUgPSAwLjVcbiAgICAgICAgcG9wdXBOb2RlLm9wYWNpdHkgPSAwXG4gICAgICAgIHBvcHVwTm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgIHBvcHVwTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDosIPmlbTjgJHlop7lpKflvLnnqpflsLrlr7jku6XlrrnnurPmm7TlpJrmjpLlkI1cbiAgICAgICAgdmFyIHBvcHVwV2lkdGggPSA1MjBcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gNjIwXG4gICAgICAgIFxuICAgICAgICAvLyDog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDQ1LCAzNSwgNzAsIDI0NSlcbiAgICAgICAgYmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIsIC1wb3B1cEhlaWdodC8yLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgMjApXG4gICAgICAgIGJnLmZpbGwoKVxuICAgICAgICBiZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgODApXG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDNcbiAgICAgICAgYmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIsIC1wb3B1cEhlaWdodC8yLCBwb3B1cFdpZHRoLCBwb3B1cEhlaWdodCwgMjApXG4gICAgICAgIGJnLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOagh+mimFxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZVwiKVxuICAgICAgICB2YXIgdGl0bGVMYWJlbCA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gXCLwn4+GIOavlOi1m+e7k+adnyDwn4+GXCJcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDMyXG4gICAgICAgIHRpdGxlTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxMDApXG4gICAgICAgIHRpdGxlTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDQwXG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHliY3kuInlkI3lsZXnpLrljLpcbiAgICAgICAgdmFyIHJhbmtpbmdzID0gZGF0YS5yYW5raW5ncyB8fCBbXVxuICAgICAgICB2YXIgdG9wVGhyZWVZID0gcG9wdXBIZWlnaHQvMiAtIDkwXG4gICAgICAgIFxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIC8vIOWGoOWGm1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUmFua2luZ0l0ZW0ocG9wdXBOb2RlLCByYW5raW5nc1swXSwgMSwgLTEyMCwgdG9wVGhyZWVZKVxuICAgICAgICB9XG4gICAgICAgIGlmIChyYW5raW5ncy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgLy8g5Lqa5YabXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVSYW5raW5nSXRlbShwb3B1cE5vZGUsIHJhbmtpbmdzWzFdLCAyLCAwLCB0b3BUaHJlZVkgLSAyMClcbiAgICAgICAgfVxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgIC8vIOWto+WGm1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUmFua2luZ0l0ZW0ocG9wdXBOb2RlLCByYW5raW5nc1syXSwgMywgMTIwLCB0b3BUaHJlZVkgLSA0MClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeWFtuS7luaOkuWQjeWIl+ihqOagh+mimFxuICAgICAgICBpZiAocmFua2luZ3MubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdmFyIG90aGVyVGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJPdGhlclRpdGxlXCIpXG4gICAgICAgICAgICB2YXIgb3RoZXJUaXRsZUxhYmVsID0gb3RoZXJUaXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgb3RoZXJUaXRsZUxhYmVsLnN0cmluZyA9IFwi4oCU4oCUIOWFtuS7luaOkuWQjSDigJTigJRcIlxuICAgICAgICAgICAgb3RoZXJUaXRsZUxhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgICAgIG90aGVyVGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTgwLCAyMDApXG4gICAgICAgICAgICBvdGhlclRpdGxlTm9kZS55ID0gdG9wVGhyZWVZIC0gMTAwXG4gICAgICAgICAgICBvdGhlclRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeWFtuS7luaOkuWQjeWIl+ihqO+8iOesrDQtMjDlkI3vvIlcbiAgICAgICAgICAgIHZhciBzdGFydFkgPSB0b3BUaHJlZVkgLSAxMzBcbiAgICAgICAgICAgIHZhciBtYXhPdGhlclJhbmtpbmdzID0gTWF0aC5taW4ocmFua2luZ3MubGVuZ3RoLCAyMClcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAzOyBpIDwgbWF4T3RoZXJSYW5raW5nczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmtJbmZvID0gcmFua2luZ3NbaV1cbiAgICAgICAgICAgICAgICB2YXIgcmFua0l0ZW1Ob2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rSXRlbV9cIiArIGkpXG4gICAgICAgICAgICAgICAgdmFyIHJhbmtJdGVtTGFiZWwgPSByYW5rSXRlbU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTGFiZWwuc3RyaW5nID0gXCLnrKxcIiArIHJhbmtJbmZvLnJhbmsgKyBcIuWQjTogXCIgKyByYW5rSW5mby5wbGF5ZXJfbmFtZSArIFwiICDph5HluIE6IFwiICsgcmFua0luZm8ubWF0Y2hfY29pblxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTGFiZWwuZm9udFNpemUgPSAxNlxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjEwKVxuICAgICAgICAgICAgICAgIHJhbmtJdGVtTm9kZS55ID0gc3RhcnRZIC0gKGkgLSAzKSAqIDI0XG4gICAgICAgICAgICAgICAgcmFua0l0ZW1Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7ljLrln59cbiAgICAgICAgdmFyIGJ0blkgPSAtcG9wdXBIZWlnaHQvMiArIDUwXG4gICAgICAgIFxuICAgICAgICAvLyDnoa7lrprmjInpkq5cbiAgICAgICAgdmFyIGNvbmZpcm1CdG4gPSBuZXcgY2MuTm9kZShcIkNvbmZpcm1CdG5cIilcbiAgICAgICAgY29uZmlybUJ0bi5zZXRDb250ZW50U2l6ZSgxODAsIDQ1KVxuICAgICAgICBjb25maXJtQnRuLmFkZENvbXBvbmVudChjYy5CbG9ja0lucHV0RXZlbnRzKVxuICAgICAgICB2YXIgY29uZmlybUJnID0gY29uZmlybUJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNvbmZpcm1CZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjAwLCAxNTAsIDUwKVxuICAgICAgICBjb25maXJtQmcucm91bmRSZWN0KC05MCwgLTIyLjUsIDE4MCwgNDUsIDIyKVxuICAgICAgICBjb25maXJtQmcuZmlsbCgpXG4gICAgICAgIGNvbmZpcm1CdG4ueSA9IGJ0bllcbiAgICAgICAgY29uZmlybUJ0bi5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIHZhciBjb25maXJtTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgY29uZmlybUxhYmVsID0gY29uZmlybUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGNvbmZpcm1MYWJlbC5zdHJpbmcgPSBcIui/lOWbnuWkp+WOhVwiXG4gICAgICAgIGNvbmZpcm1MYWJlbC5mb250U2l6ZSA9IDIwXG4gICAgICAgIGNvbmZpcm1MYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgY29uZmlybUxhYmVsTm9kZS5wYXJlbnQgPSBjb25maXJtQnRuXG4gICAgICAgIFxuICAgICAgICBjb25maXJtQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwb3B1cE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIHNlbGYuX3JldHVyblRvTG9iYnkoKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8g5by55Ye65Yqo55S7XG4gICAgICAgIGNjLnR3ZWVuKHBvcHVwTm9kZSlcbiAgICAgICAgICAgIC50bygwLjQsIHsgc2NhbGU6IDEsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgLy8g57KS5a2Q54m55pWIXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNoYW1waW9uUGFydGljbGVzKHBvcHVwTm9kZSwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQpXG4gICAgICAgIFxuICAgICAgICB0aGlzLl9jaGFtcGlvblBvcHVwID0gcG9wdXBOb2RlXG4gICAgICAgIHRoaXMuX2NoYW1waW9uTWFzayA9IG1hc2tOb2RlXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn4+F44CQ5paw5aKe44CR5Yib5bu65Y2V5Liq5o6S5ZCN6aG5XG4gICAgICogQHBhcmFtIHtjYy5Ob2RlfSBwYXJlbnQgLSDniLboioLngrlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcmFua0luZm8gLSDmjpLlkI3kv6Hmga9cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmFuayAtIOaOkuWQje+8iDEsIDIsIDPvvIlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCAtIFjlnZDmoIdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSAtIFnlnZDmoIdcbiAgICAgKi9cbiAgICBfY3JlYXRlUmFua2luZ0l0ZW06IGZ1bmN0aW9uKHBhcmVudCwgcmFua0luZm8sIHJhbmssIHgsIHkpIHtcbiAgICAgICAgdmFyIGl0ZW1Ob2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rSXRlbV9cIiArIHJhbmspXG4gICAgICAgIGl0ZW1Ob2RlLnNldFBvc2l0aW9uKHgsIHkpXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI3og4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgXG4gICAgICAgIC8vIOagueaNruaOkuWQjeiuvue9ruS4jeWQjOminOiJslxuICAgICAgICB2YXIgYmdDb2xvclxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCwgMjAwKSAgLy8g6YeR6ImyXG4gICAgICAgIH0gZWxzZSBpZiAocmFuayA9PT0gMikge1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcigxOTIsIDE5MiwgMTkyLCAyMDApICAvLyDpk7boibJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJnQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjA1LCAxMjcsIDUwLCAyMDApICAvLyDpk5zoibJcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYmcuZmlsbENvbG9yID0gYmdDb2xvclxuICAgICAgICBiZy5yb3VuZFJlY3QoLTU1LCAtMzAsIDExMCwgNjAsIDEwKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI3moIfnrb5cbiAgICAgICAgdmFyIHJhbmtMYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIlJhbmtMYWJlbFwiKVxuICAgICAgICB2YXIgcmFua0xhYmVsID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhciByYW5rVGV4dFxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgcmFua1RleHQgPSBcIvCfpYcg5Yag5YabXCJcbiAgICAgICAgfSBlbHNlIGlmIChyYW5rID09PSAyKSB7XG4gICAgICAgICAgICByYW5rVGV4dCA9IFwi8J+liCDkuprlhptcIlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFua1RleHQgPSBcIvCfpYkg5a2j5YabXCJcbiAgICAgICAgfVxuICAgICAgICByYW5rTGFiZWwuc3RyaW5nID0gcmFua1RleHRcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgcmFua0xhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHJhbmtMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgcmFua0xhYmVsTm9kZS55ID0gMTJcbiAgICAgICAgcmFua0xhYmVsTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g546p5a625ZCN56ewXG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lTGFiZWxcIilcbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5hbWVMYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBuYW1lTGFiZWwuc3RyaW5nID0gcmFua0luZm8ucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBuYW1lTGFiZWwuZm9udFNpemUgPSAxNFxuICAgICAgICBuYW1lTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUueSA9IC04XG4gICAgICAgIG5hbWVMYWJlbE5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOmHkeW4geaVsFxuICAgICAgICB2YXIgY29pbkxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29pbkxhYmVsXCIpXG4gICAgICAgIHZhciBjb2luTGFiZWwgPSBjb2luTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgY29pbkxhYmVsLnN0cmluZyA9IHJhbmtJbmZvLm1hdGNoX2NvaW4gKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxMlxuICAgICAgICBjb2luTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyMDApXG4gICAgICAgIGNvaW5MYWJlbE5vZGUueSA9IC0yMlxuICAgICAgICBjb2luTGFiZWxOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSBwYXJlbnRcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfjonjgJDnq57mioDlnLrjgJHliJvlu7rlhqDlhpvnspLlrZDnibnmlYhcbiAgICAgKi9cbiAgICBfY3JlYXRlQ2hhbXBpb25QYXJ0aWNsZXM6IGZ1bmN0aW9uKHBhcmVudE5vZGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy8g566A5Y2V55qE6YeR6Imy6Zeq54OB57KS5a2Q5pWI5p6cXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IGNjLk5vZGUoXCJQYXJ0aWNsZV9cIiArIGluZGV4KVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC8gMiArIDUwXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZUxhYmVsID0gcGFydGljbGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlTGFiZWwuc3RyaW5nID0gXCLinKhcIlxuICAgICAgICAgICAgICAgIHBhcnRpY2xlTGFiZWwuZm9udFNpemUgPSAyMCArIE1hdGgucmFuZG9tKCkgKiAyMFxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnBhcmVudCA9IHBhcmVudE5vZGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjYy50d2VlbihwYXJ0aWNsZSlcbiAgICAgICAgICAgICAgICAgICAgLmRlbGF5KE1hdGgucmFuZG9tKCkgKiAwLjUpXG4gICAgICAgICAgICAgICAgICAgIC50bygyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAtaGVpZ2h0IC8gMiAtIDUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDogcGFydGljbGUueCArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDEwMFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlLmRlc3Ryb3koKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICAgICAgfSkoaSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeacgOe7iOamnOWNleWkhOeQhlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIPCfj4bjgJDnq57mioDlnLrjgJHlpITnkIbmnIDnu4jmppzljZXmtojmga9cbiAgICAgKiDlvZPnq57mioDlnLrmiYDmnInova7mrKHnu5PmnZ/ml7bosIPnlKhcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGVyaW9kX25vLCB0b3RhbF9wbGF5ZXJzLCB0b3AzLCB0b3AyMCwgbXlfcmFuaywgbXlfbWF0Y2hfY29pbiB9XG4gICAgICovXG4gICAgX29uVG91cm5hbWVudEZpbmFsUmFuazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW19vblRvdXJuYW1lbnRGaW5hbFJhbmtdIOaUtuWIsOacgOe7iOamnOWNleaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgIFxuICAgICAgICAvLyDlgZzmraLmiYDmnInlgJLorqHml7ZcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlDb3VudGRvd24oKVxuICAgICAgICB0aGlzLl9zdG9wQmlkQ291bnRkb3duKClcbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaW1lcikge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvY2FsQXJlbmFDb3VudGRvd25UaWNrKVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYUNvdW50ZG93blRpbWVyID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/mr5TotZvph5HluIHmmL7npLpcbiAgICAgICAgdGhpcy5faGlkZU1hdGNoQ29pbkRpc3BsYXkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5YWz6Zet5LmL5YmN55qE57uT566X5by556qXXG4gICAgICAgIGlmICh0aGlzLl9nYW1lUmVzdWx0UG9wdXAgfHwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2FtZVJlc3VsdFBvcHVwKHRoaXMuX2dhbWVSZXN1bHRQb3B1cCwgdGhpcy5fZ2FtZVJlc3VsdE1hc2spXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuacgOe7iOamnOWNleW8ueeql1xuICAgICAgICB0aGlzLl9zaG93VG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyhkYXRhKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+PhuOAkOernuaKgOWcuuOAkeaYvuekuuacgOe7iOamnOWNleW8ueeql++8iOWujOaVtOeJiCAtIOW4pua7muWKqOWIl+ihqO+8iVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBwZXJpb2Rfbm8sIHRvdGFsX3BsYXllcnMsIHRvcDMsIHRvcDIwLCBteV9yYW5rLCBteV9tYXRjaF9jb2luIH1cbiAgICAgKi9cbiAgICBfc2hvd1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoXCJDYW52YXNcIikgfHwgY2MuZmluZChcIlVJX1JPT1RcIikgfHwgdGhpcy5ub2RlLnBhcmVudFxuICAgICAgICBpZiAoIWNhbnZhcykgY2FudmFzID0gdGhpcy5ub2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOmBrue9qeWxgiA9PT09PT09PT09XG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRmluYWxSYW5rTWFza1wiKVxuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cylcbiAgICAgICAgbWFza05vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAsIDUsIDMwKVxuICAgICAgICBtYXNrTm9kZS5vcGFjaXR5ID0gMjAwXG4gICAgICAgIG1hc2tOb2RlLndpZHRoID0gd2luU2l6ZS53aWR0aCAqIDJcbiAgICAgICAgbWFza05vZGUuaGVpZ2h0ID0gd2luU2l6ZS5oZWlnaHQgKiAyXG4gICAgICAgIG1hc2tOb2RlLnpJbmRleCA9IDk5OVxuICAgICAgICBtYXNrTm9kZS5wYXJlbnQgPSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT0g5by556qX5a655ZmoID09PT09PT09PT1cbiAgICAgICAgdmFyIHBvcHVwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiRmluYWxSYW5rUG9wdXBcIilcbiAgICAgICAgcG9wdXBOb2RlLnNjYWxlID0gMC4zXG4gICAgICAgIHBvcHVwTm9kZS5vcGFjaXR5ID0gMFxuICAgICAgICBwb3B1cE5vZGUuekluZGV4ID0gMTAwMFxuICAgICAgICBwb3B1cE5vZGUucGFyZW50ID0gY2FudmFzXG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflsLrlr7jvvIjpq5jluqbmlLnkuLrlsY/luZXpq5jluqbnmoQ4NSXvvIzpgb/lhY3muqLlh7rvvIlcbiAgICAgICAgdmFyIHBvcHVwV2lkdGggPSA2MDBcbiAgICAgICAgdmFyIHBvcHVwSGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5TaXplLmhlaWdodCAqIDAuODUpXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOS4u+iDjOaZryA9PT09PT09PT09XG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigzMCwgMjIsIDU0LCAyNTApXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDE2KVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwKVxuICAgICAgICBiZy5saW5lV2lkdGggPSAzXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtcG9wdXBXaWR0aC8yLCAtcG9wdXBIZWlnaHQvMiwgcG9wdXBXaWR0aCwgcG9wdXBIZWlnaHQsIDE2KVxuICAgICAgICBiZy5zdHJva2UoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOmhtumDqOagh+mimOWMuuWfnyA9PT09PT09PT09XG4gICAgICAgIHZhciB0aXRsZUJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVCZ1wiKVxuICAgICAgICB2YXIgdGl0bGVCZyA9IHRpdGxlQmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgdGl0bGVCZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxMzAsIDUwLCAyMjApXG4gICAgICAgIHRpdGxlQmcucm91bmRSZWN0KC1wb3B1cFdpZHRoLzIgKyA4LCBwb3B1cEhlaWdodC8yIC0gNTUsIHBvcHVwV2lkdGggLSAxNiwgNTAsIDgpXG4gICAgICAgIHRpdGxlQmcuZmlsbCgpXG4gICAgICAgIHRpdGxlQmdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIilcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi8J+PhiDmr5TotZvnu5PmnZ8g8J+PhlwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAzMlxuICAgICAgICB0aXRsZUxhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTAsIDIyMClcbiAgICAgICAgdGl0bGVOb2RlLnkgPSBwb3B1cEhlaWdodC8yIC0gMzJcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+C6LWb5Lq65pWwXG4gICAgICAgIHZhciB0b3RhbE5vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsXCIpXG4gICAgICAgIHZhciB0b3RhbExhYmVsID0gdG90YWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsSBcIiArIChkYXRhLnRvdGFsX3BsYXllcnMgfHwgMykgKyBcIiDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgdG90YWxMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHRvdGFsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjIwKVxuICAgICAgICB0b3RhbE5vZGUueSA9IHBvcHVwSGVpZ2h0LzIgLSA3NVxuICAgICAgICB0b3RhbE5vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IFRPUDMg6aKG5aWW5Y+w77yI57Sn5YeR5biD5bGA77yJPT09PT09PT09PVxuICAgICAgICB2YXIgdG9wMyA9IGRhdGEudG9wMyB8fCBbXVxuICAgICAgICB2YXIgcG9kaXVtWSA9IHBvcHVwSGVpZ2h0LzIgLSAxNDVcbiAgICAgICAgdmFyIHBvZGl1bVNwYWNpbmcgPSAxNzBcbiAgICAgICAgXG4gICAgICAgIC8vIOmTtueJjO+8iOesrOS6jOWQje+8iS0g5bem5L6nXG4gICAgICAgIGlmICh0b3AzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVQb2RpdW1FbnRyeShwb3B1cE5vZGUsIHRvcDNbMV0sIDIsIC1wb2RpdW1TcGFjaW5nLCBwb2RpdW1ZKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDph5HniYzvvIjnrKzkuIDlkI3vvIktIOS4remXtO+8iOacgOmrmO+8iVxuICAgICAgICBpZiAodG9wMy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlUG9kaXVtRW50cnkocG9wdXBOb2RlLCB0b3AzWzBdLCAxLCAwLCBwb2RpdW1ZICsgMjApXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmTnOeJjO+8iOesrOS4ieWQje+8iS0g5Y+z5L6nXG4gICAgICAgIGlmICh0b3AzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVQb2RpdW1FbnRyeShwb3B1cE5vZGUsIHRvcDNbMl0sIDMsIHBvZGl1bVNwYWNpbmcsIHBvZGl1bVkgLSAxMClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDnrKw0LTIw5ZCN5rua5Yqo5YiX6KGo5Yy65Z+fID09PT09PT09PT1cbiAgICAgICAgdmFyIHRvcDIwID0gZGF0YS50b3AyMCB8fCBbXVxuICAgICAgICBpZiAodG9wMjAubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8g5YiX6KGo5Yy65Z+f5qCH6aKYXG4gICAgICAgICAgICB2YXIgbGlzdFRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGlzdFRpdGxlXCIpXG4gICAgICAgICAgICB2YXIgbGlzdFRpdGxlTGFiZWwgPSBsaXN0VGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgICAgIGxpc3RUaXRsZUxhYmVsLnN0cmluZyA9IFwi4oCU4oCUIOaOkuihjOamnCDigJTigJRcIlxuICAgICAgICAgICAgbGlzdFRpdGxlTGFiZWwuZm9udFNpemUgPSAxOFxuICAgICAgICAgICAgbGlzdFRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxODAsIDE2MCwgMTIwKVxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS55ID0gcG9wdXBIZWlnaHQvMiAtIDI2MFxuICAgICAgICAgICAgbGlzdFRpdGxlTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu65rua5Yqo6KeG5Zu+5a655ZmoXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVmlld05vZGUgPSBuZXcgY2MuTm9kZShcIlNjcm9sbFZpZXdcIilcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLndpZHRoID0gcG9wdXBXaWR0aCAtIDQwXG4gICAgICAgICAgICBzY3JvbGxWaWV3Tm9kZS5oZWlnaHQgPSAyODBcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLnkgPSAtMzBcbiAgICAgICAgICAgIHNjcm9sbFZpZXdOb2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmt7vliqDpga7nvannu4Tku7ZcbiAgICAgICAgICAgIHZhciBtYXNrID0gc2Nyb2xsVmlld05vZGUuYWRkQ29tcG9uZW50KGNjLk1hc2spXG4gICAgICAgICAgICBtYXNrLnR5cGUgPSBjYy5NYXNrLlR5cGUuUkVDVFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliJvlu7rlhoXlrrnlrrnlmahcbiAgICAgICAgICAgIHZhciBjb250ZW50Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29udGVudFwiKVxuICAgICAgICAgICAgY29udGVudE5vZGUud2lkdGggPSBwb3B1cFdpZHRoIC0gNDBcbiAgICAgICAgICAgIGNvbnRlbnROb2RlLmFuY2hvclkgPSAxXG4gICAgICAgICAgICBjb250ZW50Tm9kZS55ID0gc2Nyb2xsVmlld05vZGUuaGVpZ2h0IC8gMlxuICAgICAgICAgICAgY29udGVudE5vZGUucGFyZW50ID0gc2Nyb2xsVmlld05vZGVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkei/h+a7pOaOieW3suWcqFRPUDPkuK3nmoTnjqnlrrbvvIzpgb/lhY3ph43lpI3mmL7npLpcbiAgICAgICAgICAgIHZhciB0b3AzUGxheWVySURzID0ge31cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9wMy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0b3AzW2ldICYmIHRvcDNbaV0ucGxheWVyX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDNQbGF5ZXJJRHNbdG9wM1tpXS5wbGF5ZXJfaWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y+q5pi+56S656ysNOWQjeWPiuS5i+WQjueahOeOqeWutu+8iOi/h+a7pOaOiVRPUDPvvIlcbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZFRvcDIwID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9wMjAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFua0RhdGEgPSB0b3AyMFtpXVxuICAgICAgICAgICAgICAgIC8vIOi3s+i/h+W3suWcqFRPUDPkuK3nmoTnjqnlrrZcbiAgICAgICAgICAgICAgICBpZiAocmFua0RhdGEgJiYgcmFua0RhdGEucGxheWVyX2lkICYmICF0b3AzUGxheWVySURzW3JhbmtEYXRhLnBsYXllcl9pZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUb3AyMC5wdXNoKHJhbmtEYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5re75Yqg5q+P5Liq5o6S6KGM6aG5XG4gICAgICAgICAgICB2YXIgaXRlbUhlaWdodCA9IDQ1XG4gICAgICAgICAgICB2YXIgc3RhcnRZID0gMFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJlZFRvcDIwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmtEYXRhID0gZmlsdGVyZWRUb3AyMFtpXVxuICAgICAgICAgICAgICAgIHZhciBhY3R1YWxSYW5rID0gaSArIDQgIC8vIOesrDTlkI3lvIDlp4tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgaXRlbU5vZGUgPSB0aGlzLl9jcmVhdGVSYW5rTGlzdEl0ZW0ocmFua0RhdGEsIGFjdHVhbFJhbmssIHBvcHVwV2lkdGggLSA1MClcbiAgICAgICAgICAgICAgICBpdGVtTm9kZS55ID0gc3RhcnRZIC0gaSAqIGl0ZW1IZWlnaHQgLSBpdGVtSGVpZ2h0IC8gMlxuICAgICAgICAgICAgICAgIGl0ZW1Ob2RlLnBhcmVudCA9IGNvbnRlbnROb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruWGheWuuemrmOW6plxuICAgICAgICAgICAgY29udGVudE5vZGUuaGVpZ2h0ID0gTWF0aC5tYXgoZmlsdGVyZWRUb3AyMC5sZW5ndGggKiBpdGVtSGVpZ2h0LCAyODApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa3u+WKoOinpuaRuOa7muWKqFxuICAgICAgICAgICAgdGhpcy5fYWRkU2Nyb2xsVmlld1RvdWNoKHNjcm9sbFZpZXdOb2RlLCBjb250ZW50Tm9kZSwgMjgwKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOW6lemDqOWMuuWfn++8iOaIkeeahOaOkuWQjSArIOaMiemSru+8iT09PT09PT09PT1cbiAgICAgICAgLy8g5YiG6ZqU57q/XG4gICAgICAgIHZhciBzZXBOb2RlID0gbmV3IGNjLk5vZGUoXCJCb3R0b21TZXBcIilcbiAgICAgICAgdmFyIHNlcCA9IHNlcE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBzZXAuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwLCAxMDApXG4gICAgICAgIHNlcC5saW5lV2lkdGggPSAxXG4gICAgICAgIHNlcC5tb3ZlVG8oLXBvcHVwV2lkdGgvMiArIDMwLCAwKVxuICAgICAgICBzZXAubGluZVRvKHBvcHVwV2lkdGgvMiAtIDMwLCAwKVxuICAgICAgICBzZXAuc3Ryb2tlKClcbiAgICAgICAgc2VwTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyAxNDBcbiAgICAgICAgc2VwTm9kZS5wYXJlbnQgPSBwb3B1cE5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaIkeeahOaOkuWQjeiDjOaZr1xuICAgICAgICB2YXIgbXlSYW5rQmdOb2RlID0gbmV3IGNjLk5vZGUoXCJNeVJhbmtCZ1wiKVxuICAgICAgICB2YXIgbXlSYW5rQmcgPSBteVJhbmtCZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBteVJhbmtCZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQ1LCA4MCwgMjAwKVxuICAgICAgICBteVJhbmtCZy5yb3VuZFJlY3QoLTIwMCwgLTIyLCA0MDAsIDQ0LCA4KVxuICAgICAgICBteVJhbmtCZy5maWxsKClcbiAgICAgICAgbXlSYW5rQmcuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDgwLCAxNTApXG4gICAgICAgIG15UmFua0JnLmxpbmVXaWR0aCA9IDFcbiAgICAgICAgbXlSYW5rQmcucm91bmRSZWN0KC0yMDAsIC0yMiwgNDAwLCA0NCwgOClcbiAgICAgICAgbXlSYW5rQmcuc3Ryb2tlKClcbiAgICAgICAgbXlSYW5rQmdOb2RlLnkgPSAtcG9wdXBIZWlnaHQvMiArIDEwMFxuICAgICAgICBteVJhbmtCZ05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmiJHnmoTmjpLlkI3mloflrZdcbiAgICAgICAgdmFyIG15UmFua05vZGUgPSBuZXcgY2MuTm9kZShcIk15UmFua1wiKVxuICAgICAgICB2YXIgbXlSYW5rTGFiZWwgPSBteVJhbmtOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgbXlSYW5rTGFiZWwuc3RyaW5nID0gXCLmiJHnmoTmjpLlkI06IOesrCBcIiArIChkYXRhLm15X3JhbmsgfHwgMSkgKyBcIiDlkI0gIHwgIOavlOi1m+mHkeW4gTogXCIgKyAoZGF0YS5teV9tYXRjaF9jb2luIHx8IDApXG4gICAgICAgIG15UmFua0xhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbXlSYW5rTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgbXlSYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBteVJhbmtOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjMwLCAxNTApXG4gICAgICAgIG15UmFua05vZGUueSA9IC1wb3B1cEhlaWdodC8yICsgMTAwXG4gICAgICAgIG15UmFua05vZGUucGFyZW50ID0gcG9wdXBOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOehruWumuaMiemSriA9PT09PT09PT09XG4gICAgICAgIHZhciBidG5Ob2RlID0gbmV3IGNjLk5vZGUoXCJDb25maXJtQnRuXCIpXG4gICAgICAgIGJ0bk5vZGUud2lkdGggPSAxODBcbiAgICAgICAgYnRuTm9kZS5oZWlnaHQgPSA1MFxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkJnID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJ0bkJnLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig3NiwgMTc1LCA4MClcbiAgICAgICAgYnRuQmcucm91bmRSZWN0KC05MCwgLTI1LCAxODAsIDUwLCAxMClcbiAgICAgICAgYnRuQmcuZmlsbCgpXG4gICAgICAgIGJ0bkJnLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEyOSwgMTk5LCAxMzIpXG4gICAgICAgIGJ0bkJnLmxpbmVXaWR0aCA9IDJcbiAgICAgICAgYnRuQmcucm91bmRSZWN0KC05MCwgLTI1LCAxODAsIDUwLCAxMClcbiAgICAgICAgYnRuQmcuc3Ryb2tlKClcbiAgICAgICAgYnRuTm9kZS55ID0gLXBvcHVwSGVpZ2h0LzIgKyA0MFxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBvcHVwTm9kZVxuICAgICAgICBcbiAgICAgICAgdmFyIGJ0bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgYnRuTGFiZWxDb21wID0gYnRuTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBidG5MYWJlbENvbXAuc3RyaW5nID0gXCLnoa4gIOWumlwiXG4gICAgICAgIGJ0bkxhYmVsQ29tcC5mb250U2l6ZSA9IDI0XG4gICAgICAgIGJ0bkxhYmVsQ29tcC5lbmFibGVCb2xkID0gdHJ1ZVxuICAgICAgICBidG5MYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBidG5MYWJlbENvbXAudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGJ0bkxhYmVsLnNldENvbnRlbnRTaXplKDE4MCwgNTApXG4gICAgICAgIGJ0bkxhYmVsLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGJ0bkxhYmVsLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIGJ0bkxhYmVsLnBhcmVudCA9IGJ0bk5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruinpuaRuOaViOaenFxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJ0bk5vZGUuc2NhbGUgPSAwLjk1XG4gICAgICAgIH0pXG4gICAgICAgIGJ0bk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJ0bk5vZGUuc2NhbGUgPSAxXG4gICAgICAgICAgICBwb3B1cE5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICBtYXNrTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKVxuICAgICAgICB9KVxuICAgICAgICBidG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBidG5Ob2RlLnNjYWxlID0gMVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDlvLnlh7rliqjnlLsgPT09PT09PT09PVxuICAgICAgICBjYy50d2Vlbihwb3B1cE5vZGUpXG4gICAgICAgICAgICAudG8oMC4yLCB7IHNjYWxlOiAxLjAsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuc3RhcnQoKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtfc2hvd1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2ddIOacgOe7iOamnOWNleW8ueeql+W3suaYvuekulwiKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5Yib5bu65o6S6KGM5YiX6KGo6aG5XG4gICAgICovXG4gICAgX2NyZWF0ZVJhbmtMaXN0SXRlbTogZnVuY3Rpb24ocmFua0RhdGEsIHJhbmssIHdpZHRoKSB7XG4gICAgICAgIHZhciBpdGVtTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmFua0l0ZW1fXCIgKyByYW5rKVxuICAgICAgICBpdGVtTm9kZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIGl0ZW1Ob2RlLmhlaWdodCA9IDQyXG4gICAgICAgIFxuICAgICAgICAvLyDog4zmma/vvIjkuqTmm7/popzoibLvvIlcbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgaWYgKHJhbmsgJSAyID09PSAwKSB7XG4gICAgICAgICAgICBiZy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNDUsIDM4LCA3MCwgMTgwKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDM4LCAzMiwgNTgsIDE4MClcbiAgICAgICAgfVxuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC0yMCwgd2lkdGgsIDQwLCA2KVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDmjpLlkI1cbiAgICAgICAgdmFyIHJhbmtOb2RlID0gbmV3IGNjLk5vZGUoXCJSYW5rXCIpXG4gICAgICAgIHZhciByYW5rTGFiZWwgPSByYW5rTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSBTdHJpbmcocmFuaylcbiAgICAgICAgcmFua0xhYmVsLmZvbnRTaXplID0gMThcbiAgICAgICAgcmFua0xhYmVsLmVuYWJsZUJvbGQgPSB0cnVlXG4gICAgICAgIHJhbmtMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIHJhbmtOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIHJhbmtOb2RlLnNldFBvc2l0aW9uKC13aWR0aC8yICsgMzUsIDApXG4gICAgICAgIHJhbmtOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR546p5a625aS05YOPXG4gICAgICAgIHZhciBhdmF0YXJOb2RlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJcIilcbiAgICAgICAgYXZhdGFyTm9kZS5zZXRQb3NpdGlvbigtd2lkdGgvMiArIDc1LCAwKVxuICAgICAgICB2YXIgYXZhdGFyU3ByaXRlID0gYXZhdGFyTm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKVxuICAgICAgICBhdmF0YXJTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NXG4gICAgICAgIGF2YXRhck5vZGUuc2V0Q29udGVudFNpemUoMzIsIDMyKVxuICAgICAgICBhdmF0YXJOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3lpLTlg49cbiAgICAgICAgdGhpcy5fbG9hZEF2YXRhclNwcml0ZShhdmF0YXJTcHJpdGUsIHJhbmtEYXRhLmF2YXRhciwgcmFua0RhdGEuaXNfcm9ib3QpXG4gICAgICAgIFxuICAgICAgICAvLyDnjqnlrrblkI3np7BcbiAgICAgICAgdmFyIG5hbWVOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lXCIpXG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBuYW1lTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHZhciBwbGF5ZXJOYW1lID0gcmFua0RhdGEucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBpZiAocmFua0RhdGEuaXNfcm9ib3QpIHtcbiAgICAgICAgICAgIHBsYXllck5hbWUgPSB0aGlzLl9nZXRSb2JvdERpc3BsYXlOYW1lKHJhbmtEYXRhLnBsYXllcl9pZCwgcmFua0RhdGEucGxheWVyX25hbWUpXG4gICAgICAgIH1cbiAgICAgICAgbmFtZUxhYmVsLnN0cmluZyA9IHBsYXllck5hbWVcbiAgICAgICAgbmFtZUxhYmVsLmZvbnRTaXplID0gMTZcbiAgICAgICAgbmFtZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5MRUZUXG4gICAgICAgIG5hbWVMYWJlbC5vdmVyZmxvdyA9IGNjLkxhYmVsLk92ZXJmbG93LkNMQU1QXG4gICAgICAgIG5hbWVOb2RlLndpZHRoID0gMTUwXG4gICAgICAgIG5hbWVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVOb2RlLnNldFBvc2l0aW9uKC13aWR0aC8yICsgMTQ1LCAwKVxuICAgICAgICBuYW1lTm9kZS5wYXJlbnQgPSBpdGVtTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g6YeR5biBXG4gICAgICAgIHZhciBjb2luTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29pblwiKVxuICAgICAgICB2YXIgY29pbkxhYmVsID0gY29pbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gKHJhbmtEYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxNVxuICAgICAgICBjb2luTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLlJJR0hUXG4gICAgICAgIGNvaW5Ob2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxNTApXG4gICAgICAgIGNvaW5Ob2RlLnNldFBvc2l0aW9uKHdpZHRoLzIgLSA2MCwgMClcbiAgICAgICAgY29pbk5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtTm9kZVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5re75Yqg5rua5Yqo6KeG5Zu+6Kem5pG45LqL5Lu2XG4gICAgICovXG4gICAgX2FkZFNjcm9sbFZpZXdUb3VjaDogZnVuY3Rpb24oc2Nyb2xsVmlld05vZGUsIGNvbnRlbnROb2RlLCB2aWV3SGVpZ2h0KSB7XG4gICAgICAgIHZhciB0b3VjaFN0YXJ0WSA9IDBcbiAgICAgICAgdmFyIGNvbnRlbnRTdGFydFkgPSAwXG4gICAgICAgIHZhciBtYXhPZmZzZXQgPSBNYXRoLm1heCgwLCBjb250ZW50Tm9kZS5oZWlnaHQgLSB2aWV3SGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVmlld05vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB0b3VjaFN0YXJ0WSA9IGV2ZW50LmdldExvY2F0aW9uWSgpXG4gICAgICAgICAgICBjb250ZW50U3RhcnRZID0gY29udGVudE5vZGUueVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVmlld05vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfTU9WRSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB0b3VjaFkgPSBldmVudC5nZXRMb2NhdGlvblkoKVxuICAgICAgICAgICAgdmFyIGRlbHRhWSA9IHRvdWNoWSAtIHRvdWNoU3RhcnRZXG4gICAgICAgICAgICB2YXIgbmV3WSA9IGNvbnRlbnRTdGFydFkgKyBkZWx0YVlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6ZmQ5Yi25rua5Yqo6IyD5Zu0XG4gICAgICAgICAgICB2YXIgbWluWSA9IHZpZXdIZWlnaHQgLyAyIC0gY29udGVudE5vZGUuaGVpZ2h0XG4gICAgICAgICAgICB2YXIgbWF4WSA9IHZpZXdIZWlnaHQgLyAyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5ld1kgPSBNYXRoLm1heChtaW5ZLCBNYXRoLm1pbihtYXhZLCBuZXdZKSlcbiAgICAgICAgICAgIGNvbnRlbnROb2RlLnkgPSBuZXdZXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn4+G44CQ56ue5oqA5Zy644CR5Yib5bu66aKG5aWW5Y+w5p2h55uu77yI576O5YyW54mI77yJXG4gICAgICovXG4gICAgX2NyZWF0ZVBvZGl1bUVudHJ5OiBmdW5jdGlvbihwYXJlbnQsIHJhbmtEYXRhLCByYW5rLCB4LCB5KSB7XG4gICAgICAgIHZhciBlbnRyeU5vZGUgPSBuZXcgY2MuTm9kZShcIlBvZGl1bUVudHJ5X1wiICsgcmFuaylcbiAgICAgICAgZW50cnlOb2RlLnNldFBvc2l0aW9uKHgsIHkpXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOaOkuWQjeiDjOaZr++8iOagueaNruaOkuWQjeiuvue9ruminOiJsu+8iT09PT09PT09PT1cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgdmFyIGJnQ29sb3IsIGJvcmRlckNvbG9yXG4gICAgICAgIGlmIChyYW5rID09PSAxKSB7XG4gICAgICAgICAgICAvLyDph5HniYwgLSDph5HoibLns7tcbiAgICAgICAgICAgIGJnQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA4NSwgNDAsIDIzMClcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKVxuICAgICAgICB9IGVsc2UgaWYgKHJhbmsgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIOmTtueJjCAtIOmTtuiJsuezu1xuICAgICAgICAgICAgYmdDb2xvciA9IG5ldyBjYy5Db2xvcig3MCwgNzUsIDg1LCAyMzApXG4gICAgICAgICAgICBib3JkZXJDb2xvciA9IG5ldyBjYy5Db2xvcigxOTIsIDE5MiwgMTkyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g6ZOc54mMIC0g6ZOc6Imy57O7XG4gICAgICAgICAgICBiZ0NvbG9yID0gbmV3IGNjLkNvbG9yKDg1LCA2MCwgNDUsIDIzMClcbiAgICAgICAgICAgIGJvcmRlckNvbG9yID0gbmV3IGNjLkNvbG9yKDIwNSwgMTI3LCA1MClcbiAgICAgICAgfVxuICAgICAgICBiZy5maWxsQ29sb3IgPSBiZ0NvbG9yXG4gICAgICAgIGJnLnJvdW5kUmVjdCgtNTUsIC03MCwgMTEwLCAxNDAsIDEyKVxuICAgICAgICBiZy5maWxsKClcbiAgICAgICAgLy8g6L655qGGXG4gICAgICAgIGJnLnN0cm9rZUNvbG9yID0gYm9yZGVyQ29sb3JcbiAgICAgICAgYmcubGluZVdpZHRoID0gMlxuICAgICAgICBiZy5yb3VuZFJlY3QoLTU1LCAtNzAsIDExMCwgMTQwLCAxMilcbiAgICAgICAgYmcuc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDmjpLlkI3lpZbniYzlm77moIcgPT09PT09PT09PVxuICAgICAgICB2YXIgbWVkYWxOb2RlID0gbmV3IGNjLk5vZGUoXCJNZWRhbFwiKVxuICAgICAgICB2YXIgbWVkYWwgPSBtZWRhbE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICB2YXIgbWVkYWxDb2xvclxuICAgICAgICBpZiAocmFuayA9PT0gMSkge1xuICAgICAgICAgICAgbWVkYWxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgIC8vIOmHkeiJslxuICAgICAgICB9IGVsc2UgaWYgKHJhbmsgPT09IDIpIHtcbiAgICAgICAgICAgIG1lZGFsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTkyLCAxOTIsIDE5MikgIC8vIOmTtuiJslxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVkYWxDb2xvciA9IG5ldyBjYy5Db2xvcigyMDUsIDEyNywgNTApICAvLyDpk5zoibJcbiAgICAgICAgfVxuICAgICAgICBtZWRhbC5maWxsQ29sb3IgPSBtZWRhbENvbG9yXG4gICAgICAgIC8vIOe7mOWItuWchuW9ouWllueJjFxuICAgICAgICBtZWRhbC5jaXJjbGUoMCwgNDUsIDIyKVxuICAgICAgICBtZWRhbC5maWxsKClcbiAgICAgICAgbWVkYWwuc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSwgMTUwKVxuICAgICAgICBtZWRhbC5saW5lV2lkdGggPSAyXG4gICAgICAgIG1lZGFsLmNpcmNsZSgwLCA0NSwgMjIpXG4gICAgICAgIG1lZGFsLnN0cm9rZSgpXG4gICAgICAgIG1lZGFsTm9kZS5wYXJlbnQgPSBlbnRyeU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOWllueJjOS4iueahOaVsOWtl1xuICAgICAgICB2YXIgcmFua051bU5vZGUgPSBuZXcgY2MuTm9kZShcIlJhbmtOdW1cIilcbiAgICAgICAgdmFyIHJhbmtOdW1MYWJlbCA9IHJhbmtOdW1Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcmFua051bUxhYmVsLnN0cmluZyA9IFN0cmluZyhyYW5rKVxuICAgICAgICByYW5rTnVtTGFiZWwuZm9udFNpemUgPSAyNFxuICAgICAgICByYW5rTnVtTGFiZWwuZW5hYmxlQm9sZCA9IHRydWVcbiAgICAgICAgcmFua051bUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgcmFua051bU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDQwLCAzMClcbiAgICAgICAgcmFua051bU5vZGUuc2V0UG9zaXRpb24oMCwgNDUpXG4gICAgICAgIHJhbmtOdW1Ob2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDnjqnlrrblpLTlg48gPT09PT09PT09PVxuICAgICAgICB2YXIgYXZhdGFyTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyXCIpXG4gICAgICAgIGF2YXRhck5vZGUuc2V0UG9zaXRpb24oMCwgMjApXG4gICAgICAgIHZhciBhdmF0YXJTcHJpdGUgPSBhdmF0YXJOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgIGF2YXRhclNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT01cbiAgICAgICAgYXZhdGFyTm9kZS5zZXRDb250ZW50U2l6ZSg1MCwgNTApXG4gICAgICAgIGF2YXRhck5vZGUucGFyZW50ID0gZW50cnlOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5Yqg6L295aS05YOPXG4gICAgICAgIHRoaXMuX2xvYWRBdmF0YXJTcHJpdGUoYXZhdGFyU3ByaXRlLCByYW5rRGF0YS5hdmF0YXIsIHJhbmtEYXRhLmlzX3JvYm90KVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6L655qGGXG4gICAgICAgIHZhciBhdmF0YXJGcmFtZU5vZGUgPSBuZXcgY2MuTm9kZShcIkF2YXRhckZyYW1lXCIpXG4gICAgICAgIHZhciBhdmF0YXJGcmFtZSA9IGF2YXRhckZyYW1lTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGF2YXRhckZyYW1lLnN0cm9rZUNvbG9yID0gYm9yZGVyQ29sb3JcbiAgICAgICAgYXZhdGFyRnJhbWUubGluZVdpZHRoID0gMlxuICAgICAgICBhdmF0YXJGcmFtZS5jaXJjbGUoMCwgMjAsIDI2KVxuICAgICAgICBhdmF0YXJGcmFtZS5zdHJva2UoKVxuICAgICAgICBhdmF0YXJGcmFtZU5vZGUucGFyZW50ID0gZW50cnlOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOeOqeWutuWQjeensCA9PT09PT09PT09XG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lXCIpXG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBuYW1lTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdmFyIHBsYXllck5hbWUgPSByYW5rRGF0YS5wbGF5ZXJfbmFtZSB8fCBcIueOqeWutlwiXG4gICAgICAgIGlmIChyYW5rRGF0YS5pc19yb2JvdCkge1xuICAgICAgICAgICAgLy8g5py65Zmo5Lq65L2/55So5pm66IO96Zmq57uD5ZCN56ewXG4gICAgICAgICAgICBwbGF5ZXJOYW1lID0gdGhpcy5fZ2V0Um9ib3REaXNwbGF5TmFtZShyYW5rRGF0YS5wbGF5ZXJfaWQsIHJhbmtEYXRhLnBsYXllcl9uYW1lKVxuICAgICAgICB9XG4gICAgICAgIG5hbWVMYWJlbC5zdHJpbmcgPSBwbGF5ZXJOYW1lXG4gICAgICAgIG5hbWVMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIG5hbWVMYWJlbC5lbmFibGVCb2xkID0gdHJ1ZVxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUueSA9IDVcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5wYXJlbnQgPSBlbnRyeU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT0g5q+U6LWb6YeR5biBID09PT09PT09PT1cbiAgICAgICAgdmFyIGNvaW5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkNvaW5cIilcbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gKHJhbmtEYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIiDph5HluIFcIlxuICAgICAgICBjb2luTGFiZWwuZm9udFNpemUgPSAxNlxuICAgICAgICBjb2luTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBjb2luTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjMwLCAxNTApXG4gICAgICAgIGNvaW5MYWJlbE5vZGUueSA9IC0yNVxuICAgICAgICBjb2luTGFiZWxOb2RlLnBhcmVudCA9IGVudHJ5Tm9kZVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDkuI3lho3mmL7npLrmnLrlmajkurpBSeagh+etviA9PT09PT09PT09XG4gICAgICAgIC8vIOeUqOaIt+imgeaxgu+8muacuuWZqOS6uuS4jeaYvuekukFJ5qCH6K+GXG4gICAgICAgIFxuICAgICAgICBlbnRyeU5vZGUucGFyZW50ID0gcGFyZW50XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5bmnLrlmajkurrmmL7npLrlkI3np7BcbiAgICAgKi9cbiAgICBfZ2V0Um9ib3REaXNwbGF5TmFtZTogZnVuY3Rpb24ocGxheWVySWQsIG9yaWdpbmFsTmFtZSkge1xuICAgICAgICAvLyDlpoLmnpzljp/lp4vlkI3np7Dlt7Lnu4/mmK9cIuaZuuiDvemZque7g1jlj7dcIuagvOW8j++8jOebtOaOpei/lOWbnlxuICAgICAgICBpZiAob3JpZ2luYWxOYW1lICYmIG9yaWdpbmFsTmFtZS5pbmRleE9mKFwi5pm66IO96Zmq57uDXCIpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOYW1lXG4gICAgICAgIH1cbiAgICAgICAgLy8g5ZCm5YiZ77yM55Sf5oiQXCLmmbrog73pmarnu4NY5Y+3XCLmoLzlvI/nmoTlkI3np7BcbiAgICAgICAgdmFyIHJvYm90SW5kZXggPSAxXG4gICAgICAgIGlmIChwbGF5ZXJJZCkge1xuICAgICAgICAgICAgdmFyIGxhc3RDaGFyID0gcGxheWVySWQudG9TdHJpbmcoKS5zbGljZSgtMSlcbiAgICAgICAgICAgIHJvYm90SW5kZXggPSBwYXJzZUludChsYXN0Q2hhcikgfHwgMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIuaZuuiDvemZque7g1wiICsgcm9ib3RJbmRleCArIFwi5Y+3XCJcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHliqDovb3lpLTlg4/nsr7ngbVcbiAgICAgKiBAcGFyYW0ge2NjLlNwcml0ZX0gc3ByaXRlIC0g55uu5qCH57K+54G157uE5Lu2XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGF2YXRhclVybCAtIOWktOWDj1VSTOaIlui1hOa6kOWQjVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSb2JvdCAtIOaYr+WQpuaYr+acuuWZqOS6ulxuICAgICAqL1xuICAgIF9sb2FkQXZhdGFyU3ByaXRlOiBmdW5jdGlvbihzcHJpdGUsIGF2YXRhclVybCwgaXNSb2JvdCkge1xuICAgICAgICBpZiAoIXNwcml0ZSkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDmnLrlmajkurrkvb/nlKjpu5jorqTlpLTlg4/vvIhhdmF0YXJfMSDliLAgYXZhdGFyXzMg6ZqP5py677yJXG4gICAgICAgIGlmIChpc1JvYm90KSB7XG4gICAgICAgICAgICB2YXIgcm9ib3RBdmF0YXJJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMVxuICAgICAgICAgICAgdmFyIGRlZmF1bHRQYXRoID0gXCJVSS9oZWFkaW1hZ2UvYXZhdGFyX1wiICsgcm9ib3RBdmF0YXJJbmRleFxuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoZGVmYXVsdFBhdGgsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUgJiYgc3ByaXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOecn+S6uueOqeWutlxuICAgICAgICBpZiAoIWF2YXRhclVybCB8fCBhdmF0YXJVcmwgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIC8vIOS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Yik5pat5pivVVJM6L+Y5piv5pys5Zyw6LWE5rqQ5ZCNXG4gICAgICAgIGlmIChhdmF0YXJVcmwuaW5kZXhPZihcImh0dHBcIikgPT09IDAgfHwgYXZhdGFyVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgLy8g6L+c56iLVVJMXG4gICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZShhdmF0YXJVcmwsIHsgZXh0OiAnLnBuZycgfSwgZnVuY3Rpb24oZXJyLCB0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCAhdGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDliqDovb3lpLHotKXvvIzkvb/nlKjpu5jorqTlpLTlg49cbiAgICAgICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVycjIsIGZhbGxiYWNrU3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycjIgJiYgZmFsbGJhY2tTcHJpdGUgJiYgc3ByaXRlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBmYWxsYmFja1Nwcml0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwcml0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUodGV4dHVyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcIlVJL2hlYWRpbWFnZS9hdmF0YXJfMVwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyMiwgZmFsbGJhY2tTcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyMiAmJiBmYWxsYmFja1Nwcml0ZSAmJiBzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZhbGxiYWNrU3ByaXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOacrOWcsOi1hOa6kOWQjVxuICAgICAgICAgICAgdmFyIGxvY2FsUGF0aCA9IFwiVUkvaGVhZGltYWdlL1wiICsgYXZhdGFyVXJsXG4gICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChsb2NhbFBhdGgsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCAhc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yqg6L295aSx6LSl77yM5L2/55So6buY6K6k5aS05YOPXG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvaGVhZGltYWdlL2F2YXRhcl8xXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIyLCBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIyICYmIGZhbGxiYWNrU3ByaXRlICYmIHNwcml0ZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gZmFsbGJhY2tTcHJpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdfQ==