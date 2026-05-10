package ddz

import (
        "crypto/md5"
        "encoding/hex"
        "errors"
        "fmt"
        "io/ioutil"
        "math/rand"
        "os"
        "path/filepath"
        "strings"
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "go.uber.org/zap"
        "gorm.io/gorm"
)

type DDZPlayerService struct{}

var DDZPlayerServiceApp = new(DDZPlayerService)

// 机器人昵称库 - 150个常用昵称
var robotNicknames = []string{
        // 自然风景类
        "星辰大海", "云端漫步", "风吹麦浪", "月光如水", "清风明月", "烟雨江南", "梦里花落", "醉美夕阳",
        "落花时节", "山水画卷", "碧海蓝天", "清风徐来", "春暖花开", "夏日清风", "秋叶静美", "冬日暖阳",
        "繁星点点", "云淡风轻", "桃花盛开", "竹影摇曳",
        // 生活情感类
        "笑对人生", "岁月静好", "简单快乐", "心向阳光", "岁月如歌", "温暖如初", "心安是归", "快乐至上",
        "悠然自得", "随遇而安", "阳光灿烂", "岁月无忧", "心中有梦", "浅笑安然", "淡然处之", "静静守候",
        "温柔时光", "细水长流", "微笑向暖", "幸福时光",
        // 动物萌趣类
        "萌萌小熊", "懒懒猫咪", "快乐小兔", "顽皮小狗", "可爱小鸟", "调皮小鱼", "憨憨企鹅", "聪明海豚",
        "温柔小鹿", "勇敢狮子", "机灵猴子", "慵懒考拉", "活泼松鼠", "优雅天鹅", "俏皮狐狸", "呆萌熊猫",
        "淘气仓鼠", "乖巧兔子", "神秘猫头鹰", "活泼小狗",
        // 诗意文学类
        "诗意栖居", "墨香书韵", "书香门第", "琴棋书画", "诗词歌赋", "笔下生花", "墨染流年", "诗意人生",
        "古典韵味", "国风雅韵", "山水诗意", "文人墨客", "诗意远方", "诗情画意", "笔墨丹青", "书香满溢",
        // 趣味创意类
        "快乐玩家", "游戏达人", "斗地主王", "地主大人", "欢乐地主", "扑克高手", "牌技精湛", "笑傲江湖",
        "天下无双", "一骑绝尘", "技艺超群", "独孤求败", "风云人物", "传奇玩家", "王者归来", "实力担当",
        // 生活态度类
        "自在逍遥", "快乐每一天", "精彩人生", "无忧无虑", "笑口常开", "乐天派", "阳光少年", "活力满满",
        "青春无敌", "热情似火", "认真生活", "努力奋斗", "积极向上", "永不言弃", "勇敢追梦", "初心不改",
        // 游戏趣味类
        "摸鱼高手", "躺赢专家", "运气爆棚", "牌运亨通", "王者段位", "钻石玩家", "黄金段位", "白银骑士",
        "青铜战神", "新手村民", "佛系玩家", "氪金大佬", "零氪玩家", "休闲玩家", "肝帝大人", "欧皇降临",
        "非酋本酋", "天选之人", "锦鲤附体", "幸运之星",
        // 食物美食类
        "甜蜜草莓", "清凉西瓜", "软糯布丁", "香浓奶茶", "美味蛋糕", "酥脆饼干", "清新柠檬", "香甜芒果",
        "可口可乐", "香脆薯片", "麻辣火锅", "烧烤达人", "美食家", "吃货一枚", "甜品控", "奶茶爱好者",
        // 特色个性类
        "独行侠客", "神秘人", "路过人间", "无名小卒", "平凡之路", "淡泊名利", "闲云野鹤", "自由灵魂",
        "夜空中星", "黎明曙光", "破晓时分", "黄昏岁月", "时光漫步", "岁月长河", "生命之光", "希望之翼",
}

// CreatePlayer 创建玩家
func (s *DDZPlayerService) CreatePlayer(req ddzReq.DDZPlayerCreate) (ddzRes.DDZPlayerResponse, error) {
        db := GetDDZDB()
        // 检查用户名是否已存在
        var count int64
        db.Model(&ddz.DDZPlayer{}).Where("username = ? OR nickname = ?", req.PlayerID, req.Nickname).Count(&count)
        if count > 0 {
                return ddzRes.DDZPlayerResponse{}, errors.New("玩家ID或昵称已存在")
        }

        // 创建玩家
        player := ddz.DDZPlayer{
                Username:   req.PlayerID,
                Nickname:   req.Nickname,
                Avatar:     req.Avatar,
                Gender:     uint8(req.Gender),
                Gold:       req.Coins,
                Diamond:    int(req.Diamonds),
                VIPLevel:   req.VipLevel,
                Level:      1,
                Status:     1, // 默认正常状态
        }

        err := db.Create(&player).Error
        if err != nil {
                return ddzRes.DDZPlayerResponse{}, err
        }

        return s.toPlayerResponse(player), nil
}

// DeletePlayer 删除玩家（根据ID）
func (s *DDZPlayerService) DeletePlayer(id uint) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, id).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        return db.Delete(&player).Error
}

// DeletePlayerByPlayerID 删除玩家（根据Username/PlayerID）
func (s *DDZPlayerService) DeletePlayerByPlayerID(playerID string) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.Where("username = ?", playerID).First(&player).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        return db.Delete(&player).Error
}

// GetPlayerList 获取玩家列表
func (s *DDZPlayerService) GetPlayerList(req ddzReq.DDZPlayerSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZPlayer{})

        if req.PlayerID.Valid {
                query = query.Where("username = ? OR id = ?", req.PlayerID.Value, req.PlayerID.Value)
        }
        if req.Nickname != "" {
                query = query.Where("nickname LIKE ?", "%"+req.Nickname+"%")
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }
        if req.VipLevel > 0 {
                query = query.Where("vip_level = ?", req.VipLevel)
        }
        if req.MinCoins > 0 {
                query = query.Where("gold >= ?", req.MinCoins)
        }
        if req.MaxCoins > 0 {
                query = query.Where("gold <= ?", req.MaxCoins)
        }
        // 玩家类型筛选
        if req.PlayerType != nil {
                query = query.Where("player_type = ?", *req.PlayerType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var players []ddz.DDZPlayer
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&players).Error
        if err != nil {
                return nil, 0, err
        }

        // 收集玩家ID，批量查询账户信息
        playerIDs := make([]uint, 0, len(players))
        for _, p := range players {
                playerIDs = append(playerIDs, uint(p.ID))
        }

        // 批量查询账户信息
        accountMap := make(map[uint]ddz.DDZUserAccount)
        if len(playerIDs) > 0 {
                var accounts []ddz.DDZUserAccount
                db.Table("ddz_user_accounts").Where("player_id IN ?", playerIDs).Find(&accounts)
                for _, acc := range accounts {
                        accountMap[acc.PlayerID] = acc
                }
        }

        // 转换为响应格式
        playerList := make([]ddzRes.DDZPlayerResponse, 0, len(players))
        for _, p := range players {
                account, exists := accountMap[uint(p.ID)]
                if exists {
                        playerList = append(playerList, s.toPlayerResponseWithAccount(p, account))
                } else {
                        playerList = append(playerList, s.toPlayerResponse(p))
                }
        }

        return playerList, total, nil
}

// GetPlayerByID 根据ID获取玩家
func (s *DDZPlayerService) GetPlayerByID(id uint) (ddzRes.DDZPlayerResponse, error) {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, id).Error
        if err != nil {
                return ddzRes.DDZPlayerResponse{}, err
        }
        return s.toPlayerResponse(player), nil
}

// GetPlayerByPlayerID 根据Username/PlayerID获取玩家
func (s *DDZPlayerService) GetPlayerByPlayerID(playerID string) (ddzRes.DDZPlayerResponse, error) {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.Where("username = ?", playerID).First(&player).Error
        if err != nil {
                return ddzRes.DDZPlayerResponse{}, err
        }
        return s.toPlayerResponse(player), nil
}

// BanPlayer 封禁玩家
func (s *DDZPlayerService) BanPlayer(req ddzReq.DDZPlayerBan, operatorID uint, operatorName string) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.Where("username = ?", req.PlayerID).First(&player).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        return db.Transaction(func(tx *gorm.DB) error {
                // 计算过期时间
                var expireAt *time.Time
                if req.Duration > 0 {
                        t := time.Now().Add(time.Duration(req.Duration) * time.Hour)
                        expireAt = &t
                }

                // 更新玩家状态
                updates := map[string]interface{}{
                        "status":       2, // 封禁
                        "status_reason": req.Reason,
                        "status_expire": expireAt,
                        "updated_at":   time.Now(),
                }
                if err := tx.Model(&player).Updates(updates).Error; err != nil {
                        return err
                }

                // 记录日志
                log := ddz.DDZPlayerStatusLog{
                        PlayerID:     player.ID,
                        ActionType:   ddz.PlayerActionBan,
                        Reason:       req.Reason,
                        Duration:     req.Duration,
                        ExpireAt:     expireAt,
                        OperatorID:   operatorID,
                        OperatorName: operatorName,
                        CreatedAt:    time.Now(),
                }
                return tx.Create(&log).Error
        })
}

// UnbanPlayer 解封玩家
func (s *DDZPlayerService) UnbanPlayer(req ddzReq.DDZPlayerUnban, operatorID uint, operatorName string) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.Where("username = ?", req.PlayerID).First(&player).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        return db.Transaction(func(tx *gorm.DB) error {
                // 更新玩家状态
                updates := map[string]interface{}{
                        "status":       1, // 正常
                        "status_reason": "",
                        "status_expire": nil,
                        "updated_at":   time.Now(),
                }
                if err := tx.Model(&player).Updates(updates).Error; err != nil {
                        return err
                }

                // 记录日志
                log := ddz.DDZPlayerStatusLog{
                        PlayerID:     player.ID,
                        ActionType:   ddz.PlayerActionUnban,
                        Reason:       req.Reason,
                        OperatorID:   operatorID,
                        OperatorName: operatorName,
                        CreatedAt:    time.Now(),
                }
                return tx.Create(&log).Error
        })
}

// FreezePlayer 冻结玩家
func (s *DDZPlayerService) FreezePlayer(req ddzReq.DDZPlayerFreeze, operatorID uint, operatorName string) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, req.PlayerID).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        if player.Status == 2 {
                return errors.New("该玩家已被封禁，无法冻结")
        }

        return db.Transaction(func(tx *gorm.DB) error {
                // 计算过期时间
                var expireAt *time.Time
                if req.Duration > 0 {
                        t := time.Now().Add(time.Duration(req.Duration) * time.Hour)
                        expireAt = &t
                }

                // 更新玩家状态
                updates := map[string]interface{}{
                        "status":       3, // 冻结
                        "status_reason": req.Reason,
                        "status_expire": expireAt,
                        "updated_at":   time.Now(),
                }
                if err := tx.Model(&player).Updates(updates).Error; err != nil {
                        return err
                }

                // 记录日志
                log := ddz.DDZPlayerStatusLog{
                        PlayerID:     player.ID,
                        ActionType:   ddz.PlayerActionFreeze,
                        Reason:       req.Reason,
                        Duration:     req.Duration,
                        ExpireAt:     expireAt,
                        OperatorID:   operatorID,
                        OperatorName: operatorName,
                        CreatedAt:    time.Now(),
                }
                return tx.Create(&log).Error
        })
}

// UnfreezePlayer 解冻玩家
func (s *DDZPlayerService) UnfreezePlayer(req ddzReq.DDZPlayerUnfreeze, operatorID uint, operatorName string) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, req.PlayerID).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        if player.Status != 3 {
                return errors.New("该玩家未处于冻结状态")
        }

        return db.Transaction(func(tx *gorm.DB) error {
                // 更新玩家状态
                updates := map[string]interface{}{
                        "status":       1, // 正常
                        "status_reason": "",
                        "status_expire": nil,
                        "updated_at":   time.Now(),
                }
                if err := tx.Model(&player).Updates(updates).Error; err != nil {
                        return err
                }

                // 记录日志
                log := ddz.DDZPlayerStatusLog{
                        PlayerID:     player.ID,
                        ActionType:   ddz.PlayerActionUnfreeze,
                        Reason:       req.Reason,
                        OperatorID:   operatorID,
                        OperatorName: operatorName,
                        CreatedAt:    time.Now(),
                }
                return tx.Create(&log).Error
        })
}

// GetPlayerStatusLogs 获取玩家状态日志
func (s *DDZPlayerService) GetPlayerStatusLogs(req ddzReq.DDZPlayerStatusLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        query := db.Model(&ddz.DDZPlayerStatusLog{})
        if req.PlayerID > 0 {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.ActionType != nil {
                query = query.Where("action_type = ?", *req.ActionType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZPlayerStatusLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZPlayerStatusLogResponse, 0, len(logs))
        for _, l := range logs {
                var expireAt string
                if l.ExpireAt != nil {
                        expireAt = l.ExpireAt.Format("2006-01-02 15:04:05")
                }

                durationText := "永久"
                if l.Duration > 0 {
                        if l.Duration >= 24 {
                                days := l.Duration / 24
                                hours := l.Duration % 24
                                if hours > 0 {
                                        durationText = fmt.Sprintf("%d天%d小时", days, hours)
                                } else {
                                        durationText = fmt.Sprintf("%d天", days)
                                }
                        } else {
                                durationText = fmt.Sprintf("%d小时", l.Duration)
                        }
                }

                result = append(result, ddzRes.DDZPlayerStatusLogResponse{
                        ID:             l.ID,
                        PlayerId:       l.PlayerID,
                        ActionType:     int(l.ActionType),
                        ActionTypeText: ddz.PlayerStatusActionTypeText[l.ActionType],
                        Reason:         l.Reason,
                        Duration:       l.Duration,
                        DurationText:   durationText,
                        ExpireAt:       expireAt,
                        OperatorName:   l.OperatorName,
                        CreatedAt:      l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// UpdatePlayer 更新玩家信息
func (s *DDZPlayerService) UpdatePlayer(req ddzReq.DDZPlayerUpdate) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, req.ID).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        updates := map[string]interface{}{
                "updated_at": time.Now(),
        }
        if req.Nickname != "" {
                updates["nickname"] = req.Nickname
        }
        if req.Avatar != "" {
                updates["avatar"] = req.Avatar
        }
        if req.Gender >= 0 {
                updates["gender"] = req.Gender
        }
        if req.VipLevel >= 0 {
                updates["vip_level"] = req.VipLevel
        }

        return db.Model(&player).Updates(updates).Error
}

// UpdatePlayerCurrency 更新玩家货币（统一接口）
func (s *DDZPlayerService) UpdatePlayerCurrency(req ddzReq.DDZPlayerCurrencyUpdate) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, req.ID).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        remark := req.Remark
        if remark == "" {
                remark = "后台调整"
        }

        switch req.CurrencyType {
        case "gold":
                return s.updateGoldWithLog(db, player.ID, req.Amount, ddz.CoinChangeTypeAdmin, "", remark)
        case "arenaCoin":
                return s.updateArenaCoinWithLog(db, player.ID, req.Amount, ddz.ArenaCoinChangeTypeAdmin, "", remark)
        case "diamond":
                return s.updateDiamondWithLog(db, player.ID, req.Amount, ddz.CoinChangeTypeAdmin, "", remark)
        default:
                return errors.New("不支持的货币类型")
        }
}

// UpdatePlayerArenaCoin 更新玩家竞技币（专用接口）
func (s *DDZPlayerService) UpdatePlayerArenaCoin(req ddzReq.DDZPlayerArenaCoinUpdate) error {
        db := GetDDZDB()
        var player ddz.DDZPlayer
        err := db.First(&player, req.ID).Error
        if err != nil {
                return errors.New("玩家不存在")
        }

        remark := req.Remark
        if remark == "" {
                remark = "后台调整"
        }

        return s.updateArenaCoinWithLog(db, player.ID, req.Amount, ddz.ArenaCoinChangeTypeAdmin, "", remark)
}

// updateGoldWithLog 更新金币并记录流水日志
func (s *DDZPlayerService) updateGoldWithLog(db *gorm.DB, playerID uint64, changeAmount int64, changeType uint8, relatedID string, remark string) error {
        return db.Transaction(func(tx *gorm.DB) error {
                var player ddz.DDZPlayer
                if err := tx.First(&player, playerID).Error; err != nil {
                        return err
                }

                newBalance := player.Gold + changeAmount
                if newBalance < 0 {
                        return errors.New("金币余额不足")
                }

                if err := tx.Model(&ddz.DDZPlayer{}).Where("id = ?", playerID).Update("gold", newBalance).Error; err != nil {
                        return err
                }

                log := ddz.DDZGoldLog{
                        PlayerID:     playerID,
                        ChangeAmount: changeAmount,
                        BalanceAfter: newBalance,
                        ChangeType:   changeType,
                        RelatedID:    relatedID,
                        Remark:       remark,
                        CreatedAt:    time.Now(),
                }

                if err := tx.Create(&log).Error; err != nil {
                        global.GVA_LOG.Error("记录金币流水失败", zap.Error(err))
                }

                global.GVA_LOG.Info("金币更新成功",
                        zap.Uint64("playerID", playerID),
                        zap.Int64("changeAmount", changeAmount),
                        zap.Int64("newBalance", newBalance),
                        zap.String("remark", remark))

                return nil
        })
}

// updateArenaCoinWithLog 更新竞技币并记录流水日志
func (s *DDZPlayerService) updateArenaCoinWithLog(db *gorm.DB, playerID uint64, changeAmount int64, changeType uint8, relatedID string, remark string) error {
        return db.Transaction(func(tx *gorm.DB) error {
                var player ddz.DDZPlayer
                if err := tx.First(&player, playerID).Error; err != nil {
                        return err
                }

                newBalance := player.ArenaCoin + changeAmount
                if newBalance < 0 {
                        return errors.New("竞技币余额不足")
                }

                if err := tx.Model(&ddz.DDZPlayer{}).Where("id = ?", playerID).Update("arena_coin", newBalance).Error; err != nil {
                        return err
                }

                log := ddz.DDZArenaCoinLog{
                        PlayerID:     playerID,
                        ChangeAmount: changeAmount,
                        BalanceAfter: newBalance,
                        ChangeType:   changeType,
                        RelatedID:    relatedID,
                        Remark:       remark,
                        CreatedAt:    time.Now(),
                }

                if err := tx.Create(&log).Error; err != nil {
                        global.GVA_LOG.Error("记录竞技币流水失败", zap.Error(err))
                }

                global.GVA_LOG.Info("竞技币更新成功",
                        zap.Uint64("playerID", playerID),
                        zap.Int64("changeAmount", changeAmount),
                        zap.Int64("newBalance", newBalance),
                        zap.String("remark", remark))

                return nil
        })
}

// updateDiamondWithLog 更新钻石并记录流水日志
func (s *DDZPlayerService) updateDiamondWithLog(db *gorm.DB, playerID uint64, changeAmount int64, changeType uint8, relatedID string, remark string) error {
        return db.Transaction(func(tx *gorm.DB) error {
                var player ddz.DDZPlayer
                if err := tx.First(&player, playerID).Error; err != nil {
                        return err
                }

                newBalance := int64(player.Diamond) + changeAmount
                if newBalance < 0 {
                        return errors.New("钻石余额不足")
                }

                if err := tx.Model(&ddz.DDZPlayer{}).Where("id = ?", playerID).Update("diamond", newBalance).Error; err != nil {
                        return err
                }

                log := ddz.DDZDiamondLog{
                        PlayerID:     playerID,
                        ChangeAmount: changeAmount,
                        BalanceAfter: newBalance,
                        ChangeType:   changeType,
                        RelatedID:    relatedID,
                        Remark:       remark,
                        CreatedAt:    time.Now(),
                }

                if err := tx.Create(&log).Error; err != nil {
                        global.GVA_LOG.Error("记录钻石流水失败", zap.Error(err))
                }

                global.GVA_LOG.Info("钻石更新成功",
                        zap.Uint64("playerID", playerID),
                        zap.Int64("changeAmount", changeAmount),
                        zap.Int64("newBalance", newBalance),
                        zap.String("remark", remark))

                return nil
        })
}

// GetCoinLogList 获取货币流水日志列表
func (s *DDZPlayerService) GetCoinLogList(req ddzReq.DDZCoinLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        switch req.CurrencyType {
        case "gold":
                return s.getGoldLogList(db, req.PlayerID, req.ChangeType, req.StartDate, req.EndDate, limit, offset)
        case "arenaCoin":
                return s.getArenaCoinLogList(db, req.PlayerID, req.ChangeType, req.StartDate, req.EndDate, limit, offset)
        case "diamond":
                return s.getDiamondLogList(db, req.PlayerID, req.ChangeType, req.StartDate, req.EndDate, limit, offset)
        default:
                return nil, 0, errors.New("不支持的货币类型")
        }
}

func (s *DDZPlayerService) getGoldLogList(db *gorm.DB, playerID uint64, changeType *int, startDate, endDate string, limit, offset int) (list interface{}, total int64, err error) {
        query := db.Model(&ddz.DDZGoldLog{})
        if playerID > 0 {
                query = query.Where("player_id = ?", playerID)
        }
        if changeType != nil {
                query = query.Where("change_type = ?", *changeType)
        }
        if startDate != "" {
                query = query.Where("created_at >= ?", startDate+" 00:00:00")
        }
        if endDate != "" {
                query = query.Where("created_at <= ?", endDate+" 23:59:59")
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZGoldLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZCoinLogResponse, 0, len(logs))
        for _, l := range logs {
                result = append(result, ddzRes.DDZCoinLogResponse{
                        ID:           l.ID,
                        PlayerID:     l.PlayerID,
                        ChangeAmount: l.ChangeAmount,
                        BalanceAfter: l.BalanceAfter,
                        ChangeType:   int(l.ChangeType),
                        ChangeTypeText: ddz.CoinChangeTypeText[l.ChangeType],
                        RelatedID:    l.RelatedID,
                        Remark:       l.Remark,
                        CreatedAt:    l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

func (s *DDZPlayerService) getArenaCoinLogList(db *gorm.DB, playerID uint64, changeType *int, startDate, endDate string, limit, offset int) (list interface{}, total int64, err error) {
        query := db.Model(&ddz.DDZArenaCoinLog{})
        if playerID > 0 {
                query = query.Where("player_id = ?", playerID)
        }
        if changeType != nil {
                query = query.Where("change_type = ?", *changeType)
        }
        if startDate != "" {
                query = query.Where("created_at >= ?", startDate+" 00:00:00")
        }
        if endDate != "" {
                query = query.Where("created_at <= ?", endDate+" 23:59:59")
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZArenaCoinLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZCoinLogResponse, 0, len(logs))
        for _, l := range logs {
                result = append(result, ddzRes.DDZCoinLogResponse{
                        ID:           l.ID,
                        PlayerID:     l.PlayerID,
                        ChangeAmount: l.ChangeAmount,
                        BalanceAfter: l.BalanceAfter,
                        ChangeType:   int(l.ChangeType),
                        ChangeTypeText: ddz.CoinChangeTypeText[l.ChangeType],
                        RelatedID:    l.RelatedID,
                        Remark:       l.Remark,
                        CreatedAt:    l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

func (s *DDZPlayerService) getDiamondLogList(db *gorm.DB, playerID uint64, changeType *int, startDate, endDate string, limit, offset int) (list interface{}, total int64, err error) {
        query := db.Model(&ddz.DDZDiamondLog{})
        if playerID > 0 {
                query = query.Where("player_id = ?", playerID)
        }
        if changeType != nil {
                query = query.Where("change_type = ?", *changeType)
        }
        if startDate != "" {
                query = query.Where("created_at >= ?", startDate+" 00:00:00")
        }
        if endDate != "" {
                query = query.Where("created_at <= ?", endDate+" 23:59:59")
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []ddz.DDZDiamondLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.DDZCoinLogResponse, 0, len(logs))
        for _, l := range logs {
                result = append(result, ddzRes.DDZCoinLogResponse{
                        ID:           l.ID,
                        PlayerID:     l.PlayerID,
                        ChangeAmount: l.ChangeAmount,
                        BalanceAfter: l.BalanceAfter,
                        ChangeType:   int(l.ChangeType),
                        ChangeTypeText: ddz.CoinChangeTypeText[l.ChangeType],
                        RelatedID:    l.RelatedID,
                        Remark:       l.Remark,
                        CreatedAt:    l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// UpdatePlayerCoins 更新玩家金币
func (s *DDZPlayerService) UpdatePlayerCoins(req ddzReq.DDZPlayerCoinsUpdate) error {
        db := GetDDZDB()
        return db.Model(&ddz.DDZPlayer{}).
                Where("username = ?", req.PlayerID).
                Update("gold", gorm.Expr("gold + ?", req.Coins)).Error
}

// toPlayerResponse 转换为响应格式
func (s *DDZPlayerService) toPlayerResponse(p ddz.DDZPlayer) ddzRes.DDZPlayerResponse {
        totalGames := p.WinCount + p.LoseCount
        winRate := float64(0)
        if totalGames > 0 {
                winRate = float64(p.WinCount) / float64(totalGames) * 100
        }

        var lastLoginAt string
        if p.LastLoginAt != nil {
                lastLoginAt = p.LastLoginAt.Format("2006-01-02 15:04:05")
        }

        var statusExpire string
        if p.StatusExpire != nil {
                statusExpire = p.StatusExpire.Format("2006-01-02 15:04:05")
        }

        // 状态文本
        statusText := "正常"
        switch p.Status {
        case 0:
                statusText = "禁用"
        case 2:
                statusText = "封禁"
        case 3:
                statusText = "冻结"
        }

        // 玩家类型文本（从数据库字段获取）
        playerType := int(p.PlayerType)
        playerTypeText := "平台用户"
        if playerType == 2 {
                playerTypeText = "机器人"
        }

        return ddzRes.DDZPlayerResponse{
                ID:             uint(p.ID),
                PlayerID:       p.Username,
                Nickname:       p.Nickname,
                Avatar:         p.Avatar,
                Gender:         int(p.Gender),
                PlayerType:     playerType,
                PlayerTypeText: playerTypeText,
                Coins:          p.Gold,
                ArenaCoin:      p.ArenaCoin,
                Diamonds:       int64(p.Diamond),
                WinCount:       p.WinCount,
                LoseCount:      p.LoseCount,
                DrawCount:      0,
                TotalGames:     totalGames,
                WinRate:        winRate,
                MaxWinStreak:   0,
                WinStreak:      0,
                Level:          p.Level,
                Experience:     p.Experience,
                VipLevel:       p.VIPLevel,
                Status:         int(p.Status),
                StatusText:     statusText,
                StatusReason:   p.StatusReason,
                StatusExpire:   statusExpire,
                BanReason:      "",
                BanTime:        "",
                UnbanTime:      "",
                LastLoginIP:    p.LastLoginIP,
                LastLoginAt:    lastLoginAt,
                RegisterIP:     "",
                DeviceID:       "",
                CreatedAt:      p.CreatedAt.Format("2006-01-02 15:04:05"),
                UpdatedAt:      p.UpdatedAt.Format("2006-01-02 15:04:05"),
                // 账户信息默认值
                Phone:         "",
                LoginType:     0,
                LoginTypeText: "-",
                DeviceType:    "",
                LoginCount:    0,
        }
}

// toPlayerResponseWithAccount 转换为响应格式（包含账户信息）
func (s *DDZPlayerService) toPlayerResponseWithAccount(p ddz.DDZPlayer, account ddz.DDZUserAccount) ddzRes.DDZPlayerResponse {
        response := s.toPlayerResponse(p)

        // 填充账户信息
        response.Phone = account.Phone
        response.LoginType = account.LoginType
        response.LoginTypeText = s.getLoginTypeText(account.LoginType)
        response.DeviceType = account.DeviceType
        response.LoginCount = account.LoginCount

        return response
}

// getLoginTypeText 获取登录类型文本
func (s *DDZPlayerService) getLoginTypeText(loginType int) string {
        switch loginType {
        case 1:
                return "手机号"
        case 2:
                return "微信"
        case 3:
                return "游客"
        default:
                return "-"
        }
}

// GenerateRobots 批量生成机器人玩家
// 模拟微信授权注册，token比正常token小（使用16位而非32位）
func (s *DDZPlayerService) GenerateRobots(count int) (ddzRes.DDZGenerateRobotsResponse, error) {
        db := GetDDZDB()
        if db == nil {
                return ddzRes.DDZGenerateRobotsResponse{}, errors.New("数据库未连接")
        }

        response := ddzRes.DDZGenerateRobotsResponse{
                Robots: make([]ddzRes.DDZPlayerResponse, 0, count),
        }

        // 使用随机种子
        r := rand.New(rand.NewSource(time.Now().UnixNano()))

        // 获取头像文件列表
        avatarFiles, err := s.getAvatarFiles()
        if err != nil {
                global.GVA_LOG.Warn("获取头像文件失败，使用默认头像", zap.Error(err))
                // 使用默认头像
                avatarFiles = []string{"avatar_1", "avatar_2", "avatar_3", "avatar_4"}
        }
        global.GVA_LOG.Info("头像文件列表", zap.Int("数量", len(avatarFiles)))

        // 已使用的昵称索引
        usedNicknameIndices := make(map[int]bool)

        for i := 0; i < count; i++ {
                // 生成唯一的机器人ID: robot_ + 时间戳 + 随机数
                robotID := fmt.Sprintf("robot_%d_%d", time.Now().UnixNano()/1000000, r.Intn(10000))

                // 从昵称库中随机选择一个未使用的昵称
                var nickname string
                var nicknameIndex int
                maxAttempts := len(robotNicknames)
                for attempt := 0; attempt < maxAttempts; attempt++ {
                        nicknameIndex = r.Intn(len(robotNicknames))
                        if !usedNicknameIndices[nicknameIndex] {
                                usedNicknameIndices[nicknameIndex] = true
                                nickname = robotNicknames[nicknameIndex]
                                break
                        }
                }

                // 如果所有昵称都被使用，添加随机后缀
                if nickname == "" {
                        nickname = robotNicknames[r.Intn(len(robotNicknames))] + fmt.Sprintf("%d", r.Intn(100))
                }

                // 随机选择头像
                var avatar string
                if len(avatarFiles) > 0 {
                        avatar = avatarFiles[r.Intn(len(avatarFiles))]
                } else {
                        avatar = fmt.Sprintf("avatar_%d", r.Intn(4)+1)
                }

                // 随机性别
                gender := uint8(r.Intn(3)) // 0-未知, 1-男, 2-女

                // 随机初始金币 (1000-10000)
                gold := int64(1000 + r.Intn(9001))

                // 生成机器人Token (16位，比正常用户32位短)
                robotToken := s.generateRobotToken(16)

                // 创建机器人玩家
                now := time.Now()
                player := ddz.DDZPlayer{
                        Username:   robotID,
                        Nickname:   nickname,
                        Avatar:     avatar,
                        Gender:     gender,
                        PlayerType: 2, // 机器人类型
                        Gold:       gold,
                        Diamond:    0,
                        ArenaCoin:  0,
                        Experience: 0,
                        Level:      1,
                        VIPLevel:   0,
                        WinCount:   0,
                        LoseCount:  0,
                        Status:     1, // 正常状态
                        CreatedAt:  now,
                        UpdatedAt:  now,
                }

                // 使用事务创建玩家和账户
                err := db.Transaction(func(tx *gorm.DB) error {
                        // 创建玩家
                        if err := tx.Create(&player).Error; err != nil {
                                return err
                        }

                        // 计算Token过期时间（7天）
                        tokenExpire := now.Add(7 * 24 * time.Hour)

                        // 创建用户账户（模拟微信授权注册）
                        account := ddz.DDZUserAccount{
                                PlayerID:             uint(player.ID),
                                WxOpenID:             fmt.Sprintf("robot_%s", s.md5Hash(robotID)[:16]),
                                WxUnionID:            fmt.Sprintf("union_%s", s.md5Hash(robotID+nickname)[:16]),
                                WxNickname:           nickname,
                                WxAvatar:             avatar,
                                LoginType:            2, // 微信登录类型
                                Token:                robotToken,
                                TokenExpireAt:        &tokenExpire,
                                Status:               1, // 正常状态
                                LastLoginAt:          &now,
                                DeviceType:           "robot",
                                LoginCount:           1,
                        }

                        if err := tx.Create(&account).Error; err != nil {
                                return err
                        }

                        return nil
                })

                if err != nil {
                        global.GVA_LOG.Error("创建机器人失败", zap.Error(err), zap.String("robotID", robotID))
                        response.FailedCount++
                        continue
                }

                response.SuccessCount++
                response.Robots = append(response.Robots, s.toPlayerResponse(player))

                global.GVA_LOG.Info("机器人创建成功",
                        zap.Uint64("playerID", player.ID),
                        zap.String("username", robotID),
                        zap.String("nickname", nickname),
                        zap.String("avatar", avatar),
                        zap.String("token", robotToken))

                // 短暂延迟以避免时间戳冲突
                time.Sleep(time.Millisecond)
        }

        return response, nil
}

// getAvatarFiles 获取头像文件列表
func (s *DDZPlayerService) getAvatarFiles() ([]string, error) {
        // 头像文件夹路径
        avatarDir := filepath.Join("uploads", "file", "avatar")

        // 检查文件夹是否存在
        if _, err := os.Stat(avatarDir); os.IsNotExist(err) {
                return nil, fmt.Errorf("头像文件夹不存在: %s", avatarDir)
        }

        // 读取文件夹中的文件
        files, err := ioutil.ReadDir(avatarDir)
        if err != nil {
                return nil, fmt.Errorf("读取头像文件夹失败: %w", err)
        }

        var avatarFiles []string
        for _, file := range files {
                if file.IsDir() {
                        continue
                }
                // 检查是否是图片文件
                ext := strings.ToLower(filepath.Ext(file.Name()))
                if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp" {
                        // 返回相对URL路径
                        avatarURL := fmt.Sprintf("/uploads/file/avatar/%s", file.Name())
                        avatarFiles = append(avatarFiles, avatarURL)
                }
        }

        if len(avatarFiles) == 0 {
                return nil, fmt.Errorf("头像文件夹中没有图片文件")
        }

        return avatarFiles, nil
}

// generateRobotToken 生成机器人Token
func (s *DDZPlayerService) generateRobotToken(length int) string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        r := rand.New(rand.NewSource(time.Now().UnixNano()))
        token := make([]byte, length)
        for i := range token {
                token[i] = charset[r.Intn(len(charset))]
        }
        return string(token)
}

// md5Hash 计算MD5哈希值
func (s *DDZPlayerService) md5Hash(str string) string {
        h := md5.New()
        h.Write([]byte(str))
        return hex.EncodeToString(h.Sum(nil))
}
