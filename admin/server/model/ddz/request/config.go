package request

import "github.com/flipped-aurora/gin-vue-admin/server/model/common/request"

// ==================== 游戏房间配置（ddz_room_config 表）====================

// DDZGameRoomConfigSearch 游戏房间配置搜索请求
type DDZGameRoomConfigSearch struct {
        request.PageInfo
        RoomName string `json:"roomName" form:"roomName"`
        RoomType *int   `json:"roomType" form:"roomType"`
        Status   *int   `json:"status" form:"status"`
}

// DDZGameRoomConfigCreate 创建游戏房间配置请求
type DDZGameRoomConfigCreate struct {
        RoomName       string  `json:"roomName" binding:"required"`
        RoomType       int     `json:"roomType" binding:"required"`
        BaseScore      int     `json:"baseScore" binding:"required"`
        Multiplier     int     `json:"multiplier"`
        MinGold        int64   `json:"minGold"`
        MaxGold        int64   `json:"maxGold"`
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
        BaseScore      int     `json:"baseScore"`
        Multiplier     int     `json:"multiplier"`
        MinGold        int64   `json:"minGold"`
        MaxGold        int64   `json:"maxGold"`
        BotEnabled     int     `json:"botEnabled"`
        BotCount       int     `json:"botCount"`
        FeeRate        float64 `json:"feeRate"`
        MaxRound       int     `json:"maxRound"`
        TimeoutSeconds int     `json:"timeoutSeconds"`
        Status         int     `json:"status"`
        SortOrder      int     `json:"sortOrder"`
        Description    string  `json:"description"`
}

// ==================== 菜单房间配置（ddz_room_configs 表）====================

// DDZRoomConfigSearch 菜单房间配置搜索请求
type DDZRoomConfigSearch struct {
        request.PageInfo
        RoomType *int `json:"roomType" form:"roomType"`
        Status   *int `json:"status" form:"status"`
}

// DDZRoomConfigCreate 创建菜单房间配置请求
type DDZRoomConfigCreate struct {
        Name        string `json:"name" binding:"required"`
        RoomType    int    `json:"roomType" binding:"required"`
        RoomLevel   int    `json:"roomLevel"`
        BaseScore   int    `json:"baseScore"`
        MinCoins    int64  `json:"minCoins"`
        MaxCoins    int64  `json:"maxCoins"`
        ServiceFee  int    `json:"serviceFee"`
        MaxMultiple int    `json:"maxMultiple"`
        Timeout     int    `json:"timeout"`
        AllowSpring int    `json:"allowSpring"`
        AllowBomb   int    `json:"allowBomb"`
        AllowRocket int    `json:"allowRocket"`
        Status      int    `json:"status"`
        Sort        int    `json:"sort"`
        Description string `json:"description"`
}

// DDZRoomConfigUpdate 更新菜单房间配置请求
type DDZRoomConfigUpdate struct {
        ID          uint   `json:"ID" binding:"required"`
        Name        string `json:"name"`
        RoomType    int    `json:"roomType"`
        RoomLevel   int    `json:"roomLevel"`
        BaseScore   int    `json:"baseScore"`
        MinCoins    int64  `json:"minCoins"`
        MaxCoins    int64  `json:"maxCoins"`
        ServiceFee  int    `json:"serviceFee"`
        MaxMultiple int    `json:"maxMultiple"`
        Timeout     int    `json:"timeout"`
        AllowSpring int    `json:"allowSpring"`
        AllowBomb   int    `json:"allowBomb"`
        AllowRocket int    `json:"allowRocket"`
        Status      int    `json:"status"`
        Sort        int    `json:"sort"`
        Description string `json:"description"`
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
