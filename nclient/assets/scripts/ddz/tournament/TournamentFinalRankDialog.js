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
 */

cc.Class({
    extends: cc.Component,

    properties: {
        // 期号标签
        periodNoLabel: {
            type: cc.Label,
            default: null
        },
        // 总参赛人数标签
        totalPlayersLabel: {
            type: cc.Label,
            default: null
        },
        // 冠军节点
        championNode: {
            type: cc.Node,
            default: null
        },
        // 亚军节点
        runnerUpNode: {
            type: cc.Node,
            default: null
        },
        // 季军节点
        thirdPlaceNode: {
            type: cc.Node,
            default: null
        },
        // TOP20 ScrollView
        top20ScrollView: {
            type: cc.ScrollView,
            default: null
        },
        // 排行榜item模板
        rankItemPrefab: {
            type: cc.Prefab,
            default: null
        },
        // 我的排名标签
        myRankLabel: {
            type: cc.Label,
            default: null
        },
        // 我的金币标签
        myCoinLabel: {
            type: cc.Label,
            default: null
        },
        // 确认按钮
        confirmBtn: {
            type: cc.Button,
            default: null
        },
        // 冠军奖杯节点
        trophyNode: {
            type: cc.Node,
            default: null
        },
        // 冠军发光效果节点
        championGlowNode: {
            type: cc.Node,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化数据
        this._data = null
        this._top3 = []
        this._top20 = []
        this._myRank = 0
        this._myMatchCoin = 0

        // 注册按钮事件
        if (this.confirmBtn) {
            this.confirmBtn.node.on('click', this.onConfirmClick, this)
        }
    },

    start () {
        // 启动冠军特效动画
        this._startChampionEffects()
    },

    // ============================================================
    // 公共方法
    // ============================================================

    /**
     * 设置数据
     * @param {Object} data - { period_no, total_players, top3, top20, my_rank, my_match_coin }
     */
    setData: function(data) {
        this._data = data
        this._periodNo = data.period_no || ""
        this._totalPlayers = data.total_players || 0
        this._top3 = data.top3 || []
        this._top20 = data.top20 || []
        this._myRank = data.my_rank || 0
        this._myMatchCoin = data.my_match_coin || 0

        this._updateUI()
    },

    // ============================================================
    // UI更新
    // ============================================================

    _updateUI: function() {
        // 更新期号
        if (this.periodNoLabel) {
            this.periodNoLabel.string = "第" + this._periodNo + "期赛事结束"
        }

        // 更新总参赛人数
        if (this.totalPlayersLabel) {
            this.totalPlayersLabel.string = "共" + this._totalPlayers + "人参赛"
        }

        // 更新前三名
        this._updateTop3()

        // 更新TOP20列表
        this._updateTop20List()

        // 更新我的排名
        if (this.myRankLabel) {
            if (this._myRank > 0) {
                this.myRankLabel.string = "我的排名：第" + this._myRank + "名"
            } else {
                this.myRankLabel.string = "我的排名：未上榜"
            }
        }

        // 更新我的金币
        if (this.myCoinLabel) {
            this.myCoinLabel.string = "最终金币：" + this._myMatchCoin
        }
    },

    _updateTop3: function() {
        // 更新冠军
        if (this._top3.length >= 1 && this.championNode) {
            this._updatePodiumNode(this.championNode, this._top3[0], 1)
        }

        // 更新亚军
        if (this._top3.length >= 2 && this.runnerUpNode) {
            this._updatePodiumNode(this.runnerUpNode, this._top3[1], 2)
        }

        // 更新季军
        if (this._top3.length >= 3 && this.thirdPlaceNode) {
            this._updatePodiumNode(this.thirdPlaceNode, this._top3[2], 3)
        }
    },

    /**
     * 更新领奖台节点
     * @param {cc.Node} node - 领奖台节点
     * @param {Object} data - 玩家数据 { player_name, match_coin, avatar, is_robot }
     * @param {number} rank - 排名
     */
    _updatePodiumNode: function(node, data, rank) {
        // 名次标签
        var rankLabel = node.getChildByName("RankLabel")
        if (rankLabel) {
            rankLabel.getComponent(cc.Label).string = this._getRankText(rank)
        }

        // 昵称标签
        var nameLabel = node.getChildByName("NameLabel")
        if (nameLabel) {
            nameLabel.getComponent(cc.Label).string = data.player_name || "玩家"
        }

        // 金币标签
        var coinLabel = node.getChildByName("CoinLabel")
        if (coinLabel) {
            coinLabel.getComponent(cc.Label).string = data.match_coin || 0
        }

        // 头像（如果有）
        var avatarSprite = node.getChildByName("AvatarSprite")
        if (avatarSprite) {
            // TODO: 加载头像
            // 这里可以根据 data.avatar 或 data.is_robot 设置不同头像
        }

        // 机器人标识
        if (data.is_robot) {
            var robotTag = node.getChildByName("RobotTag")
            if (!robotTag) {
                // 创建机器人标签
                robotTag = new cc.Node("RobotTag")
                var label = robotTag.addComponent(cc.Label)
                label.string = "🤖"
                label.fontSize = 20
                robotTag.setPosition(50, 20)
                node.addChild(robotTag)
            }
        }
    },

    _updateTop20List: function() {
        if (!this.top20ScrollView || !this.rankItemPrefab) return

        var content = this.top20ScrollView.content
        content.removeAllChildren()

        for (var i = 0; i < this._top20.length; i++) {
            var itemData = this._top20[i]
            var item = cc.instantiate(this.rankItemPrefab)
            
            // 设置item数据
            this._updateRankItem(item, itemData, i + 1)
            
            content.addChild(item)
        }
    },

    /**
     * 更新排行榜item
     * @param {cc.Node} item - item节点
     * @param {Object} data - 玩家数据
     * @param {number} rank - 排名
     */
    _updateRankItem: function(item, data, rank) {
        // 排名
        var rankLabel = item.getChildByName("RankLabel")
        if (rankLabel) {
            rankLabel.getComponent(cc.Label).string = this._getRankText(rank)
        }

        // 昵称
        var nameLabel = item.getChildByName("NameLabel")
        if (nameLabel) {
            nameLabel.getComponent(cc.Label).string = data.player_name || "玩家"
        }

        // 金币
        var coinLabel = item.getChildByName("CoinLabel")
        if (coinLabel) {
            coinLabel.getComponent(cc.Label).string = data.match_coin || 0
        }

        // 机器人标识
        var robotTag = item.getChildByName("RobotTag")
        if (robotTag) {
            robotTag.active = data.is_robot || false
        }
    },

    // ============================================================
    // 动画效果
    // ============================================================

    _startChampionEffects: function() {
        // 奖杯弹跳动画
        if (this.trophyNode) {
            var jumpUp = cc.moveBy(0.5, cc.v2(0, 10))
            var jumpDown = cc.moveBy(0.5, cc.v2(0, -10))
            var sequence = cc.sequence(jumpUp, jumpDown)
            var repeat = cc.repeatForever(sequence)
            this.trophyNode.runAction(repeat)
        }

        // 发光效果闪烁
        if (this.championGlowNode) {
            var fadeIn = cc.fadeIn(0.5)
            var fadeOut = cc.fadeOut(0.5)
            var sequence = cc.sequence(fadeIn, fadeOut)
            var repeat = cc.repeatForever(sequence)
            this.championGlowNode.runAction(repeat)
        }

        // 冠军节点缩放呼吸效果
        if (this.championNode) {
            var scaleUp = cc.scaleTo(0.8, 1.05)
            var scaleDown = cc.scaleTo(0.8, 1.0)
            var sequence = cc.sequence(scaleUp, scaleDown)
            var repeat = cc.repeatForever(sequence)
            this.championNode.runAction(repeat)
        }
    },

    _stopChampionEffects: function() {
        if (this.trophyNode) {
            this.trophyNode.stopAllActions()
        }
        if (this.championGlowNode) {
            this.championGlowNode.stopAllActions()
        }
        if (this.championNode) {
            this.championNode.stopAllActions()
        }
    },

    // ============================================================
    // 按钮事件
    // ============================================================

    onConfirmClick: function() {
        console.log("🏆 [TournamentFinalRank] 点击确认，返回大厅")

        // 停止动画
        this._stopChampionEffects()

        // 关闭弹窗
        this.node.destroy()

        // 返回大厅
        cc.director.loadScene("hallScene")
    },

    // ============================================================
    // 辅助方法
    // ============================================================

    _getRankText: function(rank) {
        switch (rank) {
            case 1:
                return "🥇 冠军"
            case 2:
                return "🥈 亚军"
            case 3:
                return "🥉 季军"
            default:
                return "第" + rank + "名"
        }
    }
});
