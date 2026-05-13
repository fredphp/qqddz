window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  TournamentFinalRankDialog: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d534bqBYA5JGadVgedCNtkf", "TournamentFinalRankDialog");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        periodNoLabel: {
          type: cc.Label,
          default: null
        },
        totalPlayersLabel: {
          type: cc.Label,
          default: null
        },
        championNode: {
          type: cc.Node,
          default: null
        },
        runnerUpNode: {
          type: cc.Node,
          default: null
        },
        thirdPlaceNode: {
          type: cc.Node,
          default: null
        },
        top20ScrollView: {
          type: cc.ScrollView,
          default: null
        },
        rankItemPrefab: {
          type: cc.Prefab,
          default: null
        },
        myRankLabel: {
          type: cc.Label,
          default: null
        },
        myCoinLabel: {
          type: cc.Label,
          default: null
        },
        confirmBtn: {
          type: cc.Button,
          default: null
        },
        trophyNode: {
          type: cc.Node,
          default: null
        },
        championGlowNode: {
          type: cc.Node,
          default: null
        }
      },
      onLoad: function onLoad() {
        this._data = null;
        this._top3 = [];
        this._top20 = [];
        this._myRank = 0;
        this._myMatchCoin = 0;
        this._checkAndCreateDynamicUI();
        this.confirmBtn && this.confirmBtn.node.on("click", this.onConfirmClick, this);
      },
      start: function start() {
        this._startChampionEffects();
      },
      _checkAndCreateDynamicUI: function _checkAndCreateDynamicUI() {
        if (!this.championNode || !this.runnerUpNode || !this.thirdPlaceNode) {
          console.log("\ud83c\udfc6 [TournamentFinalRankDialog] \u68c0\u6d4b\u5230prefab\u672a\u52a0\u8f7d\uff0c\u52a8\u6001\u521b\u5efaUI");
          this._createDynamicUI();
        }
      },
      _createDynamicUI: function _createDynamicUI() {
        var canvas = cc.find("Canvas");
        if (!canvas) {
          console.error("\u627e\u4e0d\u5230Canvas\u8282\u70b9");
          return;
        }
        var screenWidth = 1280;
        var screenHeight = 720;
        this.node.setContentSize(screenWidth, screenHeight);
        this.node.setPosition(0, 0);
        var bgNode = new cc.Node("Background");
        bgNode.setContentSize(screenWidth, screenHeight);
        var bgGraphics = bgNode.addComponent(cc.Graphics);
        bgGraphics.fillColor = new cc.Color(0, 0, 0, 180);
        bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
        bgGraphics.fill();
        bgNode.parent = this.node;
        var dialogNode = new cc.Node("DialogContainer");
        dialogNode.setContentSize(1e3, 650);
        dialogNode.setPosition(0, 0);
        var dialogBg = new cc.Node("DialogBg");
        var dialogBgGraphics = dialogBg.addComponent(cc.Graphics);
        dialogBgGraphics.fillColor = new cc.Color(25, 35, 60, 250);
        dialogBgGraphics.roundRect(-500, -325, 1e3, 650, 25);
        dialogBgGraphics.fill();
        dialogBgGraphics.strokeColor = new cc.Color(180, 140, 60);
        dialogBgGraphics.lineWidth = 4;
        dialogBgGraphics.roundRect(-500, -325, 1e3, 650, 25);
        dialogBgGraphics.stroke();
        dialogBg.parent = dialogNode;
        dialogNode.parent = this.node;
        var titleNode = new cc.Node("TitleNode");
        titleNode.setPosition(0, 280);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "\ud83c\udfc6 \u6bd4\u8d5b\u7ed3\u675f \ud83c\udfc6";
        titleLabel.fontSize = 40;
        titleLabel.lineHeight = 48;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(255, 215, 0);
        var titleOutline = titleNode.addComponent(cc.LabelOutline);
        titleOutline.color = new cc.Color(100, 60, 0);
        titleOutline.width = 3;
        titleNode.parent = dialogNode;
        this._periodNoNode = new cc.Node("PeriodNoNode");
        this._periodNoNode.setPosition(0, 230);
        var periodLabel = this._periodNoNode.addComponent(cc.Label);
        periodLabel.string = "\u7b2c---\u671f\u8d5b\u4e8b\u7ed3\u675f";
        periodLabel.fontSize = 26;
        periodLabel.lineHeight = 32;
        this._periodNoNode.color = new cc.Color(200, 200, 220);
        this._periodNoNode.parent = dialogNode;
        this.periodNoLabel = periodLabel;
        this._totalPlayersNode = new cc.Node("TotalPlayersNode");
        this._totalPlayersNode.setPosition(0, 195);
        var totalLabel = this._totalPlayersNode.addComponent(cc.Label);
        totalLabel.string = "\u51710\u4eba\u53c2\u8d5b";
        totalLabel.fontSize = 22;
        totalLabel.lineHeight = 28;
        this._totalPlayersNode.color = new cc.Color(180, 180, 200);
        this._totalPlayersNode.parent = dialogNode;
        this.totalPlayersLabel = totalLabel;
        this._createTop3Podium(dialogNode);
        this._createMyRankArea(dialogNode);
        this._createConfirmButton(dialogNode);
        console.log("\ud83c\udfc6 [TournamentFinalRankDialog] \u52a8\u6001UI\u521b\u5efa\u5b8c\u6210");
      },
      _createTop3Podium: function _createTop3Podium(parentNode) {
        var podiumY = 50;
        var spacingX = 280;
        this.championNode = this._createPodiumItem(1, 0, podiumY + 40, 1.15);
        this.championNode.parent = parentNode;
        this.runnerUpNode = this._createPodiumItem(2, -spacingX, podiumY, 1);
        this.runnerUpNode.parent = parentNode;
        this.thirdPlaceNode = this._createPodiumItem(3, spacingX, podiumY, 1);
        this.thirdPlaceNode.parent = parentNode;
        var podiumBaseY = podiumY - 100;
        this._createPodiumBase(parentNode, podiumBaseY);
      },
      _createPodiumItem: function _createPodiumItem(rank, x, y, scale) {
        var node = new cc.Node("PodiumItem_" + rank);
        node.setPosition(x, y);
        node.scale = scale || 1;
        var layoutConfig = {
          rankY: 65,
          avatarY: 0,
          nameY: -60,
          coinY: -90
        };
        var rankLabelNode = new cc.Node("RankLabel");
        rankLabelNode.setPosition(0, layoutConfig.rankY);
        var rankLabel = rankLabelNode.addComponent(cc.Label);
        rankLabel.string = this._getRankText(rank);
        rankLabel.fontSize = 22;
        rankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        rankLabelNode.color = 1 === rank ? new cc.Color(255, 215, 0) : new cc.Color(200, 200, 220);
        var rankOutline = rankLabelNode.addComponent(cc.LabelOutline);
        rankOutline.color = new cc.Color(50, 50, 80);
        rankOutline.width = 2;
        rankLabelNode.parent = node;
        var avatarSize = 1 === rank ? 70 : 60;
        var avatarRadius = avatarSize / 2 + 2;
        var avatarContainer = new cc.Node("AvatarContainer");
        avatarContainer.setPosition(0, layoutConfig.avatarY);
        avatarContainer.setContentSize(avatarSize, avatarSize);
        var avatarBg = new cc.Node("AvatarBg");
        var avatarBgGraphics = avatarBg.addComponent(cc.Graphics);
        avatarBgGraphics.fillColor = new cc.Color(60, 70, 100);
        avatarBgGraphics.circle(0, 0, avatarRadius);
        avatarBgGraphics.fill();
        avatarBgGraphics.strokeColor = 1 === rank ? new cc.Color(255, 215, 0) : new cc.Color(150, 150, 180);
        avatarBgGraphics.lineWidth = 1 === rank ? 3 : 2;
        avatarBgGraphics.circle(0, 0, avatarRadius);
        avatarBgGraphics.stroke();
        avatarBg.parent = avatarContainer;
        var avatarSpriteNode = new cc.Node("AvatarSprite");
        var avatarSprite = avatarSpriteNode.addComponent(cc.Sprite);
        avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        avatarSpriteNode.setContentSize(avatarSize - 4, avatarSize - 4);
        avatarSpriteNode.parent = avatarContainer;
        avatarContainer.parent = node;
        var nameLabelNode = new cc.Node("NameLabel");
        nameLabelNode.setPosition(0, layoutConfig.nameY);
        nameLabelNode.setContentSize(120, 30);
        var nameLabel = nameLabelNode.addComponent(cc.Label);
        nameLabel.string = "\u73a9\u5bb6\u6635\u79f0";
        nameLabel.fontSize = 1 === rank ? 20 : 18;
        nameLabel.lineHeight = 24;
        nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        nameLabel.overflow = cc.Label.Overflow.CLAMP;
        nameLabelNode.color = new cc.Color(255, 255, 255);
        var nameOutline = nameLabelNode.addComponent(cc.LabelOutline);
        nameOutline.color = new cc.Color(30, 30, 50);
        nameOutline.width = 1;
        nameLabelNode.parent = node;
        var coinLabelNode = new cc.Node("CoinLabel");
        coinLabelNode.setPosition(0, layoutConfig.coinY);
        var coinLabel = coinLabelNode.addComponent(cc.Label);
        coinLabel.string = "0\u91d1\u5e01";
        coinLabel.fontSize = 1 === rank ? 18 : 16;
        coinLabel.lineHeight = 20;
        coinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        coinLabelNode.color = 1 === rank ? new cc.Color(255, 215, 0) : new cc.Color(255, 200, 100);
        var coinOutline = coinLabelNode.addComponent(cc.LabelOutline);
        coinOutline.color = new cc.Color(80, 50, 0);
        coinOutline.width = 1;
        coinLabelNode.parent = node;
        return node;
      },
      _createPodiumBase: function _createPodiumBase(parentNode, y) {
        var spacingX = 280;
        var championBase = new cc.Node("ChampionBase");
        championBase.setPosition(0, y - 20);
        var cg1 = championBase.addComponent(cc.Graphics);
        cg1.fillColor = new cc.Color(180, 140, 60, 200);
        cg1.roundRect(-80, -30, 160, 60, 10);
        cg1.fill();
        cg1.strokeColor = new cc.Color(220, 180, 80);
        cg1.lineWidth = 2;
        cg1.roundRect(-80, -30, 160, 60, 10);
        cg1.stroke();
        championBase.parent = parentNode;
        var runnerUpBase = new cc.Node("RunnerUpBase");
        runnerUpBase.setPosition(-spacingX, y - 30);
        var cg2 = runnerUpBase.addComponent(cc.Graphics);
        cg2.fillColor = new cc.Color(120, 130, 150, 200);
        cg2.roundRect(-65, -25, 130, 50, 8);
        cg2.fill();
        cg2.strokeColor = new cc.Color(160, 170, 190);
        cg2.lineWidth = 2;
        cg2.roundRect(-65, -25, 130, 50, 8);
        cg2.stroke();
        runnerUpBase.parent = parentNode;
        var thirdBase = new cc.Node("ThirdBase");
        thirdBase.setPosition(spacingX, y - 30);
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
      _createMyRankArea: function _createMyRankArea(parentNode) {
        var container = new cc.Node("MyRankContainer");
        container.setPosition(0, -200);
        container.setContentSize(600, 60);
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
        var myRankNode = new cc.Node("MyRankLabel");
        myRankNode.setPosition(-140, 0);
        myRankNode.setContentSize(200, 40);
        var myRankLabel = myRankNode.addComponent(cc.Label);
        myRankLabel.string = "\u6211\u7684\u6392\u540d\uff1a\u7b2c--\u540d";
        myRankLabel.fontSize = 22;
        myRankLabel.lineHeight = 28;
        myRankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        myRankLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        myRankNode.color = new cc.Color(100, 200, 255);
        myRankNode.parent = container;
        this.myRankLabel = myRankLabel;
        var separatorNode = new cc.Node("Separator");
        separatorNode.setPosition(0, 0);
        var sepLabel = separatorNode.addComponent(cc.Label);
        sepLabel.string = "|";
        sepLabel.fontSize = 24;
        sepLabel.lineHeight = 28;
        separatorNode.color = new cc.Color(150, 150, 180);
        separatorNode.parent = container;
        var myCoinNode = new cc.Node("MyCoinLabel");
        myCoinNode.setPosition(150, 0);
        myCoinNode.setContentSize(200, 40);
        var myCoinLabel = myCoinNode.addComponent(cc.Label);
        myCoinLabel.string = "\u6bd4\u8d5b\u91d1\u5e01\uff1a0";
        myCoinLabel.fontSize = 22;
        myCoinLabel.lineHeight = 28;
        myCoinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        myCoinLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        myCoinNode.color = new cc.Color(255, 200, 100);
        myCoinNode.parent = container;
        this.myCoinLabel = myCoinLabel;
        container.parent = parentNode;
      },
      _createConfirmButton: function _createConfirmButton(parentNode) {
        var btnNode = new cc.Node("ConfirmBtn");
        btnNode.setPosition(0, -270);
        btnNode.setContentSize(200, 55);
        var btnBg = btnNode.addComponent(cc.Graphics);
        btnBg.fillColor = new cc.Color(80, 160, 80);
        btnBg.roundRect(-100, -27.5, 200, 55, 12);
        btnBg.fill();
        btnBg.strokeColor = new cc.Color(120, 200, 120);
        btnBg.lineWidth = 3;
        btnBg.roundRect(-100, -27.5, 200, 55, 12);
        btnBg.stroke();
        var btnLabelNode = new cc.Node("Label");
        var btnLabel = btnLabelNode.addComponent(cc.Label);
        btnLabel.string = "\u786e \u5b9a";
        btnLabel.fontSize = 26;
        btnLabel.lineHeight = 32;
        btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        btnLabelNode.color = new cc.Color(255, 255, 255);
        var btnOutline = btnLabelNode.addComponent(cc.LabelOutline);
        btnOutline.color = new cc.Color(30, 80, 30);
        btnOutline.width = 2;
        btnLabelNode.parent = btnNode;
        var btn = btnNode.addComponent(cc.Button);
        btnNode.on("click", this.onConfirmClick, this);
        btnNode.parent = parentNode;
        this.confirmBtn = btn;
      },
      setData: function setData(data) {
        console.log("\ud83c\udfc6 [TournamentFinalRankDialog] \u6536\u5230\u6570\u636e:", JSON.stringify(data));
        this._data = data;
        this._periodNo = data.period_no || "";
        this._totalPlayers = data.total_players || 0;
        this._top3 = data.top3 || [];
        this._top20 = data.top20 || [];
        this._myRank = data.my_rank || 0;
        this._myMatchCoin = data.my_match_coin || 0;
        console.log("\ud83c\udfc6 [TournamentFinalRankDialog] TOP3\u6570\u636e:");
        for (var i = 0; i < this._top3.length; i++) console.log("  #" + (i + 1) + ":", this._top3[i].player_name, "\u91d1\u5e01:", this._top3[i].match_coin, "\u673a\u5668\u4eba:", this._top3[i].is_robot);
        this._updateUI();
      },
      _updateUI: function _updateUI() {
        this.periodNoLabel && (this.periodNoLabel.string = "\u7b2c" + this._periodNo + "\u671f\u8d5b\u4e8b\u7ed3\u675f");
        this.totalPlayersLabel && (this.totalPlayersLabel.string = "\u5171" + this._totalPlayers + "\u4eba\u53c2\u8d5b");
        this._updateTop3();
        this.myRankLabel && (this._myRank > 0 ? this.myRankLabel.string = "\u6211\u7684\u6392\u540d\uff1a\u7b2c" + this._myRank + "\u540d" : this.myRankLabel.string = "\u6211\u7684\u6392\u540d\uff1a\u672a\u4e0a\u699c");
        this.myCoinLabel && (this.myCoinLabel.string = "\u6bd4\u8d5b\u91d1\u5e01\uff1a" + this._myMatchCoin);
      },
      _updateTop3: function _updateTop3() {
        this._top3.length >= 1 && this.championNode && this._updatePodiumNode(this.championNode, this._top3[0], 1);
        this._top3.length >= 2 && this.runnerUpNode && this._updatePodiumNode(this.runnerUpNode, this._top3[1], 2);
        this._top3.length >= 3 && this.thirdPlaceNode && this._updatePodiumNode(this.thirdPlaceNode, this._top3[2], 3);
      },
      _updatePodiumNode: function _updatePodiumNode(node, data, rank) {
        var rankLabel = node.getChildByName("RankLabel");
        if (rankLabel) {
          var label = rankLabel.getComponent(cc.Label);
          label && (label.string = this._getRankText(rank));
        }
        var displayName = data.player_name || "\u73a9\u5bb6";
        data.is_robot && (displayName = this._getRobotDisplayName(data.player_id, data.player_name));
        var nameLabel = node.getChildByName("NameLabel");
        if (nameLabel) {
          var label = nameLabel.getComponent(cc.Label);
          label && (label.string = displayName);
        }
        var coinLabel = node.getChildByName("CoinLabel");
        if (coinLabel) {
          var label = coinLabel.getComponent(cc.Label);
          label && (label.string = this._formatCoin(data.match_coin || 0) + "\u91d1\u5e01");
        }
        var avatarContainer = node.getChildByName("AvatarContainer");
        if (avatarContainer) {
          var avatarSpriteNode = avatarContainer.getChildByName("AvatarSprite");
          if (avatarSpriteNode) {
            var avatarSprite = avatarSpriteNode.getComponent(cc.Sprite);
            avatarSprite && this._loadAvatar(avatarSprite, data.avatar, data.is_robot);
          }
        }
        console.log("\ud83c\udfc6 [_updatePodiumNode] \u6392\u540d#" + rank + ": " + displayName + ", \u91d1\u5e01=" + data.match_coin + ", \u673a\u5668\u4eba=" + data.is_robot);
      },
      _loadAvatar: function _loadAvatar(sprite, avatarUrl, isRobot) {
        if (!sprite) return;
        if (isRobot) {
          var robotAvatarIndex = Math.floor(3 * Math.random()) + 1;
          var defaultPath = "UI/headimage/avatar_" + robotAvatarIndex;
          cc.resources.load(defaultPath, cc.SpriteFrame, function(err, spriteFrame) {
            !err && spriteFrame && (sprite.spriteFrame = spriteFrame);
          });
          return;
        }
        if (!avatarUrl || "" === avatarUrl) {
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function(err, spriteFrame) {
            !err && spriteFrame && (sprite.spriteFrame = spriteFrame);
          });
          return;
        }
        if (0 === avatarUrl.indexOf("http") || 0 === avatarUrl.indexOf("//")) cc.assetManager.loadRemote(avatarUrl, {
          ext: ".png"
        }, function(err, texture) {
          if (err || !texture) {
            cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function(err2, fallbackSprite) {
              !err2 && fallbackSprite && (sprite.spriteFrame = fallbackSprite);
            });
            return;
          }
          var spriteFrame = new cc.SpriteFrame(texture);
          sprite.spriteFrame = spriteFrame;
        }); else {
          var localPath = "UI/headimage/" + avatarUrl;
          cc.resources.load(localPath, cc.SpriteFrame, function(err, spriteFrame) {
            if (err || !spriteFrame) {
              cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function(err2, fallbackSprite) {
                !err2 && fallbackSprite && (sprite.spriteFrame = fallbackSprite);
              });
              return;
            }
            sprite.spriteFrame = spriteFrame;
          });
        }
      },
      _formatCoin: function _formatCoin(coin) {
        if (coin >= 1e4) return (coin / 1e4).toFixed(1) + "\u4e07";
        return coin.toString();
      },
      _startChampionEffects: function _startChampionEffects() {
        if (this.trophyNode) {
          var jumpUp = cc.moveBy(.5, cc.v2(0, 10));
          var jumpDown = cc.moveBy(.5, cc.v2(0, -10));
          var sequence = cc.sequence(jumpUp, jumpDown);
          var repeat = cc.repeatForever(sequence);
          this.trophyNode.runAction(repeat);
        }
        if (this.championGlowNode) {
          var fadeIn = cc.fadeIn(.5);
          var fadeOut = cc.fadeOut(.5);
          var sequence = cc.sequence(fadeIn, fadeOut);
          var repeat = cc.repeatForever(sequence);
          this.championGlowNode.runAction(repeat);
        }
        if (this.championNode) {
          var scaleUp = cc.scaleTo(.8, 1.05);
          var scaleDown = cc.scaleTo(.8, 1);
          var sequence = cc.sequence(scaleUp, scaleDown);
          var repeat = cc.repeatForever(sequence);
          this.championNode.runAction(repeat);
        }
      },
      _stopChampionEffects: function _stopChampionEffects() {
        this.trophyNode && this.trophyNode.stopAllActions();
        this.championGlowNode && this.championGlowNode.stopAllActions();
        this.championNode && this.championNode.stopAllActions();
      },
      onConfirmClick: function onConfirmClick() {
        console.log("\ud83c\udfc6 [TournamentFinalRank] \u70b9\u51fb\u786e\u8ba4\uff0c\u8fd4\u56de\u5927\u5385");
        this._stopChampionEffects();
        this.node.destroy();
        cc.director.loadScene("hallScene");
      },
      _getRankText: function _getRankText(rank) {
        switch (rank) {
         case 1:
          return "\ud83e\udd47 \u51a0\u519b";

         case 2:
          return "\ud83e\udd48 \u4e9a\u519b";

         case 3:
          return "\ud83e\udd49 \u5b63\u519b";

         default:
          return "\u7b2c" + rank + "\u540d";
        }
      },
      _getRobotDisplayName: function _getRobotDisplayName(playerId, originalName) {
        if (originalName && 0 === originalName.indexOf("\u667a\u80fd\u966a\u7ec3")) return originalName;
        var robotIndex = 1;
        if (playerId) {
          var lastChar = playerId.toString().slice(-1);
          robotIndex = parseInt(lastChar) || 1;
        }
        return "\u667a\u80fd\u966a\u7ec3" + robotIndex + "\u53f7";
      }
    });
    cc._RF.pop();
  }, {} ],
  TournamentWaitingScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b64d2wKIqJAt7GneSYVRndp", "TournamentWaitingScene");
    "use strict";
    var TournamentStatus = {
      WAITING: "WAITING",
      CALCULATING: "CALCULATING",
      MATCHING: "MATCHING"
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        periodNoLabel: {
          type: cc.Label,
          default: null
        },
        roundLabel: {
          type: cc.Label,
          default: null
        },
        progressLabel: {
          type: cc.Label,
          default: null
        },
        progressBar: {
          type: cc.ProgressBar,
          default: null
        },
        tipLabel: {
          type: cc.Label,
          default: null
        },
        statusLabel: {
          type: cc.Label,
          default: null
        },
        loadingNode: {
          type: cc.Node,
          default: null
        },
        pokerSprite: {
          type: cc.Sprite,
          default: null
        }
      },
      onLoad: function onLoad() {
        this._periodNo = "";
        this._round = 1;
        this._totalRounds = 1;
        this._finishedTables = 0;
        this._totalTables = 0;
        this._isWaiting = false;
        this._status = TournamentStatus.WAITING;
        this._registerEvents();
      },
      start: function start() {
        this._startLoadingAnimation();
      },
      onDestroy: function onDestroy() {
        this._unregisterEvents();
      },
      _registerEvents: function _registerEvents() {
        var self = this;
        if (window.socketCtr) {
          window.socketCtr().onTournamentWaitProgress(function(data) {
            self._onWaitProgress(data);
          });
          window.socketCtr().onTournamentRoundAdvance(function(data) {
            self._onRoundAdvance(data);
          });
          window.socketCtr().onTournamentFinalRank(function(data) {
            self._onFinalRank(data);
          });
        }
      },
      _unregisterEvents: function _unregisterEvents() {},
      setData: function setData(data) {
        this._periodNo = data.period_no || "";
        this._round = data.round || 1;
        this._totalRounds = data.total_rounds || 1;
        this._finishedTables = data.finished_tables || 0;
        this._totalTables = data.total_tables || 0;
        this._status = data.status || TournamentStatus.WAITING;
        this._updateUI();
      },
      updateProgress: function updateProgress(finishedTables) {
        this._finishedTables = finishedTables;
        this._updateProgressUI();
      },
      _onWaitProgress: function _onWaitProgress(data) {
        console.log("\ud83c\udfc6 [TournamentWaiting] \u6536\u5230\u8fdb\u5ea6\u66f4\u65b0:", JSON.stringify(data));
        if (this._periodNo && data.period_no !== this._periodNo) return;
        this._periodNo = data.period_no;
        this._round = data.round;
        this._totalRounds = data.total_rounds;
        this._finishedTables = data.finished_tables;
        this._totalTables = data.total_tables;
        this._status = data.status || TournamentStatus.WAITING;
        this._updateUI();
      },
      _onRoundAdvance: function _onRoundAdvance(data) {
        console.log("\ud83c\udfc6 [TournamentWaiting] \u8fdb\u5165\u4e0b\u4e00\u8f6e:", JSON.stringify(data));
        if (this._periodNo && data.period_no !== this._periodNo) return;
        this._round = data.new_round;
        this._totalRounds = data.total_rounds;
        this._finishedTables = 0;
        this._status = TournamentStatus.MATCHING;
        this.tipLabel && (this.tipLabel.string = data.message || "\u8fdb\u5165\u4e0b\u4e00\u8f6e...");
        this._playRoundChangeAnimation();
      },
      _onFinalRank: function _onFinalRank(data) {
        console.log("\ud83c\udfc6 [TournamentWaiting] \u6bd4\u8d5b\u7ed3\u675f\uff0c\u663e\u793a\u6700\u7ec8\u699c\u5355:", JSON.stringify(data));
        if (this._periodNo && data.period_no !== this._periodNo) return;
        this._showFinalRankDialog(data);
      },
      _updateUI: function _updateUI() {
        this.periodNoLabel && (this.periodNoLabel.string = "\u7b2c" + this._periodNo + "\u671f");
        this.roundLabel && (this.roundLabel.string = "\u7b2c" + this._round + "\u8f6e / \u5171" + this._totalRounds + "\u8f6e");
        this._updateProgressUI();
        this._updateStatusUI();
      },
      _updateProgressUI: function _updateProgressUI() {
        this.progressLabel && (this.progressLabel.string = this._finishedTables + " / " + this._totalTables);
        if (this.progressBar && this._totalTables > 0) {
          var progress = this._finishedTables / this._totalTables;
          this.progressBar.progress = Math.min(progress, 1);
        }
        if (this.tipLabel) if (this._finishedTables >= this._totalTables) this.tipLabel.string = "\u5168\u90e8\u5b8c\u6210\uff0c\u5373\u5c06\u8fdb\u5165\u4e0b\u4e00\u8f6e..."; else {
          var remaining = this._totalTables - this._finishedTables;
          this.tipLabel.string = "\u6b63\u5728\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6\u5b8c\u6210... (\u5269\u4f59" + remaining + "\u684c)";
        }
      },
      _updateStatusUI: function _updateStatusUI() {
        if (this.statusLabel) switch (this._status) {
         case TournamentStatus.CALCULATING:
          this.statusLabel.string = "\u6b63\u5728\u7edf\u8ba1\u5168\u573a\u6392\u540d...";
          this.statusLabel.node.color = new cc.Color(255, 200, 100);
          break;

         case TournamentStatus.MATCHING:
          this.statusLabel.string = "\u664b\u7ea7\u6210\u529f\uff01\u6b63\u5728\u5339\u914d\u4e0b\u4e00\u8f6e...";
          this.statusLabel.node.color = new cc.Color(100, 255, 100);
          break;

         default:
          if (this._finishedTables >= this._totalTables) {
            this.statusLabel.string = "\u672c\u8f6e\u7ed3\u675f\uff0c\u8bf7\u7a0d\u5019...";
            this.statusLabel.node.color = new cc.Color(255, 220, 150);
          } else {
            this.statusLabel.string = "\u6b63\u5728\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6\u5b8c\u6210...";
            this.statusLabel.node.color = new cc.Color(200, 200, 220);
          }
        }
        if (this.tipLabel) switch (this._status) {
         case TournamentStatus.CALCULATING:
          this.tipLabel.string = "\u6b63\u5728\u7edf\u8ba1\u5168\u573a\u6392\u540d...";
          break;

         case TournamentStatus.MATCHING:
          this.tipLabel.string = "\u664b\u7ea7\u6210\u529f\uff01\u6b63\u5728\u5339\u914d\u4e0b\u4e00\u8f6e...";
          break;

         default:
          if (this._finishedTables >= this._totalTables) this.tipLabel.string = "\u5168\u90e8\u5b8c\u6210\uff0c\u5373\u5c06\u8fdb\u5165\u4e0b\u4e00\u8f6e..."; else {
            var remaining = this._totalTables - this._finishedTables;
            this.tipLabel.string = "\u6b63\u5728\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6\u5b8c\u6210... (\u5269\u4f59" + remaining + "\u684c)";
          }
        }
      },
      _startLoadingAnimation: function _startLoadingAnimation() {
        if (!this.pokerSprite) return;
        var self = this;
        var rotateAction = cc.rotateBy(2, 360);
        var repeatAction = cc.repeatForever(rotateAction);
        this.pokerSprite.node.runAction(repeatAction);
      },
      _stopLoadingAnimation: function _stopLoadingAnimation() {
        this.pokerSprite && this.pokerSprite.node.stopAllActions();
      },
      _playRoundChangeAnimation: function _playRoundChangeAnimation() {
        if (this.roundLabel) {
          var scaleUp = cc.scaleTo(.3, 1.2);
          var scaleDown = cc.scaleTo(.3, 1);
          var sequence = cc.sequence(scaleUp, scaleDown);
          this.roundLabel.node.runAction(sequence);
        }
      },
      _showFinalRankDialog: function _showFinalRankDialog(data) {
        this._stopLoadingAnimation();
        var dialogNode = new cc.Node("TournamentFinalRankDialog");
        dialogNode.setPosition(0, 0);
        dialogNode.setContentSize(cc.winSize.width, cc.winSize.height);
        var dialogComp = dialogNode.addComponent("TournamentFinalRankDialog");
        this.node.addChild(dialogNode);
        dialogComp && dialogComp.setData(data);
        console.log("\ud83c\udfc6 [TournamentWaiting] \u6700\u7ec8\u699c\u5355\u5f39\u7a97\u5df2\u521b\u5efa");
      },
      onBackToHallClick: function onBackToHallClick() {
        cc.director.loadScene("hallScene");
      }
    });
    cc._RF.pop();
  }, {} ],
  arenaData: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "813dcvepIxFjad6cNQB7j3m", "arenaData");
    "use strict";
    window.arenaData = function() {
      var that = {};
      that._signedUpArenas = {};
      that._arenaDetails = {};
      that._countdownTimers = {};
      that._statusListeners = [];
      that.getArenaList = function(callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        HttpAPI.get(apiUrl + "/api/v1/arena/list", cryptoKey, function(err, result) {
          if (err) {
            callback && callback(err, null);
            return;
          }
          var arenaList = null;
          result && 0 === result.code && result.data ? arenaList = result.data : result && Array.isArray(result) && (arenaList = result);
          if (arenaList) {
            for (var i = 0; i < arenaList.length; i++) {
              var arena = arenaList[i];
              that._arenaDetails[arena.id] = arena;
            }
            callback && callback(null, arenaList);
          } else callback && callback("\u83b7\u53d6\u7ade\u6280\u573a\u5217\u8868\u5931\u8d25", null);
        });
      };
      that.signup = function(roomId, callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        var requestData = {
          room_id: roomId,
          token: token
        };
        HttpAPI.post(apiUrl + "/api/v1/arena/signup", requestData, cryptoKey, function(err, result) {
          if (err) {
            callback && callback(err, null);
            return;
          }
          if (result && (0 === result.code || result.success)) {
            var _result$data;
            var arenaConfig = that._arenaDetails[roomId] || {};
            that._signedUpArenas[roomId] = {
              signupTime: Date.now(),
              status: "signed_up",
              countdownEnd: result.data ? result.data.start_time : null,
              arenaConfig: arenaConfig,
              periodNo: result.period_no || (null == (_result$data = result.data) ? void 0 : _result$data.period_no)
            };
            that.saveToLocal();
            that._notifyStatusChange(roomId, "signed_up");
            callback && callback(null, {
              success: true,
              message: result.message || "\u62a5\u540d\u6210\u529f",
              start_time: result.data ? result.data.start_time : null
            });
          } else callback && callback(result ? result.message : "\u62a5\u540d\u5931\u8d25", null);
        });
      };
      that.cancelSignup = function(roomId, callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        var requestData = {
          room_id: roomId,
          token: token
        };
        HttpAPI.post(apiUrl + "/api/v1/arena/cancel", requestData, cryptoKey, function(err, result) {
          if (err) {
            callback && callback(err, null);
            return;
          }
          if (result && (0 === result.code || result.success)) {
            delete that._signedUpArenas[roomId];
            that.saveToLocal();
            if (that._countdownTimers[roomId]) {
              clearInterval(that._countdownTimers[roomId]);
              delete that._countdownTimers[roomId];
            }
            that._notifyStatusChange(roomId, "cancelled");
            callback && callback(null, {
              success: true,
              message: "\u53d6\u6d88\u62a5\u540d\u6210\u529f"
            });
          } else callback && callback(result ? result.message : "\u53d6\u6d88\u62a5\u540d\u5931\u8d25", null);
        });
      };
      that.getSignupStatus = function(roomId) {
        return that._signedUpArenas[roomId] || null;
      };
      that.isSignedUp = function(roomId) {
        return !!that._signedUpArenas[roomId];
      };
      that.getCountdown = function(roomId) {
        var signup = that._signedUpArenas[roomId];
        if (!signup || !signup.countdownEnd) return -1;
        var now = Date.now();
        var remaining = Math.floor((signup.countdownEnd - now) / 1e3);
        return remaining > 0 ? remaining : 0;
      };
      that.formatCountdown = function(seconds) {
        if (seconds < 0) return "";
        if (0 === seconds) return "\u5373\u5c06\u5f00\u8d5b";
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor(seconds % 3600 / 60);
        var secs = seconds % 60;
        return hours > 0 ? hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (secs < 10 ? "0" : "") + secs : (minutes < 10 ? "0" : "") + minutes + ":" + (secs < 10 ? "0" : "") + secs;
      };
      that.getArenaConfig = function(roomId) {
        return that._arenaDetails[roomId] || null;
      };
      that.getSignupFee = function(roomConfig) {
        return roomConfig.signup_fee || roomConfig.signupFee || 0;
      };
      that.getChampionReward = function(roomConfig) {
        return roomConfig.champion_reward || roomConfig.championReward || {
          coins: 0,
          items: []
        };
      };
      that.watchAdForReward = function(type, callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        var requestData = {
          token: token,
          type: type,
          ad_type: "reward_video"
        };
        HttpAPI.post(apiUrl + "/api/ad/reward", requestData, cryptoKey, function(err, result) {
          if (err) {
            callback && callback(err, null);
            return;
          }
          if (result && (0 === result.code || result.success)) {
            if (window.myglobal && window.myglobal.playerData && result.data) {
              result.data.gold && (window.myglobal.playerData.gobal_count = result.data.gold);
              result.data.arena_coin && (window.myglobal.playerData.arena_coin = result.data.arena_coin);
              window.myglobal.playerData.saveToLocal();
            }
            callback && callback(null, {
              success: true,
              reward: result.data || {}
            });
          } else callback && callback(result ? result.message : "\u83b7\u53d6\u5956\u52b1\u5931\u8d25", null);
        });
      };
      that.refreshBalance = function(callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        HttpAPI.get(apiUrl + "/api/v1/player/balance?token=" + encodeURIComponent(token), cryptoKey, function(err, result) {
          if (err) {
            callback && callback(err, null);
            return;
          }
          if (result && (0 === result.code || result.data)) {
            var data = result.data || result;
            if (window.myglobal && window.myglobal.playerData) {
              void 0 !== data.gold && (window.myglobal.playerData.gobal_count = data.gold);
              void 0 !== data.arena_coin && (window.myglobal.playerData.arena_coin = data.arena_coin);
              window.myglobal.playerData.saveToLocal();
            }
            callback && callback(null, data);
          } else callback && callback(result ? result.message : "\u83b7\u53d6\u4f59\u989d\u5931\u8d25", null);
        });
      };
      that.addStatusListener = function(listener) {
        that._statusListeners.push(listener);
      };
      that.removeStatusListener = function(listener) {
        var index = that._statusListeners.indexOf(listener);
        index > -1 && that._statusListeners.splice(index, 1);
      };
      that._notifyStatusChange = function(roomId, status) {
        for (var i = 0; i < that._statusListeners.length; i++) try {
          that._statusListeners[i](roomId, status);
        } catch (e) {
          console.error("\u72b6\u6001\u76d1\u542c\u5668\u6267\u884c\u9519\u8bef:", e);
        }
      };
      that.startCountdown = function(roomId, onUpdate) {
        that._countdownTimers[roomId] && clearInterval(that._countdownTimers[roomId]);
        that._countdownTimers[roomId] = setInterval(function() {
          var seconds = that.getCountdown(roomId);
          onUpdate && onUpdate(seconds);
          if (seconds <= 0) {
            clearInterval(that._countdownTimers[roomId]);
            delete that._countdownTimers[roomId];
            that._notifyStatusChange(roomId, "starting");
          }
        }, 1e3);
      };
      that.stopCountdown = function(roomId) {
        if (that._countdownTimers[roomId]) {
          clearInterval(that._countdownTimers[roomId]);
          delete that._countdownTimers[roomId];
        }
      };
      that.clearAllCountdowns = function() {
        for (var roomId in that._countdownTimers) clearInterval(that._countdownTimers[roomId]);
        that._countdownTimers = {};
      };
      that.saveToLocal = function() {
        try {
          var data = {
            signedUpArenas: that._signedUpArenas,
            savedAt: Date.now()
          };
          localStorage.setItem("arena_data", JSON.stringify(data));
        } catch (e) {
          console.error("\u4fdd\u5b58\u7ade\u6280\u573a\u6570\u636e\u5931\u8d25:", e);
        }
      };
      that.loadFromLocal = function() {
        try {
          var dataStr = localStorage.getItem("arena_data");
          if (dataStr) {
            var data = JSON.parse(dataStr);
            Date.now() - (data.savedAt || 0) < 864e5 && (that._signedUpArenas = data.signedUpArenas || {});
          }
        } catch (e) {
          console.error("\u52a0\u8f7d\u7ade\u6280\u573a\u6570\u636e\u5931\u8d25:", e);
        }
      };
      that.fetchSignupStatusFromServer = function(callback) {
        var apiUrl = window.defines ? window.defines.apiUrl : "";
        var cryptoKey = window.defines ? window.defines.cryptoKey : "";
        var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : "";
        if (!apiUrl || !window.HttpAPI) {
          callback && callback("API\u672a\u914d\u7f6e", null);
          return;
        }
        HttpAPI.get(apiUrl + "/api/v1/arena/signup-status?token=" + encodeURIComponent(token), cryptoKey, function(err, result) {
          if (err) {
            console.error("\ud83c\udfdf\ufe0f [arenaData] \u83b7\u53d6\u62a5\u540d\u72b6\u6001\u5931\u8d25:", err);
            callback && callback(err, null);
            return;
          }
          var signedUpRooms = [];
          if (result && (0 === result.code || result.data)) {
            var data = result.data || result;
            signedUpRooms = data.signed_up_rooms || [];
            that._signedUpArenas = {};
            for (var i = 0; i < signedUpRooms.length; i++) {
              var room = signedUpRooms[i];
              that._signedUpArenas[room.room_id] = {
                signupTime: room.signup_time,
                status: "signed_up",
                periodNo: room.period_no,
                signupFee: room.signup_fee
              };
            }
            that.saveToLocal();
          }
          callback && callback(null, signedUpRooms);
        });
      };
      that.clearAllSignupStatus = function() {
        that._signedUpArenas = {};
        that.saveToLocal();
      };
      that.loadFromLocal();
      return that;
    }();
    cc._RF.pop();
  }, {} ],
  creatroom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7bce5zzoXI04qsNEuZ579+P", "creatroom");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {},
      start: function start() {},
      onButtonClick: function onButtonClick(event, customData) {
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
          console.error("socket \u672a\u8fde\u63a5");
          return;
        }
        switch (customData) {
         case "create_room_1":
          this._createRoom(1);
          break;

         case "create_room_2":
          this._createRoom(2);
          break;

         case "create_room_3":
          this._createRoom(3);
          break;

         case "create_room_4":
          this._createRoom(4);
          break;

         case "create_room_close":
          this.node.destroy();
        }
      },
      _createRoom: function _createRoom(roomConfigId) {
        var myglobal = window.myglobal;
        myglobal && myglobal.socket && myglobal.socket.createRoom(roomConfigId, function(result, data) {
          if (0 === result) {
            myglobal.playerData.roomid = data.room_code;
            myglobal.playerData.bottom = 100;
            myglobal.playerData.rate = 1;
            myglobal.socket.saveReconnectInfo();
            var startTime = Date.now();
            cc.director.loadScene("gameScene", function(err) {
              if (err) {
                console.error("\ud83d\ude80 [\u521b\u5efa\u623f\u95f4] \u52a0\u8f7d\u6e38\u620f\u573a\u666f\u5931\u8d25:", err);
                return;
              }
              var elapsed = Date.now() - startTime;
            });
          } else console.error("\u521b\u5efa\u623f\u95f4\u5931\u8d25");
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  joinroom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f5be7jebVDi+qr1Px4nfSdB", "joinroom");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        room_id_input: {
          type: cc.EditBox,
          default: null
        }
      },
      onLoad: function onLoad() {},
      start: function start() {},
      onButtonClick: function onButtonClick(event, customData) {
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
          console.error("socket \u672a\u8fde\u63a5");
          return;
        }
        switch (customData) {
         case "join_room_confirm":
          this._joinRoom();
          break;

         case "join_room_close":
          this.node.destroy();
        }
      },
      _joinRoom: function _joinRoom() {
        var myglobal = window.myglobal;
        if (this.room_id_input && myglobal && myglobal.socket) {
          var roomId = this.room_id_input.string;
          roomId && roomId.length > 0;
        }
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "arenaData", "TournamentFinalRankDialog", "TournamentWaitingScene", "creatroom", "joinroom" ]);
//# sourceMappingURL=index.js.map
