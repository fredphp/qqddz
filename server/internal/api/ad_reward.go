package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/palemoky/fight-the-landlord/internal/game/database"
	"github.com/palemoky/fight-the-landlord/internal/protocol"
	"github.com/palemoky/fight-the-landlord/internal/protocol/codec"
	"gorm.io/gorm"
)

// Redis缓存键前缀（用于防重复领取锁）
const (
	RedisKeyAdRewardLockPrefix = "ddz:ad_reward_lock:"
)

// 奖励配置常量
const (
	RewardAmountBean      = 1000 // 欢乐豆奖励数量
	RewardAmountArenaCoin = 100  // 竞技币奖励数量
	LockExpireSeconds     = 60   // Redis锁过期时间（秒）
)

// AdRewardRequest 广告奖励请求
type AdRewardRequest struct {
	UID    uint64 `json:"uid"`    // 用户ID（必填，正整数）
	AdType string `json:"adType"` // 广告类型：bean 或 arena_coin
}

// AdRewardResponse 广告奖励响应
type AdRewardResponse struct {
	RewardAmount  int64  `json:"rewardAmount"`  // 奖励数量
	BalanceBefore int64  `json:"balanceBefore"` // 发放前余额
	BalanceAfter  int64  `json:"balanceAfter"`  // 发放后余额
	CurrencyType  string `json:"currencyType"`  // 货币类型：gold 或 arena_coin
}

// AdRewardHandler 广告奖励处理器
type AdRewardHandler struct {
	redis RedisClient // Redis客户端接口
}

// NewAdRewardHandler 创建广告奖励处理器
func NewAdRewardHandler() *AdRewardHandler {
	return &AdRewardHandler{}
}

// SetRedis 设置Redis客户端
func (h *AdRewardHandler) SetRedis(client RedisClient) {
	h.redis = client
}

// RewardResult 奖励发放结果
type RewardResult struct {
	Success        bool
	Error          error
	Code           int
	Message        string
	Response       *AdRewardResponse
	PlayerID       uint64
	GoldAfter      int64
	ArenaCoinAfter int64
}

// ClaimReward 领取广告奖励
// POST /api/ad/reward
func (h *AdRewardHandler) ClaimReward(w http.ResponseWriter, r *http.Request) {
	// 只允许 POST 方法
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
		return
	}

	// 解析请求体
	var req AdRewardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "无效的请求体: "+err.Error())
		return
	}

	// 参数验证
	if req.UID <= 0 {
		writeJSONError(w, http.StatusBadRequest, "uid必填且为正整数")
		return
	}

	if req.AdType != "bean" && req.AdType != "arena_coin" {
		writeJSONError(w, http.StatusBadRequest, "adType必须是 bean 或 arena_coin")
		return
	}

	// 检查数据库连接
	if !database.GetInstance().IsConnected() {
		writeJSONError(w, http.StatusInternalServerError, "数据库未连接")
		return
	}

	// 防重复：检查Redis锁
	lockKey := fmt.Sprintf("%s%d:%s", RedisKeyAdRewardLockPrefix, req.UID, req.AdType)
	if h.redis != nil {
		ctx := context.Background()
		// 尝试设置锁，如果已存在则说明正在处理或重复请求
		success, err := h.tryLock(ctx, lockKey)
		if err != nil {
			log.Printf("⚠️ Redis锁检查失败: %v", err)
			// Redis错误时不阻止请求，继续处理
		} else if !success {
			writeJSONError(w, http.StatusTooManyRequests, "请勿重复领取")
			return
		}
	}

	// 使用channel等待异步处理结果
	resultChan := make(chan RewardResult, 1)

	// 异步处理奖励发放
	go h.processRewardAsync(req, lockKey, resultChan)

	// 等待结果（带超时）
	select {
	case result := <-resultChan:
		if !result.Success {
			writeJSONError(w, result.Code, result.Message)
			return
		}

		// 发放成功后推送最新资产
		h.pushAssetUpdate(result)

		writeJSONSuccess(w, result.Response)

	case <-time.After(10 * time.Second):
		// 超时，释放锁
		h.releaseLock(context.Background(), lockKey)
		writeJSONError(w, http.StatusInternalServerError, "请求超时")
	}
}

// processRewardAsync 异步处理奖励发放
func (h *AdRewardHandler) processRewardAsync(req AdRewardRequest, lockKey string, resultChan chan<- RewardResult) {
	var result RewardResult
	defer func() {
		// 如果失败，释放锁
		if !result.Success && h.redis != nil {
			h.releaseLock(context.Background(), lockKey)
		}
		resultChan <- result
	}()

	// 查询玩家信息
	player, err := database.GetPlayerByID(req.UID)
	if err != nil {
		result.Success = false
		result.Code = http.StatusNotFound
		result.Message = "用户不存在"
		result.Error = err
		return
	}

	// 检查玩家状态
	if player.Status != database.PlayerStatusNormal {
		result.Success = false
		result.Code = http.StatusForbidden
		result.Message = "用户状态异常"
		return
	}

	// 确定奖励类型和数量
	var rewardAmount int64
	var currencyType string
	var balanceBefore int64

	if req.AdType == "bean" {
		rewardAmount = RewardAmountBean
		currencyType = "gold"
		balanceBefore = player.Gold
	} else {
		rewardAmount = RewardAmountArenaCoin
		currencyType = "arena_coin"
		balanceBefore = player.ArenaCoin
	}

	// 开启事务处理
	err = database.Transaction(func(tx *gorm.DB) error {
		// 更新玩家余额
		if req.AdType == "bean" {
			if err := tx.Model(&database.Player{}).
				Where("id = ?", req.UID).
				Update("gold", gorm.Expr("gold + ?", rewardAmount)).Error; err != nil {
				return err
			}
		} else {
			if err := tx.Model(&database.Player{}).
				Where("id = ?", req.UID).
				Update("arena_coin", gorm.Expr("arena_coin + ?", rewardAmount)).Error; err != nil {
				return err
			}
		}

		// 记录流水
		if req.AdType == "bean" {
			// 记录金币流水（gold_logs表）
			goldLog := &database.GoldLog{
				PlayerID:     req.UID,
				ChangeAmount: rewardAmount,
				BalanceAfter: balanceBefore + rewardAmount,
				ChangeType:   database.GoldChangeTypeAdReward,
				Remark:       "广告奖励-欢乐豆",
			}
			if err := tx.Create(goldLog).Error; err != nil {
				log.Printf("⚠️ 记录金币流水失败: %v", err)
				// 流水记录失败不影响主流程
			}
		} else {
			// 记录竞技币流水
			arenaCoinLog := &database.ArenaCoinLog{
				PlayerID:     req.UID,
				ChangeAmount: rewardAmount,
				BalanceAfter: balanceBefore + rewardAmount,
				ChangeType:   database.ArenaCoinChangeGift,
				Remark:       "广告奖励-竞技币",
			}
			if err := tx.Create(arenaCoinLog).Error; err != nil {
				log.Printf("⚠️ 记录竞技币流水失败: %v", err)
				// 流水记录失败不影响主流程
			}
		}

		// 记录广告奖励日志
		adRewardLog := &database.AdRewardLog{
			PlayerID:     req.UID,
			AdType:       req.AdType,
			RewardAmount: rewardAmount,
			CurrencyType: currencyType,
		}
		if err := tx.Create(adRewardLog).Error; err != nil {
			log.Printf("⚠️ 记录广告奖励日志失败: %v", err)
			// 日志记录失败不影响主流程
		}

		return nil
	})

	if err != nil {
		result.Success = false
		result.Code = http.StatusInternalServerError
		result.Message = "系统错误"
		result.Error = err
		return
	}

	// 成功
	result.Success = true
	result.Code = 0
	result.Message = "success"
	result.PlayerID = req.UID
	result.Response = &AdRewardResponse{
		RewardAmount:  rewardAmount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  balanceBefore + rewardAmount,
		CurrencyType:  currencyType,
	}

	// 设置更新后的余额（用于推送）
	if req.AdType == "bean" {
		result.GoldAfter = balanceBefore + rewardAmount
		result.ArenaCoinAfter = player.ArenaCoin
	} else {
		result.GoldAfter = player.Gold
		result.ArenaCoinAfter = balanceBefore + rewardAmount
	}

	log.Printf("✅ 玩家 %d 成功领取广告奖励: %s +%d", req.UID, req.AdType, rewardAmount)
}

// tryLock 尝试获取Redis锁
func (h *AdRewardHandler) tryLock(ctx context.Context, key string) (bool, error) {
	if h.redis == nil {
		return true, nil
	}

	// 使用 Set 实现 NX（不存在才设置）
	// 由于 RedisClient 接口只有 Set 方法，我们需要通过 Get 先检查
	val, err := h.redis.Get(ctx, key)
	if err == nil && val != "" {
		// 锁已存在
		return false, nil
	}

	// 设置锁
	if err := h.redis.Set(ctx, key, "1", time.Duration(LockExpireSeconds)*time.Second); err != nil {
		return false, err
	}

	return true, nil
}

// releaseLock 释放Redis锁
func (h *AdRewardHandler) releaseLock(ctx context.Context, key string) {
	if h.redis == nil {
		return
	}
	h.redis.Del(ctx, key)
}

// pushAssetUpdate 推送资产更新
func (h *AdRewardHandler) pushAssetUpdate(result RewardResult) {
	if !result.Success {
		return
	}

	// 获取WebSocket服务器实例
	wsServer := GetWSServer()
	if wsServer == nil {
		log.Printf("⚠️ WebSocket服务器未初始化，无法推送资产更新")
		return
	}

	// 根据玩家ID获取客户端连接
	playerIDStr := fmt.Sprintf("%d", result.PlayerID)
	client := wsServer.GetClientByPlayerID(playerIDStr)
	if client == nil {
		log.Printf("⚠️ 玩家 %d 不在线，无法推送资产更新", result.PlayerID)
		return
	}

	// 构造资产更新消息
	assetPayload := &protocol.AssetUpdatePayload{
		Gold:       result.GoldAfter,
		ArenaCoin:  result.ArenaCoinAfter,
		UpdateType: "ad_reward",
		Timestamp:  time.Now().UnixMilli(),
	}

	// 发送消息
	msg, err := codec.NewMessage(protocol.MsgAssetUpdate, assetPayload)
	if err != nil {
		log.Printf("⚠️ 创建资产更新消息失败: %v", err)
		return
	}

	client.SendMessage(msg)
	log.Printf("✅ 已推送资产更新给玩家 %d: 金币=%d, 竞技币=%d", result.PlayerID, result.GoldAfter, result.ArenaCoinAfter)
}
