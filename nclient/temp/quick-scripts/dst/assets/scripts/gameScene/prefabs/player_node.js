
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/gameScene/prefabs/player_node.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'a2125ra91BLLoSvnFm+7Qba', 'player_node');
// scripts/gameScene/prefabs/player_node.js

"use strict";

// 使用全局变量，不使用 require
// 【修复版本】简化对手牌背显示，直接创建 17 张牌背
// 核心原则：
// 1. 收到 push_card_event 后直接显示 17 张牌背
// 2. 不依赖定时器或动画调度
// 3. 保证数据正确性

var qian_state = window.qian_state || {
  buqiang: 0,
  qian: 1
};
var isopen_sound = window.isopen_sound || 1;

// ⚠️【已删除】playRobSound 函数 - 音效播放统一由 gameingUI._playRobSound 处理

cc.Class({
  "extends": cc.Component,
  properties: {
    account_label: cc.Label,
    nickname_label: cc.Label,
    room_touxiang: cc.Sprite,
    globalcount_label: cc.Label,
    room_money_frame: cc.Node,
    // 金币背景框
    headimage: cc.Sprite,
    readyimage: cc.Node,
    offlineimage: cc.Node,
    trusteeimage: cc.Node,
    // 🔧【托管】托管状态图标
    card_node: cc.Node,
    card_prefab: cc.Prefab,
    clockimage: cc.Node,
    qiangdidzhu_node: cc.Node,
    time_label: cc.Label,
    robimage_sp: cc.SpriteFrame,
    robnoimage_sp: cc.SpriteFrame,
    robIconSp: cc.Sprite,
    robIcon_Sp: cc.Node,
    robnoIcon_Sp: cc.Node,
    masterIcon: cc.Node
  },
  onLoad: function onLoad() {
    this.readyimage.active = false;
    this.offlineimage.active = false;
    if (this.trusteeimage) this.trusteeimage.active = false; // 🔧【托管】初始化托管图标
    if (this.masterIcon) this.masterIcon.active = false; // 🔧【修复】初始化地主图标为隐藏
    this.currentCardCount = 17;
    this.cardlist_node = [];

    // 游戏开始事件
    this.node.on("gamestart_event", function (event) {
      this.readyimage.active = false;
      if (this.masterIcon) this.masterIcon.active = false; // 🔧【修复】游戏开始时隐藏地主图标
      if (this.card_node) {
        this.card_node.active = false;
        this.card_node.removeAllChildren(true);
      }
      this.cardlist_node = [];
      this.currentCardCount = 17;
    }.bind(this));

    // 【核心】发牌事件 - 直接显示 17 张牌背
    this.node.on("push_card_event", function (event) {
      var myglobal = window.myglobal;
      if (!myglobal) {
        console.error("🃏 [player_node] push_card_event: myglobal 不存在！");
        return;
      }
      var myPlayerId = this._getMyPlayerId(myglobal);
      var accountIdStr = String(this.accountid || "");

      // 如果是自己，跳过
      if (myPlayerId === accountIdStr && accountIdStr !== "") {
        return;
      }
      this.showCardBacks(17);
    }.bind(this));

    // 抢地主事件
    // 🔧【修复】所有玩家节点都能显示抢地主/不抢状态
    // ⚠️【重要】音效播放统一由 gameingUI._playRobSound 处理，此处不再播放音效
    this.node.on("playernode_rob_state_event", function (event) {
      var detail = event;

      // 隐藏抢地主按钮（当前操作的玩家）
      if (detail.accountid == this.accountid) {
        this.qiangdidzhu_node.active = false;
      }

      // 🔧【关键修复】所有玩家节点都显示对应玩家的抢地主状态
      if (this.accountid == detail.accountid) {
        // 🔧【新增】根据轮次区分"叫地主/不叫"和"抢地主/不抢"
        var round = detail.round || 1;
        var isCall = detail.state == qian_state.qian || detail.state === true;
        if (isCall) {
          this.robIcon_Sp.active = true;
          // ⚠️【已删除】音效播放移至 gameingUI._playRobSound（服务端广播触发）
        } else {
          this.robnoIcon_Sp.active = true;
          // ⚠️【已删除】音效播放移至 gameingUI._playRobSound（服务端广播触发）
        }
      }
    }.bind(this));

    // 成为地主事件
    this.node.on("playernode_changemaster_event", function (event) {
      var detail = event;
      this.robIcon_Sp.active = false;
      this.robnoIcon_Sp.active = false;
      if (detail == this.accountid) {
        this.masterIcon.active = true;
        this.currentCardCount = 20;
        this.showCardBacks(20);
      }
    }.bind(this));

    // 牌数更新事件
    this.node.on("update_card_count_event", function (data) {
      if (data.accountid == this.accountid) {
        this.currentCardCount = data.count;
        this.showCardBacks(data.count);
      }
    }.bind(this));

    // 【新增】玩家状态更新事件（掉线/上线/托管）
    this.node.on("player_state_update", function (data) {
      this._updatePlayerState(data);
    }.bind(this));

    // 🔧【托管】托管状态更新事件
    this.node.on("trustee_state_update", function (data) {
      this._updateTrusteeState(data);
    }.bind(this));

    // 🕐【新增】倒计时更新事件
    this.node.on("update_countdown_event", function (data) {
      // 只更新当前玩家的倒计时显示
      if (this.seat_index === 0) {
        if (this.time_label) {
          this.time_label.string = String(data.remaining);
        }
      }
    }.bind(this));
  },
  start: function start() {},
  /**
   * 获取当前玩家ID
   */
  _getMyPlayerId: function _getMyPlayerId(myglobal) {
    var myPlayerId = null;
    if (myglobal.socket && myglobal.socket.getPlayerInfo) {
      var playerInfo = myglobal.socket.getPlayerInfo();
      if (playerInfo && playerInfo.id) {
        myPlayerId = playerInfo.id;
      }
    }
    if (!myPlayerId && myglobal.playerData && myglobal.playerData.serverPlayerId) {
      myPlayerId = myglobal.playerData.serverPlayerId;
    }
    if (!myPlayerId && myglobal.playerData && myglobal.playerData.accountID) {
      myPlayerId = myglobal.playerData.accountID;
    }
    return String(myPlayerId || "");
  },
  init_data: function init_data(data, index) {
    var myglobal = window.myglobal;

    // 🔧【修复】兼容 accountid 和 accountId 两种命名
    this.accountid = data.accountid || data.accountId || "";
    this.seat_index = index;

    // 🔧【调试】输出 accountid 设置
    console.log("🎮 [player_node.init_data] accountid:", this.accountid, "seat_index:", this.seat_index, "nick_name:", data.nick_name);

    // 同步玩家ID
    if (myglobal && myglobal.playerData && !myglobal.playerData.serverPlayerId) {
      if (myglobal.socket && myglobal.socket.getPlayerInfo) {
        var playerInfo = myglobal.socket.getPlayerInfo();
        if (playerInfo && playerInfo.id) {
          myglobal.playerData.serverPlayerId = playerInfo.id;
        }
      }
    }
    this.account_label.node.active = false;
    this.nickname_label.string = data.nick_name || "玩家" + (index + 1);

    // 🔧【修复】区分普通场和竞技场的金币显示
    // 竞技场模式下显示 arena_gold（当期赛事金币），普通场显示 gold_count（欢乐豆）
    var displayValue = 0;
    var isArenaMode = data.room_category === 2 || this._isArenaMode;
    if (isArenaMode) {
      // 竞技场模式：优先显示 arena_gold（当期赛事金币）
      if (data.arena_gold !== undefined && data.arena_gold !== null) {
        displayValue = data.arena_gold;
        console.log("🏟️ [player_node] 竞技场模式 - 昵称:", data.nick_name, "arena_gold:", data.arena_gold, "期号:", data.period_no);
      } else if (data.match_coin !== undefined && data.match_coin !== null) {
        displayValue = data.match_coin;
        console.log("🏟️ [player_node] 竞技场模式(兼容) - 昵称:", data.nick_name, "match_coin:", data.match_coin);
      } else if (data.gold_count !== undefined && data.gold_count !== null) {
        displayValue = data.gold_count;
        console.log("🏟️ [player_node] 竞技场模式（无arena_gold）- 使用 gold_count:", data.gold_count);
      }
    } else {
      // 普通场：显示欢乐豆
      if (data.gold_count !== undefined && data.gold_count !== null) {
        displayValue = data.gold_count;
      } else if (data.goldcount !== undefined && data.goldcount !== null) {
        displayValue = data.goldcount;
      }
      console.log("🪙 [player_node] 普通场 - 昵称:", data.nick_name, "gold_count:", data.gold_count, "最终金币:", displayValue);
    }
    this.globalcount_label.string = String(displayValue);
    this._isArenaMode = isArenaMode; // 保存竞技场模式状态
    this._arenaGold = displayValue; // 🔧【新增】保存当前赛事金币
    this._periodNo = data.period_no || ""; // 🔧【新增】保存期号
    this.cardlist_node = [];

    // 检查准备状态
    var isReady = data.isready || data.ready || data.IsReady || false;
    if (isReady == true || isReady === "true" || isReady === 1) {
      this.readyimage.active = true;
    } else {
      this.readyimage.active = false;
    }

    // 【核心修改】当前玩家（index == 0）：隐藏牌背，调整头像位置
    if (index == 0) {
      // 隐藏牌背节点
      if (this.card_node) {
        this.card_node.active = false;
      }
      // 调整头像位置到牌背位置（牌背位置：[80, 32]）
      if (this.room_touxiang) {
        this.room_touxiang.node.x = 80;
        this.room_touxiang.node.y = 32;
      }
      if (this.headimage) {
        this.headimage.node.x = 80;
        this.headimage.node.y = 32;
      }
      // 调整昵称标签位置（头像正上方，居中显示）
      if (this.nickname_label && this.nickname_label.node) {
        // 设置锚点为中心，确保居中显示
        this.nickname_label.node.anchorX = 0.5;
        this.nickname_label.node.anchorY = 0.5;
        // 位置与头像 x 相同，y 在头像上方
        this.nickname_label.node.x = 80;
        this.nickname_label.node.y = 90;
      }
      // 调整金币标签位置（头像下方，居中显示）
      if (this.globalcount_label && this.globalcount_label.node) {
        // 设置锚点为中心，确保居中显示
        this.globalcount_label.node.anchorX = 0.5;
        this.globalcount_label.node.anchorY = 0.5;
        // 位置与头像 x 相同，y 在头像下方
        this.globalcount_label.node.x = 80;
        this.globalcount_label.node.y = -28;
      }
      // 调整金币背景框位置（与金币标签对齐）
      if (this.room_money_frame) {
        this.room_money_frame.x = 80;
        this.room_money_frame.y = -28;
      }
      // 调整准备图标位置（头像右下角）
      if (this.readyimage) {
        this.readyimage.x = 105;
        this.readyimage.y = 5;
      }
      // 调整地主图标位置（头像右下角）
      if (this.masterIcon) {
        this.masterIcon.x = 105;
        this.masterIcon.y = 5;
      }
    }

    // 设置层级
    if (this.room_touxiang && this.headimage) {
      this.headimage.node.zIndex = 0;
      this.room_touxiang.node.zIndex = 100;
      this.headimage.node.parent.sortAllChildren();
    }

    // 🔧【修复】加载头像 - 支持远程URL和本地资源
    // 服务端可能返回 avatar, avatarUrl, 或 avatarurl 字段
    var avatarUrl = data.avatar || data.avatarUrl || data.avatarurl || "avatar_1";
    this._loadAvatar(avatarUrl);

    // 准备通知
    this.node.on("player_ready_notify", function (event) {
      var detail = event;
      var readyPlayerId = "";
      if (typeof detail === 'object' && detail !== null) {
        readyPlayerId = detail.player_id || detail.playerId || detail.id || "";
      } else {
        readyPlayerId = detail;
      }
      if (readyPlayerId == this.accountid) {
        this.readyimage.active = true;
      }
    }.bind(this));

    // 抢地主通知
    // 🔧【修复】接收包含 player_id 和 timeout 的事件对象，不再硬编码
    this.node.on("playernode_canrob_event", function (event) {
      // 兼容处理：event 可能是字符串（旧格式）或对象（新格式）
      var playerId = event;
      var timeout = 15; // 默认 15 秒

      if (typeof event === 'object' && event !== null) {
        playerId = event.player_id;
        timeout = event.timeout || 15;
      }

      // 存储 timeout 值供倒计时更新使用
      this._serverTimeout = timeout;
      if (playerId == this.accountid) {
        this.qiangdidzhu_node.active = true;
        if (this.time_label) {
          this.time_label.string = String(timeout);
        }
      }
    }.bind(this));

    // 🕐 存储服务端传递的 timeout 值
    this._serverTimeout = 15;
    if (index == 1) {
      this.card_node.x = -this.card_node.x - 30;
    }
  },
  _setAvatarSprite: function _setAvatarSprite(spriteFrame) {
    if (!this.headimage || !spriteFrame) return;
    this.headimage.enabled = true;
    this.headimage.spriteFrame = spriteFrame;
    this.headimage.node.setContentSize(80, 80);
    this.headimage.node.scale = 1;
  },
  /**
   * 🔧【新增】加载头像 - 支持远程URL和本地资源
   * @param {string} avatarUrl - 头像URL或本地资源名
   */
  _loadAvatar: function _loadAvatar(avatarUrl) {
    var self = this;
    if (!this.headimage) {
      console.warn("🖼️ [player_node] headimage 未绑定");
      return;
    }

    // 空值处理
    if (!avatarUrl || avatarUrl === "") {
      this._loadDefaultAvatar();
      return;
    }

    // 🔧【优化】优先使用预加载的缓存头像
    var myglobal = window.myglobal;
    if (myglobal && myglobal._avatarCache && myglobal._avatarCache[avatarUrl]) {
      var cachedSpriteFrame = myglobal._avatarCache[avatarUrl];
      if (cachedSpriteFrame) {
        console.log("🖼️ [player_node] 使用缓存头像:", avatarUrl);
        self._setAvatarSprite(cachedSpriteFrame);
        return;
      }
    }

    // 🔧【修复】处理以 / 开头的路径（服务器相对路径）
    if (avatarUrl.indexOf('/') === 0 && avatarUrl.indexOf('/uploads/') === 0) {
      // 拼接服务器地址
      var serverUrl = 'https://houtais.hongxiu88.com' + avatarUrl;
      console.log("🖼️ [player_node] 加载服务器头像(格式1):", serverUrl);
      this._loadRemoteAvatar(serverUrl);
      return;
    }

    // 判断是否是远程URL
    if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
      // 远程URL头像
      console.log("🖼️ [player_node] 加载远程头像:", avatarUrl);
      this._loadRemoteAvatar(avatarUrl);
    } else {
      // 本地资源头像
      console.log("🖼️ [player_node] 加载本地头像:", avatarUrl);
      var localPath = "UI/headimage/" + avatarUrl;
      cc.loader.loadRes(localPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (err || !spriteFrame) {
          console.warn("🖼️ [player_node] 本地头像加载失败，使用默认头像:", err);
          self._loadDefaultAvatar();
          return;
        }
        self._setAvatarSprite(spriteFrame);
        console.log("🖼️ [player_node] 本地头像加载成功");
      });
    }
  },
  /**
   * 🔧【新增】加载远程头像
   * @param {string} url - 完整的远程URL
   */
  _loadRemoteAvatar: function _loadRemoteAvatar(url) {
    var self = this;

    // 🔧【修复】根据URL确定正确的扩展名，避免加载失败
    var ext = '.png'; // 默认扩展名
    if (url.indexOf('.jpg') > 0 || url.indexOf('.jpeg') > 0) {
      ext = '.jpg';
    } else if (url.indexOf('.png') > 0) {
      ext = '.png';
    }
    console.log("🖼️ [player_node] 开始加载远程头像:", url, "扩展名:", ext);
    cc.assetManager.loadRemote(url, function (err, texture) {
      if (err || !texture) {
        console.warn("🖼️ [player_node] 远程头像加载失败，使用默认头像:", err);
        self._loadDefaultAvatar();
        return;
      }
      try {
        var spriteFrame = new cc.SpriteFrame(texture);
        if (spriteFrame) {
          self._setAvatarSprite(spriteFrame);
          console.log("🖼️ [player_node] 远程头像加载成功:", url);
        }
      } catch (e) {
        console.warn("🖼️ [player_node] 创建SpriteFrame失败:", e);
        self._loadDefaultAvatar();
      }
    });
  },
  /**
   * 🔧【新增】加载默认头像
   */
  _loadDefaultAvatar: function _loadDefaultAvatar() {
    var self = this;
    cc.loader.loadRes("UI/headimage/avatar_1", cc.SpriteFrame, function (err, spriteFrame) {
      if (!err && spriteFrame) {
        self._setAvatarSprite(spriteFrame);
      }
    });
  },
  /**
   * 🔧【新增】更新竞技场玩家数据（头像、金币等）
   * 当收到 ROOM_JOINED 消息后调用，更新从服务端获取的正确数据
   * @param {Object} data - 包含 gold_count, arena_gold, match_coin, avatar, avatarUrl
   */
  updateArenaData: function updateArenaData(data) {
    console.log("🏟️ [player_node] updateArenaData 被调用, accountid:", this.accountid, "data:", JSON.stringify(data));

    // 🔧【修复】竞技场模式优先使用 match_coin，其次 arena_gold
    var displayValue = 0;
    if (data.match_coin !== undefined && data.match_coin !== null && data.match_coin > 0) {
      displayValue = data.match_coin;
      console.log("🏟️ [player_node] 更新 match_coin:", data.match_coin);
    } else if (data.arena_gold !== undefined && data.arena_gold !== null && data.arena_gold > 0) {
      displayValue = data.arena_gold;
      console.log("🏟️ [player_node] 更新 arena_gold:", data.arena_gold);
    } else if (data.gold_count !== undefined && data.gold_count !== null && data.gold_count > 0) {
      displayValue = data.gold_count;
      console.log("🏟️ [player_node] 更新 gold_count:", data.gold_count);
    }

    // 🔧【关键修复】使用正确的 globalcount_label 而非 gold_label
    if (displayValue > 0 && this.globalcount_label) {
      this.globalcount_label.string = displayValue.toString();
      this._arenaGold = displayValue; // 更新保存的赛事金币
      console.log("🏟️ [player_node] 金币已更新为:", displayValue);
    } else if (displayValue === 0) {
      console.log("🏟️ [player_node] 警告：displayValue 为 0，跳过更新");
    } else if (!this.globalcount_label) {
      console.warn("🏟️ [player_node] 错误：globalcount_label 未绑定！");
    }

    // 更新头像
    var avatarUrl = data.avatar || data.avatarUrl;
    if (avatarUrl && avatarUrl !== "" && avatarUrl !== "avatar_1") {
      console.log("🏟️ [player_node] 更新头像:", avatarUrl);
      this._loadAvatar(avatarUrl);
    }
  },
  // ============================================================
  // 【核心】直接显示牌背（无动画，保证数据正确性）
  // ============================================================

  /**
   * 显示指定数量的牌背
   * @param {number} count - 牌背数量
   * 【重要】当前玩家（index == 0）不显示牌背
   */
  showCardBacks: function showCardBacks(count) {
    // 【核心】检查是否是当前玩家（index == 0），如果是则不显示牌背
    if (this.seat_index === 0) {
      return;
    }
    if (!this.card_node) {
      console.error("🃏 [player_node] card_node 未绑定");
      return;
    }

    // 清理旧牌
    this.card_node.removeAllChildren(true);
    this.cardlist_node = [];
    if (count <= 0) {
      this.card_node.active = false;
      this.currentCardCount = 0;
      return;
    }
    this.card_node.active = true;
    this.currentCardCount = count;
    if (!this.card_prefab) {
      console.error("🃏 [player_node] card_prefab 未绑定");
      return;
    }

    // 直接创建所有牌背（无动画）
    for (var i = 0; i < count; i++) {
      var card = cc.instantiate(this.card_prefab);
      if (!card) continue;
      card.scale = 0.6;
      card.parent = this.card_node;
      card.active = true;

      // 垂直堆叠布局
      var height = card.height;
      card.y = (count - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
      card.x = 0;
      this.cardlist_node.push(card);
    }
  },
  // ============================================================
  // 【新增】玩家状态更新处理
  // ============================================================

  /**
   * 更新玩家状态
   * @param {Object} data - 包含 state, cards_count, is_landlord, timeout
   */
  _updatePlayerState: function _updatePlayerState(data) {
    // 更新离线/托管状态显示
    if (data.state === "offline") {
      // 玩家离线，显示离线图标
      if (this.offlineimage) {
        this.offlineimage.active = true;
      }
    } else if (data.state === "robot") {
      // 机器人托管，显示托管图标
      if (this.trusteeimage) {
        this.trusteeimage.active = true;
      }
      // 兼容：如果没有托管图标，复用离线图标
      if (!this.trusteeimage && this.offlineimage) {
        this.offlineimage.active = true;
      }
    } else if (data.state === "online") {
      // 玩家在线，隐藏离线/托管图标
      if (this.offlineimage) {
        this.offlineimage.active = false;
      }
      if (this.trusteeimage) {
        this.trusteeimage.active = false;
      }
    }

    // 更新牌数
    if (data.cards_count !== undefined) {
      this.currentCardCount = data.cards_count;
      this.showCardBacks(data.cards_count);
    }

    // 更新地主标识
    if (data.is_landlord !== undefined && data.is_landlord === true) {
      if (this.masterIcon) {
        this.masterIcon.active = true;
      }
    }
  },
  /**
   * 🔧【托管】更新托管状态
   * @param {Object} data - 包含 player_id, player_name, is_trustee, reason
   */
  _updateTrusteeState: function _updateTrusteeState(data) {
    // 只处理当前玩家的托管状态
    if (data.player_id !== this.accountid) {
      return;
    }
    if (data.is_trustee) {
      // 开启托管状态
      if (this.trusteeimage) {
        this.trusteeimage.active = true;
      }
      // 兼容：如果没有托管图标，复用离线图标
      if (!this.trusteeimage && this.offlineimage) {
        this.offlineimage.active = true;
      }
    } else {
      // 取消托管状态
      if (this.trusteeimage) {
        this.trusteeimage.active = false;
      }
      // 同时隐藏离线图标
      if (this.offlineimage) {
        this.offlineimage.active = false;
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxwcmVmYWJzXFxwbGF5ZXJfbm9kZS5qcyJdLCJuYW1lcyI6WyJxaWFuX3N0YXRlIiwid2luZG93IiwiYnVxaWFuZyIsInFpYW4iLCJpc29wZW5fc291bmQiLCJjYyIsIkNsYXNzIiwiQ29tcG9uZW50IiwicHJvcGVydGllcyIsImFjY291bnRfbGFiZWwiLCJMYWJlbCIsIm5pY2tuYW1lX2xhYmVsIiwicm9vbV90b3V4aWFuZyIsIlNwcml0ZSIsImdsb2JhbGNvdW50X2xhYmVsIiwicm9vbV9tb25leV9mcmFtZSIsIk5vZGUiLCJoZWFkaW1hZ2UiLCJyZWFkeWltYWdlIiwib2ZmbGluZWltYWdlIiwidHJ1c3RlZWltYWdlIiwiY2FyZF9ub2RlIiwiY2FyZF9wcmVmYWIiLCJQcmVmYWIiLCJjbG9ja2ltYWdlIiwicWlhbmdkaWR6aHVfbm9kZSIsInRpbWVfbGFiZWwiLCJyb2JpbWFnZV9zcCIsIlNwcml0ZUZyYW1lIiwicm9ibm9pbWFnZV9zcCIsInJvYkljb25TcCIsInJvYkljb25fU3AiLCJyb2Jub0ljb25fU3AiLCJtYXN0ZXJJY29uIiwib25Mb2FkIiwiYWN0aXZlIiwiY3VycmVudENhcmRDb3VudCIsImNhcmRsaXN0X25vZGUiLCJub2RlIiwib24iLCJldmVudCIsInJlbW92ZUFsbENoaWxkcmVuIiwiYmluZCIsIm15Z2xvYmFsIiwiY29uc29sZSIsImVycm9yIiwibXlQbGF5ZXJJZCIsIl9nZXRNeVBsYXllcklkIiwiYWNjb3VudElkU3RyIiwiU3RyaW5nIiwiYWNjb3VudGlkIiwic2hvd0NhcmRCYWNrcyIsImRldGFpbCIsInJvdW5kIiwiaXNDYWxsIiwic3RhdGUiLCJkYXRhIiwiY291bnQiLCJfdXBkYXRlUGxheWVyU3RhdGUiLCJfdXBkYXRlVHJ1c3RlZVN0YXRlIiwic2VhdF9pbmRleCIsInN0cmluZyIsInJlbWFpbmluZyIsInN0YXJ0Iiwic29ja2V0IiwiZ2V0UGxheWVySW5mbyIsInBsYXllckluZm8iLCJpZCIsInBsYXllckRhdGEiLCJzZXJ2ZXJQbGF5ZXJJZCIsImFjY291bnRJRCIsImluaXRfZGF0YSIsImluZGV4IiwiYWNjb3VudElkIiwibG9nIiwibmlja19uYW1lIiwiZGlzcGxheVZhbHVlIiwiaXNBcmVuYU1vZGUiLCJyb29tX2NhdGVnb3J5IiwiX2lzQXJlbmFNb2RlIiwiYXJlbmFfZ29sZCIsInVuZGVmaW5lZCIsInBlcmlvZF9ubyIsIm1hdGNoX2NvaW4iLCJnb2xkX2NvdW50IiwiZ29sZGNvdW50IiwiX2FyZW5hR29sZCIsIl9wZXJpb2RObyIsImlzUmVhZHkiLCJpc3JlYWR5IiwicmVhZHkiLCJJc1JlYWR5IiwieCIsInkiLCJhbmNob3JYIiwiYW5jaG9yWSIsInpJbmRleCIsInBhcmVudCIsInNvcnRBbGxDaGlsZHJlbiIsImF2YXRhclVybCIsImF2YXRhciIsImF2YXRhcnVybCIsIl9sb2FkQXZhdGFyIiwicmVhZHlQbGF5ZXJJZCIsInBsYXllcl9pZCIsInBsYXllcklkIiwidGltZW91dCIsIl9zZXJ2ZXJUaW1lb3V0IiwiX3NldEF2YXRhclNwcml0ZSIsInNwcml0ZUZyYW1lIiwiZW5hYmxlZCIsInNldENvbnRlbnRTaXplIiwic2NhbGUiLCJzZWxmIiwid2FybiIsIl9sb2FkRGVmYXVsdEF2YXRhciIsIl9hdmF0YXJDYWNoZSIsImNhY2hlZFNwcml0ZUZyYW1lIiwiaW5kZXhPZiIsInNlcnZlclVybCIsIl9sb2FkUmVtb3RlQXZhdGFyIiwibG9jYWxQYXRoIiwibG9hZGVyIiwibG9hZFJlcyIsImVyciIsInVybCIsImV4dCIsImFzc2V0TWFuYWdlciIsImxvYWRSZW1vdGUiLCJ0ZXh0dXJlIiwiZSIsInVwZGF0ZUFyZW5hRGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsImkiLCJjYXJkIiwiaW5zdGFudGlhdGUiLCJoZWlnaHQiLCJwdXNoIiwiY2FyZHNfY291bnQiLCJpc19sYW5kbG9yZCIsImlzX3RydXN0ZWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7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UyxJQUFJekIsSUFBSSxDQUFDcUYsV0FBVyxLQUFLLElBQUksRUFBRTtNQUM3RCxJQUFJLElBQUksQ0FBQzVHLFVBQVUsRUFBRTtRQUNqQixJQUFJLENBQUNBLFVBQVUsQ0FBQ0UsTUFBTSxHQUFHLElBQUk7TUFDakM7SUFDSjtFQUNKLENBQUM7RUFFRDtBQUNKO0FBQ0E7QUFDQTtFQUNJd0IsbUJBQW1CLEVBQUUsU0FBQUEsb0JBQVNILElBQUksRUFBRTtJQUNoQztJQUNBLElBQUlBLElBQUksQ0FBQ2dELFNBQVMsS0FBSyxJQUFJLENBQUN0RCxTQUFTLEVBQUU7TUFDbkM7SUFDSjtJQUVBLElBQUlNLElBQUksQ0FBQ3NGLFVBQVUsRUFBRTtNQUNqQjtNQUNBLElBQUksSUFBSSxDQUFDMUgsWUFBWSxFQUFFO1FBQ25CLElBQUksQ0FBQ0EsWUFBWSxDQUFDZSxNQUFNLEdBQUcsSUFBSTtNQUNuQztNQUNBO01BQ0EsSUFBSSxDQUFDLElBQUksQ0FBQ2YsWUFBWSxJQUFJLElBQUksQ0FBQ0QsWUFBWSxFQUFFO1FBQ3pDLElBQUksQ0FBQ0EsWUFBWSxDQUFDZ0IsTUFBTSxHQUFHLElBQUk7TUFDbkM7SUFDSixDQUFDLE1BQU07TUFDSDtNQUNBLElBQUksSUFBSSxDQUFDZixZQUFZLEVBQUU7UUFDbkIsSUFBSSxDQUFDQSxZQUFZLENBQUNlLE1BQU0sR0FBRyxLQUFLO01BQ3BDO01BQ0E7TUFDQSxJQUFJLElBQUksQ0FBQ2hCLFlBQVksRUFBRTtRQUNuQixJQUFJLENBQUNBLFlBQVksQ0FBQ2dCLE1BQU0sR0FBRyxLQUFLO01BQ3BDO0lBQ0o7RUFDSjtBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5L2/55So5YWo5bGA5Y+Y6YeP77yM5LiN5L2/55SoIHJlcXVpcmVcbi8vIOOAkOS/ruWkjeeJiOacrOOAkeeugOWMluWvueaJi+eJjOiDjOaYvuekuu+8jOebtOaOpeWIm+W7uiAxNyDlvKDniYzog4xcbi8vIOaguOW/g+WOn+WIme+8mlxuLy8gMS4g5pS25YiwIHB1c2hfY2FyZF9ldmVudCDlkI7nm7TmjqXmmL7npLogMTcg5byg54mM6IOMXG4vLyAyLiDkuI3kvp3otZblrprml7blmajmiJbliqjnlLvosIPluqZcbi8vIDMuIOS/neivgeaVsOaNruato+ehruaAp1xuXG52YXIgcWlhbl9zdGF0ZSA9IHdpbmRvdy5xaWFuX3N0YXRlIHx8IHsgYnVxaWFuZzogMCwgcWlhbjogMSB9XG52YXIgaXNvcGVuX3NvdW5kID0gd2luZG93Lmlzb3Blbl9zb3VuZCB8fCAxXG5cbi8vIOKaoO+4j+OAkOW3suWIoOmZpOOAkXBsYXlSb2JTb3VuZCDlh73mlbAgLSDpn7PmlYjmkq3mlL7nu5/kuIDnlLEgZ2FtZWluZ1VJLl9wbGF5Um9iU291bmQg5aSE55CGXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFjY291bnRfbGFiZWw6IGNjLkxhYmVsLFxuICAgICAgICBuaWNrbmFtZV9sYWJlbDogY2MuTGFiZWwsXG4gICAgICAgIHJvb21fdG91eGlhbmc6IGNjLlNwcml0ZSxcbiAgICAgICAgZ2xvYmFsY291bnRfbGFiZWw6IGNjLkxhYmVsLFxuICAgICAgICByb29tX21vbmV5X2ZyYW1lOiBjYy5Ob2RlLCAgICAgLy8g6YeR5biB6IOM5pmv5qGGXG4gICAgICAgIGhlYWRpbWFnZTogY2MuU3ByaXRlLFxuICAgICAgICByZWFkeWltYWdlOiBjYy5Ob2RlLFxuICAgICAgICBvZmZsaW5laW1hZ2U6IGNjLk5vZGUsXG4gICAgICAgIHRydXN0ZWVpbWFnZTogY2MuTm9kZSwgICAgIC8vIPCflKfjgJDmiZjnrqHjgJHmiZjnrqHnirbmgIHlm77moIdcbiAgICAgICAgY2FyZF9ub2RlOiBjYy5Ob2RlLFxuICAgICAgICBjYXJkX3ByZWZhYjogY2MuUHJlZmFiLFxuICAgICAgICBjbG9ja2ltYWdlOiBjYy5Ob2RlLFxuICAgICAgICBxaWFuZ2RpZHpodV9ub2RlOiBjYy5Ob2RlLFxuICAgICAgICB0aW1lX2xhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgcm9iaW1hZ2Vfc3A6IGNjLlNwcml0ZUZyYW1lLFxuICAgICAgICByb2Jub2ltYWdlX3NwOiBjYy5TcHJpdGVGcmFtZSxcbiAgICAgICAgcm9iSWNvblNwOiBjYy5TcHJpdGUsXG4gICAgICAgIHJvYkljb25fU3A6IGNjLk5vZGUsXG4gICAgICAgIHJvYm5vSWNvbl9TcDogY2MuTm9kZSxcbiAgICAgICAgbWFzdGVySWNvbjogY2MuTm9kZVxuICAgIH0sXG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgdGhpcy5yZWFkeWltYWdlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICB0aGlzLm9mZmxpbmVpbWFnZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgaWYgKHRoaXMudHJ1c3RlZWltYWdlKSB0aGlzLnRydXN0ZWVpbWFnZS5hY3RpdmUgPSBmYWxzZSAgLy8g8J+Up+OAkOaJmOeuoeOAkeWIneWni+WMluaJmOeuoeWbvuagh1xuICAgICAgaWYgKHRoaXMubWFzdGVySWNvbikgdGhpcy5tYXN0ZXJJY29uLmFjdGl2ZSA9IGZhbHNlICAvLyDwn5Sn44CQ5L+u5aSN44CR5Yid5aeL5YyW5Zyw5Li75Zu+5qCH5Li66ZqQ6JePXG4gICAgICB0aGlzLmN1cnJlbnRDYXJkQ291bnQgPSAxN1xuICAgICAgdGhpcy5jYXJkbGlzdF9ub2RlID0gW11cbiAgICAgIFxuICAgICAgLy8g5ri45oiP5byA5aeL5LqL5Lu2XG4gICAgICB0aGlzLm5vZGUub24oXCJnYW1lc3RhcnRfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5yZWFkeWltYWdlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIGlmICh0aGlzLm1hc3Rlckljb24pIHRoaXMubWFzdGVySWNvbi5hY3RpdmUgPSBmYWxzZSAgLy8g8J+Up+OAkOS/ruWkjeOAkea4uOaIj+W8gOWni+aXtumakOiXj+WcsOS4u+Wbvuagh1xuICAgICAgICBpZiAodGhpcy5jYXJkX25vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2FyZF9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmNhcmRfbm9kZS5yZW1vdmVBbGxDaGlsZHJlbih0cnVlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FyZGxpc3Rfbm9kZSA9IFtdXG4gICAgICAgIHRoaXMuY3VycmVudENhcmRDb3VudCA9IDE3XG4gICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgIC8vIOOAkOaguOW/g+OAkeWPkeeJjOS6i+S7tiAtIOebtOaOpeaYvuekuiAxNyDlvKDniYzog4xcbiAgICAgIHRoaXMubm9kZS5vbihcInB1c2hfY2FyZF9ldmVudFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgXG4gICAgICAgIGlmICghbXlnbG9iYWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn4OPIFtwbGF5ZXJfbm9kZV0gcHVzaF9jYXJkX2V2ZW50OiBteWdsb2JhbCDkuI3lrZjlnKjvvIFcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlQbGF5ZXJJZCA9IHRoaXMuX2dldE15UGxheWVySWQobXlnbG9iYWwpXG4gICAgICAgIHZhciBhY2NvdW50SWRTdHIgPSBTdHJpbmcodGhpcy5hY2NvdW50aWQgfHwgXCJcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOaYr+iHquW3se+8jOi3s+i/h1xuICAgICAgICBpZihteVBsYXllcklkID09PSBhY2NvdW50SWRTdHIgJiYgYWNjb3VudElkU3RyICE9PSBcIlwiKXtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNob3dDYXJkQmFja3MoMTcpXG4gICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgIC8vIOaKouWcsOS4u+S6i+S7tlxuICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeaJgOacieeOqeWutuiKgueCuemDveiDveaYvuekuuaKouWcsOS4uy/kuI3miqLnirbmgIFcbiAgICAgIC8vIOKaoO+4j+OAkOmHjeimgeOAkemfs+aViOaSreaUvue7n+S4gOeUsSBnYW1laW5nVUkuX3BsYXlSb2JTb3VuZCDlpITnkIbvvIzmraTlpITkuI3lho3mkq3mlL7pn7PmlYhcbiAgICAgIHRoaXMubm9kZS5vbihcInBsYXllcm5vZGVfcm9iX3N0YXRlX2V2ZW50XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdmFyIGRldGFpbCA9IGV2ZW50XG4gICAgICAgICAgXG4gICAgICAgICAgLy8g6ZqQ6JeP5oqi5Zyw5Li75oyJ6ZKu77yI5b2T5YmN5pON5L2c55qE546p5a6277yJXG4gICAgICAgICAgaWYoZGV0YWlsLmFjY291bnRpZCA9PSB0aGlzLmFjY291bnRpZCl7XG4gICAgICAgICAgICB0aGlzLnFpYW5nZGlkemh1X25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5omA5pyJ546p5a626IqC54K56YO95pi+56S65a+55bqU546p5a6255qE5oqi5Zyw5Li754q25oCBXG4gICAgICAgICAgaWYodGhpcy5hY2NvdW50aWQgPT0gZGV0YWlsLmFjY291bnRpZCl7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5qC55o2u6L2u5qyh5Yy65YiGXCLlj6vlnLDkuLsv5LiN5Y+rXCLlkoxcIuaKouWcsOS4uy/kuI3miqJcIlxuICAgICAgICAgICAgdmFyIHJvdW5kID0gZGV0YWlsLnJvdW5kIHx8IDFcbiAgICAgICAgICAgIHZhciBpc0NhbGwgPSBkZXRhaWwuc3RhdGUgPT0gcWlhbl9zdGF0ZS5xaWFuIHx8IGRldGFpbC5zdGF0ZSA9PT0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihpc0NhbGwpe1xuICAgICAgICAgICAgICB0aGlzLnJvYkljb25fU3AuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAvLyDimqDvuI/jgJDlt7LliKDpmaTjgJHpn7PmlYjmkq3mlL7np7voh7MgZ2FtZWluZ1VJLl9wbGF5Um9iU291bmTvvIjmnI3liqHnq6/lub/mkq3op6blj5HvvIlcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICB0aGlzLnJvYm5vSWNvbl9TcC5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICAgIC8vIOKaoO+4j+OAkOW3suWIoOmZpOOAkemfs+aViOaSreaUvuenu+iHsyBnYW1laW5nVUkuX3BsYXlSb2JTb3VuZO+8iOacjeWKoeerr+W5v+aSreinpuWPke+8iVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgLy8g5oiQ5Li65Zyw5Li75LqL5Lu2XG4gICAgICB0aGlzLm5vZGUub24oXCJwbGF5ZXJub2RlX2NoYW5nZW1hc3Rlcl9ldmVudFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgdmFyIGRldGFpbCA9IGV2ZW50IFxuICAgICAgICAgdGhpcy5yb2JJY29uX1NwLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICB0aGlzLnJvYm5vSWNvbl9TcC5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgaWYoZGV0YWlsID09IHRoaXMuYWNjb3VudGlkKXtcbiAgICAgICAgICAgIHRoaXMubWFzdGVySWNvbi5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkQ291bnQgPSAyMFxuICAgICAgICAgICAgdGhpcy5zaG93Q2FyZEJhY2tzKDIwKVxuICAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgXG4gICAgICAvLyDniYzmlbDmm7TmlrDkuovku7ZcbiAgICAgIHRoaXMubm9kZS5vbihcInVwZGF0ZV9jYXJkX2NvdW50X2V2ZW50XCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgIGlmKGRhdGEuYWNjb3VudGlkID09IHRoaXMuYWNjb3VudGlkKXtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENhcmRDb3VudCA9IGRhdGEuY291bnRcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhcmRCYWNrcyhkYXRhLmNvdW50KVxuICAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgXG4gICAgICAvLyDjgJDmlrDlop7jgJHnjqnlrrbnirbmgIHmm7TmlrDkuovku7bvvIjmjonnur8v5LiK57q/L+aJmOeuoe+8iVxuICAgICAgdGhpcy5ub2RlLm9uKFwicGxheWVyX3N0YXRlX3VwZGF0ZVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJTdGF0ZShkYXRhKVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgXG4gICAgICAvLyDwn5Sn44CQ5omY566h44CR5omY566h54q25oCB5pu05paw5LqL5Lu2XG4gICAgICB0aGlzLm5vZGUub24oXCJ0cnVzdGVlX3N0YXRlX3VwZGF0ZVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICB0aGlzLl91cGRhdGVUcnVzdGVlU3RhdGUoZGF0YSlcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgLy8g8J+VkOOAkOaWsOWinuOAkeWAkuiuoeaXtuabtOaWsOS6i+S7tlxuICAgICAgdGhpcy5ub2RlLm9uKFwidXBkYXRlX2NvdW50ZG93bl9ldmVudFwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAvLyDlj6rmm7TmlrDlvZPliY3njqnlrrbnmoTlgJLorqHml7bmmL7npLpcbiAgICAgICAgIGlmICh0aGlzLnNlYXRfaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVfbGFiZWwpIHtcbiAgICAgICAgICAgICAgIHRoaXMudGltZV9sYWJlbC5zdHJpbmcgPSBTdHJpbmcoZGF0YS5yZW1haW5pbmcpXG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIHN0YXJ0ICgpIHtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOiOt+WPluW9k+WJjeeOqeWutklEXG4gICAgICovXG4gICAgX2dldE15UGxheWVySWQ6IGZ1bmN0aW9uKG15Z2xvYmFsKSB7XG4gICAgICAgIHZhciBteVBsYXllcklkID0gbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbykge1xuICAgICAgICAgICAgdmFyIHBsYXllckluZm8gPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpXG4gICAgICAgICAgICBpZiAocGxheWVySW5mbyAmJiBwbGF5ZXJJbmZvLmlkKSB7XG4gICAgICAgICAgICAgICAgbXlQbGF5ZXJJZCA9IHBsYXllckluZm8uaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFteVBsYXllcklkICYmIG15Z2xvYmFsLnBsYXllckRhdGEgJiYgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCkge1xuICAgICAgICAgICAgbXlQbGF5ZXJJZCA9IG15Z2xvYmFsLnBsYXllckRhdGEuc2VydmVyUGxheWVySWRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFteVBsYXllcklkICYmIG15Z2xvYmFsLnBsYXllckRhdGEgJiYgbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpIHtcbiAgICAgICAgICAgIG15UGxheWVySWQgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gU3RyaW5nKG15UGxheWVySWQgfHwgXCJcIilcbiAgICB9LFxuXG4gICAgaW5pdF9kYXRhKGRhdGEsIGluZGV4KSB7XG4gICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcblxuICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWFvOWuuSBhY2NvdW50aWQg5ZKMIGFjY291bnRJZCDkuKTnp43lkb3lkI1cbiAgICAgIHRoaXMuYWNjb3VudGlkID0gZGF0YS5hY2NvdW50aWQgfHwgZGF0YS5hY2NvdW50SWQgfHwgXCJcIlxuICAgICAgdGhpcy5zZWF0X2luZGV4ID0gaW5kZXhcbiAgICAgIFxuICAgICAgLy8g8J+Up+OAkOiwg+ivleOAkei+k+WHuiBhY2NvdW50aWQg6K6+572uXG4gICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW3BsYXllcl9ub2RlLmluaXRfZGF0YV0gYWNjb3VudGlkOlwiLCB0aGlzLmFjY291bnRpZCwgXCJzZWF0X2luZGV4OlwiLCB0aGlzLnNlYXRfaW5kZXgsIFwibmlja19uYW1lOlwiLCBkYXRhLm5pY2tfbmFtZSlcblxuICAgICAgLy8g5ZCM5q2l546p5a62SURcbiAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5wbGF5ZXJEYXRhICYmICFteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkKSB7XG4gICAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbykge1xuICAgICAgICAgICAgICB2YXIgcGxheWVySW5mbyA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKClcbiAgICAgICAgICAgICAgaWYgKHBsYXllckluZm8gJiYgcGxheWVySW5mby5pZCkge1xuICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5zZXJ2ZXJQbGF5ZXJJZCA9IHBsYXllckluZm8uaWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY2NvdW50X2xhYmVsLm5vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgIHRoaXMubmlja25hbWVfbGFiZWwuc3RyaW5nID0gZGF0YS5uaWNrX25hbWUgfHwgKFwi546p5a62XCIgKyAoaW5kZXggKyAxKSlcblxuICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWMuuWIhuaZrumAmuWcuuWSjOernuaKgOWcuueahOmHkeW4geaYvuekulxuICAgICAgLy8g56ue5oqA5Zy65qih5byP5LiL5pi+56S6IGFyZW5hX2dvbGTvvIjlvZPmnJ/otZvkuovph5HluIHvvInvvIzmma7pgJrlnLrmmL7npLogZ29sZF9jb3VudO+8iOasouS5kOixhu+8iVxuICAgICAgdmFyIGRpc3BsYXlWYWx1ZSA9IDBcbiAgICAgIHZhciBpc0FyZW5hTW9kZSA9IGRhdGEucm9vbV9jYXRlZ29yeSA9PT0gMiB8fCB0aGlzLl9pc0FyZW5hTW9kZVxuXG4gICAgICBpZiAoaXNBcmVuYU1vZGUpIHtcbiAgICAgICAgICAvLyDnq57mioDlnLrmqKHlvI/vvJrkvJjlhYjmmL7npLogYXJlbmFfZ29sZO+8iOW9k+acn+i1m+S6i+mHkeW4ge+8iVxuICAgICAgICAgIGlmIChkYXRhLmFyZW5hX2dvbGQgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmFyZW5hX2dvbGQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgZGlzcGxheVZhbHVlID0gZGF0YS5hcmVuYV9nb2xkXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOernuaKgOWcuuaooeW8jyAtIOaYteensDpcIiwgZGF0YS5uaWNrX25hbWUsIFwiYXJlbmFfZ29sZDpcIiwgZGF0YS5hcmVuYV9nb2xkLCBcIuacn+WPtzpcIiwgZGF0YS5wZXJpb2Rfbm8pXG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLm1hdGNoX2NvaW4gIT09IHVuZGVmaW5lZCAmJiBkYXRhLm1hdGNoX2NvaW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgZGlzcGxheVZhbHVlID0gZGF0YS5tYXRjaF9jb2luXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOernuaKgOWcuuaooeW8jyjlhbzlrrkpIC0g5pi156ewOlwiLCBkYXRhLm5pY2tfbmFtZSwgXCJtYXRjaF9jb2luOlwiLCBkYXRhLm1hdGNoX2NvaW4pXG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmdvbGRfY291bnQgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmdvbGRfY291bnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgZGlzcGxheVZhbHVlID0gZGF0YS5nb2xkX2NvdW50XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOernuaKgOWcuuaooeW8j++8iOaXoGFyZW5hX2dvbGTvvIktIOS9v+eUqCBnb2xkX2NvdW50OlwiLCBkYXRhLmdvbGRfY291bnQpXG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDmma7pgJrlnLrvvJrmmL7npLrmrKLkuZDosYZcbiAgICAgICAgICBpZiAoZGF0YS5nb2xkX2NvdW50ICE9PSB1bmRlZmluZWQgJiYgZGF0YS5nb2xkX2NvdW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSA9IGRhdGEuZ29sZF9jb3VudFxuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5nb2xkY291bnQgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmdvbGRjb3VudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBkYXRhLmdvbGRjb3VudFxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfqpkgW3BsYXllcl9ub2RlXSDmma7pgJrlnLogLSDmmLXnp7A6XCIsIGRhdGEubmlja19uYW1lLCBcImdvbGRfY291bnQ6XCIsIGRhdGEuZ29sZF9jb3VudCwgXCLmnIDnu4jph5HluIE6XCIsIGRpc3BsYXlWYWx1ZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5nbG9iYWxjb3VudF9sYWJlbC5zdHJpbmcgPSBTdHJpbmcoZGlzcGxheVZhbHVlKVxuICAgICAgdGhpcy5faXNBcmVuYU1vZGUgPSBpc0FyZW5hTW9kZSAvLyDkv53lrZjnq57mioDlnLrmqKHlvI/nirbmgIFcbiAgICAgIHRoaXMuX2FyZW5hR29sZCA9IGRpc3BsYXlWYWx1ZSAvLyDwn5Sn44CQ5paw5aKe44CR5L+d5a2Y5b2T5YmN6LWb5LqL6YeR5biBXG4gICAgICB0aGlzLl9wZXJpb2RObyA9IGRhdGEucGVyaW9kX25vIHx8IFwiXCIgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOacn+WPt1xuICAgICAgdGhpcy5jYXJkbGlzdF9ub2RlID0gW11cblxuICAgICAgLy8g5qOA5p+l5YeG5aSH54q25oCBXG4gICAgICB2YXIgaXNSZWFkeSA9IGRhdGEuaXNyZWFkeSB8fCBkYXRhLnJlYWR5IHx8IGRhdGEuSXNSZWFkeSB8fCBmYWxzZVxuICAgICAgaWYoaXNSZWFkeSA9PSB0cnVlIHx8IGlzUmVhZHkgPT09IFwidHJ1ZVwiIHx8IGlzUmVhZHkgPT09IDEpe1xuICAgICAgICB0aGlzLnJlYWR5aW1hZ2UuYWN0aXZlID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeWltYWdlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIC8vIOOAkOaguOW/g+S/ruaUueOAkeW9k+WJjeeOqeWutu+8iGluZGV4ID09IDDvvInvvJrpmpDol4/niYzog4zvvIzosIPmlbTlpLTlg4/kvY3nva5cbiAgICAgIGlmIChpbmRleCA9PSAwKSB7XG4gICAgICAgIC8vIOmakOiXj+eJjOiDjOiKgueCuVxuICAgICAgICBpZiAodGhpcy5jYXJkX25vZGUpIHtcbiAgICAgICAgICB0aGlzLmNhcmRfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIC8vIOiwg+aVtOWktOWDj+S9jee9ruWIsOeJjOiDjOS9jee9ru+8iOeJjOiDjOS9jee9ru+8mls4MCwgMzJd77yJXG4gICAgICAgIGlmICh0aGlzLnJvb21fdG91eGlhbmcpIHtcbiAgICAgICAgICB0aGlzLnJvb21fdG91eGlhbmcubm9kZS54ID0gODBcbiAgICAgICAgICB0aGlzLnJvb21fdG91eGlhbmcubm9kZS55ID0gMzJcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5oZWFkaW1hZ2UpIHtcbiAgICAgICAgICB0aGlzLmhlYWRpbWFnZS5ub2RlLnggPSA4MFxuICAgICAgICAgIHRoaXMuaGVhZGltYWdlLm5vZGUueSA9IDMyXG4gICAgICAgIH1cbiAgICAgICAgLy8g6LCD5pW05pi156ew5qCH562+5L2N572u77yI5aS05YOP5q2j5LiK5pa577yM5bGF5Lit5pi+56S677yJXG4gICAgICAgIGlmICh0aGlzLm5pY2tuYW1lX2xhYmVsICYmIHRoaXMubmlja25hbWVfbGFiZWwubm9kZSkge1xuICAgICAgICAgIC8vIOiuvue9rumUmueCueS4uuS4reW/g++8jOehruS/neWxheS4reaYvuekulxuICAgICAgICAgIHRoaXMubmlja25hbWVfbGFiZWwubm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgdGhpcy5uaWNrbmFtZV9sYWJlbC5ub2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgICAvLyDkvY3nva7kuI7lpLTlg48geCDnm7jlkIzvvIx5IOWcqOWktOWDj+S4iuaWuVxuICAgICAgICAgIHRoaXMubmlja25hbWVfbGFiZWwubm9kZS54ID0gODBcbiAgICAgICAgICB0aGlzLm5pY2tuYW1lX2xhYmVsLm5vZGUueSA9IDkwXG4gICAgICAgIH1cbiAgICAgICAgLy8g6LCD5pW06YeR5biB5qCH562+5L2N572u77yI5aS05YOP5LiL5pa577yM5bGF5Lit5pi+56S677yJXG4gICAgICAgIGlmICh0aGlzLmdsb2JhbGNvdW50X2xhYmVsICYmIHRoaXMuZ2xvYmFsY291bnRfbGFiZWwubm9kZSkge1xuICAgICAgICAgIC8vIOiuvue9rumUmueCueS4uuS4reW/g++8jOehruS/neWxheS4reaYvuekulxuICAgICAgICAgIHRoaXMuZ2xvYmFsY291bnRfbGFiZWwubm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgICAgdGhpcy5nbG9iYWxjb3VudF9sYWJlbC5ub2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgICAvLyDkvY3nva7kuI7lpLTlg48geCDnm7jlkIzvvIx5IOWcqOWktOWDj+S4i+aWuVxuICAgICAgICAgIHRoaXMuZ2xvYmFsY291bnRfbGFiZWwubm9kZS54ID0gODBcbiAgICAgICAgICB0aGlzLmdsb2JhbGNvdW50X2xhYmVsLm5vZGUueSA9IC0yOFxuICAgICAgICB9XG4gICAgICAgIC8vIOiwg+aVtOmHkeW4geiDjOaZr+ahhuS9jee9ru+8iOS4jumHkeW4geagh+etvuWvuem9kO+8iVxuICAgICAgICBpZiAodGhpcy5yb29tX21vbmV5X2ZyYW1lKSB7XG4gICAgICAgICAgdGhpcy5yb29tX21vbmV5X2ZyYW1lLnggPSA4MFxuICAgICAgICAgIHRoaXMucm9vbV9tb25leV9mcmFtZS55ID0gLTI4XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LCD5pW05YeG5aSH5Zu+5qCH5L2N572u77yI5aS05YOP5Y+z5LiL6KeS77yJXG4gICAgICAgIGlmICh0aGlzLnJlYWR5aW1hZ2UpIHtcbiAgICAgICAgICB0aGlzLnJlYWR5aW1hZ2UueCA9IDEwNVxuICAgICAgICAgIHRoaXMucmVhZHlpbWFnZS55ID0gNVxuICAgICAgICB9XG4gICAgICAgIC8vIOiwg+aVtOWcsOS4u+Wbvuagh+S9jee9ru+8iOWktOWDj+WPs+S4i+inku+8iVxuICAgICAgICBpZiAodGhpcy5tYXN0ZXJJY29uKSB7XG4gICAgICAgICAgdGhpcy5tYXN0ZXJJY29uLnggPSAxMDVcbiAgICAgICAgICB0aGlzLm1hc3Rlckljb24ueSA9IDVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyDorr7nva7lsYLnuqdcbiAgICAgIGlmICh0aGlzLnJvb21fdG91eGlhbmcgJiYgdGhpcy5oZWFkaW1hZ2UpIHtcbiAgICAgICAgICB0aGlzLmhlYWRpbWFnZS5ub2RlLnpJbmRleCA9IDBcbiAgICAgICAgICB0aGlzLnJvb21fdG91eGlhbmcubm9kZS56SW5kZXggPSAxMDBcbiAgICAgICAgICB0aGlzLmhlYWRpbWFnZS5ub2RlLnBhcmVudC5zb3J0QWxsQ2hpbGRyZW4oKVxuICAgICAgfVxuXG4gICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Yqg6L295aS05YOPIC0g5pSv5oyB6L+c56iLVVJM5ZKM5pys5Zyw6LWE5rqQXG4gICAgICAvLyDmnI3liqHnq6/lj6/og73ov5Tlm54gYXZhdGFyLCBhdmF0YXJVcmwsIOaIliBhdmF0YXJ1cmwg5a2X5q61XG4gICAgICB2YXIgYXZhdGFyVXJsID0gZGF0YS5hdmF0YXIgfHwgZGF0YS5hdmF0YXJVcmwgfHwgZGF0YS5hdmF0YXJ1cmwgfHwgXCJhdmF0YXJfMVwiXG4gICAgICB0aGlzLl9sb2FkQXZhdGFyKGF2YXRhclVybClcblxuICAgICAgLy8g5YeG5aSH6YCa55+lXG4gICAgICB0aGlzLm5vZGUub24oXCJwbGF5ZXJfcmVhZHlfbm90aWZ5XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdmFyIGRldGFpbCA9IGV2ZW50XG4gICAgICAgICAgdmFyIHJlYWR5UGxheWVySWQgPSBcIlwiXG4gICAgICAgICAgaWYgKHR5cGVvZiBkZXRhaWwgPT09ICdvYmplY3QnICYmIGRldGFpbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICByZWFkeVBsYXllcklkID0gZGV0YWlsLnBsYXllcl9pZCB8fCBkZXRhaWwucGxheWVySWQgfHwgZGV0YWlsLmlkIHx8IFwiXCJcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWFkeVBsYXllcklkID0gZGV0YWlsXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYocmVhZHlQbGF5ZXJJZCA9PSB0aGlzLmFjY291bnRpZCl7XG4gICAgICAgICAgICAgIHRoaXMucmVhZHlpbWFnZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAvLyDmiqLlnLDkuLvpgJrnn6VcbiAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmjqXmlLbljIXlkKsgcGxheWVyX2lkIOWSjCB0aW1lb3V0IOeahOS6i+S7tuWvueixoe+8jOS4jeWGjeehrOe8lueggVxuICAgICAgdGhpcy5ub2RlLm9uKFwicGxheWVybm9kZV9jYW5yb2JfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyDlhbzlrrnlpITnkIbvvJpldmVudCDlj6/og73mmK/lrZfnrKbkuLLvvIjml6fmoLzlvI/vvInmiJblr7nosaHvvIjmlrDmoLzlvI/vvIlcbiAgICAgICAgICB2YXIgcGxheWVySWQgPSBldmVudFxuICAgICAgICAgIHZhciB0aW1lb3V0ID0gMTUgIC8vIOm7mOiupCAxNSDnp5JcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50ID09PSAnb2JqZWN0JyAmJiBldmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBwbGF5ZXJJZCA9IGV2ZW50LnBsYXllcl9pZFxuICAgICAgICAgICAgICB0aW1lb3V0ID0gZXZlbnQudGltZW91dCB8fCAxNVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyDlrZjlgqggdGltZW91dCDlgLzkvpvlgJLorqHml7bmm7TmlrDkvb/nlKhcbiAgICAgICAgICB0aGlzLl9zZXJ2ZXJUaW1lb3V0ID0gdGltZW91dFxuICAgICAgICAgIFxuICAgICAgICAgIGlmKHBsYXllcklkID09IHRoaXMuYWNjb3VudGlkKXtcbiAgICAgICAgICAgIHRoaXMucWlhbmdkaWR6aHVfbm9kZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lX2xhYmVsKSB7XG4gICAgICAgICAgICAgIHRoaXMudGltZV9sYWJlbC5zdHJpbmcgPSBTdHJpbmcodGltZW91dClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgICBcbiAgICAgIC8vIPCflZAg5a2Y5YKo5pyN5Yqh56uv5Lyg6YCS55qEIHRpbWVvdXQg5YC8XG4gICAgICB0aGlzLl9zZXJ2ZXJUaW1lb3V0ID0gMTVcblxuICAgICAgaWYoaW5kZXggPT0gMSl7XG4gICAgICAgIHRoaXMuY2FyZF9ub2RlLnggPSAtdGhpcy5jYXJkX25vZGUueCAtIDMwXG4gICAgICB9XG4gICAgfSxcblxuICAgIF9zZXRBdmF0YXJTcHJpdGU6IGZ1bmN0aW9uKHNwcml0ZUZyYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5oZWFkaW1hZ2UgfHwgIXNwcml0ZUZyYW1lKSByZXR1cm5cbiAgICAgICAgdGhpcy5oZWFkaW1hZ2UuZW5hYmxlZCA9IHRydWVcbiAgICAgICAgdGhpcy5oZWFkaW1hZ2Uuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICB0aGlzLmhlYWRpbWFnZS5ub2RlLnNldENvbnRlbnRTaXplKDgwLCA4MClcbiAgICAgICAgdGhpcy5oZWFkaW1hZ2Uubm9kZS5zY2FsZSA9IDFcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWKoOi9veWktOWDjyAtIOaUr+aMgei/nOeoi1VSTOWSjOacrOWcsOi1hOa6kFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhdmF0YXJVcmwgLSDlpLTlg49VUkzmiJbmnKzlnLDotYTmupDlkI1cbiAgICAgKi9cbiAgICBfbG9hZEF2YXRhcjogZnVuY3Rpb24oYXZhdGFyVXJsKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLmhlYWRpbWFnZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+WvO+4jyBbcGxheWVyX25vZGVdIGhlYWRpbWFnZSDmnKrnu5HlrppcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g56m65YC85aSE55CGXG4gICAgICAgIGlmICghYXZhdGFyVXJsIHx8IGF2YXRhclVybCA9PT0gXCJcIikge1xuICAgICAgICAgICAgdGhpcy5fbG9hZERlZmF1bHRBdmF0YXIoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5LyY5YyW44CR5LyY5YWI5L2/55So6aKE5Yqg6L2955qE57yT5a2Y5aS05YOPXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuX2F2YXRhckNhY2hlICYmIG15Z2xvYmFsLl9hdmF0YXJDYWNoZVthdmF0YXJVcmxdKSB7XG4gICAgICAgICAgICB2YXIgY2FjaGVkU3ByaXRlRnJhbWUgPSBteWdsb2JhbC5fYXZhdGFyQ2FjaGVbYXZhdGFyVXJsXVxuICAgICAgICAgICAgaWYgKGNhY2hlZFNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn5a877iPIFtwbGF5ZXJfbm9kZV0g5L2/55So57yT5a2Y5aS05YOPOlwiLCBhdmF0YXJVcmwpXG4gICAgICAgICAgICAgICAgc2VsZi5fc2V0QXZhdGFyU3ByaXRlKGNhY2hlZFNwcml0ZUZyYW1lKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkhOeQhuS7pSAvIOW8gOWktOeahOi3r+W+hO+8iOacjeWKoeWZqOebuOWvuei3r+W+hO+8iVxuICAgICAgICBpZiAoYXZhdGFyVXJsLmluZGV4T2YoJy8nKSA9PT0gMCAmJiBhdmF0YXJVcmwuaW5kZXhPZignL3VwbG9hZHMvJykgPT09IDApIHtcbiAgICAgICAgICAgIC8vIOaLvOaOpeacjeWKoeWZqOWcsOWdgFxuICAgICAgICAgICAgdmFyIHNlcnZlclVybCA9ICdodHRwczovL2hvdXRhaXMuaG9uZ3hpdTg4LmNvbScgKyBhdmF0YXJVcmxcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+WvO+4jyBbcGxheWVyX25vZGVdIOWKoOi9veacjeWKoeWZqOWktOWDjyjmoLzlvI8xKTpcIiwgc2VydmVyVXJsKVxuICAgICAgICAgICAgdGhpcy5fbG9hZFJlbW90ZUF2YXRhcihzZXJ2ZXJVcmwpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWIpOaWreaYr+WQpuaYr+i/nOeoi1VSTFxuICAgICAgICBpZiAoYXZhdGFyVXJsLmluZGV4T2YoJ2h0dHA6Ly8nKSA9PT0gMCB8fCBhdmF0YXJVcmwuaW5kZXhPZignaHR0cHM6Ly8nKSA9PT0gMCkge1xuICAgICAgICAgICAgLy8g6L+c56iLVVJM5aS05YOPXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCflrzvuI8gW3BsYXllcl9ub2RlXSDliqDovb3ov5znqIvlpLTlg486XCIsIGF2YXRhclVybClcbiAgICAgICAgICAgIHRoaXMuX2xvYWRSZW1vdGVBdmF0YXIoYXZhdGFyVXJsKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5pys5Zyw6LWE5rqQ5aS05YOPXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCflrzvuI8gW3BsYXllcl9ub2RlXSDliqDovb3mnKzlnLDlpLTlg486XCIsIGF2YXRhclVybClcbiAgICAgICAgICAgIHZhciBsb2NhbFBhdGggPSBcIlVJL2hlYWRpbWFnZS9cIiArIGF2YXRhclVybFxuICAgICAgICAgICAgY2MubG9hZGVyLmxvYWRSZXMobG9jYWxQYXRoLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgfHwgIXNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCflrzvuI8gW3BsYXllcl9ub2RlXSDmnKzlnLDlpLTlg4/liqDovb3lpLHotKXvvIzkvb/nlKjpu5jorqTlpLTlg486XCIsIGVycilcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRBdmF0YXIoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5fc2V0QXZhdGFyU3ByaXRlKHNwcml0ZUZyYW1lKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+WvO+4jyBbcGxheWVyX25vZGVdIOacrOWcsOWktOWDj+WKoOi9veaIkOWKn1wiKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5Yqg6L296L+c56iL5aS05YOPXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIOWujOaVtOeahOi/nOeoi1VSTFxuICAgICAqL1xuICAgIF9sb2FkUmVtb3RlQXZhdGFyOiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5qC55o2uVVJM56Gu5a6a5q2j56Gu55qE5omp5bGV5ZCN77yM6YG/5YWN5Yqg6L295aSx6LSlXG4gICAgICAgIHZhciBleHQgPSAnLnBuZycgIC8vIOm7mOiupOaJqeWxleWQjVxuICAgICAgICBpZiAodXJsLmluZGV4T2YoJy5qcGcnKSA+IDAgfHwgdXJsLmluZGV4T2YoJy5qcGVnJykgPiAwKSB7XG4gICAgICAgICAgICBleHQgPSAnLmpwZydcbiAgICAgICAgfSBlbHNlIGlmICh1cmwuaW5kZXhPZignLnBuZycpID4gMCkge1xuICAgICAgICAgICAgZXh0ID0gJy5wbmcnXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+WvO+4jyBbcGxheWVyX25vZGVdIOW8gOWni+WKoOi9vei/nOeoi+WktOWDjzpcIiwgdXJsLCBcIuaJqeWxleWQjTpcIiwgZXh0KVxuICAgICAgICBcbiAgICAgICAgY2MuYXNzZXRNYW5hZ2VyLmxvYWRSZW1vdGUodXJsLCBmdW5jdGlvbihlcnIsIHRleHR1cmUpIHtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgIXRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5a877iPIFtwbGF5ZXJfbm9kZV0g6L+c56iL5aS05YOP5Yqg6L295aSx6LSl77yM5L2/55So6buY6K6k5aS05YOPOlwiLCBlcnIpXG4gICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRBdmF0YXIoKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUodGV4dHVyZSlcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2V0QXZhdGFyU3ByaXRlKHNwcml0ZUZyYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCflrzvuI8gW3BsYXllcl9ub2RlXSDov5znqIvlpLTlg4/liqDovb3miJDlip86XCIsIHVybClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+WvO+4jyBbcGxheWVyX25vZGVdIOWIm+W7ulNwcml0ZUZyYW1l5aSx6LSlOlwiLCBlKVxuICAgICAgICAgICAgICAgIHNlbGYuX2xvYWREZWZhdWx0QXZhdGFyKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWKoOi9vem7mOiupOWktOWDj1xuICAgICAqL1xuICAgIF9sb2FkRGVmYXVsdEF2YXRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICBjYy5sb2FkZXIubG9hZFJlcyhcIlVJL2hlYWRpbWFnZS9hdmF0YXJfMVwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zZXRBdmF0YXJTcHJpdGUoc3ByaXRlRnJhbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmm7TmlrDnq57mioDlnLrnjqnlrrbmlbDmja7vvIjlpLTlg4/jgIHph5HluIHnrYnvvIlcbiAgICAgKiDlvZPmlLbliLAgUk9PTV9KT0lORUQg5raI5oGv5ZCO6LCD55So77yM5pu05paw5LuO5pyN5Yqh56uv6I635Y+W55qE5q2j56Gu5pWw5o2uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSDljIXlkKsgZ29sZF9jb3VudCwgYXJlbmFfZ29sZCwgbWF0Y2hfY29pbiwgYXZhdGFyLCBhdmF0YXJVcmxcbiAgICAgKi9cbiAgICB1cGRhdGVBcmVuYURhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtwbGF5ZXJfbm9kZV0gdXBkYXRlQXJlbmFEYXRhIOiiq+iwg+eUqCwgYWNjb3VudGlkOlwiLCB0aGlzLmFjY291bnRpZCwgXCJkYXRhOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnq57mioDlnLrmqKHlvI/kvJjlhYjkvb/nlKggbWF0Y2hfY29pbu+8jOWFtuasoSBhcmVuYV9nb2xkXG4gICAgICAgIHZhciBkaXNwbGF5VmFsdWUgPSAwXG4gICAgICAgIGlmIChkYXRhLm1hdGNoX2NvaW4gIT09IHVuZGVmaW5lZCAmJiBkYXRhLm1hdGNoX2NvaW4gIT09IG51bGwgJiYgZGF0YS5tYXRjaF9jb2luID4gMCkge1xuICAgICAgICAgICAgZGlzcGxheVZhbHVlID0gZGF0YS5tYXRjaF9jb2luXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW3BsYXllcl9ub2RlXSDmm7TmlrAgbWF0Y2hfY29pbjpcIiwgZGF0YS5tYXRjaF9jb2luKVxuICAgICAgICB9IGVsc2UgaWYgKGRhdGEuYXJlbmFfZ29sZCAhPT0gdW5kZWZpbmVkICYmIGRhdGEuYXJlbmFfZ29sZCAhPT0gbnVsbCAmJiBkYXRhLmFyZW5hX2dvbGQgPiAwKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBkYXRhLmFyZW5hX2dvbGRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOabtOaWsCBhcmVuYV9nb2xkOlwiLCBkYXRhLmFyZW5hX2dvbGQpXG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS5nb2xkX2NvdW50ICE9PSB1bmRlZmluZWQgJiYgZGF0YS5nb2xkX2NvdW50ICE9PSBudWxsICYmIGRhdGEuZ29sZF9jb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSA9IGRhdGEuZ29sZF9jb3VudFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtwbGF5ZXJfbm9kZV0g5pu05pawIGdvbGRfY291bnQ6XCIsIGRhdGEuZ29sZF9jb3VudClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeS9v+eUqOato+ehrueahCBnbG9iYWxjb3VudF9sYWJlbCDogIzpnZ4gZ29sZF9sYWJlbFxuICAgICAgICBpZiAoZGlzcGxheVZhbHVlID4gMCAmJiB0aGlzLmdsb2JhbGNvdW50X2xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbGNvdW50X2xhYmVsLnN0cmluZyA9IGRpc3BsYXlWYWx1ZS50b1N0cmluZygpXG4gICAgICAgICAgICB0aGlzLl9hcmVuYUdvbGQgPSBkaXNwbGF5VmFsdWUgLy8g5pu05paw5L+d5a2Y55qE6LWb5LqL6YeR5biBXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW3BsYXllcl9ub2RlXSDph5HluIHlt7Lmm7TmlrDkuLo6XCIsIGRpc3BsYXlWYWx1ZSlcbiAgICAgICAgfSBlbHNlIGlmIChkaXNwbGF5VmFsdWUgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOitpuWRiu+8mmRpc3BsYXlWYWx1ZSDkuLogMO+8jOi3s+i/h+abtOaWsFwiKVxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmdsb2JhbGNvdW50X2xhYmVsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4+f77iPIFtwbGF5ZXJfbm9kZV0g6ZSZ6K+v77yaZ2xvYmFsY291bnRfbGFiZWwg5pyq57uR5a6a77yBXCIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOWktOWDj1xuICAgICAgICB2YXIgYXZhdGFyVXJsID0gZGF0YS5hdmF0YXIgfHwgZGF0YS5hdmF0YXJVcmxcbiAgICAgICAgaWYgKGF2YXRhclVybCAmJiBhdmF0YXJVcmwgIT09IFwiXCIgJiYgYXZhdGFyVXJsICE9PSBcImF2YXRhcl8xXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbcGxheWVyX25vZGVdIOabtOaWsOWktOWDjzpcIiwgYXZhdGFyVXJsKVxuICAgICAgICAgICAgdGhpcy5fbG9hZEF2YXRhcihhdmF0YXJVcmwpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g44CQ5qC45b+D44CR55u05o6l5pi+56S654mM6IOM77yI5peg5Yqo55S777yM5L+d6K+B5pWw5o2u5q2j56Gu5oCn77yJXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog5pi+56S65oyH5a6a5pWw6YeP55qE54mM6IOMXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IC0g54mM6IOM5pWw6YePXG4gICAgICog44CQ6YeN6KaB44CR5b2T5YmN546p5a6277yIaW5kZXggPT0gMO+8ieS4jeaYvuekuueJjOiDjFxuICAgICAqL1xuICAgIHNob3dDYXJkQmFja3M6IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgICAgIFxuICAgICAgICAvLyDjgJDmoLjlv4PjgJHmo4Dmn6XmmK/lkKbmmK/lvZPliY3njqnlrrbvvIhpbmRleCA9PSAw77yJ77yM5aaC5p6c5piv5YiZ5LiN5pi+56S654mM6IOMXG4gICAgICAgIGlmICh0aGlzLnNlYXRfaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMuY2FyZF9ub2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+DjyBbcGxheWVyX25vZGVdIGNhcmRfbm9kZSDmnKrnu5HlrppcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIbml6fniYxcbiAgICAgICAgdGhpcy5jYXJkX25vZGUucmVtb3ZlQWxsQ2hpbGRyZW4odHJ1ZSlcbiAgICAgICAgdGhpcy5jYXJkbGlzdF9ub2RlID0gW11cbiAgICAgICAgXG4gICAgICAgIGlmIChjb3VudCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmNhcmRfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZENvdW50ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FyZF9ub2RlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgdGhpcy5jdXJyZW50Q2FyZENvdW50ID0gY291bnRcbiAgICAgICAgXG4gICAgICAgIGlmICghdGhpcy5jYXJkX3ByZWZhYikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfg48gW3BsYXllcl9ub2RlXSBjYXJkX3ByZWZhYiDmnKrnu5HlrppcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDnm7TmjqXliJvlu7rmiYDmnInniYzog4zvvIjml6DliqjnlLvvvIlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuY2FyZF9wcmVmYWIpXG4gICAgICAgICAgICBpZiAoIWNhcmQpIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNhcmQuc2NhbGUgPSAwLjZcbiAgICAgICAgICAgIGNhcmQucGFyZW50ID0gdGhpcy5jYXJkX25vZGVcbiAgICAgICAgICAgIGNhcmQuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlnoLnm7TloIblj6DluIPlsYBcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBjYXJkLmhlaWdodFxuICAgICAgICAgICAgY2FyZC55ID0gKGNvdW50IC0gMSkgKiAwLjUgKiBoZWlnaHQgKiAwLjQgKiAwLjMgLSBoZWlnaHQgKiAwLjQgKiAwLjMgKiBpXG4gICAgICAgICAgICBjYXJkLnggPSAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY2FyZGxpc3Rfbm9kZS5wdXNoKGNhcmQpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDjgJDmlrDlop7jgJHnjqnlrrbnirbmgIHmm7TmlrDlpITnkIZcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmm7TmlrDnjqnlrrbnirbmgIFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOWMheWQqyBzdGF0ZSwgY2FyZHNfY291bnQsIGlzX2xhbmRsb3JkLCB0aW1lb3V0XG4gICAgICovXG4gICAgX3VwZGF0ZVBsYXllclN0YXRlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDnprvnur8v5omY566h54q25oCB5pi+56S6XG4gICAgICAgIGlmIChkYXRhLnN0YXRlID09PSBcIm9mZmxpbmVcIikge1xuICAgICAgICAgICAgLy8g546p5a6256a757q/77yM5pi+56S656a757q/5Zu+5qCHXG4gICAgICAgICAgICBpZiAodGhpcy5vZmZsaW5laW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9mZmxpbmVpbWFnZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS5zdGF0ZSA9PT0gXCJyb2JvdFwiKSB7XG4gICAgICAgICAgICAvLyDmnLrlmajkurrmiZjnrqHvvIzmmL7npLrmiZjnrqHlm77moIdcbiAgICAgICAgICAgIGlmICh0aGlzLnRydXN0ZWVpbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJ1c3RlZWltYWdlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWFvOWuue+8muWmguaenOayoeacieaJmOeuoeWbvuagh++8jOWkjeeUqOemu+e6v+Wbvuagh1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRydXN0ZWVpbWFnZSAmJiB0aGlzLm9mZmxpbmVpbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmbGluZWltYWdlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnN0YXRlID09PSBcIm9ubGluZVwiKSB7XG4gICAgICAgICAgICAvLyDnjqnlrrblnKjnur/vvIzpmpDol4/nprvnur8v5omY566h5Zu+5qCHXG4gICAgICAgICAgICBpZiAodGhpcy5vZmZsaW5laW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9mZmxpbmVpbWFnZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMudHJ1c3RlZWltYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cnVzdGVlaW1hZ2UuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw54mM5pWwXG4gICAgICAgIGlmIChkYXRhLmNhcmRzX2NvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENhcmRDb3VudCA9IGRhdGEuY2FyZHNfY291bnRcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhcmRCYWNrcyhkYXRhLmNhcmRzX2NvdW50KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDlnLDkuLvmoIfor4ZcbiAgICAgICAgaWYgKGRhdGEuaXNfbGFuZGxvcmQgIT09IHVuZGVmaW5lZCAmJiBkYXRhLmlzX2xhbmRsb3JkID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXN0ZXJJY29uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXN0ZXJJY29uLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaJmOeuoeOAkeabtOaWsOaJmOeuoeeKtuaAgVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g5YyF5ZCrIHBsYXllcl9pZCwgcGxheWVyX25hbWUsIGlzX3RydXN0ZWUsIHJlYXNvblxuICAgICAqL1xuICAgIF91cGRhdGVUcnVzdGVlU3RhdGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8g5Y+q5aSE55CG5b2T5YmN546p5a6255qE5omY566h54q25oCBXG4gICAgICAgIGlmIChkYXRhLnBsYXllcl9pZCAhPT0gdGhpcy5hY2NvdW50aWQpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5pc190cnVzdGVlKSB7XG4gICAgICAgICAgICAvLyDlvIDlkK/miZjnrqHnirbmgIFcbiAgICAgICAgICAgIGlmICh0aGlzLnRydXN0ZWVpbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJ1c3RlZWltYWdlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWFvOWuue+8muWmguaenOayoeacieaJmOeuoeWbvuagh++8jOWkjeeUqOemu+e6v+Wbvuagh1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRydXN0ZWVpbWFnZSAmJiB0aGlzLm9mZmxpbmVpbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmbGluZWltYWdlLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWPlua2iOaJmOeuoeeKtuaAgVxuICAgICAgICAgICAgaWYgKHRoaXMudHJ1c3RlZWltYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cnVzdGVlaW1hZ2UuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWQjOaXtumakOiXj+emu+e6v+Wbvuagh1xuICAgICAgICAgICAgaWYgKHRoaXMub2ZmbGluZWltYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vZmZsaW5laW1hZ2UuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIl19