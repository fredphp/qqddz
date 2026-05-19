package ddz

import (
        "strconv"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        "github.com/flipped-aurora/gin-vue-admin/server/service"

        "github.com/gin-gonic/gin"
        "go.uber.org/zap"
)

type DDZRoomSublevelApi struct{}

var ddzRoomSublevelService = service.ServiceGroupApp.DDZServiceGroup.DDZRoomSublevelService

// GetRoomSublevelList 获取子分区列表
// @Tags 斗地主-子分区管理
// @Summary 获取子分区列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.DDZRoomSublevelSearch true "分页参数"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取子分区列表"
// @Router /ddz/roomSublevel/list [get]
func (api *DDZRoomSublevelApi) GetRoomSublevelList(c *gin.Context) {
        var req request.DDZRoomSublevelSearch
        if err := c.ShouldBindQuery(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        if req.PageSize == 0 {
                req.PageSize = 10
        }
        if req.Page == 0 {
                req.Page = 1
        }

        list, total, err := ddzRoomSublevelService.GetRoomSublevelList(req)
        if err != nil {
                global.GVA_LOG.Error("获取子分区列表失败!", zap.Error(err))
                response.FailWithMessage("获取子分区列表失败: "+err.Error(), c)
                return
        }

        response.OkWithDetailed(response.PageResult{
                List:     list,
                Total:    total,
                Page:     req.Page,
                PageSize: req.PageSize,
        }, "获取成功", c)
}

// GetRoomSublevelByID 根据ID获取子分区
// @Tags 斗地主-子分区管理
// @Summary 根据ID获取子分区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.DDZRoomSublevelByID true "子分区ID"
// @Success 200 {object} response.Response{data=ddz.DDZRoomSublevel,msg=string} "获取子分区详情"
// @Router /ddz/roomSublevel/detail [get]
func (api *DDZRoomSublevelApi) GetRoomSublevelByID(c *gin.Context) {
        var req request.DDZRoomSublevelByID
        if err := c.ShouldBindQuery(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        sublevel, err := ddzRoomSublevelService.GetRoomSublevelByID(req.ID)
        if err != nil {
                global.GVA_LOG.Error("获取子分区失败!", zap.Error(err))
                response.FailWithMessage("获取子分区失败: "+err.Error(), c)
                return
        }

        response.OkWithData(sublevel, c)
}

// CreateRoomSublevel 创建子分区
// @Tags 斗地主-子分区管理
// @Summary 创建子分区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.DDZRoomSublevelCreate true "创建子分区参数"
// @Success 200 {object} response.Response{msg=string} "创建子分区"
// @Router /ddz/roomSublevel/create [post]
func (api *DDZRoomSublevelApi) CreateRoomSublevel(c *gin.Context) {
        var req request.DDZRoomSublevelCreate
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err := ddzRoomSublevelService.CreateRoomSublevel(req)
        if err != nil {
                global.GVA_LOG.Error("创建子分区失败!", zap.Error(err))
                response.FailWithMessage("创建子分区失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("创建成功", c)
}

// UpdateRoomSublevel 更新子分区
// @Tags 斗地主-子分区管理
// @Summary 更新子分区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.DDZRoomSublevelUpdate true "更新子分区参数"
// @Success 200 {object} response.Response{msg=string} "更新子分区"
// @Router /ddz/roomSublevel/update [put]
func (api *DDZRoomSublevelApi) UpdateRoomSublevel(c *gin.Context) {
        var req request.DDZRoomSublevelUpdate
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err := ddzRoomSublevelService.UpdateRoomSublevel(req)
        if err != nil {
                global.GVA_LOG.Error("更新子分区失败!", zap.Error(err))
                response.FailWithMessage("更新子分区失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("更新成功", c)
}

// DeleteRoomSublevel 删除子分区
// @Tags 斗地主-子分区管理
// @Summary 删除子分区
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.DDZRoomSublevelByID true "子分区ID"
// @Success 200 {object} response.Response{msg=string} "删除子分区"
// @Router /ddz/roomSublevel/delete [delete]
func (api *DDZRoomSublevelApi) DeleteRoomSublevel(c *gin.Context) {
        var req request.DDZRoomSublevelByID
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err := ddzRoomSublevelService.DeleteRoomSublevel(req.ID)
        if err != nil {
                global.GVA_LOG.Error("删除子分区失败!", zap.Error(err))
                response.FailWithMessage("删除子分区失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("删除成功", c)
}

// BatchCreateDefaultSublevels 批量创建默认子分区
// @Tags 斗地主-子分区管理
// @Summary 批量创建默认子分区（10分场、50分场、200分场、500分场、1000分场）
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.DDZRoomSublevelByRoomConfig true "房间配置ID"
// @Success 200 {object} response.Response{msg=string} "批量创建默认子分区"
// @Router /ddz/roomSublevel/batchCreate [post]
func (api *DDZRoomSublevelApi) BatchCreateDefaultSublevels(c *gin.Context) {
        var req request.DDZRoomSublevelByRoomConfig
        if err := c.ShouldBindJSON(&req); err != nil {
                response.FailWithMessage(err.Error(), c)
                return
        }

        err := ddzRoomSublevelService.BatchCreateDefaultSublevels(req.RoomConfigID)
        if err != nil {
                global.GVA_LOG.Error("批量创建子分区失败!", zap.Error(err))
                response.FailWithMessage("批量创建子分区失败: "+err.Error(), c)
                return
        }

        response.OkWithMessage("批量创建成功", c)
}

// GetRoomSublevelsByRoomConfig 根据房间配置ID获取子分区列表
// @Tags 斗地主-子分区管理
// @Summary 根据房间配置ID获取子分区列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param roomConfigId query int true "房间配置ID"
// @Success 200 {object} response.Response{data=[]ddz.DDZRoomSublevel,msg=string} "获取子分区列表"
// @Router /ddz/roomSublevel/byRoom [get]
func (api *DDZRoomSublevelApi) GetRoomSublevelsByRoomConfig(c *gin.Context) {
        roomConfigIdStr := c.Query("roomConfigId")
        if roomConfigIdStr == "" {
                response.FailWithMessage("roomConfigId参数不能为空", c)
                return
        }

        roomConfigId, err := strconv.ParseUint(roomConfigIdStr, 10, 64)
        if err != nil {
                response.FailWithMessage("roomConfigId参数格式错误", c)
                return
        }

        sublevels, err := ddzRoomSublevelService.GetRoomSublevelsByRoomConfigID(uint(roomConfigId))
        if err != nil {
                global.GVA_LOG.Error("获取子分区列表失败!", zap.Error(err))
                response.FailWithMessage("获取子分区列表失败: "+err.Error(), c)
                return
        }

        response.OkWithData(sublevels, c)
}

// RefreshSublevelCache 刷新子分区缓存
// @Tags 斗地主-子分区管理
// @Summary 刷新子分区缓存
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param roomConfigId query int false "房间配置ID（不传则刷新所有）"
// @Success 200 {object} response.Response{msg=string} "刷新缓存成功"
// @Router /ddz/roomSublevel/refreshCache [post]
func (api *DDZRoomSublevelApi) RefreshSublevelCache(c *gin.Context) {
        roomConfigIdStr := c.Query("roomConfigId")

        if roomConfigIdStr != "" {
                roomConfigId, err := strconv.ParseUint(roomConfigIdStr, 10, 64)
                if err != nil {
                        response.FailWithMessage("roomConfigId参数格式错误", c)
                        return
                }

                err = ddzRoomSublevelService.RefreshRoomSublevelCache(uint(roomConfigId))
                if err != nil {
                        global.GVA_LOG.Error("刷新子分区缓存失败!", zap.Error(err))
                        response.FailWithMessage("刷新子分区缓存失败: "+err.Error(), c)
                        return
                }
        } else {
                // 刷新所有房间配置的子分区缓存
                allSublevels, err := ddzRoomSublevelService.GetAllSublevelsForAPI()
                if err != nil {
                        global.GVA_LOG.Error("获取所有子分区失败!", zap.Error(err))
                        response.FailWithMessage("刷新子分区缓存失败: "+err.Error(), c)
                        return
                }

                for roomConfigId := range allSublevels {
                        ddzRoomSublevelService.RefreshRoomSublevelCache(roomConfigId)
                }
        }

        response.OkWithMessage("刷新缓存成功", c)
}
