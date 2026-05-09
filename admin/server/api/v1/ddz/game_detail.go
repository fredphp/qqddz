package ddz

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
	"github.com/flipped-aurora/gin-vue-admin/server/service"
	"github.com/flipped-aurora/gin-vue-admin/server/utils"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DDZGameDetailApi struct{}

var ddzGameDetailService = service.ServiceGroupApp.DDZServiceGroup.DDZGameDetailService

// GetGamePlayerRecordList 获取游戏玩家记录列表
// @Tags     DDZ游戏玩家记录
// @Summary  获取游戏玩家记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGamePlayerRecordSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/gamePlayerRecord/list [post]
func (api *DDZGameDetailApi) GetGamePlayerRecordList(c *gin.Context) {
	var req ddzReq.DDZGamePlayerRecordSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = utils.Verify(req.PageInfo, utils.PageInfoVerify)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, total, err := ddzGameDetailService.GetGamePlayerRecordList(req)
	if err != nil {
		global.GVA_LOG.Error("获取游戏玩家记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取游戏玩家记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetGamePlayRecordList 获取出牌记录列表
// @Tags     DDZ出牌记录
// @Summary  获取出牌记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZGamePlayRecordSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/gamePlayRecord/list [post]
func (api *DDZGameDetailApi) GetGamePlayRecordList(c *gin.Context) {
	var req ddzReq.DDZGamePlayRecordSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = utils.Verify(req.PageInfo, utils.PageInfoVerify)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, total, err := ddzGameDetailService.GetGamePlayRecordList(req)
	if err != nil {
		global.GVA_LOG.Error("获取出牌记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取出牌记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}

// GetDealRecordList 获取发牌记录列表
// @Tags     DDZ发牌记录
// @Summary  获取发牌记录列表
// @Security ApiKeyAuth
// @accept   application/json
// @Produce  application/json
// @Param    data  body      ddzReq.DDZDealRecordSearch  true  "查询参数"
// @Success  200   {object}  response.Response{data=response.PageResult,msg=string}
// @Router   /ddz/dealRecord/list [post]
func (api *DDZGameDetailApi) GetDealRecordList(c *gin.Context) {
	var req ddzReq.DDZDealRecordSearch
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = utils.Verify(req.PageInfo, utils.PageInfoVerify)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	list, total, err := ddzGameDetailService.GetDealRecordList(req)
	if err != nil {
		global.GVA_LOG.Error("获取发牌记录列表失败!", zap.Error(err))
		response.FailWithMessage("获取发牌记录列表失败", c)
		return
	}

	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, "获取成功", c)
}
