package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// ==================== 游戏房间配置（ddz_room_config 表）====================

// DDZGameRoomConfigSearch 游戏房间配置搜索请求
type DDZGameRoomConfigSearch struct {
        request.PageInfo
        RoomName     string `json:"roomName" form:"roomName"`
        RoomType     *int   `json:"roomType" form:"roomType"`
        RoomCategory *int   `json:"roomCategory" form:"roomCategory"`
        Status       *int   `json:"status" form:"status"`
}

// DDZGameRoomConfigCreate 创建游戏房间配置请求
type DDZGameRoomConfigCreate struct {
        RoomName       string  `json:"roomName" binding:"required"`
        RoomType       int     `json:"roomType" binding:"required"`
        RoomCategory   int     `json:"roomCategory"`     // 房间分类:1-普通场,2-竞技场
        BaseScore      int     `json:"baseScore" binding:"required"`
        Multiplier     int     `json:"multiplier"`
        MinGold        int64   `json:"minGold"`
        MaxGold        int64   `json:"maxGold"`
        MinArenaCoin   int64   `json:"minArenaCoin"`     // 最低入场竞技币
        MaxArenaCoin   int64   `json:"maxArenaCoin"`     // 最高入场竞技币
        BgImageNum     int     `json:"bgImageNum"`       // 背景图编号
        BotEnabled     int     `json:"botEnabled"`
        BotCount       int     `json:"botCount"`
        FeeRate        float64 `json:"feeRate"`
        MaxRound       int     `json:"maxRound"`
        TimeoutSeconds int     `json:"timeoutSeconds"`
        Status         int     `json:"status"`
        SortOrder      int     `json:"sortOrder"`
        Description    string  `json:"description"`
}

// DDZGameRoomConfigUpdate 更新游戏房间配置请求
type DDZGameRoomConfigUpdate struct {
        ID             uint    `json:"ID" binding:"required"`
        RoomName       string  `json:"roomName"`
        RoomType       int     `json:"roomType"`
        RoomCategory   int     `json:"roomCategory"`     // 房间分类:1-普通场,2-竞技场
        BaseScore      int     `json:"baseScore"`
        Multiplier     int     `json:"multiplier"`
        MinGold        int64   `json:"minGold"`
        MaxGold        int64   `json:"maxGold"`
        MinArenaCoin   int64   `json:"minArenaCoin"`     // 最低入场竞技币
        MaxArenaCoin   int64   `json:"maxArenaCoin"`     // 最高入场竞技币
        BgImageNum     int     `json:"bgImageNum"`       // 背景图编号
        BotEnabled     int     `json:"botEnabled"`
        BotCount       int     `json:"botCount"`
        FeeRate        float64 `json:"feeRate"`
        MaxRound       int     `json:"maxRound"`
        TimeoutSeconds int     `json:"timeoutSeconds"`
        Status         int     `json:"status"`
        SortOrder      int     `json:"sortOrder"`
        Description    string  `json:"description"`
}

// ==================== 游戏房间实例（ddz_rooms 表）====================

// DDZRoomSearch 游戏房间实例搜索请求
type DDZRoomSearch struct {
        request.PageInfo
        RoomID       string `json:"roomId" form:"roomId"`
        RoomName     string `json:"roomName" form:"roomName"`
        RoomType     *int   `json:"roomType" form:"roomType"`
        RoomCategory *int   `json:"roomCategory" form:"roomCategory"`
        Status       *int   `json:"status" form:"status"`
        CreatorID    string `json:"creatorId" form:"creatorId"`
}

// ==================== 游戏配置（ddz_game_configs 表）====================

// DDZGameConfigSearch 游戏配置搜索请求
type DDZGameConfigSearch struct {
        request.PageInfo
        ConfigKey  string `json:"configKey" form:"configKey"`
        ConfigType string `json:"configType" form:"configType"`
}

// DDZGameConfigUpdate 更新游戏配置请求
type DDZGameConfigUpdate struct {
        ID          uint   `json:"ID" binding:"required"`
        ConfigKey   string `json:"configKey"`
        ConfigValue string `json:"configValue"`
        ConfigType  string `json:"configType"`
        Description string `json:"description"`
        Status      int    `json:"status"`
}
