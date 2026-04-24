package initialize

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
)

func bizModel() error {
        // 使用 ddz-game 数据库连接（配置在 config.yaml 的 db-list 中）
        db := global.GetGlobalDBByDBName("ddz-game")
        if db == nil {
                // 如果未配置 ddz-game 数据库，使用默认数据库
                db = global.GVA_DB
        }
        err := db.AutoMigrate(
                ddz.DDZPlayer{},
                ddz.DDZPlayerOnline{},
                ddz.DDZGameRecord{},
                ddz.DDZGamePlayerRecord{},
                ddz.DDZGamePlayRecord{},
                ddz.DDZDealRecord{},
                ddz.DDZPlayerStats{},
                ddz.DDZDailyStats{},
                ddz.DDZLeaderboard{},
                ddz.DDZRoomConfig{},
                ddz.DDZGameConfig{},
                ddz.DDZUserAccount{},
                ddz.DDZLoginLog{},
                ddz.DDZSmsCode{},
                // 新增游戏日志模型
                ddz.DDZBidLog{},
                ddz.DDZDealLog{},
                ddz.DDZPlayLog{},
                ddz.DDZPlayerStat{},
        )
        if err != nil {
                return err
        }
        return nil
}
