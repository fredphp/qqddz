package api

import (
        "context"
        "encoding/json"
        "log"
        "net/http"
)

// Redis缓存键（与admin后台系统保持一致）
const (
        RedisCacheKeyAdConfig = "ddz:ad_config"
)

// AdConfigResponse 广告配置响应（用于API返回）
type AdConfigResponse struct {
        Enabled              bool     `json:"enabled"`
        NormalRewardGold     int      `json:"normal_reward_gold"`     // 普通场奖励豆子数量
        NormalDailyMaxCount  int      `json:"normal_daily_max_count"` // 普通场每日最大观看次数
        ArenaRewardCoins     int      `json:"arena_reward_coins"`     // 竞技场奖励竞技币数量
        ArenaDailyMaxCount   int      `json:"arena_daily_max_count"`  // 竞技场每日最大观看次数
        CooldownSeconds      int      `json:"cooldown_seconds"`       // 广告冷却时间（秒）
        SupportedSdks        []string `json:"supported_sdks"`         // 支持的广告SDK列表
        PrimarySdk           string   `json:"primary_sdk"`            // 默认优先SDK
        CsjAppId             string   `json:"csj_app_id"`             // 穿山甲AppId
        CsjRewardedVideoAdId string   `json:"csj_rewarded_video_ad_id"`
        YlhAppId             string   `json:"ylh_app_id"` // 优量汇AppId
        YlhRewardedVideoAdId string   `json:"ylh_rewarded_video_ad_id"`
        KsAppId              string   `json:"ks_app_id"` // 快手AppId
        KsRewardedVideoAdId  string   `json:"ks_rewarded_video_ad_id"`
        BdAppId              string   `json:"bd_app_id"` // 百度AppId
        BdRewardedVideoAdId  string   `json:"bd_rewarded_video_ad_id"`
}

// AdConfigHandler 广告配置处理器
type AdConfigHandler struct {
        redis RedisClient // Redis客户端接口
}

// NewAdConfigHandler 创建广告配置处理器
func NewAdConfigHandler() *AdConfigHandler {
        return &AdConfigHandler{}
}

// SetRedis 设置Redis客户端
func (h *AdConfigHandler) SetRedis(client RedisClient) {
        h.redis = client
}

// GetAdConfig 获取广告配置（从Redis获取，永不过期）
func (h *AdConfigHandler) GetAdConfig(w http.ResponseWriter, r *http.Request) {
        // 1. 尝试从Redis获取配置
        if h.redis != nil {
                ctx := context.Background()
                cached, err := h.redis.Get(ctx, RedisCacheKeyAdConfig)
                if err == nil && cached != "" {
                        var config AdConfigResponse
                        if jsonErr := json.Unmarshal([]byte(cached), &config); jsonErr == nil {
                                log.Println("✅ 从Redis获取广告配置")
                                writeJSONSuccess(w, config)
                                return
                        }
                }
        }

        // 2. Redis中没有配置，返回默认配置
        log.Println("⚠️ Redis中没有广告配置，返回默认配置")
        defaultConfig := h.getDefaultAdConfig()
        writeJSONSuccess(w, defaultConfig)
}

// getDefaultAdConfig 获取默认广告配置
func (h *AdConfigHandler) getDefaultAdConfig() AdConfigResponse {
        return AdConfigResponse{
                Enabled:             false,
                NormalRewardGold:    5000,
                NormalDailyMaxCount: 10,
                ArenaRewardCoins:    5000,
                ArenaDailyMaxCount:  10,
                CooldownSeconds:     30,
                SupportedSdks:       []string{},
                PrimarySdk:          "",
        }
}

// RefreshCache 刷新广告配置缓存接口（内部调用，供admin后台调用）
func (h *AdConfigHandler) RefreshCache(w http.ResponseWriter, r *http.Request) {
        // 只允许 POST 方法
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        // 清除缓存（下次获取时会重新从admin后台同步）
        if h.redis != nil {
                ctx := context.Background()
                h.redis.Del(ctx, RedisCacheKeyAdConfig)
                log.Println("✅ 广告配置缓存已清除")
        }

        writeJSONSuccess(w, map[string]string{
                "message": "广告配置缓存已刷新",
        })
}

// SyncAdConfig 同步广告配置接口（供admin后台调用，直接写入Redis）
func (h *AdConfigHandler) SyncAdConfig(w http.ResponseWriter, r *http.Request) {
        // 只允许 POST 方法
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        // 解析请求体
        var config AdConfigResponse
        if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
                writeJSONError(w, http.StatusBadRequest, "无效的请求体: "+err.Error())
                return
        }

        // 写入Redis（永不过期）
        if h.redis != nil {
                ctx := context.Background()
                data, err := json.Marshal(config)
                if err != nil {
                        writeJSONError(w, http.StatusInternalServerError, "序列化配置失败")
                        return
                }

                // duration=0 表示永不过期
                if err := h.redis.Set(ctx, RedisCacheKeyAdConfig, string(data), 0); err != nil {
                        writeJSONError(w, http.StatusInternalServerError, "写入Redis失败")
                        return
                }

                log.Println("✅ 广告配置已同步到Redis")
        }

        writeJSONSuccess(w, map[string]string{
                "message": "广告配置同步成功",
        })
}
