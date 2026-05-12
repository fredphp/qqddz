
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/hallscene/hallScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'd2b3cTV5veJAavN7xI0Vnkh', 'hallScene');
// scripts/hallscene/hallScene.js

"use strict";

var _cc$Class;
// 使用全局变量，不使用 require

// 脚本加载日志

cc.Class((_cc$Class = {
  "extends": cc.Component,
  name: 'hallScene',
  properties: {
    nickname_label: cc.Label,
    headimage: cc.Sprite,
    gobal_count: cc.Label,
    // 竞技币显示Label（可选，如果场景中没有则动态创建）
    arena_coin_label: cc.Label,
    creatroom_prefabs: cc.Prefab,
    joinroom_prefabs: cc.Prefab,
    user_agreement_prefabs: cc.Prefab
  },
  onLoad: function onLoad() {
    if (!window.myglobal) {
      console.warn("myglobal 未定义，等待初始化...");
      this._waitForMyglobal();
      return;
    }
    this._initWithPlayerData();
  },
  // 加载图片旋转动画
  update: function update(dt) {
    // _showMessageCenter 的加载图片旋转
    if (this._loadingImageAnimating && this._loadingImageNode && this._loadingImageNode.isValid) {
      this._loadingImageNode.angle += dt * 180;
    }
    // _showQuickEnterAnimation 的加载图片旋转
    if (this._quickEnterAnimating && this._quickEnterLoadingNode && this._quickEnterLoadingNode.isValid) {
      this._quickEnterLoadingNode.angle += dt * 180;
    }
  },
  _waitForMyglobal: function _waitForMyglobal() {
    var self = this;
    var attempts = 0;
    var maxAttempts = 20;
    var check = function check() {
      attempts++;
      if (window.myglobal && window.myglobal.playerData) {
        self._initWithPlayerData();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        console.error("myglobal 初始化超时");
        cc.director.loadScene("loginScene");
      }
    };
    setTimeout(check, 100);
  },
  _initWithPlayerData: function _initWithPlayerData() {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.playerData) {
      console.error("myglobal 或 playerData 未定义");
      cc.director.loadScene("loginScene");
      return;
    }
    var playerData = myglobal.playerData;
    if (!playerData.token) {
      cc.director.loadScene("loginScene");
      return;
    }
    var self = this;

    // 检查 verifyToken 是否存在
    if (typeof myglobal.verifyToken !== 'function') {
      console.warn("verifyToken 方法不存在，跳过验证");
      self._initUIAfterAuth();
      return;
    }
    try {
      myglobal.verifyToken(function (valid, message) {
        if (!valid) {
          cc.director.loadScene("loginScene");
          return;
        }
        self._initUIAfterAuth();
      });
    } catch (e) {
      console.error("verifyToken 调用失败:", e);
      self._initUIAfterAuth();
    }
  },
  _initUIAfterAuth: function _initUIAfterAuth() {
    try {
      var myglobal = window.myglobal;
      var playerData = myglobal ? myglobal.playerData : null;
      if (!playerData) {
        console.warn("playerData 为空，使用默认值");
        playerData = {
          nickName: "游客",
          gobal_count: 0,
          avatarUrl: null
        };
      }

      // 设置昵称
      // 优先使用属性关联的 Label，如果没有则通过节点名查找
      var nicknameLabel = this.nickname_label;

      // 如果属性关联的 Label 无效，尝试通过节点名查找
      if (!nicknameLabel || nicknameLabel.string === undefined) {
        // 递归查找 nickname_label 节点
        var nicknameNode = this._findNodeByName(this.node, "nickname_label");
        if (nicknameNode) {
          nicknameLabel = nicknameNode.getComponent(cc.Label);
        }
      }
      if (nicknameLabel) {
        nicknameLabel.string = playerData.nickName || "游客";
      } else {
        console.warn("【大厅】nickname_label 未找到，请检查场景文件");
      }

      // 设置金币/欢乐豆显示
      // 默认显示欢乐豆，根据当前选中的房间类型切换显示
      this._currentRoomCategory = 1; // 默认普通场
      this._updateCurrencyDisplay();
      this._adjustGoldElementsPosition();
      this._loadUserAvatar(playerData.avatarUrl);
      this.roomConfigs = [];

      // 初始化竞技币显示
      this._initArenaCoinDisplay();

      // 获取最新的玩家余额（金币和竞技币）
      this._refreshPlayerBalance();
      this._playHallBackgroundMusic();
      this._adjustBottomButtons();
      this._hideBackgroundCharacters();
      this._initWebSocket(); // 初始化 WebSocket 连接
      this._startOnlineMonitoring(); // 启动在线状态监测
      this._fetchRoomConfigs();
      this._removeNoticeBoard();
      // 注释掉：大厅不需要加入房间按钮，该功能在房间列表场景中使用
      // this._createEnterRoomButton();  // 创建加入房间按钮

      // 🚀【性能优化】预加载游戏场景
      this._preloadGameScene();
    } catch (e) {
      console.error("_initUIAfterAuth 异常:", e);
    }
  },
  // 启动在线状态监测
  _startOnlineMonitoring: function _startOnlineMonitoring() {
    var myglobal = window.myglobal;
    if (!myglobal) {
      console.warn("myglobal 未定义，无法启动在线监测");
      return;
    }

    // 启动全局在线监测
    if (myglobal.startOnlineMonitoring) {
      myglobal.startOnlineMonitoring();
    }

    // 监听在线状态变化
    var self = this;
    this._onlineStatusHandler = function (isOnline) {
      // 只有在非初始化状态下才显示离线提示
      if (!isOnline && !myglobal._isInitializing) {
        self._showOfflineMessage();
      } else if (!isOnline && myglobal._isInitializing) {}
    };
    if (myglobal.addOnlineStatusListener) {
      myglobal.addOnlineStatusListener(this._onlineStatusHandler);
    }

    // 监听强制下线事件
    if (myglobal.eventlister) {
      myglobal.eventlister.on("force_logout", function (data) {
        console.warn("🚫 收到强制下线事件:", data);
        self._handleForceLogout(data);
      });
    }
  },
  // 显示离线提示
  _showOfflineMessage: function _showOfflineMessage() {
    this._showMessage("网络连接已断开，正在重新连接...");
  },
  // 处理强制下线
  _handleForceLogout: function _handleForceLogout(data) {
    var reason = data.reason || "您已被强制下线";
    this._showMessage(reason);

    // 停止监测
    var myglobal = window.myglobal;
    if (myglobal && myglobal.stopOnlineMonitoring) {
      myglobal.stopOnlineMonitoring();
    }

    // 延迟跳转到登录页面
    this.scheduleOnce(function () {
      cc.director.loadScene("loginScene");
    }, 2);
  },
  // 停止在线状态监测
  _stopOnlineMonitoring: function _stopOnlineMonitoring() {
    var myglobal = window.myglobal;
    if (myglobal && myglobal.stopOnlineMonitoring) {
      myglobal.stopOnlineMonitoring();
    }
    if (myglobal && myglobal.removeOnlineStatusListener && this._onlineStatusHandler) {
      myglobal.removeOnlineStatusListener(this._onlineStatusHandler);
      this._onlineStatusHandler = null;
    }
  },
  // 🚀【性能优化】预加载游戏场景
  _preloadGameScene: function _preloadGameScene() {
    var self = this;
    var startTime = Date.now();

    // 🔧【优化】预加载场景资源
    cc.director.preloadScene("gameScene", function (err) {
      if (err) {
        console.error("🚀 [预加载] 游戏场景预加载失败:", err);
        return;
      }
      var elapsed = Date.now() - startTime;
      // 🔧【新增】标记场景已预加载
      self._gameScenePreloaded = true;
    });
  },
  // 初始化 WebSocket 连接
  _initWebSocket: function _initWebSocket() {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.socket) {
      console.warn("socket 未初始化");
      return;
    }

    // 检查是否已连接
    if (myglobal.socket.isWebSocketOpen && myglobal.socket.isWebSocketOpen()) {
      return;
    }

    // 检查逻辑连接状态
    if (myglobal.socket.isConnected && myglobal.socket.isConnected()) {
      return;
    }

    // 初始化 WebSocket
    if (myglobal.socket.initSocket) {
      myglobal.socket.initSocket();
    }
  },
  // 递归查找节点
  _findNodeByName: function _findNodeByName(parentNode, nodeName) {
    // 先检查直接子节点
    var found = parentNode.getChildByName(nodeName);
    if (found) return found;

    // 递归查找
    var children = parentNode.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      found = this._findNodeByName(child, nodeName);
      if (found) return found;
    }
    return null;
  },
  _hideBackgroundCharacters: function _hideBackgroundCharacters() {
    var xiongmao1 = this.node.getChildByName("xiongmao1");
    var xiongmao2 = this.node.getChildByName("xiongmao2");
    if (xiongmao1) xiongmao1.active = false;
    if (xiongmao2) xiongmao2.active = false;
  },
  // 调整底部按钮 - 调小并靠右排列
  _adjustBottomButtons: function _adjustBottomButtons() {
    var self = this;
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;

    // 底部按钮名称列表
    var buttonNames = ["btn_create_room", "btn_join_room", "btn_user_agreement", "user_agreement", "btn_setting", "btn_help"];

    // 收集存在的按钮
    var buttons = [];
    for (var i = 0; i < buttonNames.length; i++) {
      var btn = this.node.getChildByName(buttonNames[i]);
      if (btn && btn.active !== false) {
        buttons.push(btn);
      }
    }

    // 如果没找到，尝试查找其他可能的按钮
    if (buttons.length === 0) {
      var allChildren = this.node.children;
      for (var i = 0; i < allChildren.length; i++) {
        var child = allChildren[i];
        if (child.name && child.name.toLowerCase().indexOf('btn') >= 0) {
          // 检查是否在底部区域
          if (child.y < 0) {
            buttons.push(child);
          }
        }
      }
    }

    // 调整每个按钮
    var btnWidth = 120; // 按钮宽度
    var btnHeight = 50; // 按钮高度
    var btnGap = 15; // 按钮间距
    var rightMargin = 30; // 右边距
    var bottomMargin = 30; // 底边距

    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];

      // 禁用 Widget 组件
      var widget = btn.getComponent(cc.Widget);
      if (widget) widget.enabled = false;

      // 缩小按钮
      btn.scale = 0.7;

      // 设置锚点
      btn.anchorX = 1; // 右锚点
      btn.anchorY = 0; // 底锚点

      // 计算位置 - 从右往左排列
      var xPos = screenWidth / 2 - rightMargin - i * (btnWidth * 0.7 + btnGap);
      var yPos = -screenHeight / 2 + bottomMargin;
      btn.x = xPos;
      btn.y = yPos;
    }
  },
  _loadUserAvatar: function _loadUserAvatar(avatarUrl) {
    var self = this;
    if (!this.headimage) return;
    if (!avatarUrl) {
      this._loadDefaultAvatar();
      return;
    }
    if (avatarUrl.indexOf('http://') === 0 || avatarUrl.indexOf('https://') === 0) {
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (err || !texture) {
          self._loadDefaultAvatar();
          return;
        }
        try {
          var spriteFrame = new cc.SpriteFrame(texture);
          if (spriteFrame) self.headimage.spriteFrame = spriteFrame;
        } catch (e) {
          self._loadDefaultAvatar();
        }
      });
    } else {
      cc.resources.load('UI/headimage/' + avatarUrl, cc.SpriteFrame, function (err, spriteFrame) {
        if (err || !spriteFrame) {
          self._loadDefaultAvatar();
          return;
        }
        try {
          self.headimage.spriteFrame = spriteFrame;
        } catch (e) {
          self._loadDefaultAvatar();
        }
      });
    }
  },
  _loadDefaultAvatar: function _loadDefaultAvatar() {
    var self = this;
    cc.resources.load('UI/headimage/avatar_1', cc.SpriteFrame, function (err, spriteFrame) {
      if (!err && spriteFrame) {
        try {
          self.headimage.spriteFrame = spriteFrame;
        } catch (e) {}
      }
    });
  },
  _playHallBackgroundMusic: function _playHallBackgroundMusic() {
    var isopen_sound = window.isopen_sound || 1;
    if (!isopen_sound) return;
    try {
      cc.audioEngine.stopMusic();
      cc.audioEngine.stopAllEffects();
      cc.resources.load("sound/login_bg", cc.AudioClip, function (err, clip) {
        if (!err && clip) {
          try {
            cc.audioEngine.playMusic(clip, true);
          } catch (e) {}
        }
      });
    } catch (e) {}
  },
  _fetchRoomConfigs: function _fetchRoomConfigs() {
    var self = this;
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';

    // 如果没有配置 API，使用默认配置
    if (!apiUrl || !window.HttpAPI) {
      self._initRoomButtons(self._getDefaultRoomConfigs());
      return;
    }
    try {
      // 清除缓存
      if (HttpAPI._roomConfigCache) {
        HttpAPI._roomConfigCache = null;
      }
      try {
        localStorage.removeItem('room_config_cache');
      } catch (e) {}

      // 请求 API
      HttpAPI.get(apiUrl + '/api/v1/room/config/list', cryptoKey, function (err, result) {
        if (err) {
          console.warn("API请求失败:", err);
          self._initRoomButtons(self._getDefaultRoomConfigs());
          return;
        }
        var configs = null;
        if (result && result.code === 0 && result.data) {
          configs = result.data;
        } else if (result && Array.isArray(result)) {
          configs = result;
        }

        // 🔧【调试】输出获取到的房间配置
        if (configs) {
          for (var i = 0; i < configs.length; i++) {
            var c = configs[i];
          }
        }
        if (configs && configs.length > 0) {
          self.roomConfigs = configs;
          self._initRoomButtons(configs);
        } else {
          self._initRoomButtons(self._getDefaultRoomConfigs());
        }
      });
    } catch (e) {
      console.error("_fetchRoomConfigs 异常:", e);
      self._initRoomButtons(self._getDefaultRoomConfigs());
    }
  },
  _getDefaultRoomConfigs: function _getDefaultRoomConfigs() {
    return [{
      id: 1,
      room_name: "初级房",
      room_type: 2,
      base_score: 1,
      multiplier: 1,
      min_gold: 0,
      max_gold: 50000,
      description: "底分1",
      status: 1,
      sort_order: 0,
      room_category: 1
    }, {
      id: 2,
      room_name: "中级房",
      room_type: 3,
      base_score: 2,
      multiplier: 1,
      min_gold: 50000,
      max_gold: 200000,
      description: "底分2",
      status: 1,
      sort_order: 1,
      room_category: 1
    }, {
      id: 3,
      room_name: "高级房",
      room_type: 4,
      base_score: 5,
      multiplier: 2,
      min_gold: 200000,
      max_gold: 1000000,
      description: "底分5",
      status: 1,
      sort_order: 2,
      room_category: 2
    }, {
      id: 4,
      room_name: "娱乐房",
      room_type: 5,
      base_score: 10,
      multiplier: 3,
      min_gold: 1000000,
      max_gold: 5000000,
      description: "底分10",
      status: 1,
      sort_order: 3,
      room_category: 2
    }, {
      id: 5,
      room_name: "娱乐房",
      room_type: 6,
      base_score: 20,
      multiplier: 5,
      min_gold: 5000000,
      max_gold: 0,
      description: "底分20",
      status: 1,
      sort_order: 4,
      room_category: 2
    }];
  },
  _hideUnwantedButtons: function _hideUnwantedButtons() {
    var createRoomBtn = this.node.getChildByName("btn_create_room");
    var joinRoomBtn = this.node.getChildByName("btn_join_room");
    if (createRoomBtn) createRoomBtn.active = false;
    if (joinRoomBtn) joinRoomBtn.active = false;
  },
  // ============================================================
  // 核心方法：初始化房间按钮
  // ============================================================
  _initRoomButtons: function _initRoomButtons(rooms) {
    var self = this;

    // 按钮名称映射
    var buttonNameMap = {
      2: "btn_room_junior",
      3: "btn_room_middle",
      4: "btn_room_senior",
      5: "btn_room_master",
      6: "btn_room_supreme"
    };

    // 先隐藏所有房间按钮
    for (var key in buttonNameMap) {
      var btnNode = this.node.getChildByName(buttonNameMap[key]);
      if (btnNode) btnNode.active = false;
    }

    // ============================================================
    // 【一、数据处理】所有房间合并到一个数组，按 sort_order 排序
    // ============================================================

    var allRooms = [];
    for (var i = 0; i < rooms.length; i++) {
      var config = rooms[i];
      var sortOrder = config.sort_order || config.sortOrder || config.sort || 0;
      var roomType = config.room_type || config.roomType;
      var buttonName = buttonNameMap[roomType];
      if (!buttonName) continue;
      var btnNode = this.node.getChildByName(buttonName);
      if (!btnNode) continue;
      var roomData = {
        node: btnNode,
        config: config,
        roomType: roomType,
        sortOrder: sortOrder,
        roomName: config.room_name || config.roomName || "未知房间",
        minGold: config.min_gold || config.minGold || 0,
        maxGold: config.max_gold || config.maxGold || 0,
        roomCategory: config.room_category || config.roomCategory || 1
      };
      allRooms.push(roomData);
    }

    // 按 sort_order 升序排序
    allRooms.sort(function (a, b) {
      return a.sortOrder - b.sortOrder;
    });

    // 配置所有卡片
    for (var i = 0; i < allRooms.length; i++) {
      var room = allRooms[i];
      room.node.active = true;
      room.node.roomConfig = room.config;
      self._loadRoomButtonBg(room.node, room.roomType);
      self._updateMinGoldLabel(room.node, room.config);
      var button = room.node.getComponent(cc.Button);
      if (button) {
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.1;
        button.zoomScale = 1.1;
      }

      // 收集竞技场房间
      if (room.roomCategory === 2) {
        if (!self._arenaRooms) self._arenaRooms = [];
        self._arenaRooms.push(room);
      }
      (function (config, node, roomName, roomCategory) {
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
          event.stopPropagation();
          // 竞技场房间：不再响应整个卡片的点击，由报名按钮处理
          if (roomCategory === 2) {
            return;
          }
          self._onRoomButtonClick(config);
        });
      })(room.config, room.node, room.roomName, room.roomCategory);
    }

    // 渲染布局 - 所有卡片排成一行
    this._renderRoomLayout(allRooms);

    // 为竞技场房间添加报名按钮
    this._addArenaSignupButtons();

    // 🔧【新增】先从服务端获取报名状态，再更新UI
    this._fetchSignupStatusAndUpdateUI();
  },
  // 🔧【新增】从服务端获取报名状态并更新UI
  _fetchSignupStatusAndUpdateUI: function _fetchSignupStatusAndUpdateUI() {
    var self = this;
    if (window.arenaData && window.arenaData.fetchSignupStatusFromServer) {
      window.arenaData.fetchSignupStatusFromServer(function (err, signedUpRooms) {
        if (err) {
          console.warn("🏟️ 获取报名状态失败，使用本地缓存:", err);
        } else {}
        // 无论成功失败，都更新UI（使用本地缓存）
        self._updateArenaSignupStatus();
      });
    } else {
      // 没有API支持，直接使用本地缓存
      this._updateArenaSignupStatus();
    }
  },
  // ============================================================
  // 布局渲染 - 所有卡片水平排成一行
  // ============================================================
  _renderRoomLayout: function _renderRoomLayout(allRooms) {
    var self = this;

    // 清理旧容器
    var oldPanel = this.node.getChildByName("CardContainer");
    var oldLeftPanel = this.node.getChildByName("LeftArea");
    var oldRightPanel = this.node.getChildByName("RightArea");
    if (oldPanel) oldPanel.destroy();
    if (oldLeftPanel) oldLeftPanel.destroy();
    if (oldRightPanel) oldRightPanel.destroy();
    if (allRooms.length === 0) {
      return;
    }

    // ============================================================
    // 参数设置
    // ============================================================
    var cardWidth = 180; // 卡片宽度
    var cardHeight = 120; // 卡片高度
    var gapX = 30; // 卡片水平间距

    // 画布尺寸
    var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
    var screenHeight = canvas ? canvas.designResolution.height : 720;
    var screenWidth = canvas ? canvas.designResolution.width : 1280;

    // 计算容器宽度
    var totalCardsWidth = allRooms.length * cardWidth + (allRooms.length - 1) * gapX;
    var panelWidth = Math.max(totalCardsWidth + 40, screenWidth - 100);
    var panelHeight = cardHeight + 40;

    // 容器位置
    var verticalOffset = 20; // 垂直偏移（下移）

    // ============================================================
    // 创建容器 - 所有卡片水平排成一行
    // ============================================================
    var cardPanel = new cc.Node("CardContainer");
    cardPanel.setContentSize(panelWidth, panelHeight);
    cardPanel.anchorX = 0.5;
    cardPanel.anchorY = 0.5;
    cardPanel.x = 0; // 居中
    cardPanel.y = verticalOffset;
    cardPanel.parent = this.node;

    // 放置所有卡片 - 水平排列
    var startX = -totalCardsWidth / 2 + cardWidth / 2;
    for (var i = 0; i < allRooms.length; i++) {
      var room = allRooms[i];
      var widget = room.node.getComponent(cc.Widget);
      if (widget) widget.enabled = false;
      room.node.anchorX = 0.5;
      room.node.anchorY = 0.5;
      room.node.scale = 1;
      room.node.active = true;
      room.node.parent = cardPanel;

      // 卡片水平位置：从左到右排列
      room.node.x = startX + i * (cardWidth + gapX);
      // 卡片垂直位置：居中
      room.node.y = 0;
    }
  },
  // 添加区域标题
  _addAreaTitle: function _addAreaTitle(panel, titleText, x, y) {
    var titleNode = new cc.Node("AreaTitle");
    titleNode.setPosition(x, y);
    titleNode.anchorX = 0.5;
    titleNode.anchorY = 0.5;
    var label = titleNode.addComponent(cc.Label);
    label.string = titleText;
    label.fontSize = 28;
    label.lineHeight = 36;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = cc.color(255, 215, 0);
    var outline = titleNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;
    titleNode.parent = panel;
  },
  // 准备卡片节点（响应式，支持缩放）
  _prepareCardNodeResponsive: function _prepareCardNodeResponsive(node, cardScale) {
    // 禁用 Widget 组件（防止自动拉伸）
    var widget = node.getComponent(cc.Widget);
    if (widget) {
      widget.enabled = false;
    }

    // 锚点设为中心
    node.anchorX = 0.5;
    node.anchorY = 0.5;

    // 应用缩放（不拉伸，保持比例）
    node.scale = cardScale || 1;
  }
}, _cc$Class["_addAreaTitle"] = function _addAreaTitle(panel, title, x, y) {
  var titleNode = new cc.Node("Title");
  titleNode.setPosition(x, y);
  titleNode.anchorX = 0;
  titleNode.anchorY = 0.5;
  var label = titleNode.addComponent(cc.Label);
  label.string = title;
  label.fontSize = 28;
  label.lineHeight = 36;
  label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
  titleNode.color = cc.color(255, 215, 0);
  var outline = titleNode.addComponent(cc.LabelOutline);
  outline.color = cc.color(0, 0, 0);
  outline.width = 2;
  titleNode.parent = panel;
}, _cc$Class._loadRoomButtonBg = function _loadRoomButtonBg(btnNode, roomType) {
  var self = this;
  var sprite = btnNode.getComponent(cc.Sprite);
  if (!sprite) return;
  cc.resources.load('UI/btn_happy_' + roomType, cc.SpriteFrame, function (err, spriteFrame) {
    if (err || !spriteFrame) {
      self._loadDefaultRoomButtonBg(btnNode);
      return;
    }
    try {
      sprite.spriteFrame = spriteFrame;
    } catch (e) {
      self._loadDefaultRoomButtonBg(btnNode);
    }
  });
}, _cc$Class._loadDefaultRoomButtonBg = function _loadDefaultRoomButtonBg(btnNode) {
  var sprite = btnNode.getComponent(cc.Sprite);
  if (!sprite) return;
  cc.resources.load('UI/btn_happy_2', cc.SpriteFrame, function (err, spriteFrame) {
    if (!err && spriteFrame) {
      try {
        sprite.spriteFrame = spriteFrame;
      } catch (e) {}
    }
  });
}, _cc$Class._updateMinGoldLabel = function _updateMinGoldLabel(btnNode, config) {
  var goldLabelNode = btnNode.getChildByName("min_gold_label");

  // 获取房间分类，默认为普通场(1)
  var roomCategory = config.room_category || config.roomCategory || 1;
  if (!goldLabelNode) {
    goldLabelNode = new cc.Node("min_gold_label");
    var label = goldLabelNode.addComponent(cc.Label);
    label.fontSize = 22; // 字体大小
    label.lineHeight = 28; // 行高
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    goldLabelNode.anchorX = 0.5;
    goldLabelNode.anchorY = 0.5;
    var outline = goldLabelNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(0, 0, 0);
    outline.width = 2;

    // 设置更高的 zIndex 确保显示在最上层
    goldLabelNode.zIndex = 100;
    goldLabelNode.parent = btnNode;
  }
  var label = goldLabelNode.getComponent(cc.Label);

  // 根据房间类型获取不同的字段值
  // room_category: 1-普通场(使用min_gold), 2-竞技场(使用min_arena_coin)
  var minValue;
  var currencyName;
  if (roomCategory === 2) {
    // 竞技场 - 使用 min_arena_coin 字段
    minValue = config.min_arena_coin || config.minArenaCoin || 0;
    currencyName = "币";
    goldLabelNode.color = cc.color(255, 255, 255); // 竞技场：白色
    // 竞技场：不显示"最低"
    label.string = this._formatGold(minValue) + " " + currencyName;
  } else {
    // 普通场 - 使用 min_gold 字段
    minValue = config.min_gold || config.minGold || 0;
    currencyName = "豆";
    goldLabelNode.color = cc.color(255, 255, 255); // 普通场：白色
    // 普通场：保留"最低"
    label.string = "最低 " + this._formatGold(minValue) + " " + currencyName;
  }

  // 修正位置：按钮图片底部有豆子图标在左侧，文字应显示在图标右侧
  // 按钮高度 375px，底部蓝色渐变条约占 1/4（约在75%-100%位置）
  // 图标在底部左侧约10%-20%宽度位置，文字应偏右显示
  var btnHeight = btnNode.height || 375;
  // Y坐标：从底部边缘向上约16%的位置（在渐变条内）
  var yOffset = -btnHeight / 2 + btnHeight * 0.16;
  // X坐标：居中显示
  var xOffset = 0; // 居中
  goldLabelNode.setPosition(xOffset, yOffset);
}, _cc$Class._onRoomButtonClick = function _onRoomButtonClick(roomConfig) {
  var self = this;
  var myglobal = window.myglobal;
  var roomCategory = roomConfig.room_category || roomConfig.roomCategory || 1;

  // 更新货币显示
  this._currentRoomCategory = roomCategory;
  this._updateCurrencyDisplay();

  // 根据房间类型处理
  if (roomCategory === 2) {
    // 竞技场房间 - 显示报名弹窗
    this._onArenaRoomButtonClick(roomConfig);
  } else {
    // 普通场房间 - 原有逻辑
    this._onNormalRoomButtonClick(roomConfig);
  }
}, _cc$Class._onNormalRoomButtonClick = function _onNormalRoomButtonClick(roomConfig) {
  var self = this;
  var myglobal = window.myglobal;
  var playerGold = myglobal && myglobal.playerData ? myglobal.playerData.gobal_count : 0;
  var minGold = roomConfig.min_gold || roomConfig.minGold || 0;
  var maxGold = roomConfig.max_gold || roomConfig.maxGold || 0;
  if (playerGold < minGold) {
    this._showAdRewardDialog('gold', minGold - playerGold);
    return;
  }
  if (maxGold > 0 && playerGold > maxGold) {
    this._showMessage("欢乐豆超过上限，请前往更高级房间");
    return;
  }

  // 保存当前房间配置
  if (myglobal) {
    myglobal.currentRoomConfig = roomConfig;
    myglobal.currentRoomLevel = roomConfig.room_type;
    myglobal.currentRoomName = roomConfig.room_name;
  }

  // 直接快速匹配进入游戏
  this._quickMatch(roomConfig, playerGold);
}, _cc$Class._onArenaRoomButtonClick = function _onArenaRoomButtonClick(roomConfig, btnNode) {
  var self = this;
  var myglobal = window.myglobal;

  // 检查是否已报名
  var roomId = roomConfig.id;
  if (window.arenaData && window.arenaData.isSignedUp(roomId)) {
    // 已报名，不做处理
    this._showMessage("您已报名此竞技场");
    return;
  }

  // 检查是否已报名其他竞技场（初级、中级、高级场只能报一个）
  if (window.arenaData && this._hasSignedUpOtherArena(roomId)) {
    this._showMessage("您已报名其他竞技场，每场只能报名一个级别");
    return;
  }

  // 🔧【修复】不使用本地缓存的竞技币余额判断，直接调用服务端报名API
  // 原因：后台添加竞技币后，客户端本地缓存的值没有更新，会导致误判
  // 服务端会检查竞技币余额并返回详细错误信息

  // 直接执行报名
  this._doArenaSignup(roomConfig, btnNode);
}, _cc$Class._hasSignedUpOtherArena = function _hasSignedUpOtherArena(currentRoomId) {
  if (!window.arenaData || !this._arenaRooms) return false;
  for (var i = 0; i < this._arenaRooms.length; i++) {
    var room = this._arenaRooms[i];
    var roomId = room.config.id;
    if (roomId !== currentRoomId && window.arenaData.isSignedUp(roomId)) {
      return true;
    }
  }
  return false;
}, _cc$Class._doArenaSignup = function _doArenaSignup(roomConfig, btnNode) {
  var self = this;

  // 显示加载中
  this._showMessage("正在报名...");

  // 调用报名API
  if (window.arenaData) {
    window.arenaData.signup(roomConfig.id, function (err, result) {
      if (err) {
        self._showMessage(err || "报名失败");
        return;
      }

      // 报名成功
      self._showMessage("报名成功！");

      // 刷新玩家余额
      if (window.arenaData.refreshBalance) {
        window.arenaData.refreshBalance();
      }

      // 更新UI
      self._updateArenaSignupStatus();
    });
  }
}, _cc$Class._addArenaSignupButtons = function _addArenaSignupButtons() {
  var self = this;
  if (!this._arenaRooms) return;

  // 获取卡片容器
  var cardPanel = this.node.getChildByName("CardContainer");
  if (!cardPanel) {
    console.warn("CardContainer not found");
    return;
  }

  // 清理旧的报名按钮和倒计时显示
  var oldButtons = cardPanel.getChildByName("ArenaSignupButtons");
  if (oldButtons) oldButtons.destroy();
  var oldTimers = cardPanel.getChildByName("ArenaCountdowns");
  if (oldTimers) oldTimers.destroy();

  // 创建报名按钮容器
  var buttonContainer = new cc.Node("ArenaSignupButtons");
  buttonContainer.parent = cardPanel;

  // 创建倒计时显示容器
  var countdownContainer = new cc.Node("ArenaCountdowns");
  countdownContainer.parent = cardPanel;
  for (var i = 0; i < this._arenaRooms.length; i++) {
    var room = this._arenaRooms[i];
    var btnNode = room.node;
    var config = room.config;

    // ============================================================
    // 【重构】创建竞技场状态项 - 单一背景结构
    // 结构: RoomStatusItem > [Bg, TitleLabel, DescLabel]
    // ============================================================

    // 状态栏尺寸（用户指定）
    var statusBarHeight = 72; // 状态栏总高度
    var itemWidth = 180; // 每个状态项宽度
    var itemHeight = 54; // 每个状态项高度
    var itemGap = 12; // 间距
    var leftRightMargin = 24; // 左右留白

    // 背景尺寸 - 文字框宽度只适配文字内容+适当内边距
    // "报名截止 HH:MM" 约12个字符(16px字体)约96px，加上左右内边距
    var bgWidth = 160; // 宽度: 160px，适配文字显示
    var bgHeight = 72; // 高度: 72（两行文字需要更高）
    var bgRadius = 5; // 圆角: 5
    var bgColor = cc.color(255, 180, 100, 140); // 颜色: 淡橘色, 更透明(alpha=140)

    // 创建状态项容器（RoomStatusItem）
    var roomStatusItem = new cc.Node("RoomStatusItem_" + config.id);
    roomStatusItem.setContentSize(cc.size(btnNode.width, bgHeight));
    roomStatusItem.anchorX = 0.5;
    roomStatusItem.anchorY = 0.5;

    // 位置：相对于房间卡片居中对齐，显示在卡片顶部
    roomStatusItem.x = btnNode.x; // 水平居中
    roomStatusItem.y = btnNode.y + btnNode.height / 2 - bgHeight / 2 + 10; // 垂直位置：卡片顶部

    // 存储配置引用
    roomStatusItem.roomConfig = config;
    roomStatusItem.cardNode = btnNode;

    // ========== 1. 绘制唯一背景（Bg）==========
    // 删除了: OuterBg, InnerBg, CapsuleBg - 只保留一个Bg
    var bgNode = new cc.Node("Bg");
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = bgColor;
    bgGraphics.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, bgRadius);
    bgGraphics.fill();
    bgNode.parent = roomStatusItem;

    // ========== 2. 第一行文字：期号（PeriodLabel）==========
    var periodLabel = new cc.Node("PeriodLabel");
    var periodLabelComp = periodLabel.addComponent(cc.Label);
    periodLabelComp.string = "期号: --";
    periodLabelComp.fontSize = 16;
    periodLabelComp.lineHeight = 20;
    periodLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    periodLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
    periodLabelComp.enableBold = true; // 加粗
    periodLabel.color = cc.color(255, 255, 255); // 白色
    periodLabel.anchorX = 0.5;
    periodLabel.anchorY = 0.5;
    periodLabel.y = 14; // 上方位置（增加间距）
    periodLabel.parent = roomStatusItem;

    // 描边: #8A4200, 宽度2
    var periodOutline = periodLabel.addComponent(cc.LabelOutline);
    periodOutline.color = cc.color(138, 66, 0); // #8A4200
    periodOutline.width = 2;

    // ========== 3. 第二行文字：报名截止时间（TitleLabel）==========
    var titleLabel = new cc.Node("TitleLabel");
    var titleLabelComp = titleLabel.addComponent(cc.Label);
    titleLabelComp.string = "暂未开放";
    titleLabelComp.fontSize = 16;
    titleLabelComp.lineHeight = 20;
    titleLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleLabelComp.verticalAlign = cc.Label.VerticalAlign.CENTER;
    titleLabelComp.enableBold = true; // 加粗
    titleLabel.color = cc.color(255, 255, 255); // 白色
    titleLabel.anchorX = 0.5;
    titleLabel.anchorY = 0.5;
    titleLabel.y = -14; // 下方位置（增加间距）
    titleLabel.parent = roomStatusItem;

    // 描边: #8A4200, 宽度2
    var titleOutline = titleLabel.addComponent(cc.LabelOutline);
    titleOutline.color = cc.color(138, 66, 0); // #8A4200
    titleOutline.width = 2;
    roomStatusItem.parent = countdownContainer;

    // ============================================================
    // 创建报名按钮
    // ============================================================
    var signupBtn = new cc.Node("SignupBtn_" + config.id);

    // 添加 Sprite 组件用于显示按钮图片
    var sprite = signupBtn.addComponent(cc.Sprite);
    sprite.type = cc.Sprite.Type.SIMPLE;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

    // 按钮尺寸：160x65
    var fixedWidth = 160; // 宽度
    var fixedHeight = 65; // 高度
    signupBtn.setContentSize(cc.size(fixedWidth, fixedHeight));
    signupBtn.anchorX = 0.5;
    signupBtn.anchorY = 0.5;

    // 位置：按钮在卡片底部，向下移动
    signupBtn.x = btnNode.x;
    signupBtn.y = btnNode.y - btnNode.height / 2 + fixedHeight / 2 - 10; // 向下移动10px

    // 存储配置信息和卡片节点引用
    signupBtn.roomConfig = config;
    signupBtn.roomId = config.id;
    signupBtn.cardNode = btnNode;

    // 添加按钮组件
    var button = signupBtn.addComponent(cc.Button);
    button.transition = cc.Button.Transition.SCALE;
    button.duration = 0.1;
    button.zoomScale = 1.08;

    // 点击事件
    (function (config, cardNode, signupBtnNode) {
      signupBtnNode.on(cc.Node.EventType.TOUCH_END, function (event) {
        event.stopPropagation();
        self._onArenaSignupButtonClick(config, cardNode, signupBtnNode);
      });
    })(config, btnNode, signupBtn);
    signupBtn.parent = buttonContainer;
  }

  // 扩展容器高度以容纳按钮
  var originalHeight = cardPanel.height;
  cardPanel.setContentSize(cardPanel.width, originalHeight + 70);

  // 加载按钮图片并更新状态
  this._loadSignupButtonImages();

  // 启动倒计时更新定时器
  this._startCountdownTimer();
}, _cc$Class._loadSignupButtonImages = function _loadSignupButtonImages() {
  var self = this;

  // 预加载三张按钮图片
  var imagePaths = ['UI/button/btn_baoming', 'UI/button/btn_quxiaobaoming', 'UI/button/btn_no_baoming'];
  this._signupBtnFrames = {};
  var loadedCount = 0;
  for (var i = 0; i < imagePaths.length; i++) {
    (function (index) {
      cc.resources.load(imagePaths[index], cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame) {
          var key = imagePaths[index].split('/').pop();
          self._signupBtnFrames[key] = spriteFrame;
        }
        loadedCount++;
        // 所有图片加载完成后更新按钮状态
        if (loadedCount === imagePaths.length) {
          self._updateArenaSignupStatus();
        }
      });
    })(i);
  }
}, _cc$Class._isInMatchTime = function _isInMatchTime(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  if (!matchTimeRanges) return true; // 没有配置时间段，默认开放

  // 解析时间段 JSON
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) return true;
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("🕐 [_isInMatchTime] parse error:", e);
    return true; // 解析失败，默认开放
  }
}, _cc$Class._canSignupArena = function _canSignupArena(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes;

  // 必须同时有开赛时间和每场时长才能报名
  if (!matchTimeRanges || !matchDuration) {
    return false;
  }

  // 检查是否在开赛时间段内
  var result = this._isInMatchTime(config);
  return result;
}, _cc$Class._getNextSignupDeadline = function _getNextSignupDeadline(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes;

  // 必须有配置
  if (!matchTimeRanges || !matchDuration) return null;

  // 检查是否在开赛时间段内
  if (!this._isInMatchTime(config)) return null;
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) return null;
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 找到当前所在的时间段
    var currentRange = null;
    var rangeStartMinutes = 0;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        currentRange = range;
        rangeStartMinutes = startMin;
        break;
      }
    }
    if (!currentRange) return null;

    // 计算下一场比赛时间（从开赛时间开始，每隔 matchDuration 分钟一场）
    // 报名截止时间是比赛开始前1分钟
    var minutesSinceStart = currentMinutes - rangeStartMinutes;
    var remainder = minutesSinceStart % matchDuration;
    var nextMatchMinutes;
    if (remainder >= matchDuration - 1) {
      // 当前在报名截止时间内，下一场是下一个时间点
      nextMatchMinutes = currentMinutes + (matchDuration - remainder);
    } else {
      // 当前可以报名，下一场是当前时间点向上取整
      nextMatchMinutes = rangeStartMinutes + Math.ceil(minutesSinceStart / matchDuration) * matchDuration;
      if (nextMatchMinutes <= currentMinutes) {
        nextMatchMinutes += matchDuration;
      }
    }

    // 报名截止时间是比赛开始前1分钟
    var deadlineMinutes = nextMatchMinutes - 1;

    // 格式化时间
    var hours = Math.floor(deadlineMinutes / 60) % 24;
    var mins = deadlineMinutes % 60;
    var timeStr = (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins;
    return timeStr;
  } catch (e) {
    console.error("⏰ [_getNextSignupDeadline] error:", e);
    return null;
  }
}, _cc$Class._getSignupCountdownSeconds = function _getSignupCountdownSeconds(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes;
  if (!matchTimeRanges || !matchDuration) return -1;
  if (!this._isInMatchTime(config)) return -1;
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) return -1;
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var currentSeconds = now.getSeconds();
    var currentTotalSeconds = currentMinutes * 60 + currentSeconds;

    // 找到当前所在的时间段
    var currentRange = null;
    var rangeStartMinutes = 0;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        currentRange = range;
        rangeStartMinutes = startMin;
        break;
      }
    }
    if (!currentRange) return -1;

    // 计算下一场比赛时间
    var rangeStartSeconds = rangeStartMinutes * 60;
    var matchDurationSeconds = matchDuration * 60;
    var currentTotalSeconds = currentMinutes * 60 + currentSeconds;

    // 计算从开赛时间到现在经过的秒数
    var elapsedSeconds = currentTotalSeconds - rangeStartSeconds;
    var remainder = elapsedSeconds % matchDurationSeconds;

    // 倒计时 = 本期剩余时间（与服务端一致，不减60秒）
    var countdown = matchDurationSeconds - remainder;

    // 返回倒计时
    return countdown;
  } catch (e) {
    console.error("⏰ [_getSignupCountdownSeconds] error:", e);
    return -1;
  }
}, _cc$Class._getNearestMatchTimeRange = function _getNearestMatchTimeRange(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;

  // 没有配置时间段，返回null表示全天开放
  if (!matchTimeRanges) {
    return null;
  }
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) return null;
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var currentSeconds = now.getSeconds();

    // 解析所有时间段
    var parsedRanges = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      parsedRanges.push({
        start: range.start,
        end: range.end,
        startMinutes: startMinutes,
        endMinutes: endMinutes
      });
    }

    // 检查当前是否在某个时间段内
    for (var i = 0; i < parsedRanges.length; i++) {
      var r = parsedRanges[i];
      if (currentMinutes >= r.startMinutes && currentMinutes <= r.endMinutes) {
        return {
          inRange: true,
          range: r
        };
      }
    }

    // 不在任何时间段内，找最近的下一个时间段
    var nearestRange = null;
    var minDiff = Infinity;
    for (var i = 0; i < parsedRanges.length; i++) {
      var r = parsedRanges[i];
      // 计算距离这个时间段开始的分钟数
      var diff;
      if (r.startMinutes > currentMinutes) {
        // 今天还没到
        diff = r.startMinutes - currentMinutes;
      } else {
        // 需要等到明天
        diff = 24 * 60 - currentMinutes + r.startMinutes;
      }
      if (diff < minDiff) {
        minDiff = diff;
        nearestRange = r;
      }
    }
    return {
      inRange: false,
      range: nearestRange,
      minutesUntilStart: minDiff
    };
  } catch (e) {
    return null;
  }
}, _cc$Class._getNextMatchCountdown = function _getNextMatchCountdown(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes || 10; // 默认10分钟

  var now = new Date();
  var currentMinutes = now.getHours() * 60 + now.getMinutes();
  var currentSeconds = now.getSeconds();
  var currentTotalSeconds = currentMinutes * 60 + currentSeconds;

  // 没有配置开赛时间，每 matchDuration 分钟开赛一次
  if (!matchTimeRanges) {
    // 计算距离下一个 matchDuration 周期的秒数
    var intervalSeconds = matchDuration * 60;
    var secondsInCycle = currentTotalSeconds % intervalSeconds;
    var remainingSeconds = intervalSeconds - secondsInCycle;
    return {
      inMatchTime: true,
      seconds: remainingSeconds,
      matchDuration: matchDuration
    };
  }

  // 有配置开赛时间
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) {
      // 解析失败，使用默认逻辑
      var intervalSeconds = matchDuration * 60;
      var secondsInCycle = currentTotalSeconds % intervalSeconds;
      var remainingSeconds = intervalSeconds - secondsInCycle;
      return {
        inMatchTime: true,
        seconds: remainingSeconds,
        matchDuration: matchDuration
      };
    }

    // 检查当前是否在某个开赛时间段内
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        // 在开赛时间段内，计算距离下一场的倒计时
        var rangeStartSeconds = startMinutes * 60;
        var elapsedSeconds = currentTotalSeconds - rangeStartSeconds;
        var intervalSeconds = matchDuration * 60;
        var remainder = elapsedSeconds % intervalSeconds;
        var remainingSeconds = intervalSeconds - remainder;
        return {
          inMatchTime: true,
          seconds: remainingSeconds,
          matchDuration: matchDuration,
          currentRange: range
        };
      }
    }

    // 不在任何开赛时间段内
    return {
      inMatchTime: false,
      seconds: 0,
      matchDuration: matchDuration
    };
  } catch (e) {
    return {
      inMatchTime: false,
      seconds: 0,
      matchDuration: matchDuration
    };
  }
}, _cc$Class._formatCountdown = function _formatCountdown(totalSeconds) {
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = Math.floor(totalSeconds % 60);
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}, _cc$Class._formatMatchTimeRange = function _formatMatchTimeRange(range) {
  if (!range) return '';
  return range.start + '-' + range.end;
}, _cc$Class._getCurrentPeriodNo = function _getCurrentPeriodNo(config) {
  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes || 5;
  if (!matchTimeRanges || !matchDuration) {
    return 0;
  }
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) return 0;
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var currentSeconds = now.getSeconds();
    var currentTotalSeconds = currentMinutes * 60 + currentSeconds;

    // 找到当前所在的时间段
    var currentRange = null;
    var rangeStartMinutes = 0;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        currentRange = range;
        rangeStartMinutes = startMin;
        break;
      }
    }
    if (!currentRange) return 0;

    // 计算从开赛时间到现在经过的秒数（与服务端一致）
    var rangeStartSeconds = rangeStartMinutes * 60;
    var elapsedSeconds = currentTotalSeconds - rangeStartSeconds;
    var matchDurationSeconds = matchDuration * 60;

    // 计算当前是第几期（从1开始，与服务端一致）
    var periodNo = Math.floor(elapsedSeconds / matchDurationSeconds) + 1;
    return periodNo;
  } catch (e) {
    return 0;
  }
}, _cc$Class._onArenaSignupButtonClick = function _onArenaSignupButtonClick(roomConfig, btnNode, signupBtnNode) {
  var self = this;
  var myglobal = window.myglobal;
  var playerArenaCoin = myglobal && myglobal.playerData ? myglobal.playerData.arena_coin : 0;
  var roomId = roomConfig.id;

  // 检查是否已报名
  if (window.arenaData && window.arenaData.isSignedUp(roomId)) {
    // 已报名，执行取消报名
    this._doCancelSignup(roomConfig, btnNode, signupBtnNode);
    return;
  }

  // 检查是否可以报名（有开赛时间且有每场时长）
  if (!this._canSignupArena(roomConfig)) {
    var matchTimeRanges = roomConfig.match_time_ranges || roomConfig.matchTimeRanges;
    var matchDuration = roomConfig.match_duration || roomConfig.matchDuration || roomConfig.interval_minutes || roomConfig.intervalMinutes;
    if (!matchTimeRanges && !matchDuration) {
      this._showMessage("该房间暂未配置开赛时间");
    } else if (matchTimeRanges && !matchDuration) {
      this._showMessage("该房间暂未配置每场时长");
    } else if (!this._isInMatchTime(roomConfig)) {
      this._showMessage("当前不在开赛时间段，无法报名");
    } else {
      this._showMessage("暂不可报名");
    }
    return;
  }

  // 检查是否已报名其他竞技场
  if (this._hasSignedUpOtherArena(roomId)) {
    this._showMessage("您已报名其他竞技场，每场只能报名一个级别");
    return;
  }

  // 获取报名费
  var signupFee = roomConfig.min_arena_coin || roomConfig.minArenaCoin || 0;

  // 检查竞技币是否足够
  if (playerArenaCoin < signupFee) {
    this._showMessage("竞技币不足，需要 " + signupFee + " 竞技币");
    return;
  }

  // 执行报名
  this._doArenaSignup(roomConfig, btnNode, signupBtnNode);
}, _cc$Class._doCancelSignup = function _doCancelSignup(roomConfig, btnNode, signupBtnNode) {
  var self = this;
  this._showMessage("正在取消报名...");
  if (window.arenaData) {
    window.arenaData.cancelSignup(roomConfig.id, function (err, result) {
      if (err) {
        self._showMessage(err || "取消报名失败");
        return;
      }
      self._showMessage("取消报名成功，竞技币已返还");

      // 刷新玩家余额
      if (window.arenaData.refreshBalance) {
        window.arenaData.refreshBalance();
      }

      // 更新UI
      self._updateArenaSignupStatus();
    });
  }
}, _cc$Class._startCountdownTimer = function _startCountdownTimer() {
  var self = this;

  // 清理旧的定时器
  if (this._countdownTimer) {
    clearInterval(this._countdownTimer);
  }

  // 🔧【新增】初始化本地倒计时状态缓存
  // 格式: { roomId: { periodNo, countdown, canSignup, lastUpdate } }
  this._localArenaStatus = {};

  // 监听服务端推送的竞技场状态
  // 🔧【修复】使用 myglobal.socket 实例，而不是 window.socketCtr 函数
  var socket = window.myglobal && window.myglobal.socket;
  if (socket && socket.onArenaStatus) {
    socket.onArenaStatus(function (data) {
      if (self.node && self.node.isValid && data && data.arenas) {
        // 🔧【修改】收到服务端推送时，保存到本地状态
        self._onArenaStatusPush(data.arenas);
      }
    });
  } else {
    console.warn("🏟️ [Arena] socket 或 onArenaStatus 方法不可用，无法监听竞技场状态");
  }

  // 🔧【新增】监听竞技场比赛开始通知
  if (socket && socket.onArenaMatchStart) {
    socket.onArenaMatchStart(function (data) {
      if (self.node && self.node.isValid) {
        self._onArenaMatchStart(data);
      }
    });
  }

  // 🔧【新增】监听竞技场关闭弹窗通知（新期号开始时关闭上一轮弹窗）
  if (socket && socket.onArenaCloseDialog) {
    socket.onArenaCloseDialog(function (data) {
      if (self.node && self.node.isValid) {
        self._onArenaCloseDialog(data);
      }
    });
  }

  // 🔧【新增】立即初始化本地状态（使用本地计算作为初始值）
  this._initLocalArenaStatusFromConfig();

  // 🔧【修改】每秒更新本地倒计时（减1）
  this._countdownTimer = setInterval(function () {
    if (self.node && self.node.isValid) {
      self._updateLocalCountdown();
    }
  }, 1000);
}, _cc$Class._onArenaMatchStart = function _onArenaMatchStart(data) {
  var self = this;

  // 🔧【修复】先关闭之前可能存在的弹窗
  this._closeArenaMatchStartDialog();

  // 保存比赛信息供后续使用
  this._currentMatchData = data;

  // 弹出进入游戏弹窗
  this._showArenaMatchStartDialog(data);
}, _cc$Class._closeArenaMatchStartDialog = function _closeArenaMatchStartDialog() {
  // 关闭并销毁之前显示的弹窗
  if (this._arenaMatchStartDialog && this._arenaMatchStartDialog.isValid) {
    this._arenaMatchStartDialog.destroy();
    this._arenaMatchStartDialog = null;
  }
  // 清除当前比赛数据
  this._currentMatchData = null;
}, _cc$Class._onArenaCloseDialog = function _onArenaCloseDialog(data) {
  console.log("🏟️ [Arena] 收到关闭弹窗通知:", JSON.stringify(data));

  // 检查是否与当前弹窗匹配
  if (this._arenaMatchStartDialog && this._arenaMatchStartDialog.isValid) {
    // 如果指定了房间ID，检查是否匹配
    if (data.room_id && this._arenaMatchStartDialogRoomId) {
      if (data.room_id === this._arenaMatchStartDialogRoomId) {
        console.log("🏟️ [Arena] 关闭匹配的弹窗，room_id:", data.room_id);
        this._closeArenaMatchStartDialog();
      }
    } else {
      // 没有指定房间ID，关闭所有弹窗
      console.log("🏟️ [Arena] 关闭所有竞技场弹窗");
      this._closeArenaMatchStartDialog();
    }
  }
}, _cc$Class._showArenaMatchStartDialog = function _showArenaMatchStartDialog(data) {
  var self = this;

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var dialogNode = new cc.Node("ArenaMatchStartDialog");
  dialogNode.setContentSize(cc.size(screenWidth, screenHeight));
  dialogNode.anchorX = 0.5;
  dialogNode.anchorY = 0.5;
  dialogNode.x = 0;
  dialogNode.y = 0;
  dialogNode.zIndex = 5000;
  dialogNode.parent = this.node;

  // 🔧【修复】保存弹窗引用，用于后续关闭
  this._arenaMatchStartDialog = dialogNode;
  this._arenaMatchStartDialogRoomId = data.room_id; // 保存对应的房间ID
  this._arenaMatchStartDialogPeriodNo = data.period_no; // 保存对应的期号

  // 半透明黑色背景
  var bgNode = new cc.Node("Bg");
  bgNode.setContentSize(cc.size(screenWidth, screenHeight));
  var bgGraphics = bgNode.addComponent(cc.Graphics);
  bgGraphics.fillColor = cc.color(0, 0, 0, 180);
  bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  bgGraphics.fill();
  bgNode.parent = dialogNode;

  // 弹窗卡片
  var cardWidth = 450;
  var cardHeight = 380;
  var cardNode = new cc.Node("Card");
  cardNode.setContentSize(cc.size(cardWidth, cardHeight));
  var cardGraphics = cardNode.addComponent(cc.Graphics);
  cardGraphics.fillColor = cc.color(40, 45, 65, 255);
  cardGraphics.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 15);
  cardGraphics.fill();
  cardGraphics.strokeColor = cc.color(255, 215, 0);
  cardGraphics.lineWidth = 3;
  cardGraphics.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 15);
  cardGraphics.stroke();
  cardNode.parent = dialogNode;

  // 标题
  var titleNode = new cc.Node("Title");
  titleNode.y = cardHeight / 2 - 45;
  var titleLabel = titleNode.addComponent(cc.Label);
  titleLabel.string = "🏆 竞技场比赛开始";
  titleLabel.fontSize = 32;
  titleLabel.lineHeight = 40;
  titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleNode.color = cc.color(255, 215, 0);
  var titleOutline = titleNode.addComponent(cc.LabelOutline);
  titleOutline.color = cc.color(100, 80, 0);
  titleOutline.width = 2;
  titleNode.parent = cardNode;

  // 期号信息
  var periodNode = new cc.Node("Period");
  periodNode.y = cardHeight / 2 - 95;
  var periodLabel = periodNode.addComponent(cc.Label);
  periodLabel.string = "期号: " + (data.period_no || "--");
  periodLabel.fontSize = 22;
  periodLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  periodNode.color = cc.color(200, 200, 220);
  periodNode.parent = cardNode;

  // 房间信息
  var roomNode = new cc.Node("Room");
  roomNode.y = cardHeight / 2 - 130;
  var roomLabel = roomNode.addComponent(cc.Label);
  roomLabel.string = "房间: " + (data.room_name || "未知房间");
  roomLabel.fontSize = 20;
  roomLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  roomNode.color = cc.color(180, 180, 200);
  roomNode.parent = cardNode;

  // 参赛人数
  var playersNode = new cc.Node("Players");
  playersNode.y = cardHeight / 2 - 165;
  var playersLabel = playersNode.addComponent(cc.Label);
  playersLabel.string = "参赛人数: " + (data.total_players || 0) + " 人";
  playersLabel.fontSize = 20;
  playersLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  playersNode.color = cc.color(100, 200, 100);
  playersNode.parent = cardNode;

  // 提示消息
  var msgNode = new cc.Node("Message");
  msgNode.y = cardHeight / 2 - 240;
  var msgLabel = msgNode.addComponent(cc.Label);
  msgLabel.string = data.message || "比赛即将开始，请准备进入游戏！";
  msgLabel.fontSize = 16;
  msgLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  msgNode.color = cc.color(255, 200, 100);
  msgNode.parent = cardNode;

  // 按钮区域
  var btnY = -cardHeight / 2 + 55;

  // ========== 进入游戏按钮 ==========
  var enterBtn = new cc.Node("EnterBtn");
  enterBtn.setContentSize(cc.size(180, 50));
  enterBtn.setPosition(-100, btnY);
  enterBtn.anchorX = 0.5;
  enterBtn.anchorY = 0.5;

  // 绘制按钮背景
  var enterBg = enterBtn.addComponent(cc.Graphics);
  enterBg.fillColor = cc.color(76, 175, 80); // 绿色
  enterBg.roundRect(-90, -25, 180, 50, 8);
  enterBg.fill();

  // 创建文字子节点
  var enterLabelNode = new cc.Node("Label");
  enterLabelNode.anchorX = 0.5;
  enterLabelNode.anchorY = 0.5;
  var enterBtnLabel = enterLabelNode.addComponent(cc.Label);
  enterBtnLabel.string = "进入比赛";
  enterBtnLabel.fontSize = 22;
  enterBtnLabel.lineHeight = 28;
  enterBtnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  enterLabelNode.color = cc.color(255, 255, 255);
  enterLabelNode.parent = enterBtn;

  // 添加 Button 组件提供交互反馈
  var enterButtonComp = enterBtn.addComponent(cc.Button);
  enterButtonComp.transition = cc.Button.Transition.SCALE;
  enterButtonComp.duration = 0.1;
  enterButtonComp.zoomScale = 1.1;
  enterBtn.parent = cardNode;

  // 添加点击事件
  enterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    // 清除弹窗引用后再销毁
    self._arenaMatchStartDialog = null;
    self._arenaMatchStartDialogRoomId = null;
    self._arenaMatchStartDialogPeriodNo = null;
    dialogNode.destroy();
    self._enterArenaMatch(data);
  });

  // ========== 取消按钮 ==========
  var cancelBtn = new cc.Node("CancelBtn");
  cancelBtn.setContentSize(cc.size(120, 50));
  cancelBtn.setPosition(100, btnY); // 修正位置，两按钮间距合理
  cancelBtn.anchorX = 0.5;
  cancelBtn.anchorY = 0.5;

  // 绘制按钮背景
  var cancelBg = cancelBtn.addComponent(cc.Graphics);
  cancelBg.fillColor = cc.color(180, 80, 80); // 红色
  cancelBg.roundRect(-60, -25, 120, 50, 8);
  cancelBg.fill();

  // 创建文字子节点
  var cancelLabelNode = new cc.Node("Label");
  cancelLabelNode.anchorX = 0.5;
  cancelLabelNode.anchorY = 0.5;
  var cancelBtnLabel = cancelLabelNode.addComponent(cc.Label);
  cancelBtnLabel.string = "取消";
  cancelBtnLabel.fontSize = 20;
  cancelBtnLabel.lineHeight = 26;
  cancelBtnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  cancelLabelNode.color = cc.color(255, 255, 255);
  cancelLabelNode.parent = cancelBtn;

  // 添加 Button 组件提供交互反馈
  var cancelButtonComp = cancelBtn.addComponent(cc.Button);
  cancelButtonComp.transition = cc.Button.Transition.SCALE;
  cancelButtonComp.duration = 0.1;
  cancelButtonComp.zoomScale = 1.1;
  cancelBtn.parent = cardNode;

  // 添加点击事件
  cancelBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();

    // 取消按钮：取消报名并退还竞技币
    self._cancelArenaSignup(data);

    // 清除弹窗引用后再销毁
    self._arenaMatchStartDialog = null;
    self._arenaMatchStartDialogRoomId = null;
    self._arenaMatchStartDialogPeriodNo = null;
    dialogNode.destroy();
  });
}, _cc$Class._cancelArenaSignup = function _cancelArenaSignup(data) {
  var self = this;
  var myglobal = window.myglobal;
  console.log("🏟️ [Arena] 取消报名，退还竞技币，room_id:", data.room_id);

  // 发送取消报名请求到服务端
  var socket = myglobal && myglobal.socket;
  if (socket && socket.sendArenaCancelSignup) {
    socket.sendArenaCancelSignup({
      room_id: data.room_id
    });
  }

  // 清除本地报名状态
  if (window.arenaData && window.arenaData._signedUpArenas) {
    delete window.arenaData._signedUpArenas[data.room_id];
    window.arenaData.saveToLocal && window.arenaData.saveToLocal();
  }

  // 清除当前比赛数据
  this._currentMatchData = null;
}, _cc$Class._enterArenaMatch = function _enterArenaMatch(data) {
  var self = this;
  var myglobal = window.myglobal;
  console.log("🏟️ [Arena] 进入竞技场比赛，data:", JSON.stringify(data));

  // 保存比赛信息
  if (myglobal) {
    myglobal.currentArenaMatch = data;
  }

  // 清除报名状态
  if (window.arenaData && window.arenaData._signedUpArenas) {
    delete window.arenaData._signedUpArenas[data.room_id];
    window.arenaData.saveToLocal && window.arenaData.saveToLocal();
  }

  // 🔧【关键修复】发送 arena_enter 请求，等待 room_joined 消息后再进入游戏场景
  var socket = myglobal && myglobal.socket;
  if (socket && socket.sendArenaEnter) {
    // 显示加载提示
    this._showMessageCenter("正在进入竞技场...");

    // 注册一次性 room_joined 监听器
    var roomJoinedHandler = function roomJoinedHandler(roomData) {
      console.log("🏟️ [Arena] 收到 room_joined，准备进入游戏场景:", JSON.stringify(roomData));

      // 取消超时定时器
      if (self._arenaEnterTimeout) {
        clearTimeout(self._arenaEnterTimeout);
        self._arenaEnterTimeout = null;
      }

      // 🔧【关键修复】转换数据格式：players → playerdata
      // 游戏场景期望的数据格式与普通场一致
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
            // 🔧【修复】使用实际头像URL
            gold_count: p.gold_count || 0,
            goldcount: p.gold_count || 0,
            seatindex: (p.seat !== undefined ? p.seat : idx) + 1,
            isready: p.ready || false,
            arena_gold: p.arena_gold || 0,
            // 🔧【修复】添加竞技场金币
            match_coin: p.match_coin || 0,
            // 兼容字段
            period_no: p.period_no || "" // 期号
          };
        }),

        housemanageid: roomData.creator_id || "",
        creator_id: roomData.creator_id || "",
        room_category: 2,
        // 竞技场
        period_no: data.period_no
      };
      console.log("🏟️ [Arena] 转换后的房间数据:", JSON.stringify(convertedRoomData));

      // 保存转换后的房间数据
      if (myglobal) {
        myglobal.roomData = convertedRoomData;
      }

      // 进入游戏场景
      self._enterGameScene(convertedRoomData);
    };

    // 注册监听器
    socket.onRoomJoined(roomJoinedHandler);

    // 设置超时（10秒后如果没收到 room_joined，也进入场景）
    this._arenaEnterTimeout = setTimeout(function () {
      console.log("🏟️ [Arena] 等待 room_joined 超时，直接进入游戏场景");
      self._arenaEnterTimeout = null;

      // 构造临时房间数据
      var tempRoomData = {
        room_code: "arena_" + data.period_no,
        room_id: data.room_id,
        room_name: data.room_name,
        room_category: 2,
        period_no: data.period_no
      };
      if (myglobal) {
        myglobal.roomData = tempRoomData;
      }
      self._enterGameScene(tempRoomData);
    }, 10000);

    // 发送 arena_enter 请求
    socket.sendArenaEnter({
      period_no: data.period_no,
      room_id: data.room_id
    });
  } else {
    console.warn("🏟️ [Arena] socket 或 sendArenaEnter 方法不可用");
    // 降级处理：直接进入游戏场景
    var roomConfig = {
      id: data.room_id,
      room_name: data.room_name,
      room_config_id: data.room_config_id,
      room_category: 2,
      min_arena_coin: data.signup_fee,
      match_rounds: data.match_rounds,
      match_duration: data.match_duration
    };
    if (myglobal) {
      myglobal.currentRoomConfig = roomConfig;
      myglobal.currentRoomLevel = data.room_id;
      myglobal.currentRoomName = data.room_name;
    }
    this._enterArenaGameScene(data, roomConfig);
  }
}, _cc$Class._enterArenaGameScene = function _enterArenaGameScene(matchData, roomConfig) {
  var self = this;
  var myglobal = window.myglobal;

  // 显示简短加载提示
  this._showMessageCenter("正在进入竞技场...");

  // 构造房间数据
  var roomData = {
    room_code: matchData.room_code || "arena_" + matchData.period_no,
    room_id: matchData.room_id,
    room_name: matchData.room_name,
    room_category: 2,
    // 竞技场
    base_score: roomConfig.base_score || 1,
    multiplier: roomConfig.multiplier || 1,
    period_no: matchData.period_no,
    match_rounds: matchData.match_rounds
  };

  // 保存房间数据
  if (myglobal) {
    myglobal.roomData = roomData;
    myglobal.playerData = myglobal.playerData || {};
    myglobal.playerData.bottom = roomConfig.base_score || 1;
    myglobal.playerData.rate = roomConfig.multiplier || 1;
  }

  // 🔧【关键】最多等待2秒后直接进入游戏场景
  var enterDelay = 500; // 默认等待500ms

  // 如果有等待数据，可以适当延长
  if (matchData.wait_time && matchData.wait_time > 0) {
    enterDelay = Math.min(matchData.wait_time * 1000, 2000); // 最多2秒
  }

  console.log("🏟️ [Arena] 将在 " + enterDelay + "ms 后进入游戏场景");

  // 设置定时器，延迟进入游戏场景
  this._arenaEnterTimer = setTimeout(function () {
    self._arenaEnterTimer = null;
    console.log("🏟️ [Arena] 进入游戏场景");
    self._enterGameScene(roomData);
  }, enterDelay);
}, _cc$Class._initLocalArenaStatusFromConfig = function _initLocalArenaStatusFromConfig() {
  if (!this._arenaRooms) return;
  var now = Date.now();
  for (var i = 0; i < this._arenaRooms.length; i++) {
    var room = this._arenaRooms[i];
    var config = room.config;
    var roomId = config.id;

    // 如果已经有服务端推送的数据，跳过
    if (this._localArenaStatus[roomId]) continue;

    // 使用本地计算作为初始值
    var phaseInfo = this._calculatePhaseInfo(config);
    this._localArenaStatus[roomId] = {
      periodNo: phaseInfo.periodNo,
      periodNoStr: phaseInfo.periodNoStr,
      // 新增：字符串格式期号
      phase: phaseInfo.phase,
      countdown: phaseInfo.countdown,
      canSignup: phaseInfo.canSignup,
      totalPlayers: 0,
      // 🔧【修复】初始化报名人数为0
      statusText: "",
      lastUpdate: now,
      isLocalCalculated: true // 标记为本地计算
    };
  }

  // 更新显示
  this._updateCountdownFromLocalCache();
}, _cc$Class._onArenaStatusPush = function _onArenaStatusPush(arenas) {
  if (!arenas) return;
  var now = Date.now();

  // 🔧 调试：打印收到的完整数据

  // 更新本地状态缓存
  for (var i = 0; i < arenas.length; i++) {
    var arena = arenas[i];
    var roomId = arena.room_id;
    var newPeriodNoStr = arena.period_no_str || arena.periodNoStr || "";

    // 🔧 调试：打印每个竞技场的 total_players

    // 🔧【新增】检查期号是否变化，如果变化则清除用户报名状态
    var oldStatus = this._localArenaStatus[roomId];
    if (oldStatus && oldStatus.periodNoStr && newPeriodNoStr && oldStatus.periodNoStr !== newPeriodNoStr) {
      // 🔧【修复】不在期号变化时关闭弹窗
      // 弹窗应该只在以下情况关闭：
      // 1. 玩家点击"进入"或"取消"按钮
      // 2. 服务端发送 arena_close_dialog 消息（进入阶段倒计时结束）
      // 3. 玩家手动关闭弹窗

      // 清除用户在该房间的报名状态
      if (window.arenaData && window.arenaData._signedUpArenas && window.arenaData._signedUpArenas[roomId]) {
        var oldPeriodNo = window.arenaData._signedUpArenas[roomId].periodNo;
        delete window.arenaData._signedUpArenas[roomId];
        window.arenaData.saveToLocal && window.arenaData.saveToLocal();
      }
    }

    // 保存服务端推送的状态（支持新字段）
    this._localArenaStatus[roomId] = {
      periodNo: arena.period_no,
      periodNoStr: newPeriodNoStr,
      phase: arena.phase || 0,
      countdown: arena.countdown,
      canSignup: arena.can_signup,
      totalPlayers: arena.total_players || arena.totalPlayers || 0,
      statusText: arena.status_text || arena.statusText || "",
      lastUpdate: now,
      isLocalCalculated: false // 服务端推送
    };
  }

  // 立即更新显示
  this._updateCountdownFromLocalCache();
}, _cc$Class._updateLocalCountdown = function _updateLocalCountdown() {
  if (!this._localArenaStatus) return;
  var now = Date.now();
  var needUpdate = false;

  // 遍历所有竞技场，每秒减1
  for (var roomId in this._localArenaStatus) {
    var status = this._localArenaStatus[roomId];

    // 🔧【新增】容错机制：如果超过35秒没收到服务端推送，使用本地计算校准
    var timeSinceLastUpdate = (now - status.lastUpdate) / 1000;
    if (timeSinceLastUpdate > 35) {
      // 找到对应的配置
      var config = this._getArenaConfigByRoomId(parseInt(roomId));
      if (config) {
        var phaseInfo = this._calculatePhaseInfo(config);
        // 🔧【修复】检查期号是否变化，如果变化则重置报名人数和用户报名状态
        if (status.periodNoStr !== phaseInfo.periodNoStr && phaseInfo.periodNoStr !== "") {
          status.totalPlayers = 0; // 期号变化，重置报名人数

          // 🔧【修复】不在期号变化时关闭弹窗
          // 弹窗应该只在进入阶段倒计时结束后由服务端的 arena_close_dialog 消息关闭

          // 🔧【新增】清除用户在该房间的报名状态
          if (window.arenaData && window.arenaData._signedUpArenas && window.arenaData._signedUpArenas[roomId]) {
            var oldPeriodNo = window.arenaData._signedUpArenas[roomId].periodNo;
            delete window.arenaData._signedUpArenas[roomId];
            window.arenaData.saveToLocal && window.arenaData.saveToLocal();
          }
        }
        status.phase = phaseInfo.phase;
        status.countdown = phaseInfo.countdown;
        status.canSignup = phaseInfo.canSignup;
        status.periodNo = phaseInfo.periodNo;
        status.periodNoStr = phaseInfo.periodNoStr;
        status.isLocalCalculated = true;
        needUpdate = true;
      }
      continue;
    }

    // 只对有倒计时的减1
    if (status.countdown > 0) {
      status.countdown--;
      needUpdate = true;

      // 如果倒计时刚刚变为0，立即使用本地计算切换阶段
      if (status.countdown === 0) {
        var config = this._getArenaConfigByRoomId(parseInt(roomId));
        if (config) {
          var phaseInfo = this._calculatePhaseInfo(config);
          // 🔧【修复】检查期号是否变化，如果变化则重置报名人数和用户报名状态
          if (status.periodNoStr !== phaseInfo.periodNoStr && phaseInfo.periodNoStr !== "") {
            status.totalPlayers = 0; // 期号变化，重置报名人数

            // 🔧【修复】不在期号变化时关闭弹窗
            // 弹窗应该只在进入阶段倒计时结束后由服务端的 arena_close_dialog 消息关闭

            // 🔧【新增】清除用户在该房间的报名状态
            if (window.arenaData && window.arenaData._signedUpArenas && window.arenaData._signedUpArenas[roomId]) {
              var oldPeriodNo = window.arenaData._signedUpArenas[roomId].periodNo;
              delete window.arenaData._signedUpArenas[roomId];
              window.arenaData.saveToLocal && window.arenaData.saveToLocal();
            }
          }
          status.phase = phaseInfo.phase;
          status.countdown = phaseInfo.countdown;
          status.canSignup = phaseInfo.canSignup;
          status.periodNo = phaseInfo.periodNo;
          status.periodNoStr = phaseInfo.periodNoStr;
        }
      }
    }
  }

  // 如果有变化，更新显示
  if (needUpdate) {
    this._updateCountdownFromLocalCache();
  }
}, _cc$Class._calculatePhaseInfo = function _calculatePhaseInfo(config) {
  var result = {
    phase: 0,
    countdown: -1,
    canSignup: false,
    periodNo: 0,
    periodNoStr: "" // 新增：字符串格式期号
  };

  var matchTimeRanges = config.match_time_ranges || config.matchTimeRanges;
  var matchDuration = config.match_duration || config.matchDuration || config.interval_minutes || config.intervalMinutes || 5;
  var roomType = config.room_type || config.roomType || 0;
  if (!matchTimeRanges || !matchDuration) {
    return result;
  }
  try {
    var ranges = typeof matchTimeRanges === 'string' ? JSON.parse(matchTimeRanges) : matchTimeRanges;
    if (!ranges || ranges.length === 0) {
      return result;
    }
    var now = new Date();
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var currentSeconds = now.getSeconds();
    var currentTotalSeconds = currentMinutes * 60 + currentSeconds;

    // 找到当前所在的时间段
    var currentRange = null;
    var rangeStartMinutes = 0;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      var startParts = range.start.split(':');
      var endParts = range.end.split(':');
      var startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      var endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        currentRange = range;
        rangeStartMinutes = startMin;
        break;
      }
    }
    if (!currentRange) {
      return result;
    }

    // 计算从开赛时间到现在经过的秒数
    var rangeStartSeconds = rangeStartMinutes * 60;
    var elapsedSeconds = currentTotalSeconds - rangeStartSeconds;

    // 🔧【修复】使用配置的 matchDuration（分钟），与服务端保持一致
    // 服务端已修改为使用 matchDuration 配置，客户端也必须一致
    // 每期总时长（秒）= matchDuration（分钟）* 60
    var periodTotalSeconds = matchDuration * 60;

    // 准备阶段：固定60秒（1分钟）
    var prepareSeconds = 60;

    // 计算当前期号
    var periodNo = Math.floor(elapsedSeconds / periodTotalSeconds) + 1;

    // 计算本期内经过的秒数
    var periodElapsed = elapsedSeconds % periodTotalSeconds;

    // 🔧【新增】生成字符串格式期号
    // 新格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
    // 示例: 260506010034 = 2026年5月6日，房间ID=1，第0034期
    var year = String(now.getFullYear()).slice(-2); // 取后两位
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var dateStr = year + month + day; // YYMMDD (6位)

    // 房间ID (2位)
    var roomId = config.id || config.room_id || 0;
    var roomIdStr = String(roomId % 100).padStart(2, '0'); // 取后两位

    // 期序号 (4位)
    var seqStr = String(periodNo).padStart(4, '0');
    var periodNoStr = dateStr + roomIdStr + seqStr; // 总共12位

    // 确定阶段
    if (periodElapsed < prepareSeconds) {
      // 准备阶段
      result.phase = 1;
      result.countdown = prepareSeconds - periodElapsed;
      result.canSignup = false;
    } else {
      // 报名阶段
      result.phase = 2;
      result.countdown = periodTotalSeconds - periodElapsed;
      result.canSignup = result.countdown > 0;
    }
    result.periodNo = periodNo;
    result.periodNoStr = periodNoStr;
  } catch (e) {
    console.error("⏰ [_calculatePhaseInfo] error:", e);
  }
  return result;
}, _cc$Class._getArenaConfigByRoomId = function _getArenaConfigByRoomId(roomId) {
  if (!this._arenaRooms) return null;
  for (var i = 0; i < this._arenaRooms.length; i++) {
    if (this._arenaRooms[i].config.id === roomId) {
      return this._arenaRooms[i].config;
    }
  }
  return null;
}, _cc$Class._updateCountdownFromLocalCache = function _updateCountdownFromLocalCache() {
  if (!this._arenaRooms || !this._localArenaStatus) return;
  var cardPanel = this.node.getChildByName("CardContainer");
  var countdownContainer = cardPanel ? cardPanel.getChildByName("ArenaCountdowns") : null;
  var buttonContainer = cardPanel ? cardPanel.getChildByName("ArenaSignupButtons") : null;
  for (var i = 0; i < this._arenaRooms.length; i++) {
    var room = this._arenaRooms[i];
    var config = room.config;
    var roomId = config.id;

    // 获取本地缓存的状态
    var localStatus = this._localArenaStatus[roomId];
    if (!localStatus) continue;

    // 获取状态项节点
    var roomStatusItem = countdownContainer ? countdownContainer.getChildByName("RoomStatusItem_" + roomId) : null;
    if (!roomStatusItem) continue;
    var periodLabel = roomStatusItem.getChildByName("PeriodLabel");
    var titleLabel = roomStatusItem.getChildByName("TitleLabel");

    // 获取报名按钮
    var signupBtn = buttonContainer ? buttonContainer.getChildByName("SignupBtn_" + roomId) : null;

    // 更新时期号显示（使用新的字符串格式期号）
    if (periodLabel) {
      var periodLabelComp = periodLabel.getComponent(cc.Label);
      var periodNoStr = localStatus.period_no_str || localStatus.periodNoStr || localStatus.periodNo;
      if (periodNoStr && localStatus.phase !== 0) {
        periodLabelComp.string = "期号: " + periodNoStr;
        periodLabel.color = cc.color(255, 215, 0); // 金色
      } else {
        periodLabelComp.string = "期号: --";
        periodLabel.color = cc.color(180, 180, 180); // 灰色
      }
    }

    // 更新倒计时显示
    if (titleLabel) {
      var titleLabelComp = titleLabel.getComponent(cc.Label);
      var phase = localStatus.phase || 0;
      var totalPlayers = localStatus.total_players || localStatus.totalPlayers || 0;
      if (phase === 1) {
        // 准备阶段
        var secs = localStatus.countdown || 0;
        titleLabelComp.string = "准备中 " + secs + "秒";
        titleLabel.color = cc.color(255, 200, 100); // 橙色
      } else if (phase === 2) {
        // 报名阶段
        var mins = Math.floor((localStatus.countdown || 0) / 60);
        var secs = (localStatus.countdown || 0) % 60;
        var countdownStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        titleLabelComp.string = "报名中 " + countdownStr + " (" + totalPlayers + "人)";
        titleLabel.color = cc.color(0, 255, 100); // 绿色
      } else {
        // 未配置比赛时间或轮次
        titleLabelComp.string = "暂未开放";
        titleLabel.color = cc.color(200, 200, 200); // 浅灰色
      }
    }

    // 更新报名按钮状态
    if (signupBtn) {
      var sprite = signupBtn.getComponent(cc.Sprite);
      var button = signupBtn.getComponent(cc.Button);

      // 按钮尺寸：160x65
      sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      var fixedWidth = 160;
      var fixedHeight = 65;
      signupBtn.setContentSize(cc.size(fixedWidth, fixedHeight));
      var phase = localStatus.phase || 0;
      if (phase !== 2 || !localStatus.canSignup) {
        // 不在报名阶段或不能报名：显示禁用按钮
        if (this._signupBtnFrames && this._signupBtnFrames['btn_no_baoming']) {
          sprite.spriteFrame = this._signupBtnFrames['btn_no_baoming'];
        }
        signupBtn.active = true;
        if (button) button.enabled = false;
      } else {
        // 检查是否已报名
        var isSignedUp = window.arenaData && window.arenaData.isSignedUp(roomId);
        if (isSignedUp) {
          // 已报名：显示取消报名
          if (this._signupBtnFrames && this._signupBtnFrames['btn_quxiaobaoming']) {
            sprite.spriteFrame = this._signupBtnFrames['btn_quxiaobaoming'];
          }
          signupBtn.active = true;
          if (button) button.enabled = true;
        } else {
          // 未报名：显示报名按钮
          if (this._signupBtnFrames && this._signupBtnFrames['btn_baoming']) {
            sprite.spriteFrame = this._signupBtnFrames['btn_baoming'];
          }
          signupBtn.active = true;
          if (button) button.enabled = true;
        }
      }
    }
  }
}, _cc$Class._updateCountdownFromServer = function _updateCountdownFromServer(arenas) {
  // 直接调用新的处理函数
  this._onArenaStatusPush(arenas);
}, _cc$Class._updateCountdownDisplay = function _updateCountdownDisplay() {
  // 直接使用本地缓存更新显示
  this._updateCountdownFromLocalCache();
}, _cc$Class._updateArenaSignupStatus = function _updateArenaSignupStatus() {
  // 直接调用倒计时更新函数，它已经包含了按钮状态更新
  this._updateCountdownDisplay();
}, _cc$Class._showLoadingProgress = function _showLoadingProgress(roomConfig, playerGold) {
  var self = this;

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建加载界面容器（全屏）
  var loadingNode = new cc.Node("LoadingProgressNode");
  loadingNode.setContentSize(cc.size(screenWidth, screenHeight));
  loadingNode.anchorX = 0.5;
  loadingNode.anchorY = 0.5;
  loadingNode.x = 0;
  loadingNode.y = 0;
  loadingNode.zIndex = 3000;
  loadingNode.parent = this.node;

  // 添加半透明黑色背景
  var bgNode = new cc.Node("Bg");
  bgNode.setContentSize(cc.size(screenWidth, screenHeight));
  var bgGraphics = bgNode.addComponent(cc.Graphics);
  bgGraphics.fillColor = cc.color(20, 20, 40, 250);
  bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  bgGraphics.fill();
  bgNode.parent = loadingNode;

  // 添加装饰性背景图案
  this._addLoadingDecorations(loadingNode, screenWidth, screenHeight);

  // 标题文字
  var titleNode = new cc.Node("Title");
  titleNode.y = 150;
  var titleLabel = titleNode.addComponent(cc.Label);
  titleLabel.string = "斗地主";
  titleLabel.fontSize = 56;
  titleLabel.lineHeight = 72;
  titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleNode.color = cc.color(255, 215, 0);

  // 添加标题描边
  var titleOutline = titleNode.addComponent(cc.LabelOutline);
  titleOutline.color = cc.color(139, 69, 19);
  titleOutline.width = 3;
  titleNode.parent = loadingNode;

  // 房间名称
  var roomNameNode = new cc.Node("RoomName");
  roomNameNode.y = 80;
  var roomNameLabel = roomNameNode.addComponent(cc.Label);
  roomNameLabel.string = "进入【" + roomConfig.room_name + "】";
  roomNameLabel.fontSize = 32;
  roomNameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  roomNameNode.color = cc.color(200, 200, 220);
  roomNameNode.parent = loadingNode;

  // 加载提示文字
  var tipNode = new cc.Node("Tip");
  tipNode.y = -100;
  var tipLabel = tipNode.addComponent(cc.Label);
  tipLabel.string = "正在加载资源...";
  tipLabel.fontSize = 24;
  tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tipNode.color = cc.color(150, 150, 170);
  tipNode.parent = loadingNode;

  // 进度条背景
  var progressBg = new cc.Node("ProgressBg");
  progressBg.setContentSize(cc.size(500, 30));
  progressBg.y = -160;
  var progressBgGraphics = progressBg.addComponent(cc.Graphics);
  progressBgGraphics.fillColor = cc.color(40, 40, 60, 255);
  progressBgGraphics.roundRect(-250, -15, 500, 30, 15);
  progressBgGraphics.fill();
  progressBgGraphics.strokeColor = cc.color(80, 80, 100);
  progressBgGraphics.lineWidth = 2;
  progressBgGraphics.roundRect(-250, -15, 500, 30, 15);
  progressBgGraphics.stroke();
  progressBg.parent = loadingNode;

  // 进度条填充
  var progressFill = new cc.Node("ProgressFill");
  progressFill.y = -160;
  var progressFillGraphics = progressFill.addComponent(cc.Graphics);
  progressFill.parent = loadingNode;

  // 进度百分比文字
  var percentNode = new cc.Node("Percent");
  percentNode.y = -160;
  var percentLabel = percentNode.addComponent(cc.Label);
  percentLabel.string = "0%";
  percentLabel.fontSize = 20;
  percentLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  percentNode.color = cc.color(255, 255, 255);
  percentNode.parent = loadingNode;

  // 底部提示
  var bottomTipNode = new cc.Node("BottomTip");
  bottomTipNode.y = -220;
  var bottomTipLabel = bottomTipNode.addComponent(cc.Label);
  bottomTipLabel.string = "正在连接服务器...";
  bottomTipLabel.fontSize = 18;
  bottomTipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  bottomTipNode.color = cc.color(100, 100, 120);
  bottomTipNode.parent = loadingNode;

  // 加载提示文字数组
  var loadingTips = ["正在加载资源...", "正在连接服务器...", "正在获取房间列表...", "正在准备游戏数据...", "即将进入房间..."];

  // 进度动画
  var progress = 0;
  var targetProgress = 100;
  var tipIndex = 0;
  var updateProgress = function updateProgress() {
    if (progress >= targetProgress) {
      // 进度完成，显示房间列表场景
      self.scheduleOnce(function () {
        if (loadingNode && loadingNode.isValid) {
          loadingNode.destroy();
        }
        self._showRoomListScene(roomConfig, playerGold);
      }, 0.3);
      return;
    }

    // 增加进度
    progress += 2;
    if (progress > targetProgress) progress = targetProgress;

    // 更新进度条填充
    var fillWidth = progress / 100 * 480;
    progressFillGraphics.clear();
    if (fillWidth > 0) {
      // 渐变色效果
      progressFillGraphics.fillColor = cc.color(76, 175, 80);
      progressFillGraphics.roundRect(-240, -12, fillWidth, 24, 12);
      progressFillGraphics.fill();
    }

    // 更新百分比文字
    percentLabel.string = progress + "%";

    // 更新加载提示文字
    var newTipIndex = Math.floor(progress / 20);
    if (newTipIndex < loadingTips.length && newTipIndex !== tipIndex) {
      tipIndex = newTipIndex;
      tipLabel.string = loadingTips[tipIndex];
      bottomTipLabel.string = loadingTips[tipIndex];
    }
    self.scheduleOnce(updateProgress, 0.05);
  };

  // 开始进度动画
  updateProgress();
}, _cc$Class._addLoadingDecorations = function _addLoadingDecorations(parentNode, screenWidth, screenHeight) {
  // 添加扑克牌装饰（四角）
  var cardSymbols = ["♠", "♥", "♣", "♦"];
  var cardColors = [cc.color(50, 50, 70, 100), cc.color(180, 50, 50, 100), cc.color(50, 50, 70, 100), cc.color(180, 50, 50, 100)];
  var positions = [cc.v2(-screenWidth / 2 + 80, screenHeight / 2 - 80), cc.v2(screenWidth / 2 - 80, screenHeight / 2 - 80), cc.v2(-screenWidth / 2 + 80, -screenHeight / 2 + 80), cc.v2(screenWidth / 2 - 80, -screenHeight / 2 + 80)];
  for (var i = 0; i < 4; i++) {
    var symbolNode = new cc.Node("CardSymbol" + i);
    symbolNode.setPosition(positions[i]);
    var symbolLabel = symbolNode.addComponent(cc.Label);
    symbolLabel.string = cardSymbols[i];
    symbolLabel.fontSize = 60;
    symbolNode.color = cardColors[i];
    symbolNode.parent = parentNode;
  }
}, _cc$Class._showRoomListScene = function _showRoomListScene(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;

  // 移除旧的界面
  var oldScene = this.node.getChildByName("RoomListScene");
  if (oldScene) oldScene.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建全屏房间列表场景
  var sceneNode = new cc.Node("RoomListScene");
  sceneNode.setContentSize(cc.size(screenWidth, screenHeight));
  sceneNode.anchorX = 0.5;
  sceneNode.anchorY = 0.5;
  sceneNode.x = 0;
  sceneNode.y = 0;
  sceneNode.zIndex = 2500;
  sceneNode.parent = this.node;

  // ===== 背景层 =====
  this._createRoomListBackground(sceneNode, screenWidth, screenHeight);

  // ===== 顶部标题区域 =====
  this._createRoomListHeader(sceneNode, screenWidth, screenHeight, roomConfig);

  // ===== 操作按钮区域 =====
  this._createRoomListActions(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);

  // ===== 房间列表区域 =====
  this._createRoomListContent(sceneNode, screenWidth, screenHeight, roomConfig, playerGold);

  // ===== 底部信息栏 =====
  this._createRoomListFooter(sceneNode, screenWidth, screenHeight, playerGold, roomConfig);
}, _cc$Class._createRoomListBackground = function _createRoomListBackground(parentNode, screenWidth, screenHeight) {
  // 主背景
  var bgNode = new cc.Node("BgLayer");
  bgNode.setContentSize(cc.size(screenWidth, screenHeight));
  var bgGraphics = bgNode.addComponent(cc.Graphics);
  bgGraphics.fillColor = cc.color(20, 25, 45, 255);
  bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  bgGraphics.fill();
  bgNode.parent = parentNode;

  // 装饰边框
  var borderNode = new cc.Node("Border");
  var borderGraphics = borderNode.addComponent(cc.Graphics);
  borderGraphics.strokeColor = cc.color(180, 140, 60, 150);
  borderGraphics.lineWidth = 3;
  borderGraphics.roundRect(-screenWidth / 2 + 5, -screenHeight / 2 + 5, screenWidth - 10, screenHeight - 10, 10);
  borderGraphics.stroke();
  borderNode.parent = parentNode;

  // 角落装饰
  var corners = [{
    x: -screenWidth / 2 + 30,
    y: screenHeight / 2 - 30,
    rot: 0
  }, {
    x: screenWidth / 2 - 30,
    y: screenHeight / 2 - 30,
    rot: 90
  }, {
    x: screenWidth / 2 - 30,
    y: -screenHeight / 2 + 30,
    rot: 180
  }, {
    x: -screenWidth / 2 + 30,
    y: -screenHeight / 2 + 30,
    rot: 270
  }];
  for (var i = 0; i < corners.length; i++) {
    var corner = corners[i];
    var cornerNode = new cc.Node("Corner" + i);
    cornerNode.setPosition(corner.x, corner.y);
    cornerNode.angle = -corner.rot;
    var cg = cornerNode.addComponent(cc.Graphics);
    cg.strokeColor = cc.color(220, 180, 80, 200);
    cg.lineWidth = 2;
    cg.moveTo(0, 0);
    cg.lineTo(40, 0);
    cg.lineTo(40, 15);
    cg.moveTo(0, 0);
    cg.lineTo(0, 40);
    cg.lineTo(15, 40);
    cg.stroke();
    cornerNode.parent = parentNode;
  }
}, _cc$Class._createRoomListHeader = function _createRoomListHeader(parentNode, screenWidth, screenHeight, roomConfig) {
  var headerY = screenHeight / 2 - 55;
  var headerHeight = 80; // 增加标题栏高度

  // 标题背景
  var headerBg = new cc.Node("HeaderBg");
  headerBg.setContentSize(cc.size(screenWidth - 60, headerHeight));
  headerBg.setPosition(0, headerY);
  var hg = headerBg.addComponent(cc.Graphics);
  hg.fillColor = cc.color(35, 30, 50, 240);
  hg.roundRect(-(screenWidth - 60) / 2, -headerHeight / 2, screenWidth - 60, headerHeight, 8);
  hg.fill();
  hg.strokeColor = cc.color(180, 140, 60, 200);
  hg.lineWidth = 2;
  hg.roundRect(-(screenWidth - 60) / 2, -headerHeight / 2, screenWidth - 60, headerHeight, 8);
  hg.stroke();
  headerBg.parent = parentNode;

  // 左侧装饰
  var leftDeco = new cc.Node("LeftDeco");
  leftDeco.setPosition(-screenWidth / 2 + 80, headerY);
  var ld = leftDeco.addComponent(cc.Graphics);
  ld.fillColor = cc.color(200, 160, 60, 220);
  ld.circle(0, 0, 8);
  ld.fill();
  leftDeco.parent = parentNode;

  // 右侧装饰
  var rightDeco = new cc.Node("RightDeco");
  rightDeco.setPosition(screenWidth / 2 - 80, headerY);
  var rd = rightDeco.addComponent(cc.Graphics);
  rd.fillColor = cc.color(200, 160, 60, 220);
  rd.circle(0, 0, 8);
  rd.fill();
  rightDeco.parent = parentNode;

  // 房间名称 - 位于标题栏上半部分
  var titleText = new cc.Node("TitleText");
  titleText.setPosition(0, headerY + 12); // 上移到标题栏上半部分
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var titleLabel = titleText.addComponent(cc.Label);
  titleLabel.string = roomConfig.room_name || "游戏房间";
  titleLabel.fontSize = 28; // 调整字体大小
  titleLabel.lineHeight = 36;
  titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(255, 220, 100);
  var titleOutline = titleText.addComponent(cc.LabelOutline);
  titleOutline.color = cc.color(80, 50, 0);
  titleOutline.width = 2;
  titleText.parent = parentNode;

  // 副标题 - 位于标题栏下半部分，与标题分开
  var subText = new cc.Node("SubText");
  subText.setPosition(0, headerY - 14); // 下移到标题栏下半部分
  subText.anchorX = 0.5;
  subText.anchorY = 0.5;
  var subLabel = subText.addComponent(cc.Label);
  subLabel.string = "底分 " + (roomConfig.base_score || 1) + "  ·  倍率 " + (roomConfig.multiplier || 1) + "x";
  subLabel.fontSize = 18; // 增大字体
  subLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  subText.color = cc.color(200, 180, 140);
  subText.parent = parentNode;
}, _cc$Class._createRoomListActions = function _createRoomListActions(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
  var self = this;

  // 操作栏背景 - 增加高度以容纳更大的元素
  var actionBarY = screenHeight / 2 - 125;
  var actionBarHeight = 65; // 增加高度

  var actionBarBg = new cc.Node("ActionBarBg");
  actionBarBg.setPosition(0, actionBarY);
  var abg = actionBarBg.addComponent(cc.Graphics);
  abg.fillColor = cc.color(30, 27, 45, 230);
  abg.roundRect(-screenWidth / 2 + 30, -actionBarHeight / 2, screenWidth - 60, actionBarHeight, 6);
  abg.fill();
  actionBarBg.parent = parentNode;

  // ===== 左侧：房间号输入和加入按钮 =====
  var leftX = -screenWidth / 2 + 200; // 调整位置

  // 输入框 - 增加宽度
  var roomCodeInput = this._createSimpleInputBox("输入房间号", leftX, actionBarY, 180, 44 // 增加尺寸
  );

  roomCodeInput.parent = parentNode;

  // 加入房间按钮 - 增加宽度
  var joinBtn = this._createActionButton("加入房间", cc.color(76, 175, 80),
  // 绿色
  leftX + 160, actionBarY, 110, 44,
  // 增加尺寸
  function () {
    var input = parentNode.getChildByName("RoomCodeInput");
    var editBox = input ? input.getComponent(cc.EditBox) : null;
    var code = editBox ? editBox.string : "";
    if (code && code.length > 0) {
      self._joinRoom(code, roomConfig, playerGold);
    } else {
      self._showTipInScene(parentNode, "请输入房间号");
    }
  });
  joinBtn.parent = parentNode;

  // ===== 右侧：创建房间和快速开始按钮 =====
  var rightX = screenWidth / 2 - 170;

  // 创建房间按钮 - 增加宽度
  var createBtn = this._createActionButton("创建房间", cc.color(255, 152, 0),
  // 橙色
  rightX - 85, actionBarY, 120, 44,
  // 增加尺寸
  function () {
    self._showCreateRoomDialog(parentNode, roomConfig, playerGold);
  });
  createBtn.parent = parentNode;

  // 快速开始按钮 - 增加宽度
  var quickBtn = this._createActionButton("快速开始", cc.color(33, 150, 243),
  // 蓝色
  rightX + 85, actionBarY, 120, 44,
  // 增加尺寸
  function () {
    var scene = parentNode.getChildByName("RoomListScene") || parentNode;
    if (scene.destroy) scene.destroy();
    self._quickMatch(roomConfig, playerGold);
  });
  quickBtn.parent = parentNode;
}, _cc$Class._createSimpleInputBox = function _createSimpleInputBox(placeholder, x, y, width, height) {
  var inputNode = new cc.Node("RoomCodeInput");
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0.5;
  inputNode.anchorY = 0.5;

  // 背景
  var bg = inputNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(45, 40, 60, 255);
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.fill();
  bg.strokeColor = cc.color(120, 100, 70, 220);
  bg.lineWidth = 2;
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.stroke();

  // 使用 EditBox 组件实现真正的输入框
  var editBox = inputNode.addComponent(cc.EditBox);
  editBox.string = "";
  editBox.placeholder = placeholder;
  editBox.fontSize = 18;
  editBox.fontColor = cc.color(255, 255, 255);
  editBox.placeholderFontSize = 16;
  editBox.placeholderFontColor = cc.color(130, 120, 110);
  editBox.maxLength = 20;
  editBox.inputMode = cc.EditBox.InputMode.NUMERIC;
  editBox.returnType = cc.EditBox.KeyboardReturnType.DONE;
  editBox.lineHeight = height - 8;

  // 添加内边距效果（通过调整背景）
  editBox.node.on('editing-did-begin', function () {
    bg.clear();
    bg.fillColor = cc.color(55, 50, 75, 255);
    bg.roundRect(-width / 2, -height / 2, width, height, 6);
    bg.fill();
    bg.strokeColor = cc.color(180, 150, 80, 255);
    bg.lineWidth = 2;
    bg.roundRect(-width / 2, -height / 2, width, height, 6);
    bg.stroke();
  });
  editBox.node.on('editing-did-end', function () {
    bg.clear();
    bg.fillColor = cc.color(45, 40, 60, 255);
    bg.roundRect(-width / 2, -height / 2, width, height, 6);
    bg.fill();
    bg.strokeColor = cc.color(120, 100, 70, 220);
    bg.lineWidth = 2;
    bg.roundRect(-width / 2, -height / 2, width, height, 6);
    bg.stroke();
  });
  return inputNode;
}, _cc$Class._createActionButton = function _createActionButton(text, bgColor, x, y, width, height, callback) {
  var btn = new cc.Node("ActionBtn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, y);
  btn.anchorX = 0.5;
  btn.anchorY = 0.5;

  // 背景 - 增加圆角
  var bg = btn.addComponent(cc.Graphics);
  bg.fillColor = bgColor;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.fill();
  // 添加高光效果
  bg.fillColor = cc.color(255, 255, 255, 40);
  bg.roundRect(-width / 2 + 2, 2, width - 4, height / 2 - 2, 6);
  bg.fill();

  // 文字 - 增大字体
  var textNode = new cc.Node("Text");
  textNode.anchorX = 0.5;
  textNode.anchorY = 0.5;
  var label = textNode.addComponent(cc.Label);
  label.string = text;
  label.fontSize = 18; // 增大字体
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  textNode.color = cc.color(255, 255, 255);

  // 添加文字描边
  var outline = textNode.addComponent(cc.LabelOutline);
  outline.color = cc.color(0, 0, 0, 150);
  outline.width = 1;
  textNode.parent = btn;

  // 触摸效果
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._createRoomListContent = function _createRoomListContent(parentNode, screenWidth, screenHeight, roomConfig, playerGold) {
  var self = this;

  // 列表区域位置和尺寸 - 调整以适应新的操作栏高度
  var listY = -30; // 调整位置
  var listHeight = screenHeight - 280; // 调整高度
  var listWidth = screenWidth - 60;

  // 列表背景
  var listBg = new cc.Node("ListBg");
  listBg.setContentSize(cc.size(listWidth, listHeight));
  listBg.setPosition(0, listY);
  var lg = listBg.addComponent(cc.Graphics);
  lg.fillColor = cc.color(25, 22, 40, 240);
  lg.roundRect(-listWidth / 2, -listHeight / 2, listWidth, listHeight, 8);
  lg.fill();
  lg.strokeColor = cc.color(80, 65, 50, 150);
  lg.lineWidth = 1;
  lg.roundRect(-listWidth / 2, -listHeight / 2, listWidth, listHeight, 8);
  lg.stroke();
  listBg.parent = parentNode;

  // ===== 表头 =====
  var headerY = listY + listHeight / 2 - 25;

  // 表头背景
  var headerBg = new cc.Node("TableHeader");
  headerBg.setPosition(0, headerY);
  var hbg = headerBg.addComponent(cc.Graphics);
  hbg.fillColor = cc.color(40, 35, 55, 255);
  hbg.roundRect(-listWidth / 2 + 5, -20, listWidth - 10, 40, 4);
  hbg.fill();
  headerBg.parent = parentNode;

  // 表头文字 - 增大字体
  var colWidth = listWidth / 5;
  var headers = ["房间号", "人数", "底分", "状态", "操作"];
  for (var i = 0; i < headers.length; i++) {
    var hNode = new cc.Node("H" + i);
    hNode.x = -listWidth / 2 + colWidth * (i + 0.5);
    hNode.y = headerY;
    hNode.anchorX = 0.5;
    hNode.anchorY = 0.5;
    var hl = hNode.addComponent(cc.Label);
    hl.string = headers[i];
    hl.fontSize = 16; // 增大字体
    hl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    hNode.color = cc.color(240, 200, 120);

    // 添加描边
    var outline = hNode.addComponent(cc.LabelOutline);
    outline.color = cc.color(60, 50, 40);
    outline.width = 1;
    hNode.parent = parentNode;
  }

  // ===== 房间列表容器 =====
  var roomContainer = new cc.Node("RoomListContainer");
  roomContainer.setContentSize(cc.size(listWidth - 20, listHeight - 70));
  roomContainer.y = listY - 20;
  roomContainer.parent = parentNode;

  // 加载提示
  var loadingNode = new cc.Node("LoadingLabel");
  loadingNode.anchorX = 0.5;
  loadingNode.anchorY = 0.5;
  var ll = loadingNode.addComponent(cc.Label);
  ll.string = "正在加载房间列表...";
  ll.fontSize = 18; // 增大字体
  ll.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  loadingNode.color = cc.color(160, 150, 140);
  loadingNode.parent = roomContainer;

  // 获取房间列表
  this._fetchAndRenderRoomListForScene(roomContainer, loadingNode, roomConfig, playerGold, parentNode);
}, _cc$Class._createRoomListFooter = function _createRoomListFooter(parentNode, screenWidth, screenHeight, playerGold, roomConfig) {
  var self = this;
  var footerY = -screenHeight / 2 + 50; // 调整位置

  // 底部背景
  var footerBg = new cc.Node("FooterBg");
  footerBg.setPosition(0, footerY);
  var fg = footerBg.addComponent(cc.Graphics);
  fg.fillColor = cc.color(28, 25, 42, 240);
  fg.roundRect(-screenWidth / 2 + 30, -25, screenWidth - 60, 50, 6);
  fg.fill();
  footerBg.parent = parentNode;

  // 返回按钮 - 增大尺寸
  var backBtn = this._createActionButton("返回大厅", cc.color(90, 85, 100), -screenWidth / 2 + 120, footerY, 110, 40,
  // 增加尺寸
  function () {
    var scene = parentNode.getChildByName("RoomListScene") || parentNode;
    if (scene.destroy) scene.destroy();
  });
  backBtn.parent = parentNode;

  // 金币显示
  var goldIcon = new cc.Node("GoldIcon");
  goldIcon.setPosition(30, footerY);
  var gg = goldIcon.addComponent(cc.Graphics);
  gg.fillColor = cc.color(230, 180, 50);
  gg.circle(0, 0, 10);
  gg.fill();
  gg.fillColor = cc.color(250, 210, 80);
  gg.circle(0, 0, 6);
  gg.fill();
  goldIcon.parent = parentNode;
  var goldText = new cc.Node("GoldText");
  goldText.setPosition(50, footerY);
  goldText.anchorX = 0;
  goldText.anchorY = 0.5;
  var gl = goldText.addComponent(cc.Label);
  gl.string = this._formatGold(playerGold);
  gl.fontSize = 16;
  goldText.color = cc.color(230, 190, 80);
  goldText.parent = parentNode;

  // 刷新按钮 - 增大尺寸
  var refreshBtn = this._createActionButton("刷新列表", cc.color(60, 130, 180), screenWidth / 2 - 100, footerY, 100, 40,
  // 增加尺寸
  function () {
    var container = parentNode.getChildByName("RoomListContainer");
    if (!container) return;
    var loading = container.getChildByName("LoadingLabel");
    if (loading) {
      loading.active = true;
      loading.getComponent(cc.Label).string = "正在刷新...";
    }
    var children = container.children.slice();
    for (var i = 0; i < children.length; i++) {
      if (children[i].name !== "LoadingLabel") {
        children[i].destroy();
      }
    }
    self._fetchAndRenderRoomListForScene(container, loading, roomConfig, playerGold, parentNode);
  });
  refreshBtn.parent = parentNode;
}, _cc$Class._createButtonNode = function _createButtonNode(text, bgColor, x, y, width, height, callback, isPrimary) {
  var btn = new cc.Node("Btn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, y);
  btn.anchorX = 0.5;
  btn.anchorY = 0.5;

  // 按钮背景节点
  var bgNode = new cc.Node("BgNode");
  bgNode.setPosition(0, 0);
  bgNode.anchorX = 0.5;
  bgNode.anchorY = 0.5;
  var bg = bgNode.addComponent(cc.Graphics);

  // 绘制按钮背景
  bg.fillColor = bgColor;
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.fill();

  // 边框
  var borderColor = cc.color(Math.min(255, bgColor.r + 40), Math.min(255, bgColor.g + 40), Math.min(255, bgColor.b + 40));
  bg.strokeColor = borderColor;
  bg.lineWidth = 1;
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.stroke();

  // 主按钮高光
  if (isPrimary) {
    bg.fillColor = cc.color(255, 255, 255, 50);
    bg.roundRect(-width / 2 + 2, 2, width - 4, height / 2 - 2, 3);
    bg.fill();
  }
  bgNode.parent = btn;

  // 按钮文字节点（独立的子节点）
  var textNode = new cc.Node("TextNode");
  textNode.setPosition(0, 0); // 必须设置位置为按钮中心
  textNode.anchorX = 0.5;
  textNode.anchorY = 0.5;
  textNode.width = width;
  textNode.height = height;
  var label = textNode.addComponent(cc.Label);
  label.string = text;
  label.fontSize = Math.floor(height * 0.42);
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  label.overflow = cc.Label.Overflow.NONE;
  textNode.color = cc.color(255, 255, 255);
  var outline = textNode.addComponent(cc.LabelOutline);
  outline.color = cc.color(0, 0, 0, 120);
  outline.width = 1;
  textNode.parent = btn;

  // 触摸事件
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._createImageButtonNode = function _createImageButtonNode(imagePath, text, x, y, width, height, callback) {
  var self = this;
  var btn = new cc.Node("Btn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, y);
  btn.anchorX = 0.5;
  btn.anchorY = 0.5;

  // 添加 Sprite 组件
  var sprite = btn.addComponent(cc.Sprite);
  sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

  // 加载按钮图片
  cc.resources.load(imagePath, cc.SpriteFrame, function (err, spriteFrame) {
    if (err) {
      console.warn("加载按钮图片失败:", imagePath);
      // 使用备用样式
      self._createButtonFallback(btn, text, width, height);
      return;
    }
    sprite.spriteFrame = spriteFrame;
  });

  // 添加 Button 组件
  var button = btn.addComponent(cc.Button);
  button.transition = cc.Button.Transition.SCALE;
  button.duration = 0.1;
  button.zoomScale = 0.95;

  // 触摸事件
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    if (callback) callback();
  });
  return btn;
}, _cc$Class._createButtonFallback = function _createButtonFallback(btn, text, width, height) {
  // 绘制按钮背景
  var graphics = btn.addComponent(cc.Graphics);

  // 根据按钮文字选择颜色
  var bgColor;
  if (text.indexOf("创建") >= 0) {
    bgColor = cc.color(30, 90, 160); // 蓝色
  } else if (text.indexOf("加入") >= 0 || text.indexOf("进入") >= 0) {
    bgColor = cc.color(40, 130, 60); // 绿色
  } else if (text.indexOf("快速") >= 0) {
    bgColor = cc.color(200, 120, 40); // 橙色
  } else {
    bgColor = cc.color(80, 80, 80); // 灰色
  }

  graphics.fillColor = bgColor;
  graphics.roundRect(-width / 2, -height / 2, width, height, 6);
  graphics.fill();
  graphics.strokeColor = cc.color(255, 255, 255, 80);
  graphics.lineWidth = 2;
  graphics.roundRect(-width / 2, -height / 2, width, height, 6);
  graphics.stroke();

  // 添加文字
  var labelNode = new cc.Node("Label");
  var label = labelNode.addComponent(cc.Label);
  label.string = text;
  label.fontSize = Math.floor(height * 0.4);
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  labelNode.color = cc.color(255, 255, 255);
  labelNode.parent = btn;
}, _cc$Class._createInputNode = function _createInputNode(placeholder, x, y, width, height) {
  var inputNode = new cc.Node("InputNode");
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0.5;
  inputNode.anchorY = 0.5;
  inputNode.name = "RoomCodeInput";

  // 输入框背景
  var bgNode = new cc.Node("InputBg");
  bgNode.setPosition(0, 0);
  bgNode.anchorX = 0.5;
  bgNode.anchorY = 0.5;
  var bg = bgNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(45, 40, 60, 255);
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.fill();
  bg.strokeColor = cc.color(100, 90, 70, 200);
  bg.lineWidth = 1;
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.stroke();
  bgNode.parent = inputNode;

  // placeholder文字节点
  var placeholderNode = new cc.Node("Placeholder");
  placeholderNode.setPosition(0, 0);
  placeholderNode.anchorX = 0.5;
  placeholderNode.anchorY = 0.5;
  placeholderNode.width = width - 20;
  placeholderNode.height = height;
  var label = placeholderNode.addComponent(cc.Label);
  label.string = placeholder;
  label.fontSize = Math.floor(height * 0.4);
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  placeholderNode.color = cc.color(130, 120, 110);
  placeholderNode.parent = inputNode;
  return inputNode;
}, _cc$Class._createStyledButton = function _createStyledButton(text, color, x, callback, width, height) {
  width = width || 100;
  height = height || 40;
  var btn = new cc.Node("Btn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, 0);

  // 按钮背景
  var bg = btn.addComponent(cc.Graphics);
  bg.fillColor = color;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.fill();

  // 按钮文字
  var label = btn.addComponent(cc.Label);
  label.string = text;
  label.fontSize = 18;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  btn.color = cc.color(255, 255, 255);

  // 触摸效果
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._showTipInScene = function _showTipInScene(sceneNode, message) {
  var tipNode = sceneNode.getChildByName("SceneTip");
  if (tipNode) tipNode.destroy();
  tipNode = new cc.Node("SceneTip");
  tipNode.y = 100;
  var bg = tipNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(0, 0, 0, 180);
  bg.roundRect(-150, -20, 300, 40, 8);
  bg.fill();
  var label = tipNode.addComponent(cc.Label);
  label.string = message;
  label.fontSize = 20;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tipNode.color = cc.color(255, 255, 0);
  tipNode.parent = sceneNode;
  this.scheduleOnce(function () {
    if (tipNode && tipNode.isValid) tipNode.destroy();
  }, 2);
}, _cc$Class._showCreateRoomDialog = function _showCreateRoomDialog(parentNode, roomConfig, playerGold) {
  var self = this;

  // 移除旧弹窗
  var oldDialog = parentNode.getChildByName("CreateRoomDialog");
  if (oldDialog) oldDialog.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 弹窗容器
  var dialog = new cc.Node("CreateRoomDialog");
  dialog.setContentSize(cc.size(screenWidth, screenHeight));
  dialog.setPosition(0, 0);
  dialog.zIndex = 3000;
  dialog.parent = parentNode;

  // 半透明遮罩
  var mask = new cc.Node("Mask");
  mask.setContentSize(cc.size(screenWidth, screenHeight));
  var maskG = mask.addComponent(cc.Graphics);
  maskG.fillColor = cc.color(0, 0, 0, 180);
  maskG.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskG.fill();
  mask.parent = dialog;

  // 点击遮罩关闭
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    dialog.destroy();
  });

  // ===== 弹窗主体 =====
  var dialogWidth = 480; // 增加宽度
  var dialogHeight = 420; // 增加高度

  // 弹窗背景
  var dialogBg = new cc.Node("DialogBg");
  dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
  var dbg = dialogBg.addComponent(cc.Graphics);
  // 阴影
  dbg.fillColor = cc.color(0, 0, 0, 80);
  dbg.roundRect(-dialogWidth / 2 + 5, -dialogHeight / 2 - 5, dialogWidth, dialogHeight, 12);
  dbg.fill();
  // 主背景
  dbg.fillColor = cc.color(35, 32, 50, 255);
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.fill();
  // 边框
  dbg.strokeColor = cc.color(255, 180, 60, 200);
  dbg.lineWidth = 2;
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.stroke();
  dialogBg.parent = dialog;

  // ===== 顶部标题栏 =====
  var headerBar = new cc.Node("HeaderBar");
  headerBar.y = dialogHeight / 2 - 30;
  var hbg = headerBar.addComponent(cc.Graphics);
  hbg.fillColor = cc.color(255, 152, 0); // 橙色主题
  hbg.roundRect(-dialogWidth / 2, -25, dialogWidth, 50, [12, 12, 0, 0]);
  hbg.fill();
  headerBar.parent = dialog;

  // 标题文字
  var titleText = new cc.Node("Title");
  titleText.y = dialogHeight / 2 - 30;
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var ttl = titleText.addComponent(cc.Label);
  ttl.string = "创建房间";
  ttl.fontSize = 24;
  ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(255, 255, 255);
  var titleOutline = titleText.addComponent(cc.LabelOutline);
  titleOutline.color = cc.color(120, 60, 0);
  titleOutline.width = 2;
  titleText.parent = dialog;

  // 关闭按钮
  var closeBtn = new cc.Node("CloseBtn");
  closeBtn.setContentSize(cc.size(30, 30));
  closeBtn.x = dialogWidth / 2 - 25;
  closeBtn.y = dialogHeight / 2 - 30;
  var cbg = closeBtn.addComponent(cc.Graphics);
  cbg.fillColor = cc.color(0, 0, 0, 80);
  cbg.circle(0, 0, 15);
  cbg.fill();
  closeBtn.parent = dialog;
  var closeX = new cc.Node("X");
  closeX.anchorX = 0.5;
  closeX.anchorY = 0.5;
  var closeLabel = closeX.addComponent(cc.Label);
  closeLabel.string = "×";
  closeLabel.fontSize = 24;
  closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  closeX.color = cc.color(255, 255, 255);
  closeX.parent = closeBtn;
  closeBtn.on(cc.Node.EventType.TOUCH_END, function () {
    dialog.destroy();
  });

  // ===== 房间类型显示 =====
  var roomTypeBg = new cc.Node("RoomTypeBg");
  roomTypeBg.y = dialogHeight / 2 - 80;
  var rtbg = roomTypeBg.addComponent(cc.Graphics);
  rtbg.fillColor = cc.color(60, 55, 80, 200);
  rtbg.roundRect(-80, -16, 160, 32, 16);
  rtbg.fill();
  roomTypeBg.parent = dialog;
  var roomTypeText = new cc.Node("RoomType");
  roomTypeText.y = dialogHeight / 2 - 80;
  roomTypeText.anchorX = 0.5;
  roomTypeText.anchorY = 0.5;
  var rtl = roomTypeText.addComponent(cc.Label);
  rtl.string = roomConfig.room_name || "初级房";
  rtl.fontSize = 16;
  rtl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  roomTypeText.color = cc.color(255, 220, 120);
  roomTypeText.parent = dialog;

  // ===== 房间名称输入 =====
  var nameLabel = new cc.Node("NameLabel");
  nameLabel.x = -dialogWidth / 2 + 30;
  nameLabel.y = dialogHeight / 2 - 130;
  nameLabel.anchorX = 0;
  nameLabel.anchorY = 0.5;
  var nll = nameLabel.addComponent(cc.Label);
  nll.string = "房间名称:";
  nll.fontSize = 18; // 增大字体
  nameLabel.color = cc.color(220, 210, 190);
  nameLabel.parent = dialog;
  var nameInputData = {
    value: ""
  };
  var nameInputBtn = this._createEditBoxInput("输入房间名称（可选）", 40, dialogHeight / 2 - 165, dialogWidth - 80, 48,
  // 增加尺寸
  "NameInput", nameInputData);
  nameInputBtn.parent = dialog;

  // ===== 房间密码输入 =====
  var pwdLabel = new cc.Node("PwdLabel");
  pwdLabel.x = -dialogWidth / 2 + 30;
  pwdLabel.y = dialogHeight / 2 - 235;
  pwdLabel.anchorX = 0;
  pwdLabel.anchorY = 0.5;
  var pll = pwdLabel.addComponent(cc.Label);
  pll.string = "房间密码:";
  pll.fontSize = 18; // 增大字体
  pwdLabel.color = cc.color(220, 210, 190);
  pwdLabel.parent = dialog;
  var pwdInputData = {
    value: ""
  };
  var pwdInputBtn = this._createEditBoxInput("设置密码（可选）", 40, dialogHeight / 2 - 270, dialogWidth - 80, 48,
  // 增加尺寸
  "PwdInput", pwdInputData);
  pwdInputBtn.parent = dialog;

  // ===== 提示文字 =====
  var tipNode = new cc.Node("Tip");
  tipNode.y = -dialogHeight / 2 + 100;
  tipNode.anchorX = 0.5;
  tipNode.anchorY = 0.5;
  var tipLabel = tipNode.addComponent(cc.Label);
  tipLabel.string = "留空密码则创建公开房间，任何人可直接加入";
  tipLabel.fontSize = 14; // 增大字体
  tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tipNode.color = cc.color(160, 150, 140);
  tipNode.parent = dialog;

  // ===== 按钮区域 =====
  var btnY = -dialogHeight / 2 + 50;

  // 取消按钮
  var cancelBtn = this._createDialogButton("取消", cc.color(80, 75, 95), -90, btnY, 130, 48,
  // 增加尺寸
  function () {
    dialog.destroy();
  });
  cancelBtn.parent = dialog;

  // 创建按钮
  var createBtn = this._createDialogButton("创建房间", cc.color(255, 152, 0),
  // 橙色
  90, btnY, 150, 48,
  // 增加尺寸
  function () {
    // 获取输入内容 - 从 EditBox 获取
    var nameInput = dialog.getChildByName("NameInput");
    var pwdInput = dialog.getChildByName("PwdInput");
    var nameEditBox = nameInput ? nameInput.getComponent(cc.EditBox) : null;
    var pwdEditBox = pwdInput ? pwdInput.getComponent(cc.EditBox) : null;
    var roomName = nameEditBox && nameEditBox.string || roomConfig.room_name || "我的房间";
    var password = pwdEditBox && pwdEditBox.string || "";

    // 保存房间信息
    var myglobal = window.myglobal;
    if (myglobal) {
      myglobal.createRoomInfo = {
        roomName: roomName,
        password: password,
        roomConfig: roomConfig
      };
    }
    dialog.destroy();

    // 关闭房间列表界面并创建房间
    var scene = parentNode.getChildByName("RoomListScene") || parentNode;
    if (scene.destroy) scene.destroy();

    // 调用原来的创建房间方法
    self._createRoom(roomConfig, playerGold);
  });
  createBtn.parent = dialog;
}, _cc$Class._createEditBoxInput = function _createEditBoxInput(placeholder, x, y, width, height, nodeName, dataRef) {
  var inputNode = new cc.Node(nodeName);
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0;
  inputNode.anchorY = 0.5;

  // 背景
  var bg = inputNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(50, 45, 65, 255);
  bg.roundRect(0, -height / 2, width, height, 8);
  bg.fill();
  bg.strokeColor = cc.color(120, 100, 70, 220);
  bg.lineWidth = 2;
  bg.roundRect(0, -height / 2, width, height, 8);
  bg.stroke();

  // 使用 EditBox 组件
  var editBox = inputNode.addComponent(cc.EditBox);
  editBox.string = "";
  editBox.placeholder = placeholder;
  editBox.fontSize = 18;
  editBox.fontColor = cc.color(255, 255, 255);
  editBox.placeholderFontSize = 16;
  editBox.placeholderFontColor = cc.color(130, 120, 110);
  editBox.maxLength = 30;
  editBox.inputMode = cc.EditBox.InputMode.ANY;
  editBox.returnType = cc.EditBox.KeyboardReturnType.DONE;
  editBox.lineHeight = height - 10;

  // 输入事件
  editBox.node.on('text-changed', function (editbox) {
    if (dataRef) {
      dataRef.value = editbox.string;
    }
  });

  // 焦点事件 - 更新背景样式
  editBox.node.on('editing-did-begin', function () {
    bg.clear();
    bg.fillColor = cc.color(60, 55, 80, 255);
    bg.roundRect(0, -height / 2, width, height, 8);
    bg.fill();
    bg.strokeColor = cc.color(255, 180, 80, 255);
    bg.lineWidth = 2;
    bg.roundRect(0, -height / 2, width, height, 8);
    bg.stroke();
  });
  editBox.node.on('editing-did-end', function () {
    bg.clear();
    bg.fillColor = cc.color(50, 45, 65, 255);
    bg.roundRect(0, -height / 2, width, height, 8);
    bg.fill();
    bg.strokeColor = cc.color(120, 100, 70, 220);
    bg.lineWidth = 2;
    bg.roundRect(0, -height / 2, width, height, 8);
    bg.stroke();
  });
  return inputNode;
}, _cc$Class._createInputDialogInput = function _createInputDialogInput(placeholder, x, y, width, height, nodeName, dataRef) {
  var self = this;
  var inputNode = new cc.Node(nodeName);
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0.5;
  inputNode.anchorY = 0.5;

  // 背景
  var bg = inputNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(50, 45, 65, 255);
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.fill();
  bg.strokeColor = cc.color(120, 100, 70, 200);
  bg.lineWidth = 1;
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.stroke();

  // placeholder/值显示
  var textNode = new cc.Node("Text");
  textNode.anchorX = 0.5;
  textNode.anchorY = 0.5;
  textNode.parent = inputNode;
  var label = textNode.addComponent(cc.Label);
  label.string = placeholder;
  label.fontSize = 14;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  textNode.color = cc.color(130, 120, 110);

  // 使用系统提示输入
  inputNode.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();

    // 使用 prompt 获取输入（Web端可用）
    var input = "";
    try {
      if (typeof window !== 'undefined' && window.prompt) {
        input = window.prompt(placeholder, dataRef.value || "") || "";
      }
    } catch (e) {}
    if (input) {
      dataRef.value = input;
      label.string = input;
      textNode.color = cc.color(255, 255, 255);
    } else if (dataRef.value) {
      label.string = dataRef.value;
      textNode.color = cc.color(255, 255, 255);
    } else {
      label.string = placeholder;
      textNode.color = cc.color(130, 120, 110);
    }
  });
  return inputNode;
}, _cc$Class._createDialogButton = function _createDialogButton(text, bgColor, x, y, width, height, callback) {
  var btn = new cc.Node("Btn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, y);
  btn.anchorX = 0.5;
  btn.anchorY = 0.5;

  // 背景
  var bg = btn.addComponent(cc.Graphics);
  bg.fillColor = bgColor;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.fill();

  // 边框
  bg.strokeColor = cc.color(Math.min(255, bgColor.r + 30), Math.min(255, bgColor.g + 30), Math.min(255, bgColor.b + 30));
  bg.lineWidth = 2;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.stroke();

  // 文字
  var textNode = new cc.Node("Text");
  textNode.anchorX = 0.5;
  textNode.anchorY = 0.5;
  var label = textNode.addComponent(cc.Label);
  label.string = text;
  label.fontSize = 18;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  textNode.color = cc.color(255, 255, 255);
  textNode.parent = btn;

  // 触摸效果
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._createBeautifulInput = function _createBeautifulInput(placeholder, x, y, width, height, nodeName) {
  var inputNode = new cc.Node(nodeName || "BeautifulInput");
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0.5;
  inputNode.anchorY = 0.5;

  // 输入框背景
  var bgNode = new cc.Node("InputBg");
  bgNode.setPosition(0, 0);
  bgNode.anchorX = 0.5;
  bgNode.anchorY = 0.5;
  var bg = bgNode.addComponent(cc.Graphics);
  // 内部填充
  bg.fillColor = cc.color(55, 45, 70, 255);
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.fill();
  // 边框
  bg.strokeColor = cc.color(150, 120, 80, 200);
  bg.lineWidth = 2;
  bg.roundRect(-width / 2, -height / 2, width, height, 6);
  bg.stroke();
  // 内部高光
  bg.strokeColor = cc.color(80, 70, 100, 100);
  bg.lineWidth = 1;
  bg.roundRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 4);
  bg.stroke();
  bgNode.parent = inputNode;

  // placeholder文字
  var placeholderNode = new cc.Node("Placeholder");
  placeholderNode.setPosition(0, 0);
  placeholderNode.anchorX = 0.5;
  placeholderNode.anchorY = 0.5;
  placeholderNode.width = width - 20;
  placeholderNode.height = height;
  var label = placeholderNode.addComponent(cc.Label);
  label.string = placeholder;
  label.fontSize = 14;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  placeholderNode.color = cc.color(140, 130, 120);
  placeholderNode.parent = inputNode;
  return inputNode;
}, _cc$Class._createBeautifulButton = function _createBeautifulButton(text, bgColor, borderColor, x, y, width, height, callback, isPrimary) {
  var btn = new cc.Node("BeautifulBtn_" + text);
  btn.setContentSize(cc.size(width, height));
  btn.setPosition(x, y);
  btn.anchorX = 0.5;
  btn.anchorY = 0.5;

  // 按钮背景节点
  var bgNode = new cc.Node("BgNode");
  bgNode.setPosition(0, 0);
  bgNode.anchorX = 0.5;
  bgNode.anchorY = 0.5;
  var bg = bgNode.addComponent(cc.Graphics);

  // 绘制按钮背景
  bg.fillColor = bgColor;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.fill();

  // 外边框
  bg.strokeColor = borderColor;
  bg.lineWidth = 2;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.stroke();

  // 主按钮高光效果
  if (isPrimary) {
    // 顶部高光
    bg.fillColor = cc.color(255, 255, 255, 40);
    bg.roundRect(-width / 2 + 3, 3, width - 6, height / 2 - 3, 5);
    bg.fill();
    // 底部阴影
    bg.fillColor = cc.color(0, 0, 0, 30);
    bg.roundRect(-width / 2 + 3, -height / 2 + 3, width - 6, height / 3, 3);
    bg.fill();
  }
  bgNode.parent = btn;

  // 按钮文字节点
  var textNode = new cc.Node("TextNode");
  textNode.setPosition(0, 0);
  textNode.anchorX = 0.5;
  textNode.anchorY = 0.5;
  textNode.width = width;
  textNode.height = height;
  var label = textNode.addComponent(cc.Label);
  label.string = text;
  label.fontSize = Math.floor(height * 0.4);
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  textNode.color = cc.color(255, 255, 255);
  var outline = textNode.addComponent(cc.LabelOutline);
  outline.color = cc.color(0, 0, 0, 150);
  outline.width = 2;
  textNode.parent = btn;

  // 触摸事件
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._createDialogInput = function _createDialogInput(placeholder, x, y, width, height, nodeName) {
  var inputNode = new cc.Node(nodeName || "DialogInput");
  inputNode.setContentSize(cc.size(width, height));
  inputNode.setPosition(x, y);
  inputNode.anchorX = 0.5;
  inputNode.anchorY = 0.5;

  // 输入框背景
  var bgNode = new cc.Node("InputBg");
  bgNode.setPosition(0, 0);
  bgNode.anchorX = 0.5;
  bgNode.anchorY = 0.5;
  var bg = bgNode.addComponent(cc.Graphics);
  bg.fillColor = cc.color(50, 45, 65, 255);
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.fill();
  bg.strokeColor = cc.color(100, 90, 70, 200);
  bg.lineWidth = 1;
  bg.roundRect(-width / 2, -height / 2, width, height, 5);
  bg.stroke();
  bgNode.parent = inputNode;

  // placeholder文字
  var placeholderNode = new cc.Node("Placeholder");
  placeholderNode.setPosition(0, 0);
  placeholderNode.anchorX = 0.5;
  placeholderNode.anchorY = 0.5;
  placeholderNode.width = width - 20;
  placeholderNode.height = height;
  var label = placeholderNode.addComponent(cc.Label);
  label.string = placeholder;
  label.fontSize = Math.floor(height * 0.4);
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  placeholderNode.color = cc.color(120, 110, 100);
  placeholderNode.parent = inputNode;
  return inputNode;
}, _cc$Class._showPasswordDialog = function _showPasswordDialog(roomCode, roomConfig, playerGold, callback) {
  var self = this;

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 弹窗容器
  var dialog = new cc.Node("PasswordDialog");
  dialog.setContentSize(cc.size(screenWidth, screenHeight));
  dialog.setPosition(0, 0);
  dialog.zIndex = 3500;
  dialog.parent = this.node;

  // 半透明遮罩
  var mask = new cc.Node("Mask");
  var maskG = mask.addComponent(cc.Graphics);
  maskG.fillColor = cc.color(0, 0, 0, 180);
  maskG.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskG.fill();
  mask.parent = dialog;
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
  });

  // 弹窗主体
  var dialogWidth = 350;
  var dialogHeight = 220;
  var dialogBg = new cc.Node("DialogBg");
  dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
  var dbg = dialogBg.addComponent(cc.Graphics);
  dbg.fillColor = cc.color(35, 30, 50, 250);
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.fill();
  dbg.strokeColor = cc.color(180, 140, 60, 200);
  dbg.lineWidth = 3;
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.stroke();
  dialogBg.parent = dialog;

  // 标题
  var titleText = new cc.Node("Title");
  titleText.setPosition(0, dialogHeight / 2 - 40);
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var ttl = titleText.addComponent(cc.Label);
  ttl.string = "该房间需要密码";
  ttl.fontSize = 22;
  ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(255, 220, 100);
  titleText.parent = dialog;

  // 房间号显示
  var codeText = new cc.Node("RoomCode");
  codeText.setPosition(0, dialogHeight / 2 - 75);
  codeText.anchorX = 0.5;
  codeText.anchorY = 0.5;
  var ctl = codeText.addComponent(cc.Label);
  ctl.string = "房间号: " + roomCode;
  ctl.fontSize = 14;
  ctl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  codeText.color = cc.color(160, 150, 130);
  codeText.parent = dialog;

  // 密码输入框
  var pwdInput = this._createDialogInput("请输入密码", 0, 10, 200, 36, "PwdInput");
  pwdInput.parent = dialog;

  // 按钮区域
  var btnY = -dialogHeight / 2 + 45;

  // 取消按钮
  var cancelBtn = this._createButtonNode("取消", cc.color(80, 75, 90), -70, btnY, 80, 34, function () {
    dialog.destroy();
  });
  cancelBtn.parent = dialog;

  // 确认按钮
  var confirmBtn = this._createButtonNode("确认", cc.color(40, 130, 70), 70, btnY, 80, 34, function () {
    var pwdInputNode = dialog.getChildByName("PwdInput");
    var placeholder = pwdInputNode ? pwdInputNode.getChildByName("Placeholder") : null;
    var password = placeholder ? placeholder.getComponent(cc.Label).string : "";
    if (!password || password === "请输入密码") {
      self._showTipInDialog(dialog, "请输入密码");
      return;
    }

    // 验证密码（这里需要调用服务端验证）

    dialog.destroy();
    if (callback) {
      callback(password);
    }
  }, true);
  confirmBtn.parent = dialog;
  return dialog;
}, _cc$Class._showTipInDialog = function _showTipInDialog(dialog, message) {
  var tip = dialog.getChildByName("TipText");
  if (tip) tip.destroy();
  tip = new cc.Node("TipText");
  tip.setPosition(0, -50);
  tip.anchorX = 0.5;
  tip.anchorY = 0.5;
  var label = tip.addComponent(cc.Label);
  label.string = message;
  label.fontSize = 14;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tip.color = cc.color(255, 150, 100);
  tip.parent = dialog;
  this.scheduleOnce(function () {
    if (tip && tip.isValid) tip.destroy();
  }, 2);
}, _cc$Class._fetchAndRenderRoomListForScene = function _fetchAndRenderRoomListForScene(container, loadingLabel, roomConfig, playerGold, sceneNode) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;

  // 检查WebSocket是否已连接
  var isConnected = socket && socket.isConnected && socket.isConnected();
  var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();

  // 存储当前房间列表，用于实时更新
  var currentRooms = [];

  // 设置实时房间列表更新监听器
  var roomListUpdateHandler = function roomListUpdateHandler(data) {
    var actionType = data.action_type;
    var roomCode = data.room_code;
    var room = data.room;
    if (actionType === "add" && room) {
      // 添加新房间
      var exists = currentRooms.some(function (r) {
        return (r.room_code || r.roomCode) === (room.room_code || room.roomCode);
      });
      if (!exists) {
        currentRooms.push(room);
      }
    } else if (actionType === "update" && room) {
      // 更新房间信息
      for (var i = 0; i < currentRooms.length; i++) {
        if ((currentRooms[i].room_code || currentRooms[i].roomCode) === (room.room_code || room.roomCode)) {
          currentRooms[i] = room;
          break;
        }
      }
    } else if (actionType === "remove") {
      // 移除房间
      currentRooms = currentRooms.filter(function (r) {
        return (r.room_code || r.roomCode) !== roomCode;
      });
    }

    // 重新渲染房间列表
    var filteredRooms = currentRooms.filter(function (r) {
      var count = r.player_count || r.playerCount || 0;
      return count > 0 && count < 3;
    });
    self._renderRoomListInScene(container, filteredRooms, roomConfig, playerGold, sceneNode);
  };

  // 注册监听器
  if (socket && socket.onRoomListUpdate) {
    socket.onRoomListUpdate(roomListUpdateHandler);
  }

  // 保存监听器引用，用于后续取消注册
  sceneNode._roomListUpdateHandler = roomListUpdateHandler;

  // 如果WebSocket未连接，显示空列表
  if (!socket || !isConnected || !isWebSocketOpen) {
    this.scheduleOnce(function () {
      if (loadingLabel && loadingLabel.isValid) {
        loadingLabel.active = false;
      }
      // 显示空列表提示
      self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
    }, 0.5);
    return;
  }

  // 设置超时
  var timeoutId = setTimeout(function () {
    if (loadingLabel && loadingLabel.isValid) {
      loadingLabel.active = false;
    }
    // 显示空列表提示
    self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
  }, 5000);
  socket.getRoomList(function (result, rooms) {
    clearTimeout(timeoutId);
    if (loadingLabel && loadingLabel.isValid) {
      loadingLabel.active = false;
    }
    if (result === 0 && rooms && rooms.length > 0) {
      // 存储房间列表用于实时更新
      currentRooms = rooms;

      // 过滤：只显示人数少于3人的房间
      var filteredRooms = rooms.filter(function (room) {
        var count = room.player_count || room.playerCount || 0;
        return count > 0 && count < 3;
      });
      self._renderRoomListInScene(container, filteredRooms, roomConfig, playerGold, sceneNode);
    } else {
      // 没有房间或请求失败，显示空列表
      self._renderRoomListInScene(container, [], roomConfig, playerGold, sceneNode);
    }
  });
}, _cc$Class._renderRoomListInScene = function _renderRoomListInScene(container, rooms, roomConfig, playerGold, sceneNode) {
  var self = this;

  // 清空容器中非LoadingLabel的子节点
  var children = container.children.slice();
  for (var i = 0; i < children.length; i++) {
    if (children[i].name !== "LoadingLabel") {
      children[i].destroy();
    }
  }
  var containerWidth = container.width;
  var colWidth = containerWidth / 5;
  var itemHeight = 50; // 增加列表项高度
  var startY = container.height / 2 - 15;

  // 空列表处理
  if (!rooms || rooms.length === 0) {
    var emptyNode = new cc.Node("EmptyTip");
    emptyNode.anchorX = 0.5;
    emptyNode.anchorY = 0.5;
    var el = emptyNode.addComponent(cc.Label);
    el.string = "暂无可加入的房间";
    el.fontSize = 18; // 增大字体
    el.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    emptyNode.color = cc.color(160, 150, 140);
    emptyNode.parent = container;
    return;
  }

  // 渲染房间列表项
  for (var i = 0; i < rooms.length && i < 8; i++) {
    var room = rooms[i];
    var itemY = startY - i * itemHeight;

    // 列表项背景
    var itemBg = new cc.Node("RoomItem_" + i);
    itemBg.setContentSize(cc.size(containerWidth - 5, itemHeight - 4));
    itemBg.setPosition(0, itemY);
    var ig = itemBg.addComponent(cc.Graphics);
    ig.fillColor = i % 2 === 0 ? cc.color(35, 30, 50, 220) : cc.color(30, 28, 45, 220);
    ig.roundRect(-(containerWidth - 5) / 2, -(itemHeight - 4) / 2, containerWidth - 5, itemHeight - 4, 4);
    ig.fill();
    itemBg.parent = container;
    var playerCount = room.player_count || room.playerCount || 0;
    var roomCode = room.room_code || room.roomCode || "未知";

    // 房间号 - 增大字体
    var codeText = new cc.Node("CodeText");
    codeText.x = -containerWidth / 2 + colWidth * 0.5;
    codeText.anchorX = 0.5;
    codeText.anchorY = 0.5;
    var cl = codeText.addComponent(cc.Label);
    cl.string = roomCode;
    cl.fontSize = 16; // 增大字体
    cl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    codeText.color = cc.color(220, 200, 160);
    codeText.parent = itemBg;

    // 人数 - 增大字体
    var countText = new cc.Node("CountText");
    countText.x = -containerWidth / 2 + colWidth * 1.5;
    countText.anchorX = 0.5;
    countText.anchorY = 0.5;
    var ctl = countText.addComponent(cc.Label);
    ctl.string = playerCount + "/3";
    ctl.fontSize = 16; // 增大字体
    ctl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    countText.color = playerCount >= 3 ? cc.color(220, 100, 80) : cc.color(100, 200, 100);
    countText.parent = itemBg;

    // 底分 - 增大字体
    var scoreText = new cc.Node("ScoreText");
    scoreText.x = -containerWidth / 2 + colWidth * 2.5;
    scoreText.anchorX = 0.5;
    scoreText.anchorY = 0.5;
    var sl = scoreText.addComponent(cc.Label);
    sl.string = "" + (room.base_score || roomConfig.base_score || 1);
    sl.fontSize = 16; // 增大字体
    sl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    scoreText.color = cc.color(220, 180, 80);
    scoreText.parent = itemBg;

    // 状态 - 增大字体
    var statusText = new cc.Node("StatusText");
    statusText.x = -containerWidth / 2 + colWidth * 3.5;
    statusText.anchorX = 0.5;
    statusText.anchorY = 0.5;
    var stl = statusText.addComponent(cc.Label);
    stl.string = playerCount >= 3 ? "已满" : "等待中";
    stl.fontSize = 16; // 增大字体
    stl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    statusText.color = playerCount >= 3 ? cc.color(220, 100, 80) : cc.color(100, 200, 100);
    statusText.parent = itemBg;

    // 加入按钮 - 增大尺寸
    (function (roomData) {
      var joinBtn = self._createActionButton("加入", cc.color(76, 175, 80), -containerWidth / 2 + colWidth * 4.5, 0, 70, 36,
      // 增加尺寸
      function () {
        var code = roomData.room_code || roomData.roomCode;
        var scene = sceneNode.getChildByName("RoomListScene") || sceneNode;
        if (scene.destroy) scene.destroy();
        self._joinRoom(code, roomConfig, playerGold);
      });
      joinBtn.parent = itemBg;
    })(room);
  }
}, _cc$Class._showRoomListDialog = function _showRoomListDialog(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;

  // 移除旧的弹窗
  var oldDialog = this.node.getChildByName("RoomListDialog");
  if (oldDialog) oldDialog.destroy();

  // 移除旧的提示
  var oldTip = this.node.getChildByName("room_tip");
  if (oldTip) oldTip.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var dialog = new cc.Node("RoomListDialog");
  dialog.setContentSize(cc.size(650, 450));
  dialog.anchorX = 0.5;
  dialog.anchorY = 0.5;
  dialog.x = 0;
  dialog.y = 50; // 稍微上移
  dialog.zIndex = 1000; // 确保在最上层
  dialog.parent = this.node;

  // 添加背景遮罩（半透明黑色）
  var mask = new cc.Node("Mask");
  mask.setContentSize(cc.size(screenWidth, screenHeight));
  mask.anchorX = 0.5;
  mask.anchorY = 0.5;
  mask.x = 0;
  mask.y = -50;
  var maskGraphics = mask.addComponent(cc.Graphics);
  maskGraphics.fillColor = cc.color(0, 0, 0, 180);
  maskGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskGraphics.fill();
  mask.parent = dialog;

  // 点击遮罩关闭弹窗
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    dialog.destroy();
  });

  // 添加弹窗背景（白色圆角矩形）
  var bgNode = new cc.Node("BgNode");
  bgNode.setContentSize(cc.size(620, 420));
  var bgGraphics = bgNode.addComponent(cc.Graphics);
  bgGraphics.fillColor = cc.color(45, 45, 65, 255);
  bgGraphics.roundRect(-310, -210, 620, 420, 15);
  bgGraphics.fill();
  bgGraphics.strokeColor = cc.color(100, 100, 140, 255);
  bgGraphics.lineWidth = 3;
  bgGraphics.roundRect(-310, -210, 620, 420, 15);
  bgGraphics.stroke();
  bgNode.parent = dialog;

  // 标题
  var titleNode = new cc.Node("Title");
  titleNode.y = 170;
  var titleLabel = titleNode.addComponent(cc.Label);
  titleLabel.string = "【" + roomConfig.room_name + "】";
  titleLabel.fontSize = 36;
  titleLabel.lineHeight = 44;
  titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleNode.color = cc.color(255, 215, 0);
  titleNode.parent = dialog;

  // 副标题
  var subTitleNode = new cc.Node("SubTitle");
  subTitleNode.y = 130;
  var subTitleLabel = subTitleNode.addComponent(cc.Label);
  subTitleLabel.string = "选择游戏方式";
  subTitleLabel.fontSize = 24;
  subTitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  subTitleNode.color = cc.color(180, 180, 200);
  subTitleNode.parent = dialog;

  // 房间列表容器
  var listContainer = new cc.Node("ListContainer");
  listContainer.setContentSize(cc.size(580, 120));
  listContainer.y = 50;
  listContainer.parent = dialog;

  // 加载中的提示
  var loadingLabel = new cc.Node("LoadingLabel");
  loadingLabel.y = 0;
  var loading = loadingLabel.addComponent(cc.Label);
  loading.string = "正在获取房间列表...";
  loading.fontSize = 22;
  loading.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  loadingLabel.color = cc.color(150, 150, 170);
  loadingLabel.parent = listContainer;

  // 按钮容器 - 放在中间显眼位置
  var btnContainer = new cc.Node("BtnContainer");
  btnContainer.y = -60;
  btnContainer.parent = dialog;

  // 快速匹配按钮（绿色，最大）
  var quickMatchBtn = this._createButton("🎮 快速匹配", cc.color(46, 125, 50), -200, function () {
    dialog.destroy();
    self._quickMatch(roomConfig, playerGold);
  }, 180, 55);
  quickMatchBtn.parent = btnContainer;

  // 创建房间按钮（蓝色）
  var createRoomBtn = this._createButton("🏠 创建房间", cc.color(21, 101, 192), 0, function () {
    dialog.destroy();
    self._createRoom(roomConfig, playerGold);
  }, 180, 55);
  createRoomBtn.parent = btnContainer;

  // 关闭按钮（灰色）
  var closeBtn = this._createButton("✖ 关闭", cc.color(120, 120, 120), 200, function () {
    dialog.destroy();
  }, 100, 45);
  closeBtn.parent = btnContainer;

  // 输入房间号区域
  var inputContainer = new cc.Node("InputContainer");
  inputContainer.y = -140;
  inputContainer.parent = dialog;
  var inputLabel = new cc.Node("InputLabel");
  inputLabel.x = -250;
  var inputLabelComp = inputLabel.addComponent(cc.Label);
  inputLabelComp.string = "房间号:";
  inputLabelComp.fontSize = 22;
  inputLabel.color = cc.color(200, 200, 200);
  inputLabel.parent = inputContainer;

  // 房间号输入框背景
  var inputBgNode = new cc.Node("InputBg");
  inputBgNode.setContentSize(cc.size(180, 40));
  inputBgNode.x = -110;
  var inputBg = inputBgNode.addComponent(cc.Graphics);
  inputBg.fillColor = cc.color(60, 60, 80, 255);
  inputBg.roundRect(-90, -20, 180, 40, 5);
  inputBg.fill();
  inputBgNode.parent = inputContainer;
  var inputText = inputBgNode.addComponent(cc.Label);
  inputText.string = "点击输入房间号";
  inputText.fontSize = 18;
  inputText.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  inputText.verticalAlign = cc.Label.VerticalAlign.CENTER;

  // 加入房间按钮
  var joinBtn = this._createButton("➤ 加入", cc.color(230, 126, 34), 100, function () {
    var roomCode = inputText.string;
    if (roomCode && roomCode !== "点击输入房间号") {
      dialog.destroy();
      self._joinRoom(roomCode, roomConfig, playerGold);
    } else {
      self._showMessageCenter("请输入房间号");
    }
  }, 90, 40);
  joinBtn.parent = inputContainer;

  // 底部提示
  var tipNode = new cc.Node("Tip");
  tipNode.y = -185;
  var tipLabel = tipNode.addComponent(cc.Label);
  tipLabel.string = "提示：快速匹配将自动为您分配房间";
  tipLabel.fontSize = 16;
  tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tipNode.color = cc.color(120, 120, 140);
  tipNode.parent = dialog;

  // 获取房间列表
  this._fetchRoomList(listContainer, loadingLabel);
}, _cc$Class._createButton = function _createButton(text, color, x, callback, width, height) {
  width = width || 140;
  height = height || 50;
  var btn = new cc.Node(text + "Btn");
  btn.setContentSize(cc.size(width, height));
  btn.x = x;

  // 按钮背景
  var bg = btn.addComponent(cc.Graphics);
  bg.fillColor = color;
  bg.roundRect(-width / 2, -height / 2, width, height, 8);
  bg.fill();

  // 按钮文字
  var label = btn.addComponent(cc.Label);
  label.string = text;
  label.fontSize = 20;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  label.verticalAlign = cc.Label.VerticalAlign.CENTER;
  btn.color = cc.color(255, 255, 255);

  // 触摸效果
  btn.on(cc.Node.EventType.TOUCH_START, function (event) {
    event.stopPropagation();
    btn.scale = 0.95;
  });
  btn.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    btn.scale = 1;
    if (callback) callback();
  });
  btn.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
    btn.scale = 1;
  });
  return btn;
}, _cc$Class._fetchRoomList = function _fetchRoomList(container, loadingLabel) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;

  // 检查WebSocket是否已连接
  var isConnected = socket && socket.isConnected && socket.isConnected();
  var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();

  // 如果WebSocket未连接，显示空列表
  if (!socket || !isConnected || !isWebSocketOpen) {
    loadingLabel.getComponent(cc.Label).string = "未连接服务器";
    this.scheduleOnce(function () {
      if (loadingLabel && loadingLabel.isValid) {
        loadingLabel.destroy();
      }
      // 显示空列表提示
      self._renderRoomList(container, []);
    }, 0.5);
    return;
  }

  // 设置超时
  var timeoutId = setTimeout(function () {
    if (loadingLabel && loadingLabel.isValid) {
      loadingLabel.destroy();
    }
    // 显示空列表提示
    self._renderRoomList(container, []);
  }, 5000);
  socket.getRoomList(function (result, rooms) {
    clearTimeout(timeoutId);
    if (loadingLabel && loadingLabel.isValid) {
      loadingLabel.destroy();
    }
    if (result === 0 && rooms && rooms.length > 0) {
      self._renderRoomList(container, rooms);
    } else {
      // 服务端返回空列表或失败，显示空列表
      self._renderRoomList(container, []);
    }
  });
}, _cc$Class._renderRoomList = function _renderRoomList(container, rooms) {
  var self = this;

  // 如果没有房间，显示空列表提示
  if (!rooms || rooms.length === 0) {
    var emptyNode = new cc.Node("EmptyTip");
    emptyNode.y = 0;
    var emptyBg = emptyNode.addComponent(cc.Graphics);
    emptyBg.fillColor = cc.color(35, 30, 50, 200);
    emptyBg.roundRect(-150, -25, 300, 50, 8);
    emptyBg.fill();
    emptyBg.strokeColor = cc.color(100, 80, 50, 150);
    emptyBg.lineWidth = 1;
    emptyBg.roundRect(-150, -25, 300, 50, 8);
    emptyBg.stroke();
    var emptyLabel = new cc.Node("Label");
    emptyLabel.anchorX = 0.5;
    emptyLabel.anchorY = 0.5;
    var el = emptyLabel.addComponent(cc.Label);
    el.string = "暂无房间，请创建或刷新";
    el.fontSize = 16;
    el.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    emptyLabel.color = cc.color(180, 160, 120);
    emptyLabel.parent = emptyNode;
    emptyNode.parent = container;
    return;
  }
  for (var i = 0; i < rooms.length && i < 5; i++) {
    var room = rooms[i];
    var item = new cc.Node("RoomItem_" + i);
    item.setContentSize(cc.size(540, 35));
    item.y = 70 - i * 40;
    var bg = item.addComponent(cc.Sprite);
    bg.color = i % 2 === 0 ? cc.color(50, 50, 70) : cc.color(45, 45, 65);

    // 房间号
    var codeLabel = new cc.Node();
    codeLabel.x = -200;
    var code = codeLabel.addComponent(cc.Label);
    code.string = "房间: " + (room.room_code || room.roomCode || "未知");
    code.fontSize = 18;
    codeLabel.color = cc.color(200, 200, 200);
    codeLabel.parent = item;

    // 人数
    var countLabel = new cc.Node();
    countLabel.x = 50;
    var count = countLabel.addComponent(cc.Label);
    count.string = "人数: " + (room.player_count || room.playerCount || 0) + "/3";
    count.fontSize = 18;
    countLabel.color = cc.color(150, 200, 150);
    countLabel.parent = item;

    // 加入按钮
    var joinBtn = this._createButton("加入", cc.color(76, 175, 80), 200, function () {
      var roomCode = room.room_code || room.roomCode;
      self._joinRoom(roomCode, myglobal.currentRoomConfig, myglobal.playerData.gobal_count);
    });
    joinBtn.setContentSize(cc.size(70, 30));
    joinBtn.x = 220;
    joinBtn.parent = item;
    item.parent = container;
  }
}, _cc$Class._quickMatch = function _quickMatch(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;

  // 检查WebSocket物理连接是否打开
  var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
  this._showMessageCenter("正在智能匹配...");

  // 如果WebSocket未打开，等待连接
  if (!socket || !isWebSocketOpen) {
    // 尝试初始化WebSocket连接
    if (socket && socket.initSocket) {
      socket.initSocket();
    }

    // 等待WebSocket连接后进行智能匹配
    this._waitForConnectionAndSmartMatch(roomConfig, playerGold);
    return;
  }

  // WebSocket已连接，执行智能匹配
  this._smartMatch(roomConfig, playerGold);
}, _cc$Class._smartMatch = function _smartMatch(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;
  if (!socket) {
    self._hideMessageCenter();
    self._showMessage("服务器连接异常，请稍后重试");
    return;
  }

  // 第一步：获取可加入的房间列表
  if (socket.getRoomList) {
    socket.getRoomList(function (result, rooms) {
      if (rooms && rooms.length > 0) {}
      if (result === 0 && rooms && rooms.length > 0) {
        // 找到人数不足3人的等待房间
        // 注意：服务器返回的字段名是 room_code 和 player_count（蛇形命名）
        var waitingRoom = null;
        for (var i = 0; i < rooms.length; i++) {
          var room = rooms[i];
          // 兼容两种命名方式
          var playerCount = room.player_count !== undefined ? room.player_count : room.playerCount;
          var roomCode = room.room_code || room.roomCode;
          if (playerCount < 3) {
            waitingRoom = room;
            break;
          }
        }
        if (waitingRoom) {
          // 有等待中的房间，加入该房间
          var waitingRoomCode = waitingRoom.room_code || waitingRoom.roomCode;
          self._showMessageCenter("找到等待房间，正在加入...");
          self._joinRoom(waitingRoomCode, roomConfig, playerGold);
          return;
        }
      }

      // 没有可加入的房间，创建新房间
      self._showMessageCenter("创建新房间，等待其他玩家...");
      self._createRoom(roomConfig, playerGold);
    });
  } else {
    // 没有获取房间列表的方法，直接创建房间
    self._createRoom(roomConfig, playerGold);
  }
}, _cc$Class._waitForConnectionAndSmartMatch = function _waitForConnectionAndSmartMatch(roomConfig, playerGold) {
  var self = this;
  var socket = window.myglobal && window.myglobal.socket ? window.myglobal.socket : null;
  var attempts = 0;
  var maxAttempts = 15; // 🔧【优化】增加尝试次数，但减少每次间隔

  var tryConnect = function tryConnect() {
    attempts++;
    var isWebSocketOpen = socket && socket.isWebSocketOpen ? socket.isWebSocketOpen() : false;
    if (isWebSocketOpen) {
      self._smartMatch(roomConfig, playerGold);
    } else if (attempts < maxAttempts) {
      setTimeout(tryConnect, 200); // 🔧【优化】减少间隔到200ms
    } else {
      self._hideMessageCenter();
      self._showMessage("连接服务器失败，请检查网络后重试");
    }
  };
  setTimeout(tryConnect, 100); // 🔧【优化】首次尝试只需100ms
}, _cc$Class._sendQuickMatchRequest = function _sendQuickMatchRequest(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;
  if (!socket || !socket.request_enter_room) {
    self._hideMessageCenter();
    self._showMessage("服务器连接异常，请稍后重试");
    return;
  }

  // 清除之前的超时计时器
  if (this._enterRoomTimeout) {
    clearTimeout(this._enterRoomTimeout);
    this._enterRoomTimeout = null;
  }
  socket.request_enter_room({
    room_level: roomConfig.room_type
  }, function (result, data) {
    // 清除超时计时器
    if (self._enterRoomTimeout) {
      clearTimeout(self._enterRoomTimeout);
      self._enterRoomTimeout = null;
    }
    if (result === 0 && data) {
      if (myglobal) {
        myglobal.roomData = data;
        myglobal.playerData.bottom = roomConfig.base_score || 1;
        myglobal.playerData.rate = roomConfig.multiplier || 1;
      }
      self._enterGameScene(data);
    } else {
      self._hideMessageCenter();
      self._showMessage("匹配失败，请稍后重试");
    }
  });

  // 设置超时
  this._enterRoomTimeout = setTimeout(function () {
    self._enterRoomTimeout = null;
    self._hideMessageCenter();
    self._showMessage("匹配超时，请检查网络连接");
  }, 15000); // 增加超时时间到15秒
}, _cc$Class._createRoom = function _createRoom(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;

  // 检查WebSocket物理连接是否打开
  var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
  this._showMessageCenter("正在进入游戏...");

  // 如果WebSocket未打开，尝试连接
  if (!socket || !isWebSocketOpen) {
    if (socket && socket.initSocket) {
      socket.initSocket();
    }
    this._waitForConnectionAndCreateRoom(roomConfig, playerGold);
    return;
  }

  // 发送创建房间请求
  this._sendCreateRoomRequest(roomConfig, playerGold);
}, _cc$Class._sendCreateRoomRequest = function _sendCreateRoomRequest(roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;
  if (!socket || !socket.createRoom) {
    self._hideMessageCenter();
    self._showMessage("服务器连接异常，请稍后重试");
    return;
  }

  // 获取当前玩家的服务端ID（用于房主判断）
  var playerId = "";
  if (socket.getPlayerInfo) {
    var playerInfo = socket.getPlayerInfo();
    playerId = playerInfo.id;
  }

  // 注意：socket.createRoom 的第一个参数是 roomConfigId，第二个参数是 callback
  var roomConfigId = roomConfig ? roomConfig.id : null;
  socket.createRoom(roomConfigId, function (result, data) {
    if (result === 0 && data) {
      // 🔧【修复】优先使用服务端返回的玩家数据
      var serverPlayer = data.player || {};
      var playerData = {
        accountid: serverPlayer.id || playerId || myglobal.playerData.accountID || myglobal.playerData.uniqueID,
        nick_name: serverPlayer.name || myglobal.playerData.nickName,
        avatarUrl: myglobal.playerData.avatarUrl || "avatar_1",
        gold_count: serverPlayer.gold_count || playerGold || 0,
        // 🔧【修复】优先使用服务端返回的金币
        goldcount: serverPlayer.gold_count || playerGold || 0,
        // 兼容旧客户端
        seatindex: (serverPlayer.seat !== undefined ? serverPlayer.seat : 0) + 1,
        isready: serverPlayer.ready || true // 房主创建房间默认已准备
      };

      // 转换数据格式
      var roomData = {
        roomid: data.room_code || data.roomCode || "NEW_ROOM",
        room_code: data.room_code || data.roomCode || "NEW_ROOM",
        seatindex: (serverPlayer.seat !== undefined ? serverPlayer.seat : 0) + 1,
        playerdata: [playerData],
        housemanageid: serverPlayer.id || playerId || myglobal.playerData.accountID || myglobal.playerData.uniqueID
      };
      myglobal.roomData = roomData;
      myglobal.playerData.bottom = roomConfig.base_score || 1;
      myglobal.playerData.rate = roomConfig.multiplier || 1;
      myglobal.playerData.roomid = roomData.room_code;

      // 保存重连信息
      if (myglobal.socket && myglobal.socket.saveReconnectInfo) {
        myglobal.socket.saveReconnectInfo();
      }
      self._enterGameScene(roomData);
    } else {
      self._hideMessageCenter();
      self._showMessage("创建房间失败，请稍后重试");
    }
  });
}, _cc$Class._waitForConnectionAndCreateRoom = function _waitForConnectionAndCreateRoom(roomConfig, playerGold) {
  var self = this;
  var socket = window.myglobal && window.myglobal.socket ? window.myglobal.socket : null;
  var attempts = 0;
  var maxAttempts = 15; // 🔧【优化】增加尝试次数

  var tryConnect = function tryConnect() {
    attempts++;
    var isWebSocketOpen = socket && socket.isWebSocketOpen ? socket.isWebSocketOpen() : false;
    if (isWebSocketOpen) {
      self._sendCreateRoomRequest(roomConfig, playerGold);
    } else if (attempts < maxAttempts) {
      setTimeout(tryConnect, 200); // 🔧【优化】减少间隔到200ms
    } else {
      self._hideMessageCenter();
      self._showMessage("连接服务器失败，请检查网络后重试");
    }
  };
  setTimeout(tryConnect, 100); // 🔧【优化】首次尝试只需100ms
}, _cc$Class._joinRoom = function _joinRoom(roomCode, roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;

  // 检查WebSocket物理连接是否打开
  var isWebSocketOpen = socket && socket.isWebSocketOpen && socket.isWebSocketOpen();
  this._showMessageCenter("正在加入房间 " + roomCode + "...");

  // 如果WebSocket未打开，尝试连接
  if (!socket || !isWebSocketOpen) {
    if (socket && socket.initSocket) {
      socket.initSocket();
    }
    this._waitForConnectionAndJoinRoom(roomCode, roomConfig, playerGold);
    return;
  }

  // 发送加入房间请求
  this._sendJoinRoomRequest(roomCode, roomConfig, playerGold);
}, _cc$Class._sendJoinRoomRequest = function _sendJoinRoomRequest(roomCode, roomConfig, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var socket = myglobal && myglobal.socket ? myglobal.socket : null;
  if (!socket || !socket.joinRoom) {
    self._hideMessageCenter();
    self._showMessage("服务器连接异常，请稍后重试");
    return;
  }
  socket.joinRoom(roomCode, function (result, data) {
    if (result === 0 && data) {
      // 检查 players 数组是否存在
      var players = data.players || [];

      // 获取房主ID
      var creatorId = data.creator_id || data.creatorId || "";

      // 获取当前玩家的 socket playerInfo
      if (myglobal.socket && myglobal.socket.getPlayerInfo) {
        var playerInfo = myglobal.socket.getPlayerInfo();
      }

      // 转换数据格式
      var roomData = {
        roomid: data.room_code || data.roomCode || roomCode,
        room_code: data.room_code || data.roomCode || roomCode,
        seatindex: data.player ? data.player.seat + 1 : 1,
        // 座位索引从1开始
        playerdata: players.map(function (p, idx) {
          return {
            accountid: p.id,
            nick_name: p.name,
            avatarUrl: p.avatar || "avatar_1",
            // 🔧【修复】使用实际头像URL
            gold_count: p.gold_count || 0,
            // 🔧【修复】使用服务端发送的金币数量
            goldcount: p.gold_count || 0,
            // 兼容旧客户端
            seatindex: (p.seat !== undefined ? p.seat : idx) + 1,
            // 座位索引从1开始
            isready: p.ready || false // 准备状态
          };
        }),

        housemanageid: creatorId,
        creator_id: creatorId
      };
      myglobal.roomData = roomData;
      myglobal.playerData.bottom = roomConfig.base_score || 1;
      myglobal.playerData.rate = roomConfig.multiplier || 1;
      self._enterGameScene(roomData);
    } else {
      self._hideMessageCenter();
      self._showMessage("加入房间失败，房间可能不存在");
    }
  });
}, _cc$Class._waitForConnectionAndJoinRoom = function _waitForConnectionAndJoinRoom(roomCode, roomConfig, playerGold) {
  var self = this;
  var socket = window.myglobal && window.myglobal.socket ? window.myglobal.socket : null;
  var attempts = 0;
  var maxAttempts = 15; // 🔧【优化】增加尝试次数

  var tryConnect = function tryConnect() {
    attempts++;
    var isWebSocketOpen = socket && socket.isWebSocketOpen ? socket.isWebSocketOpen() : false;
    if (isWebSocketOpen) {
      self._sendJoinRoomRequest(roomCode, roomConfig, playerGold);
    } else if (attempts < maxAttempts) {
      setTimeout(tryConnect, 200); // 🔧【优化】减少间隔到200ms
    } else {
      self._hideMessageCenter();
      self._showMessage("连接服务器失败，请检查网络后重试");
    }
  };
  setTimeout(tryConnect, 100); // 🔧【优化】首次尝试只需100ms
}, _cc$Class._waitForConnectionAndEnterRoom = function _waitForConnectionAndEnterRoom(roomConfig, socket, playerGold) {
  var self = this;
  var myglobal = window.myglobal;
  var attempts = 0;
  var maxAttempts = 10; // 最多等待5秒

  var tryEnter = function tryEnter() {
    attempts++;
    var isWebSocketOpen = socket && socket.isWebSocketOpen ? socket.isWebSocketOpen() : false;
    if (isWebSocketOpen) {
      self._sendQuickMatchRequest(roomConfig, playerGold);
    } else if (attempts < maxAttempts) {
      setTimeout(tryEnter, 500);
    } else {
      // 连接超时，提示用户检查网络
      console.error("WebSocket 连接超时");
      self._hideMessageCenter();
      self._showMessage("连接服务器超时，请检查网络设置");
    }
  };
  setTimeout(tryEnter, 500);
}, _cc$Class._formatGold = function _formatGold(gold) {
  if (gold >= 10000) {
    return (gold / 10000).toFixed(1) + "万";
  }
  return gold.toString();
}, _cc$Class._enterGameScene = function _enterGameScene(roomData) {
  var startTime = Date.now();

  // 隐藏加载提示
  this._hideMessageCenter();

  // 🔧【优化】显示快速进入动画
  this._showQuickEnterAnimation();

  // 🔧【优化】使用预加载的场景，切换更快
  if (this._gameScenePreloaded) {
    cc.director.runSceneImmediate(new cc.Scene(), function () {
      cc.director.loadScene("gameScene", function (err) {
        if (err) {
          console.error("🚀 [进入场景] 加载游戏场景失败:", err);
          return;
        }
        var elapsed = Date.now() - startTime;
      });
    });
  } else {
    cc.director.loadScene("gameScene", function (err) {
      if (err) {
        console.error("🚀 [进入场景] 加载游戏场景失败:", err);
        return;
      }
      var elapsed = Date.now() - startTime;
    });
  }
}, _cc$Class._showQuickEnterAnimation = function _showQuickEnterAnimation() {
  var self = this;

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建快速进入遮罩
  var maskNode = new cc.Node("QuickEnterMask");
  maskNode.setContentSize(cc.size(screenWidth * 2, screenHeight * 2));
  maskNode.color = cc.color(0, 0, 0);
  maskNode.opacity = 0;
  maskNode.zIndex = 9999;

  // 添加 BlockInputEvents 防止点击穿透
  maskNode.addComponent(cc.BlockInputEvents);
  maskNode.parent = this.node;

  // 🔧【修复】使用加载图片替代文字
  cc.resources.load('UI/loading_image', cc.SpriteFrame, function (err, spriteFrame) {
    // 🔧【关键修复】检查节点是否仍然有效
    if (!maskNode || !maskNode.isValid) {
      console.log("加载图片回调时节点已销毁，跳过");
      return;
    }
    if (err || !spriteFrame) {
      console.warn("加载 loading_image.png 失败，使用文字提示");
      // 降级：使用文字提示
      var loadingNode = new cc.Node("LoadingText");
      loadingNode.y = 0;
      var loadingLabel = loadingNode.addComponent(cc.Label);
      loadingLabel.string = "正在进入游戏...";
      loadingLabel.fontSize = 32;
      loadingLabel.lineHeight = 40;
      loadingLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      loadingNode.color = cc.color(255, 255, 255);
      loadingNode.parent = maskNode;
      return;
    }

    // 创建加载图片节点
    var loadingImageNode = new cc.Node("LoadingImage");
    loadingImageNode.setContentSize(cc.size(120, 120));
    loadingImageNode.anchorX = 0.5;
    loadingImageNode.anchorY = 0.5;
    var sprite = loadingImageNode.addComponent(cc.Sprite);
    sprite.spriteFrame = spriteFrame;
    sprite.type = cc.Sprite.Type.SIMPLE;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    loadingImageNode.parent = maskNode;

    // 添加旋转动画（180度/秒）
    self._quickEnterLoadingNode = loadingImageNode;
    self._quickEnterAnimating = true;
  });

  // 淡入动画
  cc.tween(maskNode).to(0.15, {
    opacity: 200
  }).start();

  // 保存引用，进入场景后销毁
  this._quickEnterMask = maskNode;
}, _cc$Class._showMessage = function _showMessage(message) {
  // 安全检查：确保节点存在
  if (!this.node || !this.node.isValid) {
    console.warn("_showMessage: 节点不存在或已销毁");
    return;
  }
  var tipNode = this.node.getChildByName("room_tip");
  if (tipNode) tipNode.destroy();
  tipNode = new cc.Node("room_tip");
  tipNode.anchorX = 0.5; // 水平居中
  tipNode.anchorY = 0.5; // 垂直居中
  tipNode.x = 0; // 水平居中（相对于父节点中心）
  tipNode.y = 311; // 显示在顶部中间的方框区域内（与消息/帮助/设置按钮同一高度）

  var label = tipNode.addComponent(cc.Label);
  label.string = message;
  label.fontSize = 22;
  label.lineHeight = 28;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER; // 文字居中
  tipNode.color = cc.color(255, 255, 0); // 黄色文字

  tipNode.parent = this.node;
  this.scheduleOnce(function () {
    if (tipNode && tipNode.isValid) tipNode.destroy();
  }, 2);
}, _cc$Class._showMessageCenter = function _showMessageCenter(message) {
  // 安全检查：确保节点存在
  if (!this.node || !this.node.isValid) {
    console.warn("_showMessageCenter: 节点不存在或已销毁");
    return;
  }
  var self = this;
  var tipNode = this.node.getChildByName("center_tip");
  if (tipNode) tipNode.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建提示容器
  tipNode = new cc.Node("center_tip");
  tipNode.zIndex = 2000;
  tipNode.parent = this.node;

  // 添加半透明背景遮罩
  var maskNode = new cc.Node("Mask");
  maskNode.setContentSize(cc.size(screenWidth, screenHeight));
  var maskGraphics = maskNode.addComponent(cc.Graphics);
  maskGraphics.fillColor = cc.color(0, 0, 0, 100); // 半透明黑色背景
  maskGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskGraphics.fill();
  maskNode.parent = tipNode;

  // 加载 loading_image.png 图片
  cc.resources.load('UI/loading_image', cc.SpriteFrame, function (err, spriteFrame) {
    if (err || !spriteFrame) {
      console.warn("加载 loading_image.png 失败，使用文字提示");
      // 降级：使用文字提示
      var labelNode = new cc.Node("Label");
      var label = labelNode.addComponent(cc.Label);
      label.string = message;
      label.fontSize = 26;
      label.lineHeight = 36;
      label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      labelNode.color = cc.color(255, 255, 255);
      labelNode.parent = tipNode;
      return;
    }

    // 创建加载图片节点
    var loadingNode = new cc.Node("LoadingImage");
    loadingNode.setContentSize(cc.size(120, 120)); // 设置加载图片大小
    loadingNode.anchorX = 0.5;
    loadingNode.anchorY = 0.5;
    var sprite = loadingNode.addComponent(cc.Sprite);
    sprite.spriteFrame = spriteFrame;
    sprite.type = cc.Sprite.Type.SIMPLE;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    loadingNode.parent = tipNode;

    // 标记正在动画中
    self._loadingImageAnimating = true;
    self._loadingImageNode = loadingNode;
  });

  // 不自动消失，需要手动调用 _hideMessageCenter 隐藏
  // 保存引用以便后续销毁
  this._centerTipNode = tipNode;
}, _cc$Class._hideMessageCenter = function _hideMessageCenter() {
  this._loadingImageAnimating = false;
  this._loadingImageNode = null;
  if (this._centerTipNode && this._centerTipNode.isValid) {
    this._centerTipNode.destroy();
    this._centerTipNode = null;
  }
  var tipNode = this.node.getChildByName("center_tip");
  if (tipNode && tipNode.isValid) {
    tipNode.destroy();
  }
}, _cc$Class._removeNoticeBoard = function _removeNoticeBoard() {
  var noticeNames = ["notice", "gonggao", "公告", "notice_board", "dingbuuibantoumingdi", "xiongmao3", "title", "Title", "标签"];
  for (var i = 0; i < noticeNames.length; i++) {
    var node = this.node.getChildByName(noticeNames[i]);
    if (node) node.active = false;
  }
  this._hideNodesWithText(this.node, "游戏公告");
  this._hideNodesWithText(this.node, "娱乐休闲");
  // 隐藏背景上的区域标签文字（不隐藏动态创建的 AreaTitle）
  this._hideBackgroundLabels();
}, _cc$Class._hideBackgroundLabels = function _hideBackgroundLabels() {
  // 隐藏背景上原有的标签节点
  var labelsToHide = ["竞技场", "普通场", "初级场", "中级场", "高级场", "选择房间", "房间选择"];
  for (var i = 0; i < labelsToHide.length; i++) {
    var nodes = this._findNodesByName(this.node, labelsToHide[i]);
    for (var j = 0; j < nodes.length; j++) {
      // 只隐藏非 AreaTitle 的节点
      if (nodes[j].name !== "AreaTitle") {
        nodes[j].active = false;
      }
    }
  }
}, _cc$Class._findNodesByName = function _findNodesByName(parentNode, name) {
  var result = [];
  if (!parentNode || !parentNode.children) return result;
  for (var i = 0; i < parentNode.children.length; i++) {
    var child = parentNode.children[i];
    if (child.name === name) {
      result.push(child);
    }
    // 递归查找子节点
    var subResults = this._findNodesByName(child, name);
    result = result.concat(subResults);
  }
  return result;
}, _cc$Class._adjustGoldElementsPosition = function _adjustGoldElementsPosition() {
  var playerNode = this.node.getChildByName("player_node");
  if (!playerNode) return;
  var yuanbaoIcon = playerNode.getChildByName("yuanbaoIcon");
  var goldFrame = playerNode.getChildByName("gold_frame");

  // 调整金豆图标位置
  if (yuanbaoIcon) {
    yuanbaoIcon.y = 80;
    yuanbaoIcon.x = -50; // 向左偏移
  }

  if (goldFrame) {
    goldFrame.y = 80;
  }

  // 调整金币文字位置 - 放在金豆图标后面
  if (this.gobal_count && this.gobal_count.node) {
    var labelNode = this.gobal_count.node;
    var widget = labelNode.getComponent(cc.Widget);
    if (widget) widget.enabled = false;

    // 文字放在金豆图标右侧
    labelNode.anchorX = 0; // 左锚点，从左侧开始
    labelNode.x = 20; // 金豆图标后面20px
    labelNode.y = 80; // 与金豆图标同一高度
  }
}, _cc$Class._hideNodesWithText = function _hideNodesWithText(parentNode, searchText) {
  if (!parentNode) return;
  var children = parentNode.children;
  if (!children) return;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var label = child.getComponent(cc.Label);
    if (label && label.string && label.string.indexOf(searchText) >= 0) {
      child.active = false;
    }
    this._hideNodesWithText(child, searchText);
  }
}, _cc$Class._createEnterRoomButton = function _createEnterRoomButton() {
  var self = this;

  // 移除旧的按钮
  var oldBtn = this.node.getChildByName("EnterRoomButton");
  if (oldBtn) oldBtn.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建按钮节点
  var btnNode = new cc.Node("EnterRoomButton");
  btnNode.setContentSize(cc.size(180, 60));
  btnNode.anchorX = 0.5;
  btnNode.anchorY = 0.5;

  // 放在左侧中间位置
  btnNode.x = -screenWidth / 2 + 120;
  btnNode.y = 0;
  btnNode.zIndex = 1000;
  btnNode.parent = this.node;

  // 加载按钮图片
  var sprite = btnNode.addComponent(cc.Sprite);
  sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
  cc.resources.load('UI/btn_enter_room', cc.SpriteFrame, function (err, spriteFrame) {
    if (err) {
      console.warn("加载 btn_enter_room 失败，使用备用样式");
      self._createEnterRoomButtonFallback(btnNode);
      return;
    }
    sprite.spriteFrame = spriteFrame;
  });

  // 添加按钮组件
  var button = btnNode.addComponent(cc.Button);
  button.transition = cc.Button.Transition.SCALE;
  button.duration = 0.1;
  button.zoomScale = 1.1;

  // 添加点击事件
  btnNode.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
    self._showEnterRoomPopup();
  }, this);
}, _cc$Class._createEnterRoomButtonFallback = function _createEnterRoomButtonFallback(btnNode) {
  var sprite = btnNode.getComponent(cc.Sprite);
  if (!sprite) {
    sprite = btnNode.addComponent(cc.Sprite);
  }
  sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

  // 绘制按钮背景 - 橙色渐变风格
  var graphics = btnNode.addComponent(cc.Graphics);
  graphics.fillColor = cc.color(255, 140, 0); // 橙色
  graphics.roundRect(-90, -30, 180, 60, 12);
  graphics.fill();
  graphics.strokeColor = cc.color(255, 200, 100); // 金色边框
  graphics.lineWidth = 3;
  graphics.roundRect(-90, -30, 180, 60, 12);
  graphics.stroke();

  // 添加图标和文字
  var iconNode = new cc.Node("Icon");
  var iconLabel = iconNode.addComponent(cc.Label);
  iconLabel.string = "🚪";
  iconLabel.fontSize = 22;
  iconNode.x = -45;
  iconNode.parent = btnNode;
  var labelNode = new cc.Node("Label");
  var label = labelNode.addComponent(cc.Label);
  label.string = "输入房号";
  label.fontSize = 22;
  label.lineHeight = 30;
  label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  labelNode.color = cc.color(255, 255, 255);
  labelNode.parent = btnNode;
}, _cc$Class._showEnterRoomPopup = function _showEnterRoomPopup() {
  var self = this;

  // 移除旧的弹窗
  var oldPopup = this.node.getChildByName("EnterRoomPopup");
  if (oldPopup) oldPopup.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var popup = new cc.Node("EnterRoomPopup");
  popup.setContentSize(cc.size(screenWidth, screenHeight));
  popup.anchorX = 0.5;
  popup.anchorY = 0.5;
  popup.x = 0;
  popup.y = 0;
  popup.zIndex = 2000;
  popup.parent = this.node;

  // 添加 BlockInputEvents 组件阻止底层点击
  popup.addComponent(cc.BlockInputEvents);

  // ===== 半透明背景遮罩 =====
  var bgMask = new cc.Node("BgMask");
  bgMask.setContentSize(cc.size(screenWidth, screenHeight));
  var bgGfx = bgMask.addComponent(cc.Graphics);
  bgGfx.fillColor = cc.color(0, 0, 0, 180);
  bgGfx.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  bgGfx.fill();
  bgMask.parent = popup;

  // 点击遮罩关闭
  bgMask.on(cc.Node.EventType.TOUCH_END, function () {
    popup.destroy();
  }, this);

  // ===== 弹窗面板 - 更大的尺寸 =====
  var panelWidth = 500;
  var panelHeight = 380;
  var panel = new cc.Node("Panel");
  panel.setContentSize(cc.size(panelWidth, panelHeight));
  panel.parent = popup;

  // 外层阴影
  var shadow = new cc.Node("Shadow");
  var shadowGfx = shadow.addComponent(cc.Graphics);
  shadowGfx.fillColor = cc.color(0, 0, 0, 60);
  shadowGfx.roundRect(-panelWidth / 2 + 8, -panelHeight / 2 - 8, panelWidth, panelHeight, 16);
  shadowGfx.fill();
  shadow.parent = panel;

  // 主背景 - 深色优雅风格
  var mainBg = new cc.Node("MainBg");
  mainBg.setContentSize(cc.size(panelWidth, panelHeight));
  var mainGfx = mainBg.addComponent(cc.Graphics);
  mainGfx.fillColor = cc.color(30, 28, 45, 255);
  mainGfx.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
  mainGfx.fill();
  mainGfx.strokeColor = cc.color(100, 85, 60);
  mainGfx.lineWidth = 3;
  mainGfx.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
  mainGfx.stroke();
  mainBg.parent = panel;

  // ===== 顶部装饰条 =====
  var topBar = new cc.Node("TopBar");
  topBar.setContentSize(cc.size(panelWidth, 8));
  topBar.y = panelHeight / 2 - 4;
  var topGfx = topBar.addComponent(cc.Graphics);
  topGfx.fillColor = cc.color(76, 175, 80); // 绿色主题色
  topGfx.roundRect(-panelWidth / 2, -4, panelWidth, 8, [16, 16, 0, 0]);
  topGfx.fill();
  topBar.parent = panel;

  // ===== 标题区域 =====
  var titleBg = new cc.Node("TitleBg");
  titleBg.setContentSize(cc.size(panelWidth - 40, 60));
  titleBg.y = panelHeight / 2 - 50;
  var titleBgGfx = titleBg.addComponent(cc.Graphics);
  titleBgGfx.fillColor = cc.color(45, 42, 65, 250);
  titleBgGfx.roundRect(-(panelWidth - 40) / 2, -30, panelWidth - 40, 60, 10);
  titleBgGfx.fill();
  titleBg.parent = panel;

  // 图标
  var iconNode = new cc.Node("Icon");
  var iconLabel = iconNode.addComponent(cc.Label);
  iconLabel.string = "🔑";
  iconLabel.fontSize = 32;
  iconNode.x = -100;
  iconNode.y = panelHeight / 2 - 50;
  iconNode.parent = panel;

  // 标题文字
  var titleNode = new cc.Node("Title");
  var titleLabel = titleNode.addComponent(cc.Label);
  titleLabel.string = "加入房间";
  titleLabel.fontSize = 28;
  titleLabel.lineHeight = 40;
  titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleNode.color = cc.color(255, 255, 255);
  titleNode.y = panelHeight / 2 - 50;
  titleNode.parent = panel;

  // 副标题说明
  var subtitleNode = new cc.Node("Subtitle");
  var subtitleLabel = subtitleNode.addComponent(cc.Label);
  subtitleLabel.string = "输入好友分享的房间号即可加入游戏";
  subtitleLabel.fontSize = 14;
  subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  subtitleNode.color = cc.color(180, 170, 150);
  subtitleNode.y = panelHeight / 2 - 95;
  subtitleNode.parent = panel;

  // ===== 房间号输入区域 =====
  var inputAreaY = 20;

  // 输入框标签
  var inputLabel = new cc.Node("InputLabel");
  var inputLabelComp = inputLabel.addComponent(cc.Label);
  inputLabelComp.string = "房间号";
  inputLabelComp.fontSize = 16;
  inputLabel.color = cc.color(200, 190, 160);
  inputLabel.x = -panelWidth / 2 + 70;
  inputLabel.y = inputAreaY + 45;
  inputLabel.parent = panel;

  // 输入框背景
  var inputBg = new cc.Node("InputBg");
  inputBg.setContentSize(cc.size(360, 55));
  inputBg.y = inputAreaY;
  var inputGfx = inputBg.addComponent(cc.Graphics);
  inputGfx.fillColor = cc.color(50, 45, 70, 255);
  inputGfx.roundRect(-180, -27.5, 360, 55, 10);
  inputGfx.fill();
  inputGfx.strokeColor = cc.color(76, 175, 80);
  inputGfx.lineWidth = 2;
  inputGfx.roundRect(-180, -27.5, 360, 55, 10);
  inputGfx.stroke();
  inputBg.parent = panel;

  // 输入框
  var inputNode = new cc.Node("RoomIdInput");
  inputNode.setContentSize(cc.size(340, 50));
  var editBox = inputNode.addComponent(cc.EditBox);
  editBox.placeholder = "请输入6位数字房间号";
  editBox.fontSize = 24;
  editBox.placeholderFontSize = 18;
  editBox.fontColor = cc.color(255, 255, 255);
  editBox.placeholderFontColor = cc.color(120, 115, 100);
  editBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
  editBox.inputMode = cc.EditBox.InputMode.NUMERIC;
  editBox.maxLength = 10;
  editBox.backgroundColor = cc.color(0, 0, 0, 0);
  inputNode.parent = inputBg;

  // ===== 提示信息 =====
  var tipBg = new cc.Node("TipBg");
  tipBg.setContentSize(cc.size(360, 35));
  tipBg.y = inputAreaY - 55;
  var tipGfx = tipBg.addComponent(cc.Graphics);
  tipGfx.fillColor = cc.color(40, 35, 55, 200);
  tipGfx.roundRect(-180, -17.5, 360, 35, 8);
  tipGfx.fill();
  tipBg.parent = panel;
  var tipIcon = new cc.Node("TipIcon");
  var tipIconLabel = tipIcon.addComponent(cc.Label);
  tipIconLabel.string = "💡";
  tipIconLabel.fontSize = 16;
  tipIcon.x = -150;
  tipIcon.y = inputAreaY - 55;
  tipIcon.parent = panel;
  var tipNode = new cc.Node("Tip");
  var tipLabel = tipNode.addComponent(cc.Label);
  tipLabel.string = "房间号由好友创建房间后获取，为6位数字";
  tipLabel.fontSize = 13;
  tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  tipNode.color = cc.color(150, 145, 130);
  tipNode.y = inputAreaY - 55;
  tipNode.parent = panel;

  // ===== 按钮区域 =====
  var btnY = -panelHeight / 2 + 55;

  // 取消按钮
  var cancelBtn = new cc.Node("CancelBtn");
  cancelBtn.setContentSize(cc.size(140, 48));
  cancelBtn.x = -90;
  cancelBtn.y = btnY;
  var cancelGfx = cancelBtn.addComponent(cc.Graphics);
  cancelGfx.fillColor = cc.color(70, 65, 85);
  cancelGfx.roundRect(-70, -24, 140, 48, 10);
  cancelGfx.fill();
  cancelGfx.strokeColor = cc.color(100, 95, 115);
  cancelGfx.lineWidth = 2;
  cancelGfx.roundRect(-70, -24, 140, 48, 10);
  cancelGfx.stroke();
  cancelBtn.parent = panel;
  var cancelLabel = new cc.Node("Label");
  var cancelLabelComp = cancelLabel.addComponent(cc.Label);
  cancelLabelComp.string = "取消";
  cancelLabelComp.fontSize = 20;
  cancelLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  cancelLabel.color = cc.color(200, 195, 180);
  cancelLabel.parent = cancelBtn;
  var cancelBtnComp = cancelBtn.addComponent(cc.Button);
  cancelBtnComp.transition = cc.Button.Transition.SCALE;
  cancelBtnComp.zoomScale = 0.95;
  cancelBtn.on(cc.Node.EventType.TOUCH_END, function () {
    popup.destroy();
  }, this);

  // 确认加入按钮 - 绿色主题
  var confirmBtn = new cc.Node("ConfirmBtn");
  confirmBtn.setContentSize(cc.size(160, 48));
  confirmBtn.x = 100;
  confirmBtn.y = btnY;
  var confirmGfx = confirmBtn.addComponent(cc.Graphics);
  confirmGfx.fillColor = cc.color(76, 175, 80); // 绿色
  confirmGfx.roundRect(-80, -24, 160, 48, 10);
  confirmGfx.fill();
  confirmGfx.strokeColor = cc.color(100, 200, 105);
  confirmGfx.lineWidth = 2;
  confirmGfx.roundRect(-80, -24, 160, 48, 10);
  confirmGfx.stroke();
  confirmBtn.parent = panel;
  var confirmIcon = new cc.Node("Icon");
  var confirmIconLabel = confirmIcon.addComponent(cc.Label);
  confirmIconLabel.string = "✓";
  confirmIconLabel.fontSize = 20;
  confirmIcon.x = -50;
  confirmIcon.color = cc.color(255, 255, 255);
  confirmIcon.parent = confirmBtn;
  var confirmLabel = new cc.Node("Label");
  var confirmLabelComp = confirmLabel.addComponent(cc.Label);
  confirmLabelComp.string = "加入房间";
  confirmLabelComp.fontSize = 20;
  confirmLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  confirmLabel.color = cc.color(255, 255, 255);
  confirmLabel.parent = confirmBtn;
  var confirmBtnComp = confirmBtn.addComponent(cc.Button);
  confirmBtnComp.transition = cc.Button.Transition.SCALE;
  confirmBtnComp.zoomScale = 0.95;

  // 确认按钮点击事件
  confirmBtn.on(cc.Node.EventType.TOUCH_END, function () {
    var roomId = editBox.string;
    if (!roomId || roomId.length === 0) {
      self._showMessage("请输入房间号");
      return;
    }

    // 发送加入房间请求
    self._joinRoomById(roomId, popup);
  }, this);

  // ===== 关闭按钮（右上角） =====
  var closeBtn = new cc.Node("CloseBtn");
  closeBtn.setContentSize(cc.size(40, 40));
  closeBtn.x = panelWidth / 2 - 25;
  closeBtn.y = panelHeight / 2 - 25;
  var closeGfx = closeBtn.addComponent(cc.Graphics);
  closeGfx.fillColor = cc.color(60, 55, 75);
  closeGfx.circle(0, 0, 20);
  closeGfx.fill();
  closeBtn.parent = panel;
  var closeX = new cc.Node("X");
  var closeLabel = closeX.addComponent(cc.Label);
  closeLabel.string = "×";
  closeLabel.fontSize = 28;
  closeLabel.lineHeight = 36;
  closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  closeX.color = cc.color(180, 170, 160);
  closeX.parent = closeBtn;
  closeBtn.on(cc.Node.EventType.TOUCH_END, function () {
    popup.destroy();
  }, this);
}, _cc$Class._joinRoomById = function _joinRoomById(roomId, popup) {
  var self = this;
  var myglobal = window.myglobal;
  if (!myglobal || !myglobal.socket) {
    this._showMessage("网络未连接，请稍后重试");
    return;
  }
  this._showMessage("正在加入房间...");

  // 发送加入房间请求
  myglobal.socket.request_joinRoom({
    roomId: roomId
  }, function (err, result) {
    if (err !== 0) {
      self._showMessage("加入房间失败: " + (result || "房间不存在"));
      return;
    }
    self._showMessage("加入成功！");

    // 关闭弹窗
    if (popup) popup.destroy();

    // 跳转到游戏场景
    if (result && result.roomId) {
      myglobal.currentRoomId = result.roomId;
    }

    // 延迟跳转
    self.scheduleOnce(function () {
      cc.director.loadScene("gameScene");
    }, 0.5);
  });
}, _cc$Class._updateCurrencyDisplay = function _updateCurrencyDisplay() {
  var myglobal = window.myglobal;
  var playerData = myglobal ? myglobal.playerData : null;
  if (!playerData) return;
  var roomCategory = this._currentRoomCategory || 1;
  if (roomCategory === 2) {
    // 竞技场 - 显示竞技币
    if (this.gobal_count) {
      this.gobal_count.string = ":" + this._formatGold(playerData.arena_coin || 0);
    }
    // 隐藏欢乐豆图标，显示竞技币图标（如果有）
    this._updateCurrencyIcon(2);
  } else {
    // 普通场 - 显示欢乐豆
    if (this.gobal_count) {
      this.gobal_count.string = ":" + this._formatGold(playerData.gobal_count || 0);
    }
    this._updateCurrencyIcon(1);
  }
}, _cc$Class._updateCurrencyIcon = function _updateCurrencyIcon(roomCategory) {
  // 查找或创建货币图标节点
  var playerNode = this.node.getChildByName("player_node");
  if (!playerNode) return;

  // 尝试找到货币图标
  var currencyIcon = playerNode.getChildByName("currency_icon");
  if (!currencyIcon) {
    // 如果没有现有图标，创建一个
    currencyIcon = new cc.Node("currency_icon");
    currencyIcon.setPosition(-100, 80);
    currencyIcon.zIndex = 10;
    currencyIcon.parent = playerNode;
  }

  // 根据类型显示不同图标（这里用文字代替，实际项目可以换图片）
  var label = currencyIcon.getComponent(cc.Label);
  if (!label) {
    label = currencyIcon.addComponent(cc.Label);
  }
  label.string = roomCategory === 2 ? "币" : "豆";
  label.fontSize = 24;
  currencyIcon.color = cc.color(255, 215, 0);
  var outline = currencyIcon.getComponent(cc.LabelOutline);
  if (!outline) {
    outline = currencyIcon.addComponent(cc.LabelOutline);
  }
  outline.color = cc.color(0, 0, 0);
  outline.width = 2;
}, _cc$Class._initArenaCoinDisplay = function _initArenaCoinDisplay() {
  var myglobal = window.myglobal;
  var playerData = myglobal ? myglobal.playerData : null;

  // 如果有竞技币Label，初始化显示
  if (this.arena_coin_label && playerData) {
    this.arena_coin_label.string = "竞技币: " + this._formatGold(playerData.arena_coin || 0);
    this.arena_coin_label.node.active = false; // 默认隐藏
  }
}, _cc$Class._refreshPlayerBalance = function _refreshPlayerBalance() {
  var self = this;
  if (window.arenaData && window.arenaData.refreshBalance) {
    window.arenaData.refreshBalance(function (err, data) {
      if (err) {
        console.warn("获取玩家余额失败:", err);
        return;
      }

      // 更新UI显示
      self._updateCurrencyDisplay();
      if (self.arena_coin_label && data.arena_coin !== undefined) {
        self.arena_coin_label.string = "竞技币: " + self._formatGold(data.arena_coin);
      }
    });
  }
}, _cc$Class._showSignupDialog = function _showSignupDialog(roomConfig) {
  var self = this;
  var myglobal = window.myglobal;
  var playerData = myglobal ? myglobal.playerData : null;
  var playerArenaCoin = playerData ? playerData.arena_coin || 0 : 0;

  // 获取报名费
  var signupFee = roomConfig.signup_fee || roomConfig.signupFee || 0;

  // 移除旧弹窗
  var oldDialog = this.node.getChildByName("SignupDialog");
  if (oldDialog) oldDialog.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var dialog = new cc.Node("SignupDialog");
  dialog.setContentSize(cc.size(screenWidth, screenHeight));
  dialog.setPosition(0, 0);
  dialog.zIndex = 3000;
  dialog.parent = this.node;

  // 半透明遮罩
  var mask = new cc.Node("Mask");
  var maskG = mask.addComponent(cc.Graphics);
  maskG.fillColor = cc.color(0, 0, 0, 180);
  maskG.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskG.fill();
  mask.parent = dialog;
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
  });

  // 弹窗主体
  var dialogWidth = 420;
  var dialogHeight = 380;
  var dialogBg = new cc.Node("DialogBg");
  dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
  var dbg = dialogBg.addComponent(cc.Graphics);
  dbg.fillColor = cc.color(35, 30, 50, 250);
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.fill();
  dbg.strokeColor = cc.color(180, 140, 60, 200);
  dbg.lineWidth = 3;
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.stroke();
  dialogBg.parent = dialog;

  // 标题
  var titleText = new cc.Node("Title");
  titleText.setPosition(0, dialogHeight / 2 - 40);
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var ttl = titleText.addComponent(cc.Label);
  ttl.string = "竞技场报名";
  ttl.fontSize = 26;
  ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(255, 220, 100);
  var titleOutline = titleText.addComponent(cc.LabelOutline);
  titleOutline.color = cc.color(80, 50, 0);
  titleOutline.width = 2;
  titleText.parent = dialog;

  // 房间名称
  var roomNameText = new cc.Node("RoomName");
  roomNameText.setPosition(0, dialogHeight / 2 - 80);
  roomNameText.anchorX = 0.5;
  roomNameText.anchorY = 0.5;
  var rnl = roomNameText.addComponent(cc.Label);
  rnl.string = roomConfig.room_name || "竞技场";
  rnl.fontSize = 20;
  rnl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  roomNameText.color = cc.color(200, 180, 140);
  roomNameText.parent = dialog;

  // 报名费信息
  var feeLabel = new cc.Node("FeeLabel");
  feeLabel.setPosition(-dialogWidth / 2 + 30, dialogHeight / 2 - 130);
  feeLabel.anchorX = 0;
  feeLabel.anchorY = 0.5;
  var fl = feeLabel.addComponent(cc.Label);
  fl.string = "报名费：";
  fl.fontSize = 18;
  feeLabel.color = cc.color(220, 210, 190);
  feeLabel.parent = dialog;
  var feeValue = new cc.Node("FeeValue");
  feeValue.setPosition(60, dialogHeight / 2 - 130);
  feeValue.anchorX = 0;
  feeValue.anchorY = 0.5;
  var fv = feeValue.addComponent(cc.Label);
  fv.string = this._formatGold(signupFee) + " 竞技币";
  fv.fontSize = 20;
  feeValue.color = cc.color(255, 215, 0);
  feeValue.parent = dialog;

  // 当前余额
  var balanceLabel = new cc.Node("BalanceLabel");
  balanceLabel.setPosition(-dialogWidth / 2 + 30, dialogHeight / 2 - 170);
  balanceLabel.anchorX = 0;
  balanceLabel.anchorY = 0.5;
  var bl = balanceLabel.addComponent(cc.Label);
  bl.string = "当前余额：";
  bl.fontSize = 18;
  balanceLabel.color = cc.color(220, 210, 190);
  balanceLabel.parent = dialog;
  var balanceValue = new cc.Node("BalanceValue");
  balanceValue.setPosition(60, dialogHeight / 2 - 170);
  balanceValue.anchorX = 0;
  balanceValue.anchorY = 0.5;
  var bv = balanceValue.addComponent(cc.Label);
  bv.string = this._formatGold(playerArenaCoin) + " 竞技币";
  bv.fontSize = 20;
  balanceValue.color = playerArenaCoin >= signupFee ? cc.color(100, 220, 100) : cc.color(255, 100, 100);
  balanceValue.parent = dialog;

  // 冠军奖励预览
  var rewardLabel = new cc.Node("RewardLabel");
  rewardLabel.setPosition(-dialogWidth / 2 + 30, dialogHeight / 2 - 210);
  rewardLabel.anchorX = 0;
  rewardLabel.anchorY = 0.5;
  var rl = rewardLabel.addComponent(cc.Label);
  rl.string = "冠军奖励：";
  rl.fontSize = 18;
  rewardLabel.color = cc.color(220, 210, 190);
  rewardLabel.parent = dialog;
  var championReward = roomConfig.champion_reward || roomConfig.championReward || {
    coins: 0
  };
  var rewardValue = new cc.Node("RewardValue");
  rewardValue.setPosition(60, dialogHeight / 2 - 210);
  rewardValue.anchorX = 0;
  rewardValue.anchorY = 0.5;
  var rv = rewardValue.addComponent(cc.Label);
  rv.string = this._formatGold(championReward.coins || 0) + " 竞技币";
  rv.fontSize = 20;
  rewardValue.color = cc.color(255, 180, 50);
  rewardValue.parent = dialog;

  // 按钮区域
  var btnY = -dialogHeight / 2 + 55;

  // 判断余额是否足够
  var isEnough = playerArenaCoin >= signupFee;

  // 取消按钮
  var cancelBtn = this._createDialogButton("取消", cc.color(80, 75, 95), -90, btnY, 130, 48, function () {
    dialog.destroy();
  });
  cancelBtn.parent = dialog;
  if (isEnough) {
    // 报名按钮
    var signupBtn = this._createDialogButton("确认报名", cc.color(76, 175, 80),
    // 绿色
    90, btnY, 150, 48, function () {
      // 调用报名接口
      self._doSignup(roomConfig, dialog);
    });
    signupBtn.parent = dialog;
  } else {
    // 余额不足 - 显示观看广告按钮
    var adBtn = this._createDialogButton("观看广告获取", cc.color(255, 152, 0),
    // 橙色
    90, btnY, 150, 48, function () {
      dialog.destroy();
      self._showAdRewardDialog('arena_coin', signupFee - playerArenaCoin);
    });
    adBtn.parent = dialog;

    // 提示余额不足
    var tipNode = new cc.Node("Tip");
    tipNode.setPosition(0, btnY + 45);
    tipNode.anchorX = 0.5;
    tipNode.anchorY = 0.5;
    var tipLabel = tipNode.addComponent(cc.Label);
    tipLabel.string = "竞技币不足，观看广告获取更多";
    tipLabel.fontSize = 14;
    tipLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    tipNode.color = cc.color(255, 150, 100);
    tipNode.parent = dialog;
  }

  // 关闭按钮
  var closeBtn = new cc.Node("CloseBtn");
  closeBtn.setContentSize(cc.size(30, 30));
  closeBtn.x = dialogWidth / 2 - 25;
  closeBtn.y = dialogHeight / 2 - 30;
  var cbg = closeBtn.addComponent(cc.Graphics);
  cbg.fillColor = cc.color(0, 0, 0, 80);
  cbg.circle(0, 0, 15);
  cbg.fill();
  closeBtn.parent = dialog;
  var closeX = new cc.Node("X");
  closeX.anchorX = 0.5;
  closeX.anchorY = 0.5;
  var closeLabel = closeX.addComponent(cc.Label);
  closeLabel.string = "×";
  closeLabel.fontSize = 24;
  closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  closeX.color = cc.color(255, 255, 255);
  closeX.parent = closeBtn;
  closeBtn.on(cc.Node.EventType.TOUCH_END, function () {
    dialog.destroy();
  });
}, _cc$Class._doSignup = function _doSignup(roomConfig, dialog) {
  var self = this;
  if (!window.arenaData) {
    this._showMessage("竞技场数据未初始化");
    return;
  }
  this._showMessageCenter("正在报名...");
  window.arenaData.signup(roomConfig.id, function (err, result) {
    if (err) {
      self._showMessageCenter("报名失败: " + err);
      return;
    }
    self._showMessageCenter("报名成功！");

    // 关闭弹窗
    if (dialog) dialog.destroy();

    // 更新货币显示
    if (window.arenaData.refreshBalance) {
      window.arenaData.refreshBalance();
    }
    self._updateCurrencyDisplay();

    // 显示已报名状态弹窗
    self.scheduleOnce(function () {
      self._showSignedUpDialog(roomConfig);
    }, 0.5);
  });
}, _cc$Class._showSignedUpDialog = function _showSignedUpDialog(roomConfig) {
  var self = this;

  // 移除旧弹窗
  var oldDialog = this.node.getChildByName("SignedUpDialog");
  if (oldDialog) oldDialog.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var dialog = new cc.Node("SignedUpDialog");
  dialog.setContentSize(cc.size(screenWidth, screenHeight));
  dialog.setPosition(0, 0);
  dialog.zIndex = 3000;
  dialog.parent = this.node;

  // 半透明遮罩
  var mask = new cc.Node("Mask");
  var maskG = mask.addComponent(cc.Graphics);
  maskG.fillColor = cc.color(0, 0, 0, 180);
  maskG.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskG.fill();
  mask.parent = dialog;
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
  });

  // 弹窗主体
  var dialogWidth = 380;
  var dialogHeight = 320;
  var dialogBg = new cc.Node("DialogBg");
  dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
  var dbg = dialogBg.addComponent(cc.Graphics);
  dbg.fillColor = cc.color(35, 30, 50, 250);
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.fill();
  dbg.strokeColor = cc.color(76, 175, 80, 200);
  dbg.lineWidth = 3;
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.stroke();
  dialogBg.parent = dialog;

  // 标题
  var titleText = new cc.Node("Title");
  titleText.setPosition(0, dialogHeight / 2 - 40);
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var ttl = titleText.addComponent(cc.Label);
  ttl.string = "已报名";
  ttl.fontSize = 26;
  ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(100, 220, 100);
  titleText.parent = dialog;

  // 房间名称
  var roomNameText = new cc.Node("RoomName");
  roomNameText.setPosition(0, dialogHeight / 2 - 80);
  roomNameText.anchorX = 0.5;
  roomNameText.anchorY = 0.5;
  var rnl = roomNameText.addComponent(cc.Label);
  rnl.string = roomConfig.room_name || "竞技场";
  rnl.fontSize = 20;
  rnl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  roomNameText.color = cc.color(200, 180, 140);
  roomNameText.parent = dialog;

  // 倒计时显示
  var countdownLabel = new cc.Node("CountdownLabel");
  countdownLabel.setPosition(0, dialogHeight / 2 - 130);
  countdownLabel.anchorX = 0.5;
  countdownLabel.anchorY = 0.5;
  var cl = countdownLabel.addComponent(cc.Label);
  cl.string = "开赛倒计时：计算中...";
  cl.fontSize = 18;
  cl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  countdownLabel.color = cc.color(255, 220, 100);
  countdownLabel.parent = dialog;

  // 更新倒计时
  var updateCountdown = function updateCountdown() {
    if (!dialog || !dialog.isValid) return;
    var countdown = window.arenaData ? window.arenaData.getCountdown(roomConfig.id) : -1;
    if (countdown >= 0) {
      cl.string = "开赛倒计时：" + (window.arenaData.formatCountdown ? window.arenaData.formatCountdown(countdown) : countdown + "秒");
    } else {
      cl.string = "等待开赛...";
    }
    if (countdown === 0) {
      // 倒计时结束，自动进入比赛
      self._showMessageCenter("比赛即将开始！");
      dialog.destroy();
      // 这里可以调用进入比赛的方法
    } else {
      self.scheduleOnce(updateCountdown, 1);
    }
  };
  updateCountdown();

  // 按钮区域
  var btnY = -dialogHeight / 2 + 55;

  // 取消报名按钮
  var cancelSignupBtn = this._createDialogButton("取消报名", cc.color(200, 100, 80),
  // 红色
  -80, btnY, 130, 48, function () {
    self._cancelSignup(roomConfig, dialog);
  });
  cancelSignupBtn.parent = dialog;

  // 关闭按钮
  var closeBtn = this._createDialogButton("关闭", cc.color(80, 75, 95), 80, btnY, 100, 48, function () {
    dialog.destroy();
  });
  closeBtn.parent = dialog;
}, _cc$Class._cancelSignup = function _cancelSignup(roomConfig, dialog) {
  var self = this;
  if (!window.arenaData) {
    this._showMessage("竞技场数据未初始化");
    return;
  }
  window.arenaData.cancelSignup(roomConfig.id, function (err, result) {
    if (err) {
      self._showMessageCenter("取消报名失败: " + err);
      return;
    }
    self._showMessageCenter("已取消报名");

    // 关闭弹窗
    if (dialog) dialog.destroy();

    // 更新货币显示
    self._updateCurrencyDisplay();
  });
}, _cc$Class._showAdRewardDialog = function _showAdRewardDialog(type, neededAmount) {
  var self = this;

  // 移除旧弹窗
  var oldDialog = this.node.getChildByName("AdRewardDialog");
  if (oldDialog) oldDialog.destroy();

  // 获取画布尺寸
  var canvas = this.node.getComponent(cc.Canvas) || cc.find('Canvas').getComponent(cc.Canvas);
  var screenHeight = canvas ? canvas.designResolution.height : 720;
  var screenWidth = canvas ? canvas.designResolution.width : 1280;

  // 创建弹窗容器
  var dialog = new cc.Node("AdRewardDialog");
  dialog.setContentSize(cc.size(screenWidth, screenHeight));
  dialog.setPosition(0, 0);
  dialog.zIndex = 3000;
  dialog.parent = this.node;

  // 半透明遮罩
  var mask = new cc.Node("Mask");
  var maskG = mask.addComponent(cc.Graphics);
  maskG.fillColor = cc.color(0, 0, 0, 180);
  maskG.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
  maskG.fill();
  mask.parent = dialog;
  mask.on(cc.Node.EventType.TOUCH_END, function (event) {
    event.stopPropagation();
  });

  // 弹窗主体
  var dialogWidth = 380;
  var dialogHeight = 300;
  var dialogBg = new cc.Node("DialogBg");
  dialogBg.setContentSize(cc.size(dialogWidth, dialogHeight));
  var dbg = dialogBg.addComponent(cc.Graphics);
  dbg.fillColor = cc.color(35, 30, 50, 250);
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.fill();
  dbg.strokeColor = cc.color(255, 152, 0, 200);
  dbg.lineWidth = 3;
  dbg.roundRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
  dbg.stroke();
  dialogBg.parent = dialog;

  // 标题
  var titleText = new cc.Node("Title");
  titleText.setPosition(0, dialogHeight / 2 - 40);
  titleText.anchorX = 0.5;
  titleText.anchorY = 0.5;
  var ttl = titleText.addComponent(cc.Label);
  ttl.string = type === 'arena_coin' ? "竞技币不足" : "欢乐豆不足";
  ttl.fontSize = 26;
  ttl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  titleText.color = cc.color(255, 150, 100);
  titleText.parent = dialog;

  // 说明文字
  var descText = new cc.Node("Desc");
  descText.setPosition(0, dialogHeight / 2 - 90);
  descText.anchorX = 0.5;
  descText.anchorY = 0.5;
  var dl = descText.addComponent(cc.Label);
  dl.string = "观看激励视频领取" + this._formatGold(neededAmount) + (type === 'arena_coin' ? "竞技币" : "欢乐豆") + "继续游戏";
  dl.fontSize = 16;
  dl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  descText.color = cc.color(200, 190, 170);
  descText.parent = dialog;

  // 广告图标/提示
  var adIcon = new cc.Node("AdIcon");
  adIcon.setPosition(0, 0);
  adIcon.anchorX = 0.5;
  adIcon.anchorY = 0.5;
  var ail = adIcon.addComponent(cc.Label);
  ail.string = "🎬";
  ail.fontSize = 48;
  adIcon.parent = dialog;

  // 按钮区域
  var btnY = -dialogHeight / 2 + 55;

  // 取消按钮
  var cancelBtn = this._createDialogButton("取消", cc.color(80, 75, 95), -80, btnY, 120, 48, function () {
    dialog.destroy();
  });
  cancelBtn.parent = dialog;

  // 观看领取按钮
  var watchBtn = this._createDialogButton("观看领取", cc.color(255, 152, 0),
  // 橙色
  80, btnY, 140, 48, function () {
    self._watchAdAndGetReward(type, dialog);
  });
  watchBtn.parent = dialog;
}, _cc$Class._watchAdAndGetReward = function _watchAdAndGetReward(type, dialog) {
  var self = this;

  // 这里应该调用广告SDK显示激励视频
  // 目前模拟观看完成
  this._showMessageCenter("正在加载广告...");

  // 模拟广告观看完成
  this.scheduleOnce(function () {
    if (!window.arenaData) {
      self._showMessageCenter("数据未初始化");
      return;
    }
    window.arenaData.watchAdForReward(type, function (err, result) {
      if (err) {
        self._showMessageCenter("获取奖励失败: " + err);
        return;
      }
      self._showMessageCenter("获得奖励！");

      // 关闭弹窗
      if (dialog) dialog.destroy();

      // 更新货币显示
      self._updateCurrencyDisplay();
    });
  }, 1.5);
}, _cc$Class.onDestroy = function onDestroy() {
  // 清理倒计时定时器
  if (this._countdownTimer) {
    clearInterval(this._countdownTimer);
    this._countdownTimer = null;
  }

  // 清理竞技场倒计时
  if (window.arenaData && window.arenaData.clearAllCountdowns) {
    window.arenaData.clearAllCountdowns();
  }

  // 停止在线状态监测（大厅场景需要持续监测，所以只有场景销毁时才停止）
  // 注意：通常大厅场景不会销毁，除非切换到游戏场景
  // 如果需要保持监测，可以注释掉下面这行
  // this._stopOnlineMonitoring();
}, _cc$Class.start = function start() {}, _cc$Class));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcaGFsbHNjZW5lXFxoYWxsU2NlbmUuanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIl9jYyRDbGFzcyIsIkNvbXBvbmVudCIsIm5hbWUiLCJwcm9wZXJ0aWVzIiwibmlja25hbWVfbGFiZWwiLCJMYWJlbCIsImhlYWRpbWFnZSIsIlNwcml0ZSIsImdvYmFsX2NvdW50IiwiYXJlbmFfY29pbl9sYWJlbCIsImNyZWF0cm9vbV9wcmVmYWJzIiwiUHJlZmFiIiwiam9pbnJvb21fcHJlZmFicyIsInVzZXJfYWdyZWVtZW50X3ByZWZhYnMiLCJvbkxvYWQiLCJ3aW5kb3ciLCJteWdsb2JhbCIsImNvbnNvbGUiLCJ3YXJuIiwiX3dhaXRGb3JNeWdsb2JhbCIsIl9pbml0V2l0aFBsYXllckRhdGEiLCJ1cGRhdGUiLCJkdCIsIl9sb2FkaW5nSW1hZ2VBbmltYXRpbmciLCJfbG9hZGluZ0ltYWdlTm9kZSIsImlzVmFsaWQiLCJhbmdsZSIsIl9xdWlja0VudGVyQW5pbWF0aW5nIiwiX3F1aWNrRW50ZXJMb2FkaW5nTm9kZSIsInNlbGYiLCJhdHRlbXB0cyIsIm1heEF0dGVtcHRzIiwiY2hlY2siLCJwbGF5ZXJEYXRhIiwic2V0VGltZW91dCIsImVycm9yIiwiZGlyZWN0b3IiLCJsb2FkU2NlbmUiLCJ0b2tlbiIsInZlcmlmeVRva2VuIiwiX2luaXRVSUFmdGVyQXV0aCIsInZhbGlkIiwibWVzc2FnZSIsImUiLCJuaWNrTmFtZSIsImF2YXRhclVybCIsIm5pY2tuYW1lTGFiZWwiLCJzdHJpbmciLCJ1bmRlZmluZWQiLCJuaWNrbmFtZU5vZGUiLCJfZmluZE5vZGVCeU5hbWUiLCJub2RlIiwiZ2V0Q29tcG9uZW50IiwiX2N1cnJlbnRSb29tQ2F0ZWdvcnkiLCJfdXBkYXRlQ3VycmVuY3lEaXNwbGF5IiwiX2FkanVzdEdvbGRFbGVtZW50c1Bvc2l0aW9uIiwiX2xvYWRVc2VyQXZhdGFyIiwicm9vbUNvbmZpZ3MiLCJfaW5pdEFyZW5hQ29pbkRpc3BsYXkiLCJfcmVmcmVzaFBsYXllckJhbGFuY2UiLCJfcGxheUhhbGxCYWNrZ3JvdW5kTXVzaWMiLCJfYWRqdXN0Qm90dG9tQnV0dG9ucyIsIl9oaWRlQmFja2dyb3VuZENoYXJhY3RlcnMiLCJfaW5pdFdlYlNvY2tldCIsIl9zdGFydE9ubGluZU1vbml0b3JpbmciLCJfZmV0Y2hSb29tQ29uZmlncyIsIl9yZW1vdmVOb3RpY2VCb2FyZCIsIl9wcmVsb2FkR2FtZVNjZW5lIiwic3RhcnRPbmxpbmVNb25pdG9yaW5nIiwiX29ubGluZVN0YXR1c0hhbmRsZXIiLCJpc09ubGluZSIsIl9pc0luaXRpYWxpemluZyIsIl9zaG93T2ZmbGluZU1lc3NhZ2UiLCJhZGRPbmxpbmVTdGF0dXNMaXN0ZW5lciIsImV2ZW50bGlzdGVyIiwib24iLCJkYXRhIiwiX2hhbmRsZUZvcmNlTG9nb3V0IiwiX3Nob3dNZXNzYWdlIiwicmVhc29uIiwic3RvcE9ubGluZU1vbml0b3JpbmciLCJzY2hlZHVsZU9uY2UiLCJfc3RvcE9ubGluZU1vbml0b3JpbmciLCJyZW1vdmVPbmxpbmVTdGF0dXNMaXN0ZW5lciIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJwcmVsb2FkU2NlbmUiLCJlcnIiLCJlbGFwc2VkIiwiX2dhbWVTY2VuZVByZWxvYWRlZCIsInNvY2tldCIsImlzV2ViU29ja2V0T3BlbiIsImlzQ29ubmVjdGVkIiwiaW5pdFNvY2tldCIsInBhcmVudE5vZGUiLCJub2RlTmFtZSIsImZvdW5kIiwiZ2V0Q2hpbGRCeU5hbWUiLCJjaGlsZHJlbiIsImkiLCJsZW5ndGgiLCJjaGlsZCIsInhpb25nbWFvMSIsInhpb25nbWFvMiIsImFjdGl2ZSIsImNhbnZhcyIsIkNhbnZhcyIsImZpbmQiLCJzY3JlZW5IZWlnaHQiLCJkZXNpZ25SZXNvbHV0aW9uIiwiaGVpZ2h0Iiwic2NyZWVuV2lkdGgiLCJ3aWR0aCIsImJ1dHRvbk5hbWVzIiwiYnV0dG9ucyIsImJ0biIsInB1c2giLCJhbGxDaGlsZHJlbiIsInRvTG93ZXJDYXNlIiwiaW5kZXhPZiIsInkiLCJidG5XaWR0aCIsImJ0bkhlaWdodCIsImJ0bkdhcCIsInJpZ2h0TWFyZ2luIiwiYm90dG9tTWFyZ2luIiwid2lkZ2V0IiwiV2lkZ2V0IiwiZW5hYmxlZCIsInNjYWxlIiwiYW5jaG9yWCIsImFuY2hvclkiLCJ4UG9zIiwieVBvcyIsIngiLCJfbG9hZERlZmF1bHRBdmF0YXIiLCJhc3NldE1hbmFnZXIiLCJsb2FkUmVtb3RlIiwiZXh0IiwidGV4dHVyZSIsInNwcml0ZUZyYW1lIiwiU3ByaXRlRnJhbWUiLCJyZXNvdXJjZXMiLCJsb2FkIiwiaXNvcGVuX3NvdW5kIiwiYXVkaW9FbmdpbmUiLCJzdG9wTXVzaWMiLCJzdG9wQWxsRWZmZWN0cyIsIkF1ZGlvQ2xpcCIsImNsaXAiLCJwbGF5TXVzaWMiLCJhcGlVcmwiLCJkZWZpbmVzIiwiY3J5cHRvS2V5IiwiSHR0cEFQSSIsIl9pbml0Um9vbUJ1dHRvbnMiLCJfZ2V0RGVmYXVsdFJvb21Db25maWdzIiwiX3Jvb21Db25maWdDYWNoZSIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJnZXQiLCJyZXN1bHQiLCJjb25maWdzIiwiY29kZSIsIkFycmF5IiwiaXNBcnJheSIsImMiLCJpZCIsInJvb21fbmFtZSIsInJvb21fdHlwZSIsImJhc2Vfc2NvcmUiLCJtdWx0aXBsaWVyIiwibWluX2dvbGQiLCJtYXhfZ29sZCIsImRlc2NyaXB0aW9uIiwic3RhdHVzIiwic29ydF9vcmRlciIsInJvb21fY2F0ZWdvcnkiLCJfaGlkZVVud2FudGVkQnV0dG9ucyIsImNyZWF0ZVJvb21CdG4iLCJqb2luUm9vbUJ0biIsInJvb21zIiwiYnV0dG9uTmFtZU1hcCIsImtleSIsImJ0bk5vZGUiLCJhbGxSb29tcyIsImNvbmZpZyIsInNvcnRPcmRlciIsInNvcnQiLCJyb29tVHlwZSIsImJ1dHRvbk5hbWUiLCJyb29tRGF0YSIsInJvb21OYW1lIiwibWluR29sZCIsIm1heEdvbGQiLCJyb29tQ2F0ZWdvcnkiLCJhIiwiYiIsInJvb20iLCJyb29tQ29uZmlnIiwiX2xvYWRSb29tQnV0dG9uQmciLCJfdXBkYXRlTWluR29sZExhYmVsIiwiYnV0dG9uIiwiQnV0dG9uIiwidHJhbnNpdGlvbiIsIlRyYW5zaXRpb24iLCJTQ0FMRSIsImR1cmF0aW9uIiwiem9vbVNjYWxlIiwiX2FyZW5hUm9vbXMiLCJvZmYiLCJOb2RlIiwiRXZlbnRUeXBlIiwiVE9VQ0hfRU5EIiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJfb25Sb29tQnV0dG9uQ2xpY2siLCJfcmVuZGVyUm9vbUxheW91dCIsIl9hZGRBcmVuYVNpZ251cEJ1dHRvbnMiLCJfZmV0Y2hTaWdudXBTdGF0dXNBbmRVcGRhdGVVSSIsImFyZW5hRGF0YSIsImZldGNoU2lnbnVwU3RhdHVzRnJvbVNlcnZlciIsInNpZ25lZFVwUm9vbXMiLCJfdXBkYXRlQXJlbmFTaWdudXBTdGF0dXMiLCJvbGRQYW5lbCIsIm9sZExlZnRQYW5lbCIsIm9sZFJpZ2h0UGFuZWwiLCJkZXN0cm95IiwiY2FyZFdpZHRoIiwiY2FyZEhlaWdodCIsImdhcFgiLCJ0b3RhbENhcmRzV2lkdGgiLCJwYW5lbFdpZHRoIiwiTWF0aCIsIm1heCIsInBhbmVsSGVpZ2h0IiwidmVydGljYWxPZmZzZXQiLCJjYXJkUGFuZWwiLCJzZXRDb250ZW50U2l6ZSIsInBhcmVudCIsInN0YXJ0WCIsIl9hZGRBcmVhVGl0bGUiLCJwYW5lbCIsInRpdGxlVGV4dCIsInRpdGxlTm9kZSIsInNldFBvc2l0aW9uIiwibGFiZWwiLCJhZGRDb21wb25lbnQiLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJDRU5URVIiLCJjb2xvciIsIm91dGxpbmUiLCJMYWJlbE91dGxpbmUiLCJfcHJlcGFyZUNhcmROb2RlUmVzcG9uc2l2ZSIsImNhcmRTY2FsZSIsInRpdGxlIiwiTEVGVCIsInNwcml0ZSIsIl9sb2FkRGVmYXVsdFJvb21CdXR0b25CZyIsImdvbGRMYWJlbE5vZGUiLCJ6SW5kZXgiLCJtaW5WYWx1ZSIsImN1cnJlbmN5TmFtZSIsIm1pbl9hcmVuYV9jb2luIiwibWluQXJlbmFDb2luIiwiX2Zvcm1hdEdvbGQiLCJ5T2Zmc2V0IiwieE9mZnNldCIsIl9vbkFyZW5hUm9vbUJ1dHRvbkNsaWNrIiwiX29uTm9ybWFsUm9vbUJ1dHRvbkNsaWNrIiwicGxheWVyR29sZCIsIl9zaG93QWRSZXdhcmREaWFsb2ciLCJjdXJyZW50Um9vbUNvbmZpZyIsImN1cnJlbnRSb29tTGV2ZWwiLCJjdXJyZW50Um9vbU5hbWUiLCJfcXVpY2tNYXRjaCIsInJvb21JZCIsImlzU2lnbmVkVXAiLCJfaGFzU2lnbmVkVXBPdGhlckFyZW5hIiwiX2RvQXJlbmFTaWdudXAiLCJjdXJyZW50Um9vbUlkIiwic2lnbnVwIiwicmVmcmVzaEJhbGFuY2UiLCJvbGRCdXR0b25zIiwib2xkVGltZXJzIiwiYnV0dG9uQ29udGFpbmVyIiwiY291bnRkb3duQ29udGFpbmVyIiwic3RhdHVzQmFySGVpZ2h0IiwiaXRlbVdpZHRoIiwiaXRlbUhlaWdodCIsIml0ZW1HYXAiLCJsZWZ0UmlnaHRNYXJnaW4iLCJiZ1dpZHRoIiwiYmdIZWlnaHQiLCJiZ1JhZGl1cyIsImJnQ29sb3IiLCJyb29tU3RhdHVzSXRlbSIsInNpemUiLCJjYXJkTm9kZSIsImJnTm9kZSIsImJnR3JhcGhpY3MiLCJHcmFwaGljcyIsImZpbGxDb2xvciIsInJvdW5kUmVjdCIsImZpbGwiLCJwZXJpb2RMYWJlbCIsInBlcmlvZExhYmVsQ29tcCIsInZlcnRpY2FsQWxpZ24iLCJWZXJ0aWNhbEFsaWduIiwiZW5hYmxlQm9sZCIsInBlcmlvZE91dGxpbmUiLCJ0aXRsZUxhYmVsIiwidGl0bGVMYWJlbENvbXAiLCJ0aXRsZU91dGxpbmUiLCJzaWdudXBCdG4iLCJ0eXBlIiwiVHlwZSIsIlNJTVBMRSIsInNpemVNb2RlIiwiU2l6ZU1vZGUiLCJDVVNUT00iLCJmaXhlZFdpZHRoIiwiZml4ZWRIZWlnaHQiLCJzaWdudXBCdG5Ob2RlIiwiX29uQXJlbmFTaWdudXBCdXR0b25DbGljayIsIm9yaWdpbmFsSGVpZ2h0IiwiX2xvYWRTaWdudXBCdXR0b25JbWFnZXMiLCJfc3RhcnRDb3VudGRvd25UaW1lciIsImltYWdlUGF0aHMiLCJfc2lnbnVwQnRuRnJhbWVzIiwibG9hZGVkQ291bnQiLCJpbmRleCIsInNwbGl0IiwicG9wIiwiX2lzSW5NYXRjaFRpbWUiLCJtYXRjaFRpbWVSYW5nZXMiLCJtYXRjaF90aW1lX3JhbmdlcyIsInJhbmdlcyIsIkpTT04iLCJwYXJzZSIsImN1cnJlbnRNaW51dGVzIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwicmFuZ2UiLCJzdGFydFBhcnRzIiwic3RhcnQiLCJlbmRQYXJ0cyIsImVuZCIsInN0YXJ0TWludXRlcyIsInBhcnNlSW50IiwiZW5kTWludXRlcyIsIl9jYW5TaWdudXBBcmVuYSIsIm1hdGNoRHVyYXRpb24iLCJtYXRjaF9kdXJhdGlvbiIsImludGVydmFsX21pbnV0ZXMiLCJpbnRlcnZhbE1pbnV0ZXMiLCJfZ2V0TmV4dFNpZ251cERlYWRsaW5lIiwiY3VycmVudFJhbmdlIiwicmFuZ2VTdGFydE1pbnV0ZXMiLCJzdGFydE1pbiIsImVuZE1pbiIsIm1pbnV0ZXNTaW5jZVN0YXJ0IiwicmVtYWluZGVyIiwibmV4dE1hdGNoTWludXRlcyIsImNlaWwiLCJkZWFkbGluZU1pbnV0ZXMiLCJob3VycyIsImZsb29yIiwibWlucyIsInRpbWVTdHIiLCJfZ2V0U2lnbnVwQ291bnRkb3duU2Vjb25kcyIsImN1cnJlbnRTZWNvbmRzIiwiZ2V0U2Vjb25kcyIsImN1cnJlbnRUb3RhbFNlY29uZHMiLCJyYW5nZVN0YXJ0U2Vjb25kcyIsIm1hdGNoRHVyYXRpb25TZWNvbmRzIiwiZWxhcHNlZFNlY29uZHMiLCJjb3VudGRvd24iLCJfZ2V0TmVhcmVzdE1hdGNoVGltZVJhbmdlIiwicGFyc2VkUmFuZ2VzIiwiciIsImluUmFuZ2UiLCJuZWFyZXN0UmFuZ2UiLCJtaW5EaWZmIiwiSW5maW5pdHkiLCJkaWZmIiwibWludXRlc1VudGlsU3RhcnQiLCJfZ2V0TmV4dE1hdGNoQ291bnRkb3duIiwiaW50ZXJ2YWxTZWNvbmRzIiwic2Vjb25kc0luQ3ljbGUiLCJyZW1haW5pbmdTZWNvbmRzIiwiaW5NYXRjaFRpbWUiLCJzZWNvbmRzIiwiX2Zvcm1hdENvdW50ZG93biIsInRvdGFsU2Vjb25kcyIsIm1pbnV0ZXMiLCJfZm9ybWF0TWF0Y2hUaW1lUmFuZ2UiLCJfZ2V0Q3VycmVudFBlcmlvZE5vIiwicGVyaW9kTm8iLCJwbGF5ZXJBcmVuYUNvaW4iLCJhcmVuYV9jb2luIiwiX2RvQ2FuY2VsU2lnbnVwIiwic2lnbnVwRmVlIiwiY2FuY2VsU2lnbnVwIiwiX2NvdW50ZG93blRpbWVyIiwiY2xlYXJJbnRlcnZhbCIsIl9sb2NhbEFyZW5hU3RhdHVzIiwib25BcmVuYVN0YXR1cyIsImFyZW5hcyIsIl9vbkFyZW5hU3RhdHVzUHVzaCIsIm9uQXJlbmFNYXRjaFN0YXJ0IiwiX29uQXJlbmFNYXRjaFN0YXJ0Iiwib25BcmVuYUNsb3NlRGlhbG9nIiwiX29uQXJlbmFDbG9zZURpYWxvZyIsIl9pbml0TG9jYWxBcmVuYVN0YXR1c0Zyb21Db25maWciLCJzZXRJbnRlcnZhbCIsIl91cGRhdGVMb2NhbENvdW50ZG93biIsIl9jbG9zZUFyZW5hTWF0Y2hTdGFydERpYWxvZyIsIl9jdXJyZW50TWF0Y2hEYXRhIiwiX3Nob3dBcmVuYU1hdGNoU3RhcnREaWFsb2ciLCJfYXJlbmFNYXRjaFN0YXJ0RGlhbG9nIiwibG9nIiwic3RyaW5naWZ5Iiwicm9vbV9pZCIsIl9hcmVuYU1hdGNoU3RhcnREaWFsb2dSb29tSWQiLCJkaWFsb2dOb2RlIiwiX2FyZW5hTWF0Y2hTdGFydERpYWxvZ1BlcmlvZE5vIiwicGVyaW9kX25vIiwicmVjdCIsImNhcmRHcmFwaGljcyIsInN0cm9rZUNvbG9yIiwibGluZVdpZHRoIiwic3Ryb2tlIiwicGVyaW9kTm9kZSIsInJvb21Ob2RlIiwicm9vbUxhYmVsIiwicGxheWVyc05vZGUiLCJwbGF5ZXJzTGFiZWwiLCJ0b3RhbF9wbGF5ZXJzIiwibXNnTm9kZSIsIm1zZ0xhYmVsIiwiYnRuWSIsImVudGVyQnRuIiwiZW50ZXJCZyIsImVudGVyTGFiZWxOb2RlIiwiZW50ZXJCdG5MYWJlbCIsImVudGVyQnV0dG9uQ29tcCIsIl9lbnRlckFyZW5hTWF0Y2giLCJjYW5jZWxCdG4iLCJjYW5jZWxCZyIsImNhbmNlbExhYmVsTm9kZSIsImNhbmNlbEJ0bkxhYmVsIiwiY2FuY2VsQnV0dG9uQ29tcCIsIl9jYW5jZWxBcmVuYVNpZ251cCIsInNlbmRBcmVuYUNhbmNlbFNpZ251cCIsIl9zaWduZWRVcEFyZW5hcyIsInNhdmVUb0xvY2FsIiwiY3VycmVudEFyZW5hTWF0Y2giLCJzZW5kQXJlbmFFbnRlciIsIl9zaG93TWVzc2FnZUNlbnRlciIsInJvb21Kb2luZWRIYW5kbGVyIiwiX2FyZW5hRW50ZXJUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwicGxheWVycyIsImNvbnZlcnRlZFJvb21EYXRhIiwicm9vbWlkIiwicm9vbV9jb2RlIiwic2VhdGluZGV4IiwicGxheWVyIiwic2VhdCIsInBsYXllcmRhdGEiLCJtYXAiLCJwIiwiaWR4IiwiYWNjb3VudGlkIiwibmlja19uYW1lIiwiYXZhdGFyIiwiZ29sZF9jb3VudCIsImdvbGRjb3VudCIsImlzcmVhZHkiLCJyZWFkeSIsImFyZW5hX2dvbGQiLCJtYXRjaF9jb2luIiwiaG91c2VtYW5hZ2VpZCIsImNyZWF0b3JfaWQiLCJfZW50ZXJHYW1lU2NlbmUiLCJvblJvb21Kb2luZWQiLCJ0ZW1wUm9vbURhdGEiLCJyb29tX2NvbmZpZ19pZCIsInNpZ251cF9mZWUiLCJtYXRjaF9yb3VuZHMiLCJfZW50ZXJBcmVuYUdhbWVTY2VuZSIsIm1hdGNoRGF0YSIsImJvdHRvbSIsInJhdGUiLCJlbnRlckRlbGF5Iiwid2FpdF90aW1lIiwibWluIiwiX2FyZW5hRW50ZXJUaW1lciIsInBoYXNlSW5mbyIsIl9jYWxjdWxhdGVQaGFzZUluZm8iLCJwZXJpb2ROb1N0ciIsInBoYXNlIiwiY2FuU2lnbnVwIiwidG90YWxQbGF5ZXJzIiwic3RhdHVzVGV4dCIsImxhc3RVcGRhdGUiLCJpc0xvY2FsQ2FsY3VsYXRlZCIsIl91cGRhdGVDb3VudGRvd25Gcm9tTG9jYWxDYWNoZSIsImFyZW5hIiwibmV3UGVyaW9kTm9TdHIiLCJwZXJpb2Rfbm9fc3RyIiwib2xkU3RhdHVzIiwib2xkUGVyaW9kTm8iLCJjYW5fc2lnbnVwIiwic3RhdHVzX3RleHQiLCJuZWVkVXBkYXRlIiwidGltZVNpbmNlTGFzdFVwZGF0ZSIsIl9nZXRBcmVuYUNvbmZpZ0J5Um9vbUlkIiwicGVyaW9kVG90YWxTZWNvbmRzIiwicHJlcGFyZVNlY29uZHMiLCJwZXJpb2RFbGFwc2VkIiwieWVhciIsIlN0cmluZyIsImdldEZ1bGxZZWFyIiwic2xpY2UiLCJtb250aCIsImdldE1vbnRoIiwicGFkU3RhcnQiLCJkYXkiLCJnZXREYXRlIiwiZGF0ZVN0ciIsInJvb21JZFN0ciIsInNlcVN0ciIsImxvY2FsU3RhdHVzIiwic2VjcyIsImNvdW50ZG93blN0ciIsIl91cGRhdGVDb3VudGRvd25Gcm9tU2VydmVyIiwiX3VwZGF0ZUNvdW50ZG93bkRpc3BsYXkiLCJfc2hvd0xvYWRpbmdQcm9ncmVzcyIsImxvYWRpbmdOb2RlIiwiX2FkZExvYWRpbmdEZWNvcmF0aW9ucyIsInJvb21OYW1lTm9kZSIsInJvb21OYW1lTGFiZWwiLCJ0aXBOb2RlIiwidGlwTGFiZWwiLCJwcm9ncmVzc0JnIiwicHJvZ3Jlc3NCZ0dyYXBoaWNzIiwicHJvZ3Jlc3NGaWxsIiwicHJvZ3Jlc3NGaWxsR3JhcGhpY3MiLCJwZXJjZW50Tm9kZSIsInBlcmNlbnRMYWJlbCIsImJvdHRvbVRpcE5vZGUiLCJib3R0b21UaXBMYWJlbCIsImxvYWRpbmdUaXBzIiwicHJvZ3Jlc3MiLCJ0YXJnZXRQcm9ncmVzcyIsInRpcEluZGV4IiwidXBkYXRlUHJvZ3Jlc3MiLCJfc2hvd1Jvb21MaXN0U2NlbmUiLCJmaWxsV2lkdGgiLCJjbGVhciIsIm5ld1RpcEluZGV4IiwiY2FyZFN5bWJvbHMiLCJjYXJkQ29sb3JzIiwicG9zaXRpb25zIiwidjIiLCJzeW1ib2xOb2RlIiwic3ltYm9sTGFiZWwiLCJvbGRTY2VuZSIsInNjZW5lTm9kZSIsIl9jcmVhdGVSb29tTGlzdEJhY2tncm91bmQiLCJfY3JlYXRlUm9vbUxpc3RIZWFkZXIiLCJfY3JlYXRlUm9vbUxpc3RBY3Rpb25zIiwiX2NyZWF0ZVJvb21MaXN0Q29udGVudCIsIl9jcmVhdGVSb29tTGlzdEZvb3RlciIsImJvcmRlck5vZGUiLCJib3JkZXJHcmFwaGljcyIsImNvcm5lcnMiLCJyb3QiLCJjb3JuZXIiLCJjb3JuZXJOb2RlIiwiY2ciLCJtb3ZlVG8iLCJsaW5lVG8iLCJoZWFkZXJZIiwiaGVhZGVySGVpZ2h0IiwiaGVhZGVyQmciLCJoZyIsImxlZnREZWNvIiwibGQiLCJjaXJjbGUiLCJyaWdodERlY28iLCJyZCIsInN1YlRleHQiLCJzdWJMYWJlbCIsImFjdGlvbkJhclkiLCJhY3Rpb25CYXJIZWlnaHQiLCJhY3Rpb25CYXJCZyIsImFiZyIsImxlZnRYIiwicm9vbUNvZGVJbnB1dCIsIl9jcmVhdGVTaW1wbGVJbnB1dEJveCIsImpvaW5CdG4iLCJfY3JlYXRlQWN0aW9uQnV0dG9uIiwiaW5wdXQiLCJlZGl0Qm94IiwiRWRpdEJveCIsIl9qb2luUm9vbSIsIl9zaG93VGlwSW5TY2VuZSIsInJpZ2h0WCIsImNyZWF0ZUJ0biIsIl9zaG93Q3JlYXRlUm9vbURpYWxvZyIsInF1aWNrQnRuIiwic2NlbmUiLCJwbGFjZWhvbGRlciIsImlucHV0Tm9kZSIsImJnIiwiZm9udENvbG9yIiwicGxhY2Vob2xkZXJGb250U2l6ZSIsInBsYWNlaG9sZGVyRm9udENvbG9yIiwibWF4TGVuZ3RoIiwiaW5wdXRNb2RlIiwiSW5wdXRNb2RlIiwiTlVNRVJJQyIsInJldHVyblR5cGUiLCJLZXlib2FyZFJldHVyblR5cGUiLCJET05FIiwidGV4dCIsImNhbGxiYWNrIiwidGV4dE5vZGUiLCJUT1VDSF9TVEFSVCIsIlRPVUNIX0NBTkNFTCIsImxpc3RZIiwibGlzdEhlaWdodCIsImxpc3RXaWR0aCIsImxpc3RCZyIsImxnIiwiaGJnIiwiY29sV2lkdGgiLCJoZWFkZXJzIiwiaE5vZGUiLCJobCIsInJvb21Db250YWluZXIiLCJsbCIsIl9mZXRjaEFuZFJlbmRlclJvb21MaXN0Rm9yU2NlbmUiLCJmb290ZXJZIiwiZm9vdGVyQmciLCJmZyIsImJhY2tCdG4iLCJnb2xkSWNvbiIsImdnIiwiZ29sZFRleHQiLCJnbCIsInJlZnJlc2hCdG4iLCJjb250YWluZXIiLCJsb2FkaW5nIiwiX2NyZWF0ZUJ1dHRvbk5vZGUiLCJpc1ByaW1hcnkiLCJib3JkZXJDb2xvciIsImciLCJvdmVyZmxvdyIsIk92ZXJmbG93IiwiTk9ORSIsIl9jcmVhdGVJbWFnZUJ1dHRvbk5vZGUiLCJpbWFnZVBhdGgiLCJfY3JlYXRlQnV0dG9uRmFsbGJhY2siLCJncmFwaGljcyIsImxhYmVsTm9kZSIsIl9jcmVhdGVJbnB1dE5vZGUiLCJwbGFjZWhvbGRlck5vZGUiLCJfY3JlYXRlU3R5bGVkQnV0dG9uIiwib2xkRGlhbG9nIiwiZGlhbG9nIiwibWFzayIsIm1hc2tHIiwiZGlhbG9nV2lkdGgiLCJkaWFsb2dIZWlnaHQiLCJkaWFsb2dCZyIsImRiZyIsImhlYWRlckJhciIsInR0bCIsImNsb3NlQnRuIiwiY2JnIiwiY2xvc2VYIiwiY2xvc2VMYWJlbCIsInJvb21UeXBlQmciLCJydGJnIiwicm9vbVR5cGVUZXh0IiwicnRsIiwibmFtZUxhYmVsIiwibmxsIiwibmFtZUlucHV0RGF0YSIsInZhbHVlIiwibmFtZUlucHV0QnRuIiwiX2NyZWF0ZUVkaXRCb3hJbnB1dCIsInB3ZExhYmVsIiwicGxsIiwicHdkSW5wdXREYXRhIiwicHdkSW5wdXRCdG4iLCJfY3JlYXRlRGlhbG9nQnV0dG9uIiwibmFtZUlucHV0IiwicHdkSW5wdXQiLCJuYW1lRWRpdEJveCIsInB3ZEVkaXRCb3giLCJwYXNzd29yZCIsImNyZWF0ZVJvb21JbmZvIiwiX2NyZWF0ZVJvb20iLCJkYXRhUmVmIiwiQU5ZIiwiZWRpdGJveCIsIl9jcmVhdGVJbnB1dERpYWxvZ0lucHV0IiwicHJvbXB0IiwiX2NyZWF0ZUJlYXV0aWZ1bElucHV0IiwiX2NyZWF0ZUJlYXV0aWZ1bEJ1dHRvbiIsIl9jcmVhdGVEaWFsb2dJbnB1dCIsIl9zaG93UGFzc3dvcmREaWFsb2ciLCJyb29tQ29kZSIsImNvZGVUZXh0IiwiY3RsIiwiY29uZmlybUJ0biIsInB3ZElucHV0Tm9kZSIsIl9zaG93VGlwSW5EaWFsb2ciLCJ0aXAiLCJsb2FkaW5nTGFiZWwiLCJjdXJyZW50Um9vbXMiLCJyb29tTGlzdFVwZGF0ZUhhbmRsZXIiLCJhY3Rpb25UeXBlIiwiYWN0aW9uX3R5cGUiLCJleGlzdHMiLCJzb21lIiwiZmlsdGVyIiwiZmlsdGVyZWRSb29tcyIsImNvdW50IiwicGxheWVyX2NvdW50IiwicGxheWVyQ291bnQiLCJfcmVuZGVyUm9vbUxpc3RJblNjZW5lIiwib25Sb29tTGlzdFVwZGF0ZSIsIl9yb29tTGlzdFVwZGF0ZUhhbmRsZXIiLCJ0aW1lb3V0SWQiLCJnZXRSb29tTGlzdCIsImNvbnRhaW5lcldpZHRoIiwic3RhcnRZIiwiZW1wdHlOb2RlIiwiZWwiLCJpdGVtWSIsIml0ZW1CZyIsImlnIiwiY2wiLCJjb3VudFRleHQiLCJzY29yZVRleHQiLCJzbCIsInN0bCIsIl9zaG93Um9vbUxpc3REaWFsb2ciLCJvbGRUaXAiLCJtYXNrR3JhcGhpY3MiLCJzdWJUaXRsZU5vZGUiLCJzdWJUaXRsZUxhYmVsIiwibGlzdENvbnRhaW5lciIsImJ0bkNvbnRhaW5lciIsInF1aWNrTWF0Y2hCdG4iLCJfY3JlYXRlQnV0dG9uIiwiaW5wdXRDb250YWluZXIiLCJpbnB1dExhYmVsIiwiaW5wdXRMYWJlbENvbXAiLCJpbnB1dEJnTm9kZSIsImlucHV0QmciLCJpbnB1dFRleHQiLCJfZmV0Y2hSb29tTGlzdCIsIl9yZW5kZXJSb29tTGlzdCIsImVtcHR5QmciLCJlbXB0eUxhYmVsIiwiaXRlbSIsImNvZGVMYWJlbCIsImNvdW50TGFiZWwiLCJfd2FpdEZvckNvbm5lY3Rpb25BbmRTbWFydE1hdGNoIiwiX3NtYXJ0TWF0Y2giLCJfaGlkZU1lc3NhZ2VDZW50ZXIiLCJ3YWl0aW5nUm9vbSIsIndhaXRpbmdSb29tQ29kZSIsInRyeUNvbm5lY3QiLCJfc2VuZFF1aWNrTWF0Y2hSZXF1ZXN0IiwicmVxdWVzdF9lbnRlcl9yb29tIiwiX2VudGVyUm9vbVRpbWVvdXQiLCJyb29tX2xldmVsIiwiX3dhaXRGb3JDb25uZWN0aW9uQW5kQ3JlYXRlUm9vbSIsIl9zZW5kQ3JlYXRlUm9vbVJlcXVlc3QiLCJjcmVhdGVSb29tIiwicGxheWVySWQiLCJnZXRQbGF5ZXJJbmZvIiwicGxheWVySW5mbyIsInJvb21Db25maWdJZCIsInNlcnZlclBsYXllciIsImFjY291bnRJRCIsInVuaXF1ZUlEIiwic2F2ZVJlY29ubmVjdEluZm8iLCJfd2FpdEZvckNvbm5lY3Rpb25BbmRKb2luUm9vbSIsIl9zZW5kSm9pblJvb21SZXF1ZXN0Iiwiam9pblJvb20iLCJjcmVhdG9ySWQiLCJfd2FpdEZvckNvbm5lY3Rpb25BbmRFbnRlclJvb20iLCJ0cnlFbnRlciIsImdvbGQiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJfc2hvd1F1aWNrRW50ZXJBbmltYXRpb24iLCJydW5TY2VuZUltbWVkaWF0ZSIsIlNjZW5lIiwibWFza05vZGUiLCJvcGFjaXR5IiwiQmxvY2tJbnB1dEV2ZW50cyIsImxvYWRpbmdJbWFnZU5vZGUiLCJ0d2VlbiIsInRvIiwiX3F1aWNrRW50ZXJNYXNrIiwiX2NlbnRlclRpcE5vZGUiLCJub3RpY2VOYW1lcyIsIl9oaWRlTm9kZXNXaXRoVGV4dCIsIl9oaWRlQmFja2dyb3VuZExhYmVscyIsImxhYmVsc1RvSGlkZSIsIm5vZGVzIiwiX2ZpbmROb2Rlc0J5TmFtZSIsImoiLCJzdWJSZXN1bHRzIiwiY29uY2F0IiwicGxheWVyTm9kZSIsInl1YW5iYW9JY29uIiwiZ29sZEZyYW1lIiwic2VhcmNoVGV4dCIsIl9jcmVhdGVFbnRlclJvb21CdXR0b24iLCJvbGRCdG4iLCJfY3JlYXRlRW50ZXJSb29tQnV0dG9uRmFsbGJhY2siLCJfc2hvd0VudGVyUm9vbVBvcHVwIiwiaWNvbk5vZGUiLCJpY29uTGFiZWwiLCJvbGRQb3B1cCIsInBvcHVwIiwiYmdNYXNrIiwiYmdHZngiLCJzaGFkb3ciLCJzaGFkb3dHZngiLCJtYWluQmciLCJtYWluR2Z4IiwidG9wQmFyIiwidG9wR2Z4IiwidGl0bGVCZyIsInRpdGxlQmdHZngiLCJzdWJ0aXRsZU5vZGUiLCJzdWJ0aXRsZUxhYmVsIiwiaW5wdXRBcmVhWSIsImlucHV0R2Z4IiwiaW5wdXRGbGFnIiwiSW5wdXRGbGFnIiwiU0VOU0lUSVZFIiwiYmFja2dyb3VuZENvbG9yIiwidGlwQmciLCJ0aXBHZngiLCJ0aXBJY29uIiwidGlwSWNvbkxhYmVsIiwiY2FuY2VsR2Z4IiwiY2FuY2VsTGFiZWwiLCJjYW5jZWxMYWJlbENvbXAiLCJjYW5jZWxCdG5Db21wIiwiY29uZmlybUdmeCIsImNvbmZpcm1JY29uIiwiY29uZmlybUljb25MYWJlbCIsImNvbmZpcm1MYWJlbCIsImNvbmZpcm1MYWJlbENvbXAiLCJjb25maXJtQnRuQ29tcCIsIl9qb2luUm9vbUJ5SWQiLCJjbG9zZUdmeCIsInJlcXVlc3Rfam9pblJvb20iLCJfdXBkYXRlQ3VycmVuY3lJY29uIiwiY3VycmVuY3lJY29uIiwiX3Nob3dTaWdudXBEaWFsb2ciLCJyb29tTmFtZVRleHQiLCJybmwiLCJmZWVMYWJlbCIsImZsIiwiZmVlVmFsdWUiLCJmdiIsImJhbGFuY2VMYWJlbCIsImJsIiwiYmFsYW5jZVZhbHVlIiwiYnYiLCJyZXdhcmRMYWJlbCIsInJsIiwiY2hhbXBpb25SZXdhcmQiLCJjaGFtcGlvbl9yZXdhcmQiLCJjb2lucyIsInJld2FyZFZhbHVlIiwicnYiLCJpc0Vub3VnaCIsIl9kb1NpZ251cCIsImFkQnRuIiwiX3Nob3dTaWduZWRVcERpYWxvZyIsImNvdW50ZG93bkxhYmVsIiwidXBkYXRlQ291bnRkb3duIiwiZ2V0Q291bnRkb3duIiwiZm9ybWF0Q291bnRkb3duIiwiY2FuY2VsU2lnbnVwQnRuIiwiX2NhbmNlbFNpZ251cCIsIm5lZWRlZEFtb3VudCIsImRlc2NUZXh0IiwiZGwiLCJhZEljb24iLCJhaWwiLCJ3YXRjaEJ0biIsIl93YXRjaEFkQW5kR2V0UmV3YXJkIiwid2F0Y2hBZEZvclJld2FyZCIsIm9uRGVzdHJveSIsImNsZWFyQWxsQ291bnRkb3ducyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7O0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSyxFQUFBQyxTQUFBO0VBQ0osV0FBU0YsRUFBRSxDQUFDRyxTQUFTO0VBQ3JCQyxJQUFJLEVBQUUsV0FBVztFQUVqQkMsVUFBVSxFQUFFO0lBQ1JDLGNBQWMsRUFBRU4sRUFBRSxDQUFDTyxLQUFLO0lBQ3hCQyxTQUFTLEVBQUVSLEVBQUUsQ0FBQ1MsTUFBTTtJQUNwQkMsV0FBVyxFQUFFVixFQUFFLENBQUNPLEtBQUs7SUFDckI7SUFDQUksZ0JBQWdCLEVBQUVYLEVBQUUsQ0FBQ08sS0FBSztJQUMxQkssaUJBQWlCLEVBQUVaLEVBQUUsQ0FBQ2EsTUFBTTtJQUM1QkMsZ0JBQWdCLEVBQUVkLEVBQUUsQ0FBQ2EsTUFBTTtJQUMzQkUsc0JBQXNCLEVBQUVmLEVBQUUsQ0FBQ2E7RUFDL0IsQ0FBQztFQUVERyxNQUFNLFdBQUFBLE9BQUEsRUFBSTtJQUVOLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLEVBQUU7TUFDbEJDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDO01BQ3JDLElBQUksQ0FBQ0MsZ0JBQWdCLEVBQUU7TUFDdkI7SUFDSjtJQUVBLElBQUksQ0FBQ0MsbUJBQW1CLEVBQUU7RUFDOUIsQ0FBQztFQUVEO0VBQ0FDLE1BQU0sRUFBRSxTQUFBQSxPQUFTQyxFQUFFLEVBQUU7SUFDakI7SUFDQSxJQUFJLElBQUksQ0FBQ0Msc0JBQXNCLElBQUksSUFBSSxDQUFDQyxpQkFBaUIsSUFBSSxJQUFJLENBQUNBLGlCQUFpQixDQUFDQyxPQUFPLEVBQUU7TUFDekYsSUFBSSxDQUFDRCxpQkFBaUIsQ0FBQ0UsS0FBSyxJQUFJSixFQUFFLEdBQUcsR0FBRztJQUM1QztJ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SUFBSXpZLE1BQU0sQ0FBQzhNLFNBQVMsSUFBSTlNLE1BQU0sQ0FBQzhNLFNBQVMsQ0FBQ3NyQixrQkFBa0IsRUFBRTtJQUN6RHA0QixNQUFNLENBQUM4TSxTQUFTLENBQUNzckIsa0JBQWtCLEVBQUU7RUFDekM7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7QUFDSixDQUFDLEVBQUFuNUIsU0FBQSxDQUVENlYsS0FBSyxZQUFBQSxNQUFBLEVBQUksQ0FBQyxDQUFDLEVBQUE3VixTQUFBLEVBQ2IiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOS9v+eUqOWFqOWxgOWPmOmHj++8jOS4jeS9v+eUqCByZXF1aXJlXG5cbi8vIOiEmuacrOWKoOi9veaXpeW/l1xuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuICAgIG5hbWU6ICdoYWxsU2NlbmUnLCBcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbmlja25hbWVfbGFiZWw6IGNjLkxhYmVsLFxuICAgICAgICBoZWFkaW1hZ2U6IGNjLlNwcml0ZSxcbiAgICAgICAgZ29iYWxfY291bnQ6IGNjLkxhYmVsLFxuICAgICAgICAvLyDnq57mioDluIHmmL7npLpMYWJlbO+8iOWPr+mAie+8jOWmguaenOWcuuaZr+S4reayoeacieWImeWKqOaAgeWIm+W7uu+8iVxuICAgICAgICBhcmVuYV9jb2luX2xhYmVsOiBjYy5MYWJlbCxcbiAgICAgICAgY3JlYXRyb29tX3ByZWZhYnM6IGNjLlByZWZhYixcbiAgICAgICAgam9pbnJvb21fcHJlZmFiczogY2MuUHJlZmFiLFxuICAgICAgICB1c2VyX2FncmVlbWVudF9wcmVmYWJzOiBjYy5QcmVmYWIsXG4gICAgfSxcblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXdpbmRvdy5teWdsb2JhbCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwibXlnbG9iYWwg5pyq5a6a5LmJ77yM562J5b6F5Yid5aeL5YyWLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy5fd2FpdEZvck15Z2xvYmFsKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2luaXRXaXRoUGxheWVyRGF0YSgpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yqg6L295Zu+54mH5peL6L2s5Yqo55S7XG4gICAgdXBkYXRlOiBmdW5jdGlvbihkdCkge1xuICAgICAgICAvLyBfc2hvd01lc3NhZ2VDZW50ZXIg55qE5Yqg6L295Zu+54mH5peL6L2sXG4gICAgICAgIGlmICh0aGlzLl9sb2FkaW5nSW1hZ2VBbmltYXRpbmcgJiYgdGhpcy5fbG9hZGluZ0ltYWdlTm9kZSAmJiB0aGlzLl9sb2FkaW5nSW1hZ2VOb2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdJbWFnZU5vZGUuYW5nbGUgKz0gZHQgKiAxODA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gX3Nob3dRdWlja0VudGVyQW5pbWF0aW9uIOeahOWKoOi9veWbvueJh+aXi+i9rFxuICAgICAgICBpZiAodGhpcy5fcXVpY2tFbnRlckFuaW1hdGluZyAmJiB0aGlzLl9xdWlja0VudGVyTG9hZGluZ05vZGUgJiYgdGhpcy5fcXVpY2tFbnRlckxvYWRpbmdOb2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3F1aWNrRW50ZXJMb2FkaW5nTm9kZS5hbmdsZSArPSBkdCAqIDE4MDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX3dhaXRGb3JNeWdsb2JhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGF0dGVtcHRzID0gMDtcbiAgICAgICAgdmFyIG1heEF0dGVtcHRzID0gMjA7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGF0dGVtcHRzKys7XG4gICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faW5pdFdpdGhQbGF5ZXJEYXRhKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGF0dGVtcHRzIDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrLCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibXlnbG9iYWwg5Yid5aeL5YyW6LaF5pe2XCIpO1xuICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImxvZ2luU2NlbmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0KGNoZWNrLCAxMDApO1xuICAgIH0sXG4gICAgXG4gICAgX2luaXRXaXRoUGxheWVyRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgXG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnBsYXllckRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJteWdsb2JhbCDmiJYgcGxheWVyRGF0YSDmnKrlrprkuYlcIik7XG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJsb2dpblNjZW5lXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGxheWVyRGF0YSA9IG15Z2xvYmFsLnBsYXllckRhdGE7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXBsYXllckRhdGEudG9rZW4pIHtcbiAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImxvZ2luU2NlbmVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpSB2ZXJpZnlUb2tlbiDmmK/lkKblrZjlnKhcbiAgICAgICAgaWYgKHR5cGVvZiBteWdsb2JhbC52ZXJpZnlUb2tlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwidmVyaWZ5VG9rZW4g5pa55rOV5LiN5a2Y5Zyo77yM6Lez6L+H6aqM6K+BXCIpO1xuICAgICAgICAgICAgc2VsZi5faW5pdFVJQWZ0ZXJBdXRoKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBteWdsb2JhbC52ZXJpZnlUb2tlbihmdW5jdGlvbih2YWxpZCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwibG9naW5TY2VuZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLl9pbml0VUlBZnRlckF1dGgoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwidmVyaWZ5VG9rZW4g6LCD55So5aSx6LSlOlwiLCBlKTtcbiAgICAgICAgICAgIHNlbGYuX2luaXRVSUFmdGVyQXV0aCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfaW5pdFVJQWZ0ZXJBdXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgICAgICB2YXIgcGxheWVyRGF0YSA9IG15Z2xvYmFsID8gbXlnbG9iYWwucGxheWVyRGF0YSA6IG51bGw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghcGxheWVyRGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcInBsYXllckRhdGEg5Li656m677yM5L2/55So6buY6K6k5YC8XCIpO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGEgPSB7IG5pY2tOYW1lOiBcIua4uOWuolwiLCBnb2JhbF9jb3VudDogMCwgYXZhdGFyVXJsOiBudWxsIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruaYteensFxuICAgICAgICAgICAgLy8g5LyY5YWI5L2/55So5bGe5oCn5YWz6IGU55qEIExhYmVs77yM5aaC5p6c5rKh5pyJ5YiZ6YCa6L+H6IqC54K55ZCN5p+l5om+XG4gICAgICAgICAgICB2YXIgbmlja25hbWVMYWJlbCA9IHRoaXMubmlja25hbWVfbGFiZWw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWmguaenOWxnuaAp+WFs+iBlOeahCBMYWJlbCDml6DmlYjvvIzlsJ3or5XpgJrov4foioLngrnlkI3mn6Xmib5cbiAgICAgICAgICAgIGlmICghbmlja25hbWVMYWJlbCB8fCBuaWNrbmFtZUxhYmVsLnN0cmluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8g6YCS5b2S5p+l5om+IG5pY2tuYW1lX2xhYmVsIOiKgueCuVxuICAgICAgICAgICAgICAgIHZhciBuaWNrbmFtZU5vZGUgPSB0aGlzLl9maW5kTm9kZUJ5TmFtZSh0aGlzLm5vZGUsIFwibmlja25hbWVfbGFiZWxcIik7XG4gICAgICAgICAgICAgICAgaWYgKG5pY2tuYW1lTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBuaWNrbmFtZUxhYmVsID0gbmlja25hbWVOb2RlLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5pY2tuYW1lTGFiZWwpIHtcbiAgICAgICAgICAgICAgICBuaWNrbmFtZUxhYmVsLnN0cmluZyA9IHBsYXllckRhdGEubmlja05hbWUgfHwgXCLmuLjlrqJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi44CQ5aSn5Y6F44CRbmlja25hbWVfbGFiZWwg5pyq5om+5Yiw77yM6K+35qOA5p+l5Zy65pmv5paH5Lu2XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7ph5HluIEv5qyi5LmQ6LGG5pi+56S6XG4gICAgICAgICAgICAvLyDpu5jorqTmmL7npLrmrKLkuZDosYbvvIzmoLnmja7lvZPliY3pgInkuK3nmoTmiL/pl7TnsbvlnovliIfmjaLmmL7npLpcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRSb29tQ2F0ZWdvcnkgPSAxOyAgLy8g6buY6K6k5pmu6YCa5Zy6XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVDdXJyZW5jeURpc3BsYXkoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fYWRqdXN0R29sZEVsZW1lbnRzUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRVc2VyQXZhdGFyKHBsYXllckRhdGEuYXZhdGFyVXJsKTtcbiAgICAgICAgICAgIHRoaXMucm9vbUNvbmZpZ3MgPSBbXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yid5aeL5YyW56ue5oqA5biB5pi+56S6XG4gICAgICAgICAgICB0aGlzLl9pbml0QXJlbmFDb2luRGlzcGxheSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDojrflj5bmnIDmlrDnmoTnjqnlrrbkvZnpop3vvIjph5HluIHlkoznq57mioDluIHvvIlcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hQbGF5ZXJCYWxhbmNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuX3BsYXlIYWxsQmFja2dyb3VuZE11c2ljKCk7XG4gICAgICAgICAgICB0aGlzLl9hZGp1c3RCb3R0b21CdXR0b25zKCk7XG4gICAgICAgICAgICB0aGlzLl9oaWRlQmFja2dyb3VuZENoYXJhY3RlcnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRXZWJTb2NrZXQoKTsgIC8vIOWIneWni+WMliBXZWJTb2NrZXQg6L+e5o6lXG4gICAgICAgICAgICB0aGlzLl9zdGFydE9ubGluZU1vbml0b3JpbmcoKTsgIC8vIOWQr+WKqOWcqOe6v+eKtuaAgeebkea1i1xuICAgICAgICAgICAgdGhpcy5fZmV0Y2hSb29tQ29uZmlncygpO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlTm90aWNlQm9hcmQoKTtcbiAgICAgICAgICAgIC8vIOazqOmHiuaOie+8muWkp+WOheS4jemcgOimgeWKoOWFpeaIv+mXtOaMiemSru+8jOivpeWKn+iDveWcqOaIv+mXtOWIl+ihqOWcuuaZr+S4reS9v+eUqFxuICAgICAgICAgICAgLy8gdGhpcy5fY3JlYXRlRW50ZXJSb29tQnV0dG9uKCk7ICAvLyDliJvlu7rliqDlhaXmiL/pl7TmjInpkq5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g8J+agOOAkOaAp+iDveS8mOWMluOAkemihOWKoOi9vea4uOaIj+WcuuaZr1xuICAgICAgICAgICAgdGhpcy5fcHJlbG9hZEdhbWVTY2VuZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJfaW5pdFVJQWZ0ZXJBdXRoIOW8guW4uDpcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOWQr+WKqOWcqOe6v+eKtuaAgeebkea1i1xuICAgIF9zdGFydE9ubGluZU1vbml0b3Jpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIGlmICghbXlnbG9iYWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIm15Z2xvYmFsIOacquWumuS5ie+8jOaXoOazleWQr+WKqOWcqOe6v+ebkea1i1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOWQr+WKqOWFqOWxgOWcqOe6v+ebkea1i1xuICAgICAgICBpZiAobXlnbG9iYWwuc3RhcnRPbmxpbmVNb25pdG9yaW5nKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5zdGFydE9ubGluZU1vbml0b3JpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g55uR5ZCs5Zyo57q/54q25oCB5Y+Y5YyWXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5fb25saW5lU3RhdHVzSGFuZGxlciA9IGZ1bmN0aW9uKGlzT25saW5lKSB7XG4gICAgICAgICAgICAvLyDlj6rmnInlnKjpnZ7liJ3lp4vljJbnirbmgIHkuIvmiY3mmL7npLrnprvnur/mj5DnpLpcbiAgICAgICAgICAgIGlmICghaXNPbmxpbmUgJiYgIW15Z2xvYmFsLl9pc0luaXRpYWxpemluZykge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dPZmZsaW5lTWVzc2FnZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNPbmxpbmUgJiYgbXlnbG9iYWwuX2lzSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwuYWRkT25saW5lU3RhdHVzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLmFkZE9ubGluZVN0YXR1c0xpc3RlbmVyKHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDnm5HlkKzlvLrliLbkuIvnur/kuovku7ZcbiAgICAgICAgaWYgKG15Z2xvYmFsLmV2ZW50bGlzdGVyKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5ldmVudGxpc3Rlci5vbihcImZvcmNlX2xvZ291dFwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi8J+aqyDmlLbliLDlvLrliLbkuIvnur/kuovku7Y6XCIsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUZvcmNlTG9nb3V0KGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOaYvuekuuemu+e6v+aPkOekulxuICAgIF9zaG93T2ZmbGluZU1lc3NhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIue9kee7nOi/nuaOpeW3suaWreW8gO+8jOato+WcqOmHjeaWsOi/nuaOpS4uLlwiKTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWkhOeQhuW8uuWItuS4i+e6v1xuICAgIF9oYW5kbGVGb3JjZUxvZ291dDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVhc29uID0gZGF0YS5yZWFzb24gfHwgXCLmgqjlt7LooqvlvLrliLbkuIvnur9cIjtcbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UocmVhc29uKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouebkea1i1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5zdG9wT25saW5lTW9uaXRvcmluZykge1xuICAgICAgICAgICAgbXlnbG9iYWwuc3RvcE9ubGluZU1vbml0b3JpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5bu26L+f6Lez6L2s5Yiw55m75b2V6aG16Z2iXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwibG9naW5TY2VuZVwiKTtcbiAgICAgICAgfSwgMik7XG4gICAgfSxcbiAgICBcbiAgICAvLyDlgZzmraLlnKjnur/nirbmgIHnm5HmtYtcbiAgICBfc3RvcE9ubGluZU1vbml0b3Jpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIFxuICAgICAgICBpZiAobXlnbG9iYWwgJiYgbXlnbG9iYWwuc3RvcE9ubGluZU1vbml0b3JpbmcpIHtcbiAgICAgICAgICAgIG15Z2xvYmFsLnN0b3BPbmxpbmVNb25pdG9yaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5yZW1vdmVPbmxpbmVTdGF0dXNMaXN0ZW5lciAmJiB0aGlzLl9vbmxpbmVTdGF0dXNIYW5kbGVyKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5yZW1vdmVPbmxpbmVTdGF0dXNMaXN0ZW5lcih0aGlzLl9vbmxpbmVTdGF0dXNIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMuX29ubGluZVN0YXR1c0hhbmRsZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDwn5qA44CQ5oCn6IO95LyY5YyW44CR6aKE5Yqg6L295ri45oiP5Zy65pmvXG4gICAgX3ByZWxvYWRHYW1lU2NlbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOS8mOWMluOAkemihOWKoOi9veWcuuaZr+i1hOa6kFxuICAgICAgICBjYy5kaXJlY3Rvci5wcmVsb2FkU2NlbmUoXCJnYW1lU2NlbmVcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfmoAgW+mihOWKoOi9vV0g5ri45oiP5Zy65pmv6aKE5Yqg6L295aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmoIforrDlnLrmma/lt7LpooTliqDovb1cbiAgICAgICAgICAgIHNlbGYuX2dhbWVTY2VuZVByZWxvYWRlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yid5aeL5YyWIFdlYlNvY2tldCDov57mjqVcbiAgICBfaW5pdFdlYlNvY2tldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgaWYgKCFteWdsb2JhbCB8fCAhbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJzb2NrZXQg5pyq5Yid5aeL5YyWXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKblt7Lov57mjqVcbiAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldC5pc1dlYlNvY2tldE9wZW4gJiYgbXlnbG9iYWwuc29ja2V0LmlzV2ViU29ja2V0T3BlbigpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpemAu+i+kei/nuaOpeeKtuaAgVxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0LmlzQ29ubmVjdGVkICYmIG15Z2xvYmFsLnNvY2tldC5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDliJ3lp4vljJYgV2ViU29ja2V0XG4gICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQuaW5pdFNvY2tldCkge1xuICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LmluaXRTb2NrZXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g6YCS5b2S5p+l5om+6IqC54K5XG4gICAgX2ZpbmROb2RlQnlOYW1lOiBmdW5jdGlvbihwYXJlbnROb2RlLCBub2RlTmFtZSkge1xuICAgICAgICAvLyDlhYjmo4Dmn6Xnm7TmjqXlrZDoioLngrlcbiAgICAgICAgdmFyIGZvdW5kID0gcGFyZW50Tm9kZS5nZXRDaGlsZEJ5TmFtZShub2RlTmFtZSk7XG4gICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICAgICAgICBcbiAgICAgICAgLy8g6YCS5b2S5p+l5om+XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHBhcmVudE5vZGUuY2hpbGRyZW47XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgZm91bmQgPSB0aGlzLl9maW5kTm9kZUJ5TmFtZShjaGlsZCwgbm9kZU5hbWUpO1xuICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBfaGlkZUJhY2tncm91bmRDaGFyYWN0ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHhpb25nbWFvMSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcInhpb25nbWFvMVwiKTtcbiAgICAgICAgdmFyIHhpb25nbWFvMiA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcInhpb25nbWFvMlwiKTtcbiAgICAgICAgaWYgKHhpb25nbWFvMSkgeGlvbmdtYW8xLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoeGlvbmdtYW8yKSB4aW9uZ21hbzIuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICBcbiAgICAvLyDosIPmlbTlupXpg6jmjInpkq4gLSDosIPlsI/lubbpnaDlj7PmjpLliJdcbiAgICBfYWRqdXN0Qm90dG9tQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5bqV6YOo5oyJ6ZKu5ZCN56ew5YiX6KGoXG4gICAgICAgIHZhciBidXR0b25OYW1lcyA9IFtcbiAgICAgICAgICAgIFwiYnRuX2NyZWF0ZV9yb29tXCIsXG4gICAgICAgICAgICBcImJ0bl9qb2luX3Jvb21cIiwgXG4gICAgICAgICAgICBcImJ0bl91c2VyX2FncmVlbWVudFwiLFxuICAgICAgICAgICAgXCJ1c2VyX2FncmVlbWVudFwiLFxuICAgICAgICAgICAgXCJidG5fc2V0dGluZ1wiLFxuICAgICAgICAgICAgXCJidG5faGVscFwiXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICAvLyDmlLbpm4blrZjlnKjnmoTmjInpkq5cbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXR0b25OYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJ0biA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShidXR0b25OYW1lc1tpXSk7XG4gICAgICAgICAgICBpZiAoYnRuICYmIGJ0bi5hY3RpdmUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGJ0bik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOayoeaJvuWIsO+8jOWwneivleafpeaJvuWFtuS7luWPr+iDveeahOaMiemSrlxuICAgICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZhciBhbGxDaGlsZHJlbiA9IHRoaXMubm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBhbGxDaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQubmFtZSAmJiBjaGlsZC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYnRuJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKblnKjlupXpg6jljLrln59cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25zLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g6LCD5pW05q+P5Liq5oyJ6ZKuXG4gICAgICAgIHZhciBidG5XaWR0aCA9IDEyMDsgICAvLyDmjInpkq7lrr3luqZcbiAgICAgICAgdmFyIGJ0bkhlaWdodCA9IDUwOyAgIC8vIOaMiemSrumrmOW6plxuICAgICAgICB2YXIgYnRuR2FwID0gMTU7ICAgICAgLy8g5oyJ6ZKu6Ze06LedXG4gICAgICAgIHZhciByaWdodE1hcmdpbiA9IDMwOyAvLyDlj7Povrnot51cbiAgICAgICAgdmFyIGJvdHRvbU1hcmdpbiA9IDMwOyAvLyDlupXovrnot51cbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJ0biA9IGJ1dHRvbnNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOemgeeUqCBXaWRnZXQg57uE5Lu2XG4gICAgICAgICAgICB2YXIgd2lkZ2V0ID0gYnRuLmdldENvbXBvbmVudChjYy5XaWRnZXQpO1xuICAgICAgICAgICAgaWYgKHdpZGdldCkgd2lkZ2V0LmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g57yp5bCP5oyJ6ZKuXG4gICAgICAgICAgICBidG4uc2NhbGUgPSAwLjc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9rumUmueCuVxuICAgICAgICAgICAgYnRuLmFuY2hvclggPSAxOyAgLy8g5Y+z6ZSa54K5XG4gICAgICAgICAgICBidG4uYW5jaG9yWSA9IDA7ICAvLyDlupXplJrngrlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6h566X5L2N572uIC0g5LuO5Y+z5b6A5bem5o6S5YiXXG4gICAgICAgICAgICB2YXIgeFBvcyA9IHNjcmVlbldpZHRoIC8gMiAtIHJpZ2h0TWFyZ2luIC0gaSAqIChidG5XaWR0aCAqIDAuNyArIGJ0bkdhcCk7XG4gICAgICAgICAgICB2YXIgeVBvcyA9IC1zY3JlZW5IZWlnaHQgLyAyICsgYm90dG9tTWFyZ2luO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidG4ueCA9IHhQb3M7XG4gICAgICAgICAgICBidG4ueSA9IHlQb3M7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX2xvYWRVc2VyQXZhdGFyOiBmdW5jdGlvbihhdmF0YXJVcmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMuaGVhZGltYWdlKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFhdmF0YXJVcmwpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWREZWZhdWx0QXZhdGFyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXZhdGFyVXJsLmluZGV4T2YoJ2h0dHA6Ly8nKSA9PT0gMCB8fCBhdmF0YXJVcmwuaW5kZXhPZignaHR0cHM6Ly8nKSA9PT0gMCkge1xuICAgICAgICAgICAgY2MuYXNzZXRNYW5hZ2VyLmxvYWRSZW1vdGUoYXZhdGFyVXJsLCB7IGV4dDogJy5wbmcnIH0sIGZ1bmN0aW9uKGVyciwgdGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgfHwgIXRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRBdmF0YXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ByaXRlRnJhbWUgPSBuZXcgY2MuU3ByaXRlRnJhbWUodGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcHJpdGVGcmFtZSkgc2VsZi5oZWFkaW1hZ2Uuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2xvYWREZWZhdWx0QXZhdGFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCgnVUkvaGVhZGltYWdlLycgKyBhdmF0YXJVcmwsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciB8fCAhc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRBdmF0YXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmhlYWRpbWFnZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRBdmF0YXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfbG9hZERlZmF1bHRBdmF0YXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNjLnJlc291cmNlcy5sb2FkKCdVSS9oZWFkaW1hZ2UvYXZhdGFyXzEnLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmhlYWRpbWFnZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfcGxheUhhbGxCYWNrZ3JvdW5kTXVzaWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNvcGVuX3NvdW5kID0gd2luZG93Lmlzb3Blbl9zb3VuZCB8fCAxO1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnN0b3BNdXNpYygpO1xuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUuc3RvcEFsbEVmZmVjdHMoKTtcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwic291bmQvbG9naW5fYmdcIiwgY2MuQXVkaW9DbGlwLCBmdW5jdGlvbihlcnIsIGNsaXApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBjbGlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5TXVzaWMoY2xpcCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH0sXG4gICAgXG4gICAgX2ZldGNoUm9vbUNvbmZpZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhcGlVcmwgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmFwaVVybCA6ICcnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5jcnlwdG9LZXkgOiAnJztcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOayoeaciemFjee9riBBUEnvvIzkvb/nlKjpu5jorqTphY3nva5cbiAgICAgICAgaWYgKCFhcGlVcmwgfHwgIXdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICBzZWxmLl9pbml0Um9vbUJ1dHRvbnMoc2VsZi5fZ2V0RGVmYXVsdFJvb21Db25maWdzKCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5riF6Zmk57yT5a2YXG4gICAgICAgICAgICBpZiAoSHR0cEFQSS5fcm9vbUNvbmZpZ0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgSHR0cEFQSS5fcm9vbUNvbmZpZ0NhY2hlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdyb29tX2NvbmZpZ19jYWNoZScpOyB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDor7fmsYIgQVBJXG4gICAgICAgICAgICBIdHRwQVBJLmdldChcbiAgICAgICAgICAgICAgICBhcGlVcmwgKyAnL2FwaS92MS9yb29tL2NvbmZpZy9saXN0JyxcbiAgICAgICAgICAgICAgICBjcnlwdG9LZXksXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQVBJ6K+35rGC5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5faW5pdFJvb21CdXR0b25zKHNlbGYuX2dldERlZmF1bHRSb29tQ29uZmlncygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5jb2RlID09PSAwICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdzID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ICYmIEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncyA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOiwg+ivleOAkei+k+WHuuiOt+WPluWIsOeahOaIv+mXtOmFjee9rlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBjb25maWdzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlncyAmJiBjb25maWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucm9vbUNvbmZpZ3MgPSBjb25maWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5faW5pdFJvb21CdXR0b25zKGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5faW5pdFJvb21CdXR0b25zKHNlbGYuX2dldERlZmF1bHRSb29tQ29uZmlncygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJfZmV0Y2hSb29tQ29uZmlncyDlvILluLg6XCIsIGUpO1xuICAgICAgICAgICAgc2VsZi5faW5pdFJvb21CdXR0b25zKHNlbGYuX2dldERlZmF1bHRSb29tQ29uZmlncygpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX2dldERlZmF1bHRSb29tQ29uZmlnczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IGlkOiAxLCByb29tX25hbWU6IFwi5Yid57qn5oi/XCIsIHJvb21fdHlwZTogMiwgYmFzZV9zY29yZTogMSwgbXVsdGlwbGllcjogMSwgbWluX2dvbGQ6IDAsIG1heF9nb2xkOiA1MDAwMCwgZGVzY3JpcHRpb246IFwi5bqV5YiGMVwiLCBzdGF0dXM6IDEsIHNvcnRfb3JkZXI6IDAsIHJvb21fY2F0ZWdvcnk6IDEgfSxcbiAgICAgICAgICAgIHsgaWQ6IDIsIHJvb21fbmFtZTogXCLkuK3nuqfmiL9cIiwgcm9vbV90eXBlOiAzLCBiYXNlX3Njb3JlOiAyLCBtdWx0aXBsaWVyOiAxLCBtaW5fZ29sZDogNTAwMDAsIG1heF9nb2xkOiAyMDAwMDAsIGRlc2NyaXB0aW9uOiBcIuW6leWIhjJcIiwgc3RhdHVzOiAxLCBzb3J0X29yZGVyOiAxLCByb29tX2NhdGVnb3J5OiAxIH0sXG4gICAgICAgICAgICB7IGlkOiAzLCByb29tX25hbWU6IFwi6auY57qn5oi/XCIsIHJvb21fdHlwZTogNCwgYmFzZV9zY29yZTogNSwgbXVsdGlwbGllcjogMiwgbWluX2dvbGQ6IDIwMDAwMCwgbWF4X2dvbGQ6IDEwMDAwMDAsIGRlc2NyaXB0aW9uOiBcIuW6leWIhjVcIiwgc3RhdHVzOiAxLCBzb3J0X29yZGVyOiAyLCByb29tX2NhdGVnb3J5OiAyIH0sXG4gICAgICAgICAgICB7IGlkOiA0LCByb29tX25hbWU6IFwi5aix5LmQ5oi/XCIsIHJvb21fdHlwZTogNSwgYmFzZV9zY29yZTogMTAsIG11bHRpcGxpZXI6IDMsIG1pbl9nb2xkOiAxMDAwMDAwLCBtYXhfZ29sZDogNTAwMDAwMCwgZGVzY3JpcHRpb246IFwi5bqV5YiGMTBcIiwgc3RhdHVzOiAxLCBzb3J0X29yZGVyOiAzLCByb29tX2NhdGVnb3J5OiAyIH0sXG4gICAgICAgICAgICB7IGlkOiA1LCByb29tX25hbWU6IFwi5aix5LmQ5oi/XCIsIHJvb21fdHlwZTogNiwgYmFzZV9zY29yZTogMjAsIG11bHRpcGxpZXI6IDUsIG1pbl9nb2xkOiA1MDAwMDAwLCBtYXhfZ29sZDogMCwgZGVzY3JpcHRpb246IFwi5bqV5YiGMjBcIiwgc3RhdHVzOiAxLCBzb3J0X29yZGVyOiA0LCByb29tX2NhdGVnb3J5OiAyIH1cbiAgICAgICAgXTtcbiAgICB9LFxuICAgIFxuICAgIF9oaWRlVW53YW50ZWRCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyZWF0ZVJvb21CdG4gPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJidG5fY3JlYXRlX3Jvb21cIik7XG4gICAgICAgIHZhciBqb2luUm9vbUJ0biA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImJ0bl9qb2luX3Jvb21cIik7XG4gICAgICAgIGlmIChjcmVhdGVSb29tQnRuKSBjcmVhdGVSb29tQnRuLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoam9pblJvb21CdG4pIGpvaW5Sb29tQnRuLmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5qC45b+D5pa55rOV77ya5Yid5aeL5YyW5oi/6Ze05oyJ6ZKuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgX2luaXRSb29tQnV0dG9uczogZnVuY3Rpb24ocm9vbXMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruWQjeensOaYoOWwhFxuICAgICAgICB2YXIgYnV0dG9uTmFtZU1hcCA9IHtcbiAgICAgICAgICAgIDI6IFwiYnRuX3Jvb21fanVuaW9yXCIsXG4gICAgICAgICAgICAzOiBcImJ0bl9yb29tX21pZGRsZVwiLFxuICAgICAgICAgICAgNDogXCJidG5fcm9vbV9zZW5pb3JcIixcbiAgICAgICAgICAgIDU6IFwiYnRuX3Jvb21fbWFzdGVyXCIsXG4gICAgICAgICAgICA2OiBcImJ0bl9yb29tX3N1cHJlbWVcIlxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5YWI6ZqQ6JeP5omA5pyJ5oi/6Ze05oyJ6ZKuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBidXR0b25OYW1lTWFwKSB7XG4gICAgICAgICAgICB2YXIgYnRuTm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShidXR0b25OYW1lTWFwW2tleV0pO1xuICAgICAgICAgICAgaWYgKGJ0bk5vZGUpIGJ0bk5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDjgJDkuIDjgIHmlbDmja7lpITnkIbjgJHmiYDmnInmiL/pl7TlkIjlubbliLDkuIDkuKrmlbDnu4TvvIzmjIkgc29ydF9vcmRlciDmjpLluo9cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIFxuICAgICAgICB2YXIgYWxsUm9vbXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb25maWcgPSByb29tc1tpXTtcbiAgICAgICAgICAgIHZhciBzb3J0T3JkZXIgPSBjb25maWcuc29ydF9vcmRlciB8fCBjb25maWcuc29ydE9yZGVyIHx8IGNvbmZpZy5zb3J0IHx8IDA7XG4gICAgICAgICAgICB2YXIgcm9vbVR5cGUgPSBjb25maWcucm9vbV90eXBlIHx8IGNvbmZpZy5yb29tVHlwZTtcbiAgICAgICAgICAgIHZhciBidXR0b25OYW1lID0gYnV0dG9uTmFtZU1hcFtyb29tVHlwZV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghYnV0dG9uTmFtZSkgY29udGludWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBidG5Ob2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKGJ1dHRvbk5hbWUpO1xuICAgICAgICAgICAgaWYgKCFidG5Ob2RlKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHJvb21EYXRhID0ge1xuICAgICAgICAgICAgICAgIG5vZGU6IGJ0bk5vZGUsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgcm9vbVR5cGU6IHJvb21UeXBlLFxuICAgICAgICAgICAgICAgIHNvcnRPcmRlcjogc29ydE9yZGVyLFxuICAgICAgICAgICAgICAgIHJvb21OYW1lOiBjb25maWcucm9vbV9uYW1lIHx8IGNvbmZpZy5yb29tTmFtZSB8fCBcIuacquefpeaIv+mXtFwiLFxuICAgICAgICAgICAgICAgIG1pbkdvbGQ6IGNvbmZpZy5taW5fZ29sZCB8fCBjb25maWcubWluR29sZCB8fCAwLFxuICAgICAgICAgICAgICAgIG1heEdvbGQ6IGNvbmZpZy5tYXhfZ29sZCB8fCBjb25maWcubWF4R29sZCB8fCAwLFxuICAgICAgICAgICAgICAgIHJvb21DYXRlZ29yeTogY29uZmlnLnJvb21fY2F0ZWdvcnkgfHwgY29uZmlnLnJvb21DYXRlZ29yeSB8fCAxXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhbGxSb29tcy5wdXNoKHJvb21EYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5oyJIHNvcnRfb3JkZXIg5Y2H5bqP5o6S5bqPXG4gICAgICAgIGFsbFJvb21zLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYS5zb3J0T3JkZXIgLSBiLnNvcnRPcmRlcjsgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g6YWN572u5omA5pyJ5Y2h54mHXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsUm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gYWxsUm9vbXNbaV07XG4gICAgICAgICAgICByb29tLm5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJvb20ubm9kZS5yb29tQ29uZmlnID0gcm9vbS5jb25maWc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlbGYuX2xvYWRSb29tQnV0dG9uQmcocm9vbS5ub2RlLCByb29tLnJvb21UeXBlKTtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZU1pbkdvbGRMYWJlbChyb29tLm5vZGUsIHJvb20uY29uZmlnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IHJvb20ubm9kZS5nZXRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgICAgICAgICBidXR0b24udHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5kdXJhdGlvbiA9IDAuMTtcbiAgICAgICAgICAgICAgICBidXR0b24uem9vbVNjYWxlID0gMS4xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmlLbpm4bnq57mioDlnLrmiL/pl7RcbiAgICAgICAgICAgIGlmIChyb29tLnJvb21DYXRlZ29yeSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmICghc2VsZi5fYXJlbmFSb29tcykgc2VsZi5fYXJlbmFSb29tcyA9IFtdO1xuICAgICAgICAgICAgICAgIHNlbGYuX2FyZW5hUm9vbXMucHVzaChyb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgKGZ1bmN0aW9uKGNvbmZpZywgbm9kZSwgcm9vbU5hbWUsIHJvb21DYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgIG5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICAgICAgbm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAvLyDnq57mioDlnLrmiL/pl7TvvJrkuI3lho3lk43lupTmlbTkuKrljaHniYfnmoTngrnlh7vvvIznlLHmiqXlkI3mjInpkq7lpITnkIZcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvb21DYXRlZ29yeSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX29uUm9vbUJ1dHRvbkNsaWNrKGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KShyb29tLmNvbmZpZywgcm9vbS5ub2RlLCByb29tLnJvb21OYW1lLCByb29tLnJvb21DYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4suafk+W4g+WxgCAtIOaJgOacieWNoeeJh+aOkuaIkOS4gOihjFxuICAgICAgICB0aGlzLl9yZW5kZXJSb29tTGF5b3V0KGFsbFJvb21zKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4uuernuaKgOWcuuaIv+mXtOa3u+WKoOaKpeWQjeaMiemSrlxuICAgICAgICB0aGlzLl9hZGRBcmVuYVNpZ251cEJ1dHRvbnMoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlhYjku47mnI3liqHnq6/ojrflj5bmiqXlkI3nirbmgIHvvIzlho3mm7TmlrBVSVxuICAgICAgICB0aGlzLl9mZXRjaFNpZ251cFN0YXR1c0FuZFVwZGF0ZVVJKCk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR5LuO5pyN5Yqh56uv6I635Y+W5oql5ZCN54q25oCB5bm25pu05pawVUlcbiAgICBfZmV0Y2hTaWdudXBTdGF0dXNBbmRVcGRhdGVVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhICYmIHdpbmRvdy5hcmVuYURhdGEuZmV0Y2hTaWdudXBTdGF0dXNGcm9tU2VydmVyKSB7XG4gICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLmZldGNoU2lnbnVwU3RhdHVzRnJvbVNlcnZlcihmdW5jdGlvbihlcnIsIHNpZ25lZFVwUm9vbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfj5/vuI8g6I635Y+W5oql5ZCN54q25oCB5aSx6LSl77yM5L2/55So5pys5Zyw57yT5a2YOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOaXoOiuuuaIkOWKn+Wksei0pe+8jOmDveabtOaWsFVJ77yI5L2/55So5pys5Zyw57yT5a2Y77yJXG4gICAgICAgICAgICAgICAgc2VsZi5fdXBkYXRlQXJlbmFTaWdudXBTdGF0dXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5rKh5pyJQVBJ5pSv5oyB77yM55u05o6l5L2/55So5pys5Zyw57yT5a2YXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVBcmVuYVNpZ251cFN0YXR1cygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDluIPlsYDmuLLmn5MgLSDmiYDmnInljaHniYfmsLTlubPmjpLmiJDkuIDooYxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBfcmVuZGVyUm9vbUxheW91dDogZnVuY3Rpb24oYWxsUm9vbXMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g5riF55CG5pen5a655ZmoXG4gICAgICAgIHZhciBvbGRQYW5lbCA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcIkNhcmRDb250YWluZXJcIik7XG4gICAgICAgIHZhciBvbGRMZWZ0UGFuZWwgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJMZWZ0QXJlYVwiKTtcbiAgICAgICAgdmFyIG9sZFJpZ2h0UGFuZWwgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJSaWdodEFyZWFcIik7XG4gICAgICAgIGlmIChvbGRQYW5lbCkgb2xkUGFuZWwuZGVzdHJveSgpO1xuICAgICAgICBpZiAob2xkTGVmdFBhbmVsKSBvbGRMZWZ0UGFuZWwuZGVzdHJveSgpO1xuICAgICAgICBpZiAob2xkUmlnaHRQYW5lbCkgb2xkUmlnaHRQYW5lbC5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYWxsUm9vbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDlj4LmlbDorr7nva5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBjYXJkV2lkdGggPSAxODA7ICAgICAgIC8vIOWNoeeJh+WuveW6plxuICAgICAgICB2YXIgY2FyZEhlaWdodCA9IDEyMDsgICAgICAvLyDljaHniYfpq5jluqZcbiAgICAgICAgdmFyIGdhcFggPSAzMDsgICAgICAgICAgICAgLy8g5Y2h54mH5rC05bmz6Ze06LedXG4gICAgICAgIFxuICAgICAgICAvLyDnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6h566X5a655Zmo5a695bqmXG4gICAgICAgIHZhciB0b3RhbENhcmRzV2lkdGggPSBhbGxSb29tcy5sZW5ndGggKiBjYXJkV2lkdGggKyAoYWxsUm9vbXMubGVuZ3RoIC0gMSkgKiBnYXBYO1xuICAgICAgICB2YXIgcGFuZWxXaWR0aCA9IE1hdGgubWF4KHRvdGFsQ2FyZHNXaWR0aCArIDQwLCBzY3JlZW5XaWR0aCAtIDEwMCk7XG4gICAgICAgIHZhciBwYW5lbEhlaWdodCA9IGNhcmRIZWlnaHQgKyA0MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWuueWZqOS9jee9rlxuICAgICAgICB2YXIgdmVydGljYWxPZmZzZXQgPSAyMDsgICAvLyDlnoLnm7TlgY/np7vvvIjkuIvnp7vvvIlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8g5Yib5bu65a655ZmoIC0g5omA5pyJ5Y2h54mH5rC05bmz5o6S5oiQ5LiA6KGMXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgY2FyZFBhbmVsID0gbmV3IGNjLk5vZGUoXCJDYXJkQ29udGFpbmVyXCIpO1xuICAgICAgICBjYXJkUGFuZWwuc2V0Q29udGVudFNpemUocGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQpO1xuICAgICAgICBjYXJkUGFuZWwuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgY2FyZFBhbmVsLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIGNhcmRQYW5lbC54ID0gMDsgIC8vIOWxheS4rVxuICAgICAgICBjYXJkUGFuZWwueSA9IHZlcnRpY2FsT2Zmc2V0O1xuICAgICAgICBjYXJkUGFuZWwucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5pS+572u5omA5pyJ5Y2h54mHIC0g5rC05bmz5o6S5YiXXG4gICAgICAgIHZhciBzdGFydFggPSAtdG90YWxDYXJkc1dpZHRoIC8gMiArIGNhcmRXaWR0aCAvIDI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsUm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gYWxsUm9vbXNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB3aWRnZXQgPSByb29tLm5vZGUuZ2V0Q29tcG9uZW50KGNjLldpZGdldCk7XG4gICAgICAgICAgICBpZiAod2lkZ2V0KSB3aWRnZXQuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcm9vbS5ub2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICByb29tLm5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgICAgIHJvb20ubm9kZS5zY2FsZSA9IDE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJvb20ubm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgcm9vbS5ub2RlLnBhcmVudCA9IGNhcmRQYW5lbDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y2h54mH5rC05bmz5L2N572u77ya5LuO5bem5Yiw5Y+z5o6S5YiXXG4gICAgICAgICAgICByb29tLm5vZGUueCA9IHN0YXJ0WCArIGkgKiAoY2FyZFdpZHRoICsgZ2FwWCk7XG4gICAgICAgICAgICAvLyDljaHniYflnoLnm7TkvY3nva7vvJrlsYXkuK1cbiAgICAgICAgICAgIHJvb20ubm9kZS55ID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgLy8g5re75Yqg5Yy65Z+f5qCH6aKYXG4gICAgX2FkZEFyZWFUaXRsZTogZnVuY3Rpb24ocGFuZWwsIHRpdGxlVGV4dCwgeCwgeSkge1xuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJBcmVhVGl0bGVcIik7XG4gICAgICAgIHRpdGxlTm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgdmFyIGxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IHRpdGxlVGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyODtcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDM2O1xuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyMTUsIDApO1xuICAgICAgICBcbiAgICAgICAgdmFyIG91dGxpbmUgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwKTtcbiAgICAgICAgb3V0bGluZS53aWR0aCA9IDI7XG4gICAgICAgIFxuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgfSxcbiAgICBcbiAgICAvLyDlh4blpIfljaHniYfoioLngrnvvIjlk43lupTlvI/vvIzmlK/mjIHnvKnmlL7vvIlcbiAgICBfcHJlcGFyZUNhcmROb2RlUmVzcG9uc2l2ZTogZnVuY3Rpb24obm9kZSwgY2FyZFNjYWxlKSB7XG4gICAgICAgIC8vIOemgeeUqCBXaWRnZXQg57uE5Lu277yI6Ziy5q2i6Ieq5Yqo5ouJ5Ly477yJXG4gICAgICAgIHZhciB3aWRnZXQgPSBub2RlLmdldENvbXBvbmVudChjYy5XaWRnZXQpO1xuICAgICAgICBpZiAod2lkZ2V0KSB7XG4gICAgICAgICAgICB3aWRnZXQuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDplJrngrnorr7kuLrkuK3lv4NcbiAgICAgICAgbm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBub2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDlupTnlKjnvKnmlL7vvIjkuI3mi4nkvLjvvIzkv53mjIHmr5TkvovvvIlcbiAgICAgICAgbm9kZS5zY2FsZSA9IGNhcmRTY2FsZSB8fCAxO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5re75Yqg5Yy65Z+f5qCH6aKYXG4gICAgX2FkZEFyZWFUaXRsZTogZnVuY3Rpb24ocGFuZWwsIHRpdGxlLCB4LCB5KSB7XG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZU5vZGUuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRpdGxlTm9kZS5hbmNob3JYID0gMDtcbiAgICAgICAgdGl0bGVOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGl0bGU7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjg7XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAzNjtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkxFRlQ7XG4gICAgICAgIFxuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgb3V0bGluZSA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgb3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApO1xuICAgICAgICBvdXRsaW5lLndpZHRoID0gMjtcbiAgICAgICAgXG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSBwYW5lbDtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWKoOi9veaIv+mXtOaMiemSruiDjOaZr+WbvlxuICAgIF9sb2FkUm9vbUJ1dHRvbkJnOiBmdW5jdGlvbihidG5Ob2RlLCByb29tVHlwZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzcHJpdGUgPSBidG5Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAoIXNwcml0ZSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoJ1VJL2J0bl9oYXBweV8nICsgcm9vbVR5cGUsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoZXJyIHx8ICFzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2xvYWREZWZhdWx0Um9vbUJ1dHRvbkJnKGJ0bk5vZGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9hZERlZmF1bHRSb29tQnV0dG9uQmcoYnRuTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgX2xvYWREZWZhdWx0Um9vbUJ1dHRvbkJnOiBmdW5jdGlvbihidG5Ob2RlKSB7XG4gICAgICAgIHZhciBzcHJpdGUgPSBidG5Ob2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBpZiAoIXNwcml0ZSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoJ1VJL2J0bl9oYXBweV8yJywgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDmm7TmlrDmnIDkvY7osYblrZAv56ue5oqA5biB5pi+56S677yI5qC55o2uIHJvb21fY2F0ZWdvcnkg5Yik5pat77yJXG4gICAgLy8gcm9vbV9jYXRlZ29yeTogMS3mma7pgJrlnLoo5L2/55SobWluX2dvbGTlrZfmrrXmmL7npLrosYYpLCAyLeernuaKgOWcuijkvb/nlKhtaW5fYXJlbmFfY29pbuWtl+auteaYvuekuuernuaKgOW4gSlcbiAgICBfdXBkYXRlTWluR29sZExhYmVsOiBmdW5jdGlvbihidG5Ob2RlLCBjb25maWcpIHtcbiAgICAgICAgdmFyIGdvbGRMYWJlbE5vZGUgPSBidG5Ob2RlLmdldENoaWxkQnlOYW1lKFwibWluX2dvbGRfbGFiZWxcIik7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmiL/pl7TliIbnsbvvvIzpu5jorqTkuLrmma7pgJrlnLooMSlcbiAgICAgICAgdmFyIHJvb21DYXRlZ29yeSA9IGNvbmZpZy5yb29tX2NhdGVnb3J5IHx8IGNvbmZpZy5yb29tQ2F0ZWdvcnkgfHwgMTtcbiAgICAgICAgXG4gICAgICAgIGlmICghZ29sZExhYmVsTm9kZSkge1xuICAgICAgICAgICAgZ29sZExhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwibWluX2dvbGRfbGFiZWxcIik7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBnb2xkTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIyOyAgICAgICAvLyDlrZfkvZPlpKflsI9cbiAgICAgICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAyODsgICAgICAvLyDooYzpq5hcbiAgICAgICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBnb2xkTGFiZWxOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICBnb2xkTGFiZWxOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBvdXRsaW5lID0gZ29sZExhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwKTtcbiAgICAgICAgICAgIG91dGxpbmUud2lkdGggPSAyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7mm7Tpq5jnmoQgekluZGV4IOehruS/neaYvuekuuWcqOacgOS4iuWxglxuICAgICAgICAgICAgZ29sZExhYmVsTm9kZS56SW5kZXggPSAxMDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGdvbGRMYWJlbE5vZGUucGFyZW50ID0gYnRuTm9kZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGxhYmVsID0gZ29sZExhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u5oi/6Ze057G75Z6L6I635Y+W5LiN5ZCM55qE5a2X5q615YC8XG4gICAgICAgIC8vIHJvb21fY2F0ZWdvcnk6IDEt5pmu6YCa5Zy6KOS9v+eUqG1pbl9nb2xkKSwgMi3nq57mioDlnLoo5L2/55SobWluX2FyZW5hX2NvaW4pXG4gICAgICAgIHZhciBtaW5WYWx1ZTtcbiAgICAgICAgdmFyIGN1cnJlbmN5TmFtZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChyb29tQ2F0ZWdvcnkgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIOernuaKgOWcuiAtIOS9v+eUqCBtaW5fYXJlbmFfY29pbiDlrZfmrrVcbiAgICAgICAgICAgIG1pblZhbHVlID0gY29uZmlnLm1pbl9hcmVuYV9jb2luIHx8IGNvbmZpZy5taW5BcmVuYUNvaW4gfHwgMDtcbiAgICAgICAgICAgIGN1cnJlbmN5TmFtZSA9IFwi5biBXCI7XG4gICAgICAgICAgICBnb2xkTGFiZWxOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7ICAgIC8vIOernuaKgOWcuu+8mueZveiJslxuICAgICAgICAgICAgLy8g56ue5oqA5Zy677ya5LiN5pi+56S6XCLmnIDkvY5cIlxuICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gdGhpcy5fZm9ybWF0R29sZChtaW5WYWx1ZSkgKyBcIiBcIiArIGN1cnJlbmN5TmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOaZrumAmuWcuiAtIOS9v+eUqCBtaW5fZ29sZCDlrZfmrrVcbiAgICAgICAgICAgIG1pblZhbHVlID0gY29uZmlnLm1pbl9nb2xkIHx8IGNvbmZpZy5taW5Hb2xkIHx8IDA7XG4gICAgICAgICAgICBjdXJyZW5jeU5hbWUgPSBcIuixhlwiO1xuICAgICAgICAgICAgZ29sZExhYmVsTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpOyAgICAvLyDmma7pgJrlnLrvvJrnmb3oibJcbiAgICAgICAgICAgIC8vIOaZrumAmuWcuu+8muS/neeVmVwi5pyA5L2OXCJcbiAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFwi5pyA5L2OIFwiICsgdGhpcy5fZm9ybWF0R29sZChtaW5WYWx1ZSkgKyBcIiBcIiArIGN1cnJlbmN5TmFtZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5L+u5q2j5L2N572u77ya5oyJ6ZKu5Zu+54mH5bqV6YOo5pyJ6LGG5a2Q5Zu+5qCH5Zyo5bem5L6n77yM5paH5a2X5bqU5pi+56S65Zyo5Zu+5qCH5Y+z5L6nXG4gICAgICAgIC8vIOaMiemSrumrmOW6piAzNzVweO+8jOW6lemDqOiTneiJsua4kOWPmOadoee6puWNoCAxLzTvvIjnuqblnKg3NSUtMTAwJeS9jee9ru+8iVxuICAgICAgICAvLyDlm77moIflnKjlupXpg6jlt6bkvqfnuqYxMCUtMjAl5a695bqm5L2N572u77yM5paH5a2X5bqU5YGP5Y+z5pi+56S6XG4gICAgICAgIHZhciBidG5IZWlnaHQgPSBidG5Ob2RlLmhlaWdodCB8fCAzNzU7XG4gICAgICAgIC8vIFnlnZDmoIfvvJrku47lupXpg6jovrnnvJjlkJHkuIrnuqYxNiXnmoTkvY3nva7vvIjlnKjmuJDlj5jmnaHlhoXvvIlcbiAgICAgICAgdmFyIHlPZmZzZXQgPSAtYnRuSGVpZ2h0LzIgKyBidG5IZWlnaHQgKiAwLjE2O1xuICAgICAgICAvLyBY5Z2Q5qCH77ya5bGF5Lit5pi+56S6XG4gICAgICAgIHZhciB4T2Zmc2V0ID0gMDsgIC8vIOWxheS4rVxuICAgICAgICBnb2xkTGFiZWxOb2RlLnNldFBvc2l0aW9uKHhPZmZzZXQsIHlPZmZzZXQpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5oi/6Ze05oyJ6ZKu54K55Ye75aSE55CGIC0g5qC55o2u5oi/6Ze057G75Z6L5Yy65YiG5aSE55CGXG4gICAgLy8gcm9vbV9jYXRlZ29yeTogMS3mma7pgJrlnLoo5qyi5LmQ6LGGKSwgMi3nq57mioDlnLoo56ue5oqA5biBKVxuICAgIF9vblJvb21CdXR0b25DbGljazogZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHJvb21DYXRlZ29yeSA9IHJvb21Db25maWcucm9vbV9jYXRlZ29yeSB8fCByb29tQ29uZmlnLnJvb21DYXRlZ29yeSB8fCAxO1xuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw6LSn5biB5pi+56S6XG4gICAgICAgIHRoaXMuX2N1cnJlbnRSb29tQ2F0ZWdvcnkgPSByb29tQ2F0ZWdvcnk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUN1cnJlbmN5RGlzcGxheSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u5oi/6Ze057G75Z6L5aSE55CGXG4gICAgICAgIGlmIChyb29tQ2F0ZWdvcnkgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIOernuaKgOWcuuaIv+mXtCAtIOaYvuekuuaKpeWQjeW8ueeql1xuICAgICAgICAgICAgdGhpcy5fb25BcmVuYVJvb21CdXR0b25DbGljayhyb29tQ29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOaZrumAmuWcuuaIv+mXtCAtIOWOn+aciemAu+i+kVxuICAgICAgICAgICAgdGhpcy5fb25Ob3JtYWxSb29tQnV0dG9uQ2xpY2socm9vbUNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOaZrumAmuWcuuaIv+mXtOaMiemSrueCueWHu+WkhOeQhlxuICAgIF9vbk5vcm1hbFJvb21CdXR0b25DbGljazogZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHBsYXllckdvbGQgPSBteWdsb2JhbCAmJiBteWdsb2JhbC5wbGF5ZXJEYXRhID8gbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA6IDA7XG4gICAgICAgIFxuICAgICAgICB2YXIgbWluR29sZCA9IHJvb21Db25maWcubWluX2dvbGQgfHwgcm9vbUNvbmZpZy5taW5Hb2xkIHx8IDA7XG4gICAgICAgIHZhciBtYXhHb2xkID0gcm9vbUNvbmZpZy5tYXhfZ29sZCB8fCByb29tQ29uZmlnLm1heEdvbGQgfHwgMDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwbGF5ZXJHb2xkIDwgbWluR29sZCkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0FkUmV3YXJkRGlhbG9nKCdnb2xkJywgbWluR29sZCAtIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAobWF4R29sZCA+IDAgJiYgcGxheWVyR29sZCA+IG1heEdvbGQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi5qyi5LmQ6LGG6LaF6L+H5LiK6ZmQ77yM6K+35YmN5b6A5pu06auY57qn5oi/6Ze0XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDkv53lrZjlvZPliY3miL/pl7TphY3nva5cbiAgICAgICAgaWYgKG15Z2xvYmFsKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5jdXJyZW50Um9vbUNvbmZpZyA9IHJvb21Db25maWc7XG4gICAgICAgICAgICBteWdsb2JhbC5jdXJyZW50Um9vbUxldmVsID0gcm9vbUNvbmZpZy5yb29tX3R5cGU7XG4gICAgICAgICAgICBteWdsb2JhbC5jdXJyZW50Um9vbU5hbWUgPSByb29tQ29uZmlnLnJvb21fbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g55u05o6l5b+r6YCf5Yy56YWN6L+b5YWl5ri45oiPXG4gICAgICAgIHRoaXMuX3F1aWNrTWF0Y2gocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDnq57mioDlnLrmiL/pl7TmjInpkq7ngrnlh7vlpITnkIYgLSDnm7TmjqXmiqXlkI3vvIjkuI3lvLnmoYbvvIlcbiAgICBfb25BcmVuYVJvb21CdXR0b25DbGljazogZnVuY3Rpb24ocm9vbUNvbmZpZywgYnRuTm9kZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suaKpeWQjVxuICAgICAgICB2YXIgcm9vbUlkID0gcm9vbUNvbmZpZy5pZDtcbiAgICAgICAgaWYgKHdpbmRvdy5hcmVuYURhdGEgJiYgd2luZG93LmFyZW5hRGF0YS5pc1NpZ25lZFVwKHJvb21JZCkpIHtcbiAgICAgICAgICAgIC8vIOW3suaKpeWQje+8jOS4jeWBmuWkhOeQhlxuICAgICAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLmgqjlt7LmiqXlkI3mraTnq57mioDlnLpcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suaKpeWQjeWFtuS7luernuaKgOWcuu+8iOWInee6p+OAgeS4ree6p+OAgemrmOe6p+WcuuWPquiDveaKpeS4gOS4qu+8iVxuICAgICAgICBpZiAod2luZG93LmFyZW5hRGF0YSAmJiB0aGlzLl9oYXNTaWduZWRVcE90aGVyQXJlbmEocm9vbUlkKSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLmgqjlt7LmiqXlkI3lhbbku5bnq57mioDlnLrvvIzmr4/lnLrlj6rog73miqXlkI3kuIDkuKrnuqfliKtcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkuI3kvb/nlKjmnKzlnLDnvJPlrZjnmoTnq57mioDluIHkvZnpop3liKTmlq3vvIznm7TmjqXosIPnlKjmnI3liqHnq6/miqXlkI1BUElcbiAgICAgICAgLy8g5Y6f5Zug77ya5ZCO5Y+w5re75Yqg56ue5oqA5biB5ZCO77yM5a6i5oi356uv5pys5Zyw57yT5a2Y55qE5YC85rKh5pyJ5pu05paw77yM5Lya5a+86Ie06K+v5YikXG4gICAgICAgIC8vIOacjeWKoeerr+S8muajgOafpeernuaKgOW4geS9memineW5tui/lOWbnuivpue7humUmeivr+S/oeaBr1xuICAgICAgICBcbiAgICAgICAgLy8g55u05o6l5omn6KGM5oql5ZCNXG4gICAgICAgIHRoaXMuX2RvQXJlbmFTaWdudXAocm9vbUNvbmZpZywgYnRuTm9kZSk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDmo4Dmn6XmmK/lkKblt7LmiqXlkI3lhbbku5bnq57mioDlnLrvvIjliJ3nuqfjgIHkuK3nuqfjgIHpq5jnuqflnLrlj6rog73miqXkuIDkuKrvvIlcbiAgICBfaGFzU2lnbmVkVXBPdGhlckFyZW5hOiBmdW5jdGlvbihjdXJyZW50Um9vbUlkKSB7XG4gICAgICAgIGlmICghd2luZG93LmFyZW5hRGF0YSB8fCAhdGhpcy5fYXJlbmFSb29tcykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcmVuYVJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm9vbSA9IHRoaXMuX2FyZW5hUm9vbXNbaV07XG4gICAgICAgICAgICB2YXIgcm9vbUlkID0gcm9vbS5jb25maWcuaWQ7XG4gICAgICAgICAgICBpZiAocm9vbUlkICE9PSBjdXJyZW50Um9vbUlkICYmIHdpbmRvdy5hcmVuYURhdGEuaXNTaWduZWRVcChyb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgXG4gICAgLy8g55u05o6l5omn6KGM56ue5oqA5Zy65oql5ZCN77yI5LiN5by55qGG77yJXG4gICAgX2RvQXJlbmFTaWdudXA6IGZ1bmN0aW9uKHJvb21Db25maWcsIGJ0bk5vZGUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g5pi+56S65Yqg6L295LitXG4gICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi5q2j5Zyo5oql5ZCNLi4uXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8g6LCD55So5oql5ZCNQVBJXG4gICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhKSB7XG4gICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLnNpZ251cChyb29tQ29uZmlnLmlkLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoZXJyIHx8IFwi5oql5ZCN5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOaKpeWQjeaIkOWKn1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5oql5ZCN5oiQ5Yqf77yBXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWIt+aWsOeOqeWutuS9meminVxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhLnJlZnJlc2hCYWxhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hcmVuYURhdGEucmVmcmVzaEJhbGFuY2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYVNpZ251cFN0YXR1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOS4uuernuaKgOWcuuaIv+mXtOa3u+WKoOaKpeWQjeaMiemSru+8iOS9v+eUqOWbvueJh+i1hOa6kO+8iVxuICAgIC8vIOaKpeWQjeaMiemSruaUvuWcqOaIv+mXtOWNoeeJh+eahOWklumDqOS4i+aWue+8jOe0p+i0tOWNoeeJh+W6lemDqFxuICAgIF9hZGRBcmVuYVNpZ251cEJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5fYXJlbmFSb29tcykgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W5Y2h54mH5a655ZmoXG4gICAgICAgIHZhciBjYXJkUGFuZWwgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJDYXJkQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoIWNhcmRQYW5lbCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQ2FyZENvbnRhaW5lciBub3QgZm91bmRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4heeQhuaXp+eahOaKpeWQjeaMiemSruWSjOWAkuiuoeaXtuaYvuekulxuICAgICAgICB2YXIgb2xkQnV0dG9ucyA9IGNhcmRQYW5lbC5nZXRDaGlsZEJ5TmFtZShcIkFyZW5hU2lnbnVwQnV0dG9uc1wiKTtcbiAgICAgICAgaWYgKG9sZEJ1dHRvbnMpIG9sZEJ1dHRvbnMuZGVzdHJveSgpO1xuICAgICAgICB2YXIgb2xkVGltZXJzID0gY2FyZFBhbmVsLmdldENoaWxkQnlOYW1lKFwiQXJlbmFDb3VudGRvd25zXCIpO1xuICAgICAgICBpZiAob2xkVGltZXJzKSBvbGRUaW1lcnMuZGVzdHJveSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65oql5ZCN5oyJ6ZKu5a655ZmoXG4gICAgICAgIHZhciBidXR0b25Db250YWluZXIgPSBuZXcgY2MuTm9kZShcIkFyZW5hU2lnbnVwQnV0dG9uc1wiKTtcbiAgICAgICAgYnV0dG9uQ29udGFpbmVyLnBhcmVudCA9IGNhcmRQYW5lbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuWAkuiuoeaXtuaYvuekuuWuueWZqFxuICAgICAgICB2YXIgY291bnRkb3duQ29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJBcmVuYUNvdW50ZG93bnNcIik7XG4gICAgICAgIGNvdW50ZG93bkNvbnRhaW5lci5wYXJlbnQgPSBjYXJkUGFuZWw7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FyZW5hUm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gdGhpcy5fYXJlbmFSb29tc1tpXTtcbiAgICAgICAgICAgIHZhciBidG5Ob2RlID0gcm9vbS5ub2RlO1xuICAgICAgICAgICAgdmFyIGNvbmZpZyA9IHJvb20uY29uZmlnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAgIC8vIOOAkOmHjeaehOOAkeWIm+W7uuernuaKgOWcuueKtuaAgemhuSAtIOWNleS4gOiDjOaZr+e7k+aehFxuICAgICAgICAgICAgLy8g57uT5p6EOiBSb29tU3RhdHVzSXRlbSA+IFtCZywgVGl0bGVMYWJlbCwgRGVzY0xhYmVsXVxuICAgICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOeKtuaAgeagj+WwuuWvuO+8iOeUqOaIt+aMh+Wumu+8iVxuICAgICAgICAgICAgdmFyIHN0YXR1c0JhckhlaWdodCA9IDcyOyAgICAgIC8vIOeKtuaAgeagj+aAu+mrmOW6plxuICAgICAgICAgICAgdmFyIGl0ZW1XaWR0aCA9IDE4MDsgICAgICAgICAgIC8vIOavj+S4queKtuaAgemhueWuveW6plxuICAgICAgICAgICAgdmFyIGl0ZW1IZWlnaHQgPSA1NDsgICAgICAgICAgIC8vIOavj+S4queKtuaAgemhuemrmOW6plxuICAgICAgICAgICAgdmFyIGl0ZW1HYXAgPSAxMjsgICAgICAgICAgICAgIC8vIOmXtOi3nVxuICAgICAgICAgICAgdmFyIGxlZnRSaWdodE1hcmdpbiA9IDI0OyAgICAgIC8vIOW3puWPs+eVmeeZvVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDog4zmma/lsLrlr7ggLSDmloflrZfmoYblrr3luqblj6rpgILphY3mloflrZflhoXlrrkr6YCC5b2T5YaF6L656LedXG4gICAgICAgICAgICAvLyBcIuaKpeWQjeaIquatoiBISDpNTVwiIOe6pjEy5Liq5a2X56ymKDE2cHjlrZfkvZMp57qmOTZweO+8jOWKoOS4iuW3puWPs+WGhei+uei3nVxuICAgICAgICAgICAgdmFyIGJnV2lkdGggPSAxNjA7ICAgICAgICAgICAgICAgICAgIC8vIOWuveW6pjogMTYwcHjvvIzpgILphY3mloflrZfmmL7npLpcbiAgICAgICAgICAgIHZhciBiZ0hlaWdodCA9IDcyOyAgICAgICAgICAgICAgICAgICAvLyDpq5jluqY6IDcy77yI5Lik6KGM5paH5a2X6ZyA6KaB5pu06auY77yJXG4gICAgICAgICAgICB2YXIgYmdSYWRpdXMgPSA1OyAgICAgICAgICAgICAgICAgICAgLy8g5ZyG6KeSOiA1XG4gICAgICAgICAgICB2YXIgYmdDb2xvciA9IGNjLmNvbG9yKDI1NSwgMTgwLCAxMDAsIDE0MCk7ICAvLyDpopzoibI6IOa3oeapmOiJsiwg5pu06YCP5piOKGFscGhhPTE0MClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu654q25oCB6aG55a655Zmo77yIUm9vbVN0YXR1c0l0ZW3vvIlcbiAgICAgICAgICAgIHZhciByb29tU3RhdHVzSXRlbSA9IG5ldyBjYy5Ob2RlKFwiUm9vbVN0YXR1c0l0ZW1fXCIgKyBjb25maWcuaWQpO1xuICAgICAgICAgICAgcm9vbVN0YXR1c0l0ZW0uc2V0Q29udGVudFNpemUoY2Muc2l6ZShidG5Ob2RlLndpZHRoLCBiZ0hlaWdodCkpO1xuICAgICAgICAgICAgcm9vbVN0YXR1c0l0ZW0uYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIHJvb21TdGF0dXNJdGVtLmFuY2hvclkgPSAwLjU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS9jee9ru+8muebuOWvueS6juaIv+mXtOWNoeeJh+WxheS4reWvuem9kO+8jOaYvuekuuWcqOWNoeeJh+mhtumDqFxuICAgICAgICAgICAgcm9vbVN0YXR1c0l0ZW0ueCA9IGJ0bk5vZGUueDsgIC8vIOawtOW5s+WxheS4rVxuICAgICAgICAgICAgcm9vbVN0YXR1c0l0ZW0ueSA9IGJ0bk5vZGUueSArIGJ0bk5vZGUuaGVpZ2h0IC8gMiAtIGJnSGVpZ2h0IC8gMiArIDEwOyAgLy8g5Z6C55u05L2N572u77ya5Y2h54mH6aG26YOoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWtmOWCqOmFjee9ruW8leeUqFxuICAgICAgICAgICAgcm9vbVN0YXR1c0l0ZW0ucm9vbUNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgICAgIHJvb21TdGF0dXNJdGVtLmNhcmROb2RlID0gYnRuTm9kZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gPT09PT09PT09PSAxLiDnu5jliLbllK/kuIDog4zmma/vvIhCZ++8iT09PT09PT09PT1cbiAgICAgICAgICAgIC8vIOWIoOmZpOS6hjogT3V0ZXJCZywgSW5uZXJCZywgQ2Fwc3VsZUJnIC0g5Y+q5L+d55WZ5LiA5LiqQmdcbiAgICAgICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpO1xuICAgICAgICAgICAgdmFyIGJnR3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgICAgIGJnR3JhcGhpY3MuZmlsbENvbG9yID0gYmdDb2xvcjtcbiAgICAgICAgICAgIGJnR3JhcGhpY3Mucm91bmRSZWN0KC1iZ1dpZHRoLzIsIC1iZ0hlaWdodC8yLCBiZ1dpZHRoLCBiZ0hlaWdodCwgYmdSYWRpdXMpO1xuICAgICAgICAgICAgYmdHcmFwaGljcy5maWxsKCk7XG4gICAgICAgICAgICBiZ05vZGUucGFyZW50ID0gcm9vbVN0YXR1c0l0ZW07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vID09PT09PT09PT0gMi4g56ys5LiA6KGM5paH5a2X77ya5pyf5Y+377yIUGVyaW9kTGFiZWzvvIk9PT09PT09PT09XG4gICAgICAgICAgICB2YXIgcGVyaW9kTGFiZWwgPSBuZXcgY2MuTm9kZShcIlBlcmlvZExhYmVsXCIpO1xuICAgICAgICAgICAgdmFyIHBlcmlvZExhYmVsQ29tcCA9IHBlcmlvZExhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBwZXJpb2RMYWJlbENvbXAuc3RyaW5nID0gXCLmnJ/lj7c6IC0tXCI7XG4gICAgICAgICAgICBwZXJpb2RMYWJlbENvbXAuZm9udFNpemUgPSAxNjtcbiAgICAgICAgICAgIHBlcmlvZExhYmVsQ29tcC5saW5lSGVpZ2h0ID0gMjA7XG4gICAgICAgICAgICBwZXJpb2RMYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgIHBlcmlvZExhYmVsQ29tcC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBwZXJpb2RMYWJlbENvbXAuZW5hYmxlQm9sZCA9IHRydWU7ICAvLyDliqDnspdcbiAgICAgICAgICAgIHBlcmlvZExhYmVsLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7ICAvLyDnmb3oibJcbiAgICAgICAgICAgIHBlcmlvZExhYmVsLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICBwZXJpb2RMYWJlbC5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgcGVyaW9kTGFiZWwueSA9IDE0OyAgLy8g5LiK5pa55L2N572u77yI5aKe5Yqg6Ze06Led77yJXG4gICAgICAgICAgICBwZXJpb2RMYWJlbC5wYXJlbnQgPSByb29tU3RhdHVzSXRlbTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5o+P6L65OiAjOEE0MjAwLCDlrr3luqYyXG4gICAgICAgICAgICB2YXIgcGVyaW9kT3V0bGluZSA9IHBlcmlvZExhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xuICAgICAgICAgICAgcGVyaW9kT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDEzOCwgNjYsIDApOyAgLy8gIzhBNDIwMFxuICAgICAgICAgICAgcGVyaW9kT3V0bGluZS53aWR0aCA9IDI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vID09PT09PT09PT0gMy4g56ys5LqM6KGM5paH5a2X77ya5oql5ZCN5oiq5q2i5pe26Ze077yIVGl0bGVMYWJlbO+8iT09PT09PT09PT1cbiAgICAgICAgICAgIHZhciB0aXRsZUxhYmVsID0gbmV3IGNjLk5vZGUoXCJUaXRsZUxhYmVsXCIpO1xuICAgICAgICAgICAgdmFyIHRpdGxlTGFiZWxDb21wID0gdGl0bGVMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgdGl0bGVMYWJlbENvbXAuc3RyaW5nID0gXCLmmoLmnKrlvIDmlL5cIjtcbiAgICAgICAgICAgIHRpdGxlTGFiZWxDb21wLmZvbnRTaXplID0gMTY7XG4gICAgICAgICAgICB0aXRsZUxhYmVsQ29tcC5saW5lSGVpZ2h0ID0gMjA7XG4gICAgICAgICAgICB0aXRsZUxhYmVsQ29tcC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICAgICAgdGl0bGVMYWJlbENvbXAudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xuICAgICAgICAgICAgdGl0bGVMYWJlbENvbXAuZW5hYmxlQm9sZCA9IHRydWU7ICAvLyDliqDnspdcbiAgICAgICAgICAgIHRpdGxlTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTsgIC8vIOeZveiJslxuICAgICAgICAgICAgdGl0bGVMYWJlbC5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgdGl0bGVMYWJlbC5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgdGl0bGVMYWJlbC55ID0gLTE0OyAgLy8g5LiL5pa55L2N572u77yI5aKe5Yqg6Ze06Led77yJXG4gICAgICAgICAgICB0aXRsZUxhYmVsLnBhcmVudCA9IHJvb21TdGF0dXNJdGVtO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmj4/ovrk6ICM4QTQyMDAsIOWuveW6pjJcbiAgICAgICAgICAgIHZhciB0aXRsZU91dGxpbmUgPSB0aXRsZUxhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xuICAgICAgICAgICAgdGl0bGVPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMTM4LCA2NiwgMCk7ICAvLyAjOEE0MjAwXG4gICAgICAgICAgICB0aXRsZU91dGxpbmUud2lkdGggPSAyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByb29tU3RhdHVzSXRlbS5wYXJlbnQgPSBjb3VudGRvd25Db250YWluZXI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgICAgLy8g5Yib5bu65oql5ZCN5oyJ6ZKuXG4gICAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAgIHZhciBzaWdudXBCdG4gPSBuZXcgY2MuTm9kZShcIlNpZ251cEJ0bl9cIiArIGNvbmZpZy5pZCk7XG5cbiAgICAgICAgICAgIC8vIOa3u+WKoCBTcHJpdGUg57uE5Lu255So5LqO5pi+56S65oyJ6ZKu5Zu+54mHXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gc2lnbnVwQnRuLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgc3ByaXRlLnR5cGUgPSBjYy5TcHJpdGUuVHlwZS5TSU1QTEU7XG4gICAgICAgICAgICBzcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuXG4gICAgICAgICAgICAvLyDmjInpkq7lsLrlr7jvvJoxNjB4NjVcbiAgICAgICAgICAgIHZhciBmaXhlZFdpZHRoID0gMTYwOyAgIC8vIOWuveW6plxuICAgICAgICAgICAgdmFyIGZpeGVkSGVpZ2h0ID0gNjU7ICAgLy8g6auY5bqmXG4gICAgICAgICAgICBzaWdudXBCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZShmaXhlZFdpZHRoLCBmaXhlZEhlaWdodCkpO1xuICAgICAgICAgICAgc2lnbnVwQnRuLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICBzaWdudXBCdG4uYW5jaG9yWSA9IDAuNTtcblxuICAgICAgICAgICAgLy8g5L2N572u77ya5oyJ6ZKu5Zyo5Y2h54mH5bqV6YOo77yM5ZCR5LiL56e75YqoXG4gICAgICAgICAgICBzaWdudXBCdG4ueCA9IGJ0bk5vZGUueDtcbiAgICAgICAgICAgIHNpZ251cEJ0bi55ID0gYnRuTm9kZS55IC0gYnRuTm9kZS5oZWlnaHQgLyAyICsgZml4ZWRIZWlnaHQgLyAyIC0gMTA7ICAvLyDlkJHkuIvnp7vliqgxMHB4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWtmOWCqOmFjee9ruS/oeaBr+WSjOWNoeeJh+iKgueCueW8leeUqFxuICAgICAgICAgICAgc2lnbnVwQnRuLnJvb21Db25maWcgPSBjb25maWc7XG4gICAgICAgICAgICBzaWdudXBCdG4ucm9vbUlkID0gY29uZmlnLmlkO1xuICAgICAgICAgICAgc2lnbnVwQnRuLmNhcmROb2RlID0gYnRuTm9kZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5re75Yqg5oyJ6ZKu57uE5Lu2XG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gc2lnbnVwQnRuLmFkZENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICAgICAgYnV0dG9uLnRyYW5zaXRpb24gPSBjYy5CdXR0b24uVHJhbnNpdGlvbi5TQ0FMRTtcbiAgICAgICAgICAgIGJ1dHRvbi5kdXJhdGlvbiA9IDAuMTtcbiAgICAgICAgICAgIGJ1dHRvbi56b29tU2NhbGUgPSAxLjA4O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDngrnlh7vkuovku7ZcbiAgICAgICAgICAgIChmdW5jdGlvbihjb25maWcsIGNhcmROb2RlLCBzaWdudXBCdG5Ob2RlKSB7XG4gICAgICAgICAgICAgICAgc2lnbnVwQnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbkFyZW5hU2lnbnVwQnV0dG9uQ2xpY2soY29uZmlnLCBjYXJkTm9kZSwgc2lnbnVwQnRuTm9kZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KShjb25maWcsIGJ0bk5vZGUsIHNpZ251cEJ0bik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpZ251cEJ0bi5wYXJlbnQgPSBidXR0b25Db250YWluZXI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaJqeWxleWuueWZqOmrmOW6puS7peWuuee6s+aMiemSrlxuICAgICAgICB2YXIgb3JpZ2luYWxIZWlnaHQgPSBjYXJkUGFuZWwuaGVpZ2h0O1xuICAgICAgICBjYXJkUGFuZWwuc2V0Q29udGVudFNpemUoY2FyZFBhbmVsLndpZHRoLCBvcmlnaW5hbEhlaWdodCArIDcwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWKoOi9veaMiemSruWbvueJh+W5tuabtOaWsOeKtuaAgVxuICAgICAgICB0aGlzLl9sb2FkU2lnbnVwQnV0dG9uSW1hZ2VzKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDlkK/liqjlgJLorqHml7bmm7TmlrDlrprml7blmahcbiAgICAgICAgdGhpcy5fc3RhcnRDb3VudGRvd25UaW1lcigpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yqg6L295oql5ZCN5oyJ6ZKu5Zu+54mH6LWE5rqQXG4gICAgX2xvYWRTaWdudXBCdXR0b25JbWFnZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyDpooTliqDovb3kuInlvKDmjInpkq7lm77niYdcbiAgICAgICAgdmFyIGltYWdlUGF0aHMgPSBbXG4gICAgICAgICAgICAnVUkvYnV0dG9uL2J0bl9iYW9taW5nJyxcbiAgICAgICAgICAgICdVSS9idXR0b24vYnRuX3F1eGlhb2Jhb21pbmcnLCBcbiAgICAgICAgICAgICdVSS9idXR0b24vYnRuX25vX2Jhb21pbmcnXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9zaWdudXBCdG5GcmFtZXMgPSB7fTtcbiAgICAgICAgdmFyIGxvYWRlZENvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoaW1hZ2VQYXRoc1tpbmRleF0sIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gaW1hZ2VQYXRoc1tpbmRleF0uc3BsaXQoJy8nKS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3NpZ251cEJ0bkZyYW1lc1trZXldID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9hZGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgLy8g5omA5pyJ5Zu+54mH5Yqg6L295a6M5oiQ5ZCO5pu05paw5oyJ6ZKu54q25oCBXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkZWRDb3VudCA9PT0gaW1hZ2VQYXRocy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUFyZW5hU2lnbnVwU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKGkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDmo4Dmn6XlvZPliY3mmK/lkKblnKjlvIDotZvml7bpl7TmrrXlhoVcbiAgICBfaXNJbk1hdGNoVGltZTogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIHZhciBtYXRjaFRpbWVSYW5nZXMgPSBjb25maWcubWF0Y2hfdGltZV9yYW5nZXMgfHwgY29uZmlnLm1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgaWYgKCFtYXRjaFRpbWVSYW5nZXMpIHJldHVybiB0cnVlOyAvLyDmsqHmnInphY3nva7ml7bpl7TmrrXvvIzpu5jorqTlvIDmlL5cblxuICAgICAgICAvLyDop6PmnpDml7bpl7TmrrUgSlNPTlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHJhbmdlcyA9IHR5cGVvZiBtYXRjaFRpbWVSYW5nZXMgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShtYXRjaFRpbWVSYW5nZXMpIDogbWF0Y2hUaW1lUmFuZ2VzO1xuICAgICAgICAgICAgaWYgKCFyYW5nZXMgfHwgcmFuZ2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNaW51dGVzID0gbm93LmdldEhvdXJzKCkgKiA2MCArIG5vdy5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFBhcnRzID0gcmFuZ2Uuc3RhcnQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kUGFydHMgPSByYW5nZS5lbmQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRNaW51dGVzID0gcGFyc2VJbnQoc3RhcnRQYXJ0c1swXSkgKiA2MCArIHBhcnNlSW50KHN0YXJ0UGFydHNbMV0pO1xuICAgICAgICAgICAgICAgIHZhciBlbmRNaW51dGVzID0gcGFyc2VJbnQoZW5kUGFydHNbMF0pICogNjAgKyBwYXJzZUludChlbmRQYXJ0c1sxXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE1pbnV0ZXMgPj0gc3RhcnRNaW51dGVzICYmIGN1cnJlbnRNaW51dGVzIDw9IGVuZE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+VkCBbX2lzSW5NYXRjaFRpbWVdIHBhcnNlIGVycm9yOlwiLCBlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyDop6PmnpDlpLHotKXvvIzpu5jorqTlvIDmlL5cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5byA6LWb5pe26Ze06K6h566X55u45YWz5Ye95pWwXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLy8g5qOA5p+l56ue5oqA5Zy65piv5ZCm5Y+v5Lul5oql5ZCN77yI5b+F6aG75pyJ5byA6LWb5pe26Ze05LiU5pyJ5q+P5Zy65pe26ZW/77yJXG4gICAgX2NhblNpZ251cEFyZW5hOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgdmFyIG1hdGNoVGltZVJhbmdlcyA9IGNvbmZpZy5tYXRjaF90aW1lX3JhbmdlcyB8fCBjb25maWcubWF0Y2hUaW1lUmFuZ2VzO1xuICAgICAgICB2YXIgbWF0Y2hEdXJhdGlvbiA9IGNvbmZpZy5tYXRjaF9kdXJhdGlvbiB8fCBjb25maWcubWF0Y2hEdXJhdGlvbiB8fCBjb25maWcuaW50ZXJ2YWxfbWludXRlcyB8fCBjb25maWcuaW50ZXJ2YWxNaW51dGVzO1xuXG4gICAgICAgIC8vIOW/hemhu+WQjOaXtuacieW8gOi1m+aXtumXtOWSjOavj+WcuuaXtumVv+aJjeiDveaKpeWQjVxuICAgICAgICBpZiAoIW1hdGNoVGltZVJhbmdlcyB8fCAhbWF0Y2hEdXJhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5Zyo5byA6LWb5pe26Ze05q615YaFXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9pc0luTWF0Y2hUaW1lKGNvbmZpZyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8vIOiuoeeul+S4i+S4gOS4quaKpeWQjeaIquatouaXtumXtFxuICAgIC8vIOi/lOWbnuagvOW8jzogXCJISDpNTVwiIOaIliBudWxs77yI5aaC5p6c5LiN5Zyo5byA6LWb5pe26Ze05q615YaF77yJXG4gICAgX2dldE5leHRTaWdudXBEZWFkbGluZTogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIHZhciBtYXRjaFRpbWVSYW5nZXMgPSBjb25maWcubWF0Y2hfdGltZV9yYW5nZXMgfHwgY29uZmlnLm1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgdmFyIG1hdGNoRHVyYXRpb24gPSBjb25maWcubWF0Y2hfZHVyYXRpb24gfHwgY29uZmlnLm1hdGNoRHVyYXRpb24gfHwgY29uZmlnLmludGVydmFsX21pbnV0ZXMgfHwgY29uZmlnLmludGVydmFsTWludXRlcztcblxuICAgICAgICAvLyDlv4XpobvmnInphY3nva5cbiAgICAgICAgaWYgKCFtYXRjaFRpbWVSYW5nZXMgfHwgIW1hdGNoRHVyYXRpb24pIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuWcqOW8gOi1m+aXtumXtOauteWGhVxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5NYXRjaFRpbWUoY29uZmlnKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByYW5nZXMgPSB0eXBlb2YgbWF0Y2hUaW1lUmFuZ2VzID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UobWF0Y2hUaW1lUmFuZ2VzKSA6IG1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgICAgIGlmICghcmFuZ2VzIHx8IHJhbmdlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWludXRlcyA9IG5vdy5nZXRIb3VycygpICogNjAgKyBub3cuZ2V0TWludXRlcygpO1xuXG4gICAgICAgICAgICAvLyDmib7liLDlvZPliY3miYDlnKjnmoTml7bpl7TmrrVcbiAgICAgICAgICAgIHZhciBjdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgdmFyIHJhbmdlU3RhcnRNaW51dGVzID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFBhcnRzID0gcmFuZ2Uuc3RhcnQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kUGFydHMgPSByYW5nZS5lbmQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRNaW4gPSBwYXJzZUludChzdGFydFBhcnRzWzBdKSAqIDYwICsgcGFyc2VJbnQoc3RhcnRQYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgdmFyIGVuZE1pbiA9IHBhcnNlSW50KGVuZFBhcnRzWzBdKSAqIDYwICsgcGFyc2VJbnQoZW5kUGFydHNbMV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRNaW51dGVzID49IHN0YXJ0TWluICYmIGN1cnJlbnRNaW51dGVzIDw9IGVuZE1pbikge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2VTdGFydE1pbnV0ZXMgPSBzdGFydE1pbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRSYW5nZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIC8vIOiuoeeul+S4i+S4gOWcuuavlOi1m+aXtumXtO+8iOS7juW8gOi1m+aXtumXtOW8gOWni++8jOavj+malCBtYXRjaER1cmF0aW9uIOWIhumSn+S4gOWcuu+8iVxuICAgICAgICAgICAgLy8g5oql5ZCN5oiq5q2i5pe26Ze05piv5q+U6LWb5byA5aeL5YmNMeWIhumSn1xuICAgICAgICAgICAgdmFyIG1pbnV0ZXNTaW5jZVN0YXJ0ID0gY3VycmVudE1pbnV0ZXMgLSByYW5nZVN0YXJ0TWludXRlcztcbiAgICAgICAgICAgIHZhciByZW1haW5kZXIgPSBtaW51dGVzU2luY2VTdGFydCAlIG1hdGNoRHVyYXRpb247XG5cbiAgICAgICAgICAgIHZhciBuZXh0TWF0Y2hNaW51dGVzO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmRlciA+PSBtYXRjaER1cmF0aW9uIC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIOW9k+WJjeWcqOaKpeWQjeaIquatouaXtumXtOWGhe+8jOS4i+S4gOWcuuaYr+S4i+S4gOS4quaXtumXtOeCuVxuICAgICAgICAgICAgICAgIG5leHRNYXRjaE1pbnV0ZXMgPSBjdXJyZW50TWludXRlcyArIChtYXRjaER1cmF0aW9uIC0gcmVtYWluZGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5b2T5YmN5Y+v5Lul5oql5ZCN77yM5LiL5LiA5Zy65piv5b2T5YmN5pe26Ze054K55ZCR5LiK5Y+W5pW0XG4gICAgICAgICAgICAgICAgbmV4dE1hdGNoTWludXRlcyA9IHJhbmdlU3RhcnRNaW51dGVzICsgTWF0aC5jZWlsKG1pbnV0ZXNTaW5jZVN0YXJ0IC8gbWF0Y2hEdXJhdGlvbikgKiBtYXRjaER1cmF0aW9uO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0TWF0Y2hNaW51dGVzIDw9IGN1cnJlbnRNaW51dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRNYXRjaE1pbnV0ZXMgKz0gbWF0Y2hEdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOaKpeWQjeaIquatouaXtumXtOaYr+avlOi1m+W8gOWni+WJjTHliIbpkp9cbiAgICAgICAgICAgIHZhciBkZWFkbGluZU1pbnV0ZXMgPSBuZXh0TWF0Y2hNaW51dGVzIC0gMTtcblxuICAgICAgICAgICAgLy8g5qC85byP5YyW5pe26Ze0XG4gICAgICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKGRlYWRsaW5lTWludXRlcyAvIDYwKSAlIDI0O1xuICAgICAgICAgICAgdmFyIG1pbnMgPSBkZWFkbGluZU1pbnV0ZXMgJSA2MDtcbiAgICAgICAgICAgIHZhciB0aW1lU3RyID0gKGhvdXJzIDwgMTAgPyAnMCcgOiAnJykgKyBob3VycyArICc6JyArIChtaW5zIDwgMTAgPyAnMCcgOiAnJykgKyBtaW5zO1xuICAgICAgICAgICAgcmV0dXJuIHRpbWVTdHI7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuKPsCBbX2dldE5leHRTaWdudXBEZWFkbGluZV0gZXJyb3I6XCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOiuoeeul+i3neemu+aKpeWQjeaIquatoueahOenkuaVsO+8iOeUqOS6juWAkuiuoeaXtuaYvuekuu+8iVxuICAgIC8vIOi/lOWbnjog56eS5pWw77yMLTHooajnpLrkuI3lj6/miqXlkI1cbiAgICBfZ2V0U2lnbnVwQ291bnRkb3duU2Vjb25kczogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIHZhciBtYXRjaFRpbWVSYW5nZXMgPSBjb25maWcubWF0Y2hfdGltZV9yYW5nZXMgfHwgY29uZmlnLm1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgdmFyIG1hdGNoRHVyYXRpb24gPSBjb25maWcubWF0Y2hfZHVyYXRpb24gfHwgY29uZmlnLm1hdGNoRHVyYXRpb24gfHwgY29uZmlnLmludGVydmFsX21pbnV0ZXMgfHwgY29uZmlnLmludGVydmFsTWludXRlcztcblxuICAgICAgICBpZiAoIW1hdGNoVGltZVJhbmdlcyB8fCAhbWF0Y2hEdXJhdGlvbikgcmV0dXJuIC0xO1xuICAgICAgICBpZiAoIXRoaXMuX2lzSW5NYXRjaFRpbWUoY29uZmlnKSkgcmV0dXJuIC0xO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2VzID0gdHlwZW9mIG1hdGNoVGltZVJhbmdlcyA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKG1hdGNoVGltZVJhbmdlcykgOiBtYXRjaFRpbWVSYW5nZXM7XG4gICAgICAgICAgICBpZiAoIXJhbmdlcyB8fCByYW5nZXMubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG5cbiAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNaW51dGVzID0gbm93LmdldEhvdXJzKCkgKiA2MCArIG5vdy5nZXRNaW51dGVzKCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNlY29uZHMgPSBub3cuZ2V0U2Vjb25kcygpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRUb3RhbFNlY29uZHMgPSBjdXJyZW50TWludXRlcyAqIDYwICsgY3VycmVudFNlY29uZHM7XG5cbiAgICAgICAgICAgIC8vIOaJvuWIsOW9k+WJjeaJgOWcqOeahOaXtumXtOautVxuICAgICAgICAgICAgdmFyIGN1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgICAgICAgICB2YXIgcmFuZ2VTdGFydE1pbnV0ZXMgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0UGFydHMgPSByYW5nZS5zdGFydC5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRQYXJ0cyA9IHJhbmdlLmVuZC5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydE1pbiA9IHBhcnNlSW50KHN0YXJ0UGFydHNbMF0pICogNjAgKyBwYXJzZUludChzdGFydFBhcnRzWzFdKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kTWluID0gcGFyc2VJbnQoZW5kUGFydHNbMF0pICogNjAgKyBwYXJzZUludChlbmRQYXJ0c1sxXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE1pbnV0ZXMgPj0gc3RhcnRNaW4gJiYgY3VycmVudE1pbnV0ZXMgPD0gZW5kTWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSYW5nZSA9IHJhbmdlO1xuICAgICAgICAgICAgICAgICAgICByYW5nZVN0YXJ0TWludXRlcyA9IHN0YXJ0TWluO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY3VycmVudFJhbmdlKSByZXR1cm4gLTE7XG5cbiAgICAgICAgICAgIC8vIOiuoeeul+S4i+S4gOWcuuavlOi1m+aXtumXtFxuICAgICAgICAgICAgdmFyIHJhbmdlU3RhcnRTZWNvbmRzID0gcmFuZ2VTdGFydE1pbnV0ZXMgKiA2MDtcbiAgICAgICAgICAgIHZhciBtYXRjaER1cmF0aW9uU2Vjb25kcyA9IG1hdGNoRHVyYXRpb24gKiA2MDtcbiAgICAgICAgICAgIHZhciBjdXJyZW50VG90YWxTZWNvbmRzID0gY3VycmVudE1pbnV0ZXMgKiA2MCArIGN1cnJlbnRTZWNvbmRzO1xuXG4gICAgICAgICAgICAvLyDorqHnrpfku47lvIDotZvml7bpl7TliLDnjrDlnKjnu4/ov4fnmoTnp5LmlbBcbiAgICAgICAgICAgIHZhciBlbGFwc2VkU2Vjb25kcyA9IGN1cnJlbnRUb3RhbFNlY29uZHMgLSByYW5nZVN0YXJ0U2Vjb25kcztcbiAgICAgICAgICAgIHZhciByZW1haW5kZXIgPSBlbGFwc2VkU2Vjb25kcyAlIG1hdGNoRHVyYXRpb25TZWNvbmRzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlgJLorqHml7YgPSDmnKzmnJ/liankvZnml7bpl7TvvIjkuI7mnI3liqHnq6/kuIDoh7TvvIzkuI3lh482MOenku+8iVxuICAgICAgICAgICAgdmFyIGNvdW50ZG93biA9IG1hdGNoRHVyYXRpb25TZWNvbmRzIC0gcmVtYWluZGVyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDov5Tlm57lgJLorqHml7ZcbiAgICAgICAgICAgIHJldHVybiBjb3VudGRvd247XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuKPsCBbX2dldFNpZ251cENvdW50ZG93blNlY29uZHNdIGVycm9yOlwiLCBlKTtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g6I635Y+W5pyA6L+R55qEIHVwY29taW5nIOW8gOi1m+aXtumXtOaute+8iOeUqOS6juaYvuekuu+8iVxuICAgIF9nZXROZWFyZXN0TWF0Y2hUaW1lUmFuZ2U6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICB2YXIgbWF0Y2hUaW1lUmFuZ2VzID0gY29uZmlnLm1hdGNoX3RpbWVfcmFuZ2VzIHx8IGNvbmZpZy5tYXRjaFRpbWVSYW5nZXM7XG4gICAgICAgIFxuICAgICAgICAvLyDmsqHmnInphY3nva7ml7bpl7TmrrXvvIzov5Tlm55udWxs6KGo56S65YWo5aSp5byA5pS+XG4gICAgICAgIGlmICghbWF0Y2hUaW1lUmFuZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByYW5nZXMgPSB0eXBlb2YgbWF0Y2hUaW1lUmFuZ2VzID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UobWF0Y2hUaW1lUmFuZ2VzKSA6IG1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgICAgIGlmICghcmFuZ2VzIHx8IHJhbmdlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWludXRlcyA9IG5vdy5nZXRIb3VycygpICogNjAgKyBub3cuZ2V0TWludXRlcygpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTZWNvbmRzID0gbm93LmdldFNlY29uZHMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6Kej5p6Q5omA5pyJ5pe26Ze05q61XG4gICAgICAgICAgICB2YXIgcGFyc2VkUmFuZ2VzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByYW5nZSA9IHJhbmdlc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRQYXJ0cyA9IHJhbmdlLnN0YXJ0LnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgdmFyIGVuZFBhcnRzID0gcmFuZ2UuZW5kLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0TWludXRlcyA9IHBhcnNlSW50KHN0YXJ0UGFydHNbMF0pICogNjAgKyBwYXJzZUludChzdGFydFBhcnRzWzFdKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kTWludXRlcyA9IHBhcnNlSW50KGVuZFBhcnRzWzBdKSAqIDYwICsgcGFyc2VJbnQoZW5kUGFydHNbMV0pO1xuICAgICAgICAgICAgICAgIHBhcnNlZFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHJhbmdlLmVuZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNaW51dGVzOiBzdGFydE1pbnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIGVuZE1pbnV0ZXM6IGVuZE1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5qOA5p+l5b2T5YmN5piv5ZCm5Zyo5p+Q5Liq5pe26Ze05q615YaFXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlZFJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByID0gcGFyc2VkUmFuZ2VzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50TWludXRlcyA+PSByLnN0YXJ0TWludXRlcyAmJiBjdXJyZW50TWludXRlcyA8PSByLmVuZE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluUmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5nZTogclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5LiN5Zyo5Lu75L2V5pe26Ze05q615YaF77yM5om+5pyA6L+R55qE5LiL5LiA5Liq5pe26Ze05q61XG4gICAgICAgICAgICB2YXIgbmVhcmVzdFJhbmdlID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBtaW5EaWZmID0gSW5maW5pdHk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VkUmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBwYXJzZWRSYW5nZXNbaV07XG4gICAgICAgICAgICAgICAgLy8g6K6h566X6Led56a76L+Z5Liq5pe26Ze05q615byA5aeL55qE5YiG6ZKf5pWwXG4gICAgICAgICAgICAgICAgdmFyIGRpZmY7XG4gICAgICAgICAgICAgICAgaWYgKHIuc3RhcnRNaW51dGVzID4gY3VycmVudE1pbnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5LuK5aSp6L+Y5rKh5YiwXG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPSByLnN0YXJ0TWludXRlcyAtIGN1cnJlbnRNaW51dGVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmcgOimgeetieWIsOaYjuWkqVxuICAgICAgICAgICAgICAgICAgICBkaWZmID0gKDI0ICogNjAgLSBjdXJyZW50TWludXRlcykgKyByLnN0YXJ0TWludXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPCBtaW5EaWZmKSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbkRpZmYgPSBkaWZmO1xuICAgICAgICAgICAgICAgICAgICBuZWFyZXN0UmFuZ2UgPSByO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpblJhbmdlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByYW5nZTogbmVhcmVzdFJhbmdlLFxuICAgICAgICAgICAgICAgIG1pbnV0ZXNVbnRpbFN0YXJ0OiBtaW5EaWZmXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g6K6h566X6Led56a75LiL5LiA5Zy65byA6LWb55qE5YCS6K6h5pe277yI56eS77yJXG4gICAgX2dldE5leHRNYXRjaENvdW50ZG93bjogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIHZhciBtYXRjaFRpbWVSYW5nZXMgPSBjb25maWcubWF0Y2hfdGltZV9yYW5nZXMgfHwgY29uZmlnLm1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgdmFyIG1hdGNoRHVyYXRpb24gPSBjb25maWcubWF0Y2hfZHVyYXRpb24gfHwgY29uZmlnLm1hdGNoRHVyYXRpb24gfHwgY29uZmlnLmludGVydmFsX21pbnV0ZXMgfHwgY29uZmlnLmludGVydmFsTWludXRlcyB8fCAxMDsgLy8g6buY6K6kMTDliIbpkp9cbiAgICAgICAgXG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB2YXIgY3VycmVudE1pbnV0ZXMgPSBub3cuZ2V0SG91cnMoKSAqIDYwICsgbm93LmdldE1pbnV0ZXMoKTtcbiAgICAgICAgdmFyIGN1cnJlbnRTZWNvbmRzID0gbm93LmdldFNlY29uZHMoKTtcbiAgICAgICAgdmFyIGN1cnJlbnRUb3RhbFNlY29uZHMgPSBjdXJyZW50TWludXRlcyAqIDYwICsgY3VycmVudFNlY29uZHM7XG4gICAgICAgIFxuICAgICAgICAvLyDmsqHmnInphY3nva7lvIDotZvml7bpl7TvvIzmr48gbWF0Y2hEdXJhdGlvbiDliIbpkp/lvIDotZvkuIDmrKFcbiAgICAgICAgaWYgKCFtYXRjaFRpbWVSYW5nZXMpIHtcbiAgICAgICAgICAgIC8vIOiuoeeul+i3neemu+S4i+S4gOS4qiBtYXRjaER1cmF0aW9uIOWRqOacn+eahOenkuaVsFxuICAgICAgICAgICAgdmFyIGludGVydmFsU2Vjb25kcyA9IG1hdGNoRHVyYXRpb24gKiA2MDtcbiAgICAgICAgICAgIHZhciBzZWNvbmRzSW5DeWNsZSA9IGN1cnJlbnRUb3RhbFNlY29uZHMgJSBpbnRlcnZhbFNlY29uZHM7XG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nU2Vjb25kcyA9IGludGVydmFsU2Vjb25kcyAtIHNlY29uZHNJbkN5Y2xlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGluTWF0Y2hUaW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY29uZHM6IHJlbWFpbmluZ1NlY29uZHMsXG4gICAgICAgICAgICAgICAgbWF0Y2hEdXJhdGlvbjogbWF0Y2hEdXJhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pyJ6YWN572u5byA6LWb5pe26Ze0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2VzID0gdHlwZW9mIG1hdGNoVGltZVJhbmdlcyA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKG1hdGNoVGltZVJhbmdlcykgOiBtYXRjaFRpbWVSYW5nZXM7XG4gICAgICAgICAgICBpZiAoIXJhbmdlcyB8fCByYW5nZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8g6Kej5p6Q5aSx6LSl77yM5L2/55So6buY6K6k6YC76L6RXG4gICAgICAgICAgICAgICAgdmFyIGludGVydmFsU2Vjb25kcyA9IG1hdGNoRHVyYXRpb24gKiA2MDtcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kc0luQ3ljbGUgPSBjdXJyZW50VG90YWxTZWNvbmRzICUgaW50ZXJ2YWxTZWNvbmRzO1xuICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmdTZWNvbmRzID0gaW50ZXJ2YWxTZWNvbmRzIC0gc2Vjb25kc0luQ3ljbGU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaW5NYXRjaFRpbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZHM6IHJlbWFpbmluZ1NlY29uZHMsXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoRHVyYXRpb246IG1hdGNoRHVyYXRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmo4Dmn6XlvZPliY3mmK/lkKblnKjmn5DkuKrlvIDotZvml7bpl7TmrrXlhoVcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFBhcnRzID0gcmFuZ2Uuc3RhcnQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kUGFydHMgPSByYW5nZS5lbmQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRNaW51dGVzID0gcGFyc2VJbnQoc3RhcnRQYXJ0c1swXSkgKiA2MCArIHBhcnNlSW50KHN0YXJ0UGFydHNbMV0pO1xuICAgICAgICAgICAgICAgIHZhciBlbmRNaW51dGVzID0gcGFyc2VJbnQoZW5kUGFydHNbMF0pICogNjAgKyBwYXJzZUludChlbmRQYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRNaW51dGVzID49IHN0YXJ0TWludXRlcyAmJiBjdXJyZW50TWludXRlcyA8PSBlbmRNaW51dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWcqOW8gOi1m+aXtumXtOauteWGhe+8jOiuoeeul+i3neemu+S4i+S4gOWcuueahOWAkuiuoeaXtlxuICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZ2VTdGFydFNlY29uZHMgPSBzdGFydE1pbnV0ZXMgKiA2MDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsYXBzZWRTZWNvbmRzID0gY3VycmVudFRvdGFsU2Vjb25kcyAtIHJhbmdlU3RhcnRTZWNvbmRzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW50ZXJ2YWxTZWNvbmRzID0gbWF0Y2hEdXJhdGlvbiAqIDYwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVtYWluZGVyID0gZWxhcHNlZFNlY29uZHMgJSBpbnRlcnZhbFNlY29uZHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmdTZWNvbmRzID0gaW50ZXJ2YWxTZWNvbmRzIC0gcmVtYWluZGVyO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluTWF0Y2hUaW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kczogcmVtYWluaW5nU2Vjb25kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoRHVyYXRpb246IG1hdGNoRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmFuZ2U6IHJhbmdlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkuI3lnKjku7vkvZXlvIDotZvml7bpl7TmrrXlhoVcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaW5NYXRjaFRpbWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNlY29uZHM6IDAsXG4gICAgICAgICAgICAgICAgbWF0Y2hEdXJhdGlvbjogbWF0Y2hEdXJhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbk1hdGNoVGltZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2Vjb25kczogMCxcbiAgICAgICAgICAgICAgICBtYXRjaER1cmF0aW9uOiBtYXRjaER1cmF0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDmoLzlvI/ljJblgJLorqHml7bmmL7npLrvvIjnp5LovazmjaLkuLogTU06U1Mg5qC85byP77yJXG4gICAgX2Zvcm1hdENvdW50ZG93bjogZnVuY3Rpb24odG90YWxTZWNvbmRzKSB7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgLyA2MCk7XG4gICAgICAgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgJSA2MCk7XG4gICAgICAgIHJldHVybiAobWludXRlcyA8IDEwID8gJzAnIDogJycpICsgbWludXRlcyArICc6JyArIChzZWNvbmRzIDwgMTAgPyAnMCcgOiAnJykgKyBzZWNvbmRzO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5qC85byP5YyW5byA6LWb5pe26Ze05q615pi+56S6XG4gICAgX2Zvcm1hdE1hdGNoVGltZVJhbmdlOiBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICBpZiAoIXJhbmdlKSByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiByYW5nZS5zdGFydCArICctJyArIHJhbmdlLmVuZDtcbiAgICB9LFxuICAgIFxuICAgIC8vIOiOt+WPluW9k+WJjeacn+WPt1xuICAgIC8vIOacn+WPt+agvOW8j++8muagueaNruW8gOi1m+aXtumXtOWSjOavj+WcuuaXtumVv+WKqOaAgeeUn+aIkFxuICAgIC8vIOavj+S4quaIv+mXtOacieeLrOeri+eahOacn+WPt+W6j+WIl1xuICAgIF9nZXRDdXJyZW50UGVyaW9kTm86IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICB2YXIgbWF0Y2hUaW1lUmFuZ2VzID0gY29uZmlnLm1hdGNoX3RpbWVfcmFuZ2VzIHx8IGNvbmZpZy5tYXRjaFRpbWVSYW5nZXM7XG4gICAgICAgIHZhciBtYXRjaER1cmF0aW9uID0gY29uZmlnLm1hdGNoX2R1cmF0aW9uIHx8IGNvbmZpZy5tYXRjaER1cmF0aW9uIHx8IGNvbmZpZy5pbnRlcnZhbF9taW51dGVzIHx8IGNvbmZpZy5pbnRlcnZhbE1pbnV0ZXMgfHwgNTtcblxuICAgICAgICBpZiAoIW1hdGNoVGltZVJhbmdlcyB8fCAhbWF0Y2hEdXJhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHJhbmdlcyA9IHR5cGVvZiBtYXRjaFRpbWVSYW5nZXMgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShtYXRjaFRpbWVSYW5nZXMpIDogbWF0Y2hUaW1lUmFuZ2VzO1xuICAgICAgICAgICAgaWYgKCFyYW5nZXMgfHwgcmFuZ2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG5cbiAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRNaW51dGVzID0gbm93LmdldEhvdXJzKCkgKiA2MCArIG5vdy5nZXRNaW51dGVzKCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNlY29uZHMgPSBub3cuZ2V0U2Vjb25kcygpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRUb3RhbFNlY29uZHMgPSBjdXJyZW50TWludXRlcyAqIDYwICsgY3VycmVudFNlY29uZHM7XG5cbiAgICAgICAgICAgIC8vIOaJvuWIsOW9k+WJjeaJgOWcqOeahOaXtumXtOautVxuICAgICAgICAgICAgdmFyIGN1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgICAgICAgICB2YXIgcmFuZ2VTdGFydE1pbnV0ZXMgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0UGFydHMgPSByYW5nZS5zdGFydC5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRQYXJ0cyA9IHJhbmdlLmVuZC5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydE1pbiA9IHBhcnNlSW50KHN0YXJ0UGFydHNbMF0pICogNjAgKyBwYXJzZUludChzdGFydFBhcnRzWzFdKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kTWluID0gcGFyc2VJbnQoZW5kUGFydHNbMF0pICogNjAgKyBwYXJzZUludChlbmRQYXJ0c1sxXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE1pbnV0ZXMgPj0gc3RhcnRNaW4gJiYgY3VycmVudE1pbnV0ZXMgPD0gZW5kTWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSYW5nZSA9IHJhbmdlO1xuICAgICAgICAgICAgICAgICAgICByYW5nZVN0YXJ0TWludXRlcyA9IHN0YXJ0TWluO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY3VycmVudFJhbmdlKSByZXR1cm4gMDtcblxuICAgICAgICAgICAgLy8g6K6h566X5LuO5byA6LWb5pe26Ze05Yiw546w5Zyo57uP6L+H55qE56eS5pWw77yI5LiO5pyN5Yqh56uv5LiA6Ie077yJXG4gICAgICAgICAgICB2YXIgcmFuZ2VTdGFydFNlY29uZHMgPSByYW5nZVN0YXJ0TWludXRlcyAqIDYwO1xuICAgICAgICAgICAgdmFyIGVsYXBzZWRTZWNvbmRzID0gY3VycmVudFRvdGFsU2Vjb25kcyAtIHJhbmdlU3RhcnRTZWNvbmRzO1xuICAgICAgICAgICAgdmFyIG1hdGNoRHVyYXRpb25TZWNvbmRzID0gbWF0Y2hEdXJhdGlvbiAqIDYwO1xuXG4gICAgICAgICAgICAvLyDorqHnrpflvZPliY3mmK/nrKzlh6DmnJ/vvIjku44x5byA5aeL77yM5LiO5pyN5Yqh56uv5LiA6Ie077yJXG4gICAgICAgICAgICB2YXIgcGVyaW9kTm8gPSBNYXRoLmZsb29yKGVsYXBzZWRTZWNvbmRzIC8gbWF0Y2hEdXJhdGlvblNlY29uZHMpICsgMTtcblxuICAgICAgICAgICAgcmV0dXJuIHBlcmlvZE5vO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g56ue5oqA5Zy65oql5ZCN5oyJ6ZKu54K55Ye75aSE55CGXG4gICAgX29uQXJlbmFTaWdudXBCdXR0b25DbGljazogZnVuY3Rpb24ocm9vbUNvbmZpZywgYnRuTm9kZSwgc2lnbnVwQnRuTm9kZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHBsYXllckFyZW5hQ29pbiA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnBsYXllckRhdGEgPyBteWdsb2JhbC5wbGF5ZXJEYXRhLmFyZW5hX2NvaW4gOiAwO1xuICAgICAgICB2YXIgcm9vbUlkID0gcm9vbUNvbmZpZy5pZDtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suaKpeWQjVxuICAgICAgICBpZiAod2luZG93LmFyZW5hRGF0YSAmJiB3aW5kb3cuYXJlbmFEYXRhLmlzU2lnbmVkVXAocm9vbUlkKSkge1xuICAgICAgICAgICAgLy8g5bey5oql5ZCN77yM5omn6KGM5Y+W5raI5oql5ZCNXG4gICAgICAgICAgICB0aGlzLl9kb0NhbmNlbFNpZ251cChyb29tQ29uZmlnLCBidG5Ob2RlLCBzaWdudXBCdG5Ob2RlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5Y+v5Lul5oql5ZCN77yI5pyJ5byA6LWb5pe26Ze05LiU5pyJ5q+P5Zy65pe26ZW/77yJXG4gICAgICAgIGlmICghdGhpcy5fY2FuU2lnbnVwQXJlbmEocm9vbUNvbmZpZykpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaFRpbWVSYW5nZXMgPSByb29tQ29uZmlnLm1hdGNoX3RpbWVfcmFuZ2VzIHx8IHJvb21Db25maWcubWF0Y2hUaW1lUmFuZ2VzO1xuICAgICAgICAgICAgdmFyIG1hdGNoRHVyYXRpb24gPSByb29tQ29uZmlnLm1hdGNoX2R1cmF0aW9uIHx8IHJvb21Db25maWcubWF0Y2hEdXJhdGlvbiB8fCByb29tQ29uZmlnLmludGVydmFsX21pbnV0ZXMgfHwgcm9vbUNvbmZpZy5pbnRlcnZhbE1pbnV0ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghbWF0Y2hUaW1lUmFuZ2VzICYmICFtYXRjaER1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLor6XmiL/pl7TmmoLmnKrphY3nva7lvIDotZvml7bpl7RcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoVGltZVJhbmdlcyAmJiAhbWF0Y2hEdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi6K+l5oi/6Ze05pqC5pyq6YWN572u5q+P5Zy65pe26ZW/XCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5faXNJbk1hdGNoVGltZShyb29tQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi5b2T5YmN5LiN5Zyo5byA6LWb5pe26Ze05q6177yM5peg5rOV5oql5ZCNXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuaaguS4jeWPr+aKpeWQjVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5bey5oql5ZCN5YW25LuW56ue5oqA5Zy6XG4gICAgICAgIGlmICh0aGlzLl9oYXNTaWduZWRVcE90aGVyQXJlbmEocm9vbUlkKSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLmgqjlt7LmiqXlkI3lhbbku5bnq57mioDlnLrvvIzmr4/lnLrlj6rog73miqXlkI3kuIDkuKrnuqfliKtcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPluaKpeWQjei0uVxuICAgICAgICB2YXIgc2lnbnVwRmVlID0gcm9vbUNvbmZpZy5taW5fYXJlbmFfY29pbiB8fCByb29tQ29uZmlnLm1pbkFyZW5hQ29pbiB8fCAwO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l56ue5oqA5biB5piv5ZCm6Laz5aSfXG4gICAgICAgIGlmIChwbGF5ZXJBcmVuYUNvaW4gPCBzaWdudXBGZWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi56ue5oqA5biB5LiN6Laz77yM6ZyA6KaBIFwiICsgc2lnbnVwRmVlICsgXCIg56ue5oqA5biBXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmiafooYzmiqXlkI1cbiAgICAgICAgdGhpcy5fZG9BcmVuYVNpZ251cChyb29tQ29uZmlnLCBidG5Ob2RlLCBzaWdudXBCdG5Ob2RlKTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOaJp+ihjOWPlua2iOaKpeWQjVxuICAgIF9kb0NhbmNlbFNpZ251cDogZnVuY3Rpb24ocm9vbUNvbmZpZywgYnRuTm9kZSwgc2lnbnVwQnRuTm9kZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuato+WcqOWPlua2iOaKpeWQjS4uLlwiKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhKSB7XG4gICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLmNhbmNlbFNpZ251cChyb29tQ29uZmlnLmlkLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoZXJyIHx8IFwi5Y+W5raI5oql5ZCN5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5Y+W5raI5oql5ZCN5oiQ5Yqf77yM56ue5oqA5biB5bey6L+U6L+YXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWIt+aWsOeOqeWutuS9meminVxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhLnJlZnJlc2hCYWxhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hcmVuYURhdGEucmVmcmVzaEJhbGFuY2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5pu05pawVUlcbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVBcmVuYVNpZ251cFN0YXR1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOWQr+WKqOWAkuiuoeaXtuabtOaWsOWumuaXtuWZqFxuICAgIC8vIPCflKfjgJDph43mnoTjgJHlrqLmiLfnq6/ln7rkuo7mnI3liqHnq6/mjqjpgIHnmoTlgJLorqHml7bmnKzlnLDorqHnrpdcbiAgICBfc3RhcnRDb3VudGRvd25UaW1lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyDmuIXnkIbml6fnmoTlrprml7blmahcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZG93blRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX2NvdW50ZG93blRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHliJ3lp4vljJbmnKzlnLDlgJLorqHml7bnirbmgIHnvJPlrZhcbiAgICAgICAgLy8g5qC85byPOiB7IHJvb21JZDogeyBwZXJpb2RObywgY291bnRkb3duLCBjYW5TaWdudXAsIGxhc3RVcGRhdGUgfSB9XG4gICAgICAgIHRoaXMuX2xvY2FsQXJlbmFTdGF0dXMgPSB7fTtcblxuICAgICAgICAvLyDnm5HlkKzmnI3liqHnq6/mjqjpgIHnmoTnq57mioDlnLrnirbmgIFcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqCBteWdsb2JhbC5zb2NrZXQg5a6e5L6L77yM6ICM5LiN5pivIHdpbmRvdy5zb2NrZXRDdHIg5Ye95pWwXG4gICAgICAgIHZhciBzb2NrZXQgPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnNvY2tldDtcbiAgICAgICAgaWYgKHNvY2tldCAmJiBzb2NrZXQub25BcmVuYVN0YXR1cykge1xuICAgICAgICAgICAgc29ja2V0Lm9uQXJlbmFTdGF0dXMoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUgJiYgc2VsZi5ub2RlLmlzVmFsaWQgJiYgZGF0YSAmJiBkYXRhLmFyZW5hcykge1xuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5pS544CR5pS25Yiw5pyN5Yqh56uv5o6o6YCB5pe277yM5L+d5a2Y5Yiw5pys5Zyw54q25oCBXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX29uQXJlbmFTdGF0dXNQdXNoKGRhdGEuYXJlbmFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfj5/vuI8gW0FyZW5hXSBzb2NrZXQg5oiWIG9uQXJlbmFTdGF0dXMg5pa55rOV5LiN5Y+v55So77yM5peg5rOV55uR5ZCs56ue5oqA5Zy654q25oCBXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeebkeWQrOernuaKgOWcuuavlOi1m+W8gOWni+mAmuefpVxuICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5vbkFyZW5hTWF0Y2hTdGFydCkge1xuICAgICAgICAgICAgc29ja2V0Lm9uQXJlbmFNYXRjaFN0YXJ0KGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5ub2RlICYmIHNlbGYubm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX29uQXJlbmFNYXRjaFN0YXJ0KGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeebkeWQrOernuaKgOWcuuWFs+mXreW8ueeql+mAmuefpe+8iOaWsOacn+WPt+W8gOWni+aXtuWFs+mXreS4iuS4gOi9ruW8ueeql++8iVxuICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5vbkFyZW5hQ2xvc2VEaWFsb2cpIHtcbiAgICAgICAgICAgIHNvY2tldC5vbkFyZW5hQ2xvc2VEaWFsb2coZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLm5vZGUgJiYgc2VsZi5ub2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fb25BcmVuYUNsb3NlRGlhbG9nKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeeri+WNs+WIneWni+WMluacrOWcsOeKtuaAge+8iOS9v+eUqOacrOWcsOiuoeeul+S9nOS4uuWIneWni+WAvO+8iVxuICAgICAgICB0aGlzLl9pbml0TG9jYWxBcmVuYVN0YXR1c0Zyb21Db25maWcoKTtcblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5pS544CR5q+P56eS5pu05paw5pys5Zyw5YCS6K6h5pe277yI5YePMe+8iVxuICAgICAgICB0aGlzLl9jb3VudGRvd25UaW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYubm9kZSAmJiBzZWxmLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUxvY2FsQ291bnRkb3duKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH0sXG5cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR5aSE55CG56ue5oqA5Zy65q+U6LWb5byA5aeL6YCa55+lXG4gICAgX29uQXJlbmFNYXRjaFN0YXJ0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlhYjlhbPpl63kuYvliY3lj6/og73lrZjlnKjnmoTlvLnnqpdcbiAgICAgICAgdGhpcy5fY2xvc2VBcmVuYU1hdGNoU3RhcnREaWFsb2coKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS/neWtmOavlOi1m+S/oeaBr+S+m+WQjue7reS9v+eUqFxuICAgICAgICB0aGlzLl9jdXJyZW50TWF0Y2hEYXRhID0gZGF0YTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueWHuui/m+WFpea4uOaIj+W8ueeql1xuICAgICAgICB0aGlzLl9zaG93QXJlbmFNYXRjaFN0YXJ0RGlhbG9nKGRhdGEpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeWFs+mXreernuaKgOWcuuW8ueeql1xuICAgIF9jbG9zZUFyZW5hTWF0Y2hTdGFydERpYWxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWFs+mXreW5tumUgOavgeS5i+WJjeaYvuekuueahOW8ueeql1xuICAgICAgICBpZiAodGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nICYmIHRoaXMuX2FyZW5hTWF0Y2hTdGFydERpYWxvZy5pc1ZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLl9hcmVuYU1hdGNoU3RhcnREaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyDmuIXpmaTlvZPliY3mr5TotZvmlbDmja5cbiAgICAgICAgdGhpcy5fY3VycmVudE1hdGNoRGF0YSA9IG51bGw7XG4gICAgfSxcblxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHlpITnkIbmnI3liqHnq6/lj5HpgIHnmoTlhbPpl63lvLnnqpfpgJrnn6VcbiAgICBfb25BcmVuYUNsb3NlRGlhbG9nOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOaUtuWIsOWFs+mXreW8ueeql+mAmuefpTpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5LiO5b2T5YmN5by556qX5Yy56YWNXG4gICAgICAgIGlmICh0aGlzLl9hcmVuYU1hdGNoU3RhcnREaWFsb2cgJiYgdGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIC8vIOWmguaenOaMh+WumuS6huaIv+mXtElE77yM5qOA5p+l5piv5ZCm5Yy56YWNXG4gICAgICAgICAgICBpZiAoZGF0YS5yb29tX2lkICYmIHRoaXMuX2FyZW5hTWF0Y2hTdGFydERpYWxvZ1Jvb21JZCkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLnJvb21faWQgPT09IHRoaXMuX2FyZW5hTWF0Y2hTdGFydERpYWxvZ1Jvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hXSDlhbPpl63ljLnphY3nmoTlvLnnqpfvvIxyb29tX2lkOlwiLCBkYXRhLnJvb21faWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jbG9zZUFyZW5hTWF0Y2hTdGFydERpYWxvZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5rKh5pyJ5oyH5a6a5oi/6Ze0SUTvvIzlhbPpl63miYDmnInlvLnnqpdcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hXSDlhbPpl63miYDmnInnq57mioDlnLrlvLnnqpdcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VBcmVuYU1hdGNoU3RhcnREaWFsb2coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR5pi+56S656ue5oqA5Zy65q+U6LWb5byA5aeL5by556qXXG4gICAgX3Nob3dBcmVuYU1hdGNoU3RhcnREaWFsb2c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuW8ueeql+WuueWZqFxuICAgICAgICB2YXIgZGlhbG9nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQXJlbmFNYXRjaFN0YXJ0RGlhbG9nXCIpO1xuICAgICAgICBkaWFsb2dOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBkaWFsb2dOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGRpYWxvZ05vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgZGlhbG9nTm9kZS54ID0gMDtcbiAgICAgICAgZGlhbG9nTm9kZS55ID0gMDtcbiAgICAgICAgZGlhbG9nTm9kZS56SW5kZXggPSA1MDAwO1xuICAgICAgICBkaWFsb2dOb2RlLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkv53lrZjlvLnnqpflvJXnlKjvvIznlKjkuo7lkI7nu63lhbPpl61cbiAgICAgICAgdGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nID0gZGlhbG9nTm9kZTtcbiAgICAgICAgdGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nUm9vbUlkID0gZGF0YS5yb29tX2lkOyAgLy8g5L+d5a2Y5a+55bqU55qE5oi/6Ze0SURcbiAgICAgICAgdGhpcy5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nUGVyaW9kTm8gPSBkYXRhLnBlcmlvZF9ubzsgIC8vIOS/neWtmOWvueW6lOeahOacn+WPt1xuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6buR6Imy6IOM5pmvXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpO1xuICAgICAgICBiZ05vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSk7XG4gICAgICAgIHZhciBiZ0dyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgMTgwKTtcbiAgICAgICAgYmdHcmFwaGljcy5yZWN0KC1zY3JlZW5XaWR0aC8yLCAtc2NyZWVuSGVpZ2h0LzIsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpO1xuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKTtcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGRpYWxvZ05vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpfljaHniYdcbiAgICAgICAgdmFyIGNhcmRXaWR0aCA9IDQ1MDtcbiAgICAgICAgdmFyIGNhcmRIZWlnaHQgPSAzODA7XG4gICAgICAgIHZhciBjYXJkTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ2FyZFwiKTtcbiAgICAgICAgY2FyZE5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZShjYXJkV2lkdGgsIGNhcmRIZWlnaHQpKTtcbiAgICAgICAgdmFyIGNhcmRHcmFwaGljcyA9IGNhcmROb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGNhcmRHcmFwaGljcy5maWxsQ29sb3IgPSBjYy5jb2xvcig0MCwgNDUsIDY1LCAyNTUpO1xuICAgICAgICBjYXJkR3JhcGhpY3Mucm91bmRSZWN0KC1jYXJkV2lkdGgvMiwgLWNhcmRIZWlnaHQvMiwgY2FyZFdpZHRoLCBjYXJkSGVpZ2h0LCAxNSk7XG4gICAgICAgIGNhcmRHcmFwaGljcy5maWxsKCk7XG4gICAgICAgIGNhcmRHcmFwaGljcy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDI1NSwgMjE1LCAwKTtcbiAgICAgICAgY2FyZEdyYXBoaWNzLmxpbmVXaWR0aCA9IDM7XG4gICAgICAgIGNhcmRHcmFwaGljcy5yb3VuZFJlY3QoLWNhcmRXaWR0aC8yLCAtY2FyZEhlaWdodC8yLCBjYXJkV2lkdGgsIGNhcmRIZWlnaHQsIDE1KTtcbiAgICAgICAgY2FyZEdyYXBoaWNzLnN0cm9rZSgpO1xuICAgICAgICBjYXJkTm9kZS5wYXJlbnQgPSBkaWFsb2dOb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZU5vZGUueSA9IGNhcmRIZWlnaHQvMiAtIDQ1O1xuICAgICAgICB2YXIgdGl0bGVMYWJlbCA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi8J+PhiDnq57mioDlnLrmr5TotZvlvIDlp4tcIjtcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDMyO1xuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA0MDtcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMCk7XG4gICAgICAgIHZhciB0aXRsZU91dGxpbmUgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIHRpdGxlT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDEwMCwgODAsIDApO1xuICAgICAgICB0aXRsZU91dGxpbmUud2lkdGggPSAyO1xuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gY2FyZE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDmnJ/lj7fkv6Hmga9cbiAgICAgICAgdmFyIHBlcmlvZE5vZGUgPSBuZXcgY2MuTm9kZShcIlBlcmlvZFwiKTtcbiAgICAgICAgcGVyaW9kTm9kZS55ID0gY2FyZEhlaWdodC8yIC0gOTU7XG4gICAgICAgIHZhciBwZXJpb2RMYWJlbCA9IHBlcmlvZE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcGVyaW9kTGFiZWwuc3RyaW5nID0gXCLmnJ/lj7c6IFwiICsgKGRhdGEucGVyaW9kX25vIHx8IFwiLS1cIik7XG4gICAgICAgIHBlcmlvZExhYmVsLmZvbnRTaXplID0gMjI7XG4gICAgICAgIHBlcmlvZExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHBlcmlvZE5vZGUuY29sb3IgPSBjYy5jb2xvcigyMDAsIDIwMCwgMjIwKTtcbiAgICAgICAgcGVyaW9kTm9kZS5wYXJlbnQgPSBjYXJkTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaIv+mXtOS/oeaBr1xuICAgICAgICB2YXIgcm9vbU5vZGUgPSBuZXcgY2MuTm9kZShcIlJvb21cIik7XG4gICAgICAgIHJvb21Ob2RlLnkgPSBjYXJkSGVpZ2h0LzIgLSAxMzA7XG4gICAgICAgIHZhciByb29tTGFiZWwgPSByb29tTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICByb29tTGFiZWwuc3RyaW5nID0gXCLmiL/pl7Q6IFwiICsgKGRhdGEucm9vbV9uYW1lIHx8IFwi5pyq55+l5oi/6Ze0XCIpO1xuICAgICAgICByb29tTGFiZWwuZm9udFNpemUgPSAyMDtcbiAgICAgICAgcm9vbUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHJvb21Ob2RlLmNvbG9yID0gY2MuY29sb3IoMTgwLCAxODAsIDIwMCk7XG4gICAgICAgIHJvb21Ob2RlLnBhcmVudCA9IGNhcmROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Y+C6LWb5Lq65pWwXG4gICAgICAgIHZhciBwbGF5ZXJzTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUGxheWVyc1wiKTtcbiAgICAgICAgcGxheWVyc05vZGUueSA9IGNhcmRIZWlnaHQvMiAtIDE2NTtcbiAgICAgICAgdmFyIHBsYXllcnNMYWJlbCA9IHBsYXllcnNOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHBsYXllcnNMYWJlbC5zdHJpbmcgPSBcIuWPgui1m+S6uuaVsDogXCIgKyAoZGF0YS50b3RhbF9wbGF5ZXJzIHx8IDApICsgXCIg5Lq6XCI7XG4gICAgICAgIHBsYXllcnNMYWJlbC5mb250U2l6ZSA9IDIwO1xuICAgICAgICBwbGF5ZXJzTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgcGxheWVyc05vZGUuY29sb3IgPSBjYy5jb2xvcigxMDAsIDIwMCwgMTAwKTtcbiAgICAgICAgcGxheWVyc05vZGUucGFyZW50ID0gY2FyZE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDmj5DnpLrmtojmga9cbiAgICAgICAgdmFyIG1zZ05vZGUgPSBuZXcgY2MuTm9kZShcIk1lc3NhZ2VcIik7XG4gICAgICAgIG1zZ05vZGUueSA9IGNhcmRIZWlnaHQvMiAtIDI0MDtcbiAgICAgICAgdmFyIG1zZ0xhYmVsID0gbXNnTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBtc2dMYWJlbC5zdHJpbmcgPSBkYXRhLm1lc3NhZ2UgfHwgXCLmr5TotZvljbPlsIblvIDlp4vvvIzor7flh4blpIfov5vlhaXmuLjmiI/vvIFcIjtcbiAgICAgICAgbXNnTGFiZWwuZm9udFNpemUgPSAxNjtcbiAgICAgICAgbXNnTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbXNnTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjAwLCAxMDApO1xuICAgICAgICBtc2dOb2RlLnBhcmVudCA9IGNhcmROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5oyJ6ZKu5Yy65Z+fXG4gICAgICAgIHZhciBidG5ZID0gLWNhcmRIZWlnaHQvMiArIDU1O1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PSDov5vlhaXmuLjmiI/mjInpkq4gPT09PT09PT09PVxuICAgICAgICB2YXIgZW50ZXJCdG4gPSBuZXcgY2MuTm9kZShcIkVudGVyQnRuXCIpO1xuICAgICAgICBlbnRlckJ0bi5zZXRDb250ZW50U2l6ZShjYy5zaXplKDE4MCwgNTApKTtcbiAgICAgICAgZW50ZXJCdG4uc2V0UG9zaXRpb24oLTEwMCwgYnRuWSk7XG4gICAgICAgIGVudGVyQnRuLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGVudGVyQnRuLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLbmjInpkq7og4zmma9cbiAgICAgICAgdmFyIGVudGVyQmcgPSBlbnRlckJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBlbnRlckJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDc2LCAxNzUsIDgwKTsgIC8vIOe7v+iJslxuICAgICAgICBlbnRlckJnLnJvdW5kUmVjdCgtOTAsIC0yNSwgMTgwLCA1MCwgOCk7XG4gICAgICAgIGVudGVyQmcuZmlsbCgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65paH5a2X5a2Q6IqC54K5XG4gICAgICAgIHZhciBlbnRlckxhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIik7XG4gICAgICAgIGVudGVyTGFiZWxOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGVudGVyTGFiZWxOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBlbnRlckJ0bkxhYmVsID0gZW50ZXJMYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgZW50ZXJCdG5MYWJlbC5zdHJpbmcgPSBcIui/m+WFpeavlOi1m1wiO1xuICAgICAgICBlbnRlckJ0bkxhYmVsLmZvbnRTaXplID0gMjI7XG4gICAgICAgIGVudGVyQnRuTGFiZWwubGluZUhlaWdodCA9IDI4O1xuICAgICAgICBlbnRlckJ0bkxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGVudGVyTGFiZWxOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIGVudGVyTGFiZWxOb2RlLnBhcmVudCA9IGVudGVyQnRuO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75YqgIEJ1dHRvbiDnu4Tku7bmj5DkvpvkuqTkupLlj43ppohcbiAgICAgICAgdmFyIGVudGVyQnV0dG9uQ29tcCA9IGVudGVyQnRuLmFkZENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBlbnRlckJ1dHRvbkNvbXAudHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICBlbnRlckJ1dHRvbkNvbXAuZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGVudGVyQnV0dG9uQ29tcC56b29tU2NhbGUgPSAxLjE7XG4gICAgICAgIFxuICAgICAgICBlbnRlckJ0bi5wYXJlbnQgPSBjYXJkTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgICBlbnRlckJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIC8vIOa4hemZpOW8ueeql+W8leeUqOWQjuWGjemUgOavgVxuICAgICAgICAgICAgc2VsZi5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGYuX2FyZW5hTWF0Y2hTdGFydERpYWxvZ1Jvb21JZCA9IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9hcmVuYU1hdGNoU3RhcnREaWFsb2dQZXJpb2RObyA9IG51bGw7XG4gICAgICAgICAgICBkaWFsb2dOb2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHNlbGYuX2VudGVyQXJlbmFNYXRjaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09IOWPlua2iOaMiemSriA9PT09PT09PT09XG4gICAgICAgIHZhciBjYW5jZWxCdG4gPSBuZXcgY2MuTm9kZShcIkNhbmNlbEJ0blwiKTtcbiAgICAgICAgY2FuY2VsQnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUoMTIwLCA1MCkpO1xuICAgICAgICBjYW5jZWxCdG4uc2V0UG9zaXRpb24oMTAwLCBidG5ZKTsgIC8vIOS/ruato+S9jee9ru+8jOS4pOaMiemSrumXtOi3neWQiOeQhlxuICAgICAgICBjYW5jZWxCdG4uYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgY2FuY2VsQnRuLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLbmjInpkq7og4zmma9cbiAgICAgICAgdmFyIGNhbmNlbEJnID0gY2FuY2VsQnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGNhbmNlbEJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDE4MCwgODAsIDgwKTsgIC8vIOe6ouiJslxuICAgICAgICBjYW5jZWxCZy5yb3VuZFJlY3QoLTYwLCAtMjUsIDEyMCwgNTAsIDgpO1xuICAgICAgICBjYW5jZWxCZy5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmloflrZflrZDoioLngrlcbiAgICAgICAgdmFyIGNhbmNlbExhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxcIik7XG4gICAgICAgIGNhbmNlbExhYmVsTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBjYW5jZWxMYWJlbE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIGNhbmNlbEJ0bkxhYmVsID0gY2FuY2VsTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGNhbmNlbEJ0bkxhYmVsLnN0cmluZyA9IFwi5Y+W5raIXCI7XG4gICAgICAgIGNhbmNlbEJ0bkxhYmVsLmZvbnRTaXplID0gMjA7XG4gICAgICAgIGNhbmNlbEJ0bkxhYmVsLmxpbmVIZWlnaHQgPSAyNjtcbiAgICAgICAgY2FuY2VsQnRuTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgY2FuY2VsTGFiZWxOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIGNhbmNlbExhYmVsTm9kZS5wYXJlbnQgPSBjYW5jZWxCdG47XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqAgQnV0dG9uIOe7hOS7tuaPkOS+m+S6pOS6kuWPjemmiFxuICAgICAgICB2YXIgY2FuY2VsQnV0dG9uQ29tcCA9IGNhbmNlbEJ0bi5hZGRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgY2FuY2VsQnV0dG9uQ29tcC50cmFuc2l0aW9uID0gY2MuQnV0dG9uLlRyYW5zaXRpb24uU0NBTEU7XG4gICAgICAgIGNhbmNlbEJ1dHRvbkNvbXAuZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGNhbmNlbEJ1dHRvbkNvbXAuem9vbVNjYWxlID0gMS4xO1xuICAgICAgICBcbiAgICAgICAgY2FuY2VsQnRuLnBhcmVudCA9IGNhcmROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg54K55Ye75LqL5Lu2XG4gICAgICAgIGNhbmNlbEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y+W5raI5oyJ6ZKu77ya5Y+W5raI5oql5ZCN5bm26YCA6L+Y56ue5oqA5biBXG4gICAgICAgICAgICBzZWxmLl9jYW5jZWxBcmVuYVNpZ251cChkYXRhKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5riF6Zmk5by556qX5byV55So5ZCO5YaN6ZSA5q+BXG4gICAgICAgICAgICBzZWxmLl9hcmVuYU1hdGNoU3RhcnREaWFsb2cgPSBudWxsO1xuICAgICAgICAgICAgc2VsZi5fYXJlbmFNYXRjaFN0YXJ0RGlhbG9nUm9vbUlkID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGYuX2FyZW5hTWF0Y2hTdGFydERpYWxvZ1BlcmlvZE5vID0gbnVsbDtcbiAgICAgICAgICAgIGRpYWxvZ05vZGUuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeWPlua2iOernuaKgOWcuuaKpeWQjeW5tumAgOi/mOernuaKgOW4gVxuICAgIF9jYW5jZWxBcmVuYVNpZ251cDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOWPlua2iOaKpeWQje+8jOmAgOi/mOernuaKgOW4ge+8jHJvb21faWQ6XCIsIGRhdGEucm9vbV9pZCk7XG4gICAgICAgIFxuICAgICAgICAvLyDlj5HpgIHlj5bmtojmiqXlkI3or7fmsYLliLDmnI3liqHnq69cbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldDtcbiAgICAgICAgaWYgKHNvY2tldCAmJiBzb2NrZXQuc2VuZEFyZW5hQ2FuY2VsU2lnbnVwKSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZEFyZW5hQ2FuY2VsU2lnbnVwKHtcbiAgICAgICAgICAgICAgICByb29tX2lkOiBkYXRhLnJvb21faWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXpmaTmnKzlnLDmiqXlkI3nirbmgIFcbiAgICAgICAgaWYgKHdpbmRvdy5hcmVuYURhdGEgJiYgd2luZG93LmFyZW5hRGF0YS5fc2lnbmVkVXBBcmVuYXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hc1tkYXRhLnJvb21faWRdO1xuICAgICAgICAgICAgd2luZG93LmFyZW5hRGF0YS5zYXZlVG9Mb2NhbCAmJiB3aW5kb3cuYXJlbmFEYXRhLnNhdmVUb0xvY2FsKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4hemZpOW9k+WJjeavlOi1m+aVsOaNrlxuICAgICAgICB0aGlzLl9jdXJyZW50TWF0Y2hEYXRhID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkei/m+WFpeernuaKgOWcuuavlOi1m1xuICAgIF9lbnRlckFyZW5hTWF0Y2g6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj5/vuI8gW0FyZW5hXSDov5vlhaXnq57mioDlnLrmr5TotZvvvIxkYXRhOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIFxuICAgICAgICAvLyDkv53lrZjmr5TotZvkv6Hmga9cbiAgICAgICAgaWYgKG15Z2xvYmFsKSB7XG4gICAgICAgICAgICBteWdsb2JhbC5jdXJyZW50QXJlbmFNYXRjaCA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOa4hemZpOaKpeWQjeeKtuaAgVxuICAgICAgICBpZiAod2luZG93LmFyZW5hRGF0YSAmJiB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hcykge1xuICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5hcmVuYURhdGEuX3NpZ25lZFVwQXJlbmFzW2RhdGEucm9vbV9pZF07XG4gICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLnNhdmVUb0xvY2FsICYmIHdpbmRvdy5hcmVuYURhdGEuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeWPkemAgSBhcmVuYV9lbnRlciDor7fmsYLvvIznrYnlvoUgcm9vbV9qb2luZWQg5raI5oGv5ZCO5YaN6L+b5YWl5ri45oiP5Zy65pmvXG4gICAgICAgIHZhciBzb2NrZXQgPSBteWdsb2JhbCAmJiBteWdsb2JhbC5zb2NrZXQ7XG4gICAgICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LnNlbmRBcmVuYUVudGVyKSB7XG4gICAgICAgICAgICAvLyDmmL7npLrliqDovb3mj5DnpLpcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5q2j5Zyo6L+b5YWl56ue5oqA5Zy6Li4uXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDms6jlhozkuIDmrKHmgKcgcm9vbV9qb2luZWQg55uR5ZCs5ZmoXG4gICAgICAgICAgICB2YXIgcm9vbUpvaW5lZEhhbmRsZXIgPSBmdW5jdGlvbihyb29tRGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOaUtuWIsCByb29tX2pvaW5lZO+8jOWHhuWkh+i/m+WFpea4uOaIj+WcuuaZrzpcIiwgSlNPTi5zdHJpbmdpZnkocm9vbURhdGEpKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlj5bmtojotoXml7blrprml7blmahcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fYXJlbmFFbnRlclRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX2FyZW5hRW50ZXJUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYXJlbmFFbnRlclRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu5L+u5aSN44CR6L2s5o2i5pWw5o2u5qC85byP77yacGxheWVycyDihpIgcGxheWVyZGF0YVxuICAgICAgICAgICAgICAgIC8vIOa4uOaIj+WcuuaZr+acn+acm+eahOaVsOaNruagvOW8j+S4juaZrumAmuWcuuS4gOiHtFxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gcm9vbURhdGEucGxheWVycyB8fCBbXTtcbiAgICAgICAgICAgICAgICB2YXIgY29udmVydGVkUm9vbURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21pZDogcm9vbURhdGEucm9vbV9jb2RlIHx8IFwiQVJFTkFcIixcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9jb2RlOiByb29tRGF0YS5yb29tX2NvZGUgfHwgXCJBUkVOQVwiLFxuICAgICAgICAgICAgICAgICAgICBzZWF0aW5kZXg6IHJvb21EYXRhLnBsYXllciA/IHJvb21EYXRhLnBsYXllci5zZWF0ICsgMSA6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBsYXllcmRhdGE6IHBsYXllcnMubWFwKGZ1bmN0aW9uKHAsIGlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50aWQ6IHAuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmlja19uYW1lOiBwLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBwLmF2YXRhciB8fCBcImF2YXRhcl8xXCIsICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55So5a6e6ZmF5aS05YOPVVJMXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29sZF9jb3VudDogcC5nb2xkX2NvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29sZGNvdW50OiBwLmdvbGRfY291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWF0aW5kZXg6IChwLnNlYXQgIT09IHVuZGVmaW5lZCA/IHAuc2VhdCA6IGlkeCkgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzcmVhZHk6IHAucmVhZHkgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlbmFfZ29sZDogcC5hcmVuYV9nb2xkIHx8IDAsICAvLyDwn5Sn44CQ5L+u5aSN44CR5re75Yqg56ue5oqA5Zy66YeR5biBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hfY29pbjogcC5tYXRjaF9jb2luIHx8IDAsICAvLyDlhbzlrrnlrZfmrrVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Rfbm86IHAucGVyaW9kX25vIHx8IFwiXCIgICAgLy8g5pyf5Y+3XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgaG91c2VtYW5hZ2VpZDogcm9vbURhdGEuY3JlYXRvcl9pZCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdG9yX2lkOiByb29tRGF0YS5jcmVhdG9yX2lkIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21fY2F0ZWdvcnk6IDIsICAvLyDnq57mioDlnLpcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kX25vOiBkYXRhLnBlcmlvZF9ub1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYV0g6L2s5o2i5ZCO55qE5oi/6Ze05pWw5o2uOlwiLCBKU09OLnN0cmluZ2lmeShjb252ZXJ0ZWRSb29tRGF0YSkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS/neWtmOi9rOaNouWQjueahOaIv+mXtOaVsOaNrlxuICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbCkge1xuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5yb29tRGF0YSA9IGNvbnZlcnRlZFJvb21EYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDov5vlhaXmuLjmiI/lnLrmma9cbiAgICAgICAgICAgICAgICBzZWxmLl9lbnRlckdhbWVTY2VuZShjb252ZXJ0ZWRSb29tRGF0YSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDms6jlhoznm5HlkKzlmahcbiAgICAgICAgICAgIHNvY2tldC5vblJvb21Kb2luZWQocm9vbUpvaW5lZEhhbmRsZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7otoXml7bvvIgxMOenkuWQjuWmguaenOayoeaUtuWIsCByb29tX2pvaW5lZO+8jOS5n+i/m+WFpeWcuuaZr++8iVxuICAgICAgICAgICAgdGhpcy5fYXJlbmFFbnRlclRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOetieW+hSByb29tX2pvaW5lZCDotoXml7bvvIznm7TmjqXov5vlhaXmuLjmiI/lnLrmma9cIik7XG4gICAgICAgICAgICAgICAgc2VsZi5fYXJlbmFFbnRlclRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOaehOmAoOS4tOaXtuaIv+mXtOaVsOaNrlxuICAgICAgICAgICAgICAgIHZhciB0ZW1wUm9vbURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21fY29kZTogXCJhcmVuYV9cIiArIGRhdGEucGVyaW9kX25vLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBkYXRhLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgIHJvb21fbmFtZTogZGF0YS5yb29tX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHJvb21fY2F0ZWdvcnk6IDIsXG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZF9ubzogZGF0YS5wZXJpb2Rfbm9cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbCkge1xuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5yb29tRGF0YSA9IHRlbXBSb29tRGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2VsZi5fZW50ZXJHYW1lU2NlbmUodGVtcFJvb21EYXRhKTtcbiAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y+R6YCBIGFyZW5hX2VudGVyIOivt+axglxuICAgICAgICAgICAgc29ja2V0LnNlbmRBcmVuYUVudGVyKHtcbiAgICAgICAgICAgICAgICBwZXJpb2Rfbm86IGRhdGEucGVyaW9kX25vLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IGRhdGEucm9vbV9pZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4+f77iPIFtBcmVuYV0gc29ja2V0IOaIliBzZW5kQXJlbmFFbnRlciDmlrnms5XkuI3lj6/nlKhcIik7XG4gICAgICAgICAgICAvLyDpmY3nuqflpITnkIbvvJrnm7TmjqXov5vlhaXmuLjmiI/lnLrmma9cbiAgICAgICAgICAgIHZhciByb29tQ29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLnJvb21faWQsXG4gICAgICAgICAgICAgICAgcm9vbV9uYW1lOiBkYXRhLnJvb21fbmFtZSxcbiAgICAgICAgICAgICAgICByb29tX2NvbmZpZ19pZDogZGF0YS5yb29tX2NvbmZpZ19pZCxcbiAgICAgICAgICAgICAgICByb29tX2NhdGVnb3J5OiAyLFxuICAgICAgICAgICAgICAgIG1pbl9hcmVuYV9jb2luOiBkYXRhLnNpZ251cF9mZWUsXG4gICAgICAgICAgICAgICAgbWF0Y2hfcm91bmRzOiBkYXRhLm1hdGNoX3JvdW5kcyxcbiAgICAgICAgICAgICAgICBtYXRjaF9kdXJhdGlvbjogZGF0YS5tYXRjaF9kdXJhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG15Z2xvYmFsKSB7XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuY3VycmVudFJvb21Db25maWcgPSByb29tQ29uZmlnO1xuICAgICAgICAgICAgICAgIG15Z2xvYmFsLmN1cnJlbnRSb29tTGV2ZWwgPSBkYXRhLnJvb21faWQ7XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuY3VycmVudFJvb21OYW1lID0gZGF0YS5yb29tX25hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuX2VudGVyQXJlbmFHYW1lU2NlbmUoZGF0YSwgcm9vbUNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHnq57mioDlnLrnm7TmjqXov5vlhaXmuLjmiI/lnLrmma/vvIjmnIDlpJrnrYnlvoUy56eS77yJXG4gICAgX2VudGVyQXJlbmFHYW1lU2NlbmU6IGZ1bmN0aW9uKG1hdGNoRGF0YSwgcm9vbUNvbmZpZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOaYvuekuueugOefreWKoOi9veaPkOekulxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZUNlbnRlcihcIuato+WcqOi/m+WFpeernuaKgOWcui4uLlwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaehOmAoOaIv+mXtOaVsOaNrlxuICAgICAgICB2YXIgcm9vbURhdGEgPSB7XG4gICAgICAgICAgICByb29tX2NvZGU6IG1hdGNoRGF0YS5yb29tX2NvZGUgfHwgKFwiYXJlbmFfXCIgKyBtYXRjaERhdGEucGVyaW9kX25vKSxcbiAgICAgICAgICAgIHJvb21faWQ6IG1hdGNoRGF0YS5yb29tX2lkLFxuICAgICAgICAgICAgcm9vbV9uYW1lOiBtYXRjaERhdGEucm9vbV9uYW1lLFxuICAgICAgICAgICAgcm9vbV9jYXRlZ29yeTogMiwgIC8vIOernuaKgOWculxuICAgICAgICAgICAgYmFzZV9zY29yZTogcm9vbUNvbmZpZy5iYXNlX3Njb3JlIHx8IDEsXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiByb29tQ29uZmlnLm11bHRpcGxpZXIgfHwgMSxcbiAgICAgICAgICAgIHBlcmlvZF9ubzogbWF0Y2hEYXRhLnBlcmlvZF9ubyxcbiAgICAgICAgICAgIG1hdGNoX3JvdW5kczogbWF0Y2hEYXRhLm1hdGNoX3JvdW5kc1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y5oi/6Ze05pWw5o2uXG4gICAgICAgIGlmIChteWdsb2JhbCkge1xuICAgICAgICAgICAgbXlnbG9iYWwucm9vbURhdGEgPSByb29tRGF0YTtcbiAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEgPSBteWdsb2JhbC5wbGF5ZXJEYXRhIHx8IHt9O1xuICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5ib3R0b20gPSByb29tQ29uZmlnLmJhc2Vfc2NvcmUgfHwgMTtcbiAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEucmF0ZSA9IHJvb21Db25maWcubXVsdGlwbGllciB8fCAxO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDwn5Sn44CQ5YWz6ZSu44CR5pyA5aSa562J5b6FMuenkuWQjuebtOaOpei/m+WFpea4uOaIj+WcuuaZr1xuICAgICAgICB2YXIgZW50ZXJEZWxheSA9IDUwMDsgIC8vIOm7mOiupOetieW+hTUwMG1zXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmnInnrYnlvoXmlbDmja7vvIzlj6/ku6XpgILlvZPlu7bplb9cbiAgICAgICAgaWYgKG1hdGNoRGF0YS53YWl0X3RpbWUgJiYgbWF0Y2hEYXRhLndhaXRfdGltZSA+IDApIHtcbiAgICAgICAgICAgIGVudGVyRGVsYXkgPSBNYXRoLm1pbihtYXRjaERhdGEud2FpdF90aW1lICogMTAwMCwgMjAwMCk7ICAvLyDmnIDlpJoy56eSXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOWwhuWcqCBcIiArIGVudGVyRGVsYXkgKyBcIm1zIOWQjui/m+WFpea4uOaIj+WcuuaZr1wiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruWumuaXtuWZqO+8jOW7tui/n+i/m+WFpea4uOaIj+WcuuaZr1xuICAgICAgICB0aGlzLl9hcmVuYUVudGVyVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fYXJlbmFFbnRlclRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFdIOi/m+WFpea4uOaIj+WcuuaZr1wiKTtcbiAgICAgICAgICAgIHNlbGYuX2VudGVyR2FtZVNjZW5lKHJvb21EYXRhKTtcbiAgICAgICAgfSwgZW50ZXJEZWxheSk7XG4gICAgfSxcblxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHku47phY3nva7liJ3lp4vljJbmnKzlnLDnirbmgIHvvIjkvZzkuLrlpIfnlKjvvIlcbiAgICBfaW5pdExvY2FsQXJlbmFTdGF0dXNGcm9tQ29uZmlnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9hcmVuYVJvb21zKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXJlbmFSb29tcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvb20gPSB0aGlzLl9hcmVuYVJvb21zW2ldO1xuICAgICAgICAgICAgdmFyIGNvbmZpZyA9IHJvb20uY29uZmlnO1xuICAgICAgICAgICAgdmFyIHJvb21JZCA9IGNvbmZpZy5pZDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5aaC5p6c5bey57uP5pyJ5pyN5Yqh56uv5o6o6YCB55qE5pWw5o2u77yM6Lez6L+HXG4gICAgICAgICAgICBpZiAodGhpcy5fbG9jYWxBcmVuYVN0YXR1c1tyb29tSWRdKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5L2/55So5pys5Zyw6K6h566X5L2c5Li65Yid5aeL5YC8XG4gICAgICAgICAgICB2YXIgcGhhc2VJbmZvID0gdGhpcy5fY2FsY3VsYXRlUGhhc2VJbmZvKGNvbmZpZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsQXJlbmFTdGF0dXNbcm9vbUlkXSA9IHtcbiAgICAgICAgICAgICAgICBwZXJpb2RObzogcGhhc2VJbmZvLnBlcmlvZE5vLFxuICAgICAgICAgICAgICAgIHBlcmlvZE5vU3RyOiBwaGFzZUluZm8ucGVyaW9kTm9TdHIsICAvLyDmlrDlop7vvJrlrZfnrKbkuLLmoLzlvI/mnJ/lj7dcbiAgICAgICAgICAgICAgICBwaGFzZTogcGhhc2VJbmZvLnBoYXNlLFxuICAgICAgICAgICAgICAgIGNvdW50ZG93bjogcGhhc2VJbmZvLmNvdW50ZG93bixcbiAgICAgICAgICAgICAgICBjYW5TaWdudXA6IHBoYXNlSW5mby5jYW5TaWdudXAsXG4gICAgICAgICAgICAgICAgdG90YWxQbGF5ZXJzOiAwLCAgLy8g8J+Up+OAkOS/ruWkjeOAkeWIneWni+WMluaKpeWQjeS6uuaVsOS4ujBcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiBcIlwiLFxuICAgICAgICAgICAgICAgIGxhc3RVcGRhdGU6IG5vdyxcbiAgICAgICAgICAgICAgICBpc0xvY2FsQ2FsY3VsYXRlZDogdHJ1ZSAgLy8g5qCH6K6w5Li65pys5Zyw6K6h566XXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlQ291bnRkb3duRnJvbUxvY2FsQ2FjaGUoKTtcbiAgICB9LFxuXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeaUtuWIsOacjeWKoeerr+aOqOmAgeaXtu+8jOabtOaWsOacrOWcsOeKtuaAgee8k+WtmFxuICAgIF9vbkFyZW5hU3RhdHVzUHVzaDogZnVuY3Rpb24oYXJlbmFzKSB7XG4gICAgICAgIGlmICghYXJlbmFzKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKcg6LCD6K+V77ya5omT5Y2w5pS25Yiw55qE5a6M5pW05pWw5o2uXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDmnKzlnLDnirbmgIHnvJPlrZhcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmVuYXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhcmVuYSA9IGFyZW5hc1tpXTtcbiAgICAgICAgICAgIHZhciByb29tSWQgPSBhcmVuYS5yb29tX2lkO1xuICAgICAgICAgICAgdmFyIG5ld1BlcmlvZE5vU3RyID0gYXJlbmEucGVyaW9kX25vX3N0ciB8fCBhcmVuYS5wZXJpb2ROb1N0ciB8fCBcIlwiO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5SnIOiwg+ivle+8muaJk+WNsOavj+S4quernuaKgOWcuueahCB0b3RhbF9wbGF5ZXJzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XmnJ/lj7fmmK/lkKblj5jljJbvvIzlpoLmnpzlj5jljJbliJnmuIXpmaTnlKjmiLfmiqXlkI3nirbmgIFcbiAgICAgICAgICAgIHZhciBvbGRTdGF0dXMgPSB0aGlzLl9sb2NhbEFyZW5hU3RhdHVzW3Jvb21JZF07XG4gICAgICAgICAgICBpZiAob2xkU3RhdHVzICYmIG9sZFN0YXR1cy5wZXJpb2ROb1N0ciAmJiBuZXdQZXJpb2ROb1N0ciAmJiBvbGRTdGF0dXMucGVyaW9kTm9TdHIgIT09IG5ld1BlcmlvZE5vU3RyKSB7XG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS4jeWcqOacn+WPt+WPmOWMluaXtuWFs+mXreW8ueeql1xuICAgICAgICAgICAgICAgIC8vIOW8ueeql+W6lOivpeWPquWcqOS7peS4i+aDheWGteWFs+mXre+8mlxuICAgICAgICAgICAgICAgIC8vIDEuIOeOqeWutueCueWHu1wi6L+b5YWlXCLmiJZcIuWPlua2iFwi5oyJ6ZKuXG4gICAgICAgICAgICAgICAgLy8gMi4g5pyN5Yqh56uv5Y+R6YCBIGFyZW5hX2Nsb3NlX2RpYWxvZyDmtojmga/vvIjov5vlhaXpmLbmrrXlgJLorqHml7bnu5PmnZ/vvIlcbiAgICAgICAgICAgICAgICAvLyAzLiDnjqnlrrbmiYvliqjlhbPpl63lvLnnqpdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmuIXpmaTnlKjmiLflnKjor6XmiL/pl7TnmoTmiqXlkI3nirbmgIFcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmFyZW5hRGF0YSAmJiB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hcyAmJiB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hc1tyb29tSWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRQZXJpb2RObyA9IHdpbmRvdy5hcmVuYURhdGEuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF0ucGVyaW9kTm87XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hc1tyb29tSWRdO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLnNhdmVUb0xvY2FsICYmIHdpbmRvdy5hcmVuYURhdGEuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS/neWtmOacjeWKoeerr+aOqOmAgeeahOeKtuaAge+8iOaUr+aMgeaWsOWtl+aute+8iVxuICAgICAgICAgICAgdGhpcy5fbG9jYWxBcmVuYVN0YXR1c1tyb29tSWRdID0ge1xuICAgICAgICAgICAgICAgIHBlcmlvZE5vOiBhcmVuYS5wZXJpb2Rfbm8sXG4gICAgICAgICAgICAgICAgcGVyaW9kTm9TdHI6IG5ld1BlcmlvZE5vU3RyLFxuICAgICAgICAgICAgICAgIHBoYXNlOiBhcmVuYS5waGFzZSB8fCAwLFxuICAgICAgICAgICAgICAgIGNvdW50ZG93bjogYXJlbmEuY291bnRkb3duLFxuICAgICAgICAgICAgICAgIGNhblNpZ251cDogYXJlbmEuY2FuX3NpZ251cCxcbiAgICAgICAgICAgICAgICB0b3RhbFBsYXllcnM6IGFyZW5hLnRvdGFsX3BsYXllcnMgfHwgYXJlbmEudG90YWxQbGF5ZXJzIHx8IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogYXJlbmEuc3RhdHVzX3RleHQgfHwgYXJlbmEuc3RhdHVzVGV4dCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIGxhc3RVcGRhdGU6IG5vdyxcbiAgICAgICAgICAgICAgICBpc0xvY2FsQ2FsY3VsYXRlZDogZmFsc2UgIC8vIOacjeWKoeerr+aOqOmAgVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g56uL5Y2z5pu05paw5pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvdW50ZG93bkZyb21Mb2NhbENhY2hlKCk7XG4gICAgfSxcblxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHmr4/np5Lmm7TmlrDmnKzlnLDlgJLorqHml7bvvIjlh48x77yJXG4gICAgX3VwZGF0ZUxvY2FsQ291bnRkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9sb2NhbEFyZW5hU3RhdHVzKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOmBjeWOhuaJgOacieernuaKgOWcuu+8jOavj+enkuWHjzFcbiAgICAgICAgZm9yICh2YXIgcm9vbUlkIGluIHRoaXMuX2xvY2FsQXJlbmFTdGF0dXMpIHtcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSB0aGlzLl9sb2NhbEFyZW5hU3RhdHVzW3Jvb21JZF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHlrrnplJnmnLrliLbvvJrlpoLmnpzotoXov4czNeenkuayoeaUtuWIsOacjeWKoeerr+aOqOmAge+8jOS9v+eUqOacrOWcsOiuoeeul+agoeWHhlxuICAgICAgICAgICAgdmFyIHRpbWVTaW5jZUxhc3RVcGRhdGUgPSAobm93IC0gc3RhdHVzLmxhc3RVcGRhdGUpIC8gMTAwMDtcbiAgICAgICAgICAgIGlmICh0aW1lU2luY2VMYXN0VXBkYXRlID4gMzUpIHtcbiAgICAgICAgICAgICAgICAvLyDmib7liLDlr7nlupTnmoTphY3nva5cbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5fZ2V0QXJlbmFDb25maWdCeVJvb21JZChwYXJzZUludChyb29tSWQpKTtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwaGFzZUluZm8gPSB0aGlzLl9jYWxjdWxhdGVQaGFzZUluZm8oY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpeacn+WPt+aYr+WQpuWPmOWMlu+8jOWmguaenOWPmOWMluWImemHjee9ruaKpeWQjeS6uuaVsOWSjOeUqOaIt+aKpeWQjeeKtuaAgVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnBlcmlvZE5vU3RyICE9PSBwaGFzZUluZm8ucGVyaW9kTm9TdHIgJiYgcGhhc2VJbmZvLnBlcmlvZE5vU3RyICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMudG90YWxQbGF5ZXJzID0gMDsgIC8vIOacn+WPt+WPmOWMlu+8jOmHjee9ruaKpeWQjeS6uuaVsFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LiN5Zyo5pyf5Y+35Y+Y5YyW5pe25YWz6Zet5by556qXXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlvLnnqpflupTor6Xlj6rlnKjov5vlhaXpmLbmrrXlgJLorqHml7bnu5PmnZ/lkI7nlLHmnI3liqHnq6/nmoQgYXJlbmFfY2xvc2VfZGlhbG9nIOa2iOaBr+WFs+mXrVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5riF6Zmk55So5oi35Zyo6K+l5oi/6Ze055qE5oql5ZCN54q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LmFyZW5hRGF0YSAmJiB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hcyAmJiB3aW5kb3cuYXJlbmFEYXRhLl9zaWduZWRVcEFyZW5hc1tyb29tSWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFBlcmlvZE5vID0gd2luZG93LmFyZW5hRGF0YS5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXS5wZXJpb2RObztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93LmFyZW5hRGF0YS5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLnNhdmVUb0xvY2FsICYmIHdpbmRvdy5hcmVuYURhdGEuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMucGhhc2UgPSBwaGFzZUluZm8ucGhhc2U7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5jb3VudGRvd24gPSBwaGFzZUluZm8uY291bnRkb3duO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuY2FuU2lnbnVwID0gcGhhc2VJbmZvLmNhblNpZ251cDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLnBlcmlvZE5vID0gcGhhc2VJbmZvLnBlcmlvZE5vO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMucGVyaW9kTm9TdHIgPSBwaGFzZUluZm8ucGVyaW9kTm9TdHI7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5pc0xvY2FsQ2FsY3VsYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG5lZWRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Y+q5a+55pyJ5YCS6K6h5pe255qE5YePMVxuICAgICAgICAgICAgaWYgKHN0YXR1cy5jb3VudGRvd24gPiAwKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmNvdW50ZG93bi0tO1xuICAgICAgICAgICAgICAgIG5lZWRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWmguaenOWAkuiuoeaXtuWImuWImuWPmOS4ujDvvIznq4vljbPkvb/nlKjmnKzlnLDorqHnrpfliIfmjaLpmLbmrrVcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLmNvdW50ZG93biA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5fZ2V0QXJlbmFDb25maWdCeVJvb21JZChwYXJzZUludChyb29tSWQpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBoYXNlSW5mbyA9IHRoaXMuX2NhbGN1bGF0ZVBoYXNlSW5mbyhjb25maWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeajgOafpeacn+WPt+aYr+WQpuWPmOWMlu+8jOWmguaenOWPmOWMluWImemHjee9ruaKpeWQjeS6uuaVsOWSjOeUqOaIt+aKpeWQjeeKtuaAgVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy5wZXJpb2ROb1N0ciAhPT0gcGhhc2VJbmZvLnBlcmlvZE5vU3RyICYmIHBoYXNlSW5mby5wZXJpb2ROb1N0ciAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy50b3RhbFBsYXllcnMgPSAwOyAgLy8g5pyf5Y+35Y+Y5YyW77yM6YeN572u5oql5ZCN5Lq65pWwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS4jeWcqOacn+WPt+WPmOWMluaXtuWFs+mXreW8ueeql1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW8ueeql+W6lOivpeWPquWcqOi/m+WFpemYtuauteWAkuiuoeaXtue7k+adn+WQjueUseacjeWKoeerr+eahCBhcmVuYV9jbG9zZV9kaWFsb2cg5raI5oGv5YWz6ZetXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkea4hemZpOeUqOaIt+WcqOivpeaIv+mXtOeahOaKpeWQjeeKtuaAgVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhICYmIHdpbmRvdy5hcmVuYURhdGEuX3NpZ25lZFVwQXJlbmFzICYmIHdpbmRvdy5hcmVuYURhdGEuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFBlcmlvZE5vID0gd2luZG93LmFyZW5hRGF0YS5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXS5wZXJpb2RObztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5hcmVuYURhdGEuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hcmVuYURhdGEuc2F2ZVRvTG9jYWwgJiYgd2luZG93LmFyZW5hRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5waGFzZSA9IHBoYXNlSW5mby5waGFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5jb3VudGRvd24gPSBwaGFzZUluZm8uY291bnRkb3duO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmNhblNpZ251cCA9IHBoYXNlSW5mby5jYW5TaWdudXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMucGVyaW9kTm8gPSBwaGFzZUluZm8ucGVyaW9kTm87XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMucGVyaW9kTm9TdHIgPSBwaGFzZUluZm8ucGVyaW9kTm9TdHI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOacieWPmOWMlu+8jOabtOaWsOaYvuekulxuICAgICAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ291bnRkb3duRnJvbUxvY2FsQ2FjaGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeiuoeeul+mYtuauteS/oeaBr++8iOeUqOS6juacrOWcsOagoeWHhu+8iVxuICAgIF9jYWxjdWxhdGVQaGFzZUluZm86IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgICAgICBjb3VudGRvd246IC0xLFxuICAgICAgICAgICAgY2FuU2lnbnVwOiBmYWxzZSxcbiAgICAgICAgICAgIHBlcmlvZE5vOiAwLFxuICAgICAgICAgICAgcGVyaW9kTm9TdHI6IFwiXCIgIC8vIOaWsOWinu+8muWtl+espuS4suagvOW8j+acn+WPt1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdmFyIG1hdGNoVGltZVJhbmdlcyA9IGNvbmZpZy5tYXRjaF90aW1lX3JhbmdlcyB8fCBjb25maWcubWF0Y2hUaW1lUmFuZ2VzO1xuICAgICAgICB2YXIgbWF0Y2hEdXJhdGlvbiA9IGNvbmZpZy5tYXRjaF9kdXJhdGlvbiB8fCBjb25maWcubWF0Y2hEdXJhdGlvbiB8fCBjb25maWcuaW50ZXJ2YWxfbWludXRlcyB8fCBjb25maWcuaW50ZXJ2YWxNaW51dGVzIHx8IDU7XG4gICAgICAgIHZhciByb29tVHlwZSA9IGNvbmZpZy5yb29tX3R5cGUgfHwgY29uZmlnLnJvb21UeXBlIHx8IDA7XG4gICAgICAgIFxuICAgICAgICBpZiAoIW1hdGNoVGltZVJhbmdlcyB8fCAhbWF0Y2hEdXJhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByYW5nZXMgPSB0eXBlb2YgbWF0Y2hUaW1lUmFuZ2VzID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UobWF0Y2hUaW1lUmFuZ2VzKSA6IG1hdGNoVGltZVJhbmdlcztcbiAgICAgICAgICAgIGlmICghcmFuZ2VzIHx8IHJhbmdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50TWludXRlcyA9IG5vdy5nZXRIb3VycygpICogNjAgKyBub3cuZ2V0TWludXRlcygpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTZWNvbmRzID0gbm93LmdldFNlY29uZHMoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50VG90YWxTZWNvbmRzID0gY3VycmVudE1pbnV0ZXMgKiA2MCArIGN1cnJlbnRTZWNvbmRzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmib7liLDlvZPliY3miYDlnKjnmoTml7bpl7TmrrVcbiAgICAgICAgICAgIHZhciBjdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgdmFyIHJhbmdlU3RhcnRNaW51dGVzID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFBhcnRzID0gcmFuZ2Uuc3RhcnQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kUGFydHMgPSByYW5nZS5lbmQuc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRNaW4gPSBwYXJzZUludChzdGFydFBhcnRzWzBdKSAqIDYwICsgcGFyc2VJbnQoc3RhcnRQYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgdmFyIGVuZE1pbiA9IHBhcnNlSW50KGVuZFBhcnRzWzBdKSAqIDYwICsgcGFyc2VJbnQoZW5kUGFydHNbMV0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50TWludXRlcyA+PSBzdGFydE1pbiAmJiBjdXJyZW50TWludXRlcyA8PSBlbmRNaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJhbmdlID0gcmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlU3RhcnRNaW51dGVzID0gc3RhcnRNaW47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCFjdXJyZW50UmFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorqHnrpfku47lvIDotZvml7bpl7TliLDnjrDlnKjnu4/ov4fnmoTnp5LmlbBcbiAgICAgICAgICAgIHZhciByYW5nZVN0YXJ0U2Vjb25kcyA9IHJhbmdlU3RhcnRNaW51dGVzICogNjA7XG4gICAgICAgICAgICB2YXIgZWxhcHNlZFNlY29uZHMgPSBjdXJyZW50VG90YWxTZWNvbmRzIC0gcmFuZ2VTdGFydFNlY29uZHM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKjphY3nva7nmoQgbWF0Y2hEdXJhdGlvbu+8iOWIhumSn++8ie+8jOS4juacjeWKoeerr+S/neaMgeS4gOiHtFxuICAgICAgICAgICAgLy8g5pyN5Yqh56uv5bey5L+u5pS55Li65L2/55SoIG1hdGNoRHVyYXRpb24g6YWN572u77yM5a6i5oi356uv5Lmf5b+F6aG75LiA6Ie0XG4gICAgICAgICAgICAvLyDmr4/mnJ/mgLvml7bplb/vvIjnp5LvvIk9IG1hdGNoRHVyYXRpb27vvIjliIbpkp/vvIkqIDYwXG4gICAgICAgICAgICB2YXIgcGVyaW9kVG90YWxTZWNvbmRzID0gbWF0Y2hEdXJhdGlvbiAqIDYwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlh4blpIfpmLbmrrXvvJrlm7rlrpo2MOenku+8iDHliIbpkp/vvIlcbiAgICAgICAgICAgIHZhciBwcmVwYXJlU2Vjb25kcyA9IDYwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorqHnrpflvZPliY3mnJ/lj7dcbiAgICAgICAgICAgIHZhciBwZXJpb2RObyA9IE1hdGguZmxvb3IoZWxhcHNlZFNlY29uZHMgLyBwZXJpb2RUb3RhbFNlY29uZHMpICsgMTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6K6h566X5pys5pyf5YaF57uP6L+H55qE56eS5pWwXG4gICAgICAgICAgICB2YXIgcGVyaW9kRWxhcHNlZCA9IGVsYXBzZWRTZWNvbmRzICUgcGVyaW9kVG90YWxTZWNvbmRzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR55Sf5oiQ5a2X56ym5Liy5qC85byP5pyf5Y+3XG4gICAgICAgICAgICAvLyDmlrDmoLzlvI86IFlZTU1ERCArIOaIv+mXtElEKDLkvY0pICsg5pyf5bqP5Y+3KDTkvY0pID0gMTLkvY1cbiAgICAgICAgICAgIC8vIOekuuS+izogMjYwNTA2MDEwMDM0ID0gMjAyNuW5tDXmnIg25pel77yM5oi/6Ze0SUQ9Me+8jOesrDAwMzTmnJ9cbiAgICAgICAgICAgIHZhciB5ZWFyID0gU3RyaW5nKG5vdy5nZXRGdWxsWWVhcigpKS5zbGljZSgtMik7ICAvLyDlj5blkI7kuKTkvY1cbiAgICAgICAgICAgIHZhciBtb250aCA9IFN0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICB2YXIgZGF5ID0gU3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICB2YXIgZGF0ZVN0ciA9IHllYXIgKyBtb250aCArIGRheTsgIC8vIFlZTU1ERCAoNuS9jSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5oi/6Ze0SUQgKDLkvY0pXG4gICAgICAgICAgICB2YXIgcm9vbUlkID0gY29uZmlnLmlkIHx8IGNvbmZpZy5yb29tX2lkIHx8IDA7XG4gICAgICAgICAgICB2YXIgcm9vbUlkU3RyID0gU3RyaW5nKHJvb21JZCAlIDEwMCkucGFkU3RhcnQoMiwgJzAnKTsgIC8vIOWPluWQjuS4pOS9jVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmnJ/luo/lj7cgKDTkvY0pXG4gICAgICAgICAgICB2YXIgc2VxU3RyID0gU3RyaW5nKHBlcmlvZE5vKS5wYWRTdGFydCg0LCAnMCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGVyaW9kTm9TdHIgPSBkYXRlU3RyICsgcm9vbUlkU3RyICsgc2VxU3RyOyAgLy8g5oC75YWxMTLkvY1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g56Gu5a6a6Zi25q61XG4gICAgICAgICAgICBpZiAocGVyaW9kRWxhcHNlZCA8IHByZXBhcmVTZWNvbmRzKSB7XG4gICAgICAgICAgICAgICAgLy8g5YeG5aSH6Zi25q61XG4gICAgICAgICAgICAgICAgcmVzdWx0LnBoYXNlID0gMTtcbiAgICAgICAgICAgICAgICByZXN1bHQuY291bnRkb3duID0gcHJlcGFyZVNlY29uZHMgLSBwZXJpb2RFbGFwc2VkO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5jYW5TaWdudXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5oql5ZCN6Zi25q61XG4gICAgICAgICAgICAgICAgcmVzdWx0LnBoYXNlID0gMjtcbiAgICAgICAgICAgICAgICByZXN1bHQuY291bnRkb3duID0gcGVyaW9kVG90YWxTZWNvbmRzIC0gcGVyaW9kRWxhcHNlZDtcbiAgICAgICAgICAgICAgICByZXN1bHQuY2FuU2lnbnVwID0gcmVzdWx0LmNvdW50ZG93biA+IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQucGVyaW9kTm8gPSBwZXJpb2RObztcbiAgICAgICAgICAgIHJlc3VsdC5wZXJpb2ROb1N0ciA9IHBlcmlvZE5vU3RyO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLij7AgW19jYWxjdWxhdGVQaGFzZUluZm9dIGVycm9yOlwiLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLy8g8J+Up+OAkOaWsOWinuOAkeagueaNrnJvb21JZOiOt+WPluernuaKgOWcuumFjee9rlxuICAgIF9nZXRBcmVuYUNvbmZpZ0J5Um9vbUlkOiBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9hcmVuYVJvb21zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXJlbmFSb29tcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2FyZW5hUm9vbXNbaV0uY29uZmlnLmlkID09PSByb29tSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYXJlbmFSb29tc1tpXS5jb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8vIPCflKfjgJDmlrDlop7jgJHku47mnKzlnLDnvJPlrZjmm7TmlrDlgJLorqHml7bmmL7npLpcbiAgICBfdXBkYXRlQ291bnRkb3duRnJvbUxvY2FsQ2FjaGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2FyZW5hUm9vbXMgfHwgIXRoaXMuX2xvY2FsQXJlbmFTdGF0dXMpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIHZhciBjYXJkUGFuZWwgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJDYXJkQ29udGFpbmVyXCIpO1xuICAgICAgICB2YXIgY291bnRkb3duQ29udGFpbmVyID0gY2FyZFBhbmVsID8gY2FyZFBhbmVsLmdldENoaWxkQnlOYW1lKFwiQXJlbmFDb3VudGRvd25zXCIpIDogbnVsbDtcbiAgICAgICAgdmFyIGJ1dHRvbkNvbnRhaW5lciA9IGNhcmRQYW5lbCA/IGNhcmRQYW5lbC5nZXRDaGlsZEJ5TmFtZShcIkFyZW5hU2lnbnVwQnV0dG9uc1wiKSA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FyZW5hUm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gdGhpcy5fYXJlbmFSb29tc1tpXTtcbiAgICAgICAgICAgIHZhciBjb25maWcgPSByb29tLmNvbmZpZztcbiAgICAgICAgICAgIHZhciByb29tSWQgPSBjb25maWcuaWQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiOt+WPluacrOWcsOe8k+WtmOeahOeKtuaAgVxuICAgICAgICAgICAgdmFyIGxvY2FsU3RhdHVzID0gdGhpcy5fbG9jYWxBcmVuYVN0YXR1c1tyb29tSWRdO1xuICAgICAgICAgICAgaWYgKCFsb2NhbFN0YXR1cykgY29udGludWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiOt+WPlueKtuaAgemhueiKgueCuVxuICAgICAgICAgICAgdmFyIHJvb21TdGF0dXNJdGVtID0gY291bnRkb3duQ29udGFpbmVyID8gY291bnRkb3duQ29udGFpbmVyLmdldENoaWxkQnlOYW1lKFwiUm9vbVN0YXR1c0l0ZW1fXCIgKyByb29tSWQpIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghcm9vbVN0YXR1c0l0ZW0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGVyaW9kTGFiZWwgPSByb29tU3RhdHVzSXRlbS5nZXRDaGlsZEJ5TmFtZShcIlBlcmlvZExhYmVsXCIpO1xuICAgICAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSByb29tU3RhdHVzSXRlbS5nZXRDaGlsZEJ5TmFtZShcIlRpdGxlTGFiZWxcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiOt+WPluaKpeWQjeaMiemSrlxuICAgICAgICAgICAgdmFyIHNpZ251cEJ0biA9IGJ1dHRvbkNvbnRhaW5lciA/IGJ1dHRvbkNvbnRhaW5lci5nZXRDaGlsZEJ5TmFtZShcIlNpZ251cEJ0bl9cIiArIHJvb21JZCkgOiBudWxsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmm7TmlrDml7bmnJ/lj7fmmL7npLrvvIjkvb/nlKjmlrDnmoTlrZfnrKbkuLLmoLzlvI/mnJ/lj7fvvIlcbiAgICAgICAgICAgIGlmIChwZXJpb2RMYWJlbCkge1xuICAgICAgICAgICAgICAgIHZhciBwZXJpb2RMYWJlbENvbXAgPSBwZXJpb2RMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgICAgIHZhciBwZXJpb2ROb1N0ciA9IGxvY2FsU3RhdHVzLnBlcmlvZF9ub19zdHIgfHwgbG9jYWxTdGF0dXMucGVyaW9kTm9TdHIgfHwgbG9jYWxTdGF0dXMucGVyaW9kTm87XG4gICAgICAgICAgICAgICAgaWYgKHBlcmlvZE5vU3RyICYmIGxvY2FsU3RhdHVzLnBoYXNlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZExhYmVsQ29tcC5zdHJpbmcgPSBcIuacn+WPtzogXCIgKyBwZXJpb2ROb1N0cjtcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMCk7ICAvLyDph5HoibJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZXJpb2RMYWJlbENvbXAuc3RyaW5nID0gXCLmnJ/lj7c6IC0tXCI7XG4gICAgICAgICAgICAgICAgICAgIHBlcmlvZExhYmVsLmNvbG9yID0gY2MuY29sb3IoMTgwLCAxODAsIDE4MCk7ICAvLyDngbDoibJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOabtOaWsOWAkuiuoeaXtuaYvuekulxuICAgICAgICAgICAgaWYgKHRpdGxlTGFiZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGVMYWJlbENvbXAgPSB0aXRsZUxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICAgICAgdmFyIHBoYXNlID0gbG9jYWxTdGF0dXMucGhhc2UgfHwgMDtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxQbGF5ZXJzID0gbG9jYWxTdGF0dXMudG90YWxfcGxheWVycyB8fCBsb2NhbFN0YXR1cy50b3RhbFBsYXllcnMgfHwgMDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAocGhhc2UgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YeG5aSH6Zi25q61XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWNzID0gbG9jYWxTdGF0dXMuY291bnRkb3duIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlTGFiZWxDb21wLnN0cmluZyA9IFwi5YeG5aSH5LitIFwiICsgc2VjcyArIFwi56eSXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIwMCwgMTAwKTsgIC8vIOapmeiJslxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGhhc2UgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5oql5ZCN6Zi25q61XG4gICAgICAgICAgICAgICAgICAgIHZhciBtaW5zID0gTWF0aC5mbG9vcigobG9jYWxTdGF0dXMuY291bnRkb3duIHx8IDApIC8gNjApO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VjcyA9IChsb2NhbFN0YXR1cy5jb3VudGRvd24gfHwgMCkgJSA2MDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvdW50ZG93blN0ciA9IChtaW5zIDwgMTAgPyAnMCcgOiAnJykgKyBtaW5zICsgJzonICsgKHNlY3MgPCAxMCA/ICcwJyA6ICcnKSArIHNlY3M7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlTGFiZWxDb21wLnN0cmluZyA9IFwi5oql5ZCN5LitIFwiICsgY291bnRkb3duU3RyICsgXCIgKFwiICsgdG90YWxQbGF5ZXJzICsgXCLkuropXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlTGFiZWwuY29sb3IgPSBjYy5jb2xvcigwLCAyNTUsIDEwMCk7ICAvLyDnu7/oibJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDmnKrphY3nva7mr5TotZvml7bpl7TmiJbova7mrKFcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVMYWJlbENvbXAuc3RyaW5nID0gXCLmmoLmnKrlvIDmlL5cIjtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGVMYWJlbC5jb2xvciA9IGNjLmNvbG9yKDIwMCwgMjAwLCAyMDApOyAgLy8g5rWF54Gw6ImyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmm7TmlrDmiqXlkI3mjInpkq7nirbmgIFcbiAgICAgICAgICAgIGlmIChzaWdudXBCdG4pIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gc2lnbnVwQnRuLmdldENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgICAgIHZhciBidXR0b24gPSBzaWdudXBCdG4uZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5oyJ6ZKu5bC65a+477yaMTYweDY1XG4gICAgICAgICAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgICAgICAgICB2YXIgZml4ZWRXaWR0aCA9IDE2MDtcbiAgICAgICAgICAgICAgICB2YXIgZml4ZWRIZWlnaHQgPSA2NTtcbiAgICAgICAgICAgICAgICBzaWdudXBCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZShmaXhlZFdpZHRoLCBmaXhlZEhlaWdodCkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBwaGFzZSA9IGxvY2FsU3RhdHVzLnBoYXNlIHx8IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHBoYXNlICE9PSAyIHx8ICFsb2NhbFN0YXR1cy5jYW5TaWdudXApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5LiN5Zyo5oql5ZCN6Zi25q615oiW5LiN6IO95oql5ZCN77ya5pi+56S656aB55So5oyJ6ZKuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaWdudXBCdG5GcmFtZXMgJiYgdGhpcy5fc2lnbnVwQnRuRnJhbWVzWydidG5fbm9fYmFvbWluZyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSB0aGlzLl9zaWdudXBCdG5GcmFtZXNbJ2J0bl9ub19iYW9taW5nJ107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2lnbnVwQnRuLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChidXR0b24pIGJ1dHRvbi5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+l5piv5ZCm5bey5oql5ZCNXG4gICAgICAgICAgICAgICAgICAgIHZhciBpc1NpZ25lZFVwID0gd2luZG93LmFyZW5hRGF0YSAmJiB3aW5kb3cuYXJlbmFEYXRhLmlzU2lnbmVkVXAocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1NpZ25lZFVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlt7LmiqXlkI3vvJrmmL7npLrlj5bmtojmiqXlkI1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaWdudXBCdG5GcmFtZXMgJiYgdGhpcy5fc2lnbnVwQnRuRnJhbWVzWydidG5fcXV4aWFvYmFvbWluZyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gdGhpcy5fc2lnbnVwQnRuRnJhbWVzWydidG5fcXV4aWFvYmFvbWluZyddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbnVwQnRuLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnV0dG9uKSBidXR0b24uZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmnKrmiqXlkI3vvJrmmL7npLrmiqXlkI3mjInpkq5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zaWdudXBCdG5GcmFtZXMgJiYgdGhpcy5fc2lnbnVwQnRuRnJhbWVzWydidG5fYmFvbWluZyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gdGhpcy5fc2lnbnVwQnRuRnJhbWVzWydidG5fYmFvbWluZyddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbnVwQnRuLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnV0dG9uKSBidXR0b24uZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5qC55o2u5pyN5Yqh56uv5o6o6YCB5pu05paw5YCS6K6h5pe25pi+56S6XG4gICAgLy8g8J+Up+OAkOS/neeVmeOAkeWFvOWuueaXp+mAu+i+ke+8jOS9huaWsOmAu+i+keS9v+eUqCBfb25BcmVuYVN0YXR1c1B1c2hcbiAgICBfdXBkYXRlQ291bnRkb3duRnJvbVNlcnZlcjogZnVuY3Rpb24oYXJlbmFzKSB7XG4gICAgICAgIC8vIOebtOaOpeiwg+eUqOaWsOeahOWkhOeQhuWHveaVsFxuICAgICAgICB0aGlzLl9vbkFyZW5hU3RhdHVzUHVzaChhcmVuYXMpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5pu05paw5YCS6K6h5pe25pi+56S6XG4gICAgLy8g8J+Up+OAkOS/ruaUueOAkeeOsOWcqOS9v+eUqOacrOWcsOe8k+WtmO+8jOS4jeWGjeacrOWcsOiuoeeul1xuICAgIF91cGRhdGVDb3VudGRvd25EaXNwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g55u05o6l5L2/55So5pys5Zyw57yT5a2Y5pu05paw5pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvdW50ZG93bkZyb21Mb2NhbENhY2hlKCk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDmm7TmlrDnq57mioDlnLrmiqXlkI3nirbmgIFVSe+8iOS9v+eUqOWbvueJh+i1hOa6kO+8iVxuICAgIF91cGRhdGVBcmVuYVNpZ251cFN0YXR1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOebtOaOpeiwg+eUqOWAkuiuoeaXtuabtOaWsOWHveaVsO+8jOWug+W3sue7j+WMheWQq+S6huaMiemSrueKtuaAgeabtOaWsFxuICAgICAgICB0aGlzLl91cGRhdGVDb3VudGRvd25EaXNwbGF5KCk7XG4gICAgfSxcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmmL7npLrliqDovb3ov5vluqbmnaFcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBfc2hvd0xvYWRpbmdQcm9ncmVzczogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuWKoOi9veeVjOmdouWuueWZqO+8iOWFqOWxj++8iVxuICAgICAgICB2YXIgbG9hZGluZ05vZGUgPSBuZXcgY2MuTm9kZShcIkxvYWRpbmdQcm9ncmVzc05vZGVcIik7XG4gICAgICAgIGxvYWRpbmdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBsb2FkaW5nTm9kZS54ID0gMDtcbiAgICAgICAgbG9hZGluZ05vZGUueSA9IDA7XG4gICAgICAgIGxvYWRpbmdOb2RlLnpJbmRleCA9IDMwMDA7XG4gICAgICAgIGxvYWRpbmdOb2RlLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWNiumAj+aYjum7keiJsuiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ1wiKTtcbiAgICAgICAgYmdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICB2YXIgYmdHcmFwaGljcyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZ0dyYXBoaWNzLmZpbGxDb2xvciA9IGNjLmNvbG9yKDIwLCAyMCwgNDAsIDI1MCk7XG4gICAgICAgIGJnR3JhcGhpY3MucmVjdCgtc2NyZWVuV2lkdGgvMiwgLXNjcmVlbkhlaWdodC8yLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KTtcbiAgICAgICAgYmdHcmFwaGljcy5maWxsKCk7XG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOijhemlsOaAp+iDjOaZr+WbvuahiFxuICAgICAgICB0aGlzLl9hZGRMb2FkaW5nRGVjb3JhdGlvbnMobG9hZGluZ05vZGUsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKY5paH5a2XXG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZU5vZGUueSA9IDE1MDtcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgdGl0bGVMYWJlbC5zdHJpbmcgPSBcIuaWl+WcsOS4u1wiO1xuICAgICAgICB0aXRsZUxhYmVsLmZvbnRTaXplID0gNTY7XG4gICAgICAgIHRpdGxlTGFiZWwubGluZUhlaWdodCA9IDcyO1xuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpdGxlTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjE1LCAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOagh+mimOaPj+i+uVxuICAgICAgICB2YXIgdGl0bGVPdXRsaW5lID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xuICAgICAgICB0aXRsZU91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigxMzksIDY5LCAxOSk7XG4gICAgICAgIHRpdGxlT3V0bGluZS53aWR0aCA9IDM7XG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaIv+mXtOWQjeensFxuICAgICAgICB2YXIgcm9vbU5hbWVOb2RlID0gbmV3IGNjLk5vZGUoXCJSb29tTmFtZVwiKTtcbiAgICAgICAgcm9vbU5hbWVOb2RlLnkgPSA4MDtcbiAgICAgICAgdmFyIHJvb21OYW1lTGFiZWwgPSByb29tTmFtZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcm9vbU5hbWVMYWJlbC5zdHJpbmcgPSBcIui/m+WFpeOAkFwiICsgcm9vbUNvbmZpZy5yb29tX25hbWUgKyBcIuOAkVwiO1xuICAgICAgICByb29tTmFtZUxhYmVsLmZvbnRTaXplID0gMzI7XG4gICAgICAgIHJvb21OYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgcm9vbU5hbWVOb2RlLmNvbG9yID0gY2MuY29sb3IoMjAwLCAyMDAsIDIyMCk7XG4gICAgICAgIHJvb21OYW1lTm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWKoOi9veaPkOekuuaWh+Wtl1xuICAgICAgICB2YXIgdGlwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGlwXCIpO1xuICAgICAgICB0aXBOb2RlLnkgPSAtMTAwO1xuICAgICAgICB2YXIgdGlwTGFiZWwgPSB0aXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpcExhYmVsLnN0cmluZyA9IFwi5q2j5Zyo5Yqg6L296LWE5rqQLi4uXCI7XG4gICAgICAgIHRpcExhYmVsLmZvbnRTaXplID0gMjQ7XG4gICAgICAgIHRpcExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigxNTAsIDE1MCwgMTcwKTtcbiAgICAgICAgdGlwTm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOi/m+W6puadoeiDjOaZr1xuICAgICAgICB2YXIgcHJvZ3Jlc3NCZyA9IG5ldyBjYy5Ob2RlKFwiUHJvZ3Jlc3NCZ1wiKTtcbiAgICAgICAgcHJvZ3Jlc3NCZy5zZXRDb250ZW50U2l6ZShjYy5zaXplKDUwMCwgMzApKTtcbiAgICAgICAgcHJvZ3Jlc3NCZy55ID0gLTE2MDtcbiAgICAgICAgdmFyIHByb2dyZXNzQmdHcmFwaGljcyA9IHByb2dyZXNzQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgcHJvZ3Jlc3NCZ0dyYXBoaWNzLmZpbGxDb2xvciA9IGNjLmNvbG9yKDQwLCA0MCwgNjAsIDI1NSk7XG4gICAgICAgIHByb2dyZXNzQmdHcmFwaGljcy5yb3VuZFJlY3QoLTI1MCwgLTE1LCA1MDAsIDMwLCAxNSk7XG4gICAgICAgIHByb2dyZXNzQmdHcmFwaGljcy5maWxsKCk7XG4gICAgICAgIHByb2dyZXNzQmdHcmFwaGljcy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDgwLCA4MCwgMTAwKTtcbiAgICAgICAgcHJvZ3Jlc3NCZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIHByb2dyZXNzQmdHcmFwaGljcy5yb3VuZFJlY3QoLTI1MCwgLTE1LCA1MDAsIDMwLCAxNSk7XG4gICAgICAgIHByb2dyZXNzQmdHcmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgcHJvZ3Jlc3NCZy5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOi/m+W6puadoeWhq+WFhVxuICAgICAgICB2YXIgcHJvZ3Jlc3NGaWxsID0gbmV3IGNjLk5vZGUoXCJQcm9ncmVzc0ZpbGxcIik7XG4gICAgICAgIHByb2dyZXNzRmlsbC55ID0gLTE2MDtcbiAgICAgICAgdmFyIHByb2dyZXNzRmlsbEdyYXBoaWNzID0gcHJvZ3Jlc3NGaWxsLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIHByb2dyZXNzRmlsbC5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOi/m+W6pueZvuWIhuavlOaWh+Wtl1xuICAgICAgICB2YXIgcGVyY2VudE5vZGUgPSBuZXcgY2MuTm9kZShcIlBlcmNlbnRcIik7XG4gICAgICAgIHBlcmNlbnROb2RlLnkgPSAtMTYwO1xuICAgICAgICB2YXIgcGVyY2VudExhYmVsID0gcGVyY2VudE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcGVyY2VudExhYmVsLnN0cmluZyA9IFwiMCVcIjtcbiAgICAgICAgcGVyY2VudExhYmVsLmZvbnRTaXplID0gMjA7XG4gICAgICAgIHBlcmNlbnRMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBwZXJjZW50Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBwZXJjZW50Tm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW6lemDqOaPkOekulxuICAgICAgICB2YXIgYm90dG9tVGlwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQm90dG9tVGlwXCIpO1xuICAgICAgICBib3R0b21UaXBOb2RlLnkgPSAtMjIwO1xuICAgICAgICB2YXIgYm90dG9tVGlwTGFiZWwgPSBib3R0b21UaXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGJvdHRvbVRpcExhYmVsLnN0cmluZyA9IFwi5q2j5Zyo6L+e5o6l5pyN5Yqh5ZmoLi4uXCI7XG4gICAgICAgIGJvdHRvbVRpcExhYmVsLmZvbnRTaXplID0gMTg7XG4gICAgICAgIGJvdHRvbVRpcExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGJvdHRvbVRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigxMDAsIDEwMCwgMTIwKTtcbiAgICAgICAgYm90dG9tVGlwTm9kZS5wYXJlbnQgPSBsb2FkaW5nTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWKoOi9veaPkOekuuaWh+Wtl+aVsOe7hFxuICAgICAgICB2YXIgbG9hZGluZ1RpcHMgPSBbXG4gICAgICAgICAgICBcIuato+WcqOWKoOi9vei1hOa6kC4uLlwiLFxuICAgICAgICAgICAgXCLmraPlnKjov57mjqXmnI3liqHlmaguLi5cIixcbiAgICAgICAgICAgIFwi5q2j5Zyo6I635Y+W5oi/6Ze05YiX6KGoLi4uXCIsXG4gICAgICAgICAgICBcIuato+WcqOWHhuWkh+a4uOaIj+aVsOaNri4uLlwiLFxuICAgICAgICAgICAgXCLljbPlsIbov5vlhaXmiL/pl7QuLi5cIlxuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgLy8g6L+b5bqm5Yqo55S7XG4gICAgICAgIHZhciBwcm9ncmVzcyA9IDA7XG4gICAgICAgIHZhciB0YXJnZXRQcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgdmFyIHRpcEluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cGRhdGVQcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHByb2dyZXNzID49IHRhcmdldFByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgLy8g6L+b5bqm5a6M5oiQ77yM5pi+56S65oi/6Ze05YiX6KGo5Zy65pmvXG4gICAgICAgICAgICAgICAgc2VsZi5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkaW5nTm9kZSAmJiBsb2FkaW5nTm9kZS5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkaW5nTm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd1Jvb21MaXN0U2NlbmUocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICAgICAgfSwgMC4zKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWinuWKoOi/m+W6plxuICAgICAgICAgICAgcHJvZ3Jlc3MgKz0gMjtcbiAgICAgICAgICAgIGlmIChwcm9ncmVzcyA+IHRhcmdldFByb2dyZXNzKSBwcm9ncmVzcyA9IHRhcmdldFByb2dyZXNzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmm7TmlrDov5vluqbmnaHloavlhYVcbiAgICAgICAgICAgIHZhciBmaWxsV2lkdGggPSAocHJvZ3Jlc3MgLyAxMDApICogNDgwO1xuICAgICAgICAgICAgcHJvZ3Jlc3NGaWxsR3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgICAgIGlmIChmaWxsV2lkdGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8g5riQ5Y+Y6Imy5pWI5p6cXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NGaWxsR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoNzYsIDE3NSwgODApO1xuICAgICAgICAgICAgICAgIHByb2dyZXNzRmlsbEdyYXBoaWNzLnJvdW5kUmVjdCgtMjQwLCAtMTIsIGZpbGxXaWR0aCwgMjQsIDEyKTtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0ZpbGxHcmFwaGljcy5maWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOabtOaWsOeZvuWIhuavlOaWh+Wtl1xuICAgICAgICAgICAgcGVyY2VudExhYmVsLnN0cmluZyA9IHByb2dyZXNzICsgXCIlXCI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOabtOaWsOWKoOi9veaPkOekuuaWh+Wtl1xuICAgICAgICAgICAgdmFyIG5ld1RpcEluZGV4ID0gTWF0aC5mbG9vcihwcm9ncmVzcyAvIDIwKTtcbiAgICAgICAgICAgIGlmIChuZXdUaXBJbmRleCA8IGxvYWRpbmdUaXBzLmxlbmd0aCAmJiBuZXdUaXBJbmRleCAhPT0gdGlwSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aXBJbmRleCA9IG5ld1RpcEluZGV4O1xuICAgICAgICAgICAgICAgIHRpcExhYmVsLnN0cmluZyA9IGxvYWRpbmdUaXBzW3RpcEluZGV4XTtcbiAgICAgICAgICAgICAgICBib3R0b21UaXBMYWJlbC5zdHJpbmcgPSBsb2FkaW5nVGlwc1t0aXBJbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKHVwZGF0ZVByb2dyZXNzLCAwLjA1KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8gOWni+i/m+W6puWKqOeUu1xuICAgICAgICB1cGRhdGVQcm9ncmVzcygpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5re75Yqg5Yqg6L2955WM6Z2i6KOF6aWwXG4gICAgX2FkZExvYWRpbmdEZWNvcmF0aW9uczogZnVuY3Rpb24ocGFyZW50Tm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkge1xuICAgICAgICAvLyDmt7vliqDmiZHlhYvniYzoo4XppbDvvIjlm5vop5LvvIlcbiAgICAgICAgdmFyIGNhcmRTeW1ib2xzID0gW1wi4pmgXCIsIFwi4pmlXCIsIFwi4pmjXCIsIFwi4pmmXCJdO1xuICAgICAgICB2YXIgY2FyZENvbG9ycyA9IFtcbiAgICAgICAgICAgIGNjLmNvbG9yKDUwLCA1MCwgNzAsIDEwMCksXG4gICAgICAgICAgICBjYy5jb2xvcigxODAsIDUwLCA1MCwgMTAwKSxcbiAgICAgICAgICAgIGNjLmNvbG9yKDUwLCA1MCwgNzAsIDEwMCksXG4gICAgICAgICAgICBjYy5jb2xvcigxODAsIDUwLCA1MCwgMTAwKVxuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIGNjLnYyKC1zY3JlZW5XaWR0aC8yICsgODAsIHNjcmVlbkhlaWdodC8yIC0gODApLFxuICAgICAgICAgICAgY2MudjIoc2NyZWVuV2lkdGgvMiAtIDgwLCBzY3JlZW5IZWlnaHQvMiAtIDgwKSxcbiAgICAgICAgICAgIGNjLnYyKC1zY3JlZW5XaWR0aC8yICsgODAsIC1zY3JlZW5IZWlnaHQvMiArIDgwKSxcbiAgICAgICAgICAgIGNjLnYyKHNjcmVlbldpZHRoLzIgLSA4MCwgLXNjcmVlbkhlaWdodC8yICsgODApXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN5bWJvbE5vZGUgPSBuZXcgY2MuTm9kZShcIkNhcmRTeW1ib2xcIiArIGkpO1xuICAgICAgICAgICAgc3ltYm9sTm9kZS5zZXRQb3NpdGlvbihwb3NpdGlvbnNbaV0pO1xuICAgICAgICAgICAgdmFyIHN5bWJvbExhYmVsID0gc3ltYm9sTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgc3ltYm9sTGFiZWwuc3RyaW5nID0gY2FyZFN5bWJvbHNbaV07XG4gICAgICAgICAgICBzeW1ib2xMYWJlbC5mb250U2l6ZSA9IDYwO1xuICAgICAgICAgICAgc3ltYm9sTm9kZS5jb2xvciA9IGNhcmRDb2xvcnNbaV07XG4gICAgICAgICAgICBzeW1ib2xOb2RlLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaYvuekuuaIv+mXtOWIl+ihqOWcuuaZr++8iOWFqOWxj+a4uOaIj+eVjOmdou+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93Um9vbUxpc3RTY2VuZTogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDnp7vpmaTml6fnmoTnlYzpnaJcbiAgICAgICAgdmFyIG9sZFNjZW5lID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiUm9vbUxpc3RTY2VuZVwiKTtcbiAgICAgICAgaWYgKG9sZFNjZW5lKSBvbGRTY2VuZS5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65YWo5bGP5oi/6Ze05YiX6KGo5Zy65pmvXG4gICAgICAgIHZhciBzY2VuZU5vZGUgPSBuZXcgY2MuTm9kZShcIlJvb21MaXN0U2NlbmVcIik7XG4gICAgICAgIHNjZW5lTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKTtcbiAgICAgICAgc2NlbmVOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIHNjZW5lTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBzY2VuZU5vZGUueCA9IDA7XG4gICAgICAgIHNjZW5lTm9kZS55ID0gMDtcbiAgICAgICAgc2NlbmVOb2RlLnpJbmRleCA9IDI1MDA7XG4gICAgICAgIHNjZW5lTm9kZS5wYXJlbnQgPSB0aGlzLm5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDog4zmma/lsYIgPT09PT1cbiAgICAgICAgdGhpcy5fY3JlYXRlUm9vbUxpc3RCYWNrZ3JvdW5kKHNjZW5lTm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDpobbpg6jmoIfpopjljLrln58gPT09PT1cbiAgICAgICAgdGhpcy5fY3JlYXRlUm9vbUxpc3RIZWFkZXIoc2NlbmVOb2RlLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCByb29tQ29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09IOaTjeS9nOaMiemSruWMuuWfnyA9PT09PVxuICAgICAgICB0aGlzLl9jcmVhdGVSb29tTGlzdEFjdGlvbnMoc2NlbmVOb2RlLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09IOaIv+mXtOWIl+ihqOWMuuWfnyA9PT09PVxuICAgICAgICB0aGlzLl9jcmVhdGVSb29tTGlzdENvbnRlbnQoc2NlbmVOb2RlLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09IOW6lemDqOS/oeaBr+agjyA9PT09PVxuICAgICAgICB0aGlzLl9jcmVhdGVSb29tTGlzdEZvb3RlcihzY2VuZU5vZGUsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHBsYXllckdvbGQsIHJvb21Db25maWcpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu66IOM5pmvXG4gICAgX2NyZWF0ZVJvb21MaXN0QmFja2dyb3VuZDogZnVuY3Rpb24ocGFyZW50Tm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkge1xuICAgICAgICAvLyDkuLvog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmdMYXllclwiKTtcbiAgICAgICAgYmdOb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGJnR3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYmdHcmFwaGljcy5maWxsQ29sb3IgPSBjYy5jb2xvcigyMCwgMjUsIDQ1LCAyNTUpO1xuICAgICAgICBiZ0dyYXBoaWNzLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbCgpO1xuICAgICAgICBiZ05vZGUucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOijhemlsOi+ueahhlxuICAgICAgICB2YXIgYm9yZGVyTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQm9yZGVyXCIpO1xuICAgICAgICB2YXIgYm9yZGVyR3JhcGhpY3MgPSBib3JkZXJOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJvcmRlckdyYXBoaWNzLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTgwLCAxNDAsIDYwLCAxNTApO1xuICAgICAgICBib3JkZXJHcmFwaGljcy5saW5lV2lkdGggPSAzO1xuICAgICAgICBib3JkZXJHcmFwaGljcy5yb3VuZFJlY3QoLXNjcmVlbldpZHRoLzIgKyA1LCAtc2NyZWVuSGVpZ2h0LzIgKyA1LCBzY3JlZW5XaWR0aCAtIDEwLCBzY3JlZW5IZWlnaHQgLSAxMCwgMTApO1xuICAgICAgICBib3JkZXJHcmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgYm9yZGVyTm9kZS5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g6KeS6JC96KOF6aWwXG4gICAgICAgIHZhciBjb3JuZXJzID0gW1xuICAgICAgICAgICAgeyB4OiAtc2NyZWVuV2lkdGgvMiArIDMwLCB5OiBzY3JlZW5IZWlnaHQvMiAtIDMwLCByb3Q6IDAgfSxcbiAgICAgICAgICAgIHsgeDogc2NyZWVuV2lkdGgvMiAtIDMwLCB5OiBzY3JlZW5IZWlnaHQvMiAtIDMwLCByb3Q6IDkwIH0sXG4gICAgICAgICAgICB7IHg6IHNjcmVlbldpZHRoLzIgLSAzMCwgeTogLXNjcmVlbkhlaWdodC8yICsgMzAsIHJvdDogMTgwIH0sXG4gICAgICAgICAgICB7IHg6IC1zY3JlZW5XaWR0aC8yICsgMzAsIHk6IC1zY3JlZW5IZWlnaHQvMiArIDMwLCByb3Q6IDI3MCB9XG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcm5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBjb3JuZXJzW2ldO1xuICAgICAgICAgICAgdmFyIGNvcm5lck5vZGUgPSBuZXcgY2MuTm9kZShcIkNvcm5lclwiICsgaSk7XG4gICAgICAgICAgICBjb3JuZXJOb2RlLnNldFBvc2l0aW9uKGNvcm5lci54LCBjb3JuZXIueSk7XG4gICAgICAgICAgICBjb3JuZXJOb2RlLmFuZ2xlID0gLWNvcm5lci5yb3Q7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjZyA9IGNvcm5lck5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgICAgIGNnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjIwLCAxODAsIDgwLCAyMDApO1xuICAgICAgICAgICAgY2cubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgIGNnLm1vdmVUbygwLCAwKTtcbiAgICAgICAgICAgIGNnLmxpbmVUbyg0MCwgMCk7XG4gICAgICAgICAgICBjZy5saW5lVG8oNDAsIDE1KTtcbiAgICAgICAgICAgIGNnLm1vdmVUbygwLCAwKTtcbiAgICAgICAgICAgIGNnLmxpbmVUbygwLCA0MCk7XG4gICAgICAgICAgICBjZy5saW5lVG8oMTUsIDQwKTtcbiAgICAgICAgICAgIGNnLnN0cm9rZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb3JuZXJOb2RlLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOWIm+W7uumhtumDqOagh+mimOWMuuWfn1xuICAgIF9jcmVhdGVSb29tTGlzdEhlYWRlcjogZnVuY3Rpb24ocGFyZW50Tm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgcm9vbUNvbmZpZykge1xuICAgICAgICB2YXIgaGVhZGVyWSA9IHNjcmVlbkhlaWdodC8yIC0gNTU7XG4gICAgICAgIHZhciBoZWFkZXJIZWlnaHQgPSA4MDsgIC8vIOWinuWKoOagh+mimOagj+mrmOW6plxuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKY6IOM5pmvXG4gICAgICAgIHZhciBoZWFkZXJCZyA9IG5ldyBjYy5Ob2RlKFwiSGVhZGVyQmdcIik7XG4gICAgICAgIGhlYWRlckJnLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGggLSA2MCwgaGVhZGVySGVpZ2h0KSk7XG4gICAgICAgIGhlYWRlckJnLnNldFBvc2l0aW9uKDAsIGhlYWRlclkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGhnID0gaGVhZGVyQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgaGcuZmlsbENvbG9yID0gY2MuY29sb3IoMzUsIDMwLCA1MCwgMjQwKTtcbiAgICAgICAgaGcucm91bmRSZWN0KC0oc2NyZWVuV2lkdGggLSA2MCkvMiwgLWhlYWRlckhlaWdodC8yLCBzY3JlZW5XaWR0aCAtIDYwLCBoZWFkZXJIZWlnaHQsIDgpO1xuICAgICAgICBoZy5maWxsKCk7XG4gICAgICAgIGhnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTgwLCAxNDAsIDYwLCAyMDApO1xuICAgICAgICBoZy5saW5lV2lkdGggPSAyO1xuICAgICAgICBoZy5yb3VuZFJlY3QoLShzY3JlZW5XaWR0aCAtIDYwKS8yLCAtaGVhZGVySGVpZ2h0LzIsIHNjcmVlbldpZHRoIC0gNjAsIGhlYWRlckhlaWdodCwgOCk7XG4gICAgICAgIGhnLnN0cm9rZSgpO1xuICAgICAgICBoZWFkZXJCZy5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5bem5L6n6KOF6aWwXG4gICAgICAgIHZhciBsZWZ0RGVjbyA9IG5ldyBjYy5Ob2RlKFwiTGVmdERlY29cIik7XG4gICAgICAgIGxlZnREZWNvLnNldFBvc2l0aW9uKC1zY3JlZW5XaWR0aC8yICsgODAsIGhlYWRlclkpO1xuICAgICAgICB2YXIgbGQgPSBsZWZ0RGVjby5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBsZC5maWxsQ29sb3IgPSBjYy5jb2xvcigyMDAsIDE2MCwgNjAsIDIyMCk7XG4gICAgICAgIGxkLmNpcmNsZSgwLCAwLCA4KTtcbiAgICAgICAgbGQuZmlsbCgpO1xuICAgICAgICBsZWZ0RGVjby5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Y+z5L6n6KOF6aWwXG4gICAgICAgIHZhciByaWdodERlY28gPSBuZXcgY2MuTm9kZShcIlJpZ2h0RGVjb1wiKTtcbiAgICAgICAgcmlnaHREZWNvLnNldFBvc2l0aW9uKHNjcmVlbldpZHRoLzIgLSA4MCwgaGVhZGVyWSk7XG4gICAgICAgIHZhciByZCA9IHJpZ2h0RGVjby5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICByZC5maWxsQ29sb3IgPSBjYy5jb2xvcigyMDAsIDE2MCwgNjAsIDIyMCk7XG4gICAgICAgIHJkLmNpcmNsZSgwLCAwLCA4KTtcbiAgICAgICAgcmQuZmlsbCgpO1xuICAgICAgICByaWdodERlY28ucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaIv+mXtOWQjeensCAtIOS9jeS6juagh+mimOagj+S4iuWNiumDqOWIhlxuICAgICAgICB2YXIgdGl0bGVUZXh0ID0gbmV3IGNjLk5vZGUoXCJUaXRsZVRleHRcIik7XG4gICAgICAgIHRpdGxlVGV4dC5zZXRQb3NpdGlvbigwLCBoZWFkZXJZICsgMTIpOyAgLy8g5LiK56e75Yiw5qCH6aKY5qCP5LiK5Y2K6YOo5YiGXG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aXRsZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gcm9vbUNvbmZpZy5yb29tX25hbWUgfHwgXCLmuLjmiI/miL/pl7RcIjtcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDI4OyAgLy8g6LCD5pW05a2X5L2T5aSn5bCPXG4gICAgICAgIHRpdGxlTGFiZWwubGluZUhlaWdodCA9IDM2O1xuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpdGxlVGV4dC5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjIwLCAxMDApO1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgdGl0bGVPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoODAsIDUwLCAwKTtcbiAgICAgICAgdGl0bGVPdXRsaW5lLndpZHRoID0gMjtcbiAgICAgICAgdGl0bGVUZXh0LnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDlia/moIfpopggLSDkvY3kuo7moIfpopjmoI/kuIvljYrpg6jliIbvvIzkuI7moIfpopjliIblvIBcbiAgICAgICAgdmFyIHN1YlRleHQgPSBuZXcgY2MuTm9kZShcIlN1YlRleHRcIik7XG4gICAgICAgIHN1YlRleHQuc2V0UG9zaXRpb24oMCwgaGVhZGVyWSAtIDE0KTsgIC8vIOS4i+enu+WIsOagh+mimOagj+S4i+WNiumDqOWIhlxuICAgICAgICBzdWJUZXh0LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHN1YlRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIHZhciBzdWJMYWJlbCA9IHN1YlRleHQuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgc3ViTGFiZWwuc3RyaW5nID0gXCLlupXliIYgXCIgKyAocm9vbUNvbmZpZy5iYXNlX3Njb3JlIHx8IDEpICsgXCIgIMK3ICDlgI3njocgXCIgKyAocm9vbUNvbmZpZy5tdWx0aXBsaWVyIHx8IDEpICsgXCJ4XCI7XG4gICAgICAgIHN1YkxhYmVsLmZvbnRTaXplID0gMTg7ICAvLyDlop7lpKflrZfkvZNcbiAgICAgICAgc3ViTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgc3ViVGV4dC5jb2xvciA9IGNjLmNvbG9yKDIwMCwgMTgwLCAxNDApO1xuICAgICAgICBzdWJUZXh0LnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rmk43kvZzmjInpkq7ljLrln58gLSDnroDmtIHmuIXmmbDnmoTorr7orqFcbiAgICBfY3JlYXRlUm9vbUxpc3RBY3Rpb25zOiBmdW5jdGlvbihwYXJlbnROb2RlLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8vIOaTjeS9nOagj+iDjOaZryAtIOWinuWKoOmrmOW6puS7peWuuee6s+abtOWkp+eahOWFg+e0oFxuICAgICAgICB2YXIgYWN0aW9uQmFyWSA9IHNjcmVlbkhlaWdodC8yIC0gMTI1O1xuICAgICAgICB2YXIgYWN0aW9uQmFySGVpZ2h0ID0gNjU7ICAvLyDlop7liqDpq5jluqZcbiAgICAgICAgXG4gICAgICAgIHZhciBhY3Rpb25CYXJCZyA9IG5ldyBjYy5Ob2RlKFwiQWN0aW9uQmFyQmdcIik7XG4gICAgICAgIGFjdGlvbkJhckJnLnNldFBvc2l0aW9uKDAsIGFjdGlvbkJhclkpO1xuICAgICAgICB2YXIgYWJnID0gYWN0aW9uQmFyQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYWJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDMwLCAyNywgNDUsIDIzMCk7XG4gICAgICAgIGFiZy5yb3VuZFJlY3QoLXNjcmVlbldpZHRoLzIgKyAzMCwgLWFjdGlvbkJhckhlaWdodC8yLCBzY3JlZW5XaWR0aCAtIDYwLCBhY3Rpb25CYXJIZWlnaHQsIDYpO1xuICAgICAgICBhYmcuZmlsbCgpO1xuICAgICAgICBhY3Rpb25CYXJCZy5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g5bem5L6n77ya5oi/6Ze05Y+36L6T5YWl5ZKM5Yqg5YWl5oyJ6ZKuID09PT09XG4gICAgICAgIHZhciBsZWZ0WCA9IC1zY3JlZW5XaWR0aC8yICsgMjAwOyAgLy8g6LCD5pW05L2N572uXG4gICAgICAgIFxuICAgICAgICAvLyDovpPlhaXmoYYgLSDlop7liqDlrr3luqZcbiAgICAgICAgdmFyIHJvb21Db2RlSW5wdXQgPSB0aGlzLl9jcmVhdGVTaW1wbGVJbnB1dEJveChcbiAgICAgICAgICAgIFwi6L6T5YWl5oi/6Ze05Y+3XCIsXG4gICAgICAgICAgICBsZWZ0WCwgYWN0aW9uQmFyWSxcbiAgICAgICAgICAgIDE4MCwgNDQgIC8vIOWinuWKoOWwuuWvuFxuICAgICAgICApO1xuICAgICAgICByb29tQ29kZUlucHV0LnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDliqDlhaXmiL/pl7TmjInpkq4gLSDlop7liqDlrr3luqZcbiAgICAgICAgdmFyIGpvaW5CdG4gPSB0aGlzLl9jcmVhdGVBY3Rpb25CdXR0b24oXG4gICAgICAgICAgICBcIuWKoOWFpeaIv+mXtFwiLFxuICAgICAgICAgICAgY2MuY29sb3IoNzYsIDE3NSwgODApLCAgLy8g57u/6ImyXG4gICAgICAgICAgICBsZWZ0WCArIDE2MCwgYWN0aW9uQmFyWSxcbiAgICAgICAgICAgIDExMCwgNDQsICAvLyDlop7liqDlsLrlr7hcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IHBhcmVudE5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJSb29tQ29kZUlucHV0XCIpO1xuICAgICAgICAgICAgICAgIHZhciBlZGl0Qm94ID0gaW5wdXQgPyBpbnB1dC5nZXRDb21wb25lbnQoY2MuRWRpdEJveCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHZhciBjb2RlID0gZWRpdEJveCA/IGVkaXRCb3guc3RyaW5nIDogXCJcIjtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSAmJiBjb2RlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fam9pblJvb20oY29kZSwgcm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd1RpcEluU2NlbmUocGFyZW50Tm9kZSwgXCLor7fovpPlhaXmiL/pl7Tlj7dcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBqb2luQnRuLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDlj7PkvqfvvJrliJvlu7rmiL/pl7Tlkozlv6vpgJ/lvIDlp4vmjInpkq4gPT09PT1cbiAgICAgICAgdmFyIHJpZ2h0WCA9IHNjcmVlbldpZHRoLzIgLSAxNzA7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmiL/pl7TmjInpkq4gLSDlop7liqDlrr3luqZcbiAgICAgICAgdmFyIGNyZWF0ZUJ0biA9IHRoaXMuX2NyZWF0ZUFjdGlvbkJ1dHRvbihcbiAgICAgICAgICAgIFwi5Yib5bu65oi/6Ze0XCIsXG4gICAgICAgICAgICBjYy5jb2xvcigyNTUsIDE1MiwgMCksICAvLyDmqZnoibJcbiAgICAgICAgICAgIHJpZ2h0WCAtIDg1LCBhY3Rpb25CYXJZLFxuICAgICAgICAgICAgMTIwLCA0NCwgIC8vIOWinuWKoOWwuuWvuFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd0NyZWF0ZVJvb21EaWFsb2cocGFyZW50Tm9kZSwgcm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGNyZWF0ZUJ0bi5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5b+r6YCf5byA5aeL5oyJ6ZKuIC0g5aKe5Yqg5a695bqmXG4gICAgICAgIHZhciBxdWlja0J0biA9IHRoaXMuX2NyZWF0ZUFjdGlvbkJ1dHRvbihcbiAgICAgICAgICAgIFwi5b+r6YCf5byA5aeLXCIsXG4gICAgICAgICAgICBjYy5jb2xvcigzMywgMTUwLCAyNDMpLCAgLy8g6JOd6ImyXG4gICAgICAgICAgICByaWdodFggKyA4NSwgYWN0aW9uQmFyWSxcbiAgICAgICAgICAgIDEyMCwgNDQsICAvLyDlop7liqDlsLrlr7hcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzY2VuZSA9IHBhcmVudE5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJSb29tTGlzdFNjZW5lXCIpIHx8IHBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKHNjZW5lLmRlc3Ryb3kpIHNjZW5lLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9xdWlja01hdGNoKHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBxdWlja0J0bi5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu6566A5Y2V55qE6L6T5YWl5qGGIC0g5L2/55SoIEVkaXRCb3gg57uE5Lu2XG4gICAgX2NyZWF0ZVNpbXBsZUlucHV0Qm94OiBmdW5jdGlvbihwbGFjZWhvbGRlciwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgaW5wdXROb2RlID0gbmV3IGNjLk5vZGUoXCJSb29tQ29kZUlucHV0XCIpO1xuICAgICAgICBpbnB1dE5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgaW5wdXROb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGlucHV0Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZyA9IGlucHV0Tm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZy5maWxsQ29sb3IgPSBjYy5jb2xvcig0NSwgNDAsIDYwLCAyNTUpO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxMjAsIDEwMCwgNzAsIDIyMCk7XG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA2KTtcbiAgICAgICAgYmcuc3Ryb2tlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDkvb/nlKggRWRpdEJveCDnu4Tku7blrp7njrDnnJ/mraPnmoTovpPlhaXmoYZcbiAgICAgICAgdmFyIGVkaXRCb3ggPSBpbnB1dE5vZGUuYWRkQ29tcG9uZW50KGNjLkVkaXRCb3gpO1xuICAgICAgICBlZGl0Qm94LnN0cmluZyA9IFwiXCI7XG4gICAgICAgIGVkaXRCb3gucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgZWRpdEJveC5mb250U2l6ZSA9IDE4O1xuICAgICAgICBlZGl0Qm94LmZvbnRDb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBlZGl0Qm94LnBsYWNlaG9sZGVyRm9udFNpemUgPSAxNjtcbiAgICAgICAgZWRpdEJveC5wbGFjZWhvbGRlckZvbnRDb2xvciA9IGNjLmNvbG9yKDEzMCwgMTIwLCAxMTApO1xuICAgICAgICBlZGl0Qm94Lm1heExlbmd0aCA9IDIwO1xuICAgICAgICBlZGl0Qm94LmlucHV0TW9kZSA9IGNjLkVkaXRCb3guSW5wdXRNb2RlLk5VTUVSSUM7XG4gICAgICAgIGVkaXRCb3gucmV0dXJuVHlwZSA9IGNjLkVkaXRCb3guS2V5Ym9hcmRSZXR1cm5UeXBlLkRPTkU7XG4gICAgICAgIGVkaXRCb3gubGluZUhlaWdodCA9IGhlaWdodCAtIDg7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDlhoXovrnot53mlYjmnpzvvIjpgJrov4fosIPmlbTog4zmma/vvIlcbiAgICAgICAgZWRpdEJveC5ub2RlLm9uKCdlZGl0aW5nLWRpZC1iZWdpbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmcuY2xlYXIoKTtcbiAgICAgICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDU1LCA1MCwgNzUsIDI1NSk7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgICAgICBiZy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDE4MCwgMTUwLCA4MCwgMjU1KTtcbiAgICAgICAgICAgIGJnLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBlZGl0Qm94Lm5vZGUub24oJ2VkaXRpbmctZGlkLWVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmcuY2xlYXIoKTtcbiAgICAgICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDQ1LCA0MCwgNjAsIDI1NSk7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgICAgICBiZy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDEyMCwgMTAwLCA3MCwgMjIwKTtcbiAgICAgICAgICAgIGJnLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW5wdXROb2RlO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu65pON5L2c5oyJ6ZKuXG4gICAgX2NyZWF0ZUFjdGlvbkJ1dHRvbjogZnVuY3Rpb24odGV4dCwgYmdDb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGJ0biA9IG5ldyBjYy5Ob2RlKFwiQWN0aW9uQnRuX1wiICsgdGV4dCk7XG4gICAgICAgIGJ0bi5zZXRDb250ZW50U2l6ZShjYy5zaXplKHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgYnRuLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBidG4uYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgYnRuLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDog4zmma8gLSDlop7liqDlnIbop5JcbiAgICAgICAgdmFyIGJnID0gYnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGJnQ29sb3I7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA4KTtcbiAgICAgICAgYmcuZmlsbCgpO1xuICAgICAgICAvLyDmt7vliqDpq5jlhYnmlYjmnpxcbiAgICAgICAgYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSwgNDApO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIgKyAyLCAyLCB3aWR0aCAtIDQsIGhlaWdodC8yIC0gMiwgNik7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaWh+WtlyAtIOWinuWkp+Wtl+S9k1xuICAgICAgICB2YXIgdGV4dE5vZGUgPSBuZXcgY2MuTm9kZShcIlRleHRcIik7XG4gICAgICAgIHRleHROb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRleHROb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBsYWJlbCA9IHRleHROb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IHRleHQ7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMTg7ICAvLyDlop7lpKflrZfkvZNcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0ZXh0Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5paH5a2X5o+P6L65XG4gICAgICAgIHZhciBvdXRsaW5lID0gdGV4dE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxNTApO1xuICAgICAgICBvdXRsaW5lLndpZHRoID0gMTtcbiAgICAgICAgdGV4dE5vZGUucGFyZW50ID0gYnRuO1xuICAgICAgICBcbiAgICAgICAgLy8g6Kem5pG45pWI5p6cXG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMC45NTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDE7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu65oi/6Ze05YiX6KGo5Yy65Z+fIC0g566A5rSB5riF5pmw55qE6K6+6K6hXG4gICAgX2NyZWF0ZVJvb21MaXN0Q29udGVudDogZnVuY3Rpb24ocGFyZW50Tm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgcm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyDliJfooajljLrln5/kvY3nva7lkozlsLrlr7ggLSDosIPmlbTku6XpgILlupTmlrDnmoTmk43kvZzmoI/pq5jluqZcbiAgICAgICAgdmFyIGxpc3RZID0gLTMwOyAgLy8g6LCD5pW05L2N572uXG4gICAgICAgIHZhciBsaXN0SGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IC0gMjgwOyAgLy8g6LCD5pW06auY5bqmXG4gICAgICAgIHZhciBsaXN0V2lkdGggPSBzY3JlZW5XaWR0aCAtIDYwO1xuICAgICAgICBcbiAgICAgICAgLy8g5YiX6KGo6IOM5pmvXG4gICAgICAgIHZhciBsaXN0QmcgPSBuZXcgY2MuTm9kZShcIkxpc3RCZ1wiKTtcbiAgICAgICAgbGlzdEJnLnNldENvbnRlbnRTaXplKGNjLnNpemUobGlzdFdpZHRoLCBsaXN0SGVpZ2h0KSk7XG4gICAgICAgIGxpc3RCZy5zZXRQb3NpdGlvbigwLCBsaXN0WSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGcgPSBsaXN0QmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgbGcuZmlsbENvbG9yID0gY2MuY29sb3IoMjUsIDIyLCA0MCwgMjQwKTtcbiAgICAgICAgbGcucm91bmRSZWN0KC1saXN0V2lkdGgvMiwgLWxpc3RIZWlnaHQvMiwgbGlzdFdpZHRoLCBsaXN0SGVpZ2h0LCA4KTtcbiAgICAgICAgbGcuZmlsbCgpO1xuICAgICAgICBsZy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDgwLCA2NSwgNTAsIDE1MCk7XG4gICAgICAgIGxnLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIGxnLnJvdW5kUmVjdCgtbGlzdFdpZHRoLzIsIC1saXN0SGVpZ2h0LzIsIGxpc3RXaWR0aCwgbGlzdEhlaWdodCwgOCk7XG4gICAgICAgIGxnLnN0cm9rZSgpO1xuICAgICAgICBsaXN0QmcucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09IOihqOWktCA9PT09PVxuICAgICAgICB2YXIgaGVhZGVyWSA9IGxpc3RZICsgbGlzdEhlaWdodC8yIC0gMjU7XG4gICAgICAgIFxuICAgICAgICAvLyDooajlpLTog4zmma9cbiAgICAgICAgdmFyIGhlYWRlckJnID0gbmV3IGNjLk5vZGUoXCJUYWJsZUhlYWRlclwiKTtcbiAgICAgICAgaGVhZGVyQmcuc2V0UG9zaXRpb24oMCwgaGVhZGVyWSk7XG4gICAgICAgIHZhciBoYmcgPSBoZWFkZXJCZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBoYmcuZmlsbENvbG9yID0gY2MuY29sb3IoNDAsIDM1LCA1NSwgMjU1KTtcbiAgICAgICAgaGJnLnJvdW5kUmVjdCgtbGlzdFdpZHRoLzIgKyA1LCAtMjAsIGxpc3RXaWR0aCAtIDEwLCA0MCwgNCk7XG4gICAgICAgIGhiZy5maWxsKCk7XG4gICAgICAgIGhlYWRlckJnLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDooajlpLTmloflrZcgLSDlop7lpKflrZfkvZNcbiAgICAgICAgdmFyIGNvbFdpZHRoID0gbGlzdFdpZHRoIC8gNTtcbiAgICAgICAgdmFyIGhlYWRlcnMgPSBbXCLmiL/pl7Tlj7dcIiwgXCLkurrmlbBcIiwgXCLlupXliIZcIiwgXCLnirbmgIFcIiwgXCLmk43kvZxcIl07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGhOb2RlID0gbmV3IGNjLk5vZGUoXCJIXCIgKyBpKTtcbiAgICAgICAgICAgIGhOb2RlLnggPSAtbGlzdFdpZHRoLzIgKyBjb2xXaWR0aCAqIChpICsgMC41KTtcbiAgICAgICAgICAgIGhOb2RlLnkgPSBoZWFkZXJZO1xuICAgICAgICAgICAgaE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIGhOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBobCA9IGhOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBobC5zdHJpbmcgPSBoZWFkZXJzW2ldO1xuICAgICAgICAgICAgaGwuZm9udFNpemUgPSAxNjsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICAgICAgaGwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgIGhOb2RlLmNvbG9yID0gY2MuY29sb3IoMjQwLCAyMDAsIDEyMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa3u+WKoOaPj+i+uVxuICAgICAgICAgICAgdmFyIG91dGxpbmUgPSBoTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcig2MCwgNTAsIDQwKTtcbiAgICAgICAgICAgIG91dGxpbmUud2lkdGggPSAxO1xuICAgICAgICAgICAgaE5vZGUucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g5oi/6Ze05YiX6KGo5a655ZmoID09PT09XG4gICAgICAgIHZhciByb29tQ29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJSb29tTGlzdENvbnRhaW5lclwiKTtcbiAgICAgICAgcm9vbUNvbnRhaW5lci5zZXRDb250ZW50U2l6ZShjYy5zaXplKGxpc3RXaWR0aCAtIDIwLCBsaXN0SGVpZ2h0IC0gNzApKTtcbiAgICAgICAgcm9vbUNvbnRhaW5lci55ID0gbGlzdFkgLSAyMDtcbiAgICAgICAgcm9vbUNvbnRhaW5lci5wYXJlbnQgPSBwYXJlbnROb2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yqg6L295o+Q56S6XG4gICAgICAgIHZhciBsb2FkaW5nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0xhYmVsXCIpO1xuICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgbGwgPSBsb2FkaW5nTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsbC5zdHJpbmcgPSBcIuato+WcqOWKoOi9veaIv+mXtOWIl+ihqC4uLlwiO1xuICAgICAgICBsbC5mb250U2l6ZSA9IDE4OyAgLy8g5aKe5aSn5a2X5L2TXG4gICAgICAgIGxsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxvYWRpbmdOb2RlLmNvbG9yID0gY2MuY29sb3IoMTYwLCAxNTAsIDE0MCk7XG4gICAgICAgIGxvYWRpbmdOb2RlLnBhcmVudCA9IHJvb21Db250YWluZXI7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmiL/pl7TliJfooahcbiAgICAgICAgdGhpcy5fZmV0Y2hBbmRSZW5kZXJSb29tTGlzdEZvclNjZW5lKHJvb21Db250YWluZXIsIGxvYWRpbmdOb2RlLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkLCBwYXJlbnROb2RlKTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWIm+W7uuW6lemDqOS/oeaBr+agjyAtIOeugOa0geiuvuiuoVxuICAgIF9jcmVhdGVSb29tTGlzdEZvb3RlcjogZnVuY3Rpb24ocGFyZW50Tm9kZSwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgcGxheWVyR29sZCwgcm9vbUNvbmZpZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBmb290ZXJZID0gLXNjcmVlbkhlaWdodC8yICsgNTA7ICAvLyDosIPmlbTkvY3nva5cbiAgICAgICAgXG4gICAgICAgIC8vIOW6lemDqOiDjOaZr1xuICAgICAgICB2YXIgZm9vdGVyQmcgPSBuZXcgY2MuTm9kZShcIkZvb3RlckJnXCIpO1xuICAgICAgICBmb290ZXJCZy5zZXRQb3NpdGlvbigwLCBmb290ZXJZKTtcbiAgICAgICAgdmFyIGZnID0gZm9vdGVyQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgZmcuZmlsbENvbG9yID0gY2MuY29sb3IoMjgsIDI1LCA0MiwgMjQwKTtcbiAgICAgICAgZmcucm91bmRSZWN0KC1zY3JlZW5XaWR0aC8yICsgMzAsIC0yNSwgc2NyZWVuV2lkdGggLSA2MCwgNTAsIDYpO1xuICAgICAgICBmZy5maWxsKCk7XG4gICAgICAgIGZvb3RlckJnLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDov5Tlm57mjInpkq4gLSDlop7lpKflsLrlr7hcbiAgICAgICAgdmFyIGJhY2tCdG4gPSB0aGlzLl9jcmVhdGVBY3Rpb25CdXR0b24oXG4gICAgICAgICAgICBcIui/lOWbnuWkp+WOhVwiLFxuICAgICAgICAgICAgY2MuY29sb3IoOTAsIDg1LCAxMDApLFxuICAgICAgICAgICAgLXNjcmVlbldpZHRoLzIgKyAxMjAsIGZvb3RlclksXG4gICAgICAgICAgICAxMTAsIDQwLCAgLy8g5aKe5Yqg5bC65a+4XG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2NlbmUgPSBwYXJlbnROb2RlLmdldENoaWxkQnlOYW1lKFwiUm9vbUxpc3RTY2VuZVwiKSB8fCBwYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChzY2VuZS5kZXN0cm95KSBzY2VuZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGJhY2tCdG4ucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOmHkeW4geaYvuekulxuICAgICAgICB2YXIgZ29sZEljb24gPSBuZXcgY2MuTm9kZShcIkdvbGRJY29uXCIpO1xuICAgICAgICBnb2xkSWNvbi5zZXRQb3NpdGlvbigzMCwgZm9vdGVyWSk7XG4gICAgICAgIHZhciBnZyA9IGdvbGRJY29uLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGdnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDIzMCwgMTgwLCA1MCk7XG4gICAgICAgIGdnLmNpcmNsZSgwLCAwLCAxMCk7XG4gICAgICAgIGdnLmZpbGwoKTtcbiAgICAgICAgZ2cuZmlsbENvbG9yID0gY2MuY29sb3IoMjUwLCAyMTAsIDgwKTtcbiAgICAgICAgZ2cuY2lyY2xlKDAsIDAsIDYpO1xuICAgICAgICBnZy5maWxsKCk7XG4gICAgICAgIGdvbGRJY29uLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICB2YXIgZ29sZFRleHQgPSBuZXcgY2MuTm9kZShcIkdvbGRUZXh0XCIpO1xuICAgICAgICBnb2xkVGV4dC5zZXRQb3NpdGlvbig1MCwgZm9vdGVyWSk7XG4gICAgICAgIGdvbGRUZXh0LmFuY2hvclggPSAwO1xuICAgICAgICBnb2xkVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgZ2wgPSBnb2xkVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBnbC5zdHJpbmcgPSB0aGlzLl9mb3JtYXRHb2xkKHBsYXllckdvbGQpO1xuICAgICAgICBnbC5mb250U2l6ZSA9IDE2O1xuICAgICAgICBnb2xkVGV4dC5jb2xvciA9IGNjLmNvbG9yKDIzMCwgMTkwLCA4MCk7XG4gICAgICAgIGdvbGRUZXh0LnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDliLfmlrDmjInpkq4gLSDlop7lpKflsLrlr7hcbiAgICAgICAgdmFyIHJlZnJlc2hCdG4gPSB0aGlzLl9jcmVhdGVBY3Rpb25CdXR0b24oXG4gICAgICAgICAgICBcIuWIt+aWsOWIl+ihqFwiLFxuICAgICAgICAgICAgY2MuY29sb3IoNjAsIDEzMCwgMTgwKSxcbiAgICAgICAgICAgIHNjcmVlbldpZHRoLzIgLSAxMDAsIGZvb3RlclksXG4gICAgICAgICAgICAxMDAsIDQwLCAgLy8g5aKe5Yqg5bC65a+4XG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gcGFyZW50Tm9kZS5nZXRDaGlsZEJ5TmFtZShcIlJvb21MaXN0Q29udGFpbmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRpbmcgPSBjb250YWluZXIuZ2V0Q2hpbGRCeU5hbWUoXCJMb2FkaW5nTGFiZWxcIik7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBsb2FkaW5nLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLmraPlnKjliLfmlrAuLi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkcmVuLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0ubmFtZSAhPT0gXCJMb2FkaW5nTGFiZWxcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlbGYuX2ZldGNoQW5kUmVuZGVyUm9vbUxpc3RGb3JTY2VuZShjb250YWluZXIsIGxvYWRpbmcsIHJvb21Db25maWcsIHBsYXllckdvbGQsIHBhcmVudE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICByZWZyZXNoQnRuLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rmjInpkq7oioLngrnvvIjmloflrZflnKjmjInpkq7lhoXpg6jvvIlcbiAgICBfY3JlYXRlQnV0dG9uTm9kZTogZnVuY3Rpb24odGV4dCwgYmdDb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgY2FsbGJhY2ssIGlzUHJpbWFyeSkge1xuICAgICAgICB2YXIgYnRuID0gbmV3IGNjLk5vZGUoXCJCdG5fXCIgKyB0ZXh0KTtcbiAgICAgICAgYnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGgsIGhlaWdodCkpO1xuICAgICAgICBidG4uc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGJ0bi5hbmNob3JYID0gMC41O1xuICAgICAgICBidG4uYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruiDjOaZr+iKgueCuVxuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ05vZGVcIik7XG4gICAgICAgIGJnTm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgYmdOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGJnTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLbmjInpkq7og4zmma9cbiAgICAgICAgYmcuZmlsbENvbG9yID0gYmdDb2xvcjtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDUpO1xuICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDovrnmoYZcbiAgICAgICAgdmFyIGJvcmRlckNvbG9yID0gY2MuY29sb3IoXG4gICAgICAgICAgICBNYXRoLm1pbigyNTUsIGJnQ29sb3IuciArIDQwKSxcbiAgICAgICAgICAgIE1hdGgubWluKDI1NSwgYmdDb2xvci5nICsgNDApLFxuICAgICAgICAgICAgTWF0aC5taW4oMjU1LCBiZ0NvbG9yLmIgKyA0MClcbiAgICAgICAgKTtcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBib3JkZXJDb2xvcjtcbiAgICAgICAgYmcubGluZVdpZHRoID0gMTtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDUpO1xuICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4u+aMiemSrumrmOWFiVxuICAgICAgICBpZiAoaXNQcmltYXJ5KSB7XG4gICAgICAgICAgICBiZy5maWxsQ29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1LCA1MCk7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIgKyAyLCAyLCB3aWR0aCAtIDQsIGhlaWdodC8yIC0gMiwgMyk7XG4gICAgICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGJ0bjtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruaWh+Wtl+iKgueCue+8iOeLrOeri+eahOWtkOiKgueCue+8iVxuICAgICAgICB2YXIgdGV4dE5vZGUgPSBuZXcgY2MuTm9kZShcIlRleHROb2RlXCIpO1xuICAgICAgICB0ZXh0Tm9kZS5zZXRQb3NpdGlvbigwLCAwKTsgIC8vIOW/hemhu+iuvue9ruS9jee9ruS4uuaMiemSruS4reW/g1xuICAgICAgICB0ZXh0Tm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICB0ZXh0Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICB0ZXh0Tm9kZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0ZXh0Tm9kZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGFiZWwgPSB0ZXh0Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSB0ZXh0O1xuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IE1hdGguZmxvb3IoaGVpZ2h0ICogMC40Mik7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5OT05FO1xuICAgICAgICB0ZXh0Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBcbiAgICAgICAgdmFyIG91dGxpbmUgPSB0ZXh0Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgb3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDEyMCk7XG4gICAgICAgIG91dGxpbmUud2lkdGggPSAxO1xuICAgICAgICB0ZXh0Tm9kZS5wYXJlbnQgPSBidG47XG4gICAgICAgIFxuICAgICAgICAvLyDop6bmkbjkuovku7ZcbiAgICAgICAgYnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBidG4uc2NhbGUgPSAwLjk1O1xuICAgICAgICB9KTtcbiAgICAgICAgYnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBidG4uc2NhbGUgPSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBidG47XG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rkvb/nlKjlm77niYfnmoTmjInpkq7oioLngrlcbiAgICBfY3JlYXRlSW1hZ2VCdXR0b25Ob2RlOiBmdW5jdGlvbihpbWFnZVBhdGgsIHRleHQsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGJ0biA9IG5ldyBjYy5Ob2RlKFwiQnRuX1wiICsgdGV4dCk7XG4gICAgICAgIGJ0bi5zZXRDb250ZW50U2l6ZShjYy5zaXplKHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgYnRuLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBidG4uYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgYnRuLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqAgU3ByaXRlIOe7hOS7tlxuICAgICAgICB2YXIgc3ByaXRlID0gYnRuLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBzcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yqg6L295oyJ6ZKu5Zu+54mHXG4gICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGltYWdlUGF0aCwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLliqDovb3mjInpkq7lm77niYflpLHotKU6XCIsIGltYWdlUGF0aCk7XG4gICAgICAgICAgICAgICAgLy8g5L2/55So5aSH55So5qC35byPXG4gICAgICAgICAgICAgICAgc2VsZi5fY3JlYXRlQnV0dG9uRmFsbGJhY2soYnRuLCB0ZXh0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqAgQnV0dG9uIOe7hOS7tlxuICAgICAgICB2YXIgYnV0dG9uID0gYnRuLmFkZENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBidXR0b24udHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICBidXR0b24uZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGJ1dHRvbi56b29tU2NhbGUgPSAwLjk1O1xuICAgICAgICBcbiAgICAgICAgLy8g6Kem5pG45LqL5Lu2XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5oyJ6ZKu5aSH55So5qC35byP77yI5Zu+54mH5Yqg6L295aSx6LSl5pe25L2/55So77yJXG4gICAgX2NyZWF0ZUJ1dHRvbkZhbGxiYWNrOiBmdW5jdGlvbihidG4sIHRleHQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy8g57uY5Yi25oyJ6ZKu6IOM5pmvXG4gICAgICAgIHZhciBncmFwaGljcyA9IGJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u5oyJ6ZKu5paH5a2X6YCJ5oup6aKc6ImyXG4gICAgICAgIHZhciBiZ0NvbG9yO1xuICAgICAgICBpZiAodGV4dC5pbmRleE9mKFwi5Yib5bu6XCIpID49IDApIHtcbiAgICAgICAgICAgIGJnQ29sb3IgPSBjYy5jb2xvcigzMCwgOTAsIDE2MCk7ICAvLyDok53oibJcbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0LmluZGV4T2YoXCLliqDlhaVcIikgPj0gMCB8fCB0ZXh0LmluZGV4T2YoXCLov5vlhaVcIikgPj0gMCkge1xuICAgICAgICAgICAgYmdDb2xvciA9IGNjLmNvbG9yKDQwLCAxMzAsIDYwKTsgIC8vIOe7v+iJslxuICAgICAgICB9IGVsc2UgaWYgKHRleHQuaW5kZXhPZihcIuW/q+mAn1wiKSA+PSAwKSB7XG4gICAgICAgICAgICBiZ0NvbG9yID0gY2MuY29sb3IoMjAwLCAxMjAsIDQwKTsgIC8vIOapmeiJslxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmdDb2xvciA9IGNjLmNvbG9yKDgwLCA4MCwgODApOyAgLy8g54Gw6ImyXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGdyYXBoaWNzLmZpbGxDb2xvciA9IGJnQ29sb3I7XG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA2KTtcbiAgICAgICAgZ3JhcGhpY3MuZmlsbCgpO1xuICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUsIDgwKTtcbiAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gMjtcbiAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDYpO1xuICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOaWh+Wtl1xuICAgICAgICB2YXIgbGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKTtcbiAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IHRleHQ7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gTWF0aC5mbG9vcihoZWlnaHQgKiAwLjQpO1xuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IGJ0bjtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWIm+W7uui+k+WFpeahhuiKgueCuVxuICAgIF9jcmVhdGVJbnB1dE5vZGU6IGZ1bmN0aW9uKHBsYWNlaG9sZGVyLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBpbnB1dE5vZGUgPSBuZXcgY2MuTm9kZShcIklucHV0Tm9kZVwiKTtcbiAgICAgICAgaW5wdXROb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGgsIGhlaWdodCkpO1xuICAgICAgICBpbnB1dE5vZGUuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGlucHV0Tm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBpbnB1dE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgaW5wdXROb2RlLm5hbWUgPSBcIlJvb21Db2RlSW5wdXRcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIOi+k+WFpeahhuiDjOaZr1xuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJJbnB1dEJnXCIpO1xuICAgICAgICBiZ05vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGJnTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBiZ05vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIHZhciBiZyA9IGJnTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZy5maWxsQ29sb3IgPSBjYy5jb2xvcig0NSwgNDAsIDYwLCAyNTUpO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNSk7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxMDAsIDkwLCA3MCwgMjAwKTtcbiAgICAgICAgYmcubGluZVdpZHRoID0gMTtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDUpO1xuICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGlucHV0Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIHBsYWNlaG9sZGVy5paH5a2X6IqC54K5XG4gICAgICAgIHZhciBwbGFjZWhvbGRlck5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYWNlaG9sZGVyXCIpO1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLndpZHRoID0gd2lkdGggLSAyMDtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIHZhciBsYWJlbCA9IHBsYWNlaG9sZGVyTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSBNYXRoLmZsb29yKGhlaWdodCAqIDAuNCk7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLmNvbG9yID0gY2MuY29sb3IoMTMwLCAxMjAsIDExMCk7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS5wYXJlbnQgPSBpbnB1dE5vZGU7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW5wdXROb2RlO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu65qC35byP5YyW5oyJ6ZKuXG4gICAgX2NyZWF0ZVN0eWxlZEJ1dHRvbjogZnVuY3Rpb24odGV4dCwgY29sb3IsIHgsIGNhbGxiYWNrLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTAwO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgNDA7XG4gICAgICAgIFxuICAgICAgICB2YXIgYnRuID0gbmV3IGNjLk5vZGUoXCJCdG5fXCIgKyB0ZXh0KTtcbiAgICAgICAgYnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGgsIGhlaWdodCkpO1xuICAgICAgICBidG4uc2V0UG9zaXRpb24oeCwgMCk7XG4gICAgICAgIFxuICAgICAgICAvLyDmjInpkq7og4zmma9cbiAgICAgICAgdmFyIGJnID0gYnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGNvbG9yO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgOCk7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruaWh+Wtl1xuICAgICAgICB2YXIgbGFiZWwgPSBidG4uYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxODtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBidG4uY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOinpuaRuOaViOaenFxuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDAuOTU7XG4gICAgICAgIH0pO1xuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBidG4uc2NhbGUgPSAxO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0NBTkNFTCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDE7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWcqOWcuuaZr+S4reaYvuekuuaPkOekulxuICAgIF9zaG93VGlwSW5TY2VuZTogZnVuY3Rpb24oc2NlbmVOb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciB0aXBOb2RlID0gc2NlbmVOb2RlLmdldENoaWxkQnlOYW1lKFwiU2NlbmVUaXBcIik7XG4gICAgICAgIGlmICh0aXBOb2RlKSB0aXBOb2RlLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIHRpcE5vZGUgPSBuZXcgY2MuTm9kZShcIlNjZW5lVGlwXCIpO1xuICAgICAgICB0aXBOb2RlLnkgPSAxMDA7XG4gICAgICAgIFxuICAgICAgICB2YXIgYmcgPSB0aXBOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDE4MCk7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtMTUwLCAtMjAsIDMwMCwgNDAsIDgpO1xuICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGFiZWwgPSB0aXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjA7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMCk7XG4gICAgICAgIHRpcE5vZGUucGFyZW50ID0gc2NlbmVOb2RlO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGlwTm9kZSAmJiB0aXBOb2RlLmlzVmFsaWQpIHRpcE5vZGUuZGVzdHJveSgpO1xuICAgICAgICB9LCAyKTtcbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaYvuekuuWIm+W7uuaIv+mXtOW8ueeql++8iOeugOa0gea4heaZsOeahOiuvuiuoe+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93Q3JlYXRlUm9vbURpYWxvZzogZnVuY3Rpb24ocGFyZW50Tm9kZSwgcm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen5by556qXXG4gICAgICAgIHZhciBvbGREaWFsb2cgPSBwYXJlbnROb2RlLmdldENoaWxkQnlOYW1lKFwiQ3JlYXRlUm9vbURpYWxvZ1wiKTtcbiAgICAgICAgaWYgKG9sZERpYWxvZykgb2xkRGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPlueUu+W4g+WwuuWvuFxuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5ub2RlLmdldENvbXBvbmVudChjYy5DYW52YXMpIHx8IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudChjYy5DYW52YXMpO1xuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwO1xuICAgICAgICB2YXIgc2NyZWVuV2lkdGggPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi53aWR0aCA6IDEyODA7XG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBjYy5Ob2RlKFwiQ3JlYXRlUm9vbURpYWxvZ1wiKTtcbiAgICAgICAgZGlhbG9nLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBkaWFsb2cuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGRpYWxvZy56SW5kZXggPSAzMDAwO1xuICAgICAgICBkaWFsb2cucGFyZW50ID0gcGFyZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWNiumAj+aYjumBrue9qVxuICAgICAgICB2YXIgbWFzayA9IG5ldyBjYy5Ob2RlKFwiTWFza1wiKTtcbiAgICAgICAgbWFzay5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKTtcbiAgICAgICAgdmFyIG1hc2tHID0gbWFzay5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBtYXNrRy5maWxsQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxODApO1xuICAgICAgICBtYXNrRy5yZWN0KC1zY3JlZW5XaWR0aC8yLCAtc2NyZWVuSGVpZ2h0LzIsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpO1xuICAgICAgICBtYXNrRy5maWxsKCk7XG4gICAgICAgIG1hc2sucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye76YGu572p5YWz6ZetXG4gICAgICAgIG1hc2sub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09IOW8ueeql+S4u+S9kyA9PT09PVxuICAgICAgICB2YXIgZGlhbG9nV2lkdGggPSA0ODA7ICAvLyDlop7liqDlrr3luqZcbiAgICAgICAgdmFyIGRpYWxvZ0hlaWdodCA9IDQyMDsgIC8vIOWinuWKoOmrmOW6plxuICAgICAgICBcbiAgICAgICAgLy8g5by556qX6IOM5pmvXG4gICAgICAgIHZhciBkaWFsb2dCZyA9IG5ldyBjYy5Ob2RlKFwiRGlhbG9nQmdcIik7XG4gICAgICAgIGRpYWxvZ0JnLnNldENvbnRlbnRTaXplKGNjLnNpemUoZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRiZyA9IGRpYWxvZ0JnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIC8vIOmYtOW9sVxuICAgICAgICBkYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgODApO1xuICAgICAgICBkYmcucm91bmRSZWN0KC1kaWFsb2dXaWR0aC8yICsgNSwgLWRpYWxvZ0hlaWdodC8yIC0gNSwgZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCwgMTIpO1xuICAgICAgICBkYmcuZmlsbCgpO1xuICAgICAgICAvLyDkuLvog4zmma9cbiAgICAgICAgZGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDM1LCAzMiwgNTAsIDI1NSk7XG4gICAgICAgIGRiZy5yb3VuZFJlY3QoLWRpYWxvZ1dpZHRoLzIsIC1kaWFsb2dIZWlnaHQvMiwgZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCwgMTIpO1xuICAgICAgICBkYmcuZmlsbCgpO1xuICAgICAgICAvLyDovrnmoYZcbiAgICAgICAgZGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjU1LCAxODAsIDYwLCAyMDApO1xuICAgICAgICBkYmcubGluZVdpZHRoID0gMjtcbiAgICAgICAgZGJnLnJvdW5kUmVjdCgtZGlhbG9nV2lkdGgvMiwgLWRpYWxvZ0hlaWdodC8yLCBkaWFsb2dXaWR0aCwgZGlhbG9nSGVpZ2h0LCAxMik7XG4gICAgICAgIGRiZy5zdHJva2UoKTtcbiAgICAgICAgZGlhbG9nQmcucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g6aG26YOo5qCH6aKY5qCPID09PT09XG4gICAgICAgIHZhciBoZWFkZXJCYXIgPSBuZXcgY2MuTm9kZShcIkhlYWRlckJhclwiKTtcbiAgICAgICAgaGVhZGVyQmFyLnkgPSBkaWFsb2dIZWlnaHQvMiAtIDMwO1xuICAgICAgICBcbiAgICAgICAgdmFyIGhiZyA9IGhlYWRlckJhci5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBoYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMjU1LCAxNTIsIDApOyAgLy8g5qmZ6Imy5Li76aKYXG4gICAgICAgIGhiZy5yb3VuZFJlY3QoLWRpYWxvZ1dpZHRoLzIsIC0yNSwgZGlhbG9nV2lkdGgsIDUwLCBbMTIsIDEyLCAwLCAwXSk7XG4gICAgICAgIGhiZy5maWxsKCk7XG4gICAgICAgIGhlYWRlckJhci5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpopjmloflrZdcbiAgICAgICAgdmFyIHRpdGxlVGV4dCA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIik7XG4gICAgICAgIHRpdGxlVGV4dC55ID0gZGlhbG9nSGVpZ2h0LzIgLSAzMDtcbiAgICAgICAgdGl0bGVUZXh0LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgdHRsID0gdGl0bGVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHR0bC5zdHJpbmcgPSBcIuWIm+W7uuaIv+mXtFwiO1xuICAgICAgICB0dGwuZm9udFNpemUgPSAyNDtcbiAgICAgICAgdHRsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpdGxlVGV4dC5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgdGl0bGVPdXRsaW5lLmNvbG9yID0gY2MuY29sb3IoMTIwLCA2MCwgMCk7XG4gICAgICAgIHRpdGxlT3V0bGluZS53aWR0aCA9IDI7XG4gICAgICAgIHRpdGxlVGV4dC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDlhbPpl63mjInpkq5cbiAgICAgICAgdmFyIGNsb3NlQnRuID0gbmV3IGNjLk5vZGUoXCJDbG9zZUJ0blwiKTtcbiAgICAgICAgY2xvc2VCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSgzMCwgMzApKTtcbiAgICAgICAgY2xvc2VCdG4ueCA9IGRpYWxvZ1dpZHRoLzIgLSAyNTtcbiAgICAgICAgY2xvc2VCdG4ueSA9IGRpYWxvZ0hlaWdodC8yIC0gMzA7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2JnID0gY2xvc2VCdG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgY2JnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDgwKTtcbiAgICAgICAgY2JnLmNpcmNsZSgwLCAwLCAxNSk7XG4gICAgICAgIGNiZy5maWxsKCk7XG4gICAgICAgIGNsb3NlQnRuLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIHZhciBjbG9zZVggPSBuZXcgY2MuTm9kZShcIlhcIik7XG4gICAgICAgIGNsb3NlWC5hbmNob3JYID0gMC41O1xuICAgICAgICBjbG9zZVguYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIGNsb3NlTGFiZWwgPSBjbG9zZVguYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgY2xvc2VMYWJlbC5zdHJpbmcgPSBcIsOXXCI7XG4gICAgICAgIGNsb3NlTGFiZWwuZm9udFNpemUgPSAyNDtcbiAgICAgICAgY2xvc2VMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjbG9zZVguY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgY2xvc2VYLnBhcmVudCA9IGNsb3NlQnRuO1xuICAgICAgICBcbiAgICAgICAgY2xvc2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g5oi/6Ze057G75Z6L5pi+56S6ID09PT09XG4gICAgICAgIHZhciByb29tVHlwZUJnID0gbmV3IGNjLk5vZGUoXCJSb29tVHlwZUJnXCIpO1xuICAgICAgICByb29tVHlwZUJnLnkgPSBkaWFsb2dIZWlnaHQvMiAtIDgwO1xuICAgICAgICB2YXIgcnRiZyA9IHJvb21UeXBlQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgcnRiZy5maWxsQ29sb3IgPSBjYy5jb2xvcig2MCwgNTUsIDgwLCAyMDApO1xuICAgICAgICBydGJnLnJvdW5kUmVjdCgtODAsIC0xNiwgMTYwLCAzMiwgMTYpO1xuICAgICAgICBydGJnLmZpbGwoKTtcbiAgICAgICAgcm9vbVR5cGVCZy5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICB2YXIgcm9vbVR5cGVUZXh0ID0gbmV3IGNjLk5vZGUoXCJSb29tVHlwZVwiKTtcbiAgICAgICAgcm9vbVR5cGVUZXh0LnkgPSBkaWFsb2dIZWlnaHQvMiAtIDgwO1xuICAgICAgICByb29tVHlwZVRleHQuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgcm9vbVR5cGVUZXh0LmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBydGwgPSByb29tVHlwZVRleHQuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcnRsLnN0cmluZyA9IHJvb21Db25maWcucm9vbV9uYW1lIHx8IFwi5Yid57qn5oi/XCI7XG4gICAgICAgIHJ0bC5mb250U2l6ZSA9IDE2O1xuICAgICAgICBydGwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgcm9vbVR5cGVUZXh0LmNvbG9yID0gY2MuY29sb3IoMjU1LCAyMjAsIDEyMCk7XG4gICAgICAgIHJvb21UeXBlVGV4dC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmiL/pl7TlkI3np7DovpPlhaUgPT09PT1cbiAgICAgICAgdmFyIG5hbWVMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiTmFtZUxhYmVsXCIpO1xuICAgICAgICBuYW1lTGFiZWwueCA9IC1kaWFsb2dXaWR0aC8yICsgMzA7XG4gICAgICAgIG5hbWVMYWJlbC55ID0gZGlhbG9nSGVpZ2h0LzIgLSAxMzA7XG4gICAgICAgIG5hbWVMYWJlbC5hbmNob3JYID0gMDtcbiAgICAgICAgbmFtZUxhYmVsLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBubGwgPSBuYW1lTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbmxsLnN0cmluZyA9IFwi5oi/6Ze05ZCN56ewOlwiO1xuICAgICAgICBubGwuZm9udFNpemUgPSAxODsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICBuYW1lTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyMjAsIDIxMCwgMTkwKTtcbiAgICAgICAgbmFtZUxhYmVsLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIHZhciBuYW1lSW5wdXREYXRhID0geyB2YWx1ZTogXCJcIiB9O1xuICAgICAgICB2YXIgbmFtZUlucHV0QnRuID0gdGhpcy5fY3JlYXRlRWRpdEJveElucHV0KFxuICAgICAgICAgICAgXCLovpPlhaXmiL/pl7TlkI3np7DvvIjlj6/pgInvvIlcIixcbiAgICAgICAgICAgIDQwLCBkaWFsb2dIZWlnaHQvMiAtIDE2NSxcbiAgICAgICAgICAgIGRpYWxvZ1dpZHRoIC0gODAsIDQ4LCAgLy8g5aKe5Yqg5bC65a+4XG4gICAgICAgICAgICBcIk5hbWVJbnB1dFwiLFxuICAgICAgICAgICAgbmFtZUlucHV0RGF0YVxuICAgICAgICApO1xuICAgICAgICBuYW1lSW5wdXRCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g5oi/6Ze05a+G56CB6L6T5YWlID09PT09XG4gICAgICAgIHZhciBwd2RMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiUHdkTGFiZWxcIik7XG4gICAgICAgIHB3ZExhYmVsLnggPSAtZGlhbG9nV2lkdGgvMiArIDMwO1xuICAgICAgICBwd2RMYWJlbC55ID0gZGlhbG9nSGVpZ2h0LzIgLSAyMzU7XG4gICAgICAgIHB3ZExhYmVsLmFuY2hvclggPSAwO1xuICAgICAgICBwd2RMYWJlbC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgcGxsID0gcHdkTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcGxsLnN0cmluZyA9IFwi5oi/6Ze05a+G56CBOlwiO1xuICAgICAgICBwbGwuZm9udFNpemUgPSAxODsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICBwd2RMYWJlbC5jb2xvciA9IGNjLmNvbG9yKDIyMCwgMjEwLCAxOTApO1xuICAgICAgICBwd2RMYWJlbC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICB2YXIgcHdkSW5wdXREYXRhID0geyB2YWx1ZTogXCJcIiB9O1xuICAgICAgICB2YXIgcHdkSW5wdXRCdG4gPSB0aGlzLl9jcmVhdGVFZGl0Qm94SW5wdXQoXG4gICAgICAgICAgICBcIuiuvue9ruWvhuegge+8iOWPr+mAie+8iVwiLFxuICAgICAgICAgICAgNDAsIGRpYWxvZ0hlaWdodC8yIC0gMjcwLFxuICAgICAgICAgICAgZGlhbG9nV2lkdGggLSA4MCwgNDgsICAvLyDlop7liqDlsLrlr7hcbiAgICAgICAgICAgIFwiUHdkSW5wdXRcIixcbiAgICAgICAgICAgIHB3ZElucHV0RGF0YVxuICAgICAgICApO1xuICAgICAgICBwd2RJbnB1dEJ0bi5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmj5DnpLrmloflrZcgPT09PT1cbiAgICAgICAgdmFyIHRpcE5vZGUgPSBuZXcgY2MuTm9kZShcIlRpcFwiKTtcbiAgICAgICAgdGlwTm9kZS55ID0gLWRpYWxvZ0hlaWdodC8yICsgMTAwO1xuICAgICAgICB0aXBOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRpcE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIHRpcExhYmVsID0gdGlwTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0aXBMYWJlbC5zdHJpbmcgPSBcIueVmeepuuWvhueggeWImeWIm+W7uuWFrOW8gOaIv+mXtO+8jOS7u+S9leS6uuWPr+ebtOaOpeWKoOWFpVwiO1xuICAgICAgICB0aXBMYWJlbC5mb250U2l6ZSA9IDE0OyAgLy8g5aKe5aSn5a2X5L2TXG4gICAgICAgIHRpcExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigxNjAsIDE1MCwgMTQwKTtcbiAgICAgICAgdGlwTm9kZS5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmjInpkq7ljLrln58gPT09PT1cbiAgICAgICAgdmFyIGJ0blkgPSAtZGlhbG9nSGVpZ2h0LzIgKyA1MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPlua2iOaMiemSrlxuICAgICAgICB2YXIgY2FuY2VsQnRuID0gdGhpcy5fY3JlYXRlRGlhbG9nQnV0dG9uKFxuICAgICAgICAgICAgXCLlj5bmtohcIixcbiAgICAgICAgICAgIGNjLmNvbG9yKDgwLCA3NSwgOTUpLFxuICAgICAgICAgICAgLTkwLCBidG5ZLFxuICAgICAgICAgICAgMTMwLCA0OCwgIC8vIOWinuWKoOWwuuWvuFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgY2FuY2VsQnRuLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuaMiemSrlxuICAgICAgICB2YXIgY3JlYXRlQnRuID0gdGhpcy5fY3JlYXRlRGlhbG9nQnV0dG9uKFxuICAgICAgICAgICAgXCLliJvlu7rmiL/pl7RcIixcbiAgICAgICAgICAgIGNjLmNvbG9yKDI1NSwgMTUyLCAwKSwgIC8vIOapmeiJslxuICAgICAgICAgICAgOTAsIGJ0blksXG4gICAgICAgICAgICAxNTAsIDQ4LCAgLy8g5aKe5Yqg5bC65a+4XG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyDojrflj5bovpPlhaXlhoXlrrkgLSDku44gRWRpdEJveCDojrflj5ZcbiAgICAgICAgICAgICAgICB2YXIgbmFtZUlucHV0ID0gZGlhbG9nLmdldENoaWxkQnlOYW1lKFwiTmFtZUlucHV0XCIpO1xuICAgICAgICAgICAgICAgIHZhciBwd2RJbnB1dCA9IGRpYWxvZy5nZXRDaGlsZEJ5TmFtZShcIlB3ZElucHV0XCIpO1xuICAgICAgICAgICAgICAgIHZhciBuYW1lRWRpdEJveCA9IG5hbWVJbnB1dCA/IG5hbWVJbnB1dC5nZXRDb21wb25lbnQoY2MuRWRpdEJveCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHZhciBwd2RFZGl0Qm94ID0gcHdkSW5wdXQgPyBwd2RJbnB1dC5nZXRDb21wb25lbnQoY2MuRWRpdEJveCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciByb29tTmFtZSA9IChuYW1lRWRpdEJveCAmJiBuYW1lRWRpdEJveC5zdHJpbmcpIHx8IHJvb21Db25maWcucm9vbV9uYW1lIHx8IFwi5oiR55qE5oi/6Ze0XCI7XG4gICAgICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gKHB3ZEVkaXRCb3ggJiYgcHdkRWRpdEJveC5zdHJpbmcpIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5oi/6Ze05L+h5oGvXG4gICAgICAgICAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbCkge1xuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5jcmVhdGVSb29tSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21OYW1lOiByb29tTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21Db25maWc6IHJvb21Db25maWdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlhbPpl63miL/pl7TliJfooajnlYzpnaLlubbliJvlu7rmiL/pl7RcbiAgICAgICAgICAgICAgICB2YXIgc2NlbmUgPSBwYXJlbnROb2RlLmdldENoaWxkQnlOYW1lKFwiUm9vbUxpc3RTY2VuZVwiKSB8fCBwYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChzY2VuZS5kZXN0cm95KSBzY2VuZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g6LCD55So5Y6f5p2l55qE5Yib5bu65oi/6Ze05pa55rOVXG4gICAgICAgICAgICAgICAgc2VsZi5fY3JlYXRlUm9vbShyb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgY3JlYXRlQnRuLnBhcmVudCA9IGRpYWxvZztcbiAgICB9LFxuICAgIFxuICAgIC8vIOWIm+W7uuS9v+eUqCBFZGl0Qm94IOeahOi+k+WFpeahhu+8iOeUqOS6juW8ueeql+WGhe+8iVxuICAgIF9jcmVhdGVFZGl0Qm94SW5wdXQ6IGZ1bmN0aW9uKHBsYWNlaG9sZGVyLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBub2RlTmFtZSwgZGF0YVJlZikge1xuICAgICAgICB2YXIgaW5wdXROb2RlID0gbmV3IGNjLk5vZGUobm9kZU5hbWUpO1xuICAgICAgICBpbnB1dE5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgaW5wdXROb2RlLmFuY2hvclggPSAwO1xuICAgICAgICBpbnB1dE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmcgPSBpbnB1dE5vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYmcuZmlsbENvbG9yID0gY2MuY29sb3IoNTAsIDQ1LCA2NSwgMjU1KTtcbiAgICAgICAgYmcucm91bmRSZWN0KDAsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgOCk7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxMjAsIDEwMCwgNzAsIDIyMCk7XG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgwLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS9v+eUqCBFZGl0Qm94IOe7hOS7tlxuICAgICAgICB2YXIgZWRpdEJveCA9IGlucHV0Tm9kZS5hZGRDb21wb25lbnQoY2MuRWRpdEJveCk7XG4gICAgICAgIGVkaXRCb3guc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZWRpdEJveC5wbGFjZWhvbGRlciA9IHBsYWNlaG9sZGVyO1xuICAgICAgICBlZGl0Qm94LmZvbnRTaXplID0gMTg7XG4gICAgICAgIGVkaXRCb3guZm9udENvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIGVkaXRCb3gucGxhY2Vob2xkZXJGb250U2l6ZSA9IDE2O1xuICAgICAgICBlZGl0Qm94LnBsYWNlaG9sZGVyRm9udENvbG9yID0gY2MuY29sb3IoMTMwLCAxMjAsIDExMCk7XG4gICAgICAgIGVkaXRCb3gubWF4TGVuZ3RoID0gMzA7XG4gICAgICAgIGVkaXRCb3guaW5wdXRNb2RlID0gY2MuRWRpdEJveC5JbnB1dE1vZGUuQU5ZO1xuICAgICAgICBlZGl0Qm94LnJldHVyblR5cGUgPSBjYy5FZGl0Qm94LktleWJvYXJkUmV0dXJuVHlwZS5ET05FO1xuICAgICAgICBlZGl0Qm94LmxpbmVIZWlnaHQgPSBoZWlnaHQgLSAxMDtcbiAgICAgICAgXG4gICAgICAgIC8vIOi+k+WFpeS6i+S7tlxuICAgICAgICBlZGl0Qm94Lm5vZGUub24oJ3RleHQtY2hhbmdlZCcsIGZ1bmN0aW9uKGVkaXRib3gpIHtcbiAgICAgICAgICAgIGlmIChkYXRhUmVmKSB7XG4gICAgICAgICAgICAgICAgZGF0YVJlZi52YWx1ZSA9IGVkaXRib3guc3RyaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOeEpueCueS6i+S7tiAtIOabtOaWsOiDjOaZr+agt+W8j1xuICAgICAgICBlZGl0Qm94Lm5vZGUub24oJ2VkaXRpbmctZGlkLWJlZ2luJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiZy5jbGVhcigpO1xuICAgICAgICAgICAgYmcuZmlsbENvbG9yID0gY2MuY29sb3IoNjAsIDU1LCA4MCwgMjU1KTtcbiAgICAgICAgICAgIGJnLnJvdW5kUmVjdCgwLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICAgICAgYmcuZmlsbCgpO1xuICAgICAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigyNTUsIDE4MCwgODAsIDI1NSk7XG4gICAgICAgICAgICBiZy5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgYmcucm91bmRSZWN0KDAsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgOCk7XG4gICAgICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBlZGl0Qm94Lm5vZGUub24oJ2VkaXRpbmctZGlkLWVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmcuY2xlYXIoKTtcbiAgICAgICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDUwLCA0NSwgNjUsIDI1NSk7XG4gICAgICAgICAgICBiZy5yb3VuZFJlY3QoMCwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA4KTtcbiAgICAgICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgICAgIGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTIwLCAxMDAsIDcwLCAyMjApO1xuICAgICAgICAgICAgYmcubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgIGJnLnJvdW5kUmVjdCgwLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICAgICAgYmcuc3Ryb2tlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlucHV0Tm9kZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWIm+W7uuW8ueeql+WGheWPr+eCueWHu+eahOi+k+WFpeahhlxuICAgIF9jcmVhdGVJbnB1dERpYWxvZ0lucHV0OiBmdW5jdGlvbihwbGFjZWhvbGRlciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgbm9kZU5hbWUsIGRhdGFSZWYpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgaW5wdXROb2RlID0gbmV3IGNjLk5vZGUobm9kZU5hbWUpO1xuICAgICAgICBpbnB1dE5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgaW5wdXROb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGlucHV0Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgLy8g6IOM5pmvXG4gICAgICAgIHZhciBiZyA9IGlucHV0Tm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZy5maWxsQ29sb3IgPSBjYy5jb2xvcig1MCwgNDUsIDY1LCAyNTUpO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgNik7XG4gICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxMjAsIDEwMCwgNzAsIDIwMCk7XG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA2KTtcbiAgICAgICAgYmcuc3Ryb2tlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBwbGFjZWhvbGRlci/lgLzmmL7npLpcbiAgICAgICAgdmFyIHRleHROb2RlID0gbmV3IGNjLk5vZGUoXCJUZXh0XCIpO1xuICAgICAgICB0ZXh0Tm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICB0ZXh0Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICB0ZXh0Tm9kZS5wYXJlbnQgPSBpbnB1dE5vZGU7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGFiZWwgPSB0ZXh0Tm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxNDtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgdGV4dE5vZGUuY29sb3IgPSBjYy5jb2xvcigxMzAsIDEyMCwgMTEwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS9v+eUqOezu+e7n+aPkOekuui+k+WFpVxuICAgICAgICBpbnB1dE5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS9v+eUqCBwcm9tcHQg6I635Y+W6L6T5YWl77yIV2Vi56uv5Y+v55So77yJXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSBcIlwiO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb21wdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IHdpbmRvdy5wcm9tcHQocGxhY2Vob2xkZXIsIGRhdGFSZWYudmFsdWUgfHwgXCJcIikgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICAgICAgICAgIGRhdGFSZWYudmFsdWUgPSBpbnB1dDtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBpbnB1dDtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhUmVmLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gZGF0YVJlZi52YWx1ZTtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDEzMCwgMTIwLCAxMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpbnB1dE5vZGU7XG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rlvLnnqpflhoXnmoTmjInpkq5cbiAgICBfY3JlYXRlRGlhbG9nQnV0dG9uOiBmdW5jdGlvbih0ZXh0LCBiZ0NvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYnRuID0gbmV3IGNjLk5vZGUoXCJCdG5fXCIgKyB0ZXh0KTtcbiAgICAgICAgYnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGgsIGhlaWdodCkpO1xuICAgICAgICBidG4uc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGJ0bi5hbmNob3JYID0gMC41O1xuICAgICAgICBidG4uYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgYmcgPSBidG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYmcuZmlsbENvbG9yID0gYmdDb2xvcjtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDovrnmoYZcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcihcbiAgICAgICAgICAgIE1hdGgubWluKDI1NSwgYmdDb2xvci5yICsgMzApLFxuICAgICAgICAgICAgTWF0aC5taW4oMjU1LCBiZ0NvbG9yLmcgKyAzMCksXG4gICAgICAgICAgICBNYXRoLm1pbigyNTUsIGJnQ29sb3IuYiArIDMwKVxuICAgICAgICApO1xuICAgICAgICBiZy5saW5lV2lkdGggPSAyO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIsIC1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCwgOCk7XG4gICAgICAgIGJnLnN0cm9rZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5paH5a2XXG4gICAgICAgIHZhciB0ZXh0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGV4dFwiKTtcbiAgICAgICAgdGV4dE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgdGV4dE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIGxhYmVsID0gdGV4dE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxODtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgdGV4dE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgdGV4dE5vZGUucGFyZW50ID0gYnRuO1xuICAgICAgICBcbiAgICAgICAgLy8g6Kem5pG45pWI5p6cXG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMC45NTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDE7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu657K+576O6L6T5YWl5qGGXG4gICAgX2NyZWF0ZUJlYXV0aWZ1bElucHV0OiBmdW5jdGlvbihwbGFjZWhvbGRlciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgbm9kZU5hbWUpIHtcbiAgICAgICAgdmFyIGlucHV0Tm9kZSA9IG5ldyBjYy5Ob2RlKG5vZGVOYW1lIHx8IFwiQmVhdXRpZnVsSW5wdXRcIik7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgaW5wdXROb2RlLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBpbnB1dE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgaW5wdXROb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDovpPlhaXmoYbog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSW5wdXRCZ1wiKTtcbiAgICAgICAgYmdOb2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBiZ05vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgYmdOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgLy8g5YaF6YOo5aGr5YWFXG4gICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDU1LCA0NSwgNzAsIDI1NSk7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA2KTtcbiAgICAgICAgYmcuZmlsbCgpO1xuICAgICAgICAvLyDovrnmoYZcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxNTAsIDEyMCwgODAsIDIwMCk7XG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA2KTtcbiAgICAgICAgYmcuc3Ryb2tlKCk7XG4gICAgICAgIC8vIOWGhemDqOmrmOWFiVxuICAgICAgICBiZy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDgwLCA3MCwgMTAwLCAxMDApO1xuICAgICAgICBiZy5saW5lV2lkdGggPSAxO1xuICAgICAgICBiZy5yb3VuZFJlY3QoLXdpZHRoLzIgKyAzLCAtaGVpZ2h0LzIgKyAzLCB3aWR0aCAtIDYsIGhlaWdodCAtIDYsIDQpO1xuICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGlucHV0Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIHBsYWNlaG9sZGVy5paH5a2XXG4gICAgICAgIHZhciBwbGFjZWhvbGRlck5vZGUgPSBuZXcgY2MuTm9kZShcIlBsYWNlaG9sZGVyXCIpO1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLndpZHRoID0gd2lkdGggLSAyMDtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgXG4gICAgICAgIHZhciBsYWJlbCA9IHBsYWNlaG9sZGVyTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxNDtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgbGFiZWwudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuY29sb3IgPSBjYy5jb2xvcigxNDAsIDEzMCwgMTIwKTtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLnBhcmVudCA9IGlucHV0Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpbnB1dE5vZGU7XG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rnsr7nvo7mjInpkq5cbiAgICBfY3JlYXRlQmVhdXRpZnVsQnV0dG9uOiBmdW5jdGlvbih0ZXh0LCBiZ0NvbG9yLCBib3JkZXJDb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgY2FsbGJhY2ssIGlzUHJpbWFyeSkge1xuICAgICAgICB2YXIgYnRuID0gbmV3IGNjLk5vZGUoXCJCZWF1dGlmdWxCdG5fXCIgKyB0ZXh0KTtcbiAgICAgICAgYnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUod2lkdGgsIGhlaWdodCkpO1xuICAgICAgICBidG4uc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGJ0bi5hbmNob3JYID0gMC41O1xuICAgICAgICBidG4uYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruiDjOaZr+iKgueCuVxuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ05vZGVcIik7XG4gICAgICAgIGJnTm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgYmdOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGJnTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgdmFyIGJnID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLbmjInpkq7og4zmma9cbiAgICAgICAgYmcuZmlsbENvbG9yID0gYmdDb2xvcjtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDlpJbovrnmoYZcbiAgICAgICAgYmcuc3Ryb2tlQ29sb3IgPSBib3JkZXJDb2xvcjtcbiAgICAgICAgYmcubGluZVdpZHRoID0gMjtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDgpO1xuICAgICAgICBiZy5zdHJva2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4u+aMiemSrumrmOWFieaViOaenFxuICAgICAgICBpZiAoaXNQcmltYXJ5KSB7XG4gICAgICAgICAgICAvLyDpobbpg6jpq5jlhYlcbiAgICAgICAgICAgIGJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUsIDQwKTtcbiAgICAgICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiArIDMsIDMsIHdpZHRoIC0gNiwgaGVpZ2h0LzIgLSAzLCA1KTtcbiAgICAgICAgICAgIGJnLmZpbGwoKTtcbiAgICAgICAgICAgIC8vIOW6lemDqOmYtOW9sVxuICAgICAgICAgICAgYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgMzApO1xuICAgICAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yICsgMywgLWhlaWdodC8yICsgMywgd2lkdGggLSA2LCBoZWlnaHQvMywgMyk7XG4gICAgICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgYmdOb2RlLnBhcmVudCA9IGJ0bjtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruaWh+Wtl+iKgueCuVxuICAgICAgICB2YXIgdGV4dE5vZGUgPSBuZXcgY2MuTm9kZShcIlRleHROb2RlXCIpO1xuICAgICAgICB0ZXh0Tm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgdGV4dE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgdGV4dE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdGV4dE5vZGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGV4dE5vZGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBcbiAgICAgICAgdmFyIGxhYmVsID0gdGV4dE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gdGV4dDtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSBNYXRoLmZsb29yKGhlaWdodCAqIDAuNCk7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgdGV4dE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBvdXRsaW5lID0gdGV4dE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIG91dGxpbmUuY29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxNTApO1xuICAgICAgICBvdXRsaW5lLndpZHRoID0gMjtcbiAgICAgICAgdGV4dE5vZGUucGFyZW50ID0gYnRuO1xuICAgICAgICBcbiAgICAgICAgLy8g6Kem5pG45LqL5Lu2XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMC45NTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDE7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu65by556qX6L6T5YWl5qGGXG4gICAgX2NyZWF0ZURpYWxvZ0lucHV0OiBmdW5jdGlvbihwbGFjZWhvbGRlciwgeCwgeSwgd2lkdGgsIGhlaWdodCwgbm9kZU5hbWUpIHtcbiAgICAgICAgdmFyIGlucHV0Tm9kZSA9IG5ldyBjYy5Ob2RlKG5vZGVOYW1lIHx8IFwiRGlhbG9nSW5wdXRcIik7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgaW5wdXROb2RlLnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBpbnB1dE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgaW5wdXROb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICAvLyDovpPlhaXmoYbog4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiSW5wdXRCZ1wiKTtcbiAgICAgICAgYmdOb2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBiZ05vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgYmdOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIFxuICAgICAgICB2YXIgYmcgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYmcuZmlsbENvbG9yID0gY2MuY29sb3IoNTAsIDQ1LCA2NSwgMjU1KTtcbiAgICAgICAgYmcucm91bmRSZWN0KC13aWR0aC8yLCAtaGVpZ2h0LzIsIHdpZHRoLCBoZWlnaHQsIDUpO1xuICAgICAgICBiZy5maWxsKCk7XG4gICAgICAgIGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTAwLCA5MCwgNzAsIDIwMCk7XG4gICAgICAgIGJnLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA1KTtcbiAgICAgICAgYmcuc3Ryb2tlKCk7XG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBpbnB1dE5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyBwbGFjZWhvbGRlcuaWh+Wtl1xuICAgICAgICB2YXIgcGxhY2Vob2xkZXJOb2RlID0gbmV3IGNjLk5vZGUoXCJQbGFjZWhvbGRlclwiKTtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgcGxhY2Vob2xkZXJOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS53aWR0aCA9IHdpZHRoIC0gMjA7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB2YXIgbGFiZWwgPSBwbGFjZWhvbGRlck5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gcGxhY2Vob2xkZXI7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gTWF0aC5mbG9vcihoZWlnaHQgKiAwLjQpO1xuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBsYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHBsYWNlaG9sZGVyTm9kZS5jb2xvciA9IGNjLmNvbG9yKDEyMCwgMTEwLCAxMDApO1xuICAgICAgICBwbGFjZWhvbGRlck5vZGUucGFyZW50ID0gaW5wdXROb2RlO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlucHV0Tm9kZTtcbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaYvuekuuWKoOWFpeaIv+mXtOWvhueggemqjOivgeW8ueeql++8iOacieWvhueggeeahOaIv+mXtO+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93UGFzc3dvcmREaWFsb2c6IGZ1bmN0aW9uKHJvb21Db2RlLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+WuueWZqFxuICAgICAgICB2YXIgZGlhbG9nID0gbmV3IGNjLk5vZGUoXCJQYXNzd29yZERpYWxvZ1wiKTtcbiAgICAgICAgZGlhbG9nLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBkaWFsb2cuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGRpYWxvZy56SW5kZXggPSAzNTAwO1xuICAgICAgICBkaWFsb2cucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6YGu572pXG4gICAgICAgIHZhciBtYXNrID0gbmV3IGNjLk5vZGUoXCJNYXNrXCIpO1xuICAgICAgICB2YXIgbWFza0cgPSBtYXNrLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIG1hc2tHLmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDE4MCk7XG4gICAgICAgIG1hc2tHLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIG1hc2tHLmZpbGwoKTtcbiAgICAgICAgbWFzay5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICBtYXNrLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+S4u+S9k1xuICAgICAgICB2YXIgZGlhbG9nV2lkdGggPSAzNTA7XG4gICAgICAgIHZhciBkaWFsb2dIZWlnaHQgPSAyMjA7XG4gICAgICAgIHZhciBkaWFsb2dCZyA9IG5ldyBjYy5Ob2RlKFwiRGlhbG9nQmdcIik7XG4gICAgICAgIGRpYWxvZ0JnLnNldENvbnRlbnRTaXplKGNjLnNpemUoZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRiZyA9IGRpYWxvZ0JnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGRiZy5maWxsQ29sb3IgPSBjYy5jb2xvcigzNSwgMzAsIDUwLCAyNTApO1xuICAgICAgICBkYmcucm91bmRSZWN0KC1kaWFsb2dXaWR0aC8yLCAtZGlhbG9nSGVpZ2h0LzIsIGRpYWxvZ1dpZHRoLCBkaWFsb2dIZWlnaHQsIDEyKTtcbiAgICAgICAgZGJnLmZpbGwoKTtcbiAgICAgICAgZGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTgwLCAxNDAsIDYwLCAyMDApO1xuICAgICAgICBkYmcubGluZVdpZHRoID0gMztcbiAgICAgICAgZGJnLnJvdW5kUmVjdCgtZGlhbG9nV2lkdGgvMiwgLWRpYWxvZ0hlaWdodC8yLCBkaWFsb2dXaWR0aCwgZGlhbG9nSGVpZ2h0LCAxMik7XG4gICAgICAgIGRiZy5zdHJva2UoKTtcbiAgICAgICAgZGlhbG9nQmcucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZVRleHQgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZVRleHQuc2V0UG9zaXRpb24oMCwgZGlhbG9nSGVpZ2h0LzIgLSA0MCk7XG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aXRsZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIHR0bCA9IHRpdGxlVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0dGwuc3RyaW5nID0gXCLor6XmiL/pl7TpnIDopoHlr4bnoIFcIjtcbiAgICAgICAgdHRsLmZvbnRTaXplID0gMjI7XG4gICAgICAgIHR0bC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZVRleHQuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIyMCwgMTAwKTtcbiAgICAgICAgdGl0bGVUZXh0LnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOaIv+mXtOWPt+aYvuekulxuICAgICAgICB2YXIgY29kZVRleHQgPSBuZXcgY2MuTm9kZShcIlJvb21Db2RlXCIpO1xuICAgICAgICBjb2RlVGV4dC5zZXRQb3NpdGlvbigwLCBkaWFsb2dIZWlnaHQvMiAtIDc1KTtcbiAgICAgICAgY29kZVRleHQuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgY29kZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIGN0bCA9IGNvZGVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGN0bC5zdHJpbmcgPSBcIuaIv+mXtOWPtzogXCIgKyByb29tQ29kZTtcbiAgICAgICAgY3RsLmZvbnRTaXplID0gMTQ7XG4gICAgICAgIGN0bC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjb2RlVGV4dC5jb2xvciA9IGNjLmNvbG9yKDE2MCwgMTUwLCAxMzApO1xuICAgICAgICBjb2RlVGV4dC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDlr4bnoIHovpPlhaXmoYZcbiAgICAgICAgdmFyIHB3ZElucHV0ID0gdGhpcy5fY3JlYXRlRGlhbG9nSW5wdXQoXCLor7fovpPlhaXlr4bnoIFcIiwgMCwgMTAsIDIwMCwgMzYsIFwiUHdkSW5wdXRcIik7XG4gICAgICAgIHB3ZElucHV0LnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruWMuuWfn1xuICAgICAgICB2YXIgYnRuWSA9IC1kaWFsb2dIZWlnaHQvMiArIDQ1O1xuICAgICAgICBcbiAgICAgICAgLy8g5Y+W5raI5oyJ6ZKuXG4gICAgICAgIHZhciBjYW5jZWxCdG4gPSB0aGlzLl9jcmVhdGVCdXR0b25Ob2RlKFwi5Y+W5raIXCIsIGNjLmNvbG9yKDgwLCA3NSwgOTApLCAtNzAsIGJ0blksIDgwLCAzNCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FuY2VsQnRuLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOehruiupOaMiemSrlxuICAgICAgICB2YXIgY29uZmlybUJ0biA9IHRoaXMuX2NyZWF0ZUJ1dHRvbk5vZGUoXCLnoa7orqRcIiwgY2MuY29sb3IoNDAsIDEzMCwgNzApLCA3MCwgYnRuWSwgODAsIDM0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwd2RJbnB1dE5vZGUgPSBkaWFsb2cuZ2V0Q2hpbGRCeU5hbWUoXCJQd2RJbnB1dFwiKTtcbiAgICAgICAgICAgIHZhciBwbGFjZWhvbGRlciA9IHB3ZElucHV0Tm9kZSA/IHB3ZElucHV0Tm9kZS5nZXRDaGlsZEJ5TmFtZShcIlBsYWNlaG9sZGVyXCIpIDogbnVsbDtcbiAgICAgICAgICAgIHZhciBwYXNzd29yZCA9IHBsYWNlaG9sZGVyID8gcGxhY2Vob2xkZXIuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKS5zdHJpbmcgOiBcIlwiO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXBhc3N3b3JkIHx8IHBhc3N3b3JkID09PSBcIuivt+i+k+WFpeWvhueggVwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd1RpcEluRGlhbG9nKGRpYWxvZywgXCLor7fovpPlhaXlr4bnoIFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDpqozor4Hlr4bnoIHvvIjov5nph4zpnIDopoHosIPnlKjmnI3liqHnq6/pqozor4HvvIlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socGFzc3dvcmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgY29uZmlybUJ0bi5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZGlhbG9nO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Zyo5by556qX5Lit5pi+56S65o+Q56S6XG4gICAgX3Nob3dUaXBJbkRpYWxvZzogZnVuY3Rpb24oZGlhbG9nLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciB0aXAgPSBkaWFsb2cuZ2V0Q2hpbGRCeU5hbWUoXCJUaXBUZXh0XCIpO1xuICAgICAgICBpZiAodGlwKSB0aXAuZGVzdHJveSgpO1xuICAgICAgICBcbiAgICAgICAgdGlwID0gbmV3IGNjLk5vZGUoXCJUaXBUZXh0XCIpO1xuICAgICAgICB0aXAuc2V0UG9zaXRpb24oMCwgLTUwKTtcbiAgICAgICAgdGlwLmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRpcC5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgdmFyIGxhYmVsID0gdGlwLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMTQ7XG4gICAgICAgIGxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcC5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMTUwLCAxMDApO1xuICAgICAgICB0aXAucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGlwICYmIHRpcC5pc1ZhbGlkKSB0aXAuZGVzdHJveSgpO1xuICAgICAgICB9LCAyKTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOiOt+WPluW5tua4suafk+aIv+mXtOWIl+ihqO+8iOeUqOS6juWFqOWxj+WcuuaZr++8iS0g5Y+q5pi+56S655yf5a6e5oi/6Ze0XG4gICAgX2ZldGNoQW5kUmVuZGVyUm9vbUxpc3RGb3JTY2VuZTogZnVuY3Rpb24oY29udGFpbmVyLCBsb2FkaW5nTGFiZWwsIHJvb21Db25maWcsIHBsYXllckdvbGQsIHNjZW5lTm9kZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCA/IG15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6VXZWJTb2NrZXTmmK/lkKblt7Lov57mjqVcbiAgICAgICAgdmFyIGlzQ29ubmVjdGVkID0gc29ja2V0ICYmIHNvY2tldC5pc0Nvbm5lY3RlZCAmJiBzb2NrZXQuaXNDb25uZWN0ZWQoKTtcbiAgICAgICAgdmFyIGlzV2ViU29ja2V0T3BlbiA9IHNvY2tldCAmJiBzb2NrZXQuaXNXZWJTb2NrZXRPcGVuICYmIHNvY2tldC5pc1dlYlNvY2tldE9wZW4oKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyDlrZjlgqjlvZPliY3miL/pl7TliJfooajvvIznlKjkuo7lrp7ml7bmm7TmlrBcbiAgICAgICAgdmFyIGN1cnJlbnRSb29tcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572u5a6e5pe25oi/6Ze05YiX6KGo5pu05paw55uR5ZCs5ZmoXG4gICAgICAgIHZhciByb29tTGlzdFVwZGF0ZUhhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBhY3Rpb25UeXBlID0gZGF0YS5hY3Rpb25fdHlwZTtcbiAgICAgICAgICAgIHZhciByb29tQ29kZSA9IGRhdGEucm9vbV9jb2RlO1xuICAgICAgICAgICAgdmFyIHJvb20gPSBkYXRhLnJvb207XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChhY3Rpb25UeXBlID09PSBcImFkZFwiICYmIHJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyDmt7vliqDmlrDmiL/pl7RcbiAgICAgICAgICAgICAgICB2YXIgZXhpc3RzID0gY3VycmVudFJvb21zLnNvbWUoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHIucm9vbV9jb2RlIHx8IHIucm9vbUNvZGUpID09PSAocm9vbS5yb29tX2NvZGUgfHwgcm9vbS5yb29tQ29kZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvb21zLnB1c2gocm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb25UeXBlID09PSBcInVwZGF0ZVwiICYmIHJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDmiL/pl7Tkv6Hmga9cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnRSb29tcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGN1cnJlbnRSb29tc1tpXS5yb29tX2NvZGUgfHwgY3VycmVudFJvb21zW2ldLnJvb21Db2RlKSA9PT0gKHJvb20ucm9vbV9jb2RlIHx8IHJvb20ucm9vbUNvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um9vbXNbaV0gPSByb29tO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvblR5cGUgPT09IFwicmVtb3ZlXCIpIHtcbiAgICAgICAgICAgICAgICAvLyDnp7vpmaTmiL/pl7RcbiAgICAgICAgICAgICAgICBjdXJyZW50Um9vbXMgPSBjdXJyZW50Um9vbXMuZmlsdGVyKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChyLnJvb21fY29kZSB8fCByLnJvb21Db2RlKSAhPT0gcm9vbUNvZGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOmHjeaWsOa4suafk+aIv+mXtOWIl+ihqFxuICAgICAgICAgICAgdmFyIGZpbHRlcmVkUm9vbXMgPSBjdXJyZW50Um9vbXMuZmlsdGVyKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSByLnBsYXllcl9jb3VudCB8fCByLnBsYXllckNvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50ID4gMCAmJiBjb3VudCA8IDM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGYuX3JlbmRlclJvb21MaXN0SW5TY2VuZShjb250YWluZXIsIGZpbHRlcmVkUm9vbXMsIHJvb21Db25maWcsIHBsYXllckdvbGQsIHNjZW5lTm9kZSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDms6jlhoznm5HlkKzlmahcbiAgICAgICAgaWYgKHNvY2tldCAmJiBzb2NrZXQub25Sb29tTGlzdFVwZGF0ZSkge1xuICAgICAgICAgICAgc29ja2V0Lm9uUm9vbUxpc3RVcGRhdGUocm9vbUxpc3RVcGRhdGVIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y55uR5ZCs5Zmo5byV55So77yM55So5LqO5ZCO57ut5Y+W5raI5rOo5YaMXG4gICAgICAgIHNjZW5lTm9kZS5fcm9vbUxpc3RVcGRhdGVIYW5kbGVyID0gcm9vbUxpc3RVcGRhdGVIYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6cV2ViU29ja2V05pyq6L+e5o6l77yM5pi+56S656m65YiX6KGoXG4gICAgICAgIGlmICghc29ja2V0IHx8ICFpc0Nvbm5lY3RlZCB8fCAhaXNXZWJTb2NrZXRPcGVuKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChsb2FkaW5nTGFiZWwgJiYgbG9hZGluZ0xhYmVsLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZ0xhYmVsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmmL7npLrnqbrliJfooajmj5DnpLpcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW5kZXJSb29tTGlzdEluU2NlbmUoY29udGFpbmVyLCBbXSwgcm9vbUNvbmZpZywgcGxheWVyR29sZCwgc2NlbmVOb2RlKTtcbiAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9rui2heaXtlxuICAgICAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChsb2FkaW5nTGFiZWwgJiYgbG9hZGluZ0xhYmVsLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nTGFiZWwuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDmmL7npLrnqbrliJfooajmj5DnpLpcbiAgICAgICAgICAgIHNlbGYuX3JlbmRlclJvb21MaXN0SW5TY2VuZShjb250YWluZXIsIFtdLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkLCBzY2VuZU5vZGUpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgXG4gICAgICAgIHNvY2tldC5nZXRSb29tTGlzdChmdW5jdGlvbihyZXN1bHQsIHJvb21zKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobG9hZGluZ0xhYmVsICYmIGxvYWRpbmdMYWJlbC5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0xhYmVsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSAwICYmIHJvb21zICYmIHJvb21zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyDlrZjlgqjmiL/pl7TliJfooajnlKjkuo7lrp7ml7bmm7TmlrBcbiAgICAgICAgICAgICAgICBjdXJyZW50Um9vbXMgPSByb29tcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDov4fmu6TvvJrlj6rmmL7npLrkurrmlbDlsJHkuo4z5Lq655qE5oi/6Ze0XG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkUm9vbXMgPSByb29tcy5maWx0ZXIoZnVuY3Rpb24ocm9vbSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY291bnQgPSByb29tLnBsYXllcl9jb3VudCB8fCByb29tLnBsYXllckNvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb3VudCA+IDAgJiYgY291bnQgPCAzO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuX3JlbmRlclJvb21MaXN0SW5TY2VuZShjb250YWluZXIsIGZpbHRlcmVkUm9vbXMsIHJvb21Db25maWcsIHBsYXllckdvbGQsIHNjZW5lTm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOayoeacieaIv+mXtOaIluivt+axguWksei0pe+8jOaYvuekuuepuuWIl+ihqFxuICAgICAgICAgICAgICAgIHNlbGYuX3JlbmRlclJvb21MaXN0SW5TY2VuZShjb250YWluZXIsIFtdLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkLCBzY2VuZU5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuXG4gICAgXG4gICAgLy8g5riy5p+T5oi/6Ze05YiX6KGo77yI566A5rSB5riF5pmw55qE5YiX6KGo6K6+6K6h77yJXG4gICAgX3JlbmRlclJvb21MaXN0SW5TY2VuZTogZnVuY3Rpb24oY29udGFpbmVyLCByb29tcywgcm9vbUNvbmZpZywgcGxheWVyR29sZCwgc2NlbmVOb2RlKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8vIOa4heepuuWuueWZqOS4remdnkxvYWRpbmdMYWJlbOeahOWtkOiKgueCuVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW4uc2xpY2UoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldLm5hbWUgIT09IFwiTG9hZGluZ0xhYmVsXCIpIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBjb250YWluZXJXaWR0aCA9IGNvbnRhaW5lci53aWR0aDtcbiAgICAgICAgdmFyIGNvbFdpZHRoID0gY29udGFpbmVyV2lkdGggLyA1O1xuICAgICAgICB2YXIgaXRlbUhlaWdodCA9IDUwOyAgLy8g5aKe5Yqg5YiX6KGo6aG56auY5bqmXG4gICAgICAgIHZhciBzdGFydFkgPSBjb250YWluZXIuaGVpZ2h0LzIgLSAxNTtcbiAgICAgICAgXG4gICAgICAgIC8vIOepuuWIl+ihqOWkhOeQhlxuICAgICAgICBpZiAoIXJvb21zIHx8IHJvb21zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGVtcHR5Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiRW1wdHlUaXBcIik7XG4gICAgICAgICAgICBlbXB0eU5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIGVtcHR5Tm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgdmFyIGVsID0gZW1wdHlOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBlbC5zdHJpbmcgPSBcIuaaguaXoOWPr+WKoOWFpeeahOaIv+mXtFwiO1xuICAgICAgICAgICAgZWwuZm9udFNpemUgPSAxODsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICAgICAgZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgIGVtcHR5Tm9kZS5jb2xvciA9IGNjLmNvbG9yKDE2MCwgMTUwLCAxNDApO1xuICAgICAgICAgICAgZW1wdHlOb2RlLnBhcmVudCA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5riy5p+T5oi/6Ze05YiX6KGo6aG5XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbXMubGVuZ3RoICYmIGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gcm9vbXNbaV07XG4gICAgICAgICAgICB2YXIgaXRlbVkgPSBzdGFydFkgLSBpICogaXRlbUhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5YiX6KGo6aG56IOM5pmvXG4gICAgICAgICAgICB2YXIgaXRlbUJnID0gbmV3IGNjLk5vZGUoXCJSb29tSXRlbV9cIiArIGkpO1xuICAgICAgICAgICAgaXRlbUJnLnNldENvbnRlbnRTaXplKGNjLnNpemUoY29udGFpbmVyV2lkdGggLSA1LCBpdGVtSGVpZ2h0IC0gNCkpO1xuICAgICAgICAgICAgaXRlbUJnLnNldFBvc2l0aW9uKDAsIGl0ZW1ZKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGlnID0gaXRlbUJnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgICAgICBpZy5maWxsQ29sb3IgPSBpICUgMiA9PT0gMCA/IGNjLmNvbG9yKDM1LCAzMCwgNTAsIDIyMCkgOiBjYy5jb2xvcigzMCwgMjgsIDQ1LCAyMjApO1xuICAgICAgICAgICAgaWcucm91bmRSZWN0KC0oY29udGFpbmVyV2lkdGggLSA1KS8yLCAtKGl0ZW1IZWlnaHQgLSA0KS8yLCBjb250YWluZXJXaWR0aCAtIDUsIGl0ZW1IZWlnaHQgLSA0LCA0KTtcbiAgICAgICAgICAgIGlnLmZpbGwoKTtcbiAgICAgICAgICAgIGl0ZW1CZy5wYXJlbnQgPSBjb250YWluZXI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwbGF5ZXJDb3VudCA9IHJvb20ucGxheWVyX2NvdW50IHx8IHJvb20ucGxheWVyQ291bnQgfHwgMDtcbiAgICAgICAgICAgIHZhciByb29tQ29kZSA9IHJvb20ucm9vbV9jb2RlIHx8IHJvb20ucm9vbUNvZGUgfHwgXCLmnKrnn6VcIjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5oi/6Ze05Y+3IC0g5aKe5aSn5a2X5L2TXG4gICAgICAgICAgICB2YXIgY29kZVRleHQgPSBuZXcgY2MuTm9kZShcIkNvZGVUZXh0XCIpO1xuICAgICAgICAgICAgY29kZVRleHQueCA9IC1jb250YWluZXJXaWR0aC8yICsgY29sV2lkdGggKiAwLjU7XG4gICAgICAgICAgICBjb2RlVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgY29kZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgICAgIHZhciBjbCA9IGNvZGVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBjbC5zdHJpbmcgPSByb29tQ29kZTtcbiAgICAgICAgICAgIGNsLmZvbnRTaXplID0gMTY7ICAvLyDlop7lpKflrZfkvZNcbiAgICAgICAgICAgIGNsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBjb2RlVGV4dC5jb2xvciA9IGNjLmNvbG9yKDIyMCwgMjAwLCAxNjApO1xuICAgICAgICAgICAgY29kZVRleHQucGFyZW50ID0gaXRlbUJnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkurrmlbAgLSDlop7lpKflrZfkvZNcbiAgICAgICAgICAgIHZhciBjb3VudFRleHQgPSBuZXcgY2MuTm9kZShcIkNvdW50VGV4dFwiKTtcbiAgICAgICAgICAgIGNvdW50VGV4dC54ID0gLWNvbnRhaW5lcldpZHRoLzIgKyBjb2xXaWR0aCAqIDEuNTtcbiAgICAgICAgICAgIGNvdW50VGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgY291bnRUZXh0LmFuY2hvclkgPSAwLjU7XG4gICAgICAgICAgICB2YXIgY3RsID0gY291bnRUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBjdGwuc3RyaW5nID0gcGxheWVyQ291bnQgKyBcIi8zXCI7XG4gICAgICAgICAgICBjdGwuZm9udFNpemUgPSAxNjsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICAgICAgY3RsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBjb3VudFRleHQuY29sb3IgPSBwbGF5ZXJDb3VudCA+PSAzID8gY2MuY29sb3IoMjIwLCAxMDAsIDgwKSA6IGNjLmNvbG9yKDEwMCwgMjAwLCAxMDApO1xuICAgICAgICAgICAgY291bnRUZXh0LnBhcmVudCA9IGl0ZW1CZztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5bqV5YiGIC0g5aKe5aSn5a2X5L2TXG4gICAgICAgICAgICB2YXIgc2NvcmVUZXh0ID0gbmV3IGNjLk5vZGUoXCJTY29yZVRleHRcIik7XG4gICAgICAgICAgICBzY29yZVRleHQueCA9IC1jb250YWluZXJXaWR0aC8yICsgY29sV2lkdGggKiAyLjU7XG4gICAgICAgICAgICBzY29yZVRleHQuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIHNjb3JlVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgdmFyIHNsID0gc2NvcmVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBzbC5zdHJpbmcgPSBcIlwiICsgKHJvb20uYmFzZV9zY29yZSB8fCByb29tQ29uZmlnLmJhc2Vfc2NvcmUgfHwgMSk7XG4gICAgICAgICAgICBzbC5mb250U2l6ZSA9IDE2OyAgLy8g5aKe5aSn5a2X5L2TXG4gICAgICAgICAgICBzbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICAgICAgc2NvcmVUZXh0LmNvbG9yID0gY2MuY29sb3IoMjIwLCAxODAsIDgwKTtcbiAgICAgICAgICAgIHNjb3JlVGV4dC5wYXJlbnQgPSBpdGVtQmc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOeKtuaAgSAtIOWinuWkp+Wtl+S9k1xuICAgICAgICAgICAgdmFyIHN0YXR1c1RleHQgPSBuZXcgY2MuTm9kZShcIlN0YXR1c1RleHRcIik7XG4gICAgICAgICAgICBzdGF0dXNUZXh0LnggPSAtY29udGFpbmVyV2lkdGgvMiArIGNvbFdpZHRoICogMy41O1xuICAgICAgICAgICAgc3RhdHVzVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgc3RhdHVzVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgdmFyIHN0bCA9IHN0YXR1c1RleHQuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIHN0bC5zdHJpbmcgPSBwbGF5ZXJDb3VudCA+PSAzID8gXCLlt7Lmu6FcIiA6IFwi562J5b6F5LitXCI7XG4gICAgICAgICAgICBzdGwuZm9udFNpemUgPSAxNjsgIC8vIOWinuWkp+Wtl+S9k1xuICAgICAgICAgICAgc3RsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgICAgICBzdGF0dXNUZXh0LmNvbG9yID0gcGxheWVyQ291bnQgPj0gMyA/IGNjLmNvbG9yKDIyMCwgMTAwLCA4MCkgOiBjYy5jb2xvcigxMDAsIDIwMCwgMTAwKTtcbiAgICAgICAgICAgIHN0YXR1c1RleHQucGFyZW50ID0gaXRlbUJnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliqDlhaXmjInpkq4gLSDlop7lpKflsLrlr7hcbiAgICAgICAgICAgIChmdW5jdGlvbihyb29tRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBqb2luQnRuID0gc2VsZi5fY3JlYXRlQWN0aW9uQnV0dG9uKFxuICAgICAgICAgICAgICAgICAgICBcIuWKoOWFpVwiLFxuICAgICAgICAgICAgICAgICAgICBjYy5jb2xvcig3NiwgMTc1LCA4MCksXG4gICAgICAgICAgICAgICAgICAgIC1jb250YWluZXJXaWR0aC8yICsgY29sV2lkdGggKiA0LjUsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDcwLCAzNiwgIC8vIOWinuWKoOWwuuWvuFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2RlID0gcm9vbURhdGEucm9vbV9jb2RlIHx8IHJvb21EYXRhLnJvb21Db2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjZW5lID0gc2NlbmVOb2RlLmdldENoaWxkQnlOYW1lKFwiUm9vbUxpc3RTY2VuZVwiKSB8fCBzY2VuZU5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NlbmUuZGVzdHJveSkgc2NlbmUuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fam9pblJvb20oY29kZSwgcm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGpvaW5CdG4ucGFyZW50ID0gaXRlbUJnO1xuICAgICAgICAgICAgfSkocm9vbSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOaYvuekuuaIv+mXtOWIl+ihqOW8ueeql1xuICAgIF9zaG93Um9vbUxpc3REaWFsb2c6IGZ1bmN0aW9uKHJvb21Db25maWcsIHBsYXllckdvbGQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen55qE5by556qXXG4gICAgICAgIHZhciBvbGREaWFsb2cgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJSb29tTGlzdERpYWxvZ1wiKTtcbiAgICAgICAgaWYgKG9sZERpYWxvZykgb2xkRGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOenu+mZpOaXp+eahOaPkOekulxuICAgICAgICB2YXIgb2xkVGlwID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwicm9vbV90aXBcIik7XG4gICAgICAgIGlmIChvbGRUaXApIG9sZFRpcC5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65by556qX5a655ZmoXG4gICAgICAgIHZhciBkaWFsb2cgPSBuZXcgY2MuTm9kZShcIlJvb21MaXN0RGlhbG9nXCIpO1xuICAgICAgICBkaWFsb2cuc2V0Q29udGVudFNpemUoY2Muc2l6ZSg2NTAsIDQ1MCkpO1xuICAgICAgICBkaWFsb2cuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgZGlhbG9nLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIGRpYWxvZy54ID0gMDtcbiAgICAgICAgZGlhbG9nLnkgPSA1MDsgIC8vIOeojeW+ruS4iuenu1xuICAgICAgICBkaWFsb2cuekluZGV4ID0gMTAwMDsgIC8vIOehruS/neWcqOacgOS4iuWxglxuICAgICAgICBkaWFsb2cucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg6IOM5pmv6YGu572p77yI5Y2K6YCP5piO6buR6Imy77yJXG4gICAgICAgIHZhciBtYXNrID0gbmV3IGNjLk5vZGUoXCJNYXNrXCIpO1xuICAgICAgICBtYXNrLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBtYXNrLmFuY2hvclggPSAwLjU7XG4gICAgICAgIG1hc2suYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgbWFzay54ID0gMDtcbiAgICAgICAgbWFzay55ID0gLTUwO1xuICAgICAgICB2YXIgbWFza0dyYXBoaWNzID0gbWFzay5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBtYXNrR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgMTgwKTtcbiAgICAgICAgbWFza0dyYXBoaWNzLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIG1hc2tHcmFwaGljcy5maWxsKCk7XG4gICAgICAgIG1hc2sucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g54K55Ye76YGu572p5YWz6Zet5by556qXXG4gICAgICAgIG1hc2sub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOW8ueeql+iDjOaZr++8iOeZveiJsuWchuinkuefqeW9ou+8iVxuICAgICAgICB2YXIgYmdOb2RlID0gbmV3IGNjLk5vZGUoXCJCZ05vZGVcIik7XG4gICAgICAgIGJnTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDYyMCwgNDIwKSk7XG4gICAgICAgIHZhciBiZ0dyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGJnR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoNDUsIDQ1LCA2NSwgMjU1KTtcbiAgICAgICAgYmdHcmFwaGljcy5yb3VuZFJlY3QoLTMxMCwgLTIxMCwgNjIwLCA0MjAsIDE1KTtcbiAgICAgICAgYmdHcmFwaGljcy5maWxsKCk7XG4gICAgICAgIGJnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigxMDAsIDEwMCwgMTQwLCAyNTUpO1xuICAgICAgICBiZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IDM7XG4gICAgICAgIGJnR3JhcGhpY3Mucm91bmRSZWN0KC0zMTAsIC0yMTAsIDYyMCwgNDIwLCAxNSk7XG4gICAgICAgIGJnR3JhcGhpY3Muc3Ryb2tlKCk7XG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpophcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIik7XG4gICAgICAgIHRpdGxlTm9kZS55ID0gMTcwO1xuICAgICAgICB2YXIgdGl0bGVMYWJlbCA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi44CQXCIgKyByb29tQ29uZmlnLnJvb21fbmFtZSArIFwi44CRXCI7XG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSAzNjtcbiAgICAgICAgdGl0bGVMYWJlbC5saW5lSGVpZ2h0ID0gNDQ7XG4gICAgICAgIHRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyMTUsIDApO1xuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5Ymv5qCH6aKYXG4gICAgICAgIHZhciBzdWJUaXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcIlN1YlRpdGxlXCIpO1xuICAgICAgICBzdWJUaXRsZU5vZGUueSA9IDEzMDtcbiAgICAgICAgdmFyIHN1YlRpdGxlTGFiZWwgPSBzdWJUaXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgc3ViVGl0bGVMYWJlbC5zdHJpbmcgPSBcIumAieaLqea4uOaIj+aWueW8j1wiO1xuICAgICAgICBzdWJUaXRsZUxhYmVsLmZvbnRTaXplID0gMjQ7XG4gICAgICAgIHN1YlRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgc3ViVGl0bGVOb2RlLmNvbG9yID0gY2MuY29sb3IoMTgwLCAxODAsIDIwMCk7XG4gICAgICAgIHN1YlRpdGxlTm9kZS5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmiL/pl7TliJfooajlrrnlmahcbiAgICAgICAgdmFyIGxpc3RDb250YWluZXIgPSBuZXcgY2MuTm9kZShcIkxpc3RDb250YWluZXJcIik7XG4gICAgICAgIGxpc3RDb250YWluZXIuc2V0Q29udGVudFNpemUoY2Muc2l6ZSg1ODAsIDEyMCkpO1xuICAgICAgICBsaXN0Q29udGFpbmVyLnkgPSA1MDtcbiAgICAgICAgbGlzdENvbnRhaW5lci5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3kuK3nmoTmj5DnpLpcbiAgICAgICAgdmFyIGxvYWRpbmdMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0xhYmVsXCIpO1xuICAgICAgICBsb2FkaW5nTGFiZWwueSA9IDA7XG4gICAgICAgIHZhciBsb2FkaW5nID0gbG9hZGluZ0xhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxvYWRpbmcuc3RyaW5nID0gXCLmraPlnKjojrflj5bmiL/pl7TliJfooaguLi5cIjtcbiAgICAgICAgbG9hZGluZy5mb250U2l6ZSA9IDIyO1xuICAgICAgICBsb2FkaW5nLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGxvYWRpbmdMYWJlbC5jb2xvciA9IGNjLmNvbG9yKDE1MCwgMTUwLCAxNzApO1xuICAgICAgICBsb2FkaW5nTGFiZWwucGFyZW50ID0gbGlzdENvbnRhaW5lcjtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruWuueWZqCAtIOaUvuWcqOS4remXtOaYvuecvOS9jee9rlxuICAgICAgICB2YXIgYnRuQ29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJCdG5Db250YWluZXJcIik7XG4gICAgICAgIGJ0bkNvbnRhaW5lci55ID0gLTYwO1xuICAgICAgICBidG5Db250YWluZXIucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5b+r6YCf5Yy56YWN5oyJ6ZKu77yI57u/6Imy77yM5pyA5aSn77yJXG4gICAgICAgIHZhciBxdWlja01hdGNoQnRuID0gdGhpcy5fY3JlYXRlQnV0dG9uKFwi8J+OriDlv6vpgJ/ljLnphY1cIiwgY2MuY29sb3IoNDYsIDEyNSwgNTApLCAtMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICBzZWxmLl9xdWlja01hdGNoKHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICB9LCAxODAsIDU1KTtcbiAgICAgICAgcXVpY2tNYXRjaEJ0bi5wYXJlbnQgPSBidG5Db250YWluZXI7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmiL/pl7TmjInpkq7vvIjok53oibLvvIlcbiAgICAgICAgdmFyIGNyZWF0ZVJvb21CdG4gPSB0aGlzLl9jcmVhdGVCdXR0b24oXCLwn4+gIOWIm+W7uuaIv+mXtFwiLCBjYy5jb2xvcigyMSwgMTAxLCAxOTIpLCAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICBzZWxmLl9jcmVhdGVSb29tKHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICB9LCAxODAsIDU1KTtcbiAgICAgICAgY3JlYXRlUm9vbUJ0bi5wYXJlbnQgPSBidG5Db250YWluZXI7XG4gICAgICAgIFxuICAgICAgICAvLyDlhbPpl63mjInpkq7vvIjngbDoibLvvIlcbiAgICAgICAgdmFyIGNsb3NlQnRuID0gdGhpcy5fY3JlYXRlQnV0dG9uKFwi4pyWIOWFs+mXrVwiLCBjYy5jb2xvcigxMjAsIDEyMCwgMTIwKSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgIH0sIDEwMCwgNDUpO1xuICAgICAgICBjbG9zZUJ0bi5wYXJlbnQgPSBidG5Db250YWluZXI7XG4gICAgICAgIFxuICAgICAgICAvLyDovpPlhaXmiL/pl7Tlj7fljLrln59cbiAgICAgICAgdmFyIGlucHV0Q29udGFpbmVyID0gbmV3IGNjLk5vZGUoXCJJbnB1dENvbnRhaW5lclwiKTtcbiAgICAgICAgaW5wdXRDb250YWluZXIueSA9IC0xNDA7XG4gICAgICAgIGlucHV0Q29udGFpbmVyLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIHZhciBpbnB1dExhYmVsID0gbmV3IGNjLk5vZGUoXCJJbnB1dExhYmVsXCIpO1xuICAgICAgICBpbnB1dExhYmVsLnggPSAtMjUwO1xuICAgICAgICB2YXIgaW5wdXRMYWJlbENvbXAgPSBpbnB1dExhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGlucHV0TGFiZWxDb21wLnN0cmluZyA9IFwi5oi/6Ze05Y+3OlwiO1xuICAgICAgICBpbnB1dExhYmVsQ29tcC5mb250U2l6ZSA9IDIyO1xuICAgICAgICBpbnB1dExhYmVsLmNvbG9yID0gY2MuY29sb3IoMjAwLCAyMDAsIDIwMCk7XG4gICAgICAgIGlucHV0TGFiZWwucGFyZW50ID0gaW5wdXRDb250YWluZXI7XG4gICAgICAgIFxuICAgICAgICAvLyDmiL/pl7Tlj7fovpPlhaXmoYbog4zmma9cbiAgICAgICAgdmFyIGlucHV0QmdOb2RlID0gbmV3IGNjLk5vZGUoXCJJbnB1dEJnXCIpO1xuICAgICAgICBpbnB1dEJnTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDE4MCwgNDApKTtcbiAgICAgICAgaW5wdXRCZ05vZGUueCA9IC0xMTA7XG4gICAgICAgIHZhciBpbnB1dEJnID0gaW5wdXRCZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgaW5wdXRCZy5maWxsQ29sb3IgPSBjYy5jb2xvcig2MCwgNjAsIDgwLCAyNTUpO1xuICAgICAgICBpbnB1dEJnLnJvdW5kUmVjdCgtOTAsIC0yMCwgMTgwLCA0MCwgNSk7XG4gICAgICAgIGlucHV0QmcuZmlsbCgpO1xuICAgICAgICBpbnB1dEJnTm9kZS5wYXJlbnQgPSBpbnB1dENvbnRhaW5lcjtcbiAgICAgICAgXG4gICAgICAgIHZhciBpbnB1dFRleHQgPSBpbnB1dEJnTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBpbnB1dFRleHQuc3RyaW5nID0gXCLngrnlh7vovpPlhaXmiL/pl7Tlj7dcIjtcbiAgICAgICAgaW5wdXRUZXh0LmZvbnRTaXplID0gMTg7XG4gICAgICAgIGlucHV0VGV4dC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBpbnB1dFRleHQudmVydGljYWxBbGlnbiA9IGNjLkxhYmVsLlZlcnRpY2FsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yqg5YWl5oi/6Ze05oyJ6ZKuXG4gICAgICAgIHZhciBqb2luQnRuID0gdGhpcy5fY3JlYXRlQnV0dG9uKFwi4p6kIOWKoOWFpVwiLCBjYy5jb2xvcigyMzAsIDEyNiwgMzQpLCAxMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJvb21Db2RlID0gaW5wdXRUZXh0LnN0cmluZztcbiAgICAgICAgICAgIGlmIChyb29tQ29kZSAmJiByb29tQ29kZSAhPT0gXCLngrnlh7vovpPlhaXmiL/pl7Tlj7dcIikge1xuICAgICAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fam9pblJvb20ocm9vbUNvZGUsIHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZUNlbnRlcihcIuivt+i+k+WFpeaIv+mXtOWPt1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgOTAsIDQwKTtcbiAgICAgICAgam9pbkJ0bi5wYXJlbnQgPSBpbnB1dENvbnRhaW5lcjtcbiAgICAgICAgXG4gICAgICAgIC8vIOW6lemDqOaPkOekulxuICAgICAgICB2YXIgdGlwTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGlwXCIpO1xuICAgICAgICB0aXBOb2RlLnkgPSAtMTg1O1xuICAgICAgICB2YXIgdGlwTGFiZWwgPSB0aXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpcExhYmVsLnN0cmluZyA9IFwi5o+Q56S677ya5b+r6YCf5Yy56YWN5bCG6Ieq5Yqo5Li65oKo5YiG6YWN5oi/6Ze0XCI7XG4gICAgICAgIHRpcExhYmVsLmZvbnRTaXplID0gMTY7XG4gICAgICAgIHRpcExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigxMjAsIDEyMCwgMTQwKTtcbiAgICAgICAgdGlwTm9kZS5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmiL/pl7TliJfooahcbiAgICAgICAgdGhpcy5fZmV0Y2hSb29tTGlzdChsaXN0Q29udGFpbmVyLCBsb2FkaW5nTGFiZWwpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Yib5bu65oyJ6ZKuIC0g5pS56L+b54mI5pysXG4gICAgX2NyZWF0ZUJ1dHRvbjogZnVuY3Rpb24odGV4dCwgY29sb3IsIHgsIGNhbGxiYWNrLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgMTQwO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgNTA7XG4gICAgICAgIFxuICAgICAgICB2YXIgYnRuID0gbmV3IGNjLk5vZGUodGV4dCArIFwiQnRuXCIpO1xuICAgICAgICBidG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIGJ0bi54ID0geDtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruiDjOaZr1xuICAgICAgICB2YXIgYmcgPSBidG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgYmcuZmlsbENvbG9yID0gY29sb3I7XG4gICAgICAgIGJnLnJvdW5kUmVjdCgtd2lkdGgvMiwgLWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0LCA4KTtcbiAgICAgICAgYmcuZmlsbCgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5oyJ6ZKu5paH5a2XXG4gICAgICAgIHZhciBsYWJlbCA9IGJ0bi5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSB0ZXh0O1xuICAgICAgICBsYWJlbC5mb250U2l6ZSA9IDIwO1xuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBsYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGJ0bi5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBcbiAgICAgICAgLy8g6Kem5pG45pWI5p6cXG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMC45NTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGJ0bi5zY2FsZSA9IDE7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBidG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfQ0FOQ0VMLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYnRuLnNjYWxlID0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH0sXG4gICAgXG4gICAgLy8g6I635Y+W5oi/6Ze05YiX6KGoIC0g5Y+q5pi+56S655yf5a6e5oi/6Ze0XG4gICAgX2ZldGNoUm9vbUxpc3Q6IGZ1bmN0aW9uKGNvbnRhaW5lciwgbG9hZGluZ0xhYmVsKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICB2YXIgc29ja2V0ID0gbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0ID8gbXlnbG9iYWwuc29ja2V0IDogbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpVdlYlNvY2tldOaYr+WQpuW3sui/nuaOpVxuICAgICAgICB2YXIgaXNDb25uZWN0ZWQgPSBzb2NrZXQgJiYgc29ja2V0LmlzQ29ubmVjdGVkICYmIHNvY2tldC5pc0Nvbm5lY3RlZCgpO1xuICAgICAgICB2YXIgaXNXZWJTb2NrZXRPcGVuID0gc29ja2V0ICYmIHNvY2tldC5pc1dlYlNvY2tldE9wZW4gJiYgc29ja2V0LmlzV2ViU29ja2V0T3BlbigpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenFdlYlNvY2tldOacqui/nuaOpe+8jOaYvuekuuepuuWIl+ihqFxuICAgICAgICBpZiAoIXNvY2tldCB8fCAhaXNDb25uZWN0ZWQgfHwgIWlzV2ViU29ja2V0T3Blbikge1xuICAgICAgICAgICAgbG9hZGluZ0xhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gXCLmnKrov57mjqXmnI3liqHlmahcIjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRpbmdMYWJlbCAmJiBsb2FkaW5nTGFiZWwuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkaW5nTGFiZWwuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDmmL7npLrnqbrliJfooajmj5DnpLpcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW5kZXJSb29tTGlzdChjb250YWluZXIsIFtdKTtcbiAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9rui2heaXtlxuICAgICAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChsb2FkaW5nTGFiZWwgJiYgbG9hZGluZ0xhYmVsLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nTGFiZWwuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5pi+56S656m65YiX6KGo5o+Q56S6XG4gICAgICAgICAgICBzZWxmLl9yZW5kZXJSb29tTGlzdChjb250YWluZXIsIFtdKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIFxuICAgICAgICBzb2NrZXQuZ2V0Um9vbUxpc3QoZnVuY3Rpb24ocmVzdWx0LCByb29tcykge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChsb2FkaW5nTGFiZWwgJiYgbG9hZGluZ0xhYmVsLmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nTGFiZWwuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSAwICYmIHJvb21zICYmIHJvb21zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZW5kZXJSb29tTGlzdChjb250YWluZXIsIHJvb21zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5pyN5Yqh56uv6L+U5Zue56m65YiX6KGo5oiW5aSx6LSl77yM5pi+56S656m65YiX6KGoXG4gICAgICAgICAgICAgICAgc2VsZi5fcmVuZGVyUm9vbUxpc3QoY29udGFpbmVyLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5riy5p+T5oi/6Ze05YiX6KGoIC0g5Y+q5pi+56S655yf5a6e5oi/6Ze0XG4gICAgX3JlbmRlclJvb21MaXN0OiBmdW5jdGlvbihjb250YWluZXIsIHJvb21zKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOayoeacieaIv+mXtO+8jOaYvuekuuepuuWIl+ihqOaPkOekulxuICAgICAgICBpZiAoIXJvb21zIHx8IHJvb21zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGVtcHR5Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiRW1wdHlUaXBcIik7XG4gICAgICAgICAgICBlbXB0eU5vZGUueSA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBlbXB0eUJnID0gZW1wdHlOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgICAgICBlbXB0eUJnLmZpbGxDb2xvciA9IGNjLmNvbG9yKDM1LCAzMCwgNTAsIDIwMCk7XG4gICAgICAgICAgICBlbXB0eUJnLnJvdW5kUmVjdCgtMTUwLCAtMjUsIDMwMCwgNTAsIDgpO1xuICAgICAgICAgICAgZW1wdHlCZy5maWxsKCk7XG4gICAgICAgICAgICBlbXB0eUJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTAwLCA4MCwgNTAsIDE1MCk7XG4gICAgICAgICAgICBlbXB0eUJnLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgICAgICBlbXB0eUJnLnJvdW5kUmVjdCgtMTUwLCAtMjUsIDMwMCwgNTAsIDgpO1xuICAgICAgICAgICAgZW1wdHlCZy5zdHJva2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGVtcHR5TGFiZWwgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpO1xuICAgICAgICAgICAgZW1wdHlMYWJlbC5hbmNob3JYID0gMC41O1xuICAgICAgICAgICAgZW1wdHlMYWJlbC5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgdmFyIGVsID0gZW1wdHlMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgZWwuc3RyaW5nID0gXCLmmoLml6DmiL/pl7TvvIzor7fliJvlu7rmiJbliLfmlrBcIjtcbiAgICAgICAgICAgIGVsLmZvbnRTaXplID0gMTY7XG4gICAgICAgICAgICBlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICAgICAgZW1wdHlMYWJlbC5jb2xvciA9IGNjLmNvbG9yKDE4MCwgMTYwLCAxMjApO1xuICAgICAgICAgICAgZW1wdHlMYWJlbC5wYXJlbnQgPSBlbXB0eU5vZGU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVtcHR5Tm9kZS5wYXJlbnQgPSBjb250YWluZXI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbXMubGVuZ3RoICYmIGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb29tID0gcm9vbXNbaV07XG4gICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBjYy5Ob2RlKFwiUm9vbUl0ZW1fXCIgKyBpKTtcbiAgICAgICAgICAgIGl0ZW0uc2V0Q29udGVudFNpemUoY2Muc2l6ZSg1NDAsIDM1KSk7XG4gICAgICAgICAgICBpdGVtLnkgPSA3MCAtIGkgKiA0MDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJnID0gaXRlbS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGJnLmNvbG9yID0gaSAlIDIgPT09IDAgPyBjYy5jb2xvcig1MCwgNTAsIDcwKSA6IGNjLmNvbG9yKDQ1LCA0NSwgNjUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmiL/pl7Tlj7dcbiAgICAgICAgICAgIHZhciBjb2RlTGFiZWwgPSBuZXcgY2MuTm9kZSgpO1xuICAgICAgICAgICAgY29kZUxhYmVsLnggPSAtMjAwO1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBjb2RlTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIGNvZGUuc3RyaW5nID0gXCLmiL/pl7Q6IFwiICsgKHJvb20ucm9vbV9jb2RlIHx8IHJvb20ucm9vbUNvZGUgfHwgXCLmnKrnn6VcIik7XG4gICAgICAgICAgICBjb2RlLmZvbnRTaXplID0gMTg7XG4gICAgICAgICAgICBjb2RlTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyMDAsIDIwMCwgMjAwKTtcbiAgICAgICAgICAgIGNvZGVMYWJlbC5wYXJlbnQgPSBpdGVtO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkurrmlbBcbiAgICAgICAgICAgIHZhciBjb3VudExhYmVsID0gbmV3IGNjLk5vZGUoKTtcbiAgICAgICAgICAgIGNvdW50TGFiZWwueCA9IDUwO1xuICAgICAgICAgICAgdmFyIGNvdW50ID0gY291bnRMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgY291bnQuc3RyaW5nID0gXCLkurrmlbA6IFwiICsgKHJvb20ucGxheWVyX2NvdW50IHx8IHJvb20ucGxheWVyQ291bnQgfHwgMCkgKyBcIi8zXCI7XG4gICAgICAgICAgICBjb3VudC5mb250U2l6ZSA9IDE4O1xuICAgICAgICAgICAgY291bnRMYWJlbC5jb2xvciA9IGNjLmNvbG9yKDE1MCwgMjAwLCAxNTApO1xuICAgICAgICAgICAgY291bnRMYWJlbC5wYXJlbnQgPSBpdGVtO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliqDlhaXmjInpkq5cbiAgICAgICAgICAgIHZhciBqb2luQnRuID0gdGhpcy5fY3JlYXRlQnV0dG9uKFwi5Yqg5YWlXCIsIGNjLmNvbG9yKDc2LCAxNzUsIDgwKSwgMjAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgcm9vbUNvZGUgPSByb29tLnJvb21fY29kZSB8fCByb29tLnJvb21Db2RlO1xuICAgICAgICAgICAgICAgIHNlbGYuX2pvaW5Sb29tKHJvb21Db2RlLCBteWdsb2JhbC5jdXJyZW50Um9vbUNvbmZpZywgbXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGpvaW5CdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSg3MCwgMzApKTtcbiAgICAgICAgICAgIGpvaW5CdG4ueCA9IDIyMDtcbiAgICAgICAgICAgIGpvaW5CdG4ucGFyZW50ID0gaXRlbTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaXRlbS5wYXJlbnQgPSBjb250YWluZXI7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOW/q+mAn+WMuemFjSAtIOaZuuiDveWMuemFje+8iOS8mOWFiOWKoOWFpeeOsOacieetieW+heaIv+mXtO+8iVxuICAgIF9xdWlja01hdGNoOiBmdW5jdGlvbihyb29tQ29uZmlnLCBwbGF5ZXJHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICB2YXIgc29ja2V0ID0gbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0ID8gbXlnbG9iYWwuc29ja2V0IDogbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpVdlYlNvY2tldOeJqeeQhui/nuaOpeaYr+WQpuaJk+W8gFxuICAgICAgICB2YXIgaXNXZWJTb2NrZXRPcGVuID0gc29ja2V0ICYmIHNvY2tldC5pc1dlYlNvY2tldE9wZW4gJiYgc29ja2V0LmlzV2ViU29ja2V0T3BlbigpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2VDZW50ZXIoXCLmraPlnKjmmbrog73ljLnphY0uLi5cIik7XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpxXZWJTb2NrZXTmnKrmiZPlvIDvvIznrYnlvoXov57mjqVcbiAgICAgICAgaWYgKCFzb2NrZXQgfHwgIWlzV2ViU29ja2V0T3Blbikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlsJ3or5XliJ3lp4vljJZXZWJTb2NrZXTov57mjqVcbiAgICAgICAgICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LmluaXRTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuaW5pdFNvY2tldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDnrYnlvoVXZWJTb2NrZXTov57mjqXlkI7ov5vooYzmmbrog73ljLnphY1cbiAgICAgICAgICAgIHRoaXMuX3dhaXRGb3JDb25uZWN0aW9uQW5kU21hcnRNYXRjaChyb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2ViU29ja2V05bey6L+e5o6l77yM5omn6KGM5pm66IO95Yy56YWNXG4gICAgICAgIHRoaXMuX3NtYXJ0TWF0Y2gocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDmmbrog73ljLnphY3vvJrkvJjlhYjliqDlhaXnrYnlvoXmiL/pl7TvvIzmsqHmnInliJnliJvlu7rmlrDmiL/pl7RcbiAgICBfc21hcnRNYXRjaDogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCA/IG15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXNvY2tldCkge1xuICAgICAgICAgICAgc2VsZi5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5pyN5Yqh5Zmo6L+e5o6l5byC5bi477yM6K+356iN5ZCO6YeN6K+VXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g56ys5LiA5q2l77ya6I635Y+W5Y+v5Yqg5YWl55qE5oi/6Ze05YiX6KGoXG4gICAgICAgIGlmIChzb2NrZXQuZ2V0Um9vbUxpc3QpIHtcbiAgICAgICAgICAgIHNvY2tldC5nZXRSb29tTGlzdChmdW5jdGlvbihyZXN1bHQsIHJvb21zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21zICYmIHJvb21zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gMCAmJiByb29tcyAmJiByb29tcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaJvuWIsOS6uuaVsOS4jei2szPkurrnmoTnrYnlvoXmiL/pl7RcbiAgICAgICAgICAgICAgICAgICAgLy8g5rOo5oSP77ya5pyN5Yqh5Zmo6L+U5Zue55qE5a2X5q615ZCN5pivIHJvb21fY29kZSDlkowgcGxheWVyX2NvdW5077yI6JuH5b2i5ZG95ZCN77yJXG4gICAgICAgICAgICAgICAgICAgIHZhciB3YWl0aW5nUm9vbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb29tID0gcm9vbXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlhbzlrrnkuKTnp43lkb3lkI3mlrnlvI9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb3VudCA9IHJvb20ucGxheWVyX2NvdW50ICE9PSB1bmRlZmluZWQgPyByb29tLnBsYXllcl9jb3VudCA6IHJvb20ucGxheWVyQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm9vbUNvZGUgPSByb29tLnJvb21fY29kZSB8fCByb29tLnJvb21Db2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0aW5nUm9vbSA9IHJvb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YWl0aW5nUm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pyJ562J5b6F5Lit55qE5oi/6Ze077yM5Yqg5YWl6K+l5oi/6Ze0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2FpdGluZ1Jvb21Db2RlID0gd2FpdGluZ1Jvb20ucm9vbV9jb2RlIHx8IHdhaXRpbmdSb29tLnJvb21Db2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2VDZW50ZXIoXCLmib7liLDnrYnlvoXmiL/pl7TvvIzmraPlnKjliqDlhaUuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9qb2luUm9vbSh3YWl0aW5nUm9vbUNvZGUsIHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOayoeacieWPr+WKoOWFpeeahOaIv+mXtO+8jOWIm+W7uuaWsOaIv+mXtFxuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5Yib5bu65paw5oi/6Ze077yM562J5b6F5YW25LuW546p5a62Li4uXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2NyZWF0ZVJvb20ocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOayoeacieiOt+WPluaIv+mXtOWIl+ihqOeahOaWueazle+8jOebtOaOpeWIm+W7uuaIv+mXtFxuICAgICAgICAgICAgc2VsZi5fY3JlYXRlUm9vbShyb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g562J5b6F6L+e5o6l5ZCO6L+b6KGM5pm66IO95Yy56YWNXG4gICAgX3dhaXRGb3JDb25uZWN0aW9uQW5kU21hcnRNYXRjaDogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzb2NrZXQgPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnNvY2tldCA/IHdpbmRvdy5teWdsb2JhbC5zb2NrZXQgOiBudWxsO1xuICAgICAgICB2YXIgYXR0ZW1wdHMgPSAwO1xuICAgICAgICB2YXIgbWF4QXR0ZW1wdHMgPSAxNTsgIC8vIPCflKfjgJDkvJjljJbjgJHlop7liqDlsJ3or5XmrKHmlbDvvIzkvYblh4/lsJHmr4/mrKHpl7TpmpRcbiAgICAgICAgXG4gICAgICAgIHZhciB0cnlDb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhdHRlbXB0cysrO1xuICAgICAgICAgICAgdmFyIGlzV2ViU29ja2V0T3BlbiA9IHNvY2tldCAmJiBzb2NrZXQuaXNXZWJTb2NrZXRPcGVuID8gc29ja2V0LmlzV2ViU29ja2V0T3BlbigpIDogZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGlzV2ViU29ja2V0T3Blbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX3NtYXJ0TWF0Y2gocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGF0dGVtcHRzIDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRyeUNvbm5lY3QsIDIwMCk7ICAvLyDwn5Sn44CQ5LyY5YyW44CR5YeP5bCR6Ze06ZqU5YiwMjAwbXNcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIui/nuaOpeacjeWKoeWZqOWksei0pe+8jOivt+ajgOafpee9kee7nOWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQodHJ5Q29ubmVjdCwgMTAwKTsgIC8vIPCflKfjgJDkvJjljJbjgJHpppbmrKHlsJ3or5Xlj6rpnIAxMDBtc1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Y+R6YCB5b+r6YCf5Yy56YWN6K+35rGC77yI6Zif5YiX5Yy56YWN5qih5byPIC0g5aSH55So77yJXG4gICAgX3NlbmRRdWlja01hdGNoUmVxdWVzdDogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCA/IG15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXNvY2tldCB8fCAhc29ja2V0LnJlcXVlc3RfZW50ZXJfcm9vbSkge1xuICAgICAgICAgICAgc2VsZi5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5pyN5Yqh5Zmo6L+e5o6l5byC5bi477yM6K+356iN5ZCO6YeN6K+VXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g5riF6Zmk5LmL5YmN55qE6LaF5pe26K6h5pe25ZmoXG4gICAgICAgIGlmICh0aGlzLl9lbnRlclJvb21UaW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fZW50ZXJSb29tVGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLl9lbnRlclJvb21UaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc29ja2V0LnJlcXVlc3RfZW50ZXJfcm9vbSh7IHJvb21fbGV2ZWw6IHJvb21Db25maWcucm9vbV90eXBlIH0sIGZ1bmN0aW9uKHJlc3VsdCwgZGF0YSkge1xuICAgICAgICAgICAgLy8g5riF6Zmk6LaF5pe26K6h5pe25ZmoXG4gICAgICAgICAgICBpZiAoc2VsZi5fZW50ZXJSb29tVGltZW91dCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLl9lbnRlclJvb21UaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBzZWxmLl9lbnRlclJvb21UaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSAwICYmIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAobXlnbG9iYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucm9vbURhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLmJvdHRvbSA9IHJvb21Db25maWcuYmFzZV9zY29yZSB8fCAxO1xuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLnJhdGUgPSByb29tQ29uZmlnLm11bHRpcGxpZXIgfHwgMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5fZW50ZXJHYW1lU2NlbmUoZGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX2hpZGVNZXNzYWdlQ2VudGVyKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLljLnphY3lpLHotKXvvIzor7fnqI3lkI7ph43or5VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572u6LaF5pe2XG4gICAgICAgIHRoaXMuX2VudGVyUm9vbVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fZW50ZXJSb29tVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9oaWRlTWVzc2FnZUNlbnRlcigpO1xuICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLljLnphY3otoXml7bvvIzor7fmo4Dmn6XnvZHnu5zov57mjqVcIik7XG4gICAgICAgIH0sIDE1MDAwKTsgIC8vIOWinuWKoOi2heaXtuaXtumXtOWIsDE156eSXG4gICAgfSxcbiAgICBcbiAgICAvLyDliJvlu7rmiL/pl7QgLSDlj6rkvb/nlKjnnJ/lrp5zb2NrZXTov57mjqVcbiAgICBfY3JlYXRlUm9vbTogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCA/IG15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6VXZWJTb2NrZXTniannkIbov57mjqXmmK/lkKbmiZPlvIBcbiAgICAgICAgdmFyIGlzV2ViU29ja2V0T3BlbiA9IHNvY2tldCAmJiBzb2NrZXQuaXNXZWJTb2NrZXRPcGVuICYmIHNvY2tldC5pc1dlYlNvY2tldE9wZW4oKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5q2j5Zyo6L+b5YWl5ri45oiPLi4uXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6cV2ViU29ja2V05pyq5omT5byA77yM5bCd6K+V6L+e5o6lXG4gICAgICAgIGlmICghc29ja2V0IHx8ICFpc1dlYlNvY2tldE9wZW4pIHtcbiAgICAgICAgICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LmluaXRTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuaW5pdFNvY2tldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fd2FpdEZvckNvbm5lY3Rpb25BbmRDcmVhdGVSb29tKHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlj5HpgIHliJvlu7rmiL/pl7Tor7fmsYJcbiAgICAgICAgdGhpcy5fc2VuZENyZWF0ZVJvb21SZXF1ZXN0KHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Y+R6YCB5Yib5bu65oi/6Ze06K+35rGCXG4gICAgX3NlbmRDcmVhdGVSb29tUmVxdWVzdDogZnVuY3Rpb24ocm9vbUNvbmZpZywgcGxheWVyR29sZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHNvY2tldCA9IG15Z2xvYmFsICYmIG15Z2xvYmFsLnNvY2tldCA/IG15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXNvY2tldCB8fCAhc29ja2V0LmNyZWF0ZVJvb20pIHtcbiAgICAgICAgICAgIHNlbGYuX2hpZGVNZXNzYWdlQ2VudGVyKCk7XG4gICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuacjeWKoeWZqOi/nuaOpeW8guW4uO+8jOivt+eojeWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPluW9k+WJjeeOqeWutueahOacjeWKoeerr0lE77yI55So5LqO5oi/5Li75Yik5pat77yJXG4gICAgICAgIHZhciBwbGF5ZXJJZCA9IFwiXCJcbiAgICAgICAgaWYgKHNvY2tldC5nZXRQbGF5ZXJJbmZvKSB7XG4gICAgICAgICAgICB2YXIgcGxheWVySW5mbyA9IHNvY2tldC5nZXRQbGF5ZXJJbmZvKClcbiAgICAgICAgICAgIHBsYXllcklkID0gcGxheWVySW5mby5pZFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDms6jmhI/vvJpzb2NrZXQuY3JlYXRlUm9vbSDnmoTnrKzkuIDkuKrlj4LmlbDmmK8gcm9vbUNvbmZpZ0lk77yM56ys5LqM5Liq5Y+C5pWw5pivIGNhbGxiYWNrXG4gICAgICAgIHZhciByb29tQ29uZmlnSWQgPSByb29tQ29uZmlnID8gcm9vbUNvbmZpZy5pZCA6IG51bGw7XG4gICAgICAgIHNvY2tldC5jcmVhdGVSb29tKHJvb21Db25maWdJZCwgZnVuY3Rpb24ocmVzdWx0LCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSAwICYmIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5LyY5YWI5L2/55So5pyN5Yqh56uv6L+U5Zue55qE546p5a625pWw5o2uXG4gICAgICAgICAgICAgICAgdmFyIHNlcnZlclBsYXllciA9IGRhdGEucGxheWVyIHx8IHt9O1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50aWQ6IHNlcnZlclBsYXllci5pZCB8fCBwbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnVuaXF1ZUlELFxuICAgICAgICAgICAgICAgICAgICBuaWNrX25hbWU6IHNlcnZlclBsYXllci5uYW1lIHx8IG15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogbXlnbG9iYWwucGxheWVyRGF0YS5hdmF0YXJVcmwgfHwgXCJhdmF0YXJfMVwiLFxuICAgICAgICAgICAgICAgICAgICBnb2xkX2NvdW50OiBzZXJ2ZXJQbGF5ZXIuZ29sZF9jb3VudCB8fCBwbGF5ZXJHb2xkIHx8IDAsICAvLyDwn5Sn44CQ5L+u5aSN44CR5LyY5YWI5L2/55So5pyN5Yqh56uv6L+U5Zue55qE6YeR5biBXG4gICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogc2VydmVyUGxheWVyLmdvbGRfY291bnQgfHwgcGxheWVyR29sZCB8fCAwLCAgIC8vIOWFvOWuueaXp+WuouaIt+err1xuICAgICAgICAgICAgICAgICAgICBzZWF0aW5kZXg6IChzZXJ2ZXJQbGF5ZXIuc2VhdCAhPT0gdW5kZWZpbmVkID8gc2VydmVyUGxheWVyLnNlYXQgOiAwKSArIDEsXG4gICAgICAgICAgICAgICAgICAgIGlzcmVhZHk6IHNlcnZlclBsYXllci5yZWFkeSB8fCB0cnVlICAvLyDmiL/kuLvliJvlu7rmiL/pl7Tpu5jorqTlt7Llh4blpIdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOi9rOaNouaVsOaNruagvOW8j1xuICAgICAgICAgICAgICAgIHZhciByb29tRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbWlkOiBkYXRhLnJvb21fY29kZSB8fCBkYXRhLnJvb21Db2RlIHx8IFwiTkVXX1JPT01cIixcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9jb2RlOiBkYXRhLnJvb21fY29kZSB8fCBkYXRhLnJvb21Db2RlIHx8IFwiTkVXX1JPT01cIixcbiAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiAoc2VydmVyUGxheWVyLnNlYXQgIT09IHVuZGVmaW5lZCA/IHNlcnZlclBsYXllci5zZWF0IDogMCkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBbcGxheWVyRGF0YV0sXG4gICAgICAgICAgICAgICAgICAgIGhvdXNlbWFuYWdlaWQ6IHNlcnZlclBsYXllci5pZCB8fCBwbGF5ZXJJZCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCB8fCBteWdsb2JhbC5wbGF5ZXJEYXRhLnVuaXF1ZUlEXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBteWdsb2JhbC5yb29tRGF0YSA9IHJvb21EYXRhO1xuICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEuYm90dG9tID0gcm9vbUNvbmZpZy5iYXNlX3Njb3JlIHx8IDE7XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5yYXRlID0gcm9vbUNvbmZpZy5tdWx0aXBsaWVyIHx8IDE7XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5yb29taWQgPSByb29tRGF0YS5yb29tX2NvZGU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y6YeN6L+e5L+h5oGvXG4gICAgICAgICAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQuc2F2ZVJlY29ubmVjdEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LnNhdmVSZWNvbm5lY3RJbmZvKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNlbGYuX2VudGVyR2FtZVNjZW5lKHJvb21EYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuWIm+W7uuaIv+mXtOWksei0pe+8jOivt+eojeWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDnrYnlvoXov57mjqXlkI7liJvlu7rmiL/pl7RcbiAgICBfd2FpdEZvckNvbm5lY3Rpb25BbmRDcmVhdGVSb29tOiBmdW5jdGlvbihyb29tQ29uZmlnLCBwbGF5ZXJHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHNvY2tldCA9IHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwuc29ja2V0ID8gd2luZG93Lm15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIHZhciBhdHRlbXB0cyA9IDA7XG4gICAgICAgIHZhciBtYXhBdHRlbXB0cyA9IDE1OyAgLy8g8J+Up+OAkOS8mOWMluOAkeWinuWKoOWwneivleasoeaVsFxuICAgICAgICBcbiAgICAgICAgdmFyIHRyeUNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGF0dGVtcHRzKys7XG4gICAgICAgICAgICB2YXIgaXNXZWJTb2NrZXRPcGVuID0gc29ja2V0ICYmIHNvY2tldC5pc1dlYlNvY2tldE9wZW4gPyBzb2NrZXQuaXNXZWJTb2NrZXRPcGVuKCkgOiBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaXNXZWJTb2NrZXRPcGVuKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2VuZENyZWF0ZVJvb21SZXF1ZXN0KHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRlbXB0cyA8IG1heEF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0cnlDb25uZWN0LCAyMDApOyAgLy8g8J+Up+OAkOS8mOWMluOAkeWHj+WwkemXtOmalOWIsDIwMG1zXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX2hpZGVNZXNzYWdlQ2VudGVyKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLov57mjqXmnI3liqHlmajlpLHotKXvvIzor7fmo4Dmn6XnvZHnu5zlkI7ph43or5VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBzZXRUaW1lb3V0KHRyeUNvbm5lY3QsIDEwMCk7ICAvLyDwn5Sn44CQ5LyY5YyW44CR6aaW5qyh5bCd6K+V5Y+q6ZyAMTAwbXNcbiAgICB9LFxuICAgIFxuICAgIC8vIOWKoOWFpeaIv+mXtCAtIOWPquS9v+eUqOecn+WunnNvY2tldOi/nuaOpVxuICAgIF9qb2luUm9vbTogZnVuY3Rpb24ocm9vbUNvZGUsIHJvb21Db25maWcsIHBsYXllckdvbGQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIHZhciBzb2NrZXQgPSBteWdsb2JhbCAmJiBteWdsb2JhbC5zb2NrZXQgPyBteWdsb2JhbC5zb2NrZXQgOiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+lV2ViU29ja2V054mp55CG6L+e5o6l5piv5ZCm5omT5byAXG4gICAgICAgIHZhciBpc1dlYlNvY2tldE9wZW4gPSBzb2NrZXQgJiYgc29ja2V0LmlzV2ViU29ja2V0T3BlbiAmJiBzb2NrZXQuaXNXZWJTb2NrZXRPcGVuKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZUNlbnRlcihcIuato+WcqOWKoOWFpeaIv+mXtCBcIiArIHJvb21Db2RlICsgXCIuLi5cIik7XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpxXZWJTb2NrZXTmnKrmiZPlvIDvvIzlsJ3or5Xov57mjqVcbiAgICAgICAgaWYgKCFzb2NrZXQgfHwgIWlzV2ViU29ja2V0T3Blbikge1xuICAgICAgICAgICAgaWYgKHNvY2tldCAmJiBzb2NrZXQuaW5pdFNvY2tldCkge1xuICAgICAgICAgICAgICAgIHNvY2tldC5pbml0U29ja2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl93YWl0Rm9yQ29ubmVjdGlvbkFuZEpvaW5Sb29tKHJvb21Db2RlLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Y+R6YCB5Yqg5YWl5oi/6Ze06K+35rGCXG4gICAgICAgIHRoaXMuX3NlbmRKb2luUm9vbVJlcXVlc3Qocm9vbUNvZGUsIHJvb21Db25maWcsIHBsYXllckdvbGQpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Y+R6YCB5Yqg5YWl5oi/6Ze06K+35rGCXG4gICAgX3NlbmRKb2luUm9vbVJlcXVlc3Q6IGZ1bmN0aW9uKHJvb21Db2RlLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICB2YXIgc29ja2V0ID0gbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0ID8gbXlnbG9iYWwuc29ja2V0IDogbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmICghc29ja2V0IHx8ICFzb2NrZXQuam9pblJvb20pIHtcbiAgICAgICAgICAgIHNlbGYuX2hpZGVNZXNzYWdlQ2VudGVyKCk7XG4gICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuacjeWKoeWZqOi/nuaOpeW8guW4uO+8jOivt+eojeWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHNvY2tldC5qb2luUm9vbShyb29tQ29kZSwgZnVuY3Rpb24ocmVzdWx0LCBkYXRhKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IDAgJiYgZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIOajgOafpSBwbGF5ZXJzIOaVsOe7hOaYr+WQpuWtmOWcqFxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gZGF0YS5wbGF5ZXJzIHx8IFtdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOiOt+WPluaIv+S4u0lEXG4gICAgICAgICAgICAgICAgdmFyIGNyZWF0b3JJZCA9IGRhdGEuY3JlYXRvcl9pZCB8fCBkYXRhLmNyZWF0b3JJZCB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeOqeWutueahCBzb2NrZXQgcGxheWVySW5mb1xuICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LmdldFBsYXllckluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckluZm8gPSBteWdsb2JhbC5zb2NrZXQuZ2V0UGxheWVySW5mbygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDovazmjaLmlbDmja7moLzlvI9cbiAgICAgICAgICAgICAgICB2YXIgcm9vbURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21pZDogZGF0YS5yb29tX2NvZGUgfHwgZGF0YS5yb29tQ29kZSB8fCByb29tQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9jb2RlOiBkYXRhLnJvb21fY29kZSB8fCBkYXRhLnJvb21Db2RlIHx8IHJvb21Db2RlLFxuICAgICAgICAgICAgICAgICAgICBzZWF0aW5kZXg6IGRhdGEucGxheWVyID8gZGF0YS5wbGF5ZXIuc2VhdCArIDEgOiAxLCAgLy8g5bqn5L2N57Si5byV5LuOMeW8gOWni1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJkYXRhOiBwbGF5ZXJzLm1hcChmdW5jdGlvbihwLCBpZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudGlkOiBwLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5pY2tfbmFtZTogcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcC5hdmF0YXIgfHwgXCJhdmF0YXJfMVwiLCAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOWunumZheWktOWDj1VSTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRfY291bnQ6IHAuZ29sZF9jb3VudCB8fCAwLCAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqOacjeWKoeerr+WPkemAgeeahOmHkeW4geaVsOmHj1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGRjb3VudDogcC5nb2xkX2NvdW50IHx8IDAsICAgLy8g5YW85a655pen5a6i5oi356uvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhdGluZGV4OiAocC5zZWF0ICE9PSB1bmRlZmluZWQgPyBwLnNlYXQgOiBpZHgpICsgMSwgIC8vIOW6p+S9jee0ouW8leS7jjHlvIDlp4tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3JlYWR5OiBwLnJlYWR5IHx8IGZhbHNlICAvLyDlh4blpIfnirbmgIFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBob3VzZW1hbmFnZWlkOiBjcmVhdG9ySWQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0b3JfaWQ6IGNyZWF0b3JJZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbXlnbG9iYWwucm9vbURhdGEgPSByb29tRGF0YTtcbiAgICAgICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLmJvdHRvbSA9IHJvb21Db25maWcuYmFzZV9zY29yZSB8fCAxO1xuICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEucmF0ZSA9IHJvb21Db25maWcubXVsdGlwbGllciB8fCAxO1xuICAgICAgICAgICAgICAgIHNlbGYuX2VudGVyR2FtZVNjZW5lKHJvb21EYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuWKoOWFpeaIv+mXtOWksei0pe+8jOaIv+mXtOWPr+iDveS4jeWtmOWcqFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDnrYnlvoXov57mjqXlkI7liqDlhaXmiL/pl7RcbiAgICBfd2FpdEZvckNvbm5lY3Rpb25BbmRKb2luUm9vbTogZnVuY3Rpb24ocm9vbUNvZGUsIHJvb21Db25maWcsIHBsYXllckdvbGQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc29ja2V0ID0gd2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5zb2NrZXQgPyB3aW5kb3cubXlnbG9iYWwuc29ja2V0IDogbnVsbDtcbiAgICAgICAgdmFyIGF0dGVtcHRzID0gMDtcbiAgICAgICAgdmFyIG1heEF0dGVtcHRzID0gMTU7ICAvLyDwn5Sn44CQ5LyY5YyW44CR5aKe5Yqg5bCd6K+V5qyh5pWwXG4gICAgICAgIFxuICAgICAgICB2YXIgdHJ5Q29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXR0ZW1wdHMrKztcbiAgICAgICAgICAgIHZhciBpc1dlYlNvY2tldE9wZW4gPSBzb2NrZXQgJiYgc29ja2V0LmlzV2ViU29ja2V0T3BlbiA/IHNvY2tldC5pc1dlYlNvY2tldE9wZW4oKSA6IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpc1dlYlNvY2tldE9wZW4pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zZW5kSm9pblJvb21SZXF1ZXN0KHJvb21Db2RlLCByb29tQ29uZmlnLCBwbGF5ZXJHb2xkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ZW1wdHMgPCBtYXhBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodHJ5Q29ubmVjdCwgMjAwKTsgIC8vIPCflKfjgJDkvJjljJbjgJHlh4/lsJHpl7TpmpTliLAyMDBtc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9oaWRlTWVzc2FnZUNlbnRlcigpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi6L+e5o6l5pyN5Yqh5Zmo5aSx6LSl77yM6K+35qOA5p+l572R57uc5ZCO6YeN6K+VXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCh0cnlDb25uZWN0LCAxMDApOyAgLy8g8J+Up+OAkOS8mOWMluOAkemmluasoeWwneivleWPqumcgDEwMG1zXG4gICAgfSxcbiAgICBcbiAgICAvLyDnrYnlvoUgV2ViU29ja2V0IOi/nuaOpeWQjui/m+WFpeaIv+mXtO+8iOWPquS9v+eUqOecn+WunnNvY2tldOi/nuaOpe+8iVxuICAgIF93YWl0Rm9yQ29ubmVjdGlvbkFuZEVudGVyUm9vbTogZnVuY3Rpb24ocm9vbUNvbmZpZywgc29ja2V0LCBwbGF5ZXJHb2xkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICB2YXIgYXR0ZW1wdHMgPSAwO1xuICAgICAgICB2YXIgbWF4QXR0ZW1wdHMgPSAxMDsgIC8vIOacgOWkmuetieW+hTXnp5JcbiAgICAgICAgXG4gICAgICAgIHZhciB0cnlFbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXR0ZW1wdHMrKztcbiAgICAgICAgICAgIHZhciBpc1dlYlNvY2tldE9wZW4gPSBzb2NrZXQgJiYgc29ja2V0LmlzV2ViU29ja2V0T3BlbiA/IHNvY2tldC5pc1dlYlNvY2tldE9wZW4oKSA6IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpc1dlYlNvY2tldE9wZW4pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zZW5kUXVpY2tNYXRjaFJlcXVlc3Qocm9vbUNvbmZpZywgcGxheWVyR29sZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGF0dGVtcHRzIDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRyeUVudGVyLCA1MDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDov57mjqXotoXml7bvvIzmj5DnpLrnlKjmiLfmo4Dmn6XnvZHnu5xcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiV2ViU29ja2V0IOi/nuaOpei2heaXtlwiKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9oaWRlTWVzc2FnZUNlbnRlcigpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi6L+e5o6l5pyN5Yqh5Zmo6LaF5pe277yM6K+35qOA5p+l572R57uc6K6+572uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCh0cnlFbnRlciwgNTAwKTtcbiAgICB9LFxuICAgIFxuICAgIF9mb3JtYXRHb2xkOiBmdW5jdGlvbihnb2xkKSB7XG4gICAgICAgIGlmIChnb2xkID49IDEwMDAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKGdvbGQgLyAxMDAwMCkudG9GaXhlZCgxKSArIFwi5LiHXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdvbGQudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIFxuICAgIF9lbnRlckdhbWVTY2VuZTogZnVuY3Rpb24ocm9vbURhdGEpIHtcbiAgICAgICAgdmFyIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDpmpDol4/liqDovb3mj5DnpLpcbiAgICAgICAgdGhpcy5faGlkZU1lc3NhZ2VDZW50ZXIoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkvJjljJbjgJHmmL7npLrlv6vpgJ/ov5vlhaXliqjnlLtcbiAgICAgICAgdGhpcy5fc2hvd1F1aWNrRW50ZXJBbmltYXRpb24oKTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkvJjljJbjgJHkvb/nlKjpooTliqDovb3nmoTlnLrmma/vvIzliIfmjaLmm7Tlv6tcbiAgICAgICAgaWYgKHRoaXMuX2dhbWVTY2VuZVByZWxvYWRlZCkge1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IucnVuU2NlbmVJbW1lZGlhdGUobmV3IGNjLlNjZW5lKCksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImdhbWVTY2VuZVwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfmoAgW+i/m+WFpeWcuuaZr10g5Yqg6L295ri45oiP5Zy65pmv5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiZ2FtZVNjZW5lXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfmoAgW+i/m+WFpeWcuuaZr10g5Yqg6L295ri45oiP5Zy65pmv5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDwn5Sn44CQ5paw5aKe44CR5pi+56S65b+r6YCf6L+b5YWl5Yqo55S777yI5L2/55So5Yqg6L295Zu+54mH77yJXG4gICAgX3Nob3dRdWlja0VudGVyQW5pbWF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuW/q+mAn+i/m+WFpemBrue9qVxuICAgICAgICB2YXIgbWFza05vZGUgPSBuZXcgY2MuTm9kZShcIlF1aWNrRW50ZXJNYXNrXCIpO1xuICAgICAgICBtYXNrTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoICogMiwgc2NyZWVuSGVpZ2h0ICogMikpO1xuICAgICAgICBtYXNrTm9kZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApO1xuICAgICAgICBtYXNrTm9kZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgbWFza05vZGUuekluZGV4ID0gOTk5OTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoCBCbG9ja0lucHV0RXZlbnRzIOmYsuatoueCueWHu+epv+mAj1xuICAgICAgICBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cyk7XG4gICAgICAgIG1hc2tOb2RlLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKjliqDovb3lm77niYfmm7/ku6PmloflrZdcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoJ1VJL2xvYWRpbmdfaW1hZ2UnLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgLy8g8J+Up+OAkOWFs+mUruS/ruWkjeOAkeajgOafpeiKgueCueaYr+WQpuS7jeeEtuacieaViFxuICAgICAgICAgICAgaWYgKCFtYXNrTm9kZSB8fCAhbWFza05vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Yqg6L295Zu+54mH5Zue6LCD5pe26IqC54K55bey6ZSA5q+B77yM6Lez6L+HXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGVyciB8fCAhc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLliqDovb0gbG9hZGluZ19pbWFnZS5wbmcg5aSx6LSl77yM5L2/55So5paH5a2X5o+Q56S6XCIpO1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOaWh+Wtl+aPkOekulxuICAgICAgICAgICAgICAgIHZhciBsb2FkaW5nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ1RleHRcIik7XG4gICAgICAgICAgICAgICAgbG9hZGluZ05vZGUueSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGxvYWRpbmdMYWJlbCA9IGxvYWRpbmdOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0xhYmVsLnN0cmluZyA9IFwi5q2j5Zyo6L+b5YWl5ri45oiPLi4uXCI7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0xhYmVsLmZvbnRTaXplID0gMzI7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0xhYmVsLmxpbmVIZWlnaHQgPSA0MDtcbiAgICAgICAgICAgICAgICBsb2FkaW5nTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgICAgICBsb2FkaW5nTm9kZS5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgIGxvYWRpbmdOb2RlLnBhcmVudCA9IG1hc2tOb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu65Yqg6L295Zu+54mH6IqC54K5XG4gICAgICAgICAgICB2YXIgbG9hZGluZ0ltYWdlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTG9hZGluZ0ltYWdlXCIpO1xuICAgICAgICAgICAgbG9hZGluZ0ltYWdlTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDEyMCwgMTIwKSk7XG4gICAgICAgICAgICBsb2FkaW5nSW1hZ2VOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICBsb2FkaW5nSW1hZ2VOb2RlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBsb2FkaW5nSW1hZ2VOb2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICBzcHJpdGUudHlwZSA9IGNjLlNwcml0ZS5UeXBlLlNJTVBMRTtcbiAgICAgICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxvYWRpbmdJbWFnZU5vZGUucGFyZW50ID0gbWFza05vZGU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa3u+WKoOaXi+i9rOWKqOeUu++8iDE4MOW6pi/np5LvvIlcbiAgICAgICAgICAgIHNlbGYuX3F1aWNrRW50ZXJMb2FkaW5nTm9kZSA9IGxvYWRpbmdJbWFnZU5vZGU7XG4gICAgICAgICAgICBzZWxmLl9xdWlja0VudGVyQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt6HlhaXliqjnlLtcbiAgICAgICAgY2MudHdlZW4obWFza05vZGUpXG4gICAgICAgICAgICAudG8oMC4xNSwgeyBvcGFjaXR5OiAyMDAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICBcbiAgICAgICAgLy8g5L+d5a2Y5byV55So77yM6L+b5YWl5Zy65pmv5ZCO6ZSA5q+BXG4gICAgICAgIHRoaXMuX3F1aWNrRW50ZXJNYXNrID0gbWFza05vZGU7XG4gICAgfSxcbiAgICBcbiAgICBfc2hvd01lc3NhZ2U6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgLy8g5a6J5YWo5qOA5p+l77ya56Gu5L+d6IqC54K55a2Y5ZyoXG4gICAgICAgIGlmICghdGhpcy5ub2RlIHx8ICF0aGlzLm5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiX3Nob3dNZXNzYWdlOiDoioLngrnkuI3lrZjlnKjmiJblt7LplIDmr4FcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciB0aXBOb2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwicm9vbV90aXBcIik7XG4gICAgICAgIGlmICh0aXBOb2RlKSB0aXBOb2RlLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIHRpcE5vZGUgPSBuZXcgY2MuTm9kZShcInJvb21fdGlwXCIpO1xuICAgICAgICB0aXBOb2RlLmFuY2hvclggPSAwLjU7ICAvLyDmsLTlubPlsYXkuK1cbiAgICAgICAgdGlwTm9kZS5hbmNob3JZID0gMC41OyAgLy8g5Z6C55u05bGF5LitXG4gICAgICAgIHRpcE5vZGUueCA9IDA7ICAvLyDmsLTlubPlsYXkuK3vvIjnm7jlr7nkuo7niLboioLngrnkuK3lv4PvvIlcbiAgICAgICAgdGlwTm9kZS55ID0gMzExOyAgLy8g5pi+56S65Zyo6aG26YOo5Lit6Ze055qE5pa55qGG5Yy65Z+f5YaF77yI5LiO5raI5oGvL+W4ruWKqS/orr7nva7mjInpkq7lkIzkuIDpq5jluqbvvIlcblxuICAgICAgICB2YXIgbGFiZWwgPSB0aXBOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjI7XG4gICAgICAgIGxhYmVsLmxpbmVIZWlnaHQgPSAyODtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjsgIC8vIOaWh+Wtl+WxheS4rVxuICAgICAgICB0aXBOb2RlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDApOyAgLy8g6buE6Imy5paH5a2XXG5cbiAgICAgICAgdGlwTm9kZS5wYXJlbnQgPSB0aGlzLm5vZGU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aXBOb2RlICYmIHRpcE5vZGUuaXNWYWxpZCkgdGlwTm9kZS5kZXN0cm95KCk7XG4gICAgICAgIH0sIDIpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Zyo5bGP5bmV5Lit5aSu5pi+56S65Yqg6L295Zu+54mH77yI5L2/55So57uf5LiA55qEIGxvYWRpbmdfaW1hZ2UucG5n77yJXG4gICAgX3Nob3dNZXNzYWdlQ2VudGVyOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIC8vIOWuieWFqOajgOafpe+8muehruS/neiKgueCueWtmOWcqFxuICAgICAgICBpZiAoIXRoaXMubm9kZSB8fCAhdGhpcy5ub2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIl9zaG93TWVzc2FnZUNlbnRlcjog6IqC54K55LiN5a2Y5Zyo5oiW5bey6ZSA5q+BXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0aXBOb2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwiY2VudGVyX3RpcFwiKTtcbiAgICAgICAgaWYgKHRpcE5vZGUpIHRpcE5vZGUuZGVzdHJveSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuaPkOekuuWuueWZqFxuICAgICAgICB0aXBOb2RlID0gbmV3IGNjLk5vZGUoXCJjZW50ZXJfdGlwXCIpO1xuICAgICAgICB0aXBOb2RlLnpJbmRleCA9IDIwMDA7XG4gICAgICAgIHRpcE5vZGUucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5Y2K6YCP5piO6IOM5pmv6YGu572pXG4gICAgICAgIHZhciBtYXNrTm9kZSA9IG5ldyBjYy5Ob2RlKFwiTWFza1wiKTtcbiAgICAgICAgbWFza05vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSk7XG4gICAgICAgIHZhciBtYXNrR3JhcGhpY3MgPSBtYXNrTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBtYXNrR3JhcGhpY3MuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgMTAwKTsgIC8vIOWNiumAj+aYjum7keiJsuiDjOaZr1xuICAgICAgICBtYXNrR3JhcGhpY3MucmVjdCgtc2NyZWVuV2lkdGgvMiwgLXNjcmVlbkhlaWdodC8yLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KTtcbiAgICAgICAgbWFza0dyYXBoaWNzLmZpbGwoKTtcbiAgICAgICAgbWFza05vZGUucGFyZW50ID0gdGlwTm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWKoOi9vSBsb2FkaW5nX2ltYWdlLnBuZyDlm77niYdcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoJ1VJL2xvYWRpbmdfaW1hZ2UnLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKGVyciB8fCAhc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLliqDovb0gbG9hZGluZ19pbWFnZS5wbmcg5aSx6LSl77yM5L2/55So5paH5a2X5o+Q56S6XCIpO1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOaWh+Wtl+aPkOekulxuICAgICAgICAgICAgICAgIHZhciBsYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpO1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyNjtcbiAgICAgICAgICAgICAgICBsYWJlbC5saW5lSGVpZ2h0ID0gMzY7XG4gICAgICAgICAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgICAgICBsYWJlbE5vZGUucGFyZW50ID0gdGlwTm9kZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWIm+W7uuWKoOi9veWbvueJh+iKgueCuVxuICAgICAgICAgICAgdmFyIGxvYWRpbmdOb2RlID0gbmV3IGNjLk5vZGUoXCJMb2FkaW5nSW1hZ2VcIik7XG4gICAgICAgICAgICBsb2FkaW5nTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDEyMCwgMTIwKSk7ICAvLyDorr7nva7liqDovb3lm77niYflpKflsI9cbiAgICAgICAgICAgIGxvYWRpbmdOb2RlLmFuY2hvclggPSAwLjU7XG4gICAgICAgICAgICBsb2FkaW5nTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gbG9hZGluZ05vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIHNwcml0ZS50eXBlID0gY2MuU3ByaXRlLlR5cGUuU0lNUExFO1xuICAgICAgICAgICAgc3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbG9hZGluZ05vZGUucGFyZW50ID0gdGlwTm9kZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5qCH6K6w5q2j5Zyo5Yqo55S75LitXG4gICAgICAgICAgICBzZWxmLl9sb2FkaW5nSW1hZ2VBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fbG9hZGluZ0ltYWdlTm9kZSA9IGxvYWRpbmdOb2RlO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4jeiHquWKqOa2iOWkse+8jOmcgOimgeaJi+WKqOiwg+eUqCBfaGlkZU1lc3NhZ2VDZW50ZXIg6ZqQ6JePXG4gICAgICAgIC8vIOS/neWtmOW8leeUqOS7peS+v+WQjue7remUgOavgVxuICAgICAgICB0aGlzLl9jZW50ZXJUaXBOb2RlID0gdGlwTm9kZTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOmakOiXj+S4reWkruaPkOekulxuICAgIF9oaWRlTWVzc2FnZUNlbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2xvYWRpbmdJbWFnZUFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9sb2FkaW5nSW1hZ2VOb2RlID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLl9jZW50ZXJUaXBOb2RlICYmIHRoaXMuX2NlbnRlclRpcE5vZGUuaXNWYWxpZCkge1xuICAgICAgICAgICAgdGhpcy5fY2VudGVyVGlwTm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLl9jZW50ZXJUaXBOb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHRpcE5vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJjZW50ZXJfdGlwXCIpO1xuICAgICAgICBpZiAodGlwTm9kZSAmJiB0aXBOb2RlLmlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRpcE5vZGUuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBfcmVtb3ZlTm90aWNlQm9hcmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbm90aWNlTmFtZXMgPSBbXCJub3RpY2VcIiwgXCJnb25nZ2FvXCIsIFwi5YWs5ZGKXCIsIFwibm90aWNlX2JvYXJkXCIsIFwiZGluZ2J1dWliYW50b3VtaW5nZGlcIiwgXCJ4aW9uZ21hbzNcIiwgXCJ0aXRsZVwiLCBcIlRpdGxlXCIsIFwi5qCH562+XCJdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vdGljZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShub3RpY2VOYW1lc1tpXSk7XG4gICAgICAgICAgICBpZiAobm9kZSkgbm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9oaWRlTm9kZXNXaXRoVGV4dCh0aGlzLm5vZGUsIFwi5ri45oiP5YWs5ZGKXCIpO1xuICAgICAgICB0aGlzLl9oaWRlTm9kZXNXaXRoVGV4dCh0aGlzLm5vZGUsIFwi5aix5LmQ5LyR6ZeyXCIpO1xuICAgICAgICAvLyDpmpDol4/og4zmma/kuIrnmoTljLrln5/moIfnrb7mloflrZfvvIjkuI3pmpDol4/liqjmgIHliJvlu7rnmoQgQXJlYVRpdGxl77yJXG4gICAgICAgIHRoaXMuX2hpZGVCYWNrZ3JvdW5kTGFiZWxzKCk7XG4gICAgfSxcbiAgICBcbiAgICBfaGlkZUJhY2tncm91bmRMYWJlbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDpmpDol4/og4zmma/kuIrljp/mnInnmoTmoIfnrb7oioLngrlcbiAgICAgICAgdmFyIGxhYmVsc1RvSGlkZSA9IFtcIuernuaKgOWculwiLCBcIuaZrumAmuWculwiLCBcIuWInee6p+WculwiLCBcIuS4ree6p+WculwiLCBcIumrmOe6p+WculwiLCBcIumAieaLqeaIv+mXtFwiLCBcIuaIv+mXtOmAieaLqVwiXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYWJlbHNUb0hpZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IHRoaXMuX2ZpbmROb2Rlc0J5TmFtZSh0aGlzLm5vZGUsIGxhYmVsc1RvSGlkZVtpXSk7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5vZGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgLy8g5Y+q6ZqQ6JeP6Z2eIEFyZWFUaXRsZSDnmoToioLngrlcbiAgICAgICAgICAgICAgICBpZiAobm9kZXNbal0ubmFtZSAhPT0gXCJBcmVhVGl0bGVcIikge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tqXS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIF9maW5kTm9kZXNCeU5hbWU6IGZ1bmN0aW9uKHBhcmVudE5vZGUsIG5hbWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBpZiAoIXBhcmVudE5vZGUgfHwgIXBhcmVudE5vZGUuY2hpbGRyZW4pIHJldHVybiByZXN1bHQ7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHBhcmVudE5vZGUuY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoY2hpbGQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOmAkuW9kuafpeaJvuWtkOiKgueCuVxuICAgICAgICAgICAgdmFyIHN1YlJlc3VsdHMgPSB0aGlzLl9maW5kTm9kZXNCeU5hbWUoY2hpbGQsIG5hbWUpO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChzdWJSZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgXG4gICAgX2FkanVzdEdvbGRFbGVtZW50c1Bvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBsYXllck5vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJwbGF5ZXJfbm9kZVwiKTtcbiAgICAgICAgaWYgKCFwbGF5ZXJOb2RlKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB2YXIgeXVhbmJhb0ljb24gPSBwbGF5ZXJOb2RlLmdldENoaWxkQnlOYW1lKFwieXVhbmJhb0ljb25cIik7XG4gICAgICAgIHZhciBnb2xkRnJhbWUgPSBwbGF5ZXJOb2RlLmdldENoaWxkQnlOYW1lKFwiZ29sZF9mcmFtZVwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiwg+aVtOmHkeixhuWbvuagh+S9jee9rlxuICAgICAgICBpZiAoeXVhbmJhb0ljb24pIHtcbiAgICAgICAgICAgIHl1YW5iYW9JY29uLnkgPSA4MDtcbiAgICAgICAgICAgIHl1YW5iYW9JY29uLnggPSAtNTA7ICAvLyDlkJHlt6blgY/np7tcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ29sZEZyYW1lKSB7XG4gICAgICAgICAgICBnb2xkRnJhbWUueSA9IDgwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDosIPmlbTph5HluIHmloflrZfkvY3nva4gLSDmlL7lnKjph5HosYblm77moIflkI7pnaJcbiAgICAgICAgaWYgKHRoaXMuZ29iYWxfY291bnQgJiYgdGhpcy5nb2JhbF9jb3VudC5ub2RlKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWxOb2RlID0gdGhpcy5nb2JhbF9jb3VudC5ub2RlO1xuICAgICAgICAgICAgdmFyIHdpZGdldCA9IGxhYmVsTm9kZS5nZXRDb21wb25lbnQoY2MuV2lkZ2V0KTtcbiAgICAgICAgICAgIGlmICh3aWRnZXQpIHdpZGdldC5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOaWh+Wtl+aUvuWcqOmHkeixhuWbvuagh+WPs+S+p1xuICAgICAgICAgICAgbGFiZWxOb2RlLmFuY2hvclggPSAwOyAgLy8g5bem6ZSa54K577yM5LuO5bem5L6n5byA5aeLXG4gICAgICAgICAgICBsYWJlbE5vZGUueCA9IDIwOyAgICAgICAvLyDph5HosYblm77moIflkI7pnaIyMHB4XG4gICAgICAgICAgICBsYWJlbE5vZGUueSA9IDgwOyAgICAgICAvLyDkuI7ph5HosYblm77moIflkIzkuIDpq5jluqZcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgX2hpZGVOb2Rlc1dpdGhUZXh0OiBmdW5jdGlvbihwYXJlbnROb2RlLCBzZWFyY2hUZXh0KSB7XG4gICAgICAgIGlmICghcGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBwYXJlbnROb2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAoIWNoaWxkcmVuKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IGNoaWxkLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICBpZiAobGFiZWwgJiYgbGFiZWwuc3RyaW5nICYmIGxhYmVsLnN0cmluZy5pbmRleE9mKHNlYXJjaFRleHQpID49IDApIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2hpZGVOb2Rlc1dpdGhUZXh0KGNoaWxkLCBzZWFyY2hUZXh0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Yib5bu65Yqg5YWl5oi/6Ze05oyJ6ZKu77yI5L2/55SoIGJ0bl9lbnRlcl9yb29tLnBuZ++8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9jcmVhdGVFbnRlclJvb21CdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen55qE5oyJ6ZKuXG4gICAgICAgIHZhciBvbGRCdG4gPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJFbnRlclJvb21CdXR0b25cIik7XG4gICAgICAgIGlmIChvbGRCdG4pIG9sZEJ0bi5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65oyJ6ZKu6IqC54K5XG4gICAgICAgIHZhciBidG5Ob2RlID0gbmV3IGNjLk5vZGUoXCJFbnRlclJvb21CdXR0b25cIik7XG4gICAgICAgIGJ0bk5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxODAsIDYwKSk7XG4gICAgICAgIGJ0bk5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgYnRuTm9kZS5hbmNob3JZID0gMC41O1xuICAgICAgICBcbiAgICAgICAgLy8g5pS+5Zyo5bem5L6n5Lit6Ze05L2N572uXG4gICAgICAgIGJ0bk5vZGUueCA9IC1zY3JlZW5XaWR0aCAvIDIgKyAxMjA7XG4gICAgICAgIGJ0bk5vZGUueSA9IDA7XG4gICAgICAgIGJ0bk5vZGUuekluZGV4ID0gMTAwMDtcbiAgICAgICAgYnRuTm9kZS5wYXJlbnQgPSB0aGlzLm5vZGU7XG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3mjInpkq7lm77niYdcbiAgICAgICAgdmFyIHNwcml0ZSA9IGJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIFxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZCgnVUkvYnRuX2VudGVyX3Jvb20nLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIuWKoOi9vSBidG5fZW50ZXJfcm9vbSDlpLHotKXvvIzkvb/nlKjlpIfnlKjmoLflvI9cIik7XG4gICAgICAgICAgICAgICAgc2VsZi5fY3JlYXRlRW50ZXJSb29tQnV0dG9uRmFsbGJhY2soYnRuTm9kZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8g5re75Yqg5oyJ6ZKu57uE5Lu2XG4gICAgICAgIHZhciBidXR0b24gPSBidG5Ob2RlLmFkZENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBidXR0b24udHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICBidXR0b24uZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGJ1dHRvbi56b29tU2NhbGUgPSAxLjE7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDngrnlh7vkuovku7ZcbiAgICAgICAgYnRuTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGYuX3Nob3dFbnRlclJvb21Qb3B1cCgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICAvLyDlpIfnlKjmjInpkq7moLflvI9cbiAgICBfY3JlYXRlRW50ZXJSb29tQnV0dG9uRmFsbGJhY2s6IGZ1bmN0aW9uKGJ0bk5vZGUpIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IGJ0bk5vZGUuZ2V0Q29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGlmICghc3ByaXRlKSB7XG4gICAgICAgICAgICBzcHJpdGUgPSBidG5Ob2RlLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLbmjInpkq7og4zmma8gLSDmqZnoibLmuJDlj5jpo47moLxcbiAgICAgICAgdmFyIGdyYXBoaWNzID0gYnRuTm9kZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBncmFwaGljcy5maWxsQ29sb3IgPSBjYy5jb2xvcigyNTUsIDE0MCwgMCk7ICAvLyDmqZnoibJcbiAgICAgICAgZ3JhcGhpY3Mucm91bmRSZWN0KC05MCwgLTMwLCAxODAsIDYwLCAxMik7XG4gICAgICAgIGdyYXBoaWNzLmZpbGwoKTtcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBjYy5jb2xvcigyNTUsIDIwMCwgMTAwKTsgIC8vIOmHkeiJsui+ueahhlxuICAgICAgICBncmFwaGljcy5saW5lV2lkdGggPSAzO1xuICAgICAgICBncmFwaGljcy5yb3VuZFJlY3QoLTkwLCAtMzAsIDE4MCwgNjAsIDEyKTtcbiAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDlm77moIflkozmloflrZdcbiAgICAgICAgdmFyIGljb25Ob2RlID0gbmV3IGNjLk5vZGUoXCJJY29uXCIpO1xuICAgICAgICB2YXIgaWNvbkxhYmVsID0gaWNvbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgaWNvbkxhYmVsLnN0cmluZyA9IFwi8J+aqlwiO1xuICAgICAgICBpY29uTGFiZWwuZm9udFNpemUgPSAyMjtcbiAgICAgICAgaWNvbk5vZGUueCA9IC00NTtcbiAgICAgICAgaWNvbk5vZGUucGFyZW50ID0gYnRuTm9kZTtcbiAgICAgICAgXG4gICAgICAgIHZhciBsYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpO1xuICAgICAgICB2YXIgbGFiZWwgPSBsYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgbGFiZWwuc3RyaW5nID0gXCLovpPlhaXmiL/lj7dcIjtcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyMjtcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDMwO1xuICAgICAgICBsYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBsYWJlbE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgbGFiZWxOb2RlLnBhcmVudCA9IGJ0bk5vZGU7XG4gICAgfSxcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmmL7npLrliqDlhaXmiL/pl7TlvLnnqpcgLSDph43mlrDorr7orqHvvIzmm7TmuIXmmbDnvo7op4JcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBfc2hvd0VudGVyUm9vbVBvcHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIOenu+mZpOaXp+eahOW8ueeql1xuICAgICAgICB2YXIgb2xkUG9wdXAgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJFbnRlclJvb21Qb3B1cFwiKTtcbiAgICAgICAgaWYgKG9sZFBvcHVwKSBvbGRQb3B1cC5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65by556qX5a655ZmoXG4gICAgICAgIHZhciBwb3B1cCA9IG5ldyBjYy5Ob2RlKFwiRW50ZXJSb29tUG9wdXBcIik7XG4gICAgICAgIHBvcHVwLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBwb3B1cC5hbmNob3JYID0gMC41O1xuICAgICAgICBwb3B1cC5hbmNob3JZID0gMC41O1xuICAgICAgICBwb3B1cC54ID0gMDtcbiAgICAgICAgcG9wdXAueSA9IDA7XG4gICAgICAgIHBvcHVwLnpJbmRleCA9IDIwMDA7XG4gICAgICAgIHBvcHVwLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoCBCbG9ja0lucHV0RXZlbnRzIOe7hOS7tumYu+atouW6leWxgueCueWHu1xuICAgICAgICBwb3B1cC5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cyk7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDljYrpgI/mmI7og4zmma/pga7nvakgPT09PT1cbiAgICAgICAgdmFyIGJnTWFzayA9IG5ldyBjYy5Ob2RlKFwiQmdNYXNrXCIpO1xuICAgICAgICBiZ01hc2suc2V0Q29udGVudFNpemUoY2Muc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KSk7XG4gICAgICAgIHZhciBiZ0dmeCA9IGJnTWFzay5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBiZ0dmeC5maWxsQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxODApO1xuICAgICAgICBiZ0dmeC5yZWN0KC1zY3JlZW5XaWR0aC8yLCAtc2NyZWVuSGVpZ2h0LzIsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpO1xuICAgICAgICBiZ0dmeC5maWxsKCk7XG4gICAgICAgIGJnTWFzay5wYXJlbnQgPSBwb3B1cDtcbiAgICAgICAgXG4gICAgICAgIC8vIOeCueWHu+mBrue9qeWFs+mXrVxuICAgICAgICBiZ01hc2sub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDlvLnnqpfpnaLmnb8gLSDmm7TlpKfnmoTlsLrlr7ggPT09PT1cbiAgICAgICAgdmFyIHBhbmVsV2lkdGggPSA1MDA7XG4gICAgICAgIHZhciBwYW5lbEhlaWdodCA9IDM4MDtcbiAgICAgICAgdmFyIHBhbmVsID0gbmV3IGNjLk5vZGUoXCJQYW5lbFwiKTtcbiAgICAgICAgcGFuZWwuc2V0Q29udGVudFNpemUoY2Muc2l6ZShwYW5lbFdpZHRoLCBwYW5lbEhlaWdodCkpO1xuICAgICAgICBwYW5lbC5wYXJlbnQgPSBwb3B1cDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWkluWxgumYtOW9sVxuICAgICAgICB2YXIgc2hhZG93ID0gbmV3IGNjLk5vZGUoXCJTaGFkb3dcIik7XG4gICAgICAgIHZhciBzaGFkb3dHZnggPSBzaGFkb3cuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgc2hhZG93R2Z4LmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDYwKTtcbiAgICAgICAgc2hhZG93R2Z4LnJvdW5kUmVjdCgtcGFuZWxXaWR0aC8yICsgOCwgLXBhbmVsSGVpZ2h0LzIgLSA4LCBwYW5lbFdpZHRoLCBwYW5lbEhlaWdodCwgMTYpO1xuICAgICAgICBzaGFkb3dHZnguZmlsbCgpO1xuICAgICAgICBzaGFkb3cucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICAvLyDkuLvog4zmma8gLSDmt7HoibLkvJjpm4Xpo47moLxcbiAgICAgICAgdmFyIG1haW5CZyA9IG5ldyBjYy5Ob2RlKFwiTWFpbkJnXCIpO1xuICAgICAgICBtYWluQmcuc2V0Q29udGVudFNpemUoY2Muc2l6ZShwYW5lbFdpZHRoLCBwYW5lbEhlaWdodCkpO1xuICAgICAgICB2YXIgbWFpbkdmeCA9IG1haW5CZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBtYWluR2Z4LmZpbGxDb2xvciA9IGNjLmNvbG9yKDMwLCAyOCwgNDUsIDI1NSk7XG4gICAgICAgIG1haW5HZngucm91bmRSZWN0KC1wYW5lbFdpZHRoLzIsIC1wYW5lbEhlaWdodC8yLCBwYW5lbFdpZHRoLCBwYW5lbEhlaWdodCwgMTYpO1xuICAgICAgICBtYWluR2Z4LmZpbGwoKTtcbiAgICAgICAgbWFpbkdmeC5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDEwMCwgODUsIDYwKTtcbiAgICAgICAgbWFpbkdmeC5saW5lV2lkdGggPSAzO1xuICAgICAgICBtYWluR2Z4LnJvdW5kUmVjdCgtcGFuZWxXaWR0aC8yLCAtcGFuZWxIZWlnaHQvMiwgcGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQsIDE2KTtcbiAgICAgICAgbWFpbkdmeC5zdHJva2UoKTtcbiAgICAgICAgbWFpbkJnLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g6aG26YOo6KOF6aWw5p2hID09PT09XG4gICAgICAgIHZhciB0b3BCYXIgPSBuZXcgY2MuTm9kZShcIlRvcEJhclwiKTtcbiAgICAgICAgdG9wQmFyLnNldENvbnRlbnRTaXplKGNjLnNpemUocGFuZWxXaWR0aCwgOCkpO1xuICAgICAgICB0b3BCYXIueSA9IHBhbmVsSGVpZ2h0LzIgLSA0O1xuICAgICAgICB2YXIgdG9wR2Z4ID0gdG9wQmFyLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIHRvcEdmeC5maWxsQ29sb3IgPSBjYy5jb2xvcig3NiwgMTc1LCA4MCk7ICAvLyDnu7/oibLkuLvpopjoibJcbiAgICAgICAgdG9wR2Z4LnJvdW5kUmVjdCgtcGFuZWxXaWR0aC8yLCAtNCwgcGFuZWxXaWR0aCwgOCwgWzE2LCAxNiwgMCwgMF0pO1xuICAgICAgICB0b3BHZnguZmlsbCgpO1xuICAgICAgICB0b3BCYXIucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmoIfpopjljLrln58gPT09PT1cbiAgICAgICAgdmFyIHRpdGxlQmcgPSBuZXcgY2MuTm9kZShcIlRpdGxlQmdcIik7XG4gICAgICAgIHRpdGxlQmcuc2V0Q29udGVudFNpemUoY2Muc2l6ZShwYW5lbFdpZHRoIC0gNDAsIDYwKSk7XG4gICAgICAgIHRpdGxlQmcueSA9IHBhbmVsSGVpZ2h0LzIgLSA1MDtcbiAgICAgICAgdmFyIHRpdGxlQmdHZnggPSB0aXRsZUJnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIHRpdGxlQmdHZnguZmlsbENvbG9yID0gY2MuY29sb3IoNDUsIDQyLCA2NSwgMjUwKTtcbiAgICAgICAgdGl0bGVCZ0dmeC5yb3VuZFJlY3QoLShwYW5lbFdpZHRoIC0gNDApLzIsIC0zMCwgcGFuZWxXaWR0aCAtIDQwLCA2MCwgMTApO1xuICAgICAgICB0aXRsZUJnR2Z4LmZpbGwoKTtcbiAgICAgICAgdGl0bGVCZy5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWbvuagh1xuICAgICAgICB2YXIgaWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIkljb25cIik7XG4gICAgICAgIHZhciBpY29uTGFiZWwgPSBpY29uTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBpY29uTGFiZWwuc3RyaW5nID0gXCLwn5SRXCI7XG4gICAgICAgIGljb25MYWJlbC5mb250U2l6ZSA9IDMyO1xuICAgICAgICBpY29uTm9kZS54ID0gLTEwMDtcbiAgICAgICAgaWNvbk5vZGUueSA9IHBhbmVsSGVpZ2h0LzIgLSA1MDtcbiAgICAgICAgaWNvbk5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpopjmloflrZdcbiAgICAgICAgdmFyIHRpdGxlTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIik7XG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gXCLliqDlhaXmiL/pl7RcIjtcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDI4O1xuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA0MDtcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgdGl0bGVOb2RlLnkgPSBwYW5lbEhlaWdodC8yIC0gNTA7XG4gICAgICAgIHRpdGxlTm9kZS5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWJr+agh+mimOivtOaYjlxuICAgICAgICB2YXIgc3VidGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJTdWJ0aXRsZVwiKTtcbiAgICAgICAgdmFyIHN1YnRpdGxlTGFiZWwgPSBzdWJ0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgc3VidGl0bGVMYWJlbC5zdHJpbmcgPSBcIui+k+WFpeWlveWPi+WIhuS6q+eahOaIv+mXtOWPt+WNs+WPr+WKoOWFpea4uOaIj1wiO1xuICAgICAgICBzdWJ0aXRsZUxhYmVsLmZvbnRTaXplID0gMTQ7XG4gICAgICAgIHN1YnRpdGxlTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgc3VidGl0bGVOb2RlLmNvbG9yID0gY2MuY29sb3IoMTgwLCAxNzAsIDE1MCk7XG4gICAgICAgIHN1YnRpdGxlTm9kZS55ID0gcGFuZWxIZWlnaHQvMiAtIDk1O1xuICAgICAgICBzdWJ0aXRsZU5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmiL/pl7Tlj7fovpPlhaXljLrln58gPT09PT1cbiAgICAgICAgdmFyIGlucHV0QXJlYVkgPSAyMDtcbiAgICAgICAgXG4gICAgICAgIC8vIOi+k+WFpeahhuagh+etvlxuICAgICAgICB2YXIgaW5wdXRMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiSW5wdXRMYWJlbFwiKTtcbiAgICAgICAgdmFyIGlucHV0TGFiZWxDb21wID0gaW5wdXRMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBpbnB1dExhYmVsQ29tcC5zdHJpbmcgPSBcIuaIv+mXtOWPt1wiO1xuICAgICAgICBpbnB1dExhYmVsQ29tcC5mb250U2l6ZSA9IDE2O1xuICAgICAgICBpbnB1dExhYmVsLmNvbG9yID0gY2MuY29sb3IoMjAwLCAxOTAsIDE2MCk7XG4gICAgICAgIGlucHV0TGFiZWwueCA9IC1wYW5lbFdpZHRoLzIgKyA3MDtcbiAgICAgICAgaW5wdXRMYWJlbC55ID0gaW5wdXRBcmVhWSArIDQ1O1xuICAgICAgICBpbnB1dExhYmVsLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBcbiAgICAgICAgLy8g6L6T5YWl5qGG6IOM5pmvXG4gICAgICAgIHZhciBpbnB1dEJnID0gbmV3IGNjLk5vZGUoXCJJbnB1dEJnXCIpO1xuICAgICAgICBpbnB1dEJnLnNldENvbnRlbnRTaXplKGNjLnNpemUoMzYwLCA1NSkpO1xuICAgICAgICBpbnB1dEJnLnkgPSBpbnB1dEFyZWFZO1xuICAgICAgICB2YXIgaW5wdXRHZnggPSBpbnB1dEJnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGlucHV0R2Z4LmZpbGxDb2xvciA9IGNjLmNvbG9yKDUwLCA0NSwgNzAsIDI1NSk7XG4gICAgICAgIGlucHV0R2Z4LnJvdW5kUmVjdCgtMTgwLCAtMjcuNSwgMzYwLCA1NSwgMTApO1xuICAgICAgICBpbnB1dEdmeC5maWxsKCk7XG4gICAgICAgIGlucHV0R2Z4LnN0cm9rZUNvbG9yID0gY2MuY29sb3IoNzYsIDE3NSwgODApO1xuICAgICAgICBpbnB1dEdmeC5saW5lV2lkdGggPSAyO1xuICAgICAgICBpbnB1dEdmeC5yb3VuZFJlY3QoLTE4MCwgLTI3LjUsIDM2MCwgNTUsIDEwKTtcbiAgICAgICAgaW5wdXRHZnguc3Ryb2tlKCk7XG4gICAgICAgIGlucHV0QmcucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICAvLyDovpPlhaXmoYZcbiAgICAgICAgdmFyIGlucHV0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiUm9vbUlkSW5wdXRcIik7XG4gICAgICAgIGlucHV0Tm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDM0MCwgNTApKTtcbiAgICAgICAgdmFyIGVkaXRCb3ggPSBpbnB1dE5vZGUuYWRkQ29tcG9uZW50KGNjLkVkaXRCb3gpO1xuICAgICAgICBlZGl0Qm94LnBsYWNlaG9sZGVyID0gXCLor7fovpPlhaU25L2N5pWw5a2X5oi/6Ze05Y+3XCI7XG4gICAgICAgIGVkaXRCb3guZm9udFNpemUgPSAyNDtcbiAgICAgICAgZWRpdEJveC5wbGFjZWhvbGRlckZvbnRTaXplID0gMTg7XG4gICAgICAgIGVkaXRCb3guZm9udENvbG9yID0gY2MuY29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIGVkaXRCb3gucGxhY2Vob2xkZXJGb250Q29sb3IgPSBjYy5jb2xvcigxMjAsIDExNSwgMTAwKTtcbiAgICAgICAgZWRpdEJveC5pbnB1dEZsYWcgPSBjYy5FZGl0Qm94LklucHV0RmxhZy5TRU5TSVRJVkU7XG4gICAgICAgIGVkaXRCb3guaW5wdXRNb2RlID0gY2MuRWRpdEJveC5JbnB1dE1vZGUuTlVNRVJJQztcbiAgICAgICAgZWRpdEJveC5tYXhMZW5ndGggPSAxMDtcbiAgICAgICAgZWRpdEJveC5iYWNrZ3JvdW5kQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAwKTtcbiAgICAgICAgaW5wdXROb2RlLnBhcmVudCA9IGlucHV0Qmc7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDmj5DnpLrkv6Hmga8gPT09PT1cbiAgICAgICAgdmFyIHRpcEJnID0gbmV3IGNjLk5vZGUoXCJUaXBCZ1wiKTtcbiAgICAgICAgdGlwQmcuc2V0Q29udGVudFNpemUoY2Muc2l6ZSgzNjAsIDM1KSk7XG4gICAgICAgIHRpcEJnLnkgPSBpbnB1dEFyZWFZIC0gNTU7XG4gICAgICAgIHZhciB0aXBHZnggPSB0aXBCZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICB0aXBHZnguZmlsbENvbG9yID0gY2MuY29sb3IoNDAsIDM1LCA1NSwgMjAwKTtcbiAgICAgICAgdGlwR2Z4LnJvdW5kUmVjdCgtMTgwLCAtMTcuNSwgMzYwLCAzNSwgOCk7XG4gICAgICAgIHRpcEdmeC5maWxsKCk7XG4gICAgICAgIHRpcEJnLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpcEljb24gPSBuZXcgY2MuTm9kZShcIlRpcEljb25cIik7XG4gICAgICAgIHZhciB0aXBJY29uTGFiZWwgPSB0aXBJY29uLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpcEljb25MYWJlbC5zdHJpbmcgPSBcIvCfkqFcIjtcbiAgICAgICAgdGlwSWNvbkxhYmVsLmZvbnRTaXplID0gMTY7XG4gICAgICAgIHRpcEljb24ueCA9IC0xNTA7XG4gICAgICAgIHRpcEljb24ueSA9IGlucHV0QXJlYVkgLSA1NTtcbiAgICAgICAgdGlwSWNvbi5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aXBOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXBcIik7XG4gICAgICAgIHZhciB0aXBMYWJlbCA9IHRpcE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgdGlwTGFiZWwuc3RyaW5nID0gXCLmiL/pl7Tlj7fnlLHlpb3lj4vliJvlu7rmiL/pl7TlkI7ojrflj5bvvIzkuLo25L2N5pWw5a2XXCI7XG4gICAgICAgIHRpcExhYmVsLmZvbnRTaXplID0gMTM7XG4gICAgICAgIHRpcExhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigxNTAsIDE0NSwgMTMwKTtcbiAgICAgICAgdGlwTm9kZS55ID0gaW5wdXRBcmVhWSAtIDU1O1xuICAgICAgICB0aXBOb2RlLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT0g5oyJ6ZKu5Yy65Z+fID09PT09XG4gICAgICAgIHZhciBidG5ZID0gLXBhbmVsSGVpZ2h0LzIgKyA1NTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPlua2iOaMiemSrlxuICAgICAgICB2YXIgY2FuY2VsQnRuID0gbmV3IGNjLk5vZGUoXCJDYW5jZWxCdG5cIik7XG4gICAgICAgIGNhbmNlbEJ0bi5zZXRDb250ZW50U2l6ZShjYy5zaXplKDE0MCwgNDgpKTtcbiAgICAgICAgY2FuY2VsQnRuLnggPSAtOTA7XG4gICAgICAgIGNhbmNlbEJ0bi55ID0gYnRuWTtcbiAgICAgICAgdmFyIGNhbmNlbEdmeCA9IGNhbmNlbEJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBjYW5jZWxHZnguZmlsbENvbG9yID0gY2MuY29sb3IoNzAsIDY1LCA4NSk7XG4gICAgICAgIGNhbmNlbEdmeC5yb3VuZFJlY3QoLTcwLCAtMjQsIDE0MCwgNDgsIDEwKTtcbiAgICAgICAgY2FuY2VsR2Z4LmZpbGwoKTtcbiAgICAgICAgY2FuY2VsR2Z4LnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTAwLCA5NSwgMTE1KTtcbiAgICAgICAgY2FuY2VsR2Z4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIGNhbmNlbEdmeC5yb3VuZFJlY3QoLTcwLCAtMjQsIDE0MCwgNDgsIDEwKTtcbiAgICAgICAgY2FuY2VsR2Z4LnN0cm9rZSgpO1xuICAgICAgICBjYW5jZWxCdG4ucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2FuY2VsTGFiZWwgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpO1xuICAgICAgICB2YXIgY2FuY2VsTGFiZWxDb21wID0gY2FuY2VsTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgY2FuY2VsTGFiZWxDb21wLnN0cmluZyA9IFwi5Y+W5raIXCI7XG4gICAgICAgIGNhbmNlbExhYmVsQ29tcC5mb250U2l6ZSA9IDIwO1xuICAgICAgICBjYW5jZWxMYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgY2FuY2VsTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyMDAsIDE5NSwgMTgwKTtcbiAgICAgICAgY2FuY2VsTGFiZWwucGFyZW50ID0gY2FuY2VsQnRuO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNhbmNlbEJ0bkNvbXAgPSBjYW5jZWxCdG4uYWRkQ29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgIGNhbmNlbEJ0bkNvbXAudHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICBjYW5jZWxCdG5Db21wLnpvb21TY2FsZSA9IDAuOTU7XG4gICAgICAgIFxuICAgICAgICBjYW5jZWxCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyDnoa7orqTliqDlhaXmjInpkq4gLSDnu7/oibLkuLvpophcbiAgICAgICAgdmFyIGNvbmZpcm1CdG4gPSBuZXcgY2MuTm9kZShcIkNvbmZpcm1CdG5cIik7XG4gICAgICAgIGNvbmZpcm1CdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSgxNjAsIDQ4KSk7XG4gICAgICAgIGNvbmZpcm1CdG4ueCA9IDEwMDtcbiAgICAgICAgY29uZmlybUJ0bi55ID0gYnRuWTtcbiAgICAgICAgdmFyIGNvbmZpcm1HZnggPSBjb25maXJtQnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGNvbmZpcm1HZnguZmlsbENvbG9yID0gY2MuY29sb3IoNzYsIDE3NSwgODApOyAgLy8g57u/6ImyXG4gICAgICAgIGNvbmZpcm1HZngucm91bmRSZWN0KC04MCwgLTI0LCAxNjAsIDQ4LCAxMCk7XG4gICAgICAgIGNvbmZpcm1HZnguZmlsbCgpO1xuICAgICAgICBjb25maXJtR2Z4LnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTAwLCAyMDAsIDEwNSk7XG4gICAgICAgIGNvbmZpcm1HZngubGluZVdpZHRoID0gMjtcbiAgICAgICAgY29uZmlybUdmeC5yb3VuZFJlY3QoLTgwLCAtMjQsIDE2MCwgNDgsIDEwKTtcbiAgICAgICAgY29uZmlybUdmeC5zdHJva2UoKTtcbiAgICAgICAgY29uZmlybUJ0bi5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgXG4gICAgICAgIHZhciBjb25maXJtSWNvbiA9IG5ldyBjYy5Ob2RlKFwiSWNvblwiKTtcbiAgICAgICAgdmFyIGNvbmZpcm1JY29uTGFiZWwgPSBjb25maXJtSWNvbi5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjb25maXJtSWNvbkxhYmVsLnN0cmluZyA9IFwi4pyTXCI7XG4gICAgICAgIGNvbmZpcm1JY29uTGFiZWwuZm9udFNpemUgPSAyMDtcbiAgICAgICAgY29uZmlybUljb24ueCA9IC01MDtcbiAgICAgICAgY29uZmlybUljb24uY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgY29uZmlybUljb24ucGFyZW50ID0gY29uZmlybUJ0bjtcbiAgICAgICAgXG4gICAgICAgIHZhciBjb25maXJtTGFiZWwgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpO1xuICAgICAgICB2YXIgY29uZmlybUxhYmVsQ29tcCA9IGNvbmZpcm1MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjb25maXJtTGFiZWxDb21wLnN0cmluZyA9IFwi5Yqg5YWl5oi/6Ze0XCI7XG4gICAgICAgIGNvbmZpcm1MYWJlbENvbXAuZm9udFNpemUgPSAyMDtcbiAgICAgICAgY29uZmlybUxhYmVsQ29tcC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjb25maXJtTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgY29uZmlybUxhYmVsLnBhcmVudCA9IGNvbmZpcm1CdG47XG4gICAgICAgIFxuICAgICAgICB2YXIgY29uZmlybUJ0bkNvbXAgPSBjb25maXJtQnRuLmFkZENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBjb25maXJtQnRuQ29tcC50cmFuc2l0aW9uID0gY2MuQnV0dG9uLlRyYW5zaXRpb24uU0NBTEU7XG4gICAgICAgIGNvbmZpcm1CdG5Db21wLnpvb21TY2FsZSA9IDAuOTU7XG4gICAgICAgIFxuICAgICAgICAvLyDnoa7orqTmjInpkq7ngrnlh7vkuovku7ZcbiAgICAgICAgY29uZmlybUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJvb21JZCA9IGVkaXRCb3guc3RyaW5nO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXJvb21JZCB8fCByb29tSWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UoXCLor7fovpPlhaXmiL/pl7Tlj7dcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlj5HpgIHliqDlhaXmiL/pl7Tor7fmsYJcbiAgICAgICAgICAgIHNlbGYuX2pvaW5Sb29tQnlJZChyb29tSWQsIHBvcHVwKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PSDlhbPpl63mjInpkq7vvIjlj7PkuIrop5LvvIkgPT09PT1cbiAgICAgICAgdmFyIGNsb3NlQnRuID0gbmV3IGNjLk5vZGUoXCJDbG9zZUJ0blwiKTtcbiAgICAgICAgY2xvc2VCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSg0MCwgNDApKTtcbiAgICAgICAgY2xvc2VCdG4ueCA9IHBhbmVsV2lkdGgvMiAtIDI1O1xuICAgICAgICBjbG9zZUJ0bi55ID0gcGFuZWxIZWlnaHQvMiAtIDI1O1xuICAgICAgICB2YXIgY2xvc2VHZnggPSBjbG9zZUJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBjbG9zZUdmeC5maWxsQ29sb3IgPSBjYy5jb2xvcig2MCwgNTUsIDc1KTtcbiAgICAgICAgY2xvc2VHZnguY2lyY2xlKDAsIDAsIDIwKTtcbiAgICAgICAgY2xvc2VHZnguZmlsbCgpO1xuICAgICAgICBjbG9zZUJ0bi5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgXG4gICAgICAgIHZhciBjbG9zZVggPSBuZXcgY2MuTm9kZShcIlhcIik7XG4gICAgICAgIHZhciBjbG9zZUxhYmVsID0gY2xvc2VYLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGNsb3NlTGFiZWwuc3RyaW5nID0gXCLDl1wiO1xuICAgICAgICBjbG9zZUxhYmVsLmZvbnRTaXplID0gMjg7XG4gICAgICAgIGNsb3NlTGFiZWwubGluZUhlaWdodCA9IDM2O1xuICAgICAgICBjbG9zZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGNsb3NlWC5jb2xvciA9IGNjLmNvbG9yKDE4MCwgMTcwLCAxNjApO1xuICAgICAgICBjbG9zZVgucGFyZW50ID0gY2xvc2VCdG47XG4gICAgICAgIFxuICAgICAgICBjbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcG9wdXAuZGVzdHJveSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDpgJrov4fmiL/pl7Tlj7fliqDlhaXmiL/pl7RcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBfam9pblJvb21CeUlkOiBmdW5jdGlvbihyb29tSWQsIHBvcHVwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFteWdsb2JhbCB8fCAhbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIue9kee7nOacqui/nuaOpe+8jOivt+eojeWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLmraPlnKjliqDlhaXmiL/pl7QuLi5cIik7XG4gICAgICAgIFxuICAgICAgICAvLyDlj5HpgIHliqDlhaXmiL/pl7Tor7fmsYJcbiAgICAgICAgbXlnbG9iYWwuc29ja2V0LnJlcXVlc3Rfam9pblJvb20oe1xuICAgICAgICAgICAgcm9vbUlkOiByb29tSWRcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChlcnIgIT09IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIuWKoOWFpeaIv+mXtOWksei0pTogXCIgKyAocmVzdWx0IHx8IFwi5oi/6Ze05LiN5a2Y5ZyoXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi5Yqg5YWl5oiQ5Yqf77yBXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlhbPpl63lvLnnqpdcbiAgICAgICAgICAgIGlmIChwb3B1cCkgcG9wdXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDot7PovazliLDmuLjmiI/lnLrmma9cbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnJvb21JZCkge1xuICAgICAgICAgICAgICAgIG15Z2xvYmFsLmN1cnJlbnRSb29tSWQgPSByZXN1bHQucm9vbUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlu7bov5/ot7PovaxcbiAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImdhbWVTY2VuZVwiKTtcbiAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g44CQ56ue5oqA5Zy65Yqf6IO944CR5pu05paw6LSn5biB5pi+56S677yI5qyi5LmQ6LGGL+ernuaKgOW4ge+8iVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF91cGRhdGVDdXJyZW5jeURpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIHZhciBwbGF5ZXJEYXRhID0gbXlnbG9iYWwgPyBteWdsb2JhbC5wbGF5ZXJEYXRhIDogbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGlmICghcGxheWVyRGF0YSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgdmFyIHJvb21DYXRlZ29yeSA9IHRoaXMuX2N1cnJlbnRSb29tQ2F0ZWdvcnkgfHwgMTtcbiAgICAgICAgXG4gICAgICAgIGlmIChyb29tQ2F0ZWdvcnkgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIOernuaKgOWcuiAtIOaYvuekuuernuaKgOW4gVxuICAgICAgICAgICAgaWYgKHRoaXMuZ29iYWxfY291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvYmFsX2NvdW50LnN0cmluZyA9IFwiOlwiICsgdGhpcy5fZm9ybWF0R29sZChwbGF5ZXJEYXRhLmFyZW5hX2NvaW4gfHwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDpmpDol4/mrKLkuZDosYblm77moIfvvIzmmL7npLrnq57mioDluIHlm77moIfvvIjlpoLmnpzmnInvvIlcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUN1cnJlbmN5SWNvbigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOaZrumAmuWcuiAtIOaYvuekuuasouS5kOixhlxuICAgICAgICAgICAgaWYgKHRoaXMuZ29iYWxfY291bnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvYmFsX2NvdW50LnN0cmluZyA9IFwiOlwiICsgdGhpcy5fZm9ybWF0R29sZChwbGF5ZXJEYXRhLmdvYmFsX2NvdW50IHx8IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlQ3VycmVuY3lJY29uKDEpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDmm7TmlrDotKfluIHlm77moIdcbiAgICBfdXBkYXRlQ3VycmVuY3lJY29uOiBmdW5jdGlvbihyb29tQ2F0ZWdvcnkpIHtcbiAgICAgICAgLy8g5p+l5om+5oiW5Yib5bu66LSn5biB5Zu+5qCH6IqC54K5XG4gICAgICAgIHZhciBwbGF5ZXJOb2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwicGxheWVyX25vZGVcIik7XG4gICAgICAgIGlmICghcGxheWVyTm9kZSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgLy8g5bCd6K+V5om+5Yiw6LSn5biB5Zu+5qCHXG4gICAgICAgIHZhciBjdXJyZW5jeUljb24gPSBwbGF5ZXJOb2RlLmdldENoaWxkQnlOYW1lKFwiY3VycmVuY3lfaWNvblwiKTtcbiAgICAgICAgaWYgKCFjdXJyZW5jeUljb24pIHtcbiAgICAgICAgICAgIC8vIOWmguaenOayoeacieeOsOacieWbvuagh++8jOWIm+W7uuS4gOS4qlxuICAgICAgICAgICAgY3VycmVuY3lJY29uID0gbmV3IGNjLk5vZGUoXCJjdXJyZW5jeV9pY29uXCIpO1xuICAgICAgICAgICAgY3VycmVuY3lJY29uLnNldFBvc2l0aW9uKC0xMDAsIDgwKTtcbiAgICAgICAgICAgIGN1cnJlbmN5SWNvbi56SW5kZXggPSAxMDtcbiAgICAgICAgICAgIGN1cnJlbmN5SWNvbi5wYXJlbnQgPSBwbGF5ZXJOb2RlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7nsbvlnovmmL7npLrkuI3lkIzlm77moIfvvIjov5nph4znlKjmloflrZfku6Pmm7/vvIzlrp7pmYXpobnnm67lj6/ku6XmjaLlm77niYfvvIlcbiAgICAgICAgdmFyIGxhYmVsID0gY3VycmVuY3lJY29uLmdldENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGlmICghbGFiZWwpIHtcbiAgICAgICAgICAgIGxhYmVsID0gY3VycmVuY3lJY29uLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIH1cbiAgICAgICAgbGFiZWwuc3RyaW5nID0gcm9vbUNhdGVnb3J5ID09PSAyID8gXCLluIFcIiA6IFwi6LGGXCI7XG4gICAgICAgIGxhYmVsLmZvbnRTaXplID0gMjQ7XG4gICAgICAgIGN1cnJlbmN5SWNvbi5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjE1LCAwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBvdXRsaW5lID0gY3VycmVuY3lJY29uLmdldENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpO1xuICAgICAgICBpZiAoIW91dGxpbmUpIHtcbiAgICAgICAgICAgIG91dGxpbmUgPSBjdXJyZW5jeUljb24uYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDAsIDAsIDApO1xuICAgICAgICBvdXRsaW5lLndpZHRoID0gMjtcbiAgICB9LFxuICAgIFxuICAgIC8vIOWIneWni+WMluernuaKgOW4geaYvuekulxuICAgIF9pbml0QXJlbmFDb2luRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgdmFyIHBsYXllckRhdGEgPSBteWdsb2JhbCA/IG15Z2xvYmFsLnBsYXllckRhdGEgOiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5pyJ56ue5oqA5biBTGFiZWzvvIzliJ3lp4vljJbmmL7npLpcbiAgICAgICAgaWYgKHRoaXMuYXJlbmFfY29pbl9sYWJlbCAmJiBwbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmFyZW5hX2NvaW5fbGFiZWwuc3RyaW5nID0gXCLnq57mioDluIE6IFwiICsgdGhpcy5fZm9ybWF0R29sZChwbGF5ZXJEYXRhLmFyZW5hX2NvaW4gfHwgMCk7XG4gICAgICAgICAgICB0aGlzLmFyZW5hX2NvaW5fbGFiZWwubm9kZS5hY3RpdmUgPSBmYWxzZTsgLy8g6buY6K6k6ZqQ6JePXG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOiOt+WPluacgOaWsOeahOeOqeWutuS9memine+8iOmHkeW4geWSjOernuaKgOW4ge+8iVxuICAgIF9yZWZyZXNoUGxheWVyQmFsYW5jZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgIGlmICh3aW5kb3cuYXJlbmFEYXRhICYmIHdpbmRvdy5hcmVuYURhdGEucmVmcmVzaEJhbGFuY2UpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hcmVuYURhdGEucmVmcmVzaEJhbGFuY2UoZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLojrflj5bnjqnlrrbkvZnpop3lpLHotKU6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5pu05pawVUnmmL7npLpcbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVDdXJyZW5jeURpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5hcmVuYV9jb2luX2xhYmVsICYmIGRhdGEuYXJlbmFfY29pbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYXJlbmFfY29pbl9sYWJlbC5zdHJpbmcgPSBcIuernuaKgOW4gTogXCIgKyBzZWxmLl9mb3JtYXRHb2xkKGRhdGEuYXJlbmFfY29pbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOOAkOernuaKgOWcuuWKn+iDveOAkeaYvuekuuaKpeWQjeW8ueeql1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93U2lnbnVwRGlhbG9nOiBmdW5jdGlvbihyb29tQ29uZmlnKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICB2YXIgcGxheWVyRGF0YSA9IG15Z2xvYmFsID8gbXlnbG9iYWwucGxheWVyRGF0YSA6IG51bGw7XG4gICAgICAgIHZhciBwbGF5ZXJBcmVuYUNvaW4gPSBwbGF5ZXJEYXRhID8gKHBsYXllckRhdGEuYXJlbmFfY29pbiB8fCAwKSA6IDA7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bmiqXlkI3otLlcbiAgICAgICAgdmFyIHNpZ251cEZlZSA9IHJvb21Db25maWcuc2lnbnVwX2ZlZSB8fCByb29tQ29uZmlnLnNpZ251cEZlZSB8fCAwO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen5by556qXXG4gICAgICAgIHZhciBvbGREaWFsb2cgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJTaWdudXBEaWFsb2dcIik7XG4gICAgICAgIGlmIChvbGREaWFsb2cpIG9sZERpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgIFxuICAgICAgICAvLyDojrflj5bnlLvluIPlsLrlr7hcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKSB8fCBjYy5maW5kKCdDYW52YXMnKS5nZXRDb21wb25lbnQoY2MuQ2FudmFzKTtcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLmhlaWdodCA6IDcyMDtcbiAgICAgICAgdmFyIHNjcmVlbldpZHRoID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24ud2lkdGggOiAxMjgwO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yib5bu65by556qX5a655ZmoXG4gICAgICAgIHZhciBkaWFsb2cgPSBuZXcgY2MuTm9kZShcIlNpZ251cERpYWxvZ1wiKTtcbiAgICAgICAgZGlhbG9nLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBkaWFsb2cuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGRpYWxvZy56SW5kZXggPSAzMDAwO1xuICAgICAgICBkaWFsb2cucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6YGu572pXG4gICAgICAgIHZhciBtYXNrID0gbmV3IGNjLk5vZGUoXCJNYXNrXCIpO1xuICAgICAgICB2YXIgbWFza0cgPSBtYXNrLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIG1hc2tHLmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDE4MCk7XG4gICAgICAgIG1hc2tHLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIG1hc2tHLmZpbGwoKTtcbiAgICAgICAgbWFzay5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICBtYXNrLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+S4u+S9k1xuICAgICAgICB2YXIgZGlhbG9nV2lkdGggPSA0MjA7XG4gICAgICAgIHZhciBkaWFsb2dIZWlnaHQgPSAzODA7XG4gICAgICAgIHZhciBkaWFsb2dCZyA9IG5ldyBjYy5Ob2RlKFwiRGlhbG9nQmdcIik7XG4gICAgICAgIGRpYWxvZ0JnLnNldENvbnRlbnRTaXplKGNjLnNpemUoZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRiZyA9IGRpYWxvZ0JnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGRiZy5maWxsQ29sb3IgPSBjYy5jb2xvcigzNSwgMzAsIDUwLCAyNTApO1xuICAgICAgICBkYmcucm91bmRSZWN0KC1kaWFsb2dXaWR0aC8yLCAtZGlhbG9nSGVpZ2h0LzIsIGRpYWxvZ1dpZHRoLCBkaWFsb2dIZWlnaHQsIDEyKTtcbiAgICAgICAgZGJnLmZpbGwoKTtcbiAgICAgICAgZGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMTgwLCAxNDAsIDYwLCAyMDApO1xuICAgICAgICBkYmcubGluZVdpZHRoID0gMztcbiAgICAgICAgZGJnLnJvdW5kUmVjdCgtZGlhbG9nV2lkdGgvMiwgLWRpYWxvZ0hlaWdodC8yLCBkaWFsb2dXaWR0aCwgZGlhbG9nSGVpZ2h0LCAxMik7XG4gICAgICAgIGRiZy5zdHJva2UoKTtcbiAgICAgICAgZGlhbG9nQmcucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZVRleHQgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZVRleHQuc2V0UG9zaXRpb24oMCwgZGlhbG9nSGVpZ2h0LzIgLSA0MCk7XG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aXRsZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIHR0bCA9IHRpdGxlVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0dGwuc3RyaW5nID0gXCLnq57mioDlnLrmiqXlkI1cIjtcbiAgICAgICAgdHRsLmZvbnRTaXplID0gMjY7XG4gICAgICAgIHR0bC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZVRleHQuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIyMCwgMTAwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aXRsZU91dGxpbmUgPSB0aXRsZVRleHQuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSk7XG4gICAgICAgIHRpdGxlT3V0bGluZS5jb2xvciA9IGNjLmNvbG9yKDgwLCA1MCwgMCk7XG4gICAgICAgIHRpdGxlT3V0bGluZS53aWR0aCA9IDI7XG4gICAgICAgIHRpdGxlVGV4dC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmiL/pl7TlkI3np7BcbiAgICAgICAgdmFyIHJvb21OYW1lVGV4dCA9IG5ldyBjYy5Ob2RlKFwiUm9vbU5hbWVcIik7XG4gICAgICAgIHJvb21OYW1lVGV4dC5zZXRQb3NpdGlvbigwLCBkaWFsb2dIZWlnaHQvMiAtIDgwKTtcbiAgICAgICAgcm9vbU5hbWVUZXh0LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHJvb21OYW1lVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgcm5sID0gcm9vbU5hbWVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHJubC5zdHJpbmcgPSByb29tQ29uZmlnLnJvb21fbmFtZSB8fCBcIuernuaKgOWculwiO1xuICAgICAgICBybmwuZm9udFNpemUgPSAyMDtcbiAgICAgICAgcm5sLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIHJvb21OYW1lVGV4dC5jb2xvciA9IGNjLmNvbG9yKDIwMCwgMTgwLCAxNDApO1xuICAgICAgICByb29tTmFtZVRleHQucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5oql5ZCN6LS55L+h5oGvXG4gICAgICAgIHZhciBmZWVMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiRmVlTGFiZWxcIik7XG4gICAgICAgIGZlZUxhYmVsLnNldFBvc2l0aW9uKC1kaWFsb2dXaWR0aC8yICsgMzAsIGRpYWxvZ0hlaWdodC8yIC0gMTMwKTtcbiAgICAgICAgZmVlTGFiZWwuYW5jaG9yWCA9IDA7XG4gICAgICAgIGZlZUxhYmVsLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBmbCA9IGZlZUxhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGZsLnN0cmluZyA9IFwi5oql5ZCN6LS577yaXCI7XG4gICAgICAgIGZsLmZvbnRTaXplID0gMTg7XG4gICAgICAgIGZlZUxhYmVsLmNvbG9yID0gY2MuY29sb3IoMjIwLCAyMTAsIDE5MCk7XG4gICAgICAgIGZlZUxhYmVsLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIHZhciBmZWVWYWx1ZSA9IG5ldyBjYy5Ob2RlKFwiRmVlVmFsdWVcIik7XG4gICAgICAgIGZlZVZhbHVlLnNldFBvc2l0aW9uKDYwLCBkaWFsb2dIZWlnaHQvMiAtIDEzMCk7XG4gICAgICAgIGZlZVZhbHVlLmFuY2hvclggPSAwO1xuICAgICAgICBmZWVWYWx1ZS5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgZnYgPSBmZWVWYWx1ZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBmdi5zdHJpbmcgPSB0aGlzLl9mb3JtYXRHb2xkKHNpZ251cEZlZSkgKyBcIiDnq57mioDluIFcIjtcbiAgICAgICAgZnYuZm9udFNpemUgPSAyMDtcbiAgICAgICAgZmVlVmFsdWUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDIxNSwgMCk7XG4gICAgICAgIGZlZVZhbHVlLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOW9k+WJjeS9meminVxuICAgICAgICB2YXIgYmFsYW5jZUxhYmVsID0gbmV3IGNjLk5vZGUoXCJCYWxhbmNlTGFiZWxcIik7XG4gICAgICAgIGJhbGFuY2VMYWJlbC5zZXRQb3NpdGlvbigtZGlhbG9nV2lkdGgvMiArIDMwLCBkaWFsb2dIZWlnaHQvMiAtIDE3MCk7XG4gICAgICAgIGJhbGFuY2VMYWJlbC5hbmNob3JYID0gMDtcbiAgICAgICAgYmFsYW5jZUxhYmVsLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBibCA9IGJhbGFuY2VMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBibC5zdHJpbmcgPSBcIuW9k+WJjeS9memine+8mlwiO1xuICAgICAgICBibC5mb250U2l6ZSA9IDE4O1xuICAgICAgICBiYWxhbmNlTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyMjAsIDIxMCwgMTkwKTtcbiAgICAgICAgYmFsYW5jZUxhYmVsLnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIHZhciBiYWxhbmNlVmFsdWUgPSBuZXcgY2MuTm9kZShcIkJhbGFuY2VWYWx1ZVwiKTtcbiAgICAgICAgYmFsYW5jZVZhbHVlLnNldFBvc2l0aW9uKDYwLCBkaWFsb2dIZWlnaHQvMiAtIDE3MCk7XG4gICAgICAgIGJhbGFuY2VWYWx1ZS5hbmNob3JYID0gMDtcbiAgICAgICAgYmFsYW5jZVZhbHVlLmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBidiA9IGJhbGFuY2VWYWx1ZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBidi5zdHJpbmcgPSB0aGlzLl9mb3JtYXRHb2xkKHBsYXllckFyZW5hQ29pbikgKyBcIiDnq57mioDluIFcIjtcbiAgICAgICAgYnYuZm9udFNpemUgPSAyMDtcbiAgICAgICAgYmFsYW5jZVZhbHVlLmNvbG9yID0gcGxheWVyQXJlbmFDb2luID49IHNpZ251cEZlZSA/IGNjLmNvbG9yKDEwMCwgMjIwLCAxMDApIDogY2MuY29sb3IoMjU1LCAxMDAsIDEwMCk7XG4gICAgICAgIGJhbGFuY2VWYWx1ZS5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDlhqDlhpvlpZblirHpooTop4hcbiAgICAgICAgdmFyIHJld2FyZExhYmVsID0gbmV3IGNjLk5vZGUoXCJSZXdhcmRMYWJlbFwiKTtcbiAgICAgICAgcmV3YXJkTGFiZWwuc2V0UG9zaXRpb24oLWRpYWxvZ1dpZHRoLzIgKyAzMCwgZGlhbG9nSGVpZ2h0LzIgLSAyMTApO1xuICAgICAgICByZXdhcmRMYWJlbC5hbmNob3JYID0gMDtcbiAgICAgICAgcmV3YXJkTGFiZWwuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIHJsID0gcmV3YXJkTGFiZWwuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcmwuc3RyaW5nID0gXCLlhqDlhpvlpZblirHvvJpcIjtcbiAgICAgICAgcmwuZm9udFNpemUgPSAxODtcbiAgICAgICAgcmV3YXJkTGFiZWwuY29sb3IgPSBjYy5jb2xvcigyMjAsIDIxMCwgMTkwKTtcbiAgICAgICAgcmV3YXJkTGFiZWwucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNoYW1waW9uUmV3YXJkID0gcm9vbUNvbmZpZy5jaGFtcGlvbl9yZXdhcmQgfHwgcm9vbUNvbmZpZy5jaGFtcGlvblJld2FyZCB8fCB7IGNvaW5zOiAwIH07XG4gICAgICAgIHZhciByZXdhcmRWYWx1ZSA9IG5ldyBjYy5Ob2RlKFwiUmV3YXJkVmFsdWVcIik7XG4gICAgICAgIHJld2FyZFZhbHVlLnNldFBvc2l0aW9uKDYwLCBkaWFsb2dIZWlnaHQvMiAtIDIxMCk7XG4gICAgICAgIHJld2FyZFZhbHVlLmFuY2hvclggPSAwO1xuICAgICAgICByZXdhcmRWYWx1ZS5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgcnYgPSByZXdhcmRWYWx1ZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBydi5zdHJpbmcgPSB0aGlzLl9mb3JtYXRHb2xkKGNoYW1waW9uUmV3YXJkLmNvaW5zIHx8IDApICsgXCIg56ue5oqA5biBXCI7XG4gICAgICAgIHJ2LmZvbnRTaXplID0gMjA7XG4gICAgICAgIHJld2FyZFZhbHVlLmNvbG9yID0gY2MuY29sb3IoMjU1LCAxODAsIDUwKTtcbiAgICAgICAgcmV3YXJkVmFsdWUucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5oyJ6ZKu5Yy65Z+fXG4gICAgICAgIHZhciBidG5ZID0gLWRpYWxvZ0hlaWdodC8yICsgNTU7XG4gICAgICAgIFxuICAgICAgICAvLyDliKTmlq3kvZnpop3mmK/lkKbotrPlpJ9cbiAgICAgICAgdmFyIGlzRW5vdWdoID0gcGxheWVyQXJlbmFDb2luID49IHNpZ251cEZlZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPlua2iOaMiemSrlxuICAgICAgICB2YXIgY2FuY2VsQnRuID0gdGhpcy5fY3JlYXRlRGlhbG9nQnV0dG9uKFxuICAgICAgICAgICAgXCLlj5bmtohcIixcbiAgICAgICAgICAgIGNjLmNvbG9yKDgwLCA3NSwgOTUpLFxuICAgICAgICAgICAgLTkwLCBidG5ZLFxuICAgICAgICAgICAgMTMwLCA0OCxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGNhbmNlbEJ0bi5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNFbm91Z2gpIHtcbiAgICAgICAgICAgIC8vIOaKpeWQjeaMiemSrlxuICAgICAgICAgICAgdmFyIHNpZ251cEJ0biA9IHRoaXMuX2NyZWF0ZURpYWxvZ0J1dHRvbihcbiAgICAgICAgICAgICAgICBcIuehruiupOaKpeWQjVwiLFxuICAgICAgICAgICAgICAgIGNjLmNvbG9yKDc2LCAxNzUsIDgwKSwgIC8vIOe7v+iJslxuICAgICAgICAgICAgICAgIDkwLCBidG5ZLFxuICAgICAgICAgICAgICAgIDE1MCwgNDgsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOiwg+eUqOaKpeWQjeaOpeWPo1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kb1NpZ251cChyb29tQ29uZmlnLCBkaWFsb2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzaWdudXBCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5L2Z6aKd5LiN6LazIC0g5pi+56S66KeC55yL5bm/5ZGK5oyJ6ZKuXG4gICAgICAgICAgICB2YXIgYWRCdG4gPSB0aGlzLl9jcmVhdGVEaWFsb2dCdXR0b24oXG4gICAgICAgICAgICAgICAgXCLop4LnnIvlub/lkYrojrflj5ZcIixcbiAgICAgICAgICAgICAgICBjYy5jb2xvcigyNTUsIDE1MiwgMCksICAvLyDmqZnoibJcbiAgICAgICAgICAgICAgICA5MCwgYnRuWSxcbiAgICAgICAgICAgICAgICAxNTAsIDQ4LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zaG93QWRSZXdhcmREaWFsb2coJ2FyZW5hX2NvaW4nLCBzaWdudXBGZWUgLSBwbGF5ZXJBcmVuYUNvaW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhZEJ0bi5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOaPkOekuuS9memineS4jei2s1xuICAgICAgICAgICAgdmFyIHRpcE5vZGUgPSBuZXcgY2MuTm9kZShcIlRpcFwiKTtcbiAgICAgICAgICAgIHRpcE5vZGUuc2V0UG9zaXRpb24oMCwgYnRuWSArIDQ1KTtcbiAgICAgICAgICAgIHRpcE5vZGUuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgICAgIHRpcE5vZGUuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgICAgIHZhciB0aXBMYWJlbCA9IHRpcE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgICAgIHRpcExhYmVsLnN0cmluZyA9IFwi56ue5oqA5biB5LiN6Laz77yM6KeC55yL5bm/5ZGK6I635Y+W5pu05aSaXCI7XG4gICAgICAgICAgICB0aXBMYWJlbC5mb250U2l6ZSA9IDE0O1xuICAgICAgICAgICAgdGlwTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgIHRpcE5vZGUuY29sb3IgPSBjYy5jb2xvcigyNTUsIDE1MCwgMTAwKTtcbiAgICAgICAgICAgIHRpcE5vZGUucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlhbPpl63mjInpkq5cbiAgICAgICAgdmFyIGNsb3NlQnRuID0gbmV3IGNjLk5vZGUoXCJDbG9zZUJ0blwiKTtcbiAgICAgICAgY2xvc2VCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSgzMCwgMzApKTtcbiAgICAgICAgY2xvc2VCdG4ueCA9IGRpYWxvZ1dpZHRoLzIgLSAyNTtcbiAgICAgICAgY2xvc2VCdG4ueSA9IGRpYWxvZ0hlaWdodC8yIC0gMzA7XG4gICAgICAgIHZhciBjYmcgPSBjbG9zZUJ0bi5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBjYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMCwgMCwgMCwgODApO1xuICAgICAgICBjYmcuY2lyY2xlKDAsIDAsIDE1KTtcbiAgICAgICAgY2JnLmZpbGwoKTtcbiAgICAgICAgY2xvc2VCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNsb3NlWCA9IG5ldyBjYy5Ob2RlKFwiWFwiKTtcbiAgICAgICAgY2xvc2VYLmFuY2hvclggPSAwLjU7XG4gICAgICAgIGNsb3NlWC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgY2xvc2VMYWJlbCA9IGNsb3NlWC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjbG9zZUxhYmVsLnN0cmluZyA9IFwiw5dcIjtcbiAgICAgICAgY2xvc2VMYWJlbC5mb250U2l6ZSA9IDI0O1xuICAgICAgICBjbG9zZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGNsb3NlWC5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICBjbG9zZVgucGFyZW50ID0gY2xvc2VCdG47XG4gICAgICAgIFxuICAgICAgICBjbG9zZUJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBcbiAgICAvLyDmiafooYzmiqXlkI1cbiAgICBfZG9TaWdudXA6IGZ1bmN0aW9uKHJvb21Db25maWcsIGRpYWxvZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXdpbmRvdy5hcmVuYURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi56ue5oqA5Zy65pWw5o2u5pyq5Yid5aeL5YyWXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9zaG93TWVzc2FnZUNlbnRlcihcIuato+WcqOaKpeWQjS4uLlwiKTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5hcmVuYURhdGEuc2lnbnVwKHJvb21Db25maWcuaWQsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2VDZW50ZXIoXCLmiqXlkI3lpLHotKU6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5oql5ZCN5oiQ5Yqf77yBXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDlhbPpl63lvLnnqpdcbiAgICAgICAgICAgIGlmIChkaWFsb2cpIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOabtOaWsOi0p+W4geaYvuekulxuICAgICAgICAgICAgaWYgKHdpbmRvdy5hcmVuYURhdGEucmVmcmVzaEJhbGFuY2UpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLnJlZnJlc2hCYWxhbmNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDdXJyZW5jeURpc3BsYXkoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pi+56S65bey5oql5ZCN54q25oCB5by556qXXG4gICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93U2lnbmVkVXBEaWFsb2cocm9vbUNvbmZpZyk7XG4gICAgICAgICAgICB9LCAwLjUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOOAkOernuaKgOWcuuWKn+iDveOAkeaYvuekuuW3suaKpeWQjeeKtuaAgeW8ueeql1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93U2lnbmVkVXBEaWFsb2c6IGZ1bmN0aW9uKHJvb21Db25maWcpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen5by556qXXG4gICAgICAgIHZhciBvbGREaWFsb2cgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJTaWduZWRVcERpYWxvZ1wiKTtcbiAgICAgICAgaWYgKG9sZERpYWxvZykgb2xkRGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPlueUu+W4g+WwuuWvuFxuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5ub2RlLmdldENvbXBvbmVudChjYy5DYW52YXMpIHx8IGNjLmZpbmQoJ0NhbnZhcycpLmdldENvbXBvbmVudChjYy5DYW52YXMpO1xuICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY2FudmFzID8gY2FudmFzLmRlc2lnblJlc29sdXRpb24uaGVpZ2h0IDogNzIwO1xuICAgICAgICB2YXIgc2NyZWVuV2lkdGggPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi53aWR0aCA6IDEyODA7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rlvLnnqpflrrnlmahcbiAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBjYy5Ob2RlKFwiU2lnbmVkVXBEaWFsb2dcIik7XG4gICAgICAgIGRpYWxvZy5zZXRDb250ZW50U2l6ZShjYy5zaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpKTtcbiAgICAgICAgZGlhbG9nLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBkaWFsb2cuekluZGV4ID0gMzAwMDtcbiAgICAgICAgZGlhbG9nLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWNiumAj+aYjumBrue9qVxuICAgICAgICB2YXIgbWFzayA9IG5ldyBjYy5Ob2RlKFwiTWFza1wiKTtcbiAgICAgICAgdmFyIG1hc2tHID0gbWFzay5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBtYXNrRy5maWxsQ29sb3IgPSBjYy5jb2xvcigwLCAwLCAwLCAxODApO1xuICAgICAgICBtYXNrRy5yZWN0KC1zY3JlZW5XaWR0aC8yLCAtc2NyZWVuSGVpZ2h0LzIsIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpO1xuICAgICAgICBtYXNrRy5maWxsKCk7XG4gICAgICAgIG1hc2sucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgbWFzay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyDlvLnnqpfkuLvkvZNcbiAgICAgICAgdmFyIGRpYWxvZ1dpZHRoID0gMzgwO1xuICAgICAgICB2YXIgZGlhbG9nSGVpZ2h0ID0gMzIwO1xuICAgICAgICB2YXIgZGlhbG9nQmcgPSBuZXcgY2MuTm9kZShcIkRpYWxvZ0JnXCIpO1xuICAgICAgICBkaWFsb2dCZy5zZXRDb250ZW50U2l6ZShjYy5zaXplKGRpYWxvZ1dpZHRoLCBkaWFsb2dIZWlnaHQpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkYmcgPSBkaWFsb2dCZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICBkYmcuZmlsbENvbG9yID0gY2MuY29sb3IoMzUsIDMwLCA1MCwgMjUwKTtcbiAgICAgICAgZGJnLnJvdW5kUmVjdCgtZGlhbG9nV2lkdGgvMiwgLWRpYWxvZ0hlaWdodC8yLCBkaWFsb2dXaWR0aCwgZGlhbG9nSGVpZ2h0LCAxMik7XG4gICAgICAgIGRiZy5maWxsKCk7XG4gICAgICAgIGRiZy5zdHJva2VDb2xvciA9IGNjLmNvbG9yKDc2LCAxNzUsIDgwLCAyMDApO1xuICAgICAgICBkYmcubGluZVdpZHRoID0gMztcbiAgICAgICAgZGJnLnJvdW5kUmVjdCgtZGlhbG9nV2lkdGgvMiwgLWRpYWxvZ0hlaWdodC8yLCBkaWFsb2dXaWR0aCwgZGlhbG9nSGVpZ2h0LCAxMik7XG4gICAgICAgIGRiZy5zdHJva2UoKTtcbiAgICAgICAgZGlhbG9nQmcucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6aKYXG4gICAgICAgIHZhciB0aXRsZVRleHQgPSBuZXcgY2MuTm9kZShcIlRpdGxlXCIpO1xuICAgICAgICB0aXRsZVRleHQuc2V0UG9zaXRpb24oMCwgZGlhbG9nSGVpZ2h0LzIgLSA0MCk7XG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICB0aXRsZVRleHQuYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIHR0bCA9IHRpdGxlVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB0dGwuc3RyaW5nID0gXCLlt7LmiqXlkI1cIjtcbiAgICAgICAgdHRsLmZvbnRTaXplID0gMjY7XG4gICAgICAgIHR0bC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZVRleHQuY29sb3IgPSBjYy5jb2xvcigxMDAsIDIyMCwgMTAwKTtcbiAgICAgICAgdGl0bGVUZXh0LnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOaIv+mXtOWQjeensFxuICAgICAgICB2YXIgcm9vbU5hbWVUZXh0ID0gbmV3IGNjLk5vZGUoXCJSb29tTmFtZVwiKTtcbiAgICAgICAgcm9vbU5hbWVUZXh0LnNldFBvc2l0aW9uKDAsIGRpYWxvZ0hlaWdodC8yIC0gODApO1xuICAgICAgICByb29tTmFtZVRleHQuYW5jaG9yWCA9IDAuNTtcbiAgICAgICAgcm9vbU5hbWVUZXh0LmFuY2hvclkgPSAwLjU7XG4gICAgICAgIHZhciBybmwgPSByb29tTmFtZVRleHQuYWRkQ29tcG9uZW50KGNjLkxhYmVsKTtcbiAgICAgICAgcm5sLnN0cmluZyA9IHJvb21Db25maWcucm9vbV9uYW1lIHx8IFwi56ue5oqA5Zy6XCI7XG4gICAgICAgIHJubC5mb250U2l6ZSA9IDIwO1xuICAgICAgICBybmwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgcm9vbU5hbWVUZXh0LmNvbG9yID0gY2MuY29sb3IoMjAwLCAxODAsIDE0MCk7XG4gICAgICAgIHJvb21OYW1lVGV4dC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDlgJLorqHml7bmmL7npLpcbiAgICAgICAgdmFyIGNvdW50ZG93bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJDb3VudGRvd25MYWJlbFwiKTtcbiAgICAgICAgY291bnRkb3duTGFiZWwuc2V0UG9zaXRpb24oMCwgZGlhbG9nSGVpZ2h0LzIgLSAxMzApO1xuICAgICAgICBjb3VudGRvd25MYWJlbC5hbmNob3JYID0gMC41O1xuICAgICAgICBjb3VudGRvd25MYWJlbC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgY2wgPSBjb3VudGRvd25MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjbC5zdHJpbmcgPSBcIuW8gOi1m+WAkuiuoeaXtu+8muiuoeeul+S4rS4uLlwiO1xuICAgICAgICBjbC5mb250U2l6ZSA9IDE4O1xuICAgICAgICBjbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjb3VudGRvd25MYWJlbC5jb2xvciA9IGNjLmNvbG9yKDI1NSwgMjIwLCAxMDApO1xuICAgICAgICBjb3VudGRvd25MYWJlbC5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDlgJLorqHml7ZcbiAgICAgICAgdmFyIHVwZGF0ZUNvdW50ZG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFkaWFsb2cgfHwgIWRpYWxvZy5pc1ZhbGlkKSByZXR1cm47XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjb3VudGRvd24gPSB3aW5kb3cuYXJlbmFEYXRhID8gd2luZG93LmFyZW5hRGF0YS5nZXRDb3VudGRvd24ocm9vbUNvbmZpZy5pZCkgOiAtMTtcbiAgICAgICAgICAgIGlmIChjb3VudGRvd24gPj0gMCkge1xuICAgICAgICAgICAgICAgIGNsLnN0cmluZyA9IFwi5byA6LWb5YCS6K6h5pe277yaXCIgKyAod2luZG93LmFyZW5hRGF0YS5mb3JtYXRDb3VudGRvd24gPyB3aW5kb3cuYXJlbmFEYXRhLmZvcm1hdENvdW50ZG93bihjb3VudGRvd24pIDogY291bnRkb3duICsgXCLnp5JcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsLnN0cmluZyA9IFwi562J5b6F5byA6LWbLi4uXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChjb3VudGRvd24gPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyDlgJLorqHml7bnu5PmnZ/vvIzoh6rliqjov5vlhaXmr5TotZtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZUNlbnRlcihcIuavlOi1m+WNs+WwhuW8gOWni++8gVwiKTtcbiAgICAgICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIC8vIOi/memHjOWPr+S7peiwg+eUqOi/m+WFpeavlOi1m+eahOaWueazlVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZSh1cGRhdGVDb3VudGRvd24sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB1cGRhdGVDb3VudGRvd24oKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaMiemSruWMuuWfn1xuICAgICAgICB2YXIgYnRuWSA9IC1kaWFsb2dIZWlnaHQvMiArIDU1O1xuICAgICAgICBcbiAgICAgICAgLy8g5Y+W5raI5oql5ZCN5oyJ6ZKuXG4gICAgICAgIHZhciBjYW5jZWxTaWdudXBCdG4gPSB0aGlzLl9jcmVhdGVEaWFsb2dCdXR0b24oXG4gICAgICAgICAgICBcIuWPlua2iOaKpeWQjVwiLFxuICAgICAgICAgICAgY2MuY29sb3IoMjAwLCAxMDAsIDgwKSwgIC8vIOe6ouiJslxuICAgICAgICAgICAgLTgwLCBidG5ZLFxuICAgICAgICAgICAgMTMwLCA0OCxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2NhbmNlbFNpZ251cChyb29tQ29uZmlnLCBkaWFsb2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBjYW5jZWxTaWdudXBCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5YWz6Zet5oyJ6ZKuXG4gICAgICAgIHZhciBjbG9zZUJ0biA9IHRoaXMuX2NyZWF0ZURpYWxvZ0J1dHRvbihcbiAgICAgICAgICAgIFwi5YWz6ZetXCIsXG4gICAgICAgICAgICBjYy5jb2xvcig4MCwgNzUsIDk1KSxcbiAgICAgICAgICAgIDgwLCBidG5ZLFxuICAgICAgICAgICAgMTAwLCA0OCxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGNsb3NlQnRuLnBhcmVudCA9IGRpYWxvZztcbiAgICB9LFxuICAgIFxuICAgIC8vIOWPlua2iOaKpeWQjVxuICAgIF9jYW5jZWxTaWdudXA6IGZ1bmN0aW9uKHJvb21Db25maWcsIGRpYWxvZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXdpbmRvdy5hcmVuYURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi56ue5oqA5Zy65pWw5o2u5pyq5Yid5aeL5YyWXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLmNhbmNlbFNpZ251cChyb29tQ29uZmlnLmlkLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5Y+W5raI5oql5ZCN5aSx6LSlOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZUNlbnRlcihcIuW3suWPlua2iOaKpeWQjVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5YWz6Zet5by556qXXG4gICAgICAgICAgICBpZiAoZGlhbG9nKSBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmm7TmlrDotKfluIHmmL7npLpcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUN1cnJlbmN5RGlzcGxheSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOOAkOmAmueUqOWKn+iDveOAkeaYvuekuuW5v+WRiuihpeW4geW8ueeql1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIF9zaG93QWRSZXdhcmREaWFsb2c6IGZ1bmN0aW9uKHR5cGUsIG5lZWRlZEFtb3VudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyDnp7vpmaTml6flvLnnqpdcbiAgICAgICAgdmFyIG9sZERpYWxvZyA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcIkFkUmV3YXJkRGlhbG9nXCIpO1xuICAgICAgICBpZiAob2xkRGlhbG9nKSBvbGREaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W55S75biD5bC65a+4XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLm5vZGUuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcykgfHwgY2MuZmluZCgnQ2FudmFzJykuZ2V0Q29tcG9uZW50KGNjLkNhbnZhcyk7XG4gICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjYW52YXMgPyBjYW52YXMuZGVzaWduUmVzb2x1dGlvbi5oZWlnaHQgOiA3MjA7XG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IGNhbnZhcyA/IGNhbnZhcy5kZXNpZ25SZXNvbHV0aW9uLndpZHRoIDogMTI4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuW8ueeql+WuueWZqFxuICAgICAgICB2YXIgZGlhbG9nID0gbmV3IGNjLk5vZGUoXCJBZFJld2FyZERpYWxvZ1wiKTtcbiAgICAgICAgZGlhbG9nLnNldENvbnRlbnRTaXplKGNjLnNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCkpO1xuICAgICAgICBkaWFsb2cuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGRpYWxvZy56SW5kZXggPSAzMDAwO1xuICAgICAgICBkaWFsb2cucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBcbiAgICAgICAgLy8g5Y2K6YCP5piO6YGu572pXG4gICAgICAgIHZhciBtYXNrID0gbmV3IGNjLk5vZGUoXCJNYXNrXCIpO1xuICAgICAgICB2YXIgbWFza0cgPSBtYXNrLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIG1hc2tHLmZpbGxDb2xvciA9IGNjLmNvbG9yKDAsIDAsIDAsIDE4MCk7XG4gICAgICAgIG1hc2tHLnJlY3QoLXNjcmVlbldpZHRoLzIsIC1zY3JlZW5IZWlnaHQvMiwgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCk7XG4gICAgICAgIG1hc2tHLmZpbGwoKTtcbiAgICAgICAgbWFzay5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICBtYXNrLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+S4u+S9k1xuICAgICAgICB2YXIgZGlhbG9nV2lkdGggPSAzODA7XG4gICAgICAgIHZhciBkaWFsb2dIZWlnaHQgPSAzMDA7XG4gICAgICAgIHZhciBkaWFsb2dCZyA9IG5ldyBjYy5Ob2RlKFwiRGlhbG9nQmdcIik7XG4gICAgICAgIGRpYWxvZ0JnLnNldENvbnRlbnRTaXplKGNjLnNpemUoZGlhbG9nV2lkdGgsIGRpYWxvZ0hlaWdodCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRiZyA9IGRpYWxvZ0JnLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGRiZy5maWxsQ29sb3IgPSBjYy5jb2xvcigzNSwgMzAsIDUwLCAyNTApO1xuICAgICAgICBkYmcucm91bmRSZWN0KC1kaWFsb2dXaWR0aC8yLCAtZGlhbG9nSGVpZ2h0LzIsIGRpYWxvZ1dpZHRoLCBkaWFsb2dIZWlnaHQsIDEyKTtcbiAgICAgICAgZGJnLmZpbGwoKTtcbiAgICAgICAgZGJnLnN0cm9rZUNvbG9yID0gY2MuY29sb3IoMjU1LCAxNTIsIDAsIDIwMCk7XG4gICAgICAgIGRiZy5saW5lV2lkdGggPSAzO1xuICAgICAgICBkYmcucm91bmRSZWN0KC1kaWFsb2dXaWR0aC8yLCAtZGlhbG9nSGVpZ2h0LzIsIGRpYWxvZ1dpZHRoLCBkaWFsb2dIZWlnaHQsIDEyKTtcbiAgICAgICAgZGJnLnN0cm9rZSgpO1xuICAgICAgICBkaWFsb2dCZy5wYXJlbnQgPSBkaWFsb2c7XG4gICAgICAgIFxuICAgICAgICAvLyDmoIfpophcbiAgICAgICAgdmFyIHRpdGxlVGV4dCA9IG5ldyBjYy5Ob2RlKFwiVGl0bGVcIik7XG4gICAgICAgIHRpdGxlVGV4dC5zZXRQb3NpdGlvbigwLCBkaWFsb2dIZWlnaHQvMiAtIDQwKTtcbiAgICAgICAgdGl0bGVUZXh0LmFuY2hvclggPSAwLjU7XG4gICAgICAgIHRpdGxlVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgdHRsID0gdGl0bGVUZXh0LmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHR0bC5zdHJpbmcgPSB0eXBlID09PSAnYXJlbmFfY29pbicgPyBcIuernuaKgOW4geS4jei2s1wiIDogXCLmrKLkuZDosYbkuI3otrNcIjtcbiAgICAgICAgdHRsLmZvbnRTaXplID0gMjY7XG4gICAgICAgIHR0bC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZVRleHQuY29sb3IgPSBjYy5jb2xvcigyNTUsIDE1MCwgMTAwKTtcbiAgICAgICAgdGl0bGVUZXh0LnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOivtOaYjuaWh+Wtl1xuICAgICAgICB2YXIgZGVzY1RleHQgPSBuZXcgY2MuTm9kZShcIkRlc2NcIik7XG4gICAgICAgIGRlc2NUZXh0LnNldFBvc2l0aW9uKDAsIGRpYWxvZ0hlaWdodC8yIC0gOTApO1xuICAgICAgICBkZXNjVGV4dC5hbmNob3JYID0gMC41O1xuICAgICAgICBkZXNjVGV4dC5hbmNob3JZID0gMC41O1xuICAgICAgICB2YXIgZGwgPSBkZXNjVGV4dC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBkbC5zdHJpbmcgPSBcIuingueci+a/gOWKseinhumikemihuWPllwiICsgdGhpcy5fZm9ybWF0R29sZChuZWVkZWRBbW91bnQpICsgKHR5cGUgPT09ICdhcmVuYV9jb2luJyA/IFwi56ue5oqA5biBXCIgOiBcIuasouS5kOixhlwiKSArIFwi57un57ut5ri45oiPXCI7XG4gICAgICAgIGRsLmZvbnRTaXplID0gMTY7XG4gICAgICAgIGRsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVI7XG4gICAgICAgIGRlc2NUZXh0LmNvbG9yID0gY2MuY29sb3IoMjAwLCAxOTAsIDE3MCk7XG4gICAgICAgIGRlc2NUZXh0LnBhcmVudCA9IGRpYWxvZztcbiAgICAgICAgXG4gICAgICAgIC8vIOW5v+WRiuWbvuaghy/mj5DnpLpcbiAgICAgICAgdmFyIGFkSWNvbiA9IG5ldyBjYy5Ob2RlKFwiQWRJY29uXCIpO1xuICAgICAgICBhZEljb24uc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIGFkSWNvbi5hbmNob3JYID0gMC41O1xuICAgICAgICBhZEljb24uYW5jaG9yWSA9IDAuNTtcbiAgICAgICAgdmFyIGFpbCA9IGFkSWNvbi5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBhaWwuc3RyaW5nID0gXCLwn46sXCI7XG4gICAgICAgIGFpbC5mb250U2l6ZSA9IDQ4O1xuICAgICAgICBhZEljb24ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g5oyJ6ZKu5Yy65Z+fXG4gICAgICAgIHZhciBidG5ZID0gLWRpYWxvZ0hlaWdodC8yICsgNTU7XG4gICAgICAgIFxuICAgICAgICAvLyDlj5bmtojmjInpkq5cbiAgICAgICAgdmFyIGNhbmNlbEJ0biA9IHRoaXMuX2NyZWF0ZURpYWxvZ0J1dHRvbihcbiAgICAgICAgICAgIFwi5Y+W5raIXCIsXG4gICAgICAgICAgICBjYy5jb2xvcig4MCwgNzUsIDk1KSxcbiAgICAgICAgICAgIC04MCwgYnRuWSxcbiAgICAgICAgICAgIDEyMCwgNDgsXG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBjYW5jZWxCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgICAgICBcbiAgICAgICAgLy8g6KeC55yL6aKG5Y+W5oyJ6ZKuXG4gICAgICAgIHZhciB3YXRjaEJ0biA9IHRoaXMuX2NyZWF0ZURpYWxvZ0J1dHRvbihcbiAgICAgICAgICAgIFwi6KeC55yL6aKG5Y+WXCIsXG4gICAgICAgICAgICBjYy5jb2xvcigyNTUsIDE1MiwgMCksICAvLyDmqZnoibJcbiAgICAgICAgICAgIDgwLCBidG5ZLFxuICAgICAgICAgICAgMTQwLCA0OCxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3dhdGNoQWRBbmRHZXRSZXdhcmQodHlwZSwgZGlhbG9nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgd2F0Y2hCdG4ucGFyZW50ID0gZGlhbG9nO1xuICAgIH0sXG4gICAgXG4gICAgLy8g6KeC55yL5bm/5ZGK6I635Y+W5aWW5YqxXG4gICAgX3dhdGNoQWRBbmRHZXRSZXdhcmQ6IGZ1bmN0aW9uKHR5cGUsIGRpYWxvZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyDov5nph4zlupTor6XosIPnlKjlub/lkYpTREvmmL7npLrmv4DlirHop4bpopFcbiAgICAgICAgLy8g55uu5YmN5qih5ouf6KeC55yL5a6M5oiQXG4gICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlQ2VudGVyKFwi5q2j5Zyo5Yqg6L295bm/5ZGKLi4uXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qih5ouf5bm/5ZGK6KeC55yL5a6M5oiQXG4gICAgICAgIHRoaXMuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCF3aW5kb3cuYXJlbmFEYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2VDZW50ZXIoXCLmlbDmja7mnKrliJ3lp4vljJZcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cuYXJlbmFEYXRhLndhdGNoQWRGb3JSZXdhcmQodHlwZSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlQ2VudGVyKFwi6I635Y+W5aWW5Yqx5aSx6LSlOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2VDZW50ZXIoXCLojrflvpflpZblirHvvIFcIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5YWz6Zet5by556qXXG4gICAgICAgICAgICAgICAgaWYgKGRpYWxvZykgZGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDotKfluIHmmL7npLpcbiAgICAgICAgICAgICAgICBzZWxmLl91cGRhdGVDdXJyZW5jeURpc3BsYXkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxLjUpO1xuICAgIH0sXG4gICAgXG4gICAgLy8g5Zy65pmv6ZSA5q+B5pe25riF55CG6LWE5rqQXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIOa4heeQhuWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duVGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fY291bnRkb3duVGltZXIpO1xuICAgICAgICAgICAgdGhpcy5fY291bnRkb3duVGltZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIbnq57mioDlnLrlgJLorqHml7ZcbiAgICAgICAgaWYgKHdpbmRvdy5hcmVuYURhdGEgJiYgd2luZG93LmFyZW5hRGF0YS5jbGVhckFsbENvdW50ZG93bnMpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hcmVuYURhdGEuY2xlYXJBbGxDb3VudGRvd25zKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWBnOatouWcqOe6v+eKtuaAgeebkea1i++8iOWkp+WOheWcuuaZr+mcgOimgeaMgee7reebkea1i++8jOaJgOS7peWPquacieWcuuaZr+mUgOavgeaXtuaJjeWBnOatou+8iVxuICAgICAgICAvLyDms6jmhI/vvJrpgJrluLjlpKfljoXlnLrmma/kuI3kvJrplIDmr4HvvIzpmaTpnZ7liIfmjaLliLDmuLjmiI/lnLrmma9cbiAgICAgICAgLy8g5aaC5p6c6ZyA6KaB5L+d5oyB55uR5rWL77yM5Y+v5Lul5rOo6YeK5o6J5LiL6Z2i6L+Z6KGMXG4gICAgICAgIC8vIHRoaXMuX3N0b3BPbmxpbmVNb25pdG9yaW5nKCk7XG4gICAgfSxcblxuICAgIHN0YXJ0ICgpIHt9XG59KTtcbiJdfQ==