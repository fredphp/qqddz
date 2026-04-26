package api

import (
        "context"
        "database/sql"
        "encoding/json"
        "log"
        "net/http"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/cache"
        "github.com/palemoky/fight-the-landlord/internal/game/database"

        _ "github.com/go-sql-driver/mysql"
)

// 缓存键
const (
        CacheKeyRoomConfigList   = "room_config:list"
        CacheKeyRoomConfigPrefix = "room_config:type:"
        // Redis缓存键（与admin系统保持一致）
        RedisCacheKeyRoomConfigList = "ddz:room_config:list"
)

// RoomConfigResponse 房间配置响应（用于API返回）
type RoomConfigResponse struct {
        ID          uint64 `json:"id"`
        RoomName    string `json:"room_name"`
        RoomType    uint8  `json:"room_type"`
        BaseScore   int    `json:"base_score"`
        Multiplier  int    `json:"multiplier"`
        MinGold     int64  `json:"min_gold"`
        MaxGold     int64  `json:"max_gold"`
        EntryGold   int64  `json:"entry_gold"` // 进入房间需要的豆子/金币
        BgImageNum  int    `json:"bg_image_num"` // 背景图编号（前端根据此编号匹配 btn_happy_{编号}.png）
        Description string `json:"description"`
        Status      uint8  `json:"status"`
        SortOrder   int    `json:"sort_order"`
}

// RoomConfigHandler 房间配置处理器
type RoomConfigHandler struct {
        db       *sql.DB
        cache    *cache.Cache
        redis    RedisClient // Redis客户端接口
}

// RedisClient Redis客户端接口
type RedisClient interface {
        Get(ctx context.Context, key string) (string, error)
        Set(ctx context.Context, key string, value string, expiration time.Duration) error
        Del(ctx context.Context, keys ...string) error
}

// NewRoomConfigHandler 创建房间配置处理器
func NewRoomConfigHandler(config *DBConfig) (*RoomConfigHandler, error) {
        if config == nil {
                return &RoomConfigHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        dsn := buildDSN(config)

        db, err := sql.Open("mysql", dsn)
        if err != nil {
                log.Printf("⚠️ 连接数据库失败，使用无数据库模式: %v", err)
                return &RoomConfigHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        // 测试连接
        if err := db.Ping(); err != nil {
                log.Printf("⚠️ 数据库连接测试失败，使用无数据库模式: %v", err)
                db.Close()
                return &RoomConfigHandler{
                        db:    nil,
                        cache: cache.GetCache(),
                }, nil
        }

        // 设置连接池
        db.SetMaxOpenConns(10)
        db.SetMaxIdleConns(5)
        db.SetConnMaxLifetime(time.Hour)

        return &RoomConfigHandler{
                db:    db,
                cache: cache.GetCache(),
        }, nil
}

// SetRedis 设置Redis客户端
func (h *RoomConfigHandler) SetRedis(client RedisClient) {
        h.redis = client
}

// buildDSN 构建数据库连接字符串
func buildDSN(config *DBConfig) string {
        return config.User + ":" + config.Password + "@tcp(" + config.Host + ":" + itoa(int(config.Port)) + ")/" + config.Database + "?charset=utf8mb4&parseTime=True&loc=Local"
}

// itoa 整数转字符串
func itoa(n int) string {
        if n == 0 {
                return "0"
        }
        var negative bool
        if n < 0 {
                negative = true
                n = -n
        }
        var digits []byte
        for n > 0 {
                digits = append([]byte{byte('0' + n%10)}, digits...)
                n /= 10
        }
        if negative {
                digits = append([]byte{'-'}, digits...)
        }
        return string(digits)
}

// Close 关闭数据库连接
func (h *RoomConfigHandler) Close() error {
        if h.db != nil {
                return h.db.Close()
        }
        return nil
}

// ClearCache 清除房间配置相关缓存
func (h *RoomConfigHandler) ClearCache() {
        h.cache.Delete(CacheKeyRoomConfigList)
        h.cache.DeleteByPrefix(CacheKeyRoomConfigPrefix)
        
        // 同时清除Redis缓存
        if h.redis != nil {
                ctx := context.Background()
                h.redis.Del(ctx, RedisCacheKeyRoomConfigList)
                log.Println("✅ Redis房间配置缓存已清除")
        }
}

// GetActiveRoomConfigs 获取所有启用的房间配置（带缓存）
func (h *RoomConfigHandler) GetActiveRoomConfigs(w http.ResponseWriter, r *http.Request) {
        // 1. 尝试从Redis获取缓存
        if h.redis != nil {
                ctx := context.Background()
                cached, err := h.redis.Get(ctx, RedisCacheKeyRoomConfigList)
                if err == nil && cached != "" {
                        var configs []RoomConfigResponse
                        if jsonErr := json.Unmarshal([]byte(cached), &configs); jsonErr == nil {
                                writeJSONSuccess(w, configs)
                                return
                        }
                }
        }
        
        // 2. 尝试从本地缓存获取
        if value, exists := h.cache.Get(CacheKeyRoomConfigList); exists {
                if configs, ok := value.([]RoomConfigResponse); ok {
                        writeJSONSuccess(w, configs)
                        return
                }
        }

        // 3. 优先使用 GORM 数据库实例
        if database.GetInstance().IsConnected() {
                configs, err := h.getRoomConfigsFromGORM()
                if err != nil {
                        log.Printf("⚠️ 从GORM获取房间配置失败: %v", err)
                        // 如果 GORM 失败，尝试使用原始 SQL
                        if h.db != nil {
                                configs, err = h.getRoomConfigsFromSQL()
                                if err != nil {
                                        writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                                        return
                                }
                        } else {
                                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                                return
                        }
                }
                // 缓存结果（永不过期，只有后台管理更新时才刷新）
                h.cache.Set(CacheKeyRoomConfigList, configs, 0)
                h.cacheToRedis(configs)
                writeJSONSuccess(w, configs)
                return
        }

        // 4. 使用原始 SQL 连接
        if h.db == nil {
                // 没有数据库时返回默认数据
                defaultConfigs := h.getDefaultRoomConfigs()
                writeJSONSuccess(w, defaultConfigs)
                return
        }

        configs, err := h.getRoomConfigsFromSQL()
        if err != nil {
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }

        // 缓存结果（永不过期，只有后台管理更新时才刷新）
        h.cache.Set(CacheKeyRoomConfigList, configs, 0)
        h.cacheToRedis(configs)

        writeJSONSuccess(w, configs)
}

// cacheToRedis 缓存到Redis
func (h *RoomConfigHandler) cacheToRedis(configs []RoomConfigResponse) {
        if h.redis == nil || len(configs) == 0 {
                return
        }
        
        ctx := context.Background()
        if data, err := json.Marshal(configs); err == nil {
                h.redis.Set(ctx, RedisCacheKeyRoomConfigList, string(data), 24*time.Hour)
        }
}

// getRoomConfigsFromGORM 从 GORM 获取房间配置
func (h *RoomConfigHandler) getRoomConfigsFromGORM() ([]RoomConfigResponse, error) {
        roomConfigs, err := database.GetActiveRoomConfigs()
        if err != nil {
                return nil, err
        }

        var configs []RoomConfigResponse
        for _, rc := range roomConfigs {
                // 背景图编号默认使用房间类型（2-6）
                bgImageNum := int(rc.RoomType)
                if bgImageNum < 2 || bgImageNum > 6 {
                        bgImageNum = 2 // 默认编号
                }
                
                configs = append(configs, RoomConfigResponse{
                        ID:          rc.ID,
                        RoomName:    rc.RoomName,
                        RoomType:    rc.RoomType,
                        BaseScore:   rc.BaseScore,
                        Multiplier:  rc.Multiplier,
                        MinGold:     rc.MinGold,
                        MaxGold:     rc.MaxGold,
                        EntryGold:   rc.MinGold, // 入场豆子等于最低入场金币
                        BgImageNum:  bgImageNum, // 背景图编号
                        Description: rc.Description,
                        Status:      rc.Status,
                        SortOrder:   rc.SortOrder,
                })
        }

        if configs == nil {
                configs = []RoomConfigResponse{}
        }

        return configs, nil
}

// getRoomConfigsFromSQL 从原始 SQL 获取房间配置
func (h *RoomConfigHandler) getRoomConfigsFromSQL() ([]RoomConfigResponse, error) {
        query := `SELECT id, room_name, room_type, base_score, multiplier, min_gold, max_gold, 
                  description, status, sort_order
                  FROM ddz_room_config
                  WHERE status = 1 AND deleted_at IS NULL
                  ORDER BY sort_order ASC`

        rows, err := h.db.Query(query)
        if err != nil {
                return nil, err
        }
        defer rows.Close()

        var configs []RoomConfigResponse
        for rows.Next() {
                var config RoomConfigResponse
                err := rows.Scan(
                        &config.ID,
                        &config.RoomName,
                        &config.RoomType,
                        &config.BaseScore,
                        &config.Multiplier,
                        &config.MinGold,
                        &config.MaxGold,
                        &config.Description,
                        &config.Status,
                        &config.SortOrder,
                )
                if err != nil {
                        return nil, err
                }
                // 入场豆子等于最低入场金币
                config.EntryGold = config.MinGold
                // 背景图编号默认使用房间类型
                config.BgImageNum = int(config.RoomType)
                if config.BgImageNum < 2 || config.BgImageNum > 6 {
                        config.BgImageNum = 2
                }
                configs = append(configs, config)
        }

        if configs == nil {
                configs = []RoomConfigResponse{}
        }

        return configs, nil
}

// getDefaultRoomConfigs 获取默认房间配置（无数据库时使用）
func (h *RoomConfigHandler) getDefaultRoomConfigs() []RoomConfigResponse {
        return []RoomConfigResponse{
                {
                        ID:          2,
                        RoomName:    "中级房",
                        RoomType:    2,
                        BaseScore:   2,
                        Multiplier:  1,
                        MinGold:     50000,
                        MaxGold:     200000,
                        EntryGold:   50000,
                        BgImageNum:  2, // btn_happy_2.png
                        Description: "底分2,适合有一定经验的玩家",
                        Status:      1,
                        SortOrder:   1,
                },
                {
                        ID:          3,
                        RoomName:    "高级房",
                        RoomType:    3,
                        BaseScore:   5,
                        Multiplier:  2,
                        MinGold:     200000,
                        MaxGold:     1000000,
                        EntryGold:   200000,
                        BgImageNum:  3, // btn_happy_3.png
                        Description: "底分5,倍数2,高手对决",
                        Status:      1,
                        SortOrder:   2,
                },
                {
                        ID:          4,
                        RoomName:    "大师房",
                        RoomType:    4,
                        BaseScore:   10,
                        Multiplier:  3,
                        MinGold:     1000000,
                        MaxGold:     5000000,
                        EntryGold:   1000000,
                        BgImageNum:  4, // btn_happy_4.png
                        Description: "底分10,倍数3,大师专属",
                        Status:      1,
                        SortOrder:   3,
                },
                {
                        ID:          5,
                        RoomName:    "至尊房",
                        RoomType:    5,
                        BaseScore:   20,
                        Multiplier:  5,
                        MinGold:     5000000,
                        MaxGold:     0,
                        EntryGold:   5000000,
                        BgImageNum:  5, // btn_happy_5.png
                        Description: "底分20,倍数5,至尊玩家专属",
                        Status:      1,
                        SortOrder:   4,
                },
        }
}

// GetRoomConfigByType 根据类型获取房间配置（带缓存）
func (h *RoomConfigHandler) GetRoomConfigByType(w http.ResponseWriter, r *http.Request) {
        roomType := r.URL.Query().Get("room_type")
        if roomType == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少room_type参数")
                return
        }

        cacheKey := CacheKeyRoomConfigPrefix + roomType

        // 尝试从缓存获取
        if value, exists := h.cache.Get(cacheKey); exists {
                if config, ok := value.(*RoomConfigResponse); ok {
                        writeJSONSuccess(w, config)
                        return
                }
        }

        // 优先使用 GORM
        if database.GetInstance().IsConnected() {
                var roomTypeUint uint8
                for i, c := range roomType {
                        if c >= '0' && c <= '9' {
                                roomTypeUint = roomTypeUint*10 + uint8(c-'0')
                                if i > 0 {
                                        break
                                }
                        }
                }

                rc, err := database.GetRoomConfigByType(roomTypeUint)
                if err != nil {
                        if err == sql.ErrNoRows {
                                writeJSONError(w, http.StatusNotFound, "房间配置不存在")
                                return
                        }
                        writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                        return
                }

                // 背景图编号
                bgImageNum := int(rc.RoomType)
                if bgImageNum < 2 || bgImageNum > 6 {
                        bgImageNum = 2
                }

                config := &RoomConfigResponse{
                        ID:          rc.ID,
                        RoomName:    rc.RoomName,
                        RoomType:    rc.RoomType,
                        BaseScore:   rc.BaseScore,
                        Multiplier:  rc.Multiplier,
                        MinGold:     rc.MinGold,
                        MaxGold:     rc.MaxGold,
                        EntryGold:   rc.MinGold,
                        BgImageNum:  bgImageNum,
                        Description: rc.Description,
                        Status:      rc.Status,
                        SortOrder:   rc.SortOrder,
                }

                // 缓存结果
                h.cache.Set(cacheKey, config, 0)
                writeJSONSuccess(w, config)
                return
        }

        // 使用原始 SQL
        if h.db == nil {
                writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
                return
        }

        var config RoomConfigResponse
        query := `SELECT id, room_name, room_type, base_score, multiplier, min_gold, max_gold, 
                  description, status, sort_order
                  FROM ddz_room_config
                  WHERE room_type = ? AND status = 1 AND deleted_at IS NULL`

        err := h.db.QueryRow(query, roomType).Scan(
                &config.ID,
                &config.RoomName,
                &config.RoomType,
                &config.BaseScore,
                &config.Multiplier,
                &config.MinGold,
                &config.MaxGold,
                &config.Description,
                &config.Status,
                &config.SortOrder,
        )

        if err != nil {
                if err == sql.ErrNoRows {
                        writeJSONError(w, http.StatusNotFound, "房间配置不存在")
                        return
                }
                writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
                return
        }

        config.EntryGold = config.MinGold
        config.BgImageNum = int(config.RoomType)
        if config.BgImageNum < 2 || config.BgImageNum > 6 {
                config.BgImageNum = 2
        }

        // 缓存结果
        h.cache.Set(cacheKey, &config, 0)

        writeJSONSuccess(w, config)
}

// RefreshCache 刷新缓存接口（内部调用，供admin后台调用）
func (h *RoomConfigHandler) RefreshCache(w http.ResponseWriter, r *http.Request) {
        // 只允许 POST 方法
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        // 清除缓存
        h.ClearCache()

        log.Println("✅ 房间配置缓存已刷新")

        writeJSONSuccess(w, map[string]string{
                "message": "房间配置缓存已刷新",
        })
}

// CheckPlayerEntry 检查玩家是否可以进入房间
func (h *RoomConfigHandler) CheckPlayerEntry(w http.ResponseWriter, r *http.Request) {
        playerID := r.URL.Query().Get("player_id")
        roomType := r.URL.Query().Get("room_type")

        if playerID == "" || roomType == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少参数")
                return
        }

        // 获取玩家信息
        player, err := database.GetPlayerByID(parseUint64(playerID))
        if err != nil {
                writeJSONError(w, http.StatusNotFound, "玩家不存在")
                return
        }

        // 获取房间配置
        var roomTypeUint uint8
        for _, c := range roomType {
                if c >= '0' && c <= '9' {
                        roomTypeUint = roomTypeUint*10 + uint8(c-'0')
                }
        }

        roomConfig, err := database.GetRoomConfigByType(roomTypeUint)
        if err != nil {
                writeJSONError(w, http.StatusNotFound, "房间配置不存在")
                return
        }

        // 检查是否可以进入
        canEnter, reason := player.CanEnterRoom(roomConfig)

        writeJSONSuccess(w, map[string]interface{}{
                "can_enter":   canEnter,
                "reason":      reason,
                "player_gold": player.Gold,
                "min_gold":    roomConfig.MinGold,
                "max_gold":    roomConfig.MaxGold,
                "entry_gold":  roomConfig.MinGold,
        })
}

// parseUint64 解析 uint64
func parseUint64(s string) uint64 {
        var result uint64
        for _, c := range s {
                if c >= '0' && c <= '9' {
                        result = result*10 + uint64(c-'0')
                }
        }
        return result
}
