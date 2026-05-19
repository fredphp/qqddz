package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// DDZRoomSublevelSearch 子分区搜索请求
type DDZRoomSublevelSearch struct {
	request.PageInfo
	RoomConfigID *uint  `json:"roomConfigId" form:"roomConfigId"`   // 房间配置ID
	SublevelName string `json:"sublevelName" form:"sublevelName"`   // 子分区名称
	BaseScore    *int   `json:"baseScore" form:"baseScore"`         // 底分
	Status       *int   `json:"status" form:"status"`               // 状态
}

// DDZRoomSublevelCreate 创建子分区请求
type DDZRoomSublevelCreate struct {
	RoomConfigID   uint   `json:"roomConfigId" binding:"required"`   // 房间配置ID（必填）
	SublevelName   string `json:"sublevelName" binding:"required"`   // 子分区名称（必填）
	BaseScore      int    `json:"baseScore" binding:"required,min=1"` // 底分（必填，最小1）
	MinGold        int64  `json:"minGold"`                            // 最低入场金币
	MaxGold        int64  `json:"maxGold"`                            // 最高入场金币
	UpgradeScore   int64  `json:"upgradeScore"`                       // 升级所需分数（不填自动计算50倍基础分）
	NextSublevelID uint   `json:"nextSublevelId"`                     // 下一子分区ID
	PrevSublevelID uint   `json:"prevSublevelId"`                     // 上一子分区ID
	BgImageNum     int    `json:"bgImageNum"`                         // 背景图编号
	BotEnabled     int    `json:"botEnabled"`                         // 是否允许机器人
	BotCount       int    `json:"botCount"`                           // 机器人数量
	TimeoutSeconds int    `json:"timeoutSeconds"`                     // 超时时间
	Status         int    `json:"status"`                             // 状态
	SortOrder      int    `json:"sortOrder"`                          // 排序权重
	Description    string `json:"description"`                        // 描述
}

// DDZRoomSublevelUpdate 更新子分区请求
type DDZRoomSublevelUpdate struct {
	ID             uint   `json:"ID" binding:"required"`             // 子分区ID（必填）
	RoomConfigID   uint   `json:"roomConfigId"`                      // 房间配置ID
	SublevelName   string `json:"sublevelName"`                      // 子分区名称
	BaseScore      int    `json:"baseScore"`                         // 底分
	MinGold        int64  `json:"minGold"`                           // 最低入场金币
	MaxGold        int64  `json:"maxGold"`                           // 最高入场金币
	UpgradeScore   int64  `json:"upgradeScore"`                      // 升级所需分数
	NextSublevelID uint   `json:"nextSublevelId"`                    // 下一子分区ID
	PrevSublevelID uint   `json:"prevSublevelId"`                    // 上一子分区ID
	BgImageNum     int    `json:"bgImageNum"`                        // 背景图编号
	BotEnabled     int    `json:"botEnabled"`                        // 是否允许机器人
	BotCount       int    `json:"botCount"`                          // 机器人数量
	TimeoutSeconds int    `json:"timeoutSeconds"`                    // 超时时间
	Status         int    `json:"status"`                            // 状态
	SortOrder      int    `json:"sortOrder"`                         // 排序权重
	Description    string `json:"description"`                       // 描述
}

// DDZRoomSublevelByID 根据ID获取子分区请求
type DDZRoomSublevelByID struct {
	ID uint `json:"ID" form:"ID" binding:"required"` // 子分区ID
}

// DDZRoomSublevelByRoomConfig 根据房间配置ID获取子分区列表
type DDZRoomSublevelByRoomConfig struct {
	RoomConfigID uint `json:"roomConfigId" form:"roomConfigId" binding:"required"` // 房间配置ID
}
