package task

import (
	"fmt"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/service/ddz"
	"go.uber.org/zap"
)

// CleanupStaleRooms 清理僵尸房间
// 将长时间处于"游戏中"状态但实际已无活动的房间更新为"已关闭"
// 执行时机：每5分钟执行一次
func CleanupStaleRooms() error {
	db := ddz.GetDDZDB()
	if db == nil {
		return fmt.Errorf("获取DDZ数据库连接失败")
	}

	now := time.Now()
	currentMonth := now.Format("200601")
	tableName := fmt.Sprintf("ddz_rooms_%s", currentMonth)

	// 检查分表是否存在
	var tableCount int64
	db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", tableName).Scan(&tableCount)
	if tableCount == 0 {
		global.GVA_LOG.Debug("当前月份的房间分表不存在，跳过清理", zap.String("table", tableName))
		return nil
	}

	// 清理条件：
	// 1. 状态为"游戏中" (status = 2)
	// 2. 更新时间超过30分钟前 (updated_at < NOW() - 30分钟)
	// 这些房间很可能是由于服务器异常退出或玩家断开导致的僵尸房间
	staleThreshold := now.Add(-30 * time.Minute)

	// 更新僵尸房间状态为已关闭
	result := db.Table(tableName).
		Where("status = ? AND updated_at < ?", 2, staleThreshold).
		Updates(map[string]interface{}{
			"status":    0, // 已关闭
			"ended_at":  now,
		})

	if result.Error != nil {
		global.GVA_LOG.Error("清理僵尸房间失败", zap.Error(result.Error))
		return result.Error
	}

	if result.RowsAffected > 0 {
		global.GVA_LOG.Info("清理僵尸房间完成",
			zap.Int64("affected_rows", result.RowsAffected),
			zap.String("table", tableName),
			zap.Time("threshold", staleThreshold))
	}

	// 同时检查上个月的分表（处理跨月的情况）
	lastMonth := now.AddDate(0, -1, 0).Format("200601")
	lastMonthTable := fmt.Sprintf("ddz_rooms_%s", lastMonth)

	db.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", lastMonthTable).Scan(&tableCount)
	if tableCount > 0 {
		result = db.Table(lastMonthTable).
			Where("status = ? AND updated_at < ?", 2, staleThreshold).
			Updates(map[string]interface{}{
				"status":   0,
				"ended_at": now,
			})

		if result.Error != nil {
			global.GVA_LOG.Error("清理上月份僵尸房间失败", zap.Error(result.Error))
		} else if result.RowsAffected > 0 {
			global.GVA_LOG.Info("清理上月份僵尸房间完成",
				zap.Int64("affected_rows", result.RowsAffected),
				zap.String("table", lastMonthTable))
		}
	}

	return nil
}

// CleanupStaleRoomsWithLog 带日志的清理任务（用于定时任务）
func CleanupStaleRoomsWithLog() {
	global.GVA_LOG.Info("开始执行清理僵尸房间任务...")
	startTime := time.Now()

	if err := CleanupStaleRooms(); err != nil {
		global.GVA_LOG.Error("清理僵尸房间任务失败", zap.Error(err))
		return
	}

	duration := time.Since(startTime)
	global.GVA_LOG.Info("清理僵尸房间任务完成", zap.Duration("duration", duration))
}
