package initialize

import (
        "fmt"
        "github.com/flipped-aurora/gin-vue-admin/server/task"

        "github.com/robfig/cron/v3"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
)

func Timer() {
        go func() {
                var option []cron.Option
                option = append(option, cron.WithSeconds())
                // 清理DB定时任务
                _, err := global.GVA_Timer.AddTaskByFunc("ClearDB", "@daily", func() {
                        err := task.ClearTable(global.GVA_DB) // 定时任务方法定在task文件包中
                        if err != nil {
                                fmt.Println("timer error:", err)
                        }
                }, "定时清理数据库【日志，黑名单】内容", option...)
                if err != nil {
                        fmt.Println("add timer error:", err)
                }

                // 🔧【新增】清理僵尸房间定时任务 - 每5分钟执行一次
                // 将长时间处于"游戏中"状态但实际已无活动的房间更新为"已关闭"
                _, err = global.GVA_Timer.AddTaskByFunc("CleanupStaleRooms", "*/5 * * * *", func() {
                        task.CleanupStaleRoomsWithLog()
                }, "定时清理僵尸房间（游戏中状态超过30分钟无更新）", option...)
                if err != nil {
                        fmt.Println("add CleanupStaleRooms timer error:", err)
                }

                // 其他定时任务定在这里 参考上方使用方法

                //_, err := global.GVA_Timer.AddTaskByFunc("定时任务标识", "corn表达式", func() {
                //      具体执行内容...
                //  ......
                //}, option...)
                //if err != nil {
                //      fmt.Println("add timer error:", err)
                //}
        }()
}
