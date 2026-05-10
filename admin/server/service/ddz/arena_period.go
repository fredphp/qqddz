package ddz

import (
        "errors"
        "fmt"
        "time"

        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "gorm.io/gorm"
)

type DDZArenaPeriodService struct{}

// getArenaPeriodTableName 获取期号分表名（根据时间）
func getArenaPeriodTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_arena_periods_%s", suffix)
}

// getArenaSignupLogTableName 获取报名日志分表名（根据时间）
func getArenaSignupLogTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_arena_signup_logs_%s", suffix)
}

// getArenaPeriodPlayerTableName 获取期号玩家分表名（根据时间）
func getArenaPeriodPlayerTableName(t time.Time) string {
        suffix := t.Format("200601")
        return fmt.Sprintf("ddz_arena_period_players_%s", suffix)
}

// ensureTableExists 确保分表存在
func ensureTableExists(db *gorm.DB, tableName string) bool {
        var count int64
        db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&count)
        return count > 0
}

// GetArenaPeriodList 获取期号列表（支持跨月份分表查询）
func (s *DDZArenaPeriodService) GetArenaPeriodList(req ddzReq.ArenaPeriodSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 解析日期范围，确定需要查询哪些分表
        var startTime, endTime time.Time
        if req.StartDate != "" {
                startTime, _ = time.Parse("2006-01-02", req.StartDate)
        }
        if req.EndDate != "" {
                endTime, _ = time.Parse("2006-01-02", req.EndDate)
        }

        // 如果没有指定日期范围，默认查询最近3个月
        if startTime.IsZero() {
                startTime = time.Now().AddDate(0, -3, 0)
        }
        if endTime.IsZero() {
                endTime = time.Now()
        }
        // 结束时间设为当天的最后一秒
        endTime = time.Date(endTime.Year(), endTime.Month(), endTime.Day(), 23, 59, 59, 0, endTime.Location())

        // 收集需要查询的所有分表
        var tables []string
        startMonth := time.Date(startTime.Year(), startTime.Month(), 1, 0, 0, 0, 0, startTime.Location())
        endMonth := time.Date(endTime.Year(), endTime.Month(), 1, 0, 0, 0, 0, endTime.Location())

        for m := startMonth; !m.After(endMonth); m = m.AddDate(0, 1, 0) {
                tableName := getArenaPeriodTableName(m)
                if ensureTableExists(db, tableName) {
                        tables = append(tables, tableName)
                }
        }

        if len(tables) == 0 {
                return []ddzRes.ArenaPeriodResponse{}, 0, nil
        }

        // 构建 UNION ALL 查询
        var unionQuery string
        var args []interface{}
        for i, table := range tables {
                if i > 0 {
                        unionQuery += " UNION ALL "
                }
                subQuery := fmt.Sprintf(`
                        SELECT p.id, p.period_no, p.room_id, p.room_config_id, p.period_index,
                                p.start_time, p.signup_start_time, p.signup_end_time, p.end_time,
                                p.total_signup, p.total_cancel, p.final_players, p.status, p.session_id,
                                p.created_at, p.updated_at,
                                COALESCE(rc.room_name, '') as room_name,
                                COALESCE(rc.room_type, 0) as room_type
                        FROM %s p
                        LEFT JOIN ddz_room_config rc ON p.room_config_id = rc.id
                `, table)
                unionQuery += subQuery
        }

        // 构建条件
        whereClause := " WHERE 1=1"
        if req.PeriodNo != "" {
                whereClause += " AND period_no LIKE ?"
                args = append(args, "%"+req.PeriodNo+"%")
        }
        if req.RoomID > 0 {
                whereClause += " AND room_id = ?"
                args = append(args, req.RoomID)
        }
        if req.Status != nil {
                whereClause += " AND status = ?"
                args = append(args, *req.Status)
        }
        if req.RoomType != nil {
                whereClause += " AND room_type = ?"
                args = append(args, *req.RoomType)
        }
        // 使用解析后的日期范围，而不是原始请求参数
        whereClause += " AND DATE(start_time) >= ? AND DATE(start_time) <= ?"
        args = append(args, startTime.Format("2006-01-02"), endTime.Format("2006-01-02"))

        // 统计总数
        countQuery := "SELECT COUNT(*) FROM (" + unionQuery + ") AS combined" + whereClause
        if err = db.Raw(countQuery, args...).Scan(&total).Error; err != nil {
                return nil, 0, err
        }

        // 查询列表
        listQuery := "SELECT * FROM (" + unionQuery + ") AS combined" + whereClause + " ORDER BY id DESC LIMIT ? OFFSET ?"
        listArgs := append(args, limit, offset)

        var periods []struct {
                ID              uint64     `gorm:"column:id"`
                PeriodNo        string     `gorm:"column:period_no"`
                RoomID          uint64     `gorm:"column:room_id"`
                RoomConfigID    uint64     `gorm:"column:room_config_id"`
                RoomName        string     `gorm:"column:room_name"`
                RoomType        int        `gorm:"column:room_type"`
                PeriodIndex     int        `gorm:"column:period_index"`
                StartTime       time.Time  `gorm:"column:start_time"`
                SignupStartTime time.Time  `gorm:"column:signup_start_time"`
                SignupEndTime   time.Time  `gorm:"column:signup_end_time"`
                EndTime         time.Time  `gorm:"column:end_time"`
                TotalSignup     int        `gorm:"column:total_signup"`
                TotalCancel     int        `gorm:"column:total_cancel"`
                FinalPlayers    int        `gorm:"column:final_players"`
                Status          uint8      `gorm:"column:status"`
                SessionID       *uint64    `gorm:"column:session_id"`
                CreatedAt       time.Time  `gorm:"column:created_at"`
                UpdatedAt       time.Time  `gorm:"column:updated_at"`
        }

        if err = db.Raw(listQuery, listArgs...).Scan(&periods).Error; err != nil {
                return nil, 0, err
        }

        // 调试：打印查询结果
        for _, p := range periods {
                fmt.Printf("[DEBUG] PeriodNo=%s, RoomID=%d, RoomConfigID=%d, RoomType=%d, RoomName=%s\n",
                        p.PeriodNo, p.RoomID, p.RoomConfigID, p.RoomType, p.RoomName)
        }

        // 转换为响应格式
        result := make([]ddzRes.ArenaPeriodResponse, 0, len(periods))
        for _, p := range periods {
                // 查询会话状态
                var sessionStatus *uint8
                if p.SessionID != nil {
                        var status uint8
                        db.Table("ddz_arena_sessions").Where("id = ?", *p.SessionID).Pluck("status", &status)
                        sessionStatus = &status
                }

                result = append(result, ddzRes.ArenaPeriodResponse{
                        ID:              p.ID,
                        PeriodNo:        p.PeriodNo,
                        RoomID:          p.RoomID,
                        RoomConfigID:    p.RoomConfigID,
                        RoomName:        p.RoomName,
                        RoomType:        p.RoomType,
                        RoomTypeText:    p.RoomName, // 直接使用 ddz_room_config 表的 room_name
                        PeriodIndex:     p.PeriodIndex,
                        StartTime:       p.StartTime.Format("2006-01-02 15:04:05"),
                        SignupStartTime: p.SignupStartTime.Format("2006-01-02 15:04:05"),
                        SignupEndTime:   p.SignupEndTime.Format("2006-01-02 15:04:05"),
                        EndTime:         p.EndTime.Format("2006-01-02 15:04:05"),
                        TotalSignup:     p.TotalSignup,
                        TotalCancel:     p.TotalCancel,
                        FinalPlayers:    p.FinalPlayers,
                        Status:          p.Status,
                        StatusText:      getPeriodStatusText(p.Status),
                        SessionID:       p.SessionID,
                        SessionStatus:   sessionStatus,
                        CreatedAt:       p.CreatedAt.Format("2006-01-02 15:04:05"),
                        UpdatedAt:       p.UpdatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// GetArenaPeriodByID 根据ID获取期号详情
func (s *DDZArenaPeriodService) GetArenaPeriodByID(id uint64) (ddzRes.ArenaPeriodResponse, error) {
        db := GetDDZDB()

        // 尝试在最近6个月的分表中查找
        var period struct {
                ID              uint64    `gorm:"column:id"`
                PeriodNo        string    `gorm:"column:period_no"`
                RoomID          uint64    `gorm:"column:room_id"`
                RoomConfigID    uint64    `gorm:"column:room_config_id"`
                RoomName        string    `gorm:"column:room_name"`
                RoomType        int       `gorm:"column:room_type"`
                PeriodIndex     int       `gorm:"column:period_index"`
                StartTime       time.Time `gorm:"column:start_time"`
                SignupStartTime time.Time `gorm:"column:signup_start_time"`
                SignupEndTime   time.Time `gorm:"column:signup_end_time"`
                EndTime         time.Time `gorm:"column:end_time"`
                TotalSignup     int       `gorm:"column:total_signup"`
                TotalCancel     int       `gorm:"column:total_cancel"`
                FinalPlayers    int       `gorm:"column:final_players"`
                Status          uint8     `gorm:"column:status"`
                SessionID       *uint64   `gorm:"column:session_id"`
                CreatedAt       time.Time `gorm:"column:created_at"`
                UpdatedAt       time.Time `gorm:"column:updated_at"`
        }

        found := false
        now := time.Now()
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getArenaPeriodTableName(t)
                if !ensureTableExists(db, tableName) {
                        continue
                }

                err := db.Table(tableName+" p").
                        Select(`p.id, p.period_no, p.room_id, p.room_config_id, p.period_index,
                                p.start_time, p.signup_start_time, p.signup_end_time, p.end_time,
                                p.total_signup, p.total_cancel, p.final_players, p.status, p.session_id,
                                p.created_at, p.updated_at,
                                COALESCE(rc.room_name, '') as room_name,
                                COALESCE(rc.room_type, 0) as room_type`).
                        Joins("LEFT JOIN ddz_room_config rc ON p.room_config_id = rc.id").
                        Where("p.id = ?", id).
                        First(&period).Error

                if err == nil {
                        found = true
                        break
                }
        }

        if !found {
                return ddzRes.ArenaPeriodResponse{}, errors.New("期号不存在")
        }

        return ddzRes.ArenaPeriodResponse{
                ID:              period.ID,
                PeriodNo:        period.PeriodNo,
                RoomID:          period.RoomID,
                RoomConfigID:    period.RoomConfigID,
                RoomName:        period.RoomName,
                RoomType:        period.RoomType,
                RoomTypeText:    period.RoomName, // 直接使用 ddz_room_config 表的 room_name
                PeriodIndex:     period.PeriodIndex,
                StartTime:       period.StartTime.Format("2006-01-02 15:04:05"),
                SignupStartTime: period.SignupStartTime.Format("2006-01-02 15:04:05"),
                SignupEndTime:   period.SignupEndTime.Format("2006-01-02 15:04:05"),
                EndTime:         period.EndTime.Format("2006-01-02 15:04:05"),
                TotalSignup:     period.TotalSignup,
                TotalCancel:     period.TotalCancel,
                FinalPlayers:    period.FinalPlayers,
                Status:          period.Status,
                StatusText:      getPeriodStatusText(period.Status),
                SessionID:       period.SessionID,
                CreatedAt:       period.CreatedAt.Format("2006-01-02 15:04:05"),
                UpdatedAt:       period.UpdatedAt.Format("2006-01-02 15:04:05"),
        }, nil
}

// UpdateArenaPeriodStatus 更新期号状态
func (s *DDZArenaPeriodService) UpdateArenaPeriodStatus(req ddzReq.ArenaPeriodUpdate) error {
        db := GetDDZDB()

        updates := map[string]interface{}{
                "updated_at": time.Now(),
        }

        if req.Status != nil {
                updates["status"] = *req.Status
        }
        if req.TotalSignup != nil {
                updates["total_signup"] = *req.TotalSignup
        }
        if req.TotalCancel != nil {
                updates["total_cancel"] = *req.TotalCancel
        }
        if req.FinalPlayers != nil {
                updates["final_players"] = *req.FinalPlayers
        }

        // 尝试在最近6个月的分表中更新
        now := time.Now()
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getArenaPeriodTableName(t)
                if !ensureTableExists(db, tableName) {
                        continue
                }

                result := db.Table(tableName).Where("id = ?", req.ID).Updates(updates)
                if result.Error != nil {
                        continue
                }
                if result.RowsAffected > 0 {
                        return nil
                }
        }

        return errors.New("期号不存在或更新失败")
}

// DeleteArenaPeriod 删除期号
func (s *DDZArenaPeriodService) DeleteArenaPeriod(id uint64) error {
        db := GetDDZDB()

        // 尝试在最近6个月的分表中查找并删除
        now := time.Now()
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getArenaPeriodTableName(t)
                if !ensureTableExists(db, tableName) {
                        continue
                }

                // 检查是否有关联数据
                var playerCount int64
                playerTable := getArenaPeriodPlayerTableName(t)
                if ensureTableExists(db, playerTable) {
                        db.Table(playerTable).Where("period_id = ?", id).Count(&playerCount)
                        if playerCount > 0 {
                                return errors.New("该期号有报名玩家数据，无法删除")
                        }
                }

                var logCount int64
                logTable := getArenaSignupLogTableName(t)
                if ensureTableExists(db, logTable) {
                        db.Table(logTable).Where("period_id = ?", id).Count(&logCount)
                        if logCount > 0 {
                                return errors.New("该期号有报名日志数据，无法删除")
                        }
                }

                result := db.Table(tableName).Where("id = ?", id).Delete(nil)
                if result.Error != nil {
                        continue
                }
                if result.RowsAffected > 0 {
                        return nil
                }
        }

        return errors.New("期号不存在或删除失败")
}

// GetArenaPeriodPlayers 获取期号玩家列表
func (s *DDZArenaPeriodService) GetArenaPeriodPlayers(req ddzReq.ArenaPeriodPlayerSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 尝试在最近6个月的分表中查找
        now := time.Now()
        var tableName string
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tName := getArenaPeriodPlayerTableName(t)
                if ensureTableExists(db, tName) {
                        // 检查是否有该period_id的数据
                        var count int64
                        db.Table(tName).Where("period_id = ?", req.PeriodID).Count(&count)
                        if count > 0 {
                                tableName = tName
                                break
                        }
                }
        }

        if tableName == "" {
                return []ddzRes.ArenaPeriodPlayerResponse{}, 0, nil
        }

        query := db.Table(tableName+" pp").
                Select(`pp.id, pp.period_no, pp.period_id, pp.player_id, pp.signup_time,
                        pp.signup_order, pp.signup_fee, pp.status, pp.created_at,
                        COALESCE(p.nickname, '') as player_name`).
                Joins("LEFT JOIN ddz_players p ON pp.player_id = p.id").
                Where("pp.period_id = ?", req.PeriodID)

        if req.Status != nil {
                query = query.Where("pp.status = ?", *req.Status)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var players []struct {
                ID          uint64    `gorm:"column:id"`
                PeriodNo    string    `gorm:"column:period_no"`
                PeriodID    uint64    `gorm:"column:period_id"`
                PlayerID    uint64    `gorm:"column:player_id"`
                PlayerName  string    `gorm:"column:player_name"`
                SignupTime  time.Time `gorm:"column:signup_time"`
                SignupOrder int       `gorm:"column:signup_order"`
                SignupFee   int64     `gorm:"column:signup_fee"`
                Status      uint8     `gorm:"column:status"`
                CreatedAt   time.Time `gorm:"column:created_at"`
        }

        err = query.Limit(limit).Offset(offset).Order("pp.signup_order ASC").Find(&players).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.ArenaPeriodPlayerResponse, 0, len(players))
        for _, p := range players {
                result = append(result, ddzRes.ArenaPeriodPlayerResponse{
                        ID:          p.ID,
                        PeriodNo:    p.PeriodNo,
                        PeriodID:    p.PeriodID,
                        PlayerID:    p.PlayerID,
                        PlayerName:  p.PlayerName,
                        SignupTime:  p.SignupTime.Format("2006-01-02 15:04:05"),
                        SignupOrder: p.SignupOrder,
                        SignupFee:   p.SignupFee,
                        Status:      p.Status,
                        StatusText:  getPlayerStatusText(p.Status),
                        CreatedAt:   p.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// GetArenaPeriodSignupLogs 获取期号报名日志
func (s *DDZArenaPeriodService) GetArenaPeriodSignupLogs(req ddzReq.ArenaPeriodSignupLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)

        // 尝试在最近6个月的分表中查找
        now := time.Now()
        var tableName string
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tName := getArenaSignupLogTableName(t)
                if ensureTableExists(db, tName) {
                        // 检查是否有该period_id的数据
                        var count int64
                        db.Table(tName).Where("period_id = ?", req.PeriodID).Count(&count)
                        if count > 0 {
                                tableName = tName
                                break
                        }
                }
        }

        if tableName == "" {
                return []ddzRes.ArenaPeriodSignupLogResponse{}, 0, nil
        }

        query := db.Table(tableName+" sl").
                Select(`sl.id, sl.period_no, sl.period_id, sl.player_id, sl.action_type,
                        sl.signup_fee, sl.balance_before, sl.balance_after, sl.remark, sl.created_at,
                        COALESCE(p.nickname, '') as player_name`).
                Joins("LEFT JOIN ddz_players p ON sl.player_id = p.id").
                Where("sl.period_id = ?", req.PeriodID)

        if req.PlayerID > 0 {
                query = query.Where("sl.player_id = ?", req.PlayerID)
        }
        if req.ActionType != nil {
                query = query.Where("sl.action_type = ?", *req.ActionType)
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var logs []struct {
                ID            uint64    `gorm:"column:id"`
                PeriodNo      string    `gorm:"column:period_no"`
                PeriodID      uint64    `gorm:"column:period_id"`
                PlayerID      uint64    `gorm:"column:player_id"`
                PlayerName    string    `gorm:"column:player_name"`
                ActionType    uint8     `gorm:"column:action_type"`
                SignupFee     int64     `gorm:"column:signup_fee"`
                BalanceBefore int64     `gorm:"column:balance_before"`
                BalanceAfter  int64     `gorm:"column:balance_after"`
                Remark        string    `gorm:"column:remark"`
                CreatedAt     time.Time `gorm:"column:created_at"`
        }

        err = query.Limit(limit).Offset(offset).Order("sl.id DESC").Find(&logs).Error
        if err != nil {
                return nil, 0, err
        }

        result := make([]ddzRes.ArenaPeriodSignupLogResponse, 0, len(logs))
        for _, l := range logs {
                actionText := "报名"
                if l.ActionType == 2 {
                        actionText = "取消报名"
                }

                result = append(result, ddzRes.ArenaPeriodSignupLogResponse{
                        ID:            l.ID,
                        PeriodNo:      l.PeriodNo,
                        PeriodID:      l.PeriodID,
                        PlayerID:      l.PlayerID,
                        PlayerName:    l.PlayerName,
                        ActionType:    l.ActionType,
                        ActionText:    actionText,
                        SignupFee:     l.SignupFee,
                        BalanceBefore: l.BalanceBefore,
                        BalanceAfter:  l.BalanceAfter,
                        Remark:        l.Remark,
                        CreatedAt:     l.CreatedAt.Format("2006-01-02 15:04:05"),
                })
        }

        return result, total, nil
}

// GetArenaPeriodStats 获取期号统计
func (s *DDZArenaPeriodService) GetArenaPeriodStats() (ddzRes.ArenaPeriodStatsResponse, error) {
        db := GetDDZDB()
        today := time.Now().Format("2006-01-02")

        var stats ddzRes.ArenaPeriodStatsResponse

        // 统计最近6个月的数据
        now := time.Now()
        for i := 0; i < 6; i++ {
                t := now.AddDate(0, -i, 0)
                tableName := getArenaPeriodTableName(t)
                if !ensureTableExists(db, tableName) {
                        continue
                }

                // 总期号数
                var monthTotal int64
                db.Table(tableName).Count(&monthTotal)
                stats.TotalPeriods += monthTotal

                // 今日期号数
                var todayCount int64
                db.Table(tableName).Where("DATE(start_time) = ?", today).Count(&todayCount)
                stats.TodayPeriods += todayCount

                // 进行中期号数
                var activeCount int64
                db.Table(tableName).Where("status IN (?)", []uint8{1, 2, 3}).Count(&activeCount)
                stats.ActivePeriods += activeCount

                // 总报名人数
                var monthSignup int64
                db.Table(tableName).Select("COALESCE(SUM(total_signup), 0)").Scan(&monthSignup)
                stats.TotalSignup += monthSignup

                // 今日报名人数
                var todaySignup int64
                db.Table(tableName).Where("DATE(start_time) = ?", today).Select("COALESCE(SUM(total_signup), 0)").Scan(&todaySignup)
                stats.TodaySignup += todaySignup

                // 今日参赛人数
                var todayPlayers int64
                db.Table(tableName).Where("DATE(start_time) = ?", today).Select("COALESCE(SUM(final_players), 0)").Scan(&todayPlayers)
                stats.TodayPlayers += todayPlayers
        }

        return stats, nil
}

// 辅助函数
func getPeriodStatusText(status uint8) string {
        switch status {
        case 0:
                return "准备中"
        case 1:
                return "报名中"
        case 2:
                return "等待开赛"
        case 3:
                return "比赛进行中"
        case 4:
                return "已结束"
        case 5:
                return "已取消"
        default:
                return "未知"
        }
}

func getPlayerStatusText(status uint8) string {
        switch status {
        case 1:
                return "正常"
        case 2:
                return "已取消"
        case 3:
                return "超时未进入"
        default:
                return "未知"
        }
}
