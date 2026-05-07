package config

// Ad 广告配置
type Ad struct {
        // 是否启用广告
        Enabled bool `mapstructure:"enabled" json:"enabled" yaml:"enabled"`

        // ===== 普通场广告奖励配置 =====
        // 普通场奖励豆子数量
        NormalRewardGold int `mapstructure:"normal-reward-gold" json:"normal-reward-gold" yaml:"normal-reward-gold"`
        // 普通场每日最大观看次数
        NormalDailyMaxCount int `mapstructure:"normal-daily-max-count" json:"normal-daily-max-count" yaml:"normal-daily-max-count"`

        // ===== 竞技场广告奖励配置 =====
        // 竞技场奖励竞技币数量
        ArenaRewardCoins int `mapstructure:"arena-reward-coins" json:"arena-reward-coins" yaml:"arena-reward-coins"`
        // 竞技场每日最大观看次数
        ArenaDailyMaxCount int `mapstructure:"arena-daily-max-count" json:"arena-daily-max-count" yaml:"arena-daily-max-count"`

        // ===== 通用配置 =====
        // 广告冷却时间（秒）
        CooldownSeconds int `mapstructure:"cooldown-seconds" json:"cooldown-seconds" yaml:"cooldown-seconds"`

        // ===== 穿山甲广告配置 =====
        // 穿山甲广告位ID
        CsjAppId string `mapstructure:"csj-app-id" json:"csj-app-id" yaml:"csj-app-id"`
        // 穿山甲激励视频广告位ID
        CsjRewardedVideoAdId string `mapstructure:"csj-rewarded-video-ad-id" json:"csj-rewarded-video-ad-id" yaml:"csj-rewarded-video-ad-id"`

        // ===== 优量汇广告配置 =====
        // 优量汇AppId
        YlhAppId string `mapstructure:"ylh-app-id" json:"ylh-app-id" yaml:"ylh-app-id"`
        // 优量汇激励视频广告位ID
        YlhRewardedVideoAdId string `mapstructure:"ylh-rewarded-video-ad-id" json:"ylh-rewarded-video-ad-id" yaml:"ylh-rewarded-video-ad-id"`

        // ===== 快手广告配置 =====
        // 快手AppId
        KsAppId string `mapstructure:"ks-app-id" json:"ks-app-id" yaml:"ks-app-id"`
        // 快手激励视频广告位ID
        KsRewardedVideoAdId string `mapstructure:"ks-rewarded-video-ad-id" json:"ks-rewarded-video-ad-id" yaml:"ks-rewarded-video-ad-id"`

        // ===== 百度广告配置 =====
        // 百度AppId
        BdAppId string `mapstructure:"bd-app-id" json:"bd-app-id" yaml:"bd-app-id"`
        // 百度激励视频广告位ID
        BdRewardedVideoAdId string `mapstructure:"bd-rewarded-video-ad-id" json:"bd-rewarded-video-ad-id" yaml:"bd-rewarded-video-ad-id"`

        // ===== 通用配置 =====
        // 支持的广告SDK列表（多选：csj穿山甲, ylh优量汇, ks快手, bd百度）
        SupportedSdks []string `mapstructure:"supported-sdks" json:"supported-sdks" yaml:"supported-sdks"`
        // 默认优先使用的SDK
        PrimarySdk string `mapstructure:"primary-sdk" json:"primary-sdk" yaml:"primary-sdk"`
}
