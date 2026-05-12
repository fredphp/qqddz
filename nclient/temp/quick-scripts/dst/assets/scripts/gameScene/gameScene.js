
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
  name: 'gameScene',
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
      if (this.playerNodeList.length >= 3) {
        this._hideWaitingUI();
      }
    }.bind(this));
    myglobal.socket.onPlayerReady(function (data) {
      for (var i = 0; i < this.playerNodeList.length; i++) {
        var node = this.playerNodeList[i];
        if (node) {
          node.emit("player_ready_notify", data);
        }
      }
    }.bind(this));
    myglobal.socket.onGameStart(function () {
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
  },
  setPlayerSeatPos: function setPlayerSeatPos(seat_index) {
    if (seat_index < 1 || seat_index > 3) {
      return;
    }
    switch (seat_index) {
      case 1:
        this.playerdata_list_pos[1] = 0;
        this.playerdata_list_pos[2] = 1;
        this.playerdata_list_pos[3] = 2;
        break;
      case 2:
        this.playerdata_list_pos[2] = 0;
        this.playerdata_list_pos[3] = 1;
        this.playerdata_list_pos[1] = 2;
        break;
      case 3:
        this.playerdata_list_pos[3] = 0;
        this.playerdata_list_pos[1] = 1;
        this.playerdata_list_pos[2] = 2;
        break;
      default:
        break;
    }
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
  start: function start() {},
  onDestroy: function onDestroy() {
    this._stopOnlineMonitoring();
  },
  getUserOutCardPosByAccount: function getUserOutCardPosByAccount(accountid) {
    if (!this.playerNodeList || !this.players_seat_pos) {
      console.error("playerNodeList 或 players_seat_pos 未初始化");
      return null;
    }
    for (var i = 0; i < this.playerNodeList.length; i++) {
      var node = this.playerNodeList[i];
      if (node) {
        var node_script = node.getComponent("player_node");
        if (node_script && node_script.accountid === accountid) {
          if (node_script.seat_index === undefined || node_script.seat_index === null) {
            console.error("无效的 seat_index");
            return null;
          }
          if (!this.players_seat_pos.children || !this.players_seat_pos.children[node_script.seat_index]) {
            console.error("座位节点不存在，seat_index:", node_script.seat_index);
            return null;
          }
          var seat_node = this.players_seat_pos.children[node_script.seat_index];
          var index_name = "cardsoutzone" + node_script.seat_index;
          var out_card_node = seat_node.getChildByName(index_name);
          return out_card_node;
        }
      }
    }
    return null;
  },
  _processRoomData: function _processRoomData(result, myglobal, isopen_sound) {
    console.log("🎮 [_processRoomData] 接收到的数据:", JSON.stringify(result));
    var seatid = result.seatindex || 1;
    this.playerdata_list_pos = [];
    this.setPlayerSeatPos(seatid);
    var playerdata_list = result.playerdata || [];
    var roomid = result.roomid || result.room_code || result.roomCode || "WAITING";

    // 🔧【新增】检查是否是竞技场模式
    var isArenaMode = result.room_category === 2;
    if (isArenaMode) {
      console.log("🏟️ [_processRoomData] 竞技场模式: room_category=2, playerdata数量=" + playerdata_list.length + ", 期号=" + result.period_no);
    }

    // 🔧【修复】保存房间类型到实例变量，供 player_node 使用
    this._roomCategory = result.room_category || 1;
    this._isArenaMode = isArenaMode;
    this._periodNo = result.period_no || ""; // 🔧【新增】保存期号

    this._playerdataList = playerdata_list;
    if (this.roomid_label) {
      this.roomid_label.string = "房间号:" + roomid;
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
    var gamebefore_node = this.node.getChildByName("gamebeforeUI");
    if (gamebefore_node) {
      gamebefore_node.active = true;
      gamebefore_node.zIndex = 1000;
      gamebefore_node.emit("init");
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
    cc.director.loadScene("hallScene");
  },
  // ============================================================
  // 【新增】游戏状态恢复处理
  // ============================================================

  /**
   * 处理游戏状态恢复事件
   */
  _onGameStateRestored: function _onGameStateRestored(data) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxnYW1lU2NlbmUuanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIkNvbXBvbmVudCIsIm5hbWUiLCJwcm9wZXJ0aWVzIiwiZGlfbGFiZWwiLCJMYWJlbCIsImJlaXNodV9sYWJlbCIsInJvb21pZF9sYWJlbCIsInBsYXllcl9ub2RlX3ByZWZhYnMiLCJQcmVmYWIiLCJwbGF5ZXJzX3NlYXRfcG9zIiwiTm9kZSIsIm9uTG9hZCIsIm15Z2xvYmFsIiwid2luZG93IiwiUm9vbVN0YXRlIiwiUk9PTV9JTlZBTElEIiwiaXNvcGVuX3NvdW5kIiwicGxheWVyRGF0YSIsInNvY2tldCIsImNvbnNvbGUiLCJlcnJvciIsIl93YWl0Rm9ySW5pdCIsIl9pbml0U2NlbmUiLCJfc3RhcnRPbmxpbmVNb25pdG9yaW5nIiwid2FybiIsInNlbGYiLCJfb25saW5lU3RhdHVzSGFuZGxlciIsImlzT25saW5lIiwiX3Nob3dPZmZsaW5lTWVzc2FnZSIsImFkZE9ubGluZVN0YXR1c0xpc3RlbmVyIiwiZXZlbnRsaXN0ZXIiLCJvbiIsImRhdGEiLCJfaGFuZGxlRm9yY2VMb2dvdXQiLCJyZWFzb24iLCJzdG9wT25saW5lTW9uaXRvcmluZyIsInNjaGVkdWxlT25jZSIsImFsZXJ0IiwiZGlyZWN0b3IiLCJsb2FkU2NlbmUiLCJfc3RvcE9ubGluZU1vbml0b3JpbmciLCJyZW1vdmVPbmxpbmVTdGF0dXNMaXN0ZW5lciIsImF0dGVtcHRzIiwibWF4QXR0ZW1wdHMiLCJjaGVja0luaXQiLCJzZXRUaW1lb3V0IiwicGxheWVyTm9kZUxpc3QiLCJib3R0b20iLCJyYXRlIiwic3RyaW5nIiwicm9vbXN0YXRlIiwiX2lzV2FpdGluZ0ZvclBsYXllcnMiLCJub2RlIiwiaSIsImxlbmd0aCIsImVtaXQiLCJiaW5kIiwib25Sb29tQ2hhbmdlU3RhdGUiLCJfaGlkZVdhaXRpbmdVSSIsImV2ZW50IiwiZ2FtZXVpX25vZGUiLCJnZXRDaGlsZEJ5TmFtZSIsImN1cnJlbnRSb29tQ29kZSIsImdldEN1cnJlbnRSb29tQ29kZSIsImlzSW5Sb29tIiwicm9vbURhdGEiLCJyb29taWQiLCJyb29tX2NvZGUiLCJzZWF0aW5kZXgiLCJwbGF5ZXJkYXRhIiwiYWNjb3VudGlkIiwicGxheWVySWQiLCJuaWNrX25hbWUiLCJuaWNrTmFtZSIsImF2YXRhclVybCIsImdvbGRfY291bnQiLCJnb2JhbF9jb3VudCIsImdvbGRjb3VudCIsImlzcmVhZHkiLCJfcHJvY2Vzc1Jvb21EYXRhIiwicmVxdWVzdF9lbnRlcl9yb29tIiwiZXJyIiwicmVzdWx0Iiwib25QbGF5ZXJKb2luUm9vbSIsImpvaW5fcGxheWVyZGF0YSIsImFkZFBsYXllck5vZGUiLCJfcGxheWVyZGF0YUxpc3QiLCJwdXNoIiwiX3Nob3dXYWl0aW5nVUkiLCJfY3VycmVudFJvb21Db2RlIiwib25QbGF5ZXJSZWFkeSIsIm9uR2FtZVN0YXJ0IiwiZ2FtZWJlZm9yZVVJIiwiYWN0aXZlIiwib25Sb2JTdGF0ZSIsImV2ZW50V2l0aFJvdW5kIiwiT2JqZWN0IiwiYXNzaWduIiwicm91bmQiLCJvbkJpZFJlc3VsdCIsIm9uQ2hhbmdlTWFzdGVyIiwibWFzdGVyX2FjY291bnRpZCIsIm9uUGxheVN0YXJ0IiwiUk9PTV9QTEFZSU5HIiwib25TaG93Qm90dG9tQ2FyZCIsIm9uUm9vbVJlc3RvcmVkIiwicmVzdG9yZWRSb29tRGF0YSIsInBsYXllcl9pZCIsInBsYXllcl9uYW1lIiwiX29uR2FtZVN0YXRlUmVzdG9yZWQiLCJvblBsYXllck9mZmxpbmUiLCJfb25QbGF5ZXJPZmZsaW5lIiwib25QbGF5ZXJPbmxpbmUiLCJfb25QbGF5ZXJPbmxpbmUiLCJzZXRQbGF5ZXJTZWF0UG9zIiwic2VhdF9pbmRleCIsInBsYXllcmRhdGFfbGlzdF9wb3MiLCJwbGF5ZXJfZGF0YSIsInBsYXllcm5vZGVfaW5zdCIsImluc3RhbnRpYXRlIiwicGFyZW50Iiwicm9vbV9jYXRlZ29yeSIsIl9yb29tQ2F0ZWdvcnkiLCJsb2ciLCJwZXJpb2Rfbm8iLCJfcGVyaW9kTm8iLCJpbmRleCIsInVuZGVmaW5lZCIsImNoaWxkcmVuIiwicG9zaXRpb24iLCJwbGF5ZXJOb2RlU2NyaXB0IiwiZ2V0Q29tcG9uZW50IiwiaW5pdF9kYXRhIiwic3RhcnQiLCJvbkRlc3Ryb3kiLCJnZXRVc2VyT3V0Q2FyZFBvc0J5QWNjb3VudCIsIm5vZGVfc2NyaXB0Iiwic2VhdF9ub2RlIiwiaW5kZXhfbmFtZSIsIm91dF9jYXJkX25vZGUiLCJKU09OIiwic3RyaW5naWZ5Iiwic2VhdGlkIiwicGxheWVyZGF0YV9saXN0Iiwicm9vbUNvZGUiLCJpc0FyZW5hTW9kZSIsIl9pc0FyZW5hTW9kZSIsImhvdXNlbWFuYWdlaWQiLCJjcmVhdG9yX2lkIiwiY3JlYXRvcklkIiwiZ2V0UGxheWVySW5mbyIsInBsYXllckluZm8iLCJhdWRpb0VuZ2luZSIsInN0b3BBbGwiLCJyZXNvdXJjZXMiLCJsb2FkIiwiQXVkaW9DbGlwIiwiY2xpcCIsInBsYXkiLCJnYW1lYmVmb3JlX25vZGUiLCJ6SW5kZXgiLCJuZWVkUGxheWVycyIsIl9uZWVkUGxheWVycyIsImNhbnZhcyIsIkNhbnZhcyIsImZpbmQiLCJzY3JlZW5IZWlnaHQiLCJkZXNpZ25SZXNvbHV0aW9uIiwiaGVpZ2h0Iiwic2NyZWVuV2lkdGgiLCJ3aWR0aCIsIndhaXRpbmdOb2RlIiwic2V0Q29udGVudFNpemUiLCJzaXplIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ4IiwieSIsIl93YWl0aW5nVUlOb2RlIiwicm9vbUluZm9Ob2RlIiwicm9vbUxhYmVsIiwiYWRkQ29tcG9uZW50IiwiZm9udFNpemUiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJMRUZUIiwiY29sb3IiLCJyb29tT3V0bGluZSIsIkxhYmVsT3V0bGluZSIsImxlYXZlQnRuTm9kZSIsImxlYXZlQnRuQmciLCJHcmFwaGljcyIsImZpbGxDb2xvciIsInJvdW5kUmVjdCIsImZpbGwiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsImxlYXZlQnRuTGFiZWwiLCJsZWF2ZUxhYmVsIiwiQ0VOVEVSIiwibGVhdmVPdXRsaW5lIiwiRXZlbnRUeXBlIiwiVE9VQ0hfU1RBUlQiLCJzY2FsZSIsIlRPVUNIX0VORCIsIl9sZWF2ZVJvb20iLCJUT1VDSF9DQU5DRUwiLCJfdXBkYXRlV2FpdGluZ0FuaW1hdGlvbiIsIl91cGRhdGVXYWl0aW5nVUkiLCJjdXJyZW50UGxheWVycyIsImRlc3Ryb3kiLCJsZWF2ZVJvb20iLCJwbGF5ZXJzIiwibm9kZVNjcmlwdCIsImoiLCJwIiwiaWQiLCJzdGF0ZSIsImNhcmRzX2NvdW50IiwiaXNfbGFuZGxvcmQiLCJnYW1laW5nX25vZGUiLCJ0aW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUEsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTCxXQUFTRCxFQUFFLENBQUNFLFNBQVM7RUFDckJDLElBQUksRUFBRSxXQUFXO0VBRWpCQyxVQUFVLEVBQUU7SUFDUkMsUUFBUSxFQUFFTCxFQUFFLENBQUNNLEtBQUs7SUFDbEJDLFlBQVksRUFBRVAsRUFBRSxDQUFDTSxLQUFLO0lBQ3RCRSxZQUFZLEVBQUVSLEVBQUUsQ0FBQ00sS0FBSztJQUN0QkcsbUJBQW1CLEVBQUVULEVBQUUsQ0FBQ1UsTUFBTTtJQUM5QkMsZ0JBQWdCLEVBQUVYLEVBQUUsQ0FBQ1k7RUFDekIsQ0FBQztFQUVEQyxNQUFNLFdBQUFBLE9BQUEsRUFBRztJQUVMLElBQUlDLFFBQVEsR0FBR0MsTUFBTSxDQUFDRCxRQUFRO0lBQzlCLElBQUlFLFNBQVMsR0FBR0QsTUFBTSxDQUFDQyxTQUFTLElBQUk7TUFBRUMsWUFBWSxFQUFFLENBQUM7SUFBRSxDQUFDO0lBQ3hELElBQUlDLFlBQVksR0FBR0gsTUFBTSxDQUFDRyxZQUFZLElBQUksQ0FBQztJQUUzQyxJQUFJLENBQUNKLFFBQVEsSUFBSSxDQUFDQSxRQUFRLENBQUNLLFVBQVUsSUFBSSxDQUFDTCxRQUFR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RTtRQUNOLElBQUlrSyxVQUFVLEdBQUdsSyxJQUFJLENBQUMrRSxZQUFZLENBQUMsYUFBYSxDQUFDO1FBQ2pELElBQUltRixVQUFVLElBQUlBLFVBQVUsQ0FBQ2hKLFNBQVMsS0FBS3RDLElBQUksQ0FBQzJFLFNBQVMsRUFBRTtVQUN2RHZELElBQUksQ0FBQ0csSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQzdCbUssS0FBSyxFQUFFLFNBQVM7WUFDaEJJLE9BQU8sRUFBRTlMLElBQUksQ0FBQzhMO1VBQ2xCLENBQUMsQ0FBQztVQUNGO1FBQ0o7TUFDSjtJQUNKO0VBQ0osQ0FBQztFQUVEO0FBQ0o7QUFDQTtFQUNJN0csZUFBZSxFQUFFLFNBQUFBLGdCQUFTakYsSUFBSSxFQUFFO0lBRTVCO0lBQ0EsS0FBSyxJQUFJcUIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1AsY0FBYyxDQUFDUSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO01BQ2pELElBQUlELElBQUksR0FBRyxJQUFJLENBQUNOLGNBQWMsQ0FBQ08sQ0FBQyxDQUFDO01BQ2pDLElBQUlELElBQUksRUFBRTtRQUNOLElBQUlrSyxVQUFVLEdBQUdsSyxJQUFJLENBQUMrRSxZQUFZLENBQUMsYUFBYSxDQUFDO1FBQ2pELElBQUltRixVQUFVLElBQUlBLFVBQVUsQ0FBQ2hKLFNBQVMsS0FBS3RDLElBQUksQ0FBQzJFLFNBQVMsRUFBRTtVQUN2RHZELElBQUksQ0FBQ0csSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQzdCbUssS0FBSyxFQUFFO1VBQ1gsQ0FBQyxDQUFDO1VBQ0Y7UUFDSjtNQUNKO0lBQ0o7RUFDSjtBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5L2/55So5YWo5bGA5Y+Y6YeP77yM5LiN5L2/55SoIHJlcXVpcmVcbi8vIOOAkOS/ruWkjeeJiOacrOOAkeeugOWMluWPkeeJjOmAu+i+ke+8jOS4jeWGjeS9v+eUqOWumuaXtuWZqOiwg+W6plxuLy8g5qC45b+D5Y6f5YiZ77yaXG4vLyAxLiBnYW1laW5nVUkuanMg6Ieq5bex5aSE55CG5Y+R54mM5Yqo55S7XG4vLyAyLiBnYW1lU2NlbmUuanMg5Y+q6LSf6LSj6L2s5Y+R5LqL5Lu257uZIHBsYXllcl9ub2RlXG4vLyAzLiDkuI3kvp3otZYgc2NoZWR1bGVPbmNlIOaOp+WItuWPkeeJjOiKguWlj1xuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuICAgIG5hbWU6ICdnYW1lU2NlbmUnLFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBkaV9sYWJlbDogY2MuTGFiZWwsXG4gICAgICAgIGJlaXNodV9sYWJlbDogY2MuTGFiZWwsXG4gICAgICAgIHJvb21pZF9sYWJlbDogY2MuTGFiZWwsXG4gICAgICAgIHBsYXllcl9ub2RlX3ByZWZhYnM6IGNjLlByZWZhYixcbiAgICAgICAgcGxheWVyc19zZWF0X3BvczogY2MuTm9kZSxcbiAgICB9LFxuXG4gICAgb25Mb2FkKCkge1xuICAgICAgICBcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIHZhciBSb29tU3RhdGUgPSB3aW5kb3cuUm9vbVN0YXRlIHx8IHsgUk9PTV9JTlZBTElEOiAtMSB9XG4gICAgICAgIHZhciBpc29wZW5fc291bmQgPSB3aW5kb3cuaXNvcGVuX3NvdW5kIHx8IDFcblxuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5wbGF5ZXJEYXRhIHx8ICFteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJnYW1lU2NlbmU6IG15Z2xvYmFs44CBcGxheWVyRGF0YSDmiJYgc29ja2V0IOacquWumuS5iVwiKVxuICAgICAgICAgICAgdGhpcy5fd2FpdEZvckluaXQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2luaXRTY2VuZShteWdsb2JhbCwgUm9vbVN0YXRlLCBpc29wZW5fc291bmQpXG4gICAgICAgIHRoaXMuX3N0YXJ0T25saW5lTW9uaXRvcmluZygpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOWcqOe6v+ebkea1i+WSjOWFtuS7luWKn+iDvVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3N0YXJ0T25saW5lTW9uaXRvcmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJnYW1lU2NlbmU6IG15Z2xvYmFsIOacquWumuS5ie+8jOaXoOazleWQr+WKqOWcqOe6v+ebkea1i1wiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdGhpcy5fb25saW5lU3RhdHVzSGFuZGxlciA9IGZ1bmN0aW9uKGlzT25saW5lKSB7XG4gICAgICAgICAgICBpZiAoIWlzT25saW5lKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd09mZmxpbmVNZXNzYWdlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG15Z2xvYmFsLmFkZE9ubGluZVN0YXR1c0xpc3RlbmVyKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5hZGRPbmxpbmVTdGF0dXNMaXN0ZW5lcih0aGlzLl9vbmxpbmVTdGF0dXNIYW5kbGVyKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwuZXZlbnRsaXN0ZXIpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLmV2ZW50bGlzdGVyLm9uKFwiZm9yY2VfbG9nb3V0XCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn5qrIOa4uOaIj+WcuuaZr+aUtuWIsOW8uuWItuS4i+e6v+S6i+S7tjpcIiwgZGF0YSlcbiAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVGb3JjZUxvZ291dChkYXRhKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX3Nob3dPZmZsaW5lTWVzc2FnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIvCfkpQg5ri45oiP5Zy65pmv77ya572R57uc6L+e5o6l5bey5pat5byAXCIpXG4gICAgfSxcbiAgICBcbiAgICBfaGFuZGxlRm9yY2VMb2dvdXQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYXNvbiA9IGRhdGEucmVhc29uIHx8IFwi5oKo5bey6KKr5by65Yi25LiL57q/XCJcbiAgICAgICAgY29uc29sZS53YXJuKFwi8J+aqyDmuLjmiI/lnLrmma/lvLrliLbkuIvnur86XCIsIHJlYXNvbilcbiAgICAgICAgXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc3RvcE9ubGluZU1vbml0b3JpbmcpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnN0b3BPbmxpbmVNb25pdG9yaW5nKClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhbGVydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFsZXJ0KHJlYXNvbiArIFwiXFxuXFxu6K+36YeN5paw55m75b2VXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJsb2dpblNjZW5lXCIpXG4gICAgICAgIH0sIDAuNSlcbiAgICB9LFxuICAgIFxuICAgIF9zdG9wT25saW5lTW9uaXRvcmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnJlbW92ZU9ubGluZVN0YXR1c0xpc3RlbmVyICYmIHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnJlbW92ZU9ubGluZVN0YXR1c0xpc3RlbmVyKHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIpXG4gICAgICAgICAgICB0aGlzLl9vbmxpbmVTdGF0dXNIYW5kbGVyID0gbnVsbFxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfd2FpdEZvckluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhdHRlbXB0cyA9IDA7XG4gICAgICAgIHZhciBtYXhBdHRlbXB0cyA9IDIwO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNoZWNrSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXR0ZW1wdHMrKztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnBsYXllckRhdGEgJiYgbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIFJvb21TdGF0ZSA9IHdpbmRvdy5Sb29tU3RhdGUgfHwgeyBST09NX0lOVkFMSUQ6IC0xIH07XG4gICAgICAgICAgICAgICAgdmFyIGlzb3Blbl9zb3VuZCA9IHdpbmRvdy5pc29wZW5fc291bmQgfHwgMTtcbiAgICAgICAgICAgICAgICBzZWxmLl9pbml0U2NlbmUobXlnbG9iYWwsIFJvb21TdGF0ZSwgaXNvcGVuX3NvdW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ZW1wdHMgPCBtYXhBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tJbml0LCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZ2FtZVNjZW5lIOWIneWni+WMlui2heaXtlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQoY2hlY2tJbml0LCAxMDApO1xuICAgIH0sXG4gICAgXG4gICAgX2luaXRTY2VuZTogZnVuY3Rpb24obXlnbG9iYWwsIFJvb21TdGF0ZSwgaXNvcGVuX3NvdW5kKSB7XG4gICAgICAgIHRoaXMucGxheWVyTm9kZUxpc3QgPSBbXVxuICAgICAgICBcbiAgICAgICAgdmFyIGJvdHRvbSA9IG15Z2xvYmFsLnBsYXllckRhdGEuYm90dG9tIHx8IDFcbiAgICAgICAgdmFyIHJhdGUgPSBteWdsb2JhbC5wbGF5ZXJEYXRhLnJhdGUgfHwgMVxuICAgICAgICBcbiAgICAgICAgdGhpcy5kaV9sYWJlbC5zdHJpbmcgPSBcIuW6lTpcIiArIGJvdHRvbVxuICAgICAgICB0aGlzLmJlaXNodV9sYWJlbC5zdHJpbmcgPSBcIuWAjeaVsDpcIiArIHJhdGVcbiAgICAgICAgdGhpcy5yb29tc3RhdGUgPSBSb29tU3RhdGUuUk9PTV9JTlZBTElEXG4gICAgICAgIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMgPSBmYWxzZVxuXG5cbiAgICAgICAgLy8g55uR5ZCs77yM57uZ5YW25LuW546p5a625Y+R54mMKOWGhemDqOS6i+S7tilcbiAgICAgICAgLy8g44CQ5qC45b+D44CRcGxheWVyX25vZGUg55u05o6l5pi+56S6IDE3IOW8oOeJjOiDjO+8jOS4jeWGjemAkOW8oOWKqOeUu1xuICAgICAgICB0aGlzLm5vZGUub24oXCJwdXNoY2FyZF9vdGhlcl9ldmVudFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcInB1c2hfY2FyZF9ldmVudFwiKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIC8vIOebkeWQrOaIv+mXtOeKtuaAgeaUueWPmOS6i+S7tlxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25Sb29tQ2hhbmdlU3RhdGUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5yb29tc3RhdGUgPSBkYXRhXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkYXRhICE9PSBSb29tU3RhdGUuUk9PTV9JTlZBTElEICYmIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlV2FpdGluZ1VJKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHRoaXMubm9kZS5vbihcImNhbnJvYl9ldmVudFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVybm9kZV9jYW5yb2JfZXZlbnRcIiwgZXZlbnQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKFwiY2hvb3NlX2NhcmRfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBnYW1ldWlfbm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImdhbWVpbmdVSVwiKVxuICAgICAgICAgICAgaWYgKGdhbWV1aV9ub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdhbWV1aV9ub2RlLmVtaXQoXCJjaG9vc2VfY2FyZF9ldmVudFwiLCBldmVudClcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHRoaXMubm9kZS5vbihcInVuY2hvb3NlX2NhcmRfZXZlbnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBnYW1ldWlfbm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImdhbWVpbmdVSVwiKVxuICAgICAgICAgICAgaWYgKGdhbWV1aV9ub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdhbWV1aV9ub2RlLmVtaXQoXCJ1bmNob29zZV9jYXJkX2V2ZW50XCIsIGV2ZW50KVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgdmFyIGN1cnJlbnRSb29tQ29kZSA9IG15Z2xvYmFsLnNvY2tldC5nZXRDdXJyZW50Um9vbUNvZGUoKVxuICAgICAgICB2YXIgaXNJblJvb20gPSBteWdsb2JhbC5zb2NrZXQuaXNJblJvb20oKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHZhciByb29tRGF0YSA9IG15Z2xvYmFsLnJvb21EYXRhXG4gICAgICAgIFxuICAgICAgICBpZiAoaXNJblJvb20gJiYgY3VycmVudFJvb21Db2RlICYmICFyb29tRGF0YSkge1xuICAgICAgICAgICAgcm9vbURhdGEgPSB7XG4gICAgICAgICAgICAgICAgcm9vbWlkOiBjdXJyZW50Um9vbUNvZGUsXG4gICAgICAgICAgICAgICAgcm9vbV9jb2RlOiBjdXJyZW50Um9vbUNvZGUsXG4gICAgICAgICAgICAgICAgc2VhdGluZGV4OiAxLFxuICAgICAgICAgICAgICAgIHBsYXllcmRhdGE6IFt7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRpZDogbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50aWQgfHwgbXlnbG9iYWwucGxheWVyRGF0YS5wbGF5ZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgbmlja19uYW1lOiBteWdsb2JhbC5wbGF5ZXJEYXRhLm5pY2tOYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IFwiYXZhdGFyXzFcIixcbiAgICAgICAgICAgICAgICAgICAgZ29sZF9jb3VudDogbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCB8fCAxMDAwLCAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55SoIGdvbGRfY291bnQg5a2X5q61XG4gICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCB8fCAxMDAwLCAgLy8g5YW85a655pen5a6i5oi356uvXG4gICAgICAgICAgICAgICAgICAgIHNlYXRpbmRleDogMSxcbiAgICAgICAgICAgICAgICAgICAgaXNyZWFkeTogdHJ1ZVxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChyb29tRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc1Jvb21EYXRhKHJvb21EYXRhLCBteWdsb2JhbCwgaXNvcGVuX3NvdW5kKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3RfZW50ZXJfcm9vbSh7fSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyICE9IDApIHtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm9jZXNzUm9vbURhdGEocmVzdWx0LCBteWdsb2JhbCwgaXNvcGVuX3NvdW5kKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgfVxuXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXllckpvaW5Sb29tKGZ1bmN0aW9uKGpvaW5fcGxheWVyZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5hZGRQbGF5ZXJOb2RlKGpvaW5fcGxheWVyZGF0YSlcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl9wbGF5ZXJkYXRhTGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXllcmRhdGFMaXN0ID0gW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3BsYXllcmRhdGFMaXN0LnB1c2goam9pbl9wbGF5ZXJkYXRhKVxuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNXYWl0aW5nRm9yUGxheWVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dXYWl0aW5nVUkoMyAtIHRoaXMuX3BsYXllcmRhdGFMaXN0Lmxlbmd0aCwgdGhpcy5fY3VycmVudFJvb21Db2RlKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0aW5nVUkoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUGxheWVyUmVhZHkoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVyX3JlYWR5X25vdGlmeVwiLCBkYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkdhbWVTdGFydChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZW1pdChcImdhbWVzdGFydF9ldmVudFwiKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGdhbWViZWZvcmVVSSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImdhbWViZWZvcmVVSVwiKVxuICAgICAgICAgICAgaWYgKGdhbWViZWZvcmVVSSkge1xuICAgICAgICAgICAgICAgIGdhbWViZWZvcmVVSS5hY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUm9iU3RhdGUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmt7vliqAgcm91bmQg5a2X5q6177yM5Yy65YiG5Y+r5Zyw5Li75ZKM5oqi5Zyw5Li7XG4gICAgICAgICAgICB2YXIgZXZlbnRXaXRoUm91bmQgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudCwgeyByb3VuZDogMiB9KVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVybm9kZV9yb2Jfc3RhdGVfZXZlbnRcIiwgZXZlbnRXaXRoUm91bmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5Y+r5Zyw5Li757uT5p6c77yI56ys5LiA6L2u77yJXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vbkJpZFJlc3VsdChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkea3u+WKoCByb3VuZCDlrZfmrrXvvIzljLrliIblj6vlnLDkuLvlkozmiqLlnLDkuLtcbiAgICAgICAgICAgIHZhciBldmVudFdpdGhSb3VuZCA9IE9iamVjdC5hc3NpZ24oe30sIGV2ZW50LCB7IHJvdW5kOiAxIH0pXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmVtaXQoXCJwbGF5ZXJub2RlX3JvYl9zdGF0ZV9ldmVudFwiLCBldmVudFdpdGhSb3VuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25DaGFuZ2VNYXN0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEubWFzdGVyX2FjY291bnRpZCA9IGV2ZW50XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmVtaXQoXCJwbGF5ZXJub2RlX2NoYW5nZW1hc3Rlcl9ldmVudFwiLCBldmVudClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55uR5ZCs5Ye654mM6Zi25q615byA5aeLXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXlTdGFydChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyDorr7nva7miL/pl7TnirbmgIHkuLrlh7rniYzpmLbmrrVcbiAgICAgICAgICAgIHRoaXMucm9vbXN0YXRlID0gUm9vbVN0YXRlLlJPT01fUExBWUlOR1xuICAgICAgICB9LmJpbmQodGhpcykpXG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKFwidXBkYXRlX2NhcmRfY291bnRfZXZlbnRcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllck5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwidXBkYXRlX2NhcmRfY291bnRfZXZlbnRcIiwgZGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICBteWdsb2JhbC5zb2NrZXQub25TaG93Qm90dG9tQ2FyZChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGdhbWV1aV9ub2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWluZ1VJXCIpXG4gICAgICAgICAgICBpZiAoZ2FtZXVpX25vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2FtZXVpX25vZGUuZW1pdChcInNob3dfYm90dG9tX2NhcmRfZXZlbnRcIiwgZXZlbnQpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblJvb21SZXN0b3JlZChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5yb29tX2NvZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdG9yZWRSb29tRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbWlkOiBkYXRhLnJvb21fY29kZSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9jb2RlOiBkYXRhLnJvb21fY29kZSxcbiAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiAxLFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudGlkOiBkYXRhLnBsYXllcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5pY2tfbmFtZTogZGF0YS5wbGF5ZXJfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogXCJhdmF0YXJfMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZF9jb3VudDogZGF0YS5nb2xkX2NvdW50IHx8IDEwMDAsIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKggZ29sZF9jb3VudCDlrZfmrrVcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogZGF0YS5nb2xkX2NvdW50IHx8IDEwMDAsICAvLyDlhbzlrrnml6flrqLmiLfnq69cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXRpbmRleDogMVxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jZXNzUm9vbURhdGEocmVzdG9yZWRSb29tRGF0YSwgbXlnbG9iYWwsIGlzb3Blbl9zb3VuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5paw5aKe44CR55uR5ZCs5ri45oiP54q25oCB5oGi5aSN5LqL5Lu2XG4gICAgICAgIHRoaXMubm9kZS5vbihcImdhbWVfc3RhdGVfcmVzdG9yZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fb25HYW1lU3RhdGVSZXN0b3JlZChkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgICAgICAvLyDjgJDmlrDlop7jgJHnm5HlkKznjqnlrrbmjonnur/pgJrnn6VcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUGxheWVyT2ZmbGluZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXllck9mZmxpbmUoZGF0YSlcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICBcbiAgICAgICAgLy8g44CQ5paw5aKe44CR55uR5ZCs546p5a625LiK57q/6YCa55+lXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5vblBsYXllck9ubGluZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLl9vblBsYXllck9ubGluZShkYXRhKVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBzZXRQbGF5ZXJTZWF0UG9zKHNlYXRfaW5kZXgpIHtcbiAgICAgICAgaWYgKHNlYXRfaW5kZXggPCAxIHx8IHNlYXRfaW5kZXggPiAzKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgc3dpdGNoIChzZWF0X2luZGV4KSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzFdID0gMFxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1syXSA9IDFcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbM10gPSAyXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbMl0gPSAwXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzNdID0gMVxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1sxXSA9IDJcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3Bvc1szXSA9IDBcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbMV0gPSAxXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJkYXRhX2xpc3RfcG9zWzJdID0gMlxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkUGxheWVyTm9kZShwbGF5ZXJfZGF0YSkge1xuXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJfbm9kZV9wcmVmYWJzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwicGxheWVyX25vZGVfcHJlZmFicyDmnKrnu5HlrprvvIFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucGxheWVyc19zZWF0X3Bvcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInBsYXllcnNfc2VhdF9wb3Mg5pyq57uR5a6a77yBXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBsYXllcm5vZGVfaW5zdCA9IGNjLmluc3RhbnRpYXRlKHRoaXMucGxheWVyX25vZGVfcHJlZmFicyk7XG4gICAgICAgIGlmICghcGxheWVybm9kZV9pbnN0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5rOV5a6e5L6L5YyWIHBsYXllcl9ub2RlX3ByZWZhYnNcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwbGF5ZXJub2RlX2luc3QucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICB0aGlzLnBsYXllck5vZGVMaXN0LnB1c2gocGxheWVybm9kZV9pbnN0KTtcblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5bCG5oi/6Ze057G75Z6L5Lyg6YCS57uZIHBsYXllcl9ub2Rl77yI55So5LqO5Yy65YiG5pmu6YCa5Zy65ZKM56ue5oqA5Zy677yJXG4gICAgICAgIGlmICghcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSkge1xuICAgICAgICAgICAgcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSA9IHRoaXMuX3Jvb21DYXRlZ29yeSB8fCAxXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW2FkZFBsYXllck5vZGVdIOiuvue9riBwbGF5ZXJfZGF0YS5yb29tX2NhdGVnb3J5ID1cIiwgcGxheWVyX2RhdGEucm9vbV9jYXRlZ29yeSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlsIbmnJ/lj7fkvKDpgJLnu5kgcGxheWVyX25vZGVcbiAgICAgICAgaWYgKCFwbGF5ZXJfZGF0YS5wZXJpb2Rfbm8gJiYgdGhpcy5fcGVyaW9kTm8pIHtcbiAgICAgICAgICAgIHBsYXllcl9kYXRhLnBlcmlvZF9ubyA9IHRoaXMuX3BlcmlvZE5vXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnBsYXllcmRhdGFfbGlzdF9wb3NbcGxheWVyX2RhdGEuc2VhdGluZGV4XTtcbiAgICAgICAgXG4gICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkIHx8IGluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5pWI55qE5bqn5L2N57Si5byVOlwiLCBwbGF5ZXJfZGF0YS5zZWF0aW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlbiB8fCAhdGhpcy5wbGF5ZXJzX3NlYXRfcG9zLmNoaWxkcmVuW2luZGV4XSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuW6p+S9jeiKgueCueS4jeWtmOWcqO+8jGluZGV4OlwiLCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHBsYXllcm5vZGVfaW5zdC5wb3NpdGlvbiA9IHRoaXMucGxheWVyc19zZWF0X3Bvcy5jaGlsZHJlbltpbmRleF0ucG9zaXRpb247XG4gICAgICAgIFxuICAgICAgICB2YXIgcGxheWVyTm9kZVNjcmlwdCA9IHBsYXllcm5vZGVfaW5zdC5nZXRDb21wb25lbnQoXCJwbGF5ZXJfbm9kZVwiKTtcbiAgICAgICAgaWYgKCFwbGF5ZXJOb2RlU2NyaXB0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5peg5rOV6I635Y+WIHBsYXllcl9ub2RlIOe7hOS7tlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcGxheWVyTm9kZVNjcmlwdC5pbml0X2RhdGEocGxheWVyX2RhdGEsIGluZGV4KTtcbiAgICB9LFxuXG4gICAgc3RhcnQoKSB7XG4gICAgfSxcblxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3N0b3BPbmxpbmVNb25pdG9yaW5nKClcbiAgICB9LFxuXG4gICAgZ2V0VXNlck91dENhcmRQb3NCeUFjY291bnQoYWNjb3VudGlkKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMucGxheWVyTm9kZUxpc3QgfHwgIXRoaXMucGxheWVyc19zZWF0X3Bvcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInBsYXllck5vZGVMaXN0IOaIliBwbGF5ZXJzX3NlYXRfcG9zIOacquWIneWni+WMllwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZV9zY3JpcHQgPSBub2RlLmdldENvbXBvbmVudChcInBsYXllcl9ub2RlXCIpXG4gICAgICAgICAgICAgICAgaWYgKG5vZGVfc2NyaXB0ICYmIG5vZGVfc2NyaXB0LmFjY291bnRpZCA9PT0gYWNjb3VudGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlX3NjcmlwdC5zZWF0X2luZGV4ID09PSB1bmRlZmluZWQgfHwgbm9kZV9zY3JpcHQuc2VhdF9pbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuaXoOaViOeahCBzZWF0X2luZGV4XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5wbGF5ZXJzX3NlYXRfcG9zLmNoaWxkcmVuIHx8ICF0aGlzLnBsYXllcnNfc2VhdF9wb3MuY2hpbGRyZW5bbm9kZV9zY3JpcHQuc2VhdF9pbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLluqfkvY3oioLngrnkuI3lrZjlnKjvvIxzZWF0X2luZGV4OlwiLCBub2RlX3NjcmlwdC5zZWF0X2luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VhdF9ub2RlID0gdGhpcy5wbGF5ZXJzX3NlYXRfcG9zLmNoaWxkcmVuW25vZGVfc2NyaXB0LnNlYXRfaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleF9uYW1lID0gXCJjYXJkc291dHpvbmVcIiArIG5vZGVfc2NyaXB0LnNlYXRfaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dF9jYXJkX25vZGUgPSBzZWF0X25vZGUuZ2V0Q2hpbGRCeU5hbWUoaW5kZXhfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dF9jYXJkX25vZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG4gICAgXG4gICAgX3Byb2Nlc3NSb29tRGF0YTogZnVuY3Rpb24ocmVzdWx0LCBteWdsb2JhbCwgaXNvcGVuX3NvdW5kKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW19wcm9jZXNzUm9vbURhdGFdIOaOpeaUtuWIsOeahOaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSlcbiAgICAgICAgXG4gICAgICAgIHZhciBzZWF0aWQgPSByZXN1bHQuc2VhdGluZGV4IHx8IDFcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGxheWVyZGF0YV9saXN0X3BvcyA9IFtdXG4gICAgICAgIHRoaXMuc2V0UGxheWVyU2VhdFBvcyhzZWF0aWQpXG5cbiAgICAgICAgdmFyIHBsYXllcmRhdGFfbGlzdCA9IHJlc3VsdC5wbGF5ZXJkYXRhIHx8IFtdXG4gICAgICAgIHZhciByb29taWQgPSByZXN1bHQucm9vbWlkIHx8IHJlc3VsdC5yb29tX2NvZGUgfHwgcmVzdWx0LnJvb21Db2RlIHx8IFwiV0FJVElOR1wiXG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeajgOafpeaYr+WQpuaYr+ernuaKgOWcuuaooeW8j1xuICAgICAgICB2YXIgaXNBcmVuYU1vZGUgPSByZXN1bHQucm9vbV9jYXRlZ29yeSA9PT0gMlxuICAgICAgICBpZiAoaXNBcmVuYU1vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX3Byb2Nlc3NSb29tRGF0YV0g56ue5oqA5Zy65qih5byPOiByb29tX2NhdGVnb3J5PTIsIHBsYXllcmRhdGHmlbDph489XCIgKyBwbGF5ZXJkYXRhX2xpc3QubGVuZ3RoICsgXCIsIOacn+WPtz1cIiArIHJlc3VsdC5wZXJpb2Rfbm8pXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5L+d5a2Y5oi/6Ze057G75Z6L5Yiw5a6e5L6L5Y+Y6YeP77yM5L6bIHBsYXllcl9ub2RlIOS9v+eUqFxuICAgICAgICB0aGlzLl9yb29tQ2F0ZWdvcnkgPSByZXN1bHQucm9vbV9jYXRlZ29yeSB8fCAxXG4gICAgICAgIHRoaXMuX2lzQXJlbmFNb2RlID0gaXNBcmVuYU1vZGVcbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSByZXN1bHQucGVyaW9kX25vIHx8IFwiXCIgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOacn+WPt1xuXG4gICAgICAgIHRoaXMuX3BsYXllcmRhdGFMaXN0ID0gcGxheWVyZGF0YV9saXN0XG5cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnJvb21pZF9sYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5yb29taWRfbGFiZWwuc3RyaW5nID0gXCLmiL/pl7Tlj7c6XCIgKyByb29taWRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn46uIFvmuLjmiI/lnLrmma9dIHJvb21pZF9sYWJlbCDmnKrnu5HlrprvvIFcIilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5ob3VzZW1hbmFnZWlkID0gcmVzdWx0LmhvdXNlbWFuYWdlaWQgfHwgcmVzdWx0LmNyZWF0b3JfaWQgfHwgcmVzdWx0LmNyZWF0b3JJZCB8fCBcIlwiXG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVySW5mbyA9IG15Z2xvYmFsLnNvY2tldC5nZXRQbGF5ZXJJbmZvKClcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVyZGF0YV9saXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfjq4gW19wcm9jZXNzUm9vbURhdGFdIOa3u+WKoOeOqeWutuiKgueCuTogXCIgKyBKU09OLnN0cmluZ2lmeShwbGF5ZXJkYXRhX2xpc3RbaV0pKVxuICAgICAgICAgICAgdGhpcy5hZGRQbGF5ZXJOb2RlKHBsYXllcmRhdGFfbGlzdFtpXSlcbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICBpZiAoaXNvcGVuX3NvdW5kKSB7XG4gICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5zdG9wQWxsKClcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwic291bmQvYmdcIiwgY2MuQXVkaW9DbGlwLCBmdW5jdGlvbihlcnIsIGNsaXApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5KGNsaXAsIHRydWUsIDEpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgZ2FtZWJlZm9yZV9ub2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWJlZm9yZVVJXCIpXG4gICAgICAgIGlmIChnYW1lYmVmb3JlX25vZGUpIHtcbiAgICAgICAgICAgIGdhbWViZWZvcmVfbm9kZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICBnYW1lYmVmb3JlX25vZGUuekluZGV4ID0gMTAwMFxuICAgICAgICAgICAgZ2FtZWJlZm9yZV9ub2RlLmVtaXQoXCJpbml0XCIpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHnq57mioDlnLrmqKHlvI/kuIvkuI3mmL7npLrnrYnlvoXnjqnlrrZVSe+8iOaJgOacieeOqeWutuW3suWIhumFjeWlve+8iVxuICAgICAgICBpZiAoaXNBcmVuYU1vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbX3Byb2Nlc3NSb29tRGF0YV0g56ue5oqA5Zy65qih5byP77ya5LiN5pi+56S6562J5b6F546p5a62VUlcIilcbiAgICAgICAgICAgIC8vIOernuaKgOWcuuaooeW8j+S4i+aJgOacieeOqeWutuW6lOivpeW3sue7j+WHhuWkh+Wlve+8jOebtOaOpeetieW+hea4uOaIj+W8gOWni1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXllcmRhdGFfbGlzdC5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93V2FpdGluZ1VJKDMgLSBwbGF5ZXJkYXRhX2xpc3QubGVuZ3RoLCByb29taWQpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF9zaG93V2FpdGluZ1VJOiBmdW5jdGlvbihuZWVkUGxheWVycywgcm9vbUNvZGUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMgPSB0cnVlXG4gICAgICAgIHRoaXMuX25lZWRQbGF5ZXJzID0gbmVlZFBsYXllcnNcbiAgICAgICAgdGhpcy5fY3VycmVudFJvb21Db2RlID0gcm9vbUNvZGUgfHwgXCJcIlxuXG5cbiAgICAgICAgdGhpcy5faGlkZVdhaXRpbmdVSSgpXG5cbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKVxuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MFxuXG4gICAgICAgIHZhciB3YWl0aW5nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiV2FpdGluZ0ZvclBsYXllcnNVSVwiKVxuICAgICAgICB3YWl0aW5nTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKVxuICAgICAgICB3YWl0aW5nTm9kZS5hbmNob3JYID0gMC41XG4gICAgICAgIHdhaXRpbmdOb2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgd2FpdGluZ05vZGUueCA9IDBcbiAgICAgICAgd2FpdGluZ05vZGUueSA9IDBcbiAgICAgICAgd2FpdGluZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX3dhaXRpbmdVSU5vZGUgPSB3YWl0aW5nTm9kZVxuXG4gICAgICAgIGlmIChyb29tQ29kZSkge1xuICAgICAgICAgICAgdmFyIHJvb21JbmZvTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUm9vbUluZm9cIilcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS54ID0gLXNjcmVlbldpZHRoLzIgKyAyMFxuICAgICAgICAgICAgcm9vbUluZm9Ob2RlLnkgPSBzY3JlZW5IZWlnaHQvMiAtIDMwXG4gICAgICAgICAgICByb29tSW5mb05vZGUuYW5jaG9yWCA9IDBcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS5hbmNob3JZID0gMC41XG5cbiAgICAgICAgICAgIHZhciByb29tTGFiZWwgPSByb29tSW5mb05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgcm9vbUxhYmVsLnN0cmluZyA9IFwi5oi/6Ze05Y+3OiBcIiArIHJvb21Db2RlXG4gICAgICAgICAgICByb29tTGFiZWwuZm9udFNpemUgPSAyNFxuICAgICAgICAgICAgcm9vbUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5MRUZUXG4gICAgICAgICAgICByb29tSW5mb05vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMClcblxuICAgICAgICAgICAgdmFyIHJvb21PdXRsaW5lID0gcm9vbUluZm9Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgICAgICByb29tT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApXG4gICAgICAgICAgICByb29tT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgICAgIHJvb21JbmZvTm9kZS5wYXJlbnQgPSB3YWl0aW5nTm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlYXZlQnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGVhdmVCdG5cIilcbiAgICAgICAgbGVhdmVCdG5Ob2RlLnggPSBzY3JlZW5XaWR0aC8yIC0gMTAwXG4gICAgICAgIGxlYXZlQnRuTm9kZS55ID0gLXNjcmVlbkhlaWdodC8yICsgNTBcbiAgICAgICAgbGVhdmVCdG5Ob2RlLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGVhdmVCdG5Ob2RlLmFuY2hvclkgPSAwLjVcbiAgICAgICAgbGVhdmVCdG5Ob2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTQwLCA0MCkpXG5cbiAgICAgICAgdmFyIGxlYXZlQnRuQmcgPSBsZWF2ZUJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBsZWF2ZUJ0bkJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDE4MCwgNjAsIDYwLCAyMzApXG4gICAgICAgIGxlYXZlQnRuQmcucm91bmRSZWN0KC03MCwgLTIwLCAxNDAsIDQwLCA4KVxuICAgICAgICBsZWF2ZUJ0bkJnLmZpbGwoKVxuICAgICAgICBsZWF2ZUJ0bkJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjIwLCAxMDAsIDEwMClcbiAgICAgICAgbGVhdmVCdG5CZy5saW5lV2lkdGggPSAyXG4gICAgICAgIGxlYXZlQnRuQmcucm91bmRSZWN0KC03MCwgLTIwLCAxNDAsIDQwLCA4KVxuICAgICAgICBsZWF2ZUJ0bkJnLnN0cm9rZSgpXG4gICAgICAgIGxlYXZlQnRuTm9kZS5wYXJlbnQgPSB3YWl0aW5nTm9kZVxuXG4gICAgICAgIHZhciBsZWF2ZUJ0bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICBsZWF2ZUJ0bkxhYmVsLmFuY2hvclggPSAwLjVcbiAgICAgICAgbGVhdmVCdG5MYWJlbC5hbmNob3JZID0gMC41XG4gICAgICAgIHZhciBsZWF2ZUxhYmVsID0gbGVhdmVCdG5MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxlYXZlTGFiZWwuc3RyaW5nID0gXCLnprvlvIDmiL/pl7RcIlxuICAgICAgICBsZWF2ZUxhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgbGVhdmVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGxlYXZlQnRuTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KVxuICAgICAgICB2YXIgbGVhdmVPdXRsaW5lID0gbGVhdmVCdG5MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBsZWF2ZU91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigxMDAsIDMwLCAzMClcbiAgICAgICAgbGVhdmVPdXRsaW5lLndpZHRoID0gMlxuICAgICAgICBsZWF2ZUJ0bkxhYmVsLnBhcmVudCA9IGxlYXZlQnRuTm9kZVxuXG4gICAgICAgIGxlYXZlQnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZWF2ZUJ0bk5vZGUuc2NhbGUgPSAwLjk1XG4gICAgICAgIH0pXG4gICAgICAgIGxlYXZlQnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGVhdmVCdG5Ob2RlLnNjYWxlID0gMVxuICAgICAgICAgICAgc2VsZi5fbGVhdmVSb29tKClcbiAgICAgICAgfSlcbiAgICAgICAgbGVhdmVCdG5Ob2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZWF2ZUJ0bk5vZGUuc2NhbGUgPSAxXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5fdXBkYXRlV2FpdGluZ0FuaW1hdGlvbigpXG4gICAgfSxcblxuICAgIF91cGRhdGVXYWl0aW5nVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMpIHJldHVyblxuXG4gICAgICAgIHZhciBjdXJyZW50UGxheWVycyA9IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoXG5cbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXJzID49IDMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0aW5nVUkoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVXYWl0aW5nQW5pbWF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIGlmICghdGhpcy5faXNXYWl0aW5nRm9yUGxheWVycyB8fCAhdGhpcy5fd2FpdGluZ1VJTm9kZSkgcmV0dXJuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlV2FpdGluZ0FuaW1hdGlvbigpXG4gICAgICAgIH0sIDEvNjApXG4gICAgfSxcbiAgICBcbiAgICBfaGlkZVdhaXRpbmdVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzV2FpdGluZ0ZvclBsYXllcnMgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX3dhaXRpbmdVSU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdVSU5vZGUuZGVzdHJveSgpXG4gICAgICAgICAgICB0aGlzLl93YWl0aW5nVUlOb2RlID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgX2xlYXZlUm9vbTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldC5sZWF2ZVJvb20pIHtcbiAgICAgICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQubGVhdmVSb29tKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5faGlkZVdhaXRpbmdVSSgpXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g44CQ5paw5aKe44CR5ri45oiP54q25oCB5oGi5aSN5aSE55CGXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog5aSE55CG5ri45oiP54q25oCB5oGi5aSN5LqL5Lu2XG4gICAgICovXG4gICAgX29uR2FtZVN0YXRlUmVzdG9yZWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOeOqeWutuiKgueCueeahOeKtuaAgVxuICAgICAgICBpZiAoZGF0YS5wbGF5ZXJzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucGxheWVyTm9kZUxpc3RbaV1cbiAgICAgICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVNjcmlwdCA9IG5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOafpeaJvuWvueW6lOeahOeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRhLnBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcCA9IGRhdGEucGxheWVyc1tqXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLmlkID09PSBub2RlU2NyaXB0LmFjY291bnRpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDnjqnlrrbnirbmgIFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVyX3N0YXRlX3VwZGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogcC5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzX2NvdW50OiBwLmNhcmRzX2NvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfbGFuZGxvcmQ6IHAuaXNfbGFuZGxvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXjyBnYW1lYmVmb3JlVUlcbiAgICAgICAgdmFyIGdhbWViZWZvcmVfbm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImdhbWViZWZvcmVVSVwiKVxuICAgICAgICBpZiAoZ2FtZWJlZm9yZV9ub2RlKSB7XG4gICAgICAgICAgICBnYW1lYmVmb3JlX25vZGUuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S6IGdhbWVpbmdVSVxuICAgICAgICB2YXIgZ2FtZWluZ19ub2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiZ2FtZWluZ1VJXCIpXG4gICAgICAgIGlmIChnYW1laW5nX25vZGUpIHtcbiAgICAgICAgICAgIGdhbWVpbmdfbm9kZS5hY3RpdmUgPSB0cnVlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOWkhOeQhueOqeWutuaOiee6v+mAmuefpVxuICAgICAqL1xuICAgIF9vblBsYXllck9mZmxpbmU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOmAmuefpeaJgOacieeOqeWutuiKgueCueabtOaWsOeKtuaAgVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyTm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wbGF5ZXJOb2RlTGlzdFtpXVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZVNjcmlwdCA9IG5vZGUuZ2V0Q29tcG9uZW50KFwicGxheWVyX25vZGVcIilcbiAgICAgICAgICAgICAgICBpZiAobm9kZVNjcmlwdCAmJiBub2RlU2NyaXB0LmFjY291bnRpZCA9PT0gZGF0YS5wbGF5ZXJfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbWl0KFwicGxheWVyX3N0YXRlX3VwZGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogXCJvZmZsaW5lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBkYXRhLnRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOWkhOeQhueOqeWutuS4iue6v+mAmuefpVxuICAgICAqL1xuICAgIF9vblBsYXllck9ubGluZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgLy8g6YCa55+l5omA5pyJ546p5a626IqC54K55pu05paw54q25oCBXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJOb2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnBsYXllck5vZGVMaXN0W2ldXG4gICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlU2NyaXB0ID0gbm9kZS5nZXRDb21wb25lbnQoXCJwbGF5ZXJfbm9kZVwiKVxuICAgICAgICAgICAgICAgIGlmIChub2RlU2NyaXB0ICYmIG5vZGVTY3JpcHQuYWNjb3VudGlkID09PSBkYXRhLnBsYXllcl9pZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmVtaXQoXCJwbGF5ZXJfc3RhdGVfdXBkYXRlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiBcIm9ubGluZVwiXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG4iXX0=