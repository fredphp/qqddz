
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/ddz/tournament/ArenaMatchWaitingScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '38a3d0afaecf439abdfa63', 'ArenaMatchWaitingScene');
// scripts/ddz/tournament/ArenaMatchWaitingScene.js

"use strict";

/**
 * ArenaMatchWaitingScene - 竞技场比赛等待界面
 * 
 * 功能：
 * 1. 显示所有报名玩家列表（头像+昵称）
 * 2. 实时更新玩家加入信息
 * 3. 显示倒计时
 * 4. 等待阶段结束后自动进入游戏
 * 
 * 🔧【重要】此脚本完全动态创建 UI，不依赖场景文件中的组件引用
 */

cc.Class({
  "extends": cc.Component,
  properties: {
    // 无属性定义，所有 UI 动态创建
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化数据
    this._periodNo = "";
    this._roomId = 0;
    this._roomName = "";
    this._countdown = 60;
    this._totalPlayers = 0;
    this._enteredPlayers = 0;
    this._players = [];
    this._startTime = 0;

    // 创建整个 UI
    this._createUI();

    // 注册事件监听
    this._registerEvents();

    // 从全局变量获取初始数据
    this._initFromGlobalData();

    // 监听 room_joined 消息以进入游戏场景
    this._registerRoomJoinedHandler();
    console.log("🏟️ [ArenaMatchWaiting] 等待界面加载完成");
  },
  /**
   * 创建完整 UI
   */
  _createUI: function _createUI() {
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;

    // 1. 创建背景（使用 join_bk.png）
    this._createBackground(screenWidth, screenHeight);

    // 2. 创建顶部信息栏
    this._createTopBar(screenWidth, screenHeight);

    // 3. 创建玩家列表容器
    this._createPlayerListContainer(screenWidth, screenHeight);

    // 4. 创建底部按钮区
    this._createBottomButtons(screenWidth, screenHeight);
  },
  /**
   * 创建背景（使用 join_bk.png）
   */
  _createBackground: function _createBackground(width, height) {
    // 创建背景节点
    var bgNode = new cc.Node("Background");
    bgNode.setContentSize(cc.size(width, height));
    bgNode.setPosition(0, 0);
    bgNode.setLocalZOrder(-100);
    var sprite = bgNode.addComponent(cc.Sprite);
    sprite.type = cc.Sprite.Type.SIMPLE;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

    // 加载背景图片
    cc.resources.load('join_bk', cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        console.warn("🏟️ [ArenaMatchWaiting] 无法加载背景图 join_bk.png，使用纯色背景");
        // 使用深色背景作为后备
        var graphics = bgNode.addComponent(cc.Graphics);
        graphics.fillColor = cc.color(25, 30, 50, 255);
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        return;
      }
      if (sprite && sprite.node && sprite.node.isValid) {
        sprite.spriteFrame = spriteFrame;
      }
    });
    bgNode.parent = this.node;
    this._bgNode = bgNode;
  },
  /**
   * 创建顶部信息栏
   */
  _createTopBar: function _createTopBar(width, height) {
    // 顶部信息栏容器
    var topBar = new cc.Node("TopBar");
    topBar.setContentSize(cc.size(width - 100, 100));
    topBar.setPosition(0, height / 2 - 80);

    // 半透明背景
    var bg = new cc.Node("Bg");
    bg.setContentSize(cc.size(width - 100, 100));
    var graphics = bg.addComponent(cc.Graphics);
    graphics.fillColor = cc.color(0, 0, 0, 150);
    graphics.roundRect(-(width - 100) / 2, -50, width - 100, 100, 10);
    graphics.fill();
    bg.parent = topBar;

    // 期号
    var periodNode = new cc.Node("PeriodNo");
    periodNode.setPosition(-width / 2 + 150, 25);
    var periodLabel = periodNode.addComponent(cc.Label);
    periodLabel.string = "期号: --";
    periodLabel.fontSize = 22;
    periodLabel.lineHeight = 28;
    periodNode.color = cc.color(255, 215, 0);
    var periodOutline = periodNode.addComponent(cc.LabelOutline);
    periodOutline.color = cc.color(0, 0, 0);
    periodOutline.width = 2;
    periodNode.parent = topBar;
    this._periodNoLabel = periodLabel;

    // 房间名称
    var roomNode = new cc.Node("RoomName");
    roomNode.setPosition(0, 25);
    var roomLabel = roomNode.addComponent(cc.Label);
    roomLabel.string = "竞技场";
    roomLabel.fontSize = 28;
    roomLabel.lineHeight = 36;
    roomNode.color = cc.color(255, 255, 255);
    var roomOutline = roomNode.addComponent(cc.LabelOutline);
    roomOutline.color = cc.color(0, 0, 0);
    roomOutline.width = 2;
    roomNode.parent = topBar;
    this._roomNameLabel = roomLabel;

    // 倒计时
    var countdownNode = new cc.Node("Countdown");
    countdownNode.setPosition(width / 2 - 150, 25);
    var countdownLabel = countdownNode.addComponent(cc.Label);
    countdownLabel.string = "60秒";
    countdownLabel.fontSize = 24;
    countdownLabel.lineHeight = 32;
    countdownNode.color = cc.color(100, 255, 100);
    var countdownOutline = countdownNode.addComponent(cc.LabelOutline);
    countdownOutline.color = cc.color(0, 0, 0);
    countdownOutline.width = 2;
    countdownNode.parent = topBar;
    this._countdownLabel = countdownLabel;

    // 玩家数量
    var playerCountNode = new cc.Node("PlayerCount");
    playerCountNode.setPosition(0, -15);
    var playerCountLabel = playerCountNode.addComponent(cc.Label);
    playerCountLabel.string = "已进入: 0 / 0";
    playerCountLabel.fontSize = 20;
    playerCountLabel.lineHeight = 28;
    playerCountNode.color = cc.color(200, 200, 220);
    playerCountNode.parent = topBar;
    this._playerCountLabel = playerCountLabel;

    // 提示消息
    var msgNode = new cc.Node("Message");
    msgNode.setPosition(0, -45);
    var msgLabel = msgNode.addComponent(cc.Label);
    msgLabel.string = "等待其他玩家进入...";
    msgLabel.fontSize = 16;
    msgLabel.lineHeight = 24;
    msgNode.color = cc.color(255, 200, 100);
    msgNode.parent = topBar;
    this._messageLabel = msgLabel;
    topBar.parent = this.node;
    this._topBar = topBar;
  },
  /**
   * 创建玩家列表容器
   */
  _createPlayerListContainer: function _createPlayerListContainer(width, height) {
    // 主容器
    var container = new cc.Node("PlayerListContainer");
    container.setContentSize(cc.size(width - 100, height - 280));
    container.setPosition(0, -20);

    // 标题
    var titleNode = new cc.Node("Title");
    titleNode.setPosition(0, height / 2 - 200);
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "参赛玩家";
    titleLabel.fontSize = 26;
    titleLabel.lineHeight = 36;
    titleNode.color = cc.color(255, 215, 0);
    var titleOutline = titleNode.addComponent(cc.LabelOutline);
    titleOutline.color = cc.color(0, 0, 0);
    titleOutline.width = 2;
    titleNode.parent = this.node;
    this._titleLabel = titleLabel;

    // ScrollView
    var scrollViewNode = new cc.Node("ScrollView");
    scrollViewNode.setContentSize(cc.size(width - 100, height - 340));
    scrollViewNode.setPosition(0, -30);
    var scrollView = scrollViewNode.addComponent(cc.ScrollView);
    scrollView.horizontal = false;
    scrollView.vertical = true;
    scrollView.inertia = true;
    scrollView.elastic = true;

    // Content 节点
    var contentNode = new cc.Node("Content");
    contentNode.setContentSize(cc.size(width - 120, 200));
    contentNode.anchorY = 1;
    contentNode.setPosition(0, 0);

    // 添加 Layout 组件（用于网格布局）
    var layout = contentNode.addComponent(cc.Layout);
    layout.type = cc.Layout.Type.GRID;
    layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
    layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
    layout.cellSize = cc.size(180, 200);
    layout.startAxis = cc.Layout.Axis.HORIZONTAL;
    layout.constraint = cc.Layout.Constraint.FIXED_ROW;
    layout.constraintNum = 3; // 一排3个
    layout.spacingX = 20;
    layout.spacingY = 20;
    layout.paddingTop = 20;
    layout.paddingBottom = 20;
    layout.paddingLeft = 20;
    layout.paddingRight = 20;
    contentNode.parent = scrollViewNode;
    scrollView.content = contentNode;
    scrollViewNode.parent = this.node;
    this._scrollView = scrollView;
    this._playerListContent = contentNode;
    container.parent = this.node;
    this._playerListContainer = container;
  },
  /**
   * 创建底部按钮区
   */
  _createBottomButtons: function _createBottomButtons(width, height) {
    var bottomBar = new cc.Node("BottomBar");
    bottomBar.setPosition(0, -height / 2 + 60);

    // 取消按钮
    var cancelBtn = new cc.Node("CancelButton");
    cancelBtn.setContentSize(cc.size(160, 50));
    cancelBtn.setPosition(-100, 0);
    var cancelBg = cancelBtn.addComponent(cc.Graphics);
    cancelBg.fillColor = cc.color(180, 80, 80);
    cancelBg.roundRect(-80, -25, 160, 50, 8);
    cancelBg.fill();
    var cancelLabelNode = new cc.Node("Label");
    var cancelLabel = cancelLabelNode.addComponent(cc.Label);
    cancelLabel.string = "取消进入";
    cancelLabel.fontSize = 20;
    cancelLabel.lineHeight = 28;
    cancelLabelNode.color = cc.color(255, 255, 255);
    cancelLabelNode.parent = cancelBtn;
    var cancelBtnComp = cancelBtn.addComponent(cc.Button);
    cancelBtnComp.transition = cc.Button.Transition.SCALE;
    cancelBtnComp.duration = 0.1;
    cancelBtnComp.zoomScale = 1.1;
    cancelBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
      event.stopPropagation();
      this.onCancelClick();
    }, this);
    cancelBtn.parent = bottomBar;
    this._cancelBtn = cancelBtn;
    bottomBar.parent = this.node;
    this._bottomBar = bottomBar;
  },
  /**
   * 从全局变量初始化数据
   */
  _initFromGlobalData: function _initFromGlobalData() {
    var myglobal = window.myglobal;

    // 优先检查缓存的状态数据（服务端推送的最新数据）
    if (myglobal && myglobal.arenaWaitingStatusCache) {
      var cachedData = myglobal.arenaWaitingStatusCache;
      console.log("🏟️ [ArenaMatchWaiting] 发现缓存的等待状态数据，玩家数量:", cachedData.players ? cachedData.players.length : 0);

      // 检查期号是否匹配
      var expectedPeriodNo = myglobal.arenaWaitingData ? myglobal.arenaWaitingData.period_no : "";
      if (!expectedPeriodNo || cachedData.period_no === expectedPeriodNo) {
        this._periodNo = cachedData.period_no || "";
        this._roomId = cachedData.room_id || 0;
        this._roomName = cachedData.room_name || "";
        this._countdown = cachedData.countdown || 60;
        this._totalPlayers = cachedData.total_players || 0;
        this._enteredPlayers = cachedData.entered_players || 1;
        this._players = cachedData.players || [];
        this._startTime = cachedData.start_time || Date.now();
        this._updateUI();
        console.log("🏟️ [ArenaMatchWaiting] 从缓存数据初始化完成，显示玩家:", this._players.length);

        // 清除缓存
        myglobal.arenaWaitingStatusCache = null;
        return;
      }
    }

    // 使用 arenaWaitingData（点击进入时设置的数据）
    if (myglobal && myglobal.arenaWaitingData) {
      var data = myglobal.arenaWaitingData;
      this._periodNo = data.period_no || "";
      this._roomId = data.room_id || 0;
      this._roomName = data.room_name || "";
      this._countdown = data.countdown || 60;
      this._totalPlayers = data.total_players || 0;
      this._enteredPlayers = data.entered_players || 1;
      this._players = data.players || [];
      this._startTime = data.start_time || Date.now();
      this._updateUI();
      console.log("🏟️ [ArenaMatchWaiting] 从全局变量初始化数据完成");

      // 如果玩家列表为空，请求服务端推送状态
      if (this._players.length === 0) {
        console.log("🏟️ [ArenaMatchWaiting] 玩家列表为空，请求服务端推送状态");
        this._requestWaitingStatus();
      }
    }
  },
  /**
   * 请求服务端推送等待状态
   */
  _requestWaitingStatus: function _requestWaitingStatus() {
    var myglobal = window.myglobal;
    var socket = myglobal && myglobal.socket;
    if (socket && socket.sendArenaEnter) {
      // 重新发送 arena_enter 请求，服务端会推送当前状态
      socket.sendArenaEnter({
        period_no: this._periodNo,
        room_id: this._roomId
      });
      console.log("🏟️ [ArenaMatchWaiting] 已请求服务端推送等待状态");
    }
  },
  /**
   * 监听 room_joined 消息以进入游戏场景
   * 🔧【关键修改】
   * 1. 停止加载动画
   * 2. 保存预加载数据到 myglobal.roomData 和 myglobal.arenaMatchData
   * 3. 直接进入游戏场景，无需重新请求数据
   */
  _registerRoomJoinedHandler: function _registerRoomJoinedHandler() {
    var self = this;
    var myglobal = window.myglobal;
    var socket = myglobal && myglobal.socket;
    if (socket && socket.onRoomJoined) {
      socket.onRoomJoined(function (roomData) {
        console.log("🏟️ [ArenaMatchWaiting] 收到 room_joined，准备进入游戏场景:", JSON.stringify(roomData));

        // 检查是否是竞技场房间
        var roomCategory = roomData.room_category || 1;
        if (roomCategory !== 2) {
          console.log("🏟️ [ArenaMatchWaiting] 不是竞技场房间，忽略");
          return;
        }

        // 🔧【关键修复】停止加载动画
        self._stopLoadingAnimation();

        // 转换数据格式
        var players = roomData.players || [];
        var convertedRoomData = {
          roomid: roomData.room_code || "ARENA",
          room_code: roomData.room_code || "ARENA",
          seatindex: roomData.player ? roomData.player.seat + 1 : 1,
          playerdata: players.map(function (p, idx) {
            return {
              accountid: p.id,
              nick_name: p.name,
              avatarUrl: p.avatar || "avatar_1",
              gold_count: p.gold_count || 0,
              goldcount: p.gold_count || 0,
              seatindex: (p.seat !== undefined ? p.seat : idx) + 1,
              isready: p.ready || false,
              arena_gold: p.arena_gold || 0,
              match_coin: p.match_coin || 0,
              period_no: p.period_no || ""
            };
          }),
          housemanageid: roomData.creator_id || "",
          creator_id: roomData.creator_id || "",
          room_category: 2,
          period_no: self._periodNo
        };

        // 🔧【关键修复】保存预加载数据到 myglobal
        if (myglobal) {
          // 保存房间数据
          myglobal.roomData = convertedRoomData;

          // 🔧【新增】保存竞技场比赛数据（用于游戏场景）
          myglobal.arenaMatchData = {
            periodNo: self._periodNo,
            roomId: self._roomId,
            roomName: self._roomName,
            totalPlayers: self._totalPlayers,
            totalTables: self._totalTables || 0,
            players: self._players,
            matchRounds: roomData.match_rounds || 0,
            currentRound: roomData.current_round || 1
          };
          console.log("🏟️ [ArenaMatchWaiting] 预加载数据已保存:");
          console.log("  - myglobal.roomData.playerdata:", convertedRoomData.playerdata.length, "人");
          console.log("  - myglobal.arenaMatchData.periodNo:", self._periodNo);
          console.log("  - 头像缓存数量:", myglobal._avatarCache ? Object.keys(myglobal._avatarCache).length : 0);
        }

        // 🔧【优化】直接进入游戏场景，无需重新请求数据
        // 游戏场景会从 myglobal.roomData 读取预加载数据
        console.log("🏟️ [ArenaMatchWaiting] 进入游戏场景...");
        cc.director.loadScene("gameScene");
      });
    }
  },
  onDestroy: function onDestroy() {
    // 停止加载动画
    this._stopLoadingAnimation();

    // 取消事件监听
    this._unregisterEvents();
    console.log("🏟️ [ArenaMatchWaiting] 场景销毁，已停止加载动画");
  },
  // ============================================================
  // 事件监听
  // ============================================================

  _registerEvents: function _registerEvents() {
    var self = this;

    // 监听等待状态推送
    if (window.myglobal && window.myglobal.socket) {
      var socket = window.myglobal.socket;

      // 等待状态推送
      socket.on("arena_waiting_status_notify", function (data) {
        console.log("🏟️ [ArenaMatchWaiting] 收到等待状态:", JSON.stringify(data));
        self._onWaitingStatus(data);
      });

      // 倒计时更新
      socket.on("arena_waiting_tick_notify", function (data) {
        console.log("🏟️ [ArenaMatchWaiting] 倒计时更新:", data.countdown);
        self._onWaitingTick(data);
      });

      // 玩家加入广播
      socket.on("arena_player_joined_notify", function (data) {
        console.log("🏟️ [ArenaMatchWaiting] 玩家加入:", JSON.stringify(data));
        self._onPlayerJoined(data);
      });

      // 分配阶段开始
      socket.on("arena_assign_start_notify", function (data) {
        console.log("🏟️ [ArenaMatchWaiting] 分配阶段开始:", JSON.stringify(data));
        self._onAssignStart(data);
      });
    }
  },
  _unregisterEvents: function _unregisterEvents() {
    // 事件会随节点销毁自动取消
  },
  // ============================================================
  // 公共方法
  // ============================================================

  /**
   * 设置初始数据
   * @param {Object} data - { period_no, room_id, room_name, countdown, total_players, entered_players, players, message }
   */
  setData: function setData(data) {
    this._periodNo = data.period_no || "";
    this._roomId = data.room_id || 0;
    this._roomName = data.room_name || "";
    this._countdown = data.countdown || 60;
    this._totalPlayers = data.total_players || 0;
    this._enteredPlayers = data.entered_players || 0;
    this._players = data.players || [];
    this._startTime = data.start_time || Date.now();
    this._updateUI();
  },
  // ============================================================
  // 事件处理
  // ============================================================

  _onWaitingStatus: function _onWaitingStatus(data) {
    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }
    this._periodNo = data.period_no;
    this._roomId = data.room_id;
    this._roomName = data.room_name;
    this._countdown = data.countdown;
    this._totalPlayers = data.total_players;
    this._enteredPlayers = data.entered_players;
    this._players = data.players;
    this._startTime = data.start_time;
    this._updateUI();
  },
  _onWaitingTick: function _onWaitingTick(data) {
    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }
    this._countdown = data.countdown;
    this._enteredPlayers = data.entered_players;
    this._updateCountdownUI();
    this._updatePlayerCountUI();
  },
  _onPlayerJoined: function _onPlayerJoined(data) {
    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }

    // 更新玩家列表
    this._players = data.players || [];
    this._enteredPlayers = data.entered_players;
    this._totalPlayers = data.total_players;

    // 显示加入提示
    var newPlayer = data.player;
    if (newPlayer && newPlayer.player_name) {
      this._showJoinMessage(newPlayer.player_name + " 进入了比赛");
    }

    // 更新UI
    this._updatePlayerListUI();
    this._updatePlayerCountUI();
  },
  _onAssignStart: function _onAssignStart(data) {
    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }
    console.log("🏟️ [ArenaMatchWaiting] 分配阶段开始:", JSON.stringify(data));
    this._countdown = data.countdown;
    this._totalPlayers = data.total_players;
    this._enteredPlayers = data.total_players;
    this._totalTables = data.total_tables || 0;

    // 🔧【关键修改】显示"系统分配中"加载动画
    this._showAssigningLoadingUI(data);

    // 🔧【关键修改】预加载所有玩家头像资源
    this._preloadAllPlayerAvatars();

    // 更新UI
    this._updateUI();
  },
  /**
   * 🔧【新增】显示"系统分配中"加载动画
   */
  _showAssigningLoadingUI: function _showAssigningLoadingUI(data) {
    var self = this;

    // 隐藏取消按钮（分配阶段不能取消）
    if (this._cancelBtn) {
      this._cancelBtn.active = false;
    }

    // 显示分配消息
    if (this._messageLabel) {
      this._messageLabel.string = data.message || "系统分配中...";
      this._messageLabel.node.color = cc.color(255, 220, 100);
    }

    // 创建加载动画覆盖层
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;

    // 创建加载覆盖层
    var loadingOverlay = new cc.Node("AssigningLoadingOverlay");
    loadingOverlay.setContentSize(cc.size(screenWidth, screenHeight));
    loadingOverlay.setPosition(0, 0);
    loadingOverlay.zIndex = 1000;

    // 半透明背景
    var bgNode = new cc.Node("Bg");
    bgNode.setContentSize(cc.size(screenWidth, screenHeight));
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = cc.color(0, 0, 0, 150);
    bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
    bgGraphics.fill();
    bgNode.parent = loadingOverlay;

    // 创建加载图标容器（旋转动画）
    var loadingContainer = new cc.Node("LoadingContainer");
    loadingContainer.setPosition(0, 50);
    loadingContainer.parent = loadingOverlay;

    // 加载图标（使用简单的圆形旋转动画）
    var loadingIcon = new cc.Node("LoadingIcon");
    loadingIcon.setContentSize(cc.size(60, 60));
    var iconGraphics = loadingIcon.addComponent(cc.Graphics);
    // 绘制加载圆环
    iconGraphics.strokeColor = cc.color(255, 215, 0);
    iconGraphics.lineWidth = 4;
    iconGraphics.arc(0, 0, 25, 0, Math.PI * 1.5, false);
    iconGraphics.stroke();
    loadingIcon.parent = loadingContainer;

    // 保存引用以便旋转动画
    this._loadingIconNode = loadingIcon;

    // 加载文字
    var loadingLabel = new cc.Node("LoadingLabel");
    loadingLabel.setPosition(0, -30);
    var label = loadingLabel.addComponent(cc.Label);
    label.string = "系统分配中...";
    label.fontSize = 28;
    label.lineHeight = 36;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    loadingLabel.color = cc.color(255, 220, 100);
    var outline = loadingLabel.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;
    loadingLabel.parent = loadingContainer;
    this._assigningLoadingLabel = label;

    // 显示分配信息
    var infoLabel = new cc.Node("InfoLabel");
    infoLabel.setPosition(0, -70);
    var infoLabelComp = infoLabel.addComponent(cc.Label);
    var totalTables = data.total_tables || 0;
    var totalPlayers = data.total_players || 0;
    infoLabelComp.string = "正在分配 " + totalPlayers + " 名玩家到 " + totalTables + " 桌";
    infoLabelComp.fontSize = 18;
    infoLabelComp.lineHeight = 24;
    infoLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    infoLabel.color = cc.color(200, 200, 220);
    infoLabel.parent = loadingContainer;
    loadingOverlay.parent = this.node;
    this._assigningLoadingOverlay = loadingOverlay;

    // 启动旋转动画
    this._startLoadingAnimation();
    console.log("🏟️ [ArenaMatchWaiting] 显示'系统分配中'加载动画");
  },
  /**
   * 🔧【新增】启动加载动画
   */
  _startLoadingAnimation: function _startLoadingAnimation() {
    var self = this;
    this._loadingAnimScheduled = true;

    // 使用 schedule 更新旋转角度
    this.schedule(function () {
      if (self._loadingIconNode && self._loadingIconNode.isValid) {
        self._loadingIconNode.angle += 5;
      }
    }, 0.016); // 约60fps
  },

  /**
   * 🔧【新增】停止加载动画
   */
  _stopLoadingAnimation: function _stopLoadingAnimation() {
    if (this._loadingAnimScheduled) {
      this.unschedule(this._startLoadingAnimation);
      this._loadingAnimScheduled = false;
    }
    if (this._assigningLoadingOverlay && this._assigningLoadingOverlay.isValid) {
      this._assigningLoadingOverlay.destroy();
      this._assigningLoadingOverlay = null;
    }
    this._loadingIconNode = null;
  },
  /**
   * 🔧【新增】预加载所有玩家头像资源
   */
  _preloadAllPlayerAvatars: function _preloadAllPlayerAvatars() {
    var self = this;
    if (!this._players || this._players.length === 0) {
      console.log("🏟️ [ArenaMatchWaiting] 没有玩家头像需要预加载");
      return;
    }

    // 收集所有头像URL
    var avatarUrls = [];
    for (var i = 0; i < this._players.length; i++) {
      var player = this._players[i];
      var avatarUrl = player.avatar || player.avatarUrl || "avatar_1";
      if (avatarUrl && avatarUrls.indexOf(avatarUrl) === -1) {
        avatarUrls.push(avatarUrl);
      }
    }
    console.log("🏟️ [ArenaMatchWaiting] 预加载玩家头像数量:", avatarUrls.length);

    // 初始化头像缓存
    var myglobal = window.myglobal;
    if (myglobal && !myglobal._avatarCache) {
      myglobal._avatarCache = {};
    }

    // 预加载头像
    var loadedCount = 0;
    var totalCount = avatarUrls.length;
    var onLoaded = function onLoaded() {
      loadedCount++;
      if (loadedCount >= totalCount) {
        console.log("🏟️ [ArenaMatchWaiting] 所有玩家头像预加载完成");
      }
    };
    for (var j = 0; j < avatarUrls.length; j++) {
      this._preloadSingleAvatar(avatarUrls[j], onLoaded);
    }
  },
  /**
   * 🔧【新增】预加载单个头像
   */
  _preloadSingleAvatar: function _preloadSingleAvatar(avatarUrl, callback) {
    var myglobal = window.myglobal;

    // 如果已缓存，直接返回
    if (myglobal && myglobal._avatarCache && myglobal._avatarCache[avatarUrl]) {
      if (callback) callback();
      return;
    }

    // 判断是否是远程URL
    if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (!err && texture && myglobal && myglobal._avatarCache) {
          try {
            myglobal._avatarCache[avatarUrl] = new cc.SpriteFrame(texture);
            console.log("🏟️ [ArenaMatchWaiting] 远程头像预加载成功:", avatarUrl);
          } catch (e) {
            console.warn("🏟️ [ArenaMatchWaiting] 缓存头像失败:", e);
          }
        }
        if (callback) callback();
      });
    } else {
      // 本地资源
      cc.resources.load('UI/headimage/' + avatarUrl, cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame && myglobal && myglobal._avatarCache) {
          myglobal._avatarCache[avatarUrl] = spriteFrame;
          console.log("🏟️ [ArenaMatchWaiting] 本地头像预加载成功:", avatarUrl);
        }
        if (callback) callback();
      });
    }
  },
  // ============================================================
  // UI更新
  // ============================================================

  _updateUI: function _updateUI() {
    // 更新期号
    if (this._periodNoLabel) {
      this._periodNoLabel.string = "期号: " + this._periodNo;
    }

    // 更新房间名称
    if (this._roomNameLabel) {
      this._roomNameLabel.string = this._roomName || "竞技场";
    }

    // 更新倒计时
    this._updateCountdownUI();

    // 更新玩家数量
    this._updatePlayerCountUI();

    // 更新玩家列表
    this._updatePlayerListUI();
  },
  _updateCountdownUI: function _updateCountdownUI() {
    if (this._countdownLabel) {
      this._countdownLabel.string = this._countdown + "秒";

      // 最后10秒变红
      if (this._countdown <= 10 && this._countdown > 0) {
        this._countdownLabel.node.color = cc.color(255, 100, 100);
      } else {
        this._countdownLabel.node.color = cc.color(100, 255, 100);
      }
    }
  },
  _updatePlayerCountUI: function _updatePlayerCountUI() {
    if (this._playerCountLabel) {
      this._playerCountLabel.string = "已进入: " + this._enteredPlayers + " / " + this._totalPlayers;
    }
  },
  // ============================================================
  // 玩家列表渲染（ul > li 形式，一排3个）
  // ============================================================

  _updatePlayerListUI: function _updatePlayerListUI() {
    if (!this._playerListContent) return;

    // 清空现有列表
    this._playerListContent.removeAllChildren();
    console.log("🏟️ [ArenaMatchWaiting] 更新玩家列表，玩家数量:", this._players.length);

    // 添加玩家项
    for (var i = 0; i < this._players.length; i++) {
      var player = this._players[i];
      var itemNode = this._createPlayerItem(player, i);
      itemNode.parent = this._playerListContent;
    }

    // 更新容器高度
    var rows = Math.ceil(this._players.length / 3);
    var contentHeight = rows * 220 + 40; // 每行高度 220，加上边距
    this._playerListContent.setContentSize(this._playerListContent.width, Math.max(contentHeight, 200));
  },
  /**
   * 创建玩家项节点（头像 + 昵称在头像下面）
   */
  _createPlayerItem: function _createPlayerItem(player, index) {
    // 创建 li 节点（单个玩家卡片）
    var itemNode = new cc.Node("PlayerItem_" + index);
    itemNode.setContentSize(cc.size(180, 200));

    // 卡片背景
    var bgNode = new cc.Node("Bg");
    bgNode.setContentSize(cc.size(170, 190));
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = cc.color(40, 45, 70, 200);
    bgGraphics.roundRect(-85, -95, 170, 190, 10);
    bgGraphics.fill();
    bgGraphics.strokeColor = cc.color(100, 120, 180);
    bgGraphics.lineWidth = 2;
    bgGraphics.stroke();
    bgNode.parent = itemNode;

    // 创建头像节点
    var avatarNode = new cc.Node("Avatar");
    avatarNode.setPosition(0, 30);
    avatarNode.setContentSize(cc.size(100, 100));
    var avatarSprite = avatarNode.addComponent(cc.Sprite);
    avatarSprite.type = cc.Sprite.Type.SIMPLE;
    avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

    // 加载头像
    this._loadPlayerAvatar(player.avatar, avatarSprite);

    // 创建圆形遮罩
    var maskNode = new cc.Node("AvatarMask");
    maskNode.setPosition(0, 30);
    maskNode.setContentSize(cc.size(100, 100));
    var mask = maskNode.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.ELLIPSE;
    mask.segements = 64;
    avatarNode.parent = maskNode;
    maskNode.parent = itemNode;

    // 创建昵称节点（在头像下面）
    var nameNode = new cc.Node("NameLabel");
    nameNode.setPosition(0, -55);
    var nameLabel = nameNode.addComponent(cc.Label);
    var playerName = player.player_name || player.name || "玩家" + (player.player_id || index);
    nameLabel.string = playerName;
    nameLabel.fontSize = 18;
    nameLabel.lineHeight = 24;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    nameNode.setContentSize(cc.size(160, 24));

    // 机器人用灰色，真人用白色
    if (player.is_robot) {
      nameNode.color = cc.color(150, 150, 150);
    } else {
      nameNode.color = cc.color(255, 255, 255);
    }

    // 添加描边效果
    var outline = nameNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;
    nameNode.parent = itemNode;

    // 机器人标识
    if (player.is_robot) {
      var robotTag = new cc.Node("RobotTag");
      robotTag.setPosition(60, 70);
      var tagLabel = robotTag.addComponent(cc.Label);
      tagLabel.string = "AI";
      tagLabel.fontSize = 14;
      tagLabel.lineHeight = 18;
      robotTag.color = cc.color(255, 200, 100);
      var tagOutline = robotTag.addComponent(cc.LabelOutline);
      tagOutline.color = cc.color(0, 0, 0);
      tagOutline.width = 1;
      robotTag.parent = itemNode;
    }
    return itemNode;
  },
  /**
   * 加载玩家头像
   */
  _loadPlayerAvatar: function _loadPlayerAvatar(avatarUrl, sprite) {
    if (!sprite) return;

    // 如果没有头像URL，使用默认头像
    if (!avatarUrl) {
      cc.resources.load('UI/headimage/avatar_1', cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame && sprite && sprite.node && sprite.node.isValid) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 如果是网络URL
    if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (!err && texture && sprite && sprite.node && sprite.node.isValid) {
          try {
            var sf = new cc.SpriteFrame(texture);
            sprite.spriteFrame = sf;
          } catch (e) {}
        }
      });
      return;
    }

    // 本地资源路径
    cc.resources.load('UI/headimage/' + avatarUrl, cc.SpriteFrame, function (err, spriteFrame) {
      if (!err && spriteFrame && sprite && sprite.node && sprite.node.isValid) {
        sprite.spriteFrame = spriteFrame;
      }
    });
  },
  // ============================================================
  // 提示消息
  // ============================================================

  _showJoinMessage: function _showJoinMessage(message) {
    // 创建浮动提示
    var tipNode = new cc.Node("JoinTip");
    tipNode.setPosition(0, 100);
    var label = tipNode.addComponent(cc.Label);
    label.string = message;
    label.fontSize = 24;
    label.lineHeight = 32;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    tipNode.color = cc.color(100, 255, 100);
    var outline = tipNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;
    tipNode.parent = this.node;

    // 淡出动画
    tipNode.runAction(cc.sequence(cc.moveBy(1.5, cc.v2(0, 50)), cc.fadeOut(0.5), cc.removeSelf()));
  },
  // ============================================================
  // 按钮事件
  // ============================================================

  /**
   * 取消进入（返回大厅）
   */
  onCancelClick: function onCancelClick() {
    console.log("🏟️ [ArenaMatchWaiting] 玩家点击取消");

    // 发送取消进入请求
    if (window.myglobal && window.myglobal.socket) {
      window.myglobal.socket.emit("arena_cancel_enter", {
        period_no: this._periodNo,
        room_id: this._roomId
      });
    }

    // 返回大厅
    cc.director.loadScene("hallScene");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxBcmVuYU1hdGNoV2FpdGluZ1NjZW5lLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwib25Mb2FkIiwiX3BlcmlvZE5vIiwiX3Jvb21JZCIsIl9yb29tTmFtZSIsIl9jb3VudGRvd24iLCJfdG90YWxQbGF5ZXJzIiwiX2VudGVyZWRQbGF5ZXJzIiwiX3BsYXllcnMiLCJfc3RhcnRUaW1lIiwiX2NyZWF0ZVVJIiwiX3JlZ2lzdGVyRXZlbnRzIiwiX2luaXRGcm9tR2xvYmFsRGF0YSIsIl9yZWdpc3RlclJvb21Kb2luZWRIYW5kbGVyIiwiY29uc29sZSIsImxvZyIsImNhbnZhcyIsIm5vZGUiLCJnZXRDb21wb25lbnQiLCJDYW52YXMiLCJmaW5kIiwic2NyZWVuSGVpZ2h0IiwiZGVzaWduUmVzb2x1dGlvbiIsImhlaWdodCIsInNjcmVlbldpZHRoIiwid2lkdGgiLCJfY3JlYXRlQmFja2dyb3VuZCIsIl9jcmVhdGVUb3BCYXIiLCJfY3JlYXRlUGxheWVyTGlzdENvbnRhaW5lciIsIl9jcmVhdGVCb3R0b21CdXR0b25zIiwiYmdOb2RlIiwiTm9kZSIsInNldENvbnRlbnRTaXplIiwic2l6ZSIsInNldFBvc2l0aW9uIiwic2V0TG9jYWxaT3JkZXIiLCJzcHJpdGUiLCJhZGRDb21wb25lbnQiLCJTcHJpdGUiLCJ0eXBlIiwiVHlwZSIsIlNJTVBMRSIsInNpemVNb2RlIiwiU2l6ZU1vZGUiLCJDVVNUT00iLCJyZXNvdXJjZXMiLCJsb2FkIiwiU3ByaXRlRnJhbWUiLCJlcnIiLCJzcHJpdGVGcmFtZSIsIndhcm4iLCJncmFwaGljcyIsIkdyYXBoaWNzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJyZWN0IiwiZmlsbCIsImlzVmFsaWQiLCJwYXJlbnQiLCJfYmdOb2RlIiwidG9wQmFyIiwiYmciLCJyb3VuZFJlY3QiLCJwZXJpb2ROb2RlIiwicGVyaW9kTGFiZWwiLCJMYWJlbCIsInN0cmluZyIsImZvbnRTaXplIiwibGluZUhlaWdodCIsInBlcmlvZE91dGxpbmUiLCJMYWJlbE91dGxpbmUiLCJfcGVyaW9kTm9MYWJlbCIsInJvb21Ob2RlIiwicm9vbUxhYmVsIiwicm9vbU91dGxpbmUiLCJfcm9vbU5hbWVMYWJlbCIsImNvdW50ZG93bk5vZGUiLCJjb3VudGRvd25MYWJlbCIsImNvdW50ZG93bk91dGxpbmUiLCJfY291bnRkb3duTGFiZWwiLCJwbGF5ZXJDb3VudE5vZGUiLCJwbGF5ZXJDb3VudExhYmVsIiwiX3BsYXllckNvdW50TGFiZWwiLCJtc2dOb2RlIiwibXNnTGFiZWwiLCJfbWVzc2FnZUxhYmVsIiwiX3RvcEJhciIsImNvbnRhaW5lciIsInRpdGxlTm9kZSIsInRpdGxlTGFiZWwiLCJ0aXRsZU91dGxpbmUiLCJfdGl0bGVMYWJlbCIsInNjcm9sbFZpZXdOb2RlIiwic2Nyb2xsVmlldyIsIlNjcm9sbFZpZXciLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJpbmVydGlhIiwiZWxhc3RpYyIsImNvbnRlbnROb2RlIiwiYW5jaG9yWSIsImxheW91dCIsIkxheW91dCIsIkdSSUQiLCJob3Jpem9udGFsRGlyZWN0aW9uIiwiSG9yaXpvbnRhbERpcmVjdGlvbiIsIkxFRlRfVE9fUklHSFQiLCJ2ZXJ0aWNhbERpcmVjdGlvbiIsIlZlcnRpY2FsRGlyZWN0aW9uIiwiVE9QX1RPX0JPVFRPTSIsImNlbGxTaXplIiwic3RhcnRBeGlzIiwiQXhpcyIsIkhPUklaT05UQUwiLCJjb25zdHJhaW50IiwiQ29uc3RyYWludCIsIkZJWEVEX1JPVyIsImNvbnN0cmFpbnROdW0iLCJzcGFjaW5nWCIsInNwYWNpbmdZIiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCIsImNvbnRlbnQiLCJfc2Nyb2xsVmlldyIsIl9wbGF5ZXJMaXN0Q29udGVudCIsIl9wbGF5ZXJMaXN0Q29udGFpbmVyIiwiYm90dG9tQmFyIiwiY2FuY2VsQnRuIiwiY2FuY2VsQmciLCJjYW5jZWxMYWJlbE5vZGUiLCJjYW5jZWxMYWJlbCIsImNhbmNlbEJ0bkNvbXAiLCJCdXR0b24iLCJ0cmFuc2l0aW9uIiwiVHJhbnNpdGlvbiIsIlNDQUxFIiwiZHVyYXRpb24iLCJ6b29tU2NhbGUiLCJvbiIsIkV2ZW50VHlwZSIsIlRPVUNIX0VORCIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwib25DYW5jZWxDbGljayIsIl9jYW5jZWxCdG4iLCJfYm90dG9tQmFyIiwibXlnbG9iYWwiLCJ3aW5kb3ciLCJhcmVuYVdhaXRpbmdTdGF0dXNDYWNoZSIsImNhY2hlZERhdGEiLCJwbGF5ZXJzIiwibGVuZ3RoIiwiZXhwZWN0ZWRQZXJpb2RObyIsImFyZW5hV2FpdGluZ0RhdGEiLCJwZXJpb2Rfbm8iLCJyb29tX2lkIiwicm9vbV9uYW1lIiwiY291bnRkb3duIiwidG90YWxfcGxheWVycyIsImVudGVyZWRfcGxheWVycyIsInN0YXJ0X3RpbWUiLCJEYXRlIiwibm93IiwiX3VwZGF0ZVVJIiwiZGF0YSIsIl9yZXF1ZXN0V2FpdGluZ1N0YXR1cyIsInNvY2tldCIsInNlbmRBcmVuYUVudGVyIiwic2VsZiIsIm9uUm9vbUpvaW5lZCIsInJvb21EYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInJvb21DYXRlZ29yeSIsInJvb21fY2F0ZWdvcnkiLCJfc3RvcExvYWRpbmdBbmltYXRpb24iLCJjb252ZXJ0ZWRSb29tRGF0YSIsInJvb21pZCIsInJvb21fY29kZSIsInNlYXRpbmRleCIsInBsYXllciIsInNlYXQiLCJwbGF5ZXJkYXRhIiwibWFwIiwicCIsImlkeCIsImFjY291bnRpZCIsImlkIiwibmlja19uYW1lIiwibmFtZSIsImF2YXRhclVybCIsImF2YXRhciIsImdvbGRfY291bnQiLCJnb2xkY291bnQiLCJ1bmRlZmluZWQiLCJpc3JlYWR5IiwicmVhZHkiLCJhcmVuYV9nb2xkIiwibWF0Y2hfY29pbiIsImhvdXNlbWFuYWdlaWQiLCJjcmVhdG9yX2lkIiwiYXJlbmFNYXRjaERhdGEiLCJwZXJpb2RObyIsInJvb21JZCIsInJvb21OYW1lIiwidG90YWxQbGF5ZXJzIiwidG90YWxUYWJsZXMiLCJfdG90YWxUYWJsZXMiLCJtYXRjaFJvdW5kcyIsIm1hdGNoX3JvdW5kcyIsImN1cnJlbnRSb3VuZCIsImN1cnJlbnRfcm91bmQiLCJfYXZhdGFyQ2FjaGUiLCJPYmplY3QiLCJrZXlzIiwiZGlyZWN0b3IiLCJsb2FkU2NlbmUiLCJvbkRlc3Ryb3kiLCJfdW5yZWdpc3RlckV2ZW50cyIsIl9vbldhaXRpbmdTdGF0dXMiLCJfb25XYWl0aW5nVGljayIsIl9vblBsYXllckpvaW5lZCIsIl9vbkFzc2lnblN0YXJ0Iiwic2V0RGF0YSIsIl91cGRhdGVDb3VudGRvd25VSSIsIl91cGRhdGVQbGF5ZXJDb3VudFVJIiwibmV3UGxheWVyIiwicGxheWVyX25hbWUiLCJfc2hvd0pvaW5NZXNzYWdlIiwiX3VwZGF0ZVBsYXllckxpc3RVSSIsInRvdGFsX3RhYmxlcyIsIl9zaG93QXNzaWduaW5nTG9hZGluZ1VJIiwiX3ByZWxvYWRBbGxQbGF5ZXJBdmF0YXJzIiwiYWN0aXZlIiwibWVzc2FnZSIsImxvYWRpbmdPdmVybGF5IiwiekluZGV4IiwiYmdHcmFwaGljcyIsImxvYWRpbmdDb250YWluZXIiLCJsb2FkaW5nSWNvbiIsImljb25HcmFwaGljcyIsInN0cm9rZUNvbG9yIiwibGluZVdpZHRoIiwiYXJjIiwiTWF0aCIsIlBJIiwic3Ryb2tlIiwiX2xvYWRpbmdJY29uTm9kZSIsImxvYWRpbmdMYWJlbCIsImxhYmVsIiwiaG9yaXpvbnRhbEFsaWduIiwiSG9yaXpvbnRhbEFsaWduIiwiQ0VOVEVSIiwib3V0bGluZSIsIl9hc3NpZ25pbmdMb2FkaW5nTGFiZWwiLCJpbmZvTGFiZWwiLCJpbmZvTGFiZWxDb21wIiwiX2Fzc2lnbmluZ0xvYWRpbmdPdmVybGF5IiwiX3N0YXJ0TG9hZGluZ0FuaW1hdGlvbiIsIl9sb2FkaW5nQW5pbVNjaGVkdWxlZCIsInNjaGVkdWxlIiwiYW5nbGUiLCJ1bnNjaGVkdWxlIiwiZGVzdHJveSIsImF2YXRhclVybHMiLCJpIiwiaW5kZXhPZiIsInB1c2giLCJsb2FkZWRDb3VudCIsInRvdGFsQ291bnQiLCJvbkxvYWRlZCIsImoiLCJfcHJlbG9hZFNpbmdsZUF2YXRhciIsImNhbGxiYWNrIiwiYXNzZXRNYW5hZ2VyIiwibG9hZFJlbW90ZSIsImV4dCIsInRleHR1cmUiLCJlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJpdGVtTm9kZSIsIl9jcmVhdGVQbGF5ZXJJdGVtIiwicm93cyIsImNlaWwiLCJjb250ZW50SGVpZ2h0IiwibWF4IiwiaW5kZXgiLCJhdmF0YXJOb2RlIiwiYXZhdGFyU3ByaXRlIiwiX2xvYWRQbGF5ZXJBdmF0YXIiLCJtYXNrTm9kZSIsIm1hc2siLCJNYXNrIiwiRUxMSVBTRSIsInNlZ2VtZW50cyIsIm5hbWVOb2RlIiwibmFtZUxhYmVsIiwicGxheWVyTmFtZSIsInBsYXllcl9pZCIsImlzX3JvYm90Iiwicm9ib3RUYWciLCJ0YWdMYWJlbCIsInRhZ091dGxpbmUiLCJzZiIsInRpcE5vZGUiLCJydW5BY3Rpb24iLCJzZXF1ZW5jZSIsIm1vdmVCeSIsInYyIiwiZmFkZU91dCIsInJlbW92ZVNlbGYiLCJlbWl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSyxDQUFDO0VBQ0wsV0FBU0QsRUFBRSxDQUFDRSxTQUFTO0VBRXJCQyxVQUFVLEVBQUU7SUFDUjtFQUFBLENBQ0g7RUFFRDtFQUVBQyxNQUFNLFdBQUFBLE9BQUEsRUFBSTtJQUNOO0lBQ0EsSUFBSSxDQUFDQyxTQUFTLEdBQUcsRUFBRTtJQUNuQixJQUFJLENBQUNDLE9BQU8sR0FBRyxDQUFDO0lBQ2hCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLEVBQUU7SUFDbkIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsRUFBRTtJQUNwQixJQUFJLENBQUNDLGFBQWEsR0FB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QUNDLFNBQVMsQ0FBQ3RULEVBQUUsQ0FBQ3VULFFBQVEsQ0FDekJ2VCxFQUFFLENBQUN3VCxNQUFNLENBQUMsR0FBRyxFQUFFeFQsRUFBRSxDQUFDeVQsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUM1QnpULEVBQUUsQ0FBQzBULE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFDZjFULEVBQUUsQ0FBQzJULFVBQVUsRUFBRSxDQUNsQixDQUFDO0VBQ04sQ0FBQztFQUVEO0VBQ0E7RUFDQTs7RUFFQTtBQUNKO0FBQ0E7RUFDSXZLLGFBQWEsRUFBRSxTQUFBQSxjQUFBLEVBQVc7SUFDdEJuSSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQzs7SUFFN0M7SUFDQSxJQUFJc0ksTUFBTSxDQUFDRCxRQUFRLElBQUlDLE1BQU0sQ0FBQ0QsUUFBUSxDQUFDb0IsTUFBTSxFQUFFO01BQzNDbkIsTUFBTSxDQUFDRCxRQUFRLENBQUNvQixNQUFNLENBQUNpSixJQUFJLENBQUMsb0JBQW9CLEVBQUU7UUFDOUM3SixTQUFTLEVBQUUsSUFBSSxDQUFDMUosU0FBUztRQUN6QjJKLE9BQU8sRUFBRSxJQUFJLENBQUMxSjtNQUNsQixDQUFDLENBQUM7SUFDTjs7SUFFQTtJQUNBTixFQUFFLENBQUM0TixRQUFRLENBQUNDLFNBQVMsQ0FBQyxXQUFXLENBQUM7RUFDdEM7QUFDSixDQUFDLENBQUMiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQXJlbmFNYXRjaFdhaXRpbmdTY2VuZSAtIOernuaKgOWcuuavlOi1m+etieW+heeVjOmdolxuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOaYvuekuuaJgOacieaKpeWQjeeOqeWutuWIl+ihqO+8iOWktOWDjyvmmLXnp7DvvIlcbiAqIDIuIOWunuaXtuabtOaWsOeOqeWutuWKoOWFpeS/oeaBr1xuICogMy4g5pi+56S65YCS6K6h5pe2XG4gKiA0LiDnrYnlvoXpmLbmrrXnu5PmnZ/lkI7oh6rliqjov5vlhaXmuLjmiI9cbiAqIFxuICog8J+Up+OAkOmHjeimgeOAkeatpOiEmuacrOWujOWFqOWKqOaAgeWIm+W7uiBVSe+8jOS4jeS+nei1luWcuuaZr+aWh+S7tuS4reeahOe7hOS7tuW8leeUqFxuICovXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOaXoOWxnuaAp+WumuS5ie+8jOaJgOaciSBVSSDliqjmgIHliJvlu7pcbiAgICB9LFxuXG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICAvLyDliJ3lp4vljJbmlbDmja5cbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBcIlwiXG4gICAgICAgIHRoaXMuX3Jvb21JZCA9IDBcbiAgICAgICAgdGhpcy5fcm9vbU5hbWUgPSBcIlwiXG4gICAgICAgIHRoaXMuX2NvdW50ZG93biA9IDYwXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IDBcbiAgICAgICAgdGhpcy5fZW50ZXJlZFBsYXllcnMgPSAwXG4gICAgICAgIHRoaXMuX3BsYXllcnMgPSBbXVxuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSAwXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmlbTkuKogVUlcbiAgICAgICAgdGhpcy5fY3JlYXRlVUkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5rOo5YaM5LqL5Lu255uR5ZCsXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyRXZlbnRzKClcbiAgICAgICAgXG4gICAgICAgIC8vIOS7juWFqOWxgOWPmOmHj+iOt+WPluWIneWni+aVsOaNrlxuICAgICAgICB0aGlzLl9pbml0RnJvbUdsb2JhbERhdGEoKVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCsIHJvb21fam9pbmVkIOa2iOaBr+S7pei/m+WFpea4uOaIj+WcuuaZr1xuICAgICAgICB0aGlzLl9yZWdpc3RlclJvb21Kb2luZWRIYW5kbGVyKClcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOetieW+heeVjOmdouWKoOi9veWujOaIkFwiKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rlrozmlbQgVUlcbiAgICAgKi9cbiAgICBfY3JlYXRlVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5ub2RlLmdldENvbXBvbmVudChjYy5DYW52YXMpIHx8IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudChjYy5DYW52YXMpXG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjBcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwXG4gICAgICAgIFxuICAgICAgICAvLyAxLiDliJvlu7rog4zmma/vvIjkvb/nlKggam9pbl9iay5wbmfvvIlcbiAgICAgICAgdGhpcy5fY3JlYXRlQmFja2dyb3VuZChzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgLy8gMi4g5Yib5bu66aG26YOo5L+h5oGv5qCPXG4gICAgICAgIHRoaXMuX2NyZWF0ZVRvcEJhcihzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KVxuICAgICAgICBcbiAgICAgICAgLy8gMy4g5Yib5bu6546p5a625YiX6KGo5a655ZmoXG4gICAgICAgIHRoaXMuX2NyZWF0ZVBsYXllckxpc3RDb250YWluZXIoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgXG4gICAgICAgIC8vIDQuIOWIm+W7uuW6lemDqOaMiemSruWMulxuICAgICAgICB0aGlzLl9jcmVhdGVCb3R0b21CdXR0b25zKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuiDjOaZr++8iOS9v+eUqCBqb2luX2JrLnBuZ++8iVxuICAgICAqL1xuICAgIF9jcmVhdGVCYWNrZ3JvdW5kOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIC8vIOWIm+W7uuiDjOaZr+iKgueCuVxuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCYWNrZ3JvdW5kXCIpXG4gICAgICAgIGJnTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHdpZHRoLCBoZWlnaHQpKVxuICAgICAgICBiZ05vZGUuc2V0UG9zaXRpb24oMCwgMClcbiAgICAgICAgYmdOb2RlLnNldExvY2FsWk9yZGVyKC0xMDApXG4gICAgICAgIFxuICAgICAgICB2YXIgc3ByaXRlID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgIHNwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0lNUExFXG4gICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT01cbiAgICAgICAgXG4gICAgICAgIC8vIOWKoOi9veiDjOaZr+WbvueJh1xuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCgnam9pbl9iaycsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOaXoOazleWKoOi9veiDjOaZr+WbviBqb2luX2JrLnBuZ++8jOS9v+eUqOe6r+iJsuiDjOaZr1wiKVxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqOa3seiJsuiDjOaZr+S9nOS4uuWQjuWkh1xuICAgICAgICAgICAgICAgIHZhciBncmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMjUsIDMwLCA1MCwgMjU1KVxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLnJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodClcbiAgICAgICAgICAgICAgICBncmFwaGljcy5maWxsKClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzcHJpdGUgJiYgc3ByaXRlLm5vZGUgJiYgc3ByaXRlLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBiZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX2JnTm9kZSA9IGJnTm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rpobbpg6jkv6Hmga/moI9cbiAgICAgKi9cbiAgICBfY3JlYXRlVG9wQmFyOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIC8vIOmhtumDqOS/oeaBr+agj+WuueWZqFxuICAgICAgICB2YXIgdG9wQmFyID0gbmV3IGNjLk5vZGUoXCJUb3BCYXJcIilcbiAgICAgICAgdG9wQmFyLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGggLSAxMDAsIDEwMCkpXG4gICAgICAgIHRvcEJhci5zZXRQb3NpdGlvbigwLCBoZWlnaHQvMiAtIDgwKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6IOM5pmvXG4gICAgICAgIHZhciBiZyA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgYmcuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCAtIDEwMCwgMTAwKSlcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxNTApXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtKHdpZHRoLTEwMCkvMiwgLTUwLCB3aWR0aC0xMDAsIDEwMCwgMTApXG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZy5wYXJlbnQgPSB0b3BCYXJcbiAgICAgICAgXG4gICAgICAgIC8vIOacn+WPt1xuICAgICAgICB2YXIgcGVyaW9kTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUGVyaW9kTm9cIilcbiAgICAgICAgcGVyaW9kTm9kZS5zZXRQb3NpdGlvbigtd2lkdGgvMiArIDE1MCwgMjUpXG4gICAgICAgIHZhciBwZXJpb2RMYWJlbCA9IHBlcmlvZE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBwZXJpb2RMYWJlbC5zdHJpbmcgPSBcIuacn+WPtzogLS1cIlxuICAgICAgICBwZXJpb2RMYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIHBlcmlvZExhYmVsLmxpbmVIZWlnaHQgPSAyOFxuICAgICAgICBwZXJpb2ROb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyMTUsIDApXG4gICAgICAgIHZhciBwZXJpb2RPdXRsaW5lID0gcGVyaW9kTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBwZXJpb2RPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMCwgMCwgMClcbiAgICAgICAgcGVyaW9kT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgcGVyaW9kTm9kZS5wYXJlbnQgPSB0b3BCYXJcbiAgICAgICAgdGhpcy5fcGVyaW9kTm9MYWJlbCA9IHBlcmlvZExhYmVsXG4gICAgICAgIFxuICAgICAgICAvLyDmiL/pl7TlkI3np7BcbiAgICAgICAgdmFyIHJvb21Ob2RlID0gbmV3IGNjLk5vZGUoXCJSb29tTmFtZVwiKVxuICAgICAgICByb29tTm9kZS5zZXRQb3NpdGlvbigwLCAyNSlcbiAgICAgICAgdmFyIHJvb21MYWJlbCA9IHJvb21Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgcm9vbUxhYmVsLnN0cmluZyA9IFwi56ue5oqA5Zy6XCJcbiAgICAgICAgcm9vbUxhYmVsLmZvbnRTaXplID0gMjhcbiAgICAgICAgcm9vbUxhYmVsLmxpbmVIZWlnaHQgPSAzNlxuICAgICAgICByb29tTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIHZhciByb29tT3V0bGluZSA9IHJvb21Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIHJvb21PdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMCwgMCwgMClcbiAgICAgICAgcm9vbU91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIHJvb21Ob2RlLnBhcmVudCA9IHRvcEJhclxuICAgICAgICB0aGlzLl9yb29tTmFtZUxhYmVsID0gcm9vbUxhYmVsXG4gICAgICAgIFxuICAgICAgICAvLyDlgJLorqHml7ZcbiAgICAgICAgdmFyIGNvdW50ZG93bk5vZGUgPSBuZXcgY2MuTm9kZShcIkNvdW50ZG93blwiKVxuICAgICAgICBjb3VudGRvd25Ob2RlLnNldFBvc2l0aW9uKHdpZHRoLzIgLSAxNTAsIDI1KVxuICAgICAgICB2YXIgY291bnRkb3duTGFiZWwgPSBjb3VudGRvd25Ob2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgY291bnRkb3duTGFiZWwuc3RyaW5nID0gXCI2MOenklwiXG4gICAgICAgIGNvdW50ZG93bkxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgY291bnRkb3duTGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIGNvdW50ZG93bk5vZGUuY29sb3IgPSBjYy5jb2xvcigxMDAsIDI1NSwgMTAwKVxuICAgICAgICB2YXIgY291bnRkb3duT3V0bGluZSA9IGNvdW50ZG93bk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgY291bnRkb3duT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApXG4gICAgICAgIGNvdW50ZG93bk91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIGNvdW50ZG93bk5vZGUucGFyZW50ID0gdG9wQmFyXG4gICAgICAgIHRoaXMuX2NvdW50ZG93bkxhYmVsID0gY291bnRkb3duTGFiZWxcbiAgICAgICAgXG4gICAgICAgIC8vIOeOqeWutuaVsOmHj1xuICAgICAgICB2YXIgcGxheWVyQ291bnROb2RlID0gbmV3IGNjLk5vZGUoXCJQbGF5ZXJDb3VudFwiKVxuICAgICAgICBwbGF5ZXJDb3VudE5vZGUuc2V0UG9zaXRpb24oMCwgLTE1KVxuICAgICAgICB2YXIgcGxheWVyQ291bnRMYWJlbCA9IHBsYXllckNvdW50Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHBsYXllckNvdW50TGFiZWwuc3RyaW5nID0gXCLlt7Lov5vlhaU6IDAgLyAwXCJcbiAgICAgICAgcGxheWVyQ291bnRMYWJlbC5mb250U2l6ZSA9IDIwXG4gICAgICAgIHBsYXllckNvdW50TGFiZWwubGluZUhlaWdodCA9IDI4XG4gICAgICAgIHBsYXllckNvdW50Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDIwMCwgMjAwLCAyMjApXG4gICAgICAgIHBsYXllckNvdW50Tm9kZS5wYXJlbnQgPSB0b3BCYXJcbiAgICAgICAgdGhpcy5fcGxheWVyQ291bnRMYWJlbCA9IHBsYXllckNvdW50TGFiZWxcbiAgICAgICAgXG4gICAgICAgIC8vIOaPkOekuua2iOaBr1xuICAgICAgICB2YXIgbXNnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTWVzc2FnZVwiKVxuICAgICAgICBtc2dOb2RlLnNldFBvc2l0aW9uKDAsIC00NSlcbiAgICAgICAgdmFyIG1zZ0xhYmVsID0gbXNnTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIG1zZ0xhYmVsLnN0cmluZyA9IFwi562J5b6F5YW25LuW546p5a626L+b5YWlLi4uXCJcbiAgICAgICAgbXNnTGFiZWwuZm9udFNpemUgPSAxNlxuICAgICAgICBtc2dMYWJlbC5saW5lSGVpZ2h0ID0gMjRcbiAgICAgICAgbXNnTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIG1zZ05vZGUucGFyZW50ID0gdG9wQmFyXG4gICAgICAgIHRoaXMuX21lc3NhZ2VMYWJlbCA9IG1zZ0xhYmVsXG4gICAgICAgIFxuICAgICAgICB0b3BCYXIucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX3RvcEJhciA9IHRvcEJhclxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnjqnlrrbliJfooajlrrnlmahcbiAgICAgKi9cbiAgICBfY3JlYXRlUGxheWVyTGlzdENvbnRhaW5lcjogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICAvLyDkuLvlrrnlmahcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IG5ldyBjYy5Ob2RlKFwiUGxheWVyTGlzdENvbnRhaW5lclwiKVxuICAgICAgICBjb250YWluZXIuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCAtIDEwMCwgaGVpZ2h0IC0gMjgwKSlcbiAgICAgICAgY29udGFpbmVyLnNldFBvc2l0aW9uKDAsIC0yMClcbiAgICAgICAgXG4gICAgICAgIC8vIOagh+mimFxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZVwiKVxuICAgICAgICB0aXRsZU5vZGUuc2V0UG9zaXRpb24oMCwgaGVpZ2h0LzIgLSAyMDApXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuWPgui1m+eOqeWutlwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAyNlxuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSAzNlxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMClcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICB0aXRsZU91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwKVxuICAgICAgICB0aXRsZU91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSB0aGlzLm5vZGVcbiAgICAgICAgdGhpcy5fdGl0bGVMYWJlbCA9IHRpdGxlTGFiZWxcbiAgICAgICAgXG4gICAgICAgIC8vIFNjcm9sbFZpZXdcbiAgICAgICAgdmFyIHNjcm9sbFZpZXdOb2RlID0gbmV3IGNjLk5vZGUoXCJTY3JvbGxWaWV3XCIpXG4gICAgICAgIHNjcm9sbFZpZXdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGggLSAxMDAsIGhlaWdodCAtIDM0MCkpXG4gICAgICAgIHNjcm9sbFZpZXdOb2RlLnNldFBvc2l0aW9uKDAsIC0zMClcbiAgICAgICAgXG4gICAgICAgIHZhciBzY3JvbGxWaWV3ID0gc2Nyb2xsVmlld05vZGUuYWRkQ29tcG9uZW50KGNjLlNjcm9sbFZpZXcpXG4gICAgICAgIHNjcm9sbFZpZXcuaG9yaXpvbnRhbCA9IGZhbHNlXG4gICAgICAgIHNjcm9sbFZpZXcudmVydGljYWwgPSB0cnVlXG4gICAgICAgIHNjcm9sbFZpZXcuaW5lcnRpYSA9IHRydWVcbiAgICAgICAgc2Nyb2xsVmlldy5lbGFzdGljID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgLy8gQ29udGVudCDoioLngrlcbiAgICAgICAgdmFyIGNvbnRlbnROb2RlID0gbmV3IGNjLk5vZGUoXCJDb250ZW50XCIpXG4gICAgICAgIGNvbnRlbnROb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGggLSAxMjAsIDIwMCkpXG4gICAgICAgIGNvbnRlbnROb2RlLmFuY2hvclkgPSAxXG4gICAgICAgIGNvbnRlbnROb2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqAgTGF5b3V0IOe7hOS7tu+8iOeUqOS6jue9keagvOW4g+WxgO+8iVxuICAgICAgICB2YXIgbGF5b3V0ID0gY29udGVudE5vZGUuYWRkQ29tcG9uZW50KGNjLkxheW91dClcbiAgICAgICAgbGF5b3V0LnR5cGUgPSBjYy5MYXlvdXQuVHlwZS5HUklEXG4gICAgICAgIGxheW91dC5ob3Jpem9udGFsRGlyZWN0aW9uID0gY2MuTGF5b3V0Lkhvcml6b250YWxEaXJlY3Rpb24uTEVGVF9UT19SSUdIVFxuICAgICAgICBsYXlvdXQudmVydGljYWxEaXJlY3Rpb24gPSBjYy5MYXlvdXQuVmVydGljYWxEaXJlY3Rpb24uVE9QX1RPX0JPVFRPTVxuICAgICAgICBsYXlvdXQuY2VsbFNpemUgPSBjYy5zaXplKDE4MCwgMjAwKVxuICAgICAgICBsYXlvdXQuc3RhcnRBeGlzID0gY2MuTGF5b3V0LkF4aXMuSE9SSVpPTlRBTFxuICAgICAgICBsYXlvdXQuY29uc3RyYWludCA9IGNjLkxheW91dC5Db25zdHJhaW50LkZJWEVEX1JPV1xuICAgICAgICBsYXlvdXQuY29uc3RyYWludE51bSA9IDMgIC8vIOS4gOaOkjPkuKpcbiAgICAgICAgbGF5b3V0LnNwYWNpbmdYID0gMjBcbiAgICAgICAgbGF5b3V0LnNwYWNpbmdZID0gMjBcbiAgICAgICAgbGF5b3V0LnBhZGRpbmdUb3AgPSAyMFxuICAgICAgICBsYXlvdXQucGFkZGluZ0JvdHRvbSA9IDIwXG4gICAgICAgIGxheW91dC5wYWRkaW5nTGVmdCA9IDIwXG4gICAgICAgIGxheW91dC5wYWRkaW5nUmlnaHQgPSAyMFxuICAgICAgICBcbiAgICAgICAgY29udGVudE5vZGUucGFyZW50ID0gc2Nyb2xsVmlld05vZGVcbiAgICAgICAgc2Nyb2xsVmlldy5jb250ZW50ID0gY29udGVudE5vZGVcbiAgICAgICAgXG4gICAgICAgIHNjcm9sbFZpZXdOb2RlLnBhcmVudCA9IHRoaXMubm9kZVxuICAgICAgICB0aGlzLl9zY3JvbGxWaWV3ID0gc2Nyb2xsVmlld1xuICAgICAgICB0aGlzLl9wbGF5ZXJMaXN0Q29udGVudCA9IGNvbnRlbnROb2RlXG4gICAgICAgIFxuICAgICAgICBjb250YWluZXIucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX3BsYXllckxpc3RDb250YWluZXIgPSBjb250YWluZXJcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65bqV6YOo5oyJ6ZKu5Yy6XG4gICAgICovXG4gICAgX2NyZWF0ZUJvdHRvbUJ1dHRvbnM6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIGJvdHRvbUJhciA9IG5ldyBjYy5Ob2RlKFwiQm90dG9tQmFyXCIpXG4gICAgICAgIGJvdHRvbUJhci5zZXRQb3NpdGlvbigwLCAtaGVpZ2h0LzIgKyA2MClcbiAgICAgICAgXG4gICAgICAgIC8vIOWPlua2iOaMiemSrlxuICAgICAgICB2YXIgY2FuY2VsQnRuID0gbmV3IGNjLk5vZGUoXCJDYW5jZWxCdXR0b25cIilcbiAgICAgICAgY2FuY2VsQnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTYwLCA1MCkpXG4gICAgICAgIGNhbmNlbEJ0bi5zZXRQb3NpdGlvbigtMTAwLCAwKVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbmNlbEJnID0gY2FuY2VsQnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgY2FuY2VsQmcuZmlsbENvbG9yID0gY2MuY29sb3IoMTgwLCA4MCwgODApXG4gICAgICAgIGNhbmNlbEJnLnJvdW5kUmVjdCgtODAsIC0yNSwgMTYwLCA1MCwgOClcbiAgICAgICAgY2FuY2VsQmcuZmlsbCgpXG4gICAgICAgIFxuICAgICAgICB2YXIgY2FuY2VsTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKVxuICAgICAgICB2YXIgY2FuY2VsTGFiZWwgPSBjYW5jZWxMYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjYW5jZWxMYWJlbC5zdHJpbmcgPSBcIuWPlua2iOi/m+WFpVwiXG4gICAgICAgIGNhbmNlbExhYmVsLmZvbnRTaXplID0gMjBcbiAgICAgICAgY2FuY2VsTGFiZWwubGluZUhlaWdodCA9IDI4XG4gICAgICAgIGNhbmNlbExhYmVsTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIGNhbmNlbExhYmVsTm9kZS5wYXJlbnQgPSBjYW5jZWxCdG5cbiAgICAgICAgXG4gICAgICAgIHZhciBjYW5jZWxCdG5Db21wID0gY2FuY2VsQnRuLmFkZENvbXBvbmVudChjYy5CdXR0b24pXG4gICAgICAgIGNhbmNlbEJ0bkNvbXAudHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFXG4gICAgICAgIGNhbmNlbEJ0bkNvbXAuZHVyYXRpb24gPSAwLjFcbiAgICAgICAgY2FuY2VsQnRuQ29tcC56b29tU2NhbGUgPSAxLjFcbiAgICAgICAgXG4gICAgICAgIGNhbmNlbEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgdGhpcy5vbkNhbmNlbENsaWNrKClcbiAgICAgICAgfSwgdGhpcylcbiAgICAgICAgXG4gICAgICAgIGNhbmNlbEJ0bi5wYXJlbnQgPSBib3R0b21CYXJcbiAgICAgICAgdGhpcy5fY2FuY2VsQnRuID0gY2FuY2VsQnRuXG4gICAgICAgIFxuICAgICAgICBib3R0b21CYXIucGFyZW50ID0gdGhpcy5ub2RlXG4gICAgICAgIHRoaXMuX2JvdHRvbUJhciA9IGJvdHRvbUJhclxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDku47lhajlsYDlj5jph4/liJ3lp4vljJbmlbDmja5cbiAgICAgKi9cbiAgICBfaW5pdEZyb21HbG9iYWxEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIFxuICAgICAgICAvLyDkvJjlhYjmo4Dmn6XnvJPlrZjnmoTnirbmgIHmlbDmja7vvIjmnI3liqHnq6/mjqjpgIHnmoTmnIDmlrDmlbDmja7vvIlcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLmFyZW5hV2FpdGluZ1N0YXR1c0NhY2hlKSB7XG4gICAgICAgICAgICB2YXIgY2FjaGVkRGF0YSA9IG15Z2xvYmFsLmFyZW5hV2FpdGluZ1N0YXR1c0NhY2hlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDlj5HnjrDnvJPlrZjnmoTnrYnlvoXnirbmgIHmlbDmja7vvIznjqnlrrbmlbDph486XCIsIGNhY2hlZERhdGEucGxheWVycyA/IGNhY2hlZERhdGEucGxheWVycy5sZW5ndGggOiAwKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmo4Dmn6XmnJ/lj7fmmK/lkKbljLnphY1cbiAgICAgICAgICAgIHZhciBleHBlY3RlZFBlcmlvZE5vID0gbXlnbG9iYWwuYXJlbmFXYWl0aW5nRGF0YSA/IG15Z2xvYmFsLmFyZW5hV2FpdGluZ0RhdGEucGVyaW9kX25vIDogXCJcIlxuICAgICAgICAgICAgaWYgKCFleHBlY3RlZFBlcmlvZE5vIHx8IGNhY2hlZERhdGEucGVyaW9kX25vID09PSBleHBlY3RlZFBlcmlvZE5vKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBjYWNoZWREYXRhLnBlcmlvZF9ubyB8fCBcIlwiXG4gICAgICAgICAgICAgICAgdGhpcy5fcm9vbUlkID0gY2FjaGVkRGF0YS5yb29tX2lkIHx8IDBcbiAgICAgICAgICAgICAgICB0aGlzLl9yb29tTmFtZSA9IGNhY2hlZERhdGEucm9vbV9uYW1lIHx8IFwiXCJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3VudGRvd24gPSBjYWNoZWREYXRhLmNvdW50ZG93biB8fCA2MFxuICAgICAgICAgICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IGNhY2hlZERhdGEudG90YWxfcGxheWVycyB8fCAwXG4gICAgICAgICAgICAgICAgdGhpcy5fZW50ZXJlZFBsYXllcnMgPSBjYWNoZWREYXRhLmVudGVyZWRfcGxheWVycyB8fCAxXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheWVycyA9IGNhY2hlZERhdGEucGxheWVycyB8fCBbXVxuICAgICAgICAgICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IGNhY2hlZERhdGEuc3RhcnRfdGltZSB8fCBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOS7jue8k+WtmOaVsOaNruWIneWni+WMluWujOaIkO+8jOaYvuekuueOqeWutjpcIiwgdGhpcy5fcGxheWVycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5riF6Zmk57yT5a2YXG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuYXJlbmFXYWl0aW5nU3RhdHVzQ2FjaGUgPSBudWxsXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOS9v+eUqCBhcmVuYVdhaXRpbmdEYXRh77yI54K55Ye76L+b5YWl5pe26K6+572u55qE5pWw5o2u77yJXG4gICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5hcmVuYVdhaXRpbmdEYXRhKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG15Z2xvYmFsLmFyZW5hV2FpdGluZ0RhdGFcbiAgICAgICAgICAgIHRoaXMuX3BlcmlvZE5vID0gZGF0YS5wZXJpb2Rfbm8gfHwgXCJcIlxuICAgICAgICAgICAgdGhpcy5fcm9vbUlkID0gZGF0YS5yb29tX2lkIHx8IDBcbiAgICAgICAgICAgIHRoaXMuX3Jvb21OYW1lID0gZGF0YS5yb29tX25hbWUgfHwgXCJcIlxuICAgICAgICAgICAgdGhpcy5fY291bnRkb3duID0gZGF0YS5jb3VudGRvd24gfHwgNjBcbiAgICAgICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IGRhdGEudG90YWxfcGxheWVycyB8fCAwXG4gICAgICAgICAgICB0aGlzLl9lbnRlcmVkUGxheWVycyA9IGRhdGEuZW50ZXJlZF9wbGF5ZXJzIHx8IDFcbiAgICAgICAgICAgIHRoaXMuX3BsYXllcnMgPSBkYXRhLnBsYXllcnMgfHwgW11cbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IGRhdGEuc3RhcnRfdGltZSB8fCBEYXRlLm5vdygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVVJKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5LuO5YWo5bGA5Y+Y6YeP5Yid5aeL5YyW5pWw5o2u5a6M5oiQXCIpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWmguaenOeOqeWutuWIl+ihqOS4uuepuu+8jOivt+axguacjeWKoeerr+aOqOmAgeeKtuaAgVxuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g546p5a625YiX6KGo5Li656m677yM6K+35rGC5pyN5Yqh56uv5o6o6YCB54q25oCBXCIpXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFdhaXRpbmdTdGF0dXMoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOivt+axguacjeWKoeerr+aOqOmAgeetieW+heeKtuaAgVxuICAgICAqL1xuICAgIF9yZXF1ZXN0V2FpdGluZ1N0YXR1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICB2YXIgc29ja2V0ID0gbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0XG4gICAgICAgIFxuICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5zZW5kQXJlbmFFbnRlcikge1xuICAgICAgICAgICAgLy8g6YeN5paw5Y+R6YCBIGFyZW5hX2VudGVyIOivt+axgu+8jOacjeWKoeerr+S8muaOqOmAgeW9k+WJjeeKtuaAgVxuICAgICAgICAgICAgc29ja2V0LnNlbmRBcmVuYUVudGVyKHtcbiAgICAgICAgICAgICAgICBwZXJpb2Rfbm86IHRoaXMuX3BlcmlvZE5vLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHRoaXMuX3Jvb21JZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOW3suivt+axguacjeWKoeerr+aOqOmAgeetieW+heeKtuaAgVwiKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOebkeWQrCByb29tX2pvaW5lZCDmtojmga/ku6Xov5vlhaXmuLjmiI/lnLrmma9cbiAgICAgKiDwn5Sn44CQ5YWz6ZSu5L+u5pS544CRXG4gICAgICogMS4g5YGc5q2i5Yqg6L295Yqo55S7XG4gICAgICogMi4g5L+d5a2Y6aKE5Yqg6L295pWw5o2u5YiwIG15Z2xvYmFsLnJvb21EYXRhIOWSjCBteWdsb2JhbC5hcmVuYU1hdGNoRGF0YVxuICAgICAqIDMuIOebtOaOpei/m+WFpea4uOaIj+WcuuaZr++8jOaXoOmcgOmHjeaWsOivt+axguaVsOaNrlxuICAgICAqL1xuICAgIF9yZWdpc3RlclJvb21Kb2luZWRIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICB2YXIgc29ja2V0ID0gbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0XG4gICAgICAgIFxuICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5vblJvb21Kb2luZWQpIHtcbiAgICAgICAgICAgIHNvY2tldC5vblJvb21Kb2luZWQoZnVuY3Rpb24ocm9vbURhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDmlLbliLAgcm9vbV9qb2luZWTvvIzlh4blpIfov5vlhaXmuLjmiI/lnLrmma86XCIsIEpTT04uc3RyaW5naWZ5KHJvb21EYXRhKSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmmK/nq57mioDlnLrmiL/pl7RcbiAgICAgICAgICAgICAgICB2YXIgcm9vbUNhdGVnb3J5ID0gcm9vbURhdGEucm9vbV9jYXRlZ29yeSB8fCAxXG4gICAgICAgICAgICAgICAgaWYgKHJvb21DYXRlZ29yeSAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDkuI3mmK/nq57mioDlnLrmiL/pl7TvvIzlv73nlaVcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67lpI3jgJHlgZzmraLliqDovb3liqjnlLtcbiAgICAgICAgICAgICAgICBzZWxmLl9zdG9wTG9hZGluZ0FuaW1hdGlvbigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6L2s5o2i5pWw5o2u5qC85byPXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllcnMgPSByb29tRGF0YS5wbGF5ZXJzIHx8IFtdXG4gICAgICAgICAgICAgICAgdmFyIGNvbnZlcnRlZFJvb21EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByb29taWQ6IHJvb21EYXRhLnJvb21fY29kZSB8fCBcIkFSRU5BXCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21fY29kZTogcm9vbURhdGEucm9vbV9jb2RlIHx8IFwiQVJFTkFcIixcbiAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiByb29tRGF0YS5wbGF5ZXIgPyByb29tRGF0YS5wbGF5ZXIuc2VhdCArIDEgOiAxLFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBwbGF5ZXJzLm1hcChmdW5jdGlvbihwLCBpZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudGlkOiBwLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5pY2tfbmFtZTogcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcC5hdmF0YXIgfHwgXCJhdmF0YXJfMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRfY291bnQ6IHAuZ29sZF9jb3VudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogcC5nb2xkX2NvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiAocC5zZWF0ICE9PSB1bmRlZmluZWQgPyBwLnNlYXQgOiBpZHgpICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3JlYWR5OiBwLnJlYWR5IHx8IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZW5hX2dvbGQ6IHAuYXJlbmFfZ29sZCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoX2NvaW46IHAubWF0Y2hfY29pbiB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZF9ubzogcC5wZXJpb2Rfbm8gfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgaG91c2VtYW5hZ2VpZDogcm9vbURhdGEuY3JlYXRvcl9pZCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdG9yX2lkOiByb29tRGF0YS5jcmVhdG9yX2lkIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21fY2F0ZWdvcnk6IDIsXG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZF9ubzogc2VsZi5fcGVyaW9kTm9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeS/neWtmOmihOWKoOi9veaVsOaNruWIsCBteWdsb2JhbFxuICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjmiL/pl7TmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucm9vbURhdGEgPSBjb252ZXJ0ZWRSb29tRGF0YVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOernuaKgOWcuuavlOi1m+aVsOaNru+8iOeUqOS6jua4uOaIj+WcuuaZr++8iVxuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5hcmVuYU1hdGNoRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZE5vOiBzZWxmLl9wZXJpb2RObyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZDogc2VsZi5fcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHNlbGYuX3Jvb21OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxQbGF5ZXJzOiBzZWxmLl90b3RhbFBsYXllcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRhYmxlczogc2VsZi5fdG90YWxUYWJsZXMgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcnM6IHNlbGYuX3BsYXllcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFJvdW5kczogcm9vbURhdGEubWF0Y2hfcm91bmRzIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um91bmQ6IHJvb21EYXRhLmN1cnJlbnRfcm91bmQgfHwgMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDpooTliqDovb3mlbDmja7lt7Lkv53lrZg6XCIpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICAtIG15Z2xvYmFsLnJvb21EYXRhLnBsYXllcmRhdGE6XCIsIGNvbnZlcnRlZFJvb21EYXRhLnBsYXllcmRhdGEubGVuZ3RoLCBcIuS6ulwiKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgLSBteWdsb2JhbC5hcmVuYU1hdGNoRGF0YS5wZXJpb2RObzpcIiwgc2VsZi5fcGVyaW9kTm8pXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICAtIOWktOWDj+e8k+WtmOaVsOmHjzpcIiwgbXlnbG9iYWwuX2F2YXRhckNhY2hlID8gT2JqZWN0LmtleXMobXlnbG9iYWwuX2F2YXRhckNhY2hlKS5sZW5ndGggOiAwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5LyY5YyW44CR55u05o6l6L+b5YWl5ri45oiP5Zy65pmv77yM5peg6ZyA6YeN5paw6K+35rGC5pWw5o2uXG4gICAgICAgICAgICAgICAgLy8g5ri45oiP5Zy65pmv5Lya5LuOIG15Z2xvYmFsLnJvb21EYXRhIOivu+WPlumihOWKoOi9veaVsOaNrlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOi/m+WFpea4uOaIj+WcuuaZry4uLlwiKVxuICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImdhbWVTY2VuZVwiKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkRlc3Ryb3kgKCkge1xuICAgICAgICAvLyDlgZzmraLliqDovb3liqjnlLtcbiAgICAgICAgdGhpcy5fc3RvcExvYWRpbmdBbmltYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+W5raI5LqL5Lu255uR5ZCsXG4gICAgICAgIHRoaXMuX3VucmVnaXN0ZXJFdmVudHMoKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5Zy65pmv6ZSA5q+B77yM5bey5YGc5q2i5Yqg6L295Yqo55S7XCIpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOS6i+S7tuebkeWQrFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3JlZ2lzdGVyRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKznrYnlvoXnirbmgIHmjqjpgIFcbiAgICAgICAgaWYgKHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICB2YXIgc29ja2V0ID0gd2luZG93Lm15Z2xvYmFsLnNvY2tldFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDnrYnlvoXnirbmgIHmjqjpgIFcbiAgICAgICAgICAgIHNvY2tldC5vbihcImFyZW5hX3dhaXRpbmdfc3RhdHVzX25vdGlmeVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5pS25Yiw562J5b6F54q25oCBOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgICAgICAgICBzZWxmLl9vbldhaXRpbmdTdGF0dXMoZGF0YSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWAkuiuoeaXtuabtOaWsFxuICAgICAgICAgICAgc29ja2V0Lm9uKFwiYXJlbmFfd2FpdGluZ190aWNrX25vdGlmeVwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5YCS6K6h5pe25pu05pawOlwiLCBkYXRhLmNvdW50ZG93bilcbiAgICAgICAgICAgICAgICBzZWxmLl9vbldhaXRpbmdUaWNrKGRhdGEpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDnjqnlrrbliqDlhaXlub/mkq1cbiAgICAgICAgICAgIHNvY2tldC5vbihcImFyZW5hX3BsYXllcl9qb2luZWRfbm90aWZ5XCIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDnjqnlrrbliqDlhaU6XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAgICAgIHNlbGYuX29uUGxheWVySm9pbmVkKGRhdGEpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliIbphY3pmLbmrrXlvIDlp4tcbiAgICAgICAgICAgIHNvY2tldC5vbihcImFyZW5hX2Fzc2lnbl9zdGFydF9ub3RpZnlcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOWIhumFjemYtuauteW8gOWnizpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgICAgICAgICAgc2VsZi5fb25Bc3NpZ25TdGFydChkYXRhKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfdW5yZWdpc3RlckV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOS6i+S7tuS8mumaj+iKgueCuemUgOavgeiHquWKqOWPlua2iFxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlhazlhbHmlrnms5VcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruWIneWni+aVsOaNrlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBwZXJpb2Rfbm8sIHJvb21faWQsIHJvb21fbmFtZSwgY291bnRkb3duLCB0b3RhbF9wbGF5ZXJzLCBlbnRlcmVkX3BsYXllcnMsIHBsYXllcnMsIG1lc3NhZ2UgfVxuICAgICAqL1xuICAgIHNldERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBkYXRhLnBlcmlvZF9ubyB8fCBcIlwiXG4gICAgICAgIHRoaXMuX3Jvb21JZCA9IGRhdGEucm9vbV9pZCB8fCAwXG4gICAgICAgIHRoaXMuX3Jvb21OYW1lID0gZGF0YS5yb29tX25hbWUgfHwgXCJcIlxuICAgICAgICB0aGlzLl9jb3VudGRvd24gPSBkYXRhLmNvdW50ZG93biB8fCA2MFxuICAgICAgICB0aGlzLl90b3RhbFBsYXllcnMgPSBkYXRhLnRvdGFsX3BsYXllcnMgfHwgMFxuICAgICAgICB0aGlzLl9lbnRlcmVkUGxheWVycyA9IGRhdGEuZW50ZXJlZF9wbGF5ZXJzIHx8IDBcbiAgICAgICAgdGhpcy5fcGxheWVycyA9IGRhdGEucGxheWVycyB8fCBbXVxuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSBkYXRhLnN0YXJ0X3RpbWUgfHwgRGF0ZS5ub3coKVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDkuovku7blpITnkIZcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9vbldhaXRpbmdTdGF0dXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8g5qOA5p+l5pyf5Y+35piv5ZCm5Yy56YWNXG4gICAgICAgIGlmICh0aGlzLl9wZXJpb2RObyAmJiBkYXRhLnBlcmlvZF9ubyAhPT0gdGhpcy5fcGVyaW9kTm8pIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9wZXJpb2RObyA9IGRhdGEucGVyaW9kX25vXG4gICAgICAgIHRoaXMuX3Jvb21JZCA9IGRhdGEucm9vbV9pZFxuICAgICAgICB0aGlzLl9yb29tTmFtZSA9IGRhdGEucm9vbV9uYW1lXG4gICAgICAgIHRoaXMuX2NvdW50ZG93biA9IGRhdGEuY291bnRkb3duXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IGRhdGEudG90YWxfcGxheWVyc1xuICAgICAgICB0aGlzLl9lbnRlcmVkUGxheWVycyA9IGRhdGEuZW50ZXJlZF9wbGF5ZXJzXG4gICAgICAgIHRoaXMuX3BsYXllcnMgPSBkYXRhLnBsYXllcnNcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lID0gZGF0YS5zdGFydF90aW1lXG4gICAgICAgIFxuICAgICAgICB0aGlzLl91cGRhdGVVSSgpXG4gICAgfSxcblxuICAgIF9vbldhaXRpbmdUaWNrOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fY291bnRkb3duID0gZGF0YS5jb3VudGRvd25cbiAgICAgICAgdGhpcy5fZW50ZXJlZFBsYXllcnMgPSBkYXRhLmVudGVyZWRfcGxheWVyc1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fdXBkYXRlQ291bnRkb3duVUkoKVxuICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJDb3VudFVJKClcbiAgICB9LFxuXG4gICAgX29uUGxheWVySm9pbmVkOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw546p5a625YiX6KGoXG4gICAgICAgIHRoaXMuX3BsYXllcnMgPSBkYXRhLnBsYXllcnMgfHwgW11cbiAgICAgICAgdGhpcy5fZW50ZXJlZFBsYXllcnMgPSBkYXRhLmVudGVyZWRfcGxheWVyc1xuICAgICAgICB0aGlzLl90b3RhbFBsYXllcnMgPSBkYXRhLnRvdGFsX3BsYXllcnNcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuWKoOWFpeaPkOekulxuICAgICAgICB2YXIgbmV3UGxheWVyID0gZGF0YS5wbGF5ZXJcbiAgICAgICAgaWYgKG5ld1BsYXllciAmJiBuZXdQbGF5ZXIucGxheWVyX25hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dKb2luTWVzc2FnZShuZXdQbGF5ZXIucGxheWVyX25hbWUgKyBcIiDov5vlhaXkuobmr5TotZtcIilcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgdGhpcy5fdXBkYXRlUGxheWVyTGlzdFVJKClcbiAgICAgICAgdGhpcy5fdXBkYXRlUGxheWVyQ291bnRVSSgpXG4gICAgfSxcblxuICAgIF9vbkFzc2lnblN0YXJ0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5YiG6YWN6Zi25q615byA5aeLOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2NvdW50ZG93biA9IGRhdGEuY291bnRkb3duXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IGRhdGEudG90YWxfcGxheWVyc1xuICAgICAgICB0aGlzLl9lbnRlcmVkUGxheWVycyA9IGRhdGEudG90YWxfcGxheWVyc1xuICAgICAgICB0aGlzLl90b3RhbFRhYmxlcyA9IGRhdGEudG90YWxfdGFibGVzIHx8IDBcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67mlLnjgJHmmL7npLpcIuezu+e7n+WIhumFjeS4rVwi5Yqg6L295Yqo55S7XG4gICAgICAgIHRoaXMuX3Nob3dBc3NpZ25pbmdMb2FkaW5nVUkoZGF0YSlcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDlhbPplK7kv67mlLnjgJHpooTliqDovb3miYDmnInnjqnlrrblpLTlg4/otYTmupBcbiAgICAgICAgdGhpcy5fcHJlbG9hZEFsbFBsYXllckF2YXRhcnMoKVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeaYvuekulwi57O757uf5YiG6YWN5LitXCLliqDovb3liqjnlLtcbiAgICAgKi9cbiAgICBfc2hvd0Fzc2lnbmluZ0xvYWRpbmdVSTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgXG4gICAgICAgIC8vIOmakOiXj+WPlua2iOaMiemSru+8iOWIhumFjemYtuauteS4jeiDveWPlua2iO+8iVxuICAgICAgICBpZiAodGhpcy5fY2FuY2VsQnRuKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxCdG4uYWN0aXZlID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65YiG6YWN5raI5oGvXG4gICAgICAgIGlmICh0aGlzLl9tZXNzYWdlTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VMYWJlbC5zdHJpbmcgPSBkYXRhLm1lc3NhZ2UgfHwgXCLns7vnu5/liIbphY3kuK0uLi5cIlxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZUxhYmVsLm5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIyMCwgMTAwKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rliqDovb3liqjnlLvopobnm5blsYJcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKVxuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MFxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65Yqg6L296KaG55uW5bGCXG4gICAgICAgIHZhciBsb2FkaW5nT3ZlcmxheSA9IG5ldyBjYy5Ob2RlKFwiQXNzaWduaW5nTG9hZGluZ092ZXJsYXlcIilcbiAgICAgICAgbG9hZGluZ092ZXJsYXkuc2V0Q29udGVudFNpemUoY2Muc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSlcbiAgICAgICAgbG9hZGluZ092ZXJsYXkuc2V0UG9zaXRpb24oMCwgMClcbiAgICAgICAgbG9hZGluZ092ZXJsYXkuekluZGV4ID0gMTAwMFxuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIGJnTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKVxuICAgICAgICB2YXIgYmdHcmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgMTUwKVxuICAgICAgICBiZ0dyYXBoaWNzLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgYmdHcmFwaGljcy5maWxsKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGxvYWRpbmdPdmVybGF5XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rliqDovb3lm77moIflrrnlmajvvIjml4vovazliqjnlLvvvIlcbiAgICAgICAgdmFyIGxvYWRpbmdDb250YWluZXIgPSBuZXcgY2MuTm9kZShcIkxvYWRpbmdDb250YWluZXJcIilcbiAgICAgICAgbG9hZGluZ0NvbnRhaW5lci5zZXRQb3NpdGlvbigwLCA1MClcbiAgICAgICAgbG9hZGluZ0NvbnRhaW5lci5wYXJlbnQgPSBsb2FkaW5nT3ZlcmxheVxuICAgICAgICBcbiAgICAgICAgLy8g5Yqg6L295Zu+5qCH77yI5L2/55So566A5Y2V55qE5ZyG5b2i5peL6L2s5Yqo55S777yJXG4gICAgICAgIHZhciBsb2FkaW5nSWNvbiA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0ljb25cIilcbiAgICAgICAgbG9hZGluZ0ljb24uc2V0Q29udGVudFNpemUoY2Muc2l6ZSg2MCwgNjApKVxuICAgICAgICB2YXIgaWNvbkdyYXBoaWNzID0gbG9hZGluZ0ljb24uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICAvLyDnu5jliLbliqDovb3lnIbnjq9cbiAgICAgICAgaWNvbkdyYXBoaWNzLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjU1LCAyMTUsIDApXG4gICAgICAgIGljb25HcmFwaGljcy5saW5lV2lkdGggPSA0XG4gICAgICAgIGljb25HcmFwaGljcy5hcmMoMCwgMCwgMjUsIDAsIE1hdGguUEkgKiAxLjUsIGZhbHNlKVxuICAgICAgICBpY29uR3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgbG9hZGluZ0ljb24ucGFyZW50ID0gbG9hZGluZ0NvbnRhaW5lclxuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y5byV55So5Lul5L6/5peL6L2s5Yqo55S7XG4gICAgICAgIHRoaXMuX2xvYWRpbmdJY29uTm9kZSA9IGxvYWRpbmdJY29uXG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3mloflrZdcbiAgICAgICAgdmFyIGxvYWRpbmdMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0xhYmVsXCIpXG4gICAgICAgIGxvYWRpbmdMYWJlbC5zZXRQb3NpdGlvbigwLCAtMzApXG4gICAgICAgIHZhciBsYWJlbCA9IGxvYWRpbmdMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGxhYmVsLnN0cmluZyA9IFwi57O757uf5YiG6YWN5LitLi4uXCJcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyOFxuICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gMzZcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBsb2FkaW5nTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIyMCwgMTAwKVxuICAgICAgICB2YXIgb3V0bGluZSA9IGxvYWRpbmdMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBvdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMCwgMCwgMClcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgbG9hZGluZ0xhYmVsLnBhcmVudCA9IGxvYWRpbmdDb250YWluZXJcbiAgICAgICAgdGhpcy5fYXNzaWduaW5nTG9hZGluZ0xhYmVsID0gbGFiZWxcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuuWIhumFjeS/oeaBr1xuICAgICAgICB2YXIgaW5mb0xhYmVsID0gbmV3IGNjLk5vZGUoXCJJbmZvTGFiZWxcIilcbiAgICAgICAgaW5mb0xhYmVsLnNldFBvc2l0aW9uKDAsIC03MClcbiAgICAgICAgdmFyIGluZm9MYWJlbENvbXAgPSBpbmZvTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB2YXIgdG90YWxUYWJsZXMgPSBkYXRhLnRvdGFsX3RhYmxlcyB8fCAwXG4gICAgICAgIHZhciB0b3RhbFBsYXllcnMgPSBkYXRhLnRvdGFsX3BsYXllcnMgfHwgMFxuICAgICAgICBpbmZvTGFiZWxDb21wLnN0cmluZyA9IFwi5q2j5Zyo5YiG6YWNIFwiICsgdG90YWxQbGF5ZXJzICsgXCIg5ZCN546p5a625YiwIFwiICsgdG90YWxUYWJsZXMgKyBcIiDmoYxcIlxuICAgICAgICBpbmZvTGFiZWxDb21wLmZvbnRTaXplID0gMThcbiAgICAgICAgaW5mb0xhYmVsQ29tcC5saW5lSGVpZ2h0ID0gMjRcbiAgICAgICAgaW5mb0xhYmVsQ29tcC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGluZm9MYWJlbC5jb2xvciA9IGNjLmNvbG9yKDIwMCwgMjAwLCAyMjApXG4gICAgICAgIGluZm9MYWJlbC5wYXJlbnQgPSBsb2FkaW5nQ29udGFpbmVyXG4gICAgICAgIFxuICAgICAgICBsb2FkaW5nT3ZlcmxheS5wYXJlbnQgPSB0aGlzLm5vZGVcbiAgICAgICAgdGhpcy5fYXNzaWduaW5nTG9hZGluZ092ZXJsYXkgPSBsb2FkaW5nT3ZlcmxheVxuICAgICAgICBcbiAgICAgICAgLy8g5ZCv5Yqo5peL6L2s5Yqo55S7XG4gICAgICAgIHRoaXMuX3N0YXJ0TG9hZGluZ0FuaW1hdGlvbigpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDmmL7npLon57O757uf5YiG6YWN5LitJ+WKoOi9veWKqOeUu1wiKVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWQr+WKqOWKoOi9veWKqOeUu1xuICAgICAqL1xuICAgIF9zdGFydExvYWRpbmdBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgdGhpcy5fbG9hZGluZ0FuaW1TY2hlZHVsZWQgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICAvLyDkvb/nlKggc2NoZWR1bGUg5pu05paw5peL6L2s6KeS5bqmXG4gICAgICAgIHRoaXMuc2NoZWR1bGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fbG9hZGluZ0ljb25Ob2RlICYmIHNlbGYuX2xvYWRpbmdJY29uTm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9hZGluZ0ljb25Ob2RlLmFuZ2xlICs9IDVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMC4wMTYpICAvLyDnuqY2MGZwc1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeWBnOatouWKoOi9veWKqOeUu1xuICAgICAqL1xuICAgIF9zdG9wTG9hZGluZ0FuaW1hdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9sb2FkaW5nQW5pbVNjaGVkdWxlZCkge1xuICAgICAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuX3N0YXJ0TG9hZGluZ0FuaW1hdGlvbilcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdBbmltU2NoZWR1bGVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX2Fzc2lnbmluZ0xvYWRpbmdPdmVybGF5ICYmIHRoaXMuX2Fzc2lnbmluZ0xvYWRpbmdPdmVybGF5LmlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnbmluZ0xvYWRpbmdPdmVybGF5LmRlc3Ryb3koKVxuICAgICAgICAgICAgdGhpcy5fYXNzaWduaW5nTG9hZGluZ092ZXJsYXkgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2xvYWRpbmdJY29uTm9kZSA9IG51bGxcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHpooTliqDovb3miYDmnInnjqnlrrblpLTlg4/otYTmupBcbiAgICAgKi9cbiAgICBfcHJlbG9hZEFsbFBsYXllckF2YXRhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgXG4gICAgICAgIGlmICghdGhpcy5fcGxheWVycyB8fCB0aGlzLl9wbGF5ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g5rKh5pyJ546p5a625aS05YOP6ZyA6KaB6aKE5Yqg6L29XCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pS26ZuG5omA5pyJ5aS05YOPVVJMXG4gICAgICAgIHZhciBhdmF0YXJVcmxzID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gdGhpcy5fcGxheWVyc1tpXVxuICAgICAgICAgICAgdmFyIGF2YXRhclVybCA9IHBsYXllci5hdmF0YXIgfHwgcGxheWVyLmF2YXRhclVybCB8fCBcImF2YXRhcl8xXCJcbiAgICAgICAgICAgIGlmIChhdmF0YXJVcmwgJiYgYXZhdGFyVXJscy5pbmRleE9mKGF2YXRhclVybCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyVXJscy5wdXNoKGF2YXRhclVybClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYU1hdGNoV2FpdGluZ10g6aKE5Yqg6L29546p5a625aS05YOP5pWw6YePOlwiLCBhdmF0YXJVcmxzLmxlbmd0aClcbiAgICAgICAgXG4gICAgICAgIC8vIOWIneWni+WMluWktOWDj+e8k+WtmFxuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWxcbiAgICAgICAgaWYgKG15Z2xvYmFsICYmICFteWdsb2JhbC5fYXZhdGFyQ2FjaGUpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLl9hdmF0YXJDYWNoZSA9IHt9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmihOWKoOi9veWktOWDj1xuICAgICAgICB2YXIgbG9hZGVkQ291bnQgPSAwXG4gICAgICAgIHZhciB0b3RhbENvdW50ID0gYXZhdGFyVXJscy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIHZhciBvbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9hZGVkQ291bnQrK1xuICAgICAgICAgICAgaWYgKGxvYWRlZENvdW50ID49IHRvdGFsQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDmiYDmnInnjqnlrrblpLTlg4/pooTliqDovb3lrozmiJBcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhdmF0YXJVcmxzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVsb2FkU2luZ2xlQXZhdGFyKGF2YXRhclVybHNbal0sIG9uTG9hZGVkKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6aKE5Yqg6L295Y2V5Liq5aS05YOPXG4gICAgICovXG4gICAgX3ByZWxvYWRTaW5nbGVBdmF0YXI6IGZ1bmN0aW9uKGF2YXRhclVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzlt7LnvJPlrZjvvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKG15Z2xvYmFsICYmIG15Z2xvYmFsLl9hdmF0YXJDYWNoZSAmJiBteWdsb2JhbC5fYXZhdGFyQ2FjaGVbYXZhdGFyVXJsXSkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Yik5pat5piv5ZCm5piv6L+c56iLVVJMXG4gICAgICAgIGlmIChhdmF0YXJVcmwuaW5kZXhPZignaHR0cDovLycpID09PSAwIHx8IGF2YXRhclVybC5pbmRleE9mKCdodHRwczovLycpID09PSAwKSB7XG4gICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZShhdmF0YXJVcmwsIHsgZXh0OiAnLnBuZycgfSwgZnVuY3Rpb24oZXJyLCB0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgdGV4dHVyZSAmJiBteWdsb2JhbCAmJiBteWdsb2JhbC5fYXZhdGFyQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLl9hdmF0YXJDYWNoZVthdmF0YXJVcmxdID0gbmV3IGNjLlNwcml0ZUZyYW1lKHRleHR1cmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDov5znqIvlpLTlg4/pooTliqDovb3miJDlip86XCIsIGF2YXRhclVybClcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOe8k+WtmOWktOWDj+Wksei0pTpcIiwgZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDmnKzlnLDotYTmupBcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKCdVSS9oZWFkaW1hZ2UvJyArIGF2YXRhclVybCwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBteWdsb2JhbCAmJiBteWdsb2JhbC5fYXZhdGFyQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuX2F2YXRhckNhY2hlW2F2YXRhclVybF0gPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDmnKzlnLDlpLTlg4/pooTliqDovb3miJDlip86XCIsIGF2YXRhclVybClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVJ5pu05pawXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfdXBkYXRlVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmm7TmlrDmnJ/lj7dcbiAgICAgICAgaWYgKHRoaXMuX3BlcmlvZE5vTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlcmlvZE5vTGFiZWwuc3RyaW5nID0gXCLmnJ/lj7c6IFwiICsgdGhpcy5fcGVyaW9kTm9cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5oi/6Ze05ZCN56ewXG4gICAgICAgIGlmICh0aGlzLl9yb29tTmFtZUxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLl9yb29tTmFtZUxhYmVsLnN0cmluZyA9IHRoaXMuX3Jvb21OYW1lIHx8IFwi56ue5oqA5Zy6XCJcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw5YCS6K6h5pe2XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvdW50ZG93blVJKClcbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOmHj1xuICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJDb3VudFVJKClcbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOeOqeWutuWIl+ihqFxuICAgICAgICB0aGlzLl91cGRhdGVQbGF5ZXJMaXN0VUkoKVxuICAgIH0sXG5cbiAgICBfdXBkYXRlQ291bnRkb3duVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50ZG93bkxhYmVsLnN0cmluZyA9IHRoaXMuX2NvdW50ZG93biArIFwi56eSXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pyA5ZCOMTDnp5Llj5jnuqJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jb3VudGRvd24gPD0gMTAgJiYgdGhpcy5fY291bnRkb3duID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvdW50ZG93bkxhYmVsLm5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDEwMCwgMTAwKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb3VudGRvd25MYWJlbC5ub2RlLmNvbG9yID0gY2MuY29sb3IoMTAwLCAyNTUsIDEwMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfdXBkYXRlUGxheWVyQ291bnRVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5ZXJDb3VudExhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLl9wbGF5ZXJDb3VudExhYmVsLnN0cmluZyA9IFwi5bey6L+b5YWlOiBcIiArIHRoaXMuX2VudGVyZWRQbGF5ZXJzICsgXCIgLyBcIiArIHRoaXMuX3RvdGFsUGxheWVyc1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOeOqeWutuWIl+ihqOa4suafk++8iHVsID4gbGkg5b2i5byP77yM5LiA5o6SM+S4qu+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3VwZGF0ZVBsYXllckxpc3RVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5fcGxheWVyTGlzdENvbnRlbnQpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g5riF56m6546w5pyJ5YiX6KGoXG4gICAgICAgIHRoaXMuX3BsYXllckxpc3RDb250ZW50LnJlbW92ZUFsbENoaWxkcmVuKClcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFNYXRjaFdhaXRpbmddIOabtOaWsOeOqeWutuWIl+ihqO+8jOeOqeWutuaVsOmHjzpcIiwgdGhpcy5fcGxheWVycy5sZW5ndGgpXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDnjqnlrrbpoblcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVyID0gdGhpcy5fcGxheWVyc1tpXVxuICAgICAgICAgICAgdmFyIGl0ZW1Ob2RlID0gdGhpcy5fY3JlYXRlUGxheWVySXRlbShwbGF5ZXIsIGkpXG4gICAgICAgICAgICBpdGVtTm9kZS5wYXJlbnQgPSB0aGlzLl9wbGF5ZXJMaXN0Q29udGVudFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDlrrnlmajpq5jluqZcbiAgICAgICAgdmFyIHJvd3MgPSBNYXRoLmNlaWwodGhpcy5fcGxheWVycy5sZW5ndGggLyAzKVxuICAgICAgICB2YXIgY29udGVudEhlaWdodCA9IHJvd3MgKiAyMjAgKyA0MCAgLy8g5q+P6KGM6auY5bqmIDIyMO+8jOWKoOS4iui+uei3nVxuICAgICAgICB0aGlzLl9wbGF5ZXJMaXN0Q29udGVudC5zZXRDb250ZW50U2l6ZSh0aGlzLl9wbGF5ZXJMaXN0Q29udGVudC53aWR0aCwgTWF0aC5tYXgoY29udGVudEhlaWdodCwgMjAwKSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog5Yib5bu6546p5a626aG56IqC54K577yI5aS05YOPICsg5pi156ew5Zyo5aS05YOP5LiL6Z2i77yJXG4gICAgICovXG4gICAgX2NyZWF0ZVBsYXllckl0ZW06IGZ1bmN0aW9uKHBsYXllciwgaW5kZXgpIHtcbiAgICAgICAgLy8g5Yib5bu6IGxpIOiKgueCue+8iOWNleS4queOqeWutuWNoeeJh++8iVxuICAgICAgICB2YXIgaXRlbU5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYXllckl0ZW1fXCIgKyBpbmRleClcbiAgICAgICAgaXRlbU5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxODAsIDIwMCkpXG4gICAgICAgIFxuICAgICAgICAvLyDljaHniYfog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdcIilcbiAgICAgICAgYmdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTcwLCAxOTApKVxuICAgICAgICB2YXIgYmdHcmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoNDAsIDQ1LCA3MCwgMjAwKVxuICAgICAgICBiZ0dyYXBoaWNzLnJvdW5kUmVjdCgtODUsIC05NSwgMTcwLCAxOTAsIDEwKVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZ0dyYXBoaWNzLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTAwLCAxMjAsIDE4MClcbiAgICAgICAgYmdHcmFwaGljcy5saW5lV2lkdGggPSAyXG4gICAgICAgIGJnR3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rlpLTlg4/oioLngrlcbiAgICAgICAgdmFyIGF2YXRhck5vZGUgPSBuZXcgY2MuTm9kZShcIkF2YXRhclwiKVxuICAgICAgICBhdmF0YXJOb2RlLnNldFBvc2l0aW9uKDAsIDMwKVxuICAgICAgICBhdmF0YXJOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTAwLCAxMDApKVxuICAgICAgICBcbiAgICAgICAgdmFyIGF2YXRhclNwcml0ZSA9IGF2YXRhck5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSlcbiAgICAgICAgYXZhdGFyU3ByaXRlLnR5cGUgPSBjYy5TcHJpdGUuVHlwZS5TSU1QTEVcbiAgICAgICAgYXZhdGFyU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTVxuICAgICAgICBcbiAgICAgICAgLy8g5Yqg6L295aS05YOPXG4gICAgICAgIHRoaXMuX2xvYWRQbGF5ZXJBdmF0YXIocGxheWVyLmF2YXRhciwgYXZhdGFyU3ByaXRlKVxuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65ZyG5b2i6YGu572pXG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyTWFza1wiKVxuICAgICAgICBtYXNrTm9kZS5zZXRQb3NpdGlvbigwLCAzMClcbiAgICAgICAgbWFza05vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxMDAsIDEwMCkpXG4gICAgICAgIFxuICAgICAgICB2YXIgbWFzayA9IG1hc2tOb2RlLmFkZENvbXBvbmVudChjYy5NYXNrKVxuICAgICAgICBtYXNrLnR5cGUgPSBjYy5NYXNrLlR5cGUuRUxMSVBTRVxuICAgICAgICBtYXNrLnNlZ2VtZW50cyA9IDY0XG4gICAgICAgIFxuICAgICAgICBhdmF0YXJOb2RlLnBhcmVudCA9IG1hc2tOb2RlXG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmmLXnp7DoioLngrnvvIjlnKjlpLTlg4/kuIvpnaLvvIlcbiAgICAgICAgdmFyIG5hbWVOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lTGFiZWxcIilcbiAgICAgICAgbmFtZU5vZGUuc2V0UG9zaXRpb24oMCwgLTU1KVxuICAgICAgICBcbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5hbWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdmFyIHBsYXllck5hbWUgPSBwbGF5ZXIucGxheWVyX25hbWUgfHwgcGxheWVyLm5hbWUgfHwgKFwi546p5a62XCIgKyAocGxheWVyLnBsYXllcl9pZCB8fCBpbmRleCkpXG4gICAgICAgIG5hbWVMYWJlbC5zdHJpbmcgPSBwbGF5ZXJOYW1lXG4gICAgICAgIG5hbWVMYWJlbC5mb250U2l6ZSA9IDE4XG4gICAgICAgIG5hbWVMYWJlbC5saW5lSGVpZ2h0ID0gMjRcbiAgICAgICAgbmFtZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgbmFtZU5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxNjAsIDI0KSlcbiAgICAgICAgXG4gICAgICAgIC8vIOacuuWZqOS6uueUqOeBsOiJsu+8jOecn+S6uueUqOeZveiJslxuICAgICAgICBpZiAocGxheWVyLmlzX3JvYm90KSB7XG4gICAgICAgICAgICBuYW1lTm9kZS5jb2xvciA9IGNjLmNvbG9yKDE1MCwgMTUwLCAxNTApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaPj+i+ueaViOaenFxuICAgICAgICB2YXIgb3V0bGluZSA9IG5hbWVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwKVxuICAgICAgICBvdXRsaW5lLndpZHRoID0gMlxuICAgICAgICBcbiAgICAgICAgbmFtZU5vZGUucGFyZW50ID0gaXRlbU5vZGVcbiAgICAgICAgXG4gICAgICAgIC8vIOacuuWZqOS6uuagh+ivhlxuICAgICAgICBpZiAocGxheWVyLmlzX3JvYm90KSB7XG4gICAgICAgICAgICB2YXIgcm9ib3RUYWcgPSBuZXcgY2MuTm9kZShcIlJvYm90VGFnXCIpXG4gICAgICAgICAgICByb2JvdFRhZy5zZXRQb3NpdGlvbig2MCwgNzApXG4gICAgICAgICAgICB2YXIgdGFnTGFiZWwgPSByb2JvdFRhZy5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICB0YWdMYWJlbC5zdHJpbmcgPSBcIkFJXCJcbiAgICAgICAgICAgIHRhZ0xhYmVsLmZvbnRTaXplID0gMTRcbiAgICAgICAgICAgIHRhZ0xhYmVsLmxpbmVIZWlnaHQgPSAxOFxuICAgICAgICAgICAgcm9ib3RUYWcuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIwMCwgMTAwKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdGFnT3V0bGluZSA9IHJvYm90VGFnLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgICAgICB0YWdPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMCwgMCwgMClcbiAgICAgICAgICAgIHRhZ091dGxpbmUud2lkdGggPSAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJvYm90VGFnLnBhcmVudCA9IGl0ZW1Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtTm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDliqDovb3njqnlrrblpLTlg49cbiAgICAgKi9cbiAgICBfbG9hZFBsYXllckF2YXRhcjogZnVuY3Rpb24oYXZhdGFyVXJsLCBzcHJpdGUpIHtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVyblxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5rKh5pyJ5aS05YOPVVJM77yM5L2/55So6buY6K6k5aS05YOPXG4gICAgICAgIGlmICghYXZhdGFyVXJsKSB7XG4gICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCgnVUkvaGVhZGltYWdlL2F2YXRhcl8xJywgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSAmJiBzcHJpdGUgJiYgc3ByaXRlLm5vZGUgJiYgc3ByaXRlLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5piv572R57ucVVJMXG4gICAgICAgIGlmIChhdmF0YXJVcmwuaW5kZXhPZignaHR0cDovLycpID09PSAwIHx8IGF2YXRhclVybC5pbmRleE9mKCdodHRwczovLycpID09PSAwKSB7XG4gICAgICAgICAgICBjYy5hc3NldE1hbmFnZXIubG9hZFJlbW90ZShhdmF0YXJVcmwsIHsgZXh0OiAnLnBuZycgfSwgZnVuY3Rpb24oZXJyLCB0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgdGV4dHVyZSAmJiBzcHJpdGUgJiYgc3ByaXRlLm5vZGUgJiYgc3ByaXRlLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNmID0gbmV3IGNjLlNwcml0ZUZyYW1lKHRleHR1cmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzZlxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pys5Zyw6LWE5rqQ6Lev5b6EXG4gICAgICAgIGNjLnJlc291cmNlcy5sb2FkKCdVSS9oZWFkaW1hZ2UvJyArIGF2YXRhclVybCwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lICYmIHNwcml0ZSAmJiBzcHJpdGUubm9kZSAmJiBzcHJpdGUubm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5o+Q56S65raI5oGvXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfc2hvd0pvaW5NZXNzYWdlOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIC8vIOWIm+W7uua1ruWKqOaPkOekulxuICAgICAgICB2YXIgdGlwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSm9pblRpcFwiKVxuICAgICAgICB0aXBOb2RlLnNldFBvc2l0aW9uKDAsIDEwMClcbiAgICAgICAgXG4gICAgICAgIHZhciBsYWJlbCA9IHRpcE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBsYWJlbC5zdHJpbmcgPSBtZXNzYWdlXG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjRcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGlwTm9kZS5jb2xvciA9IGNjLmNvbG9yKDEwMCwgMjU1LCAxMDApXG4gICAgICAgIFxuICAgICAgICB2YXIgb3V0bGluZSA9IHRpcE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgb3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApXG4gICAgICAgIG91dGxpbmUud2lkdGggPSAyXG4gICAgICAgIFxuICAgICAgICB0aXBOb2RlLnBhcmVudCA9IHRoaXMubm9kZVxuICAgICAgICBcbiAgICAgICAgLy8g5reh5Ye65Yqo55S7XG4gICAgICAgIHRpcE5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKFxuICAgICAgICAgICAgY2MubW92ZUJ5KDEuNSwgY2MudjIoMCwgNTApKSxcbiAgICAgICAgICAgIGNjLmZhZGVPdXQoMC41KSxcbiAgICAgICAgICAgIGNjLnJlbW92ZVNlbGYoKVxuICAgICAgICApKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmjInpkq7kuovku7ZcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIOWPlua2iOi/m+WFpe+8iOi/lOWbnuWkp+WOhe+8iVxuICAgICAqL1xuICAgIG9uQ2FuY2VsQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hTWF0Y2hXYWl0aW5nXSDnjqnlrrbngrnlh7vlj5bmtohcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOWPkemAgeWPlua2iOi/m+WFpeivt+axglxuICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5zb2NrZXQuZW1pdChcImFyZW5hX2NhbmNlbF9lbnRlclwiLCB7XG4gICAgICAgICAgICAgICAgcGVyaW9kX25vOiB0aGlzLl9wZXJpb2RObyxcbiAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLl9yb29tSWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOhVxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIilcbiAgICB9XG59KTtcbiJdfQ==