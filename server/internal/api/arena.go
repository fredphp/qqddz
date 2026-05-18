package api

import (
        "context"
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

// ArenaSignupRequest 报名请求
type ArenaSignupRequest struct {
        RoomID uint64 `json:"room_id"`
        Token  string `json:"token"`
}

// ArenaCancelRequest 取消报名请求
type ArenaCancelRequest struct {
        RoomID uint64 `json:"room_id"`
        Token  string `json:"token"`
}

// Signup 报名竞技场
func (h *ArenaHandler) Signup(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== Arena Signup 开始处理 ===")

        // 获取请求数据
        var req ArenaSignupRequest
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if roomID, ok := params["room_id"].(float64); ok {
                                req.RoomID = uint64(roomID)
                        }
                        if token, ok := params["token"].(string); ok {
                                req.Token = token
                        }
                }
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        log.Printf("🏟️ 报名请求 - RoomID: %d, Token长度: %d", req.RoomID, len(req.Token))

        if req.Token == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少token")
                return
        }

        if req.RoomID == 0 {
                writeJSONError(w, http.StatusBadRequest, "缺少房间ID")
                return
        }

        // 验证token并获取玩家信息
        db := database.DB()
        if db == nil {
                writeJSONError(w, http.StatusInternalServerError, "数据库未连接")
                return
        }

        var account database.UserAccount
        if err := db.Where("token = ?", req.Token).First(&account).Error; err != nil {
                writeJSONError(w, http.StatusUnauthorized, "token无效或已过期")
                return
        }

        // 检查Token是否过期
        if account.TokenExpireAt != nil && account.TokenExpireAt.Before(time.Now()) {
                writeJSONError(w, http.StatusUnauthorized, "token已过期")
                return
        }

        // 获取玩家信息
        var player database.Player
        if err := db.Where("id = ?", account.PlayerID).First(&player).Error; err != nil {
                writeJSONError(w, http.StatusInternalServerError, "获取玩家信息失败")
                return
        }

        // 🔧【调试】打印玩家金币余额
        log.Printf("🔍 [报名调试] 玩家ID: %d, 金币余额: %d", player.ID, player.Gold)

        // 检查玩家状态
        if player.Status != database.PlayerStatusNormal {
                writeJSONError(w, http.StatusForbidden, "账号状态异常，无法报名")
                return
        }

        // 获取房间配置
        var roomConfig database.RoomConfig
        if err := db.Where("id = ? AND status = 1", req.RoomID).First(&roomConfig).Error; err != nil {
                writeJSONError(w, http.StatusBadRequest, "房间不存在或已关闭")
                return
        }

        // 检查是否是竞技场房间
        if roomConfig.RoomCategory != 2 {
                writeJSONError(w, http.StatusBadRequest, "该房间不是竞技场房间")
                return
        }

        // 获取当前期号信息
        periodInfo, err := h.getCurrentPeriodInfo(req.RoomID, &roomConfig)
        if err != nil {
                writeJSONError(w, http.StatusInternalServerError, "获取期号信息失败")
                return
        }

        if periodInfo == nil {
                writeJSONError(w, http.StatusBadRequest, "当前不在报名时间内")
                return
        }

        // 检查是否在报名阶段
        if periodInfo.Phase != "signup" {
                writeJSONError(w, http.StatusBadRequest, "当前不在报名时间内")
                return
        }

        // 检查是否已报名（通过期号玩家快照表查询）
        existingPlayer, err := h.getPlayerSignup(periodInfo.PeriodNo, player.ID)
        if err == nil && existingPlayer != nil && existingPlayer.Status == database.ArenaPeriodPlayerStatusNormal {
                writeJSONError(w, http.StatusBadRequest, "您已报名，请勿重复报名")
                return
        }

        // 🔧【新增】检查是否已报名其他竞技场（初级、中级、高级只能报一个）
        otherSignupRoom, err := h.checkOtherArenaSignup(player.ID, req.RoomID, periodInfo.PeriodNo)
        if err != nil {
                log.Printf("⚠️ 检查其他竞技场报名失败: %v", err)
        } else if otherSignupRoom != "" {
                writeJSONError(w, http.StatusBadRequest, fmt.Sprintf("您已报名%s，每场只能报名一个级别", otherSignupRoom))
                return
        }

        // 使用房间配置中的 EntryGold 作为报名费
        // 注意：报名费使用 ddz_room_config.entry_gold 字段
        signupFee := roomConfig.EntryGold

        // 🔧【调试】打印报名门槛信息
        log.Printf("🔍 [报名调试] 房间ID: %d, 房间名: %s, 报名门槛(entry_gold): %d, 玩家金币: %d", 
                roomConfig.ID, roomConfig.RoomName, signupFee, player.Gold)

        // 检查金币是否足够
        if player.Gold < signupFee {
                log.Printf("❌ [报名调试] 金币不足: 玩家 %d, 需要 %d, 当前 %d", player.ID, signupFee, player.Gold)
                writeJSONError(w, http.StatusBadRequest, fmt.Sprintf("金币不足，需要%d，当前%d", signupFee, player.Gold))
                return
        }

        // 记录报名前余额
        balanceBefore := player.Gold

        // 扣除报名费（如果有）- 使用带流水的函数
        if signupFee > 0 {
                if err := database.UpdatePlayerGoldWithLog(player.ID, -signupFee, database.GoldChangeArenaSignup, periodInfo.PeriodNo, "竞技场报名扣除"); err != nil {
                        writeJSONError(w, http.StatusInternalServerError, "扣除报名费失败")
                        return
                }
        }

        // 尝试获取期号记录（可能还没创建，由WebSocket服务器异步创建）
        var periodID uint64 = 0
        period, err := database.GetArenaPeriodByPeriodNo(periodInfo.PeriodNo)
        if err == nil && period != nil {
                periodID = period.ID
        }

        // 创建报名玩家记录
        periodPlayer := &database.ArenaPeriodPlayer{
                PeriodNo:   periodInfo.PeriodNo,
                PeriodID:   periodID,
                RoomID:     req.RoomID,
                PlayerID:   player.ID,
                SignupTime: time.Now(),
                SignupFee:  signupFee,
                Status:     database.ArenaPeriodPlayerStatusNormal,
        }

        // 使用 Upsert 防止重复报名（使用 period_no + player_id 检查重复）
        result, err := database.UpsertArenaPeriodPlayer(periodPlayer)
        if err != nil {
                // 检查是否是"已报名"错误
                if result == database.UpsertResultExists {
                        writeJSONError(w, http.StatusBadRequest, "您已报名，请勿重复报名")
                        return
                }
                // 回滚报名费 - 使用带流水的函数
                if signupFee > 0 {
                        database.UpdatePlayerGoldWithLog(player.ID, signupFee, database.GoldChangeArenaRefund, periodInfo.PeriodNo, "报名失败回滚")
                }
                writeJSONError(w, http.StatusInternalServerError, "报名失败，请重试")
                return
        }

        // 注意：比赛金币初始化在开赛时由 CreateParticipationsFromSignups 完成
        // 报名时只记录报名信息，比赛过程数据由 participations 表管理

        // 更新期号报名人数（仅当新建记录时才增加计数，恢复记录不增加）
        if periodID > 0 && result == database.UpsertResultCreated {
                database.UpdateArenaPeriodSignupCount(periodID, 1, 0)
        }

        // 添加到Redis报名列表
        log.Printf("📝 [报名] 准备添加到Redis - h.redis是否为nil: %v, periodNo: %s", h.redis == nil, periodInfo.PeriodNo)
        if h.redis != nil {
                ctx := context.Background()
                key := getSignupListKey(periodInfo.PeriodNo)
                log.Printf("📝 [报名] Redis key: %s, playerID: %d", key, player.ID)
                if err := h.redis.SAdd(ctx, key, player.ID); err != nil {
                        log.Printf("⚠️ [报名] 添加到Redis报名列表失败: %v", err)
                } else {
                        // 🔧【修复】给主 key 设置过期时间（10分钟后过期，每期只有5分钟，预留缓冲）
                        h.redis.Expire(ctx, key, 10*time.Minute)
                        log.Printf("✅ [报名] 已添加到Redis报名列表 - key: %s, playerID: %d", key, player.ID)
                        
                        // 验证是否添加成功
                        count, err := h.redis.SCard(ctx, key)
                        if err != nil {
                                log.Printf("⚠️ [报名] 验证Redis添加失败: %v", err)
                        } else {
                                log.Printf("✅ [报名] Redis报名列表当前人数: %d", count)
                        }
                }
        } else {
                log.Printf("⚠️ [报名] Redis客户端为nil，跳过Redis操作")
        }

        // 记录报名日志
        signupLog := &database.ArenaSignupLog{
                PeriodNo:      periodInfo.PeriodNo,
                PeriodID:      periodID,
                RoomID:        req.RoomID,
                PlayerID:      player.ID,
                ActionType:    database.ArenaSignupActionSignup,
                SignupFee:     signupFee,
                BalanceBefore: balanceBefore,
                BalanceAfter:  balanceBefore - signupFee,
        }
        database.CreateArenaSignupLog(signupLog)

        balanceAfter := balanceBefore - signupFee

        log.Printf("✅ 玩家 %d 报名成功 - 期号: %s, 报名费: %d, 余额: %d", player.ID, periodInfo.PeriodNo, signupFee, balanceAfter)

        // 🔧【新增】立即广播报名人数给所有客户端
        TriggerArenaBroadcast(req.RoomID)

        writeJSONSuccess(w, map[string]interface{}{
                "success":       true,
                "message":       "报名成功",
                "period_no":     periodInfo.PeriodNo,
                "room_id":       req.RoomID,
                "signup_fee":    signupFee,
                "balance_after": balanceAfter,
                "signup_time":   time.Now().UnixMilli(),
        })
}

// Cancel 取消报名
func (h *ArenaHandler) Cancel(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== Arena Cancel 开始处理 ===")

        // 获取请求数据
        var req ArenaCancelRequest
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if roomID, ok := params["room_id"].(float64); ok {
                                req.RoomID = uint64(roomID)
                        }
                        if token, ok := params["token"].(string); ok {
                                req.Token = token
                        }
                }
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        log.Printf("🏟️ 取消报名请求 - RoomID: %d, Token长度: %d", req.RoomID, len(req.Token))

        if req.Token == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少token")
                return
        }

        if req.RoomID == 0 {
                writeJSONError(w, http.StatusBadRequest, "缺少房间ID")
                return
        }

        // 验证token并获取玩家信息
        db := database.DB()
        if db == nil {
                writeJSONError(w, http.StatusInternalServerError, "数据库未连接")
                return
        }

        var account database.UserAccount
        if err := db.Where("token = ?", req.Token).First(&account).Error; err != nil {
                writeJSONError(w, http.StatusUnauthorized, "token无效或已过期")
                return
        }

        // 获取玩家信息
        var player database.Player
        if err := db.Where("id = ?", account.PlayerID).First(&player).Error; err != nil {
                writeJSONError(w, http.StatusInternalServerError, "获取玩家信息失败")
                return
        }

        // 获取房间配置
        var roomConfig database.RoomConfig
        if err := db.Where("id = ? AND status = 1", req.RoomID).First(&roomConfig).Error; err != nil {
                writeJSONError(w, http.StatusBadRequest, "房间不存在或已关闭")
                return
        }

        // 获取当前期号信息
        periodInfo, err := h.getCurrentPeriodInfo(req.RoomID, &roomConfig)
        if err != nil || periodInfo == nil {
                writeJSONError(w, http.StatusBadRequest, "当前不在报名时间，无法取消报名")
                return
        }

        // 查找报名记录
        periodPlayer, err := h.getPlayerSignup(periodInfo.PeriodNo, player.ID)
        if err != nil || periodPlayer == nil {
                writeJSONError(w, http.StatusBadRequest, "未找到报名记录")
                return
        }

        if periodPlayer.Status != database.ArenaPeriodPlayerStatusNormal {
                writeJSONError(w, http.StatusBadRequest, "报名已取消")
                return
        }

        // 更新报名状态为已取消
        if err := database.UpdateArenaPeriodPlayerStatus(periodPlayer.PeriodID, player.ID, database.ArenaPeriodPlayerStatusCanceled); err != nil {
                writeJSONError(w, http.StatusInternalServerError, "取消报名失败")
                return
        }

        // 退还报名费 - 使用带流水的函数
        if periodPlayer.SignupFee > 0 {
                if err := database.UpdatePlayerGoldWithLog(player.ID, periodPlayer.SignupFee, database.GoldChangeArenaRefund, periodInfo.PeriodNo, "取消报名退还"); err != nil {
                        log.Printf("⚠️ 退还报名费失败: %v", err)
                }
        }

        // 更新期号报名人数
        database.UpdateArenaPeriodSignupCount(periodPlayer.PeriodID, 0, 1)

        // 从Redis报名列表移除
        if h.redis != nil {
                ctx := context.Background()
                key := getSignupListKey(periodInfo.PeriodNo)
                if err := h.redis.SRem(ctx, key, player.ID); err != nil {
                        log.Printf("⚠️ 从Redis报名列表移除失败: %v", err)
                } else {
                        log.Printf("✅ 已从Redis报名列表移除 - periodNo: %s, playerID: %d", periodInfo.PeriodNo, player.ID)
                }
        }

        // 获取最新余额
        db.Where("id = ?", player.ID).First(&player)

        // 获取期号记录
        period, _ := database.GetArenaPeriodByPeriodNo(periodInfo.PeriodNo)
        var periodID uint64
        if period != nil {
                periodID = period.ID
        }

        // 记录取消日志
        signupLog := &database.ArenaSignupLog{
                PeriodNo:      periodInfo.PeriodNo,
                PeriodID:      periodID,
                RoomID:        req.RoomID,
                PlayerID:      player.ID,
                ActionType:    database.ArenaSignupActionCancel,
                SignupFee:     periodPlayer.SignupFee,
                BalanceBefore: player.Gold - periodPlayer.SignupFee,
                BalanceAfter:  player.Gold,
        }
        database.CreateArenaSignupLog(signupLog)

        log.Printf("✅ 玩家 %d 取消报名成功 - 期号: %s, 退还报名费: %d", player.ID, periodInfo.PeriodNo, periodPlayer.SignupFee)

        // 🔧【新增】立即广播报名人数给所有客户端
        TriggerArenaBroadcast(req.RoomID)

        writeJSONSuccess(w, map[string]interface{}{
                "success":       true,
                "message":       "取消报名成功",
                "period_no":     periodInfo.PeriodNo,
                "room_id":       req.RoomID,
                "refund_amount": periodPlayer.SignupFee,
                "balance_after": player.Gold,
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

// checkOtherArenaSignup 检查玩家是否已报名其他竞技场
// 返回已报名的房间名称，如果没报名则返回空字符串
func (h *ArenaHandler) checkOtherArenaSignup(playerID uint64, currentRoomID uint64, currentPeriodNo string) (string, error) {
        db := database.DB()
        if db == nil {
                return "", fmt.Errorf("数据库未连接")
        }

        // 获取所有竞技场房间配置
        var roomConfigs []database.RoomConfig
        if err := db.Where("room_category = ? AND status = 1", 2).Find(&roomConfigs).Error; err != nil {
                return "", err
        }

        // 遍历其他竞技场房间，检查是否有报名
        for _, config := range roomConfigs {
                if config.ID == currentRoomID {
                        continue // 跳过当前房间
                }

                // 获取该房间的当前期号
                periodInfo, err := h.getCurrentPeriodInfo(config.ID, &config)
                if err != nil || periodInfo == nil {
                        continue
                }

                // 检查玩家是否报名了该房间
                player, err := h.getPlayerSignup(periodInfo.PeriodNo, playerID)
                if err == nil && player != nil && player.Status == database.ArenaPeriodPlayerStatusNormal {
                        return config.RoomName, nil // 返回已报名的房间名称
                }
        }

        return "", nil
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
