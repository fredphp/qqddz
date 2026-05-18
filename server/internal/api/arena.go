package api

import (
        "encoding/json"
        "fmt"
        "log"
        "net/http"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "gorm.io/gorm"
)

// MatchTimeRange 开赛时间段
type MatchTimeRange struct {
        Start string `json:"start"` // 开始时间，格式 "HH:MM"
        End   string `json:"end"`   // 结束时间，格式 "HH:MM"
}

// ArenaHandler 竞技场处理器
type ArenaHandler struct {
        redis RedisClient // Redis客户端
}

// SetRedis 设置Redis客户端
func (h *ArenaHandler) SetRedis(client RedisClient) {
        h.redis = client
}

// getSignupListKey 获取报名列表Redis key
func getSignupListKey(periodNo string) string {
        return fmt.Sprintf("ddz:arena:signup_list:%s", periodNo)
}

// NewArenaHandler 创建竞技场处理器
func NewArenaHandler() *ArenaHandler {
        return &ArenaHandler{}
}

// List 获取竞技场列表
func (h *ArenaHandler) List(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        db := database.DB()
        if db == nil {
                writeJSONError(w, http.StatusInternalServerError, "数据库未连接")
                return
        }

        // 获取所有竞技场房间配置
        var roomConfigs []database.RoomConfig
        if err := db.Where("room_category = ? AND status = 1", 2).Order("sort_order ASC").Find(&roomConfigs).Error; err != nil {
                writeJSONError(w, http.StatusInternalServerError, "获取房间配置失败")
                return
        }

        // 构建返回数据
        arenas := make([]map[string]interface{}, 0)
        for _, config := range roomConfigs {
                arenas = append(arenas, map[string]interface{}{
                        "id":             config.ID,
                        "room_name":      config.RoomName,
                        "room_type":      config.RoomType,
                        "room_category":  config.RoomCategory,
                        "base_score":     config.BaseScore,
                        "multiplier":     config.Multiplier,
                        "min_gold":       config.MinGold,    // 最低入场金币
                        "max_gold":       config.MaxGold,    // 最高入场金币
                        "entry_gold":     config.EntryGold,  // 报名费/入场金币
                        "description":    config.Description,
                        "bg_image_num":   config.BgImageNum,
                })
        }

        writeJSONSuccess(w, map[string]interface{}{
                "arenas": arenas,
        })
}

// PeriodInfo 期号信息
type PeriodInfo struct {
        PeriodNo    string
        Phase       string // "prepare" 或 "signup"
        PeriodIndex int
}

// getCurrentPeriodInfo 获取当前期号信息
func (h *ArenaHandler) getCurrentPeriodInfo(roomID uint64, roomConfig *database.RoomConfig) (*PeriodInfo, error) {
        // 解析开赛时间段
        var timeRanges []MatchTimeRange
        if roomConfig.MatchTimeRanges != "" {
                if err := json.Unmarshal([]byte(roomConfig.MatchTimeRanges), &timeRanges); err != nil {
                        log.Printf("⚠️ 解析时间段失败: %v", err)
                        return nil, err
                }
        }

        if len(timeRanges) == 0 || roomConfig.MatchRoundDuration <= 0 {
                return nil, nil
        }

        now := time.Now()

        // 查找当前所在的时间段
        var startTime time.Time
        var matchedRange *MatchTimeRange

        for _, tr := range timeRanges {
                st := parseTimeWithToday(tr.Start, now)
                et := parseTimeWithToday(tr.End, now)
                if (now.After(st) || now.Equal(st)) && now.Before(et) {
                        matchedRange = &tr
                        startTime = st
                        break
                }
        }

        if matchedRange == nil {
                return nil, nil
        }

        // 🔧【修复】使用配置的 matchDuration，与 WebSocket 服务器保持一致
        // 每期总时长（秒）= matchDuration（分钟）* 60
        periodTotalSeconds := roomConfig.MatchRoundDuration * 60
        
        // 准备阶段：固定60秒（1分钟）
        prepareSeconds := 60

        // 计算从开赛时间到现在的秒数
        secondsSinceStart := int(now.Sub(startTime).Seconds())
        if secondsSinceStart < 0 {
                secondsSinceStart = 0
        }

        // 计算当前是第几期（从1开始）
        periodNo := secondsSinceStart/periodTotalSeconds + 1

        // 计算本期已经过去的秒数
        periodStartSeconds := (periodNo - 1) * periodTotalSeconds
        elapsedInSeconds := secondsSinceStart - periodStartSeconds

        // 生成长格式期号
        periodNoStr := generatePeriodNo(roomID, int(roomConfig.RoomType), periodNo)
        log.Printf("📝 [HTTP API] 期号计算: roomID=%d, roomType=%d, periodNo=%d, periodNoStr=%s, matchDuration=%d分钟", 
                roomID, roomConfig.RoomType, periodNo, periodNoStr, roomConfig.MatchRoundDuration)

        // 确定当前阶段
        var phase string
        if elapsedInSeconds < prepareSeconds {
                phase = "prepare"
        } else {
                phase = "signup"
        }

        return &PeriodInfo{
                PeriodNo:    periodNoStr,
                Phase:       phase,
                PeriodIndex: periodNo,
        }, nil
}

// getPlayerSignup 获取玩家报名记录
func (h *ArenaHandler) getPlayerSignup(periodNo string, playerID uint64) (*database.ArenaPeriodPlayer, error) {
        // 使用分表查询
        players, err := database.GetArenaPeriodPlayersByPeriodNo(periodNo)
        if err != nil {
                return nil, err
        }

        for _, p := range players {
                if p.PlayerID == playerID {
                        return &p, nil
                }
        }

        return nil, gorm.ErrRecordNotFound
}

// SignupStatus 获取玩家已报名状态
// 🔧【重构】按期号查询：获取每个房间的当前期号，查询玩家在该期号是否报名
func (h *ArenaHandler) SignupStatus(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== Arena SignupStatus 开始处理 ===")

        // 从URL参数获取token
        token := r.URL.Query().Get("token")
        if token == "" {
                // 尝试从请求体获取
                var req struct {
                        Token string `json:"token"`
                }
                if err := json.NewDecoder(r.Body).Decode(&req); err == nil && req.Token != "" {
                        token = req.Token
                }
        }

        log.Printf("🏟️ 获取报名状态 - Token长度: %d", len(token))

        if token == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少token")
                return
        }

        // 验证token并获取玩家信息
        db := database.DB()
        if db == nil {
                writeJSONError(w, http.StatusInternalServerError, "数据库未连接")
                return
        }

        var account database.UserAccount
        if err := db.Where("token = ?", token).First(&account).Error; err != nil {
                writeJSONError(w, http.StatusUnauthorized, "token无效或已过期")
                return
        }

        // 检查Token是否过期
        if account.TokenExpireAt != nil && account.TokenExpireAt.Before(time.Now()) {
                writeJSONError(w, http.StatusUnauthorized, "token已过期")
                return
        }

        // 获取玩家ID
        playerID := account.PlayerID

        // 获取所有竞技场房间配置
        var roomConfigs []database.RoomConfig
        if err := db.Where("room_category = ? AND status = 1", 2).Order("sort_order ASC").Find(&roomConfigs).Error; err != nil {
                writeJSONError(w, http.StatusInternalServerError, "获取房间配置失败")
                return
        }

        // 🔧【核心逻辑】按期号查询报名状态
        // 对每个竞技场房间：获取当前期号 -> 查询玩家在该期号是否报名
        signedUpRooms := make([]map[string]interface{}, 0)

        for _, config := range roomConfigs {
                // 获取该房间的当前期号
                periodInfo, err := h.getCurrentPeriodInfo(config.ID, &config)
                if err != nil {
                        log.Printf("⚠️ [SignupStatus] 获取期号失败: roomID=%d, err=%v", config.ID, err)
                        continue
                }

                // 如果当前不在比赛时间段，检查是否有最近的报名记录
                // 这种情况发生在：用户报名后，时间过了下一期开始，但还想显示上一期的报名状态
                if periodInfo == nil {
                        // 查询玩家在该房间最近的报名记录（今天的）
                        recentSignup := h.getPlayerRecentSignupForRoom(playerID, config.ID)
                        if recentSignup != nil {
                                signedUpRooms = append(signedUpRooms, map[string]interface{}{
                                        "room_id":     config.ID,
                                        "room_name":   config.RoomName,
                                        "period_no":   recentSignup.PeriodNo,
                                        "signup_time": recentSignup.SignupTime.UnixMilli(),
                                        "signup_fee":  recentSignup.SignupFee,
                                })
                                log.Printf("✅ [SignupStatus] 找到最近报名记录: roomID=%d, periodNo=%s", config.ID, recentSignup.PeriodNo)
                        }
                        continue
                }

                // 当前期号存在，查询玩家在该期号是否报名
                player, err := h.getPlayerSignup(periodInfo.PeriodNo, playerID)
                if err == nil && player != nil && player.Status == database.ArenaPeriodPlayerStatusNormal {
                        signedUpRooms = append(signedUpRooms, map[string]interface{}{
                                "room_id":     config.ID,
                                "room_name":   config.RoomName,
                                "period_no":   periodInfo.PeriodNo,
                                "signup_time": player.SignupTime.UnixMilli(),
                                "signup_fee":  player.SignupFee,
                        })
                        log.Printf("✅ [SignupStatus] 玩家已报名: roomID=%d, periodNo=%s", config.ID, periodInfo.PeriodNo)
                }
        }

        log.Printf("✅ 玩家 %d 已报名 %d 个竞技场", playerID, len(signedUpRooms))

        writeJSONSuccess(w, map[string]interface{}{
                "signed_up_rooms": signedUpRooms,
                "count":           len(signedUpRooms),
        })
}

// getPlayerRecentSignupForRoom 获取玩家在指定房间最近的报名记录
// 用于处理当前时间不在比赛时间段内，但仍需要显示报名状态的情况
func (h *ArenaHandler) getPlayerRecentSignupForRoom(playerID uint64, roomID uint64) *database.ArenaPeriodPlayer {
        db := database.DB()
        if db == nil {
                return nil
        }

        now := time.Now()
        todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

        // 查询当前月份的分表
        tableName := database.GetPartitionManager().GetArenaPeriodPlayerTableName(now)

        var player database.ArenaPeriodPlayer
        result := db.Table(tableName).
                Where("player_id = ? AND room_id = ? AND status = ?", playerID, roomID, database.ArenaPeriodPlayerStatusNormal).
                Where("signup_time >= ?", todayStart).
                Order("signup_time DESC").
                First(&player)

        if result.Error != nil {
                return nil
        }

        return &player
}

// parseTimeWithToday 使用今天的日期解析时间字符串
func parseTimeWithToday(timeStr string, now time.Time) time.Time {
        parts := splitTime(timeStr)
        if len(parts) != 2 {
                return now
        }
        hour := parseInt(parts[0])
        minute := parseInt(parts[1])
        return time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())
}

// splitTime 分割时间字符串
func splitTime(timeStr string) []string {
        for i, c := range timeStr {
                if c == ':' {
                        return []string{timeStr[:i], timeStr[i+1:]}
                }
        }
        return nil
}

// parseInt 解析整数
func parseInt(s string) int {
        var result int
        for _, c := range s {
                if c >= '0' && c <= '9' {
                        result = result*10 + int(c-'0')
                }
        }
        return result
}

// generatePeriodNo 生成期号
// 新格式: YYMMDD + 房间ID(2位) + 期序号(4位) = 12位
// 示例: 260506010034 = 2026年5月6日，房间ID=1，第0034期
func generatePeriodNo(roomID uint64, roomType int, daySequence int) string {
        // 日期 YYMMDD (6位)
        now := time.Now()
        dateStr := fmt.Sprintf("%02d%02d%02d", now.Year()%100, int(now.Month()), now.Day())

        // 房间ID (2位)
        roomIDStr := fmt.Sprintf("%02d", roomID%100) // 取后两位，支持1-99号房间

        // 期序号 (4位)
        seqStr := fmt.Sprintf("%04d", daySequence)

        return fmt.Sprintf("%s%s%s", dateStr, roomIDStr, seqStr)
}
