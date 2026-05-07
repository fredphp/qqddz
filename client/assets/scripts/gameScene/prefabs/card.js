// 使用全局变量，不使用 require
// 【彻底修复版本】基于用户确认的正确映射表
//
// 正确的精灵映射表：
// - card_53 = 小王
// - card_54 = 大王
// - card_55 = 背面
// - card_1 ~ card_13 = 方块 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_14 ~ card_26 = 梅花 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_27 ~ card_39 = 红心 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
// - card_40 ~ card_52 = 黑桃 A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K

var RoomState = window.RoomState || {}

cc.Class({
    extends: cc.Component,
    name: 'card',

    properties: {
        cards_sprite_atlas: cc.SpriteAtlas,
    },

    onLoad () {
        this.flag = false
        this.offset_y = 20

        this.node.on("reset_card_flag", function(event){
            if(this.flag == true){
                this.flag = false
                this.node.y -= this.offset_y
            }
        }.bind(this))
    },

    runToCenter(){
    },

    start () {
    },

    init_data (data) {
    },

    setTouchEvent () {
        var myglobal = window.myglobal
        if (!myglobal || !myglobal.playerData) return

        if (this.accountid == myglobal.playerData.accountID) {
            this.node.on(cc.Node.EventType.TOUCH_START, function(event){
                var gameScene_node = this.node.parent
                if (!gameScene_node) return

                var gameScene = gameScene_node.getComponent("gameScene")
                if (!gameScene) return

                if (gameScene.roomstate == RoomState.ROOM_PLAYING) {
                    if (this.flag == false) {
                        this.flag = true
                        this.node.y += this.offset_y
                        gameScene_node.emit("choose_card_event", {
                            cardid: this.card_id,
                            card_data: this.card_data,
                        })
                    } else {
                        this.flag = false
                        this.node.y -= this.offset_y
                        gameScene_node.emit("unchoose_card_event", this.card_id)
                    }
                }
            }.bind(this))
        }
    },

    /**
     * 【核心】显示卡牌
     * @param {Object} card - 服务端原始卡牌数据
     */
    showCards (card, accountid) {
        if (!card) {
            console.error("🃏 [showCards] 卡牌数据为空")
            return
        }

        // 🔧【修复】使用 suit+rank 组合作为唯一标识符，而不是只用 rank 或 index
        // 这样可以正确区分相同牌面值但不同花色的牌（如 ♠J 和 ♥J）
        this.card_id = {
            suit: card.suit,
            rank: card.rank,
            // 保留原始 index 用于兼容
            index: card.index
        }
        this.card_data = card

        if (accountid) {
            this.accountid = accountid
        }

        var spriteKey = this._getSpriteKey(card)

        if (!spriteKey) {
            console.error("🃏 [showCards] 无法识别的牌数据:", JSON.stringify(card))
            return
        }

        var suitName = this._getSuitName(card.suit)
        var rankName = this._getRankName(card.rank || card.value)
        console.log("🃏 [showCards] 渲染牌: " + suitName + rankName + " (suit=" + card.suit + ", rank=" + (card.rank || card.value) + ") -> " + spriteKey)

        var spriteFrame = this.cards_sprite_atlas.getSpriteFrame(spriteKey)
        if (spriteFrame) {
            this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
            this.setTouchEvent()
        } else {
            console.error("🃏 [showCards] 找不到精灵帧:", spriteKey)
        }
    },

    _getSuitName: function(suit) {
        var suitNames = { 0: "♠", 1: "♥", 2: "♣", 3: "♦", 4: "王" }
        return suitNames[suit] || "?"
    },

    _getRankName: function(rank) {
        // 支持 king 字段（客户端旧格式）
        if (rank === 14 || rank === "14") return "小王"
        if (rank === 15 || rank === "15") return "大王"
        if (rank === 16) return "小王"
        if (rank === 17) return "大王"

        var rankNames = {
            3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9",
            10: "10", 11: "J", 12: "Q", 13: "K", 14: "A", 15: "2",
            // 支持 value 字段（客户端旧格式）
            1: "3", 2: "4", 3: "5", 4: "6", 5: "7", 6: "8", 7: "9",
            8: "10", 9: "J", 10: "Q", 11: "K", 12: "A", 13: "2"
        }
        return rankNames[rank] || String(rank)
    },

    /**
     * 【核心】根据服务端数据计算精灵键名
     *
     * 支持两种数据格式：
     * 1. nclient格式：rank(3-17), suit(0-4)
     * 2. client格式：value(1-13), suit(0-3), king(14/15)
     *
     * @param {Object} card - 服务端卡牌数据
     * @returns {String} 精灵键名
     */
    _getSpriteKey: function(card) {
        // 检查是否是大小王
        // 方式1：通过 king 字段（client格式）
        var kingValue = card.king
        if (kingValue !== undefined) {
            if (typeof kingValue === 'string') {
                kingValue = parseInt(kingValue)
            }
            if (kingValue === 14) return "card_53"  // 小王
            if (kingValue === 15) return "card_54"  // 大王
        }

        // 方式2：通过 rank 字段（nclient格式）
        var rank = card.rank
        if (rank !== undefined) {
            if (rank === 16) return "card_53"  // 小王
            if (rank === 17) return "card_54"  // 大王
        }

        var suit = card.suit

        // 支持 value 字段（client格式）
        var value = card.value
        if (value !== undefined) {
            // client格式：value(1=3, 2=4, ..., 12=A, 13=2)
            // 验证数据有效性
            if (suit < 0 || suit > 3) {
                console.error("🃏 [_getSpriteKey] 无效的 suit:", suit)
                return null
            }
            if (value < 1 || value > 13) {
                console.error("🃏 [_getSpriteKey] 无效的 value:", value)
                return null
            }

            // 将 value 转换为精灵索引
            // value: 1=3, 2=4, ..., 12=A, 13=2
            // 精灵顺序: A=0, 2=1, 3=2, ..., K=12
            var pointIndex
            if (value === 12) {
                pointIndex = 0   // A
            } else if (value === 13) {
                pointIndex = 1   // 2
            } else {
                pointIndex = value + 1  // 3-11 -> 2-12
            }

            // 根据花色计算基础偏移
            var baseOffset
            switch (suit) {
                case 3: baseOffset = 0; break   // 方块
                case 2: baseOffset = 13; break  // 梅花
                case 1: baseOffset = 26; break  // 红心
                case 0: baseOffset = 39; break  // 黑桃
                default: baseOffset = 0
            }

            var cardIndex = baseOffset + pointIndex + 1
            return "card_" + cardIndex
        }

        // 支持 rank 字段（nclient格式）
        if (rank !== undefined) {
            // nclient格式：rank(3-14=3到A, 15=2)
            // 验证数据有效性
            if (suit < 0 || suit > 3 || rank < 3 || rank > 15) {
                console.error("🃏 [_getSpriteKey] 无效的牌数据: suit=" + suit + ", rank=" + rank)
                return null
            }

            // 将服务端rank转换为精灵索引
            var pointIndex
            if (rank === 14) {
                pointIndex = 0   // A
            } else if (rank === 15) {
                pointIndex = 1   // 2
            } else {
                pointIndex = rank - 1  // 3-13 -> 2-12
            }

            // 根据花色计算基础偏移
            var baseOffset
            switch (suit) {
                case 3: baseOffset = 0; break   // 方块
                case 2: baseOffset = 13; break  // 梅花
                case 1: baseOffset = 26; break  // 红心
                case 0: baseOffset = 39; break  // 黑桃
                default: baseOffset = 0
            }

            var cardIndex = baseOffset + pointIndex + 1
            return "card_" + cardIndex
        }

        console.error("🃏 [_getSpriteKey] 无法识别的牌数据格式:", JSON.stringify(card))
        return null
    }
});
