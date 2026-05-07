package ddz

import (
        "context"
        "encoding/json"
        "errors"
        "fmt"
        "sync"
        "time"

        "gorm.io/datatypes"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "go.uber.org/zap"
)

type DDZArenaRegistrationService struct{}

var DDZArenaRegistrationServiceApp = new(DDZArenaRegistrationService)

// Redis缓存键
const (
        ArenaOperateCooldownKey = "ddz:arena:cooldown:" // 操作冷却时间前缀
)

// 用于内存中的操作锁（防止同一玩家并发操作）
var playerMutex sync.Map

// TimeRange 时间范围
type TimeRange struct {
        Start string `json:"start"` // 格式: "HH:mm"
        End   string `json:"end"`   // 格式: "HH:mm"
}

// Register 报名竞技场（异步操作）
func (s *DDZArenaRegistrationService) Register(req ddzReq.DDZArenaRegister, ip string) (*ddzRes.DDZArenaOperateResponse, error) {
        // 检查冷却时间
        if err := s.checkCooldown(req.PlayerID); err != nil {
                return nil, err
        }

        // 获取玩家锁
        mutexKey := fmt.Sprintf("arena:%d", req.PlayerID)
        _, loaded := playerMutex.LoadOrStore(mutexKey, true)
        if loaded {
                return nil, errors.New("操作进行中，请稍候")
        }
        defer playerMutex.Delete(mutexKey)

        db := GetDDZDB()

        // 获取竞技场配置（从房间配置表获取）
        var roomConfig ddz.DDZRoomConfig
        err := db.Where("room_type = ? AND room_category = 2 AND status = 1", req.ArenaLevel+1).First(&roomConfig).Error
        if err != nil {
                return nil, errors.New("竞技场配置不存在或已关闭")
        }

        // 检查是否在开赛时间内
        if !s.isInMatchTime(roomConfig.MatchTimeRanges) {
                return nil, errors.New("当前不在开赛时间内，无法报名")
        }

        arenaCoinCost := roomConfig.MinArenaCoin // 报名费从配置获取

        // 检查玩家是否已报名其他竞技场
        var existingRegistration ddz.DDZArenaRegistration
        err = db.Where("player_id = ? AND status = ?", req.PlayerID, ddz.ArenaRegistrationStatusRegistered).
                First(&existingRegistration).Error
        if err == nil {
                return nil, fmt.Errorf("您已报名其他竞技场，请先取消报名")
        }

        // 检查玩家竞技币是否足够
        var player ddz.DDZPlayer
        err = db.Where("id = ?", req.PlayerID).First(&player).Error
        if err != nil {
                return nil, errors.New("玩家不存在")
        }

        if player.ArenaCoin < arenaCoinCost {
                return nil, fmt.Errorf("竞技币不足，需要%d竞技币", arenaCoinCost)
        }

        // 使用通道接收异步操作结果
        resultChan := make(chan error, 1)

        // 异步执行数据库操作
        go func() {
                // 扣除竞技币
                err := db.Model(&ddz.DDZPlayer{}).Where("id = ?", req.PlayerID).
                        Update("arena_coin", player.ArenaCoin-arenaCoinCost).Error
                if err != nil {
                        resultChan <- fmt.Errorf("扣除竞技币失败: %v", err)
                        return
                }

                // 创建报名记录
                registration := ddz.DDZArenaRegistration{
                        PlayerID:      req.PlayerID,
                        ArenaLevel:    req.ArenaLevel,
                        ArenaCoinCost: arenaCoinCost,
                        Status:        ddz.ArenaRegistrationStatusRegistered,
                        RegisteredAt:  time.Now(),
                        OperateIP:     ip,
                }

                err = db.Create(&registration).Error
                if err != nil {
                        // 回滚竞技币
                        db.Model(&ddz.DDZPlayer{}).Where("id = ?", req.PlayerID).
                                Update("arena_coin", player.ArenaCoin)
                        resultChan <- fmt.Errorf("创建报名记录失败: %v", err)
                        return
                }

                resultChan <- nil
        }()

        // 等待异步操作完成（带超时）
        select {
        case err := <-resultChan:
                if err != nil {
                        return nil, err
                }
        case <-time.After(5 * time.Second):
                return nil, errors.New("操作超时，请稍后查询结果")
        }

        // 设置冷却时间
        s.setCooldown(req.PlayerID)

        // 查询最新竞技币余额
        db.Where("id = ?", req.PlayerID).First(&player)

        return &ddzRes.DDZArenaOperateResponse{
                Success:         true,
                Message:         fmt.Sprintf("成功报名，扣除%d竞技币", arenaCoinCost),
                PlayerArenaCoin: player.ArenaCoin,
        }, nil
}

// Cancel 取消报名（异步操作）
func (s *DDZArenaRegistrationService) Cancel(req ddzReq.DDZArenaCancel, ip string) (*ddzRes.DDZArenaOperateResponse, error) {
        // 检查冷却时间
        if err := s.checkCooldown(req.PlayerID); err != nil {
                return nil, err
        }

        // 获取玩家锁
        mutexKey := fmt.Sprintf("arena:%d", req.PlayerID)
        _, loaded := playerMutex.LoadOrStore(mutexKey, true)
        if loaded {
                return nil, errors.New("操作进行中，请稍候")
        }
        defer playerMutex.Delete(mutexKey)

        db := GetDDZDB()

        // 查找报名记录
        var registration ddz.DDZArenaRegistration
        err := db.Where("player_id = ? AND status = ?", req.PlayerID, ddz.ArenaRegistrationStatusRegistered).
                First(&registration).Error
        if err != nil {
                return nil, errors.New("未找到报名记录")
        }

        // 使用通道接收异步操作结果
        resultChan := make(chan error, 1)

        // 异步执行数据库操作
        go func() {
                // 返还竞技币
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", req.PlayerID).First(&player).Error; err != nil {
                        resultChan <- fmt.Errorf("查询玩家失败: %v", err)
                        return
                }

                err := db.Model(&ddz.DDZPlayer{}).Where("id = ?", req.PlayerID).
                        Update("arena_coin", player.ArenaCoin+registration.ArenaCoinCost).Error
                if err != nil {
                        resultChan <- fmt.Errorf("返还竞技币失败: %v", err)
                        return
                }

                // 更新报名记录状态
                now := time.Now()
                err = db.Model(&registration).Updates(map[string]interface{}{
                        "status":       ddz.ArenaRegistrationStatusCancelled,
                        "cancelled_at": now,
                        "operate_ip":   ip,
                }).Error
                if err != nil {
                        // 回滚竞技币
                        db.Model(&ddz.DDZPlayer{}).Where("id = ?", req.PlayerID).
                                Update("arena_coin", player.ArenaCoin)
                        resultChan <- fmt.Errorf("更新报名记录失败: %v", err)
                        return
                }

                resultChan <- nil
        }()

        // 等待异步操作完成（带超时）
        select {
        case err := <-resultChan:
                if err != nil {
                        return nil, err
                }
        case <-time.After(5 * time.Second):
                return nil, errors.New("操作超时，请稍后查询结果")
        }

        // 设置冷却时间
        s.setCooldown(req.PlayerID)

        // 查询最新竞技币余额
        var player ddz.DDZPlayer
        db.Where("id = ?", req.PlayerID).First(&player)

        return &ddzRes.DDZArenaOperateResponse{
                Success:         true,
                Message:         fmt.Sprintf("已取消报名，返还%d竞技币", registration.ArenaCoinCost),
                PlayerArenaCoin: player.ArenaCoin,
        }, nil
}

// GetStatus 获取玩家报名状态
func (s *DDZArenaRegistrationService) GetStatus(playerID uint64) (*ddzRes.DDZArenaStatusResponse, error) {
        db := GetDDZDB()

        // 查询玩家信息
        var player ddz.DDZPlayer
        err := db.Where("id = ?", playerID).First(&player).Error
        if err != nil {
                return nil, errors.New("玩家不存在")
        }

        // 查询当前有效的报名记录
        var registration ddz.DDZArenaRegistration
        err = db.Where("player_id = ? AND status = ?", playerID, ddz.ArenaRegistrationStatusRegistered).
                First(&registration).Error

        response := &ddzRes.DDZArenaStatusResponse{
                IsRegistered:     false,
                ArenaLevel:       0,
                ArenaLevelName:   "",
                ArenaCoinCost:    0,
                RegisteredAt:     "",
                PlayerArenaCoin:  player.ArenaCoin,
        }

        if err == nil {
                // 已报名
                response.IsRegistered = true
                response.ArenaLevel = registration.ArenaLevel
                response.ArenaCoinCost = registration.ArenaCoinCost
                response.RegisteredAt = registration.RegisteredAt.Format("2006-01-02 15:04:05")
                // 获取竞技场名称
                var config ddz.DDZRoomConfig
                if err := db.Where("room_type = ? AND room_category = 2", registration.ArenaLevel+1).First(&config).Error; err == nil {
                        response.ArenaLevelName = config.RoomName
                }
        }

        return response, nil
}

// GetArenaList 获取竞技场列表（包含玩家报名状态和开赛时间）
func (s *DDZArenaRegistrationService) GetArenaList(playerID uint64) ([]ddzRes.DDZArenaListResponse, error) {
        db := GetDDZDB()

        // 查询玩家信息
        var player ddz.DDZPlayer
        err := db.Where("id = ?", playerID).First(&player).Error
        if err != nil {
                return nil, errors.New("玩家不存在")
        }

        // 查询当前有效的报名记录
        var registration ddz.DDZArenaRegistration
        isRegistered := false
        registeredLevel := 0

        err = db.Where("player_id = ? AND status = ?", playerID, ddz.ArenaRegistrationStatusRegistered).
                First(&registration).Error
        if err == nil {
                isRegistered = true
                registeredLevel = registration.ArenaLevel
        }

        // 获取所有竞技场房间配置
        var roomConfigs []ddz.DDZRoomConfig
        err = db.Where("room_category = 2 AND status = 1").Order("room_type asc").Find(&roomConfigs).Error
        if err != nil {
                return nil, err
        }

        // 构建竞技场列表
        arenaList := make([]ddzRes.DDZArenaListResponse, 0, len(roomConfigs))
        for _, config := range roomConfigs {
                // 竞技场等级 = room_type - 1（room_type: 2-初级, 3-中级, 4-高级）
                arenaLevel := config.RoomType - 1
                
                // 检查是否在开赛时间内
                inMatchTime := s.isInMatchTime(config.MatchTimeRanges)
                nextMatchTime := s.getNextMatchTime(config.MatchTimeRanges)

                item := ddzRes.DDZArenaListResponse{
                        ArenaLevel:       arenaLevel,
                        ArenaLevelName:   config.RoomName,
                        ArenaCoinCost:    config.MinArenaCoin, // 报名费从配置获取
                        MinArenaCoin:     config.MinArenaCoin,
                        IsRegistered:     registeredLevel == arenaLevel,
                        CanRegister:      !isRegistered && player.ArenaCoin >= config.MinArenaCoin && inMatchTime,
                        InMatchTime:      inMatchTime,
                        NextMatchTime:    nextMatchTime,
                        MatchTimeRanges:  string(config.MatchTimeRanges), // datatypes.JSON 转换为 string
                }
                arenaList = append(arenaList, item)
        }

        return arenaList, nil
}

// GetRegistrationList 获取报名记录列表（管理后台用）
func (s *DDZArenaRegistrationService) GetRegistrationList(req ddzReq.DDZArenaRegistrationSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZArenaRegistration{})

        if req.PlayerID != 0 {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.ArenaLevel != nil {
                query = query.Where("arena_level = ?", *req.ArenaLevel)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var registrations []ddz.DDZArenaRegistration
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&registrations).Error
        if err != nil {
                return nil, 0, err
        }

        // 转换为响应格式
        responseList := make([]ddzRes.DDZArenaRegistrationResponse, 0, len(registrations))
        for _, r := range registrations {
                resp := s.toRegistrationResponse(r)
                // 获取玩家昵称
                var player ddz.DDZPlayer
                if err := db.Where("id = ?", r.PlayerID).First(&player).Error; err == nil {
                        resp.PlayerNickname = player.Nickname
                }
                responseList = append(responseList, resp)
        }

        return responseList, total, nil
}

// isInMatchTime 检查当前是否在开赛时间内
func (s *DDZArenaRegistrationService) isInMatchTime(matchTimeRanges datatypes.JSON) bool {
        matchTimeRangesStr := string(matchTimeRanges)
        if matchTimeRangesStr == "" || matchTimeRangesStr == "null" {
                return true // 没有配置时间限制，默认开放
        }

        var ranges []TimeRange
        if err := json.Unmarshal(matchTimeRanges, &ranges); err != nil {
                global.GVA_LOG.Warn("解析开赛时间段失败", zap.String("ranges", matchTimeRangesStr), zap.Error(err))
                return true // 解析失败，默认开放
        }

        if len(ranges) == 0 {
                return true // 没有时间范围，默认开放
        }

        now := time.Now()
        currentMinutes := now.Hour()*60 + now.Minute()

        for _, r := range ranges {
                startMinutes := s.timeToMinutes(r.Start)
                endMinutes := s.timeToMinutes(r.End)

                if startMinutes <= currentMinutes && currentMinutes <= endMinutes {
                        return true
                }
        }

        return false
}

// getNextMatchTime 获取下一个开赛时间段
func (s *DDZArenaRegistrationService) getNextMatchTime(matchTimeRanges datatypes.JSON) string {
        matchTimeRangesStr := string(matchTimeRanges)
        if matchTimeRangesStr == "" || matchTimeRangesStr == "null" {
                return ""
        }

        var ranges []TimeRange
        if err := json.Unmarshal(matchTimeRanges, &ranges); err != nil {
                return ""
        }

        if len(ranges) == 0 {
                return ""
        }

        now := time.Now()
        currentMinutes := now.Hour()*60 + now.Minute()

        // 查找下一个开赛时间
        for _, r := range ranges {
                startMinutes := s.timeToMinutes(r.Start)
                if startMinutes > currentMinutes {
                        return fmt.Sprintf("%s-%s", r.Start, r.End)
                }
        }

        // 如果今天没有更早的时间，返回第一个时间段（明天的）
        if len(ranges) > 0 {
                return fmt.Sprintf("%s-%s", ranges[0].Start, ranges[0].End)
        }

        return ""
}

// timeToMinutes 将时间字符串转换为分钟数
func (s *DDZArenaRegistrationService) timeToMinutes(timeStr string) int {
        var hour, minute int
        fmt.Sscanf(timeStr, "%d:%d", &hour, &minute)
        return hour*60 + minute
}

// checkCooldown 检查操作冷却时间
func (s *DDZArenaRegistrationService) checkCooldown(playerID uint64) error {
        if global.GVA_REDIS == nil {
                return nil // Redis不可用则跳过冷却检查
        }

        ctx := context.Background()
        key := fmt.Sprintf("%s%d", ArenaOperateCooldownKey, playerID)

        val, err := global.GVA_REDIS.Get(ctx, key).Result()
        if err == nil && val != "" {
                return errors.New("操作太频繁，请稍后再试")
        }

        return nil
}

// setCooldown 设置操作冷却时间
func (s *DDZArenaRegistrationService) setCooldown(playerID uint64) {
        if global.GVA_REDIS == nil {
                return
        }

        ctx := context.Background()
        key := fmt.Sprintf("%s%d", ArenaOperateCooldownKey, playerID)

        global.GVA_REDIS.Set(ctx, key, "1", time.Duration(ddz.ArenaOperateCooldownSeconds)*time.Second)
}

// toRegistrationResponse 转换为响应格式
func (s *DDZArenaRegistrationService) toRegistrationResponse(r ddz.DDZArenaRegistration) ddzRes.DDZArenaRegistrationResponse {
        statusText := "已报名"
        switch r.Status {
        case ddz.ArenaRegistrationStatusCancelled:
                statusText = "已取消"
        case ddz.ArenaRegistrationStatusPlayed:
                statusText = "已参赛"
        }

        var cancelledAt string
        if r.CancelledAt != nil {
                cancelledAt = r.CancelledAt.Format("2006-01-02 15:04:05")
        }

        // 获取竞技场名称
        db := GetDDZDB()
        var config ddz.DDZRoomConfig
        arenaName := ""
        if err := db.Where("room_type = ? AND room_category = 2", r.ArenaLevel+1).First(&config).Error; err == nil {
                arenaName = config.RoomName
        }

        return ddzRes.DDZArenaRegistrationResponse{
                ID:             r.ID,
                PlayerID:       r.PlayerID,
                ArenaLevel:     r.ArenaLevel,
                ArenaLevelName: arenaName,
                ArenaCoinCost:  r.ArenaCoinCost,
                Status:         r.Status,
                StatusText:     statusText,
                RegisteredAt:   r.RegisteredAt.Format("2006-01-02 15:04:05"),
                CancelledAt:    cancelledAt,
                OperateIP:      r.OperateIP,
                CreatedAt:      r.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// SyncArenaRegistrationToRedis 同步报名状态到Redis（供游戏服务器快速查询）
func (s *DDZArenaRegistrationService) SyncArenaRegistrationToRedis(playerID uint64) error {
        if global.GVA_REDIS == nil {
                return nil
        }

        db := GetDDZDB()
        var registration ddz.DDZArenaRegistration
        err := db.Where("player_id = ? AND status = ?", playerID, ddz.ArenaRegistrationStatusRegistered).
                First(&registration).Error

        ctx := context.Background()
        key := fmt.Sprintf("ddz:arena:registration:%d", playerID)

        if err != nil {
                // 未报名，删除缓存
                global.GVA_REDIS.Del(ctx, key)
                return nil
        }

        // 缓存报名信息
        data, _ := json.Marshal(map[string]interface{}{
                "arena_level":     registration.ArenaLevel,
                "arena_coin_cost": registration.ArenaCoinCost,
                "registered_at":   registration.RegisteredAt.Unix(),
        })

        return global.GVA_REDIS.Set(ctx, key, string(data), 24*time.Hour).Err()
}
