package ddz

import (
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// DDZRobotConfig 机器人AI配置表
type DDZRobotConfig struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	ConfigName  string         `gorm:"type:varchar(64);not null;comment:配置名称" json:"configName"`
	MinThinkTime int           `gorm:"type:int;not null;default:1500;comment:最小思考时间(毫秒)" json:"minThinkTime"`
	MaxThinkTime int           `gorm:"type:int;not null;default:3000;comment:最大思考时间(毫秒)" json:"maxThinkTime"`
	BombThinkTime int          `gorm:"type:int;not null;default:4000;comment:炸弹思考时间(毫秒)" json:"bombThinkTime"`
	BombProbability decimal.Decimal `gorm:"type:decimal(5,2);not null;default:0.60;comment:炸弹使用概率(0-1)" json:"bombProbability"`
	LandlordBidProbability decimal.Decimal `gorm:"type:decimal(5,2);not null;default:0.50;comment:抢地主概率(0-1)" json:"landlordBidProbability"`
	LetWinProbability decimal.Decimal `gorm:"type:decimal(5,2);not null;default:0.85;comment:决赛让牌概率(0-1)" json:"letWinProbability"`
	LetWinMinRank int          `gorm:"type:int;not null;default:3;comment:触发让牌的最小排名" json:"letWinMinRank"`
	IsDefault   int8           `gorm:"type:tinyint;not null;default:1;comment:是否默认配置:0-否,1-是" json:"isDefault"`
	Status      int8           `gorm:"type:tinyint;not null;default:1;comment:状态:0-禁用,1-启用" json:"status"`
	Description string         `gorm:"type:varchar(255);comment:配置描述" json:"description"`
	CreatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
}

// TableName 指定表名
func (DDZRobotConfig) TableName() string {
	return "ddz_robot_config"
}

// GetDefaultConfig 获取默认配置
func GetDefaultConfig() *DDZRobotConfig {
	return &DDZRobotConfig{
		ConfigName:           "默认配置",
		MinThinkTime:         1500,
		MaxThinkTime:         3000,
		BombThinkTime:        4000,
		BombProbability:      decimal.NewFromFloat(0.60),
		LandlordBidProbability: decimal.NewFromFloat(0.50),
		LetWinProbability:    decimal.NewFromFloat(0.85),
		LetWinMinRank:        3,
		IsDefault:            1,
		Status:               1,
	}
}

// EnsureDefaultConfig 确保存在默认配置
func EnsureDefaultConfig() error {
	var count int64
	if err := global.GetGlobalDBByDBName("ddz-game").Model(&DDZRobotConfig{}).Where("is_default = ?", 1).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		defaultConfig := GetDefaultConfig()
		return global.GetGlobalDBByDBName("ddz-game").Create(defaultConfig).Error
	}
	return nil
}

// GetActiveConfig 获取当前启用的配置
func GetActiveConfig() (*DDZRobotConfig, error) {
	var config DDZRobotConfig
	err := global.GetGlobalDBByDBName("ddz-game").
		Where("status = ? AND is_default = ?", 1, 1).
		First(&config).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// 如果没有找到默认配置，返回一个基础配置
			return GetDefaultConfig(), nil
		}
		return nil, err
	}
	return &config, nil
}

// SetAsDefault 将配置设置为默认
func (c *DDZRobotConfig) SetAsDefault(tx *gorm.DB) error {
	// 先清除其他默认配置
	if err := tx.Model(&DDZRobotConfig{}).Where("id != ?", c.ID).Update("is_default", 0).Error; err != nil {
		return err
	}
	// 设置当前配置为默认
	return tx.Model(&DDZRobotConfig{}).Where("id = ?", c.ID).Update("is_default", 1).Error
}
