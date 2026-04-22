package initialize

import (
        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
)

func bizModel() error {
        db := global.GVA_DB
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
        )
        if err != nil {
                return err
        }
        return nil
}
