
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/gameScene/gameScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'e2b3cTV5veJAavN7xI0Vnkx', 'gameScene');
// scripts/gameScene/gameScene.js

"use strict";

// 使用全局变量，不使用 require
// 【修复版本】简化发牌逻辑，不再使用定时器调度
// 核心原则：
// 1. gameingUI.js 自己处理发牌动画
// 2. gameScene.js 只负责转发事件给 player_node
// 3. 不依赖 scheduleOnce 控制发牌节奏

cc.Class({
  "extends": cc.Component,
  properties: {
    di_label: cc.Label,
    beishu_label: cc.Label,
    roomid_label: cc.Label,
    player_node_prefabs: cc.Prefab,
    players_seat_pos: cc.Node
  },
  onLoad: function onLoad() {
    var myglobal = window.myglobal;
    var RoomState = window.RoomState || {
      ROOM_INVALID: -1
    };
    var isopen_sound = window.isopen_sound || 1;
    if (!myglobal || !myglobal.playerData || !myglobal.socket) {
      console.error("gameScene: myglobal、playerData 或 socket 未定义");
      this._waitForInit();
      return;
    }
    this._initScene(myglobal, RoomState, isopen_sound);
    this._startOnlineMonitoring();
  },
  // ============================================================
  // 在线监测和其他功能
  // ============================================================

  _startOnlineMonitoring: function _startOnlineMonitoring() {
    var myglobal = window.myglobal;
    if (!myglobal) {
      console.warn("gameScene: myglobal 未定义，无法启动在线监测");
      return;
    }
    var self = this;
    this._onlineStatusHandler = function (isOnline) {
      if (!isOnline) {
        self._showOfflineMessage();
      }
    };
    if (myglobal.addOnlineStatusListener) {
      myglobal.addOnlineStatusListener(this._onlineStatusHandler);
    }
    if (myglobal.eventlister) {
      myglobal.eventlister.on("force_logout", function (data) {
        console.warn("🚫 游戏场景收到强制下线事件:", data);
        self._handleForceLogout(data);
      });
    }
  },
  _showOfflineMessage: function _showOfflineMessage() {
    console.warn("💔 游戏场景：网络连接已断开");
  },
  _handleForceLogout: function _handleForceLogout(data) {
    var reason = data.reason || "您已被强制下线";
    console.warn("🚫 游戏场景强制下线:", reason);
    var myglobal = window.myglobal;
    if (myglobal && myglobal.stopOnlineMonitoring) {
      myglobal.stopOnlineMonitoring();
    }
    var self = this;
    this.scheduleOnce(function () {
      if (typeof alert === 'function') {
        alert(reason + "\n\n请重新登录");
      }
      cc.director.loadScene("loginScene");
    }, 0.5);
  },
  _stopOnlineMonitoring: function _stopOnlineMonitoring() {
    var myglobal = window.myglobal;
    if (myglobal && myglobal.removeOnlineStatusListener && this._onlineStatusHandler) {
      myglobal.removeOnlineStatusListener(this._onlineStatusHandler);
      this._onlineStatusHandler = null;
    }
  },
  _waitForInit: function _waitForInit() {
    var self = this;
    var attempts = 0;
    var maxAttempts = 20;
    var checkInit = function checkInit() {
      attempts++;
      var myglobal = window.myglobal;
      if (myglobal && myglobal.playerData && myglobal.socket) {
        var RoomState = window.RoomState || {
          ROOM_INVALID: -1
        };
        var isopen_sound = window.isopen_sound || 1;
        self._initScene(myglobal, RoomState, isopen_sound);
      } else if (attempts < maxAttempts) {
        setTimeout(checkInit, 100);
      } else {
        console.error("gameScene 初始化超时");
      }
    };
    setTimeout(checkInit, 100);
  },
  _initScene: function _initScene(myglobal, RoomState, isopen_sound) {
    this.playerNodeList = [];
    var bottom = myglobal.playerData.bottom || 1;
    var rate = myglobal.playerData.rate || 1;
    this.di_label.string = "底:" + bottom;
    this.beishu_label.string = "倍数:" + rate;
    this.roomstate = RoomState.ROOM_INVALID;
    this._isWaitingForPlayers = false;

    // 监听，给其他玩家发牌(内部事件)
    // 【核心】player_node 直接显示 17 张牌背，不再逐张动画
    this.node.on("pushcard_other_event", function () {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("push_card_event");
        }
      }
    }.bind(this));

    // 监听房间状态改变事件
    myglobal.socket.onRoomChangeState(function (data) {
      this.roomstate = data;
      if (data !== RoomState.ROOM_INVALID && this._isWaitingForPlayers) {
        this._hideWaitingUI();
      }
    }.bind(this));
    this.node.on("canrob_event", function (event) {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("playernode_canrob_event", event);
        }
      }
    }.bind(this));
    this.node.on("choose_card_event", function (event) {
      var gameui_node = this.node.getChildByName("gameingUI");
      if (gameui_node == null) {
        return;
      }
      gameui_node.emit("choose_card_event", event);
    }.bind(this));
    this.node.on("unchoose_card_event", function (event) {
      var gameui_node = this.node.getChildByName("gameingUI");
      if (gameui_node == null) {
        return;
      }
      gameui_node.emit("unchoose_card_event", event);
    }.bind(this));
    var currentRoomCode = myglobal.socket.getCurrentRoomCode();
    var isInRoom = myglobal.socket.isInRoom();
    var roomData = myglobal.roomData;
    if (isInRoom && currentRoomCode && !roomData) {
      roomData = {
        roomid: currentRoomCode,
        room_code: currentRoomCode,
        seatindex: 1,
        playerdata: [{
          accountid: myglobal.playerData.accountid || myglobal.playerData.playerId,
          nick_name: myglobal.playerData.nickName,
          avatarUrl: "avatar_1",
          gold_count: myglobal.playerData.gobal_count || 1000,
          // 🔧【修复】使用 gold_count 字段
          goldcount: myglobal.playerData.gobal_count || 1000,
          // 兼容旧客户端
          seatindex: 1,
          isready: true
        }]
      };
    }
    if (roomData) {
      this._processRoomData(roomData, myglobal, isopen_sound);
    } else {
      myglobal.socket.request_enter_room({}, function (err, result) {
        if (err != 0) {} else {
          this._processRoomData(result, myglobal, isopen_sound);
        }
      }.bind(this));
    }
    myglobal.socket.onPlayerJoinRoom(function (join_playerdata) {
      this.addPlayerNode(join_playerdata);
      if (!this._playerdataList) {
        this._playerdataList = [];
      }
      this._playerdataList.push(join_playerdata);
      if (this._isWaitingForPlayers) {
        this._showWaitingUI(3 - this._playerdataList.length, this._currentRoomCode);
      }

      // 🔧【修复】添加空值检查
      if (this.playerNodeList && this.playerNodeList.length >= 3) {
        this._hideWaitingUI();
      }
    }.bind(this));
    myglobal.socket.onPlayerReady(function (data) {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("player_ready_notify", data);
        }
      }
    }.bind(this));
    myglobal.socket.onGameStart(function () {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("gamestart_event");
        }
      }
      var gamebeforeUI = this.node.getChildByName("gamebeforeUI");
      if (gamebeforeUI) {
        gamebeforeUI.active = false;
      }
    }.bind(this));
    myglobal.socket.onRobState(function (event) {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      // 🔧【修复】添加 round 字段，区分叫地主和抢地主
      var eventWithRound = Object.assign({}, event, {
        round: 2
      });
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("playernode_rob_state_event", eventWithRound);
        }
      }
    }.bind(this));

    // 🔧【新增】监听叫地主结果（第一轮）
    myglobal.socket.onBidResult(function (event) {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      // 🔧【修复】添加 round 字段，区分叫地主和抢地主
      var eventWithRound = Object.assign({}, event, {
        round: 1
      });
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("playernode_rob_state_event", eventWithRound);
        }
      }
    }.bind(this));
    myglobal.socket.onChangeMaster(function (event) {
      myglobal.playerData.master_accountid = event;
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("playernode_changemaster_event", event);
        }
      }
    }.bind(this));

    // 🔧【新增】监听出牌阶段开始
    myglobal.socket.onPlayStart(function (data) {
      // 设置房间状态为出牌阶段
      this.roomstate = RoomState.ROOM_PLAYING;
    }.bind(this));
    this.node.on("update_card_count_event", function (data) {
      // 🔧【修复】添加空值检查
      if (!this.playerNodeList) return;
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("update_card_count_event", data);
        }
      }
    }.bind(this));
    myglobal.socket.onShowBottomCard(function (event) {
      var gameui_node = this.node.getChildByName("gameingUI");
      if (gameui_node == null) {
        return;
      }
      gameui_node.emit("show_bottom_card_event", event);
    }.bind(this));
    myglobal.socket.onRoomRestored(function (data) {
      if (data.room_code) {
        var restoredRoomData = {
          roomid: data.room_code,
          room_code: data.room_code,
          seatindex: 1,
          playerdata: [{
            accountid: data.player_id,
            nick_name: data.player_name,
            avatarUrl: "avatar_1",
            gold_count: data.gold_count || 1000,
            // 🔧【修复】使用 gold_count 字段
            goldcount: data.gold_count || 1000,
            // 兼容旧客户端
            seatindex: 1
          }]
        };
        this._processRoomData(restoredRoomData, myglobal, isopen_sound);
      }
    }.bind(this));

    // 【新增】监听游戏状态恢复事件
    this.node.on("game_state_restored", function (data) {
      this._onGameStateRestored(data);
    }.bind(this));

    // 【新增】监听玩家掉线通知
    myglobal.socket.onPlayerOffline(function (data) {
      this._onPlayerOffline(data);
    }.bind(this));

    // 【新增】监听玩家上线通知
    myglobal.socket.onPlayerOnline(function (data) {
      this._onPlayerOnline(data);
    }.bind(this));

    // 🔧【修复】监听 room_joined 事件更新房间号和玩家数据
    // 竞技场模式下，先进入游戏场景，后收到真正的房间号
    myglobal.socket.onRoomJoined(function (data) {
      console.log("🎮 [gameScene] 收到 room_joined 消息:", JSON.stringify(data));

      // 更新房间号
      if (data && data.room_code) {
        if (this.roomid_label) {
          var currentText = this.roomid_label.string || "";
          var currentRoomCode = currentText.replace("房间号:", "");
          // 🔧【修复】如果当前房间号为空或看起来是期号（长度>10），更新为正确的房间号
          if (currentRoomCode === "" || currentRoomCode.length > 10) {
            this.roomid_label.string = "房间号:" + data.room_code;
            console.log("🎮 [gameScene] 更新房间号: " + data.room_code);
          }
        } else {
          console.warn("🎮 [gameScene] roomid_label 未绑定");
        }
        // 🔧【新增】隐藏加载界面（房间号已更新）
        this._hideArenaLoadingUI();
      }

      // 🔧【关键修复】用 ROOM_JOINED 数据更新玩家信息（头像、金币等）
      // 简化匹配逻辑：机器人通过 ID 匹配，当前玩家通过位置索引 0 匹配
      if (data && data.players && this.playerNodeList) {
        console.log("🎮 [gameScene] 更新玩家数据，玩家数量:", data.players.length);

        // 获取当前玩家的 serverPlayerId（UUID 格式）
        var currentServerPlayerId = myglobal.playerData && myglobal.playerData.serverPlayerId;
        console.log("🎮 [gameScene] 当前玩家 serverPlayerId:", currentServerPlayerId);

        // 🔧【关键修复】遍历服务端玩家列表，更新所有玩家数据
        for (var i = 0; i < data.players.length; i++) {
          var serverPlayer = data.players[i];

          // 🔧【修复】判断是否是当前玩家：
          // 1. ID 匹配 serverPlayerId
          // 2. 或者 ID 是 UUID 格式（包含 '-'）且不匹配已知的机器人 ID
          var isCurrentPlayer = serverPlayer.id === currentServerPlayerId || serverPlayer.id && serverPlayer.id.indexOf('-') > 0 && !this._isKnownRobotId(serverPlayer.id);
          console.log("🎮 [gameScene] 处理玩家: " + serverPlayer.name + ", id=" + serverPlayer.id + ", isCurrentPlayer=" + isCurrentPlayer);

          // 查找对应的玩家节点
          for (var j = 0; j < this.playerNodeList.length; j++) {
            var playerNode = this.playerNodeList[j];
            if (!playerNode) continue;
            var playerScript = playerNode.getComponent("player_node");
            if (!playerScript) continue;

            // 🔧【简化匹配逻辑】
            // 1. 机器人玩家：通过 accountid 匹配
            // 2. 当前玩家：通过位置索引 0 匹配（当前玩家始终在位置 0）
            var isMatch = false;
            if (isCurrentPlayer) {
              // 当前玩家：匹配位置索引 0 的节点
              if (playerScript.seat_index === 0) {
                isMatch = true;
                console.log("🎮 [gameScene] 当前玩家匹配成功（位置索引 0）");
              }
            } else {
              // 其他玩家（机器人）：通过 accountid 匹配
              if (playerScript.accountid === serverPlayer.id) {
                isMatch = true;
                console.log("🎮 [gameScene] 机器人玩家匹配成功: " + serverPlayer.name);
              }
            }
            if (isMatch) {
              // 更新玩家数据
              var updateData = {
                gold_count: serverPlayer.gold_count || 0,
                arena_gold: serverPlayer.arena_gold || 0,
                match_coin: serverPlayer.match_coin || 0,
                avatar: serverPlayer.avatar || "",
                avatarUrl: serverPlayer.avatar || ""
              };
              playerScript.updateArenaData && playerScript.updateArenaData(updateData);
              console.log("🎮 [gameScene] 更新玩家 " + serverPlayer.name + " 数据:", JSON.stringify(updateData));
              break;
            }
          }
        }
      }
    }.bind(this));
  },
  setPlayerSeatPos: function setPlayerSeatPos(seat_index) {
    if (seat_index < 1 || seat_index > 3) {
      return;
    }

    // 🔧【修复】调整为逆时针方向：
    // - 位置 0：下方（当前玩家）
    // - 位置 1：左侧（上家）
    // - 位置 2：右侧（下家）
    // 斗地主出牌顺序：当前玩家 → 下家（右侧）→ 上家（左侧）→ 当前玩家
    switch (seat_index) {
      case 1:
        this.playerdata_list_pos[1] = 0; // 座位1：当前玩家 → 位置0（下方）
        this.playerdata_list_pos[2] = 2; // 座位2：下家 → 位置2（右侧）
        this.playerdata_list_pos[3] = 1; // 座位3：上家 → 位置1（左侧）
        break;
      case 2:
        this.playerdata_list_pos[2] = 0; // 座位2：当前玩家 → 位置0（下方）
        this.playerdata_list_pos[3] = 2; // 座位3：下家 → 位置2（右侧）
        this.playerdata_list_pos[1] = 1; // 座位1：上家 → 位置1（左侧）
        break;
      case 3:
        this.playerdata_list_pos[3] = 0; // 座位3：当前玩家 → 位置0（下方）
        this.playerdata_list_pos[1] = 2; // 座位1：下家 → 位置2（右侧）
        this.playerdata_list_pos[2] = 1; // 座位2：上家 → 位置1（左侧）
        break;
      default:
        break;
    }
  },
  /**
   * 检查是否是已知的机器人 ID
   * 机器人 ID 通常是纯数字字符串
   */
  _isKnownRobotId: function _isKnownRobotId(playerId) {
    if (!playerId) return false;
    // 机器人 ID 是纯数字
    return /^\d+$/.test(playerId);
  },
  addPlayerNode: function addPlayerNode(player_data) {
    if (!this.player_node_prefabs) {
      console.error("player_node_prefabs 未绑定！");
      return;
    }
    if (!this.players_seat_pos) {
      console.error("players_seat_pos 未绑定！");
      return;
    }

    // 🔧【调试】输出玩家数据
    console.log("🎮 [addPlayerNode] player_data:", JSON.stringify({
      accountid: player_data.accountid || player_data.accountId,
      nick_name: player_data.nick_name,
      seatindex: player_data.seatindex,
      is_robot: player_data.is_robot
    }));

    // 🔧【关键修复】检查玩家是否已存在，如果存在则更新而非创建新节点
    var existingPlayerNode = this._findPlayerNodeByAccountId(player_data.accountid || player_data.accountId);
    if (existingPlayerNode) {
      console.log("🎮 [addPlayerNode] 玩家节点已存在，更新数据而非创建新节点, accountid:", player_data.accountid || player_data.accountId);
      var existingScript = existingPlayerNode.getComponent("player_node");
      if (existingScript) {
        // 更新现有节点的数据
        if (player_data.gold_count !== undefined || player_data.arena_gold !== undefined || player_data.match_coin !== undefined) {
          existingScript.updateArenaData && existingScript.updateArenaData({
            gold_count: player_data.gold_count,
            arena_gold: player_data.arena_gold,
            match_coin: player_data.match_coin,
            avatar: player_data.avatar || player_data.avatarUrl,
            avatarUrl: player_data.avatar || player_data.avatarUrl
          });
        }
        // 更新头像（如果有有效的头像URL）
        var avatarUrl = player_data.avatar || player_data.avatarUrl || player_data.avatarurl;
        if (avatarUrl && avatarUrl !== "" && avatarUrl !== "avatar_1") {
          existingScript._loadAvatar && existingScript._loadAvatar(avatarUrl);
        }
      }
      return; // 不创建新节点
    }

    var playernode_inst = cc.instantiate(this.player_node_prefabs);
    if (!playernode_inst) {
      console.error("无法实例化 player_node_prefabs");
      return;
    }
    playernode_inst.parent = this.node;
    this.playerNodeList.push(playernode_inst);

    // 🔧【修复】将房间类型传递给 player_node（用于区分普通场和竞技场）
    if (!player_data.room_category) {
      player_data.room_category = this._roomCategory || 1;
      console.log("🏟️ [addPlayerNode] 设置 player_data.room_category =", player_data.room_category);
    }

    // 🔧【新增】将期号传递给 player_node
    if (!player_data.period_no && this._periodNo) {
      player_data.period_no = this._periodNo;
    }
    var index = this.playerdata_list_pos[player_data.seatindex];
    if (index === undefined || index === null) {
      console.error("无效的座位索引:", player_data.seatindex);
      return;
    }
    if (!this.players_seat_pos.children || !this.players_seat_pos.children[index]) {
      console.error("座位节点不存在，index:", index);
      return;
    }
    playernode_inst.position = this.players_seat_pos.children[index].position;
    var playerNodeScript = playernode_inst.getComponent("player_node");
    if (!playerNodeScript) {
      console.error("无法获取 player_node 组件");
      return;
    }
    playerNodeScript.init_data(player_data, index);
  },
  /**
   * 🔧【新增】根据 accountid 查找玩家节点
   * @param {string} accountId - 玩家账号ID
   * @returns {cc.Node|null} 玩家节点或 null
   */
  _findPlayerNodeByAccountId: function _findPlayerNodeByAccountId(accountId) {
    if (!this.playerNodeList || !accountId) return null;
    var accountIdStr = String(accountId);
    for (var i = 0; i < this.playerNodeList.length; i++) {
      var node = this.playerNodeList[i];
      if (node) {
        var script = node.getComponent("player_node");
        if (script && String(script.accountid) === accountIdStr) {
          return node;
        }
      }
    }
    return null;
  },
  start: function start() {},
  onDestroy: function onDestroy() {
    this._stopOnlineMonitoring();
  },
  getUserOutCardPosByAccount: function getUserOutCardPosByAccount(accountid) {
    if (!this.playerNodeList || !this.players_seat_pos) {
      console.error("playerNodeList 或 players_seat_pos 未初始化");
      return null;
    }

    // 🔧【修复】使用字符串比较，避免类型不匹配问题
    var targetAccountId = String(accountid || "");
    for (var i = 0; i < this.playerNodeList.length; i++) {
      var node = this.playerNodeList[i];
      if (node) {
        var node_script = node.getComponent("player_node");
        // 🔧【修复】使用字符串比较，确保类型一致
        if (node_script && String(node_script.accountid || "") === targetAccountId) {
          if (node_script.seat_index === undefined || node_script.seat_index === null) {
            console.error("无效的 seat_index");
            return null;
          }
          if (!this.players_seat_pos.children || !this.players_seat_pos.children[node_script.seat_index]) {
            console.error("座位节点不存在，seat_index:", node_script.seat_index);
            return null;
          }
          var seat_node = this.players_seat_pos.children[node_script.seat_index];
          // 🔧【修复】检查 seat_node 是否存在
          if (!seat_node) {
            console.error("seat_node 为空，seat_index:", node_script.seat_index);
            return null;
          }
          var index_name = "cardsoutzone" + node_script.seat_index;
          var out_card_node = seat_node.getChildByName(index_name);

          // 🔧【调试】输出找到的出牌区域
          console.log("🃏 [getUserOutCardPosByAccount] accountid:", accountid, "seat_index:", node_script.seat_index, "out_card_node:", out_card_node ? out_card_node.name : "null");
          return out_card_node;
        }
      }
    }

    // 🔧【调试】未找到玩家节点
    console.warn("🃏 [getUserOutCardPosByAccount] 未找到玩家节点, accountid:", accountid, "playerNodeList.length:", this.playerNodeList.length);
    return null;
  },
  _processRoomData: function _processRoomData(result, myglobal, isopen_sound) {
    console.log("🎮 [_processRoomData] 接收到的数据:", JSON.stringify(result));
    var playerdata_list = result.playerdata || [];
    var roomid = result.roomid || result.room_code || result.roomCode || "WAITING";

    // 🔧【新增】检查是否是竞技场模式
    var isArenaMode = result.room_category === 2;
    if (isArenaMode) {
      console.log("🏟️ [_processRoomData] 竞技场模式: room_category=2, playerdata数量=" + playerdata_list.length + ", 期号=" + result.period_no);
    }

    // 🔧【关键修复】竞技场模式下，确保当前玩家始终在位置 0（下方）
    // 找出当前玩家（非机器人）并计算其正确位置
    var seatid = result.seatindex || 1;
    if (isArenaMode && playerdata_list.length > 0) {
      // 在竞技场模式下，找到当前玩家（非机器人）
      for (var i = 0; i < playerdata_list.length; i++) {
        var p = playerdata_list[i];
        if (p && !p.is_robot) {
          // 当前玩家的 seatindex 就是他在数组中的正确座位
          seatid = p.seatindex || 1;
          console.log("🏟️ [_processRoomData] 竞技场模式：当前玩家=" + p.nick_name + ", seatid=" + seatid);
          break;
        }
      }
    }
    this.playerdata_list_pos = [];
    this.setPlayerSeatPos(seatid);

    // 🔧【修复】保存房间类型到实例变量，供 player_node 使用
    this._roomCategory = result.room_category || 1;
    this._isArenaMode = isArenaMode;
    this._periodNo = result.period_no || ""; // 🔧【新增】保存期号

    this._playerdataList = playerdata_list;
    if (this.roomid_label) {
      // 🔧【关键修复】竞技场模式下，如果房间号为空或看起来像期号（超过10位），显示加载界面
      // 等待 ROOM_JOINED 消息更新正确的房间号
      if (isArenaMode && (roomid === "" || roomid === "WAITING" || roomid.length > 10)) {
        // 房间号为空或看起来是期号，显示加载界面，等待服务端返回正确的房间号
        this.roomid_label.string = "";
        console.log("🏟️ [_processRoomData] 竞技场模式：房间号为空或为期号，显示加载界面... roomid=" + roomid);
        // 🔧【新增】显示加载界面
        this._showArenaLoadingUI(myglobal);
      } else {
        this.roomid_label.string = "房间号:" + roomid;
      }
    } else {
      console.error("🎮 [游戏场景] roomid_label 未绑定！");
    }
    myglobal.playerData.housemanageid = result.housemanageid || result.creator_id || result.creatorId || "";
    if (myglobal.socket && myglobal.socket.getPlayerInfo) {
      var playerInfo = myglobal.socket.getPlayerInfo();
    }
    for (var i = 0; i < playerdata_list.length; i++) {
      console.log("🎮 [_processRoomData] 添加玩家节点: " + JSON.stringify(playerdata_list[i]));
      this.addPlayerNode(playerdata_list[i]);
    }
    if (isopen_sound) {
      cc.audioEngine.stopAll();
      cc.resources.load("sound/bg", cc.AudioClip, function (err, clip) {
        if (err) {
          return;
        }
        cc.audioEngine.play(clip, true, 1);
      });
    }

    // 🔧【关键修复】竞技场模式下直接隐藏 gamebeforeUI
    // 竞技场模式下所有玩家已经准备好，游戏会自动开始，不需要显示等待界面
    var gamebefore_node = this.node.getChildByName("gamebeforeUI");
    if (gamebefore_node) {
      if (isArenaMode) {
        // 竞技场模式：直接隐藏等待界面
        gamebefore_node.active = false;
        console.log("🏟️ [_processRoomData] 竞技场模式：隐藏 gamebeforeUI");
      } else {
        // 普通模式：显示等待界面
        gamebefore_node.active = true;
        gamebefore_node.zIndex = 1000;
        gamebefore_node.emit("init");
      }
    }

    // 🔧【修复】竞技场模式下不显示等待玩家UI（所有玩家已分配好）
    if (isArenaMode) {
      console.log("🏟️ [_processRoomData] 竞技场模式：不显示等待玩家UI");
      // 竞技场模式下所有玩家应该已经准备好，直接等待游戏开始
    } else if (playerdata_list.length < 3) {
      this._showWaitingUI(3 - playerdata_list.length, roomid);
    }
  },
  _showWaitingUI: function _showWaitingUI(needPlayers, roomCode) {
    var self = this;
    this._isWaitingForPlayers = true;
    this._needPlayers = needPlayers;
    this._currentRoomCode = roomCode || "";
    this._hideWaitingUI();
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;
    var waitingNode = new cc.Node("WaitingForPlayersUI");
    waitingNode.setContentSize(cc.size(screenWidth, screenHeight));
    waitingNode.anchorX = 0.5;
    waitingNode.anchorY = 0.5;
    waitingNode.x = 0;
    waitingNode.y = 0;
    waitingNode.parent = this.node;
    this._waitingUINode = waitingNode;
    if (roomCode) {
      var roomInfoNode = new cc.Node("RoomInfo");
      roomInfoNode.x = -screenWidth / 2 + 20;
      roomInfoNode.y = screenHeight / 2 - 30;
      roomInfoNode.anchorX = 0;
      roomInfoNode.anchorY = 0.5;
      var roomLabel = roomInfoNode.addComponent(cc.Label);
      roomLabel.string = "房间号: " + roomCode;
      roomLabel.fontSize = 24;
      roomLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
      roomInfoNode.color = cc.color(255, 215, 0);
      var roomOutline = roomInfoNode.addComponent(cc.LabelOutline);
      roomOutline.color = cc.color(0, 0, 0);
      roomOutline.width = 2;
      roomInfoNode.parent = waitingNode;
    }
    var leaveBtnNode = new cc.Node("LeaveBtn");
    leaveBtnNode.x = screenWidth / 2 - 100;
    leaveBtnNode.y = -screenHeight / 2 + 50;
    leaveBtnNode.anchorX = 0.5;
    leaveBtnNode.anchorY = 0.5;
    leaveBtnNode.setContentSize(cc.size(140, 40));
    var leaveBtnBg = leaveBtnNode.addComponent(cc.Graphics);
    leaveBtnBg.fillColor = cc.color(180, 60, 60, 230);
    leaveBtnBg.roundRect(-70, -20, 140, 40, 8);
    leaveBtnBg.fill();
    leaveBtnBg.strokeColor = cc.color(220, 100, 100);
    leaveBtnBg.lineWidth = 2;
    leaveBtnBg.roundRect(-70, -20, 140, 40, 8);
    leaveBtnBg.stroke();
    leaveBtnNode.parent = waitingNode;
    var leaveBtnLabel = new cc.Node("Label");
    leaveBtnLabel.anchorX = 0.5;
    leaveBtnLabel.anchorY = 0.5;
    var leaveLabel = leaveBtnLabel.addComponent(cc.Label);
    leaveLabel.string = "离开房间";
    leaveLabel.fontSize = 20;
    leaveLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    leaveBtnLabel.color = cc.color(255, 255, 255);
    var leaveOutline = leaveBtnLabel.addComponent(cc.LabelOutline);
    leaveOutline.color = cc.color(100, 30, 30);
    leaveOutline.width = 2;
    leaveBtnLabel.parent = leaveBtnNode;
    leaveBtnNode.on(cc.Node.EventType.TOUCH_START, function () {
      leaveBtnNode.scale = 0.95;
    });
    leaveBtnNode.on(cc.Node.EventType.TOUCH_END, function () {
      leaveBtnNode.scale = 1;
      self._leaveRoom();
    });
    leaveBtnNode.on(cc.Node.EventType.TOUCH_CANCEL, function () {
      leaveBtnNode.scale = 1;
    });
    this._updateWaitingAnimation();
  },
  _updateWaitingUI: function _updateWaitingUI() {
    if (!this._isWaitingForPlayers) return;
    var currentPlayers = this.playerNodeList.length;
    if (currentPlayers >= 3) {
      this._hideWaitingUI();
    }
  },
  _updateWaitingAnimation: function _updateWaitingAnimation() {
    var self = this;
    if (!this._isWaitingForPlayers || !this._waitingUINode) return;
    this.scheduleOnce(function () {
      self._updateWaitingAnimation();
    }, 1 / 60);
  },
  _hideWaitingUI: function _hideWaitingUI() {
    this._isWaitingForPlayers = false;
    if (this._waitingUINode) {
      this._waitingUINode.destroy();
      this._waitingUINode = null;
    }
  },
  _leaveRoom: function _leaveRoom() {
    var myglobal = window.myglobal;
    if (myglobal && myglobal.socket) {
      if (myglobal.socket.leaveRoom) {
        myglobal.socket.leaveRoom();
      }
    }
    this._hideWaitingUI();
    this._hideArenaLoadingUI();
    cc.director.loadScene("hallScene");
  },
  // ============================================================
  // 【新增】竞技场加载界面
  // ============================================================

  /**
   * 显示竞技场加载界面
   * 在等待 ROOM_JOINED 消息时显示
   */
  _showArenaLoadingUI: function _showArenaLoadingUI(myglobal) {
    // 如果已存在，不重复创建
    if (this._arenaLoadingUINode) {
      return;
    }
    var self = this;

    // 获取屏幕尺寸
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;

    // 创建加载界面容器
    var loadingNode = new cc.Node("ArenaLoadingUI");
    loadingNode.setContentSize(cc.size(screenWidth, screenHeight));
    loadingNode.anchorX = 0.5;
    loadingNode.anchorY = 0.5;
    loadingNode.x = 0;
    loadingNode.y = 0;
    loadingNode.zIndex = 2000; // 确保在顶层
    loadingNode.parent = this.node;
    this._arenaLoadingUINode = loadingNode;

    // 创建半透明背景
    var bgNode = new cc.Node("Background");
    bgNode.setContentSize(cc.size(screenWidth, screenHeight));
    bgNode.anchorX = 0.5;
    bgNode.anchorY = 0.5;
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = cc.color(0, 0, 0, 200); // 黑色半透明
    bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
    bgGraphics.fill();
    bgNode.parent = loadingNode;

    // 创建加载提示文字
    var labelNode = new cc.Node("LoadingLabel");
    labelNode.anchorX = 0.5;
    labelNode.anchorY = 0.5;
    var label = labelNode.addComponent(cc.Label);
    label.string = "正在加载比赛数据...";
    label.fontSize = 28;
    label.lineHeight = 36;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    labelNode.color = cc.color(255, 255, 255);
    var outline = labelNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;
    labelNode.parent = loadingNode;

    // 创建加载动画（旋转的点）
    this._loadingDots = [];
    for (var i = 0; i < 3; i++) {
      var dotNode = new cc.Node("Dot" + i);
      dotNode.anchorX = 0.5;
      dotNode.anchorY = 0.5;
      dotNode.y = -60;
      dotNode.x = (i - 1) * 30; // 三个点水平排列
      var dotGraphics = dotNode.addComponent(cc.Graphics);
      dotGraphics.fillColor = cc.color(255, 255, 255);
      dotGraphics.circle(0, 0, 8);
      dotGraphics.fill();
      dotNode.parent = loadingNode;
      this._loadingDots.push(dotNode);
    }

    // 启动加载动画
    this._startLoadingAnimation();
    console.log("🏟️ [_showArenaLoadingUI] 加载界面已显示");
  },
  /**
   * 隐藏竞技场加载界面
   */
  _hideArenaLoadingUI: function _hideArenaLoadingUI() {
    // 停止加载动画
    this._stopLoadingAnimation();

    // 销毁加载界面
    if (this._arenaLoadingUINode) {
      this._arenaLoadingUINode.destroy();
      this._arenaLoadingUINode = null;
      console.log("🏟️ [_hideArenaLoadingUI] 加载界面已隐藏");
    }
  },
  /**
   * 启动加载动画
   */
  _startLoadingAnimation: function _startLoadingAnimation() {
    var self = this;
    this._loadingAnimIndex = 0;
    this._loadingAnimSchedule = function () {
      if (!self._loadingDots || self._loadingDots.length === 0) return;

      // 更新点的透明度，形成波浪效果
      for (var i = 0; i < self._loadingDots.length; i++) {
        var dot = self._loadingDots[i];
        if (dot) {
          var phase = (self._loadingAnimIndex + i) % 3;
          var opacity = phase === 0 ? 255 : phase === 1 ? 150 : 80;
          dot.opacity = opacity;
          // 添加缩放效果
          dot.scale = phase === 0 ? 1.2 : 1.0;
        }
      }
      self._loadingAnimIndex = (self._loadingAnimIndex + 1) % 3;
    };

    // 每 0.3 秒更新一次动画
    this.schedule(this._loadingAnimSchedule, 0.3);
  },
  /**
   * 停止加载动画
   */
  _stopLoadingAnimation: function _stopLoadingAnimation() {
    if (this._loadingAnimSchedule) {
      this.unschedule(this._loadingAnimSchedule);
      this._loadingAnimSchedule = null;
    }
    this._loadingDots = [];
    this._loadingAnimIndex = 0;
  },
  // ============================================================
  // 【新增】游戏状态恢复处理
  // ============================================================

  /**
   * 处理游戏状态恢复事件
   */
  _onGameStateRestored: function _onGameStateRestored(data) {
    // 🔧【修复】添加空值检查
    if (!this.playerNodeList) return;

    // 更新玩家节点的状态
    if (data.players) {
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          var nodeScript = node.getComponent("player_node");
          if (nodeScript) {
            // 查找对应的玩家数据
            for (var j = 0; j < data.players.length; j++) {
              var p = data.players[j];
              if (p.id === nodeScript.accountid) {
                // 更新玩家状态
                node.emit("player_state_update", {
                  state: p.state,
                  cards_count: p.cards_count,
                  is_landlord: p.is_landlord
                });
                break;
              }
            }
          }
        }
      }
    }

    // 隐藏 gamebeforeUI
    var gamebefore_node = this.node.getChildByName("gamebeforeUI");
    if (gamebefore_node) {
      gamebefore_node.active = false;
    }

    // 显示 gameingUI
    var gameing_node = this.node.getChildByName("gameingUI");
    if (gameing_node) {
      gameing_node.active = true;
    }
  },
  /**
   * 处理玩家掉线通知
   */
  _onPlayerOffline: function _onPlayerOffline(data) {
    // 🔧【修复】添加空值检查
    if (!this.playerNodeList) return;

    // 通知所有玩家节点更新状态
    for (var i = 0; i < this.playerNodeList.length; i++) {
      var node = this.playerNodeList[i];
      if (node) {
        var nodeScript = node.getComponent("player_node");
        if (nodeScript && nodeScript.accountid === data.player_id) {
          node.emit("player_state_update", {
            state: "offline",
            timeout: data.timeout
          });
          break;
        }
      }
    }
  },
  /**
   * 处理玩家上线通知
   */
  _onPlayerOnline: function _onPlayerOnline(data) {
    // 🔧【修复】添加空值检查
    if (!this.playerNodeList) return;

    // 通知所有玩家节点更新状态
    for (var i = 0; i < this.playerNodeList.length; i++) {
      var node = this.playerNodeList[i];
      if (node) {
        var nodeScript = node.getComponent("player_node");
        if (nodeScript && nodeScript.accountid === data.player_id) {
          node.emit("player_state_update", {
            state: "online"
          });
          break;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxnYW1lU2NlbmUuanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIkNvbXBvbmVudCIsInByb3BlcnRpZXMiLCJkaV9sYWJlbCIsIkxhYmVsIiwiYmVpc2h1X2xhYmVsIiwicm9vbWlkX2xhYmVsIiwicGxheWVyX25vZGVfcHJlZmFicyIsIlByZWZhYiIsInBsYXllcnNfc2VhdF9wb3MiLCJOb2RlIiwib25Mb2FkIiwibXlnbG9iYWwiLCJ3aW5kb3ciLCJSb29tU3RhdGUiLCJST09NX0lOVkFMSUQiLCJpc29wZW5fc291bmQiLCJwbGF5ZXJEYXRhIiwic29ja2V0IiwiY29uc29sZSIsImVycm9yIiwiX3dhaXRGb3JJbml0IiwiX2luaXRTY2VuZSIsIl9zdGFydE9ubGluZU1vbml0b3JpbmciLCJ3YXJuIiwic2VsZiIsIl9vbmxpbmVTdGF0dXNIYW5kbGVyIiwiaXNPbmxpbmUiLCJfc2hvd09mZmxpbmVNZXNzYWdlIiwiYWRkT25saW5lU3RhdHVzTGlzdGVuZXIiLCJldmVudGxpc3RlciIsIm9uIiwiZGF0YSIsIl9oYW5kbGVGb3JjZUxvZ291dCIsInJlYXNvbiIsInN0b3BPbmxpbmVNb25pdG9yaW5nIiwic2NoZWR1bGVPbmNlIiwiYWxlcnQiLCJkaXJlY3RvciIsImxvYWRTY2VuZSIsIl9zdG9wT25saW5lTW9uaXRvcmluZyIsInJlbW92ZU9ubGluZVN0YXR1c0xpc3RlbmVyIiwiYXR0ZW1wdHMiLCJtYXhBdHRlbXB0cyIsImNoZWNrSW5pdCIsInNldFRpbWVvdXQiLCJwbGF5ZXJOb2RlTGlzdCIsImJvdHRvbSIsInJhdGUiLCJzdHJpbmciLCJyb29tc3RhdGUiLCJfaXNXYWl0aW5nRm9yUGxheWVycyIsIm5vZGUiLCJpIiwibGVuZ3RoIiwiZW1pdCIsImJpbmQiLCJvblJvb21DaGFuZ2VTdGF0ZSIsIl9oaWRlV2FpdGluZ1VJIiwiZXZlbnQiLCJnYW1ldWlfbm9kZSIsImdldENoaWxkQnlOYW1lIiwiY3VycmVudFJvb21Db2RlIiwiZ2V0Q3VycmVudFJvb21Db2RlIiwiaXNJblJvb20iLCJyb29tRGF0YSIsInJvb21pZCIsInJvb21fY29kZSIsInNlYXRpbmRleCIsInBsYXllcmRhdGEiLCJhY2NvdW50aWQiLCJwbGF5ZXJJZCIsIm5pY2tfbmFtZSIsIm5pY2tOYW1lIiwiYXZhdGFyVXJsIiwiZ29sZF9jb3VudCIsImdvYmFsX2NvdW50IiwiZ29sZGNvdW50IiwiaXNyZWFkeSIsIl9wcm9jZXNzUm9vbURhdGEiLCJyZXF1ZXN0X2VudGVyX3Jvb20iLCJlcnIiLCJyZXN1bHQiLCJvblBsYXllckpvaW5Sb29tIiwiam9pbl9wbGF5ZXJkYXRhIiwiYWRkUGxheWVyTm9kZSIsIl9wbGF5ZXJkYXRhTGlzdCIsInB1c2giLCJfc2hvd1dhaXRpbmdVSSIsIl9jdXJyZW50Um9vbUNvZGUiLCJvblBsYXllclJlYWR5Iiwib25HYW1lU3RhcnQiLCJnYW1lYmVmb3JlVUkiLCJhY3RpdmUiLCJvblJvYlN0YXRlIiwiZXZlbnRXaXRoUm91bmQiLCJPYmplY3QiLCJhc3NpZ24iLCJyb3VuZCIsIm9uQmlkUmVzdWx0Iiwib25DaGFuZ2VNYXN0ZXIiLCJtYXN0ZXJfYWNjb3VudGlkIiwib25QbGF5U3RhcnQiLCJST09NX1BMQVlJTkciLCJvblNob3dCb3R0b21DYXJkIiwib25Sb29tUmVzdG9yZWQiLCJyZXN0b3JlZFJvb21EYXRhIiwicGxheWVyX2lkIiwicGxheWVyX25hbWUiLCJfb25HYW1lU3RhdGVSZXN0b3JlZCIsIm9uUGxheWVyT2ZmbGluZSIsIl9vblBsYXllck9mZmxpbmUiLCJvblBsYXllck9ubGluZSIsIl9vblBsYXllck9ubGluZSIsIm9uUm9vbUpvaW5lZCIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJjdXJyZW50VGV4dCIsInJlcGxhY2UiLCJfaGlkZUFyZW5hTG9hZGluZ1VJIiwicGxheWVycyIsImN1cnJlbnRTZXJ2ZXJQbGF5ZXJJZCIsInNlcnZlclBsYXllcklkIiwic2VydmVyUGxheWVyIiwiaXNDdXJyZW50UGxheWVyIiwiaWQiLCJpbmRleE9mIiwiX2lzS25vd25Sb2JvdElkIiwibmFtZSIsImoiLCJwbGF5ZXJOb2RlIiwicGxheWVyU2NyaXB0IiwiZ2V0Q29tcG9uZW50IiwiaXNNYXRjaCIsInNlYXRfaW5kZXgiLCJ1cGRhdGVEYXRhIiwiYXJlbmFfZ29sZCIsIm1hdGNoX2NvaW4iLCJhdmF0YXIiLCJ1cGRhdGVBcmVuYURhdGEiLCJzZXRQbGF5ZXJTZWF0UG9zIiwicGxheWVyZGF0YV9saXN0X3BvcyIsInRlc3QiLCJwbGF5ZXJfZGF0YSIsImFjY291bnRJZCIsImlzX3JvYm90IiwiZXhpc3RpbmdQbGF5ZXJOb2RlIiwiX2ZpbmRQbGF5ZXJOb2RlQnlBY2NvdW50SWQiLCJleGlzdGluZ1NjcmlwdCIsInVuZGVmaW5lZCIsImF2YXRhcnVybCIsIl9sb2FkQXZhdGFyIiwicGxheWVybm9kZV9pbnN0IiwiaW5zdGFudGlhdGUiLCJwYXJlbnQiLCJyb29tX2NhdGVnb3J5IiwiX3Jvb21DYXRlZ29yeSIsInBlcmlvZF9ubyIsIl9wZXJpb2RObyIsImluZGV4IiwiY2hpbGRyZW4iLCJwb3NpdGlvbiIsInBsYXllck5vZGVTY3JpcHQiLCJpbml0X2RhdGEiLCJhY2NvdW50SWRTdHIiLCJTdHJpbmciLCJzY3JpcHQiLCJzdGFydCIsIm9uRGVzdHJveSIsImdldFVzZXJPdXRDYXJkUG9zQnlBY2NvdW50IiwidGFyZ2V0QWNjb3VudElkIiwibm9kZV9zY3JpcHQiLCJzZWF0X25vZGUiLCJpbmRleF9uYW1lIiwib3V0X2NhcmRfbm9kZSIsInBsYXllcmRhdGFfbGlzdCIsInJvb21Db2RlIiwiaXNBcmVuYU1vZGUiLCJzZWF0aWQiLCJwIiwiX2lzQXJlbmFNb2RlIiwiX3Nob3dBcmVuYUxvYWRpbmdVSSIsImhvdXNlbWFuYWdlaWQiLCJjcmVhdG9yX2lkIiwiY3JlYXRvcklkIiwiZ2V0UGxheWVySW5mbyIsInBsYXllckluZm8iLCJhdWRpb0VuZ2luZSIsInN0b3BBbGwiLCJyZXNvdXJjZXMiLCJsb2FkIiwiQXVkaW9DbGlwIiwiY2xpcCIsInBsYXkiLCJnYW1lYmVmb3JlX25vZGUiLCJ6SW5kZXgiLCJuZWVkUGxheWVycyIsIl9uZWVkUGxheWVycyIsImNhbnZhcyIsIkNhbnZhcyIsImZpbmQiLCJzY3JlZW5IZWlnaHQiLCJkZXNpZ25SZXNvbHV0aW9uIiwiaGVpZ2h0Iiwic2NyZWVuV2lkdGgiLCJ3aWR0aCIsIndhaXRpbmdOb2RlIiwic2V0Q29udGVudFNpemUiLCJzaXplIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ4IiwieSIsIl93YWl0aW5nVUlOb2RlIiwicm9vbUluZm9Ob2RlIiwicm9vbUxhYmVsIiwiYWRkQ29tcG9uZW50IiwiZm9udFNpemUiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJMRUZUIiwiY29sb3IiLCJyb29tT3V0bGluZSIsIkxhYmVsT3V0bGluZSIsImxlYXZlQnRuTm9kZSIsImxlYXZlQnRuQmciLCJHcmFwaGljcyIsImZpbGxDb2xvciIsInJvdW5kUmVjdCIsImZpbGwiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsImxlYXZlQnRuTGFiZWwiLCJsZWF2ZUxhYmVsIiwiQ0VOVEVSIiwibGVhdmVPdXRsaW5lIiwiRXZlbnRUeXBlIiwiVE9VQ0hfU1RBUlQiLCJzY2FsZSIsIlRPVUNIX0VORCIsIl9sZWF2ZVJvb20iLCJUT1VDSF9DQU5DRUwiLCJfdXBkYXRlV2FpdGluZ0FuaW1hdGlvbiIsIl91cGRhdGVXYWl0aW5nVUkiLCJjdXJyZW50UGxheWVycyIsImRlc3Ryb3kiLCJsZWF2ZVJvb20iLCJfYXJlbmFMb2FkaW5nVUlOb2RlIiwibG9hZGluZ05vZGUiLCJiZ05vZGUiLCJiZ0dyYXBoaWNzIiwicmVjdCIsImxhYmVsTm9kZSIsImxhYmVsIiwibGluZUhlaWdodCIsIm91dGxpbmUiLCJfbG9hZGluZ0RvdHMiLCJkb3ROb2RlIiwiZG90R3JhcGhpY3MiLCJjaXJjbGUiLCJfc3RhcnRMb2FkaW5nQW5pbWF0aW9uIiwiX3N0b3BMb2FkaW5nQW5pbWF0aW9uIiwiX2xvYWRpbmdBbmltSW5kZXgiLCJfbG9hZGluZ0FuaW1TY2hlZHVsZSIsImRvdCIsInBoYXNlIiwib3BhY2l0eSIsInNjaGVkdWxlIiwidW5zY2hlZHVsZSIsIm5vZGVTY3JpcHQiLCJzdGF0ZSIsImNhcmRzX2NvdW50IiwiaXNfbGFuZGxvcmQiLCJnYW1laW5nX25vZGUiLCJ0aW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUEsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTCxXQUFTRCxFQUFFLENBQUNFLFNBQVM7RUFFckJDLFVBQVUsRUFBRTtJQUNSQyxRQUFRLEVBQUVKLEVBQUUsQ0FBQ0ssS0FBSztJQUNsQkMsWUFBWSxFQUFFTixFQUFFLENBQUNLLEtBQUs7SUFDdEJFLFlBQVksRUFBRVAsRUFBRSxDQUFDSyxLQUFLO0lBQ3RCRyxtQkFBbUIsRUFBRVIsRUFBRSxDQUFDUyxNQUFNO0lBQzlCQyxnQkFBZ0IsRUFBRVYsRUFBRSxDQUFDVztFQUN6QixDQUFDO0VBRURDLE1BQU0sV0FBQUEsT0FBQSxFQUFHO0lBRUwsSUFBSUMsUUFBUSxHQUFHQyxNQUFNLENBQUNELFFBQVE7SUFDOUIsSUFBSUUsU0FBUyxHQUFHRCxNQUFNLENBQUNDLFNBQVMsSUFBSTtNQUFFQyxZQUFZLEVBQUUsQ0FBQztJQUFFLENBQUM7SUFDeEQsSUFBSUMsWUFBWSxHQUFHSCxNQUFNLENBQUNHLFlBQVksSUFBSSxDQUFDO0lBRTNDLElBQUksQ0FBQ0osUUFBUSxJQUFJLENBQUNBLFFBQVEsQ0FBQ0ssVUFBVSxJQUFJLENBQUNMLFFBQVEsQ0FBQ00sTUFBTSxFQUFFO01BQ3ZEQyxPQUFPLENBQUNDLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQztNQUM1RCxJQUFJLENBQUNDLFlBQVksRUFBRTtNQUNuQjtJQUNKO0lBRUEsSUFBSSxDQUFDQyxVQUFVLENBQUNWLFFBQVEsRUFBRUUsU0FBUyxFQUFFRSxZQUFZLENBQUM7SUFDbEQsSUFB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RixJQUFJLEVBQUU7SUFFNUI7SUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDYyxjQUFjLEVBQUU7O0lBRTFCO0lBQ0EsS0FBSyxJQUFJTyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDUCxjQUFjLENBQUNRLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUU7TUFDakQsSUFBSUQsSUFBSSxHQUFHLElBQUksQ0FBQ04sY0FBYyxDQUFDTyxDQUFDLENBQUM7TUFDakMsSUFBSUQsSUFBSSxFQUFFO1FBQ04sSUFBSTJOLFVBQVUsR0FBRzNOLElBQUksQ0FBQ2lGLFlBQVksQ0FBQyxhQUFhLENBQUM7UUFDakQsSUFBSTBJLFVBQVUsSUFBSUEsVUFBVSxDQUFDek0sU0FBUyxLQUFLdEMsSUFBSSxDQUFDMkUsU0FBUyxFQUFFO1VBQ3ZEdkQsSUFBSSxDQUFDRyxJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDN0J5TixLQUFLLEVBQUU7VUFDWCxDQUFDLENBQUM7VUFDRjtRQUNKO01BQ0o7SUFDSjtFQUNKO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDkvb/nlKjlhajlsYDlj5jph4/vvIzkuI3kvb/nlKggcmVxdWlyZVxuLy8g44CQ5L+u5aSN54mI5pys44CR566A5YyW5Y+R54mM6YC76L6R77yM5LiN5YaN5L2/55So5a6a5pe25Zmo6LCD5bqmXG4vLyDmoLjlv4Pljp/liJnvvJpcbi8vIDEuIGdhbWVpbmdVSS5qcyDoh6rlt7HlpITnkIblj5HniYzliqjnlLtcbi8vIDIuIGdhbWVTY2VuZS5qcyDlj6rotJ/otKPovazlj5Hkuovku7bnu5kgcGxheWVyX25vZGVcbi8vIDMuIOS4jeS+nei1liBzY2hlZHVsZU9uY2Ug5o6n5Yi25Y+R54mM6IqC5aWPXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGRpX2xhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgYmVpc2h1X2xhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgcm9vbWlkX2xhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgcGxheWVyX25vZGVfcHJlZmFiczogY2MuUHJlZmFiLFxuICAgICAgICBwbGF5ZXJzX3NlYXRfcG9zOiBjYy5Ob2RlLFxuICAgIH0sXG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgdmFyIFJvb21TdGF0ZSA9IHdpbmRvdy5Sb29tU3RhdGUgfHwgeyBST09NX0lOVkFMSUQ6IC0xIH1cbiAgICAgICAgdmFyIGlzb3Blbl9zb3VuZCA9IHdpbmRvdy5pc29wZW5fc291bmQgfHwgMVxuXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnBsYXllckRhdGEgfHwgIW15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImdhbWVTY2VuZTogbXlnbG9iYWzjgIFwbGF5ZXJEYXRhIOaIliBzb2NrZXQg5pyq5a6a5LmJXCIpXG4gICAgICAgICAgICB0aGlzLl93YWl0Rm9ySW5pdCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5faW5pdFNjZW5lKG15Z2xvYmFsLCBSb29tU3RhdGUsIGlzb3Blbl9zb3VuZClcbiAgICAgICAgdGhpcy5fc3RhcnRPbmxpbmVNb25pdG9yaW5nKClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Zyo57q/55uR5rWL5ZKM5YW25LuW5Yqf6IO9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfc3RhcnRPbmxpbmVNb25pdG9yaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmICghbXlnbG9iYWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcImdhbWVTY2VuZTogbXlnbG9iYWwg5pyq5a6a5LmJ77yM5peg5rOV5ZCv5Yqo5Zyo57q/55uR5rWLXCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB0aGlzLl9vbmxpbmVTdGF0dXNIYW5kbGVyID0gZnVuY3Rpb24oaXNPbmxpbmUpIHtcbiAgICAgICAgICAgIGlmICghaXNPbmxpbmUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93T2ZmbGluZU1lc3NhZ2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwuYWRkT25saW5lU3RhdHVzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLmFkZE9ubGluZVN0YXR1c0xpc3RlbmVyKHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChteWdsb2JhbC5ldmVudGxpc3Rlcikge1xuICAgICAgICAgICAgbXlnbG9iYWwuZXZlbnRsaXN0ZXIub24oXCJmb3JjZV9sb2dvdXRcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfmqsg5ri45oiP5Zy65pmv5pS25Yiw5by65Yi25LiL57q/5LqL5Lu2OlwiLCBkYXRhKVxuICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUZvcmNlTG9nb3V0KGRhdGEpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfc2hvd09mZmxpbmVNZXNzYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwi8J+SlCDmuLjmiI/lnLrmma/vvJrnvZHnu5zov57mjqXlt7Lmlq3lvIBcIilcbiAgICB9LFxuICAgIFxuICAgIF9oYW5kbGVGb3JjZUxvZ291dDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVhc29uID0gZGF0YS5yZWFzb24gfHwgXCLmgqjlt7LooqvlvLrliLbkuIvnur9cIlxuICAgICAgICBjb25zb2xlLndhcm4oXCLwn5qrIOa4uOaIj+WcuuaZr+W8uuWItuS4i+e6vzpcIiwgcmVhc29uKVxuICAgICAgICBcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5zdG9wT25saW5lTW9uaXRvcmluZykge1xuICAgICAgICAgICAgbXlnbG9iYWwuc3RvcE9ubGluZU1vbml0b3JpbmcoKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFsZXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQocmVhc29uICsgXCJcXG5cXG7or7fph43mlrDnmbvlvZVcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImxvZ2luU2NlbmVcIilcbiAgICAgICAgfSwgMC41KVxuICAgIH0sXG4gICAgXG4gICAgX3N0b3BPbmxpbmVNb25pdG9yaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwucmVtb3ZlT25saW5lU3RhdHVzTGlzdGVuZXIgJiYgdGhpcy5fb25saW5lU3RhdHVzSGFuZGxlcikge1xuICAgICAgICAgICAgbXlnbG9iYWwucmVtb3ZlT25saW5lU3RhdHVzTGlzdGVuZXIodGhpcy5fb25saW5lU3RhdHVzSGFuZGxlcilcbiAgICAgICAgICAgIHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIgPSBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF93YWl0Rm9ySW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGF0dGVtcHRzID0gMDtcbiAgICAgICAgdmFyIG1heEF0dGVtcHRzID0gMjA7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2hlY2tJbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhdHRlbXB0cysrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwucGxheWVyRGF0YSAmJiBteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgUm9vbVN0YXRlID0gd2luZG93LlJvb21TdGF0ZSB8fCB7IFJPT01fSU5WQUxJRDogLTEgfTtcbiAgICAgICAgICAgICAgICB2YXIgaXNvcGVuX3NvdW5kID0gd2luZG93Lmlzb3Blbl9zb3VuZCB8fCAxO1xuICAgICAgICAgICAgICAgIHNlbGYuX2luaXRTY2VuZShteWdsb2JhbCwgUm9vbVN0YXRlLCBpc29wZW5fc291bmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRlbXB0cyA8IG1heEF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja0luaXQsIDEwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJnYW1lU2NlbmUg5Yid5aeL5YyW6LaF5pe2XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dChjaGVja0luaXQsIDEwMCk7XG4gICAgfSxcbiAgICBcbiAgICBfaW5pdFNjZW5lOiBmdW5jdGlvbihteWdsb2JhbCwgUm9vbVN0YXRlLCBpc29wZW5fc291bmQpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJOb2RlTGlzdCA9IFtdXG4gICAgICAgIFxuICAgICAgICB2YXIgYm90dG9tID0gbXlnbG9iYWwucGxheWVyRGF0YS5ib3R0b20gfHwgMVxuICAgICAgICB2YXIgcmF0ZSA9IG15Z2xvYmFsLnBsYXllckRhdGEucmF0ZSB8fCAxXG4gICAgICAgIFxuICAgICAgICB0aGlzLmRpX2xhYmVsLnN0cmluZyA9IFwi5bqVOlwiICsgYm90dG9tXG4gICAgICAgIHRoaXMuYmVpc2h1X2xhYmVsLnN0cmluZyA9IFwi5YCN5pWwOlwiICsgcmF0ZVxuICAgICAgICB0aGlzLnJvb21zdGF0ZSA9IFJvb21TdGF0ZS5ST09NX0lOVkFMSURcbiAgICAgICAgdGhpcy5faXNXYWl0aW5nRm9yUGxheWVycyA9IGZhbHNlXG5cblxuICAgICAgICAvLyDnm5HlkKzvvIznu5nlhbbku5bnjqnlrrblj5HniYwo5YaF6YOo5LqL5Lu2KVxuICAgICAgICAvLyDjgJDmoLjlv4PjgJFwbGF5ZXJfbm9kZSDnm7TmjqXmmL7npLogMTcg5byg54mM6IOM77yM5LiN5YaN6YCQ5byg5Yqo55S7XG4gICAgICAgIHRoaXMubm9kZS5vbihcInB1c2hjYXJkX290aGVyX2V2ZW50XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInB1c2hfY2FyZF9ldmVudFwiKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOaIv+mXtOeKtuaAgeaUueWPmOS6i+S7tlxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Sb29tQ2hhbmdlU3RhdGUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5yb29tc3RhdGUgPSBkYXRhXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkYXRhICE9PSBSb29tU3RhdGUuUk9PTV9JTlZBTElEICYmIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlV2FpdGluZ1VJKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHRoaXMubm9kZS5vbihcImNhbnJvYl9ldmVudFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInBsYXllcm5vZGVfY2Fucm9iX2V2ZW50XCIsIGV2ZW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHRoaXMubm9kZS5vbihcImNob29zZV9jYXJkX2V2ZW50XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZ2FtZXVpX25vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJnYW1laW5nVUlcIilcbiAgICAgICAgICAgIGlmIChnYW1ldWlfbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnYW1ldWlfbm9kZS5lbWl0KFwiY2hvb3NlX2NhcmRfZXZlbnRcIiwgZXZlbnQpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICB0aGlzLm5vZGUub24oXCJ1bmNob29zZV9jYXJkX2V2ZW50XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgZ2FtZXVpX25vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJnYW1laW5nVUlcIilcbiAgICAgICAgICAgIGlmIChnYW1ldWlfbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnYW1ldWlfbm9kZS5lbWl0KFwidW5jaG9vc2VfY2FyZF9ldmVudFwiLCBldmVudClcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHZhciBjdXJyZW50Um9vbUNvZGUgPSBteWdsb2JhbC5zb2NrZXQuZ2V0Q3VycmVudFJvb21Db2RlKClcbiAgICAgICAgdmFyIGlzSW5Sb29tID0gbXlnbG9iYWwuc29ja2V0LmlzSW5Sb29tKClcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgcm9vbURhdGEgPSBteWdsb2JhbC5yb29tRGF0YVxuICAgICAgICBcbiAgICAgICAgaWYgKGlzSW5Sb29tICYmIGN1cnJlbnRSb29tQ29kZSAmJiAhcm9vbURhdGEpIHtcbiAgICAgICAgICAgIHJvb21EYXRhID0ge1xuICAgICAgICAgICAgICAgIHJvb21pZDogY3VycmVudFJvb21Db2RlLFxuICAgICAgICAgICAgICAgIHJvb21fY29kZTogY3VycmVudFJvb21Db2RlLFxuICAgICAgICAgICAgICAgIHNlYXRpbmRleDogMSxcbiAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBbe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50aWQ6IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudGlkIHx8IG15Z2xvYmFsLnBsYXllckRhdGEucGxheWVySWQsXG4gICAgICAgICAgICAgICAgICAgIG5pY2tfbmFtZTogbXlnbG9iYWwucGxheWVyRGF0YS5uaWNrTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBcImF2YXRhcl8xXCIsXG4gICAgICAgICAgICAgICAgICAgIGdvbGRfY291bnQ6IG15Z2xvYmFsLnBsYXllckRhdGEuZ29iYWxfY291bnQgfHwgMTAwMCwgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqCBnb2xkX2NvdW50IOWtl+autVxuICAgICAgICAgICAgICAgICAgICBnb2xkY291bnQ6IG15Z2xvYmFsLnBsYXllckRhdGEuZ29iYWxfY291bnQgfHwgMTAwMCwgIC8vIOWFvOWuueaXp+WuouaIt+err1xuICAgICAgICAgICAgICAgICAgICBzZWF0aW5kZXg6IDEsXG4gICAgICAgICAgICAgICAgICAgIGlzcmVhZHk6IHRydWVcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocm9vbURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NSb29tRGF0YShyb29tRGF0YSwgbXlnbG9iYWwsIGlzb3Blbl9zb3VuZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0X2VudGVyX3Jvb20oe30sIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciAhPSAwKSB7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc1Jvb21EYXRhKHJlc3VsdCwgbXlnbG9iYWwsIGlzb3Blbl9zb3VuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIH1cblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25QbGF5ZXJKb2luUm9vbShmdW5jdGlvbihqb2luX3BsYXllcmRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUGxheWVyTm9kZShqb2luX3BsYXllcmRhdGEpXG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fcGxheWVyZGF0YUxpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5ZXJkYXRhTGlzdCA9IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wbGF5ZXJkYXRhTGlzdC5wdXNoKGpvaW5fcGxheWVyZGF0YSlcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93V2FpdGluZ1VJKDMgLSB0aGlzLl9wbGF5ZXJkYXRhTGlzdC5sZW5ndGgsIHRoaXMuX2N1cnJlbnRSb29tQ29kZSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyTm9kZUxpc3QgJiYgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0aW5nVUkoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUGxheWVyUmVhZHkoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInBsYXllcl9yZWFkeV9ub3RpZnlcIiwgZGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25HYW1lU3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75Yqg56m65YC85qOA5p+lXG4gICAgICAgICAgICBpZiAoIXRoaXMucGxheWVyTm9kZUxpc3QpIHJldHVyblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwiZ2FtZXN0YXJ0X2V2ZW50XCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZ2FtZWJlZm9yZVVJID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWJlZm9yZVVJXCIpXG4gICAgICAgICAgICBpZiAoZ2FtZWJlZm9yZVVJKSB7XG4gICAgICAgICAgICAgICAgZ2FtZWJlZm9yZVVJLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Sb2JTdGF0ZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmt7vliqAgcm91bmQg5a2X5q6177yM5Yy65YiG5Y+r5Zyw5Li75ZKM5oqi5Zyw5Li7XG4gICAgICAgICAgICB2YXIgZXZlbnRXaXRoUm91bmQgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudCwgeyByb3VuZDogMiB9KVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVybm9kZV9yb2Jfc3RhdGVfZXZlbnRcIiwgZXZlbnRXaXRoUm91bmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5Y+r5Zyw5Li757uT5p6c77yI56ys5LiA6L2u77yJXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkJpZFJlc3VsdChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmt7vliqAgcm91bmQg5a2X5q6177yM5Yy65YiG5Y+r5Zyw5Li75ZKM5oqi5Zyw5Li7XG4gICAgICAgICAgICB2YXIgZXZlbnRXaXRoUm91bmQgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudCwgeyByb3VuZDogMSB9KVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVybm9kZV9yb2Jfc3RhdGVfZXZlbnRcIiwgZXZlbnRXaXRoUm91bmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uQ2hhbmdlTWFzdGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLm1hc3Rlcl9hY2NvdW50aWQgPSBldmVudFxuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoOepuuWAvOajgOafpVxuICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInBsYXllcm5vZGVfY2hhbmdlbWFzdGVyX2V2ZW50XCIsIGV2ZW50KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHnm5HlkKzlh7rniYzpmLbmrrXlvIDlp4tcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUGxheVN0YXJ0KGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vIOiuvue9ruaIv+mXtOeKtuaAgeS4uuWHuueJjOmYtuautVxuICAgICAgICAgICAgdGhpcy5yb29tc3RhdGUgPSBSb29tU3RhdGUuUk9PTV9QTEFZSU5HXG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICB0aGlzLm5vZGUub24oXCJ1cGRhdGVfY2FyZF9jb3VudF9ldmVudFwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75Yqg56m65YC85qOA5p+lXG4gICAgICAgICAgICBpZiAoIXRoaXMucGxheWVyTm9kZUxpc3QpIHJldHVyblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwidXBkYXRlX2NhcmRfY291bnRfZXZlbnRcIiwgZGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25TaG93Qm90dG9tQ2FyZChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGdhbWV1aV9ub2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWluZ1VJXCIpXG4gICAgICAgICAgICBpZiAoZ2FtZXVpX25vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2FtZXVpX25vZGUuZW1pdChcInNob3dfYm90dG9tX2NhcmRfZXZlbnRcIiwgZXZlbnQpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblJvb21SZXN0b3JlZChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5yb29tX2NvZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdG9yZWRSb29tRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbWlkOiBkYXRhLnJvb21fY29kZSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9jb2RlOiBkYXRhLnJvb21fY29kZSxcbiAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiAxLFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudGlkOiBkYXRhLnBsYXllcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5pY2tfbmFtZTogZGF0YS5wbGF5ZXJfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogXCJhdmF0YXJfMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZF9jb3VudDogZGF0YS5nb2xkX2NvdW50IHx8IDEwMDAsIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKggZ29sZF9jb3VudCDlrZfmrrVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogZGF0YS5nb2xkX2NvdW50IHx8IDEwMDAsICAvLyDlhbzlrrnml6flrqLmiLfnq69cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXRpbmRleDogMVxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jZXNzUm9vbURhdGEocmVzdG9yZWRSb29tRGF0YSwgbXlnbG9iYWwsIGlzb3Blbl9zb3VuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5paw5aKe44CR55uR5ZCs5ri45oiP54q25oCB5oGi5aSN5LqL5Lu2XG4gICAgICAgIHRoaXMubm9kZS5vbihcImdhbWVfc3RhdGVfcmVzdG9yZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fb25HYW1lU3RhdGVSZXN0b3JlZChkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDjgJDmlrDlop7jgJHnm5HlkKznjqnlrrbmjonnur/pgJrnn6VcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUGxheWVyT2ZmbGluZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXllck9mZmxpbmUoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5paw5aKe44CR55uR5ZCs546p5a625LiK57q/6YCa55+lXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXllck9ubGluZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXllck9ubGluZShkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR55uR5ZCsIHJvb21fam9pbmVkIOS6i+S7tuabtOaWsOaIv+mXtOWPt+WSjOeOqeWutuaVsOaNrlxuICAgICAgICAvLyDnq57mioDlnLrmqKHlvI/kuIvvvIzlhYjov5vlhaXmuLjmiI/lnLrmma/vvIzlkI7mlLbliLDnnJ/mraPnmoTmiL/pl7Tlj7dcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUm9vbUpvaW5lZChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW2dhbWVTY2VuZV0g5pS25YiwIHJvb21fam9pbmVkIOa2iOaBrzpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOabtOaWsOaIv+mXtOWPt1xuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5yb29tX2NvZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yb29taWRfbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUZXh0ID0gdGhpcy5yb29taWRfbGFiZWwuc3RyaW5nIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Um9vbUNvZGUgPSBjdXJyZW50VGV4dC5yZXBsYWNlKFwi5oi/6Ze05Y+3OlwiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWmguaenOW9k+WJjeaIv+mXtOWPt+S4uuepuuaIlueci+i1t+adpeaYr+acn+WPt++8iOmVv+W6pj4xMO+8ie+8jOabtOaWsOS4uuato+ehrueahOaIv+mXtOWPt1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJvb21Db2RlID09PSBcIlwiIHx8IGN1cnJlbnRSb29tQ29kZS5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb29taWRfbGFiZWwuc3RyaW5nID0gXCLmiL/pl7Tlj7c6XCIgKyBkYXRhLnJvb21fY29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbZ2FtZVNjZW5lXSDmm7TmlrDmiL/pl7Tlj7c6IFwiICsgZGF0YS5yb29tX2NvZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+OriBbZ2FtZVNjZW5lXSByb29taWRfbGFiZWwg5pyq57uR5a6aXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR6ZqQ6JeP5Yqg6L2955WM6Z2i77yI5oi/6Ze05Y+35bey5pu05paw77yJXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZUFyZW5hTG9hZGluZ1VJKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeeUqCBST09NX0pPSU5FRCDmlbDmja7mm7TmlrDnjqnlrrbkv6Hmga/vvIjlpLTlg4/jgIHph5HluIHnrYnvvIlcbiAgICAgICAgICAgIC8vIOeugOWMluWMuemFjemAu+i+ke+8muacuuWZqOS6uumAmui/hyBJRCDljLnphY3vvIzlvZPliY3njqnlrrbpgJrov4fkvY3nva7ntKLlvJUgMCDljLnphY1cbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEucGxheWVycyAmJiB0aGlzLnBsYXllck5vZGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFtnYW1lU2NlbmVdIOabtOaWsOeOqeWutuaVsOaNru+8jOeOqeWutuaVsOmHjzpcIiwgZGF0YS5wbGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN546p5a6255qEIHNlcnZlclBsYXllcklk77yIVVVJRCDmoLzlvI/vvIlcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFNlcnZlclBsYXllcklkID0gbXlnbG9iYWwucGxheWVyRGF0YSAmJiBteWdsb2JhbC5wbGF5ZXJEYXRhLnNlcnZlclBsYXllcklkO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbZ2FtZVNjZW5lXSDlvZPliY3njqnlrrYgc2VydmVyUGxheWVySWQ6XCIsIGN1cnJlbnRTZXJ2ZXJQbGF5ZXJJZCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkemBjeWOhuacjeWKoeerr+eOqeWutuWIl+ihqO+8jOabtOaWsOaJgOacieeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXJ2ZXJQbGF5ZXIgPSBkYXRhLnBsYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5Yik5pat5piv5ZCm5piv5b2T5YmN546p5a6277yaXG4gICAgICAgICAgICAgICAgICAgIC8vIDEuIElEIOWMuemFjSBzZXJ2ZXJQbGF5ZXJJZFxuICAgICAgICAgICAgICAgICAgICAvLyAyLiDmiJbogIUgSUQg5pivIFVVSUQg5qC85byP77yI5YyF5ZCrICctJ++8ieS4lOS4jeWMuemFjeW3suefpeeahOacuuWZqOS6uiBJRFxuICAgICAgICAgICAgICAgICAgICB2YXIgaXNDdXJyZW50UGxheWVyID0gKHNlcnZlclBsYXllci5pZCA9PT0gY3VycmVudFNlcnZlclBsYXllcklkKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzZXJ2ZXJQbGF5ZXIuaWQgJiYgc2VydmVyUGxheWVyLmlkLmluZGV4T2YoJy0nKSA+IDAgJiYgIXRoaXMuX2lzS25vd25Sb2JvdElkKHNlcnZlclBsYXllci5pZCkpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFtnYW1lU2NlbmVdIOWkhOeQhueOqeWutjogXCIgKyBzZXJ2ZXJQbGF5ZXIubmFtZSArIFwiLCBpZD1cIiArIHNlcnZlclBsYXllci5pZCArIFwiLCBpc0N1cnJlbnRQbGF5ZXI9XCIgKyBpc0N1cnJlbnRQbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5p+l5om+5a+55bqU55qE546p5a626IqC54K5XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllck5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwbGF5ZXJOb2RlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllclNjcmlwdCA9IHBsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBsYXllclNjcmlwdCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDnroDljJbljLnphY3pgLvovpHjgJFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIOacuuWZqOS6uueOqeWutu+8mumAmui/hyBhY2NvdW50aWQg5Yy56YWNXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAyLiDlvZPliY3njqnlrrbvvJrpgJrov4fkvY3nva7ntKLlvJUgMCDljLnphY3vvIjlvZPliY3njqnlrrblp4vnu4jlnKjkvY3nva4gMO+8iVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ3VycmVudFBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW9k+WJjeeOqeWutu+8muWMuemFjeS9jee9rue0ouW8lSAwIOeahOiKgueCuVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJTY3JpcHQuc2VhdF9pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFtnYW1lU2NlbmVdIOW9k+WJjeeOqeWutuWMuemFjeaIkOWKn++8iOS9jee9rue0ouW8lSAw77yJXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YW25LuW546p5a6277yI5py65Zmo5Lq677yJ77ya6YCa6L+HIGFjY291bnRpZCDljLnphY1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyU2NyaXB0LmFjY291bnRpZCA9PT0gc2VydmVyUGxheWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTWF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW2dhbWVTY2VuZV0g5py65Zmo5Lq6546p5a625Yy56YWN5oiQ5YqfOiBcIiArIHNlcnZlclBsYXllci5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc01hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw546p5a625pWw5o2uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVwZGF0ZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRfY291bnQ6IHNlcnZlclBsYXllci5nb2xkX2NvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZW5hX2dvbGQ6IHNlcnZlclBsYXllci5hcmVuYV9nb2xkIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoX2NvaW46IHNlcnZlclBsYXllci5tYXRjaF9jb2luIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcjogc2VydmVyUGxheWVyLmF2YXRhciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHNlcnZlclBsYXllci5hdmF0YXIgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyU2NyaXB0LnVwZGF0ZUFyZW5hRGF0YSAmJiBwbGF5ZXJTY3JpcHQudXBkYXRlQXJlbmFEYXRhKHVwZGF0ZURhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbZ2FtZVNjZW5lXSDmm7TmlrDnjqnlrrYgXCIgKyBzZXJ2ZXJQbGF5ZXIubmFtZSArIFwiIOaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkodXBkYXRlRGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBzZXRQbGF5ZXJTZWF0UG9zKHNlYXRfaW5kZXgpIHtcbiAgICAgICAgaWYgKHNlYXRfaW5kZXggPCAxIHx8IHNlYXRfaW5kZXggPiAzKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHosIPmlbTkuLrpgIbml7bpkojmlrnlkJHvvJpcbiAgICAgICAgLy8gLSDkvY3nva4gMO+8muS4i+aWue+8iOW9k+WJjeeOqeWutu+8iVxuICAgICAgICAvLyAtIOS9jee9riAx77ya5bem5L6n77yI5LiK5a6277yJXG4gICAgICAgIC8vIC0g5L2N572uIDLvvJrlj7PkvqfvvIjkuIvlrrbvvIlcbiAgICAgICAgLy8g5paX5Zyw5Li75Ye654mM6aG65bqP77ya5b2T5YmN546p5a62IOKGkiDkuIvlrrbvvIjlj7PkvqfvvInihpIg5LiK5a6277yI5bem5L6n77yJ4oaSIOW9k+WJjeeOqeWutlxuICAgICAgICBzd2l0Y2ggKHNlYXRfaW5kZXgpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbMV0gPSAwICAvLyDluqfkvY0x77ya5b2T5YmN546p5a62IOKGkiDkvY3nva4w77yI5LiL5pa577yJXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzJdID0gMiAgLy8g5bqn5L2NMu+8muS4i+WutiDihpIg5L2N572uMu+8iOWPs+S+p++8iVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1szXSA9IDEgIC8vIOW6p+S9jTPvvJrkuIrlrrYg4oaSIOS9jee9rjHvvIjlt6bkvqfvvIlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1syXSA9IDAgIC8vIOW6p+S9jTLvvJrlvZPliY3njqnlrrYg4oaSIOS9jee9rjDvvIjkuIvmlrnvvIlcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbM10gPSAyICAvLyDluqfkvY0z77ya5LiL5a62IOKGkiDkvY3nva4y77yI5Y+z5L6n77yJXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzFdID0gMSAgLy8g5bqn5L2NMe+8muS4iuWutiDihpIg5L2N572uMe+8iOW3puS+p++8iVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzNdID0gMCAgLy8g5bqn5L2NM++8muW9k+WJjeeOqeWutiDihpIg5L2N572uMO+8iOS4i+aWue+8iVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1sxXSA9IDIgIC8vIOW6p+S9jTHvvJrkuIvlrrYg4oaSIOS9jee9rjLvvIjlj7PkvqfvvIlcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbMl0gPSAxICAvLyDluqfkvY0y77ya5LiK5a62IOKGkiDkvY3nva4x77yI5bem5L6n77yJXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5qOA5p+l5piv5ZCm5piv5bey55+l55qE5py65Zmo5Lq6IElEXG4gICAgICog5py65Zmo5Lq6IElEIOmAmuW4uOaYr+e6r+aVsOWtl+Wtl+espuS4slxuICAgICAqL1xuICAgIF9pc0tub3duUm9ib3RJZDogZnVuY3Rpb24ocGxheWVySWQpIHtcbiAgICAgICAgaWYgKCFwbGF5ZXJJZCkgcmV0dXJuIGZhbHNlXG4gICAgICAgIC8vIOacuuWZqOS6uiBJRCDmmK/nuq/mlbDlrZdcbiAgICAgICAgcmV0dXJuIC9eXFxkKyQvLnRlc3QocGxheWVySWQpXG4gICAgfSxcblxuICAgIGFkZFBsYXllck5vZGUocGxheWVyX2RhdGEpIHtcblxuICAgICAgICBpZiAoIXRoaXMucGxheWVyX25vZGVfcHJlZmFicykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInBsYXllcl9ub2RlX3ByZWZhYnMg5pyq57uR5a6a77yBXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnBsYXllcnNfc2VhdF9wb3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJwbGF5ZXJzX3NlYXRfcG9zIOacque7keWumu+8gVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDosIPor5XjgJHovpPlh7rnjqnlrrbmlbDmja5cbiAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFthZGRQbGF5ZXJOb2RlXSBwbGF5ZXJfZGF0YTpcIiwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgYWNjb3VudGlkOiBwbGF5ZXJfZGF0YS5hY2NvdW50aWQgfHwgcGxheWVyX2RhdGEuYWNjb3VudElkLFxuICAgICAgICAgICAgbmlja19uYW1lOiBwbGF5ZXJfZGF0YS5uaWNrX25hbWUsXG4gICAgICAgICAgICBzZWF0aW5kZXg6IHBsYXllcl9kYXRhLnNlYXRpbmRleCxcbiAgICAgICAgICAgIGlzX3JvYm90OiBwbGF5ZXJfZGF0YS5pc19yb2JvdFxuICAgICAgICB9KSlcblxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR5qOA5p+l546p5a625piv5ZCm5bey5a2Y5Zyo77yM5aaC5p6c5a2Y5Zyo5YiZ5pu05paw6ICM6Z2e5Yib5bu65paw6IqC54K5XG4gICAgICAgIHZhciBleGlzdGluZ1BsYXllck5vZGUgPSB0aGlzLl9maW5kUGxheWVyTm9kZUJ5QWNjb3VudElkKHBsYXllcl9kYXRhLmFjY291bnRpZCB8fCBwbGF5ZXJfZGF0YS5hY2NvdW50SWQpXG4gICAgICAgIGlmIChleGlzdGluZ1BsYXllck5vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbYWRkUGxheWVyTm9kZV0g546p5a626IqC54K55bey5a2Y5Zyo77yM5pu05paw5pWw5o2u6ICM6Z2e5Yib5bu65paw6IqC54K5LCBhY2NvdW50aWQ6XCIsIHBsYXllcl9kYXRhLmFjY291bnRpZCB8fCBwbGF5ZXJfZGF0YS5hY2NvdW50SWQpXG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdTY3JpcHQgPSBleGlzdGluZ1BsYXllck5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1NjcmlwdCkge1xuICAgICAgICAgICAgICAgIC8vIOabtOaWsOeOsOacieiKgueCueeahOaVsOaNrlxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJfZGF0YS5nb2xkX2NvdW50ICE9PSB1bmRlZmluZWQgfHwgcGxheWVyX2RhdGEuYXJlbmFfZ29sZCAhPT0gdW5kZWZpbmVkIHx8IHBsYXllcl9kYXRhLm1hdGNoX2NvaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1NjcmlwdC51cGRhdGVBcmVuYURhdGEgJiYgZXhpc3RpbmdTY3JpcHQudXBkYXRlQXJlbmFEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRfY291bnQ6IHBsYXllcl9kYXRhLmdvbGRfY291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVuYV9nb2xkOiBwbGF5ZXJfZGF0YS5hcmVuYV9nb2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hfY29pbjogcGxheWVyX2RhdGEubWF0Y2hfY29pbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcjogcGxheWVyX2RhdGEuYXZhdGFyIHx8IHBsYXllcl9kYXRhLmF2YXRhclVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcGxheWVyX2RhdGEuYXZhdGFyIHx8IHBsYXllcl9kYXRhLmF2YXRhclVybFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDlpLTlg4/vvIjlpoLmnpzmnInmnInmlYjnmoTlpLTlg49VUkzvvIlcbiAgICAgICAgICAgICAgICB2YXIgYXZhdGFyVXJsID0gcGxheWVyX2RhdGEuYXZhdGFyIHx8IHBsYXllcl9kYXRhLmF2YXRhclVybCB8fCBwbGF5ZXJfZGF0YS5hdmF0YXJ1cmxcbiAgICAgICAgICAgICAgICBpZiAoYXZhdGFyVXJsICYmIGF2YXRhclVybCAhPT0gXCJcIiAmJiBhdmF0YXJVcmwgIT09IFwiYXZhdGFyXzFcIikge1xuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1NjcmlwdC5fbG9hZEF2YXRhciAmJiBleGlzdGluZ1NjcmlwdC5fbG9hZEF2YXRhcihhdmF0YXJVcmwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC8vIOS4jeWIm+W7uuaWsOiKgueCuVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBsYXllcm5vZGVfaW5zdCA9IGNjLmluc3RhbnRpYXRlKHRoaXMucGxheWVyX25vZGVfcHJlZmFicyk7XG4gICAgICAgIGlmICghcGxheWVybm9kZV9pbnN0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5rOV5a6e5L6L5YyWIHBsYXllcl9ub2RlX3ByZWZhYnNcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwbGF5ZXJub2RlX2luc3QucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICB0aGlzLnBsYXllck5vZGVMaXN0LnB1c2gocGxheWVybm9kZV9pbnN0KTtcblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5bCG5oi/6Ze057G75Z6L5Lyg6YCS57uZIHBsYXllcl9ub2Rl77yI55So5LqO5Yy65YiG5pmu6YCa5Zy65ZKM56ue5oqA5Zy677yJXG4gICAgICAgIGlmICghcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSkge1xuICAgICAgICAgICAgcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSA9IHRoaXMuX3Jvb21DYXRlZ29yeSB8fCAxXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW2FkZFBsYXllck5vZGVdIOiuvue9riBwbGF5ZXJfZGF0YS5yb29tX2NhdGVnb3J5ID1cIiwgcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlsIbmnJ/lj7fkvKDpgJLnu5kgcGxheWVyX25vZGVcbiAgICAgICAgaWYgKCFwbGF5ZXJfZGF0YS5wZXJpb2Rfbm8gJiYgdGhpcy5fcGVyaW9kTm8pIHtcbiAgICAgICAgICAgIHBsYXllcl9kYXRhLnBlcmlvZF9ubyA9IHRoaXMuX3BlcmlvZE5vXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbcGxheWVyX2RhdGEuc2VhdGluZGV4XTtcbiAgICAgICAgXG4gICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkIHx8IGluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5pWI55qE5bqn5L2N57Si5byVOlwiLCBwbGF5ZXJfZGF0YS5zZWF0aW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlbiB8fCAhdGhpcy5wbGF5ZXJzX3NlYXRfcG9zLmNoaWxkcmVuW2luZGV4XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuW6p+S9jeiKgueCueS4jeWtmOWcqO+8jGluZGV4OlwiLCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHBsYXllcm5vZGVfaW5zdC5wb3NpdGlvbiA9IHRoaXMucGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlbltpbmRleF0ucG9zaXRpb247XG4gICAgICAgIFxuICAgICAgICB2YXIgcGxheWVyTm9kZVNjcmlwdCA9IHBsYXllcm5vZGVfaW5zdC5nZXRDb21wb25lbnQoXCJwbGF5ZXJfbm9kZVwiKTtcbiAgICAgICAgaWYgKCFwbGF5ZXJOb2RlU2NyaXB0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5rOV6I635Y+WIHBsYXllcl9ub2RlIOe7hOS7tlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcGxheWVyTm9kZVNjcmlwdC5pbml0X2RhdGEocGxheWVyX2RhdGEsIGluZGV4KTtcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHmoLnmja4gYWNjb3VudGlkIOafpeaJvueOqeWutuiKgueCuVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY2NvdW50SWQgLSDnjqnlrrbotKblj7dJRFxuICAgICAqIEByZXR1cm5zIHtjYy5Ob2RlfG51bGx9IOeOqeWutuiKgueCueaIliBudWxsXG4gICAgICovXG4gICAgX2ZpbmRQbGF5ZXJOb2RlQnlBY2NvdW50SWQ6IGZ1bmN0aW9uKGFjY291bnRJZCkge1xuICAgICAgICBpZiAoIXRoaXMucGxheWVyTm9kZUxpc3QgfHwgIWFjY291bnRJZCkgcmV0dXJuIG51bGxcbiAgICAgICAgXG4gICAgICAgIHZhciBhY2NvdW50SWRTdHIgPSBTdHJpbmcoYWNjb3VudElkKVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2NyaXB0ID0gbm9kZS5nZXRDb21wb25lbnQoXCJwbGF5ZXJfbm9kZVwiKVxuICAgICAgICAgICAgICAgIGlmIChzY3JpcHQgJiYgU3RyaW5nKHNjcmlwdC5hY2NvdW50aWQpID09PSBhY2NvdW50SWRTdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuXG4gICAgc3RhcnQoKSB7XG4gICAgfSxcblxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3N0b3BPbmxpbmVNb25pdG9yaW5nKClcbiAgICB9LFxuXG4gICAgZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoYWNjb3VudGlkKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGxheWVyTm9kZUxpc3QgfHwgIXRoaXMucGxheWVyc19zZWF0X3Bvcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInBsYXllck5vZGVMaXN0IOaIliBwbGF5ZXJzX3NlYXRfcG9zIOacquWIneWni+WMllwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55So5a2X56ym5Liy5q+U6L6D77yM6YG/5YWN57G75Z6L5LiN5Yy56YWN6Zeu6aKYXG4gICAgICAgIHZhciB0YXJnZXRBY2NvdW50SWQgPSBTdHJpbmcoYWNjb3VudGlkIHx8IFwiXCIpXG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZV9zY3JpcHQgPSBub2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOWtl+espuS4suavlOi+g++8jOehruS/neexu+Wei+S4gOiHtFxuICAgICAgICAgICAgICAgIGlmIChub2RlX3NjcmlwdCAmJiBTdHJpbmcobm9kZV9zY3JpcHQuYWNjb3VudGlkIHx8IFwiXCIpID09PSB0YXJnZXRBY2NvdW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVfc2NyaXB0LnNlYXRfaW5kZXggPT09IHVuZGVmaW5lZCB8fCBub2RlX3NjcmlwdC5zZWF0X2luZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5pWI55qEIHNlYXRfaW5kZXhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXllcnNfc2VhdF9wb3MuY2hpbGRyZW4gfHwgIXRoaXMucGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlbltub2RlX3NjcmlwdC5zZWF0X2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuW6p+S9jeiKgueCueS4jeWtmOWcqO+8jHNlYXRfaW5kZXg6XCIsIG5vZGVfc2NyaXB0LnNlYXRfaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWF0X25vZGUgPSB0aGlzLnBsYXllcnNfc2VhdF9wb3MuY2hpbGRyZW5bbm9kZV9zY3JpcHQuc2VhdF9pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpSBzZWF0X25vZGUg5piv5ZCm5a2Y5ZyoXG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VhdF9ub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VhdF9ub2RlIOS4uuepuu+8jHNlYXRfaW5kZXg6XCIsIG5vZGVfc2NyaXB0LnNlYXRfaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4X25hbWUgPSBcImNhcmRzb3V0em9uZVwiICsgbm9kZV9zY3JpcHQuc2VhdF9pbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgb3V0X2NhcmRfbm9kZSA9IHNlYXRfbm9kZS5nZXRDaGlsZEJ5TmFtZShpbmRleF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOiwg+ivleOAkei+k+WHuuaJvuWIsOeahOWHuueJjOWMuuWfn1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfg48gW2dldFVzZXJPdXRDYXJkUG9zQnlBY2NvdW50XSBhY2NvdW50aWQ6XCIsIGFjY291bnRpZCwgXCJzZWF0X2luZGV4OlwiLCBub2RlX3NjcmlwdC5zZWF0X2luZGV4LCBcIm91dF9jYXJkX25vZGU6XCIsIG91dF9jYXJkX25vZGUgPyBvdXRfY2FyZF9ub2RlLm5hbWUgOiBcIm51bGxcIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRfY2FyZF9ub2RlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR5pyq5om+5Yiw546p5a626IqC54K5XG4gICAgICAgIGNvbnNvbGUud2FybihcIvCfg48gW2dldFVzZXJPdXRDYXJkUG9zQnlBY2NvdW50XSDmnKrmib7liLDnjqnlrrboioLngrksIGFjY291bnRpZDpcIiwgYWNjb3VudGlkLCBcInBsYXllck5vZGVMaXN0Lmxlbmd0aDpcIiwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGgpXG5cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuICAgIFxuICAgIF9wcm9jZXNzUm9vbURhdGE6IGZ1bmN0aW9uKHJlc3VsdCwgbXlnbG9iYWwsIGlzb3Blbl9zb3VuZCkge1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn46uIFtfcHJvY2Vzc1Jvb21EYXRhXSDmjqXmlLbliLDnmoTmlbDmja46XCIsIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpXG4gICAgICAgIFxuICAgICAgICB2YXIgcGxheWVyZGF0YV9saXN0ID0gcmVzdWx0LnBsYXllcmRhdGEgfHwgW11cbiAgICAgICAgdmFyIHJvb21pZCA9IHJlc3VsdC5yb29taWQgfHwgcmVzdWx0LnJvb21fY29kZSB8fCByZXN1bHQucm9vbUNvZGUgfHwgXCJXQUlUSU5HXCJcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5qOA5p+l5piv5ZCm5piv56ue5oqA5Zy65qih5byPXG4gICAgICAgIHZhciBpc0FyZW5hTW9kZSA9IHJlc3VsdC5yb29tX2NhdGVnb3J5ID09PSAyXG4gICAgICAgIGlmIChpc0FyZW5hTW9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtfcHJvY2Vzc1Jvb21EYXRhXSDnq57mioDlnLrmqKHlvI86IHJvb21fY2F0ZWdvcnk9MiwgcGxheWVyZGF0YeaVsOmHjz1cIiArIHBsYXllcmRhdGFfbGlzdC5sZW5ndGggKyBcIiwg5pyf5Y+3PVwiICsgcmVzdWx0LnBlcmlvZF9ubylcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeernuaKgOWcuuaooeW8j+S4i++8jOehruS/neW9k+WJjeeOqeWutuWni+e7iOWcqOS9jee9riAw77yI5LiL5pa577yJXG4gICAgICAgIC8vIOaJvuWHuuW9k+WJjeeOqeWutu+8iOmdnuacuuWZqOS6uu+8ieW5tuiuoeeul+WFtuato+ehruS9jee9rlxuICAgICAgICB2YXIgc2VhdGlkID0gcmVzdWx0LnNlYXRpbmRleCB8fCAxXG4gICAgICAgIGlmIChpc0FyZW5hTW9kZSAmJiBwbGF5ZXJkYXRhX2xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8g5Zyo56ue5oqA5Zy65qih5byP5LiL77yM5om+5Yiw5b2T5YmN546p5a6277yI6Z2e5py65Zmo5Lq677yJXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcmRhdGFfbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwID0gcGxheWVyZGF0YV9saXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKHAgJiYgIXAuaXNfcm9ib3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5b2T5YmN546p5a6255qEIHNlYXRpbmRleCDlsLHmmK/ku5blnKjmlbDnu4TkuK3nmoTmraPnoa7luqfkvY1cbiAgICAgICAgICAgICAgICAgICAgc2VhdGlkID0gcC5zZWF0aW5kZXggfHwgMVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW19wcm9jZXNzUm9vbURhdGFdIOernuaKgOWcuuaooeW8j++8muW9k+WJjeeOqeWutj1cIiArIHAubmlja19uYW1lICsgXCIsIHNlYXRpZD1cIiArIHNlYXRpZClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3BvcyA9IFtdXG4gICAgICAgIHRoaXMuc2V0UGxheWVyU2VhdFBvcyhzZWF0aWQpXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS/neWtmOaIv+mXtOexu+Wei+WIsOWunuS+i+WPmOmHj++8jOS+myBwbGF5ZXJfbm9kZSDkvb/nlKhcbiAgICAgICAgdGhpcy5fcm9vbUNhdGVnb3J5ID0gcmVzdWx0LnJvb21fY2F0ZWdvcnkgfHwgMVxuICAgICAgICB0aGlzLl9pc0FyZW5hTW9kZSA9IGlzQXJlbmFNb2RlXG4gICAgICAgIHRoaXMuX3BlcmlvZE5vID0gcmVzdWx0LnBlcmlvZF9ubyB8fCBcIlwiIC8vIPCflKfjgJDmlrDlop7jgJHkv53lrZjmnJ/lj7dcblxuICAgICAgICB0aGlzLl9wbGF5ZXJkYXRhTGlzdCA9IHBsYXllcmRhdGFfbGlzdFxuXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5yb29taWRfbGFiZWwpIHtcbiAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHnq57mioDlnLrmqKHlvI/kuIvvvIzlpoLmnpzmiL/pl7Tlj7fkuLrnqbrmiJbnnIvotbfmnaXlg4/mnJ/lj7fvvIjotoXov4cxMOS9je+8ie+8jOaYvuekuuWKoOi9veeVjOmdolxuICAgICAgICAgICAgLy8g562J5b6FIFJPT01fSk9JTkVEIOa2iOaBr+abtOaWsOato+ehrueahOaIv+mXtOWPt1xuICAgICAgICAgICAgaWYgKGlzQXJlbmFNb2RlICYmIChyb29taWQgPT09IFwiXCIgfHwgcm9vbWlkID09PSBcIldBSVRJTkdcIiB8fCByb29taWQubGVuZ3RoID4gMTApKSB7XG4gICAgICAgICAgICAgICAgLy8g5oi/6Ze05Y+35Li656m65oiW55yL6LW35p2l5piv5pyf5Y+377yM5pi+56S65Yqg6L2955WM6Z2i77yM562J5b6F5pyN5Yqh56uv6L+U5Zue5q2j56Gu55qE5oi/6Ze05Y+3XG4gICAgICAgICAgICAgICAgdGhpcy5yb29taWRfbGFiZWwuc3RyaW5nID0gXCJcIlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX3Byb2Nlc3NSb29tRGF0YV0g56ue5oqA5Zy65qih5byP77ya5oi/6Ze05Y+35Li656m65oiW5Li65pyf5Y+377yM5pi+56S65Yqg6L2955WM6Z2iLi4uIHJvb21pZD1cIiArIHJvb21pZClcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5pi+56S65Yqg6L2955WM6Z2iXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0FyZW5hTG9hZGluZ1VJKG15Z2xvYmFsKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21pZF9sYWJlbC5zdHJpbmcgPSBcIuaIv+mXtOWPtzpcIiArIHJvb21pZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfjq4gW+a4uOaIj+WcuuaZr10gcm9vbWlkX2xhYmVsIOacque7keWumu+8gVwiKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLmhvdXNlbWFuYWdlaWQgPSByZXN1bHQuaG91c2VtYW5hZ2VpZCB8fCByZXN1bHQuY3JlYXRvcl9pZCB8fCByZXN1bHQuY3JlYXRvcklkIHx8IFwiXCJcbiAgICAgICAgXG4gICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8pIHtcbiAgICAgICAgICAgIHZhciBwbGF5ZXJJbmZvID0gbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8oKVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGF5ZXJkYXRhX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+OriBbX3Byb2Nlc3NSb29tRGF0YV0g5re75Yqg546p5a626IqC54K5OiBcIiArIEpTT04uc3RyaW5naWZ5KHBsYXllcmRhdGFfbGlzdFtpXSkpXG4gICAgICAgICAgICB0aGlzLmFkZFBsYXllck5vZGUocGxheWVyZGF0YV9saXN0W2ldKVxuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgICAgIGlmIChpc29wZW5fc291bmQpIHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BBbGwoKVxuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJzb3VuZC9iZ1wiLCBjYy5BdWRpb0NsaXAsIGZ1bmN0aW9uKGVyciwgY2xpcCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXkoY2xpcCwgdHJ1ZSwgMSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHnq57mioDlnLrmqKHlvI/kuIvnm7TmjqXpmpDol48gZ2FtZWJlZm9yZVVJXG4gICAgICAgIC8vIOernuaKgOWcuuaooeW8j+S4i+aJgOacieeOqeWutuW3sue7j+WHhuWkh+Wlve+8jOa4uOaIj+S8muiHquWKqOW8gOWni++8jOS4jemcgOimgeaYvuekuuetieW+heeVjOmdolxuICAgICAgICB2YXIgZ2FtZWJlZm9yZV9ub2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWJlZm9yZVVJXCIpXG4gICAgICAgIGlmIChnYW1lYmVmb3JlX25vZGUpIHtcbiAgICAgICAgICAgIGlmIChpc0FyZW5hTW9kZSkge1xuICAgICAgICAgICAgICAgIC8vIOernuaKgOWcuuaooeW8j++8muebtOaOpemakOiXj+etieW+heeVjOmdolxuICAgICAgICAgICAgICAgIGdhbWViZWZvcmVfbm9kZS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX3Byb2Nlc3NSb29tRGF0YV0g56ue5oqA5Zy65qih5byP77ya6ZqQ6JePIGdhbWViZWZvcmVVSVwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDmma7pgJrmqKHlvI/vvJrmmL7npLrnrYnlvoXnlYzpnaJcbiAgICAgICAgICAgICAgICBnYW1lYmVmb3JlX25vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGdhbWViZWZvcmVfbm9kZS56SW5kZXggPSAxMDAwXG4gICAgICAgICAgICAgICAgZ2FtZWJlZm9yZV9ub2RlLmVtaXQoXCJpbml0XCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnq57mioDlnLrmqKHlvI/kuIvkuI3mmL7npLrnrYnlvoXnjqnlrrZVSe+8iOaJgOacieeOqeWutuW3suWIhumFjeWlve+8iVxuICAgICAgICBpZiAoaXNBcmVuYU1vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX3Byb2Nlc3NSb29tRGF0YV0g56ue5oqA5Zy65qih5byP77ya5LiN5pi+56S6562J5b6F546p5a62VUlcIilcbiAgICAgICAgICAgIC8vIOernuaKgOWcuuaooeW8j+S4i+aJgOacieeOqeWutuW6lOivpeW3sue7j+WHhuWkh+Wlve+8jOebtOaOpeetieW+hea4uOaIj+W8gOWni1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXllcmRhdGFfbGlzdC5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93V2FpdGluZ1VJKDMgLSBwbGF5ZXJkYXRhX2xpc3QubGVuZ3RoLCByb29taWQpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF9zaG93V2FpdGluZ1VJOiBmdW5jdGlvbihuZWVkUGxheWVycywgcm9vbUNvZGUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMgPSB0cnVlXG4gICAgICAgIHRoaXMuX25lZWRQbGF5ZXJzID0gbmVlZFBsYXllcnNcbiAgICAgICAgdGhpcy5fY3VycmVudFJvb21Db2RlID0gcm9vbUNvZGUgfHwgXCJcIlxuXG5cbiAgICAgICAgdGhpcy5faGlkZVdhaXRpbmdVSSgpXG5cbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKVxuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MFxuXG4gICAgICAgIHZhciB3YWl0aW5nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiV2FpdGluZ0ZvclBsYXllcnNVSVwiKVxuICAgICAgICB3YWl0aW5nTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKVxuICAgICAgICB3YWl0aW5nTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIHdhaXRpbmdOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgd2FpdGluZ05vZGUueCA9IDBcbiAgICAgICAgd2FpdGluZ05vZGUueSA9IDBcbiAgICAgICAgd2FpdGluZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX3dhaXRpbmdVSU5vZGUgPSB3YWl0aW5nTm9kZVxuXG4gICAgICAgIGlmIChyb29tQ29kZSkge1xuICAgICAgICAgICAgdmFyIHJvb21JbmZvTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUm9vbUluZm9cIilcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS54ID0gLXNjcmVlbldpZHRoLzIgKyAyMFxuICAgICAgICAgICAgcm9vbUluZm9Ob2RlLnkgPSBzY3JlZW5IZWlnaHQvMiAtIDMwXG4gICAgICAgICAgICByb29tSW5mb05vZGUuYW5jaG9yWCA9IDBcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS5hbmNob3JZID0gMC41XG5cbiAgICAgICAgICAgIHZhciByb29tTGFiZWwgPSByb29tSW5mb05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgcm9vbUxhYmVsLnN0cmluZyA9IFwi5oi/6Ze05Y+3OiBcIiArIHJvb21Db2RlXG4gICAgICAgICAgICByb29tTGFiZWwuZm9udFNpemUgPSAyNFxuICAgICAgICAgICAgcm9vbUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5MRUZUXG4gICAgICAgICAgICByb29tSW5mb05vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMClcblxuICAgICAgICAgICAgdmFyIHJvb21PdXRsaW5lID0gcm9vbUluZm9Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgICAgICByb29tT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApXG4gICAgICAgICAgICByb29tT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS5wYXJlbnQgPSB3YWl0aW5nTm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlYXZlQnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGVhdmVCdG5cIilcbiAgICAgICAgbGVhdmVCdG5Ob2RlLnggPSBzY3JlZW5XaWR0aC8yIC0gMTAwXG4gICAgICAgIGxlYXZlQnRuTm9kZS55ID0gLXNjcmVlbkhlaWdodC8yICsgNTBcbiAgICAgICAgbGVhdmVCdG5Ob2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGVhdmVCdG5Ob2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgbGVhdmVCdG5Ob2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTQwLCA0MCkpXG5cbiAgICAgICAgdmFyIGxlYXZlQnRuQmcgPSBsZWF2ZUJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBsZWF2ZUJ0bkJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDE4MCwgNjAsIDYwLCAyMzApXG4gICAgICAgIGxlYXZlQnRuQmcucm91bmRSZWN0KC03MCwgLTIwLCAxNDAsIDQwLCA4KVxuICAgICAgICBsZWF2ZUJ0bkJnLmZpbGwoKVxuICAgICAgICBsZWF2ZUJ0bkJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjIwLCAxMDAsIDEwMClcbiAgICAgICAgbGVhdmVCdG5CZy5saW5lV2lkdGggPSAyXG4gICAgICAgIGxlYXZlQnRuQmcucm91bmRSZWN0KC03MCwgLTIwLCAxNDAsIDQwLCA4KVxuICAgICAgICBsZWF2ZUJ0bkJnLnN0cm9rZSgpXG4gICAgICAgIGxlYXZlQnRuTm9kZS5wYXJlbnQgPSB3YWl0aW5nTm9kZVxuXG4gICAgICAgIHZhciBsZWF2ZUJ0bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICBsZWF2ZUJ0bkxhYmVsLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGVhdmVCdG5MYWJlbC5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciBsZWF2ZUxhYmVsID0gbGVhdmVCdG5MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxlYXZlTGFiZWwuc3RyaW5nID0gXCLnprvlvIDmiL/pl7RcIlxuICAgICAgICBsZWF2ZUxhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbGVhdmVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGxlYXZlQnRuTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KVxuICAgICAgICB2YXIgbGVhdmVPdXRsaW5lID0gbGVhdmVCdG5MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBsZWF2ZU91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigxMDAsIDMwLCAzMClcbiAgICAgICAgbGVhdmVPdXRsaW5lLndpZHRoID0gMlxuICAgICAgICBsZWF2ZUJ0bkxhYmVsLnBhcmVudCA9IGxlYXZlQnRuTm9kZVxuXG4gICAgICAgIGxlYXZlQnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZWF2ZUJ0bk5vZGUuc2NhbGUgPSAwLjk1XG4gICAgICAgIH0pXG4gICAgICAgIGxlYXZlQnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGVhdmVCdG5Ob2RlLnNjYWxlID0gMVxuICAgICAgICAgICAgc2VsZi5fbGVhdmVSb29tKClcbiAgICAgICAgfSlcbiAgICAgICAgbGVhdmVCdG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZWF2ZUJ0bk5vZGUuc2NhbGUgPSAxXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5fdXBkYXRlV2FpdGluZ0FuaW1hdGlvbigpXG4gICAgfSxcblxuICAgIF91cGRhdGVXYWl0aW5nVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMpIHJldHVyblxuXG4gICAgICAgIHZhciBjdXJyZW50UGxheWVycyA9IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoXG5cbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXJzID49IDMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0aW5nVUkoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVXYWl0aW5nQW5pbWF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIGlmICghdGhpcy5faXNXYWl0aW5nRm9yUGxheWVycyB8fCAhdGhpcy5fd2FpdGluZ1VJTm9kZSkgcmV0dXJuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlV2FpdGluZ0FuaW1hdGlvbigpXG4gICAgICAgIH0sIDEvNjApXG4gICAgfSxcbiAgICBcbiAgICBfaGlkZVdhaXRpbmdVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX3dhaXRpbmdVSU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdVSU5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB0aGlzLl93YWl0aW5nVUlOb2RlID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgX2xlYXZlUm9vbTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20pIHtcbiAgICAgICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQubGVhdmVSb29tKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5faGlkZVdhaXRpbmdVSSgpXG4gICAgICAgIHRoaXMuX2hpZGVBcmVuYUxvYWRpbmdVSSgpXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g44CQ5paw5aKe44CR56ue5oqA5Zy65Yqg6L2955WM6Z2iXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog5pi+56S656ue5oqA5Zy65Yqg6L2955WM6Z2iXG4gICAgICog5Zyo562J5b6FIFJPT01fSk9JTkVEIOa2iOaBr+aXtuaYvuekulxuICAgICAqL1xuICAgIF9zaG93QXJlbmFMb2FkaW5nVUk6IGZ1bmN0aW9uKG15Z2xvYmFsKSB7XG4gICAgICAgIC8vIOWmguaenOW3suWtmOWcqO+8jOS4jemHjeWkjeWIm+W7ulxuICAgICAgICBpZiAodGhpcy5fYXJlbmFMb2FkaW5nVUlOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5blsY/luZXlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKVxuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MFxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65Yqg6L2955WM6Z2i5a655ZmoXG4gICAgICAgIHZhciBsb2FkaW5nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQXJlbmFMb2FkaW5nVUlcIilcbiAgICAgICAgbG9hZGluZ05vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSlcbiAgICAgICAgbG9hZGluZ05vZGUuYW5jaG9yWCA9IDAuNVxuICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIGxvYWRpbmdOb2RlLnggPSAwXG4gICAgICAgIGxvYWRpbmdOb2RlLnkgPSAwXG4gICAgICAgIGxvYWRpbmdOb2RlLnpJbmRleCA9IDIwMDAgLy8g56Gu5L+d5Zyo6aG25bGCXG4gICAgICAgIGxvYWRpbmdOb2RlLnBhcmVudCA9IHRoaXMubm9kZVxuICAgICAgICB0aGlzLl9hcmVuYUxvYWRpbmdVSU5vZGUgPSBsb2FkaW5nTm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65Y2K6YCP5piO6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJhY2tncm91bmRcIilcbiAgICAgICAgYmdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpXG4gICAgICAgIGJnTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIGJnTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciBiZ0dyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYmdHcmFwaGljcy5maWxsQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAyMDApIC8vIOm7keiJsuWNiumAj+aYjlxuICAgICAgICBiZ0dyYXBoaWNzLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgYmdHcmFwaGljcy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGxvYWRpbmdOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rliqDovb3mj5DnpLrmloflrZdcbiAgICAgICAgdmFyIGxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0xhYmVsXCIpXG4gICAgICAgIGxhYmVsTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIGxhYmVsTm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5q2j5Zyo5Yqg6L295q+U6LWb5pWw5o2uLi4uXCJcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gMzZcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KVxuICAgICAgICB2YXIgb3V0bGluZSA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMCwgMCwgMClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IGxvYWRpbmdOb2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rliqDovb3liqjnlLvvvIjml4vovaznmoTngrnvvIlcbiAgICAgICAgdGhpcy5fbG9hZGluZ0RvdHMgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRvdE5vZGUgPSBuZXcgY2MuTm9kZShcIkRvdFwiICsgaSlcbiAgICAgICAgICAgIGRvdE5vZGUuYW5jaG9yWCA9IDAuNVxuICAgICAgICAgICAgZG90Tm9kZS5hbmNob3JZID0gMC41XG4gICAgICAgICAgICBkb3ROb2RlLnkgPSAtNjBcbiAgICAgICAgICAgIGRvdE5vZGUueCA9IChpIC0gMSkgKiAzMCAvLyDkuInkuKrngrnmsLTlubPmjpLliJdcbiAgICAgICAgICAgIHZhciBkb3RHcmFwaGljcyA9IGRvdE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICAgICAgZG90R3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgICAgIGRvdEdyYXBoaWNzLmNpcmNsZSgwLCAwLCA4KVxuICAgICAgICAgICAgZG90R3JhcGhpY3MuZmlsbCgpXG4gICAgICAgICAgICBkb3ROb2RlLnBhcmVudCA9IGxvYWRpbmdOb2RlXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nRG90cy5wdXNoKGRvdE5vZGUpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWQr+WKqOWKoOi9veWKqOeUu1xuICAgICAgICB0aGlzLl9zdGFydExvYWRpbmdBbmltYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtfc2hvd0FyZW5hTG9hZGluZ1VJXSDliqDovb3nlYzpnaLlt7LmmL7npLpcIilcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOmakOiXj+ernuaKgOWcuuWKoOi9veeVjOmdolxuICAgICAqL1xuICAgIF9oaWRlQXJlbmFMb2FkaW5nVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlgZzmraLliqDovb3liqjnlLtcbiAgICAgICAgdGhpcy5fc3RvcExvYWRpbmdBbmltYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgLy8g6ZSA5q+B5Yqg6L2955WM6Z2iXG4gICAgICAgIGlmICh0aGlzLl9hcmVuYUxvYWRpbmdVSU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZW5hTG9hZGluZ1VJTm9kZS5kZXN0cm95KClcbiAgICAgICAgICAgIHRoaXMuX2FyZW5hTG9hZGluZ1VJTm9kZSA9IG51bGxcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX2hpZGVBcmVuYUxvYWRpbmdVSV0g5Yqg6L2955WM6Z2i5bey6ZqQ6JePXCIpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOWQr+WKqOWKoOi9veWKqOeUu1xuICAgICAqL1xuICAgIF9zdGFydExvYWRpbmdBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdGhpcy5fbG9hZGluZ0FuaW1JbmRleCA9IDBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2xvYWRpbmdBbmltU2NoZWR1bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5fbG9hZGluZ0RvdHMgfHwgc2VsZi5fbG9hZGluZ0RvdHMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pu05paw54K555qE6YCP5piO5bqm77yM5b2i5oiQ5rOi5rWq5pWI5p6cXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuX2xvYWRpbmdEb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvdCA9IHNlbGYuX2xvYWRpbmdEb3RzW2ldXG4gICAgICAgICAgICAgICAgaWYgKGRvdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGhhc2UgPSAoc2VsZi5fbG9hZGluZ0FuaW1JbmRleCArIGkpICUgM1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9IHBoYXNlID09PSAwID8gMjU1IDogKHBoYXNlID09PSAxID8gMTUwIDogODApXG4gICAgICAgICAgICAgICAgICAgIGRvdC5vcGFjaXR5ID0gb3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICAvLyDmt7vliqDnvKnmlL7mlYjmnpxcbiAgICAgICAgICAgICAgICAgICAgZG90LnNjYWxlID0gcGhhc2UgPT09IDAgPyAxLjIgOiAxLjBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9sb2FkaW5nQW5pbUluZGV4ID0gKHNlbGYuX2xvYWRpbmdBbmltSW5kZXggKyAxKSAlIDNcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5q+PIDAuMyDnp5Lmm7TmlrDkuIDmrKHliqjnlLtcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLl9sb2FkaW5nQW5pbVNjaGVkdWxlLCAwLjMpXG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDlgZzmraLliqDovb3liqjnlLtcbiAgICAgKi9cbiAgICBfc3RvcExvYWRpbmdBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0FuaW1TY2hlZHVsZSkge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX2xvYWRpbmdBbmltU2NoZWR1bGUpXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nQW5pbVNjaGVkdWxlID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvYWRpbmdEb3RzID0gW11cbiAgICAgICAgdGhpcy5fbG9hZGluZ0FuaW1JbmRleCA9IDBcbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOOAkOaWsOWinuOAkea4uOaIj+eKtuaAgeaBouWkjeWkhOeQhlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWkhOeQhua4uOaIj+eKtuaAgeaBouWkjeS6i+S7tlxuICAgICAqL1xuICAgIF9vbkdhbWVTdGF0ZVJlc3RvcmVkOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75Yqg56m65YC85qOA5p+lXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJOb2RlTGlzdCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDnjqnlrrboioLngrnnmoTnirbmgIFcbiAgICAgICAgaWYgKGRhdGEucGxheWVycykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVTY3JpcHQgPSBub2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlU2NyaXB0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmn6Xmib7lr7nlupTnmoTnjqnlrrbmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0YS5wbGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHAgPSBkYXRhLnBsYXllcnNbal1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocC5pZCA9PT0gbm9kZVNjcmlwdC5hY2NvdW50aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw546p5a6254q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInBsYXllcl9zdGF0ZV91cGRhdGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHAuc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc19jb3VudDogcC5jYXJkc19jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzX2xhbmRsb3JkOiBwLmlzX2xhbmRsb3JkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol48gZ2FtZWJlZm9yZVVJXG4gICAgICAgIHZhciBnYW1lYmVmb3JlX25vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJnYW1lYmVmb3JlVUlcIilcbiAgICAgICAgaWYgKGdhbWViZWZvcmVfbm9kZSkge1xuICAgICAgICAgICAgZ2FtZWJlZm9yZV9ub2RlLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuiBnYW1laW5nVUlcbiAgICAgICAgdmFyIGdhbWVpbmdfbm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImdhbWVpbmdVSVwiKVxuICAgICAgICBpZiAoZ2FtZWluZ19ub2RlKSB7XG4gICAgICAgICAgICBnYW1laW5nX25vZGUuYWN0aXZlID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDlpITnkIbnjqnlrrbmjonnur/pgJrnn6VcbiAgICAgKi9cbiAgICBfb25QbGF5ZXJPZmZsaW5lOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75Yqg56m65YC85qOA5p+lXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJOb2RlTGlzdCkgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICAvLyDpgJrnn6XmiYDmnInnjqnlrrboioLngrnmm7TmlrDnirbmgIFcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGVTY3JpcHQgPSBub2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICAgICAgaWYgKG5vZGVTY3JpcHQgJiYgbm9kZVNjcmlwdC5hY2NvdW50aWQgPT09IGRhdGEucGxheWVyX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInBsYXllcl9zdGF0ZV91cGRhdGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IFwib2ZmbGluZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogZGF0YS50aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDlpITnkIbnjqnlrrbkuIrnur/pgJrnn6VcbiAgICAgKi9cbiAgICBfb25QbGF5ZXJPbmxpbmU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmt7vliqDnqbrlgLzmo4Dmn6VcbiAgICAgICAgaWYgKCF0aGlzLnBsYXllck5vZGVMaXN0KSByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIC8vIOmAmuefpeaJgOacieeOqeWutuiKgueCueabtOaWsOeKtuaAgVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZVNjcmlwdCA9IG5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgICAgICBpZiAobm9kZVNjcmlwdCAmJiBub2RlU2NyaXB0LmFjY291bnRpZCA9PT0gZGF0YS5wbGF5ZXJfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVyX3N0YXRlX3VwZGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogXCJvbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIl19