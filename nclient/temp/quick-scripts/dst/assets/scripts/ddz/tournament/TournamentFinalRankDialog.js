
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/ddz/tournament/TournamentFinalRankDialog.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'd534bqBYA5JGadVgedCNtkf', 'TournamentFinalRankDialog');
// scripts/ddz/tournament/TournamentFinalRankDialog.js

"use strict";

/**
 * TournamentFinalRankDialog - 竞技场决赛冠军排行榜弹窗
 * 
 * 功能：
 * 1. 显示期号和比赛结束标题
 * 2. 前三名领奖台展示（冠军最大，居中高亮）
 * 3. TOP20 ScrollView列表
 * 4. 显示排名、头像、昵称、最终金币
 * 5. 确认按钮返回大厅
 * 
 * 设计风格：中国风斗地主竞技场 - 金色 + 红色
 * 冠军特效：发光、粒子、奖杯动画
 * 
 * 🔧【修复】优化布局：修复名次、头像、用户名挤在一起的问题
 */

cc.Class({
  "extends": cc.Component,
  properties: {
    // 期号标签
    periodNoLabel: {
      type: cc.Label,
      "default": null
    },
    // 总参赛人数标签
    totalPlayersLabel: {
      type: cc.Label,
      "default": null
    },
    // 冠军节点
    championNode: {
      type: cc.Node,
      "default": null
    },
    // 亚军节点
    runnerUpNode: {
      type: cc.Node,
      "default": null
    },
    // 季军节点
    thirdPlaceNode: {
      type: cc.Node,
      "default": null
    },
    // TOP20 ScrollView
    top20ScrollView: {
      type: cc.ScrollView,
      "default": null
    },
    // 排行榜item模板
    rankItemPrefab: {
      type: cc.Prefab,
      "default": null
    },
    // 我的排名标签
    myRankLabel: {
      type: cc.Label,
      "default": null
    },
    // 我的金币标签
    myCoinLabel: {
      type: cc.Label,
      "default": null
    },
    // 确认按钮
    confirmBtn: {
      type: cc.Button,
      "default": null
    },
    // 冠军奖杯节点
    trophyNode: {
      type: cc.Node,
      "default": null
    },
    // 冠军发光效果节点
    championGlowNode: {
      type: cc.Node,
      "default": null
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化数据
    this._data = null;
    this._top3 = [];
    this._top20 = [];
    this._myRank = 0;
    this._myMatchCoin = 0;

    // 🔧【新增】检查是否需要动态创建UI（prefab不存在时）
    this._checkAndCreateDynamicUI();

    // 注册按钮事件
    if (this.confirmBtn) {
      this.confirmBtn.node.on('click', this.onConfirmClick, this);
    }
  },
  start: function start() {
    // 启动冠军特效动画
    this._startChampionEffects();
  },
  /**
   * 🔧【新增】检查并动态创建UI（prefab不存在时）
   */
  _checkAndCreateDynamicUI: function _checkAndCreateDynamicUI() {
    // 如果关键节点不存在，说明prefab未正确加载，需要动态创建UI
    if (!this.championNode || !this.runnerUpNode || !this.thirdPlaceNode) {
      console.log("🏆 [TournamentFinalRankDialog] 检测到prefab未加载，动态创建UI");
      this._createDynamicUI();
    }
  },
  /**
   * 🔧【新增】动态创建完整的弹窗UI
   */
  _createDynamicUI: function _createDynamicUI() {
    var canvas = cc.find('Canvas');
    if (!canvas) {
      console.error("找不到Canvas节点");
      return;
    }
    var screenWidth = 1280;
    var screenHeight = 720;

    // 设置当前节点为全屏遮罩
    this.node.setContentSize(screenWidth, screenHeight);
    this.node.setPosition(0, 0);

    // 添加半透明背景
    var bgNode = new cc.Node("Background");
    bgNode.setContentSize(screenWidth, screenHeight);
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = new cc.Color(0, 0, 0, 180);
    bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
    bgGraphics.fill();
    bgNode.parent = this.node;

    // 主弹窗容器 - 增大尺寸以容纳所有元素
    var dialogNode = new cc.Node("DialogContainer");
    dialogNode.setContentSize(1000, 650);
    dialogNode.setPosition(0, 0);

    // 弹窗背景
    var dialogBg = new cc.Node("DialogBg");
    var dialogBgGraphics = dialogBg.addComponent(cc.Graphics);
    dialogBgGraphics.fillColor = new cc.Color(25, 35, 60, 250);
    dialogBgGraphics.roundRect(-500, -325, 1000, 650, 25);
    dialogBgGraphics.fill();
    dialogBgGraphics.strokeColor = new cc.Color(180, 140, 60);
    dialogBgGraphics.lineWidth = 4;
    dialogBgGraphics.roundRect(-500, -325, 1000, 650, 25);
    dialogBgGraphics.stroke();
    dialogBg.parent = dialogNode;
    dialogNode.parent = this.node;

    // ========== 标题区域 ==========
    var titleNode = new cc.Node("TitleNode");
    titleNode.setPosition(0, 280); // 上移

    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "🏆 比赛结束 🏆";
    titleLabel.fontSize = 40;
    titleLabel.lineHeight = 48;
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = new cc.Color(255, 215, 0);
    var titleOutline = titleNode.addComponent(cc.LabelOutline);
    titleOutline.color = new cc.Color(100, 60, 0);
    titleOutline.width = 3;
    titleNode.parent = dialogNode;

    // ========== 期号和参赛人数 ==========
    this._periodNoNode = new cc.Node("PeriodNoNode");
    this._periodNoNode.setPosition(0, 230); // 上移
    var periodLabel = this._periodNoNode.addComponent(cc.Label);
    periodLabel.string = "第---期赛事结束";
    periodLabel.fontSize = 26;
    periodLabel.lineHeight = 32;
    this._periodNoNode.color = new cc.Color(200, 200, 220);
    this._periodNoNode.parent = dialogNode;
    this.periodNoLabel = periodLabel;
    this._totalPlayersNode = new cc.Node("TotalPlayersNode");
    this._totalPlayersNode.setPosition(0, 195); // 上移
    var totalLabel = this._totalPlayersNode.addComponent(cc.Label);
    totalLabel.string = "共0人参赛";
    totalLabel.fontSize = 22;
    totalLabel.lineHeight = 28;
    this._totalPlayersNode.color = new cc.Color(180, 180, 200);
    this._totalPlayersNode.parent = dialogNode;
    this.totalPlayersLabel = totalLabel;

    // ========== 前三名领奖台 ==========
    // 🔧【修复】优化布局间距，避免元素挤在一起
    this._createTop3Podium(dialogNode);

    // ========== 我的排名区域 ==========
    // 🔧【修复】排名文本框文字上下居中
    this._createMyRankArea(dialogNode);

    // ========== 确认按钮 ==========
    this._createConfirmButton(dialogNode);
    console.log("🏆 [TournamentFinalRankDialog] 动态UI创建完成");
  },
  /**
   * 🔧【修复】创建前三名领奖台
   * 布局优化：确保冠军居中高亮，亚季军对称分布
   */
  _createTop3Podium: function _createTop3Podium(parentNode) {
    // 领奖台Y坐标基准 - 整体上移，留出更多空间
    var podiumY = 50;

    // 水平间距 - 增大间距避免重叠
    var spacingX = 280;

    // 冠军（中间，最大，位置最高）
    this.championNode = this._createPodiumItem(1, 0, podiumY + 40, 1.15);
    this.championNode.parent = parentNode;

    // 亚军（左侧，位置略低）
    this.runnerUpNode = this._createPodiumItem(2, -spacingX, podiumY, 1.0);
    this.runnerUpNode.parent = parentNode;

    // 季军（右侧，位置略低）
    this.thirdPlaceNode = this._createPodiumItem(3, spacingX, podiumY, 1.0);
    this.thirdPlaceNode.parent = parentNode;

    // 创建领奖台底部
    var podiumBaseY = podiumY - 100;
    this._createPodiumBase(parentNode, podiumBaseY);
  },
  /**
   * 🔧【修复】创建单个领奖台项目
   * 布局顺序（从上到下）：名次 → 头像 → 昵称 → 金币
   * 修复：增大元素间距，确保不挤在一起
   */
  _createPodiumItem: function _createPodiumItem(rank, x, y, scale) {
    var node = new cc.Node("PodiumItem_" + rank);
    node.setPosition(x, y);
    node.scale = scale || 1;

    // ========== 布局计算（修复间距）==========
    // 以头像中心为基准(Y=0)，其他元素相对定位
    // 从上到下依次排列：名次 → 头像 → 昵称 → 金币
    // 🔧【修复】增大各元素之间的间距
    var layoutConfig = {
      rankY: 65,
      // 名次Y坐标（头像上方65px，增大间距）
      avatarY: 0,
      // 头像Y坐标（基准位置）
      nameY: -60,
      // 昵称Y坐标（头像下方60px，增大间距）
      coinY: -90 // 金币Y坐标（昵称下方30px，增大间距）
    };

    // ========== 名次标签（最上面）==========
    var rankLabelNode = new cc.Node("RankLabel");
    rankLabelNode.setPosition(0, layoutConfig.rankY);
    var rankLabel = rankLabelNode.addComponent(cc.Label);
    rankLabel.string = this._getRankText(rank);
    rankLabel.fontSize = 22;
    rankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    rankLabelNode.color = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(200, 200, 220);
    var rankOutline = rankLabelNode.addComponent(cc.LabelOutline);
    rankOutline.color = new cc.Color(50, 50, 80);
    rankOutline.width = 2;
    rankLabelNode.parent = node;

    // ========== 头像区域（名次下方）==========
    // 🔧【修复】根据排名调整头像大小
    var avatarSize = rank === 1 ? 70 : 60; // 冠军头像更大
    var avatarRadius = avatarSize / 2 + 2;
    var avatarContainer = new cc.Node("AvatarContainer");
    avatarContainer.setPosition(0, layoutConfig.avatarY);
    avatarContainer.setContentSize(avatarSize, avatarSize);

    // 头像背景（圆形）
    var avatarBg = new cc.Node("AvatarBg");
    var avatarBgGraphics = avatarBg.addComponent(cc.Graphics);
    avatarBgGraphics.fillColor = new cc.Color(60, 70, 100);
    avatarBgGraphics.circle(0, 0, avatarRadius);
    avatarBgGraphics.fill();
    avatarBgGraphics.strokeColor = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(150, 150, 180);
    avatarBgGraphics.lineWidth = rank === 1 ? 3 : 2;
    avatarBgGraphics.circle(0, 0, avatarRadius);
    avatarBgGraphics.stroke();
    avatarBg.parent = avatarContainer;

    // 头像精灵
    var avatarSpriteNode = new cc.Node("AvatarSprite");
    var avatarSprite = avatarSpriteNode.addComponent(cc.Sprite);
    avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    avatarSpriteNode.setContentSize(avatarSize - 4, avatarSize - 4);
    avatarSpriteNode.parent = avatarContainer;
    avatarContainer.parent = node;

    // ========== 昵称标签（头像下方）==========
    // 🔧【修复】增大字体，限制宽度防止溢出
    var nameLabelNode = new cc.Node("NameLabel");
    nameLabelNode.setPosition(0, layoutConfig.nameY);
    nameLabelNode.setContentSize(120, 30); // 限制宽度
    var nameLabel = nameLabelNode.addComponent(cc.Label);
    nameLabel.string = "玩家昵称";
    nameLabel.fontSize = rank === 1 ? 20 : 18; // 冠军字体稍大
    nameLabel.lineHeight = 24;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    nameLabel.overflow = cc.Label.Overflow.CLAMP; // 防止溢出
    nameLabelNode.color = new cc.Color(255, 255, 255);
    var nameOutline = nameLabelNode.addComponent(cc.LabelOutline);
    nameOutline.color = new cc.Color(30, 30, 50);
    nameOutline.width = 1;
    nameLabelNode.parent = node;

    // ========== 金币标签（昵称下方）==========
    // 🔧【修复】增大字体和间距，更醒目
    var coinLabelNode = new cc.Node("CoinLabel");
    coinLabelNode.setPosition(0, layoutConfig.coinY);
    var coinLabel = coinLabelNode.addComponent(cc.Label);
    coinLabel.string = "0金币";
    coinLabel.fontSize = rank === 1 ? 18 : 16; // 冠军字体稍大
    coinLabel.lineHeight = 20;
    coinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    coinLabelNode.color = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(255, 200, 100); // 冠军金色
    var coinOutline = coinLabelNode.addComponent(cc.LabelOutline);
    coinOutline.color = new cc.Color(80, 50, 0);
    coinOutline.width = 1;
    coinLabelNode.parent = node;
    return node;
  },
  /**
   * 🔧【修复】创建领奖台底部
   * 修复：调整位置与领奖台项目对齐
   */
  _createPodiumBase: function _createPodiumBase(parentNode, y) {
    var spacingX = 280; // 与领奖台项目间距一致

    // 冠军台（最高，最宽）
    var championBase = new cc.Node("ChampionBase");
    championBase.setPosition(0, y - 20); // 对齐冠军位置
    var cg1 = championBase.addComponent(cc.Graphics);
    cg1.fillColor = new cc.Color(180, 140, 60, 200);
    cg1.roundRect(-80, -30, 160, 60, 10);
    cg1.fill();
    cg1.strokeColor = new cc.Color(220, 180, 80);
    cg1.lineWidth = 2;
    cg1.roundRect(-80, -30, 160, 60, 10);
    cg1.stroke();
    championBase.parent = parentNode;

    // 亚军台（中等）
    var runnerUpBase = new cc.Node("RunnerUpBase");
    runnerUpBase.setPosition(-spacingX, y - 30); // 对齐亚军位置
    var cg2 = runnerUpBase.addComponent(cc.Graphics);
    cg2.fillColor = new cc.Color(120, 130, 150, 200);
    cg2.roundRect(-65, -25, 130, 50, 8);
    cg2.fill();
    cg2.strokeColor = new cc.Color(160, 170, 190);
    cg2.lineWidth = 2;
    cg2.roundRect(-65, -25, 130, 50, 8);
    cg2.stroke();
    runnerUpBase.parent = parentNode;

    // 季军台（最低）
    var thirdBase = new cc.Node("ThirdBase");
    thirdBase.setPosition(spacingX, y - 30); // 对齐季军位置
    var cg3 = thirdBase.addComponent(cc.Graphics);
    cg3.fillColor = new cc.Color(150, 110, 90, 200);
    cg3.roundRect(-65, -25, 130, 50, 8);
    cg3.fill();
    cg3.strokeColor = new cc.Color(180, 140, 110);
    cg3.lineWidth = 2;
    cg3.roundRect(-65, -25, 130, 50, 8);
    cg3.stroke();
    thirdBase.parent = parentNode;
  },
  /**
   * 🔧【修复】创建我的排名区域
   * 修复：调整位置、居中对齐、增大容器尺寸
   */
  _createMyRankArea: function _createMyRankArea(parentNode) {
    var container = new cc.Node("MyRankContainer");
    container.setPosition(0, -200); // 下移避免与领奖台重叠
    container.setContentSize(600, 60); // 增大容器尺寸

    // 背景框 - 更宽更清晰
    var bgNode = new cc.Node("Bg");
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = new cc.Color(40, 50, 80, 230);
    bgGraphics.roundRect(-300, -30, 600, 60, 12);
    bgGraphics.fill();
    bgGraphics.strokeColor = new cc.Color(100, 120, 160);
    bgGraphics.lineWidth = 2;
    bgGraphics.roundRect(-300, -30, 600, 60, 12);
    bgGraphics.stroke();
    bgNode.parent = container;

    // 我的排名标签 - 居中对齐
    var myRankNode = new cc.Node("MyRankLabel");
    myRankNode.setPosition(-140, 0); // 左侧位置
    myRankNode.setContentSize(200, 40);
    var myRankLabel = myRankNode.addComponent(cc.Label);
    myRankLabel.string = "我的排名：第--名";
    myRankLabel.fontSize = 22;
    myRankLabel.lineHeight = 28;
    myRankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    myRankLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    myRankNode.color = new cc.Color(100, 200, 255);
    myRankNode.parent = container;
    this.myRankLabel = myRankLabel;

    // 分隔符
    var separatorNode = new cc.Node("Separator");
    separatorNode.setPosition(0, 0);
    var sepLabel = separatorNode.addComponent(cc.Label);
    sepLabel.string = "|";
    sepLabel.fontSize = 24;
    sepLabel.lineHeight = 28;
    separatorNode.color = new cc.Color(150, 150, 180);
    separatorNode.parent = container;

    // 金币标签
    var myCoinNode = new cc.Node("MyCoinLabel");
    myCoinNode.setPosition(150, 0); // 右侧位置
    myCoinNode.setContentSize(200, 40);
    var myCoinLabel = myCoinNode.addComponent(cc.Label);
    myCoinLabel.string = "比赛金币：0";
    myCoinLabel.fontSize = 22;
    myCoinLabel.lineHeight = 28;
    myCoinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    myCoinLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    myCoinNode.color = new cc.Color(255, 200, 100);
    myCoinNode.parent = container;
    this.myCoinLabel = myCoinLabel;
    container.parent = parentNode;
  },
  /**
   * 🔧【修复】创建确认按钮
   * 修复：调整位置，确保不与状态栏重叠，增加按钮样式
   */
  _createConfirmButton: function _createConfirmButton(parentNode) {
    var btnNode = new cc.Node("ConfirmBtn");
    btnNode.setPosition(0, -270); // 下移确保与状态栏有足够间距
    btnNode.setContentSize(200, 55);

    // 按钮背景 - 更醒目的样式
    var btnBg = btnNode.addComponent(cc.Graphics);
    btnBg.fillColor = new cc.Color(80, 160, 80); // 绿色按钮
    btnBg.roundRect(-100, -27.5, 200, 55, 12);
    btnBg.fill();
    btnBg.strokeColor = new cc.Color(120, 200, 120);
    btnBg.lineWidth = 3;
    btnBg.roundRect(-100, -27.5, 200, 55, 12);
    btnBg.stroke();

    // 按钮文字
    var btnLabelNode = new cc.Node("Label");
    var btnLabel = btnLabelNode.addComponent(cc.Label);
    btnLabel.string = "确 定";
    btnLabel.fontSize = 26;
    btnLabel.lineHeight = 32;
    btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    btnLabelNode.color = new cc.Color(255, 255, 255);
    var btnOutline = btnLabelNode.addComponent(cc.LabelOutline);
    btnOutline.color = new cc.Color(30, 80, 30);
    btnOutline.width = 2;
    btnLabelNode.parent = btnNode;

    // 添加按钮组件
    var btn = btnNode.addComponent(cc.Button);
    btnNode.on('click', this.onConfirmClick, this);
    btnNode.parent = parentNode;
    this.confirmBtn = btn;
  },
  // ============================================================
  // 公共方法
  // ============================================================

  /**
   * 设置数据
   * @param {Object} data - { period_no, total_players, top3, top20, my_rank, my_match_coin }
   */
  setData: function setData(data) {
    console.log("🏆 [TournamentFinalRankDialog] 收到数据:", JSON.stringify(data));
    this._data = data;
    this._periodNo = data.period_no || "";
    this._totalPlayers = data.total_players || 0;
    this._top3 = data.top3 || [];
    this._top20 = data.top20 || [];
    this._myRank = data.my_rank || 0;
    this._myMatchCoin = data.my_match_coin || 0;

    // 🔧【调试】打印TOP3数据
    console.log("🏆 [TournamentFinalRankDialog] TOP3数据:");
    for (var i = 0; i < this._top3.length; i++) {
      console.log("  #" + (i + 1) + ":", this._top3[i].player_name, "金币:", this._top3[i].match_coin, "机器人:", this._top3[i].is_robot);
    }
    this._updateUI();
  },
  // ============================================================
  // UI更新
  // ============================================================

  _updateUI: function _updateUI() {
    // 更新期号
    if (this.periodNoLabel) {
      this.periodNoLabel.string = "第" + this._periodNo + "期赛事结束";
    }

    // 更新总参赛人数
    if (this.totalPlayersLabel) {
      this.totalPlayersLabel.string = "共" + this._totalPlayers + "人参赛";
    }

    // 更新前三名
    this._updateTop3();

    // 更新我的排名
    if (this.myRankLabel) {
      if (this._myRank > 0) {
        this.myRankLabel.string = "我的排名：第" + this._myRank + "名";
      } else {
        this.myRankLabel.string = "我的排名：未上榜";
      }
    }

    // 更新我的金币
    if (this.myCoinLabel) {
      this.myCoinLabel.string = "比赛金币：" + this._myMatchCoin;
    }
  },
  _updateTop3: function _updateTop3() {
    // 更新冠军
    if (this._top3.length >= 1 && this.championNode) {
      this._updatePodiumNode(this.championNode, this._top3[0], 1);
    }

    // 更新亚军
    if (this._top3.length >= 2 && this.runnerUpNode) {
      this._updatePodiumNode(this.runnerUpNode, this._top3[1], 2);
    }

    // 更新季军
    if (this._top3.length >= 3 && this.thirdPlaceNode) {
      this._updatePodiumNode(this.thirdPlaceNode, this._top3[2], 3);
    }
  },
  /**
   * 更新领奖台节点
   * @param {cc.Node} node - 领奖台节点
   * @param {Object} data - 玩家数据 { player_name, match_coin, avatar, is_robot, player_id }
   * @param {number} rank - 排名
   */
  _updatePodiumNode: function _updatePodiumNode(node, data, rank) {
    // 名次标签
    var rankLabel = node.getChildByName("RankLabel");
    if (rankLabel) {
      var label = rankLabel.getComponent(cc.Label);
      if (label) {
        label.string = this._getRankText(rank);
      }
    }

    // 🔧【修复】处理机器人昵称显示
    var displayName = data.player_name || "玩家";
    if (data.is_robot) {
      displayName = this._getRobotDisplayName(data.player_id, data.player_name);
    }

    // 昵称标签
    var nameLabel = node.getChildByName("NameLabel");
    if (nameLabel) {
      var label = nameLabel.getComponent(cc.Label);
      if (label) {
        label.string = displayName;
      }
    }

    // 金币标签
    var coinLabel = node.getChildByName("CoinLabel");
    if (coinLabel) {
      var label = coinLabel.getComponent(cc.Label);
      if (label) {
        label.string = this._formatCoin(data.match_coin || 0) + "金币";
      }
    }

    // 🔧【新增】加载头像
    var avatarContainer = node.getChildByName("AvatarContainer");
    if (avatarContainer) {
      var avatarSpriteNode = avatarContainer.getChildByName("AvatarSprite");
      if (avatarSpriteNode) {
        var avatarSprite = avatarSpriteNode.getComponent(cc.Sprite);
        if (avatarSprite) {
          this._loadAvatar(avatarSprite, data.avatar, data.is_robot);
        }
      }
    }
    console.log("🏆 [_updatePodiumNode] 排名#" + rank + ": " + displayName + ", 金币=" + data.match_coin + ", 机器人=" + data.is_robot);
  },
  /**
   * 🔧【新增】加载头像
   */
  _loadAvatar: function _loadAvatar(sprite, avatarUrl, isRobot) {
    if (!sprite) return;

    // 机器人使用默认头像
    if (isRobot) {
      var robotAvatarIndex = Math.floor(Math.random() * 3) + 1;
      var defaultPath = "UI/headimage/avatar_" + robotAvatarIndex;
      cc.resources.load(defaultPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 空值处理
    if (!avatarUrl || avatarUrl === "") {
      cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 远程URL
    if (avatarUrl.indexOf("http") === 0 || avatarUrl.indexOf("//") === 0) {
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (err || !texture) {
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        var spriteFrame = new cc.SpriteFrame(texture);
        sprite.spriteFrame = spriteFrame;
      });
    } else {
      // 本地资源
      var localPath = "UI/headimage/" + avatarUrl;
      cc.resources.load(localPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (err || !spriteFrame) {
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        sprite.spriteFrame = spriteFrame;
      });
    }
  },
  /**
   * 🔧【新增】格式化金币显示
   */
  _formatCoin: function _formatCoin(coin) {
    if (coin >= 10000) {
      return (coin / 10000).toFixed(1) + "万";
    }
    return coin.toString();
  },
  // ============================================================
  // 动画效果
  // ============================================================

  _startChampionEffects: function _startChampionEffects() {
    // 奖杯弹跳动画
    if (this.trophyNode) {
      var jumpUp = cc.moveBy(0.5, cc.v2(0, 10));
      var jumpDown = cc.moveBy(0.5, cc.v2(0, -10));
      var sequence = cc.sequence(jumpUp, jumpDown);
      var repeat = cc.repeatForever(sequence);
      this.trophyNode.runAction(repeat);
    }

    // 发光效果闪烁
    if (this.championGlowNode) {
      var fadeIn = cc.fadeIn(0.5);
      var fadeOut = cc.fadeOut(0.5);
      var sequence = cc.sequence(fadeIn, fadeOut);
      var repeat = cc.repeatForever(sequence);
      this.championGlowNode.runAction(repeat);
    }

    // 冠军节点缩放呼吸效果
    if (this.championNode) {
      var scaleUp = cc.scaleTo(0.8, 1.05);
      var scaleDown = cc.scaleTo(0.8, 1.0);
      var sequence = cc.sequence(scaleUp, scaleDown);
      var repeat = cc.repeatForever(sequence);
      this.championNode.runAction(repeat);
    }
  },
  _stopChampionEffects: function _stopChampionEffects() {
    if (this.trophyNode) {
      this.trophyNode.stopAllActions();
    }
    if (this.championGlowNode) {
      this.championGlowNode.stopAllActions();
    }
    if (this.championNode) {
      this.championNode.stopAllActions();
    }
  },
  // ============================================================
  // 按钮事件
  // ============================================================

  onConfirmClick: function onConfirmClick() {
    console.log("🏆 [TournamentFinalRank] 点击确认，返回大厅");

    // 停止动画
    this._stopChampionEffects();

    // 关闭弹窗
    this.node.destroy();

    // 返回大厅
    cc.director.loadScene("hallScene");
  },
  // ============================================================
  // 辅助方法
  // ============================================================

  _getRankText: function _getRankText(rank) {
    switch (rank) {
      case 1:
        return "🥇 冠军";
      case 2:
        return "🥈 亚军";
      case 3:
        return "🥉 季军";
      default:
        return "第" + rank + "名";
    }
  },
  /**
   * 🔧【新增】获取机器人显示名称
   * @param {String} playerId - 玩家ID
   * @param {String} originalName - 原始昵称
   * @returns {String} 显示名称
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGVyaW9kTm9MYWJlbCIsInR5cGUiLCJMYWJlbCIsInRvdGFsUGxheWVyc0xhYmVsIiwiY2hhbXBpb25Ob2RlIiwiTm9kZSIsInJ1bm5lclVwTm9kZSIsInRoaXJkUGxhY2VOb2RlIiwidG9wMjBTY3JvbGxWaWV3IiwiU2Nyb2xsVmlldyIsInJhbmtJdGVtUHJlZmFiIiwiUHJlZmFiIiwibXlSYW5rTGFiZWwiLCJteUNvaW5MYWJlbCIsImNvbmZpcm1CdG4iLCJCdXR0b24iLCJ0cm9waHlOb2RlIiwiY2hhbXBpb25HbG93Tm9kZSIsIm9uTG9hZCIsIl9kYXRhIiwiX3RvcDMiLCJfdG9wMjAiLCJfbXlSYW5rIiwiX215TWF0Y2hDb2luIiwiX2NoZWNrQW5kQ3JlYXRlRHluYW1pY1VJIiwibm9kZSIsIm9uIiwib25Db25maXJtQ2xpY2siLCJzdGFydCIsIl9zdGFydENoYW1waW9uRWZmZWN0cyIsImNvbnNvbGUiLCJsb2ciLCJfY3JlYXRlRHluYW1pY1VJIiwiY2FudmFzIiwiZmluZCIsImVycm9yIiwic2NyZWVuV2lkdGgiLCJzY3JlZW5IZWlnaHQiLCJzZXRDb250ZW50U2l6ZSIsInNldFBvc2l0aW9uIiwiYmdOb2RlIiwiYmdHcmFwaGljcyIsImFkZENvbXBvbmVudCIsIkdyYXBoaWNzIiwiZmlsbENvbG9yIiwiQ29sb3IiLCJyZWN0IiwiZmlsbCIsInBhcmVudCIsImRpYWxvZ05vZGUiLCJkaWFsb2dCZyIsImRpYWxvZ0JnR3JhcGhpY3MiLCJyb3VuZFJlY3QiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsInRpdGxlTm9kZSIsInRpdGxlTGFiZWwiLCJzdHJpbmciLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJDRU5URVIiLCJjb2xvciIsInRpdGxlT3V0bGluZSIsIkxhYmVsT3V0bGluZSIsIndpZHRoIiwiX3BlcmlvZE5vTm9kZSIsInBlcmlvZExhYmVsIiwiX3RvdGFsUGxheWVyc05vZGUiLCJ0b3RhbExhYmVsIiwiX2NyZWF0ZVRvcDNQb2RpdW0iLCJfY3JlYXRlTXlSYW5rQXJlYSIsIl9jcmVhdGVDb25maXJtQnV0dG9uIiwicGFyZW50Tm9kZSIsInBvZGl1bVkiLCJzcGFjaW5nWCIsIl9jcmVhdGVQb2RpdW1JdGVtIiwicG9kaXVtQmFzZVkiLCJfY3JlYXRlUG9kaXVtQmFzZSIsInJhbmsiLCJ4IiwieSIsInNjYWxlIiwibGF5b3V0Q29uZmlnIiwicmFua1kiLCJhdmF0YXJZIiwibmFtZVkiLCJjb2luWSIsInJhbmtMYWJlbE5vZGUiLCJyYW5rTGFiZWwiLCJfZ2V0UmFua1RleHQiLCJyYW5rT3V0bGluZSIsImF2YXRhclNpemUiLCJhdmF0YXJSYWRpdXMiLCJhdmF0YXJDb250YWluZXIiLCJhdmF0YXJCZyIsImF2YXRhckJnR3JhcGhpY3MiLCJjaXJjbGUiLCJhdmF0YXJTcHJpdGVOb2RlIiwiYXZhdGFyU3ByaXRlIiwiU3ByaXRlIiwic2l6ZU1vZGUiLCJTaXplTW9kZSIsIkNVU1RPTSIsIm5hbWVMYWJlbE5vZGUiLCJuYW1lTGFiZWwiLCJvdmVyZmxvdyIsIk92ZXJmbG93IiwiQ0xBTVAiLCJuYW1lT3V0bGluZSIsImNvaW5MYWJlbE5vZGUiLCJjb2luTGFiZWwiLCJjb2luT3V0bGluZSIsImNoYW1waW9uQmFzZSIsImNnMSIsInJ1bm5lclVwQmFzZSIsImNnMiIsInRoaXJkQmFzZSIsImNnMyIsImNvbnRhaW5lciIsIm15UmFua05vZGUiLCJ2ZXJ0aWNhbEFsaWduIiwiVmVydGljYWxBbGlnbiIsInNlcGFyYXRvck5vZGUiLCJzZXBMYWJlbCIsIm15Q29pbk5vZGUiLCJidG5Ob2RlIiwiYnRuQmciLCJidG5MYWJlbE5vZGUiLCJidG5MYWJlbCIsImJ0bk91dGxpbmUiLCJidG4iLCJzZXREYXRhIiwiZGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJfcGVyaW9kTm8iLCJwZXJpb2Rfbm8iLCJfdG90YWxQbGF5ZXJzIiwidG90YWxfcGxheWVycyIsInRvcDMiLCJ0b3AyMCIsIm15X3JhbmsiLCJteV9tYXRjaF9jb2luIiwiaSIsImxlbmd0aCIsInBsYXllcl9uYW1lIiwibWF0Y2hfY29pbiIsImlzX3JvYm90IiwiX3VwZGF0ZVVJIiwiX3VwZGF0ZVRvcDMiLCJfdXBkYXRlUG9kaXVtTm9kZSIsImdldENoaWxkQnlOYW1lIiwibGFiZWwiLCJnZXRDb21wb25lbnQiLCJkaXNwbGF5TmFtZSIsIl9nZXRSb2JvdERpc3BsYXlOYW1lIiwicGxheWVyX2lkIiwiX2Zvcm1hdENvaW4iLCJfbG9hZEF2YXRhciIsImF2YXRhciIsInNwcml0ZSIsImF2YXRhclVybCIsImlzUm9ib3QiLCJyb2JvdEF2YXRhckluZGV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZGVmYXVsdFBhdGgiLCJyZXNvdXJjZXMiLCJsb2FkIiwiU3ByaXRlRnJhbWUiLCJlcnIiLCJzcHJpdGVGcmFtZSIsImluZGV4T2YiLCJhc3NldE1hbmFnZXIiLCJsb2FkUmVtb3RlIiwiZXh0IiwidGV4dHVyZSIsImVycjIiLCJmYWxsYmFja1Nwcml0ZSIsImxvY2FsUGF0aCIsImNvaW4iLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJqdW1wVXAiLCJtb3ZlQnkiLCJ2MiIsImp1bXBEb3duIiwic2VxdWVuY2UiLCJyZXBlYXQiLCJyZXBlYXRGb3JldmVyIiwicnVuQWN0aW9uIiwiZmFkZUluIiwiZmFkZU91dCIsInNjYWxlVXAiLCJzY2FsZVRvIiwic2NhbGVEb3duIiwiX3N0b3BDaGFtcGlvbkVmZmVjdHMiLCJzdG9wQWxsQWN0aW9ucyIsImRlc3Ryb3kiLCJkaXJlY3RvciIsImxvYWRTY2VuZSIsInBsYXllcklkIiwib3JpZ2luYWxOYW1lIiwicm9ib3RJbmRleCIsImxhc3RDaGFyIiwic2xpY2UiLCJwYXJzZUlu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O01BQ2xCLEtBQUssQ0FBQztRQUNGLE9BQU8sT0FBTztNQUNsQixLQUFLLENBQUM7UUFDRixPQUFPLE9BQU87TUFDbEI7UUFDSSxPQUFPLEdBQUcsR0FBR0EsSUFBSSxHQUFHLEdBQUc7SUFBQTtFQUVuQyxDQUFDO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0k2RSxvQkFBb0IsRUFBRSxTQUFBQSxxQkFBUytDLFFBQVEsRUFBRUMsWUFBWSxFQUFFO0lBQ25EO0lBQ0EsSUFBSUEsWUFBWSxJQUFJQSxZQUFZLENBQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO01BQ3BELE9BQU84QixZQUFZO0lBQ3ZCOztJQUVBO0lBQ0EsSUFBSUMsVUFBVSxHQUFHLENBQUM7SUFDbEIsSUFBSUYsUUFBUSxFQUFFO01BQ1YsSUFBSUcsUUFBUSxHQUFHSCxRQUFRLENBQUNuQixRQUFRLEVBQUUsQ0FBQ3VCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUM1Q0YsVUFBVSxHQUFHRyxRQUFRLENBQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDeEM7SUFFQSxPQUFPLE1BQU0sR0FBR0QsVUFBVSxHQUFHLEdBQUc7RUFDcEM7QUFDSixDQUFDLENBQUMiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyAtIOernuaKgOWcuuWGs+i1m+WGoOWGm+aOkuihjOamnOW8ueeql1xuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOaYvuekuuacn+WPt+WSjOavlOi1m+e7k+adn+agh+mimFxuICogMi4g5YmN5LiJ5ZCN6aKG5aWW5Y+w5bGV56S677yI5Yag5Yab5pyA5aSn77yM5bGF5Lit6auY5Lqu77yJXG4gKiAzLiBUT1AyMCBTY3JvbGxWaWV35YiX6KGoXG4gKiA0LiDmmL7npLrmjpLlkI3jgIHlpLTlg4/jgIHmmLXnp7DjgIHmnIDnu4jph5HluIFcbiAqIDUuIOehruiupOaMiemSrui/lOWbnuWkp+WOhVxuICogXG4gKiDorr7orqHpo47moLzvvJrkuK3lm73po47mlpflnLDkuLvnq57mioDlnLogLSDph5HoibIgKyDnuqLoibJcbiAqIOWGoOWGm+eJueaViO+8muWPkeWFieOAgeeykuWtkOOAgeWlluadr+WKqOeUu1xuICogXG4gKiDwn5Sn44CQ5L+u5aSN44CR5LyY5YyW5biD5bGA77ya5L+u5aSN5ZCN5qyh44CB5aS05YOP44CB55So5oi35ZCN5oyk5Zyo5LiA6LW355qE6Zeu6aKYXG4gKi9cblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5pyf5Y+35qCH562+XG4gICAgICAgIHBlcmlvZE5vTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmgLvlj4LotZvkurrmlbDmoIfnrb5cbiAgICAgICAgdG90YWxQbGF5ZXJzTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlhqDlhpvoioLngrlcbiAgICAgICAgY2hhbXBpb25Ob2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDkuprlhpvoioLngrlcbiAgICAgICAgcnVubmVyVXBOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlraPlhpvoioLngrlcbiAgICAgICAgdGhpcmRQbGFjZU5vZGU6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGUsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRPUDIwIFNjcm9sbFZpZXdcbiAgICAgICAgdG9wMjBTY3JvbGxWaWV3OiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5TY3JvbGxWaWV3LFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmjpLooYzmppxpdGVt5qih5p2/XG4gICAgICAgIHJhbmtJdGVtUHJlZmFiOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWIsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIkeeahOaOkuWQjeagh+etvlxuICAgICAgICBteVJhbmtMYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIkeeahOmHkeW4geagh+etvlxuICAgICAgICBteUNvaW5MYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOehruiupOaMiemSrlxuICAgICAgICBjb25maXJtQnRuOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5CdXR0b24sXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWGoOWGm+Wlluadr+iKgueCuVxuICAgICAgICB0cm9waHlOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlhqDlhpvlj5HlhYnmlYjmnpzoioLngrlcbiAgICAgICAgY2hhbXBpb25HbG93Tm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMSUZFLUNZQ0xFIENBTExCQUNLUzpcblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIC8vIOWIneWni+WMluaVsOaNrlxuICAgICAgICB0aGlzLl9kYXRhID0gbnVsbFxuICAgICAgICB0aGlzLl90b3AzID0gW11cbiAgICAgICAgdGhpcy5fdG9wMjAgPSBbXVxuICAgICAgICB0aGlzLl9teVJhbmsgPSAwXG4gICAgICAgIHRoaXMuX215TWF0Y2hDb2luID0gMFxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XmmK/lkKbpnIDopoHliqjmgIHliJvlu7pVSe+8iHByZWZhYuS4jeWtmOWcqOaXtu+8iVxuICAgICAgICB0aGlzLl9jaGVja0FuZENyZWF0ZUR5bmFtaWNVSSgpXG5cbiAgICAgICAgLy8g5rOo5YaM5oyJ6ZKu5LqL5Lu2XG4gICAgICAgIGlmICh0aGlzLmNvbmZpcm1CdG4pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlybUJ0bi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25Db25maXJtQ2xpY2ssIHRoaXMpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge1xuICAgICAgICAvLyDlkK/liqjlhqDlhpvnibnmlYjliqjnlLtcbiAgICAgICAgdGhpcy5fc3RhcnRDaGFtcGlvbkVmZmVjdHMoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qOA5p+l5bm25Yqo5oCB5Yib5bu6VUnvvIhwcmVmYWLkuI3lrZjlnKjml7bvvIlcbiAgICAgKi9cbiAgICBfY2hlY2tBbmRDcmVhdGVEeW5hbWljVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlpoLmnpzlhbPplK7oioLngrnkuI3lrZjlnKjvvIzor7TmmI5wcmVmYWLmnKrmraPnoa7liqDovb3vvIzpnIDopoHliqjmgIHliJvlu7pVSVxuICAgICAgICBpZiAoIXRoaXMuY2hhbXBpb25Ob2RlIHx8ICF0aGlzLnJ1bm5lclVwTm9kZSB8fCAhdGhpcy50aGlyZFBsYWNlTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nXSDmo4DmtYvliLBwcmVmYWLmnKrliqDovb3vvIzliqjmgIHliJvlu7pVSVwiKVxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRHluYW1pY1VJKClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5Yqo5oCB5Yib5bu65a6M5pW055qE5by556qXVUlcbiAgICAgKi9cbiAgICBfY3JlYXRlRHluYW1pY1VJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoJ0NhbnZhcycpXG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5om+5LiN5YiwQ2FudmFz6IqC54K5XCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IDEyODBcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IDcyMFxuXG4gICAgICAgIC8vIOiuvue9ruW9k+WJjeiKgueCueS4uuWFqOWxj+mBrue9qVxuICAgICAgICB0aGlzLm5vZGUuc2V0Q29udGVudFNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDljYrpgI/mmI7og4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmFja2dyb3VuZFwiKVxuICAgICAgICBiZ05vZGUuc2V0Q29udGVudFNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgdmFyIGJnR3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwLCAxODApXG4gICAgICAgIGJnR3JhcGhpY3MucmVjdCgtc2NyZWVuV2lkdGgvMiwgLXNjcmVlbkhlaWdodC8yLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG5cbiAgICAgICAgLy8g5Li75by556qX5a655ZmoIC0g5aKe5aSn5bC65a+45Lul5a6557qz5omA5pyJ5YWD57SgXG4gICAgICAgIHZhciBkaWFsb2dOb2RlID0gbmV3IGNjLk5vZGUoXCJEaWFsb2dDb250YWluZXJcIilcbiAgICAgICAgZGlhbG9nTm9kZS5zZXRDb250ZW50U2l6ZSgxMDAwLCA2NTApXG4gICAgICAgIGRpYWxvZ05vZGUuc2V0UG9zaXRpb24oMCwgMClcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+iDjOaZr1xuICAgICAgICB2YXIgZGlhbG9nQmcgPSBuZXcgY2MuTm9kZShcIkRpYWxvZ0JnXCIpXG4gICAgICAgIHZhciBkaWFsb2dCZ0dyYXBoaWNzID0gZGlhbG9nQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBkaWFsb2dCZ0dyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNSwgMzUsIDYwLCAyNTApXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3Mucm91bmRSZWN0KC01MDAsIC0zMjUsIDEwMDAsIDY1MCwgMjUpXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3MuZmlsbCgpXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxNDAsIDYwKVxuICAgICAgICBkaWFsb2dCZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IDRcbiAgICAgICAgZGlhbG9nQmdHcmFwaGljcy5yb3VuZFJlY3QoLTUwMCwgLTMyNSwgMTAwMCwgNjUwLCAyNSlcbiAgICAgICAgZGlhbG9nQmdHcmFwaGljcy5zdHJva2UoKVxuICAgICAgICBkaWFsb2dCZy5wYXJlbnQgPSBkaWFsb2dOb2RlXG4gICAgICAgIGRpYWxvZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDmoIfpopjljLrln58gPT09PT09PT09PVxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZU5vZGVcIilcbiAgICAgICAgdGl0bGVOb2RlLnNldFBvc2l0aW9uKDAsIDI4MCkgIC8vIOS4iuenu1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi8J+PhiDmr5TotZvnu5PmnZ8g8J+PhlwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSA0MFxuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA0OFxuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKVxuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICB0aXRsZU91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA2MCwgMClcbiAgICAgICAgdGl0bGVPdXRsaW5lLndpZHRoID0gM1xuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gZGlhbG9nTm9kZVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5pyf5Y+35ZKM5Y+C6LWb5Lq65pWwID09PT09PT09PT1cbiAgICAgICAgdGhpcy5fcGVyaW9kTm9Ob2RlID0gbmV3IGNjLk5vZGUoXCJQZXJpb2ROb05vZGVcIilcbiAgICAgICAgdGhpcy5fcGVyaW9kTm9Ob2RlLnNldFBvc2l0aW9uKDAsIDIzMCkgIC8vIOS4iuenu1xuICAgICAgICB2YXIgcGVyaW9kTGFiZWwgPSB0aGlzLl9wZXJpb2ROb05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBwZXJpb2RMYWJlbC5zdHJpbmcgPSBcIuesrC0tLeacn+i1m+S6i+e7k+adn1wiXG4gICAgICAgIHBlcmlvZExhYmVsLmZvbnRTaXplID0gMjZcbiAgICAgICAgcGVyaW9kTGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIHRoaXMuX3BlcmlvZE5vTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjIwKVxuICAgICAgICB0aGlzLl9wZXJpb2ROb05vZGUucGFyZW50ID0gZGlhbG9nTm9kZVxuICAgICAgICB0aGlzLnBlcmlvZE5vTGFiZWwgPSBwZXJpb2RMYWJlbFxuXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVyc05vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsUGxheWVyc05vZGVcIilcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzTm9kZS5zZXRQb3NpdGlvbigwLCAxOTUpICAvLyDkuIrnp7tcbiAgICAgICAgdmFyIHRvdGFsTGFiZWwgPSB0aGlzLl90b3RhbFBsYXllcnNOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsTDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMjJcbiAgICAgICAgdG90YWxMYWJlbC5saW5lSGVpZ2h0ID0gMjhcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxODAsIDE4MCwgMjAwKVxuICAgICAgICB0aGlzLl90b3RhbFBsYXllcnNOb2RlLnBhcmVudCA9IGRpYWxvZ05vZGVcbiAgICAgICAgdGhpcy50b3RhbFBsYXllcnNMYWJlbCA9IHRvdGFsTGFiZWxcblxuICAgICAgICAvLyA9PT09PT09PT09IOWJjeS4ieWQjemihuWlluWPsCA9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvJjljJbluIPlsYDpl7Tot53vvIzpgb/lhY3lhYPntKDmjKTlnKjkuIDotbdcbiAgICAgICAgdGhpcy5fY3JlYXRlVG9wM1BvZGl1bShkaWFsb2dOb2RlKVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5oiR55qE5o6S5ZCN5Yy65Z+fID09PT09PT09PT1cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeaOkuWQjeaWh+acrOahhuaWh+Wtl+S4iuS4i+WxheS4rVxuICAgICAgICB0aGlzLl9jcmVhdGVNeVJhbmtBcmVhKGRpYWxvZ05vZGUpXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDnoa7orqTmjInpkq4gPT09PT09PT09PVxuICAgICAgICB0aGlzLl9jcmVhdGVDb25maXJtQnV0dG9uKGRpYWxvZ05vZGUpXG5cbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nXSDliqjmgIFVSeWIm+W7uuWujOaIkFwiKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5Yib5bu65YmN5LiJ5ZCN6aKG5aWW5Y+wXG4gICAgICog5biD5bGA5LyY5YyW77ya56Gu5L+d5Yag5Yab5bGF5Lit6auY5Lqu77yM5Lqa5a2j5Yab5a+556ew5YiG5biDXG4gICAgICovXG4gICAgX2NyZWF0ZVRvcDNQb2RpdW06IGZ1bmN0aW9uKHBhcmVudE5vZGUpIHtcbiAgICAgICAgLy8g6aKG5aWW5Y+wWeWdkOagh+WfuuWHhiAtIOaVtOS9k+S4iuenu++8jOeVmeWHuuabtOWkmuepuumXtFxuICAgICAgICB2YXIgcG9kaXVtWSA9IDUwXG4gICAgICAgIFxuICAgICAgICAvLyDmsLTlubPpl7Tot50gLSDlop7lpKfpl7Tot53pgb/lhY3ph43lj6BcbiAgICAgICAgdmFyIHNwYWNpbmdYID0gMjgwXG4gICAgICAgIFxuICAgICAgICAvLyDlhqDlhpvvvIjkuK3pl7TvvIzmnIDlpKfvvIzkvY3nva7mnIDpq5jvvIlcbiAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUgPSB0aGlzLl9jcmVhdGVQb2RpdW1JdGVtKDEsIDAsIHBvZGl1bVkgKyA0MCwgMS4xNSlcbiAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUucGFyZW50ID0gcGFyZW50Tm9kZVxuXG4gICAgICAgIC8vIOS6muWGm++8iOW3puS+p++8jOS9jee9rueVpeS9ju+8iVxuICAgICAgICB0aGlzLnJ1bm5lclVwTm9kZSA9IHRoaXMuX2NyZWF0ZVBvZGl1bUl0ZW0oMiwgLXNwYWNpbmdYLCBwb2RpdW1ZLCAxLjApXG4gICAgICAgIHRoaXMucnVubmVyVXBOb2RlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICAvLyDlraPlhpvvvIjlj7PkvqfvvIzkvY3nva7nlaXkvY7vvIlcbiAgICAgICAgdGhpcy50aGlyZFBsYWNlTm9kZSA9IHRoaXMuX2NyZWF0ZVBvZGl1bUl0ZW0oMywgc3BhY2luZ1gsIHBvZGl1bVksIDEuMClcbiAgICAgICAgdGhpcy50aGlyZFBsYWNlTm9kZS5wYXJlbnQgPSBwYXJlbnROb2RlXG5cbiAgICAgICAgLy8g5Yib5bu66aKG5aWW5Y+w5bqV6YOoXG4gICAgICAgIHZhciBwb2RpdW1CYXNlWSA9IHBvZGl1bVkgLSAxMDBcbiAgICAgICAgdGhpcy5fY3JlYXRlUG9kaXVtQmFzZShwYXJlbnROb2RlLCBwb2RpdW1CYXNlWSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOS/ruWkjeOAkeWIm+W7uuWNleS4qumihuWlluWPsOmhueebrlxuICAgICAqIOW4g+WxgOmhuuW6j++8iOS7juS4iuWIsOS4i++8ie+8muWQjeasoSDihpIg5aS05YOPIOKGkiDmmLXnp7Ag4oaSIOmHkeW4gVxuICAgICAqIOS/ruWkje+8muWinuWkp+WFg+e0oOmXtOi3ne+8jOehruS/neS4jeaMpOWcqOS4gOi1t1xuICAgICAqL1xuICAgIF9jcmVhdGVQb2RpdW1JdGVtOiBmdW5jdGlvbihyYW5rLCB4LCB5LCBzY2FsZSkge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyBjYy5Ob2RlKFwiUG9kaXVtSXRlbV9cIiArIHJhbmspXG4gICAgICAgIG5vZGUuc2V0UG9zaXRpb24oeCwgeSlcbiAgICAgICAgbm9kZS5zY2FsZSA9IHNjYWxlIHx8IDFcblxuICAgICAgICAvLyA9PT09PT09PT09IOW4g+WxgOiuoeeul++8iOS/ruWkjemXtOi3ne+8iT09PT09PT09PT1cbiAgICAgICAgLy8g5Lul5aS05YOP5Lit5b+D5Li65Z+65YeGKFk9MCnvvIzlhbbku5blhYPntKDnm7jlr7nlrprkvY1cbiAgICAgICAgLy8g5LuO5LiK5Yiw5LiL5L6d5qyh5o6S5YiX77ya5ZCN5qyhIOKGkiDlpLTlg48g4oaSIOaYteensCDihpIg6YeR5biBXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlop7lpKflkITlhYPntKDkuYvpl7TnmoTpl7Tot51cbiAgICAgICAgdmFyIGxheW91dENvbmZpZyA9IHtcbiAgICAgICAgICAgIHJhbmtZOiA2NSwgICAgICAgLy8g5ZCN5qyhWeWdkOagh++8iOWktOWDj+S4iuaWuTY1cHjvvIzlop7lpKfpl7Tot53vvIlcbiAgICAgICAgICAgIGF2YXRhclk6IDAsICAgICAgLy8g5aS05YOPWeWdkOagh++8iOWfuuWHhuS9jee9ru+8iVxuICAgICAgICAgICAgbmFtZVk6IC02MCwgICAgICAvLyDmmLXnp7BZ5Z2Q5qCH77yI5aS05YOP5LiL5pa5NjBweO+8jOWinuWkp+mXtOi3ne+8iVxuICAgICAgICAgICAgY29pblk6IC05MCAgICAgICAvLyDph5HluIFZ5Z2Q5qCH77yI5pi156ew5LiL5pa5MzBweO+8jOWinuWkp+mXtOi3ne+8iVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vID09PT09PT09PT0g5ZCN5qyh5qCH562+77yI5pyA5LiK6Z2i77yJPT09PT09PT09PVxuICAgICAgICB2YXIgcmFua0xhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIHJhbmtMYWJlbE5vZGUuc2V0UG9zaXRpb24oMCwgbGF5b3V0Q29uZmlnLnJhbmtZKVxuICAgICAgICB2YXIgcmFua0xhYmVsID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSB0aGlzLl9nZXRSYW5rVGV4dChyYW5rKVxuICAgICAgICByYW5rTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICByYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICByYW5rTGFiZWxOb2RlLmNvbG9yID0gcmFuayA9PT0gMSA/IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgOiBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIyMClcbiAgICAgICAgdmFyIHJhbmtPdXRsaW5lID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICByYW5rT3V0bGluZS5jb2xvciA9IG5ldyBjYy5Db2xvcig1MCwgNTAsIDgwKVxuICAgICAgICByYW5rT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgcmFua0xhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDlpLTlg4/ljLrln5/vvIjlkI3mrKHkuIvmlrnvvIk9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmoLnmja7mjpLlkI3osIPmlbTlpLTlg4/lpKflsI9cbiAgICAgICAgdmFyIGF2YXRhclNpemUgPSByYW5rID09PSAxID8gNzAgOiA2MCAgLy8g5Yag5Yab5aS05YOP5pu05aSnXG4gICAgICAgIHZhciBhdmF0YXJSYWRpdXMgPSBhdmF0YXJTaXplIC8gMiArIDJcbiAgICAgICAgXG4gICAgICAgIHZhciBhdmF0YXJDb250YWluZXIgPSBuZXcgY2MuTm9kZShcIkF2YXRhckNvbnRhaW5lclwiKVxuICAgICAgICBhdmF0YXJDb250YWluZXIuc2V0UG9zaXRpb24oMCwgbGF5b3V0Q29uZmlnLmF2YXRhclkpXG4gICAgICAgIGF2YXRhckNvbnRhaW5lci5zZXRDb250ZW50U2l6ZShhdmF0YXJTaXplLCBhdmF0YXJTaXplKVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6IOM5pmv77yI5ZyG5b2i77yJXG4gICAgICAgIHZhciBhdmF0YXJCZyA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyQmdcIilcbiAgICAgICAgdmFyIGF2YXRhckJnR3JhcGhpY3MgPSBhdmF0YXJCZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDYwLCA3MCwgMTAwKVxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmNpcmNsZSgwLCAwLCBhdmF0YXJSYWRpdXMpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3MuZmlsbCgpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSByYW5rID09PSAxID8gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKSA6IG5ldyBjYy5Db2xvcigxNTAsIDE1MCwgMTgwKVxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IHJhbmsgPT09IDEgPyAzIDogMlxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmNpcmNsZSgwLCAwLCBhdmF0YXJSYWRpdXMpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgYXZhdGFyQmcucGFyZW50ID0gYXZhdGFyQ29udGFpbmVyXG5cbiAgICAgICAgLy8g5aS05YOP57K+54G1XG4gICAgICAgIHZhciBhdmF0YXJTcHJpdGVOb2RlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJTcHJpdGVcIilcbiAgICAgICAgdmFyIGF2YXRhclNwcml0ZSA9IGF2YXRhclNwcml0ZU5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSlcbiAgICAgICAgYXZhdGFyU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTVxuICAgICAgICBhdmF0YXJTcHJpdGVOb2RlLnNldENvbnRlbnRTaXplKGF2YXRhclNpemUgLSA0LCBhdmF0YXJTaXplIC0gNClcbiAgICAgICAgYXZhdGFyU3ByaXRlTm9kZS5wYXJlbnQgPSBhdmF0YXJDb250YWluZXJcblxuICAgICAgICBhdmF0YXJDb250YWluZXIucGFyZW50ID0gbm9kZVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5pi156ew5qCH562+77yI5aS05YOP5LiL5pa577yJPT09PT09PT09PVxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5aKe5aSn5a2X5L2T77yM6ZmQ5Yi25a695bqm6Ziy5q2i5rqi5Ye6XG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lTGFiZWxcIilcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5zZXRQb3NpdGlvbigwLCBsYXlvdXRDb25maWcubmFtZVkpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUuc2V0Q29udGVudFNpemUoMTIwLCAzMCkgIC8vIOmZkOWItuWuveW6plxuICAgICAgICB2YXIgbmFtZUxhYmVsID0gbmFtZUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIG5hbWVMYWJlbC5zdHJpbmcgPSBcIueOqeWutuaYteensFwiXG4gICAgICAgIG5hbWVMYWJlbC5mb250U2l6ZSA9IHJhbmsgPT09IDEgPyAyMCA6IDE4ICAvLyDlhqDlhpvlrZfkvZPnqI3lpKdcbiAgICAgICAgbmFtZUxhYmVsLmxpbmVIZWlnaHQgPSAyNFxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5DTEFNUCAgLy8g6Ziy5q2i5rqi5Ye6XG4gICAgICAgIG5hbWVMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgdmFyIG5hbWVPdXRsaW5lID0gbmFtZUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBuYW1lT3V0bGluZS5jb2xvciA9IG5ldyBjYy5Db2xvcigzMCwgMzAsIDUwKVxuICAgICAgICBuYW1lT3V0bGluZS53aWR0aCA9IDFcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDph5HluIHmoIfnrb7vvIjmmLXnp7DkuIvmlrnvvIk9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlop7lpKflrZfkvZPlkozpl7Tot53vvIzmm7TphpLnm65cbiAgICAgICAgdmFyIGNvaW5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkNvaW5MYWJlbFwiKVxuICAgICAgICBjb2luTGFiZWxOb2RlLnNldFBvc2l0aW9uKDAsIGxheW91dENvbmZpZy5jb2luWSlcbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gXCIw6YeR5biBXCJcbiAgICAgICAgY29pbkxhYmVsLmZvbnRTaXplID0gcmFuayA9PT0gMSA/IDE4IDogMTYgIC8vIOWGoOWGm+Wtl+S9k+eojeWkp1xuICAgICAgICBjb2luTGFiZWwubGluZUhlaWdodCA9IDIwXG4gICAgICAgIGNvaW5MYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGNvaW5MYWJlbE5vZGUuY29sb3IgPSByYW5rID09PSAxID8gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgMTAwKSAgLy8g5Yag5Yab6YeR6ImyXG4gICAgICAgIHZhciBjb2luT3V0bGluZSA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgY29pbk91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDUwLCAwKVxuICAgICAgICBjb2luT3V0bGluZS53aWR0aCA9IDFcbiAgICAgICAgY29pbkxhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgcmV0dXJuIG5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOS/ruWkjeOAkeWIm+W7uumihuWlluWPsOW6lemDqFxuICAgICAqIOS/ruWkje+8muiwg+aVtOS9jee9ruS4jumihuWlluWPsOmhueebruWvuem9kFxuICAgICAqL1xuICAgIF9jcmVhdGVQb2RpdW1CYXNlOiBmdW5jdGlvbihwYXJlbnROb2RlLCB5KSB7XG4gICAgICAgIHZhciBzcGFjaW5nWCA9IDI4MCAgLy8g5LiO6aKG5aWW5Y+w6aG555uu6Ze06Led5LiA6Ie0XG4gICAgICAgIFxuICAgICAgICAvLyDlhqDlhpvlj7DvvIjmnIDpq5jvvIzmnIDlrr3vvIlcbiAgICAgICAgdmFyIGNoYW1waW9uQmFzZSA9IG5ldyBjYy5Ob2RlKFwiQ2hhbXBpb25CYXNlXCIpXG4gICAgICAgIGNoYW1waW9uQmFzZS5zZXRQb3NpdGlvbigwLCB5IC0gMjApICAvLyDlr7npvZDlhqDlhpvkvY3nva5cbiAgICAgICAgdmFyIGNnMSA9IGNoYW1waW9uQmFzZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNnMS5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxNDAsIDYwLCAyMDApXG4gICAgICAgIGNnMS5yb3VuZFJlY3QoLTgwLCAtMzAsIDE2MCwgNjAsIDEwKVxuICAgICAgICBjZzEuZmlsbCgpXG4gICAgICAgIGNnMS5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMjAsIDE4MCwgODApXG4gICAgICAgIGNnMS5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMS5yb3VuZFJlY3QoLTgwLCAtMzAsIDE2MCwgNjAsIDEwKVxuICAgICAgICBjZzEuc3Ryb2tlKClcbiAgICAgICAgY2hhbXBpb25CYXNlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICAvLyDkuprlhpvlj7DvvIjkuK3nrYnvvIlcbiAgICAgICAgdmFyIHJ1bm5lclVwQmFzZSA9IG5ldyBjYy5Ob2RlKFwiUnVubmVyVXBCYXNlXCIpXG4gICAgICAgIHJ1bm5lclVwQmFzZS5zZXRQb3NpdGlvbigtc3BhY2luZ1gsIHkgLSAzMCkgIC8vIOWvuem9kOS6muWGm+S9jee9rlxuICAgICAgICB2YXIgY2cyID0gcnVubmVyVXBCYXNlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgY2cyLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMjAsIDEzMCwgMTUwLCAyMDApXG4gICAgICAgIGNnMi5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMi5maWxsKClcbiAgICAgICAgY2cyLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDE2MCwgMTcwLCAxOTApXG4gICAgICAgIGNnMi5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMi5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMi5zdHJva2UoKVxuICAgICAgICBydW5uZXJVcEJhc2UucGFyZW50ID0gcGFyZW50Tm9kZVxuXG4gICAgICAgIC8vIOWto+WGm+WPsO+8iOacgOS9ju+8iVxuICAgICAgICB2YXIgdGhpcmRCYXNlID0gbmV3IGNjLk5vZGUoXCJUaGlyZEJhc2VcIilcbiAgICAgICAgdGhpcmRCYXNlLnNldFBvc2l0aW9uKHNwYWNpbmdYLCB5IC0gMzApICAvLyDlr7npvZDlraPlhpvkvY3nva5cbiAgICAgICAgdmFyIGNnMyA9IHRoaXJkQmFzZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNnMy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxMTAsIDkwLCAyMDApXG4gICAgICAgIGNnMy5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMy5maWxsKClcbiAgICAgICAgY2czLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTQwLCAxMTApXG4gICAgICAgIGNnMy5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMy5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMy5zdHJva2UoKVxuICAgICAgICB0aGlyZEJhc2UucGFyZW50ID0gcGFyZW50Tm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5Yib5bu65oiR55qE5o6S5ZCN5Yy65Z+fXG4gICAgICog5L+u5aSN77ya6LCD5pW05L2N572u44CB5bGF5Lit5a+56b2Q44CB5aKe5aSn5a655Zmo5bC65a+4XG4gICAgICovXG4gICAgX2NyZWF0ZU15UmFua0FyZWE6IGZ1bmN0aW9uKHBhcmVudE5vZGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IG5ldyBjYy5Ob2RlKFwiTXlSYW5rQ29udGFpbmVyXCIpXG4gICAgICAgIGNvbnRhaW5lci5zZXRQb3NpdGlvbigwLCAtMjAwKSAgLy8g5LiL56e76YG/5YWN5LiO6aKG5aWW5Y+w6YeN5Y+gXG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZW50U2l6ZSg2MDAsIDYwKSAgLy8g5aKe5aSn5a655Zmo5bC65a+4XG5cbiAgICAgICAgLy8g6IOM5pmv5qGGIC0g5pu05a695pu05riF5pmwXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZ0dyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYmdHcmFwaGljcy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNDAsIDUwLCA4MCwgMjMwKVxuICAgICAgICBiZ0dyYXBoaWNzLnJvdW5kUmVjdCgtMzAwLCAtMzAsIDYwMCwgNjAsIDEyKVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZ0dyYXBoaWNzLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTIwLCAxNjApXG4gICAgICAgIGJnR3JhcGhpY3MubGluZVdpZHRoID0gMlxuICAgICAgICBiZ0dyYXBoaWNzLnJvdW5kUmVjdCgtMzAwLCAtMzAsIDYwMCwgNjAsIDEyKVxuICAgICAgICBiZ0dyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBjb250YWluZXJcblxuICAgICAgICAvLyDmiJHnmoTmjpLlkI3moIfnrb4gLSDlsYXkuK3lr7npvZBcbiAgICAgICAgdmFyIG15UmFua05vZGUgPSBuZXcgY2MuTm9kZShcIk15UmFua0xhYmVsXCIpXG4gICAgICAgIG15UmFua05vZGUuc2V0UG9zaXRpb24oLTE0MCwgMCkgIC8vIOW3puS+p+S9jee9rlxuICAgICAgICBteVJhbmtOb2RlLnNldENvbnRlbnRTaXplKDIwMCwgNDApXG4gICAgICAgIHZhciBteVJhbmtMYWJlbCA9IG15UmFua05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBteVJhbmtMYWJlbC5zdHJpbmcgPSBcIuaIkeeahOaOkuWQje+8muesrC0t5ZCNXCJcbiAgICAgICAgbXlSYW5rTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICBteVJhbmtMYWJlbC5saW5lSGVpZ2h0ID0gMjhcbiAgICAgICAgbXlSYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBteVJhbmtMYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgbXlSYW5rTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDIwMCwgMjU1KVxuICAgICAgICBteVJhbmtOb2RlLnBhcmVudCA9IGNvbnRhaW5lclxuICAgICAgICB0aGlzLm15UmFua0xhYmVsID0gbXlSYW5rTGFiZWxcblxuICAgICAgICAvLyDliIbpmpTnrKZcbiAgICAgICAgdmFyIHNlcGFyYXRvck5vZGUgPSBuZXcgY2MuTm9kZShcIlNlcGFyYXRvclwiKVxuICAgICAgICBzZXBhcmF0b3JOb2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIHZhciBzZXBMYWJlbCA9IHNlcGFyYXRvck5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBzZXBMYWJlbC5zdHJpbmcgPSBcInxcIlxuICAgICAgICBzZXBMYWJlbC5mb250U2l6ZSA9IDI0XG4gICAgICAgIHNlcExhYmVsLmxpbmVIZWlnaHQgPSAyOFxuICAgICAgICBzZXBhcmF0b3JOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE1MCwgMTUwLCAxODApXG4gICAgICAgIHNlcGFyYXRvck5vZGUucGFyZW50ID0gY29udGFpbmVyXG5cbiAgICAgICAgLy8g6YeR5biB5qCH562+XG4gICAgICAgIHZhciBteUNvaW5Ob2RlID0gbmV3IGNjLk5vZGUoXCJNeUNvaW5MYWJlbFwiKVxuICAgICAgICBteUNvaW5Ob2RlLnNldFBvc2l0aW9uKDE1MCwgMCkgIC8vIOWPs+S+p+S9jee9rlxuICAgICAgICBteUNvaW5Ob2RlLnNldENvbnRlbnRTaXplKDIwMCwgNDApXG4gICAgICAgIHZhciBteUNvaW5MYWJlbCA9IG15Q29pbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBteUNvaW5MYWJlbC5zdHJpbmcgPSBcIuavlOi1m+mHkeW4ge+8mjBcIlxuICAgICAgICBteUNvaW5MYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIG15Q29pbkxhYmVsLmxpbmVIZWlnaHQgPSAyOFxuICAgICAgICBteUNvaW5MYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIG15Q29pbkxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICBteUNvaW5Ob2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIG15Q29pbk5vZGUucGFyZW50ID0gY29udGFpbmVyXG4gICAgICAgIHRoaXMubXlDb2luTGFiZWwgPSBteUNvaW5MYWJlbFxuXG4gICAgICAgIGNvbnRhaW5lci5wYXJlbnQgPSBwYXJlbnROb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHliJvlu7rnoa7orqTmjInpkq5cbiAgICAgKiDkv67lpI3vvJrosIPmlbTkvY3nva7vvIznoa7kv53kuI3kuI7nirbmgIHmoI/ph43lj6DvvIzlop7liqDmjInpkq7moLflvI9cbiAgICAgKi9cbiAgICBfY3JlYXRlQ29uZmlybUJ1dHRvbjogZnVuY3Rpb24ocGFyZW50Tm9kZSkge1xuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29uZmlybUJ0blwiKVxuICAgICAgICBidG5Ob2RlLnNldFBvc2l0aW9uKDAsIC0yNzApICAvLyDkuIvnp7vnoa7kv53kuI7nirbmgIHmoI/mnInotrPlpJ/pl7Tot51cbiAgICAgICAgYnRuTm9kZS5zZXRDb250ZW50U2l6ZSgyMDAsIDU1KVxuXG4gICAgICAgIC8vIOaMiemSruiDjOaZryAtIOabtOmGkuebrueahOagt+W8j1xuICAgICAgICB2YXIgYnRuQmcgPSBidG5Ob2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYnRuQmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCAxNjAsIDgwKSAgLy8g57u/6Imy5oyJ6ZKuXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjcuNSwgMjAwLCA1NSwgMTIpXG4gICAgICAgIGJ0bkJnLmZpbGwoKVxuICAgICAgICBidG5CZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigxMjAsIDIwMCwgMTIwKVxuICAgICAgICBidG5CZy5saW5lV2lkdGggPSAzXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjcuNSwgMjAwLCA1NSwgMTIpXG4gICAgICAgIGJ0bkJnLnN0cm9rZSgpXG5cbiAgICAgICAgLy8g5oyJ6ZKu5paH5a2XXG4gICAgICAgIHZhciBidG5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHZhciBidG5MYWJlbCA9IGJ0bkxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGJ0bkxhYmVsLnN0cmluZyA9IFwi56GuIOWumlwiXG4gICAgICAgIGJ0bkxhYmVsLmZvbnRTaXplID0gMjZcbiAgICAgICAgYnRuTGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIGJ0bkxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgYnRuTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIHZhciBidG5PdXRsaW5lID0gYnRuTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIGJ0bk91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMzAsIDgwLCAzMClcbiAgICAgICAgYnRuT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgYnRuTGFiZWxOb2RlLnBhcmVudCA9IGJ0bk5vZGVcblxuICAgICAgICAvLyDmt7vliqDmjInpkq7nu4Tku7ZcbiAgICAgICAgdmFyIGJ0biA9IGJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkJ1dHRvbilcbiAgICAgICAgYnRuTm9kZS5vbignY2xpY2snLCB0aGlzLm9uQ29uZmlybUNsaWNrLCB0aGlzKVxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICB0aGlzLmNvbmZpcm1CdG4gPSBidG5cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5YWs5YWx5pa55rOVXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7mlbDmja5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGVyaW9kX25vLCB0b3RhbF9wbGF5ZXJzLCB0b3AzLCB0b3AyMCwgbXlfcmFuaywgbXlfbWF0Y2hfY29pbiB9XG4gICAgICovXG4gICAgc2V0RGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2ddIOaUtuWIsOaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgIFxuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YVxuICAgICAgICB0aGlzLl9wZXJpb2RObyA9IGRhdGEucGVyaW9kX25vIHx8IFwiXCJcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzID0gZGF0YS50b3RhbF9wbGF5ZXJzIHx8IDBcbiAgICAgICAgdGhpcy5fdG9wMyA9IGRhdGEudG9wMyB8fCBbXVxuICAgICAgICB0aGlzLl90b3AyMCA9IGRhdGEudG9wMjAgfHwgW11cbiAgICAgICAgdGhpcy5fbXlSYW5rID0gZGF0YS5teV9yYW5rIHx8IDBcbiAgICAgICAgdGhpcy5fbXlNYXRjaENvaW4gPSBkYXRhLm15X21hdGNoX2NvaW4gfHwgMFxuXG4gICAgICAgIC8vIPCflKfjgJDosIPor5XjgJHmiZPljbBUT1Az5pWw5o2uXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZ10gVE9QM+aVsOaNrjpcIilcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl90b3AzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgI1wiICsgKGkrMSkgKyBcIjpcIiwgdGhpcy5fdG9wM1tpXS5wbGF5ZXJfbmFtZSwgXCLph5HluIE6XCIsIHRoaXMuX3RvcDNbaV0ubWF0Y2hfY29pbiwgXCLmnLrlmajkuro6XCIsIHRoaXMuX3RvcDNbaV0uaXNfcm9ib3QpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91cGRhdGVVSSgpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVJ5pu05pawXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfdXBkYXRlVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmm7TmlrDmnJ/lj7dcbiAgICAgICAgaWYgKHRoaXMucGVyaW9kTm9MYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5wZXJpb2ROb0xhYmVsLnN0cmluZyA9IFwi56ysXCIgKyB0aGlzLl9wZXJpb2RObyArIFwi5pyf6LWb5LqL57uT5p2fXCJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaAu+WPgui1m+S6uuaVsFxuICAgICAgICBpZiAodGhpcy50b3RhbFBsYXllcnNMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy50b3RhbFBsYXllcnNMYWJlbC5zdHJpbmcgPSBcIuWFsVwiICsgdGhpcy5fdG90YWxQbGF5ZXJzICsgXCLkurrlj4LotZtcIlxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5YmN5LiJ5ZCNXG4gICAgICAgIHRoaXMuX3VwZGF0ZVRvcDMoKVxuXG4gICAgICAgIC8vIOabtOaWsOaIkeeahOaOkuWQjVxuICAgICAgICBpZiAodGhpcy5teVJhbmtMYWJlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX215UmFuayA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm15UmFua0xhYmVsLnN0cmluZyA9IFwi5oiR55qE5o6S5ZCN77ya56ysXCIgKyB0aGlzLl9teVJhbmsgKyBcIuWQjVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubXlSYW5rTGFiZWwuc3RyaW5nID0gXCLmiJHnmoTmjpLlkI3vvJrmnKrkuIrmppxcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5oiR55qE6YeR5biBXG4gICAgICAgIGlmICh0aGlzLm15Q29pbkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLm15Q29pbkxhYmVsLnN0cmluZyA9IFwi5q+U6LWb6YeR5biB77yaXCIgKyB0aGlzLl9teU1hdGNoQ29pblxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVUb3AzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5Yag5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAxICYmIHRoaXMuY2hhbXBpb25Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMuY2hhbXBpb25Ob2RlLCB0aGlzLl90b3AzWzBdLCAxKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5Lqa5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAyICYmIHRoaXMucnVubmVyVXBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMucnVubmVyVXBOb2RlLCB0aGlzLl90b3AzWzFdLCAyKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5a2j5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAzICYmIHRoaXMudGhpcmRQbGFjZU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBvZGl1bU5vZGUodGhpcy50aGlyZFBsYWNlTm9kZSwgdGhpcy5fdG9wM1syXSwgMylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge2NjLk5vZGV9IG5vZGUgLSDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOeOqeWutuaVsOaNriB7IHBsYXllcl9uYW1lLCBtYXRjaF9jb2luLCBhdmF0YXIsIGlzX3JvYm90LCBwbGF5ZXJfaWQgfVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0g5o6S5ZCNXG4gICAgICovXG4gICAgX3VwZGF0ZVBvZGl1bU5vZGU6IGZ1bmN0aW9uKG5vZGUsIGRhdGEsIHJhbmspIHtcbiAgICAgICAgLy8g5ZCN5qyh5qCH562+XG4gICAgICAgIHZhciByYW5rTGFiZWwgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIGlmIChyYW5rTGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHJhbmtMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSB0aGlzLl9nZXRSYW5rVGV4dChyYW5rKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkhOeQhuacuuWZqOS6uuaYteensOaYvuekulxuICAgICAgICB2YXIgZGlzcGxheU5hbWUgPSBkYXRhLnBsYXllcl9uYW1lIHx8IFwi546p5a62XCJcbiAgICAgICAgaWYgKGRhdGEuaXNfcm9ib3QpIHtcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gdGhpcy5fZ2V0Um9ib3REaXNwbGF5TmFtZShkYXRhLnBsYXllcl9pZCwgZGF0YS5wbGF5ZXJfbmFtZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaYteensOagh+etvlxuICAgICAgICB2YXIgbmFtZUxhYmVsID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIk5hbWVMYWJlbFwiKVxuICAgICAgICBpZiAobmFtZUxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBuYW1lTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gZGlzcGxheU5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmHkeW4geagh+etvlxuICAgICAgICB2YXIgY29pbkxhYmVsID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIkNvaW5MYWJlbFwiKVxuICAgICAgICBpZiAoY29pbkxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBjb2luTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gdGhpcy5fZm9ybWF0Q29pbihkYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIumHkeW4gVwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5Yqg6L295aS05YOPXG4gICAgICAgIHZhciBhdmF0YXJDb250YWluZXIgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiQXZhdGFyQ29udGFpbmVyXCIpXG4gICAgICAgIGlmIChhdmF0YXJDb250YWluZXIpIHtcbiAgICAgICAgICAgIHZhciBhdmF0YXJTcHJpdGVOb2RlID0gYXZhdGFyQ29udGFpbmVyLmdldENoaWxkQnlOYW1lKFwiQXZhdGFyU3ByaXRlXCIpXG4gICAgICAgICAgICBpZiAoYXZhdGFyU3ByaXRlTm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBhdmF0YXJTcHJpdGUgPSBhdmF0YXJTcHJpdGVOb2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgICAgICAgICAgaWYgKGF2YXRhclNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkQXZhdGFyKGF2YXRhclNwcml0ZSwgZGF0YS5hdmF0YXIsIGRhdGEuaXNfcm9ib3QpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW191cGRhdGVQb2RpdW1Ob2RlXSDmjpLlkI0jXCIgKyByYW5rICsgXCI6IFwiICsgZGlzcGxheU5hbWUgKyBcIiwg6YeR5biBPVwiICsgZGF0YS5tYXRjaF9jb2luICsgXCIsIOacuuWZqOS6uj1cIiArIGRhdGEuaXNfcm9ib3QpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHliqDovb3lpLTlg49cbiAgICAgKi9cbiAgICBfbG9hZEF2YXRhcjogZnVuY3Rpb24oc3ByaXRlLCBhdmF0YXJVcmwsIGlzUm9ib3QpIHtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVyblxuXG4gICAgICAgIC8vIOacuuWZqOS6uuS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICBpZiAoaXNSb2JvdCkge1xuICAgICAgICAgICAgdmFyIHJvYm90QXZhdGFySW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSArIDFcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UGF0aCA9IFwiVUkvaGVhZGltYWdlL2F2YXRhcl9cIiArIHJvYm90QXZhdGFySW5kZXhcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGRlZmF1bHRQYXRoLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g56m65YC85aSE55CGXG4gICAgICAgIGlmICghYXZhdGFyVXJsIHx8IGF2YXRhclVybCA9PT0gXCJcIikge1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOi/nOeoi1VSTFxuICAgICAgICBpZiAoYXZhdGFyVXJsLmluZGV4T2YoXCJodHRwXCIpID09PSAwIHx8IGF2YXRhclVybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcbiAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKGF2YXRhclVybCwgeyBleHQ6ICcucG5nJyB9LCBmdW5jdGlvbihlcnIsIHRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIHx8ICF0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvaGVhZGltYWdlL2F2YXRhcl8xXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIyLCBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIyICYmIGZhbGxiYWNrU3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gZmFsbGJhY2tTcHJpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGVGcmFtZSA9IG5ldyBjYy5TcHJpdGVGcmFtZSh0ZXh0dXJlKVxuICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5pys5Zyw6LWE5rqQXG4gICAgICAgICAgICB2YXIgbG9jYWxQYXRoID0gXCJVSS9oZWFkaW1hZ2UvXCIgKyBhdmF0YXJVcmxcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGxvY2FsUGF0aCwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIHx8ICFzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcIlVJL2hlYWRpbWFnZS9hdmF0YXJfMVwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyMiwgZmFsbGJhY2tTcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyMiAmJiBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZhbGxiYWNrU3ByaXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qC85byP5YyW6YeR5biB5pi+56S6XG4gICAgICovXG4gICAgX2Zvcm1hdENvaW46IGZ1bmN0aW9uKGNvaW4pIHtcbiAgICAgICAgaWYgKGNvaW4gPj0gMTAwMDApIHtcbiAgICAgICAgICAgIHJldHVybiAoY29pbiAvIDEwMDAwKS50b0ZpeGVkKDEpICsgXCLkuIdcIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2luLnRvU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Yqo55S75pWI5p6cXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfc3RhcnRDaGFtcGlvbkVmZmVjdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlpZbmna/lvLnot7PliqjnlLtcbiAgICAgICAgaWYgKHRoaXMudHJvcGh5Tm9kZSkge1xuICAgICAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSgwLjUsIGNjLnYyKDAsIDEwKSlcbiAgICAgICAgICAgIHZhciBqdW1wRG93biA9IGNjLm1vdmVCeSgwLjUsIGNjLnYyKDAsIC0xMCkpXG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duKVxuICAgICAgICAgICAgdmFyIHJlcGVhdCA9IGNjLnJlcGVhdEZvcmV2ZXIoc2VxdWVuY2UpXG4gICAgICAgICAgICB0aGlzLnRyb3BoeU5vZGUucnVuQWN0aW9uKHJlcGVhdClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWPkeWFieaViOaenOmXqueDgVxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbkdsb3dOb2RlKSB7XG4gICAgICAgICAgICB2YXIgZmFkZUluID0gY2MuZmFkZUluKDAuNSlcbiAgICAgICAgICAgIHZhciBmYWRlT3V0ID0gY2MuZmFkZU91dCgwLjUpXG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBjYy5zZXF1ZW5jZShmYWRlSW4sIGZhZGVPdXQpXG4gICAgICAgICAgICB2YXIgcmVwZWF0ID0gY2MucmVwZWF0Rm9yZXZlcihzZXF1ZW5jZSlcbiAgICAgICAgICAgIHRoaXMuY2hhbXBpb25HbG93Tm9kZS5ydW5BY3Rpb24ocmVwZWF0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yag5Yab6IqC54K557yp5pS+5ZG85ZC45pWI5p6cXG4gICAgICAgIGlmICh0aGlzLmNoYW1waW9uTm9kZSkge1xuICAgICAgICAgICAgdmFyIHNjYWxlVXAgPSBjYy5zY2FsZVRvKDAuOCwgMS4wNSlcbiAgICAgICAgICAgIHZhciBzY2FsZURvd24gPSBjYy5zY2FsZVRvKDAuOCwgMS4wKVxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlID0gY2Muc2VxdWVuY2Uoc2NhbGVVcCwgc2NhbGVEb3duKVxuICAgICAgICAgICAgdmFyIHJlcGVhdCA9IGNjLnJlcGVhdEZvcmV2ZXIoc2VxdWVuY2UpXG4gICAgICAgICAgICB0aGlzLmNoYW1waW9uTm9kZS5ydW5BY3Rpb24ocmVwZWF0KVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9zdG9wQ2hhbXBpb25FZmZlY3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudHJvcGh5Tm9kZSkge1xuICAgICAgICAgICAgdGhpcy50cm9waHlOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbkdsb3dOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW1waW9uR2xvd05vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNoYW1waW9uTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaMiemSruS6i+S7tlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgb25Db25maXJtQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRGaW5hbFJhbmtdIOeCueWHu+ehruiupO+8jOi/lOWbnuWkp+WOhVwiKVxuXG4gICAgICAgIC8vIOWBnOatouWKqOeUu1xuICAgICAgICB0aGlzLl9zdG9wQ2hhbXBpb25FZmZlY3RzKClcblxuICAgICAgICAvLyDlhbPpl63lvLnnqpdcbiAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKVxuXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOhVxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIilcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g6L6F5Yqp5pa55rOVXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfZ2V0UmFua1RleHQ6IGZ1bmN0aW9uKHJhbmspIHtcbiAgICAgICAgc3dpdGNoIChyYW5rKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwi8J+lhyDlhqDlhptcIlxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIvCfpYgg5Lqa5YabXCJcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCLwn6WJIOWto+WGm1wiXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBcIuesrFwiICsgcmFuayArIFwi5ZCNXCJcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6I635Y+W5py65Zmo5Lq65pi+56S65ZCN56ewXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllcklkIC0g546p5a62SURcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3JpZ2luYWxOYW1lIC0g5Y6f5aeL5pi156ewXG4gICAgICogQHJldHVybnMge1N0cmluZ30g5pi+56S65ZCN56ewXG4gICAgICovXG4gICAgX2dldFJvYm90RGlzcGxheU5hbWU6IGZ1bmN0aW9uKHBsYXllcklkLCBvcmlnaW5hbE5hbWUpIHtcbiAgICAgICAgLy8g5aaC5p6c5Y6f5aeL5ZCN56ew5bey57uP5pivXCLmmbrog73pmarnu4NY5Y+3XCLmoLzlvI/vvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKG9yaWdpbmFsTmFtZSAmJiBvcmlnaW5hbE5hbWUuaW5kZXhPZihcIuaZuuiDvemZque7g1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTmFtZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlkKbliJnvvIznlJ/miJBcIuaZuuiDvemZque7g1jlj7dcIuagvOW8j+eahOWQjeensFxuICAgICAgICB2YXIgcm9ib3RJbmRleCA9IDFcbiAgICAgICAgaWYgKHBsYXllcklkKSB7XG4gICAgICAgICAgICB2YXIgbGFzdENoYXIgPSBwbGF5ZXJJZC50b1N0cmluZygpLnNsaWNlKC0xKVxuICAgICAgICAgICAgcm9ib3RJbmRleCA9IHBhcnNlSW50KGxhc3RDaGFyKSB8fCAxXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBcIuaZuuiDvemZque7g1wiICsgcm9ib3RJbmRleCArIFwi5Y+3XCJcbiAgICB9XG59KTtcbiJdfQ==