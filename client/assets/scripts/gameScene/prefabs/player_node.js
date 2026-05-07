// 使用全局变量，不使用 require
// 【修复版本】简化对手牌背显示，直接创建 17 张牌背
// 核心原则：
// 1. 收到 push_card_event 后直接显示 17 张牌背
// 2. 不依赖定时器或动画调度
// 3. 保证数据正确性

var qian_state = window.qian_state || { buqiang: 0, qian: 1 }

cc.Class({
    extends: cc.Component,
    name: 'player_node',

    properties: {
        account_label: cc.Label,
        nickname_label: cc.Label,
        room_touxiang: cc.Sprite,
        globalcount_label: cc.Label,
        room_money_frame: cc.Node,     // 金币背景框
        headimage: cc.Sprite,
        readyimage: cc.Node,
        offlineimage: cc.Node,
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
        masterIcon: cc.Node,
    },

    onLoad () {
      this.readyimage.active = false
      this.offlineimage.active = false
      this.currentCardCount = 17
      this.cardlist_node = []
      
      // 游戏开始事件
      this.node.on("gamestart_event", function(event) {
        this.readyimage.active = false
        if (this.card_node) {
            this.card_node.active = false
            this.card_node.removeAllChildren(true)
        }
        this.cardlist_node = []
        this.currentCardCount = 17
        console.log("🃏 [player_node] gamestart_event: 清理 card_node")
      }.bind(this))

      // 【核心】发牌事件 - 直接显示 17 张牌背
      this.node.on("push_card_event", function(event) {
        var myglobal = window.myglobal
        console.log("🃏 [player_node] === push_card_event 开始 ===")
        
        if (!myglobal) {
            console.error("🃏 [player_node] push_card_event: myglobal 不存在！")
            return
        }
        
        var myPlayerId = this._getMyPlayerId(myglobal)
        var accountIdStr = String(this.accountid || "")
        
        // 如果是自己，跳过
        if(myPlayerId === accountIdStr && accountIdStr !== ""){
            console.log("🃏 [player_node] 是自己，跳过创建牌背")
            return
        }
        
        console.log("🃏 [player_node] 不是自己，创建 17 张牌背")
        this.showCardBacks(17)
      }.bind(this))

      // 抢地主事件
      this.node.on("playernode_rob_state_event", function(event) {
          var detail = event
          if(detail.accountid == this.accountid){
            this.qiangdidzhu_node.active = false
          }

          if(this.accountid == detail.accountid){
            if(detail.state == qian_state.qian){
              console.log("🃏 [player_node] this.robIcon_Sp.active = true")
              this.robIcon_Sp.active = true
            }else if(detail.state == qian_state.buqiang){
              this.robnoIcon_Sp.active = true
            }else{
              console.log("🃏 [player_node] get rob value :" + detail.state)
            }
          }
      }.bind(this))

      // 成为地主事件
      this.node.on("playernode_changemaster_event", function(event) {
         var detail = event 
         this.robIcon_Sp.active = false
         this.robnoIcon_Sp.active = false
         if(detail == this.accountid){
            this.masterIcon.active = true
            this.currentCardCount = 20
            this.showCardBacks(20)
         }
      }.bind(this))
      
      // 牌数更新事件
      this.node.on("update_card_count_event", function(data) {
         if(data.accountid == this.accountid){
            this.currentCardCount = data.count
            this.showCardBacks(data.count)
            console.log("🃏 [player_node] 更新玩家 " + this.accountid + " 的牌数为: " + data.count)
         }
      }.bind(this))
      
      // 【新增】玩家状态更新事件（掉线/上线/托管）
      this.node.on("player_state_update", function(data) {
         console.log("📶 [player_node] 玩家状态更新:", JSON.stringify(data))
         this._updatePlayerState(data)
      }.bind(this))
      
      // 🕐【新增】倒计时更新事件
      this.node.on("update_countdown_event", function(data) {
         // 只更新当前玩家的倒计时显示
         if (this.seat_index === 0) {
            if (this.time_label) {
               this.time_label.string = String(data.remaining)
            }
         }
      }.bind(this))
    },

    start () {
    },
    
    /**
     * 获取当前玩家ID
     */
    _getMyPlayerId: function(myglobal) {
        var myPlayerId = null
        
        if (myglobal.socket && myglobal.socket.getPlayerInfo) {
            var playerInfo = myglobal.socket.getPlayerInfo()
            if (playerInfo && playerInfo.id) {
                myPlayerId = playerInfo.id
            }
        }
        
        if (!myPlayerId && myglobal.playerData && myglobal.playerData.serverPlayerId) {
            myPlayerId = myglobal.playerData.serverPlayerId
        }
        
        if (!myPlayerId && myglobal.playerData && myglobal.playerData.accountID) {
            myPlayerId = myglobal.playerData.accountID
        }
        
        return String(myPlayerId || "")
    },

    init_data(data, index) {
      var myglobal = window.myglobal
      console.log("🃏 [player_node] === init_data 开始 ===")
      console.log("🃏 [player_node] init_data data:", JSON.stringify(data))

      this.accountid = data.accountid
      this.seat_index = index
      console.log("🃏 [player_node] 设置 this.accountid:", this.accountid)

      // 同步玩家ID
      if (myglobal && myglobal.playerData && !myglobal.playerData.serverPlayerId) {
          if (myglobal.socket && myglobal.socket.getPlayerInfo) {
              var playerInfo = myglobal.socket.getPlayerInfo()
              if (playerInfo && playerInfo.id) {
                  myglobal.playerData.serverPlayerId = playerInfo.id
              }
          }
      }

      this.account_label.node.active = false
      this.nickname_label.string = data.nick_name || ("玩家" + (index + 1))
      this.globalcount_label.string = data.goldcount || "0"
      this.cardlist_node = []

      // 检查准备状态
      var isReady = data.isready || data.ready || data.IsReady || false
      if(isReady == true || isReady === "true" || isReady === 1){
        this.readyimage.active = true
      } else {
        this.readyimage.active = false
      }

      // 【核心修改】当前玩家（index == 0）：隐藏牌背，调整头像位置
      if (index == 0) {
        // 隐藏牌背节点
        if (this.card_node) {
          this.card_node.active = false
        }
        // 调整头像位置到牌背位置（牌背位置：[80, 32]）
        if (this.room_touxiang) {
          this.room_touxiang.node.x = 80
          this.room_touxiang.node.y = 32
        }
        if (this.headimage) {
          this.headimage.node.x = 80
          this.headimage.node.y = 32
        }
        // 调整昵称标签位置（相对于头像位置）
        if (this.nickname_label && this.nickname_label.node) {
          this.nickname_label.node.x = 63
          this.nickname_label.node.y = -1
        }
        // 调整金币标签位置（相对于头像位置）
        if (this.globalcount_label && this.globalcount_label.node) {
          this.globalcount_label.node.x = 63
          this.globalcount_label.node.y = -40
        }
        // 调整金币背景框位置（与金币标签对齐）
        if (this.room_money_frame) {
          this.room_money_frame.x = 63
          this.room_money_frame.y = -40
        }
        // 调整准备图标位置（头像右下角）
        if (this.readyimage) {
          this.readyimage.x = 105
          this.readyimage.y = 5
        }
        // 调整地主图标位置（头像右下角）
        if (this.masterIcon) {
          this.masterIcon.x = 105
          this.masterIcon.y = 5
        }
        console.log("🃏 [player_node] 当前玩家(index=0)：隐藏牌背，头像位置调整到 [80, 32]")
      }

      // 设置层级
      if (this.room_touxiang && this.headimage) {
          this.headimage.node.zIndex = 0
          this.room_touxiang.node.zIndex = 100
          this.headimage.node.parent.sortAllChildren()
      }

      // 加载头像
      var str = data.avatarUrl || data.avatarurl || "avatar_1"
      var head_image_path = "UI/headimage/" + str
      var self = this
      cc.loader.loadRes(head_image_path, cc.SpriteFrame, function(err, spriteFrame) {
          if (err) {
              cc.loader.loadRes("UI/headimage/avatar_1", cc.SpriteFrame, function(err2, fallbackSprite) {
                  if (!err2) self._setAvatarSprite(fallbackSprite)
              })
              return
          }
          self._setAvatarSprite(spriteFrame)
      })

      // 准备通知
      this.node.on("player_ready_notify", function(event) {
          var detail = event
          var readyPlayerId = ""
          if (typeof detail === 'object' && detail !== null) {
              readyPlayerId = detail.player_id || detail.playerId || detail.id || ""
          } else {
              readyPlayerId = detail
          }

          if(readyPlayerId == this.accountid){
              this.readyimage.active = true
          }
      }.bind(this))

      // 抢地主通知
      // 🔧【修复】接收包含 player_id 和 timeout 的事件对象，不再硬编码
      this.node.on("playernode_canrob_event", function(event) {
          console.log("🎯 [player_node] 收到 playernode_canrob_event:", JSON.stringify(event))
          
          // 兼容处理：event 可能是字符串（旧格式）或对象（新格式）
          var playerId = event
          var timeout = 15  // 默认 15 秒
          
          if (typeof event === 'object' && event !== null) {
              playerId = event.player_id
              timeout = event.timeout || 15
          }
          
          // 存储 timeout 值供倒计时更新使用
          this._serverTimeout = timeout
          
          if(playerId == this.accountid){
            this.qiangdidzhu_node.active = true
            if (this.time_label) {
              this.time_label.string = String(timeout)
            }
            console.log("🎯 [player_node] 显示抢地主UI, timeout: " + timeout + "秒")
          }
      }.bind(this))
      
      // 🕐 存储服务端传递的 timeout 值
      this._serverTimeout = 15

      if(index == 1){
        this.card_node.x = -this.card_node.x - 30
      }
    },

    _setAvatarSprite: function(spriteFrame) {
        if (!this.headimage || !spriteFrame) return
        this.headimage.enabled = true
        this.headimage.spriteFrame = spriteFrame
        this.headimage.node.setContentSize(80, 80)
        this.headimage.node.scale = 1
    },

    // ============================================================
    // 【核心】直接显示牌背（无动画，保证数据正确性）
    // ============================================================
    
    /**
     * 显示指定数量的牌背
     * @param {number} count - 牌背数量
     * 【重要】当前玩家（index == 0）不显示牌背
     */
    showCardBacks: function(count) {
        console.log("🃏 [player_node] showCardBacks 调用, 数量: " + count + ", accountid: " + this.accountid)
        
        // 【核心】检查是否是当前玩家（index == 0），如果是则不显示牌背
        if (this.seat_index === 0) {
            console.log("🃏 [player_node] 当前玩家(seat_index=0)，跳过显示牌背")
            return
        }
        
        if (!this.card_node) {
            console.error("🃏 [player_node] card_node 未绑定")
            return
        }
        
        // 清理旧牌
        this.card_node.removeAllChildren(true)
        this.cardlist_node = []
        
        if (count <= 0) {
            this.card_node.active = false
            this.currentCardCount = 0
            return
        }
        
        this.card_node.active = true
        this.currentCardCount = count
        
        if (!this.card_prefab) {
            console.error("🃏 [player_node] card_prefab 未绑定")
            return
        }
        
        // 直接创建所有牌背（无动画）
        for (var i = 0; i < count; i++) {
            var card = cc.instantiate(this.card_prefab)
            if (!card) continue
            
            card.scale = 0.6
            card.parent = this.card_node
            card.active = true
            
            // 垂直堆叠布局
            var height = card.height
            card.y = (count - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i
            card.x = 0
            
            this.cardlist_node.push(card)
        }
        
        console.log("🃏 [player_node] 牌背创建完成: " + this.cardlist_node.length + " 张")
    },
    
    // ============================================================
    // 【新增】玩家状态更新处理
    // ============================================================
    
    /**
     * 更新玩家状态
     * @param {Object} data - 包含 state, cards_count, is_landlord, timeout
     */
    _updatePlayerState: function(data) {
        console.log("📶 [_updatePlayerState] 状态更新:", data.state)
        
        // 更新离线/托管状态显示
        if (data.state === "offline") {
            // 玩家离线，显示离线图标
            if (this.offlineimage) {
                this.offlineimage.active = true
            }
            console.log("📴 [player_node] 玩家离线: " + this.accountid)
        } else if (data.state === "robot") {
            // 机器人托管，显示托管图标（可以复用离线图标）
            if (this.offlineimage) {
                this.offlineimage.active = true
            }
            console.log("🤖 [player_node] 机器人托管: " + this.accountid)
        } else if (data.state === "online") {
            // 玩家在线，隐藏离线图标
            if (this.offlineimage) {
                this.offlineimage.active = false
            }
            console.log("📶 [player_node] 玩家上线: " + this.accountid)
        }
        
        // 更新牌数
        if (data.cards_count !== undefined) {
            this.currentCardCount = data.cards_count
            this.showCardBacks(data.cards_count)
        }
        
        // 更新地主标识
        if (data.is_landlord !== undefined && data.is_landlord === true) {
            if (this.masterIcon) {
                this.masterIcon.active = true
            }
        }
    }
});
