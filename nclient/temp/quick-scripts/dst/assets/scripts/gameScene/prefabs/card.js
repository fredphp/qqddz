
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/gameScene/prefabs/card.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '2afe8rz92BOl7CbQfKSCoLh', 'card');
// scripts/gameScene/prefabs/card.js

"use strict";

// 使用全局变量，不使用 require
// 【彻底修复版本】基于精灵图集实际图片的映射表
//
// 🔧【重要】正确的精灵映射表（根据实际图片验证）：
// - card_53 = 红色JOKER = 大王
// - card_54 = 黑色JOKER = 小王
// - card_55 = 背面
// - card_1 ~ card_13 = 方块 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_14 ~ card_26 = 梅花 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_27 ~ card_39 = 红心 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_40 ~ card_52 = 黑桃 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
//
// 服务端数据格式：
// - suit: 0=♠(黑桃), 1=♥(红心), 2=♣(梅花), 3=♦(方块), 4=王
// - rank: 3-14=3到A, 15=2, 16=小王, 17=大王

var RoomState = window.RoomState || {};
cc.Class({
  "extends": cc.Component,
  name: 'card',
  properties: {
    cards_sprite_atlas: cc.SpriteAtlas
  },
  onLoad: function onLoad() {
    this.flag = false;
    this.offset_y = 20;
    this.node.on("reset_card_flag", function (event) {
      if (this.flag == true) {
        this.flag = false;
        this.node.y -= this.offset_y;
      }
    }.bind(this));
  },
  start: function start() {},
  init_data: function init_data(data) {},
  setTouchEvent: function setTouchEvent() {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.playerData) return;
    if (this.accountid == myglobal.playerData.accountID) {
      this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
        // 🔧【修复】向上查找 gameScene 节点
        var gameScene_node = this._findGameSceneNode();
        if (!gameScene_node) {
          console.warn("🃏 [card] 未找到 gameScene 节点");
          return;
        }
        var gameScene = gameScene_node.getComponent("gameScene");
        if (!gameScene) {
          console.warn("🃏 [card] 未找到 gameScene 组件");
          return;
        }
        if (gameScene.roomstate == RoomState.ROOM_PLAYING) {
          if (this.flag == false) {
            this.flag = true;
            this.node.y += this.offset_y;
            // 🔧【修复】使用唯一标识符 {suit, rank} 选牌
            gameScene_node.emit("choose_card_event", {
              cardid: this.card_id,
              card_data: this.card_data
            });
          } else {
            this.flag = false;
            this.node.y -= this.offset_y;
            // 🔧【修复】使用唯一标识符 {suit, rank} 取消选牌
            gameScene_node.emit("unchoose_card_event", this.card_id);
          }
        }
      }.bind(this));
    }
  },
  /**
   * 🔧【新增】向上查找 gameScene 节点
   */
  _findGameSceneNode: function _findGameSceneNode() {
    var node = this.node;
    while (node) {
      var gameScene = node.getComponent("gameScene");
      if (gameScene) {
        return node;
      }
      node = node.parent;
    }
    return null;
  },
  /**
   * 【核心】显示卡牌
   * @param {Object} card - 服务端原始卡牌数据
   */
  showCards: function showCards(card, accountid) {
    if (!card) {
      console.error("🃏 [showCards] 卡牌数据为空");
      return;
    }
    this.card_data = card;
    // 🔧【修复】使用 suit+rank 组合作为唯一标识符，而不是只用 rank
    // 这样可以正确区分相同牌面值但不同花色的牌（如 ♠J 和 ♥J）
    this.card_id = {
      suit: card.suit,
      rank: card.rank
    };
    if (accountid) {
      this.accountid = accountid;
    }
    var spriteKey = this._getSpriteKey(card);
    if (!spriteKey) {
      console.error("🃏 [showCards] 无法识别的牌数据:", JSON.stringify(card));
      return;
    }
    var suitName = this._getSuitName(card.suit);
    var rankName = this._getRankName(card.rank);
    var spriteFrame = this.cards_sprite_atlas.getSpriteFrame(spriteKey);
    if (spriteFrame) {
      this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
      this.setTouchEvent();
    } else {
      console.error("🃏 [showCards] 找不到精灵帧:", spriteKey);
    }
  },
  _getSuitName: function _getSuitName(suit) {
    var suitNames = {
      0: "♠",
      1: "♥",
      2: "♣",
      3: "♦",
      4: "王"
    };
    return suitNames[suit] || "?";
  },
  _getRankName: function _getRankName(rank) {
    if (rank === 16) return "小王";
    if (rank === 17) return "大王";
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
    return rankNames[rank] || String(rank);
  },
  /**
   * 【核心】根据服务端数据计算精灵键名
   *
   * 🔧【已验证】正确的精灵映射表（根据实际图片）：
   * - card_53 = 红色JOKER = 大王
   * - card_54 = 黑色JOKER = 小王
   * - card_55 = 背面
   * - card_1 ~ card_13 = 方块 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
   * - card_14 ~ card_26 = 梅花 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
   * - card_27 ~ card_39 = 红心 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
   * - card_40 ~ card_52 = 黑桃 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
   *
   * 服务端数据格式：
   * - suit: 0=♠(黑桃), 1=♥(红心), 2=♣(梅花), 3=♦(方块), 4=王
   * - rank: 3-14=3到A, 15=2, 16=小王, 17=大王
   *
   * @param {Object} card - 服务端卡牌数据
   * @returns {String} 精灵键名
   */
  _getSpriteKey: function _getSpriteKey(card) {
    var suit = card.suit;
    var rank = card.rank;

    // 🔧【修复】大小王映射 - 已更正
    // 精灵图集中：
    // - card_53 = 红色JOKER = 大王
    // - card_54 = 黑色JOKER = 小王
    // 服务端数据：
    // - rank = 16 = 小王
    // - rank = 17 = 大王
    if (rank === 16) return "card_54"; // 小王 → 黑色JOKER
    if (rank === 17) return "card_53"; // 大王 → 红色JOKER

    // 验证数据有效性
    if (suit < 0 || suit > 3 || rank < 3 || rank > 15) {
      console.error("🃏 [_getSpriteKey] 无效的牌数据: suit=" + suit + ", rank=" + rank);
      return null;
    }

    // 将服务端rank转换为精灵索引（A=0, 2=1, 3=2, ..., K=12）
    var pointIndex;
    if (rank === 14) {
      pointIndex = 0; // A
    } else if (rank === 15) {
      pointIndex = 1; // 2
    } else {
      pointIndex = rank - 1; // 3-13 -> 2-12
    }

    // 根据花色计算基础偏移
    // 服务端: suit 0=♠(黑桃), 1=♥(红心), 2=♣(梅花), 3=♦(方块)
    // 精灵: card_1~13=方块, card_14~26=梅花, card_27~39=红心, card_40~52=黑桃
    var baseOffset;
    switch (suit) {
      case 3:
        baseOffset = 0;
        break;
      // 方块: card_1 ~ card_13
      case 2:
        baseOffset = 13;
        break;
      // 梅花: card_14 ~ card_26
      case 1:
        baseOffset = 26;
        break;
      // 红心: card_27 ~ card_39
      case 0:
        baseOffset = 39;
        break;
      // 黑桃: card_40 ~ card_52
      default:
        baseOffset = 0;
    }
    var cardIndex = baseOffset + pointIndex + 1;
    return "card_" + cardIndex;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZ2FtZVNjZW5lXFxwcmVmYWJzXFxjYXJkLmpzIl0sIm5hbWVzIjpbIlJvb21TdGF0ZSIsIndpbmRvdyIsImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJuYW1lIiwicHJvcGVydGllcyIsImNhcmRzX3Nwcml0ZV9hdGxhcyIsIlNwcml0ZUF0bGFzIiwib25Mb2FkIiwiZmxhZyIsIm9mZnNldF95Iiwibm9kZSIsIm9uIiwiZXZlbnQiLCJ5IiwiYmluZCIsInN0YXJ0IiwiaW5pdF9kYXRhIiwiZGF0YSIsInNldFRvdWNoRXZlbnQiLCJteWdsb2JhbCIsInBsYXllckRhdGEiLCJhY2NvdW50aWQiLCJhY2NvdW50SUQiLCJOb2RlIiwiRXZlbnRUeXBlIiwiVE9VQ0hfU1RBUlQiLCJnYW1lU2NlbmVfbm9kZSIsIl9maW5kR2FtZVNjZW5lTm9kZSIsImNvbnNvbGUiLCJ3YXJuIiwiZ2FtZVNjZW5lIiwiZ2V0Q29tcG9uZW50Iiwicm9vbXN0YXRlIiwiUk9PTV9QTEFZSU5HIiwiZW1pdCIsImNhcmRpZCIsImNhcmRfaWQiLCJjYXJkX2RhdGEiLCJwYXJlbnQiLCJzaG93Q2FyZHMiLCJjYXJkIiwiZXJyb3IiLCJzdWl0IiwicmFuayIsInNwcml0ZUtleSIsIl9nZXRTcHJpdGVLZXkiLCJKU09OIiwic3RyaW5naWZ5Iiwic3VpdE5hbWUiLCJfZ2V0U3VpdE5hbWUiLCJyYW5rTmFtZSIsIl9nZXRSYW5rTmFtZSIsInNwcml0ZUZyYW1lIiwiZ2V0U3ByaXRlRnJhbWUiLCJTcHJpdGUiLCJzdWl0TmFtZXMiLCJyYW5rTmFtZXMiLCJTdHJpbmciLCJwb2ludEluZGV4IiwiYmFzZU9mZnNldCIsImNhcmRJbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSUEsU0FBUyxHQUFHQyxN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RTtRQUFFO01BQU87TUFDaEMsS0FBSyxDQUFDO1FBQUVBLFVBQVUsR0FBRyxFQUFFO1FBQUU7TUFBTztNQUNoQztRQUFTQSxVQUFVLEdBQUcsQ0FBQztJQUFBO0lBRzNCLElBQUlDLFNBQVMsR0FBR0QsVUFBVSxHQUFHRCxVQUFVLEdBQUcsQ0FBQztJQUUzQyxPQUFPLE9BQU8sR0FBR0UsU0FBUztFQUM5QjtBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5L2/55So5YWo5bGA5Y+Y6YeP77yM5LiN5L2/55SoIHJlcXVpcmVcbi8vIOOAkOW9u+W6leS/ruWkjeeJiOacrOOAkeWfuuS6jueyvueBteWbvumbhuWunumZheWbvueJh+eahOaYoOWwhOihqFxuLy9cbi8vIPCflKfjgJDph43opoHjgJHmraPnoa7nmoTnsr7ngbXmmKDlsITooajvvIjmoLnmja7lrp7pmYXlm77niYfpqozor4HvvInvvJpcbi8vIC0gY2FyZF81MyA9IOe6ouiJskpPS0VSID0g5aSn546LXG4vLyAtIGNhcmRfNTQgPSDpu5HoibJKT0tFUiA9IOWwj+eOi1xuLy8gLSBjYXJkXzU1ID0g6IOM6Z2iXG4vLyAtIGNhcmRfMSB+IGNhcmRfMTMgPSDmlrnlnZcgQSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIEosIFEsIEtcbi8vIC0gY2FyZF8xNCB+IGNhcmRfMjYgPSDmooXoirEgQSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIEosIFEsIEtcbi8vIC0gY2FyZF8yNyB+IGNhcmRfMzkgPSDnuqLlv4MgQSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIEosIFEsIEtcbi8vIC0gY2FyZF80MCB+IGNhcmRfNTIgPSDpu5HmoYMgQSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIEosIFEsIEtcbi8vXG4vLyDmnI3liqHnq6/mlbDmja7moLzlvI/vvJpcbi8vIC0gc3VpdDogMD3imaAo6buR5qGDKSwgMT3imaUo57qi5b+DKSwgMj3imaMo5qKF6IqxKSwgMz3imaYo5pa55Z2XKSwgND3njotcbi8vIC0gcmFuazogMy0xND0z5YiwQSwgMTU9MiwgMTY95bCP546LLCAxNz3lpKfnjotcblxudmFyIFJvb21TdGF0ZSA9IHdpbmRvdy5Sb29tU3RhdGUgfHwge31cblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcbiAgICBuYW1lOiAnY2FyZCcsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGNhcmRzX3Nwcml0ZV9hdGxhczogY2MuU3ByaXRlQXRsYXMsXG4gICAgfSxcblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIHRoaXMuZmxhZyA9IGZhbHNlXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSAyMFxuXG4gICAgICAgIHRoaXMubm9kZS5vbihcInJlc2V0X2NhcmRfZmxhZ1wiLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBpZih0aGlzLmZsYWcgPT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFnID0gZmFsc2VcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUueSAtPSB0aGlzLm9mZnNldF95XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge30sXG5cbiAgICBpbml0X2RhdGEgKGRhdGEpIHt9LFxuXG4gICAgc2V0VG91Y2hFdmVudCAoKSB7XG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbFxuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5wbGF5ZXJEYXRhKSByZXR1cm5cblxuICAgICAgICBpZiAodGhpcy5hY2NvdW50aWQgPT0gbXlnbG9iYWwucGxheWVyRGF0YS5hY2NvdW50SUQpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCwgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlkJHkuIrmn6Xmib4gZ2FtZVNjZW5lIOiKgueCuVxuICAgICAgICAgICAgICAgIHZhciBnYW1lU2NlbmVfbm9kZSA9IHRoaXMuX2ZpbmRHYW1lU2NlbmVOb2RlKClcbiAgICAgICAgICAgICAgICBpZiAoIWdhbWVTY2VuZV9ub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIvCfg48gW2NhcmRdIOacquaJvuWIsCBnYW1lU2NlbmUg6IqC54K5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBnYW1lU2NlbmUgPSBnYW1lU2NlbmVfbm9kZS5nZXRDb21wb25lbnQoXCJnYW1lU2NlbmVcIilcbiAgICAgICAgICAgICAgICBpZiAoIWdhbWVTY2VuZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCLwn4OPIFtjYXJkXSDmnKrmib7liLAgZ2FtZVNjZW5lIOe7hOS7tlwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2FtZVNjZW5lLnJvb21zdGF0ZSA9PSBSb29tU3RhdGUuUk9PTV9QTEFZSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsYWcgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IHRoaXMub2Zmc2V0X3lcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKjllK/kuIDmoIfor4bnrKYge3N1aXQsIHJhbmt9IOmAieeJjFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZVNjZW5lX25vZGUuZW1pdChcImNob29zZV9jYXJkX2V2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkaWQ6IHRoaXMuY2FyZF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkX2RhdGE6IHRoaXMuY2FyZF9kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUueSAtPSB0aGlzLm9mZnNldF95XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5L2/55So5ZSv5LiA5qCH6K+G56ymIHtzdWl0LCByYW5rfSDlj5bmtojpgInniYxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVTY2VuZV9ub2RlLmVtaXQoXCJ1bmNob29zZV9jYXJkX2V2ZW50XCIsIHRoaXMuY2FyZF9pZClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5ZCR5LiK5p+l5om+IGdhbWVTY2VuZSDoioLngrlcbiAgICAgKi9cbiAgICBfZmluZEdhbWVTY2VuZU5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZVxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIGdhbWVTY2VuZSA9IG5vZGUuZ2V0Q29tcG9uZW50KFwiZ2FtZVNjZW5lXCIpXG4gICAgICAgICAgICBpZiAoZ2FtZVNjZW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOOAkOaguOW/g+OAkeaYvuekuuWNoeeJjFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjYXJkIC0g5pyN5Yqh56uv5Y6f5aeL5Y2h54mM5pWw5o2uXG4gICAgICovXG4gICAgc2hvd0NhcmRzIChjYXJkLCBhY2NvdW50aWQpIHtcbiAgICAgICAgaWYgKCFjYXJkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+DjyBbc2hvd0NhcmRzXSDljaHniYzmlbDmja7kuLrnqbpcIilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYXJkX2RhdGEgPSBjYXJkXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKggc3VpdCtyYW5rIOe7hOWQiOS9nOS4uuWUr+S4gOagh+ivhuespu+8jOiAjOS4jeaYr+WPqueUqCByYW5rXG4gICAgICAgIC8vIOi/meagt+WPr+S7peato+ehruWMuuWIhuebuOWQjOeJjOmdouWAvOS9huS4jeWQjOiKseiJsueahOeJjO+8iOWmgiDimaBKIOWSjCDimaVK77yJXG4gICAgICAgIHRoaXMuY2FyZF9pZCA9IHtcbiAgICAgICAgICAgIHN1aXQ6IGNhcmQuc3VpdCxcbiAgICAgICAgICAgIHJhbms6IGNhcmQucmFua1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFjY291bnRpZCkge1xuICAgICAgICAgICAgdGhpcy5hY2NvdW50aWQgPSBhY2NvdW50aWRcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcHJpdGVLZXkgPSB0aGlzLl9nZXRTcHJpdGVLZXkoY2FyZClcblxuICAgICAgICBpZiAoIXNwcml0ZUtleSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfg48gW3Nob3dDYXJkc10g5peg5rOV6K+G5Yir55qE54mM5pWw5o2uOlwiLCBKU09OLnN0cmluZ2lmeShjYXJkKSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN1aXROYW1lID0gdGhpcy5fZ2V0U3VpdE5hbWUoY2FyZC5zdWl0KVxuICAgICAgICB2YXIgcmFua05hbWUgPSB0aGlzLl9nZXRSYW5rTmFtZShjYXJkLnJhbmspXG5cbiAgICAgICAgdmFyIHNwcml0ZUZyYW1lID0gdGhpcy5jYXJkc19zcHJpdGVfYXRsYXMuZ2V0U3ByaXRlRnJhbWUoc3ByaXRlS2V5KVxuICAgICAgICBpZiAoc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICB0aGlzLnNldFRvdWNoRXZlbnQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfg48gW3Nob3dDYXJkc10g5om+5LiN5Yiw57K+54G15binOlwiLCBzcHJpdGVLZXkpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2dldFN1aXROYW1lOiBmdW5jdGlvbihzdWl0KSB7XG4gICAgICAgIHZhciBzdWl0TmFtZXMgPSB7IDA6IFwi4pmgXCIsIDE6IFwi4pmlXCIsIDI6IFwi4pmjXCIsIDM6IFwi4pmmXCIsIDQ6IFwi546LXCIgfVxuICAgICAgICByZXR1cm4gc3VpdE5hbWVzW3N1aXRdIHx8IFwiP1wiXG4gICAgfSxcblxuICAgIF9nZXRSYW5rTmFtZTogZnVuY3Rpb24ocmFuaykge1xuICAgICAgICBpZiAocmFuayA9PT0gMTYpIHJldHVybiBcIuWwj+eOi1wiXG4gICAgICAgIGlmIChyYW5rID09PSAxNykgcmV0dXJuIFwi5aSn546LXCJcbiAgICAgICAgdmFyIHJhbmtOYW1lcyA9IHtcbiAgICAgICAgICAgIDM6IFwiM1wiLCA0OiBcIjRcIiwgNTogXCI1XCIsIDY6IFwiNlwiLCA3OiBcIjdcIiwgODogXCI4XCIsIDk6IFwiOVwiLFxuICAgICAgICAgICAgMTA6IFwiMTBcIiwgMTE6IFwiSlwiLCAxMjogXCJRXCIsIDEzOiBcIktcIiwgMTQ6IFwiQVwiLCAxNTogXCIyXCJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmFua05hbWVzW3JhbmtdIHx8IFN0cmluZyhyYW5rKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDjgJDmoLjlv4PjgJHmoLnmja7mnI3liqHnq6/mlbDmja7orqHnrpfnsr7ngbXplK7lkI1cbiAgICAgKlxuICAgICAqIPCflKfjgJDlt7Lpqozor4HjgJHmraPnoa7nmoTnsr7ngbXmmKDlsITooajvvIjmoLnmja7lrp7pmYXlm77niYfvvInvvJpcbiAgICAgKiAtIGNhcmRfNTMgPSDnuqLoibJKT0tFUiA9IOWkp+eOi1xuICAgICAqIC0gY2FyZF81NCA9IOm7keiJskpPS0VSID0g5bCP546LXG4gICAgICogLSBjYXJkXzU1ID0g6IOM6Z2iXG4gICAgICogLSBjYXJkXzEgfiBjYXJkXzEzID0g5pa55Z2XIEEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCBKLCBRLCBLXG4gICAgICogLSBjYXJkXzE0IH4gY2FyZF8yNiA9IOaiheiKsSBBLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgSiwgUSwgS1xuICAgICAqIC0gY2FyZF8yNyB+IGNhcmRfMzkgPSDnuqLlv4MgQSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIEosIFEsIEtcbiAgICAgKiAtIGNhcmRfNDAgfiBjYXJkXzUyID0g6buR5qGDIEEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCBKLCBRLCBLXG4gICAgICpcbiAgICAgKiDmnI3liqHnq6/mlbDmja7moLzlvI/vvJpcbiAgICAgKiAtIHN1aXQ6IDA94pmgKOm7keahgyksIDE94pmlKOe6ouW/gyksIDI94pmjKOaiheiKsSksIDM94pmmKOaWueWdlyksIDQ9546LXG4gICAgICogLSByYW5rOiAzLTE0PTPliLBBLCAxNT0yLCAxNj3lsI/njossIDE3PeWkp+eOi1xuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNhcmQgLSDmnI3liqHnq6/ljaHniYzmlbDmja5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSDnsr7ngbXplK7lkI1cbiAgICAgKi9cbiAgICBfZ2V0U3ByaXRlS2V5OiBmdW5jdGlvbihjYXJkKSB7XG4gICAgICAgIHZhciBzdWl0ID0gY2FyZC5zdWl0XG4gICAgICAgIHZhciByYW5rID0gY2FyZC5yYW5rXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkp+Wwj+eOi+aYoOWwhCAtIOW3suabtOato1xuICAgICAgICAvLyDnsr7ngbXlm77pm4bkuK3vvJpcbiAgICAgICAgLy8gLSBjYXJkXzUzID0g57qi6ImySk9LRVIgPSDlpKfnjotcbiAgICAgICAgLy8gLSBjYXJkXzU0ID0g6buR6ImySk9LRVIgPSDlsI/njotcbiAgICAgICAgLy8g5pyN5Yqh56uv5pWw5o2u77yaXG4gICAgICAgIC8vIC0gcmFuayA9IDE2ID0g5bCP546LXG4gICAgICAgIC8vIC0gcmFuayA9IDE3ID0g5aSn546LXG4gICAgICAgIGlmIChyYW5rID09PSAxNikgcmV0dXJuIFwiY2FyZF81NFwiICAgLy8g5bCP546LIOKGkiDpu5HoibJKT0tFUlxuICAgICAgICBpZiAocmFuayA9PT0gMTcpIHJldHVybiBcImNhcmRfNTNcIiAgIC8vIOWkp+eOiyDihpIg57qi6ImySk9LRVJcblxuICAgICAgICAvLyDpqozor4HmlbDmja7mnInmlYjmgKdcbiAgICAgICAgaWYgKHN1aXQgPCAwIHx8IHN1aXQgPiAzIHx8IHJhbmsgPCAzIHx8IHJhbmsgPiAxNSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfg48gW19nZXRTcHJpdGVLZXldIOaXoOaViOeahOeJjOaVsOaNrjogc3VpdD1cIiArIHN1aXQgKyBcIiwgcmFuaz1cIiArIHJhbmspXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5bCG5pyN5Yqh56uvcmFua+i9rOaNouS4uueyvueBtee0ouW8le+8iEE9MCwgMj0xLCAzPTIsIC4uLiwgSz0xMu+8iVxuICAgICAgICB2YXIgcG9pbnRJbmRleFxuICAgICAgICBpZiAocmFuayA9PT0gMTQpIHtcbiAgICAgICAgICAgIHBvaW50SW5kZXggPSAwICAgLy8gQVxuICAgICAgICB9IGVsc2UgaWYgKHJhbmsgPT09IDE1KSB7XG4gICAgICAgICAgICBwb2ludEluZGV4ID0gMSAgIC8vIDJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvaW50SW5kZXggPSByYW5rIC0gMSAgLy8gMy0xMyAtPiAyLTEyXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmoLnmja7oirHoibLorqHnrpfln7rnoYDlgY/np7tcbiAgICAgICAgLy8g5pyN5Yqh56uvOiBzdWl0IDA94pmgKOm7keahgyksIDE94pmlKOe6ouW/gyksIDI94pmjKOaiheiKsSksIDM94pmmKOaWueWdlylcbiAgICAgICAgLy8g57K+54G1OiBjYXJkXzF+MTM95pa55Z2XLCBjYXJkXzE0fjI2PeaiheiKsSwgY2FyZF8yN34zOT3nuqLlv4MsIGNhcmRfNDB+NTI96buR5qGDXG4gICAgICAgIHZhciBiYXNlT2Zmc2V0XG4gICAgICAgIHN3aXRjaCAoc3VpdCkge1xuICAgICAgICAgICAgY2FzZSAzOiBiYXNlT2Zmc2V0ID0gMDsgYnJlYWsgICAvLyDmlrnlnZc6IGNhcmRfMSB+IGNhcmRfMTNcbiAgICAgICAgICAgIGNhc2UgMjogYmFzZU9mZnNldCA9IDEzOyBicmVhayAgLy8g5qKF6IqxOiBjYXJkXzE0IH4gY2FyZF8yNlxuICAgICAgICAgICAgY2FzZSAxOiBiYXNlT2Zmc2V0ID0gMjY7IGJyZWFrICAvLyDnuqLlv4M6IGNhcmRfMjcgfiBjYXJkXzM5XG4gICAgICAgICAgICBjYXNlIDA6IGJhc2VPZmZzZXQgPSAzOTsgYnJlYWsgIC8vIOm7keahgzogY2FyZF80MCB+IGNhcmRfNTJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGJhc2VPZmZzZXQgPSAwXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FyZEluZGV4ID0gYmFzZU9mZnNldCArIHBvaW50SW5kZXggKyAxXG5cbiAgICAgICAgcmV0dXJuIFwiY2FyZF9cIiArIGNhcmRJbmRleFxuICAgIH1cbn0pO1xuIl19