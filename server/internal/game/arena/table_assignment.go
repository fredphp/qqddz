// Package arena 提供竞技场桌子分配逻辑
package arena

import (
	"log"
	"math/rand"
	"time"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
)

// =============================================
// 桌子分配配置
// =============================================

// TableAssignmentConfig 桌子分配配置
type TableAssignmentConfig struct {
	AvoidSameIP     bool `json:"avoid_same_ip"`     // 是否避免同IP同桌
	AvoidSameDevice bool `json:"avoid_same_device"` // 是否避免同设备同桌
	MaxRetryCount   int  `json:"max_retry_count"`   // 最大重试次数
}

// DefaultTableAssignmentConfig 默认配置
func DefaultTableAssignmentConfig() *TableAssignmentConfig {
	return &TableAssignmentConfig{
		AvoidSameIP:     true,
		AvoidSameDevice: true,
		MaxRetryCount:   100,
	}
}

// PlayerConnectionInfo 玩家连接信息
type PlayerConnectionInfo struct {
	PlayerID uint64
	IP       string
	DeviceID string
	IsRobot  bool
}

// =============================================
// 桌子分配器
// =============================================

// TableAssigner 桌子分配器
type TableAssigner struct {
	config *TableAssignmentConfig
}

// NewTableAssigner 创建桌子分配器
func NewTableAssigner(config *TableAssignmentConfig) *TableAssigner {
	if config == nil {
		config = DefaultTableAssignmentConfig()
	}
	return &TableAssigner{config: config}
}

// AssignTables 分配玩家到桌子
// players: 参赛玩家列表（包含连接信息）
// 返回: 桌子分配结果（每桌3人）
func (ta *TableAssigner) AssignTables(players []*PlayerConnectionInfo) [][]*PlayerConnectionInfo {
	if len(players) == 0 {
		return nil
	}

	// 分离真人和机器人
	realPlayers := make([]*PlayerConnectionInfo, 0)
	robotPlayers := make([]*PlayerConnectionInfo, 0)
	for _, p := range players {
		if p.IsRobot {
			robotPlayers = append(robotPlayers, p)
		} else {
			realPlayers = append(realPlayers, p)
		}
	}

	log.Printf("[TableAssigner] 开始分桌: 总人数=%d, 真人=%d, 机器人=%d",
		len(players), len(realPlayers), len(robotPlayers))

	// 1. 先分配真人玩家（考虑避免同IP/同设备）
	realTables := ta.assignRealPlayers(realPlayers)

	// 2. 合并机器人玩家
	allTables := ta.mergeRobots(realTables, robotPlayers)

	// 3. 验证分配结果
	ta.validateAssignment(allTables)

	return allTables
}

// assignRealPlayers 分配真人玩家
func (ta *TableAssigner) assignRealPlayers(players []*PlayerConnectionInfo) [][]*PlayerConnectionInfo {
	if len(players) == 0 {
		return nil
	}

	// 打乱玩家顺序
	shuffled := make([]*PlayerConnectionInfo, len(players))
	copy(shuffled, players)
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	// 计算桌数
	tableCount := (len(shuffled) + 2) / 3
	tables := make([][]*PlayerConnectionInfo, tableCount)
	for i := range tables {
		tables[i] = make([]*PlayerConnectionInfo, 0, 3)
	}

	// 依次分配玩家到桌子
	for _, player := range shuffled {
		assigned := false
		
		// 尝试找到合适的桌子
		for retry := 0; retry < ta.config.MaxRetryCount && !assigned; retry++ {
			for i := 0; i < len(tables) && !assigned; i++ {
				// 检查桌子是否已满
				if len(tables[i]) >= 3 {
					continue
				}

				// 检查是否可以加入该桌
				if ta.canJoinTable(player, tables[i]) {
					tables[i] = append(tables[i], player)
					assigned = true
					log.Printf("[TableAssigner] 玩家 %d 分配到桌 %d", player.PlayerID, i+1)
				}
			}

			// 如果所有桌子都不合适且重试次数未达到上限，重新打乱
			if !assigned && retry < ta.config.MaxRetryCount-1 {
				rand.Shuffle(len(tables), func(i, j int) {
					tables[i], tables[j] = tables[j], tables[i]
				})
			}
		}

		// 如果仍然无法分配，强制加入第一个未满的桌子
		if !assigned {
			for i := range tables {
				if len(tables[i]) < 3 {
					tables[i] = append(tables[i], player)
					log.Printf("[TableAssigner] 玩家 %d 强制分配到桌 %d (无法避免同IP/设备)", player.PlayerID, i+1)
					break
				}
			}
		}
	}

	return tables
}

// canJoinTable 检查玩家是否可以加入指定桌子
func (ta *TableAssigner) canJoinTable(player *PlayerConnectionInfo, table []*PlayerConnectionInfo) bool {
	if len(table) == 0 {
		return true
	}

	for _, existing := range table {
		// 检查同IP
		if ta.config.AvoidSameIP && player.IP != "" && existing.IP == player.IP {
			log.Printf("[TableAssigner] 玩家 %d 和 %d 同IP (%s)，避免同桌", 
				player.PlayerID, existing.PlayerID, player.IP)
			return false
		}

		// 检查同设备
		if ta.config.AvoidSameDevice && player.DeviceID != "" && existing.DeviceID == player.DeviceID {
			log.Printf("[TableAssigner] 玩家 %d 和 %d 同设备 (%s)，避免同桌", 
				player.PlayerID, existing.PlayerID, player.DeviceID)
			return false
		}
	}

	return true
}

// mergeRobots 合并机器人到桌子中
func (ta *TableAssigner) mergeRobots(tables [][]*PlayerConnectionInfo, robots []*PlayerConnectionInfo) [][]*PlayerConnectionInfo {
	if len(tables) == 0 {
		// 如果没有真人玩家，直接为机器人创建桌子
		return ta.assignRobotsOnly(robots)
	}

	// 先填充不满的桌子
	robotIndex := 0
	for i := range tables {
		for len(tables[i]) < 3 && robotIndex < len(robots) {
			tables[i] = append(tables[i], robots[robotIndex])
			robotIndex++
		}
	}

	// 如果还有多余的机器人，创建新桌子
	for robotIndex < len(robots) {
		newTable := make([]*PlayerConnectionInfo, 0, 3)
		for len(newTable) < 3 && robotIndex < len(robots) {
			newTable = append(newTable, robots[robotIndex])
			robotIndex++
		}
		tables = append(tables, newTable)
	}

	return tables
}

// assignRobotsOnly 只有机器人时分配桌子
func (ta *TableAssigner) assignRobotsOnly(robots []*PlayerConnectionInfo) [][]*PlayerConnectionInfo {
	tableCount := (len(robots) + 2) / 3
	tables := make([][]*PlayerConnectionInfo, tableCount)

	for i := range tables {
		start := i * 3
		end := start + 3
		if end > len(robots) {
			end = len(robots)
		}
		tables[i] = robots[start:end]
	}

	return tables
}

// validateAssignment 验证分配结果
func (ta *TableAssigner) validateAssignment(tables [][]*PlayerConnectionInfo) {
	totalPlayers := 0
	for i, table := range tables {
		totalPlayers += len(table)
		
		// 检查是否有违反同IP/设备规则的情况
		if ta.config.AvoidSameIP || ta.config.AvoidSameDevice {
			for j, p1 := range table {
				for k, p2 := range table {
					if j >= k {
						continue
					}
					
					// 检查同IP
					if ta.config.AvoidSameIP && p1.IP != "" && p1.IP == p2.IP && !p1.IsRobot && !p2.IsRobot {
						log.Printf("[TableAssigner] ⚠️ 桌 %d 存在同IP真人玩家: %d 和 %d (IP: %s)",
							i+1, p1.PlayerID, p2.PlayerID, p1.IP)
					}
					
					// 检查同设备
					if ta.config.AvoidSameDevice && p1.DeviceID != "" && p1.DeviceID == p2.DeviceID && !p1.IsRobot && !p2.IsRobot {
						log.Printf("[TableAssigner] ⚠️ 桌 %d 存在同设备真人玩家: %d 和 %d (Device: %s)",
							i+1, p1.PlayerID, p2.PlayerID, p1.DeviceID)
					}
				}
			}
		}
		
		log.Printf("[TableAssigner] 桌 %d: %d 人", i+1, len(table))
	}

	log.Printf("[TableAssigner] 分配完成: 总桌数=%d, 总人数=%d", len(tables), totalPlayers)
}

// =============================================
// 辅助函数
// =============================================

// GetPlayerConnectionInfo 从数据库获取玩家连接信息
func GetPlayerConnectionInfo(playerIDs []uint64) ([]*PlayerConnectionInfo, error) {
	if len(playerIDs) == 0 {
		return nil, nil
	}

	// 获取玩家信息
	var players []database.Player
	if err := database.DB().Where("id IN ?", playerIDs).Find(&players).Error; err != nil {
		return nil, err
	}

	// 获取用户账户信息（包含IP和设备ID）
	var accounts []database.UserAccount
	if err := database.DB().Where("player_id IN ?", playerIDs).Find(&accounts).Error; err != nil {
		log.Printf("[TableAssigner] 获取用户账户信息失败: %v", err)
		// 不返回错误，继续处理
	}

	// 构建账户映射
	accountMap := make(map[uint64]*database.UserAccount)
	for i := range accounts {
		accountMap[accounts[i].PlayerID] = &accounts[i]
	}

	// 构建结果
	result := make([]*PlayerConnectionInfo, 0, len(players))
	for _, player := range players {
		info := &PlayerConnectionInfo{
			PlayerID: player.ID,
			IsRobot:  player.PlayerType == database.PlayerTypeRobot,
		}

		// 从账户信息获取IP和设备ID
		if account, ok := accountMap[player.ID]; ok {
			info.IP = account.LastLoginIP
			info.DeviceID = account.DeviceID
		}

		result = append(result, info)
	}

	return result, nil
}

// AssignPlayersToTables 分配玩家到桌子（简化接口）
// 使用默认配置，返回每桌的玩家ID列表
func AssignPlayersToTables(playerIDs []uint64, avoidSameIP, avoidSameDevice bool) ([][]uint64, error) {
	// 获取玩家连接信息
	connectionInfos, err := GetPlayerConnectionInfo(playerIDs)
	if err != nil {
		return nil, err
	}

	// 创建分配器
	config := &TableAssignmentConfig{
		AvoidSameIP:     avoidSameIP,
		AvoidSameDevice: avoidSameDevice,
		MaxRetryCount:   100,
	}
	assigner := NewTableAssigner(config)

	// 执行分配
	tables := assigner.AssignTables(connectionInfos)

	// 转换为玩家ID列表
	result := make([][]uint64, len(tables))
	for i, table := range tables {
		result[i] = make([]uint64, len(table))
		for j, player := range table {
			result[i][j] = player.PlayerID
		}
	}

	return result, nil
}
